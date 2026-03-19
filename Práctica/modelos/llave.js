
import * as THREE from 'three'
import * as CSG from '../libs/three-bvh-csg.js'

class Llave extends THREE.Object3D {
  constructor(tamanio) {
    super();
    
    
    // El material se usa desde varios métodos. Por eso se alamacena en un atributo
    this.material = new THREE.MeshStandardMaterial({color: 0xD9D9D9});
    
    var tamanio = 0.07;   // 15 cm de largo. Las unidades son metros

    //añadir aqui los metodos que crean la llave
    var rectangulo1 = this.createRect(tamanio);
    var rectangulo2 = this.createRect(tamanio);

    var anillo = this.createAnillo(tamanio/1.4,tamanio/4);

    var cuerpo = this.createBase(tamanio);

    //rotaciones
    anillo.rotation.x = Math.PI / 2;

    rectangulo1.rotation.y = Math.PI / 2;
    rectangulo2.rotation.y = Math.PI / 2;

    cuerpo.rotation.x = Math.PI / 2;

    //posiciones
    //rectangulo1.position.set(0, 0, 0);
    rectangulo1.position.set(0.023, 0, 0.04);
    rectangulo2.position.set(0.04, 0, 0.088);

    anillo.position.set(0, 0, -0.2);

    cuerpo.position.set(0, 0, -0.14)

    //arbol
    this.add(rectangulo1);
    this.add(rectangulo2);
    this.add(anillo);
    this.add(cuerpo);

  }
  
  createAnillo(radio, tubo) {
    // el donut
    const geometry = new THREE.TorusGeometry(
      radio,   
      tubo,    
      16,      // segmentos del tubo
      100      // segmentos del anillo
    );

    const donut = new THREE.Mesh(geometry, this.material);

    return donut;
  }
  
  
  createRect (tama) {
    const shape = this.createShapeRect(tama);

    var options = {
      depth: tama,
      steps: 2,
      bevelEnabled: false
    };

    var geometry = new THREE.ExtrudeGeometry(shape, options);

    geometry.center();

    const rectangulo = new THREE.Mesh(geometry, this.material);

    return rectangulo;
  }

  createShapeRect(tama){
    const shape = new THREE.Shape();

    const width = tama/2;
    const height = tama / 6;

    shape.moveTo(0, 0);
    shape.lineTo(width, 0);
    shape.lineTo(width, height);
    shape.lineTo(0, height);
    shape.lineTo(0, 0);

    return shape;
  }

  createBase(tama){
    var perfil2D = [];
    perfil2D.push(new THREE.Vector2(0.0,0.0));
    perfil2D.push(new THREE.Vector2(tama/5,0.0));
    perfil2D.push(new THREE.Vector2(tama/5, tama*3.5));
    perfil2D.push(new THREE.Vector2(0.0,tama*3.5));
    
    var geometry= new THREE.LatheGeometry(perfil2D, 24,0,Math.PI * 2);

    const base = new THREE.Mesh(geometry, this.material);
    
    return base;
  }
  
  
  update () {
    // No hay nada que actualizar ya que la apertura de la grapadora se ha actualizado desde la interfaz
  }
}

export { Llave }
