/* Verifies the Sonnet 5 migration end to end: same prompts the app sends,
   same request params, and the response must still parse as the JSON the
   routes expect. Makes two real API calls.
   Run: node --env-file=server/.env scripts/verify-model.mjs */
import Anthropic from '@anthropic-ai/sdk'
import {
  getApiKey, parseZones,
  questionKnowledge, questionPrompt, cleanQuestions,
  analysisKnowledge, analysisPrompt, sanitizeAnalysis,
} from '../api/_lib/painShared.js'

const client = new Anthropic({ apiKey: getApiKey() })
const MODEL = process.argv[2] || 'claude-sonnet-5'
const OLD = MODEL === 'claude-sonnet-4-6'
const CAPS = OLD ? [700, 800] : [1000, 1150]
const PRICE = OLD ? { in: 3, out: 15 } : { in: 2, out: 10 }
const zones = [{ type: 'neck', label: 'Neck' }, { type: 'shoulder', label: 'Right Shoulder' }]
const { labels, regionKeys } = parseZones(zones)
const answers = [
  { q: 'How did it start?', a: 'Built up from lots of desk or screen time' },
  { q: 'What makes it worse?', a: 'Turning or tilting my head' },
]

const call = async (prompt, maxTokens) => {
  const r = await client.messages.create({
    model: MODEL,
    ...(OLD ? {} : { thinking: { type: 'disabled' } }),   // 4.6 runs thinking-off by omission
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  })
  const text = (r.content.find((b) => b.type === 'text') || {}).text || '{}'
  let parsed = null
  try { parsed = JSON.parse(text.replace(/```json|```/g, '').trim()) } catch { parsed = null }
  return { r, text, parsed }
}

console.log(`model ${MODEL}, thinking disabled\n`)

const q = await call(questionPrompt(labels, questionKnowledge(regionKeys)), CAPS[0])
const questions = cleanQuestions(q.parsed)
console.log('QUESTIONS ROUTE')
console.log(`  stop_reason      : ${q.r.stop_reason}   ${q.r.stop_reason === 'max_tokens' ? '<-- TRUNCATED' : 'OK'}`)
console.log(`  tokens           : ${q.r.usage.input_tokens} in / ${q.r.usage.output_tokens} out  (cap ${CAPS[0]})`)
console.log(`  JSON parsed      : ${q.parsed ? 'yes' : 'NO'}`)
console.log(`  passes validation: ${questions ? questions.length + ' questions' : 'NO - route would fall back'}`)
if (questions) console.log(`  first question   : ${questions[0].text}`)

const a = await call(analysisPrompt(labels, answers, '', analysisKnowledge(regionKeys)), CAPS[1])
const analysis = sanitizeAnalysis(a.parsed, labels)
console.log('\nANALYSIS ROUTE')
console.log(`  stop_reason      : ${a.r.stop_reason}   ${a.r.stop_reason === 'max_tokens' ? '<-- TRUNCATED' : 'OK'}`)
console.log(`  tokens           : ${a.r.usage.input_tokens} in / ${a.r.usage.output_tokens} out  (cap ${CAPS[1]})`)
console.log(`  JSON parsed      : ${a.parsed ? 'yes' : 'NO'}`)
console.log(`  sanitised output : ${analysis ? Object.keys(analysis).join(', ') : 'NO'}`)

// real cost of this one visitor, at Sonnet 5 rates
const cost = ((q.r.usage.input_tokens + a.r.usage.input_tokens) / 1e6) * PRICE.in
  + ((q.r.usage.output_tokens + a.r.usage.output_tokens) / 1e6) * PRICE.out
console.log(`\nMEASURED cost for this 2-area visitor: $${cost.toFixed(5)}  ->  $${(cost * 1000).toFixed(2)} per 1,000`)
