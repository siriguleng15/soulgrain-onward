(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&n(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}})();const cc="180",Hd=0,oh=1,Vd=2,Qu=1,Gd=2,ri=3,pi=0,Kt=1,en=2,Pi=0,Ur=1,lh=2,ch=3,hh=4,Wd=5,er=100,Xd=101,qd=102,Yd=103,jd=104,Kd=200,$d=201,Zd=202,Jd=203,Zo=204,Jo=205,Qd=206,ep=207,tp=208,np=209,ip=210,rp=211,sp=212,ap=213,op=214,Qo=0,el=1,tl=2,zr=3,nl=4,il=5,rl=6,sl=7,hc=0,lp=1,cp=2,ui=0,hp=1,up=2,fp=3,dp=4,pp=5,mp=6,gp=7,uh="attached",_p="detached",ef=300,Hr=301,Vr=302,al=303,ol=304,Xa=306,Ui=1e3,wi=1001,La=1002,$t=1003,tf=1004,_s=1005,jt=1006,Ta=1007,li=1008,xn=1009,nf=1010,rf=1011,As=1012,uc=1013,lr=1014,Nn=1015,Bi=1016,fc=1017,dc=1018,Rs=1020,sf=35902,af=35899,of=1021,lf=1022,nn=1023,Cs=1026,Ps=1027,pc=1028,mc=1029,cf=1030,gc=1031,_c=1033,ba=33776,Ea=33777,wa=33778,Aa=33779,ll=35840,cl=35841,hl=35842,ul=35843,fl=36196,dl=37492,pl=37496,ml=37808,gl=37809,_l=37810,vl=37811,xl=37812,yl=37813,Ml=37814,Sl=37815,Tl=37816,bl=37817,El=37818,wl=37819,Al=37820,Rl=37821,Cl=36492,Pl=36494,Dl=36495,Ll=36283,Il=36284,Ul=36285,Nl=36286,Ds=2300,Ls=2301,io=2302,fh=2400,dh=2401,ph=2402,vp=2500,xp=0,hf=1,Fl=2,yp=3200,Mp=3201,vc=0,Sp=1,oi="",wt="srgb",Zt="srgb-linear",Ia="linear",rt="srgb",fr=7680,mh=519,Tp=512,bp=513,Ep=514,uf=515,wp=516,Ap=517,Rp=518,Cp=519,Ol=35044,gh="300 es",Wn=2e3,Ua=2001;class Qr{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const i=n[e];if(i!==void 0){const r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let r=0,a=i.length;r<a;r++)i[r].call(this,e);e.target=null}}}const Ot=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let _h=1234567;const Ms=Math.PI/180,Gr=180/Math.PI;function Fn(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ot[s&255]+Ot[s>>8&255]+Ot[s>>16&255]+Ot[s>>24&255]+"-"+Ot[e&255]+Ot[e>>8&255]+"-"+Ot[e>>16&15|64]+Ot[e>>24&255]+"-"+Ot[t&63|128]+Ot[t>>8&255]+"-"+Ot[t>>16&255]+Ot[t>>24&255]+Ot[n&255]+Ot[n>>8&255]+Ot[n>>16&255]+Ot[n>>24&255]).toLowerCase()}function Ve(s,e,t){return Math.max(e,Math.min(t,s))}function xc(s,e){return(s%e+e)%e}function Pp(s,e,t,n,i){return n+(s-e)*(i-n)/(t-e)}function Dp(s,e,t){return s!==e?(t-s)/(e-s):0}function Ss(s,e,t){return(1-t)*s+t*e}function Lp(s,e,t,n){return Ss(s,e,1-Math.exp(-t*n))}function Ip(s,e=1){return e-Math.abs(xc(s,e*2)-e)}function Up(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function Np(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function Fp(s,e){return s+Math.floor(Math.random()*(e-s+1))}function Op(s,e){return s+Math.random()*(e-s)}function Bp(s){return s*(.5-Math.random())}function kp(s){s!==void 0&&(_h=s);let e=_h+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function zp(s){return s*Ms}function Hp(s){return s*Gr}function Vp(s){return(s&s-1)===0&&s!==0}function Gp(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Wp(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function Xp(s,e,t,n,i){const r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),h=a((e+n)/2),u=r((e-n)/2),f=a((e-n)/2),d=r((n-e)/2),_=a((n-e)/2);switch(i){case"XYX":s.set(o*h,l*u,l*f,o*c);break;case"YZY":s.set(l*f,o*h,l*u,o*c);break;case"ZXZ":s.set(l*u,l*f,o*h,o*c);break;case"XZX":s.set(o*h,l*_,l*d,o*c);break;case"YXY":s.set(l*d,o*h,l*_,o*c);break;case"ZYZ":s.set(l*_,l*d,o*h,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function In(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function tt(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const qp={DEG2RAD:Ms,RAD2DEG:Gr,generateUUID:Fn,clamp:Ve,euclideanModulo:xc,mapLinear:Pp,inverseLerp:Dp,lerp:Ss,damp:Lp,pingpong:Ip,smoothstep:Up,smootherstep:Np,randInt:Fp,randFloat:Op,randFloatSpread:Bp,seededRandom:kp,degToRad:zp,radToDeg:Hp,isPowerOfTwo:Vp,ceilPowerOfTwo:Gp,floorPowerOfTwo:Wp,setQuaternionFromProperEuler:Xp,normalize:tt,denormalize:In};class ue{constructor(e=0,t=0){ue.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ve(this.x,e.x,t.x),this.y=Ve(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ve(this.x,e,t),this.y=Ve(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Ve(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Ve(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*i+e.x,this.y=r*i+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Lt{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,r,a,o){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3];const f=r[a+0],d=r[a+1],_=r[a+2],g=r[a+3];if(o===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(o===1){e[t+0]=f,e[t+1]=d,e[t+2]=_,e[t+3]=g;return}if(u!==g||l!==f||c!==d||h!==_){let m=1-o;const p=l*f+c*d+h*_+u*g,M=p>=0?1:-1,x=1-p*p;if(x>Number.EPSILON){const S=Math.sqrt(x),A=Math.atan2(S,p*M);m=Math.sin(m*A)/S,o=Math.sin(o*A)/S}const v=o*M;if(l=l*m+f*v,c=c*m+d*v,h=h*m+_*v,u=u*m+g*v,m===1-o){const S=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=S,c*=S,h*=S,u*=S}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,i,r,a){const o=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=r[a],f=r[a+1],d=r[a+2],_=r[a+3];return e[t]=o*_+h*u+l*d-c*f,e[t+1]=l*_+h*f+c*u-o*d,e[t+2]=c*_+h*d+o*f-l*u,e[t+3]=h*_-o*u-l*f-c*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),h=o(i/2),u=o(r/2),f=l(n/2),d=l(i/2),_=l(r/2);switch(a){case"XYZ":this._x=f*h*u+c*d*_,this._y=c*d*u-f*h*_,this._z=c*h*_+f*d*u,this._w=c*h*u-f*d*_;break;case"YXZ":this._x=f*h*u+c*d*_,this._y=c*d*u-f*h*_,this._z=c*h*_-f*d*u,this._w=c*h*u+f*d*_;break;case"ZXY":this._x=f*h*u-c*d*_,this._y=c*d*u+f*h*_,this._z=c*h*_+f*d*u,this._w=c*h*u-f*d*_;break;case"ZYX":this._x=f*h*u-c*d*_,this._y=c*d*u+f*h*_,this._z=c*h*_-f*d*u,this._w=c*h*u+f*d*_;break;case"YZX":this._x=f*h*u+c*d*_,this._y=c*d*u+f*h*_,this._z=c*h*_-f*d*u,this._w=c*h*u-f*d*_;break;case"XZY":this._x=f*h*u-c*d*_,this._y=c*d*u-f*h*_,this._z=c*h*_+f*d*u,this._w=c*h*u+f*d*_;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],u=t[10],f=n+o+u;if(f>0){const d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(h-l)*d,this._y=(r-c)*d,this._z=(a-i)*d}else if(n>o&&n>u){const d=2*Math.sqrt(1+n-o-u);this._w=(h-l)/d,this._x=.25*d,this._y=(i+a)/d,this._z=(r+c)/d}else if(o>u){const d=2*Math.sqrt(1+o-n-u);this._w=(r-c)/d,this._x=(i+a)/d,this._y=.25*d,this._z=(l+h)/d}else{const d=2*Math.sqrt(1+u-n-o);this._w=(a-i)/d,this._x=(r+c)/d,this._y=(l+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ve(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+a*o+i*c-r*l,this._y=i*h+a*l+r*o-n*c,this._z=r*h+a*c+n*l-i*o,this._w=a*h-n*o-i*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,i=this._y,r=this._z,a=this._w;let o=a*e._w+n*e._x+i*e._y+r*e._z;if(o<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,o=-o):this.copy(e),o>=1)return this._w=a,this._x=n,this._y=i,this._z=r,this;const l=1-o*o;if(l<=Number.EPSILON){const d=1-t;return this._w=d*a+t*this._w,this._x=d*n+t*this._x,this._y=d*i+t*this._y,this._z=d*r+t*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,o),u=Math.sin((1-t)*h)/c,f=Math.sin(t*h)/c;return this._w=a*u+this._w*f,this._x=n*u+this._x*f,this._y=i*u+this._y*f,this._z=r*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class I{constructor(e=0,t=0,n=0){I.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(vh.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(vh.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*a,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*i-o*n),h=2*(o*t-r*i),u=2*(r*n-a*t);return this.x=t+l*c+a*u-o*h,this.y=n+l*h+o*c-r*u,this.z=i+l*u+r*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ve(this.x,e.x,t.x),this.y=Ve(this.y,e.y,t.y),this.z=Ve(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ve(this.x,e,t),this.y=Ve(this.y,e,t),this.z=Ve(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Ve(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=i*l-r*o,this.y=r*a-n*l,this.z=n*o-i*a,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return ro.copy(this).projectOnVector(e),this.sub(ro)}reflect(e){return this.sub(ro.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Ve(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const ro=new I,vh=new Lt;class Be{constructor(e,t,n,i,r,a,o,l,c){Be.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,a,o,l,c)}set(e,t,n,i,r,a,o,l,c){const h=this.elements;return h[0]=e,h[1]=i,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],h=n[4],u=n[7],f=n[2],d=n[5],_=n[8],g=i[0],m=i[3],p=i[6],M=i[1],x=i[4],v=i[7],S=i[2],A=i[5],w=i[8];return r[0]=a*g+o*M+l*S,r[3]=a*m+o*x+l*A,r[6]=a*p+o*v+l*w,r[1]=c*g+h*M+u*S,r[4]=c*m+h*x+u*A,r[7]=c*p+h*v+u*w,r[2]=f*g+d*M+_*S,r[5]=f*m+d*x+_*A,r[8]=f*p+d*v+_*w,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-n*r*h+n*o*l+i*r*c-i*a*l}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=h*a-o*c,f=o*l-h*r,d=c*r-a*l,_=t*u+n*f+i*d;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);const g=1/_;return e[0]=u*g,e[1]=(i*c-h*n)*g,e[2]=(o*n-i*a)*g,e[3]=f*g,e[4]=(h*t-i*l)*g,e[5]=(i*r-o*t)*g,e[6]=d*g,e[7]=(n*l-c*t)*g,e[8]=(a*t-n*r)*g,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,a,o){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-i*c,i*l,-i*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return this.premultiply(so.makeScale(e,t)),this}rotate(e){return this.premultiply(so.makeRotation(-e)),this}translate(e,t){return this.premultiply(so.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const so=new Be;function ff(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function Is(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Yp(){const s=Is("canvas");return s.style.display="block",s}const xh={};function Us(s){s in xh||(xh[s]=!0,console.warn(s))}function jp(s,e,t){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}const yh=new Be().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Mh=new Be().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Kp(){const s={enabled:!0,workingColorSpace:Zt,spaces:{},convert:function(i,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===rt&&(i.r=fi(i.r),i.g=fi(i.g),i.b=fi(i.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===rt&&(i.r=Nr(i.r),i.g=Nr(i.g),i.b=Nr(i.b))),i},workingToColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},colorSpaceToWorking:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===oi?Ia:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,a){return i.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(i,r){return Us("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(i,r)},toWorkingColorSpace:function(i,r){return Us("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(i,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return s.define({[Zt]:{primaries:e,whitePoint:n,transfer:Ia,toXYZ:yh,fromXYZ:Mh,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:wt},outputColorSpaceConfig:{drawingBufferColorSpace:wt}},[wt]:{primaries:e,whitePoint:n,transfer:rt,toXYZ:yh,fromXYZ:Mh,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:wt}}}),s}const Ze=Kp();function fi(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Nr(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let dr;class $p{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{dr===void 0&&(dr=Is("canvas")),dr.width=e.width,dr.height=e.height;const i=dr.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=dr}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Is("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),r=i.data;for(let a=0;a<r.length;a++)r[a]=fi(r[a]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(fi(t[n]/255)*255):t[n]=fi(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Zp=0;class yc{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Zp++}),this.uuid=Fn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let a=0,o=i.length;a<o;a++)i[a].isDataTexture?r.push(ao(i[a].image)):r.push(ao(i[a]))}else r=ao(i);n.url=r}return t||(e.images[this.uuid]=n),n}}function ao(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?$p.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Jp=0;const oo=new I;class At extends Qr{constructor(e=At.DEFAULT_IMAGE,t=At.DEFAULT_MAPPING,n=wi,i=wi,r=jt,a=li,o=nn,l=xn,c=At.DEFAULT_ANISOTROPY,h=oi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Jp++}),this.uuid=Fn(),this.name="",this.source=new yc(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new ue(0,0),this.repeat=new ue(1,1),this.center=new ue(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Be,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(oo).x}get height(){return this.source.getSize(oo).y}get depth(){return this.source.getSize(oo).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==ef)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ui:e.x=e.x-Math.floor(e.x);break;case wi:e.x=e.x<0?0:1;break;case La:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ui:e.y=e.y-Math.floor(e.y);break;case wi:e.y=e.y<0?0:1;break;case La:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}At.DEFAULT_IMAGE=null;At.DEFAULT_MAPPING=ef;At.DEFAULT_ANISOTROPY=1;class qe{constructor(e=0,t=0,n=0,i=1){qe.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*i+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*i+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*i+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*i+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r;const l=e.elements,c=l[0],h=l[4],u=l[8],f=l[1],d=l[5],_=l[9],g=l[2],m=l[6],p=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-g)<.01&&Math.abs(_-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+g)<.1&&Math.abs(_+m)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const x=(c+1)/2,v=(d+1)/2,S=(p+1)/2,A=(h+f)/4,w=(u+g)/4,R=(_+m)/4;return x>v&&x>S?x<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(x),i=A/n,r=w/n):v>S?v<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(v),n=A/i,r=R/i):S<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(S),n=w/r,i=R/r),this.set(n,i,r,t),this}let M=Math.sqrt((m-_)*(m-_)+(u-g)*(u-g)+(f-h)*(f-h));return Math.abs(M)<.001&&(M=1),this.x=(m-_)/M,this.y=(u-g)/M,this.z=(f-h)/M,this.w=Math.acos((c+d+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ve(this.x,e.x,t.x),this.y=Ve(this.y,e.y,t.y),this.z=Ve(this.z,e.z,t.z),this.w=Ve(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ve(this.x,e,t),this.y=Ve(this.y,e,t),this.z=Ve(this.z,e,t),this.w=Ve(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Ve(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Qp extends Qr{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:jt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new qe(0,0,e,t),this.scissorTest=!1,this.viewport=new qe(0,0,e,t);const i={width:e,height:t,depth:n.depth},r=new At(i);this.textures=[];const a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){const t={minFilter:jt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n,this.textures[i].isArrayTexture=this.textures[i].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const i=Object.assign({},e.textures[t].image);this.textures[t].source=new yc(i)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class qn extends Qp{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class df extends At{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=$t,this.minFilter=$t,this.wrapR=wi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class em extends At{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=$t,this.minFilter=$t,this.wrapR=wi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class _i{constructor(e=new I(1/0,1/0,1/0),t=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Cn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Cn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Cn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Cn):Cn.fromBufferAttribute(r,a),Cn.applyMatrix4(e.matrixWorld),this.expandByPoint(Cn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Ks.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ks.copy(n.boundingBox)),Ks.applyMatrix4(e.matrixWorld),this.union(Ks)}const i=e.children;for(let r=0,a=i.length;r<a;r++)this.expandByObject(i[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Cn),Cn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(as),$s.subVectors(this.max,as),pr.subVectors(e.a,as),mr.subVectors(e.b,as),gr.subVectors(e.c,as),vi.subVectors(mr,pr),xi.subVectors(gr,mr),Vi.subVectors(pr,gr);let t=[0,-vi.z,vi.y,0,-xi.z,xi.y,0,-Vi.z,Vi.y,vi.z,0,-vi.x,xi.z,0,-xi.x,Vi.z,0,-Vi.x,-vi.y,vi.x,0,-xi.y,xi.x,0,-Vi.y,Vi.x,0];return!lo(t,pr,mr,gr,$s)||(t=[1,0,0,0,1,0,0,0,1],!lo(t,pr,mr,gr,$s))?!1:(Zs.crossVectors(vi,xi),t=[Zs.x,Zs.y,Zs.z],lo(t,pr,mr,gr,$s))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Cn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Cn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Zn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Zn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Zn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Zn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Zn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Zn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Zn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Zn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Zn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Zn=[new I,new I,new I,new I,new I,new I,new I,new I],Cn=new I,Ks=new _i,pr=new I,mr=new I,gr=new I,vi=new I,xi=new I,Vi=new I,as=new I,$s=new I,Zs=new I,Gi=new I;function lo(s,e,t,n,i){for(let r=0,a=s.length-3;r<=a;r+=3){Gi.fromArray(s,r);const o=i.x*Math.abs(Gi.x)+i.y*Math.abs(Gi.y)+i.z*Math.abs(Gi.z),l=e.dot(Gi),c=t.dot(Gi),h=n.dot(Gi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}const tm=new _i,os=new I,co=new I;class Kn{constructor(e=new I,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):tm.setFromPoints(e).getCenter(n);let i=0;for(let r=0,a=e.length;r<a;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;os.subVectors(e,this.center);const t=os.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(os,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(co.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(os.copy(e.center).add(co)),this.expandByPoint(os.copy(e.center).sub(co))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const Jn=new I,ho=new I,Js=new I,yi=new I,uo=new I,Qs=new I,fo=new I;class Gs{constructor(e=new I,t=new I(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Jn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Jn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Jn.copy(this.origin).addScaledVector(this.direction,t),Jn.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){ho.copy(e).add(t).multiplyScalar(.5),Js.copy(t).sub(e).normalize(),yi.copy(this.origin).sub(ho);const r=e.distanceTo(t)*.5,a=-this.direction.dot(Js),o=yi.dot(this.direction),l=-yi.dot(Js),c=yi.lengthSq(),h=Math.abs(1-a*a);let u,f,d,_;if(h>0)if(u=a*l-o,f=a*o-l,_=r*h,u>=0)if(f>=-_)if(f<=_){const g=1/h;u*=g,f*=g,d=u*(u+a*f+2*o)+f*(a*u+f+2*l)+c}else f=r,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;else f=-r,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;else f<=-_?(u=Math.max(0,-(-a*r+o)),f=u>0?-r:Math.min(Math.max(-r,-l),r),d=-u*u+f*(f+2*l)+c):f<=_?(u=0,f=Math.min(Math.max(-r,-l),r),d=f*(f+2*l)+c):(u=Math.max(0,-(a*r+o)),f=u>0?r:Math.min(Math.max(-r,-l),r),d=-u*u+f*(f+2*l)+c);else f=a>0?-r:r,u=Math.max(0,-(a*f+o)),d=-u*u+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(ho).addScaledVector(Js,f),d}intersectSphere(e,t){Jn.subVectors(e.center,this.origin);const n=Jn.dot(this.direction),i=Jn.dot(Jn)-n*n,r=e.radius*e.radius;if(i>r)return null;const a=Math.sqrt(r-i),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,a,o,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(n=(e.min.x-f.x)*c,i=(e.max.x-f.x)*c):(n=(e.max.x-f.x)*c,i=(e.min.x-f.x)*c),h>=0?(r=(e.min.y-f.y)*h,a=(e.max.y-f.y)*h):(r=(e.max.y-f.y)*h,a=(e.min.y-f.y)*h),n>a||r>i||((r>n||isNaN(n))&&(n=r),(a<i||isNaN(i))&&(i=a),u>=0?(o=(e.min.z-f.z)*u,l=(e.max.z-f.z)*u):(o=(e.max.z-f.z)*u,l=(e.min.z-f.z)*u),n>l||o>i)||((o>n||n!==n)&&(n=o),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Jn)!==null}intersectTriangle(e,t,n,i,r){uo.subVectors(t,e),Qs.subVectors(n,e),fo.crossVectors(uo,Qs);let a=this.direction.dot(fo),o;if(a>0){if(i)return null;o=1}else if(a<0)o=-1,a=-a;else return null;yi.subVectors(this.origin,e);const l=o*this.direction.dot(Qs.crossVectors(yi,Qs));if(l<0)return null;const c=o*this.direction.dot(uo.cross(yi));if(c<0||l+c>a)return null;const h=-o*yi.dot(fo);return h<0?null:this.at(h/a,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ne{constructor(e,t,n,i,r,a,o,l,c,h,u,f,d,_,g,m){Ne.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,a,o,l,c,h,u,f,d,_,g,m)}set(e,t,n,i,r,a,o,l,c,h,u,f,d,_,g,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=i,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=f,p[3]=d,p[7]=_,p[11]=g,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ne().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,i=1/_r.setFromMatrixColumn(e,0).length(),r=1/_r.setFromMatrixColumn(e,1).length(),a=1/_r.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,i=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const f=a*h,d=a*u,_=o*h,g=o*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=d+_*c,t[5]=f-g*c,t[9]=-o*l,t[2]=g-f*c,t[6]=_+d*c,t[10]=a*l}else if(e.order==="YXZ"){const f=l*h,d=l*u,_=c*h,g=c*u;t[0]=f+g*o,t[4]=_*o-d,t[8]=a*c,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=d*o-_,t[6]=g+f*o,t[10]=a*l}else if(e.order==="ZXY"){const f=l*h,d=l*u,_=c*h,g=c*u;t[0]=f-g*o,t[4]=-a*u,t[8]=_+d*o,t[1]=d+_*o,t[5]=a*h,t[9]=g-f*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){const f=a*h,d=a*u,_=o*h,g=o*u;t[0]=l*h,t[4]=_*c-d,t[8]=f*c+g,t[1]=l*u,t[5]=g*c+f,t[9]=d*c-_,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){const f=a*l,d=a*c,_=o*l,g=o*c;t[0]=l*h,t[4]=g-f*u,t[8]=_*u+d,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=d*u+_,t[10]=f-g*u}else if(e.order==="XZY"){const f=a*l,d=a*c,_=o*l,g=o*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=f*u+g,t[5]=a*h,t[9]=d*u-_,t[2]=_*u-d,t[6]=o*h,t[10]=g*u+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(nm,e,im)}lookAt(e,t,n){const i=this.elements;return fn.subVectors(e,t),fn.lengthSq()===0&&(fn.z=1),fn.normalize(),Mi.crossVectors(n,fn),Mi.lengthSq()===0&&(Math.abs(n.z)===1?fn.x+=1e-4:fn.z+=1e-4,fn.normalize(),Mi.crossVectors(n,fn)),Mi.normalize(),ea.crossVectors(fn,Mi),i[0]=Mi.x,i[4]=ea.x,i[8]=fn.x,i[1]=Mi.y,i[5]=ea.y,i[9]=fn.y,i[2]=Mi.z,i[6]=ea.z,i[10]=fn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],h=n[1],u=n[5],f=n[9],d=n[13],_=n[2],g=n[6],m=n[10],p=n[14],M=n[3],x=n[7],v=n[11],S=n[15],A=i[0],w=i[4],R=i[8],y=i[12],b=i[1],P=i[5],D=i[9],N=i[13],k=i[2],z=i[6],W=i[10],q=i[14],V=i[3],ie=i[7],oe=i[11],ge=i[15];return r[0]=a*A+o*b+l*k+c*V,r[4]=a*w+o*P+l*z+c*ie,r[8]=a*R+o*D+l*W+c*oe,r[12]=a*y+o*N+l*q+c*ge,r[1]=h*A+u*b+f*k+d*V,r[5]=h*w+u*P+f*z+d*ie,r[9]=h*R+u*D+f*W+d*oe,r[13]=h*y+u*N+f*q+d*ge,r[2]=_*A+g*b+m*k+p*V,r[6]=_*w+g*P+m*z+p*ie,r[10]=_*R+g*D+m*W+p*oe,r[14]=_*y+g*N+m*q+p*ge,r[3]=M*A+x*b+v*k+S*V,r[7]=M*w+x*P+v*z+S*ie,r[11]=M*R+x*D+v*W+S*oe,r[15]=M*y+x*N+v*q+S*ge,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],u=e[6],f=e[10],d=e[14],_=e[3],g=e[7],m=e[11],p=e[15];return _*(+r*l*u-i*c*u-r*o*f+n*c*f+i*o*d-n*l*d)+g*(+t*l*d-t*c*f+r*a*f-i*a*d+i*c*h-r*l*h)+m*(+t*c*u-t*o*d-r*a*u+n*a*d+r*o*h-n*c*h)+p*(-i*o*h-t*l*u+t*o*f+i*a*u-n*a*f+n*l*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=e[9],f=e[10],d=e[11],_=e[12],g=e[13],m=e[14],p=e[15],M=u*m*c-g*f*c+g*l*d-o*m*d-u*l*p+o*f*p,x=_*f*c-h*m*c-_*l*d+a*m*d+h*l*p-a*f*p,v=h*g*c-_*u*c+_*o*d-a*g*d-h*o*p+a*u*p,S=_*u*l-h*g*l-_*o*f+a*g*f+h*o*m-a*u*m,A=t*M+n*x+i*v+r*S;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const w=1/A;return e[0]=M*w,e[1]=(g*f*r-u*m*r-g*i*d+n*m*d+u*i*p-n*f*p)*w,e[2]=(o*m*r-g*l*r+g*i*c-n*m*c-o*i*p+n*l*p)*w,e[3]=(u*l*r-o*f*r-u*i*c+n*f*c+o*i*d-n*l*d)*w,e[4]=x*w,e[5]=(h*m*r-_*f*r+_*i*d-t*m*d-h*i*p+t*f*p)*w,e[6]=(_*l*r-a*m*r-_*i*c+t*m*c+a*i*p-t*l*p)*w,e[7]=(a*f*r-h*l*r+h*i*c-t*f*c-a*i*d+t*l*d)*w,e[8]=v*w,e[9]=(_*u*r-h*g*r-_*n*d+t*g*d+h*n*p-t*u*p)*w,e[10]=(a*g*r-_*o*r+_*n*c-t*g*c-a*n*p+t*o*p)*w,e[11]=(h*o*r-a*u*r-h*n*c+t*u*c+a*n*d-t*o*d)*w,e[12]=S*w,e[13]=(h*g*i-_*u*i+_*n*f-t*g*f-h*n*m+t*u*m)*w,e[14]=(_*o*i-a*g*i-_*n*l+t*g*l+a*n*m-t*o*m)*w,e[15]=(a*u*i-h*o*i+h*n*l-t*u*l-a*n*f+t*o*f)*w,this}scale(e){const t=this.elements,n=e.x,i=e.y,r=e.z;return t[0]*=n,t[4]*=i,t[8]*=r,t[1]*=n,t[5]*=i,t[9]*=r,t[2]*=n,t[6]*=i,t[10]*=r,t[3]*=n,t[7]*=i,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+n,c*o-i*l,c*l+i*o,0,c*o+i*l,h*o+n,h*l-i*a,0,c*l-i*o,h*l+i*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,r,a){return this.set(1,n,r,0,e,1,a,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,u=o+o,f=r*c,d=r*h,_=r*u,g=a*h,m=a*u,p=o*u,M=l*c,x=l*h,v=l*u,S=n.x,A=n.y,w=n.z;return i[0]=(1-(g+p))*S,i[1]=(d+v)*S,i[2]=(_-x)*S,i[3]=0,i[4]=(d-v)*A,i[5]=(1-(f+p))*A,i[6]=(m+M)*A,i[7]=0,i[8]=(_+x)*w,i[9]=(m-M)*w,i[10]=(1-(f+g))*w,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;let r=_r.set(i[0],i[1],i[2]).length();const a=_r.set(i[4],i[5],i[6]).length(),o=_r.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),e.x=i[12],e.y=i[13],e.z=i[14],Pn.copy(this);const c=1/r,h=1/a,u=1/o;return Pn.elements[0]*=c,Pn.elements[1]*=c,Pn.elements[2]*=c,Pn.elements[4]*=h,Pn.elements[5]*=h,Pn.elements[6]*=h,Pn.elements[8]*=u,Pn.elements[9]*=u,Pn.elements[10]*=u,t.setFromRotationMatrix(Pn),n.x=r,n.y=a,n.z=o,this}makePerspective(e,t,n,i,r,a,o=Wn,l=!1){const c=this.elements,h=2*r/(t-e),u=2*r/(n-i),f=(t+e)/(t-e),d=(n+i)/(n-i);let _,g;if(l)_=r/(a-r),g=a*r/(a-r);else if(o===Wn)_=-(a+r)/(a-r),g=-2*a*r/(a-r);else if(o===Ua)_=-a/(a-r),g=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=f,c[12]=0,c[1]=0,c[5]=u,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=_,c[14]=g,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,i,r,a,o=Wn,l=!1){const c=this.elements,h=2/(t-e),u=2/(n-i),f=-(t+e)/(t-e),d=-(n+i)/(n-i);let _,g;if(l)_=1/(a-r),g=a/(a-r);else if(o===Wn)_=-2/(a-r),g=-(a+r)/(a-r);else if(o===Ua)_=-1/(a-r),g=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=f,c[1]=0,c[5]=u,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=_,c[14]=g,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const _r=new I,Pn=new Ne,nm=new I(0,0,0),im=new I(1,1,1),Mi=new I,ea=new I,fn=new I,Sh=new Ne,Th=new Lt;class rn{constructor(e=0,t=0,n=0,i=rn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,r=i[0],a=i[4],o=i[8],l=i[1],c=i[5],h=i[9],u=i[2],f=i[6],d=i[10];switch(t){case"XYZ":this._y=Math.asin(Ve(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ve(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ve(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,d),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Ve(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Ve(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-Ve(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Sh.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Sh,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Th.setFromEuler(this),this.setFromQuaternion(Th,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}rn.DEFAULT_ORDER="XYZ";class Mc{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let rm=0;const bh=new I,vr=new Lt,Qn=new Ne,ta=new I,ls=new I,sm=new I,am=new Lt,Eh=new I(1,0,0),wh=new I(0,1,0),Ah=new I(0,0,1),Rh={type:"added"},om={type:"removed"},xr={type:"childadded",child:null},po={type:"childremoved",child:null};class ct extends Qr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:rm++}),this.uuid=Fn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ct.DEFAULT_UP.clone();const e=new I,t=new rn,n=new Lt,i=new I(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Ne},normalMatrix:{value:new Be}}),this.matrix=new Ne,this.matrixWorld=new Ne,this.matrixAutoUpdate=ct.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=ct.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Mc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return vr.setFromAxisAngle(e,t),this.quaternion.multiply(vr),this}rotateOnWorldAxis(e,t){return vr.setFromAxisAngle(e,t),this.quaternion.premultiply(vr),this}rotateX(e){return this.rotateOnAxis(Eh,e)}rotateY(e){return this.rotateOnAxis(wh,e)}rotateZ(e){return this.rotateOnAxis(Ah,e)}translateOnAxis(e,t){return bh.copy(e).applyQuaternion(this.quaternion),this.position.add(bh.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Eh,e)}translateY(e){return this.translateOnAxis(wh,e)}translateZ(e){return this.translateOnAxis(Ah,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Qn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?ta.copy(e):ta.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),ls.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Qn.lookAt(ls,ta,this.up):Qn.lookAt(ta,ls,this.up),this.quaternion.setFromRotationMatrix(Qn),i&&(Qn.extractRotation(i.matrixWorld),vr.setFromRotationMatrix(Qn),this.quaternion.premultiply(vr.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Rh),xr.child=e,this.dispatchEvent(xr),xr.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(om),po.child=e,this.dispatchEvent(po),po.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Qn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Qn.multiply(e.parent.matrixWorld)),e.applyMatrix4(Qn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Rh),xr.child=e,this.dispatchEvent(xr),xr.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ls,e,sm),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ls,am,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const i=this.children;for(let r=0,a=i.length;r<a;r++)i[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(o=>({...o})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(e),i.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(e.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));i.material=o}else i.material=r(e.materials,this.material);if(this.children.length>0){i.children=[];for(let o=0;o<this.children.length;o++)i.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let o=0;o<this.animations.length;o++){const l=this.animations[o];i.animations.push(r(e.animations,l))}}if(t){const o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),u=a(e.shapes),f=a(e.skeletons),d=a(e.animations),_=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),d.length>0&&(n.animations=d),_.length>0&&(n.nodes=_)}return n.object=i,n;function a(o){const l=[];for(const c in o){const h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}ct.DEFAULT_UP=new I(0,1,0);ct.DEFAULT_MATRIX_AUTO_UPDATE=!0;ct.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Dn=new I,ei=new I,mo=new I,ti=new I,yr=new I,Mr=new I,Ch=new I,go=new I,_o=new I,vo=new I,xo=new qe,yo=new qe,Mo=new qe;class Un{constructor(e=new I,t=new I,n=new I){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),Dn.subVectors(e,t),i.cross(Dn);const r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(e,t,n,i,r){Dn.subVectors(i,t),ei.subVectors(n,t),mo.subVectors(e,t);const a=Dn.dot(Dn),o=Dn.dot(ei),l=Dn.dot(mo),c=ei.dot(ei),h=ei.dot(mo),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;const f=1/u,d=(c*l-o*h)*f,_=(a*h-o*l)*f;return r.set(1-d-_,_,d)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,ti)===null?!1:ti.x>=0&&ti.y>=0&&ti.x+ti.y<=1}static getInterpolation(e,t,n,i,r,a,o,l){return this.getBarycoord(e,t,n,i,ti)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,ti.x),l.addScaledVector(a,ti.y),l.addScaledVector(o,ti.z),l)}static getInterpolatedAttribute(e,t,n,i,r,a){return xo.setScalar(0),yo.setScalar(0),Mo.setScalar(0),xo.fromBufferAttribute(e,t),yo.fromBufferAttribute(e,n),Mo.fromBufferAttribute(e,i),a.setScalar(0),a.addScaledVector(xo,r.x),a.addScaledVector(yo,r.y),a.addScaledVector(Mo,r.z),a}static isFrontFacing(e,t,n,i){return Dn.subVectors(n,t),ei.subVectors(e,t),Dn.cross(ei).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Dn.subVectors(this.c,this.b),ei.subVectors(this.a,this.b),Dn.cross(ei).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Un.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Un.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,r){return Un.getInterpolation(e,this.a,this.b,this.c,t,n,i,r)}containsPoint(e){return Un.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Un.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,r=this.c;let a,o;yr.subVectors(i,n),Mr.subVectors(r,n),go.subVectors(e,n);const l=yr.dot(go),c=Mr.dot(go);if(l<=0&&c<=0)return t.copy(n);_o.subVectors(e,i);const h=yr.dot(_o),u=Mr.dot(_o);if(h>=0&&u<=h)return t.copy(i);const f=l*u-h*c;if(f<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(n).addScaledVector(yr,a);vo.subVectors(e,r);const d=yr.dot(vo),_=Mr.dot(vo);if(_>=0&&d<=_)return t.copy(r);const g=d*c-l*_;if(g<=0&&c>=0&&_<=0)return o=c/(c-_),t.copy(n).addScaledVector(Mr,o);const m=h*_-d*u;if(m<=0&&u-h>=0&&d-_>=0)return Ch.subVectors(r,i),o=(u-h)/(u-h+(d-_)),t.copy(i).addScaledVector(Ch,o);const p=1/(m+g+f);return a=g*p,o=f*p,t.copy(n).addScaledVector(yr,a).addScaledVector(Mr,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const pf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Si={h:0,s:0,l:0},na={h:0,s:0,l:0};function So(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}class me{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=wt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ze.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=Ze.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ze.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=Ze.workingColorSpace){if(e=xc(e,1),t=Ve(t,0,1),n=Ve(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=So(a,r,e+1/3),this.g=So(a,r,e),this.b=So(a,r,e-1/3)}return Ze.colorSpaceToWorking(this,i),this}setStyle(e,t=wt){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const a=i[1],o=i[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=i[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=wt){const n=pf[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=fi(e.r),this.g=fi(e.g),this.b=fi(e.b),this}copyLinearToSRGB(e){return this.r=Nr(e.r),this.g=Nr(e.g),this.b=Nr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=wt){return Ze.workingToColorSpace(Bt.copy(this),e),Math.round(Ve(Bt.r*255,0,255))*65536+Math.round(Ve(Bt.g*255,0,255))*256+Math.round(Ve(Bt.b*255,0,255))}getHexString(e=wt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ze.workingColorSpace){Ze.workingToColorSpace(Bt.copy(this),t);const n=Bt.r,i=Bt.g,r=Bt.b,a=Math.max(n,i,r),o=Math.min(n,i,r);let l,c;const h=(o+a)/2;if(o===a)l=0,c=0;else{const u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case n:l=(i-r)/u+(i<r?6:0);break;case i:l=(r-n)/u+2;break;case r:l=(n-i)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=Ze.workingColorSpace){return Ze.workingToColorSpace(Bt.copy(this),t),e.r=Bt.r,e.g=Bt.g,e.b=Bt.b,e}getStyle(e=wt){Ze.workingToColorSpace(Bt.copy(this),e);const t=Bt.r,n=Bt.g,i=Bt.b;return e!==wt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(Si),this.setHSL(Si.h+e,Si.s+t,Si.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Si),e.getHSL(na);const n=Ss(Si.h,na.h,t),i=Ss(Si.s,na.s,t),r=Ss(Si.l,na.l,t);return this.setHSL(n,i,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*i,this.g=r[1]*t+r[4]*n+r[7]*i,this.b=r[2]*t+r[5]*n+r[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Bt=new me;me.NAMES=pf;let lm=0;class On extends Qr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:lm++}),this.uuid=Fn(),this.name="",this.type="Material",this.blending=Ur,this.side=pi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Zo,this.blendDst=Jo,this.blendEquation=er,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new me(0,0,0),this.blendAlpha=0,this.depthFunc=zr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=mh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=fr,this.stencilZFail=fr,this.stencilZPass=fr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Ur&&(n.blending=this.blending),this.side!==pi&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Zo&&(n.blendSrc=this.blendSrc),this.blendDst!==Jo&&(n.blendDst=this.blendDst),this.blendEquation!==er&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==zr&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==mh&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==fr&&(n.stencilFail=this.stencilFail),this.stencilZFail!==fr&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==fr&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){const a=[];for(const o in r){const l=r[o];delete l.metadata,a.push(l)}return a}if(t){const r=i(e.textures),a=i(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class ci extends On{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new me(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new rn,this.combine=hc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const bt=new I,ia=new ue;let cm=0;class Vt{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:cm++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Ol,this.updateRanges=[],this.gpuType=Nn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ia.fromBufferAttribute(this,t),ia.applyMatrix3(e),this.setXY(t,ia.x,ia.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)bt.fromBufferAttribute(this,t),bt.applyMatrix3(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)bt.fromBufferAttribute(this,t),bt.applyMatrix4(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)bt.fromBufferAttribute(this,t),bt.applyNormalMatrix(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)bt.fromBufferAttribute(this,t),bt.transformDirection(e),this.setXYZ(t,bt.x,bt.y,bt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=In(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=tt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=In(t,this.array)),t}setX(e,t){return this.normalized&&(t=tt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=In(t,this.array)),t}setY(e,t){return this.normalized&&(t=tt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=In(t,this.array)),t}setZ(e,t){return this.normalized&&(t=tt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=In(t,this.array)),t}setW(e,t){return this.normalized&&(t=tt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array),i=tt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array),i=tt(i,this.array),r=tt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Ol&&(e.usage=this.usage),e}}class mf extends Vt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class gf extends Vt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Ye extends Vt{constructor(e,t,n){super(new Float32Array(e),t,n)}}let hm=0;const bn=new Ne,To=new ct,Sr=new I,dn=new _i,cs=new _i,Dt=new I;class Mt extends Qr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:hm++}),this.uuid=Fn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(ff(e)?gf:mf)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Be().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return bn.makeRotationFromQuaternion(e),this.applyMatrix4(bn),this}rotateX(e){return bn.makeRotationX(e),this.applyMatrix4(bn),this}rotateY(e){return bn.makeRotationY(e),this.applyMatrix4(bn),this}rotateZ(e){return bn.makeRotationZ(e),this.applyMatrix4(bn),this}translate(e,t,n){return bn.makeTranslation(e,t,n),this.applyMatrix4(bn),this}scale(e,t,n){return bn.makeScale(e,t,n),this.applyMatrix4(bn),this}lookAt(e){return To.lookAt(e),To.updateMatrix(),this.applyMatrix4(To.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Sr).negate(),this.translate(Sr.x,Sr.y,Sr.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let i=0,r=e.length;i<r;i++){const a=e[i];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Ye(n,3))}else{const n=Math.min(e.length,t.count);for(let i=0;i<n;i++){const r=e[i];t.setXYZ(i,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new _i);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const r=t[n];dn.setFromBufferAttribute(r),this.morphTargetsRelative?(Dt.addVectors(this.boundingBox.min,dn.min),this.boundingBox.expandByPoint(Dt),Dt.addVectors(this.boundingBox.max,dn.max),this.boundingBox.expandByPoint(Dt)):(this.boundingBox.expandByPoint(dn.min),this.boundingBox.expandByPoint(dn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Kn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(e){const n=this.boundingSphere.center;if(dn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){const o=t[r];cs.setFromBufferAttribute(o),this.morphTargetsRelative?(Dt.addVectors(dn.min,cs.min),dn.expandByPoint(Dt),Dt.addVectors(dn.max,cs.max),dn.expandByPoint(Dt)):(dn.expandByPoint(cs.min),dn.expandByPoint(cs.max))}dn.getCenter(n);let i=0;for(let r=0,a=e.count;r<a;r++)Dt.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(Dt));if(t)for(let r=0,a=t.length;r<a;r++){const o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Dt.fromBufferAttribute(o,c),l&&(Sr.fromBufferAttribute(e,c),Dt.add(Sr)),i=Math.max(i,n.distanceToSquared(Dt))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,i=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Vt(new Float32Array(4*n.count),4));const a=this.getAttribute("tangent"),o=[],l=[];for(let R=0;R<n.count;R++)o[R]=new I,l[R]=new I;const c=new I,h=new I,u=new I,f=new ue,d=new ue,_=new ue,g=new I,m=new I;function p(R,y,b){c.fromBufferAttribute(n,R),h.fromBufferAttribute(n,y),u.fromBufferAttribute(n,b),f.fromBufferAttribute(r,R),d.fromBufferAttribute(r,y),_.fromBufferAttribute(r,b),h.sub(c),u.sub(c),d.sub(f),_.sub(f);const P=1/(d.x*_.y-_.x*d.y);isFinite(P)&&(g.copy(h).multiplyScalar(_.y).addScaledVector(u,-d.y).multiplyScalar(P),m.copy(u).multiplyScalar(d.x).addScaledVector(h,-_.x).multiplyScalar(P),o[R].add(g),o[y].add(g),o[b].add(g),l[R].add(m),l[y].add(m),l[b].add(m))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let R=0,y=M.length;R<y;++R){const b=M[R],P=b.start,D=b.count;for(let N=P,k=P+D;N<k;N+=3)p(e.getX(N+0),e.getX(N+1),e.getX(N+2))}const x=new I,v=new I,S=new I,A=new I;function w(R){S.fromBufferAttribute(i,R),A.copy(S);const y=o[R];x.copy(y),x.sub(S.multiplyScalar(S.dot(y))).normalize(),v.crossVectors(A,y);const P=v.dot(l[R])<0?-1:1;a.setXYZW(R,x.x,x.y,x.z,P)}for(let R=0,y=M.length;R<y;++R){const b=M[R],P=b.start,D=b.count;for(let N=P,k=P+D;N<k;N+=3)w(e.getX(N+0)),w(e.getX(N+1)),w(e.getX(N+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Vt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,d=n.count;f<d;f++)n.setXYZ(f,0,0,0);const i=new I,r=new I,a=new I,o=new I,l=new I,c=new I,h=new I,u=new I;if(e)for(let f=0,d=e.count;f<d;f+=3){const _=e.getX(f+0),g=e.getX(f+1),m=e.getX(f+2);i.fromBufferAttribute(t,_),r.fromBufferAttribute(t,g),a.fromBufferAttribute(t,m),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),o.fromBufferAttribute(n,_),l.fromBufferAttribute(n,g),c.fromBufferAttribute(n,m),o.add(h),l.add(h),c.add(h),n.setXYZ(_,o.x,o.y,o.z),n.setXYZ(g,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,d=t.count;f<d;f+=3)i.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),a.fromBufferAttribute(t,f+2),h.subVectors(a,r),u.subVectors(i,r),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Dt.fromBufferAttribute(e,t),Dt.normalize(),e.setXYZ(t,Dt.x,Dt.y,Dt.z)}toNonIndexed(){function e(o,l){const c=o.array,h=o.itemSize,u=o.normalized,f=new c.constructor(l.length*h);let d=0,_=0;for(let g=0,m=l.length;g<m;g++){o.isInterleavedBufferAttribute?d=l[g]*o.data.stride+o.offset:d=l[g]*h;for(let p=0;p<h;p++)f[_++]=c[d++]}return new Vt(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new Mt,n=this.index.array,i=this.attributes;for(const o in i){const l=i[o],c=e(l,n);t.setAttribute(o,c)}const r=this.morphAttributes;for(const o in r){const l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){const f=c[h],d=e(f,n);l.push(d)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,l=a.length;o<l;o++){const c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const i={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,f=c.length;u<f;u++){const d=c[u];h.push(d.toJSON(e.data))}h.length>0&&(i[l]=h,r=!0)}r&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const i=e.attributes;for(const c in i){const h=i[c];this.setAttribute(c,h.clone(t))}const r=e.morphAttributes;for(const c in r){const h=[],u=r[c];for(let f=0,d=u.length;f<d;f++)h.push(u[f].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const a=e.groups;for(let c=0,h=a.length;c<h;c++){const u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}const o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Ph=new Ne,Wi=new Gs,ra=new Kn,Dh=new I,sa=new I,aa=new I,oa=new I,bo=new I,la=new I,Lh=new I,ca=new I;class We extends ct{constructor(e=new Mt,t=new ci){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const o=this.morphTargetInfluences;if(r&&o){la.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=o[l],u=r[l];h!==0&&(bo.fromBufferAttribute(u,e),a?la.addScaledVector(bo,h):la.addScaledVector(bo.sub(t),h))}t.add(la)}return t}raycast(e,t){const n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ra.copy(n.boundingSphere),ra.applyMatrix4(r),Wi.copy(e.ray).recast(e.near),!(ra.containsPoint(Wi.origin)===!1&&(Wi.intersectSphere(ra,Dh)===null||Wi.origin.distanceToSquared(Dh)>(e.far-e.near)**2))&&(Ph.copy(r).invert(),Wi.copy(e.ray).applyMatrix4(Ph),!(n.boundingBox!==null&&Wi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Wi)))}_computeIntersections(e,t,n){let i;const r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,d=r.drawRange;if(o!==null)if(Array.isArray(a))for(let _=0,g=f.length;_<g;_++){const m=f[_],p=a[m.materialIndex],M=Math.max(m.start,d.start),x=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let v=M,S=x;v<S;v+=3){const A=o.getX(v),w=o.getX(v+1),R=o.getX(v+2);i=ha(this,p,e,n,c,h,u,A,w,R),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{const _=Math.max(0,d.start),g=Math.min(o.count,d.start+d.count);for(let m=_,p=g;m<p;m+=3){const M=o.getX(m),x=o.getX(m+1),v=o.getX(m+2);i=ha(this,a,e,n,c,h,u,M,x,v),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}else if(l!==void 0)if(Array.isArray(a))for(let _=0,g=f.length;_<g;_++){const m=f[_],p=a[m.materialIndex],M=Math.max(m.start,d.start),x=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let v=M,S=x;v<S;v+=3){const A=v,w=v+1,R=v+2;i=ha(this,p,e,n,c,h,u,A,w,R),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{const _=Math.max(0,d.start),g=Math.min(l.count,d.start+d.count);for(let m=_,p=g;m<p;m+=3){const M=m,x=m+1,v=m+2;i=ha(this,a,e,n,c,h,u,M,x,v),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}}}function um(s,e,t,n,i,r,a,o){let l;if(e.side===Kt?l=n.intersectTriangle(a,r,i,!0,o):l=n.intersectTriangle(i,r,a,e.side===pi,o),l===null)return null;ca.copy(o),ca.applyMatrix4(s.matrixWorld);const c=t.ray.origin.distanceTo(ca);return c<t.near||c>t.far?null:{distance:c,point:ca.clone(),object:s}}function ha(s,e,t,n,i,r,a,o,l,c){s.getVertexPosition(o,sa),s.getVertexPosition(l,aa),s.getVertexPosition(c,oa);const h=um(s,e,t,n,sa,aa,oa,Lh);if(h){const u=new I;Un.getBarycoord(Lh,sa,aa,oa,u),i&&(h.uv=Un.getInterpolatedAttribute(i,o,l,c,u,new ue)),r&&(h.uv1=Un.getInterpolatedAttribute(r,o,l,c,u,new ue)),a&&(h.normal=Un.getInterpolatedAttribute(a,o,l,c,u,new I),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const f={a:o,b:l,c,normal:new I,materialIndex:0};Un.getNormal(sa,aa,oa,f.normal),h.face=f,h.barycoord=u}return h}class di extends Mt{constructor(e=1,t=1,n=1,i=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:r,depthSegments:a};const o=this;i=Math.floor(i),r=Math.floor(r),a=Math.floor(a);const l=[],c=[],h=[],u=[];let f=0,d=0;_("z","y","x",-1,-1,n,t,e,a,r,0),_("z","y","x",1,-1,n,t,-e,a,r,1),_("x","z","y",1,1,e,n,t,i,a,2),_("x","z","y",1,-1,e,n,-t,i,a,3),_("x","y","z",1,-1,e,t,n,i,r,4),_("x","y","z",-1,-1,e,t,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new Ye(c,3)),this.setAttribute("normal",new Ye(h,3)),this.setAttribute("uv",new Ye(u,2));function _(g,m,p,M,x,v,S,A,w,R,y){const b=v/w,P=S/R,D=v/2,N=S/2,k=A/2,z=w+1,W=R+1;let q=0,V=0;const ie=new I;for(let oe=0;oe<W;oe++){const ge=oe*P-N;for(let Le=0;Le<z;Le++){const et=Le*b-D;ie[g]=et*M,ie[m]=ge*x,ie[p]=k,c.push(ie.x,ie.y,ie.z),ie[g]=0,ie[m]=0,ie[p]=A>0?1:-1,h.push(ie.x,ie.y,ie.z),u.push(Le/w),u.push(1-oe/R),q+=1}}for(let oe=0;oe<R;oe++)for(let ge=0;ge<w;ge++){const Le=f+ge+z*oe,et=f+ge+z*(oe+1),Ke=f+(ge+1)+z*(oe+1),He=f+(ge+1)+z*oe;l.push(Le,et,He),l.push(et,Ke,He),V+=6}o.addGroup(d,V,y),d+=V,f+=q}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new di(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Wr(s){const e={};for(const t in s){e[t]={};for(const n in s[t]){const i=s[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function Yt(s){const e={};for(let t=0;t<s.length;t++){const n=Wr(s[t]);for(const i in n)e[i]=n[i]}return e}function fm(s){const e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function _f(s){const e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ze.workingColorSpace}const vf={clone:Wr,merge:Yt};var dm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,pm=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ut extends On{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=dm,this.fragmentShader=pm,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Wr(e.uniforms),this.uniformsGroups=fm(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const a=this.uniforms[i].value;a&&a.isTexture?t.uniforms[i]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[i]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[i]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[i]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[i]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[i]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[i]={type:"m4",value:a.toArray()}:t.uniforms[i]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class xf extends ct{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ne,this.projectionMatrix=new Ne,this.projectionMatrixInverse=new Ne,this.coordinateSystem=Wn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Ti=new I,Ih=new ue,Uh=new ue;class kt extends xf{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Gr*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Ms*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Gr*2*Math.atan(Math.tan(Ms*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Ti.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ti.x,Ti.y).multiplyScalar(-e/Ti.z),Ti.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ti.x,Ti.y).multiplyScalar(-e/Ti.z)}getViewSize(e,t){return this.getViewBounds(e,Ih,Uh),t.subVectors(Uh,Ih)}setViewOffset(e,t,n,i,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Ms*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i;const a=this.view;if(this.view!==null&&this.view.enabled){const l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*i/l,t-=a.offsetY*n/c,i*=a.width/l,n*=a.height/c}const o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Tr=-90,br=1;class mm extends ct{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new kt(Tr,br,e,t);i.layers=this.layers,this.add(i);const r=new kt(Tr,br,e,t);r.layers=this.layers,this.add(r);const a=new kt(Tr,br,e,t);a.layers=this.layers,this.add(a);const o=new kt(Tr,br,e,t);o.layers=this.layers,this.add(o);const l=new kt(Tr,br,e,t);l.layers=this.layers,this.add(l);const c=new kt(Tr,br,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,r,a,o,l]=t;for(const c of t)this.remove(c);if(e===Wn)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Ua)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,l,c,h]=this.children,u=e.getRenderTarget(),f=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),_=e.xr.enabled;e.xr.enabled=!1;const g=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,r),e.setRenderTarget(n,1,i),e.render(t,a),e.setRenderTarget(n,2,i),e.render(t,o),e.setRenderTarget(n,3,i),e.render(t,l),e.setRenderTarget(n,4,i),e.render(t,c),n.texture.generateMipmaps=g,e.setRenderTarget(n,5,i),e.render(t,h),e.setRenderTarget(u,f,d),e.xr.enabled=_,n.texture.needsPMREMUpdate=!0}}class yf extends At{constructor(e=[],t=Hr,n,i,r,a,o,l,c,h){super(e,t,n,i,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class gm extends qn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new yf(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new di(5,5,5),r=new Ut({name:"CubemapFromEquirect",uniforms:Wr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Kt,blending:Pi});r.uniforms.tEquirect.value=t;const a=new We(i,r),o=t.minFilter;return t.minFilter===li&&(t.minFilter=jt),new mm(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,i=!0){const r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,i);e.setRenderTarget(r)}}class Ht extends ct{constructor(){super(),this.isGroup=!0,this.type="Group"}}const _m={type:"move"};class Eo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ht,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ht,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ht,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,a=null;const o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(const g of e.hand.values()){const m=t.getJointPose(g,n),p=this._getHandJoint(c,g);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=h.position.distanceTo(u.position),d=.02,_=.005;c.inputState.pinching&&f>d+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=d-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(o.matrix.fromArray(i.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,i.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(i.linearVelocity)):o.hasLinearVelocity=!1,i.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(i.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(_m)))}return o!==null&&(o.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Ht;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class cr extends ct{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new rn,this.environmentIntensity=1,this.environmentRotation=new rn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class vm{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Ol,this.updateRanges=[],this.version=0,this.uuid=Fn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,r=this.stride;i<r;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Fn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Fn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Xt=new I;class Sc{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Xt.fromBufferAttribute(this,t),Xt.applyMatrix4(e),this.setXYZ(t,Xt.x,Xt.y,Xt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Xt.fromBufferAttribute(this,t),Xt.applyNormalMatrix(e),this.setXYZ(t,Xt.x,Xt.y,Xt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Xt.fromBufferAttribute(this,t),Xt.transformDirection(e),this.setXYZ(t,Xt.x,Xt.y,Xt.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=In(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=tt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=tt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=tt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=tt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=tt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=In(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=In(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=In(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=In(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array),i=tt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=tt(t,this.array),n=tt(n,this.array),i=tt(i,this.array),r=tt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return new Vt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Sc(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const Nh=new I,Fh=new qe,Oh=new qe,xm=new I,Bh=new Ne,ua=new I,wo=new Kn,kh=new Ne,Ao=new Gs;class Tc extends We{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=uh,this.bindMatrix=new Ne,this.bindMatrixInverse=new Ne,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new _i),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,ua),this.boundingBox.expandByPoint(ua)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Kn),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,ua),this.boundingSphere.expandByPoint(ua)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),wo.copy(this.boundingSphere),wo.applyMatrix4(i),e.ray.intersectsSphere(wo)!==!1&&(kh.copy(i).invert(),Ao.copy(e.ray).applyMatrix4(kh),!(this.boundingBox!==null&&Ao.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Ao)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new qe,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===uh?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===_p?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,i=this.geometry;Fh.fromBufferAttribute(i.attributes.skinIndex,e),Oh.fromBufferAttribute(i.attributes.skinWeight,e),Nh.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){const a=Oh.getComponent(r);if(a!==0){const o=Fh.getComponent(r);Bh.multiplyMatrices(n.bones[o].matrixWorld,n.boneInverses[o]),t.addScaledVector(xm.copy(Nh).applyMatrix4(Bh),a)}}return t.applyMatrix4(this.bindMatrixInverse)}}class qa extends ct{constructor(){super(),this.isBone=!0,this.type="Bone"}}class Mf extends At{constructor(e=null,t=1,n=1,i,r,a,o,l,c=$t,h=$t,u,f){super(null,a,o,l,c,h,i,r,u,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const zh=new Ne,ym=new Ne;class bc{constructor(e=[],t=[]){this.uuid=Fn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new Ne)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new Ne;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let r=0,a=e.length;r<a;r++){const o=e[r]?e[r].matrixWorld:ym;zh.multiplyMatrices(o,t[r]),zh.toArray(n,r*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new bc(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new Mf(t,e,e,nn,Nn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){const r=e.bones[n];let a=t[r];a===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),a=new qa),this.bones.push(a),this.boneInverses.push(new Ne().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let i=0,r=t.length;i<r;i++){const a=t[i];e.bones.push(a.uuid);const o=n[i];e.boneInverses.push(o.toArray())}return e}}class Bl extends Vt{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Er=new Ne,Hh=new Ne,fa=[],Vh=new _i,Mm=new Ne,hs=new We,us=new Kn;class Ya extends We{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Bl(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,Mm)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new _i),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Er),Vh.copy(e.boundingBox).applyMatrix4(Er),this.boundingBox.union(Vh)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Kn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Er),us.copy(e.boundingSphere).applyMatrix4(Er),this.boundingSphere.union(us)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=i[a+o]}raycast(e,t){const n=this.matrixWorld,i=this.count;if(hs.geometry=this.geometry,hs.material=this.material,hs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),us.copy(this.boundingSphere),us.applyMatrix4(n),e.ray.intersectsSphere(us)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,Er),Hh.multiplyMatrices(n,Er),hs.matrixWorld=Hh,hs.raycast(e,fa);for(let a=0,o=fa.length;a<o;a++){const l=fa[a];l.instanceId=r,l.object=this,t.push(l)}fa.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new Bl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new Mf(new Float32Array(i*this.count),i,this.count,pc,Nn));const r=this.morphTexture.source.data.data;let a=0;for(let c=0;c<n.length;c++)a+=n[c];const o=this.geometry.morphTargetsRelative?1:1-a,l=i*e;r[l]=o,r.set(n,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const Ro=new I,Sm=new I,Tm=new Be;class Ei{constructor(e=new I(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=Ro.subVectors(n,t).cross(Sm.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(Ro),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Tm.getNormalMatrix(e),i=this.coplanarPoint(Ro).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Xi=new Kn,bm=new ue(.5,.5),da=new I;class Ec{constructor(e=new Ei,t=new Ei,n=new Ei,i=new Ei,r=new Ei,a=new Ei){this.planes=[e,t,n,i,r,a]}set(e,t,n,i,r,a){const o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(i),o[4].copy(r),o[5].copy(a),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Wn,n=!1){const i=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],u=r[5],f=r[6],d=r[7],_=r[8],g=r[9],m=r[10],p=r[11],M=r[12],x=r[13],v=r[14],S=r[15];if(i[0].setComponents(c-a,d-h,p-_,S-M).normalize(),i[1].setComponents(c+a,d+h,p+_,S+M).normalize(),i[2].setComponents(c+o,d+u,p+g,S+x).normalize(),i[3].setComponents(c-o,d-u,p-g,S-x).normalize(),n)i[4].setComponents(l,f,m,v).normalize(),i[5].setComponents(c-l,d-f,p-m,S-v).normalize();else if(i[4].setComponents(c-l,d-f,p-m,S-v).normalize(),t===Wn)i[5].setComponents(c+l,d+f,p+m,S+v).normalize();else if(t===Ua)i[5].setComponents(l,f,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Xi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Xi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Xi)}intersectsSprite(e){Xi.center.set(0,0,0);const t=bm.distanceTo(e.center);return Xi.radius=.7071067811865476+t,Xi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Xi)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(da.x=i.normal.x>0?e.max.x:e.min.x,da.y=i.normal.y>0?e.max.y:e.min.y,da.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(da)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Sf extends On{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new me(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Na=new I,Fa=new I,Gh=new Ne,fs=new Gs,pa=new Kn,Co=new I,Wh=new I;class wc extends ct{constructor(e=new Mt,t=new Sf){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let i=1,r=t.count;i<r;i++)Na.fromBufferAttribute(t,i-1),Fa.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=Na.distanceTo(Fa);e.setAttribute("lineDistance",new Ye(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),pa.copy(n.boundingSphere),pa.applyMatrix4(i),pa.radius+=r,e.ray.intersectsSphere(pa)===!1)return;Gh.copy(i).invert(),fs.copy(e.ray).applyMatrix4(Gh);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=n.index,f=n.attributes.position;if(h!==null){const d=Math.max(0,a.start),_=Math.min(h.count,a.start+a.count);for(let g=d,m=_-1;g<m;g+=c){const p=h.getX(g),M=h.getX(g+1),x=ma(this,e,fs,l,p,M,g);x&&t.push(x)}if(this.isLineLoop){const g=h.getX(_-1),m=h.getX(d),p=ma(this,e,fs,l,g,m,_-1);p&&t.push(p)}}else{const d=Math.max(0,a.start),_=Math.min(f.count,a.start+a.count);for(let g=d,m=_-1;g<m;g+=c){const p=ma(this,e,fs,l,g,g+1,g);p&&t.push(p)}if(this.isLineLoop){const g=ma(this,e,fs,l,_-1,d,_-1);g&&t.push(g)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function ma(s,e,t,n,i,r,a){const o=s.geometry.attributes.position;if(Na.fromBufferAttribute(o,i),Fa.fromBufferAttribute(o,r),t.distanceSqToSegment(Na,Fa,Co,Wh)>n)return;Co.applyMatrix4(s.matrixWorld);const c=e.ray.origin.distanceTo(Co);if(!(c<e.near||c>e.far))return{distance:c,point:Wh.clone().applyMatrix4(s.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:s}}const Xh=new I,qh=new I;class Em extends wc{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let i=0,r=t.count;i<r;i+=2)Xh.fromBufferAttribute(t,i),qh.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Xh.distanceTo(qh);e.setAttribute("lineDistance",new Ye(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class wm extends wc{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class Tf extends On{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new me(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Yh=new Ne,kl=new Gs,ga=new Kn,_a=new I;class Am extends ct{constructor(e=new Mt,t=new Tf){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ga.copy(n.boundingSphere),ga.applyMatrix4(i),ga.radius+=r,e.ray.intersectsSphere(ga)===!1)return;Yh.copy(i).invert(),kl.copy(e.ray).applyMatrix4(Yh);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,u=n.attributes.position;if(c!==null){const f=Math.max(0,a.start),d=Math.min(c.count,a.start+a.count);for(let _=f,g=d;_<g;_++){const m=c.getX(_);_a.fromBufferAttribute(u,m),jh(_a,m,l,i,e,t,this)}}else{const f=Math.max(0,a.start),d=Math.min(u.count,a.start+a.count);for(let _=f,g=d;_<g;_++)_a.fromBufferAttribute(u,_),jh(_a,_,l,i,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=i.length;r<a;r++){const o=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function jh(s,e,t,n,i,r,a){const o=kl.distanceSqToPoint(s);if(o<t){const l=new I;kl.closestPointToPoint(s,l),l.applyMatrix4(n);const c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}class Ac extends At{constructor(e,t,n,i,r,a,o,l,c){super(e,t,n,i,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class bf extends At{constructor(e,t,n=lr,i,r,a,o=$t,l=$t,c,h=Cs,u=1){if(h!==Cs&&h!==Ps)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const f={width:e,height:t,depth:u};super(f,i,r,a,o,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new yc(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class Ef extends At{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Rc extends Mt{constructor(e=1,t=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);const r=[],a=[],o=[],l=[],c=new I,h=new ue;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let u=0,f=3;u<=t;u++,f+=3){const d=n+u/t*i;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[f]/e+1)/2,h.y=(a[f+1]/e+1)/2,l.push(h.x,h.y)}for(let u=1;u<=t;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new Ye(a,3)),this.setAttribute("normal",new Ye(o,3)),this.setAttribute("uv",new Ye(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Rc(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Cc extends Mt{constructor(e=1,t=1,n=1,i=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};const c=this;i=Math.floor(i),r=Math.floor(r);const h=[],u=[],f=[],d=[];let _=0;const g=[],m=n/2;let p=0;M(),a===!1&&(e>0&&x(!0),t>0&&x(!1)),this.setIndex(h),this.setAttribute("position",new Ye(u,3)),this.setAttribute("normal",new Ye(f,3)),this.setAttribute("uv",new Ye(d,2));function M(){const v=new I,S=new I;let A=0;const w=(t-e)/n;for(let R=0;R<=r;R++){const y=[],b=R/r,P=b*(t-e)+e;for(let D=0;D<=i;D++){const N=D/i,k=N*l+o,z=Math.sin(k),W=Math.cos(k);S.x=P*z,S.y=-b*n+m,S.z=P*W,u.push(S.x,S.y,S.z),v.set(z,w,W).normalize(),f.push(v.x,v.y,v.z),d.push(N,1-b),y.push(_++)}g.push(y)}for(let R=0;R<i;R++)for(let y=0;y<r;y++){const b=g[y][R],P=g[y+1][R],D=g[y+1][R+1],N=g[y][R+1];(e>0||y!==0)&&(h.push(b,P,N),A+=3),(t>0||y!==r-1)&&(h.push(P,D,N),A+=3)}c.addGroup(p,A,0),p+=A}function x(v){const S=_,A=new ue,w=new I;let R=0;const y=v===!0?e:t,b=v===!0?1:-1;for(let D=1;D<=i;D++)u.push(0,m*b,0),f.push(0,b,0),d.push(.5,.5),_++;const P=_;for(let D=0;D<=i;D++){const k=D/i*l+o,z=Math.cos(k),W=Math.sin(k);w.x=y*W,w.y=m*b,w.z=y*z,u.push(w.x,w.y,w.z),f.push(0,b,0),A.x=z*.5+.5,A.y=W*.5*b+.5,d.push(A.x,A.y),_++}for(let D=0;D<i;D++){const N=S+D,k=P+D;v===!0?h.push(k,k+1,N):h.push(k+1,k,N),R+=3}c.addGroup(p,R,v===!0?1:2),p+=R}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Cc(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class ja extends Mt{constructor(e=[new ue(0,-.5),new ue(.5,0),new ue(0,.5)],t=12,n=0,i=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:i},t=Math.floor(t),i=Ve(i,0,Math.PI*2);const r=[],a=[],o=[],l=[],c=[],h=1/t,u=new I,f=new ue,d=new I,_=new I,g=new I;let m=0,p=0;for(let M=0;M<=e.length-1;M++)switch(M){case 0:m=e[M+1].x-e[M].x,p=e[M+1].y-e[M].y,d.x=p*1,d.y=-m,d.z=p*0,g.copy(d),d.normalize(),l.push(d.x,d.y,d.z);break;case e.length-1:l.push(g.x,g.y,g.z);break;default:m=e[M+1].x-e[M].x,p=e[M+1].y-e[M].y,d.x=p*1,d.y=-m,d.z=p*0,_.copy(d),d.x+=g.x,d.y+=g.y,d.z+=g.z,d.normalize(),l.push(d.x,d.y,d.z),g.copy(_)}for(let M=0;M<=t;M++){const x=n+M*h*i,v=Math.sin(x),S=Math.cos(x);for(let A=0;A<=e.length-1;A++){u.x=e[A].x*v,u.y=e[A].y,u.z=e[A].x*S,a.push(u.x,u.y,u.z),f.x=M/t,f.y=A/(e.length-1),o.push(f.x,f.y);const w=l[3*A+0]*v,R=l[3*A+1],y=l[3*A+0]*S;c.push(w,R,y)}}for(let M=0;M<t;M++)for(let x=0;x<e.length-1;x++){const v=x+M*e.length,S=v,A=v+e.length,w=v+e.length+1,R=v+1;r.push(S,A,R),r.push(w,R,A)}this.setIndex(r),this.setAttribute("position",new Ye(a,3)),this.setAttribute("uv",new Ye(o,2)),this.setAttribute("normal",new Ye(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ja(e.points,e.segments,e.phiStart,e.phiLength)}}class Yn extends Mt{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(i),c=o+1,h=l+1,u=e/o,f=t/l,d=[],_=[],g=[],m=[];for(let p=0;p<h;p++){const M=p*f-a;for(let x=0;x<c;x++){const v=x*u-r;_.push(v,-M,0),g.push(0,0,1),m.push(x/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let M=0;M<o;M++){const x=M+c*p,v=M+c*(p+1),S=M+1+c*(p+1),A=M+1+c*p;d.push(x,v,A),d.push(v,S,A)}this.setIndex(d),this.setAttribute("position",new Ye(_,3)),this.setAttribute("normal",new Ye(g,3)),this.setAttribute("uv",new Ye(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Yn(e.width,e.height,e.widthSegments,e.heightSegments)}}class Pc extends Mt{constructor(e=1,t=32,n=16,i=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(a+o,Math.PI);let c=0;const h=[],u=new I,f=new I,d=[],_=[],g=[],m=[];for(let p=0;p<=n;p++){const M=[],x=p/n;let v=0;p===0&&a===0?v=.5/t:p===n&&l===Math.PI&&(v=-.5/t);for(let S=0;S<=t;S++){const A=S/t;u.x=-e*Math.cos(i+A*r)*Math.sin(a+x*o),u.y=e*Math.cos(a+x*o),u.z=e*Math.sin(i+A*r)*Math.sin(a+x*o),_.push(u.x,u.y,u.z),f.copy(u).normalize(),g.push(f.x,f.y,f.z),m.push(A+v,1-x),M.push(c++)}h.push(M)}for(let p=0;p<n;p++)for(let M=0;M<t;M++){const x=h[p][M+1],v=h[p][M],S=h[p+1][M],A=h[p+1][M+1];(p!==0||a>0)&&d.push(x,v,A),(p!==n-1||l<Math.PI)&&d.push(v,S,A)}this.setIndex(d),this.setAttribute("position",new Ye(_,3)),this.setAttribute("normal",new Ye(g,3)),this.setAttribute("uv",new Ye(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Pc(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class Dc extends Mt{constructor(e=1,t=.4,n=12,i=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:r},n=Math.floor(n),i=Math.floor(i);const a=[],o=[],l=[],c=[],h=new I,u=new I,f=new I;for(let d=0;d<=n;d++)for(let _=0;_<=i;_++){const g=_/i*r,m=d/n*Math.PI*2;u.x=(e+t*Math.cos(m))*Math.cos(g),u.y=(e+t*Math.cos(m))*Math.sin(g),u.z=t*Math.sin(m),o.push(u.x,u.y,u.z),h.x=e*Math.cos(g),h.y=e*Math.sin(g),f.subVectors(u,h).normalize(),l.push(f.x,f.y,f.z),c.push(_/i),c.push(d/n)}for(let d=1;d<=n;d++)for(let _=1;_<=i;_++){const g=(i+1)*d+_-1,m=(i+1)*(d-1)+_-1,p=(i+1)*(d-1)+_,M=(i+1)*d+_;a.push(g,m,M),a.push(m,p,M)}this.setIndex(a),this.setAttribute("position",new Ye(o,3)),this.setAttribute("normal",new Ye(l,3)),this.setAttribute("uv",new Ye(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Dc(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class Di extends On{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new me(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new me(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=vc,this.normalScale=new ue(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new rn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Jt extends Di{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ue(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Ve(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new me(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new me(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new me(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class Rm extends On{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new me(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new me(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=vc,this.normalScale=new ue(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new rn,this.combine=hc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Cm extends On{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=yp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Pm extends On{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function va(s,e){return!s||s.constructor===e?s:typeof e.BYTES_PER_ELEMENT=="number"?new e(s):Array.prototype.slice.call(s)}function Dm(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function Lm(s){function e(i,r){return s[i]-s[r]}const t=s.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function Kh(s,e,t){const n=s.length,i=new s.constructor(n);for(let r=0,a=0;a!==n;++r){const o=t[r]*e;for(let l=0;l!==e;++l)i[a++]=s[o+l]}return i}function wf(s,e,t,n){let i=1,r=s[0];for(;r!==void 0&&r[n]===void 0;)r=s[i++];if(r===void 0)return;let a=r[n];if(a!==void 0)if(Array.isArray(a))do a=r[n],a!==void 0&&(e.push(r.time),t.push(...a)),r=s[i++];while(r!==void 0);else if(a.toArray!==void 0)do a=r[n],a!==void 0&&(e.push(r.time),a.toArray(t,t.length)),r=s[i++];while(r!==void 0);else do a=r[n],a!==void 0&&(e.push(r.time),t.push(a)),r=s[i++];while(r!==void 0)}class Ws{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<i)){for(let o=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=i,i=t[++n],e<i)break e}a=t.length;break t}if(!(e>=r)){const o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){const o=n+a>>>1;e<t[o]?a=o:n=o+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let a=0;a!==i;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class Im extends Ws{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:fh,endingEnd:fh}}intervalChanged_(e,t,n){const i=this.parameterPositions;let r=e-2,a=e+1,o=i[r],l=i[a];if(o===void 0)switch(this.getSettings_().endingStart){case dh:r=e,o=2*t-n;break;case ph:r=i.length-2,o=t+i[r]-i[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case dh:a=e,l=2*n-t;break;case ph:a=1,l=n+i[1]-i[0];break;default:a=e-1,l=t}const c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,u=this._offsetNext,f=this._weightPrev,d=this._weightNext,_=(n-t)/(i-t),g=_*_,m=g*_,p=-f*m+2*f*g-f*_,M=(1+f)*m+(-1.5-2*f)*g+(-.5+f)*_+1,x=(-1-d)*m+(1.5+d)*g+.5*_,v=d*m-d*g;for(let S=0;S!==o;++S)r[S]=p*a[h+S]+M*a[c+S]+x*a[l+S]+v*a[u+S];return r}}class Um extends Ws{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(n-t)/(i-t),u=1-h;for(let f=0;f!==o;++f)r[f]=a[c+f]*u+a[l+f]*h;return r}}class Nm extends Ws{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class Bn{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=va(t,this.TimeBufferType),this.values=va(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:va(e.times,Array),values:va(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Nm(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Um(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Im(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Ds:t=this.InterpolantFactoryMethodDiscrete;break;case Ls:t=this.InterpolantFactoryMethodLinear;break;case io:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Ds;case this.InterpolantFactoryMethodLinear:return Ls;case this.InterpolantFactoryMethodSmooth:return io}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){const n=this.times,i=n.length;let r=0,a=i-1;for(;r!==i&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==i){r>=a&&(a=Math.max(a,1),r=a-1);const o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){const l=n[o];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(i!==void 0&&Dm(i))for(let o=0,l=i.length;o!==l;++o){const c=i[o];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===io,r=e.length-1;let a=1;for(let o=1;o<r;++o){let l=!1;const c=e[o],h=e[o+1];if(c!==h&&(o!==1||c!==e[0]))if(i)l=!0;else{const u=o*n,f=u-n,d=u+n;for(let _=0;_!==n;++_){const g=t[u+_];if(g!==t[f+_]||g!==t[d+_]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];const u=o*n,f=a*n;for(let d=0;d!==n;++d)t[f+d]=t[u+d]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}}Bn.prototype.ValueTypeName="";Bn.prototype.TimeBufferType=Float32Array;Bn.prototype.ValueBufferType=Float32Array;Bn.prototype.DefaultInterpolation=Ls;class es extends Bn{constructor(e,t,n){super(e,t,n)}}es.prototype.ValueTypeName="bool";es.prototype.ValueBufferType=Array;es.prototype.DefaultInterpolation=Ds;es.prototype.InterpolantFactoryMethodLinear=void 0;es.prototype.InterpolantFactoryMethodSmooth=void 0;class Af extends Bn{constructor(e,t,n,i){super(e,t,n,i)}}Af.prototype.ValueTypeName="color";class Xr extends Bn{constructor(e,t,n,i){super(e,t,n,i)}}Xr.prototype.ValueTypeName="number";class Fm extends Ws{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(i-t);let c=e*o;for(let h=c+o;c!==h;c+=4)Lt.slerpFlat(r,0,a,c-o,a,c,l);return r}}class qr extends Bn{constructor(e,t,n,i){super(e,t,n,i)}InterpolantFactoryMethodLinear(e){return new Fm(this.times,this.values,this.getValueSize(),e)}}qr.prototype.ValueTypeName="quaternion";qr.prototype.InterpolantFactoryMethodSmooth=void 0;class ts extends Bn{constructor(e,t,n){super(e,t,n)}}ts.prototype.ValueTypeName="string";ts.prototype.ValueBufferType=Array;ts.prototype.DefaultInterpolation=Ds;ts.prototype.InterpolantFactoryMethodLinear=void 0;ts.prototype.InterpolantFactoryMethodSmooth=void 0;class Yr extends Bn{constructor(e,t,n,i){super(e,t,n,i)}}Yr.prototype.ValueTypeName="vector";class Om{constructor(e="",t=-1,n=[],i=vp){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=Fn(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,i=1/(e.fps||1);for(let a=0,o=n.length;a!==o;++a)t.push(km(n[a]).scale(i));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){const t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,a=n.length;r!==a;++r)t.push(Bn.toJSON(n[r]));return i}static CreateFromMorphTargetSequence(e,t,n,i){const r=t.length,a=[];for(let o=0;o<r;o++){let l=[],c=[];l.push((o+r-1)%r,o,(o+1)%r),c.push(0,1,0);const h=Lm(l);l=Kh(l,1,h),c=Kh(c,1,h),!i&&l[0]===0&&(l.push(r),c.push(c[0])),a.push(new Xr(".morphTargetInfluences["+t[o].name+"]",l,c).scale(1/n))}return new this(e,-1,a)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const i={},r=/^([\w-]*?)([\d]+)$/;for(let o=0,l=e.length;o<l;o++){const c=e[o],h=c.name.match(r);if(h&&h.length>1){const u=h[1];let f=i[u];f||(i[u]=f=[]),f.push(c)}}const a=[];for(const o in i)a.push(this.CreateFromMorphTargetSequence(o,i[o],t,n));return a}static parseAnimation(e,t){if(console.warn("THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(u,f,d,_,g){if(d.length!==0){const m=[],p=[];wf(d,m,p,_),m.length!==0&&g.push(new u(f,m,p))}},i=[],r=e.name||"default",a=e.fps||30,o=e.blendMode;let l=e.length||-1;const c=e.hierarchy||[];for(let u=0;u<c.length;u++){const f=c[u].keys;if(!(!f||f.length===0))if(f[0].morphTargets){const d={};let _;for(_=0;_<f.length;_++)if(f[_].morphTargets)for(let g=0;g<f[_].morphTargets.length;g++)d[f[_].morphTargets[g]]=-1;for(const g in d){const m=[],p=[];for(let M=0;M!==f[_].morphTargets.length;++M){const x=f[_];m.push(x.time),p.push(x.morphTarget===g?1:0)}i.push(new Xr(".morphTargetInfluence["+g+"]",m,p))}l=d.length*a}else{const d=".bones["+t[u].name+"]";n(Yr,d+".position",f,"pos",i),n(qr,d+".quaternion",f,"rot",i),n(Yr,d+".scale",f,"scl",i)}}return i.length===0?null:new this(r,l,i,o)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,i=e.length;n!==i;++n){const r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());const t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}}function Bm(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Xr;case"vector":case"vector2":case"vector3":case"vector4":return Yr;case"color":return Af;case"quaternion":return qr;case"bool":case"boolean":return es;case"string":return ts}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function km(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=Bm(s.type);if(s.times===void 0){const t=[],n=[];wf(s.keys,t,n,"value"),s.times=t,s.values=n}return e.parse!==void 0?e.parse(s):new e(s.name,s.times,s.values,s.interpolation)}const hi={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(this.files[s]=e)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};class zm{constructor(e,t,n){const i=this;let r=!1,a=0,o=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(h){o++,r===!1&&i.onStart!==void 0&&i.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,i.onProgress!==void 0&&i.onProgress(h,a,o),a===o&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){const u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,f=c.length;u<f;u+=2){const d=c[u],_=c[u+1];if(d.global&&(d.lastIndex=0),d.test(h))return _}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}}const Hm=new zm;class ns{constructor(e){this.manager=e!==void 0?e:Hm,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}ns.DEFAULT_MATERIAL_NAME="__DEFAULT";const ni={};class Vm extends Error{constructor(e,t){super(e),this.response=t}}class Rf extends ns{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=hi.get(`file:${e}`);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(ni[e]!==void 0){ni[e].push({onLoad:t,onProgress:n,onError:i});return}ni[e]=[],ni[e].push({onLoad:t,onProgress:n,onError:i});const a=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),o=this.mimeType,l=this.responseType;fetch(a).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const h=ni[e],u=c.body.getReader(),f=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),d=f?parseInt(f):0,_=d!==0;let g=0;const m=new ReadableStream({start(p){M();function M(){u.read().then(({done:x,value:v})=>{if(x)p.close();else{g+=v.byteLength;const S=new ProgressEvent("progress",{lengthComputable:_,loaded:g,total:d});for(let A=0,w=h.length;A<w;A++){const R=h[A];R.onProgress&&R.onProgress(S)}p.enqueue(v),M()}},x=>{p.error(x)})}}});return new Response(m)}else throw new Vm(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,o));case"json":return c.json();default:if(o==="")return c.text();{const u=/charset="?([^;"\s]*)"?/i.exec(o),f=u&&u[1]?u[1].toLowerCase():void 0,d=new TextDecoder(f);return c.arrayBuffer().then(_=>d.decode(_))}}}).then(c=>{hi.add(`file:${e}`,c);const h=ni[e];delete ni[e];for(let u=0,f=h.length;u<f;u++){const d=h[u];d.onLoad&&d.onLoad(c)}}).catch(c=>{const h=ni[e];if(h===void 0)throw this.manager.itemError(e),c;delete ni[e];for(let u=0,f=h.length;u<f;u++){const d=h[u];d.onError&&d.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const wr=new WeakMap;class Gm extends ns{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,a=hi.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let u=wr.get(a);u===void 0&&(u=[],wr.set(a,u)),u.push({onLoad:t,onError:i})}return a}const o=Is("img");function l(){h(),t&&t(this);const u=wr.get(this)||[];for(let f=0;f<u.length;f++){const d=u[f];d.onLoad&&d.onLoad(this)}wr.delete(this),r.manager.itemEnd(e)}function c(u){h(),i&&i(u),hi.remove(`image:${e}`);const f=wr.get(this)||[];for(let d=0;d<f.length;d++){const _=f[d];_.onError&&_.onError(u)}wr.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),hi.add(`image:${e}`,o),r.manager.itemStart(e),o.src=e,o}}class Oa extends ns{constructor(e){super(e)}load(e,t,n,i){const r=new At,a=new Gm(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,i),r}}class Ka extends ct{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new me(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}const Po=new Ne,$h=new I,Zh=new I;class Lc{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ue(512,512),this.mapType=xn,this.map=null,this.mapPass=null,this.matrix=new Ne,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ec,this._frameExtents=new ue(1,1),this._viewportCount=1,this._viewports=[new qe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;$h.setFromMatrixPosition(e.matrixWorld),t.position.copy($h),Zh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Zh),t.updateMatrixWorld(),Po.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Po,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Po)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class Wm extends Lc{constructor(){super(new kt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,n=Gr*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||i!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=i,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class Xm extends Ka{constructor(e,t,n=0,i=Math.PI/3,r=0,a=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(ct.DEFAULT_UP),this.updateMatrix(),this.target=new ct,this.distance=n,this.angle=i,this.penumbra=r,this.decay=a,this.map=null,this.shadow=new Wm}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const Jh=new Ne,ds=new I,Do=new I;class qm extends Lc{constructor(){super(new kt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new ue(4,2),this._viewportCount=6,this._viewports=[new qe(2,1,1,1),new qe(0,1,1,1),new qe(3,1,1,1),new qe(1,1,1,1),new qe(3,0,1,1),new qe(1,0,1,1)],this._cubeDirections=[new I(1,0,0),new I(-1,0,0),new I(0,0,1),new I(0,0,-1),new I(0,1,0),new I(0,-1,0)],this._cubeUps=[new I(0,1,0),new I(0,1,0),new I(0,1,0),new I(0,1,0),new I(0,0,1),new I(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,i=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),ds.setFromMatrixPosition(e.matrixWorld),n.position.copy(ds),Do.copy(n.position),Do.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Do),n.updateMatrixWorld(),i.makeTranslation(-ds.x,-ds.y,-ds.z),Jh.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Jh,n.coordinateSystem,n.reversedDepth)}}class Cf extends Ka{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new qm}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class is extends xf{constructor(e=-1,t=1,n=1,i=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-e,a=n+e,o=i+t,l=i-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Ym extends Lc{constructor(){super(new is(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class ir extends Ka{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ct.DEFAULT_UP),this.updateMatrix(),this.target=new ct,this.shadow=new Ym}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class Ic extends Ka{constructor(e,t){super(e,t),this.isAmbientLight=!0,this.type="AmbientLight"}}class Ts{static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}const Lo=new WeakMap;class jm extends ns{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,a=hi.get(`image-bitmap:${e}`);if(a!==void 0){if(r.manager.itemStart(e),a.then){a.then(c=>{if(Lo.has(a)===!0)i&&i(Lo.get(a)),r.manager.itemError(e),r.manager.itemEnd(e);else return t&&t(c),r.manager.itemEnd(e),c});return}return setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0),a}const o={};o.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",o.headers=this.requestHeader,o.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;const l=fetch(e,o).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(c){return hi.add(`image-bitmap:${e}`,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){i&&i(c),Lo.set(l,c),hi.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});hi.add(`image-bitmap:${e}`,l),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class Km extends kt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}const Uc="\\[\\]\\.:\\/",$m=new RegExp("["+Uc+"]","g"),Nc="[^"+Uc+"]",Zm="[^"+Uc.replace("\\.","")+"]",Jm=/((?:WC+[\/:])*)/.source.replace("WC",Nc),Qm=/(WCOD+)?/.source.replace("WCOD",Zm),eg=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Nc),tg=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Nc),ng=new RegExp("^"+Jm+Qm+eg+tg+"$"),ig=["material","materials","bones","map"];class rg{constructor(e,t,n){const i=n||nt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class nt{constructor(e,t,n){this.path=t,this.parsedPath=n||nt.parseTrackName(t),this.node=nt.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new nt.Composite(e,t,n):new nt(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace($m,"")}static parseTrackName(e){const t=ng.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){const r=n.nodeName.substring(i+1);ig.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(r){for(let a=0;a<r.length;a++){const o=r[a];if(o.name===t||o.uuid===t)return o;const l=n(o.children);if(l)return l}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,i=t.propertyName;let r=t.propertyIndex;if(e||(e=nt.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}const a=e[i];if(a===void 0){const c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}nt.Composite=rg;nt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};nt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};nt.prototype.GetterByBindingType=[nt.prototype._getValue_direct,nt.prototype._getValue_array,nt.prototype._getValue_arrayElement,nt.prototype._getValue_toArray];nt.prototype.SetterByBindingTypeAndVersioning=[[nt.prototype._setValue_direct,nt.prototype._setValue_direct_setNeedsUpdate,nt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[nt.prototype._setValue_array,nt.prototype._setValue_array_setNeedsUpdate,nt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[nt.prototype._setValue_arrayElement,nt.prototype._setValue_arrayElement_setNeedsUpdate,nt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[nt.prototype._setValue_fromArray,nt.prototype._setValue_fromArray_setNeedsUpdate,nt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];const Qh=new Ne;class sg{constructor(e,t,n=0,i=1/0){this.ray=new Gs(e,t),this.near=n,this.far=i,this.camera=null,this.layers=new Mc,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Qh.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Qh),this}intersectObject(e,t=!0,n=[]){return zl(e,this,n,t),n.sort(eu),n}intersectObjects(e,t=!0,n=[]){for(let i=0,r=e.length;i<r;i++)zl(e[i],this,n,t);return n.sort(eu),n}}function eu(s,e){return s.distance-e.distance}function zl(s,e,t,n){let i=!0;if(s.layers.test(e.layers)&&s.raycast(e,t)===!1&&(i=!1),i===!0&&n===!0){const r=s.children;for(let a=0,o=r.length;a<o;a++)zl(r[a],e,t,!0)}}function tu(s,e,t,n){const i=ag(n);switch(t){case of:return s*e;case pc:return s*e/i.components*i.byteLength;case mc:return s*e/i.components*i.byteLength;case cf:return s*e*2/i.components*i.byteLength;case gc:return s*e*2/i.components*i.byteLength;case lf:return s*e*3/i.components*i.byteLength;case nn:return s*e*4/i.components*i.byteLength;case _c:return s*e*4/i.components*i.byteLength;case ba:case Ea:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case wa:case Aa:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case cl:case ul:return Math.max(s,16)*Math.max(e,8)/4;case ll:case hl:return Math.max(s,8)*Math.max(e,8)/2;case fl:case dl:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case pl:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case ml:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case gl:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case _l:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case vl:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case xl:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case yl:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case Ml:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case Sl:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case Tl:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case bl:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case El:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case wl:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case Al:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case Rl:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case Cl:case Pl:case Dl:return Math.ceil(s/4)*Math.ceil(e/4)*16;case Ll:case Il:return Math.ceil(s/4)*Math.ceil(e/4)*8;case Ul:case Nl:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function ag(s){switch(s){case xn:case nf:return{byteLength:1,components:1};case As:case rf:case Bi:return{byteLength:2,components:1};case fc:case dc:return{byteLength:2,components:4};case lr:case uc:case Nn:return{byteLength:4,components:1};case sf:case af:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:cc}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=cc);function Pf(){let s=null,e=!1,t=null,n=null;function i(r,a){t(r,a),n=s.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=s.requestAnimationFrame(i),e=!0)},stop:function(){s.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function og(s){const e=new WeakMap;function t(o,l){const c=o.array,h=o.usage,u=c.byteLength,f=s.createBuffer();s.bindBuffer(l,f),s.bufferData(l,c,h),o.onUploadCallback();let d;if(c instanceof Float32Array)d=s.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)d=s.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=s.HALF_FLOAT:d=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=s.SHORT;else if(c instanceof Uint32Array)d=s.UNSIGNED_INT;else if(c instanceof Int32Array)d=s.INT;else if(c instanceof Int8Array)d=s.BYTE;else if(c instanceof Uint8Array)d=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function n(o,l,c){const h=l.array,u=l.updateRanges;if(s.bindBuffer(c,o),u.length===0)s.bufferSubData(c,0,h);else{u.sort((d,_)=>d.start-_.start);let f=0;for(let d=1;d<u.length;d++){const _=u[f],g=u[d];g.start<=_.start+_.count+1?_.count=Math.max(_.count,g.start+g.count-_.start):(++f,u[f]=g)}u.length=f+1;for(let d=0,_=u.length;d<_;d++){const g=u[d];s.bufferSubData(c,g.start*h.BYTES_PER_ELEMENT,h,g.start,g.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const l=e.get(o);l&&(s.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:i,remove:r,update:a}}var lg=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,cg=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,hg=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,ug=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,fg=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,dg=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,pg=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,mg=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,gg=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,_g=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,vg=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,xg=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,yg=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Mg=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Sg=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Tg=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,bg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Eg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,wg=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Ag=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Rg=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Cg=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Pg=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Dg=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Lg=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Ig=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Ug=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Ng=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Fg=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Og=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Bg="gl_FragColor = linearToOutputTexel( gl_FragColor );",kg=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,zg=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Hg=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Vg=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Gg=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Wg=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Xg=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,qg=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Yg=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,jg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Kg=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,$g=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Zg=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Jg=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Qg=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,e_=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,t_=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,n_=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,i_=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,r_=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,s_=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,a_=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,o_=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,l_=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,c_=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,h_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,u_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,f_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,d_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,p_=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,m_=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,g_=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,__=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,v_=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,x_=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,y_=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,M_=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,S_=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,T_=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,b_=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,E_=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,w_=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,A_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,R_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,C_=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,P_=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,D_=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,L_=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,I_=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,U_=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,N_=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,F_=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,O_=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,B_=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,k_=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,z_=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,H_=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,V_=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,G_=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,W_=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,X_=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,q_=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Y_=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,j_=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,K_=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,$_=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Z_=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,J_=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Q_=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,e0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,t0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,n0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,i0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,r0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,s0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,a0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const o0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,l0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,c0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,h0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,u0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,f0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,d0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,p0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,m0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,g0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,_0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,v0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,x0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,y0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,M0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,S0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,T0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,b0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,E0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,w0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,A0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,R0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,C0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,P0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,D0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,L0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,I0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,U0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,N0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,F0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,O0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,B0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,k0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,z0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ze={alphahash_fragment:lg,alphahash_pars_fragment:cg,alphamap_fragment:hg,alphamap_pars_fragment:ug,alphatest_fragment:fg,alphatest_pars_fragment:dg,aomap_fragment:pg,aomap_pars_fragment:mg,batching_pars_vertex:gg,batching_vertex:_g,begin_vertex:vg,beginnormal_vertex:xg,bsdfs:yg,iridescence_fragment:Mg,bumpmap_pars_fragment:Sg,clipping_planes_fragment:Tg,clipping_planes_pars_fragment:bg,clipping_planes_pars_vertex:Eg,clipping_planes_vertex:wg,color_fragment:Ag,color_pars_fragment:Rg,color_pars_vertex:Cg,color_vertex:Pg,common:Dg,cube_uv_reflection_fragment:Lg,defaultnormal_vertex:Ig,displacementmap_pars_vertex:Ug,displacementmap_vertex:Ng,emissivemap_fragment:Fg,emissivemap_pars_fragment:Og,colorspace_fragment:Bg,colorspace_pars_fragment:kg,envmap_fragment:zg,envmap_common_pars_fragment:Hg,envmap_pars_fragment:Vg,envmap_pars_vertex:Gg,envmap_physical_pars_fragment:e_,envmap_vertex:Wg,fog_vertex:Xg,fog_pars_vertex:qg,fog_fragment:Yg,fog_pars_fragment:jg,gradientmap_pars_fragment:Kg,lightmap_pars_fragment:$g,lights_lambert_fragment:Zg,lights_lambert_pars_fragment:Jg,lights_pars_begin:Qg,lights_toon_fragment:t_,lights_toon_pars_fragment:n_,lights_phong_fragment:i_,lights_phong_pars_fragment:r_,lights_physical_fragment:s_,lights_physical_pars_fragment:a_,lights_fragment_begin:o_,lights_fragment_maps:l_,lights_fragment_end:c_,logdepthbuf_fragment:h_,logdepthbuf_pars_fragment:u_,logdepthbuf_pars_vertex:f_,logdepthbuf_vertex:d_,map_fragment:p_,map_pars_fragment:m_,map_particle_fragment:g_,map_particle_pars_fragment:__,metalnessmap_fragment:v_,metalnessmap_pars_fragment:x_,morphinstance_vertex:y_,morphcolor_vertex:M_,morphnormal_vertex:S_,morphtarget_pars_vertex:T_,morphtarget_vertex:b_,normal_fragment_begin:E_,normal_fragment_maps:w_,normal_pars_fragment:A_,normal_pars_vertex:R_,normal_vertex:C_,normalmap_pars_fragment:P_,clearcoat_normal_fragment_begin:D_,clearcoat_normal_fragment_maps:L_,clearcoat_pars_fragment:I_,iridescence_pars_fragment:U_,opaque_fragment:N_,packing:F_,premultiplied_alpha_fragment:O_,project_vertex:B_,dithering_fragment:k_,dithering_pars_fragment:z_,roughnessmap_fragment:H_,roughnessmap_pars_fragment:V_,shadowmap_pars_fragment:G_,shadowmap_pars_vertex:W_,shadowmap_vertex:X_,shadowmask_pars_fragment:q_,skinbase_vertex:Y_,skinning_pars_vertex:j_,skinning_vertex:K_,skinnormal_vertex:$_,specularmap_fragment:Z_,specularmap_pars_fragment:J_,tonemapping_fragment:Q_,tonemapping_pars_fragment:e0,transmission_fragment:t0,transmission_pars_fragment:n0,uv_pars_fragment:i0,uv_pars_vertex:r0,uv_vertex:s0,worldpos_vertex:a0,background_vert:o0,background_frag:l0,backgroundCube_vert:c0,backgroundCube_frag:h0,cube_vert:u0,cube_frag:f0,depth_vert:d0,depth_frag:p0,distanceRGBA_vert:m0,distanceRGBA_frag:g0,equirect_vert:_0,equirect_frag:v0,linedashed_vert:x0,linedashed_frag:y0,meshbasic_vert:M0,meshbasic_frag:S0,meshlambert_vert:T0,meshlambert_frag:b0,meshmatcap_vert:E0,meshmatcap_frag:w0,meshnormal_vert:A0,meshnormal_frag:R0,meshphong_vert:C0,meshphong_frag:P0,meshphysical_vert:D0,meshphysical_frag:L0,meshtoon_vert:I0,meshtoon_frag:U0,points_vert:N0,points_frag:F0,shadow_vert:O0,shadow_frag:B0,sprite_vert:k0,sprite_frag:z0},se={common:{diffuse:{value:new me(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Be}},envmap:{envMap:{value:null},envMapRotation:{value:new Be},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Be}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Be}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Be},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Be},normalScale:{value:new ue(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Be},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Be}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Be}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Be}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new me(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new me(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0},uvTransform:{value:new Be}},sprite:{diffuse:{value:new me(16777215)},opacity:{value:1},center:{value:new ue(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Be},alphaMap:{value:null},alphaMapTransform:{value:new Be},alphaTest:{value:0}}},Vn={basic:{uniforms:Yt([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.fog]),vertexShader:ze.meshbasic_vert,fragmentShader:ze.meshbasic_frag},lambert:{uniforms:Yt([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.fog,se.lights,{emissive:{value:new me(0)}}]),vertexShader:ze.meshlambert_vert,fragmentShader:ze.meshlambert_frag},phong:{uniforms:Yt([se.common,se.specularmap,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.fog,se.lights,{emissive:{value:new me(0)},specular:{value:new me(1118481)},shininess:{value:30}}]),vertexShader:ze.meshphong_vert,fragmentShader:ze.meshphong_frag},standard:{uniforms:Yt([se.common,se.envmap,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.roughnessmap,se.metalnessmap,se.fog,se.lights,{emissive:{value:new me(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag},toon:{uniforms:Yt([se.common,se.aomap,se.lightmap,se.emissivemap,se.bumpmap,se.normalmap,se.displacementmap,se.gradientmap,se.fog,se.lights,{emissive:{value:new me(0)}}]),vertexShader:ze.meshtoon_vert,fragmentShader:ze.meshtoon_frag},matcap:{uniforms:Yt([se.common,se.bumpmap,se.normalmap,se.displacementmap,se.fog,{matcap:{value:null}}]),vertexShader:ze.meshmatcap_vert,fragmentShader:ze.meshmatcap_frag},points:{uniforms:Yt([se.points,se.fog]),vertexShader:ze.points_vert,fragmentShader:ze.points_frag},dashed:{uniforms:Yt([se.common,se.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ze.linedashed_vert,fragmentShader:ze.linedashed_frag},depth:{uniforms:Yt([se.common,se.displacementmap]),vertexShader:ze.depth_vert,fragmentShader:ze.depth_frag},normal:{uniforms:Yt([se.common,se.bumpmap,se.normalmap,se.displacementmap,{opacity:{value:1}}]),vertexShader:ze.meshnormal_vert,fragmentShader:ze.meshnormal_frag},sprite:{uniforms:Yt([se.sprite,se.fog]),vertexShader:ze.sprite_vert,fragmentShader:ze.sprite_frag},background:{uniforms:{uvTransform:{value:new Be},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ze.background_vert,fragmentShader:ze.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Be}},vertexShader:ze.backgroundCube_vert,fragmentShader:ze.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ze.cube_vert,fragmentShader:ze.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ze.equirect_vert,fragmentShader:ze.equirect_frag},distanceRGBA:{uniforms:Yt([se.common,se.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ze.distanceRGBA_vert,fragmentShader:ze.distanceRGBA_frag},shadow:{uniforms:Yt([se.lights,se.fog,{color:{value:new me(0)},opacity:{value:1}}]),vertexShader:ze.shadow_vert,fragmentShader:ze.shadow_frag}};Vn.physical={uniforms:Yt([Vn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Be},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Be},clearcoatNormalScale:{value:new ue(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Be},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Be},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Be},sheen:{value:0},sheenColor:{value:new me(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Be},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Be},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Be},transmissionSamplerSize:{value:new ue},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Be},attenuationDistance:{value:0},attenuationColor:{value:new me(0)},specularColor:{value:new me(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Be},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Be},anisotropyVector:{value:new ue},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Be}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag};const xa={r:0,b:0,g:0},qi=new rn,H0=new Ne;function V0(s,e,t,n,i,r,a){const o=new me(0);let l=r===!0?0:1,c,h,u=null,f=0,d=null;function _(x){let v=x.isScene===!0?x.background:null;return v&&v.isTexture&&(v=(x.backgroundBlurriness>0?t:e).get(v)),v}function g(x){let v=!1;const S=_(x);S===null?p(o,l):S&&S.isColor&&(p(S,1),v=!0);const A=s.xr.getEnvironmentBlendMode();A==="additive"?n.buffers.color.setClear(0,0,0,1,a):A==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(s.autoClear||v)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function m(x,v){const S=_(v);S&&(S.isCubeTexture||S.mapping===Xa)?(h===void 0&&(h=new We(new di(1,1,1),new Ut({name:"BackgroundCubeMaterial",uniforms:Wr(Vn.backgroundCube.uniforms),vertexShader:Vn.backgroundCube.vertexShader,fragmentShader:Vn.backgroundCube.fragmentShader,side:Kt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(A,w,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),qi.copy(v.backgroundRotation),qi.x*=-1,qi.y*=-1,qi.z*=-1,S.isCubeTexture&&S.isRenderTargetTexture===!1&&(qi.y*=-1,qi.z*=-1),h.material.uniforms.envMap.value=S,h.material.uniforms.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(H0.makeRotationFromEuler(qi)),h.material.toneMapped=Ze.getTransfer(S.colorSpace)!==rt,(u!==S||f!==S.version||d!==s.toneMapping)&&(h.material.needsUpdate=!0,u=S,f=S.version,d=s.toneMapping),h.layers.enableAll(),x.unshift(h,h.geometry,h.material,0,0,null)):S&&S.isTexture&&(c===void 0&&(c=new We(new Yn(2,2),new Ut({name:"BackgroundMaterial",uniforms:Wr(Vn.background.uniforms),vertexShader:Vn.background.vertexShader,fragmentShader:Vn.background.fragmentShader,side:pi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=S,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.toneMapped=Ze.getTransfer(S.colorSpace)!==rt,S.matrixAutoUpdate===!0&&S.updateMatrix(),c.material.uniforms.uvTransform.value.copy(S.matrix),(u!==S||f!==S.version||d!==s.toneMapping)&&(c.material.needsUpdate=!0,u=S,f=S.version,d=s.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null))}function p(x,v){x.getRGB(xa,_f(s)),n.buffers.color.setClear(xa.r,xa.g,xa.b,v,a)}function M(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(x,v=1){o.set(x),l=v,p(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(x){l=x,p(o,l)},render:g,addToRenderList:m,dispose:M}}function G0(s,e){const t=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=f(null);let r=i,a=!1;function o(b,P,D,N,k){let z=!1;const W=u(N,D,P);r!==W&&(r=W,c(r.object)),z=d(b,N,D,k),z&&_(b,N,D,k),k!==null&&e.update(k,s.ELEMENT_ARRAY_BUFFER),(z||a)&&(a=!1,v(b,P,D,N),k!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(k).buffer))}function l(){return s.createVertexArray()}function c(b){return s.bindVertexArray(b)}function h(b){return s.deleteVertexArray(b)}function u(b,P,D){const N=D.wireframe===!0;let k=n[b.id];k===void 0&&(k={},n[b.id]=k);let z=k[P.id];z===void 0&&(z={},k[P.id]=z);let W=z[N];return W===void 0&&(W=f(l()),z[N]=W),W}function f(b){const P=[],D=[],N=[];for(let k=0;k<t;k++)P[k]=0,D[k]=0,N[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:D,attributeDivisors:N,object:b,attributes:{},index:null}}function d(b,P,D,N){const k=r.attributes,z=P.attributes;let W=0;const q=D.getAttributes();for(const V in q)if(q[V].location>=0){const oe=k[V];let ge=z[V];if(ge===void 0&&(V==="instanceMatrix"&&b.instanceMatrix&&(ge=b.instanceMatrix),V==="instanceColor"&&b.instanceColor&&(ge=b.instanceColor)),oe===void 0||oe.attribute!==ge||ge&&oe.data!==ge.data)return!0;W++}return r.attributesNum!==W||r.index!==N}function _(b,P,D,N){const k={},z=P.attributes;let W=0;const q=D.getAttributes();for(const V in q)if(q[V].location>=0){let oe=z[V];oe===void 0&&(V==="instanceMatrix"&&b.instanceMatrix&&(oe=b.instanceMatrix),V==="instanceColor"&&b.instanceColor&&(oe=b.instanceColor));const ge={};ge.attribute=oe,oe&&oe.data&&(ge.data=oe.data),k[V]=ge,W++}r.attributes=k,r.attributesNum=W,r.index=N}function g(){const b=r.newAttributes;for(let P=0,D=b.length;P<D;P++)b[P]=0}function m(b){p(b,0)}function p(b,P){const D=r.newAttributes,N=r.enabledAttributes,k=r.attributeDivisors;D[b]=1,N[b]===0&&(s.enableVertexAttribArray(b),N[b]=1),k[b]!==P&&(s.vertexAttribDivisor(b,P),k[b]=P)}function M(){const b=r.newAttributes,P=r.enabledAttributes;for(let D=0,N=P.length;D<N;D++)P[D]!==b[D]&&(s.disableVertexAttribArray(D),P[D]=0)}function x(b,P,D,N,k,z,W){W===!0?s.vertexAttribIPointer(b,P,D,k,z):s.vertexAttribPointer(b,P,D,N,k,z)}function v(b,P,D,N){g();const k=N.attributes,z=D.getAttributes(),W=P.defaultAttributeValues;for(const q in z){const V=z[q];if(V.location>=0){let ie=k[q];if(ie===void 0&&(q==="instanceMatrix"&&b.instanceMatrix&&(ie=b.instanceMatrix),q==="instanceColor"&&b.instanceColor&&(ie=b.instanceColor)),ie!==void 0){const oe=ie.normalized,ge=ie.itemSize,Le=e.get(ie);if(Le===void 0)continue;const et=Le.buffer,Ke=Le.type,He=Le.bytesPerElement,j=Ke===s.INT||Ke===s.UNSIGNED_INT||ie.gpuType===uc;if(ie.isInterleavedBufferAttribute){const Z=ie.data,de=Z.stride,Ie=ie.offset;if(Z.isInstancedInterleavedBuffer){for(let be=0;be<V.locationSize;be++)p(V.location+be,Z.meshPerAttribute);b.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=Z.meshPerAttribute*Z.count)}else for(let be=0;be<V.locationSize;be++)m(V.location+be);s.bindBuffer(s.ARRAY_BUFFER,et);for(let be=0;be<V.locationSize;be++)x(V.location+be,ge/V.locationSize,Ke,oe,de*He,(Ie+ge/V.locationSize*be)*He,j)}else{if(ie.isInstancedBufferAttribute){for(let Z=0;Z<V.locationSize;Z++)p(V.location+Z,ie.meshPerAttribute);b.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=ie.meshPerAttribute*ie.count)}else for(let Z=0;Z<V.locationSize;Z++)m(V.location+Z);s.bindBuffer(s.ARRAY_BUFFER,et);for(let Z=0;Z<V.locationSize;Z++)x(V.location+Z,ge/V.locationSize,Ke,oe,ge*He,ge/V.locationSize*Z*He,j)}}else if(W!==void 0){const oe=W[q];if(oe!==void 0)switch(oe.length){case 2:s.vertexAttrib2fv(V.location,oe);break;case 3:s.vertexAttrib3fv(V.location,oe);break;case 4:s.vertexAttrib4fv(V.location,oe);break;default:s.vertexAttrib1fv(V.location,oe)}}}}M()}function S(){R();for(const b in n){const P=n[b];for(const D in P){const N=P[D];for(const k in N)h(N[k].object),delete N[k];delete P[D]}delete n[b]}}function A(b){if(n[b.id]===void 0)return;const P=n[b.id];for(const D in P){const N=P[D];for(const k in N)h(N[k].object),delete N[k];delete P[D]}delete n[b.id]}function w(b){for(const P in n){const D=n[P];if(D[b.id]===void 0)continue;const N=D[b.id];for(const k in N)h(N[k].object),delete N[k];delete D[b.id]}}function R(){y(),a=!0,r!==i&&(r=i,c(r.object))}function y(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:o,reset:R,resetDefaultState:y,dispose:S,releaseStatesOfGeometry:A,releaseStatesOfProgram:w,initAttributes:g,enableAttribute:m,disableUnusedAttributes:M}}function W0(s,e,t){let n;function i(c){n=c}function r(c,h){s.drawArrays(n,c,h),t.update(h,n,1)}function a(c,h,u){u!==0&&(s.drawArraysInstanced(n,c,h,u),t.update(h,n,u))}function o(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let d=0;for(let _=0;_<u;_++)d+=h[_];t.update(d,n,1)}function l(c,h,u,f){if(u===0)return;const d=e.get("WEBGL_multi_draw");if(d===null)for(let _=0;_<c.length;_++)a(c[_],h[_],f[_]);else{d.multiDrawArraysInstancedWEBGL(n,c,0,h,0,f,0,u);let _=0;for(let g=0;g<u;g++)_+=h[g]*f[g];t.update(_,n,1)}}this.setMode=i,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function X0(s,e,t,n){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const w=e.get("EXT_texture_filter_anisotropic");i=s.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function a(w){return!(w!==nn&&n.convert(w)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(w){const R=w===Bi&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(w!==xn&&n.convert(w)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==Nn&&!R)}function l(w){if(w==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),d=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),_=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_TEXTURE_SIZE),m=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),p=s.getParameter(s.MAX_VERTEX_ATTRIBS),M=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),x=s.getParameter(s.MAX_VARYING_VECTORS),v=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),S=_>0,A=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:f,maxTextures:d,maxVertexTextures:_,maxTextureSize:g,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:M,maxVaryings:x,maxFragmentUniforms:v,vertexTextures:S,maxSamples:A}}function q0(s){const e=this;let t=null,n=0,i=!1,r=!1;const a=new Ei,o=new Be,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){const d=u.length!==0||f||n!==0||i;return i=f,n=u.length,d},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){t=h(u,f,0)},this.setState=function(u,f,d){const _=u.clippingPlanes,g=u.clipIntersection,m=u.clipShadows,p=s.get(u);if(!i||_===null||_.length===0||r&&!m)r?h(null):c();else{const M=r?0:n,x=M*4;let v=p.clippingState||null;l.value=v,v=h(_,f,x,d);for(let S=0;S!==x;++S)v[S]=t[S];p.clippingState=v,this.numIntersection=g?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,f,d,_){const g=u!==null?u.length:0;let m=null;if(g!==0){if(m=l.value,_!==!0||m===null){const p=d+g*4,M=f.matrixWorldInverse;o.getNormalMatrix(M),(m===null||m.length<p)&&(m=new Float32Array(p));for(let x=0,v=d;x!==g;++x,v+=4)a.copy(u[x]).applyMatrix4(M,o),a.normal.toArray(m,v),m[v+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=g,e.numIntersection=0,m}}function Y0(s){let e=new WeakMap;function t(a,o){return o===al?a.mapping=Hr:o===ol&&(a.mapping=Vr),a}function n(a){if(a&&a.isTexture){const o=a.mapping;if(o===al||o===ol)if(e.has(a)){const l=e.get(a).texture;return t(l,a.mapping)}else{const l=a.image;if(l&&l.height>0){const c=new gm(l.height);return c.fromEquirectangularTexture(s,a),e.set(a,c),a.addEventListener("dispose",i),t(c.texture,a.mapping)}else return null}}return a}function i(a){const o=a.target;o.removeEventListener("dispose",i);const l=e.get(o);l!==void 0&&(e.delete(o),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}const Pr=4,nu=[.125,.215,.35,.446,.526,.582],tr=20,Io=new is,iu=new me;let Uo=null,No=0,Fo=0,Oo=!1;const Ji=(1+Math.sqrt(5))/2,Ar=1/Ji,ru=[new I(-Ji,Ar,0),new I(Ji,Ar,0),new I(-Ar,0,Ji),new I(Ar,0,Ji),new I(0,Ji,-Ar),new I(0,Ji,Ar),new I(-1,1,-1),new I(1,1,-1),new I(-1,1,1),new I(1,1,1)],j0=new I;class Hl{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100,r={}){const{size:a=256,position:o=j0}=r;Uo=this._renderer.getRenderTarget(),No=this._renderer.getActiveCubeFace(),Fo=this._renderer.getActiveMipmapLevel(),Oo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,i,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ou(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=au(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Uo,No,Fo),this._renderer.xr.enabled=Oo,e.scissorTest=!1,ya(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Hr||e.mapping===Vr?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Uo=this._renderer.getRenderTarget(),No=this._renderer.getActiveCubeFace(),Fo=this._renderer.getActiveMipmapLevel(),Oo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:jt,minFilter:jt,generateMipmaps:!1,type:Bi,format:nn,colorSpace:Zt,depthBuffer:!1},i=su(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=su(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=K0(r)),this._blurMaterial=$0(r,e,t)}return i}_compileMaterial(e){const t=new We(this._lodPlanes[0],e);this._renderer.compile(t,Io)}_sceneToCubeUV(e,t,n,i,r){const l=new kt(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,f=u.autoClear,d=u.toneMapping;u.getClearColor(iu),u.toneMapping=ui,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(i),u.clearDepth(),u.setRenderTarget(null));const g=new ci({name:"PMREM.Background",side:Kt,depthWrite:!1,depthTest:!1}),m=new We(new di,g);let p=!1;const M=e.background;M?M.isColor&&(g.color.copy(M),e.background=null,p=!0):(g.color.copy(iu),p=!0);for(let x=0;x<6;x++){const v=x%3;v===0?(l.up.set(0,c[x],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[x],r.y,r.z)):v===1?(l.up.set(0,0,c[x]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[x],r.z)):(l.up.set(0,c[x],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[x]));const S=this._cubeSize;ya(i,v*S,x>2?S:0,S,S),u.setRenderTarget(i),p&&u.render(m,l),u.render(e,l)}m.geometry.dispose(),m.material.dispose(),u.toneMapping=d,u.autoClear=f,e.background=M}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===Hr||e.mapping===Vr;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=ou()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=au());const r=i?this._cubemapMaterial:this._equirectMaterial,a=new We(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=e;const l=this._cubeSize;ya(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,Io)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const i=this._lodPlanes.length;for(let r=1;r<i;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=ru[(i-r-1)%ru.length];this._blur(e,r-1,r,a,o)}t.autoClear=n}_blur(e,t,n,i,r){const a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,i,"latitudinal",r),this._halfBlur(a,e,n,n,i,"longitudinal",r)}_halfBlur(e,t,n,i,r,a,o){const l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new We(this._lodPlanes[i],c),f=c.uniforms,d=this._sizeLods[n]-1,_=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*tr-1),g=r/_,m=isFinite(r)?1+Math.floor(h*g):tr;m>tr&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${tr}`);const p=[];let M=0;for(let w=0;w<tr;++w){const R=w/g,y=Math.exp(-R*R/2);p.push(y),w===0?M+=y:w<m&&(M+=2*y)}for(let w=0;w<p.length;w++)p[w]=p[w]/M;f.envMap.value=e.texture,f.samples.value=m,f.weights.value=p,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:x}=this;f.dTheta.value=_,f.mipInt.value=x-n;const v=this._sizeLods[i],S=3*v*(i>x-Pr?i-x+Pr:0),A=4*(this._cubeSize-v);ya(t,S,A,3*v,2*v),l.setRenderTarget(t),l.render(u,Io)}}function K0(s){const e=[],t=[],n=[];let i=s;const r=s-Pr+1+nu.length;for(let a=0;a<r;a++){const o=Math.pow(2,i);t.push(o);let l=1/o;a>s-Pr?l=nu[a-s+Pr-1]:a===0&&(l=0),n.push(l);const c=1/(o-2),h=-c,u=1+c,f=[h,h,u,h,u,u,h,h,u,u,h,u],d=6,_=6,g=3,m=2,p=1,M=new Float32Array(g*_*d),x=new Float32Array(m*_*d),v=new Float32Array(p*_*d);for(let A=0;A<d;A++){const w=A%3*2/3-1,R=A>2?0:-1,y=[w,R,0,w+2/3,R,0,w+2/3,R+1,0,w,R,0,w+2/3,R+1,0,w,R+1,0];M.set(y,g*_*A),x.set(f,m*_*A);const b=[A,A,A,A,A,A];v.set(b,p*_*A)}const S=new Mt;S.setAttribute("position",new Vt(M,g)),S.setAttribute("uv",new Vt(x,m)),S.setAttribute("faceIndex",new Vt(v,p)),e.push(S),i>Pr&&i--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function su(s,e,t){const n=new qn(s,e,t);return n.texture.mapping=Xa,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ya(s,e,t,n,i){s.viewport.set(e,t,n,i),s.scissor.set(e,t,n,i)}function $0(s,e,t){const n=new Float32Array(tr),i=new I(0,1,0);return new Ut({name:"SphericalGaussianBlur",defines:{n:tr,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Fc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Pi,depthTest:!1,depthWrite:!1})}function au(){return new Ut({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Fc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Pi,depthTest:!1,depthWrite:!1})}function ou(){return new Ut({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Fc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Pi,depthTest:!1,depthWrite:!1})}function Fc(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Z0(s){let e=new WeakMap,t=null;function n(o){if(o&&o.isTexture){const l=o.mapping,c=l===al||l===ol,h=l===Hr||l===Vr;if(c||h){let u=e.get(o);const f=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return t===null&&(t=new Hl(s)),u=c?t.fromEquirectangular(o,u):t.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),u.texture;if(u!==void 0)return u.texture;{const d=o.image;return c&&d&&d.height>0||h&&d&&i(d)?(t===null&&(t=new Hl(s)),u=c?t.fromEquirectangular(o):t.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,e.set(o,u),o.addEventListener("dispose",r),u.texture):null}}}return o}function i(o){let l=0;const c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function r(o){const l=o.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function a(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:a}}function J0(s){const e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=s.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const i=t(n);return i===null&&Us("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function Q0(s,e,t,n){const i={},r=new WeakMap;function a(u){const f=u.target;f.index!==null&&e.remove(f.index);for(const _ in f.attributes)e.remove(f.attributes[_]);f.removeEventListener("dispose",a),delete i[f.id];const d=r.get(f);d&&(e.remove(d),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function o(u,f){return i[f.id]===!0||(f.addEventListener("dispose",a),i[f.id]=!0,t.memory.geometries++),f}function l(u){const f=u.attributes;for(const d in f)e.update(f[d],s.ARRAY_BUFFER)}function c(u){const f=[],d=u.index,_=u.attributes.position;let g=0;if(d!==null){const M=d.array;g=d.version;for(let x=0,v=M.length;x<v;x+=3){const S=M[x+0],A=M[x+1],w=M[x+2];f.push(S,A,A,w,w,S)}}else if(_!==void 0){const M=_.array;g=_.version;for(let x=0,v=M.length/3-1;x<v;x+=3){const S=x+0,A=x+1,w=x+2;f.push(S,A,A,w,w,S)}}else return;const m=new(ff(f)?gf:mf)(f,1);m.version=g;const p=r.get(u);p&&e.remove(p),r.set(u,m)}function h(u){const f=r.get(u);if(f){const d=u.index;d!==null&&f.version<d.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function ev(s,e,t){let n;function i(f){n=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function l(f,d){s.drawElements(n,d,r,f*a),t.update(d,n,1)}function c(f,d,_){_!==0&&(s.drawElementsInstanced(n,d,r,f*a,_),t.update(d,n,_))}function h(f,d,_){if(_===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,f,0,_);let m=0;for(let p=0;p<_;p++)m+=d[p];t.update(m,n,1)}function u(f,d,_,g){if(_===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<f.length;p++)c(f[p]/a,d[p],g[p]);else{m.multiDrawElementsInstancedWEBGL(n,d,0,r,f,0,g,0,_);let p=0;for(let M=0;M<_;M++)p+=d[M]*g[M];t.update(p,n,1)}}this.setMode=i,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function tv(s){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case s.TRIANGLES:t.triangles+=o*(r/3);break;case s.LINES:t.lines+=o*(r/2);break;case s.LINE_STRIP:t.lines+=o*(r-1);break;case s.LINE_LOOP:t.lines+=o*r;break;case s.POINTS:t.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function nv(s,e,t){const n=new WeakMap,i=new qe;function r(a,o,l){const c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let f=n.get(o);if(f===void 0||f.count!==u){let b=function(){R.dispose(),n.delete(o),o.removeEventListener("dispose",b)};var d=b;f!==void 0&&f.texture.dispose();const _=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,p=o.morphAttributes.position||[],M=o.morphAttributes.normal||[],x=o.morphAttributes.color||[];let v=0;_===!0&&(v=1),g===!0&&(v=2),m===!0&&(v=3);let S=o.attributes.position.count*v,A=1;S>e.maxTextureSize&&(A=Math.ceil(S/e.maxTextureSize),S=e.maxTextureSize);const w=new Float32Array(S*A*4*u),R=new df(w,S,A,u);R.type=Nn,R.needsUpdate=!0;const y=v*4;for(let P=0;P<u;P++){const D=p[P],N=M[P],k=x[P],z=S*A*4*P;for(let W=0;W<D.count;W++){const q=W*y;_===!0&&(i.fromBufferAttribute(D,W),w[z+q+0]=i.x,w[z+q+1]=i.y,w[z+q+2]=i.z,w[z+q+3]=0),g===!0&&(i.fromBufferAttribute(N,W),w[z+q+4]=i.x,w[z+q+5]=i.y,w[z+q+6]=i.z,w[z+q+7]=0),m===!0&&(i.fromBufferAttribute(k,W),w[z+q+8]=i.x,w[z+q+9]=i.y,w[z+q+10]=i.z,w[z+q+11]=k.itemSize===4?i.w:1)}}f={count:u,texture:R,size:new ue(S,A)},n.set(o,f),o.addEventListener("dispose",b)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",a.morphTexture,t);else{let _=0;for(let m=0;m<c.length;m++)_+=c[m];const g=o.morphTargetsRelative?1:1-_;l.getUniforms().setValue(s,"morphTargetBaseInfluence",g),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",f.texture,t),l.getUniforms().setValue(s,"morphTargetsTextureSize",f.size)}return{update:r}}function iv(s,e,t,n){let i=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=e.get(l,h);if(i.get(u)!==c&&(e.update(u),i.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),i.get(l)!==c&&(t.update(l.instanceMatrix,s.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,s.ARRAY_BUFFER),i.set(l,c))),l.isSkinnedMesh){const f=l.skeleton;i.get(f)!==c&&(f.update(),i.set(f,c))}return u}function a(){i=new WeakMap}function o(l){const c=l.target;c.removeEventListener("dispose",o),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:a}}const Df=new At,lu=new bf(1,1),Lf=new df,If=new em,Uf=new yf,cu=[],hu=[],uu=new Float32Array(16),fu=new Float32Array(9),du=new Float32Array(4);function rs(s,e,t){const n=s[0];if(n<=0||n>0)return s;const i=e*t;let r=cu[i];if(r===void 0&&(r=new Float32Array(i),cu[i]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,s[a].toArray(r,o)}return r}function Rt(s,e){if(s.length!==e.length)return!1;for(let t=0,n=s.length;t<n;t++)if(s[t]!==e[t])return!1;return!0}function Ct(s,e){for(let t=0,n=e.length;t<n;t++)s[t]=e[t]}function $a(s,e){let t=hu[e];t===void 0&&(t=new Int32Array(e),hu[e]=t);for(let n=0;n!==e;++n)t[n]=s.allocateTextureUnit();return t}function rv(s,e){const t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function sv(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Rt(t,e))return;s.uniform2fv(this.addr,e),Ct(t,e)}}function av(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Rt(t,e))return;s.uniform3fv(this.addr,e),Ct(t,e)}}function ov(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Rt(t,e))return;s.uniform4fv(this.addr,e),Ct(t,e)}}function lv(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Rt(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),Ct(t,e)}else{if(Rt(t,n))return;du.set(n),s.uniformMatrix2fv(this.addr,!1,du),Ct(t,n)}}function cv(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Rt(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),Ct(t,e)}else{if(Rt(t,n))return;fu.set(n),s.uniformMatrix3fv(this.addr,!1,fu),Ct(t,n)}}function hv(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Rt(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),Ct(t,e)}else{if(Rt(t,n))return;uu.set(n),s.uniformMatrix4fv(this.addr,!1,uu),Ct(t,n)}}function uv(s,e){const t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function fv(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Rt(t,e))return;s.uniform2iv(this.addr,e),Ct(t,e)}}function dv(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Rt(t,e))return;s.uniform3iv(this.addr,e),Ct(t,e)}}function pv(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Rt(t,e))return;s.uniform4iv(this.addr,e),Ct(t,e)}}function mv(s,e){const t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function gv(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Rt(t,e))return;s.uniform2uiv(this.addr,e),Ct(t,e)}}function _v(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Rt(t,e))return;s.uniform3uiv(this.addr,e),Ct(t,e)}}function vv(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Rt(t,e))return;s.uniform4uiv(this.addr,e),Ct(t,e)}}function xv(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(lu.compareFunction=uf,r=lu):r=Df,t.setTexture2D(e||r,i)}function yv(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||If,i)}function Mv(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||Uf,i)}function Sv(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||Lf,i)}function Tv(s){switch(s){case 5126:return rv;case 35664:return sv;case 35665:return av;case 35666:return ov;case 35674:return lv;case 35675:return cv;case 35676:return hv;case 5124:case 35670:return uv;case 35667:case 35671:return fv;case 35668:case 35672:return dv;case 35669:case 35673:return pv;case 5125:return mv;case 36294:return gv;case 36295:return _v;case 36296:return vv;case 35678:case 36198:case 36298:case 36306:case 35682:return xv;case 35679:case 36299:case 36307:return yv;case 35680:case 36300:case 36308:case 36293:return Mv;case 36289:case 36303:case 36311:case 36292:return Sv}}function bv(s,e){s.uniform1fv(this.addr,e)}function Ev(s,e){const t=rs(e,this.size,2);s.uniform2fv(this.addr,t)}function wv(s,e){const t=rs(e,this.size,3);s.uniform3fv(this.addr,t)}function Av(s,e){const t=rs(e,this.size,4);s.uniform4fv(this.addr,t)}function Rv(s,e){const t=rs(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function Cv(s,e){const t=rs(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function Pv(s,e){const t=rs(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function Dv(s,e){s.uniform1iv(this.addr,e)}function Lv(s,e){s.uniform2iv(this.addr,e)}function Iv(s,e){s.uniform3iv(this.addr,e)}function Uv(s,e){s.uniform4iv(this.addr,e)}function Nv(s,e){s.uniform1uiv(this.addr,e)}function Fv(s,e){s.uniform2uiv(this.addr,e)}function Ov(s,e){s.uniform3uiv(this.addr,e)}function Bv(s,e){s.uniform4uiv(this.addr,e)}function kv(s,e,t){const n=this.cache,i=e.length,r=$a(t,i);Rt(n,r)||(s.uniform1iv(this.addr,r),Ct(n,r));for(let a=0;a!==i;++a)t.setTexture2D(e[a]||Df,r[a])}function zv(s,e,t){const n=this.cache,i=e.length,r=$a(t,i);Rt(n,r)||(s.uniform1iv(this.addr,r),Ct(n,r));for(let a=0;a!==i;++a)t.setTexture3D(e[a]||If,r[a])}function Hv(s,e,t){const n=this.cache,i=e.length,r=$a(t,i);Rt(n,r)||(s.uniform1iv(this.addr,r),Ct(n,r));for(let a=0;a!==i;++a)t.setTextureCube(e[a]||Uf,r[a])}function Vv(s,e,t){const n=this.cache,i=e.length,r=$a(t,i);Rt(n,r)||(s.uniform1iv(this.addr,r),Ct(n,r));for(let a=0;a!==i;++a)t.setTexture2DArray(e[a]||Lf,r[a])}function Gv(s){switch(s){case 5126:return bv;case 35664:return Ev;case 35665:return wv;case 35666:return Av;case 35674:return Rv;case 35675:return Cv;case 35676:return Pv;case 5124:case 35670:return Dv;case 35667:case 35671:return Lv;case 35668:case 35672:return Iv;case 35669:case 35673:return Uv;case 5125:return Nv;case 36294:return Fv;case 36295:return Ov;case 36296:return Bv;case 35678:case 36198:case 36298:case 36306:case 35682:return kv;case 35679:case 36299:case 36307:return zv;case 35680:case 36300:case 36308:case 36293:return Hv;case 36289:case 36303:case 36311:case 36292:return Vv}}class Wv{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Tv(t.type)}}class Xv{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Gv(t.type)}}class qv{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let r=0,a=i.length;r!==a;++r){const o=i[r];o.setValue(e,t[o.id],n)}}}const Bo=/(\w+)(\])?(\[|\.)?/g;function pu(s,e){s.seq.push(e),s.map[e.id]=e}function Yv(s,e,t){const n=s.name,i=n.length;for(Bo.lastIndex=0;;){const r=Bo.exec(n),a=Bo.lastIndex;let o=r[1];const l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===i){pu(t,c===void 0?new Wv(o,s,e):new Xv(o,s,e));break}else{let u=t.map[o];u===void 0&&(u=new qv(o),pu(t,u)),t=u}}}class Ra{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const r=e.getActiveUniform(t,i),a=e.getUniformLocation(t,r.name);Yv(r,a,this)}}setValue(e,t,n,i){const r=this.map[t];r!==void 0&&r.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let r=0,a=t.length;r!==a;++r){const o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,r=e.length;i!==r;++i){const a=e[i];a.id in t&&n.push(a)}return n}}function mu(s,e,t){const n=s.createShader(e);return s.shaderSource(n,t),s.compileShader(n),n}const jv=37297;let Kv=0;function $v(s,e){const t=s.split(`
`),n=[],i=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=i;a<r;a++){const o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}const gu=new Be;function Zv(s){Ze._getMatrix(gu,Ze.workingColorSpace,s);const e=`mat3( ${gu.elements.map(t=>t.toFixed(4))} )`;switch(Ze.getTransfer(s)){case Ia:return[e,"LinearTransferOETF"];case rt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function _u(s,e,t){const n=s.getShaderParameter(e,s.COMPILE_STATUS),r=(s.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+$v(s.getShaderSource(e),o)}else return r}function Jv(s,e){const t=Zv(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Qv(s,e){let t;switch(e){case hp:t="Linear";break;case up:t="Reinhard";break;case fp:t="Cineon";break;case dp:t="ACESFilmic";break;case mp:t="AgX";break;case gp:t="Neutral";break;case pp:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Ma=new I;function ex(){Ze.getLuminanceCoefficients(Ma);const s=Ma.x.toFixed(4),e=Ma.y.toFixed(4),t=Ma.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function tx(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(vs).join(`
`)}function nx(s){const e=[];for(const t in s){const n=s[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function ix(s,e){const t={},n=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const r=s.getActiveAttrib(e,i),a=r.name;let o=1;r.type===s.FLOAT_MAT2&&(o=2),r.type===s.FLOAT_MAT3&&(o=3),r.type===s.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:s.getAttribLocation(e,a),locationSize:o}}return t}function vs(s){return s!==""}function vu(s,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function xu(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const rx=/^[ \t]*#include +<([\w\d./]+)>/gm;function Vl(s){return s.replace(rx,ax)}const sx=new Map;function ax(s,e){let t=ze[e];if(t===void 0){const n=sx.get(e);if(n!==void 0)t=ze[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Vl(t)}const ox=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function yu(s){return s.replace(ox,lx)}function lx(s,e,t,n){let i="";for(let r=parseInt(e);r<parseInt(t);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function Mu(s){let e=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function cx(s){let e="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===Qu?e="SHADOWMAP_TYPE_PCF":s.shadowMapType===Gd?e="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===ri&&(e="SHADOWMAP_TYPE_VSM"),e}function hx(s){let e="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case Hr:case Vr:e="ENVMAP_TYPE_CUBE";break;case Xa:e="ENVMAP_TYPE_CUBE_UV";break}return e}function ux(s){let e="ENVMAP_MODE_REFLECTION";return s.envMap&&s.envMapMode===Vr&&(e="ENVMAP_MODE_REFRACTION"),e}function fx(s){let e="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case hc:e="ENVMAP_BLENDING_MULTIPLY";break;case lp:e="ENVMAP_BLENDING_MIX";break;case cp:e="ENVMAP_BLENDING_ADD";break}return e}function dx(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function px(s,e,t,n){const i=s.getContext(),r=t.defines;let a=t.vertexShader,o=t.fragmentShader;const l=cx(t),c=hx(t),h=ux(t),u=fx(t),f=dx(t),d=tx(t),_=nx(r),g=i.createProgram();let m,p,M=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(vs).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_].filter(vs).join(`
`),p.length>0&&(p+=`
`)):(m=[Mu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(vs).join(`
`),p=[Mu(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,_,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ui?"#define TONE_MAPPING":"",t.toneMapping!==ui?ze.tonemapping_pars_fragment:"",t.toneMapping!==ui?Qv("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",ze.colorspace_pars_fragment,Jv("linearToOutputTexel",t.outputColorSpace),ex(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(vs).join(`
`)),a=Vl(a),a=vu(a,t),a=xu(a,t),o=Vl(o),o=vu(o,t),o=xu(o,t),a=yu(a),o=yu(o),t.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===gh?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===gh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const x=M+m+a,v=M+p+o,S=mu(i,i.VERTEX_SHADER,x),A=mu(i,i.FRAGMENT_SHADER,v);i.attachShader(g,S),i.attachShader(g,A),t.index0AttributeName!==void 0?i.bindAttribLocation(g,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(g,0,"position"),i.linkProgram(g);function w(P){if(s.debug.checkShaderErrors){const D=i.getProgramInfoLog(g)||"",N=i.getShaderInfoLog(S)||"",k=i.getShaderInfoLog(A)||"",z=D.trim(),W=N.trim(),q=k.trim();let V=!0,ie=!0;if(i.getProgramParameter(g,i.LINK_STATUS)===!1)if(V=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,g,S,A);else{const oe=_u(i,S,"vertex"),ge=_u(i,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(g,i.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+z+`
`+oe+`
`+ge)}else z!==""?console.warn("THREE.WebGLProgram: Program Info Log:",z):(W===""||q==="")&&(ie=!1);ie&&(P.diagnostics={runnable:V,programLog:z,vertexShader:{log:W,prefix:m},fragmentShader:{log:q,prefix:p}})}i.deleteShader(S),i.deleteShader(A),R=new Ra(i,g),y=ix(i,g)}let R;this.getUniforms=function(){return R===void 0&&w(this),R};let y;this.getAttributes=function(){return y===void 0&&w(this),y};let b=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return b===!1&&(b=i.getProgramParameter(g,jv)),b},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(g),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Kv++,this.cacheKey=e,this.usedTimes=1,this.program=g,this.vertexShader=S,this.fragmentShader=A,this}let mx=0;class gx{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(i)===!1&&(a.add(i),i.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new _x(e),t.set(e,n)),n}}class _x{constructor(e){this.id=mx++,this.code=e,this.usedTimes=0}}function vx(s,e,t,n,i,r,a){const o=new Mc,l=new gx,c=new Set,h=[],u=i.logarithmicDepthBuffer,f=i.vertexTextures;let d=i.precision;const _={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(y){return c.add(y),y===0?"uv":`uv${y}`}function m(y,b,P,D,N){const k=D.fog,z=N.geometry,W=y.isMeshStandardMaterial?D.environment:null,q=(y.isMeshStandardMaterial?t:e).get(y.envMap||W),V=q&&q.mapping===Xa?q.image.height:null,ie=_[y.type];y.precision!==null&&(d=i.getMaxPrecision(y.precision),d!==y.precision&&console.warn("THREE.WebGLProgram.getParameters:",y.precision,"not supported, using",d,"instead."));const oe=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,ge=oe!==void 0?oe.length:0;let Le=0;z.morphAttributes.position!==void 0&&(Le=1),z.morphAttributes.normal!==void 0&&(Le=2),z.morphAttributes.color!==void 0&&(Le=3);let et,Ke,He,j;if(ie){const Qe=Vn[ie];et=Qe.vertexShader,Ke=Qe.fragmentShader}else et=y.vertexShader,Ke=y.fragmentShader,l.update(y),He=l.getVertexShaderID(y),j=l.getFragmentShaderID(y);const Z=s.getRenderTarget(),de=s.state.buffers.depth.getReversed(),Ie=N.isInstancedMesh===!0,be=N.isBatchedMesh===!0,$e=!!y.map,Ft=!!y.matcap,L=!!q,ut=!!y.aoMap,Fe=!!y.lightMap,Pe=!!y.bumpMap,ve=!!y.normalMap,ft=!!y.displacementMap,xe=!!y.emissiveMap,ke=!!y.metalnessMap,Pt=!!y.roughnessMap,St=y.anisotropy>0,C=y.clearcoat>0,T=y.dispersion>0,B=y.iridescence>0,Y=y.sheen>0,$=y.transmission>0,X=St&&!!y.anisotropyMap,Te=C&&!!y.clearcoatMap,ne=C&&!!y.clearcoatNormalMap,ye=C&&!!y.clearcoatRoughnessMap,Me=B&&!!y.iridescenceMap,ee=B&&!!y.iridescenceThicknessMap,ce=Y&&!!y.sheenColorMap,Ce=Y&&!!y.sheenRoughnessMap,Se=!!y.specularMap,ae=!!y.specularColorMap,Oe=!!y.specularIntensityMap,U=$&&!!y.transmissionMap,te=$&&!!y.thicknessMap,re=!!y.gradientMap,fe=!!y.alphaMap,J=y.alphaTest>0,K=!!y.alphaHash,_e=!!y.extensions;let Ue=ui;y.toneMapped&&(Z===null||Z.isXRRenderTarget===!0)&&(Ue=s.toneMapping);const lt={shaderID:ie,shaderType:y.type,shaderName:y.name,vertexShader:et,fragmentShader:Ke,defines:y.defines,customVertexShaderID:He,customFragmentShaderID:j,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:d,batching:be,batchingColor:be&&N._colorsTexture!==null,instancing:Ie,instancingColor:Ie&&N.instanceColor!==null,instancingMorph:Ie&&N.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:Z===null?s.outputColorSpace:Z.isXRRenderTarget===!0?Z.texture.colorSpace:Zt,alphaToCoverage:!!y.alphaToCoverage,map:$e,matcap:Ft,envMap:L,envMapMode:L&&q.mapping,envMapCubeUVHeight:V,aoMap:ut,lightMap:Fe,bumpMap:Pe,normalMap:ve,displacementMap:f&&ft,emissiveMap:xe,normalMapObjectSpace:ve&&y.normalMapType===Sp,normalMapTangentSpace:ve&&y.normalMapType===vc,metalnessMap:ke,roughnessMap:Pt,anisotropy:St,anisotropyMap:X,clearcoat:C,clearcoatMap:Te,clearcoatNormalMap:ne,clearcoatRoughnessMap:ye,dispersion:T,iridescence:B,iridescenceMap:Me,iridescenceThicknessMap:ee,sheen:Y,sheenColorMap:ce,sheenRoughnessMap:Ce,specularMap:Se,specularColorMap:ae,specularIntensityMap:Oe,transmission:$,transmissionMap:U,thicknessMap:te,gradientMap:re,opaque:y.transparent===!1&&y.blending===Ur&&y.alphaToCoverage===!1,alphaMap:fe,alphaTest:J,alphaHash:K,combine:y.combine,mapUv:$e&&g(y.map.channel),aoMapUv:ut&&g(y.aoMap.channel),lightMapUv:Fe&&g(y.lightMap.channel),bumpMapUv:Pe&&g(y.bumpMap.channel),normalMapUv:ve&&g(y.normalMap.channel),displacementMapUv:ft&&g(y.displacementMap.channel),emissiveMapUv:xe&&g(y.emissiveMap.channel),metalnessMapUv:ke&&g(y.metalnessMap.channel),roughnessMapUv:Pt&&g(y.roughnessMap.channel),anisotropyMapUv:X&&g(y.anisotropyMap.channel),clearcoatMapUv:Te&&g(y.clearcoatMap.channel),clearcoatNormalMapUv:ne&&g(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ye&&g(y.clearcoatRoughnessMap.channel),iridescenceMapUv:Me&&g(y.iridescenceMap.channel),iridescenceThicknessMapUv:ee&&g(y.iridescenceThicknessMap.channel),sheenColorMapUv:ce&&g(y.sheenColorMap.channel),sheenRoughnessMapUv:Ce&&g(y.sheenRoughnessMap.channel),specularMapUv:Se&&g(y.specularMap.channel),specularColorMapUv:ae&&g(y.specularColorMap.channel),specularIntensityMapUv:Oe&&g(y.specularIntensityMap.channel),transmissionMapUv:U&&g(y.transmissionMap.channel),thicknessMapUv:te&&g(y.thicknessMap.channel),alphaMapUv:fe&&g(y.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(ve||St),vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!z.attributes.uv&&($e||fe),fog:!!k,useFog:y.fog===!0,fogExp2:!!k&&k.isFogExp2,flatShading:y.flatShading===!0&&y.wireframe===!1,sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:de,skinning:N.isSkinnedMesh===!0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:ge,morphTextureStride:Le,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:y.dithering,shadowMapEnabled:s.shadowMap.enabled&&P.length>0,shadowMapType:s.shadowMap.type,toneMapping:Ue,decodeVideoTexture:$e&&y.map.isVideoTexture===!0&&Ze.getTransfer(y.map.colorSpace)===rt,decodeVideoTextureEmissive:xe&&y.emissiveMap.isVideoTexture===!0&&Ze.getTransfer(y.emissiveMap.colorSpace)===rt,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===en,flipSided:y.side===Kt,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:_e&&y.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(_e&&y.extensions.multiDraw===!0||be)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return lt.vertexUv1s=c.has(1),lt.vertexUv2s=c.has(2),lt.vertexUv3s=c.has(3),c.clear(),lt}function p(y){const b=[];if(y.shaderID?b.push(y.shaderID):(b.push(y.customVertexShaderID),b.push(y.customFragmentShaderID)),y.defines!==void 0)for(const P in y.defines)b.push(P),b.push(y.defines[P]);return y.isRawShaderMaterial===!1&&(M(b,y),x(b,y),b.push(s.outputColorSpace)),b.push(y.customProgramCacheKey),b.join()}function M(y,b){y.push(b.precision),y.push(b.outputColorSpace),y.push(b.envMapMode),y.push(b.envMapCubeUVHeight),y.push(b.mapUv),y.push(b.alphaMapUv),y.push(b.lightMapUv),y.push(b.aoMapUv),y.push(b.bumpMapUv),y.push(b.normalMapUv),y.push(b.displacementMapUv),y.push(b.emissiveMapUv),y.push(b.metalnessMapUv),y.push(b.roughnessMapUv),y.push(b.anisotropyMapUv),y.push(b.clearcoatMapUv),y.push(b.clearcoatNormalMapUv),y.push(b.clearcoatRoughnessMapUv),y.push(b.iridescenceMapUv),y.push(b.iridescenceThicknessMapUv),y.push(b.sheenColorMapUv),y.push(b.sheenRoughnessMapUv),y.push(b.specularMapUv),y.push(b.specularColorMapUv),y.push(b.specularIntensityMapUv),y.push(b.transmissionMapUv),y.push(b.thicknessMapUv),y.push(b.combine),y.push(b.fogExp2),y.push(b.sizeAttenuation),y.push(b.morphTargetsCount),y.push(b.morphAttributeCount),y.push(b.numDirLights),y.push(b.numPointLights),y.push(b.numSpotLights),y.push(b.numSpotLightMaps),y.push(b.numHemiLights),y.push(b.numRectAreaLights),y.push(b.numDirLightShadows),y.push(b.numPointLightShadows),y.push(b.numSpotLightShadows),y.push(b.numSpotLightShadowsWithMaps),y.push(b.numLightProbes),y.push(b.shadowMapType),y.push(b.toneMapping),y.push(b.numClippingPlanes),y.push(b.numClipIntersection),y.push(b.depthPacking)}function x(y,b){o.disableAll(),b.supportsVertexTextures&&o.enable(0),b.instancing&&o.enable(1),b.instancingColor&&o.enable(2),b.instancingMorph&&o.enable(3),b.matcap&&o.enable(4),b.envMap&&o.enable(5),b.normalMapObjectSpace&&o.enable(6),b.normalMapTangentSpace&&o.enable(7),b.clearcoat&&o.enable(8),b.iridescence&&o.enable(9),b.alphaTest&&o.enable(10),b.vertexColors&&o.enable(11),b.vertexAlphas&&o.enable(12),b.vertexUv1s&&o.enable(13),b.vertexUv2s&&o.enable(14),b.vertexUv3s&&o.enable(15),b.vertexTangents&&o.enable(16),b.anisotropy&&o.enable(17),b.alphaHash&&o.enable(18),b.batching&&o.enable(19),b.dispersion&&o.enable(20),b.batchingColor&&o.enable(21),b.gradientMap&&o.enable(22),y.push(o.mask),o.disableAll(),b.fog&&o.enable(0),b.useFog&&o.enable(1),b.flatShading&&o.enable(2),b.logarithmicDepthBuffer&&o.enable(3),b.reversedDepthBuffer&&o.enable(4),b.skinning&&o.enable(5),b.morphTargets&&o.enable(6),b.morphNormals&&o.enable(7),b.morphColors&&o.enable(8),b.premultipliedAlpha&&o.enable(9),b.shadowMapEnabled&&o.enable(10),b.doubleSided&&o.enable(11),b.flipSided&&o.enable(12),b.useDepthPacking&&o.enable(13),b.dithering&&o.enable(14),b.transmission&&o.enable(15),b.sheen&&o.enable(16),b.opaque&&o.enable(17),b.pointsUvs&&o.enable(18),b.decodeVideoTexture&&o.enable(19),b.decodeVideoTextureEmissive&&o.enable(20),b.alphaToCoverage&&o.enable(21),y.push(o.mask)}function v(y){const b=_[y.type];let P;if(b){const D=Vn[b];P=vf.clone(D.uniforms)}else P=y.uniforms;return P}function S(y,b){let P;for(let D=0,N=h.length;D<N;D++){const k=h[D];if(k.cacheKey===b){P=k,++P.usedTimes;break}}return P===void 0&&(P=new px(s,b,y,r),h.push(P)),P}function A(y){if(--y.usedTimes===0){const b=h.indexOf(y);h[b]=h[h.length-1],h.pop(),y.destroy()}}function w(y){l.remove(y)}function R(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:v,acquireProgram:S,releaseProgram:A,releaseShaderCache:w,programs:h,dispose:R}}function xx(){let s=new WeakMap;function e(a){return s.has(a)}function t(a){let o=s.get(a);return o===void 0&&(o={},s.set(a,o)),o}function n(a){s.delete(a)}function i(a,o,l){s.get(a)[o]=l}function r(){s=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:r}}function yx(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function Su(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function Tu(){const s=[];let e=0;const t=[],n=[],i=[];function r(){e=0,t.length=0,n.length=0,i.length=0}function a(u,f,d,_,g,m){let p=s[e];return p===void 0?(p={id:u.id,object:u,geometry:f,material:d,groupOrder:_,renderOrder:u.renderOrder,z:g,group:m},s[e]=p):(p.id=u.id,p.object=u,p.geometry=f,p.material=d,p.groupOrder=_,p.renderOrder=u.renderOrder,p.z=g,p.group=m),e++,p}function o(u,f,d,_,g,m){const p=a(u,f,d,_,g,m);d.transmission>0?n.push(p):d.transparent===!0?i.push(p):t.push(p)}function l(u,f,d,_,g,m){const p=a(u,f,d,_,g,m);d.transmission>0?n.unshift(p):d.transparent===!0?i.unshift(p):t.unshift(p)}function c(u,f){t.length>1&&t.sort(u||yx),n.length>1&&n.sort(f||Su),i.length>1&&i.sort(f||Su)}function h(){for(let u=e,f=s.length;u<f;u++){const d=s[u];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:t,transmissive:n,transparent:i,init:r,push:o,unshift:l,finish:h,sort:c}}function Mx(){let s=new WeakMap;function e(n,i){const r=s.get(n);let a;return r===void 0?(a=new Tu,s.set(n,[a])):i>=r.length?(a=new Tu,r.push(a)):a=r[i],a}function t(){s=new WeakMap}return{get:e,dispose:t}}function Sx(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new I,color:new me};break;case"SpotLight":t={position:new I,direction:new I,color:new me,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new I,color:new me,distance:0,decay:0};break;case"HemisphereLight":t={direction:new I,skyColor:new me,groundColor:new me};break;case"RectAreaLight":t={color:new me,position:new I,halfWidth:new I,halfHeight:new I};break}return s[e.id]=t,t}}}function Tx(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ue};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ue};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ue,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}let bx=0;function Ex(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function wx(s){const e=new Sx,t=Tx(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new I);const i=new I,r=new Ne,a=new Ne;function o(c){let h=0,u=0,f=0;for(let y=0;y<9;y++)n.probe[y].set(0,0,0);let d=0,_=0,g=0,m=0,p=0,M=0,x=0,v=0,S=0,A=0,w=0;c.sort(Ex);for(let y=0,b=c.length;y<b;y++){const P=c[y],D=P.color,N=P.intensity,k=P.distance,z=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)h+=D.r*N,u+=D.g*N,f+=D.b*N;else if(P.isLightProbe){for(let W=0;W<9;W++)n.probe[W].addScaledVector(P.sh.coefficients[W],N);w++}else if(P.isDirectionalLight){const W=e.get(P);if(W.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){const q=P.shadow,V=t.get(P);V.shadowIntensity=q.intensity,V.shadowBias=q.bias,V.shadowNormalBias=q.normalBias,V.shadowRadius=q.radius,V.shadowMapSize=q.mapSize,n.directionalShadow[d]=V,n.directionalShadowMap[d]=z,n.directionalShadowMatrix[d]=P.shadow.matrix,M++}n.directional[d]=W,d++}else if(P.isSpotLight){const W=e.get(P);W.position.setFromMatrixPosition(P.matrixWorld),W.color.copy(D).multiplyScalar(N),W.distance=k,W.coneCos=Math.cos(P.angle),W.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),W.decay=P.decay,n.spot[g]=W;const q=P.shadow;if(P.map&&(n.spotLightMap[S]=P.map,S++,q.updateMatrices(P),P.castShadow&&A++),n.spotLightMatrix[g]=q.matrix,P.castShadow){const V=t.get(P);V.shadowIntensity=q.intensity,V.shadowBias=q.bias,V.shadowNormalBias=q.normalBias,V.shadowRadius=q.radius,V.shadowMapSize=q.mapSize,n.spotShadow[g]=V,n.spotShadowMap[g]=z,v++}g++}else if(P.isRectAreaLight){const W=e.get(P);W.color.copy(D).multiplyScalar(N),W.halfWidth.set(P.width*.5,0,0),W.halfHeight.set(0,P.height*.5,0),n.rectArea[m]=W,m++}else if(P.isPointLight){const W=e.get(P);if(W.color.copy(P.color).multiplyScalar(P.intensity),W.distance=P.distance,W.decay=P.decay,P.castShadow){const q=P.shadow,V=t.get(P);V.shadowIntensity=q.intensity,V.shadowBias=q.bias,V.shadowNormalBias=q.normalBias,V.shadowRadius=q.radius,V.shadowMapSize=q.mapSize,V.shadowCameraNear=q.camera.near,V.shadowCameraFar=q.camera.far,n.pointShadow[_]=V,n.pointShadowMap[_]=z,n.pointShadowMatrix[_]=P.shadow.matrix,x++}n.point[_]=W,_++}else if(P.isHemisphereLight){const W=e.get(P);W.skyColor.copy(P.color).multiplyScalar(N),W.groundColor.copy(P.groundColor).multiplyScalar(N),n.hemi[p]=W,p++}}m>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=se.LTC_FLOAT_1,n.rectAreaLTC2=se.LTC_FLOAT_2):(n.rectAreaLTC1=se.LTC_HALF_1,n.rectAreaLTC2=se.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;const R=n.hash;(R.directionalLength!==d||R.pointLength!==_||R.spotLength!==g||R.rectAreaLength!==m||R.hemiLength!==p||R.numDirectionalShadows!==M||R.numPointShadows!==x||R.numSpotShadows!==v||R.numSpotMaps!==S||R.numLightProbes!==w)&&(n.directional.length=d,n.spot.length=g,n.rectArea.length=m,n.point.length=_,n.hemi.length=p,n.directionalShadow.length=M,n.directionalShadowMap.length=M,n.pointShadow.length=x,n.pointShadowMap.length=x,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=M,n.pointShadowMatrix.length=x,n.spotLightMatrix.length=v+S-A,n.spotLightMap.length=S,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=w,R.directionalLength=d,R.pointLength=_,R.spotLength=g,R.rectAreaLength=m,R.hemiLength=p,R.numDirectionalShadows=M,R.numPointShadows=x,R.numSpotShadows=v,R.numSpotMaps=S,R.numLightProbes=w,n.version=bx++)}function l(c,h){let u=0,f=0,d=0,_=0,g=0;const m=h.matrixWorldInverse;for(let p=0,M=c.length;p<M;p++){const x=c[p];if(x.isDirectionalLight){const v=n.directional[u];v.direction.setFromMatrixPosition(x.matrixWorld),i.setFromMatrixPosition(x.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(m),u++}else if(x.isSpotLight){const v=n.spot[d];v.position.setFromMatrixPosition(x.matrixWorld),v.position.applyMatrix4(m),v.direction.setFromMatrixPosition(x.matrixWorld),i.setFromMatrixPosition(x.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(m),d++}else if(x.isRectAreaLight){const v=n.rectArea[_];v.position.setFromMatrixPosition(x.matrixWorld),v.position.applyMatrix4(m),a.identity(),r.copy(x.matrixWorld),r.premultiply(m),a.extractRotation(r),v.halfWidth.set(x.width*.5,0,0),v.halfHeight.set(0,x.height*.5,0),v.halfWidth.applyMatrix4(a),v.halfHeight.applyMatrix4(a),_++}else if(x.isPointLight){const v=n.point[f];v.position.setFromMatrixPosition(x.matrixWorld),v.position.applyMatrix4(m),f++}else if(x.isHemisphereLight){const v=n.hemi[g];v.direction.setFromMatrixPosition(x.matrixWorld),v.direction.transformDirection(m),g++}}}return{setup:o,setupView:l,state:n}}function bu(s){const e=new wx(s),t=[],n=[];function i(h){c.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function a(h){n.push(h)}function o(){e.setup(t)}function l(h){e.setupView(t,h)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:i,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function Ax(s){let e=new WeakMap;function t(i,r=0){const a=e.get(i);let o;return a===void 0?(o=new bu(s),e.set(i,[o])):r>=a.length?(o=new bu(s),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}const Rx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Cx=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Px(s,e,t){let n=new Ec;const i=new ue,r=new ue,a=new qe,o=new Cm({depthPacking:Mp}),l=new Pm,c={},h=t.maxTextureSize,u={[pi]:Kt,[Kt]:pi,[en]:en},f=new Ut({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ue},radius:{value:4}},vertexShader:Rx,fragmentShader:Cx}),d=f.clone();d.defines.HORIZONTAL_PASS=1;const _=new Mt;_.setAttribute("position",new Vt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const g=new We(_,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Qu;let p=this.type;this.render=function(A,w,R){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;const y=s.getRenderTarget(),b=s.getActiveCubeFace(),P=s.getActiveMipmapLevel(),D=s.state;D.setBlending(Pi),D.buffers.depth.getReversed()===!0?D.buffers.color.setClear(0,0,0,0):D.buffers.color.setClear(1,1,1,1),D.buffers.depth.setTest(!0),D.setScissorTest(!1);const N=p!==ri&&this.type===ri,k=p===ri&&this.type!==ri;for(let z=0,W=A.length;z<W;z++){const q=A[z],V=q.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",q,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;i.copy(V.mapSize);const ie=V.getFrameExtents();if(i.multiply(ie),r.copy(V.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/ie.x),i.x=r.x*ie.x,V.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/ie.y),i.y=r.y*ie.y,V.mapSize.y=r.y)),V.map===null||N===!0||k===!0){const ge=this.type!==ri?{minFilter:$t,magFilter:$t}:{};V.map!==null&&V.map.dispose(),V.map=new qn(i.x,i.y,ge),V.map.texture.name=q.name+".shadowMap",V.camera.updateProjectionMatrix()}s.setRenderTarget(V.map),s.clear();const oe=V.getViewportCount();for(let ge=0;ge<oe;ge++){const Le=V.getViewport(ge);a.set(r.x*Le.x,r.y*Le.y,r.x*Le.z,r.y*Le.w),D.viewport(a),V.updateMatrices(q,ge),n=V.getFrustum(),v(w,R,V.camera,q,this.type)}V.isPointLightShadow!==!0&&this.type===ri&&M(V,R),V.needsUpdate=!1}p=this.type,m.needsUpdate=!1,s.setRenderTarget(y,b,P)};function M(A,w){const R=e.update(g);f.defines.VSM_SAMPLES!==A.blurSamples&&(f.defines.VSM_SAMPLES=A.blurSamples,d.defines.VSM_SAMPLES=A.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new qn(i.x,i.y)),f.uniforms.shadow_pass.value=A.map.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,s.setRenderTarget(A.mapPass),s.clear(),s.renderBufferDirect(w,null,R,f,g,null),d.uniforms.shadow_pass.value=A.mapPass.texture,d.uniforms.resolution.value=A.mapSize,d.uniforms.radius.value=A.radius,s.setRenderTarget(A.map),s.clear(),s.renderBufferDirect(w,null,R,d,g,null)}function x(A,w,R,y){let b=null;const P=R.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(P!==void 0)b=P;else if(b=R.isPointLight===!0?l:o,s.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){const D=b.uuid,N=w.uuid;let k=c[D];k===void 0&&(k={},c[D]=k);let z=k[N];z===void 0&&(z=b.clone(),k[N]=z,w.addEventListener("dispose",S)),b=z}if(b.visible=w.visible,b.wireframe=w.wireframe,y===ri?b.side=w.shadowSide!==null?w.shadowSide:w.side:b.side=w.shadowSide!==null?w.shadowSide:u[w.side],b.alphaMap=w.alphaMap,b.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,b.map=w.map,b.clipShadows=w.clipShadows,b.clippingPlanes=w.clippingPlanes,b.clipIntersection=w.clipIntersection,b.displacementMap=w.displacementMap,b.displacementScale=w.displacementScale,b.displacementBias=w.displacementBias,b.wireframeLinewidth=w.wireframeLinewidth,b.linewidth=w.linewidth,R.isPointLight===!0&&b.isMeshDistanceMaterial===!0){const D=s.properties.get(b);D.light=R}return b}function v(A,w,R,y,b){if(A.visible===!1)return;if(A.layers.test(w.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&b===ri)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(R.matrixWorldInverse,A.matrixWorld);const N=e.update(A),k=A.material;if(Array.isArray(k)){const z=N.groups;for(let W=0,q=z.length;W<q;W++){const V=z[W],ie=k[V.materialIndex];if(ie&&ie.visible){const oe=x(A,ie,y,b);A.onBeforeShadow(s,A,w,R,N,oe,V),s.renderBufferDirect(R,null,N,oe,A,V),A.onAfterShadow(s,A,w,R,N,oe,V)}}}else if(k.visible){const z=x(A,k,y,b);A.onBeforeShadow(s,A,w,R,N,z,null),s.renderBufferDirect(R,null,N,z,A,null),A.onAfterShadow(s,A,w,R,N,z,null)}}const D=A.children;for(let N=0,k=D.length;N<k;N++)v(D[N],w,R,y,b)}function S(A){A.target.removeEventListener("dispose",S);for(const R in c){const y=c[R],b=A.target.uuid;b in y&&(y[b].dispose(),delete y[b])}}}const Dx={[Qo]:el,[tl]:rl,[nl]:sl,[zr]:il,[el]:Qo,[rl]:tl,[sl]:nl,[il]:zr};function Lx(s,e){function t(){let U=!1;const te=new qe;let re=null;const fe=new qe(0,0,0,0);return{setMask:function(J){re!==J&&!U&&(s.colorMask(J,J,J,J),re=J)},setLocked:function(J){U=J},setClear:function(J,K,_e,Ue,lt){lt===!0&&(J*=Ue,K*=Ue,_e*=Ue),te.set(J,K,_e,Ue),fe.equals(te)===!1&&(s.clearColor(J,K,_e,Ue),fe.copy(te))},reset:function(){U=!1,re=null,fe.set(-1,0,0,0)}}}function n(){let U=!1,te=!1,re=null,fe=null,J=null;return{setReversed:function(K){if(te!==K){const _e=e.get("EXT_clip_control");K?_e.clipControlEXT(_e.LOWER_LEFT_EXT,_e.ZERO_TO_ONE_EXT):_e.clipControlEXT(_e.LOWER_LEFT_EXT,_e.NEGATIVE_ONE_TO_ONE_EXT),te=K;const Ue=J;J=null,this.setClear(Ue)}},getReversed:function(){return te},setTest:function(K){K?Z(s.DEPTH_TEST):de(s.DEPTH_TEST)},setMask:function(K){re!==K&&!U&&(s.depthMask(K),re=K)},setFunc:function(K){if(te&&(K=Dx[K]),fe!==K){switch(K){case Qo:s.depthFunc(s.NEVER);break;case el:s.depthFunc(s.ALWAYS);break;case tl:s.depthFunc(s.LESS);break;case zr:s.depthFunc(s.LEQUAL);break;case nl:s.depthFunc(s.EQUAL);break;case il:s.depthFunc(s.GEQUAL);break;case rl:s.depthFunc(s.GREATER);break;case sl:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}fe=K}},setLocked:function(K){U=K},setClear:function(K){J!==K&&(te&&(K=1-K),s.clearDepth(K),J=K)},reset:function(){U=!1,re=null,fe=null,J=null,te=!1}}}function i(){let U=!1,te=null,re=null,fe=null,J=null,K=null,_e=null,Ue=null,lt=null;return{setTest:function(Qe){U||(Qe?Z(s.STENCIL_TEST):de(s.STENCIL_TEST))},setMask:function(Qe){te!==Qe&&!U&&(s.stencilMask(Qe),te=Qe)},setFunc:function(Qe,$n,kn){(re!==Qe||fe!==$n||J!==kn)&&(s.stencilFunc(Qe,$n,kn),re=Qe,fe=$n,J=kn)},setOp:function(Qe,$n,kn){(K!==Qe||_e!==$n||Ue!==kn)&&(s.stencilOp(Qe,$n,kn),K=Qe,_e=$n,Ue=kn)},setLocked:function(Qe){U=Qe},setClear:function(Qe){lt!==Qe&&(s.clearStencil(Qe),lt=Qe)},reset:function(){U=!1,te=null,re=null,fe=null,J=null,K=null,_e=null,Ue=null,lt=null}}}const r=new t,a=new n,o=new i,l=new WeakMap,c=new WeakMap;let h={},u={},f=new WeakMap,d=[],_=null,g=!1,m=null,p=null,M=null,x=null,v=null,S=null,A=null,w=new me(0,0,0),R=0,y=!1,b=null,P=null,D=null,N=null,k=null;const z=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let W=!1,q=0;const V=s.getParameter(s.VERSION);V.indexOf("WebGL")!==-1?(q=parseFloat(/^WebGL (\d)/.exec(V)[1]),W=q>=1):V.indexOf("OpenGL ES")!==-1&&(q=parseFloat(/^OpenGL ES (\d)/.exec(V)[1]),W=q>=2);let ie=null,oe={};const ge=s.getParameter(s.SCISSOR_BOX),Le=s.getParameter(s.VIEWPORT),et=new qe().fromArray(ge),Ke=new qe().fromArray(Le);function He(U,te,re,fe){const J=new Uint8Array(4),K=s.createTexture();s.bindTexture(U,K),s.texParameteri(U,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(U,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let _e=0;_e<re;_e++)U===s.TEXTURE_3D||U===s.TEXTURE_2D_ARRAY?s.texImage3D(te,0,s.RGBA,1,1,fe,0,s.RGBA,s.UNSIGNED_BYTE,J):s.texImage2D(te+_e,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,J);return K}const j={};j[s.TEXTURE_2D]=He(s.TEXTURE_2D,s.TEXTURE_2D,1),j[s.TEXTURE_CUBE_MAP]=He(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),j[s.TEXTURE_2D_ARRAY]=He(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),j[s.TEXTURE_3D]=He(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),Z(s.DEPTH_TEST),a.setFunc(zr),Pe(!1),ve(oh),Z(s.CULL_FACE),ut(Pi);function Z(U){h[U]!==!0&&(s.enable(U),h[U]=!0)}function de(U){h[U]!==!1&&(s.disable(U),h[U]=!1)}function Ie(U,te){return u[U]!==te?(s.bindFramebuffer(U,te),u[U]=te,U===s.DRAW_FRAMEBUFFER&&(u[s.FRAMEBUFFER]=te),U===s.FRAMEBUFFER&&(u[s.DRAW_FRAMEBUFFER]=te),!0):!1}function be(U,te){let re=d,fe=!1;if(U){re=f.get(te),re===void 0&&(re=[],f.set(te,re));const J=U.textures;if(re.length!==J.length||re[0]!==s.COLOR_ATTACHMENT0){for(let K=0,_e=J.length;K<_e;K++)re[K]=s.COLOR_ATTACHMENT0+K;re.length=J.length,fe=!0}}else re[0]!==s.BACK&&(re[0]=s.BACK,fe=!0);fe&&s.drawBuffers(re)}function $e(U){return _!==U?(s.useProgram(U),_=U,!0):!1}const Ft={[er]:s.FUNC_ADD,[Xd]:s.FUNC_SUBTRACT,[qd]:s.FUNC_REVERSE_SUBTRACT};Ft[Yd]=s.MIN,Ft[jd]=s.MAX;const L={[Kd]:s.ZERO,[$d]:s.ONE,[Zd]:s.SRC_COLOR,[Zo]:s.SRC_ALPHA,[ip]:s.SRC_ALPHA_SATURATE,[tp]:s.DST_COLOR,[Qd]:s.DST_ALPHA,[Jd]:s.ONE_MINUS_SRC_COLOR,[Jo]:s.ONE_MINUS_SRC_ALPHA,[np]:s.ONE_MINUS_DST_COLOR,[ep]:s.ONE_MINUS_DST_ALPHA,[rp]:s.CONSTANT_COLOR,[sp]:s.ONE_MINUS_CONSTANT_COLOR,[ap]:s.CONSTANT_ALPHA,[op]:s.ONE_MINUS_CONSTANT_ALPHA};function ut(U,te,re,fe,J,K,_e,Ue,lt,Qe){if(U===Pi){g===!0&&(de(s.BLEND),g=!1);return}if(g===!1&&(Z(s.BLEND),g=!0),U!==Wd){if(U!==m||Qe!==y){if((p!==er||v!==er)&&(s.blendEquation(s.FUNC_ADD),p=er,v=er),Qe)switch(U){case Ur:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case lh:s.blendFunc(s.ONE,s.ONE);break;case ch:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case hh:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}else switch(U){case Ur:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case lh:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case ch:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case hh:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",U);break}M=null,x=null,S=null,A=null,w.set(0,0,0),R=0,m=U,y=Qe}return}J=J||te,K=K||re,_e=_e||fe,(te!==p||J!==v)&&(s.blendEquationSeparate(Ft[te],Ft[J]),p=te,v=J),(re!==M||fe!==x||K!==S||_e!==A)&&(s.blendFuncSeparate(L[re],L[fe],L[K],L[_e]),M=re,x=fe,S=K,A=_e),(Ue.equals(w)===!1||lt!==R)&&(s.blendColor(Ue.r,Ue.g,Ue.b,lt),w.copy(Ue),R=lt),m=U,y=!1}function Fe(U,te){U.side===en?de(s.CULL_FACE):Z(s.CULL_FACE);let re=U.side===Kt;te&&(re=!re),Pe(re),U.blending===Ur&&U.transparent===!1?ut(Pi):ut(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),a.setFunc(U.depthFunc),a.setTest(U.depthTest),a.setMask(U.depthWrite),r.setMask(U.colorWrite);const fe=U.stencilWrite;o.setTest(fe),fe&&(o.setMask(U.stencilWriteMask),o.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),o.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),xe(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?Z(s.SAMPLE_ALPHA_TO_COVERAGE):de(s.SAMPLE_ALPHA_TO_COVERAGE)}function Pe(U){b!==U&&(U?s.frontFace(s.CW):s.frontFace(s.CCW),b=U)}function ve(U){U!==Hd?(Z(s.CULL_FACE),U!==P&&(U===oh?s.cullFace(s.BACK):U===Vd?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):de(s.CULL_FACE),P=U}function ft(U){U!==D&&(W&&s.lineWidth(U),D=U)}function xe(U,te,re){U?(Z(s.POLYGON_OFFSET_FILL),(N!==te||k!==re)&&(s.polygonOffset(te,re),N=te,k=re)):de(s.POLYGON_OFFSET_FILL)}function ke(U){U?Z(s.SCISSOR_TEST):de(s.SCISSOR_TEST)}function Pt(U){U===void 0&&(U=s.TEXTURE0+z-1),ie!==U&&(s.activeTexture(U),ie=U)}function St(U,te,re){re===void 0&&(ie===null?re=s.TEXTURE0+z-1:re=ie);let fe=oe[re];fe===void 0&&(fe={type:void 0,texture:void 0},oe[re]=fe),(fe.type!==U||fe.texture!==te)&&(ie!==re&&(s.activeTexture(re),ie=re),s.bindTexture(U,te||j[U]),fe.type=U,fe.texture=te)}function C(){const U=oe[ie];U!==void 0&&U.type!==void 0&&(s.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function T(){try{s.compressedTexImage2D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function B(){try{s.compressedTexImage3D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Y(){try{s.texSubImage2D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function $(){try{s.texSubImage3D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function X(){try{s.compressedTexSubImage2D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Te(){try{s.compressedTexSubImage3D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function ne(){try{s.texStorage2D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function ye(){try{s.texStorage3D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function Me(){try{s.texImage2D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function ee(){try{s.texImage3D(...arguments)}catch(U){console.error("THREE.WebGLState:",U)}}function ce(U){et.equals(U)===!1&&(s.scissor(U.x,U.y,U.z,U.w),et.copy(U))}function Ce(U){Ke.equals(U)===!1&&(s.viewport(U.x,U.y,U.z,U.w),Ke.copy(U))}function Se(U,te){let re=c.get(te);re===void 0&&(re=new WeakMap,c.set(te,re));let fe=re.get(U);fe===void 0&&(fe=s.getUniformBlockIndex(te,U.name),re.set(U,fe))}function ae(U,te){const fe=c.get(te).get(U);l.get(te)!==fe&&(s.uniformBlockBinding(te,fe,U.__bindingPointIndex),l.set(te,fe))}function Oe(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),a.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),h={},ie=null,oe={},u={},f=new WeakMap,d=[],_=null,g=!1,m=null,p=null,M=null,x=null,v=null,S=null,A=null,w=new me(0,0,0),R=0,y=!1,b=null,P=null,D=null,N=null,k=null,et.set(0,0,s.canvas.width,s.canvas.height),Ke.set(0,0,s.canvas.width,s.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:Z,disable:de,bindFramebuffer:Ie,drawBuffers:be,useProgram:$e,setBlending:ut,setMaterial:Fe,setFlipSided:Pe,setCullFace:ve,setLineWidth:ft,setPolygonOffset:xe,setScissorTest:ke,activeTexture:Pt,bindTexture:St,unbindTexture:C,compressedTexImage2D:T,compressedTexImage3D:B,texImage2D:Me,texImage3D:ee,updateUBOMapping:Se,uniformBlockBinding:ae,texStorage2D:ne,texStorage3D:ye,texSubImage2D:Y,texSubImage3D:$,compressedTexSubImage2D:X,compressedTexSubImage3D:Te,scissor:ce,viewport:Ce,reset:Oe}}function Ix(s,e,t,n,i,r,a){const o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ue,h=new WeakMap;let u;const f=new WeakMap;let d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(C,T){return d?new OffscreenCanvas(C,T):Is("canvas")}function g(C,T,B){let Y=1;const $=St(C);if(($.width>B||$.height>B)&&(Y=B/Math.max($.width,$.height)),Y<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const X=Math.floor(Y*$.width),Te=Math.floor(Y*$.height);u===void 0&&(u=_(X,Te));const ne=T?_(X,Te):u;return ne.width=X,ne.height=Te,ne.getContext("2d").drawImage(C,0,0,X,Te),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+$.width+"x"+$.height+") to ("+X+"x"+Te+")."),ne}else return"data"in C&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+$.width+"x"+$.height+")."),C;return C}function m(C){return C.generateMipmaps}function p(C){s.generateMipmap(C)}function M(C){return C.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?s.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function x(C,T,B,Y,$=!1){if(C!==null){if(s[C]!==void 0)return s[C];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let X=T;if(T===s.RED&&(B===s.FLOAT&&(X=s.R32F),B===s.HALF_FLOAT&&(X=s.R16F),B===s.UNSIGNED_BYTE&&(X=s.R8)),T===s.RED_INTEGER&&(B===s.UNSIGNED_BYTE&&(X=s.R8UI),B===s.UNSIGNED_SHORT&&(X=s.R16UI),B===s.UNSIGNED_INT&&(X=s.R32UI),B===s.BYTE&&(X=s.R8I),B===s.SHORT&&(X=s.R16I),B===s.INT&&(X=s.R32I)),T===s.RG&&(B===s.FLOAT&&(X=s.RG32F),B===s.HALF_FLOAT&&(X=s.RG16F),B===s.UNSIGNED_BYTE&&(X=s.RG8)),T===s.RG_INTEGER&&(B===s.UNSIGNED_BYTE&&(X=s.RG8UI),B===s.UNSIGNED_SHORT&&(X=s.RG16UI),B===s.UNSIGNED_INT&&(X=s.RG32UI),B===s.BYTE&&(X=s.RG8I),B===s.SHORT&&(X=s.RG16I),B===s.INT&&(X=s.RG32I)),T===s.RGB_INTEGER&&(B===s.UNSIGNED_BYTE&&(X=s.RGB8UI),B===s.UNSIGNED_SHORT&&(X=s.RGB16UI),B===s.UNSIGNED_INT&&(X=s.RGB32UI),B===s.BYTE&&(X=s.RGB8I),B===s.SHORT&&(X=s.RGB16I),B===s.INT&&(X=s.RGB32I)),T===s.RGBA_INTEGER&&(B===s.UNSIGNED_BYTE&&(X=s.RGBA8UI),B===s.UNSIGNED_SHORT&&(X=s.RGBA16UI),B===s.UNSIGNED_INT&&(X=s.RGBA32UI),B===s.BYTE&&(X=s.RGBA8I),B===s.SHORT&&(X=s.RGBA16I),B===s.INT&&(X=s.RGBA32I)),T===s.RGB&&(B===s.UNSIGNED_INT_5_9_9_9_REV&&(X=s.RGB9_E5),B===s.UNSIGNED_INT_10F_11F_11F_REV&&(X=s.R11F_G11F_B10F)),T===s.RGBA){const Te=$?Ia:Ze.getTransfer(Y);B===s.FLOAT&&(X=s.RGBA32F),B===s.HALF_FLOAT&&(X=s.RGBA16F),B===s.UNSIGNED_BYTE&&(X=Te===rt?s.SRGB8_ALPHA8:s.RGBA8),B===s.UNSIGNED_SHORT_4_4_4_4&&(X=s.RGBA4),B===s.UNSIGNED_SHORT_5_5_5_1&&(X=s.RGB5_A1)}return(X===s.R16F||X===s.R32F||X===s.RG16F||X===s.RG32F||X===s.RGBA16F||X===s.RGBA32F)&&e.get("EXT_color_buffer_float"),X}function v(C,T){let B;return C?T===null||T===lr||T===Rs?B=s.DEPTH24_STENCIL8:T===Nn?B=s.DEPTH32F_STENCIL8:T===As&&(B=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):T===null||T===lr||T===Rs?B=s.DEPTH_COMPONENT24:T===Nn?B=s.DEPTH_COMPONENT32F:T===As&&(B=s.DEPTH_COMPONENT16),B}function S(C,T){return m(C)===!0||C.isFramebufferTexture&&C.minFilter!==$t&&C.minFilter!==jt?Math.log2(Math.max(T.width,T.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?T.mipmaps.length:1}function A(C){const T=C.target;T.removeEventListener("dispose",A),R(T),T.isVideoTexture&&h.delete(T)}function w(C){const T=C.target;T.removeEventListener("dispose",w),b(T)}function R(C){const T=n.get(C);if(T.__webglInit===void 0)return;const B=C.source,Y=f.get(B);if(Y){const $=Y[T.__cacheKey];$.usedTimes--,$.usedTimes===0&&y(C),Object.keys(Y).length===0&&f.delete(B)}n.remove(C)}function y(C){const T=n.get(C);s.deleteTexture(T.__webglTexture);const B=C.source,Y=f.get(B);delete Y[T.__cacheKey],a.memory.textures--}function b(C){const T=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let Y=0;Y<6;Y++){if(Array.isArray(T.__webglFramebuffer[Y]))for(let $=0;$<T.__webglFramebuffer[Y].length;$++)s.deleteFramebuffer(T.__webglFramebuffer[Y][$]);else s.deleteFramebuffer(T.__webglFramebuffer[Y]);T.__webglDepthbuffer&&s.deleteRenderbuffer(T.__webglDepthbuffer[Y])}else{if(Array.isArray(T.__webglFramebuffer))for(let Y=0;Y<T.__webglFramebuffer.length;Y++)s.deleteFramebuffer(T.__webglFramebuffer[Y]);else s.deleteFramebuffer(T.__webglFramebuffer);if(T.__webglDepthbuffer&&s.deleteRenderbuffer(T.__webglDepthbuffer),T.__webglMultisampledFramebuffer&&s.deleteFramebuffer(T.__webglMultisampledFramebuffer),T.__webglColorRenderbuffer)for(let Y=0;Y<T.__webglColorRenderbuffer.length;Y++)T.__webglColorRenderbuffer[Y]&&s.deleteRenderbuffer(T.__webglColorRenderbuffer[Y]);T.__webglDepthRenderbuffer&&s.deleteRenderbuffer(T.__webglDepthRenderbuffer)}const B=C.textures;for(let Y=0,$=B.length;Y<$;Y++){const X=n.get(B[Y]);X.__webglTexture&&(s.deleteTexture(X.__webglTexture),a.memory.textures--),n.remove(B[Y])}n.remove(C)}let P=0;function D(){P=0}function N(){const C=P;return C>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+i.maxTextures),P+=1,C}function k(C){const T=[];return T.push(C.wrapS),T.push(C.wrapT),T.push(C.wrapR||0),T.push(C.magFilter),T.push(C.minFilter),T.push(C.anisotropy),T.push(C.internalFormat),T.push(C.format),T.push(C.type),T.push(C.generateMipmaps),T.push(C.premultiplyAlpha),T.push(C.flipY),T.push(C.unpackAlignment),T.push(C.colorSpace),T.join()}function z(C,T){const B=n.get(C);if(C.isVideoTexture&&ke(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&B.__version!==C.version){const Y=C.image;if(Y===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Y.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{j(B,C,T);return}}else C.isExternalTexture&&(B.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(s.TEXTURE_2D,B.__webglTexture,s.TEXTURE0+T)}function W(C,T){const B=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){j(B,C,T);return}t.bindTexture(s.TEXTURE_2D_ARRAY,B.__webglTexture,s.TEXTURE0+T)}function q(C,T){const B=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){j(B,C,T);return}t.bindTexture(s.TEXTURE_3D,B.__webglTexture,s.TEXTURE0+T)}function V(C,T){const B=n.get(C);if(C.version>0&&B.__version!==C.version){Z(B,C,T);return}t.bindTexture(s.TEXTURE_CUBE_MAP,B.__webglTexture,s.TEXTURE0+T)}const ie={[Ui]:s.REPEAT,[wi]:s.CLAMP_TO_EDGE,[La]:s.MIRRORED_REPEAT},oe={[$t]:s.NEAREST,[tf]:s.NEAREST_MIPMAP_NEAREST,[_s]:s.NEAREST_MIPMAP_LINEAR,[jt]:s.LINEAR,[Ta]:s.LINEAR_MIPMAP_NEAREST,[li]:s.LINEAR_MIPMAP_LINEAR},ge={[Tp]:s.NEVER,[Cp]:s.ALWAYS,[bp]:s.LESS,[uf]:s.LEQUAL,[Ep]:s.EQUAL,[Rp]:s.GEQUAL,[wp]:s.GREATER,[Ap]:s.NOTEQUAL};function Le(C,T){if(T.type===Nn&&e.has("OES_texture_float_linear")===!1&&(T.magFilter===jt||T.magFilter===Ta||T.magFilter===_s||T.magFilter===li||T.minFilter===jt||T.minFilter===Ta||T.minFilter===_s||T.minFilter===li)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(C,s.TEXTURE_WRAP_S,ie[T.wrapS]),s.texParameteri(C,s.TEXTURE_WRAP_T,ie[T.wrapT]),(C===s.TEXTURE_3D||C===s.TEXTURE_2D_ARRAY)&&s.texParameteri(C,s.TEXTURE_WRAP_R,ie[T.wrapR]),s.texParameteri(C,s.TEXTURE_MAG_FILTER,oe[T.magFilter]),s.texParameteri(C,s.TEXTURE_MIN_FILTER,oe[T.minFilter]),T.compareFunction&&(s.texParameteri(C,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(C,s.TEXTURE_COMPARE_FUNC,ge[T.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(T.magFilter===$t||T.minFilter!==_s&&T.minFilter!==li||T.type===Nn&&e.has("OES_texture_float_linear")===!1)return;if(T.anisotropy>1||n.get(T).__currentAnisotropy){const B=e.get("EXT_texture_filter_anisotropic");s.texParameterf(C,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(T.anisotropy,i.getMaxAnisotropy())),n.get(T).__currentAnisotropy=T.anisotropy}}}function et(C,T){let B=!1;C.__webglInit===void 0&&(C.__webglInit=!0,T.addEventListener("dispose",A));const Y=T.source;let $=f.get(Y);$===void 0&&($={},f.set(Y,$));const X=k(T);if(X!==C.__cacheKey){$[X]===void 0&&($[X]={texture:s.createTexture(),usedTimes:0},a.memory.textures++,B=!0),$[X].usedTimes++;const Te=$[C.__cacheKey];Te!==void 0&&($[C.__cacheKey].usedTimes--,Te.usedTimes===0&&y(T)),C.__cacheKey=X,C.__webglTexture=$[X].texture}return B}function Ke(C,T,B){return Math.floor(Math.floor(C/B)/T)}function He(C,T,B,Y){const X=C.updateRanges;if(X.length===0)t.texSubImage2D(s.TEXTURE_2D,0,0,0,T.width,T.height,B,Y,T.data);else{X.sort((ee,ce)=>ee.start-ce.start);let Te=0;for(let ee=1;ee<X.length;ee++){const ce=X[Te],Ce=X[ee],Se=ce.start+ce.count,ae=Ke(Ce.start,T.width,4),Oe=Ke(ce.start,T.width,4);Ce.start<=Se+1&&ae===Oe&&Ke(Ce.start+Ce.count-1,T.width,4)===ae?ce.count=Math.max(ce.count,Ce.start+Ce.count-ce.start):(++Te,X[Te]=Ce)}X.length=Te+1;const ne=s.getParameter(s.UNPACK_ROW_LENGTH),ye=s.getParameter(s.UNPACK_SKIP_PIXELS),Me=s.getParameter(s.UNPACK_SKIP_ROWS);s.pixelStorei(s.UNPACK_ROW_LENGTH,T.width);for(let ee=0,ce=X.length;ee<ce;ee++){const Ce=X[ee],Se=Math.floor(Ce.start/4),ae=Math.ceil(Ce.count/4),Oe=Se%T.width,U=Math.floor(Se/T.width),te=ae,re=1;s.pixelStorei(s.UNPACK_SKIP_PIXELS,Oe),s.pixelStorei(s.UNPACK_SKIP_ROWS,U),t.texSubImage2D(s.TEXTURE_2D,0,Oe,U,te,re,B,Y,T.data)}C.clearUpdateRanges(),s.pixelStorei(s.UNPACK_ROW_LENGTH,ne),s.pixelStorei(s.UNPACK_SKIP_PIXELS,ye),s.pixelStorei(s.UNPACK_SKIP_ROWS,Me)}}function j(C,T,B){let Y=s.TEXTURE_2D;(T.isDataArrayTexture||T.isCompressedArrayTexture)&&(Y=s.TEXTURE_2D_ARRAY),T.isData3DTexture&&(Y=s.TEXTURE_3D);const $=et(C,T),X=T.source;t.bindTexture(Y,C.__webglTexture,s.TEXTURE0+B);const Te=n.get(X);if(X.version!==Te.__version||$===!0){t.activeTexture(s.TEXTURE0+B);const ne=Ze.getPrimaries(Ze.workingColorSpace),ye=T.colorSpace===oi?null:Ze.getPrimaries(T.colorSpace),Me=T.colorSpace===oi||ne===ye?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,T.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,T.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Me);let ee=g(T.image,!1,i.maxTextureSize);ee=Pt(T,ee);const ce=r.convert(T.format,T.colorSpace),Ce=r.convert(T.type);let Se=x(T.internalFormat,ce,Ce,T.colorSpace,T.isVideoTexture);Le(Y,T);let ae;const Oe=T.mipmaps,U=T.isVideoTexture!==!0,te=Te.__version===void 0||$===!0,re=X.dataReady,fe=S(T,ee);if(T.isDepthTexture)Se=v(T.format===Ps,T.type),te&&(U?t.texStorage2D(s.TEXTURE_2D,1,Se,ee.width,ee.height):t.texImage2D(s.TEXTURE_2D,0,Se,ee.width,ee.height,0,ce,Ce,null));else if(T.isDataTexture)if(Oe.length>0){U&&te&&t.texStorage2D(s.TEXTURE_2D,fe,Se,Oe[0].width,Oe[0].height);for(let J=0,K=Oe.length;J<K;J++)ae=Oe[J],U?re&&t.texSubImage2D(s.TEXTURE_2D,J,0,0,ae.width,ae.height,ce,Ce,ae.data):t.texImage2D(s.TEXTURE_2D,J,Se,ae.width,ae.height,0,ce,Ce,ae.data);T.generateMipmaps=!1}else U?(te&&t.texStorage2D(s.TEXTURE_2D,fe,Se,ee.width,ee.height),re&&He(T,ee,ce,Ce)):t.texImage2D(s.TEXTURE_2D,0,Se,ee.width,ee.height,0,ce,Ce,ee.data);else if(T.isCompressedTexture)if(T.isCompressedArrayTexture){U&&te&&t.texStorage3D(s.TEXTURE_2D_ARRAY,fe,Se,Oe[0].width,Oe[0].height,ee.depth);for(let J=0,K=Oe.length;J<K;J++)if(ae=Oe[J],T.format!==nn)if(ce!==null)if(U){if(re)if(T.layerUpdates.size>0){const _e=tu(ae.width,ae.height,T.format,T.type);for(const Ue of T.layerUpdates){const lt=ae.data.subarray(Ue*_e/ae.data.BYTES_PER_ELEMENT,(Ue+1)*_e/ae.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,J,0,0,Ue,ae.width,ae.height,1,ce,lt)}T.clearLayerUpdates()}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,J,0,0,0,ae.width,ae.height,ee.depth,ce,ae.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,J,Se,ae.width,ae.height,ee.depth,0,ae.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else U?re&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,J,0,0,0,ae.width,ae.height,ee.depth,ce,Ce,ae.data):t.texImage3D(s.TEXTURE_2D_ARRAY,J,Se,ae.width,ae.height,ee.depth,0,ce,Ce,ae.data)}else{U&&te&&t.texStorage2D(s.TEXTURE_2D,fe,Se,Oe[0].width,Oe[0].height);for(let J=0,K=Oe.length;J<K;J++)ae=Oe[J],T.format!==nn?ce!==null?U?re&&t.compressedTexSubImage2D(s.TEXTURE_2D,J,0,0,ae.width,ae.height,ce,ae.data):t.compressedTexImage2D(s.TEXTURE_2D,J,Se,ae.width,ae.height,0,ae.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):U?re&&t.texSubImage2D(s.TEXTURE_2D,J,0,0,ae.width,ae.height,ce,Ce,ae.data):t.texImage2D(s.TEXTURE_2D,J,Se,ae.width,ae.height,0,ce,Ce,ae.data)}else if(T.isDataArrayTexture)if(U){if(te&&t.texStorage3D(s.TEXTURE_2D_ARRAY,fe,Se,ee.width,ee.height,ee.depth),re)if(T.layerUpdates.size>0){const J=tu(ee.width,ee.height,T.format,T.type);for(const K of T.layerUpdates){const _e=ee.data.subarray(K*J/ee.data.BYTES_PER_ELEMENT,(K+1)*J/ee.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,K,ee.width,ee.height,1,ce,Ce,_e)}T.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,ee.width,ee.height,ee.depth,ce,Ce,ee.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,Se,ee.width,ee.height,ee.depth,0,ce,Ce,ee.data);else if(T.isData3DTexture)U?(te&&t.texStorage3D(s.TEXTURE_3D,fe,Se,ee.width,ee.height,ee.depth),re&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,ee.width,ee.height,ee.depth,ce,Ce,ee.data)):t.texImage3D(s.TEXTURE_3D,0,Se,ee.width,ee.height,ee.depth,0,ce,Ce,ee.data);else if(T.isFramebufferTexture){if(te)if(U)t.texStorage2D(s.TEXTURE_2D,fe,Se,ee.width,ee.height);else{let J=ee.width,K=ee.height;for(let _e=0;_e<fe;_e++)t.texImage2D(s.TEXTURE_2D,_e,Se,J,K,0,ce,Ce,null),J>>=1,K>>=1}}else if(Oe.length>0){if(U&&te){const J=St(Oe[0]);t.texStorage2D(s.TEXTURE_2D,fe,Se,J.width,J.height)}for(let J=0,K=Oe.length;J<K;J++)ae=Oe[J],U?re&&t.texSubImage2D(s.TEXTURE_2D,J,0,0,ce,Ce,ae):t.texImage2D(s.TEXTURE_2D,J,Se,ce,Ce,ae);T.generateMipmaps=!1}else if(U){if(te){const J=St(ee);t.texStorage2D(s.TEXTURE_2D,fe,Se,J.width,J.height)}re&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,ce,Ce,ee)}else t.texImage2D(s.TEXTURE_2D,0,Se,ce,Ce,ee);m(T)&&p(Y),Te.__version=X.version,T.onUpdate&&T.onUpdate(T)}C.__version=T.version}function Z(C,T,B){if(T.image.length!==6)return;const Y=et(C,T),$=T.source;t.bindTexture(s.TEXTURE_CUBE_MAP,C.__webglTexture,s.TEXTURE0+B);const X=n.get($);if($.version!==X.__version||Y===!0){t.activeTexture(s.TEXTURE0+B);const Te=Ze.getPrimaries(Ze.workingColorSpace),ne=T.colorSpace===oi?null:Ze.getPrimaries(T.colorSpace),ye=T.colorSpace===oi||Te===ne?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,T.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,T.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,ye);const Me=T.isCompressedTexture||T.image[0].isCompressedTexture,ee=T.image[0]&&T.image[0].isDataTexture,ce=[];for(let K=0;K<6;K++)!Me&&!ee?ce[K]=g(T.image[K],!0,i.maxCubemapSize):ce[K]=ee?T.image[K].image:T.image[K],ce[K]=Pt(T,ce[K]);const Ce=ce[0],Se=r.convert(T.format,T.colorSpace),ae=r.convert(T.type),Oe=x(T.internalFormat,Se,ae,T.colorSpace),U=T.isVideoTexture!==!0,te=X.__version===void 0||Y===!0,re=$.dataReady;let fe=S(T,Ce);Le(s.TEXTURE_CUBE_MAP,T);let J;if(Me){U&&te&&t.texStorage2D(s.TEXTURE_CUBE_MAP,fe,Oe,Ce.width,Ce.height);for(let K=0;K<6;K++){J=ce[K].mipmaps;for(let _e=0;_e<J.length;_e++){const Ue=J[_e];T.format!==nn?Se!==null?U?re&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,_e,0,0,Ue.width,Ue.height,Se,Ue.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,_e,Oe,Ue.width,Ue.height,0,Ue.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):U?re&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,_e,0,0,Ue.width,Ue.height,Se,ae,Ue.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,_e,Oe,Ue.width,Ue.height,0,Se,ae,Ue.data)}}}else{if(J=T.mipmaps,U&&te){J.length>0&&fe++;const K=St(ce[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,fe,Oe,K.width,K.height)}for(let K=0;K<6;K++)if(ee){U?re&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,ce[K].width,ce[K].height,Se,ae,ce[K].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Oe,ce[K].width,ce[K].height,0,Se,ae,ce[K].data);for(let _e=0;_e<J.length;_e++){const lt=J[_e].image[K].image;U?re&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,_e+1,0,0,lt.width,lt.height,Se,ae,lt.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,_e+1,Oe,lt.width,lt.height,0,Se,ae,lt.data)}}else{U?re&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,Se,ae,ce[K]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Oe,Se,ae,ce[K]);for(let _e=0;_e<J.length;_e++){const Ue=J[_e];U?re&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,_e+1,0,0,Se,ae,Ue.image[K]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,_e+1,Oe,Se,ae,Ue.image[K])}}}m(T)&&p(s.TEXTURE_CUBE_MAP),X.__version=$.version,T.onUpdate&&T.onUpdate(T)}C.__version=T.version}function de(C,T,B,Y,$,X){const Te=r.convert(B.format,B.colorSpace),ne=r.convert(B.type),ye=x(B.internalFormat,Te,ne,B.colorSpace),Me=n.get(T),ee=n.get(B);if(ee.__renderTarget=T,!Me.__hasExternalTextures){const ce=Math.max(1,T.width>>X),Ce=Math.max(1,T.height>>X);$===s.TEXTURE_3D||$===s.TEXTURE_2D_ARRAY?t.texImage3D($,X,ye,ce,Ce,T.depth,0,Te,ne,null):t.texImage2D($,X,ye,ce,Ce,0,Te,ne,null)}t.bindFramebuffer(s.FRAMEBUFFER,C),xe(T)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,Y,$,ee.__webglTexture,0,ft(T)):($===s.TEXTURE_2D||$>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&$<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,Y,$,ee.__webglTexture,X),t.bindFramebuffer(s.FRAMEBUFFER,null)}function Ie(C,T,B){if(s.bindRenderbuffer(s.RENDERBUFFER,C),T.depthBuffer){const Y=T.depthTexture,$=Y&&Y.isDepthTexture?Y.type:null,X=v(T.stencilBuffer,$),Te=T.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ne=ft(T);xe(T)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ne,X,T.width,T.height):B?s.renderbufferStorageMultisample(s.RENDERBUFFER,ne,X,T.width,T.height):s.renderbufferStorage(s.RENDERBUFFER,X,T.width,T.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,Te,s.RENDERBUFFER,C)}else{const Y=T.textures;for(let $=0;$<Y.length;$++){const X=Y[$],Te=r.convert(X.format,X.colorSpace),ne=r.convert(X.type),ye=x(X.internalFormat,Te,ne,X.colorSpace),Me=ft(T);B&&xe(T)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,Me,ye,T.width,T.height):xe(T)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Me,ye,T.width,T.height):s.renderbufferStorage(s.RENDERBUFFER,ye,T.width,T.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function be(C,T){if(T&&T.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(s.FRAMEBUFFER,C),!(T.depthTexture&&T.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const Y=n.get(T.depthTexture);Y.__renderTarget=T,(!Y.__webglTexture||T.depthTexture.image.width!==T.width||T.depthTexture.image.height!==T.height)&&(T.depthTexture.image.width=T.width,T.depthTexture.image.height=T.height,T.depthTexture.needsUpdate=!0),z(T.depthTexture,0);const $=Y.__webglTexture,X=ft(T);if(T.depthTexture.format===Cs)xe(T)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,$,0,X):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,$,0);else if(T.depthTexture.format===Ps)xe(T)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,$,0,X):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,$,0);else throw new Error("Unknown depthTexture format")}function $e(C){const T=n.get(C),B=C.isWebGLCubeRenderTarget===!0;if(T.__boundDepthTexture!==C.depthTexture){const Y=C.depthTexture;if(T.__depthDisposeCallback&&T.__depthDisposeCallback(),Y){const $=()=>{delete T.__boundDepthTexture,delete T.__depthDisposeCallback,Y.removeEventListener("dispose",$)};Y.addEventListener("dispose",$),T.__depthDisposeCallback=$}T.__boundDepthTexture=Y}if(C.depthTexture&&!T.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");const Y=C.texture.mipmaps;Y&&Y.length>0?be(T.__webglFramebuffer[0],C):be(T.__webglFramebuffer,C)}else if(B){T.__webglDepthbuffer=[];for(let Y=0;Y<6;Y++)if(t.bindFramebuffer(s.FRAMEBUFFER,T.__webglFramebuffer[Y]),T.__webglDepthbuffer[Y]===void 0)T.__webglDepthbuffer[Y]=s.createRenderbuffer(),Ie(T.__webglDepthbuffer[Y],C,!1);else{const $=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,X=T.__webglDepthbuffer[Y];s.bindRenderbuffer(s.RENDERBUFFER,X),s.framebufferRenderbuffer(s.FRAMEBUFFER,$,s.RENDERBUFFER,X)}}else{const Y=C.texture.mipmaps;if(Y&&Y.length>0?t.bindFramebuffer(s.FRAMEBUFFER,T.__webglFramebuffer[0]):t.bindFramebuffer(s.FRAMEBUFFER,T.__webglFramebuffer),T.__webglDepthbuffer===void 0)T.__webglDepthbuffer=s.createRenderbuffer(),Ie(T.__webglDepthbuffer,C,!1);else{const $=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,X=T.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,X),s.framebufferRenderbuffer(s.FRAMEBUFFER,$,s.RENDERBUFFER,X)}}t.bindFramebuffer(s.FRAMEBUFFER,null)}function Ft(C,T,B){const Y=n.get(C);T!==void 0&&de(Y.__webglFramebuffer,C,C.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),B!==void 0&&$e(C)}function L(C){const T=C.texture,B=n.get(C),Y=n.get(T);C.addEventListener("dispose",w);const $=C.textures,X=C.isWebGLCubeRenderTarget===!0,Te=$.length>1;if(Te||(Y.__webglTexture===void 0&&(Y.__webglTexture=s.createTexture()),Y.__version=T.version,a.memory.textures++),X){B.__webglFramebuffer=[];for(let ne=0;ne<6;ne++)if(T.mipmaps&&T.mipmaps.length>0){B.__webglFramebuffer[ne]=[];for(let ye=0;ye<T.mipmaps.length;ye++)B.__webglFramebuffer[ne][ye]=s.createFramebuffer()}else B.__webglFramebuffer[ne]=s.createFramebuffer()}else{if(T.mipmaps&&T.mipmaps.length>0){B.__webglFramebuffer=[];for(let ne=0;ne<T.mipmaps.length;ne++)B.__webglFramebuffer[ne]=s.createFramebuffer()}else B.__webglFramebuffer=s.createFramebuffer();if(Te)for(let ne=0,ye=$.length;ne<ye;ne++){const Me=n.get($[ne]);Me.__webglTexture===void 0&&(Me.__webglTexture=s.createTexture(),a.memory.textures++)}if(C.samples>0&&xe(C)===!1){B.__webglMultisampledFramebuffer=s.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let ne=0;ne<$.length;ne++){const ye=$[ne];B.__webglColorRenderbuffer[ne]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,B.__webglColorRenderbuffer[ne]);const Me=r.convert(ye.format,ye.colorSpace),ee=r.convert(ye.type),ce=x(ye.internalFormat,Me,ee,ye.colorSpace,C.isXRRenderTarget===!0),Ce=ft(C);s.renderbufferStorageMultisample(s.RENDERBUFFER,Ce,ce,C.width,C.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ne,s.RENDERBUFFER,B.__webglColorRenderbuffer[ne])}s.bindRenderbuffer(s.RENDERBUFFER,null),C.depthBuffer&&(B.__webglDepthRenderbuffer=s.createRenderbuffer(),Ie(B.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(X){t.bindTexture(s.TEXTURE_CUBE_MAP,Y.__webglTexture),Le(s.TEXTURE_CUBE_MAP,T);for(let ne=0;ne<6;ne++)if(T.mipmaps&&T.mipmaps.length>0)for(let ye=0;ye<T.mipmaps.length;ye++)de(B.__webglFramebuffer[ne][ye],C,T,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,ye);else de(B.__webglFramebuffer[ne],C,T,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0);m(T)&&p(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Te){for(let ne=0,ye=$.length;ne<ye;ne++){const Me=$[ne],ee=n.get(Me);let ce=s.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(ce=C.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(ce,ee.__webglTexture),Le(ce,Me),de(B.__webglFramebuffer,C,Me,s.COLOR_ATTACHMENT0+ne,ce,0),m(Me)&&p(ce)}t.unbindTexture()}else{let ne=s.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(ne=C.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(ne,Y.__webglTexture),Le(ne,T),T.mipmaps&&T.mipmaps.length>0)for(let ye=0;ye<T.mipmaps.length;ye++)de(B.__webglFramebuffer[ye],C,T,s.COLOR_ATTACHMENT0,ne,ye);else de(B.__webglFramebuffer,C,T,s.COLOR_ATTACHMENT0,ne,0);m(T)&&p(ne),t.unbindTexture()}C.depthBuffer&&$e(C)}function ut(C){const T=C.textures;for(let B=0,Y=T.length;B<Y;B++){const $=T[B];if(m($)){const X=M(C),Te=n.get($).__webglTexture;t.bindTexture(X,Te),p(X),t.unbindTexture()}}}const Fe=[],Pe=[];function ve(C){if(C.samples>0){if(xe(C)===!1){const T=C.textures,B=C.width,Y=C.height;let $=s.COLOR_BUFFER_BIT;const X=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Te=n.get(C),ne=T.length>1;if(ne)for(let Me=0;Me<T.length;Me++)t.bindFramebuffer(s.FRAMEBUFFER,Te.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Me,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,Te.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Me,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,Te.__webglMultisampledFramebuffer);const ye=C.texture.mipmaps;ye&&ye.length>0?t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Te.__webglFramebuffer[0]):t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Te.__webglFramebuffer);for(let Me=0;Me<T.length;Me++){if(C.resolveDepthBuffer&&(C.depthBuffer&&($|=s.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&($|=s.STENCIL_BUFFER_BIT)),ne){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,Te.__webglColorRenderbuffer[Me]);const ee=n.get(T[Me]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,ee,0)}s.blitFramebuffer(0,0,B,Y,0,0,B,Y,$,s.NEAREST),l===!0&&(Fe.length=0,Pe.length=0,Fe.push(s.COLOR_ATTACHMENT0+Me),C.depthBuffer&&C.resolveDepthBuffer===!1&&(Fe.push(X),Pe.push(X),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,Pe)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,Fe))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),ne)for(let Me=0;Me<T.length;Me++){t.bindFramebuffer(s.FRAMEBUFFER,Te.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Me,s.RENDERBUFFER,Te.__webglColorRenderbuffer[Me]);const ee=n.get(T[Me]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,Te.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Me,s.TEXTURE_2D,ee,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Te.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){const T=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[T])}}}function ft(C){return Math.min(i.maxSamples,C.samples)}function xe(C){const T=n.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&T.__useRenderToTexture!==!1}function ke(C){const T=a.render.frame;h.get(C)!==T&&(h.set(C,T),C.update())}function Pt(C,T){const B=C.colorSpace,Y=C.format,$=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||B!==Zt&&B!==oi&&(Ze.getTransfer(B)===rt?(Y!==nn||$!==xn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",B)),T}function St(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=N,this.resetTextureUnits=D,this.setTexture2D=z,this.setTexture2DArray=W,this.setTexture3D=q,this.setTextureCube=V,this.rebindTextures=Ft,this.setupRenderTarget=L,this.updateRenderTargetMipmap=ut,this.updateMultisampleRenderTarget=ve,this.setupDepthRenderbuffer=$e,this.setupFrameBufferTexture=de,this.useMultisampledRTT=xe}function Ux(s,e){function t(n,i=oi){let r;const a=Ze.getTransfer(i);if(n===xn)return s.UNSIGNED_BYTE;if(n===fc)return s.UNSIGNED_SHORT_4_4_4_4;if(n===dc)return s.UNSIGNED_SHORT_5_5_5_1;if(n===sf)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===af)return s.UNSIGNED_INT_10F_11F_11F_REV;if(n===nf)return s.BYTE;if(n===rf)return s.SHORT;if(n===As)return s.UNSIGNED_SHORT;if(n===uc)return s.INT;if(n===lr)return s.UNSIGNED_INT;if(n===Nn)return s.FLOAT;if(n===Bi)return s.HALF_FLOAT;if(n===of)return s.ALPHA;if(n===lf)return s.RGB;if(n===nn)return s.RGBA;if(n===Cs)return s.DEPTH_COMPONENT;if(n===Ps)return s.DEPTH_STENCIL;if(n===pc)return s.RED;if(n===mc)return s.RED_INTEGER;if(n===cf)return s.RG;if(n===gc)return s.RG_INTEGER;if(n===_c)return s.RGBA_INTEGER;if(n===ba||n===Ea||n===wa||n===Aa)if(a===rt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===ba)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ea)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===wa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Aa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===ba)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ea)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===wa)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Aa)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===ll||n===cl||n===hl||n===ul)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===ll)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===cl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===hl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ul)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===fl||n===dl||n===pl)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===fl||n===dl)return a===rt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===pl)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===ml||n===gl||n===_l||n===vl||n===xl||n===yl||n===Ml||n===Sl||n===Tl||n===bl||n===El||n===wl||n===Al||n===Rl)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===ml)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===gl)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===_l)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===vl)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===xl)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===yl)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ml)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Sl)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Tl)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===bl)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===El)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===wl)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Al)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Rl)return a===rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Cl||n===Pl||n===Dl)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Cl)return a===rt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Pl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Dl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Ll||n===Il||n===Ul||n===Nl)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Ll)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Il)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Ul)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Nl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Rs?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:t}}const Nx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Fx=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Ox{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new Ef(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new Ut({vertexShader:Nx,fragmentShader:Fx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new We(new Yn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Bx extends Qr{constructor(e,t){super();const n=this;let i=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,f=null,d=null,_=null;const g=typeof XRWebGLBinding<"u",m=new Ox,p={},M=t.getContextAttributes();let x=null,v=null;const S=[],A=[],w=new ue;let R=null;const y=new kt;y.viewport=new qe;const b=new kt;b.viewport=new qe;const P=[y,b],D=new Km;let N=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(j){let Z=S[j];return Z===void 0&&(Z=new Eo,S[j]=Z),Z.getTargetRaySpace()},this.getControllerGrip=function(j){let Z=S[j];return Z===void 0&&(Z=new Eo,S[j]=Z),Z.getGripSpace()},this.getHand=function(j){let Z=S[j];return Z===void 0&&(Z=new Eo,S[j]=Z),Z.getHandSpace()};function z(j){const Z=A.indexOf(j.inputSource);if(Z===-1)return;const de=S[Z];de!==void 0&&(de.update(j.inputSource,j.frame,c||a),de.dispatchEvent({type:j.type,data:j.inputSource}))}function W(){i.removeEventListener("select",z),i.removeEventListener("selectstart",z),i.removeEventListener("selectend",z),i.removeEventListener("squeeze",z),i.removeEventListener("squeezestart",z),i.removeEventListener("squeezeend",z),i.removeEventListener("end",W),i.removeEventListener("inputsourceschange",q);for(let j=0;j<S.length;j++){const Z=A[j];Z!==null&&(A[j]=null,S[j].disconnect(Z))}N=null,k=null,m.reset();for(const j in p)delete p[j];e.setRenderTarget(x),d=null,f=null,u=null,i=null,v=null,He.stop(),n.isPresenting=!1,e.setPixelRatio(R),e.setSize(w.width,w.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(j){r=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(j){o=j,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(j){c=j},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return u===null&&g&&(u=new XRWebGLBinding(i,t)),u},this.getFrame=function(){return _},this.getSession=function(){return i},this.setSession=async function(j){if(i=j,i!==null){if(x=e.getRenderTarget(),i.addEventListener("select",z),i.addEventListener("selectstart",z),i.addEventListener("selectend",z),i.addEventListener("squeeze",z),i.addEventListener("squeezestart",z),i.addEventListener("squeezeend",z),i.addEventListener("end",W),i.addEventListener("inputsourceschange",q),M.xrCompatible!==!0&&await t.makeXRCompatible(),R=e.getPixelRatio(),e.getSize(w),g&&"createProjectionLayer"in XRWebGLBinding.prototype){let de=null,Ie=null,be=null;M.depth&&(be=M.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,de=M.stencil?Ps:Cs,Ie=M.stencil?Rs:lr);const $e={colorFormat:t.RGBA8,depthFormat:be,scaleFactor:r};u=this.getBinding(),f=u.createProjectionLayer($e),i.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),v=new qn(f.textureWidth,f.textureHeight,{format:nn,type:xn,depthTexture:new bf(f.textureWidth,f.textureHeight,Ie,void 0,void 0,void 0,void 0,void 0,void 0,de),stencilBuffer:M.stencil,colorSpace:e.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{const de={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(i,t,de),i.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),v=new qn(d.framebufferWidth,d.framebufferHeight,{format:nn,type:xn,colorSpace:e.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await i.requestReferenceSpace(o),He.setContext(i),He.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function q(j){for(let Z=0;Z<j.removed.length;Z++){const de=j.removed[Z],Ie=A.indexOf(de);Ie>=0&&(A[Ie]=null,S[Ie].disconnect(de))}for(let Z=0;Z<j.added.length;Z++){const de=j.added[Z];let Ie=A.indexOf(de);if(Ie===-1){for(let $e=0;$e<S.length;$e++)if($e>=A.length){A.push(de),Ie=$e;break}else if(A[$e]===null){A[$e]=de,Ie=$e;break}if(Ie===-1)break}const be=S[Ie];be&&be.connect(de)}}const V=new I,ie=new I;function oe(j,Z,de){V.setFromMatrixPosition(Z.matrixWorld),ie.setFromMatrixPosition(de.matrixWorld);const Ie=V.distanceTo(ie),be=Z.projectionMatrix.elements,$e=de.projectionMatrix.elements,Ft=be[14]/(be[10]-1),L=be[14]/(be[10]+1),ut=(be[9]+1)/be[5],Fe=(be[9]-1)/be[5],Pe=(be[8]-1)/be[0],ve=($e[8]+1)/$e[0],ft=Ft*Pe,xe=Ft*ve,ke=Ie/(-Pe+ve),Pt=ke*-Pe;if(Z.matrixWorld.decompose(j.position,j.quaternion,j.scale),j.translateX(Pt),j.translateZ(ke),j.matrixWorld.compose(j.position,j.quaternion,j.scale),j.matrixWorldInverse.copy(j.matrixWorld).invert(),be[10]===-1)j.projectionMatrix.copy(Z.projectionMatrix),j.projectionMatrixInverse.copy(Z.projectionMatrixInverse);else{const St=Ft+ke,C=L+ke,T=ft-Pt,B=xe+(Ie-Pt),Y=ut*L/C*St,$=Fe*L/C*St;j.projectionMatrix.makePerspective(T,B,Y,$,St,C),j.projectionMatrixInverse.copy(j.projectionMatrix).invert()}}function ge(j,Z){Z===null?j.matrixWorld.copy(j.matrix):j.matrixWorld.multiplyMatrices(Z.matrixWorld,j.matrix),j.matrixWorldInverse.copy(j.matrixWorld).invert()}this.updateCamera=function(j){if(i===null)return;let Z=j.near,de=j.far;m.texture!==null&&(m.depthNear>0&&(Z=m.depthNear),m.depthFar>0&&(de=m.depthFar)),D.near=b.near=y.near=Z,D.far=b.far=y.far=de,(N!==D.near||k!==D.far)&&(i.updateRenderState({depthNear:D.near,depthFar:D.far}),N=D.near,k=D.far),D.layers.mask=j.layers.mask|6,y.layers.mask=D.layers.mask&3,b.layers.mask=D.layers.mask&5;const Ie=j.parent,be=D.cameras;ge(D,Ie);for(let $e=0;$e<be.length;$e++)ge(be[$e],Ie);be.length===2?oe(D,y,b):D.projectionMatrix.copy(y.projectionMatrix),Le(j,D,Ie)};function Le(j,Z,de){de===null?j.matrix.copy(Z.matrixWorld):(j.matrix.copy(de.matrixWorld),j.matrix.invert(),j.matrix.multiply(Z.matrixWorld)),j.matrix.decompose(j.position,j.quaternion,j.scale),j.updateMatrixWorld(!0),j.projectionMatrix.copy(Z.projectionMatrix),j.projectionMatrixInverse.copy(Z.projectionMatrixInverse),j.isPerspectiveCamera&&(j.fov=Gr*2*Math.atan(1/j.projectionMatrix.elements[5]),j.zoom=1)}this.getCamera=function(){return D},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function(j){l=j,f!==null&&(f.fixedFoveation=j),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=j)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(D)},this.getCameraTexture=function(j){return p[j]};let et=null;function Ke(j,Z){if(h=Z.getViewerPose(c||a),_=Z,h!==null){const de=h.views;d!==null&&(e.setRenderTargetFramebuffer(v,d.framebuffer),e.setRenderTarget(v));let Ie=!1;de.length!==D.cameras.length&&(D.cameras.length=0,Ie=!0);for(let L=0;L<de.length;L++){const ut=de[L];let Fe=null;if(d!==null)Fe=d.getViewport(ut);else{const ve=u.getViewSubImage(f,ut);Fe=ve.viewport,L===0&&(e.setRenderTargetTextures(v,ve.colorTexture,ve.depthStencilTexture),e.setRenderTarget(v))}let Pe=P[L];Pe===void 0&&(Pe=new kt,Pe.layers.enable(L),Pe.viewport=new qe,P[L]=Pe),Pe.matrix.fromArray(ut.transform.matrix),Pe.matrix.decompose(Pe.position,Pe.quaternion,Pe.scale),Pe.projectionMatrix.fromArray(ut.projectionMatrix),Pe.projectionMatrixInverse.copy(Pe.projectionMatrix).invert(),Pe.viewport.set(Fe.x,Fe.y,Fe.width,Fe.height),L===0&&(D.matrix.copy(Pe.matrix),D.matrix.decompose(D.position,D.quaternion,D.scale)),Ie===!0&&D.cameras.push(Pe)}const be=i.enabledFeatures;if(be&&be.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&g){u=n.getBinding();const L=u.getDepthInformation(de[0]);L&&L.isValid&&L.texture&&m.init(L,i.renderState)}if(be&&be.includes("camera-access")&&g){e.state.unbindTexture(),u=n.getBinding();for(let L=0;L<de.length;L++){const ut=de[L].camera;if(ut){let Fe=p[ut];Fe||(Fe=new Ef,p[ut]=Fe);const Pe=u.getCameraImage(ut);Fe.sourceTexture=Pe}}}}for(let de=0;de<S.length;de++){const Ie=A[de],be=S[de];Ie!==null&&be!==void 0&&be.update(Ie,Z,c||a)}et&&et(j,Z),Z.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Z}),_=null}const He=new Pf;He.setAnimationLoop(Ke),this.setAnimationLoop=function(j){et=j},this.dispose=function(){}}}const Yi=new rn,kx=new Ne;function zx(s,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,_f(s)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function i(m,p,M,x,v){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),u(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p)):p.isMeshStandardMaterial?(r(m,p),f(m,p),p.isMeshPhysicalMaterial&&d(m,p,v)):p.isMeshMatcapMaterial?(r(m,p),_(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),g(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,M,x):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Kt&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Kt&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const M=e.get(p),x=M.envMap,v=M.envMapRotation;x&&(m.envMap.value=x,Yi.copy(v),Yi.x*=-1,Yi.y*=-1,Yi.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(Yi.y*=-1,Yi.z*=-1),m.envMapRotation.value.setFromMatrix4(kx.makeRotationFromEuler(Yi)),m.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,M,x){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*M,m.scale.value=x*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function f(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function d(m,p,M){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Kt&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=M.texture,m.transmissionSamplerSize.value.set(M.width,M.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,p){p.matcap&&(m.matcap.value=p.matcap)}function g(m,p){const M=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(M.matrixWorld),m.nearDistance.value=M.shadow.camera.near,m.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function Hx(s,e,t,n){let i={},r={},a=[];const o=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(M,x){const v=x.program;n.uniformBlockBinding(M,v)}function c(M,x){let v=i[M.id];v===void 0&&(_(M),v=h(M),i[M.id]=v,M.addEventListener("dispose",m));const S=x.program;n.updateUBOMapping(M,S);const A=e.render.frame;r[M.id]!==A&&(f(M),r[M.id]=A)}function h(M){const x=u();M.__bindingPointIndex=x;const v=s.createBuffer(),S=M.__size,A=M.usage;return s.bindBuffer(s.UNIFORM_BUFFER,v),s.bufferData(s.UNIFORM_BUFFER,S,A),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,x,v),v}function u(){for(let M=0;M<o;M++)if(a.indexOf(M)===-1)return a.push(M),M;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(M){const x=i[M.id],v=M.uniforms,S=M.__cache;s.bindBuffer(s.UNIFORM_BUFFER,x);for(let A=0,w=v.length;A<w;A++){const R=Array.isArray(v[A])?v[A]:[v[A]];for(let y=0,b=R.length;y<b;y++){const P=R[y];if(d(P,A,y,S)===!0){const D=P.__offset,N=Array.isArray(P.value)?P.value:[P.value];let k=0;for(let z=0;z<N.length;z++){const W=N[z],q=g(W);typeof W=="number"||typeof W=="boolean"?(P.__data[0]=W,s.bufferSubData(s.UNIFORM_BUFFER,D+k,P.__data)):W.isMatrix3?(P.__data[0]=W.elements[0],P.__data[1]=W.elements[1],P.__data[2]=W.elements[2],P.__data[3]=0,P.__data[4]=W.elements[3],P.__data[5]=W.elements[4],P.__data[6]=W.elements[5],P.__data[7]=0,P.__data[8]=W.elements[6],P.__data[9]=W.elements[7],P.__data[10]=W.elements[8],P.__data[11]=0):(W.toArray(P.__data,k),k+=q.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,D,P.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function d(M,x,v,S){const A=M.value,w=x+"_"+v;if(S[w]===void 0)return typeof A=="number"||typeof A=="boolean"?S[w]=A:S[w]=A.clone(),!0;{const R=S[w];if(typeof A=="number"||typeof A=="boolean"){if(R!==A)return S[w]=A,!0}else if(R.equals(A)===!1)return R.copy(A),!0}return!1}function _(M){const x=M.uniforms;let v=0;const S=16;for(let w=0,R=x.length;w<R;w++){const y=Array.isArray(x[w])?x[w]:[x[w]];for(let b=0,P=y.length;b<P;b++){const D=y[b],N=Array.isArray(D.value)?D.value:[D.value];for(let k=0,z=N.length;k<z;k++){const W=N[k],q=g(W),V=v%S,ie=V%q.boundary,oe=V+ie;v+=ie,oe!==0&&S-oe<q.storage&&(v+=S-oe),D.__data=new Float32Array(q.storage/Float32Array.BYTES_PER_ELEMENT),D.__offset=v,v+=q.storage}}}const A=v%S;return A>0&&(v+=S-A),M.__size=v,M.__cache={},this}function g(M){const x={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(x.boundary=4,x.storage=4):M.isVector2?(x.boundary=8,x.storage=8):M.isVector3||M.isColor?(x.boundary=16,x.storage=12):M.isVector4?(x.boundary=16,x.storage=16):M.isMatrix3?(x.boundary=48,x.storage=48):M.isMatrix4?(x.boundary=64,x.storage=64):M.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",M),x}function m(M){const x=M.target;x.removeEventListener("dispose",m);const v=a.indexOf(x.__bindingPointIndex);a.splice(v,1),s.deleteBuffer(i[x.id]),delete i[x.id],delete r[x.id]}function p(){for(const M in i)s.deleteBuffer(i[M]);a=[],i={},r={}}return{bind:l,update:c,dispose:p}}class Vx{constructor(e={}){const{canvas:t=Yp(),context:n=null,depth:i=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=a;const _=new Uint32Array(4),g=new Int32Array(4);let m=null,p=null;const M=[],x=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ui,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const v=this;let S=!1;this._outputColorSpace=wt;let A=0,w=0,R=null,y=-1,b=null;const P=new qe,D=new qe;let N=null;const k=new me(0);let z=0,W=t.width,q=t.height,V=1,ie=null,oe=null;const ge=new qe(0,0,W,q),Le=new qe(0,0,W,q);let et=!1;const Ke=new Ec;let He=!1,j=!1;const Z=new Ne,de=new I,Ie=new qe,be={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let $e=!1;function Ft(){return R===null?V:1}let L=n;function ut(E,F){return t.getContext(E,F)}try{const E={alpha:!0,depth:i,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${cc}`),t.addEventListener("webglcontextlost",re,!1),t.addEventListener("webglcontextrestored",fe,!1),t.addEventListener("webglcontextcreationerror",J,!1),L===null){const F="webgl2";if(L=ut(F,E),L===null)throw ut(F)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let Fe,Pe,ve,ft,xe,ke,Pt,St,C,T,B,Y,$,X,Te,ne,ye,Me,ee,ce,Ce,Se,ae,Oe;function U(){Fe=new J0(L),Fe.init(),Se=new Ux(L,Fe),Pe=new X0(L,Fe,e,Se),ve=new Lx(L,Fe),Pe.reversedDepthBuffer&&f&&ve.buffers.depth.setReversed(!0),ft=new tv(L),xe=new xx,ke=new Ix(L,Fe,ve,xe,Pe,Se,ft),Pt=new Y0(v),St=new Z0(v),C=new og(L),ae=new G0(L,C),T=new Q0(L,C,ft,ae),B=new iv(L,T,C,ft),ee=new nv(L,Pe,ke),ne=new q0(xe),Y=new vx(v,Pt,St,Fe,Pe,ae,ne),$=new zx(v,xe),X=new Mx,Te=new Ax(Fe),Me=new V0(v,Pt,St,ve,B,d,l),ye=new Px(v,B,Pe),Oe=new Hx(L,ft,Pe,ve),ce=new W0(L,Fe,ft),Ce=new ev(L,Fe,ft),ft.programs=Y.programs,v.capabilities=Pe,v.extensions=Fe,v.properties=xe,v.renderLists=X,v.shadowMap=ye,v.state=ve,v.info=ft}U();const te=new Bx(v,L);this.xr=te,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){const E=Fe.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=Fe.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return V},this.setPixelRatio=function(E){E!==void 0&&(V=E,this.setSize(W,q,!1))},this.getSize=function(E){return E.set(W,q)},this.setSize=function(E,F,H=!0){if(te.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}W=E,q=F,t.width=Math.floor(E*V),t.height=Math.floor(F*V),H===!0&&(t.style.width=E+"px",t.style.height=F+"px"),this.setViewport(0,0,E,F)},this.getDrawingBufferSize=function(E){return E.set(W*V,q*V).floor()},this.setDrawingBufferSize=function(E,F,H){W=E,q=F,V=H,t.width=Math.floor(E*H),t.height=Math.floor(F*H),this.setViewport(0,0,E,F)},this.getCurrentViewport=function(E){return E.copy(P)},this.getViewport=function(E){return E.copy(ge)},this.setViewport=function(E,F,H,G){E.isVector4?ge.set(E.x,E.y,E.z,E.w):ge.set(E,F,H,G),ve.viewport(P.copy(ge).multiplyScalar(V).round())},this.getScissor=function(E){return E.copy(Le)},this.setScissor=function(E,F,H,G){E.isVector4?Le.set(E.x,E.y,E.z,E.w):Le.set(E,F,H,G),ve.scissor(D.copy(Le).multiplyScalar(V).round())},this.getScissorTest=function(){return et},this.setScissorTest=function(E){ve.setScissorTest(et=E)},this.setOpaqueSort=function(E){ie=E},this.setTransparentSort=function(E){oe=E},this.getClearColor=function(E){return E.copy(Me.getClearColor())},this.setClearColor=function(){Me.setClearColor(...arguments)},this.getClearAlpha=function(){return Me.getClearAlpha()},this.setClearAlpha=function(){Me.setClearAlpha(...arguments)},this.clear=function(E=!0,F=!0,H=!0){let G=0;if(E){let O=!1;if(R!==null){const Q=R.texture.format;O=Q===_c||Q===gc||Q===mc}if(O){const Q=R.texture.type,le=Q===xn||Q===lr||Q===As||Q===Rs||Q===fc||Q===dc,pe=Me.getClearColor(),he=Me.getClearAlpha(),Re=pe.r,De=pe.g,Ee=pe.b;le?(_[0]=Re,_[1]=De,_[2]=Ee,_[3]=he,L.clearBufferuiv(L.COLOR,0,_)):(g[0]=Re,g[1]=De,g[2]=Ee,g[3]=he,L.clearBufferiv(L.COLOR,0,g))}else G|=L.COLOR_BUFFER_BIT}F&&(G|=L.DEPTH_BUFFER_BIT),H&&(G|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",re,!1),t.removeEventListener("webglcontextrestored",fe,!1),t.removeEventListener("webglcontextcreationerror",J,!1),Me.dispose(),X.dispose(),Te.dispose(),xe.dispose(),Pt.dispose(),St.dispose(),B.dispose(),ae.dispose(),Oe.dispose(),Y.dispose(),te.dispose(),te.removeEventListener("sessionstart",kn),te.removeEventListener("sessionend",th),zi.stop()};function re(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),S=!0}function fe(){console.log("THREE.WebGLRenderer: Context Restored."),S=!1;const E=ft.autoReset,F=ye.enabled,H=ye.autoUpdate,G=ye.needsUpdate,O=ye.type;U(),ft.autoReset=E,ye.enabled=F,ye.autoUpdate=H,ye.needsUpdate=G,ye.type=O}function J(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function K(E){const F=E.target;F.removeEventListener("dispose",K),_e(F)}function _e(E){Ue(E),xe.remove(E)}function Ue(E){const F=xe.get(E).programs;F!==void 0&&(F.forEach(function(H){Y.releaseProgram(H)}),E.isShaderMaterial&&Y.releaseShaderCache(E))}this.renderBufferDirect=function(E,F,H,G,O,Q){F===null&&(F=be);const le=O.isMesh&&O.matrixWorld.determinant()<0,pe=Nd(E,F,H,G,O);ve.setMaterial(G,le);let he=H.index,Re=1;if(G.wireframe===!0){if(he=T.getWireframeAttribute(H),he===void 0)return;Re=2}const De=H.drawRange,Ee=H.attributes.position;let Xe=De.start*Re,it=(De.start+De.count)*Re;Q!==null&&(Xe=Math.max(Xe,Q.start*Re),it=Math.min(it,(Q.start+Q.count)*Re)),he!==null?(Xe=Math.max(Xe,0),it=Math.min(it,he.count)):Ee!=null&&(Xe=Math.max(Xe,0),it=Math.min(it,Ee.count));const xt=it-Xe;if(xt<0||xt===1/0)return;ae.setup(O,G,pe,H,he);let ht,st=ce;if(he!==null&&(ht=C.get(he),st=Ce,st.setIndex(ht)),O.isMesh)G.wireframe===!0?(ve.setLineWidth(G.wireframeLinewidth*Ft()),st.setMode(L.LINES)):st.setMode(L.TRIANGLES);else if(O.isLine){let Ae=G.linewidth;Ae===void 0&&(Ae=1),ve.setLineWidth(Ae*Ft()),O.isLineSegments?st.setMode(L.LINES):O.isLineLoop?st.setMode(L.LINE_LOOP):st.setMode(L.LINE_STRIP)}else O.isPoints?st.setMode(L.POINTS):O.isSprite&&st.setMode(L.TRIANGLES);if(O.isBatchedMesh)if(O._multiDrawInstances!==null)Us("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),st.renderMultiDrawInstances(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount,O._multiDrawInstances);else if(Fe.get("WEBGL_multi_draw"))st.renderMultiDraw(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount);else{const Ae=O._multiDrawStarts,pt=O._multiDrawCounts,Je=O._multiDrawCount,hn=he?C.get(he).bytesPerElement:1,ur=xe.get(G).currentProgram.getUniforms();for(let un=0;un<Je;un++)ur.setValue(L,"_gl_DrawID",un),st.render(Ae[un]/hn,pt[un])}else if(O.isInstancedMesh)st.renderInstances(Xe,xt,O.count);else if(H.isInstancedBufferGeometry){const Ae=H._maxInstanceCount!==void 0?H._maxInstanceCount:1/0,pt=Math.min(H.instanceCount,Ae);st.renderInstances(Xe,xt,pt)}else st.render(Xe,xt)};function lt(E,F,H){E.transparent===!0&&E.side===en&&E.forceSinglePass===!1?(E.side=Kt,E.needsUpdate=!0,js(E,F,H),E.side=pi,E.needsUpdate=!0,js(E,F,H),E.side=en):js(E,F,H)}this.compile=function(E,F,H=null){H===null&&(H=E),p=Te.get(H),p.init(F),x.push(p),H.traverseVisible(function(O){O.isLight&&O.layers.test(F.layers)&&(p.pushLight(O),O.castShadow&&p.pushShadow(O))}),E!==H&&E.traverseVisible(function(O){O.isLight&&O.layers.test(F.layers)&&(p.pushLight(O),O.castShadow&&p.pushShadow(O))}),p.setupLights();const G=new Set;return E.traverse(function(O){if(!(O.isMesh||O.isPoints||O.isLine||O.isSprite))return;const Q=O.material;if(Q)if(Array.isArray(Q))for(let le=0;le<Q.length;le++){const pe=Q[le];lt(pe,H,O),G.add(pe)}else lt(Q,H,O),G.add(Q)}),p=x.pop(),G},this.compileAsync=function(E,F,H=null){const G=this.compile(E,F,H);return new Promise(O=>{function Q(){if(G.forEach(function(le){xe.get(le).currentProgram.isReady()&&G.delete(le)}),G.size===0){O(E);return}setTimeout(Q,10)}Fe.get("KHR_parallel_shader_compile")!==null?Q():setTimeout(Q,10)})};let Qe=null;function $n(E){Qe&&Qe(E)}function kn(){zi.stop()}function th(){zi.start()}const zi=new Pf;zi.setAnimationLoop($n),typeof self<"u"&&zi.setContext(self),this.setAnimationLoop=function(E){Qe=E,te.setAnimationLoop(E),E===null?zi.stop():zi.start()},te.addEventListener("sessionstart",kn),te.addEventListener("sessionend",th),this.render=function(E,F){if(F!==void 0&&F.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(S===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),te.enabled===!0&&te.isPresenting===!0&&(te.cameraAutoUpdate===!0&&te.updateCamera(F),F=te.getCamera()),E.isScene===!0&&E.onBeforeRender(v,E,F,R),p=Te.get(E,x.length),p.init(F),x.push(p),Z.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),Ke.setFromProjectionMatrix(Z,Wn,F.reversedDepth),j=this.localClippingEnabled,He=ne.init(this.clippingPlanes,j),m=X.get(E,M.length),m.init(),M.push(m),te.enabled===!0&&te.isPresenting===!0){const Q=v.xr.getDepthSensingMesh();Q!==null&&to(Q,F,-1/0,v.sortObjects)}to(E,F,0,v.sortObjects),m.finish(),v.sortObjects===!0&&m.sort(ie,oe),$e=te.enabled===!1||te.isPresenting===!1||te.hasDepthSensing()===!1,$e&&Me.addToRenderList(m,E),this.info.render.frame++,He===!0&&ne.beginShadows();const H=p.state.shadowsArray;ye.render(H,E,F),He===!0&&ne.endShadows(),this.info.autoReset===!0&&this.info.reset();const G=m.opaque,O=m.transmissive;if(p.setupLights(),F.isArrayCamera){const Q=F.cameras;if(O.length>0)for(let le=0,pe=Q.length;le<pe;le++){const he=Q[le];ih(G,O,E,he)}$e&&Me.render(E);for(let le=0,pe=Q.length;le<pe;le++){const he=Q[le];nh(m,E,he,he.viewport)}}else O.length>0&&ih(G,O,E,F),$e&&Me.render(E),nh(m,E,F);R!==null&&w===0&&(ke.updateMultisampleRenderTarget(R),ke.updateRenderTargetMipmap(R)),E.isScene===!0&&E.onAfterRender(v,E,F),ae.resetDefaultState(),y=-1,b=null,x.pop(),x.length>0?(p=x[x.length-1],He===!0&&ne.setGlobalState(v.clippingPlanes,p.state.camera)):p=null,M.pop(),M.length>0?m=M[M.length-1]:m=null};function to(E,F,H,G){if(E.visible===!1)return;if(E.layers.test(F.layers)){if(E.isGroup)H=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(F);else if(E.isLight)p.pushLight(E),E.castShadow&&p.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||Ke.intersectsSprite(E)){G&&Ie.setFromMatrixPosition(E.matrixWorld).applyMatrix4(Z);const le=B.update(E),pe=E.material;pe.visible&&m.push(E,le,pe,H,Ie.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||Ke.intersectsObject(E))){const le=B.update(E),pe=E.material;if(G&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Ie.copy(E.boundingSphere.center)):(le.boundingSphere===null&&le.computeBoundingSphere(),Ie.copy(le.boundingSphere.center)),Ie.applyMatrix4(E.matrixWorld).applyMatrix4(Z)),Array.isArray(pe)){const he=le.groups;for(let Re=0,De=he.length;Re<De;Re++){const Ee=he[Re],Xe=pe[Ee.materialIndex];Xe&&Xe.visible&&m.push(E,le,Xe,H,Ie.z,Ee)}}else pe.visible&&m.push(E,le,pe,H,Ie.z,null)}}const Q=E.children;for(let le=0,pe=Q.length;le<pe;le++)to(Q[le],F,H,G)}function nh(E,F,H,G){const O=E.opaque,Q=E.transmissive,le=E.transparent;p.setupLightsView(H),He===!0&&ne.setGlobalState(v.clippingPlanes,H),G&&ve.viewport(P.copy(G)),O.length>0&&Ys(O,F,H),Q.length>0&&Ys(Q,F,H),le.length>0&&Ys(le,F,H),ve.buffers.depth.setTest(!0),ve.buffers.depth.setMask(!0),ve.buffers.color.setMask(!0),ve.setPolygonOffset(!1)}function ih(E,F,H,G){if((H.isScene===!0?H.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[G.id]===void 0&&(p.state.transmissionRenderTarget[G.id]=new qn(1,1,{generateMipmaps:!0,type:Fe.has("EXT_color_buffer_half_float")||Fe.has("EXT_color_buffer_float")?Bi:xn,minFilter:li,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ze.workingColorSpace}));const Q=p.state.transmissionRenderTarget[G.id],le=G.viewport||P;Q.setSize(le.z*v.transmissionResolutionScale,le.w*v.transmissionResolutionScale);const pe=v.getRenderTarget(),he=v.getActiveCubeFace(),Re=v.getActiveMipmapLevel();v.setRenderTarget(Q),v.getClearColor(k),z=v.getClearAlpha(),z<1&&v.setClearColor(16777215,.5),v.clear(),$e&&Me.render(H);const De=v.toneMapping;v.toneMapping=ui;const Ee=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),p.setupLightsView(G),He===!0&&ne.setGlobalState(v.clippingPlanes,G),Ys(E,H,G),ke.updateMultisampleRenderTarget(Q),ke.updateRenderTargetMipmap(Q),Fe.has("WEBGL_multisampled_render_to_texture")===!1){let Xe=!1;for(let it=0,xt=F.length;it<xt;it++){const ht=F[it],st=ht.object,Ae=ht.geometry,pt=ht.material,Je=ht.group;if(pt.side===en&&st.layers.test(G.layers)){const hn=pt.side;pt.side=Kt,pt.needsUpdate=!0,rh(st,H,G,Ae,pt,Je),pt.side=hn,pt.needsUpdate=!0,Xe=!0}}Xe===!0&&(ke.updateMultisampleRenderTarget(Q),ke.updateRenderTargetMipmap(Q))}v.setRenderTarget(pe,he,Re),v.setClearColor(k,z),Ee!==void 0&&(G.viewport=Ee),v.toneMapping=De}function Ys(E,F,H){const G=F.isScene===!0?F.overrideMaterial:null;for(let O=0,Q=E.length;O<Q;O++){const le=E[O],pe=le.object,he=le.geometry,Re=le.group;let De=le.material;De.allowOverride===!0&&G!==null&&(De=G),pe.layers.test(H.layers)&&rh(pe,F,H,he,De,Re)}}function rh(E,F,H,G,O,Q){E.onBeforeRender(v,F,H,G,O,Q),E.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),O.onBeforeRender(v,F,H,G,E,Q),O.transparent===!0&&O.side===en&&O.forceSinglePass===!1?(O.side=Kt,O.needsUpdate=!0,v.renderBufferDirect(H,F,G,O,E,Q),O.side=pi,O.needsUpdate=!0,v.renderBufferDirect(H,F,G,O,E,Q),O.side=en):v.renderBufferDirect(H,F,G,O,E,Q),E.onAfterRender(v,F,H,G,O,Q)}function js(E,F,H){F.isScene!==!0&&(F=be);const G=xe.get(E),O=p.state.lights,Q=p.state.shadowsArray,le=O.state.version,pe=Y.getParameters(E,O.state,Q,F,H),he=Y.getProgramCacheKey(pe);let Re=G.programs;G.environment=E.isMeshStandardMaterial?F.environment:null,G.fog=F.fog,G.envMap=(E.isMeshStandardMaterial?St:Pt).get(E.envMap||G.environment),G.envMapRotation=G.environment!==null&&E.envMap===null?F.environmentRotation:E.envMapRotation,Re===void 0&&(E.addEventListener("dispose",K),Re=new Map,G.programs=Re);let De=Re.get(he);if(De!==void 0){if(G.currentProgram===De&&G.lightsStateVersion===le)return ah(E,pe),De}else pe.uniforms=Y.getUniforms(E),E.onBeforeCompile(pe,v),De=Y.acquireProgram(pe,he),Re.set(he,De),G.uniforms=pe.uniforms;const Ee=G.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Ee.clippingPlanes=ne.uniform),ah(E,pe),G.needsLights=Od(E),G.lightsStateVersion=le,G.needsLights&&(Ee.ambientLightColor.value=O.state.ambient,Ee.lightProbe.value=O.state.probe,Ee.directionalLights.value=O.state.directional,Ee.directionalLightShadows.value=O.state.directionalShadow,Ee.spotLights.value=O.state.spot,Ee.spotLightShadows.value=O.state.spotShadow,Ee.rectAreaLights.value=O.state.rectArea,Ee.ltc_1.value=O.state.rectAreaLTC1,Ee.ltc_2.value=O.state.rectAreaLTC2,Ee.pointLights.value=O.state.point,Ee.pointLightShadows.value=O.state.pointShadow,Ee.hemisphereLights.value=O.state.hemi,Ee.directionalShadowMap.value=O.state.directionalShadowMap,Ee.directionalShadowMatrix.value=O.state.directionalShadowMatrix,Ee.spotShadowMap.value=O.state.spotShadowMap,Ee.spotLightMatrix.value=O.state.spotLightMatrix,Ee.spotLightMap.value=O.state.spotLightMap,Ee.pointShadowMap.value=O.state.pointShadowMap,Ee.pointShadowMatrix.value=O.state.pointShadowMatrix),G.currentProgram=De,G.uniformsList=null,De}function sh(E){if(E.uniformsList===null){const F=E.currentProgram.getUniforms();E.uniformsList=Ra.seqWithValue(F.seq,E.uniforms)}return E.uniformsList}function ah(E,F){const H=xe.get(E);H.outputColorSpace=F.outputColorSpace,H.batching=F.batching,H.batchingColor=F.batchingColor,H.instancing=F.instancing,H.instancingColor=F.instancingColor,H.instancingMorph=F.instancingMorph,H.skinning=F.skinning,H.morphTargets=F.morphTargets,H.morphNormals=F.morphNormals,H.morphColors=F.morphColors,H.morphTargetsCount=F.morphTargetsCount,H.numClippingPlanes=F.numClippingPlanes,H.numIntersection=F.numClipIntersection,H.vertexAlphas=F.vertexAlphas,H.vertexTangents=F.vertexTangents,H.toneMapping=F.toneMapping}function Nd(E,F,H,G,O){F.isScene!==!0&&(F=be),ke.resetTextureUnits();const Q=F.fog,le=G.isMeshStandardMaterial?F.environment:null,pe=R===null?v.outputColorSpace:R.isXRRenderTarget===!0?R.texture.colorSpace:Zt,he=(G.isMeshStandardMaterial?St:Pt).get(G.envMap||le),Re=G.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,De=!!H.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),Ee=!!H.morphAttributes.position,Xe=!!H.morphAttributes.normal,it=!!H.morphAttributes.color;let xt=ui;G.toneMapped&&(R===null||R.isXRRenderTarget===!0)&&(xt=v.toneMapping);const ht=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,st=ht!==void 0?ht.length:0,Ae=xe.get(G),pt=p.state.lights;if(He===!0&&(j===!0||E!==b)){const Wt=E===b&&G.id===y;ne.setState(G,E,Wt)}let Je=!1;G.version===Ae.__version?(Ae.needsLights&&Ae.lightsStateVersion!==pt.state.version||Ae.outputColorSpace!==pe||O.isBatchedMesh&&Ae.batching===!1||!O.isBatchedMesh&&Ae.batching===!0||O.isBatchedMesh&&Ae.batchingColor===!0&&O.colorTexture===null||O.isBatchedMesh&&Ae.batchingColor===!1&&O.colorTexture!==null||O.isInstancedMesh&&Ae.instancing===!1||!O.isInstancedMesh&&Ae.instancing===!0||O.isSkinnedMesh&&Ae.skinning===!1||!O.isSkinnedMesh&&Ae.skinning===!0||O.isInstancedMesh&&Ae.instancingColor===!0&&O.instanceColor===null||O.isInstancedMesh&&Ae.instancingColor===!1&&O.instanceColor!==null||O.isInstancedMesh&&Ae.instancingMorph===!0&&O.morphTexture===null||O.isInstancedMesh&&Ae.instancingMorph===!1&&O.morphTexture!==null||Ae.envMap!==he||G.fog===!0&&Ae.fog!==Q||Ae.numClippingPlanes!==void 0&&(Ae.numClippingPlanes!==ne.numPlanes||Ae.numIntersection!==ne.numIntersection)||Ae.vertexAlphas!==Re||Ae.vertexTangents!==De||Ae.morphTargets!==Ee||Ae.morphNormals!==Xe||Ae.morphColors!==it||Ae.toneMapping!==xt||Ae.morphTargetsCount!==st)&&(Je=!0):(Je=!0,Ae.__version=G.version);let hn=Ae.currentProgram;Je===!0&&(hn=js(G,F,O));let ur=!1,un=!1,ss=!1;const mt=hn.getUniforms(),Sn=Ae.uniforms;if(ve.useProgram(hn.program)&&(ur=!0,un=!0,ss=!0),G.id!==y&&(y=G.id,un=!0),ur||b!==E){ve.buffers.depth.getReversed()&&E.reversedDepth!==!0&&(E._reversedDepth=!0,E.updateProjectionMatrix()),mt.setValue(L,"projectionMatrix",E.projectionMatrix),mt.setValue(L,"viewMatrix",E.matrixWorldInverse);const Qt=mt.map.cameraPosition;Qt!==void 0&&Qt.setValue(L,de.setFromMatrixPosition(E.matrixWorld)),Pe.logarithmicDepthBuffer&&mt.setValue(L,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&mt.setValue(L,"isOrthographic",E.isOrthographicCamera===!0),b!==E&&(b=E,un=!0,ss=!0)}if(O.isSkinnedMesh){mt.setOptional(L,O,"bindMatrix"),mt.setOptional(L,O,"bindMatrixInverse");const Wt=O.skeleton;Wt&&(Wt.boneTexture===null&&Wt.computeBoneTexture(),mt.setValue(L,"boneTexture",Wt.boneTexture,ke))}O.isBatchedMesh&&(mt.setOptional(L,O,"batchingTexture"),mt.setValue(L,"batchingTexture",O._matricesTexture,ke),mt.setOptional(L,O,"batchingIdTexture"),mt.setValue(L,"batchingIdTexture",O._indirectTexture,ke),mt.setOptional(L,O,"batchingColorTexture"),O._colorsTexture!==null&&mt.setValue(L,"batchingColorTexture",O._colorsTexture,ke));const Tn=H.morphAttributes;if((Tn.position!==void 0||Tn.normal!==void 0||Tn.color!==void 0)&&ee.update(O,H,hn),(un||Ae.receiveShadow!==O.receiveShadow)&&(Ae.receiveShadow=O.receiveShadow,mt.setValue(L,"receiveShadow",O.receiveShadow)),G.isMeshGouraudMaterial&&G.envMap!==null&&(Sn.envMap.value=he,Sn.flipEnvMap.value=he.isCubeTexture&&he.isRenderTargetTexture===!1?-1:1),G.isMeshStandardMaterial&&G.envMap===null&&F.environment!==null&&(Sn.envMapIntensity.value=F.environmentIntensity),un&&(mt.setValue(L,"toneMappingExposure",v.toneMappingExposure),Ae.needsLights&&Fd(Sn,ss),Q&&G.fog===!0&&$.refreshFogUniforms(Sn,Q),$.refreshMaterialUniforms(Sn,G,V,q,p.state.transmissionRenderTarget[E.id]),Ra.upload(L,sh(Ae),Sn,ke)),G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(Ra.upload(L,sh(Ae),Sn,ke),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&mt.setValue(L,"center",O.center),mt.setValue(L,"modelViewMatrix",O.modelViewMatrix),mt.setValue(L,"normalMatrix",O.normalMatrix),mt.setValue(L,"modelMatrix",O.matrixWorld),G.isShaderMaterial||G.isRawShaderMaterial){const Wt=G.uniformsGroups;for(let Qt=0,no=Wt.length;Qt<no;Qt++){const Hi=Wt[Qt];Oe.update(Hi,hn),Oe.bind(Hi,hn)}}return hn}function Fd(E,F){E.ambientLightColor.needsUpdate=F,E.lightProbe.needsUpdate=F,E.directionalLights.needsUpdate=F,E.directionalLightShadows.needsUpdate=F,E.pointLights.needsUpdate=F,E.pointLightShadows.needsUpdate=F,E.spotLights.needsUpdate=F,E.spotLightShadows.needsUpdate=F,E.rectAreaLights.needsUpdate=F,E.hemisphereLights.needsUpdate=F}function Od(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return w},this.getRenderTarget=function(){return R},this.setRenderTargetTextures=function(E,F,H){const G=xe.get(E);G.__autoAllocateDepthBuffer=E.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),xe.get(E.texture).__webglTexture=F,xe.get(E.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:H,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(E,F){const H=xe.get(E);H.__webglFramebuffer=F,H.__useDefaultFramebuffer=F===void 0};const Bd=L.createFramebuffer();this.setRenderTarget=function(E,F=0,H=0){R=E,A=F,w=H;let G=!0,O=null,Q=!1,le=!1;if(E){const he=xe.get(E);if(he.__useDefaultFramebuffer!==void 0)ve.bindFramebuffer(L.FRAMEBUFFER,null),G=!1;else if(he.__webglFramebuffer===void 0)ke.setupRenderTarget(E);else if(he.__hasExternalTextures)ke.rebindTextures(E,xe.get(E.texture).__webglTexture,xe.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){const Ee=E.depthTexture;if(he.__boundDepthTexture!==Ee){if(Ee!==null&&xe.has(Ee)&&(E.width!==Ee.image.width||E.height!==Ee.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");ke.setupDepthRenderbuffer(E)}}const Re=E.texture;(Re.isData3DTexture||Re.isDataArrayTexture||Re.isCompressedArrayTexture)&&(le=!0);const De=xe.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(De[F])?O=De[F][H]:O=De[F],Q=!0):E.samples>0&&ke.useMultisampledRTT(E)===!1?O=xe.get(E).__webglMultisampledFramebuffer:Array.isArray(De)?O=De[H]:O=De,P.copy(E.viewport),D.copy(E.scissor),N=E.scissorTest}else P.copy(ge).multiplyScalar(V).floor(),D.copy(Le).multiplyScalar(V).floor(),N=et;if(H!==0&&(O=Bd),ve.bindFramebuffer(L.FRAMEBUFFER,O)&&G&&ve.drawBuffers(E,O),ve.viewport(P),ve.scissor(D),ve.setScissorTest(N),Q){const he=xe.get(E.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+F,he.__webglTexture,H)}else if(le){const he=F;for(let Re=0;Re<E.textures.length;Re++){const De=xe.get(E.textures[Re]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+Re,De.__webglTexture,H,he)}}else if(E!==null&&H!==0){const he=xe.get(E.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,he.__webglTexture,H)}y=-1},this.readRenderTargetPixels=function(E,F,H,G,O,Q,le,pe=0){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let he=xe.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&le!==void 0&&(he=he[le]),he){ve.bindFramebuffer(L.FRAMEBUFFER,he);try{const Re=E.textures[pe],De=Re.format,Ee=Re.type;if(!Pe.textureFormatReadable(De)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Pe.textureTypeReadable(Ee)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=E.width-G&&H>=0&&H<=E.height-O&&(E.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+pe),L.readPixels(F,H,G,O,Se.convert(De),Se.convert(Ee),Q))}finally{const Re=R!==null?xe.get(R).__webglFramebuffer:null;ve.bindFramebuffer(L.FRAMEBUFFER,Re)}}},this.readRenderTargetPixelsAsync=async function(E,F,H,G,O,Q,le,pe=0){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let he=xe.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&le!==void 0&&(he=he[le]),he)if(F>=0&&F<=E.width-G&&H>=0&&H<=E.height-O){ve.bindFramebuffer(L.FRAMEBUFFER,he);const Re=E.textures[pe],De=Re.format,Ee=Re.type;if(!Pe.textureFormatReadable(De))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Pe.textureTypeReadable(Ee))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Xe=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,Xe),L.bufferData(L.PIXEL_PACK_BUFFER,Q.byteLength,L.STREAM_READ),E.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+pe),L.readPixels(F,H,G,O,Se.convert(De),Se.convert(Ee),0);const it=R!==null?xe.get(R).__webglFramebuffer:null;ve.bindFramebuffer(L.FRAMEBUFFER,it);const xt=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await jp(L,xt,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,Xe),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,Q),L.deleteBuffer(Xe),L.deleteSync(xt),Q}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(E,F=null,H=0){const G=Math.pow(2,-H),O=Math.floor(E.image.width*G),Q=Math.floor(E.image.height*G),le=F!==null?F.x:0,pe=F!==null?F.y:0;ke.setTexture2D(E,0),L.copyTexSubImage2D(L.TEXTURE_2D,H,0,0,le,pe,O,Q),ve.unbindTexture()};const kd=L.createFramebuffer(),zd=L.createFramebuffer();this.copyTextureToTexture=function(E,F,H=null,G=null,O=0,Q=null){Q===null&&(O!==0?(Us("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),Q=O,O=0):Q=0);let le,pe,he,Re,De,Ee,Xe,it,xt;const ht=E.isCompressedTexture?E.mipmaps[Q]:E.image;if(H!==null)le=H.max.x-H.min.x,pe=H.max.y-H.min.y,he=H.isBox3?H.max.z-H.min.z:1,Re=H.min.x,De=H.min.y,Ee=H.isBox3?H.min.z:0;else{const Tn=Math.pow(2,-O);le=Math.floor(ht.width*Tn),pe=Math.floor(ht.height*Tn),E.isDataArrayTexture?he=ht.depth:E.isData3DTexture?he=Math.floor(ht.depth*Tn):he=1,Re=0,De=0,Ee=0}G!==null?(Xe=G.x,it=G.y,xt=G.z):(Xe=0,it=0,xt=0);const st=Se.convert(F.format),Ae=Se.convert(F.type);let pt;F.isData3DTexture?(ke.setTexture3D(F,0),pt=L.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(ke.setTexture2DArray(F,0),pt=L.TEXTURE_2D_ARRAY):(ke.setTexture2D(F,0),pt=L.TEXTURE_2D),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,F.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,F.unpackAlignment);const Je=L.getParameter(L.UNPACK_ROW_LENGTH),hn=L.getParameter(L.UNPACK_IMAGE_HEIGHT),ur=L.getParameter(L.UNPACK_SKIP_PIXELS),un=L.getParameter(L.UNPACK_SKIP_ROWS),ss=L.getParameter(L.UNPACK_SKIP_IMAGES);L.pixelStorei(L.UNPACK_ROW_LENGTH,ht.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,ht.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Re),L.pixelStorei(L.UNPACK_SKIP_ROWS,De),L.pixelStorei(L.UNPACK_SKIP_IMAGES,Ee);const mt=E.isDataArrayTexture||E.isData3DTexture,Sn=F.isDataArrayTexture||F.isData3DTexture;if(E.isDepthTexture){const Tn=xe.get(E),Wt=xe.get(F),Qt=xe.get(Tn.__renderTarget),no=xe.get(Wt.__renderTarget);ve.bindFramebuffer(L.READ_FRAMEBUFFER,Qt.__webglFramebuffer),ve.bindFramebuffer(L.DRAW_FRAMEBUFFER,no.__webglFramebuffer);for(let Hi=0;Hi<he;Hi++)mt&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,xe.get(E).__webglTexture,O,Ee+Hi),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,xe.get(F).__webglTexture,Q,xt+Hi)),L.blitFramebuffer(Re,De,le,pe,Xe,it,le,pe,L.DEPTH_BUFFER_BIT,L.NEAREST);ve.bindFramebuffer(L.READ_FRAMEBUFFER,null),ve.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(O!==0||E.isRenderTargetTexture||xe.has(E)){const Tn=xe.get(E),Wt=xe.get(F);ve.bindFramebuffer(L.READ_FRAMEBUFFER,kd),ve.bindFramebuffer(L.DRAW_FRAMEBUFFER,zd);for(let Qt=0;Qt<he;Qt++)mt?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Tn.__webglTexture,O,Ee+Qt):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Tn.__webglTexture,O),Sn?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,Wt.__webglTexture,Q,xt+Qt):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,Wt.__webglTexture,Q),O!==0?L.blitFramebuffer(Re,De,le,pe,Xe,it,le,pe,L.COLOR_BUFFER_BIT,L.NEAREST):Sn?L.copyTexSubImage3D(pt,Q,Xe,it,xt+Qt,Re,De,le,pe):L.copyTexSubImage2D(pt,Q,Xe,it,Re,De,le,pe);ve.bindFramebuffer(L.READ_FRAMEBUFFER,null),ve.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else Sn?E.isDataTexture||E.isData3DTexture?L.texSubImage3D(pt,Q,Xe,it,xt,le,pe,he,st,Ae,ht.data):F.isCompressedArrayTexture?L.compressedTexSubImage3D(pt,Q,Xe,it,xt,le,pe,he,st,ht.data):L.texSubImage3D(pt,Q,Xe,it,xt,le,pe,he,st,Ae,ht):E.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,Q,Xe,it,le,pe,st,Ae,ht.data):E.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,Q,Xe,it,ht.width,ht.height,st,ht.data):L.texSubImage2D(L.TEXTURE_2D,Q,Xe,it,le,pe,st,Ae,ht);L.pixelStorei(L.UNPACK_ROW_LENGTH,Je),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,hn),L.pixelStorei(L.UNPACK_SKIP_PIXELS,ur),L.pixelStorei(L.UNPACK_SKIP_ROWS,un),L.pixelStorei(L.UNPACK_SKIP_IMAGES,ss),Q===0&&F.generateMipmaps&&L.generateMipmap(pt),ve.unbindTexture()},this.initRenderTarget=function(E){xe.get(E).__webglFramebuffer===void 0&&ke.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?ke.setTextureCube(E,0):E.isData3DTexture?ke.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?ke.setTexture2DArray(E,0):ke.setTexture2D(E,0),ve.unbindTexture()},this.resetState=function(){A=0,w=0,R=null,ve.reset(),ae.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Wn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=Ze._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ze._getUnpackColorSpace()}}class Gx extends cr{constructor(){super();const e=new di;e.deleteAttribute("uv");const t=new Di({side:Kt}),n=new Di,i=new Cf(16777215,900,28,2);i.position.set(.418,16.199,.3),this.add(i);const r=new We(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);const a=new Ya(e,n,6),o=new ct;o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),o.updateMatrix(),a.setMatrixAt(0,o.matrix),o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),o.updateMatrix(),a.setMatrixAt(1,o.matrix),o.position.set(6.167,.857,7.803),o.rotation.set(0,.561,0),o.scale.set(3.927,6.285,3.687),o.updateMatrix(),a.setMatrixAt(2,o.matrix),o.position.set(-2.017,.018,6.124),o.rotation.set(0,.333,0),o.scale.set(2.002,4.566,2.064),o.updateMatrix(),a.setMatrixAt(3,o.matrix),o.position.set(2.291,-.756,-2.621),o.rotation.set(0,-.286,0),o.scale.set(1.546,1.552,1.496),o.updateMatrix(),a.setMatrixAt(4,o.matrix),o.position.set(-2.193,-.369,-5.547),o.rotation.set(0,.516,0),o.scale.set(3.875,3.487,2.986),o.updateMatrix(),a.setMatrixAt(5,o.matrix),this.add(a);const l=new We(e,Rr(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);const c=new We(e,Rr(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);const h=new We(e,Rr(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);const u=new We(e,Rr(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);const f=new We(e,Rr(20));f.position.set(3.235,11.486,-12.541),f.scale.set(2.5,2,.1),this.add(f);const d=new We(e,Rr(100));d.position.set(0,20,0),d.scale.set(1,.1,1),this.add(d)}dispose(){const e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(const t of e)t.dispose()}}function Rr(s){return new Rm({color:0,emissive:16777215,emissiveIntensity:s})}const Dr="varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}",Xs=`
float hash(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
float fbm(vec2 p){float a=.5,v=0.;for(int i=0;i<4;i++){v+=a*noise(p);p=mat2(.8,-.6,.6,.8)*p*2.03+7.8;a*=.5;}return v;}
`,Wx=`varying vec2 vUv;${Xs}
void main(){vec2 p=vUv*6.;vec2 w=p+vec2(fbm(p*1.3),fbm(p*1.3+11.))*2.;float a=fbm(w*4.);float veins=pow(1.-abs(a*2.-1.),10.);float h=clamp(.2+fbm(w)*.55+veins*.25,0.,1.);gl_FragColor=vec4(vec3(h),1.);}`,Xx=`
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
}`,qx="varying vec2 vUv;uniform sampler2D uMap;uniform vec2 uDirection;void main(){vec4 c=texture2D(uMap,vUv)*.227027;c+=(texture2D(uMap,vUv+uDirection*1.384615)+texture2D(uMap,vUv-uDirection*1.384615))*.316216;c+=(texture2D(uMap,vUv+uDirection*3.230769)+texture2D(uMap,vUv-uDirection*3.230769))*.070270;gl_FragColor=c;}",Yx=`varying vec2 vUv;uniform float uTime,uDawn;${Xs}
void main(){
  vec2 p=vUv;
  vec3 green=mix(vec3(.64,.86,.72),vec3(.025,.31,.23),pow(p.y,.75));
  green+=exp(-length((p-vec2(.52,.15))*vec2(1.4,.8))*5.)*vec3(.02,.08,.04);
  green+=(fbm(p*3.+uTime*.006)-.5)*.025;
  float edge=pow(length((p-.5)*vec2(1.1,.8)),1.4);
  vec3 white=vec3(.995)-edge*vec3(.035,.008,.020);
  white-=exp(-length((p-vec2(.53,.08))*vec2(2.,1.))*6.)*vec3(.10,.005,.055)*uDawn;
  gl_FragColor=vec4(pow(mix(green,white,uDawn),vec3(2.2)),1.);
}`,jx=`
varying vec2 vUv;
uniform sampler2D uSharp,uBlur,uIce,uField,uHand;
uniform float uTime,uAspect,uFreeze,uMelt,uDawn,uFlash,uExposure,uGuidance;
uniform vec2 uCenter,uIceTexel,uFieldTexel,uPointer;
uniform float uPointerActive,uGuideTime;
${Xs}
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
}`,ji=(s,e,t=!1)=>new qn(s,e,{minFilter:jt,magFilter:jt,format:nn,type:t?Bi:xn,depthBuffer:!1});class Kx{constructor(e){this.renderer=e,this.sharp.depthBuffer=!0,this.hand.depthBuffer=!0,this.scene.add(this.quad),this.quad.frustumCulled=!1,this.floatField=e.extensions.has("EXT_color_buffer_float")&&!new URLSearchParams(location.search).has("byte-field"),this.fields=[ji(384,384,this.floatField),ji(384,384,this.floatField)],this.fieldMaterial=new Ut({vertexShader:Dr,fragmentShader:Xx,depthTest:!1,depthWrite:!1,toneMapped:!1,uniforms:{uPrevious:{value:this.fields[0].texture},uTexel:{value:new ue(1/384,1/384)},uDt:{value:0},uDecay:{value:0},uAspect:{value:1},uRadius:{value:.014},uCount:{value:0},uSegments:{value:this.segments},uByte:{value:this.floatField?0:1},uFrame:{value:0}}}),this.blurMaterial=new Ut({vertexShader:Dr,fragmentShader:qx,depthTest:!1,depthWrite:!1,toneMapped:!1,uniforms:{uMap:{value:this.sharp.texture},uDirection:{value:new ue}}}),this.finalMaterial=new Ut({vertexShader:Dr,fragmentShader:jx,depthTest:!1,depthWrite:!1,uniforms:{uSharp:{value:this.sharp.texture},uBlur:{value:this.blurB.texture},uIce:{value:this.ice.texture},uField:{value:this.fields[0].texture},uHand:{value:this.hand.texture},uTime:{value:0},uAspect:{value:1},uMelt:{value:0},uDawn:{value:0},uFlash:{value:0},uExposure:{value:1},uCenter:{value:new ue(.5,.5)},uIceTexel:{value:new ue(1/768,1/768)},uFieldTexel:{value:new ue(1/384,1/384)}}}),Object.assign(this.finalMaterial.uniforms,{uFreeze:{value:0},uGuidance:{value:0},uGuideTime:{value:0},uPointer:{value:new ue(.5,.5)},uPointerActive:{value:0}}),this.finalMaterial.toneMapped=!1,this.generateIce(768),this.clear()}renderer;sharp=ji(1,1);hand=ji(1,1);blurA=ji(1,1);blurB=ji(1,1);ice=ji(768,768);fields;current=0;fieldFrame=0;scene=new cr;camera=new is(-1,1,1,-1,0,1);quad=new We(new Yn(2,2));segments=Array.from({length:24},()=>new qe);queue=[];dirty=!1;width=1;height=1;aspect=1;fieldSize=384;quality="balanced";floatField;fieldMaterial;blurMaterial;finalMaterial;photoReady=!1;photoError;iceMaterial=new Ut({vertexShader:Dr,fragmentShader:Wx,depthTest:!1,depthWrite:!1,toneMapped:!1});async loadPhoto(e){try{const t=await new Oa().loadAsync(e);t.colorSpace=oi,this.finalMaterial.uniforms.uIce.value=t,this.finalMaterial.uniforms.uIceTexel.value.set(1/1536,1/1024),this.photoReady=!0}catch(t){this.photoError=String(t)}}pass(e,t){this.quad.material=e,this.renderer.setRenderTarget(t),this.renderer.render(this.scene,this.camera)}generateIce(e){this.ice.setSize(e,e),this.ice.texture.wrapS=this.ice.texture.wrapT=Ui,this.pass(this.iceMaterial,this.ice),this.renderer.setRenderTarget(null)}resize(e,t,n){this.width=e,this.height=t,this.aspect=e/t,this.quality=n;const i=n==="high"?2e6:n==="balanced"?115e4:65e4,r=n==="high"?1.5:n==="balanced"?1.1:.8,a=Math.min(devicePixelRatio||1,r,Math.sqrt(i/(e*t)));this.renderer.setPixelRatio(a),this.renderer.setSize(e,t,!1);const o=this.renderer.getDrawingBufferSize(new ue),l=o.x,c=o.y;this.sharp.setSize(l,c),this.hand.setSize(l,c),this.blurA.setSize(Math.max(1,l>>2),Math.max(1,c>>2)),this.blurB.setSize(Math.max(1,l>>2),Math.max(1,c>>2));const h=n==="high"?512:n==="balanced"?384:256;if(h!==this.fieldSize){this.fieldSize=h;for(const u of this.fields)u.setSize(h,h);this.generateIce(n==="high"?1024:n==="balanced"?768:512)}this.fieldMaterial.uniforms.uTexel.value.set(1/h,1/h),this.fieldMaterial.uniforms.uAspect.value=this.aspect,this.fieldMaterial.uniforms.uRadius.value=Math.max(12,Math.min(27,Math.min(e,t)*.039))/t,this.finalMaterial.uniforms.uAspect.value=this.aspect,this.photoReady||this.finalMaterial.uniforms.uIceTexel.value.set(1/this.ice.width,1/this.ice.height),this.finalMaterial.uniforms.uFieldTexel.value.set(1/h,1/h),this.clear()}clear(){this.reset()}reset(){this.queue=[],this.dirty=!1,this.current=0;const e=this.renderer.getRenderTarget(),t=this.renderer.getClearAlpha(),n=this.renderer.getClearColor(new me);this.renderer.setClearColor(0,1);for(const i of this.fields)this.renderer.setRenderTarget(i),this.renderer.clear();this.renderer.setRenderTarget(e),this.renderer.setClearColor(n,t),this.fieldMaterial.uniforms.uDecay.value=0,this.finalMaterial.uniforms.uField.value=this.fields[0].texture}stroke(e,t){this.queue.push(new qe(e.x,e.y,t.x,t.y)),this.dirty=!0,this.fieldMaterial.uniforms.uDecay.value=0}cool(){this.fieldMaterial.uniforms.uDecay.value=.065}updateField(e){if(!this.dirty&&this.queue.length===0)return;const t=Math.min(24,this.queue.length);for(let i=0;i<t;i++)this.segments[i].copy(this.queue.shift());const n=this.fieldMaterial;n.uniforms.uPrevious.value=this.fields[this.current].texture,n.uniforms.uCount.value=t,n.uniforms.uDt.value=Math.min(e,.05),n.uniforms.uFrame.value=this.fieldFrame++,this.pass(n,this.fields[1-this.current]),this.current=1-this.current,this.finalMaterial.uniforms.uField.value=this.fields[this.current].texture}render(e,t,n,i,r){const a=this.renderer;a.setRenderTarget(this.sharp),a.setClearColor(9090635,1),a.clear(),a.render(e,t),a.setRenderTarget(this.hand),a.setClearColor(0,0),a.clear(),a.render(n,t),this.updateField(i),this.blurMaterial.uniforms.uMap.value=this.sharp.texture,this.blurMaterial.uniforms.uDirection.value.set(2/this.sharp.width,0),this.pass(this.blurMaterial,this.blurA),this.blurMaterial.uniforms.uMap.value=this.blurA.texture,this.blurMaterial.uniforms.uDirection.value.set(0,2/this.sharp.height),this.pass(this.blurMaterial,this.blurB),this.finalMaterial.uniforms.uTime.value=r,this.pass(this.finalMaterial,null)}info(){return{quality:this.quality,buffer:[this.sharp.width,this.sharp.height],field:[this.fieldSize,this.fieldSize],floatField:this.floatField,queue:this.queue.length,photoReady:this.photoReady,photoError:this.photoError??null,passes:"sharp scene, refined skinned hand, heat ping-pong, blur, refracting frost composite, foreground type"}}dispose(){for(const e of[this.sharp,this.hand,this.blurA,this.blurB,this.ice,...this.fields])e.dispose();for(const e of[this.fieldMaterial,this.blurMaterial,this.finalMaterial,this.iceMaterial])e.dispose();this.quad.geometry.dispose()}}function si(s){if(s===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return s}function Nf(s,e){s.prototype=Object.create(e.prototype),s.prototype.constructor=s,s.__proto__=e}var vn={autoSleep:120,force3D:"auto",nullTargetWarn:1,units:{lineHeight:""}},Ns={duration:.5,overwrite:!1,delay:0},Oc,Nt,dt,An=1e8,ot=1/An,Gl=Math.PI*2,$x=Gl/4,Zx=0,Ff=Math.sqrt,Jx=Math.cos,Qx=Math.sin,It=function(e){return typeof e=="string"},yt=function(e){return typeof e=="function"},mi=function(e){return typeof e=="number"},Bc=function(e){return typeof e>"u"},jn=function(e){return typeof e=="object"},sn=function(e){return e!==!1},kc=function(){return typeof window<"u"},Sa=function(e){return yt(e)||It(e)},Of=typeof ArrayBuffer=="function"&&ArrayBuffer.isView||function(){},Gt=Array.isArray,ey=/random\([^)]+\)/g,ty=/,\s*/g,Eu=/(?:-?\.?\d|\.)+/gi,Bf=/[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,Lr=/[-+=.]*\d+[.e-]*\d*[a-z%]*/g,ko=/[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,kf=/[+-]=-?[.\d]+/,ny=/[^,'"\[\]\s]+/gi,iy=/^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i,_t,Hn,Wl,zc,yn={},Ba={},zf,Hf=function(e){return(Ba=jr(e,yn))&&cn},Hc=function(e,t){return console.warn("Invalid property",e,"set to",t,"Missing plugin? gsap.registerPlugin()")},Fs=function(e,t){return!t&&console.warn(e)},Vf=function(e,t){return e&&(yn[e]=t)&&Ba&&(Ba[e]=t)||yn},Os=function(){return 0},ry={suppressEvents:!0,isStart:!0,kill:!1},Ca={suppressEvents:!0,kill:!1},sy={suppressEvents:!0},Vc={},Li=[],Xl={},Gf,pn={},zo={},wu=30,Pa=[],Gc="",Wc=function(e){var t=e[0],n,i;if(jn(t)||yt(t)||(e=[e]),!(n=(t._gsap||{}).harness)){for(i=Pa.length;i--&&!Pa[i].targetTest(t););n=Pa[i]}for(i=e.length;i--;)e[i]&&(e[i]._gsap||(e[i]._gsap=new ud(e[i],n)))||e.splice(i,1);return e},rr=function(e){return e._gsap||Wc(Rn(e))[0]._gsap},Wf=function(e,t,n){return(n=e[t])&&yt(n)?e[t]():Bc(n)&&e.getAttribute&&e.getAttribute(t)||n},an=function(e,t){return(e=e.split(",")).forEach(t)||e},Tt=function(e){return Math.round(e*1e5)/1e5||0},gt=function(e){return Math.round(e*1e7)/1e7||0},Fr=function(e,t){var n=t.charAt(0),i=parseFloat(t.substr(2));return e=parseFloat(e),n==="+"?e+i:n==="-"?e-i:n==="*"?e*i:e/i},ay=function(e,t){for(var n=t.length,i=0;e.indexOf(t[i])<0&&++i<n;);return i<n},ka=function(){var e=Li.length,t=Li.slice(0),n,i;for(Xl={},Li.length=0,n=0;n<e;n++)i=t[n],i&&i._lazy&&(i.render(i._lazy[0],i._lazy[1],!0)._lazy=0)},Xc=function(e){return!!(e._initted||e._startAt||e.add)},Xf=function(e,t,n,i){Li.length&&!Nt&&ka(),e.render(t,n,!!(Nt&&t<0&&Xc(e))),Li.length&&!Nt&&ka()},qf=function(e){var t=parseFloat(e);return(t||t===0)&&(e+"").match(ny).length<2?t:It(e)?e.trim():e},Yf=function(e){return e},Mn=function(e,t){for(var n in t)n in e||(e[n]=t[n]);return e},oy=function(e){return function(t,n){for(var i in n)i in t||i==="duration"&&e||i==="ease"||(t[i]=n[i])}},jr=function(e,t){for(var n in t)e[n]=t[n];return e},Au=function s(e,t){for(var n in t)n!=="__proto__"&&n!=="constructor"&&n!=="prototype"&&(e[n]=jn(t[n])?s(e[n]||(e[n]={}),t[n]):t[n]);return e},za=function(e,t){var n={},i;for(i in e)i in t||(n[i]=e[i]);return n},bs=function(e){var t=e.parent||_t,n=e.keyframes?oy(Gt(e.keyframes)):Mn;if(sn(e.inherit))for(;t;)n(e,t.vars.defaults),t=t.parent||t._dp;return e},ly=function(e,t){for(var n=e.length,i=n===t.length;i&&n--&&e[n]===t[n];);return n<0},jf=function(e,t,n,i,r){var a=e[i],o;if(r)for(o=t[r];a&&a[r]>o;)a=a._prev;return a?(t._next=a._next,a._next=t):(t._next=e[n],e[n]=t),t._next?t._next._prev=t:e[i]=t,t._prev=a,t.parent=t._dp=e,t},Za=function(e,t,n,i){n===void 0&&(n="_first"),i===void 0&&(i="_last");var r=t._prev,a=t._next;r?r._next=a:e[n]===t&&(e[n]=a),a?a._prev=r:e[i]===t&&(e[i]=r),t._next=t._prev=t.parent=null},Ni=function(e,t){e.parent&&(!t||e.parent.autoRemoveChildren)&&e.parent.remove&&e.parent.remove(e),e._act=0},sr=function(e,t){if(e&&(!t||t._end>e._dur||t._start<0))for(var n=e;n;)n._dirty=1,n=n.parent;return e},cy=function(e){for(var t=e.parent;t&&t.parent;)t._dirty=1,t.totalDuration(),t=t.parent;return e},ql=function(e,t,n,i){return e._startAt&&(Nt?e._startAt.revert(Ca):e.vars.immediateRender&&!e.vars.autoRevert||e._startAt.render(t,!0,i))},hy=function s(e){return!e||e._ts&&s(e.parent)},Ru=function(e){return e._repeat?Kr(e._tTime,e=e.duration()+e._rDelay)*e:0},Kr=function(e,t){var n=Math.floor(e=gt(e/t));return e&&n===e?n-1:n},Ha=function(e,t){return(e-t._start)*t._ts+(t._ts>=0?0:t._dirty?t.totalDuration():t._tDur)},Ja=function(e){return e._end=gt(e._start+(e._tDur/Math.abs(e._ts||e._rts||ot)||0))},Qa=function(e,t){var n=e._dp;return n&&n.smoothChildTiming&&e._ts&&(e._start=gt(n._time-(e._ts>0?t/e._ts:((e._dirty?e.totalDuration():e._tDur)-t)/-e._ts)),Ja(e),n._dirty||sr(n,e)),e},Kf=function(e,t){var n;if((t._time||!t._dur&&t._initted||t._start<e._time&&(t._dur||!t.add))&&(n=Ha(e.rawTime(),t),(!t._dur||qs(0,t.totalDuration(),n)-t._tTime>ot)&&t.render(n,!0)),sr(e,t)._dp&&e._initted&&e._time>=e._dur&&e._ts){if(e._dur<e.duration())for(n=e;n._dp;)n.rawTime()>=0&&n.totalTime(n._tTime),n=n._dp;e._zTime=-ot}},Gn=function(e,t,n,i){return t.parent&&Ni(t),t._start=gt((mi(n)?n:n||e!==_t?En(e,n,t):e._time)+t._delay),t._end=gt(t._start+(t.totalDuration()/Math.abs(t.timeScale())||0)),jf(e,t,"_first","_last",e._sort?"_start":0),Yl(t)||(e._recent=t),i||Kf(e,t),e._ts<0&&Qa(e,e._tTime),e},$f=function(e,t){return(yn.ScrollTrigger||Hc("scrollTrigger",t))&&yn.ScrollTrigger.create(t,e)},Zf=function(e,t,n,i,r){if(Yc(e,t,r),!e._initted)return 1;if(!n&&e._pt&&!Nt&&(e._dur&&e.vars.lazy!==!1||!e._dur&&e.vars.lazy)&&Gf!==mn.frame)return Li.push(e),e._lazy=[r,i],1},uy=function s(e){var t=e.parent;return t&&t._ts&&t._initted&&!t._lock&&(t.rawTime()<0||s(t))},Yl=function(e){var t=e.data;return t==="isFromStart"||t==="isStart"},fy=function(e,t,n,i){var r=e.ratio,a=t<0||!t&&(!e._start&&uy(e)&&!(!e._initted&&Yl(e))||(e._ts<0||e._dp._ts<0)&&!Yl(e))?0:1,o=e._rDelay,l=0,c,h,u;if(o&&e._repeat&&(l=qs(0,e._tDur,t),h=Kr(l,o),e._yoyo&&h&1&&(a=1-a),h!==Kr(e._tTime,o)&&(r=1-a,e.vars.repeatRefresh&&e._initted&&e.invalidate())),a!==r||Nt||i||e._zTime===ot||!t&&e._zTime){if(!e._initted&&Zf(e,t,i,n,l))return;for(u=e._zTime,e._zTime=t||(n?ot:0),n||(n=t&&!u),e.ratio=a,e._from&&(a=1-a),e._time=0,e._tTime=l,c=e._pt;c;)c.r(a,c.d),c=c._next;t<0&&ql(e,t,n,!0),e._onUpdate&&!n&&gn(e,"onUpdate"),l&&e._repeat&&!n&&e.parent&&gn(e,"onRepeat"),(t>=e._tDur||t<0)&&e.ratio===a&&(a&&Ni(e,1),!n&&!Nt&&(gn(e,a?"onComplete":"onReverseComplete",!0),e._prom&&e._prom()))}else e._zTime||(e._zTime=t)},dy=function(e,t,n){var i;if(n>t)for(i=e._first;i&&i._start<=n;){if(i.data==="isPause"&&i._start>t)return i;i=i._next}else for(i=e._last;i&&i._start>=n;){if(i.data==="isPause"&&i._start<t)return i;i=i._prev}},$r=function(e,t,n,i){var r=e._repeat,a=gt(t)||0,o=e._tTime/e._tDur;return o&&!i&&(e._time*=a/e._dur),e._dur=a,e._tDur=r?r<0?1e10:gt(a*(r+1)+e._rDelay*r):a,o>0&&!i&&Qa(e,e._tTime=e._tDur*o),e.parent&&Ja(e),n||sr(e.parent,e),e},Cu=function(e){return e instanceof tn?sr(e):$r(e,e._dur)},py={_start:0,endTime:Os,totalDuration:Os},En=function s(e,t,n){var i=e.labels,r=e._recent||py,a=e.duration()>=An?r.endTime(!1):e._dur,o,l,c;return It(t)&&(isNaN(t)||t in i)?(l=t.charAt(0),c=t.substr(-1)==="%",o=t.indexOf("="),l==="<"||l===">"?(o>=0&&(t=t.replace(/=/,"")),(l==="<"?r._start:r.endTime(r._repeat>=0))+(parseFloat(t.substr(1))||0)*(c?(o<0?r:n).totalDuration()/100:1)):o<0?(t in i||(i[t]=a),i[t]):(l=parseFloat(t.charAt(o-1)+t.substr(o+1)),c&&n&&(l=l/100*(Gt(n)?n[0]:n).totalDuration()),o>1?s(e,t.substr(0,o-1),n)+l:a+l)):t==null?a:+t},Es=function(e,t,n){var i=mi(t[1]),r=(i?2:1)+(e<2?0:1),a=t[r],o,l;if(i&&(a.duration=t[1]),a.parent=n,e){for(o=a,l=n;l&&!("immediateRender"in o);)o=l.vars.defaults||{},l=sn(l.vars.inherit)&&l.parent;a.immediateRender=sn(o.immediateRender),e<2?a.runBackwards=1:a.startAt=t[r-1]}return new Et(t[0],a,t[r+1])},ki=function(e,t){return e||e===0?t(e):t},qs=function(e,t,n){return n<e?e:n>t?t:n},zt=function(e,t){return!It(e)||!(t=iy.exec(e))?"":t[1]},my=function(e,t,n){return ki(n,function(i){return qs(e,t,i)})},jl=[].slice,Jf=function(e,t){return e&&jn(e)&&"length"in e&&(!t&&!e.length||e.length-1 in e&&jn(e[0]))&&!e.nodeType&&e!==Hn},gy=function(e,t,n){return n===void 0&&(n=[]),e.forEach(function(i){var r;return It(i)&&!t||Jf(i,1)?(r=n).push.apply(r,Rn(i)):n.push(i)})||n},Rn=function(e,t,n){return dt&&!t&&dt.selector?dt.selector(e):It(e)&&!n&&(Wl||!Zr())?jl.call((t||zc).querySelectorAll(e),0):Gt(e)?gy(e,n):Jf(e)?jl.call(e,0):e?[e]:[]},Kl=function(e){return e=Rn(e)[0]||Fs("Invalid scope")||{},function(t){var n=e.current||e.nativeElement||e;return Rn(t,n.querySelectorAll?n:n===e?Fs("Invalid scope")||zc.createElement("div"):e)}},Qf=function(e){return e.sort(function(){return .5-Math.random()})},ed=function(e){if(yt(e))return e;var t=jn(e)?e:{each:e},n=ar(t.ease),i=t.from||0,r=parseFloat(t.base)||0,a={},o=i>0&&i<1,l=isNaN(i)||o,c=t.axis,h=i,u=i;return It(i)?h=u={center:.5,edges:.5,end:1}[i]||0:!o&&l&&(h=i[0],u=i[1]),function(f,d,_){var g=(_||t).length,m=a[g],p,M,x,v,S,A,w,R,y;if(!m){if(y=t.grid==="auto"?0:(t.grid||[1,An])[1],!y){for(w=-An;w<(w=_[y++].getBoundingClientRect().left)&&y<g;);y<g&&y--}for(m=a[g]=[],p=l?Math.min(y,g)*h-.5:i%y,M=y===An?0:l?g*u/y-.5:i/y|0,w=0,R=An,A=0;A<g;A++)x=A%y-p,v=M-(A/y|0),m[A]=S=c?Math.abs(c==="y"?v:x):Ff(x*x+v*v),S>w&&(w=S),S<R&&(R=S);i==="random"&&Qf(m),m.max=w-R,m.min=R,m.v=g=(parseFloat(t.amount)||parseFloat(t.each)*(y>g?g-1:c?c==="y"?g/y:y:Math.max(y,g/y))||0)*(i==="edges"?-1:1),m.b=g<0?r-g:r,m.u=zt(t.amount||t.each)||0,n=n&&g<0?Cy(n):n}return g=(m[f]-m.min)/m.max||0,gt(m.b+(n?n(g):g)*m.v)+m.u}},$l=function(e){var t=Math.pow(10,((e+"").split(".")[1]||"").length);return function(n){var i=gt(Math.round(parseFloat(n)/e)*e*t);return(i-i%1)/t+(mi(n)?0:zt(n))}},td=function(e,t){var n=Gt(e),i,r;return!n&&jn(e)&&(i=n=e.radius||An,e.values?(e=Rn(e.values),(r=!mi(e[0]))&&(i*=i)):e=$l(e.increment)),ki(t,n?yt(e)?function(a){return r=e(a),Math.abs(r-a)<=i?r:a}:function(a){for(var o=parseFloat(r?a.x:a),l=parseFloat(r?a.y:0),c=An,h=0,u=e.length,f,d;u--;)r?(f=e[u].x-o,d=e[u].y-l,f=f*f+d*d):f=Math.abs(e[u]-o),f<c&&(c=f,h=u);return h=!i||c<=i?e[h]:a,r||h===a||mi(a)?h:h+zt(a)}:$l(e))},nd=function(e,t,n,i){return ki(Gt(e)?!t:n===!0?!!(n=0):!i,function(){return Gt(e)?e[~~(Math.random()*e.length)]:(n=n||1e-5)&&(i=n<1?Math.pow(10,(n+"").length-2):1)&&Math.floor(Math.round((e-n/2+Math.random()*(t-e+n*.99))/n)*n*i)/i})},_y=function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return function(i){return t.reduce(function(r,a){return a(r)},i)}},vy=function(e,t){return function(n){return e(parseFloat(n))+(t||zt(n))}},xy=function(e,t,n){return rd(e,t,0,1,n)},id=function(e,t,n){return ki(n,function(i){return e[~~t(i)]})},yy=function s(e,t,n){var i=t-e;return Gt(e)?id(e,s(0,e.length),t):ki(n,function(r){return(i+(r-e)%i)%i+e})},My=function s(e,t,n){var i=t-e,r=i*2;return Gt(e)?id(e,s(0,e.length-1),t):ki(n,function(a){return a=(r+(a-e)%r)%r||0,e+(a>i?r-a:a)})},Bs=function(e){return e.replace(ey,function(t){var n=t.indexOf("[")+1,i=t.substring(n||7,n?t.indexOf("]"):t.length-1).split(ty);return nd(n?i:+i[0],n?0:+i[1],+i[2]||1e-5)})},rd=function(e,t,n,i,r){var a=t-e,o=i-n;return ki(r,function(l){return n+((l-e)/a*o||0)})},Sy=function s(e,t,n,i){var r=isNaN(e+t)?0:function(d){return(1-d)*e+d*t};if(!r){var a=It(e),o={},l,c,h,u,f;if(n===!0&&(i=1)&&(n=null),a)e={p:e},t={p:t};else if(Gt(e)&&!Gt(t)){for(h=[],u=e.length,f=u-2,c=1;c<u;c++)h.push(s(e[c-1],e[c]));u--,r=function(_){_*=u;var g=Math.min(f,~~_);return h[g](_-g)},n=t}else i||(e=jr(Gt(e)?[]:{},e));if(!h){for(l in t)qc.call(o,e,l,"get",t[l]);r=function(_){return $c(_,o)||(a?e.p:e)}}}return ki(n,r)},Pu=function(e,t,n){var i=e.labels,r=An,a,o,l;for(a in i)o=i[a]-t,o<0==!!n&&o&&r>(o=Math.abs(o))&&(l=a,r=o);return l},gn=function(e,t,n){var i=e.vars,r=i[t],a=dt,o=e._ctx,l,c,h;if(r)return l=i[t+"Params"],c=i.callbackScope||e,n&&Li.length&&ka(),o&&(dt=o),h=l?r.apply(c,l):r.call(c),dt=a,h},xs=function(e){return Ni(e),e.scrollTrigger&&e.scrollTrigger.kill(!!Nt),e.progress()<1&&gn(e,"onInterrupt"),e},Ir,sd=[],ad=function(e){if(e)if(e=!e.name&&e.default||e,kc()||e.headless){var t=e.name,n=yt(e),i=t&&!n&&e.init?function(){this._props=[]}:e,r={init:Os,render:$c,add:qc,kill:ky,modifier:By,rawVars:0},a={targetTest:0,get:0,getSetter:Kc,aliases:{},register:0};if(Zr(),e!==i){if(pn[t])return;Mn(i,Mn(za(e,r),a)),jr(i.prototype,jr(r,za(e,a))),pn[i.prop=t]=i,e.targetTest&&(Pa.push(i),Vc[t]=1),t=(t==="css"?"CSS":t.charAt(0).toUpperCase()+t.substr(1))+"Plugin"}Vf(t,i),e.register&&e.register(cn,i,on)}else sd.push(e)},at=255,ys={aqua:[0,at,at],lime:[0,at,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,at],navy:[0,0,128],white:[at,at,at],olive:[128,128,0],yellow:[at,at,0],orange:[at,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[at,0,0],pink:[at,192,203],cyan:[0,at,at],transparent:[at,at,at,0]},Ho=function(e,t,n){return e+=e<0?1:e>1?-1:0,(e*6<1?t+(n-t)*e*6:e<.5?n:e*3<2?t+(n-t)*(2/3-e)*6:t)*at+.5|0},od=function(e,t,n){var i=e?mi(e)?[e>>16,e>>8&at,e&at]:0:ys.black,r,a,o,l,c,h,u,f,d,_;if(!i){if(e.substr(-1)===","&&(e=e.substr(0,e.length-1)),ys[e])i=ys[e];else if(e.charAt(0)==="#"){if(e.length<6&&(r=e.charAt(1),a=e.charAt(2),o=e.charAt(3),e="#"+r+r+a+a+o+o+(e.length===5?e.charAt(4)+e.charAt(4):"")),e.length===9)return i=parseInt(e.substr(1,6),16),[i>>16,i>>8&at,i&at,parseInt(e.substr(7),16)/255];e=parseInt(e.substr(1),16),i=[e>>16,e>>8&at,e&at]}else if(e.substr(0,3)==="hsl"){if(i=_=e.match(Eu),!t)l=+i[0]%360/360,c=+i[1]/100,h=+i[2]/100,a=h<=.5?h*(c+1):h+c-h*c,r=h*2-a,i.length>3&&(i[3]*=1),i[0]=Ho(l+1/3,r,a),i[1]=Ho(l,r,a),i[2]=Ho(l-1/3,r,a);else if(~e.indexOf("="))return i=e.match(Bf),n&&i.length<4&&(i[3]=1),i}else i=e.match(Eu)||ys.transparent;i=i.map(Number)}return t&&!_&&(r=i[0]/at,a=i[1]/at,o=i[2]/at,u=Math.max(r,a,o),f=Math.min(r,a,o),h=(u+f)/2,u===f?l=c=0:(d=u-f,c=h>.5?d/(2-u-f):d/(u+f),l=u===r?(a-o)/d+(a<o?6:0):u===a?(o-r)/d+2:(r-a)/d+4,l*=60),i[0]=~~(l+.5),i[1]=~~(c*100+.5),i[2]=~~(h*100+.5)),n&&i.length<4&&(i[3]=1),i},ld=function(e){var t=[],n=[],i=-1;return e.split(Ii).forEach(function(r){var a=r.match(Lr)||[];t.push.apply(t,a),n.push(i+=a.length+1)}),t.c=n,t},Du=function(e,t,n){var i="",r=(e+i).match(Ii),a=t?"hsla(":"rgba(",o=0,l,c,h,u;if(!r)return e;if(r=r.map(function(f){return(f=od(f,t,1))&&a+(t?f[0]+","+f[1]+"%,"+f[2]+"%,"+f[3]:f.join(","))+")"}),n&&(h=ld(e),l=n.c,l.join(i)!==h.c.join(i)))for(c=e.replace(Ii,"1").split(Lr),u=c.length-1;o<u;o++)i+=c[o]+(~l.indexOf(o)?r.shift()||a+"0,0,0,0)":(h.length?h:r.length?r:n).shift());if(!c)for(c=e.split(Ii),u=c.length-1;o<u;o++)i+=c[o]+r[o];return i+c[u]},Ii=(function(){var s="(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b",e;for(e in ys)s+="|"+e+"\\b";return new RegExp(s+")","gi")})(),Ty=/hsl[a]?\(/,cd=function(e){var t=e.join(" "),n;if(Ii.lastIndex=0,Ii.test(t))return n=Ty.test(t),e[1]=Du(e[1],n),e[0]=Du(e[0],n,ld(e[1])),!0},ks,mn=(function(){var s=Date.now,e=500,t=33,n=s(),i=n,r=1e3/240,a=r,o=[],l,c,h,u,f,d,_=function g(m){var p=s()-i,M=m===!0,x,v,S,A;if((p>e||p<0)&&(n+=p-t),i+=p,S=i-n,x=S-a,(x>0||M)&&(A=++u.frame,f=S-u.time*1e3,u.time=S=S/1e3,a+=x+(x>=r?4:r-x),v=1),M||(l=c(g)),v)for(d=0;d<o.length;d++)o[d](S,f,A,m)};return u={time:0,frame:0,tick:function(){_(!0)},deltaRatio:function(m){return f/(1e3/(m||60))},wake:function(){zf&&(!Wl&&kc()&&(Hn=Wl=window,zc=Hn.document||{},yn.gsap=cn,(Hn.gsapVersions||(Hn.gsapVersions=[])).push(cn.version),Hf(Ba||Hn.GreenSockGlobals||!Hn.gsap&&Hn||{}),sd.forEach(ad)),h=typeof requestAnimationFrame<"u"&&requestAnimationFrame,l&&u.sleep(),c=h||function(m){return setTimeout(m,a-u.time*1e3+1|0)},ks=1,_(2))},sleep:function(){(h?cancelAnimationFrame:clearTimeout)(l),ks=0,c=Os},lagSmoothing:function(m,p){e=m||1/0,t=Math.min(p||33,e)},fps:function(m){r=1e3/(m||240),a=u.time*1e3+r},add:function(m,p,M){var x=p?function(v,S,A,w){m(v,S,A,w),u.remove(x)}:m;return u.remove(m),o[M?"unshift":"push"](x),Zr(),x},remove:function(m,p){~(p=o.indexOf(m))&&o.splice(p,1)&&d>=p&&d--},_listeners:o},u})(),Zr=function(){return!ks&&mn.wake()},je={},by=/^[\d.\-M][\d.\-,\s]/,Ey=/["']/g,wy=function(e){for(var t={},n=e.substr(1,e.length-3).split(":"),i=n[0],r=1,a=n.length,o,l,c;r<a;r++)l=n[r],o=r!==a-1?l.lastIndexOf(","):l.length,c=l.substr(0,o),t[i]=isNaN(c)?c.replace(Ey,"").trim():+c,i=l.substr(o+1).trim();return t},Ay=function(e){var t=e.indexOf("(")+1,n=e.indexOf(")"),i=e.indexOf("(",t);return e.substring(t,~i&&i<n?e.indexOf(")",n+1):n)},Ry=function(e){var t=(e+"").split("("),n=je[t[0]];return n&&t.length>1&&n.config?n.config.apply(null,~e.indexOf("{")?[wy(t[1])]:Ay(e).split(",").map(qf)):je._CE&&by.test(e)?je._CE("",e):n},Cy=function(e){return function(t){return 1-e(1-t)}},ar=function(e,t){return e&&(yt(e)?e:je[e]||Ry(e))||t},hr=function(e,t,n,i){n===void 0&&(n=function(l){return 1-t(1-l)}),i===void 0&&(i=function(l){return l<.5?t(l*2)/2:1-t((1-l)*2)/2});var r={easeIn:t,easeOut:n,easeInOut:i},a;return an(e,function(o){je[o]=yn[o]=r,je[a=o.toLowerCase()]=n;for(var l in r)je[a+(l==="easeIn"?".in":l==="easeOut"?".out":".inOut")]=je[o+"."+l]=r[l]}),r},hd=function(e){return function(t){return t<.5?(1-e(1-t*2))/2:.5+e((t-.5)*2)/2}},Vo=function s(e,t,n){var i=t>=1?t:1,r=(n||(e?.3:.45))/(t<1?t:1),a=r/Gl*(Math.asin(1/i)||0),o=function(h){return h===1?1:i*Math.pow(2,-10*h)*Qx((h-a)*r)+1},l=e==="out"?o:e==="in"?function(c){return 1-o(1-c)}:hd(o);return r=Gl/r,l.config=function(c,h){return s(e,c,h)},l},Go=function s(e,t){t===void 0&&(t=1.70158);var n=function(a){return a?--a*a*((t+1)*a+t)+1:0},i=e==="out"?n:e==="in"?function(r){return 1-n(1-r)}:hd(n);return i.config=function(r){return s(e,r)},i};an("Linear,Quad,Cubic,Quart,Quint,Strong",function(s,e){var t=e<5?e+1:e;hr(s+",Power"+(t-1),e?function(n){return Math.pow(n,t)}:function(n){return n},function(n){return 1-Math.pow(1-n,t)},function(n){return n<.5?Math.pow(n*2,t)/2:1-Math.pow((1-n)*2,t)/2})});je.Linear.easeNone=je.none=je.Linear.easeIn;hr("Elastic",Vo("in"),Vo("out"),Vo());(function(s,e){var t=1/e,n=2*t,i=2.5*t,r=function(o){return o<t?s*o*o:o<n?s*Math.pow(o-1.5/e,2)+.75:o<i?s*(o-=2.25/e)*o+.9375:s*Math.pow(o-2.625/e,2)+.984375};hr("Bounce",function(a){return 1-r(1-a)},r)})(7.5625,2.75);hr("Expo",function(s){return Math.pow(2,10*(s-1))*s+s*s*s*s*s*s*(1-s)});hr("Circ",function(s){return-(Ff(1-s*s)-1)});hr("Sine",function(s){return s===1?1:-Jx(s*$x)+1});hr("Back",Go("in"),Go("out"),Go());je.SteppedEase=je.steps=yn.SteppedEase={config:function(e,t){e===void 0&&(e=1);var n=1/e,i=e+(t?0:1),r=t?1:0,a=1-ot;return function(o){return((i*qs(0,a,o)|0)+r)*n}}};Ns.ease=je["quad.out"];an("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt",function(s){return Gc+=s+","+s+"Params,"});var ud=function(e,t){this.id=Zx++,e._gsap=this,this.target=e,this.harness=t,this.get=t?t.get:Wf,this.set=t?t.getSetter:Kc},zs=(function(){function s(t){this.vars=t,this._delay=+t.delay||0,(this._repeat=t.repeat===1/0?-2:t.repeat||0)&&(this._rDelay=t.repeatDelay||0,this._yoyo=!!t.yoyo||!!t.yoyoEase),this._ts=1,$r(this,+t.duration,1,1),this.data=t.data,dt&&(this._ctx=dt,dt.data.push(this)),ks||mn.wake()}var e=s.prototype;return e.delay=function(n){return n||n===0?(this.parent&&this.parent.smoothChildTiming&&this.startTime(this._start+n-this._delay),this._delay=n,this):this._delay},e.duration=function(n){return arguments.length?this.totalDuration(this._repeat>0?n+(n+this._rDelay)*this._repeat:n):this.totalDuration()&&this._dur},e.totalDuration=function(n){return arguments.length?(this._dirty=0,$r(this,this._repeat<0?n:(n-this._repeat*this._rDelay)/(this._repeat+1))):this._tDur},e.totalTime=function(n,i){if(Zr(),!arguments.length)return this._tTime;var r=this._dp;if(r&&r.smoothChildTiming&&this._ts){for(Qa(this,n),!r._dp||r.parent||Kf(r,this);r&&r.parent;)r.parent._time!==r._start+(r._ts>=0?r._tTime/r._ts:(r.totalDuration()-r._tTime)/-r._ts)&&r.totalTime(r._tTime,!0),r=r.parent;!this.parent&&this._dp.autoRemoveChildren&&(this._ts>0&&n<this._tDur||this._ts<0&&n>0||!this._tDur&&!n)&&Gn(this._dp,this,this._start-this._delay)}return(this._tTime!==n||!this._dur&&!i||this._initted&&Math.abs(this._zTime)===ot||!this._initted&&this._dur&&n||!n&&!this._initted&&(this.add||this._ptLookup))&&(this._ts||(this._pTime=n),Xf(this,n,i)),this},e.time=function(n,i){return arguments.length?this.totalTime(Math.min(this.totalDuration(),n+Ru(this))%(this._dur+this._rDelay)||(n?this._dur:0),i):this._time},e.totalProgress=function(n,i){return arguments.length?this.totalTime(this.totalDuration()*n,i):this.totalDuration()?Math.min(1,this._tTime/this._tDur):this.rawTime()>=0&&this._initted?1:0},e.progress=function(n,i){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&!(this.iteration()&1)?1-n:n)+Ru(this),i):this.duration()?Math.min(1,this._time/this._dur):this.rawTime()>0?1:0},e.iteration=function(n,i){var r=this.duration()+this._rDelay;return arguments.length?this.totalTime(this._time+(n-1)*r,i):this._repeat?Kr(this._tTime,r)+1:1},e.timeScale=function(n,i){if(!arguments.length)return this._rts===-ot?0:this._rts;if(this._rts===n)return this;var r=this.parent&&this._ts?Ha(this.parent._time,this):this._tTime;return this._rts=+n||0,this._ts=this._ps||n===-ot?0:this._rts,this.totalTime(qs(-Math.abs(this._delay),this.totalDuration(),r),i!==!1),Ja(this),cy(this)},e.paused=function(n){return arguments.length?(this._ps!==n&&(this._ps=n,n?(this._pTime=this._tTime||Math.max(-this._delay,this.rawTime()),this._ts=this._act=0):(Zr(),this._ts=this._rts,this.totalTime(this.parent&&!this.parent.smoothChildTiming?this.rawTime():this._tTime||this._pTime,this.progress()===1&&Math.abs(this._zTime)!==ot&&(this._tTime-=ot)))),this):this._ps},e.startTime=function(n){if(arguments.length){this._start=gt(n);var i=this.parent||this._dp;return i&&(i._sort||!this.parent)&&Gn(i,this,this._start-this._delay),this}return this._start},e.endTime=function(n){return this._start+(sn(n)?this.totalDuration():this.duration())/Math.abs(this._ts||1)},e.rawTime=function(n){var i=this.parent||this._dp;return i?n&&(!this._ts||this._repeat&&this._time&&this.totalProgress()<1)?this._tTime%(this._dur+this._rDelay):this._ts?Ha(i.rawTime(n),this):this._tTime:this._tTime},e.revert=function(n){n===void 0&&(n=sy);var i=Nt;return Nt=n,Xc(this)&&(this.timeline&&this.timeline.revert(n),this.totalTime(-.01,n.suppressEvents)),this.data!=="nested"&&n.kill!==!1&&this.kill(),Nt=i,this},e.globalTime=function(n){for(var i=this,r=arguments.length?n:i.rawTime();i;)r=i._start+r/(Math.abs(i._ts)||1),i=i._dp;return!this.parent&&this._sat?this._sat.globalTime(n):r},e.repeat=function(n){return arguments.length?(this._repeat=n===1/0?-2:n,Cu(this)):this._repeat===-2?1/0:this._repeat},e.repeatDelay=function(n){if(arguments.length){var i=this._time;return this._rDelay=n,Cu(this),i?this.time(i):this}return this._rDelay},e.yoyo=function(n){return arguments.length?(this._yoyo=n,this):this._yoyo},e.seek=function(n,i){return this.totalTime(En(this,n),sn(i))},e.restart=function(n,i){return this.play().totalTime(n?-this._delay:0,sn(i)),this._dur||(this._zTime=-ot),this},e.play=function(n,i){return n!=null&&this.seek(n,i),this.reversed(!1).paused(!1)},e.reverse=function(n,i){return n!=null&&this.seek(n||this.totalDuration(),i),this.reversed(!0).paused(!1)},e.pause=function(n,i){return n!=null&&this.seek(n,i),this.paused(!0)},e.resume=function(){return this.paused(!1)},e.reversed=function(n){return arguments.length?(!!n!==this.reversed()&&this.timeScale(-this._rts||(n?-ot:0)),this):this._rts<0},e.invalidate=function(){return this._initted=this._act=0,this._zTime=-ot,this},e.isActive=function(){var n=this.parent||this._dp,i=this._start,r;return!!(!n||this._ts&&this._initted&&n.isActive()&&(r=n.rawTime(!0))>=i&&r<this.endTime(!0)-ot)},e.eventCallback=function(n,i,r){var a=this.vars;return arguments.length>1?(i?(a[n]=i,r&&(a[n+"Params"]=r),n==="onUpdate"&&(this._onUpdate=i)):delete a[n],this):a[n]},e.then=function(n){var i=this,r=i._prom;return new Promise(function(a){var o=yt(n)?n:Yf,l=function(){var h=i.then;i.then=null,r&&r(),yt(o)&&(o=o(i))&&(o.then||o===i)&&(i.then=h),a(o),i.then=h};i._initted&&i.totalProgress()===1&&i._ts>=0||!i._tTime&&i._ts<0?l():i._prom=l})},e.kill=function(){xs(this)},s})();Mn(zs.prototype,{_time:0,_start:0,_end:0,_tTime:0,_tDur:0,_dirty:0,_repeat:0,_yoyo:!1,parent:null,_initted:!1,_rDelay:0,_ts:1,_dp:0,ratio:0,_zTime:-ot,_prom:0,_ps:!1,_rts:1});var tn=(function(s){Nf(e,s);function e(n,i){var r;return n===void 0&&(n={}),r=s.call(this,n)||this,r.labels={},r.smoothChildTiming=!!n.smoothChildTiming,r.autoRemoveChildren=!!n.autoRemoveChildren,r._sort=sn(n.sortChildren),_t&&Gn(n.parent||_t,si(r),i),n.reversed&&r.reverse(),n.paused&&r.paused(!0),n.scrollTrigger&&$f(si(r),n.scrollTrigger),r}var t=e.prototype;return t.to=function(i,r,a){return Es(0,arguments,this),this},t.from=function(i,r,a){return Es(1,arguments,this),this},t.fromTo=function(i,r,a,o){return Es(2,arguments,this),this},t.set=function(i,r,a){return r.duration=0,r.parent=this,bs(r).repeatDelay||(r.repeat=0),r.immediateRender=!!r.immediateRender,new Et(i,r,En(this,a),1),this},t.call=function(i,r,a){return Gn(this,Et.delayedCall(0,i,r),a)},t.staggerTo=function(i,r,a,o,l,c,h){return a.duration=r,a.stagger=a.stagger||o,a.onComplete=c,a.onCompleteParams=h,a.parent=this,new Et(i,a,En(this,l)),this},t.staggerFrom=function(i,r,a,o,l,c,h){return a.runBackwards=1,bs(a).immediateRender=sn(a.immediateRender),this.staggerTo(i,r,a,o,l,c,h)},t.staggerFromTo=function(i,r,a,o,l,c,h,u){return o.startAt=a,bs(o).immediateRender=sn(o.immediateRender),this.staggerTo(i,r,o,l,c,h,u)},t.render=function(i,r,a){var o=this._time,l=this._dirty?this.totalDuration():this._tDur,c=this._dur,h=i<=0?0:gt(i),u=this._zTime<0!=i<0&&(this._initted||!c),f,d,_,g,m,p,M,x,v,S,A,w;if(this!==_t&&h>l&&i>=0&&(h=l),h!==this._tTime||a||u){if(o!==this._time&&c&&(h+=this._time-o,i+=this._time-o),f=h,v=this._start,x=this._ts,p=!x,u&&(c||(o=this._zTime),(i||!r)&&(this._zTime=i)),this._repeat){if(A=this._yoyo,m=c+this._rDelay,this._repeat<-1&&i<0)return this.totalTime(m*100+i,r,a);if(f=gt(h%m),h===l?(g=this._repeat,f=c):(S=gt(h/m),g=~~S,g&&g===S&&(f=c,g--),f>c&&(f=c)),S=Kr(this._tTime,m),!o&&this._tTime&&S!==g&&this._tTime-S*m-this._dur<=0&&(S=g),A&&g&1&&(f=c-f,w=1),g!==S&&!this._lock){var R=A&&S&1,y=R===(A&&g&1);if(g<S&&(R=!R),o=R?0:h%c?c:h,this._lock=1,this.render(o||(w?0:gt(g*m)),r,!c)._lock=0,this._tTime=h,!r&&this.parent&&gn(this,"onRepeat"),this.vars.repeatRefresh&&!w&&(this.invalidate()._lock=1,S=g),o&&o!==this._time||p!==!this._ts||this.vars.onRepeat&&!this.parent&&!this._act)return this;if(c=this._dur,l=this._tDur,y&&(this._lock=2,o=R?c:-1e-4,this.render(o,!0),this.vars.repeatRefresh&&!w&&this.invalidate()),this._lock=0,!this._ts&&!p)return this}}if(this._hasPause&&!this._forcing&&this._lock<2&&(M=dy(this,gt(o),gt(f)),M&&(h-=f-(f=M._start))),this._tTime=h,this._time=f,this._act=!!x,this._initted||(this._onUpdate=this.vars.onUpdate,this._initted=1,this._zTime=i,o=0),!o&&h&&c&&!r&&!S&&(gn(this,"onStart"),this._tTime!==h))return this;if(f>=o&&i>=0)for(d=this._first;d;){if(_=d._next,(d._act||f>=d._start)&&d._ts&&M!==d){if(d.parent!==this)return this.render(i,r,a);if(d.render(d._ts>0?(f-d._start)*d._ts:(d._dirty?d.totalDuration():d._tDur)+(f-d._start)*d._ts,r,a),f!==this._time||!this._ts&&!p){M=0,_&&(h+=this._zTime=-ot);break}}d=_}else{d=this._last;for(var b=i<0?i:f;d;){if(_=d._prev,(d._act||b<=d._end)&&d._ts&&M!==d){if(d.parent!==this)return this.render(i,r,a);if(d.render(d._ts>0?(b-d._start)*d._ts:(d._dirty?d.totalDuration():d._tDur)+(b-d._start)*d._ts,r,a||Nt&&Xc(d)),f!==this._time||!this._ts&&!p){M=0,_&&(h+=this._zTime=b?-ot:ot);break}}d=_}}if(M&&!r&&(this.pause(),M.render(f>=o?0:-ot)._zTime=f>=o?1:-1,this._ts))return this._start=v,Ja(this),this.render(i,r,a);this._onUpdate&&!r&&gn(this,"onUpdate",!0),(h===l&&this._tTime>=this.totalDuration()||!h&&o)&&(v===this._start||Math.abs(x)!==Math.abs(this._ts))&&(this._lock||((i||!c)&&(h===l&&this._ts>0||!h&&this._ts<0)&&Ni(this,1),!r&&!(i<0&&!o)&&(h||o||!l)&&(gn(this,h===l&&i>=0?"onComplete":"onReverseComplete",!0),this._prom&&!(h<l&&this.timeScale()>0)&&this._prom())))}return this},t.add=function(i,r){var a=this;if(mi(r)||(r=En(this,r,i)),!(i instanceof zs)){if(Gt(i))return i.forEach(function(o){return a.add(o,r)}),this;if(It(i))return this.addLabel(i,r);if(yt(i))i=Et.delayedCall(0,i);else return this}return this!==i?Gn(this,i,r):this},t.getChildren=function(i,r,a,o){i===void 0&&(i=!0),r===void 0&&(r=!0),a===void 0&&(a=!0),o===void 0&&(o=-An);for(var l=[],c=this._first;c;)c._start>=o&&(c instanceof Et?r&&l.push(c):(a&&l.push(c),i&&l.push.apply(l,c.getChildren(!0,r,a)))),c=c._next;return l},t.getById=function(i){for(var r=this.getChildren(1,1,1),a=r.length;a--;)if(r[a].vars.id===i)return r[a]},t.remove=function(i){return It(i)?this.removeLabel(i):yt(i)?this.killTweensOf(i):(i.parent===this&&Za(this,i),i===this._recent&&(this._recent=this._last),sr(this))},t.totalTime=function(i,r){return arguments.length?(this._forcing=1,!this._dp&&this._ts&&(this._start=gt(mn.time-(this._ts>0?i/this._ts:(this.totalDuration()-i)/-this._ts))),s.prototype.totalTime.call(this,i,r),this._forcing=0,this):this._tTime},t.addLabel=function(i,r){return this.labels[i]=En(this,r),this},t.removeLabel=function(i){return delete this.labels[i],this},t.addPause=function(i,r,a){var o=Et.delayedCall(0,r||Os,a);return o.data="isPause",this._hasPause=1,Gn(this,o,En(this,i))},t.removePause=function(i){var r=this._first;for(i=En(this,i);r;)r._start===i&&r.data==="isPause"&&Ni(r),r=r._next},t.killTweensOf=function(i,r,a){for(var o=this.getTweensOf(i,a),l=o.length;l--;)Ai!==o[l]&&o[l].kill(i,r);return this},t.getTweensOf=function(i,r){for(var a=[],o=Rn(i),l=this._first,c=mi(r),h;l;)l instanceof Et?ay(l._targets,o)&&(c?(!Ai||l._initted&&l._ts)&&l.globalTime(0)<=r&&l.globalTime(l.totalDuration())>r:!r||l.isActive())&&a.push(l):(h=l.getTweensOf(o,r)).length&&a.push.apply(a,h),l=l._next;return a},t.tweenTo=function(i,r){r=r||{};var a=this,o=En(a,i),l=r,c=l.startAt,h=l.onStart,u=l.onStartParams,f=l.immediateRender,d,_=Et.to(a,Mn({ease:r.ease||"none",lazy:!1,immediateRender:!1,time:o,overwrite:"auto",duration:r.duration||Math.abs((o-(c&&"time"in c?c.time:a._time))/a.timeScale())||ot,onStart:function(){if(a.pause(),!d){var m=r.duration||Math.abs((o-(c&&"time"in c?c.time:a._time))/a.timeScale());_._dur!==m&&$r(_,m,0,1).render(_._time,!0,!0),d=1}h&&h.apply(_,u||[])}},r));return f?_.render(0):_},t.tweenFromTo=function(i,r,a){return this.tweenTo(r,Mn({startAt:{time:En(this,i)}},a))},t.recent=function(){return this._recent},t.nextLabel=function(i){return i===void 0&&(i=this._time),Pu(this,En(this,i))},t.previousLabel=function(i){return i===void 0&&(i=this._time),Pu(this,En(this,i),1)},t.currentLabel=function(i){return arguments.length?this.seek(i,!0):this.previousLabel(this._time+ot)},t.shiftChildren=function(i,r,a){a===void 0&&(a=0);var o=this._first,l=this.labels,c;for(i=gt(i);o;)o._start>=a&&(o._start+=i,o._end+=i),o=o._next;if(r)for(c in l)l[c]>=a&&(l[c]+=i);return sr(this)},t.invalidate=function(i){var r=this._first;for(this._lock=0;r;)r.invalidate(i),r=r._next;return s.prototype.invalidate.call(this,i)},t.clear=function(i){i===void 0&&(i=!0);for(var r=this._first,a;r;)a=r._next,this.remove(r),r=a;return this._dp&&(this._time=this._tTime=this._pTime=0),i&&(this.labels={}),sr(this)},t.totalDuration=function(i){var r=0,a=this,o=a._last,l=An,c,h,u;if(arguments.length)return a.timeScale((a._repeat<0?a.duration():a.totalDuration())/(a.reversed()?-i:i));if(a._dirty){for(u=a.parent;o;)c=o._prev,o._dirty&&o.totalDuration(),h=o._start,h>l&&a._sort&&o._ts&&!a._lock?(a._lock=1,Gn(a,o,h-o._delay,1)._lock=0):l=h,h<0&&o._ts&&(r-=h,(!u&&!a._dp||u&&u.smoothChildTiming)&&(a._start+=gt(h/a._ts),a._time-=h,a._tTime-=h),a.shiftChildren(-h,!1,-1/0),l=0),o._end>r&&o._ts&&(r=o._end),o=c;$r(a,a===_t&&a._time>r?a._time:r,1,1),a._dirty=0}return a._tDur},e.updateRoot=function(i){if(_t._ts&&(Xf(_t,Ha(i,_t)),Gf=mn.frame),mn.frame>=wu){wu+=vn.autoSleep||120;var r=_t._first;if((!r||!r._ts)&&vn.autoSleep&&mn._listeners.length<2){for(;r&&!r._ts;)r=r._next;r||mn.sleep()}}},e})(zs);Mn(tn.prototype,{_lock:0,_hasPause:0,_forcing:0});var Py=function(e,t,n,i,r,a,o){var l=new on(this._pt,e,t,0,1,_d,null,r),c=0,h=0,u,f,d,_,g,m,p,M;for(l.b=n,l.e=i,n+="",i+="",(p=~i.indexOf("random("))&&(i=Bs(i)),a&&(M=[n,i],a(M,e,t),n=M[0],i=M[1]),f=n.match(ko)||[];u=ko.exec(i);)_=u[0],g=i.substring(c,u.index),d?d=(d+1)%5:g.substr(-5)==="rgba("&&(d=1),_!==f[h++]&&(m=parseFloat(f[h-1])||0,l._pt={_next:l._pt,p:g||h===1?g:",",s:m,c:_.charAt(1)==="="?Fr(m,_)-m:parseFloat(_)-m,m:d&&d<4?Math.round:0},c=ko.lastIndex);return l.c=c<i.length?i.substring(c,i.length):"",l.fp=o,(kf.test(i)||p)&&(l.e=0),this._pt=l,l},qc=function(e,t,n,i,r,a,o,l,c,h){yt(i)&&(i=i(r||0,e,a));var u=e[t],f=n!=="get"?n:yt(u)?c?e[t.indexOf("set")||!yt(e["get"+t.substr(3)])?t:"get"+t.substr(3)](c):e[t]():u,d=yt(u)?c?Ny:md:jc,_;if(It(i)&&(~i.indexOf("random(")&&(i=Bs(i)),i.charAt(1)==="="&&(_=Fr(f,i)+(zt(f)||0),(_||_===0)&&(i=_))),!h||f!==i||Zl)return!isNaN(f*i)&&i!==""?(_=new on(this._pt,e,t,+f||0,i-(f||0),typeof u=="boolean"?Oy:gd,0,d),c&&(_.fp=c),o&&_.modifier(o,this,e),this._pt=_):(!u&&!(t in e)&&Hc(t,i),Py.call(this,e,t,f,i,d,l||vn.stringFilter,c))},Dy=function(e,t,n,i,r){if(yt(e)&&(e=ws(e,r,t,n,i)),!jn(e)||e.style&&e.nodeType||Gt(e)||Of(e))return It(e)?ws(e,r,t,n,i):e;var a={},o;for(o in e)a[o]=ws(e[o],r,t,n,i);return a},fd=function(e,t,n,i,r,a){var o,l,c,h;if(pn[e]&&(o=new pn[e]).init(r,o.rawVars?t[e]:Dy(t[e],i,r,a,n),n,i,a)!==!1&&(n._pt=l=new on(n._pt,r,e,0,1,o.render,o,0,o.priority),n!==Ir))for(c=n._ptLookup[n._targets.indexOf(r)],h=o._props.length;h--;)c[o._props[h]]=l;return o},Ai,Zl,Yc=function s(e,t,n){var i=e.vars,r=i.ease,a=i.startAt,o=i.immediateRender,l=i.lazy,c=i.onUpdate,h=i.runBackwards,u=i.yoyoEase,f=i.keyframes,d=i.autoRevert,_=e._dur,g=e._startAt,m=e._targets,p=e.parent,M=p&&p.data==="nested"?p.vars.targets:m,x=e._overwrite==="auto"&&!Oc,v=e.timeline,S=i.easeReverse||u,A,w,R,y,b,P,D,N,k,z,W,q,V;if(v&&(!f||!r)&&(r="none"),e._ease=ar(r,Ns.ease),e._rEase=S&&(ar(S)||e._ease),e._from=!v&&!!i.runBackwards,e._from&&(e.ratio=1),!v||f&&!i.stagger){if(N=m[0]?rr(m[0]).harness:0,q=N&&i[N.prop],A=za(i,Vc),g&&(g._zTime<0&&g.progress(1),t<0&&h&&o&&!d?g.render(-1,!0):g.revert(h&&_?Ca:ry),g._lazy=0),a){if(Ni(e._startAt=Et.set(m,Mn({data:"isStart",overwrite:!1,parent:p,immediateRender:!0,lazy:!g&&sn(l),startAt:null,delay:0,onUpdate:c&&function(){return gn(e,"onUpdate")},stagger:0},a))),e._startAt._dp=0,e._startAt._sat=e,t<0&&(Nt||!o&&!d)&&e._startAt.revert(Ca),o&&_&&t<=0&&n<=0){t&&(e._zTime=t);return}}else if(h&&_&&!g){if(t&&(o=!1),R=Mn({overwrite:!1,data:"isFromStart",lazy:o&&!g&&sn(l),immediateRender:o,stagger:0,parent:p},A),q&&(R[N.prop]=q),Ni(e._startAt=Et.set(m,R)),e._startAt._dp=0,e._startAt._sat=e,t<0&&(Nt?e._startAt.revert(Ca):e._startAt.render(-1,!0)),e._zTime=t,!o)s(e._startAt,ot,ot);else if(!t)return}for(e._pt=e._ptCache=0,l=_&&sn(l)||l&&!_,w=0;w<m.length;w++){if(b=m[w],D=b._gsap||Wc(m)[w]._gsap,e._ptLookup[w]=z={},Xl[D.id]&&Li.length&&ka(),W=M===m?w:M.indexOf(b),N&&(k=new N).init(b,q||A,e,W,M)!==!1&&(e._pt=y=new on(e._pt,b,k.name,0,1,k.render,k,0,k.priority),k._props.forEach(function(ie){z[ie]=y}),k.priority&&(P=1)),!N||q)for(R in A)pn[R]&&(k=fd(R,A,e,W,b,M))?k.priority&&(P=1):z[R]=y=qc.call(e,b,R,"get",A[R],W,M,0,i.stringFilter);e._op&&e._op[w]&&e.kill(b,e._op[w]),x&&e._pt&&(Ai=e,_t.killTweensOf(b,z,e.globalTime(t)),V=!e.parent,Ai=0),e._pt&&l&&(Xl[D.id]=1)}P&&vd(e),e._onInit&&e._onInit(e)}e._onUpdate=c,e._initted=(!e._op||e._pt)&&!V,f&&t<=0&&v.render(An,!0,!0)},Ly=function(e,t,n,i,r,a,o,l){var c=(e._pt&&e._ptCache||(e._ptCache={}))[t],h,u,f,d;if(!c)for(c=e._ptCache[t]=[],f=e._ptLookup,d=e._targets.length;d--;){if(h=f[d][t],h&&h.d&&h.d._pt)for(h=h.d._pt;h&&h.p!==t&&h.fp!==t;)h=h._next;if(!h)return Zl=1,e.vars[t]="+=0",Yc(e,o),Zl=0,l?Fs(t+" not eligible for reset. Try splitting into individual properties"):1;c.push(h)}for(d=c.length;d--;)u=c[d],h=u._pt||u,h.s=(i||i===0)&&!r?i:h.s+(i||0)+a*h.c,h.c=n-h.s,u.e&&(u.e=Tt(n)+zt(u.e)),u.b&&(u.b=h.s+zt(u.b))},Iy=function(e,t){var n=e[0]?rr(e[0]).harness:0,i=n&&n.aliases,r,a,o,l;if(!i)return t;r=jr({},t);for(a in i)if(a in r)for(l=i[a].split(","),o=l.length;o--;)r[l[o]]=r[a];return r},Uy=function(e,t,n,i){var r=t.ease||i||"power1.inOut",a,o;if(Gt(t))o=n[e]||(n[e]=[]),t.forEach(function(l,c){return o.push({t:c/(t.length-1)*100,v:l,e:r})});else for(a in t)o=n[a]||(n[a]=[]),a==="ease"||o.push({t:parseFloat(e),v:t[a],e:r})},ws=function(e,t,n,i,r){return yt(e)?e.call(t,n,i,r):It(e)&&~e.indexOf("random(")?Bs(e):e},dd=Gc+"repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,easeReverse,autoRevert",pd={};an(dd+",id,stagger,delay,duration,paused,scrollTrigger",function(s){return pd[s]=1});var Et=(function(s){Nf(e,s);function e(n,i,r,a){var o;typeof i=="number"&&(r.duration=i,i=r,r=null),o=s.call(this,a?i:bs(i))||this;var l=o.vars,c=l.duration,h=l.delay,u=l.immediateRender,f=l.stagger,d=l.overwrite,_=l.keyframes,g=l.defaults,m=l.scrollTrigger,p=i.parent||_t,M=(Gt(n)||Of(n)?mi(n[0]):"length"in i)?[n]:Rn(n),x,v,S,A,w,R,y,b;if(o._targets=M.length?Wc(M):Fs("GSAP target "+n+" not found. https://gsap.com",!vn.nullTargetWarn)||[],o._ptLookup=[],o._overwrite=d,_||f||Sa(c)||Sa(h)){i=o.vars;var P=i.easeReverse||i.yoyoEase;if(x=o.timeline=new tn({data:"nested",defaults:g||{},targets:p&&p.data==="nested"?p.vars.targets:M}),x.kill(),x.parent=x._dp=si(o),x._start=0,f||Sa(c)||Sa(h)){if(A=M.length,y=f&&ed(f),jn(f))for(w in f)~dd.indexOf(w)&&(b||(b={}),b[w]=f[w]);for(v=0;v<A;v++)S=za(i,pd),S.stagger=0,P&&(S.easeReverse=P),b&&jr(S,b),R=M[v],S.duration=+ws(c,si(o),v,R,M),S.delay=(+ws(h,si(o),v,R,M)||0)-o._delay,!f&&A===1&&S.delay&&(o._delay=h=S.delay,o._start+=h,S.delay=0),x.to(R,S,y?y(v,R,M):0),x._ease=je.none;x.duration()?c=h=0:o.timeline=0}else if(_){bs(Mn(x.vars.defaults,{ease:"none"})),x._ease=ar(_.ease||i.ease||"none");var D=0,N,k,z;if(Gt(_))_.forEach(function(W){return x.to(M,W,">")}),x.duration();else{S={};for(w in _)w==="ease"||w==="easeEach"||Uy(w,_[w],S,_.easeEach);for(w in S)for(N=S[w].sort(function(W,q){return W.t-q.t}),D=0,v=0;v<N.length;v++)k=N[v],z={ease:k.e,duration:(k.t-(v?N[v-1].t:0))/100*c},z[w]=k.v,x.to(M,z,D),D+=z.duration;x.duration()<c&&x.to({},{duration:c-x.duration()})}}c||o.duration(c=x.duration())}else o.timeline=0;return d===!0&&!Oc&&(Ai=si(o),_t.killTweensOf(M),Ai=0),Gn(p,si(o),r),i.reversed&&o.reverse(),i.paused&&o.paused(!0),(u||!c&&!_&&o._start===gt(p._time)&&sn(u)&&hy(si(o))&&p.data!=="nested")&&(o._tTime=-ot,o.render(Math.max(0,-h)||0)),m&&$f(si(o),m),o}var t=e.prototype;return t.render=function(i,r,a){var o=this._time,l=this._tDur,c=this._dur,h=i<0,u=i>l-ot&&!h?l:i<ot?0:i,f,d,_,g,m,p,M,x;if(!c)fy(this,i,r,a);else if(u!==this._tTime||!i||a||!this._initted&&this._tTime||this._startAt&&this._zTime<0!==h||this._lazy){if(f=u,x=this.timeline,this._repeat){if(g=c+this._rDelay,this._repeat<-1&&h)return this.totalTime(g*100+i,r,a);if(f=gt(u%g),u===l?(_=this._repeat,f=c):(m=gt(u/g),_=~~m,_&&_===m?(f=c,_--):f>c&&(f=c)),p=this._yoyo&&_&1,p&&(f=c-f),m=Kr(this._tTime,g),f===o&&!a&&this._initted&&_===m)return this._tTime=u,this;_!==m&&this.vars.repeatRefresh&&!p&&!this._lock&&f!==g&&this._initted&&(this._lock=a=1,this.render(gt(g*_),!0).invalidate()._lock=0)}if(!this._initted){if(Zf(this,h?i:f,a,r,u))return this._tTime=0,this;if(o!==this._time&&!(a&&this.vars.repeatRefresh&&_!==m))return this;if(c!==this._dur)return this.render(i,r,a)}if(this._rEase){var v=f<o;if(v!==this._inv){var S=v?o:c-o;this._inv=v,this._from&&(this.ratio=1-this.ratio),this._invRatio=this.ratio,this._invTime=o,this._invRecip=S?(v?-1:1)/S:0,this._invScale=v?-this.ratio:1-this.ratio,this._invEase=v?this._rEase:this._ease}this.ratio=M=this._invRatio+this._invScale*this._invEase((f-this._invTime)*this._invRecip)}else this.ratio=M=this._ease(f/c);if(this._from&&(this.ratio=M=1-M),this._tTime=u,this._time=f,!this._act&&this._ts&&(this._act=1,this._lazy=0),!o&&u&&!r&&!m&&(gn(this,"onStart"),this._tTime!==u))return this;for(d=this._pt;d;)d.r(M,d.d),d=d._next;x&&x.render(i<0?i:x._dur*x._ease(f/this._dur),r,a)||this._startAt&&(this._zTime=i),this._onUpdate&&!r&&(h&&ql(this,i,r,a),gn(this,"onUpdate")),this._repeat&&_!==m&&this.vars.onRepeat&&!r&&this.parent&&gn(this,"onRepeat"),(u===this._tDur||!u)&&this._tTime===u&&(h&&!this._onUpdate&&ql(this,i,!0,!0),(i||!c)&&(u===this._tDur&&this._ts>0||!u&&this._ts<0)&&Ni(this,1),!r&&!(h&&!o)&&(u||o||p)&&(gn(this,u===l?"onComplete":"onReverseComplete",!0),this._prom&&!(u<l&&this.timeScale()>0)&&this._prom()))}return this},t.targets=function(){return this._targets},t.invalidate=function(i){return(!i||!this.vars.runBackwards)&&(this._startAt=0),this._pt=this._op=this._onUpdate=this._lazy=this.ratio=0,this._ptLookup=[],this.timeline&&this.timeline.invalidate(i),s.prototype.invalidate.call(this,i)},t.resetTo=function(i,r,a,o,l){ks||mn.wake(),this._ts||this.play();var c=Math.min(this._dur,(this._dp._time-this._start)*this._ts),h;return this._initted||Yc(this,c),h=this._ease(c/this._dur),Ly(this,i,r,a,o,h,c,l)?this.resetTo(i,r,a,o,1):(Qa(this,0),this.parent||jf(this._dp,this,"_first","_last",this._dp._sort?"_start":0),this.render(0))},t.kill=function(i,r){if(r===void 0&&(r="all"),!i&&(!r||r==="all"))return this._lazy=this._pt=0,this.parent?xs(this):this.scrollTrigger&&this.scrollTrigger.kill(!!Nt),this;if(this.timeline){var a=this.timeline.totalDuration();return this.timeline.killTweensOf(i,r,Ai&&Ai.vars.overwrite!==!0)._first||xs(this),this.parent&&a!==this.timeline.totalDuration()&&$r(this,this._dur*this.timeline._tDur/a,0,1),this}var o=this._targets,l=i?Rn(i):o,c=this._ptLookup,h=this._pt,u,f,d,_,g,m,p;if((!r||r==="all")&&ly(o,l))return r==="all"&&(this._pt=0),xs(this);for(u=this._op=this._op||[],r!=="all"&&(It(r)&&(g={},an(r,function(M){return g[M]=1}),r=g),r=Iy(o,r)),p=o.length;p--;)if(~l.indexOf(o[p])){f=c[p],r==="all"?(u[p]=r,_=f,d={}):(d=u[p]=u[p]||{},_=r);for(g in _)m=f&&f[g],m&&((!("kill"in m.d)||m.d.kill(g)===!0)&&Za(this,m,"_pt"),delete f[g]),d!=="all"&&(d[g]=1)}return this._initted&&!this._pt&&h&&xs(this),this},e.to=function(i,r){return new e(i,r,arguments[2])},e.from=function(i,r){return Es(1,arguments)},e.delayedCall=function(i,r,a,o){return new e(r,0,{immediateRender:!1,lazy:!1,overwrite:!1,delay:i,onComplete:r,onReverseComplete:r,onCompleteParams:a,onReverseCompleteParams:a,callbackScope:o})},e.fromTo=function(i,r,a){return Es(2,arguments)},e.set=function(i,r){return r.duration=0,r.repeatDelay||(r.repeat=0),new e(i,r)},e.killTweensOf=function(i,r,a){return _t.killTweensOf(i,r,a)},e})(zs);Mn(Et.prototype,{_targets:[],_lazy:0,_startAt:0,_op:0,_onInit:0});an("staggerTo,staggerFrom,staggerFromTo",function(s){Et[s]=function(){var e=new tn,t=jl.call(arguments,0);return t.splice(s==="staggerFromTo"?5:4,0,0),e[s].apply(e,t)}});var jc=function(e,t,n){return e[t]=n},md=function(e,t,n){return e[t](n)},Ny=function(e,t,n,i){return e[t](i.fp,n)},Fy=function(e,t,n){return e.setAttribute(t,n)},Kc=function(e,t){return yt(e[t])?md:Bc(e[t])&&e.setAttribute?Fy:jc},gd=function(e,t){return t.set(t.t,t.p,Math.round((t.s+t.c*e)*1e6)/1e6,t)},Oy=function(e,t){return t.set(t.t,t.p,!!(t.s+t.c*e),t)},_d=function(e,t){var n=t._pt,i="";if(!e&&t.b)i=t.b;else if(e===1&&t.e)i=t.e;else{for(;n;)i=n.p+(n.m?n.m(n.s+n.c*e):Math.round((n.s+n.c*e)*1e4)/1e4)+i,n=n._next;i+=t.c}t.set(t.t,t.p,i,t)},$c=function(e,t){for(var n=t._pt;n;)n.r(e,n.d),n=n._next},By=function(e,t,n,i){for(var r=this._pt,a;r;)a=r._next,r.p===i&&r.modifier(e,t,n),r=a},ky=function(e){for(var t=this._pt,n,i;t;)i=t._next,t.p===e&&!t.op||t.op===e?Za(this,t,"_pt"):t.dep||(n=1),t=i;return!n},zy=function(e,t,n,i){i.mSet(e,t,i.m.call(i.tween,n,i.mt),i)},vd=function(e){for(var t=e._pt,n,i,r,a;t;){for(n=t._next,i=r;i&&i.pr>t.pr;)i=i._next;(t._prev=i?i._prev:a)?t._prev._next=t:r=t,(t._next=i)?i._prev=t:a=t,t=n}e._pt=r},on=(function(){function s(t,n,i,r,a,o,l,c,h){this.t=n,this.s=r,this.c=a,this.p=i,this.r=o||gd,this.d=l||this,this.set=c||jc,this.pr=h||0,this._next=t,t&&(t._prev=this)}var e=s.prototype;return e.modifier=function(n,i,r){this.mSet=this.mSet||this.set,this.set=zy,this.m=n,this.mt=r,this.tween=i},s})();an(Gc+"parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger,easeReverse",function(s){return Vc[s]=1});yn.TweenMax=yn.TweenLite=Et;yn.TimelineLite=yn.TimelineMax=tn;_t=new tn({sortChildren:!1,defaults:Ns,autoRemoveChildren:!0,id:"root",smoothChildTiming:!0});vn.stringFilter=cd;var or=[],Da={},Hy=[],Lu=0,Vy=0,Wo=function(e){return(Da[e]||Hy).map(function(t){return t()})},Jl=function(){var e=Date.now(),t=[];e-Lu>2&&(Wo("matchMediaInit"),or.forEach(function(n){var i=n.queries,r=n.conditions,a,o,l,c;for(o in i)a=Hn.matchMedia(i[o]).matches,a&&(l=1),a!==r[o]&&(r[o]=a,c=1);c&&(n.revert(),l&&t.push(n))}),Wo("matchMediaRevert"),t.forEach(function(n){return n.onMatch(n,function(i){return n.add(null,i)})}),Lu=e,Wo("matchMedia"))},xd=(function(){function s(t,n){this.selector=n&&Kl(n),this.data=[],this._r=[],this.isReverted=!1,this.id=Vy++,t&&this.add(t)}var e=s.prototype;return e.add=function(n,i,r){yt(n)&&(r=i,i=n,n=yt);var a=this,o=function(){var c=dt,h=a.selector,u;return c&&c!==a&&c.data.push(a),r&&(a.selector=Kl(r)),dt=a,u=i.apply(a,arguments),yt(u)&&a._r.push(u),dt=c,a.selector=h,a.isReverted=!1,u};return a.last=o,n===yt?o(a,function(l){return a.add(null,l)}):n?a[n]=o:o},e.ignore=function(n){var i=dt;dt=null,n(this),dt=i},e.getTweens=function(){var n=[];return this.data.forEach(function(i){return i instanceof s?n.push.apply(n,i.getTweens()):i instanceof Et&&!(i.parent&&i.parent.data==="nested")&&n.push(i)}),n},e.clear=function(){this._r.length=this.data.length=0},e.kill=function(n,i){var r=this;if(n?(function(){for(var o=r.getTweens(),l=r.data.length,c;l--;)c=r.data[l],c.data==="isFlip"&&(c.revert(),c.getChildren(!0,!0,!1).forEach(function(h){return o.splice(o.indexOf(h),1)}));for(o.map(function(h){return{g:h._dur||h._delay||h._sat&&!h._sat.vars.immediateRender?h.globalTime(0):-1/0,t:h}}).sort(function(h,u){return u.g-h.g||-1/0}).forEach(function(h){return h.t.revert(n)}),l=r.data.length;l--;)c=r.data[l],c instanceof tn?c.data!=="nested"&&(c.scrollTrigger&&c.scrollTrigger.revert(),c.kill()):!(c instanceof Et)&&c.revert&&c.revert(n);r._r.forEach(function(h){return h(n,r)}),r.isReverted=!0})():this.data.forEach(function(o){return o.kill&&o.kill()}),this.clear(),i)for(var a=or.length;a--;)or[a].id===this.id&&or.splice(a,1)},e.revert=function(n){this.kill(n||{})},s})(),Gy=(function(){function s(t){this.contexts=[],this.scope=t,dt&&dt.data.push(this)}var e=s.prototype;return e.add=function(n,i,r){jn(n)||(n={matches:n});var a=new xd(0,r||this.scope),o=a.conditions={},l,c,h;dt&&!a.selector&&(a.selector=dt.selector),this.contexts.push(a),i=a.add("onMatch",i),a.queries=n;for(c in n)c==="all"?h=1:(l=Hn.matchMedia(n[c]),l&&(or.indexOf(a)<0&&or.push(a),(o[c]=l.matches)&&(h=1),l.addListener?l.addListener(Jl):l.addEventListener("change",Jl)));return h&&i(a,function(u){return a.add(null,u)}),this},e.revert=function(n){this.kill(n||{})},e.kill=function(n){this.contexts.forEach(function(i){return i.kill(n,!0)})},s})(),Va={registerPlugin:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];t.forEach(function(i){return ad(i)})},timeline:function(e){return new tn(e)},getTweensOf:function(e,t){return _t.getTweensOf(e,t)},getProperty:function(e,t,n,i){It(e)&&(e=Rn(e)[0]);var r=rr(e||{}).get,a=n?Yf:qf;return n==="native"&&(n=""),e&&(t?a((pn[t]&&pn[t].get||r)(e,t,n,i)):function(o,l,c){return a((pn[o]&&pn[o].get||r)(e,o,l,c))})},quickSetter:function(e,t,n){if(e=Rn(e),e.length>1){var i=e.map(function(h){return cn.quickSetter(h,t,n)}),r=i.length;return function(h){for(var u=r;u--;)i[u](h)}}e=e[0]||{};var a=pn[t],o=rr(e),l=o.harness&&(o.harness.aliases||{})[t]||t,c=a?function(h){var u=new a;Ir._pt=0,u.init(e,n?h+n:h,Ir,0,[e]),u.render(1,u),Ir._pt&&$c(1,Ir)}:o.set(e,l);return a?c:function(h){return c(e,l,n?h+n:h,o,1)}},quickTo:function(e,t,n){var i,r=cn.to(e,Mn((i={},i[t]="+=0.1",i.paused=!0,i.stagger=0,i),n||{})),a=function(l,c,h){return r.resetTo(t,l,c,h)};return a.tween=r,a},isTweening:function(e){return _t.getTweensOf(e,!0).length>0},defaults:function(e){return e&&e.ease&&(e.ease=ar(e.ease,Ns.ease)),Au(Ns,e||{})},config:function(e){return Au(vn,e||{})},registerEffect:function(e){var t=e.name,n=e.effect,i=e.plugins,r=e.defaults,a=e.extendTimeline;(i||"").split(",").forEach(function(o){return o&&!pn[o]&&!yn[o]&&Fs(t+" effect requires "+o+" plugin.")}),zo[t]=function(o,l,c){return n(Rn(o),Mn(l||{},r),c)},a&&(tn.prototype[t]=function(o,l,c){return this.add(zo[t](o,jn(l)?l:(c=l)&&{},this),c)})},registerEase:function(e,t){je[e]=ar(t)},parseEase:function(e,t){return arguments.length?ar(e,t):je},getById:function(e){return _t.getById(e)},exportRoot:function(e,t){e===void 0&&(e={});var n=new tn(e),i,r;for(n.smoothChildTiming=sn(e.smoothChildTiming),_t.remove(n),n._dp=0,n._time=n._tTime=_t._time,i=_t._first;i;)r=i._next,(t||!(!i._dur&&i instanceof Et&&i.vars.onComplete===i._targets[0]))&&Gn(n,i,i._start-i._delay),i=r;return Gn(_t,n,0),n},context:function(e,t){return e?new xd(e,t):dt},matchMedia:function(e){return new Gy(e)},matchMediaRefresh:function(){return or.forEach(function(e){var t=e.conditions,n,i;for(i in t)t[i]&&(t[i]=!1,n=1);n&&e.revert()})||Jl()},addEventListener:function(e,t){var n=Da[e]||(Da[e]=[]);~n.indexOf(t)||n.push(t)},removeEventListener:function(e,t){var n=Da[e],i=n&&n.indexOf(t);i>=0&&n.splice(i,1)},utils:{wrap:yy,wrapYoyo:My,distribute:ed,random:nd,snap:td,normalize:xy,getUnit:zt,clamp:my,splitColor:od,toArray:Rn,selector:Kl,mapRange:rd,pipe:_y,unitize:vy,interpolate:Sy,shuffle:Qf},install:Hf,effects:zo,ticker:mn,updateRoot:tn.updateRoot,plugins:pn,globalTimeline:_t,core:{PropTween:on,globals:Vf,Tween:Et,Timeline:tn,Animation:zs,getCache:rr,_removeLinkedListItem:Za,reverting:function(){return Nt},context:function(e){return e&&dt&&(dt.data.push(e),e._ctx=dt),dt},suppressOverwrites:function(e){return Oc=e}}};an("to,from,fromTo,delayedCall,set,killTweensOf",function(s){return Va[s]=Et[s]});mn.add(tn.updateRoot);Ir=Va.to({},{duration:0});var Wy=function(e,t){for(var n=e._pt;n&&n.p!==t&&n.op!==t&&n.fp!==t;)n=n._next;return n},Xy=function(e,t){var n=e._targets,i,r,a;for(i in t)for(r=n.length;r--;)a=e._ptLookup[r][i],a&&(a=a.d)&&(a._pt&&(a=Wy(a,i)),a&&a.modifier&&a.modifier(t[i],e,n[r],i))},Xo=function(e,t){return{name:e,headless:1,rawVars:1,init:function(i,r,a){a._onInit=function(o){var l,c;if(It(r)&&(l={},an(r,function(h){return l[h]=1}),r=l),t){l={};for(c in r)l[c]=t(r[c]);r=l}Xy(o,r)}}}},cn=Va.registerPlugin({name:"attr",init:function(e,t,n,i,r){var a,o,l;this.tween=n;for(a in t)l=e.getAttribute(a)||"",o=this.add(e,"setAttribute",(l||0)+"",t[a],i,r,0,0,a),o.op=a,o.b=l,this._props.push(a)},render:function(e,t){for(var n=t._pt;n;)Nt?n.set(n.t,n.p,n.b,n):n.r(e,n.d),n=n._next}},{name:"endArray",headless:1,init:function(e,t){for(var n=t.length;n--;)this.add(e,n,e[n]||0,t[n],0,0,0,0,0,1)}},Xo("roundProps",$l),Xo("modifiers"),Xo("snap",td))||Va;Et.version=tn.version=cn.version="3.15.0";zf=1;kc()&&Zr();je.Power0;je.Power1;je.Power2;je.Power3;je.Power4;je.Linear;je.Quad;je.Cubic;je.Quart;je.Quint;je.Strong;je.Elastic;je.Back;je.SteppedEase;je.Bounce;je.Sine;je.Expo;je.Circ;var Iu,Ri,Or,Zc,nr,Uu,Jc,qy=function(){return typeof window<"u"},gi={},Qi=180/Math.PI,Br=Math.PI/180,Cr=Math.atan2,Nu=1e8,Qc=/([A-Z])/g,Yy=/(left|right|width|margin|padding|x)/i,jy=/[\s,\(]\S/,Xn={autoAlpha:"opacity,visibility",scale:"scaleX,scaleY",alpha:"opacity"},Ql=function(e,t){return t.set(t.t,t.p,Math.round((t.s+t.c*e)*1e4)/1e4+t.u,t)},Ky=function(e,t){return t.set(t.t,t.p,e===1?t.e:Math.round((t.s+t.c*e)*1e4)/1e4+t.u,t)},$y=function(e,t){return t.set(t.t,t.p,e?Math.round((t.s+t.c*e)*1e4)/1e4+t.u:t.b,t)},Zy=function(e,t){return t.set(t.t,t.p,e===1?t.e:e?Math.round((t.s+t.c*e)*1e4)/1e4+t.u:t.b,t)},Jy=function(e,t){var n=t.s+t.c*e;t.set(t.t,t.p,~~(n+(n<0?-.5:.5))+t.u,t)},yd=function(e,t){return t.set(t.t,t.p,e?t.e:t.b,t)},Md=function(e,t){return t.set(t.t,t.p,e!==1?t.b:t.e,t)},Qy=function(e,t,n){return e.style[t]=n},eM=function(e,t,n){return e.style.setProperty(t,n)},tM=function(e,t,n){return e._gsap[t]=n},nM=function(e,t,n){return e._gsap.scaleX=e._gsap.scaleY=n},iM=function(e,t,n,i,r){var a=e._gsap;a.scaleX=a.scaleY=n,a.renderTransform(r,a)},rM=function(e,t,n,i,r){var a=e._gsap;a[t]=n,a.renderTransform(r,a)},vt="transform",ln=vt+"Origin",sM=function s(e,t){var n=this,i=this.target,r=i.style,a=i._gsap;if(e in gi&&r){if(this.tfm=this.tfm||{},e!=="transform")e=Xn[e]||e,~e.indexOf(",")?e.split(",").forEach(function(o){return n.tfm[o]=ai(i,o)}):this.tfm[e]=a.x?a[e]:ai(i,e),e===ln&&(this.tfm.zOrigin=a.zOrigin);else return Xn.transform.split(",").forEach(function(o){return s.call(n,o,t)});if(this.props.indexOf(vt)>=0)return;a.svg&&(this.svgo=i.getAttribute("data-svg-origin"),this.props.push(ln,t,"")),e=vt}(r||t)&&this.props.push(e,t,r[e])},Sd=function(e){e.translate&&(e.removeProperty("translate"),e.removeProperty("scale"),e.removeProperty("rotate"))},aM=function(){var e=this.props,t=this.target,n=t.style,i=t._gsap,r,a;for(r=0;r<e.length;r+=3)e[r+1]?e[r+1]===2?t[e[r]](e[r+2]):t[e[r]]=e[r+2]:e[r+2]?n[e[r]]=e[r+2]:n.removeProperty(e[r].substr(0,2)==="--"?e[r]:e[r].replace(Qc,"-$1").toLowerCase());if(this.tfm){for(a in this.tfm)i[a]=this.tfm[a];i.svg&&(i.renderTransform(),t.setAttribute("data-svg-origin",this.svgo||"")),r=Jc(),(!r||!r.isStart)&&!n[vt]&&(Sd(n),i.zOrigin&&n[ln]&&(n[ln]+=" "+i.zOrigin+"px",i.zOrigin=0,i.renderTransform()),i.uncache=1)}},Td=function(e,t){var n={target:e,props:[],revert:aM,save:sM};return e._gsap||cn.core.getCache(e),t&&e.style&&e.nodeType&&t.split(",").forEach(function(i){return n.save(i)}),n},bd,ec=function(e,t){var n=Ri.createElementNS?Ri.createElementNS((t||"http://www.w3.org/1999/xhtml").replace(/^https/,"http"),e):Ri.createElement(e);return n&&n.style?n:Ri.createElement(e)},_n=function s(e,t,n){var i=getComputedStyle(e);return i[t]||i.getPropertyValue(t.replace(Qc,"-$1").toLowerCase())||i.getPropertyValue(t)||!n&&s(e,Jr(t)||t,1)||""},Fu="O,Moz,ms,Ms,Webkit".split(","),Jr=function(e,t,n){var i=t||nr,r=i.style,a=5;if(e in r&&!n)return e;for(e=e.charAt(0).toUpperCase()+e.substr(1);a--&&!(Fu[a]+e in r););return a<0?null:(a===3?"ms":a>=0?Fu[a]:"")+e},tc=function(){qy()&&window.document&&(Iu=window,Ri=Iu.document,Or=Ri.documentElement,nr=ec("div")||{style:{}},ec("div"),vt=Jr(vt),ln=vt+"Origin",nr.style.cssText="border-width:0;line-height:0;position:absolute;padding:0",bd=!!Jr("perspective"),Jc=cn.core.reverting,Zc=1)},Ou=function(e){var t=e.ownerSVGElement,n=ec("svg",t&&t.getAttribute("xmlns")||"http://www.w3.org/2000/svg"),i=e.cloneNode(!0),r;i.style.display="block",n.appendChild(i),Or.appendChild(n);try{r=i.getBBox()}catch{}return n.removeChild(i),Or.removeChild(n),r},Bu=function(e,t){for(var n=t.length;n--;)if(e.hasAttribute(t[n]))return e.getAttribute(t[n])},Ed=function(e){var t,n;try{t=e.getBBox()}catch{t=Ou(e),n=1}return t&&(t.width||t.height)||n||(t=Ou(e)),t&&!t.width&&!t.x&&!t.y?{x:+Bu(e,["x","cx","x1"])||0,y:+Bu(e,["y","cy","y1"])||0,width:0,height:0}:t},wd=function(e){return!!(e.getCTM&&(!e.parentNode||e.ownerSVGElement)&&Ed(e))},Fi=function(e,t){if(t){var n=e.style,i;t in gi&&t!==ln&&(t=vt),n.removeProperty?(i=t.substr(0,2),(i==="ms"||t.substr(0,6)==="webkit")&&(t="-"+t),n.removeProperty(i==="--"?t:t.replace(Qc,"-$1").toLowerCase())):n.removeAttribute(t)}},Ci=function(e,t,n,i,r,a){var o=new on(e._pt,t,n,0,1,a?Md:yd);return e._pt=o,o.b=i,o.e=r,e._props.push(n),o},ku={deg:1,rad:1,turn:1},oM={grid:1,flex:1},Oi=function s(e,t,n,i){var r=parseFloat(n)||0,a=(n+"").trim().substr((r+"").length)||"px",o=nr.style,l=Yy.test(t),c=e.tagName.toLowerCase()==="svg",h=(c?"client":"offset")+(l?"Width":"Height"),u=100,f=i==="px",d=i==="%",_,g,m,p;if(i===a||!r||ku[i]||ku[a])return r;if(a!=="px"&&!f&&(r=s(e,t,n,"px")),p=e.getCTM&&wd(e),(d||a==="%")&&(gi[t]||~t.indexOf("adius")))return _=p?e.getBBox()[l?"width":"height"]:e[h],Tt(d?r/_*u:r/100*_);if(o[l?"width":"height"]=u+(f?a:i),g=i!=="rem"&&~t.indexOf("adius")||i==="em"&&e.appendChild&&!c?e:e.parentNode,p&&(g=(e.ownerSVGElement||{}).parentNode),(!g||g===Ri||!g.appendChild)&&(g=Ri.body),m=g._gsap,m&&d&&m.width&&l&&m.time===mn.time&&!m.uncache)return Tt(r/m.width*u);if(d&&(t==="height"||t==="width")){var M=e.style[t];e.style[t]=u+i,_=e[h],M?e.style[t]=M:Fi(e,t)}else(d||a==="%")&&!oM[_n(g,"display")]&&(o.position=_n(e,"position")),g===e&&(o.position="static"),g.appendChild(nr),_=nr[h],g.removeChild(nr),o.position="absolute";return l&&d&&(m=rr(g),m.time=mn.time,m.width=g[h]),Tt(f?_*r/u:_&&r?u/_*r:0)},ai=function(e,t,n,i){var r;return Zc||tc(),t in Xn&&t!=="transform"&&(t=Xn[t],~t.indexOf(",")&&(t=t.split(",")[0])),gi[t]&&t!=="transform"?(r=Vs(e,i),r=t!=="transformOrigin"?r[t]:r.svg?r.origin:Wa(_n(e,ln))+" "+r.zOrigin+"px"):(r=e.style[t],(!r||r==="auto"||i||~(r+"").indexOf("calc("))&&(r=Ga[t]&&Ga[t](e,t,n)||_n(e,t)||Wf(e,t)||(t==="opacity"?1:0))),n&&!~(r+"").trim().indexOf(" ")?Oi(e,t,r,n)+n:r},lM=function(e,t,n,i){if(!n||n==="none"){var r=Jr(t,e,1),a=r&&_n(e,r,1);a&&a!==n?(t=r,n=a):t==="borderColor"&&(n=_n(e,"borderTopColor"))}var o=new on(this._pt,e.style,t,0,1,_d),l=0,c=0,h,u,f,d,_,g,m,p,M,x,v,S;if(o.b=n,o.e=i,n+="",i+="",i.substring(0,6)==="var(--"&&(i=_n(e,i.substring(4,i.indexOf(")")))),i==="auto"&&(g=e.style[t],e.style[t]=i,i=_n(e,t)||i,g?e.style[t]=g:Fi(e,t)),h=[n,i],cd(h),n=h[0],i=h[1],f=n.match(Lr)||[],S=i.match(Lr)||[],S.length){for(;u=Lr.exec(i);)m=u[0],M=i.substring(l,u.index),_?_=(_+1)%5:(M.substr(-5)==="rgba("||M.substr(-5)==="hsla(")&&(_=1),m!==(g=f[c++]||"")&&(d=parseFloat(g)||0,v=g.substr((d+"").length),m.charAt(1)==="="&&(m=Fr(d,m)+v),p=parseFloat(m),x=m.substr((p+"").length),l=Lr.lastIndex-x.length,x||(x=x||vn.units[t]||v,l===i.length&&(i+=x,o.e+=x)),v!==x&&(d=Oi(e,t,g,x)||0),o._pt={_next:o._pt,p:M||c===1?M:",",s:d,c:p-d,m:_&&_<4||t==="zIndex"?Math.round:0});o.c=l<i.length?i.substring(l,i.length):""}else o.r=t==="display"&&i==="none"?Md:yd;return kf.test(i)&&(o.e=0),this._pt=o,o},zu={top:"0%",bottom:"100%",left:"0%",right:"100%",center:"50%"},cM=function(e){var t=e.split(" "),n=t[0],i=t[1]||"50%";return(n==="top"||n==="bottom"||i==="left"||i==="right")&&(e=n,n=i,i=e),t[0]=zu[n]||n,t[1]=zu[i]||i,t.join(" ")},hM=function(e,t){if(t.tween&&t.tween._time===t.tween._dur){var n=t.t,i=n.style,r=t.u,a=n._gsap,o,l,c;if(r==="all"||r===!0)i.cssText="",l=1;else for(r=r.split(","),c=r.length;--c>-1;)o=r[c],gi[o]&&(l=1,o=o==="transformOrigin"?ln:vt),Fi(n,o);l&&(Fi(n,vt),a&&(a.svg&&n.removeAttribute("transform"),i.scale=i.rotate=i.translate="none",Vs(n,1),a.uncache=1,Sd(i)))}},Ga={clearProps:function(e,t,n,i,r){if(r.data!=="isFromStart"){var a=e._pt=new on(e._pt,t,n,0,0,hM);return a.u=i,a.pr=-10,a.tween=r,e._props.push(n),1}}},Hs=[1,0,0,1,0,0],Ad={},Rd=function(e){return e==="matrix(1, 0, 0, 1, 0, 0)"||e==="none"||!e},Hu=function(e){var t=_n(e,vt);return Rd(t)?Hs:t.substr(7).match(Bf).map(Tt)},eh=function(e,t){var n=e._gsap||rr(e),i=e.style,r=Hu(e),a,o,l,c;return n.svg&&e.getAttribute("transform")?(l=e.transform.baseVal.consolidate().matrix,r=[l.a,l.b,l.c,l.d,l.e,l.f],r.join(",")==="1,0,0,1,0,0"?Hs:r):(r===Hs&&!e.offsetParent&&e!==Or&&!n.svg&&(l=i.display,i.display="block",a=e.parentNode,(!a||!e.offsetParent&&!e.getBoundingClientRect().width)&&(c=1,o=e.nextElementSibling,Or.appendChild(e)),r=Hu(e),l?i.display=l:Fi(e,"display"),c&&(o?a.insertBefore(e,o):a?a.appendChild(e):Or.removeChild(e))),t&&r.length>6?[r[0],r[1],r[4],r[5],r[12],r[13]]:r)},nc=function(e,t,n,i,r,a){var o=e._gsap,l=r||eh(e,!0),c=o.xOrigin||0,h=o.yOrigin||0,u=o.xOffset||0,f=o.yOffset||0,d=l[0],_=l[1],g=l[2],m=l[3],p=l[4],M=l[5],x=t.split(" "),v=parseFloat(x[0])||0,S=parseFloat(x[1])||0,A,w,R,y;n?l!==Hs&&(w=d*m-_*g)&&(R=v*(m/w)+S*(-g/w)+(g*M-m*p)/w,y=v*(-_/w)+S*(d/w)-(d*M-_*p)/w,v=R,S=y):(A=Ed(e),v=A.x+(~x[0].indexOf("%")?v/100*A.width:v),S=A.y+(~(x[1]||x[0]).indexOf("%")?S/100*A.height:S)),i||i!==!1&&o.smooth?(p=v-c,M=S-h,o.xOffset=u+(p*d+M*g)-p,o.yOffset=f+(p*_+M*m)-M):o.xOffset=o.yOffset=0,o.xOrigin=v,o.yOrigin=S,o.smooth=!!i,o.origin=t,o.originIsAbsolute=!!n,e.style[ln]="0px 0px",a&&(Ci(a,o,"xOrigin",c,v),Ci(a,o,"yOrigin",h,S),Ci(a,o,"xOffset",u,o.xOffset),Ci(a,o,"yOffset",f,o.yOffset)),e.setAttribute("data-svg-origin",v+" "+S)},Vs=function(e,t){var n=e._gsap||new ud(e);if("x"in n&&!t&&!n.uncache)return n;var i=e.style,r=n.scaleX<0,a="px",o="deg",l=getComputedStyle(e),c=_n(e,ln)||"0",h,u,f,d,_,g,m,p,M,x,v,S,A,w,R,y,b,P,D,N,k,z,W,q,V,ie,oe,ge,Le,et,Ke,He;return h=u=f=g=m=p=M=x=v=0,d=_=1,n.svg=!!(e.getCTM&&wd(e)),l.translate&&((l.translate!=="none"||l.scale!=="none"||l.rotate!=="none")&&(i[vt]=(l.translate!=="none"?"translate3d("+(l.translate+" 0 0").split(" ").slice(0,3).join(", ")+") ":"")+(l.rotate!=="none"?"rotate("+l.rotate+") ":"")+(l.scale!=="none"?"scale("+l.scale.split(" ").join(",")+") ":"")+(l[vt]!=="none"?l[vt]:"")),i.scale=i.rotate=i.translate="none"),w=eh(e,n.svg),n.svg&&(n.uncache?(V=e.getBBox(),c=n.xOrigin-V.x+"px "+(n.yOrigin-V.y)+"px",q=""):q=!t&&e.getAttribute("data-svg-origin"),nc(e,q||c,!!q||n.originIsAbsolute,n.smooth!==!1,w)),S=n.xOrigin||0,A=n.yOrigin||0,w!==Hs&&(P=w[0],D=w[1],N=w[2],k=w[3],h=z=w[4],u=W=w[5],w.length===6?(d=Math.sqrt(P*P+D*D),_=Math.sqrt(k*k+N*N),g=P||D?Cr(D,P)*Qi:0,M=N||k?Cr(N,k)*Qi+g:0,M&&(_*=Math.abs(Math.cos(M*Br))),n.svg&&(h-=S-(S*P+A*N),u-=A-(S*D+A*k))):(He=w[6],et=w[7],oe=w[8],ge=w[9],Le=w[10],Ke=w[11],h=w[12],u=w[13],f=w[14],R=Cr(He,Le),m=R*Qi,R&&(y=Math.cos(-R),b=Math.sin(-R),q=z*y+oe*b,V=W*y+ge*b,ie=He*y+Le*b,oe=z*-b+oe*y,ge=W*-b+ge*y,Le=He*-b+Le*y,Ke=et*-b+Ke*y,z=q,W=V,He=ie),R=Cr(-N,Le),p=R*Qi,R&&(y=Math.cos(-R),b=Math.sin(-R),q=P*y-oe*b,V=D*y-ge*b,ie=N*y-Le*b,Ke=k*b+Ke*y,P=q,D=V,N=ie),R=Cr(D,P),g=R*Qi,R&&(y=Math.cos(R),b=Math.sin(R),q=P*y+D*b,V=z*y+W*b,D=D*y-P*b,W=W*y-z*b,P=q,z=V),m&&Math.abs(m)+Math.abs(g)>359.9&&(m=g=0,p=180-p),d=Tt(Math.sqrt(P*P+D*D+N*N)),_=Tt(Math.sqrt(W*W+He*He)),R=Cr(z,W),M=Math.abs(R)>2e-4?R*Qi:0,v=Ke?1/(Ke<0?-Ke:Ke):0),n.svg&&(q=e.getAttribute("transform"),n.forceCSS=e.setAttribute("transform","")||!Rd(_n(e,vt)),q&&e.setAttribute("transform",q))),Math.abs(M)>90&&Math.abs(M)<270&&(r?(d*=-1,M+=g<=0?180:-180,g+=g<=0?180:-180):(_*=-1,M+=M<=0?180:-180)),t=t||n.uncache,n.x=h-((n.xPercent=h&&(!t&&n.xPercent||(Math.round(e.offsetWidth/2)===Math.round(-h)?-50:0)))?e.offsetWidth*n.xPercent/100:0)+a,n.y=u-((n.yPercent=u&&(!t&&n.yPercent||(Math.round(e.offsetHeight/2)===Math.round(-u)?-50:0)))?e.offsetHeight*n.yPercent/100:0)+a,n.z=f+a,n.scaleX=Tt(d),n.scaleY=Tt(_),n.rotation=Tt(g)+o,n.rotationX=Tt(m)+o,n.rotationY=Tt(p)+o,n.skewX=M+o,n.skewY=x+o,n.transformPerspective=v+a,(n.zOrigin=parseFloat(c.split(" ")[2])||!t&&n.zOrigin||0)&&(i[ln]=Wa(c)),n.xOffset=n.yOffset=0,n.force3D=vn.force3D,n.renderTransform=n.svg?fM:bd?Cd:uM,n.uncache=0,n},Wa=function(e){return(e=e.split(" "))[0]+" "+e[1]},qo=function(e,t,n){var i=zt(t);return Tt(parseFloat(t)+parseFloat(Oi(e,"x",n+"px",i)))+i},uM=function(e,t){t.z="0px",t.rotationY=t.rotationX="0deg",t.force3D=0,Cd(e,t)},Ki="0deg",ps="0px",$i=") ",Cd=function(e,t){var n=t||this,i=n.xPercent,r=n.yPercent,a=n.x,o=n.y,l=n.z,c=n.rotation,h=n.rotationY,u=n.rotationX,f=n.skewX,d=n.skewY,_=n.scaleX,g=n.scaleY,m=n.transformPerspective,p=n.force3D,M=n.target,x=n.zOrigin,v="",S=p==="auto"&&e&&e!==1||p===!0;if(x&&(u!==Ki||h!==Ki)){var A=parseFloat(h)*Br,w=Math.sin(A),R=Math.cos(A),y;A=parseFloat(u)*Br,y=Math.cos(A),a=qo(M,a,w*y*-x),o=qo(M,o,-Math.sin(A)*-x),l=qo(M,l,R*y*-x+x)}m!==ps&&(v+="perspective("+m+$i),(i||r)&&(v+="translate("+i+"%, "+r+"%) "),(S||a!==ps||o!==ps||l!==ps)&&(v+=l!==ps||S?"translate3d("+a+", "+o+", "+l+") ":"translate("+a+", "+o+$i),c!==Ki&&(v+="rotate("+c+$i),h!==Ki&&(v+="rotateY("+h+$i),u!==Ki&&(v+="rotateX("+u+$i),(f!==Ki||d!==Ki)&&(v+="skew("+f+", "+d+$i),(_!==1||g!==1)&&(v+="scale("+_+", "+g+$i),M.style[vt]=v||"translate(0, 0)"},fM=function(e,t){var n=t||this,i=n.xPercent,r=n.yPercent,a=n.x,o=n.y,l=n.rotation,c=n.skewX,h=n.skewY,u=n.scaleX,f=n.scaleY,d=n.target,_=n.xOrigin,g=n.yOrigin,m=n.xOffset,p=n.yOffset,M=n.forceCSS,x=parseFloat(a),v=parseFloat(o),S,A,w,R,y;l=parseFloat(l),c=parseFloat(c),h=parseFloat(h),h&&(h=parseFloat(h),c+=h,l+=h),l||c?(l*=Br,c*=Br,S=Math.cos(l)*u,A=Math.sin(l)*u,w=Math.sin(l-c)*-f,R=Math.cos(l-c)*f,c&&(h*=Br,y=Math.tan(c-h),y=Math.sqrt(1+y*y),w*=y,R*=y,h&&(y=Math.tan(h),y=Math.sqrt(1+y*y),S*=y,A*=y)),S=Tt(S),A=Tt(A),w=Tt(w),R=Tt(R)):(S=u,R=f,A=w=0),(x&&!~(a+"").indexOf("px")||v&&!~(o+"").indexOf("px"))&&(x=Oi(d,"x",a,"px"),v=Oi(d,"y",o,"px")),(_||g||m||p)&&(x=Tt(x+_-(_*S+g*w)+m),v=Tt(v+g-(_*A+g*R)+p)),(i||r)&&(y=d.getBBox(),x=Tt(x+i/100*y.width),v=Tt(v+r/100*y.height)),y="matrix("+S+","+A+","+w+","+R+","+x+","+v+")",d.setAttribute("transform",y),M&&(d.style[vt]=y)},dM=function(e,t,n,i,r){var a=360,o=It(r),l=parseFloat(r)*(o&&~r.indexOf("rad")?Qi:1),c=l-i,h=i+c+"deg",u,f;return o&&(u=r.split("_")[1],u==="short"&&(c%=a,c!==c%(a/2)&&(c+=c<0?a:-a)),u==="cw"&&c<0?c=(c+a*Nu)%a-~~(c/a)*a:u==="ccw"&&c>0&&(c=(c-a*Nu)%a-~~(c/a)*a)),e._pt=f=new on(e._pt,t,n,i,c,Ky),f.e=h,f.u="deg",e._props.push(n),f},Vu=function(e,t){for(var n in t)e[n]=t[n];return e},pM=function(e,t,n){var i=Vu({},n._gsap),r="perspective,force3D,transformOrigin,svgOrigin",a=n.style,o,l,c,h,u,f,d,_;i.svg?(c=n.getAttribute("transform"),n.setAttribute("transform",""),a[vt]=t,o=Vs(n,1),Fi(n,vt),n.setAttribute("transform",c)):(c=getComputedStyle(n)[vt],a[vt]=t,o=Vs(n,1),a[vt]=c);for(l in gi)c=i[l],h=o[l],c!==h&&r.indexOf(l)<0&&(d=zt(c),_=zt(h),u=d!==_?Oi(n,l,c,_):parseFloat(c),f=parseFloat(h),e._pt=new on(e._pt,o,l,u,f-u,Ql),e._pt.u=_||0,e._props.push(l));Vu(o,i)};an("padding,margin,Width,Radius",function(s,e){var t="Top",n="Right",i="Bottom",r="Left",a=(e<3?[t,n,i,r]:[t+r,t+n,i+n,i+r]).map(function(o){return e<2?s+o:"border"+o+s});Ga[e>1?"border"+s:s]=function(o,l,c,h,u){var f,d;if(arguments.length<4)return f=a.map(function(_){return ai(o,_,c)}),d=f.join(" "),d.split(f[0]).length===5?f[0]:d;f=(h+"").split(" "),d={},a.forEach(function(_,g){return d[_]=f[g]=f[g]||f[(g-1)/2|0]}),o.init(l,d,u)}});var Pd={name:"css",register:tc,targetTest:function(e){return e.style&&e.nodeType},init:function(e,t,n,i,r){var a=this._props,o=e.style,l=n.vars.startAt,c,h,u,f,d,_,g,m,p,M,x,v,S,A,w,R,y;Zc||tc(),this.styles=this.styles||Td(e),R=this.styles.props,this.tween=n;for(g in t)if(g!=="autoRound"&&(h=t[g],!(pn[g]&&fd(g,t,n,i,e,r)))){if(d=typeof h,_=Ga[g],d==="function"&&(h=h.call(n,i,e,r),d=typeof h),d==="string"&&~h.indexOf("random(")&&(h=Bs(h)),_)_(this,e,g,h,n)&&(w=1);else if(g.substr(0,2)==="--")c=(getComputedStyle(e).getPropertyValue(g)+"").trim(),h+="",Ii.lastIndex=0,Ii.test(c)||(m=zt(c),p=zt(h),p?m!==p&&(c=Oi(e,g,c,p)+p):m&&(h+=m)),this.add(o,"setProperty",c,h,i,r,0,0,g),a.push(g),R.push(g,0,o[g]);else if(d!=="undefined"){if(l&&g in l?(c=typeof l[g]=="function"?l[g].call(n,i,e,r):l[g],It(c)&&~c.indexOf("random(")&&(c=Bs(c)),zt(c+"")||c==="auto"||(c+=vn.units[g]||zt(ai(e,g))||""),(c+"").charAt(1)==="="&&(c=ai(e,g))):c=ai(e,g),f=parseFloat(c),M=d==="string"&&h.charAt(1)==="="&&h.substr(0,2),M&&(h=h.substr(2)),u=parseFloat(h),g in Xn&&(g==="autoAlpha"&&(f===1&&ai(e,"visibility")==="hidden"&&u&&(f=0),R.push("visibility",0,o.visibility),Ci(this,o,"visibility",f?"inherit":"hidden",u?"inherit":"hidden",!u)),g!=="scale"&&g!=="transform"&&(g=Xn[g],~g.indexOf(",")&&(g=g.split(",")[0]))),x=g in gi,x){if(this.styles.save(g),y=h,d==="string"&&h.substring(0,6)==="var(--"){if(h=_n(e,h.substring(4,h.indexOf(")"))),h.substring(0,5)==="calc("){var b=e.style.perspective;e.style.perspective=h,h=_n(e,"perspective"),b?e.style.perspective=b:Fi(e,"perspective")}u=parseFloat(h)}if(v||(S=e._gsap,S.renderTransform&&!t.parseTransform||Vs(e,t.parseTransform),A=t.smoothOrigin!==!1&&S.smooth,v=this._pt=new on(this._pt,o,vt,0,1,S.renderTransform,S,0,-1),v.dep=1),g==="scale")this._pt=new on(this._pt,S,"scaleY",S.scaleY,(M?Fr(S.scaleY,M+u):u)-S.scaleY||0,Ql),this._pt.u=0,a.push("scaleY",g),g+="X";else if(g==="transformOrigin"){R.push(ln,0,o[ln]),h=cM(h),S.svg?nc(e,h,0,A,0,this):(p=parseFloat(h.split(" ")[2])||0,p!==S.zOrigin&&Ci(this,S,"zOrigin",S.zOrigin,p),Ci(this,o,g,Wa(c),Wa(h)));continue}else if(g==="svgOrigin"){nc(e,h,1,A,0,this);continue}else if(g in Ad){dM(this,S,g,f,M?Fr(f,M+h):h);continue}else if(g==="smoothOrigin"){Ci(this,S,"smooth",S.smooth,h);continue}else if(g==="force3D"){S[g]=h;continue}else if(g==="transform"){pM(this,h,e);continue}}else g in o||(g=Jr(g)||g);if(x||(u||u===0)&&(f||f===0)&&!jy.test(h)&&g in o)m=(c+"").substr((f+"").length),u||(u=0),p=zt(h)||(g in vn.units?vn.units[g]:m),m!==p&&(f=Oi(e,g,c,p)),this._pt=new on(this._pt,x?S:o,g,f,(M?Fr(f,M+u):u)-f,!x&&(p==="px"||g==="zIndex")&&t.autoRound!==!1?Jy:Ql),this._pt.u=p||0,x&&y!==h?(this._pt.b=c,this._pt.e=y,this._pt.r=Zy):m!==p&&p!=="%"&&(this._pt.b=c,this._pt.r=$y);else if(g in o)lM.call(this,e,g,c,M?M+h:h);else if(g in e)this.add(e,g,c||e[g],M?M+h:h,i,r);else if(g!=="parseTransform"){Hc(g,h);continue}x||(g in o?R.push(g,0,o[g]):typeof e[g]=="function"?R.push(g,2,e[g]()):R.push(g,1,c||e[g])),a.push(g)}}w&&vd(this)},render:function(e,t){if(t.tween._time||!Jc())for(var n=t._pt;n;)n.r(e,n.d),n=n._next;else t.styles.revert()},get:ai,aliases:Xn,getSetter:function(e,t,n){var i=Xn[t];return i&&i.indexOf(",")<0&&(t=i),t in gi&&t!==ln&&(e._gsap.x||ai(e,"x"))?n&&Uu===n?t==="scale"?nM:tM:(Uu=n||{})&&(t==="scale"?iM:rM):e.style&&!Bc(e.style[t])?Qy:~t.indexOf("-")?eM:Kc(e,t)},core:{_removeProperty:Fi,_getMatrix:eh}};cn.utils.checkPrefix=Jr;cn.core.getStyleSaver=Td;(function(s,e,t,n){var i=an(s+","+e+","+t,function(r){gi[r]=1});an(e,function(r){vn.units[r]="deg",Ad[r]=1}),Xn[i[13]]=s+","+e,an(n,function(r){var a=r.split(":");Xn[a[1]]=i[a[0]]})})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent","rotation,rotationX,rotationY,skewX,skewY","transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective","0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");an("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective",function(s){vn.units[s]="px"});cn.registerPlugin(Pd);var ic=cn.registerPlugin(Pd)||cn;ic.core.Tween;class mM{constructor(e){this.changed=e,this.restart()}changed;phase="countdown";time=0;phaseTime=0;generation=0;values={number:99,freeze:0,shatter:0,melt:0,dawn:0,flash:0,hand:0,orb:0};timeline;set(e){this.phase=e,this.phaseTime=0,this.changed(e)}restart(){this.timeline?.kill();const e=++this.generation;Object.assign(this.values,{number:99,freeze:0,shatter:0,melt:0,dawn:0,flash:0,hand:0,orb:0}),this.time=0,this.set("countdown"),this.timeline=ic.timeline({paused:!0,onComplete:()=>{e===this.generation&&this.guide()}}).to(this.values,{number:0,duration:5.7,ease:"power1.in"},0).to(this.values,{freeze:1,duration:3.7,ease:"power1.inOut"},2.2).call(()=>this.set("shattering"),[],5.55).to(this.values,{shatter:1,duration:1.05,ease:"power1.inOut"},5.55)}guide(){this.timeline?.kill(),this.timeline=void 0,Object.assign(this.values,{number:0,freeze:1,shatter:1,hand:0}),this.set("guide")}drawing(){return this.phase!=="guide"?!1:(this.set("drawing"),this.values.hand=1,!0)}invalid(){this.phase==="drawing"&&(this.set("guide"),this.values.hand=1)}post(){this.timeline?.kill(),this.timeline=void 0,Object.assign(this.values,{number:0,freeze:1,shatter:1,melt:1,dawn:1,flash:0,hand:0,orb:0}),this.set("done")}success(){if(this.phase!=="drawing")return;this.timeline?.kill(),this.set("melting");const e=this.generation;this.timeline=ic.timeline({paused:!0,onComplete:()=>{e===this.generation&&(this.set("done"),this.timeline=void 0)}}).to(this.values,{hand:0,duration:.45,ease:"power1.in"},0).to(this.values,{melt:1,duration:1.7,ease:"power2.inOut"},.05).to(this.values,{flash:1,duration:.5,ease:"power2.in"},.48).to(this.values,{flash:0,duration:1,ease:"power1.out"},1.25).call(()=>this.set("transition"),[],1.4).to(this.values,{dawn:1,duration:1.8,ease:"power1.inOut"},1.25).to(this.values,{orb:1,duration:.45,ease:"power2.out"},1.5).to(this.values,{orb:0,duration:.65,ease:"power1.inOut"},2.6).to({},{duration:.3},3.2)}update(e){this.time+=e,this.phaseTime+=e;const t=this.timeline;t&&t.time(Math.min(t.duration(),t.time()+e)),this.phase==="guide"&&(this.values.hand=Math.min(1,this.values.hand+e*1.25))}dispose(){this.timeline?.kill()}}const gM=`attribute vec3 aCenter,aSeed;uniform float uBreak,uWord;varying vec2 vUv;varying float vDissolve;void main(){
  vUv=uv;vec3 p=position,local=p-aCenter;
  float t=max(0.,uBreak-aSeed.x*.28)/.72;
  float angle=t*(aSeed.y-.5)*4.;mat2 r=mat2(cos(angle),-sin(angle),sin(angle),cos(angle));
  local.xy=r*local.xy;local*=1.-min(.6,t*.4);
  p=aCenter+local+vec3((aSeed.x-.5)*.24,(aSeed.y-.5)*.20,aSeed.z*.12)*t*t;
  vDissolve=t;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
}`,_M=`uniform sampler2D uAtlas;uniform float uDigit,uBreak,uAlpha,uWord;varying vec2 vUv;varying float vDissolve;${Xs}
void main(){
  vec2 uv=vUv;
  uv+=(vec2(fbm(uv*15.),fbm(uv*15.+9.))-.5)*.04*uWord;
  float a=texture2D(uAtlas,vec2((uv.x+uDigit)/14.,uv.y)).a;
  float erosion=fbm(uv*43.+uDigit*11.);
  a*=uWord>0.?smoothstep(.22,.43,erosion):1.;
  a*=1.-smoothstep(.25,1.,vDissolve+erosion*.3);
  a*=uAlpha;
  if(a<.015)discard;
  gl_FragColor=vec4(1.,1.,1.,a);
}`;function vM(){const s=[],e=[],t=[],n=[];let a=12;const o=()=>(a=a*1664525+1013904223>>>0,a/4294967296);for(let c=0;c<26;c++)for(let h=0;h<20;h++)for(const u of[[[0,0],[1,0],[1,1]],[[0,0],[1,1],[0,1]]]){const f=new I;for(const[_,g]of u)f.add(new I((h+_)/20-.5,(c+g)/26-.5,0).multiplyScalar(1/3));const d=[o(),o(),o()];for(const[_,g]of u)s.push((h+_)/20-.5,(c+g)/26-.5,0),e.push((h+_)/20,(c+g)/26),t.push(...f.toArray()),n.push(...d)}const l=new Mt;return l.setAttribute("position",new Ye(s,3)),l.setAttribute("uv",new Ye(e,2)),l.setAttribute("aCenter",new Ye(t,3)),l.setAttribute("aSeed",new Ye(n,3)),l}class xM{group=new Ht;digits=new Ht;word=new Ht;materials=[];canvas=document.createElement("canvas");texture;constructor(){this.canvas.width=3584,this.canvas.height=384,this.texture=new Ac(this.canvas),this.refreshAtlas(),this.group.add(this.digits,this.word);for(let e=0;e<6;e++){const t=e>=2,n=new Ut({vertexShader:gM,fragmentShader:_M,transparent:!0,depthWrite:!1,depthTest:!1,side:en,uniforms:{uAtlas:{value:this.texture},uDigit:{value:t?10+e-2:9},uBreak:{value:0},uAlpha:{value:1},uWord:{value:t?1:0}}});this.materials.push(n);const i=new We(vM(),n);i.frustumCulled=!1,i.position.x=t?(e-2)*.54:(e-.5)*.56,i.scale.set(.7,1.1,1),(t?this.word:this.digits).add(i)}this.word.position.x=-.28,this.word.scale.setScalar(1.4)}refreshAtlas(){const e=this.canvas.getContext("2d");e.clearRect(0,0,this.canvas.width,this.canvas.height),e.fillStyle="white",e.font='800 330px "Zero Sans",Arial,sans-serif',e.textAlign="center",e.textBaseline="middle";for(const[t,n]of[..."0123456789ZERO"].entries())e.fillText(n,t*256+128,202,252);this.texture&&(this.texture.needsUpdate=!0)}update(e,t,n,i,r){const a=Math.max(0,Math.min(99,Math.ceil(e)));this.materials[0].uniforms.uDigit.value=Math.floor(a/10),this.materials[1].uniforms.uDigit.value=a%10,this.digits.visible=t<.75,this.word.visible=t>.12&&r<1.6;for(let o=0;o<6;o++){const l=this.materials[o],c=o>=2;l.uniforms.uBreak.value=c?Math.max(0,r-.3)/1.4:t,l.uniforms.uAlpha.value=c?Math.min(1,Math.max(0,(t-.12)*4)):1}this.group.visible=r<1.8,this.group.scale.setScalar(i>.9?.36:.28),this.group.position.set(-i+(i>.9?.275:.23),-.83,.1)}dispose(){this.texture.dispose(),this.group.traverse(e=>{e instanceof We&&e.geometry.dispose()});for(const e of this.materials)e.dispose()}}function Gu(s,e=!1){const t=s[0].index!==null,n=new Set(Object.keys(s[0].attributes)),i=new Set(Object.keys(s[0].morphAttributes)),r={},a={},o=s[0].morphTargetsRelative,l=new Mt;let c=0;for(let h=0;h<s.length;++h){const u=s[h];let f=0;if(t!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const d in u.attributes){if(!n.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+d+'" attribute exists among all geometries, or in none of them.'),null;r[d]===void 0&&(r[d]=[]),r[d].push(u.attributes[d]),f++}if(f!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(o!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const d in u.morphAttributes){if(!i.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;a[d]===void 0&&(a[d]=[]),a[d].push(u.morphAttributes[d])}if(e){let d;if(t)d=u.index.count;else if(u.attributes.position!==void 0)d=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,d,h),c+=d}}if(t){let h=0;const u=[];for(let f=0;f<s.length;++f){const d=s[f].index;for(let _=0;_<d.count;++_)u.push(d.getX(_)+h);h+=s[f].attributes.position.count}l.setIndex(u)}for(const h in r){const u=Wu(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(const h in a){const u=a[h][0].length;if(u===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let f=0;f<u;++f){const d=[];for(let g=0;g<a[h].length;++g)d.push(a[h][g][f]);const _=Wu(d);if(!_)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(_)}}return l}function Wu(s){let e,t,n,i=-1,r=0;for(let c=0;c<s.length;++c){const h=s[c];if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=h.gpuType),i!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*t}const a=new e(r),o=new Vt(a,t,n);let l=0;for(let c=0;c<s.length;++c){const h=s[c];if(h.isInterleavedBufferAttribute){const u=l/t;for(let f=0,d=h.count;f<d;f++)for(let _=0;_<t;_++){const g=h.getComponent(f,_);o.setComponent(f+u,_,g)}}else a.set(h.array,l);l+=h.count*t}return i!==void 0&&(o.gpuType=i),o}function Xu(s,e){if(e===xp)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),s;if(e===Fl||e===hf){let t=s.getIndex();if(t===null){const a=[],o=s.getAttribute("position");if(o!==void 0){for(let l=0;l<o.count;l++)a.push(l);s.setIndex(a),t=s.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),s}const n=t.count-2,i=[];if(e===Fl)for(let a=1;a<=n;a++)i.push(t.getX(0)),i.push(t.getX(a)),i.push(t.getX(a+1));else for(let a=0;a<n;a++)a%2===0?(i.push(t.getX(a)),i.push(t.getX(a+1)),i.push(t.getX(a+2))):(i.push(t.getX(a+2)),i.push(t.getX(a+1)),i.push(t.getX(a)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const r=s.clone();return r.setIndex(i),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),s}class Dd extends ns{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new bM(t)}),this.register(function(t){return new EM(t)}),this.register(function(t){return new UM(t)}),this.register(function(t){return new NM(t)}),this.register(function(t){return new FM(t)}),this.register(function(t){return new AM(t)}),this.register(function(t){return new RM(t)}),this.register(function(t){return new CM(t)}),this.register(function(t){return new PM(t)}),this.register(function(t){return new TM(t)}),this.register(function(t){return new DM(t)}),this.register(function(t){return new wM(t)}),this.register(function(t){return new IM(t)}),this.register(function(t){return new LM(t)}),this.register(function(t){return new MM(t)}),this.register(function(t){return new OM(t)}),this.register(function(t){return new BM(t)})}load(e,t,n,i){const r=this;let a;if(this.resourcePath!=="")a=this.resourcePath;else if(this.path!==""){const c=Ts.extractUrlBase(e);a=Ts.resolveURL(c,this.path)}else a=Ts.extractUrlBase(e);this.manager.itemStart(e);const o=function(c){i?i(c):console.error(c),r.manager.itemError(e),r.manager.itemEnd(e)},l=new Rf(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{r.parse(c,a,function(h){t(h),r.manager.itemEnd(e)},o)}catch(h){o(h)}},n,o)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let r;const a={},o={},l=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===Ld){try{a[Ge.KHR_BINARY_GLTF]=new kM(e)}catch(u){i&&i(u);return}r=JSON.parse(a[Ge.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const c=new JM(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){const u=this.pluginCallbacks[h](c);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),o[u.name]=u,a[u.name]=!0}if(r.extensionsUsed)for(let h=0;h<r.extensionsUsed.length;++h){const u=r.extensionsUsed[h],f=r.extensionsRequired||[];switch(u){case Ge.KHR_MATERIALS_UNLIT:a[u]=new SM;break;case Ge.KHR_DRACO_MESH_COMPRESSION:a[u]=new zM(r,this.dracoLoader);break;case Ge.KHR_TEXTURE_TRANSFORM:a[u]=new HM;break;case Ge.KHR_MESH_QUANTIZATION:a[u]=new VM;break;default:f.indexOf(u)>=0&&o[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}c.setExtensions(a),c.setPlugins(o),c.parse(n,i)}parseAsync(e,t){const n=this;return new Promise(function(i,r){n.parse(e,t,i,r)})}}function yM(){let s={};return{get:function(e){return s[e]},add:function(e,t){s[e]=t},remove:function(e){delete s[e]},removeAll:function(){s={}}}}const Ge={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class MM{constructor(e){this.parser=e,this.name=Ge.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){const r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let i=t.cache.get(n);if(i)return i;const r=t.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e];let c;const h=new me(16777215);l.color!==void 0&&h.setRGB(l.color[0],l.color[1],l.color[2],Zt);const u=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new ir(h),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new Cf(h),c.distance=u;break;case"spot":c=new Xm(h),c.distance=u,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),zn(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),i=Promise.resolve(c),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,r=n.json.nodes[e],o=(r.extensions&&r.extensions[this.name]||{}).light;return o===void 0?null:this._loadLight(o).then(function(l){return n._getNodeRef(t.cache,o,l)})}}class SM{constructor(){this.name=Ge.KHR_MATERIALS_UNLIT}getMaterialType(){return ci}extendParams(e,t,n){const i=[];e.color=new me(1,1,1),e.opacity=1;const r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){const a=r.baseColorFactor;e.color.setRGB(a[0],a[1],a[2],Zt),e.opacity=a[3]}r.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",r.baseColorTexture,wt))}return Promise.all(i)}}class TM{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}}class bM{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Jt}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];if(a.clearcoatFactor!==void 0&&(t.clearcoat=a.clearcoatFactor),a.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",a.clearcoatTexture)),a.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=a.clearcoatRoughnessFactor),a.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",a.clearcoatRoughnessTexture)),a.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",a.clearcoatNormalTexture)),a.clearcoatNormalTexture.scale!==void 0)){const o=a.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new ue(o,o)}return Promise.all(r)}}class EM{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_DISPERSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Jt}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}}class wM{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Jt}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];return a.iridescenceFactor!==void 0&&(t.iridescence=a.iridescenceFactor),a.iridescenceTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceMap",a.iridescenceTexture)),a.iridescenceIor!==void 0&&(t.iridescenceIOR=a.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),a.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=a.iridescenceThicknessMinimum),a.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=a.iridescenceThicknessMaximum),a.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceThicknessMap",a.iridescenceThicknessTexture)),Promise.all(r)}}class AM{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_SHEEN}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Jt}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[];t.sheenColor=new me(0,0,0),t.sheenRoughness=0,t.sheen=1;const a=i.extensions[this.name];if(a.sheenColorFactor!==void 0){const o=a.sheenColorFactor;t.sheenColor.setRGB(o[0],o[1],o[2],Zt)}return a.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=a.sheenRoughnessFactor),a.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",a.sheenColorTexture,wt)),a.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",a.sheenRoughnessTexture)),Promise.all(r)}}class RM{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Jt}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];return a.transmissionFactor!==void 0&&(t.transmission=a.transmissionFactor),a.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",a.transmissionTexture)),Promise.all(r)}}class CM{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_VOLUME}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Jt}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];t.thickness=a.thicknessFactor!==void 0?a.thicknessFactor:0,a.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",a.thicknessTexture)),t.attenuationDistance=a.attenuationDistance||1/0;const o=a.attenuationColor||[1,1,1];return t.attenuationColor=new me().setRGB(o[0],o[1],o[2],Zt),Promise.all(r)}}class PM{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_IOR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Jt}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}}class DM{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_SPECULAR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Jt}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];t.specularIntensity=a.specularFactor!==void 0?a.specularFactor:1,a.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",a.specularTexture));const o=a.specularColorFactor||[1,1,1];return t.specularColor=new me().setRGB(o[0],o[1],o[2],Zt),a.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",a.specularColorTexture,wt)),Promise.all(r)}}class LM{constructor(e){this.parser=e,this.name=Ge.EXT_MATERIALS_BUMP}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Jt}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];return t.bumpScale=a.bumpFactor!==void 0?a.bumpFactor:1,a.bumpTexture!==void 0&&r.push(n.assignTexture(t,"bumpMap",a.bumpTexture)),Promise.all(r)}}class IM{constructor(e){this.parser=e,this.name=Ge.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Jt}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],a=i.extensions[this.name];return a.anisotropyStrength!==void 0&&(t.anisotropy=a.anisotropyStrength),a.anisotropyRotation!==void 0&&(t.anisotropyRotation=a.anisotropyRotation),a.anisotropyTexture!==void 0&&r.push(n.assignTexture(t,"anisotropyMap",a.anisotropyTexture)),Promise.all(r)}}class UM{constructor(e){this.parser=e,this.name=Ge.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;const r=i.extensions[this.name],a=t.options.ktx2Loader;if(!a){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,a)}}class NM{constructor(e){this.parser=e,this.name=Ge.EXT_TEXTURE_WEBP}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const a=r.extensions[t],o=i.images[a.source];let l=n.textureLoader;if(o.uri){const c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return n.loadTextureImage(e,a.source,l)}}class FM{constructor(e){this.parser=e,this.name=Ge.EXT_TEXTURE_AVIF}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const a=r.extensions[t],o=i.images[a.source];let l=n.textureLoader;if(o.uri){const c=n.options.manager.getHandler(o.uri);c!==null&&(l=c)}return n.loadTextureImage(e,a.source,l)}}class OM{constructor(e){this.name=Ge.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const i=n.extensions[this.name],r=this.parser.getDependency("buffer",i.buffer),a=this.parser.options.meshoptDecoder;if(!a||!a.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(o){const l=i.byteOffset||0,c=i.byteLength||0,h=i.count,u=i.byteStride,f=new Uint8Array(o,l,c);return a.decodeGltfBufferAsync?a.decodeGltfBufferAsync(h,u,f,i.mode,i.filter).then(function(d){return d.buffer}):a.ready.then(function(){const d=new ArrayBuffer(h*u);return a.decodeGltfBuffer(new Uint8Array(d),h,u,f,i.mode,i.filter),d})})}else return null}}class BM{constructor(e){this.name=Ge.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const i=t.meshes[n.mesh];for(const c of i.primitives)if(c.mode!==wn.TRIANGLES&&c.mode!==wn.TRIANGLE_STRIP&&c.mode!==wn.TRIANGLE_FAN&&c.mode!==void 0)return null;const a=n.extensions[this.name].attributes,o=[],l={};for(const c in a)o.push(this.parser.getDependency("accessor",a[c]).then(h=>(l[c]=h,l[c])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(c=>{const h=c.pop(),u=h.isGroup?h.children:[h],f=c[0].count,d=[];for(const _ of u){const g=new Ne,m=new I,p=new Lt,M=new I(1,1,1),x=new Ya(_.geometry,_.material,f);for(let v=0;v<f;v++)l.TRANSLATION&&m.fromBufferAttribute(l.TRANSLATION,v),l.ROTATION&&p.fromBufferAttribute(l.ROTATION,v),l.SCALE&&M.fromBufferAttribute(l.SCALE,v),x.setMatrixAt(v,g.compose(m,p,M));for(const v in l)if(v==="_COLOR_0"){const S=l[v];x.instanceColor=new Bl(S.array,S.itemSize,S.normalized)}else v!=="TRANSLATION"&&v!=="ROTATION"&&v!=="SCALE"&&_.geometry.setAttribute(v,l[v]);ct.prototype.copy.call(x,_),this.parser.assignFinalMaterial(x),d.push(x)}return h.isGroup?(h.clear(),h.add(...d),h):d[0]}))}}const Ld="glTF",ms=12,qu={JSON:1313821514,BIN:5130562};class kM{constructor(e){this.name=Ge.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,ms),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Ld)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const i=this.header.length-ms,r=new DataView(e,ms);let a=0;for(;a<i;){const o=r.getUint32(a,!0);a+=4;const l=r.getUint32(a,!0);if(a+=4,l===qu.JSON){const c=new Uint8Array(e,ms+a,o);this.content=n.decode(c)}else if(l===qu.BIN){const c=ms+a;this.body=e.slice(c,c+o)}a+=o}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class zM{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=Ge.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,i=this.dracoLoader,r=e.extensions[this.name].bufferView,a=e.extensions[this.name].attributes,o={},l={},c={};for(const h in a){const u=rc[h]||h.toLowerCase();o[u]=a[h]}for(const h in e.attributes){const u=rc[h]||h.toLowerCase();if(a[h]!==void 0){const f=n.accessors[e.attributes[h]],d=kr[f.componentType];c[u]=d.name,l[u]=f.normalized===!0}}return t.getDependency("bufferView",r).then(function(h){return new Promise(function(u,f){i.decodeDracoFile(h,function(d){for(const _ in d.attributes){const g=d.attributes[_],m=l[_];m!==void 0&&(g.normalized=m)}u(d)},o,c,Zt,f)})})}}class HM{constructor(){this.name=Ge.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class VM{constructor(){this.name=Ge.KHR_MESH_QUANTIZATION}}class Id extends Ws{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i*3+i;for(let a=0;a!==i;a++)t[a]=n[r+a];return t}interpolate_(e,t,n,i){const r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=o*2,c=o*3,h=i-t,u=(n-t)/h,f=u*u,d=f*u,_=e*c,g=_-c,m=-2*d+3*f,p=d-f,M=1-m,x=p-f+u;for(let v=0;v!==o;v++){const S=a[g+v+o],A=a[g+v+l]*h,w=a[_+v+o],R=a[_+v]*h;r[v]=M*S+x*A+m*w+p*R}return r}}const GM=new Lt;class WM extends Id{interpolate_(e,t,n,i){const r=super.interpolate_(e,t,n,i);return GM.fromArray(r).normalize().toArray(r),r}}const wn={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},kr={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Yu={9728:$t,9729:jt,9984:tf,9985:Ta,9986:_s,9987:li},ju={33071:wi,33648:La,10497:Ui},Yo={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},rc={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},bi={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},XM={CUBICSPLINE:void 0,LINEAR:Ls,STEP:Ds},jo={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function qM(s){return s.DefaultMaterial===void 0&&(s.DefaultMaterial=new Di({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:pi})),s.DefaultMaterial}function Zi(s,e,t){for(const n in t.extensions)s[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function zn(s,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(s.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function YM(s,e,t){let n=!1,i=!1,r=!1;for(let c=0,h=e.length;c<h;c++){const u=e[c];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(i=!0),u.COLOR_0!==void 0&&(r=!0),n&&i&&r)break}if(!n&&!i&&!r)return Promise.resolve(s);const a=[],o=[],l=[];for(let c=0,h=e.length;c<h;c++){const u=e[c];if(n){const f=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):s.attributes.position;a.push(f)}if(i){const f=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):s.attributes.normal;o.push(f)}if(r){const f=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):s.attributes.color;l.push(f)}}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l)]).then(function(c){const h=c[0],u=c[1],f=c[2];return n&&(s.morphAttributes.position=h),i&&(s.morphAttributes.normal=u),r&&(s.morphAttributes.color=f),s.morphTargetsRelative=!0,s})}function jM(s,e){if(s.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)s.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(s.morphTargetInfluences.length===t.length){s.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)s.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function KM(s){let e;const t=s.extensions&&s.extensions[Ge.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Ko(t.attributes):e=s.indices+":"+Ko(s.attributes)+":"+s.mode,s.targets!==void 0)for(let n=0,i=s.targets.length;n<i;n++)e+=":"+Ko(s.targets[n]);return e}function Ko(s){let e="";const t=Object.keys(s).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+s[t[n]]+";";return e}function sc(s){switch(s){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function $M(s){return s.search(/\.jpe?g($|\?)/i)>0||s.search(/^data\:image\/jpeg/)===0?"image/jpeg":s.search(/\.webp($|\?)/i)>0||s.search(/^data\:image\/webp/)===0?"image/webp":s.search(/\.ktx2($|\?)/i)>0||s.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const ZM=new Ne;class JM{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new yM,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,r=!1,a=-1;if(typeof navigator<"u"){const o=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(o)===!0;const l=o.match(/Version\/(\d+)/);i=n&&l?parseInt(l[1],10):-1,r=o.indexOf("Firefox")>-1,a=r?o.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&i<17||r&&a<98?this.textureLoader=new Oa(this.options.manager):this.textureLoader=new jm(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Rf(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,i=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(a){return a._markDefs&&a._markDefs()}),Promise.all(this._invokeAll(function(a){return a.beforeRoot&&a.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(a){const o={scene:a[0][i.scene||0],scenes:a[0],animations:a[1],cameras:a[2],asset:i.asset,parser:n,userData:{}};return Zi(r,o,i),zn(o,i),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(o)})).then(function(){for(const l of o.scenes)l.updateMatrixWorld();e(o)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,r=t.length;i<r;i++){const a=t[i].joints;for(let o=0,l=a.length;o<l;o++)e[a[o]].isBone=!0}for(let i=0,r=e.length;i<r;i++){const a=e[i];a.mesh!==void 0&&(this._addNodeRef(this.meshCache,a.mesh),a.skin!==void 0&&(n[a.mesh].isSkinnedMesh=!0)),a.camera!==void 0&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const i=n.clone(),r=(a,o)=>{const l=this.associations.get(a);l!=null&&this.associations.set(o,l);for(const[c,h]of a.children.entries())r(h,o.children[c])};return r(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const i=e(t[n]);if(i)return i}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let i=0;i<t.length;i++){const r=e(t[i]);r&&n.push(r)}return n}getDependency(e,t){const n=e+":"+t;let i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":i=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(r,a){return n.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[Ge.KHR_BINARY_GLTF].body);const i=this.options;return new Promise(function(r,a){n.load(Ts.resolveURL(t.uri,i.path),r,void 0,function(){a(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const i=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+i)})}loadAccessor(e){const t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){const a=Yo[i.type],o=kr[i.componentType],l=i.normalized===!0,c=new o(i.count*a);return Promise.resolve(new Vt(c,a,l))}const r=[];return i.bufferView!==void 0?r.push(this.getDependency("bufferView",i.bufferView)):r.push(null),i.sparse!==void 0&&(r.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(r).then(function(a){const o=a[0],l=Yo[i.type],c=kr[i.componentType],h=c.BYTES_PER_ELEMENT,u=h*l,f=i.byteOffset||0,d=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,_=i.normalized===!0;let g,m;if(d&&d!==u){const p=Math.floor(f/d),M="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+p+":"+i.count;let x=t.cache.get(M);x||(g=new c(o,p*d,i.count*d/h),x=new vm(g,d/h),t.cache.add(M,x)),m=new Sc(x,l,f%d/h,_)}else o===null?g=new c(i.count*l):g=new c(o,f,i.count*l),m=new Vt(g,l,_);if(i.sparse!==void 0){const p=Yo.SCALAR,M=kr[i.sparse.indices.componentType],x=i.sparse.indices.byteOffset||0,v=i.sparse.values.byteOffset||0,S=new M(a[1],x,i.sparse.count*p),A=new c(a[2],v,i.sparse.count*l);o!==null&&(m=new Vt(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let w=0,R=S.length;w<R;w++){const y=S[w];if(m.setX(y,A[w*l]),l>=2&&m.setY(y,A[w*l+1]),l>=3&&m.setZ(y,A[w*l+2]),l>=4&&m.setW(y,A[w*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=_}return m})}loadTexture(e){const t=this.json,n=this.options,r=t.textures[e].source,a=t.images[r];let o=this.textureLoader;if(a.uri){const l=n.manager.getHandler(a.uri);l!==null&&(o=l)}return this.loadTextureImage(e,r,o)}loadTextureImage(e,t,n){const i=this,r=this.json,a=r.textures[e],o=r.images[t],l=(o.uri||o.bufferView)+":"+a.sampler;if(this.textureCache[l])return this.textureCache[l];const c=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=a.name||o.name||"",h.name===""&&typeof o.uri=="string"&&o.uri.startsWith("data:image/")===!1&&(h.name=o.uri);const f=(r.samplers||{})[a.sampler]||{};return h.magFilter=Yu[f.magFilter]||jt,h.minFilter=Yu[f.minFilter]||li,h.wrapS=ju[f.wrapS]||Ui,h.wrapT=ju[f.wrapT]||Ui,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==$t&&h.minFilter!==jt,i.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){const n=this,i=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(u=>u.clone());const a=i.images[e],o=self.URL||self.webkitURL;let l=a.uri||"",c=!1;if(a.bufferView!==void 0)l=n.getDependency("bufferView",a.bufferView).then(function(u){c=!0;const f=new Blob([u],{type:a.mimeType});return l=o.createObjectURL(f),l});else if(a.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const h=Promise.resolve(l).then(function(u){return new Promise(function(f,d){let _=f;t.isImageBitmapLoader===!0&&(_=function(g){const m=new At(g);m.needsUpdate=!0,f(m)}),t.load(Ts.resolveURL(u,r.path),_,void 0,d)})}).then(function(u){return c===!0&&o.revokeObjectURL(l),zn(u,a),u.userData.mimeType=a.mimeType||$M(a.uri),u}).catch(function(u){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),u});return this.sourceCache[e]=h,h}assignTexture(e,t,n,i){const r=this;return this.getDependency("texture",n.index).then(function(a){if(!a)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(a=a.clone(),a.channel=n.texCoord),r.extensions[Ge.KHR_TEXTURE_TRANSFORM]){const o=n.extensions!==void 0?n.extensions[Ge.KHR_TEXTURE_TRANSFORM]:void 0;if(o){const l=r.associations.get(a);a=r.extensions[Ge.KHR_TEXTURE_TRANSFORM].extendTexture(a,o),r.associations.set(a,l)}}return i!==void 0&&(a.colorSpace=i),e[t]=a,a})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const i=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,a=t.attributes.normal===void 0;if(e.isPoints){const o="PointsMaterial:"+n.uuid;let l=this.cache.get(o);l||(l=new Tf,On.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(o,l)),n=l}else if(e.isLine){const o="LineBasicMaterial:"+n.uuid;let l=this.cache.get(o);l||(l=new Sf,On.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(o,l)),n=l}if(i||r||a){let o="ClonedMaterial:"+n.uuid+":";i&&(o+="derivative-tangents:"),r&&(o+="vertex-colors:"),a&&(o+="flat-shading:");let l=this.cache.get(o);l||(l=n.clone(),r&&(l.vertexColors=!0),a&&(l.flatShading=!0),i&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(o,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return Di}loadMaterial(e){const t=this,n=this.json,i=this.extensions,r=n.materials[e];let a;const o={},l=r.extensions||{},c=[];if(l[Ge.KHR_MATERIALS_UNLIT]){const u=i[Ge.KHR_MATERIALS_UNLIT];a=u.getMaterialType(),c.push(u.extendParams(o,r,t))}else{const u=r.pbrMetallicRoughness||{};if(o.color=new me(1,1,1),o.opacity=1,Array.isArray(u.baseColorFactor)){const f=u.baseColorFactor;o.color.setRGB(f[0],f[1],f[2],Zt),o.opacity=f[3]}u.baseColorTexture!==void 0&&c.push(t.assignTexture(o,"map",u.baseColorTexture,wt)),o.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,o.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(o,"metalnessMap",u.metallicRoughnessTexture)),c.push(t.assignTexture(o,"roughnessMap",u.metallicRoughnessTexture))),a=this._invokeOne(function(f){return f.getMaterialType&&f.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(f){return f.extendMaterialParams&&f.extendMaterialParams(e,o)})))}r.doubleSided===!0&&(o.side=en);const h=r.alphaMode||jo.OPAQUE;if(h===jo.BLEND?(o.transparent=!0,o.depthWrite=!1):(o.transparent=!1,h===jo.MASK&&(o.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&a!==ci&&(c.push(t.assignTexture(o,"normalMap",r.normalTexture)),o.normalScale=new ue(1,1),r.normalTexture.scale!==void 0)){const u=r.normalTexture.scale;o.normalScale.set(u,u)}if(r.occlusionTexture!==void 0&&a!==ci&&(c.push(t.assignTexture(o,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(o.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&a!==ci){const u=r.emissiveFactor;o.emissive=new me().setRGB(u[0],u[1],u[2],Zt)}return r.emissiveTexture!==void 0&&a!==ci&&c.push(t.assignTexture(o,"emissiveMap",r.emissiveTexture,wt)),Promise.all(c).then(function(){const u=new a(o);return r.name&&(u.name=r.name),zn(u,r),t.associations.set(u,{materials:e}),r.extensions&&Zi(i,u,r),u})}createUniqueName(e){const t=nt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,i=this.primitiveCache;function r(o){return n[Ge.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o,t).then(function(l){return Ku(l,o,t)})}const a=[];for(let o=0,l=e.length;o<l;o++){const c=e[o],h=KM(c),u=i[h];if(u)a.push(u.promise);else{let f;c.extensions&&c.extensions[Ge.KHR_DRACO_MESH_COMPRESSION]?f=r(c):f=Ku(new Mt,c,t),i[h]={primitive:c,promise:f},a.push(f)}}return Promise.all(a)}loadMesh(e){const t=this,n=this.json,i=this.extensions,r=n.meshes[e],a=r.primitives,o=[];for(let l=0,c=a.length;l<c;l++){const h=a[l].material===void 0?qM(this.cache):this.getDependency("material",a[l].material);o.push(h)}return o.push(t.loadGeometries(a)),Promise.all(o).then(function(l){const c=l.slice(0,l.length-1),h=l[l.length-1],u=[];for(let d=0,_=h.length;d<_;d++){const g=h[d],m=a[d];let p;const M=c[d];if(m.mode===wn.TRIANGLES||m.mode===wn.TRIANGLE_STRIP||m.mode===wn.TRIANGLE_FAN||m.mode===void 0)p=r.isSkinnedMesh===!0?new Tc(g,M):new We(g,M),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),m.mode===wn.TRIANGLE_STRIP?p.geometry=Xu(p.geometry,hf):m.mode===wn.TRIANGLE_FAN&&(p.geometry=Xu(p.geometry,Fl));else if(m.mode===wn.LINES)p=new Em(g,M);else if(m.mode===wn.LINE_STRIP)p=new wc(g,M);else if(m.mode===wn.LINE_LOOP)p=new wm(g,M);else if(m.mode===wn.POINTS)p=new Am(g,M);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(p.geometry.morphAttributes).length>0&&jM(p,r),p.name=t.createUniqueName(r.name||"mesh_"+e),zn(p,r),m.extensions&&Zi(i,p,m),t.assignFinalMaterial(p),u.push(p)}for(let d=0,_=u.length;d<_;d++)t.associations.set(u[d],{meshes:e,primitives:d});if(u.length===1)return r.extensions&&Zi(i,u[0],r),u[0];const f=new Ht;r.extensions&&Zi(i,f,r),t.associations.set(f,{meshes:e});for(let d=0,_=u.length;d<_;d++)f.add(u[d]);return f})}loadCamera(e){let t;const n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new kt(qp.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new is(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),zn(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let i=0,r=t.joints.length;i<r;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){const r=i.pop(),a=i,o=[],l=[];for(let c=0,h=a.length;c<h;c++){const u=a[c];if(u){o.push(u);const f=new Ne;r!==null&&f.fromArray(r.array,c*16),l.push(f)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new bc(o,l)})}loadAnimation(e){const t=this.json,n=this,i=t.animations[e],r=i.name?i.name:"animation_"+e,a=[],o=[],l=[],c=[],h=[];for(let u=0,f=i.channels.length;u<f;u++){const d=i.channels[u],_=i.samplers[d.sampler],g=d.target,m=g.node,p=i.parameters!==void 0?i.parameters[_.input]:_.input,M=i.parameters!==void 0?i.parameters[_.output]:_.output;g.node!==void 0&&(a.push(this.getDependency("node",m)),o.push(this.getDependency("accessor",p)),l.push(this.getDependency("accessor",M)),c.push(_),h.push(g))}return Promise.all([Promise.all(a),Promise.all(o),Promise.all(l),Promise.all(c),Promise.all(h)]).then(function(u){const f=u[0],d=u[1],_=u[2],g=u[3],m=u[4],p=[];for(let x=0,v=f.length;x<v;x++){const S=f[x],A=d[x],w=_[x],R=g[x],y=m[x];if(S===void 0)continue;S.updateMatrix&&S.updateMatrix();const b=n._createAnimationTracks(S,A,w,R,y);if(b)for(let P=0;P<b.length;P++)p.push(b[P])}const M=new Om(r,void 0,p);return zn(M,i),M})}createNodeMesh(e){const t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(r){const a=n._getNodeRef(n.meshCache,i.mesh,r);return i.weights!==void 0&&a.traverse(function(o){if(o.isMesh)for(let l=0,c=i.weights.length;l<c;l++)o.morphTargetInfluences[l]=i.weights[l]}),a})}loadNode(e){const t=this.json,n=this,i=t.nodes[e],r=n._loadNodeShallow(e),a=[],o=i.children||[];for(let c=0,h=o.length;c<h;c++)a.push(n.getDependency("node",o[c]));const l=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([r,Promise.all(a),l]).then(function(c){const h=c[0],u=c[1],f=c[2];f!==null&&h.traverse(function(d){d.isSkinnedMesh&&d.bind(f,ZM)});for(let d=0,_=u.length;d<_;d++)h.add(u[d]);return h})}_loadNodeShallow(e){const t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const r=t.nodes[e],a=r.name?i.createUniqueName(r.name):"",o=[],l=i._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&o.push(l),r.camera!==void 0&&o.push(i.getDependency("camera",r.camera).then(function(c){return i._getNodeRef(i.cameraCache,r.camera,c)})),i._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){o.push(c)}),this.nodeCache[e]=Promise.all(o).then(function(c){let h;if(r.isBone===!0?h=new qa:c.length>1?h=new Ht:c.length===1?h=c[0]:h=new ct,h!==c[0])for(let u=0,f=c.length;u<f;u++)h.add(c[u]);if(r.name&&(h.userData.name=r.name,h.name=a),zn(h,r),r.extensions&&Zi(n,h,r),r.matrix!==void 0){const u=new Ne;u.fromArray(r.matrix),h.applyMatrix4(u)}else r.translation!==void 0&&h.position.fromArray(r.translation),r.rotation!==void 0&&h.quaternion.fromArray(r.rotation),r.scale!==void 0&&h.scale.fromArray(r.scale);if(!i.associations.has(h))i.associations.set(h,{});else if(r.mesh!==void 0&&i.meshCache.refs[r.mesh]>1){const u=i.associations.get(h);i.associations.set(h,{...u})}return i.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],i=this,r=new Ht;n.name&&(r.name=i.createUniqueName(n.name)),zn(r,n),n.extensions&&Zi(t,r,n);const a=n.nodes||[],o=[];for(let l=0,c=a.length;l<c;l++)o.push(i.getDependency("node",a[l]));return Promise.all(o).then(function(l){for(let h=0,u=l.length;h<u;h++)r.add(l[h]);const c=h=>{const u=new Map;for(const[f,d]of i.associations)(f instanceof On||f instanceof At)&&u.set(f,d);return h.traverse(f=>{const d=i.associations.get(f);d!=null&&u.set(f,d)}),u};return i.associations=c(r),r})}_createAnimationTracks(e,t,n,i,r){const a=[],o=e.name?e.name:e.uuid,l=[];bi[r.path]===bi.weights?e.traverse(function(f){f.morphTargetInfluences&&l.push(f.name?f.name:f.uuid)}):l.push(o);let c;switch(bi[r.path]){case bi.weights:c=Xr;break;case bi.rotation:c=qr;break;case bi.translation:case bi.scale:c=Yr;break;default:n.itemSize===1?c=Xr:c=Yr;break}const h=i.interpolation!==void 0?XM[i.interpolation]:Ls,u=this._getArrayFromAccessor(n);for(let f=0,d=l.length;f<d;f++){const _=new c(l[f]+"."+bi[r.path],t.array,u,h);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(_),a.push(_)}return a}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=sc(t.constructor),i=new Float32Array(t.length);for(let r=0,a=t.length;r<a;r++)i[r]=t[r]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const i=this instanceof qr?WM:Id;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function QM(s,e,t){const n=e.attributes,i=new _i;if(n.POSITION!==void 0){const o=t.json.accessors[n.POSITION],l=o.min,c=o.max;if(l!==void 0&&c!==void 0){if(i.set(new I(l[0],l[1],l[2]),new I(c[0],c[1],c[2])),o.normalized){const h=sc(kr[o.componentType]);i.min.multiplyScalar(h),i.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const r=e.targets;if(r!==void 0){const o=new I,l=new I;for(let c=0,h=r.length;c<h;c++){const u=r[c];if(u.POSITION!==void 0){const f=t.json.accessors[u.POSITION],d=f.min,_=f.max;if(d!==void 0&&_!==void 0){if(l.setX(Math.max(Math.abs(d[0]),Math.abs(_[0]))),l.setY(Math.max(Math.abs(d[1]),Math.abs(_[1]))),l.setZ(Math.max(Math.abs(d[2]),Math.abs(_[2]))),f.normalized){const g=sc(kr[f.componentType]);l.multiplyScalar(g)}o.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(o)}s.boundingBox=i;const a=new Kn;i.getCenter(a.center),a.radius=i.min.distanceTo(i.max)/2,s.boundingSphere=a}function Ku(s,e,t){const n=e.attributes,i=[];function r(a,o){return t.getDependency("accessor",a).then(function(l){s.setAttribute(o,l)})}for(const a in n){const o=rc[a]||a.toLowerCase();o in s.attributes||i.push(r(n[a],o))}if(e.indices!==void 0&&!s.index){const a=t.getDependency("accessor",e.indices).then(function(o){s.setIndex(o)});i.push(a)}return Ze.workingColorSpace!==Zt&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Ze.workingColorSpace}" not supported.`),zn(s,e),QM(s,e,t),Promise.all(i).then(function(){return e.targets!==void 0?YM(s,e.targets,t):s})}class eS{scene=new cr;root=new Ht;ready=!1;error;tip;cursor=new ue(.5,.5);cursorAt=-1e5;follow=0;setPointer(e,t){this.cursor.set(e,t),this.cursorAt=performance.now()}leavePointer(){this.cursorAt=-1e5}materials=[];flex=[];get contact(){return this.tip?.getWorldPosition(new I)}constructor(){this.scene.add(this.root);const e=new ir(15400892,1.65);e.position.set(-2,3,5);const t=new ir(10223601,.55);t.position.set(3,-2,3);const n=new ir(4578683,1);n.position.set(1,1,-2),this.scene.add(new Ic(14085588,.25),e,t,n)}async load(e){try{const t=await new Dd().loadAsync(e),n=t.scene;this.root.add(n),n.updateMatrixWorld(!0);const i=new Map;n.traverse(a=>{a instanceof qa&&i.set(a.name,a)});const r=i.get("wrist");if(r)for(const a of["thumb","index-finger","middle-finger","ring-finger","pinky-finger"]){const o=a==="thumb"?["metacarpal","phalanx-proximal","phalanx-distal","tip"]:["metacarpal","phalanx-proximal","phalanx-intermediate","phalanx-distal","tip"];let l=r;for(const c of o){const h=i.get(a+"-"+c);h&&(l.attach(h),l=h)}}n.updateMatrixWorld(!0);for(const[a,o]of i){if(a==="thumb-metacarpal"&&this.flex.push({bone:o,rest:o.quaternion.clone(),axis:new I(1,0,0).applyQuaternion(o.getWorldQuaternion(new Lt).invert()),amount:-.9}),!a.includes("phalanx"))continue;const l=a.startsWith("index")?.025:a.startsWith("thumb")?a.includes("proximal")?.82:.8:a.includes("proximal")?.75:a.includes("intermediate")?1.85:.95,c=new I(0,0,1).applyQuaternion(o.getWorldQuaternion(new Lt).invert());this.flex.push({bone:o,rest:o.quaternion.clone(),axis:c,amount:l})}if(n.traverse(a=>{if(!(a instanceof We))return;const o=new Jt({color:new me("#6ab73b"),metalness:.02,roughness:.34,clearcoat:.42,clearcoatRoughness:.25,transparent:!0,opacity:0,envMapIntensity:.35});o.onBeforeCompile=l=>{l.vertexShader=l.vertexShader.replace("#include <common>",`#include <common>
varying vec3 vHandLocal;`),l.vertexShader=l.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vHandLocal=position;`),l.fragmentShader=l.fragmentShader.replace("#include <common>",`#include <common>
varying vec3 vHandLocal;`),l.fragmentShader=l.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
            float vHandY=vHandLocal.y;
            float ragged=sin(vHandLocal.x*195.+sin(vHandLocal.z*125.)*1.8)*.006+sin(vHandLocal.z*240.+cos(vHandY*90.))*.002;
            float band=pow(.5+.5*sin((vHandY+ragged)*145.+.5),7.)*.48;
            float wristIce=smoothstep(-.004+ragged,.035+ragged,vHandY);
            diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.26,.70,.79),max(band,wristIce));
            diffuseColor.a*=1.-smoothstep(.055,.12,vHandY);
          `)},o.customProgramCacheKey=()=>"frozen-hand-v2",a.material=o,a.frustumCulled=!1,this.materials.push(o),a instanceof Tc&&a.normalizeSkinWeights()}),this.tip=i.get("index-finger-tip"),!this.tip)throw Error("Hand asset has no index fingertip joint");n.rotation.y=Math.PI/2,this.root.scale.set(-8.8,8.8,8.8),this.ready=!0}catch(t){this.error=String(t),this.ready=!1}}update(e,t,n,i=1/60){if(!this.ready||!this.tip||(this.root.visible=t>.002,!this.root.visible))return;const r=e%3.8,a=Math.min(1,r/2.6),o=a*Math.PI*2,l=n<.8?.43:.8,c=new I(Math.sin(o)*l,Math.cos(o)*l-(1-t)*.6,.6);this.follow+=((performance.now()-this.cursorAt<1300?1:0)-this.follow)*(1-Math.exp(-i*12)),c.lerp(new I((this.cursor.x-.5)*n*1.7,(this.cursor.y-.5)*1.7,.6),this.follow*.8),this.root.rotation.set(0,.06+Math.sin(o)*.12,Math.PI-.08+Math.sin(o)*.11);for(const u of this.flex){const f=u.bone.name.includes("phalanx")?-1:1;u.bone.quaternion.copy(u.rest).multiply(new Lt().setFromAxisAngle(u.axis,f*u.amount*(1+Math.sin(e*1.8)*.012)))}this.root.updateMatrixWorld(!0);const h=this.tip.getWorldPosition(new I);this.root.position.add(c.sub(h)),this.root.updateMatrixWorld(!0);for(const u of this.materials)u.opacity=t*.95}dispose(){this.scene.traverse(e=>{e instanceof We&&e.geometry.dispose()});for(const e of this.materials)e.dispose()}}class tS{group=new Ht;material=new Jt({color:new me("#f3d257"),metalness:.55,roughness:.25,clearcoat:.6,transparent:!0,opacity:0});constructor(){const e=[],t=[[0,.065],[.018,.018],[.055,0],[.018,-.018],[0,-.065],[-.018,-.018],[-.055,0],[-.018,.018]];for(let i=0;i<8;i++){const r=t[i],a=t[(i+1)%8];e.push(0,0,.02,r[0],r[1],0,a[0],a[1],0),e.push(0,0,-.012,a[0],a[1],0,r[0],r[1],0)}const n=new Mt;n.setAttribute("position",new Ye(e,3)),n.computeVertexNormals(),this.group.add(new We(n,this.material))}update(e,t){this.group.visible=t>.001,this.material.opacity=t,this.group.rotation.y=Math.sin(e*.6)*.55,this.group.position.set(0,0,.5)}}const ac=(s,e)=>Math.hypot(s.x-e.x,s.y-e.y);function nS(s,e=96){const t=[0];for(let a=1;a<s.length;a++)t.push(t.at(-1)+ac(s[a-1],s[a]));const n=t.at(-1),i=[];let r=1;for(let a=0;a<e;a++){const o=n*a/(e-1);for(;r<t.length-1&&t[r]<o;)r++;const l=s[r-1],c=s[r],h=(o-t[r-1])/Math.max(1e-4,t[r]-t[r-1]);i.push({x:l.x+(c.x-l.x)*h,y:l.y+(c.y-l.y)*h})}return{out:i,total:n}}function iS(s,e=68){const t={valid:!1,reason:"请画一个完整的零",closure:1,roundness:0,radialCV:1,turns:0,directionConsistency:0,aspect:0,length:0,points:s.length,center:{x:0,y:0}};if(s.length<12)return t;const{out:n,total:i}=nS(s),r=n.reduce((D,N)=>D+N.x,0)/n.length,a=n.reduce((D,N)=>D+N.y,0)/n.length,o=Math.max(...n.map(D=>D.x))-Math.min(...n.map(D=>D.x)),l=Math.max(...n.map(D=>D.y))-Math.min(...n.map(D=>D.y)),c=Math.hypot(o,l);let h=0,u=0,f=0;for(const D of n){const N=D.x-r,k=D.y-a;h+=N*N,u+=k*k,f+=N*k}h/=n.length,u/=n.length,f/=n.length;const d=.5*Math.atan2(2*f,h-u),_=Math.cos(d),g=Math.sin(d),m=Math.sqrt((h-u)**2+4*f*f),p=Math.sqrt(Math.max(.01,(h+u+m)/2)),M=Math.sqrt(Math.max(.01,(h+u-m)/2));let x=n.map(D=>({x:((D.x-r)*_+(D.y-a)*g)/p,y:(-(D.x-r)*g+(D.y-a)*_)/M}));for(let D=0;D<2;D++)x=x.map((N,k)=>k<2||k>x.length-3?N:{x:(x[k-1].x+2*N.x+x[k+1].x)/4,y:(x[k-1].y+2*N.y+x[k+1].y)/4});let v=0,S=0,A=0,w=0;const R=x.map(D=>Math.hypot(D.x,D.y));for(let D=0;D<x.length;D++){const N=x[D],k=x[(D+1)%x.length];if(v+=ac(N,k),S+=N.x*k.y-k.x*N.y,D<x.length-1){let z=Math.atan2(k.y,k.x)-Math.atan2(N.y,N.x);for(;z>Math.PI;)z-=2*Math.PI;for(;z<-Math.PI;)z+=2*Math.PI;A+=z,w+=Math.abs(z)}}const y=R.reduce((D,N)=>D+N,0)/R.length,b=Math.sqrt(R.reduce((D,N)=>D+(N-y)**2,0)/R.length)/y,P={valid:!1,reason:"再试一次，画得圆一些",closure:ac(s[0],s.at(-1))/Math.max(1,c),roundness:Math.min(1,2*Math.PI*Math.abs(S)/(v*v)),radialCV:b,turns:A/(2*Math.PI),directionConsistency:Math.abs(A)/Math.max(.001,w),aspect:M/p,length:i,points:s.length,center:{x:r,y:a}};return Math.min(o,l)<e||i<e*3?(P.reason="画大一点，让零的轮廓更清晰",P):P.aspect<.36?(P.reason="不要太扁，试着画一个完整的零",P):P.closure>.23?(P.reason="把起点与终点连起来",P):Math.abs(P.turns)<.82||Math.abs(P.turns)>1.22||P.directionConsistency<.72?(P.reason="沿一个方向绕完整一圈",P):(P.roundness<.87||P.radialCV>.24||(P.valid=!0,P.reason="零已闭合"),P)}function rS(s){const e=new Map,t=new Map,n=s.clone();return Ud(s,n,function(i,r){e.set(r,i),t.set(i,r)}),n.traverse(function(i){if(!i.isSkinnedMesh)return;const r=i,a=e.get(i),o=a.skeleton.bones;r.skeleton=a.skeleton.clone(),r.bindMatrix.copy(a.bindMatrix),r.skeleton.bones=o.map(function(l){return t.get(l)}),r.bind(r.skeleton,r.bindMatrix)}),n}function Ud(s,e,t){t(s,e);for(let n=0;n<s.children.length;n++)Ud(s.children[n],e.children[n],t)}const gs={open:[[.6,.55,.35],[.04,.08,.04],[.1,.18,.1],[.22,.36,.18],[.34,.48,.22]],reach:[[.32,.38,.22],[.11,.2,.1],[.34,.46,.2],[.48,.65,.28],[.64,.78,.34]],humanReach:[[.46,.48,.22],[.08,.18,.09],[.45,.6,.22],[.64,.8,.3],[.8,.92,.35]],clench:[[.75,.8,.6],[.85,1.65,.85],[.85,1.8,.85],[.9,1.85,.85],[1,1.8,.8]],defiant:[[.75,.8,.6],[.9,1.8,.95],[0,.035,.02],[.95,1.8,.9],[1.05,1.75,.8]]},$u=["thumb","index-finger","middle-finger","ring-finger","pinky-finger"];class Zu{constructor(e,t=!1,n){this.human=t;const i=rS(e);this.root.add(i),i.updateMatrixWorld(!0);const r=new Map;i.traverse(l=>{l instanceof qa&&r.set(l.name,l)});const a=r.get("wrist");if(!a)throw Error("Narrative hand is missing its wrist bone");const o=r.get("forearm-bend");o&&(this.forearm={bone:o,rest:o.quaternion.clone(),axis:new I(1,0,0).applyQuaternion(o.getWorldQuaternion(new Lt).invert()),value:0});for(const l of $u){let c=a;const h=l==="thumb"?["metacarpal","phalanx-proximal","phalanx-distal","tip"]:["metacarpal","phalanx-proximal","phalanx-intermediate","phalanx-distal","tip"];for(const u of h){const f=r.get(l+"-"+u);f&&(c.attach(f),c=f)}}i.updateMatrixWorld(!0);for(const[l,c]of r){if(!l.includes("phalanx")&&!l.includes("metacarpal"))continue;const h=new I(l.includes("metacarpal")?1:0,0,l.includes("phalanx")?1:0).applyQuaternion(c.getWorldQuaternion(new Lt).invert());this.joints.push({bone:c,rest:c.quaternion.clone(),axis:h,value:0,name:l})}if(this.index=r.get("index-finger-tip"),this.middle=r.get("middle-finger-tip"),!this.index||!this.middle)throw Error("Narrative hand has no fingertip joints");this.material=new Jt({color:new me(t?"#b58b72":"#349618"),metalness:0,roughness:t?.53:.36,clearcoat:t?.02:.23,clearcoatRoughness:.32,transparent:!0,opacity:0,envMapIntensity:t?.27:.4}),this.material.onBeforeCompile=l=>{Object.assign(l.uniforms,this.uniforms),l.uniforms.uSkin={value:n??null},l.vertexShader=l.vertexShader.replace("#include <common>",`#include <common>
varying vec3 vHandLocal;`),l.vertexShader=l.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vHandLocal=position;`),l.fragmentShader=l.fragmentShader.replace("#include <common>",`#include <common>
varying vec3 vHandLocal;uniform float uIce,uWristFade;uniform sampler2D uSkin;`),l.fragmentShader=l.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
        float y=vHandLocal.y;
        float veins=sin(vHandLocal.z*170.+sin(y*65.))*sin(y*111.);
        // Broad internal cyan scattering instead of conspicuous striped bands.
        float icy=smoothstep(-.015,.065,y)*.62+pow(.5+.5*sin(vHandLocal.z*92.+y*20.),3.)*.16;
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.12,.48,.42),min(1.,icy)*uIce);
        diffuseColor.rgb*=1.+veins*${t?".013":".004"};
        ${t?"float skinTone=texture2D(uSkin,vHandLocal.zy*vec2(11.,5.)+vec2(.4,.6)).r;diffuseColor.rgb*=.90+skinTone*.13;":""}
        ${t?`float crease=exp(-pow((y+.078)/.0012,2.))*exp(-pow((vHandLocal.z+.012)/.012,2.))+exp(-pow((y+.104)/.0010,2.))*exp(-pow((vHandLocal.z+.012)/.012,2.));
        crease+=exp(-pow((y+.081)/.0013,2.))*exp(-pow((vHandLocal.z-.012)/.012,2.))+exp(-pow((y+.11)/.0011,2.))*exp(-pow((vHandLocal.z-.016)/.011,2.));
        diffuseColor.rgb*=1.-crease*.18;`:""}
        diffuseColor.a*=mix(1.,1.-smoothstep(.015,.085,y),uWristFade);
      `),t&&(l.fragmentShader=l.fragmentShader.replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
        float skinHeight=texture2D(uSkin,vHandLocal.zy*vec2(11.,5.)+vec2(.4,.6)).r;
        vec3 q0=dFdx(-vViewPosition),q1=dFdy(-vViewPosition);
        vec3 s1=cross(q1,normal),s2=cross(normal,q0);
        float det=dot(q0,s1);
        vec3 surfaceGradient=sign(det)*.002*(dFdx(skinHeight)*s1+dFdy(skinHeight)*s2);
        normal=normalize(abs(det)*normal-surfaceGradient);
      `))},this.material.customProgramCacheKey=()=>"narrative-hand-v4-"+t,i.traverse(l=>{if(!(l instanceof We))return;const c=l.geometry;if(!c.userData.smoothNarrativeNormals){c.computeVertexNormals();const h=c.getAttribute("position"),u=c.getAttribute("normal"),f=new Map,d=_=>[h.getX(_),h.getY(_),h.getZ(_)].map(g=>Math.round(g*1e6)).join(",");for(let _=0;_<h.count;_++){const g=d(_),m=f.get(g)??[0,0,0];m[0]+=u.getX(_),m[1]+=u.getY(_),m[2]+=u.getZ(_),f.set(g,m)}for(let _=0;_<h.count;_++){const g=f.get(d(_)),m=Math.hypot(...g)||1;u.setXYZ(_,g[0]/m,g[1]/m,g[2]/m)}u.needsUpdate=!0,c.userData.smoothNarrativeNormals=!0}l.material=this.material,l.frustumCulled=!1,l instanceof Tc&&l.normalizeSkinWeights()}),i.rotation.y=Math.PI/2}human;root=new Ht;joints=[];uniforms={uIce:{value:0},uWristFade:{value:1}};material;targetTip=new I;index;middle;smoothedTip=new I;initialized=!1;targetRotation=new Lt;forearm;update(e,t,n,i,r,a,o,l,c,h=0){if(this.root.visible=o>.001,!this.root.visible)return;const u=1-Math.exp(-Math.min(e,.1)*18);if(this.forearm){const d=this.forearm;d.value+=((this.human?0:-1.42*h)-d.value)*u,d.bone.quaternion.copy(d.rest).multiply(new Lt().setFromAxisAngle(d.axis,d.value))}this.uniforms.uIce.value=l,this.uniforms.uWristFade.value=c,this.material.opacity=o;for(const d of this.joints){const _=$u.findIndex(p=>d.name.startsWith(p)),g=d.name.includes("proximal")?0:d.name.includes("intermediate")?1:2;let m=0;if(d.name.includes("metacarpal"))m=_===0?(this.human?-.43:r==="open"?-.45:-.23)-a*.28-h*.3:(_-2)*.025;else{const p=r==="defiant"?gs.reach[_][g]+(gs.defiant[_][g]-gs.reach[_][g])*h:gs[r][_][g];m=-(p+(gs.clench[_][g]-p)*a)}d.value+=(m-d.value)*u,d.bone.quaternion.copy(d.rest).multiply(new Lt().setFromAxisAngle(d.axis,d.value))}this.targetRotation.setFromEuler(n),this.initialized||(this.root.quaternion.copy(this.targetRotation),this.smoothedTip.copy(t),this.initialized=!0),this.root.quaternion.slerp(this.targetRotation,u),this.smoothedTip.lerp(t,u),this.targetTip.copy(t),this.root.scale.set((this.human?1:-1)*i,i,i),this.root.position.set(0,0,0),this.root.updateMatrixWorld(!0);const f=this.index.getWorldPosition(new I).lerp(this.middle.getWorldPosition(new I),h);this.root.position.copy(this.smoothedTip).sub(f),this.root.updateMatrixWorld(!0)}state(){return{visible:this.root.visible,opacity:this.material.opacity,root:this.root.position.toArray(),index:this.index.getWorldPosition(new I).toArray(),middle:this.middle.getWorldPosition(new I).toArray(),joints:this.joints.filter(e=>e.name.includes("proximal")).map(e=>({name:e.name,angle:e.value}))}}}class sS{group=new Ht;coins=[];materials=[];constructor(){const e=new ja([new ue(0,-.011),new ue(.121,-.011),new ue(.129,-.009),new ue(.133,-.004),new ue(.133,.004),new ue(.129,.009),new ue(.121,.011),new ue(0,.011)],64);for(let t=0;t<6;t++){const n=document.createElement("canvas");n.width=n.height=256;const i=n.getContext("2d");if(i.clearRect(0,0,256,256),i.fillStyle=["#88712c","#308665","#1c3043","#ad3030","#384b31","#41808b"][t],i.font=(t===2?"italic ":"")+"bold 142px Arial",i.textAlign="center",i.textBaseline="middle",t===1)for(let f=0;f<2;f++)for(let d=0;d<2;d++)i.fillRect(62+d*70,62+f*70,60,60);else t===4?(i.beginPath(),i.ellipse(128,143,58,66,0,0,Math.PI*2),i.fill(),i.save(),i.translate(145,54),i.rotate(.5),i.beginPath(),i.ellipse(0,0,13,26,0,0,Math.PI*2),i.fill(),i.restore(),i.globalCompositeOperation="destination-out",i.beginPath(),i.arc(187,110,22,0,Math.PI*2),i.fill()):i.fillText(["G","","∞","T","","a"][t],128,137);const r=new Ac(n);r.colorSpace=wt;const a=new ci({map:r,transparent:!0,side:en,depthWrite:!1}),o=new Jt({color:16316400,roughness:.28,metalness:.025,clearcoat:.3,transparent:!0,opacity:0});this.materials.push(o,a);const l=new Ht,c=new We(e,o);c.rotation.x=Math.PI/2;const h=new We(new Rc(.111,48),a);h.position.z=.0116;const u=h.clone();u.position.z=-.0116,u.rotation.y=Math.PI,l.add(c,h,u),this.group.add(l),this.coins.push(l)}}update(e,t,n,i,r){this.group.visible=t>.001;for(let a=0;a<6;a++){const o=e*.24+a*Math.PI/3,l=this.coins[a],c=Math.cos(o)*.67,h=Math.sin(o)*.63;l.position.set(n-.12+(c*.93+h*.18)*Math.min(1,r),i-.2+h*.94-c*.16,Math.sin(o+.6)*.34+.1),l.rotation.set(Math.sin(o+.8)*1.03,Math.cos(o-.3)*.78,e*.1+a*.63),l.scale.setScalar(.82+Math.sin(o+.6)*.13)}for(const a of this.materials)a.opacity=t}state(){return{visible:this.group.visible,positions:this.coins.map(e=>e.position.toArray())}}}function aS(){const s=[],e=[],t=[];for(let a=0;a<=10;a++)for(let o=0;o<=8;o++){const l=a/10,c=o/8*2-1,h=Math.pow(Math.sin(l*Math.PI),.56)*(1+.1*c),u=.007*Math.exp(-Math.pow((l-.8)/.2,2))*(1-c*c);s.push(c*h*.036,(l-.5)*.083-u,.018*c*c+.013*Math.sin(l*Math.PI)+.007*c*l),t.push(o/8,l)}for(let a=0;a<10;a++)for(let o=0;o<8;o++){const l=a*9+o;e.push(l,l+1,l+8+1,l+1,l+8+2,l+8+1)}const r=new Mt;return r.setAttribute("position",new Ye(s,3)),r.setAttribute("uv",new Ye(t,2)),r.setIndex(e),r.computeVertexNormals(),r}class oS{mesh;dummy=new ct;material=new Jt({color:16033212,roughness:.69,side:en,transparent:!0,opacity:0,depthWrite:!1});constructor(){this.mesh=new Ya(aS(),this.material,70),this.mesh.frustumCulled=!1;for(let e=0;e<70;e++)this.mesh.setColorAt(e,new me().setHSL(.93+e%5*.007,.48+e%3*.08,.61+e%7*.025))}update(e,t,n){if(this.mesh.visible=t>.001,!!this.mesh.visible){this.material.opacity=t;for(let i=0;i<70;i++){const r=i*.61803399%1,a=i*.381966%1,o=((r+e*(.012+a*.012))%1*2-1)*n*1.6,l=1.65-(i*.417+e*(.085+a*.07))%3.3;this.dummy.position.set(o+Math.sin(e*.36+i)*.15,l,a*1.8-.65),this.dummy.rotation.set(e*.42+i,e*.23+i*2,e*.21+i*4),this.dummy.scale.setScalar(.42+a*.95),this.dummy.updateMatrix(),this.mesh.setMatrixAt(i,this.dummy.matrix)}this.mesh.instanceMatrix.needsUpdate=!0}}}class eo extends We{constructor(e,t={}){super(e),this.isReflector=!0,this.type="Reflector",this.forceUpdate=!1,this.camera=new kt;const n=this,i=t.color!==void 0?new me(t.color):new me(8355711),r=t.textureWidth||512,a=t.textureHeight||512,o=t.clipBias||0,l=t.shader||eo.ReflectorShader,c=t.multisample!==void 0?t.multisample:4,h=new Ei,u=new I,f=new I,d=new I,_=new Ne,g=new I(0,0,-1),m=new qe,p=new I,M=new I,x=new qe,v=new Ne,S=this.camera,A=new qn(r,a,{samples:c,type:Bi}),w=new Ut({name:l.name!==void 0?l.name:"unspecified",uniforms:vf.clone(l.uniforms),fragmentShader:l.fragmentShader,vertexShader:l.vertexShader});w.uniforms.tDiffuse.value=A.texture,w.uniforms.color.value=i,w.uniforms.textureMatrix.value=v,this.material=w,this.onBeforeRender=function(R,y,b){if(f.setFromMatrixPosition(n.matrixWorld),d.setFromMatrixPosition(b.matrixWorld),_.extractRotation(n.matrixWorld),u.set(0,0,1),u.applyMatrix4(_),p.subVectors(f,d),p.dot(u)>0===!0&&this.forceUpdate===!1)return;p.reflect(u).negate(),p.add(f),_.extractRotation(b.matrixWorld),g.set(0,0,-1),g.applyMatrix4(_),g.add(d),M.subVectors(f,g),M.reflect(u).negate(),M.add(f),S.position.copy(p),S.up.set(0,1,0),S.up.applyMatrix4(_),S.up.reflect(u),S.lookAt(M),S.far=b.far,S.updateMatrixWorld(),S.projectionMatrix.copy(b.projectionMatrix),v.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),v.multiply(S.projectionMatrix),v.multiply(S.matrixWorldInverse),v.multiply(n.matrixWorld),h.setFromNormalAndCoplanarPoint(u,f),h.applyMatrix4(S.matrixWorldInverse),m.set(h.normal.x,h.normal.y,h.normal.z,h.constant);const D=S.projectionMatrix;x.x=(Math.sign(m.x)+D.elements[8])/D.elements[0],x.y=(Math.sign(m.y)+D.elements[9])/D.elements[5],x.z=-1,x.w=(1+D.elements[10])/D.elements[14],m.multiplyScalar(2/m.dot(x)),D.elements[2]=m.x,D.elements[6]=m.y,D.elements[10]=m.z+1-o,D.elements[14]=m.w,n.visible=!1;const N=R.getRenderTarget(),k=R.xr.enabled,z=R.shadowMap.autoUpdate;R.xr.enabled=!1,R.shadowMap.autoUpdate=!1,R.setRenderTarget(A),R.state.buffers.depth.setMask(!0),R.autoClear===!1&&R.clear(),R.render(y,S),R.xr.enabled=k,R.shadowMap.autoUpdate=z,R.setRenderTarget(N);const W=b.viewport;W!==void 0&&R.state.viewport(W),n.visible=!0,this.forceUpdate=!1},this.getRenderTarget=function(){return A},this.dispose=function(){A.dispose(),n.material.dispose()}}}eo.ReflectorShader={name:"ReflectorShader",uniforms:{color:{value:null},tDiffuse:{value:null},textureMatrix:{value:null}},vertexShader:`
		uniform mat4 textureMatrix;
		varying vec4 vUv;

		#include <common>
		#include <logdepthbuf_pars_vertex>

		void main() {

			vUv = textureMatrix * vec4( position, 1.0 );

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

			#include <logdepthbuf_vertex>

		}`,fragmentShader:`
		uniform vec3 color;
		uniform sampler2D tDiffuse;
		varying vec4 vUv;

		#include <logdepthbuf_pars_fragment>

		float blendOverlay( float base, float blend ) {

			return( base < 0.5 ? ( 2.0 * base * blend ) : ( 1.0 - 2.0 * ( 1.0 - base ) * ( 1.0 - blend ) ) );

		}

		vec3 blendOverlay( vec3 base, vec3 blend ) {

			return vec3( blendOverlay( base.r, blend.r ), blendOverlay( base.g, blend.g ), blendOverlay( base.b, blend.b ) );

		}

		void main() {

			#include <logdepthbuf_fragment>

			vec4 base = texture2DProj( tDiffuse, vUv );
			gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>

		}`};const oc=s=>Math.max(0,Math.min(1,s)),Ju=(s,e,t)=>{const n=oc((t-s)/(e-s));return n*n*(3-2*n)},qt=s=>{const e=Math.sin(s*127.1+31.7)*43758.5453;return e-Math.floor(e)},$o=(s,e)=>Math.sin(s*.71+e*.53)*.55+Math.sin(s*1.73-e*.81)*.25+Math.sin(s*3.1+e*2.3)*.12;class lS{group=new Ht;pond;materials=[];flowers;flowerMaterial;flowerTexture;flowerTime={value:0};waterTime={value:0};waterHold={value:0};waterAlpha={value:0};dummy=new ct;constructor(){this.group.name="Original procedural meadow / pond / fluted columns",this.group.visible=!1;const e=new Di({vertexColors:!0,roughness:1,metalness:0,transparent:!0,opacity:0});this.materials.push(e);const t=new We(this.terrain(),e);t.name="Continuous meadow and recessed pond bed",this.group.add(t);const n=new Di({color:14276551,roughness:.78,metalness:0,transparent:!0,opacity:0});this.materials.push(n),n.onBeforeCompile=h=>{h.vertexShader=h.vertexShader.replace("#include <common>",`#include <common>
varying vec3 vMarble;`),h.vertexShader=h.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vMarble=position;`),h.fragmentShader=h.fragmentShader.replace("#include <common>",`#include <common>
varying vec3 vMarble;`),h.fragmentShader=h.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
        float grain=sin(vMarble.x*111.+sin(vMarble.y*32.)*3.)*sin(vMarble.y*175.+vMarble.z*93.);
        float vein=pow(.5+.5*sin(vMarble.y*18.+vMarble.x*31.+sin(vMarble.z*20.)*2.),12.);
        diffuseColor.rgb*=.94+.045*grain-.075*vein;
      `)},n.customProgramCacheKey=()=>"original-garden-marble-v4";const i=this.column();for(const[h,u,f]of[[-1.59,-4.8,.055],[1.43,-4.8,-.055]]){const d=new We(i,n);d.position.set(h,-.9,u),d.scale.setScalar(.83),d.rotation.z=f,d.name="Fluted column with layered acanthus capital",this.group.add(d)}this.flowerTexture=this.flowerAtlas(),this.flowerMaterial=new Di({map:this.flowerTexture,alphaTest:.27,side:en,roughness:.88,metalness:0,transparent:!0,opacity:0,depthWrite:!0}),this.materials.push(this.flowerMaterial),this.flowerMaterial.onBeforeCompile=h=>{h.uniforms.uGardenTime=this.flowerTime,h.vertexShader=h.vertexShader.replace("#include <common>",`#include <common>
uniform float uGardenTime;`),h.vertexShader=h.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
        float phase=instanceMatrix[3].x*2.1+instanceMatrix[3].z*1.3;
        transformed.x+=sin(uGardenTime*.55+phase)*.06*uv.y*uv.y;
        transformed.z+=cos(uGardenTime*.43+phase)*.022*uv.y*uv.y;
      `)},this.flowerMaterial.customProgramCacheKey=()=>"original-garden-flowers-v4";const r=new Yn(.32,.44,1,4);r.translate(0,.22,0);const a=r.clone();a.rotateY(Math.PI*.5);const o=Gu([r,a]);r.dispose(),a.dispose();const l=3e3;this.flowers=new Ya(o,this.flowerMaterial,l),this.flowers.name="3000 original seeded meadow clumps",this.flowers.frustumCulled=!1;for(let h=0;h<l;h++){const u=(qt(h*6.11)-.5)*22,f=-.2-qt(h*9.2+1)*17,g=((u-.18)/3.8)**2+((f+2.55)/2.12)**2<1.08&&f>-4.7?0:.35+qt(h*2.7)*.7;this.dummy.position.set(u,this.height(u,f)+.012,f),this.dummy.rotation.set(0,qt(h*3.14)*Math.PI,0),this.dummy.scale.setScalar(g),this.dummy.updateMatrix(),this.flowers.setMatrixAt(h,this.dummy.matrix);const m=new me().setHSL(.94+(qt(h+7)-.5)*.07,.21+qt(h+19)*.22,.5+qt(h+12)*.21);h%5===0&&m.setRGB(.9,.86,.56),h%7===0&&m.setRGB(.68,.73,.59),this.flowers.setColorAt(h,m)}this.group.add(this.flowers),this.pond=new eo(new Yn(12,7),{textureWidth:512,textureHeight:256,clipBias:.003,multisample:0,color:11059898}),this.pond.name="Live planar reflection pond / 512 by 256",this.pond.rotation.x=-Math.PI/2,this.pond.position.set(.1,-1.18,-2.8),this.pond.getRenderTarget().texture.type=xn;const c=this.pond.material;c.transparent=!0,c.depthWrite=!0,c.uniforms.uGardenTime=this.waterTime,c.uniforms.uGardenHold=this.waterHold,c.uniforms.uGardenAlpha=this.waterAlpha,c.vertexShader=c.vertexShader.replace("void main()",`varying vec2 vWater;
void main()`).replace("gl_Position =",`vWater=position.xy;
	gl_Position =`),c.fragmentShader=`
      uniform vec3 color;uniform sampler2D tDiffuse;
      uniform float uGardenTime,uGardenHold,uGardenAlpha;
      varying vec4 vUv;varying vec2 vWater;
      void main(){
        vec4 project=vUv;
        vec2 ripples=vec2(sin(vWater.y*31.+uGardenTime*.72)+sin(vWater.x*14.-vWater.y*23.+uGardenTime*.43),cos(vWater.y*27.+uGardenTime*.51));
        project.xy+=ripples*.0018*project.w;
        vec4 reflection=texture2DProj(tDiffuse,project);
        vec3 sky=mix(vec3(.22,.42,.39),vec3(.40,.63,.59),.5+.5*sin(vWater.y*2.5));
        sky=mix(sky,vec3(.22,.09,.11),uGardenHold*.8);
        vec3 result=mix(sky,reflection.rgb,.62*reflection.a);
        float shimmer=pow(max(0.,sin(vWater.y*110.+sin(vWater.x*22.+uGardenTime*.21)*2.)),18.);
        result+=vec3(.035,.045,.035)*shimmer*(1.-uGardenHold*.65);
        gl_FragColor=vec4(result,uGardenAlpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,this.group.add(this.pond)}height(e,t){const n=((e-.18)/3.8)**2+((t+2.55)/2.12)**2+.035*Math.sin(e*3.5)+.024*Math.sin(t*6),i=Ju(.87,1.16,n),r=Ju(4.6,17,-t);return-1.43+i*(.32+$o(e,t)*.085)+r*(.39+$o(e*.3,t*.4)*.36)}terrain(){const e=[],t=[],n=[],a=new me,o=new me(6710087),l=new me(5071686);for(let h=0;h<=112;h++)for(let u=0;u<=144;u++){const f=(u/144-.5)*28,d=1-h/112*24,_=this.height(f,d);e.push(f,_,d);const g=oc(.5+$o(f*2,d*2)*.6);a.copy(l).lerp(o,g).multiplyScalar(.84+qt(u*101+h*79)*.26),t.push(a.r,a.g,a.b)}for(let h=0;h<112;h++)for(let u=0;u<144;u++){const f=h*145+u;n.push(f,f+1,f+144+1,f+1,f+144+2,f+144+1)}const c=new Mt;return c.setAttribute("position",new Ye(e,3)),c.setAttribute("color",new Ye(t,3)),c.setIndex(n),c.computeVertexNormals(),c}column(){const e=[],t=(u,f=0,d=0,_=0)=>{u.translate(f,d,_),u.deleteAttribute("uv"),e.push(u)},r=[],a=[];for(let u=0;u<=24;u++)for(let f=0;f<=120;f++){const d=u/24,_=f/120*Math.PI*2,g=(.143-.012*d+.006*Math.sin(d*Math.PI))*(1-.07*Math.pow(.5+.5*Math.cos(_*20),3));r.push(Math.cos(_)*g,.17+d*1.68,Math.sin(_)*g)}for(let u=0;u<24;u++)for(let f=0;f<120;f++){const d=u*121+f;a.push(d,d+120+1,d+1,d+1,d+120+1,d+120+2)}const o=new Mt;o.setAttribute("position",new Ye(r,3)),o.setIndex(a),o.computeVertexNormals(),t(o);const l=new ja([[.215,0],[.215,.04],[.19,.045],[.19,.065],[.171,.08],[.174,.105],[.16,.13],[.15,.17]].map(u=>new ue(...u)),80);t(l),t(new di(.46,.055,.46),0,-.026,0),t(new Cc(.18,.149,.15,64),0,1.9,0);const c=(u,f,d)=>{const _=new Dc(u,f,8,80);_.rotateX(Math.PI/2),t(_,0,d,0)};c(.17,.018,1.83),c(.2,.016,2.02),c(.225,.018,2.11),t(new di(.48,.045,.48),0,2.145,0),t(new di(.43,.035,.43),0,2.105,0);for(let u=0;u<2;u++)for(let f=0;f<10;f++){const d=f/10*Math.PI*2+u*Math.PI/10,_=[],g=[],m=6,p=10;for(let x=0;x<=p;x++)for(let v=0;v<=m;v++){const S=x/p,A=v/m*2-1,w=Math.sin(S*Math.PI)*(.045+u*.006)*(1+.13*Math.cos(S*26)),R=.15+.08*Math.sin(S*Math.PI*.72)+Math.abs(A)*.008,y=d+A*w/R;_.push(Math.cos(y)*R,1.87+u*.1+S*.17,Math.sin(y)*R)}for(let x=0;x<p;x++)for(let v=0;v<m;v++){const S=x*(m+1)+v;g.push(S,S+m+1,S+1,S+1,S+m+1,S+m+2)}const M=new Mt;M.setAttribute("position",new Ye(_,3)),M.setIndex(g),M.computeVertexNormals(),t(M)}const h=Gu(e);for(const u of e)u.dispose();return h}flowerAtlas(){const e=document.createElement("canvas");e.width=256,e.height=512;const t=e.getContext("2d");t.clearRect(0,0,256,512);for(let i=0;i<16;i++){const r=30+qt(i*4.7)*196,a=30+qt(i*7.3)*320,o=245+qt(i*3.4)*100;t.strokeStyle=i%3?"#6b8050":"#899c64",t.lineWidth=1.8,t.beginPath(),t.moveTo(o,512),t.quadraticCurveTo(r+18,a+180,r,a),t.stroke();for(let c=0;c<6;c++){const h=a+90+c*37,u=r+(o-r)*(h-a)/(512-a),f=c%2?-1:1;t.fillStyle="#7c9562",t.beginPath(),t.ellipse(u+f*9,h,12,3.5,f*.5,0,Math.PI*2),t.fill()}const l=["#b36a9b","#94558b","#cb7bb0","#dec3cc","#b18fc0"];for(let c=0;c<22;c++){const h=qt(i*71+c*19)*Math.PI*2,u=Math.sqrt(qt(i*29+c*23))*14,f=r+Math.cos(h)*u,d=a+Math.sin(h)*u+(i%4===0?c*2:0);t.fillStyle=l[(i+c)%l.length],t.beginPath(),t.ellipse(f,d,3+qt(c+19)*2,2.3+qt(c+3)*2,h,0,Math.PI*2),t.fill()}}const n=new Ac(e);return n.colorSpace=wt,n.anisotropy=2,n}update(e,t,n){const i=t>.001;if(this.group.visible=i,!i)return;const r=oc(t);for(const a of this.materials)a.opacity=r,a.depthWrite=r>.97;this.flowerTime.value=e,this.waterTime.value=e,this.waterHold.value=n,this.waterAlpha.value=r}state(){return{type:"independent 3D terrain / fluted columns / instanced flowerbeds / live planar pond reflection",flowerInstances:this.flowers.count,reflection:[512,256],visible:this.group.visible}}dispose(){const e=new Set;this.group.traverse(t=>{t instanceof We&&e.add(t.geometry)});for(const t of e)t.dispose();for(const t of this.materials)t.dispose();this.flowerTexture.dispose(),this.pond.dispose()}}const cS=`
varying vec2 vUv;
uniform sampler2D uScene,uGarden;
uniform vec2 uPointer,uTexel;
uniform float uAspect,uGardenAspect,uTime,uProgress,uHold,uAlpha,uSpatialGarden;
${Xs}
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
}`,hS=`varying vec2 vUv;uniform float uHold,uHover,uTime;void main(){
  vec2 p=vUv-.5;float d=length(p),a=mod(atan(p.x,p.y)+6.2831853,6.2831853)/6.2831853;
  float ring=(1.-smoothstep(.006,.024,abs(d-.29)))*(.28+.72*step(a,max(.05,uHold)));
  float glow=exp(-pow((d-.29)/.075,2.))*(.12+uHover*.12);
  float pulse=1.-smoothstep(.02,.45,d);pulse*=.025+.06*uHover;
  gl_FragColor=vec4(1.8,1.9,1.85,clamp(ring+glow+pulse,0.,1.));
}`,lc=s=>Math.min(1,Math.max(0,s)),ii=(s,e,t)=>{const n=lc((t-s)/(e-s));return n*n*(3-2*n)},Ln=(s,e,t)=>s+(e-s)*t;class uS{constructor(e,t){this.renderer=e,this.scene.environment=t,this.camera.position.z=3.6,this.light.position.set(-2.5,3.8,2.4),this.fill.position.set(2.2,.6,3),this.scene.add(this.light,this.fill,this.ambient,this.orbit.group,this.petals.mesh,this.target),this.target.position.set(0,0,.5),this.garden&&(this.garden.update(0,0,0),this.scene.add(this.garden.group)),this.ringMaterial=new Ut({vertexShader:"varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",fragmentShader:hS,transparent:!0,depthWrite:!1,depthTest:!1,toneMapped:!1,uniforms:{uHold:{value:0},uHover:{value:0},uTime:{value:0}}}),this.ring=new We(new Yn(.34,.34),this.ringMaterial),this.ring.position.copy(this.target.position),this.ring.renderOrder=100,this.scene.add(this.ring),this.targetRT=new qn(1,1,{format:nn,type:e.extensions.has("EXT_color_buffer_float")?Bi:xn,depthBuffer:!0}),this.composite=new Ut({vertexShader:Dr,fragmentShader:cS,depthWrite:!1,depthTest:!1,transparent:!0,toneMapped:!1,uniforms:{uScene:{value:this.targetRT.texture},uSpatialGarden:{value:this.spatialGarden?1:0},uGarden:{value:null},uGardenAspect:{value:16/9},uPointer:{value:this.pointer},uTexel:{value:new ue},uAspect:{value:1},uTime:{value:0},uProgress:{value:0},uHold:{value:0},uAlpha:{value:0}}});const n=new We(new Yn(2,2),this.composite);n.frustumCulled=!1,this.screen.add(n)}renderer;scene=new cr;camera=new kt(32,1,.05,30);orbit=new sS;petals=new oS;spatialGarden=new URLSearchParams(location.search).get("environment")==="spatial";garden=this.spatialGarden?new lS:void 0;raycaster=new sg;pointer=new ue(.5,.5);pointerTarget=new ue(.5,.5);target=new We(new Pc(.15,20,16),new ci({transparent:!0,opacity:0,depthWrite:!1}));ring;light=new ir(16775665,1.65);fill=new ir(13037040,.62);ambient=new Ic(14808299,.36);targetRT;screen=new cr;screenCamera=new is(-1,1,1,-1,0,1);composite;ringMaterial;green;human;ready=!1;error;progress=0;targetProgress=0;hold=0;holding=!1;pressed=!1;hovered=!1;time=0;width=1;height=1;aspect=1;poseRotation=new Lt;screenRoll=new Lt;rollAxis=new I(0,0,1);async load(e,t,n){try{const[i,r,a]=await Promise.all([new Dd().loadAsync(e),new Oa().loadAsync(t),new Oa().loadAsync(n)]);a.wrapS=a.wrapT=Ui,this.green=new Zu(i.scene,!1),this.human=new Zu(i.scene,!0,a),this.scene.add(this.green.root,this.human.root),this.composite.uniforms.uGarden.value=r,this.composite.uniforms.uGardenAspect.value=r.image.width/r.image.height,this.ready=!0}catch(i){this.error=String(i)}}resize(e,t){this.width=e,this.height=t,this.aspect=e/t,this.camera.aspect=this.aspect,this.camera.updateProjectionMatrix();const n=this.renderer.getDrawingBufferSize(new ue);this.targetRT.setSize(n.x,n.y),this.composite.uniforms.uAspect.value=this.aspect,this.composite.uniforms.uTexel.value.set(1/n.x,1/n.y),this.release()}reset(){this.progress=this.targetProgress=0,this.hold=0,this.release(),this.pointerTarget.set(.5,.5),this.pointer.copy(this.pointerTarget)}jump(e){this.targetProgress=Math.min(3.5,Math.max(0,e)),this.release()}scroll(e){Math.abs(e)>.001&&this.jump(this.targetProgress+e*.0018)}next(){this.jump(this.targetProgress<.7?1.25:this.targetProgress<1.8?2.1:3.4)}move(e,t){this.pointerTarget.set(lc(e),lc(t)),this.hovered=this.hit(e,t),this.holding&&!this.hovered&&this.release()}down(e,t){return this.move(e,t),this.pressed=!0,this.holding=this.progress>3.08&&this.hovered,this.holding}release(){this.holding=!1,this.pressed=!1}hit(e,t){return this.progress<3.08?!1:(this.camera.updateMatrixWorld(),this.target.updateMatrixWorld(!0),this.raycaster.setFromCamera(new ue(e*2-1,t*2-1),this.camera),this.raycaster.intersectObject(this.target,!1).length>0)}update(e,t){if(!this.ready||!this.green||!this.human||!t)return;this.time+=e;const n=1-Math.exp(-Math.min(e,.1)*9);this.progress+=(this.targetProgress-this.progress)*n,this.pointer.lerp(this.pointerTarget,1-Math.exp(-Math.min(e,.1)*18));const i=this.holding?1:0;this.hold+=(i-this.hold)*(1-Math.exp(-Math.min(e,.1)*(this.holding?3.4:6)));const r=this.progress,a=ii(1.85,2.8,r),o=ii(.22,.75,r),l=ii(.12,.8,this.hold),c=ii(.28,.78,this.hold),h=(this.pointer.x-.5)*2,u=(this.pointer.y-.5)*2,f=Math.sin(this.time*.7)*.025,d=new I(h*this.aspect*.28+.48,.63+u*.15+f,.3),_=new I(-.17+h*.055,-.048+u*.04,.45),g=d.lerp(_,a).lerp(new I(-.49,.35,.55),c),m=new rn(.15+u*.16,.12+h*.4,2.22+h*.16),p=new rn(Ln(m.x,1.62,a),Ln(m.y,.48,a),Ln(m.z,1.35,a));p.z=Ln(p.z,3.08,c),p.y=Ln(p.y,-.48,c),p.x=Ln(p.x,.2,c),this.poseRotation.setFromEuler(p),this.screenRoll.setFromAxisAngle(this.rollAxis,-.56*a*(1-c)),p.setFromQuaternion(this.poseRotation.premultiply(this.screenRoll)),this.green.update(e,g,p,Ln(Ln(7.7,4.95,a),3.8,c),c>.1?"defiant":a>.3?"reach":"open",this.pressed&&!this.holding&&a<.7?.58:Math.max(0,.1-u*.15)*(1-a)*(1-c),o,Ln(.32,0,a),1-a,c);const M=new I(.19+h*.06,-.12+u*.04,.44).lerp(new I(.25,-.08,.52),c);this.human.update(e,M,new rn(.08,.18+h*.05,-1.98),4.1,"humanReach",0,ii(2,2.7,r),0,0),this.orbit.update(this.time,ii(.5,.95,r)*(1-ii(1.65,2.1,r)),h*.17,u*.08,this.aspect),this.petals.update(this.time,ii(2,2.75,r),this.aspect),this.garden?.update(this.time,ii(2,2.75,r),l),this.ring.visible=r>3.08,this.target.visible=!0,this.ring.scale.setScalar(1+this.hold*.3),this.ringMaterial.uniforms.uHold.value=this.hold,this.ringMaterial.uniforms.uHover.value=this.hovered?1:0,this.ringMaterial.uniforms.uTime.value=this.time,this.light.color.copy(new me(16775665)).lerp(new me(16739405),l),this.light.intensity=Ln(1.65,1.35,l),this.ambient.intensity=Ln(.36,.1,l),this.fill.color.copy(new me(10806505)).lerp(new me(10957135),l);const x=this.composite.uniforms;x.uTime.value=this.time,x.uProgress.value=r,x.uHold.value=l}render(e){if(!this.ready||e<=.001)return;const t=this.renderer,n=t.getRenderTarget(),i=t.autoClear,r=t.getClearColor(new me),a=t.getClearAlpha();t.setRenderTarget(this.targetRT),t.setClearColor(0,0),t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(null),t.autoClear=!1,this.composite.uniforms.uAlpha.value=e,t.render(this.screen,this.screenCamera),t.autoClear=i,t.setClearColor(r,a),t.setRenderTarget(n)}state(){return{ready:this.ready,error:this.error??null,progress:this.progress,targetProgress:this.targetProgress,chapter:this.progress<.25?"belief":this.progress<1.8?"hands":this.progress<2.75?"college":this.progress<3.08?"creation":"connection",pointer:this.pointer.toArray(),targetPointer:this.pointerTarget.toArray(),holding:this.holding,hold:this.hold,hovered:this.hovered,green:this.green?.state(),human:this.human?.state(),coins:this.orbit.state(),petals:this.petals.mesh.count,field:[this.width,this.height],sceneType:this.spatialGarden?"3D skinned hands, discs, instanced petals, experimental modeled garden / columns / reflective pond":"3D skinned hands, discs, instanced petals, original softened 2.5D garden",garden:this.garden?.state()??null}}}const we=s=>document.getElementById(s);class fS{renderer;pipeline;scene=new cr;overlay=new cr;camera=new is(-1,1,1,-1,.01,20);narrative;hand=new eS;countdown=new xM;nextScene=new tS;post;backdrop=new Ut({vertexShader:Dr,fragmentShader:Yx,depthWrite:!1,depthTest:!1,uniforms:{uTime:{value:0},uDawn:{value:0}}});width=0;height=0;aspect=1;pointer=null;postPointer=null;postLastY=0;postStartY=0;postStartX=0;postScrubbing=!1;postContact=!1;points=[];lastUv;handOpacity=0;guideTime=0;frame=0;last=0;hidden=document.hidden;contextLost=!1;loading=!0;pendingSkip=!1;frameTimes=[];lastPanel=0;uiKey="";message="";messageUntil=0;coreOnly=new URLSearchParams(location.search).get("stage")==="core";quality=matchMedia("(pointer:coarse)").matches?"balanced":"high";lastGesture;phaseHistory=[];benchmark;benchmarkResult;observer;onFrame;constructor(){this.renderer=new Vx({alpha:!1,antialias:!1,powerPreference:"high-performance"}),this.renderer.outputColorSpace=wt,this.renderer.toneMapping=ui,this.renderer.info.autoReset=!1,this.renderer.setClearColor(2121033,1),this.camera.position.z=5;const e=this.renderer.domElement;e.tabIndex=0,e.setAttribute("aria-label","按住鼠标或用一根手指画一个闭合的零，松开验证。"),we("stage").append(e),this.pipeline=new Kx(this.renderer);const t=new We(new Yn(2,2),this.backdrop);t.frustumCulled=!1,t.renderOrder=-100,this.scene.add(t,this.nextScene.group),this.overlay.add(this.countdown.group);const n=new ir(16774341,2);n.position.set(-2,3,4),this.scene.add(new Ic(16777215,.8),n);const i=new Gx,r=new Hl(this.renderer),a=r.fromScene(i,.04);this.scene.environment=a.texture,this.hand.scene.environment=a.texture,this.post=new uS(this.renderer,a.texture),r.dispose(),i.dispose(),this.narrative=new mM(o=>{this.phaseHistory.push({phase:o,time:this.narrative?.time??0}),o==="guide"&&(this.pointer=null),this.updateUi(!0)}),this.bind(),this.resize(),this.observer=new ResizeObserver(()=>this.resize()),this.observer.observe(we("stage")),window.__frostDemo=this,this.frame=requestAnimationFrame(this.loop),this.loadAssets()}async loadAssets(){const e=Promise.all([document.fonts.load('700 100px "Zero Sans"'),document.fonts.load('400 80px "Zero Serif"'),document.fonts.load('italic 300 80px "Zero Serif"')]).then(()=>this.countdown.refreshAtlas());await Promise.allSettled([this.pipeline.loadPhoto("/soulgrain-onward/why-zero-hand-polish-v4/assets/frost-study-v2.webp"),this.coreOnly?Promise.resolve():this.hand.load("/soulgrain-onward/why-zero-hand-polish-v4/assets/hand-refined-v2.glb"),this.coreOnly?Promise.resolve():this.post.load("/soulgrain-onward/why-zero-hand-polish-v4/assets/hand-studio-v4.glb","/soulgrain-onward/why-zero-hand-polish-v4/assets/garden-v3.webp","/soulgrain-onward/why-zero-hand-polish-v4/assets/skin-v3.webp"),e]),this.loading=!1,we("loading").hidden=!0,(this.pipeline.photoError||!this.coreOnly&&(this.hand.error||this.post.error))&&(we("error").hidden=!1,we("error").textContent="部分研究资产未加载成功，当前为降级显示。请重新加载页面。"+(this.pipeline.photoError??this.hand.error??this.post.error)),this.restart();const t=new URLSearchParams(location.search).get("stage");(this.pendingSkip||t==="core"||t==="hand"||t==="gesture")&&this.narrative.guide(),(t==="hands"||t==="creation")&&(this.narrative.post(),this.post.jump(t==="creation"?3.4:1.25),this.post.progress=this.post.targetProgress)}bind(){const e=this.renderer.domElement;e.addEventListener("pointerdown",this.down,{passive:!1}),e.addEventListener("pointermove",this.move,{passive:!1}),e.addEventListener("pointerup",this.up),e.addEventListener("pointercancel",this.cancel),e.addEventListener("lostpointercapture",this.cancel),e.addEventListener("pointerleave",()=>{this.hand.leavePointer(),this.postPointer===null&&this.post.pointerTarget.set(.5,.5)}),e.addEventListener("wheel",t=>{this.narrative.phase==="done"&&(t.preventDefault(),this.post.scroll(t.deltaY))},{passive:!1}),e.addEventListener("keydown",t=>{this.narrative.phase==="done"&&(["ArrowDown","ArrowRight","PageDown"].includes(t.code)&&(t.preventDefault(),this.post.scroll(230)),["ArrowUp","ArrowLeft","PageUp"].includes(t.code)&&(t.preventDefault(),this.post.scroll(-230)),t.code==="End"&&(t.preventDefault(),this.post.jump(3.4)))}),e.addEventListener("contextmenu",t=>t.preventDefault()),e.addEventListener("webglcontextlost",t=>{t.preventDefault(),this.contextLost=!0,we("error").hidden=!1,we("error").textContent="图形上下文暂时中断，请重新加载此页面。"}),document.addEventListener("visibilitychange",()=>{this.hidden=document.hidden,this.last=0,this.hidden&&this.abortStroke()}),window.addEventListener("blur",()=>this.abortStroke()),we("restart").onclick=we("again").onclick=()=>this.restart(),we("to-hands").onclick=()=>{this.loading||(this.abortStroke(),this.narrative.post(),this.post.jump(1.25))},we("story-next").onclick=()=>this.post.progress>3.1?this.post.jump(1.25):this.post.next(),we("story-back").onclick=()=>this.post.jump(this.post.targetProgress>2.5?1.25:0),we("story-menu-toggle").onclick=()=>{we("story-menu").hidden=!we("story-menu").hidden};for(const t of document.querySelectorAll("[data-chapter]"))t.onclick=()=>{this.post.jump(Number(t.dataset.chapter)),we("story-menu").hidden=!0};we("skip").onclick=()=>{if(this.loading){this.pendingSkip=!0;return}this.abortStroke(),this.pipeline.reset(),this.guideTime=0,this.narrative.guide()},we("debug-toggle").onclick=()=>{const t=we("debug");t.hidden=!t.hidden,we("debug-toggle").setAttribute("aria-expanded",String(!t.hidden))},we("debug-close").onclick=()=>{we("debug").hidden=!0,we("debug-toggle").setAttribute("aria-expanded","false")},we("quality").value=this.quality,we("quality").onchange=()=>{this.quality=we("quality").value,this.resize(!0)},we("benchmark").onclick=()=>{this.benchmark={start:performance.now(),frames:[]},we("benchmark").textContent="正在采样，请继续操作…"},we("export-report").onclick=()=>{const t=new Blob([JSON.stringify(this.getState(),null,2)],{type:"application/json"}),n=URL.createObjectURL(t),i=document.createElement("a");i.href=n,i.download="zero-opening-v2-diagnostics.json",i.click(),setTimeout(()=>URL.revokeObjectURL(n),3e3)}}resize(e=!1){const t=innerWidth,n=innerHeight;!e&&t===this.width&&n===this.height&&this.renderer.domElement.width>1||(this.abortStroke(),this.width=t,this.height=n,this.aspect=t/n,this.camera.left=-this.aspect,this.camera.right=this.aspect,this.camera.top=1,this.camera.bottom=-1,this.camera.updateProjectionMatrix(),this.pipeline.resize(t,n,this.quality),this.post?.resize(t,n))}location(e){const t=this.renderer.domElement.getBoundingClientRect();return{x:e.clientX-t.left,y:e.clientY-t.top,t:performance.now()}}uv(e){return new ue(e.x/this.width,1-e.y/this.height)}down=e=>{if(!(this.loading||e.pointerType==="mouse"&&e.button!==0)){if(this.narrative.phase==="done"){if(this.postPointer!==null){this.post.release(),this.postPointer=null;return}e.preventDefault(),this.postPointer=e.pointerId,this.postLastY=this.postStartY=e.clientY,this.postStartX=e.clientX,this.postScrubbing=!1,this.postContact=this.post.down(e.clientX/this.width,1-e.clientY/this.height);try{this.renderer.domElement.setPointerCapture(e.pointerId)}catch{}return}if(this.pointer!==null){this.abortStroke();return}if(this.narrative.drawing()){e.preventDefault(),this.pointer=e.pointerId,this.points=[],this.lastUv=void 0,this.message="",this.acceptPoint(this.location(e));try{this.renderer.domElement.setPointerCapture(e.pointerId)}catch{}}}};move=e=>{if(this.hand.setPointer(e.clientX/this.width,1-e.clientY/this.height),this.narrative.phase==="done"){if(this.post.move(e.clientX/this.width,1-e.clientY/this.height),e.pointerId===this.postPointer){e.preventDefault();const n=Math.abs(e.clientY-this.postStartY),i=Math.abs(e.clientX-this.postStartX);e.pointerType==="touch"&&!this.postContact&&(this.postScrubbing||n>12&&n>i*1.1)&&(this.postScrubbing=!0,this.post.scroll((this.postLastY-e.clientY)*2.5)),this.postLastY=e.clientY}return}if(e.pointerId!==this.pointer)return;e.preventDefault();const t=e.getCoalescedEvents?.()??[e];for(const n of t.length?t:[e])this.acceptPoint(this.location(n))};acceptPoint(e){if(this.points.length&&Math.hypot(e.x-this.points.at(-1).x,e.y-this.points.at(-1).y)<1)return;this.points.push(e),this.points.length>5e3&&(this.points=this.points.filter((n,i)=>i===0||i%2===0||i===this.points.length-1));const t=this.uv(e);this.pipeline.stroke(this.lastUv??t,t),this.lastUv=t,this.pipeline.finalMaterial.uniforms.uPointer.value.copy(t)}up=e=>{if(e.pointerId===this.postPointer){this.postPointer=null,this.post.release();try{this.renderer.domElement.releasePointerCapture(e.pointerId)}catch{}return}if(e.pointerId===this.pointer){this.acceptPoint(this.location(e)),this.pointer=null;try{this.renderer.domElement.hasPointerCapture(e.pointerId)&&this.renderer.domElement.releasePointerCapture(e.pointerId)}catch{}this.lastGesture=iS(this.points,Math.max(58,Math.min(this.width,this.height)*.08)),this.lastGesture.valid?(this.pipeline.finalMaterial.uniforms.uCenter.value.copy(this.uv(this.lastGesture.center)),this.narrative.success()):(this.message=this.lastGesture.reason,this.messageUntil=this.narrative.time+2.8,this.pipeline.cool(),this.narrative.invalid())}};cancel=e=>{(e.pointerId===this.pointer||e.pointerId===this.postPointer)&&this.abortStroke()};abortStroke(){const e=this.postPointer;if(this.postPointer=null,this.post?.release(),e!==null)try{this.renderer.domElement.releasePointerCapture(e)}catch{}const t=this.pointer;if(this.pointer=null,this.points=[],this.lastUv=void 0,t!==null){try{this.renderer.domElement.hasPointerCapture(t)&&this.renderer.domElement.releasePointerCapture(t)}catch{}this.pipeline?.cool(),this.narrative?.invalid()}}restart(){this.abortStroke(),this.pipeline.reset(),this.lastGesture=void 0,this.message="",this.phaseHistory=[],this.guideTime=0,this.handOpacity=0,this.post.reset(),this.narrative.restart(),this.pipeline.finalMaterial.uniforms.uCenter.value.set(.5,.5),this.updateUi(!0)}updateUi(e=!1){if(!this.narrative)return;const t=this.narrative.phase,n=this.narrative.time<this.messageUntil?this.message:"",i=t+n;!e&&i===this.uiKey||(this.uiKey=i,we("app").dataset.state=t,we("story-hud").hidden=t!=="done",we("end-copy").hidden=!["transition","done"].includes(t),we("skip").hidden=!["countdown","shattering"].includes(t),we("phase").textContent=["countdown","shattering"].includes(t)?"01 / ARRIVAL":["guide","drawing"].includes(t)?"02 / FROST UNLOCK":t==="done"?"04 / YOU BELIEVED":"03 / THE THAW",we("hint").textContent=n||"按住冰面画一个完整的零，松开手指验证。")}loop=e=>{if(this.frame=requestAnimationFrame(this.loop),this.hidden||this.contextLost){this.last=0;return}const t=this.last?e-this.last:16.67,n=t/1e3;if(this.last=e,this.frameTimes.push(t),this.frameTimes.length>180&&this.frameTimes.shift(),this.benchmark&&(this.benchmark.frames.push(t),performance.now()-this.benchmark.start>1e4)){const f=[...this.benchmark.frames].sort((d,_)=>d-_);this.benchmarkResult={samples:f.length,medianFrameMs:f[Math.floor(f.length*.5)],p95FrameMs:f[Math.floor(f.length*.95)],environment:navigator.userAgent,pipeline:this.renderInfo()},this.benchmark=void 0,we("benchmark").textContent="重新采样 10 秒"}this.loading||this.narrative.update(n);const i=this.narrative.values,r=this.narrative.phase,a=r==="done";this.post.update(n,a),(r==="guide"||r==="drawing")&&(this.guideTime+=n),this.handOpacity+=(i.hand-this.handOpacity)*(1-Math.exp(-n*12)),this.hand.update(this.guideTime,this.coreOnly?0:this.handOpacity,this.aspect,n),this.countdown.update(i.number,i.shatter,this.narrative.time,this.aspect,this.guideTime),this.overlay.visible=!this.loading&&!["melting","transition","done"].includes(r),this.nextScene.update(this.narrative.time,i.orb);const o=Math.max(0,(i.dawn-.78)/.22)*(1-i.orb),l=this.post.progress;we("end-copy").style.opacity=String(o*Math.max(0,1-l*2.8)),we("end-copy").style.pointerEvents=a&&l>.3?"none":"",we("again").hidden=a,we("college-copy").style.opacity=String(a?Math.max(0,Math.min((l-1.5)/.3,(2.65-l)/.35,1)):0),we("college-copy").style.transform="translateY("+(1.8-l)*70+"px)";const c=we("college-copy").querySelector(".college-word"),h=we("college-copy").querySelector(".land-word");c.style.opacity=String(Math.max(0,Math.min(1,(l-1.65)/.25))),h.style.opacity=String(Math.max(0,Math.min(1,(l-2)/.25))),h.style.transform="translateY("+Math.max(0,(2.25-l)*65)+"px)",we("job-copy").style.opacity=String(a?Math.max(0,Math.min((l-2.35)/.25,(3.2-l)/.25,1)):0),we("hold-copy").hidden=!a||l<3.1,we("story-ruler-label").textContent=l>2.5?"-75 BZ":"-100 BZ",we("story-next").textContent=l>3.1?"Replay the hands":"Continue exploring",we("reward").style.opacity=String(i.orb),this.backdrop.uniforms.uTime.value=this.narrative.time,this.backdrop.uniforms.uDawn.value=i.dawn;const u=this.pipeline.finalMaterial.uniforms;if(u.uFreeze.value=i.freeze,u.uMelt.value=i.melt,u.uDawn.value=i.dawn,u.uFlash.value=i.flash,u.uGuideTime.value=this.guideTime,u.uGuidance.value=this.handOpacity,u.uPointerActive.value=this.pointer!==null?1:0,this.renderer.info.reset(),!a||!this.post.ready){this.pipeline.render(this.scene,this.camera,this.hand.scene,n,this.narrative.time);const f=this.renderer.autoClear;this.renderer.autoClear=!1,this.renderer.clearDepth(),this.renderer.render(this.overlay,this.camera),this.renderer.autoClear=f}a&&this.post.render(1),this.updateUi(),this.onFrame?.(),e-this.lastPanel>350&&(this.lastPanel=e,we("debug").hidden||(we("stats").textContent=JSON.stringify(this.getState(),null,2)))};renderInfo(){const e=this.pipeline.info();return this.narrative.phase==="done"&&this.post.ready?{active:"hand-narrative",quality:e.quality,buffer:e.buffer,passes:"3D skinned hands / discs / instanced petals into scene target, then environment / fog / contact composite",visibleSkinnedHands:+!!this.post.green?.root.visible+ +!!this.post.human?.root.visible,petalInstances:this.post.petals.mesh.count,openingPassesSuspended:!0}:{active:"frost",...e}}getState(){const e=[...this.frameTimes].sort((n,i)=>n-i),t=this.narrative?.values;return{version:"hand-polish-v4",experience:this.post.state(),phase:this.narrative?.phase,time:this.narrative?.time,guideTime:this.guideTime,loading:this.loading,values:{number:t?.number,freeze:t?.freeze,shatter:t?.shatter,melt:t?.melt,dawn:t?.dawn,flash:t?.flash,hand:t?.hand,orb:t?.orb},gesture:this.lastGesture??null,activePointer:this.pointer,strokePoints:this.points.length,hand:{ready:this.hand.ready,opacity:this.handOpacity,error:this.hand.error??null,asset:"MIT WebXR hand / refined editable derivative"},render:{...this.renderInfo(),calls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles},frameMs:{median:e[Math.floor(e.length*.5)]??0,p95:e[Math.floor(e.length*.95)]??0},benchmark:this.benchmarkResult??null,history:this.phaseHistory,contextLost:this.contextLost,userAgent:navigator.userAgent}}}try{new fS}catch(s){we("error").hidden=!1,we("error").textContent="WebGL 演示暂时无法启动："+String(s)}
