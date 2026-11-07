import assert from 'node:assert/strict';
import {Bone,BufferAttribute,BufferGeometry,Mesh,MeshBasicMaterial,SkinnedMesh,Skeleton,Vector3} from 'three';
import {chapterAt,REFERENCE_DESIGN,requireFinalDesign} from '../src/tongue-sleeve-lab/ChapterContract.ts';
import {SurfaceBinding,bindUniqueSurfaceAnchors} from '../src/tongue-sleeve-lab/SurfaceBinding.ts';

// Contract checks only; this does not validate the unmade sleeve choreography.
for(const time of [0,1.8,7.8,10.8,13,14,14.499999])assert.equal(chapterAt(time).crystalFront,0);
assert.equal(chapterAt(14.5).snapOccurred,true);assert.equal(chapterAt(16.8).crystalFront,1);
assert.equal(chapterAt(19).terminalHeld,true);assert.equal(chapterAt(22).time,19);
const snapshot=JSON.stringify(chapterAt(13.5));for(let i=0;i<30;i++){chapterAt(19);chapterAt(0);assert.equal(JSON.stringify(chapterAt(13.5)),snapshot);}
assert.equal(requireFinalDesign(REFERENCE_DESIGN).referenceConfirmed,true);assert.throws(()=>requireFinalDesign({...REFERENCE_DESIGN,outlineSvg:null}),/最终设计图/);assert.throws(()=>chapterAt(NaN),/有限值/);

const geometry=new BufferGeometry();geometry.setAttribute('position',new BufferAttribute(new Float32Array([0,0,0,1,0,0,0,1,0]),3));geometry.setAttribute('uv',new BufferAttribute(new Float32Array([0,0,1,0,0,1]),2));geometry.setIndex([0,1,2]);
const mesh=new Mesh(geometry,new MeshBasicMaterial());const anchor={id:'same-silver-001',triangle:0,barycentric:[.2,.3,.5],clearance:.001};
const binding=new SurfaceBinding(mesh,anchor);const first=binding.evaluate();assert.ok(first.position.distanceTo(new Vector3(.3,.5,.001))<1e-10);
geometry.getAttribute('position').setZ(2,.6);const bent=binding.evaluate();assert.equal(bent.id,first.id);assert.ok(bent.position.z>.29);assert.ok(Math.abs(bent.normal.length()-1)<1e-12);
geometry.morphAttributes.position=[new BufferAttribute(new Float32Array([0,0,0,1,0,.2,0,1,1]),3)];mesh.updateMorphTargets();mesh.morphTargetInfluences[0]=1;assert.ok(binding.evaluate().position.z>.55);mesh.morphTargetInfluences[0]=0;
mesh.scale.set(2,3,4);mesh.rotation.y=.4;assert.ok(binding.evaluate().position.distanceTo(bent.position)>.5);
assert.throws(()=>bindUniqueSurfaceAnchors(mesh,[anchor,anchor]),/身份重复/);
geometry.index.setX(0,1);assert.throws(()=>binding.evaluate(),/拓扑身份/);geometry.index.setX(0,0);

const skinGeometry=geometry.clone();skinGeometry.setAttribute('skinIndex',new BufferAttribute(new Uint16Array(12),4));skinGeometry.setAttribute('skinWeight',new BufferAttribute(new Float32Array([1,0,0,0,1,0,0,0,1,0,0,0]),4));
const skin=new SkinnedMesh(skinGeometry,new MeshBasicMaterial());const bone=new Bone();skin.add(bone);skin.bind(new Skeleton([bone]));skin.updateMatrixWorld(true);const skinBinding=new SurfaceBinding(skin,anchor),skinBefore=skinBinding.evaluate();bone.position.y=.4;skin.updateMatrixWorld(true);const skinAfter=skinBinding.evaluate();assert.ok(Math.abs(skinAfter.position.y-skinBefore.position.y-.4)<1e-8);
console.log('PASS: 14.5s material gate, deterministic reverse state, final-reference guard, stable barycentric identity, live deformation/morph/skinning and topology rejection.');
