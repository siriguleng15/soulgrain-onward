import {defineConfig} from 'vite';
export default defineConfig({base:'./',cacheDir:'/tmp/tongue-sleeve-vite-cache',build:{copyPublicDir:false,outDir:'/tmp/tongue-sleeve-lab-v1-build',emptyOutDir:true,rollupOptions:{input:'tongue-sleeve-lab.html'}},server:{host:'0.0.0.0',port:4542,strictPort:true}});
