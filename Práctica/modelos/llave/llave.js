import * as THREE from 'three'
import * as CSG from '../../libs/three-bvh-csg.js'

class Llave extends THREE.Object3D {
  constructor(tamanio) {
    super();

    this.userData.root = this;
    this.userData.type = "LLAVE";

    this.material = this.createMaterialLlave();

    var tamanio = 0.07;

    var rectangulo1 = this.createRect(tamanio);
    var rectangulo2 = this.createRect(tamanio);

    var anillo1 = this.createAnillo(tamanio / 2, tamanio / 6);
    var anillo2 = this.createAnillo(tamanio / 2, tamanio / 6);
    var anillo3 = this.createAnillo(tamanio / 2, tamanio / 6);

    var cuerpo = this.createBase(tamanio);
    var cono = this.createCono(tamanio);

    var detalle1 = this.createAnillo(tamanio / 6, tamanio / 8);
    var detalle2 = this.createAnillo(tamanio / 3.8, tamanio / 10);

    anillo1.rotateX(Math.PI / 2);
    anillo2.rotateX(Math.PI / 2);
    anillo3.rotateX(Math.PI / 2);

    rectangulo1.rotateY(Math.PI / 2);
    rectangulo2.rotateY(Math.PI / 2);

    cuerpo.rotateX(Math.PI / 2);
    cono.rotateX(-Math.PI / 2);

    rectangulo1.translate(0.023, 0, 0.1);
    rectangulo2.translate(0.04, 0, 0.14);

    anillo1.translate(0.04, 0, -0.15);
    anillo2.translate(-0.04, 0, -0.15);
    anillo3.translate(0, 0, -0.22);

    cuerpo.translate(0, 0, -0.12);
    cono.translate(0, 0, -0.12);

    detalle1.translate(0, 0, -0.09);
    detalle2.translate(0, 0, 0.07);

    var evaluador = new CSG.Evaluator();

    var brush_anillo1 = new CSG.Brush(anillo1, this.material);
    var brush_anillo2 = new CSG.Brush(anillo2, this.material);
    var brush_anillo3 = new CSG.Brush(anillo3, this.material);
    var brush_cono = new CSG.Brush(cono, this.material);
    var brush_cuerpo = new CSG.Brush(cuerpo, this.material);
    var brush_rect1 = new CSG.Brush(rectangulo1, this.material);
    var brush_rect2 = new CSG.Brush(rectangulo2, this.material);
    var brush_det1 = new CSG.Brush(detalle1, this.material);
    var brush_det2 = new CSG.Brush(detalle2, this.material);

    var anilloizq_sup = evaluador.evaluate(brush_anillo1, brush_anillo2, CSG.ADDITION);
    var anillos = evaluador.evaluate(anilloizq_sup, brush_anillo3, CSG.ADDITION);
    var anillos_cono = evaluador.evaluate(anillos, brush_cono, CSG.ADDITION);
    var anillos_cuerpo = evaluador.evaluate(anillos_cono, brush_cuerpo, CSG.ADDITION);
    var cuerpo_rect1 = evaluador.evaluate(anillos_cuerpo, brush_rect1, CSG.ADDITION);
    var cuerpo_rect2 = evaluador.evaluate(cuerpo_rect1, brush_rect2, CSG.ADDITION);
    var llave_det1 = evaluador.evaluate(cuerpo_rect2, brush_det1, CSG.ADDITION);
    var llave = evaluador.evaluate(llave_det1, brush_det2, CSG.SUBTRACTION);

    llave.material = this.material;
    llave.userData.root = this;
    llave.userData.type = "LLAVE";
    llave.name = "LLAVE_METAL_ANTIGUO";

    llave.castShadow = true;
    llave.receiveShadow = true;

    if (llave.geometry) {
      llave.geometry.computeVertexNormals();
    }

    this.add(llave);
  }

  createMaterialLlave() {
    const loader = new THREE.TextureLoader();

    const cargarTextura = (nombre) => {
      return loader.load(
        new URL("../textures/llave/" + nombre, import.meta.url).href,
        undefined,
        undefined,
        (error) => {
          console.error("No se pudo cargar la textura de la llave:", nombre, error);
        }
      );
    };

    const texturaColor = cargarTextura("Metal053B_1K-PNG_Color.png");
    const texturaMetalness = cargarTextura("Metal053B_1K-PNG_Metalness.png");
    const texturaNormal = cargarTextura("Metal053B_1K-PNG_NormalDX.png");
    const texturaRoughness = cargarTextura("Metal053B_1K-PNG_Roughness.png");

    const texturas = [
      texturaColor,
      texturaMetalness,
      texturaNormal,
      texturaRoughness
    ];

    texturas.forEach((textura) => {
      textura.wrapS = THREE.RepeatWrapping;
      textura.wrapT = THREE.RepeatWrapping;
      textura.repeat.set(0.45, 0.45);
      textura.minFilter = THREE.LinearMipmapLinearFilter;
      textura.magFilter = THREE.LinearFilter;
    });

    if (THREE.SRGBColorSpace) {
      texturaColor.colorSpace = THREE.SRGBColorSpace;
    }

    return new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: texturaColor,
      metalnessMap: texturaMetalness,
      roughnessMap: texturaRoughness,
      normalMap: texturaNormal,
      metalness: 0.45,
      roughness: 0.68,
      normalScale: new THREE.Vector2(0.18, -0.18),
      emissive: 0x241405,
      emissiveIntensity: 0.08,
      side: THREE.DoubleSide
    });
  }

  createAnillo(radio, tubo) {
    const geometry = new THREE.TorusGeometry(
      radio,
      tubo,
      16,
      100
    );

    return geometry;
  }

  createRect(tama) {
    const shape = this.createShapeRect(tama);

    var options = {
      depth: tama,
      steps: 2,
      bevelEnabled: false
    };

    var geometry = new THREE.ExtrudeGeometry(shape, options);
    geometry.center();

    return geometry;
  }

  createShapeRect(tama) {
    const shape = new THREE.Shape();

    const width = tama / 2;
    const height = tama / 6;

    shape.moveTo(0, 0);
    shape.lineTo(width, 0);
    shape.lineTo(width, height);
    shape.lineTo(0, height);
    shape.lineTo(0, 0);

    return shape;
  }

  createBase(tama) {
    var perfil2D = [];

    perfil2D.push(new THREE.Vector2(0.0, 0.0));
    perfil2D.push(new THREE.Vector2(tama / 5, 0.0));
    perfil2D.push(new THREE.Vector2(tama / 5, tama * 4));
    perfil2D.push(new THREE.Vector2(0.0, tama * 4));

    var geometry = new THREE.LatheGeometry(
      perfil2D,
      24,
      0,
      Math.PI * 2
    );

    return geometry;
  }

  createCono(tama) {
    var perfil2D = [];

    perfil2D.push(new THREE.Vector2(0.0, 0.0));
    perfil2D.push(new THREE.Vector2(tama / 5, 0.0));
    perfil2D.push(new THREE.Vector2(0.0, tama));

    var geometry = new THREE.LatheGeometry(
      perfil2D,
      24,
      0,
      Math.PI * 2
    );

    return geometry;
  }

  update() {
  }
}

export { Llave }