import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
// Optional: For final flash effect
// import { AfterimagePass } from 'three/addons/postprocessing/AfterimagePass.js';

// --- Configuration ---
const CONFIG = {
    REDIRECT_URL: 'https://tobin-data-portfolio.netlify.app/', // *** YOUR NEW URL ***
    REDIRECT_DELAY_SECONDS: 12, // Slightly longer for visual build-up
    REDUCED_MOTION: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    // 3D Settings - Data Nexus Theme
    ENABLE_BLOOM: true,
    BLOOM_STRENGTH: 0.7, // More intense bloom for energy effect
    BLOOM_RADIUS: 0.6,
    BLOOM_THRESHOLD: 0.6, // Bloom more areas
    NEXUS_CORE_ROTATION_SPEED: 0.1,
    NEXUS_CORE_PULSE_FREQ: 0.4,
    NEXUS_CORE_PULSE_AMP: 0.04,
    NEXUS_WIRE_ROTATION_SPEED: -0.05, // Counter-rotation
    PARTICLE_COUNT: 1000, // Data streams
    PARTICLE_SPEED_MULTIPLIER: 0.5, // Faster base speed for streams
    PARTICLE_SPREAD: 25,
    CONNECTION_LINE_COUNT: 50, // Number of flashing connection lines
    CONNECTION_LINE_FLASH_FREQ: 0.1, // Base frequency of flashes
    CAMERA_Z: 7, // Slightly further back for wider view
    CAMERA_AUTO_ROTATE: true,
    CAMERA_AUTO_ROTATE_SPEED: 0.03,
    CAMERA_DOLLY_SPEED: -0.1, // Slow zoom-in effect
    MOUSE_INFLUENCE_FACTOR: 0.0001, // Even more subtle mouse look
    // Performance & Timing
    RESIZE_DEBOUNCE_MS: 150,
    COPY_SUCCESS_DELAY_MS: 2000,
    REDIRECT_FADE_MS: 700, // Longer fade for final effect
    PARTICLE_UPDATE_INTERVAL: 1, // Update particles more frequently (can adjust if perf issues)
    FINAL_FLASH_DURATION: 300, // Duration of the flash before redirect (ms)
};

// --- Global Variables ---
let countdownInterval = null;
let redirectCancelled = false;
let autoRedirectTimeout = null;
let resizeTimeout = null;
let animationFrameId = null;
let frameCount = 0;
let isInitialized = false;
let finalFlashActive = false;

// --- DOM Elements ---
let countdownEl, countdownCircle, countdownProgress, cancelButton, copyButton, copyToast, errorContainer, onlineContent, offlineNotice, retryButton, countdownTextEl, copyIconDefault, copyIconSuccess, manualRedirectButton, canvas;

// --- Three.js Variables ---
let scene, camera, renderer, nexusCoreMesh, nexusWireframeMesh, particlesMesh, connectionLinesMesh, clock, ambientLight, pointLight;
let composer, bloomPass /*, afterimagePass */;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let baseAccentColor = new THREE.Color();
let secondaryAccentColor = new THREE.Color();
let finalAccentColor = new THREE.Color(); // Color for final pulse

// --- Initialize ---
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    if (isInitialized) return;
    isInitialized = true;
    console.log("DOM Loaded. Initializing Data Nexus. Reduced Motion:", CONFIG.REDUCED_MOTION);

    if (!assignDOMElements()) {
        console.error("Initialization failed: Critical DOM elements missing.");
        // Consider adding a user-facing message here if elements are missing
        document.body.innerHTML = '<p style="color: red; padding: 2em;">Error: Page initialization failed. Please try refreshing.</p>';
        return;
    }

    setupEventListeners();
    handleConnectionChange(); // Initial network check

    if (!CONFIG.REDUCED_MOTION) {
        try {
            initThreeJS();
            startAnimationLoop();
        } catch (error) {
            console.error("Fatal Error Initializing 3D Scene:", error);
            if (canvas) canvas.style.display = 'none';
            document.body.classList.add('no-3d');
            // Display a more specific error related to 3D failure
             handleGlobalError({error: new Error("3D visualization failed to load.")});
        }
    } else {
        if (canvas) canvas.style.display = 'none';
        document.body.classList.add('reduced-motion');
        console.log("Reduced motion preferred. Skipping 3D animation.");
    }

    setupPerformanceMonitoring();
    console.log("App Initialization Complete.");
}

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
    manualRedirectButton = document.getElementById('manual-redirect-button');
    onlineContent = document.getElementById('online-content');
    offlineNotice = document.getElementById('offline-notice');
    retryButton = document.getElementById('retry-button');
    countdownTextEl = document.getElementById('countdown-text');
    copyIconDefault = document.getElementById('copy-icon-default');
    copyIconSuccess = document.getElementById('copy-icon-success');

    // Check essential elements
    if (!canvas || !onlineContent || !offlineNotice || !countdownEl || !manualRedirectButton || !countdownProgress) {
        console.error("Missing one or more critical DOM elements for core functionality.");
        return false;
    }
    return true;
}

// --- Event Listeners Setup ---
// (Largely same as previous version - ensure correct elements are referenced)
function setupEventListeners() {
    console.log("Setting up event listeners");
    cancelButton?.addEventListener('click', cancelRedirect);
    copyButton?.addEventListener('click', handleCopyUrl);
    manualRedirectButton?.addEventListener('click', (e) => {
        addRippleEffect(e.currentTarget, e);
        // Optional: Immediately trigger redirect if desired
        // triggerRedirect(true); // Pass true for immediate effect
    });
    retryButton?.addEventListener('click', (e) => {
        addRippleEffect(e.currentTarget, e);
        retryButton.disabled = true;
        retryButton.textContent = "Linking...";
        setTimeout(() => window.location.reload(), 350);
    });

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
    window.addEventListener('error', handleGlobalError, true);
    window.addEventListener('unhandledrejection', handlePromiseRejection, true);
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    if (!CONFIG.REDUCED_MOTION) {
        document.addEventListener('mousemove', onDocumentMouseMove);
        document.addEventListener('touchmove', onDocumentTouchMove, { passive: true });
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
    if (document.activeElement && ['INPUT', 'TEXTAREA', 'BUTTON'].includes(document.activeElement.tagName)) {
        return; // Ignore if focus is on interactive elements
    }
    if (event.key === 'Escape' && !redirectCancelled && navigator.onLine && onlineContent && !onlineContent.hidden) {
        cancelRedirect();
        manualRedirectButton?.focus({ preventScroll: true });
    }
}

// --- Network Status Handling ---
function handleConnectionChange() {
    const isOnline = navigator.onLine;
    console.log("Connection status:", isOnline ? "Online" : "Offline");
    document.body.classList.toggle('is-offline', !isOnline);

    if (isOnline) {
        showOnlineContent();
        if (!redirectCancelled) startCountdown();
        // Resume animation only if it was initialized and is currently paused
        if (!CONFIG.REDUCED_MOTION && scene && animationFrameId === null) resumeAnimation();
    } else {
        showOfflineContent();
        stopCountdown();
        pauseAnimation();
    }
}

function showOnlineContent() {
    if (offlineNotice) offlineNotice.hidden = true;
    if (onlineContent) onlineContent.hidden = false;
    if (cancelButton) cancelButton.style.display = redirectCancelled ? 'none' : 'inline-block';
    if (manualRedirectButton) manualRedirectButton.classList.remove('highlight-manual');
}

function showOfflineContent() {
    if (onlineContent) onlineContent.hidden = true;
    if (offlineNotice) offlineNotice.hidden = false;
    if (retryButton && !retryButton.disabled) retryButton.focus({ preventScroll: true });
}

// --- Countdown Logic ---
function startCountdown() {
    if (countdownInterval || redirectCancelled || !navigator.onLine || !countdownEl || !countdownProgress || !countdownCircle) return;
    console.log("Starting countdown sequence...");

    let secondsLeft = CONFIG.REDIRECT_DELAY_SECONDS;
    const totalSeconds = CONFIG.REDIRECT_DELAY_SECONDS;
    const circumference = parseFloat(getComputedStyle(countdownProgress).getPropertyValue('stroke-dasharray')) || 339.3;

    // Reset UI
    countdownEl.textContent = secondsLeft;
    countdownProgress.style.transition = 'none'; // Temporarily disable transition
    countdownProgress.style.strokeDashoffset = circumference; // Reset to empty
    void countdownProgress.offsetWidth; // Force reflow
    // Re-enable transitions with updated duration/easing
    countdownProgress.style.transition = `stroke-dashoffset 1s linear, stroke 0.5s ease, filter 0.5s ease`;
    countdownProgress.style.stroke = baseAccentColor.getStyle(); // Use initial color
    countdownProgress.style.filter = `drop-shadow(0 0 8px ${baseAccentColor.getStyle()})`; // Initial glow

    countdownCircle.classList.remove('countdown-ending', 'countdown-cancelled');
    if (cancelButton) cancelButton.style.display = 'inline-block';
    updateCountdownText(secondsLeft);

    // Initial 3D state
    if (!CONFIG.REDUCED_MOTION) updateAnimationForCountdown(0);

    countdownInterval = setInterval(() => {
        secondsLeft -= 1;
        const progress = Math.max(0, totalSeconds - secondsLeft) / totalSeconds;

        // Update UI
        countdownEl.textContent = Math.max(0, secondsLeft);
        countdownProgress.style.strokeDashoffset = circumference * (1 - progress);
        updateCountdownText(secondsLeft);

        // Update countdown circle/progress color based on 3D state
        const currentNexusColor = getCurrentNexusColor(progress);
        countdownProgress.style.stroke = currentNexusColor.getStyle();
        // Adjust glow intensity and color
        const glowIntensity = THREE.MathUtils.lerp(8, 15, progress * progress); // More glow towards end
        countdownProgress.style.filter = `drop-shadow(0 0 ${glowIntensity}px ${currentNexusColor.getStyle()})`;

        if (secondsLeft <= 3 && secondsLeft >= 0) {
            countdownCircle.classList.add('countdown-ending'); // Class for number styling (e.g., red)
        } else {
            countdownCircle.classList.remove('countdown-ending');
        }

        // Update 3D animation
        if (!CONFIG.REDUCED_MOTION) updateAnimationForCountdown(progress);

        // Redirect when time is up
        if (secondsLeft < 0) {
            stopCountdown();
            triggerRedirect();
        }
    }, 1000);

    autoRedirectTimeout = countdownInterval;
}


function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
        autoRedirectTimeout = null;
        console.log("Countdown sequence stopped.");
    }
}

function updateCountdownText(seconds) {
     if (!countdownTextEl) return;
     if (redirectCancelled) {
        countdownTextEl.textContent = 'Transition aborted. Manual navigation enabled.';
     } else if (seconds >= 0) {
        countdownTextEl.textContent = `Nexus stabilization in ${seconds} seconds...`;
        const srSpan = countdownTextEl.querySelector('.sr-only');
        if(srSpan) srSpan.textContent = seconds;
     } else {
        countdownTextEl.textContent = 'Convergence complete. Transitioning...';
     }
}


function cancelRedirect() {
    if (redirectCancelled) return;
    console.log("Transition cancelled by user.");
    redirectCancelled = true;
    stopCountdown();

    // Update UI to cancelled state
    if (countdownCircle) countdownCircle.classList.add('countdown-cancelled');
    if (countdownEl) countdownEl.textContent = '—';
    updateCountdownText(-1);
    if (cancelButton) cancelButton.style.display = 'none';
    if (countdownProgress) { // Reset progress bar style
        countdownProgress.style.filter = 'none';
        countdownProgress.style.stroke = 'var(--cancelled-stroke-color)';
    }

    if(manualRedirectButton) {
        manualRedirectButton.classList.add('highlight-manual');
        manualRedirectButton.focus({ preventScroll: true });
    }

    // Reset 3D animation to base state
     if (!CONFIG.REDUCED_MOTION) updateAnimationForCountdown(0);
}


function triggerRedirect(immediate = false) {
    if (redirectCancelled || !navigator.onLine || finalFlashActive) {
        console.log("Redirect aborted (cancelled, offline, or already flashing).");
        return;
    }
    console.log("Convergence reached. Initiating transition...");
    finalFlashActive = true; // Prevent re-triggering during flash
    stopCountdown(); // Ensure countdown is stopped

    // Start final flash animation
    if (!CONFIG.REDUCED_MOTION && scene) {
        updateAnimationForCountdown(1.1); // Trigger final state (slightly > 1 for emphasis)
        // Optional: Add screen flash via CSS overlay or post-processing
        document.body.classList.add('final-flash');
    }

    const fadeDelay = immediate ? 50 : CONFIG.FINAL_FLASH_DURATION; // Delay for flash effect
    const redirectDelay = fadeDelay + CONFIG.REDIRECT_FADE_MS;

    // Start fade out after flash delay
    setTimeout(() => {
        document.body.style.transition = `opacity ${CONFIG.REDIRECT_FADE_MS / 1000}s ease-in`; // Ease-in fade
        document.body.style.opacity = '0';
        pauseAnimation(); // Pause 3D rendering during fade
        document.body.classList.remove('final-flash'); // Remove flash class
    }, fadeDelay);

    // Redirect after fade out completes
    setTimeout(() => {
        window.location.href = CONFIG.REDIRECT_URL;
    }, redirectDelay);
}

// --- UI Helpers ---
// handleCopyUrl, fallbackCopy, showCopyToast, addRippleEffect (mostly same as previous, ensure element checks)
function handleCopyUrl(event) {
    if (!copyButton || !event) return;
    const button = event.currentTarget;
    const urlToCopy = CONFIG.REDIRECT_URL;
    addRippleEffect(button, event);
    button.classList.add('copied');
    button.disabled = true;
    if (copyIconDefault) copyIconDefault.style.opacity = '0';
    if (copyIconSuccess) copyIconSuccess.style.opacity = '1';

    const resetVisuals = () => {
        setTimeout(() => {
            if (button) { button.classList.remove('copied'); button.disabled = false; }
            if (copyIconDefault) copyIconDefault.style.opacity = '1';
            if (copyIconSuccess) copyIconSuccess.style.opacity = '0';
        }, CONFIG.COPY_SUCCESS_DELAY_MS);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(urlToCopy)
            .then(() => showCopyToast("Nexus coordinates copied!", false))
            .catch(err => { console.error('Clipboard API copy failed:', err); fallbackCopy(urlToCopy); })
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
    textArea.style.position = 'fixed'; textArea.style.left = '-9999px'; textArea.style.top = '0';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    let success = false;
    try {
        textArea.select(); textArea.setSelectionRange(0, 9999);
        success = document.execCommand('copy');
    } catch (err) { console.error('Fallback copy error:', err); success = false; }
    document.body.removeChild(textArea);
    showCopyToast(success ? "Coordinates copied! (Fallback)" : "Copy failed. Please copy manually.", !success);
}

function showCopyToast(message = "Copied!", isError = false) {
    if (!copyToast) return;
    copyToast.textContent = message;
    copyToast.style.backgroundColor = isError ? 'var(--offline-bg-color)' : 'var(--dark-accent-secondary, #a855f7)';
    copyToast.style.color = isError ? 'var(--offline-accent-color)' : '#fff';
    copyToast.style.borderColor = isError ? 'var(--offline-border-color)' : 'var(--dark-accent-secondary, #a855f7)';
    copyToast.hidden = false;
    copyToast.style.animation = 'none'; void copyToast.offsetWidth;
    copyToast.style.animation = `toast-in-out ${(CONFIG.COPY_SUCCESS_DELAY_MS / 1000) + 0.5}s var(--transition-bezier) forwards`;
    if (copyToast.timer) clearTimeout(copyToast.timer);
    copyToast.timer = setTimeout(() => { copyToast.hidden = true; copyToast.style.animation = 'none'; copyToast.timer = null; }, CONFIG.COPY_SUCCESS_DELAY_MS + 500);
}

function addRippleEffect(button, event) {
    if (!button || !event || CONFIG.REDUCED_MOTION) return;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left; const y = event.clientY - rect.top;
    const size = Math.max(rect.width, rect.height) * 1.5;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x - size / 2}px`; ripple.style.top = `${y - size / 2}px`;
    ripple.classList.add('ripple');
    const currentPosition = getComputedStyle(button).position;
    if (currentPosition === 'static') button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    setTimeout(() => { ripple.remove(); if (currentPosition === 'static') button.style.position = currentPosition; }, 600);
}


// --- Error Handling ---
function handleGlobalError(event) {
    const error = event.error || event.message || event;
    console.error('Unhandled Critical Error:', error);
    stopCountdown(); pauseAnimation();
    if (errorContainer && errorContainer.hidden) {
        errorContainer.hidden = false;
        let errorMessage = "Nexus instability detected. Transition aborted.";
        if (error instanceof Error) {
            errorMessage += ` (${error.message})`;
        } else if (typeof error === 'string') {
             errorMessage += ` (${error})`;
        }
        errorContainer.innerHTML = `<p>${errorMessage}</p><button id="error-manual-redirect" class="button button-offline">Attempt Manual Jump</button>`;
        const errorButton = document.getElementById('error-manual-redirect');
        if(errorButton){
            errorButton.onclick = (e) => { addRippleEffect(e.currentTarget, e); errorButton.disabled = true; errorButton.textContent = "Attempting..."; setTimeout(()=> window.location.href = CONFIG.REDIRECT_URL, 150); };
            errorButton.focus({ preventScroll: true });
        }
    }
    // Prevent further script execution if error is critical? Depends on the error.
}
function handlePromiseRejection(event) {
     console.error('Unhandled Promise Rejection:', event.reason);
     handleGlobalError({ error: event.reason || new Error("Unhandled promise rejection") });
     event.preventDefault();
}


// --- Performance Monitoring --- (Same as previous version)
function setupPerformanceMonitoring() { /* ... */ }


// --- Background Animation (Three.js) --- Data Nexus ---

function getCssVariable(varName, fallback = null) {
    if (document.body && window.getComputedStyle) {
        const value = getComputedStyle(document.body).getPropertyValue(varName).trim();
        if (value) return value;
    }
    return fallback;
}

function initThreeJS() {
    if (!canvas || typeof THREE === 'undefined') throw new Error("Canvas or THREE missing");
    console.log("Initializing Data Nexus Scene...");

    // Colors
    const accent1 = getCssVariable('--accent-color', '#00e5ff');
    const accent2 = getCssVariable('--accent-secondary-color', '#a855f7');
    const accent3 = getCssVariable('--final-accent-color', '#fef08a');
    baseAccentColor.set(accent1);
    secondaryAccentColor.set(accent2);
    finalAccentColor.set(accent3);

    // Scene
    scene = new THREE.Scene();
    // scene.fog = new THREE.Fog(0x050608, 10, 30); // Subtle fog near/far

    // Camera
    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = CONFIG.CAMERA_Z;

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    // renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // renderer.toneMappingExposure = 0.9;

    // Lighting
    ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Lower ambient
    scene.add(ambientLight);
    pointLight = new THREE.PointLight(accent1, 3, 60, 1.8); // Stronger point light
    pointLight.position.set(0, 0, 2); // Position near core
    scene.add(pointLight);

    // --- Nexus Core ---
    const coreGeom = new THREE.IcosahedronGeometry(1.5, 1); // More complex base shape
    const coreMaterial = new THREE.MeshStandardMaterial({
        color: baseAccentColor,
        metalness: 0.4, roughness: 0.6,
        emissive: baseAccentColor, emissiveIntensity: 0.2,
        flatShading: false, // Smooth shading
    });
    nexusCoreMesh = new THREE.Mesh(coreGeom, coreMaterial);
    nexusCoreMesh.userData = { /* Store base anim props */
        baseRotationSpeed: CONFIG.NEXUS_CORE_ROTATION_SPEED, basePulseFreq: CONFIG.NEXUS_CORE_PULSE_FREQ, basePulseAmp: CONFIG.NEXUS_CORE_PULSE_AMP,
        rotationSpeed: CONFIG.NEXUS_CORE_ROTATION_SPEED, pulseFreq: CONFIG.NEXUS_CORE_PULSE_FREQ, pulseAmp: CONFIG.NEXUS_CORE_PULSE_AMP,
    };
    scene.add(nexusCoreMesh);

    // --- Nexus Wireframe Overlay ---
    const wireGeom = new THREE.EdgesGeometry(coreGeom, 1); // Use EdgesGeometry
    const wireMaterial = new THREE.LineBasicMaterial({
        color: baseAccentColor,
        linewidth: 1, // Note: linewidth > 1 may not work on all platforms
        transparent: true, opacity: 0.3,
        blending: THREE.AdditiveBlending,
    });
    nexusWireframeMesh = new THREE.LineSegments(wireGeom, wireMaterial);
    nexusWireframeMesh.userData = { baseRotationSpeed: CONFIG.NEXUS_WIRE_ROTATION_SPEED, rotationSpeed: CONFIG.NEXUS_WIRE_ROTATION_SPEED };
    nexusWireframeMesh.scale.setScalar(1.01); // Slightly larger than core
    scene.add(nexusWireframeMesh); // Add wireframe separately

    // --- Data Stream Particles ---
    createParticles(baseAccentColor); // Particles representing data streams

     // --- Connection Lines ---
     createConnectionLines();

    // Post-processing
    if (CONFIG.ENABLE_BLOOM) setupPostProcessing();

    // Clock
    clock = new THREE.Clock();
    console.log("Data Nexus Scene Initialized.");
}


function createParticles(initialColor) {
    const particlesCount = CONFIG.PARTICLE_COUNT;
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);
    const velocityArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    const particleColor = new THREE.Color();
    const spread = CONFIG.PARTICLE_SPREAD;

    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        // Start particles further out
        const radius = Math.random() * spread * 0.6 + spread * 0.4; // Start between 40% and 100% of spread
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1); // Uniform sphere distribution

        posArray[i3] = radius * Math.sin(phi) * Math.cos(theta);
        posArray[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        posArray[i3 + 2] = radius * Math.cos(phi);

        // Initial velocity points towards the center (0,0,0)
        const speed = Math.random() * 0.1 + 0.05;
        velocityArray[i3] = -posArray[i3] * speed * 0.1; // Scale speed factor
        velocityArray[i3 + 1] = -posArray[i3 + 1] * speed * 0.1;
        velocityArray[i3 + 2] = -posArray[i3 + 2] * speed * 0.1;

        particleColor.copy(initialColor).offsetHSL(Math.random() * 0.1 - 0.05, 0.1, Math.random() * 0.4 - 0.2);
        colorArray[i3] = particleColor.r; colorArray[i3 + 1] = particleColor.g; colorArray[i3 + 2] = particleColor.b;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocityArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05, vertexColors: true, transparent: true, opacity: 0.6,
        blending: THREE.AdditiveBlending, sizeAttenuation: true, depthWrite: false
    });
    particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    particlesMesh.userData = { baseSpeedMultiplier: CONFIG.PARTICLE_SPEED_MULTIPLIER, speedMultiplier: CONFIG.PARTICLE_SPEED_MULTIPLIER };
    scene.add(particlesMesh);
}

function createConnectionLines() {
    const lineCount = CONFIG.CONNECTION_LINE_COUNT;
    const points = [];
    const colors = [];
    const opacities = []; // Store opacity per vertex (start & end)
    const spread = CONFIG.PARTICLE_SPREAD * 0.8; // Lines within particle area
    const color1 = baseAccentColor.clone();
    const color2 = secondaryAccentColor.clone();

    for (let i = 0; i < lineCount; i++) {
        // Start point (random sphere)
        const r1 = Math.random() * spread * 0.5 + spread * 0.5; // 50% to 100% spread
        const th1 = Math.random() * Math.PI * 2;
        const ph1 = Math.acos((Math.random() * 2) - 1);
        const x1 = r1 * Math.sin(ph1) * Math.cos(th1);
        const y1 = r1 * Math.sin(ph1) * Math.sin(th1);
        const z1 = r1 * Math.cos(ph1);
        points.push(x1, y1, z1);

        // End point (random sphere, relatively close to start)
        const r2 = Math.random() * spread * 0.5 + spread * 0.5;
        const th2 = th1 + (Math.random() - 0.5) * Math.PI * 0.5; // Cluster end points somewhat
        const ph2 = ph1 + (Math.random() - 0.5) * Math.PI * 0.5;
        const x2 = r2 * Math.sin(ph2) * Math.cos(th2);
        const y2 = r2 * Math.sin(ph2) * Math.sin(th2);
        const z2 = r2 * Math.cos(ph2);
        points.push(x2, y2, z2);

        // Color (mix between accents)
        const lineColor = Math.random() > 0.5 ? color1 : color2;
        colors.push(lineColor.r, lineColor.g, lineColor.b); // Start color
        colors.push(lineColor.r, lineColor.g, lineColor.b); // End color

        // Initial opacity (start hidden)
        opacities.push(0, 0);
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    lineGeometry.setAttribute('opacity', new THREE.Float32BufferAttribute(opacities, 1)); // Opacity attribute

    // Use ShaderMaterial for opacity control
    const lineMaterial = new THREE.ShaderMaterial({
        uniforms: {
             // No uniforms needed if using vertex attributes directly
        },
        vertexShader: `
            attribute float opacity;
            varying vec3 vColor;
            varying float vOpacity;
            void main() {
                vColor = color;
                vOpacity = opacity;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vOpacity;
            void main() {
                 if (vOpacity <= 0.0) discard; // Discard fragments with zero opacity
                 gl_FragColor = vec4(vColor, vOpacity * 0.6); // Apply opacity (make slightly dimmer)
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true,
    });

    connectionLinesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    connectionLinesMesh.userData = { flashProgress: new Array(lineCount).fill(0) }; // Store flash state per line
    scene.add(connectionLinesMesh);
}


function setupPostProcessing() {
    if (!renderer || !scene || !camera) return;
    console.log("Setting up post-processing...");
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), CONFIG.BLOOM_STRENGTH, CONFIG.BLOOM_RADIUS, CONFIG.BLOOM_THRESHOLD);
    composer.addPass(bloomPass);

    // Optional: Afterimage pass for trails effect during final flash
    // afterimagePass = new AfterimagePass(0.85); // Damp value (lower = longer trails)
    // afterimagePass.enabled = false; // Enable only during flash
    // composer.addPass(afterimagePass);
}

// --- Animation Update Logic ---

// Helper to get the target color based on progress
function getCurrentNexusColor(progress) {
    const clampedProgress = Math.min(1, Math.max(0, progress)); // Ensure 0-1 range
    if (clampedProgress < 0.6) {
        // Blend base to secondary
        return baseAccentColor.clone().lerp(secondaryAccentColor, clampedProgress / 0.6);
    } else {
        // Blend secondary to final
        return secondaryAccentColor.clone().lerp(finalAccentColor, (clampedProgress - 0.6) / 0.4);
    }
}

function updateAnimationForCountdown(progress) {
    if (CONFIG.REDUCED_MOTION || !scene || !nexusCoreMesh || !nexusWireframeMesh || !particlesMesh || !pointLight || !connectionLinesMesh) return;

    const clampedProgress = Math.min(1.1, Math.max(0, progress)); // Allow slightly > 1 for final flash
    const easeProgress = clampedProgress * clampedProgress; // Easing

    const currentNexusColor = getCurrentNexusColor(clampedProgress);

    // --- Nexus Core & Wireframe ---
    const coreMultiplier = 1 + easeProgress * 2.0;
    nexusCoreMesh.userData.rotationSpeed = nexusCoreMesh.userData.baseRotationSpeed * coreMultiplier;
    nexusCoreMesh.userData.pulseFreq = nexusCoreMesh.userData.basePulseFreq * (1 + easeProgress * 1.5);
    nexusCoreMesh.userData.pulseAmp = nexusCoreMesh.userData.basePulseAmp * (1 + easeProgress * 2.0);
    nexusCoreMesh.material.color.copy(currentNexusColor);
    nexusCoreMesh.material.emissive.copy(currentNexusColor);
    nexusCoreMesh.material.emissiveIntensity = THREE.MathUtils.lerp(0.2, 1.5, easeProgress); // Much brighter towards end

    nexusWireframeMesh.userData.rotationSpeed = nexusWireframeMesh.userData.baseRotationSpeed * coreMultiplier;
    nexusWireframeMesh.material.color.copy(currentNexusColor);
    nexusWireframeMesh.material.opacity = THREE.MathUtils.lerp(0.3, 0.7, easeProgress);


    // --- Data Stream Particles ---
    const particleMultiplier = 1 + easeProgress * 3.0;
    particlesMesh.userData.speedMultiplier = particlesMesh.userData.baseSpeedMultiplier * particleMultiplier;
    particlesMesh.material.size = THREE.MathUtils.lerp(0.05, 0.02, easeProgress); // Particles get smaller/faster? Or larger? Test this. Let's try larger.
    particlesMesh.material.size = THREE.MathUtils.lerp(0.05, 0.12, easeProgress);
    particlesMesh.material.opacity = THREE.MathUtils.lerp(0.6, 1.0, easeProgress);

    // --- Connection Lines ---
    // Increase base flash frequency
    connectionLinesMesh.userData.baseFlashFreq = CONFIG.CONNECTION_LINE_FLASH_FREQ * (1 + easeProgress * 5.0);


    // --- Lighting ---
    pointLight.intensity = THREE.MathUtils.lerp(3, 10, easeProgress); // Dramatically increase light
    pointLight.color.copy(currentNexusColor);

    // --- Bloom ---
    if (bloomPass && composer) {
        bloomPass.strength = THREE.MathUtils.lerp(CONFIG.BLOOM_STRENGTH, CONFIG.BLOOM_STRENGTH * 2.5, easeProgress);
        // Optional: Reduce threshold for extreme bloom at the end
        // bloomPass.threshold = THREE.MathUtils.lerp(CONFIG.BLOOM_THRESHOLD, 0.3, easeProgress);
    }

     // --- Final Flash Specifics ---
     if (progress >= 1.05) { // State for the very end flash
          // Maybe enable afterimage pass if using it
          // if (afterimagePass) afterimagePass.enabled = true;
          // Force max bloom / light intensity overrides
          pointLight.intensity = 15;
          nexusCoreMesh.material.emissiveIntensity = 2.0;
          if (bloomPass) bloomPass.strength = CONFIG.BLOOM_STRENGTH * 3.0;
     } else {
          // Ensure afterimage is disabled otherwise
          // if (afterimagePass) afterimagePass.enabled = false;
     }
}


// --- Animation Loop ---
function startAnimationLoop() {
    if (animationFrameId === null && !CONFIG.REDUCED_MOTION && scene && clock && renderer) {
        console.log("Starting animation loop...");
        if (!clock.running) clock.start();
        animationFrameId = requestAnimationFrame(animate);
    }
}

function animate() {
    if (!scene || !clock || !camera || !renderer) {
        animationFrameId = null; return;
    }
    animationFrameId = requestAnimationFrame(animate);
    frameCount++;
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = clock.getDelta();

    // --- Camera ---
    // Auto-rotate scene for constant motion
    if (CONFIG.CAMERA_AUTO_ROTATE && scene) {
        scene.rotation.y += CONFIG.CAMERA_AUTO_ROTATE_SPEED * deltaTime;
    }
    // Slow dolly/zoom effect based on countdown progress (or constant)
    if (!redirectCancelled) { // Only dolly if not cancelled
         camera.position.z += CONFIG.CAMERA_DOLLY_SPEED * deltaTime;
         // Clamp camera Z position if needed
         camera.position.z = Math.max(3, Math.min(CONFIG.CAMERA_Z + 1, camera.position.z));
    }
     // Subtle Mouse Look
    targetX = mouseX * CONFIG.MOUSE_INFLUENCE_FACTOR;
    targetY = -mouseY * CONFIG.MOUSE_INFLUENCE_FACTOR;
    const lookAtTarget = new THREE.Vector3(0, 0, 0); // Look towards origin
    lookAtTarget.x += (targetX - lookAtTarget.x) * 0.05; // Apply smoothed offset
    lookAtTarget.y += (targetY - lookAtTarget.y) * 0.05;
    camera.lookAt(lookAtTarget);


    // --- Nexus Core & Wireframe ---
    if (nexusCoreMesh) {
        const coreRot = nexusCoreMesh.userData.rotationSpeed * deltaTime;
        nexusCoreMesh.rotation.x += coreRot * 0.7;
        nexusCoreMesh.rotation.y += coreRot * 1.0;
        nexusCoreMesh.rotation.z += coreRot * 0.5;
        const corePulseScale = 1 + Math.sin(elapsedTime * nexusCoreMesh.userData.pulseFreq * Math.PI * 2) * nexusCoreMesh.userData.pulseAmp;
        nexusCoreMesh.scale.setScalar(corePulseScale);
    }
    if (nexusWireframeMesh) {
         const wireRot = nexusWireframeMesh.userData.rotationSpeed * deltaTime;
         nexusWireframeMesh.rotation.x += wireRot * 0.6;
         nexusWireframeMesh.rotation.y += wireRot * 1.1;
         nexusWireframeMesh.rotation.z += wireRot * 0.8;
         nexusWireframeMesh.scale.copy(nexusCoreMesh.scale).multiplyScalar(1.01); // Match core scale + offset
    }

    // --- Data Stream Particles ---
    if (particlesMesh && (frameCount % CONFIG.PARTICLE_UPDATE_INTERVAL === 0)) {
        const positions = particlesMesh.geometry.attributes.position.array;
        const velocities = particlesMesh.geometry.attributes.velocity.array;
        const speedMult = particlesMesh.userData.speedMultiplier * deltaTime * 60; // Scale speed by delta
        const coreRadiusSq = 2 * 2; // Reset when particle gets close to core (radius^2)

        for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
            const i3 = i * 3;
            // Update position
            positions[i3] += velocities[i3] * speedMult;
            positions[i3 + 1] += velocities[i3 + 1] * speedMult;
            positions[i3 + 2] += velocities[i3 + 2] * speedMult;

            // Check distance to center
            const distSq = positions[i3]**2 + positions[i3+1]**2 + positions[i3+2]**2;

            // Reset if particle reaches near the core
            if (distSq < coreRadiusSq) {
                const radius = Math.random() * CONFIG.PARTICLE_SPREAD * 0.6 + CONFIG.PARTICLE_SPREAD * 0.4;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos((Math.random() * 2) - 1);
                positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
                positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
                positions[i3 + 2] = radius * Math.cos(phi);

                // Reset velocity towards center
                const speed = Math.random() * 0.1 + 0.05;
                velocities[i3] = -positions[i3] * speed * 0.1;
                velocities[i3 + 1] = -positions[i3 + 1] * speed * 0.1;
                velocities[i3 + 2] = -positions[i3 + 2] * speed * 0.1;
            }
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;
    }

    // --- Connection Lines Animation ---
    if (connectionLinesMesh && connectionLinesMesh.geometry.attributes.opacity) {
        const opacities = connectionLinesMesh.geometry.attributes.opacity.array;
        const flashProgress = connectionLinesMesh.userData.flashProgress;
        const flashFreq = connectionLinesMesh.userData.baseFlashFreq || CONFIG.CONNECTION_LINE_FLASH_FREQ;
        const flashSpeed = 2.0 * deltaTime; // How fast lines fade in/out

        for (let i = 0; i < CONFIG.CONNECTION_LINE_COUNT; i++) {
             // Should this line start flashing?
             if (flashProgress[i] <= 0 && Math.random() < flashFreq * deltaTime) {
                 flashProgress[i] = 0.01; // Start flashing (small positive value)
             }

             // Update flash progress
             if (flashProgress[i] > 0) {
                 flashProgress[i] += flashSpeed;
                 let opacity = 0;
                 if (flashProgress[i] < 1.0) { // Fade In
                      opacity = flashProgress[i];
                 } else if (flashProgress[i] < 2.0) { // Fade Out
                      opacity = 1.0 - (flashProgress[i] - 1.0);
                 } else { // Flash complete
                      flashProgress[i] = 0; // Reset progress
                      opacity = 0;
                 }
                 // Set opacity for both vertices of the line segment
                 opacities[i * 2] = opacity;       // Vertex 1
                 opacities[i * 2 + 1] = opacity;   // Vertex 2
             }
        }
        connectionLinesMesh.geometry.attributes.opacity.needsUpdate = true;
    }


    // --- Render ---
    try {
        if (composer) { // Render via composer if it exists (handles bloom)
            composer.render(deltaTime);
        } else if (renderer) {
            renderer.render(scene, camera);
        }
    } catch (renderError) {
        console.error("Error during rendering:", renderError);
        pauseAnimation();
        handleGlobalError({error: new Error("Rendering failed")});
    }
}

function pauseAnimation() {
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
        if (clock) clock.stop();
        console.log("Nexus Animation Paused");
    }
}

function resumeAnimation() {
    if (animationFrameId === null && !CONFIG.REDUCED_MOTION && scene && clock && renderer) {
        if (!clock.running) clock.start();
        startAnimationLoop();
        console.log("Nexus Animation Resumed");
    }
}

// --- 3D Specific Handlers --- (onWindowResize, onDocumentMouseMove, onDocumentTouchMove, handleVisibilityChange - same as previous)
function onWindowResize() { /* ... */ }
function onDocumentMouseMove(event) { /* ... */ }
function onDocumentTouchMove(event) { /* ... */ }
function handleVisibilityChange() { /* ... */ }

// --- Cleanup --- (Ensure new meshes like nexusWireframeMesh and connectionLinesMesh are disposed)
function cleanup() {
    console.log("Cleaning up Data Nexus resources...");
    isInitialized = false;
    pauseAnimation();

    // Remove event listeners (same as before)
    // ...

    // Clear timeouts/intervals (same as before)
    // ...

    console.log("Disposing Three.js resources...");
    if (scene) {
        scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
                 // Dispose textures if material has map properties
                 ['map', 'emissiveMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'alphaMap'].forEach(prop => {
                    if (object.material[prop]?.dispose) object.material[prop].dispose();
                 });
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        scene.clear();
    }

    if (composer) {
        composer.passes.forEach(pass => { if (pass.dispose) pass.dispose(); });
        composer.renderTarget1?.dispose(); composer.renderTarget2?.dispose();
        composer.writeBuffer?.dispose(); composer.readBuffer?.dispose();
        composer = null;
    }
    bloomPass = null; // afterimagePass = null;

    if (renderer) {
        renderer.dispose(); renderer.forceContextLoss();
        const gl = renderer.domElement?.getContext('webgl');
        if (gl && gl.getExtension('WEBGL_lose_context')) { gl.getExtension('WEBGL_lose_context').loseContext(); }
        renderer.domElement = null; renderer = null;
    }

    scene = null; camera = null; clock = null;
    nexusCoreMesh = null; nexusWireframeMesh = null; particlesMesh = null; connectionLinesMesh = null;
    ambientLight = null; pointLight = null;
    baseAccentColor = null; secondaryAccentColor = null; finalAccentColor = null;

    console.log("Data Nexus Cleanup complete.");
}

// --- End Script ---