
import * as THREE from 'three'
import * as CSG from '../../libs/three-bvh-csg.js'

class Hueso extends THREE.Object3D {
  constructor(tamanio) {
    super();

    this.createBase(tamanio);
    var material = new THREE.MeshStandardMaterial({color: 0xF7F3F2});
    var cuerpo = this.createBase(tamanio*1);
    var superior = this.createExtremos(tamanio*0.9, material);
    var inferior = this.createExtremos(tamanio*0.9, material);

    superior.geometry.translate(0,tamanio*1.1,0);
    inferior.geometry.translate(0,-tamanio*3.2,0);
    cuerpo.translate(0,-tamanio*3.4,0);

    var figura = new CSG.Brush(cuerpo, material);
    var evaluador = new CSG.Evaluator();


    var primer_resultado = evaluador.evaluate(superior,figura,CSG.ADDITION);
    var segundo_resultado = evaluador.evaluate(primer_resultado,inferior,CSG.ADDITION);
    segundo_resultado.userData.root = this;
    segundo_resultado.userData.type = "HUESO";

    this.add(segundo_resultado);
  }
  
createBase(tamanio) {
  var perfil2D = [];

  // Centro inferior
  perfil2D.push(new THREE.Vector2(0, 0));

  // Base inferior (más pequeña que antes)
  perfil2D.push(new THREE.Vector2(tamanio * 0.25, 0));
  perfil2D.push(new THREE.Vector2(tamanio * 0.30, tamanio * 0.1));
  perfil2D.push(new THREE.Vector2(tamanio * 0.32, tamanio * 0.25));
  perfil2D.push(new THREE.Vector2(tamanio * 0.30, tamanio * 0.4));
  perfil2D.push(new THREE.Vector2(tamanio * 0.26, tamanio * 0.6));

  // Transición hacia el centro
  perfil2D.push(new THREE.Vector2(tamanio * 0.22, tamanio * 1.0));
  perfil2D.push(new THREE.Vector2(tamanio * 0.18, tamanio * 1.4));

  // Centro del hueso (parte más estrecha)
  perfil2D.push(new THREE.Vector2(tamanio * 0.14, tamanio * 1.9));
  perfil2D.push(new THREE.Vector2(tamanio * 0.12, tamanio * 2.3));
  perfil2D.push(new THREE.Vector2(tamanio * 0.14, tamanio * 2.7));

  // Volver a ensanchar un poco
  perfil2D.push(new THREE.Vector2(tamanio * 0.18, tamanio * 3.1));
  perfil2D.push(new THREE.Vector2(tamanio * 0.22, tamanio * 3.5));

  // Parte superior (también más pequeña)
  perfil2D.push(new THREE.Vector2(tamanio * 0.26, tamanio * 3.9));
  perfil2D.push(new THREE.Vector2(tamanio * 0.28, tamanio * 4.1));
  perfil2D.push(new THREE.Vector2(tamanio * 0.26, tamanio * 4.3));

  // Cierre superior
  perfil2D.push(new THREE.Vector2(tamanio * 0.20, tamanio * 4.5));
  perfil2D.push(new THREE.Vector2(tamanio * 0.12, tamanio * 4.6));
  perfil2D.push(new THREE.Vector2(0, tamanio * 4.62));

  return new THREE.LatheGeometry(perfil2D, 32);
}

createExtremos(tamanio, material) {
  const radio = tamanio * 0.6;

  const esfera1 = new THREE.SphereGeometry(radio, 32, 32);
  const esfera2 = new THREE.SphereGeometry(radio, 32, 32);

  // Separación entre las dos esferas
  esfera1.translate(-radio * 0.8, 0, 0);
  esfera2.translate(radio * 0.8, 0, 0);

  const brush1 = new CSG.Brush(esfera1, material);
  const brush2 = new CSG.Brush(esfera2, material);

  const evaluador = new CSG.Evaluator();
  return evaluador.evaluate(brush1, brush2, CSG.ADDITION);
}
  
  
  update () {
    // No hay nada que actualizar ya que la apertura de la grapadora se ha actualizado desde la interfaz
  }
}

export { Hueso }
