import * as THREE from 'three'
import * as CSG from '../../libs/three-bvh-csg.js'

class Hueso extends THREE.Object3D {
  constructor(tamanio) {
    super();

    this.userData.root = this;
    this.userData.type = "HUESO";

    var material = new THREE.MeshStandardMaterial({ color: 0xF7F3F2 });

    var cuerpo = this.createBase(tamanio * 1);
    var superior = this.createExtremos(tamanio * 0.9, material);
    var inferior = this.createExtremos(tamanio * 0.9, material);

    superior.geometry.translate(0, tamanio * 1.1, 0);
    inferior.geometry.translate(0, -tamanio * 3.2, 0);
    cuerpo.translate(0, -tamanio * 3.4, 0);

    var figura = new CSG.Brush(cuerpo, material);
    var evaluador = new CSG.Evaluator();

    var primer_resultado = evaluador.evaluate(superior, figura, CSG.ADDITION);
    var segundo_resultado = evaluador.evaluate(primer_resultado, inferior, CSG.ADDITION);

    segundo_resultado.userData.root = this;
    segundo_resultado.userData.type = "HUESO";
    segundo_resultado.name = "HUESO_VISUAL";

    this.add(segundo_resultado);

    // Caja invisible de colisión que cubre todo el hueso
    const cajaColision = this.createCajaColision(tamanio, segundo_resultado);
    this.add(cajaColision);
  }

  createCajaColision(tamanio, objetoVisual) {
    objetoVisual.geometry.computeBoundingBox();

    const boundingBox = objetoVisual.geometry.boundingBox.clone();

    // Hacemos la caja un poco más grande para que sea fácil chocar con ella
    boundingBox.expandByScalar(tamanio * 0.35);

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    boundingBox.getSize(size);
    boundingBox.getCenter(center);

    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);

    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0,
      depthWrite: false
    });

    const caja = new THREE.Mesh(geometry, material);

    caja.position.copy(center);

    caja.userData.root = this;
    caja.userData.type = "HUESO";
    caja.name = "HUESO_CAJA_COLISION";

    caja.castShadow = false;
    caja.receiveShadow = false;

    return caja;
  }

  createBase(tamanio) {
    var perfil2D = [];

    perfil2D.push(new THREE.Vector2(0, 0));

    perfil2D.push(new THREE.Vector2(tamanio * 0.25, 0));
    perfil2D.push(new THREE.Vector2(tamanio * 0.30, tamanio * 0.1));
    perfil2D.push(new THREE.Vector2(tamanio * 0.32, tamanio * 0.25));
    perfil2D.push(new THREE.Vector2(tamanio * 0.30, tamanio * 0.4));
    perfil2D.push(new THREE.Vector2(tamanio * 0.26, tamanio * 0.6));

    perfil2D.push(new THREE.Vector2(tamanio * 0.22, tamanio * 1.0));
    perfil2D.push(new THREE.Vector2(tamanio * 0.18, tamanio * 1.4));

    perfil2D.push(new THREE.Vector2(tamanio * 0.14, tamanio * 1.9));
    perfil2D.push(new THREE.Vector2(tamanio * 0.12, tamanio * 2.3));
    perfil2D.push(new THREE.Vector2(tamanio * 0.14, tamanio * 2.7));

    perfil2D.push(new THREE.Vector2(tamanio * 0.18, tamanio * 3.1));
    perfil2D.push(new THREE.Vector2(tamanio * 0.22, tamanio * 3.5));

    perfil2D.push(new THREE.Vector2(tamanio * 0.26, tamanio * 3.9));
    perfil2D.push(new THREE.Vector2(tamanio * 0.28, tamanio * 4.1));
    perfil2D.push(new THREE.Vector2(tamanio * 0.26, tamanio * 4.3));

    perfil2D.push(new THREE.Vector2(tamanio * 0.20, tamanio * 4.5));
    perfil2D.push(new THREE.Vector2(tamanio * 0.12, tamanio * 4.6));
    perfil2D.push(new THREE.Vector2(0, tamanio * 4.62));

    return new THREE.LatheGeometry(perfil2D, 32);
  }

  createExtremos(tamanio, material) {
    const radio = tamanio * 0.6;

    const esfera1 = new THREE.SphereGeometry(radio, 32, 32);
    const esfera2 = new THREE.SphereGeometry(radio, 32, 32);

    esfera1.translate(-radio * 0.8, 0, 0);
    esfera2.translate(radio * 0.8, 0, 0);

    const brush1 = new CSG.Brush(esfera1, material);
    const brush2 = new CSG.Brush(esfera2, material);

    const evaluador = new CSG.Evaluator();
    return evaluador.evaluate(brush1, brush2, CSG.ADDITION);
  }

  update() {
  }
}

export { Hueso };