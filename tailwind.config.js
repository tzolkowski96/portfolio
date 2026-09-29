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
        // Text / structure (secondary ~30%)
        ink: '#f3f3ef', //    primary text + inverted ground — on canvas = 16.1:1
        'ink-2': '#cfcfc8', // secondary body                — on canvas ≈ 12:1
        label: '#a3a39c', //  mono micro-labels              — on canvas ≈ 6.9:1
        index: '#97978f', //  index numerals/meta            — on canvas ≈ 6.1:1
        cream2: '#161614', // dark text on light fills (inverted rows, submit button, selection)
        // B&W: hierarchy is value + weight + scale. Zero chroma anywhere.
        // Structure strokes
        hairline: '#2e2e2b', //     decorative 1px divider (never the sole signal)
        'rule-strong': '#8a8a82', // meaningful UI stroke (≈5.2:1)
        // States
        focus: '#f3f3ef', //   white focus ring, outside-stroke channel; inverted rows flip it to cream2
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
        title: ['1.1875rem', { lineHeight: '1.15' }], // 19
        'display-m': ['clamp(1.375rem, 3.5vw, 1.875rem)', { lineHeight: '1.22', letterSpacing: '-0.01em' }],
        // Serif display voice (Fraunces light): section titles, statements, quotes.
        'serif-l': ['clamp(1.625rem, 2.6vw, 2.25rem)', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        'serif-xl': ['clamp(2.25rem, 4vw, 3.5rem)', { lineHeight: '1.02', letterSpacing: '-0.025em' }],
      },
      transitionDuration: {
        brand: '200ms',
      },
      transitionTimingFunction: {
        brand: 'cubic-bezier(0.33, 0, 0.2, 1)',
      },
      letterSpacing: {
        kicker: '0.14em',
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
