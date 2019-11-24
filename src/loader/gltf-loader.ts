import { toByteArray } from "base64-js";
import { MeshData } from "../model/MeshData";

interface Buffer {
  uri?: string;
  byteLength: number;
  name?: string;
}

interface BufferView {
  buffer: number;
  byteLength: number;
  byteOffset?: number;
  byteStride?: number;
}

interface Image {
  uri?: string;
  bufferView?: number;
}

export enum ComponentType {
  GLTF_FLOAT = 5126,
  GLTF_UNSIGNED_SHORT = 5123
}

function createViewBuffer(buffer: ArrayBufferLike, view: BufferView, componentType: ComponentType) {
  switch (componentType) {
    case ComponentType.GLTF_UNSIGNED_SHORT:
      return new Uint16Array(buffer, view.byteOffset || 0, view.byteLength / 2);
    case ComponentType.GLTF_FLOAT:
      return new Float32Array(buffer, view.byteOffset || 0, view.byteLength / 4);
  }
}

export function loadFirstMesh(gltf: string): MeshData {
  const json = JSON.parse(gltf);
  const buffers = (json.buffers as Buffer[])
    .filter(buffer => buffer.uri!.startsWith("data:"))
    .map(buffer => {
      const bufferBase64 = buffer.uri!.substring(37);
      return toByteArray(bufferBase64).buffer;
    });

  const mesh: Partial<MeshData> = {};

  const textureInfo = json.meshes[0].primitives[0];

  if (typeof textureInfo.indices !== "undefined") {
    const indexAccessor = json.accessors[textureInfo.indices];
    const viewIdx = indexAccessor.bufferView;
    const view = json.bufferViews[viewIdx];
    mesh.indexBuffer = new Uint16Array(buffers[0], view.byteOffset, view.byteLength / 2);
    mesh.size = indexAccessor.count;
  }

  mesh.attributes = [];

  Object.entries(textureInfo.attributes).forEach(entry => {
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
    mesh.textures = (json.images as Image[]).map(info => {
      if (info.uri) {
        return info.uri;
      } else {
        const view = json.bufferViews[info.bufferView!];
        const buffer = buffers[view.buffer];
        return new Uint8Array(buffer, view.byteOffset, view.byteLength);
      }
    });
  }
  return mesh as MeshData;
}
