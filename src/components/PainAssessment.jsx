import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Body3D from './Body3D'
import { Link } from 'react-router-dom'
import PainAIPanel from './PainAIPanel'
import ClinicPicker from './ClinicPicker'
import { arrangeOptions, arrangeSplit } from '../data/optionOrder'
import { byMechanism, smartArea, smartAreas, gateUnsureFlags, gateRows } from '../data/safetyGates'
import { CLINICS } from '../data/clinics'
import ClinicianSummary from './ClinicianSummary'
import SaveResults from './SaveResults'
import FeedbackForm from './FeedbackForm'
import { preloadPdf } from './resultsPdf'
import GuideVideo from './GuideVideo'
import GuideSteps from './GuideSteps'
import { buildClinicianSummary, MAX_HYPOTHESES } from '../data/clinicianSummary'
import { REGIONS, ZONE_TO_REGION, GENERAL_RED_FLAGS, SPECIAL_CARDS, computeRaw } from '../data/symptomGuide'
import {
  primaryRegion, questionRegions, needsAreaChoice,
  buildScreens, nextQuestion, rankAcross, alsoConsiderAcross, specialsAcross, regionRedFlagsFor, inGroup, forPerson, MAX_SCORED_QUESTIONS, isBonus, widespreadFlags,
} from '../data/assessmentFlow'
import { behaviourQuestions, interpretBehaviour } from '../data/painBehaviour'
import { PSYCHOSOCIAL_QUESTIONS, interpretPsychosocial, psychosocialQuestionsFor, skipPsychosocial } from '../data/psychosocial'
import { PAIN_QUALITY, PAIN_TYPES, NOCICEPTIVE_SUBTYPES, classifyPainMechanism } from '../data/painType'
import { detectReferral, possibleReferral, confirmedReferral, travelAnswerOf, travelQuestion, TRAVEL_OPTIONS, referralKey, flowZones, drawnAnswers, referralSummary, referralMechanism, setAsideAreas } from '../data/referral'
import { locationAnswers, minorZoneIds } from '../data/drawnLocation'
import { patternChecks } from '../data/patternChecks'
import { WIDESPREAD, widespreadRoute, chronicWidespread, PATH_QUESTION, PATH_OPTIONS } from '../data/widespreadPain'
import {
  DM_STATUS, diabetesRedFlags, isNerveFlag, NERVE_WHY, diabetesBranch, diabetesQuestions, diabetesBonus, diabetesPanel, diabetesSummary,
} from '../data/diabetes'
import { STEROID_STATUS, steroidRedFlags, steroidPanel, steroidSummary, CUSHING_CAUTION, PITUITARY_CAUTION } from '../data/steroids'
import { PARATHYROID_CAUTION, parathyroidPanel, CPPD_IDS, CPPD_WHY } from '../data/parathyroid'
import { THYROID_CAUTION, thyroidPanel, HYPOTHYROID_CAUTION, hypothyroidPanel } from '../data/thyroid'
import { ACROMEGALY_CAUTION, acromegalyPanel } from '../data/acromegaly'
import { PAGET_CAUTION, pagetPanel } from '../data/paget'
import { BONE_TUMOUR_CAUTION, boneTumourPanel, TUMOUR_IDS, BONE_WHY_YOUNG, BONE_WATCH, boneWatch } from '../data/boneTumour'
import { CES_WARNING, cesWarningText, cesWarning } from '../data/caudaEquina'
import { SPONDY_CAUTION, SPONDY_STATUS, spondyAsked, spondyDiagnosed, spondylolysisPanel } from '../data/spondylolysis'
import { cautionRows, tickedIn } from '../data/cautionGroups'
import { physioPlan, strictestPlan, PLAN_LABEL, PLAN_TEXT } from '../data/physioPlan'
import { plainAreas, coverOut, gateQ, SUBHEAD, shortFor, PLAIN_Q, TICKS, ticksFor, tickId, toggleTick, clearQuestion, WHEN_Q, WHEN_FOR, tellThem, tickedText } from '../data/plainQuestions'
import { OSTEOPENIA_CAUTION, BONE_DETAILS, osteopeniaOn, bonePanel, boneSummary } from '../data/osteopenia'
import { OSTEOMALACIA_CAUTION, osteomalaciaPanel, STRESS_IDS, STRESS_LINE } from '../data/osteomalacia'
import { OI_STATUS, OI_DETAILS, oiOn, oiRedFlags, oiPanel, oiSummary } from '../data/oi'
import {
  PREG_STATUS, PREG_BIRTH, PREG_LIMITS, pregnancyAsked, isPregnant, isPostpartum, pregnancyRedFlags, pregnancyBonus, pregnancyPanel, pregnancySummary,
} from '../data/pregnancy'
import { emergencyLevel, EMERGENCY_ADVICE, bySeverity } from '../data/emergencyAdvice'
import { SCREENS, INJURY_KEYS, injuryFlow, injuryQuestion, injuryScreenApplies } from '../data/injuryScreen'

const GOLD = '#c9a96e'
const GOLD_LIGHT = '#e8d5b0'
const EASE = [0.22, 1, 0.36, 1]

/* ── The 5 questions — A–D fixed choices, E = Other (entered manually) ──
   Option sets follow a standard subjective examination: onset, pain
   character, aggravating factors, easing factors, plus an open field. */
const QUESTIONS = [
  { id: 'q1', text: 'When did your pain begin?', options: [
    'Today or yesterday',
    'Within the past week',
    'Between one and six weeks ago',
    'More than six weeks ago',
  ]},
  { id: 'q2', text: 'How would you describe your pain?', multi: true, options: [
    'Sharp or stabbing',
    'Dull ache',
    'Burning or tingling',
    'Throbbing',
  ]},
  { id: 'q3', text: 'What tends to make your pain worse?', multi: true, options: [
    'Movement or exercise',
    'Prolonged sitting or standing',
    'Bending or lifting',
    'At night, or lying in bed',
  ]},
  { id: 'q4', text: 'What tends to ease your pain?', multi: true, options: [
    'Rest',
    'Gentle movement or stretching',
    'Heat or cold packs',
    'Pain medication',
  ]},
  { id: 'q5', text: 'Is there anything further you would like the physiotherapist to know?', textarea: true,
    placeholder: 'Other symptoms, previous injuries, relevant medical history, or any concerns…' },
]
const LETTERS = 'ABCDEFGHIJKLMNOPQRST'.split('')
// "A little about you": the same age bands as every area's age question.
const ABOUT_AGES = [
  { id: 'u5', label: 'Under 5' }, { id: 'u18', label: '5 to 15' }, { id: '18-29', label: '16 to 29' },
  { id: '30-49', label: '30 to 49' }, { id: '50-64', label: '50 to 64' }, { id: 'o64', label: '65 or over' },
]
const ABOUT_SEX = [
  { id: 'female', label: 'Female' }, { id: 'male', label: 'Male' },
  { id: 'other', label: 'Intersex, or prefer not to say' },
]
const BEHAV_ID = '__behav'
const PSYCH_ID = '__psych'
/* Unscored screens that always close the questions, in this order. */
const TAIL_IDS = [BEHAV_ID, PSYCH_ID]
const PSYCH_SCREEN = {
  id: PSYCH_ID, group: PSYCHOSOCIAL_QUESTIONS, text: 'How it is affecting you',
  hint: 'There are no right or wrong answers — choose the one closest to how you feel.',
}
/* Synthetic option id for the free-text alternative. Deliberately not present
   in any region's option list, so the scoring engine skips it. */
const OTHER_ID = '__other'

/* ── Region-specific option sets ───────────────────────────────────────
   The four core questions (onset, character, aggravating, easing) are the
   standard subjective examination and apply to any body area — but what
   provokes and eases pain is very different for a neck than for a knee.
   These overrides swap in the aggravating/easing options that a
   physiotherapist would actually ask about for the area the person drew. */
const REGION_AGGRAVATORS = {
  lowback:   ['Bending forward or lifting', 'Sitting for a long time', 'Standing or walking for a long time', 'Coughing, sneezing, or straining'],
  neck:      ['Looking down at a phone or desk', 'Turning the head to one side', 'Sleeping position', 'Carrying a bag on that shoulder'],
  ctj:       ['Looking down at a phone or desk', 'Raising the arms overhead', 'Carrying bags', 'Twisting the upper body'],
  upperback: ['Sitting at a desk for a long time', 'Deep breathing or coughing', 'Reaching or lifting overhead', 'Twisting the trunk'],
  tlj:       ['Twisting or turning', 'Bending forward', 'Sitting or driving for a long time', 'Lying on the painful side'],
  jaw:       ['Chewing hard or chewy food', 'Talking for a long time', 'Yawning or opening wide', 'Clenching or grinding'],
  coccyx:    ['Sitting on hard seats', 'Leaning back while sitting', 'Standing up from sitting', 'Cycling or rowing'],
  sij:       ['Standing on one leg', 'Stairs or getting in and out of the car', 'Rolling over in bed', 'Sitting for a long time'],
  shoulder:  ['Reaching overhead', 'Reaching behind your back', 'Lying on that side at night', 'Lifting or carrying'],
  arm:       ['Lifting or carrying', 'Reaching overhead', 'Gripping or using tools', 'Sitting at a desk'],
  elbow:     ['Gripping or squeezing', 'Lifting with the palm down', 'Twisting a handle or door knob', 'Repetitive work or sport'],
  forearm:   ['Gripping or typing', 'Turning the palm up and down', 'Repeated wrist movements or sport', 'A tight watch strap or cuff'],
  wrist:     ['Gripping or twisting', 'Lifting a baby, or with the thumb up', 'Taking weight through the hand', 'Typing, or using a mouse or phone'],
  hand:      ['Pinching (keys, jars, buttons)', 'Gripping firmly', 'Texting or gaming with the thumbs', 'Cold weather'],
  thigh:     ['Sprinting, kicking, or jumping', 'Stretching, or bending forward with straight legs', 'Sitting for a long time', 'Walking a distance'],
  hip:       ['Lying on that side at night', 'Putting on socks and shoes, or getting in and out of a car', 'Sitting in a low chair or deep squatting', 'Climbing stairs or standing on that leg'],
  leg:       ['Running or jumping', 'Walking a distance', 'Rising onto my toes', 'Sport or marching'],
  knee:      ['Going down stairs or squatting', 'Jumping or landing', 'Twisting or turning on the leg', 'Kneeling'],
  foot:      ['Standing or walking a long time', 'Running or jumping', 'Tight, narrow, or high-heeled shoes', 'Walking barefoot or on hard floors'],
  ankle:     ['Walking on uneven ground', 'Running, jumping, or hopping', 'Squatting, lunging, or going down stairs', 'The first steps in the morning'],
  head:      ['Long screen time or reading', 'Stress or poor sleep', 'Certain neck or jaw positions', 'Bright light or noisy places'],
}
const REGION_EASERS = {
  lowback:   ['Lying down or resting', 'Gentle walking', 'Changing position often', 'Heat or cold packs'],
  neck:      ['Gentle neck movement', 'Supporting the head or a different pillow', 'Heat packs', 'Rest from screens'],
  ctj:       ['Sitting up tall', 'Moving and stretching', 'Heat packs', 'Resting the arm on an armrest'],
  upperback: ['Moving and stretching', 'Sitting upright with support', 'Heat packs', 'Rest'],
  tlj:       ['Lying on the back with knees bent', 'Moving around', 'Sitting', 'Heat packs'],
  jaw:       ['Soft food and small bites', 'Resting the jaw (lips together, teeth apart)', 'A warm pack on the cheek', 'A night guard from the dentist'],
  coccyx:    ['A wedge or cut-out cushion', 'Leaning forward when sitting', 'Standing or walking', 'Heat packs'],
  sij:       ['Moving around', 'A pelvic support belt', 'A pillow between the knees at night', 'Heat packs'],
  shoulder:  ['Resting the arm', 'Supporting the arm in a sling or pocket', 'Gentle pendulum movement', 'Heat or cold packs'],
  arm:       ['Resting the arm', 'Gentle stretching', 'Heat packs', 'Changing position'],
  elbow:     ['Resting from gripping', 'A brace or strap', 'Ice', 'Gentle stretching'],
  forearm:   ['Resting from the task', 'Stopping the sport for a few minutes', 'Loosening a strap or cuff', 'Gentle stretching'],
  wrist:     ['Resting the hand', 'A splint or support', 'Ice', 'Avoiding the aggravating task'],
  hand:      ['Resting the hand', 'Warmth, or warm water', 'A splint', 'Gentle finger movement'],
  hip:       ['Rest', 'A pillow between the knees at night', 'Gentle walking', 'Heat packs'],
  thigh:     ['Rest from sport', 'Gentle stretching', 'Ice or heat', 'Gentle walking'],
  knee:      ['Rest and elevation', 'Ice', 'A support or brace', 'Gentle movement'],
  leg:       ['Rest from running', 'Stopping for a few minutes', 'Gentle stretching', 'Ice or heat'],
  ankle:     ['Rest and elevation', 'Ice', 'Supportive footwear', 'Gentle stretching'],
  foot:      ['Rest', 'Supportive, cushioned shoes', 'Taking shoes off', 'Ice or a cold bottle under the foot'],
  head:      ['Rest in a quiet, dark room', 'Gentle neck movement or a short walk', 'A heat pack across the neck and shoulders', 'Regular meals and plenty of water'],
}

/* Most-marked zone TYPE (left/right ignored). Lets the generic fallback still
   ask area-specific questions when an area has no authored question set. */
function primaryZoneType(zones) {
  const tally = {}
  zones.forEach((z) => { tally[z.type] = (tally[z.type] || 0) + 1 })
  const best = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]
  return best ? best[0] : null
}
const TYPE_TO_KEY = { lowerback: 'lowback' }   // zone type → aggravator/easer key
const TYPE_WORD = { head: 'head', chest: 'chest', abdomen: 'stomach' } // plain word for types with no authored region

/* Which regions get asked about (every region along one chain, e.g.
   shoulder → elbow), the shared opening screen, the adaptive skipping and the
   cross-region ranking all live in ../data/assessmentFlow.js, so
   scripts/check-accuracy.mjs can test the very same logic. */

/* The optional free-text box on the review screen. Its id is not one of the
   region's question ids, so the scoring engine simply ignores it. */
const NOTES_Q = {
  id: 'notes', textarea: true,
  text: 'Is there anything further you would like the physiotherapist to know?',
  placeholder: 'Other symptoms, previous injuries, relevant medical history, or any concerns…',
}

/* Builds the question list for this particular selection. */
function buildQuestions(zones) {
  const rk = primaryRegion(zones)
  const zt = primaryZoneType(zones)
  const key = rk || (zt ? (TYPE_TO_KEY[zt] || zt) : null)
  const area = rk && REGIONS[rk] ? REGIONS[rk].name.toLowerCase() : (TYPE_WORD[zt] || null)
  return QUESTIONS.map((q) => {
    if (q.id === 'q3' && key && REGION_AGGRAVATORS[key]) {
      return { ...q, text: area ? `What tends to make your ${area} pain worse?` : q.text, options: REGION_AGGRAVATORS[key] }
    }
    if (q.id === 'q4' && key && REGION_EASERS[key]) {
      return { ...q, text: area ? `What tends to ease your ${area} pain?` : q.text, options: REGION_EASERS[key] }
    }
    if (q.id === 'q1' && area) return { ...q, text: `When did your ${area} pain begin?` }
    return q
  }).map((q) => (q.options
    ? { ...q, options: q.options.map((o) => (typeof o === 'string' ? { id: o, label: o } : o)) }
    : q))
}

/* ── Final safety check — four grouped screening questions plus a manual
   option, presented in the same A–E format as the questions above.
   Each option consolidates a recognised set of musculoskeletal red flags
   (cauda equina, progressive neurological deficit, infection or
   malignancy, and significant trauma or suspected fracture). */
/* Checks that apply to ANY body part, appended after the region's own flags.
   Deliberately excludes the cauda-equina and cardiac items that used to live
   here: those are low-back and shoulder/upper-back flags respectively, and the
   guide already carries them in those regions' own redFlags. */
const UNIVERSAL_CHECKS = [
  { id: 'sc-neuro', tier: 'urgent', text: 'New or worsening weakness, numbness, or loss of coordination in an arm or leg',
    why: { title: 'A nerve or spinal cord may be involved',
      text: 'Weakness that is getting worse suggests a nerve is under pressure rather than simply irritated. A physician needs to establish the cause before any physiotherapy loading begins.' } },
  { id: 'sc-systemic', tier: 'urgent', text: 'Fever, chills, unexplained weight loss, a new or growing lump, pain at night that does not change with position, or a history of cancer with new or changing pain',
    why: { title: 'Possible infection or systemic cause',
      text: 'Pain accompanied by fever, weight loss, or a cancer history can have a medical rather than a mechanical cause. That has to be excluded by a doctor first, as it is treated quite differently.' } },
  { id: 'sc-trauma', tier: 'urgent', sameDay: true, text: 'A significant fall, accident, or injury — or any fall if you are 65 or older, or have osteoporosis or low bone density',
    why: { title: 'A fracture should be excluded',
      text: 'After a significant impact — or any fall where bone strength may be reduced — imaging is usually needed to rule out a fracture before the area is loaded or mobilised.' } },
]

/* ── Cautions, not red flags ──────────────────────────────────────────────
   The CPA Orthopaedic Division subjective framework separates "must be seen
   medically first" from "physiotherapy can go ahead, but the first physical
   examination should be adjusted". These are the second kind: they never
   withhold booking, and they reach Chandra with the summary so the first
   assessment can be planned around them. */
const CAUTION_CHECKS = [
  // 6 Oct 2026, general conditions cross-check (approved by Chandra), W2: never "thin"; N2: it has the bone panel now (../data/osteopenia.js).
  { id: 'ca-bone', tier: 'caution', text: 'Osteoporosis (on a scan, or after a bone broken in a small fall), or long-term steroid tablets',
    why: { title: 'Worth knowing before your first assessment',
      text: 'Where bone strength may be reduced, hands-on techniques and loading are chosen more carefully. It does not stop physiotherapy — it shapes how it starts.' } },
  // "Osteopenia" document (v0.1, 4 Oct 2026): the physio route, with optional risk questions.
  OSTEOPENIA_CAUTION,
  { id: 'ca-surgery', tier: 'caution', text: 'Surgery or a procedure in this area within the last 3 months',
    why: { title: 'Recent surgery changes the plan',
      text: 'Healing tissue and any surgeon\'s restrictions come first, so your assessment works within them.' } },
  // 16 to 64 (4 Oct 2026): the fallback for 50 to 64, where the pregnancy question is not asked.
  { id: 'ca-preg', sex: 'female', ages: ['18-29', '30-49', '50-64'], tier: 'caution', text: 'Pregnant, or within 3 months of giving birth',
    why: { title: 'Worth knowing before your first assessment',
      text: 'Positions, hands-on techniques and exercise choices are adjusted during and after pregnancy.' } },
  // C3 (shorter questionnaire): was a statement on "How it is affecting you".
  { id: 'ca-claim', tier: 'caution', text: 'A claim, insurance or time-off process is involved (ICBC, WorkSafeBC, or similar)',
    why: { title: 'Worth knowing before your first assessment',
      text: 'Claims come with their own forms and reports, so your first assessment can cover what they need.' } },
  // "Multiple Sclerosis" document (v0.1, 2 Oct 2026), route B: diagnosed MS.
  // "Fibromyalgia" document (signed by Chandra, 2 Oct 2026): diagnosed route.
  // "Spondylolysis.docx" (approved in session, 6 Oct 2026), state 2: the
  // diagnosed athlete, cleared for rehabilitation. Ticking it also takes the
  // X-ray gate (rf-spondy) out of their safety questions.
  SPONDY_CAUTION,
  { id: 'ca-fibro', tier: 'caution', text: 'Fibromyalgia, diagnosed by a doctor',
    why: { title: 'Worth knowing before your first assessment',
      text: 'Fibromyalgia does not stop physiotherapy: regular exercise built up slowly is the treatment with the strongest evidence, alongside understanding the pain, sleep and pacing. Your programme starts below what you can manage now and builds in small planned steps, with the aim of making flares easier to manage.' } },
  { id: 'ca-ms', tier: 'caution', text: 'Multiple sclerosis, diagnosed by a neurologist',
    why: { title: 'Worth knowing before your first assessment',
      text: 'Exercise is safe with MS and recommended by current guidelines: it does not bring on relapses, and it can help fatigue, strength, balance and mood. Your programme is built around your energy and how heat affects you, alongside your MS team. A new or clearly worse symptom lasting more than a day without a fever or infection is worth a call to your MS nurse or neurology team first.' } },
  // "Myasthenia Gravis" and "Myotonic Dystrophy" documents (signed by Chandra, 2 Oct 2026), route B.
  { id: 'ca-mg', tier: 'caution', text: 'Myasthenia gravis, diagnosed by a neurologist',
    why: { title: 'Worth knowing before your first assessment',
      text: 'When myasthenia is stable, moderate exercise is safe and can help strength, stamina and balance. Sessions are planned for the time of day you are usually strongest, in a cool room, in short bouts that stop well before you tire, alongside your neurology team. A fever, infection or new medicine followed by worse weakness is worth a call to your neurology team the same day; any trouble breathing or swallowing is a reason to call 911.' } },
  { id: 'ca-dm', tier: 'caution', text: 'Myotonic dystrophy or another muscle disease, diagnosed by a neurologist',
    why: { title: 'Worth knowing before your first assessment',
      text: 'Regular, moderate exercise is safe with myotonic dystrophy and current guidance encourages it; it does not speed the condition up. Your programme is paced around your energy, with warm-ups for stiff hands and help with walking, balance and falls, alongside your neuromuscular team. Fainting, a racing or irregular heartbeat, or new trouble breathing or swallowing needs emergency care, and every surgeon, dentist and anaesthetist should know about the diagnosis before any procedure.' } },
  // "Poly myositis" document (signed by Chandra, 2 Oct 2026), route B.
  { id: 'ca-myositis', tier: 'caution', text: 'Myositis (an inflammatory muscle disease such as polymyositis, dermatomyositis or inclusion body myositis), diagnosed by a specialist',
    why: { title: 'Worth knowing before your first assessment',
      text: 'Exercise is now part of the treatment for myositis: it is safe, does not increase the inflammation, and can rebuild strength, stamina and daily function. It starts gently, even while the disease is being brought under control, and builds up as it settles, at a level agreed with your specialist team. Some types of myositis are linked with other conditions, including lung problems and, less often, cancer, so your team may arrange screening tests; keeping those appointments is part of your care. Mild aching the day after is expected; a sudden drop in strength, new trouble swallowing or breathing, or dark urine needs your team the same day (emergency department if breathing is affected). On long-term steroids, a fall with back, hip or wrist pain needs a doctor the same day.' } },
  // "DuchenneMD" document (signed by Chandra, 2 Oct 2026), route B. Open
  // item 1 (Chandra, 2 Oct 2026): no children under 5 in clinic.
  { id: 'ca-dmd', tier: 'caution', text: 'Duchenne or Becker muscular dystrophy, diagnosed by a neuromuscular team (for a child or young person)',
    why: { title: 'Worth knowing before the first assessment',
      text: 'Chandra sees children from 5 years old; for a child under 5, please ask the neuromuscular team at BC Children\'s Hospital about a paediatric physiotherapist. Physiotherapy works alongside the neuromuscular team on daily stretching, night splints, enjoyable activity such as swimming or cycling, walking, posture and equipment. Very hard or "eccentric" exercise (downhill walking, jumping, heavy lifting, pushing to exhaustion) is avoided. Severe muscle pain with dark, cola-coloured urine after activity, or a fall followed by leg pain or refusal to stand, needs the emergency department. Confusion, drowsiness or breathlessness in the days after a fall or a broken bone needs 911. Breathlessness, a fast heartbeat, morning headaches or repeated chest infections: contact the neuromuscular team. If your child takes daily steroid medicine and becomes very unwell, vomiting or drowsy, follow the team\'s emergency plan and get urgent care. Every surgeon, dentist and anaesthetist should know about the diagnosis before any procedure.' } },
  // "Cushings Syndrome" document (signed by Chandra, 3 Oct 2026), route B.
  CUSHING_CAUTION,
  // "Hypopituitarism" document (signed by Chandra, 3 Oct 2026), route B.
  PITUITARY_CAUTION,
  // "Hyperparathyroidism" document (signed by Chandra, 3 Oct 2026), route B.
  PARATHYROID_CAUTION,
  // "Osteomalacia" document (v0.1, 4 Oct 2026), route C.
  OSTEOMALACIA_CAUTION,
  // "Osteosarcoma" document (v0.1, 4 Oct 2026), the diagnosed route.
  BONE_TUMOUR_CAUTION,
  // "Pagets Disease" document (v0.1, 4 Oct 2026), route B.
  PAGET_CAUTION,
  // "Hyperthyroidism" document (signed by Chandra, 3 Oct 2026), route C.
  THYROID_CAUTION,
  // "Hypothyroidism" document (signed by Chandra, 3 Oct 2026), route B.
  HYPOTHYROID_CAUTION,
  // "Acromegaly" document (signed by Chandra, 3 Oct 2026), route B.
  ACROMEGALY_CAUTION,
  // 6 Oct 2026, general conditions cross-check (approved by Chandra): N1 ME/CFS (NICE NG206), N3 hypermobility and rheumatoid arthritis.
  { id: 'ca-mecfs', tier: 'caution', text: 'ME/CFS (chronic fatigue syndrome), diagnosed by a doctor',
    why: { title: 'Worth knowing before your first assessment',
      text: 'With ME/CFS, the plan starts with managing your energy, not with building exercise: activity is kept within what your body can manage without a crash a day or two later, and only increased if and when you are ready (NICE 2021). Physiotherapy can help with energy management, comfort, posture and gentle movement that does not make you worse.' } },
  { id: 'ca-hypermobility', tier: 'caution', text: 'Hypermobility or Ehlers-Danlos syndrome, diagnosed by a doctor',
    why: { title: 'Worth knowing before your first assessment',
      text: 'Hypermobile joints do well with steady strength and control work built up gradually, and hands-on techniques avoid forceful end-of-range movements. Tiredness and dizziness on standing are common and are planned around. With vascular Ehlers-Danlos syndrome, sudden severe pain anywhere in the body, especially the chest, tummy or back, needs 911.' } },
  { id: 'ca-ra', tier: 'caution', text: 'Rheumatoid arthritis, diagnosed by a doctor',
    why: { title: 'Worth knowing before your first assessment',
      text: 'Exercise is safe and helps with rheumatoid arthritis: strength, movement and fitness are built up around flares, which are paced rather than pushed through. Hands-on work at the top of the neck is avoided unless it has been checked, as RA can affect the upper neck joints. A flare with a fever, or one joint much hotter and more swollen than the rest, needs your doctor or rheumatology team the same day.' } },
  { id: 'ca-cardio', tier: 'caution', text: 'A heart or lung condition that limits what you can do physically',
    why: { title: 'Worth knowing before your first assessment',
      text: 'Exertion during assessment and exercise is paced to what is comfortable and safe for you.' } },
]

/* Region flags that ask "Are you pregnant (or have you had a baby) and…":
   left out when "A little about you" says neither applies. */
const PREG_ASKED_IDS = ['prf-pregnancy-bleed', 'prf-pregnancy', 'hrf-pregnancy']
const ECTOPIC_IDS = ['hpf-ectopic', 'srf-ectopic']
// The pregnancy answers, cleared when the question no longer applies.
const dropPreg = ({ preg, pregBirth, pregLimit, ...a }) => a
// The OI answers, cleared when the tick is taken off.
const dropOi = ({ oi, oiType, oiGoal, oiFalls, oiCare, ...a }) => a

/* Why a flagged symptom needs looking at before physiotherapy. Region red
   flags in the guide carry a tier but no explanation, and inventing a clinical
   rationale per symptom would be unreviewed content — so the wording is tied
   to the tier the clinician already assigned. */
const TIER_WHY = {
  emergency: {
    title: 'This needs emergency medical assessment',
    text: 'Symptoms in this group can point to a problem that is time-sensitive and outside what physiotherapy treats. Being asked about it is routine and does not mean something serious is present — but it should be checked in an emergency department now rather than waited on.',
  },
  urgent: {
    title: 'This should be checked before starting physiotherapy',
    text: 'A doctor should check this to find the cause.',
  },
}

/* ── shared styles ───────────────────────────────────────────────────── */
const label = { fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, display: 'inline-block' }
const h2 = { fontFamily: 'var(--font-display)', fontWeight: 300, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.12 }
const body = { fontSize: 16, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)' }
const chip = (sel) => ({
  padding: '16px 18px', borderRadius: 14, cursor: 'pointer', fontSize: 16.5, lineHeight: 1.5,
  minHeight: 56, width: '100%', boxSizing: 'border-box',
  border: `1px solid ${sel ? GOLD : 'rgba(255,255,255,0.22)'}`,
  background: sel ? 'rgba(201,169,110,0.22)' : 'rgba(8,21,39,0.55)',
  color: sel ? GOLD_LIGHT : 'rgba(255,255,255,0.85)', transition: 'all 0.15s', textAlign: 'left',
  display: 'flex', gap: 13, alignItems: 'baseline',
})
/* Compact read-only tag for the selected pain areas — must stay inline, so it
   deliberately drops chip()'s full-width / min-height touch sizing. */
const pill = {
  padding: '9px 15px', borderRadius: 999, fontSize: 14.5, lineHeight: 1.3,
  border: `1px solid ${GOLD}`, background: 'rgba(201,169,110,0.18)',
  color: GOLD_LIGHT, cursor: 'default', display: 'inline-block',
  maxWidth: '100%', boxSizing: 'border-box',
}
const letterStyle = (sel) => ({
  fontFamily: 'var(--font-display)', fontSize: 16.5, color: sel ? GOLD : 'rgba(255,255,255,0.45)',
  flexShrink: 0, width: 18,
})
const goldBtn = {
  padding: '17px 30px', borderRadius: 999, border: 'none', cursor: 'pointer',
  background: GOLD, color: '#081527', fontWeight: 700, fontSize: 15,
  letterSpacing: '0.08em', textTransform: 'uppercase',
  minHeight: 56, lineHeight: 1.2, fontFamily: 'var(--font-body)',
}
const ghostBtn = {
  padding: '17px 24px', borderRadius: 999, cursor: 'pointer',
  background: 'transparent', color: 'rgba(255,255,255,0.72)',
  border: '1px solid rgba(255,255,255,0.28)', fontSize: 14,
  letterSpacing: '0.08em', textTransform: 'uppercase',
  minHeight: 56, lineHeight: 1.2, fontFamily: 'var(--font-body)',
}
/* Smaller secondary controls — Undo / Redo / Clear sit above the main row. */
const toolBtn = (disabled) => ({
  padding: '12px 18px', borderRadius: 999, cursor: disabled ? 'not-allowed' : 'pointer',
  background: 'transparent', color: disabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.75)',
  border: `1px solid ${disabled ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.28)'}`,
  fontSize: 13.5, letterSpacing: '0.08em', textTransform: 'uppercase',
  minHeight: 48, lineHeight: 1.2, fontFamily: 'var(--font-body)',
  display: 'inline-flex', alignItems: 'center', gap: 8,
})
const card = { border: '1px solid rgba(201,169,110,0.25)', background: 'rgba(201,169,110,0.05)', borderRadius: 14, padding: 'clamp(16px, 4.5vw, 22px)' }

/* ── Colour roles (Chandra, 28 Sep 2026: highlight questions and headlines)
   Chosen for people in pain: calm, trusted, never alarming.
   - Headline band: warm gold, the brand colour, for "where am I" (the
     page title and progress). Warmth and reassurance.
   - Question panel: soft teal, the colour most linked with health and
     calm, for "what to answer". Chosen answers stay gold, which stands
     out clearly on it.
   - The emergency check's band is a soft coral (important, not alarming)
     and the doctor check's a soft amber; strong red stays for the emergency result.
   All text keeps well over 4.5:1 contrast on the navy. */
const TEAL = '#5CC8C2'
const BAND_TONES = {
  gold: ['rgba(201,169,110,0.26)', 'rgba(201,169,110,0.07)', 'rgba(201,169,110,0.42)', GOLD],
  coral: ['rgba(240,128,108,0.20)', 'rgba(240,128,108,0.05)', 'rgba(240,128,108,0.42)', '#f3a08e'],
  amber: ['rgba(245,180,85,0.19)', 'rgba(245,180,85,0.05)', 'rgba(245,180,85,0.40)', '#f5c170'],
}
const headBand = (tone = 'gold') => {
  const [from, to, line, accent] = BAND_TONES[tone]
  return {
    background: `linear-gradient(135deg, ${from}, ${to})`, border: `1px solid ${line}`,
    borderLeft: `4px solid ${accent}`, borderRadius: 18, boxSizing: 'border-box',
    padding: 'clamp(16px, 4.5vw, 22px) clamp(16px, 4.5vw, 24px)', margin: '0 0 18px', maxWidth: 560,
  }
}
const bandLabel = (tone = 'gold') => ({ ...label, color: BAND_TONES[tone][3] })
const qPanel = {
  background: 'rgba(92,200,194,0.10)', border: '1px solid rgba(92,200,194,0.34)',
  borderRadius: 18, boxSizing: 'border-box', maxWidth: 560,
  padding: 'clamp(16px, 4.5vw, 22px) clamp(14px, 4vw, 22px)', margin: '0 0 14px',
}
// A question inside a panel: the teal marker ties it to its answers.
const qText = { fontSize: 17, color: '#fff', margin: '0 0 12px', lineHeight: 1.4, fontWeight: 500, display: 'flex', gap: 10 }
const qMark = { width: 4, borderRadius: 2, background: TEAL, flex: 'none' }

/* Multi-select needs a visible "chosen" marker beyond the colour change. */
function Tick({ on }) {
  if (!on) return null
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.6"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ marginLeft: 'auto', flexShrink: 0, alignSelf: 'center' }}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

/* Renders one treatment-guidance list inside a condition card. */
function Bullets({ title, items }) {
  if (!items || !items.length) return null
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 11.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: GOLD, marginBottom: 6 }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)' }}>
        {items.map((t, i) => <li key={i} style={{ marginBottom: 3 }}>{t}</li>)}
      </ul>
    </div>
  )
}

function Fade({ children, k }) {
  return (
    <motion.div key={k} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: EASE }}>
      {children}
    </motion.div>
  )
}

/* ═════════════════════════════════════════════════════════════════════
   Guided journey:
   landing → guide (how it works; try turning the body) → draw → area (only when the
   marks cross more than one area) → intro notice → questions (A–E) →
   review → safety check → urgent care | results (not-a-diagnosis notice
   at the top)

   Wording throughout follows the CHCPBC Practice Standards: the tool is
   described accurately as general information rather than a diagnosis,
   its limitations are disclosed before use, it stays within the scope of
   physiotherapy practice, and no particular outcome is implied or
   guaranteed.
   ═════════════════════════════════════════════════════════════════════ */
export default function PainAssessment() {
  // Most users are on phones — track viewport for phone-specific sizing.
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const onR = () => setVw(window.innerWidth)
    window.addEventListener('resize', onR)
    return () => window.removeEventListener('resize', onR)
  }, [])
  const isPhone = vw < 768
  // Fetch the PDF library while the page is fresh, not on the results page
  // minutes later: its file name changes with every site update, so a page
  // loaded before an update would ask for a file that no longer exists and
  // "Save my results (PDF)" would fail (Oct 2026).
  useEffect(() => {
    const go = () => preloadPdf().catch(() => {})
    const id = typeof window.requestIdleCallback === 'function' ? window.requestIdleCallback(go, { timeout: 4000 }) : setTimeout(go, 1500)
    return () => (typeof window.cancelIdleCallback === 'function' ? window.cancelIdleCallback(id) : clearTimeout(id))
  }, [])
  // The swipe hint is a nudge, not decoration: it disappears the moment the
  // visitor touches the model, so it never nags someone who already knows.
  const [hasTurned, setHasTurned] = useState(false)

  const [stage, setStage] = useState('landing')
  // "A little about you" (Chandra, 2 Oct 2026): birth sex is used ONLY to
  // leave out safety questions that cannot apply (pregnancy, testicle). It is
  // kept apart from `answers` on purpose, so it never reaches the summary,
  // the PDF, the AI overview or the anonymous copy, and it is cleared on
  // restart. 'female' | 'male' | 'other' ("intersex, or prefer not to say":
  // every question is asked) | null.
  const [birthSex, setBirthSex] = useState(null)
  const [qIndex, setQIndex] = useState(0)
  const [zones, setZones] = useState([])
  const [answers, setAnswers] = useState({})   // { q1: 'text'|'__other', q1_other: '' }
  const [flags, setFlags] = useState([])       // ids from safetyChecks, plus '__other'
  // Which "also worth telling us" groups are open (../data/cautionGroups.js).
  const [openCautions, setOpenCautions] = useState([])
  const [flagOther, setFlagOther] = useState('')
  const [clearSignal, setClearSignal] = useState(0)
  const [undoSignal, setUndoSignal] = useState(0)
  const [redoSignal, setRedoSignal] = useState(0)
  const [history, setHistory] = useState({ canUndo: false, canRedo: false, lines: 0 })
  // The figure's pictures and drawn lines, for the PDF and the anonymous copy.
  const bodyApi = useRef(null)
  // Reference code, given once the results are reached (see visitCode below).
  const [visitCode, setVisitCode] = useState(null)
  // The clinic chosen in the booking step; the summary emails it.
  const [clinicId, setClinicId] = useState(null)
  const [fromReview, setFromReview] = useState(false)
  // Gates the result screen behind the "not a diagnosis" notice.
  // When the marks cross more than one area, the person chooses which area
  // the questions focus on; each area has its own clinician-authored set.
  const [focusKey, setFocusKey] = useState(null)
  // Each drawn line's zones in drawing order (from Body3D). One continuous
  // line from the spine down a limb is a referral pattern (../data/referral.js):
  // its limb areas are folded into the spine for the questions (flowZ), so
  // neck-to-hand is asked about as neck pain travelling down the arm — not as
  // separate shoulder, elbow and wrist problems. `zones` stays the full list
  // for display, the AI overview and the pain-type rules.
  const [lines, setLines] = useState([])
  /* Strokes on one side are also read together (possibleReferral): a person
     who lifts their finger at the knee to turn the body drew one travelling
     pain too. Each possible pattern is asked on the Draw page — one pain,
     separate pains, or not sure — and only the confirmed ones are folded
     into the spine (Chandra, 6 Oct 2026). One unbroken stroke starts as
     "one pain", so the question is already answered for it. */
  const strokeRef = useMemo(() => detectReferral(lines), [lines])
  const possibleRef = useMemo(() => possibleReferral(lines), [lines])
  const [travel, setTravel] = useState({})
  const referral = useMemo(() => confirmedReferral(possibleRef, travel, strokeRef), [possibleRef, travel, strokeRef])
  const travelPending = possibleRef.some((r) => !travelAnswerOf(r, travel, strokeRef))
  /* Path 4, pain in many places (Chandra, 6 Oct 2026; ../data/widespreadPain.js):
     marks in 4 or more areas, on both sides, above and below the waist, ask
     on the Draw page whether the pain is in many places most days, or one
     area bothers them most. "Many places" follows the "Pain in many places"
     route (REGIONS.widespread) instead of each area's joint questions and
     red flags; "one area" keeps the usual area choice. */
  const widespreadDrawing = useMemo(() => chronicWidespread(zones), [zones])
  const [pathPick, setPathPick] = useState(null)
  const widespreadPath = widespreadDrawing && pathPick === 'many'
  const pathPending = widespreadDrawing && !pathPick
  // Continue on the Draw page waits for the travel and path questions.
  const drawBlocked = !zones.length || (travelPending && !widespreadPath) || pathPending
  const drawnZ = useMemo(() => flowZones(zones, referral), [zones, referral])
  // Areas the marks only grazed (a sliver of a line that caught the next
  // area): they start unticked on the Draw page, and their questions come
  // after the main area's if the person ticks them.
  const minorKeys = useMemo(() => {
    const minor = minorZoneIds(drawnZ)
    const byKey = {}
    for (const z of drawnZ) {
      const k = ZONE_TO_REGION[z.type]
      if (z.implied || !k) continue
      ;(byKey[k] = byKey[k] || []).push(minor.has(z.id))
    }
    return new Set(Object.entries(byKey).filter(([, v]) => v.every(Boolean)).map(([k]) => k))
  }, [drawnZ])
  /* The areas the questions are about, confirmed on the Draw page (Chandra,
     28 Sep 2026). A line drawn on the wrist often catches the forearm too,
     which used to add the forearm's safety and opening questions. Each drawn
     area is a chip: the ones drawn on are ticked, the ones only touched are
     not, and a tap changes either. An unticked area is left out of the
     questions but keeps its emergency safety questions (regionRedFlagsFor).
     `areaPick` holds the person's taps, by area; the rest follow the ink. */
  const [areaPick, setAreaPick] = useState({})
  useEffect(() => { if (!zones.length) { setAreaPick({}); setTravel({}); setPathPick(null) } }, [zones])
  const areaChips = useMemo(() => {
    const seen = new Set(); const out = []
    drawnZ.filter((z) => !z.implied).forEach((z) => {
      const k = ZONE_TO_REGION[z.type]
      if (k && REGIONS[k] && !seen.has(k)) {
        seen.add(k)
        out.push({ key: k, name: REGIONS[k].name, on: areaPick[k] ?? !minorKeys.has(k), touched: minorKeys.has(k) })
      }
    })
    return out
  }, [drawnZ, areaPick, minorKeys])
  const leftOut = useMemo(() => new Set(areaChips.filter((c) => !c.on).map((c) => c.key)), [areaChips])
  const toggleArea = (k) => {
    const chip = areaChips.find((c) => c.key === k)
    // At least one area stays ticked.
    if (chip.on && areaChips.filter((c) => c.on).length === 1) return
    setAreaPick((p) => ({ ...p, [k]: !chip.on }))
  }
  const outOf = (z) => !z.implied && leftOut.has(ZONE_TO_REGION[z.type])
  const flowZ = useMemo(() => drawnZ.filter((z) => !outOf(z)), [drawnZ, leftOut]) // eslint-disable-line react-hooks/exhaustive-deps
  const leftOutZ = useMemo(() => drawnZ.filter(outOf), [drawnZ, leftOut]) // eslint-disable-line react-hooks/exhaustive-deps
  // Answers the drawing gives: a line down a limb ("past the elbow"), and
  // where in an area the marks sit ("back of the knee"), which answers that
  // area's location question so it is not asked again (../data/drawnLocation.js).
  // On the many-places route the drawing answers its "how many areas" (WS1).
  const drawn = useMemo(() => (widespreadPath ? { WS1: ['many'] } : { ...drawnAnswers(referral), ...locationAnswers(flowZ) }), [widespreadPath, referral, flowZ])
  const regionChoices = useMemo(() => {
    const seen = new Set(); const out = []
    // Implied areas are not choices: they come with the area they belong to.
    flowZ.filter((z) => !z.implied).forEach((z) => {
      const k = ZONE_TO_REGION[z.type]
      if (k && REGIONS[k] && !seen.has(k)) { seen.add(k); out.push({ key: k, name: REGIONS[k].name }) }
    })
    return out
  }, [flowZ])
  // New or changed marks invalidate a previously chosen focus area.
  useEffect(() => { setFocusKey(null) }, [zones])

  // In the draw step the person can switch between marking and turning the
  // model, so they can follow pain that radiates from front to back.
  // Turn is selected when the step opens; the person picks Draw to mark.
  const [drawMode, setDrawMode] = useState('turn')   // 'turn' | 'draw' | 'erase'
  // The review screen shows the answers folded: most people check nothing.
  const [showAnswers, setShowAnswers] = useState(false)
  const drawOn = stage === 'draw' && drawMode === 'draw'
  const eraseOn = stage === 'draw' && drawMode === 'erase'
  // Once the last line is rubbed out there is nothing left to erase: go back
  // to Draw, so the next touch marks the body.
  useEffect(() => { if (drawMode === 'erase' && !history.lines) setDrawMode('draw') }, [drawMode, history.lines])
  // "Drag to turn" on the body until it has been turned: on the How it works
  // page, and on the Draw page while Turn is selected and nothing is marked.
  // The picture is moved back to the middle as the Draw page opens (a slide on
  // the How it works page kept the body under the Turn / Draw buttons).
  const [recentre, setRecentre] = useState(0)
  useEffect(() => { if (stage === 'draw') setRecentre((n) => n + 1) }, [stage])
  // The How it works page has no 3D body (pictures instead, 6 Oct 2026).
  const swipeHint = !hasTurned && stage === 'draw' && drawMode === 'turn' && !zones.length

  /* ── Every crossed area counts, in at most 8 screens ──────────────────
     A line along one chain (shoulder → elbow, low back → knee) draws on EACH
     crossed area's own weighted questions, so a problem in any of them can be
     recognised. Marks in genuinely separate areas (shoulder AND knee) are
     separate problems, so the person picks one.

     The flow is the opening screen, at most MAX_SCORED_QUESTIONS scored
     questions, then the pain-behaviour and yellow-flag screens. Which question comes next is decided from the answers so far
     (nextQuestion in ../data/assessmentFlow.js): each area's most useful
     question first, then whichever can still move the result most, stopping
     as soon as one condition is clearly ahead. The free-text box sits on the
     review screen rather than costing a screen of its own. */
  const multiPattern = useMemo(() => new Set(zones.map((z) => z.type)).size > 1, [zones])

  // ── The questionnaire is each asked area's OWN clinical question set ──
  // Each option carries weights pointing at that area's conditions, which is
  // what lets the answers actually decide which condition (and therefore which
  // treatment guidance) is shown. Areas with no authored region — currently
  // only the stomach — fall back to the generic set.
  const keys = useMemo(() => (widespreadPath ? ['widespread'] : questionRegions(flowZ, focusKey)), [widespreadPath, flowZ, focusKey])
  const multiArea = keys.length > 1
  // Age / how it started / how long are one-tap answers, so they share a single
  // opening screen instead of costing three. With several areas, age and
  // duration are still asked once; only "how did it start?" is asked per area,
  // because its options (and weights) differ from area to area.
  const { context: ctxQuestions, questions: regionQuestions } = useMemo(() => buildScreens(keys), [keys])
  // Two unscored screens close the questions: pain behaviour (severity,
  // irritability, 24-hour pattern, easing — ../data/painBehaviour.js) and the
  // yellow flags (../data/psychosocial.js). The generic set already asks about
  // easing (q4), so it is left out of the behaviour screen there.
  const activeQuestions = useMemo(() => {
    // Region flows ask pain quality on the opening screen, so a region question
    // can depend on it (the neck asks about arm symptoms when there are pins
    // and needles or shooting pain); the generic set asks it as q2.
    const behav = (easers) => ({
      id: BEHAV_ID, text: 'How your pain behaves',
      group: behaviourQuestions(easers),
      hint: 'Tap an answer for each — some questions let you choose more than one.',
    })
    if (keys.length) {
      return [
        // Age is asked on "A little about you", before the safety pages.
        { id: '__ctx', group: [...ctxQuestions.filter((q) => q.id !== 'age'), PAIN_QUALITY], text: 'A few details to start' },
        ...regionQuestions,
        behav(REGION_EASERS[keys[0]] || undefined),
        PSYCH_SCREEN,
      ]
    }
    const generic = buildQuestions(flowZ)
    const notesAt = generic.findIndex((q) => q.textarea)
    return [...generic.slice(0, notesAt), behav(null), PSYCH_SCREEN, ...generic.slice(notesAt)]
  }, [keys, flowZ, ctxQuestions, regionQuestions])
  // Positions of the closing screens, in asking order.
  const tailIndexes = useMemo(
    () => TAIL_IDS.map((id) => activeQuestions.findIndex((q) => q.id === id)),
    [activeQuestions],
  )
  // The screens actually shown, in order (indices into activeQuestions). Back
  // walks this list, and the question number is the position in it.
  const [path, setPath] = useState([0])
  useEffect(() => { setPath([0]) }, [activeQuestions])
  const askedIds = useMemo(
    () => (keys.length ? path.slice(1).map((i) => activeQuestions[i]?.id).filter(Boolean) : []),
    [keys, path, activeQuestions],
  )
  // Screens this selection can take: the opening one plus the scored limit.
  // It ends sooner when one condition is clearly ahead.
  // An optional bonus screen (the arm self-tests) adds one once it is shown.
  const plannedScreens = keys.length ? 1 + TAIL_IDS.length + Math.min(MAX_SCORED_QUESTIONS, regionQuestions.length) + askedIds.filter(isBonus).length : activeQuestions.length
  // Only the opening answers, the questions on the current path and the free
  // text count. After going Back and taking a different route, the abandoned
  // question's answer must not quietly shape the result.
  const scopedAnswers = useMemo(() => {
    if (!keys.length) return answers
    // Answers the drawing gave (e.g. N2 "past the elbow") count even when that
    // question was not shown.
    const keep = new Set([...ctxQuestions.map((q) => q.id), ...askedIds, ...Object.keys(drawn), 'notes', 'preg'])
    const out = {}
    for (const [k, v] of Object.entries(answers)) if (keep.has(k.replace(/_other$/, ''))) out[k] = v
    return out
  }, [keys, answers, ctxQuestions, askedIds, drawn])
  // B2 (shorter questionnaire, 28 Sep 2026): an area that asked "Stiff at
  // first, then eases as I move" (neck, upper back, mid-to-low back) has
  // answered the behaviour screen's "After sitting or resting a while, it
  // eases once I get moving" too. It is filled in from that answer and not
  // shown again; the inflammatory reading keeps using it.
  const STIFF_EASES = 'Stiff at first, then eases as I move'
  const restWorseKnown = useMemo(() => regionQuestions.some((q) => askedIds.includes(q.id) &&
    [].concat(scopedAnswers[q.id] || []).some((oid) => (q.options.find((o) => o.id === oid) || {}).label === STIFF_EASES)),
  [regionQuestions, askedIds, scopedAnswers])
  useEffect(() => {
    setAnswers((a) => {
      const cur = [].concat(a.pattern24 || [])
      if (restWorseKnown === cur.includes('restWorse')) return a
      return { ...a, pattern24: restWorseKnown ? [...cur.filter((x) => x !== 'none'), 'restWorse'] : cur.filter((x) => x !== 'restWorse') }
    })
  }, [restWorseKnown])
  // The statements on "How it is affecting you" depend on the answers so far.
  const groupOf = (q) => (q.id === PSYCH_ID ? psychosocialQuestionsFor(answers) : q.group)
  // Flat list for the review screen and the summary: what was actually asked.
  const flatQuestions = useMemo(
    () => (keys.length
      ? [
          ...ctxQuestions,
          PAIN_QUALITY,
          ...askedIds.map((id) => regionQuestions.find((q) => q.id === id)).filter(Boolean),
          ...tailIndexes.filter((i) => path.includes(i)).flatMap((i) => groupOf(activeQuestions[i])),
        ]
      : activeQuestions.flatMap((q) => q.group || [q])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [keys, ctxQuestions, askedIds, regionQuestions, activeQuestions, path, tailIndexes, answers.duration, answers.sinSeverity],
  )
  // How the pain behaves (SIN, 24-hour pattern, easing), in plain language.
  const behaviour = useMemo(() => interpretBehaviour(answers), [answers])
  // Yellow flags, read as supportive notes — never a score or a label.
  // Only the statements actually asked count (C2, C4); the claim is a tick
  // box before the results (C3).
  const skipPsych = skipPsychosocial(answers)
  const psych = useMemo(() => {
    const asked = new Set(skipPsych ? [] : psychosocialQuestionsFor(answers).map((q) => q.id))
    const a = { ...answers }
    for (const q of PSYCHOSOCIAL_QUESTIONS) if (!asked.has(q.id)) delete a[q.id]
    if (flags.includes('ca-claim')) a.kfClaim = 'agree'
    return interpretPsychosocial(a)
  }, [answers, flags, skipPsych])
  // ── The reasoning pass ───────────────────────────────────────────────────
  // The server reviews the scoring against the whole picture before anything
  // is shown, and may reorder the matched patterns, drop ones that do not fit,
  // say none fit, or raise a concern for medical review. It can never add a
  // pattern (the server validates that) and it never touches the red-flag
  // routing, which ran on the safety screen before this point. No review, or
  // no connection, simply leaves the rules-only result standing.
  const [review, setReview] = useState(null)
  // Pain mechanism (tissue / nerve / sensitised), by fixed rules.
  const painType = useMemo(
    () => classifyPainMechanism({ zones, answers, behaviour, psych, referral }),
    [zones, answers, behaviour, psych, referral],
  )

  // Ranked conditions across every asked area. Empty until enough is answered.
  const ranked = useMemo(() => {
    if (!keys.length) return []
    // Two hypotheses, matching the summary Chandra receives (MAX_HYPOTHESES).
    // Diabetes and pregnancy lift the conditions they make more likely, in the
    // order only (../data/diabetes.js, ../data/pregnancy.js); they never
    // decide whether one is shown.
    const dmB = diabetesBonus(answers, zones), pgB = pregnancyBonus(answers)
    const bonus = dmB || pgB ? (rk, id) => (dmB ? dmB(rk, id) : 0) + (pgB ? pgB(rk, id) : 0) : null
    try { return rankAcross(keys, scopedAnswers, MAX_HYPOTHESES, bonus) } catch { return [] }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys, scopedAnswers, answers.preg, answers.dm, answers.dmType, answers.dmYears, answers.dmControl, answers.dmTreat, answers.dmComp, answers.dmFeel, zones])
  // Education cards the answers call for, e.g. "this may be coming from your
  // shoulder" when moving the arm hurts more than moving the neck.
  const specials = useMemo(() => {
    if (!keys.length) return []
    try { return specialsAcross(keys, scopedAnswers).filter((s) => SPECIAL_CARDS[s]) } catch { return [] }
  }, [keys, scopedAnswers])
  // What the AI overview explains: exactly these conditions, in this order.
  const matched = useMemo(() => ranked.map((x) => ({ region: x.rk, id: x.c.id })), [ranked])
  // An earlier review belongs to earlier answers: changing an answer clears it
  // until the pass has run again on the new picture.
  useEffect(() => { setReview(null) }, [matched])
  // The conditions actually shown: the reviewed order, minus anything dropped.
  const shown = useMemo(() => {
    if (!review) return ranked
    if (review.noMatch) return []
    const dropped = new Set((review.dropped || []).map((d) => d.id))
    const rank = new Map((review.order || []).map((id, i) => [id, i]))
    return ranked.filter((x) => !dropped.has(x.c.id))
      .sort((a, b) => (rank.has(a.c.id) ? rank.get(a.c.id) : 99) - (rank.has(b.c.id) ? rank.get(b.c.id) : 99))
  }, [ranked, review])
  // "Also worth considering": up to two conditions not on the results, by
  // name (../data/assessmentFlow.js). Not when the AI review judged that none
  // fit, and never one it dropped.
  const alsoConsider = useMemo(() => {
    if (!keys.length || (review && review.noMatch)) return []
    try { return alsoConsiderAcross(keys, scopedAnswers, shown, 2, (review?.dropped || []).map((d) => d.id)) } catch { return [] }
  }, [keys, scopedAnswers, shown, review])
  const modelSmall = ['emergency', 'physician', 'questions', 'review', 'safety', 'injury', 'urgent', 'ok'].includes(stage)

  const otherFlagged = flags.includes('__other') && flagOther.trim().length > 0
  // Only red flags route away from the result; a caution does not.
  const cautionIds = CAUTION_CHECKS.map((c) => c.id)
  /* ── Safety screening, right after the drawing ─────────────────────────
     Everything that would send someone to emergency care is asked first, on its own
     page; then everything that means "see a doctor first"; only then the
     questions. Someone with saddle numbness or a thunderclap headache is
     routed in the first minute instead of after the whole questionnaire.
     The few checks that depend on the answers (constant night pain, the
     inflammatory pattern) come in a short final check before the results.

     The flags are built for the area actually marked ───────────
     Every region in the guide carries its own red flags — a swollen warm calf
     for a knee, clumsiness in both hands for a neck, a sudden pop in the calf
     for an ankle. Those are the questions that make this screen worth asking,
     so they come first, emergency tier before urgent. Checks that apply to
     any body part are appended.
     Every one of the region's own flags is asked: they were capped at three
     to keep the screen short, which silently dropped clinician-authored
     emergency checks (the neck has ten). A flag with `drawn` is asked only
     when one of those areas is marked (the neck's shoulder-tip flags). Its
     `why` line from the region document titles the explanation. */
  const injuryApplies = useMemo(() => !widespreadPath && injuryScreenApplies(flowZ), [widespreadPath, flowZ])
  // Smarter safety flow (../data/safetyGates.js): for a drawing of the knee,
  // foot, hip or ankle only, the injury screen runs before the doctor page
  // and its answer filters it; the doctor page is grouped.
  const smartFirst = injuryApplies && !!smartArea(flowZ)
  // Plain question design (../data/plainQuestions.js), when every drawn area
  // is in PLAIN_AREAS (one area or several; an area a mark only implies does
  // not decide it): plain group questions with bullets, one sign per tick.
  const plainA = !widespreadPath ? plainAreas(flowZ) : null
  const lbProto = !!plainA
  // Gateway groups the person has opened on the doctor page.
  const [openGates, setOpenGates] = useState([])
  // Area questions with a yes/no in front (../data/questionGates.js): the ids opened with "Yes".
  const [openLists, setOpenLists] = useState([])
  const listOpen = (q) => !q.gate || openLists.includes(q.id) ||
    (Array.isArray(answers[q.id]) && answers[q.id].some((x) => x !== q.gate.no))
  // Organ-referral and systemic maps the drawing alone matches; the ones that
  // need answers (the inflammatory pattern) are left for the final check.
  const earlyPatterns = useMemo(() => patternChecks(zones, {}, 12), [zones])
  // Who the safety questions are for: age and birth sex from "A little about you".
  const who = useMemo(() => ({ age: answers.age, sex: birthSex }), [answers.age, birthSex])
  const screening = useMemo(() => {
    // Numb or burning feet on both sides: with known diabetes the results
    // panel takes over (../data/diabetes.js); without it, doctor first.
    const dmKnown = answers.dm === 'yes'
    // Gout or pseudogout ("Hyperparathyroidism" document, open item 3): under
    // 60 or recurrent attacks are a reason to ask about calcium and PTH.
    // A stress fracture in someone who does not run ("Osteomalacia" document): a bone blood test too.
    const nerve = (f) => (isNerveFlag(f) ? { ...f, noBooking: true, why: NERVE_WHY } : CPPD_IDS.includes(f.id) ? { ...f, why: CPPD_WHY }
      : STRESS_IDS.includes(f.id) ? { ...f, why: { ...f.why, text: `${f.why.text} ${STRESS_LINE}` } }
      // The young knee, thigh and shin bone questions ("Osteosarcoma" document): X-ray today or tomorrow, no booking.
      : TUMOUR_IDS.includes(f.id) ? { ...f, noBooking: true, sameDay: true, why: BONE_WHY_YOUNG } : f)
    // Not pregnant and no birth in the last 12 months: the areas' "Are you
    // pregnant and…" questions cannot apply (the ectopic ones, "could you be
    // pregnant", are still asked).
    // Pregnant 13 weeks or more: an ectopic pregnancy no longer applies.
    const notPregnant = answers.preg === 'no'
    const established = answers.preg === 'p2' || answers.preg === 'p3'
    // The many-places route asks its own few plus every drawn area's
    // EMERGENCY questions (cauda equina, a septic joint, a fracture can sit
    // inside widespread pain; they group into a few theme headings), but not
    // each area's doctor-tier list (Chandra, 6 Oct 2026, quality review).
    const regional = (widespreadPath ? widespreadFlags(regionRedFlagsFor(flowZ, zones, leftOutZ)) : regionRedFlagsFor(flowZ, zones, leftOutZ)).filter((f) => forPerson(f, who) && !(dmKnown && isNerveFlag(f)) &&
      // Already imaged and cleared: do not send them back for the same X-ray.
      !(spondyDiagnosed(flags, answers) && f.id === 'rf-spondy') &&
      !(notPregnant && PREG_ASKED_IDS.includes(f.id)) && !(established && ECTOPIC_IDS.includes(f.id)))
    const tierWhy = (f) => TIER_WHY[f.tier] || TIER_WHY.urgent
    const list = regional.map((f) => nerve({
      ...f, why: typeof f.why === 'string' ? { title: f.why, text: tierWhy(f).text } : tierWhy(f),
    }))
    // Areas with no authored region (currently only the stomach) fall back to the
    // general flags — but only those the universal checks below do not already
    // cover, otherwise the same question appears twice on one screen.
    if (!list.length) {
      const covered = /fever|weight loss|cancer|accident|fall/i
      GENERAL_RED_FLAGS.filter((f) => !covered.test(f.text))
        .forEach((f) => list.push({ ...f, why: TIER_WHY.urgent }))
    }
    // Organ-referral and systemic maps the drawing matches (../data/patternChecks.js).
    // These use every marked area, not the folded-down flow zones, because the
    // maps are about WHERE it is felt — right shoulder blade, left arm, flank.
    // A region that asks its own heart question (the neck) replaces the
    // drawing's generic one. When an injury screen follows, it asks
    // about recent injuries in its own, more precise way.
    const ownCardiac = list.some((f) => /cardiac/.test(f.id))
    // A region that asks about a leg clot itself (group "legclot") replaces
    // the drawing's generic calf-clot question.
    const ownClot = list.some((f) => inGroup(f, 'legclot'))
    // A region that asks about organ pain (group "organ": the shoulder, neck
    // and base of the neck) replaces the drawing's generic organ question, and
    // one that asks about worsening weakness (group "neuro": the neck)
    // replaces the general one (shorter questionnaire A2.2, A3.3).
    const ownOrgan = list.some((f) => inGroup(f, 'organ'))
    const ownNeuro = list.some((f) => inGroup(f, 'neuro'))
    // 6 Oct 2026, general conditions cross-check (approved by Chandra): an area that asks its own stroke question (head, neck, arms)
    // replaces the drawing's (S3); with known diabetes, the diabetes heart
    // questions replace the generic one (S8).
    const ownStroke = list.some((f) => inGroup(f, 'stroke'))
    const universal = UNIVERSAL_CHECKS.filter((f) => !(injuryApplies && f.id === 'sc-trauma') && !(ownNeuro && f.id === 'sc-neuro'))
    // An area that asks about numb or burning feet itself (group "neuropathy":
    // lower leg, ankle, foot) replaces the drawing's gloves-and-socks question.
    const ownNeuropathy = list.some((f) => inGroup(f, 'neuropathy'))
    const kept = earlyPatterns.filter((f) => !(ownStroke && f.id === 'pc-stroke') && !(dmKnown && f.id === 'pc-cardiac') && !(ownCardiac && f.id === 'pc-cardiac') && !(ownClot && f.id === 'pc-dvt') && !(ownOrgan && f.id === 'pc-visceral') &&
      !(ownNeuropathy && f.id === 'pc-polyneuropathy'))
      .filter((f) => !(dmKnown && isNerveFlag(f)))
    // Emergencies the drawing calls for are always asked here, on top of a
    // two-question limit for the others. The ones the limit cuts are
    // asked on the final check instead; they used to be dropped altogether
    // (a both-thighs drawing never reached the nerve and muscle screen).
    const em = kept.filter((f) => f.tier === 'emergency')
    const rest = kept.filter((f) => f.tier !== 'emergency')
    const pattern = [...em, ...rest.slice(0, 2)].map(nerve)
    const deferred = rest.slice(2).map((f) => f.id)
    // With diabetes, its own red flags come first on each page ("DiabetesMellitus"
    // document, section 6), minus any this page already asks.
    const diabetic = diabetesRedFlags(zones, answers, [...list, ...pattern])
    // Long-term steroids ("Cushings Syndrome" document, section 6): the ones
    // the areas do not already ask, also first (../data/steroids.js).
    const steroid = steroidRedFlags(answers, [...list, ...pattern], zones)
    // Pregnant or in the year after ("Pregnancy" document, section 6): the
    // obstetric and postpartum flags come first of all (../data/pregnancy.js).
    const obstetric = pregnancyRedFlags(zones, answers, [...list, ...pattern])
    // Osteogenesis imperfecta ("Osteogenesis Imperfecta" document, section 6):
    // fracture first, in every area (../data/oi.js).
    const oiFlags = oiRedFlags(answers, [...list, ...pattern])
    const all = [...obstetric, ...oiFlags, ...diabetic, ...steroid, ...list, ...pattern]
    return {
      // Most severe first on each page (../data/emergencyAdvice.js, bySeverity).
      // Grouped by theme behind one question each (../data/emergencyGroups.js, 6 Oct 2026).
      // Plain questions: a question another one on the page already asks is left out (coverOut).
      emergency: (() => { const em0 = bySeverity(all.filter((f) => f.tier === 'emergency')); const em = lbProto ? coverOut(em0).kept : em0; return [...em, ...gateUnsureFlags(em, null, 'emergency')] })(),
      physician: (() => {
        // Smarter safety flow: the mechanism filter, then the gateway groups.
        const doc0 = byMechanism(bySeverity([...all.filter((f) => f.tier !== 'emergency'), ...universal]), answers)
        const doc = lbProto ? coverOut(doc0).kept : doc0
        // One area, or several merged by theme (../data/safetyGates.js).
        const area = widespreadPath ? null : smartArea(flowZ) || smartAreas(flowZ)
        return area ? [...doc, ...gateUnsureFlags(doc, area)] : doc
      })(),
      deferred,
      // The questions left out as covered: their only-their-own signs show as extra ticks.
      covered: lbProto ? [...coverOut(all.filter((f) => f.tier === 'emergency')).covered,
        ...coverOut(byMechanism([...all.filter((f) => f.tier !== 'emergency'), ...universal], answers)).covered] : [],
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lbProto, widespreadPath, flowZ, leftOutZ, zones, injuryApplies, earlyPatterns, who, answers.dm, answers.steroid, answers.preg, answers.oi, answers.spondy, flags, answers['knee:I1'], answers['foot:I1'], answers['hip:I1'], answers['ankle:I1']])

  // The final check, after the questions: what only the answers can raise.
  const finalChecks = useMemo(() => {
    const out = []
    // Pain that nothing eases, constant or waking them at night, was reported
    // on the pain-behaviour screen: put the matching flag to them to confirm.
    const night = GENERAL_RED_FLAGS.find((f) => f.id === 'grf-night')
    if (behaviour.nightConcern && night) out.push({ ...night, why: TIER_WHY.urgent })
    // Drawing-only checks were asked on the doctor page, except those its
    // two-question limit deferred to here.
    const deferred = new Set(screening.deferred)
    const early = new Set(earlyPatterns.map((p) => p.id).filter((id) => !deferred.has(id)))
    // Up to six: dizziness (heart; ear or worsening) and headache can both
    // apply, and both-sided weakness asks PMR, myositis, the two pituitary
    // and steroid screens, the nerve and muscle screen, and the calcium and
    // two thyroid screens, then acromegaly (the last ones drop first when
    // space runs out).
    // 6 Oct 2026, general conditions cross-check (approved by Chandra), S10: emergencies are never cut and do not use a place, and the
    // hormone screens get up to two places beyond the six.
    const later = patternChecks(zones, answers, 30).filter((p) => !early.has(p.id))
    const laterRest = later.filter((p) => p.tier !== 'emergency')
    const HORMONE = ['pc-calcium', 'pc-thyroid', 'pc-hypothyroid', 'pc-acromegaly', 'pc-lowhormone', 'pc-hormone']
    ;[...later.filter((p) => p.tier === 'emergency'), ...laterRest.slice(0, 6), ...laterRest.slice(6).filter((p) => HORMONE.includes(p.id)).slice(0, 2)]
      .map((p) => (isNerveFlag(p) ? { ...p, why: NERVE_WHY } : p))
      .filter((p) => !(answers.dm === 'yes' && isNerveFlag(p))).forEach((p) => out.push(p))
    // Most severe first, as on the earlier pages.
    // Grouped like the doctor page (../data/emergencyGroups.js, 6 Oct 2026).
    const fin = bySeverity(out)
    return [...fin, ...gateUnsureFlags(fin, null, 'final')]
  }, [zones, answers, behaviour.nightConcern, earlyPatterns, screening.deferred])

  const safetyChecks = useMemo(
    () => [...screening.emergency, ...screening.physician, ...finalChecks],
    [screening, finalChecks],
  )
  const flaggedIn = (list) => list.some((f) => flags.includes(f.id))
  /* Safety questions as rows: a question on its own, or a gateway group that
     opens its questions when ticked (../data/safetyGates.js, gateRows). Used
     by the emergency page, the doctor page and the final check (6 Oct 2026). */
  const flagChip = (f, letter) => {
    const sel = flags.includes(f.id)
    return (
      <button key={f.id} style={chip(sel)}
        onClick={() => setFlags((cur) => sel ? cur.filter((x) => x !== f.id) : [...cur, f.id])}>
        <span style={letterStyle(sel)}>{letter}</span>
        <span>{f.text}</span>
      </button>
    )
  }
  // A group opened but nothing in it chosen yet.
  const gateOpenEmpty = (list) => gateRows(list).some((r) => r.gate && openGates.includes(r.gate.id) &&
    ![...r.members, r.unsure].some((m) => flags.includes(m.id)))
  /* Plain questions (../data/plainQuestions.js): one sign per tick; each
     tick sets its question, so the routes are unchanged. */
  const plainTicks = (m) => (lbProto ? ticksFor(m.id, who.sex, plainA, screening.covered) : [])
  // A question none of whose signs can apply to this birth sex (periods or
  // vaginal bleeding, for a male patient): not shown on plain pages.
  const notForThem = (m) => lbProto && !!TICKS[m.id] && !plainTicks(m).length
  const tickChip = (m, t, letter = '·') => {
    const sel = flags.includes(tickId(m.id, t.key))
    return (
      <button key={tickId(m.id, t.key)} style={chip(sel)} onClick={() => setFlags((cur) => toggleTick(cur, m.id, t.key))}>
        <span style={letterStyle(sel)}>{letter}</span>
        <span>{t.text}</span>
      </button>
    )
  }
  // A question as ticks: one tick in place of the question, several under a short heading.
  const plainQuestion = (m, letter) => {
    const ticks = plainTicks(m)
    // One tick in place of the question keeps the row's letter.
    if (ticks.length === 1) return tickChip(m, ticks[0], letter || '·')
    return (
      <div key={m.id} className="pa-gate pa-gate-open">
        <p className="pa-gate-ask">{letter ? <span style={{ ...letterStyle(flags.includes(m.id)), marginRight: 10 }}>{letter}</span> : null}{PLAIN_Q[m.id] || 'Do any of these fit you?'}</p>
        <div className="pa-gate-body">{ticks.map((t) => tickChip(m, t))}</div>
      </div>
    )
  }
  // "When did this start?" once a nerve or spinal cord sign is ticked.
  const whenAsk = (members) => lbProto && members.some((m) => WHEN_FOR.includes(m.id) && flags.includes(m.id)) && (
    <div style={{ marginTop: 10 }}>
      <p className="pa-gate-ask">{WHEN_Q.text}</p>
      {WHEN_Q.options.map((o) => {
        const sel = answers[WHEN_Q.id] === o.id
        return (
          <button key={o.id} style={chip(sel)} onClick={() => setAnswers((a) => ({ ...a, [WHEN_Q.id]: sel ? undefined : o.id }))}>
            <span style={letterStyle(sel)}>·</span><span>{o.label}</span>
          </button>
        )
      })}
    </div>
  )
  const gateList = (list) => gateRows(list).map((r, i) => {
    if (r.flag && notForThem(r.flag)) return null
    if (r.flag) return plainTicks(r.flag).length ? <div key={r.flag.id}>{plainQuestion(r.flag, LETTERS[i] || '·')}{whenAsk([r.flag])}</div> : flagChip(r.flag, LETTERS[i] || '·')
    const open = openGates.includes(r.gate.id)
    const toggle = () => {
      setOpenGates((cur) => (open ? cur.filter((x) => x !== r.gate.id) : [...cur, r.gate.id]))
      if (open) setFlags((cur) => [...r.members, r.unsure].reduce((acc, m) => clearQuestion(acc, m.id), cur))
    }
    const cut = r.gate.text.indexOf(': ')
    // Plain questions: a plain group question with one short bullet per question in it.
    // Only when every question in the group has its plain bullet and ticks, so
    // the bullets name every sign behind the group; otherwise the usual line.
    const shownMembers = r.members.filter((m) => !notForThem(m))
    const plain = lbProto && shownMembers.length > 0 && shownMembers.every((m) => shortFor(m.id, who.sex, plainA, screening.covered) && plainTicks(m).length) && gateQ(r.gate.id, plainA)
    const bullets = plain ? [...new Set(shownMembers.map((m) => shortFor(m.id, who.sex, plainA, screening.covered)).filter(Boolean))] : []
    return (
      <div key={r.gate.id} className={'pa-gate' + (open ? ' pa-gate-open' : '')}>
        <button style={chip(open)} onClick={toggle} aria-expanded={open}>
          <span style={letterStyle(open)}>{LETTERS[i] || '·'}</span>
          {plain ? (
            <span>
              <strong style={{ display: 'block', color: '#fff', fontWeight: 600 }}>{plain}</strong>
              <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: '0.95em', color: 'rgba(255,255,255,0.82)', lineHeight: 1.5 }}>
                {bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </span>
          ) : cut < 0 ? <span>{r.gate.text}</span> : (
            /* Title in bold, the short signs beneath, for a quick scan. */
            <span>
              <strong style={{ display: 'block', color: '#fff', fontWeight: 600 }}>{r.gate.text.slice(0, cut)}</strong>
              <span style={{ display: 'block', marginTop: 3, fontSize: '0.93em', color: 'rgba(255,255,255,0.78)' }}>{r.gate.text.slice(cut + 2)}</span>
            </span>
          )}
        </button>
        {open && (
          <div className="pa-gate-body">
            <p className="pa-gate-ask">Which of these? Tick any that apply.</p>
            {(plain ? shownMembers : r.members).map((m) => (plainTicks(m).length ? (
              /* A sub-heading's limit covers only its own ticks: they sit in a
                 box of their own, so the next question's ticks are clearly outside it. */
              <div key={m.id} style={SUBHEAD[m.id]
                ? { display: 'flex', flexDirection: 'column', gap: 8, padding: '8px 10px', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 12 }
                : { display: 'contents' }}>
                {SUBHEAD[m.id] && <p className="pa-gate-ask" style={{ margin: 0 }}>{SUBHEAD[m.id]}</p>}
                {plainTicks(m).map((t) => tickChip(m, t))}
              </div>
            ) : flagChip(m, '·')))}
            {flagChip({ ...r.unsure, text: plain ? 'Not sure which, but one of these fits' : 'Not sure which, but one of these signs applies' }, '?')}
            {whenAsk(r.members)}
          </div>
        )}
      </div>
    )
  })
  // The page a red flag was ticked on, so Back from the urgent screen returns there.
  const [flaggedAt, setFlaggedAt] = useState(null)
  const routeUrgent = (from) => { setFlaggedAt(from); setStage('urgent') }

  /* ── Injury screens (../data/injuryScreen.js: neck, shoulder, upper arm) ──
     Straight after the physician-first page, when one applies. Its answers are
     kept in `answers` as "<screen>:<question>"; `injuryPath` is the questions
     shown, for Back.
     Its outcome joins the flags: 'emergency' → 911 or go now (call911), 'urgent' → physician. */
  const [injuryPath, setInjuryPath] = useState([])
  const [injuryQ, setInjuryQ] = useState(null)       // question on screen

  /* Every new screen opens at the top of the assessment, on phone and desktop
     alike (Chandra, 28 Sep 2026). Pressing Continue at the bottom of a long
     screen used to leave the page scrolled down, so the next screen opened
     part-way through or at its bottom — the How it works → Draw step on a
     phone most of all. The jump is instant: a smooth scroll is cut short on
     phones by the fade between screens and the body resizing, and it
     stopped part of the way up. */
  const sectionRef = useRef(null)
  const firstScreen = useRef(true)
  const screenKey = `${stage}|${qIndex}|${injuryQ}`
  useLayoutEffect(() => {
    if (firstScreen.current) { firstScreen.current = false; return }
    const el = sectionRef.current
    if (!el || typeof window === 'undefined') return
    const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY)
    if (Math.abs(window.scrollY - top) >= 2) window.scrollTo({ top, behavior: 'instant' })
  }, [screenKey]) // eslint-disable-line react-hooks/exhaustive-deps
  const [injuryDraft, setInjuryDraft] = useState(undefined) // its uncommitted pick
  const injury = useMemo(() => injuryFlow(flowZ, answers, answers.age), [flowZ, answers])
  const injuryOutcome = injury.route === 'emergency' || injury.route === 'urgent' ? injury : null
  const injuryFlag = injuryOutcome
    ? { id: '__injury', tier: injuryOutcome.route, sameDay: injuryOutcome.sameDay,
      call911: !!injuryOutcome.call911,
      keepNeckStill: !!injuryOutcome.call911 && (injuryOutcome.screen === 'neck' || !!injuryOutcome.keepNeckStill),
      // The head screen: no booking until a doctor has seen a recent head
      // injury, and the 9-8-8 support line (../data/injuryScreen.js).
      noBooking: !!injuryOutcome.noBooking, goTo: injuryOutcome.goTo,
      // The question answered yes to, else the screen's own line.
      text: injuryOutcome.question || (SCREENS.find((sc) => sc.id === injuryOutcome.screen) || {}).flag || 'A recent injury (injury screen)',
      why: { title: injuryOutcome.why, text: injuryOutcome.whyText || TIER_WHY[injuryOutcome.route].text } }
    : null

  const pickedFlags = [...safetyChecks.filter((f) => flags.includes(f.id)), ...(injuryFlag ? [injuryFlag] : [])]
  // Emergency-tier flags end the visit, not a booking: 911 for the ones that
  // can be life-threatening, otherwise go to emergency now (../data/emergencyAdvice.js).
  const emergencyFlagged = pickedFlags.some((f) => f.tier === 'emergency')
  const emergencyCare = emergencyLevel(pickedFlags)
  /* "See a doctor" flags do not end the visit. The person is advised to see
     their doctor — today for the same-day ones (giant cell arteritis, a
     possible clot, a hot joint with fever, a possible fracture) — and can
     book with Chandra now and carry on to their results, which repeat the
     advice. Physiotherapy never replaces the medical check. */
  const doctorFlags = pickedFlags.filter((f) => f.tier !== 'emergency')
  const doctorFlagged = doctorFlags.length > 0 || otherFlagged
  const sameDayFlagged = doctorFlags.some((f) => f.sameDay)
  // What physio can do while they wait for the doctor (../data/physioPlan.js):
  // alongside, book now with treatment after the doctor's check (clearFirst),
  // or no booking until a doctor has seen them (doctorFirst: a recent head
  // injury, a nervous-system pattern, a possible clot).
  const physioWait = strictestPlan(doctorFlags)
  const holdBooking = physioWait === 'doctorFirst'
  // Chandra does not treat children under 5 (2 Oct 2026): no booking, a
  // referral to the family doctor or a paediatric physiotherapist instead.
  const underFive = answers.age === 'u5'
  const UNDER_FIVE = 'Chandra sees children from 5 years old. For a younger child, please talk to your family doctor, who can refer you to a children\'s physiotherapist (for example through BC Children\'s Hospital or your local child development centre).'
  const holdToday = doctorFlags.some((f) => physioPlan(f) === 'doctorFirst' && f.sameDay)
  // "Tell them" (plain questions): only the ticks of questions on this result,
  // so a tick kept from an earlier drawing never counts.
  const tellLine = tellThem(flags.filter((x) => pickedFlags.some((f) => f.id === x.split('~')[0])), answers, plainA)
  // Where "Continue" goes from the see-a-doctor screen: on through the flow.
  const continueAfterDoctor = () => {
    if (flaggedAt === 'physician') { if (injuryApplies && !smartFirst) startInjury(); else startQuestions() }
    else if (flaggedAt === 'injury') { if (smartFirst) setStage('physician'); else startQuestions() }
    else setStage('ok')
  }
  // Cautions never withhold booking — they shape the first assessment, and
  // they are listed on the result screen and in Chandra's summary.
  const pickedCautions = CAUTION_CHECKS.filter((f) => flags.includes(f.id))
  // Persistent widespread pain (fibromyalgia document): physio route with a
  // nudge to the family doctor, unless a doctor has already diagnosed it.
  const fibroDiagnosed = flags.includes('ca-fibro') || [].concat(answers.WS7 || []).includes('diagnosed')
  // On the many-places route, its score too (the document's route: 9 or more).
  const wspScore = keys.includes('widespread') ? computeRaw(REGIONS.widespread, scopedAnswers).scores.wsp || 0 : 0
  const showWidespread = widespreadRoute(painType, fibroDiagnosed, zones, answers, wspScore)
  // Diabetes ("DiabetesMellitus" and "Diabetes RiskModule" documents, signed
  // 3 Oct 2026; ../data/diabetes.js). The details are asked on "Before your
  // results" when a condition diabetes makes more likely qualifies (counted
  // with room for one a lift could bring in) or both feet burn or tingle.
  const wideRanked = useMemo(() => {
    if (!keys.length) return []
    try { return rankAcross(keys, scopedAnswers, 4) } catch { return [] }
  }, [keys, scopedAnswers])
  const dmQuestions = diabetesBranch(answers, zones, wideRanked) ? diabetesQuestions(answers, zones) : []
  const dmPanel = useMemo(() => diabetesPanel(answers, zones, shown), [answers, zones, shown])
  // Steroid medicine or diagnosed Cushing's (../data/steroids.js).
  const stPanel = useMemo(() => steroidPanel(answers, flags.includes('ca-cushing'), flags.includes('ca-pituitary')), [answers, flags])
  const caPanel = useMemo(() => parathyroidPanel(flags.includes('ca-parathyroid')), [flags])
  // Diagnosed osteomalacia or rickets (../data/osteomalacia.js).
  const omPanel = useMemo(() => osteomalaciaPanel(flags.includes('ca-osteomalacia')), [flags])
  // Paget's disease of bone, diagnosed (../data/paget.js).
  const pgtPanel = useMemo(() => pagetPanel(flags.includes('ca-paget')), [flags])
  const spondyPanel = useMemo(() => spondylolysisPanel(spondyDiagnosed(flags, answers)), [flags, answers.spondy])
  // A bone tumour, treated (../data/boneTumour.js).
  const btPanel = useMemo(() => boneTumourPanel(flags.includes('ca-bonetumour')), [flags])
  // Osteopenia, low bone density (../data/osteopenia.js).
  const bnPanel = useMemo(() => bonePanel(flags, answers), [flags, answers])
  const thPanel = useMemo(() => thyroidPanel(flags.includes('ca-thyroid')), [flags])
  const hypoPanel = useMemo(() => hypothyroidPanel(flags.includes('ca-hypothyroid')), [flags])
  const acroPanel = useMemo(() => acromegalyPanel(flags.includes('ca-acromegaly')), [flags])
  // Pregnant or in the year after ("Pregnancy" document; ../data/pregnancy.js).
  const pgPanel = useMemo(() => pregnancyPanel(answers, shown), [answers, shown])
  // Osteogenesis imperfecta ("Osteogenesis Imperfecta" document; ../data/oi.js).
  const oiP = useMemo(() => oiPanel(answers), [answers])
  const pregAsk = pregnancyAsked(who)
  const aboutDone = !!(answers.age && birthSex && answers.dm && answers.steroid && (!pregAsk || answers.preg))
  const pickDm = (q, oid) => setAnswers((a) => {
    if (!q.multi) return { ...a, [q.id]: a[q.id] === oid ? undefined : oid }
    const cur = [].concat(a[q.id] || [])
    if (cur.includes(oid)) return { ...a, [q.id]: cur.filter((x) => x !== oid) }
    return { ...a, [q.id]: oid === 'none' ? ['none'] : [...cur.filter((x) => x !== 'none'), oid] }
  })

  const setAnswer = (qid, value) => setAnswers((a) => ({ ...a, [qid]: value }))

  // A question marked `multi` holds an ARRAY of option ids; every other choice
  // question holds a single id. This distinction is not cosmetic — the engine
  // gates conditions on single values such as age, so an array there would
  // silently stop those conditions from ever qualifying.
  // "No", "None of these", "Not sure" answer the question on their own, so they
  // clear any other pick and are cleared by one — otherwise someone could tick
  // both "No" and "Pain below the knee", whose weights then cancel out.
  const isExclusive = (o) =>
    /^(no|none|ns|nope)$/i.test(o.id) || /^(no|none of|not sure|no particular)/i.test(o.label)

  const toggleAnswer = (q, oid) => setAnswers((a) => {
    if (!q.multi) return { ...a, [q.id]: a[q.id] === oid ? undefined : oid }
    const cur = Array.isArray(a[q.id]) ? a[q.id] : []
    if (cur.includes(oid)) return { ...a, [q.id]: cur.filter((x) => x !== oid) }
    const opt = q.options.find((o) => o.id === oid)
    if (opt && isExclusive(opt)) return { ...a, [q.id]: [oid] }
    // Alternatives sharing an `excl` key ("past the elbow" / "upper arm
    // only") clear each other, as in the condition document's own question.
    const kept = cur.filter((id) => {
      const o = q.options.find((x) => x.id === id)
      return !(o && (isExclusive(o) || (opt && opt.excl && o.excl === opt.excl)))
    })
    return { ...a, [q.id]: [...kept, oid] }
  })

  const isPicked = (q, oid) => {
    const a = answers[q.id]
    return q.multi ? (Array.isArray(a) && a.includes(oid)) : a === oid
  }

  const answerText = (q) => {
    const a = answers[q.id]
    if (q.textarea) return (a && String(a).trim()) || '—'
    const ids = q.multi ? (Array.isArray(a) ? a : []) : (a === undefined ? [] : [a])
    const labels = ids
      .map((id) => (q.options.find((o) => o.id === id) || {}).label)
      .filter(Boolean)
    if (ids.includes(OTHER_ID)) {
      const t = (answers[q.id + '_other'] || '').trim()
      if (t) labels.push(`Other: ${t}`)
    }
    return labels.length ? labels.join(' · ') : '—'
  }

  // The Q&A pairs feed the AI overview on the results screen, so the analysis
  // reflects the traced pattern AND what the person answered. With several
  // areas each question is prefixed with its area — two areas can both ask
  // "Where exactly is it?".
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // The rule-based pain type is passed along too, so the overview does not
  // describe a different kind of pain from the card above it.
  // "Where is the pain?" answers the drawing gave (not asked as questions),
  // for the review screen and the summary.
  const drawnLocationPairs = useMemo(() => Object.entries(locationAnswers(flowZ))
    .filter(([qid]) => !askedIds.includes(qid))
    .map(([qid, oids]) => {
      const r = keys.map((k) => REGIONS[k]).find((x) => x && x.questions.some((q) => q.id === qid))
      const q = r && r.questions.find((x) => x.id === qid)
      return q && { area: r.name, question: q.text, answer: oids.map((id) => (q.options.find((o) => o.id === id) || {}).label).filter(Boolean).join(' · ') }
    })
    .filter(Boolean), [flowZ, keys, askedIds])
  const qaPairs = useMemo(() => [
    ...flatQuestions
      .filter((q) => !q.textarea)
      .map((q) => ({ question: q.area ? `${q.area}: ${q.text}` : q.text, answer: answerText(q) }))
      .filter((pair) => pair.answer && pair.answer !== '—'),
    // Location answers taken from the drawing, for questions not shown.
    ...drawnLocationPairs.map((p) => ({ question: `${p.area}: ${p.question} (from the drawing)`, answer: p.answer })),
    ...INJURY_KEYS.filter((k) => answers[k] !== undefined).map((k) => {
      const { screen, q } = injuryQuestion(k, flowZ)
      return {
        question: `${screen.title} (injury screen): ${q.text}`,
        answer: [].concat(answers[k]).map((id) => (q.options.find((o) => o.id === id) || {}).label).filter(Boolean).join(' · '),
      }
    }),
    ...referral.map((r) => ({
      question: 'Drawn pattern (from the body diagram)',
      answer: `${r.unsure ? 'Marks (patient NOT SURE it is one pain)' : 'One pain the patient says travels'} from the ${r.kind === 'arm' ? 'neck' : 'low back'} down the ${r.side ? r.side + ' ' : ''}${r.kind} to the ${r.reach} — ${({ radicular: 'nerve-type referral', somatic: 'a referred ache, NOT nerve pain', unclear: 'referred pain, nerve involvement unclear' })[referralMechanism(r, answers)]}`,
    })),
    ...(painType ? [{
      question: "Pain type suggested by the clinic's rules (not the visitor's words)",
      answer: [painType.primary, painType.secondary].filter(Boolean)
        .map((t) => `${PAIN_TYPES[t].title} (${PAIN_TYPES[t].term})`).join(', with some features of '),
    }] : []),
  ], [flatQuestions, answers, painType, referral, flowZ, drawnLocationPairs])
  // For the optional AI overview: the wellbeing answers (mood, sleep, work)
  // are sent only if the person also agrees to include them.
  const aiAnswers = useMemo(() => {
    const wellbeing = new Set(PSYCHOSOCIAL_QUESTIONS.map((q) => q.text))
    const isWell = (p) => wellbeing.has(p.question) || [...wellbeing].some((t) => p.question.endsWith(`: ${t}`))
    return { core: qaPairs.filter((p) => !isWell(p)), wellbeing: qaPairs.filter(isWell) }
  }, [qaPairs])
  const notesText = String(answers.notes || answers.q5 || '').trim()

  // The summary Chandra receives — built from the same rule output the result
  // screen shows, plus the answers themselves. Only on the result screen, so
  // it is never computed while the person is still answering.
  const summaryText = useMemo(() => (stage === 'ok'
    ? buildClinicianSummary({
      zones, referral, keys, answers: scopedAnswers, qaPairs, notes: notesText,
      ranked: shown, behaviour, psych, painType, cautions: pickedCautions,
      diabetes: diabetesSummary(answers, zones, shown),
      steroids: steroidSummary(answers),
      pregnancy: pregnancySummary(answers),
      alsoConsider,
      oi: oiSummary(answers),
      bone: boneSummary(flags, answers),
      declinedFlags: safetyChecks.filter((f) => !flags.includes(f.id)).map((f) => f.text),
      flagIds: flags,
      reportedFlags: [...doctorFlags.map((f) => ({ text: tickedText(f.id, flags).length ? `${f.text} (ticked: ${tickedText(f.id, flags).join('; ')})` : f.text, why: f.why && f.why.title, sameDay: !!f.sameDay, physio: PLAN_LABEL[physioPlan(f)] })),
        ...(otherFlagged ? [{ text: `Other: ${flagOther.trim()}`, why: '', sameDay: false }] : [])],
      review,
    })
    : ''), [stage, zones, referral, keys, scopedAnswers, qaPairs, notesText, shown, behaviour, psych, painType, pickedCautions, safetyChecks, flags, review, doctorFlags, otherFlagged, flagOther, answers])

  /* ── Reference code ────────────────────────────────────────────────────
     Given only to someone who completed the guide: asked for when the results
     open, one per completion (Start Over clears it). The clinic date plus the
     day's running number from api/visit-code.js — 20261011-001, -002 … If the
     counter cannot be reached (offline, not set up) the code ends in four
     letters instead, e.g. 20261011-KXQM, which can never clash with a number. */
  const codeAsked = useRef(false)
  useEffect(() => {
    if (stage !== 'ok' || visitCode || codeAsked.current) return
    codeAsked.current = true
    const offline = () => {
      const d = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Vancouver', year: 'numeric', month: '2-digit', day: '2-digit' })
        .formatToParts(new Date()).map((p) => [p.type, p.value]))
      const L = 'ABCDEFGHJKMNPQRSTUVWXYZ'
      const r = crypto.getRandomValues(new Uint32Array(4))
      return `${d.year}${d.month}${d.day}-${[...r].map((n) => L[n % L.length]).join('')}`
    }
    // A slow counter must not hold up the Save button: after 6s, go offline.
    const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null
    const timer = ctl && setTimeout(() => ctl.abort(), 6000)
    fetch(`${import.meta.env.VITE_API_URL || ''}/api/visit-code`, { method: 'POST', signal: ctl ? ctl.signal : undefined })
      .finally(() => clearTimeout(timer))
      .then((res) => (res.ok ? res.json() : null))
      .then((j) => setVisitCode(j && /^\d{8}-\d{3,}$/.test(j.code) ? j.code : offline()))
      .catch(() => setVisitCode(offline()))
  }, [stage, visitCode])

  // Everything the patient's PDF shows (../components/resultsPdf.js).
  const pdfData = () => ({
    code: visitCode,
    dateText: new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }),
    images: (() => { try { return bodyApi.current ? bodyApi.current.capture() : null } catch { return null } })(),
    areas: [...new Set(zones.map((z) => z.label))],
    doctor: doctorFlagged ? {
      title: sameDayFlagged ? 'Please see a doctor today' : 'Please see your doctor',
      items: [...doctorFlags.map((f) => (f.why && f.why.title ? f.why.title : f.text)), ...(otherFlagged ? [`Other: ${flagOther.trim()}`] : [])],
      physio: underFive ? null : PLAN_TEXT[physioWait],
    } : null,
    referral: referral.map((r) => referralSummary(r, referralMechanism(r, answers))),
    conditions: shown.map(({ c }) => ({ name: c.name, blurb: c.blurb })),
    noMatch: keys.length ? 'No clear match in this guide. Pain often does not fit a textbook pattern, and that is what an in-person assessment is for.' : 'This guide does not yet cover this area in detail. An in-person assessment is the right next step.',
    painType: painType ? [painType.primary, painType.secondary].filter(Boolean).map((t) => `${PAIN_TYPES[t].title} (${PAIN_TYPES[t].term})`).join(', with some features of ') : null,
    behaviour: behaviour.notes,
    cautions: pickedCautions.map((f) => f.text),
    diabetes: dmPanel ? { title: dmPanel.title, text: dmPanel.text, notes: dmPanel.notes } : null,
    steroids: stPanel,
    calcium: caPanel,
    osteomalacia: omPanel,
    bone: bnPanel,
    boneTumour: btPanel,
    paget: pgtPanel,
    spondylolysis: spondyPanel,
    boneWatch: boneWatch(zones, answers) ? BONE_WATCH : null,
    cesWarning: cesWarning(zones, keys) ? cesWarningText() : null,
    alsoConsider: alsoConsider.map(({ c }) => c.name),
    thyroid: thPanel,
    hypothyroid: hypoPanel,
    acromegaly: acroPanel,
    pregnancy: pgPanel,
    oi: oiP,
    answers: qaPairs,
    notes: notesText,
  })

  // The anonymous copy (api/anon-share.js): drawing and chosen options only.
  // No reference code, no free text ('notes', '…_other', the "Other" red-flag
  // text); the server also keeps only answers that are the guide's own options.
  const anonPayload = () => ({
    engine: typeof window !== 'undefined' ? window.__painZonesV || null : null,
    strokes: bodyApi.current ? bodyApi.current.strokes() : [],
    zones: zones.map((z) => ({ id: z.id, type: z.type, face: z.face, ink: z.ink })),
    lines,
    answers: Object.fromEntries(Object.entries(answers).filter(([k, v]) =>
      // Diabetes, steroid, pregnancy, OI and bone-risk answers (dm, dmType…, steroid, preg…, oi…, bn…) stay out of the anonymous copy.
      !/(^notes$|^q5$|_other$|^dm|^steroid$|^preg|^oi|^bn)/.test(k) && (typeof v === 'string' || Array.isArray(v)))),
    flags: flags.filter((f) => f !== '__other'),
    results: shown.map(({ c, rk }) => ({ region: rk, id: c.id })),
    referral: referral.map((r) => ({ kind: r.kind, side: r.side || null, reach: r.reach || null, unsure: !!r.unsure })),
    travel: possibleRef.map((r) => ({ kind: r.kind, side: r.side || null, answer: travelAnswerOf(r, travel, strokeRef) })),
    painType: painType ? { primary: painType.primary, secondary: painType.secondary || null, subtype: painType.subtype || null } : null,
  })

  // The screen a review-screen entry lives on (the opening answers share 0).
  const screenOf = (q) =>
    activeQuestions.findIndex((s) => s === q || s.id === q.id || (s.group && s.group.includes(q)))
  // Question number = position in the path, which also stays right when a
  // question is reopened from the review screen.
  const step = Math.max(1, path.indexOf(qIndex) + 1)

  const goToQuestion = (i, viaReview = false) => { setFromReview(viaReview); setQIndex(i); setStage('questions') }
  // Marks along one chain are asked about together; marks in genuinely
  // separate areas ask the person to choose one first.
  const startQuestions = () => {
    if (!widespreadPath && needsAreaChoice(flowZ, focusKey)) { setStage('area'); return }
    // What the drawing already answers (a line to the hand = "past the
    // elbow") — shown selected, and still changeable.
    setAnswers((a) => ({ ...drawn, ...a }))
    setPath([0])
    goToQuestion(0)
  }
  // Back from the first question (or the area choice): the last safety step
  // answered, the injury questions when they applied.
  const backToSafety = () => setStage(injuryApplies && injuryQ && !smartFirst ? 'injury' : 'physician')
  // The questions come in parts: emergency signs, then signs for a doctor
  // (with the injury questions), then the pain itself. An area with no
  // emergency page starts at the doctor part.
  const PART_NAMES = { emergency: 'Emergency Check', physician: 'Doctor Check', pain: 'About Your Pain' }
  const partLabel = (part) => {
    const parts = ['emergency', 'physician', 'pain'].filter((p) => p !== 'emergency' || screening.emergency.length)
    return `Part ${parts.indexOf(part) + 1} of ${parts.length} · ${PART_NAMES[part]}`
  }
  // Region flows ask whichever question is most useful next, or finish; the
  // generic set (areas without their own questions) simply goes in order.
  const nextFromQuestion = () => {
    if (fromReview) { setFromReview(false); setStage('review'); return }
    let next = -1
    if (keys.length) {
      // Scored questions first, then the closing screens in order.
      const t = tailIndexes.indexOf(qIndex)
      if (t >= 0) {
        next = t + 1 < tailIndexes.length ? tailIndexes[t + 1] : -1
      } else {
        // The drawing and every answer so far decide which questions apply
        // (a question's `askIf`), e.g. the neck's arm questions.
        const id = nextQuestion(keys, scopedAnswers, askedIds, MAX_SCORED_QUESTIONS,
          // Types, plus type@surface (e.g. head@back) for questions that
          // depend on which side of the body was marked.
          { draw: zones.flatMap((z) => (z.face ? [z.type, `${z.type}@${z.face}`] : [z.type])), all: answers, minor: minorKeys })
        next = id ? activeQuestions.findIndex((s) => s.id === id) : tailIndexes[0]
      }
    } else if (qIndex + 1 < activeQuestions.length) {
      next = qIndex + 1
    }
    // C4: no "How it is affecting you" screen for new, mild pain.
    if (next >= 0 && activeQuestions[next].id === PSYCH_ID && skipPsych) next = keys.length || next + 1 >= activeQuestions.length ? -1 : next + 1
    if (next < 0) { setStage('review'); return }
    setPath((p) => [...p, next])
    setQIndex(next)
  }
  const backFromQuestion = () => {
    if (fromReview) { setFromReview(false); setStage('review'); return }
    if (path.length <= 1) { backToSafety(); return }
    const p = path.slice(0, -1)
    setPath(p)
    setQIndex(p[p.length - 1])
  }

  // Injury screen. Answers only count once Continue is pressed, so ticking
  // one box of a "tick all that apply" question does not move straight on.
  const withoutInjury = (a, keep = []) => {
    const out = { ...a }
    for (const id of INJURY_KEYS) if (!keep.includes(id)) delete out[id]
    return out
  }
  const startInjury = () => {
    setAnswers((a) => withoutInjury(a))
    setInjuryPath([]); setInjuryDraft(undefined)
    setInjuryQ(injuryFlow(flowZ, {}, answers.age).next)
    setStage('injury')
  }
  const continueInjury = (draft = injuryDraft) => {
    const next = { ...answers, [injuryQ]: draft }
    const r = injuryFlow(flowZ, next, answers.age)
    setAnswers(next)
    setInjuryPath((p) => (p.includes(injuryQ) ? p : [...p, injuryQ]))
    if (r.next) { setInjuryQ(r.next); setInjuryDraft(undefined); return }
    if (r.route === 'emergency' || r.route === 'urgent') routeUrgent('injury')
    else if (smartFirst) setStage('physician')
    else startQuestions()
  }
  // Back one question; answers after it are cleared so a changed route
  // never reuses them without asking.
  const backInjury = () => {
    const p = injuryPath.filter((id) => id !== injuryQ)
    if (!p.length) { setAnswers((a) => withoutInjury(a)); setStage(smartFirst ? (screening.emergency.length ? 'emergency' : 'about') : 'physician'); return }
    const prev = p[p.length - 1]
    setInjuryDraft(answers[prev])
    setAnswers((a) => withoutInjury(a, p.slice(0, -1)))
    setInjuryPath(p.slice(0, -1)); setInjuryQ(prev)
  }
  const pickInjury = (q, oid) => setInjuryDraft((cur) => {
    if (!q.multi) return oid
    const list = Array.isArray(cur) ? cur : []
    if (list.includes(oid)) return list.filter((x) => x !== oid)
    return oid === 'none' ? ['none'] : [...list.filter((x) => x !== 'none'), oid]
  })
  // A one-answer question moves on by itself once the tap has shown, so it
  // costs one tap instead of two. Tick-all questions still wait for Continue.
  const advanceTimer = useRef(null)
  useEffect(() => () => clearTimeout(advanceTimer.current), [])
  const tapInjury = (q, oid) => {
    pickInjury(q, oid)
    if (q.multi) return
    clearTimeout(advanceTimer.current)
    advanceTimer.current = setTimeout(() => continueInjury(oid), 280)
  }

  const restart = () => {
    setFlaggedAt(null)
    setStage('landing'); setQIndex(0); setZones([]); setLines([]); setTravel({}); setPathPick(null); setAnswers({}); setFlags([]); setFlagOther(''); setFocusKey(null); setBirthSex(null)
    setClearSignal((n) => n + 1); setFromReview(false); setDrawMode('turn'); setShowAnswers(false); setReview(null)
    setInjuryPath([]); setInjuryQ(null); setInjuryDraft(undefined); setOpenCautions([])
    setVisitCode(null); codeAsked.current = false
  }

  return (
    <section ref={sectionRef} className="pa-section" style={{
      background: 'var(--black)', fontFamily: 'var(--font-body)',
      // overflowX 'clip' (not 'hidden'): hidden would make this a scroll
      // container and stop the figure sticking as the results are read.
      minHeight: '100svh', position: 'relative', overflowX: 'clip',
    }}>
      <div className="pa-grid" style={{ maxWidth: 1280, margin: '0 auto' }}>
        <style>{`
          /* Clear the fixed navbar, then leave breathing room above the fold. */
          .pa-section { padding-top: clamp(74px, 19vw, 92px); }

          /* Landing: the text sits centred on the page — no panel around it. */
          .pa-landing {
            position: relative; display: flex; align-items: center; justify-content: center;
            min-height: calc(100svh - clamp(74px, 19vw, 92px) - 40px); padding: 24px 0;
          }
          .pa-glass {
            width: 100%; max-width: 680px; text-align: center;
            padding: 0 clamp(4px, 2vw, 24px);
          }
          .pa-glass-title {
            background: linear-gradient(180deg, #ffffff 30%, rgba(214,224,240,0.78));
            -webkit-background-clip: text; background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .pa-glass-title em { -webkit-text-fill-color: ${GOLD_LIGHT}; }

          /* Draw step: Turn / Draw sit either side of the head, Undo / Redo
             either side of the legs. The layer ignores the pointer so the body
             underneath can still be dragged; only the buttons take clicks. */
          .pa-onbody { position: absolute; inset: 0; z-index: 3; pointer-events: none; }
          .pa-ob {
            position: absolute; pointer-events: auto; cursor: pointer;
            display: inline-flex; align-items: center; gap: 7px;
            padding: 10px 18px; min-height: 44px; border-radius: 999px;
            font-family: var(--font-body); font-size: 13.5px; letter-spacing: 0.08em; text-transform: uppercase;
            color: rgba(255,255,255,0.88);
            background: rgba(9,17,32,0.62);
            border: 1px solid rgba(201,169,110,0.40);
            backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
            transition: background 0.15s, color 0.15s, opacity 0.15s;
          }
          .pa-ob.on { background: ${GOLD}; color: #081527; font-weight: 700; border-color: ${GOLD}; }
          .pa-ob:disabled { opacity: 0.35; cursor: not-allowed; }
          /* Turn and Draw sit at head height, out above the hands rather than
             tight beside the head (Chandra, 28 Sep 2026: too close). The
             offset grows with the body area (20% of its width), from 88px on
             a phone to 130px on a wide screen. Undo and Redo line up under
             them where there is room; on a phone they keep 70px. */
          .pa-ob-turn { top: 9%;  right: calc(50% + clamp(88px, 20%, 130px)); }
          .pa-ob-draw { top: 9%;  left:  calc(50% + clamp(88px, 20%, 130px)); }
          .pa-ob-erase { top: calc(9% + 56px); left: calc(50% + clamp(88px, 20%, 130px)); }
          .pa-ob-undo { bottom: 9%; right: calc(50% + clamp(70px, 20%, 130px)); }
          .pa-ob-redo { bottom: 9%; left:  calc(50% + clamp(70px, 20%, 130px)); }
          @media (max-width: 380px) {
            .pa-ob { padding: 9px 14px; font-size: 12.5px; }
          }

          .pa-grid {
            display: grid; grid-template-columns: 1fr; gap: 4px;
            padding: 0 clamp(16px, 4vw, 48px) clamp(32px, 8vw, 56px);
            padding-left: max(clamp(16px, 4vw, 48px), env(safe-area-inset-left));
            padding-right: max(clamp(16px, 4vw, 48px), env(safe-area-inset-right));
            padding-bottom: calc(clamp(32px, 8vw, 56px) + env(safe-area-inset-bottom));
          }

          /* Phone: the body sits on top and takes the space that used to sit
             empty below the panel. Sized off the *small* viewport unit so the
             browser chrome collapsing never crops it. */
          .pa-model { height: min(68svh, 640px); order: -1; }
          /* Once the questions begin the figure shrinks, but it must stay big
             enough to read the marked areas on it. */
          .pa-model.small { height: min(42svh, 380px); }

          /* The canvas owns the flexible space; the caption sits BELOW it in
             normal flow so it can never overlap the body. */
          .pa-model { display: flex; flex-direction: column; min-height: 0; }
          .pa-model-stage { flex: 1 1 auto; min-height: 0; position: relative; }
          .pa-model-caption {
            flex: 0 0 auto; margin: 8px 0 0; text-align: center;
            font-size: 11.5px; letter-spacing: 0.14em; text-transform: uppercase;
            color: rgba(255,255,255,0.45);
          }

          /* Short phones (or landscape) — keep the panel readable. */
          @media (max-height: 700px) and (max-width: 899px) {
            .pa-model { height: min(56svh, 460px); }
            .pa-model.small { height: min(36svh, 280px); }
          }

          /* Action rows: primary and Back always sit SIDE BY SIDE. */
          .pa-actions {
            display: flex; gap: 10px; align-items: stretch;
            max-width: 520px; margin-top: 4px;
          }
          .pa-actions > * { flex: 1 1 0; min-width: 0; text-align: center; }
          .pa-actions > .pa-primary { flex: 1.9 1 0; }

          /* Undo / Redo / Clear row above the main actions. */
          .pa-tools { display: flex; gap: 9px; flex-wrap: wrap; margin-bottom: 14px; }

          /* One-line intro under a step heading. */
          .pa-lede {
            margin: 0 0 18px; max-width: 460px;
            font-size: clamp(14.5px, 3.6vw, 16px); line-height: 1.55;
            color: rgba(255,255,255,0.72);
          }

          /* How it works: one centred column, phone and desktop (no 3D body). */
          .pa-guide { max-width: 940px; margin: 0 auto; padding-bottom: 32px; }
          .pa-guide-video { display: flex; justify-content: center; }
          .pa-guide-video > div { margin: 0 0 18px !important; }
          .pa-guide-actions { margin: 4px auto 0; }

          /* Gesture list: badge + text, wrapping safely on narrow phones. */
          .pa-gestures {
            list-style: none; margin: 0 0 22px; padding: 0;
            display: grid; gap: 9px; max-width: 460px;
          }
          .pa-gestures li { display: flex; align-items: flex-start; gap: 12px; }
          .pa-gestures__badge {
            width: 30px; height: 30px; border-radius: 999px; flex: 0 0 auto;
            display: inline-flex; align-items: center; justify-content: center;
            border: 1px solid rgba(201,169,110,0.45); color: ${GOLD_LIGHT};
            font-size: 15px; line-height: 1;
          }
          .pa-gestures li > span:last-child {
            font-size: clamp(14px, 3.5vw, 15px); line-height: 1.45;
            color: rgba(255,255,255,0.72); padding-top: 5px; min-width: 0;
          }
          .pa-gestures b { color: rgba(255,255,255,0.94); font-weight: 600; }

          /* Swipe nudge sitting on the model itself, where the gesture happens
             rather than in a list the visitor has already stopped reading. */
          .pa-swipe {
            position: absolute; left: 50%; bottom: 8px; transform: translateX(-50%);
            z-index: 3; pointer-events: none; white-space: nowrap;
            display: flex; align-items: center; gap: 10px;
            padding: 8px 15px; border-radius: 999px;
            background: rgba(9,17,32,0.74); backdrop-filter: blur(6px);
            border: 1px solid rgba(201,169,110,0.34);
            color: rgba(255,255,255,0.88); font-size: 13px; letter-spacing: 0.01em;
            animation: pa-swipe-in 0.45s ease both 0.7s;
          }
          .pa-swipe__track {
            position: relative; width: 52px; height: 16px; flex: 0 0 auto;
            display: inline-flex; align-items: center; justify-content: space-between;
          }
          .pa-swipe__chev { color: rgba(201,169,110,0.75); font-size: 15px; line-height: 1; }
          .pa-swipe__dot {
            position: absolute; left: 22px; width: 8px; height: 8px; border-radius: 50%;
            background: ${GOLD_LIGHT}; box-shadow: 0 0 10px rgba(201,169,110,0.6);
            animation: pa-swipe-move 1.9s ease-in-out infinite;
          }
          @keyframes pa-swipe-move {
            0%, 100% { transform: translateX(-15px); opacity: 0.55; }
            50%      { transform: translateX(15px);  opacity: 1; }
          }
          @keyframes pa-swipe-in { from { opacity: 0; } to { opacity: 1; } }

          /* Gateway groups on the doctor page (knee prototype). */
          .pa-gate { display: flex; flex-direction: column; gap: 8px; }
          .pa-gate-body { display: flex; flex-direction: column; gap: 8px; margin: 2px 0 6px 18px; padding-left: 14px;
            border-left: 2px solid rgba(201,169,110,0.55); }
          .pa-gate-ask { margin: 2px 0 0; font-size: 13.5px; color: #e8d5b0; letter-spacing: 0.02em; }
          .pa-gate-hint { margin: 4px 0 0; font-size: 13.5px; color: #fcd34d; }

          /* "We will ask about the ticked areas": a gold callout after drawing,
             with a short glow when it first appears. */
          .pa-areas-note {
            display: flex; align-items: flex-start; gap: 10px; margin: 0 0 12px;
            padding: 12px 14px; border-radius: 12px;
            border: 1px solid rgba(201,169,110,0.9); border-left: 5px solid ${GOLD};
            background: rgba(201,169,110,0.24);
            color: #f6ead0; font-size: clamp(15px, 3.8vw, 16px); font-weight: 500; line-height: 1.5;
            animation: pa-note-in 0.4s ease both, pa-note-glow 1.6s ease-out 0.4s 2;
          }
          .pa-areas-note strong { color: #fff; font-weight: 700; }
          @keyframes pa-note-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
          @keyframes pa-note-glow {
            0%   { box-shadow: 0 0 0 0 rgba(201,169,110,0.55); }
            70%  { box-shadow: 0 0 0 10px rgba(201,169,110,0); }
            100% { box-shadow: 0 0 0 0 rgba(201,169,110,0); }
          }
          @media (prefers-reduced-motion: reduce) {
            .pa-swipe, .pa-swipe__dot, .pa-areas-note { animation: none; }
          }
          /* Narrow phones: keep the pill inside the frame. */
          @media (max-width: 380px) {
            .pa-swipe { font-size: 12px; padding: 7px 12px; gap: 8px; }
            .pa-swipe__track { width: 42px; }
            .pa-swipe__dot { left: 17px; }
            @keyframes pa-swipe-move {
              0%, 100% { transform: translateX(-12px); opacity: 0.55; }
              50%      { transform: translateX(12px);  opacity: 1; }
            }
          }

          @media (min-width: 900px) {
            .pa-grid { grid-template-columns: ${stage === 'landing' || stage === 'guide' ? '1fr' : modelSmall ? '1fr 340px' : '5fr 6fr'}; gap: 36px; align-items: center; }
            .pa-model { order: 2; height: min(86vh, 820px); }
            /* From the questions onward the panel grows much taller than the
               figure, and centring it parks the figure halfway down a long
               page — off screen exactly when someone wants to see which areas
               they marked. Pin it to the top and let it follow the scroll. */
            .pa-model.small {
              height: 460px;
              align-self: start;
              position: sticky;
              top: calc(clamp(74px, 19vw, 92px) + 12px);
            }
          }
        `}</style>

        {/* ── LEFT: the guided panel ── */}
        <div style={{ minWidth: 0, paddingTop: 8 }}>
          <AnimatePresence mode="wait">

            {/* LANDING — heading + Start only. The 3D body is not shown here;
                it appears once Start is pressed. */}
            {stage === 'landing' && (
              <Fade k="landing">
                <div className="pa-landing">
                  <div className="pa-glass">
                    <h1 className="pa-glass-title" style={{ ...h2, fontSize: 'clamp(34px,8.5vw,60px)', margin: isPhone ? '0 0 24px' : '0 0 32px' }}>
                      What Could Be Causing<br /><em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>Your Pain</em>?
                    </h1>
                    <div className="pa-actions" style={{ margin: '0 auto' }}>
                      <button className="pa-primary" style={goldBtn} onClick={() => setStage('guide')}>start</button>
                    </div>
                    {/* How long it takes, set apart in a soft gold panel. */}
                    <p style={{
                      fontSize: 'clamp(17px, 4.4vw, 19px)', lineHeight: 1.55, color: '#fff', fontWeight: 500,
                      margin: '20px auto 0', maxWidth: 520, padding: '14px 20px', borderRadius: 14,
                      background: 'rgba(201,169,110,0.22)', border: '1px solid rgba(201,169,110,0.55)',
                    }}>
                      It takes about <span style={{ color: GOLD_LIGHT }}>5 minutes</span>.
                      Careful answers give the most useful results.
                    </p>
                    <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', margin: '20px auto 0', maxWidth: 520 }}>
                      This guide offers general information to help you describe your symptoms.
                      It is not a diagnosis and does not replace an assessment by a qualified
                      health professional. Your answers stay on this device unless you choose to
                      share them: the optional AI overview, emailing your summary to Chandra, or
                      an optional anonymous copy to help improve this guide
                      (<Link to="/privacy" style={{ color: GOLD_LIGHT, textDecoration: 'underline' }}>privacy notice</Link>).
                    </p>
                  </div>
                </div>
              </Fade>
            )}

            {/* HOW IT WORKS: a page of its own after Start (Chandra, 28 Sep
                2026). Redesigned 6 Oct 2026 (Chandra): no 3D body here, the three
                steps and how to move the body as pictures (./GuideSteps.jsx),
                centred on phone and desktop. The body first appears on the
                next page, where the "Drag to turn" hint shows on it. */}
            {stage === 'guide' && (
              <Fade k="guide">
                <div className="pa-guide">
                  <div style={{ ...headBand(), maxWidth: 'none' }}>
                    <span style={label}>How It Works</span>
                    <h2 style={{ ...h2, fontSize: 'clamp(28px,6.4vw,42px)', margin: '12px 0 0' }}>
                      Three <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>simple steps</em>
                    </h2>
                  </div>
                  <GuideSteps phone={isPhone} />
                  {/* A short video on how the guide works, behind a button
                      (shown once public/videos/guide-intro.mp4 exists). */}
                  <div className="pa-guide-video"><GuideVideo /></div>
                  <div className="pa-actions pa-guide-actions">
                    <button className="pa-primary" style={goldBtn} onClick={() => setStage('draw')}>Continue</button>
                    <button style={ghostBtn} onClick={restart}>Back</button>
                  </div>
                </div>
              </Fade>
            )}

            {/* MARK YOUR PAIN — Turn / Draw on the body switch what a drag
                does; how to move the body was explained on the page before. */}
            {stage === 'draw' && (
              <Fade k="draw">
                <div style={headBand()}>
                  <span style={label}>Mark Your Pain</span>
                  <h2 style={{ ...h2, fontSize: 'clamp(28px,6.4vw,42px)', margin: '12px 0 8px' }}>
                    Draw on every <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>painful area</em>
                  </h2>
                  <p className="pa-lede" style={{ margin: 0 }}>
                    Tap <b>Draw</b> on the body, then trace every painful area. Tap <b>Turn</b> to
                    spin the body.
                  </p>
                </div>

                {/* Turn / Draw and Undo / Redo sit on the body itself (see the
                    model panel); only the marked areas and Clear All stay here. */}
                {/* The areas the questions will be about: ticked when drawn on,
                    unticked when the line only touched them; a tap changes it. */}
                {/* One pain that travels, or separate pains? Asked when the
                    marks on one side run from the spine down the limb, so
                    a line drawn in two strokes is not read as separate joints. */}
                {/* Path 4: pain in many places, or one area most? */}
                {widespreadDrawing && (
                  <div role="group" aria-label={PATH_QUESTION} style={{ marginBottom: 18, maxWidth: 520 }}>
                    <p style={{ ...body, margin: '0 0 10px', fontWeight: 600 }}>{PATH_QUESTION}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {PATH_OPTIONS.map((o) => (
                        <button key={o.id} style={chip(pathPick === o.id)} aria-pressed={pathPick === o.id}
                          onClick={() => setPathPick(o.id)}>
                          <span>{o.label}</span>
                          <Tick on={pathPick === o.id} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {!widespreadPath && possibleRef.map((r) => {
                  const a = travelAnswerOf(r, travel, strokeRef)
                  return (
                    <div key={referralKey(r)} role="group" aria-label={travelQuestion(r)} style={{ marginBottom: 18, maxWidth: 520 }}>
                      <p style={{ ...body, margin: '0 0 10px', fontWeight: 600 }}>{travelQuestion(r)}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {TRAVEL_OPTIONS.map((o) => (
                          <button key={o.id} style={chip(a === o.id)} aria-pressed={a === o.id}
                            onClick={() => setTravel((t) => ({ ...t, [referralKey(r)]: o.id }))}>
                            <span>{o.label}</span>
                            <Tick on={a === o.id} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
                {zones.length > 0 && (
                  <div style={{ marginBottom: 18, maxWidth: 520 }}>
                    {/* Highlighted (Chandra, 4 Oct 2026): a gold callout that
                        glows briefly when it appears, so it is read after drawing. */}
                    {areaChips.length > 1 && (
                      <p className="pa-areas-note" role="note">
                        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
                          <circle cx="12" cy="12" r="10" fill="none" stroke={GOLD} strokeWidth="2" />
                          <path d="M12 10.5v6M12 7.2v.6" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round" />
                        </svg>
                        <span>We will ask about the <strong>ticked areas</strong>. Tap an area to <strong>add</strong> or <strong>remove</strong> it.</span>
                      </p>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                      {areaChips.map((c) => (
                        <button key={c.key} onClick={() => toggleArea(c.key)} aria-pressed={c.on}
                          disabled={areaChips.length === 1}
                          style={{
                            ...pill, cursor: areaChips.length > 1 ? 'pointer' : 'default', fontFamily: 'var(--font-body)',
                            ...(c.on ? {} : { background: 'transparent', color: 'rgba(255,255,255,0.6)', borderStyle: 'dashed' }),
                          }}>
                          {c.on ? '✓ ' : '+ '}{c.on || !c.touched ? c.name : `Also touched: ${c.name}`}
                        </button>
                      ))}
                      <button style={toolBtn(false)} onClick={() => setClearSignal((n) => n + 1)}>Clear All</button>
                    </div>
                  </div>
                )}

                <div className="pa-actions">
                  <button
                    className="pa-primary"
                    style={{ ...goldBtn, opacity: drawBlocked ? 0.45 : 1, cursor: drawBlocked ? 'not-allowed' : 'pointer' }}
                    disabled={drawBlocked}
                    onClick={() => setStage('about')}
                  >Continue</button>
                  <button style={ghostBtn} onClick={() => setStage('guide')}>Back</button>
                </div>

                {!zones.length && (
                  <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)', margin: '14px 0 0' }}>
                    Please draw at least one line on the body to continue.
                  </p>
                )}
                {zones.length > 0 && pathPending && (
                  <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)', margin: '14px 0 0' }}>
                    Please answer the question about where your pain is to continue.
                  </p>
                )}
                {zones.length > 0 && travelPending && !widespreadPath && (
                  <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)', margin: '14px 0 0' }}>
                    Please answer the question about how your pain travels to continue.
                  </p>
                )}
              </Fade>
            )}

            {/* CHOOSE THE FOCUS AREA — only when the marks cross more than
                one area. Each area has its own clinician-authored questions,
                so asking beats silently guessing which area the person meant. */}
            {stage === 'area' && (
              <Fade k="area">
                <div style={headBand()}>
                <span style={label}>One More Step</span>
                <h2 style={{ ...h2, fontSize: 'clamp(28px,6.4vw,40px)', margin: '12px 0 0' }}>
                  Which area should the questions <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>focus on?</em>
                </h2>
                </div>
                <p style={{ ...body, margin: '0 0 20px', maxWidth: 460 }}>
                  Your marks are in more than one separate area, and each area has its
                  own set of questions. Choose the one that bothers you most — you can run
                  the guide again afterwards for the others.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, maxWidth: 520 }}>
                  {regionChoices.map((r, i) => {
                    const sel = focusKey === r.key
                    return (
                      <button key={r.key} style={chip(sel)} onClick={() => setFocusKey(sel ? null : r.key)}>
                        <span style={letterStyle(sel)}>{LETTERS[i] || '·'}</span>
                        <span>{r.name}</span>
                        <Tick on={sel} />
                      </button>
                    )
                  })}
                </div>
                <div className="pa-actions" style={{ marginTop: 20 }}>
                  <button
                    className="pa-primary"
                    style={{ ...goldBtn, opacity: focusKey ? 1 : 0.45, cursor: focusKey ? 'pointer' : 'not-allowed' }}
                    disabled={!focusKey}
                    onClick={startQuestions}
                  >Continue</button>
                  <button style={ghostBtn} onClick={backToSafety}>Back</button>
                </div>
              </Fade>
            )}

            {/* QUESTIONS — multi-select A–D + Other (entered manually) */}
            {stage === 'questions' && (() => {
              const q = activeQuestions[qIndex]
              const a = answers[q.id]
              // Multi questions may be left empty ("none of these apply");
              // single-answer questions need a choice before continuing.
              // A grouped screen needs every one of its questions answered.
              const otherPicked = Array.isArray(a) && a.includes(OTHER_ID)
              const otherText = (answers[q.id + '_other'] || '').trim()
              // A list behind a yes/no needs the yes/no answered first.
              const gateClosed = !q.group && !listOpen(q)
              const canNext = gateClosed ? a !== undefined : q.group
                ? groupOf(q).every((sub) => (sub.multi
                  ? Array.isArray(answers[sub.id]) && answers[sub.id].length > 0
                  : answers[sub.id] !== undefined))
                : q.textarea
                  ? true
                  : q.multi
                    ? (!otherPicked || otherText.length > 0)
                    : a !== undefined
              return (
                <Fade k={'q' + qIndex}>
                  {/* On the first question only: the move from the safety
                      checks to the pain questions, and why these areas when
                      the drawing covers more than one. */}
                  {step === 1 && !fromReview && (
                    <p style={{ fontSize: 15, lineHeight: 1.6, color: GOLD_LIGHT, margin: '0 0 18px', maxWidth: 520 }}>
                      <span style={{ ...label, display: 'block', marginBottom: 4 }}>{partLabel('pain')}</span>
                      Safety checks complete. Now, a few questions about your pain, to match
                      it with the conditions a physiotherapist commonly treats.
                    </p>
                  )}
                  {/* Headline band: where they are. A grouped screen's title
                      ("How your pain behaves") sits in it too. */}
                  <div style={headBand()}>
                  <span style={label}>{q.area ? `${q.area} · ` : ''}Question {step} of {Math.max(plannedScreens, step)}</span>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 2, margin: '12px 0 0', maxWidth: 520 }}>
                    <motion.div animate={{ width: `${(step / Math.max(plannedScreens, step)) * 100}%` }} style={{ height: 4, background: GOLD, borderRadius: 2 }} />
                  </div>
                  {q.group && (
                    <>
                      <h2 style={{ ...h2, fontSize: 'clamp(25px,5.8vw,36px)', margin: '16px 0 6px' }}>{q.text}</h2>
                      <p style={{ ...body, fontSize: 14.5, color: 'rgba(255,255,255,0.65)', margin: 0 }}>{q.hint || 'Tap an answer for each.'}</p>
                    </>
                  )}
                  </div>
                  {step === 1 && !fromReview && multiPattern && zones.length > 1 && (referral.length > 0 && keys.length === 1 ? (
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', margin: '0 0 12px', maxWidth: 520 }}>
                      Pain that travels down the {referral[0].kind} often starts in
                      the {referral[0].kind === 'arm' ? 'neck' : 'back'}, so these questions start with
                      the {REGIONS[keys[0]].name.toLowerCase()}.
                    </p>
                  ) : multiArea ? (
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', margin: '0 0 12px', maxWidth: 520 }}>
                      These questions cover the {(() => {
                        const n = keys.map((k) => REGIONS[k].name.toLowerCase())
                        return `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`
                      })()}, the areas you marked.
                    </p>
                  ) : null)}
                  {/* Question panel (teal): the question and its answers. A
                      grouped screen gets one panel per question instead. */}
                  <div style={q.group ? { maxWidth: 560 } : qPanel}>
                  {!q.group && (
                    <>
                      <h2 style={{ ...h2, fontSize: 'clamp(24px,5.6vw,34px)', margin: '0 0 8px', display: 'flex', gap: 12 }}>
                        <span aria-hidden="true" style={{ ...qMark, width: 5 }} />
                        <span>{gateClosed ? q.gate.ask : q.text}</span>
                      </h2>
                      {gateClosed && q.gate.signs && (
                        <p style={{ ...body, fontSize: 14.5, color: 'rgba(255,255,255,0.62)', margin: '0 0 16px' }}>
                          For example: {q.gate.signs}.
                        </p>
                      )}
                      {!q.textarea && !gateClosed && (
                        <p style={{ ...body, fontSize: 14.5, color: 'rgba(255,255,255,0.62)', margin: '0 0 16px' }}>
                          {q.multi ? 'Select all that apply — or continue if none do.' : 'Choose one.'}
                        </p>
                      )}
                    </>
                  )}

                  {q.group ? (
                    <div>
                      {groupOf(q).map((sub, si, subs) => (
                        <div key={sub.id} style={{ ...qPanel, marginBottom: si === subs.length - 1 ? 0 : 12 }}>
                          <div style={qText}><span aria-hidden="true" style={qMark} /><span>{sub.text}</span></div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {arrangeOptions(sub.id === 'pattern24' && restWorseKnown ? sub.options.filter((o) => o.id !== 'restWorse') : sub.options, sub.text).map((opt) => {
                              const sel = isPicked(sub, opt.id)
                              return (
                                <button key={opt.id} onClick={() => toggleAnswer(sub, opt.id)}
                                  style={{
                                    padding: '12px 16px', borderRadius: 12, cursor: 'pointer', minHeight: 48,
                                    fontSize: 15, lineHeight: 1.35, textAlign: 'left', flex: '0 1 auto',
                                    fontFamily: 'var(--font-body)', transition: 'all 0.15s',
                                    border: `1px solid ${sel ? GOLD : 'rgba(255,255,255,0.22)'}`,
                                    background: sel ? 'rgba(201,169,110,0.22)' : 'rgba(8,21,39,0.55)',
                                    color: sel ? GOLD_LIGHT : 'rgba(255,255,255,0.88)',
                                  }}>{sel && sub.multi ? '✓ ' : ''}{opt.label}</button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : gateClosed ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, maxWidth: 520 }}>
                      {/* Yes opens the list; No answers it with its "none" answer. */}
                      <button style={chip(false)} onClick={() => {
                        setOpenLists((cur) => [...cur, q.id])
                        if (Array.isArray(a) && a.length === 1 && a[0] === q.gate.no) setAnswer(q.id, undefined)
                      }}>
                        <span style={letterStyle(false)}>A</span>
                        <span>Yes, show me the list</span>
                      </button>
                      {(() => {
                        const sel = Array.isArray(a) && a.length === 1 && a[0] === q.gate.no
                        return (
                          <button style={chip(sel)} onClick={() => setAnswer(q.id, sel ? undefined : [q.gate.no])}>
                            <span style={letterStyle(sel)}>B</span>
                            <span>No</span>
                            <Tick on={sel} />
                          </button>
                        )
                      })()}
                    </div>
                  ) : q.textarea ? (
                    <textarea
                      value={a || ''}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder={q.placeholder}
                      rows={5}
                      style={{
                        width: '100%', maxWidth: 520, resize: 'vertical', borderRadius: 14, boxSizing: 'border-box',
                        border: '1px solid rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.05)',
                        color: '#fff', padding: '15px 17px', fontSize: 16.5, lineHeight: 1.6, fontFamily: 'var(--font-body)',
                      }}
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, maxWidth: 520 }}>
                      {/* A direct "No" first, the real answers, "Something
                          else", then "None of these" last (../data/optionOrder.js). */}
                      {(() => {
                        const { head, tail } = arrangeSplit(q.options, q.text)
                        const chipFor = (opt, oi) => {
                          const sel = isPicked(q, opt.id)
                          return (
                            <button key={opt.id} style={chip(sel)} onClick={() => toggleAnswer(q, opt.id)}>
                              <span style={letterStyle(sel)}>{LETTERS[oi] || '·'}</span>
                              <span>{opt.label}</span>
                              <Tick on={sel} />
                            </button>
                          )
                        }
                        const other = q.multi ? 1 : 0
                        return (
                          <>
                            {head.map((opt, oi) => chipFor(opt, oi))}
                            {/* Free-text alternative. It carries no weights, so the
                                scoring engine ignores it — but it reaches the
                                physiotherapist on the summary, which is the point. */}
                            {q.multi && (() => {
                              const sel = isPicked(q, OTHER_ID)
                              return (
                                <>
                                  <button style={chip(sel)} onClick={() => toggleAnswer(q, OTHER_ID)}>
                                    <span style={letterStyle(sel)}>{LETTERS[head.length] || '·'}</span>
                                    <span>Something else — type it below</span>
                                    <Tick on={sel} />
                                  </button>
                            {sel && (
                              <input
                                autoFocus
                                value={answers[q.id + '_other'] || ''}
                                onChange={(e) => setAnswer(q.id + '_other', e.target.value)}
                                placeholder="Describe it in your own words…"
                                style={{
                                  borderRadius: 14, border: `1px solid ${GOLD}`, background: 'rgba(255,255,255,0.05)',
                                  color: '#fff', padding: '16px 17px', fontSize: 16.5,
                                  fontFamily: 'var(--font-body)', boxSizing: 'border-box', minHeight: 56,
                                }}
                              />
                            )}
                                </>
                              )
                            })()}
                            {tail.map((opt, i) => chipFor(opt, head.length + other + i))}
                          </>
                        )
                      })()}
                    </div>
                  )}
                  </div>

                  <div className="pa-actions" style={{ marginTop: 22 }}>
                    <button
                      className="pa-primary"
                      style={{ ...goldBtn, opacity: canNext ? 1 : 0.45, cursor: canNext ? 'pointer' : 'not-allowed' }}
                      disabled={!canNext}
                      onClick={nextFromQuestion}
                    >{fromReview ? 'Save' : (step >= plannedScreens || (keys.length && (q.id === TAIL_IDS[TAIL_IDS.length - 1] || (q.id === BEHAV_ID && skipPsych)))) ? 'Review Answers' : 'Continue'}</button>
                    <button style={ghostBtn} onClick={backFromQuestion}>Back</button>
                  </div>
                </Fade>
              )
            })()}

            {/* REVIEW & CONFIRM */}
            {stage === 'review' && (
              <Fade k="review">
                <div style={headBand()}>
                <span style={label}>Review &amp; Confirm</span>
                <h2 style={{ ...h2, fontSize: 'clamp(28px,6.4vw,40px)', margin: '12px 0 0' }}>
                  Anything to <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>add or change?</em>
                </h2>
                </div>
                <div style={{ ...card, marginBottom: 12, maxWidth: 520 }}>
                  <span style={{ ...label, fontSize: 11.5 }}>Pain areas</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 10 }}>
                    {zones.filter((z) => !outOf(z)).map((z) => <span key={z.id} style={pill}>{z.label}</span>)}
                  </div>
                  {/* Areas unticked on the Draw page: drawn, but not asked about. */}
                  {leftOut.size > 0 && (
                    <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)', margin: '10px 0 0', lineHeight: 1.5 }}>
                      Also touched, not asked about: {areaChips.filter((c) => !c.on).map((c) => c.name).join(', ')}
                    </p>
                  )}
                  {/* Where the pain is, read from the drawing instead of asked. */}
                  {drawnLocationPairs.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      {drawnLocationPairs.map((p) => (
                        <p key={p.area} style={{ fontSize: 14.5, color: '#fff', margin: '6px 0 0', lineHeight: 1.55 }}>
                          <span style={{ color: 'rgba(255,255,255,0.55)' }}>{p.area}, from your drawing: </span>{p.answer}
                        </p>
                      ))}
                      <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', margin: '8px 0 0', lineHeight: 1.5 }}>
                        Not quite right? Go back to the drawing and mark the spot again.
                      </p>
                    </div>
                  )}
                </div>
                {/* Folded by default: a list of 20-odd answers is a wall to
                    scroll past. Opening it shows each with its Change link. */}
                <button onClick={() => setShowAnswers((v) => !v)} aria-expanded={showAnswers}
                  style={{ ...card, width: '100%', maxWidth: 520, boxSizing: 'border-box', marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, cursor: 'pointer', color: '#fff', fontSize: 15.5, fontFamily: 'var(--font-body)', textAlign: 'left' }}>
                  <span>{showAnswers ? 'Hide your answers' : `Check or change your ${flatQuestions.length} answers`}</span>
                  <span aria-hidden="true" style={{ color: GOLD, fontSize: 18, lineHeight: 1 }}>{showAnswers ? '−' : '+'}</span>
                </button>
                {showAnswers && flatQuestions.map((q, i) => (
                  <div key={q.id} style={{ ...card, marginBottom: 10, maxWidth: 520, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.5 }}>{q.area ? `${q.area} — ` : ''}{q.text}</p>
                      <p style={{ fontSize: 15.5, color: '#fff', margin: '6px 0 0', lineHeight: 1.55 }}>{answerText(q)}</p>
                    </div>
                    <button onClick={() => (q.id === 'age' ? setStage('about') : goToQuestion(screenOf(q), true))}
                      style={{ background: 'none', border: 'none', color: GOLD, fontSize: 13.5, cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0, padding: '10px 2px 10px 12px', margin: '-10px -2px -10px 0', minHeight: 44, alignSelf: 'flex-start', fontFamily: 'var(--font-body)' }}>Change</button>
                  </div>
                ))}
                {/* The free-text box lives here rather than on a screen of its
                    own, which keeps the questions to eight screens at most. */}
                {keys.length > 0 && (
                  <div style={{ maxWidth: 520, margin: '6px 0 0' }}>
                    <label htmlFor="pa-notes" style={{ display: 'block', fontSize: 13.5, color: 'rgba(255,255,255,0.55)', margin: '0 0 8px', lineHeight: 1.5 }}>
                      {NOTES_Q.text} <span style={{ color: 'rgba(255,255,255,0.4)' }}>(optional)</span>
                    </label>
                    <textarea
                      id="pa-notes"
                      value={answers.notes || ''}
                      onChange={(e) => setAnswer('notes', e.target.value)}
                      placeholder={NOTES_Q.placeholder}
                      rows={4}
                      style={{
                        width: '100%', resize: 'vertical', borderRadius: 14, boxSizing: 'border-box',
                        border: '1px solid rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.05)',
                        color: '#fff', padding: '14px 16px', fontSize: 16, lineHeight: 1.6, fontFamily: 'var(--font-body)',
                      }}
                    />
                  </div>
                )}
                <div className="pa-actions" style={{ marginTop: 16 }}>
                  <button className="pa-primary" style={goldBtn} onClick={() => setStage('safety')}>Continue</button>
                  <button style={ghostBtn} onClick={() => goToQuestion(path[path.length - 1])}>Back</button>
                </div>
              </Fade>
            )}

            {/* A LITTLE ABOUT YOU — age and birth sex, so the safety pages ask
                only what can apply (Chandra, 2 Oct 2026). Birth sex stays on
                this device and in no summary, PDF or shared copy. */}
            {stage === 'about' && (
              <Fade k="about">
                <div style={headBand('gold')}>
                  <span style={bandLabel('gold')}>Before the Safety Questions</span>
                  <h2 style={{ ...h2, fontSize: 'clamp(25px,5.8vw,36px)', margin: '12px 0 10px', maxWidth: 520 }}>
                    A little <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>about you</em>
                  </h2>
                  <p style={{ ...body, fontSize: 15, color: 'rgba(255,255,255,0.75)', margin: 0, maxWidth: 520 }}>
                    These answers let us skip safety questions that cannot apply to you, and ask the ones that do.
                  </p>
                </div>
                <div style={{ ...qPanel, display: 'flex', flexDirection: 'column', gap: 9 }}>
                  <p style={{ ...qText, fontSize: 15, margin: '0 0 4px' }}><span aria-hidden="true" style={qMark} /><span>Your age?</span></p>
                  {ABOUT_AGES.map((o, i) => {
                    const sel = answers.age === o.id
                    return (
                      <button key={o.id} style={chip(sel)} onClick={() => { const keep = pregnancyAsked({ age: o.id, sex: birthSex }); setAnswers((a) => (keep ? { ...a, age: o.id } : dropPreg({ ...a, age: o.id }))) }}>
                        <span style={letterStyle(sel)}>{LETTERS[i]}</span><span>{o.label}</span>
                      </button>
                    )
                  })}
                </div>
                <div style={{ ...qPanel, display: 'flex', flexDirection: 'column', gap: 9, marginTop: 18 }}>
                  <p style={{ ...qText, fontSize: 15, margin: '0 0 4px' }}><span aria-hidden="true" style={qMark} /><span>Your sex assigned at birth?</span></p>
                  {ABOUT_SEX.map((o, i) => {
                    const sel = birthSex === o.id
                    return (
                      <button key={o.id} style={chip(sel)} onClick={() => { setBirthSex(o.id); if (!pregnancyAsked({ age: answers.age, sex: o.id })) setAnswers(dropPreg) }}>
                        <span style={letterStyle(sel)}>{LETTERS[i]}</span><span>{o.label}</span>
                      </button>
                    )
                  })}
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: '6px 0 0', lineHeight: 1.6, maxWidth: 520 }}>
                    Used only on this device to choose which safety questions to show (for example, pregnancy questions). It is not saved, not sent anywhere, and not included in your summary, PDF, AI overview or any shared copy.
                  </p>
                </div>
                {/* Pregnancy (../data/pregnancy.js): for a birth sex of female
                    or "prefer not to say", aged 16 to 49. Puts the obstetric
                    and postpartum red flags first and shapes the results. In
                    the summary and PDF, never in the anonymous copy or the AI
                    overview. */}
                {pregAsk && (
                  <div style={{ ...qPanel, display: 'flex', flexDirection: 'column', gap: 9, marginTop: 18 }}>
                    <p style={{ ...qText, fontSize: 15, margin: '0 0 4px' }}><span aria-hidden="true" style={qMark} /><span>{PREG_STATUS.text}</span></p>
                    {arrangeOptions(PREG_STATUS.options, PREG_STATUS.text).map((o, i) => {
                      const sel = answers.preg === o.id
                      return (
                        <button key={o.id} style={chip(sel)} onClick={() => setAnswers((a) => ({ ...a, preg: o.id, ...(o.id === 'pp6' || o.id === 'pp12' ? {} : { pregBirth: undefined }) }))}>
                          <span style={letterStyle(sel)}>{LETTERS[i]}</span><span>{o.label}</span>
                        </button>
                      )
                    })}
                    {isPostpartum(answers) && (
                      <>
                        <p style={{ fontSize: 14.5, color: '#fff', margin: '10px 0 2px', lineHeight: 1.5 }}>{PREG_BIRTH.text}</p>
                        {PREG_BIRTH.options.map((o) => {
                          const sel = answers.pregBirth === o.id
                          return (
                            <button key={o.id} style={chip(sel)} aria-pressed={sel} onClick={() => setAnswers((a) => ({ ...a, pregBirth: sel ? undefined : o.id }))}>
                              <span style={letterStyle(sel)}>{sel ? '✓' : '·'}</span><span>{o.label}</span>
                            </button>
                          )
                        })}
                      </>
                    )}
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: '6px 0 0', lineHeight: 1.6, maxWidth: 520 }}>
                      Pregnancy and the months after a birth change which safety questions matter and which exercise is right. This answer goes in your summary and PDF, not in any anonymous copy.
                    </p>
                  </div>
                )}
                {/* Diabetes (../data/diabetes.js): puts its red flags first and
                    shapes the results. In the summary and PDF, never in the
                    anonymous copy or the AI overview. */}
                <div style={{ ...qPanel, display: 'flex', flexDirection: 'column', gap: 9, marginTop: 18 }}>
                  <p style={{ ...qText, fontSize: 15, margin: '0 0 4px' }}><span aria-hidden="true" style={qMark} /><span>{DM_STATUS.text}</span></p>
                  {arrangeOptions(DM_STATUS.options, DM_STATUS.text).map((o, i) => {
                    const sel = answers.dm === o.id
                    return (
                      <button key={o.id} style={chip(sel)} onClick={() => setAnswers((a) => ({ ...a, dm: o.id }))}>
                        <span style={letterStyle(sel)}>{LETTERS[i]}</span><span>{o.label}</span>
                      </button>
                    )
                  })}
                </div>
                {/* A pars stress injury already diagnosed (../data/spondylolysis.js):
                    asked here, before the safety questions, so someone who has
                    had the X-ray is not asked to go and have it again. */}
                {spondyAsked(zones, answers.age) && (
                  <div style={{ ...qPanel, display: 'flex', flexDirection: 'column', gap: 9, marginTop: 18 }}>
                    <p style={{ ...qText, fontSize: 15, margin: '0 0 4px' }}><span aria-hidden="true" style={qMark} /><span>{SPONDY_STATUS.text}</span></p>
                    {SPONDY_STATUS.options.map((o, i) => {
                      const sel = answers.spondy === o.id
                      return (
                        <button key={o.id} style={chip(sel)} onClick={() => setAnswers((a) => ({ ...a, spondy: o.id }))}>
                          <span style={letterStyle(sel)}>{LETTERS[i]}</span><span>{o.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
                {/* Steroid medicine (../data/steroids.js), same handling. */}
                <div style={{ ...qPanel, display: 'flex', flexDirection: 'column', gap: 9, marginTop: 18 }}>
                  <p style={{ ...qText, fontSize: 15, margin: '0 0 4px' }}><span aria-hidden="true" style={qMark} /><span>{STEROID_STATUS.text}</span></p>
                  {arrangeOptions(STEROID_STATUS.options, STEROID_STATUS.text).map((o, i) => {
                    const sel = answers.steroid === o.id
                    return (
                      <button key={o.id} style={chip(sel)} onClick={() => setAnswers((a) => ({ ...a, steroid: o.id }))}>
                        <span style={letterStyle(sel)}>{LETTERS[i]}</span><span>{o.label}</span>
                      </button>
                    )
                  })}
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: '6px 0 0', lineHeight: 1.6, maxWidth: 520 }}>
                    Diabetes and steroid medicine change which safety questions matter and how some problems are best treated. These two answers go in your summary and PDF, not in any anonymous copy.
                  </p>
                </div>
                {/* Osteogenesis imperfecta (../data/oi.js): optional, a single
                    tick; leave it blank if it does not apply. */}
                <div style={{ ...qPanel, display: 'flex', flexDirection: 'column', gap: 9, marginTop: 18 }}>
                  <p style={{ ...qText, fontSize: 15, margin: '0 0 4px' }}><span aria-hidden="true" style={qMark} /><span>{OI_STATUS.text} <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>(optional)</span></span></p>
                  <button style={chip(oiOn(answers))} aria-pressed={oiOn(answers)}
                    onClick={() => setAnswers((a) => (oiOn(a) ? dropOi(a) : { ...a, oi: 'yes' }))}>
                    <span style={letterStyle(oiOn(answers))}>{oiOn(answers) ? '✓' : '·'}</span><span>{OI_STATUS.yes}</span>
                  </button>
                </div>
                <div className="pa-actions" style={{ marginTop: 20 }}>
                  <button className="pa-primary"
                    style={{ ...goldBtn, opacity: aboutDone ? 1 : 0.45, cursor: aboutDone ? 'pointer' : 'not-allowed' }}
                    disabled={!aboutDone}
                    onClick={() => setStage(screening.emergency.length ? 'emergency' : 'physician')}>Continue</button>
                  <button style={ghostBtn} onClick={() => setStage('draw')}>Back</button>
                </div>
              </Fade>
            )}

            {/* SAFETY FIRST — two pages straight after the drawing. Page 1 holds
                everything that means emergency care now; page 2 everything that means
                "see a doctor first". Any tick stops the questionnaire there. */}
            {(stage === 'emergency' || stage === 'physician') && (() => {
              const emergency = stage === 'emergency'
              const list = emergency ? screening.emergency : screening.physician
              const ticked = flaggedIn(list)
              const openEmpty = gateOpenEmpty(list)
              const next = () => {
                if (openEmpty) return
                if (ticked) { routeUrgent(stage); return }
                if (emergency) { if (smartFirst) startInjury(); else setStage('physician') }
                else if (injuryApplies && !smartFirst) startInjury()
                else startQuestions()
              }
              return (
                <Fade k={stage}>
                  <div style={headBand(emergency ? 'coral' : 'amber')}>
                  <span style={bandLabel(emergency ? 'coral' : 'amber')}>{partLabel(emergency ? 'emergency' : 'physician')}</span>
                  <h2 style={{ ...h2, fontSize: 'clamp(25px,5.8vw,36px)', margin: '12px 0 10px', maxWidth: 520 }}>
                    {emergency
                      ? <>First, let's rule out a <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>medical emergency</em></>
                      : <>Next, symptoms that may need a <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>doctor's attention</em></>}
                  </h2>
                  <p style={{ ...body, fontSize: 15, color: 'rgba(255,255,255,0.75)', margin: 0, maxWidth: 520 }}>
                    {emergency
                      ? (lbProto
                        ? 'These check for anything that needs help right now. Most people answer no to all of them. If one fits you now, tick it and we will tell you what to do.'
                        : 'These questions check for anything that needs urgent medical care right now. Most people answer no to all of them. If any applies to you now, select it and we will tell you what to do.')
                      : lbProto
                        ? 'Some signs mean a doctor should check you. Tick any that fit you now.'
                        : 'These can point to a problem your doctor should check. Select any that apply to you now.'}
                  </p>
                  </div>
                  {list.length > 0 ? (
                    <div style={{ ...qPanel, display: 'flex', flexDirection: 'column', gap: 9 }}>
                      {gateList(list)}
                      {openEmpty && (
                        <p className="pa-gate-hint" role="status">Please tick which one applies, or "Not sure which", or untick the group.</p>
                      )}
                    </div>
                  ) : (
                    <p style={{ ...body, fontSize: 15, maxWidth: 520 }}>Nothing on this page applies to the area you marked.</p>
                  )}
                  <div className="pa-actions" style={{ marginTop: 20 }}>
                    <button className="pa-primary" style={{ ...goldBtn, opacity: openEmpty ? 0.45 : 1, cursor: openEmpty ? 'not-allowed' : 'pointer' }}
                      onClick={next} aria-disabled={openEmpty}>
                      {ticked || openEmpty ? 'Continue' : 'None of These Apply — Continue'}
                    </button>
                    <button style={ghostBtn} onClick={() => {
                      // Knee prototype: the doctor page comes after the injury screen.
                      if (!emergency && smartFirst && injuryQ) { setStage('injury'); return }
                      setStage(emergency || !screening.emergency.length ? 'about' : 'emergency')
                    }}>Back</button>
                  </div>
                </Fade>
              )
            })()}

            {/* FINAL CHECK — before the results: the few flags only the answers
                can raise (constant night pain, the inflammatory pattern), an
                "other" box, and the cautions that shape the first appointment. */}
            {stage === 'safety' && (
              <Fade k="safety">
                <div style={headBand(finalChecks.length ? 'amber' : 'gold')}>
                <span style={bandLabel(finalChecks.length ? 'amber' : 'gold')}>Before Your Results</span>
                <h2 style={{ ...h2, fontSize: 'clamp(25px,5.8vw,36px)', margin: '12px 0 10px', maxWidth: 520 }}>
                  {finalChecks.length
                    ? <>One more <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>safety check</em></>
                    : <>Anything else <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>we should know?</em></>}
                </h2>
                <p style={{ ...body, fontSize: 15, color: 'rgba(255,255,255,0.75)', margin: 0, maxWidth: 520 }}>
                  {finalChecks.length
                    ? 'Your answers raised a question a doctor may need to look at first. Please tick it if it applies.'
                    : 'If another symptom worries you, add it here. The items below help plan your first appointment.'}
                </p>
                </div>

                <div style={{ ...qPanel, display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {/* Grouped like the doctor page (6 Oct 2026). */}
                  {gateList(finalChecks)}
                  {gateOpenEmpty(finalChecks) && (
                    <p className="pa-gate-hint" role="status">Please tick which one applies, or "Not sure which", or untick the group.</p>
                  )}
                  {(() => {
                    const sel = flags.includes('__other')
                    return (
                      <>
                        <button style={chip(sel)}
                          onClick={() => setFlags((cur) => sel ? cur.filter((x) => x !== '__other') : [...cur, '__other'])}>
                          <span style={letterStyle(sel)}>{LETTERS[gateRows(finalChecks).length] || '·'}</span>
                          <span>Other — enter your own answer</span>
                        </button>
                        {sel && (
                          <input
                            autoFocus
                            value={flagOther}
                            onChange={(e) => setFlagOther(e.target.value)}
                            placeholder="Please describe the symptom…"
                            style={{
                              borderRadius: 14, border: `1px solid ${GOLD}`, background: 'rgba(255,255,255,0.05)',
                              color: '#fff', padding: '16px 17px', fontSize: 16.5, fontFamily: 'var(--font-body)', boxSizing: 'border-box', minHeight: 56,
                            }}
                          />
                        )}
                      </>
                    )
                  })()}
                </div>

                {/* Diabetes details (../data/diabetes.js, module section 3):
                    one panel, every question optional. They tailor the
                    results; no score is ever shown. */}
                {dmQuestions.length > 0 && (
                  <div style={{ ...qPanel, display: 'flex', flexDirection: 'column', gap: 9, marginTop: 18 }}>
                    <p style={{ ...qText, fontSize: 15, margin: '0 0 2px' }}>
                      <span aria-hidden="true" style={qMark} />
                      <span>A few details about your diabetes</span>
                    </p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: '0 0 6px', lineHeight: 1.6 }}>
                      Diabetes makes some of the problems your answers point to more likely, and can change how they are best treated. Answer any you can; skip any you are not sure of.
                    </p>
                    {dmQuestions.map((q) => (
                      <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
                        <p style={{ fontSize: 14.5, color: '#fff', margin: 0, lineHeight: 1.5 }}>{q.text}</p>
                        {arrangeOptions(q.options, q.text).map((o) => {
                          const sel = [].concat(answers[q.id] || []).includes(o.id)
                          return (
                            <button key={o.id} style={chip(sel)} aria-pressed={sel} onClick={() => pickDm(q, o.id)}>
                              <span style={letterStyle(sel)}>{sel ? '✓' : '·'}</span>
                              <span>{o.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )}

                {/* While pregnant: what the maternity team has advised
                    (../data/pregnancy.js, PREG_LIMITS). Optional; any tick
                    removes the exercise dose from the results. */}
                {isPregnant(answers) && (
                  <div style={{ ...qPanel, display: 'flex', flexDirection: 'column', gap: 9, marginTop: 18 }}>
                    <p style={{ ...qText, fontSize: 15, margin: '0 0 2px' }}>
                      <span aria-hidden="true" style={qMark} />
                      <span>{PREG_LIMITS.text}</span>
                    </p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: '0 0 6px', lineHeight: 1.6 }}>
                      This decides whether your results suggest how much exercise to do, or ask you to check with your maternity team first.
                    </p>
                    {arrangeOptions(PREG_LIMITS.options, PREG_LIMITS.text).map((o) => {
                      const sel = [].concat(answers.pregLimit || []).includes(o.id)
                      return (
                        <button key={o.id} style={chip(sel)} aria-pressed={sel} onClick={() => pickDm(PREG_LIMITS, o.id)}>
                          <span style={letterStyle(sel)}>{sel ? '✓' : '·'}</span>
                          <span>{o.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Osteogenesis imperfecta details (../data/oi.js): optional;
                    they choose what leads the results panel. */}
                {oiOn(answers) && (
                  <div style={{ ...qPanel, display: 'flex', flexDirection: 'column', gap: 9, marginTop: 18 }}>
                    <p style={{ ...qText, fontSize: 15, margin: '0 0 2px' }}>
                      <span aria-hidden="true" style={qMark} />
                      <span>A few details about your OI</span>
                    </p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: '0 0 6px', lineHeight: 1.6 }}>
                      These shape the advice in your results. Answer any you can; skip any you are not sure of.
                    </p>
                    {OI_DETAILS.map((q) => (
                      <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
                        <p style={{ fontSize: 14.5, color: '#fff', margin: 0, lineHeight: 1.5 }}>{q.text}</p>
                        {arrangeOptions(q.options, q.text).map((o) => {
                          const sel = answers[q.id] === o.id
                          return (
                            <button key={o.id} style={chip(sel)} aria-pressed={sel} onClick={() => pickDm(q, o.id)}>
                              <span style={letterStyle(sel)}>{sel ? '✓' : '·'}</span>
                              <span>{o.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )}

                {/* Cautions: they change how the first assessment is done,
                    they do not stop it. Kept visually separate so the screen
                    never reads as "more red flags". */}
                <div style={{ ...qPanel, display: 'flex', flexDirection: 'column', gap: 9, marginTop: 18 }}>
                <p style={{ ...qText, fontSize: 15, margin: '0 0 4px' }}>
                  <span aria-hidden="true" style={qMark} />
                  <span>Also worth telling us — these do not stop physiotherapy</span>
                </p>
                  {/* Grouped: 25 conditions on one screen, one tap from the
                      results, is a wall of text (Chandra, 6 Oct 2026). Each
                      group NAMES what it holds, so nothing is hidden, and a
                      group with anything ticked stays open. */}
                  {cautionRows(CAUTION_CHECKS.filter((f) => forPerson(f, who) && !(f.id === 'ca-preg' && answers.preg)))
                    .map((row) => {
                      const tickChip = (f) => {
                        const sel = flags.includes(f.id)
                        return (
                          <button key={f.id} style={chip(sel)} aria-pressed={sel}
                            onClick={() => setFlags((cur) => sel ? cur.filter((x) => x !== f.id) : [...cur, f.id])}>
                            <span style={letterStyle(sel)}>{sel ? '✓' : '·'}</span>
                            <span>{f.text}</span>
                          </button>
                        )
                      }
                      if (row.flag) return tickChip(row.flag)
                      const { group, members } = row
                      const n = tickedIn(group, flags)
                      const open = openCautions.includes(group.id) || n > 0
                      return (
                        <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                          <button style={chip(n > 0)} aria-expanded={open}
                            onClick={() => setOpenCautions((cur) => cur.includes(group.id) ? cur.filter((x) => x !== group.id) : [...cur, group.id])}>
                            <span style={letterStyle(n > 0)}>{open ? '▾' : '▸'}</span>
                            <span>
                              {group.title}
                              {n > 0 && <span style={{ color: GOLD, fontWeight: 600 }}> · {n} selected</span>}
                              <span style={{ display: 'block', fontSize: 13.5, color: 'rgba(255,255,255,0.55)', marginTop: 3, lineHeight: 1.5 }}>
                                {group.names}
                              </span>
                            </span>
                          </button>
                          {open && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, paddingLeft: 14, borderLeft: '1px solid rgba(201,169,110,0.25)' }}>
                              {members.map(tickChip)}
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>

                {/* Osteopenia ticked (../data/osteopenia.js): optional risk
                    questions. No number is ever calculated or shown; they
                    decide whether the results add "ask your doctor for a
                    full fracture-risk assessment". */}
                {osteopeniaOn(flags) && (
                  <div style={{ ...qPanel, display: 'flex', flexDirection: 'column', gap: 9, marginTop: 18 }}>
                    <p style={{ ...qText, fontSize: 15, margin: '0 0 2px' }}>
                      <span aria-hidden="true" style={qMark} />
                      <span>A few questions about your bones</span>
                    </p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: '0 0 6px', lineHeight: 1.6 }}>
                      Your scan number is only part of the picture. These help your results say whether a fuller check with your doctor is worth asking for. Answer any you can.
                    </p>
                    {BONE_DETAILS.map((q) => (
                      <div key={q.id} style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
                        <p style={{ fontSize: 14.5, color: '#fff', margin: 0, lineHeight: 1.5 }}>{q.text}</p>
                        {arrangeOptions(q.options, q.text).map((o) => {
                          const sel = [].concat(answers[q.id] || []).includes(o.id)
                          return (
                            <button key={o.id} style={chip(sel)} aria-pressed={sel} onClick={() => pickDm(q, o.id)}>
                              <span style={letterStyle(sel)}>{sel ? '✓' : '·'}</span>
                              <span>{o.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )}

                <div className="pa-actions" style={{ marginTop: 20 }}>
                  <button className="pa-primary" style={{ ...goldBtn, opacity: gateOpenEmpty(finalChecks) ? 0.45 : 1 }}
                    aria-disabled={gateOpenEmpty(finalChecks)}
                    onClick={() => {
                      if (gateOpenEmpty(finalChecks)) return
                      if (flaggedIn(finalChecks) || otherFlagged) routeUrgent('safety')
                      else setStage('ok')
                    }}>
                    {flaggedIn(finalChecks) || otherFlagged || pickedCautions.length || dmQuestions.some((q) => answers[q.id] !== undefined) || OI_DETAILS.some((q) => answers[q.id] !== undefined) || BONE_DETAILS.some((q) => answers[q.id] !== undefined) ? 'Continue' : 'None Apply — Continue'}
                  </button>
                  <button style={ghostBtn} onClick={() => setStage('review')}>Back</button>
                </div>
              </Fade>
            )}

            {/* INJURY SCREENS — neck (Canadian C-Spine Rule), shoulder and
                upper arm, one question at a time (../data/injuryScreen.js). The first answer that routes
                ends it: to emergency care, to a physician, or on to the results. */}
            {stage === 'injury' && (() => {
              const found = injuryQuestion(injuryQ, flowZ)
              if (!found) return null
              const { q, screen } = found
              const picked = (oid) => (q.multi ? Array.isArray(injuryDraft) && injuryDraft.includes(oid) : injuryDraft === oid)
              const ready = q.multi ? Array.isArray(injuryDraft) && injuryDraft.length > 0 : injuryDraft !== undefined
              return (
                <Fade k={`injury-${injuryQ}`}>
                  <div style={headBand('amber')}>
                    <span style={bandLabel('amber')}>{partLabel('physician')} · {screen.title}</span>
                  </div>
                  <div style={{ ...qPanel, display: 'flex', flexDirection: 'column', gap: 9 }}>
                  <h2 style={{ ...h2, fontSize: 'clamp(23px,5.4vw,32px)', margin: '0 0 8px', display: 'flex', gap: 12 }}>
                    <span aria-hidden="true" style={{ ...qMark, width: 5 }} />
                    <span>{q.text}</span>
                  </h2>
                    {arrangeOptions(q.options, q.text).map((o, i) => (
                      <button key={o.id} style={chip(picked(o.id))} onClick={() => tapInjury(q, o.id)}>
                        <span style={letterStyle(picked(o.id))}>{LETTERS[i] || '·'}</span>
                        <span>{o.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="pa-actions" style={{ marginTop: 20 }}>
                    <button className="pa-primary" style={{ ...goldBtn, opacity: ready ? 1 : 0.45, cursor: ready ? 'pointer' : 'not-allowed' }}
                      disabled={!ready} onClick={() => continueInjury()}>Continue</button>
                    <button style={ghostBtn} onClick={backInjury}>Back</button>
                  </div>
                </Fade>
              )
            })()}

            {/* URGENT-CARE RESULT */}
            {stage === 'urgent' && (
              <Fade k="urgent">
                <span style={label}>{emergencyCare === 'crisis' ? 'Support Is Available' : emergencyFlagged ? 'Emergency Care Needed' : 'Medical Review Recommended'}</span>

                {!emergencyFlagged && (pickedFlags.length > 0 || otherFlagged) && (
                  <div style={{ ...card, maxWidth: 520, margin: '12px 0 12px' }}>
                    <span style={{ ...label, fontSize: 11.5 }}>You selected</span>
                    <ul style={{ margin: '10px 0 0', paddingLeft: 20, fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,0.82)' }}>
                      {/* Plain questions: the signs ticked, in the patient's words. */}
                      {pickedFlags.flatMap((f) => (tickedText(f.id, flags).length ? tickedText(f.id, flags).map((t) => <li key={t}>{t}</li>) : [<li key={f.id}>{f.text}</li>]))}
                      {otherFlagged && <li>Other: {flagOther.trim()}</li>}
                    </ul>
                  </div>
                )}

                {/* Outcomes decided by the tier the clinician assigned to each
                    flag — never by the AI. Emergency, no booking offered:
                    call 911 for the flags marked call911, otherwise go to an
                    emergency department now (or labour and delivery).
                    Otherwise: see a physician first. */}
                {emergencyFlagged ? (
                  <div style={{ ...card, borderColor: 'rgba(239,68,68,0.6)', background: 'rgba(239,68,68,0.08)', maxWidth: 520 }}>
                    <strong style={{ color: '#fca5a5', fontSize: 19, lineHeight: 1.4 }}>{EMERGENCY_ADVICE[emergencyCare].title}</strong>
                    <p style={{ ...body, fontSize: 15.5, color: 'rgba(255,255,255,0.85)', margin: '12px 0 0' }}>
                      {EMERGENCY_ADVICE[emergencyCare].text}
                    </p>
                    {emergencyCare === 'call911' && pickedFlags.some((f) => f.keepNeckStill) && (
                      <p style={{ ...body, fontSize: 15.5, color: '#fff', fontWeight: 600, margin: '10px 0 0' }}>
                        {EMERGENCY_ADVICE.call911Neck}
                      </p>
                    )}
                    {emergencyCare !== 'call911' && (
                      <p style={{ ...body, fontSize: 15.5, color: '#fff', fontWeight: 600, margin: '10px 0 0' }}>
                        {EMERGENCY_ADVICE[emergencyCare].fallback}
                      </p>
                    )}
                    {/* Why, for each emergency answer: the reason from the
                        region document, next to what the person ticked. */}
                    <span style={{ ...label, display: 'block', margin: '18px 0 0', fontSize: 11.5, color: '#fca5a5' }}>{emergencyCare === 'crisis' ? 'Why we are suggesting this' : 'Why this needs emergency care'}</span>
                    <div style={{ display: 'grid', gap: 12, marginTop: 10 }}>
                      {pickedFlags.filter((f) => f.tier === 'emergency').map((f) => (
                        <div key={f.id}>
                          <p style={{ fontSize: 16, color: '#fff', margin: 0, lineHeight: 1.45, fontWeight: 600 }}>{f.why.title}</p>
                          <p style={{ ...body, fontSize: 14, margin: '4px 0 0', color: 'rgba(255,255,255,0.72)' }}>You told us: {tickedText(f.id, flags).length ? tickedText(f.id, flags).join('; ') : f.text}</p>
                        </div>
                      ))}
                    </div>
                    {(emergencyCare === 'call911' || emergencyCare === 'crisis') && (
                      <a href={`tel:${EMERGENCY_ADVICE[emergencyCare].tel || '911'}`} style={{ ...goldBtn, background: '#ef4444', color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', marginTop: 16 }}>
                        {EMERGENCY_ADVICE[emergencyCare].button}
                      </a>
                    )}
                  </div>
                ) : (
                  <div style={{ ...card, borderColor: 'rgba(245,158,11,0.55)', background: 'rgba(245,158,11,0.07)', maxWidth: 520 }}>
                    <strong style={{ color: '#fcd34d', fontSize: 19, lineHeight: 1.4 }}>
                      {sameDayFlagged ? 'Please See a Doctor Today' : 'Please See Your Doctor About This'}
                    </strong>
                    <p style={{ ...body, fontSize: 15.5, color: 'rgba(255,255,255,0.85)', margin: '12px 0 0' }}>
                      {sameDayFlagged
                        ? 'Something you ticked should be checked by a doctor today: your family doctor, a walk-in clinic, or an urgent care centre.'
                        : 'What you ticked should be checked by your doctor. Please book a visit with your family doctor, or a walk-in clinic if you do not have one.'}
                    </p>
                    <p style={{ ...body, fontSize: 15.5, color: 'rgba(255,255,255,0.85)', margin: '10px 0 0' }}>
                      {underFive
                        ? UNDER_FIVE
                        : PLAN_TEXT[physioWait]}
                    </p>
                    <p style={{ ...body, fontSize: 15.5, color: 'rgba(255,255,255,0.85)', margin: '10px 0 0' }}>
                      <strong style={{ color: '#fff' }}>If your symptoms are severe or getting worse quickly, call 911.</strong>
                    </p>
                  </div>
                )}

                {/* Plain questions: the patient's own words for the doctor or 911. */}
                {lbProto && tellLine && (
                  <div style={{ ...card, maxWidth: 520, margin: '12px 0 0' }}>
                    <span style={{ ...label, fontSize: 11.5 }}>Tell them</span>
                    <p style={{ fontSize: 16, color: '#fff', margin: '8px 0 0', lineHeight: 1.5 }}>“{tellLine}”</p>
                  </div>
                )}

                {!emergencyFlagged && pickedFlags.length > 0 && (
                  <>
                    <span style={{ ...label, display: 'block', margin: '22px 0 0' }}>Why a doctor should check this</span>
                    <div style={{ marginTop: 12 }}>
                      {pickedFlags.map((f) => (
                        <div key={f.id} style={{ ...card, maxWidth: 520, marginBottom: 10 }}>
                          {f.sameDay && (
                            <span style={{ ...label, display: 'block', fontSize: 11, color: '#fcd34d', marginBottom: 6 }}>See a doctor today</span>
                          )}
                          <p style={{ fontSize: 16, color: GOLD_LIGHT, margin: 0, lineHeight: 1.45, fontWeight: 500 }}>{f.why.title}</p>
                          <p style={{ ...body, fontSize: 14.5, margin: '7px 0 0' }}>{f.why.text}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', margin: '16px 0 0', maxWidth: 520 }}>
                  This is a precautionary screening question, not a diagnosis. It does not
                  confirm that anything serious is present. If you selected an option in error,
                  please use Back to amend your answer.
                </p>

                {/* Physiotherapy can follow once a physician has reviewed the
                    flagged symptom — but never for an emergency-tier flag. */}
                {!emergencyFlagged && !holdBooking && !underFive && (
                  <>
                    <span style={{ ...label, display: 'block', margin: '26px 0 0' }}>Booking With Chandra</span>
                    <p style={{ ...body, fontSize: 15, margin: '10px 0 14px', maxWidth: 520 }}>
                      {sameDayFlagged
                        ? 'Your doctor\'s visit today comes first. If you would like, you can also choose a clinic now to book your physio visit, or carry on to finish the questions.'
                        : 'If you would like, choose a clinic now to book your physio visit, or carry on to finish the questions and see what your answers may be linked with.'}
                    </p>
                    <ClinicPicker picked={clinicId} onPick={setClinicId} />
                  </>
                )}

                <div className="pa-actions" style={{ marginTop: 20 }}>
                  <button className="pa-primary" style={goldBtn} onClick={() => {
                    if (flaggedAt !== 'injury' || !injuryOutcome) { setStage(flaggedAt || 'safety'); return }
                    // Back to the injury question that routed here.
                    const last = injuryPath[injuryPath.length - 1]
                    setInjuryDraft(answers[last])
                    setAnswers((a) => withoutInjury(a, injuryPath.slice(0, -1)))
                    setInjuryPath(injuryPath.slice(0, -1)); setInjuryQ(last); setStage('injury')
                  }}>Back</button>
                  {!emergencyFlagged && (
                    <button style={ghostBtn} onClick={continueAfterDoctor}>
                      {flaggedAt === 'safety' ? 'See My Results' : 'Finish the Questions'}
                    </button>
                  )}
                  <button style={ghostBtn} onClick={restart}>Start Over</button>
                </div>
              </Fade>
            )}

            {/* NON-URGENT RESULT */}
            {stage === 'ok' && (
              <Fade k="ok">
                <div style={headBand()}>
                <span style={label}>Your Results · General Education</span>
                <h2 style={{ ...h2, fontSize: 'clamp(28px,6.4vw,40px)', margin: '14px 0 0' }}>
                  What your answers <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>can be associated with</em>
                </h2>
                </div>
                <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.7)', margin: '0 0 14px', maxWidth: 520 }}>
                  Reference code: <strong style={{ color: '#fff', letterSpacing: '0.05em' }}>{visitCode || '…'}</strong>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}> · save your results at the end of this page</span>
                </p>

                {/* Not-a-diagnosis notice, first on the results (CHCPBC Practice
                    Standards: not a diagnosis, general information, no outcome
                    guaranteed). It was a pop-up that had to be dismissed first. */}
                <div style={{ ...card, maxWidth: 520, marginBottom: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" aria-hidden="true" style={{ flex: 'none', marginTop: 2 }}>
                    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <p style={{ ...body, fontSize: 14.5, margin: 0 }}>
                    <strong style={{ color: '#fff' }}>This is not a confirmed diagnosis.</strong> It is a
                    general suggestion based only on your answers. It cannot examine you, review your
                    medical history, or determine the cause of your symptoms; only an individual
                    assessment by a physiotherapist or physician can do that. Every person is different,
                    and no particular result or outcome is implied or guaranteed.
                  </p>
                </div>

                {/* The see-a-doctor advice from the safety questions stays at
                    the top of the results. */}
                {doctorFlagged && (
                  <div style={{ ...card, borderColor: 'rgba(245,158,11,0.55)', background: 'rgba(245,158,11,0.07)', maxWidth: 520, marginBottom: 14 }}>
                    <strong style={{ color: '#fcd34d', fontSize: 17, lineHeight: 1.4 }}>
                      {sameDayFlagged ? 'Remember: please see a doctor today' : 'Remember: please see your doctor'}
                    </strong>
                    <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 14.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.82)' }}>
                      {doctorFlags.map((f) => <li key={f.id}>{f.why && f.why.title ? f.why.title : f.text}</li>)}
                      {otherFlagged && <li>Other: {flagOther.trim()}</li>}
                    </ul>
                    {!holdBooking && !underFive && (
                      <p style={{ ...body, fontSize: 14, margin: '8px 0 0', color: 'rgba(255,255,255,0.85)' }}>{PLAN_TEXT[physioWait]}</p>
                    )}
                    <p style={{ ...body, fontSize: 14, margin: '8px 0 0' }}>
                      The information below is general education and does not replace that check.
                    </p>
                  </div>
                )}

                {/* THE POSSIBLE REASONS COME FIRST. Matched from the answers by
                    the scoring engine — a condition only appears once it scores
                    >= 3 and >= 40% of its maximum, so a weak match stays hidden
                    rather than padding the list. The answer recap was removed
                    from this screen; answers can still be checked and changed
                    on the Review screen before this point. */}
                {/* Referral pattern — a spine-to-limb line read as one problem.
                    Comes first because it explains why the conditions below
                    are about the neck or back rather than the arm or leg. */}
                {referral.map((r, i) => {
                  const s = referralSummary(r, referralMechanism(r, answers), setAsideAreas(zones, referral))
                  return (
                    <div key={i} style={{ ...card, maxWidth: 520, marginBottom: 14 }}>
                      <span style={{ ...label, fontSize: 11.5 }}>Your drawing shows a referral pattern</span>
                      <p style={{ fontSize: 17, color: GOLD_LIGHT, margin: '8px 0 0', lineHeight: 1.4, fontWeight: 500 }}>{s.title}</p>
                      <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>{s.text}</p>
                      <Bullets title="Also to be checked at your assessment" items={s.ruleOut} />
                    </div>
                  )
                })}

                {specials.map((s) => (
                  <div key={s} style={{ ...card, maxWidth: 520, marginBottom: 14 }}>
                    <p style={{ fontSize: 17, color: GOLD_LIGHT, margin: 0, lineHeight: 1.4, fontWeight: 500 }}>{SPECIAL_CARDS[s].title}</p>
                    <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }} dangerouslySetInnerHTML={{ __html: SPECIAL_CARDS[s].body }} />
                  </div>
                ))}

                {/* Raised by the reasoning pass, not by the red-flag rules: a
                    picture worth a medical opinion as well. Booking stays
                    available — only the rules can withhold it. */}
                {review && review.concern && (
                  <div style={{ ...card, borderColor: 'rgba(245,158,11,0.55)', background: 'rgba(245,158,11,0.07)', maxWidth: 520, marginBottom: 14 }}>
                    <p style={{ fontSize: 16, color: '#fcd34d', margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
                      Worth mentioning to your physician as well
                    </p>
                    <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>{review.concern.why}</p>
                    <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>
                      This is not a finding about you, and it does not mean anything serious is
                      present — it means the pattern you described is worth a medical opinion
                      alongside your physiotherapy assessment.
                    </p>
                  </div>
                )}

                {shown.length > 0 ? (
                  <div style={{ marginBottom: 24 }}>
                    {shown.map(({ c, rk }) => (
                      <div key={`${rk}/${c.id}`} style={{ ...card, maxWidth: 520, marginBottom: 10 }}>
                        {multiArea && (
                          <span style={{ ...label, fontSize: 15, display: 'block', marginBottom: 8 }}>{REGIONS[rk].name}</span>
                        )}
                        {/* The condition name stands out (Chandra, 2 Oct 2026):
                            larger, bold, on a gold band. A tint with an accent
                            bar, not solid gold, so it does not read as a button. */}
                        <p style={{ fontSize: 'clamp(19px,4.6vw,22px)', color: '#fff', margin: 0, lineHeight: 1.35, fontWeight: 700,
                          background: 'rgba(201,169,110,0.22)', borderLeft: `4px solid ${GOLD}`, borderRadius: 8, padding: '10px 14px' }}>{c.name}</p>
                        {/* A refer-first condition (cervical myelopathy): its
                            see-your-doctor note comes before anything else. */}
                        {c.doctorFirst && (
                          <p style={{ fontSize: 14.5, lineHeight: 1.55, color: '#fcd34d', margin: '10px 0 0', padding: '10px 12px', border: '1px solid rgba(245,158,11,0.55)', background: 'rgba(245,158,11,0.07)', borderRadius: 10 }}>
                            {c.doctorFirst}
                          </p>
                        )}
                        <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>{c.blurb}</p>
                        <Bullets title="What people often notice" items={c.noticed} />
                        <Bullets title="What often helps" items={c.homeCare} />
                        <Bullets title="See a physiotherapist if" items={c.seePhysioIf} />
                      </div>
                    ))}
                    <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', margin: '12px 0 0', maxWidth: 520 }}>
                      These patterns can be associated with answers like yours. They are general
                      education, not findings about you — only an individual, hands-on assessment
                      can establish what is actually going on.
                    </p>
                  </div>
                ) : (
                  /* No condition matched. This used to show a fixed list — the
                     first entries of each area's list, the same for everyone
                     whatever they answered — which read as a result but wasn't
                     one. Saying so plainly is the accurate answer. */
                  <div style={{ ...card, maxWidth: 520, marginBottom: 24 }}>
                    <p style={{ fontSize: 16, color: GOLD_LIGHT, margin: 0, lineHeight: 1.45, fontWeight: 500 }}>
                      {keys.length ? 'No clear match in this guide' : 'This area is not covered in detail yet'}
                    </p>
                    <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>
                      {keys.length
                        ? 'Your answers did not clearly match one of the patterns this guide describes for the area you marked. That is common — pain often does not fit a textbook pattern — and it is exactly what an in-person assessment is for.'
                        : 'This guide does not yet have a detailed set of patterns for the area you marked, so it cannot match your answers to a specific one. An in-person assessment is the right next step.'}
                    </p>
                  </div>
                )}

                {/* Also worth considering (Chandra, 4 Oct 2026): names only, below
                    the main results, so a near match is not lost. */}
                {alsoConsider.length > 0 && (
                  <div className="pa-also" style={{ maxWidth: 520, margin: '0 0 24px' }}>
                    <p style={{ ...label, fontSize: 12.5, margin: '0 0 8px' }}>{shown.length ? 'Also worth considering' : 'Worth considering'}</p>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 15.5, lineHeight: 1.6, color: '#fff' }}>
                      {alsoConsider.map(({ c, rk }) => (
                        <li key={`${rk}/${c.id}`} style={{ marginBottom: 2 }}>
                          {c.name}{multiArea ? <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13.5 }}> · {REGIONS[rk].name}</span> : null}
                        </li>
                      ))}
                    </ul>
                    <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', margin: '8px 0 0' }}>
                      {shown.length
                        ? 'These match some of your answers, but less closely than the patterns above. Your physiotherapist can check them at your assessment.'
                        : 'These match some of your answers, though not closely enough to describe in detail. Your physiotherapist can check them at your assessment.'}
                    </p>
                  </div>
                )}

                {/* One bone, young or 65 and over: the watch line, with or
                    without a match ("Osteosarcoma" document, ../data/boneTumour.js). */}
                {boneWatch(zones, answers) && (
                  <p style={{ fontSize: 14.5, lineHeight: 1.55, color: '#fcd34d', margin: '0 0 24px', padding: '10px 12px', border: '1px solid rgba(245,158,11,0.55)', background: 'rgba(245,158,11,0.07)', borderRadius: 10, maxWidth: 520 }}>
                    {BONE_WATCH}
                  </p>
                )}

                {/* The cauda equina warning-signs card: shown on every low
                    back, pelvis or leg-referral result, whatever the result
                    was, because these signs can begin after the person has
                    read their results ("CaudaEquina.docx", signed 5 Oct 2026;
                    GIRFT 2023 asks that every back-pain patient be given it). */}
                {cesWarning(zones, keys) && (
                  <div style={{ maxWidth: 520, margin: '0 0 24px', padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(239,68,68,0.5)', background: 'rgba(239,68,68,0.07)' }}>
                    <p style={{ fontSize: 15.5, color: '#fca5a5', margin: 0, fontWeight: 600, lineHeight: 1.4 }}>{CES_WARNING.title}</p>
                    <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 14.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.85)' }}>
                      {CES_WARNING.signs.map((s, i) => <li key={i} style={{ marginBottom: 4 }}>{s}</li>)}
                    </ul>
                    <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.6)', margin: '10px 0 0' }}>{CES_WARNING.text}</p>
                  </div>
                )}

                {/* AI overview of the whole traced path. It is given the matched
                    conditions above and explains exactly those, in the same
                    order, so the page gives one answer rather than two lists
                    that could disagree. */}
                {/* Cautions the person ticked: physiotherapy goes ahead, and
                    these shape how the first assessment is done. */}
                {pickedCautions.length > 0 && (
                  <>
                    <span style={{ ...label, marginBottom: 12 }}>What we will take into account</span>
                    <div style={{ ...card, maxWidth: 520, margin: '12px 0 26px' }}>
                      {pickedCautions.map((f) => (
                        <div key={f.id} style={{ marginBottom: 10 }}>
                          <p style={{ fontSize: 15.5, color: GOLD_LIGHT, margin: 0, lineHeight: 1.45 }}>{f.text}</p>
                          <p style={{ ...body, fontSize: 14, margin: '4px 0 0' }}>{f.why.text}</p>
                        </div>
                      ))}
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '6px 0 0', lineHeight: 1.6 }}>
                        Please mention these when you book, so your first appointment can be planned around them.
                      </p>
                    </div>
                  </>
                )}

                {/* Pregnancy or the year after (../data/pregnancy.js). */}
                {pgPanel && (
                  <>
                    <span style={{ ...label, marginBottom: 12 }}>{isPregnant(answers) ? 'Your pregnancy and this problem' : 'After your baby'}</span>
                    <div style={{ ...card, maxWidth: 520, margin: '12px 0 26px' }}>
                      <p style={{ fontSize: 17, color: GOLD_LIGHT, margin: 0, lineHeight: 1.4, fontWeight: 500 }}>{pgPanel.title}</p>
                      <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>{pgPanel.text}</p>
                      <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)' }}>
                        {pgPanel.notes.map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
                      </ul>
                    </div>
                  </>
                )}

                {/* Diabetes and this problem (../data/diabetes.js): the panel
                    for the leading diabetes-linked condition, its tier's
                    prognosis line and safety notes; or, without known
                    diabetes, a gentle "worth asking for a blood test". */}
                {dmPanel && (
                  <>
                    <span style={{ ...label, marginBottom: 12 }}>{answers.dm === 'yes' || answers.dm === 'pre' ? 'Your diabetes and this problem' : 'Worth knowing'}</span>
                    <div style={{ ...card, maxWidth: 520, margin: '12px 0 26px' }}>
                      <p style={{ fontSize: 17, color: GOLD_LIGHT, margin: 0, lineHeight: 1.4, fontWeight: 500 }}>{dmPanel.title}</p>
                      <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>{dmPanel.text}</p>
                      {dmPanel.notes.length > 0 && (
                        <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)' }}>
                          {dmPanel.notes.map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
                        </ul>
                      )}
                    </div>
                  </>
                )}

                {/* Osteogenesis imperfecta (../data/oi.js). */}
                {oiP && (
                  <>
                    <span style={{ ...label, marginBottom: 12 }}>Living and moving with OI</span>
                    <div style={{ ...card, maxWidth: 520, margin: '12px 0 26px' }}>
                      <p style={{ fontSize: 17, color: GOLD_LIGHT, margin: 0, lineHeight: 1.4, fontWeight: 500 }}>{oiP.title}</p>
                      <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>{oiP.text}</p>
                      <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)' }}>
                        {oiP.notes.map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
                      </ul>
                    </div>
                  </>
                )}

                {/* Steroid medicine or diagnosed Cushing's (../data/steroids.js). */}
                {stPanel && (
                  <>
                    <span style={{ ...label, marginBottom: 12 }}>Your muscles and bones</span>
                    <div style={{ ...card, maxWidth: 520, margin: '12px 0 26px' }}>
                      <p style={{ fontSize: 17, color: GOLD_LIGHT, margin: 0, lineHeight: 1.4, fontWeight: 500 }}>{stPanel.title}</p>
                      <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>{stPanel.text}</p>
                      <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)' }}>
                        {stPanel.notes.map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
                      </ul>
                    </div>
                  </>
                )}

                {/* Diagnosed calcium or parathyroid problem (../data/parathyroid.js). */}
                {caPanel && (
                  <>
                    <span style={{ ...label, marginBottom: 12 }}>Your bones and calcium balance</span>
                    <div style={{ ...card, maxWidth: 520, margin: '12px 0 26px' }}>
                      <p style={{ fontSize: 17, color: GOLD_LIGHT, margin: 0, lineHeight: 1.4, fontWeight: 500 }}>{caPanel.title}</p>
                      <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>{caPanel.text}</p>
                      <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)' }}>
                        {caPanel.notes.map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
                      </ul>
                    </div>
                  </>
                )}

                {/* A pars stress injury, already diagnosed and cleared for
                    rehabilitation (../data/spondylolysis.js). */}
                {spondyPanel && (
                  <>
                    <span style={{ ...label, marginBottom: 12 }}>Your back and your sport</span>
                    <div style={{ ...card, maxWidth: 520, margin: '12px 0 26px' }}>
                      <p style={{ fontSize: 17, color: GOLD_LIGHT, margin: 0, lineHeight: 1.4, fontWeight: 500 }}>{spondyPanel.title}</p>
                      <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>{spondyPanel.text}</p>
                      <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)' }}>
                        {spondyPanel.notes.map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
                      </ul>
                    </div>
                  </>
                )}

                {/* Paget's disease of bone, diagnosed (../data/paget.js). */}
                {pgtPanel && (
                  <>
                    <span style={{ ...label, marginBottom: 12 }}>Your bones and joints</span>
                    <div style={{ ...card, maxWidth: 520, margin: '12px 0 26px' }}>
                      <p style={{ fontSize: 17, color: GOLD_LIGHT, margin: 0, lineHeight: 1.4, fontWeight: 500 }}>{pgtPanel.title}</p>
                      <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>{pgtPanel.text}</p>
                      <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)' }}>
                        {pgtPanel.notes.map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
                      </ul>
                    </div>
                  </>
                )}

                {/* A bone tumour, treated (../data/boneTumour.js). */}
                {btPanel && (
                  <>
                    <span style={{ ...label, marginBottom: 12 }}>Your recovery</span>
                    <div style={{ ...card, maxWidth: 520, margin: '12px 0 26px' }}>
                      <p style={{ fontSize: 17, color: GOLD_LIGHT, margin: 0, lineHeight: 1.4, fontWeight: 500 }}>{btPanel.title}</p>
                      <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>{btPanel.text}</p>
                      <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)' }}>
                        {btPanel.notes.map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
                      </ul>
                    </div>
                  </>
                )}

                {/* Osteopenia (../data/osteopenia.js). */}
                {bnPanel && (
                  <>
                    <span style={{ ...label, marginBottom: 12 }}>Your bones and exercise</span>
                    <div style={{ ...card, maxWidth: 520, margin: '12px 0 26px' }}>
                      <p style={{ fontSize: 17, color: GOLD_LIGHT, margin: 0, lineHeight: 1.4, fontWeight: 500 }}>{bnPanel.title}</p>
                      <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>{bnPanel.text}</p>
                      <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)' }}>
                        {bnPanel.notes.map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
                      </ul>
                    </div>
                  </>
                )}

                {/* Diagnosed osteomalacia or rickets (../data/osteomalacia.js). */}
                {omPanel && (
                  <>
                    <span style={{ ...label, marginBottom: 12 }}>Your bones and muscles</span>
                    <div style={{ ...card, maxWidth: 520, margin: '12px 0 26px' }}>
                      <p style={{ fontSize: 17, color: GOLD_LIGHT, margin: 0, lineHeight: 1.4, fontWeight: 500 }}>{omPanel.title}</p>
                      <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>{omPanel.text}</p>
                      <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)' }}>
                        {omPanel.notes.map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
                      </ul>
                    </div>
                  </>
                )}

                {/* Diagnosed overactive thyroid (../data/thyroid.js). */}
                {thPanel && (
                  <>
                    <span style={{ ...label, marginBottom: 12 }}>Your thyroid and exercise</span>
                    <div style={{ ...card, maxWidth: 520, margin: '12px 0 26px' }}>
                      <p style={{ fontSize: 17, color: GOLD_LIGHT, margin: 0, lineHeight: 1.4, fontWeight: 500 }}>{thPanel.title}</p>
                      <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>{thPanel.text}</p>
                      <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)' }}>
                        {thPanel.notes.map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
                      </ul>
                    </div>
                  </>
                )}

                {/* Diagnosed underactive thyroid (../data/thyroid.js). */}
                {hypoPanel && (
                  <>
                    <span style={{ ...label, marginBottom: 12 }}>Your thyroid and recovery</span>
                    <div style={{ ...card, maxWidth: 520, margin: '12px 0 26px' }}>
                      <p style={{ fontSize: 17, color: GOLD_LIGHT, margin: 0, lineHeight: 1.4, fontWeight: 500 }}>{hypoPanel.title}</p>
                      <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>{hypoPanel.text}</p>
                      <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)' }}>
                        {hypoPanel.notes.map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
                      </ul>
                    </div>
                  </>
                )}

                {/* Diagnosed acromegaly (../data/acromegaly.js). */}
                {acroPanel && (
                  <>
                    <span style={{ ...label, marginBottom: 12 }}>Your joints, spine and hands</span>
                    <div style={{ ...card, maxWidth: 520, margin: '12px 0 26px' }}>
                      <p style={{ fontSize: 17, color: GOLD_LIGHT, margin: 0, lineHeight: 1.4, fontWeight: 500 }}>{acroPanel.title}</p>
                      <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>{acroPanel.text}</p>
                      <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)' }}>
                        {acroPanel.notes.map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
                      </ul>
                    </div>
                  </>
                )}

                {/* Pain type (mechanism) — fixed rules in ../data/painType.js.
                    Shown only when the answers clearly point somewhere. */}
                {painType && (
                  <>
                    <span style={{ ...label, marginBottom: 12 }}>Likely pain type</span>
                    <div style={{ ...card, maxWidth: 520, margin: '12px 0 26px' }}>
                      {[painType.primary, painType.secondary].filter(Boolean).map((t, i) => (
                        <div key={t} style={i ? { marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(201,169,110,0.2)' } : null}>
                          <p style={{ fontSize: 17, color: GOLD_LIGHT, margin: 0, lineHeight: 1.4, fontWeight: 500 }}>
                            {i ? 'Also some features of: ' : ''}{PAIN_TYPES[t].title}
                            {!i && t === 'nociceptive' && painType.subtype && (
                              <span style={{ fontSize: 15, color: GOLD_LIGHT, fontWeight: 400 }}>, {NOCICEPTIVE_SUBTYPES[painType.subtype].label}</span>
                            )}
                            <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}> ({PAIN_TYPES[t].term})</span>
                          </p>
                          {!i && t === 'nociceptive' && painType.subtype && (
                            <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>{NOCICEPTIVE_SUBTYPES[painType.subtype].text}</p>
                          )}
                          {painType.reasons[t].length > 0 && (
                            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', margin: '6px 0 0', lineHeight: 1.6 }}>
                              Because {painType.reasons[t].join(', ')}.
                            </p>
                          )}
                          <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>{PAIN_TYPES[t].text}</p>
                        </div>
                      ))}
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '14px 0 0', lineHeight: 1.6 }}>
                        Pain often has more than one of these features. Your physiotherapist
                        will confirm this at your assessment.
                      </p>
                    </div>
                  </>
                )}

                {/* Persistent widespread pain ("Fibromyalgia" document, signed
                    2 Oct 2026; ../data/widespreadPain.js): the full explainer
                    belongs here and only here. */}
                {showWidespread && (
                  <>
                    <span style={{ ...label, marginBottom: 12 }}>Understanding Your Pain</span>
                    <div style={{ ...card, maxWidth: 520, margin: '12px 0 26px' }}>
                      <p style={{ fontSize: 17, color: GOLD_LIGHT, margin: 0, lineHeight: 1.4, fontWeight: 500 }}>{WIDESPREAD.title}</p>
                      <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>{WIDESPREAD.what}</p>
                      <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>{WIDESPREAD.alarm}</p>
                      <p style={{ ...body, fontSize: 14.5, margin: '8px 0 0' }}>{WIDESPREAD.reassure}</p>
                      <ul style={{ margin: '10px 0 0', paddingLeft: 18, fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)' }}>
                        {WIDESPREAD.selfCare.map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
                      </ul>
                      <p style={{ ...body, fontSize: 14.5, margin: '10px 0 0' }}>{WIDESPREAD.physio}</p>
                      {!fibroDiagnosed && (
                        <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', margin: '10px 0 0', lineHeight: 1.6 }}>{WIDESPREAD.doctor}</p>
                      )}
                    </div>
                  </>
                )}

                {/* How the pain behaves: severity, irritability, 24-hour
                    pattern and easing, read by fixed rules — not the AI. */}
                {behaviour.notes.length > 0 && (
                  <>
                    <span style={{ ...label, marginBottom: 12 }}>How your pain behaves</span>
                    <div style={{ ...card, maxWidth: 520, margin: '12px 0 26px' }}>
                      {behaviour.irritability && (
                        <p style={{ fontSize: 16, color: GOLD_LIGHT, margin: '0 0 8px', lineHeight: 1.45, fontWeight: 500 }}>
                          {{ mild: 'Settles quickly', moderate: 'Moderately irritable', severe: 'Easily flared' }[behaviour.irritability]}
                        </p>
                      )}
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)' }}>
                        {behaviour.notes.map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
                      </ul>
                    </div>
                  </>
                )}

                {/* Yellow flags — supportive notes only; no score or label is
                    shown, and nothing here changes whether booking is offered. */}
                {psych.notes.length > 0 && (
                  <>
                    <span style={{ ...label, marginBottom: 12 }}>How it is affecting you</span>
                    <div style={{ ...card, maxWidth: 520, margin: '12px 0 26px' }}>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.78)' }}>
                        {psych.notes.map((t, i) => <li key={i} style={{ marginBottom: 5 }}>{t}</li>)}
                      </ul>
                      {psych.moodSupport && (
                        <p style={{ ...body, fontSize: 14.5, margin: '12px 0 0', paddingTop: 12, borderTop: '1px solid rgba(201,169,110,0.2)' }}>
                          You mentioned feeling low, worried or stressed. Your family physician is a
                          good person to talk to about this as well. If you are ever in crisis or
                          thinking about harming yourself, call or text <a href="tel:988" style={{ color: GOLD_LIGHT }}>9-8-8</a> any
                          time, or call 911 in an emergency.
                        </p>
                      )}
                    </div>
                  </>
                )}

                <span style={{ ...label, marginBottom: 12 }}>AI Overview · Optional</span>
                <div style={{ maxWidth: 520, margin: '12px 0 26px' }}>
                  <PainAIPanel zones={zones} answers={aiAnswers.core} privateAnswers={aiAnswers.wellbeing} notes={notesText} matched={matched} onReview={setReview} aiOnly />
                </div>

                {underFive && !holdBooking ? (
                  <>
                    <span style={{ ...label, marginBottom: 12 }}>Your Next Step · A Children's Physiotherapist</span>
                    <p style={{ ...body, margin: '12px 0 18px', maxWidth: 520 }}>{UNDER_FIVE}</p>
                  </>
                ) : holdBooking ? (
                  /* A recent head injury no doctor has seen ("Concussion"
                     document, 2 Oct 2026): education only, no booking yet. */
                  <>
                    <span style={{ ...label, marginBottom: 12 }}>Your Next Step · See a Doctor First</span>
                    <p style={{ ...body, margin: '12px 0 18px', maxWidth: 520 }}>
                      {holdToday
                        ? 'Please see a doctor or nurse practitioner today: your family doctor, a walk-in clinic or an urgent care centre, or call HealthLink BC on 8-1-1 if you are not sure where to go. Once they have checked you, you are welcome to book with Chandra, and physiotherapy can be part of your recovery.'
                        : 'Please see your family doctor in the next few days, or a walk-in clinic if you do not have one; HealthLink BC on 8-1-1 can help if you are not sure where to go. Once the cause is known, you are welcome to book with Chandra, and physiotherapy can be part of your recovery.'}
                    </p>
                  </>
                ) : (
                  <>
                    <span style={{ ...label, marginBottom: 12 }}>Your Next Step · Book an Assessment</span>
                    <p style={{ ...body, margin: '12px 0 18px', maxWidth: 520 }}>
                      {doctorFlagged
                        ? `${PLAN_TEXT[physioWait]} Choose the clinic that suits you, then call or book online.`
                        : 'Based on what you have shared, a physiotherapy assessment is a reasonable next step. At your first visit, Chandra goes through your answers with you, checks how you move, explains in plain words what is likely going on, and agrees a plan with you, including what you can do at home. Bring your reference code or PDF so the visit starts from your answers. Choose the clinic that suits you, then call or book online; the clinic can tell you about fees and direct billing.'}
                    </p>

                    <ClinicPicker picked={clinicId} onPick={setClinicId} />
                  </>
                )}

                {/* Everything the screen worked out, in the order of the CPA
                    Orthopaedic Division subjective booklet — for Chandra, and
                    built on the device from the answers already given. */}
                <ClinicianSummary text={visitCode ? `Reference code: ${visitCode}\n\n${summaryText}` : summaryText}
                  clinic={CLINICS.find((c) => c.id === clinicId) || null} code={visitCode || ''} />

                <span style={{ ...label, margin: '30px 0 12px' }}>Keep Your Results</span>
                <SaveResults code={visitCode} pdfData={pdfData} anonPayload={anonPayload} />

                {/* Anonymous feedback, for everyone who reaches the results
                    (Chandra, 2 Oct 2026). Only if ticked separately: the areas
                    drawn and the conditions shown, no answers. */}
                <FeedbackForm context={() => ({
                  areas: [...new Set(zones.map((z) => z.type))],
                  results: shown.map(({ c, rk }) => ({ region: rk, id: c.id })),
                })} />

                <div className="pa-actions" style={{ marginTop: 22 }}>
                  <button style={ghostBtn} onClick={restart}>Start Over</button>
                </div>
                <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', margin: '20px 0 0', maxWidth: 520 }}>
                  The information above is general in nature and is not a diagnosis. Individual
                  results vary and no particular outcome is implied or guaranteed. If your
                  symptoms change or worsen, please seek advice from a health professional.
                </p>
              </Fade>
            )}
          </AnimatePresence>

        </div>

        {/* ── RIGHT: the 3D model (shrinks after confirm, marks persist) ──
            Not on the landing page: it appears once Start is pressed. */}
        {stage !== 'landing' && stage !== 'guide' && (
        <motion.div layout transition={{ duration: 0.55, ease: EASE }}
          className={'pa-model' + (modelSmall ? ' small' : '')}>
          <div className="pa-model-stage" onPointerDown={() => setHasTurned(true)}>
            {swipeHint && (
              <div className="pa-swipe" aria-hidden="true">
                <span className="pa-swipe__track">
                  <span className="pa-swipe__chev">‹</span>
                  <span className="pa-swipe__dot" />
                  <span className="pa-swipe__chev">›</span>
                </span>
                {isPhone ? 'Swipe to turn' : 'Drag to turn'}
              </div>
            )}
            {/* Draw step controls on the body: Turn / Draw beside the head,
                Undo / Redo beside the legs. Drawing and rotating cannot share
                the same drag, so the person chooses which one a drag does. */}
            {stage === 'draw' && (
              <div className="pa-onbody">
                <button className={'pa-ob pa-ob-turn' + (drawMode === 'turn' ? ' on' : '')}
                  aria-pressed={drawMode === 'turn'} onClick={() => setDrawMode('turn')}>Turn</button>
                <button className={'pa-ob pa-ob-draw' + (drawMode === 'draw' ? ' on' : '')}
                  aria-pressed={drawMode === 'draw'} onClick={() => setDrawMode('draw')}>Draw</button>
                {/* Under Draw: rubbing over a line removes that whole line
                    (Chandra, 7 Oct 2026). Undo brings it back. */}
                <button className={'pa-ob pa-ob-erase' + (drawMode === 'erase' ? ' on' : '')}
                  aria-pressed={drawMode === 'erase'} disabled={!history.lines && drawMode !== 'erase'}
                  onClick={() => setDrawMode('erase')} aria-label="Eraser: rub over a line to remove it">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4l10-10a1 1 0 0 1 1.4 0l5.6 5.6a1 1 0 0 1 0 1.4L11 21" /><path d="M22 21H7" /><path d="m5 11 9 9" />
                  </svg>
                  Erase
                </button>
                <button className="pa-ob pa-ob-undo" disabled={!history.canUndo}
                  onClick={() => setUndoSignal((n) => n + 1)} aria-label="Undo the last line">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" />
                  </svg>
                  Undo
                </button>
                <button className="pa-ob pa-ob-redo" disabled={!history.canRedo}
                  onClick={() => setRedoSignal((n) => n + 1)} aria-label="Redo the last undone line">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m15 14 5-5-5-5" /><path d="M20 9H10a6 6 0 0 0 0 12h3" />
                  </svg>
                  Redo
                </button>
              </div>
            )}
            <Body3D
              onSelectionChange={setZones}
              onLinesChange={setLines}
              showGestureHint={!swipeHint}
              controlled
              drawOn={drawOn}
              eraseOn={eraseOn}
              clearSignal={clearSignal}
              undoSignal={undoSignal}
              redoSignal={redoSignal}
              recentreSignal={recentre}
              onHistoryChange={setHistory}
              apiRef={bodyApi}
            />
          </div>
          {modelSmall && zones.length > 0 && (
            <p className="pa-model-caption">Your selected pain areas</p>
          )}
        </motion.div>
        )}
      </div>
    </section>
  )
}
