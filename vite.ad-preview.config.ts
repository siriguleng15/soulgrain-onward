import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// Independent advertising build: no original website/workbench entry or public copy.
export default defineConfig({
  publicDir: false,
  build: {
    rollupOptions: { input: fileURLToPath(new URL('./onward-ad.html', import.meta.url)) },
  },
});
