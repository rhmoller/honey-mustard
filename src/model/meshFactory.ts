import { MeshData } from "./MeshData";

export function createGroundPlane(size = 512) {
  const indices = [0, 1, 2, 3, 4, 5];
  const sz = size / 2;
  const positions = [-sz, 0, -sz, +sz, 0, -sz, +sz, 0, +sz, +sz, 0, +sz, -sz, 0, +sz, -sz, 0, -sz];
  const tsz = size / 512;
  const texCoords = [0, 0, tsz, 0, tsz, tsz, tsz, tsz, 0, tsz, 0, 0];

  const mesh: MeshData = {
    name: "Ground",
    size: 6,
    textures: ["/assets/checkers.jpg"],
    indexBuffer: new Uint16Array(indices),
    attributes: [
      {
        name: "POSITION",
        buffer: new Float32Array(positions),
        byteOffset: 0,
        stride: 0
      },
      {
        name: "TEXCOORD_0",
        buffer: new Float32Array(texCoords),
        byteOffset: 0,
        stride: 0
      }
    ]
  };

  return mesh;
}
