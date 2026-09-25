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

   The analysis also receives the conditions the app's scoring engine MATCHED
   from the answers. The overview explains exactly those, in that order, so
   the results page gives one answer instead of two lists that can disagree.

   Files that begin with "_" inside /api are NOT deployed as endpoints by
   Vercel, so this folder is safe for shared code.
   ───────────────────────────────────────────────────────────────────────── */
import { REGIONS, ZONE_TO_REGION } from '../../src/data/symptomGuide.js'
import { organsFor, NOT_MSK_SIGNS } from '../../src/data/referralMap.js'

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
  ['jaw', ['jaw', 'tmj', 'cheek']],
  ['coccyx', ['tailbone', 'coccyx']],
  ['sij', ['back of pelvis', 'buttock', 'sacroiliac']],
  // Before 'lowerback': the label 'Mid-to-Low Back' contains 'low back'.
  ['tlj', ['mid-to-low back', 'thoracolumbar']],
  ['flank', ['below the ribs', 'flank']],
  ['lowerback', ['lower back', 'low back', 'lumbar']],
  ['upperback', ['upper back', 'mid back', 'thoracic']],
  ['ctj', ['base of neck', 'base of the neck', 'cervicothoracic']],
  ['neck', ['neck']],
  ['shoulder', ['shoulder']],
  ['upperarm', ['upper arm', 'biceps', 'triceps']],
  ['forearm', ['forearm']],
  ['elbow', ['elbow']],
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
  // Type + side (from the label, e.g. "Left Shoulder"), for the referral map.
  const drawn = list.map((z) => {
    const t = zoneType(z)
    const l = zoneLabel(z).toLowerCase()
    return t ? { type: t, id: t + (l.startsWith('left') ? 'L' : l.startsWith('right') ? 'R' : '') } : null
  }).filter(Boolean)
  return { labels, regionKeys: regionKeys.slice(0, 3), drawn }
}

/** Organ-referral background for the reasoning pass's medical-concern
    check (Referred Pain Clinical Reference, src/data/referralMap.js). */
export function referralBackground(drawn = []) {
  const organs = organsFor(drawn).slice(0, 10)
  if (!organs.length) return ''
  return `
- Background for the "concern" decision ONLY, from the clinic's referred-pain reference: pain in the drawn areas can also be referred from ${organs.join('; ')}. Signs that point away from a muscle or joint source: ${NOT_MSK_SIGNS.join('; ')}. Raise "concern" when the answers or notes show these signs. Never mention these organs, or any disease, in "concern" or in any other field.`
}

/** The conditions the app's scoring matched, as sent by the client
    ([{ region, id }], strongest first). Each is looked up in REGIONS, so only
    real approved records reach the prompt — never client-supplied text. */
export function parseMatched(matched) {
  const out = []
  if (!Array.isArray(matched)) return out
  for (const m of matched.slice(0, 3)) {
    const r = m && typeof m === 'object' && REGIONS[m.region]
    const c = r && r.conditions.find((x) => x.id === m.id)
    if (c && !out.some((o) => o.c === c)) out.push({ region: m.region, regionName: r.name, c })
  }
  return out
}

/* ── Retrieval: approved records → prompt-sized knowledge blocks ────────── */
const cap = (s, n) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, n)
const firstSentence = (s) => cap(s, 400).split(/(?<=\.)\s/)[0]

/** Budget split PER REGION and trimmed on condition boundaries, so a long
    first region can never push a later one out of the prompt. Every
    condition is offered (they used to be cut at the first 7-8, which hid
    newer knee conditions from the AI entirely); matched ones go first so
    they can never be the ones trimmed. */
function knowledgeBlocks(regionKeys, budget, render, matched = []) {
  const keys = [...regionKeys]
  for (const m of matched) if (!keys.includes(m.region)) keys.push(m.region)
  const live = keys.filter((k) => REGIONS[k])
  if (!live.length) return ''
  const perRegion = Math.floor(budget / live.length)
  const first = new Set(matched.map((m) => m.c))
  return live.map((k) => {
    const r = REGIONS[k]
    const conds = [...(r.conditions || [])].sort((a, b) => first.has(b) - first.has(a))
    let block = `[${r.name}]`
    for (const c of conds) {
      const part = render(c)
      if (!part) continue
      if (block.length + part.length + 1 > perRegion) break
      block += '\n' + part
    }
    return block
  }).join('\n')
}

/** Compact block for QUESTION generation: each condition's telltales. */
export function questionKnowledge(regionKeys) {
  return knowledgeBlocks(regionKeys, 4500, (c) => {
    const tell = (c.noticed || []).slice(0, 3).map((s) => cap(s, 90)).join('; ')
    return tell ? `- ${cap(c.name, 60)}: ${tell}` : ''
  })
}

/** Fuller block for the ANALYSIS: description + telltales + guidance. */
export function analysisKnowledge(regionKeys, matched = []) {
  return knowledgeBlocks(regionKeys, 7000, (c) =>
    `• ${cap(c.name, 60)}${c.clin ? ` (${cap(c.clin, 60)})` : ''}\n` +
    `  What it is: ${cap(c.blurb, 200)}\n` +
    `  People notice: ${(c.noticed || []).slice(0, 3).map((s) => cap(s, 85)).join('; ')}\n` +
    `  Home care: ${(c.homeCare || []).slice(0, 3).map((s) => cap(s, 85)).join('; ')}\n` +
    `  See a physio if: ${(c.seePhysioIf || []).slice(0, 2).map((s) => cap(s, 85)).join('; ')}`,
  matched)
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
        .slice(0, 24)
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

export function analysisPrompt(labels, answers, notes, knowledge, matched = [], background = '') {
  const kb = knowledge ? `\n\nApproved clinical notes from the clinic's physiotherapist for the areas crossed:\n${knowledge}` : ''
  let task = ''
  if (matched.length) {
    const list = matched.map((m, i) => `${i + 1}. ${m.c.name} [${m.regionName}] (id: ${m.c.id})`).join('\n')
    task = `\n\nThe clinic's own scoring has already matched the visitor's answers to these patterns from the notes, strongest first:\n${list}\n\n"possibleCauses" must explain EXACTLY these patterns, in this order — one item per pattern, each an object {"id": "<the id above>", "text": "..."}. The text is one or two short sentences (under 40 words) saying in plain words how the traced path and the visitor's answers fit that pattern, written as a possibility ("could be…", "may be…", "is sometimes linked to…"), never as a statement of what the person has. Do not add, drop, rename or reorder patterns, and do not mention any other condition. Take "commonSymptoms" from what the notes say people notice with these patterns, and "suggestedApproach" from their home-care and see-a-physio guidance — reworded warmly, never as copied clinical jargon.`
  } else {
    task = `\n\nThe clinic's scoring did NOT find a clear match between these answers and any pattern in the notes. Do not name any specific condition. Make "possibleCauses" 3 general, plain-language possibilities (for example muscle, joint or load-related causes) written as possibilities, keep every list general without inventing specifics, and make the disclaimer say plainly that this guide could not match the pattern, so booking an in-person assessment is the right next step.`
  }
  /* ── The reasoning pass ────────────────────────────────────────────────
     Before anything is shown, the model reviews the scoring against the
     WHOLE picture and may reorder or drop the matched patterns, say none of
     them fit, or raise a medical concern. It may never add a pattern, and it
     may never say something is safe — sanitizeReview() enforces both, and the
     red-flag screening has already run in the app before this point. */
  const review = matched.length
    ? `\n\nFIRST, review the clinic's scoring as a physiotherapist would, using everything above — where the pain was drawn, how it travels, how it behaves, what eases it, and how long it has lasted. Return a "review" object:
{"order": ["<ids, best fit first>"], "drop": [{"id": "...", "why": "<short reason this does not fit>"}], "noMatch": false, "concern": null, "note": "<one sentence on your reasoning>"}
Rules for "review":
- "order" may contain ONLY the ids listed above. Never invent or rename an id, and never add a condition that is not listed.
- Drop a pattern only when the answers clearly argue against it; say why in plain words.
- Set "noMatch": true when none of them genuinely fit the picture — an honest "no clear match" is better than a forced answer.
- "concern": set it to {"why": "<one plain sentence>"} ONLY if this picture should be looked at by a physician before physiotherapy (for example it reads as pain referred from an internal organ, or a systemic or inflammatory pattern). Otherwise null. Never state that anything is safe, urgent, or an emergency, and never name a disease.${background}
- Then build "possibleCauses" from the patterns you kept, in YOUR order.`
    : ''
  task += review
  const causesShape = matched.length ? '[{"id": "...", "text": "..."}]' : '["...", "...", "..."]'
  const reviewShape = matched.length
    ? '\n  "review": {"order": ["..."], "drop": [{"id": "...", "why": "..."}], "noMatch": false, "concern": null, "note": "..."},'
    : ''
  return `A user traced a line across a body diagram passing through these areas, in order: ${labels.join(' -> ')}.${answersBlock(answers, notes)}${kb}${task}

You are giving general physiotherapy education content for a clinic website (Physio Chandra). This is NOT a diagnosis. Respond ONLY with valid JSON (no markdown, no preamble) in exactly this shape:

{${reviewShape}
  "possibleCauses": ${causesShape},
  "commonSymptoms": ["...", "..."],
  "suggestedApproach": ["...", "..."],
  "disclaimer": "..."
}

Keep "commonSymptoms" and "suggestedApproach" to 3-4 short bullet points each, all in plain, reassuring language for a patient (not clinical jargon). The disclaimer should make clear this is general information and recommend booking an in-person assessment.`
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

const DISCLAIMER =
  'This is general information, not a diagnosis. Please book an assessment with Physio Chandra for a proper, personalised evaluation.'

/** One line per matched pattern, straight from its approved record. */
const causeFromRecord = (m) => `${m.c.name} — ${firstSentence(m.c.blurb)}`

/** Up to n items taken round-robin across the matched records' lists. */
function fromRecords(matched, field, n) {
  const out = []
  for (let i = 0; out.length < n && i < 4; i++) {
    for (const m of matched) {
      const s = (m.c[field] || [])[i]
      if (s && out.length < n && !out.includes(s)) out.push(s)
    }
  }
  return out
}

/** Safe content when the model can't be reached — never an error page. With
    matched patterns it is the clinic's own notes for them (still one answer
    with the result cards); without, general content. */
export function fallbackAnalysis(labels, matched = []) {
  if (matched.length) {
    return {
      fallback: true,
      fromNotes: true,
      possibleCauses: matched.map(causeFromRecord),
      commonSymptoms: fromRecords(matched, 'noticed', 4),
      suggestedApproach: fromRecords(matched, 'homeCare', 4),
      disclaimer: DISCLAIMER,
    }
  }
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
    disclaimer: DISCLAIMER,
  }
}

/* ── The reasoning pass, validated ────────────────────────────────────────
   What the model may do: reorder the matched patterns, drop ones that do not
   fit, say none of them fit, and raise a concern for medical review.
   What it may NOT do, enforced here rather than trusted to the prompt:
     · name any condition outside the ids it was given (added ids are dropped)
     · say anything is safe, fine, or not serious
     · claim an emergency or name a disease in the concern text
     · change the red-flag routing — that ran in the app before this call
   Anything malformed simply means "no review", and the rules-only result
   stands. */
const CONCERN_BANNED = /(emergenc|911|cancer|tumou?r|infarct|heart attack|stroke|fracture|sepsis|diagnos|you have)/i
const SAFE_CLAIM = /(is safe|not serious|nothing serious|no cause for concern|perfectly fine|harmless)/i
/* The reasoning pass is shown which organs can refer to the drawn areas
   (referralBackground) so it can judge a medical concern, but a visitor is
   never told an organ may be involved. A concern that names one keeps its
   signal with fixed, neutral wording instead of being dropped. */
const ORGAN_WORDS = /(heart|cardiac|aort|gall ?bladder|liver|pancrea|kidney|renal|ureter|spleen|lung|pleura|stomach|duoden|oesophag|esophag|bowel|intestin|colon|append|bladder|uter|ovar|prostat|testi|diaphragm|pregnan|organ)/i
const NEUTRAL_CONCERN = "The way this pain behaves is worth a doctor's opinion alongside your physiotherapy assessment."

export function sanitizeReview(parsed, matched = []) {
  if (!parsed || typeof parsed !== 'object' || !matched.length) return null
  const r = parsed.review
  if (!r || typeof r !== 'object') return null
  const allowed = new Map(matched.map((m) => [m.c.id, m]))
  const txt = (s, n) => (typeof s === 'string' ? s.replace(/\s+/g, ' ').trim().slice(0, n) : '')

  const order = []
  for (const id of Array.isArray(r.order) ? r.order.slice(0, 8) : []) {
    if (allowed.has(id) && !order.includes(id)) order.push(id)
  }
  const dropped = []
  for (const d of Array.isArray(r.drop) ? r.drop.slice(0, 8) : []) {
    const id = d && typeof d === 'object' ? d.id : null
    if (allowed.has(id) && !dropped.some((x) => x.id === id)) dropped.push({ id, why: txt(d.why, 200) })
  }
  // Everything dropped is the same as saying nothing fits.
  const noMatch = r.noMatch === true || dropped.length >= matched.length

  let concern = null
  const why = r.concern && typeof r.concern === 'object' ? txt(r.concern.why, 220) : ''
  if (why && !CONCERN_BANNED.test(why) && !SAFE_CLAIM.test(why)) concern = { why: ORGAN_WORDS.test(why) ? NEUTRAL_CONCERN : why }

  const note = txt(r.note, 300)
  const kept = order.filter((id) => !dropped.some((d) => d.id === id))
  const changed = noMatch || dropped.length > 0 || concern !== null ||
    (kept.length > 0 && kept.join('|') !== matched.map((m) => m.c.id).filter((id) => kept.includes(id)).join('|'))
  if (!order.length && !dropped.length && !noMatch && !concern) return null
  return { order: kept, dropped, noMatch, concern, note, changed }
}

/** The matched patterns after the review: same records, new order, minus any
    dropped. Never gains a pattern. */
export function applyReview(matched = [], review) {
  if (!review) return matched
  if (review.noMatch) return []
  const dropped = new Set(review.dropped.map((d) => d.id))
  const kept = matched.filter((m) => !dropped.has(m.c.id))
  const rank = new Map(review.order.map((id, i) => [id, i]))
  return [...kept].sort((a, b) =>
    (rank.has(a.c.id) ? rank.get(a.c.id) : 99) - (rank.has(b.c.id) ? rank.get(b.c.id) : 99))
}

/** Shape-check the model's analysis JSON; anything off → the safe fallback.
    With matched patterns the list of causes is rebuilt from `matched` itself —
    same patterns, same order, whatever the model returned — and only the
    model's explanation for each is kept. */
export function sanitizeAnalysis(parsed, labels, matched = []) {
  const arr = (v, n) =>
    Array.isArray(v) ? v.filter((x) => typeof x === 'string').map((x) => x.slice(0, 240)).slice(0, n) : []
  if (!parsed || typeof parsed !== 'object') return fallbackAnalysis(labels, matched)
  // Over-long explanations are cut at a sentence end (or a word, with "…"),
  // never mid-word.
  const clip = (s, n) => {
    if (s.length <= n) return s
    const cut = s.slice(0, n)
    const end = cut.lastIndexOf('. ')
    return end > n / 2 ? cut.slice(0, end + 1) : cut.replace(/\s+\S*$/, '') + '…'
  }
  let possibleCauses
  if (matched.length) {
    const given = Array.isArray(parsed.possibleCauses) ? parsed.possibleCauses : []
    possibleCauses = matched.map((m) => {
      const hit = given.find((x) => x && typeof x === 'object' && x.id === m.c.id && typeof x.text === 'string' && x.text.trim())
      return hit ? `${m.c.name} — ${clip(hit.text.trim(), 320)}` : causeFromRecord(m)
    })
  } else {
    possibleCauses = arr(parsed.possibleCauses, 3)
  }
  const out = {
    possibleCauses,
    commonSymptoms: arr(parsed.commonSymptoms, 5),
    suggestedApproach: arr(parsed.suggestedApproach, 5),
    disclaimer:
      typeof parsed.disclaimer === 'string' && parsed.disclaimer.trim()
        ? parsed.disclaimer.slice(0, 400)
        : DISCLAIMER,
  }
  if (!out.possibleCauses.length || !out.commonSymptoms.length || !out.suggestedApproach.length) {
    return fallbackAnalysis(labels, matched)
  }
  return out
}
