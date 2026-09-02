/* Measures what one visitor actually costs, using the API's own token counter
   (never an offline tokenizer) and the real prompts this app sends.
   Run: node scripts/cost-estimate.mjs */
import {
  getApiKey, parseZones,
  questionKnowledge, questionPrompt,
  analysisKnowledge, analysisPrompt,
} from '../api/_lib/painShared.js'

const MODEL = process.argv[2] || 'claude-sonnet-4-6'
const PRICE = process.argv[2] === 'claude-sonnet-5' ? { in: 2.00, out: 10.00 } : { in: 3.00, out: 15.00 }
const MAX_OUT = { questions: 700, analysis: 800 }

// The installed SDK is 0.32.1, which predates client.messages.countTokens,
// so the count_tokens endpoint is called directly. Still the API's own
// tokenizer — an offline tokenizer would give the wrong number for Claude.
const KEY = getApiKey()
const count = async (text) => {
  const r = await fetch('https://api.anthropic.com/v1/messages/count_tokens', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'user', content: text }] }),
  })
  if (!r.ok) throw new Error(`count_tokens ${r.status}: ${(await r.text()).slice(0, 200)}`)
  return (await r.json()).input_tokens
}

// Representative journeys: how many areas the line crossed drives prompt size.
const CASES = {
  'single area (knee)': [{ type: 'knee', label: 'Right Knee' }],
  'two areas (neck + shoulder)': [
    { type: 'neck', label: 'Neck' }, { type: 'shoulder', label: 'Right Shoulder' }],
  'three areas (low back + hip + knee)': [
    { type: 'lowback', label: 'Lower Back' }, { type: 'hip', label: 'Left Hip' },
    { type: 'knee', label: 'Left Knee' }],
}
const ANSWERS = [
  { q: 'When did it begin?', a: 'Between one and six weeks ago' },
  { q: 'What makes it worse?', a: 'Bending forward; Sitting for a long time' },
  { q: 'How would you describe it?', a: 'A deep ache' },
  { q: 'Does it travel?', a: 'Into the buttock' },
  { q: 'How is it changing?', a: 'Slowly improving' },
]
const NOTES = 'It started after a long drive and is worse first thing in the morning.'

console.log(`model ${MODEL}   input $${PRICE.in}/MTok   output $${PRICE.out}/MTok\n`)
const rows = []
for (const [name, zones] of Object.entries(CASES)) {
  const { labels, regionKeys } = parseZones(zones)
  const qIn = await count(questionPrompt(labels, questionKnowledge(regionKeys)))
  const aIn = await count(analysisPrompt(labels, ANSWERS, NOTES, analysisKnowledge(regionKeys)))
  const multi = labels.length > 1                 // questions call only fires for multi-area
  const inTok = (multi ? qIn : 0) + aIn
  const outTok = (multi ? MAX_OUT.questions : 0) + MAX_OUT.analysis
  const cost = (inTok / 1e6) * PRICE.in + (outTok / 1e6) * PRICE.out
  rows.push({ name, qIn: multi ? qIn : 0, aIn, inTok, outTok, cost })
  console.log(`${name}`)
  console.log(`  questions prompt : ${multi ? qIn + ' in' : 'not called (single area uses the authored set)'}`)
  console.log(`  analysis prompt  : ${aIn} in`)
  console.log(`  worst-case out   : ${outTok} (both calls at their max_tokens cap)`)
  console.log(`  cost per visitor : $${cost.toFixed(5)}`)
  console.log(`  per 1,000        : $${(cost * 1000).toFixed(2)}\n`)
}
const worst = rows.reduce((a, b) => (b.cost > a.cost ? b : a))
const best = rows.reduce((a, b) => (b.cost < a.cost ? b : a))
console.log(`RANGE for 1,000 completed assessments: $${(best.cost * 1000).toFixed(2)} - $${(worst.cost * 1000).toFixed(2)}
`)

// Same measured tokens, priced on every model worth considering here.
const MODELS = [
  ['claude-opus-5', 5.00, 25.00],
  ['claude-sonnet-4-6  (current)', 3.00, 15.00],
  ['claude-sonnet-5', 2.00, 10.00],
  ['claude-haiku-4-5', 1.00, 5.00],
]
console.log('PER 1,000 COMPLETED ASSESSMENTS, by model (worst case: every call hits its max_tokens)')
console.log('model'.padEnd(30) + ['1 area', '2 areas', '3 areas'].map((h) => h.padStart(10)).join(''))
for (const [name, pin, pout] of MODELS) {
  const cells = rows.map((r) => ((r.inTok / 1e6) * pin + (r.outTok / 1e6) * pout) * 1000)
    .map((v) => ('$' + v.toFixed(2)).padStart(10))
  console.log(name.padEnd(30) + cells.join(''))
}
const two = rows[1]
console.log(`
Where the money goes (2-area visitor, current model):`)
const inCost = (two.inTok / 1e6) * 3, outCost = (two.outTok / 1e6) * 15
console.log(`  input  ${two.inTok} tok  $${(inCost * 1000).toFixed(2)}/1k  (${Math.round(100 * inCost / (inCost + outCost))}%)`)
console.log(`  output ${two.outTok} tok  $${(outCost * 1000).toFixed(2)}/1k  (${Math.round(100 * outCost / (inCost + outCost))}%)`)
