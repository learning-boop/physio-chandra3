import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Body3D from './Body3D'
import PainAIPanel from './PainAIPanel'
import ClinicPicker from './ClinicPicker'
import ClinicianSummary from './ClinicianSummary'
import { buildClinicianSummary, MAX_HYPOTHESES } from '../data/clinicianSummary'
import { REGIONS, ZONE_TO_REGION, GENERAL_RED_FLAGS, SPECIAL_CARDS } from '../data/symptomGuide'
import {
  primaryRegion, questionRegions, needsAreaChoice,
  buildScreens, nextQuestion, rankAcross, specialsAcross, regionRedFlags, MAX_SCORED_QUESTIONS,
} from '../data/assessmentFlow'
import { behaviourQuestions, interpretBehaviour } from '../data/painBehaviour'
import { PSYCHOSOCIAL_QUESTIONS, interpretPsychosocial } from '../data/psychosocial'
import { PAIN_QUALITY, PAIN_TYPES, NOCICEPTIVE_SUBTYPES, classifyPainMechanism } from '../data/painType'
import { detectReferral, flowZones, drawnAnswers, referralSummary, referralMechanism } from '../data/referral'
import { patternChecks } from '../data/patternChecks'
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
  knee:      ['Going up or down stairs', 'Squatting or kneeling', 'Sitting with the knee bent for a long time', 'Running or jumping'],
  ankle:     ['First steps in the morning', 'Walking or standing for a long time', 'Running or jumping', 'Uneven ground or stairs'],
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
  ankle:     ['Rest and elevation', 'Ice', 'Supportive footwear', 'Gentle stretching'],
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
  { id: 'sc-systemic', tier: 'urgent', text: 'Fever, chills, unexplained weight loss, or a history of cancer with new or changing pain',
    why: { title: 'Possible infection or systemic cause',
      text: 'Pain accompanied by fever, weight loss, or a cancer history can have a medical rather than a mechanical cause. That has to be excluded by a doctor first, as it is treated quite differently.' } },
  { id: 'sc-trauma', tier: 'urgent', sameDay: true, text: 'A significant fall, accident, or injury — or any fall if you are 65 or older, or have osteoporosis',
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
  { id: 'ca-bone', tier: 'caution', text: 'Osteoporosis, thinning bones, or long-term steroid medication',
    why: { title: 'Worth knowing before your first assessment',
      text: 'Where bone strength may be reduced, hands-on techniques and loading are chosen more carefully. It does not stop physiotherapy — it shapes how it starts.' } },
  { id: 'ca-surgery', tier: 'caution', text: 'Surgery or a procedure in this area within the last 3 months',
    why: { title: 'Recent surgery changes the plan',
      text: 'Healing tissue and any surgeon\'s restrictions come first, so your assessment works within them.' } },
  { id: 'ca-preg', tier: 'caution', text: 'Pregnant, or within 3 months of giving birth',
    why: { title: 'Worth knowing before your first assessment',
      text: 'Positions, hands-on techniques and exercise choices are adjusted during and after pregnancy.' } },
  { id: 'ca-cardio', tier: 'caution', text: 'A heart or lung condition that limits what you can do physically',
    why: { title: 'Worth knowing before your first assessment',
      text: 'Exertion during assessment and exercise is paced to what is comfortable and safe for you.' } },
]

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
    text: 'Symptoms in this group are usually examined first to rule out a fracture, an infection, or a circulation problem. Once that has been done, physiotherapy can go ahead safely.',
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
  background: sel ? 'rgba(201,169,110,0.18)' : 'rgba(255,255,255,0.04)',
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

/* ── Shown after the safety check clears, before the result is revealed.
   Wording follows the CHCPBC Practice Standards: it states plainly that the
   output is not a diagnosis, describes it as general information rather than
   a clinical finding, and makes no guarantee about any outcome. ───────── */
function NoticeDialog({ onOk, onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onBack}
      style={{
        position: 'fixed', inset: 0, zIndex: 200, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 20,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      }}
    >
      <motion.div
        role="dialog" aria-modal="true" aria-labelledby="pa-notice-title"
        initial={{ opacity: 0, y: 18, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.32, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480, boxSizing: 'border-box',
          borderRadius: 20, padding: 'clamp(22px, 6vw, 28px)',
          background: 'rgba(12,28,50,0.97)', border: '1px solid rgba(201,169,110,0.3)',
          boxShadow: '0 24px 70px rgba(0,0,0,0.6)', maxHeight: '86svh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
          </svg>
          <h3 id="pa-notice-title" style={{ ...h2, fontSize: 'clamp(21px,5.4vw,25px)', fontWeight: 400, margin: 0 }}>
            Please note
          </h3>
        </div>

        <p style={{ ...body, fontSize: 15.5, margin: '0 0 12px' }}>
          This is <strong style={{ color: '#fff' }}>not a confirmed diagnosis</strong>. What
          follows is a general suggestion based only on the answers you provided.
        </p>
        <p style={{ ...body, fontSize: 15.5, margin: '0 0 12px' }}>
          It cannot examine you, review your medical history, or determine the cause of your
          symptoms. Only an individual assessment by a physiotherapist or physician can do that.
        </p>
        <p style={{ ...body, fontSize: 15.5, margin: '0 0 22px' }}>
          Every person is different, and no particular result or outcome is implied or guaranteed.
        </p>

        <div className="pa-actions" style={{ maxWidth: 'none', marginTop: 0 }}>
          <button className="pa-primary" style={goldBtn} onClick={onOk} autoFocus>OK</button>
          <button style={ghostBtn} onClick={onBack}>Back</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

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
   landing → rotate (step 1) → draw (step 2) → area (only when the marks
   cross more than one area) → intro notice → questions (A–E) → review →
   safety check → urgent care | results

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
  // The swipe hint is a nudge, not decoration: it disappears the moment the
  // visitor touches the model, so it never nags someone who already knows.
  const [hasTurned, setHasTurned] = useState(false)

  const [stage, setStage] = useState('landing')
  const [qIndex, setQIndex] = useState(0)
  const [zones, setZones] = useState([])
  const [answers, setAnswers] = useState({})   // { q1: 'text'|'__other', q1_other: '' }
  const [flags, setFlags] = useState([])       // ids from safetyChecks, plus '__other'
  const [flagOther, setFlagOther] = useState('')
  const [clearSignal, setClearSignal] = useState(0)
  const [undoSignal, setUndoSignal] = useState(0)
  const [redoSignal, setRedoSignal] = useState(0)
  const [history, setHistory] = useState({ canUndo: false, canRedo: false, lines: 0 })
  const [fromReview, setFromReview] = useState(false)
  // Gates the result screen behind the "not a diagnosis" notice.
  const [showNotice, setShowNotice] = useState(false)
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
  const referral = useMemo(() => detectReferral(lines), [lines])
  const flowZ = useMemo(() => flowZones(zones, referral), [zones, referral])
  const drawn = useMemo(() => drawnAnswers(referral), [referral])
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
  const [drawMode, setDrawMode] = useState(false)
  const drawOn = stage === 'draw' && drawMode

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
  const keys = useMemo(() => questionRegions(flowZ, focusKey), [flowZ, focusKey])
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
        { id: '__ctx', group: [...ctxQuestions, PAIN_QUALITY], text: 'A few details to start' },
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
  const plannedScreens = keys.length ? 1 + TAIL_IDS.length + Math.min(MAX_SCORED_QUESTIONS, regionQuestions.length) : activeQuestions.length
  // Only the opening answers, the questions on the current path and the free
  // text count. After going Back and taking a different route, the abandoned
  // question's answer must not quietly shape the result.
  const scopedAnswers = useMemo(() => {
    if (!keys.length) return answers
    // Answers the drawing gave (e.g. N2 "past the elbow") count even when that
    // question was not shown.
    const keep = new Set([...ctxQuestions.map((q) => q.id), ...askedIds, ...Object.keys(drawn), 'notes'])
    const out = {}
    for (const [k, v] of Object.entries(answers)) if (keep.has(k.replace(/_other$/, ''))) out[k] = v
    return out
  }, [keys, answers, ctxQuestions, askedIds, drawn])
  // Flat list for the review screen and the summary: what was actually asked.
  const flatQuestions = useMemo(
    () => (keys.length
      ? [
          ...ctxQuestions,
          PAIN_QUALITY,
          ...askedIds.map((id) => regionQuestions.find((q) => q.id === id)).filter(Boolean),
          ...tailIndexes.filter((i) => path.includes(i)).flatMap((i) => activeQuestions[i].group),
        ]
      : activeQuestions.flatMap((q) => q.group || [q])),
    [keys, ctxQuestions, askedIds, regionQuestions, activeQuestions, path, tailIndexes],
  )
  // How the pain behaves (SIN, 24-hour pattern, easing), in plain language.
  const behaviour = useMemo(() => interpretBehaviour(answers), [answers])
  // Yellow flags, read as supportive notes — never a score or a label.
  const psych = useMemo(() => interpretPsychosocial(answers), [answers])
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
    try { return rankAcross(keys, scopedAnswers, MAX_HYPOTHESES) } catch { return [] }
  }, [keys, scopedAnswers])
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
  const modelSmall = ['emergency', 'physician', 'intro', 'questions', 'review', 'safety', 'injury', 'urgent', 'ok'].includes(stage)

  const otherFlagged = flags.includes('__other') && flagOther.trim().length > 0
  // Only red flags route away from the result; a caution does not.
  const cautionIds = CAUTION_CHECKS.map((c) => c.id)
  /* ── Safety screening, right after the drawing ─────────────────────────
     Everything that would send someone to 911 is asked first, on its own
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
  const injuryApplies = useMemo(() => injuryScreenApplies(flowZ), [flowZ])
  // Organ-referral and systemic maps the drawing alone matches; the ones that
  // need answers (the inflammatory pattern) are left for the final check.
  const earlyPatterns = useMemo(() => patternChecks(zones, {}, 7), [zones])
  const screening = useMemo(() => {
    const regional = regionRedFlags(flowZ, zones)
    const tierWhy = (f) => TIER_WHY[f.tier] || TIER_WHY.urgent
    const list = regional.map((f) => ({
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
    const universal = injuryApplies ? UNIVERSAL_CHECKS.filter((f) => f.id !== 'sc-trauma') : UNIVERSAL_CHECKS
    const pattern = earlyPatterns.filter((f) => !(ownCardiac && f.id === 'pc-cardiac')).slice(0, 2)
    const all = [...list, ...pattern]
    return {
      emergency: all.filter((f) => f.tier === 'emergency'),
      physician: [...all.filter((f) => f.tier !== 'emergency'), ...universal],
    }
  }, [flowZ, zones, injuryApplies, earlyPatterns])

  // The final check, after the questions: what only the answers can raise.
  const finalChecks = useMemo(() => {
    const out = []
    // Pain that nothing eases, constant or waking them at night, was reported
    // on the pain-behaviour screen: put the matching flag to them to confirm.
    const night = GENERAL_RED_FLAGS.find((f) => f.id === 'grf-night')
    if (behaviour.nightConcern && night) out.push({ ...night, why: TIER_WHY.urgent })
    const early = new Set(earlyPatterns.map((p) => p.id))
    patternChecks(zones, answers, 7).filter((p) => !early.has(p.id)).slice(0, 2).forEach((p) => out.push(p))
    return out
  }, [zones, answers, behaviour.nightConcern, earlyPatterns])

  const safetyChecks = useMemo(
    () => [...screening.emergency, ...screening.physician, ...finalChecks],
    [screening, finalChecks],
  )
  const flaggedIn = (list) => list.some((f) => flags.includes(f.id))
  // The page a red flag was ticked on, so Back from the urgent screen returns there.
  const [flaggedAt, setFlaggedAt] = useState(null)
  const routeUrgent = (from) => { setFlaggedAt(from); setStage('urgent') }

  /* ── Injury screens (../data/injuryScreen.js: neck, shoulder, upper arm) ──
     Straight after the physician-first page, when one applies. Its answers are
     kept in `answers` as "<screen>:<question>"; `injuryPath` is the questions
     shown, for Back.
     Its outcome joins the flags: 'emergency' → 911, 'urgent' → physician. */
  const [injuryPath, setInjuryPath] = useState([])
  const [injuryQ, setInjuryQ] = useState(null)       // question on screen
  const [injuryDraft, setInjuryDraft] = useState(undefined) // its uncommitted pick
  const injury = useMemo(() => injuryFlow(flowZ, answers, answers.age), [flowZ, answers])
  const injuryOutcome = injury.route === 'emergency' || injury.route === 'urgent' ? injury : null
  const injuryFlag = injuryOutcome
    ? { id: '__injury', tier: injuryOutcome.route, sameDay: injuryOutcome.sameDay,
      text: (SCREENS.find((sc) => sc.id === injuryOutcome.screen) || {}).flag || 'A recent injury (injury screen)',
      why: { title: injuryOutcome.why, text: TIER_WHY[injuryOutcome.route].text } }
    : null

  const pickedFlags = [...safetyChecks.filter((f) => flags.includes(f.id)), ...(injuryFlag ? [injuryFlag] : [])]
  // Emergency-tier flags (e.g. cauda equina signs) mean 911 now, not a booking.
  const emergencyFlagged = pickedFlags.some((f) => f.tier === 'emergency')
  /* "See a doctor" flags do not end the visit. The person is advised to see
     their doctor — today for the same-day ones (giant cell arteritis, a
     possible clot, a hot joint with fever, a possible fracture) — and can
     book with Chandra now and carry on to their results, which repeat the
     advice. Physiotherapy never replaces the medical check. */
  const doctorFlags = pickedFlags.filter((f) => f.tier !== 'emergency')
  const doctorFlagged = doctorFlags.length > 0 || otherFlagged
  const sameDayFlagged = doctorFlags.some((f) => f.sameDay)
  // Where "Continue" goes from the see-a-doctor screen: on through the flow.
  const continueAfterDoctor = () => {
    if (flaggedAt === 'physician') { if (injuryApplies) startInjury(); else setStage('intro') }
    else if (flaggedAt === 'injury') setStage('intro')
    else setShowNotice(true)
  }
  // Cautions never withhold booking — they shape the first assessment, and
  // they are listed on the result screen and in Chandra's summary.
  const pickedCautions = CAUTION_CHECKS.filter((f) => flags.includes(f.id))

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
    const kept = cur.filter((id) => {
      const o = q.options.find((x) => x.id === id)
      return !(o && isExclusive(o))
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
  const qaPairs = useMemo(() => [
    ...flatQuestions
      .filter((q) => !q.textarea)
      .map((q) => ({ question: q.area ? `${q.area}: ${q.text}` : q.text, answer: answerText(q) }))
      .filter((pair) => pair.answer && pair.answer !== '—'),
    ...INJURY_KEYS.filter((k) => answers[k] !== undefined).map((k) => {
      const { screen, q } = injuryQuestion(k, flowZ)
      return {
        question: `${screen.title} (injury screen): ${q.text}`,
        answer: [].concat(answers[k]).map((id) => (q.options.find((o) => o.id === id) || {}).label).filter(Boolean).join(' · '),
      }
    }),
    ...referral.map((r) => ({
      question: 'Drawn pattern (from the body diagram)',
      answer: `One continuous line from the ${r.kind === 'arm' ? 'neck' : 'low back'} down the ${r.side ? r.side + ' ' : ''}${r.kind} to the ${r.reach} — ${({ radicular: 'nerve-type referral', somatic: 'a referred ache, NOT nerve pain', unclear: 'referred pain, nerve involvement unclear' })[referralMechanism(r, answers)]}`,
    })),
    ...(painType ? [{
      question: "Pain type suggested by the clinic's rules (not the visitor's words)",
      answer: [painType.primary, painType.secondary].filter(Boolean)
        .map((t) => `${PAIN_TYPES[t].title} (${PAIN_TYPES[t].term})`).join(', with some features of '),
    }] : []),
  ], [flatQuestions, answers, painType, referral, flowZ])
  const notesText = String(answers.notes || answers.q5 || '').trim()

  // The summary Chandra receives — built from the same rule output the result
  // screen shows, plus the answers themselves. Only on the result screen, so
  // it is never computed while the person is still answering.
  const summaryText = useMemo(() => (stage === 'ok'
    ? buildClinicianSummary({
      zones, referral, keys, answers: scopedAnswers, qaPairs, notes: notesText,
      ranked: shown, behaviour, psych, painType, cautions: pickedCautions,
      declinedFlags: safetyChecks.filter((f) => !flags.includes(f.id)).map((f) => f.text),
      reportedFlags: [...doctorFlags.map((f) => ({ text: f.text, why: f.why && f.why.title, sameDay: !!f.sameDay })),
        ...(otherFlagged ? [{ text: `Other: ${flagOther.trim()}`, why: '', sameDay: false }] : [])],
      review,
    })
    : ''), [stage, zones, referral, keys, scopedAnswers, qaPairs, notesText, shown, behaviour, psych, painType, pickedCautions, safetyChecks, flags, review, doctorFlags, otherFlagged, flagOther])

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
    if (needsAreaChoice(flowZ, focusKey)) { setStage('area'); return }
    // What the drawing already answers (a line to the hand = "past the
    // elbow") — shown selected, and still changeable.
    setAnswers((a) => ({ ...drawn, ...a }))
    setPath([0])
    goToQuestion(0)
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
          { draw: zones.flatMap((z) => (z.face ? [z.type, `${z.type}@${z.face}`] : [z.type])), all: answers })
        next = id ? activeQuestions.findIndex((s) => s.id === id) : tailIndexes[0]
      }
    } else if (qIndex + 1 < activeQuestions.length) {
      next = qIndex + 1
    }
    if (next < 0) { setStage('review'); return }
    setPath((p) => [...p, next])
    setQIndex(next)
  }
  const backFromQuestion = () => {
    if (fromReview) { setFromReview(false); setStage('review'); return }
    if (path.length <= 1) { setStage('intro'); return }
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
  const continueInjury = () => {
    const next = { ...answers, [injuryQ]: injuryDraft }
    const r = injuryFlow(flowZ, next, answers.age)
    setAnswers(next)
    setInjuryPath((p) => [...p, injuryQ])
    if (r.next) { setInjuryQ(r.next); setInjuryDraft(undefined); return }
    if (r.route === 'emergency' || r.route === 'urgent') routeUrgent('injury')
    else setStage('intro')
  }
  // Back one question; answers after it are cleared so a changed route
  // never reuses them without asking.
  const backInjury = () => {
    const p = injuryPath.filter((id) => id !== injuryQ)
    if (!p.length) { setAnswers((a) => withoutInjury(a)); setStage('physician'); return }
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

  const restart = () => {
    setFlaggedAt(null)
    setStage('landing'); setQIndex(0); setZones([]); setLines([]); setAnswers({}); setFlags([]); setFlagOther(''); setFocusKey(null)
    setClearSignal((n) => n + 1); setFromReview(false); setShowNotice(false); setDrawMode(false); setReview(null)
    setInjuryPath([]); setInjuryQ(null); setInjuryDraft(undefined)
  }

  return (
    <section className="pa-section" style={{
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
          .pa-ob-turn { top: 9%;  right: calc(50% + 64px); }
          .pa-ob-draw { top: 9%;  left:  calc(50% + 64px); }
          .pa-ob-undo { bottom: 9%; right: calc(50% + 70px); }
          .pa-ob-redo { bottom: 9%; left:  calc(50% + 70px); }
          @media (max-width: 380px) {
            .pa-ob { padding: 9px 14px; font-size: 12.5px; }
            .pa-ob-turn, .pa-ob-undo { right: calc(50% + 52px); }
            .pa-ob-draw, .pa-ob-redo { left: calc(50% + 52px); }
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
          @media (prefers-reduced-motion: reduce) {
            .pa-swipe, .pa-swipe__dot { animation: none; }
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
            .pa-grid { grid-template-columns: ${stage === 'landing' ? '1fr' : modelSmall ? '1fr 340px' : '5fr 6fr'}; gap: 36px; align-items: center; }
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
                      <button className="pa-primary" style={goldBtn} onClick={() => setStage('rotate')}>start</button>
                    </div>
                    <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', margin: '20px auto 0', maxWidth: 520 }}>
                      This guide offers general information to help you describe your symptoms.
                      It is not a diagnosis and does not replace an assessment by a qualified
                      health professional.
                    </p>
                  </div>
                </div>
              </Fade>
            )}

            {/* STEP 1 — TURN THE BODY */}
            {stage === 'rotate' && (
              <Fade k="rotate">
                <span style={label}>Step 1 of 2 · Turn the Body</span>
                <h2 style={{ ...h2, fontSize: 'clamp(28px,6.4vw,42px)', margin: '12px 0 8px' }}>
                  Turn the body <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>if you need to</em>
                </h2>
                <p className="pa-lede">
                  Only if the sore side isn't facing you — otherwise just press Continue.
                </p>
                {/* One arrow, one action, one result. The verb follows the input
                    the visitor actually has: "swipe" means nothing on a mouse,
                    "scroll" means nothing on a phone. */}
                <ul className="pa-gestures">
                  {(isPhone
                    ? [
                        ['\u2194', 'Swipe left or right', 'spin the body around'],
                        ['\u2195', 'Swipe up or down', 'tilt it (see the soles of the feet)'],
                        ['\u21c4', 'Two fingers', 'slide the picture'],
                        ['\u2295', 'Pinch', 'zoom in and out'],
                      ]
                    : [
                        ['\u2194', 'Drag left or right', 'spin the body around'],
                        ['\u2195', 'Drag up or down', 'tilt it (see the soles of the feet)'],
                        ['\u21c4', 'Drag beside it', 'slide the picture'],
                        ['\u2295', 'Scroll on it', 'zoom in and out'],
                      ]
                  ).map(([arrow, action, result]) => (
                    <li key={action}>
                      <span className="pa-gestures__badge" aria-hidden="true">{arrow}</span>
                      <span><b>{action}</b> — {result}</span>
                    </li>
                  ))}
                </ul>
                <div className="pa-actions">
                  <button className="pa-primary" style={goldBtn} onClick={() => setStage('draw')}>Continue</button>
                  <button style={ghostBtn} onClick={restart}>Back</button>
                </div>
              </Fade>
            )}

            {/* STEP 2 — DRAW ALL PAINFUL AREAS */}
            {stage === 'draw' && (
              <Fade k="draw">
                <span style={label}>Step 2 of 2 · Mark Your Pain</span>
                <h2 style={{ ...h2, fontSize: 'clamp(28px,6.4vw,42px)', margin: '12px 0 22px' }}>
                  Draw on every <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>painful area</em>
                </h2>

                {/* Turn / Draw and Undo / Redo sit on the body itself (see the
                    model panel); only the marked areas and Clear All stay here. */}
                {zones.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 18 }}>
                    {zones.map((z) => (
                      <span key={z.id} style={pill}>{z.label}</span>
                    ))}
                    <button style={toolBtn(false)} onClick={() => setClearSignal((n) => n + 1)}>Clear All</button>
                  </div>
                )}

                <div className="pa-actions">
                  <button
                    className="pa-primary"
                    style={{ ...goldBtn, opacity: zones.length ? 1 : 0.45, cursor: zones.length ? 'pointer' : 'not-allowed' }}
                    disabled={!zones.length}
                    onClick={() => setStage(screening.emergency.length ? 'emergency' : 'physician')}
                  >Continue</button>
                  <button style={ghostBtn} onClick={() => setStage('rotate')}>Back</button>
                </div>

                {!zones.length && (
                  <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)', margin: '14px 0 0' }}>
                    Please draw at least one line on the body to continue.
                  </p>
                )}
              </Fade>
            )}

            {/* CHOOSE THE FOCUS AREA — only when the marks cross more than
                one area. Each area has its own clinician-authored questions,
                so asking beats silently guessing which area the person meant. */}
            {stage === 'area' && (
              <Fade k="area">
                <span style={label}>One More Step</span>
                <h2 style={{ ...h2, fontSize: 'clamp(28px,6.4vw,40px)', margin: '12px 0 10px' }}>
                  Which area should the questions <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>focus on?</em>
                </h2>
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
                    onClick={() => setStage('intro')}
                  >Continue</button>
                  <button style={ghostBtn} onClick={() => setStage('intro')}>Back</button>
                </div>
              </Fade>
            )}

            {/* NOTICE BEFORE THE QUESTIONS */}
            {stage === 'intro' && (
              <Fade k="intro">
                <h2 style={{ ...h2, fontSize: 'clamp(28px,6.4vw,40px)', margin: '4px 0 10px' }}>
                  Please answer a few <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>questions</em>
                </h2>
                {multiPattern && zones.length > 1 && (
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', margin: '0 0 14px', maxWidth: 460 }}>
                    {referral.length > 0 && keys.length === 1 ? (
                      <>
                        Your line travels from the {referral[0].kind === 'arm' ? 'neck down the arm' : 'low back down the leg'}.
                        Pain that travels this way often starts in the {referral[0].kind === 'arm' ? 'neck' : 'back'}, so
                        the questions focus on the {REGIONS[keys[0]].name.toLowerCase()} first.
                      </>
                    ) : multiArea ? (
                      <>
                        Your marks travel from the {zones[0].label.toLowerCase()} toward
                        the {zones[zones.length - 1].label.toLowerCase()}, so the questions cover
                        the {(() => {
                          const n = keys.map((k) => REGIONS[k].name.toLowerCase())
                          return `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}`
                        })()}.
                      </>
                    ) : keys.length === 1 ? (
                      <>The questions focus on the {REGIONS[keys[0]].name.toLowerCase()}.</>
                    ) : null}
                  </p>
                )}
                <p style={{ ...body, margin: '0 0 24px', maxWidth: 460 }}>
                  There are up to {plannedScreens} short questions, and your answers shape
                  the information you will see at the end.
                </p>
                <div className="pa-actions">
                  <button className="pa-primary" style={goldBtn} onClick={startQuestions}>Continue</button>
                  <button style={ghostBtn} onClick={() => setStage('physician')}>Back</button>
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
              const canNext = q.group
                ? q.group.every((sub) => (sub.multi
                  ? Array.isArray(answers[sub.id]) && answers[sub.id].length > 0
                  : answers[sub.id] !== undefined))
                : q.textarea
                  ? true
                  : q.multi
                    ? (!otherPicked || otherText.length > 0)
                    : a !== undefined
              return (
                <Fade k={'q' + qIndex}>
                  <span style={label}>{q.area ? `${q.area} · ` : ''}Question {step} of {Math.max(plannedScreens, step)}</span>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, margin: '12px 0 20px', maxWidth: 520 }}>
                    <motion.div animate={{ width: `${(step / Math.max(plannedScreens, step)) * 100}%` }} style={{ height: 3, background: GOLD, borderRadius: 2 }} />
                  </div>
                  <h2 style={{ ...h2, fontSize: 'clamp(25px,5.8vw,36px)', margin: '0 0 8px', maxWidth: 520 }}>{q.text}</h2>
                  {!q.textarea && (
                    <p style={{ ...body, fontSize: 14.5, color: 'rgba(255,255,255,0.55)', margin: '0 0 18px' }}>
                      {q.group
                        ? (q.hint || 'Tap an answer for each.')
                        : q.multi
                          ? 'Select all that apply — or continue if none do.'
                          : 'Choose one.'}
                    </p>
                  )}

                  {q.group ? (
                    <div style={{ maxWidth: 520 }}>
                      {q.group.map((sub, si) => (
                        <div key={sub.id} style={{ marginBottom: si === q.group.length - 1 ? 0 : 22 }}>
                          <div style={{ fontSize: 17, color: '#fff', margin: '0 0 10px', lineHeight: 1.4 }}>{sub.text}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {sub.options.map((opt) => {
                              const sel = isPicked(sub, opt.id)
                              return (
                                <button key={opt.id} onClick={() => toggleAnswer(sub, opt.id)}
                                  style={{
                                    padding: '12px 16px', borderRadius: 12, cursor: 'pointer', minHeight: 48,
                                    fontSize: 15, lineHeight: 1.35, textAlign: 'left', flex: '0 1 auto',
                                    fontFamily: 'var(--font-body)', transition: 'all 0.15s',
                                    border: `1px solid ${sel ? GOLD : 'rgba(255,255,255,0.22)'}`,
                                    background: sel ? 'rgba(201,169,110,0.18)' : 'rgba(255,255,255,0.04)',
                                    color: sel ? GOLD_LIGHT : 'rgba(255,255,255,0.85)',
                                  }}>{sel && sub.multi ? '✓ ' : ''}{opt.label}</button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
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
                      {q.options.map((opt, oi) => {
                        const sel = isPicked(q, opt.id)
                        return (
                          <button key={opt.id} style={chip(sel)} onClick={() => toggleAnswer(q, opt.id)}>
                            <span style={letterStyle(sel)}>{LETTERS[oi] || '·'}</span>
                            <span>{opt.label}</span>
                            <Tick on={sel} />
                          </button>
                        )
                      })}
                      {/* Free-text alternative. It carries no weights, so the
                          scoring engine ignores it — but it reaches the
                          physiotherapist on the summary, which is the point. */}
                      {q.multi && (() => {
                        const sel = isPicked(q, OTHER_ID)
                        return (
                          <>
                            <button style={chip(sel)} onClick={() => toggleAnswer(q, OTHER_ID)}>
                              <span style={letterStyle(sel)}>{LETTERS[q.options.length] || '·'}</span>
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
                    </div>
                  )}

                  <div className="pa-actions" style={{ marginTop: 22 }}>
                    <button
                      className="pa-primary"
                      style={{ ...goldBtn, opacity: canNext ? 1 : 0.45, cursor: canNext ? 'pointer' : 'not-allowed' }}
                      disabled={!canNext}
                      onClick={nextFromQuestion}
                    >{fromReview ? 'Save' : (step >= plannedScreens || (keys.length && q.id === TAIL_IDS[TAIL_IDS.length - 1])) ? 'Review Answers' : 'Continue'}</button>
                    <button style={ghostBtn} onClick={backFromQuestion}>Back</button>
                  </div>
                </Fade>
              )
            })()}

            {/* REVIEW & CONFIRM */}
            {stage === 'review' && (
              <Fade k="review">
                <span style={label}>Review &amp; Confirm</span>
                <h2 style={{ ...h2, fontSize: 'clamp(28px,6.4vw,40px)', margin: '12px 0 18px' }}>
                  Please check your <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>answers</em>
                </h2>
                <div style={{ ...card, marginBottom: 12, maxWidth: 520 }}>
                  <span style={{ ...label, fontSize: 11.5 }}>Pain areas</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 10 }}>
                    {zones.map((z) => <span key={z.id} style={pill}>{z.label}</span>)}
                  </div>
                </div>
                {flatQuestions.map((q, i) => (
                  <div key={q.id} style={{ ...card, marginBottom: 10, maxWidth: 520, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.5 }}>{q.area ? `${q.area} — ` : ''}{q.text}</p>
                      <p style={{ fontSize: 15.5, color: '#fff', margin: '6px 0 0', lineHeight: 1.55 }}>{answerText(q)}</p>
                    </div>
                    <button onClick={() => goToQuestion(screenOf(q), true)}
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

            {/* SAFETY FIRST — two pages straight after the drawing. Page 1 holds
                everything that means 911 now; page 2 everything that means
                "see a doctor first". Any tick stops the questionnaire there. */}
            {(stage === 'emergency' || stage === 'physician') && (() => {
              const emergency = stage === 'emergency'
              const list = emergency ? screening.emergency : screening.physician
              const ticked = flaggedIn(list)
              const next = () => {
                if (ticked) { routeUrgent(stage); return }
                if (emergency) setStage('physician')
                else if (injuryApplies) startInjury()
                else setStage('intro')
              }
              return (
                <Fade k={stage}>
                  <span style={label}>Safety First{screening.emergency.length ? ` · ${emergency ? '1' : '2'} of 2` : ''}</span>
                  <h2 style={{ ...h2, fontSize: 'clamp(25px,5.8vw,36px)', margin: '12px 0 14px', maxWidth: 520 }}>
                    {emergency
                      ? <>First, a few quick <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>safety questions</em></>
                      : <>A few more <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>checks</em></>}
                  </h2>
                  <p style={{ ...body, fontSize: 15, color: 'rgba(255,255,255,0.65)', margin: '0 0 20px', maxWidth: 520 }}>
                    {emergency
                      ? 'Most people answer no to all of these. If any of them is happening to you now, tick it and we will tell you what to do next.'
                      : 'These are signs a doctor should look at before physiotherapy starts. Tick any that apply to you at present.'}
                  </p>
                  {list.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 9, maxWidth: 520 }}>
                      {list.map((f, i) => {
                        const sel = flags.includes(f.id)
                        return (
                          <button key={f.id} style={chip(sel)}
                            onClick={() => setFlags((cur) => sel ? cur.filter((x) => x !== f.id) : [...cur, f.id])}>
                            <span style={letterStyle(sel)}>{LETTERS[i] || '·'}</span>
                            <span>{f.text}</span>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <p style={{ ...body, fontSize: 15, maxWidth: 520 }}>Nothing on this page applies to the area you marked.</p>
                  )}
                  <div className="pa-actions" style={{ marginTop: 20 }}>
                    <button className="pa-primary" style={goldBtn} onClick={next}>
                      {ticked ? 'Continue' : 'None of These Apply — Continue'}
                    </button>
                    <button style={ghostBtn} onClick={() => setStage(emergency || !screening.emergency.length ? 'draw' : 'emergency')}>Back</button>
                  </div>
                </Fade>
              )
            })()}

            {/* FINAL CHECK — before the results: the few flags only the answers
                can raise (constant night pain, the inflammatory pattern), an
                "other" box, and the cautions that shape the first appointment. */}
            {stage === 'safety' && (
              <Fade k="safety">
                <span style={label}>Before Your Results</span>
                <h2 style={{ ...h2, fontSize: 'clamp(25px,5.8vw,36px)', margin: '12px 0 14px', maxWidth: 520 }}>
                  {finalChecks.length
                    ? <>One more <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>safety check</em></>
                    : <>Anything else <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>we should know?</em></>}
                </h2>
                <p style={{ ...body, fontSize: 15, color: 'rgba(255,255,255,0.65)', margin: '0 0 20px', maxWidth: 520 }}>
                  {finalChecks.length
                    ? 'Your answers raised a question a doctor may need to look at first. Please tick it if it applies.'
                    : 'If another symptom worries you, add it here. The items below help plan your first appointment.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, maxWidth: 520 }}>
                  {finalChecks.map((f, i) => {
                    const sel = flags.includes(f.id)
                    return (
                      <button key={f.id} style={chip(sel)}
                        onClick={() => setFlags((cur) => sel ? cur.filter((x) => x !== f.id) : [...cur, f.id])}>
                        <span style={letterStyle(sel)}>{LETTERS[i] || '·'}</span>
                        <span>{f.text}</span>
                      </button>
                    )
                  })}
                  {(() => {
                    const sel = flags.includes('__other')
                    return (
                      <>
                        <button style={chip(sel)}
                          onClick={() => setFlags((cur) => sel ? cur.filter((x) => x !== '__other') : [...cur, '__other'])}>
                          <span style={letterStyle(sel)}>{LETTERS[finalChecks.length] || '·'}</span>
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

                {/* Cautions: they change how the first assessment is done,
                    they do not stop it. Kept visually separate so the screen
                    never reads as "more red flags". */}
                <p style={{ ...label, display: 'block', margin: '26px 0 0', fontSize: 11.5 }}>
                  Also worth telling us — these do not stop physiotherapy
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, maxWidth: 520, marginTop: 12 }}>
                  {CAUTION_CHECKS.map((f, i) => {
                    const sel = flags.includes(f.id)
                    return (
                      <button key={f.id} style={chip(sel)}
                        onClick={() => setFlags((cur) => sel ? cur.filter((x) => x !== f.id) : [...cur, f.id])}>
                        <span style={letterStyle(sel)}>{i + 1}</span>
                        <span>{f.text}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="pa-actions" style={{ marginTop: 20 }}>
                  <button className="pa-primary" style={goldBtn}
                    onClick={() => {
                      if (flaggedIn(finalChecks) || otherFlagged) routeUrgent('safety')
                      else setShowNotice(true)
                    }}>
                    {flaggedIn(finalChecks) || otherFlagged || pickedCautions.length ? 'Continue' : 'None Apply — Continue'}
                  </button>
                  <button style={ghostBtn} onClick={() => setStage('review')}>Back</button>
                </div>
              </Fade>
            )}

            {/* INJURY SCREENS — neck (Canadian C-Spine Rule), shoulder and
                upper arm, one question at a time (../data/injuryScreen.js). The first answer that routes
                ends it: to 911, to a physician, or on to the results. */}
            {stage === 'injury' && (() => {
              const found = injuryQuestion(injuryQ, flowZ)
              if (!found) return null
              const { q, screen } = found
              const picked = (oid) => (q.multi ? Array.isArray(injuryDraft) && injuryDraft.includes(oid) : injuryDraft === oid)
              const ready = q.multi ? Array.isArray(injuryDraft) && injuryDraft.length > 0 : injuryDraft !== undefined
              return (
                <Fade k={`injury-${injuryQ}`}>
                  <span style={label}>{screen.title}</span>
                  <h2 style={{ ...h2, fontSize: 'clamp(23px,5.4vw,32px)', margin: '12px 0 18px', maxWidth: 520 }}>{q.text}</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 9, maxWidth: 520 }}>
                    {q.options.map((o, i) => (
                      <button key={o.id} style={chip(picked(o.id))} onClick={() => pickInjury(q, o.id)}>
                        <span style={letterStyle(picked(o.id))}>{LETTERS[i] || '·'}</span>
                        <span>{o.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="pa-actions" style={{ marginTop: 20 }}>
                    <button className="pa-primary" style={{ ...goldBtn, opacity: ready ? 1 : 0.45, cursor: ready ? 'pointer' : 'not-allowed' }}
                      disabled={!ready} onClick={continueInjury}>Continue</button>
                    <button style={ghostBtn} onClick={backInjury}>Back</button>
                  </div>
                </Fade>
              )
            })()}

            {/* URGENT-CARE RESULT */}
            {stage === 'urgent' && (
              <Fade k="urgent">
                <span style={label}>Medical Review Recommended</span>

                {!emergencyFlagged && (pickedFlags.length > 0 || otherFlagged) && (
                  <div style={{ ...card, maxWidth: 520, margin: '12px 0 12px' }}>
                    <span style={{ ...label, fontSize: 11.5 }}>You selected</span>
                    <ul style={{ margin: '10px 0 0', paddingLeft: 20, fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,0.82)' }}>
                      {pickedFlags.map((f) => <li key={f.id}>{f.text}</li>)}
                      {otherFlagged && <li>Other: {flagOther.trim()}</li>}
                    </ul>
                  </div>
                )}

                {/* Two outcomes, decided by the tier the clinician assigned to
                    each flag — never by the AI. Emergency: 911 now, and no
                    booking is offered. Otherwise: see a physician first. */}
                {emergencyFlagged ? (
                  <div style={{ ...card, borderColor: 'rgba(239,68,68,0.6)', background: 'rgba(239,68,68,0.08)', maxWidth: 520 }}>
                    <strong style={{ color: '#fca5a5', fontSize: 19, lineHeight: 1.4 }}>Please Seek Emergency Care Now</strong>
                    <p style={{ ...body, fontSize: 15.5, color: 'rgba(255,255,255,0.85)', margin: '12px 0 0' }}>
                      What you selected can be a sign of a problem that needs urgent medical
                      attention. Please call 911 or go to your nearest emergency department
                      now. Do not wait for a physiotherapy appointment.
                    </p>
                    {/* Why, for each emergency answer: the reason from the
                        region document, next to what the person ticked. */}
                    <span style={{ ...label, display: 'block', margin: '18px 0 0', fontSize: 11.5, color: '#fca5a5' }}>Why this needs emergency care</span>
                    <div style={{ display: 'grid', gap: 12, marginTop: 10 }}>
                      {pickedFlags.filter((f) => f.tier === 'emergency').map((f) => (
                        <div key={f.id}>
                          <p style={{ fontSize: 16, color: '#fff', margin: 0, lineHeight: 1.45, fontWeight: 600 }}>{f.why.title}</p>
                          <p style={{ ...body, fontSize: 14, margin: '4px 0 0', color: 'rgba(255,255,255,0.72)' }}>You told us: {f.text}</p>
                        </div>
                      ))}
                    </div>
                    <a href="tel:911" style={{ ...goldBtn, background: '#ef4444', color: '#fff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box', marginTop: 16 }}>
                      Call 911
                    </a>
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
                      {sameDayFlagged
                        ? 'You can still book your physiotherapy assessment now. Chandra will check that a doctor has looked at this before treatment starts.'
                        : 'Physiotherapy can go ahead alongside that, and you can book with Chandra now: your assessment will look at these symptoms in detail, and Chandra can work with your doctor on the next steps.'}
                    </p>
                    <p style={{ ...body, fontSize: 15.5, color: 'rgba(255,255,255,0.85)', margin: '10px 0 0' }}>
                      <strong style={{ color: '#fff' }}>If your symptoms are severe or getting worse quickly, call 911.</strong>
                    </p>
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
                {!emergencyFlagged && (
                  <>
                    <span style={{ ...label, display: 'block', margin: '26px 0 0' }}>Book With Chandra</span>
                    <p style={{ ...body, fontSize: 15, margin: '10px 0 14px', maxWidth: 520 }}>
                      Choose a clinic to book your assessment, or carry on to finish the
                      questions and see what your answers can be associated with.
                    </p>
                    <ClinicPicker />
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
                <span style={label}>Your Results · General Education</span>
                <h2 style={{ ...h2, fontSize: 'clamp(28px,6.4vw,40px)', margin: '14px 0 18px' }}>
                  What your answers <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>can be associated with</em>
                </h2>

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
                  const s = referralSummary(r, referralMechanism(r, answers))
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
                        <p style={{ fontSize: 17, color: GOLD_LIGHT, margin: 0, lineHeight: 1.4, fontWeight: 500 }}>{c.name}</p>
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

                <span style={{ ...label, marginBottom: 12 }}>Overview of your traced pattern</span>
                <div style={{ maxWidth: 520, margin: '12px 0 26px' }}>
                  <PainAIPanel zones={zones} answers={qaPairs} notes={notesText} matched={matched} onReview={setReview} aiOnly />
                </div>

                <span style={{ ...label, marginBottom: 12 }}>Your Next Step · Book an Assessment</span>
                <p style={{ ...body, margin: '12px 0 18px', maxWidth: 520 }}>
                  Based on what you have shared, a physiotherapy assessment is an appropriate
                  next step. An appointment with Chandra lets your symptoms be examined
                  individually and a suitable plan of care discussed with you. Choose the
                  clinic that suits you, then call or book online.
                </p>

                <ClinicPicker />

                {/* Everything the screen worked out, in the order of the CPA
                    Orthopaedic Division subjective booklet — for Chandra, and
                    built on the device from the answers already given. */}
                <ClinicianSummary text={summaryText} />

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

          {/* Not-a-diagnosis notice — must be acknowledged before the result. */}
          <AnimatePresence>
            {showNotice && (
              <NoticeDialog
                onOk={() => { setShowNotice(false); setStage('ok') }}
                onBack={() => setShowNotice(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT: the 3D model (shrinks after confirm, marks persist) ──
            Not on the landing page: it appears once Start is pressed. */}
        {stage !== 'landing' && (
        <motion.div layout transition={{ duration: 0.55, ease: EASE }}
          className={'pa-model' + (modelSmall ? ' small' : '')}>
          <div className="pa-model-stage" onPointerDown={() => setHasTurned(true)}>
            {stage === 'rotate' && !hasTurned && (
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
                <button className={'pa-ob pa-ob-turn' + (!drawMode ? ' on' : '')}
                  aria-pressed={!drawMode} onClick={() => setDrawMode(false)}>Turn</button>
                <button className={'pa-ob pa-ob-draw' + (drawMode ? ' on' : '')}
                  aria-pressed={drawMode} onClick={() => setDrawMode(true)}>Draw</button>
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
              showGestureHint={!(stage === 'rotate' && !hasTurned)}
              controlled
              drawOn={drawOn}
              clearSignal={clearSignal}
              undoSignal={undoSignal}
              redoSignal={redoSignal}
              onHistoryChange={setHistory}
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
