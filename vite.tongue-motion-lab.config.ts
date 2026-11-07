import { defineConfig } from 'vite';
export default defineConfig({ base: './', cacheDir: '/tmp/tongue-motion-v1-1-vite-cache', build: { copyPublicDir: false, outDir: '/tmp/tongue-motion-lab-v1-1-build', emptyOutDir: true, rollupOptions: { input: 'tongue-motion-lab.html' } }, server: { host: '0.0.0.0', port: 4552, strictPort: true } });
