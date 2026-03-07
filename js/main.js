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
                if (nav && nav.classList.contains('active')) {
                    toggleMenu();
                }
            }
        });
    });

    // Initialize Pipeline Visualization
    new PipelineViz('pipeline-canvas');

    // =============================================
    // Scroll Reveal — IntersectionObserver
    // =============================================
    const revealElements = document.querySelectorAll('[data-reveal]');
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // =============================================
    // Active Nav Highlighting
    // =============================================
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    const hero = document.querySelector('.hero');

    if (sections.length > 0 && navLinks.length > 0) {
        // Clear active state when hero is in view
        if (hero) {
            const heroObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        navLinks.forEach(link => link.classList.remove('active'));
                    }
                });
            }, { threshold: 0.4 });
            heroObserver.observe(hero);
        }

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    const activeLink = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
                    if (activeLink) activeLink.classList.add('active');
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '-100px 0px -55% 0px'
        });

        sections.forEach(section => sectionObserver.observe(section));
    }

    // =============================================
    // Nav Background on Scroll
    // =============================================
    const mainNav = document.querySelector('nav');
    if (mainNav) {
        const updateNav = () => {
            mainNav.classList.toggle('scrolled', window.scrollY > 60);
        };
        window.addEventListener('scroll', updateNav, { passive: true });
        updateNav();
    }
});
