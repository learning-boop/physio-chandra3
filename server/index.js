import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
const PORT = process.env.PORT || 4000
const API_KEY = process.env.ANTHROPIC_API_KEY

// A usable key starts with "sk-ant-", is a real length, and isn't the template
// placeholder. Anything else means analysis will use the safe fallback content.
function hasValidKey() {
  return (
    typeof API_KEY === 'string' &&
    API_KEY.startsWith('sk-ant-') &&
    API_KEY.length > 30 &&
    !API_KEY.includes('PASTE') &&
    !API_KEY.includes('xxxx')
  )
}

// ─── Startup sanity check on the API key ─────────────────────────────────────
// If it's missing, malformed (e.g. the VITE_API_URL value accidentally glued
// onto it), or still the placeholder, warn loudly so it's obvious what to fix.
if (!hasValidKey()) {
  console.warn(
    '\n[WARN] ANTHROPIC_API_KEY is missing, malformed, or still the placeholder.\n' +
    '       It must be a single value starting with "sk-ant-".\n' +
    '       Set it in server/.env. AI analysis will fall back to general content until fixed.\n'
  )
}

app.use(cors()) // for production, restrict to your site: cors({ origin: 'https://physiochandra.com' })
app.use(express.json())

const anthropic = new Anthropic({ apiKey: API_KEY })

// Safe, generic fallback used when the model can't be reached or the key is bad,
// so the panel always shows something useful instead of an error.
function fallbackAnalysis(zones) {
  const areas = Array.isArray(zones) && zones.length ? zones.join(', ') : 'the traced areas'
  return {
    fallback: true,
    possibleCauses: [
      `Muscle tension or strain affecting ${areas}`,
      'Joint stiffness or reduced mobility in the region',
      'Postural overload from repetitive movements or prolonged sitting',
      'Irritation of nearby nerves referring pain along the path',
    ],
    commonSymptoms: [
      'Aching, tightness, or stiffness that moves along the area',
      'Discomfort that worsens with certain positions or activity',
      'Reduced range of motion or a feeling of weakness',
    ],
    suggestedApproach: [
      'Gentle movement and activity modification to avoid aggravation',
      'Targeted stretching and strengthening guided by a physiotherapist',
      'A hands-on assessment to pinpoint the source and build a plan',
    ],
    disclaimer:
      'This is general information, not a diagnosis. Please book an assessment with Physio Chandra for a proper, personalised evaluation.',
  }
}

app.post('/api/pain-analysis', async (req, res) => {
  const { zones } = req.body

  if (!Array.isArray(zones) || zones.length === 0) {
    return res.status(400).json({ error: 'zones must be a non-empty array of body area labels' })
  }

  // No usable key -> serve the fallback rather than erroring out.
  if (!hasValidKey()) {
    return res.json(fallbackAnalysis(zones))
  }

  try {
    const prompt = `A user traced a line across a body diagram passing through these areas, in order: ${zones.join(' -> ')}.

You are giving general physiotherapy education content for a clinic website (Physio Chandra). This is NOT a diagnosis. Based on this pain pattern, respond ONLY with valid JSON (no markdown, no preamble) in exactly this shape:

{
  "possibleCauses": ["...", "..."],
  "commonSymptoms": ["...", "..."],
  "suggestedApproach": ["...", "..."],
  "disclaimer": "..."
}

Keep each array to 3-5 short bullet points written in plain, reassuring language for a patient (not clinical jargon). The disclaimer should make clear this is general information and recommend booking an in-person assessment.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    const raw = textBlock ? textBlock.text : '{}'
    const cleaned = raw.replace(/```json|```/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      // Model didn't return clean JSON — use the safe fallback.
      parsed = fallbackAnalysis(zones)
    }

    res.json(parsed)
  } catch (err) {
    console.error('pain-analysis error:', err?.message || err)
    // Don't 500 the user experience — degrade gracefully.
    res.json(fallbackAnalysis(zones))
  }
})

app.get('/health', (req, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`Pain AI server running on http://localhost:${PORT}`)
})
