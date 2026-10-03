import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { preloadPdf, pdfReady, buildResultsPdf, savePdf } from './resultsPdf'

const GOLD = '#c9a96e'
const GOLD_LIGHT = '#e8d5b0'
const API_URL = import.meta.env.VITE_API_URL || ''

/* ── Keeping the results ─────────────────────────────────────────────────
   On the results page only, i.e. for someone who completed the guide:
   • their reference code (20261011-004), also on the PDF and in the summary;
   • "Save as PDF": built on their device, nothing sent;
   • an unticked box to share an ANONYMOUS copy of the drawing and the
     answers chosen, to improve and train the guide (api/anon-share.js). The
     copy never carries the reference code, a name, contact details or
     anything typed in their own words. */
export default function SaveResults({ code, pdfData, anonPayload }) {
  const [pdfState, setPdfState] = useState('idle')      // idle | busy | done | error
  const [agree, setAgree] = useState(false)
  const [shareState, setShareState] = useState('idle')  // idle | busy | done | error

  useEffect(() => { preloadPdf().catch(() => {}) }, [])

  const onPdf = async () => {
    if (!code) return
    setPdfState('busy')
    try {
      if (!pdfReady()) await preloadPdf()
      const doc = buildResultsPdf(pdfData())
      const r = await savePdf(doc, `PhysioChandra-results-${code}.pdf`)
      setPdfState(r === 'cancelled' ? 'idle' : 'done')
    } catch (e) {
      // Kept in the browser console, so a failure can be traced.
      console.error('Results PDF could not be made:', e)
      setPdfState('error')
    }
  }

  const onShare = async () => {
    if (!agree || shareState === 'busy' || shareState === 'done') return
    setShareState('busy')
    try {
      const res = await fetch(`${API_URL}/api/anon-share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(anonPayload()),
      })
      setShareState(res.ok ? 'done' : 'error')
    } catch {
      setShareState('error')
    }
  }

  return (
    <div className="sr" style={{ maxWidth: 520 }}>
      <div className="sr-card">
        <span className="sr-label">Your reference code</span>
        <p className="sr-code" aria-live="polite">{code || 'Creating…'}</p>
        <p className="sr-text">
          Keep this code, or save your results below, and mention it when you book. It is only a
          reference for you and the clinic: it is not linked to your answers, and your answers are
          not stored with it.
        </p>
        <button className="sr-btn sr-primary" onClick={onPdf} disabled={!code || pdfState === 'busy'}>
          {pdfState === 'busy' ? 'Preparing…' : 'Save my results (PDF)'}
        </button>
        {pdfState === 'done' && <p className="sr-note">Your PDF is ready. On a phone, choose where to save or send it.</p>}
        {pdfState === 'error' && <p className="sr-note sr-warn">The PDF could not be made on this device. You can still copy the summary below.</p>}
        <p className="sr-small">The PDF is made on your device and is not sent anywhere.</p>
      </div>

      <div className="sr-card">
        <span className="sr-label">Help improve this guide · Optional</span>
        <p className="sr-text">
          You can choose to share an <strong>anonymous</strong> copy of your drawing and the answers
          you chose. We use it only to improve and train this guide.
        </p>
        <ul className="sr-list">
          <li>We do <strong>not</strong> save your name, contact details or any other personal information.</li>
          <li>Your reference code is <strong>not</strong> included, so the copy cannot be linked back to you.</li>
          <li>Anything you typed in your own words is <strong>not</strong> included.</li>
          <li>Copies are deleted after about two years. <Link to="/privacy" className="sr-link">Privacy notice</Link></li>
        </ul>
        <label className="sr-check">
          <input type="checkbox" checked={agree} disabled={shareState === 'done'}
            onChange={(e) => { setAgree(e.target.checked); if (shareState === 'error') setShareState('idle') }} />
          <span>I agree to share my drawing and answers anonymously.</span>
        </label>
        {shareState === 'done'
          ? <p className="sr-note">Thank you. Your anonymous answers have been shared.</p>
          : (
            <button className="sr-btn" onClick={onShare} disabled={!agree || shareState === 'busy'}>
              {shareState === 'busy' ? 'Sharing…' : 'Share anonymously'}
            </button>
          )}
        {shareState === 'error' && <p className="sr-note sr-warn">It could not be shared just now. Nothing was saved. You can try again later.</p>}
        <p className="sr-small">Nothing is shared unless you tick the box and press Share.</p>
      </div>

      <style>{`
        .sr-card {
          border: 1px solid rgba(201,169,110,0.25); background: rgba(201,169,110,0.05);
          border-radius: 14px; padding: clamp(16px, 4.5vw, 22px); margin: 0 0 14px;
        }
        .sr-label { font-size: 13px; letter-spacing: 0.18em; text-transform: uppercase; color: ${GOLD}; display: inline-block; }
        .sr-code {
          font-size: clamp(26px, 7vw, 32px); color: #fff; font-weight: 600; letter-spacing: 0.06em;
          margin: 8px 0 6px; font-variant-numeric: tabular-nums;
        }
        .sr-text { font-size: 14.5px; line-height: 1.65; color: rgba(255,255,255,0.78); margin: 8px 0 12px; }
        .sr-text strong, .sr-list strong { color: #fff; }
        .sr-list { margin: 0 0 14px; padding-left: 20px; font-size: 14.5px; line-height: 1.65; color: rgba(255,255,255,0.78); }
        .sr-list li { margin-bottom: 4px; }
        .sr-link { color: ${GOLD_LIGHT}; text-decoration: underline; }
        .sr-check { display: flex; gap: 12px; align-items: flex-start; cursor: pointer; margin: 0 0 14px;
          font-size: 15px; line-height: 1.5; color: #fff; }
        .sr-check input { width: 22px; height: 22px; flex: none; margin: 1px 0 0; accent-color: ${GOLD}; cursor: pointer; }
        .sr-btn {
          display: inline-flex; align-items: center; justify-content: center; min-height: 48px;
          padding: 12px 22px; border-radius: 999px; font-family: var(--font-body); font-size: 13.5px;
          letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
          color: rgba(255,255,255,0.85); border: 1px solid rgba(255,255,255,0.3); background: transparent;
        }
        .sr-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .sr-primary { background: ${GOLD}; color: #081527; border-color: ${GOLD}; font-weight: 700; }
        .sr-note { font-size: 14px; line-height: 1.55; color: ${GOLD_LIGHT}; margin: 10px 0 0; }
        .sr-warn { color: #fcd34d; }
        .sr-small { font-size: 12.5px; line-height: 1.55; color: rgba(255,255,255,0.5); margin: 10px 0 0; }
        @media (max-width: 560px) { .sr-btn { width: 100%; } }
      `}</style>
    </div>
  )
}
