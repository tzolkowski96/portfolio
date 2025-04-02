document.addEventListener('DOMContentLoaded', () => {
    const retryButton = document.getElementById('retry-button');
    
    if (retryButton) {
        retryButton.addEventListener('click', () => {
            // Apply a small animation when clicked
            retryButton.classList.add('clicked');
            setTimeout(() => {
                retryButton.classList.remove('clicked');
            }, 200);
            
            // Try to reload the page
            window.location.reload();
        });
    }
    
    // Check connection status every 5 seconds in case we're back online
    let connectionChecker = setInterval(() => {
        if (navigator.onLine) {
            clearInterval(connectionChecker);
            window.location.href = '/';
        }
    }, 5000);
    
    // Listen for online events
    window.addEventListener('online', () => {
        window.location.href = '/';
    });
});