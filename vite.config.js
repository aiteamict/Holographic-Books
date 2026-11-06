import { defineConfig } from 'vite';
import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// One site, many books. books/index.html is the library; every books/<slug>/index.html is a book, served at /<slug>/.
// Add a book by copying books/_template — no config change needed.
const root = resolve(__dirname, 'books');
const input = { library: resolve(root, 'index.html') };
for (const d of readdirSync(root, { withFileTypes: true }))
  if (d.isDirectory() && existsSync(resolve(root, d.name, 'index.html'))) input[d.name] = resolve(root, d.name, 'index.html');

// Relative base so the same build runs at the site root, in a GitHub Pages project path (/repo/), or from a folder.
export default defineConfig({
  root,
  base: './',
  publicDir: resolve(__dirname, 'public'),          // public/<slug>/... lands next to that book's page
  resolve: { alias: { '@engine': resolve(__dirname, 'engine') } },
  server: { fs: { allow: [__dirname] } },
  build: { outDir: resolve(__dirname, 'dist'), emptyOutDir: true, chunkSizeWarningLimit: 1400, rollupOptions: { input } },
});
