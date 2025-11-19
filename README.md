# Tobin Zolkowski - Personal Site

A personal portfolio and writing showcase built with a focus on **Swiss Minimalist** design principles and subtle interactivity.

## Design Philosophy

- **Theme:** "Swiss Minimalist" / Editorial
- **Typography:** High contrast pairing of `Space Grotesk` (Display) and `Inter` (Body), with `JetBrains Mono` for technical details.
- **Visuals:** Black & white aesthetic with a custom Three.js particle system ("Neural Data Flow") representing the intersection of biological and digital data.
- **Accessibility:** Built with semantic HTML, ARIA labels, and reduced-motion support.

## Tech Stack

- **Core:** Vanilla HTML5, CSS3 (Custom Properties), JavaScript (ES6+)
- **Graphics:** [Three.js](https://threejs.org/) for the interactive background
- **Build:** None. No frameworks, no bundlers. Just raw, performant code.

## Structure

```
├── index.html          # Main entry point
├── serve.py            # Simple Python dev server
├── assets/
│   ├── css/
│   │   └── style.css   # Main stylesheet (Design System)
│   ├── js/
│   │   ├── main.js     # UI logic (Scroll spy, mobile menu)
│   │   ├── three-scene.js # 3D particle background
│   │   └── three.min.js   # Vendorized Three.js library
│   └── images/
│       └── favicon.svg # Custom SVG favicon
└── feed.json           # JSON Feed for syndication
```

## Features

- **Responsive Design:** Fluid typography and layout that adapts from large desktop screens to mobile devices.
- **Performance:** Zero build steps, vendorized dependencies, and optimized assets for fast load times.
- **Interactive Background:** A custom Three.js particle system that responds to mouse movement, optimized for battery life on mobile.
- **Accessibility:** Semantic HTML, keyboard navigation support, and respect for `prefers-reduced-motion`.

## Local Development

### Prerequisites
- Python 3.x (for the local server)

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tzolkowski96/portfolio.git
   cd portfolio
   ```

2. **Start the local server:**
   ```bash
   python3 serve.py
   ```
   This will start a server at `http://localhost:8000` and attempt to open your default browser.

## Deployment

This site is designed to be hosted on **GitHub Pages**.
- The `main` branch is served directly.
- No build process is required.

## License

Content © 2025 Tobin Zolkowski.
Code available under the MIT License.
