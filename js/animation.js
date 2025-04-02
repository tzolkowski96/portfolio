import * as THREE from 'three';

// Basic setup
const scene = new THREE.Scene();
const canvas = document.getElementById('bg-canvas');
if (!canvas) {
    console.error("Canvas element #bg-canvas not found.");
} else {
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);
    
    // Add a second light for more dynamic lighting
    const secondLight = new THREE.DirectionalLight(0xffffff, 0.5);
    secondLight.position.set(-5, 3, -5);
    scene.add(secondLight);

    // Get theme colors
    const computedStyle = getComputedStyle(document.body);
    const accentColorString = computedStyle.getPropertyValue('--accent-color').trim();
    const accentColor = accentColorString || (window.matchMedia('(prefers-color-scheme: dark)').matches ? '#3b82f6' : '#0d6efd');

    const bgColorString = computedStyle.getPropertyValue('--bg-color').trim();
    const bgColor = bgColorString || (window.matchMedia('(prefers-color-scheme: dark)').matches ? '#1a1a1a' : '#f8f9fa');

    // Create colors for variety in the scene
    const secondaryColor = new THREE.Color(accentColor).offsetHSL(0.1, 0, 0);
    const tertiaryColor = new THREE.Color(accentColor).offsetHSL(-0.1, 0, 0);

    // Primary Abstract Shape - make it more complex
    const geometry = new THREE.IcosahedronGeometry(1.5, 1); // Increase detail level
    const material = new THREE.MeshPhysicalMaterial({
        color: accentColor,
        metalness: 0.4,
        roughness: 0.5,
        reflectivity: 0.5,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2,
        flatShading: true
    });

    // Create the main mesh
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Add wireframe overlay to main shape for a more technical look
    const wireframe = new THREE.LineSegments(
        new THREE.WireframeGeometry(geometry),
        new THREE.LineBasicMaterial({ 
            color: new THREE.Color(accentColor).offsetHSL(0, 0, 0.2), 
            transparent: true, 
            opacity: 0.3 
        })
    );
    mesh.add(wireframe);

    // Secondary shapes with variety
    const shapes = [];
    
    // Create a torus knot
    const torusKnotGeometry = new THREE.TorusKnotGeometry(0.5, 0.15, 64, 8, 2, 3);
    const torusKnotMaterial = new THREE.MeshPhysicalMaterial({
        color: secondaryColor,
        metalness: 0.7,
        roughness: 0.3,
        flatShading: false
    });
    const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
    torusKnot.position.set(3, 0, 0);
    torusKnot.scale.set(0.6, 0.6, 0.6);
    scene.add(torusKnot);
    shapes.push(torusKnot);
    
    // Create a dodecahedron
    const dodecahedronGeometry = new THREE.DodecahedronGeometry(0.7, 0);
    const dodecahedronMaterial = new THREE.MeshPhysicalMaterial({
        color: tertiaryColor,
        metalness: 0.5,
        roughness: 0.5,
        flatShading: true
    });
    const dodecahedron = new THREE.Mesh(dodecahedronGeometry, dodecahedronMaterial);
    dodecahedron.position.set(-3, -1, 1);
    dodecahedron.scale.set(0.5, 0.5, 0.5);
    scene.add(dodecahedron);
    shapes.push(dodecahedron);
    
    // Create a octahedron
    const octahedronGeometry = new THREE.OctahedronGeometry(0.6, 0);
    const octahedronMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(accentColor).offsetHSL(0.2, 0, 0),
        metalness: 0.3,
        roughness: 0.7,
        flatShading: true
    });
    const octahedron = new THREE.Mesh(octahedronGeometry, octahedronMaterial);
    octahedron.position.set(0, 2.5, -1);
    octahedron.scale.set(0.6, 0.6, 0.6);
    scene.add(octahedron);
    shapes.push(octahedron);
    
    // Create smaller tetrahedrons scattered around
    const smallMeshes = [];
    for (let i = 0; i < 10; i++) {
        const smallGeometry = new THREE.TetrahedronGeometry(0.3, 0);
        const smallMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(accentColor).offsetHSL(i * 0.1, 0, 0),
            metalness: 0.5,
            roughness: 0.4,
            flatShading: true,
            transparent: true,
            opacity: 0.7
        });
        
        const smallMesh = new THREE.Mesh(smallGeometry, smallMaterial);
        smallMesh.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
        smallMesh.rotation.x = Math.random() * Math.PI;
        smallMesh.rotation.y = Math.random() * Math.PI;
        smallMesh.scale.set(
            0.3 + Math.random() * 0.7,
            0.3 + Math.random() * 0.7,
            0.3 + Math.random() * 0.7
        );
        smallMeshes.push(smallMesh);
        scene.add(smallMesh);
    }

    // Enhanced Particle System
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 400; // More particles
    const posArray = new Float32Array(particlesCount * 3);
    const colorsArray = new Float32Array(particlesCount * 3);
    
    const accentColorThree = new THREE.Color(accentColor);
    const color = new THREE.Color();

    for (let i = 0; i < particlesCount; i++) {
        // Position
        const i3 = i * 3;
        posArray[i3] = (Math.random() - 0.5) * 20; // Wider spread
        posArray[i3 + 1] = (Math.random() - 0.5) * 20;
        posArray[i3 + 2] = (Math.random() - 0.5) * 20;
        
        // Color with slight variation
        color.copy(accentColorThree).offsetHSL(
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.2,
            (Math.random() - 0.5) * 0.4
        );
        
        colorsArray[i3] = color.r;
        colorsArray[i3 + 1] = color.g;
        colorsArray[i3 + 2] = color.b;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true, // Use the colors we defined
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Mouse movement effect with improved smoothing
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;
    
    // Only add mouse listener if reduced motion is not preferred
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - windowHalfX) / 150;
            mouseY = (event.clientY - windowHalfY) / 150;
        });
        
        // Add touch support for mobile devices
        document.addEventListener('touchmove', (event) => {
            if (event.touches.length === 1) {
                mouseX = (event.touches[0].clientX - windowHalfX) / 150;
                mouseY = (event.touches[0].clientY - windowHalfY) / 150;
            }
        });
    }

    // Animation loop with improved effects
    const clock = new THREE.Clock();
    let lastTime = 0;
    
    const animate = () => {
        if (!renderer) return;

        const elapsedTime = clock.getElapsedTime();
        const deltaTime = elapsedTime - lastTime;
        lastTime = elapsedTime;

        // Update main mesh with more dynamic rotation
        mesh.rotation.y = 0.1 * elapsedTime;
        mesh.rotation.x = 0.05 * elapsedTime;
        
        // Smooth mouse tracking with better easing
        targetX = mouseX * 0.5;
        targetY = mouseY * 0.5;
        mesh.rotation.y += 0.3 * (targetX - mesh.rotation.y) * deltaTime * 10;
        mesh.rotation.x += 0.3 * (targetY - mesh.rotation.x) * deltaTime * 10;
        
        // Apply a subtle pulse/breathing effect to the main mesh
        const pulseScale = 1 + Math.sin(elapsedTime) * 0.05;
        mesh.scale.set(pulseScale, pulseScale, pulseScale);
        
        // Animate secondary shapes
        shapes.forEach((shape, i) => {
            // Each shape follows a different orbit
            const orbit = 1.5 + i * 0.5;
            shape.position.x = Math.sin(elapsedTime * (0.2 + i * 0.1)) * orbit;
            shape.position.z = Math.cos(elapsedTime * (0.2 + i * 0.1)) * orbit;
            shape.position.y = Math.sin(elapsedTime * (0.3 + i * 0.05)) * orbit * 0.5;
            
            // Rotate each shape
            shape.rotation.x = elapsedTime * (0.2 + i * 0.1);
            shape.rotation.y = elapsedTime * (0.3 + i * 0.1);
        });
        
        // Animate small tetrahedrons
        smallMeshes.forEach((smallMesh, i) => {
            smallMesh.rotation.x = 0.3 * elapsedTime + i;
            smallMesh.rotation.y = 0.2 * elapsedTime + i;
            
            // Floating animation with different phases
            smallMesh.position.y += Math.sin(elapsedTime * 0.5 + i * Math.PI) * 0.008;
            smallMesh.position.x += Math.cos(elapsedTime * 0.3 + i) * 0.005;
            
            // Pulse the opacity for a shimmering effect
            if (smallMesh.material.transparent) {
                smallMesh.material.opacity = 0.4 + Math.sin(elapsedTime * 2 + i) * 0.2;
            }
        });

        // Animate particles - make them swirl around
        particlesMesh.rotation.y = -0.02 * elapsedTime;
        
        // Add a subtle wave effect to particles
        const positions = particlesMesh.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            // Skip updating every frame for performance (only every ~10 frames)
            if (Math.random() > 0.9) {
                const x = positions[i];
                const y = positions[i + 1];
                const z = positions[i + 2];
                
                // Apply a subtle sine wave displacement
                positions[i + 1] = y + Math.sin(elapsedTime + x) * 0.02;
            }
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        // Render
        renderer.render(scene, camera);
        window.requestAnimationFrame(animate);
    };

    // Handle window resize
    window.addEventListener('resize', () => {
        if (!renderer) return;

        // Update camera
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        // Update renderer
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // Start animation
    animate();
    
    // Performance optimization - slow down or stop animation when tab is not focused
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            clock.stop();
        } else {
            clock.start();
        }
    });
}