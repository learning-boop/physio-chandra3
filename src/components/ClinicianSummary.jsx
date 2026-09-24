import { useState } from 'react'

const GOLD = '#c9a96e'
const GOLD_LIGHT = '#e8d5b0'

/* ── The summary for the physiotherapist ─────────────────────────────────
   Built entirely on the device from the answers already given (see
   ../data/clinicianSummary.js). It is shown behind a disclosure because it is
   written in clinical language: the patient can open it — it is their own
   information — but it is meant to travel with them to the appointment.

   Nothing is sent anywhere from here. Copy puts it on the clipboard for the
   clinic's booking notes; Email opens the person's own mail app with the text
   already written, so they choose whether to send it. */
export default function ClinicianSummary({ text, email = 'chandra@physiochandra.ca' }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      setCopied(false)
    }
  }
  const mailto = `mailto:${email}?subject=${encodeURIComponent('Online assessment summary')}&body=${encodeURIComponent(text.slice(0, 1800))}`

  return (
    <div style={{ maxWidth: 520, marginTop: 22 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: '100%', textAlign: 'left', cursor: 'pointer', minHeight: 56,
          padding: '15px 18px', borderRadius: 14, boxSizing: 'border-box',
          border: '1px solid rgba(201,169,110,0.3)', background: 'rgba(201,169,110,0.06)',
          color: GOLD_LIGHT, fontSize: 15.5, fontFamily: 'var(--font-body)', lineHeight: 1.45,
          display: 'flex', alignItems: 'center', gap: 10,
        }}
      >
        <span style={{ color: GOLD, fontSize: 13 }}>{open ? '▾' : '▸'}</span>
        <span>Summary for your physiotherapist</span>
      </button>

      {open && (
        <div style={{
          border: '1px solid rgba(255,255,255,0.14)', borderTop: 'none',
          borderRadius: '0 0 14px 14px', padding: 'clamp(14px, 4vw, 18px)',
          background: 'rgba(255,255,255,0.03)',
        }}>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,0.6)', margin: '0 0 12px' }}>
            This is written in clinical language for your physiotherapist. Bring it to your
            appointment, paste it into the clinic's booking notes, or email it ahead.
            It stays on your device until you send it.
          </p>
          <pre style={{
            margin: 0, padding: '14px 15px', borderRadius: 10, overflowX: 'auto',
            background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.82)', fontSize: 12.5, lineHeight: 1.6,
            whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 340, overflowY: 'auto',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          }}>{text}</pre>
          <div className="cs-actions">
            <button onClick={copy} className="cs-btn cs-primary">{copied ? 'Copied' : 'Copy summary'}</button>
            <a href={mailto} className="cs-btn">Email it to the clinic</a>
          </div>
        </div>
      )}

      <style>{`
        .cs-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
        .cs-btn {
          display: inline-flex; align-items: center; justify-content: center;
          min-height: 48px; padding: 12px 22px; border-radius: 999px; box-sizing: border-box;
          font-family: var(--font-body); font-size: 13.5px; letter-spacing: 0.06em;
          text-transform: uppercase; text-decoration: none; cursor: pointer;
          color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.28);
          background: transparent;
        }
        .cs-primary { background: ${GOLD}; color: #081527; border-color: ${GOLD}; font-weight: 700; }
        @media (max-width: 560px) { .cs-actions { flex-direction: column; } .cs-btn { width: 100%; } }
      `}</style>
    </div>
  )
}
