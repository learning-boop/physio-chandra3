/* Zone map: renders the model from the FRONT and the BACK, painting every
 * surface point with the area classify() in Body3D.jsx assigns to it. The
 * classifier is lifted straight out of Body3D.jsx at run time, so the picture
 * is exactly what the site does — use it whenever a zone boundary is changed.
 *
 * Usage: node scripts/mesh/zone-map.mjs [model.glb] [out.png] [heightPx]
 */
import fs from 'node:fs'
import zlib from 'node:zlib'
import { readGlb, decodeView } from './glb-io.mjs'

const SRC = process.argv[2] || 'public/models/body-v15.glb'
const OUT = process.argv[3] || 'zone-map.png'
const HPX = Number(process.argv[4] || 900)

// ── classify() and its constants, taken from Body3D.jsx ──
const src = fs.readFileSync('src/components/Body3D.jsx', 'utf8')
const grab = (re, what) => { const m = src.match(re); if (!m) throw new Error('could not find ' + what + ' in Body3D.jsx'); return m[0] }
const code = [
  grab(/const FRONT_SIGN = [^\n]+/, 'FRONT_SIGN'),
  grab(/const ARM_SPLIT = [^\n]+/, 'ARM_SPLIT'),
  grab(/const NECK_SPLIT = [^\n]+/, 'NECK_SPLIT'),
  grab(/const CTJ_BOTTOM = [^\n]+/, 'CTJ_BOTTOM'),
  grab(/const TLJ_TOP = [^\n]+/, 'TLJ_TOP'),
  grab(/const TLJ_BOTTOM = [^\n]+/, 'TLJ_BOTTOM'),
  grab(/const SIJ_TOP = [^\n]+/, 'SIJ_TOP'),
  grab(/const COCCYX_TOP = [^\n]+/, 'COCCYX_TOP'),
  grab(/const COCCYX_BOTTOM = [^\n]+/, 'COCCYX_BOTTOM'),
  grab(/const COCCYX_HALF = [^\n]+/, 'COCCYX_HALF'),
  grab(/const JAW_TOP = [^\n]+/, 'JAW_TOP'),
  grab(/const UPPERARM_BOTTOM = [^\n]+/, 'UPPERARM_BOTTOM'),
  grab(/const ELBOW_BOTTOM = [^\n]+/, 'ELBOW_BOTTOM'),
  grab(/const FOREARM_BOTTOM = [^\n]+/, 'FOREARM_BOTTOM'),
  grab(/const armBand = [^\n]+/, 'armBand'),
  'const BODY_METRICS = { h: 1, cx: 0, cy: 0, cz: 0 }',
  grab(/function classify\(wx, wy, wz\) \{[\s\S]*?\n\}/, 'classify()'),
  'return { classify, BODY_METRICS }',
].join('\n')
const { classify, BODY_METRICS } = new Function(code)()

// ── mesh ──
const { json, bin } = await readGlb(SRC)
const prim = json.meshes[0].primitives[0]
const posAcc = json.accessors[prim.attributes.POSITION]
const posBytes = await decodeView(json, bin, posAcc.bufferView)
const idxAcc = json.accessors[prim.indices]
const idxBytes = await decodeView(json, bin, idxAcc.bufferView)
const stride = (json.bufferViews[posAcc.bufferView].extensions?.EXT_meshopt_compression?.byteStride
  || json.bufferViews[posAcc.bufferView].byteStride || 12)
let X, Y, Z, VC
if (posAcc.componentType === 5126) {            // float
  const F = new Float32Array(posBytes.buffer, posBytes.byteOffset, posBytes.byteLength / 4); const s = stride / 4
  VC = posAcc.count; X = (i) => F[i * s]; Y = (i) => F[i * s + 1]; Z = (i) => F[i * s + 2]
} else {                                          // int16 normalized (quantized)
  const S = new Int16Array(posBytes.buffer, posBytes.byteOffset, posBytes.byteLength / 2); const s = stride / 2
  const q = posAcc.normalized ? 32767 : 1
  VC = posAcc.count; X = (i) => S[i * s] / q; Y = (i) => S[i * s + 1] / q; Z = (i) => S[i * s + 2] / q
}
const IDX = idxAcc.componentType === 5125
  ? new Uint32Array(idxBytes.buffer, idxBytes.byteOffset, idxBytes.byteLength / 4)
  : new Uint16Array(idxBytes.buffer, idxBytes.byteOffset, idxBytes.byteLength / 2)

// Metrics exactly as measureBody() does it (uniform node scale cancels out).
let mnx = Infinity, mny = Infinity, mnz = Infinity, mxx = -Infinity, mxy = -Infinity, mxz = -Infinity
for (let i = 0; i < VC; i++) {
  mnx = Math.min(mnx, X(i)); mxx = Math.max(mxx, X(i)); mny = Math.min(mny, Y(i)); mxy = Math.max(mxy, Y(i)); mnz = Math.min(mnz, Z(i)); mxz = Math.max(mxz, Z(i))
}
BODY_METRICS.h = mxy - mny; BODY_METRICS.cx = (mnx + mxx) / 2; BODY_METRICS.cy = (mny + mxy) / 2; BODY_METRICS.cz = (mnz + mxz) / 2

const COLORS = {
  head: [150, 150, 150], neck: [230, 80, 80], shoulder: [70, 130, 230], upperback: [240, 190, 60], ctj: [255, 255, 255], tlj: [255, 90, 200], flank: [0, 255, 170], sij: [120, 220, 255], coccyx: [255, 0, 0], jaw: [255, 255, 0], upperarm: [255, 140, 0], forearm: [140, 255, 140],
  lowerback: [240, 130, 40], chest: [160, 90, 200], abdomen: [120, 70, 160], elbow: [60, 190, 190],
  wrist: [40, 150, 90], hip: [200, 110, 170], knee: [110, 200, 90], ankle: [90, 90, 200],
}
const typeOf = (id) => (id || '').replace(/[LR]$/, '')

// Two panels side by side: FRONT (viewer at +x) and BACK (viewer at -x).
const H = HPX, pad = 20
const spanZ = mxz - mnz, spanY = mxy - mny
const PW = Math.round(H * spanZ / spanY)
const W = PW * 2 + pad * 3
const img = Buffer.alloc(W * H * 3, 18)
for (const [panel, front] of [[0, true], [1, false]]) {
  const zb = new Float64Array(PW * H).fill(-Infinity)
  const ox = pad + panel * (PW + pad)
  // Front view: figure's right (−z… per FRONT_SIGN) appears on the viewer's left.
  const pxOf = (z) => front ? ((mxz - z) / spanZ) * (PW - 1) : ((z - mnz) / spanZ) * (PW - 1)
  const pyOf = (y) => ((mxy - y) / spanY) * (H - 1)
  for (let t = 0; t < IDX.length; t += 3) {
    const a = IDX[t], b = IDX[t + 1], c = IDX[t + 2]
    const ax = pxOf(Z(a)), ay = pyOf(Y(a)), bx = pxOf(Z(b)), by = pyOf(Y(b)), cx = pxOf(Z(c)), cy = pyOf(Y(c))
    const den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
    if (Math.abs(den) < 1e-12) continue
    const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx))), x1 = Math.min(PW - 1, Math.ceil(Math.max(ax, bx, cx)))
    const y0 = Math.max(0, Math.floor(Math.min(ay, by, cy))), y1 = Math.min(H - 1, Math.ceil(Math.max(ay, by, cy)))
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const w0 = ((by - cy) * (x + .5 - cx) + (cx - bx) * (y + .5 - cy)) / den
      const w1 = ((cy - ay) * (x + .5 - cx) + (ax - cx) * (y + .5 - cy)) / den
      const w2 = 1 - w0 - w1
      if (w0 < 0 || w1 < 0 || w2 < 0) continue
      const wx = w0 * X(a) + w1 * X(b) + w2 * X(c)
      const depth = front ? wx : -wx               // nearest to the viewer wins
      const k = y * PW + x
      if (depth <= zb[k]) continue
      zb[k] = depth
      const wy = w0 * Y(a) + w1 * Y(b) + w2 * Y(c), wz = w0 * Z(a) + w1 * Z(b) + w2 * Z(c)
      const col = COLORS[typeOf(classify(wx, wy, wz))] || [255, 255, 255]
      const o = (y * W + ox + x) * 3
      img[o] = col[0]; img[o + 1] = col[1]; img[o + 2] = col[2]
    }
  }
}

// PNG (RGB)
const raw = Buffer.alloc((W * 3 + 1) * H)
for (let y = 0; y < H; y++) { raw[y * (W * 3 + 1)] = 0; img.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3) }
const crcT = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c })
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type), data]); let crc = -1
  for (const b of td) crc = crcT[(crc ^ b) & 0xff] ^ (crc >>> 8)
  const cb = Buffer.alloc(4); cb.writeUInt32BE((crc ^ -1) >>> 0); return Buffer.concat([len, td, cb])
}
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2
fs.writeFileSync(OUT, Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]))
console.log('wrote', OUT, `${W}x${H}`, '— left: FRONT, right: BACK')
console.log('legend:', Object.keys(COLORS).join(', '))
