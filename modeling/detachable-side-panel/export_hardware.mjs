/** Preserve the same selected original connector triangles for editable export. */
import {readFile,writeFile}from'node:fs/promises';
import {createHash}from'node:crypto';
import {GLTFLoader}from'three/addons/loaders/GLTFLoader.js';
import {HardwareLayer}from'../../src/detachable-side-panel/HardwareLayer.ts';
const root='public/detachable-side-panel/',bytes=await readFile('public/reference-model-v10/corrected.glb');
const model=JSON.parse(await readFile('public/reference-model-v10/model-data.json'));
const design=JSON.parse(await readFile('public/pattern-engineering/data/clasp-design.json'));
const loaded=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
let visibility;try{visibility=JSON.parse(await readFile(root+'hardware-visibility.json'));}catch(error){if(error.code!=='ENOENT')throw error;}
const layer=new HardwareLayer(loaded.scene,model.photoRegistration,design,visibility);
const pieces=layer.pieces.map(p=>{const mesh=p.group.children.find(o=>o.isMesh);return{name:mesh.name,pivot:p.pivot.toArray(),axis:p.axis.toArray(),sign:p.sign,positions:Array.from(mesh.geometry.getAttribute('position').array),normals:Array.from(mesh.geometry.getAttribute('normal').array),color:p.material.color.toArray(),roughness:p.material.roughness,metalness:p.material.metalness};});
const report={sourceModelSha256:createHash('sha256').update(bytes).digest('hex'),source:'Selected original corrected GLB triangles; ROI from existing final strap design, not new connector geometry.',pieces,sourceTriangles:layer.sourceTriangles,triangles:layer.triangles,productionReady:false};
await writeFile(root+'hardware-data.json',JSON.stringify(report)+'\n');
console.log('Original connector patches:',pieces.length,'pieces,',layer.triangles,'triangles');layer.dispose();
