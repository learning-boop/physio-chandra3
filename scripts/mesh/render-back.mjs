/* Software render of the BACK of the model, geometry + stored normals only —
 * no textures, no lighting rig. Whatever shows up here is in the mesh itself,
 * which is what makes it the right tool for telling a real surface feature
 * apart from something painted into a texture map.
 *
 * Usage: node scripts/mesh/render-back.mjs <model.glb> <out.png> [width]
 */
import fs from 'node:fs'
import zlib from 'node:zlib'
import { readGlb, decodeView } from './glb-io.mjs'

const SRC = process.argv[2] || 'public/models/body-v14.glb'
const OUT = process.argv[3] || 'back.png'
const W = Number(process.argv[4] || 700)

// view box on the back (model units)
const Z0 = -0.26, Z1 = 0.26, Y0 = 0.24, Y1 = 0.76
const H = Math.round(W * (Y1 - Y0) / (Z1 - Z0))

const { json, bin } = await readGlb(SRC)
const prim = json.meshes[0].primitives[0]
const posAcc = json.accessors[prim.attributes.POSITION]
const posBytes = await decodeView(json, bin, posAcc.bufferView)
const nrmBytes = await decodeView(json, bin, json.accessors[prim.attributes.NORMAL].bufferView)
const idxBytes = await decodeView(json, bin, json.accessors[prim.indices].bufferView)
const P = new Int16Array(posBytes.buffer, posBytes.byteOffset, posBytes.byteLength / 2)
const NR = new Int16Array(nrmBytes.buffer, nrmBytes.byteOffset, nrmBytes.byteLength / 2)
const IDX = new Uint32Array(idxBytes.buffer, idxBytes.byteOffset, idxBytes.byteLength / 4)
const Q = 32767, ST = 4
const USE_GEO = process.argv[5] === 'geo'   // recompute normals from positions

// camera behind the figure, looking toward +x; keep the nearest (most -x) surface
const zbuf = new Float64Array(W * H).fill(Infinity)
const shade = new Float64Array(W * H)
const px = (z) => ((z - Z0) / (Z1 - Z0)) * W          // +z (figure's left) to the right
const py = (y) => ((Y1 - y) / (Y1 - Y0)) * H

// light from the upper left-front of the viewer, grazing enough to read relief
const LX = -0.62, LY = 0.55, LZ = -0.56
const LL = Math.hypot(LX, LY, LZ)
const lx = LX / LL, ly = LY / LL, lz = LZ / LL

const vx = (i) => P[i * ST] / Q, vy = (i) => P[i * ST + 1] / Q, vz = (i) => P[i * ST + 2] / Q
let GN = null
if (USE_GEO) {
  const VC = P.length / ST
  const wm = new Map(); const weld = new Int32Array(VC)
  for (let i = 0; i < VC; i++) {
    const k = ((P[i*ST]+32768)*65536 + (P[i*ST+1]+32768))*65536 + (P[i*ST+2]+32768)
    const r = wm.get(k); if (r === undefined) { wm.set(k, i); weld[i] = i } else weld[i] = r
  }
  GN = new Float64Array(VC * 3)
  for (let t = 0; t < IDX.length; t += 3) {
    const a = weld[IDX[t]], b = weld[IDX[t+1]], c = weld[IDX[t+2]]
    const e1x = vx(b)-vx(a), e1y = vy(b)-vy(a), e1z = vz(b)-vz(a)
    const e2x = vx(c)-vx(a), e2y = vy(c)-vy(a), e2z = vz(c)-vz(a)
    const cx = e1y*e2z - e1z*e2y, cy = e1z*e2x - e1x*e2z, cz = e1x*e2y - e1y*e2x
    for (const v of [a,b,c]) { GN[v*3]+=cx; GN[v*3+1]+=cy; GN[v*3+2]+=cz }
  }
  const g2 = new Float64Array(VC * 3)
  for (let i = 0; i < VC; i++) { const w = weld[i]
    const L = Math.hypot(GN[w*3],GN[w*3+1],GN[w*3+2]) || 1
    g2[i*3]=GN[w*3]/L; g2[i*3+1]=GN[w*3+1]/L; g2[i*3+2]=GN[w*3+2]/L }
  GN = g2
}
const nxOf = (i) => GN ? GN[i*3] : NR[i * ST] / Q
const nyOf = (i) => GN ? GN[i*3+1] : NR[i * ST + 1] / Q
const nzOf = (i) => GN ? GN[i*3+2] : NR[i * ST + 2] / Q

for (let t = 0; t < IDX.length; t += 3) {
  const a = IDX[t], b = IDX[t + 1], c = IDX[t + 2]
  if (vx(a) > 0 && vx(b) > 0 && vx(c) > 0) continue          // front half: skip
  const ax = px(vz(a)), ay = py(vy(a)), bx = px(vz(b)), by = py(vy(b)), cx = px(vz(c)), cy = py(vy(c))
  const minX = Math.max(0, Math.floor(Math.min(ax, bx, cx))), maxX = Math.min(W - 1, Math.ceil(Math.max(ax, bx, cx)))
  const minY = Math.max(0, Math.floor(Math.min(ay, by, cy))), maxY = Math.min(H - 1, Math.ceil(Math.max(ay, by, cy)))
  if (minX > maxX || minY > maxY) continue
  const den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
  if (Math.abs(den) < 1e-12) continue
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const pxc = x + 0.5, pyc = y + 0.5
      const w0 = ((by - cy) * (pxc - cx) + (cx - bx) * (pyc - cy)) / den
      const w1 = ((cy - ay) * (pxc - cx) + (ax - cx) * (pyc - cy)) / den
      const w2 = 1 - w0 - w1
      if (w0 < 0 || w1 < 0 || w2 < 0) continue
      const depth = w0 * vx(a) + w1 * vx(b) + w2 * vx(c)
      const k = y * W + x
      if (depth >= zbuf[k]) continue
      zbuf[k] = depth
      let nx = w0 * nxOf(a) + w1 * nxOf(b) + w2 * nxOf(c)
      let ny = w0 * nyOf(a) + w1 * nyOf(b) + w2 * nyOf(c)
      let nz = w0 * nzOf(a) + w1 * nzOf(b) + w2 * nzOf(c)
      const L = Math.hypot(nx, ny, nz) || 1
      nx /= L; ny /= L; nz /= L
      const diff = Math.max(0, nx * lx + ny * ly + nz * lz)
      // a tight specular term is what makes millimetre relief legible
      const hx = lx - 1, hy = ly, hz = lz
      const hl = Math.hypot(hx, hy, hz) || 1
      const spec = Math.pow(Math.max(0, (nx * hx + ny * hy + nz * hz) / hl), 28)
      shade[k] = 0.20 + 0.72 * diff + 0.55 * spec
    }
  }
}

// grayscale PNG
const raw = Buffer.alloc((W + 1) * H)
for (let y = 0; y < H; y++) {
  raw[y * (W + 1)] = 0
  for (let x = 0; x < W; x++) {
    const k = y * W + x
    const v = zbuf[k] === Infinity ? 0.06 : Math.max(0, Math.min(1, shade[k]))
    raw[y * (W + 1) + 1 + x] = Math.round(Math.pow(v, 1 / 2.2) * 255)
  }
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crcTable = chunk.table || (chunk.table = (() => {
    const t = new Int32Array(256)
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c }
    return t
  })())
  let crc = -1
  for (const byte of td) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE((crc ^ -1) >>> 0)
  return Buffer.concat([len, td, crcBuf])
}
const ihdr = Buffer.alloc(13)
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4)
ihdr[8] = 8; ihdr[9] = 0; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
fs.writeFileSync(OUT, Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
]))
console.log('wrote', OUT, W + 'x' + H, 'from', SRC)
