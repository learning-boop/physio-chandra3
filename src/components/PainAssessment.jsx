import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Body3D from './Body3D'
import PainAIPanel from './PainAIPanel'
import {
  REGIONS, ZONE_TO_REGION, allQuestions, isRelevant, shouldStop,
  answeredRegionCount, computeResults, GENERAL_RED_FLAGS,
} from '../data/symptomGuide'

const GOLD = '#c9a96e'
const GOLD_LIGHT = '#e8d5b0'
const EASE = [0.22, 1, 0.36, 1]
const BOOK_HREF = 'tel:+16045550101'
// Same convention as PainAIPanel: blank in dev (Vite proxies /api/* to the
// backend), set VITE_API_URL only when the backend lives on another origin.
const API_URL = import.meta.env.VITE_API_URL || ''

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
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']
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
  upperback: ['Sitting at a desk for a long time', 'Deep breathing or coughing', 'Reaching or lifting overhead', 'Twisting the trunk'],
  shoulder:  ['Reaching overhead', 'Reaching behind your back', 'Lying on that side at night', 'Lifting or carrying'],
  elbow:     ['Gripping or squeezing', 'Lifting with the palm down', 'Twisting a handle or door knob', 'Repetitive work or sport'],
  wrist:     ['Gripping or twisting', 'Typing or using a mouse', 'Taking weight through the hand', 'Fine tasks such as buttons or jars'],
  hip:       ['Walking or climbing stairs', 'Lying on that side at night', 'Standing on one leg', 'Getting up from a chair'],
  knee:      ['Going up or down stairs', 'Squatting or kneeling', 'Sitting with the knee bent for a long time', 'Running or jumping'],
  ankle:     ['First steps in the morning', 'Walking or standing for a long time', 'Running or jumping', 'Uneven ground or stairs'],
  head:      ['Long screen time or reading', 'Stress or poor sleep', 'Certain neck or jaw positions', 'Bright light or noisy places'],
}
const REGION_EASERS = {
  lowback:   ['Lying down or resting', 'Gentle walking', 'Changing position often', 'Heat or cold packs'],
  neck:      ['Gentle neck movement', 'Supporting the head or a different pillow', 'Heat packs', 'Rest from screens'],
  upperback: ['Moving and stretching', 'Sitting upright with support', 'Heat packs', 'Rest'],
  shoulder:  ['Resting the arm', 'Supporting the arm in a sling or pocket', 'Gentle pendulum movement', 'Heat or cold packs'],
  elbow:     ['Resting from gripping', 'A brace or strap', 'Ice', 'Gentle stretching'],
  wrist:     ['Resting the hand', 'A splint or support', 'Ice', 'Avoiding the aggravating task'],
  hip:       ['Rest', 'A pillow between the knees at night', 'Gentle walking', 'Heat packs'],
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

/* Regions that lie on one anatomical chain, listed from the body outwards.
   Pain drawn ALONG a chain (shoulder → elbow, low back → down the leg,
   neck → arm) is one travelling pattern, not separate problems — so the
   questions focus automatically on the most PROXIMAL region, whose authored
   set already asks where the pain travels. Only marks in genuinely separate
   areas (e.g. shoulder AND knee) still ask the person to choose. */
const REGION_CHAINS = [
  ['neck', 'shoulder', 'elbow', 'wrist'],
  ['lowback', 'hip', 'knee', 'ankle'],
  ['neck', 'upperback', 'lowback'],
]
function proximalRegion(keys) {
  if (keys.length < 2) return null
  for (const chain of REGION_CHAINS) {
    if (keys.every((k) => chain.includes(k))) return chain.find((k) => keys.includes(k))
  }
  return null
}

/* The single region a drawn selection points at (the most-marked one). */
function primaryRegion(zones) {
  const tally = {}
  zones.forEach((z) => {
    const k = ZONE_TO_REGION[z.type]
    if (k && REGIONS[k]) tally[k] = (tally[k] || 0) + 1
  })
  const best = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]
  return best ? best[0] : null
}

/* The open field stays at the end of every region's set. Its id is not one of
   the region's question ids, so the scoring engine simply ignores it. */
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

/* Possible contributing causes for the drawn areas — general education only,
   never presented as a diagnosis (CHCPBC Practice Standards). */
function likelyCauses(zones, max = 3) {
  // Take one condition from each region the line crossed before taking a second
  // from any of them. Filling the list in region order instead would spend every
  // slot on the first area — a shoulder-to-wrist line would return three
  // shoulder conditions and never mention the elbow or the wrist.
  const regions = []
  const seenRegion = new Set()
  zones.forEach((z) => {
    const k = ZONE_TO_REGION[z.type]
    const r = k && REGIONS[k]
    if (!r || !r.conditions || seenRegion.has(k)) return
    seenRegion.add(k)
    regions.push(r)
  })

  const seen = new Set(); const out = []
  const deepest = Math.max(0, ...regions.map((r) => r.conditions.length))
  for (let rank = 0; rank < deepest && out.length < max; rank++) {
    for (const r of regions) {
      if (out.length >= max) break
      const c = r.conditions[rank]
      if (!c || seen.has(c.id)) continue
      seen.add(c.id)
      out.push({ id: c.id, name: c.name, region: r.name, blurb: (c.blurb || '').split('. ')[0] + '.' })
    }
  }
  return out
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
  { id: 'sc-neuro', text: 'New or worsening weakness, numbness, or loss of coordination in an arm or leg',
    why: { title: 'A nerve or spinal cord may be involved',
      text: 'Weakness that is getting worse suggests a nerve is under pressure rather than simply irritated. A physician needs to establish the cause before any physiotherapy loading begins.' } },
  { id: 'sc-systemic', text: 'Fever, chills, unexplained weight loss, or a history of cancer with new or changing pain',
    why: { title: 'Possible infection or systemic cause',
      text: 'Pain accompanied by fever, weight loss, or a cancer history can have a medical rather than a mechanical cause. That has to be excluded by a doctor first, as it is treated quite differently.' } },
  { id: 'sc-trauma', text: 'A significant fall, accident, or injury — or any fall if you are 65 or older, or have osteoporosis',
    why: { title: 'A fracture should be excluded',
      text: 'After a significant impact — or any fall where bone strength may be reduced — imaging is usually needed to rule out a fracture before the area is loaded or mobilised.' } },
]

/* Why a flagged symptom needs looking at before physiotherapy. Region red
   flags in the guide carry a tier but no explanation, and inventing a clinical
   rationale per symptom would be unreviewed content — so the wording is tied
   to the tier the clinician already assigned. */
const TIER_WHY = {
  emergency: {
    title: 'This needs same-day medical assessment',
    text: 'Symptoms in this group can point to a problem that is time-sensitive and outside what physiotherapy treats. Being asked about it is routine and does not mean something serious is present — but it should be checked today rather than waited on.',
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
  const regionChoices = useMemo(() => {
    const seen = new Set(); const out = []
    zones.forEach((z) => {
      const k = ZONE_TO_REGION[z.type]
      if (k && REGIONS[k] && !seen.has(k)) { seen.add(k); out.push({ key: k, name: REGIONS[k].name }) }
    })
    return out
  }, [zones])
  const [autoFocused, setAutoFocused] = useState(false)
  // New or changed marks invalidate a previously chosen focus area.
  useEffect(() => { setFocusKey(null); setAutoFocused(false) }, [zones])

  // In the draw step the person can switch between marking and turning the
  // model, so they can follow pain that radiates from front to back.
  const [drawMode, setDrawMode] = useState(true)
  const drawOn = stage === 'draw' && drawMode

  /* ── One travelling pattern, one source region ────────────────────────
     A line through several areas is usually ONE problem referring along a
     path, so the questions come from the region the pattern most likely
     starts at (see startQuestions below). Those sets are weighted, so the
     answers actually score a condition and earn its treatment guidance.
     The cross-region narrative is handled after the result, by the AI
     overview, which already receives the whole traced path. */
  const multiPattern = useMemo(() => new Set(zones.map((z) => z.type)).size > 1, [zones])

  // ── The questionnaire is the drawn region's OWN clinical question set ──
  // Each option carries weights pointing at that region's conditions, which is
  // what lets the answers actually decide which condition (and therefore which
  // treatment guidance) is shown. Areas with no authored region — currently
  // only the head — fall back to the generic set.
  const region = useMemo(() => {
    const k = focusKey || primaryRegion(zones)
    return k && REGIONS[k] ? REGIONS[k] : null
  }, [zones, focusKey])
  // Age / how it started / how long are one-tap answers, so they share a single
  // screen instead of costing three. That drops the flow from 9 screens to 7
  // before the adaptive rules trim it further, without losing any answer the
  // scoring engine relies on.
  const activeQuestions = useMemo(() => {
    if (!region) return buildQuestions(zones)
    return [
      { id: '__ctx', group: region.context, text: 'A few details to start' },
      ...region.questions,
      NOTES_Q,
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, zones])
  // Flat list used by the review screen and the summary.
  const flatQuestions = useMemo(
    () => (region ? [...allQuestions(region), NOTES_Q] : buildQuestions(zones)),
    [region, zones],
  )

  // Ranked conditions for the answers given. Empty until enough is answered.
  const ranked = useMemo(() => {
    if (!region) return []
    try { return computeResults(region, answers).ranked || [] } catch { return [] }
  }, [region, answers])
  // Shown only when the answers do not identify anything specific.
  const causes = useMemo(() => likelyCauses(zones), [zones])

  // Skip questions that can no longer change the outcome, and stop early once
  // one condition is clearly ahead. Both rules come from the engine and only
  // apply to the region's diagnostic questions, never to the context ones
  // (age/onset/duration), whose answers gate which conditions are eligible.
  const nextIdx = (from, ans) => {
    if (!region) return Math.min(from, activeQuestions.length - 1)
    const lastDiag = region.questions.length          // index of the notes screen
    let i = from
    while (i >= 1 && i < lastDiag + 1) {
      if (answeredRegionCount(region, ans) >= 2 && shouldStop(region, ans)) return lastDiag + 1
      if (!isRelevant(region.questions[i - 1], region, ans)) { i++; continue }
      break
    }
    return Math.min(i, activeQuestions.length - 1)
  }
  const modelSmall = ['intro', 'questions', 'review', 'safety', 'urgent', 'ok'].includes(stage)

  const otherFlagged = flags.includes('__other') && flagOther.trim().length > 0
  const anyFlagged = flags.some((f) => f !== '__other') || otherFlagged
  /* ── The safety check is built for the area actually marked ───────────
     Every region in the guide carries its own red flags — a swollen warm calf
     for a knee, clumsiness in both hands for a neck, a sudden pop in the calf
     for an ankle. Those are the questions that make this screen worth asking,
     so they come first, emergency tier before urgent. Two checks that apply
     to any body part are appended, and the whole list is capped so the screen
     stays short. */
  const safetyChecks = useMemo(() => {
    const keys = [...new Set(zones.map((z) => ZONE_TO_REGION[z.type]).filter((k) => k && REGIONS[k]))]
    const regional = []
    const seen = new Set()
    for (const tier of ['emergency', 'urgent']) {
      for (const k of keys) {
        for (const f of REGIONS[k].redFlags) {
          if (f.tier === tier && !seen.has(f.id)) { seen.add(f.id); regional.push(f) }
        }
      }
    }
    const list = regional.slice(0, 3).map((f) => ({ ...f, why: TIER_WHY[f.tier] || TIER_WHY.urgent }))
    // Areas with no authored region (currently only the head) fall back to the
    // general flags — but only those the universal checks below do not already
    // cover, otherwise the same question appears twice on one screen.
    if (!list.length) {
      const covered = /fever|weight loss|cancer|accident|fall/i
      GENERAL_RED_FLAGS.filter((f) => !covered.test(f.text))
        .forEach((f) => list.push({ ...f, why: TIER_WHY.urgent }))
    }
    return [...list, ...UNIVERSAL_CHECKS]
  }, [zones])

  const pickedFlags = safetyChecks.filter((f) => flags.includes(f.id))

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
  // reflects the traced pattern AND what the person answered.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const qaPairs = useMemo(() => flatQuestions
    .filter((q) => !q.textarea)
    .map((q) => ({ question: q.text, answer: answerText(q) }))
    .filter((pair) => pair.answer && pair.answer !== '—'), [flatQuestions, answers])
  const notesText = String(answers.notes || answers.q5 || '').trim()

  // The review screen lists every question flat; map a flat index back to the
  // screen that actually holds it (the three context ones share screen 0).
  const reviewIndexToScreen = (flatIdx) => {
    if (!region) return flatIdx
    const c = region.context.length
    return flatIdx < c ? 0 : flatIdx - c + 1
  }

  const goToQuestion = (i, viaReview = false) => { setFromReview(viaReview); setQIndex(i); setStage('questions') }
  // AI pattern questions when we have them; otherwise the clinician-authored
  // sets (chained marks focus the source region automatically; genuinely
  // separate areas ask the person to choose).
  const startQuestions = () => {
    if (multiPattern) {
      const auto = proximalRegion(regionChoices.map((r) => r.key))
      if (auto) { setFocusKey(auto); setAutoFocused(true) }
      else if (regionChoices.length > 1 && !focusKey) { setStage('area'); return }
    }
    goToQuestion(0)
  }
  const nextFromQuestion = () => {
    if (fromReview) { setFromReview(false); setStage('review'); return }
    if (qIndex >= activeQuestions.length - 1) { setStage('review'); return }
    setQIndex(nextIdx(qIndex + 1, answers))
  }
  const backFromQuestion = () => {
    if (fromReview) { setFromReview(false); setStage('review') }
    else if (qIndex === 0) setStage('intro')
    else setQIndex(qIndex - 1)
  }

  const restart = () => {
    setStage('landing'); setQIndex(0); setZones([]); setAnswers({}); setFlags([]); setFlagOther(''); setFocusKey(null); setAutoFocused(false)
    setClearSignal((n) => n + 1); setFromReview(false); setShowNotice(false); setDrawMode(true)
  }

  return (
    <section className="pa-section" style={{
      background: 'var(--black)', fontFamily: 'var(--font-body)',
      minHeight: '100svh', position: 'relative', overflow: 'hidden',
    }}>
      <div className="pa-grid" style={{ maxWidth: 1280, margin: '0 auto' }}>
        <style>{`
          /* Clear the fixed navbar, then leave breathing room above the fold. */
          .pa-section { padding-top: clamp(74px, 19vw, 92px); }

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
          .pa-model { height: min(56svh, 520px); order: -1; }
          /* Once the questions begin the figure shrinks, but it must stay big
             enough to read the marked areas on it. */
          .pa-model.small { height: min(34svh, 300px); }

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
            .pa-model { height: min(46svh, 380px); }
            .pa-model.small { height: min(30svh, 220px); }
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
            .pa-grid { grid-template-columns: ${modelSmall ? '1fr 340px' : '5fr 6fr'}; gap: 36px; align-items: center; }
            .pa-model { order: 2; height: min(86vh, 820px); }
            .pa-model.small { height: 460px; }
          }
        `}</style>

        {/* ── LEFT: the guided panel ── */}
        <div style={{ minWidth: 0, paddingTop: 8 }}>
          <AnimatePresence mode="wait">

            {/* LANDING — heading + Begin only */}
            {stage === 'landing' && (
              <Fade k="landing">
                <h1 style={{ ...h2, fontSize: 'clamp(34px,8.5vw,60px)', margin: isPhone ? '4px 0 22px' : '12px 0 30px' }}>
                  Find the Possible Causes<br />of <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>Your Pain</em>
                </h1>
                <div className="pa-actions">
                  <button className="pa-primary" style={goldBtn} onClick={() => setStage('rotate')}>start</button>
                </div>
                <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', margin: '20px 0 0', maxWidth: 520 }}>
                  This guide offers general information to help you describe your symptoms.
                  It is not a diagnosis and does not replace an assessment by a qualified
                  health professional.
                </p>
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
                <h2 style={{ ...h2, fontSize: 'clamp(28px,6.4vw,42px)', margin: '12px 0 10px' }}>
                  Draw on every <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>painful area</em>
                </h2>
                <p style={{ ...body, margin: '0 0 14px', maxWidth: 460 }}>
                  You can draw more than one line. Switch to <strong style={{ color: GOLD_LIGHT }}>Turn</strong> to
                  spin or tilt the body — tilt up for the soles of the feet; your marks stay
                  in place — then switch back to add more.
                </p>

                {/* Draw / Turn switch: drawing and rotating cannot share the
                    same drag, so the person chooses which one a drag does. */}
                <div role="group" aria-label="Drag mode" style={{
                  display: 'inline-flex', padding: 4, borderRadius: 999, marginBottom: 16,
                  border: '1px solid rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.04)',
                }}>
                  {[['Draw', true], ['Turn', false]].map(([lbl, on]) => (
                    <button key={lbl} onClick={() => setDrawMode(on)}
                      aria-pressed={drawMode === on}
                      style={{
                        padding: '11px 24px', borderRadius: 999, border: 'none', cursor: 'pointer',
                        minHeight: 46, fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase',
                        fontFamily: 'var(--font-body)', transition: 'all 0.15s',
                        background: drawMode === on ? GOLD : 'transparent',
                        color: drawMode === on ? '#081527' : 'rgba(255,255,255,0.7)',
                        fontWeight: drawMode === on ? 700 : 400,
                      }}>{lbl}</button>
                  ))}
                </div>

                {zones.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                    {zones.map((z) => (
                      <span key={z.id} style={pill}>{z.label}</span>
                    ))}
                  </div>
                )}

                {/* Undo / Redo / Clear */}
                <div className="pa-tools">
                  <button
                    style={toolBtn(!history.canUndo)}
                    disabled={!history.canUndo}
                    onClick={() => setUndoSignal((n) => n + 1)}
                    aria-label="Undo the last line"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" />
                    </svg>
                    Undo
                  </button>
                  <button
                    style={toolBtn(!history.canRedo)}
                    disabled={!history.canRedo}
                    onClick={() => setRedoSignal((n) => n + 1)}
                    aria-label="Redo the last undone line"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m15 14 5-5-5-5" /><path d="M20 9H10a6 6 0 0 0 0 12h3" />
                    </svg>
                    Redo
                  </button>
                  {history.lines > 0 && (
                    <button style={toolBtn(false)} onClick={() => setClearSignal((n) => n + 1)}>Clear All</button>
                  )}
                </div>

                <div className="pa-actions">
                  <button
                    className="pa-primary"
                    style={{ ...goldBtn, opacity: zones.length ? 1 : 0.45, cursor: zones.length ? 'pointer' : 'not-allowed' }}
                    disabled={!zones.length}
                    onClick={() => {
                      setStage('intro')
                    }}
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
                    onClick={() => { setAutoFocused(false); setStage('intro') }}
                  >Continue</button>
                  <button style={ghostBtn} onClick={() => setStage('draw')}>Back</button>
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
                    Your marks travel from the {zones[0].label.toLowerCase()} toward
                    the {zones[zones.length - 1].label.toLowerCase()}. Pain that travels
                    usually comes from one place, so the questions focus there.
                  </p>
                )}
                <p style={{ ...body, margin: '0 0 24px', maxWidth: 460 }}>
                  This takes about two minutes, and your answers shape the information
                  you will see at the end.
                </p>
                <div className="pa-actions">
                  <button
                    className="pa-primary"
                    onClick={startQuestions}
                  >Continue</button>
                  <button style={ghostBtn} onClick={() => setStage(regionChoices.length > 1 ? 'area' : 'draw')}>Back</button>
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
                ? q.group.every((sub) => answers[sub.id] !== undefined)
                : q.textarea
                  ? true
                  : q.multi
                    ? (!otherPicked || otherText.length > 0)
                    : a !== undefined
              return (
                <Fade k={'q' + qIndex}>
                  <span style={label}>Question {qIndex + 1} of {activeQuestions.length}</span>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, margin: '12px 0 20px', maxWidth: 520 }}>
                    <motion.div animate={{ width: `${((qIndex + 1) / activeQuestions.length) * 100}%` }} style={{ height: 3, background: GOLD, borderRadius: 2 }} />
                  </div>
                  <h2 style={{ ...h2, fontSize: 'clamp(25px,5.8vw,36px)', margin: '0 0 8px', maxWidth: 520 }}>{q.text}</h2>
                  {!q.textarea && (
                    <p style={{ ...body, fontSize: 14.5, color: 'rgba(255,255,255,0.55)', margin: '0 0 18px' }}>
                      {q.group
                        ? 'Tap an answer for each.'
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
                                  }}>{opt.label}</button>
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
                    >{fromReview ? 'Save' : qIndex === activeQuestions.length - 1 ? 'Review Answers' : 'Continue'}</button>
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
                      <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.5 }}>{q.text}</p>
                      <p style={{ fontSize: 15.5, color: '#fff', margin: '6px 0 0', lineHeight: 1.55 }}>{answerText(q)}</p>
                    </div>
                    <button onClick={() => goToQuestion(reviewIndexToScreen(i), true)}
                      style={{ background: 'none', border: 'none', color: GOLD, fontSize: 13.5, cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0, padding: '10px 2px 10px 12px', margin: '-10px -2px -10px 0', minHeight: 44, alignSelf: 'flex-start', fontFamily: 'var(--font-body)' }}>Change</button>
                  </div>
                ))}
                <div className="pa-actions" style={{ marginTop: 16 }}>
                  <button className="pa-primary" style={goldBtn} onClick={() => setStage('safety')}>Continue</button>
                  <button style={ghostBtn} onClick={() => goToQuestion(activeQuestions.length - 1)}>Back</button>
                </div>
              </Fade>
            )}

            {/* SAFETY CHECK — four screening options (A–D) + E manual entry */}
            {stage === 'safety' && (
              <Fade k="safety">
                <span style={label}>Final Safety Check</span>
                <h2 style={{ ...h2, fontSize: 'clamp(25px,5.8vw,36px)', margin: '12px 0 14px', maxWidth: 520 }}>
                  Do any of these <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>apply to you?</em>
                </h2>
                <p style={{ ...body, fontSize: 15, color: 'rgba(255,255,255,0.65)', margin: '0 0 20px', maxWidth: 520 }}>
                  Certain symptoms fall outside the scope of physiotherapy and require medical
                  assessment first. Please select any that apply to you at present.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, maxWidth: 520 }}>
                  {safetyChecks.map((f, i) => {
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
                          <span style={letterStyle(sel)}>E</span>
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

                <div className="pa-actions" style={{ marginTop: 20 }}>
                  <button className="pa-primary" style={goldBtn}
                    onClick={() => { if (anyFlagged) setStage('urgent'); else setShowNotice(true) }}>
                    {anyFlagged ? 'Continue' : 'None Apply — Continue'}
                  </button>
                  <button style={ghostBtn} onClick={() => setStage('review')}>Back</button>
                </div>
              </Fade>
            )}

            {/* URGENT-CARE RESULT */}
            {stage === 'urgent' && (
              <Fade k="urgent">
                <span style={label}>Medical Review Recommended</span>

                {(pickedFlags.length > 0 || otherFlagged) && (
                  <div style={{ ...card, maxWidth: 520, margin: '12px 0 12px' }}>
                    <span style={{ ...label, fontSize: 11.5 }}>You selected</span>
                    <ul style={{ margin: '10px 0 0', paddingLeft: 20, fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,0.82)' }}>
                      {pickedFlags.map((f) => <li key={f.id}>{f.text}</li>)}
                      {otherFlagged && <li>Other: {flagOther.trim()}</li>}
                    </ul>
                  </div>
                )}

                <div style={{ ...card, borderColor: 'rgba(239,68,68,0.6)', background: 'rgba(239,68,68,0.08)', maxWidth: 520 }}>
                  <strong style={{ color: '#fca5a5', fontSize: 19, lineHeight: 1.4 }}>Please Seek Medical Assessment First</strong>
                  <p style={{ ...body, fontSize: 15.5, color: 'rgba(255,255,255,0.85)', margin: '12px 0 0' }}>
                    The symptoms you selected should be reviewed by a physician before
                    beginning physiotherapy. Please contact your family doctor, or your local
                    emergency service if your symptoms are severe or worsening.
                  </p>
                </div>

                {pickedFlags.length > 0 && (
                  <>
                    <span style={{ ...label, display: 'block', margin: '22px 0 0' }}>Why these need review first</span>
                    <div style={{ marginTop: 12 }}>
                      {pickedFlags.slice(0, 3).map((f) => (
                        <div key={f.id} style={{ ...card, maxWidth: 520, marginBottom: 10 }}>
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

                <div className="pa-actions" style={{ marginTop: 20 }}>
                  <button className="pa-primary" style={goldBtn} onClick={() => setStage('safety')}>Back</button>
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

                {/* THE POSSIBLE REASONS COME FIRST. Matched from the answers by
                    the scoring engine — a condition only appears once it scores
                    >= 3 and >= 40% of its maximum, so a weak match stays hidden
                    rather than padding the list. The answer recap was removed
                    from this screen; answers can still be checked and changed
                    on the Review screen before this point. */}
                {ranked.length > 0 ? (
                  <div style={{ marginBottom: 24 }}>
                    {ranked.map(({ c }) => (
                      <div key={c.id} style={{ ...card, maxWidth: 520, marginBottom: 10 }}>
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
                ) : causes.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <span style={{ ...label, marginBottom: 12 }}>Common reasons for pain in this area</span>
                    <div style={{ marginTop: 12 }}>
                      {causes.map((c) => (
                        <div key={c.id} style={{ ...card, maxWidth: 520, marginBottom: 10 }}>
                          <p style={{ fontSize: 16, color: GOLD_LIGHT, margin: 0, lineHeight: 1.45, fontWeight: 500 }}>{c.name}</p>
                          <p style={{ ...body, fontSize: 14.5, margin: '7px 0 0' }}>{c.blurb}</p>
                        </div>
                      ))}
                      <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', margin: '12px 0 0', maxWidth: 520 }}>
                        Your answers did not point clearly to one pattern, so these are common
                        reasons for pain in the area you marked. They are general examples, not
                        findings about you.
                      </p>
                    </div>
                  </div>
                )}

                {/* AI overview of the whole traced path. The curated cards above
                    are per-area; this is the part that can read a line running
                    from one area to another as a single radiating pattern. */}
                <span style={{ ...label, marginBottom: 12 }}>Overview of your traced pattern</span>
                <div style={{ maxWidth: 520, margin: '12px 0 26px' }}>
                  <PainAIPanel zones={zones} answers={qaPairs} notes={notesText} aiOnly />
                </div>

                <span style={{ ...label, marginBottom: 12 }}>Your Next Step</span>
                <p style={{ ...body, margin: '12px 0 18px', maxWidth: 520 }}>
                  Based on what you have shared, a physiotherapy assessment is an appropriate
                  next step. An appointment with Physio Chandra lets your symptoms be examined
                  individually and a suitable plan of care discussed with you.
                </p>

                <div className="pa-actions">
                  <a className="pa-primary" href={BOOK_HREF} style={{ ...goldBtn, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
                    Book an Appointment
                  </a>
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

        {/* ── RIGHT: the 3D model (shrinks after confirm, marks persist) ── */}
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
            <Body3D
              onSelectionChange={setZones}
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
      </div>
    </section>
  )
}
