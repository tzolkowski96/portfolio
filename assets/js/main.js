const root = document.documentElement;
const nav = document.querySelector('nav');
const navLinks = document.querySelector('.nav-links');
const navLinkElements = document.querySelectorAll('.nav-links a');
const mobileMenuButton = document.querySelector('.mobile-menu-button');
const sections = document.querySelectorAll('section[id]');
let cachedHeaderHeight = 72;

const setHeaderHeight = () => {
    if (!nav) return;
    const navHeight = nav.getBoundingClientRect().height;
    cachedHeaderHeight = Math.round(navHeight);
    root.style.setProperty('--header-height', `${cachedHeaderHeight}px`);
};

const getHeaderOffset = () => {
    if (!nav) {
        return cachedHeaderHeight + 16;
    }
    return cachedHeaderHeight + 16;
};

const closeMobileMenu = () => {
    if (!navLinks || !mobileMenuButton) return;
    navLinks.classList.remove('active');
    mobileMenuButton.classList.remove('active');
    mobileMenuButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
};

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
            const headerOffset = getHeaderOffset();
            const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = Math.max(elementPosition - headerOffset, 0);
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            window.requestAnimationFrame(updateScrollState);
            
            // Update aria-current
            navLinkElements.forEach(link => {
                link.setAttribute('aria-current', 'false');
            });
            
            const navLink = document.querySelector(`.nav-links a[href="${targetId}"]`);
            if (navLink) {
                navLink.setAttribute('aria-current', 'page');
            }

            if (navLinks && navLinks.classList.contains('active')) {
                closeMobileMenu();
            }
        }
    });
});

// Mobile menu toggle
if (mobileMenuButton && navLinks) {
    mobileMenuButton.addEventListener('click', () => {
        const isOpen = navLinks.classList.contains('active');
        navLinks.classList.toggle('active');
        mobileMenuButton.classList.toggle('active');
        mobileMenuButton.setAttribute('aria-expanded', String(!isOpen));
        document.body.classList.toggle('menu-open', !isOpen);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMobileMenu();
            mobileMenuButton.focus();
        }
    });
}

// Close mobile menu when link clicked
navLinkElements.forEach(link => {
    link.addEventListener('click', () => {
        closeMobileMenu();
    });
});

// Nav scroll effect + active link updates
let scrollTicking = false;

const updateScrollState = () => {
    const currentScroll = window.pageYOffset;
    const headerOffset = getHeaderOffset();

    if (nav) {
        if (currentScroll > headerOffset) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - (headerOffset + 40);
        if (currentScroll >= sectionTop) {
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
window.addEventListener('resize', () => {
    window.requestAnimationFrame(() => {
        setHeaderHeight();
        updateScrollState();
    });
});
window.addEventListener('load', setHeaderHeight);
setHeaderHeight();
updateScrollState();

if (window.ResizeObserver && nav) {
    const navResizeObserver = new ResizeObserver(() => {
        setHeaderHeight();
        updateScrollState();
    });
    navResizeObserver.observe(nav);
}

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
