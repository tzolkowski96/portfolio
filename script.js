import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'; // For thicker/dashed lines if needed
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Line2 } from 'three/addons/lines/Line2.js';

// --- Configuration ---
const CONFIG = {
    REDIRECT_URL: 'https://tobin-data-portfolio.netlify.app/', // *** YOUR NEW URL ***
    REDIRECT_DELAY_SECONDS: 8, // Shorter, professional delay
    REDUCED_MOTION: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    // 3D Settings - Professional "Portfolio Core" Theme
    ENABLE_BLOOM: true,
    BLOOM_STRENGTH: 0.35, // Subtle bloom
    BLOOM_RADIUS: 0.8,   // Wider, softer radius
    BLOOM_THRESHOLD: 0.85, // Bloom only brighter areas
    CORE_GEOMETRY: 'Dodecahedron', // 'Icosahedron' or 'Dodecahedron'
    CORE_ROTATION_SPEED: 0.05,
    CORE_PULSE_FREQ: 0.3,
    CORE_PULSE_AMP: 0.02, // Very subtle pulse
    PARTICLE_COUNT: 600, // Fewer, more refined particles
    PARTICLE_TYPE: 'Points', // 'Points' or 'Lines' for trails
    PARTICLE_SPEED_MULTIPLIER: 0.4,
    PARTICLE_SPREAD: 20,
    CONNECTION_LINE_COUNT: 20, // Fewer connection lines
    CONNECTION_LINE_FLASH_FREQ: 0.05, // Less frequent flashing
    CAMERA_Z: 6,
    CAMERA_AUTO_ROTATE: true,
    CAMERA_AUTO_ROTATE_SPEED: 0.02, // Slower rotation
    CAMERA_DOLLY_SPEED: 0, // No dolly zoom for cleaner look
    MOUSE_INFLUENCE_FACTOR: 0.00005, // Very subtle mouse influence
    // Performance & Timing
    RESIZE_DEBOUNCE_MS: 150,
    COPY_SUCCESS_DELAY_MS: 1800, // Slightly faster toast
    REDIRECT_FADE_MS: 500,    // Standard fade
    PARTICLE_UPDATE_INTERVAL: 2, // Update less frequently for performance
    FINAL_PULSE_DURATION: 200, // Quick stabilization pulse
};

// --- Global Variables ---
let countdownInterval = null;
let redirectCancelled = false;
let autoRedirectTimeout = null;
let resizeTimeout = null;
let animationFrameId = null;
let frameCount = 0;
let isInitialized = false;
let finalPulseActive = false;

// --- DOM Elements --- (Ensure these are correctly assigned)
let countdownEl, countdownCircle, countdownProgress, cancelButton, copyButton, copyToast, errorContainer, onlineContent, offlineNotice, retryButton, countdownTextEl, copyIconDefault, copyIconSuccess, manualRedirectButton, canvas;

// --- Three.js Variables ---
let scene, camera, renderer, portfolioCoreMesh, particlesObject, connectionLinesMesh, clock, ambientLight, pointLight;
let composer, bloomPass;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let baseAccentColor = new THREE.Color();
let secondaryAccentColor = new THREE.Color(); // Maybe white or bright blue

// --- Initialize ---
document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
    if (isInitialized) return;
    isInitialized = true;
    console.log("DOM Loaded. Initializing Portfolio Redirect. Reduced Motion:", CONFIG.REDUCED_MOTION);

    if (!assignDOMElements()) {
        console.error("Initialization failed: Critical DOM elements missing.");
        document.body.innerHTML = '<p style="color: red; padding: 2em;">Error: Page structure incomplete. Cannot initialize.</p>';
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
            handleGlobalError({error: new Error("3D background failed to load.")});
        }
    } else {
        if (canvas) canvas.style.display = 'none';
        document.body.classList.add('reduced-motion');
        console.log("Reduced motion enabled. Skipping 3D animation.");
    }

    setupPerformanceMonitoring();
    console.log("App Initialization Complete.");
}

// --- DOM Element Assignment --- (Same as previous, ensure checks)
function assignDOMElements() { /* ... same robust checks ... */ return true; }

// --- Event Listeners Setup --- (Same as previous)
function setupEventListeners() { /* ... */ }

// --- Debounced Resize Handler --- (Same as previous)
function handleResize() { /* ... */ }

// --- Keyboard Handler --- (Same as previous)
function handleKeyDown(event) { /* ... */ }

// --- Network Status Handling --- (Same as previous)
function handleConnectionChange() { /* ... */ }
function showOnlineContent() { /* ... */ }
function showOfflineContent() { /* ... */ }

// --- Countdown Logic ---
function startCountdown() {
    if (countdownInterval || redirectCancelled || !navigator.onLine || !countdownEl || !countdownProgress || !countdownCircle) return;
    console.log("Starting redirect countdown...");

    let secondsLeft = CONFIG.REDIRECT_DELAY_SECONDS;
    const totalSeconds = CONFIG.REDIRECT_DELAY_SECONDS;
    const circumference = 339.3; // Fixed value is fine if SVG is fixed

    // Reset UI
    countdownEl.textContent = secondsLeft;
    countdownProgress.style.transition = 'none';
    countdownProgress.style.strokeDashoffset = circumference;
    void countdownProgress.offsetWidth;
    countdownProgress.style.transition = `stroke-dashoffset 1s linear, stroke ${CONFIG.transition_speed}s ease`;
    countdownProgress.style.stroke = baseAccentColor.getStyle(); // Set initial color

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

        // Update countdown progress color smoothly
        const currentCoreColor = getCurrentCoreColor(progress);
        countdownProgress.style.stroke = currentCoreColor.getStyle();

        if (secondsLeft <= 2 && secondsLeft >= 0) { // Subtle indication near end
            countdownCircle.classList.add('countdown-ending');
        } else {
            countdownCircle.classList.remove('countdown-ending');
        }

        // Update 3D animation
         if (!CONFIG.REDUCED_MOTION) updateAnimationForCountdown(progress);

        // Redirect
        if (secondsLeft < 0) {
            stopCountdown();
            triggerRedirect();
        }
    }, 1000);
    autoRedirectTimeout = countdownInterval;
}

function stopCountdown() { /* ... same ... */ }
function updateCountdownText(seconds) {
    if (!countdownTextEl) return;
    if (redirectCancelled) {
       countdownTextEl.textContent = 'Redirect cancelled. Use button below.';
    } else if (seconds >= 0) {
       countdownTextEl.textContent = `Redirecting in ${seconds} seconds...`;
       const srSpan = countdownTextEl.querySelector('.sr-only'); if(srSpan) srSpan.textContent = seconds;
    } else {
       countdownTextEl.textContent = 'Redirecting now...';
    }
}
function cancelRedirect() {
    if (redirectCancelled) return;
    console.log("Redirect cancelled.");
    redirectCancelled = true;
    stopCountdown();
    if (countdownCircle) countdownCircle.classList.add('countdown-cancelled');
    if (countdownEl) countdownEl.textContent = '-';
    updateCountdownText(-1);
    if (cancelButton) cancelButton.style.display = 'none';
    if (countdownProgress) countdownProgress.style.stroke = 'var(--cancelled-stroke-color)';
    if (manualRedirectButton) {
        manualRedirectButton.classList.add('highlight-manual');
        manualRedirectButton.focus({ preventScroll: true });
        // Remove highlight after a bit (CSS could also handle this)
        setTimeout(() => manualRedirectButton?.classList.remove('highlight-manual'), 2000);
    }
    if (!CONFIG.REDUCED_MOTION) updateAnimationForCountdown(0); // Reset 3D
}

function triggerRedirect() {
    if (redirectCancelled || !navigator.onLine || finalPulseActive) return;
    console.log("Finalizing redirect...");
    finalPulseActive = true;
    stopCountdown();

    // Trigger final visual pulse
    if (!CONFIG.REDUCED_MOTION && scene) {
        updateAnimationForCountdown(1.1); // Trigger final state
        // No body flash class, just rely on 3D pulse
    }

    // Short delay for the pulse effect
    setTimeout(() => {
        document.body.style.transition = `opacity ${CONFIG.REDIRECT_FADE_MS / 1000}s ease-out`;
        document.body.style.opacity = '0';
        pauseAnimation();

        // Redirect after fade out
        setTimeout(() => {
            window.location.href = CONFIG.REDIRECT_URL;
        }, CONFIG.REDIRECT_FADE_MS);

    }, CONFIG.FINAL_PULSE_DURATION);
}


// --- UI Helpers --- (handleCopyUrl, fallbackCopy, showCopyToast, addRippleEffect - Same as previous)
function handleCopyUrl(event) { /* ... */ }
function fallbackCopy(text) { /* ... */ }
function showCopyToast(message = "URL copied!", isError = false) { /* ... Use professional accent colors */ }
function addRippleEffect(button, event) { /* ... */ }


// --- Error Handling --- (Same robust handling as previous)
function handleGlobalError(event) { /* ... */ }
function handlePromiseRejection(event) { /* ... */ }

// --- Performance Monitoring --- (Same as previous)
function setupPerformanceMonitoring() { /* ... */ }


// --- Background Animation (Three.js) --- Portfolio Core ---

function getCssVariable(varName, fallback = null) { /* ... same ... */ }

function initThreeJS() {
    if (!canvas || typeof THREE === 'undefined') throw new Error("Canvas or THREE missing");
    console.log("Initializing Professional 3D Scene...");

    // Colors
    const accent1 = getCssVariable('--accent-color', '#2563eb');
    const accent2 = getCssVariable('--accent-secondary-color', '#ffffff'); // White or light gray
    baseAccentColor.set(accent1);
    secondaryAccentColor.set(accent2);

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000); // Slightly narrower FOV
    camera.position.z = CONFIG.CAMERA_Z;

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Lighting (Softer)
    ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Brighter ambient
    scene.add(ambientLight);
    pointLight = new THREE.PointLight(0xffffff, 0.5, 50, 1.5); // White point light, less intense
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4); // Soft directional
    directionalLight.position.set(-5, 3, 2);
    scene.add(directionalLight);


    // --- Portfolio Core ---
    let coreGeom;
    if (CONFIG.CORE_GEOMETRY === 'Icosahedron') {
         coreGeom = new THREE.IcosahedronGeometry(1.8, 1); // Detail level 1
    } else { // Default to Dodecahedron
         coreGeom = new THREE.DodecahedronGeometry(1.8, 0); // Detail level 0 (clean faces)
    }
    const coreMaterial = new THREE.MeshStandardMaterial({
        color: baseAccentColor,
        metalness: 0.2, // Less metallic
        roughness: 0.7, // More matte
        emissive: baseAccentColor, emissiveIntensity: 0.1, // Subtle emissive
        flatShading: false,
    });
    portfolioCoreMesh = new THREE.Mesh(coreGeom, coreMaterial);
    portfolioCoreMesh.userData = {
        baseRotationSpeed: CONFIG.CORE_ROTATION_SPEED, basePulseFreq: CONFIG.CORE_PULSE_FREQ, basePulseAmp: CONFIG.CORE_PULSE_AMP,
        rotationSpeed: CONFIG.CORE_ROTATION_SPEED, pulseFreq: CONFIG.CORE_PULSE_FREQ, pulseAmp: CONFIG.CORE_PULSE_AMP,
    };
    scene.add(portfolioCoreMesh);

    // --- Data Flow Particles/Lines ---
    if (CONFIG.PARTICLE_TYPE === 'Lines') {
         createParticleLines(baseAccentColor);
    } else {
        createDataPoints(baseAccentColor);
    }


     // --- Connection Lines (Optional, keep very subtle) ---
     createConnectionLines(); // Re-use previous function, adjusted parameters

    // Post-processing (Subtle Bloom)
    if (CONFIG.ENABLE_BLOOM) setupPostProcessing();

    // Clock
    clock = new THREE.Clock();
    console.log("Professional 3D Scene Initialized.");
}

function createDataPoints(initialColor) {
    const particlesCount = CONFIG.PARTICLE_COUNT;
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCount * 3);
    // Store target position and interpolation factor per particle
    const targetArray = new Float32Array(particlesCount * 3);
    const progressArray = new Float32Array(particlesCount); // T for lerp
    const colorArray = new Float32Array(particlesCount * 3);
    const particleColor = new THREE.Color();
    const spread = CONFIG.PARTICLE_SPREAD;

    for (let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        // Initial random position
        posArray[i3] = (Math.random() - 0.5) * spread * 2;
        posArray[i3 + 1] = (Math.random() - 0.5) * spread * 2;
        posArray[i3 + 2] = (Math.random() - 0.5) * spread * 2;

        // Assign initial target (will be updated) & progress
        targetArray[i3] = posArray[i3]; targetArray[i3+1] = posArray[i3+1]; targetArray[i3+2] = posArray[i3+2];
        progressArray[i] = 1; // Start at target initially

        // Color variation (more subtle)
        particleColor.copy(initialColor).offsetHSL(0, Math.random() * 0.1 - 0.05, Math.random() * 0.2 - 0.1);
        colorArray[i3] = particleColor.r; colorArray[i3+1] = particleColor.g; colorArray[i3+2] = particleColor.b;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('target', new THREE.BufferAttribute(targetArray, 3));
    particlesGeometry.setAttribute('progress', new THREE.BufferAttribute(progressArray, 1));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.08, // Slightly larger, less dense points
        vertexColors: true, transparent: true, opacity: 0.7,
        blending: THREE.NormalBlending, // Less intense blending
        sizeAttenuation: true, depthWrite: false
    });
    particlesObject = new THREE.Points(particlesGeometry, particlesMaterial);
    particlesObject.userData = { baseSpeedMultiplier: CONFIG.PARTICLE_SPEED_MULTIPLIER, speedMultiplier: CONFIG.PARTICLE_SPEED_MULTIPLIER };
    scene.add(particlesObject);
}


// Optional: Alternative particle creation using lines for trails
function createParticleLines(initialColor) {
    const particlesCount = CONFIG.PARTICLE_COUNT;
    const points = []; // Each particle needs 2 points (start, end)
    const colors = [];
    const progressArray = new Float32Array(particlesCount); // Progress for length/fade
    const velocityArray = new Float32Array(particlesCount * 3);
    const particleColor = initialColor.clone();
    const spread = CONFIG.PARTICLE_SPREAD;
    const trailLength = 0.5; // Length of the line trail

    for (let i = 0; i < particlesCount; i++) {
         // Initial random position for the *head* of the trail
        const headX = (Math.random() - 0.5) * spread * 1.5;
        const headY = (Math.random() - 0.5) * spread * 1.5;
        const headZ = (Math.random() - 0.5) * spread * 1.5;

        // Velocity towards origin (or slightly offset)
        const targetPoint = new THREE.Vector3( (Math.random()-0.5)*2, (Math.random()-0.5)*2, (Math.random()-0.5)*2 ); // Target near center
        const velocity = targetPoint.sub(new THREE.Vector3(headX, headY, headZ)).normalize().multiplyScalar(0.1 + Math.random() * 0.1);
        velocityArray.set([velocity.x, velocity.y, velocity.z], i * 3);

        // Calculate tail position based on velocity and trailLength
        const tailX = headX - velocity.x * trailLength;
        const tailY = headY - velocity.y * trailLength;
        const tailZ = headZ - velocity.z * trailLength;

        // Add tail point then head point
        points.push(tailX, tailY, tailZ);
        points.push(headX, headY, headZ);

        // Add colors (same for both ends, maybe fade alpha later)
        colors.push(particleColor.r, particleColor.g, particleColor.b);
        colors.push(particleColor.r, particleColor.g, particleColor.b);

        progressArray[i] = Math.random(); // Random start progress
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    lineGeometry.setAttribute('progress', new THREE.BufferAttribute(progressArray, 1));
    lineGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocityArray, 3)); // Store velocity

    const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.5, // Base opacity
        blending: THREE.AdditiveBlending, // Keep some glow
        depthWrite: false,
        // linewidth: 1 // Often ignored
    });

    particlesObject = new THREE.LineSegments(lineGeometry, lineMaterial); // Use LineSegments
    particlesObject.userData = { baseSpeedMultiplier: CONFIG.PARTICLE_SPEED_MULTIPLIER, speedMultiplier: CONFIG.PARTICLE_SPEED_MULTIPLIER };
    scene.add(particlesObject);
}


function createConnectionLines() {
    // Keep this subtle for professional look
    const lineCount = CONFIG.CONNECTION_LINE_COUNT;
    if (lineCount <= 0) return; // Skip if count is zero

    const points = []; const colors = []; const opacities = [];
    const spread = CONFIG.PARTICLE_SPREAD * 0.6; // Smaller spread
    const color1 = baseAccentColor.clone();
    const color2 = secondaryAccentColor.clone(); // Use white/light gray

    for (let i = 0; i < lineCount; i++) {
        const isCoreConnection = Math.random() > 0.7; // Some lines connect to core vicinity
        const startRadius = isCoreConnection ? 2.0 : (Math.random() * spread * 0.5 + spread * 0.5);
        const endRadius = Math.random() * spread * 0.5 + spread * 0.5;

        const theta1 = Math.random() * Math.PI * 2;
        const phi1 = Math.acos((Math.random() * 2) - 1);
        const x1 = startRadius * Math.sin(phi1) * Math.cos(theta1);
        const y1 = startRadius * Math.sin(phi1) * Math.sin(theta1);
        const z1 = startRadius * Math.cos(phi1);
        points.push(x1, y1, z1);

        const theta2 = theta1 + (Math.random() - 0.5) * Math.PI * 0.8;
        const phi2 = phi1 + (Math.random() - 0.5) * Math.PI * 0.8;
        const x2 = endRadius * Math.sin(phi2) * Math.cos(theta2);
        const y2 = endRadius * Math.sin(phi2) * Math.sin(theta2);
        const z2 = endRadius * Math.cos(phi2);
        points.push(x2, y2, z2);

        // Use accent color mostly, occasionally secondary
        const lineColor = Math.random() > 0.8 ? color2 : color1;
        colors.push(lineColor.r, lineColor.g, lineColor.b, lineColor.r, lineColor.g, lineColor.b);
        opacities.push(0, 0); // Start hidden
    }

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    lineGeometry.setAttribute('opacity', new THREE.Float32BufferAttribute(opacities, 1));

    // Simpler material for subtle lines
    const lineMaterial = new THREE.ShaderMaterial({
        // Same shaders as before, but adjust fragment shader alpha
        vertexShader: `...`, // (Same as Nexus version)
        fragmentShader: `
            varying vec3 vColor; varying float vOpacity;
            void main() {
                 if (vOpacity <= 0.0) discard;
                 gl_FragColor = vec4(vColor, vOpacity * 0.4); // Lower max opacity
            }
        `,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, vertexColors: true,
    });

    connectionLinesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    connectionLinesMesh.userData = { flashProgress: new Array(lineCount).fill(0) };
    scene.add(connectionLinesMesh);
}

function setupPostProcessing() { // Keep bloom subtle
    if (!renderer || !scene || !camera) return;
    console.log("Setting up subtle post-processing...");
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), CONFIG.BLOOM_STRENGTH, CONFIG.BLOOM_RADIUS, CONFIG.BLOOM_THRESHOLD);
    composer.addPass(bloomPass);
}

// --- Animation Update Logic ---

// Helper for core color interpolation
function getCurrentCoreColor(progress) {
    const clampedProgress = Math.min(1, Math.max(0, progress));
    // Simple lerp from base to secondary (white/light gray)
    return baseAccentColor.clone().lerp(secondaryAccentColor, clampedProgress * 0.7); // Only partial lerp
}

function updateAnimationForCountdown(progress) {
    if (CONFIG.REDUCED_MOTION || !scene || !portfolioCoreMesh || !particlesObject ) return;

    const clampedProgress = Math.min(1.1, Math.max(0, progress)); // Allow > 1 for final pulse
    const easeProgress = 1 - Math.pow(1 - clampedProgress, 3); // EaseOutCubic

    const currentCoreColor = getCurrentCoreColor(clampedProgress);

    // --- Portfolio Core ---
    const coreMultiplier = 1 + easeProgress * 0.5; // Less drastic speed increase
    portfolioCoreMesh.userData.rotationSpeed = portfolioCoreMesh.userData.baseRotationSpeed * coreMultiplier;
    portfolioCoreMesh.userData.pulseFreq = portfolioCoreMesh.userData.basePulseFreq * (1 + easeProgress * 0.5);
    portfolioCoreMesh.userData.pulseAmp = portfolioCoreMesh.userData.basePulseAmp * (1 + easeProgress * 1.0); // Subtle pulse increase
    portfolioCoreMesh.material.color.copy(currentCoreColor);
    portfolioCoreMesh.material.emissive.copy(currentCoreColor);
    portfolioCoreMesh.material.emissiveIntensity = THREE.MathUtils.lerp(0.1, 0.6, easeProgress); // Controlled brightness


    // --- Particles ---
    const particleMultiplier = 1 + easeProgress * 1.0; // Modest speed increase
    particlesObject.userData.speedMultiplier = particlesObject.userData.baseSpeedMultiplier * particleMultiplier;
    // particlesObject.material.opacity = THREE.MathUtils.lerp(0.7, 0.9, easeProgress); // Optional opacity change


    // --- Connection Lines --- (Increase flash frequency slightly)
    if (connectionLinesMesh) {
         connectionLinesMesh.userData.baseFlashFreq = CONFIG.CONNECTION_LINE_FLASH_FREQ * (1 + easeProgress * 2.0);
    }

    // --- Lighting ---
    if(pointLight) pointLight.intensity = THREE.MathUtils.lerp(0.5, 1.0, easeProgress); // Gentle light increase

    // --- Bloom ---
    if (bloomPass && composer) {
        bloomPass.strength = THREE.MathUtils.lerp(CONFIG.BLOOM_STRENGTH, CONFIG.BLOOM_STRENGTH * 1.5, easeProgress); // Very subtle increase
    }

     // --- Final Pulse State ---
     if (progress >= 1.05) {
          portfolioCoreMesh.material.emissiveIntensity = 1.0; // Bright but not extreme
          if(pointLight) pointLight.intensity = 1.5;
          if (bloomPass) bloomPass.strength = CONFIG.BLOOM_STRENGTH * 2.0;
     }
}


// --- Animation Loop ---
function startAnimationLoop() { /* ... same ... */ }

function animate() {
    if (!scene || !clock || !camera || !renderer) { animationFrameId = null; return; }
    animationFrameId = requestAnimationFrame(animate);
    frameCount++;
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = clock.getDelta();

    // --- Camera ---
    if (CONFIG.CAMERA_AUTO_ROTATE && scene) {
        scene.rotation.y += CONFIG.CAMERA_AUTO_ROTATE_SPEED * deltaTime;
    }
    if (CONFIG.CAMERA_DOLLY_SPEED !== 0 && !redirectCancelled) {
         camera.position.z += CONFIG.CAMERA_DOLLY_SPEED * deltaTime;
         // Add clamps if needed
    }
    // Mouse Look (Subtle)
    targetX = mouseX * CONFIG.MOUSE_INFLUENCE_FACTOR;
    targetY = -mouseY * CONFIG.MOUSE_INFLUENCE_FACTOR;
    const lookAtTarget = new THREE.Vector3(0, 0, 0);
    lookAtTarget.x += (targetX - lookAtTarget.x) * 0.05;
    lookAtTarget.y += (targetY - lookAtTarget.y) * 0.05;
    camera.lookAt(lookAtTarget);


    // --- Portfolio Core ---
    if (portfolioCoreMesh) {
        const coreRot = portfolioCoreMesh.userData.rotationSpeed * deltaTime;
        portfolioCoreMesh.rotation.x += coreRot * 0.4;
        portfolioCoreMesh.rotation.y += coreRot * 0.6;
        portfolioCoreMesh.rotation.z += coreRot * 0.2;
        const corePulseScale = 1 + Math.sin(elapsedTime * portfolioCoreMesh.userData.pulseFreq * Math.PI * 2) * portfolioCoreMesh.userData.pulseAmp;
        portfolioCoreMesh.scale.setScalar(corePulseScale);
    }

    // --- Particle Animation ---
    if (particlesObject && (frameCount % CONFIG.PARTICLE_UPDATE_INTERVAL === 0)) {
        if (CONFIG.PARTICLE_TYPE === 'Lines') {
             animateParticleLines(deltaTime);
        } else {
             animateDataPoints(deltaTime);
        }
    }


    // --- Connection Lines Animation --- (Subtle)
    if (connectionLinesMesh && connectionLinesMesh.geometry.attributes.opacity) {
        // ... (Same flashing logic as Nexus version, but base freq & flashSpeed might be lower in CONFIG)
        const opacities = connectionLinesMesh.geometry.attributes.opacity.array;
        const flashProgress = connectionLinesMesh.userData.flashProgress;
        const flashFreq = connectionLinesMesh.userData.baseFlashFreq || CONFIG.CONNECTION_LINE_FLASH_FREQ;
        const flashSpeed = 1.5 * deltaTime; // Slower fade

        for (let i = 0; i < CONFIG.CONNECTION_LINE_COUNT; i++) {
             if (flashProgress[i] <= 0 && Math.random() < flashFreq * deltaTime) { flashProgress[i] = 0.01; }
             if (flashProgress[i] > 0) {
                 flashProgress[i] += flashSpeed;
                 let opacity = 0;
                 if (flashProgress[i] < 1.0) { opacity = flashProgress[i]; }
                 else if (flashProgress[i] < 2.0) { opacity = 1.0 - (flashProgress[i] - 1.0); }
                 else { flashProgress[i] = 0; }
                 opacities[i * 2] = opacity; opacities[i * 2 + 1] = opacity;
             }
        }
        connectionLinesMesh.geometry.attributes.opacity.needsUpdate = true;
    }


    // --- Render ---
    try {
        if (composer) composer.render(deltaTime);
        else if (renderer) renderer.render(scene, camera);
    } catch (renderError) {
        console.error("Render error:", renderError); pauseAnimation(); handleGlobalError({error: new Error("Render failed")});
    }
}

// Specific animation logic for data points
function animateDataPoints(deltaTime) {
    const positions = particlesObject.geometry.attributes.position.array;
    const targets = particlesObject.geometry.attributes.target.array;
    const progressAttr = particlesObject.geometry.attributes.progress;
    const progresses = progressAttr.array;
    const speedMult = particlesObject.userData.speedMultiplier * deltaTime; // Adjusted speed
    const resetThreshold = 0.98; // When to pick a new target

    for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        progresses[i] += speedMult * (0.5 + Math.random() * 0.5); // Add some randomness to speed

        if (progresses[i] >= resetThreshold) {
            // Current position becomes new start
            positions[i3] = targets[i3];
            positions[i3 + 1] = targets[i3 + 1];
            positions[i3 + 2] = targets[i3 + 2];

            // Pick new random target
            const spread = CONFIG.PARTICLE_SPREAD;
            targets[i3] = (Math.random() - 0.5) * spread * 1.5;
            targets[i3 + 1] = (Math.random() - 0.5) * spread * 1.5;
            targets[i3 + 2] = (Math.random() - 0.5) * spread * 1.5;
            progresses[i] = 0; // Reset progress
        } else {
            // Interpolate position towards target
            const t = progresses[i];
            // Smoothstep easing could be nice here: t = t * t * (3 - 2 * t);
            positions[i3] = THREE.MathUtils.lerp(positions[i3], targets[i3], t);
            positions[i3 + 1] = THREE.MathUtils.lerp(positions[i3 + 1], targets[i3 + 1], t);
            positions[i3 + 2] = THREE.MathUtils.lerp(positions[i3 + 2], targets[i3 + 2], t);
        }
    }
    particlesObject.geometry.attributes.position.needsUpdate = true;
    progressAttr.needsUpdate = true;
    // No need to update target attribute unless targets are recalculated differently
}

// Specific animation logic for particle lines
function animateParticleLines(deltaTime) {
    const positions = particlesObject.geometry.attributes.position.array;
    const velocities = particlesObject.geometry.attributes.velocity.array;
    const progresses = particlesObject.geometry.attributes.progress.array; // Use progress for fade/reset
    const speedMult = particlesObject.userData.speedMultiplier * deltaTime * 60; // Frame-rate adjust
    const coreRadiusSq = 1.5 * 1.5; // Reset when head gets close
    const trailLength = 0.5;

    for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
        const i6 = i * 6; // 6 values per line (2 points * 3 coords)
        const i3v = i * 3; // Index for velocity

        // Update head position (index i6 + 3, i6 + 4, i6 + 5)
        positions[i6 + 3] += velocities[i3v + 0] * speedMult;
        positions[i6 + 4] += velocities[i3v + 1] * speedMult;
        positions[i6 + 5] += velocities[i3v + 2] * speedMult;

        // Update tail position to follow head
        positions[i6 + 0] = positions[i6 + 3] - velocities[i3v + 0] * trailLength;
        positions[i6 + 1] = positions[i6 + 4] - velocities[i3v + 1] * trailLength;
        positions[i6 + 2] = positions[i6 + 5] - velocities[i3v + 2] * trailLength;

         // Check distance of head to center
        const headX = positions[i6+3]; const headY = positions[i6+4]; const headZ = positions[i6+5];
        const distSq = headX**2 + headY**2 + headZ**2;

        // Reset if particle reaches near the core
        if (distSq < coreRadiusSq) {
            const spread = CONFIG.PARTICLE_SPREAD;
            const radius = Math.random() * spread * 0.6 + spread * 0.4;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const newHeadX = radius * Math.sin(phi) * Math.cos(theta);
            const newHeadY = radius * Math.sin(phi) * Math.sin(theta);
            const newHeadZ = radius * Math.cos(phi);

            // Reset velocity towards center
             const targetPoint = new THREE.Vector3( (Math.random()-0.5)*2, (Math.random()-0.5)*2, (Math.random()-0.5)*2 );
             const newVel = targetPoint.sub(new THREE.Vector3(newHeadX, newHeadY, newHeadZ)).normalize().multiplyScalar(0.1 + Math.random() * 0.1);
             velocities[i3v + 0] = newVel.x; velocities[i3v + 1] = newVel.y; velocities[i3v + 2] = newVel.z;

             // Set new head position
             positions[i6 + 3] = newHeadX; positions[i6 + 4] = newHeadY; positions[i6 + 5] = newHeadZ;
             // Set new tail position based on new velocity
             positions[i6 + 0] = newHeadX - newVel.x * trailLength;
             positions[i6 + 1] = newHeadY - newVel.y * trailLength;
             positions[i6 + 2] = newHeadZ - newVel.z * trailLength;

             progresses[i] = Math.random(); // Randomize progress on reset
        }
    }
    particlesObject.geometry.attributes.position.needsUpdate = true;
    // particlesObject.geometry.attributes.progress.needsUpdate = true; // If progress affects appearance
}


function pauseAnimation() { /* ... same ... */ }
function resumeAnimation() { /* ... same ... */ }

// --- 3D Specific Handlers --- (Same as previous)
function onWindowResize() { /* ... Camera, Renderer, Composer resize ... */ }
function onDocumentMouseMove(event) { /* ... update mouseX/Y ... */ }
function onDocumentTouchMove(event) { /* ... update mouseX/Y ... */ }
function handleVisibilityChange() { /* ... Pause/Resume based on document.hidden ... */ }

// --- Cleanup --- (Ensure particlesObject is handled correctly)
function cleanup() {
    console.log("Cleaning up Professional Redirect resources...");
    // ... (Stop animation, remove listeners, clear timeouts - same as before) ...

    console.log("Disposing Three.js resources...");
    if (scene) {
        scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) { /* ... comprehensive material disposal ... */ }
        });
        scene.clear();
    }
    if (composer) { /* ... composer disposal ... */ }
    if (renderer) { /* ... renderer disposal ... */ }

    // Nullify variables
    scene = null; camera = null; clock = null; renderer = null; composer = null; bloomPass = null;
    portfolioCoreMesh = null; particlesObject = null; connectionLinesMesh = null;
    ambientLight = null; pointLight = null;
    // ... other vars ...

    console.log("Professional Redirect Cleanup complete.");
}

// --- End Script ---