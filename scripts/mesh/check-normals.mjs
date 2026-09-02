/* Is the "disc" on the upper back baked into the stored vertex NORMALS?
 * Compares each stored normal with the normal the geometry itself implies,
 * and maps the deviation over the back. A smooth surface whose stored normals
 * swirl in a circle renders as a disc even though the positions are flat.
 */
import { readGlb, decodeView } from './glb-io.mjs'

const src = process.argv[2] || 'public/models/body-v14.glb'
const { json, bin } = await readGlb(src)
const prim = json.meshes[0].primitives[0]
const posAcc = json.accessors[prim.attributes.POSITION]
const posBytes = await decodeView(json, bin, posAcc.bufferView)
const nrmBytes = await decodeView(json, bin, json.accessors[prim.attributes.NORMAL].bufferView)
const idxBytes = await decodeView(json, bin, json.accessors[prim.indices].bufferView)
const P = new Int16Array(posBytes.buffer, posBytes.byteOffset, posBytes.byteLength / 2)
const NR = new Int16Array(nrmBytes.buffer, nrmBytes.byteOffset, nrmBytes.byteLength / 2)
const IDX = new Uint32Array(idxBytes.buffer, idxBytes.byteOffset, idxBytes.byteLength / 4)
const V = posAcc.count, ST = 4, Q = 32767

const X = new Float64Array(V), Y = new Float64Array(V), Z = new Float64Array(V)
for (let i = 0; i < V; i++) { X[i] = P[i * ST] / Q; Y[i] = P[i * ST + 1] / Q; Z[i] = P[i * ST + 2] / Q }

const rep = new Map(); const weld = new Int32Array(V)
for (let i = 0; i < V; i++) {
  const k = ((P[i * ST] + 32768) * 65536 + (P[i * ST + 1] + 32768)) * 65536 + (P[i * ST + 2] + 32768)
  const r = rep.get(k)
  if (r === undefined) { rep.set(k, i); weld[i] = i } else weld[i] = r
}
const ax = new Float64Array(V), ay = new Float64Array(V), az = new Float64Array(V)
for (let t = 0; t < IDX.length; t += 3) {
  const a = weld[IDX[t]], b = weld[IDX[t + 1]], c = weld[IDX[t + 2]]
  const e1x = X[b] - X[a], e1y = Y[b] - Y[a], e1z = Z[b] - Z[a]
  const e2x = X[c] - X[a], e2y = Y[c] - Y[a], e2z = Z[c] - Z[a]
  const cx = e1y * e2z - e1z * e2y, cy = e1z * e2x - e1x * e2z, cz = e1x * e2y - e1y * e2x
  ax[a] += cx; ay[a] += cy; az[a] += cz; ax[b] += cx; ay[b] += cy; az[b] += cz; ax[c] += cx; ay[c] += cy; az[c] += cz
}
// deviation in degrees between stored and geometric normal, mapped over the back
console.log('STORED-vs-GEOMETRIC NORMAL DEVIATION (degrees) over the back')
console.log('   y  |' + [...Array(15)].map((_, i) => (-0.21 + i * 0.03).toFixed(2).padStart(6)).join(''))
for (let y = 0.62; y >= 0.34; y -= 0.02) {
  const row = []
  for (let zc = -0.21; zc <= 0.211; zc += 0.03) {
    let sum = 0, n = 0
    for (let i = 0; i < V; i++) {
      if (X[i] > -0.09) continue
      if (Math.abs(Y[i] - y) > 0.01 || Math.abs(Z[i] - zc) > 0.015) continue
      const w = weld[i]
      const gl = Math.hypot(ax[w], ay[w], az[w]) || 1
      const sx = NR[i * ST] / Q, sy = NR[i * ST + 1] / Q, sz = NR[i * ST + 2] / Q
      const sl = Math.hypot(sx, sy, sz) || 1
      const dot = (ax[w] / gl) * (sx / sl) + (ay[w] / gl) * (sy / sl) + (az[w] / gl) * (sz / sl)
      sum += Math.acos(Math.max(-1, Math.min(1, dot))) * 180 / Math.PI
      n++
    }
    row.push(n ? (sum / n).toFixed(1).padStart(6) : '     .')
  }
  console.log(y.toFixed(2).padStart(6) + ' |' + row.join(''))
}
