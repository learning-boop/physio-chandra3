/* ─────────────────────────────────────────────────────────────────────────
   Injury screens, shown straight after the safety check when a recent injury
   could need medical care first. One per region document that has one:

     neck      the Canadian C-Spine Rule, adapted (Stiell et al., JAMA 2001),
               from the cervical document, section B2 — also run for the base
               of the neck (its document routes its injury flag here)
     shoulder  fall, dislocation or sudden pull (shoulder document, B2)
     arm       fall, blow or sudden force to the upper arm (upper arm, B2)
     elbow     fall, blow or sudden force to the elbow (elbow, B2)
     forearm   fall, blow or crush (forearm, B2)

   Questions are asked in order and the first answer that routes ends that
   screen. The site can only send people on to medical care from here, never
   clear them. When several apply (an upper-arm mark also asks the shoulder),
   they run one after another until one routes. The shoulder, upper arm,
   elbow and forearm share one opening question when two or more of them apply (see
   "One arm gate" below), and a question asked word for word by an earlier
   screen is not asked again.

   Answers are stored as "<screen>:<question>", e.g. "neck:I1"; the shared
   arm question as "limb:I1" (and "limb:I2", when it happened).
   Pure logic, no React, so scripts/check-region-tests.mjs runs the same rules.
   FOR CLINICIAN REVIEW: the final route of the neck I7 (I7_PASS_ROUTE).
   ───────────────────────────────────────────────────────────────────────── */

/* ── Neck: Canadian C-Spine Rule ── */
export const INJURY_QUESTIONS = [
  { id: 'I1', text: 'Has your neck been hurt in an accident or injury in the last 7 days?', options: [
    { id: 'no', label: 'No' },
    { id: 'vehicle', label: 'Yes, a car or other vehicle accident' },
    { id: 'fall', label: 'Yes, a fall' },
    { id: 'sport', label: 'Yes, sport, or a blow to the head or neck' },
  ]},
  { id: 'I2', text: 'When did it happen?', options: [
    { id: 'h48', label: 'Within the last 48 hours' },
    { id: 'd7', label: '2 to 7 days ago' },
  ]},
  { id: 'I3', text: 'Are you 65 or older?', options: [
    { id: 'yes', label: 'Yes' },
    { id: 'no', label: 'No' },
  ]},
  { id: 'I4', text: 'Was it any of these? Tick all that apply.', multi: true, options: [
    { id: 'height', label: 'A fall from 1 metre (3 feet) or 5 stairs or higher' },
    { id: 'axial', label: 'Diving, or a blow landing on top of the head' },
    { id: 'mvc', label: 'A crash at highway speed, a rollover, or being thrown from the vehicle' },
    { id: 'recreational', label: 'An accident on an ATV, snowmobile, dirt bike, or similar' },
    { id: 'bicycle', label: 'A bicycle crash' },
    { id: 'none', label: 'None of these' },
  ]},
  { id: 'I5', text: 'Since the injury, have you had pins and needles or numbness in your arms, hands, or legs?', options: [
    { id: 'yes', label: 'Yes' },
    { id: 'no', label: 'No' },
  ]},
  { id: 'I6', text: 'Which of these are true? Tick all that apply.', multi: true, options: [
    { id: 'rearend', label: 'It was a simple rear-end collision (not hit by a bus or large truck, not pushed into oncoming traffic, no rollover)' },
    { id: 'walked', label: 'I have been able to walk around at any time since the injury' },
    { id: 'delayed', label: 'The neck pain came on later, not straight away' },
    { id: 'none', label: 'None of these' },
  ]},
  { id: 'I7', text: 'Slowly turn your head as far as is comfortable to the left, then to the right. Stop if it hurts sharply; don’t push through it. Can you turn at least halfway to each shoulder?', options: [
    { id: 'yes', label: 'Yes, both ways' },
    { id: 'no', label: 'No, not one or both ways' },
  ]},
]

/* The document routes a full pass (turns halfway both ways, within 48 hours)
   to PHYSICIAN FIRST and asks Chandra whether it should be results + booking
   instead. Kept at the safer route until that is decided. */
export const I7_PASS_ROUTE = 'urgent'

const WHY = {
  age: 'Being 65 or older is a high-risk factor after a neck injury',
  mechanism: 'The way the injury happened carries a high risk of a neck fracture',
  nerve: 'Pins and needles or numbness after a neck injury can mean a nerve or the spinal cord is involved',
  noLowRisk: 'Without any low-risk features, the neck cannot safely be moved or tested outside hospital',
  rotation: 'Not being able to turn the head halfway each way after an injury needs an X-ray or scan',
  pass: 'Tenderness over the spine after a recent injury can only be checked in person, so a doctor should see you before physiotherapy',
}

const list = (v) => (Array.isArray(v) ? v : v === undefined ? [] : [v])
const ticked = (v) => list(v).length > 0

/** Lower bound of an age answer id ('o64' → 65, '50-64' → 50, 'a65' → 65), or null. */
export function ageFrom(id) {
  if (!id) return null
  let m
  if ((m = /^u(\d+)$/.exec(id))) return 0
  if ((m = /^o(\d+)$/.exec(id))) return Number(m[1]) + 1
  if ((m = /^a?(\d+)(-\d+)?$/.exec(id))) return Number(m[1])
  return null
}

/** Where the screen goes next.
    `answers` holds I1–I7; `ageId` is the opening-screen age answer, which
    pre-fills I3 when it is known.
    Returns { next: 'I3' } while a question is still needed, else
    { route: 'skip' | 'continue' | 'urgent' | 'emergency', why?: string }. */
export function injuryStep(answers = {}, ageId) {
  const a = answers
  if (a.I1 === undefined) return { next: 'I1' }
  if (a.I1 === 'no') return { route: 'skip' }
  if (a.I2 === undefined) return { next: 'I2' }
  const acute = a.I2 === 'h48'
  const high = acute ? 'emergency' : 'urgent'

  // Step 1: any high-risk factor.
  const age = ageFrom(ageId)
  const old = age !== null && age >= 65 ? true : a.I3 === 'yes' ? true : age !== null || a.I3 === 'no' ? false : null
  if (old === null) return { next: 'I3' }
  if (old) return { route: high, why: WHY.age }
  if (!ticked(a.I4)) return { next: 'I4' }
  if (list(a.I4).some((x) => x !== 'none')) return { route: high, why: WHY.mechanism }
  if (a.I5 === undefined) return { next: 'I5' }
  if (a.I5 === 'yes') return { route: high, why: WHY.nerve }
  // Older injuries with no high-risk factor go on to the region questions.
  if (!acute) return { route: 'continue' }

  // Step 2: a low-risk factor that makes it safe to test movement.
  if (!ticked(a.I6)) return { next: 'I6' }
  if (!list(a.I6).some((x) => x !== 'none')) return { route: 'emergency', why: WHY.noLowRisk }
  // Step 3: can turn 45° each way.
  if (a.I7 === undefined) return { next: 'I7' }
  if (a.I7 === 'no') return { route: 'emergency', why: WHY.rotation }
  return { route: I7_PASS_ROUTE, why: WHY.pass }
}

const yesNo = (yes, why) => [
  { id: 'yes', label: 'Yes', route: yes, why },
  { id: 'no', label: 'No' },
]

/* ── Shoulder: fall, dislocation or sudden pull (BESS pathways) ── */
export const SHOULDER_INJURY = [
  { id: 'I1', text: 'Has your shoulder been hurt in a fall, accident, or sport in the last 6 weeks?', options: [
    { id: 'no', label: 'No', route: 'skip' },
    { id: 'fall', label: 'Yes, I fell onto my arm or shoulder' },
    { id: 'popped', label: 'Yes, it popped out of place' },
    { id: 'pull', label: 'Yes, a sudden pull, lift, or jerk' },
  ]},
  { id: 'I2', text: 'Is your shoulder still out of place, or does it look a different shape, or is there a new lump or step at the top of the shoulder?',
    options: yesNo('emergency', 'Possible dislocation or fracture that has not been put back') },
  { id: 'I3', text: 'Since the injury, has your arm or hand been cold, pale, or blue?',
    options: yesNo('emergency', 'Possible blood vessel injury') },
  { id: 'I4', text: 'Since the injury, have you been unable to lift your arm at all, or is there a numb patch on the outer upper arm?',
    options: yesNo('urgent', 'Possible acute rotator cuff tear or nerve injury: an early surgical opinion matters') },
  { id: 'I5', text: 'Did it pop out for the first time, and are you 40 or older?', askIf: (a) => a.I1 === 'popped',
    options: yesNo('urgent', 'Rotator cuff tear and nerve injury are common after a first dislocation over 40') },
  { id: 'I6', text: 'Did it happen during a seizure (fit) or an electric shock?',
    options: yesNo('urgent', 'Possible dislocation to the back of the shoulder, which is often missed') },
]

/* ── Upper arm: fall, blow or sudden force ── */
export const ARM_INJURY = [
  { id: 'I1', text: 'Has your upper arm been hurt in a fall, accident, blow, or heavy lift in the last 2 weeks?', options: [
    { id: 'no', label: 'No', route: 'skip' },
    { id: 'fall', label: 'Yes, a fall' },
    { id: 'blow', label: 'Yes, a blow to the arm' },
    { id: 'pop', label: 'Yes, I felt a pop or tear while lifting' },
  ]},
  { id: 'I2', text: 'Is the arm a different shape, or is bone showing through the skin?',
    options: yesNo('emergency', 'Possible fracture') },
  { id: 'I3', text: 'Since the injury, is your hand cold, pale, or blue, or is your whole hand numb?',
    options: yesNo('emergency', 'Possible blood vessel or nerve injury') },
  { id: 'I4', text: 'Is the pain in your upper arm getting worse and worse, with the arm tight and swollen, and much worse when your elbow or fingers are moved?',
    options: yesNo('emergency', 'Possible compartment syndrome (pressure building up in the arm)') },
  { id: 'I5', text: 'Since the injury, can you not lift your wrist or straighten your fingers?',
    options: yesNo('urgent', 'Possible radial nerve injury, often with a fracture of the upper arm bone'), sameDay: true },
  // Chandra, 25 Sep 2026: a sudden forced effort, a pop, click or tearing
  // feeling, and a change in the shape of the biceps mean a doctor the same
  // day, at any age (this replaced the document's under-40 cut-off).
  { id: 'I6', text: 'Did you feel a pop, click, or tearing at the front of the shoulder or upper arm during a sudden, forceful lift or pull, and has the shape of your biceps changed since (a new bulge low in the arm)?',
    askIf: (a) => a.I1 === 'pop', sameDay: true,
    options: yesNo('urgent', 'Possible torn biceps tendon: a doctor should check it the same day') },
]

/* ── Elbow: fall, blow or sudden force ── */
export const ELBOW_INJURY = [
  { id: 'I1', text: 'Has your arm or elbow been hurt in a fall, accident, blow, or heavy lift in the last 2 weeks?', options: [
    { id: 'no', label: 'No', route: 'skip' },
    { id: 'fall', label: 'Yes, I fell onto my hand or elbow' },
    { id: 'blow', label: 'Yes, a blow to the arm or elbow' },
    { id: 'pop', label: 'Yes, I felt a pop while lifting or pulling' },
  ]},
  { id: 'I2', text: 'Is the arm or elbow a different shape, or is bone showing through the skin?',
    options: yesNo('emergency', 'Possible fracture or dislocation') },
  { id: 'I3', text: 'Since the injury, is your hand cold, pale, or blue, or is your whole hand numb?',
    options: yesNo('emergency', 'Possible blood vessel or nerve injury') },
  { id: 'I4', text: 'Is the pain in your forearm getting worse and worse, with the forearm tight and swollen, and much worse when your fingers are moved?',
    options: yesNo('emergency', 'Possible compartment syndrome (pressure building up in the forearm)') },
  // Asked after a pop only: it does not fit a fall or a blow.
  // Same day (Chandra, 25 Sep 2026): a sudden forced effort, a pop, click or
  // tearing feeling, and a change in the shape of the biceps.
  { id: 'I5', text: 'Did you feel a pop, click, or tearing at the front of the elbow during a sudden, forceful lift or pull, and now have bruising there or a change in the shape of your biceps?',
    askIf: (a) => a.I1 === 'pop', sameDay: true,
    options: yesNo('urgent', 'Possible torn biceps tendon at the elbow: repair works best within about 2 to 3 weeks, so a doctor should check it the same day') },
  // The elbow extension test (Appelboam 2008): a possible fracture, so same day.
  { id: 'I6', text: 'After the fall or blow, can you fully straighten your elbow?',
    askIf: (a) => a.I1 === 'fall' || a.I1 === 'blow', sameDay: true, options: [
      { id: 'yes', label: 'Yes, fully' },
      { id: 'no', label: 'No, it will not straighten fully', route: 'urgent',
        why: 'Not being able to straighten the elbow after an injury raises the chance of a fracture' },
    ]},
]

/* ── Forearm: fall, blow or crush ── */
export const FOREARM_INJURY = [
  { id: 'I1', text: 'Has your forearm been hurt in a fall, accident, blow, or crush in the last 2 weeks?', options: [
    { id: 'no', label: 'No', route: 'skip' },
    { id: 'fall', label: 'Yes, I fell onto my hand' },
    { id: 'blow', label: 'Yes, a blow to the forearm' },
    { id: 'crush', label: 'Yes, it was crushed or trapped' },
  ]},
  { id: 'I2', text: 'Is the forearm a different shape, or is bone showing through the skin?',
    options: yesNo('emergency', 'Possible fracture') },
  { id: 'I3', text: 'Since the injury, is your hand cold, pale, or blue, or is your whole hand numb?',
    options: yesNo('emergency', 'Possible blood vessel or nerve injury') },
  // Asked after a crush only: the question starts "Was the forearm crushed".
  { id: 'I4', text: 'Was the forearm crushed, and is the pain now getting worse, with the forearm tight and much worse when the fingers are moved?',
    askIf: (a) => a.I1 === 'crush',
    options: yesNo('emergency', 'Possible compartment syndrome (pressure building up in the forearm)') },
  // A possible fracture into the elbow or wrist joint: same day.
  { id: 'I5', text: 'Since the injury, can you not turn your palm up and down, or is there pain at the elbow or wrist as well as the forearm?',
    sameDay: true, options: yesNo('urgent', 'Possible forearm fracture that involves the elbow or wrist joint') },
  // Worded as the upper arm's I5, so it is asked once when both apply.
  { id: 'I6', text: 'Since the injury, can you not lift your wrist or straighten your fingers?',
    sameDay: true, options: yesNo('urgent', 'Possible radial nerve injury') },
]

/** Step through a simple screen: each question in order (skipping any whose
    askIf is false), ending at the first picked option that has a route. */
function linearStep(questions) {
  return (a = {}) => {
    for (const q of questions) {
      if (q.askIf && !q.askIf(a)) continue
      if (a[q.id] === undefined) return { next: q.id }
      for (const oid of list(a[q.id])) {
        const o = q.options.find((x) => x.id === oid)
        if (o && o.route) return { route: o.route, why: o.why, ...(q.sameDay ? { sameDay: true } : {}) }
      }
    }
    return { route: 'continue' }
  }
}

export const SCREENS = [
  // Its "see a doctor" outcome means a possible fracture: same day.
  { id: 'neck', zones: ['neck', 'ctj'], title: 'Recent Neck Injury', sameDayUrgent: true,
    flag: 'A neck injury in the last 7 days (injury screen)', questions: INJURY_QUESTIONS, step: injuryStep },
  { id: 'shoulder', zones: ['shoulder'], title: 'Recent Shoulder Injury',
    flag: 'A shoulder injury in the last 6 weeks (injury screen)', questions: SHOULDER_INJURY, step: linearStep(SHOULDER_INJURY) },
  { id: 'arm', zones: ['upperarm'], title: 'Recent Upper Arm Injury',
    flag: 'An upper arm injury in the last 2 weeks (injury screen)', questions: ARM_INJURY, step: linearStep(ARM_INJURY) },
  { id: 'elbow', zones: ['elbow'], title: 'Recent Elbow Injury',
    flag: 'An elbow injury in the last 2 weeks (injury screen)', questions: ELBOW_INJURY, step: linearStep(ELBOW_INJURY) },
  { id: 'forearm', zones: ['forearm'], title: 'Recent Forearm Injury',
    flag: 'A forearm injury in the last 2 weeks (injury screen)', questions: FOREARM_INJURY, step: linearStep(FOREARM_INJURY) },
]

/* ── One arm gate for the shoulder, upper arm and elbow ──
   When two or more of these screens apply (a line down the arm), their
   first questions ("Has your shoulder / upper arm / elbow been hurt…?")
   are asked once, as "limb:I1", and the answer is passed to each screen as
   its own I1. The shoulder looks back 6 weeks and the others 2 weeks, so
   when the shoulder is one of them, "limb:I2" asks when it happened; an
   injury 2 to 6 weeks ago opens only the shoulder's screen. */
const LIMB = ['shoulder', 'arm', 'elbow', 'forearm']
const LIMB_NAME = { shoulder: 'shoulder', arm: 'upper arm', elbow: 'elbow', forearm: 'forearm' }
// Each merged answer, as each screen's own I1 answer.
const LIMB_OPTIONS = [
  { id: 'no', label: 'No', map: { shoulder: 'no', arm: 'no', elbow: 'no', forearm: 'no' } },
  { id: 'fall', label: 'Yes, I fell onto my arm, hand, or elbow', map: { shoulder: 'fall', arm: 'fall', elbow: 'fall', forearm: 'fall' } },
  { id: 'blow', label: 'Yes, a blow to the arm', map: { shoulder: 'fall', arm: 'blow', elbow: 'blow', forearm: 'blow' } },
  { id: 'crush', label: 'Yes, my forearm was crushed or trapped', only: 'forearm', map: { shoulder: 'no', arm: 'no', elbow: 'no', forearm: 'crush' } },
  { id: 'popped', label: 'Yes, my shoulder popped out of place', only: 'shoulder', map: { shoulder: 'popped', arm: 'no', elbow: 'no', forearm: 'no' } },
  { id: 'pull', label: 'Yes, a sudden pull, jerk, or heavy lift (I may have felt a pop)', map: { shoulder: 'pull', arm: 'pop', elbow: 'pop', forearm: 'no' } },
]
/** What a shared-question answer means as one screen's own I1 answer. */
export const limbAnswerFor = (optionId, screenId) => ((LIMB_OPTIONS.find((o) => o.id === optionId) || {}).map || {})[screenId]
const limbScreens = (zones) => screensFor(zones).filter((sc) => LIMB.includes(sc.id))
const limbMerged = (zones) => limbScreens(zones).length >= 2

function limbQuestion(zones) {
  const ids = limbScreens(zones).map((sc) => sc.id)
  const names = ids.map((id) => LIMB_NAME[id])
  const where = names.length > 2 ? names.slice(0, -1).join(', ') + ', or ' + names[names.length - 1] : names.join(' or ')
  const weeks = ids.includes('shoulder') ? 6 : 2
  const how = ids.includes('forearm') ? 'a fall, accident, blow, crush, or heavy lift' : 'a fall, accident, blow, or heavy lift'
  return { id: 'I1', text: `Has your ${where} been hurt in ${how} in the last ${weeks} weeks?`,
    options: LIMB_OPTIONS.filter((o) => !o.only || ids.includes(o.only)).map(({ id, label }) => ({ id, label })) }
}
const LIMB_WHEN = { id: 'I2', text: 'When did it happen?', options: [
  { id: 'recent', label: 'In the last 2 weeks' },
  { id: 'older', label: '2 to 6 weeks ago' },
]}
const LIMB_SCREEN = { id: 'limb', title: 'Recent Arm Injury' }

/** Each screen's I1, from the merged answers: undefined while still needed. */
function limbGate(zones, answers) {
  const ids = limbScreens(zones).map((sc) => sc.id)
  const a1 = answers['limb:I1']
  if (a1 === undefined) return { next: 'limb:I1' }
  const o = LIMB_OPTIONS.find((x) => x.id === a1) || LIMB_OPTIONS[0]
  const needWhen = o.id !== 'no' && ids.includes('shoulder') && ids.some((id) => id !== 'shoulder')
  if (needWhen && answers['limb:I2'] === undefined) return { next: 'limb:I2' }
  const older = needWhen && answers['limb:I2'] === 'older'
  return { I1: Object.fromEntries(ids.map((id) => [id, older && id !== 'shoulder' ? 'no' : o.map[id]])) }
}

/** Every stored answer key, e.g. "shoulder:I2". */
export const INJURY_KEYS = ['limb:I1', 'limb:I2', ...SCREENS.flatMap((sc) => sc.questions.map((q) => sc.id + ':' + q.id))]

/** The screens these zones call for, in order. Pass the question-flow zones
    (areas a referral line only travels through are left out; implied areas,
    like the shoulder for an upper-arm mark, are in). */
export const screensFor = (zones = []) => SCREENS.filter((sc) => zones.some((z) => sc.zones.includes(z.type)))
export const injuryScreenApplies = (zones = []) => screensFor(zones).length > 0

/** The question "<screen>:<id>" as { screen, q }, or null. The merged arm
    question ("limb:I1") is worded for the zones drawn. */
export function injuryQuestion(key, zones = []) {
  const [sid, qid] = String(key || '').split(':')
  if (sid === 'limb') return { screen: LIMB_SCREEN, q: qid === 'I2' ? LIMB_WHEN : limbQuestion(zones) }
  const screen = SCREENS.find((sc) => sc.id === sid)
  const q = screen && screen.questions.find((x) => x.id === qid)
  return q ? { screen, q } : null
}

/** Where the injury screens go next, across every screen that applies.
    Returns { next: "<screen>:<id>" } while a question is needed, else
    { route: 'emergency' | 'urgent', why, screen } or { route: 'continue' }. */
export function injuryFlow(zones, answers = {}, ageId) {
  const merged = limbMerged(zones)
  // A question already answered, word for word, in an earlier screen (the
  // upper arm's and the elbow's "is your hand cold, pale, or blue…") is not
  // asked again: its answer carries over.
  const byText = {}
  for (const sc of screensFor(zones)) {
    const own = {}
    if (merged && LIMB.includes(sc.id)) {
      const g = limbGate(zones, answers)
      if (g.next) return { next: g.next, screen: 'limb' }
      own.I1 = g.I1[sc.id]
    }
    for (const q of sc.questions) {
      if (own[q.id] !== undefined) continue
      const v = answers[sc.id + ':' + q.id]
      if (v !== undefined) own[q.id] = v
      else if (byText[q.text] !== undefined) own[q.id] = byText[q.text]
    }
    for (const q of sc.questions) if (own[q.id] !== undefined && byText[q.text] === undefined) byText[q.text] = own[q.id]
    const r = sc.step(own, ageId)
    if (r.next) return { next: sc.id + ':' + r.next, screen: sc.id }
    if (r.route === 'emergency' || r.route === 'urgent') return { ...r, screen: sc.id, sameDay: !!(r.sameDay || (r.route === 'urgent' && sc.sameDayUrgent)) }
  }
  return { route: 'continue' }
}
