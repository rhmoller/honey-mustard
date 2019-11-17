import { toByteArray } from "base64-js";

const GLTF_ARRAY_BUFFER = 34962;
const GLTF_ELEMENT_ARRAY_BUFFER = 34963;

export enum ComponentType {
  GLTF_FLOAT = 5126,
  GLTF_UNSIGNED_SHORT = 5123
}

export interface Attribute {
  name: string;
  buffer: ArrayBufferLike;
  byteOffset: number;
  stride: number;
}

export interface Mesh {
  name?: string;
  indexBuffer?: Uint16Array;
  attributes: Attribute[];
  textures?: (string | Uint8Array)[];
  size: number;
}

function createViewBuffer(buffer: ArrayBufferLike, view: any, componentType: ComponentType) {
  switch (componentType) {
    case ComponentType.GLTF_UNSIGNED_SHORT:
      return new Uint16Array(buffer, view.byteOffset, view.byteLength / 2);
    case ComponentType.GLTF_FLOAT:
      return new Float32Array(buffer, view.byteOffset, view.byteLength / 4);
  }
}

export function loadFirstMesh(gltf: string): Mesh {
  const json = JSON.parse(gltf);
  const buffers = json.buffers
    .filter((buffer: any) => buffer.uri.startsWith("data:"))
    .map((buffer: any) => {
      const bufferBase64 = buffer.uri.substring(37);
      return toByteArray(bufferBase64).buffer;
    });

  const mesh: Partial<Mesh> = {};

  const meshInfo = json.meshes[0].primitives[0];

  if (typeof meshInfo.indices !== "undefined") {
    let indexAccessor = json.accessors[meshInfo.indices];
    const viewIdx = indexAccessor.bufferView;
    const view = json.bufferViews[viewIdx];
    mesh.indexBuffer = new Uint16Array(buffers[0], view.byteOffset, view.byteLength / 2);
    mesh.size = indexAccessor.count;
  }

  mesh.attributes = [];

  Object.entries(meshInfo.attributes).forEach(entry => {
    const key = entry[0];
    const value = entry[1] as number;
    const accessor = json.accessors[value];
    const view = json.bufferViews[accessor.bufferView];
    const buffer = createViewBuffer(buffers[view.buffer], view, accessor.componentType);
    mesh.attributes!.push({
      name: key,
      buffer: buffer,
      stride: view.byteStride || 0,
      byteOffset: accessor.byteOffset || 0
    });
    if (typeof mesh.size === "undefined") {
      mesh.size = accessor.count;
    }
  });

  mesh.textures = [];
  if (json.images) {
    mesh.textures = json.images.map((info: any) => {
      if (info.uri) {
        return info.uri;
      } else {
        const view = json.bufferViews[info.bufferView];
        const buffer = buffers[view.buffer];
        console.log("texture view", view);
        return new Uint8Array(buffer, view.byteOffset, view.byteLength);
      }
    });
  }
  console.log("textures are", mesh.textures);

  return mesh as Mesh;
}
