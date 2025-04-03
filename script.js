import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- Configuration ---
const CONFIG = {
    REDIRECT_URL: 'https://tobin-data-portfolio.netlify.app/',
    REDIRECT_DELAY_SECONDS: 10, // Changed from 7 to 10 seconds
    REDUCED_MOTION: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    // 3D Settings
    ENABLE_BLOOM: true, // Set to false to disable bloom effect
    BLOOM_STRENGTH: 0.4, // Lowered strength for subtlety
    BLOOM_RADIUS: 0.3,
    BLOOM_THRESHOLD: 0.85, // Only blooms brighter areas
    MAIN_SHAPE_ROTATION_SPEED: 0.1,
    MAIN_SHAPE_PULSE_FREQ: 1.0,
    PARTICLE_COUNT: 500,
    PARTICLE_SPEED_MULTIPLIER: 0.02,
    CAMERA_Z: 5,
    // Performance
    RESIZE_DEBOUNCE_MS: 150,
    COPY_SUCCESS_DELAY_MS: 2000,
    REDIRECT_FADE_MS: 500,
};

// --- Global Variables ---
let countdownInterval;
let redirectCancelled = false;
let autoRedirectTimeout;
let resizeTimeout; // For debouncing
let animationFrameId; // To store requestAnimationFrame ID

// --- DOM Elements ---
let countdownEl, countdownCircle, countdownProgress, cancelButton, copyButton, copyToast, errorContainer, redirectButton, onlineContent, offlineNotice, retryButton, countdownTextEl, copyIconDefault, copyIconSuccess, manualRedirectButton;

// --- Three.js Variables ---
let scene, camera, renderer, mainMesh, particlesMesh, clock, ambientLight, pointLight, directionalLight;
let composer, bloomPass; // For post-processing
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Reduced Motion:", CONFIG.REDUCED_MOTION);
    assignDOMElements();
    addRippleEffectStyle();
    setupEventListeners();
    handleConnectionChange();

    if (!CONFIG.REDUCED_MOTION) {
        try {
            initThreeJS(); // Initialize Three.js Scene
            startAnimationLoop(); // Start the animation loop
        } catch (error) {
            console.error("Failed to initialize 3D background:", error);
            const canvas = document.getElementById('bg-canvas');
            if (canvas) canvas.style.display = 'none';
        }
    } else {
        const canvas = document.getElementById('bg-canvas');
        if (canvas) canvas.style.display = 'none';
        console.log("Reduced motion preferred. Skipping 3D animation.");
    }

    setupPerformanceMonitoring();
});

// --- DOM Element Assignment ---
function assignDOMElements() {
    countdownEl = document.getElementById('countdown');
    countdownCircle = document.querySelector('.countdown-circle');
    countdownProgress = document.querySelector('.countdown-progress');
    cancelButton = document.getElementById('cancel-redirect');
    copyButton = document.querySelector('.copy-btn');
    copyToast = document.getElementById('copy-toast');
    errorContainer = document.getElementById('error-container');
    redirectButton = document.querySelector('.button:not(.button-offline)'); // Main redirect button (now identified also as manualRedirectButton)
    manualRedirectButton = document.getElementById('manual-redirect-button');
    onlineContent = document.getElementById('online-content');
    offlineNotice = document.getElementById('offline-notice');
    retryButton = document.getElementById('retry-button');
    countdownTextEl = document.getElementById('countdown-text');
    copyIconDefault = document.getElementById('copy-icon-default');
    copyIconSuccess = document.getElementById('copy-icon-success');
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    console.log("Setting up event listeners");
    if (cancelButton) cancelButton.addEventListener('click', cancelRedirect);
    if (copyButton) copyButton.addEventListener('click', handleCopyUrl);
    if (redirectButton) {
        redirectButton.addEventListener('click', (e) => {
            cancelRedirect();
            addRippleEffect(e.currentTarget, e);
            // Allow default link behavior
        });
    }
    if (retryButton) {
        retryButton.addEventListener('click', (e) => {
            e.currentTarget.classList.add('active');
            addRippleEffect(e.currentTarget, e);
            setTimeout(() => e.currentTarget.classList.remove('active'), 300);
            setTimeout(() => window.location.reload(), 350);
        });
    }

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', (event) => handleGlobalError({ error: event.reason }));
    window.addEventListener('resize', handleResize); // Debounced resize
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Mouse/Touch Move for 3D Interaction (only if not reduced motion)
    if (!CONFIG.REDUCED_MOTION) {
        document.addEventListener('mousemove', onDocumentMouseMove);
        document.addEventListener('touchmove', onDocumentTouchMove, { passive: false });
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);
}

// --- Debounced Resize Handler ---
function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        onWindowResize();
    }, CONFIG.RESIZE_DEBOUNCE_MS);
}

// --- Keyboard Handler ---
function handleKeyDown(event) {
    if (event.key === 'Escape' && !redirectCancelled && navigator.onLine && onlineContent && !onlineContent.hidden) {
        cancelRedirect();
    }
}

// --- Network Status Handling ---
function handleConnectionChange() {
    const isOnline = navigator.onLine;
    console.log("Connection status changed:", isOnline ? "Online" : "Offline");
    if (isOnline) {
        showOnlineContent();
        if (!redirectCancelled) startCountdown();
        if (animationFrameId === undefined && !CONFIG.REDUCED_MOTION) resumeAnimation();
    } else {
        showOfflineContent();
        stopCountdown();
        pauseAnimation();
    }
}

function showOnlineContent() {
    if (offlineNotice) offlineNotice.hidden = true;
    if (onlineContent) onlineContent.hidden = false;
    if (redirectCancelled && cancelButton) cancelButton.style.display = 'none';
    if (manualRedirectButton) manualRedirectButton.classList.remove('highlight-manual'); // Ensure highlight is off initially
}

function showOfflineContent() {
    if (onlineContent) onlineContent.hidden = true;
    if (offlineNotice) offlineNotice.hidden = false;
    // Optional: focus the retry button when offline notice appears
    // if (retryButton) retryButton.focus();
}

// --- Countdown Logic ---
function startCountdown() {
    if (redirectCancelled || !navigator.onLine) {
        console.log("Cannot start countdown - redirect cancelled or offline");
        return;
    }
    
    // Clean up any existing countdown
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    console.log("Starting 10-second countdown");
    let secondsLeft = CONFIG.REDIRECT_DELAY_SECONDS;
    
    // Circle properties - using a fixed value for simplicity and reliability
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    
    // Reset and initialize the UI elements
    if (countdownEl) countdownEl.textContent = secondsLeft;
    if (countdownCircle) countdownCircle.classList.remove('countdown-ending');
    if (cancelButton) cancelButton.style.display = 'inline-block';
    
    // Set initial visual state of progress circle (empty)
    if (countdownProgress) {
        countdownProgress.setAttribute('stroke-dasharray', circumference);
        countdownProgress.setAttribute('stroke-dashoffset', circumference);
    }
    
    // Set initial text
    updateCountdownText(secondsLeft);
    
    // Initial update for the visuals - start at full time
    updateCountdownVisual(secondsLeft);
    
    // Start the countdown
    countdownInterval = setInterval(() => {
        secondsLeft -= 1;
        console.log(`Countdown: ${secondsLeft}s remaining`);
        
        // Exit if cancelled during this interval
        if (redirectCancelled) {
            stopCountdown();
            return;
        }
        
        // Update all visual elements for the current time
        updateCountdownVisual(secondsLeft);
        
        // Redirect when time's up
        if (secondsLeft < 0) {
            stopCountdown();
            triggerRedirect();
        }
    }, 1000);
    
    // Store for cleanup
    autoRedirectTimeout = countdownInterval;
}

// New simplified function to update all countdown visuals
function updateCountdownVisual(secondsLeft) {
    // Update the number display
    if (countdownEl && secondsLeft >= 0) {
        countdownEl.textContent = secondsLeft;
    }
    
    // Update the text description
    updateCountdownText(secondsLeft);
    
    // Update the circle progress
    if (countdownProgress && secondsLeft >= 0) {
        const radius = 54;
        const circumference = 2 * Math.PI * radius;
        const progress = secondsLeft / CONFIG.REDIRECT_DELAY_SECONDS;
        const dashOffset = circumference * (1 - progress);
        
        // Direct attribute setting rather than style for better SVG support
        countdownProgress.setAttribute('stroke-dashoffset', dashOffset);
    }
    
    // Add warning styles for last 3 seconds
    if (countdownCircle) {
        if (secondsLeft <= 3 && !countdownCircle.classList.contains('countdown-ending')) {
            countdownCircle.classList.add('countdown-ending');
        }
    }
    
    // Update 3D animation if enabled
    if (!CONFIG.REDUCED_MOTION && scene && secondsLeft >= 0) {
        // Progress increases as time decreases (0 to 1)
        const progress = 1 - (secondsLeft / CONFIG.REDIRECT_DELAY_SECONDS);
        updateAnimationForCountdown(progress);
    }
}

function stopCountdown() {
    if (countdownInterval) {
        console.log("Stopping countdown interval");
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    // Reset animation if we stopped early
    if (!CONFIG.REDUCED_MOTION && scene) {
        updateAnimationForCountdown(0);
    }
}

function updateCountdownText(seconds) {
     if (countdownTextEl) {
        if (redirectCancelled) {
            countdownTextEl.textContent = 'Redirect cancelled. Use the button below.';
        } else if (seconds >= 0) {
             const srSpan = `<span class="sr-only">${seconds}</span>`;
             countdownTextEl.innerHTML = `Redirecting you in ${srSpan} ${seconds} seconds...`;
        }
    }
}

function cancelRedirect() {
    if (redirectCancelled) return;
    console.log("Redirect cancelled by user");
    redirectCancelled = true;
    stopCountdown();

    // Update UI
    if (countdownCircle) {
        countdownCircle.classList.remove('countdown-ending');
        if (countdownProgress) {
            // Freeze progress visually
            const currentOffset = getComputedStyle(countdownProgress).strokeDashoffset;
            countdownProgress.style.transition = 'none'; // Stop animation
            countdownProgress.style.strokeDashoffset = currentOffset;
        }
        if (countdownEl) {
            // Change to checkmark immediately without scaling animation
            countdownEl.textContent = '✓';
            countdownEl.style.transform = 'none'; // Remove any scaling
        }
    }
    updateCountdownText(-1); // Update text to show cancelled state
    if (cancelButton) cancelButton.style.display = 'none';

    // Highlight the manual redirect button
    if(manualRedirectButton) {
        manualRedirectButton.classList.add('highlight-manual');
        // Remove class after animation finishes (1.5s * 2 iterations = 3s)
        setTimeout(() => {
            if(manualRedirectButton) manualRedirectButton.classList.remove('highlight-manual');
        }, 3000);
         manualRedirectButton.focus({ preventScroll: true }); // Focus the button
    }
}

function triggerRedirect() {
    if (redirectCancelled || !navigator.onLine) {
        console.log("Redirect aborted (cancelled or offline).");
        return;
    }
    console.log("Triggering redirect to:", CONFIG.REDIRECT_URL);

    document.body.style.transition = `opacity ${CONFIG.REDIRECT_FADE_MS / 1000}s ease-out`;
    document.body.style.opacity = '0';

    pauseAnimation(); // Pause animation just before redirecting

    setTimeout(() => {
        window.location.href = CONFIG.REDIRECT_URL;
    }, CONFIG.REDIRECT_FADE_MS); // Wait for fade out
}

// --- UI Helpers ---

function handleCopyUrl() {
    if (!copyButton) return;
    const urlToCopy = CONFIG.REDIRECT_URL;

    copyButton.classList.add('copied');
    if (copyIconDefault) copyIconDefault.style.display = 'none';
    if (copyIconSuccess) copyIconSuccess.style.display = 'inline-block';

    const resetVisuals = () => {
         setTimeout(() => {
            if (copyButton) copyButton.classList.remove('copied');
            if (copyIconDefault) copyIconDefault.style.display = 'inline-block';
            if (copyIconSuccess) copyIconSuccess.style.display = 'none';
        }, CONFIG.COPY_SUCCESS_DELAY_MS);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(urlToCopy)
            .then(() => { showCopyToast(); })
            .catch(err => {
                console.error('Clipboard API copy failed: ', err);
                fallbackCopy(urlToCopy);
            })
            .finally(resetVisuals);
    } else {
        console.log("Using fallback copy method");
        fallbackCopy(urlToCopy);
        resetVisuals(); // Reset visuals even for fallback
    }
}

function fallbackCopy(text) {
    // Fallback logic remains the same...
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed'; textArea.style.left = '-9999px'; textArea.style.top = '0';
    document.body.appendChild(textArea);
    textArea.focus(); textArea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) showCopyToast();
        else showCopyToast("Failed to copy", true);
    } catch (err) {
        console.error('Fallback copy error', err);
        showCopyToast("Error copying", true);
    }
    document.body.removeChild(textArea);
}

function showCopyToast(message = "URL copied to clipboard!", isError = false) {
     // Toast logic remains largely the same...
     if (copyToast) {
        copyToast.textContent = message;
        copyToast.hidden = false;
        copyToast.style.backgroundColor = isError ? 'var(--offline-notice-bg-color)' : 'var(--card-bg-color)';
        copyToast.style.color = isError ? 'var(--offline-accent-color)' : 'var(--text-color)';
        copyToast.style.animation = 'none';
        void copyToast.offsetWidth;
        copyToast.style.animation = `toast-in-out ${CONFIG.COPY_SUCCESS_DELAY_MS / 1000 + 0.5}s var(--transition-bezier) forwards`; // Adjust duration

        if (copyToast.timer) clearTimeout(copyToast.timer);
        copyToast.timer = setTimeout(() => {
            copyToast.hidden = true;
            copyToast.timer = null;
        }, CONFIG.COPY_SUCCESS_DELAY_MS + 500); // Match animation
    }
}

function addRippleEffectStyle() {
    console.log("Ripple effect styles assumed loaded from CSS.");
}

function addRippleEffect(button, event) {
    // Ripple logic remains the same...
    if (!button || !event) return;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left; const y = event.clientY - rect.top;
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x - size / 2}px`; ripple.style.top = `${y - size / 2}px`;
    ripple.classList.add('ripple');
    button.style.position = 'relative'; button.style.overflow = 'hidden';
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
}

// --- Error Handling ---
function handleGlobalError(event) {
    const error = event.error || event.reason || event;
    console.error('Unhandled Page Error:', error);
    stopCountdown();
    pauseAnimation(); // Stop animation on error too

    if (errorContainer && errorContainer.hidden) { // Show only once
        errorContainer.hidden = false;
        errorContainer.innerHTML = `
            <p>Oops! Something went wrong. The automatic redirect was stopped.</p>
            <button id="error-manual-redirect" class="button button-offline">
                Try Visiting Manually
            </button>
        `;
        const errorButton = document.getElementById('error-manual-redirect');
        if(errorButton){
            errorButton.onclick = (e) => {
                addRippleEffect(e.currentTarget, e);
                setTimeout(()=> window.location.href = CONFIG.REDIRECT_URL, 100);
            };
        }
    }
}

// --- Performance Monitoring ---
function setupPerformanceMonitoring() {
    window.performance.mark('script-end');
    try {
        window.performance.measure('script-execution', 'script-start', 'script-end');
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (['first-paint', 'first-contentful-paint', 'largest-contentful-paint'].includes(entry.name)) {
                        console.log(`Performance - ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
                    }
                    if(entry.entryType === 'measure' && entry.name === 'script-execution') {
                        console.log(`Performance - Script Execution Time: ${entry.duration.toFixed(2)}ms`);
                    }
                });
            });
            observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'measure'] });
        }
    } catch (e) {
        console.warn("Performance monitoring setup failed:", e);
    }
}

// --- Background Animation (Three.js) ---

function getAccentColor() {
    const computedStyle = getComputedStyle(document.body);
    return computedStyle.getPropertyValue('--accent-color').trim() || '#3498db'; // Fallback
}

// Initialize Scene, Camera, Renderer, Lights, Objects
function initThreeJS() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') throw new Error("Canvas or THREE missing");

    console.log("Initializing Three.js");

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = CONFIG.CAMERA_Z;

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas, alpha: true, antialias: true,
        powerPreference: 'high-performance', precision: 'mediump'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // renderer.outputEncoding = THREE.sRGBEncoding; // Needed for accurate color with post-processing

    // Lighting
    ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Slightly brighter ambient
    scene.add(ambientLight);
    pointLight = new THREE.PointLight(0xffffff, 1.2, 100); // Brighter point light
    pointLight.position.set(5, 8, 5);
    scene.add(pointLight);
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(-5, 3, -5);
    scene.add(directionalLight);

    // Colors
    const accentColor = getAccentColor();
    const accentColorThree = new THREE.Color(accentColor);

    // Main Shape (Icosahedron)
    const geometry = new THREE.IcosahedronGeometry(1.6, 1);
    const material = new THREE.MeshPhysicalMaterial({
        color: accentColorThree, metalness: 0.3, roughness: 0.4,
        reflectivity: 0.6, clearcoat: 0.5, clearcoatRoughness: 0.1,
        // emissive: accentColorThree, // Make it emit light slightly for bloom
        // emissiveIntensity: 0.1,
    });
    mainMesh = new THREE.Mesh(geometry, material);
    mainMesh.userData.baseRotationSpeed = CONFIG.MAIN_SHAPE_ROTATION_SPEED;
    mainMesh.userData.basePulseFreq = CONFIG.MAIN_SHAPE_PULSE_FREQ;
    scene.add(mainMesh);

    // Particle System
    createParticles(accentColorThree);

    // Post-processing (Bloom)
    if (CONFIG.ENABLE_BLOOM && !CONFIG.REDUCED_MOTION) {
        setupPostProcessing();
    }

    // Animation Clock
    clock = new THREE.Clock();
}

// Create Particle System
function createParticles(baseColor) {
    const particlesCount = CONFIG.PARTICLE_COUNT;
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);
    const particleColor = new THREE.Color();

    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        posArray[i3] = (Math.random() - 0.5) * 25;
        posArray[i3 + 1] = (Math.random() - 0.5) * 25;
        posArray[i3 + 2] = (Math.random() - 0.5) * 25;
        particleColor.copy(baseColor).offsetHSL((Math.random() - 0.5) * 0.1, 0, (Math.random() - 0.5) * 0.3);
        colorsArray[i3] = particleColor.r; colorsArray[i3 + 1] = particleColor.g; colorsArray[i3 + 2] = particleColor.b;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.04, // Slightly larger base size
        vertexColors: true, transparent: true, opacity: 0.7,
        blending: THREE.AdditiveBlending, sizeAttenuation: true, depthWrite: false
    });
    particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    particlesMesh.userData.baseSpeedMultiplier = CONFIG.PARTICLE_SPEED_MULTIPLIER;
    scene.add(particlesMesh);
}

// Setup Post-Processing Effects
function setupPostProcessing() {
    console.log("Setting up post-processing (Bloom)");
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        CONFIG.BLOOM_STRENGTH,
        CONFIG.BLOOM_RADIUS,
        CONFIG.BLOOM_THRESHOLD
    );
    composer.addPass(bloomPass);
}

// Update animation based on countdown progress (0 to 1)
function updateAnimationForCountdown(progress) {
    if (!scene) return;

    const multiplier = 1 + progress * 1.5; // Scale up effect towards the end

    if (mainMesh) {
        mainMesh.userData.rotationSpeed = mainMesh.userData.baseRotationSpeed * multiplier;
        mainMesh.userData.pulseFreq = mainMesh.userData.basePulseFreq * multiplier;
    }
    if (particlesMesh) {
        particlesMesh.userData.speedMultiplier = particlesMesh.userData.baseSpeedMultiplier * multiplier;
    }
     // Also slightly pulse the point light intensity
     if (pointLight) {
         pointLight.intensity = 1.2 + progress * 0.8; // Increase intensity towards end
     }
}

// --- Animation Loop ---
function startAnimationLoop() {
    if (animationFrameId || CONFIG.REDUCED_MOTION || !scene) return; // Already running or should not run
    console.log("Starting animation loop");
    animate();
}

function animate() {
    if (!scene || !clock) return; // Exit if scene/clock not ready

    animationFrameId = requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Update Mouse Interaction Targets
    targetX = mouseX * 0.00005; // Much more subtle scene rotation based on mouse
    targetY = mouseY * 0.00005;

    // Apply smooth scene rotation
    if(scene) {
        scene.rotation.y += (targetX - scene.rotation.y) * 0.05;
        scene.rotation.x += (targetY - scene.rotation.x) * 0.05;
    }


    // Main Mesh Animation
    if (mainMesh) {
        const rotSpeed = mainMesh.userData.rotationSpeed || mainMesh.userData.baseRotationSpeed;
        const pulseFreq = mainMesh.userData.pulseFreq || mainMesh.userData.basePulseFreq;
        mainMesh.rotation.y = rotSpeed * elapsedTime * 2;
        mainMesh.rotation.x = rotSpeed * elapsedTime;
        const pulseScale = 1 + Math.sin(elapsedTime * pulseFreq * Math.PI * 2) * 0.03;
        mainMesh.scale.setScalar(pulseScale);
         // Make light pulse with mesh scale
         if (pointLight) pointLight.intensity = 1.2 + (pulseScale - 1) * 10; // Amplify pulse effect on light
    }

    // Particle Animation
    if (particlesMesh) {
        const speedMult = particlesMesh.userData.speedMultiplier || particlesMesh.userData.baseSpeedMultiplier;
        particlesMesh.rotation.y = -speedMult * elapsedTime * 0.5; // Slower base rotation
        particlesMesh.rotation.x = speedMult * elapsedTime * 0.2; // Add x rotation drift

        // Subtle particle wave (keep minimal for performance)
        const positions = particlesMesh.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] += Math.sin(elapsedTime * 0.4 + positions[i - 1] * 0.1) * 0.0015 * (1 + speedMult / 0.02);
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;
    }

    // Render scene
    if (composer && CONFIG.ENABLE_BLOOM && !CONFIG.REDUCED_MOTION) {
        composer.render(); // Use EffectComposer if enabled
    } else if (renderer) {
        renderer.render(scene, camera); // Otherwise, use standard renderer
    }
}

function pauseAnimation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = undefined;
        if (clock) clock.stop();
        console.log("3D Animation Paused");
    }
}

function resumeAnimation() {
    if (!animationFrameId && !CONFIG.REDUCED_MOTION && clock && scene) {
        clock.start();
        startAnimationLoop(); // Restart the loop via the dedicated function
        console.log("3D Animation Resumed");
    }
}

// --- 3D Specific Handlers ---
function onWindowResize() {
    if (!camera || !renderer) return;
    console.log("Window resized");
    const width = window.innerWidth;
    const height = window.innerHeight;

    windowHalfX = width / 2;
    windowHalfY = height / 2;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    if (composer) { // Resize composer and passes
        composer.setSize(width, height);
        if (bloomPass) {
            bloomPass.setSize(width, height);
        }
    }
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
}

function onDocumentTouchMove(event) {
    if (event.touches.length === 1) {
        event.preventDefault(); // Prevent scrolling while interacting with 3D
        const touch = event.touches[0];
        mouseX = (touch.pageX - windowHalfX) * 0.7; // Reduce sensitivity for touch
        mouseY = (touch.pageY - windowHalfY) * 0.7;
    }
}

function handleVisibilityChange() {
    if (!CONFIG.REDUCED_MOTION && scene) { // Only act if animation is running
        if (document.hidden) {
            pauseAnimation();
        } else {
            resumeAnimation();
        }
    }
}

// --- Cleanup ---
function cleanup() {
    console.log("Cleaning up resources...");
    // Stop animation loop
    pauseAnimation();

    // Remove event listeners
    window.removeEventListener('online', handleConnectionChange);
    window.removeEventListener('offline', handleConnectionChange);
    window.removeEventListener('error', handleGlobalError);
    window.removeEventListener('unhandledrejection', (event) => handleGlobalError({ error: event.reason }));
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('mousemove', onDocumentMouseMove);
    document.removeEventListener('touchmove', onDocumentTouchMove);
    document.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('beforeunload', cleanup);
    // Any other listeners added dynamically should be removed here

    // Dispose Three.js objects (basic example)
    if (scene) {
        scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                 // If material is an array, iterate
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }
    if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss(); // Aggressively release WebGL context
        renderer = null; // Help GC
    }
    if (composer) {
        // Composer doesn't have a direct dispose, rely on renderer disposal
        composer = null;
    }

    // Clear timeouts/intervals
    stopCountdown(); // Ensure countdown is stopped
    clearTimeout(autoRedirectTimeout);
    clearTimeout(resizeTimeout);

    console.log("Cleanup complete.");
}

// --- End Script ---