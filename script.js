import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// Optional: Add other passes like FilmPass or AfterimagePass if desired
// import { FilmPass } from 'three/addons/postprocessing/FilmPass.js';

// --- Configuration ---
const CONFIG = {
    REDIRECT_URL: 'https://tobin-data-portfolio.netlify.app/',
    REDIRECT_DELAY_SECONDS: 10, // Increased delay for visual effect
    REDUCED_MOTION: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    // 3D Settings (Tuned for new visual style)
    ENABLE_BLOOM: true,
    BLOOM_STRENGTH: 0.6, // Slightly stronger bloom
    BLOOM_RADIUS: 0.5,
    BLOOM_THRESHOLD: 0.75, // Bloom slightly less bright areas too
    MAIN_SHAPE_ROTATION_SPEED: 0.08, // Slower base rotation
    MAIN_SHAPE_PULSE_FREQ: 0.5, // Slower, more deliberate pulse
    MAIN_SHAPE_PULSE_AMP: 0.05, // Pulse amplitude
    PARTICLE_COUNT: 800, // More particles
    PARTICLE_SPEED_MULTIPLIER: 0.03,
    PARTICLE_SPREAD: 30, // How far particles spread out
    CAMERA_Z: 6, // Slightly further back
    CAMERA_ORBIT_RADIUS: 0.2, // Subtle camera orbit
    CAMERA_ORBIT_SPEED: 0.1,
    MOUSE_INFLUENCE_FACTOR: 0.00008, // Mouse influence on camera angle
    // Performance & Timing
    RESIZE_DEBOUNCE_MS: 150,
    COPY_SUCCESS_DELAY_MS: 2000,
    REDIRECT_FADE_MS: 600, // Slightly longer fade for effect
    PARTICLE_UPDATE_INTERVAL: 2, // Update particles every N frames
};

// --- Global Variables ---
let countdownInterval;
let redirectCancelled = false;
let autoRedirectTimeout;
let resizeTimeout;
let animationFrameId;
let frameCount = 0; // For particle update throttling

// --- DOM Elements ---
let countdownEl, countdownCircle, countdownProgress, cancelButton, copyButton, copyToast, errorContainer, onlineContent, offlineNotice, retryButton, countdownTextEl, copyIconDefault, copyIconSuccess, manualRedirectButton, canvas;

// --- Three.js Variables ---
let scene, camera, renderer, mainMesh, particlesMesh, clock, ambientLight, pointLight, directionalLight;
let composer, bloomPass;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let baseAccentColor = new THREE.Color(); // Store the initial accent color

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Reduced Motion:", CONFIG.REDUCED_MOTION);
    assignDOMElements();
    // addRippleEffectStyle(); // Ripple styles are now in CSS
    setupEventListeners();
    handleConnectionChange(); // Initial check

    if (!CONFIG.REDUCED_MOTION) {
        try {
            initThreeJS();
            startAnimationLoop();
        } catch (error) {
            console.error("Failed to initialize 3D background:", error);
            if (canvas) canvas.style.display = 'none'; // Hide canvas on error
            document.body.classList.add('no-3d'); // Add class to body for fallback styles if needed
        }
    } else {
        if (canvas) canvas.style.display = 'none'; // Hide canvas if reduced motion
        document.body.classList.add('reduced-motion'); // Add class for reduced motion styles
        console.log("Reduced motion preferred. Skipping 3D animation.");
    }

    setupPerformanceMonitoring();
});

// --- DOM Element Assignment ---
function assignDOMElements() {
    canvas = document.getElementById('bg-canvas');
    countdownEl = document.getElementById('countdown');
    countdownCircle = document.querySelector('.countdown-circle');
    countdownProgress = document.querySelector('.countdown-progress');
    cancelButton = document.getElementById('cancel-redirect');
    copyButton = document.querySelector('.copy-btn');
    copyToast = document.getElementById('copy-toast');
    errorContainer = document.getElementById('error-container');
    manualRedirectButton = document.getElementById('manual-redirect-button'); // Primary online button
    onlineContent = document.getElementById('online-content');
    offlineNotice = document.getElementById('offline-notice');
    retryButton = document.getElementById('retry-button');
    countdownTextEl = document.getElementById('countdown-text');
    copyIconDefault = document.getElementById('copy-icon-default');
    copyIconSuccess = document.getElementById('copy-icon-success');
    // Note: `redirectButton` is now `manualRedirectButton` for clarity
}


// --- Event Listeners Setup ---
function setupEventListeners() {
    console.log("Setting up event listeners");
    if (cancelButton) cancelButton.addEventListener('click', cancelRedirect);
    if (copyButton) copyButton.addEventListener('click', (e) => handleCopyUrl(e.currentTarget)); // Pass button for ripple
    if (manualRedirectButton) {
        manualRedirectButton.addEventListener('click', (e) => {
            // cancelRedirect(); // Don't necessarily cancel if they click manual
            addRippleEffect(e.currentTarget, e);
            // Allow default link behavior to navigate
            // Optionally: trigger redirect immediately for consistency
            // triggerRedirect(true); // Force immediate redirect
        });
    }
    if (retryButton) {
        retryButton.addEventListener('click', (e) => {
            e.currentTarget.classList.add('active'); // For potential styling
            addRippleEffect(e.currentTarget, e);
            // Short delay to see ripple before reload
            setTimeout(() => window.location.reload(), 350);
        });
    }

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', (event) => handleGlobalError({ error: event.reason }));
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (!CONFIG.REDUCED_MOTION) {
        document.addEventListener('mousemove', onDocumentMouseMove);
        document.addEventListener('touchmove', onDocumentTouchMove, { passive: true }); // Use passive for touch scroll performance
    }

    window.addEventListener('beforeunload', cleanup);
}

// --- Debounced Resize Handler ---
function handleResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(onWindowResize, CONFIG.RESIZE_DEBOUNCE_MS);
}

// --- Keyboard Handler ---
function handleKeyDown(event) {
    if (event.key === 'Escape' && !redirectCancelled && navigator.onLine && onlineContent && !onlineContent.hidden) {
        cancelRedirect();
        // Optionally focus the cancel button or manual redirect button after Esc
        if (manualRedirectButton) manualRedirectButton.focus();
    }
}

// --- Network Status Handling ---
function handleConnectionChange() {
    const isOnline = navigator.onLine;
    console.log("Connection status changed:", isOnline ? "Online" : "Offline");
    document.body.classList.toggle('is-offline', !isOnline); // Class for potential CSS hooks

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
    if (manualRedirectButton) manualRedirectButton.classList.remove('highlight-manual');
}

function showOfflineContent() {
    if (onlineContent) onlineContent.hidden = true;
    if (offlineNotice) offlineNotice.hidden = false;
    if (retryButton) retryButton.focus({ preventScroll: true }); // Focus retry button when offline appears
}

// --- Countdown Logic ---
function startCountdown() {
    if (redirectCancelled || !navigator.onLine || countdownInterval) return;

    console.log("Starting countdown");
    let secondsLeft = CONFIG.REDIRECT_DELAY_SECONDS;
    const totalSeconds = CONFIG.REDIRECT_DELAY_SECONDS;
    const circumference = countdownProgress ? parseFloat(getComputedStyle(countdownProgress).getPropertyValue('stroke-dasharray')) : 339.3;

    // Reset UI immediately
    if (countdownEl) countdownEl.textContent = secondsLeft;
    if (countdownProgress) {
        countdownProgress.style.transition = 'none'; // Disable transition temporarily
        countdownProgress.style.strokeDashoffset = circumference; // Start full
        void countdownProgress.offsetWidth; // Force reflow
        countdownProgress.style.transition = `stroke-dashoffset 1s linear, stroke ${CONFIG.transition_speed} ease`; // Re-enable
    }
    if (countdownCircle) countdownCircle.classList.remove('countdown-ending', 'countdown-cancelled');
    if (cancelButton) cancelButton.style.display = 'inline-block'; // Ensure visible
    updateCountdownText(secondsLeft);

    stopCountdown(); // Clear any existing intervals

    // Initial update for 3D animation (progress = 0)
    updateAnimationForCountdown(0);

    countdownInterval = setInterval(() => {
        secondsLeft -= 1;

        if (redirectCancelled) { // Check again inside interval
            stopCountdown();
            return;
        }

        const progress = Math.max(0, totalSeconds - secondsLeft) / totalSeconds; // Ensure progress doesn't go > 1

        // Update UI
        if (countdownEl) countdownEl.textContent = Math.max(0, secondsLeft); // Don't show negative
        if (countdownProgress) {
            countdownProgress.style.strokeDashoffset = circumference * (1 - progress);
        }
        updateCountdownText(secondsLeft);

        // Style near the end (e.g., last 3 seconds)
        if (secondsLeft <= 3 && countdownCircle && !countdownCircle.classList.contains('countdown-ending')) {
            countdownCircle.classList.add('countdown-ending');
        }

        // Update 3D animation based on progress
        updateAnimationForCountdown(progress);

        // Redirect when time's up
        if (secondsLeft < 0) {
            stopCountdown();
            triggerRedirect();
        }
    }, 1000);

    autoRedirectTimeout = countdownInterval; // Store for potential clearing elsewhere
}

function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
        console.log("Countdown interval cleared");
    }
    // Optionally reset animation speed if stopped prematurely, unless cancelled
    // if (!redirectCancelled && !CONFIG.REDUCED_MOTION && scene) {
    //     updateAnimationForCountdown(0); // Reset to base state only if not cancelled
    // }
}

function updateCountdownText(seconds) {
     if (countdownTextEl) {
        if (redirectCancelled) {
            countdownTextEl.textContent = 'Warp jump cancelled. Manual navigation available.';
        } else if (seconds >= 0) {
             const srSpan = `<span class="sr-only">${seconds}</span>`; // Keep for screen readers
             countdownTextEl.innerHTML = `Engaging warp drive in ${srSpan} ${seconds} seconds...`;
        } else {
             countdownTextEl.textContent = 'Engaging warp drive...'; // Text during final fade/redirect
        }
    }
}

function cancelRedirect() {
    if (redirectCancelled) return;
    console.log("Redirect cancelled by user");
    redirectCancelled = true;
    stopCountdown();

    // Update UI for cancelled state
    if (countdownCircle) {
        countdownCircle.classList.remove('countdown-ending');
        countdownCircle.classList.add('countdown-cancelled'); // Add new class for styling
        if (countdownProgress) {
            // Keep progress frozen visually
            countdownProgress.style.strokeDashoffset = getComputedStyle(countdownProgress).strokeDashoffset;
             countdownProgress.style.stroke = 'var(--text-secondary-color)'; // Dim the progress stroke
        }
        if (countdownEl) {
            countdownEl.textContent = '—'; // Use a dash or similar symbol
            countdownEl.style.color = 'var(--text-secondary-color)';
            countdownEl.style.textShadow = 'none';
        }
    }
    updateCountdownText(-1); // Update text to show cancelled state
    if (cancelButton) cancelButton.style.display = 'none'; // Hide cancel button

    // Highlight and focus the manual redirect button
    if(manualRedirectButton) {
        manualRedirectButton.classList.add('highlight-manual');
        setTimeout(() => {
            if(manualRedirectButton) manualRedirectButton.classList.remove('highlight-manual');
        }, 3000); // Match CSS animation duration
         manualRedirectButton.focus({ preventScroll: true });
    }

     // Reset 3D animation to a calmer state after cancellation
     if (!CONFIG.REDUCED_MOTION && scene) {
        updateAnimationForCountdown(0); // Smoothly transition back to base state
     }
}

function triggerRedirect(forceImmediate = false) {
    if (redirectCancelled || !navigator.onLine) {
        console.log("Redirect aborted (cancelled or offline).");
        return;
    }
    console.log("Triggering redirect to:", CONFIG.REDIRECT_URL);

    document.body.style.transition = `opacity ${CONFIG.REDIRECT_FADE_MS / 1000}s ease-out`;
    document.body.style.opacity = '0';

    pauseAnimation(); // Stop animation during fade out

    const delay = forceImmediate ? 50 : CONFIG.REDIRECT_FADE_MS; // Use short delay if forced
    setTimeout(() => {
        window.location.href = CONFIG.REDIRECT_URL;
    }, delay);
}

// --- UI Helpers ---

function handleCopyUrl(button) { // Accept button for ripple effect
    if (!copyButton) return;
    const urlToCopy = CONFIG.REDIRECT_URL;

    addRippleEffect(button, event); // Trigger ripple on the copy button

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
            .then(() => showCopyToast("Coordinates copied!", false))
            .catch(err => {
                console.error('Clipboard API copy failed: ', err);
                fallbackCopy(urlToCopy); // Attempt fallback
            })
            .finally(resetVisuals);
    } else {
        console.warn("Clipboard API not available, using fallback.");
        fallbackCopy(urlToCopy);
        resetVisuals();
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    // Styling to keep it out of view
    textArea.style.position = 'fixed'; textArea.style.left = '-9999px'; textArea.style.top = '0';
    textArea.setAttribute('readonly', ''); // Prevent keyboard popup on mobile
    document.body.appendChild(textArea);
    textArea.select();
    textArea.setSelectionRange(0, 9999); // For mobile devices

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopyToast("Coordinates copied! (Fallback)", false);
        } else {
            console.error('Fallback copy command failed');
            showCopyToast("Copy failed. Please copy manually.", true);
        }
    } catch (err) {
        console.error('Fallback copy error', err);
        showCopyToast("Error copying. Please copy manually.", true);
    }
    document.body.removeChild(textArea);
}

function showCopyToast(message = "URL copied!", isError = false) {
     if (!copyToast) return;
     copyToast.textContent = message;
     copyToast.hidden = false;
     copyToast.style.backgroundColor = isError ? 'var(--offline-bg-color)' : 'var(--accent-secondary-color)'; // Use distinct colors
     copyToast.style.color = isError ? 'var(--offline-accent-color)' : '#fff';
     copyToast.style.borderColor = isError ? 'var(--offline-border-color)' : 'var(--accent-secondary-color)';

     // Reset animation
     copyToast.style.animation = 'none';
     void copyToast.offsetWidth; // Trigger reflow
     copyToast.style.animation = `toast-in-out ${(CONFIG.COPY_SUCCESS_DELAY_MS / 1000) + 0.5}s var(--transition-bezier) forwards`;

     // Clear previous timer if exists
     if (copyToast.timer) clearTimeout(copyToast.timer);
     copyToast.timer = setTimeout(() => {
        copyToast.hidden = true;
        copyToast.timer = null;
     }, CONFIG.COPY_SUCCESS_DELAY_MS + 500); // Hide after animation duration
}

// function addRippleEffectStyle() { /* Removed, handled in CSS */ }

function addRippleEffect(button, event) {
    if (!button || !event || CONFIG.REDUCED_MOTION) return; // Skip if reduced motion
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    // Calculate click position relative to the button
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // Calculate ripple size based on the button diagonal
    const size = Math.sqrt(rect.width * rect.width + rect.height * rect.height) * 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    // Center the ripple on the click coordinates
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;
    ripple.classList.add('ripple');

    // Temporarily set position relative if not already set (needed for absolute ripple)
    const currentPosition = getComputedStyle(button).position;
    if (currentPosition === 'static') {
        button.style.position = 'relative';
    }
    // Ensure overflow is hidden to contain the ripple
    button.style.overflow = 'hidden';

    button.appendChild(ripple);

    // Clean up ripple element and potentially restore original styles
    setTimeout(() => {
        ripple.remove();
        // Optional: Restore original position if it was changed, though usually not needed
        // if (currentPosition === 'static') {
        //     button.style.position = currentPosition;
        // }
        // Optional: Restore overflow if needed, but usually keep hidden for buttons
        // button.style.overflow = 'visible';
    }, 600); // Match CSS animation duration
}


// --- Error Handling ---
function handleGlobalError(event) {
    const error = event.error || event.reason || event;
    console.error('Unhandled Page Error:', error);
    stopCountdown(); // Stop countdown first
    pauseAnimation(); // Then pause animation

    if (errorContainer && errorContainer.hidden) { // Show only once
        errorContainer.hidden = false;
        errorContainer.innerHTML = `
            <p>Warp core instability detected! Automatic jump sequence aborted.</p>
            <button id="error-manual-redirect" class="button button-offline">
                Attempt Manual Jump
            </button>
        `;
        const errorButton = document.getElementById('error-manual-redirect');
        if(errorButton){
            errorButton.onclick = (e) => {
                addRippleEffect(e.currentTarget, e);
                setTimeout(()=> window.location.href = CONFIG.REDIRECT_URL, 150); // Slight delay for ripple
            };
            errorButton.focus(); // Focus the button in the error message
        }
    }
}

// --- Performance Monitoring ---
function setupPerformanceMonitoring() {
    window.performance.mark('script-end');
    try {
        window.performance.measure('script-execution', 'script-start', 'script-end');
        const measure = window.performance.getEntriesByName('script-execution')[0];
        if (measure) console.log(`Performance - Script Execution Time: ${measure.duration.toFixed(2)}ms`);

        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (['first-paint', 'first-contentful-paint', 'largest-contentful-paint'].includes(entry.name)) {
                        console.log(`Performance - ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
                    }
                });
            });
            observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        }
    } catch (e) {
        console.warn("Performance monitoring setup failed:", e);
    }
}


// --- Background Animation (Three.js) ---

function getCssVariable(varName) {
    return getComputedStyle(document.body).getPropertyValue(varName).trim();
}

function initThreeJS() {
    if (!canvas || typeof THREE === 'undefined') throw new Error("Canvas or THREE missing");
    console.log("Initializing Three.js Scene...");

    // Scene
    scene = new THREE.Scene();
    // scene.fog = new THREE.FogExp2(0x0d1018, 0.03); // Add subtle fog

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = CONFIG.CAMERA_Z;

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true, // Keep alpha for blending with body background if needed
        antialias: true,
        powerPreference: 'high-performance',
        precision: 'highp' // Use highp for better visuals if perf allows
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap pixel ratio for performance
    // renderer.outputColorSpace = THREE.SRGBColorSpace; // Correct color space
    // renderer.toneMapping = THREE.ACESFilmicToneMapping; // Cinematic tone mapping
    // renderer.toneMappingExposure = 1.0;

    // Lighting
    ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft ambient
    scene.add(ambientLight);

    const accentColor = getCssVariable('--accent-color') || '#00f2fe';
    baseAccentColor.set(accentColor); // Store the base color

    pointLight = new THREE.PointLight(baseAccentColor, 2, 50, 1.5); // Use accent color, stronger intensity, decay
    pointLight.position.set(0, 2, 3);
    scene.add(pointLight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 0.3); // Softer directional
    directionalLight.position.set(-5, 5, -5);
    scene.add(directionalLight);

    // Main Shape (Torus Knot)
    const geometry = new THREE.TorusKnotGeometry(1.2, 0.35, 128, 16); // More complex shape
    const material = new THREE.MeshStandardMaterial({ // Standard material for better lighting
        color: baseAccentColor,
        metalness: 0.6,
        roughness: 0.3,
        emissive: baseAccentColor, // Make it glow
        emissiveIntensity: 0.1, // Initial low emissive
    });
    mainMesh = new THREE.Mesh(geometry, material);
    mainMesh.userData.baseRotationSpeed = CONFIG.MAIN_SHAPE_ROTATION_SPEED;
    mainMesh.userData.basePulseFreq = CONFIG.MAIN_SHAPE_PULSE_FREQ;
    mainMesh.userData.basePulseAmp = CONFIG.MAIN_SHAPE_PULSE_AMP;
    mainMesh.userData.rotationSpeed = CONFIG.MAIN_SHAPE_ROTATION_SPEED;
    mainMesh.userData.pulseFreq = CONFIG.MAIN_SHAPE_PULSE_FREQ;
    mainMesh.userData.pulseAmp = CONFIG.MAIN_SHAPE_PULSE_AMP;
    scene.add(mainMesh);

    // Particle System
    createParticles(baseAccentColor);

    // Post-processing (Bloom)
    if (CONFIG.ENABLE_BLOOM && !CONFIG.REDUCED_MOTION) {
        setupPostProcessing();
    }

    // Animation Clock
    clock = new THREE.Clock();

     console.log("Three.js Initialized");
}

function createParticles(baseColor) {
    const particlesCount = CONFIG.PARTICLE_COUNT;
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);
    const velocityArray = new Float32Array(particlesCount * 3); // Store velocity for each particle
    const colorArray = new Float32Array(particlesCount * 3);
    const particleColor = new THREE.Color();
    const spread = CONFIG.PARTICLE_SPREAD;

    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;

        // Initial position spread out
        posArray[i3] = (Math.random() - 0.5) * spread;
        posArray[i3 + 1] = (Math.random() - 0.5) * spread;
        posArray[i3 + 2] = (Math.random() - 0.5) * spread * 0.5; // Less spread on Z initially

        // Initial velocity (mostly outwards/random)
        velocityArray[i3] = (Math.random() - 0.5) * 0.1;
        velocityArray[i3 + 1] = (Math.random() - 0.5) * 0.1;
        velocityArray[i3 + 2] = Math.random() * 0.1 + 0.02; // Slightly forward bias

        // Color variation
        particleColor.copy(baseColor).offsetHSL(
            (Math.random() - 0.5) * 0.2,  // Hue variation
            (Math.random() - 0.5) * 0.3,  // Saturation variation
            (Math.random() - 0.5) * 0.4   // Lightness variation
        );
        colorArray[i3] = particleColor.r;
        colorArray[i3 + 1] = particleColor.g;
        colorArray[i3 + 2] = particleColor.b;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocityArray, 3)); // Add velocity attribute
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.06, // Slightly larger particles
        vertexColors: true,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending, // Brighter overlapping particles
        sizeAttenuation: true,
        depthWrite: false // Prevent particles hiding behind each other weirdly
    });
    particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    particlesMesh.userData.baseSpeedMultiplier = CONFIG.PARTICLE_SPEED_MULTIPLIER;
    particlesMesh.userData.speedMultiplier = CONFIG.PARTICLE_SPEED_MULTIPLIER;
    scene.add(particlesMesh);
}

function setupPostProcessing() {
    console.log("Setting up post-processing");
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

    // Optional: Add FilmPass for subtle grain/scanlines
    // const filmPass = new FilmPass(0.15, 0.025, 648, false); // noise intensity, scanline intensity, scanline count, grayscale
    // composer.addPass(filmPass);
}

// --- Animation Update Logic ---

// Update animation based on countdown progress (0 to 1)
function updateAnimationForCountdown(progress) {
    if (!scene || CONFIG.REDUCED_MOTION) return;

    const easeProgress = progress * progress; // Ease-in effect (speeds up towards end)
    const multiplier = 1 + easeProgress * 2.5; // Increased multiplier for dramatic effect

    // Main Mesh Updates
    if (mainMesh) {
        mainMesh.userData.rotationSpeed = mainMesh.userData.baseRotationSpeed * multiplier;
        mainMesh.userData.pulseFreq = mainMesh.userData.basePulseFreq * (1 + easeProgress * 2);
        mainMesh.userData.pulseAmp = mainMesh.userData.basePulseAmp * (1 + easeProgress * 1.5);

        // Lerp emissive intensity and color towards secondary accent
        const secondaryColor = new THREE.Color(getCssVariable('--accent-secondary-color') || '#ff00a0');
        mainMesh.material.emissiveIntensity = THREE.MathUtils.lerp(0.1, 0.8, easeProgress);
        mainMesh.material.color.lerpColors(baseAccentColor, secondaryColor, easeProgress * 0.7); // Blend base and secondary
        mainMesh.material.emissive.copy(mainMesh.material.color); // Make emissive match blended color
    }

    // Particle Updates
    if (particlesMesh) {
        particlesMesh.userData.speedMultiplier = particlesMesh.userData.baseSpeedMultiplier * multiplier;
         // Increase particle size slightly towards the end
        particlesMesh.material.size = THREE.MathUtils.lerp(0.06, 0.1, easeProgress);
    }

    // Light Updates
    if (pointLight) {
        pointLight.intensity = THREE.MathUtils.lerp(2, 6, easeProgress); // Increase intensity dramatically
        pointLight.distance = THREE.MathUtils.lerp(50, 100, easeProgress); // Increase light range
        pointLight.color.copy(mainMesh.material.color); // Match point light color to mesh color
    }

     // Bloom Updates (Optional: could make bloom stronger too)
     if (bloomPass) {
         bloomPass.strength = THREE.MathUtils.lerp(CONFIG.BLOOM_STRENGTH, CONFIG.BLOOM_STRENGTH * 1.5, easeProgress);
     }
}

// --- Animation Loop ---
function startAnimationLoop() {
    if (animationFrameId || CONFIG.REDUCED_MOTION || !scene) return;
    console.log("Starting animation loop");
    if (clock && !clock.running) clock.start(); // Ensure clock is running
    animate();
}

function animate() {
    if (!scene || !clock) return; // Ensure scene and clock are ready

    animationFrameId = requestAnimationFrame(animate);
    frameCount++;

    const elapsedTime = clock.getElapsedTime();
    const deltaTime = clock.getDelta(); // Time since last frame

    // --- Camera Animation ---
    // Subtle orbit
    camera.position.x = Math.sin(elapsedTime * CONFIG.CAMERA_ORBIT_SPEED) * CONFIG.CAMERA_ORBIT_RADIUS;
    // camera.position.y = Math.cos(elapsedTime * CONFIG.CAMERA_ORBIT_SPEED) * CONFIG.CAMERA_ORBIT_RADIUS * 0.5; // Optional vertical movement

    // Mouse/Touch Influence on camera lookAt target
    targetX = mouseX * CONFIG.MOUSE_INFLUENCE_FACTOR;
    targetY = -mouseY * CONFIG.MOUSE_INFLUENCE_FACTOR; // Invert Y

    // Smoothly interpolate camera target towards mouse position
    const lookAtTarget = new THREE.Vector3(); // Target point in front of camera
    lookAtTarget.x += (targetX - lookAtTarget.x) * 0.1; // Smoothing factor
    lookAtTarget.y += (targetY - lookAtTarget.y) * 0.1;
    lookAtTarget.z = camera.position.z - 1; // Point slightly in front of camera Z

    camera.lookAt(lookAtTarget); // Make camera look towards the interpolated target

    // --- Main Mesh Animation ---
    if (mainMesh) {
        const rotSpeed = mainMesh.userData.rotationSpeed; // Use dynamic speed
        const pulseFreq = mainMesh.userData.pulseFreq;
        const pulseAmp = mainMesh.userData.pulseAmp;

        mainMesh.rotation.x += rotSpeed * deltaTime * 0.8; // Use deltaTime for smoother animation
        mainMesh.rotation.y += rotSpeed * deltaTime * 1.2;
        mainMesh.rotation.z += rotSpeed * deltaTime * 0.5;

        const pulseScale = 1 + Math.sin(elapsedTime * pulseFreq * Math.PI * 2) * pulseAmp;
        mainMesh.scale.setScalar(pulseScale);
    }

    // --- Particle Animation (Throttled Update) ---
    if (particlesMesh && (frameCount % CONFIG.PARTICLE_UPDATE_INTERVAL === 0)) {
        const positions = particlesMesh.geometry.attributes.position.array;
        const velocities = particlesMesh.geometry.attributes.velocity.array;
        const speedMult = particlesMesh.userData.speedMultiplier;
        const spread = CONFIG.PARTICLE_SPREAD;

        for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
            const i3 = i * 3;

            // Update position based on velocity and speed multiplier
            positions[i3] += velocities[i3] * speedMult;
            positions[i3 + 1] += velocities[i3 + 1] * speedMult;
            positions[i3 + 2] += velocities[i3 + 2] * speedMult;

            // Boundary Check & Reset (wrap around)
            if (positions[i3 + 2] > spread * 0.3) { // If particle goes too far forward
                positions[i3] = (Math.random() - 0.5) * spread;
                positions[i3 + 1] = (Math.random() - 0.5) * spread;
                positions[i3 + 2] = -spread * 0.3; // Reset behind
                // Optional: Reset velocity too for more variation
                velocities[i3] = (Math.random() - 0.5) * 0.1;
                velocities[i3+1] = (Math.random() - 0.5) * 0.1;
                velocities[i3+2] = Math.random() * 0.1 + 0.02;
            } else if (Math.abs(positions[i3]) > spread || Math.abs(positions[i3 + 1]) > spread) {
                 // Reset if goes too far sideways
                 positions[i3] = (Math.random() - 0.5) * spread * 0.1; // Reset closer to center
                 positions[i3 + 1] = (Math.random() - 0.5) * spread * 0.1;
                 positions[i3 + 2] = -spread * 0.3;
                 velocities[i3] = (Math.random() - 0.5) * 0.1;
                 velocities[i3+1] = (Math.random() - 0.5) * 0.1;
                 velocities[i3+2] = Math.random() * 0.1 + 0.02;
            }
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;
        // No need to update velocity attribute unless you change it
    }


    // Render scene
    if (composer && CONFIG.ENABLE_BLOOM && !CONFIG.REDUCED_MOTION) {
        composer.render(deltaTime); // Pass deltaTime to composer if needed by passes
    } else if (renderer) {
        renderer.render(scene, camera);
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
    // Resume only if not paused, not reduced motion, clock exists, and scene exists
    if (!animationFrameId && !CONFIG.REDUCED_MOTION && clock && scene) {
        if (!clock.running) clock.start(); // Restart clock if stopped
        startAnimationLoop(); // Use the function to restart loop correctly
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Re-apply pixel ratio cap

    if (composer) {
        composer.setSize(width, height);
        // Update bloom pass size if needed (usually automatic with composer.setSize)
        // if (bloomPass) bloomPass.setSize(width, height);
    }
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
}
function onDocumentTouchMove(event) {
    if (event.touches.length === 1) {
        // No preventDefault needed if passive: true
        mouseX = (event.touches[0].pageX - windowHalfX);
        mouseY = (event.touches[0].pageY - windowHalfY);
    }
}

function handleVisibilityChange() {
    if (!CONFIG.REDUCED_MOTION && scene) {
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
    pauseAnimation(); // Stop the loop

    // Remove event listeners
    window.removeEventListener('online', handleConnectionChange);
    window.removeEventListener('offline', handleConnectionChange);
    window.removeEventListener('error', handleGlobalError);
    window.removeEventListener('unhandledrejection', handleGlobalError); // Simple reference is fine
    window.removeEventListener('resize', handleResize);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('mousemove', onDocumentMouseMove);
    document.removeEventListener('touchmove', onDocumentTouchMove);
    document.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('beforeunload', cleanup);
    // Ensure buttons with dynamic listeners are cleaned if necessary (though handled by DOM removal)

    // Clear timeouts/intervals
    stopCountdown();
    clearTimeout(autoRedirectTimeout); // Ensure the stored timeout is cleared
    clearTimeout(resizeTimeout);
    if (copyToast && copyToast.timer) clearTimeout(copyToast.timer);


    // Dispose Three.js objects thoroughly
    if (scene) {
        scene.traverse((object) => {
            if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => {
                            if (material.map) material.map.dispose(); // Dispose textures
                            material.dispose();
                        });
                    } else {
                        if (object.material.map) object.material.map.dispose();
                        object.material.dispose();
                    }
                }
            } else if (object instanceof THREE.Light) {
                // Lights don't typically need disposal unless they have textures (e.g., LightMap)
            }
        });
        scene.clear(); // Remove all objects from scene
    }

    if (composer) {
        // Dispose render targets used by composer passes
        composer.renderTarget1?.dispose();
        composer.renderTarget2?.dispose();
        composer.writeBuffer?.dispose();
        composer.readBuffer?.dispose();
        // Dispose individual passes if they have custom dispose methods (check docs)
        // bloomPass?.dispose(); // UnrealBloomPass doesn't have explicit dispose
        composer = null;
    }

    if (renderer) {
        renderer.dispose(); // Dispose context, textures, programs etc.
        renderer.forceContextLoss(); // Aggressively release WebGL context
        const gl = renderer.domElement.getContext('webgl');
        if (gl && gl.getExtension('WEBGL_lose_context')) {
            gl.getExtension('WEBGL_lose_context').loseContext();
        }
        renderer.domElement = null; // Remove reference to canvas
        renderer = null;
    }

    // Help GC
    scene = null; camera = null; clock = null;
    mainMesh = null; particlesMesh = null; ambientLight = null; pointLight = null; directionalLight = null;
    bloomPass = null;

    console.log("Cleanup complete.");
}

// --- End Script ---