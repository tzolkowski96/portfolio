// Import Three.js - Make sure the import map in HTML is correct
import * as THREE from 'three';

// --- Global Variables & Configuration ---
const REDIRECT_URL = 'https://tobin-data-portfolio.netlify.app/';
const REDIRECT_DELAY_SECONDS = 7;
let countdownInterval;
let redirectCancelled = false;
let autoRedirectTimeout; // To store the main redirect timeout
let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- DOM Elements ---
let countdownEl, countdownCircle, countdownProgress, cancelButton, copyButton, copyToast, errorContainer, redirectButton, onlineContent, offlineNotice, retryButton, countdownTextEl, copyIconDefault, copyIconSuccess;

// --- Three.js Variables ---
let scene, camera, renderer, mainMesh, particlesMesh, clock, ambientLight, pointLight, directionalLight;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;
let animationFrameId; // To store requestAnimationFrame ID

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded");
    assignDOMElements();
    addRippleEffectStyle(); // Ensure ripple CSS is available
    setupEventListeners();
    handleConnectionChange(); // Check initial state and start countdown/offline mode

    if (!prefersReducedMotion) {
        try {
            startBackgroundAnimation();
        } catch (error) {
            console.error("Failed to initialize 3D background:", error);
            // Optionally hide canvas or show fallback
            const canvas = document.getElementById('bg-canvas');
            if (canvas) canvas.style.display = 'none';
        }
    } else {
         const canvas = document.getElementById('bg-canvas');
         if (canvas) canvas.style.display = 'none';
         console.log("Reduced motion preferred. Skipping 3D animation.");
    }

    // Performance Marks
    window.performance.mark('script-end');
    try {
        window.performance.measure('script-execution', 'script-start', 'script-end');
        setupPerformanceObserver();
    } catch (e) {
        console.warn("Performance measurement failed:", e);
    }
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
    redirectButton = document.querySelector('.button:not(.button-offline)'); // Main redirect button
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
    // Redirect Cancellation
    if (cancelButton) {
        cancelButton.addEventListener('click', cancelRedirect);
    } else { console.warn("Cancel button not found"); }

    // Copy URL Button
    if (copyButton) {
        copyButton.addEventListener('click', handleCopyUrl);
    } else { console.warn("Copy button not found"); }

    // Manual Redirect Button (Visit Now)
    if (redirectButton) {
        redirectButton.addEventListener('click', (e) => {
            // Don't prevent default, let the link work
            cancelRedirect(); // Cancel auto-redirect if user clicks manually
            addRippleEffect(e.currentTarget, e); // Add ripple effect to the main button
        });
         // AddRippleEffect now called onClick for better coordinates
    } else { console.warn("Redirect button not found"); }

    // Retry Button (Offline Mode)
    if (retryButton) {
        retryButton.addEventListener('click', (e) => {
            e.currentTarget.classList.add('active'); // Simple feedback
            addRippleEffect(e.currentTarget, e);
            setTimeout(() => e.currentTarget.classList.remove('active'), 300);
            setTimeout(() => window.location.reload(), 350); // Reload after ripple
        });
        // AddRippleEffect now called onClick
    } else { console.warn("Retry button not found"); }


    // Keyboard Shortcut (Escape to cancel)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !redirectCancelled && navigator.onLine && onlineContent && !onlineContent.hidden) {
            cancelRedirect();
        }
    });

    // Network Status Changes
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);

    // Global Error Handling
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', (event) => {
         console.error('Unhandled Promise Rejection:', event.reason);
         // Optional: show error boundary for promise rejections too
         // handleGlobalError({ error: event.reason });
    });

     // Window Resize for 3D
     window.addEventListener('resize', onWindowResize);

     // Mouse/Touch Move for 3D Interaction
     if (!prefersReducedMotion) {
        document.addEventListener('mousemove', onDocumentMouseMove);
        document.addEventListener('touchmove', onDocumentTouchMove, { passive: false }); // Use passive: false if preventDefault is needed
     }

      // Pause animation when tab is hidden
     document.addEventListener('visibilitychange', handleVisibilityChange);
}

// --- Network Status Handling ---
function handleConnectionChange() {
    const isOnline = navigator.onLine;
    console.log("Connection status changed:", isOnline ? "Online" : "Offline");
    if (isOnline) {
        showOnlineContent();
        if (!redirectCancelled) { // Only start if not previously cancelled
             startCountdown();
        }
        if (animationFrameId === undefined && !prefersReducedMotion) { // Resume animation if paused and not reduced motion
            resumeAnimation();
        }
    } else {
        showOfflineContent();
        stopCountdown(); // Ensure countdown stops if it was running
        pauseAnimation(); // Pause animation when offline
    }
}

function showOnlineContent() {
    if (offlineNotice) offlineNotice.hidden = true;
    if (onlineContent) onlineContent.hidden = false;
    // Ensure correct elements are visible if redirect was cancelled and then connection restored
    if (redirectCancelled && cancelButton) cancelButton.style.display = 'none';

}

function showOfflineContent() {
    if (onlineContent) onlineContent.hidden = true;
    if (offlineNotice) offlineNotice.hidden = false;
}

// --- Countdown Logic ---
function startCountdown() {
    if (redirectCancelled || !navigator.onLine || countdownInterval) return; // Don't start if cancelled, offline, or already running

    console.log("Starting countdown");
    let secondsLeft = REDIRECT_DELAY_SECONDS;
    const circumference = countdownProgress ? parseFloat(getComputedStyle(countdownProgress).getPropertyValue('stroke-dasharray')) : 339.3;

    // Reset UI elements
    if (countdownEl) countdownEl.textContent = secondsLeft;
    if (countdownProgress) {
        countdownProgress.style.strokeDasharray = circumference;
        countdownProgress.style.strokeDashoffset = '0'; // Start full
        countdownProgress.style.transition = 'stroke-dashoffset 1s linear, stroke 0.3s ease'; // Ensure transition is set
    }
    if (countdownCircle) {
        countdownCircle.classList.remove('countdown-ending');
    }
    if (cancelButton) cancelButton.style.display = 'inline-block'; // Show cancel button
    if (countdownTextEl) {
        const srSpan = countdownTextEl.querySelector('.sr-only');
        if (srSpan) srSpan.textContent = secondsLeft;
        countdownTextEl.textContent = `Redirecting you in ${secondsLeft} seconds...`;
        // Re-insert sr-only span if needed
         if (!countdownTextEl.querySelector('.sr-only')) {
            const newSrSpan = document.createElement('span');
            newSrSpan.className = 'sr-only';
            newSrSpan.textContent = secondsLeft;
            countdownTextEl.textContent = 'Redirecting you in ';
            countdownTextEl.appendChild(newSrSpan);
            countdownTextEl.appendChild(document.createTextNode(' seconds...'));
         }
    }


    stopCountdown(); // Clear any existing interval first

    countdownInterval = setInterval(() => {
        secondsLeft -= 1;

        if (redirectCancelled) {
            stopCountdown();
            return;
        }

        // Update display
        if (countdownEl) countdownEl.textContent = secondsLeft;
        if (countdownProgress) {
             // Calculate progress (0 -> 1 as time passes)
            const progressValue = (REDIRECT_DELAY_SECONDS - secondsLeft) / REDIRECT_DELAY_SECONDS;
            // Offset goes from circumference to 0
            const dashoffset = circumference * (1 - progressValue);
            // Apply offset smoothly only if not 0 to avoid initial jump
            countdownProgress.style.strokeDashoffset = dashoffset;
        }

        if (countdownTextEl) {
            const srSpan = countdownTextEl.querySelector('.sr-only');
            if (srSpan) srSpan.textContent = secondsLeft;
             countdownTextEl.firstChild.textContent = `Redirecting you in ${secondsLeft} seconds...`;
        }


        // Add warning style near the end
        if (secondsLeft <= 2 && countdownCircle && !countdownCircle.classList.contains('countdown-ending')) {
            countdownCircle.classList.add('countdown-ending');
        }

        // Update 3D animation based on countdown progress
        if (!prefersReducedMotion && mainMesh) {
             const progress = (REDIRECT_DELAY_SECONDS - secondsLeft) / REDIRECT_DELAY_SECONDS;
             updateAnimationForCountdown(progress);
        }


        // Redirect when time is up
        if (secondsLeft < 0) {
            stopCountdown();
            triggerRedirect();
        }
    }, 1000);

    // Initial offset setting (start full) - move it here to ensure it happens after interval setup
     if (countdownProgress) {
        countdownProgress.style.strokeDashoffset = circumference;
        // Trigger reflow to apply initial state before transition starts
        void countdownProgress.offsetWidth;
        // Now set the first step's offset (or keep it 0 if starting immediately)
        const initialProgress = (REDIRECT_DELAY_SECONDS - secondsLeft) / REDIRECT_DELAY_SECONDS;
        countdownProgress.style.strokeDashoffset = circumference * (1 - initialProgress);

     }


    autoRedirectTimeout = countdownInterval; // Store interval ID for error handling/cancellation
}

function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
        console.log("Countdown interval cleared");
    }
    // Reset animation speed if stopped prematurely
    if (!prefersReducedMotion && mainMesh) {
        updateAnimationForCountdown(0); // Reset to base speed/state
    }

}

function cancelRedirect() {
    if (redirectCancelled) return; // Prevent multiple cancellations
    console.log("Redirect cancelled by user");
    redirectCancelled = true;
    stopCountdown();

    // Update UI to show cancellation
    if (countdownCircle) {
        countdownCircle.classList.remove('countdown-ending');
        if (countdownProgress) {
             // Keep the progress where it stopped or reset visually
             // Resetting might look cleaner:
             // const circumference = parseFloat(getComputedStyle(countdownProgress).getPropertyValue('stroke-dasharray'));
             // countdownProgress.style.strokeDashoffset = circumference;
              countdownProgress.style.transition = 'none'; // Prevent animation on manual reset
              countdownProgress.style.strokeDashoffset = getComputedStyle(countdownProgress).strokeDashoffset; // Freeze
        }
        if (countdownEl) {
             countdownEl.textContent = '✓'; // Checkmark
             countdownEl.style.transform = 'scale(1.1)';
             setTimeout(()=> {if (countdownEl) countdownEl.style.transform = 'scale(1)';}, 200);
        }
    }
    if (countdownTextEl) countdownTextEl.textContent = 'Automatic redirect cancelled.';
    if (cancelButton) cancelButton.style.display = 'none'; // Hide cancel button

}

function triggerRedirect() {
    if (redirectCancelled || !navigator.onLine) {
        console.log("Redirect aborted (cancelled or offline).");
        return;
    }
    console.log("Triggering redirect to:", REDIRECT_URL);

    document.body.style.transition = 'opacity 0.5s ease-out';
    document.body.style.opacity = '0';

    // Pause animation just before redirecting
    pauseAnimation();

    setTimeout(() => {
        window.location.href = REDIRECT_URL;
    }, 500); // Wait for fade out
}

// --- UI Helpers ---

// Copy URL Functionality
function handleCopyUrl() {
    if (!copyButton) return;
    const urlToCopy = REDIRECT_URL;

     // Visual feedback
     copyButton.classList.add('copied');
     if (copyIconDefault) copyIconDefault.style.display = 'none';
     if (copyIconSuccess) copyIconSuccess.style.display = 'inline-block';


    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(urlToCopy)
            .then(() => {
                console.log("URL copied via Clipboard API");
                showCopyToast();
            })
            .catch(err => {
                console.error('Failed to copy URL via Clipboard API: ', err);
                fallbackCopy(urlToCopy); // Try fallback
            })
            .finally(() => {
                // Reset icon after a delay
                setTimeout(() => {
                    if (copyButton) copyButton.classList.remove('copied');
                    if (copyIconDefault) copyIconDefault.style.display = 'inline-block';
                    if (copyIconSuccess) copyIconSuccess.style.display = 'none';
                }, 2000);
            });
    } else {
        console.log("Using fallback copy method");
        fallbackCopy(urlToCopy);
         // Reset icon after a delay for fallback too
        setTimeout(() => {
             if (copyButton) copyButton.classList.remove('copied');
             if (copyIconDefault) copyIconDefault.style.display = 'inline-block';
             if (copyIconSuccess) copyIconSuccess.style.display = 'none';
        }, 2000);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed'; // Make it invisible
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            console.log("URL copied via fallback execCommand");
            showCopyToast();
        } else {
            console.error('Fallback: Could not copy text via execCommand');
            // Optionally show an error toast here
            showCopyToast("Failed to copy", true);
        }
    } catch (err) {
        console.error('Fallback: Error copying text', err);
         // Optionally show an error toast here
         showCopyToast("Error copying", true);
    }
    document.body.removeChild(textArea);
}

function showCopyToast(message = "URL copied to clipboard!", isError = false) {
    if (copyToast) {
        copyToast.textContent = message;
        copyToast.hidden = false;
        copyToast.style.backgroundColor = isError ? 'var(--offline-notice-bg-color)' : 'var(--card-bg-color)';
        copyToast.style.color = isError ? 'var(--offline-accent-color)' : 'var(--text-color)';
        copyToast.style.animation = 'none'; // Reset animation
        void copyToast.offsetWidth; // Trigger reflow
        copyToast.style.animation = `toast-in-out 3s var(--transition-bezier) forwards`;

        // Clear any existing timer
        if (copyToast.timer) clearTimeout(copyToast.timer);

        copyToast.timer = setTimeout(() => {
            copyToast.hidden = true;
            copyToast.timer = null;
        }, 3000); // Matches CSS animation duration
    }
}

// Ripple Effect for Buttons
function addRippleEffectStyle() {
    // CSS is now assumed to be in style.css, this function is just a placeholder
    // If needed, you could inject minimal critical CSS here.
    console.log("Ripple effect styles assumed loaded from CSS.");
}

function addRippleEffect(button, event) {
    if (!button || !event) return;

    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    // Calculate click position relative to the button
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    // Use max dimension for size to ensure it covers the button
    const size = Math.max(rect.width, rect.height);

    ripple.style.width = ripple.style.height = `${size}px`;
    // Position ripple center at click location
    ripple.style.left = `${x - size / 2}px`;
    ripple.style.top = `${y - size / 2}px`;
    ripple.classList.add('ripple');

    // Append ripple
    // Ensure ripple stays contained if button has hidden overflow
    button.style.position = 'relative'; // Needed for absolute positioning of ripple
    button.style.overflow = 'hidden'; // Clip the ripple
    button.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => ripple.remove(), 600); // Corresponds to CSS animation duration
}


// --- Error Handling ---
function handleGlobalError(event) {
    const error = event.error || event.reason || event; // Handle different event types
    console.error('Unhandled Page Error:', error);
    stopCountdown(); // Stop redirect on error

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
                 setTimeout(()=> window.location.href = REDIRECT_URL, 100);
            };
             // AddRippleEffect now called onClick
        }
    }
}

// --- Performance Monitoring ---
function setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    // Log key performance metrics
                    if (['first-paint', 'first-contentful-paint', 'largest-contentful-paint'].includes(entry.name)) {
                        console.log(`Performance - ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
                    }
                    // Log script execution time if measured
                    if(entry.entryType === 'measure' && entry.name === 'script-execution') {
                        console.log(`Performance - Script Execution Time: ${entry.duration.toFixed(2)}ms`);
                    }
                }
            });
            observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'measure'] });
        } catch (e) {
            console.warn("Performance Observer setup failed:", e);
        }
    }
}


// --- Background Animation (Three.js) ---

function getAccentColor() {
    // Ensure DOM is ready and styles are computed
    const computedStyle = getComputedStyle(document.body);
    const accentColorString = computedStyle.getPropertyValue('--accent-color').trim();
    // Provide a fallback if CSS variable is somehow not available
    return accentColorString || (window.matchMedia('(prefers-color-scheme: dark)').matches ? '#5dade2' : '#3498db');
}

function startBackgroundAnimation() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') {
        console.error("Canvas element #bg-canvas not found or Three.js not loaded.");
        if(canvas) canvas.style.display = 'none';
        return;
    }
     console.log("Starting 3D background animation");

    // Basic setup
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true, // Transparent background
        antialias: true,
        powerPreference: 'high-performance',
        precision: 'mediump' // Balance quality and performance
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    // Lighting
    ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Slightly increased ambient
    scene.add(ambientLight);
    pointLight = new THREE.PointLight(0xffffff, 1.0, 100); // Increased intensity
    pointLight.position.set(5, 8, 5); // Adjusted position
    scene.add(pointLight);
    directionalLight = new THREE.DirectionalLight(0xffffff, 0.6); // Added directional
    directionalLight.position.set(-5, 3, -5);
    scene.add(directionalLight);


    // Get theme colors dynamically
    const accentColor = getAccentColor();
    const accentColorThree = new THREE.Color(accentColor);

    // Primary Shape (Icosahedron) - Refined Material
    const geometry = new THREE.IcosahedronGeometry(1.6, 1); // Slightly larger, more detail?
    const material = new THREE.MeshPhysicalMaterial({
        color: accentColorThree,
        metalness: 0.3, // Less metallic
        roughness: 0.4, // Smoother surface
        reflectivity: 0.6,
        clearcoat: 0.5, // More pronounced clearcoat
        clearcoatRoughness: 0.1, // Smoother clearcoat
        flatShading: false // Use smooth shading
    });
    mainMesh = new THREE.Mesh(geometry, material);
    scene.add(mainMesh);

    // --- Removed secondary shapes for simplicity and performance ---
    // If needed, add them back here similar to the original code.
    // const shapes = [];
    // Add torus knot, dodecahedron, etc.

    // Particle System - Enhanced
    const particlesCount = 500; // More particles
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);
    const particleSizes = new Float32Array(particlesCount); // For varied sizes
    const particleColor = new THREE.Color();

    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        posArray[i3] = (Math.random() - 0.5) * 25; // Wider spread
        posArray[i3 + 1] = (Math.random() - 0.5) * 25;
        posArray[i3 + 2] = (Math.random() - 0.5) * 25;

        // Vary color more subtly around accent
        particleColor.copy(accentColorThree).offsetHSL((Math.random() - 0.5) * 0.1, 0, (Math.random() - 0.5) * 0.3);
        colorsArray[i3] = particleColor.r;
        colorsArray[i3 + 1] = particleColor.g;
        colorsArray[i3 + 2] = particleColor.b;

        particleSizes[i] = Math.random() * 0.05 + 0.02; // Vary size
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1)); // Use custom size attribute

    const particlesMaterial = new THREE.PointsMaterial({
        // size: 0.03, // Size now controlled by attribute
        vertexColors: true,
        transparent: true,
        opacity: 0.7, // Slightly more visible
        blending: THREE.AdditiveBlending, // Brighter overlaps
        sizeAttenuation: true,
        depthWrite: false // Prevent particles obscuring each other strangely
    });
    particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Animation loop setup
    clock = new THREE.Clock();
    animate();
}

// Update 3D animation based on countdown progress (0 to 1)
function updateAnimationForCountdown(progress) {
     if (!mainMesh || !particlesMesh || !clock) return;

     const baseRotationSpeed = 0.1;
     const basePulseFreq = 1;
     const baseParticleSpeed = 0.02;

     // Increase speed/intensity as progress nears 1
     const multiplier = 1 + progress * 1.5; // Scale up effect towards the end

     // Update main mesh rotation speed
     mainMesh.userData.rotationSpeed = baseRotationSpeed * multiplier;
     mainMesh.userData.pulseFreq = basePulseFreq * multiplier;

     // Update particle speed (can be used in animate loop)
     particlesMesh.userData.speedMultiplier = baseParticleSpeed * multiplier;

}

// Animation loop
let lastTime = 0;
function animate() {
    if (prefersReducedMotion || !clock || !scene || !camera || !renderer) return; // Exit if paused or not initialized

    animationFrameId = requestAnimationFrame(animate); // Store the ID

    const elapsedTime = clock.getElapsedTime();
    // Optional: use delta time for frame-rate independent animation
    // const deltaTime = elapsedTime - lastTime;
    // lastTime = elapsedTime;

    // Target mouse position with smoother interpolation
    targetX = mouseX * 0.01; // Reduced sensitivity
    targetY = mouseY * 0.01;

    // Apply interpolated rotation to camera or scene group instead of mesh directly
    // camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05; // Example: Move camera slightly
    // camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;
    // camera.lookAt(scene.position); // Make sure camera looks at the center

    // Simpler: Rotate the whole scene slightly
    scene.rotation.y += (targetX - scene.rotation.y) * 0.05;
    scene.rotation.x += (targetY - scene.rotation.x) * 0.05;


    // Main mesh animation using userData for speed control
    const rotationSpeed = mainMesh.userData.rotationSpeed || 0.1;
    const pulseFreq = mainMesh.userData.pulseFreq || 1;
    mainMesh.rotation.y = rotationSpeed * elapsedTime * 2; // Faster base rotation
    mainMesh.rotation.x = rotationSpeed * elapsedTime;
    const pulseScale = 1 + Math.sin(elapsedTime * pulseFreq * Math.PI * 2) * 0.03; // More frequent pulse
    mainMesh.scale.setScalar(pulseScale);


    // Particle animation
    const particleSpeed = particlesMesh.userData.speedMultiplier || 0.02;
    particlesMesh.rotation.y = -particleSpeed * elapsedTime;

    // Subtle particle movement (optional, can be performance intensive)
    const positions = particlesMesh.geometry.attributes.position.array;
    const initialPositions = particlesMesh.geometry.attributes.position.initialArray; // Need to store initial positions if doing complex movement

    for (let i = 0; i < positions.length; i += 3) {
         // Example: Gentle drift + return to origin over time (needs storing initial pos)
         // Or simpler: Subtle sine wave offset based on position & time
         positions[i+1] += Math.sin(elapsedTime * 0.5 + positions[i] * 0.1) * 0.002 * (1 + particleSpeed / 0.02); // Subtle vertical wave, affected by speed
    }
    particlesMesh.geometry.attributes.position.needsUpdate = true;


    // Render
    renderer.render(scene, camera);
}


function pauseAnimation() {
     if (animationFrameId) {
         cancelAnimationFrame(animationFrameId);
         animationFrameId = undefined; // Indicate paused state
         if (clock) clock.stop();
         console.log("3D Animation Paused");
     }
 }

 function resumeAnimation() {
     if (!animationFrameId && !prefersReducedMotion && clock) { // Only resume if paused
         clock.start(); // Restart the clock
         lastTime = clock.getElapsedTime(); // Reset delta time reference
         animate(); // Restart the loop
         console.log("3D Animation Resumed");
     }
 }

// Handle window resize
function onWindowResize() {
    if (!camera || !renderer) return;
    console.log("Window resized");
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

// Mouse/Touch move handlers
function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
}
function onDocumentTouchMove(event) {
    if (event.touches.length === 1) {
        // event.preventDefault(); // Only preventDefault if it interferes with desired behavior (like page scroll)
        mouseX = (event.touches[0].pageX - windowHalfX);
        mouseY = (event.touches[0].pageY - windowHalfY);
    }
}

// Handle tab visibility
function handleVisibilityChange() {
    if (!prefersReducedMotion) {
        if (document.hidden) {
            pauseAnimation();
        } else {
            resumeAnimation();
        }
    }
}

// --- End Background Animation ---