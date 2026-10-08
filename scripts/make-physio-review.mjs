/* The "physio while waiting" review page (8 Oct 2026): every see-a-doctor
   flag on the site, sorted by what physio can do while the patient waits
   for the doctor (../src/data/physioPlan.js), plus the patient wording.
   Run: npm run review:physio   →   review/physio-wait.html   (no server)
                                    review/physio-wait-link.html (phone link)

   The flags are read from the site source (every object with a doctor tier),
   with the rules the screen adds at run time: the young bone-tumour
   questions and the both-feet nerve questions become "no booking". */
import fs from 'node:fs'
import { renderPage } from './make-signoff.mjs'
import { physioPlan, OVERRIDES, PLAN_LABEL, PLAN_TEXT } from '../src/data/physioPlan.js'
import { TUMOUR_IDS } from '../src/data/boneTumour.js'

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const files = ['src/components/PainAssessment.jsx',
  ...fs.readdirSync('src/data').filter((f) => f.endsWith('.js')).map((f) => 'src/data/' + f)]
const flags = new Map()
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8')
  const starts = [...src.matchAll(/\bid: ?(['"])([a-z0-9-]+)\1/g)]
  starts.forEach((m, i) => {
    const chunk = src.slice(m.index, starts[i + 1] ? starts[i + 1].index : m.index + 1500)
    if (!/\btier: ?['"]urgent['"]/.test(chunk)) return
    const id = m[2]
    const text = (chunk.match(/\btext: ?(['"])((?:\\.|(?!\1).)*)\1/) || [])[2] || ''
    const flag = { id, text: text.replace(/\\'/g, "'"), file: f,
      sameDay: /\bsameDay: ?true/.test(chunk), noBooking: /\bnoBooking: ?true/.test(chunk), group: (chunk.match(/\bgroup: ?['"]([a-z]+)/) || [])[1] }
    // Run-time rules in the screen (PainAssessment.jsx, `nerve`).
    if (TUMOUR_IDS.includes(id)) Object.assign(flag, { noBooking: true, sameDay: true })
    if (id === 'pc-polyneuropathy' || flag.group === 'neuropathy') flag.noBooking = true
    if (!flags.has(id)) flags.set(id, flag)
  })
}
const all = [...flags.values()].map((f) => ({ ...f, plan: physioPlan(f) }))

const why = (f) => OVERRIDES[f.id] ? 'clinical override'
  : /-(dvt|clot)$/.test(f.id) ? 'possible clot'
  : /-infection$/.test(f.id) && !f.noBooking && !f.sameDay ? 'possible infection'
  : f.noBooking ? 'no-booking flag' : f.sameDay ? 'same-day flag' : 'default'
const table = (rows) => `<table class="opts"><tr><th>Question</th><th>Why this option</th></tr>${rows.map((f) =>
  `<tr><td><code>${esc(f.id)}</code>${f.sameDay ? ' <span class="tag">today</span>' : ''}<br><span class="muted">${esc(f.text)}</span></td><td class="w">${esc(why(f))}</td></tr>`).join('')}</table>`
const decide = (key) => `<div class="decide">
    <label><input type="radio" name="d_${esc(key)}" value="sign"> <span class="approve">Approve as built</span></label>
    <label><input type="radio" name="d_${esc(key)}" value="change"> Needs changes (say what below)</label>
    <textarea placeholder="Changes or notes, e.g. move a question to another option"></textarea>
  </div>`
const card = (key, area, title, intro, rows) => `<section class="card" data-key="${esc(key)}" data-area="${area}">
  <h2>${esc(title)}</h2><p class="meta">${intro}</p>${rows ? table(rows) : ''}${decide(key)}</section>`

const changed = all.filter((f) => ['clinical override', 'possible clot', 'possible infection'].includes(why(f)))
const wording = `<section class="card" data-key="wording" data-area="wording">
  <h2>What the patient reads</h2><p class="meta">Shown on the see-a-doctor screen, at the top of the results, next to "Book an assessment", and in the patient's PDF. The strictest option among the ticked questions is used. The clinician summary lists each question's option.</p>
  ${['alongside', 'clearFirst', 'doctorFirst'].map((p) => `<h4>${esc(PLAN_LABEL[p])}</h4><p>${esc(PLAN_TEXT[p])}</p>`).join('')}
  ${decide('wording')}</section>`

const by = (p) => all.filter((f) => f.plan === p)
const page = (bare) => renderPage({
  bare,
  cards: [],
  title: 'Physio While Waiting',
  heading: 'Physio while waiting for the doctor',
  lede: `Every see-a-doctor question on the site (${all.length}), sorted by what physio can do while the patient waits. Changed from before: ${changed.length} questions (the clot questions now hold booking until a doctor has seen them; "fever, weight loss, a lump or cancer history" and the possible infection questions now let the patient book, with treatment after the doctor's check).`,
  extra: [
    { area: 'wording', title: 'Patient wording', html: wording },
    { area: 'changed', title: 'What changed', html: card('changed', 'changed', 'Questions whose option changed', 'Your recommended calls from 8 Oct 2026.', changed) },
    { area: 'doctorFirst', title: `Doctor first (${by('doctorFirst').length})`, html: card('doctorFirst', 'doctorFirst', PLAN_LABEL.doctorFirst, 'No booking offered until a doctor has seen them.', by('doctorFirst')) },
    { area: 'clearFirst', title: `Book, treat after check (${by('clearFirst').length})`, html: card('clearFirst', 'clearFirst', PLAN_LABEL.clearFirst, 'Booking offered; Chandra assesses, and treatment starts once a doctor has checked this.', by('clearFirst')) },
    { area: 'alongside', title: `Physio while waiting (${by('alongside').length})`, html: card('alongside', 'alongside', PLAN_LABEL.alongside, 'Booking offered; physio can start while they wait for the doctor.', by('alongside')) },
  ],
  storageKey: 'physio-wait-v1',
})
const style = (s) => s.replace('</style>', `  table.opts { width: 100%; border-collapse: collapse; margin-top: 10px; } table.opts th { text-align: left; font-size: 13px; color: var(--muted); border-bottom: 1px solid var(--line); padding: 4px; }
  table.opts td { border-bottom: 1px solid var(--line); padding: 6px 4px; vertical-align: top; font-size: 14px; } table.opts td.w { width: 30%; color: var(--muted); font-size: 13px; } .muted { color: var(--muted); }
</style>`)

fs.mkdirSync('review', { recursive: true })
fs.writeFileSync('review/physio-wait.html', style(page(false)))
// The same page without its own html/head tags, for a phone link.
fs.writeFileSync('review/physio-wait-link.html', style(page(true)))
console.log(`review/physio-wait.html: ${all.length} see-a-doctor questions · doctor first ${by('doctorFirst').length} · book, treat after check ${by('clearFirst').length} · alongside ${by('alongside').length} · changed ${changed.length}`)
