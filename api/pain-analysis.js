// Vercel serverless function — replaces the Express /server backend in production.
// Lives at /api/pain-analysis, so the frontend's existing fetch('/api/pain-analysis')
// works unchanged (same origin, no CORS). Your API key stays on the server side.
import Anthropic from '@anthropic-ai/sdk'

const API_KEY = process.env.ANTHROPIC_API_KEY

function hasValidKey() {
  return (
    typeof API_KEY === 'string' &&
    API_KEY.startsWith('sk-ant-') &&
    API_KEY.length > 30 &&
    !API_KEY.includes('PASTE') &&
    !API_KEY.includes('xxxx')
  )
}

// Safe, generic fallback so the panel always shows useful content even if the
// AI call fails or the key isn't set.
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { zones } = req.body || {}
  if (!Array.isArray(zones) || zones.length === 0) {
    return res.status(400).json({ error: 'zones must be a non-empty array of body area labels' })
  }

  if (!hasValidKey()) {
    return res.status(200).json(fallbackAnalysis(zones))
  }

  try {
    const anthropic = new Anthropic({ apiKey: API_KEY })

    const prompt = `A user traced a line across a body diagram passing through these areas, in order: ${zones.join(' -> ')}.

You are giving general physiotherapy education content for a clinic website (Physio Chandra). This is NOT a diagnosis. Based on this pain pattern, respond ONLY with valid JSON (no markdown, no preamble) in exactly this shape:

{
  "possibleCauses": ["...", "..."],
  "commonSymptoms": ["...", "..."],
  "suggestedApproach": ["...", "..."],
  "disclaimer": "..."
}

Keep each array to 3-5 short bullet points written in plain, reassuring language for a patient (not clinical jargon). The disclaimer should make clear this is general information and recommend booking an in-person assessment.`

    // Using Sonnet; switch to 'claude-haiku-4-5-20251001' to cut cost for this short task.
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
      parsed = fallbackAnalysis(zones)
    }

    return res.status(200).json(parsed)
  } catch (err) {
    console.error('pain-analysis error:', err?.message || err)
    return res.status(200).json(fallbackAnalysis(zones))
  }
}
