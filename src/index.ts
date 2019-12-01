import { createCanvas, createProgram, createShader, handleViewportChange, initWebGL } from "./canvasUtil";
import vertexShaderSrc from "./shaders/textured.vert.glsl";
import fragmentShaderSrc from "./shaders/textured.frag.glsl";
import { mat4 } from "gl-matrix";
import { loadFirstMesh } from "./loader/gltf-loader";
import { createGroundPlane } from "./model/meshFactory";
import { createMesh } from "./model/Mesh";
import { renderMesh } from "./engine/renderer";
import { vadd } from "./math/vector";

const canvas = createCanvas(window.innerWidth, window.innerHeight);
document.body.appendChild(canvas);

interface GamePad {
  left: boolean;
  up: boolean;
  right: boolean;
  down: boolean;
}

const gamePad: GamePad = { left: false, up: false, right: false, down: false };

fetch("/assets/Duck.gltf")
  .then(res => res.text())
  .then(gltf => {
    const duckData = loadFirstMesh(gltf);
    const groundPlaneData = createGroundPlane(5000);

    const gl = initWebGL(canvas);
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc)!;
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc)!;
    const program = createProgram(gl, vertexShader, fragmentShader)!;
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const texCoordLocation = gl.getAttribLocation(program, "a_texcoord");
    const matrixLocation = gl.getUniformLocation(program, "u_matrix");

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const duckMesh = createMesh(gl, duckData);
    const groundMesh = createMesh(gl, groundPlaneData);

    gl.useProgram(program);

    const proj = mat4.create();
    handleViewportChange(gl, proj);

    const view = mat4.create();
    const camera = {
      position: [0, 250, 250],
      lookAt: [0, 0, 0]
    };

    const duck = {
      position: [0, 0, 0]
    };

    const cam2obj = [0, 250, 250];

    window.addEventListener("keydown", e => {
      console.log(e.key);
      switch (e.key) {
        case "ArrowLeft":
          gamePad.left = true;
          break;
        case "ArrowUp":
          gamePad.up = true;
          break;
        case "ArrowRight":
          gamePad.right = true;
          break;
        case "ArrowDown":
          gamePad.down = true;
          break;
        case "F":
        case "f":
          canvas.requestFullscreen();
      }
    });

    window.addEventListener("keyup", e => {
      switch (e.key) {
        case "ArrowLeft":
          gamePad.left = false;
          break;
        case "ArrowUp":
          gamePad.up = false;
          break;
        case "ArrowRight":
          gamePad.right = false;
          break;
        case "ArrowDown":
          gamePad.down = false;
          break;
      }
    });

    window.addEventListener("touchstart", () => {
      if (document.fullscreenElement === null) {
        canvas.requestFullscreen();
      }
    });

    window.addEventListener("resize", eResize => {
      handleViewportChange(gl, proj);
    });

    window.addEventListener("orientationchange", eResize => {
      handleViewportChange(gl, proj);
    });

    function render() {
      gl.clearColor(0, 0, 0.5, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      mat4.lookAt(view, camera.position, camera.lookAt, [0, 1, 0]);
      mat4.mul(view, proj, view);
      gl.uniformMatrix4fv(matrixLocation, false, view);
      renderMesh(gl, groundMesh, positionLocation, texCoordLocation);

      mat4.lookAt(view, camera.position, camera.lookAt, [0, 1, 0]);
      mat4.translate(view, view, duck.position);
      mat4.mul(view, proj, view);
      gl.uniformMatrix4fv(matrixLocation, false, view);

      renderMesh(gl, duckMesh, positionLocation, texCoordLocation);
    }

    function update() {
      if (gamePad.left) {
        duck.position[0] -= 10;
      }
      if (gamePad.up) {
        duck.position[2] -= 10;
      }
      if (gamePad.right) {
        duck.position[0] += 10;
      }
      if (gamePad.down) {
        duck.position[2] += 10;
      }

      vadd(camera.position, duck.position, cam2obj);
      camera.lookAt = duck.position;
    }

    function loop() {
      requestAnimationFrame(loop);
      update();
      render();
    }
    requestAnimationFrame(loop);
  });
