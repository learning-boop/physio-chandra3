import { useState } from 'react'
import { SUMMARY_EMAIL } from '../data/clinics'

const GOLD = '#c9a96e'
const GOLD_LIGHT = '#e8d5b0'
const MAIL_LIMIT = 1800   // longer mailto links are cut short by some mail apps

/* ── The summary for the physiotherapist ─────────────────────────────────
   Built entirely on the device from the answers already given (see
   ../data/clinicianSummary.js). The two actions lead (Chandra, 4 Oct 2026):
   Copy, and Email to the clinic chosen above (`clinic`, from ClinicPicker).
   The text itself is written in clinical language, so it sits behind
   "Show the summary": the patient can read it, but it is meant to travel
   with them to the appointment.

   Nothing is sent anywhere from here. Copy puts it on the clipboard; Email
   opens the person's own mail app with the text already written (and copies
   the full text too, in case the mail app shortens it), so they choose
   whether to send it. */
export default function ClinicianSummary({ text, clinic = null, code = '' }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mailed, setMailed] = useState(false)

  const toClipboard = async () => {
    try { await navigator.clipboard.writeText(text); return true } catch { return false }
  }
  const copy = async () => {
    if (await toClipboard()) { setCopied(true); setTimeout(() => setCopied(false), 2500) }
  }

  const to = (clinic && clinic.email) || SUMMARY_EMAIL
  const where = clinic ? `${clinic.name} (${clinic.area})` : ''
  const subject = ['Online assessment summary', where, code && `ref ${code}`].filter(Boolean).join(' · ')
  const long = text.length > MAIL_LIMIT
  const body = long ? `${text.slice(0, MAIL_LIMIT)}\n\n[The summary continues. I have it copied and can paste the rest or bring it to my appointment.]` : text
  const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  const onMail = () => { toClipboard().then((ok) => setMailed(ok)) }

  return (
    <section className="cs" aria-labelledby="cs-title">
      <div className="cs-top">
        <span className="cs-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24"><path fill={GOLD} d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1.5V8h4.5L14 3.5zM8 12h8v1.6H8V12zm0 3.5h8v1.6H8v-1.6zm0-7h4v1.6H8V8.5z" /></svg>
        </span>
        <div style={{ minWidth: 0 }}>
          <h3 id="cs-title" className="cs-title">Summary for your physiotherapist</h3>
          <p className="cs-sub">
            A clinical summary of your answers{code ? <>, with your reference code <strong>{code}</strong></> : ''}. Send it ahead or bring it,
            so your first appointment starts from what you have already told us. It stays on your device until you send it.
          </p>
        </div>
      </div>

      <div className="cs-actions">
        <button type="button" onClick={copy} className="cs-btn cs-primary">
          <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16 1H6a2 2 0 0 0-2 2v12h2V3h10V1zm3 4H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16h-9V7h9v14z" /></svg>
          {copied ? 'Copied to clipboard' : 'Copy summary'}
        </button>
        <a href={mailto} onClick={onMail} className="cs-btn cs-email">
          <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4.2-8 5-8-5V6l8 5 8-5v2.2z" /></svg>
          <span className="cs-email-text">{clinic ? <>Email to {clinic.name}<span className="cs-email-area">{clinic.area}</span></> : 'Email to Chandra'}</span>
        </a>
      </div>
      {!clinic && <p className="cs-hint">Choose your clinic above to send it there.</p>}
      {mailed && long && <p className="cs-hint cs-ok">The full summary is also copied: if your email looks cut short, paste it in.</p>}

      <button type="button" className="cs-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span aria-hidden="true">{open ? '▾' : '▸'}</span> {open ? 'Hide the summary' : 'Show the summary'}
      </button>
      {open && <pre className="cs-text">{text}</pre>}

      <style>{`
        .cs { max-width: 520px; margin-top: 26px; border-radius: 18px; padding: clamp(18px, 4.5vw, 24px);
          border: 1px solid rgba(201,169,110,0.45); background: linear-gradient(160deg, rgba(201,169,110,0.12), rgba(201,169,110,0.03));
          box-shadow: 0 10px 30px rgba(0,0,0,0.25); box-sizing: border-box; }
        .cs-top { display: flex; gap: 14px; align-items: flex-start; }
        .cs-icon { width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center;
          background: rgba(201,169,110,0.14); border: 1px solid rgba(201,169,110,0.35); }
        .cs-title { margin: 0; font-family: var(--font-display); font-weight: 500; font-size: clamp(21px, 5vw, 25px); color: #fff; line-height: 1.2; }
        .cs-sub { margin: 6px 0 0; font-size: 14.5px; line-height: 1.6; color: rgba(255,255,255,0.68); }
        .cs-sub strong { color: ${GOLD_LIGHT}; font-weight: 600; letter-spacing: 0.03em; }
        .cs-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 18px; }
        .cs-btn { display: inline-flex; align-items: center; justify-content: center; gap: 9px; min-height: 56px; padding: 12px 18px;
          border-radius: 14px; box-sizing: border-box; font-family: var(--font-body); font-size: 15px; font-weight: 700; letter-spacing: 0.02em;
          text-decoration: none; cursor: pointer; transition: transform 0.15s, background 0.15s; text-align: center; line-height: 1.25; }
        .cs-btn:active { transform: scale(0.98); }
        .cs-primary { background: ${GOLD}; color: #081527; border: 1px solid ${GOLD}; }
        .cs-email { background: rgba(201,169,110,0.16); color: ${GOLD_LIGHT}; border: 1.5px solid ${GOLD}; }
        .cs-email-text { display: flex; flex-direction: column; align-items: flex-start; text-align: left; }
        .cs-email-area { font-size: 12px; font-weight: 500; color: rgba(232,213,176,0.75); margin-top: 2px; letter-spacing: 0.04em; }
        .cs-hint { margin: 10px 2px 0; font-size: 13px; color: rgba(255,255,255,0.55); line-height: 1.5; }
        .cs-ok { color: ${GOLD_LIGHT}; }
        .cs-toggle { margin-top: 14px; background: none; border: 0; padding: 6px 0; cursor: pointer; color: ${GOLD}; font-family: var(--font-body);
          font-size: 14px; letter-spacing: 0.03em; min-height: 40px; }
        .cs-text { margin: 8px 0 0; padding: 14px 15px; border-radius: 10px; overflow: auto; max-height: 340px;
          background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.82);
          font-size: 12.5px; line-height: 1.6; white-space: pre-wrap; word-break: break-word;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
        @media (max-width: 480px) { .cs-actions { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  )
}
