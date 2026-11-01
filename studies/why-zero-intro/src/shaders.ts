export const quadVertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}`;
export const noise=`
float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
float fbm(vec2 p){float a=.5,v=0.;for(int i=0;i<4;i++){v+=a*noise(p);p=mat2(.8,-.6,.6,.8)*p*2.03+7.8;a*=.5;}return v;}
`;
export const iceTexture=`varying vec2 vUv;${noise}
void main(){vec2 p=vUv*6.;vec2 w=p+vec2(fbm(p*1.3),fbm(p*1.3+11.))*2.;float a=fbm(w*4.);float veins=pow(1.-abs(a*2.-1.),10.);float h=clamp(.2+fbm(w)*.55+veins*.25,0.,1.);gl_FragColor=vec4(vec3(h),1.);}`;

export const strokeFragment=`
varying vec2 vUv;
uniform sampler2D uPrevious;
uniform vec2 uTexel;
uniform float uDt,uDecay,uAspect,uRadius,uByte,uFrame;
uniform int uCount;
uniform vec4 uSegments[24];
float segment(vec2 p,vec2 a,vec2 b){p.x*=uAspect;a.x*=uAspect;b.x*=uAspect;vec2 d=b-a;return length(p-a-d*clamp(dot(p-a,d)/max(.0000001,dot(d,d)),0.,1.));}
void main(){
  vec4 old=texture2D(uPrevious,vUv);
  float neighbors=texture2D(uPrevious,vUv+vec2(uTexel.x,0.)).r+texture2D(uPrevious,vUv-vec2(uTexel.x,0.)).r+texture2D(uPrevious,vUv+vec2(0.,uTexel.y)).r+texture2D(uPrevious,vUv-vec2(0.,uTexel.y)).r;
  float heat=max(0.,old.r+min(.095,uDt*2.4)*(neighbors-4.*old.r)-uDecay*uDt);
  float fresh=0.;
  for(int i=0;i<24;i++){if(i>=uCount)break;float d=segment(vUv,uSegments[i].xy,uSegments[i].zw);fresh=max(fresh,1.-smoothstep(uRadius*.38,uRadius,d));}
  heat=max(heat,fresh);
  if(uByte>.5){float stochastic=fract(sin(dot(gl_FragCoord.xy+uFrame,vec2(12.9898,78.233)))*43758.5453);heat=floor(heat*255.+stochastic)/255.;}
  gl_FragColor=vec4(heat,max(fresh,old.g*exp(-uDt*1.5)),0.,1.);
}`;
export const blurFragment=`varying vec2 vUv;uniform sampler2D uMap;uniform vec2 uDirection;void main(){vec4 c=texture2D(uMap,vUv)*.227027;c+=(texture2D(uMap,vUv+uDirection*1.384615)+texture2D(uMap,vUv-uDirection*1.384615))*.316216;c+=(texture2D(uMap,vUv+uDirection*3.230769)+texture2D(uMap,vUv-uDirection*3.230769))*.070270;gl_FragColor=c;}`;

export const backdropFragment=`varying vec2 vUv;uniform float uTime,uDawn;${noise}
void main(){
  vec2 p=vUv;
  vec3 green=mix(vec3(.64,.86,.72),vec3(.025,.31,.23),pow(p.y,.75));
  green+=exp(-length((p-vec2(.52,.15))*vec2(1.4,.8))*5.)*vec3(.02,.08,.04);
  green+=(fbm(p*3.+uTime*.006)-.5)*.025;
  float edge=pow(length((p-.5)*vec2(1.1,.8)),1.4);
  vec3 white=vec3(.995)-edge*vec3(.035,.008,.020);
  white-=exp(-length((p-vec2(.53,.08))*vec2(2.,1.))*6.)*vec3(.10,.005,.055)*uDawn;
  gl_FragColor=vec4(pow(mix(green,white,uDawn),vec3(2.2)),1.);
}`;

export const frostFragment=`
varying vec2 vUv;
uniform sampler2D uSharp,uBlur,uIce,uField,uHand;
uniform float uTime,uAspect,uFreeze,uMelt,uDawn,uFlash,uExposure,uGuidance;
uniform vec2 uCenter,uIceTexel,uFieldTexel,uPointer;
uniform float uPointerActive,uGuideTime;
${noise}
vec2 materialUV(vec2 p){vec2 s=uAspect>1.5?vec2(1.,1.5/uAspect):vec2(uAspect/1.5,1.);return (p-.5)*s+.5;}
float iceAt(vec2 p){return texture2D(uIce,materialUV(p)).r;}
float iceLow(vec2 p){return texture2D(uIce,materialUV(p),2.0).r;}
void main(){
  vec2 p=vUv;
  float h=iceAt(p);
  vec2 grad=vec2(iceLow(p+vec2(uIceTexel.x*3.,0.))-iceLow(p-vec2(uIceTexel.x*3.,0.)),iceLow(p+vec2(0.,uIceTexel.y*3.))-iceLow(p-vec2(0.,uIceTexel.y*3.)));
  vec2 micro=vec2(fbm(p*35.),fbm(p*35.+7.))-.5;
  vec2 warp=grad*.018+micro*.003;
  vec3 sharp=texture2D(uSharp,clamp(p+warp*.25,0.,1.)).rgb;
  vec3 blurred=texture2D(uBlur,clamp(p+warp,0.,1.)).rgb;

  float front=.005+uFreeze*1.23;
  float distanceFromTop=1.-p.y+(h-.48)*.19+(fbm(vec2(p.x*uAspect*15.,p.y*8.))-.5)*.075;
  float frozen=1.-smoothstep(front-.018,front+.018,distanceFromTop);
  float growingEdge=exp(-pow((distanceFromTop-front)/.045,2.))*(1.-smoothstep(.88,1.,uFreeze));
  vec3 frostRGB=vec3(.205,.355,.30)+pow(h,.86)*vec3(.46,.50,.445);
  frostRGB+=vec3(.025,.045,.038)*(1.-p.y);
  frostRGB+=growingEdge*(.16+h*.38);
  float spec=pow(max(0.,dot(normalize(vec3(-grad*12.,1.)),normalize(vec3(-.8,1.1,1.4)))),28.);
  frostRGB+=spec*.025;
  vec3 frost=pow(clamp(frostRGB,0.,1.),vec3(2.2));
  frost=mix(frost,blurred,.10);
  vec2 radial=(p-uCenter)*vec2(uAspect,1.);
  float d=length(radial),angle=atan(radial.y,radial.x);
  float radius=uMelt*(1.55+uAspect*.42);
  float jagged=pow(max(0.,cos(angle*33.+sin(angle*9.)*2.)),9.)*.055;
  float radialFront=d+(h-.5)*.095-jagged;
  float global=uMelt>.00001?1.-smoothstep(radius-.055,radius+.035,radialFront):0.;
  vec2 inkUv=clamp(p+micro*.007+grad*.0015,0.,1.);
  float heat=texture2D(uField,inkUv).r;
  float local=smoothstep(.27,.52,heat);
  float rim=(smoothstep(.15,.31,heat)-smoothstep(.41,.60,heat));
  rim*=.72+.5*noise(p*vec2(uAspect,1.)*260.);
  float clear=max(local,global);
  vec3 color=mix(sharp,frost,frozen*(1.-clear)*(1.-uDawn));

  vec2 handUv=clamp(p+warp*(1.-global)*.78,0.,1.);
  vec4 hand=texture2D(uHand,handUv);
  float handAlpha=smoothstep(.025,.65,hand.a);
  vec3 handColor=hand.rgb/max(.12,hand.a);
  handColor=mix(handColor,frost,.06+h*.12);
  color=mix(color,handColor,handAlpha*(1.-uDawn));

  vec2 gp=(p-.5)*vec2(uAspect,1.);
  float gr=.225,ga=mod(atan(gp.x,gp.y)+6.2831853,6.2831853)/6.2831853;
  float cycle=mod(uGuideTime,3.8),progress=clamp(cycle/2.6,0.,1.);
  float guideFade=(1.-smoothstep(2.7,3.6,cycle))*uGuidance*(1.-uMelt);
  float arc=(1.-smoothstep(.0025,.006,abs(length(gp)-gr)))*step(ga,progress)*guideFade*.72;
  vec2 head=vec2(sin(progress*6.2831853),cos(progress*6.2831853))*gr;
  float dotGuide=(1.-smoothstep(.006,.011,length(gp-head)))*guideFade;
  color=mix(color,vec3(.92,.98,.94),max(arc,dotGuide));

  color+=rim*vec3(.90,.98,.94)*(1.-global)*(1.-uDawn);
  float burst=uMelt>.0001?exp(-pow((radialFront-radius)/.043,2.)):0.;
  color+=burst*vec3(.8,.95,.88)*(1.-uDawn);
  vec2 pp=(p-uPointer)*vec2(uAspect,1.);
  float pointerGlow=exp(-dot(pp,pp)/.00015)*uPointerActive*(1.-uDawn);
  color=mix(color,vec3(1.),pointerGlow*.92);
  color=mix(color,vec3(1.),uFlash*.96);
  color*=uExposure;
  float grain=(hash(gl_FragCoord.xy)-.5)*.0016;
  gl_FragColor=vec4(color+grain,1.);
  #include <colorspace_fragment>
}`;
