
import * as THREE from 'three'

class Hueso extends THREE.Object3D {
  constructor(tamanio) {
    super();
    
    
    // El material se usa desde varios métodos. Por eso se alamacena en un atributo
    this.material = new THREE.MeshStandardMaterial({color: 0xCF0000});
    
    var tamano = 0.15;   // 15 cm de largo. Las unidades son metros

    //añadir aqui los metodos que crean el hueso
    this.createBase(tamanio)

  }
  
  createBase(tama) {
    // El nodo del que van a colgar la caja y los 2 conos y que se va a devolver
    var base = new THREE.Object3D();
    return base;
  }
  
  
  update () {
    // No hay nada que actualizar ya que la apertura de la grapadora se ha actualizado desde la interfaz
  }
}

export { Hueso }
