/* ─────────────────────────────────────────────────────────────────────────
   ONE module for everything the two backends share, so the Vercel functions
   and the Express server can never drift apart again.

   The important part is the RETRIEVAL: given the zones a visitor traced,
   we look up the approved condition records for those regions (the same
   src/data/symptomGuide.js the app itself uses — one source of truth) and
   inject their telltale features into the prompts. That is what makes the
   AI questions discriminating ("worse on the first steps in the morning?")
   instead of generic, and keeps the analysis grounded in Chandra's approved
   content instead of invented.

   Files that begin with "_" inside /api are NOT deployed as endpoints by
   Vercel, so this folder is safe for shared code.
   ───────────────────────────────────────────────────────────────────────── */
import { REGIONS, ZONE_TO_REGION } from '../../src/data/symptomGuide.js'

/* ── API key ──────────────────────────────────────────────────────────── */
export function getApiKey() {
  return (process.env.ANTHROPIC_API_KEY || '').trim().replace(/^["']|["']$/g, '')
}
export function hasValidKey(key) {
  return (
    typeof key === 'string' &&
    key.startsWith('sk-ant-') &&
    key.length > 30 &&
    !key.includes('PASTE') &&
    !key.includes('xxxx')
  )
}

/* ── Zone → region resolution ─────────────────────────────────────────────
   The frontend now sends { type, label } objects, but plain label strings
   (older clients, manual testing) still resolve via keyword hints. */
const TYPE_HINTS = [
  ['lowerback', ['lower back', 'low back', 'lumbar']],
  ['upperback', ['upper back', 'mid back', 'thoracic']],
  ['neck', ['neck']],
  ['shoulder', ['shoulder']],
  ['elbow', ['elbow', 'forearm']],
  ['wrist', ['wrist', 'hand']],
  ['hip', ['hip', 'groin']],
  ['knee', ['knee']],
  ['ankle', ['ankle', 'foot', 'heel', 'shin']],
  ['chest', ['chest', 'sternum', 'rib']],
  ['abdomen', ['abdomen', 'stomach', 'belly']],
  ['head', ['head', 'jaw']],
]

export function zoneLabel(z) {
  const l = typeof z === 'string' ? z : z && typeof z === 'object' ? z.label : ''
  return String(l || '').slice(0, 40) // cap: labels reach the prompt
}
export function zoneType(z) {
  if (z && typeof z === 'object' && typeof z.type === 'string') return z.type.slice(0, 20)
  const l = zoneLabel(z).toLowerCase()
  for (const [t, hints] of TYPE_HINTS) if (hints.some((h) => l.includes(h))) return t
  return null
}

/** Normalise the request body's zones into safe labels + unique region keys. */
export function parseZones(zones) {
  const list = Array.isArray(zones) ? zones.slice(0, 12) : []
  const labels = list.map(zoneLabel).filter(Boolean)
  const regionKeys = []
  for (const z of list) {
    const k = ZONE_TO_REGION[zoneType(z)]
    if (k && REGIONS[k] && !regionKeys.includes(k)) regionKeys.push(k)
  }
  return { labels, regionKeys: regionKeys.slice(0, 3) }
}

/* ── Retrieval: approved records → prompt-sized knowledge blocks ────────── */
const cap = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n)

/** Compact block for QUESTION generation: each condition's telltales. */
export function questionKnowledge(regionKeys) {
  const lines = []
  for (const k of regionKeys) {
    const r = REGIONS[k]
    if (!r) continue
    lines.push(`[${r.name}]`)
    for (const c of (r.conditions || []).slice(0, 8)) {
      const tell = (c.noticed || []).slice(0, 3).map((s) => cap(s, 90)).join('; ')
      if (tell) lines.push(`- ${cap(c.name, 60)}: ${tell}`)
    }
  }
  return lines.join('\n').slice(0, 4500)
}

/** Fuller block for the ANALYSIS: description + telltales + guidance.
    The budget is split PER REGION so a long first region can never truncate
    a later one out of the prompt — every crossed area stays represented. */
export function analysisKnowledge(regionKeys) {
  const keys = regionKeys.filter((k) => REGIONS[k])
  if (!keys.length) return ''
  const perRegion = Math.floor(7000 / keys.length)
  const blocks = []
  for (const k of keys) {
    const r = REGIONS[k]
    const parts = [`[${r.name}]`]
    for (const c of (r.conditions || []).slice(0, 7)) {
      parts.push(
        `• ${cap(c.name, 60)}${c.clin ? ` (${cap(c.clin, 60)})` : ''}\n` +
          `  What it is: ${cap(c.blurb, 200)}\n` +
          `  People notice: ${(c.noticed || []).slice(0, 3).map((s) => cap(s, 85)).join('; ')}\n` +
          `  Home care: ${(c.homeCare || []).slice(0, 3).map((s) => cap(s, 85)).join('; ')}\n` +
          `  See a physio if: ${(c.seePhysioIf || []).slice(0, 2).map((s) => cap(s, 85)).join('; ')}`
      )
    }
    // Trim on condition boundaries, never mid-record.
    let block = ''
    for (const p of parts) {
      if (block.length + p.length + 1 > perRegion) break
      block += (block ? '\n' : '') + p
    }
    blocks.push(block)
  }
  return blocks.join('\n')
}

/* ── Prompts ─────────────────────────────────────────────────────────────
   The knowledge block is what fixes "irrelevant questions": Claude is told
   to ask ONLY things that help separate the approved patterns for these
   exact areas, so the discriminating detail in Chandra's records ("first
   steps in the morning", "eases leaning on a shopping cart") is what gets
   asked about. */
export function questionPrompt(labels, knowledge) {
  const kb = knowledge
    ? `\n\nApproved clinical notes from the clinic's physiotherapist for the areas crossed — these are the ONLY patterns this website educates about:\n${knowledge}\n\nBase the questions on these notes: after the opening "how did it start?" question, every question must probe a feature that helps tell the patterns above apart for THIS traced path — the specific timings, movements, or positions the notes mention (for example, if a note says pain is worst on the first steps of the morning, ask about first steps in the morning). Do not ask about anything the notes never mention. Never name a condition or use clinical terms from the notes inside a question or option.`
    : ''
  return `A visitor to a physiotherapy education website (Physio Chandra, a Registered Physiotherapist in BC, Canada) traced their pain on a 3D body. The traced line passed through these areas, in order: ${labels.join(' -> ')}.

Write the intake questions a physiotherapist would ask about THIS pattern AS A WHOLE — pain travelling from ${labels[0]} toward ${labels[labels.length - 1]} — never about one area on its own.${kb}

Rules:
- Exactly 4 multiple-choice questions, together covering: how it started; how the pain behaves or travels between these areas; what makes it worse; what eases it or how it changes through the day.
- Plain, warm language a 12-year-old could read. Each question under 14 words. Give 4 or 5 short options each (under 8 words). Visitors can select MORE THAN ONE option, so write options that can sensibly be combined; include "Not sure" where it fits.
- These are educational questions, never a diagnosis: no disease names inside the questions, no alarming wording, no emergency or red-flag symptoms (fever, saddle numbness, bladder or bowel changes, chest pain — the site runs its own separate safety check), and no medication questions.

Respond ONLY with valid JSON, no markdown, exactly: {"questions":[{"text":"...","options":["...","..."]}]}`
}

/** Visitor Q&A → prompt section, hard length caps so a hostile client can't stuff the prompt. */
export function answersBlock(answers, notes) {
  const qa = Array.isArray(answers)
    ? answers
        .slice(0, 12)
        .filter((p) => p && typeof p.question === 'string' && typeof p.answer === 'string')
        .map((p) => `Q: ${p.question.slice(0, 160)}\nA: ${p.answer.slice(0, 160)}`)
        .join('\n')
    : ''
  const note =
    typeof notes === 'string' && notes.trim()
      ? `\nThe visitor added in their own words: "${notes.trim().slice(0, 400)}"`
      : ''
  if (!qa && !note) return ''
  return `\n\nThe visitor then answered these questions about the pattern:\n${qa}${note}\n\nTailor every list to BOTH the traced path and these answers — reflect what they said about how it started, how it behaves or travels, and what worsens or eases it.`
}

export function analysisPrompt(labels, answers, notes, knowledge) {
  const kb = knowledge
    ? `\n\nApproved clinical notes from the clinic's physiotherapist for the areas crossed:\n${knowledge}\n\nGround every list in these notes. When the traced path and the visitor's answers match one of the patterns above, word "possibleCauses" around that pattern (its name in plain words), take "commonSymptoms" from what the notes say people notice, and take "suggestedApproach" from the notes' home-care and see-a-physio guidance — reworded warmly, never as copied clinical jargon. If NONE of the notes fit this pattern, keep every list general, do not invent specifics, and make the disclaimer say plainly that this guide does not specifically cover this pattern, so booking an in-person assessment is the right next step.`
    : ''
  return `A user traced a line across a body diagram passing through these areas, in order: ${labels.join(' -> ')}.${answersBlock(answers, notes)}${kb}

You are giving general physiotherapy education content for a clinic website (Physio Chandra). This is NOT a diagnosis. Based on this pain pattern, respond ONLY with valid JSON (no markdown, no preamble) in exactly this shape:

{
  "possibleCauses": ["...", "..."],
  "commonSymptoms": ["...", "..."],
  "suggestedApproach": ["...", "..."],
  "disclaimer": "..."
}

"possibleCauses" must contain EXACTLY 3 items — the three explanations that best fit THIS pattern and THESE answers — each written as a possibility ("could be…", "may be…", "is sometimes linked to…"), never as a statement of what the person has. Keep the other arrays to 3-4 short bullet points, all in plain, reassuring language for a patient (not clinical jargon). The disclaimer should make clear this is general information and recommend booking an in-person assessment.`
}

/* ── Output validation: nothing the model writes reaches a visitor raw ─── */
export const BANNED_IN_QUESTIONS =
  /(cancer|tumou?r|fracture|emergency|bladder|bowel|fever|saddle|diagnos|medicat|drug|opioid|guarantee)/i

export function cleanQuestions(parsed) {
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

/** Safe, generic content when the model can't be reached — never an error page. */
export function fallbackAnalysis(labels) {
  const areas = labels && labels.length ? labels.join(', ') : 'the traced areas'
  return {
    fallback: true,
    possibleCauses: [
      `Muscle tension or strain could be affecting ${areas}`,
      'Joint stiffness or reduced mobility may be contributing in this region',
      'Postural load from repetitive movements or long sitting is sometimes linked to pain like this',
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

/** Shape-check the model's analysis JSON; anything off → the safe fallback. */
export function sanitizeAnalysis(parsed, labels) {
  const arr = (v, n) =>
    Array.isArray(v) ? v.filter((x) => typeof x === 'string').map((x) => x.slice(0, 240)).slice(0, n) : []
  if (!parsed || typeof parsed !== 'object') return fallbackAnalysis(labels)
  const out = {
    possibleCauses: arr(parsed.possibleCauses, 3),
    commonSymptoms: arr(parsed.commonSymptoms, 5),
    suggestedApproach: arr(parsed.suggestedApproach, 5),
    disclaimer:
      typeof parsed.disclaimer === 'string' && parsed.disclaimer.trim()
        ? parsed.disclaimer.slice(0, 400)
        : fallbackAnalysis(labels).disclaimer,
  }
  if (!out.possibleCauses.length || !out.commonSymptoms.length || !out.suggestedApproach.length) {
    return fallbackAnalysis(labels)
  }
  return out
}
