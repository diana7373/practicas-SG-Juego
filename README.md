# Runnin' out of bones

𐂯 .ᐟ⸝ 𓏵🦴⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

*Un videojuego 3D de exploración en primera persona donde cada pasillo esconde un objeto, cada objeto acerca a la salida y el tiempo juega en tu contra.*

## ⋆𐙚₊˚⊹♡ Sobre el proyecto

**Entre las catacumbas** es un videojuego 3D desarrollado con **JavaScript y Three.js** como práctica de la asignatura de Sistemas Gráficos de la Universidad de Granada.

El jugador despierta atrapado en unas antiguas catacumbas y debe encontrar la manera de escapar de un laberinto oscuro. Para conseguirlo, tendrá que explorar sus pasillos, recoger todos los huesos escondidos, encontrar una llave y localizar la puerta de salida antes de que se agote el tiempo.

Durante la exploración encontrará objetos especiales que pueden ayudarle en su aventura: relojes que amplían el tiempo disponible y pociones que desbloquean la posibilidad de correr.

El proyecto combina modelado 3D, geometrías, materiales, texturas, iluminación, animaciones, detección de colisiones e interacción con objetos dentro de un entorno tridimensional.

## ⋆𐙚₊˚⊹♡ La aventura

### 𑣲⋆ 1. Las catacumbas

La partida comienza en un laberinto subterráneo formado por muros de piedra, pasillos estrechos y una iluminación tenue que refuerza la sensación de estar atrapado.

Una pequeña introducción presenta el contexto de la aventura antes de comenzar la partida.

El escenario se construye automáticamente a partir de un archivo de texto que representa la distribución del laberinto mediante una matriz de caracteres.

### 𑣲⋆ 2. La búsqueda de los huesos

El objetivo principal es encontrar todos los huesos repartidos por el laberinto.

Los huesos están representados mediante modelos 3D individuales y cuentan con una animación de rotación para facilitar su identificación.

Cada vez que se recoge uno, el contador de huesos de la interfaz se actualiza. Cuando se han conseguido todos, aparece un mensaje indicando que la llave ha aparecido en algún lugar del laberinto.

### 𑣲⋆ 3. Los objetos especiales

Durante la exploración pueden encontrarse diferentes objetos que ayudan a completar la aventura:

- **Reloj:** añade 60 segundos al temporizador, permitiendo disponer de más tiempo para encontrar la salida.
- **Poción:** desbloquea el sprint, aumentando la velocidad de movimiento y permitiendo recorrer los pasillos más rápidamente.
- **Llave:** aparece después de recoger todos los huesos y permite abrir la puerta final.

Cada objeto dispone de su propio modelo 3D y se incorpora a la interfaz cuando el jugador lo recoge.

### 𑣲⋆ 4. La puerta de salida

Una vez conseguida la llave, el jugador debe encontrar la puerta que conduce al exterior.

Al interactuar con ella, si dispone de la llave, comienza una animación en la que la puerta se eleva hasta abrirse.

Tras completar la animación, se muestra la pantalla de victoria junto con el tiempo empleado en escapar.

### 𑣲⋆ 5. El tiempo se acaba...

La aventura cuenta con un temporizador inicial de cinco minutos.

Si el tiempo llega a cero antes de conseguir escapar, la partida termina y aparece una pantalla de derrota con la posibilidad de volver a intentarlo.

Los relojes repartidos por el laberinto permiten ampliar el tiempo disponible, por lo que explorar y administrar el tiempo son aspectos fundamentales para completar el recorrido.

## ⋆𐙚₊˚⊹♡ Controles

| **Tecla / Acción** | **Función** |
| ------------------ | ----------- |
| `W` / `↑` | Avanzar |
| `S` / `↓` | Retroceder |
| `A` / `←` | Desplazarse hacia la izquierda |
| `D` / `→` | Desplazarse hacia la derecha |
| Ratón | Controlar la cámara y mirar alrededor |
| `Shift` | Correr (después de recoger la poción) |
| `Control` | Bloquear o liberar el ratón |
| `Clic izquierdo` | Interactuar y recoger objetos |
| `Esc` | Abrir o cerrar el menú de pausa |

**Importante:** para recoger objetos y abrir la puerta, es necesario liberar el ratón con `Control` y hacer clic sobre el elemento correspondiente.

## ⋆𐙚₊˚⊹♡ Características principales

- **Entorno 3D en primera persona:** exploración del laberinto mediante cámara controlada por el ratón.
- **Laberinto procedural a partir de texto:** construcción del escenario leyendo una matriz de caracteres desde un archivo `.txt`.
- **Sistema de movimiento:** desplazamiento en cuatro direcciones y detección de colisiones con los muros y objetos.
- **Sistema de interacción:** selección de objetos mediante raycasting y recogida mediante clic.
- **Objetos coleccionables:** huesos, relojes, pociones y llaves.
- **Sistema de progreso:** contador de huesos y aparición de la llave al completar la colección.
- **Sprint:** aumento de velocidad desbloqueado mediante una poción, con barra de energía que se consume y se recarga.
- **Temporizador:** cuenta atrás de cinco minutos con posibilidad de obtener tiempo adicional.
- **Puerta animada:** mecanismo de apertura condicionado a disponer de la llave.
- **Minimapa:** representación del laberinto, la posición del jugador y su orientación.
- **Iluminación ambiental:** linterna, luces puntuales y efectos de parpadeo en determinadas zonas.
- **Interfaz de usuario:** indicadores de objetos, temporizador, barra de sprint, mensajes de alerta y pantallas de victoria y derrota.
- **Sistema de pausa:** posibilidad de reanudar, reiniciar o salir de la partida.

## ⋆𐙚₊˚⊹♡ Implementación técnica

El videojuego está desarrollado utilizando **Three.js**, una biblioteca de JavaScript que permite crear y representar escenas tridimensionales directamente en el navegador mediante WebGL.

### ⋆𐙚₊˚⊹♡ Construcción del laberinto

La clase `Laberinto` se encarga de construir el escenario a partir de un archivo de texto.

Cada carácter representa un elemento del mapa:

| **Carácter** | **Elemento** |
| ------------ | ------------ |
| `X` | Muro |
| Espacio | Casilla libre |
| `R` | Reloj |
| `P` | Poción |
| `H` | Hueso |
| `L` | Llave |
| `S` | Puerta de salida |

El archivo se lee mediante `THREE.FileLoader()` y se transforma en una matriz bidimensional. A partir de ella se crean los elementos correspondientes y se colocan en sus posiciones dentro de la escena.

Los muros se construyen utilizando geometrías `BoxGeometry` y materiales `MeshStandardMaterial`, a los que se aplican mapas de color, normales, rugosidad, oclusión ambiental y desplazamiento para conseguir una apariencia de piedra.

### ⋆𐙚₊˚⊹♡ Controlador del jugador

La clase `MyScene` gestiona la escena principal y el comportamiento general de la partida.

El jugador utiliza una cámara en perspectiva (`PerspectiveCamera`) junto con `PointerLockControls`, que permite controlar la orientación de la cámara mediante el ratón.

El movimiento se calcula en función de la dirección hacia la que mira el jugador y las teclas pulsadas. También se incorpora un pequeño efecto de movimiento vertical de la cámara al caminar para dar una mayor sensación de desplazamiento.

### ⋆𐙚₊˚⊹♡ Sistema de colisiones

Para evitar que el jugador atraviese las paredes y determinados objetos, se utilizan dos objetos `THREE.Raycaster`.

Uno realiza comprobaciones desde la posición de la cámara y otro desde una altura inferior, permitiendo detectar obstáculos situados a diferentes alturas.

Antes de permitir un desplazamiento, se comprueba si alguno de los rayos intersecta con un objeto que bloquee el movimiento.

### ⋆𐙚₊˚⊹♡ Sistema de interacción y recogida

La interacción con los objetos se implementa mediante otro `Raycaster`, que proyecta un rayo desde la cámara en función de la posición del ratón.

Cuando se hace clic, se comprueba si el objeto seleccionado pertenece a alguno de los tipos interactuables.

Los objetos recogidos se ocultan de la escena y se actualizan los elementos correspondientes de la interfaz.

Cada tipo de objeto tiene un comportamiento diferente:

- Los huesos incrementan el contador.
- Los relojes añaden un minuto al temporizador.
- Las pociones desbloquean el sprint.
- Las llaves permiten interactuar con la puerta de salida.

### ⋆𐙚₊˚⊹♡ Modelado de objetos 3D

Se han desarrollado diferentes objetos utilizando geometrías de Three.js, materiales físicos y operaciones de geometría constructiva (CSG).

Entre ellos se encuentran:

- **Hueso:** modelo tridimensional utilizado como elemento coleccionable.
- **Llave:** objeto que se recoge después de completar la búsqueda de los huesos.
- **Poción:** botella con materiales transparentes y líquido interior.
- **Reloj:** modelo con diferentes piezas geométricas y componentes móviles.
- **Puerta:** modelo 3D importado mediante `GLTFLoader`, con un pomo interactuable y animación de apertura.
- **Lámpara:** elemento de iluminación y ambientación del escenario.

Para las operaciones de geometría constructiva se utiliza `three-bvh-csg`, permitiendo combinar y sustraer volúmenes para construir modelos más elaborados.

### ⋆𐙚₊˚⊹♡ Sistema de sprint

La poción desbloquea una mecánica de carrera que permite aumentar la velocidad de desplazamiento mientras se mantiene pulsada la tecla `Shift`.

El sprint dispone de una energía limitada que disminuye mientras se utiliza y se recupera automáticamente cuando se deja de correr.

La energía se representa mediante una barra visual que se actualiza durante la partida.

### ⋆𐙚₊˚⊹♡ Temporizador y estados de partida

El temporizador comienza con cinco minutos y se actualiza cada segundo.

La recogida de relojes añade 60 segundos al tiempo disponible. Cuando el contador llega a cero, se activa el estado de derrota y se muestra la pantalla correspondiente.

Por otro lado, cuando el jugador abre la puerta con la llave, se activa la secuencia de victoria y se calcula el tiempo empleado en completar el recorrido.

### ⋆𐙚₊˚⊹♡ Minimapa

El minimapa se genera mediante elementos de dibujo en un `Canvas` 2D.

Representa las paredes del laberinto y la posición actual del jugador. También incorpora una indicación de la dirección hacia la que está mirando, facilitando la orientación durante la exploración.

### ⋆𐙚₊˚⊹♡ Iluminación y ambientación

La escena utiliza diferentes fuentes de iluminación para crear una atmósfera oscura y misteriosa.

Se incorpora una linterna asociada a la cámara del jugador, luces puntuales en determinados elementos y una niebla exponencial (`FogExp2`) que limita la visibilidad.

Algunas luces tienen una intensidad variable para generar un efecto de parpadeo y reforzar la ambientación de las catacumbas.

### ⋆𐙚₊˚⊹♡ Interfaz de usuario

La interfaz se desarrolla mediante HTML y CSS, superpuesta a la escena tridimensional.

Incluye el contador de huesos, los objetos recogidos, el temporizador, la barra de sprint y diferentes pantallas que informan del estado de la partida.

También incorpora mensajes temporales para comunicar eventos importantes, como la aparición de la llave o el desbloqueo del sprint.

## ⋆𐙚₊˚⊹♡ Estructura del proyecto

El proyecto se organiza en diferentes directorios según la funcionalidad de cada elemento:

```text
Práctica/
│
├── laberinto/
│   ├── index.html
│   ├── MyScene.js
│   ├── Laberinto.js
│   ├── mi_laberinto.txt
│   ├── mi_laberinto2.txt
│   │
│   ├── img/
│   │   ├── hueso.png
│   │   ├── llave.png
│   │   ├── pocion.png
│   │   └── reloj.png
│   │
│   └── texturas/
│       ├── catacumba/
│       ├── Grass/
│       ├── PavingSto/
│       └── suelo/
│
├── modelos/
│   ├── hueso/
│   ├── llave/
│   ├── lampara/
│   ├── pocion/
│   ├── puerta/
│   ├── reloj/
│   └── textures/
│
├── libs/
│   ├── three.module.js
│   ├── three-bvh-csg.js
│   ├── GLTFLoader.js
│   ├── PointerLockControls.js
│   └── ...
│
├── fonts/
├── imgs/
├── models/
│   └── porsche911/
│
└── server.py
```

## ⋆𐙚₊˚⊹♡ Tecnologías y herramientas

- **JavaScript:** programación de la lógica del juego y comportamiento de los objetos.
- **Three.js:** creación y representación de escenas y modelos tridimensionales.
- **WebGL:** renderizado gráfico en el navegador.
- **HTML5 y CSS3:** estructura y diseño de la interfaz.
- **PointerLockControls:** control de cámara en primera persona.
- **GLTFLoader:** importación de modelos 3D en formato GLTF/GLB.
- **three-bvh-csg:** operaciones de geometría constructiva.
- **Python:** servidor HTTP local para ejecutar el proyecto.

## ⋆𐙚₊˚⊹♡ Cómo ejecutar el proyecto

El juego necesita ejecutarse mediante un servidor local para que el navegador pueda cargar correctamente los módulos JavaScript, las texturas y los modelos.

1. Instala Python si todavía no lo tienes.
2. Clona o descarga este repositorio.
3. Abre una terminal dentro de la carpeta `Práctica`.
4. Ejecuta el servidor:

```bash
python server.py
```

5. Abre el navegador y accede a:

```text
http://localhost:8010/laberinto/index.html
```

6. Haz clic en la escena para comenzar a explorar las catacumbas.

> **Nota:** es importante mantener la estructura de carpetas y los recursos originales del proyecto para que se carguen correctamente los modelos, las texturas y las bibliotecas utilizadas.

## ────𐂯──── Autora ────𐂯────

**Diana Peven Kobtseva**  
Estudiante de Ingeniería Informática — Universidad de Granada  
Asignatura: Sistemas Gráficos

---

*Desarrollado con JavaScript, Three.js y WebGL.*  
*¿Conseguirás encontrar la salida antes de que se agote el tiempo?*  
