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
├── assets/
│   ├── css/
│   │   └── style.css   # Main stylesheet (Design System)
│   └── js/
│       ├── main.js     # UI logic (Scroll spy, mobile menu)
│       └── three-scene.js # 3D particle background
├── serve.py            # Simple Python dev server
└── feed.json           # JSON Feed for syndication
```

## Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tzolkowski96/portfolio.git
   cd portfolio
   ```

2. **Start the local server:**
   ```bash
   python3 serve.py
   ```

3. **View the site:**
   Open [http://localhost:8000](http://localhost:8000) in your browser.

## License

Content © 2025 Tobin Zolkowski.
Code available under the MIT License.
