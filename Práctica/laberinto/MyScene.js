//GUI que los muestre los pickups que has cogido
//Falta hacer una puerta y animarla cuando uses la lleve
//Falta que cuando cojas la llave se te ponga en la mano
//Falta poner materiales y texturas a los pickups
//hacer distintos tipos de paredes y suelos
//Faltaria hacer una GUI con un contador y el tiempo del reloj y la funcionalidad del pickup
//Falta el arbol del pickup reloj
//Falta un menu de pausa con opciones de reiniciar, salir, etc

import * as THREE from 'three'
import { GUI } from 'gui'
import { PointerLockControls } from '../libs/PointerLockControls.js'

import { Laberinto } from './Laberinto.js'
import { Reloj } from '../modelos/reloj/reloj.js'
import { FontLoader } from '../libs/FontLoader.js'
import { TextGeometry } from '../libs/TextGeometry.js'

class MyScene extends THREE.Scene {

  constructor(myCanvas) {
    super();

    // Fondo oscuro y niebla de terror
    this.background = new THREE.Color(0x050505);
    this.fog = new THREE.FogExp2(0x050505, 0.12);

    // Renderer
    this.renderer = this.createRenderer(myCanvas);

    // Jugador
    this.alturaJugador = 1.6;
    this.velocidadMovimiento = 8.0;
    this.clock = new THREE.Clock();
    this.teclas = new Set();

    // Teclado
    window.addEventListener('keydown', (event) => {
      this.teclas.add(event.code);
      console.log('Tecla pulsada:', event.code);
    });

    window.addEventListener('keyup', (event) => {
      this.teclas.delete(event.code);
    });

    // Click izquierdo / interacción
    window.addEventListener('click', () => this.interaccionClick());

    // Raycaster movimiento
    this.rayoMovimiento = new THREE.Raycaster();
    this.distanciaMovimiento = 0.3;
    this.rayoMovimiento.far = this.distanciaMovimiento;

    // Raycaster interacción
    this.rayoInteraccion = new THREE.Raycaster();
    this.distanciaInteraccion = 2.0;
    this.rayoInteraccion.far = this.distanciaInteraccion;

    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    // GUI
    this.gui = this.createGUI();

    // Luces
    this.createLights();

    // Cámara
    this.createCamera();

    // Linterna pegada a la cámara
    this.createFlashLight();

    // Suelo
    this.createGround();

    // Techo oscuro gigante
    this.createRoof();

    // Ejes
    this.axis = new THREE.AxesHelper(0.1);
    this.add(this.axis);

    // Laberinto
    var laberintoCargado = $.Deferred();
    this.laberinto = new Laberinto("./mi_laberinto2.txt", laberintoCargado);
    this.add(this.laberinto);

    laberintoCargado.done(() => {
      console.log("Laberinto cargado correctamente");

      const pickUp = new THREE.Mesh(
        new THREE.SphereGeometry(0.5),
        new THREE.MeshNormalMaterial()
      );

      this.add(pickUp);
      this.laberinto.getMundoFromCelda(4, 6, pickUp.position);
      pickUp.position.y = 1;
    });
  }

  interaccionClick() {
    const direccion = new THREE.Vector3();

    this.camera.getWorldDirection(direccion);
    direccion.normalize();

    this.rayoInteraccion.set(this.camera.position, direccion);

    // Si tienes Laberinto.objetos, usamos eso.
    // Si no existe, usamos los hijos del laberinto.
    const objetosInteractuables = Laberinto.objetos || this.laberinto.children;

    const intersecciones = this.rayoInteraccion.intersectObjects(
      objetosInteractuables,
      true
    );

    if (intersecciones.length > 0) {
      const objetoClicado = intersecciones[0].object;

      console.log('Objeto clicado:', objetoClicado);

      // Si el mesh tiene un root asignado, ocultamos el objeto completo
      if (objetoClicado.userData.root) {
        objetoClicado.userData.root.visible = false;
      } else {
        objetoClicado.visible = false;
      }

      // Si es un hueso, sumamos contador
      if (objetoClicado.userData.type === "HUESO") {
        this.guiControls.huesos += 1;
        this.huesosController.updateDisplay();
      }

      // Ejemplo para otros pickups
      if (objetoClicado.userData.type === "RELOJ") {
        console.log("Has recogido un reloj");
      }

      if (objetoClicado.userData.type === "POCION") {
        console.log("Has recogido una poción");
      }

      if (objetoClicado.userData.type === "LLAVE") {
        console.log("Has recogido una llave");
      }
    }
  }

  createCamera() {
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      20
    );

    this.camera.position.set(0, this.alturaJugador, 0);

    this.cameraControl = new PointerLockControls(
      this.camera,
      this.renderer.domElement
    );

    this.add(this.camera);

    this.renderer.domElement.addEventListener('click', () => {
      this.cameraControl.lock();
    });
  }

  createFlashLight() {
    // Linterna del jugador
    this.flashLight = new THREE.SpotLight(
      0xfff0cc,
      80,
      8,
      Math.PI / 10,
      0.45,
      1.5
    );

    this.flashLight.position.set(0, 0, 0);
    this.flashLight.castShadow = true;

    this.flashLight.shadow.mapSize.width = 1024;
    this.flashLight.shadow.mapSize.height = 1024;
    this.flashLight.shadow.camera.near = 0.1;
    this.flashLight.shadow.camera.far = 10;

    // Target delante de la cámara
    this.flashLight.target.position.set(0, 0, -1);

    // La luz y su target van pegados a la cámara
    this.camera.add(this.flashLight);
    this.camera.add(this.flashLight.target);
  }

  createGround() {
    const loader = new THREE.TextureLoader();

    const baseColor = loader.load('texturas/Grass/GrassColor.jpg');
    const normalMap = loader.load('texturas/Grass/GrassNormal.png');
    const roughnessMap = loader.load('texturas/Grass/GrassRoughness.png');
    const aoMap = loader.load('texturas/Grass/GrassAO.jpg');

    [baseColor, normalMap, roughnessMap, aoMap].forEach((tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(10, 8);
    });

    const geometryGround = new THREE.BoxGeometry(78, 0.02, 48);

    geometryGround.setAttribute(
      'uv2',
      new THREE.BufferAttribute(geometryGround.attributes.uv.array, 2)
    );

    const materialGround = new THREE.MeshStandardMaterial({
      map: baseColor,
      normalMap: normalMap,
      roughnessMap: roughnessMap,
      aoMap: aoMap,
      aoMapIntensity: 1.0,
      metalness: 0.0,
      roughness: 1.0
    });

    const ground = new THREE.Mesh(geometryGround, materialGround);
    ground.position.y = -0.01;

    ground.receiveShadow = true;
    ground.castShadow = false;

    this.add(ground);
  }

  createRoof() {
    // Bloque enorme superior que tapa la luz desde arriba
    const roofGeometry = new THREE.BoxGeometry(78, 0.8, 48);

    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x010101,
      roughness: 1.0,
      metalness: 0.0
    });

    this.roof = new THREE.Mesh(roofGeometry, roofMaterial);

    // Altura del techo
    this.roof.position.set(0, 2.45, 0);

    this.roof.castShadow = true;
    this.roof.receiveShadow = true;

    this.add(this.roof);
  }

  createGUI() {
    const gui = new GUI();

    this.guiControls = {
      lightPower: 20.0,
      ambientIntensity: 0.04,
      axisOnOff: true,
      huesos: 0,
      flashlightPower: 80,
      fogDensity: 0.12
    };

    const folderInventario = gui.addFolder('Inventario');

    this.huesosController = folderInventario
      .add(this.guiControls, 'huesos')
      .name('Huesos recogidos')
      .listen();

    folderInventario.open();

    const folderTerror = gui.addFolder('Ambiente Terror');

    folderTerror
      .add(this.guiControls, 'flashlightPower', 0, 200, 1)
      .name('Potencia linterna')
      .onChange((value) => {
        if (this.flashLight) {
          this.flashLight.intensity = value;
        }
      });

    folderTerror
      .add(this.guiControls, 'fogDensity', 0.01, 0.3, 0.01)
      .name('Densidad niebla')
      .onChange((value) => {
        this.fog.density = value;
      });

    folderTerror.open();

    const folder = gui.addFolder('Luz y Ejes');

    folder.add(this.guiControls, 'lightPower', 0, 1000, 20)
      .name('Luz superior')
      .onChange((value) => this.setLightPower(value));

    folder.add(this.guiControls, 'ambientIntensity', 0, 1, 0.01)
      .name('Luz ambiental')
      .onChange((value) => this.setAmbientIntensity(value));

    folder.add(this.guiControls, 'axisOnOff')
      .name('Mostrar ejes')
      .onChange((value) => this.setAxisVisible(value));

    return gui;
  }

  createLights() {
    // Luz ambiental muy baja
    this.ambientLight = new THREE.AmbientLight(0x222233, this.guiControls.ambientIntensity);
    this.add(this.ambientLight);

    // Luz superior muy débil
    this.pointLight = new THREE.SpotLight(0xffffff, this.guiControls.lightPower);
    this.pointLight.position.set(0, 8, 0);
    this.pointLight.angle = Math.PI / 5;
    this.pointLight.penumbra = 0.8;
    this.pointLight.decay = 2;
    this.pointLight.distance = 12;

    this.pointLight.castShadow = true;
    this.pointLight.shadow.mapSize.width = 1024;
    this.pointLight.shadow.mapSize.height = 1024;

    this.add(this.pointLight);
  }

  setLightPower(valor) {
    this.pointLight.intensity = valor;
  }

  setAmbientIntensity(valor) {
    this.ambientLight.intensity = valor;
  }

  setAxisVisible(valor) {
    this.axis.visible = valor;
  }

  createRenderer(myCanvas) {
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: "high-performance"
    });

    renderer.setClearColor(new THREE.Color(0x050505), 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Sombras
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    $(myCanvas).append(renderer.domElement);

    return renderer;
  }

  getCamera() {
    return this.camera;
  }

  setCameraAspect(ratio) {
    this.camera.aspect = ratio;
    this.camera.updateProjectionMatrix();
  }

  onWindowResize() {
    this.setCameraAspect(window.innerWidth / window.innerHeight);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  update() {
    const delta = this.clock.getDelta();
    const velocidad_actual = this.velocidadMovimiento * delta;

    const direccion = new THREE.Vector3();
    this.camera.getWorldDirection(direccion);
    direccion.y = 0;
    direccion.normalize();

    const derecha = new THREE.Vector3()
      .crossVectors(direccion, new THREE.Vector3(0, 1, 0))
      .normalize();

    const izquierda = derecha.clone().negate();
    const atras = direccion.clone().negate();

    const comprobarColision = (dir) => {
      this.rayoMovimiento.set(this.camera.position, dir);
      const intersecciones = this.rayoMovimiento.intersectObjects(this.laberinto.children, true);
      return intersecciones.length > 0;
    };

    if (this.teclas.has('KeyW') || this.teclas.has('ArrowUp')) {
      if (!comprobarColision(direccion)) {
        this.cameraControl.moveForward(velocidad_actual);
      }
    }

    if (this.teclas.has('KeyS') || this.teclas.has('ArrowDown')) {
      if (!comprobarColision(atras)) {
        this.cameraControl.moveForward(-velocidad_actual);
      }
    }

    if (this.teclas.has('KeyA') || this.teclas.has('ArrowLeft')) {
      if (!comprobarColision(izquierda)) {
        this.cameraControl.moveRight(-velocidad_actual);
      }
    }

    if (this.teclas.has('KeyD') || this.teclas.has('ArrowRight')) {
      if (!comprobarColision(derecha)) {
        this.cameraControl.moveRight(velocidad_actual);
      }
    }

    this.camera.position.y = this.alturaJugador;

    if (this.laberinto) {
      this.laberinto.update();
    }

    this.renderer.render(this, this.getCamera());

    requestAnimationFrame(() => this.update());
  }
}

$(function () {
  const scene = new MyScene("#WebGL-output");

  window.addEventListener("resize", () => scene.onWindowResize());

  scene.update();
});