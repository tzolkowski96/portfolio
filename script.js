// Import Three.js - Make sure the import map in HTML is correct
import * as THREE from 'three';

// --- Global Variables & Configuration ---
const REDIRECT_URL = 'https://tobin-data-portfolio.netlify.app/';
const REDIRECT_DELAY_SECONDS = 7;
let countdownInterval;
let redirectCancelled = false;
let autoRedirectTimeout; // To store the main redirect timeout

// --- DOM Elements ---
let countdownEl, countdownCircle, countdownProgress, cancelButton, copyButton, copyToast, errorContainer, redirectButton, onlineContent, offlineNotice, retryButton;

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    // Assign DOM elements
    countdownEl = document.getElementById('countdown');
    countdownCircle = document.querySelector('.countdown-circle');
    countdownProgress = document.querySelector('.countdown-progress');
    cancelButton = document.querySelector('.cancel-redirect');
    copyButton = document.querySelector('.copy-btn');
    copyToast = document.getElementById('copy-toast');
    errorContainer = document.getElementById('error-container');
    redirectButton = document.querySelector('.button:not(.button-offline)'); // Main redirect button
    onlineContent = document.getElementById('online-content');
    offlineNotice = document.getElementById('offline-notice');
    retryButton = document.getElementById('retry-button');

    // Add CSS for ripple effect dynamically
    addRippleEffectStyle();

    // Add event listeners
    setupEventListeners();

    // Check initial online status
    handleConnectionChange();

    // Start background animation
    startBackgroundAnimation();

    // Performance Marks
    window.performance.mark('script-end');
    window.performance.measure('script-execution', 'script-start', 'script-end');
    setupPerformanceObserver();
});

// --- Event Listeners Setup ---
function setupEventListeners() {
    // Redirect Cancellation
    if (cancelButton) {
        cancelButton.addEventListener('click', cancelRedirect);
    }

    // Copy URL Button
    if (copyButton) {
        copyButton.addEventListener('click', handleCopyUrl);
    }

    // Manual Redirect Button (Visit Now)
    if (redirectButton) {
        redirectButton.addEventListener('click', () => {
            cancelRedirect(); // Cancel auto-redirect if user clicks manually
            addRippleEffect(redirectButton);
             // Allow default link behavior to redirect
        });
        addRippleEffect(redirectButton); // Add ripple effect to the main button
    }

    // Retry Button (Offline Mode)
    if (retryButton) {
        retryButton.addEventListener('click', () => {
            retryButton.classList.add('active'); // Simple feedback
            setTimeout(() => retryButton.classList.remove('active'), 200);
            window.location.reload();
        });
        addRippleEffect(retryButton); // Add ripple to retry button
    }


    // Keyboard Shortcut (Escape to cancel)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !redirectCancelled && navigator.onLine) {
            cancelRedirect();
        }
    });

    // Network Status Changes
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);

    // Global Error Handling
    window.addEventListener('error', handleGlobalError);
}

// --- Network Status Handling ---
function handleConnectionChange() {
    if (navigator.onLine) {
        showOnlineContent();
        startCountdown();
    } else {
        showOfflineContent();
        stopCountdown(); // Ensure countdown stops if it was running
    }
}

function showOnlineContent() {
    if (offlineNotice) offlineNotice.hidden = true;
    if (onlineContent) onlineContent.hidden = false;
}

function showOfflineContent() {
    if (onlineContent) onlineContent.hidden = true;
    if (offlineNotice) offlineNotice.hidden = false;
}

// --- Countdown Logic ---
function startCountdown() {
    if (redirectCancelled || !navigator.onLine) return; // Don't start if cancelled or offline

    let secondsLeft = REDIRECT_DELAY_SECONDS;
    const circumference = 2 * Math.PI * 54; // From SVG radius

    // Reset UI elements
    if (countdownEl) countdownEl.textContent = secondsLeft;
    if (countdownProgress) {
        countdownProgress.style.strokeDasharray = circumference;
        countdownProgress.style.strokeDashoffset = '0';
    }
     if (countdownCircle && countdownCircle.parentNode) {
        countdownCircle.parentNode.classList.remove('countdown-ending');
    }
     if (cancelButton) cancelButton.style.display = ''; // Show cancel button
     const countdownTextEl = document.querySelector('.countdown-text');
     if(countdownTextEl) countdownTextEl.textContent = `Redirecting in ${secondsLeft} seconds`;


    stopCountdown(); // Clear any existing interval first

    countdownInterval = setInterval(() => {
        if (redirectCancelled) {
            stopCountdown();
            return;
        }

        // Update display
        if (countdownEl) countdownEl.textContent = secondsLeft;
        if (countdownProgress) {
            const progressValue = ((REDIRECT_DELAY_SECONDS - secondsLeft) / REDIRECT_DELAY_SECONDS);
            const dashoffset = circumference * (1 - progressValue);
            countdownProgress.style.strokeDashoffset = dashoffset;
        }
        const srText = document.querySelector('.countdown-text .sr-only');
        if (srText) srText.textContent = secondsLeft;
         const countdownTextEl = document.querySelector('.countdown-text');
         if(countdownTextEl) countdownTextEl.textContent = `Redirecting in ${secondsLeft} seconds`;


        // Add warning style near the end
        if (secondsLeft <= 2 && countdownCircle && countdownCircle.parentNode && !countdownCircle.parentNode.classList.contains('countdown-ending')) {
            countdownCircle.parentNode.classList.add('countdown-ending');
        }

        secondsLeft -= 1;

        // Redirect when time is up
        if (secondsLeft < 0) {
            stopCountdown();
            triggerRedirect();
        }
    }, 1000);

    autoRedirectTimeout = countdownInterval; // Store interval ID for error handling
}

function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    if (autoRedirectTimeout) {
         clearInterval(autoRedirectTimeout);
         autoRedirectTimeout = null;
    }
}

function cancelRedirect() {
    redirectCancelled = true;
    stopCountdown();

    // Update UI to show cancellation
    if (countdownCircle && countdownCircle.parentNode) {
        countdownCircle.parentNode.classList.remove('countdown-ending');
        if (countdownProgress) countdownProgress.style.strokeDashoffset = '0'; // Reset circle
        if (countdownEl) countdownEl.textContent = '✓'; // Checkmark
    }
    const countdownText = document.querySelector('.countdown-text');
    if (countdownText) countdownText.textContent = 'Automatic redirect cancelled';
    if (cancelButton) cancelButton.style.display = 'none'; // Hide cancel button
}

function triggerRedirect() {
    if (redirectCancelled || !navigator.onLine) return;

    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        window.location.href = REDIRECT_URL;
    }, 500);
}

// --- UI Helpers ---

// Copy URL Functionality
function handleCopyUrl() {
    if (copyButton) {
         copyButton.classList.add('active'); // Visual feedback
         setTimeout(() => copyButton.classList.remove('active'), 300);
    }
    const urlToCopy = REDIRECT_URL;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(urlToCopy)
            .then(showCopyToast)
            .catch(err => {
                console.error('Failed to copy URL via Clipboard API: ', err);
                fallbackCopy(urlToCopy); // Try fallback
            });
    } else {
        fallbackCopy(urlToCopy); // Use fallback if API not supported
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showCopyToast();
        } else {
            console.error('Fallback: Could not copy text via execCommand');
             // Optionally show an error toast here
        }
    } catch (err) {
        console.error('Fallback: Error copying text', err);
         // Optionally show an error toast here
    }
    document.body.removeChild(textArea);
}

function showCopyToast() {
    if (copyToast) {
        copyToast.hidden = false;
        setTimeout(() => {
            copyToast.hidden = true;
        }, 2500); // Matches CSS animation duration
    }
}

// Ripple Effect for Buttons
function addRippleEffectStyle() {
    const style = document.createElement('style');
    // CSS is now included directly in the style.css file
    // style.textContent = `...`; // Removed CSS content
    document.head.appendChild(style);
}

function addRippleEffect(button) {
    if (!button) return;
    button.addEventListener('click', function(e) {
        // Prevent multiple ripples quickly
        if (button.querySelector('.ripple')) return;

        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple');

        // Append ripple and remove after animation
        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600); // Corresponds to animation duration
    });
}


// --- Error Handling ---
function handleGlobalError(event) {
    console.error('Page Error:', event.error);
    stopCountdown(); // Stop redirect on error
    if (errorContainer) {
        errorContainer.hidden = false;
        errorContainer.innerHTML = `
            <p>Sorry, an error occurred. The automatic redirect has been stopped. You can still use the button below.</p>
            <button onclick="window.location.href='${REDIRECT_URL}'" class="button button-offline">
                Visit New Portfolio Manually
            </button>
        `;
         addRippleEffect(errorContainer.querySelector('.button')); // Add ripple to this button too
    }
}

// --- Performance Monitoring ---
function setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (['first-paint', 'first-contentful-paint', 'largest-contentful-paint'].includes(entry.name)) {
                    console.log(`Performance - ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
                }
            }
        });
        try {
            observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
        } catch (e) {
            console.warn("Performance Observer failed:", e);
        }
    }
}


// --- Background Animation (Three.js) ---
function startBackgroundAnimation() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || !THREE) {
        console.error("Canvas element #bg-canvas not found or Three.js not loaded.");
        return;
    }

    // Basic setup
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
        precision: 'mediump'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    const secondLight = new THREE.DirectionalLight(0xffffff, 0.5);
    secondLight.position.set(-5, 3, -5);
    scene.add(secondLight);

    // Get theme colors dynamically
    const computedStyle = getComputedStyle(document.body);
    const accentColorString = computedStyle.getPropertyValue('--accent-color').trim();
    const accentColor = accentColorString || (window.matchMedia('(prefers-color-scheme: dark)').matches ? '#3b82f6' : '#0d6efd');

    // Create colors for variety
    const accentColorThree = new THREE.Color(accentColor);
    const secondaryColor = new THREE.Color(accentColor).offsetHSL(0.1, 0, 0);
    const tertiaryColor = new THREE.Color(accentColor).offsetHSL(-0.1, 0, 0);

    // Primary Shape
    const geometry = new THREE.IcosahedronGeometry(1.5, 1);
    const material = new THREE.MeshPhysicalMaterial({
        color: accentColorThree,
        metalness: 0.4, roughness: 0.5, reflectivity: 0.5,
        clearcoat: 0.3, clearcoatRoughness: 0.2, flatShading: true
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Wireframe Overlay
    const wireframe = new THREE.LineSegments(
        new THREE.WireframeGeometry(geometry),
        new THREE.LineBasicMaterial({
            color: new THREE.Color(accentColor).offsetHSL(0, 0, 0.2),
            transparent: true, opacity: 0.3
        })
    );
    mesh.add(wireframe);

    // Secondary shapes
    const shapes = [];
    const torusKnot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.5, 0.15, 64, 8, 2, 3),
        new THREE.MeshPhysicalMaterial({ color: secondaryColor, metalness: 0.7, roughness: 0.3 })
    );
    torusKnot.position.set(3, 0, 0);
    torusKnot.scale.setScalar(0.6);
    scene.add(torusKnot);
    shapes.push(torusKnot);

    const dodecahedron = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.7, 0),
        new THREE.MeshPhysicalMaterial({ color: tertiaryColor, metalness: 0.5, roughness: 0.5, flatShading: true })
    );
    dodecahedron.position.set(-3, -1, 1);
    dodecahedron.scale.setScalar(0.5);
    scene.add(dodecahedron);
    shapes.push(dodecahedron);

    const octahedron = new THREE.Mesh(
         new THREE.OctahedronGeometry(0.6, 0),
         new THREE.MeshPhysicalMaterial({ color: new THREE.Color(accentColor).offsetHSL(0.2, 0, 0), metalness: 0.3, roughness: 0.7, flatShading: true})
    );
     octahedron.position.set(0, 2.5, -1);
     octahedron.scale.setScalar(0.6);
     scene.add(octahedron);
     shapes.push(octahedron);


    // Small scattered shapes
    const smallMeshes = [];
    for (let i = 0; i < 10; i++) {
        const smallMesh = new THREE.Mesh(
            new THREE.TetrahedronGeometry(0.3, 0),
            new THREE.MeshStandardMaterial({
                color: new THREE.Color(accentColor).offsetHSL(i * 0.1, 0, 0),
                metalness: 0.5, roughness: 0.4, flatShading: true,
                transparent: true, opacity: 0.7
            })
        );
        smallMesh.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10);
        smallMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        smallMesh.scale.setScalar(0.3 + Math.random() * 0.7);
        smallMeshes.push(smallMesh);
        scene.add(smallMesh);
    }

    // Particle System
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 400;
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);
    const color = new THREE.Color();

    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        posArray[i3] = (Math.random() - 0.5) * 20;
        posArray[i3 + 1] = (Math.random() - 0.5) * 20;
        posArray[i3 + 2] = (Math.random() - 0.5) * 20;

        color.copy(accentColorThree).offsetHSL((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.4);
        colorsArray[i3] = color.r;
        colorsArray[i3 + 1] = color.g;
        colorsArray[i3 + 2] = color.b;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.03, vertexColors: true, transparent: true,
        opacity: 0.6, blending: THREE.AdditiveBlending, sizeAttenuation: true
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Mouse movement effect
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    function onDocumentMouseMove(event) {
        mouseX = (event.clientX - windowHalfX) / 150;
        mouseY = (event.clientY - windowHalfY) / 150;
    }
     function onDocumentTouchMove( event ) {
        if ( event.touches.length === 1 ) {
            event.preventDefault(); // Prevent page scroll
            mouseX = ( event.touches[ 0 ].pageX - windowHalfX ) / 150;
            mouseY = ( event.touches[ 0 ].pageY - windowHalfY ) / 150;
        }
    }

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.addEventListener('mousemove', onDocumentMouseMove);
        document.addEventListener( 'touchmove', onDocumentTouchMove, { passive: false } ); // Use passive: false if preventDefault is needed
    }

    // Animation loop
    const clock = new THREE.Clock();
    let lastTime = 0;

    const animate = () => {
        const elapsedTime = clock.getElapsedTime();
        const deltaTime = elapsedTime - lastTime;
        lastTime = elapsedTime;

        // Main mesh animation
        mesh.rotation.y = 0.1 * elapsedTime;
        mesh.rotation.x = 0.05 * elapsedTime;
        targetX = mouseX * 0.5; // Reduced effect
        targetY = mouseY * 0.5; // Reduced effect
         // Smoother interpolation
        mesh.rotation.y += (targetX - mesh.rotation.y) * 0.05;
        mesh.rotation.x += (targetY - mesh.rotation.x) * 0.05;

        const pulseScale = 1 + Math.sin(elapsedTime) * 0.05;
        mesh.scale.setScalar(pulseScale);

        // Secondary shapes animation
        shapes.forEach((shape, i) => {
            const orbit = 1.5 + i * 0.5;
            shape.position.x = Math.sin(elapsedTime * (0.2 + i * 0.1)) * orbit;
            shape.position.z = Math.cos(elapsedTime * (0.2 + i * 0.1)) * orbit;
            shape.position.y = Math.sin(elapsedTime * (0.3 + i * 0.05)) * orbit * 0.5;
            shape.rotation.x = elapsedTime * (0.2 + i * 0.1);
            shape.rotation.y = elapsedTime * (0.3 + i * 0.1);
        });

        // Small meshes animation
        smallMeshes.forEach((sMesh, i) => {
             sMesh.rotation.x = 0.3 * elapsedTime + i;
             sMesh.rotation.y = 0.2 * elapsedTime + i;
             sMesh.position.y += Math.sin(elapsedTime * 0.5 + i * Math.PI) * 0.008;
             sMesh.position.x += Math.cos(elapsedTime * 0.3 + i) * 0.005;
             if (sMesh.material.transparent) {
                sMesh.material.opacity = 0.4 + Math.sin(elapsedTime * 2 + i) * 0.2;
             }
        });


        // Particle animation
        particlesMesh.rotation.y = -0.02 * elapsedTime;
        // Subtle wave effect - simplified
        const positions = particlesMesh.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) { // Affect y-position
             positions[i] += Math.sin(elapsedTime + positions[i-1]) * 0.0005; // Much smaller wave effect
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;


        // Render
        renderer.render(scene, camera);
        window.requestAnimationFrame(animate);
    };

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // Start animation
    animate();

     // Pause animation when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clock.stop();
        } else {
            // Check if clock was stopped before restarting
            if (!clock.running) {
                 clock.start();
            }
        }
    });
}
// --- End Background Animation ---