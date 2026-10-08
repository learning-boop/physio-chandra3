/* ─────────────────────────────────────────────────────────────────────────
   Lower back prototype of the new question design (Chandra, 8 Oct 2026:
   "keep the questions to the patient level, but the reasoning and analysis
   at senior expert level").

   Runs when the lower back is the only area drawn (smartArea 'lowerback').
   The patient sees:
   - each group as a plain question with up to five short bullets that name
     every key sign behind it (so "No" is safe);
   - inside a group, one sign per tick, in everyday words.
   The reasoning underneath does not change: every tick sets its original
   red flag (TICKS key), so the tiers, 911 routes, booking rules, groups and
   checks all work exactly as before. A tick that needs two things together
   to count (sudden pain AND weak bones) keeps both on one line ("combo"),
   because splitting it would send people to a doctor for an ordinary strain.

   Also: "When did this start?" after a nerve sign (for the doctor and the
   "Tell them" line, not to change the route), and a "Tell them" sentence on
   the see-a-doctor and emergency screens, built from the ticks.
   ───────────────────────────────────────────────────────────────────────── */

export const lbPrototype = (area) => area === 'lowerback'

/* Groups: a plain question, and one short bullet per question in the group. */
export const PLAIN_GATES = {
  'em-nerve': 'Since your back pain started, have you noticed any of these?',
  'em-illness': 'Do you have any of these right now?',
  'em-limb': 'Did this start after an accident in the last few days?',
  'lowback-bone': 'Could the bone be hurt or weak?',
  'lowback-infection': 'Do you feel unwell, not just sore?',
  'lowback-organ': 'Could the pain be coming from inside your body?',
  'lowback-nerve': 'Have your legs, feet or hands changed?',
}

export const PLAIN_SHORT = {
  // Emergency: nerves at the bottom of the back
  'rf-saddle': 'Numb between your legs or around your bottom',
  'rf-bladder': 'Trouble with your pee or poo',
  'rf-sexual': 'Less feeling, or new trouble, during sex',
  'rf-legs': 'Pain in both legs, or a leg getting weaker fast',
  'jrf-conus-legs': 'Both legs suddenly weak or numb',
  // Emergency: sudden illness
  'rf-aaa': 'Sudden, very bad pain, and feeling faint',
  'jrf-aorta': 'Sudden tearing pain in your back',
  'jrf-pancreas': 'Very bad upper tummy pain, and being sick',
  'jrf-testis': 'Sudden, very bad pain in a testicle',
  'pc-stroke': 'A drooping face, one weak side, or slurred speech',
  // Emergency: accident
  'rf-fracture': 'A crash or bad fall in the last few days',
  // See a doctor
  'rf-osteo': 'Sudden pain after a small strain, with weak bones',
  'sc-trauma': 'A bad fall or accident',
  'rf-cancer': 'Cancer in the past, and this back pain is new',
  'rf-spondy': 'Under 20, and it hurts to bend backwards',
  'rf-infection': 'Fever, or a higher chance of infection',
  'sc-systemic': 'Weight loss, a growing lump, or bad night pain',
  'rf-kidney': 'Pain in waves to the groin, or burning pee',
  'rf-pelvic': { female: 'Pain with your periods, or unusual bleeding', male: 'New trouble peeing', any: 'Pain with periods, unusual bleeding, or trouble peeing' },
  'pc-visceral': 'Pain that never changes, or feeling sick',
  'rf-aaa-slow': 'A deep ache that never changes, or a pulsing tummy',
  'rf-footdrop': 'Your foot slaps down or your toes catch',
  'rf-myelo': 'Clumsy hands or unsteady walking',
  'sc-neuro': 'New weakness or numbness in an arm or leg',
  'jrf-legs': 'Legs slowly getting stiff or heavy',
  'jrf-shingles': 'A band of burning pain with a rash',
}

/** A bullet, for this person's birth sex where it differs. */
export const shortFor = (qid, sex) => {
  const s = PLAIN_SHORT[qid]
  return typeof s === 'string' || !s ? s : s[sex] || s.any
}

/* A short plain heading for a question shown on its own (no group) whose
   signs are split into several ticks. */
export const PLAIN_Q = {
  'rf-fracture': 'Did this start in the last few days after one of these?',
  'pc-stroke': 'Has one of these started in the last few hours?',
  'sc-trauma': 'Has one of these happened?',
  'rf-infection': 'Do any of these fit you?',
  'sc-systemic': 'Do any of these fit you?',
  'rf-kidney': 'Do any of these fit you?',
  'rf-pelvic': 'Do any of these fit you?',
  'rf-myelo': 'Have any of these changed?',
  'sc-neuro': 'Have any of these changed?',
  'rf-saddle': 'Have you noticed any of these?',
  'rf-bladder': 'Have you noticed any of these?',
  'rf-sexual': 'Have you noticed any of these?',
  'rf-legs': 'Have you noticed any of these?',
  'rf-aaa-slow': 'Do any of these fit you?',
  'pc-visceral': 'Do any of these fit you?',
}

/* One sign per tick. `tell` is the patient's own sentence for the doctor
   ("I …"). `combo`: two things that only count together, kept on one line.
   `sex`: birth sex the tick applies to. */
export const TICKS = {
  'rf-saddle': [
    { key: 'numb', text: 'Numb or tingly between your legs or around your bottom', tell: 'I have numbness between my legs' },
    { key: 'paper', text: 'You cannot feel the toilet paper when you wipe', tell: 'I cannot feel the toilet paper when I wipe' },
  ],
  'rf-bladder': [
    { key: 'start', text: 'Hard to start peeing, or a weak, slow stream', tell: 'it is hard to start peeing' },
    { key: 'full', text: 'You cannot feel when your bladder is full or empty', tell: 'I cannot feel when my bladder is full' },
    { key: 'leak', text: 'Pee leaks out and you cannot stop it', tell: 'I am leaking pee' },
    { key: 'bowel', text: 'You cannot hold your poo, or cannot feel it coming', tell: 'I cannot control my bowels' },
  ],
  'rf-sexual': [
    { key: 'feel', text: 'Less feeling in your private parts during sex', tell: 'I have less feeling during sex' },
    { key: 'erect', sex: 'male', text: 'New trouble getting an erection or ejaculating', tell: 'I have new trouble with erections' },
  ],
  'rf-legs': [
    { key: 'both', text: 'Your leg pain has spread to both legs', tell: 'my leg pain has spread to both legs' },
    { key: 'weak', text: 'A leg or foot getting weaker fast, over hours or days', tell: 'my leg is getting weaker quickly' },
  ],
  'jrf-conus-legs': [
    { key: 'both', text: 'Both legs suddenly weak or numb', tell: 'both my legs suddenly went weak or numb' },
  ],
  'rf-aaa': [
    { key: 'faint', combo: true, text: 'Sudden, very bad pain in your back or tummy, and you feel faint, sweaty, or a pulsing in your tummy', tell: 'I have sudden, very bad pain and I feel faint' },
  ],
  'jrf-aorta': [
    { key: 'tear', text: 'Sudden tearing or ripping pain in your back, spreading to your chest or tummy', tell: 'I have a sudden tearing pain in my back' },
  ],
  'jrf-pancreas': [
    { key: 'sick', combo: true, text: 'Very bad pain in your upper tummy going through to your back, and you are being sick', tell: 'I have very bad upper tummy pain and I am being sick' },
  ],
  'jrf-testis': [
    { key: 'pain', sex: 'male', text: 'Sudden, very bad pain in a testicle (ball)', tell: 'I have sudden, very bad pain in a testicle' },
  ],
  'pc-stroke': [
    { key: 'face', text: 'One side of your face drooping', tell: 'one side of my face is drooping' },
    { key: 'side', text: 'Weakness or numbness down one side of your body', tell: 'one side of my body is weak or numb' },
    { key: 'speech', text: 'Slurred or muddled speech', tell: 'my speech is slurred' },
    { key: 'eye', text: 'Sudden loss of sight in one eye', tell: 'I suddenly lost the sight in one eye' },
  ],
  'rf-fracture': [
    { key: 'crash', text: 'A car crash', tell: 'I was in a car crash in the last few days' },
    { key: 'height', text: 'A fall from a height, like a ladder, stairs or a roof', tell: 'I fell from a height in the last few days' },
    { key: 'landing', text: 'Landing hard on your feet or bottom', tell: 'I landed hard on my feet or bottom in the last few days' },
  ],
  'rf-osteo': [
    { key: 'strain', combo: true, text: 'Pain came on suddenly after a small strain, cough or lift, and you have weak bones, take steroid tablets, or are over 70', tell: 'the pain came on suddenly after a small strain, and I have weak bones or take steroids' },
  ],
  'sc-trauma': [
    { key: 'bad', text: 'A bad fall or accident', tell: 'I had a bad fall or accident' },
    { key: 'any', combo: true, text: 'Any fall, and you are 65 or over or have weak bones', tell: 'I had a fall, and I am over 65 or have weak bones' },
  ],
  'rf-cancer': [
    { key: 'past', combo: true, text: 'You have had cancer before, and this back pain is new', tell: 'I have had cancer before, and this back pain is new' },
  ],
  'rf-spondy': [
    { key: 'arch', combo: true, text: 'You are under 20, and it hurts to bend backwards, especially in sport like gymnastics, dance, cricket or tennis', tell: 'I am under 20 and it hurts to bend backwards in sport' },
  ],
  'rf-infection': [
    { key: 'fever', text: 'A fever or chills with the back pain', tell: 'I have a fever or chills' },
    { key: 'immune', text: 'A weak immune system, from an illness or medicines', tell: 'I have a weak immune system' },
    { key: 'drugs', text: 'You have injected drugs', tell: 'I have injected drugs' },
    { key: 'recent', text: 'A recent bladder or skin infection', tell: 'I had a bladder or skin infection recently' },
    { key: 'spine', text: 'A recent injection or operation on your spine', tell: 'I had an injection or operation on my spine recently' },
  ],
  'sc-systemic': [
    { key: 'weight', text: 'Losing weight without trying', tell: 'I am losing weight without trying' },
    { key: 'lump', text: 'A new lump, or one that is growing', tell: 'I have a new or growing lump' },
    { key: 'night', text: 'Pain at night that does not change however you lie', tell: 'the pain at night does not change however I lie' },
  ],
  'rf-kidney': [
    { key: 'waves', text: 'Pain in waves from your side to your groin', tell: 'the pain comes in waves from my side to my groin' },
    { key: 'pee', text: 'Burning when you pee, or blood in your pee', tell: 'it burns when I pee, or there is blood in my pee' },
    { key: 'fever', text: 'A fever with pain in your side', tell: 'I have a fever with pain in my side' },
  ],
  'rf-pelvic': [
    { key: 'periods', sex: 'female', text: 'The pain comes and goes with your periods', tell: 'the pain comes with my periods' },
    { key: 'bleed', sex: 'female', text: 'Unusual bleeding from your vagina', tell: 'I have unusual bleeding from my vagina' },
    { key: 'pee', sex: 'male', text: 'New trouble peeing', tell: 'I have new trouble peeing' },
  ],
  'rf-aaa-slow': [
    { key: 'ache', combo: true, text: 'A deep ache that never changes when you move, and you smoke (or did), or have high blood pressure, diabetes or heart disease', tell: 'I have a deep ache that never changes, and I have smoked or have heart or blood pressure problems' },
    { key: 'pulse', combo: true, text: 'A pulsing feeling in your tummy, and you smoke (or did), or have high blood pressure, diabetes or heart disease', tell: 'I feel a pulsing in my tummy, and I have smoked or have heart or blood pressure problems' },
  ],
  'rf-footdrop': [
    { key: 'slap', text: 'Your foot slaps down or your toes catch when you walk', tell: 'my foot slaps down when I walk' },
  ],
  'rf-myelo': [
    { key: 'hands', text: 'Your hands have become clumsy, like with buttons or writing', tell: 'my hands have become clumsy' },
    { key: 'walk', text: 'Your walking is unsteady, or your legs feel stiff', tell: 'my walking is unsteady' },
    { key: 'neck', text: 'Neck pain as well as the leg symptoms', tell: 'I have neck pain as well' },
  ],
  'sc-neuro': [
    { key: 'weak', text: 'An arm or leg newly weak or numb, or getting worse', tell: 'an arm or leg is getting weak or numb' },
    { key: 'clumsy', text: 'An arm or leg newly clumsy', tell: 'an arm or leg has become clumsy' },
  ],
  'jrf-legs': [
    { key: 'stiff', text: 'Your legs have slowly become stiff, heavy or clumsy when you walk', tell: 'my legs have slowly become stiff and heavy' },
  ],
  'pc-visceral': [
    { key: 'still', text: 'Pain that does not change at all when you move or change position', tell: 'the pain does not change at all when I move' },
    { key: 'unwell', text: 'Pain with feeling sick, a fever, or feeling unwell', tell: 'I feel sick or unwell with the pain' },
  ],
  'jrf-shingles': [
    { key: 'band', text: 'A band of burning pain on one side, with a rash or blisters', tell: 'I have a band of burning pain with a rash' },
  ],
}

/* A question whose signs another question on the same page already asks:
   not shown in the prototype (its tick would repeat). The other question
   leads to the same see-a-doctor advice. */
export const COVERED = { 'pc-urinary': 'rf-kidney' }

/* Ticks are kept in the flags list as "<question>~<tick>". */
export const tickId = (qid, key) => `${qid}~${key}`
export const ticksFor = (qid, sex) => (TICKS[qid] || []).filter((t) => !t.sex || !sex || t.sex === sex)
// Only while the question itself is still ticked (a stale tick never counts).
export const tickedOf = (qid, flags = []) => (flags.includes(qid) ? (TICKS[qid] || []).filter((t) => flags.includes(tickId(qid, t.key))) : [])

/** Toggle one tick, and keep its question ticked while any of its ticks is. */
export function toggleTick(flags, qid, key) {
  const id = tickId(qid, key)
  let next = flags.includes(id) ? flags.filter((x) => x !== id) : [...flags, id]
  const any = next.some((x) => x.startsWith(`${qid}~`))
  if (any && !next.includes(qid)) next = [...next, qid]
  if (!any) next = next.filter((x) => x !== qid)
  return next
}
/** Remove a question and all its ticks. */
export const clearQuestion = (flags, qid) => flags.filter((x) => x !== qid && !x.startsWith(`${qid}~`))

/* "When did this start?" after a nerve sign. */
export const WHEN_Q = { id: 'lb:when', text: 'When did this start?', options: [
  { id: 'today', label: 'Today', tell: 'It started today.' },
  { id: 'days', label: 'In the last few days', tell: 'It started in the last few days.' },
  { id: 'weeks', label: 'Weeks ago, or longer', tell: 'It started weeks ago.' },
] }
export const WHEN_FOR = ['rf-saddle', 'rf-bladder', 'rf-sexual', 'rf-legs', 'jrf-conus-legs']

/** The "Tell them" sentence, from the ticks (null when nothing was ticked). */
export function tellThem(flags = [], answers = {}) {
  const tells = Object.keys(TICKS).flatMap((qid) => tickedOf(qid, flags).map((t) => t.tell))
  if (!tells.length) return null
  const list = tells.length === 1 ? tells[0] : `${tells.slice(0, -1).join(', ')} and ${tells[tells.length - 1]}`
  // "When" belongs to the nerve signs: told only while one of them is ticked.
  const when = WHEN_FOR.some((q) => flags.includes(q)) && WHEN_Q.options.find((o) => o.id === answers[WHEN_Q.id])
  return `I have low back pain, and ${list}.${when ? ` ${when.tell}` : ''}`
}

/** The ticked signs, for Chandra's summary. */
export const tickedText = (qid, flags = []) => tickedOf(qid, flags).map((t) => t.text)
