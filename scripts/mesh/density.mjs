/* Triangle density over the back: mean edge length (mm) per cell.
 * A patch of much coarser triangles reads as a flat, matte disc no matter
 * what the textures or normals say.
 */
import { readGlb, decodeView } from './glb-io.mjs'

const src = process.argv[2] || 'public/models/body-v14.glb'
const { json, bin } = await readGlb(src)
const prim = json.meshes[0].primitives[0]
const posAcc = json.accessors[prim.attributes.POSITION]
const posBytes = await decodeView(json, bin, posAcc.bufferView)
const idxBytes = await decodeView(json, bin, json.accessors[prim.indices].bufferView)
const P = new Int16Array(posBytes.buffer, posBytes.byteOffset, posBytes.byteLength / 2)
const IDX = new Uint32Array(idxBytes.buffer, idxBytes.byteOffset, idxBytes.byteLength / 4)
const ST = 4, Q = 32767, MM = 0.00114
const vx = (i) => P[i * ST] / Q, vy = (i) => P[i * ST + 1] / Q, vz = (i) => P[i * ST + 2] / Q

const Y0 = 0.34, Y1 = 0.64, ZR = 0.20, STEP = 0.01
const rows = Math.round((Y1 - Y0) / STEP) + 1, cols = Math.round((2 * ZR) / STEP) + 1
const sum = new Float64Array(rows * cols), cnt = new Float64Array(rows * cols)
for (let t = 0; t < IDX.length; t += 3) {
  const a = IDX[t], b = IDX[t + 1], c = IDX[t + 2]
  const cx = (vx(a) + vx(b) + vx(c)) / 3, cy = (vy(a) + vy(b) + vy(c)) / 3, cz = (vz(a) + vz(b) + vz(c)) / 3
  if (cx > -0.09 || cy < Y0 || cy > Y1 || Math.abs(cz) > ZR) continue
  const e = (Math.hypot(vx(a) - vx(b), vy(a) - vy(b), vz(a) - vz(b))
    + Math.hypot(vx(b) - vx(c), vy(b) - vy(c), vz(b) - vz(c))
    + Math.hypot(vx(c) - vx(a), vy(c) - vy(a), vz(c) - vz(a))) / 3
  const r = Math.round((cy - Y0) / STEP), cc = Math.round((cz + ZR) / STEP)
  sum[r * cols + cc] += e / MM; cnt[r * cols + cc]++
}
console.log(`MEAN TRIANGLE EDGE LENGTH in mm  [${src}]`)
console.log('   y  |' + [...Array(cols)].map((_, i) => (-ZR + i * STEP).toFixed(2).padStart(5)).join(''))
for (let r = rows - 1; r >= 0; r--) {
  let line = (Y0 + r * STEP).toFixed(2).padStart(6) + ' |'
  for (let c = 0; c < cols; c++) {
    const k = r * cols + c
    line += cnt[k] ? (sum[k] / cnt[k]).toFixed(1).padStart(5) : '    .'
  }
  console.log(line)
}
