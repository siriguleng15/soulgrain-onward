import {Color,Mesh,MeshBasicMaterial,PlaneGeometry,PMREMGenerator,Scene,Vector3,WebGLRenderer} from 'three';

/** Original three-softbox studio, avoiding the many hard strips in RoomEnvironment. */
export function createHandStudioEnvironment(renderer:WebGLRenderer){
  const scene=new Scene();scene.background=new Color('#adc8bd').multiplyScalar(.24);
  const geometry=new PlaneGeometry(1,1),materials:MeshBasicMaterial[]=[];
  const panel=(x:number,y:number,z:number,w:number,h:number,color:string,power:number)=>{
    const material=new MeshBasicMaterial({color:new Color(color).multiplyScalar(power),toneMapped:false});
    materials.push(material);const mesh=new Mesh(geometry,material);mesh.position.set(x,y,z);mesh.scale.set(w,h,1);mesh.lookAt(new Vector3());scene.add(mesh);
  };
  panel(2.8,4,3.4,4.5,3.5,'#fff9e8',3.8);
  panel(-3.6,1,2.5,3,4,'#d0f1f1',1.45);
  panel(.4,-2.6,1.6,4,1.8,'#79c9d9',1.0);
  const generator=new PMREMGenerator(renderer),target=generator.fromScene(scene,.075);
  generator.dispose();geometry.dispose();materials.forEach(m=>m.dispose());
  return target;
}
