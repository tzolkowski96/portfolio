# Portfolio Redirect Site

A clean, professional redirect page that automatically sends visitors to my new portfolio location.

## Features

- Automatic redirection with a countdown timer
- Mobile responsive design
- Dark/light mode support based on system preferences
- Offline support with service worker
- Progressive Web App (PWA) capabilities
- Accessibility optimized

## Deployment Status

[![Deploy to GitHub Pages](https://github.com/username/portfolio/actions/workflows/deploy.yml/badge.svg)](https://github.com/username/portfolio/actions/workflows/deploy.yml)

## GitHub Pages Deployment

This site is configured to automatically deploy to GitHub Pages when changes are pushed to the main branch. The deployment process:

1. Automatically builds and optimizes the site
2. Generates all required icon sizes from SVG sources
3. Creates OpenGraph images for social sharing
4. Deploys to GitHub Pages

### How to Enable GitHub Pages for this Repository

After pushing this code to GitHub:

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. In the left sidebar, click on "Pages"
4. Under "Source", select "GitHub Actions"
5. The site will automatically deploy on the first push to main

## Local Development

To run this project locally:

1. Clone the repository
2. Open index.html in a browser or use a local server
   ```
   python -m http.server
   ```
3. Visit http://localhost:8000

## Customization

To customize for your own use:

1. Update the redirect URL in js/script.js
2. Modify the content in index.html
3. Adjust the colors in css/style.css
4. Replace icon designs in img/favicon.svg

## License

MIT