/* The sign-off page: every condition card not yet signed, by area, with its
   patient text, what changed and why, and a sign / needs-changes choice.
   Run: npm run signoff   →   review/signoff.html   (opens with no server)

   Built from the condition files (what Chandra signs) and the live site data
   (each card's pointers, as the site scores them). Decisions stay in the
   browser; "Copy my decisions" gives a text to paste to Claude, who then
   writes "reviewed: Chandra Matla, <date>" into each signed file and makes
   the requested changes (Chandra, 6 Oct 2026). */
import fs from 'node:fs'
import { pathToFileURL } from 'node:url'
import { conditionSignoff } from './check-review.mjs'

const ORDER = ['neck', 'ctj', 'upperback', 'tlj', 'lowback', 'sij', 'coccyx', 'jaw', 'head', 'shoulder', 'arm', 'elbow', 'forearm', 'wrist', 'hand', 'hip', 'thigh', 'knee', 'leg', 'ankle', 'foot']
const AREA = {
  neck: 'Neck', ctj: 'Base of neck', upperback: 'Mid back and chest', tlj: 'Mid-to-low back and flank', lowback: 'Lower back',
  sij: 'Back of pelvis', coccyx: 'Tailbone', jaw: 'Jaw', head: 'Head', shoulder: 'Shoulder', arm: 'Upper arm', elbow: 'Elbow',
  forearm: 'Forearm', wrist: 'Wrist', hand: 'Hand and fingers', hip: 'Hip and groin', thigh: 'Thigh', knee: 'Knee',
  leg: 'Lower leg', ankle: 'Ankle', foot: 'Foot and toes',
}
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function parse(file) {
  const t = fs.readFileSync(file, 'utf8').replace(/\r/g, '')
  const fm = t.split('\n---\n')[0]
  const get = (k) => ((fm.match(new RegExp('^' + k + ':\\s*(.*)$', 'm')) || [])[1] || '').trim()
  // "What changed": the dated comment lines and the lines that follow them.
  const notes = []
  let on = false
  for (const line of fm.split('\n')) {
    if (!line.startsWith('#')) { on = false; continue }
    const s = line.replace(/^#\s?/, '')
    if (/^reviewed: your name/.test(s)) { on = false; continue }
    if (/\b(20\d\d|\d+ (Sep|Oct) 2026)\b/.test(s) || /^(DRAFT|Patient text|Pointers|From )/.test(s)) { notes.push(s); on = true } else if (on) notes[notes.length - 1] += ' ' + s
  }
  const body = t.slice(t.indexOf('\n---\n', 4) + 5)
  const sections = {}
  for (const part of body.split(/\n(?=## )/)) {
    const m = part.match(/^## (\w+)\n([\s\S]*)$/)
    if (!m) continue
    const lines = m[2].trim().split('\n').filter(Boolean)
    sections[m[1]] = lines.every((l) => l.startsWith('- ')) ? lines.map((l) => l.slice(2)) : m[2].trim()
  }
  const pointers = []
  const pm = fm.match(/\npointers:\n((?:  .*\n?)*)/)
  if (pm) for (const l of pm[1].split('\n')) { const m = l.match(/^\s+"(.*)":\s*(-?\d+)/); if (m) pointers.push([m[1], Number(m[2])]) }
  return { region: get('region'), id: get('id'), name: get('name'), clin: get('clin'), ages: get('ages'), onset: get('onset'), notes, sections, pointers }
}

const status = conditionSignoff()
const byName = {}
for (const c of Object.values(status)) { const p = parse(c.file); (byName[p.name] = byName[p.name] || []).push(`${p.region}/${p.id}`) }
/** Cards for the given condition keys ("region/id"), or every unsigned one. */
export function signoffCards(keys = null) {
  return Object.entries(status).filter(([key, s]) => (keys ? keys.includes(key) : !s.signed))
    .map(([key, s]) => ({ key, ...s, ...parse(s.file) }))
    .sort((a, b) => ORDER.indexOf(a.region) - ORDER.indexOf(b.region) || a.name.localeCompare(b.name))
}

export const list = (v) => (Array.isArray(v) ? `<ul>${v.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : `<p>${esc(v)}</p>`)
const SECTION = [['blurb', 'What it is'], ['doctorFirst', 'Doctor first'], ['noticed', 'What you may notice'], ['homeCare', 'What you can do'], ['seePhysioIf', 'When to get help']]
export const cardHtml = (c) => {
  const twins = (byName[c.name] || []).filter((k) => k !== c.key)
  const doctor = [].concat(c.sections.seePhysioIf || []).filter((l) => /doctor|911|emergency/i.test(l)).length
  return `<section class="card" data-key="${esc(c.key)}" data-area="${esc(c.region)}">
  <header><div><h2>${esc(c.name)}</h2>
    <p class="meta">${esc(AREA[c.region] || c.region)} · <code>${esc(c.file.replace('content/conditions/', ''))}</code>${c.origin ? ` · <span class="tag">${esc(c.origin)}</span>` : ''}${c.ages ? ` · ages ${esc(c.ages)}` : ''}${c.onset ? ` · only after: ${esc(c.onset)}` : ''} · ${doctor} doctor line${doctor === 1 ? '' : 's'}</p>
    <p class="clin">${esc(c.clin)}</p>
    ${twins.length ? `<p class="twin">Same name as ${twins.map(esc).join(', ')}: shown once, keep the text in step.</p>` : ''}
  </div></header>
  ${c.notes.length ? `<div class="why"><strong>What changed and why</strong><ul>${c.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></div>` : ''}
  <div class="patient">${SECTION.filter(([k]) => c.sections[k]).map(([k, h]) => `<h4>${h}</h4>${list(c.sections[k])}`).join('')}</div>
  ${c.sections.clinicNotes ? `<details><summary>Clinic notes (clinicians only)</summary>${list(c.sections.clinicNotes)}</details>` : ''}
  <details><summary>Answers that point to it (${c.pointers.length})</summary><table>${c.pointers.map(([l, w]) => `<tr><td>${esc(l)}</td><td class="${w < 0 ? 'neg' : 'pos'}">${w > 0 ? '+' : ''}${w}</td></tr>`).join('')}</table></details>
  <div class="decide">
    <label><input type="radio" name="d_${esc(c.key)}" value="sign"> <span class="approve">Sign off: every line checked</span></label>
    <label><input type="radio" name="d_${esc(c.key)}" value="change"> Needs changes (say what below)</label>
    <textarea placeholder="Changes or notes for this card"></textarea>
  </div>
</section>`
}

/** A sign-off page. `cards` from signoffCards; `extra` = { title, html } blocks
    placed first, whose own .card sections (with data-key) are decided and
    copied the same way; `storageKey` keeps each page's choices apart.
    `bare`: leave out the doctype and the html, head and body tags, for
    publishing as a claude.ai artifact (its viewer adds its own), so the page
    can be opened as a link on a phone. */
export function renderPage({ cards, title = 'Card Sign-off', heading, lede, extra = [], storageKey = 'signoff-v1', bare = false }) {
const areas = ORDER.filter((r) => cards.some((c) => c.region === r))
const head = bare ? '' : `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
`
return `${head}<title>${esc(title)}</title>
<style>
  :root { --ink: #1b2430; --muted: #5d6b7a; --line: #dde3ea; --bg: #f6f8fb; --card: #fff; --gold: #9a7a3c; --ok: #1d7a46; --todo: #b2561c; --soft: #fbf7ef; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --ink: #e8edf3; --muted: #a3b0be; --line: #2c3846; --bg: #0f1722; --card: #162131; --gold: #d6b67a; --ok: #6fd39b; --todo: #f0a46a; --soft: #1d2a3b; color-scheme: dark; } }
  :root[data-theme="dark"] { --ink: #e8edf3; --muted: #a3b0be; --line: #2c3846; --bg: #0f1722; --card: #162131; --gold: #d6b67a; --ok: #6fd39b; --todo: #f0a46a; --soft: #1d2a3b; color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font: 16px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { max-width: 880px; margin: 0 auto; padding: 24px 16px 80px; }
  h1 { font-size: 26px; margin: 0 0 6px; } .lede { color: var(--muted); margin: 0 0 14px; }
  .bar { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 2; background: var(--bg); padding: 10px 0; border-bottom: 1px solid var(--line); margin-bottom: 18px; display: grid; gap: 8px; }
  .row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  button { font: inherit; padding: 7px 14px; border-radius: 999px; border: 1px solid var(--gold); background: var(--gold); color: #fff; cursor: pointer; font-weight: 600; }
  button.ghost { background: transparent; color: var(--gold); }
  .chip { padding: 4px 11px; font-size: 14px; font-weight: 500; background: transparent; color: var(--ink); border-color: var(--line); }
  .chip.on { background: var(--gold); color: #fff; border-color: var(--gold); }
  .progress { color: var(--muted); font-size: 14px; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 18px; margin: 0 0 18px; }
  .card.signed { border-color: var(--ok); } .card.change { border-color: var(--todo); }
  h2 { font-size: 19px; margin: 0 0 4px; } h4 { font-size: 14px; margin: 12px 0 4px; color: var(--gold); text-transform: uppercase; letter-spacing: .05em; }
  .meta, .clin { margin: 0; color: var(--muted); font-size: 14px; } code { font-size: 13px; }
  .tag { font-weight: 700; color: var(--todo); } .twin { margin: 6px 0 0; font-size: 14px; color: var(--gold); }
  .why { margin: 12px 0; padding: 10px 12px; border-left: 4px solid var(--todo); background: var(--soft); border-radius: 8px; font-size: 14px; }
  .why ul { margin: 4px 0 0; padding-left: 18px; }
  .patient { border: 1px solid var(--line); border-radius: 10px; padding: 4px 14px 10px; } .patient ul { margin: 4px 0; padding-left: 20px; } .patient p { margin: 4px 0; }
  details { margin: 10px 0 0; font-size: 14px; } summary { cursor: pointer; color: var(--gold); font-weight: 600; }
  table { border-collapse: collapse; width: 100%; } td { border-bottom: 1px solid var(--line); padding: 4px; } td.pos, td.neg { text-align: right; width: 48px; font-weight: 600; } td.neg { color: var(--todo); }
  .decide { margin-top: 14px; display: grid; gap: 8px; border-top: 1px solid var(--line); padding-top: 12px; }
  .decide label { display: flex; gap: 10px; align-items: center; cursor: pointer; } .decide input { width: 18px; height: 18px; }
  .approve { font-weight: 700; }
  textarea { width: 100%; min-height: 56px; font: inherit; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); }
  .hidden { display: none; }
  #copyBox { min-height: 120px; font: 13px/1.4 ui-monospace, Consolas, monospace; }
  h3.area { margin: 26px 0 10px; font-size: 20px; }
</style>${bare ? '' : '</head>\n<body>'}<main>
  <h1>${heading ? esc(heading) : `Card sign-off: ${cards.length} cards`}</h1>
  ${lede ? `<p class="lede">${lede}</p>` : `<p class="lede">Every condition card that is not yet signed, from the condition files as they are on ${new Date().toISOString().slice(0, 10)}. Each shows the patient text, what changed and why, its clinic notes and the answers that point to it. Mark "Sign off" when every line is checked, or "Needs changes" with a note. Your choices stay in this browser; press "Copy my decisions" and paste them to Claude, who adds your sign-off to each file and makes the changes. Cards marked <span class="tag">drafted by Claude</span> deserve the closest read.</p>`}
  <div class="bar">
    <div class="row"><button id="copy">Copy my decisions</button><button class="ghost" id="hideDone">Hide decided</button><button class="ghost" id="clear">Clear</button><span class="progress" id="progress"></span></div>
    <textarea id="copyBox" class="hidden" readonly aria-label="Your decisions, to copy"></textarea>
    <div class="row" id="areas"><button class="chip on" data-area="">All</button>${extra.map((x) => `<button class="chip" data-area="${esc(x.area)}">${esc(x.title)}</button>`).join('')}${areas.map((a) => `<button class="chip" data-area="${a}">${esc(AREA[a])} (${cards.filter((c) => c.region === a).length})</button>`).join('')}</div>
  </div>
  ${extra.map((x) => `<h3 class="area" data-area="${esc(x.area)}">${esc(x.title)}</h3>` + x.html).join('')}
  ${areas.map((a) => `<h3 class="area" data-area="${a}">${esc(AREA[a])}</h3>` + cards.filter((c) => c.region === a).map(cardHtml).join('\n')).join('\n')}
</main>
<script>
  const KEY = '${storageKey}'
  let state = {}
  try { state = JSON.parse(localStorage.getItem(KEY) || '{}') } catch (e) { state = {} }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch (e) {} }
  const cards = [...document.querySelectorAll('.card')]
  let area = '', hideDone = false
  function refresh() {
    let signed = 0, change = 0
    for (const el of cards) {
      const s = state[el.dataset.key] || {}
      el.classList.toggle('signed', s.d === 'sign'); el.classList.toggle('change', s.d === 'change')
      el.querySelectorAll('input').forEach((i) => { i.checked = s.d === i.value })
      el.querySelector('textarea').value = s.note || ''
      if (s.d === 'sign') signed++; if (s.d === 'change') change++
      el.classList.toggle('hidden', (area && el.dataset.area !== area) || (hideDone && !!s.d))
    }
    document.querySelectorAll('h3.area').forEach((h) => h.classList.toggle('hidden', !!area && h.dataset.area !== area))
    document.getElementById('progress').textContent = signed + ' signed · ' + change + ' need changes · ' + (cards.length - signed - change) + ' to go'
  }
  document.addEventListener('change', (e) => {
    const el = e.target.closest('.card'); if (!el || e.target.type !== 'radio') return
    ;(state[el.dataset.key] ||= {}).d = e.target.value; save(); refresh()
  })
  document.addEventListener('input', (e) => {
    const el = e.target.closest('.card'); if (!el || e.target.tagName !== 'TEXTAREA') return
    ;(state[el.dataset.key] ||= {}).note = e.target.value; save()
  })
  document.getElementById('areas').addEventListener('click', (e) => {
    const b = e.target.closest('.chip'); if (!b) return
    area = b.dataset.area
    document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c === b)); refresh(); window.scrollTo(0, 0)
  })
  document.getElementById('hideDone').addEventListener('click', (e) => { hideDone = !hideDone; e.target.textContent = hideDone ? 'Show decided' : 'Hide decided'; refresh() })
  // Tap twice to clear (a confirm() dialog is blocked on a published page).
  let armed = null
  document.getElementById('clear').addEventListener('click', (e) => {
    if (!armed) { e.target.textContent = 'Tap again to clear all'; armed = setTimeout(() => { armed = null; e.target.textContent = 'Clear' }, 4000); return }
    clearTimeout(armed); armed = null; e.target.textContent = 'Clear'; state = {}; save(); refresh()
  })
  document.getElementById('copy').addEventListener('click', async () => {
    const lines = ['${esc(title)} decisions (' + new Date().toISOString().slice(0, 10) + ')']
    for (const el of cards) {
      const s = state[el.dataset.key]; if (!s || (!s.d && !s.note)) continue
      lines.push((s.d === 'sign' ? 'SIGN ' : s.d === 'change' ? 'CHANGE ' : 'NOTE ') + el.dataset.key + (s.note ? ' | ' + s.note.replace(/\\n/g, ' ') : ''))
    }
    const btn = document.getElementById('copy')
    // Some phone views refuse the clipboard: then show the text to select by hand.
    const box = document.getElementById('copyBox')
    try { await navigator.clipboard.writeText(lines.join('\\n')); btn.textContent = 'Copied ' + (lines.length - 1); box.classList.add('hidden') }
    catch (err) { box.value = lines.join('\\n'); box.classList.remove('hidden'); box.focus(); box.select(); btn.textContent = 'Select the text below to copy' }
    setTimeout(() => { document.getElementById('copy').textContent = 'Copy my decisions' }, 4000)
  })
  refresh()
</script>${bare ? '' : '\n</body></html>'}`

}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const cards = signoffCards()
  fs.mkdirSync('review', { recursive: true })
  fs.writeFileSync('review/signoff.html', renderPage({ cards }))
  console.log(`review/signoff.html: ${cards.length} unsigned cards in ${new Set(cards.map((c) => c.region)).size} areas`)
}
