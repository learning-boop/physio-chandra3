/* ─────────────────────────────────────────────────────────────────────────
   Where in an area the marks sit, read from the drawing.

   The body map already knows WHICH area was marked. For the limbs it can also
   tell where on that area: the front or back of the limb, its inner or outer
   side, and how high. When that is clear, it answers the area's "Where is the
   pain mainly?" question (the back of the knee, the inner ankle, the sole
   under the heel), and that question is not asked again, which leaves one
   more of the five questions for the ones that tell conditions apart.

   Front/back and inner/outer are measured against the LIMB's own centre, not
   the body's: a forearm hangs in front of the body's centre line, so the
   body-wide front/back test calls all of it "front". The limb edges below
   were measured on public/models/body-v15.glb (the arms hang with the palms
   forward, so the inner side of the forearm and wrist is the little-finger
   side). Rows: [height, inner edge, outer edge, back edge, front edge], all as
   fractions of the figure's height (fy: -0.5 soles .. +0.5 top of the head).

   A mark that spreads around the whole limb, or sits on the side between
   front and back, answers nothing: the question is then asked as usual.
   Pure logic, no React, so the checks run the same rules.
   ───────────────────────────────────────────────────────────────────────── */

const LEG = [[-0.06,0.002,0.112,-0.053,0.061],[-0.08,0.006,0.112,-0.053,0.061],[-0.1,0.01,0.112,-0.053,0.059],[-0.12,0.017,0.112,-0.052,0.055],[-0.14,0.023,0.109,-0.048,0.052],[-0.16,0.027,0.106,-0.042,0.048],[-0.18,0.03,0.104,-0.043,0.039],[-0.2,0.033,0.104,-0.05,0.034],[-0.22,0.038,0.109,-0.058,0.028],[-0.24,0.046,0.114,-0.065,0.018],[-0.26,0.044,0.118,-0.07,0.012],[-0.28,0.043,0.119,-0.071,0.012],[-0.3,0.043,0.118,-0.071,0.01],[-0.32,0.044,0.116,-0.068,0.006],[-0.34,0.05,0.114,-0.065,0.003],[-0.36,0.057,0.112,-0.062,-0.001],[-0.38,0.062,0.11,-0.06,-0.004],[-0.4,0.065,0.108,-0.057,-0.005],[-0.42,0.068,0.107,-0.055,-0.003],[-0.44,0.066,0.109,-0.057,0.003]]
const ARM = [[0.14,0.12,0.184,-0.057,0.007],[0.12,0.121,0.188,-0.056,0.015],[0.1,0.125,0.193,-0.047,0.02],[0.08,0.133,0.196,-0.038,0.022],[0.06,0.145,0.201,-0.028,0.027],[0.04,0.157,0.208,-0.015,0.034],[0.02,0.167,0.232,-0.002,0.061],[0,0.175,0.251,0.009,0.075],[-0.02,0.176,0.26,0.02,0.08],[-0.04,0.18,0.243,0.029,0.063],[-0.06,0.183,0.248,0.039,0.069],[-0.08,0.188,0.248,0.048,0.069]]
const LIMB_OF = { thigh: LEG, knee: LEG, lowerleg: LEG, ankle: LEG, elbow: ARM, forearm: ARM, wrist: ARM }

// The limb's edges at a height, interpolated between the measured rows.
function edgesAt(tab, fy) {
  if (fy >= tab[0][0]) return tab[0]
  for (let i = 1; i < tab.length; i++) {
    if (fy >= tab[i][0]) {
      const a = tab[i - 1], b = tab[i], t = (a[0] - fy) / (a[0] - b[0])
      return a.map((v, k) => v + (b[k] - v) * t)
    }
  }
  return tab[tab.length - 1]
}

/** Summary of where one area's marked points sit. `pts` are body coordinates
    { fy, az, lx } (height, distance from the centre line, front(+)/back(-)).
    For a limb it adds `across` (-1 inner .. +1 outer), `backShare` (share of
    points on the back half of the limb) and `spread` (how far the points
    range across the limb, 0 .. 1). */
export function summarizeZone(type, pts = []) {
  if (!pts.length) return null
  const mean = (f) => pts.reduce((s, p) => s + f(p), 0) / pts.length
  const out = { fy: mean((p) => p.fy), az: mean((p) => p.az), lx: mean((p) => p.lx) }
  const tab = LIMB_OF[type]
  if (tab) {
    const rel = pts.map((p) => {
      const [, inner, outer, back, front] = edgesAt(tab, p.fy)
      return { across: (p.az - (inner + outer) / 2) / ((outer - inner) / 2), depth: (p.lx - (back + front) / 2) / ((front - back) / 2) }
    })
    const acr = rel.map((r) => r.across)
    const m = acr.reduce((s, v) => s + v, 0) / acr.length
    out.across = m
    out.spread = Math.sqrt(acr.reduce((s, v) => s + (v - m) ** 2, 0) / acr.length)
    out.backShare = rel.filter((r) => r.depth < 0).length / rel.length
  }
  return out
}

// Clear front / back / side readings, or null when the mark is not clear.
const face = (at) => (at.backShare >= 0.7 ? 'back' : at.backShare <= 0.3 ? 'front' : null)
const side = (at) => (at.spread > 0.5 ? null : at.across < -0.34 ? 'inner' : at.across > 0.34 ? 'outer' : 'middle')

/* Each area's location question, and how the drawing answers it (an option
   id, or null to leave the question to the person). */
export const LOCATION_QUESTIONS = {
  knee: { q: 'K1', pick: (at) => {
    if (face(at) === 'back') return 'back'
    const s = side(at)
    if (s === 'inner' || s === 'outer') return s
    // Middle of the front: the kneecap, or the tendon just below it.
    if (face(at) === 'front' && s === 'middle') return at.fy > -0.195 ? 'kneecap' : 'below'
    return null
  } },
  lowerleg: { q: 'V1', pick: (at) => {
    // The back of the lower leg: the calf, or the Achilles low down.
    if (face(at) === 'back') return at.fy > -0.37 ? 'calf' : 'achilles'
    const s = side(at)
    if (s === 'inner') return 'medial'
    if (s === 'outer') return 'lateral'
    if (face(at) === 'front' && s === 'middle') return 'anterior'
    return null
  } },
  ankle: { q: 'A1', pick: (at) => {
    if (face(at) === 'back') return 'heel'
    const s = side(at)
    if (s === 'inner' || s === 'outer') return s
    // Middle of the front: just above the joint, or the crease itself.
    if (face(at) === 'front' && s === 'middle') return at.fy > -0.425 ? 'high' : 'front'
    return null
  } },
  thigh: { q: 'R1', pick: (at) => {
    if (face(at) === 'back') return 'back'
    const s = side(at)
    if (s === 'inner' || s === 'outer') return s
    if (face(at) === 'front' && s === 'middle') return 'front'
    return null
  } },
  elbow: { q: 'E1', pick: (at) => {
    if (face(at) === 'back') return 'back'
    const s = side(at)
    if (s === 'inner' || s === 'outer') return s
    if (face(at) === 'front' && s === 'middle') return 'front'
    return null
  } },
  forearm: { q: 'F1', pick: (at) => {
    const s = side(at)
    // Little-finger side; thumb side near the elbow or near the wrist.
    if (s === 'inner') return 'ulnar'
    if (s === 'outer') return at.fy > 0.055 ? 'radial' : 'distal'
    if (face(at) === 'front' && s === 'middle' && at.fy > 0.055) return 'volar'
    return null
  } },
  wrist: { q: 'W1', pick: (at) => {
    const s = side(at)
    if (s === 'outer') return 'thumb'
    if (s === 'inner') return 'little'
    if (s === 'middle' && face(at) === 'back') return 'back'
    if (s === 'middle' && face(at) === 'front') return 'palm'
    return null
  } },
  // The hip area: the groin and front of the hip on the front half near the
  // centre; the outer hip further out and round the side and back.
  hip: { q: 'G1', pick: (at) => (at.lx > 0 && at.az < 0.09 ? 'groin' : 'outer') },
  // The sole (below the heel pad line): under the heel at the back, the ball
  // of the foot at the front. The top of the foot near the ankle: the midfoot.
  foot: { q: 'B1', pick: (at) => {
    if (at.fy < -0.48) return at.lx < -0.02 ? 'heel' : at.lx > 0.04 ? 'ball' : null
    return at.lx < 0.05 ? 'arch' : null
  } },
}

/** The location answers the drawing gives, as { questionId: [optionId] }.
    `zones` are the areas the questions are asked about, each with `at` from
    summarizeZone (zones without it, such as implied areas, give nothing). */
export function locationAnswers(zones = []) {
  const out = {}
  for (const z of zones) {
    const rule = LOCATION_QUESTIONS[z.type]
    if (!rule || !z.at) continue
    const oid = rule.pick(z.at)
    if (!oid) continue
    out[rule.q] = [...new Set([...(out[rule.q] || []), oid])]
  }
  return out
}

/** Question ids the drawing can answer: these are not asked again once it has. */
export const LOCATION_QUESTION_IDS = new Set(Object.values(LOCATION_QUESTIONS).map((r) => r.q))

/** Areas the drawing only grazed: an area holding under MINOR_INK of the ink
    of the most-marked area. Their questions come after the main area's. */
export const MINOR_INK = 0.35
export function minorZoneIds(zones = []) {
  const inked = zones.filter((z) => typeof z.ink === 'number')
  const top = Math.max(0, ...inked.map((z) => z.ink))
  return new Set(inked.filter((z) => z.ink < MINOR_INK * top).map((z) => z.id))
}
