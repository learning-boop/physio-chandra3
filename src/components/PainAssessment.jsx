import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Body3D from './Body3D'
import { REGIONS, GENERAL_RED_FLAGS, ZONE_TO_REGION } from '../data/symptomGuide'

const GOLD = '#c9a96e'
const GOLD_LIGHT = '#e8d5b0'
const EASE = [0.22, 1, 0.36, 1]
const BOOK_HREF = 'tel:+16045550101'

/* ── The 5 questions — A–D fixed choices, E = Other (type manually) ────
   Option sets chosen the way a physiotherapist triages: onset (acute /
   subacute / chronic), pain character, aggravating factors, easing factors. */
const QUESTIONS = [
  { id: 'q1', text: 'When did your pain start?', options: [
    'Today or yesterday',
    'Within the last week',
    '1 – 6 weeks ago',
    'More than 6 weeks ago',
  ]},
  { id: 'q2', text: 'How would you describe your pain?', options: [
    'Sharp or stabbing',
    'Dull ache',
    'Burning or tingling',
    'Throbbing',
  ]},
  { id: 'q3', text: 'What usually makes your pain worse?', options: [
    'Movement or exercise',
    'Sitting or standing for a long time',
    'Bending or lifting',
    'Night time / lying in bed',
  ]},
  { id: 'q4', text: 'What helps reduce your pain?', options: [
    'Rest',
    'Gentle movement or stretching',
    'Heat or cold packs',
    'Pain medication',
  ]},
  { id: 'q5', text: 'Is there anything else you would like the physiotherapist to know?', textarea: true,
    placeholder: 'Describe any other symptoms, concerns, previous injuries, or relevant information...' },
]
const LETTERS = ['A', 'B', 'C', 'D']

/* ── shared styles ───────────────────────────────────────────────────── */
const label = { fontSize: 11.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, display: 'inline-block' }
const h2 = { fontFamily: 'var(--font-display)', fontWeight: 300, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1.12 }
const chip = (sel) => ({
  padding: '15px 16px', borderRadius: 14, cursor: 'pointer', fontSize: 15, lineHeight: 1.45,
  minHeight: 52, width: '100%', boxSizing: 'border-box',
  border: `1px solid ${sel ? GOLD : 'rgba(255,255,255,0.22)'}`,
  background: sel ? 'rgba(201,169,110,0.18)' : 'rgba(255,255,255,0.04)',
  color: sel ? GOLD_LIGHT : 'rgba(255,255,255,0.85)', transition: 'all 0.15s', textAlign: 'left',
  display: 'flex', gap: 12, alignItems: 'baseline',
})
/* Compact read-only tag for the selected pain areas — must stay inline, so it
   deliberately drops chip()'s full-width / min-height touch sizing. */
const pill = {
  padding: '8px 14px', borderRadius: 999, fontSize: 13, lineHeight: 1.3,
  border: `1px solid ${GOLD}`, background: 'rgba(201,169,110,0.18)',
  color: GOLD_LIGHT, cursor: 'default', display: 'inline-block',
  maxWidth: '100%', boxSizing: 'border-box',
}
const letterStyle = (sel) => ({
  fontFamily: 'var(--font-display)', fontSize: 15, color: sel ? GOLD : 'rgba(255,255,255,0.45)',
  flexShrink: 0, width: 16,
})
const goldBtn = {
  padding: '16px 34px', borderRadius: 999, border: 'none', cursor: 'pointer',
  background: GOLD, color: '#081527', fontWeight: 700, fontSize: 14,
  letterSpacing: '0.08em', textTransform: 'uppercase',
  minHeight: 52, lineHeight: 1.2,
}
const ghostBtn = {
  padding: '14px 24px', borderRadius: 999, cursor: 'pointer',
  background: 'transparent', color: 'rgba(255,255,255,0.7)',
  border: '1px solid rgba(255,255,255,0.28)', fontSize: 13,
  letterSpacing: '0.08em', textTransform: 'uppercase',
  minHeight: 48, lineHeight: 1.2,
}
const card = { border: '1px solid rgba(201,169,110,0.25)', background: 'rgba(201,169,110,0.05)', borderRadius: 14, padding: 'clamp(16px, 4.5vw, 20px)' }

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
   questions (A–E) → review → safety check → emergency | book
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
  const phoneBtn = isPhone ? { width: '100%', textAlign: 'center', padding: '16px 20px', boxSizing: 'border-box' } : {}

  const [stage, setStage] = useState('landing')
  const [qIndex, setQIndex] = useState(0)
  const [zones, setZones] = useState([])
  const [answers, setAnswers] = useState({})   // { q1: 'text'|'__other', q1_other: '' }
  const [flags, setFlags] = useState([])
  const [clearSignal, setClearSignal] = useState(0)
  const [fromReview, setFromReview] = useState(false)

  const drawOn = stage === 'draw'
  const modelSmall = ['intro', 'questions', 'review', 'safety', 'emergency', 'ok'].includes(stage)

  /* red flags relevant to the drawn areas (general + region-specific) */
  const redFlagList = useMemo(() => {
    const seen = new Set(); const list = []
    zones.forEach((z) => {
      const rk = ZONE_TO_REGION[z.type]
      if (rk && REGIONS[rk]) REGIONS[rk].redFlags.forEach((f) => { if (!seen.has(f.id)) { seen.add(f.id); list.push(f) } })
    })
    GENERAL_RED_FLAGS.forEach((f) => { if (!seen.has(f.id)) { seen.add(f.id); list.push(f) } })
    return list
  }, [zones])
  const pickedFlags = redFlagList.filter((f) => flags.includes(f.id))

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

  const restart = () => {
    setStage('landing'); setQIndex(0); setZones([]); setAnswers({}); setFlags([])
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
            display: grid; grid-template-columns: 1fr; gap: 8px;
            padding: 0 clamp(16px, 4vw, 48px) clamp(40px, 10vw, 56px);
            padding-left: max(clamp(16px, 4vw, 48px), env(safe-area-inset-left));
            padding-right: max(clamp(16px, 4vw, 48px), env(safe-area-inset-right));
            padding-bottom: calc(clamp(40px, 10vw, 56px) + env(safe-area-inset-bottom));
          }

          /* Phone: the body sits on top, sized off the *small* viewport unit so
             the browser chrome collapsing never crops it. */
          .pa-model { height: min(44svh, 400px); order: -1; }
          .pa-model.small { height: 148px; }

          /* Short phones (or landscape) — keep the panel readable. */
          @media (max-height: 700px) and (max-width: 899px) {
            .pa-model { height: min(38svh, 320px); }
            .pa-model.small { height: 120px; }
          }

          /* Action rows: primary spans the row, secondaries share the next. */
          .pa-actions { display: flex; gap: 10px; flex-wrap: wrap; }
          @media (max-width: 767px) {
            .pa-actions > .pa-primary { flex: 1 0 100%; }
            .pa-actions > button:not(.pa-primary),
            .pa-actions > a:not(.pa-primary) {
              flex: 1 1 0; min-width: 0;
              padding-left: 12px; padding-right: 12px; text-align: center;
            }
          }

          @media (min-width: 900px) {
            .pa-grid { grid-template-columns: ${modelSmall ? '1fr 320px' : '5fr 6fr'}; gap: 36px; align-items: center; }
            .pa-model { order: 2; height: min(78vh, 720px); }
            .pa-model.small { height: 380px; }
          }
        `}</style>

        {/* ── LEFT: the guided panel ── */}
        <div style={{ minWidth: 0, paddingTop: 8 }}>
          <AnimatePresence mode="wait">

            {/* LANDING — heading + Start only */}
            {stage === 'landing' && (
              <Fade k="landing">
                <h1 style={{ ...h2, fontSize: 'clamp(28px,7.5vw,52px)', margin: isPhone ? '4px 0 20px' : '12px 0 28px' }}>
                  Find the Possible Causes<br />of <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>Your Pain</em>
                </h1>
                <button style={{ ...goldBtn, ...phoneBtn }} onClick={() => setStage('rotate')}>Start</button>
              </Fade>
            )}

            {/* STEP 1 — TURN THE BODY */}
            {stage === 'rotate' && (
              <Fade k="rotate">
                <span style={label}>Step 1 of 2 · Turn the Body</span>
                <h2 style={{ ...h2, fontSize: 'clamp(24px,5.6vw,36px)', margin: '10px 0 10px' }}>
                  Turn the body <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>as required</em>
                </h2>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,0.7)', margin: '0 0 18px', maxWidth: 440 }}>
                  Drag the body to rotate it. You can view the front, back, left, or right side — turn it until you can see the area where you feel pain.
                </p>
                <div className="pa-actions">
                  <button className="pa-primary" style={{ ...goldBtn, ...phoneBtn }} onClick={() => setStage('draw')}>Next — Mark My Pain</button>
                  <button style={ghostBtn} onClick={restart}>Back</button>
                </div>
              </Fade>
            )}

            {/* STEP 2 — DRAW ALL PAINFUL AREAS */}
            {stage === 'draw' && (
              <Fade k="draw">
                <span style={label}>Step 2 of 2 · Mark Your Pain</span>
                <h2 style={{ ...h2, fontSize: 'clamp(24px,5.6vw,36px)', margin: '10px 0 10px' }}>
                  Draw on every <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>painful area</em>
                </h2>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,0.7)', margin: '0 0 16px', maxWidth: 440 }}>
                  Touch the body and draw a line where it hurts. You can mark one or several areas.
                </p>
                {zones.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
                    {zones.map((z) => (
                      <span key={z.id} style={pill}>{z.label}</span>
                    ))}
                  </div>
                )}
                <div className="pa-actions">
                  <button
                    className="pa-primary"
                    style={{ ...goldBtn, ...phoneBtn, opacity: zones.length ? 1 : 0.45, cursor: zones.length ? 'pointer' : 'not-allowed' }}
                    disabled={!zones.length}
                    onClick={() => setStage('intro')}
                  >Confirm</button>
                  {zones.length > 0 && (
                    <button style={ghostBtn} onClick={() => setClearSignal((n) => n + 1)}>Clear marks</button>
                  )}
                  <button style={ghostBtn} onClick={() => setStage('rotate')}>Back</button>
                </div>
                {!zones.length && (
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '12px 0 0' }}>
                    Draw at least one line on the body to continue.
                  </p>
                )}
              </Fade>
            )}

            {/* NOTICE BEFORE THE QUESTIONS */}
            {stage === 'intro' && (
              <Fade k="intro">
                <span style={label}>Before the Questions</span>
                <h2 style={{ ...h2, fontSize: 'clamp(24px,5.6vw,34px)', margin: '10px 0 12px' }}>
                  A few quick <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>questions</em>
                </h2>
                <div style={{ ...card, maxWidth: 480, marginBottom: 18 }}>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                    Please answer all questions as accurately as possible — your answers help the physiotherapist understand your pain properly. It takes less than 2 minutes.
                  </p>
                </div>
                <div className="pa-actions">
                  <button className="pa-primary" style={{ ...goldBtn, ...phoneBtn }} onClick={() => goToQuestion(0)}>Continue</button>
                  <button style={ghostBtn} onClick={() => setStage('draw')}>Back</button>
                </div>
              </Fade>
            )}

            {/* QUESTIONS — options A–D + E (Other, type manually) */}
            {stage === 'questions' && (() => {
              const q = QUESTIONS[qIndex]
              const a = answers[q.id]
              const isOther = a === '__other'
              const canNext = q.textarea
                ? true
                : (!!a && (!isOther || (answers[q.id + '_other'] || '').trim().length > 0))
              return (
                <Fade k={'q' + qIndex}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 480 }}>
                    <span style={label}>Question {qIndex + 1} of {QUESTIONS.length}</span>
                    <button onClick={() => { if (fromReview) { setFromReview(false); setStage('review') } else if (qIndex === 0) setStage('intro'); else setQIndex(qIndex - 1) }}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 12.5, cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '10px 4px 10px 14px', margin: '-10px -4px -10px 0', minHeight: 44 }}>← Back</button>
                  </div>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, margin: '10px 0 18px', maxWidth: 480 }}>
                    <motion.div animate={{ width: `${((qIndex + 1) / QUESTIONS.length) * 100}%` }} style={{ height: 3, background: GOLD, borderRadius: 2 }} />
                  </div>
                  <h2 style={{ ...h2, fontSize: 'clamp(22px,5vw,32px)', margin: '0 0 16px', maxWidth: 480 }}>{q.text}</h2>

                  {q.textarea ? (
                    <textarea
                      value={a || ''}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder={q.placeholder}
                      rows={5}
                      style={{
                        width: '100%', maxWidth: 480, resize: 'vertical', borderRadius: 14, boxSizing: 'border-box',
                        border: '1px solid rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.05)',
                        color: '#fff', padding: '14px 16px', fontSize: 16, lineHeight: 1.6, fontFamily: 'var(--font-body)',
                      }}
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 480 }}>
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
                        <span>Other — type your answer</span>
                      </button>
                      {isOther && (
                        <input
                          autoFocus
                          value={answers[q.id + '_other'] || ''}
                          onChange={(e) => setAnswer(q.id + '_other', e.target.value)}
                          placeholder="Type your answer here..."
                          style={{
                            borderRadius: 14, border: `1px solid ${GOLD}`, background: 'rgba(255,255,255,0.05)',
                            color: '#fff', padding: '15px 16px', fontSize: 16, fontFamily: 'var(--font-body)', boxSizing: 'border-box', minHeight: 52,
                          }}
                        />
                      )}
                    </div>
                  )}

                  <button
                    style={{ ...goldBtn, ...phoneBtn, marginTop: 20, opacity: canNext ? 1 : 0.45, cursor: canNext ? 'pointer' : 'not-allowed' }}
                    disabled={!canNext}
                    onClick={nextFromQuestion}
                  >{fromReview ? 'Save' : qIndex === QUESTIONS.length - 1 ? 'Review my answers' : 'Next'}</button>
                </Fade>
              )
            })()}

            {/* REVIEW & CONFIRM */}
            {stage === 'review' && (
              <Fade k="review">
                <span style={label}>Review &amp; Confirm</span>
                <h2 style={{ ...h2, fontSize: 'clamp(24px,5.6vw,34px)', margin: '10px 0 16px' }}>
                  Please check your <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>answers</em>
                </h2>
                <div style={{ ...card, marginBottom: 12, maxWidth: 520 }}>
                  <span style={{ ...label, fontSize: 10 }}>Pain areas</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {zones.map((z) => <span key={z.id} style={pill}>{z.label}</span>)}
                  </div>
                </div>
                {QUESTIONS.map((q, i) => (
                  <div key={q.id} style={{ ...card, marginBottom: 10, maxWidth: 520, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0 }}>{q.text}</p>
                      <p style={{ fontSize: 13.5, color: '#fff', margin: '5px 0 0', lineHeight: 1.5 }}>{answerText(q)}</p>
                    </div>
                    <button onClick={() => goToQuestion(i, true)}
                      style={{ background: 'none', border: 'none', color: GOLD, fontSize: 12.5, cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0, padding: '10px 2px 10px 12px', margin: '-10px -2px -10px 0', minHeight: 44, alignSelf: 'flex-start' }}>Change</button>
                  </div>
                ))}
                <button style={{ ...goldBtn, ...phoneBtn, marginTop: 12 }} onClick={() => setStage('safety')}>Confirm</button>
              </Fade>
            )}

            {/* SAFETY / DISCLAIMER + red-flag check */}
            {stage === 'safety' && (
              <Fade k="safety">
                <span style={label}>Important Information</span>
                <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', margin: '12px 0 10px', maxWidth: 520 }}>
                  This tool is intended to help you describe your symptoms and provide information for physiotherapy purposes. It is not a medical diagnosis and does not replace an assessment by a qualified healthcare professional.
                </p>
                <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', margin: '0 0 18px', maxWidth: 520 }}>
                  Some symptoms can require urgent medical attention. As a final safety check — do any of these apply to you right now?
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 520 }}>
                  {redFlagList.map((f) => {
                    const sel = flags.includes(f.id)
                    return (
                      <button key={f.id} style={chip(sel)}
                        onClick={() => setFlags((cur) => sel ? cur.filter((x) => x !== f.id) : [...cur, f.id])}>
                        {f.text}
                      </button>
                    )
                  })}
                </div>
                <div className="pa-actions" style={{ marginTop: 18 }}>
                  <button className="pa-primary" style={{ ...goldBtn, ...phoneBtn }}
                    onClick={() => setStage(flags.length ? 'emergency' : 'ok')}>
                    {flags.length ? 'Continue with selected' : 'None of these — continue'}
                  </button>
                  <button style={ghostBtn} onClick={() => setStage('review')}>Back</button>
                </div>
              </Fade>
            )}

            {/* EMERGENCY RESULT — Back button and the selected reasons ABOVE the warning */}
            {stage === 'emergency' && (
              <Fade k="emergency">
                <button style={{ ...ghostBtn, marginBottom: 14 }} onClick={() => setStage('safety')}>← Back</button>

                {pickedFlags.length > 0 && (
                  <div style={{ ...card, maxWidth: 520, marginBottom: 12 }}>
                    <span style={{ ...label, fontSize: 10 }}>You selected</span>
                    <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.8)' }}>
                      {pickedFlags.map((f) => <li key={f.id}>{f.text}</li>)}
                    </ul>
                  </div>
                )}

                <div style={{ ...card, borderColor: 'rgba(239,68,68,0.6)', background: 'rgba(239,68,68,0.08)', maxWidth: 520 }}>
                  <strong style={{ color: '#fca5a5', fontSize: 17 }}>Please Seek Urgent Medical Care</strong>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.82)', margin: '10px 0 0' }}>
                    Based on the symptoms you selected above, your condition may require urgent medical assessment. Please contact your local emergency service or seek immediate medical attention rather than relying on this physiotherapy assessment.
                  </p>
                </div>
                <p style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.45)', margin: '14px 0 0', maxWidth: 520 }}>
                  This is a cautious safety check — being flagged does not confirm something serious, but these symptoms should be checked by a doctor first. If you selected something by mistake, use Back to change it.
                </p>
                <button style={{ ...ghostBtn, marginTop: 16 }} onClick={restart}>Start again</button>
              </Fade>
            )}

            {/* NON-EMERGENCY RESULT */}
            {stage === 'ok' && (
              <Fade k="ok">
                <span style={label}>You Can Continue With Physiotherapy</span>
                <h2 style={{ ...h2, fontSize: 'clamp(24px,5.6vw,34px)', margin: '12px 0 12px' }}>
                  Book your <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>assessment</em>
                </h2>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.72)', margin: '0 0 20px', maxWidth: 480 }}>
                  Based on the information provided, you can continue with a physiotherapy assessment. Book an appointment with Physio Chandra to discuss your symptoms and receive a professional assessment.
                </p>
                <a href={BOOK_HREF} style={{ ...goldBtn, ...phoneBtn, textDecoration: 'none', display: 'inline-block', boxSizing: 'border-box' }}>
                  Book a Physio Chandra Appointment
                </a>
                <div>
                  <button style={{ ...ghostBtn, marginTop: 14 }} onClick={restart}>Start again</button>
                </div>
              </Fade>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT: the 3D model (shrinks after confirm, marks persist) ── */}
        <motion.div layout transition={{ duration: 0.55, ease: EASE }}
          className={'pa-model' + (modelSmall ? ' small' : '')}
          style={{ position: 'relative' }}>
          <Body3D
            onSelectionChange={setZones}
            controlled
            drawOn={drawOn}
            clearSignal={clearSignal}
          />
          {modelSmall && zones.length > 0 && (
            <p style={{ position: 'absolute', bottom: -2, left: 0, right: 0, textAlign: 'center', fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
              Your selected pain areas
            </p>
          )}
        </motion.div>
      </div>
    </section>
  )
}