
import * as THREE from 'three'
import * as CSG from '../libs/three-bvh-csg.js'

class Llave extends THREE.Object3D {
  constructor(tamanio) {
    super();
    
    
    // El material se usa desde varios métodos. Por eso se alamacena en un atributo
    this.material = new THREE.MeshStandardMaterial({color: 0xD9D9D9});
    
    var tamano = 0.15;   // 15 cm de largo. Las unidades son metros

    //añadir aqui los metodos que crean la llave

  }
  
  createAnillo(tama) {
    // El nodo del que van a colgar la caja y los 2 conos y que se va a devolver
    var base = new THREE.Object3D();

    return base;
  }
  
  
  createCilindro (tama) {
    var cilindro = new THREE.Object3D();

    var shape = createShapeRect()

    var options = {
      depth: 8,
      steps: 2,
      bevelEnabled: false
    };

    var geometry = new THREE.ExtrudeGeometry(shape, options);

    const material = new THREE.MeshStandardMaterial({ color: 0xD9D9D9 });

    const cilindro = new THREE.Mesh(geometry, material);

    return cilindro;
  }

  createShapeRect(){
    const shape = new THREE.Shape();
    shape.moveTo(0,0);
    shape.lineTo(5,0);
    shape.lineTo(5,2.5);
    shape.lineTo(0,2.5);
    shape.lineTo(0,0);
    return shape;
  }

  createPrisma(tama){
    var prisma = new THREE.Object3D();
    return prisma;
  }
  
  
  update () {
    // No hay nada que actualizar ya que la apertura de la grapadora se ha actualizado desde la interfaz
  }
}

export { Llave }
