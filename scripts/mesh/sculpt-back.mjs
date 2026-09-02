/* Correct the upper/mid back of body-v14.glb -> body-v15.glb.
 *
 * Same model, same textures, same UV layout, same materials, same proportions.
 * Only the posterior torso between the waistband and the neck is touched.
 *
 * WHAT IS WRONG WITH THE SOURCE
 * Two patches over the shoulder blades were left by the generator at 10-27 mm
 * triangle spacing while the rest of the body is at ~3 mm. A patch that coarse
 * is flat by construction, so it renders as a matte disc with a hard rim —
 * which is why the back reads as artificial, and why it cannot be fixed by
 * moving the vertices that are there.
 *
 * WHAT THIS DOES, in order
 *   1. REFINE   split those patches down to the density of the surrounding
 *               mesh (red-green, so no cracks)
 *   2. SMOOTH   Taubin smoothing inside the patches to remove the facets
 *   3. LEVEL    pull the patch back onto the surface its surroundings imply,
 *               removing the dish and its rim
 *   4. SCULPT   add the anatomy: erector columns, scapular spine and medial
 *               border, trapezius, lats
 *
 * Model space (raw GLB units, figure is 2 units tall):
 *   +x = FRONT   -x = BACK        1 mm ~= 0.00114 units
 *   +y = up (soles -1, crown +1)
 *   +z = figure's LEFT;  az = |z| = distance from the spine
 */
import fs from 'node:fs'
import { readGlb, decodeView, MeshoptEncoder } from './glb-io.mjs'
import { refineRegion, taubinSmooth } from './refine.mjs'

const MM = 0.00114
const SRC = 'public/models/body-v14.glb'
const DST = 'public/models/body-v15.glb'

// the two coarse patches, as a circle in (height, distance-from-spine)
const PATCH = { y: 0.487, az: 0.111, r: 0.082, feather: 0.030 }
const TARGET_EDGE = 4.2 * MM              // refine until edges are this short

// ── anatomy ──────────────────────────────────────────────────────────────
// NO ISOTROPIC BLOBS: a round bump on a back reads as a mark, not muscle.
// Every feature is a ridge or trough along an anatomical line.
const A = {
  spineFurrow:  { amp: -1.0 * MM, sz: 0.017, y0: 0.315, y1: 0.600 },
  erector:      { amp: 3.0 * MM, az: 0.052, sz: 0.040, y0: 0.320, y1: 0.585 },
  c7:           { amp: 2.0 * MM, y: 0.664, sy: 0.022, sz: 0.016 },
  scapSpine:    { amp: 2.6 * MM, s: 0.018, from: [0.545, 0.062], to: [0.577, 0.176] },
  scapMedial:   { amp: 2.0 * MM, s: 0.016, from: [0.556, 0.060], to: [0.437, 0.098] },
  infraTrough:  { amp: -1.3 * MM, s: 0.030, from: [0.505, 0.075], to: [0.525, 0.165] },
  supraFull:    { amp: 0.8 * MM, s: 0.015, from: [0.567, 0.078], to: [0.595, 0.164] },
  trapMass:     { amp: 2.0 * MM, s: 0.040, from: [0.652, 0.030], to: [0.583, 0.180], drop: 0.016 },
  trapBorder:   { amp: -0.9 * MM, s: 0.021, from: [0.575, 0.174], to: [0.362, 0.022] },
  rhomboid:     { amp: 0.9 * MM, s: 0.030, from: [0.570, 0.045], to: [0.470, 0.075] },
  lat:          { amp: 2.4 * MM, s: 0.042, from: [0.335, 0.074], to: [0.506, 0.164] },
  axillaryFold: { amp: 1.3 * MM, s: 0.020, from: [0.505, 0.170], to: [0.560, 0.192] },
}
const CLAMP = 6.5 * MM

const MASK = {
  backNx: [0.12, 0.45], backX: [0.035, 0.075],
  yIn: [0.285, 0.335], yOut: [0.680, 0.735], azOut: [0.176, 0.226],
}

const sstep = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t) }
const g = (d, s) => Math.exp(-0.5 * (d / s) * (d / s))
function segDist(y, az, from, to) {
  const ay = from[0], aa = from[1], by = to[0], ba = to[1]
  const dy = by - ay, da = ba - aa
  const t = Math.max(0, Math.min(1, ((y - ay) * dy + (az - aa) * da) / (dy * dy + da * da || 1)))
  return Math.hypot(y - (ay + dy * t), az - (aa + da * t))
}
const ridge = (y, az, f) => g(segDist(y, az, f.from, f.to), f.s)

function displacement(y, az) {
  let d = 0
  const s = A.spineFurrow
  d += s.amp * g(az, s.sz) * sstep(s.y0 - 0.03, s.y0 + 0.03, y) * (1 - sstep(s.y1 - 0.04, s.y1 + 0.04, y))
  const e = A.erector
  d += e.amp * g(az - e.az, e.sz) * sstep(e.y0 - 0.03, e.y0 + 0.03, y) * (1 - sstep(e.y1 - 0.04, e.y1 + 0.04, y))
  d += A.c7.amp * g(y - A.c7.y, A.c7.sy) * g(az, A.c7.sz)
  d += A.scapSpine.amp * ridge(y, az, A.scapSpine)
  d += A.scapMedial.amp * ridge(y, az, A.scapMedial)
  d += A.infraTrough.amp * ridge(y, az, A.infraTrough)
  d += A.supraFull.amp * ridge(y, az, A.supraFull)
  d += A.trapMass.amp * g(segDist(y + A.trapMass.drop, az, A.trapMass.from, A.trapMass.to), A.trapMass.s)
  d += A.trapBorder.amp * ridge(y, az, A.trapBorder)
  d += A.rhomboid.amp * ridge(y, az, A.rhomboid)
  d += A.lat.amp * ridge(y, az, A.lat)
  d += A.axillaryFold.amp * ridge(y, az, A.axillaryFold)
  return Math.max(-CLAMP, Math.min(CLAMP, d))
}
const patchDist = (y, z) => Math.hypot(y - PATCH.y, Math.abs(z) - PATCH.az)
// tight: the coarse patch itself (refine + smooth)
const patchMask = (y, z) => 1 - sstep(PATCH.r - PATCH.feather, PATCH.r + PATCH.feather, patchDist(y, z))
// wide: the curvature correction. Its fade MUST coincide with the ring the
// cubic was fitted to, because that is where the correction is already zero —
// fading it out anywhere else leaves a step, i.e. draws a circle on the back.
const RING = [PATCH.r + 0.010, PATCH.r + 0.072]
const levelMask = (y, z) => 1 - sstep(RING[0], RING[1], patchDist(y, z))
const sculptMask = (x, y, z, vnx) => sstep(MASK.backNx[0], MASK.backNx[1], -vnx)
  * sstep(MASK.backX[0], MASK.backX[1], -x)
  * sstep(MASK.yIn[0], MASK.yIn[1], y)
  * (1 - sstep(MASK.yOut[0], MASK.yOut[1], y))
  * (1 - sstep(MASK.azOut[0], MASK.azOut[1], Math.abs(z)))

// ── load ─────────────────────────────────────────────────────────────────
const { json, bin } = await readGlb(SRC)
const prim = json.meshes[0].primitives[0]
const posAcc = json.accessors[prim.attributes.POSITION]
const nrmAcc = json.accessors[prim.attributes.NORMAL]
const uvAcc = json.accessors[prim.attributes.TEXCOORD_0]
const idxAcc = json.accessors[prim.indices]
const pb = await decodeView(json, bin, posAcc.bufferView)
const nb = await decodeView(json, bin, nrmAcc.bufferView)
const ub = await decodeView(json, bin, uvAcc.bufferView)
const ib = await decodeView(json, bin, idxAcc.bufferView)
const Pq = new Int16Array(pb.buffer, pb.byteOffset, pb.byteLength / 2)
const Nq = new Int16Array(nb.buffer, nb.byteOffset, nb.byteLength / 2)
const Uq = new Uint16Array(ub.buffer, ub.byteOffset, ub.byteLength / 2)
const I0 = new Uint32Array(ib.buffer, ib.byteOffset, ib.byteLength / 4)
const V0 = posAcc.count, Q = 32767, QU = 65535

let pos = new Float64Array(V0 * 3), nrm = new Float64Array(V0 * 3), uv = new Float64Array(V0 * 2)
for (let i = 0; i < V0; i++) {
  pos[i * 3] = Pq[i * 4] / Q; pos[i * 3 + 1] = Pq[i * 4 + 1] / Q; pos[i * 3 + 2] = Pq[i * 4 + 2] / Q
  const a = Nq[i * 4] / Q, b = Nq[i * 4 + 1] / Q, c = Nq[i * 4 + 2] / Q
  const L = Math.hypot(a, b, c) || 1
  nrm[i * 3] = a / L; nrm[i * 3 + 1] = b / L; nrm[i * 3 + 2] = c / L
  uv[i * 2] = Uq[i * 2] / QU; uv[i * 2 + 1] = Uq[i * 2 + 1] / QU
}

// ── 1. refine the coarse patches ─────────────────────────────────────────
const inPatch = (x, y, z) => x < -0.085 && patchMask(y, z) > 0.02
const shouldSplit = (P, a, b) => {
  const mx = (P[a * 3] + P[b * 3]) / 2, my = (P[a * 3 + 1] + P[b * 3 + 1]) / 2, mz = (P[a * 3 + 2] + P[b * 3 + 2]) / 2
  if (!inPatch(mx, my, mz)) return false
  return Math.hypot(P[a * 3] - P[b * 3], P[a * 3 + 1] - P[b * 3 + 1], P[a * 3 + 2] - P[b * 3 + 2]) > TARGET_EDGE
}
const refined = refineRegion({ pos, nrm, uv, idx: I0, shouldSplit }, 4)
pos = refined.pos; nrm = refined.nrm; uv = refined.uv
const IDX = refined.idx
const V = pos.length / 3
console.log(`refine: ${V0} -> ${V} vertices, ${I0.length / 3} -> ${IDX.length / 3} triangles`)

// ── 2. smooth the refined patches (kills the facets) ─────────────────────
const smoothW = new Float64Array(V)
for (let i = 0; i < V; i++) {
  const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2]
  if (x > -0.085) continue
  smoothW[i] = patchMask(y, z) * sstep(0.030, 0.060, Math.abs(z))
}
pos = taubinSmooth({ pos, idx: IDX }, smoothW, 8)

// ── 3. level: put the patch back on the surface around it ────────────────
const GY0 = 0.30, GY1 = 0.68, GZ = 0.20, GS = 0.004
const GR = Math.round((GY1 - GY0) / GS) + 1, GC = Math.round((2 * GZ) / GS) + 1
const gsum = new Float64Array(GR * GC), gcnt = new Float64Array(GR * GC)
for (let i = 0; i < V; i++) {
  const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2]
  if (x > -0.085 || y < GY0 || y > GY1 || Math.abs(z) > GZ) continue
  const r = Math.round((y - GY0) / GS), c = Math.round((z + GZ) / GS)
  gsum[r * GC + c] += x; gcnt[r * GC + c]++
}
const depth = new Float64Array(GR * GC).fill(NaN)
for (let k = 0; k < depth.length; k++) if (gcnt[k] > 0) depth[k] = gsum[k] / gcnt[k]
const blurWith = (sig, rad) => {
  const out = new Float64Array(GR * GC).fill(NaN)
  for (let r = 0; r < GR; r++) for (let c = 0; c < GC; c++) {
    if (Number.isNaN(depth[r * GC + c])) continue
    let s = 0, w = 0
    for (let dr = -rad; dr <= rad; dr++) for (let dc = -rad; dc <= rad; dc++) {
      const rr = r + dr, cc = c + dc
      if (rr < 0 || rr >= GR || cc < 0 || cc >= GC) continue
      const d = depth[rr * GC + cc]
      if (Number.isNaN(d)) continue
      const gg = Math.exp(-(dr * dr + dc * dc) / (2 * sig * sig))
      s += d * gg; w += gg
    }
    out[r * GC + c] = s / w
  }
  return out
}
const local = blurWith(1.4, 4)     // ~6 mm: the surface, de-noised

/* What is wrong with the patch is CURVATURE, not depth: measured across it the
 * surface runs at a constant slope — a cone — while the back around it is
 * convex. That is what catches the light flatly and reads as a disc, and it is
 * why blurring cannot fix it (the blur of a flat patch is the same flat patch).
 *
 * So the patch is treated as a HOLE and filled biharmonically: solve grad^4 u = 0
 * inside it with the surrounding surface as the boundary condition. A biharmonic
 * fill matches the boundary's height AND its slope, and continues its curvature
 * inwards, so the correction dies to nothing at the rim on its own. Every
 * attempt to feather a correction with a mask instead drew a circle on the back,
 * because a mask edge IS a crease.
 */
/* The hole is measured, not guessed: cells whose ORIGINAL triangles are
 * coarser than the mesh's normal ~3 mm, dilated so the crease at the patch
 * edge falls INSIDE the solved area rather than on its boundary. Placing the
 * region by hand left a ring on whichever side the guess did not cover.
 */
const COARSE_MM = 9.0
const hole = new Uint8Array(GR * GC)         // 1 = solve here
{
  // Mark every cell a COARSE triangle covers. Marking only the cell holding
  // its centroid leaves isolated dots 12 mm apart — the patch is coarse, so
  // its triangles are few and far between by definition.
  const ox = (i) => Pq[i * 4] / Q, oy = (i) => Pq[i * 4 + 1] / Q, oz = (i) => Pq[i * 4 + 2] / Q
  for (let t = 0; t < I0.length; t += 3) {
    const a = I0[t], b = I0[t + 1], c = I0[t + 2]
    const cx = (ox(a) + ox(b) + ox(c)) / 3, cy = (oy(a) + oy(b) + oy(c)) / 3, cz = (oz(a) + oz(b) + oz(c)) / 3
    if (cx > -0.085 || cy < GY0 || cy > GY1 || Math.abs(cz) > GZ) continue
    const e = (Math.hypot(ox(a) - ox(b), oy(a) - oy(b), oz(a) - oz(b))
      + Math.hypot(ox(b) - ox(c), oy(b) - oy(c), oz(b) - oz(c))
      + Math.hypot(ox(c) - ox(a), oy(c) - oy(a), oz(c) - oz(a))) / 3
    if (e / MM <= COARSE_MM) continue
    const y0 = Math.min(oy(a), oy(b), oy(c)), y1 = Math.max(oy(a), oy(b), oy(c))
    const z0 = Math.min(oz(a), oz(b), oz(c)), z1 = Math.max(oz(a), oz(b), oz(c))
    const r0 = Math.max(0, Math.round((y0 - GY0) / GS)), r1 = Math.min(GR - 1, Math.round((y1 - GY0) / GS))
    const c0 = Math.max(0, Math.round((z0 + GZ) / GS)), c1 = Math.min(GC - 1, Math.round((z1 + GZ) / GS))
    for (let r = r0; r <= r1; r++) for (let cc = c0; cc <= c1; cc++) hole[r * GC + cc] = 1
  }
  // keep only the two big patches; isolated coarse cells are ordinary mesh
  // variation and solving them scatters spikes across the whole back
  const label = new Int32Array(GR * GC).fill(-1)
  const sizes = []
  for (let r = 0; r < GR; r++) for (let c = 0; c < GC; c++) {
    const k0 = r * GC + c
    if (!hole[k0] || label[k0] >= 0) continue
    const id = sizes.length
    let n = 0
    const stack = [k0]
    label[k0] = id
    while (stack.length) {
      const k = stack.pop(); n++
      const kr = Math.floor(k / GC), kc = k % GC
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const rr = kr + dr, cc2 = kc + dc
        if (rr < 0 || rr >= GR || cc2 < 0 || cc2 >= GC) continue
        const kk = rr * GC + cc2
        if (hole[kk] && label[kk] < 0) { label[kk] = id; stack.push(kk) }
      }
    }
    sizes.push(n)
  }
  for (let k = 0; k < hole.length; k++) if (hole[k] && sizes[label[k]] < 600) hole[k] = 0
  console.log('coarse patches found:', sizes.filter((n) => n >= 600).join(', '), 'cells')
  for (let d = 0; d < 4; d++) {                       // dilate ~16 mm
    const prev = Uint8Array.from(hole)
    for (let r = 1; r < GR - 1; r++) for (let c = 1; c < GC - 1; c++) {
      if (prev[r * GC + c]) continue
      if (prev[(r - 1) * GC + c] || prev[(r + 1) * GC + c] || prev[r * GC + c - 1] || prev[r * GC + c + 1]) hole[r * GC + c] = 1
    }
  }
  for (let r = 0; r < GR; r++) for (let c = 0; c < GC; c++) {
    if (Math.abs(-GZ + c * GS) <= 0.030) hole[r * GC + c] = 0   // never the spine
  }
}
const known = new Float64Array(GR * GC)      // 1 = usable boundary data
const u = new Float64Array(GR * GC)
for (let r = 0; r < GR; r++) for (let c = 0; c < GC; c++) {
  const k = r * GC + c
  const y = GY0 + r * GS, z = -GZ + c * GS
  const v = local[k]
  if (!Number.isNaN(v)) { u[k] = v; if (!hole[k]) known[k] = 1 }
}
// Cells with no surface data (past the silhouette, the gap by the arm) are NOT
// holes to be invented — left as unknowns they solved to nonsense and threw
// single vertices out as spikes. Flood the nearest real value into them and
// freeze them, so they can serve as boundary without being solved.
for (let pass = 0; pass < 40; pass++) {
  let filled = 0
  for (let r = 0; r < GR; r++) for (let c = 0; c < GC; c++) {
    const k = r * GC + c
    if (known[k] || hole[k]) continue
    let s2 = 0, n2 = 0
    for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const rr = r + dr, cc = c + dc
      if (rr < 0 || rr >= GR || cc < 0 || cc >= GC) continue
      if (known[rr * GC + cc]) { s2 += u[rr * GC + cc]; n2++ }
    }
    if (n2) { u[k] = s2 / n2; known[k] = 1; filled++ }
  }
  if (!filled) break
}
for (let k = 0; k < known.length; k++) if (!known[k] && !hole[k]) { known[k] = 1; u[k] = 0 }

// Gauss-Seidel on the 13-point biharmonic stencil, over the hole only
const at = (r, c) => {
  const rr = Math.max(0, Math.min(GR - 1, r)), cc = Math.max(0, Math.min(GC - 1, c))
  return u[rr * GC + cc]
}
for (let it = 0; it < 4000; it++) {
  for (let r = 2; r < GR - 2; r++) for (let c = 2; c < GC - 2; c++) {
    const k = r * GC + c
    if (!hole[k]) continue
    const v = 8 * (at(r - 1, c) + at(r + 1, c) + at(r, c - 1) + at(r, c + 1))
      - 2 * (at(r - 1, c - 1) + at(r - 1, c + 1) + at(r + 1, c - 1) + at(r + 1, c + 1))
      - (at(r - 2, c) + at(r + 2, c) + at(r, c - 2) + at(r, c + 2))
    u[k] = v / 20
  }
}
let holeCells = 0
for (let k = 0; k < hole.length; k++) if (hole[k]) holeCells++
console.log(`biharmonic fill: ${holeCells} cells solved`)

const sampleGrid = (grid, y, z) => {
  const rf = (y - GY0) / GS, cf = (z + GZ) / GS
  const r0 = Math.floor(rf), c0 = Math.floor(cf), fr = rf - r0, fc = cf - c0
  let s = 0, w = 0
  for (const [dr, dc, wt] of [[0, 0, (1 - fr) * (1 - fc)], [1, 0, fr * (1 - fc)], [0, 1, (1 - fr) * fc], [1, 1, fr * fc]]) {
    const r = r0 + dr, c = c0 + dc
    if (r < 0 || r >= GR || c < 0 || c >= GC) continue
    const v = grid[r * GC + c]
    if (Number.isNaN(v)) continue
    s += v * wt; w += wt
  }
  return w > 0.35 ? s / w : null
}
const LEVEL_CAP = 8 * MM
const inHoleAt = (y, z) => {
  const r = Math.round((y - GY0) / GS), c = Math.round((z + GZ) / GS)
  if (r < 0 || r >= GR || c < 0 || c >= GC) return false
  return hole[r * GC + c] === 1
}
const levelAt = (y, z) => {
  if (!inHoleAt(y, z)) return 0
  const filled = sampleGrid(u, y, z), actual = sampleGrid(local, y, z)
  if (filled === null || actual === null) return 0
  const d = -(filled - actual)              // + = outward
  return Math.max(-LEVEL_CAP, Math.min(LEVEL_CAP, d))
}

// ── 4. sculpt ────────────────────────────────────────────────────────────
function faceNormals(P) {
  const weldMap = new Map(); const weld = new Int32Array(V)
  for (let i = 0; i < V; i++) {
    const k = `${P[i * 3].toFixed(6)},${P[i * 3 + 1].toFixed(6)},${P[i * 3 + 2].toFixed(6)}`
    const r = weldMap.get(k)
    if (r === undefined) { weldMap.set(k, i); weld[i] = i } else weld[i] = r
  }
  const acc = new Float64Array(V * 3)
  for (let t = 0; t < IDX.length; t += 3) {
    const a = weld[IDX[t]], b = weld[IDX[t + 1]], c = weld[IDX[t + 2]]
    const e1x = P[b * 3] - P[a * 3], e1y = P[b * 3 + 1] - P[a * 3 + 1], e1z = P[b * 3 + 2] - P[a * 3 + 2]
    const e2x = P[c * 3] - P[a * 3], e2y = P[c * 3 + 1] - P[a * 3 + 1], e2z = P[c * 3 + 2] - P[a * 3 + 2]
    const cx = e1y * e2z - e1z * e2y, cy = e1z * e2x - e1x * e2z, cz = e1x * e2y - e1y * e2x
    for (const v of [a, b, c]) { acc[v * 3] += cx; acc[v * 3 + 1] += cy; acc[v * 3 + 2] += cz }
  }
  const out = new Float64Array(V * 3)
  for (let i = 0; i < V; i++) {
    const w = weld[i]
    const L = Math.hypot(acc[w * 3], acc[w * 3 + 1], acc[w * 3 + 2]) || 1
    out[i * 3] = acc[w * 3] / L; out[i * 3 + 1] = acc[w * 3 + 1] / L; out[i * 3 + 2] = acc[w * 3 + 2] / L
  }
  return out
}

// Normals BEFORE the sculpt. Replacing normals outright with geometric ones
// sparkles: positions are quantised to 0.03 mm, which is ~0.6 deg of normal
// noise on a 3 mm triangle — invisible on the surface, loud under a specular
// highlight. So only the CHANGE this script causes is applied to the normals
// the model already had.
const geoBefore = faceNormals(pos)
const mask = new Float64Array(V)
let moved = 0, maxD = 0, lvMax = 0
for (let i = 0; i < V; i++) {
  const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2]
  const m = sculptMask(x, y, z, nrm[i * 3])
  if (m <= 0.0005) continue
  mask[i] = m
  const lv = levelAt(y, z)
  if (Math.abs(lv) > lvMax) lvMax = Math.abs(lv)
  const d = Math.max(-CLAMP, Math.min(CLAMP, (lv + displacement(y, Math.abs(z))))) * m
  // The normal blend must NOT follow the patch outline: a factor that goes
  // 1 -> 0 around a circle draws that circle in the shading, which is exactly
  // the ring the patch used to show. sculptMask is broad and fades only at the
  // edges of the back, far from anything being corrected.
  mask[i] = m
  if (!d) continue
  pos[i * 3] += nrm[i * 3] * d
  pos[i * 3 + 1] += nrm[i * 3 + 1] * d
  pos[i * 3 + 2] += nrm[i * 3 + 2] * d
  moved++
  if (Math.abs(d) > maxD) maxD = Math.abs(d)
}
const geoAfter = faceNormals(pos)
console.log(`sculpt: ${moved} vertices moved, max ${(maxD / MM).toFixed(1)} mm (curvature correction up to ${(lvMax / MM).toFixed(1)} mm)`)

// ── quantise ─────────────────────────────────────────────────────────────
const outP = new Int16Array(V * 4), outN = new Int16Array(V * 4), outU = new Uint16Array(V * 2)
let minX = 9, maxX = -9, minY = 9, maxY = -9, minZ = 9, maxZ = -9
for (let i = 0; i < V; i++) {
  const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2]
  outP[i * 4] = Math.max(-Q, Math.min(Q, Math.round(x * Q)))
  outP[i * 4 + 1] = Math.max(-Q, Math.min(Q, Math.round(y * Q)))
  outP[i * 4 + 2] = Math.max(-Q, Math.min(Q, Math.round(z * Q)))
  if (x < minX) minX = x; if (x > maxX) maxX = x
  if (y < minY) minY = y; if (y > maxY) maxY = y
  if (z < minZ) minZ = z; if (z > maxZ) maxZ = z
  const m = mask[i], sw = smoothW[i]
  // reference normal: the model's own, except inside the rebuilt patch where
  // the surface is new and its geometric normal is the only truthful one
  let nxf = nrm[i * 3] + (geoBefore[i * 3] - nrm[i * 3]) * sw
  let nyf = nrm[i * 3 + 1] + (geoBefore[i * 3 + 1] - nrm[i * 3 + 1]) * sw
  let nzf = nrm[i * 3 + 2] + (geoBefore[i * 3 + 2] - nrm[i * 3 + 2]) * sw
  if (m > 0.0005) {
    nxf += (geoAfter[i * 3] - geoBefore[i * 3]) * m
    nyf += (geoAfter[i * 3 + 1] - geoBefore[i * 3 + 1]) * m
    nzf += (geoAfter[i * 3 + 2] - geoBefore[i * 3 + 2]) * m
  }
  { const L = Math.hypot(nxf, nyf, nzf) || 1; nxf /= L; nyf /= L; nzf /= L }
  outN[i * 4] = Math.round(nxf * Q); outN[i * 4 + 1] = Math.round(nyf * Q); outN[i * 4 + 2] = Math.round(nzf * Q)
  outU[i * 2] = Math.max(0, Math.min(QU, Math.round(uv[i * 2] * QU)))
  outU[i * 2 + 1] = Math.max(0, Math.min(QU, Math.round(uv[i * 2 + 1] * QU)))
}
const outI = Uint32Array.from(IDX)

// ── re-encode and rebuild the GLB ────────────────────────────────────────
await MeshoptEncoder.ready
// version 0: the decoder three.js bundles predates the v1 vertex codec
const encIdx = MeshoptEncoder.encodeGltfBuffer(new Uint8Array(outI.buffer), outI.length, 4, 'TRIANGLES', 0)
const encPos = MeshoptEncoder.encodeVertexBufferLevel(new Uint8Array(outP.buffer), V, 8, 2, 0)
const encNrm = MeshoptEncoder.encodeVertexBufferLevel(new Uint8Array(outN.buffer), V, 8, 2, 0)
const encUv = MeshoptEncoder.encodeVertexBufferLevel(new Uint8Array(outU.buffer), V, 4, 2, 0)

const j = JSON.parse(JSON.stringify(json))
j.accessors[prim.indices].count = outI.length
for (const a of [prim.attributes.POSITION, prim.attributes.NORMAL, prim.attributes.TEXCOORD_0]) j.accessors[a].count = V
const pa = j.accessors[prim.attributes.POSITION]
pa.min = [Math.round(minX * Q), Math.round(minY * Q), Math.round(minZ * Q)]
pa.max = [Math.round(maxX * Q), Math.round(maxY * Q), Math.round(maxZ * Q)]

// buffer 1 is the (dataless) fallback: its views must still describe the
// decoded sizes, so recompute their offsets and lengths
const fallback = [
  [3, outI.length * 4, outI.length, 4],
  [4, V * 8, V, 8],
  [5, V * 8, V, 8],
  [6, V * 4, V, 4],
]
let fo = 0
for (const [v, len, count, stride] of fallback) {
  j.bufferViews[v].byteOffset = fo
  j.bufferViews[v].byteLength = len
  j.bufferViews[v].extensions.EXT_meshopt_compression.count = count
  j.bufferViews[v].extensions.EXT_meshopt_compression.byteStride = stride
  if (j.bufferViews[v].byteStride !== undefined) j.bufferViews[v].byteStride = stride
  fo += (len + 3) & ~3
}
j.buffers[1].byteLength = fo

const pad4 = (n) => (n + 3) & ~3
const parts = []
let off = 0
const place = (bytes) => { const at = off; parts.push({ at, bytes }); off = pad4(at + bytes.length); return at }
for (let v = 0; v < 3; v++) {          // the three JPEGs, untouched
  const bv = json.bufferViews[v]
  j.bufferViews[v].byteOffset = place(new Uint8Array(bin.subarray(bv.byteOffset, bv.byteOffset + bv.byteLength)))
}
for (const [v, bytes] of [[3, encIdx], [4, encPos], [5, encNrm], [6, encUv]]) {
  const e = j.bufferViews[v].extensions.EXT_meshopt_compression
  e.byteOffset = place(bytes)
  e.byteLength = bytes.length
}
j.buffers[0].byteLength = off

const binOut = Buffer.alloc(off)
for (const { at, bytes } of parts) Buffer.from(bytes.buffer, bytes.byteOffset, bytes.length).copy(binOut, at)
let jsonStr = JSON.stringify(j)
while (jsonStr.length % 4) jsonStr += ' '
const jsonBuf = Buffer.from(jsonStr, 'utf8')
const glb = Buffer.alloc(12 + 8 + jsonBuf.length + 8 + binOut.length)
glb.write('glTF', 0, 'ascii'); glb.writeUInt32LE(2, 4); glb.writeUInt32LE(glb.length, 8)
glb.writeUInt32LE(jsonBuf.length, 12); glb.write('JSON', 16, 'ascii'); jsonBuf.copy(glb, 20)
const bo = 20 + jsonBuf.length
// The BIN chunk type is the four bytes B,I,N,NUL. Writing 'BIN ' with a space
// instead makes three skip the binary chunk entirely and hand the meshopt
// decoder zero bytes ("Malformed buffer data").
glb.writeUInt32LE(binOut.length, bo)
glb.write('BIN ', bo + 4, 'ascii')
binOut.copy(glb, bo + 8)
fs.writeFileSync(DST, glb)
console.log('wrote', DST, (glb.length / 1048576).toFixed(2), 'MB (source', (fs.statSync(SRC).size / 1048576).toFixed(2), 'MB)')
