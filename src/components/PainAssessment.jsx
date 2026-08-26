import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Body3D from './Body3D'

const GOLD = '#c9a96e'
const GOLD_LIGHT = '#e8d5b0'
const EASE = [0.22, 1, 0.36, 1]
const BOOK_HREF = 'tel:+16045550101'

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
  { id: 'q2', text: 'How would you describe your pain?', options: [
    'Sharp or stabbing',
    'Dull ache',
    'Burning or tingling',
    'Throbbing',
  ]},
  { id: 'q3', text: 'What tends to make your pain worse?', options: [
    'Movement or exercise',
    'Prolonged sitting or standing',
    'Bending or lifting',
    'At night, or lying in bed',
  ]},
  { id: 'q4', text: 'What tends to ease your pain?', options: [
    'Rest',
    'Gentle movement or stretching',
    'Heat or cold packs',
    'Pain medication',
  ]},
  { id: 'q5', text: 'Is there anything further you would like the physiotherapist to know?', textarea: true,
    placeholder: 'Other symptoms, previous injuries, relevant medical history, or any concerns…' },
]
const LETTERS = ['A', 'B', 'C', 'D']

/* ── Final safety check — four grouped screening questions plus a manual
   option, presented in the same A–E format as the questions above.
   Each option consolidates a recognised set of musculoskeletal red flags
   (cauda equina, progressive neurological deficit, infection or
   malignancy, and significant trauma or suspected fracture). */
const SAFETY_CHECKS = [
  { id: 'sc-cauda', text: 'Loss of bladder or bowel control, or new numbness around the groin, genitals, or inner thighs' },
  { id: 'sc-neuro', text: 'New or worsening weakness, numbness, or loss of coordination in an arm or leg' },
  { id: 'sc-systemic', text: 'Fever, chills, unexplained weight loss, or a history of cancer with new or changing pain' },
  { id: 'sc-trauma', text: 'A significant fall, accident, or injury — or any fall if you are 65 or older, or have osteoporosis' },
]

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
   landing → rotate (step 1) → draw (step 2) → intro notice →
   questions (A–E) → review → safety check → urgent care | book

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

  const [stage, setStage] = useState('landing')
  const [qIndex, setQIndex] = useState(0)
  const [zones, setZones] = useState([])
  const [answers, setAnswers] = useState({})   // { q1: 'text'|'__other', q1_other: '' }
  const [flags, setFlags] = useState([])       // ids from SAFETY_CHECKS, plus '__other'
  const [flagOther, setFlagOther] = useState('')
  const [clearSignal, setClearSignal] = useState(0)
  const [undoSignal, setUndoSignal] = useState(0)
  const [redoSignal, setRedoSignal] = useState(0)
  const [history, setHistory] = useState({ canUndo: false, canRedo: false, lines: 0 })
  const [fromReview, setFromReview] = useState(false)

  const drawOn = stage === 'draw'
  const modelSmall = ['intro', 'questions', 'review', 'safety', 'urgent', 'ok'].includes(stage)

  const otherFlagged = flags.includes('__other') && flagOther.trim().length > 0
  const anyFlagged = flags.some((f) => f !== '__other') || otherFlagged
  const pickedFlags = SAFETY_CHECKS.filter((f) => flags.includes(f.id))

  const setAnswer = (qid, value) => setAnswers((a) => ({ ...a, [qid]: value }))

  const answerText = (q) => {
    const a = answers[q.id]
    if (q.textarea) return (a && String(a).trim()) || '—'
    if (a === '__other') {
      const t = (answers[q.id + '_other'] || '').trim()
      return t ? `Other: ${t}` : '—'
    }
    return a || '—'
  }

  const goToQuestion = (i, viaReview = false) => { setFromReview(viaReview); setQIndex(i); setStage('questions') }
  const nextFromQuestion = () => {
    if (fromReview) { setFromReview(false); setStage('review'); return }
    if (qIndex < QUESTIONS.length - 1) setQIndex(qIndex + 1)
    else setStage('review')
  }
  const backFromQuestion = () => {
    if (fromReview) { setFromReview(false); setStage('review') }
    else if (qIndex === 0) setStage('intro')
    else setQIndex(qIndex - 1)
  }

  const restart = () => {
    setStage('landing'); setQIndex(0); setZones([]); setAnswers({}); setFlags([]); setFlagOther('')
    setClearSignal((n) => n + 1); setFromReview(false)
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
                {/* <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', margin: '20px 0 0', maxWidth: 520 }}>
                  This tool provides general information to help you describe your symptoms.
                  It is not a diagnosis and does not replace an assessment by a qualified
                  health professional.
                </p> */}
              </Fade>
            )}

            {/* STEP 1 — TURN THE BODY */}
            {stage === 'rotate' && (
              <Fade k="rotate">
                <span style={label}>Step 1 of 2 · Turn the Body</span>
                <h2 style={{ ...h2, fontSize: 'clamp(28px,6.4vw,42px)', margin: '12px 0 22px' }}>
                  Turn the body <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>as required</em>
                </h2>
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
                <p style={{ ...body, margin: '0 0 18px', maxWidth: 460 }}>
                  You can draw more than one line.
                </p>

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
                    onClick={() => setStage('intro')}
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

            {/* NOTICE BEFORE THE QUESTIONS */}
            {stage === 'intro' && (
              <Fade k="intro">
                <h2 style={{ ...h2, fontSize: 'clamp(28px,6.4vw,40px)', margin: '4px 0 10px' }}>
                  Please answer a few <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>questions</em>
                </h2>
                <p style={{ ...body, margin: '0 0 24px', maxWidth: 460 }}>
                  It takes approximately two minutes.
                </p>
                <div className="pa-actions">
                  <button className="pa-primary" style={goldBtn} onClick={() => goToQuestion(0)}>Continue</button>
                  <button style={ghostBtn} onClick={() => setStage('draw')}>Back</button>
                </div>
              </Fade>
            )}

            {/* QUESTIONS — options A–D + E (Other, entered manually) */}
            {stage === 'questions' && (() => {
              const q = QUESTIONS[qIndex]
              const a = answers[q.id]
              const isOther = a === '__other'
              const canNext = q.textarea
                ? true
                : (!!a && (!isOther || (answers[q.id + '_other'] || '').trim().length > 0))
              return (
                <Fade k={'q' + qIndex}>
                  <span style={label}>Question {qIndex + 1} of {QUESTIONS.length}</span>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, margin: '12px 0 20px', maxWidth: 520 }}>
                    <motion.div animate={{ width: `${((qIndex + 1) / QUESTIONS.length) * 100}%` }} style={{ height: 3, background: GOLD, borderRadius: 2 }} />
                  </div>
                  <h2 style={{ ...h2, fontSize: 'clamp(25px,5.8vw,36px)', margin: '0 0 20px', maxWidth: 520 }}>{q.text}</h2>

                  {q.textarea ? (
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
                        const sel = a === opt
                        return (
                          <button key={opt} style={chip(sel)} onClick={() => setAnswer(q.id, sel ? undefined : opt)}>
                            <span style={letterStyle(sel)}>{LETTERS[oi]}</span>
                            <span>{opt}</span>
                          </button>
                        )
                      })}
                      <button style={chip(isOther)} onClick={() => setAnswer(q.id, isOther ? undefined : '__other')}>
                        <span style={letterStyle(isOther)}>E</span>
                        <span>Other — enter your own answer</span>
                      </button>
                      {isOther && (
                        <input
                          autoFocus
                          value={answers[q.id + '_other'] || ''}
                          onChange={(e) => setAnswer(q.id + '_other', e.target.value)}
                          placeholder="Please describe…"
                          style={{
                            borderRadius: 14, border: `1px solid ${GOLD}`, background: 'rgba(255,255,255,0.05)',
                            color: '#fff', padding: '16px 17px', fontSize: 16.5, fontFamily: 'var(--font-body)', boxSizing: 'border-box', minHeight: 56,
                          }}
                        />
                      )}
                    </div>
                  )}

                  <div className="pa-actions" style={{ marginTop: 22 }}>
                    <button
                      className="pa-primary"
                      style={{ ...goldBtn, opacity: canNext ? 1 : 0.45, cursor: canNext ? 'pointer' : 'not-allowed' }}
                      disabled={!canNext}
                      onClick={nextFromQuestion}
                    >{fromReview ? 'Save' : qIndex === QUESTIONS.length - 1 ? 'Review Answers' : 'Continue'}</button>
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
                {QUESTIONS.map((q, i) => (
                  <div key={q.id} style={{ ...card, marginBottom: 10, maxWidth: 520, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)', margin: 0, lineHeight: 1.5 }}>{q.text}</p>
                      <p style={{ fontSize: 15.5, color: '#fff', margin: '6px 0 0', lineHeight: 1.55 }}>{answerText(q)}</p>
                    </div>
                    <button onClick={() => goToQuestion(i, true)}
                      style={{ background: 'none', border: 'none', color: GOLD, fontSize: 13.5, cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0, padding: '10px 2px 10px 12px', margin: '-10px -2px -10px 0', minHeight: 44, alignSelf: 'flex-start', fontFamily: 'var(--font-body)' }}>Change</button>
                  </div>
                ))}
                <div className="pa-actions" style={{ marginTop: 16 }}>
                  <button className="pa-primary" style={goldBtn} onClick={() => setStage('safety')}>Continue</button>
                  <button style={ghostBtn} onClick={() => goToQuestion(QUESTIONS.length - 1)}>Back</button>
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
                  {SAFETY_CHECKS.map((f, i) => {
                    const sel = flags.includes(f.id)
                    return (
                      <button key={f.id} style={chip(sel)}
                        onClick={() => setFlags((cur) => sel ? cur.filter((x) => x !== f.id) : [...cur, f.id])}>
                        <span style={letterStyle(sel)}>{LETTERS[i]}</span>
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
                    onClick={() => setStage(anyFlagged ? 'urgent' : 'ok')}>
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
                <span style={label}>You May Proceed With Physiotherapy</span>
                <h2 style={{ ...h2, fontSize: 'clamp(28px,6.4vw,40px)', margin: '14px 0 14px' }}>
                  Book your <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>assessment</em>
                </h2>
                <p style={{ ...body, margin: '0 0 22px', maxWidth: 520 }}>
                  Based on the information you provided, a physiotherapy assessment is an
                  appropriate next step. Booking an appointment with Physio Chandra allows your
                  symptoms to be examined individually and a suitable plan of care discussed
                  with you.
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
        </div>

        {/* ── RIGHT: the 3D model (shrinks after confirm, marks persist) ── */}
        <motion.div layout transition={{ duration: 0.55, ease: EASE }}
          className={'pa-model' + (modelSmall ? ' small' : '')}>
          <div className="pa-model-stage">
            <Body3D
              onSelectionChange={setZones}
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
