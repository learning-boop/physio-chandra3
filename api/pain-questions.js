/* Vercel serverless function → served at /api/pain-questions.
   (The old file was named api-pain-questions.js, which Vercel served at
   /api/api-pain-questions — a URL the frontend never calls, so pattern
   questions 404'd in production. This file replaces it: DELETE the old one.)

   Relevance fix: before prompting, we retrieve the approved condition
   records for the regions the traced line crossed and hand their telltale
   features to Claude, so the questions probe exactly what Chandra's data
   distinguishes between — not generic pain questions. */
import Anthropic from '@anthropic-ai/sdk'
import {
  getApiKey,
  hasValidKey,
  parseZones,
  questionKnowledge,
  questionPrompt,
  cleanQuestions,
} from './_lib/painShared.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { labels, regionKeys } = parseZones((req.body || {}).zones)
  if (!labels.length) {
    return res.status(400).json({ error: 'zones must be a non-empty array of body areas' })
  }

  // No usable key → tell the client to use its built-in clinician-authored
  // question sets instead of erroring.
  const API_KEY = getApiKey()
  if (!hasValidKey(API_KEY)) {
    return res.status(200).json({ questions: null, fallback: true })
  }

  try {
    const anthropic = new Anthropic({ apiKey: API_KEY })
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
    return res.status(200).json(questions ? { questions } : { questions: null, fallback: true })
  } catch (err) {
    console.error('pain-questions error:', err?.status || '', err?.message || err)
    return res.status(200).json({ questions: null, fallback: true })
  }
}
