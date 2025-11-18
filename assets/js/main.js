const root = document.documentElement;
const nav = document.querySelector('nav');
const navLinks = document.querySelector('.nav-links');
const navLinkElements = document.querySelectorAll('.nav-links a');
const mobileMenuButton = document.querySelector('.mobile-menu-button');
const sections = document.querySelectorAll('section[id]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Mobile Menu
if (mobileMenuButton && navLinks) {
    mobileMenuButton.addEventListener('click', () => {
        const isOpen = navLinks.classList.contains('active');
        navLinks.classList.toggle('active');
        mobileMenuButton.classList.toggle('active');
        mobileMenuButton.setAttribute('aria-expanded', String(!isOpen));
        document.body.style.overflow = isOpen ? '' : 'hidden';
    });
}

const closeMobileMenu = () => {
    if (!navLinks || !mobileMenuButton) return;
    navLinks.classList.remove('active');
    mobileMenuButton.classList.remove('active');
    mobileMenuButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
};

navLinkElements.forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#' || targetId.trim().length <= 1) return;

        e.preventDefault();
        const target = document.querySelector(targetId);
        
        if (target) {
            const headerHeight = 80; // Fixed height from CSS
            const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - headerHeight;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Update active state manually
            navLinkElements.forEach(link => link.setAttribute('aria-current', 'false'));
            this.setAttribute('aria-current', 'page');
        }
    });
});

// Scroll Spy & Header State
const updateScrollState = () => {
    const currentScroll = window.pageYOffset;
    const headerHeight = 80;

    // Header state
    if (nav) {
        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    // Scroll Spy
    let currentSection = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - (headerHeight + 100);
        if (currentScroll >= sectionTop) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinkElements.forEach(link => {
        const isActive = link.getAttribute('href') === `#${currentSection}`;
        link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
};

window.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateScrollState);
}, { passive: true });

// Intersection Observer for Fade In
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    // Elements to animate
    const animatedElements = document.querySelectorAll(
        '.hero-name, .hero-subtitle, .hero-current, .about-content, .work-item, .writing-item, .now-category, .connect h2'
    );
    
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
});
