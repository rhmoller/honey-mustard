import { MeshData } from "./MeshData";

export interface Attribute {
  name: string;
  buffer: WebGLBuffer;
  byteOffset: number;
  stride: number;
}

export interface Mesh {
  name?: string;
  indexBuffer?: WebGLBuffer;
  attributes: Record<string, Attribute>;
  textures?: WebGLTexture[];
  size: number;
}

function loadTexture(gl: WebGLRenderingContext, textureInfo: string | Uint8Array) {
  const texture = gl.createTexture()!;
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

  if (typeof textureInfo === "string") {
    const image = new Image();
    image.addEventListener("load", () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
    });
    image.src = textureInfo;
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

    const bytes = textureInfo as Uint8Array;
    const blob = new Blob([bytes], { type: "image/png" });
    image.src = URL.createObjectURL(blob);
  }
  return texture;
}

export function createMesh(gl: WebGLRenderingContext, mesh: MeshData): Mesh {
  const indexBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer!, gl.STATIC_DRAW);

  const positionBufferData = mesh.attributes.find(attribute => attribute.name == "POSITION")!;
  const positionBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer!);
  gl.bufferData(gl.ARRAY_BUFFER, positionBufferData.buffer, gl.STATIC_DRAW);

  const texCoordBufferData = mesh.attributes.find(attribute => attribute.name == "TEXCOORD_0")!;
  const texCoordBuffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, texCoordBufferData.buffer, gl.STATIC_DRAW);

  return {
    name: mesh.name,
    size: mesh.size,
    textures: mesh.textures?.map(info => loadTexture(gl, info)),
    indexBuffer,
    attributes: {
      POSITION: {
        ...positionBufferData,
        buffer: positionBuffer
      },
      TEXCOORD_0: {
        ...texCoordBufferData,
        buffer: texCoordBuffer
      }
    }
  };
}
