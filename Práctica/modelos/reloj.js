
import * as THREE from 'three'
import * as CSG from '../libs/three-bvh-csg.js'

class Reloj extends THREE.Object3D {
  constructor(tamanio) {
    super();
    // El material se usa desde varios métodos. Por eso se alamacena en un atributo
    this.material = new THREE.MeshStandardMaterial({color: 0xCF0000});
    
    var tamano = 0.15;   // 15 cm de largo. Las unidades son metros

    //añadir aqui los metodos que crean la reloj de mano

  }
  
  createBase(tama) {
    // El nodo del que van a colgar la caja y los 2 conos y que se va a devolver
    var base = new THREE.Object3D();

    return base;
  }
  
  
  createAguja(tama) {
    // Se crea la parte móvil
    var aguja = new THREE.Object3D();
    return aguja;
  }

  createTapa(tama){
    var tapa = new THREE.Object3D();
    return tapa;
  }
  
  
  update () {
    // No hay nada que actualizar ya que la apertura de la grapadora se ha actualizado desde la interfaz
  }
}

export { Reloj }
