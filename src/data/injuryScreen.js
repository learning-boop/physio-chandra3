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
     wrist     fall onto the hand, twist or blow (wrist, B2)
     hand      jammed, bent back, caught, crushed or cut (hand and fingers, B2)
     hip       fall, twist or sudden pull (hip, B2)
     thigh     sudden pain, knock or fall (thigh, B2)
     knee      twist, blow or fall: the Ottawa knee rule, adapted (knee, B2)
     leg       kick, fall or sudden calf pain (lower leg, B2)
     ankle     rolled, twisted or landed badly: the Ottawa ankle rules, adapted (ankle, B2)
     foot      twist, crush, stubbed toe or landing: the Ottawa foot rule, adapted (foot, B2)

   Questions are asked in order and the first answer that routes ends that
   screen. The site can only send people on to medical care from here, never
   clear them. When several apply (an upper-arm mark also asks the shoulder),
   they run one after another until one routes. The shoulder, upper arm,
   elbow, forearm, wrist and hand share one opening question when two or more of them apply (see
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

/* ── Wrist: fall onto the hand, twist or blow ──
   Six weeks back: scaphoid fractures are often missed for weeks. */
export const WRIST_INJURY = [
  { id: 'I1', text: 'Has your wrist been hurt in a fall, twist, or blow in the last 6 weeks?', options: [
    { id: 'no', label: 'No', route: 'skip' },
    { id: 'fall', label: 'Yes, I fell onto my outstretched hand' },
    { id: 'twist', label: 'Yes, a twist (racquet, golf, a drill that caught)' },
    { id: 'blow', label: 'Yes, a blow or crush' },
  ]},
  { id: 'I2', text: 'Is the wrist a different shape (like a dinner fork), or is bone showing through the skin?',
    options: yesNo('emergency', 'Possible fracture or dislocation') },
  { id: 'I3', text: 'Since the injury, is your hand cold, pale, or blue, or is your whole hand numb?',
    options: yesNo('emergency', 'Possible blood vessel or nerve injury') },
  { id: 'I4', text: 'Since the injury or a cast was put on, is numbness in your thumb, index, and middle fingers getting quickly worse?',
    options: yesNo('emergency', 'Possible acute carpal tunnel syndrome after a wrist fracture') },
  // A possible fracture: same day.
  { id: 'I5', text: 'Is there pain in the hollow at the base of your thumb, or when you pinch your thumb and index finger together or grip?',
    sameDay: true, options: yesNo('urgent', 'Possible scaphoid fracture: often normal on the first X-ray, and a missed one can fail to heal') },
  { id: 'I6', text: 'On the little-finger side: did you feel a clunk, and is it now swollen, painful to turn your palm up and down, or does the wrist give way?',
    sameDay: true, options: yesNo('urgent', 'Possible TFCC tear, joint instability, or fracture on the little-finger side') },
]

/* ── Hand and fingers: jammed, bent back, caught, crushed or cut ──
   Many finger injuries need a splint or surgery within days, so these
   route early. */
export const HAND_INJURY = [
  { id: 'I1', text: 'Has your hand, finger, or thumb been hurt in the last 6 weeks?', options: [
    { id: 'no', label: 'No', route: 'skip' },
    { id: 'jammed', label: 'Yes, a finger was jammed (ball, wall)' },
    { id: 'bentback', label: 'Yes, my thumb was bent back (ski pole, fall)' },
    { id: 'caught', label: 'Yes, a finger caught in clothing, a door, or a jersey' },
    { id: 'crushcut', label: 'Yes, it was crushed or cut' },
  ]},
  { id: 'I2', text: 'Is a finger still out of place, or is bone showing through the skin?',
    options: yesNo('emergency', 'A dislocation that has not been put back, or an open fracture') },
  // The questions that start "After a cut", "After grabbing or catching" and
  // "After your thumb was bent back" are asked after that injury only.
  { id: 'I3', text: 'After a cut: can you not bend or straighten the finger, or is one side of the finger or the fingertip numb?',
    askIf: (a) => a.I1 === 'crushcut',
    options: yesNo('emergency', 'Possible cut tendon or nerve: repair is time-sensitive') },
  { id: 'I4', text: 'Does the tip of the finger droop, and it will not straighten on its own?',
    options: yesNo('urgent', 'Possible mallet finger: it needs a splint within about a week') },
  // A torn tendon that needs surgery within days: same day, as for the biceps.
  { id: 'I5', text: 'After grabbing or catching a finger (often the ring finger), can you not bend the tip of that finger?',
    askIf: (a) => a.I1 === 'caught', sameDay: true,
    options: yesNo('urgent', 'Possible "jersey finger" (a torn flexor tendon): surgery works best within days') },
  { id: 'I6', text: 'After your thumb was bent back, is there pain on the index-finger side of the thumb knuckle, or is pinching weak?',
    askIf: (a) => a.I1 === 'bentback',
    options: yesNo('urgent', "Possible thumb ligament tear (skier's thumb): some need surgery") },
  // A possible fracture: same day.
  { id: 'I7', text: 'When you make a fist, does one finger cross over or point towards another, or is the middle finger joint swollen and will not straighten?',
    sameDay: true, options: yesNo('urgent', 'Possible finger fracture with rotation, or a central slip (boutonnière) injury') },
]

/* ── Hip and groin: fall, twist or sudden pull ── */
export const HIP_INJURY = [
  { id: 'I1', text: 'Has your hip or groin been hurt in the last 6 weeks?', options: [
    { id: 'no', label: 'No', route: 'skip' },
    { id: 'fall', label: 'Yes, I fell onto my hip' },
    { id: 'vehicle', label: 'Yes, a car or other vehicle accident' },
    { id: 'twist', label: 'Yes, a twist or tackle in sport' },
    { id: 'pop', label: 'Yes, I felt a pop or pull while sprinting, kicking, or doing the splits' },
  ]},
  // The questions that start "Since the fall or accident", "After a minor
  // fall" and "did you feel a pop" are asked after that injury only.
  { id: 'I2', text: 'Since the fall or accident, can you not stand or walk on the leg, or does the leg look shorter or turned out?',
    askIf: (a) => a.I1 === 'fall' || a.I1 === 'vehicle',
    options: yesNo('emergency', 'Possible hip fracture or dislocation') },
  { id: 'I3', text: 'Was it a high-speed crash, or a fall from higher than a few stairs?',
    askIf: (a) => a.I1 === 'fall' || a.I1 === 'vehicle',
    options: yesNo('emergency', 'A high-energy injury: possible pelvic or hip fracture') },
  // A possible fracture: same day.
  { id: 'I4', text: 'After a minor fall, can you walk but with groin pain when you put weight on the leg, and are you 65 or over or have osteoporosis?',
    askIf: (a) => a.I1 === 'fall', sameDay: true,
    options: yesNo('urgent', 'Possible hidden hip or pelvic fracture: these are often missed on the first X-ray') },
  // A torn tendon that is best repaired early: same day, as for the biceps.
  { id: 'I5', text: 'Did you feel a pop in the buttock or back of the thigh (splits, water-skiing, slipping), with a large bruise after?',
    askIf: (a) => a.I1 === 'pop' || a.I1 === 'twist', sameDay: true,
    options: yesNo('urgent', 'Possible hamstring tendon tear from the sit bone: repair works best within weeks') },
  // A possible avulsion fracture: same day.
  { id: 'I6', text: 'Are you under 18, and did you feel a pop at the front or side of the hip while sprinting or kicking?',
    askIf: (a) => a.I1 === 'pop' || a.I1 === 'twist', sameDay: true,
    options: yesNo('urgent', 'Possible growth plate avulsion fracture') },
]

/* ── Thigh: sudden pain, knock or fall ── */
export const THIGH_INJURY = [
  { id: 'I1', text: 'Has your thigh been hurt in the last 6 weeks?', options: [
    { id: 'no', label: 'No', route: 'skip' },
    { id: 'sprint', label: 'Yes, a sudden sharp pain while sprinting, kicking, or stretching' },
    { id: 'knock', label: 'Yes, a hard knock to the thigh (knee, tackle, fall onto it)' },
    { id: 'fall', label: 'Yes, a fall or accident' },
  ]},
  { id: 'I2', text: 'Is the thigh a different shape, can you not stand on the leg, or was it a high-speed crash or a fall from a height?',
    options: yesNo('emergency', 'Possible thigh bone (femur) fracture') },
  // The questions that start "After a knock", "Did you feel a pop" and "A few
  // weeks after a knock" are asked after that injury only.
  { id: 'I3', text: 'After a knock: is the thigh getting tighter and more painful by the hour, rather than settling?',
    askIf: (a) => a.I1 === 'knock' || a.I1 === 'fall',
    options: yesNo('emergency', 'Possible compartment syndrome') },
  // A torn tendon that is best repaired early: same day, as in the hip screen.
  { id: 'I4', text: 'Did you feel a pop or tearing high in the back of the thigh or buttock, with a large bruise, or a gap you can feel under the sit bone?',
    askIf: (a) => a.I1 === 'sprint', sameDay: true,
    options: yesNo('urgent', 'Possible hamstring tendon tear from the sit bone: repair works best within weeks') },
  { id: 'I5', text: 'Since the injury, can you not walk without limping badly, or bend your knee more than halfway?',
    options: yesNo('urgent', 'A severe muscle tear or deep bruise: it needs assessment') },
  { id: 'I6', text: 'A few weeks after a knock, is there a hard lump in the thigh muscle, and is the knee still stiff?',
    askIf: (a) => a.I1 === 'knock',
    options: yesNo('urgent', 'Possible bone forming in the muscle after a bruise (myositis ossificans): it needs imaging') },
]

/* ── Knee: twist, blow or fall (Ottawa knee rule, adapted; Stiell 1996) ──
   Tenderness of the kneecap and the head of the fibula can only be checked in
   person, so those Ottawa items are left out. */
export const KNEE_INJURY = [
  { id: 'I1', text: 'Has your knee been hurt in the last 6 weeks?', options: [
    { id: 'no', label: 'No', route: 'skip' },
    { id: 'twist', label: 'Yes, a twist or pivot in sport' },
    { id: 'blow', label: 'Yes, a blow to the knee (tackle, car dashboard)' },
    { id: 'fall', label: 'Yes, a fall onto the knee' },
    { id: 'kneecap', label: 'Yes, the kneecap slipped out of place' },
  ]},
  { id: 'I2', text: 'Is the knee out of shape, or is the kneecap still out of place?',
    options: yesNo('emergency', 'Possible knee or kneecap dislocation that has not gone back') },
  { id: 'I3', text: 'Since the injury, is your foot cold, pale, or numb?',
    options: yesNo('emergency', 'Possible artery or nerve injury after a knee dislocation') },
  // A possible fracture: same day.
  { id: 'I4', text: 'Are you 55 or over, or could you not take 4 steps straight after the injury (and still cannot), or can you not bend the knee to a right angle?',
    sameDay: true, options: yesNo('urgent', 'Ottawa knee rule: an X-ray is needed to rule out a fracture') },
  // Bleeding in the joint, which can mean a fracture: same day.
  { id: 'I5', text: 'Did you hear or feel a pop, and did the knee swell up within 2 hours?',
    sameDay: true, options: yesNo('urgent', 'Quick swelling means bleeding in the joint: possible ACL tear or fracture') },
  { id: 'I6', text: 'Is the knee stuck, so you cannot straighten it fully?',
    options: yesNo('urgent', 'Possible locked knee from a torn meniscus (bucket-handle tear): it needs an early surgical opinion') },
  // Asked after "the kneecap slipped out of place" only.
  { id: 'I7', text: 'Did the kneecap pop out and go back in?',
    askIf: (a) => a.I1 === 'kneecap',
    options: yesNo('urgent', 'A first kneecap dislocation: imaging to check for a loose bone or cartilage fragment') },
]

/* ── Lower leg: kick, fall or sudden pain in the calf ── */
export const LEG_INJURY = [
  { id: 'I1', text: 'Has your lower leg been hurt in the last 6 weeks?', options: [
    { id: 'no', label: 'No', route: 'skip' },
    { id: 'kick', label: 'Yes, a kick or blow to the shin or calf' },
    { id: 'fall', label: 'Yes, a fall or accident' },
    { id: 'calf', label: 'Yes, a sudden pain or “kick” in the calf or back of the ankle while pushing off' },
  ]},
  { id: 'I2', text: 'Is the leg a different shape, is bone showing, or can you not stand on the leg?',
    options: yesNo('emergency', 'Possible fracture of the shin bones') },
  { id: 'I3', text: 'After the injury, is the pain getting worse by the hour, with the leg tight and much worse when you move your toes?',
    options: yesNo('emergency', 'Possible acute compartment syndrome (most common after a shin fracture)') },
  // Asked after a sudden calf pain only. A torn tendon is best treated early,
  // and a calf tear can look like a clot: both same day.
  { id: 'I4', text: 'Did it feel like someone kicked the back of your ankle or calf, and now you cannot push up onto your toes on that leg, or feel a gap in the tendon?',
    askIf: (a) => a.I1 === 'calf', sameDay: true,
    options: yesNo('urgent', 'Possible Achilles tendon rupture: early treatment matters') },
  { id: 'I5', text: 'Did you feel a sudden sharp pain in the inner calf (like being hit), with bruising down to the ankle after?',
    askIf: (a) => a.I1 === 'calf', sameDay: true,
    options: yesNo('urgent', 'Possible calf muscle tear ("tennis leg"): a clot can look the same, so it needs checking') },
  // Asked after a kick or blow only.
  { id: 'I6', text: 'After a kick to the outer knee or shin, is your foot weak or numb on top?',
    askIf: (a) => a.I1 === 'kick',
    options: yesNo('urgent', 'Possible peroneal nerve injury') },
]

/* ── Ankle: rolled, twisted or landed badly (Ottawa ankle rules, adapted;
   Stiell 1993). Bone tenderness can only be checked in person, so those
   Ottawa items are left out. ── */
export const ANKLE_INJURY = [
  { id: 'I1', text: 'Has your ankle been hurt in the last 6 weeks?', options: [
    { id: 'no', label: 'No', route: 'skip' },
    { id: 'inversion', label: 'Yes, I rolled it inwards' },
    { id: 'eversion', label: 'Yes, the foot twisted outwards with the foot planted' },
    { id: 'landing', label: 'Yes, I landed badly or fell from a height' },
    { id: 'kick', label: 'Yes, it felt like a kick to the back of the ankle' },
  ]},
  { id: 'I2', text: 'Is the ankle out of shape, or is bone showing through the skin?',
    options: yesNo('emergency', 'Possible fracture or dislocation') },
  { id: 'I3', text: 'Since the injury, is your foot cold, pale, or numb?',
    options: yesNo('emergency', 'Possible artery or nerve injury') },
  // A possible fracture: same day.
  { id: 'I4', text: 'Could you not take 4 steps straight after the injury, and still cannot?',
    sameDay: true, options: yesNo('urgent', 'Ottawa ankle rule: an X-ray is needed to rule out a fracture') },
  // Asked after "a kick to the back of the ankle" only. Same day, as for the
  // lower leg's Achilles question.
  { id: 'I5', text: 'Did it feel like a kick to the back of the ankle, and now you cannot rise onto your toes on that leg, or feel a gap in the tendon?',
    askIf: (a) => a.I1 === 'kick', sameDay: true,
    options: yesNo('urgent', 'Possible Achilles tendon rupture: early treatment matters') },
  { id: 'I6', text: 'Is the pain higher up, at the front just above the ankle between the two leg bones, and worse when pushing off or twisting?',
    options: yesNo('urgent', 'Possible high ankle (syndesmosis) sprain: some need surgery') },
  // A possible growth plate fracture: same day.
  { id: 'I7', text: 'Are you under 16, with pain on the bone just above the ankle?',
    sameDay: true, options: yesNo('urgent', 'Possible growth plate fracture: in children these are more common than sprains') },
]

/* ── Foot: twist, crush, stubbed toe or landing (Ottawa foot rule, adapted).
   Tenderness over the navicular and the base of the 5th metatarsal can only
   be checked in person. ── */
export const FOOT_INJURY = [
  { id: 'I1', text: 'Has your foot been hurt in the last 6 weeks?', options: [
    { id: 'no', label: 'No', route: 'skip' },
    { id: 'twist', label: 'Yes, I rolled or twisted it' },
    { id: 'crush', label: 'Yes, something heavy fell on it, or it was crushed' },
    { id: 'stub', label: 'Yes, I stubbed or jammed a toe' },
    { id: 'landing', label: 'Yes, I landed on it from a height, or my foot was bent under me' },
  ]},
  { id: 'I2', text: 'Is the foot or a toe out of shape, or is bone showing through the skin?',
    options: yesNo('emergency', 'Possible fracture or dislocation') },
  // The questions that start "After a crush", "After rolling the ankle" and
  // "After the big toe was bent back" are asked after that injury only.
  { id: 'I3', text: 'After a crush, is the foot getting tighter and more painful by the hour, with pain on moving the toes?',
    askIf: (a) => a.I1 === 'crush',
    options: yesNo('emergency', 'Possible compartment syndrome of the foot') },
  // Possible fractures: same day. Worded as the ankle's I4, so it is asked once
  // when both apply.
  { id: 'I4', text: 'Could you not take 4 steps straight after the injury, and still cannot?',
    sameDay: true, options: yesNo('urgent', 'Ottawa foot rule: an X-ray is needed to rule out a fracture') },
  { id: 'I5', text: 'Is there bruising on the sole in the middle of the foot, or pain in the middle of the foot when you stand on your toes?',
    sameDay: true, options: yesNo('urgent', 'Possible Lisfranc (midfoot) injury: often missed, and it may need surgery') },
  { id: 'I6', text: 'After rolling the ankle, is the pain on the outer edge of the foot, halfway along, rather than at the ankle?',
    askIf: (a) => a.I1 === 'twist', sameDay: true,
    options: yesNo('urgent', 'Possible fracture at the base of the 5th metatarsal') },
  { id: 'I7', text: 'After the big toe was bent back hard (on artificial turf, or jammed), is it swollen and painful to push off?',
    askIf: (a) => a.I1 === 'stub' || a.I1 === 'landing',
    options: yesNo('urgent', 'Possible "turf toe" (big toe joint ligament injury)') },
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
  { id: 'wrist', zones: ['wrist'], title: 'Recent Wrist Injury',
    flag: 'A wrist injury in the last 6 weeks (injury screen)', questions: WRIST_INJURY, step: linearStep(WRIST_INJURY) },
  { id: 'hand', zones: ['hand'], title: 'Recent Hand or Finger Injury',
    flag: 'A hand or finger injury in the last 6 weeks (injury screen)', questions: HAND_INJURY, step: linearStep(HAND_INJURY) },
  { id: 'hip', zones: ['hip'], title: 'Recent Hip or Groin Injury',
    flag: 'A hip or groin injury in the last 6 weeks (injury screen)', questions: HIP_INJURY, step: linearStep(HIP_INJURY) },
  { id: 'thigh', zones: ['thigh'], title: 'Recent Thigh Injury',
    flag: 'A thigh injury in the last 6 weeks (injury screen)', questions: THIGH_INJURY, step: linearStep(THIGH_INJURY) },
  { id: 'knee', zones: ['knee'], title: 'Recent Knee Injury',
    flag: 'A knee injury in the last 6 weeks (injury screen)', questions: KNEE_INJURY, step: linearStep(KNEE_INJURY) },
  { id: 'leg', zones: ['lowerleg'], title: 'Recent Lower Leg Injury',
    flag: 'A lower leg injury in the last 6 weeks (injury screen)', questions: LEG_INJURY, step: linearStep(LEG_INJURY) },
  { id: 'ankle', zones: ['ankle'], title: 'Recent Ankle Injury',
    flag: 'An ankle injury in the last 6 weeks (injury screen)', questions: ANKLE_INJURY, step: linearStep(ANKLE_INJURY) },
  { id: 'foot', zones: ['foot'], title: 'Recent Foot Injury',
    flag: 'A foot injury in the last 6 weeks (injury screen)', questions: FOOT_INJURY, step: linearStep(FOOT_INJURY) },
]

/* ── One arm gate for the shoulder, upper arm and elbow ──
   When two or more of these screens apply (a line down the arm), their
   first questions ("Has your shoulder / upper arm / elbow been hurt…?")
   are asked once, as "limb:I1", and the answer is passed to each screen as
   its own I1. The shoulder and wrist look back 6 weeks and the others 2
   weeks, so when both kinds are drawn, "limb:I2" asks when it happened; an
   injury 2 to 6 weeks ago opens only the 6-week screens. */
const LIMB = ['shoulder', 'arm', 'elbow', 'forearm', 'wrist', 'hand']
const LIMB_NAME = { shoulder: 'shoulder', arm: 'upper arm', elbow: 'elbow', forearm: 'forearm', wrist: 'wrist', hand: 'hand' }
// How far back each screen looks, in weeks.
const LIMB_WEEKS = { shoulder: 6, arm: 2, elbow: 2, forearm: 2, wrist: 6, hand: 6 }
// Each merged answer, as each screen's own I1 answer.
const LIMB_OPTIONS = [
  { id: 'no', label: 'No', map: { shoulder: 'no', arm: 'no', elbow: 'no', forearm: 'no', wrist: 'no', hand: 'no' } },
  { id: 'fall', label: 'Yes, I fell onto my arm, hand, or elbow', map: { shoulder: 'fall', arm: 'fall', elbow: 'fall', forearm: 'fall', wrist: 'fall', hand: 'jammed' } },
  { id: 'blow', label: 'Yes, a blow to the arm', map: { shoulder: 'fall', arm: 'blow', elbow: 'blow', forearm: 'blow', wrist: 'blow', hand: 'jammed' } },
  { id: 'crush', label: 'Yes, it was crushed, trapped, or cut', onlyAny: ['forearm', 'wrist', 'hand'], map: { shoulder: 'no', arm: 'no', elbow: 'no', forearm: 'crush', wrist: 'blow', hand: 'crushcut' } },
  { id: 'twist', label: 'Yes, my wrist was twisted (racquet, golf, a drill that caught)', only: 'wrist', map: { shoulder: 'no', arm: 'no', elbow: 'no', forearm: 'no', wrist: 'twist', hand: 'no' } },
  { id: 'jammed', label: 'Yes, a finger was jammed (ball, wall)', only: 'hand', map: { shoulder: 'no', arm: 'no', elbow: 'no', forearm: 'no', wrist: 'no', hand: 'jammed' } },
  { id: 'bentback', label: 'Yes, my thumb was bent back (ski pole, fall)', only: 'hand', map: { shoulder: 'no', arm: 'no', elbow: 'no', forearm: 'no', wrist: 'no', hand: 'bentback' } },
  { id: 'caught', label: 'Yes, a finger caught in clothing, a door, or a jersey', only: 'hand', map: { shoulder: 'no', arm: 'no', elbow: 'no', forearm: 'no', wrist: 'no', hand: 'caught' } },
  { id: 'popped', label: 'Yes, my shoulder popped out of place', only: 'shoulder', map: { shoulder: 'popped', arm: 'no', elbow: 'no', forearm: 'no', wrist: 'no', hand: 'no' } },
  { id: 'pull', label: 'Yes, a sudden pull, jerk, or heavy lift (I may have felt a pop)', onlyAny: ['shoulder', 'arm', 'elbow'], map: { shoulder: 'pull', arm: 'pop', elbow: 'pop', forearm: 'no', wrist: 'no', hand: 'no' } },
]
/** What a shared-question answer means as one screen's own I1 answer. */
export const limbAnswerFor = (optionId, screenId) => ((LIMB_OPTIONS.find((o) => o.id === optionId) || {}).map || {})[screenId]
const limbScreens = (zones) => screensFor(zones).filter((sc) => LIMB.includes(sc.id))
const limbMerged = (zones) => limbScreens(zones).length >= 2

function limbQuestion(zones) {
  const ids = limbScreens(zones).map((sc) => sc.id)
  const names = ids.map((id) => LIMB_NAME[id])
  const where = names.length > 2 ? names.slice(0, -1).join(', ') + ', or ' + names[names.length - 1] : names.join(' or ')
  const weeks = Math.max(...ids.map((id) => LIMB_WEEKS[id]))
  const how = ids.includes('hand') ? 'a fall, accident, blow, crush, cut, or twist'
    : ids.includes('forearm') || ids.includes('wrist') ? 'a fall, accident, blow, crush, twist, or heavy lift' : 'a fall, accident, blow, or heavy lift'
  return { id: 'I1', text: `Has your ${where} been hurt in ${how} in the last ${weeks} weeks?`,
    options: LIMB_OPTIONS.filter((o) => (!o.only || ids.includes(o.only)) && (!o.onlyAny || o.onlyAny.some((x) => ids.includes(x))))
      .map(({ id, label }) => ({ id, label })) }
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
  const weeks = ids.map((id) => LIMB_WEEKS[id])
  const needWhen = o.id !== 'no' && new Set(weeks).size > 1
  if (needWhen && answers['limb:I2'] === undefined) return { next: 'limb:I2' }
  const older = needWhen && answers['limb:I2'] === 'older'
  return { I1: Object.fromEntries(ids.map((id) => [id, older && LIMB_WEEKS[id] < 6 ? 'no' : o.map[id]])) }
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
