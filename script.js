'use strict'; // Enable strict mode

// Simple, lightweight redirect script

// --- Configuration ---
const CONFIG = {
    REDIRECT_URL: 'https://tobin-data-portfolio.netlify.app/',
    REDIRECT_DELAY_SECONDS: 8,
    COPY_SUCCESS_DELAY_MS: 2000,
    REDIRECT_FADE_MS: 300,
    THEME_STORAGE_KEY: 'themePreference' // Key for localStorage
};

// --- Global Variables ---
let countdownInterval;
let redirectCancelled = false;
let toastTimer = null;

// --- DOM Elements ---
let countdownEl, countdownCircle, countdownProgress, cancelButton, copyButton,
    copyToast, errorContainer, redirectButton, onlineContent, offlineNotice,
    retryButton, countdownTextEl, copyIconDefault, copyIconSuccess,
    themeToggleButton, themeIconLight, themeIconDark, qrCodeContainer;

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded - Vercel-style Redirect");
    assignDOMElements();
    setupEventListeners();
    initializeTheme();
    handleConnectionChange();
    generateQRCode();
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
    // Theme elements
    themeToggleButton = document.getElementById('theme-toggle');
    themeIconLight = document.getElementById('theme-icon-light');
    themeIconDark = document.getElementById('theme-icon-dark');
    qrCodeContainer = document.getElementById('qrcode-container');
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    if (cancelButton) cancelButton.addEventListener('click', cancelRedirect);
    if (copyButton) copyButton.addEventListener('click', handleCopyUrl);
    if (retryButton) {
        retryButton.addEventListener('click', () => {
            // Add a small delay before reload to allow visual feedback
            retryButton.setAttribute('disabled', 'true');
            retryButton.textContent = 'Retrying...';
            setTimeout(() => window.location.reload(), 300);
        });
    }
    if (themeToggleButton) themeToggleButton.addEventListener('click', toggleTheme);

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
    // Use capturing phase for global errors to catch them earlier if needed
    window.addEventListener('error', handleGlobalError, true);
    window.addEventListener('unhandledrejection', (event) => handleGlobalError({ error: event.reason }), true);

    // Preload destination site for faster redirect
    setTimeout(() => {
        try {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = CONFIG.REDIRECT_URL;
            document.head.appendChild(link);
        } catch (e) {
            console.warn("Failed to add prefetch link:", e);
        }
    }, 2000);
}

// --- Theme Handling ---
function initializeTheme() {
    const isDark = document.documentElement.classList.contains('dark-theme');
    console.log(`Initial theme detected: ${isDark ? 'dark' : 'light'}`);
    updateThemeToggleButton(isDark);
}

function applyTheme(theme) {
    document.documentElement.classList.remove('light-theme', 'dark-theme');
    document.documentElement.classList.add(`${theme}-theme`);
    localStorage.setItem(CONFIG.THEME_STORAGE_KEY, theme);
    updateThemeToggleButton(theme === 'dark');
    console.log(`Theme applied: ${theme}`);
}

function toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark-theme');
    const newTheme = isDark ? 'light' : 'dark';
    applyTheme(newTheme);
    generateQRCode(); // Regenerate QR code with new theme colors
}

function updateThemeToggleButton(isDark) {
    if (!themeToggleButton || !themeIconLight || !themeIconDark) return;
    if (isDark) {
        themeIconLight.style.display = 'none';
        themeIconDark.style.display = 'inline-block';
        themeToggleButton.setAttribute('aria-label', 'Switch to light mode');
        themeToggleButton.title = 'Switch to light mode';
    } else {
        themeIconLight.style.display = 'inline-block';
        themeIconDark.style.display = 'none';
        themeToggleButton.setAttribute('aria-label', 'Switch to dark mode');
        themeToggleButton.title = 'Switch to dark mode';
    }
}

// --- QR Code Generation ---
// --- QR Code Generation ---
function generateQRCode() {
    if (!qrCodeContainer || typeof QRCode === 'undefined') {
        console.warn("QR Code container or library not found.");
        return;
    }

    qrCodeContainer.innerHTML = '';

    try {
        const isDark = document.documentElement.classList.contains('dark-theme');
        new QRCode(qrCodeContainer, {
            text: CONFIG.REDIRECT_URL,
            width: 100,
            height: 100,
            colorDark: isDark ? "#ffffff" : "#000000",
            colorLight: isDark ? "#111111" : "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
        console.log("QR Code generated for:", CONFIG.REDIRECT_URL);
    } catch (error) {
        console.error("Failed to generate QR Code:", error);
        if (errorContainer) {
            errorContainer.textContent = "Failed to generate QR Code.";
            errorContainer.hidden = false;
        }
    }
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
    showToast("Automatic redirect cancelled", "info"); // Add type
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

// --- Toast Notification ---
function showToast(message = "Action completed", type = "success") { // Add type parameter
    if (!copyToast) return;

    // Clear any existing timer to prevent overlaps
    if (toastTimer) {
        clearTimeout(toastTimer);
        toastTimer = null;
    }

    copyToast.textContent = message;
    copyToast.className = 'toast'; // Reset classes
    copyToast.classList.add(`toast-${type}`); // Add type class (optional styling)
    copyToast.hidden = false;

    // Force reflow to restart animation if needed
    void copyToast.offsetWidth;

    copyToast.classList.add('visible');
    copyToast.setAttribute('role', type === 'error' ? 'alert' : 'status'); // Adjust role based on type

    toastTimer = setTimeout(() => {
        copyToast.classList.remove('visible');
        // Wait for fade out transition before hiding
        setTimeout(() => {
            copyToast.hidden = true;
            toastTimer = null;
        }, 300); // Match CSS transition duration
    }, CONFIG.COPY_SUCCESS_DELAY_MS);
}

// --- Error Handling ---
function handleGlobalError(event) {
    // Extract error details safely
    let errorMessage = 'An unexpected error occurred.'; // Default message
    let errorStack = '';

    try { // Add try...catch around extraction
        if (event instanceof ErrorEvent) {
            errorMessage = event.message || errorMessage;
            errorStack = event.error?.stack;
        } else if (event.error) { // For unhandled rejections or custom events
            errorMessage = event.error.message || String(event.error) || errorMessage;
            errorStack = event.error.stack;
        } else if (event.reason) { // For unhandled rejections
            errorMessage = event.reason.message || String(event.reason) || errorMessage;
            errorStack = event.reason.stack;
        } else if (typeof event === 'string') {
            errorMessage = event || errorMessage;
        }
    } catch (e) {
        console.error("Error while extracting error message:", e);
        // Keep the default errorMessage
    }

    // Ensure errorMessage is never empty or null before display
    const finalErrorMessage = errorMessage || 'An unspecified error occurred.';

    console.error('Unhandled Error:', finalErrorMessage, '\nStack:', errorStack || 'N/A', '\nEvent:', event);
    stopCountdown(); // Ensure countdown stops

    // Prevent multiple error messages
    if (errorContainer && !errorContainer.hidden) {
        console.warn("Error container already visible.");
        return;
    }

    if (errorContainer) {
        errorContainer.hidden = false;
        // Ensure the error message paragraph always shows the final message
        errorContainer.innerHTML = `
            <p><strong>Oops!</strong> Something went wrong.</p>
            <p>The automatic redirect has been stopped. You can still visit the updated portfolio manually.</p>
            <a href="${CONFIG.REDIRECT_URL}" class="button" rel="noopener noreferrer" style="margin-top: 0.5rem;">
                Visit Updated Portfolio
            </a>
            <p style="font-size: 0.8rem; opacity: 0.7; margin-top: 0.5rem;">Error: ${finalErrorMessage}</p>
        `;
        // Focus the container for screen readers
        errorContainer.setAttribute('tabindex', '-1'); // Make it focusable
        errorContainer.focus();
    } else {
        // Fallback if error container doesn't exist
        showToast(`Error: ${finalErrorMessage}. Redirect stopped.`, "error");
    }
}