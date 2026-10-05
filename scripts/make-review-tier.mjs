/* Review pages for the condition texts drafted by Claude (Chandra, 4 Oct 2026).
   Tier 1: the 14 that sit next to a condition needing a doctor (read first).
   Tier 2: the 24 common problems most patients will see.
   Tier 3: the 14 less common ones, mostly nerve entrapments.
   Run: node scripts/make-review-tier.mjs 1   →   review/tier1.html
        node scripts/make-review-tier.mjs 2   →   review/tier2.html
        node scripts/make-review-tier.mjs 3   →   review/tier3.html
   Area pages for the older texts (moved from the site or taken from a
   guideline), not yet signed:
        node scripts/make-review-tier.mjs lowback   →   review/lowback.html

   Built from the condition files (what Chandra edits) and the live site data
   (the area's safety questions), so it always shows what is built. Opens in
   a browser with no server. Ticks and notes are kept in that browser only;
   "Copy my notes" gives a text to paste back for the edits and sign-off. */
import fs from 'node:fs'
import { REGIONS } from '../src/data/symptomGuide.js'

const TIER = String(process.argv[2] || '1')
const OUT = /^\d+$/.test(TIER) ? `review/tier${TIER}.html` : `review/${TIER}.html`
const TIER1 = [
  ['upperback-costochondritis', 'Chest pain: must not reassure away a heart problem.',
    'Does chest pain with breathlessness, sweating, or pain into the arm or jaw go to 911 first? Is "sore when pressed" never used to rule out the heart?'],
  ['upperback-nerveroot', 'Chest pain, and a shingles look-alike.',
    'Does a band of pain with a rash point to the doctor (shingles)? Does chest pain stay with the heart questions rather than being explained away?'],
  ['knee-baker', 'A burst cyst looks like a calf clot.',
    'Is "a swollen, warm or tender calf: see a doctor the same day" clear and early enough?'],
  ['leg-cecs', 'Look-alike of acute compartment syndrome, an emergency.',
    'Is it clear that pain which keeps rising after exercise stops, or after an injury or tight cast, is an emergency, not this condition?'],
  ['forearm-armpump', 'The same compartment look-alike, in the forearm.',
    'Same as the shin: is the emergency version (pain still climbing after stopping, after an injury or cast) clearly separated?'],
  ['elbow-biceps', 'A distal biceps rupture needs surgery within weeks.',
    'Does a pop with bruising or a changed bicep shape go to a doctor within days?'],
  ['ankle-highankle', 'Fracture and instability look-alike, often missed.',
    'Does it say when an X-ray is needed (cannot take weight, bone tenderness), and set a realistic, longer recovery?'],
  ['ankle-osteochondral', 'Needs imaging if a sprain is not settling.',
    'Does a deep ache, catching or swelling still there about 6 weeks after a sprain lead to imaging?'],
  ['ctj-tos', 'Circulation and nerve look-alikes.',
    'Do an arm that swells or turns blue, a cold pale hand, or thinning hand muscles go to a doctor (the same day for colour changes)?'],
  ['sij-pgp', 'Live now for pregnant visitors.',
    'Does the wording avoid "loose", "unstable" or "out of place"? Are pregnancy warning signs left to the pregnancy questions?'],
  ['foot-severs', 'Children; tumour and infection look-alikes.',
    'Is the age range right? Do night pain, swelling, a fever, or pain in one heel that keeps building go to a doctor?'],
  ['coccyx-trauma', 'A fracture look-alike.',
    'Does it say when an X-ray is worth it? Do bladder or bowel changes, or numbness in the saddle area, go to emergency?'],
  ['hip-inguinal', 'Hernia look-alike.',
    'Does a groin lump that appears on coughing go to a doctor, and a painful lump that will not go back in to emergency?'],
  ['tlj-slippingrib', 'Organ-pain look-alike (kidney, gallbladder).',
    'Do pain with a fever, urine symptoms, or pain after fatty meals point to a doctor rather than this condition?'],
]

const TIER2 = [
  ['head-tth', 'The commonest headache; the card says it is not dangerous.',
    'Is there a line for a sudden, severe headache, or one with a fever, stiff neck, weakness, confusion or change in vision (911 or emergency department)? Is "not dangerous" safe as worded?'],
  ['jaw-myalgia', 'Common; the jaw-and-temple artery problem in over-50s looks similar.',
    'Is there a line for over 50 with jaw ache on chewing, a tender temple or a change in vision (doctor the same day)?'],
  ['arm-strain', 'Common after the gym; a biceps tear looks similar.',
    '"A pop and the muscle looks a different shape" goes to the physiotherapist: should it be a doctor within a few days?'],
  ['thigh-doms', 'Very common after exercise; muscle breakdown looks similar.',
    'Is there a line for dark, cola-coloured urine or severe weakness after exercise (emergency department)?'],
  ['thigh-contusion', 'Common in contact sport; a thigh compartment syndrome is a rare emergency.',
    'Is there a line for pain and tense swelling that keep building after the knock (emergency department)?'],
  ['leg-calfstrain', 'Common; a clot and an Achilles rupture look similar.',
    'The clot line is there. Is there a line for a snap at the back of the heel, or not being able to go up on tiptoe (doctor the same day)?'],
  ['hand-trigger', 'Common; a tendon-sheath infection is a hand emergency.',
    'Is there a line for a red, swollen finger that hurts to straighten, especially after a cut (doctor the same day)?'],
  ['ctj-rib', 'Common; the pain can wrap to the front of the chest.',
    'Should there be a line for chest pain with breathlessness, sweating or arm or jaw pain (911)?'],
  ['upperback-rib', 'Common after a twist or cough.',
    'Is a crack worth mentioning after a fall or a hard cough with low bone density? Is breathlessness covered?'],
  ['tlj-stiffness', 'Common; kidney pain sits in the same place.',
    'Should there be a line for pain with a fever, burning or blood when you pass urine (doctor first)?'],
  ['foot-metatarsalgia', 'Common, especially with footwear.',
    'Is a stress fracture (pain on one bone, worse with every step) or, with diabetes, a hot red forefoot pointed to a doctor?'],
  ['foot-bunion', 'Very common.',
    'Is the wording right about what footwear and exercises can and cannot change? Is a suddenly hot, red big toe (gout) told apart?'],
  ['ankle-insertional', 'Common in runners and in middle age.',
    'Is Achilles pain after a quinolone antibiotic or steroids pointed to a doctor? Is a sudden snap covered?'],
  ['ankle-anteriorimp', 'Common after old sprains and in sport.', 'Is the description and advice right?'],
  ['thigh-quadstrain', 'Common in kicking and sprinting sport.', 'Is the description, recovery and return-to-sport advice right?'],
  ['thigh-adductor', 'Common in kicking and side-stepping sport.', 'Is groin pain that moves up (hip, hernia, pubic bone) handled well?'],
  ['hip-iliopsoas', 'Common in running and kicking sport.', 'Is the painful snapping line right? Anything for a fever with groin pain?'],
  ['hip-pubic', 'Common in sport and in pregnancy.', 'Is the pregnancy wording consistent with the pregnancy pages (no "unstable" or "loose")?'],
  ['hip-meralgia', 'Common with tight clothing, pregnancy and weight change.', 'The "spreading or weak: points to the back" line: is it right and clear?'],
  ['knee-prepatellar', 'Common in people who kneel for work.', 'The infection line is there (hot, red or unwell: doctor the same day). Is it right?'],
  ['jaw-clicking', 'Very common, usually painless.', 'Is the description and reassurance right?'],
  ['jaw-closedlock', 'Less common but time-sensitive.', 'Is "book soon: early guided movement" the right advice and urgency?'],
  ['forearm-overuse', 'Common with work and gym load.', 'Is "tingling or weakness in the hand" pointed to the right place?'],
  ['elbow-posterior', 'Common with leaning and knocks.', 'The infection line is in the description: should it also be a "see a doctor the same day" line?'],
]
const TIER3 = [
  ['elbow-radialtunnel', 'A nerve entrapment that is easy to mistake for tennis elbow.',
    '"Weakness lifting the fingers or the wrist" goes to the physiotherapist: should increasing finger or wrist drop go to a doctor (nerve tests)?'],
  ['elbow-ucl', 'Throwing athletes; a full ligament tear may need a surgeon.',
    'The description says a pop "needs to be checked promptly", but the line sends a pop or an unstable elbow to the physiotherapist. Should it be a doctor?'],
  ['forearm-pronator', 'A median nerve entrapment, often confused with carpal tunnel.',
    '"Pinch or grip getting weaker" goes to the physiotherapist: should weakness that keeps progressing, or thinning muscles, go to a doctor?'],
  ['wrist-guyon', 'An ulnar nerve entrapment at the wrist (cycling, tools).',
    'Same question: should grip or finger weakness that keeps progressing, or thinning hand muscles, go to a doctor?'],
  ['coccyx-pelvicfloor', 'Pelvic and bowel symptoms overlap with other causes.',
    'Should bleeding from the bottom, black stools or a lasting change in bowel habit be named on the card (doctor first)?'],
  ['knee-saphenous', 'A skin nerve at the inner knee, often after surgery.', 'Is the "spreading or weak: points to the back" line right?'],
  ['forearm-intersection', 'Overuse above the wrist (rowing, paddling).', 'Is the description and advice right?'],
  ['forearm-wartenberg', 'A skin nerve pressed by straps or cuffs.', 'Is the description and advice right?'],
  ['wrist-ecu', 'Little-finger-side wrist tendon (racquets, golf).', 'Is the snapping line and advice right?'],
  ['hand-digital', 'A finger nerve: one side of one finger.', 'The "after a cut: doctor promptly" line is there. Is it right?'],
  ['hand-thumbmuscle', 'Thumb overuse with phones and pinching.', 'Is the description and advice right?'],
  ['leg-peroneal', 'A nerve at the outer knee; foot drop is the danger.', 'The "foot slaps down: doctor first" line is there. Is it right?'],
  ['foot-sesamoid', 'Under the big toe; a stress fracture looks similar.', 'The "worse or at night: doctor first" line is there. Is it right?'],
  ['coccyx-unstable', 'A tailbone that catches on standing, often after childbirth.', 'Is the description and advice right?'],
]
const AREAS = {
  lowback: {
    title: 'Low Back Review',
    lede: 'The low back texts not yet signed: moved from the old site or taken from a guideline (JOSPT 2012 and 2021), plus the spondyloarthritis document. Signing all of them lets the low back area document be signed too.',
    list: [
      ['lowback-nslbp', 'The commonest result on the whole site.',
        'No doctor line. The clinic notes say "failure to improve within 30 days is itself a flag": should the card say "not better after 4 to 6 weeks, or getting worse: see your doctor"? Is "the back remains strong" right as worded?'],
      ['lowback-radicular', 'Common; the nerve and cauda equina emergencies sit next to it.',
        'No doctor or emergency line on the card. Should it name: numbness in the saddle area, or a new change in bladder or bowel (emergency department now); a weak foot or leg that is getting worse (doctor the same day)? The safety questions ask these, but the card does not repeat them.'],
      ['lowback-stenosis', 'Common over 60; poor circulation in the legs looks similar.',
        'No doctor line. Should it name: legs that ache with walking but do not ease on sitting or leaning forward, or cold or pale feet (doctor: circulation); both legs getting weaker, or a change in bladder or bowel (emergency department)?'],
      ['lowback-discderangement', 'Common after bending or lifting.',
        'Leg symptoms spreading go to the physiotherapist. Should spreading numbness or weakness in the leg go to a doctor? Is the standing-backbend advice safe for everyone who will read it?'],
      ['lowback-axspa', 'Inflammatory, not mechanical; early diagnosis changes the outcome.',
        'It has a "doctor first" section, which the other low back texts do not. "Any new painful red eye ... needs medical care first": should that say "see a doctor the same day" (uveitis)? Is the ceiling of 20 (already diagnosed scores 0) right?'],
      ['lowback-facet', 'Common, one-sided, worse arching back.',
        'The clinic notes say: under 20 with pain arching back in sport, think of a stress fracture of the spine (spondylolysis) first. Should the card say so for young athletes (doctor or physiotherapist assessment, rest from sport)?'],
      ['lowback-instability', 'Recurrent episodes; core-control advice.',
        'Is "the deep core muscles are not controlling movement well" a fair way to put it to patients? Only 5 pointers: is it matched often enough?'],
    ],
  },
}
const AREA = AREAS[TIER]
const LIST = AREA ? AREA.list : TIER === '3' ? TIER3 : TIER === '2' ? TIER2 : TIER1
const LABEL = AREA ? AREA.title.replace(/ Review$/, '') : `Tier ${TIER}`
const HEAD = AREA
  ? { title: AREA.title, h1: `${AREA.title.replace(/ Review$/, '')} review: ${AREA.list.length} condition texts`, lede: AREA.lede }
  : TIER === '3'
  ? { title: 'Tier 3 Review', h1: `Tier 3 review: ${TIER3.length} condition texts`, lede: 'Drafted by Claude, not yet signed: the less common problems, mostly nerve entrapments.' }
  : TIER === '2'
    ? { title: 'Tier 2 Review', h1: `Tier 2 review: ${TIER2.length} condition texts`, lede: 'Drafted by Claude, not yet signed: the common problems most patients will see.' }
    : { title: 'Tier 1 Review', h1: `Tier 1 review: ${TIER1.length} condition texts`, lede: 'Drafted by Claude, not yet signed, each sitting next to a condition that needs a doctor.' }

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** The condition file: front matter (reviewed, pointers) and its sections. */
function readCondition(key) {
  const file = `content/conditions/${key}.md`
  const t = fs.readFileSync(file, 'utf8').replace(/\r/g, '')
  const [, front = '', body = ''] = t.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/) || []
  // [ \t]*, not \s*: an empty "reviewed:" must not swallow the next line.
  const val = (k) => ((front.match(new RegExp(`^${k}:[ \\t]*(.*)$`, 'm')) || [])[1] || '').trim()
  const pointers = []
  let inP = false
  for (const line of front.split('\n')) {
    if (/^pointers:/.test(line)) { inP = true; continue }
    if (inP) {
      const m = line.match(/^\s+"(.*)":\s*(-?\d+)/)
      if (m) pointers.push([m[1], Number(m[2])])
      else if (/^\S/.test(line)) inP = false
    }
  }
  const sections = {}
  let cur = null
  for (const line of body.split('\n')) {
    const h = line.match(/^##\s+(\w+)/)
    if (h) { cur = h[1]; sections[cur] = []; continue }
    if (cur && line.trim()) sections[cur].push(line.replace(/^-\s+/, ''))
  }
  return { file, region: val('region'), id: val('id'), name: val('name'), clin: val('clin'), reviewed: val('reviewed'), pointers, sections }
}

const list = (items) => (items && items.length ? `<ul>${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="muted">None.</p>')
const tierLabel = (f) => (f.tier === 'emergency' ? (f.call911 ? '911' : 'Emergency') : f.sameDay ? 'Doctor today' : 'See a doctor')

const cards = LIST.map(([key, why, check], i) => {
  const c = readCondition(key)
  const R = REGIONS[c.region]
  const flags = (R ? R.redFlags : []).filter((f) => !f.drawn)
  const s = c.sections
  return `
  <section class="card" id="c-${esc(key)}" data-key="${esc(key)}">
    <header>
      <span class="num">${i + 1}</span>
      <div>
        <h2>${esc(c.name)}</h2>
        <p class="meta">${esc(R ? R.name : c.region)} · <code>${esc(c.file)}</code> · ${c.reviewed ? `<span class="ok">signed: ${esc(c.reviewed)}</span>` : '<span class="todo">not signed</span>'}</p>
        <p class="clin">Clinical label: ${esc(c.clin)}</p>
      </div>
    </header>
    <div class="why"><strong>${AREA ? 'Why it matters' : `Why Tier ${TIER}`}:</strong> ${esc(why)}<br><strong>Check:</strong> ${esc(check)}</div>
    <h3>What patients read</h3>
    <div class="patient">
      <p>${esc((s.blurb || []).join(' '))}</p>
      ${s.doctorFirst ? `<h4>See your doctor first</h4><p>${esc(s.doctorFirst.join(' '))}</p>` : ''}
      <h4>What people often notice</h4>${list(s.noticed)}
      <h4>What often helps</h4>${list(s.homeCare)}
      <h4>See a physiotherapist if</h4>${list(s.seePhysioIf)}
    </div>
    <details>
      <summary>Answers that point to it (${c.pointers.length})</summary>
      <table>${c.pointers.map(([a, w]) => `<tr><td>${esc(a)}</td><td class="${w < 0 ? 'neg' : 'pos'}">${w > 0 ? '+' : ''}${w}</td></tr>`).join('')}</table>
    </details>
    <details>
      <summary>The ${esc(R ? R.name : '')} safety questions it must not talk over (${flags.length})</summary>
      <ul class="flags">${flags.map((f) => `<li><span class="tag">${esc(tierLabel(f))}</span> ${esc(f.text)}</li>`).join('')}</ul>
    </details>
    <div class="decide">
      <label><input type="checkbox" data-k="wording"> Wording is right</label>
      <label><input type="checkbox" data-k="doctor"> "See a doctor" line is right (when and how urgent)</label>
      <label><input type="checkbox" data-k="pointers"> Pointers are right</label>
      <label class="approve"><input type="checkbox" data-k="approve"> Approve and sign</label>
      <textarea data-k="notes" placeholder="Changes you want (or leave empty)"></textarea>
    </div>
  </section>`
}).join('')

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${HEAD.title}</title>
<style>
  :root { --ink: #1b2430; --muted: #5d6b7a; --line: #dde3ea; --bg: #f6f8fb; --card: #fff; --gold: #9a7a3c; --ok: #1d7a46; --todo: #b2561c; --soft: #fbf7ef; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --ink: #e8edf3; --muted: #a3b0be; --line: #2c3846; --bg: #0f1722; --card: #162131; --gold: #d6b67a; --ok: #6fd39b; --todo: #f0a46a; --soft: #1d2a3b; } }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font: 16px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { max-width: 860px; margin: 0 auto; padding: 24px 16px 80px; }
  h1 { font-size: 26px; margin: 0 0 6px; } .lede { color: var(--muted); margin: 0 0 18px; }
  .bar { position: sticky; top: 0; z-index: 2; display: flex; gap: 10px; align-items: center; flex-wrap: wrap; background: var(--bg); padding: 10px 0; border-bottom: 1px solid var(--line); margin-bottom: 18px; }
  .bar button { font: inherit; padding: 9px 16px; border-radius: 999px; border: 1px solid var(--gold); background: var(--gold); color: #fff; cursor: pointer; font-weight: 600; }
  .bar .ghost { background: transparent; color: var(--gold); }
  .progress { color: var(--muted); font-size: 14px; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 18px; margin: 0 0 18px; }
  .card header { display: flex; gap: 14px; align-items: flex-start; }
  .num { flex: 0 0 auto; width: 32px; height: 32px; border-radius: 50%; background: var(--gold); color: #fff; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; }
  h2 { font-size: 19px; margin: 2px 0 4px; } h3 { font-size: 15px; margin: 16px 0 6px; text-transform: uppercase; letter-spacing: .06em; color: var(--gold); }
  h4 { font-size: 14px; margin: 12px 0 4px; } .meta, .clin { margin: 0; color: var(--muted); font-size: 14px; } code { font-size: 13px; }
  .ok { color: var(--ok); font-weight: 600; } .todo { color: var(--todo); font-weight: 600; } .muted { color: var(--muted); }
  .why { margin: 14px 0 0; padding: 10px 12px; border-left: 4px solid var(--todo); background: var(--soft); border-radius: 8px; font-size: 15px; }
  .patient { border: 1px solid var(--line); border-radius: 10px; padding: 10px 14px; } .patient ul { margin: 4px 0; padding-left: 20px; }
  details { margin: 12px 0 0; } summary { cursor: pointer; color: var(--gold); font-weight: 600; }
  table { border-collapse: collapse; width: 100%; margin-top: 6px; font-size: 14px; } td { border-bottom: 1px solid var(--line); padding: 5px 4px; vertical-align: top; } td.pos, td.neg { text-align: right; width: 52px; font-weight: 600; } td.neg { color: var(--todo); }
  .flags { padding-left: 18px; font-size: 14px; } .flags li { margin: 4px 0; } .tag { display: inline-block; min-width: 92px; font-size: 12px; font-weight: 700; color: var(--todo); }
  .decide { margin-top: 14px; display: grid; gap: 8px; border-top: 1px solid var(--line); padding-top: 12px; }
  .decide label { display: flex; gap: 10px; align-items: flex-start; } .decide input[type=checkbox] { width: 20px; height: 20px; margin-top: 2px; flex: 0 0 auto; }
  .approve { font-weight: 700; } textarea { width: 100%; min-height: 64px; font: inherit; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); }
  .done { border-color: var(--ok); }
</style></head>
<body><main>
  <h1>${HEAD.h1}</h1>
  <p class="lede">${HEAD.lede} Built ${new Date().toISOString().slice(0, 10)} from the condition files. Your ticks and notes stay in this browser; use "Copy my notes" and paste them to Claude to make the edits and add your sign-off.</p>
  <div class="bar"><button id="copy">Copy my notes</button><button class="ghost" id="clear">Clear ticks</button><span class="progress" id="progress"></span></div>
  ${cards}
</main>
<script>
  const KEY = 'tier${TIER}-review-v1'
  let state = {}
  try { state = JSON.parse(localStorage.getItem(KEY) || '{}') } catch (e) { state = {} }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch (e) {} }
  const cards = [...document.querySelectorAll('.card')]
  function refresh() {
    let approved = 0
    cards.forEach((card) => { const s = state[card.dataset.key] || {}; card.classList.toggle('done', !!s.approve); if (s.approve) approved++ })
    document.getElementById('progress').textContent = approved + ' of ' + cards.length + ' approved'
  }
  cards.forEach((card) => {
    const k = card.dataset.key, s = state[k] || (state[k] = {})
    card.querySelectorAll('[data-k]').forEach((el) => {
      const f = el.dataset.k
      if (el.type === 'checkbox') { el.checked = !!s[f]; el.addEventListener('change', () => { s[f] = el.checked; save(); refresh() }) }
      else { el.value = s[f] || ''; el.addEventListener('input', () => { s[f] = el.value; save() }) }
    })
  })
  refresh()
  document.getElementById('copy').addEventListener('click', async () => {
    const lines = ['${LABEL} review (' + new Date().toISOString().slice(0, 10) + ')']
    cards.forEach((card) => {
      const k = card.dataset.key, s = state[k] || {}, name = card.querySelector('h2').textContent
      const ticks = ['wording', 'doctor', 'pointers'].filter((f) => s[f]).join(', ')
      lines.push('- ' + k + ' (' + name + '): ' + (s.approve ? 'APPROVE' : 'not approved') + (ticks ? ' [ok: ' + ticks + ']' : '') + (s.notes ? ' | changes: ' + s.notes.replace(/\\n/g, ' ') : ''))
    })
    const text = lines.join('\\n')
    try { await navigator.clipboard.writeText(text); document.getElementById('copy').textContent = 'Copied' } catch (e) { prompt('Copy this text:', text) }
    setTimeout(() => { document.getElementById('copy').textContent = 'Copy my notes' }, 2000)
  })
  document.getElementById('clear').addEventListener('click', () => { if (confirm('Clear all ticks and notes on this page?')) { state = {}; save(); location.reload() } })
</script>
</body></html>`

fs.mkdirSync('review', { recursive: true })
fs.writeFileSync(OUT, html)
console.log(`Wrote ${OUT}: ${LIST.length} conditions`)
