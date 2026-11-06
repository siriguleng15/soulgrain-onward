import {ClampToEdgeWrapping,LinearFilter,LinearMipmapLinearFilter,RepeatWrapping,SRGBColorSpace,Texture} from 'three';
import type {MeshStandardMaterial} from 'three';

export interface ArtworkLimits {maxAnisotropy:number;maxTextureSize:number;}
export interface ArtworkState {
 status:'unassigned'|'loading'|'ready'|'error';
 source:string|null;sha256:string|null;width:number|null;height:number|null;
 error:string|null;
}
const EMPTY:ArtworkState={status:'unassigned',source:null,sha256:null,width:null,height:null,error:null};

/** The ribbon UV uses width units. One original image occupies h / w of them.
 * v=0 starts at the supplied image's top. No pixel editing or color tinting.
 * Repeating the full image is only appropriate after its tile seam is checked.
 */
export function configureArtwork(texture:Texture,width:number,height:number,limits:ArtworkLimits){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<=0||height<=0)throw Error('纹样图片尺寸无效');
 if(Math.max(width,height)>limits.maxTextureSize)throw Error('纹样超过设备纹理尺寸上限，未自动缩放原稿');
 texture.colorSpace=SRGBColorSpace;texture.flipY=false;
 texture.wrapS=ClampToEdgeWrapping;texture.wrapT=RepeatWrapping;
 texture.repeat.set(1,width/height);texture.offset.set(0,0);
 texture.anisotropy=Math.max(1,Math.min(8,limits.maxAnisotropy));
 texture.minFilter=LinearMipmapLinearFilter;texture.magFilter=LinearFilter;
 texture.generateMipmaps=true;texture.updateMatrix();texture.needsUpdate=true;
 return texture;
}

/** Owns only the performance ribbon's texture; never touches a GLB material.
 * A failed or superseded request keeps the previous valid artwork installed.
 */
export class RibbonArtwork {
 private texture?:Texture;private state:ArtworkState={...EMPTY};
 private request?:AbortController;private generation=0;private disposed=false;
 private readonly baseColor;
 private readonly material:MeshStandardMaterial;private readonly limits:ArtworkLimits;private readonly changed:()=>void;
 constructor(material:MeshStandardMaterial,limits:ArtworkLimits,changed:()=>void){
  this.material=material;this.limits=limits;this.changed=changed;
  if(material.map)throw Error('纹样控制器只能安装到独立的无贴图表演体材质');
  this.baseColor=material.color.clone();
 }
 getState(){return{...this.state};}
 async load(url:string){
  if(this.disposed)throw Error('飘带纹样控制器已释放');
  const generation=++this.generation;this.request?.abort();const request=new AbortController();this.request=request;
  this.state={...this.state,status:'loading',error:null};this.changed();
  let objectURL:string|undefined;
  try{
   const response=await fetch(url,{signal:request.signal});if(!response.ok)throw Error(`纹样加载失败 HTTP ${response.status}`);
   const bytes=await response.arrayBuffer();
   const sha256=globalThis.crypto?.subtle?Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join(''):null;
   if(generation!==this.generation||this.disposed)return false;
   objectURL=URL.createObjectURL(new Blob([bytes],{type:response.headers.get('Content-Type')??''}));
   const image=new Image();image.src=objectURL;await image.decode();
   if(generation!==this.generation||this.disposed)return false;
   const texture=new Texture(image);configureArtwork(texture,image.naturalWidth,image.naturalHeight,this.limits);
   const previous=this.texture,hadMap=!!this.material.map;this.texture=texture;
   this.material.map=texture;this.material.color.set(0xffffff);
   // Adding/removing USE_MAP changes the program once, never on motion frames.
   if(!hadMap)this.material.needsUpdate=true;
   previous?.dispose();
   this.state={status:'ready',source:url,sha256,width:image.naturalWidth,height:image.naturalHeight,error:null};this.changed();
   return true;
  }catch(error){
   if(generation!==this.generation||this.disposed)return false;
   this.state={...this.state,status:'error',error:String(error)};this.changed();throw error;
  }finally{
   if(objectURL)URL.revokeObjectURL(objectURL);
   if(generation===this.generation)this.request=undefined;
  }
 }
 clear(){
  ++this.generation;this.request?.abort();this.request=undefined;
  const hadMap=!!this.material.map;this.material.map=null;this.material.color.copy(this.baseColor);
  if(hadMap)this.material.needsUpdate=true;
  this.texture?.dispose();this.texture=undefined;this.state={...EMPTY};this.changed();
 }
 dispose(){this.clear();this.disposed=true;}
}
