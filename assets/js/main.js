// Performance: Pause animations when tab is not visible
let animationPaused = false;

document.addEventListener('visibilitychange', () => {
    animationPaused = document.hidden;
});

// Particle animation - represents data/signal from noise
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let mouse = { x: null, y: null, radius: 150 };

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Debounced resize with particle reinitialization
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        resize();
        init();
    }, 150);
});

// Initial canvas size (particles initialized later)
resize();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 1.5 + 0.5;
        this.density = Math.random() * 30 + 1;
        this.alpha = Math.random() * 0.5 + 0.1;
    }
    
    draw() {
        ctx.fillStyle = `rgba(201, 162, 39, ${this.alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    update() {
        if (mouse.x == null || mouse.y == null) {
            // Return to base when no mouse
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx / 20;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 20;
            }
            return;
        }
        
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let force = (mouse.radius - distance) / mouse.radius;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;
            this.x -= directionX;
            this.y -= directionY;
        } else {
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx / 20;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy / 20;
            }
        }
    }
}

function init() {
    particles = [];
    const numberOfParticles = Math.min((canvas.width * canvas.height) / 9000, 400);
    for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    if (!animationPaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            particle.draw();
            particle.update();
        });
    }
    requestAnimationFrame(animate);
}

init();
animate();

window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

// Custom cursor - only on devices with fine pointer
const cursorDot = document.querySelector('.cursor-dot');
const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

if (hasFinePointer && cursorDot) {
    document.addEventListener('mousemove', e => {
        cursorDot.style.left = e.clientX - 4 + 'px';
        cursorDot.style.top = e.clientY - 4 + 'px';
        if (!cursorDot.classList.contains('visible')) {
            cursorDot.classList.add('visible');
        }
    });
    
    document.addEventListener('mouseleave', () => {
        cursorDot.classList.remove('visible');
    });
    
    const hoverElements = document.querySelectorAll('a, button, [tabindex="0"]');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursorDot.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursorDot.classList.remove('hovering'));
    });
}

// Scroll reveal with Intersection Observer (more performant than scroll listener)
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Don't unobserve - allows re-reveal if needed
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
});

// Reduced motion: immediately show all elements
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}

/* Navigation Visibility Logic - Shows nav after user scrolls past hero */
const nav = document.querySelector('.nav');
const heroSection = document.getElementById('hero');

if (nav && heroSection) {
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // If hero is NOT intersecting (scrolled past), show nav
            if (!entry.isIntersecting) {
                nav.classList.add('visible');
            } else {
                nav.classList.remove('visible');
            }
        });
    }, {
        // Trigger as soon as the hero starts leaving the viewport
        threshold: 0.1
    });

    navObserver.observe(heroSection);
}

/* Smooth internal links for Navigation */
document.querySelectorAll('.nav-link').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

