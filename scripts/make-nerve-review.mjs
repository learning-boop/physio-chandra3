/* The neurodynamics review page (6 Oct 2026): everything built from Chandra's
   neurodynamics books that needs his sign-off, on one page - the new
   questions and answers as the patient sees them, the changes to files he
   had already signed, the accuracy-check floor, the clinician-summary plan,
   and the eight new condition cards.
   Run: npm run review:nerves   →   review/nerve-review.html   (no server)

   Same page and decisions as review/signoff.html (scripts/make-signoff.mjs):
   choices stay in the browser, "Copy my decisions" gives a text for Claude. */
import fs from 'node:fs'
import { REGIONS, SPECIAL_CARDS } from '../src/data/symptomGuide.js'
import { buildClinicianSummary } from '../src/data/clinicianSummary.js'
import { detectReferral } from '../src/data/referral.js'
import { signoffCards, renderPage } from './make-signoff.mjs'

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const plain = (s) => String(s ?? '').replace(/<[^>]+>/g, '')

const NEW_CONDITIONS = ['lowback/neural', 'lowback/upperroot', 'foot/baxter', 'foot/deepfibular', 'foot/sural', 'hip/obturator', 'upperback/notalgia', 'shoulder/suprascapular']
const AREA_NAME = { lowback: 'Lower back', neck: 'Neck', shoulder: 'Shoulder', foot: 'Foot', ankle: 'Ankle', hip: 'Hip', thigh: 'Thigh', upperback: 'Mid back' }

const decide = (key) => `<div class="decide">
    <label><input type="radio" name="d_${esc(key)}" value="sign"> <span class="approve">Approve as built</span></label>
    <label><input type="radio" name="d_${esc(key)}" value="change"> Needs changes (say what below)</label>
    <textarea placeholder="Changes or notes"></textarea>
  </div>`

/* One question as the patient sees it, read from the live site data, with
   each answer's weights and any card it shows. `only` limits the answers to
   the new ones when the question itself is not new. */
function questionCard({ region, id, when, why, only = null, isNew = true }) {
  const q = REGIONS[region].questions.find((x) => x.id === id)
  const key = `question:${region}/${id}${only ? ':' + only.join('+') : ''}`
  const opts = q.options.filter((o) => !only || only.includes(o.id))
  const rows = opts.map((o) => {
    const w = Object.entries(o.weights || {}).map(([c, v]) => `<span class="${v < 0 ? 'neg' : 'pos'}">${esc(c)} ${v > 0 ? '+' : ''}${v}</span>`).join(' ')
    const card = o.special && SPECIAL_CARDS[o.special]
    return `<tr><td>${esc(o.label)}${card ? `<div class="cardnote"><strong>Shows the card “${esc(plain(card.title))}”:</strong> ${esc(plain(card.body))}</div>` : ''}</td><td class="w">${w || '<span class="muted">no score</span>'}</td></tr>`
  }).join('')
  return `<section class="card" data-key="${esc(key)}" data-area="questions">
  <header><div><h2>${esc(AREA_NAME[region] || region)} · ${esc(id)}${isNew ? '' : ' (new answers in an existing question)'}</h2>
    <p class="clin">“${esc(q.text)}”${q.multi && !/tick all/i.test(q.text) ? ' Tick all that apply.' : ''}</p></div></header>
  <div class="why"><strong>When it is asked</strong><ul><li>${esc(when)}</li></ul>${why ? `<strong>Why</strong><ul><li>${esc(why)}</li></ul>` : ''}</div>
  <table class="opts"><tr><th>${only ? 'New answer' : 'Answer'}</th><th>Points to</th></tr>${rows}</table>
  ${decide(key)}
</section>`
}

function noteCard({ key, area, title, meta, body, items = [] }) {
  return `<section class="card" data-key="${esc(key)}" data-area="${area}">
  <header><div><h2>${esc(title)}</h2>${meta ? `<p class="meta">${meta}</p>` : ''}</div></header>
  <div class="patient"><p>${body}</p>${items.length ? `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>` : ''}</div>
  ${decide(key)}
</section>`
}

const questions = [
  questionCard({ region: 'lowback', id: 'L12', when: 'Pain goes down the thigh or below the knee. Below the knee it comes straight after L3 (pins and needles, cough), which now also comes early.', why: 'The leg counterpart of the arm\'s N14: is the nerve sensitive to stretch (line, slump positions, the head-forward and toes-up checks), is the interface closing on it (arching sends it down the leg), and is it conducting poorly (numbness or weakness that stays).' }),
  questionCard({ region: 'lowback', id: 'L13', when: 'Pain at the front of the thigh or groin (L1). Before this, that answer pointed at nothing.', why: 'Upper lumbar nerve roots and the femoral nerve (Butler: prone knee bend, slump knee bend), with the hip and outer-thigh nerve as look-alikes.' }),
  questionCard({ region: 'neck', id: 'N15', when: 'Straight after N14, only when N14 shows a stretch-sensitive picture, and never with numbness that stays (N14), weakness (N2) or cord signs (N9). An optional extra screen outside the five scored questions.', why: 'Butler\'s active quick tests: which nerve reacts. A positive test is not scored, to keep the signed neural document\'s ceiling of 12; "none brought them on" counts -2.' }),
  questionCard({ region: 'shoulder', id: 'S9', when: '"Back of the shoulder" (S1, also answered by a mark on the back of the shoulder) or weakness turning the arm out (S6).', why: 'The suprascapular nerve. Weight on S1 or S6 made those always-asked questions crowd out the upper arm\'s and the neck\'s own, so the nerve answers sit in this follow-up.' }),
  questionCard({ region: 'foot', id: 'B2', only: ['heelday'], isNew: false, when: 'Pain under the heel (B1), as before.', why: 'Baxter\'s nerve: heel pain that builds through the day separates it from plantar fasciitis\'s first-step pain.' }),
  questionCard({ region: 'foot', id: 'B5', only: ['laces'], isNew: false, when: 'Always, as before.', why: 'The deep fibular nerve under tight laces or boots.' }),
  questionCard({ region: 'foot', id: 'B6', only: ['top', 'web', 'outeredge'], isNew: false, when: 'Now also opens for pain on the top of the foot, the outer edge or the toes (B1), so a foot-only drawing reaches it.', why: 'Deep fibular (first web space) and sural (outer edge) nerves. "Top of the foot" scored nothing before.' }),
  questionCard({ region: 'ankle', id: 'A7', only: ['web', 'outeredge'], isNew: false, when: 'Now also opens for pain at the front of the ankle or behind the outer ankle bone (A1).', why: 'A card pointing to the Foot guide, not a score: scored ankle twins made this question crowd out the ankle\'s own (12 two-area cases failed).' }),
  questionCard({ region: 'hip', id: 'G6', only: ['innerthigh'], isNew: false, when: 'Now also opens for inner thigh pain (G1).', why: 'The obturator nerve (Butler\'s obturator test).' }),
  questionCard({ region: 'thigh', id: 'R5', only: ['innerthigh'], isNew: false, when: 'Now also opens for inner thigh pain (R1).', why: 'A card pointing to the Hip guide, for the same reason as the ankle.' }),
  questionCard({ region: 'upperback', id: 'T4', only: ['itch'], isNew: false, when: 'Now also opens for pain beside the spine (T1).', why: 'Notalgia paraesthetica (Butler: tender spots where the skin nerves leave the muscle).' }),
].join('')

const signedFiles = [
  noteCard({ key: 'signed:lowback-stenosis', area: 'signed', title: 'Spinal stenosis: +1 for "arching sends it further down the leg"', meta: '<code>lowback-stenosis.md</code> · signed 6 Oct 2026', body: 'Extension closes the canal and foramen (Shacklock\'s reduced closing dysfunction). One new pointer on the new L12 answer; nothing else changed.' }),
  noteCard({ key: 'signed:neck-neural', area: 'signed', title: 'Sensitive nerve in the arm: -2 when no self-test brings it on', meta: '<code>neck-neural.md</code> · signed 28 Sep 2026', body: 'The N15 answer "I tried them and none brought on my usual symptoms" counts -2. Positive self-tests are not scored, so the document\'s ceiling of 12 and its "possible" line at 5 are unchanged. Test patient S4: the 5-point picture with a negative self-test is no longer shown.' }),
  noteCard({ key: 'signed:lowback-radicular', area: 'signed', title: 'Nerve-related leg pain: a note only, no score change', meta: '<code>lowback-radicular.md</code> · signed 6 Oct 2026', body: 'The head-forward and arching answers were tried as +1 each and removed: they raised the ceiling and put textbook sciatica (test patient 9) below disc pain. They are read in the clinician summary instead. Only a comment was added.' }),
  noteCard({ key: 'signed:carpal-tunnel', area: 'signed', title: 'Carpal tunnel (wrist and hand cards): evidence note only', meta: '<code>wrist-median.md</code>, <code>hand-median.md</code> · clinic notes', body: 'Basson 2017 added beside the existing "nerve mobilisation conflicting (D)": no benefit for carpal tunnel, unlike nerve-related neck-arm and low back pain. No patient text or score changed.' }),
].join('')

// The clinician-summary plan, shown on a sample patient.
const legRef = detectReferral([['lowerback', 'hipR', 'kneeR', 'ankleR']])
const sample = buildClinicianSummary({ zones: [{ id: 'lowerback', type: 'lowerback', label: 'Lower Back' }, { id: 'kneeR', type: 'knee', label: 'Right Knee' }], referral: legRef, keys: ['lowback'],
  answers: { L1: ['belowknee'], L3: ['pins'], L12: ['line', 'stretch', 'neckdown', 'closing'], sinSettle: 'hours' }, behaviour: { irritability: 'moderate', evidence: [] } })
const planLines = sample.split('\n').filter((l, i, all) => /Neurodynamic plan/.test(l) || (i > 0 && all.slice(0, i).some((x) => /Neurodynamic plan/.test(x)) && /^\s{6}·/.test(l) && !all.slice(all.findIndex((x) => /Neurodynamic plan/.test(x)) + 1, i).some((x) => !/^\s{6}·/.test(x))))
const checks = [
  noteCard({ key: 'summary:neurodynamic-plan', area: 'checks', title: 'Clinician summary: the neurodynamic plan', meta: '<code>src/data/neurodynamics.js</code>', body: 'Each summary with a nerve picture now suggests Shacklock\'s exam level (0 contraindicated, 1 limited, 2 standard) and reads the mechanism (closing, tension, conduction, the self-tests). Sample - leg pain with pins and needles, a line, stretch positions, head forward worse, arching sends it down, moderately irritable:', items: planLines.map((l) => `<code>${esc(l.trim())}</code>`) }),
  noteCard({ key: 'rail:also-consider', area: 'checks', title: '"Also worth considering" floor: 60% → 58%', meta: '<code>scripts/check-accuracy.mjs</code>, section 5', body: 'The line that brings back a condition when two telltale answers are missed. The nine new misses all drop both the location answer that opens a nerve condition\'s follow-up and its key nerve answer, so nothing should bring them back. The conditions that existed before are brought back exactly as before (92 of 150 at the last commit; now 97 of 164 = 59%).' }),
  noteCard({ key: 'check:shoulder-mark', area: 'checks', title: 'A mark on the back of the shoulder answers "Back of the shoulder"', meta: '<code>src/data/drawnLocation.js</code>', body: 'The cut-off (lx below -0.035) is an estimate, not measured on the 3D model like the limb rows. Worth trying on the body map.' }),
].join('')

const cards = signoffCards(NEW_CONDITIONS)
const page = (bare) => renderPage({
  cards,
  title: 'Neurodynamics Review',
  heading: `Neurodynamics review: ${cards.length} conditions, ${questions.split('class="card"').length - 1} questions, and the changes around them`,
  lede: `Everything built on ${new Date().toISOString().slice(0, 10)} from your neurodynamics books (Shacklock NDS lower-quarter manual, Butler NOI workbook, Wood &amp; Grahovec) that needs your sign-off, read from the live site data. Questions first, as the patient sees them, with what each answer points to; then the changes to files you had already signed; then the checks; then the eight new condition cards. Mark each "Approve" or "Needs changes" with a note. Choices stay in this browser; press "Copy my decisions" and paste them to Claude.`,
  extra: [
    { area: 'questions', title: 'Questions and answers', html: questions },
    { area: 'signed', title: 'Changes to signed files', html: signedFiles },
    { area: 'checks', title: 'Checks and the summary', html: checks },
  ],
  storageKey: 'nerve-review-v1',
  bare,
})
  // Styles for the question tables (the sign-off page has none).
  .replace('</style>', `  table.opts th { text-align: left; font-size: 13px; color: var(--muted); border-bottom: 1px solid var(--line); padding: 4px; }
  table.opts td.w { text-align: right; width: 34%; font-size: 13px; } table.opts .pos { color: var(--ok); font-weight: 600; } table.opts .neg { color: var(--todo); font-weight: 600; }
  .cardnote { margin-top: 6px; font-size: 13px; color: var(--muted); background: var(--soft); padding: 6px 8px; border-radius: 6px; } .muted { color: var(--muted); }
</style>`)

fs.mkdirSync('review', { recursive: true })
fs.writeFileSync('review/nerve-review.html', page(false))
// The same page without its own html/head/body tags, for publishing as a
// claude.ai artifact link that opens on a phone.
fs.writeFileSync('review/nerve-review-link.html', page(true))
console.log(`review/nerve-review.html (+ nerve-review-link.html for the phone link): ${cards.length} condition cards + question, signed-file and check cards`)
