// Vercel serverless function — the production twin of the Express
// /api/pain-questions route in server/index.js. The frontend's
// fetch('/api/pain-questions') works unchanged (same origin, no CORS), and
// the API key stays on the server side.
import Anthropic from '@anthropic-ai/sdk'

const API_KEY = (process.env.ANTHROPIC_API_KEY || '').trim().replace(/^["']|["']$/g, '')

function hasValidKey() {
  return (
    API_KEY.startsWith('sk-ant-') &&
    API_KEY.length > 30 &&
    !API_KEY.includes('PASTE') &&
    !API_KEY.includes('xxxx')
  )
}

function questionPrompt(zones) {
  return `A visitor to a physiotherapy education website (Physio Chandra, a Registered Physiotherapist in BC, Canada) traced their pain on a 3D body. The traced line passed through these areas, in order: ${zones.join(' -> ')}.

Write the intake questions a physiotherapist would ask about THIS pattern AS A WHOLE — pain travelling from ${zones[0]} toward ${zones[zones.length - 1]} — never about one area on its own.

Rules:
- Exactly 4 multiple-choice questions, together covering: how it started; how the pain behaves or travels between these areas; what makes it worse; what eases it or how it changes through the day.
- Plain, warm language a 12-year-old could read. Each question under 14 words. Give 4 or 5 short options each (under 8 words). Visitors can select MORE THAN ONE option, so write options that can sensibly be combined; include "Not sure" where it fits.
- These are educational questions, never a diagnosis: no disease names inside the questions, no alarming wording, no emergency or red-flag symptoms (fever, saddle numbness, bladder or bowel changes, chest pain — the site runs its own separate safety check), and no medication questions.

Respond ONLY with valid JSON, no markdown, exactly: {"questions":[{"text":"...","options":["...","..."]}]}`
}

// Anything the model writes is checked before it reaches a visitor: shape,
// length, and a blocklist for content the questions must never contain.
const BANNED_IN_QUESTIONS = /(cancer|tumou?r|fracture|emergency|bladder|bowel|fever|saddle|diagnos|medicat|drug|opioid|guarantee)/i
function cleanQuestions(parsed) {
  if (!parsed || !Array.isArray(parsed.questions)) return null
  const out = parsed.questions
    .filter((q) => q && typeof q.text === 'string' && Array.isArray(q.options) && q.options.length >= 3)
    .filter((q) => !BANNED_IN_QUESTIONS.test(q.text + ' ' + q.options.join(' ')))
    .slice(0, 5)
    .map((q) => ({
      text: q.text.slice(0, 140),
      options: q.options.slice(0, 6).map((o) => String(o).slice(0, 70)),
    }))
  return out.length >= 3 ? out : null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { zones } = req.body || {}
  if (!Array.isArray(zones) || zones.length === 0) {
    return res.status(400).json({ error: 'zones must be a non-empty array of body area labels' })
  }

  // No usable key → tell the client to use its built-in clinician-authored
  // question sets instead of erroring.
  if (!hasValidKey()) {
    return res.status(200).json({ questions: null, fallback: true })
  }

  try {
    const anthropic = new Anthropic({ apiKey: API_KEY })
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
      messages: [{ role: 'user', content: questionPrompt(zones.map(String)) }],
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