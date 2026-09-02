/* Vercel serverless function → served at /api/pain-analysis.
   (The previous version of this file was accidentally a copy of the whole
   Express server — app.listen() and all — which Vercel cannot run, so the
   analysis endpoint failed in production. This is the real handler.)

   Grounding fix: the approved condition records for the crossed regions are
   retrieved and injected into the prompt, so the overview is built from
   Chandra's approved content. If the records don't cover the pattern, the
   prompt instructs Claude to say so and route to an assessment instead of
   inventing specifics; any malformed output falls back to fixed safe content. */
import Anthropic from '@anthropic-ai/sdk'
import {
  getApiKey,
  hasValidKey,
  parseZones,
  analysisKnowledge,
  analysisPrompt,
  sanitizeAnalysis,
  fallbackAnalysis,
} from './_lib/painShared.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { zones, answers, notes } = req.body || {}
  const { labels, regionKeys } = parseZones(zones)
  if (!labels.length) {
    return res.status(400).json({ error: 'zones must be a non-empty array of body areas' })
  }

  // No usable key → serve the fixed fallback rather than erroring out.
  const API_KEY = getApiKey()
  if (!hasValidKey(API_KEY)) {
    return res.status(200).json(fallbackAnalysis(labels))
  }

  try {
    const anthropic = new Anthropic({ apiKey: API_KEY })
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
    return res.status(200).json(sanitizeAnalysis(parsed, labels))
  } catch (err) {
    console.error('pain-analysis error:', err?.status || '', err?.message || err)
    // Don't 500 the user experience — degrade gracefully.
    return res.status(200).json(fallbackAnalysis(labels))
  }
}
