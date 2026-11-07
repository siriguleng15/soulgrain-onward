import { defineConfig } from 'vite';
export default defineConfig({publicDir:'public',build:{copyPublicDir:false,rollupOptions:{input:'golden-derivation.html'}}});
