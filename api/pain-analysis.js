// Vercel serverless function — replaces the Express /server backend in production.
// Lives at /api/pain-analysis, so the frontend's existing fetch('/api/pain-analysis')
// works unchanged (same origin, no CORS). Your API key stays on the server side.
import Anthropic from '@anthropic-ai/sdk'

// Trimmed, and stripped of wrapping quotes: pasting a key into a dashboard
// field often carries a trailing newline or the quotes from a .env line, and
// either one makes an otherwise-valid key fail.
const API_KEY = (process.env.ANTHROPIC_API_KEY || '').trim().replace(/^["']|["']$/g, '')

function hasValidKey() {
  return (
    API_KEY.startsWith('sk-ant-') &&
    API_KEY.length > 30 &&
    !API_KEY.includes('PASTE') &&
    !API_KEY.includes('xxxx')
  )
}

// Safe, generic fallback so the panel always shows useful content even if the
// AI call fails or the key isn't set. Wording follows the same CHCPBC rules as
// the prompt: hedged, no diagnosis, no guaranteed outcomes, calm tone.
function fallbackAnalysis(zones, reason = 'unknown') {
  const areas = Array.isArray(zones) && zones.length ? zones.join(', ') : 'the traced areas'
  return {
    fallback: true,
    // Diagnostic only — a short code, never the key or its contents.
    reason,
    keyPresent: API_KEY.length > 0,
    possibleCauses: [
      `Muscle tension or strain may affect ${areas}`,
      'Joint stiffness or reduced mobility can contribute in this region',
      'Postural load from repetitive movements or prolonged sitting is often associated with discomfort here',
      'Nearby nerves can sometimes refer sensations along this path',
    ],
    commonSymptoms: [
      'Aching, tightness, or stiffness in the area',
      'Discomfort that may change with certain positions or activity',
      'Reduced range of motion, or the area feeling weaker than usual',
    ],
    suggestedApproach: [
      'Gentle movement and adjusting activity that aggravates the area',
      'Stretching and strengthening appropriate to the individual, guided by a physiotherapist',
      'An individual assessment to better understand what may be contributing',
    ],
    disclaimer:
      'This is general education only, not a diagnosis, and no particular outcome is implied or guaranteed. For advice specific to you, an individual assessment with a physiotherapist is the appropriate next step.',
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
    return res.status(200).json(fallbackAnalysis(zones, API_KEY ? 'key-malformed' : 'key-missing'))
  }

  try {
    const anthropic = new Anthropic({ apiKey: API_KEY })

    // The prompt enforces the CHCPBC Practice Standard "Marketing, Advertising,
    // and Promotion" (effective 1 Apr 2026). The licensee is responsible for ALL
    // content published on their behalf — including anything generated here — so
    // these constraints are not optional.
    const prompt = `A user traced a line across a body diagram passing through these areas, in order: ${zones.join(' -> ')}.

You are writing general physiotherapy education content for the website of a physiotherapist registered in British Columbia, Canada (Physio Chandra). This is NOT a diagnosis.

This content is published on a regulated health professional's website and MUST follow these rules:
- Accurate, honest, and consistent with current evidence-informed physiotherapy practice.
- NO diagnosis, and no claim to identify the cause of the person's symptoms. Use hedged language ("may", "can sometimes", "is often associated with").
- NO guarantees, promises, or implied outcomes (never state or imply that treatment will fix, cure, resolve, or eliminate pain, or how quickly).
- NO sensational, alarming, or fear-based language. Do not warn of dire consequences or urge urgency. Keep the tone calm, neutral, and supportive.
- Stay strictly within the physiotherapy scope of practice. Do not name medications, order imaging, or speculate about serious pathology.
- Do not claim superiority over other providers or treatments.
- Do not offer free services or inducements.

Respond ONLY with valid JSON (no markdown, no preamble) in exactly this shape:

{
  "possibleCauses": ["...", "..."],
  "commonSymptoms": ["...", "..."],
  "suggestedApproach": ["...", "..."],
  "disclaimer": "..."
}

Keep each array to 3-5 short bullet points in plain, patient-friendly language (not clinical jargon). "suggestedApproach" must describe general approaches a physiotherapist might consider, phrased as possibilities rather than a prescribed plan or promised result. The disclaimer must state that this is general education only, not a diagnosis, and that an individual assessment is the appropriate next step for advice specific to them.`

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
      parsed = fallbackAnalysis(zones, 'bad-json-from-model')
    }

    return res.status(200).json(parsed)
  } catch (err) {
    // Log the full error to the Vercel function log; return only a short code.
    console.error('pain-analysis error:', err?.status || '', err?.message || err)
    const code = err?.status === 401 ? 'api-401-bad-key'
      : err?.status === 400 ? 'api-400-bad-request'
      : err?.status === 429 ? 'api-429-rate-or-credit'
      : err?.status ? `api-${err.status}` : 'api-call-failed'
    return res.status(200).json(fallbackAnalysis(zones, code))
  }
}