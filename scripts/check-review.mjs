/* What has Chandra signed off?   Run: npm run check:review

   A region is signed when its document record (content/regions/<id>.md) has
   a date on its reviewed_on line, e.g.
       reviewed_on: 2026-09-26
   A condition is signed when its file (content/conditions/<region>-<id>.md)
   has a name and date on its reviewed line, e.g.
       reviewed: Chandra Matla, 2026-09-26

   Unsigned content still shows on the site; this only reports. Texts that
   Claude drafted (rather than moved or extracted) are marked, because they
   need the closest read. The review page (npm run review) shows the same
   status next to what patients actually see.                              */
import fs from 'node:fs'
import { REGIONS } from '../src/data/symptomGuide.js'

export const DATE = /\b20\d\d-\d\d-\d\d\b/

/** { region: { reviewed_on, signed } } from content/regions/*.md */
export function regionSignoff() {
  const out = {}
  for (const f of fs.readdirSync('content/regions')) {
    if (!f.endsWith('.md') || f.startsWith('_')) continue
    const t = fs.readFileSync('content/regions/' + f, 'utf8')
    const region = (t.match(/^region:\s*(\S+)/m) || [])[1]
    const on = ((t.match(/^reviewed_on:\s*(.*)$/m) || [])[1] || '').trim()
    if (region) out[region] = { file: 'content/regions/' + f, reviewedOn: on, signed: DATE.test(on) && !/draft/i.test(on) }
  }
  return out
}

/** { "region/id": { file, reviewed, signed, origin } } from content/conditions/*.md */
export function conditionSignoff() {
  const out = {}
  for (const f of fs.readdirSync('content/conditions')) {
    if (!f.endsWith('.md') || f.startsWith('_')) continue
    const t = fs.readFileSync('content/conditions/' + f, 'utf8')
    const id = (t.match(/^id:\s*(\S+)/m) || [])[1]
    const region = (t.match(/^region:\s*(\S+)/m) || [])[1]
    const reviewed = ((t.match(/^reviewed:\s*(.*)$/m) || [])[1] || '').trim()
    const origin = /DRAFT patient text written/.test(t) ? 'drafted by Claude'
      : /DRAFT extracted from/.test(t) ? 'extracted from a guideline'
      : /moved (unchanged )?from|Patient text moved|shared with/.test(t) ? 'existing text moved'
      : ''
    if (id && region) out[`${region}/${id}`] = { file: 'content/conditions/' + f, reviewed, signed: DATE.test(reviewed), origin }
  }
  return out
}

const isMain = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('scripts/check-review.mjs')
if (isMain) {
  const regions = regionSignoff()
  const conds = conditionSignoff()
  let rSigned = 0, rTotal = 0, cSigned = 0, cTotal = 0, drafted = 0, inline = 0
  for (const [key, R] of Object.entries(REGIONS)) {
    const doc = regions[key]
    const head = doc
      ? (doc.signed ? `region document signed ${doc.reviewedOn}` : `region document NOT SIGNED  (${doc.file}, reviewed_on)`)
      : 'July 2026 set — no region document built yet'
    if (doc) { rTotal++; if (doc.signed) rSigned++ }
    console.log(`\n── ${key} · ${R.name} ── ${head}`)
    for (const c of R.conditions) {
      const s = conds[`${key}/${c.id}`]
      cTotal++
      if (!s) { inline++; console.log(`   ·  in code  ${c.name}  (old set: gets a file when the region is rebuilt)`); continue }
      if (s.signed) cSigned++
      if (s.origin === 'drafted by Claude' && !s.signed) drafted++
      console.log(`   ${s.signed ? '✓  signed  ' : '✗  unsigned'} ${s.file.replace('content/conditions/', '')}  ${c.name}` +
        (s.signed ? `  — ${s.reviewed}` : s.origin ? `  [${s.origin}]` : ''))
    }
  }
  console.log(`\nRegion documents signed: ${rSigned}/${rTotal}`)
  console.log(`Conditions signed: ${cSigned}/${cTotal - inline} in files` + (inline ? ` (+${inline} old-set conditions still in code)` : ''))
  console.log(`Unsigned texts drafted by Claude: ${drafted} — read these most closely`)
}
