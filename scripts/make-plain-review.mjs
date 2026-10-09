/* Review pages for the plain question design (8 Oct 2026): every safety
   question a drawing asks, before (as on the other areas) and after (plain
   group question, short bullets, one sign per tick), for sign-off.
   The groups are built by the same code the site uses, for the drawing in
   the set-up below, with every question any age or birth sex can see.
   Run: npm run review:lowback    →  review/lowback-plain.html     (+ -link.html for the phone)
        npm run review:neck       →  review/neck-plain.html
        npm run review:shoulder   →  review/shoulder-plain.html
        npm run review:knee       →  review/knee-plain.html
        npm run review:hip        →  review/hip-plain.html
        npm run review:ankle      →  review/ankle-plain.html
        npm run review:foot       →  review/foot-plain.html
        npm run review:thigh      →  review/thigh-plain.html
        npm run review:lowback-hip → review/lowback-hip-plain.html */
import fs from 'node:fs'
import { renderPage } from './make-signoff.mjs'
import { regionRedFlags } from '../src/data/assessmentFlow.js'
import { flowZones } from '../src/data/referral.js'
import { patternChecks } from '../src/data/patternChecks.js'
import { bySeverity } from '../src/data/emergencyAdvice.js'
import { injuryScreenApplies } from '../src/data/injuryScreen.js'
import { gateUnsureFlags, gateRows, gateText, smartArea, smartAreas } from '../src/data/safetyGates.js'
import { plainAreas, coverOut, gateQ, PLAIN_Q, SUBHEAD, TICKS, ticksFor, COVERED, TICK_SKIP, WHEN_Q, shortFor, tellThem, toggleTick } from '../src/data/plainQuestions.js'

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const Z = (id, type, side = 'c') => ({ id, type, label: type, side })

/* Each drawing: what it is, and the changes that are its own. */
const AREAS = {
  lowerback: {
    out: 'lowback-plain', title: 'Lower Back Questions', name: 'Lower back', zones: [Z('lowerback', 'lowerback')],
    sample: () => tellThem(toggleTick(toggleTick([], 'rf-saddle', 'paper'), 'rf-bladder', 'start'), { [WHEN_Q.id]: 'today' }, 'lowerback'),
    own: [
      '<strong>Fixed:</strong> the cauda equina sex question (<code>rf-sexual</code>) was never asked on a lower back drawing; it shared a group label with the bladder question, so the duplicate filter dropped it. It is now asked.',
      '<strong>Fixed:</strong> a lower-back-only drawing also asks the mid-to-low back\'s questions (the area it implies), and the plain design was switched off by that second area. It now runs, and the two areas\' groups are merged as on the site.',
      '<strong>Physio while waiting:</strong> the possible infection questions (spine, joint) now let the patient book, with treatment after the doctor\'s check (was: physio alongside).',
    ],
  },
  neck: {
    out: 'neck-plain', title: 'Neck Questions', name: 'Neck', zones: [Z('neck', 'neck')],
    sample: () => tellThem(toggleTick([], 'nrf-myelo', 'walk'), { [WHEN_Q.id]: 'days' }, 'neck'),
    own: [
      '<strong>Sub-headings inside a group:</strong> the stroke signs sit in a box headed "Came on suddenly since this started:", so the time limit covers only them and not the fever or heart signs below.',
      '<strong>The general medical question</strong> (<code>sc-systemic</code>) keeps fever and past cancer on the neck; the lower back leaves them out only because its own infection and cancer questions ask them.',
      '<strong>The neck injury screen</strong> ("Have you injured your neck in the last 7 days…") is unchanged in this step.',
      '<strong>For you to decide:</strong> the upper-neck question\'s first item (inflammatory arthritis, Down syndrome or long-term steroids) counts on its own, as the current question reads. If it should only count with one of the symptoms, it becomes a "both together" line.',
    ],
  },
  shoulder: {
    out: 'shoulder-plain', title: 'Shoulder Questions', name: 'Shoulder', zones: [Z('shoulderR', 'shoulder', 'R')],
    sample: () => tellThem(toggleTick([], 'rf-hotjoint', 'injection'), {}, 'shoulder'),
    own: [
      '<strong>The injury, infection or muscle emergency group</strong> asks "Do you have any of these with the pain?" on every area, as it can hold a crash, a hot joint, a hip operation and dark pee together.',
      '<strong>Stroke signs inside a group</strong> sit in a box headed "Started in the last few hours:".',
      '<strong>Signs that only count together</strong> stay on one line: shoulder-tip pain with a blow or feeling faint; sharp pain on breathing with breathlessness; a hot joint with a fever or a recent injection; a smoker with a lasting cough, blood, a drooping eyelid or a weak hand.',
      '<strong>The shoulder injury screen</strong> is unchanged in this step.',
    ],
  },
  knee: {
    out: 'knee-plain', title: 'Knee Questions', name: 'Knee', zones: [Z('kneeR', 'knee', 'R')],
    sample: () => tellThem(toggleTick([], 'kf-dvt', 'calf'), {}, 'knee'),
    own: [
      '<strong>Compartment syndrome</strong> keeps its causes and time limit as a boxed heading ("In the last day or two, after a broken bone, a crush, an operation…"), and each tick needs both the climbing pain and a muscle sign, as the current question does.',
      '<strong>Past cancer</strong> is asked once, in the knee cancer question; the general medical question leaves it out on the knee.',
      '<strong>The two limping-child questions</strong> (about 9 to 17, and about 4 to 10) share one group bullet, so a child\'s group shows five bullets at most; inside, each keeps its own age and "no injury" line.',
      '<strong>For you to decide, septic knee:</strong> one line, a hot, red, swollen knee with a fever or feeling unwell, as the current question reads ("especially after an injection, surgery or a cut" was a risk note, not a sign on its own). The shoulder\'s hot-joint question does count a recent injection on its own; say if the knee should match.',
      '<strong>The knee injury screen</strong> is unchanged in this step.',
    ],
  },
  hip: {
    out: 'hip-plain', title: 'Hip Questions', name: 'Hip', zones: [Z('hipR', 'hip', 'R')],
    sample: () => tellThem(toggleTick([], 'hpf-dislocation', 'stand'), {}, 'hip'),
    own: [
      '<strong>After a hip operation:</strong> the dislocation signs sit under a boxed heading "After a hip replacement or a hip fracture operation:".',
      '<strong>Signs that only count together</strong> stay on one line, e.g. 65 or over or weak bones AND sudden hip pain with no fall; a runner AND a deep groin ache; steroids, heavy drinking, sickle cell, lupus, a transplant or an old hip injury AND a deep groin ache.',
      '<strong>The hip injury screen</strong> is unchanged in this step.',
    ],
  },
  ankle: {
    out: 'ankle-plain', title: 'Ankle Questions', name: 'Ankle', zones: [Z('ankleR', 'ankle', 'R')],
    sample: () => tellThem(toggleTick([], 'af-ischaemia', 'foot'), {}, 'ankle'),
    own: [
      '<strong>Compartment syndrome</strong> keeps its causes and time limit as a boxed heading, and each tick needs both the climbing pain and a muscle sign, as on the knee.',
      '<strong>Past cancer, a growing lump and night pain</strong> are asked once, in the ankle cancer question; the general medical question keeps only fever and weight loss here.',
      '<strong>A tight cast</strong> keeps the safety line "do not cut it off" in the tick itself.',
      '<strong>Signs that only count together</strong> stay on one line, e.g. heel or Achilles pain AND a stiff back, psoriasis, sore eyes, other swollen joints or a recent infection; diabetes AND a hot, swollen foot or a wound not healing; Achilles pain AND a recent ciprofloxacin-type antibiotic or steroids.',
      '<strong>The ankle injury screen</strong> is unchanged in this step.',
    ],
  },
  foot: {
    out: 'foot-plain', title: 'Foot Questions', name: 'Foot', zones: [Z('footR', 'foot', 'R')],
    sample: () => tellThem(toggleTick([], 'ft-diabeticinfection', 'wound'), {}, 'foot'),
    own: [
      '<strong>Emergency group:</strong> compartment syndrome (boxed causes and time limit), a foot suddenly cold, pale, blue or numb, or suddenly very painful at rest, a hot red area spreading fast, and an infected diabetic wound.',
      '<strong>The foot\'s lump question</strong> asks a growing lump, a new dark mark under a toenail and night pain; the general medical question keeps fever, weight loss and past cancer here.',
      '<strong>A tight cast</strong> keeps the safety line "do not cut it off" in the tick itself.',
      '<strong>Signs that only count together</strong> stay on one line, e.g. something through the shoe AND the foot now swollen, red or painful to walk on; diabetes AND a hot, swollen foot or a wound not healing; heel pain AND a stiff back, psoriasis, sore eyes or a recent infection.',
      '<strong>The foot injury screen</strong> is unchanged in this step.',
    ],
  },
  thigh: {
    out: 'thigh-plain', title: 'Thigh Questions', name: 'Thigh', zones: [Z('thighR', 'thigh', 'R')],
    sample: () => tellThem(toggleTick([], 'tgf-cellulitis', 'streak'), {}, 'thigh'),
    own: [
      '<strong>Compartment syndrome on the thigh</strong> keeps its own causes and time limit as a boxed heading ("In the last day or two, after a heavy knock, a crush…"), and its one tick needs both the climbing pain and a tense, hard, swollen thigh, as the current question does.',
      '<strong>Signs that only count together</strong> stay on one line, e.g. thigh or buttock cramps on walking AND smoking or diabetes; spreading redness, a red streak or a hot swollen area AND a fever; a runner AND a deep thigh ache.',
      '<strong>Past cancer</strong> is asked once, in the thigh cancer question; the general medical question leaves it out here.',
      '<strong>The thigh injury screen</strong> is unchanged in this step.',
    ],
  },
  'lowback-hip': {
    out: 'lowback-hip-plain', title: 'Back and Hip Questions', name: 'Lower back and hip', zones: [Z('lowerback', 'lowerback'), Z('hipR', 'hip', 'R')],
    sample: () => tellThem(toggleTick([], 'hpf-dislocation', 'stand'), {}, ['lowerback', 'hip']),
    own: [
      '<strong>Several areas:</strong> the plain design runs when every drawn area has plain questions; the groups of all the areas are merged by theme, as on the site. "Tell them" names both: "I have low back and hip pain, and …".',
      '<strong>A question asked twice shows once:</strong> the hip\'s aorta question (back, tummy or groin) stands in for the back\'s and the mid-to-low back\'s; the back\'s kidney question for the hip\'s; the hip\'s testicle question gives way to the mid-to-low back\'s identical one.',
      '<strong>Nothing lost:</strong> the hip\'s pelvic question is shown through the back\'s, with its extra sign (unusual vaginal discharge) as an added tick and in the group bullet.',
      '<strong>One bullet for the fragile-bone picture</strong> (the back\'s "sudden pain after a small strain" and the hip\'s "sudden pain with no fall"), so the merged bone group stays at six bullets at most for any age.',
      '<strong>Merged groups</strong> may show up to six bullets (one area: five), so every sign stays named.',
    ],
  },
}
const AREA = process.argv[2] || 'lowerback'
const A = AREAS[AREA]
if (!A) { console.error(`No review set up for "${AREA}" (${Object.keys(AREAS).join(', ')})`); process.exit(1) }

// The pages as the site builds them for this drawing (every age and sex).
const fz = flowZones(A.zones)
const areas = plainAreas(fz)
const reg = regionRedFlags(fz, A.zones)
const has = (g) => reg.some((f) => [].concat(f.group || []).includes(g))
const pattern = patternChecks(A.zones, {}, 12).filter((f) => !(f.id === 'pc-stroke' && has('stroke')))
const UNI = [{ id: 'sc-neuro', tier: 'urgent', text: 'New or worsening weakness, numbness, or loss of coordination in an arm or leg' },
  { id: 'sc-systemic', tier: 'urgent', text: 'Fever, chills, unexplained weight loss, a new or growing lump, pain at night that does not change with position, or a history of cancer with new or changing pain' },
  { id: 'sc-trauma', tier: 'urgent', text: 'A significant fall, accident, or injury, or any fall if you are 65 or older, or have osteoporosis or low bone density' }]
  .filter((u) => !(u.id === 'sc-trauma' && injuryScreenApplies(fz)) && !(u.id === 'sc-neuro' && (has('neuro') || reg.some((f) => f.id === 'nrf-myelo'))))
const all = [...reg, ...pattern, ...UNI]
const em = coverOut(bySeverity(all.filter((f) => f.tier === 'emergency')))
const doc = coverOut(bySeverity(all.filter((f) => f.tier !== 'emergency')))
const covered = [...em.covered, ...doc.covered]
const grp = smartArea(fz) || smartAreas(fz)
const rowsOf = (list, kind) => gateRows([...list, ...gateUnsureFlags(list, kind === 'emergency' ? null : grp, kind)])

const tierTag = (f) => f.tier === 'emergency' ? `<span class="tag">${f.call911 ? '911' : 'emergency'}</span>` : `<span class="muted">see a doctor${f.sameDay ? ' today' : ''}</span>`
const decide = (key) => `<div class="decide">
    <label><input type="radio" name="d_${esc(key)}" value="sign"> <span class="approve">Approve as built</span></label>
    <label><input type="radio" name="d_${esc(key)}" value="change"> Needs changes (say what below)</label>
    <textarea placeholder="Changes or notes"></textarea>
  </div>`
const who = (f) => [f.ages ? `ages ${[].concat(f.ages).join(', ')}` : '', f.sex ? `${f.sex} only` : ''].filter(Boolean).join('; ')
const ticksHtml = (id) => `${SUBHEAD[id] ? `<p class="muted">Sub-heading inside the group: <strong>${esc(SUBHEAD[id])}</strong></p>` : ''}<ul>${ticksFor(id, null, areas, covered).map((t) => `<li>${esc(t.text)}${t.combo ? ' <span class="muted">(both together)</span>' : ''}${t.sex ? ` <span class="muted">(${t.sex} only)</span>` : ''}</li>`).join('')}</ul>`
const qHtml = (f) => `<p class="q"><code>${esc(f.id)}</code> ${tierTag(f)}${who(f) ? ` <span class="muted">(${esc(who(f))})</span>` : ''}<br><span class="old">Before: ${esc(f.text || '')}</span></p>${ticksHtml(f.id)}`
const groupCard = (key, area, r) => `<section class="card" data-key="${esc(key)}" data-area="${area}">
  <h2>${esc(gateQ(r.gate.id, areas))}</h2>
  <div class="cols"><div><h4>Before</h4><p class="old">${esc(gateText(r.gate, r.members))}</p></div>
  <div><h4>After: the group</h4><p><strong>${esc(gateQ(r.gate.id, areas))}</strong></p><ul>${[...new Set(r.members.map((m) => shortFor(m.id, null, areas, covered)))].map((b) => `<li>${esc(b)}</li>`).join('')}</ul></div></div>
  <h4>After: inside the group, one sign per tick</h4>
  ${r.members.map(qHtml).join('')}
  ${decide(key)}</section>`
const aloneCard = (key, area, f) => `<section class="card" data-key="${esc(key)}" data-area="${area}">
  <h2>${esc(PLAIN_Q[f.id] || (TICKS[f.id] ? TICKS[f.id][0].text : f.text))}</h2><p class="muted">Shown on its own (no other question of its group on the page).</p>
  ${qHtml(f)}
  ${decide(key)}</section>`
const cardsOf = (list, kind) => rowsOf(list, kind).map((r) => (r.gate ? groupCard(`${kind}:${r.gate.id}`, kind, r) : aloneCard(`${kind}:${r.flag.id}`, kind, r.flag))).join('')

const skips = [].concat(areas || []).flatMap((a) => TICK_SKIP[a] || [])
const other = `<section class="card" data-key="other" data-area="other">
  <h2>Other changes: ${esc(A.name.toLowerCase())}</h2>
  <ul>
    ${A.own.map((x) => `<li>${x}</li>`).join('\n    ')}
    ${covered.length ? `<li><strong>Left out here as a repeat:</strong> ${covered.map((c) => `<code>${esc(c)}</code> (shown through ${[].concat(COVERED[c].by).map((b) => `<code>${esc(b)}</code>`).join(' or ')})`).join(', ')}.</li>` : ''}
    ${skips.length ? `<li><strong>Ticks left out as a repeat:</strong> ${skips.map((x) => `<code>${esc(x)}</code>`).join(', ')}.</li>` : ''}
    <li><strong>When did this start?</strong> After a nerve or spinal cord sign: Today / In the last few days / Weeks ago, or longer. It goes into the "Tell them" line; it does not change the route.</li>
    <li><strong>Tell them</strong> (below the action, on the emergency and see-a-doctor screens), built from the ticks, e.g.: <em>“${esc(A.sample())}”</em></li>
    <li><strong>You told us / You selected</strong> list the ticked signs in plain words; your summary lists them after the question ("ticked: …").</li>
    <li><strong>The reason line</strong> on see-a-doctor results reads "A doctor should check this to find the cause."</li>
  </ul>
  ${decide('other')}</section>`

const page = (bare) => renderPage({
  bare,
  cards: [],
  title: A.title,
  heading: `${A.name}: the new question design`,
  lede: `Every safety question a ${A.name.toLowerCase()} drawing asks (any age or sex), before and after, grouped as on the site. Patients read short plain lines; the reasoning underneath is unchanged: each tick sets the same red flag, with the same tier, 911 route and booking rule. Signs that only count together stay on one line.`,
  extra: [
    { area: 'emergency', title: 'Emergency page', html: cardsOf(em.kept, 'emergency') },
    { area: 'doctor', title: 'Doctor page', html: cardsOf(doc.kept, 'doctor') },
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
console.log(`review/${A.out}.html: emergency ${rowsOf(em.kept, 'emergency').length} rows, doctor ${rowsOf(doc.kept, 'doctor').length} rows${covered.length ? `, ${covered.length} shown through another` : ''}`)
