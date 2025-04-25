# Portfolio Redirect Page

A clean, professional redirect page that automatically forwards visitors to my updated portfolio website hosted on Netlify. This project includes offline detection, a visual countdown, theme switching, and accessibility features.

<!-- TODO: Replace this placeholder with an actual screenshot of the redirect page -->
![Portfolio Redirect Preview](https://via.placeholder.com/800x400?text=Portfolio+Redirect+Preview)

## Features

- ⏱️ Visual countdown with circular progress indicator
- 🔄 Automatic redirection after configurable delay
- ✋ Option to cancel automatic redirect
- 📋 One-click URL copying functionality
- 📱 **QR Code Display:** Shows a QR code for the destination URL for easy scanning on mobile devices.
- 🔌 Offline detection and handling
- 🌓 **Manual & Automatic Theme Switching:** Supports system preference (light/dark) and allows users to toggle manually. Preference is saved in `localStorage`.
- ♿ Fully accessible with keyboard navigation and screen reader support
- 📱 Responsive design for all device sizes
- ✨ Subtle animations and improved focus states
- 🚀 Performance optimized with resource preloading and deferred script loading

## Technologies Used

- HTML5
- CSS3 (with CSS variables for theming)
- Vanilla JavaScript (ES6+, no dependencies)
- [qrcode.js](https://github.com/davidshimjs/qrcodejs) (for QR code generation - included in `vendor`)
- [Vanta.js](https://www.vantajs.com/) (for animated background - included in `vendor`)
- [Three.js](https://threejs.org/) (dependency for Vanta.js - included in `vendor`)

## Setup Instructions

1.  Clone this repository:
    ```bash
    git clone https://github.com/yourusername/portfolio.git # Replace with your repo URL
    cd portfolio
    ```

2.  Customize the configuration in `script.js`:
    ```javascript
    const CONFIG = {
        REDIRECT_URL: 'https://tobin-data-portfolio.netlify.app/', // Your target portfolio URL
        REDIRECT_DELAY_SECONDS: 8,      // How long before redirecting
        COPY_SUCCESS_DELAY_MS: 2000,   // How long the "Copied!" message shows
        REDIRECT_FADE_MS: 300,         // Fade out duration before redirect
        THEME_STORAGE_KEY: 'themePreference' // localStorage key for theme
    };
    ```

3.  Update the meta tags and title in `index.html` with your information:
    ```html
    <title>Portfolio Update | Your Name</title>
    <meta name="description" content="Your description here...">
    <meta property="og:title" content="Portfolio Update | Your Name">
    <meta property="og:description" content="Your OG description here...">
    <meta property="og:url" content="YOUR_REDIRECT_PAGE_URL"> <!-- URL of this redirect page -->
    <link rel="canonical" href="YOUR_TARGET_PORTFOLIO_URL"> <!-- URL from CONFIG.REDIRECT_URL -->
    <!-- Update Twitter meta tags as well -->
    ```

4.  (Optional) Customize the logo in `index.html`:
    ```html
    <div class="logo">Y</div> <!-- Replace Y with your initial or an SVG/img -->
    ```

5.  Deploy to your preferred hosting service (GitHub Pages, Netlify, Vercel, etc.).

    *Note: The `vendor` directory contains necessary libraries (qrcode.js, Vanta.js, Three.js). Ensure these are deployed along with your HTML, CSS, and JS files.*

## GitHub Pages Deployment

This redirect site is optimized to work with GitHub Pages:

1.  Push this repository to GitHub.
2.  Enable GitHub Pages in your repository settings (Settings -> Pages -> Build and deployment -> Source: Deploy from a branch -> Select `main` branch and `/ (root)` folder -> Save).
3.  **Important:** If your repository name is *not* `yourusername.github.io`, your site will be at `https://yourusername.github.io/repository-name/`. Ensure the `REDIRECT_URL` in `script.js` and the `canonical` link in `index.html` are correct absolute URLs.
4.  The `.nojekyll` file is included to prevent potential issues with GitHub Pages' default Jekyll processing.
5.  Custom Domain (Optional): Follow GitHub's documentation for setting up a custom domain. Update the `CNAME` file if needed.

## Customization

### Changing Colors & Theme

-   Modify the light and dark theme CSS variables in `style.css` under the `:root` selector.
-   The dark theme styles are applied when the `dark-theme` class is present on the `<html>` element (controlled by the inline script in `index.html` and the toggle button in `script.js`).
-   The theme toggle button allows users to override the system preference, saving the choice to `localStorage`.

### Adjusting Countdown Time

-   Modify the `REDIRECT_DELAY_SECONDS` value in the `CONFIG` object in `script.js`.

## Browser Support

-   Chrome, Firefox, Safari, Edge (latest versions)
-   Designed for modern browsers. IE11 is not supported.

## Accessibility

This project aims to adhere to WCAG 2.1 AA standards:
-   Semantic HTML structure
-   Appropriate ARIA attributes for dynamic content and controls
-   Keyboard navigable interface
-   Screen reader friendly text and announcements
-   Respects `prefers-reduced-motion` media query
-   Clear focus indicators

## License

MIT License - Feel free to use and modify for your own projects.

## Author

Tobin Zolkowski - [Data Analysis Portfolio](https://tobin-data-portfolio.netlify.app/)

## Note About Platform Change

This redirect page was created to smoothly transition visitors from my previous portfolio location to my new Netlify-hosted portfolio. The updated portfolio offers improved performance, better project showcases, and enhanced data visualizations.
