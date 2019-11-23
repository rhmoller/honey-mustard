import { createCanvas, createProgram, createShader, initWebGL } from "./canvasUtil";
import vertexShaderSrc from "./shaders/textured.vert.glsl";
import fragmentShaderSrc from "./shaders/textured.frag.glsl";
import { mat4 } from "gl-matrix";
import { loadFirstMesh } from "./loader/gltf-loader";
import { createGroundPlane } from "./model/meshFactory";
import { createMesh } from "./model/Mesh";
import { renderMesh } from "./engine/renderer";

const canvas = createCanvas();
document.body.appendChild(canvas);

fetch("/assets/Duck.gltf")
  .then(res => res.text())
  .then(gltf => {
    const duckData = loadFirstMesh(gltf);
    const groundPlaneData = createGroundPlane();

    const gl = initWebGL(canvas);
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSrc)!;
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSrc)!;
    const program = createProgram(gl, vertexShader, fragmentShader)!;
    gl.useProgram(program);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const texCoordLocation = gl.getAttribLocation(program, "a_texcoord");
    const matrixLocation = gl.getUniformLocation(program, "u_matrix");

    const proj = mat4.create();
    mat4.perspective(proj, 90, 1, 1, 1000);

    const view = mat4.create();
    mat4.lookAt(view, [0, 0, 100], [0, 0, 0], [0, 1, 0]);

    const matrix = mat4.create();
    mat4.mul(matrix, proj, view);

    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const duckMesh = createMesh(gl, duckData);
    const groundMesh = createMesh(gl, groundPlaneData);

    function render() {
      gl.clearColor(0, 0, 0.5, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.useProgram(program);
      renderMesh(gl, groundMesh, positionLocation, texCoordLocation);
      renderMesh(gl, duckMesh, positionLocation, texCoordLocation);
    }

    let t = 0;

    function loop() {
      requestAnimationFrame(loop);
      t += 0.03;

      const view = mat4.create();
      mat4.lookAt(view, [200 * Math.cos(t), 200, 200 * Math.sin(t)], [0, 0, 0], [0, 1, 0]);

      const matrix = mat4.create();
      mat4.mul(matrix, proj, view);

      gl.uniformMatrix4fv(matrixLocation, false, matrix);
      render();
    }

    requestAnimationFrame(loop);
  });
