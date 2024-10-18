// script.js

// Page navigation
const links = document.querySelectorAll('nav a');
const pages = document.querySelectorAll('.page');

links.forEach(link => {
    link.addEventListener('click', function (event) {
        event.preventDefault();
        const pageId = link.getAttribute('data-page');
        pages.forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
        history.pushState(null, null, `#${pageId}`);
        document.getElementById(pageId).scrollIntoView({ behavior: 'smooth' });
    });
});

// Project navigation
const projectButtons = document.querySelectorAll('.project-navigation button');
const projectCategories = document.querySelectorAll('.project-category');

projectButtons.forEach(button => {
    button.addEventListener('click', function () {
        const targetId = this.getAttribute('data-target');
        if (targetId === 'all-projects') {
            projectCategories.forEach(category => {
                category.style.display = 'block';
            });
        } else {
            projectCategories.forEach(category => {
                category.style.display = 'none';
            });
            document.getElementById(targetId).style.display = 'block';
        }
    });
});

// Initial full-screen animation using Vanta.js
var vantaEffect;
var setVanta = (el) => {
    if (vantaEffect) vantaEffect.destroy();
    vantaEffect = window.VANTA.NET({
        el: el,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0xf8b400,
        backgroundColor: 0x2e3a47,
        points: 15.00,
        maxDistance: 25.00,
        spacing: 20.00,
        showDots: true,
        threejs: window.THREE
    });
};

setVanta('#full-screen-animation');

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

setTimeout(() => {
    gsap.to('#full-screen-animation', {
        opacity: 0,
        duration: 1,
        onComplete: () => {
            document.getElementById('full-screen-animation').classList.add('hidden');
            setVanta('header');
            gsap.to('nav', { opacity: 1, duration: 1 });
            gsap.fromTo('header h1, header p', { opacity: 0 }, { opacity: 1, duration: 1.5, ease: "power4.out" });
            gsap.to('section', { opacity: 1, y: 0, duration: 1, stagger: 0.2 });
        }
    });
}, isMobile ? 1000 : 1500);

// Smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// GSAP animations for navigation and sections
gsap.from("nav", { opacity: 0, y: -20, duration: 1, delay: 0.5 });
gsap.from(".page.active section", { opacity: 0, y: 50, duration: 1, stagger: 0.2, delay: 1 });

// Lazy loading with animation for project cards
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            gsap.from(entry.target, { opacity: 0, y: 20, duration: 0.5 });
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

const projects = document.querySelectorAll('.project');
projects.forEach(project => {
    observer.observe(project);
});

// Form validation with animations and error messages
const form = document.getElementById('contact-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');
const nameError = document.getElementById('name-error');
const emailError = document.getElementById('email-error');
const messageError = document.getElementById('message-error');
const sendButton = form.querySelector('button[type="submit"]');

form.addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;

    if (!nameInput.value) {
        nameError.style.display = 'block';
        valid = false;
    } else {
        nameError.style.display = 'none';
    }

    if (!emailInput.value || !emailInput.validity.valid) {
        emailError.style.display = 'block';
        valid = false;
    } else {
        emailError.style.display = 'none';
    }

    if (!messageInput.value || messageInput.value.length < 10) {
        messageError.style.display = 'block';
        valid = false;
    } else {
        messageError.style.display = 'none';
    }

    if (valid) {
        form.submit();
    } else {
        sendButton.classList.add('shake');
        setTimeout(() => sendButton.classList.remove('shake'), 500);
    }
});

// Animate send button on mouse move
sendButton.addEventListener('mousemove', function (e) {
    const rect = sendButton.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    sendButton.style.transform = `translate(${x * 0.05}px, ${y * 0.05}px) scale(1.05)`;
});

sendButton.addEventListener('mouseleave', function () {
    sendButton.style.transform = 'translate(0, 0) scale(1)';
});
