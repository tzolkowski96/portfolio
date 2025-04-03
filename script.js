import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// --- Configuration ---
const CONFIG = {
    REDIRECT_URL: 'https://tobin-data-portfolio.netlify.app/',
    REDIRECT_DELAY_SECONDS: 10,
    REDUCED_MOTION: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    // 3D Settings
    ENABLE_BLOOM: true,
    BLOOM_STRENGTH: 0.35, // Slightly reduced for better performance
    BLOOM_RADIUS: 0.3,
    BLOOM_THRESHOLD: 0.85,
    MAIN_SHAPE_ROTATION_SPEED: 0.1,
    MAIN_SHAPE_PULSE_FREQ: 1.0,
    PARTICLE_COUNT: window.innerWidth < 768 ? 300 : 500, // Reduce particles on mobile
    PARTICLE_SPEED_MULTIPLIER: 0.02,
    CAMERA_Z: 5,
    // Loading timeout to prevent indefinite loading
    LOADING_TIMEOUT_MS: 8000,
    // Performance
    RESIZE_DEBOUNCE_MS: 150,
    COPY_SUCCESS_DELAY_MS: 2000,
    REDIRECT_FADE_MS: 500,
    // Keyboard shortcuts enable/disable
    ENABLE_KEYBOARD_SHORTCUTS: true,
};

// --- Global Variables ---
let countdownInterval;
let redirectCancelled = false;
let autoRedirectTimeout;
let resizeTimeout;
let animationFrameId;
let resourcesLoaded = false;
let loadingTimeout;
let shortcutsModalVisible = false;

// --- DOM Elements ---
let countdownEl, countdownCircle, countdownProgress, cancelButton, copyButton, copyToast, 
    errorContainer, redirectButton, onlineContent, offlineNotice, retryButton, countdownTextEl, 
    copyIconDefault, copyIconSuccess, manualRedirectButton, mainCard, loadingOverlay,
    keyboardShortcutsModal, closeModalBtn;

// --- Three.js Variables ---
let scene, camera, renderer, mainMesh, particlesMesh, clock, ambientLight, pointLight, directionalLight;
let composer, bloomPass;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Reduced Motion:", CONFIG.REDUCED_MOTION);
    assignDOMElements();
    setupEventListeners();
    handleConnectionChange();
    
    // Dynamically add keyboard shortcut button
    createKeyboardShortcutButton();
    
    // Set a loading timeout to prevent indefinite loading
    loadingTimeout = setTimeout(() => {
        if (!resourcesLoaded) {
            hideLoading();
            console.warn("Loading timeout reached. Proceeding with limited functionality.");
            // Show a subtle notification about limited visual effects
            showNotification("Some visual effects may be limited", true);
        }
    }, CONFIG.LOADING_TIMEOUT_MS);
    
    // Initialize Three.js in a non-blocking way
    if (!CONFIG.REDUCED_MOTION) {
        setTimeout(() => {
            initializeThreeJS();
        }, 100);
    } else {
        // Skip 3D initialization for reduced motion
        if (loadingOverlay) {
            hideLoading();
        }
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
    redirectButton = document.querySelector('.button:not(.button-offline)');
    manualRedirectButton = document.getElementById('manual-redirect-button');
    onlineContent = document.getElementById('online-content');
    offlineNotice = document.getElementById('offline-notice');
    retryButton = document.getElementById('retry-button');
    countdownTextEl = document.getElementById('countdown-text');
    copyIconDefault = document.getElementById('copy-icon-default');
    copyIconSuccess = document.getElementById('copy-icon-success');
    mainCard = document.getElementById('main-card');
    loadingOverlay = document.getElementById('loading-overlay');
    keyboardShortcutsModal = document.getElementById('keyboard-shortcuts-modal');
    closeModalBtn = document.getElementById('close-modal-btn');
}

// --- Loading Management ---
function hideLoading() {
    if (!loadingOverlay) return;
    
    loadingOverlay.style.opacity = '0';
    loadingOverlay.style.visibility = 'hidden';
    clearTimeout(loadingTimeout);
    
    // Start countdown when loading completes
    if (!redirectCancelled && navigator.onLine) {
        startCountdown();
    }
}

function initializeThreeJS() {
    try {
        initThreeJS();
        startAnimationLoop();
        resourcesLoaded = true;
        hideLoading();
    } catch (error) {
        console.error("Failed to initialize 3D background:", error);
        const canvas = document.getElementById('bg-canvas');
        if (canvas) canvas.style.display = 'none';
        hideLoading(); // Make sure loading overlay is hidden even on error
        showNotification("3D background couldn't be loaded", true);
    }
}

// --- Create Keyboard Shortcut Button ---
function createKeyboardShortcutButton() {
    if (!CONFIG.ENABLE_KEYBOARD_SHORTCUTS) return;
    
    const button = document.createElement('button');
    button.classList.add('keyboard-info-btn');
    button.setAttribute('aria-label', 'Show keyboard shortcuts');
    button.textContent = '?';
    
    button.addEventListener('click', toggleKeyboardShortcutsModal);
    
    document.body.appendChild(button);
}

// --- Keyboard Shortcuts Modal ---
function toggleKeyboardShortcutsModal() {
    if (!keyboardShortcutsModal) return;
    
    if (shortcutsModalVisible) {
        keyboardShortcutsModal.classList.remove('visible');
        shortcutsModalVisible = false;
        keyboardShortcutsModal.setAttribute('hidden', '');
    } else {
        keyboardShortcutsModal.removeAttribute('hidden');
        // Force reflow
        void keyboardShortcutsModal.offsetWidth;
        keyboardShortcutsModal.classList.add('visible');
        shortcutsModalVisible = true;
        
        // Focus the close button
        if (closeModalBtn) {
            setTimeout(() => closeModalBtn.focus(), 100);
        }
    }
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
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', toggleKeyboardShortcutsModal);
    }
    if (keyboardShortcutsModal) {
        keyboardShortcutsModal.addEventListener('click', (e) => {
            if (e.target === keyboardShortcutsModal) {
                toggleKeyboardShortcutsModal();
            }
        });
    }

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', (event) => handleGlobalError({ error: event.reason }));
    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Mouse/Touch Move for 3D Interaction
    if (!CONFIG.REDUCED_MOTION) {
        document.addEventListener('mousemove', onDocumentMouseMove);
        document.addEventListener('touchmove', onDocumentTouchMove, { passive: false });
    }

    // Add parallax effect for desktop
    if (mainCard && !CONFIG.REDUCED_MOTION && window.innerWidth > 768) {
        document.addEventListener('mousemove', handleCardParallax);
    }

    // Add passive scroll event listener for better performance
    document.addEventListener('scroll', handleScroll, { passive: true });

    // Preload destination site for faster redirect
    setTimeout(() => {
        preloadDestination();
    }, 2000); // Wait 2 seconds before preloading

    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);
}

// --- Keyboard Handler ---
function handleKeyDown(event) {
    // Cancel redirect with Escape key
    if (event.key === 'Escape') {
        if (shortcutsModalVisible) {
            toggleKeyboardShortcutsModal();
        } else if (!redirectCancelled && navigator.onLine && onlineContent && !onlineContent.hidden) {
            cancelRedirect();
        }
    }
    
    // Only process shortcuts if they're enabled and no modifiers are pressed
    if (!CONFIG.ENABLE_KEYBOARD_SHORTCUTS || event.ctrlKey || event.altKey || event.metaKey) return;
    
    // Handle keyboard shortcuts
    switch(event.key.toLowerCase()) {
        case 'enter':
            // Trigger manual redirect if not in an input
            if (document.activeElement.tagName !== 'INPUT' && 
                document.activeElement.tagName !== 'TEXTAREA' && 
                document.activeElement.tagName !== 'SELECT') {
                if (manualRedirectButton) {
                    manualRedirectButton.click();
                }
            }
            break;
        case 'c':
            // Copy URL with C key
            if (document.activeElement.tagName !== 'INPUT' && 
                document.activeElement.tagName !== 'TEXTAREA') {
                handleCopyUrl();
            }
            break;
        case '?':
            // Toggle shortcuts modal
            toggleKeyboardShortcutsModal();
            break;
    }
}

// --- Helper Functions ---

// Show notification toast
function showNotification(message, isWarning = false) {
    if (!copyToast) return;
    
    copyToast.textContent = message;
    copyToast.hidden = false;
    copyToast.style.backgroundColor = isWarning ? 'var(--offline-notice-bg-color)' : 'var(--card-bg-color)';
    copyToast.style.color = isWarning ? 'var(--offline-accent-color)' : 'var(--text-color)';
    
    // Reset animation
    copyToast.style.opacity = '0';
    copyToast.style.transform = 'translate(-50%, 30px)';
    
    // Force reflow
    void copyToast.offsetWidth;
    
    // Show the toast
    copyToast.classList.add('visible');

    if (copyToast.timer) clearTimeout(copyToast.timer);
    copyToast.timer = setTimeout(() => {
        copyToast.classList.remove('visible');
        setTimeout(() => {
            copyToast.hidden = true;
            copyToast.timer = null;
        }, 400); // Wait for fade out
    }, CONFIG.COPY_SUCCESS_DELAY_MS);
}

// --- Enhanced 3D Background ---
function getAccentColor() {
    const computedStyle = getComputedStyle(document.body);
    return computedStyle.getPropertyValue('--accent-color').trim() || '#3498db';
}

function initThreeJS() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') throw new Error("Canvas or THREE missing");

    console.log("Initializing Three.js");

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = CONFIG.CAMERA_Z;

    // Improve performance by setting appropriate pixel ratio based on device
    const devicePixelRatio = window.devicePixelRatio || 1;
    const limitedPixelRatio = Math.min(devicePixelRatio, window.innerWidth < 768 ? 1.5 : 2);

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas, 
        alpha: true, 
        antialias: window.innerWidth > 768, // Only use antialiasing on larger screens
        powerPreference: 'high-performance', 
        precision: 'mediump'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(limitedPixelRatio);

    // Lighting
    ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    pointLight = new THREE.PointLight(0xffffff, 1.2, 100);
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
    });
    mainMesh = new THREE.Mesh(geometry, material);
    mainMesh.userData.baseRotationSpeed = CONFIG.MAIN_SHAPE_ROTATION_SPEED;
    mainMesh.userData.basePulseFreq = CONFIG.MAIN_SHAPE_PULSE_FREQ;
    scene.add(mainMesh);

    // Add bloom highlight to edges for better visibility
    if (mainMesh && CONFIG.ENABLE_BLOOM) {
        const edgesGeometry = new THREE.EdgesGeometry(mainMesh.geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ 
            color: accentColorThree,
            transparent: true,
            opacity: 0.6,
            linewidth: 1
        });
        const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
        mainMesh.add(edges);
    }

    // Particle System
    createParticles(accentColorThree);

    // Post-processing (Bloom)
    if (CONFIG.ENABLE_BLOOM && !CONFIG.REDUCED_MOTION) {
        setupPostProcessing();
    }

    // Enhanced lighting
    pointLight.castShadow = true;
    pointLight.intensity = 1.3;
    
    const accentLight = new THREE.PointLight(accentColorThree, 0.5, 50);
    accentLight.position.set(-5, -3, 3);
    scene.add(accentLight);

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
        size: 0.04,
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

// --- Add the rest of the original functions here ---
function startAnimationLoop() {
    if (animationFrameId || CONFIG.REDUCED_MOTION || !scene) return;
    console.log("Starting animation loop");
    animate();
}

function animate() {
    if (!scene || !clock) return;

    animationFrameId = requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    targetX = mouseX * 0.00005;
    targetY = mouseY * 0.00005;

    if(scene) {
        scene.rotation.y += (targetX - scene.rotation.y) * 0.05;
        scene.rotation.x += (targetY - scene.rotation.x) * 0.05;
    }

    if (mainMesh) {
        const rotSpeed = mainMesh.userData.rotationSpeed || mainMesh.userData.baseRotationSpeed;
        const pulseFreq = mainMesh.userData.pulseFreq || mainMesh.userData.basePulseFreq;
        mainMesh.rotation.y = rotSpeed * elapsedTime * 2;
        mainMesh.rotation.x = rotSpeed * elapsedTime;
        const pulseScale = 1 + Math.sin(elapsedTime * pulseFreq * Math.PI * 2) * 0.03;
        mainMesh.scale.setScalar(pulseScale);
        if (pointLight) pointLight.intensity = 1.2 + (pulseScale - 1) * 10;
    }

    if (particlesMesh) {
        const speedMult = particlesMesh.userData.speedMultiplier || particlesMesh.userData.baseSpeedMultiplier;
        particlesMesh.rotation.y = -speedMult * elapsedTime * 0.5;
        particlesMesh.rotation.x = speedMult * elapsedTime * 0.2;

        const positions = particlesMesh.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] += Math.sin(elapsedTime * 0.4 + positions[i - 1] * 0.1) * 0.0015 * (1 + speedMult / 0.02);
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;
    }

    if (composer && CONFIG.ENABLE_BLOOM && !CONFIG.REDUCED_MOTION) {
        composer.render();
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
    if (!animationFrameId && !CONFIG.REDUCED_MOTION && clock && scene) {
        clock.start();
        startAnimationLoop();
        console.log("3D Animation Resumed");
    }
}

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

    if (composer) {
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
        const canvas = document.getElementById('bg-canvas');
        const touch = event.touches[0];
        const rect = canvas.getBoundingClientRect();
        
        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
            event.preventDefault();
        }
        
        mouseX = (touch.pageX - windowHalfX) * 0.5;
        mouseY = (touch.pageY - windowHalfY) * 0.5;
        
        let momentum = 0.92;
        mouseX = mouseX * momentum + mouseX * (1 - momentum);
        mouseY = mouseY * momentum + mouseY * (1 - momentum);
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

function cleanup() {
    console.log("Cleaning up resources...");
    pauseAnimation();

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
    document.removeEventListener('mousemove', handleCardParallax);
    document.removeEventListener('mouseleave', resetCardTransform);
    document.removeEventListener('scroll', handleScroll);

    if (scene) {
        scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
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
        renderer.forceContextLoss();
        renderer = null;
    }
    if (composer) {
        composer = null;
    }

    stopCountdown();
    clearTimeout(autoRedirectTimeout);
    clearTimeout(resizeTimeout);

    console.log("Cleanup complete.");
}