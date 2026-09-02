/* Express backend (local dev + the EC2/Nginx or cPanel deployment).
   All prompts, retrieval, and validation live in ../api/_lib/painShared.js —
   the SAME module the Vercel functions use — so the two backends can never
   drift apart. This server is just the Express wiring around it. */
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'
import {
  getApiKey,
  hasValidKey,
  parseZones,
  questionKnowledge,
  questionPrompt,
  cleanQuestions,
  analysisKnowledge,
  analysisPrompt,
  sanitizeAnalysis,
  fallbackAnalysis,
} from '../api/_lib/painShared.js'

const app = express()
const PORT = process.env.PORT || 4000
const API_KEY = getApiKey()

// ─── Startup sanity check on the API key ─────────────────────────────────────
// If it's missing, malformed (e.g. the VITE_API_URL value accidentally glued
// onto it), or still the placeholder, warn loudly so it's obvious what to fix.
if (!hasValidKey(API_KEY)) {
  console.warn(
    '\n[WARN] ANTHROPIC_API_KEY is missing, malformed, or still the placeholder.\n' +
    '       It must be a single value starting with "sk-ant-".\n' +
    '       Set it in server/.env. AI analysis will fall back to general content until fixed.\n'
  )
}

app.use(cors()) // for production, restrict to your site: cors({ origin: 'https://physiochandra.com' })
app.use(express.json())

const anthropic = new Anthropic({ apiKey: API_KEY })

// ─── Pattern questions ───────────────────────────────────────────────────────
// A line traced across areas is ONE travelling pattern; the questions cover
// the whole path. The approved condition records for the crossed regions are
// retrieved and injected into the prompt, so the questions probe exactly the
// features Chandra's data uses to tell those patterns apart.
app.post('/api/pain-questions', async (req, res) => {
  const { labels, regionKeys } = parseZones((req.body || {}).zones)
  if (!labels.length) {
    return res.status(400).json({ error: 'zones must be a non-empty array of body areas' })
  }
  // No usable key → tell the client to use its built-in clinician-authored
  // question sets instead of erroring.
  if (!hasValidKey(API_KEY)) return res.json({ questions: null, fallback: true })
  try {
    const knowledge = questionKnowledge(regionKeys)
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      // Sonnet 5 runs adaptive thinking when `thinking` is omitted (Sonnet 4.6
      // ran thinking-off), and max_tokens caps thinking + text together — so
      // omitting it here would spend the budget on reasoning and truncate the
      // JSON. This task is structured extraction; it does not need thinking.
      thinking: { type: 'disabled' },
      // Sonnet 5's tokenizer emits ~40% more tokens for the same text, so the
      // old 700 cap would cut the same answer short.
      max_tokens: 1000,
      messages: [{ role: 'user', content: questionPrompt(labels, knowledge) }],
    })
    const textBlock = response.content.find((b) => b.type === 'text')
    const raw = textBlock ? textBlock.text : '{}'
    let parsed = null
    try { parsed = JSON.parse(raw.replace(/```json|```/g, '').trim()) } catch { parsed = null }
    const questions = cleanQuestions(parsed)
    res.json(questions ? { questions } : { questions: null, fallback: true })
  } catch (err) {
    console.error('pain-questions error:', err?.message || err)
    res.json({ questions: null, fallback: true })
  }
})

// ─── Pattern analysis ────────────────────────────────────────────────────────
// Grounded in the retrieved records; honest when they don't cover the pattern;
// shape-checked before anything reaches a visitor; fixed fallback on failure.
app.post('/api/pain-analysis', async (req, res) => {
  const { zones, answers, notes } = req.body || {}
  const { labels, regionKeys } = parseZones(zones)
  if (!labels.length) {
    return res.status(400).json({ error: 'zones must be a non-empty array of body areas' })
  }
  // No usable key -> serve the fallback rather than erroring out.
  if (!hasValidKey(API_KEY)) return res.json(fallbackAnalysis(labels))
  try {
    const knowledge = analysisKnowledge(regionKeys)
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      // See the questions route: thinking is on by default on Sonnet 5 and
      // shares the max_tokens budget with the response.
      thinking: { type: 'disabled' },
      max_tokens: 1150,   // ~40% headroom for Sonnet 5's tokenizer
      messages: [{ role: 'user', content: analysisPrompt(labels, answers, notes, knowledge) }],
    })
    const textBlock = response.content.find((b) => b.type === 'text')
    const raw = textBlock ? textBlock.text : '{}'
    let parsed = null
    try { parsed = JSON.parse(raw.replace(/```json|```/g, '').trim()) } catch { parsed = null }
    res.json(sanitizeAnalysis(parsed, labels))
  } catch (err) {
    console.error('pain-analysis error:', err?.message || err)
    // Don't 500 the user experience — degrade gracefully.
    res.json(fallbackAnalysis(labels))
  }
})

app.get('/health', (req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`Pain AI server running on http://localhost:${PORT}`)
})
