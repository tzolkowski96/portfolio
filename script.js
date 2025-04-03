// Simple, lightweight redirect script

// --- Configuration ---
const CONFIG = {
    REDIRECT_URL: 'https://tobin-data-portfolio.netlify.app/',
    REDIRECT_DELAY_SECONDS: 8,
    COPY_SUCCESS_DELAY_MS: 2000,
    REDIRECT_FADE_MS: 300
};

// --- Global Variables ---
let countdownInterval;
let redirectCancelled = false;

// --- DOM Elements ---
let countdownEl, countdownCircle, countdownProgress, cancelButton, copyButton, 
    copyToast, errorContainer, redirectButton, onlineContent, offlineNotice, 
    retryButton, countdownTextEl, copyIconDefault, copyIconSuccess;

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded - Simple Redirect");
    assignDOMElements();
    setupEventListeners();
    handleConnectionChange();
});

// --- DOM Element Assignment ---
function assignDOMElements() {
    countdownEl = document.getElementById('countdown');
    countdownCircle = document.querySelector('.countdown-circle');
    countdownProgress = document.querySelector('.countdown-progress');
    cancelButton = document.getElementById('cancel-redirect');
    copyButton = document.querySelector('.copy-btn');
    copyToast = document.getElementById('copy-toast');
    errorContainer = document.getElementById('error-container');
    redirectButton = document.getElementById('manual-redirect-button');
    onlineContent = document.getElementById('online-content');
    offlineNotice = document.getElementById('offline-notice');
    retryButton = document.getElementById('retry-button');
    countdownTextEl = document.getElementById('countdown-text');
    copyIconDefault = document.getElementById('copy-icon-default');
    copyIconSuccess = document.getElementById('copy-icon-success');
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    if (cancelButton) cancelButton.addEventListener('click', cancelRedirect);
    if (copyButton) copyButton.addEventListener('click', handleCopyUrl);
    if (retryButton) {
        retryButton.addEventListener('click', () => {
            setTimeout(() => window.location.reload(), 100);
        });
    }

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', (event) => handleGlobalError({ error: event.reason }));

    // Preload destination site for faster redirect
    setTimeout(() => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = CONFIG.REDIRECT_URL;
        document.head.appendChild(link);
    }, 2000);
}

// --- Keyboard Handler ---
function handleKeyDown(event) {
    if (event.key === 'Escape' && !redirectCancelled && navigator.onLine && onlineContent && !onlineContent.hidden) {
        cancelRedirect();
    }
}

// --- Network Status Handling ---
function handleConnectionChange() {
    const isOnline = navigator.onLine;
    console.log("Connection status changed:", isOnline ? "Online" : "Offline");
    if (isOnline) {
        showOnlineContent();
        if (!redirectCancelled) startCountdown();
    } else {
        showOfflineContent();
        stopCountdown();
    }
}

function showOnlineContent() {
    if (offlineNotice) offlineNotice.hidden = true;
    if (onlineContent) onlineContent.hidden = false;
    if (redirectCancelled && cancelButton) cancelButton.style.display = 'none';
}

function showOfflineContent() {
    if (onlineContent) onlineContent.hidden = true;
    if (offlineNotice) offlineNotice.hidden = false;
}

// --- Countdown Logic ---
function startCountdown() {
    if (redirectCancelled || !navigator.onLine) {
        console.log("Cannot start countdown - redirect cancelled or offline");
        return;
    }
    
    // Clean up any existing countdown
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    console.log("Starting countdown");
    let secondsLeft = CONFIG.REDIRECT_DELAY_SECONDS;
    
    // Circle properties
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    
    // Reset and initialize the UI elements
    if (countdownEl) countdownEl.textContent = secondsLeft;
    if (cancelButton) cancelButton.style.display = 'inline-block';
    
    // Set initial visual state of progress circle (empty)
    if (countdownProgress) {
        countdownProgress.setAttribute('stroke-dasharray', circumference);
        countdownProgress.setAttribute('stroke-dashoffset', circumference);
    }
    
    // Set initial text
    updateCountdownText(secondsLeft);
    
    // Start with initial visual
    updateCountdownVisual(secondsLeft, circumference);
    
    // Start the countdown
    countdownInterval = setInterval(() => {
        secondsLeft -= 1;
        
        // Exit if cancelled during this interval
        if (redirectCancelled) {
            stopCountdown();
            return;
        }
        
        // Update all visual elements for the current time
        updateCountdownVisual(secondsLeft, circumference);
        
        // Redirect when time's up
        if (secondsLeft < 0) {
            stopCountdown();
            triggerRedirect();
        }
    }, 1000);
}

function updateCountdownVisual(secondsLeft, circumference) {
    // Update the number display
    if (countdownEl && secondsLeft >= 0) {
        countdownEl.textContent = secondsLeft;
    }
    
    // Update the text description
    updateCountdownText(secondsLeft);
    
    // Update the circle progress
    if (countdownProgress && secondsLeft >= 0) {
        const progress = secondsLeft / CONFIG.REDIRECT_DELAY_SECONDS;
        const dashOffset = circumference * (1 - progress);
        countdownProgress.setAttribute('stroke-dashoffset', dashOffset);
    }
}

function stopCountdown() {
    if (countdownInterval) {
        console.log("Stopping countdown interval");
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

function updateCountdownText(seconds) {
    if (countdownTextEl) {
        if (redirectCancelled) {
            countdownTextEl.textContent = 'Redirect cancelled';
        } else if (seconds >= 0) {
            const srSpan = document.createElement('span');
            srSpan.className = 'sr-only';
            srSpan.textContent = seconds;
            
            countdownTextEl.textContent = 'Redirecting in ';
            countdownTextEl.appendChild(srSpan);
            countdownTextEl.appendChild(document.createTextNode(` ${seconds} seconds`));
        }
    }
}

function cancelRedirect() {
    if (redirectCancelled) return;
    console.log("Redirect cancelled by user");
    redirectCancelled = true;
    stopCountdown();

    // Update UI
    if (countdownEl) {
        countdownEl.textContent = '✓';
    }
    
    updateCountdownText(-1); // Update text to show cancelled state
    if (cancelButton) cancelButton.style.display = 'none';

    // Highlight the manual redirect button
    if (redirectButton) {
        redirectButton.focus({ preventScroll: true });
    }
    
    // Show notification
    showToast("Automatic redirect cancelled");
}

function triggerRedirect() {
    if (redirectCancelled || !navigator.onLine) {
        console.log("Redirect aborted (cancelled or offline).");
        return;
    }
    console.log("Triggering redirect to:", CONFIG.REDIRECT_URL);

    // Simple fade out
    document.body.style.opacity = '0';
    document.body.style.transition = `opacity ${CONFIG.REDIRECT_FADE_MS / 1000}s ease-out`;

    setTimeout(() => {
        window.location.href = CONFIG.REDIRECT_URL;
    }, CONFIG.REDIRECT_FADE_MS);
}

// --- Copy URL Function ---
function handleCopyUrl() {
    if (!copyButton) return;
    const urlToCopy = CONFIG.REDIRECT_URL;

    copyButton.setAttribute('aria-busy', 'true');
    if (copyIconDefault) copyIconDefault.style.display = 'none';
    if (copyIconSuccess) copyIconSuccess.style.display = 'inline-block';

    const resetVisuals = () => {
        setTimeout(() => {
            if (copyButton) {
                copyButton.setAttribute('aria-busy', 'false');
                if (copyIconDefault) copyIconDefault.style.display = 'inline-block';
                if (copyIconSuccess) copyIconSuccess.style.display = 'none';
            }
        }, CONFIG.COPY_SUCCESS_DELAY_MS);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(urlToCopy)
            .then(() => { showToast("URL copied!"); })
            .catch(err => {
                console.error('Clipboard API copy failed: ', err);
                fallbackCopy(urlToCopy);
            })
            .finally(resetVisuals);
    } else {
        console.log("Using fallback copy method");
        fallbackCopy(urlToCopy);
        resetVisuals();
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) showToast("URL copied!");
        else showToast("Failed to copy URL");
    } catch (err) {
        console.error('Fallback copy error', err);
        showToast("Error copying URL");
    }
    
    document.body.removeChild(textArea);
}

function showToast(message = "URL copied!") {
    if (!copyToast) return;
    
    copyToast.textContent = message;
    copyToast.hidden = false;
    copyToast.classList.add('visible');

    if (copyToast.timer) clearTimeout(copyToast.timer);
    copyToast.timer = setTimeout(() => {
        copyToast.classList.remove('visible');
        setTimeout(() => {
            copyToast.hidden = true;
            copyToast.timer = null;
        }, 300);
    }, CONFIG.COPY_SUCCESS_DELAY_MS);
}

// --- Error Handling ---
function handleGlobalError(event) {
    const error = event.error || event.reason || event;
    console.error('Unhandled Error:', error);
    stopCountdown();

    if (errorContainer && errorContainer.hidden) {
        errorContainer.hidden = false;
        errorContainer.innerHTML = `
            <p>Something went wrong. The automatic redirect was stopped.</p>
            <a href="${CONFIG.REDIRECT_URL}" class="button button-offline" style="margin-top: 1rem;">
                Visit Updated Portfolio
            </a>
        `;
    }
}