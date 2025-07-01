# Portfolio Redirect Page

A clean, minimalist redirect page that automatically forwards visitors to my updated portfolio website hosted on Netlify. Built with Vercel-inspired design principles, this project prioritizes simplicity, accessibility, and mobile-first responsiveness.

<!-- TODO: Replace this placeholder with an actual screenshot of the redirect page -->
![Portfolio Redirect Preview](https://via.placeholder.com/800x400?text=Portfolio+Redirect+Preview)

## Features

- ⏱️ **Visual Countdown**: Clean circular progress indicator with 8-second auto-redirect
- ✋ **User Control**: Option to cancel automatic redirect
- 📋 **One-Click Copy**: URL copying functionality with visual feedback
- 📱 **QR Code**: Mobile-friendly QR code for easy scanning
- 🔌 **Offline Detection**: Graceful offline state handling
- 🌓 **Smart Theming**: System preference detection with manual toggle and time-based switching
- ♿ **Fully Accessible**: WCAG 2.1 AA compliant with keyboard navigation and screen reader support
- 📱 **Mobile-First**: Responsive design optimized for all device sizes
- ⚡ **Performance**: Lightweight and fast-loading

## Design Philosophy

This redirect page follows **Vercel's design principles**:
- **Minimal**: Clean, uncluttered interface with purposeful elements
- **Fast**: Lightweight with no unnecessary dependencies  
- **Accessible**: Keyboard navigation and screen reader friendly
- **Consistent**: Systematic spacing, typography, and color usage
- **Mobile-First**: Optimized for smaller screens, enhanced for larger ones

## Technologies Used

- **HTML5**: Semantic markup with accessibility attributes
- **CSS3**: Modern CSS with custom properties and mobile-first responsive design
- **Vanilla JavaScript**: ES6+ with no external dependencies for core functionality
- **QR Code.js**: Lightweight QR code generation (only external library)
- **Inter Font**: Clean, modern typography from Google Fonts

## Color Palette

### Light Theme (Default)
- Background: `#fafafa` (Vercel light gray)
- Card: `#ffffff` (Pure white)
- Text: `#000000` (Pure black)
- Secondary: `#666666` (Medium gray)
- Borders: `#eaeaea` (Light gray)
- Accent: `#000000` (Black - Vercel style)

### Dark Theme
- Background: `#000000` (Pure black)
- Card: `#111111` (Very dark gray)
- Text: `#ffffff` (Pure white)
- Secondary: `#888888` (Medium gray)
- Borders: `#333333` (Dark gray)
- Accent: `#ffffff` (White)

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/portfolio.git # Replace with your repo URL
   cd portfolio
   ```

2. **Configure the redirect URL** in `script.js`:
   ```javascript
   const CONFIG = {
       REDIRECT_URL: 'https://tobin-data-portfolio.netlify.app/', // Your target URL
       REDIRECT_DELAY_SECONDS: 8,      // Countdown duration
       COPY_SUCCESS_DELAY_MS: 2000,    // Toast message duration
       REDIRECT_FADE_MS: 300,          // Fade transition duration
       THEME_STORAGE_KEY: 'themePreference' // localStorage key
   };
   ```

3. **Update meta tags** in `index.html`:
   ```html
   <title>Portfolio Update | Your Name</title>
   <meta name="description" content="Your description here...">
   <meta property="og:title" content="Portfolio Update | Your Name">
   <meta property="og:url" content="YOUR_REDIRECT_PAGE_URL">
   <link rel="canonical" href="YOUR_TARGET_PORTFOLIO_URL">
   ```

4. **Customize the logo** (optional):
   ```html
   <div class="logo">YN</div> <!-- Replace with your initials -->
   ```

5. **Deploy** to your preferred hosting service (GitHub Pages, Netlify, Vercel, etc.)

   *Note: Only the `qrcode.min.js` library in the `vendor` directory is required for deployment.*

## File Structure

```
├── index.html          # Main HTML page
├── style.css           # Vercel-inspired CSS with theme support
├── script.js           # Vanilla JavaScript functionality
├── favicon.svg         # Responsive SVG favicon
├── README.md           # Documentation
└── vendor/
    └── qrcode.min.js   # QR code generation library
```

## Deployment

### GitHub Pages
1. Push to GitHub repository
2. Enable GitHub Pages (Settings → Pages → Deploy from branch → `main` → `/root`)
3. Update URLs in `script.js` and `index.html` meta tags
4. The `.nojekyll` file prevents Jekyll processing

### Vercel/Netlify
1. Connect your repository
2. Deploy with default build settings (no build step required)
3. Update configuration URLs as needed

## Customization

### Colors
Modify CSS custom properties in `style.css`:
```css
:root {
  --light-bg: #fafafa;        /* Background color */
  --light-accent: #000000;    /* Accent color */
  /* ... other variables */
}
```

### Timing
Adjust countdown and delays in `script.js`:
```javascript
const CONFIG = {
  REDIRECT_DELAY_SECONDS: 8,  // Auto-redirect time
  COPY_SUCCESS_DELAY_MS: 2000 // Toast duration
};
```

### Typography
Change font in `style.css`:
```css
:root {
  --font-family: 'Your Font', Inter, sans-serif;
}
```

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: iOS Safari, Chrome Mobile, Samsung Internet
- **No IE Support**: Designed for modern web standards

## Accessibility Features

This project follows **WCAG 2.1 AA** standards:
- **Semantic HTML**: Proper heading hierarchy and landmark regions
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Readers**: ARIA labels and live regions for dynamic content
- **Focus Management**: Clear focus indicators and logical tab order
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **Color Contrast**: High contrast ratios for readability
- **Touch Targets**: Minimum 44px for mobile accessibility

## Performance

- **Lightweight**: ~15KB total (HTML + CSS + JS)
- **No Build Step**: Static files ready for deployment
- **Fast Loading**: Optimized assets and minimal dependencies
- **Efficient**: Pure CSS animations and vanilla JavaScript

## License

MIT License - Feel free to use and modify for your own projects.

## Author

Tobin Zolkowski - [Data Analysis Portfolio](https://tobin-data-portfolio.netlify.app/)

## Changelog

### v2.0 - Vercel Style Redesign
- **Removed**: Vanta.js animated background and Three.js dependency
- **Redesigned**: Clean, minimal Vercel-inspired interface
- **Improved**: Mobile-first responsive design
- **Enhanced**: Performance and accessibility
- **Simplified**: Reduced dependencies and file size

### v1.0 - Initial Release
- Animated background with countdown redirect
- Theme switching and QR code generation
- Full accessibility support

---

**Note About Platform Change**: This redirect page smoothly transitions visitors from my previous portfolio location to my new Netlify-hosted portfolio, which offers improved performance, better project showcases, and enhanced data visualizations.
