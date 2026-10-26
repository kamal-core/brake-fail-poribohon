import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative asset paths for GitHub Pages, Netlify, and local hosting
  server: {
    host: true,
    port: 5173,
    open: false
  },
  build: {
    target: 'esnext'
  }
});
