/* Runs Chandra's anonymised clinic cases through the guide (5 Oct 2026).
   Run: node scripts/check-cases.mjs            (every .json file in cases/)
        node scripts/check-cases.mjs some.json  (one file)

   The cases come from review/cases.html (scripts/make-case-form.mjs): the
   patient's answers on the first visit and the diagnosis made in clinic.
   Unlike the other checks, these were not made up from the guide's own
   scoring tables, so this is the fairest measure of accuracy we have before
   real-world data.

   Each case goes through the real flow (assessmentFlow.js): only the
   questions the guide picks are answered, from the case's answers; a
   question the case left blank stays blank. Reported:
   - shown first, in the 2 shown, named under "also worth considering", missed
   - the same with every answer given (what better questions could reach)
   - each miss, with what was shown instead
   A diagnosis that is not one of the guide's conditions is counted apart:
   it shows a gap in what the guide covers, not a reasoning error.
   It reports and does not fail: the cases are for learning, not a gate. */
import fs from 'node:fs'
import path from 'node:path'
import { REGIONS } from '../src/data/symptomGuide.js'
import { buildScreens, nextQuestion, rankAcross, alsoConsiderAcross, twinIds } from '../src/data/assessmentFlow.js'

const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.existsSync('cases') ? fs.readdirSync('cases').filter((f) => f.endsWith('.json')).map((f) => path.join('cases', f)) : []
if (!files.length) {
  console.log('No case files. Enter cases in review/cases.html (node scripts/make-case-form.mjs), download the file and save it in cases/.')
  process.exit(0)
}

const cases = []
const seen = new Set()
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'))
  for (const c of d.cases || []) {
    if (seen.has(c.id)) { console.log(`   (skipped ${c.id} in ${f}: the same id is in an earlier file)`); continue }
    seen.add(c.id); cases.push(c)
  }
}

/** The real flow, single area: the guide picks the questions. */
function runFlow(rk, full) {
  const keys = [rk]
  const ans = {}
  for (const q of buildScreens(keys).context) if (full[q.id] !== undefined) ans[q.id] = full[q.id]
  const asked = []
  let id
  while ((id = nextQuestion(keys, ans, asked))) {
    asked.push(id)
    const own = twinIds(id).find((x) => full[x] !== undefined)
    if (own !== undefined) ans[id] = full[own]
  }
  return ans
}

const outcome = (rk, ans, dx) => {
  const shown = rankAcross([rk], ans, 2)
  const also = alsoConsiderAcross([rk], ans, shown, 2)
  const pos = shown.findIndex((x) => x.c.id === dx)
  return { shown, also, first: pos === 0, top2: pos >= 0, also1: also.some((x) => x.c.id === dx) }
}
const nameOf = (rk, id) => (REGIONS[rk]?.conditions.find((c) => c.id === id) || {}).name || id

const tally = () => ({ n: 0, first: 0, top2: 0, also: 0, fullFirst: 0, fullTop2: 0 })
const total = tally(), byArea = {}, misses = []
let notCovered = 0, unknownArea = 0
for (const c of cases) {
  const region = REGIONS[c.area]
  if (!region) { unknownArea++; console.log(`   (skipped ${c.id}: unknown area "${c.area}")`); continue }
  if (c.diagnosis === 'other' || !region.conditions.some((x) => x.id === c.diagnosis)) { notCovered++; continue }
  const flow = outcome(c.area, runFlow(c.area, c.answers), c.diagnosis)
  const full = outcome(c.area, c.answers, c.diagnosis)
  for (const t of [total, (byArea[c.area] ||= tally())]) {
    t.n++
    if (flow.first) t.first++
    if (flow.top2) t.top2++
    if (flow.top2 || flow.also1) t.also++
    if (full.first) t.fullFirst++
    if (full.top2) t.fullTop2++
  }
  if (!flow.first) misses.push({ c, flow, full })
}

const pct = (a, n) => (n ? `${Math.round((100 * a) / n)}%` : '–')
const line = (t) => `${t.n} case(s): first ${t.first} (${pct(t.first, t.n)}), in the 2 shown ${t.top2} (${pct(t.top2, t.n)}), ` +
  `incl. "also worth considering" ${t.also} (${pct(t.also, t.n)}); with every answer: first ${pct(t.fullFirst, t.n)}, in the 2 shown ${pct(t.fullTop2, t.n)}`
console.log(`Cases from ${files.join(', ')}\n`)
console.log('All areas: ' + line(total))
for (const [rk, t] of Object.entries(byArea)) console.log(`   ${REGIONS[rk].name}: ${line(t)}`)
if (notCovered) console.log(`\nNot one of the guide's conditions: ${notCovered} case(s): a gap in what the guide covers, listed below.`)

if (misses.length) {
  console.log('\nNot shown first:')
  for (const { c, flow, full } of misses) {
    const where = flow.top2 ? 'second' : flow.also1 ? 'also worth considering' : 'missed'
    console.log(`   ${c.id} ${nameOf(c.area, c.diagnosis)} (${c.sure || 'sureness not given'}): ${where}`)
    console.log(`      shown: ${flow.shown.map((x) => `${x.c.name} ${x.score}`).join(', ') || 'nothing'}${flow.also.length ? ` · also: ${flow.also.map((x) => x.c.name).join(', ')}` : ''}`)
    if (full.first && !flow.first) console.log('      with every answer it is shown first: the flow did not ask the question that decides it')
    if (c.notes) console.log(`      notes: ${c.notes}`)
  }
}
const gaps = cases.filter((c) => REGIONS[c.area] && (c.diagnosis === 'other' || !REGIONS[c.area].conditions.some((x) => x.id === c.diagnosis)))
if (gaps.length) {
  console.log('\nDiagnoses the guide does not cover:')
  for (const c of gaps) console.log(`   ${c.id} ${REGIONS[c.area].name}: ${c.diagnosisOther || c.diagnosis}`)
}
