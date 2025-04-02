window.performance.mark('script-start');

// Web Vitals & Basic Setup
document.addEventListener('DOMContentLoaded', () => {
    window.performance.mark('script-end');
    window.performance.measure('script-execution', 'script-start', 'script-end');

    // --- Enhanced Countdown & Redirect Logic ---
    const redirectUrl = 'https://tobin-data-portfolio.netlify.app/';
    const redirectDelay = 7000; // 7 seconds
    const countdownEl = document.getElementById('countdown');
    const countdownCircle = document.querySelector('.countdown-circle');
    const countdownProgress = document.querySelector('.countdown-progress');
    const cancelButton = document.querySelector('.cancel-redirect');
    const copyButton = document.querySelector('.copy-btn');
    const copyToast = document.getElementById('copy-toast');
    
    let secondsLeft = 7;
    let progressValue = 0;
    let redirectCancelled = false;
    
    // SVG circle animation calculations
    const circumference = 2 * Math.PI * 54; // Circumference = 2 * π * radius (54 is the radius from SVG)
    
    // Set initial dasharray to circumference
    if (countdownProgress) {
        countdownProgress.style.strokeDasharray = circumference;
        countdownProgress.style.strokeDashoffset = '0';
    }
    
    // Update countdown display with smooth animation
    function updateCountdown() {
        if (redirectCancelled) return;
        
        if (countdownEl) {
            countdownEl.textContent = secondsLeft;
            
            // Add warning styling when countdown is almost finished
            if (secondsLeft <= 2 && !countdownCircle.parentNode.classList.contains('countdown-ending')) {
                countdownCircle.parentNode.classList.add('countdown-ending');
            }
        }
        
        if (countdownProgress) {
            // Calculate progress (0 to 100%)
            progressValue = ((7 - secondsLeft) / 7);
            
            // Calculate dashoffset (starts at 0, ends at circumference)
            const dashoffset = circumference * (1 - progressValue);
            countdownProgress.style.strokeDashoffset = dashoffset;
            
            // Also update any screen reader text
            const srText = document.querySelector('.countdown-text .sr-only');
            if (srText) {
                srText.textContent = secondsLeft;
            }
        }
        
        secondsLeft -= 1;
        
        if (secondsLeft < 0) {
            clearInterval(countdownInterval);
            
            // Add a fade-out effect before redirect
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.5s ease';
            
            // Redirect after fade effect
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 500);
        }
    }
    
    // Start countdown
    const countdownInterval = setInterval(updateCountdown, 1000);
    
    // Store the interval ID to potentially clear it if errors occur
    window.autoRedirectTimeout = countdownInterval;
    
    // Cancel redirect button
    if (cancelButton) {
        cancelButton.addEventListener('click', () => {
            clearInterval(countdownInterval);
            redirectCancelled = true;
            
            // Update UI to show redirect is cancelled
            if (countdownCircle) {
                countdownCircle.parentNode.classList.remove('countdown-ending');
                countdownProgress.style.strokeDashoffset = '0'; // Reset to full circle
                countdownEl.textContent = '✓';
            }
            
            const countdownText = document.querySelector('.countdown-text');
            if (countdownText) {
                countdownText.textContent = 'Automatic redirect cancelled';
            }
            
            // Hide the cancel button
            cancelButton.style.display = 'none';
        });
    }
    
    // Copy URL button functionality
    if (copyButton) {
        copyButton.addEventListener('click', () => {
            const urlToCopy = 'https://tobin-data-portfolio.netlify.app/';
            
            // Try to use the modern clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(urlToCopy)
                    .then(() => showCopyToast())
                    .catch(err => {
                        console.error('Failed to copy URL: ', err);
                        fallbackCopy(urlToCopy);
                    });
            } else {
                fallbackCopy(urlToCopy);
            }
            
            // Add button pressed effect
            copyButton.classList.add('active');
            setTimeout(() => {
                copyButton.classList.remove('active');
            }, 300);
        });
    }
    
    // Fallback copy method for browsers without clipboard API
    function fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showCopyToast();
            } else {
                console.error('Fallback: Could not copy text');
            }
        } catch (err) {
            console.error('Fallback: Could not copy text', err);
        }
        
        document.body.removeChild(textArea);
    }
    
    // Show toast notification when URL is copied
    function showCopyToast() {
        if (copyToast) {
            copyToast.hidden = false;
            
            // Hide the toast after the animation completes
            setTimeout(() => {
                copyToast.hidden = true;
            }, 2500);
        }
    }
    
    // Allow user to cancel redirect by interacting with the button
    const redirectButton = document.querySelector('.button');
    if (redirectButton) {
        redirectButton.addEventListener('click', () => {
            clearInterval(countdownInterval);
            redirectCancelled = true;
            
            // Add a ripple effect on click
            addRippleEffect(redirectButton);
            
            // Delay redirect slightly to show the ripple
            setTimeout(() => {
                // The default link behavior will handle the redirect
            }, 300);
        });
    }
    
    // Add ripple effect function for buttons
    function addRippleEffect(button) {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = button.getBoundingClientRect();
            
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.classList.add('ripple');
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }
    
    // Apply ripple to all buttons
    document.querySelectorAll('.button').forEach(button => {
        addRippleEffect(button);
    });
    
    // Add keyboard shortcut for quick access (Escape to cancel redirect)
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !redirectCancelled) {
            if (cancelButton) {
                cancelButton.click();
            }
        }
    });
});

// Enhanced Error Handling
window.addEventListener('error', (event) => {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
        errorContainer.hidden = false;
        errorContainer.innerHTML = `
            <p>Sorry, there was an unexpected error loading a part of the page. You can still use the button to visit the new portfolio.</p>
            <button onclick="window.location.reload()" class="button">
                Reload Page
            </button>
        `;
    }
    console.error('Page Error:', event.error);
    
    // Prevent automatic redirect if there was a script error
    if (typeof window.autoRedirectTimeout !== 'undefined') {
         clearInterval(window.autoRedirectTimeout);
    }
});

// Performance Monitoring
if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            // Log only key performance metrics to reduce console noise
            if (['first-paint', 'first-contentful-paint', 'largest-contentful-paint'].includes(entry.name)) {
                console.log(`Performance - ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
            }
        }
    });
    try {
         observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
    } catch (e) {
        console.warn("Performance Observer failed:", e);
    }
}

// Add support for offline mode
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(error => {
                console.error('ServiceWorker registration failed:', error);
            });
    });
}

// Add CSS ripple effect style
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .button {
            position: relative;
            overflow: hidden;
        }
        .ripple {
            position: absolute;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.5);
            transform: scale(0);
            animation: ripple-animation 0.6s ease-out;
            pointer-events: none;
        }
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        .copy-btn.active {
            transform: scale(0.95);
            background-color: var(--border-color);
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
});