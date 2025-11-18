// Three.js Background Scene
// Theme: "Neural Data Flow" - Subtle, interactive particles representing data/neurons

const initThreeJS = () => {
    const container = document.createElement('div');
    container.id = 'canvas-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '-1';
    container.style.opacity = '0.6';
    container.style.pointerEvents = 'none';
    document.body.prepend(container);

    // Scene Setup
    const scene = new THREE.Scene();
    // Match the white background
    scene.background = new THREE.Color(0xffffff); 
    // Add some fog for depth
    scene.fog = new THREE.FogExp2(0xffffff, 0.002);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = window.innerWidth < 768 ? 800 : 1500; // Fewer particles on mobile
    
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
        // Spread particles in a wide area
        posArray[i] = (Math.random() - 0.5) * 120; 
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Material - Black dots
    const material = new THREE.PointsMaterial({
        size: 0.15,
        color: 0x050505, // Matches --black
        transparent: true,
        opacity: 0.8,
    });

    // Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);

    // Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    const onDocumentMouseMove = (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    };

    document.addEventListener('mousemove', onDocumentMouseMove);

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        // Gentle rotation
        particlesMesh.rotation.y += 0.001;
        particlesMesh.rotation.x += 0.0005;

        // Mouse interaction easing
        particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
        particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);

        // Wave effect
        const positions = particlesGeometry.attributes.position.array;
        for(let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            const x = particlesGeometry.attributes.position.array[i3];
            // Sine wave movement on Y axis based on X position and time
            // Creates a "breathing" or "flowing" data effect
            // We modify the rendered position slightly without changing the buffer permanently for performance, 
            // but here we want a simple wave. 
            // Actually, let's just rotate the whole mesh for performance, 
            // but maybe add a slight pulse to the camera or mesh scale.
        }
        
        // Subtle breathing
        const scale = 1 + Math.sin(elapsedTime * 0.5) * 0.05;
        particlesMesh.scale.set(scale, scale, scale);

        renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

// Initialize only if not reduced motion
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Wait for Three.js to load
    const checkThree = setInterval(() => {
        if (window.THREE) {
            clearInterval(checkThree);
            initThreeJS();
        }
    }, 100);
}
