#!/usr/bin/env node
// Numeric integration test using real source accessors, not a renderer or animation.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync, existsSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {parseArgs} from 'node:util';

const here=dirname(fileURLToPath(import.meta.url));
const {values}=parseArgs({options:{'three-root':{type:'string'},repo:{type:'string'}}});
const repo=resolve(values.repo??resolve(here,'../../../..'));
const threeRoot=resolve(values['three-root']??resolve(repo,'node_modules/three'));
if(!existsSync(resolve(threeRoot,'package.json')))throw Error('Three.js missing: supply --three-root /path/to/existing/node_modules/three (0.180.0).');
assert.equal(JSON.parse(readFileSync(resolve(threeRoot,'package.json'))).version,'0.180.0','Use audited Three.js version');
const {Scene,Group,Mesh,MeshStandardMaterial,BufferGeometry,BufferAttribute,Texture,Vector3}=await import(pathToFileURL(resolve(threeRoot,'build/three.module.js')).href);
const digest=x=>createHash('sha256').update(x).digest('hex');
const contract=JSON.parse(readFileSync(resolve(here,'../references/asset-contract.json')));
const source=resolve(repo,contract.expected.source),bytes=readFileSync(source);
assert.equal(digest(bytes),contract.expected.sha256,'Wrong source GLB');
const jsonLength=bytes.readUInt32LE(12),doc=JSON.parse(bytes.subarray(20,20+jsonLength).toString());
const binary=bytes.subarray(28+jsonLength);
function attribute(index){
 const a=doc.accessors[index],view=doc.bufferViews[a.bufferView];
 assert(!a.sparse,'Sparse accessor needs an audited decoder');
 const count={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type];
 const Type={5121:Uint8Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array}[a.componentType];
 const size=Type.BYTES_PER_ELEMENT,start=(view.byteOffset??0)+(a.byteOffset??0),stride=view.byteStride??size*count;
 const array=new Type(a.count*count),data=new DataView(binary.buffer,binary.byteOffset,binary.byteLength);
 const getter={5121:'getUint8',5123:'getUint16',5125:'getUint32',5126:'getFloat32'}[a.componentType];
 for(let i=0;i<a.count;i++)for(let k=0;k<count;k++)array[i*count+k]=data[getter](start+i*stride+k*size,true);
 return new BufferAttribute(array,count,a.normalized??false);
}
const scene=new Scene(),product=new Group(),normalized=new Group(),asset=new Group();
scene.add(product);product.add(normalized);normalized.add(asset);
const {center,scale}=contract.expected.displayNormalization;
normalized.scale.setScalar(scale);normalized.position.fromArray(center).multiplyScalar(-scale);
product.rotation.set(.11,.63,-.012);product.position.set(.2,.025,-.1);
const mats=new Map(),objects=new Map();
for(const name of Object.keys(contract.expected.nodes)){
 const node=doc.nodes.find(n=>n.name===name),p=doc.meshes[node.mesh].primitives[0],g=new BufferGeometry();
 for(const [key,i] of Object.entries(p.attributes))g.setAttribute({POSITION:'position',NORMAL:'normal',TEXCOORD_0:'uv'}[key],attribute(i));
 g.setIndex(attribute(p.indices));
 if(!mats.has(p.material)){
  const m=new MeshStandardMaterial();m.name=doc.materials[p.material].name;
  if(p.material===13){m.map=new Texture();m.map.name='04-heel-leather';}
  mats.set(p.material,m);
 }
 const mesh=new Mesh(g,mats.get(p.material));mesh.name=name;asset.add(mesh);objects.set(name,mesh);
}
scene.updateMatrixWorld(true);
const snapshots=new Map([...objects.values()].map(o=>[o,{parent:o.parent,index:o.parent.children.indexOf(o),matrix:o.matrix.clone(),world:o.matrixWorld.clone(),material:o.material,visible:o.visible}]));
function arraysHash(){return digest(Buffer.concat([...objects.values()].flatMap(o=>[...Object.values(o.geometry.attributes),o.geometry.index].map(a=>Buffer.from(a.array.buffer,a.array.byteOffset,a.array.byteLength)))));}
const initialArrays=arraysHash();
const move=['Finished_Heel_Leather','Heel_Leather_Stitching'].map(n=>objects.get(n));
let maximumError=0;
function near(a,b){for(let i=0;i<16;i++)maximumError=Math.max(maximumError,Math.abs(a.elements[i]-b.elements[i]));assert(maximumError<1e-10,'Matrix drift');}
for(let cycle=0;cycle<30;cycle++){
 const pivot=new Group();scene.add(pivot);
 pivot.position.fromArray(contract.expected.nodes.Finished_Heel_Leather.anchors.middle.position).applyMatrix4(move[0].matrixWorld);
 pivot.rotation.set(.08,-.17,.12);scene.updateMatrixWorld(true);
 const clones=[];
 for(const o of move){
  const world=o.matrixWorld.clone();pivot.attach(o);scene.updateMatrixWorld(true);near(o.matrixWorld,world);
  const cloned=o.material.clone();assert.notEqual(cloned,o.material);assert.equal(cloned.map,o.material.map,'Texture must remain shared, not rewritten');o.material=cloned;clones.push(cloned);
 }
 move[0].material.color.setHex(0x8b0714);
 assert.equal(objects.get('Heel_Seam_Stitch').material,snapshots.get(objects.get('Heel_Seam_Stitch')).material,'Seam material must not be replaced');
 assert.notEqual(move[0].material,objects.get('Heel_Seam_Stitch').material,'Isolate shared Heel_Strip');
 pivot.position.add(new Vector3(.27,.18,-.11));pivot.rotateY(.65);pivot.scale.setScalar(1.15);scene.updateMatrixWorld(true);
 for(const o of move){
  const s=snapshots.get(o);s.parent.add(o);o.matrix.copy(s.matrix);o.matrix.decompose(o.position,o.quaternion,o.scale);o.material=s.material;o.visible=s.visible;
 }
 // Restore the original sibling order as well as transforms.
 asset.children.sort((a,b)=>snapshots.get(a).index-snapshots.get(b).index);
 scene.remove(pivot);scene.updateMatrixWorld(true);
 for(const o of objects.values()){const s=snapshots.get(o);assert.equal(o.parent,s.parent);near(o.matrix,s.matrix);near(o.matrixWorld,s.world);assert.equal(o.material,s.material);assert.equal(o.visible,s.visible);}
 assert.equal(arraysHash(),initialArrays,'Source accessor bytes changed');
 for(const m of clones)m.dispose(); // Do not dispose shared geometry or textures.
}
assert.equal(digest(readFileSync(source)),contract.expected.sha256);
console.log(JSON.stringify({passed:true,cycles:30,threeVersion:'0.180.0',sourceSHA:contract.expected.sha256,maximumMatrixError:maximumError,
 checks:['real source POSITION/NORMAL/UV/index bytes unchanged','attach preserves world pose','30-cycle parent/transform/material/visibility/order restoration','material isolation retains shared texture','excluded seam and logo unchanged','source file unchanged'],
 scope:'Headless numeric integration using real GLB accessors. No GLTFLoader/image decode, GPU render, Shader, animation or Safari test.'},null,2));
