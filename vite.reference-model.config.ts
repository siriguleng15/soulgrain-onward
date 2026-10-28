import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({ publicDir:false,build:{rollupOptions:{input:fileURLToPath(new URL('./reference-model.html',import.meta.url))}} });
