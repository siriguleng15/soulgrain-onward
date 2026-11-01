import {noise} from './shaders.ts';

export const handComposite=`
varying vec2 vUv;
uniform sampler2D uScene,uGarden;
uniform vec2 uPointer,uTexel;
uniform float uAspect,uGardenAspect,uTime,uProgress,uHold,uAlpha;
${noise}
vec3 filmic(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
void main(){
  vec2 p=vUv,mouse=(p-uPointer)*vec2(uAspect,1.);
  vec2 flow=vec2(fbm(p*3.+uTime*.018),fbm(p*3.+10.-uTime*.012))-.5;
  float blob=exp(-dot((mouse+flow*.18)*vec2(1.6,1.3),(mouse+flow*.18)*vec2(1.6,1.3)));
  float aqua=smoothstep(.2,.8,uProgress)*(1.-smoothstep(1.8,2.5,uProgress));
  vec3 background=mix(vec3(.985,.992,.983),vec3(.43,.78,.78),blob*.77*aqua);
  background-=exp(-length((p-vec2(.50,.12))*vec2(1.7,1.))*7.)*vec3(.07,0.,.035);

  vec2 scale=uAspect>uGardenAspect?vec2(1.,uGardenAspect/uAspect):vec2(uAspect/uGardenAspect,1.);
  vec2 uv=(p-.5)*scale+.5+(uPointer-.5)*vec2(.009,.005);
  uv.x+=sin(uv.y*130.+uTime*1.3)*.0005*(1.-smoothstep(.28,.35,uv.y));
  vec3 garden=texture2D(uGarden,clamp(uv,0.,1.)).rgb;
  garden*=vec3(.94,1.01,1.05);
  vec3 night=garden*vec3(.52,.24,.30);
  night+=pow(max(0.,1.-length((p-vec2(1.,1.))*vec2(.7,1.3))),6.)*vec3(.35,.13,.12);
  garden=mix(garden,night,uHold*.94);
  float environment=smoothstep(1.95,2.75,uProgress);
  environment=clamp(environment+flow.x*.12*sin(environment*3.14159),0.,1.);
  background=mix(background,garden,environment);
  vec3 color=pow(max(background,0.),vec3(2.2));

  vec4 object=texture2D(uScene,p);
  vec3 hdr=object.rgb/max(.001,object.a);
  vec3 foreground=filmic(hdr*1.25);
  float fog=1.-smoothstep(.18,.69,length(mouse+flow*.13));
  float fogAmount=smoothstep(.6,1.15,uProgress)*(1.-smoothstep(1.8,2.35,uProgress));
  float reveal=mix(1.,.06+.94*fog,fogAmount);
  color=color*(1.-object.a*reveal)+foreground*object.a*reveal;
  vec3 neighbors=texture2D(uScene,p+uTexel*5.).rgb+texture2D(uScene,p-uTexel*5.).rgb+texture2D(uScene,p+vec2(uTexel.x,-uTexel.y)*5.).rgb;
  color+=filmic(neighbors)*.012*(1.-uHold);
  float edges=pow(max(abs(p.x-.5)*2.,abs(p.y-.5)*2.),4.);
  color=mix(color,vec3(.94,.99,.96),edges*.25*environment*(1.-uHold));
  gl_FragColor=vec4(color,uAlpha);
  #include <colorspace_fragment>
}`;

export const connectionFragment=`varying vec2 vUv;uniform float uHold,uHover,uTime;void main(){
  vec2 p=vUv-.5;float d=length(p),a=mod(atan(p.x,p.y)+6.2831853,6.2831853)/6.2831853;
  float ring=(1.-smoothstep(.010,.025,abs(d-.29)))*(.28+.72*step(a,max(.05,uHold)));
  float glow=exp(-pow((d-.29)/.075,2.))*(.18+uHover*.15);
  float pulse=1.-smoothstep(.02,.45,d);pulse*=.025+.06*uHover;
  gl_FragColor=vec4(4.,4.,4.,clamp(ring+glow+pulse,0.,1.));
}`;
