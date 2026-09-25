/* The clinical review page: every region as a patient meets it, with its
   sign-off status.   Run: npm run review   →   review/index.html

   Built from the live site data (REGIONS, the injury screens, the result
   cards) plus the region and condition files, so it always shows exactly
   what is built. Open the file in a browser; it needs no server.
   Sign-off itself is recorded in the files (see scripts/check-review.mjs). */
import fs from 'node:fs'
import { REGIONS, SPECIAL_CARDS } from '../src/data/symptomGuide.js'
import { SCREENS } from '../src/data/injuryScreen.js'
import { regionSignoff, conditionSignoff } from './check-review.mjs'

const OUT_DIR = 'review'
const ORDER = ['neck', 'ctj', 'upperback', 'tlj', 'lowback', 'sij', 'coccyx', 'jaw', 'head', 'shoulder', 'arm', 'elbow', 'wrist', 'hip', 'knee', 'ankle']
const AREA = {
  neck: 'Neck', ctj: 'Base of neck (C7–T3)', upperback: 'Mid back and front of chest', tlj: 'Mid-to-low back and flank',
  lowback: 'Lower back', sij: 'Back of pelvis and buttock', coccyx: 'Tailbone', jaw: 'Jaw', head: 'Head',
  shoulder: 'Shoulder', arm: 'Upper arm', elbow: 'Elbow and forearm', wrist: 'Wrist and hand', hip: 'Hip, groin, top of the thigh',
  knee: 'Knee (mid-thigh to shin)', ankle: 'Lower shin, ankle and foot',
}

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/* "Ask only if" rules and test-patient counts, from the region records. */
function regionRecord(key) {
  const f = `content/regions/${key}.md`
  if (!fs.existsSync(f)) return null
  const t = fs.readFileSync(f, 'utf8').replace(/\r/g, '')
  const askIf = {}
  let q = null
  for (const line of t.split('\n')) {
    const m = line.match(/^Q:\s*(.*?)(\s+\(asked first\))?$/)
    if (m) { q = norm(m[1]); continue }
    const a = line.match(/^Ask only if:\s*(.*)$/)
    if (a && q) askIf[q] = a[1]
  }
  const source = ((t.match(/^source:\s*(.*)$/m) || [])[1] || '').trim()
  return { file: f, askIf, source, tests: (t.match(/^CASE:/gm) || []).length }
}

const regionsSigned = regionSignoff()
const condsSigned = conditionSignoff()

function statusPill(signed, text) {
  return `<span class="pill ${signed ? 'ok' : 'todo'}">${esc(text)}</span>`
}

function renderRegion(key) {
  const R = REGIONS[key]
  const rec = regionRecord(key)
  const doc = regionsSigned[key]
  const condName = Object.fromEntries(R.conditions.map((c) => [c.id, c.name]))
  const signed = doc && doc.signed
  const docLine = doc
    ? (signed ? statusPill(true, `Region signed ${doc.reviewedOn}`) : statusPill(false, 'Region not signed'))
    : `<span class="pill old">July 2026 set, not yet rebuilt</span>`

  const flags = R.redFlags.map((f) => `
      <li class="flag">
        <span class="tier ${f.tier}">${f.tier === 'emergency' ? '911' : f.sameDay ? 'Doctor today' : 'See doctor'}</span>
        <div><p class="q">${esc(f.text)}</p>${f.why ? `<p class="why">${esc(f.why)}</p>` : ''}${f.drawn ? `<p class="meta">Asked only when ${esc(f.drawn.join(', '))} is drawn</p>` : ''}${f.group ? `<p class="meta">Shown once with other areas that ask the same (${esc(f.group)})</p>` : ''}</div>
      </li>`).join('')

  const screen = SCREENS.find((s) => s.id === key)
  const injury = screen ? `
    <section class="block"><h3>Injury screen</h3>
      <p class="note">Shown after the two safety pages when this area is drawn. The first answer that routes ends it; a see-a-doctor result lets the patient book and carry on.</p>
      <ol class="inj">${screen.questions.map((q) => `
        <li><p class="q">${esc(q.text)}</p><ul class="opts">${q.options.map((o) => `
          <li><span>${esc(o.label)}</span>${o.route ? `<span class="route ${esc(o.route)}">${{ emergency: '→ 911', urgent: '→ doctor first', skip: '→ skip screen', continue: '→ continue' }[o.route] || ''}</span>` : ''}${o.why ? `<span class="meta"> ${esc(o.why)}</span>` : ''}</li>`).join('')}
        </ul></li>`).join('')}
      </ol></section>` : key === 'ctj' ? `<section class="block"><h3>Injury screen</h3><p class="note">Uses the neck's injury screen (Canadian C-Spine Rule).</p></section>` : ''

  const option = (o) => {
    const ws = Object.entries(o.weights || {}).filter(([, w]) => w !== 0)
    const chips = ws.map(([cid, w]) => `<span class="ptr ${w > 0 ? 'pos' : 'neg'}">${esc(condName[cid] || cid)} ${w > 0 ? '+' : ''}${w}</span>`).join('')
    const card = o.special && SPECIAL_CARDS[o.special] ? `<span class="ptr card">Card: ${esc(SPECIAL_CARDS[o.special].title)}</span>` : ''
    const none = !chips && !card ? '<span class="ptr none">no score</span>' : ''
    return `<li><span class="opt">${esc(o.label)}</span><span class="chips">${chips}${card}${none}</span></li>`
  }
  const question = (q, i, opening) => {
    const ask = rec && rec.askIf[norm(q.text)]
    return `<li class="qitem"><p class="q">${opening ? '' : `<span class="qn">${i + 1}</span>`}${esc(q.text)}</p>${ask ? `<p class="meta">Asked only if: ${esc(ask)}</p>` : ''}<ul class="opts">${q.options.map(option).join('')}</ul></li>`
  }

  const conds = R.conditions.map((c) => {
    const s = condsSigned[`${key}/${c.id}`]
    const pill = s ? statusPill(s.signed, s.signed ? `Signed: ${s.reviewed}` : 'Not signed') : '<span class="pill old">In code (old set)</span>'
    const gates = c.gates ? [c.gates.ages ? `ages ${c.gates.ages.join(', ')}` : '', c.gates.requiresOnset ? `start: ${c.gates.requiresOnset.join(', ')}` : ''].filter(Boolean).join('; ') : ''
    const list = (title, items) => items && items.length ? `<h5>${title}</h5><ul class="bul">${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''
    return `
      <article class="cond ${s && s.origin === 'drafted by Claude' && !s.signed ? 'drafted' : ''}">
        <header><h4>${esc(c.name)}</h4><div class="pills">${pill}${s && s.origin ? `<span class="pill origin">${esc(s.origin)}</span>` : ''}</div></header>
        <p class="clin">${esc(c.clin)}${gates ? ` · shown only for ${esc(gates)}` : ''}</p>
        <p class="blurb">${esc(c.blurb)}</p>
        <div class="lists">${list('What people often notice', c.noticed)}${list('What often helps', c.homeCare)}${list('See a physiotherapist if', c.seePhysioIf)}</div>
        ${s ? `<p class="file">Edit and sign in <code>${esc(s.file)}</code> (the <code>reviewed:</code> line)</p>` : ''}
      </article>`
  }).join('')

  return `
  <section class="region" id="${key}">
    <header class="rhead">
      <p class="eyebrow">${esc(AREA[key] || key)}</p>
      <h2>${esc(R.name)}</h2>
      <div class="pills">${docLine}${rec ? `<span class="pill plain">${rec.tests} test patients</span>` : ''}</div>
      ${rec ? `<p class="file">Sign the region in <code>${esc(rec.file)}</code> (the <code>reviewed_on:</code> line)</p>` : ''}
      ${rec && rec.source ? `<details class="src"><summary>Sources</summary><p>${esc(rec.source)}</p></details>` : ''}
    </header>
    <section class="block"><h3>Red flags <span class="count">${R.redFlags.length}</span></h3><ul class="flags">${flags}</ul></section>
    ${injury}
    <section class="block"><h3>Opening questions</h3><ul class="qs">${R.context.map((q, i) => question(q, i, true)).join('')}</ul></section>
    <section class="block"><h3>Questions <span class="count">${R.questions.length}</span></h3>
      <p class="note">A patient sees up to 5, chosen by their earlier answers. Each answer shows what it points to.</p>
      <ol class="qs">${R.questions.map((q, i) => question(q, i, false)).join('')}</ol></section>
    <section class="block"><h3>Conditions <span class="count">${R.conditions.length}</span></h3>${conds}</section>
  </section>`
}

const keys = ORDER.filter((k) => REGIONS[k])
const allConds = Object.values(condsSigned)
const nav = keys.map((k) => {
  const doc = regionsSigned[k]
  const cs = REGIONS[k].conditions.map((c) => condsSigned[`${k}/${c.id}`]).filter(Boolean)
  const done = cs.filter((s) => s.signed).length
  const state = !doc ? 'old' : doc.signed && done === cs.length ? 'ok' : 'todo'
  return `<li><a href="#${k}"><span class="dot ${state}"></span><span>${esc(REGIONS[k].name)}</span><span class="n">${doc ? `${done}/${cs.length}` : 'old'}</span></a></li>`
}).join('')
const regionTotal = Object.keys(regionsSigned).length
const regionDone = Object.values(regionsSigned).filter((r) => r.signed).length
const draftedOpen = allConds.filter((s) => s.origin === 'drafted by Claude' && !s.signed).length
const stamp = new Date().toISOString().slice(0, 10)

const html = `<title>Physio Chandra Clinical Review</title>
<meta name="description" content="Every body region as a patient meets it, with sign-off status.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant:wght@500;600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap">
<style>
  :root {
    --bg: #f4f6f9; --surface: #ffffff; --ink: #14233a; --muted: #5b6778; --line: #dde3eb;
    --accent: #8a6a2c; --accent-soft: #f3ead8; --navy: #0a1a2f;
    --emergency: #b3261e; --emergency-soft: #fbe7e5; --urgent: #8f5400; --urgent-soft: #fbefdc;
    --ok: #1e7a4c; --ok-soft: #e2f3ea; --old: #6b7280; --old-soft: #eceef1; --drafted: #c9a96e;
    --pos: #1d4f8a; --pos-soft: #e5eef9; --neg: #8a2d2d; --neg-soft: #f7e8e8;
    --display: 'Cormorant', Georgia, 'Times New Roman', serif;
    --body: 'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      color-scheme: dark;
      --bg: #0a1a2f; --surface: #10243d; --ink: #e9edf3; --muted: #9aa8bb; --line: #213752;
      --accent: #d7b87c; --accent-soft: #2a2a22;
      --emergency: #f2968f; --emergency-soft: #3a1c1f; --urgent: #f0b765; --urgent-soft: #372a15;
      --ok: #7fd1a6; --ok-soft: #173327; --old: #a3adbb; --old-soft: #1b2c42; --drafted: #d7b87c;
      --pos: #9cc2f0; --pos-soft: #16304f; --neg: #f0a1a1; --neg-soft: #3a1e22;
    }
  }
  :root[data-theme="dark"] {
    color-scheme: dark;
    --bg: #0a1a2f; --surface: #10243d; --ink: #e9edf3; --muted: #9aa8bb; --line: #213752;
    --accent: #d7b87c; --accent-soft: #2a2a22;
    --emergency: #f2968f; --emergency-soft: #3a1c1f; --urgent: #f0b765; --urgent-soft: #372a15;
    --ok: #7fd1a6; --ok-soft: #173327; --old: #a3adbb; --old-soft: #1b2c42; --drafted: #d7b87c;
    --pos: #9cc2f0; --pos-soft: #16304f; --neg: #f0a1a1; --neg-soft: #3a1e22;
  }
  body { background: var(--bg); color: var(--ink); font: 15px/1.55 var(--body); margin: 0; overflow-wrap: break-word; }
  .wrap { max-width: 1180px; margin: 0 auto; padding-inline: 16px; padding-block: 28px 64px;
    display: grid; grid-template-columns: 250px minmax(0, 1fr); gap: 36px; }
  @media (max-width: 860px) { .wrap { grid-template-columns: minmax(0, 1fr); gap: 20px; } }
  h1, h2, h4 { font-family: var(--display); font-weight: 600; letter-spacing: -0.005em; text-wrap: balance; margin: 0; }
  h1 { font-size: 2.3rem; line-height: 1.1; }
  h2 { font-size: 2rem; line-height: 1.15; }
  h3 { font-size: 0.78rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); margin: 0 0 12px; font-weight: 600;
    display: flex; gap: 8px; align-items: baseline; }
  h4 { font-size: 1.35rem; line-height: 1.2; }
  h5 { font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin: 10px 0 4px; font-weight: 600; }
  p { margin: 0; }
  code { font-size: 0.85em; background: var(--accent-soft); padding: 1px 5px; border-radius: 4px; word-break: break-all; }
  .count { color: var(--muted); font-variant-numeric: tabular-nums; letter-spacing: 0; }
  aside { position: sticky; top: calc(env(safe-area-inset-top, 0px) + 16px); align-self: start; display: grid; gap: 18px; }
  @media (max-width: 860px) { aside { position: static; } }
  .intro { display: grid; gap: 10px; }
  .intro .lede { color: var(--muted); max-width: 62ch; }
  .totals { display: flex; flex-wrap: wrap; gap: 8px; }
  nav ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
  nav a { display: grid; grid-template-columns: 10px 1fr auto; gap: 10px; align-items: center; padding: 6px 8px; border-radius: 6px;
    color: var(--ink); text-decoration: none; font-size: 0.92rem; }
  nav a:hover, nav a:focus-visible { background: var(--surface); outline: none; }
  nav .n { color: var(--muted); font-size: 0.8rem; font-variant-numeric: tabular-nums; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--urgent); }
  .dot.ok { background: var(--ok); } .dot.old { background: var(--old); }
  .how { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; display: grid; gap: 8px; font-size: 0.9rem; }
  .how ol { margin: 0; padding-left: 18px; display: grid; gap: 6px; }
  main { display: grid; gap: 56px; min-width: 0; }
  .region { display: grid; gap: 26px; scroll-margin-top: 16px; }
  .rhead { display: grid; gap: 8px; padding-bottom: 18px; border-bottom: 2px solid var(--navy); }
  :root[data-theme="dark"] .rhead { border-bottom-color: var(--accent); }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .rhead { border-bottom-color: var(--accent); } }
  .eyebrow { font-size: 0.75rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); }
  .pills { display: flex; flex-wrap: wrap; gap: 6px; }
  .pill { font-size: 0.78rem; padding: 3px 10px; border-radius: 999px; font-weight: 500; }
  .pill.ok { background: var(--ok-soft); color: var(--ok); }
  .pill.todo { background: var(--urgent-soft); color: var(--urgent); }
  .pill.old { background: var(--old-soft); color: var(--old); }
  .pill.origin, .pill.plain { background: var(--accent-soft); color: var(--accent); }
  .file { font-size: 0.82rem; color: var(--muted); }
  .src summary { cursor: pointer; font-size: 0.82rem; color: var(--muted); }
  .src p { font-size: 0.82rem; color: var(--muted); margin-top: 6px; max-width: 80ch; }
  .block { display: grid; gap: 4px; }
  .note { font-size: 0.85rem; color: var(--muted); margin-bottom: 8px; }
  .meta { font-size: 0.8rem; color: var(--muted); }
  .flags, .qs, .inj { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
  .flag { display: grid; grid-template-columns: 88px minmax(0, 1fr); gap: 12px; align-items: start;
    background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; }
  .tier { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; padding: 3px 8px; border-radius: 4px; text-align: center; }
  .tier.emergency { background: var(--emergency-soft); color: var(--emergency); }
  .tier.urgent { background: var(--urgent-soft); color: var(--urgent); }
  .flag .why { font-size: 0.85rem; color: var(--muted); margin-top: 2px; }
  .q { font-weight: 500; }
  .qn { display: inline-block; min-width: 1.6em; color: var(--accent); font-variant-numeric: tabular-nums; }
  .qitem, .inj > li { background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 12px 14px; display: grid; gap: 6px; }
  .opts { list-style: none; margin: 4px 0 0; padding: 0; display: grid; gap: 4px; }
  .opts li { display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: baseline; padding: 5px 0; border-top: 1px solid var(--line); }
  .opts li:first-child { border-top: 0; }
  .opt { flex: 1 1 min(260px, 100%); min-width: 0; }
  .chips { display: flex; flex-wrap: wrap; gap: 4px; }
  .ptr { font-size: 0.74rem; padding: 2px 7px; border-radius: 4px; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
  .ptr.pos { background: var(--pos-soft); color: var(--pos); }
  .ptr.neg { background: var(--neg-soft); color: var(--neg); }
  .ptr.card { background: var(--accent-soft); color: var(--accent); white-space: normal; }
  .ptr.none { color: var(--muted); border: 1px dashed var(--line); }
  .route { font-size: 0.78rem; font-weight: 600; }
  .route.emergency { color: var(--emergency); } .route.urgent { color: var(--urgent); } .route.skip, .route.continue { color: var(--muted); }
  .cond { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 16px 18px; display: grid; gap: 8px; margin-bottom: 12px; }
  .cond.drafted { border-left: 4px solid var(--drafted); }
  .cond header { display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: baseline; justify-content: space-between; }
  .clin { font-size: 0.85rem; color: var(--muted); font-style: italic; }
  .blurb { max-width: 70ch; }
  .lists { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr)); gap: 4px 20px; }
  .bul { margin: 0; padding-left: 18px; display: grid; gap: 3px; font-size: 0.9rem; }
  a:focus-visible, summary:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
</style>
<div class="wrap">
  <aside>
    <div class="intro">
      <h1>Clinical review</h1>
      <p class="lede">Every region as a patient meets it: red flags, questions, what each answer points to, and the condition text they read. Built ${stamp} from the live site data.</p>
      <div class="totals">
        ${statusPill(regionDone === regionTotal, `Regions signed ${regionDone}/${regionTotal}`)}
        ${statusPill(allConds.every((s) => s.signed), `Conditions signed ${allConds.filter((s) => s.signed).length}/${allConds.length}`)}
        <span class="pill origin">${draftedOpen} drafted by Claude to check</span>
      </div>
    </div>
    <nav aria-label="Regions"><ul>${nav}</ul></nav>
    <div class="how">
      <strong>How to sign off</strong>
      <ol>
        <li>Read the region and its conditions here. Conditions with a gold edge are text Claude drafted.</li>
        <li>For changes, tell Claude what to change, or edit the file named under each item.</li>
        <li>When a condition is right, fill its <code>reviewed:</code> line with your name and date, e.g. <code>reviewed: Chandra Matla, 2026-09-26</code>. For a whole region, put the date on its <code>reviewed_on:</code> line. Or just tell Claude "the neck region is reviewed".</li>
        <li><code>npm run check:review</code> lists what is still unsigned.</li>
      </ol>
    </div>
  </aside>
  <main>${keys.map(renderRegion).join('')}</main>
</div>
`
fs.mkdirSync(OUT_DIR, { recursive: true })
fs.writeFileSync(`${OUT_DIR}/index.html`, html)
console.log(`Wrote ${OUT_DIR}/index.html — ${keys.length} regions, ${allConds.length} condition files (${draftedOpen} drafted by Claude, unsigned).`)
