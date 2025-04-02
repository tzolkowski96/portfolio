// Connection status checking functionality
const connectionStatus = document.getElementById('connection-status');
const retryButton = document.getElementById('retry-button');
const copyButton = document.getElementById('copy-button');
const copyToast = document.getElementById('copy-toast');
const portfolioUrl = 'https://tobin-data-portfolio.netlify.app/';

// Check connection status on page load
function checkConnectionStatus() {
    if (navigator.onLine) {
        connectionStatus.textContent = 'You are online! Redirecting shortly...';
        connectionStatus.className = 'connection-status status-online';
        
        // Auto-redirect after a short delay if we're online
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
    } else {
        connectionStatus.textContent = 'You are currently offline. Please check your connection.';
        connectionStatus.className = 'connection-status status-offline';
    }
}

// Function to retry connection
function retryConnection() {
    connectionStatus.textContent = 'Checking connection...';
    connectionStatus.className = 'connection-status status-checking';
    
    // Disable the button temporarily to prevent spamming
    retryButton.disabled = true;
    
    // Use a slight delay to make the checking status visible
    setTimeout(() => {
        if (navigator.onLine) {
            connectionStatus.textContent = 'Connection restored! Redirecting...';
            connectionStatus.className = 'connection-status status-online';
            
            // Redirect to the main page after a brief delay
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } else {
            connectionStatus.textContent = 'Still offline. Please check your network connection.';
            connectionStatus.className = 'connection-status status-offline';
            retryButton.disabled = false;
        }
    }, 1000);
}

// Function to copy the portfolio URL to clipboard
function copyPortfolioUrl() {
    // Use modern clipboard API with fallback
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(portfolioUrl)
            .then(() => showCopyToast())
            .catch(err => {
                console.error('Failed to copy: ', err);
                fallbackCopy();
            });
    } else {
        fallbackCopy();
    }
}

// Fallback copy method for browsers without clipboard API
function fallbackCopy() {
    const tempInput = document.createElement('input');
    tempInput.value = portfolioUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    
    try {
        const success = document.execCommand('copy');
        if (success) {
            showCopyToast();
        } else {
            alert('Copy failed. Please copy the URL manually: ' + portfolioUrl);
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        alert('Copy failed. Please copy the URL manually: ' + portfolioUrl);
    }
    
    document.body.removeChild(tempInput);
}

// Show the copy success toast notification
function showCopyToast() {
    copyToast.hidden = false;
    
    // Hide the toast after animation completes
    setTimeout(() => {
        copyToast.hidden = true;
    }, 2500);
}

// Monitor online/offline status
window.addEventListener('online', () => {
    checkConnectionStatus();
});

window.addEventListener('offline', () => {
    connectionStatus.textContent = 'You just went offline. Please check your connection.';
    connectionStatus.className = 'connection-status status-offline';
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', checkConnectionStatus);

// Attach event listeners to buttons
if (retryButton) {
    retryButton.addEventListener('click', retryConnection);
}

if (copyButton) {
    copyButton.addEventListener('click', copyPortfolioUrl);
}