import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves the production build under /portfolio/, but local dev/preview
// is simplest at the server root — so base is conditional on the command.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/portfolio/' : '/',
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  build: {
    target: 'es2020',
    cssCodeSplit: false,
  },
}))
