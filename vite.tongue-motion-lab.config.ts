import { defineConfig } from 'vite';
export default defineConfig({ base: './', cacheDir: '/tmp/tongue-motion-vite-cache', build: { copyPublicDir: false, outDir: '/tmp/tongue-motion-lab-v1-build', emptyOutDir: true, rollupOptions: { input: 'tongue-motion-lab.html' } }, server: { host: '0.0.0.0', port: 4550, strictPort: true } });
