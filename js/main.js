// Mobile menu toggle
function toggleMenu() {
    const nav = document.getElementById('mobileNav');
    const toggle = document.querySelector('.menu-toggle');
    if (!nav || !toggle) return;

    const isActive = nav.classList.toggle('active');
    toggle.classList.toggle('active');
    toggle.setAttribute('aria-expanded', isActive);
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle click listener
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }

    // Close mobile menu on clicking any link inside it
    const mobileLinks = document.querySelectorAll('.mobile-nav a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            const nav = document.getElementById('mobileNav');
            if (nav && nav.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const nav = document.getElementById('mobileNav');
            const toggle = document.querySelector('.menu-toggle');
            if (nav && nav.classList.contains('active')) {
                nav.classList.remove('active');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        }
    });

    // Smooth scroll for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
                target.setAttribute('tabindex', '-1');
                target.focus();

                // Close mobile menu if open
                const nav = document.getElementById('mobileNav');
                const toggle = document.querySelector('.menu-toggle');
                if (nav && nav.classList.contains('active')) {
                    toggleMenu();
                }
            }
        });
    });

    // Initialize Pipeline Visualization
    new PipelineViz('pipeline-canvas');
});
