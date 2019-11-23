import { createCanvas, createProgram, createShader, initWebGL } from "./canvasUtil";
import vertexShaderSrc from "./shaders/textured.vert.glsl";
import fragmentShaderSrc from "./shaders/textured.frag.glsl";
import { mat4 } from "gl-matrix";
import { loadFirstMesh } from "./loader/gltf-loader";
import { createGroundPlane } from "./model/meshFactory";

const canvas = createCanvas();
document.body.appendChild(canvas);

fetch("/assets/Duck.gltf")
  .then(res => res.text())
  .then(gltf => {
    // const mesh = loadFirstMesh(gltf);
    const mesh = createGroundPlane();

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

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer!, gl.STATIC_DRAW);

    const positionBufferData = mesh.attributes.find(attribute => attribute.name == "POSITION")!;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer!);
    gl.bufferData(gl.ARRAY_BUFFER, positionBufferData.buffer, gl.STATIC_DRAW);

    const texCoordBufferData = mesh.attributes.find(attribute => attribute.name == "TEXCOORD_0")!;

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoordBufferData.buffer, gl.STATIC_DRAW);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([255, 0, 255, 255])
    );

    if (typeof mesh.textures![0] === "string") {
      const image = new Image();
      image.addEventListener("load", () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
      });
      image.src = mesh.textures![0];
    } else {
      const image = new Image();

      image.addEventListener("load", () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
      });
      image.addEventListener("error", e => {
        console.error("failed to load", e);
      });

      const bytes = mesh.textures![0] as Uint8Array;
      const blob = new Blob([bytes], { type: "image/png" });
      image.src = URL.createObjectURL(blob);
    }

    function render() {
      gl.clearColor(0, 0, 0.5, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.useProgram(program);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(
        positionLocation,
        3,
        gl.FLOAT,
        false,
        positionBufferData.stride,
        positionBufferData.byteOffset
      );

      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.enableVertexAttribArray(texCoordLocation);
      gl.vertexAttribPointer(
        texCoordLocation,
        2,
        gl.FLOAT,
        false,
        texCoordBufferData.stride,
        texCoordBufferData.byteOffset
      );

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

      gl.drawElements(gl.TRIANGLES, mesh.size, gl.UNSIGNED_SHORT, 0);
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
