/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Only emit hover styles on devices that actually support hover, so they
  // don't "stick" after a tap on touch screens.
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        // Surfaces (dominant ~60%)
        cream: '#e7e7e3', //  page canvas        — ink on it = 14.61:1
        panel: '#f0f0ec', //  raised surface     — ink on it = 15.86:1
        sunk: '#dededa', //   sunk strip
        // Text / structure (secondary ~30%)
        ink: '#161614', //    primary text + inverted ground
        'ink-2': '#2f2f2b', // secondary body     — on cream = 10.84:1
        label: '#565650', //  mono micro-labels   — on cream = 5.96:1  (fixes --mute)
        index: '#5b5b54', //  index numerals/meta — on cream = 5.52:1  (fixes --faint)
        cream2: '#f3f3ef', //  light text on ink  — = 16.29:1
        // Accent (~10%)
        signal: '#c41f00', //         red AS TEXT/UI — on cream = 4.78:1 (fixes --sig text)
        'signal-graphic': '#ff2d16', // red GRAPHIC-ONLY (>=24px) — = 3.00:1, never text
        // Structure strokes
        hairline: '#c2c2bb', //     decorative 1px divider (1.44:1, never sole signal)
        'rule-strong': '#565650', // meaningful UI stroke   (5.96:1)
        // States
        focus: '#1d4ed8', //   focus-visible ring (5.41:1) — blue, not the accent
        error: '#b21f12', //   form error         (5.47:1)
        success: '#15724a', // form success       (4.79:1)
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
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
        'display-l': ['clamp(1.5rem, 6vw, 3.5rem)', { lineHeight: '1', letterSpacing: '-0.01em' }],
        'display-xl': ['clamp(2.5rem, 12vw, 7.5rem)', { lineHeight: '0.86', letterSpacing: '-0.025em' }],
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
        signalPulse: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.25' } },
      },
      animation: {
        'signal-pulse': 'signalPulse 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
