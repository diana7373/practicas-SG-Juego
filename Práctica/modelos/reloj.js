
import * as THREE from 'three'
import * as CSG from '../libs/three-bvh-csg.js'

import { FontLoader } from '../libs/FontLoader.js';
import { TextGeometry } from '../libs/TextGeometry.js';

class Reloj extends THREE.Object3D {
  constructor(tamanio) {
    super();

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

    var materialFondo = new THREE.MeshStandardMaterial({ color: 0xffffff });

    var materialAguja = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.4,
      metalness: 0.3
    });

    var materialNumeros = new THREE.MeshStandardMaterial({ color: 0x000000 });

    // El material se usa desde varios métodos. Por eso se alamacena en un atributo
    this.material = new THREE.MeshStandardMaterial({ color: 0xA9A9A9 });
    this.evaluador = new CSG.Evaluator();

    var base = this.createBase(tamanio) //hacerlo con tama pero por ahora asi para probar
    var tapa = this.createTapa(tamanio);
    tapa.geometry.translate(-0.86, -0.2, 0);
    
    var punto_rotacion_tapa_z = new THREE.Group();
    punto_rotacion_tapa_z.add(tapa);
    punto_rotacion_tapa_z.position.set(0.86, 0.2, 0);
    punto_rotacion_tapa_z.rotation.z = -Math.PI / 2; // Girar para que la tapa quede en la posición correcta

    var cilindro = this.createCilindroBoton(tamanio);
    var fondo = this.createFondo(tamanio, materialFondo);
    fondo.geometry.translate(0, 0.01, 0);
    var boton = this.createBoton(tamanio);
    var vidrio = this.createFondo(tamanio, materialVidrio);
    vidrio.geometry.translate(0, 0.2, 0);

    this.aguja = this.createAguja(tamanio, materialAguja);
    this.aguja.position.set(0, 0, -0.098);
    this.punto_rotacion_aguja = new THREE.Group();
    this.punto_rotacion_aguja.add(this.aguja);
    this.punto_rotacion_aguja.position.set(0, 0.02, 0.098);

    var numeros = this.createNumerosRomanos(tamanio, materialNumeros);

    this.add(base);
    this.add(fondo);
    this.add(cilindro);
    this.add(boton);
    this.add(punto_rotacion_tapa_z);
    this.add(vidrio);
    this.add(this.punto_rotacion_aguja);
    this.add(numeros);
  }



  createBase(tamanio) {
    const evaluator = new CSG.Evaluator()
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
    var result = evaluator.evaluate(ovalo, caja, CSG.SUBTRACTION);

    var cylinderGeometry = new THREE.CylinderGeometry(tamanio * 0.8, tamanio * 0.8, tamanio, 32);
    cylinderGeometry.translate(0, 0.5, 0);
    var cilindro = new CSG.Brush(cylinderGeometry, this.material);
    var nuevores = evaluator.evaluate(result, cilindro, CSG.SUBTRACTION);

    return nuevores;
  }


  createAguja(tama, material) {

    const shape = new THREE.Shape();

    const largo = tama * 0.6;
    const anchoBase = tama * 0.05;
    const anchoCentro = tama * 0.02;

    shape.moveTo(-anchoBase, 0);
    shape.lineTo(-anchoCentro, largo * 0.4);
    shape.lineTo(0, largo);              // punta
    shape.lineTo(anchoCentro, largo * 0.4);
    shape.lineTo(anchoBase, 0);
    shape.lineTo(0, -tama * 0.05);       // pequeña cola
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

    var result = evaluator.evaluate(ovalo, caja, CSG.INTERSECTION);
    return result;
  }

  createCilindroBoton(tama) {
    // Se crea la parte móvil
    var perfil2D = [];
    perfil2D.push(new THREE.Vector2(0.0, 0.0));
    perfil2D.push(new THREE.Vector2(tama / 7, 0.0));
    perfil2D.push(new THREE.Vector2(tama / 7, tama / 5));
    perfil2D.push(new THREE.Vector2(0.0, tama / 5));

    var geometry = new THREE.LatheGeometry(perfil2D, 24, 0, Math.PI * 2);

    geometry.rotateZ(-Math.PI / 2);
    geometry.translate(-tama * 1.15, 0, 0);

    var cilindro = new CSG.Brush(geometry, this.material);

    return cilindro;
  }

  createFondo(tama, material) {
    var geometry = new THREE.CircleGeometry(tama * 0.8, 32); // radio, segmentos

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

      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
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

    loader.load('fonts/helvetiker_regular.typeface.json', (font) => {
        // 1. Array completo para evitar errores de geometría "undefined"
        const numeros = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
        
        // Radio donde se posicionan (un poco hacia adentro)
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

            geometry.center(); // Centra el número en su propio eje

            const mesh = new THREE.Mesh(geometry, material);

            // 2. Posicionamiento circular (XII arriba)
            const angle = (i / 12) * Math.PI * 2 - Math.PI;
            const x = Math.cos(angle) * radio;
            const z = Math.sin(angle) * radio;

            mesh.position.set(x, 0.021, z); // 0.021 para que no parpadee con el fondo

            // 3. Rotación para que queden "acostados" sobre el reloj
            // Giramos 90 grados en el eje X para que miren hacia arriba
            mesh.rotation.x = -Math.PI / 2;
            mesh.rotation.z = Math.PI / 2;

            grupo.add(mesh);
        }
    });

    return grupo;
}



  update() {
    if (this.aguja) {
      this.aguja.rotation.y -= 0.01; 
    }
  }
}

export { Reloj }
