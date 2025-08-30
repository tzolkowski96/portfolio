// Smooth scroll behavior for all browsers
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
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
            document.querySelectorAll('.nav-links a').forEach(link => {
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

mobileMenuButton.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('active');
    navLinks.classList.toggle('active');
    mobileMenuButton.classList.toggle('active');
    mobileMenuButton.setAttribute('aria-expanded', !isOpen);
});

// Close mobile menu when link clicked
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuButton.classList.remove('active');
        mobileMenuButton.setAttribute('aria-expanded', 'false');
    });
});

// Nav scroll effect
const nav = document.querySelector('nav');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Update active nav link on scroll
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.setAttribute('aria-current', 'false');
        if (link.getAttribute('href') === `#${current}`) {
            link.setAttribute('aria-current', 'page');
        }
    });
});
