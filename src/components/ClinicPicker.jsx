import { useState } from 'react'
import { CLINICS, telHref } from '../data/clinics'

const GOLD = '#c9a96e'
const GOLD_LIGHT = '#e8d5b0'

/* ── Booking step: pick a clinic, then call it or book online (Jane) ─────
   The person chooses where they would like to be seen; the choice reveals
   that clinic's own phone number and, once its Jane link is set in
   ../data/clinics.js, its online-booking page. Booking happens on the
   clinic's side, so no health information leaves this device from here. */
export default function ClinicPicker() {
  const [picked, setPicked] = useState(null)
  const clinic = CLINICS.find((c) => c.id === picked)

  return (
    <div style={{ maxWidth: 520 }}>
      <div role="radiogroup" aria-label="Choose a clinic" style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {CLINICS.map((c) => {
          const sel = c.id === picked
          return (
            <button key={c.id} role="radio" aria-checked={sel}
              onClick={() => setPicked(sel ? null : c.id)}
              style={{
                padding: '14px 18px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                minHeight: 56, width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-body)',
                border: `1px solid ${sel ? GOLD : 'rgba(255,255,255,0.22)'}`,
                background: sel ? 'rgba(201,169,110,0.18)' : 'rgba(255,255,255,0.04)',
                transition: 'all 0.15s',
              }}>
              <span style={{ display: 'block', fontSize: 16.5, color: sel ? GOLD_LIGHT : 'rgba(255,255,255,0.9)', lineHeight: 1.4 }}>{c.name}</span>
              <span style={{ display: 'block', fontSize: 13.5, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{c.area}</span>
            </button>
          )
        })}
      </div>

      {clinic && (
        <div style={{
          marginTop: 12, borderRadius: 14, padding: 'clamp(16px, 4.5vw, 22px)',
          border: '1px solid rgba(201,169,110,0.25)', background: 'rgba(201,169,110,0.05)',
        }}>
          <p style={{ fontSize: 16, color: GOLD_LIGHT, margin: 0, fontWeight: 500 }}>{clinic.name}</p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: '6px 0 0', lineHeight: 1.6 }}>{clinic.address}</p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: '6px 0 0', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{clinic.hours}</p>

          <div className="cp-actions">
            {clinic.janeUrl && (
              <a href={clinic.janeUrl} target="_blank" rel="noopener noreferrer" className="cp-btn cp-primary">
                Book Online
              </a>
            )}
            <a href={telHref(clinic.phone)} className={'cp-btn' + (clinic.janeUrl ? '' : ' cp-primary')}>
              Call {clinic.phone}
            </a>
          </div>
          {!clinic.janeUrl && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: '10px 0 0' }}>
              Online booking for this clinic is coming soon — please call to book.
            </p>
          )}
        </div>
      )}

      <style>{`
        .cp-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
        .cp-btn {
          display: inline-flex; align-items: center; justify-content: center;
          min-height: 52px; padding: 14px 24px; border-radius: 999px; box-sizing: border-box;
          font-family: var(--font-body); font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase;
          text-decoration: none; color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.28);
        }
        .cp-primary { background: ${GOLD}; color: #081527; border-color: ${GOLD}; font-weight: 700; }
        @media (max-width: 560px) { .cp-actions { flex-direction: column; } .cp-btn { width: 100%; } }
      `}</style>
    </div>
  )
}
