import { useState } from 'react'
import { CLINICS, telHref, kmBetween, directionsHref } from '../data/clinics'

const GOLD = '#c9a96e'
const GOLD_LIGHT = '#e8d5b0'

/* ── Booking step: choose the clinic nearest you, then call or book ──────
   People choose by AREA, so the area leads: a small sketch of the three
   areas (pins select), then one card per clinic with the area as its
   heading and the neighbouring communities beneath. "Find my nearest
   clinic" asks the browser for the visitor's location, measures the
   straight-line distance to each area on this device, and selects the
   closest; the location is never saved or sent. The chosen card opens to
   its hours, Call, Book online (once its Jane link is set in
   ../data/clinics.js) and Directions. Booking happens on the clinic's side,
   so no health information leaves this device from here. */

const PinIcon = ({ size = 16, color = GOLD }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill={color} />
  </svg>
)

/* The area sketch: not to scale, for orientation only. */
function AreaMap({ picked, nearest, onPick }) {
  return (
    <div className="cp-map">
      <svg viewBox="0 0 520 230" role="img" aria-label="Sketch of the three clinic areas: Burnaby in the north-west, Guildford in North Surrey across the Fraser River, and South Surrey to the south near White Rock">
        {/* The Fraser River and the border give the sketch its bearings. */}
        <path d="M0,140 C110,132 200,112 290,84 S440,52 520,46" fill="none" stroke="rgba(120,170,220,0.35)" strokeWidth="9" strokeLinecap="round" />
        <text x="196" y="132" fill="rgba(140,185,230,0.55)" fontSize="11" fontStyle="italic" transform="rotate(-12 196 132)">Fraser River</text>
        <line x1="0" y1="218" x2="520" y2="218" stroke="rgba(255,255,255,0.18)" strokeDasharray="5 6" />
        <text x="512" y="212" textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="10.5">Canada · USA border</text>
        <text x="22" y="40" fill="rgba(255,255,255,0.28)" fontSize="11.5">Vancouver</text>
        <text x="462" y="150" fill="rgba(255,255,255,0.28)" fontSize="11.5" textAnchor="middle">Langley</text>
        <text x="222" y="200" fill="rgba(255,255,255,0.28)" fontSize="11.5" textAnchor="middle">White Rock</text>
        {CLINICS.map((c) => {
          const sel = c.id === picked
          const { x, y } = c.map
          return (
            <g key={c.id} onClick={() => onPick(c.id)} style={{ cursor: 'pointer' }} aria-hidden="true">
              {sel && <circle cx={x} cy={y} r="22" fill="rgba(201,169,110,0.18)" stroke="rgba(201,169,110,0.5)" />}
              <circle cx={x} cy={y} r={sel ? 9 : 7} fill={sel ? GOLD : '#0b1d33'} stroke={GOLD} strokeWidth="2.5" />
              <text x={x + 16} y={y + 5} fill={sel ? GOLD_LIGHT : 'rgba(255,255,255,0.85)'} fontSize="15" fontWeight={sel ? 700 : 500}>{c.area}</text>
              {nearest === c.id && <text x={x + 16} y={y + 21} fill={GOLD} fontSize="10.5" letterSpacing="0.08em">NEAREST TO YOU</text>}
            </g>
          )
        })}
      </svg>
      <p className="cp-map-note">Sketch for orientation, not to scale.</p>
    </div>
  )
}

export default function ClinicPicker() {
  const [picked, setPicked] = useState(null)
  const [dist, setDist] = useState(null)     // { [clinicId]: km } once located
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState('')

  const nearest = dist ? CLINICS.reduce((a, b) => (dist[a.id] <= dist[b.id] ? a : b)).id : null
  const pick = (id) => setPicked((cur) => (cur === id ? null : id))

  const findNearest = () => {
    setLocError('')
    if (!('geolocation' in navigator)) { setLocError('Your browser cannot share a location. Please choose the area nearest you below.'); return }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        const d = Object.fromEntries(CLINICS.map((c) => [c.id, kmBetween(here, c)]))
        setDist(d)
        setPicked(CLINICS.reduce((a, b) => (d[a.id] <= d[b.id] ? a : b)).id)
        setLocating(false)
      },
      () => { setLocating(false); setLocError('We could not get your location. Please choose the area nearest you below.') },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    )
  }

  return (
    <div className="cp" style={{ maxWidth: 520 }}>
      <AreaMap picked={picked} nearest={nearest} onPick={pick} />

      <div className="cp-locate">
        <button type="button" className="cp-locate-btn" onClick={findNearest} disabled={locating}>
          <PinIcon size={15} />
          <span>{locating ? 'Finding your nearest clinic…' : dist ? 'Update my location' : 'Find my nearest clinic'}</span>
        </button>
        <span className="cp-locate-note">Uses your location on this device only; it is not saved or sent.</span>
      </div>
      {locError && <p className="cp-error" role="status">{locError}</p>}

      <div role="radiogroup" aria-label="Choose the clinic nearest you" className="cp-list">
        {/* Once located, nearest first, so the chosen card is on top. */}
        {(dist ? [...CLINICS].sort((a, b) => dist[a.id] - dist[b.id]) : CLINICS).map((c) => {
          const sel = c.id === picked
          const km = dist ? dist[c.id] : null
          return (
            <div key={c.id} className={'cp-card' + (sel ? ' cp-sel' : '')}>
              <button type="button" role="radio" aria-checked={sel} onClick={() => pick(c.id)} className="cp-head">
                <span className="cp-radio" aria-hidden="true">{sel && <span />}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="cp-area"><PinIcon size={15} />{c.area}</span>
                  <span className="cp-name">{c.name}</span>
                  <span className="cp-near">Near {c.near}</span>
                </span>
                {km !== null && (
                  <span className={'cp-km' + (nearest === c.id ? ' cp-km-near' : '')}>
                    {nearest === c.id && <span className="cp-km-tag">Nearest</span>}
                    about {km < 10 ? km.toFixed(1) : Math.round(km)} km
                  </span>
                )}
              </button>

              {sel && (
                <div className="cp-body">
                  <div className="cp-facts">
                    <div>
                      <p className="cp-label">Hours</p>
                      <p className="cp-val" style={{ whiteSpace: 'pre-line' }}>{c.hours}</p>
                    </div>
                    <div>
                      <p className="cp-label">Phone</p>
                      <p className="cp-val">{c.phone}</p>
                    </div>
                  </div>
                  <div className="cp-actions">
                    {c.janeUrl && (
                      <a href={c.janeUrl} target="_blank" rel="noopener noreferrer" className="cp-btn cp-primary">Book Online</a>
                    )}
                    <a href={telHref(c.phone)} className={'cp-btn' + (c.janeUrl ? '' : ' cp-primary')}>Call to Book</a>
                    <a href={directionsHref(c)} target="_blank" rel="noopener noreferrer" className="cp-btn">Directions</a>
                  </div>
                  {!c.janeUrl && (
                    <p className="cp-soon">Online booking for this clinic is coming soon. Please call to book.</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <style>{`
        .cp-map { border-radius: 16px; border: 1px solid rgba(201,169,110,0.22); background: linear-gradient(160deg, rgba(201,169,110,0.06), rgba(255,255,255,0.02)); padding: 10px 10px 6px; }
        .cp-map svg { display: block; width: 100%; height: auto; font-family: var(--font-body); }
        .cp-map-note { margin: 2px 6px 2px; font-size: 11.5px; color: rgba(255,255,255,0.38); text-align: right; }
        .cp-locate { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin: 14px 0 4px; }
        .cp-locate-btn { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; padding: 10px 18px; border-radius: 999px; cursor: pointer;
          border: 1px solid ${GOLD}; background: transparent; color: ${GOLD_LIGHT}; font-family: var(--font-body); font-size: 14px; letter-spacing: 0.03em; }
        .cp-locate-btn:disabled { opacity: 0.6; cursor: progress; }
        .cp-locate-note { font-size: 12.5px; color: rgba(255,255,255,0.45); line-height: 1.5; }
        .cp-error { margin: 8px 0 0; font-size: 13.5px; color: #fcd34d; }
        .cp-list { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
        .cp-card { border-radius: 16px; border: 1px solid rgba(255,255,255,0.16); background: rgba(255,255,255,0.03); transition: border-color 0.2s, background 0.2s; overflow: hidden; }
        .cp-card.cp-sel { border-color: ${GOLD}; background: rgba(201,169,110,0.08); box-shadow: 0 0 0 1px rgba(201,169,110,0.35); }
        .cp-head { display: flex; align-items: center; gap: 14px; width: 100%; padding: 16px 18px; background: none; border: 0; cursor: pointer; text-align: left; font-family: var(--font-body); }
        .cp-radio { width: 20px; height: 20px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.4); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cp-sel .cp-radio { border-color: ${GOLD}; }
        .cp-radio span { width: 10px; height: 10px; border-radius: 50%; background: ${GOLD}; }
        .cp-area { display: flex; align-items: center; gap: 7px; font-size: 19px; font-weight: 700; color: #fff; line-height: 1.25; letter-spacing: 0.01em; }
        .cp-sel .cp-area { color: ${GOLD_LIGHT}; }
        .cp-name { display: block; font-size: 15px; color: rgba(255,255,255,0.8); margin-top: 3px; }
        .cp-near { display: block; font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 3px; line-height: 1.45; }
        .cp-km { flex-shrink: 0; text-align: right; font-size: 13px; color: rgba(255,255,255,0.55); display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
        .cp-km-near { color: ${GOLD_LIGHT}; }
        .cp-km-tag { font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: #081527; background: ${GOLD}; border-radius: 999px; padding: 3px 9px; font-weight: 700; }
        .cp-body { padding: 0 18px 18px 52px; }
        .cp-facts { display: flex; gap: 28px; flex-wrap: wrap; border-top: 1px solid rgba(201,169,110,0.2); padding-top: 14px; }
        .cp-label { margin: 0 0 4px; font-size: 11.5px; letter-spacing: 0.16em; text-transform: uppercase; color: ${GOLD}; }
        .cp-val { margin: 0; font-size: 14px; color: rgba(255,255,255,0.75); line-height: 1.6; }
        .cp-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
        .cp-btn {
          display: inline-flex; align-items: center; justify-content: center;
          min-height: 48px; padding: 12px 22px; border-radius: 999px; box-sizing: border-box;
          font-family: var(--font-body); font-size: 13.5px; letter-spacing: 0.08em; text-transform: uppercase;
          text-decoration: none; color: rgba(255,255,255,0.85); border: 1px solid rgba(255,255,255,0.28);
        }
        .cp-primary { background: ${GOLD}; color: #081527; border-color: ${GOLD}; font-weight: 700; }
        .cp-soon { margin: 10px 0 0; font-size: 13px; color: rgba(255,255,255,0.45); }
        @media (max-width: 560px) {
          .cp-body { padding: 0 16px 16px 16px; }
          .cp-head { padding: 14px 16px; gap: 12px; }
          .cp-actions { flex-direction: column; }
          .cp-btn { width: 100%; }
        }
      `}</style>
    </div>
  )
}
