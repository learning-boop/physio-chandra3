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
import { allSpokenTexts, splitSentences, ACKS } from './talkingGuide.js'
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
import * as GQ from './genericQuestions.js'
import { PATTERNS } from './patternChecks.js'
import * as SGT from './safetyGates.js'
import * as EMG from './emergencyGroups.js'
import * as PQ from './plainQuestions.js'

/* How an answer reads aloud: no dashes or dots between parts, no quotes. */
export const spoken = (t) => String(t || '').replace(/\s*[·—–]\s*/g, ', ').replace(/[“”"]/g, '').replace(/\s+/g, ' ').trim()
/* One item as a sentence of its own. */
export const asSentence = (t) => { const x = spoken(t); return /[.!?]$/.test(x) ? x : x + '.' }

/* The emergency flash cards (17 Oct 2026): the question, then each sign
   under it as a sentence of its own, so every card is made of recorded
   sentences whatever signs it shows. PainAssessment.jsx uses these. */
const capFirst = (t) => t.charAt(0).toUpperCase() + t.slice(1)
export const signSentences = (more = '') => String(more).split(/;\s*(?:or\s+)?/).map((p) => p.trim()).filter(Boolean).map((p) => asSentence(capFirst(p)))
export const safetyCard = (text, more = '') => [asSentence(text), ...signSentences(more)].join(' ')
export const EMG_INTRO = 'First, a few safety questions. Most people answer no.'
export const DOC_INTRO = 'Next, a few signs a doctor may need to check. Most people answer no.'
export const EMG_TAP = 'If this is happening to you, please tap Yes. If not, say no.'

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
    'Last part: how the pain is affecting you. There are no right or wrong answers.',
    'First, some safety questions. Tick anything that is happening to you now. If none of them apply, tap None of these apply.',
    'Next, some signs a doctor may need to check. Tick any that fit you now. If none apply, tap None of these apply.',
    'You said none of these apply to you right now. Is that right?',
    'You answered no. Is that right?',
    'Thank you, that is noted. Shall we go on?',
    'You left this blank, which is fine. Shall we go on?',
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
    // Each answer as a sentence of its own (tick-all read-outs, "Got it.
    // Jumping or landing."). Single answers are not read back any more
    // (Chandra, 14 Oct 2026: a choice just moves on).
    for (const l of labelsOf(q)) add(asSentence(l))
    for (const g of arr(q.group)) question(g)
  }

  // In order of how often they are heard, so a partial run (a plan's
  // monthly credits) records what every visitor hears first: the
  // assistant's page messages, demo and prompts now; its chat answers
  // (long, asked less often) at the very end.
  const spokenAll = allSpokenTexts()
  const chatty = (t) => /^(topic|reply)-|^fallback$|^greeting$/.test(t.name)
  for (const t of spokenAll) if (!chatty(t)) add(t.text)
  ABOUT.fixed.forEach(add)
  // A grouped page says its title first, with a full stop ("How your pain
  // behaves. How bad…"): a different recording from the bare title.
  ABOUT.titles.forEach((t) => { add(t); if (!/[.?!]$/.test(t)) add(t + '.') })
  ACKS.forEach(add)
  ;['You chose these.', 'You ticked these.', 'You marked these areas.', 'Is that right?', 'Is that everything?', 'Got it.',
    "Anything else? Say next when you're done.", 'You chose: none of these. Is that right?'].forEach(add)

  // About you.
  ABOUT.ages.forEach((a) => add(asSentence(a)))
  ABOUT.sex.forEach((x) => add(asSentence(x)))
  for (const q of [DM.DM_STATUS, ST.STEROID_STATUS, PG.PREG_STATUS, PG.PREG_BIRTH, SP.SPONDY_STATUS]) question(q)
  if (OI.OI_STATUS) { add(spoken(OI.OI_STATUS.text)); add(asSentence(OI.OI_STATUS.yes)); add(asSentence(OI.OI_STATUS.no)) }

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

  // The generic questions (areas without their own set, such as the
  // stomach), with every area's name and its own worse / easier options
  // (built in PainAssessment.jsx, buildQuestions).
  const areaWords = [...new Set([...Object.values(regions).map((r) => r.name && r.name.toLowerCase()).filter(Boolean), ...Object.values(GQ.TYPE_WORD)])]
  for (const q of GQ.QUESTIONS) question({ ...q, options: (q.options || []).map((o) => (typeof o === 'string' ? { label: o } : o)) })
  for (const a of areaWords) {
    add(`When did your ${a} pain begin?`)
    add(`What tends to make your ${a} pain worse?`)
    add(`What tends to ease your ${a} pain?`)
  }
  for (const list of [...Object.values(GQ.REGION_AGGRAVATORS), ...Object.values(GQ.REGION_EASERS)]) list.forEach((l) => add(asSentence(l)))
  // Safety items from every body part and from the drawing's pattern (read
  // back when ticked).
  arr(GQ.UNIVERSAL_CHECKS).forEach((f) => add(asSentence(f.text)))
  arr(PATTERNS).forEach((f) => add(asSentence(f.text)))

  // The emergency flash cards: their opening, the emergency group titles,
  // and the sign lines and plain ticks of the questions in those groups
  // (the doctor page and final check stay checklists, so not theirs).
  add(EMG_INTRO); add(DOC_INTRO); add(EMG_TAP)
  // The doctor page's groups are each body part's (safetyGates.js GATES).
  const docGroups = Object.values(SGT.GATES || {}).flat()
  const emIds = new Set([...arr(EMG.EM_GROUPS), ...docGroups].flatMap((g) => arr(g && g.members)))
  ;[...arr(EMG.EM_GROUPS), ...docGroups].forEach((g) => g && typeof g.title === 'string' && add(asSentence(g.title)))
  for (const t of Object.values(SGT.THEME_TITLES || {})) {
    if (typeof t === 'string') add(asSentence(t))
    else if (typeof t === 'function') for (const ms of [[], [{ id: 'cast' }], [{ id: 'replacement' }], [{ id: 'cast' }, { id: 'replacement' }]]) add(asSentence(t(ms)))
  }
  for (const id of emIds) {
    const v = (SGT.SHORT || {})[id] || (SGT.SIGNS || {})[id]
    if (typeof v === 'string') signSentences(v).forEach(add)
    if (PQ.PLAIN_Q && typeof PQ.PLAIN_Q[id] === 'string') add(asSentence(PQ.PLAIN_Q[id]))
    arr(PQ.TICKS && PQ.TICKS[id]).forEach((t) => t && t.text && add(asSentence(PQ.bareText(t.text))))
  }
  add(asSentence('Do any of these fit you?'))

  // Injury questions.
  for (const sc of arr(INJ.SCREENS)) arr(sc.questions).forEach(question)
  // Last: the chat answers.
  for (const t of spokenAll) if (chatty(t)) add(t.text)
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
