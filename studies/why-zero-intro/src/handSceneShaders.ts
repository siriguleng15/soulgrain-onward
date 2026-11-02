import {noise} from './shaders.ts';

export const handComposite=`
varying vec2 vUv;
uniform sampler2D uScene,uGarden;
uniform vec2 uPointer,uTexel;
uniform float uAspect,uGardenAspect,uTime,uProgress,uHold,uAlpha,uSpatialGarden;
${noise}
vec3 filmic(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
void main(){
  vec2 p=vUv,mouse=(p-uPointer)*vec2(uAspect,1.);
  vec2 flow=vec2(fbm(p*3.+uTime*.018),fbm(p*3.+10.-uTime*.012))-.5;
  float blob=exp(-dot((mouse+flow*.18)*vec2(1.6,1.3),(mouse+flow*.18)*vec2(1.6,1.3)));
  float aqua=smoothstep(.2,.8,uProgress)*(1.-smoothstep(1.8,2.5,uProgress));
  // Broad cyan field from the recording; white mist belongs at the wrist,
  // rather than washing the entire hand and perimeter out.
  vec3 aquaField=mix(vec3(.52,.79,.82),vec3(.70,.94,.82),smoothstep(.38,1.,p.y)*.65);
  aquaField+=flow.x*.025;
  vec3 background=mix(vec3(.985,.992,.983),aquaField,aqua);
  float wristFog=exp(-dot((p-vec2(.42,.08))*vec2(2.5,3.2),(p-vec2(.42,.08))*vec2(2.5,3.2)));
  background=mix(background,vec3(.95,.99,.97),wristFog*.40*aqua);

  vec2 scale=uAspect>uGardenAspect?vec2(1.,uGardenAspect/uAspect):vec2(uAspect/uGardenAspect,1.);
  vec2 uv=(p-.5)*scale+.5+(uPointer-.5)*vec2(.009,.005);
  uv.x+=sin(uv.y*130.+uTime*1.3)*.0005*(1.-smoothstep(.28,.35,uv.y));
  // Retained V3 plate as fallback only; soften its photographic sharpness.
  vec3 garden=texture2D(uGarden,clamp(uv,0.,1.)).rgb*.4;
  garden+=(texture2D(uGarden,clamp(uv+vec2(.0018,.001),0.,1.)).rgb+texture2D(uGarden,clamp(uv-vec2(.0018,.001),0.,1.)).rgb)*.3;
  garden=mix(garden,vec3(.76,.89,.90),.22);
  float cloud=fbm(vec2(p.x*4.+uTime*.004,p.y*6.));
  float billow=smoothstep(.42,.72,cloud+sin(p.y*14.)*.09);
  vec3 sky=mix(vec3(.59,.76,.82),vec3(.85,.93,.94),p.y*.45+billow*.55);
  sky=mix(sky,vec3(.95,.98,.91),pow(clamp(1.-length((p-vec2(.94,.99))*vec2(.7,1.)),0.,1.),8.)*.9);
  garden=mix(garden,sky,uSpatialGarden);
  vec3 night=garden*vec3(.61,.36,.39);
  night+=pow(max(0.,1.-length((p-vec2(1.,1.))*vec2(.7,1.3))),6.)*vec3(.30,.13,.12);
  garden=mix(garden,night,uHold*.94);
  float environment=smoothstep(1.95,2.75,uProgress);
  environment=clamp(environment+flow.x*.12*sin(environment*3.14159),0.,1.);
  background=mix(background,garden,environment);
  vec3 color=pow(max(background,0.),vec3(2.2));

  vec4 object=texture2D(uScene,p);
  vec3 hdr=object.rgb/max(.001,object.a);
  vec3 foreground=filmic(hdr*.98);
  float fog=1.-smoothstep(.12,.62,length(mouse+flow*.10));
  float fogAmount=smoothstep(.6,1.15,uProgress)*(1.-smoothstep(1.8,2.35,uProgress));
  float reveal=mix(1.,.30+.70*fog,fogAmount);
  color=color*(1.-object.a*reveal)+foreground*object.a*reveal;
  vec3 neighbors=texture2D(uScene,p+uTexel*5.).rgb+texture2D(uScene,p-uTexel*5.).rgb+texture2D(uScene,p+vec2(uTexel.x,-uTexel.y)*5.).rgb;
  color+=filmic(neighbors)*.009*(1.-uHold);
  // Gentle right-hand light shafts pass through scene atmosphere.
  vec2 sun=p-vec2(1.08,1.12);
  float theta=atan(sun.x,-sun.y);
  float shafts=pow(.5+.5*sin(theta*43.+.4),12.)*.6+pow(.5+.5*sin(theta*71.-.2),18.)*.4;
  float sunFalloff=pow(clamp(1.-length(sun)*.52,0.,1.),2.);
  float atmosphere=shafts*sunFalloff*.12*environment;
  color+=mix(vec3(.67,.81,.78),vec3(.55,.23,.18),uHold)*atmosphere*(1.-object.a*.80);
  float vignette=pow(length((p-.5)*vec2(1.,.8)),2.);
  color*=1.-vignette*.10*environment;
  float edges=pow(max(abs(p.x-.5)*2.,abs(p.y-.5)*2.),4.);
  color=mix(color,vec3(.94,.99,.96),edges*.25*environment*(1.-uHold));
  gl_FragColor=vec4(color,uAlpha);
  #include <colorspace_fragment>
}`;

export const connectionFragment=`varying vec2 vUv;uniform float uHold,uHover,uTime;void main(){
  vec2 p=vUv-.5;float d=length(p),a=mod(atan(p.x,p.y)+6.2831853,6.2831853)/6.2831853;
  float ring=(1.-smoothstep(.006,.024,abs(d-.29)))*(.28+.72*step(a,max(.05,uHold)));
  float glow=exp(-pow((d-.29)/.075,2.))*(.12+uHover*.12);
  float pulse=1.-smoothstep(.02,.45,d);pulse*=.025+.06*uHover;
  gl_FragColor=vec4(1.8,1.9,1.85,clamp(ring+glow+pulse,0.,1.));
}`;
