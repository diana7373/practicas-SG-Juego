
import * as THREE from 'three'
import * as CSG from '../libs/three-bvh-csg.js'

class Reloj extends THREE.Object3D {
  constructor(tamanio) {
    super();
    // El material se usa desde varios métodos. Por eso se alamacena en un atributo
    this.material = new THREE.MeshStandardMaterial({ color: 0xA9A9A9 });
    this.evaluador = new CSG.Evaluator();

    var base = this.createBase(tamanio) //hacerlo con tama pero por ahora asi para probar
    var tapa = this.createTapa(tamanio);
    var cilindro = this.createCilindroBoton(tamanio);
    var fondo = this.createFondo(tamanio);
    var boton = this.createBoton(tamanio);

    //tapa.geometry.translate(0, 0, 1); // posicionar la tapa sobre la base
    //this.add(tapa);

    this.add(base);
    this.add(fondo);
    this.add(cilindro);
    this.add(boton);
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


  createAguja(tama) {
    // Se crea la parte móvil
    var aguja = new THREE.Object3D();
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

  // 🔥 ESTE ES EL RESULTADO FINAL DE LA TAPA
  var tapaMesh = result;

  // 🔥 CREAR PIVOTE
  var pivote = new THREE.Object3D();

  // 🔥 Mover la tapa para que el borde coincida con el pivote
  // (esto es lo importante)
  tapaMesh.geometry.translate(-tama-0.12, -0.22, 0);

  // Añadir tapa al pivote
  pivote.add(tapaMesh);

  // 🔥 Colocar pivote en el lateral del reloj (bisagra)
  pivote.position.set(tama, 0, 0);

  // 🔥 Rotación correcta tipo tapa de reloj
  pivote.rotation.z = -Math.PI / 3;

  this.tapaPivote = pivote;

  this.add(pivote);
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
    geometry.translate(-tama*1.15, 0, 0);

    var cilindro = new CSG.Brush(geometry, this.material);

    return cilindro;
  }

  createFondo(tama) {
    var geometry = new THREE.CircleGeometry(tama*0.8, 32); // radio, segmentos

    var materialFondo = new THREE.MeshStandardMaterial({ color: 0xF7F6F2 });

    geometry.rotateX(-Math.PI / 2);

    var fondo = new CSG.Brush(geometry, materialFondo);

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

    var boton = new CSG.Brush(geometry, this.material);

    return boton;
  }



  update() {
    // No hay nada que actualizar ya que la apertura de la grapadora se ha actualizado desde la interfaz
  }
}

export { Reloj }
