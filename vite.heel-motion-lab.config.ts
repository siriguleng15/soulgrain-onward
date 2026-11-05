import {defineConfig} from 'vite';
export default defineConfig({base:'./',build:{copyPublicDir:false,outDir:'/tmp/heel-motion-lab-v1-build',emptyOutDir:true,rollupOptions:{input:'heel-motion-lab.html'}},server:{host:'0.0.0.0',port:4536,strictPort:true}});
