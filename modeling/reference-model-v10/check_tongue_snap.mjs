/** Real exported geometry check. Visibility, not real snap manufacturing. */
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {Vector3,Raycaster,DoubleSide} from 'three';
const root='public/reference-model-v10/';
const bytes=await readFile(root+'corrected.glb');
const {scene}=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');
scene.updateMatrixWorld(true);scene.traverse(o=>{if(o.isMesh)o.material.side=DoubleSide;});
const meta=JSON.parse(await readFile(root+'model-validation.json'));
const toGL=p=>new Vector3(p[0],p[2],-p[1]);
const c=toGL(meta.tongueSnapCap.center),n=toGL(meta.tongueSnapCap.normal);
const upBpy=new Vector3(0,0,1),normalBpy=new Vector3(...meta.tongueSnapCap.normal);
const uBpy=normalBpy.clone().cross(upBpy).normalize(),vBpy=normalBpy.clone().cross(uBpy);
const u=toGL(uBpy.toArray()),v=toGL(vBpy.toArray()),direction=new Vector3(0,-.12,-1).normalize();
const checks=[];
for(const fraction of [0,.35,.65])for(let j=0;j<(fraction?12:1);j++){
 const a=j/12*Math.PI*2,target=c.clone().addScaledVector(u,meta.tongueSnapCap.radiusModelUnits*fraction*Math.cos(a)).addScaledVector(v,meta.tongueSnapCap.radiusModelUnits*fraction*Math.sin(a));
 const hit=new Raycaster(target.clone().addScaledVector(direction,-5),direction).intersectObject(scene,true)[0];
 const passed=hit?.object.name==='Tongue_Original_Position_Snap_Cap';
 checks.push({fraction,angleDegrees:j*30,passed,firstMesh:hit?.object.name??null});
 assert.ok(passed,'Photo-visible snap interior is hidden by '+hit?.object.name);
}
const cap=scene.getObjectByName('Tongue_Original_Position_Snap_Cap');assert.ok(cap?.isMesh);
const p=cap.geometry.getAttribute('position'),index=cap.geometry.index,edges=new Map();
// GLTF duplicates split normals: weld by coordinates for a geometric edge check.
const keys=Array.from({length:p.count},(_,i)=>[p.getX(i),p.getY(i),p.getZ(i)].map(x=>x.toFixed(7)).join(','));
for(let i=0;i<index.count;i+=3){const ids=[0,1,2].map(k=>keys[index.getX(i+k)]);for(let k=0;k<3;k++){const key=[ids[k],ids[(k+1)%3]].sort().join('|');edges.set(key,(edges.get(key)??0)+1);}}
const boundaryEdges=[...edges.values()].filter(x=>x===1).length,nonManifoldEdges=[...edges.values()].filter(x=>x>2).length;
assert.equal(boundaryEdges,0);assert.equal(nonManifoldEdges,0);
const report={schemaVersion:1,testedAt:new Date().toISOString(),modelSha256:createHash('sha256').update(bytes).digest('hex'),environment:'Node GLTFLoader, actual corrected GLB, source orthographic side audit camera',checks,boundaryEdges,nonManifoldEdges,capTriangles:index.count/3,productionReady:false,limitations:['This verifies a closed visible cap in the reference-side view, not hidden snap/socket manufacture.','Source coordinates have no independent physical millimetre calibration.']};
await writeFile(root+'verification/tongue-snap-validation.json',JSON.stringify(report,null,2)+'\n');
console.log('PASS actual tongue cap: '+checks.length+' first-visible-surface rays; closed geometric edges; '+report.modelSha256);
