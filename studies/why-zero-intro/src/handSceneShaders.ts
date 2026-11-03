import {noise} from './shaders.ts';

export const handComposite=`
varying vec2 vUv;
uniform sampler2D uScene,uGarden,uBloom,uDepth;
uniform vec2 uPointer,uTexel;
uniform float uAspect,uGardenAspect,uTime,uProgress,uHold,uAlpha,uSpatialGarden,uCameraNear,uCameraFar,uFocusDistance,uCharge,uMist;
${noise}
vec3 displayToLinear(vec3 c){return mix(c/12.92,pow((c+.055)/1.055,vec3(2.4)),step(vec3(.04045),c));}
vec3 filmic(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
void main(){
  vec2 raw=vUv;
  vec2 dome=(raw-.5)*vec2(uAspect,1.);
  float domeRadius=.175;
  float domeR=length(dome)/domeRadius;
  float domeMask=1.-smoothstep(.96,1.025,domeR);
  float domeZ=sqrt(max(0.,1.-domeR*domeR));
  // Continuous convex refraction of the actual rendered space, activated only
  // during the recorded late hold; the interface stays in the sharp overlay.
  vec2 p=raw-(raw-.5)*(.105*domeZ*domeMask*uCharge);
  vec2 mouse=(p-uPointer)*vec2(uAspect,1.);
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
  // Layered optical depth: distant sky barely tracks the input, lower water
  // has greater parallax. All sampling remains on the independently made plate.
  float nearDepth=1.-smoothstep(.13,.68,p.y);
  vec2 uv=(p-.5)*scale+.5+(uPointer-.5)*mix(vec2(.0025,.001),vec2(.012,.005),nearDepth);
  // Small monotone vertical art-direction warp aligns independently generated
  // column capitals and low horizon to the recorded composition, without
  // sampling or embedding any pixels from the reference recording.
  uv.y+=.040*exp(-pow((p.y-.70)/.18,2.))-.070*exp(-pow((p.y-.50)/.10,2.));
  float water=1.-smoothstep(.245,.285,p.y);
  uv.x+=(sin(uv.y*174.+uTime*.77)+sin(uv.y*73.-uTime*.43))*.00042*water;
  uv.y+=sin(uv.x*67.+uTime*.31)*.00011*water;
  // A narrow optical diffusion kernel, stronger only in the near water/sky.
  float diffusion=.00075+water*.0012+smoothstep(.68,.95,p.y)*.00065;
  vec2 blur=vec2(diffusion,diffusion*.6);
  vec3 garden=texture2D(uGarden,clamp(uv,0.,1.)).rgb*.5;
  garden+=(texture2D(uGarden,clamp(uv+blur,0.,1.)).rgb+texture2D(uGarden,clamp(uv-blur,0.,1.)).rgb)*.25;
  // Cyan air sits over the meadow, while the near water keeps its dark depth.
  float haze=exp(-pow((p.y-.50)/.22,2.))*.16+water*.23;
  haze+=.075*(1.-smoothstep(.34,.62,p.y));
  garden=mix(garden,vec3(.72,.89,.88),haze);
  garden=mix(garden,vec3(.98,.97,1.),.46*smoothstep(.48,.72,p.y));
  float leftSky=exp(-pow((p.x-.16)/.34,2.))*smoothstep(.63,.94,p.y);
  garden*=1.-leftSky*.065;
  float cloud=fbm(vec2(p.x*4.+uTime*.004,p.y*6.));
  float billow=smoothstep(.42,.72,cloud+sin(p.y*14.)*.09);
  vec3 sky=mix(vec3(.59,.76,.82),vec3(.85,.93,.94),p.y*.45+billow*.55);
  sky=mix(sky,vec3(.95,.98,.91),pow(clamp(1.-length((p-vec2(.94,.99))*vec2(.7,1.)),0.,1.),8.)*.9);
  garden=mix(garden,sky,uSpatialGarden);
  // Preserve the clouds' cool shadow colour under a rosy late-light hold.
  // Uniform red multiplication made the whole V4 scene look painted brown.
  vec3 duskFilter=mix(vec3(.48,.24,.17),vec3(.57,.41,.43),smoothstep(.43,.90,p.y));
  // Water retains reflected sky energy rather than taking the grass shadow grade.
  duskFilter=mix(duskFilter,vec3(.78,.40,.28),water);
  vec3 night=garden*duskFilter;
  float sunHalo=pow(max(0.,1.-length((p-vec2(1.02,1.04))*vec2(.68,1.1))),5.);
  night+=sunHalo*vec3(.48,.29,.20);
  night*=mix(vec3(1.),vec3(.60,.48,.49),uCharge);
  night+=sunHalo*vec3(.16,.075,.065)*uCharge;
  garden=mix(garden,night,uHold*.98);
  float environment=smoothstep(1.95,2.75,uProgress);
  environment=clamp(environment+flow.x*.12*sin(environment*3.14159),0.,1.);
  background=mix(background,garden,environment);
  vec3 frostWhite=mix(vec3(.965,.987,.976),vec3(.88,.995,.91),exp(-dot((p-vec2(.51,.56))*vec2(2.,1.4),(p-vec2(.51,.56))*vec2(2.,1.4)))*.35);
  background=mix(background,frostWhite,clamp(uMist,0.,1.));
  vec3 color=displayToLinear(max(background,0.));

  vec4 sharp=texture2D(uScene,p);
  // Coverage-aware edge antialiasing for the transparent scene. Interior skin
  // detail stays sharp; only the subpixel alpha silhouette gets a one-pixel
  // reconstruction, avoiding a full-size FXAA pass or high-sample render target.
  vec4 edgeL=texture2D(uScene,p-vec2(uTexel.x,0.));
  vec4 edgeR=texture2D(uScene,p+vec2(uTexel.x,0.));
  vec4 edgeU=texture2D(uScene,p+vec2(0.,uTexel.y));
  vec4 edgeD=texture2D(uScene,p-vec2(0.,uTexel.y));
  float aMin=min(sharp.a,min(min(edgeL.a,edgeR.a),min(edgeU.a,edgeD.a)));
  float aMax=max(sharp.a,max(max(edgeL.a,edgeR.a),max(edgeU.a,edgeD.a)));
  float coverageEdge=smoothstep(.08,.65,aMax-aMin);
  sharp=mix(sharp,(sharp*2.+edgeL+edgeR+edgeU+edgeD)/6.,coverageEdge*.75);
  vec4 soft=texture2D(uBloom,p);
  // One physical scene depth map, one full-colour separable diffusion target.
  // The focus band keeps palms sharp; petals crossing the lens become soft.
  float depth=texture2D(uDepth,p).r;
  float distanceToCamera=(uCameraNear*uCameraFar)/(uCameraFar-depth*(uCameraFar-uCameraNear));
  float coc=clamp((abs(distanceToCamera-uFocusDistance)-.25)/.85,0.,1.);
  float opticalBlur=coc*.70*smoothstep(.025,.12,sharp.a);
  vec4 object=mix(sharp,soft,opticalBlur);
  vec3 hdr=object.rgb/max(.001,object.a);
  vec3 foreground=filmic(hdr*.98);
  float fog=1.-smoothstep(.12,.62,length(mouse+flow*.10));
  float fogAmount=smoothstep(.6,1.15,uProgress)*(1.-smoothstep(1.8,2.35,uProgress));
  float reveal=mix(1.,.30+.70*fog,fogAmount);
  float mistDistance=uFocusDistance+.98-uMist*.87;
  float depthExposure=1.-smoothstep(mistDistance-.045,mistDistance+.04,distanceToCamera);
  float heightExposure=smoothstep(mix(-.15,.62,uMist),mix(-.08,.68,uMist),p.y+flow.x*.025);
  // Full mist genuinely hides the palm/discs. Only nearby upper fingertips
  // pierce the depth/height extinction volume; there is no 30% ghost floor.
  reveal*=mix(1.,depthExposure*heightExposure,clamp(uMist,0.,1.));
  color=color*(1.-object.a*reveal)+foreground*object.a*reveal;
  vec3 bright=max(soft.rgb-vec3(.72)*soft.a,vec3(0.));
  float scatteredEnergy=dot(bright,vec3(.2126,.7152,.0722));
  vec3 scatter=mix(vec3(scatteredEnergy),bright,.35);
  color+=filmic(scatter)*(.048+.032*environment)*(1.-uHold*.50)*(1.-uMist);
  // Broad, soft volumetric fans share a common offscreen light source.
  // Low-frequency extinction gives depth without the hard laser stripes of V4.
  vec2 sun=p-vec2(1.08,1.12);
  float theta=atan(sun.x,-sun.y);
  float shafts=pow(.5+.5*sin(theta*22.+.22),6.)*.65+pow(.5+.5*sin(theta*38.-.27),10.)*.35;
  float sunFalloff=pow(clamp(1.-length(sun)*.50,0.,1.),1.4);
  float cloudOcclusion=.78+.22*flow.x;
  float atmosphere=shafts*sunFalloff*.18*environment*cloudOcclusion;
  color+=mix(vec3(.64,.80,.77),vec3(.62,.27,.22),uHold)*atmosphere*(1.-object.a*.76);
  float whiteHalo=pow(clamp(1.-length((p-vec2(.94,1.02))*vec2(.65,.9)),0.,1.),12.);
  color+=mix(vec3(.13,.16,.14),vec3(.19,.095,.075),uHold)*whiteHalo*environment;
  float vignette=pow(length((p-.5)*vec2(1.,.8)),2.);
  color*=1.-vignette*.10*environment;
  float edges=pow(max(abs(p.x-.5)*2.,abs(p.y-.5)*2.),4.);
  color=mix(color,vec3(.94,.99,.96),edges*.18*environment*(1.-uHold));
  // A low-contrast glass dome: soft rim, mild Fresnel veil and one broad
  // white reflection. This is sampled scene refraction, not a replacement image.
  float domeEdge=exp(-pow((domeR-.995)/.024,2.));
  float domeFresnel=pow(clamp(domeR,0.,1.),5.)*domeMask;
  float domeHighlight=exp(-dot((dome-vec2(-.055,.084))*vec2(12.,24.),(dome-vec2(-.055,.084))*vec2(12.,24.)));
  color=mix(color,color*.88+vec3(.055,.052,.054),domeMask*uCharge*.22);
  color+=uCharge*(vec3(.075,.073,.079)*domeEdge+vec3(.035,.032,.037)*domeFresnel+vec3(.10,.095,.11)*domeHighlight);
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
