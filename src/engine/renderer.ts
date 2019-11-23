import { Mesh } from "../model/Mesh";

export function renderMesh(
  gl: WebGLRenderingContext,
  mesh: Mesh,
  positionLocation: number,
  texCoordLocation: number
) {
  const position = mesh.attributes.POSITION;
  gl.bindBuffer(gl.ARRAY_BUFFER, position.buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(
    positionLocation,
    3,
    gl.FLOAT,
    false,
    position.stride,
    position.byteOffset
  );

  const texCoord = mesh.attributes.TEXCOORD_0;
  gl.bindBuffer(gl.ARRAY_BUFFER, texCoord.buffer);
  gl.enableVertexAttribArray(texCoordLocation);
  gl.vertexAttribPointer(
    texCoordLocation,
    2,
    gl.FLOAT,
    false,
    texCoord.stride,
    texCoord.byteOffset
  );

  gl.bindTexture(gl.TEXTURE_2D, mesh.textures![0]);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer!);

  gl.drawElements(gl.TRIANGLES, mesh.size, gl.UNSIGNED_SHORT, 0);
}
