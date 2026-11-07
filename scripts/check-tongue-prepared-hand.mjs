/** Validate the actual downloadable Blender-exported GLB, not just lab parts. */
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {Box3,Mesh,SkinnedMesh} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
const root=new URL('../',import.meta.url),assets=new URL('public/tongue-sleeve-lab/assets/',root);
async function load(name){const bytes=await readFile(new URL(name,assets));return new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');}
const original=await load('user-hand-parts.glb'),prepared=await load('user-hand-cuff-prepared.glb');original.scene.updateMatrixWorld(true);prepared.scene.updateMatrixWorld(true);
const intended=['Horseshoe_Cuff','Robe_Sleeve','Robe_UnderCuff','User_Hand_Skinned','Same_Silver_Medallion_785'],meshes=[];prepared.scene.traverse(o=>{if(o instanceof Mesh)meshes.push(o)});assert.deepEqual(meshes.map(m=>m.name).sort(),[...intended].sort());
let maxBoundsError=0;
for(const name of intended.filter(n=>!n.startsWith('Same_'))){const mesh=prepared.scene.getObjectByName(name),source=original.scene.getObjectByName(name==='User_Hand_Skinned'?'Hand_Skin':name);assert.ok(mesh instanceof Mesh&&source instanceof Mesh);if(mesh instanceof SkinnedMesh){mesh.computeBoundingBox();assert.equal(mesh.skeleton.bones.length,22)}
 const a=new Box3().setFromObject(mesh),b=new Box3().setFromObject(source);maxBoundsError=Math.max(maxBoundsError,a.min.distanceTo(b.min),a.max.distanceTo(b.max));assert.ok(a.min.distanceTo(b.min)<1e-6&&a.max.distanceTo(b.max)<1e-6,name+' export changed the rest shape');assert.equal((mesh.geometry.index?.count??mesh.geometry.getAttribute('position').count)/3,source.geometry.index.count/3);
}
assert.equal(prepared.scene.getObjectByName('Same_Silver_Medallion_785').parent.name,'Horseshoe_Cuff');assert.equal(prepared.animations.length,0);
const report={passed:true,download:'tongue-sleeve-lab/assets/user-hand-cuff-prepared.glb',onlyIntendedMeshes:true,noJointDisplayHelperMesh:true,meshes:intended,skinJoints:22,silverParent:'Horseshoe_Cuff',maxRestBoundsErrorMetres:maxBoundsError,sourcePartTriangleCountsPreserved:true,clips:0,scope:'Prepared source-derived model, not a finished chapter animation.'};await writeFile(new URL('public/tongue-sleeve-lab/verification/prepared-hand-validation.json',root),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
