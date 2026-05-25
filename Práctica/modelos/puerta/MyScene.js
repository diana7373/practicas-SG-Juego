import * as THREE from 'three'
import { GUI } from 'gui'
import { TrackballControls } from 'trackball'

// 👇 tu puerta
import { Puerta } from './Puerta.js'

class MyScene extends THREE.Scene {

  constructor(myCanvas) {
    super();

    // Renderer
    this.renderer = this.createRenderer(myCanvas);

    // GUI
    this.gui = this.createGUI();

    // Luz
    this.createLights();

    // Cámara
    this.createCamera();

    // Ejes
    this.axis = new THREE.AxesHelper(1);
    this.add(this.axis);

    // 🔥 PUERTA
    this.puerta = new Puerta();
    this.add(this.puerta);

    // posicionarla en el centro
    this.puerta.position.set(0, 0, 0);

    // suelo opcional para referencia
    this.createGround();
  }

  createCamera() {

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.01,
      100
    );

    this.camera.position.set(2, 2, 2);

    const look = new THREE.Vector3(0, 0, 0);
    this.camera.lookAt(look);

    this.add(this.camera);

    this.cameraControl = new TrackballControls(
      this.camera,
      this.renderer.domElement
    );

    this.cameraControl.rotateSpeed = 5;
    this.cameraControl.zoomSpeed = -2;
    this.cameraControl.panSpeed = 0.5;
    this.cameraControl.target = look;
  }

  createGround() {

    const geo = new THREE.BoxGeometry(10, 0.1, 10);
    const mat = new THREE.MeshStandardMaterial({ color: 0x444444 });

    const ground = new THREE.Mesh(geo, mat);
    ground.position.y = -0.05;

    this.add(ground);
  }

  createLights() {

    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.add(this.ambientLight);

    this.spot = new THREE.SpotLight(0xffffff, 2);
    this.spot.position.set(3, 5, 3);

    this.add(this.spot);
  }

  createGUI() {

    const gui = new GUI();

    this.guiControls = {
      axisOnOff: true,
      doorRotation: 0
    };

    const folder = gui.addFolder("Debug");

    folder.add(this.guiControls, "axisOnOff")
      .onChange(v => this.axis.visible = v);

    folder.add(this.guiControls, "doorRotation", 0, Math.PI * 2)
      .onChange(v => {
        this.puerta.rotation.y = v;
      });

    return gui;
  }

  createRenderer(myCanvas) {

    const renderer = new THREE.WebGLRenderer({
      antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.setClearColor(0x111111);

    $(myCanvas).append(renderer.domElement);

    return renderer;
  }

  update() {

    this.renderer.render(this, this.camera);

    this.cameraControl.update();

    if (this.puerta && this.puerta.update) {
      this.puerta.update(0.016);
    }

    requestAnimationFrame(() => this.update());
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
}

// MAIN
$(function () {

  const scene = new MyScene("#WebGL-output");

  window.addEventListener("resize", () => scene.onWindowResize());

  scene.update();
});