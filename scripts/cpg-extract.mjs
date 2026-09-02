/* Turn a clinical practice guideline PDF into DRAFT condition records for
   content/conditions/.

   Why offline and not at request time: a CPG is 50-100 pages. Attaching one to
   every visitor request would cost ~40x more per visitor, add tens of seconds,
   and — worst — produce different patient-facing wording on every run, which
   nobody has reviewed. Converting once means Chandra reads and approves the
   exact words patients see, and the live site keeps sending only the small,
   approved knowledge block.

   The output is a DRAFT. It is written to content/conditions/ for a
   physiotherapist to correct before `npm run import:conditions`.

   Usage: node --env-file=server/.env scripts/cpg-extract.mjs <file.pdf> <region> [--write]
          regions: lowback neck upperback shoulder elbow wrist hip knee ankle
*/
import fs from 'node:fs'
import path from 'node:path'
import Anthropic from '@anthropic-ai/sdk'
import { REGIONS, allQuestions } from '../src/data/symptomGuide.js'
import { getApiKey } from '../api/_lib/painShared.js'

const [pdfPath, regionKey] = process.argv.slice(2)
const WRITE = process.argv.includes('--write')
if (!pdfPath || !regionKey) { console.error('usage: cpg-extract.mjs <file.pdf> <region> [--write]'); process.exit(1) }
const region = REGIONS[regionKey]
if (!region) { console.error(`unknown region "${regionKey}" — one of: ${Object.keys(REGIONS).join(' ')}`); process.exit(1) }

// The pointer text must match an answer option the visitor actually sees;
// the importer resolves it by substring, and an unmatched pointer is a build
// error. So the exact option list goes into the prompt.
const optionList = allQuestions(region)
  .map((q) => `  ${q.id} — ${q.text}\n` + (q.options || []).map((o) => `      "${o.label}"`).join('\n'))
  .join('\n')
const existing = region.conditions.map((c) => `${c.id} (${c.name})`).join(', ')

const INSTRUCTIONS = `You are helping a Registered Physiotherapist in British Columbia turn a clinical practice guideline into records for the patient-facing symptom guide on their website.

THE GUIDELINE IS ATTACHED AS A PDF. Read it and produce condition records for the "${region.name}" region.

THE VISITOR'S ANSWER OPTIONS for this region — a record can only ever be shown if it points at one of these EXACT strings:
${optionList}

ALREADY IN THIS REGION (do not duplicate these ids): ${existing}

For each distinct condition the guideline covers that a website visitor could plausibly have, output an object with:
- "id": short lowercase code, no spaces, unique, not one of the existing ids
- "name": plain-English name a patient understands (NOT the clinical term)
- "clin": the clinical term from the guideline
- "source": the guideline's title and year, for provenance
- "pointers": an object mapping ANSWER TEXT to strength. The answer text must be a
  distinctive substring of one of the exact option strings above, copied
  character for character from them. Strength: 3 = strong pointer, 2 = moderate,
  1 = weak, -2 = argues against. Give 2-5 pointers. A record with no pointers can
  never be shown, so this is the most important field.
- "blurb": 1-2 sentences explaining the condition to a patient
- "noticed": 3 bullet strings — what people typically notice, from the guideline's
  clinical presentation / diagnosis section
- "homeCare": 3 bullet strings — reasonable self-management, from the guideline's
  intervention recommendations
- "seePhysioIf": 2 bullet strings — when to seek in-person assessment

HARD RULES
- Write ORIGINAL patient-facing wording. Do NOT copy sentences from the guideline.
  Nothing you write may be a quotation from the PDF.
- Plain, warm, non-alarming language a 12-year-old could read. No jargon in
  "blurb"/"noticed"/"homeCare"/"seePhysioIf" (jargon belongs only in "clin").
- No diagnosis claims, no medication advice, no red-flag/emergency symptoms
  (the site runs its own separate safety screening).
- Only include conditions the ATTACHED guideline actually supports. If the
  guideline does not cover something, leave it out — do not fill gaps from
  general knowledge. It is correct and useful to return fewer records.
- Extract only what the guideline is ABOUT — its primary diagnostic categories.
  Do NOT mine its differential-diagnosis section for extra conditions. If the
  region list above already covers the guideline's primary condition, return an
  EMPTY list. Returning zero conditions is a correct, expected outcome and is
  much better than reaching for something obscure to have an answer.
- NEVER include: systemic or inflammatory disease (e.g. spondyloarthritis),
  tumours or lumps, fractures, anything that needs imaging or blood tests before
  it could be suspected, age-restricted paediatric conditions, or psychosocial /
  pain-mechanism labels (e.g. fear-avoidance, central sensitisation). A visitor
  answering four multiple-choice questions must never be pointed at those.

Respond ONLY with valid JSON, no markdown fence: {"conditions":[ ... ]}`

const client = new Anthropic({ apiKey: getApiKey() })
const pdf = fs.readFileSync(pdfPath).toString('base64')
console.log(`reading ${path.basename(pdfPath)} (${(fs.statSync(pdfPath).size / 1048576).toFixed(1)} MB) for region "${regionKey}"...`)

// Streaming: a long PDF plus a large max_tokens can outrun the HTTP timeout.
// Adaptive thinking is left ON here (unlike the live routes) — this is careful
// one-off extraction where reasoning quality matters and latency does not.
const stream = client.messages.stream({
  model: 'claude-sonnet-5',
  max_tokens: 24000,
  messages: [{
    role: 'user',
    content: [
      { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdf } },
      { type: 'text', text: INSTRUCTIONS },
    ],
  }],
})
const msg = await stream.finalMessage()
const text = (msg.content.find((b) => b.type === 'text') || {}).text || ''
const u = msg.usage
console.log(`  ${u.input_tokens} in / ${u.output_tokens} out  ->  $${((u.input_tokens / 1e6) * 2 + (u.output_tokens / 1e6) * 10).toFixed(3)}  (stop: ${msg.stop_reason})`)

let parsed
try { parsed = JSON.parse(text.replace(/```json|```/g, '').trim()) } catch {
  console.error('could not parse the response as JSON:\n' + text.slice(0, 600)); process.exit(1)
}
const list = parsed.conditions || []
console.log(`\n${list.length} draft condition(s):\n`)

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const render = (c) => `---
region: ${regionKey}
id: ${c.id}
name: ${c.name}
clin: ${c.clin || ''}
# DRAFT extracted from: ${c.source || path.basename(pdfPath)}
# Reviewed by: (add your name once you have checked every line)
pointers:
${Object.entries(c.pointers || {}).map(([k, v]) => `  "${k}": ${v}`).join('\n')}
---

## blurb
${c.blurb}

## noticed
${(c.noticed || []).map((s) => `- ${s}`).join('\n')}

## homeCare
${(c.homeCare || []).map((s) => `- ${s}`).join('\n')}

## seePhysioIf
${(c.seePhysioIf || []).map((s) => `- ${s}`).join('\n')}
`

// Check every pointer against the real options before anything is written.
const labels = allQuestions(region).flatMap((q) => (q.options || []).map((o) => o.label))
for (const c of list) {
  const bad = Object.keys(c.pointers || {}).filter(
    (t) => !labels.some((l) => l.toLowerCase().includes(t.toLowerCase())))
  console.log(`${c.id.padEnd(12)} ${c.name}`)
  console.log(`   clin      : ${c.clin}`)
  console.log(`   pointers  : ${Object.entries(c.pointers || {}).map(([k, v]) => `"${k}"=${v}`).join('  ')}`)
  if (bad.length) console.log(`   !! UNMATCHED POINTER(S), import would fail: ${bad.map((b) => `"${b}"`).join(', ')}`)
  console.log(`   blurb     : ${c.blurb}`)
  console.log()
  if (WRITE) {
    const out = path.join('content/conditions', `${regionKey}-${slug(c.id)}.md`)
    fs.writeFileSync(out, render(c))
    console.log(`   written -> ${out}\n`)
  }
}
if (!WRITE) console.log('(dry run — re-run with --write to save these to content/conditions/)')
