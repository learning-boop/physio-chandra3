/* The lower back prototype review page (8 Oct 2026): every safety question a
   lower-back drawing asks, before (as now on every other area) and after
   (plain group question, short bullets, one sign per tick), for sign-off.
   Run: npm run review:lowback   →   review/lowback-plain.html
                                     review/lowback-plain-link.html (phone link) */
import fs from 'node:fs'
import { renderPage } from './make-signoff.mjs'
import { GATES } from '../src/data/safetyGates.js'
import { EM_GROUPS, EM_SHORT } from '../src/data/emergencyGroups.js'
import { SHORT } from '../src/data/safetyGates.js'
import { PLAIN_GATES, PLAIN_Q, TICKS, COVERED, WHEN_Q, shortFor, tellThem, toggleTick } from '../src/data/lowbackPlain.js'

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// The questions' current wording, read from the site source.
const files = ['src/components/PainAssessment.jsx', ...fs.readdirSync('src/data').filter((f) => f.endsWith('.js')).map((f) => 'src/data/' + f)]
const OLD = {}
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8')
  const starts = [...src.matchAll(/\bid: ?(['"])([a-z0-9-]+)\1/g)]
  starts.forEach((m, i) => {
    if (!TICKS[m[2]] && !COVERED[m[2]] || OLD[m[2]]) return
    const chunk = src.slice(m.index, starts[i + 1] ? starts[i + 1].index : m.index + 1500)
    const t = chunk.match(/\btext: ?(['"])((?:\\.|(?!\1).)*)\1/)
    if (t) OLD[m[2]] = { text: t[2].replace(/\\'/g, "'"), tier: (chunk.match(/\btier: ?['"](\w+)/) || [])[1] }
  })
}
const tierTag = (id) => OLD[id] && OLD[id].tier === 'emergency' ? '<span class="tag">emergency</span>' : '<span class="muted">see a doctor</span>'

const decide = (key) => `<div class="decide">
    <label><input type="radio" name="d_${esc(key)}" value="sign"> <span class="approve">Approve as built</span></label>
    <label><input type="radio" name="d_${esc(key)}" value="change"> Needs changes (say what below)</label>
    <textarea placeholder="Changes or notes"></textarea>
  </div>`
const ticksHtml = (id) => `<ul>${TICKS[id].map((t) => `<li>${esc(t.text)}${t.combo ? ' <span class="muted">(both together)</span>' : ''}${t.sex ? ` <span class="muted">(${t.sex} only)</span>` : ''}</li>`).join('')}</ul>`
const groupCard = (key, area, gid, members, oldTitle) => {
  const oldLine = `${oldTitle}: ${members.map((m) => SHORT[m] || EM_SHORT[m]).filter(Boolean).join('; ')}`
  return `<section class="card" data-key="${esc(key)}" data-area="${area}">
  <h2>${esc(PLAIN_GATES[gid])}</h2>
  <div class="cols"><div><h4>Before</h4><p class="old">${esc(oldLine)}</p></div>
  <div><h4>After: the group</h4><p><strong>${esc(PLAIN_GATES[gid])}</strong></p><ul>${[...new Set(members.map((m) => shortFor(m)))].map((b) => `<li>${esc(b)}</li>`).join('')}</ul></div></div>
  <h4>After: inside the group, one sign per tick</h4>
  ${members.map((m) => `<p class="q"><code>${esc(m)}</code> ${tierTag(m)}<br><span class="old">Before: ${esc(OLD[m] ? OLD[m].text : '')}</span></p>${ticksHtml(m)}`).join('')}
  ${decide(key)}</section>`
}
const aloneCard = (key, area, id) => `<section class="card" data-key="${esc(key)}" data-area="${area}">
  <h2>${esc(PLAIN_Q[id] || TICKS[id][0].text)}</h2><p class="q"><code>${esc(id)}</code> ${tierTag(id)} <span class="muted">shown on its own when no other question of its group applies</span></p>
  <div class="cols"><div><h4>Before</h4><p class="old">${esc(OLD[id] ? OLD[id].text : '')}</p></div><div><h4>After</h4>${ticksHtml(id)}</div></div>
  ${decide(key)}</section>`

// The groups and questions a lower-back drawing can show (age and sex decide some).
const EM = ['rf-saddle', 'rf-bladder', 'rf-sexual', 'rf-legs', 'jrf-conus-legs', 'rf-aaa', 'jrf-aorta', 'jrf-pancreas', 'jrf-testis', 'pc-stroke', 'rf-fracture']
const em = EM_GROUPS.map((g) => ({ g, m: g.members.filter((id) => EM.includes(id)) })).filter((x) => x.m.length >= 2)
const doc = GATES.lowerback.map((g) => ({ g, m: g.members.filter((id) => TICKS[id]) }))
const OLD_TITLES = Object.fromEntries([...EM_GROUPS, ...GATES.lowerback].map((g) => [g.id, g.title]))

const sample = tellThem(toggleTick(toggleTick([], 'rf-saddle', 'paper'), 'rf-bladder', 'start'), { [WHEN_Q.id]: 'today' })
const other = `<section class="card" data-key="other" data-area="other">
  <h2>Other changes on the lower back</h2>
  <ul>
    <li><strong>Fixed:</strong> the cauda equina sex question (<code>rf-sexual</code>) was never asked on a lower back drawing; it shared a group label with the bladder question, so the duplicate filter dropped it. It is now asked.</li>
    <li><strong>When did this start?</strong> After a nerve sign: Today / In the last few days / Weeks ago, or longer. It goes into the "Tell them" line; it does not change the route (new cauda equina signs stay an emergency).</li>
    <li><strong>Tell them</strong> (below the action, on the emergency and see-a-doctor screens), built from the ticks, e.g.: <em>“${esc(sample)}”</em></li>
    <li><strong>You told us / You selected</strong> now list the ticked signs in plain words; your summary lists them after the question ("ticked: …").</li>
    <li><strong>Left out as a repeat:</strong> ${Object.entries(COVERED).map(([a, b]) => `<code>${a}</code> (its signs are ${b}'s ticks)`).join(', ')}.</li>
    <li><strong>Physio while waiting:</strong> the possible infection questions (spine, joint) now let the patient book, with treatment after the doctor's check (was: physio alongside). The generic reason line no longer says physio must wait.</li>
    <li><strong>Page intros:</strong> "These check for anything that needs help right now…" and "Some signs mean a doctor should check you. Tick any that fit you now."</li>
  </ul>
  ${decide('other')}</section>`

const page = (bare) => renderPage({
  bare,
  cards: [],
  title: 'Lower Back Questions',
  heading: 'Lower back: the new question design',
  lede: 'Every safety question a lower-back drawing asks, before and after. Patients read short plain lines; the reasoning underneath is unchanged: each tick sets the same red flag, with the same tier, 911 route and booking rule. Signs that only count together stay on one line.',
  extra: [
    { area: 'emergency', title: 'Emergency page', html: em.map(({ g, m }) => groupCard(`em:${g.id}`, 'emergency', g.id, m, OLD_TITLES[g.id])).join('') + aloneCard('em:rf-fracture', 'emergency', 'rf-fracture') },
    { area: 'doctor', title: 'Doctor page', html: doc.map(({ g, m }) => groupCard(`doc:${g.id}`, 'doctor', g.id, m, OLD_TITLES[g.id])).join('') +
      ['pc-visceral', 'jrf-legs', 'jrf-shingles', 'rf-aaa-slow', 'rf-spondy'].filter((id) => !doc.some(({ m }) => m.includes(id))).map((id) => aloneCard(`doc:${id}`, 'doctor', id)).join('') },
    { area: 'other', title: 'Other changes', html: other },
  ],
  storageKey: 'lowback-plain-v1',
})
const style = (s) => s.replace('</style>', `  .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; } .cols > div { min-width: 0; }
  .old { color: var(--muted); font-size: 14px; } .q { margin: 12px 0 2px; } .muted { color: var(--muted); font-size: 13px; }
  .card ul { margin: 4px 0 8px; padding-left: 20px; }
</style>`)

fs.mkdirSync('review', { recursive: true })
fs.writeFileSync('review/lowback-plain.html', style(page(false)))
// The same page without its own html/head tags, for a phone link.
fs.writeFileSync('review/lowback-plain-link.html', style(page(true)))
console.log(`review/lowback-plain.html: ${em.length + 1} emergency cards, ${doc.length} doctor groups, ${Object.keys(TICKS).length} questions, ${Object.values(TICKS).flat().length} ticks`)
