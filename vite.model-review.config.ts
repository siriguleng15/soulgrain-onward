import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// Isolated review build: no production entry, existing lab, or advertising assets.
export default defineConfig({
  publicDir: false,
  build: {
    rollupOptions: { input: fileURLToPath(new URL('./model-review.html', import.meta.url)) },
  },
});
