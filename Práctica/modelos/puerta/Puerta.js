import * as THREE from 'three'
import { GLTFLoader } from '../../libs/GLTFLoader.js'

class Puerta extends THREE.Object3D {

  constructor() {
    super();

    this.abierta = false;
    this.animando = false;

    const loader = new GLTFLoader();

    loader.load(
      '../modelos/puerta/metal_gate.glb',

      (gltf) => {

        this.modelo = gltf.scene;

        this.modelo.scale.set(1,1,1);

        this.modelo.traverse((obj) => {
          if (obj.isMesh) {
            // Si el material tiene transmisión, suele causar el bucle con las sombras
            if (obj.material && obj.material.transmission > 0) {
              obj.material.transmission = 0; // Desactivar la transmisión soluciona el bucle
              // obj.receiveShadow = false; // Alternativa: quitar la sombra si quieres mantener la transmisión
            } else {
              obj.receiveShadow = true;
            }
            
            obj.castShadow = true;
            obj.userData.type = "PUERTA";
            obj.userData.root = this;
            obj.userData.bloquea = true;
            obj.userData.abierta = false;
          }
        });

        this.add(this.modelo);

        this.pomo = this.crearPomo();
        this.add(this.pomo);
      }
    );
  }

  crearPomo() {
    const pomo = new THREE.Object3D();

    const material = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.8,
      roughness: 0.3
    });

    const esferaGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const esfera = new THREE.Mesh(esferaGeo, material);
    esfera.castShadow = true;
    esfera.receiveShadow = true;
    // Asignamos el userData a la malla
    esfera.userData.type = "POMO";
    esfera.userData.root = this;

    const cuelloGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.1, 12);
    const cuello = new THREE.Mesh(cuelloGeo, material);
    cuello.position.y = -0.1;
    cuello.castShadow = true;
    // Asignamos el userData a la malla
    cuello.userData.type = "POMO";
    cuello.userData.root = this;

    pomo.add(esfera);
    pomo.add(cuello);

    pomo.position.set(1, -0.5, -0.2);
    pomo.rotation.x = -Math.PI / 2;
    pomo.scale.set(1.5, 1.5, 1.5);

    return pomo;
  }

 abrir() {
    if (!this.abierta) {
      this.animando = true;
    }
  }

  update(delta) {

  if (this.animando) {

      this.position.y += delta * 2; // velocidad de subida

      if (this.position.y >= 5) { // ajusta altura de “salida”

        this.position.y = 5;

        this.animando = false;
        this.abierta = true;
      }
    }
  }
}

export { Puerta }
