/* ── Everything the talking guide can say, as sentences ───────────────────
   For the recordings (scripts/make-guide-audio.mjs): one MP3 per sentence,
   so every phone and computer hears the same voice (Chandra, 13 Oct 2026).
   The pain guide builds its spoken lines with the helpers below, so the
   words here and on screen are always the same.

   Read-backs are made of fixed sentences, never one sentence holding the
   patient's own mix of answers: "You chose these. Jumping or landing.
   Squatting or kneeling. Is that right?" Each piece has a recording, and
   no answer ever has to be sent anywhere to be spoken.

   Anything not listed (a few combined or rare lines) is spoken by the
   browser's own voice instead. Plain .js on purpose: Node imports it. */
import { allSpokenTexts, splitSentences } from './talkingGuide.js'
import * as SG from './symptomGuide.js'
import * as AF from './assessmentFlow.js'
import * as PT from './painType.js'
import * as PB from './painBehaviour.js'
import * as PS from './psychosocial.js'
import * as INJ from './injuryScreen.js'
import * as DM from './diabetes.js'
import * as ST from './steroids.js'
import * as PG from './pregnancy.js'
import * as SP from './spondylolysis.js'
import * as OI from './oi.js'

/* How an answer reads aloud: no dashes or dots between parts, no quotes. */
export const spoken = (t) => String(t || '').replace(/\s*[·—–]\s*/g, ', ').replace(/[“”"]/g, '').replace(/\s+/g, ' ').trim()
/* One item as a sentence of its own. */
export const asSentence = (t) => { const x = spoken(t); return /[.!?]$/.test(x) ? x : x + '.' }

/* The read-backs (PainAssessment uses these, so the wording matches). */
export const readOne = (label) => `You answered: ${spoken(label).replace(/[.!?]+$/, '')}. Is that right?`
export const readAge = (label) => `You're ${spoken(label).replace(/[.!?]+$/, '')}. Is that right?`
export const readMany = (labels, none = false) => (none || !labels.length
  ? 'You chose: none of these. Is that right?'
  : `You chose these. ${labels.map(asSentence).join(' ')} Is that right?`)
export const readAreas = (names) => `You marked these areas. ${names.map(asSentence).join(' ')} Is that everything?`
export const readTicked = (texts) => `You ticked these. ${texts.map(asSentence).join(' ')} Is that right?`
export const gotMany = (labels) => `Got it. ${labels.map(asSentence).join(' ')} Anything else? Say next when you're done.`

/* Copied from PainAssessment.jsx (not importable in Node): keep in step. */
const ABOUT = {
  ages: ['Under 5', '5 to 15', '16 to 29', '30 to 49', '50 to 64', '65 or over'],
  sex: ['Female', 'Male', 'Intersex, or prefer not to say'],
  titles: ['Your age?', 'Your sex assigned at birth?', 'A few details to start', 'How your pain behaves', 'How it is affecting you'],
  fixed: [
    'First, some safety questions. Tick anything that is happening to you now. If none of them apply, tap None of these apply.',
    'Next, some signs a doctor may need to check. Tick any that fit you now. If none apply, tap None of these apply.',
    'You said none of these apply to you right now. Is that right?',
    'You answered no. Is that right?',
    'Thank you, that is noted. Shall we go on?',
    'You left this blank, which is fine. Shall we go on?',
    'You have brittle bone disease. Is that right?',
    'So brittle bone disease does not apply to you. Is that right?',
    'Yes, show me the list.', 'No.',
    'Say yes, or tap Yes.', 'If it is, tap Yes.',
  ],
}

const arr = (x) => (Array.isArray(x) ? x : x && typeof x === 'object' ? Object.values(x) : [])
const labelsOf = (q) => arr(q && q.options).map((o) => o && o.label).filter(Boolean)

/* All the lines, before splitting into sentences. */
export function allGuideLines() {
  const out = []
  const add = (t) => { if (t && typeof t === 'string') out.push(t) }
  const question = (q) => {
    if (!q) return
    add(spoken(q.text))
    if (q.gate) { add(spoken(q.gate.ask)) }
    for (const l of labelsOf(q)) { add(readOne(l)); add(asSentence(l)) }
    for (const g of arr(q.group)) question(g)
  }

  // The assistant's own messages (welcome, tips, answers, demo, prompts).
  for (const t of allSpokenTexts()) add(t.text)
  ABOUT.fixed.forEach(add)
  ABOUT.titles.forEach(add)
  ;['You chose these.', 'You ticked these.', 'You marked these areas.', 'Is that right?', 'Is that everything?', 'Got it.',
    "Anything else? Say next when you're done.", 'You chose: none of these. Is that right?'].forEach(add)

  // About you.
  ABOUT.ages.forEach((a) => { add(readAge(a)); add(asSentence(a)) })
  ABOUT.sex.forEach((x) => { add(readOne(x)); add(asSentence(x)) })
  for (const q of [DM.DM_STATUS, ST.STEROID_STATUS, PG.PREG_STATUS, PG.PREG_BIRTH, SP.SPONDY_STATUS]) question(q)
  if (OI.OI_STATUS) { add(spoken(OI.OI_STATUS.text)); add(readOne(OI.OI_STATUS.yes)) }

  // Pain questions, every area: its own questions, the opening details and
  // the closing screens, and its area name (for the drawing read-back).
  const regions = SG.REGIONS || {}
  for (const [key, r] of Object.entries(regions)) {
    if (r.name) add(asSentence(r.name))
    arr(r.questions).forEach(question)
    arr(r.context).forEach(question)
    if (typeof AF.buildContext === 'function') { try { arr(AF.buildContext([key])).forEach(question) } catch { /* not for this area */ } }
    // Safety items of the area (read back when ticked).
    arr(r.redFlags).forEach((f) => add(asSentence(f.text)))
  }
  question(PT.PAIN_QUALITY)
  if (typeof PB.behaviourQuestions === 'function') arr(PB.behaviourQuestions()).forEach(question)
  arr(PS.PSYCHOSOCIAL_QUESTIONS).forEach(question)
  arr(SG.GENERAL_RED_FLAGS).forEach((f) => add(asSentence(f.text)))
  for (const list of [DM.DM_RED_FLAGS, ST.STEROID_RED_FLAGS, PG.PREG_RED_FLAGS, OI.OI_RED_FLAGS]) arr(list).forEach((f) => add(asSentence(f && f.text)))

  // Injury questions.
  for (const sc of arr(INJ.SCREENS)) arr(sc.questions).forEach(question)
  return out
}

/* Every distinct sentence. */
export function allGuideSentences() {
  const seen = new Set()
  const out = []
  for (const line of allGuideLines()) {
    for (const s of splitSentences(line)) if (!seen.has(s)) { seen.add(s); out.push(s) }
  }
  return out
}
