/* ─────────────────────────────────────────────────────────────────────────
   How a drawn selection becomes a questionnaire and a result.

   Kept out of PainAssessment.jsx so the exact same logic can be exercised in
   Node by scripts/check-accuracy.mjs — the component only renders it.

   A line through several areas of ONE chain (shoulder → elbow, low back →
   knee) draws on every crossed region's own weighted questions, so a problem
   in any of them can be recognised. Asking only the region nearest the spine
   meant an elbow problem on a shoulder-to-elbow line could never be matched
   at all. nextQuestion() keeps it short: the most useful question each time,
   at most MAX_SCORED_QUESTIONS of them.
   ───────────────────────────────────────────────────────────────────────── */
import {
  REGIONS, ZONE_TO_REGION, computeResults, computeRaw, shouldStop, isRelevant, answeredRegionCount, questionValue,
} from './symptomGuide.js'

/* Regions on one anatomical chain, from the spine outwards. */
export const REGION_CHAINS = [
  ['neck', 'shoulder', 'elbow', 'wrist'],
  ['lowback', 'hip', 'knee', 'ankle'],
  ['neck', 'ctj', 'upperback', 'tlj', 'lowback'],
  // The base of the neck feeds the arm too (first rib, thoracic outlet).
  ['ctj', 'shoulder', 'elbow', 'wrist'],
  // The TL junction refers to the low back, side of the hip and groin.
  ['tlj', 'lowback', 'hip', 'knee', 'ankle'],
]

const AREA_WORD = {
  lowback: 'low back', upperback: 'upper back', neck: 'neck', ctj: 'base of the neck', tlj: 'mid-to-low back', shoulder: 'shoulder',
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
  const keys = regionKeysOf(zones.filter((z) => !z.implied))
  return !focusKey && keys.length > 1 && !chainOrder(keys)
}

/** The regions whose questions will be asked, in asking order. */
export function questionRegions(zones, focusKey) {
  if (focusKey && REGIONS[focusKey]) {
    // Areas a referral line implies (the base of the neck, for a line from
    // the neck down the arm) come with the chosen area they belong to.
    const implied = regionKeysOf(zones.filter((z) => z.implied)).filter((k) => k !== focusKey)
    return (implied.length && chainOrder([focusKey, ...implied])) || [focusKey]
  }
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

/* At most this many scored questions, so the whole flow is the opening screen
   + these = 6 screens, however many areas are drawn (the free-text box sits on
   the review screen). scripts/check-accuracy.mjs measures what each extra
   question buys: 4 misses conditions on two-area lines, 5 does not. */
export const MAX_SCORED_QUESTIONS = 5

// An area whose answers so far point at nothing ("Not sure", nothing ticked)
// is probably not where the problem is; its questions are asked only when
// nothing better is left.
const SILENT_AREA_WEIGHT = 0.25

/** True when any of these asked questions got an answer that points at a condition. */
function gaveSignal(questions, ra) {
  return questions.some((q) => {
    const a = ra[q.id]
    const ids = Array.isArray(a) ? a : a === undefined ? [] : [a]
    return ids.some((id) => {
      const o = q.options.find((x) => x.id === id)
      return o && o.weights && Object.values(o.weights).some((w) => w > 0)
    })
  })
}

/** The id of the next scored question to ask, or null when done.
    - Each drawn area first gets its single most useful question, so a line
      from the shoulder to the elbow finds out early which area is involved.
    - After that, across all areas, the question that can still move the result
      the most (questionValue), with silent areas pushed back.
    - Areas where one condition is already clearly ahead are skipped, and it
      stops after `budget` questions.
    - A question with `askIf` (e.g. the neck's arm-symptom question, asked
      only when the drawing reaches the arm) is skipped when it returns false;
      one whose `priority` returns true is asked ahead of the rest.
    `askedIds` = scored questions already shown, answered or not.
    `ctx.draw` = the drawn zone types (leave out when unknown: askIf then
    asks), `ctx.all` = every answer, including unscored ones (pain quality). */
export function nextQuestion(keys, answers, askedIds, budget = MAX_SCORED_QUESTIONS, ctx = {}) {
  const draw = ctx.draw ? new Set(ctx.draw) : null
  const all = { ...answers, ...(ctx.all || {}) }
  if (askedIds.length >= budget) return null
  const live = []
  for (const k of keys) {
    const region = REGIONS[k]
    const ra = regionAnswers(keys, k, answers)
    if (answeredRegionCount(region, ra) >= 2 && shouldStop(region, ra)) continue
    const askedHere = region.questions.filter((q) => askedIds.includes(q.id))
    const weight = askedHere.length && !gaveSignal(askedHere, ra) ? SILENT_AREA_WEIGHT : 1
    for (const q of region.questions) {
      if (askedIds.includes(q.id) || !isRelevant(q, region, ra)) continue
      if (q.askIf && !q.askIf({ draw, ra, all })) continue
      live.push({ id: q.id, unseenArea: askedHere.length === 0, v: questionValue(q, region, ra) * weight + (q.priority && q.priority({ draw, ra, all }) ? 1 : 0) })
    }
  }
  const pool = keys.length > 1 && live.some((x) => x.unseenArea) ? live.filter((x) => x.unseenArea) : live
  let best = null
  for (const x of pool) if (!best || x.v > best.v) best = x
  return best ? best.id : null
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

/** Education cards the answers call for (e.g. "this may be coming from your
    shoulder"), across every asked region, without repeats. */
export function specialsAcross(keys, answers) {
  const out = []
  for (const k of keys) {
    for (const s of computeRaw(REGIONS[k], regionAnswers(keys, k, answers)).specials) if (!out.includes(s)) out.push(s)
  }
  return out
}

/** The drawn regions' own red flags, emergency tier first, without repeats.
    `flowZ` = the zones the questions are asked about, `zones` = every drawn
    zone; a flag with `drawn` (e.g. the neck's shoulder-tip flags) is only
    asked when one of those zone types is marked. */
export function regionRedFlags(flowZ = [], zones = flowZ) {
  const keys = [...new Set(flowZ.map((z) => ZONE_TO_REGION[z.type]).filter((k) => k && REGIONS[k]))]
  const drawn = new Set(zones.map((z) => z.type))
  const out = []
  for (const tier of ['emergency', 'urgent']) {
    for (const k of keys) {
      for (const f of REGIONS[k].redFlags) {
        if (f.tier !== tier || out.includes(f)) continue
        if (f.drawn && !f.drawn.some((t) => drawn.has(t))) continue
        out.push(f)
      }
    }
  }
  // Flags sharing a `group` ask the same thing in neighbouring areas (the
  // heart, aorta or spinal-cord question in the neck, base of the neck, mid
  // back and TL junction): keep the first, which is the most serious tier.
  const groups = new Set()
  return out.filter((f) => {
    if (!f.group) return true
    if (groups.has(f.group)) return false
    groups.add(f.group)
    return true
  })
}
