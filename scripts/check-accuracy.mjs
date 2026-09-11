/* Does the questionnaire give the RIGHT answer?  Run: npm run check:accuracy

   check-symptom-data.mjs only proves each condition is reachable in theory.
   This runs patients through the same adaptive flow the homepage uses
   (src/data/assessmentFlow.js) and checks what they are shown:

   1. Textbook patient — ticks every telltale answer of one condition. That
      condition must be shown FIRST. Any miss fails the run (exit 1).
   2. Realistic patient — the same, but misses one telltale answer. Reported
      as a percentage; no questionnaire can be perfect on partial answers.
   3. Lines across areas (shoulder → elbow, hip → knee …) — a patient with a
      condition in either area, answering "not sure"/nothing for the other
      area. The condition must be among the results. Any miss fails the run.

   Run it after adding or editing anything in content/conditions/.        */
import { REGIONS } from '../src/data/symptomGuide.js'
import {
  REGION_CHAINS, buildScreens, nextScreen, rankAcross, regionAnswers,
} from '../src/data/assessmentFlow.js'

const others = (o, cid) =>
  Object.entries(o.weights || {}).filter(([k]) => k !== cid).reduce((s, [, w]) => s + Math.max(0, w), 0)

/** The answers someone with condition c would give, in the region's own ids. */
function textbook(region, c) {
  const a = {}, g = c.gates || {}
  for (const q of region.context.concat(region.questions)) {
    let opts = q.options
    if (q.id === 'age' && g.ages) opts = opts.filter((o) => g.ages.includes(o.id))
    if (q.id === 'onset' && g.requiresOnset) opts = opts.filter((o) => g.requiresOnset.includes(o.id))
    const pos = opts.filter((o) => (o.weights?.[c.id] || 0) > 0 || (g.unlockedBy && o.unlocks === g.unlockedBy))
    if (q.multi) {
      if (pos.length) a[q.id] = pos.map((o) => o.id)
    } else {
      // single answer: the best telltale, else the option that helps rivals least
      const pick = [...pos].sort((x, y) => (y.weights?.[c.id] || 0) - (x.weights?.[c.id] || 0))[0]
        || [...opts].sort((x, y) => others(x, c.id) - others(y, c.id))[0]
      if (pick) a[q.id] = pick.id
    }
  }
  return a
}

/** Every way of forgetting exactly one telltale answer. */
function missedOne(region, c, base) {
  const out = []
  for (const [qid, v] of Object.entries(base)) {
    if (Array.isArray(v)) v.forEach((oid) => out.push({ ...base, [qid]: v.filter((x) => x !== oid) }))
    else if (region.context.find((q) => q.id === qid)?.options.find((o) => o.id === v)?.weights?.[c.id]) {
      const { [qid]: _, ...rest } = base
      out.push(rest)
    }
  }
  return out
}

/** Walk the real flow: only the screens nextScreen() lands on get answered. */
function runFlow(keys, full) {
  const { context, questions } = buildScreens(keys)
  const screens = [{ id: '__ctx', group: context }, ...questions]
  const ans = {}
  for (const q of context) if (full[q.id] !== undefined) ans[q.id] = full[q.id]
  let i = nextScreen(screens, 1, keys, ans)
  while (i < screens.length && screens[i].rk) {
    const q = screens[i]
    if (full[q.id] !== undefined) ans[q.id] = full[q.id]
    if (i === screens.length - 1) break
    i = nextScreen(screens, i + 1, keys, ans)
  }
  return rankAcross(keys, ans)
}

/** Translate one region's answers into the shared ids of a multi-area screen. */
function toShared(keys, rk, own) {
  const { context } = buildScreens(keys)
  const full = { ...own }
  delete full.age; delete full.onset; delete full.duration
  for (const q of context) {
    if (q.id === 'age' || q.id === 'duration') {
      // the shared band that maps back onto this region's own answer
      const want = own[q.id]
      const hit = q.options.find((o) => regionAnswers(keys, rk, { [q.id]: o.id })[q.id] === want)
      if (hit) full[q.id] = hit.id
    } else if (q.id.endsWith('@' + rk)) {
      if (own[q.id.split('@')[0]] !== undefined) full[q.id] = own[q.id.split('@')[0]]
    } else {
      // the other area's "how did it start": not sure
      const ns = q.options.find((o) => o.id === 'ns') || q.options.find((o) => !o.weights)
      if (ns) full[q.id] = ns.id
    }
  }
  return full
}

let failed = 0
const say = (s) => console.log(s)

say('\n1. Textbook patients (every telltale answer) — must be shown first')
let n1 = 0
for (const [rk, region] of Object.entries(REGIONS)) {
  for (const c of region.conditions) {
    n1++
    const got = runFlow([rk], textbook(region, c))
    if (got[0]?.c.id !== c.id) {
      failed++
      say(`   FAIL  ${rk}/${c.id} → shown: ${got.map((x) => x.c.id).join(', ') || 'nothing'}`)
    }
  }
}
say(`   ${n1 - failed}/${n1} shown first`)

say('\n2. Realistic patients (one telltale answer missed)')
let n2 = 0, ok2 = 0
for (const [rk, region] of Object.entries(REGIONS)) {
  for (const c of region.conditions) {
    for (const v of missedOne(region, c, textbook(region, c))) {
      n2++
      if (runFlow([rk], v)[0]?.c.id === c.id) ok2++
    }
  }
}
say(`   ${ok2}/${n2} shown first (${Math.round((100 * ok2) / n2)}%)`)

say('\n3. Lines across two neighbouring areas — the condition must be in the results')
const pairs = []
for (const chain of REGION_CHAINS) for (let i = 0; i + 1 < chain.length; i++) pairs.push([chain[i], chain[i + 1]])
let n3 = 0, first3 = 0, fail3 = 0
for (const keys of pairs) {
  for (const rk of keys) {
    for (const c of REGIONS[rk].conditions) {
      n3++
      const got = runFlow(keys, toShared(keys, rk, textbook(REGIONS[rk], c)))
      const pos = got.findIndex((x) => x.c.id === c.id && x.rk === rk)
      if (pos === 0) first3++
      if (pos < 0) {
        fail3++
        say(`   FAIL  ${keys.join('→')}: ${rk}/${c.id} → shown: ${got.map((x) => `${x.rk}/${x.c.id}`).join(', ') || 'nothing'}`)
      }
    }
  }
}
failed += fail3
say(`   ${n3 - fail3}/${n3} in the results, ${first3}/${n3} shown first`)

say(failed ? `\n${failed} failure(s)` : '\nAll checks passed')
process.exit(failed ? 1 : 0)
