import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
export default defineConfig({publicDir:false,build:{rollupOptions:{input:fileURLToPath(new URL('./immersive-showcase.html',import.meta.url))}}});
