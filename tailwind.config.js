/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Only emit hover styles on devices that actually support hover, so they
  // don't "stick" after a tap on touch screens.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        // INVERTED BRAND — the original cream/ink palette flipped to dark.
        // Token names are semantic roles, so every existing pairing survives.
        // Surfaces (dominant ~60%)
        cream: '#121211', //  page canvas (near-black)
        panel: '#1a1a19', //  raised surface
        sunk: '#0c0c0b', //   sunk strip
        // Text / structure (secondary ~30%)
        ink: '#f3f3ef', //    primary text + inverted ground — on canvas = 16.1:1
        'ink-2': '#cfcfc8', // secondary body                — on canvas ≈ 12:1
        label: '#a3a39c', //  mono micro-labels              — on canvas ≈ 6.9:1
        index: '#97978f', //  index numerals/meta            — on canvas ≈ 6.1:1
        cream2: '#161614', // dark text on the now-light inverted blocks (footer, buttons)
        // B&W: hierarchy is value + weight + scale. Red = accent law only.
        accent: '#ff2d16', // THE ONLY BRAND CHROMA — T/Z slash, live dot, ::selection bg. Nothing else. ≈4.9:1 vs cream2 (AA).
        // Structure strokes
        hairline: '#2e2e2b', //     decorative 1px divider (never the sole signal)
        'rule-strong': '#8a8a82', // meaningful UI stroke (≈5.2:1)
        // States
        focus: '#f3f3ef', //   white focus ring, outside-stroke channel; footer overrides to cream2
        error: '#ff8073', //   the single argued red exception — failed-send status only, ≈7.7:1
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'Times New Roman', 'serif'],
        mono: ['"Spline Sans Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'mono-label': ['0.6875rem', { lineHeight: '1.45', letterSpacing: '0.14em' }], // 11
        nav: ['0.75rem', { lineHeight: '1', letterSpacing: '0.12em' }], // 12
        'mono-data': ['0.8125rem', { lineHeight: '1.7' }], // 13
        'body-sm': ['0.9375rem', { lineHeight: '1.6' }], // 15
        body: ['1.0625rem', { lineHeight: '1.6' }], // 17
        'body-lg': ['1.125rem', { lineHeight: '1.5' }], // 18
        'title-sm': ['1rem', { lineHeight: '1.2' }], // 16
        title: ['1.1875rem', { lineHeight: '1.15' }], // 19
        'display-m': ['clamp(1.375rem, 3.5vw, 1.875rem)', { lineHeight: '1.22', letterSpacing: '-0.01em' }],
        metric: ['clamp(1.75rem, 3.4vw, 2.625rem)', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'display-l': ['clamp(1.75rem, 5.5vw, 4rem)', { lineHeight: '0.95', letterSpacing: '-0.015em' }],
        'display-xl': ['clamp(2.25rem, 8vw, 5.25rem)', { lineHeight: '1.04', letterSpacing: '-0.015em' }],
        'display-card': ['clamp(2.5rem, 16cqw, 15rem)', { lineHeight: '0.84', letterSpacing: '-0.03em' }],
      },
      transitionDuration: {
        brand: '200ms',
      },
      transitionTimingFunction: {
        brand: 'cubic-bezier(0.33, 0, 0.2, 1)',
      },
      letterSpacing: {
        kicker: '0.14em',
        nav: '0.12em',
      },
      // 48px minimum touch target (Fitts) + reading/container measures.
      minHeight: { tap: '48px' },
      minWidth: { tap: '48px' },
      maxWidth: { reading: '66ch', container: '1200px' },
      keyframes: {
        livePulse: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.25' } },
      },
      animation: {
        'live-pulse': 'livePulse 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
