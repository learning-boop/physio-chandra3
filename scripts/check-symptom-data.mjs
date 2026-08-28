/* Validates the symptom/treatment library.
   Run: node scripts/check-symptom-data.mjs
   A condition is only ever shown if some question option carries a weight
   pointing at its id AND the total reachable score can clear the threshold
   (score >= 3 AND score/max >= 0.4). This checks both. */
import { REGIONS, maxScores, allQuestions, meetsThreshold } from '../src/data/symptomGuide.js'

const REQUIRED = ['id', 'name', 'blurb', 'noticed', 'homeCare', 'seePhysioIf']
let errors = 0, warnings = 0
const log = (kind, msg) => { console.log(`${kind === 'E' ? '  ERROR  ' : '  warn   '}${msg}`); kind === 'E' ? errors++ : warnings++ }

for (const [key, region] of Object.entries(REGIONS)) {
  console.log(`\n── ${key} · ${region.name} ──`)
  const ids = new Set(region.conditions.map((c) => c.id))
  const max = maxScores(region)

  // every weight must point at a real condition in this region
  const pointedAt = new Set()
  for (const q of allQuestions(region)) {
    for (const o of q.options || []) {
      for (const [cid, w] of Object.entries(o.weights || {})) {
        pointedAt.add(cid)
        if (!ids.has(cid)) log('E', `question ${q.id} option "${o.id}" weights unknown condition "${cid}"`)
        if (typeof w !== 'number') log('E', `question ${q.id} option "${o.id}" weight for "${cid}" is not a number`)
      }
    }
  }

  for (const c of region.conditions) {
    const miss = REQUIRED.filter((f) => !c[f] || (Array.isArray(c[f]) && !c[f].length))
    if (miss.length) log('E', `condition "${c.id}" missing: ${miss.join(', ')}`)
    if (!pointedAt.has(c.id)) log('E', `condition "${c.id}" (${c.name}) is UNREACHABLE — no question option weights it`)
    else if (!meetsThreshold(max[c.id], max[c.id])) log('E', `condition "${c.id}" can never clear the threshold (max ${max[c.id]})`)
    else if (max[c.id] < 5) log('w', `condition "${c.id}" has a low ceiling (max ${max[c.id]}) — needs nearly every pointer to show`)
  }
  console.log(`  ${region.conditions.length} conditions · ${allQuestions(region).length} questions · reachable: ${region.conditions.filter((c) => pointedAt.has(c.id)).length}/${region.conditions.length}`)
}
console.log(`\n${errors} error(s), ${warnings} warning(s)`)
process.exit(errors ? 1 : 0)
