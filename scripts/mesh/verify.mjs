import fs from 'node:fs'
const mod = await import(process.env.DECODER || 'three/examples/jsm/libs/meshopt_decoder.module.js')
const MeshoptDecoder = mod.MeshoptDecoder
const src = process.argv[2]
const b = fs.readFileSync(src)
const jl = b.readUInt32LE(12)
const j = JSON.parse(b.toString('utf8', 20, 20 + jl))
const binOff = 20 + jl + 8
await MeshoptDecoder.ready
for (const [i, bv] of j.bufferViews.entries()) {
  const e = bv.extensions?.EXT_meshopt_compression
  if (!e) { console.log(`view ${i}: uncompressed ${bv.byteLength} bytes`); continue }
  const srcBytes = new Uint8Array(b.subarray(binOff + e.byteOffset, binOff + e.byteOffset + e.byteLength))
  const out = new Uint8Array(e.count * e.byteStride)
  try {
    MeshoptDecoder.decodeGltfBuffer(out, e.count, e.byteStride, srcBytes, e.mode, e.filter)
    console.log(`view ${i}: OK  mode=${e.mode} count=${e.count} stride=${e.byteStride} -> ${out.length} bytes`)
  } catch (err) {
    console.log(`view ${i}: FAIL mode=${e.mode} count=${e.count} stride=${e.byteStride} :: ${err.message}`)
  }
}
