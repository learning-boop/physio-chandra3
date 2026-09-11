/* ─────────────────────────────────────────────────────────────────────────
   How a drawn selection becomes a questionnaire and a result.

   Kept out of PainAssessment.jsx so the exact same logic can be exercised in
   Node by scripts/check-accuracy.mjs — the component only renders it.

   A line through several areas of ONE chain (shoulder → elbow, low back →
   knee) is asked about area by area: each crossed region's own weighted
   questions run, so a problem in any of them can be recognised. Asking only
   the region nearest the spine meant an elbow problem on a shoulder-to-elbow
   line could never be matched at all.
   ───────────────────────────────────────────────────────────────────────── */
import {
  REGIONS, ZONE_TO_REGION, computeResults, shouldStop, isRelevant, answeredRegionCount,
} from './symptomGuide.js'

/* Regions on one anatomical chain, from the spine outwards. */
export const REGION_CHAINS = [
  ['neck', 'shoulder', 'elbow', 'wrist'],
  ['lowback', 'hip', 'knee', 'ankle'],
  ['neck', 'upperback', 'lowback'],
]

const AREA_WORD = {
  lowback: 'low back', upperback: 'upper back', neck: 'neck', shoulder: 'shoulder',
  elbow: 'elbow', wrist: 'wrist or hand', hip: 'hip', knee: 'knee', ankle: 'ankle or foot',
}

/** Region keys (with an authored question set) of the drawn zones, in drawing order. */
export function regionKeysOf(zones) {
  const out = []
  for (const z of zones || []) {
    const k = ZONE_TO_REGION[z.type]
    if (k && REGIONS[k] && !out.includes(k)) out.push(k)
  }
  return out
}

/** The most-marked region (left/right counted together). */
export function primaryRegion(zones) {
  const tally = {}
  for (const z of zones || []) {
    const k = ZONE_TO_REGION[z.type]
    if (k && REGIONS[k]) tally[k] = (tally[k] || 0) + 1
  }
  const best = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]
  return best ? best[0] : null
}

/** Every key on one chain → that chain's order (spine first); otherwise null. */
export function chainOrder(keys) {
  if (keys.length < 2) return null
  for (const chain of REGION_CHAINS) {
    if (keys.every((k) => chain.includes(k))) return chain.filter((k) => keys.includes(k))
  }
  return null
}

/** Separate areas (not one chain) are separate problems: the person picks one. */
export function needsAreaChoice(zones, focusKey) {
  const keys = regionKeysOf(zones)
  return !focusKey && keys.length > 1 && !chainOrder(keys)
}

/** The regions whose questions will be asked, in asking order. */
export function questionRegions(zones, focusKey) {
  if (focusKey && REGIONS[focusKey]) return [focusKey]
  const keys = regionKeysOf(zones)
  if (keys.length <= 1) return keys
  return chainOrder(keys) || [primaryRegion(zones)]
}

/* ── Shared opening questions ─────────────────────────────────────────────
   Every region asks age, how it started and how long — each with its own
   option ids and bands. Asked once per region that would be three near-
   identical screens, so age and duration are asked ONCE in bands fine enough
   to map onto every region's own bands, and only "how did it start?" (whose
   options differ by area and carry weights) is asked per area. A region whose
   bands can't be mapped simply keeps its own question. */
function ageRange(id) {
  let m
  if ((m = /^u(\d+)$/.exec(id))) return [0, Number(m[1]) - 1]
  if ((m = /^o(\d+)$/.exec(id))) return [Number(m[1]) + 1, 150]
  if ((m = /^(\d+)-(\d+)$/.exec(id))) return [Number(m[1]), Number(m[2])]
  return null
}
const sharesAge = (q) => q.id === 'age' && q.options.every((o) => ageRange(o.id))

function ageBuckets(questions) {
  const starts = [...new Set(questions.flatMap((q) => q.options.map((o) => ageRange(o.id)[0])))].sort((a, b) => a - b)
  return starts.map((lo, i) => {
    const hi = i + 1 < starts.length ? starts[i + 1] - 1 : 150
    const label = lo === 0 ? `Under ${hi + 1}` : hi === 150 ? `Over ${lo - 1}` : `${lo} – ${hi}`
    return { id: 'a' + lo, label }
  })
}
function mapAge(bucketId, q) {
  const lo = Number(String(bucketId).slice(1))
  const o = q.options.find((x) => { const r = ageRange(x.id); return r && lo >= r[0] && lo <= r[1] })
  return o ? o.id : undefined
}

const DURATIONS = [
  { id: 'd2w', label: 'Less than 2 weeks', to: ['d2w'] },
  { id: 'd6w', label: '2 – 6 weeks', to: ['d6w'] },
  { id: 'd3m', label: '6 weeks – 3 months', to: ['d3m', 'd6m'] },
  { id: 'o3m', label: 'More than 3 months', to: ['o3m', 'd6m'] },
  { id: 'years', label: 'Comes and goes over years', to: ['years', 'o3m', 'd6m'] },
]
function mapDuration(id, q) {
  const d = DURATIONS.find((x) => x.id === id)
  return d ? d.to.find((t) => q.options.some((o) => o.id === t)) : undefined
}
const sharesDuration = (q) =>
  q.id === 'duration' &&
  DURATIONS.every((d) => mapDuration(d.id, q)) &&
  q.options.every((o) => DURATIONS.some((d) => d.to.includes(o.id)))

/** The opening questions for these regions (one region: its own, unchanged). */
export function buildContext(keys) {
  if (keys.length === 1) return REGIONS[keys[0]].context
  const out = []
  const ages = keys.map((k) => REGIONS[k].context.find(sharesAge)).filter(Boolean)
  if (ages.length) out.push({ id: 'age', text: 'Your age?', options: ageBuckets(ages) })
  for (const k of keys) {
    const r = REGIONS[k]
    for (const q of r.context) {
      if (sharesAge(q) || sharesDuration(q)) continue
      const text = q.id === 'onset' ? `How did the ${AREA_WORD[k] || r.name.toLowerCase()} pain start?` : `${r.name}: ${q.text}`
      out.push({ ...q, id: `${q.id}@${k}`, text })
    }
  }
  if (keys.some((k) => REGIONS[k].context.some(sharesDuration))) {
    out.push({ id: 'duration', text: 'How long has it been going on?', options: DURATIONS.map(({ id, label }) => ({ id, label })) })
  }
  return out
}

/** One region's view of the answers, in that region's own ids and bands. */
export function regionAnswers(keys, rk, answers) {
  if (keys.length <= 1) return answers
  const r = REGIONS[rk]
  const out = {}
  for (const q of r.questions) if (answers[q.id] !== undefined) out[q.id] = answers[q.id]
  for (const q of r.context) {
    let v
    if (sharesAge(q)) v = answers.age === undefined ? undefined : mapAge(answers.age, q)
    else if (sharesDuration(q)) v = answers.duration === undefined ? undefined : mapDuration(answers.duration, q)
    else v = answers[`${q.id}@${rk}`]
    if (v !== undefined) out[q.id] = v
  }
  return out
}

/** Screen list: one grouped opening screen, then each region's questions. */
export function buildScreens(keys) {
  const context = buildContext(keys)
  const multi = keys.length > 1
  const questions = keys.flatMap((k) =>
    REGIONS[k].questions.map((q) => ({ ...q, rk: k, area: multi ? REGIONS[k].name : null })))
  return { context, questions }
}

/** From screen `from`, skip region questions that can no longer change that
    region's result, and the rest of a region once one condition there is
    clearly ahead. Non-region screens (opening, AI, notes) are never skipped. */
export function nextScreen(screens, from, keys, answers) {
  let i = from
  while (i < screens.length) {
    const q = screens[i]
    if (!q || !q.rk) break
    const region = REGIONS[q.rk]
    const ra = regionAnswers(keys, q.rk, answers)
    if (answeredRegionCount(region, ra) >= 2 && shouldStop(region, ra)) {
      while (i < screens.length && screens[i].rk === q.rk) i++
      continue
    }
    if (!isRelevant(q, region, ra)) { i++; continue }
    break
  }
  return Math.min(i, screens.length - 1)
}

/** The conditions the answers point to, across every asked region. Each
    region's best match is kept first, so a strong elbow match is never pushed
    out by three weaker shoulder ones; the rest fill up to `max`. */
export function rankAcross(keys, answers, max = 3) {
  const byRank = (a, b) => b.rank - a.rank || b.score - a.score
  const perRegion = keys.map((k) =>
    computeResults(REGIONS[k], regionAnswers(keys, k, answers)).ranked.map((x) => ({ ...x, rk: k })))
  const picked = perRegion.map((list) => list[0]).filter(Boolean).sort(byRank).slice(0, max)
  for (const x of perRegion.flat().sort(byRank)) {
    if (picked.length >= max) break
    if (!picked.includes(x)) picked.push(x)
  }
  return picked.sort(byRank)
}
