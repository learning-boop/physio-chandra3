import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { scrub } from '../data/scrubText'

const GOLD = '#c9a96e'
const GOLD_LIGHT = '#e8d5b0'
const API_URL = import.meta.env.VITE_API_URL || ''
const MAX = 500

/* ── Feedback on the guide ────────────────────────────────────────────────
   At the very end of the results page, for everyone who reaches it
   (Chandra, 2 Oct 2026). Anonymous, optional, used only to improve the
   guide; never published or used as a testimonial (CHCPBC). Nothing is sent
   until the person confirms, in a separate dialogue, that they share it
   freely and without personal information. The server (api/feedback.js)
   also removes anything that looks like contact details. */
const SENSE = [
  { id: 'yes', label: 'Yes' }, { id: 'partly', label: 'Partly' },
  { id: 'no', label: 'No' }, { id: 'unsure', label: 'Not sure' },
]
const PARTS = [
  { id: 'drawing', label: 'Drawing on the body' }, { id: 'safety', label: 'The safety questions' },
  { id: 'questions', label: 'The questions about my pain' }, { id: 'results', label: 'The results' },
  { id: 'pdf', label: 'Saving the PDF' },
]
// Shown live while typing: a reminder, not a block (the server removes these too).
const LOOKS_PERSONAL = /[\w.+-]+@[\w-]+\.[\w-]+|(?:\d[\s().-]*){7,}|\b[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d\b|\bmy name is\b/i

export default function FeedbackForm({ context }) {
  const [ease, setEase] = useState(null)
  const [sense, setSense] = useState(null)
  const [confusing, setConfusing] = useState(null)
  const [parts, setParts] = useState([])
  const [comment, setComment] = useState('')
  const [attach, setAttach] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [state, setState] = useState('idle')   // idle | busy | done | error
  const dialogRef = useRef(null)

  const hasSomething = ease !== null || sense || confusing !== null || comment.trim()
  const personal = LOOKS_PERSONAL.test(comment)

  useEffect(() => {
    if (!confirmOpen) return undefined
    const onKey = (e) => { if (e.key === 'Escape') setConfirmOpen(false) }
    window.addEventListener('keydown', onKey)
    if (dialogRef.current) dialogRef.current.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [confirmOpen])

  const send = async () => {
    if (!confirmed || state === 'busy') return
    setState('busy')
    try {
      const res = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent: true, ease, sense, confusing, parts: confusing ? parts : [],
          // Contact details are taken out here, so they never leave the device.
          comment: scrub(comment),
          attach, context: attach ? context() : null,
        }),
      })
      setState(res.ok ? 'done' : 'error')
    } catch {
      setState('error')
    }
    setConfirmOpen(false)
  }

  if (state === 'done') {
    return (
      <div className="fb-card">
        <span className="fb-label">Feedback</span>
        <p className="fb-text">Thank you. Your anonymous feedback has been sent and will be used only to improve this guide.</p>
        <Style />
      </div>
    )
  }

  const choice = (sel) => `fb-chip${sel ? ' fb-on' : ''}`
  return (
    <div className="fb-card">
      <span className="fb-label">Help improve this guide · Optional feedback</span>
      <p className="fb-text">
        Your feedback helps make the guide clearer and its reasoning better. It is anonymous and optional, used only to
        improve this guide, and never published or used as a testimonial.
      </p>

      <p className="fb-q">How easy was the guide to use?</p>
      <div className="fb-row" role="group" aria-label="Ease of use, 1 to 5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} className={choice(ease === n)} aria-pressed={ease === n} onClick={() => setEase(ease === n ? null : n)}>{n}</button>
        ))}
        <span className="fb-scale">1 hard · 5 easy</span>
      </div>

      <p className="fb-q">Did the possible conditions make sense to you?</p>
      <div className="fb-row">
        {SENSE.map((o) => (
          <button key={o.id} className={choice(sense === o.id)} aria-pressed={sense === o.id} onClick={() => setSense(sense === o.id ? null : o.id)}>{o.label}</button>
        ))}
      </div>

      <p className="fb-q">Was anything confusing?</p>
      <div className="fb-row">
        <button className={choice(confusing === true)} aria-pressed={confusing === true} onClick={() => setConfusing(confusing === true ? null : true)}>Yes</button>
        <button className={choice(confusing === false)} aria-pressed={confusing === false} onClick={() => setConfusing(confusing === false ? null : false)}>No</button>
      </div>
      {confusing && (
        <div className="fb-row">
          {PARTS.map((o) => {
            const on = parts.includes(o.id)
            return <button key={o.id} className={choice(on)} aria-pressed={on} onClick={() => setParts(on ? parts.filter((x) => x !== o.id) : [...parts, o.id])}>{o.label}</button>
          })}
        </div>
      )}

      <label className="fb-q" htmlFor="fb-comment">Suggestions or comments <span className="fb-opt">(optional)</span></label>
      <p className="fb-warn-static">
        To protect your privacy, please do <strong>not</strong> include your name, contact information, Personal Health
        Number or any other identifying details. Comments are reviewed periodically and do not receive a reply. If you
        need care or advice, please contact a health professional directly.
      </p>
      <textarea id="fb-comment" className="fb-text-in" rows={4} maxLength={MAX} value={comment}
        onChange={(e) => setComment(e.target.value)} placeholder="What would make the guide clearer or more useful?" />
      <div className="fb-count">{comment.length}/{MAX}</div>
      {personal && <p className="fb-note fb-warn" role="status">This looks like it may include personal or contact details. Please remove them; anything like this is also removed before it is kept.</p>}

      <label className="fb-check">
        <input type="checkbox" checked={attach} onChange={(e) => setAttach(e.target.checked)} />
        <span>Also attach which areas I drew and which conditions I was shown (no answers), so this feedback can improve the reasoning.</span>
      </label>

      <button className="fb-btn" disabled={!hasSomething || state === 'busy'} onClick={() => { setConfirmed(false); setConfirmOpen(true) }}>
        Send feedback
      </button>
      {state === 'error' && <p className="fb-note fb-warn">It could not be sent just now. Nothing was saved. You can try again later.</p>}
      <p className="fb-small">
        If you need care: in an emergency call 911; for health advice call HealthLink BC on 8-1-1; if you are in crisis call or text 9-8-8.
        {' '}<Link to="/privacy" className="fb-link">Privacy notice</Link>
      </p>

      {confirmOpen && (
        <div className="fb-overlay" onClick={(e) => { if (e.target === e.currentTarget) setConfirmOpen(false) }}>
          <div className="fb-dialog" role="dialog" aria-modal="true" aria-labelledby="fb-dlg-title" tabIndex={-1} ref={dialogRef}>
            <h3 id="fb-dlg-title" className="fb-dlg-title">Before you send your feedback</h3>
            <p className="fb-text">Please read and confirm:</p>
            <ul className="fb-list">
              <li>I am sharing this feedback freely and entirely of my own choice.</li>
              <li>I have not included my name, contact details, health card number or any other personal information.</li>
              <li>I understand it is anonymous: it cannot be linked to me, will not be answered, and cannot be found or deleted later.</li>
              <li>I understand it is not a request for care or medical advice and is not monitored. For anything urgent I will call 911, HealthLink BC (8-1-1) or 9-8-8.</li>
              <li>I understand that sending feedback does not ask Physio Chandra or physiochandra.ca to take any action, and that it is used only to improve this guide, never published or used as a testimonial.</li>
            </ul>
            <p className="fb-small">
              This does not affect your rights. To raise a concern about your care, please contact Chandra directly, or the College of Health and Care Professionals of BC.
            </p>
            <label className="fb-check">
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
              <span>I confirm all of the above.</span>
            </label>
            <div className="fb-dlg-actions">
              <button className="fb-btn fb-primary" disabled={!confirmed || state === 'busy'} onClick={send}>
                {state === 'busy' ? 'Sending…' : 'Yes, send my feedback'}
              </button>
              <button className="fb-btn" onClick={() => setConfirmOpen(false)}>Go back</button>
            </div>
          </div>
        </div>
      )}
      <Style />
    </div>
  )
}

function Style() {
  return (
    <style>{`
      .fb-card { border: 1px solid rgba(201,169,110,0.25); background: rgba(201,169,110,0.05); border-radius: 14px;
        padding: clamp(16px, 4.5vw, 22px); margin: 14px 0; max-width: 520px; }
      .fb-label { font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase; color: ${GOLD}; display: inline-block; }
      .fb-text { font-size: 14.5px; line-height: 1.65; color: rgba(255,255,255,0.78); margin: 8px 0 12px; }
      .fb-q { display: block; font-size: 15px; color: #fff; margin: 16px 0 8px; line-height: 1.45; }
      .fb-opt { color: rgba(255,255,255,0.45); }
      .fb-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 0 0 6px; }
      .fb-chip { min-height: 44px; min-width: 44px; padding: 8px 14px; border-radius: 999px; cursor: pointer; font-size: 14.5px;
        font-family: var(--font-body); color: rgba(255,255,255,0.85); border: 1px solid rgba(255,255,255,0.28); background: transparent; }
      .fb-chip.fb-on { background: ${GOLD}; color: #081527; border-color: ${GOLD}; font-weight: 600; }
      .fb-scale { font-size: 12.5px; color: rgba(255,255,255,0.5); margin-left: 4px; }
      .fb-warn-static { font-size: 13.5px; line-height: 1.6; color: #fcd34d; margin: 0 0 8px; }
      .fb-warn-static strong { color: #fde68a; }
      .fb-text-in { width: 100%; box-sizing: border-box; resize: vertical; border-radius: 12px; border: 1px solid rgba(255,255,255,0.22);
        background: rgba(255,255,255,0.05); color: #fff; padding: 12px 14px; font-size: 16px; line-height: 1.55; font-family: var(--font-body); }
      .fb-count { font-size: 12px; color: rgba(255,255,255,0.45); text-align: right; margin-top: 4px; }
      .fb-check { display: flex; gap: 12px; align-items: flex-start; cursor: pointer; margin: 14px 0; font-size: 14.5px; line-height: 1.5; color: #fff; }
      .fb-check input { width: 22px; height: 22px; flex: none; margin: 1px 0 0; accent-color: ${GOLD}; cursor: pointer; }
      .fb-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 12px 22px; border-radius: 999px;
        font-family: var(--font-body); font-size: 13.5px; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
        color: rgba(255,255,255,0.85); border: 1px solid rgba(255,255,255,0.3); background: transparent; }
      .fb-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      .fb-primary { background: ${GOLD}; color: #081527; border-color: ${GOLD}; font-weight: 700; }
      .fb-note { font-size: 14px; line-height: 1.55; color: ${GOLD_LIGHT}; margin: 8px 0 0; }
      .fb-warn { color: #fcd34d; }
      .fb-small { font-size: 12.5px; line-height: 1.6; color: rgba(255,255,255,0.55); margin: 12px 0 0; }
      .fb-link { color: ${GOLD_LIGHT}; text-decoration: underline; }
      .fb-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(4,10,20,0.78); display: flex; align-items: center;
        justify-content: center; padding: 16px; }
      .fb-dialog { background: #0d2035; border: 1px solid rgba(201,169,110,0.4); border-radius: 16px; max-width: 520px; width: 100%;
        max-height: 90vh; overflow-y: auto; padding: clamp(18px, 5vw, 26px); outline: none; }
      .fb-dlg-title { font-family: var(--font-display); font-weight: 400; font-size: 24px; color: #fff; margin: 0 0 6px; }
      .fb-list { margin: 0 0 12px; padding-left: 20px; font-size: 14.5px; line-height: 1.6; color: rgba(255,255,255,0.85); }
      .fb-list li { margin-bottom: 6px; }
      .fb-dlg-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 6px; }
      @media (max-width: 560px) { .fb-btn { width: 100%; } }
    `}</style>
  )
}
