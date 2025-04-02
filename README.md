# Portfolio Redirect Site

A clean, professional redirect page that automatically sends visitors to my new portfolio location.

## Features

- Automatic redirection with a countdown timer
- Mobile responsive design
- Dark/light mode support based on system preferences
- Offline support with service worker
- Progressive Web App (PWA) capabilities
- Accessibility optimized

## GitHub Pages Deployment

This site is configured to automatically deploy to GitHub Pages using the standard GitHub Pages deployment method.

### How to Enable GitHub Pages for this Repository

To deploy this site to GitHub Pages:

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. In the left sidebar, click on "Pages"
4. Under "Source", select "Deploy from a branch"
5. Choose "main" branch and "/" (root) folder
6. Click "Save"
7. Your site will be published at https://[username].github.io/portfolio/

## Local Development

To run this project locally:

1. Clone the repository
2. Open index.html in a browser or use a local server
   ```
   python -m http.server
   ```
3. Visit http://localhost:8000

## Icon Generation

The repository includes a script to generate all required icon sizes from the SVG source files:

```
cd img
chmod +x generate-icons.sh
./generate-icons.sh
```

This requires librsvg2-bin and ImageMagick to be installed:
- On macOS: `brew install librsvg imagemagick`
- On Ubuntu/Debian: `sudo apt-get install librsvg2-bin imagemagick`

## Customization

To customize for your own use:

1. Update the redirect URL in js/script.js
2. Modify the content in index.html
3. Adjust the colors in css/style.css
4. Replace icon designs in img/favicon.svg

## License

MIT