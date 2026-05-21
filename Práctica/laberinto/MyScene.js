//DIANA
//añadir luces de colores distintas y cambiantes (por ejeplo como para donde esta la salida o donde esta la llave, que alguno sea cambiante)
//añadir luces de distintos colores, como farolillos o luces anaranjadas tenebrosas, para dar ambiente al laberinto
//Falta hacer una puerta y animarla cuando uses la lleve
//Falta poner materiales y texturas a los pickups y colocarlos y mejorarlos
//hacer distintos tipos de paredes y suelos
//Falta el arbol del pickup reloj
//La camara se mueva cuando andas
//efecto de estatica general 
//NO MUEVAS LOS HUESOS Y ESO, EL RAYO ESTA HECHO PARA QUE COLISIONEN A ESA ALTURA; SI NO TE GUSTA COMO ESTA HECHO DIMELO POR WHATSAPPP Y VEMOS QUE HACEMOS



//JOSE
//Items flotando mejor colocados y que giren sobre si mismos
//Animacion con la llave para abrir la puerta
//Colocar bien la llave en el suelo y eso

import * as THREE from 'three'
import { GUI } from 'gui'
import { PointerLockControls } from '../libs/PointerLockControls.js'
import { Laberinto } from './Laberinto.js'
import { Llave } from '../modelos/llave/llave.js'
import { Reloj } from '../modelos/reloj/reloj.js'
import { FontLoader } from '../libs/FontLoader.js'
import { TextGeometry } from '../libs/TextGeometry.js'

class MyScene extends THREE.Scene {

  constructor(myCanvas) {
    super();
    this.background = new THREE.Color(0x111111);
    this.fog = new THREE.FogExp2(0x111111, 0.19);

    // Renderer
    this.renderer = this.createRenderer(myCanvas);

    // Jugador
    this.alturaJugador = 1.6;
    this.velocidadMovimiento = 4.5;
    // Sprint desbloqueado con poción
    this.velocidadSprint = 8.5;
    this.tienePocion = false;

    this.sprintMax = 100;
    this.sprintActual = this.sprintMax;

    this.sprintConsumoPorSegundo = 30;
    this.sprintRecargaPorSegundo = 20;

    this.sprintAgotado = false;
    this.sprintando = false;
    this.clock = new THREE.Clock();
    this.teclas = new Set();

    // Estados del juego
    this.partidaAcabada = false;
    this.juegoPausado = false;

    // Estado del ratón
    this.ratonLiberadoPorControl = false;

    // Posición del ratón en coordenadas normalizadas para el raycaster
    this.mouse = new THREE.Vector2(0, 0);

    window.addEventListener('mousemove', (event) => {
      const rect = this.renderer.domElement.getBoundingClientRect();

      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    });

    // Teclado
    window.addEventListener('keydown', (event) => {

      // Evita que al mantener pulsado ESC o CONTROL se repita mil veces
      if (event.repeat && (
        event.code === 'Escape' ||
        event.code === 'ControlLeft' ||
        event.code === 'ControlRight'
      )) {
        return;
      }

      // ESC abre o cierra el menú de pausa
      if (event.code === 'Escape') {
        event.preventDefault();
        this.cambiarPausa();
        return;
      }

      // CONTROL bloquea o desbloquea el ratón
      if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
        event.preventDefault();
        this.cambiarBloqueoRaton();
        return;
      }

      // Si la partida está acabada o pausada, no dejamos mover al jugador
      if (this.partidaAcabada || this.juegoPausado) return;

      this.teclas.add(event.code);
      console.log('Tecla pulsada:', event.code);
    });

    window.addEventListener('keyup', (event) => {
      this.teclas.delete(event.code);
    });

    // Elementos HTML del HUD
    this.hudHuesos = document.getElementById("hud-huesos");
    this.pickupLlave = document.getElementById("pickup-llave");
    this.pickupPocion = document.getElementById("pickup-pocion");
    this.pickupReloj = document.getElementById("pickup-reloj");
    this.pantallaGameOver = document.getElementById("pantalla-game-over");
    this.btnReintentar = document.getElementById("btn-reintentar");
    // Barra de sprint
    this.crearBarraSprint();
    this.actualizarBarraSprint();

    // Elementos HTML del menú de pausa
    this.pantallaPausa = document.getElementById("pantalla-pausa");
    this.btnReiniciarPausa = document.getElementById("btn-reiniciar-pausa");
    this.btnSalirPausa = document.getElementById("btn-salir-pausa");

    // Botón de reintentar cuando acaba la partida
    if (this.btnReintentar) {
      this.btnReintentar.addEventListener("click", () => {
        window.location.reload();
      });
    }

    // Botón reiniciar del menú de pausa
    if (this.btnReiniciarPausa) {
      this.btnReiniciarPausa.addEventListener("click", () => {
        window.location.reload();
      });
    }

    // Botón salir del menú de pausa
    if (this.btnSalirPausa) {
      this.btnSalirPausa.addEventListener("click", () => {
        window.location.href = "../index.html";
      });
    }

    this.hudTemporizador = document.getElementById("temporizador");
    this.tiempoRestante = 5 * 60;

    this.actualizarTemporizador();

    this.intervaloTemporizador = setInterval(() => {
      this.actualizarTemporizador();
    }, 1000);

    this.contadorHuesos = 0;

    window.addEventListener('click', () => this.interaccionClick());

    // Raycaster movimiento
    this.rayoMovimiento = new THREE.Raycaster();
    this.distanciaMovimiento = 0.3;
    this.rayoMovimiento.far = this.distanciaMovimiento;

    // Segundo rayo de movimiento más bajo, para chocar con huesos/relojes
    this.rayoMovimientoBajo = new THREE.Raycaster();
    this.alturaRayoMovimientoBajo = 0.5;
    this.rayoMovimientoBajo.far = this.distanciaMovimiento;

    // Raycaster interacción
    this.rayoInteraccion = new THREE.Raycaster();
    this.distanciaInteraccion = 2.0;
    this.rayoInteraccion.far = this.distanciaInteraccion;

    this.velocity = new THREE.Vector3();
    this.direction = new THREE.Vector3();

    // Para la llave en mano
    this.llaveEnMano = null;

    // GUI
    this.gui = this.createGUI();

    // Minimapa
    this.crearMinimapa();

    // Luces
    this.createLights();

    // Cámara
    this.createCamera();

    // Linterna pegada a la cámara
    this.createFlashLight();

    // Suelo
    this.createGround();

    // Techo oscuro
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

      // Preparamos el minimapa cuando el laberinto ya existe
      this.prepararMinimapaLaberinto();
    });
  }

  pintarTemporizador() {
    if (!this.hudTemporizador) return;

    const minutos = Math.floor(this.tiempoRestante / 60);
    const segundos = this.tiempoRestante % 60;

    const textoMinutos = String(minutos).padStart(2, "0");
    const textoSegundos = String(segundos).padStart(2, "0");

    this.hudTemporizador.textContent = `${textoMinutos}:${textoSegundos}`;
  }

  sumarTiempo(segundosExtra) {
    if (this.partidaAcabada) return;

    this.tiempoRestante += segundosExtra;
    this.pintarTemporizador();

    console.log(`Tiempo añadido: +${segundosExtra} segundos`);
  }

  actualizarTemporizador() {
    if (!this.hudTemporizador) return;

    // Si está pausado o acabada la partida, el tiempo no baja
    if (this.partidaAcabada || this.juegoPausado) return;

    this.pintarTemporizador();

    if (this.tiempoRestante <= 0) {
      this.finalizarPartidaPorTiempo();
      return;
    }

    this.tiempoRestante--;
  }

  finalizarPartidaPorTiempo() {
    if (this.partidaAcabada) return;

    this.partidaAcabada = true;

    clearInterval(this.intervaloTemporizador);

    if (this.hudTemporizador) {
      this.hudTemporizador.classList.add("tiempo-agotado");
    }

    if (this.pantallaGameOver) {
      this.pantallaGameOver.classList.add("visible");
    }

    this.teclas.clear();

    if (this.cameraControl && this.cameraControl.isLocked) {
      this.cameraControl.unlock();
    }

    console.log("Partida acabada por tiempo");
  }

  interaccionClick() {
    if (this.partidaAcabada || this.juegoPausado) return;

    // Solo se puede interactuar si el ratón está liberado
    if (this.cameraControl && this.cameraControl.isLocked) {
      return;
    }

    // El rayo sale desde la posición del ratón en pantalla
    this.rayoInteraccion.setFromCamera(this.mouse, this.camera);

    const objetosInteractuables = Laberinto.objetos || this.laberinto.children;

    const intersecciones = this.rayoInteraccion.intersectObjects(objetosInteractuables, true);

    if (intersecciones.length > 0) {
      const objetoClicado = intersecciones[0].object;

      if (objetoClicado.userData.recogido) return;

      objetoClicado.userData.recogido = true;

      console.log('Objeto clicado:', objetoClicado);

      if (objetoClicado.userData.root) {
        objetoClicado.userData.root.visible = false;
      } else {
        objetoClicado.visible = false;
      }

      if (objetoClicado.userData.type === "HUESO") {
        this.contadorHuesos++;
        this.hudHuesos.textContent = this.contadorHuesos;
      }

      if (objetoClicado.userData.type === "RELOJ") {
        this.pickupReloj.style.display = "flex";

        // Al recoger el reloj, suma 1 minuto al temporizador
        this.sumarTiempo(60);

        console.log("Has recogido un reloj: +1 minuto");
      }

      if (objetoClicado.userData.type === "POCION") {
        if (this.pickupPocion) {
          this.pickupPocion.style.display = "flex";
        }

        this.tienePocion = true;
        this.sprintActual = this.sprintMax;
        this.sprintAgotado = false;
        this.sprintando = false;

        if (this.contenedorSprint) {
          this.contenedorSprint.style.display = "block";
        }

        this.actualizarBarraSprint();

        console.log("Has recogido una poción. Sprint desbloqueado");
      }

      if (objetoClicado.userData.type === "LLAVE") {
        this.pickupLlave.style.display = "flex";

        const root = objetoClicado.userData.root || objetoClicado;

        root.visible = false;

        if (!this.llaveEnMano) {
          this.llaveEnMano = new Llave(1);

          this.camera.add(this.llaveEnMano);

          this.llaveEnMano.position.set(0.3, -0.1, -0.3);
          this.llaveEnMano.scale.set(0.5, 0.5, 0.5);
          this.llaveEnMano.rotation.set(0, Math.PI, -Math.PI / 2);

          this.llaveEnMano.traverse((obj) => {
            if (obj.isMesh) {
              obj.castShadow = false;
              obj.receiveShadow = false;
            }
          });

          console.log("Nueva llave creada en la mano");
        }
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

    this.camera.position.set(10, this.alturaJugador, 0);

    this.cameraControl = new PointerLockControls(
      this.camera,
      this.renderer.domElement
    );

    this.add(this.camera);

    // Si el navegador desbloquea el ratón con ESC, abrimos pausa.
    // Pero si lo desbloqueamos con CONTROL, NO abrimos pausa.
    this.cameraControl.addEventListener('unlock', () => {
      if (
        !this.partidaAcabada &&
        !this.juegoPausado &&
        !this.ratonLiberadoPorControl
      ) {
        this.abrirPausa();
      }
    });

    // Click inicial para empezar a jugar.
    // Si el ratón está liberado por CONTROL, no se vuelve a bloquear con click,
    // porque ese click se usa para interactuar con objetos.
    this.renderer.domElement.addEventListener('click', () => {
      if (
        !this.partidaAcabada &&
        !this.juegoPausado &&
        !this.ratonLiberadoPorControl &&
        this.cameraControl &&
        !this.cameraControl.isLocked
      ) {
        this.cameraControl.lock();
      }
    });
  }

  createFlashLight() {
    this.flashLight = new THREE.SpotLight(
      0xfff0cc,
      15,
      8,
      Math.PI / 6,
      0.45,
      1.5
    );

    this.flashLight.position.set(0, 0, 0);
    this.flashLight.castShadow = true;

    this.flashLight.shadow.mapSize.width = 1024;
    this.flashLight.shadow.mapSize.height = 1024;
    this.flashLight.shadow.camera.near = 0.1;
    this.flashLight.shadow.camera.far = 10;

    this.flashLight.target.position.set(0, 0, -1);

    this.camera.add(this.flashLight);
    this.camera.add(this.flashLight.target);
  }

  createGround() {
    const loader = new THREE.TextureLoader();

    const baseColor = loader.load('texturas/suelo/suelo_color.jpg');
    const normalMap = loader.load('texturas/suelo/suelo_normal.png');
    const roughnessMap = loader.load('texturas/suelo/suelo_r.png');
    const aoMap = loader.load('texturas/suelo/suelo_ao.jpg');
    const dispMap = loader.load('texturas/suelo/suelo_h.jpg');

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
      roughness: 1.0,
      displacementMap: dispMap,
      displacementScale: 0.05,
    });

    const ground = new THREE.Mesh(geometryGround, materialGround);
    ground.position.y = -0.01;

    ground.receiveShadow = true;
    ground.castShadow = false;

    this.add(ground);
  }

  createRoof() {
    const roofGeometry = new THREE.BoxGeometry(78, 0.8, 48);

    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x010101,
      roughness: 1.0,
      metalness: 0.0
    });

    this.roof = new THREE.Mesh(roofGeometry, roofMaterial);

    this.roof.position.set(0, 4, 0);

    this.roof.castShadow = true;
    this.roof.receiveShadow = true;

    this.add(this.roof);
  }

  createGUI() {
    const gui = new GUI();

    this.guiControls = {
      lightPower: 20.0,
      ambientIntensity: 0.12,
      axisOnOff: false,
      flashlightPower: 15,
      fogDensity: 0.19
    };

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

    // La GUI se crea, pero no se muestra en pantalla
    if (gui.domElement) {
      gui.domElement.style.display = "none";
    }

    return gui;
  }

  createLights() {
    this.ambientLight = new THREE.AmbientLight(0x888888, this.guiControls.ambientIntensity);
    this.add(this.ambientLight);

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

  cambiarBloqueoRaton() {
    if (this.partidaAcabada || this.juegoPausado) return;
    if (!this.cameraControl) return;

    this.teclas.clear();

    if (this.cameraControl.isLocked) {
      // Si está bloqueado, CONTROL libera el ratón
      this.ratonLiberadoPorControl = true;
      this.cameraControl.unlock();
      console.log("Ratón liberado con CONTROL");
    } else {
      // Si está liberado, CONTROL vuelve a bloquearlo
      this.ratonLiberadoPorControl = false;
      this.cameraControl.lock();

      // Evita saltos de movimiento al volver a bloquear
      this.clock.getDelta();

      console.log("Ratón bloqueado con CONTROL");
    }
  }

  abrirPausa() {
    if (this.partidaAcabada || this.juegoPausado) return;

    this.juegoPausado = true;
    this.ratonLiberadoPorControl = false;
    this.teclas.clear();

    if (this.pantallaPausa) {
      this.pantallaPausa.classList.add("visible");
    }

    if (this.cameraControl && this.cameraControl.isLocked) {
      this.cameraControl.unlock();
    }

    console.log("Juego pausado");
  }

  cerrarPausa() {
    if (this.partidaAcabada || !this.juegoPausado) return;

    this.juegoPausado = false;
    this.ratonLiberadoPorControl = false;
    this.teclas.clear();

    if (this.pantallaPausa) {
      this.pantallaPausa.classList.remove("visible");
    }

    // Intenta volver a bloquear el ratón al salir de pausa
    if (this.cameraControl && !this.cameraControl.isLocked) {
      this.cameraControl.lock();
    }

    // Evita saltos de movimiento al volver de pausa
    this.clock.getDelta();

    console.log("Juego reanudado");
  }

  cambiarPausa() {
    if (this.partidaAcabada) return;

    if (this.juegoPausado) {
      this.cerrarPausa();
    } else {
      this.abrirPausa();
    }
  }

  crearBarraSprint() {
    let contenedor = document.getElementById("barra-sprint");

    if (!document.getElementById("estilos-sprint")) {
      const style = document.createElement("style");
      style.id = "estilos-sprint";

      style.textContent = `
      #barra-sprint {
        position: fixed;
        left: 50%;
        bottom: 115px;
        transform: translateX(-50%);
        width: 360px;
        padding: 10px 14px;
        background: rgba(0, 0, 0, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.35);
        border-radius: 12px;
        z-index: 30;
        display: none;
        box-sizing: border-box;
      }

      #texto-sprint {
        color: white;
        font-size: 14px;
        font-weight: bold;
        letter-spacing: 2px;
        margin-bottom: 6px;
        text-align: center;
        text-shadow: 0 0 6px black;
      }

      #fondo-sprint {
        width: 100%;
        height: 18px;
        background: rgba(255, 255, 255, 0.15);
        border-radius: 999px;
        overflow: hidden;
      }

      #relleno-sprint {
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, #35d0ff, #ffffff);
        border-radius: 999px;
        transition: width 0.08s linear;
      }
    `;

      document.head.appendChild(style);
    }

    if (!contenedor) {
      contenedor = document.createElement("div");
      contenedor.id = "barra-sprint";

      contenedor.innerHTML = `
      <div id="texto-sprint">SPRINT</div>
      <div id="fondo-sprint">
        <div id="relleno-sprint"></div>
      </div>
    `;

      const hud = document.getElementById("hud") || document.body;
      hud.appendChild(contenedor);
    }

    this.contenedorSprint = contenedor;
    this.barraSprint = document.getElementById("relleno-sprint");
    this.textoSprint = document.getElementById("texto-sprint");
  }

  actualizarBarraSprint() {
    if (!this.barraSprint) return;

    const porcentaje = Math.max(0, Math.min(100, this.sprintActual));
    this.barraSprint.style.width = `${porcentaje}%`;

    if (this.textoSprint) {
      if (this.sprintAgotado) {
        this.textoSprint.textContent = "SPRINT RECARGANDO";
      } else {
        this.textoSprint.textContent = "SPRINT";
      }
    }
  }

  estaPulsandoMovimiento() {
    return (
      this.teclas.has("KeyW") ||
      this.teclas.has("ArrowUp") ||
      this.teclas.has("KeyS") ||
      this.teclas.has("ArrowDown") ||
      this.teclas.has("KeyA") ||
      this.teclas.has("ArrowLeft") ||
      this.teclas.has("KeyD") ||
      this.teclas.has("ArrowRight")
    );
  }

  estaPulsandoShift() {
    return (
      this.teclas.has("ShiftLeft") ||
      this.teclas.has("ShiftRight")
    );
  }

  actualizarSprint(delta) {
    if (!this.tienePocion) {
      return false;
    }

    const pulsaMovimiento = this.estaPulsandoMovimiento();
    const pulsaShift = this.estaPulsandoShift();

    const puedeSprintar = !this.sprintAgotado && this.sprintActual > 0;

    this.sprintando = pulsaShift && pulsaMovimiento && puedeSprintar;

    if (this.sprintando) {
      this.sprintActual -= this.sprintConsumoPorSegundo * delta;

      if (this.sprintActual <= 0) {
        this.sprintActual = 0;
        this.sprintAgotado = true;
        this.sprintando = false;
      }
    } else {
      if (this.sprintActual < this.sprintMax) {
        this.sprintActual += this.sprintRecargaPorSegundo * delta;

        if (this.sprintActual >= this.sprintMax) {
          this.sprintActual = this.sprintMax;
          this.sprintAgotado = false;
        }
      }
    }

    this.actualizarBarraSprint();

    return this.sprintando;
  }

  crearMinimapa() {
    this.minimapaSize = 190;
    this.minimapaPadding = 12;

    this.minimapaCanvas = document.createElement("canvas");
    this.minimapaCanvas.width = this.minimapaSize;
    this.minimapaCanvas.height = this.minimapaSize;

    this.minimapaCanvas.style.position = "fixed";
    this.minimapaCanvas.style.top = "20px";
    this.minimapaCanvas.style.right = "20px";
    this.minimapaCanvas.style.width = this.minimapaSize + "px";
    this.minimapaCanvas.style.height = this.minimapaSize + "px";
    this.minimapaCanvas.style.zIndex = "50";
    this.minimapaCanvas.style.border = "2px solid rgba(255,255,255,0.8)";
    this.minimapaCanvas.style.borderRadius = "10px";
    this.minimapaCanvas.style.background = "rgba(0,0,0,0.65)";
    this.minimapaCanvas.style.pointerEvents = "none";

    document.body.appendChild(this.minimapaCanvas);

    this.minimapaCtx = this.minimapaCanvas.getContext("2d");
    this.minimapaPreparado = false;
    this.minimapaParedes = [];
  }

  prepararMinimapaLaberinto() {
    if (!this.laberinto || !this.minimapaCtx) return;

    this.minimapaParedes = [];

    const bounds = new THREE.Box3().setFromObject(this.laberinto);

    if (
      !isFinite(bounds.min.x) || !isFinite(bounds.max.x) ||
      !isFinite(bounds.min.z) || !isFinite(bounds.max.z)
    ) {
      console.warn("No se ha podido calcular el tamaño del laberinto para el minimapa");
      return;
    }

    this.minimapaBounds = bounds;

    const anchoMundo = bounds.max.x - bounds.min.x;
    const altoMundo = bounds.max.z - bounds.min.z;

    const espacioUtil = this.minimapaSize - this.minimapaPadding * 2;

    this.minimapaEscala = Math.min(
      espacioUtil / anchoMundo,
      espacioUtil / altoMundo
    );

    this.minimapaOffsetX = (this.minimapaSize - anchoMundo * this.minimapaEscala) / 2;
    this.minimapaOffsetY = (this.minimapaSize - altoMundo * this.minimapaEscala) / 2;

    this.laberinto.traverse((objeto) => {
      if (!objeto.isMesh) return;

      const caja = new THREE.Box3().setFromObject(objeto);

      if (
        !isFinite(caja.min.x) || !isFinite(caja.max.x) ||
        !isFinite(caja.min.z) || !isFinite(caja.max.z)
      ) {
        return;
      }

      const ancho = caja.max.x - caja.min.x;
      const alto = caja.max.z - caja.min.z;

      // Evita pintar objetos demasiado pequeños o basura visual
      if (ancho <= 0.05 && alto <= 0.05) return;

      this.minimapaParedes.push(caja);
    });

    this.minimapaPreparado = true;
    this.actualizarMinimapa();
  }

  mundoAMinimapa(x, z) {
    const bounds = this.minimapaBounds;

    const mapaX =
      this.minimapaOffsetX +
      (x - bounds.min.x) * this.minimapaEscala;

    const mapaY =
      this.minimapaOffsetY +
      (bounds.max.z - z) * this.minimapaEscala;

    return {
      x: mapaX,
      y: mapaY
    };
  }

  actualizarMinimapa() {
    if (!this.minimapaPreparado || !this.minimapaCtx || !this.camera) return;

    const ctx = this.minimapaCtx;
    const size = this.minimapaSize;

    ctx.clearRect(0, 0, size, size);

    // Fondo del minimapa
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 0, size, size);

    // Marco interior
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(6, 6, size - 12, size - 12);

    // Paredes del laberinto
    ctx.fillStyle = "rgba(220, 220, 220, 0.85)";

    for (const pared of this.minimapaParedes) {
      const esquina1 = this.mundoAMinimapa(pared.min.x, pared.min.z);
      const esquina2 = this.mundoAMinimapa(pared.max.x, pared.max.z);

      const x = Math.min(esquina1.x, esquina2.x);
      const y = Math.min(esquina1.y, esquina2.y);
      const w = Math.abs(esquina2.x - esquina1.x);
      const h = Math.abs(esquina2.y - esquina1.y);

      ctx.fillRect(x, y, Math.max(w, 1), Math.max(h, 1));
    }

    // Posición del jugador
    const jugador = this.mundoAMinimapa(
      this.camera.position.x,
      this.camera.position.z
    );

    // Dirección hacia donde mira el jugador
    const direccion = new THREE.Vector3();
    this.camera.getWorldDirection(direccion);

    const largoFlecha = 13;
    const puntaX = jugador.x + direccion.x * largoFlecha;
    const puntaY = jugador.y - direccion.z * largoFlecha;

    // Punto del jugador
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(jugador.x, jugador.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Flecha de dirección
    ctx.strokeStyle = "red";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(jugador.x, jugador.y);
    ctx.lineTo(puntaX, puntaY);
    ctx.stroke();

    // Texto
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText("MAPA", 10, 18);
  }

  animarHuesos(delta) {
    if (!this.laberinto) return;

    const huesosAnimados = new Set();

    const objetos = Laberinto.objetos && Laberinto.objetos.length > 0
      ? Laberinto.objetos
      : this.laberinto.children;

    const revisarObjeto = (objeto) => {
      if (!objeto || !objeto.userData) return;

      const root = objeto.userData.root || objeto;
      const tipo = objeto.userData.type || root.userData?.type;

      if (tipo !== "HUESO") return;

      if (
        objeto.userData.recogido ||
        root.userData?.recogido ||
        root.visible === false
      ) {
        return;
      }

      if (huesosAnimados.has(root.uuid)) return;

      huesosAnimados.add(root.uuid);

      // Giro sobre sí mismo en eje Y
      root.rotation.y += delta * 2.0;
    };

    for (const objeto of objetos) {
      revisarObjeto(objeto);

      if (objeto.traverse) {
        objeto.traverse((hijo) => {
          revisarObjeto(hijo);
        });
      }
    }
  }

  update() {
    const delta = this.clock.getDelta();

    // Si está pausado o acabada la partida, solo renderiza, pero no mueve nada
    if (this.partidaAcabada || this.juegoPausado) {
      this.renderer.render(this, this.getCamera());
      requestAnimationFrame(() => this.update());
      return;
    }

    const estaSprintando = this.actualizarSprint(delta);

    const velocidad_actual = (estaSprintando ? this.velocidadSprint : this.velocidadMovimiento) * delta;

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
      if (!this.laberinto) return false;

      const objetos = this.laberinto.children;

      const esVisibleEnJerarquia = (obj) => {
        let actual = obj;

        while (actual) {
          if (actual.visible === false) return false;
          actual = actual.parent;
        }

        return true;
      };

      const obtenerTipo = (obj) => {
        let actual = obj;

        while (actual) {
          if (actual.userData && actual.userData.type) {
            return actual.userData.type;
          }

          if (
            actual.userData &&
            actual.userData.root &&
            actual.userData.root.userData &&
            actual.userData.root.userData.type
          ) {
            return actual.userData.root.userData.type;
          }

          actual = actual.parent;
        }

        return null;
      };

      const esBloqueante = (interseccion) => {
        const obj = interseccion.object;

        if (!esVisibleEnJerarquia(obj)) return false;

        const tipo = obtenerTipo(obj);

        // Si no tiene tipo, asumimos que es muro del laberinto
        if (!tipo) return true;

        // Solo bloquean hueso y reloj
        return tipo === "HUESO" || tipo === "RELOJ";
      };

      // Rayo normal, desde la cámara
      this.rayoMovimiento.set(this.camera.position, dir);

      const colisionNormal = this.rayoMovimiento
        .intersectObjects(objetos, true)
        .some(esBloqueante);

      // Rayo bajo, a la altura de huesos/relojes
      const origenBajo = this.camera.position.clone();
      origenBajo.y = this.alturaRayoMovimientoBajo;

      this.rayoMovimientoBajo.set(origenBajo, dir);

      const colisionBaja = this.rayoMovimientoBajo
        .intersectObjects(objetos, true)
        .some(esBloqueante);

      // Si cualquiera de los dos rayos choca, no deja andar
      return colisionNormal || colisionBaja;
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
      this.animarHuesos(delta);
    }

    this.actualizarMinimapa();

    this.renderer.render(this, this.getCamera());

    requestAnimationFrame(() => this.update());
  }
}

$(function () {
  const scene = new MyScene("#WebGL-output");

  window.addEventListener("resize", () => scene.onWindowResize());

  scene.update();
});