/* Tier 1 review page: the 14 condition texts drafted by Claude that sit next
   to a condition needing a doctor (Chandra, 4 Oct 2026). Read these first.
   Run: node scripts/make-review-tier1.mjs   →   review/tier1.html

   Built from the condition files (what Chandra edits) and the live site data
   (the area's safety questions), so it always shows what is built. Opens in
   a browser with no server. Ticks and notes are kept in that browser only;
   "Copy my notes" gives a text to paste back for the edits and sign-off. */
import fs from 'node:fs'
import { REGIONS } from '../src/data/symptomGuide.js'

const OUT = 'review/tier1.html'
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

const cards = TIER1.map(([key, why, check], i) => {
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
    <div class="why"><strong>Why Tier 1:</strong> ${esc(why)}<br><strong>Check:</strong> ${esc(check)}</div>
    <h3>What patients read</h3>
    <div class="patient">
      <p>${esc((s.blurb || []).join(' '))}</p>
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
<title>Tier 1 Review</title>
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
  <h1>Tier 1 review: 14 condition texts</h1>
  <p class="lede">Drafted by Claude, not yet signed, each sitting next to a condition that needs a doctor. Built ${new Date().toISOString().slice(0, 10)} from the condition files. Your ticks and notes stay in this browser; use "Copy my notes" and paste them to Claude to make the edits and add your sign-off.</p>
  <div class="bar"><button id="copy">Copy my notes</button><button class="ghost" id="clear">Clear ticks</button><span class="progress" id="progress"></span></div>
  ${cards}
</main>
<script>
  const KEY = 'tier1-review-v1'
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
    const lines = ['Tier 1 review (' + new Date().toISOString().slice(0, 10) + ')']
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
console.log(`Wrote ${OUT}: ${TIER1.length} conditions`)
