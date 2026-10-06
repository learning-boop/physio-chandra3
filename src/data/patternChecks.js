/* ─────────────────────────────────────────────────────────────────────────
   Pattern-triggered safety checks — visceral referral and systemic patterns.

   From "The Shape of Pain" (content/pain-patterns/_SPEC-the-shape-of-pain.md),
   Pattern 02c (visceral referred: "routes to care, never physio") and the four
   extra patterns that change the route (bilateral & symmetrical, glove &
   stocking, whole limb + colour/swelling).

   Where the drawing MATCHES an organ or systemic map, the matching question is
   added to the final safety check. The person answers it themselves and the
   tier they trigger decides the route — the drawing alone never claims an
   organ cause, and the AI is not involved. Laterality matters: right shoulder
   blade reads differently from left arm (spec, "Side matters for the organ
   maps").

   The body map cannot see the front/back surface or the shoulder TIP yet, so
   these are deliberately drawn wider than the textbook maps and lean on the
   person's own answer about associated symptoms.

   ⚠ FOR CLINICIAN REVIEW — wording, tiers and which drawings trigger each.
   ───────────────────────────────────────────────────────────────────────── */

import { HORMONE_SCREEN, LOW_HORMONE_SCREEN } from './steroids.js'
import { CALCIUM_SCREEN } from './parathyroid.js'
import { THYROID_SCREEN, PARALYSIS_FLAG, HYPOTHYROID_SCREEN } from './thyroid.js'
import { ACROMEGALY_SCREEN } from './acromegaly.js'
import { RICKETS_SCREEN } from './osteomalacia.js'
import { PAGET_SCREEN, pagetApplies } from './paget.js'
import { BONE_SCREEN, BONE_SCREEN_ADULT, BONE_WHY_YOUNG, BONE_WHY_ADULT, YOUNG, oneBone } from './boneTumour.js'

const typesOf = (zones) => new Set(zones.map((z) => z.type))
const has = (zones, ...types) => zones.some((z) => types.includes(z.type))
/** Marked on a particular SURFACE — zones drawn before surfaces were recorded
    have no `face`, so those are treated as front (the default view). */
const onFace = (zones, face, ...types) =>
  zones.some((z) => types.includes(z.type) && (z.face || 'front') === face)
const onSide = (zones, side, ...types) =>
  zones.some((z) => types.includes(z.type) && z.id.endsWith(side))
/** Same area marked on BOTH sides (e.g. both wrists). */
const bothSides = (zones, type) =>
  zones.some((z) => z.type === type && z.id.endsWith('L')) &&
  zones.some((z) => z.type === type && z.id.endsWith('R'))
/** Areas along one arm or leg on one side (whole-limb spread). */
const limbSpread = (zones, side) => {
  // Upper arm, elbow and forearm count as one stretch of the arm, so the
  // whole-limb rule still means shoulder, mid-arm and hand.
  const arm = [['shoulder'], ['upperarm', 'elbow', 'forearm'], ['wrist', 'hand']].filter((ts) => onSide(zones, side, ...ts)).length
  const leg = [['hip'], ['thigh', 'knee', 'lowerleg'], ['ankle', 'foot']].filter((ts) => onSide(zones, side, ...ts)).length
  return Math.max(arm, leg)
}

/** Any answer that describes weakness (the shoulder's, arm's, wrist's,
    hand's and thigh's weakness options, and foot drop). The nerve-specific
    ones with their own route (the thumb, the pinch) are left out. */
const WEAK_IDS = ['weak', 'weakness', 'weakgrip', 'footslap', 'slap']
const weakAnswer = (a = {}) => Object.values(a).some((v) => [].concat(v).some((x) => WEAK_IDS.includes(x)))
// 6 Oct 2026, general conditions cross-check (approved by Chandra): under 5 and 5 to 15 are children; an unknown age counts as an adult.
const adult = (a = {}) => !['u5', 'u18'].includes(a.age)
// The MS screen (S4): tingling, a weakness answer, or the neck's cord signs.
const msTrigger = (a = {}) => [].concat(a.painQuality || []).includes('tingling') || weakAnswer(a) ||
  [].concat(a.N9 || []).some((id) => id !== 'none' && id !== 'dizzy')

/** Age 50 or over, from any of the age answer ids (a50, 50-64, o64…). */
const over50 = (id) => !!id && !/^u/.test(id) && Number((/\d+/.exec(id) || [0])[0]) >= 50
const WHY = {
  // "Ankylosing spondylitis Spondyloarthritis" document (v1.0, 2 Oct 2026), red flags.
  asFracture: {
    title: 'A stiff spine can break with little force',
    text: 'In long-standing ankylosing spondylitis the spine is stiffer and can break after a fall or jolt that would not hurt most people. New, severe neck or back pain after even a minor fall needs to be checked in hospital straight away. Keep your head and neck as still as you can.',
  },
  neuroScreen: {
    title: 'Please see your family doctor in the next few days',
    text: 'Along with numbness or tingling, these can come from the nervous system rather than a muscle or joint. Please see your family doctor within the next few days for a neurological check, and note when each symptom started and how long it lasted. If you have lost vision in one eye, please see a doctor today or go to urgent care. Most people with numbness or tingling do not have a serious cause, and when one is found, starting treatment early makes a real difference. Physiotherapy can follow once the cause is known.',
  },
  // 6 Oct 2026, general conditions cross-check (approved by Chandra): S3 and S5.
  stroke: {
    title: 'Please call 911 now',
    text: 'Sudden loss of vision in one eye, a face that droops, weakness or numbness down one side, or slurred speech can be a stroke, including an "eye stroke". Call 911 now: treatment works best in the first hours. Do not drive yourself.',
  },
  optic: {
    title: 'Please see a doctor today',
    text: 'Blurred, dim or washed-out vision in one eye, especially if it hurts to move the eye, needs an eye or medical check the same day (an eye doctor, your family doctor, urgent care or an emergency department). Physiotherapy can wait until you have been seen.',
  },
  gbs: {
    title: 'Please go to an emergency department now',
    text: 'Weakness that climbs up from the feet over hours to days, often with tingling, can come from inflammation of the nerves (Guillain-Barré syndrome). It needs hospital assessment today, because it can affect breathing. Call 911 if breathing or swallowing becomes difficult.',
  },
  muscleCrisis: {
    title: 'Please call 911 now',
    text: 'Muscle weakness that affects breathing, coughing or swallowing, or comes with fainting or an irregular heartbeat, needs emergency care. Some nerve and muscle conditions can affect the breathing muscles or the heart, and help is needed quickly. If you have a diagnosed muscle condition, tell the paramedics.',
  },
  muscleScreen: {
    title: 'Please see your family doctor in the next few days',
    text: 'Weakness that fades with use and recovers with rest, eyelid or vision changes, chewing or speech that tires, a grip that is slow to let go, or slowly increasing weakness in both hands or feet are not usually a joint, tendon or muscle strain. They can come from the connection between nerves and muscles, or from the muscles themselves. Please see your family doctor in the next few days, describe what you have noticed through the day and anything that runs in your family, and ask whether a neurology referral is needed. Most of these checks are simple, and the conditions they look for can be treated or managed well. Physiotherapy can follow once the cause is known.',
  },
  childMuscle: {
    title: 'Please see your family doctor in the next week or two',
    text: 'Most children who fall a lot or walk on their toes do not have a muscle condition, and checking is quick. But getting up from the floor by pushing the hands up the legs, falling behind other children at running, jumping or stairs, walking late or losing a skill, or unusually large, firm calves can point to weakness in the hip and thigh muscles, and a doctor should look at this rather than wait. Please describe exactly what you have noticed and ask whether a creatine kinase (CK) blood test is appropriate; it is the usual first step. If your child has lost a skill they used to have, please see the doctor this week. Physiotherapy can follow once the cause is known, and your instincts as a parent are worth trusting.',
  },
  myositisScreen: {
    title: 'Please see your family doctor this week',
    text: 'Weakness in both thighs or both shoulders that has built up over weeks or months, without an injury, is different from a strained muscle or a worn joint. One possible cause is inflammation in the muscles themselves, which a doctor can usually pick up with a blood test. Please see your family doctor this week and ask whether a creatine kinase (CK) blood test is appropriate; mention any rash, swallowing trouble, cough or breathlessness, and the medicines you take (including any cholesterol medicine). If you have swallowing, breathing or general symptoms, please do not wait more than a few days. This kind of weakness can be treated, and physiotherapy can follow once the cause is known.',
  },
  pmr: {
    title: 'Please see your family doctor; today if any of the eye, scalp or jaw signs apply',
    text: 'New aching and stiffness in both shoulders or both hips after the age of 50, worst in the morning and with feeling unwell, can be polymyalgia rheumatica, an inflammatory condition that a doctor treats, usually with a blood test and medicine, and which often responds quickly. Please see your family doctor within the next few days. A new headache, a tender scalp, jaw pain when chewing, or any change in your vision can mean giant cell arteritis, which needs a doctor the same day to protect your eyesight. Physiotherapy can help once a doctor has seen you.',
  },
  handProcedure: {
    title: 'Please contact a doctor or your hand clinic today',
    text: 'After hand surgery, a needle release or an injection, a hot, red, increasingly swollen hand, pus, spreading redness or a fever can be an infection, and new numbness in a fingertip or a finger you suddenly cannot bend can mean a nerve or tendon problem. These need checking the same day. Pain, swelling, colour change or sensitivity far beyond what you expected, not settling week on week, also needs an early review.',
  },
  crpsInfection: {
    title: 'Please see a doctor today',
    text: 'After an injury or operation, a wound or pin site that is red, discharging or getting worse, or a fever, can be an infection. It needs a doctor the same day, before CRPS or anything else is considered.',
  },
  uveitis: {
    title: 'Please see a doctor or eye specialist today',
    text: 'A painful red eye with blurred vision or sensitivity to light can be uveitis, an inflammation inside the eye that is linked to inflammatory back pain. It is treatable, but it needs to be checked the same day to protect your sight.',
  },
  trauma5d: {
    title: 'Please see a doctor today',
    text: 'Dizziness that keeps coming back or does not go away after a car accident or a hard knock to the head or neck can come from the inner ear or the neck, but it can also be a sign of damage to a neck artery or the brain. A doctor should check it today, before any treatment of the neck. If it is getting quickly worse, go to an emergency department.',
  },
  dizzyHeart: {
    title: 'This needs emergency assessment',
    text: 'Dizziness with fainting, chest pain, a racing or irregular heartbeat, or shortness of breath can come from the heart or blood pressure rather than the neck or inner ear. It needs to be checked straight away.',
  },
  dizzyDoctor: {
    title: 'Please see a doctor today',
    text: 'Sudden hearing loss in one ear, or dizziness that is constant and getting worse with vomiting or new headaches, needs a doctor to check the inner ear and the brain before the neck is treated. Sudden hearing loss is treated best when it is seen early.',
  },
  headacheDoctor: {
    title: 'Please see a doctor today',
    text: 'A new headache after 50 with a tender scalp, jaw pain when chewing or changes in vision can be inflammation of the arteries (giant cell arteritis), which needs same-day treatment to protect eyesight. A headache that wakes you with vomiting, is worse lying down, coughing or straining, or is getting steadily worse over weeks, or a new headache in pregnancy or after giving birth, should also be checked by a doctor before the neck is treated.',
  },
  upperInstab: {
    title: 'Please see a doctor before hands-on neck treatment',
    text: 'The ligaments that hold the top two neck bones together can be weakened by rheumatoid or other inflammatory arthritis, Down syndrome, long-term steroid tablets or an injury. A head that feels too heavy to hold up, a lump-in-the-throat feeling or tingling around the lips when the neck moves can be signs of that. A doctor should check the upper neck first; physiotherapy can help afterwards.',
  },
  over50Stiff: {
    title: 'Please see a doctor today',
    text: 'New stiffness in both shoulders and the neck that lasts well into the morning, with feeling generally unwell, can be polymyalgia rheumatica, an inflammatory condition treated by a doctor. With a tender scalp, jaw pain when chewing or changes in vision it can be linked to giant cell arteritis, which needs same-day treatment to protect eyesight.',
  },
  cardiac: {
    title: 'This needs emergency assessment',
    text: 'Pain in the chest, left arm or jaw that comes with sweating, nausea or breathlessness can come from the heart rather than from muscles or joints. It is treated completely differently and cannot wait.',
  },
  organ: {
    title: 'An internal cause should be ruled out first',
    text: 'Pain that does not change with movement or position, or that comes with nausea, fever or feeling unwell, can be referred from an internal organ rather than arising in the muscles or joints. A physician needs to look at that first.',
  },
  urinary: {
    title: 'A kidney or urinary cause should be ruled out first',
    text: 'Pain spreading from the flank toward the groin with fever or changes in urination can come from the kidney or urinary tract, which needs medical treatment rather than physiotherapy.',
  },
  systemic: {
    title: 'A medical cause should be checked first',
    text: 'The same joints painful and stiff on both sides, especially with prolonged morning stiffness or swelling, can point to an inflammatory or systemic condition. A physician can check for that, and physiotherapy fits alongside it.',
  },
  neuropathy: {
    title: 'A nerve or metabolic cause should be checked',
    text: 'Numbness or burning in both hands or both feet, in a glove or sock distribution, suggests the longest nerves are involved rather than a local joint problem. A physician should look for the underlying cause.',
  },
  dvt: {
    title: 'A clot in the calf should be excluded first',
    text: 'Pain at the back of the knee or in the calf with swelling, warmth or redness can be a deep vein thrombosis. That needs a medical check the same day, because physiotherapy treatment of the leg would not be safe until it is excluded.',
  },
  limb: {
    title: 'A whole painful limb with skin changes needs review',
    text: 'Pain across a whole limb with changes in skin colour, temperature, sweating or swelling is examined before physiotherapy loading begins, so the cause can be established.',
  },
}

/* Each entry: shown only when the drawing matches, in this order.
   tier 'emergency' → emergency screen (call911: 911, else go now); 'urgent' → see a physician first. */
const PATTERNS = [
  // 6 Oct 2026, general conditions cross-check (approved by Chandra), S3: sudden vision loss in one eye or one-sided weakness, for every
  // drawing (the head, neck and arm areas ask their own stroke question,
  // group "stroke", and PainAssessment.jsx then leaves this one out).
  {
    id: 'pc-stroke', tier: 'emergency', call911: true, why: WHY.stroke,
    text: 'Starting in the last few hours: sudden loss of vision in one eye, a face that droops, weakness or numbness down one side of the body, or slurred speech',
    when: (z) => z.length > 0,
  },
  {
    // Dizziness reported after a head injury (the head's D8). The safety
    // screen asked about it first (groups "trauma5d" and "trauma5d-doc");
    // this confirms it when the answers say so, so it cannot slip through.
    // Getting quickly worse was the emergency question on the first page.
    id: 'pc-trauma5d', tier: 'urgent', sameDay: true, why: WHY.trauma5d,
    text: 'Since the accident or knock, dizziness that keeps coming back or will not go away, or double vision, slurred speech, trouble swallowing, falls or blackouts, feeling sick, face numbness, or flickering eyes',
    when: (z, a) => [].concat(a.D8 || []).includes('dizzy'),
  },
  // Axial spondyloarthritis (the low back's L9 or the pelvis's P6, document
  // v1.0, 2 Oct 2026): a fracture in a known AS spine, then uveitis.
  {
    id: 'pc-as-fracture', tier: 'emergency', call911: true, keepNeckStill: true, why: WHY.asFracture,
    text: 'Since a fall or jolt, even a minor one, new and severe neck or back pain',
    when: (z, a) => [...[].concat(a.L9 || []), ...[].concat(a.P6 || [])].includes('diagnosed'),
  },
  {
    id: 'pc-uveitis', tier: 'urgent', sameDay: true, why: WHY.uveitis,
    text: 'A painful, red eye with blurred vision or sensitivity to light',
    when: (z, a) => [...[].concat(a.L9 || []), ...[].concat(a.P6 || [])].some((x) => ['morning', 'exercise', 'night', 'related', 'diagnosed'].includes(x)),
  },
  // Nervous system rather than muscle or joint ("Multiple Sclerosis" document
  // v0.1, 2 Oct 2026, route A; not named as MS, its open item 1): for anyone
  // who described pins and needles or numbness. A yes holds the booking
  // until a doctor has seen them (noBooking).
  {
    id: 'pc-neuro', tier: 'urgent', noBooking: true, why: WHY.neuroScreen,
    text: 'Not explained by a neurological condition you have already been diagnosed with: in the last few months, double vision, or vision in one eye that went blurred and then recovered; a brief electric-shock feeling down your back or limbs when you bend your head forward; numbness or weakness clearly worse when you are hot; or earlier episodes of numbness, weakness or unsteadiness that came and went on their own',
    // 6 Oct 2026, general conditions cross-check (approved by Chandra), S4: weakness or the neck's cord signs too (the MS document scores
    // weakness, heaviness or clumsiness as numbness).
    when: (z, a) => msTrigger(a),
  },
  {
    id: 'pc-optic', tier: 'urgent', sameDay: true, noBooking: true, why: WHY.optic,
    text: 'Over the last few days, blurred, dim or washed-out vision in one eye, especially if it hurts to move the eye',
    when: (z, a) => msTrigger(a),
  },
  // Weakness from nerve-muscle or muscle disease ("Myasthenia Gravis" and
  // "Myotonic Dystrophy" documents, signed 2 Oct 2026, route A; not named, as
  // both documents recommend one "nerve and muscle" gate). First the crisis
  // question, for anyone who described weakness: breathing or swallowing
  // failure (myasthenic crisis) or a heart rhythm problem (myotonic
  // dystrophy) is 911.
  {
    id: 'pc-muscle-crisis', tier: 'emergency', call911: true, why: WHY.muscleCrisis,
    // 6 Oct 2026, general conditions cross-check (approved by Chandra), S5: new or worsening breathing trouble (long-standing breathlessness
    // lying flat from heart or lung disease is not this).
    text: 'With the weakness, new or getting worse over hours or days: difficulty breathing or being breathless when you lie flat, a weak cough, trouble swallowing or clearing saliva, or fainting, near-fainting or a racing or irregular heartbeat',
    when: (z, a) => weakAnswer(a),
  },
  {
    id: 'pc-gbs', tier: 'emergency', why: WHY.gbs,
    text: 'Weakness that is spreading up from your feet over hours to days, often with tingling',
    when: (z, a) => weakAnswer(a),
  },
  // Sudden painless weakness of both legs ("Hyperthyroidism" document, signed
  // by Chandra, 3 Oct 2026; thyrotoxic periodic paralysis, ancestry-
  // neutral): 911. For both legs or both hips drawn, or a weakness answer
  // with a leg, hip or low-back drawing. Near the top, so no count limit
  // can cut it.
  {
    id: 'pc-paralysis', tier: 'emergency', call911: true, why: PARALYSIS_FLAG.why,
    text: PARALYSIS_FLAG.text,
    when: (z, a) => ['hip', 'thigh', 'knee', 'lowerleg', 'ankle', 'foot'].some((t) => bothSides(z, t)) ||
      (weakAnswer(a) && has(z, 'lowerback', 'sij', 'hip', 'thigh', 'knee', 'lowerleg', 'ankle', 'foot')),
  },
  // After a Dupuytren's procedure (the hand's H2, document signed by Chandra, 2 Oct 2026).
  {
    id: 'pc-hand-procedure', tier: 'urgent', sameDay: true, why: WHY.handProcedure,
    text: 'Since the procedure on your hand: a hot, red, increasingly swollen hand, pus, spreading redness or a fever; new numbness in a fingertip; or a finger you suddenly cannot bend',
    when: (z, a) => [].concat(a.H2 || []).includes('procedure'),
  },
  // CRPS (the shared W9 / H9 / A9 / B9 question, document v1.0 draft, 2 Oct 2026): infection
  // after the injury or operation needs a doctor the same day.
  {
    id: 'pc-crps-infection', tier: 'urgent', sameDay: true, why: WHY.crpsInfection,
    text: 'Since the injury or operation, a wound or pin site with discharge or spreading redness, or a fever, chills or feeling unwell',
    when: (z, a) => ['W9', 'H9', 'A9', 'B9'].some((id) => [].concat(a[id] || []).includes('trigger')),
  },
  // Dizziness ticked on the neck's N9 (cervicogenic dizziness document,
  // section 6). Its stroke-type and after-injury flags are on the first safety
  // pages already; these two only make sense once dizziness is reported.
  {
    id: 'pc-dizzy-heart', tier: 'emergency', call911: true, why: WHY.dizzyHeart,
    text: 'With the dizziness: fainting, chest pain, a racing or irregular heartbeat, or shortness of breath',
    when: (z, a) => [].concat(a.N9 || []).includes('dizzy'),
  },
  {
    id: 'pc-dizzy-doctor', tier: 'urgent', sameDay: true, why: WHY.dizzyDoctor,
    text: 'Sudden hearing loss in one ear, or dizziness that is constant and getting worse, with vomiting or new headaches',
    when: (z, a) => [].concat(a.N9 || []).includes('dizzy'),
  },
  // Headaches reported on the neck's N4, from the "Cervicogenic Headache"
  // document's red flags (SNNOOP10, 28 Sep 2026). The head area asks these on
  // its own safety pages, so this is only for a neck drawn without the head.
  {
    id: 'pc-headache', tier: 'urgent', sameDay: true, why: WHY.headacheDoctor,
    text: 'With the headaches: a new headache after age 50 with a tender scalp, jaw pain when chewing or vision changes; a headache that wakes you with vomiting, is worse lying down, coughing or straining, or is getting steadily worse over weeks; or a new headache in pregnancy or after giving birth',
    when: (z, a) => !has(z, 'head') && [].concat(a.N4 || []).some((id) => id !== 'none'),
  },
  // A neck-type headache on the head's questions with the neck not drawn:
  // the neck's upper-neck instability question (nrf-upperinstab) was not on
  // the safety pages. "Cervicogenic Headache" document v1.0, 28 Sep 2026.
  {
    id: 'pc-upperinstab', tier: 'urgent', why: WHY.upperInstab,
    text: 'Rheumatoid or another inflammatory arthritis, Down syndrome or long-term steroid tablets; a head that feels too heavy to hold up; or a lump-in-the-throat feeling or tingling around the lips when you move your neck',
    when: (z, a) => !has(z, 'neck') && ([].concat(a.D1 || []).includes('sameside') ||
      [].concat(a.D3 || []).some((id) => ['neckmove', 'neckmovesome', 'skullbase', 'turnstiff', 'withneck'].includes(id))),
  },
  // Over 50 with neck pain: polymyalgia rheumatica and giant cell arteritis
  // ("Upper Cervical Pain" document v1.0, red flags and look-alikes).
  // Not when the headache check above already asks about giant cell arteritis.
  {
    id: 'pc-over50stiff', tier: 'urgent', sameDay: true, why: WHY.over50Stiff,
    text: 'New stiffness in both shoulders and your neck lasting more than 45 minutes in the morning, with feeling unwell; or a tender scalp, jaw pain when chewing, or changes in your vision',
    when: (z, a) => has(z, 'neck') && !has(z, 'head') && over50(a.age) &&
      ![].concat(a.N4 || []).some((id) => id !== 'none'),
  },
  {
    id: 'pc-cardiac', tier: 'emergency', call911: true, why: WHY.cardiac,
    text: 'Pain or tightness in the chest, left arm or jaw — especially with sweating, nausea, or shortness of breath',
    // Spec's cardiac map: central chest, left arm, jaw. Deliberately NOT every
    // neck drawing — that would put a heart-attack question in front of
    // everyone with a stiff neck.
    when: (z) => has(z, 'chest') || onSide(z, 'L', 'shoulder', 'upperarm', 'elbow', 'forearm', 'wrist', 'hand'),
  },
  {
    // Spec: back of the knee / calf — "swollen calf + red/warm → screen DVT".
    id: 'pc-dvt', tier: 'urgent', sameDay: true, why: WHY.dvt,
    text: 'Swelling, warmth or redness in the calf or the back of the knee',
    when: (z) => onFace(z, 'back', 'knee', 'lowerleg', 'ankle'),
  },
  {
    id: 'pc-visceral', tier: 'urgent', why: WHY.organ,
    text: 'Pain that does not change at all with movement or position, or that comes with nausea, fever, or feeling unwell',
    // Gallbladder/liver (right shoulder blade), diaphragm (shoulder), stomach
    // and pancreas (mid back) maps. The flank → groin map has its own item.
    when: (z) => has(z, 'chest', 'abdomen', 'upperback', 'tlj') || onSide(z, 'R', 'shoulder'),
  },
  {
    id: 'pc-urinary', tier: 'urgent', why: WHY.urinary,
    text: 'Pain spreading from your side or flank toward the groin, or fever, blood in the urine, or burning when passing urine',
    when: (z) => has(z, 'lowerback', 'tlj', 'flank', 'sij', 'abdomen', 'hip'),
  },
  {
    // The escape the nerve, muscle and myositis screens already carry
    // (6 Oct 2026 audit, approved by Chandra): someone with diagnosed
    // rheumatoid or another inflammatory arthritis answers this truthfully
    // and was being told a medical cause should be checked first — for the
    // condition they are already under care for.
    id: 'pc-inflammatory', tier: 'urgent', why: WHY.systemic,
    text: 'Not explained by an inflammatory arthritis you have already been diagnosed with: the same joints painful, stiff or swollen on BOTH sides, with morning stiffness lasting more than 30 minutes',
    when: (z, a) => ['wrist', 'hand', 'knee', 'ankle', 'foot', 'elbow', 'shoulder', 'thigh'].some((t) => bothSides(z, t))
      && [].concat(a.pattern24 || []).includes('amLong'),
  },
  {
    // Doctor first, no booking until then ("DiabetesMellitus" document, 3 Oct
    // 2026); left out with known diabetes (../data/diabetes.js, NERVE_WHY).
    id: 'pc-polyneuropathy', tier: 'urgent', noBooking: true, why: WHY.neuropathy,
    text: 'Numbness, tingling or burning in BOTH hands or BOTH feet, like wearing gloves or socks',
    when: (z) => bothSides(z, 'wrist') || bothSides(z, 'hand') || bothSides(z, 'lowerleg') || bothSides(z, 'ankle') || bothSides(z, 'foot'),
  },
  {
    id: 'pc-limb', tier: 'urgent', why: WHY.limb,
    text: 'Changes in the skin colour, temperature, sweating or swelling of the painful arm or leg',
    when: (z) => limbSpread(z, 'L') >= 3 || limbSpread(z, 'R') >= 3,
  },
  // Early signs of a muscle condition in a young child ("DuchenneMD"
  // document, signed by Chandra, 2 Oct 2026, route A; Duchenne is not named
  // on this screen). For an "Under 5" or "5 to 15" answer with the legs, hips or low back
  // drawn: the parent answers for the child. Never reassures; a yes holds the
  // booking until a doctor has seen the child (noBooking).
  {
    // Same escape (6 Oct 2026 audit): these are the signs of Duchenne, which
    // is on the cautions list, so a family already under a neuromuscular team
    // was being sent back to a doctor and refused a booking.
    id: 'pc-child-muscle', tier: 'urgent', noBooking: true, why: WHY.childMuscle,
    text: 'Not explained by a muscle condition the child has already been diagnosed with: getting up from the floor by turning onto the front and pushing the hands up the legs; much slower than other children at running, jumping or climbing stairs; walking late (after 18 months) or losing a skill they used to have; walking on the toes, waddling, or a swayed lower back; or unusually large, firm calves',
    // 6 Oct 2026, general conditions cross-check (approved by Chandra), S6: from 5 to 15, not for one sports knee.
    when: (z, a) => (a.age === 'u5' && has(z, 'lowerback', 'hip', 'thigh', 'knee', 'lowerleg', 'ankle', 'foot')) ||
      (a.age === 'u18' && (weakAnswer(a) || has(z, 'lowerback', 'hip', 'thigh') ||
        ['knee', 'lowerleg', 'ankle', 'foot'].some((t) => bothSides(z, t)))),
  },
  // Rickets ("Osteomalacia" document, v0.1, 4 Oct 2026; the child route):
  // bowed legs or knock-knees, thick wrists or ankles, a bumpy chest, leg
  // aches or late walking or teeth. Doctor first, no booking. ./osteomalacia.js
  {
    id: 'pc-rickets', tier: 'urgent', noBooking: true, why: RICKETS_SCREEN.why,
    text: RICKETS_SCREEN.text,
    // Under 5: any leg or wrist; 5 to 15: both legs (a teenager's one sore wrist is not asked).
    when: (z, a) => (a.age === 'u5' && has(z, 'thigh', 'knee', 'lowerleg', 'ankle', 'wrist')) ||
      (a.age === 'u18' && (['thigh', 'knee', 'lowerleg'].some((t) => bothSides(z, t)) ||
        // 6 Oct 2026, general conditions cross-check (approved by Chandra), C3: one leg for 6 weeks or more (one-sided bowing is a doctor matter too).
        (has(z, 'thigh', 'knee', 'lowerleg') && ['d3m', 'o3m', 'years'].includes(a.duration)))),
  },
  // Pain in one bone that is not settling ("Osteosarcoma" document, v0.1,
  // 4 Oct 2026; the recognition rule, every area): one knee, shin, thigh,
  // hip or pelvis, shoulder or upper arm drawn, for 2 weeks or more (the
  // question says three). X-ray, no booking: today or tomorrow up to 29
  // (NICE NG12, 48 hours), this week from 30. Never names cancer. ./boneTumour.js
  {
    id: 'pc-bone-young', tier: 'urgent', sameDay: true, noBooking: true, why: BONE_WHY_YOUNG,
    text: BONE_SCREEN.text,
    when: (z, a) => YOUNG.includes(a.age) && !!a.duration && a.duration !== 'd2w' && oneBone(z),
  },
  {
    id: 'pc-bone', tier: 'urgent', noBooking: true, why: BONE_WHY_ADULT,
    // Narrower from 30 (rotator cuff, frozen shoulder and arthritis also wake people).
    text: BONE_SCREEN_ADULT.text,
    when: (z, a) => !!a.age && !YOUNG.includes(a.age) && !!a.duration && a.duration !== 'd2w' && oneBone(z),
  },
  // Paget's disease of bone ("Pagets Disease" document, v0.1, 4 Oct 2026;
  // route A): 50 and over, one shin, thigh, hip, pelvis, low back or head
  // area, for 6 weeks or more. Family doctor for a blood test and an X-ray
  // in the next few weeks; booking still offered. ./paget.js
  {
    id: 'pc-paget', tier: 'urgent', why: PAGET_SCREEN.why,
    text: PAGET_SCREEN.text,
    when: (z, a) => pagetApplies(z, a),
  },
  // Polymyalgia rheumatica over 50, as its own doctor-first entry (Chandra,
  // 2 Oct 2026, the "Poly myositis" document's open item 5): both shoulders
  // or both hips (upper arms, thighs), not the neck (pc-over50stiff asks
  // there). The giant cell arteritis signs make it same day.
  {
    id: 'pc-pmr', tier: 'urgent', sameDay: true, noBooking: true, why: WHY.pmr,
    text: 'New aching and stiffness in both shoulders or both hips (or upper arms or thighs) over the last few weeks, lasting more than 45 minutes in the morning and making it hard to get out of bed, dress or lift your arms, often with tiredness or feeling unwell; or a new headache, a tender scalp, jaw pain when chewing, or changes in your vision',
    when: (z, a) => over50(a.age) && !has(z, 'neck') &&
      (['shoulder', 'upperarm', 'hip', 'thigh'].some((t) => bothSides(z, t)) || (has(z, 'shoulder') && has(z, 'hip'))),
  },
  // Inflammatory myopathy ("Poly myositis" document, signed by Chandra,
  // 2 Oct 2026; route A, the subacute symmetrical proximal
  // part of the nerve and muscle gate, not named). Before the general screen,
  // for the same triggers. A yes holds the booking (doctor this week, CK).
  {
    id: 'pc-myositis', tier: 'urgent', noBooking: true, why: WHY.myositisScreen, adultOnly: true,
    text: 'Not explained by a condition you have already been diagnosed with: weakness in both thighs or hips, or both shoulders or upper arms, that has built up steadily over weeks to a few months without an injury (trouble getting up from a chair or out of a car, climbing stairs, or lifting your arms to wash your hair), with or without a purple or red rash on the eyelids, knuckles, chest or upper back, a new dry cough or breathlessness, or trouble swallowing',
    // Proximal only: a weak grip or foot drop alone goes to the general screen.
    when: (z, a) => adult(a) && ((weakAnswer(a) && has(z, 'neck', 'shoulder', 'upperarm', 'hip', 'thigh', 'knee')) ||
      ['shoulder', 'upperarm', 'hip', 'thigh'].some((t) => bothSides(z, t))),
  },
  // Cortisol or steroid medicine ("Cushings Syndrome" document, signed by
  // Chandra, 3 Oct 2026; route A, not named): the same both-sided proximal
  // weakness with steroid medicine or the body changes. A yes holds the
  // booking (family doctor in the next week or two). ./steroids.js
  {
    id: 'pc-hormone', tier: 'urgent', noBooking: true, why: HORMONE_SCREEN.why,
    text: HORMONE_SCREEN.text,
    when: (z, a) => adult(a) && ((weakAnswer(a) && has(z, 'shoulder', 'upperarm', 'hip', 'thigh', 'knee')) ||
      ['shoulder', 'upperarm', 'hip', 'thigh'].some((t) => bothSides(z, t))),
  },
  // Too little pituitary hormone ("Hypopituitarism" document, signed by
  // Chandra, 3 Oct 2026; route A, not named): exhaustion or both-sided muscle
  // loss for months with one of its causes (pituitary or brain tumour or
  // treatment, a significant head injury, a childbirth with heavy bleeding,
  // cancer immunotherapy). Asked for both-sided weakness drawings, a
  // widespread drawing, a weakness answer, or a head problem lasting more
  // than 3 months (the concussion cross-link). A yes holds the booking.
  {
    id: 'pc-lowhormone', tier: 'urgent', noBooking: true, why: LOW_HORMONE_SCREEN.why,
    text: LOW_HORMONE_SCREEN.text,
    when: (z, a) => adult(a) && (weakAnswer(a) || ['shoulder', 'upperarm', 'hip', 'thigh'].some((t) => bothSides(z, t)) ||
      typesOf(z).size >= 4 || (has(z, 'head') && ['o3m', 'years'].includes(a.duration))),
  },
  // The nerve and muscle screen (myasthenia gravis: fatigable, eyes and
  // bulbar, worse by evening; myotonic dystrophy: grip myotonia, both hands
  // or feet, family history). For a weakness answer, or weakness-type
  // drawings on both sides (shoulders, upper arms, hips, thighs). Last in the
  // list, so it never pushes out the checks above. A yes holds the booking
  // until a doctor has seen them (noBooking, in the next few days).
  {
    id: 'pc-muscle', tier: 'urgent', noBooking: true, why: WHY.muscleScreen, adultOnly: true,
    text: 'Not explained by a condition you have already been diagnosed with: muscles that work at first, then fade the more you use them and recover after rest (often worse by evening); a drooping eyelid or double vision that comes and goes; your jaw tiring when you chew, or speech becoming slurred or nasal as you talk; a grip that is slow to let go, especially in the cold; or weakness in both hands or both feet that has crept on over months or years, especially with early cataracts or muscle weakness in the family',
    when: (z, a) => weakAnswer(a) || ['shoulder', 'upperarm', 'hip', 'thigh'].some((t) => bothSides(z, t)),
  },
  // Calcium balance ("Hyperparathyroidism" document, signed by Chandra,
  // 3 Oct 2026; route A): deep bone aches on both sides with stones, an easy
  // fracture or thin bones, the thirst/constipation/mood cluster, or a high
  // calcium result never followed up. Last, so it never pushes out the
  // checks above. A yes holds the booking (family doctor, a blood test).
  {
    id: 'pc-calcium', tier: 'urgent', noBooking: true, why: CALCIUM_SCREEN.why, adultOnly: true,
    text: CALCIUM_SCREEN.text,
    when: (z) => ['lowerleg', 'thigh', 'hip'].some((t) => bothSides(z, t)) || typesOf(z).size >= 4,
  },
  // An overactive thyroid ("Hyperthyroidism" document, signed by
  // Chandra, 3 Oct 2026; route A): both-sided weakness with weight loss, or the
  // racing-heart/heat/tremor cluster with a neck swelling or eye changes.
  // Last, like the calcium question. A yes holds the booking.
  {
    id: 'pc-thyroid', tier: 'urgent', noBooking: true, why: THYROID_SCREEN.why, adultOnly: true,
    text: THYROID_SCREEN.text,
    when: (z, a) => weakAnswer(a) || ['shoulder', 'upperarm', 'hip', 'thigh'].some((t) => bothSides(z, t)),
  },
  // An underactive thyroid ("Hypothyroidism" document, signed by Chandra,
  // 3 Oct 2026; route A): stiff, achy, slow-to-recover muscles on both
  // sides, or both hands numb at night, with the "slowing" cluster. Doctor
  // in the next few weeks, but booking is still offered (its open item 1).
  {
    id: 'pc-hypothyroid', tier: 'urgent', why: HYPOTHYROID_SCREEN.why, adultOnly: true,
    text: HYPOTHYROID_SCREEN.text,
    when: (z, a) => weakAnswer(a) || ['shoulder', 'upperarm', 'thigh', 'lowerleg', 'hand', 'wrist'].some((t) => bothSides(z, t)) ||
      typesOf(z).size >= 4,
  },
  // Growth-hormone excess ("Acromegaly" document, signed by Chandra,
  // 3 Oct 2026; route A): the growth change is the gate. Booking still offered.
  {
    id: 'pc-acromegaly', tier: 'urgent', why: ACROMEGALY_SCREEN.why, adultOnly: true,
    text: ACROMEGALY_SCREEN.text,
    when: (z) => ['knee', 'hip', 'shoulder', 'hand', 'wrist'].some((t) => bothSides(z, t)) || has(z, 'jaw') || typesOf(z).size >= 4,
  },
]

/** Safety-check questions this drawing calls for, most serious first.
    `zones` = the drawn areas, `answers` = answers so far. Capped, so the
    safety screen stays short enough to read. */
export function patternChecks(zones = [], answers = {}, max = 3) {
  if (!zones.length) return []
  const out = []
  for (const p of PATTERNS) {
    if (out.length >= max) break
    // call911 and keepNeckStill pick the emergency screen (./emergencyAdvice.js).
    try {
      // 6 Oct 2026, general conditions cross-check (approved by Chandra), S6: the adult muscle, hormone and calcium screens are not for children.
      if (p.adultOnly && !adult(answers)) continue
      if (p.when(zones, answers)) out.push({ id: p.id, text: p.text, tier: p.tier, why: p.why,
        ...(p.sameDay ? { sameDay: true } : {}), ...(p.call911 ? { call911: true } : {}), ...(p.keepNeckStill ? { keepNeckStill: true } : {}),
        ...(p.noBooking ? { noBooking: true } : {}) })
    } catch { /* skip */ }
  }
  return out
}

/** The five numbers the spec asks for, from the drawing alone.
    Used for the pattern read-out; the questions still decide the route. */
export function drawingShape(zones = [], lines = []) {
  const types = typesOf(zones)
  const sides = new Set(zones.map((z) => (z.id.endsWith('L') ? 'L' : z.id.endsWith('R') ? 'R' : 'M')))
  const linear = lines.some((ids) => new Set(ids.map((i) => i.replace(/[LR]$/, ''))).size >= 2)
  return {
    regions: types.size,
    marks: zones.length,
    crossesMidline: (sides.has('L') && sides.has('R')) || sides.has('M'),
    linear,
    widespread: types.size >= 4,
  }
}
