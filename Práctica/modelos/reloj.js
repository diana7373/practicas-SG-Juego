
import * as THREE from 'three'
import * as CSG from '../libs/three-bvh-csg.js'

class Reloj extends THREE.Object3D {
  constructor(tamanio) {
    super();
    // El material se usa desde varios métodos. Por eso se alamacena en un atributo
    this.material = new THREE.MeshStandardMaterial({color: 0x82A1B1});
    
    var tamano = 0.15;   // 15 cm de largo. Las unidades son metros

    var base = this.createBase() //hacerlo con tama pero por ahora asi para probar

    var evaluador = new CSG.Evaluator();

    var brush_base = new CSG.Brush(base,this.material); 

    const resultado = evaluador.evaluate(brush_base);

    this.add(resultado);

  }
  
  createBase() {
    // El nodo del que van a colgar la caja y los 2 conos y que se va a devolver
    var points = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(2, 0),
      new THREE.Vector2(2.2, 0.2),
      new THREE.Vector2(2.2, 3),
      new THREE.Vector2(0, 3),
    ];

     var geometry = new THREE.LatheGeometry(points);

     return geometry;
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
