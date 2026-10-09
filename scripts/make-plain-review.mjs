/* Review pages for the plain question design (8 Oct 2026): every safety
   question a one-area drawing asks, before (as on the other areas) and after
   (plain group question, short bullets, one sign per tick), for sign-off.
   Run: npm run review:lowback   →   review/lowback-plain.html (+ -link.html for the phone)
        npm run review:neck      →   review/neck-plain.html    (+ -link.html)
        npm run review:shoulder  →   review/shoulder-plain.html (+ -link.html) */
import fs from 'node:fs'
import { renderPage } from './make-signoff.mjs'
import { GATES, SHORT } from '../src/data/safetyGates.js'
import { EM_GROUPS, EM_SHORT } from '../src/data/emergencyGroups.js'
import { gateQ, PLAIN_Q, SUBHEAD, TICKS, ticksFor, COVERED, TICK_SKIP, WHEN_Q, shortFor, tellThem, toggleTick } from '../src/data/plainQuestions.js'

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/* Each area: what its pages can show (age and sex decide some), and the
   changes that are its own. */
const AREAS = {
  lowerback: {
    out: 'lowback-plain', title: 'Lower Back Questions', name: 'Lower back',
    em: ['rf-saddle', 'rf-bladder', 'rf-sexual', 'rf-legs', 'jrf-conus-legs', 'rf-aaa', 'jrf-aorta', 'jrf-pancreas', 'jrf-testis', 'pc-stroke', 'rf-fracture'],
    emAlone: ['rf-fracture'],
    docAlone: ['pc-visceral', 'jrf-legs', 'jrf-shingles', 'rf-aaa-slow', 'rf-spondy'],
    sample: () => tellThem(toggleTick(toggleTick([], 'rf-saddle', 'paper'), 'rf-bladder', 'start'), { [WHEN_Q.id]: 'today' }, 'lowerback'),
    own: [
      '<strong>Fixed:</strong> the cauda equina sex question (<code>rf-sexual</code>) was never asked on a lower back drawing; it shared a group label with the bladder question, so the duplicate filter dropped it. It is now asked.',
      '<strong>Physio while waiting:</strong> the possible infection questions (spine, joint) now let the patient book, with treatment after the doctor\'s check (was: physio alongside).',
    ],
  },
  neck: {
    out: 'neck-plain', title: 'Neck Questions', name: 'Neck',
    em: ['nrf-stroke', 'nrf-mening', 'nrf-cardiac', 'nrf-cord', 'nrf-cord-legs', 'nrf-after'],
    emAlone: ['nrf-after'],
    docAlone: ['nrf-after-doc', 'sc-systemic'],
    sample: () => tellThem(toggleTick([], 'nrf-myelo', 'walk'), { [WHEN_Q.id]: 'days' }, 'neck'),
    own: [
      '<strong>Sub-headings inside a group:</strong> the stroke signs sit in a box headed "Came on suddenly since this started:", so the time limit covers only them and not the fever or heart signs below.',
      '<strong>The general medical question</strong> (<code>sc-systemic</code>) keeps fever and past cancer on the neck; the lower back leaves them out only because its own infection and cancer questions ask them.',
      '<strong>The neck injury screen</strong> ("Have you injured your neck in the last 7 days…") is unchanged in this step.',
      '<strong>For you to decide:</strong> the upper-neck question\'s first item (inflammatory arthritis, Down syndrome or long-term steroids) counts on its own, as the current question reads. If it should only count with one of the symptoms, it becomes a "both together" line.',
    ],
  },
}
AREAS.shoulder = {
  out: 'shoulder-plain', title: 'Shoulder Questions', name: 'Shoulder',
  em: ['rf-cardiac1', 'srf-lung', 'srf-kehr', 'srf-ectopic', 'pc-stroke', 'rf-hotjoint', 'srf-rhabdo'],
  emAlone: [],
  docAlone: ['srf-pmr'],
  sample: () => tellThem(toggleTick([], 'rf-hotjoint', 'injection'), {}, 'shoulder'),
  own: [
    '<strong>Shared group, new question:</strong> on the shoulder the "injury, infection or circulation" emergency group holds the hot joint and the muscle breakdown questions, so it asks "Do you have any of these with the pain?" rather than the lower back\'s accident question.',
    '<strong>Stroke signs inside a group</strong> now sit in a box headed "Started in the last few hours:" (this also fixes the lower back, where the limit was lost inside the group).',
    '<strong>Signs that only count together</strong> stay on one line: shoulder-tip pain with a blow or feeling faint; sharp pain on breathing with breathlessness; a hot joint with a fever or a recent injection; a smoker with a lasting cough, blood, a drooping eyelid or a weak hand.',
    '<strong>The shoulder injury screen</strong> is unchanged in this step.',
  ],
}
const AREA = process.argv[2] || 'lowerback'
const A = AREAS[AREA]
if (!A) { console.error(`No review set up for "${AREA}" (${Object.keys(AREAS).join(', ')})`); process.exit(1) }

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
const ticksHtml = (id) => `${SUBHEAD[id] ? `<p class="muted">Sub-heading inside the group: <strong>${esc(SUBHEAD[id])}</strong></p>` : ''}<ul>${ticksFor(id, null, AREA).map((t) => `<li>${esc(t.text)}${t.combo ? ' <span class="muted">(both together)</span>' : ''}${t.sex ? ` <span class="muted">(${t.sex} only)</span>` : ''}</li>`).join('')}</ul>`
const groupCard = (key, area, gid, members, oldTitle) => {
  const oldLine = `${oldTitle}: ${members.map((m) => SHORT[m] || EM_SHORT[m]).filter(Boolean).join('; ')}`
  return `<section class="card" data-key="${esc(key)}" data-area="${area}">
  <h2>${esc(gateQ(gid, AREA))}</h2>
  <div class="cols"><div><h4>Before</h4><p class="old">${esc(oldLine)}</p></div>
  <div><h4>After: the group</h4><p><strong>${esc(gateQ(gid, AREA))}</strong></p><ul>${[...new Set(members.map((m) => shortFor(m, null, AREA)))].map((b) => `<li>${esc(b)}</li>`).join('')}</ul></div></div>
  <h4>After: inside the group, one sign per tick</h4>
  ${members.map((m) => `<p class="q"><code>${esc(m)}</code> ${tierTag(m)}<br><span class="old">Before: ${esc(OLD[m] ? OLD[m].text : '')}</span></p>${ticksHtml(m)}`).join('')}
  ${decide(key)}</section>`
}
const aloneCard = (key, area, id) => `<section class="card" data-key="${esc(key)}" data-area="${area}">
  <h2>${esc(PLAIN_Q[id] || TICKS[id][0].text)}</h2><p class="q"><code>${esc(id)}</code> ${tierTag(id)} <span class="muted">shown on its own (no other question of its group on the page)</span></p>
  <div class="cols"><div><h4>Before</h4><p class="old">${esc(OLD[id] ? OLD[id].text : '')}</p></div><div><h4>After</h4>${ticksHtml(id)}</div></div>
  ${decide(key)}</section>`

const em = EM_GROUPS.map((g) => ({ g, m: g.members.filter((id) => A.em.includes(id)) })).filter((x) => x.m.length >= 2)
const doc = GATES[AREA].map((g) => ({ g, m: g.members.filter((id) => TICKS[id]) }))
const OLD_TITLES = Object.fromEntries([...EM_GROUPS, ...GATES[AREA]].map((g) => [g.id, g.title]))

const other = `<section class="card" data-key="other" data-area="other">
  <h2>Other changes on the ${esc(A.name.toLowerCase())}</h2>
  <ul>
    ${A.own.map((x) => `<li>${x}</li>`).join('\n    ')}
    <li><strong>When did this start?</strong> After a nerve or spinal cord sign: Today / In the last few days / Weeks ago, or longer. It goes into the "Tell them" line; it does not change the route.</li>
    <li><strong>Tell them</strong> (below the action, on the emergency and see-a-doctor screens), built from the ticks, e.g.: <em>“${esc(A.sample())}”</em></li>
    <li><strong>You told us / You selected</strong> list the ticked signs in plain words; your summary lists them after the question ("ticked: …").</li>
    ${(TICK_SKIP[AREA] || []).length ? `<li><strong>Left out here as a repeat:</strong> ${TICK_SKIP[AREA].map((x) => `<code>${esc(x)}</code>`).join(', ')}.</li>` : ''}
    <li><strong>The reason line</strong> on see-a-doctor results now reads "A doctor should check this to find the cause." (it used to say physio must wait, and named a fracture, infection or circulation problem for every sign).</li>
  </ul>
  ${decide('other')}</section>`

const page = (bare) => renderPage({
  bare,
  cards: [],
  title: A.title,
  heading: `${A.name}: the new question design`,
  lede: `Every safety question a ${A.name.toLowerCase()} drawing asks, before and after. Patients read short plain lines; the reasoning underneath is unchanged: each tick sets the same red flag, with the same tier, 911 route and booking rule. Signs that only count together stay on one line.`,
  extra: [
    { area: 'emergency', title: 'Emergency page', html: em.map(({ g, m }) => groupCard(`em:${g.id}`, 'emergency', g.id, m, OLD_TITLES[g.id])).join('') + A.emAlone.map((id) => aloneCard(`em:${id}`, 'emergency', id)).join('') },
    { area: 'doctor', title: 'Doctor page', html: doc.map(({ g, m }) => groupCard(`doc:${g.id}`, 'doctor', g.id, m, OLD_TITLES[g.id])).join('') +
      A.docAlone.filter((id) => !doc.some(({ m }) => m.includes(id))).map((id) => aloneCard(`doc:${id}`, 'doctor', id)).join('') },
    { area: 'other', title: 'Other changes', html: other },
  ],
  storageKey: `${A.out}-v1`,
})
const style = (s) => s.replace('</style>', `  .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; } .cols > div { min-width: 0; }
  .old { color: var(--muted); font-size: 14px; } .q { margin: 12px 0 2px; } .muted { color: var(--muted); font-size: 13px; }
  .card ul { margin: 4px 0 8px; padding-left: 20px; }
</style>`)

fs.mkdirSync('review', { recursive: true })
fs.writeFileSync(`review/${A.out}.html`, style(page(false)))
// The same page without its own html/head tags, for a phone link.
fs.writeFileSync(`review/${A.out}-link.html`, style(page(true)))
console.log(`review/${A.out}.html: ${em.length + A.emAlone.length} emergency cards, ${doc.length} doctor groups + ${A.docAlone.length} on their own`)
