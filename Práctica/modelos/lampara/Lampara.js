import * as THREE from 'three'
import { GLTFLoader } from '../../libs/GLTFLoader.js' // Ajusta la ruta a tu carpeta libs si es necesario

class Lampara extends THREE.Object3D {
  
  constructor() {
    super();

    // Marcamos el tipo en userData por si necesitas identificarlo en el futuro
    this.userData = { type: "LAMPARA", root: this };
    this.name = "lampara";

    // Instanciamos el cargador de GLTF/GLB
    const loader = new GLTFLoader();

    // Cargamos el archivo .glb o .gltf
    loader.load(
      '../modelos/lampara/cage_lamp.glb', // <-- Coloca aquí la ruta exacta a tu archivo de la lámpara
      (gltf) => {
        const modelo = gltf.scene;

        // Configuración de sombras y materiales para todo el modelo
        modelo.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Si el modelo se ve muy oscuro, puedes descomentar la siguiente línea:
            // if (child.material) child.material.roughness = 0.6;
          }
        });

        // Añadimos el modelo cargado al nodo principal (this) de la clase
        this.add(modelo);
        
        console.log("Modelo de Lámpara cargado correctamente.");
      },
      (xhr) => {
        // Progreso de carga opcional
        // console.log((xhr.loaded / xhr.total * 100) + '% cargado');
      },
      (error) => {
        console.error("Error al cargar el modelo de la lámpara:", error);
      }
    );
  }
}

export { Lampara }