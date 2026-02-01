# Tobin Zolkowski — Portfolio

A minimalist, high-performance portfolio website for a Data Analyst & Writer. Designed with a focus on clean typography, accessibility, and a custom ETL pipeline visualization.

[Live Demo](https://tobinzolkowski.github.io/portfolio/) <!-- Update this once deployed -->

## 🛠 Tech Stack

- **HTML5**: Semantic structure.
- **CSS3**: Custom variables, grid layout, and complex animations.
- **Vanilla JavaScript (ES6+)**: Modular code with an Object-Oriented approach for the canvas visualization.
- **Canvas API**: Custom-built background animation representing data infrastructure.
- **Google Fonts**: Crimson Pro (Serif) and Space Mono (Monospace).

## ✨ Key Features

- **ETL Pipeline Visualization**: A generative background animation that mimics data flow: `SOURCE` → `EXTRACT` → `TRANSFORM` → `LOAD` → `OUTPUT`.
- **Accessibility First**: 
    - Full keyboard navigation support with visible focus states.
    - Skip links for screen readers.
    - `prefers-reduced-motion` support (freezes animation and transitions).
    - High contrast color palette.
- **Responsive Design**: Fluid layouts that adapt from mobile to ultra-wide displays.
- **Modular Architecture**: Clean separation of concerns with dedicated `/css` and `/js` modules.
- **GitHub Pages Optimized**: Custom 404 page and `.nojekyll` configuration for seamless deployment.

## 📂 Project Structure

```text
portfolio/
├── css/
│   └── style.css      # Core styles and design tokens
├── js/
│   ├── main.js         # UI logic and global orchestration
│   └── pipeline.js     # Class-based Canvas visualization
├── 404.html            # Themed error page
├── index.html          # Main entry point
├── README.md           # Documentation
└── .gitignore          # Environment & OS file exclusions
```

## 🚀 Local Development

To run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/tzolkowski96/portfolio.git
   ```
2. Open `index.html` in your browser, or use a local server like VS Code's **Live Server** extension for the best experience.

## 📦 Deployment

This site is optimized for **GitHub Pages**.

1. Push your changes to the `main` branch.
2. In GitHub, go to **Settings > Pages**.
3. Set the source to `Deploy from a branch`.
4. Select `Branch: main` and `Folder: / (root)`.
5. Click **Save**.

## 📧 Connect

- **GitHub**: [@tzolkowski96](https://github.com/tzolkowski96)
- **LinkedIn**: [tobin-zolkowski-844873200](https://www.linkedin.com/in/tobin-zolkowski-844873200/)
- **Writing**: [Medium](https://medium.com/@grateful_aqua_goat_147) | [Substack](https://substack.com/@tobinzolkowski)

---

## ⚖️ License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


