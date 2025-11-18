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
    const particlesCount = window.innerWidth < 768 ? 60 : 120; // Reduced count for network effect
    
    const posArray = new Float32Array(particlesCount * 3);
    const particles = []; // Store particle data for manual line drawing

    for(let i = 0; i < particlesCount; i++) {
        const x = (Math.random() - 0.5) * 100;
        const y = (Math.random() - 0.5) * 100;
        const z = (Math.random() - 0.5) * 50;
        
        posArray[i * 3] = x;
        posArray[i * 3 + 1] = y;
        posArray[i * 3 + 2] = z;

        particles.push({
            x: x, y: y, z: z,
            vx: (Math.random() - 0.5) * 0.05, // Velocity
            vy: (Math.random() - 0.5) * 0.05
        });
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Material - Nodes (Organic/Soft)
    const getTexture = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        // Soft radial gradient for organic feel
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(5,5,5,1)');
        gradient.addColorStop(0.4, 'rgba(5,5,5,0.5)');
        gradient.addColorStop(1, 'rgba(5,5,5,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        const texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return texture;
    };

    const material = new THREE.PointsMaterial({
        size: 0.8, // Larger because they are soft
        map: getTexture(),
        transparent: true,
        opacity: 0.9,
        depthWrite: false, // Prevents z-fighting with transparency
        blending: THREE.MultiplyBlending // Darkens the background for ink-like effect
    });

    // Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);

    // Lines
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x050505,
        transparent: true,
        opacity: 0.15
    });

    const lineGeometry = new THREE.BufferGeometry();
    const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(linesMesh);

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
    const animate = () => {
        requestAnimationFrame(animate);

        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        // Update particles
        const positions = particlesMesh.geometry.attributes.position.array;
        
        // Line positions array (max possible lines)
        const linePositions = [];

        for(let i = 0; i < particlesCount; i++) {
            // Move particles
            particles[i].x += particles[i].vx;
            particles[i].y += particles[i].vy;

            // Bounce off boundaries
            if(particles[i].x > 50 || particles[i].x < -50) particles[i].vx *= -1;
            if(particles[i].y > 50 || particles[i].y < -50) particles[i].vy *= -1;

            // Update mesh position
            positions[i * 3] = particles[i].x;
            positions[i * 3 + 1] = particles[i].y;
            positions[i * 3 + 2] = particles[i].z;

            // Check connections
            for(let j = i + 1; j < particlesCount; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dz = particles[i].z - particles[j].z;
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

                if(dist < 15) { // Connection threshold
                    linePositions.push(
                        particles[i].x, particles[i].y, particles[i].z,
                        particles[j].x, particles[j].y, particles[j].z
                    );
                }
            }
        }

        particlesMesh.geometry.attributes.position.needsUpdate = true;
        
        // Update lines
        linesMesh.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

        // Gentle rotation of entire system
        const rotationSpeed = 0.001;
        particlesMesh.rotation.y += rotationSpeed;
        linesMesh.rotation.y += rotationSpeed;

        // Mouse interaction
        particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);
        particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
        linesMesh.rotation.x += 0.05 * (targetY - linesMesh.rotation.x);
        linesMesh.rotation.y += 0.05 * (targetX - linesMesh.rotation.y);

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
