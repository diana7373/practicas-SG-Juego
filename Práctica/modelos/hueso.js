
import * as THREE from 'three'
import * as CSG from '../libs/three-bvh-csg.js'

class Hueso extends THREE.Object3D {
  constructor(tamanio) {
    super();

    this.createBase(tamanio);
    var material = new THREE.MeshStandardMaterial({color: 0x34AAE6});
    var cuerpo = this.createBase(tamanio);
    var superior = this.createExtremos(tamanio);
    var inferior = this.createExtremos(tamanio);

    inferior.position.set(0,-tamanio/2,0);
    superior.position.set(0,tamanio/2,0);

    var figura = new CSG.Brush(cuerpo, material);
    var evaluador = new CSG.Evaluator();


    var primer_resultado = evaluador.evaluate(superior,figura,CSG.ADDITION);
    var segundo_resultado = evaluador.evaluate(primer_resultado,inferior,CSG.ADDITION);

    this.add(segundo_resultado);
  }
  
  createBase(tamanio) {
    // El nodo del que van a colgar la caja y los 2 conos y que se va a devolver


    var perfil2D = [];
    perfil2D.push(new THREE.Vector2(0.0,0.0));
    perfil2D.push(new THREE.Vector2(tamanio,0.0));
    perfil2D.push(new THREE.Vector2(tamanio, tamanio));
    perfil2D.push(new THREE.Vector2(0.0,tamanio));
    
    var geometria = new THREE.LatheGeometry(perfil2D, 24,0,Math.PI * 2);
    return geometria;
  }

  createExtremos(tamanio){
    var material = new THREE.MeshStandardMaterial({color: 0x34AAE6});

    var esfera = new THREE.SphereGeometry();
    var esfera2 = new THREE.SphereGeometry();

    esfera.translate(-1,0,0);
    esfera2.translate(1,0,0);

    var figura = new CSG.Brush(esfera, material);
    var figura2 = new CSG.Brush(esfera2, material);

    var evaluador = new CSG.Evaluator();
    var resultado1 = evaluador.evaluate(figura, figura2, CSG.ADDITION);

    return resultado1;
  }
  
  
  update () {
    // No hay nada que actualizar ya que la apertura de la grapadora se ha actualizado desde la interfaz
  }
}

export { Hueso }
