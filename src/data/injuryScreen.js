/* ─────────────────────────────────────────────────────────────────────────
   Injury screen: the Canadian C-Spine Rule, adapted (Stiell et al., JAMA
   2001), from Chandra's cervical region document, section B2.

   Shown straight after the safety check when the neck is drawn. Questions are
   asked in order and the first answer that routes ends the screen. The site
   can only send people on to medical care from here, never clear them:
   tenderness over the middle of the spine can only be checked in person, so
   even a full pass within 48 hours stays at "see a physician first".

   Pure logic, no React, so scripts/check-region-tests.mjs runs the same rule.
   ⚠ FOR CLINICIAN REVIEW: the final route of I7 (see I7_PASS_ROUTE).
   ───────────────────────────────────────────────────────────────────────── */

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

/** The injury screen applies when the neck or the base of the neck is drawn
    (the base-of-neck document routes its injury flag through this screen). */
export const injuryScreenApplies = (zones = []) => zones.some((z) => z.type === 'neck' || z.type === 'ctj')
