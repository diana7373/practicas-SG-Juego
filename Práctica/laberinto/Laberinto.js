import * as THREE from 'three'
import { Reloj } from '../modelos/reloj/reloj.js'
import { Pocion } from '../modelos/pocion/pocion.js'
import { Hueso } from '../modelos/hueso/hueso.js'
import { Llave } from '../modelos/llave/llave.js'
import { Puerta } from '../modelos/puerta/Puerta.js'


class Laberinto extends THREE.Object3D {

  static WALL = "X";
  static FREE = " ";
  static RELOJ = "R";
  static POCION = "P";
  static HUESO = "H";
  static LLAVE = "L";
  static PUERTA = "S";
  static objetos = [];

  constructor(archivo, sincronizacion = null) {
    //material
    // Dentro de tu constructor o como método aparte
    const loaderTextura = new THREE.TextureLoader();

    // Cargamos las texturas (puedes añadir el truco del ?v=1 para el caché aquí también)
    const baseColor = loaderTextura.load('texturas/catacumba/catacumba_color.jpg');
    baseColor.colorSpace = THREE.SRGBColorSpace; // <-- ¡Esta es la clave!
    const normalMap = loaderTextura.load('texturas/catacumba/catacumba_normal.jpg');
    const roughnessMap = loaderTextura.load('texturas/catacumba/catacumba_r.jpg');
    const aoMap = loaderTextura.load('texturas/catacumba/catacumba_ao.jpg');
    const dispMap = loaderTextura.load('texturas/catacumba/catacumba_h.jpg');

    const bloqueMat = new THREE.MeshStandardMaterial({
      map: baseColor,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
      roughness: 1.0,          // Se recomienda 1 cuando usas roughnessMap
      aoMap: aoMap,            // Oclusión Ambiental (sombras en grietas)
      aoMapIntensity: 1.0,     // Fuerza de las sombras de oclusión
      displacementMap: dispMap, // Relieve real (mueve los vértices)
      displacementScale: 0.05, // ¡OJO! Un valor pequeño (0.05 - 0.1) o el bloque explotará
    });

    super();

    // Medidas de un bloque
    this.anchoBloque = 3;
    this.altoBloque = 3;

    // 3. Ajuste crucial en la Geometría
    // Para que el DisplacementMap funcione, la caja necesita muchos segmentos.
    // Si pones (1,1,1) no habrá vértices suficientes para deformar.
    const bloqueGeo = new THREE.BoxGeometry(
      this.anchoBloque, this.altoBloque, this.anchoBloque,
      32, 32, 32 // Añadimos segmentos para el relieve
    );

    // IMPORTANTE: Para que el AO (Ambient Occlusion) funcione en Three.js, 
    // la geometría necesita un segundo set de coordenadas UV (uv2)
    bloqueGeo.setAttribute('uv2', new THREE.Float32BufferAttribute(bloqueGeo.attributes.uv.array, 2));

    bloqueGeo.translate(0, this.altoBloque / 2, 0);


    // La geometría compartida de un bloque
    //const bloqueGeo = new THREE.BoxGeometry (this.anchoBloque, this.altoBloque, this.anchoBloque);
    // Para que el sistema de referencia esté en la base
    //bloqueGeo.translate (0, this.altoBloque/2, 0);
    // El material compartido que vayáis a usar
    //const bloqueMat = new THREE.MeshNormalMaterial();

    // Leemos el archivo, lo pasamos a un vector de string y lo procesamos 
    // para ir creando y añadiendo los bloques
    const loader = new THREE.FileLoader();
    loader.load(archivo, (file) => {
      console.log("Contenido real del archivo cargado:\n", file);
      const laberintoMatriz = file.split(/\r?\n/);
      laberintoMatriz.pop(); // La última fila está vacía
      this.xNumBloques = laberintoMatriz[0].length;
      this.zNumBloques = laberintoMatriz.length;
      var unBloque;
      this.existeReloj = false;
      for (let fila = 0; fila < this.zNumBloques; fila++) {
        for (let columna = 0; columna < this.xNumBloques; columna++) {
          switch (laberintoMatriz[fila][columna]) {
            case Laberinto.WALL:
              // Creamos dos bloques, uno sobre otro
              for (let i = 0; i < 2; i++) {
                const unBloque = new THREE.Mesh(bloqueGeo, bloqueMat);

                // Ajustamos la posición
                unBloque.position.set(
                  columna * this.anchoBloque,
                  i * this.altoBloque, // El primero en 0, el segundo en 4.0
                  fila * this.anchoBloque
                );

                // Activamos sombras para que el laberinto se vea aterrador
                unBloque.castShadow = true;
                unBloque.receiveShadow = true;

                this.add(unBloque);
              }
              break;
              
            case Laberinto.RELOJ:

              this.reloj = new Reloj(1);
              this.existeReloj = true;
              this.reloj.scale.set(0.2, 0.2, 0.2);
              this.reloj.position.set(columna * this.anchoBloque, 0.5, fila * this.anchoBloque);
              Laberinto.objetos.push(this.reloj);
              this.add(this.reloj);

              const luzReloj = new THREE.PointLight(0x00bfff, 3, 1.5);
              luzReloj.position.set(columna * this.anchoBloque, 0.6, fila * this.anchoBloque);
              this.add(luzReloj)

              this.reloj.luzAsociada = luzReloj;

              break;
            case Laberinto.POCION:

              this.pocion = new Pocion(1);
              this.pocion.scale.set(0.9, 0.9, 0.9);
              this.pocion.position.set(columna * this.anchoBloque, 0.5, fila * this.anchoBloque);
              Laberinto.objetos.push(this.pocion);
              this.add(this.pocion);

              const luzPocion = new THREE.PointLight(0xd400ff, 3, 1.5);
              luzPocion.position.set(columna * this.anchoBloque, 0.6, fila * this.anchoBloque);
              this.add(luzPocion);

              this.pocion.luzAsociada = luzPocion;

              break;

            case Laberinto.HUESO:

              this.hueso = new Hueso(1);
              this.hueso.scale.set(0.1, 0.1, 0.1);
              this.hueso.position.set(columna * this.anchoBloque, 0.5, fila * this.anchoBloque);
              Laberinto.objetos.push(this.hueso);
              this.add(this.hueso);
              break;
            case Laberinto.LLAVE:

              this.llave = new Llave(1);
              this.llave.scale.set(0.5, 0.5, 0.5);
              this.llave.position.set(columna * this.anchoBloque, 0.1, fila * this.anchoBloque);
              Laberinto.objetos.push(this.llave);
              this.add(this.llave);

              const luzLlave = new THREE.PointLight(0xffd700, 1, 4);
              luzLlave.position.set(columna * this.anchoBloque, 0.2, fila * this.anchoBloque);
              this.add(luzLlave);

              this.llave.luzAsociada = luzLlave;

              break;

            case Laberinto.PUERTA:

            this.puerta = new Puerta();

            this.puerta.scale.set(1,1,1);
            this.puerta.position.set(columna * this.anchoBloque, 2.2, fila * this.anchoBloque);
            this.puerta.rotation.set(0,0,0);

            // IMPORTANTE: usar sistema del laberinto
            this.getMundoFromCelda(fila, columna, this.puerta.position);

            this.add(this.puerta);

            Laberinto.objetos.push(this.puerta); 

            // (Color anaranjado/rojizo: 0xff5500, Intensidad: 10, Distancia: 8)
            this.luzPuerta = new THREE.PointLight(0xff5500, 10, 8);
            // La colocamos en las mismas coordenadas X y Z que la puerta, pero más arriba (Y = 4.5)
            this.luzPuerta.position.set(columna * this.anchoBloque, 3, fila * this.anchoBloque);
            this.add(this.luzPuerta);

            this.tiempoParpadeo = 0;

            break;
          }
        }
      }
      // Para centrar el laberinto completo con respecto al sistema de coordenadas
      const desfaseX = (this.xNumBloques - 1) / 2 * this.anchoBloque;
      const desfaseZ = (this.zNumBloques - 1) / 2 * this.anchoBloque;
      this.position.x = -desfaseX;
      this.position.z = -desfaseZ;
      if (sincronizacion)
        sincronizacion.resolve();
    });
  }

  getMundoFromCelda(fila, columna, salida) {
    // Se asume que los datos de entrada son correctos
    // Salida es un Vector3, igual que el atributo  position  de un Mesh
    salida.x = columna * this.anchoBloque + this.position.x;
    salida.z = fila * this.anchoBloque + this.position.z;
  }

  update(delta) {
    if (this.existeReloj) {
      this.reloj.update(delta);
    }
    if (this.puerta) {
      this.puerta.update?.(delta);
    }
    if (this.luzPuerta) {
      // Sumamos el tiempo que ha pasado desde el último frame
      this.tiempoParpadeo += delta;

      // Solo cambiamos la intensidad de la luz cada 0.15 segundos
      // Puedes subir este número (ej. 0.3) para que sea aún más lento
      if (this.tiempoParpadeo > 0.15) {
        
        // Un 70% de las veces la luz estará fuerte, un 30% pegará un bajón casi apagándose
        if (Math.random() > 0.3) {
          // Luz fuerte normal (entre 15 y 25)
          this.luzPuerta.intensity = 5 + Math.random() * 10; 
        } else {
          // Bajón de luz tenebroso (casi apagada, entre 0 y 5)
          this.luzPuerta.intensity = Math.random() * 5;
        }

        // Reseteamos el temporizador para que espere otros 0.15 segundos
        this.tiempoParpadeo = 0;
      }
    }
  }
}

export { Laberinto }
