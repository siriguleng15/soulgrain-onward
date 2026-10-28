/** Default-hypothesis examples. These are research references, NOT factory-ready dimensions. */
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {buildPatternMesh} from '../../src/pattern-engineering/mesh.ts';
import {deformMesh,getMeshValidation} from '../../src/pattern-engineering/deformation.ts';
import {DEFAULT_PHOTO_REGISTRATION as registration,PHOTO_DEFORMATION_HYPOTHESIS as params,projectPhotoToSurface} from '../../src/pattern-engineering/photo-fit.ts';
import {createProjectSnapshot,createFactorySVG,exportCoordinateCSV,exportCoordinateJSON} from '../../src/pattern-engineering/exports.ts';
const root='public/pattern-engineering/';
const pattern=JSON.parse(await readFile(root+'data/pattern-mm.json','utf8'));
const design=JSON.parse(await readFile(root+'data/clasp-design.json','utf8'));
const manifest=JSON.parse(await readFile(root+'references/manifest.json','utf8'));
const mesh=buildPatternMesh(pattern,{maxEdgeMm:4}),formed=deformMesh(mesh,1,params),points=[];
for(const clasp of design.observed.clasps){
 const items=[['B','body-fixed','body',clasp.bodyFixedEndPhoto],['C','cuff-fixed','cuff',clasp.cuffFixedEndPhoto],['S-body','snap-projection','body',clasp.centerPhoto],['S-cuff','snap-projection','cuff',clasp.centerPhoto]];
 for(const [suffix,kind,layer,pixel] of items){const hit=projectPhotoToSurface(mesh,formed,pixel,registration,params,layer);points.push({id:clasp.id+'-'+suffix,label:clasp.id+' '+(kind==='snap-projection'?'扣心表面投影':layer==='body'?'鞋身固定端':'翻筒固定端'),kind,layer,anchor:hit.anchor,photoPixel:pixel,ambiguity:hit.warnings});}
}
const input={pattern,points,params,registration,strapDesign:design,provenance:{manifest,example:true},validation:getMeshValidation(mesh,formed),vertexIds:mesh.vertexIds,indices:mesh.indices,flatMm:mesh.flatMm,formedMm:formed,meshConstruction:mesh.construction,uncertainties:['默认形变与照片配准是假设。','未完成鞋侧完整轮廓、缝合与绷帮校准。','不是PU公母件安装孔图，也不是量产定位尺寸。']};
const snapshot=createProjectSnapshot(input);
await mkdir(root+'exports',{recursive:true});
await writeFile(root+'exports/ONWARD-reference.svg',createFactorySVG(pattern,points,{params,title:'ONWARD · 默认假设下的反向定位研究参考',provenance:input.provenance}));
await writeFile(root+'exports/ONWARD-project.json',exportCoordinateJSON(snapshot));
await writeFile(root+'exports/ONWARD-points-mm.csv',exportCoordinateCSV(snapshot));
console.log('Default research example:',points.filter(p=>p.anchor).length+'/'+points.length,'mapped; productionReady=false');
