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
import { LOCATION_QUESTION_IDS } from './drawnLocation.js'
import {
  REGIONS, ZONE_TO_REGION, computeResults, computeRaw, shouldStop, isRelevant, answeredRegionCount, questionValue,
} from './symptomGuide.js'

/* Regions on one anatomical chain, from the spine outwards. */
export const REGION_CHAINS = [
  ['neck', 'shoulder', 'arm', 'elbow', 'forearm', 'wrist', 'hand'],
  ['lowback', 'hip', 'thigh', 'knee', 'leg', 'ankle', 'foot'],
  ['neck', 'ctj', 'upperback', 'tlj', 'lowback'],
  // The base of the neck feeds the arm too (first rib, thoracic outlet).
  ['ctj', 'shoulder', 'arm', 'elbow', 'forearm', 'wrist', 'hand'],
  // The TL junction refers to the low back, side of the hip and groin.
  // The back of the pelvis (sacroiliac) sits between them.
  ['tlj', 'lowback', 'sij', 'hip', 'thigh', 'knee', 'leg', 'ankle', 'foot'],
  // The back of the thigh sits directly below the buttock.
  ['sij', 'thigh'],
  // The tailbone, between the back of the pelvis and the perineum.
  ['tlj', 'lowback', 'sij', 'coccyx'],
  ['coccyx', 'hip'],
  // Head, jaw and upper neck all refer to each other.
  ['head', 'jaw', 'neck'],
]

const AREA_WORD = {
  lowback: 'low back', upperback: 'upper back', neck: 'neck', ctj: 'base of the neck', tlj: 'mid-to-low back', sij: 'back of the pelvis', coccyx: 'tailbone', jaw: 'jaw', head: 'head', arm: 'upper arm', shoulder: 'shoulder',
  elbow: 'elbow', forearm: 'forearm', wrist: 'wrist', hand: 'hand or fingers', hip: 'hip', thigh: 'thigh', knee: 'knee', leg: 'lower leg', ankle: 'ankle', foot: 'foot or toes',
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
  // d2m / o2m: the tailbone's own bands (2 weeks to 2 months, more than 2 months).
  // d12w: the jaw's band (2 weeks to 3 months).
  { id: 'd6w', label: '2 – 6 weeks', to: ['d6w', 'd2m', 'd12w'] },
  { id: 'd3m', label: '6 weeks – 3 months', to: ['d3m', 'd6m', 'o2m', 'd12w'] },
  { id: 'o3m', label: 'More than 3 months', to: ['o3m', 'd6m', 'o2m'] },
  { id: 'years', label: 'Comes and goes over years', to: ['years', 'o3m', 'd6m', 'o2m'] },
]
function mapDuration(id, q) {
  const d = DURATIONS.find((x) => x.id === id)
  return d ? d.to.find((t) => q.options.some((o) => o.id === t)) : undefined
}
// The myofascial tender-spot question ("Myofascial Pain" document, 2 Oct
// 2026) is the same in every area that has it: asked once, read by each.
const sharesTender = (q) => q.id === 'tender'
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
      if (sharesAge(q) || sharesDuration(q) || sharesTender(q)) continue
      const text = q.id === 'onset' ? `How did the ${AREA_WORD[k] || r.name.toLowerCase()} pain start?` : `${r.name}: ${q.text}`
      out.push({ ...q, id: `${q.id}@${k}`, text })
    }
  }
  if (keys.some((k) => REGIONS[k].context.some(sharesDuration))) {
    out.push({ id: 'duration', text: 'How long has it been going on?', options: DURATIONS.map(({ id, label }) => ({ id, label })) })
  }
  const tender = keys.map((k) => REGIONS[k].context.find(sharesTender)).find(Boolean)
  if (tender) out.push(tender)
  return out
}

/* Questions that ask the same thing in neighbouring areas carry the same
   `same` key and identical options (the CRPS question in the wrist, hand,
   ankle and foot: W9, H9, A9, B9). Ids stay unique, because answers are
   stored by id; the flow asks one of them, and each area reads that answer
   as its own. */
const SAME_OF = {}
for (const r of Object.values(REGIONS)) for (const q of r.questions) if (q.same) SAME_OF[q.id] = q.same
const twinAnswer = (q, answers) => {
  const id = Object.keys(SAME_OF).find((x) => x !== q.id && SAME_OF[x] === q.same && answers[x] !== undefined)
  return id === undefined ? undefined : answers[id]
}

/** The question id a patient's answer to `id` also stands for: the twin
    asked in its place (for test patients written with one area's id). */
export const twinIds = (id) => (SAME_OF[id] ? Object.keys(SAME_OF).filter((x) => SAME_OF[x] === SAME_OF[id]) : [id])

/** One region's view of the answers, in that region's own ids and bands. */
export function regionAnswers(keys, rk, answers) {
  if (keys.length <= 1) return answers
  const r = REGIONS[rk]
  const out = {}
  for (const q of r.questions) {
    if (answers[q.id] !== undefined) out[q.id] = answers[q.id]
    else if (q.same) { const v = twinAnswer(q, answers); if (v !== undefined) out[q.id] = v }
  }
  for (const q of r.context) {
    let v
    if (sharesAge(q)) v = answers.age === undefined ? undefined : mapAge(answers.age, q)
    else if (sharesDuration(q)) v = answers.duration === undefined ? undefined : mapDuration(answers.duration, q)
    else if (sharesTender(q)) v = answers.tender
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
// An area drawn next to the one it yields to (a forearm mark beside the
// elbow): its first question comes after the main area's. Once its own
// answers point somewhere, it counts in full.
const YIELD_WEIGHT = 0.2

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
      An area with `yieldsTo` (the forearm, next to the elbow) gives that
      slot up, and its questions count for less until it has been asked,
      when one of those areas is asked too.
    - After that, across all areas, the question that can still move the result
      the most (questionValue), with silent areas pushed back.
    - Areas where one condition is already clearly ahead are skipped, and it
      stops after `budget` questions.
    - A question with `askIf` (e.g. the neck's arm-symptom question, asked
      only when the drawing reaches the arm) is skipped when it returns false;
      one whose `priority` returns true is asked ahead of the rest.
    `askedIds` = scored questions already shown, answered or not.
    `ctx.draw` = the drawn zone types (leave out when unknown: askIf then
    asks), `ctx.all` = every answer, including unscored ones (pain quality),
    `ctx.minor` = region keys the drawing only grazed (./drawnLocation.js):
    like an area with `yieldsTo`, they give up their first slot.
    A "Where is the pain?" question the drawing has already answered
    (LOCATION_QUESTION_IDS) is not asked again. */
export function nextQuestion(keys, answers, askedIds, budget = MAX_SCORED_QUESTIONS, ctx = {}) {
  const draw = ctx.draw ? new Set(ctx.draw) : null
  const all = { ...answers, ...(ctx.all || {}) }
  if (askedIds.length >= budget) return null
  // A question whose twin (same `same` key) was asked in another area is done.
  const askedSame = new Set(askedIds.map((id) => SAME_OF[id]).filter(Boolean))
  const live = []
  for (const k of keys) {
    const region = REGIONS[k]
    const ra = regionAnswers(keys, k, answers)
    if (answeredRegionCount(region, ra) >= 2 && shouldStop(region, ra)) continue
    const askedHere = region.questions.filter((q) => askedIds.includes(q.id))
    const yields = (region.yieldsTo || []).some((y) => keys.includes(y)) || !!(ctx.minor && ctx.minor.has(k))
    const weight = askedHere.length ? (gaveSignal(askedHere, ra) ? 1 : SILENT_AREA_WEIGHT) : yields ? YIELD_WEIGHT : 1
    // A question the drawing pre-answered (N2 "past the elbow") is still to
    // be asked and can still gain points: judging it as already answered
    // made the neck's arm question look useless and skipped it.
    const open = { ...ra }
    for (const q of region.questions) if (!askedIds.includes(q.id)) delete open[q.id]
    for (const q of region.questions) {
      if (askedIds.includes(q.id) || (q.same && askedSame.has(q.same)) || !isRelevant(q, region, open)) continue
      if (LOCATION_QUESTION_IDS.has(q.id) && [].concat(answers[q.id] ?? []).length) continue
      if (q.askIf && !q.askIf({ draw, ra: open, all })) continue
      live.push({ id: q.id, unseenArea: askedHere.length === 0 && !yields, v: questionValue(q, region, open) * weight + (q.priority && q.priority({ draw, ra: open, all }) ? 1 : 0) })
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
  // A pattern two asked areas both describe (the neck's and the head's
  // "Neck-related headache") is shown once, from the area that ranks it higher.
  const picked = []
  const add = (x) => {
    if (picked.length >= max || picked.includes(x) || picked.some((p) => p.c.name === x.c.name)) return
    picked.push(x)
  }
  perRegion.map((list) => list[0]).filter(Boolean).sort(byRank).forEach(add)
  perRegion.flat().sort(byRank).forEach(add)
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
  // Drawn areas before implied ones, so a shared (grouped) flag keeps the
  // wording of the area the person actually marked.
  const ordered = [...flowZ.filter((z) => !z.implied), ...flowZ.filter((z) => z.implied)]
  const keys = [...new Set(ordered.map((z) => ZONE_TO_REGION[z.type]).filter((k) => k && REGIONS[k]))]
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
  // A merged flag lists several groups (the neck's stroke question also
  // covers the sudden headache): it is kept unless every one is already
  // asked, and then stands in for all of them.
  const groups = new Set()
  return out.filter((f) => {
    if (!f.group) return true
    const gs = [].concat(f.group)
    if (gs.every((g) => groups.has(g))) return false
    gs.forEach((g) => groups.add(g))
    return true
  })
}

/** The safety flags when the person has left some drawn areas out of the
    questions (an area the line only touched, unticked on the Draw page).
    Chandra's cautious rule (28 Sep 2026): a left-out area loses its pain and
    "see a doctor" questions but keeps its EMERGENCY ones. `excludedZ` = the
    left-out areas' zones. A left-out area's emergency flag is not added when
    an asked area already covers every one of its groups. */
export function regionRedFlagsFor(flowZ = [], zones = flowZ, excludedZ = []) {
  const main = regionRedFlags(flowZ, zones)
  if (!excludedZ.length) return main
  const seen = new Set(main.flatMap((f) => [].concat(f.group || [])))
  const extra = regionRedFlags(excludedZ, zones).filter((f) => f.tier === 'emergency' && !main.includes(f) &&
    !(f.group && [].concat(f.group).every((g) => seen.has(g))))
  return [...main.filter((f) => f.tier === 'emergency'), ...extra, ...main.filter((f) => f.tier !== 'emergency')]
}

/** Whether a safety question can apply to this person ("A little about you",
    Chandra, 2 Oct 2026). A question tagged `sex` ("female" / "male": birth
    sex, so pregnancy questions still reach a trans man) is left out only for
    the other birth sex; `ages` (age answer ids) only when the age is known and
    outside them. Unknown, "intersex or prefer not to say", or untagged: always
    asked. Emergency questions are only ever tagged by birth sex, never age. */
export function forPerson(f, { age, sex } = {}) {
  if (f.sex && (sex === 'female' || sex === 'male') && f.sex !== sex) return false
  if (f.ages && age && !f.ages.includes(age)) return false
  return true
}

/** True when a flag belongs to this group (a flag's group may be a list). */
export const inGroup = (f, g) => [].concat(f.group || []).includes(g)
