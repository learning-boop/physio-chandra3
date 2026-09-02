import fs from 'node:fs'
import { AUTHORED } from '../src/data/symptomGuideAuthored.js'
import { REGIONS, allQuestions } from '../src/data/symptomGuide.js'

// index every draft file by region/id so each record can cite its source file
const files = {}
for (const f of fs.readdirSync('content/conditions')) {
  if (!f.endsWith('.md') || f.startsWith('_')) continue
  const t = fs.readFileSync('content/conditions/' + f, 'utf8')
  const id = (t.match(/^id:\s*(\S+)/m) || [])[1]
  const region = (t.match(/^region:\s*(\S+)/m) || [])[1]
  const source = (t.match(/# DRAFT extracted from:\s*(.*)/) || [])[1] || ''
  if (id && region) files[`${region}/${id}`] = { file: f, source: source.trim() }
}
const out = AUTHORED.map((e) => {
  const meta = files[`${e.region}/${e.cond.id}`] || { file: '?', source: '' }
  const qtext = Object.fromEntries(allQuestions(REGIONS[e.region]).map((q) => [q.id, q.text]))
  return {
    region: e.region, regionName: REGIONS[e.region].name, ...meta, ...e.cond,
    pointers: e.resolved.map((r) => ({ q: qtext[r.qid] || r.qid, label: r.label, weight: r.weight })),
  }
})
fs.writeFileSync(process.env.SCRATCH + '/review.json', JSON.stringify(out, null, 1))
console.log(out.length, 'records')
for (const r of out) console.log(`  ${r.region}/${r.id}`.padEnd(22) + `${r.pointers.length}p  ${r.source.slice(0, 46)}`)
