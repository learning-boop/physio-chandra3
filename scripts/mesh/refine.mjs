/* Adaptive refinement of a region of a triangle mesh.
 *
 * The upper back of the source model has two patches where the generator left
 * triangles 10-27 mm across instead of ~3 mm. Those patches are flat by
 * definition — there is nothing between their corners — so they render as matte
 * discs with a hard rim, and no amount of moving the existing vertices can
 * make them into a shoulder blade. This splits their edges until they match
 * the density of the surrounding mesh.
 *
 * Red-green refinement keyed on WELDED edges: an edge is split for both of the
 * triangles that share it, so the result has no T-junctions and no cracks.
 * Each UV chart still gets its own midpoint vertex (same position, own UV), so
 * texture seams stay exactly where they were.
 */

export function refineRegion({ pos, nrm, uv, idx, shouldSplit }, passes = 3) {
  let P = pos, N = nrm, U = uv, I = idx

  for (let pass = 0; pass < passes; pass++) {
    // weld positions so an edge is identified geometrically, not by index
    const weldMap = new Map()
    const weld = new Int32Array(P.length / 3)
    for (let i = 0; i < weld.length; i++) {
      const k = `${P[i * 3].toFixed(6)},${P[i * 3 + 1].toFixed(6)},${P[i * 3 + 2].toFixed(6)}`
      const r = weldMap.get(k)
      if (r === undefined) { weldMap.set(k, i); weld[i] = i } else weld[i] = r
    }
    const wkey = (a, b) => { const x = weld[a], y = weld[b]; return x < y ? x * 4294967296 + y : y * 4294967296 + x }

    // 1. decide which welded edges to split
    const split = new Set()
    for (let t = 0; t < I.length; t += 3) {
      const tri = [I[t], I[t + 1], I[t + 2]]
      for (let e = 0; e < 3; e++) {
        const a = tri[e], b = tri[(e + 1) % 3]
        if (shouldSplit(P, a, b)) split.add(wkey(a, b))
      }
    }
    if (split.size === 0) break

    // 2. create midpoints, one per (edge, chart) so UV charts stay separate
    const newP = [...P], newN = [...N], newU = [...U]
    const mid = new Map()
    const midOf = (a, b) => {
      const ka = a < b ? `${a}_${b}` : `${b}_${a}`
      let m = mid.get(ka)
      if (m !== undefined) return m
      m = newP.length / 3
      for (let c = 0; c < 3; c++) newP.push((P[a * 3 + c] + P[b * 3 + c]) / 2)
      let nx = N[a * 3] + N[b * 3], ny = N[a * 3 + 1] + N[b * 3 + 1], nz = N[a * 3 + 2] + N[b * 3 + 2]
      const L = Math.hypot(nx, ny, nz) || 1
      newN.push(nx / L, ny / L, nz / L)
      newU.push((U[a * 2] + U[b * 2]) / 2, (U[a * 2 + 1] + U[b * 2 + 1]) / 2)
      mid.set(ka, m)
      return m
    }

    // 3. re-triangulate: 1, 2 or 3 split edges -> 2, 3 or 4 triangles
    const outI = []
    for (let t = 0; t < I.length; t += 3) {
      const a = I[t], b = I[t + 1], c = I[t + 2]
      const ab = split.has(wkey(a, b)), bc = split.has(wkey(b, c)), ca = split.has(wkey(c, a))
      const n = (ab ? 1 : 0) + (bc ? 1 : 0) + (ca ? 1 : 0)
      if (n === 0) { outI.push(a, b, c); continue }
      if (n === 3) {
        const m0 = midOf(a, b), m1 = midOf(b, c), m2 = midOf(c, a)
        outI.push(a, m0, m2, m0, b, m1, m2, m1, c, m0, m1, m2)
        continue
      }
      if (n === 1) {
        // split the one edge, fan from the opposite corner
        if (ab) { const m = midOf(a, b); outI.push(a, m, c, m, b, c) }
        else if (bc) { const m = midOf(b, c); outI.push(b, m, a, m, c, a) }
        else { const m = midOf(c, a); outI.push(c, m, b, m, a, b) }
        continue
      }
      // n === 2: split both, then one diagonal
      const rot = ab && bc ? [a, b, c] : bc && ca ? [b, c, a] : [c, a, b]
      const [x, y, z] = rot
      const m0 = midOf(x, y), m1 = midOf(y, z)
      outI.push(x, m0, m1, m0, y, m1, x, m1, z)
    }

    P = Float64Array.from(newP); N = Float64Array.from(newN); U = Float64Array.from(newU)
    I = Uint32Array.from(outI)
  }
  return { pos: P, nrm: N, uv: U, idx: I }
}

/* Taubin smoothing (lambda / mu) restricted by a per-vertex weight.
 * Plain Laplacian smoothing shrinks a surface; the negative mu step puts the
 * volume back, so the facets go without the back losing its shape.
 */
export function taubinSmooth({ pos, idx }, weight, iterations = 6, lambda = 0.5, mu = -0.53) {
  const V = pos.length / 3
  const nbr = Array.from({ length: V }, () => new Set())
  const weldMap = new Map()
  const weld = new Int32Array(V)
  for (let i = 0; i < V; i++) {
    const k = `${pos[i * 3].toFixed(6)},${pos[i * 3 + 1].toFixed(6)},${pos[i * 3 + 2].toFixed(6)}`
    const r = weldMap.get(k)
    if (r === undefined) { weldMap.set(k, i); weld[i] = i } else weld[i] = r
  }
  for (let t = 0; t < idx.length; t += 3) {
    const a = weld[idx[t]], b = weld[idx[t + 1]], c = weld[idx[t + 2]]
    nbr[a].add(b); nbr[a].add(c); nbr[b].add(a); nbr[b].add(c); nbr[c].add(a); nbr[c].add(b)
  }
  const P = Float64Array.from(pos)
  const tmp = new Float64Array(P.length)
  for (let it = 0; it < iterations; it++) {
    const step = it % 2 === 0 ? lambda : mu
    tmp.set(P)
    for (let i = 0; i < V; i++) {
      const w = weight[i]
      const rep = weld[i]
      if (w <= 0 || nbr[rep].size === 0) continue
      let sx = 0, sy = 0, sz = 0
      for (const j of nbr[rep]) { sx += tmp[j * 3]; sy += tmp[j * 3 + 1]; sz += tmp[j * 3 + 2] }
      const k = nbr[rep].size
      P[i * 3] += step * w * (sx / k - tmp[i * 3])
      P[i * 3 + 1] += step * w * (sy / k - tmp[i * 3 + 1])
      P[i * 3 + 2] += step * w * (sz / k - tmp[i * 3 + 2])
    }
  }
  return P
}
