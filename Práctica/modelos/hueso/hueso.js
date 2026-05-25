import * as THREE from 'three'
import * as CSG from '../../libs/three-bvh-csg.js'

class Hueso extends THREE.Object3D {
  constructor(tamanio) {
    super();

    this.userData.root = this;
    this.userData.type = "HUESO";

    var material = this.createMaterialHueso();

    var cuerpo = this.createBase(tamanio * 1);
    var superior = this.createExtremos(tamanio * 0.9, material);
    var inferior = this.createExtremos(tamanio * 0.9, material);

    superior.geometry.translate(0, tamanio * 1.1, 0);
    inferior.geometry.translate(0, -tamanio * 3.2, 0);
    cuerpo.translate(0, -tamanio * 3.4, 0);

    var figura = new CSG.Brush(cuerpo, material);
    var evaluador = new CSG.Evaluator();

    var primer_resultado = evaluador.evaluate(
      superior,
      figura,
      CSG.ADDITION
    );

    var segundo_resultado = evaluador.evaluate(
      primer_resultado,
      inferior,
      CSG.ADDITION
    );

    segundo_resultado.material = material;
    segundo_resultado.userData.root = this;
    segundo_resultado.userData.type = "HUESO";
    segundo_resultado.name = "HUESO_VISUAL";

    segundo_resultado.castShadow = true;
    segundo_resultado.receiveShadow = true;

    if (segundo_resultado.geometry) {
      segundo_resultado.geometry.computeVertexNormals();

      // Manchas directamente sobre la geometría
      this.aplicarManchasHueso(segundo_resultado.geometry);
    }

    this.add(segundo_resultado);

    // Caja invisible grande para colisión
    const cajaColision = this.createCajaColision(tamanio, segundo_resultado);
    this.add(cajaColision);
  }

  createMaterialHueso() {
    return new THREE.MeshStandardMaterial({
      color: 0xf2e6c9,

      // Esto permite que las manchas por vértice se vean
      vertexColors: true,

      roughness: 0.88,
      metalness: 0.0,

      // Un pelín de luz propia para que no se vea negro en el laberinto
      emissive: 0x2b2418,
      emissiveIntensity: 0.08,

      side: THREE.DoubleSide
    });
  }

  aplicarManchasHueso(geometry) {
    const position = geometry.attributes.position;
    const colors = [];

    const colorBase = new THREE.Color(0xf2e6c9);     // beige hueso
    const colorClaro = new THREE.Color(0xfff8e5);    // zonas más claras
    const colorMancha = new THREE.Color(0x7a5a34);   // manchas marrones
    const colorManchaOscura = new THREE.Color(0x3b2a18);

    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);

      // Ruido falso para manchas grandes y pequeñas
      const ruido1 = Math.sin(x * 18.3 + y * 7.7 + z * 13.1);
      const ruido2 = Math.sin(x * 42.0 + y * 16.0 - z * 31.0);
      const ruido3 = Math.cos(x * 9.0 - y * 5.5 + z * 11.0);

      const mezcla = (ruido1 + ruido2 * 0.45 + ruido3 * 0.35) / 1.8;

      let color = colorBase.clone();

      // Manchas oscuras más grandes
      if (mezcla > 0.42) {
        color.lerp(colorMancha, 0.65);
      }

      // Algunas manchas más fuertes
      if (mezcla > 0.68) {
        color.lerp(colorManchaOscura, 0.45);
      }

      // Zonas más blanquecinas
      if (mezcla < -0.55) {
        color.lerp(colorClaro, 0.55);
      }

      // Oscurece un poco la parte baja para dar efecto viejo
      if (y < -0.8) {
        color.lerp(colorMancha, 0.18);
      }

      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(colors, 3)
    );

    geometry.attributes.color.needsUpdate = true;
  }

  createCajaColision(tamanio, objetoVisual) {
    objetoVisual.geometry.computeBoundingBox();

    const boundingBox = objetoVisual.geometry.boundingBox.clone();

    // Caja un poco más grande para que sea fácil colisionar con el hueso
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

    // Centro inferior
    perfil2D.push(new THREE.Vector2(0, 0));

    // Base inferior
    perfil2D.push(new THREE.Vector2(tamanio * 0.25, 0));
    perfil2D.push(new THREE.Vector2(tamanio * 0.30, tamanio * 0.1));
    perfil2D.push(new THREE.Vector2(tamanio * 0.32, tamanio * 0.25));
    perfil2D.push(new THREE.Vector2(tamanio * 0.30, tamanio * 0.4));
    perfil2D.push(new THREE.Vector2(tamanio * 0.26, tamanio * 0.6));

    // Transición hacia el centro
    perfil2D.push(new THREE.Vector2(tamanio * 0.22, tamanio * 1.0));
    perfil2D.push(new THREE.Vector2(tamanio * 0.18, tamanio * 1.4));

    // Centro estrecho
    perfil2D.push(new THREE.Vector2(tamanio * 0.14, tamanio * 1.9));
    perfil2D.push(new THREE.Vector2(tamanio * 0.12, tamanio * 2.3));
    perfil2D.push(new THREE.Vector2(tamanio * 0.14, tamanio * 2.7));

    // Vuelve a ensanchar
    perfil2D.push(new THREE.Vector2(tamanio * 0.18, tamanio * 3.1));
    perfil2D.push(new THREE.Vector2(tamanio * 0.22, tamanio * 3.5));

    // Parte superior
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

    esfera1.translate(-radio * 0.8, 0, 0);
    esfera2.translate(radio * 0.8, 0, 0);

    const brush1 = new CSG.Brush(esfera1, material);
    const brush2 = new CSG.Brush(esfera2, material);

    const evaluador = new CSG.Evaluator();

    return evaluador.evaluate(
      brush1,
      brush2,
      CSG.ADDITION
    );
  }

  update() {
    // Giro sobre sí mismo en eje Y
    this.rotation.y += 0.01;
  }
}

export { Hueso }