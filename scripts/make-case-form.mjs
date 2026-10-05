/* Test-case form (Chandra, 5 Oct 2026): anonymised cases from clinic, with
   the diagnosis made there, to measure the guide against cases it was not
   written from. Every other test patient (check-accuracy, check-region-tests)
   was made up from the same scoring tables the guide uses.

   Run: node scripts/make-case-form.mjs   →   review/cases.html
   Opens in a browser with no server. Each case is entered as the patient
   would have answered on the first visit, using the site's own questions and
   wording (built from the live data, so it always matches the site). Cases
   stay in that browser until "Download cases file"; save the file in cases/
   (not committed) and run: node scripts/check-cases.mjs */
import fs from 'node:fs'
import { REGIONS } from '../src/data/symptomGuide.js'

const OUT = 'review/cases.html'
// Low back and knee first: the most common results (Chandra, 5 Oct 2026).
const FIRST = ['lowback', 'knee']
const order = [...FIRST, ...Object.keys(REGIONS).filter((k) => !FIRST.includes(k)).sort((a, b) => REGIONS[a].name.localeCompare(REGIONS[b].name))]
const slim = (q) => ({ id: q.id, text: q.text, multi: !!q.multi, options: q.options.map((o) => ({ id: o.id, label: o.label, excl: o.excl || null })) })
const DATA = order.map((k) => ({
  key: k,
  name: REGIONS[k].name,
  questions: REGIONS[k].context.concat(REGIONS[k].questions).map(slim),
  conditions: REGIONS[k].conditions.map((c) => ({ id: c.id, name: c.name })),
}))
const json = JSON.stringify(DATA).replace(/</g, '\\u003c')

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Test Cases</title>
<style>
  :root { --ink: #1b2430; --muted: #5d6b7a; --line: #dde3ea; --bg: #f6f8fb; --card: #fff; --gold: #9a7a3c; --ok: #1d7a46; --todo: #b2561c; --soft: #fbf7ef; }
  @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --ink: #e8edf3; --muted: #a3b0be; --line: #2c3846; --bg: #0f1722; --card: #162131; --gold: #d6b67a; --ok: #6fd39b; --todo: #f0a46a; --soft: #1d2a3b; } }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font: 16px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { max-width: 860px; margin: 0 auto; padding: 24px 16px 80px; }
  h1 { font-size: 26px; margin: 0 0 6px; } .lede { color: var(--muted); margin: 0 0 14px; }
  h2 { font-size: 19px; margin: 0 0 8px; } h3 { font-size: 15px; margin: 18px 0 6px; text-transform: uppercase; letter-spacing: .06em; color: var(--gold); }
  .warn { padding: 10px 12px; border-left: 4px solid var(--todo); background: var(--soft); border-radius: 8px; font-size: 15px; margin: 0 0 18px; }
  .card { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 18px; margin: 0 0 18px; }
  .row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
  button { font: inherit; padding: 9px 16px; border-radius: 999px; border: 1px solid var(--gold); background: var(--gold); color: #fff; cursor: pointer; font-weight: 600; }
  button.ghost { background: transparent; color: var(--gold); } button.small { padding: 4px 12px; font-size: 14px; }
  select, input[type=text], textarea { font: inherit; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--line); background: var(--bg); color: var(--ink); max-width: 100%; }
  textarea { width: 100%; min-height: 70px; }
  .q { border-top: 1px solid var(--line); padding: 12px 0 4px; } .q:first-of-type { border-top: 0; }
  .qt { font-weight: 600; margin: 0 0 6px; } .hint { color: var(--muted); font-size: 13px; font-weight: 400; }
  .opt { display: flex; gap: 10px; align-items: flex-start; margin: 4px 0; cursor: pointer; }
  .opt input { width: 18px; height: 18px; margin-top: 3px; flex: 0 0 auto; }
  .clear { color: var(--muted); font-size: 13px; background: none; border: 0; padding: 0; text-decoration: underline; cursor: pointer; }
  table { border-collapse: collapse; width: 100%; font-size: 14px; } td, th { border-bottom: 1px solid var(--line); padding: 6px 4px; text-align: left; vertical-align: top; }
  .muted { color: var(--muted); } .ok { color: var(--ok); font-weight: 600; }
  label.block { display: block; margin: 10px 0 4px; font-weight: 600; }
</style></head>
<body><main>
  <h1>Test cases for the symptom guide</h1>
  <p class="lede">Each case is one real patient, entered the way they would have answered on the first visit, with the diagnosis made in clinic. The guide is then tested on these cases. It never sees the diagnosis, and none of these cases were used to set its scores. Aim for 40 to 60, starting with the low back and the knee. Built ${new Date().toISOString().slice(0, 10)} from the site's own questions.</p>
  <p class="warn"><strong>Anonymised only.</strong> No names, initials, dates of birth, visit dates, places, employers or record numbers, in the answers or the notes. Use the age band only. Cases stay in this browser until you press "Download cases file".</p>

  <section class="card">
    <h2 id="formTitle">New case</h2>
    <div class="row">
      <label for="area"><strong>Area</strong></label>
      <select id="area"></select>
      <span class="muted" id="caseId"></span>
    </div>
    <h3>The patient's answers (first visit, before your assessment)</h3>
    <p class="muted" style="margin:0 0 6px;font-size:14px">Pick what the patient would have chosen, in their words. Leave a question blank if they would not have known.</p>
    <div id="questions"></div>

    <h3>Diagnosis in clinic</h3>
    <label class="block" for="dx">What it turned out to be</label>
    <select id="dx"></select>
    <div id="dxOtherWrap" style="display:none"><label class="block" for="dxOther">Name it</label><input type="text" id="dxOther" style="width:100%"></div>
    <label class="block" for="dx2">Also possible (optional)</label>
    <select id="dx2"></select>
    <label class="block">How sure</label>
    <div id="sure"></div>
    <label class="block" for="notes">Notes (optional, no identifiers)</label>
    <textarea id="notes" placeholder="E.g. what made the diagnosis clear, or what the guide should have asked"></textarea>
    <div class="row" style="margin-top:14px">
      <button id="save">Save case</button>
      <button class="ghost" id="reset">Clear the form</button>
      <span class="ok" id="saved"></span>
    </div>
  </section>

  <section class="card">
    <h2>Saved cases <span class="muted" id="count"></span></h2>
    <div id="list"></div>
    <div class="row" style="margin-top:14px">
      <button id="download">Download cases file</button>
      <button class="ghost" id="copy">Copy cases</button>
      <label class="ghost" style="cursor:pointer;color:var(--gold);font-weight:600">Load a cases file <input type="file" id="load" accept=".json,application/json" style="display:none"></label>
    </div>
    <p class="muted" style="font-size:14px">Save the downloaded file in the project's <code>cases</code> folder, then ask Claude to run the cases. That folder is not committed to the repository.</p>
  </section>
</main>
<script>
const DATA = ${json};
const KEY = 'physiochandra-test-cases-v1';
const SURE = [['confirmed', 'Confirmed (imaging, a specialist, or a clear test)'], ['clinical', 'Clinical diagnosis'], ['working', 'Working diagnosis, not yet clear']];
const PREFIX = { lowback: 'LB', knee: 'KN' };
let cases = [];
try { cases = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { cases = []; }
let editing = null;
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const store = () => { try { localStorage.setItem(KEY, JSON.stringify(cases)); } catch (e) {} };
const area = () => DATA.find((a) => a.key === $('area').value);

$('area').innerHTML = DATA.map((a) => '<option value="' + a.key + '">' + esc(a.name) + '</option>').join('');
$('sure').innerHTML = SURE.map(([id, label]) => '<label class="opt"><input type="radio" name="sure" value="' + id + '"> <span>' + esc(label) + '</span></label>').join('');

function nextId(k) {
  const p = PREFIX[k] || k.slice(0, 3).toUpperCase();
  let n = 1;
  while (cases.some((c) => c.id === p + '-' + String(n).padStart(2, '0'))) n++;
  return p + '-' + String(n).padStart(2, '0');
}

function renderForm(c) {
  const a = area();
  $('questions').innerHTML = a.questions.map((q) => {
    const type = q.multi ? 'checkbox' : 'radio';
    const have = c && c.answers[q.id] !== undefined ? [].concat(c.answers[q.id]) : [];
    return '<div class="q" data-q="' + q.id + '"><p class="qt">' + esc(q.text) + (q.multi ? ' <span class="hint">(tick all that apply)</span>' : '') +
      ' <button type="button" class="clear" data-clear="' + q.id + '">clear</button></p>' +
      q.options.map((o) => '<label class="opt"><input type="' + type + '" name="q_' + q.id + '" value="' + o.id + '"' + (o.excl ? ' data-excl="' + o.excl + '"' : '') +
        (have.includes(o.id) ? ' checked' : '') + '> <span>' + esc(o.label) + '</span></label>').join('') + '</div>';
  }).join('');
  const opts = a.conditions.map((x) => '<option value="' + x.id + '">' + esc(x.name) + '</option>').join('');
  $('dx').innerHTML = '<option value="">Choose…</option>' + opts + '<option value="other">Something not in this list</option>';
  $('dx2').innerHTML = '<option value="">None</option>' + opts + '<option value="other">Something not in this list</option>';
  $('dx').value = c ? c.diagnosis : ''; $('dx2').value = c ? (c.alsoPossible || '') : '';
  $('dxOther').value = c ? (c.diagnosisOther || '') : '';
  $('dxOtherWrap').style.display = $('dx').value === 'other' ? '' : 'none';
  document.querySelectorAll('input[name=sure]').forEach((r) => { r.checked = !!c && c.sure === r.value; });
  $('notes').value = c ? (c.notes || '') : '';
  $('caseId').textContent = 'Case ' + (c ? c.id : nextId(a.key));
  $('formTitle').textContent = c ? 'Editing case ' + c.id : 'New case';
}

$('questions').addEventListener('click', (e) => {
  const k = e.target.getAttribute && e.target.getAttribute('data-clear');
  if (k) document.querySelectorAll('input[name="q_' + k + '"]').forEach((i) => { i.checked = false; });
});
// Options sharing an excl key are alternatives: ticking one clears the others.
$('questions').addEventListener('change', (e) => {
  const t = e.target, x = t.getAttribute('data-excl');
  if (t.type === 'checkbox' && t.checked && x) document.querySelectorAll('input[name="' + t.name + '"][data-excl="' + x + '"]').forEach((i) => { if (i !== t) i.checked = false; });
});
$('area').addEventListener('change', () => { editing = null; renderForm(null); });
$('dx').addEventListener('change', () => { $('dxOtherWrap').style.display = $('dx').value === 'other' ? '' : 'none'; });
$('reset').addEventListener('click', () => { editing = null; renderForm(null); window.scrollTo(0, 0); });

$('save').addEventListener('click', () => {
  const a = area(), answers = {};
  a.questions.forEach((q) => {
    const ticked = [...document.querySelectorAll('input[name="q_' + q.id + '"]:checked')].map((i) => i.value);
    if (ticked.length) answers[q.id] = q.multi ? ticked : ticked[0];
  });
  if (!$('dx').value) { alert('Choose the diagnosis made in clinic.'); return; }
  if (!Object.keys(answers).length) { alert('Answer at least one question.'); return; }
  const sure = (document.querySelector('input[name=sure]:checked') || {}).value || '';
  const c = { id: editing || nextId(a.key), area: a.key, answers, diagnosis: $('dx').value, diagnosisOther: $('dx').value === 'other' ? $('dxOther').value.trim() : '',
    alsoPossible: $('dx2').value, sure, notes: $('notes').value.trim(), saved: new Date().toISOString().slice(0, 10) };
  const i = cases.findIndex((x) => x.id === c.id);
  if (i >= 0) cases[i] = c; else cases.push(c);
  store(); editing = null; renderList(); renderForm(null);
  $('saved').textContent = 'Saved ' + c.id; setTimeout(() => { $('saved').textContent = ''; }, 2500);
  window.scrollTo(0, 0);
});

function dxName(c) {
  const a = DATA.find((x) => x.key === c.area);
  if (c.diagnosis === 'other') return 'Not in the list: ' + (c.diagnosisOther || '?');
  const d = a && a.conditions.find((x) => x.id === c.diagnosis);
  return d ? d.name : c.diagnosis;
}
function renderList() {
  $('count').textContent = '(' + cases.length + ')';
  if (!cases.length) { $('list').innerHTML = '<p class="muted">None yet.</p>'; return; }
  const name = (k) => (DATA.find((a) => a.key === k) || {}).name || k;
  $('list').innerHTML = '<table><tr><th>Case</th><th>Area</th><th>Diagnosis</th><th>Answers</th><th></th></tr>' +
    cases.map((c) => '<tr><td>' + esc(c.id) + '</td><td>' + esc(name(c.area)) + '</td><td>' + esc(dxName(c)) + '</td><td>' + Object.keys(c.answers).length + '</td>' +
      '<td><button class="small ghost" data-edit="' + esc(c.id) + '">Edit</button> <button class="small ghost" data-del="' + esc(c.id) + '">Delete</button></td></tr>').join('') + '</table>';
}
$('list').addEventListener('click', (e) => {
  const ed = e.target.getAttribute('data-edit'), del = e.target.getAttribute('data-del');
  if (ed) { const c = cases.find((x) => x.id === ed); editing = c.id; $('area').value = c.area; renderForm(c); window.scrollTo(0, 0); }
  if (del && confirm('Delete case ' + del + '?')) { cases = cases.filter((x) => x.id !== del); store(); renderList(); }
});

const fileText = () => JSON.stringify({ format: 'physiochandra-test-cases', version: 1, exported: new Date().toISOString().slice(0, 10), cases }, null, 2);
$('download').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([fileText()], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url; link.download = 'test-cases-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
});
$('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(fileText()); $('copy').textContent = 'Copied'; } catch (e) { $('copy').textContent = 'Copy failed'; }
  setTimeout(() => { $('copy').textContent = 'Copy cases'; }, 2000);
});
$('load').addEventListener('change', async (e) => {
  const f = e.target.files[0]; if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    const add = (d.cases || []).filter((c) => !cases.some((x) => x.id === c.id));
    cases = cases.concat(add); store(); renderList();
    alert('Loaded ' + add.length + ' case(s)' + ((d.cases || []).length > add.length ? '; cases with an id already here were kept as they are.' : '.'));
  } catch (err) { alert('That file could not be read.'); }
  e.target.value = '';
});

renderForm(null); renderList();
</script>
</body></html>`

fs.mkdirSync('review', { recursive: true })
fs.writeFileSync(OUT, html)
console.log(`Wrote ${OUT}: ${DATA.length} areas, ${DATA.reduce((n, a) => n + a.questions.length, 0)} questions`)
