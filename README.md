# Portfolio Redirect Page

A clean, professional redirect page that automatically forwards visitors to my updated portfolio website hosted on Netlify. This project includes offline detection, a visual countdown, and accessibility features.

![Portfolio Redirect Preview](https://via.placeholder.com/800x400?text=Portfolio+Redirect+Preview)

## Features

- ⏱️ Visual countdown with circular progress indicator
- 🔄 Automatic redirection after configurable delay
- ✋ Option to cancel automatic redirect
- 📋 One-click URL copying functionality
- 🔌 Offline detection and handling
- 🌓 Automatic dark/light mode based on system preference
- ♿ Fully accessible with keyboard navigation and screen reader support
- 📱 Responsive design for all device sizes
- 🚀 Performance optimized with resource preloading

## Technologies Used

- HTML5
- CSS3 (with CSS variables for theming)
- Vanilla JavaScript (no dependencies)

## Setup Instructions

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/portfolio.git
   cd portfolio
   ```

2. Customize the configuration in `script.js`:
   ```javascript
   const CONFIG = {
       REDIRECT_URL: 'https://tobin-data-portfolio.netlify.app/',
       REDIRECT_DELAY_SECONDS: 8,
       COPY_SUCCESS_DELAY_MS: 2000,
       REDIRECT_FADE_MS: 300
   };
   ```

3. Update the meta tags in `index.html` with your information:
   ```html
   <meta property="og:title" content="Portfolio Update | Tobin's Data Analysis">
   <meta property="og:description" content="My data analysis portfolio has been updated and moved to a new platform. Explore new projects and visualizations.">
   <meta property="og:url" content="https://tobin-data-portfolio.netlify.app/">
   ```

4. Deploy to your preferred hosting service (GitHub Pages, Netlify, Vercel, etc.)

## GitHub Pages Deployment

This redirect site is optimized to work with GitHub Pages:

1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/yourusername/portfolio.git
   git branch -M main
   git push -u origin main
   ```

2. Enable GitHub Pages:
   - Go to your repository settings
   - Navigate to the "Pages" section
   - Select the branch you want to deploy (e.g., `main`)
   - Click "Save"

3. GitHub Pages Specific Considerations:
   - If you're using a project repository (not username.github.io), your site will be available at `https://yourusername.github.io/portfolio/`
   - All resource paths (CSS, JS) are relative, so they'll work correctly with the repository base path
   - Add a `.nojekyll` file in your repository root to prevent Jekyll processing if you encounter any issues with files/folders starting with underscores

4. Custom Domain (Optional):
   - In repository settings, under "Pages", enter your custom domain
   - Create a CNAME record with your DNS provider pointing to `yourusername.github.io`
   - Add a `CNAME` file in your repository root containing your custom domain

5. Verify Redirect URL:
   - Ensure the `REDIRECT_URL` in your CONFIG object points to your Netlify portfolio
   - If using relative URLs anywhere, update them to be absolute URLs

## Customization

### Changing Colors

The color scheme can be customized by modifying the CSS variables in `style.css`:

```css
:root {
    /* Light Theme */
    --light-bg: #f8fafc;
    --light-card: #ffffff;
    --light-text: #1a202c;
    /* Other color variables... */

    /* Dark Theme */
    --dark-bg: #1a202c;
    --dark-card: #2d3748;
    --dark-text: #f7fafc;
    /* Other color variables... */
}
```

### Adjusting Countdown Time

Modify the `REDIRECT_DELAY_SECONDS` value in the `CONFIG` object in `script.js`.

### Logo Customization

Replace the logo text "T" in `index.html` with your own initial or logo:

```html
<div class="logo">T</div> <!-- Already set to T for Tobin -->
```

## Browser Support

- Chrome, Firefox, Safari, Edge (latest versions)
- IE11 not supported

## Accessibility

This project adheres to WCAG 2.1 AA standards:
- Proper heading structure
- Appropriate ARIA attributes
- Keyboard navigable
- Screen reader friendly
- Supports reduced motion preferences

## License

MIT License - Feel free to use and modify for your own projects.

## Author

Tobin Zolkowski - [Data Analysis Portfolio](https://tobin-data-portfolio.netlify.app/)

## Note About Platform Change

This redirect page was created to smoothly transition visitors from my previous portfolio location to my new Netlify-hosted portfolio. The updated portfolio offers improved performance, better project showcases, and enhanced data visualizations.
