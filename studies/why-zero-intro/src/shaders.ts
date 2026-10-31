export const quadVertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}`;
export const noise=`
float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
vec2 hash2(vec2 p){return vec2(hash(p),hash(p+vec2(71.9,13.7)));}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float fbm(vec2 p){float a=.5,v=0.;for(int i=0;i<4;i++){v+=a*noise(p);p=mat2(.8,-.6,.6,.8)*p*2.03+7.8;a*=.5;}return v;}
`;
export const iceTexture=`varying vec2 vUv;${noise}
vec4 cells(vec2 p){vec2 g=floor(p),f=fract(p),nearP=vec2(0);float a=9.,b=9.,id=0.;for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 cell=g+vec2(float(x),float(y)),r=vec2(float(x),float(y))+hash2(cell)-f;float d=dot(r,r);if(d<a){b=a;a=d;nearP=r;id=hash(cell);}else b=min(b,d);}return vec4(nearP,sqrt(b)-sqrt(a),id);}
void main(){
 vec2 uv=vUv;vec4 c=cells(uv*19.);float r=length(c.xy),a=atan(c.y,c.x)+c.w*6.28;
 float sector=abs(mod(a+.523599,1.047198)-.523599),x=r*cos(sector),y=r*sin(sector);
 float trunk=(1.-smoothstep(.003,.020,y))*exp(-r*2.4);
 float ribs=(1.-smoothstep(.004,.018,abs(y-abs(fract(x*10.)*2.-1.)*.13)))*(1.-smoothstep(.09,.23,y))*exp(-x*2.0);
 float dendrite=clamp(trunk+ribs*.7,0.,1.);
 vec4 fine=cells(uv*83.+vec2(9,3));float edge=1.-smoothstep(.007,.05,fine.z);
 float cloud=fbm(uv*7.);float dust=noise(uv*510.);
 float h=.24*c.w+.32*cloud+.19*dendrite+.17*edge+.08*dust;
 gl_FragColor=vec4(h,clamp(dendrite*.8+edge*.3,0.,1.),fine.w,cloud);
}`;
export const strokeFragment=`varying vec2 vUv;uniform sampler2D uPrevious;uniform vec2 uTexel;uniform float uDt;uniform float uDecay;uniform float uAspect;uniform float uRadius;uniform int uCount;uniform vec4 uSegments[24];
float segment(vec2 p,vec2 a,vec2 b){p.x*=uAspect;a.x*=uAspect;b.x*=uAspect;vec2 d=b-a;return length(p-a-d*clamp(dot(p-a,d)/max(.0000001,dot(d,d)),0.,1.));}
void main(){vec4 old=texture2D(uPrevious,vUv);float neighbors=texture2D(uPrevious,vUv+vec2(uTexel.x,0)).r+texture2D(uPrevious,vUv-vec2(uTexel.x,0)).r+texture2D(uPrevious,vUv+vec2(0,uTexel.y)).r+texture2D(uPrevious,vUv-vec2(0,uTexel.y)).r;float heat=max(0.,old.r+min(.16,uDt*5.)*(neighbors-4.*old.r)-uDecay*uDt);float fresh=0.;for(int i=0;i<24;i++){if(i>=uCount)break;float d=segment(vUv,uSegments[i].xy,uSegments[i].zw);fresh=max(fresh,1.-smoothstep(uRadius*.35,uRadius,d));}heat=max(heat,fresh);gl_FragColor=vec4(heat,max(fresh,old.g*exp(-uDt*.7)),0.,1.);}`;
export const blurFragment=`varying vec2 vUv;uniform sampler2D uMap;uniform vec2 uDirection;void main(){vec4 c=texture2D(uMap,vUv)*.227027;c+=(texture2D(uMap,vUv+uDirection*1.384615)+texture2D(uMap,vUv-uDirection*1.384615))*.316216;c+=(texture2D(uMap,vUv+uDirection*3.230769)+texture2D(uMap,vUv-uDirection*3.230769))*.070270;gl_FragColor=c;}`;
export const backdropFragment=`varying vec2 vUv;uniform float uTime;uniform float uDawn;${noise}
void main(){vec2 p=vUv;float cloud=fbm(p*3.+vec2(uTime*.013,-uTime*.009));float glow=exp(-length((p-vec2(.60,.49))*vec2(1.1,.9))*2.7);vec3 green=mix(vec3(.19,.34,.043),vec3(.48,.75,.12),glow);green+=cloud*.065;vec3 dawn=mix(vec3(.055,.13,.065),vec3(.28,.51,.14),glow)+cloud*.015;gl_FragColor=vec4(mix(green,dawn,uDawn),1.);}`;
export const frostFragment=`
varying vec2 vUv;uniform sampler2D uSharp;uniform sampler2D uBlur;uniform sampler2D uIce;uniform sampler2D uField;uniform sampler2D uHand;
uniform float uTime;uniform float uAspect;uniform float uMelt;uniform float uDawn;uniform float uFlash;uniform float uExposure;uniform float uStyle;uniform vec2 uContact;uniform float uContactOpacity;uniform vec2 uCenter;uniform vec2 uIceTexel;uniform vec2 uFieldTexel;
${noise}
void main(){
 vec2 p=vUv,materialUv=p*vec2(uAspect,1.)*.83+vec2(.08,.12);vec4 ice=texture2D(uIce,materialUv);
 float hx=texture2D(uIce,materialUv+vec2(uIceTexel.x,0)).r-texture2D(uIce,materialUv-vec2(uIceTexel.x,0)).r;
 float hy=texture2D(uIce,materialUv+vec2(0,uIceTexel.y)).r-texture2D(uIce,materialUv-vec2(0,uIceTexel.y)).r;
 vec3 normal=normalize(vec3(hx*6.5,hy*6.5,1.));vec4 field=texture2D(uField,p);
 vec2 heatN=vec2(texture2D(uField,p+vec2(uFieldTexel.x,0)).r-texture2D(uField,p-vec2(uFieldTexel.x,0)).r,texture2D(uField,p+vec2(0,uFieldTexel.y)).r-texture2D(uField,p-vec2(0,uFieldTexel.y)).r);
 vec2 radial=(p-uCenter)*vec2(uAspect,1.);float d=length(radial),ang=atan(radial.y,radial.x);
 float radius=uMelt*(1.7+uAspect*.4);float shards=pow(max(0.,cos(ang*39.+sin(ang*11.)*1.6)),16.)*.065;
 float front=d+ice.b*.045-shards;float global=uMelt>.0001?1.-smoothstep(radius-.045,radius+.055,front):0.;
 float local=smoothstep(.12,.75,field.r),clear=max(local,global);clear=max(clear,uDawn);
 float groove=(smoothstep(.055,.30,field.r)-smoothstep(.48,.88,field.r));
 float rim=groove*(.28+ice.g*.82+pow(ice.b,7.)*.6);
 float burst=uMelt>.0001?exp(-pow((front-radius)/.055,2.))*(.24+ice.g*.9):0.;burst*=1.-uDawn;
 vec2 refract=normal.xy*.018*(1.-clear)+heatN*.014;
 refract+=normalize(radial+vec2(.001))*sin(d*170.-uTime*9.)*.0015*(rim+burst);
 vec3 sharp=texture2D(uSharp,clamp(p+refract,0.,1.)).rgb;
 vec3 blur=texture2D(uBlur,clamp(p+normal.xy*.010,0.,1.)).rgb;
 float crystal=ice.g*.22+pow(ice.r,.65)*.12;
 vec3 frost=mix(blur,vec3(.57,.71,.40),.40+ice.a*.22)+crystal*vec3(.42,.49,.33);
 float patches=smoothstep(.26,.66,ice.a);
 vec3 volume=mix(blur*vec3(.65,.84,.48),vec3(.66,.79,.47),.22+.60*patches);
 volume+=ice.g*vec3(.13,.18,.10)+(ice.b-.5)*.006*(.3+.7*patches);
 frost=mix(frost,volume,uStyle);
 float glint=pow(max(dot(normal,normalize(vec3(-.7,1.2,1.1))),0.),34.);
 frost+=glint*.29;frost-=pow(1.-ice.r,3.)*.025;
 vec3 color=mix(frost,sharp,clear);
 color+=rim*vec3(.53,.63,.43)*(1.-global)+burst*vec3(.75,.83,.66);
 color+=uFlash*vec3(.28,.37,.15);color*=uExposure;
 vec2 contact=(p-uContact)*vec2(uAspect,1.);color-=exp(-dot(contact*vec2(65.,90.),contact*vec2(65.,90.)))*.11*uContactOpacity*(1.-uDawn);
 vec4 hand=texture2D(uHand,p);color=color*(1.-hand.a)+hand.rgb;
 float grain=(hash(gl_FragCoord.xy+fract(uTime)*.1)-.5)*.006;
 gl_FragColor=vec4(color+grain,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;
