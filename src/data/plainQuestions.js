/* ─────────────────────────────────────────────────────────────────────────
   Plain question design (Chandra, 8 Oct 2026: "keep the questions to the
   patient level, but the reasoning and analysis at senior expert level").
   Lower back first (prototype), then the neck.

   Runs when one of PLAIN_AREAS is the only area drawn (smartArea).
   The patient sees:
   - each group as a plain question with up to five short bullets that name
     every key sign behind it (so "No" is safe);
   - inside a group, one sign per tick, in everyday words; where a time
     limit applies to all of a question's ticks ("came on suddenly"), a short
     sub-heading carries it (SUBHEAD).
   The reasoning underneath does not change: every tick sets its original
   red flag (TICKS key), so the tiers, 911 routes, booking rules, groups and
   checks all work exactly as before. A tick that needs two things together
   to count (sudden pain AND weak bones) keeps both on one line ("combo"),
   because splitting it would send people to a doctor for an ordinary strain.

   Also: "When did this start?" after a nerve or spinal-cord sign (for the
   doctor and the "Tell them" line, not to change the route), and a "Tell
   them" sentence on the see-a-doctor and emergency screens.
   ───────────────────────────────────────────────────────────────────────── */

export const PLAIN_AREAS = ['lowerback', 'neck']
/** The area the plain design runs for, or null. */
export const plainArea = (area) => (PLAIN_AREAS.includes(area) ? area : null)

/* Groups: a plain question (per area where it differs), and one short
   bullet per question in the group. */
export const PLAIN_GATES = {
  'em-nerve': { lowerback: 'Since your back pain started, have you noticed any of these?', neck: 'Along with your neck pain, have you noticed any of these?' },
  'em-illness': 'Do you have any of these right now?',
  'em-limb': 'Did this start after an accident in the last few days?',
  'lowback-bone': 'Could the bone be hurt or weak?',
  'lowback-infection': 'Do you feel unwell, not just sore?',
  'lowback-organ': 'Could the pain be coming from inside your body?',
  'lowback-nerve': 'Have your legs, feet or hands changed?',
  'neck-cord': 'Have your arms, legs or neck changed in a worrying way?',
}
/** A group's plain question for this area. */
export const gateQ = (gid, area) => {
  const q = PLAIN_GATES[gid]
  return typeof q === 'string' || !q ? q : q[area] || Object.values(q)[0]
}
/* "I have … pain" in the Tell them line. */
export const PAIN_WORD = { lowerback: 'low back pain', neck: 'neck pain' }

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
  'sc-systemic': { lowerback: 'Weight loss, a growing lump, or bad night pain', any: 'Fever, weight loss, a lump, night pain, or past cancer' },
  'rf-kidney': 'Pain in waves to the groin, or burning pee',
  'rf-pelvic': { female: 'Pain with your periods, or unusual bleeding', male: 'New trouble peeing', any: 'Pain with periods, unusual bleeding, or trouble peeing' },
  'pc-visceral': 'Pain that never changes, or feeling sick',
  'rf-aaa-slow': 'A deep ache that never changes, or a pulsing tummy',
  'rf-footdrop': 'Your foot slaps down or your toes catch',
  'rf-myelo': 'Clumsy hands or unsteady walking',
  'sc-neuro': 'New weakness or numbness in an arm or leg',
  'jrf-legs': 'Legs slowly getting stiff or heavy',
  'jrf-shingles': 'A band of burning pain with a rash',
  // Neck
  'nrf-stroke': 'A sudden bad headache, drooping face, or one weak side',
  'nrf-cord': 'You cannot hold your pee or poo',
  'nrf-cord-legs': 'Both legs numb or weak, or trouble breathing',
  'nrf-mening': 'A fever with a stiff neck or a rash',
  'nrf-cardiac': 'Pain that comes with effort, or with chest pain',
  'nrf-after': 'Bad signs after a neck crack, crash or knock',
  'nrf-after-doc': 'Dizziness or a new headache since an injury',
  'nrf-myelo': 'An arm, hand or leg quickly getting weak or clumsy',
  'nrf-upperinstab': 'A head too heavy to hold, or tingling lips',
}

/** A bullet, for this area or birth sex where it differs. */
export const shortFor = (qid, sex, area) => {
  const s = PLAIN_SHORT[qid]
  return typeof s === 'string' || !s ? s : s[area] || s[sex] || s.any
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
  'nrf-stroke': 'Has one of these come on suddenly since this started?',
  'nrf-cord': 'Along with the neck pain, have you noticed any of these?',
  'nrf-cord-legs': 'Along with the neck pain, have you noticed any of these?',
  'nrf-cardiac': 'Do any of these fit you?',
  'nrf-after': 'After a neck "crack", a crash, a sudden jerk or a knock to the head or neck: is one of these new in the last few days, or getting worse fast?',
  'nrf-after-doc': 'Do any of these fit you?',
  'nrf-myelo': 'Over the last few days or weeks, has one of these happened quickly?',
  'nrf-upperinstab': 'Do any of these fit you?',
}

/* Inside a group: a sub-heading over a question's ticks, where a limit
   applies to all of them. */
export const SUBHEAD = {
  'nrf-stroke': 'Came on suddenly since this started:',
  'nrf-after': 'After a neck "crack", a crash, a jerk or a knock to the head, new in the last few days or getting worse fast:',
  'nrf-myelo': 'Happening quickly, over days or weeks:',
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
    { key: 'fever', text: 'A fever or chills with the pain', tell: 'I have a fever or chills' },
    { key: 'cancer', combo: true, text: 'You have had cancer before, and this pain is new or changing', tell: 'I have had cancer before, and this pain is new' },
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
  // ── Neck ──
  'nrf-stroke': [
    { key: 'headache', text: 'The worst headache of your life', tell: 'I suddenly have the worst headache of my life' },
    { key: 'face', text: 'A drooping or numb face', tell: 'my face is drooping or numb' },
    { key: 'side', text: 'Weakness or numbness in an arm or leg on one side', tell: 'one side of my body is weak or numb' },
    { key: 'speech', text: 'Slurred speech, or trouble finding or understanding words', tell: 'my speech is slurred' },
    { key: 'sight', text: 'Loss of sight, or seeing double', tell: 'I have lost sight or I am seeing double' },
    { key: 'swallow', text: 'Trouble swallowing', tell: 'I have trouble swallowing' },
    { key: 'confused', text: 'Confusion, falls or blackouts', tell: 'I have had confusion, falls or blackouts' },
    { key: 'dizzy', combo: true, text: 'New dizziness or spinning, with vomiting, or you cannot stand or walk', tell: 'I have new dizziness and cannot stand or walk' },
  ],
  'nrf-cord': [
    { key: 'hold', text: 'You cannot hold your pee or poo', tell: 'I cannot control my bladder or bowels' },
    { key: 'cannot', text: 'You cannot pee at all', tell: 'I cannot pee' },
  ],
  'nrf-cord-legs': [
    { key: 'legs', text: 'New numbness or weakness in both legs', tell: 'both my legs are numb or weak' },
    { key: 'spread', text: 'Numbness or weakness spreading fast in both hands and feet', tell: 'numbness is spreading in my hands and feet' },
    { key: 'breath', text: 'Any trouble breathing or swallowing', tell: 'I have trouble breathing or swallowing' },
  ],
  'nrf-mening': [
    { key: 'fever', combo: true, text: 'A fever, and a stiff neck, a bad headache, a rash, or light hurting your eyes', tell: 'I have a fever with a stiff neck' },
    { key: 'unwell', combo: true, text: 'A fever, and you feel very unwell', tell: 'I have a fever and feel very unwell' },
  ],
  'nrf-cardiac': [
    { key: 'effort', text: 'Neck, jaw or arm pain when you walk fast or climb stairs', tell: 'the pain comes on when I walk fast or climb stairs' },
    { key: 'chest', text: 'With the pain: chest pain, pressure or tightness', tell: 'I have chest pain or tightness with it' },
    { key: 'breath', text: 'With the pain: short of breath, sweaty or feeling sick', tell: 'I feel short of breath, sweaty or sick with it' },
  ],
  'nrf-after': [
    { key: 'severe', text: 'Very bad neck pain, unlike any you have had before', tell: 'I have very bad neck pain, unlike any before' },
    { key: 'limbs', text: 'Numbness or weakness in your arms or legs', tell: 'my arms or legs are numb or weak' },
    { key: 'dizzy', text: 'Dizziness, seeing double, or slurred speech', tell: 'I am dizzy or seeing double' },
    { key: 'swallow', text: 'Trouble swallowing, feeling sick or vomiting', tell: 'I have trouble swallowing or I am vomiting' },
    { key: 'head', text: 'A very bad headache, or one getting worse', tell: 'I have a bad headache that is getting worse' },
    { key: 'mind', text: 'Confusion, drowsiness or memory loss', tell: 'I am confused or drowsy' },
    { key: 'lips', text: 'Numb lips, or eyes that flicker or jump', tell: 'my lips are numb or my eyes flicker' },
  ],
  'nrf-after-doc': [
    { key: 'dizzy', combo: true, text: 'Since a crash, a neck crack, a jerk or a knock: dizziness that keeps coming back', tell: 'since the injury, dizziness keeps coming back' },
    { key: 'signs', combo: true, text: 'Since that injury: numbness, seeing double, slurred speech or trouble swallowing, even if not getting worse', tell: 'since the injury I have had numbness, double vision or trouble swallowing' },
    { key: 'newpain', combo: true, text: 'Since that injury: a new neck pain or headache, different from any before', tell: 'since the injury I have a new kind of neck pain or headache' },
    { key: 'sudden', combo: true, text: 'Without an injury: a sudden, very bad new neck pain or headache, unlike any before', tell: 'I suddenly have a very bad new neck pain or headache, unlike any before' },
  ],
  'nrf-myelo': [
    { key: 'limb', text: 'An arm, hand or leg getting weaker, number or clumsier', tell: 'an arm, hand or leg is quickly getting weaker or clumsier' },
    { key: 'walk', text: 'Your walking getting more unsteady', tell: 'my walking is quickly getting more unsteady' },
  ],
  'nrf-upperinstab': [
    { key: 'heavy', text: 'Your head feels too heavy to hold up without your hands', tell: 'my head feels too heavy to hold up' },
    { key: 'lips', text: 'Moving your neck brings a lump in your throat, or tingling lips or mouth', tell: 'moving my neck makes my lips tingle' },
    { key: 'slow', combo: true, text: 'Over weeks or months, with no injury: a hoarse voice, trouble swallowing, a numb or weak face, a drooping eyelid, or double vision', tell: 'over weeks I have had a hoarse voice, trouble swallowing or double vision' },
    { key: 'risk', text: 'Rheumatoid or another inflammatory arthritis, Down syndrome, or long-term steroid tablets', tell: 'I have inflammatory arthritis, Down syndrome or take steroid tablets' },
  ],
  'jrf-shingles': [
    { key: 'band', text: 'A band of burning pain on one side, with a rash or blisters', tell: 'I have a band of burning pain with a rash' },
  ],
}

/* A question whose signs another question on the same page already asks:
   not shown in the prototype (its tick would repeat). The other question
   leads to the same see-a-doctor advice. */
export const COVERED = { 'pc-urinary': 'rf-kidney' }

/* Ticks another question on the same area's page already asks: left out
   there (the lower back asks fever in rf-infection and cancer in rf-cancer). */
export const TICK_SKIP = { lowerback: ['sc-systemic~fever', 'sc-systemic~cancer'] }

/* Ticks are kept in the flags list as "<question>~<tick>". */
export const tickId = (qid, key) => `${qid}~${key}`
export const ticksFor = (qid, sex, area) => (TICKS[qid] || []).filter((t) => (!t.sex || !sex || t.sex === sex) && !(TICK_SKIP[area] || []).includes(tickId(qid, t.key)))
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
export const WHEN_FOR = ['rf-saddle', 'rf-bladder', 'rf-sexual', 'rf-legs', 'jrf-conus-legs', 'nrf-cord', 'nrf-cord-legs', 'nrf-myelo']

/** The "Tell them" sentence, from the ticks (null when nothing was ticked). */
export function tellThem(flags = [], answers = {}, area = 'lowerback') {
  const tells = Object.keys(TICKS).flatMap((qid) => tickedOf(qid, flags).map((t) => t.tell))
  if (!tells.length) return null
  const list = tells.length === 1 ? tells[0] : `${tells.slice(0, -1).join(', ')} and ${tells[tells.length - 1]}`
  // "When" belongs to the nerve signs: told only while one of them is ticked.
  const when = WHEN_FOR.some((q) => flags.includes(q)) && WHEN_Q.options.find((o) => o.id === answers[WHEN_Q.id])
  return `I have ${PAIN_WORD[area] || 'pain'}, and ${list}.${when ? ` ${when.tell}` : ''}`
}

/** The ticked signs, for Chandra's summary. */
export const tickedText = (qid, flags = []) => tickedOf(qid, flags).map((t) => t.text)
