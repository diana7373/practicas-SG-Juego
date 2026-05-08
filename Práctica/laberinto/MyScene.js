//Falta hacer los limites de las paredes con un raycaster para que no se pueda atravesar las paredes
//Falta hacer la interaccion con los pickups de manera que con el rayo se recojan y una GUI que los muestre
//Falta hacer una puerta y animarla cuando uses la lleve
//Falta que cuando cojas la llave se te ponga en la mano
//Falta poner materiales y texturas a los pickups
//Falta hacer que no vaya tan lag el laberinto y hacer distintos tipos de paredes y suelos
//Faltaria hacer una GUI con un contador y la funcionalidad del pickup
//Falta el arbol del pickup reloj
//Falta un menu de pausa con opciones de reiniciar, salir, etc


// Clases de la biblioteca

import * as THREE from 'three'
import { GUI } from 'gui'
import { PointerLockControls } from '../libs/PointerLockControls.js'

// Clases de mi proyecto

import { Laberinto } from './Laberinto.js'
import { Reloj } from '../modelos/reloj/reloj.js'
import { FontLoader } from '../libs/FontLoader.js';
import { TextGeometry } from '../libs/TextGeometry.js';


/// La clase fachada del modelo
/**
 * Usaremos una clase derivada de la clase Scene de Three.js para llevar el control de la escena y de todo lo que ocurre en ella.
 */

class MyScene extends THREE.Scene {
  // Recibe el  div  que se ha creado en el  html  que va a ser el lienzo en el que mostrar
  // la visualización de la escena
  constructor(myCanvas) {
    super();
    this.background = new THREE.Color(0xeeeeee);
    this.fog = new THREE.Fog(0xeeeeee, 12, 28);





    // Lo primero, crear el visualizador, pasándole el lienzo sobre el que realizar los renderizados.
    this.renderer = this.createRenderer(myCanvas);


    this.alturaJugador = 1.6;
    this.velocidadMovimiento = 8.0;
    this.clock = new THREE.Clock();
    this.teclas = new Set();

    // Listeners de teclado
    window.addEventListener('keydown', (event) => {
      this.teclas.add(event.code);
      console.log('Tecla pulsada:', event.code);
    });

    window.addEventListener('keyup', (event) => {
      this.teclas.delete(event.code);
    });

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    this.prevTime = performance.now();

    // Se crea la interfaz gráfica de usuario
    this.gui = this.createGUI();

    // Construimos los distinos elementos que tendremos en la escena

    // Todo elemento que se desee sea tenido en cuenta en el renderizado de la escena debe pertenecer a esta. Bien como hijo de la escena (this en esta clase) o como hijo de un elemento que ya esté en la escena.
    // Tras crear cada elemento se añadirá a la escena con   this.add(variable)
    this.createLights();

    // Tendremos una cámara con un control de movimiento con el ratón
    this.createCamera();

    // Un suelo 
    this.createGround();

    // Y unos ejes. Imprescindibles para orientarnos sobre dónde están las cosas
    // Todas las unidades están en metros
    this.axis = new THREE.AxesHelper(0.1);
    this.add(this.axis);


    // Por último creamos el modelo.
    // Le pasamos una variable de sincronizacion
    var laberintoCargado = $.Deferred();
    this.laberinto = new Laberinto("./mi_laberinto.txt", laberintoCargado);
    this.add(this.laberinto);
    laberintoCargado.done(() => {
      console.log("Este bloque no se ejecuta hasta que se resuelve la variable de sincronización");
      const pickUp = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshNormalMaterial());
      this.add(pickUp);
      this.laberinto.getMundoFromCelda(4, 6, pickUp.position);
      // El método solo ha puesto la posicion x, z. Nos queda la posición y
      pickUp.position.y = 1;
    });

    this.reloj = new Reloj(1);
    this.reloj.scale.set(0.2, 0.2, 0.2);
    this.reloj.position.set(0, 0.5, 0);
    this.add(this.reloj);
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      5
    );

    // Posición inicial tipo FPSk
    this.camera.position.set(0, this.alturaJugador, 0);

    // Control FPS con ratón
    this.cameraControl = new PointerLockControls(
      this.camera,
      this.renderer.domElement
    );

    // Añadimos la cámara/control a la escena
    this.add(this.camera);

    // Al hacer click en la pantalla, se bloquea el ratón
    this.renderer.domElement.addEventListener('click', () => {
      this.cameraControl.lock();
    });
  }

  createGround() {
    // 1. Cargador y Variable de Versión para evitar el caché
    const loader = new THREE.TextureLoader();

    // 2. Carga de texturas del suelo
    // Reemplaza estas rutas con tus archivos (ej. de la carpeta PavingSto o Madera)
    const baseColor = loader.load('texturas/Grass/GrassColor.jpg');
    const normalMap = loader.load('texturas/Grass/GrassNormal.png');
    const roughnessMap = loader.load('texturas/Grass/GrassRoughness.png');
    const aoMap = loader.load('texturas/Grass/GrassAO.jpg');

    // 3. Configurar Repetición (Tiling)
    // Como el suelo mide 78x48, repetimos la textura para que se vea bien
    [baseColor, normalMap, roughnessMap, aoMap].forEach((tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(10, 8); // Ajusta estos números a tu gusto
    });

    // 4. Geometría con canal UV2 para el AO
    const geometryGround = new THREE.BoxGeometry(78, 0.02, 48);
    // IMPORTANTE: Esto evita que el material se vea negro al usar aoMap
    geometryGround.setAttribute('uv2', new THREE.BufferAttribute(geometryGround.attributes.uv.array, 2));

    // 5. Material Standard Profesional
    const materialGround = new THREE.MeshStandardMaterial({
      map: baseColor,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
      aoMap: aoMap,
      aoMapIntensity: 1.0,
      metalness: 0.0, // La madera o piedra no suelen ser metálicas
      roughness: 1.0
    });

    // 6. Construcción del Mesh
    const ground = new THREE.Mesh(geometryGround, materialGround);
    ground.position.y = -0.01;

    // El suelo debe recibir sombras si usas SpotLight
    ground.receiveShadow = true;

    this.add(ground);
  }

  createGUI() {
    // Se crea la interfaz gráfica de usuario
    var gui = new GUI();

    // La escena le va a añadir sus propios controles. 
    // Se definen mediante un objeto de control
    // En este caso la intensidad de la luz y si se muestran o no los ejes
    this.guiControls = {
      // En el contexto de una función   this   alude a la función
      lightPower: 500.0,  // La potencia de esta fuente de luz se mide en lúmenes
      ambientIntensity: 0.5,
      axisOnOff: true
    }

    // Se crea una sección para los controles de esta clase
    var folder = gui.addFolder('Luz y Ejes');

    // Se le añade un control para la potencia de la luz puntual
    folder.add(this.guiControls, 'lightPower', 0, 1000, 20)
      .name('Luz puntual : ')
      .onChange((value) => this.setLightPower(value));

    // Otro para la intensidad de la luz ambiental
    folder.add(this.guiControls, 'ambientIntensity', 0, 1, 0.05)
      .name('Luz ambiental: ')
      .onChange((value) => this.setAmbientIntensity(value));

    // Y otro para mostrar u ocultar los ejes
    folder.add(this.guiControls, 'axisOnOff')
      .name('Mostrar ejes : ')
      .onChange((value) => this.setAxisVisible(value));

    return gui;
  }

  createLights() {
    // Se crea una luz ambiental, evita que se vean complentamente negras las zonas donde no incide de manera directa una fuente de luz
    // La luz ambiental solo tiene un color y una intensidad
    // Se declara como   var   y va a ser una variable local a este método
    //    se hace así puesto que no va a ser accedida desde otros métodos
    this.ambientLight = new THREE.AmbientLight('white', this.guiControls.ambientIntensity);
    // La añadimos a la escena
    this.add(this.ambientLight);

    // Se crea una luz focal que va a ser la luz principal de la escena
    // La luz focal, además tiene una posición, y un punto de mira
    // Si no se le da punto de mira, apuntará al (0,0,0) en coordenadas del mundo
    // En este caso se declara como   this.atributo   para que sea un atributo accesible desde otros métodos.
    this.pointLight = new THREE.SpotLight(0xffffff);
    this.pointLight.power = this.guiControls.lightPower;
    this.pointLight.position.set(2, 9, 1);
    console.log(this.pointLight);
    this.add(this.pointLight);
  }



  setLightPower(valor) {
    this.pointLight.power = valor;
  }

  setAmbientIntensity(valor) {
    this.ambientLight.intensity = valor;
  }

  setAxisVisible(valor) {
    this.axis.visible = valor;
  }

  createRenderer(myCanvas) {
    // Se recibe el lienzo sobre el que se van a hacer los renderizados. Un div definido en el html.

    // Se instancia un Renderer   WebGL
    var renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: "high-performance"
    });

    // Se establece un color de fondo en las imágenes que genera el render
    renderer.setClearColor(new THREE.Color(0xEEEEEE), 1.0);

    // Se establece el tamaño, se aprovecha la totalidad de la ventana del navegador
    renderer.setSize(window.innerWidth, window.innerHeight);

    // La visualización se muestra en el lienzo recibido
    $(myCanvas).append(renderer.domElement);

    return renderer;
  }

  getCamera() {
    // En principio se devuelve la única cámara que tenemos
    // Si hubiera varias cámaras, este método decidiría qué cámara devuelve cada vez que es consultado
    return this.camera;
  }

  setCameraAspect(ratio) {
    // Cada vez que el usuario modifica el tamaño de la ventana desde el gestor de ventanas de
    // su sistema operativo hay que actualizar el ratio de aspecto de la cámara
    this.camera.aspect = ratio;
    // Y si se cambia ese dato hay que actualizar la matriz de proyección de la cámara
    this.camera.updateProjectionMatrix();
  }

  onWindowResize() {
    // Este método es llamado cada vez que el usuario modifica el tamapo de la ventana de la aplicación
    // Hay que actualizar el ratio de aspecto de la cámara
    this.setCameraAspect(window.innerWidth / window.innerHeight);

    // Y también el tamaño del renderizador
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  update() {
    const delta = this.clock.getDelta();
    const velocidad_actual = this.velocidadMovimiento * delta;

    if (this.teclas.has('KeyW') || this.teclas.has('ArrowUp')) {
      this.cameraControl.moveForward(velocidad_actual);
    }

    if (this.teclas.has('KeyS') || this.teclas.has('ArrowDown')) {
      this.cameraControl.moveForward(-velocidad_actual);
    }

    if (this.teclas.has('KeyA') || this.teclas.has('ArrowLeft')) {
      this.cameraControl.moveRight(-velocidad_actual);
    }

    if (this.teclas.has('KeyD') || this.teclas.has('ArrowRight')) {
      this.cameraControl.moveRight(velocidad_actual);
    }

    this.camera.position.y = this.alturaJugador;

    this.renderer.render(this, this.getCamera());

    this.laberinto.update();

    if (this.reloj) {
      this.reloj.update();
    }

    requestAnimationFrame(() => this.update());
  }
}


/// La función   main
$(function () {

  // Se instancia la escena pasándole el  div  que se ha creado en el html para visualizar
  var scene = new MyScene("#WebGL-output");

  // Se añaden los listener de la aplicación. En este caso, el que va a comprobar cuándo se modifica el tamaño de la ventana de la aplicación.
  window.addEventListener("resize", () => scene.onWindowResize());

  // Que no se nos olvide, la primera visualización.
  scene.update();

});
