const navLinkElements = document.querySelectorAll('.nav-links a');

// Smooth scroll behavior for all browsers
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (!targetId || targetId === '#' || targetId.trim().length <= 1 || targetId[0] !== '#') {
            return;
        }

        e.preventDefault();
        const target = document.querySelector(targetId);
        
        if (target) {  // Only scroll if target exists
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Update aria-current
            navLinkElements.forEach(link => {
                link.setAttribute('aria-current', 'false');
            });
            
            const navLink = document.querySelector(`.nav-links a[href="${targetId}"]`);
            if (navLink) {
                navLink.setAttribute('aria-current', 'page');
            }
        }
    });
});

// Mobile menu toggle
const mobileMenuButton = document.querySelector('.mobile-menu-button');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuButton && navLinks) {
    mobileMenuButton.addEventListener('click', () => {
        const isOpen = navLinks.classList.contains('active');
        navLinks.classList.toggle('active');
        mobileMenuButton.classList.toggle('active');
        mobileMenuButton.setAttribute('aria-expanded', String(!isOpen));
        document.body.classList.toggle('menu-open', !isOpen);
    });
}

// Close mobile menu when link clicked
navLinkElements.forEach(link => {
    link.addEventListener('click', () => {
        if (!navLinks || !mobileMenuButton) return;
        navLinks.classList.remove('active');
        mobileMenuButton.classList.remove('active');
        mobileMenuButton.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
    });
});

// Nav scroll effect + active link updates
const nav = document.querySelector('nav');
const sections = document.querySelectorAll('section[id]');
let scrollTicking = false;

const updateScrollState = () => {
    const currentScroll = window.pageYOffset;

    if (nav) {
        if (currentScroll > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (currentScroll >= sectionTop - 200) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinkElements.forEach(link => {
        const isActive = link.getAttribute('href') === `#${currentSection}`;
        link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });

    scrollTicking = false;
};

const onScroll = () => {
    if (!scrollTicking) {
        window.requestAnimationFrame(updateScrollState);
        scrollTicking = true;
    }
};

window.addEventListener('scroll', onScroll, { passive: true });
updateScrollState();

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Add fade-in class to elements
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.work-item, .writing-item, .about-content p');
    elements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
});
