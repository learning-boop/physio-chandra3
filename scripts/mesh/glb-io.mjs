// Minimal GLB read/patch helpers for body-v14.glb: decode the meshopt-compressed,
// quantized POSITION/NORMAL/index streams, and write them back the same way.
import fs from 'node:fs'
import { MeshoptDecoder } from 'meshoptimizer/decoder'
import { MeshoptEncoder } from 'meshoptimizer/encoder'

export async function readGlb(path) {
  const buf = fs.readFileSync(path)
  const jsonLen = buf.readUInt32LE(12)
  const json = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen))
  const binOff = 20 + jsonLen + 8
  const binLen = buf.readUInt32LE(20 + jsonLen)
  const bin = buf.subarray(binOff, binOff + binLen)
  return { json, bin, buf }
}

// Decode one meshopt-compressed bufferView into raw bytes.
export async function decodeView(json, bin, viewIndex) {
  await MeshoptDecoder.ready
  const bv = json.bufferViews[viewIndex]
  const ext = bv.extensions?.EXT_meshopt_compression
  if (!ext) return new Uint8Array(bin.subarray(bv.byteOffset, bv.byteOffset + bv.byteLength))
  const src = new Uint8Array(bin.subarray(ext.byteOffset, ext.byteOffset + ext.byteLength))
  const out = new Uint8Array(ext.count * ext.byteStride)
  const filter = ext.filter && ext.filter !== 'NONE' ? ext.filter : undefined
  MeshoptDecoder.decodeGltfBuffer(out, ext.count, ext.byteStride, src, ext.mode, filter)
  return out
}

export { MeshoptEncoder }
