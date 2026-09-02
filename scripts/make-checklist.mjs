/* Build the clinical review checklist page from the imported records.
   Generated, not hand-written, so what Chandra reviews is exactly what the
   site would send to Claude — no transcription drift.
   Run: node scripts/make-checklist.mjs <out.html> */
import fs from 'node:fs'

const data = JSON.parse(fs.readFileSync(process.env.SCRATCH + '/review.json', 'utf8'))
const OUT = process.argv[2] || 'review-checklist.html'

// Concerns raised during extraction. Each is a specific thing to check, not a
// general "please review" — those get ignored.
const FLAGS = {
  'neck/whiplash': 'Pointer <b>“More than 6 weeks”</b> looks wrong — whiplash-type strain is usually acute. <b>“Less than 2 weeks”</b> is probably the right pointer.',
  'neck/cheadache': 'Reachable but not separable: the neck questions <b>never ask about headache</b>. Consider adding a headache option to N1, or this can only ever be inferred indirectly.',
  'hip/hamstring': 'From a hamstring (posterior thigh) guideline, filed under Hip &amp; groin because the app has no thigh region. Check the pointers make sense to someone answering <em>hip</em> questions.',
  'hip/hipinstab': 'Pointers overlap the existing <code>fai</code> and <code>snap</code> conditions. Check the three can still be told apart.',
  'knee/hipreferred': 'Overlaps <code>hip/hipoa</code>. Decide whether the knee region should carry a hip condition at all.',
  'knee/pfoa': 'Overlaps the existing <code>oa</code> and <code>pfp</code> knee conditions.',
  'knee/pcl': 'Only 3 pointers, and <code>check:data</code> warns its ceiling is low — it needs nearly every pointer to surface.',
  'knee/lcl': 'Only 3 pointers. Check it can realistically be reached.',
  'shoulder/calcific': 'Taken from the rotator cuff guideline’s <em>differential</em> section, not its main topic. Judge whether it belongs on a public self-assessment.',
  'ankle/fatpad': 'A differential from the plantar fasciitis guideline rather than its main topic.',
  'ankle/tarsaltunnel': 'A differential from the plantar fasciitis guideline rather than its main topic.',
  'lowback/instability': 'A near-duplicate (<code>coreinstability</code>) was quarantined in favour of this one. Confirm this is the better of the two.',
  'lowback/discderangement': 'A near-duplicate (<code>discreferred</code>) was quarantined in favour of this one. Confirm this is the better of the two.',
}

const QUARANTINED = [
  ['_ankle-spondylo.md', 'Spondyloarthritis-related heel pain', 'Systemic inflammatory disease — needs bloods and imaging, not four clicks'],
  ['_ankle-fibroma.md', 'Plantar fibroma', 'A lump; needs hands-on examination'],
  ['_lowback-fearavoidance.md', 'Fear-avoidance', 'A psychosocial modifier, not a condition a visitor “has”'],
  ['_lowback-centralpain.md', 'Central sensitisation', 'A pain mechanism, not a condition'],
  ['_knee-osgood.md', 'Osgood-Schlatter', 'Paediatric — only valid in growing adolescents'],
  ['_knee-slj.md', 'Sinding-Larsen-Johansson', 'Paediatric — only valid in growing adolescents'],
  ['_lowback-coreinstability.md', 'Movement-control instability', 'Near-duplicate of <code>instability</code>'],
  ['_lowback-discreferred.md', 'Disc pain referring to the leg', 'Overlaps the existing <code>radicular</code> condition'],
]

const REGION_ORDER = ['neck', 'lowback', 'shoulder', 'hip', 'knee', 'ankle']
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const byRegion = {}
for (const r of data) (byRegion[r.region] ||= []).push(r)

const weightWord = { 3: 'strong', 2: 'moderate', 1: 'weak', '-2': 'argues against' }

const card = (r) => {
  const key = `${r.region}/${r.id}`
  const flag = FLAGS[key]
  return `<article class="rec${flag ? ' rec--flagged' : ''}" data-key="${key}" data-flagged="${flag ? '1' : '0'}">
  <header class="rec__head">
    <div>
      <h3 class="rec__name">${esc(r.name)}</h3>
      <p class="rec__clin">${esc(r.clin)}</p>
    </div>
    <div class="rec__meta">
      <code>${esc(r.region)}/${esc(r.id)}</code>
      <span class="rec__file">${esc(r.file)}</span>
    </div>
  </header>

  <p class="rec__source"><span class="lbl">From</span> ${esc(r.source)}</p>

  ${flag ? `<p class="rec__flag"><span class="rec__flagtag">Check this</span> ${flag}</p>` : ''}

  <div class="rec__grid">
    <section class="pointers">
      <h4 class="h4">Shown when the visitor answers</h4>
      <table class="ptable">
        <tbody>
        ${r.pointers.map((p) => `<tr>
          <td class="ptable__a">${esc(p.label)}</td>
          <td class="ptable__w"><span class="w w--${p.weight < 0 ? 'neg' : p.weight}">${p.weight > 0 ? '+' : ''}${p.weight}</span> <span class="w__word">${weightWord[p.weight] || ''}</span></td>
        </tr>`).join('\n')}
        </tbody>
      </table>
    </section>

    <section class="copy">
      <h4 class="h4">What the visitor reads</h4>
      <p class="blurb">${esc(r.blurb)}</p>
      <dl class="bullets">
        <dt>People notice</dt>
        <dd><ul>${r.noticed.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></dd>
        <dt>Home care</dt>
        <dd><ul>${r.homeCare.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></dd>
        <dt>See a physio if</dt>
        <dd><ul>${r.seePhysioIf.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></dd>
      </dl>
    </section>
  </div>

  <footer class="decide">
    <fieldset class="choices">
      <legend class="sr">Decision for ${esc(r.name)}</legend>
      ${['Approve as written', 'Approve with my edits', 'Remove'].map((label, i) => `
      <label class="choice choice--${['ok', 'edit', 'drop'][i]}">
        <input type="radio" name="d-${key}" value="${['ok', 'edit', 'drop'][i]}"> <span>${label}</span>
      </label>`).join('')}
    </fieldset>
    <input class="note" type="text" name="n-${key}" placeholder="What needs changing…" aria-label="Note for ${esc(r.name)}">
  </footer>
</article>`
}

const html = `<title>Condition Record Sign-Off</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root{
  --paper:#f5f5f2; --card:#ffffff; --ink:#101c2e; --ink-2:#3d4a5c; --ink-3:#6b7684;
  --line:#dedcd5; --line-2:#ebe9e3;
  --gold:#8a6d2f; --gold-soft:#f0e7d3;
  --ok:#2f6b4f; --flag:#a8541f; --flag-soft:#fbeee2; --drop:#8f3a32;
  --shadow:0 1px 2px rgba(16,28,46,.05), 0 8px 24px -18px rgba(16,28,46,.35);
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --paper:#0d1524; --card:#141f31; --ink:#e9e7e1; --ink-2:#b3bcc9; --ink-3:#8592a3;
    --line:#28374d; --line-2:#1e2b3e;
    --gold:#c9a96e; --gold-soft:#2a2418;
    --ok:#6fbf95; --flag:#e0925c; --flag-soft:#2e2114; --drop:#e08b81;
    --shadow:0 1px 2px rgba(0,0,0,.3), 0 10px 30px -20px rgba(0,0,0,.8);
  }
}
:root[data-theme="dark"]{
  --paper:#0d1524; --card:#141f31; --ink:#e9e7e1; --ink-2:#b3bcc9; --ink-3:#8592a3;
  --line:#28374d; --line-2:#1e2b3e;
  --gold:#c9a96e; --gold-soft:#2a2418;
  --ok:#6fbf95; --flag:#e0925c; --flag-soft:#2e2114; --drop:#e08b81;
  --shadow:0 1px 2px rgba(0,0,0,.3), 0 10px 30px -20px rgba(0,0,0,.8);
}
*{box-sizing:border-box}
body{
  margin:0; background:var(--paper); color:var(--ink);
  font-family:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif;
  font-size:15px; line-height:1.55; -webkit-font-smoothing:antialiased;
}
.wrap{max-width:1080px; margin:0 auto; padding:0 24px 96px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}

/* ── masthead ─────────────────────────────────────────── */
.mast{padding:56px 0 28px; border-bottom:1px solid var(--line)}
.eyebrow{
  font-family:"IBM Plex Mono",ui-monospace,monospace; font-size:11px; letter-spacing:.16em;
  text-transform:uppercase; color:var(--gold); margin:0 0 14px;
}
h1{
  font-family:Fraunces,Georgia,serif; font-weight:600; font-size:clamp(30px,4.4vw,46px);
  line-height:1.1; margin:0 0 14px; text-wrap:balance; letter-spacing:-.01em;
}
.standfirst{margin:0; max-width:62ch; color:var(--ink-2); font-size:16.5px}
.standfirst strong{color:var(--ink); font-weight:500}

.howto{
  margin:26px 0 0; padding:18px 20px; background:var(--card); border:1px solid var(--line);
  border-radius:10px; box-shadow:var(--shadow);
}
.howto h2{font-family:"DM Sans",sans-serif; font-size:13px; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-3); margin:0 0 10px; font-weight:500}
.howto ol{margin:0; padding-left:20px; display:flex; flex-direction:column; gap:7px; color:var(--ink-2)}
.howto code, code{font-family:"IBM Plex Mono",ui-monospace,monospace; font-size:.88em; background:var(--line-2); padding:1px 5px; border-radius:4px; color:var(--ink)}

/* ── sticky progress ──────────────────────────────────── */
.bar{
  position:sticky; top:0; z-index:20; background:color-mix(in srgb, var(--paper) 92%, transparent);
  backdrop-filter:blur(8px); border-bottom:1px solid var(--line); margin-bottom:34px;
}
.bar__in{max-width:1080px; margin:0 auto; padding:12px 24px; display:flex; align-items:center; gap:18px; flex-wrap:wrap}
.count{font-family:"IBM Plex Mono",monospace; font-size:13px; color:var(--ink-2); font-variant-numeric:tabular-nums}
.count b{color:var(--ink); font-weight:500}
.track{flex:1; min-width:140px; height:5px; background:var(--line-2); border-radius:3px; overflow:hidden}
.fill{height:100%; width:0; background:var(--gold); transition:width .3s ease}
.filters{display:flex; gap:6px}
.filters button{
  font:inherit; font-size:12.5px; padding:5px 11px; border-radius:999px; cursor:pointer;
  border:1px solid var(--line); background:transparent; color:var(--ink-2);
}
.filters button[aria-pressed="true"]{background:var(--ink); color:var(--paper); border-color:var(--ink)}
.filters button:focus-visible, .choice input:focus-visible, .note:focus-visible{outline:2px solid var(--gold); outline-offset:2px}

/* ── regions ──────────────────────────────────────────── */
.region{margin:0 0 12px; padding-top:26px; display:flex; align-items:baseline; gap:12px}
/* DM Sans, not Fraunces: three of the six region names contain an ampersand,
   and Fraunces' display ampersand reads as a symbol at this size. */
.region h2{font-family:"DM Sans",sans-serif; font-weight:700; font-size:20px; margin:0; letter-spacing:-.01em}
.region .tally{font-family:"IBM Plex Mono",monospace; font-size:12px; color:var(--ink-3); font-variant-numeric:tabular-nums}
.recs{display:flex; flex-direction:column; gap:14px}

/* ── record card ──────────────────────────────────────── */
.rec{
  background:var(--card); border:1px solid var(--line); border-radius:12px;
  padding:20px 22px; box-shadow:var(--shadow);
}
.rec--flagged{border-left:3px solid var(--flag)}
.rec[data-done="1"]{opacity:.55}
.rec__head{display:flex; justify-content:space-between; align-items:flex-start; gap:20px; flex-wrap:wrap}
.rec__name{font-family:"DM Sans",sans-serif; font-size:18px; font-weight:700; margin:0; letter-spacing:-.01em}
.rec__clin{margin:3px 0 0; color:var(--ink-3); font-size:13.5px; font-style:italic}
.rec__meta{text-align:right; display:flex; flex-direction:column; gap:3px; align-items:flex-end}
.rec__file{font-family:"IBM Plex Mono",monospace; font-size:11px; color:var(--ink-3)}
.rec__source{margin:14px 0 0; font-size:13px; color:var(--ink-2)}
.lbl{font-family:"IBM Plex Mono",monospace; font-size:10.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-3); margin-right:7px}
.rec__flag{
  margin:14px 0 0; padding:11px 14px; background:var(--flag-soft); border-radius:8px;
  font-size:13.5px; color:var(--ink); line-height:1.5;
}
.rec__flagtag{
  font-family:"IBM Plex Mono",monospace; font-size:10.5px; letter-spacing:.1em; text-transform:uppercase;
  color:var(--flag); margin-right:8px; font-weight:500;
}
.rec__grid{display:grid; grid-template-columns:minmax(0,320px) minmax(0,1fr); gap:26px; margin-top:18px}
@media (max-width:760px){ .rec__grid{grid-template-columns:1fr; gap:20px} }
.h4{
  font-family:"IBM Plex Mono",monospace; font-size:10.5px; letter-spacing:.12em; text-transform:uppercase;
  color:var(--ink-3); margin:0 0 9px; font-weight:500;
}
.ptable{width:100%; border-collapse:collapse; font-size:13.5px}
.ptable td{padding:6px 0; border-bottom:1px solid var(--line-2); vertical-align:top}
.ptable tr:last-child td{border-bottom:0}
.ptable__a{color:var(--ink-2); padding-right:12px!important}
.ptable__w{white-space:nowrap; text-align:right; font-variant-numeric:tabular-nums}
.w{font-family:"IBM Plex Mono",monospace; font-weight:500; font-size:12.5px}
.w--3{color:var(--gold)} .w--2{color:var(--ink-2)} .w--1{color:var(--ink-3)} .w--neg{color:var(--drop)}
.w__word{font-size:11px; color:var(--ink-3); margin-left:5px}
.blurb{margin:0 0 14px; font-size:14.5px; color:var(--ink)}
.bullets{margin:0; display:flex; flex-direction:column; gap:11px}
.bullets dt{
  font-family:"IBM Plex Mono",monospace; font-size:10.5px; letter-spacing:.1em; text-transform:uppercase;
  color:var(--ink-3);
}
.bullets dd{margin:4px 0 0}
.bullets ul{margin:0; padding-left:18px; display:flex; flex-direction:column; gap:4px; font-size:13.5px; color:var(--ink-2)}

.decide{
  display:flex; gap:14px; align-items:center; flex-wrap:wrap;
  margin-top:18px; padding-top:16px; border-top:1px solid var(--line-2);
}
.choices{display:flex; gap:8px; border:0; padding:0; margin:0; flex-wrap:wrap}
.choice{
  display:inline-flex; align-items:center; gap:7px; cursor:pointer; font-size:13px;
  padding:6px 12px; border:1px solid var(--line); border-radius:999px; color:var(--ink-2);
}
.choice input{accent-color:var(--gold); margin:0}
.choice:has(input:checked){border-color:currentColor; font-weight:500}
.choice--ok:has(input:checked){color:var(--ok)}
.choice--edit:has(input:checked){color:var(--gold)}
.choice--drop:has(input:checked){color:var(--drop)}
.note{
  flex:1; min-width:220px; font:inherit; font-size:13px; padding:8px 12px;
  border:1px solid var(--line); border-radius:8px; background:transparent; color:var(--ink);
}
.note::placeholder{color:var(--ink-3)}

/* ── held back ────────────────────────────────────────── */
.held{margin-top:56px; padding:24px 26px; border:1px dashed var(--line); border-radius:12px}
.held h2{font-family:Fraunces,Georgia,serif; font-weight:500; font-size:22px; margin:0 0 6px}
.held p.intro{margin:0 0 18px; color:var(--ink-2); max-width:64ch; font-size:14.5px}
.held table{width:100%; border-collapse:collapse; font-size:13.5px}
.held th{
  text-align:left; font-family:"IBM Plex Mono",monospace; font-size:10.5px; letter-spacing:.1em;
  text-transform:uppercase; color:var(--ink-3); font-weight:500; padding:0 12px 8px 0; border-bottom:1px solid var(--line);
}
.held td{padding:9px 12px 9px 0; border-bottom:1px solid var(--line-2); vertical-align:top; color:var(--ink-2)}
.held td:first-child{font-family:"IBM Plex Mono",monospace; font-size:12px; color:var(--ink); white-space:nowrap}
.held tr:last-child td{border-bottom:0}

.foot{margin-top:44px; padding-top:20px; border-top:1px solid var(--line); color:var(--ink-3); font-size:13px}
.foot code{font-size:12px}

@media print{
  .bar,.filters{display:none}
  .rec{break-inside:avoid; box-shadow:none}
  body{background:#fff}
}
@media (prefers-reduced-motion:reduce){ *{transition:none!important} }
</style>

<div class="bar">
  <div class="bar__in">
    <span class="count"><b id="done">0</b> of <b>${data.length}</b> reviewed</span>
    <span class="track"><span class="fill" id="fill"></span></span>
    <span class="filters">
      <button type="button" data-filter="all" aria-pressed="true">All</button>
      <button type="button" data-filter="flagged" aria-pressed="false">Needs a look (${Object.keys(FLAGS).length})</button>
      <button type="button" data-filter="todo" aria-pressed="false">Not yet reviewed</button>
    </span>
  </div>
</div>

<div class="wrap">
  <header class="mast">
    <p class="eyebrow">Physio Chandra · symptom guide</p>
    <h1>${data.length} draft condition records, awaiting your sign-off</h1>
    <p class="standfirst">These were drafted from the JOSPT clinical practice guidelines and are <strong>not live to patients yet</strong>. Each one adds a possible cause the guide can show, and the wording below is what a visitor would actually read. Nothing here has been checked by a clinician — that is what this page is for.</p>

    <div class="howto">
      <h2>How to use this page</h2>
      <ol>
        <li>Work through each record. The left column is what makes it appear; the right is what the patient sees.</li>
        <li>Mark <em>Approve</em>, <em>Approve with my edits</em>, or <em>Remove</em>, and note anything that needs changing. Your marks are saved in this browser.</li>
        <li>Edit the matching file in <code>content/conditions/</code> — plain text, no code.</li>
        <li>Run <code>npm run import:conditions</code> then <code>npm run check:data</code>. If it reports an error, nothing is written, so a mistake can't reach the site.</li>
      </ol>
    </div>
  </header>

  ${REGION_ORDER.filter((k) => byRegion[k]).map((k) => {
    const list = byRegion[k]
    const flagged = list.filter((r) => FLAGS[`${r.region}/${r.id}`]).length
    return `<section class="regionblock">
    <div class="region">
      <h2>${esc(list[0].regionName)}</h2>
      <span class="tally">${list.length} record${list.length === 1 ? '' : 's'}${flagged ? ` · ${flagged} to check` : ''}</span>
    </div>
    <div class="recs">${list.map(card).join('\n')}</div>
  </section>`
  }).join('\n')}

  <section class="held">
    <h2>Held back — not in the site</h2>
    <p class="intro">The extraction also produced these. I kept them out because they don't belong on a public self-assessment, or duplicate something you already have. They're still on disk, renamed with a leading underscore so the importer skips them. Rename one without the underscore to bring it in.</p>
    <table>
      <thead><tr><th>File</th><th>What it was</th><th>Why it's held back</th></tr></thead>
      <tbody>
        ${QUARANTINED.map(([f, what, why]) => `<tr><td>${esc(f)}</td><td>${esc(what)}</td><td>${why}</td></tr>`).join('\n')}
      </tbody>
    </table>
  </section>

  <p class="foot">One more thing worth your judgement: <strong>cervicogenic headache can be reached but not properly separated</strong>, because the neck questions never ask about headache. That's a gap in the questionnaire rather than the data — the fix is adding a headache option, not adjusting the record.</p>
</div>

<script>
(function () {
  var KEY = 'physio-chandra-record-review-v1';
  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { state = {}; }

  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  var recs = Array.prototype.slice.call(document.querySelectorAll('.rec'));

  function paint() {
    var done = 0;
    recs.forEach(function (rec) {
      var k = rec.dataset.key;
      var s = state[k] || {};
      if (s.decision) done++;
      rec.dataset.done = s.decision ? '1' : '0';
    });
    document.getElementById('done').textContent = done;
    document.getElementById('fill').style.width = (done / recs.length * 100) + '%';
  }

  // restore
  recs.forEach(function (rec) {
    var k = rec.dataset.key, s = state[k] || {};
    if (s.decision) {
      var radio = rec.querySelector('input[value="' + s.decision + '"]');
      if (radio) radio.checked = true;
    }
    if (s.note) rec.querySelector('.note').value = s.note;
  });
  paint();

  document.addEventListener('change', function (e) {
    var rec = e.target.closest('.rec');
    if (!rec) return;
    var k = rec.dataset.key;
    state[k] = state[k] || {};
    if (e.target.type === 'radio') state[k].decision = e.target.value;
    save(); paint();
  });
  document.addEventListener('input', function (e) {
    if (!e.target.classList.contains('note')) return;
    var rec = e.target.closest('.rec');
    state[rec.dataset.key] = state[rec.dataset.key] || {};
    state[rec.dataset.key].note = e.target.value;
    save();
  });

  var buttons = document.querySelectorAll('.filters button');
  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.filter;
      Array.prototype.forEach.call(buttons, function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      recs.forEach(function (rec) {
        var show = f === 'all'
          || (f === 'flagged' && rec.dataset.flagged === '1')
          || (f === 'todo' && rec.dataset.done !== '1');
        rec.hidden = !show;
      });
      document.querySelectorAll('.regionblock').forEach(function (sec) {
        var any = Array.prototype.some.call(sec.querySelectorAll('.rec'), function (r) { return !r.hidden; });
        sec.hidden = !any;
      });
    });
  });
})();
</script>
`

fs.writeFileSync(OUT, html)
console.log('wrote', OUT, (html.length / 1024).toFixed(0) + 'KB,', data.length, 'records,', Object.keys(FLAGS).length, 'flagged')
