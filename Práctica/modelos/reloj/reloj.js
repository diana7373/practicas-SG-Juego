import * as THREE from 'three'
import * as CSG from '../../libs/three-bvh-csg.js'

import { FontLoader } from '../../libs/FontLoader.js';
import { TextGeometry } from '../../libs/TextGeometry.js';

class Reloj extends THREE.Object3D {
  constructor(tamanio) {
    super();

    this.anguloMin = THREE.MathUtils.degToRad(0);
    this.anguloMax = THREE.MathUtils.degToRad(-120);
    this.orientacion = 1;
    this.angulo = 0;

    var materialVidrio = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 1,
      transparent: true,
      opacity: 0.4,
      roughness: 0.3,
      metalness: 0,
      ior: 1.3,
      thickness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.1
    });

    var materialFondo = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.8,
      metalness: 0.05,
      side: THREE.DoubleSide
    });

    var materialAguja = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.4,
      metalness: 0.3,
      side: THREE.DoubleSide
    });

    var materialNumeros = new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 0.5,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    this.material = this.createMaterialMetalReloj();
    this.evaluador = new CSG.Evaluator();

    var base = this.createBase(tamanio);
    this.tapa = this.createTapa(tamanio);

    var punto_rotacion_tapa_z = new THREE.Group();
    punto_rotacion_tapa_z.add(this.tapa);
    punto_rotacion_tapa_z.position.set(0.86, 0.2, 0);

    var cilindro = this.createCilindroBoton(tamanio);

    var fondo = this.createFondo(tamanio, materialFondo);
    fondo.geometry.translate(0, 0.01, 0);

    var boton = this.createBoton(tamanio);

    var vidrio = this.createFondo(tamanio, materialVidrio);
    vidrio.geometry.translate(0, 0.2, 0);

    this.aguja = this.createAguja(tamanio, materialAguja);

    this.punto_rotacion_aguja = new THREE.Group();
    this.punto_rotacion_aguja.add(this.aguja);
    this.punto_rotacion_aguja.position.set(0, 0.02, 0);

    var numeros = this.createNumerosRomanos(tamanio, materialNumeros);

    base.userData.root = this;
    fondo.userData.root = this;
    cilindro.userData.root = this;
    boton.userData.root = this;
    vidrio.userData.root = this;
    numeros.userData.root = this;
    this.tapa.userData.root = this;
    this.aguja.userData.root = this;

    base.userData.type = "RELOJ";
    fondo.userData.type = "RELOJ";
    cilindro.userData.type = "RELOJ";
    boton.userData.type = "RELOJ";
    vidrio.userData.type = "RELOJ";
    numeros.userData.type = "RELOJ";
    this.tapa.userData.type = "RELOJ";
    this.aguja.userData.type = "RELOJ";

    base.castShadow = true;
    base.receiveShadow = true;

    fondo.castShadow = true;
    fondo.receiveShadow = true;

    cilindro.castShadow = true;
    cilindro.receiveShadow = true;

    boton.castShadow = true;
    boton.receiveShadow = true;

    vidrio.castShadow = false;
    vidrio.receiveShadow = false;

    this.tapa.castShadow = true;
    this.tapa.receiveShadow = true;

    this.aguja.castShadow = true;
    this.aguja.receiveShadow = true;

    this.add(base);
    this.add(fondo);
    this.add(cilindro);
    this.add(boton);
    this.add(punto_rotacion_tapa_z);
    this.add(vidrio);
    this.add(this.punto_rotacion_aguja);
    this.add(numeros);

    this.rotation.z = -Math.PI / 2;
  }

  createMaterialMetalReloj() {
    const loader = new THREE.TextureLoader();

    const cargarTextura = (nombre) => {
      return loader.load(
        new URL("../textures/llave/" + nombre, import.meta.url).href,
        undefined,
        undefined,
        (error) => {
          console.error("No se pudo cargar la textura del reloj:", nombre, error);
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
      textura.repeat.set(0.25, 0.25);
      textura.minFilter = THREE.LinearMipmapLinearFilter;
      textura.magFilter = THREE.LinearFilter;
    });

    if (THREE.SRGBColorSpace) {
      texturaColor.colorSpace = THREE.SRGBColorSpace;
    }

    return new THREE.MeshStandardMaterial({
      color: 0xd8d2c2,
      map: texturaColor,
      metalnessMap: texturaMetalness,
      roughnessMap: texturaRoughness,
      normalMap: texturaNormal,
      metalness: 0.28,
      roughness: 0.48,
      normalScale: new THREE.Vector2(0.12, -0.12),
      emissive: 0x2f2b24,
      emissiveIntensity: 0.12,
      side: THREE.DoubleSide
    });
  }

  createBase(tamanio) {
    const evaluator = new CSG.Evaluator();

    var geometry = new THREE.SphereGeometry(tamanio, 64, 64);
    geometry.scale(1, 0.4, 1);

    var ovalo = new CSG.Brush(geometry, this.material);

    var boxGeometry = new THREE.BoxGeometry(
      tamanio * 2,
      tamanio * 1.5,
      tamanio * 2
    );

    boxGeometry.translate(0, 0.95, 0);

    var caja = new CSG.Brush(boxGeometry, this.material);

    var result = evaluator.evaluate(
      ovalo,
      caja,
      CSG.SUBTRACTION
    );

    var cylinderGeometry = new THREE.CylinderGeometry(
      tamanio * 0.8,
      tamanio * 0.8,
      tamanio,
      32
    );

    cylinderGeometry.translate(0, 0.5, 0);

    var cilindro = new CSG.Brush(cylinderGeometry, this.material);

    var nuevores = evaluator.evaluate(
      result,
      cilindro,
      CSG.SUBTRACTION
    );

    nuevores.material = this.material;

    if (nuevores.geometry) {
      nuevores.geometry.computeVertexNormals();
    }

    return nuevores;
  }

  createAguja(tama, material) {
    const shape = new THREE.Shape();

    const largo = tama * 0.6;
    const anchoBase = tama * 0.05;
    const anchoCentro = tama * 0.02;

    shape.moveTo(-anchoBase, 0);
    shape.lineTo(-anchoCentro, largo * 0.4);
    shape.lineTo(0, largo);
    shape.lineTo(anchoCentro, largo * 0.4);
    shape.lineTo(anchoBase, 0);
    shape.lineTo(0, -tama * 0.05);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: tama * 0.02,
      bevelEnabled: false
    });

    geometry.rotateX(-Math.PI / 2);

    const aguja = new CSG.Brush(geometry, material);

    return aguja;
  }

  createTapa(tama) {
    var geometry = new THREE.SphereGeometry(tama, 64, 64);
    geometry.scale(1, 0.4, 1);

    var ovalo = new CSG.Brush(geometry, this.material);

    var boxGeometry = new THREE.BoxGeometry(
      tama * 2,
      tama * 1.5,
      tama * 2
    );

    boxGeometry.translate(0, 0.95, 0);

    var caja = new CSG.Brush(boxGeometry, this.material);

    const evaluator = new CSG.Evaluator();

    var result = evaluator.evaluate(
      ovalo,
      caja,
      CSG.INTERSECTION
    );

    result.geometry.translate(-0.86, -0.2, 0);
    result.material = this.material;

    if (result.geometry) {
      result.geometry.computeVertexNormals();
    }

    return result;
  }

  createCilindroBoton(tama) {
    var perfil2D = [];

    perfil2D.push(new THREE.Vector2(0.0, 0.0));
    perfil2D.push(new THREE.Vector2(tama / 7, 0.0));
    perfil2D.push(new THREE.Vector2(tama / 7, tama / 5));
    perfil2D.push(new THREE.Vector2(0.0, tama / 5));

    var geometry = new THREE.LatheGeometry(
      perfil2D,
      24,
      0,
      Math.PI * 2
    );

    geometry.rotateZ(-Math.PI / 2);
    geometry.translate(-tama * 1.15, 0, 0);

    var cilindro = new CSG.Brush(geometry, this.material);

    return cilindro;
  }

  createFondo(tama, material) {
    var geometry = new THREE.CircleGeometry(tama * 0.8, 32);
    geometry.rotateX(-Math.PI / 2);

    var fondo = new CSG.Brush(geometry, material);

    return fondo;
  }

  createBoton(tama) {
    const shape = new THREE.Shape();

    const spikes = 20;
    const r1 = tama / 6;
    const r2 = r1 * 1.2;

    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i / (spikes * 2)) * Math.PI * 2;
      const r = i % 2 === 0 ? r2 : r1;

      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;

      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }

    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: tama / 5,
      bevelEnabled: true,
      bevelSize: 0.02,
      bevelThickness: 0.02
    });

    geometry.rotateY(-Math.PI / 2);
    geometry.translate(-tama * 1.15, 0, 0);

    var boton = new CSG.Brush(geometry, this.material);

    return boton;
  }

  createNumerosRomanos(tama, material) {
    const grupo = new THREE.Object3D();
    const loader = new FontLoader();

    const fontUrl = new URL(
      '../../fonts/helvetiker_regular.typeface.json',
      import.meta.url
    ).href;

    loader.load(
      fontUrl,

      (font) => {
        const numeros = [
          'XII', 'I', 'II', 'III',
          'IV', 'V', 'VI', 'VII',
          'VIII', 'IX', 'X', 'XI'
        ];

        const radio = tama * 0.7;

        for (let i = 0; i < 12; i++) {
          const texto = numeros[i];

          const geometry = new TextGeometry(texto, {
            font: font,
            size: tama * 0.08,
            depth: tama * 0.01,
            curveSegments: 4,
            bevelEnabled: false
          });

          geometry.center();

          const mesh = new THREE.Mesh(geometry, material);

          const angle = (i / 12) * Math.PI * 2 - Math.PI;
          const x = Math.cos(angle) * radio;
          const z = Math.sin(angle) * radio;

          mesh.position.set(x, 0.021, z);

          mesh.rotation.x = -Math.PI / 2;
          mesh.rotation.z = Math.PI / 2;

          mesh.userData.root = this;
          mesh.userData.type = "RELOJ";

          mesh.castShadow = true;
          mesh.receiveShadow = true;

          grupo.add(mesh);
        }
      },

      undefined,

      (error) => {
        console.error('No se pudo cargar la fuente del reloj:', fontUrl, error);
      }
    );

    return grupo;
  }

  update() {
    if (this.aguja) {
      this.aguja.rotation.y -= 0.01;
    }

    if (this.tapa) {
      this.angulo -= 0.008 * this.orientacion;

      if (this.angulo <= this.anguloMax) {
        this.angulo = this.anguloMax;
        this.orientacion = -1;
      } else if (this.angulo >= this.anguloMin) {
        this.angulo = this.anguloMin;
        this.orientacion = 1;
      }

      this.tapa.rotation.z = this.angulo;
    }

    this.rotation.y += 0.005;
  }
}

export { Reloj }