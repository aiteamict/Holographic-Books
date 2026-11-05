import { defineConfig } from 'vite';

// Relative base so the same build runs at the site root, in a GitHub Pages project path (/repo/), or from a folder.
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 1400 },
});
