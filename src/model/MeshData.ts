export interface AttributeData {
  name: string;
  buffer: ArrayBufferLike;
  byteOffset: number;
  stride: number;
}

export interface MeshData {
  name?: string;
  indexBuffer?: Uint16Array;
  attributes: AttributeData[];
  textures?: (string | Uint8Array)[];
  size: number;
}
