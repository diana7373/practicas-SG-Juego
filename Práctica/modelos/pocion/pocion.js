
import * as THREE from 'three'
import * as CSG from '../../libs/three-bvh-csg.js'
const puntosTapon = [
    new THREE.Vector2(0, 0),       // Inicio fondo centro
    new THREE.Vector2(0.22, 0),    // Base inferior
    new THREE.Vector2(0.25, 0.4),  // Cuello que entra en la botella
    new THREE.Vector2(0.45, 0.45), // Inicio de la expansión de la tapa
    new THREE.Vector2(0.5, 0.6),   // Máximo ancho de la tapa
    new THREE.Vector2(0.35, 0.75), // Curva superior
    new THREE.Vector2(0, 0.8)      // Cierre superior centro
];

class Pocion extends THREE.Object3D {
  constructor(tamanio) {
    super();


    this.material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 1,
      transparent: true,
      opacity: 0.6,

      roughness: 0.1,     
      metalness: 0,

      ior: 1.3,           
      thickness: 0.05,    

      clearcoat: 1,
      clearcoatRoughness: 0.1
    });

    this.material.depthWrite = false;
    this.material.side = THREE.DoubleSide;

    const material_interior = new THREE.MeshPhysicalMaterial({
      color: 0x8bdbfc,     // color base (azul)

      transparent: true,
      opacity: 0.6,        // controla lo “traslúcido”

      roughness: 0.2,      // un poco de difuminado
      metalness: 0,

      transmission: 0.3,   // leve transparencia real (no 1 como vidrio)
      ior: 1.2,            // menor que vidrio

      thickness: 0.02,     // bajo, es líquido

      clearcoat: 0.3,
      clearcoatRoughness: 0.2
    });

    const material_tapon = new THREE.MeshPhysicalMaterial({
      color: 0x654321     // marrón oscuro
    });

    material_interior.side = THREE.DoubleSide;
    material_interior.depthWrite = false;
    var evaluador = new CSG.Evaluator();

    var tubo = this.createTubo(tamanio);
    var tapa = this.createTapa(tamanio);
    tapa.translate(0, -tamanio * 0.1, 0);

    var brushTubo = new CSG.Brush(tubo, this.material);
    var brushTapa = new CSG.Brush(tapa, this.material);
    var resultado = evaluador.evaluate(brushTubo, brushTapa, CSG.ADDITION);

    var escala = 0.9;
    var tubo2 = this.createTubo(tamanio * escala);
    var tapa2 = this.createTapa(tamanio * escala);
    tapa2.translate(0, -tamanio * escala * 0.1, 0);

    var brushTubo2 = new CSG.Brush(tubo2, this.material);
    var brushTapa2 = new CSG.Brush(tapa2, this.material);

    var resultado2 = evaluador.evaluate(brushTubo2, brushTapa2, CSG.ADDITION);
    resultado2.geometry.translate(0, 0.007, 0);
    var resultado3 = evaluador.evaluate(resultado, resultado2, CSG.SUBTRACTION);

    escala = 0.8;
    var tubo3 = this.createTubo(tamanio * escala);
    var tapa3 = this.createTapa(tamanio * escala);
    tapa3.translate(0, -tamanio * escala * 0.1, 0);
    var brushTubo3 = new CSG.Brush(tubo3, material_interior);
    var brushTapa3 = new CSG.Brush(tapa3, material_interior);
    var resultado4 = evaluador.evaluate(brushTubo3, brushTapa3, CSG.ADDITION);

    var anillo_superior = this.createAnillo(tamanio * 0.9);
    anillo_superior.rotateX(Math.PI / 2);
    anillo_superior.translate(0, tamanio * 0.1, 0);
    var brushAnillo = new CSG.Brush(anillo_superior, this.material);
    resultado3 = evaluador.evaluate(resultado3, brushAnillo, CSG.ADDITION);

    var tapon = this.createTapon(tamanio);
    tapon.translate(0, tamanio * 0.086, 0);
    var brushTapon = new CSG.Brush(tapon, material_tapon);
    resultado3 = evaluador.evaluate(resultado3, brushTapon, CSG.ADDITION);

    this.add(resultado3)
    this.add(resultado4)
    resultado3.renderOrder = 1; // El vidrio se dibuja encima
    resultado4.renderOrder = 2; // El líquido se dibuja primero
  }

  createTubo(tama) {
    var tubo = new THREE.CylinderGeometry(
      tama * 0.02, //radio arriba
      tama * 0.02, //radio abajo
      tama * 0.2, //altura
      32 //segmentos
    );
    return tubo;
  }


  createTapa(tama) {
    var tapa = new THREE.SphereGeometry(tama * 0.02, 32, 32);
    return tapa;
  }

  createAnillo(tama){
    var anillo = new THREE.TorusGeometry(tama * 0.02, tama * 0.005, 16, 100);
    return anillo
  }

  createTapon(tama) {
    var tapon = new THREE.LatheGeometry(puntosTapon, 32);
    tapon.scale(tama * 0.05, tama * 0.05, tama * 0.05);
    return tapon;
  
  }

  update() {
    // No hay nada que actualizar ya que la apertura de la grapadora se ha actualizado desde la interfaz
  }
}

export { Pocion }
