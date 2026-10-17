/* The matched conditions on the results (Chandra, 17 Oct 2026): the top two
   side by side as name tiles, the closest match first and highlighted, then
   for each: why it may fit (the patient's own answers that pointed to it),
   what people often notice, what often helps, how physiotherapy helps, and
   when to get it checked. On a phone the details of the tile chosen show
   below the tiles (a tap switches); on a wide screen both sit side by side. */
import { useState } from 'react'

const GOLD = '#c9a96e'
const GOLD_LIGHT = '#e8d5b0'

/* Until a condition has its own text (content/conditions/*.md, physioHelps). */
const PHYSIO_DEFAULT = [
  'A physiotherapist can assess how you move and explain in plain words what is likely going on.',
  'Treatment is mostly active: exercises and advice suited to you and this problem.',
  'You get a plan for daily life, work or sport, and for any flare-ups.',
]

function Section({ title, items, tone }) {
  if (!items || !items.length) return null
  return (
    <div className={'rc-sec' + (tone ? ' rc-' + tone : '')}>
      <div className="rc-sec-title">{title}</div>
      <ul>{items.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </div>
  )
}

export default function ResultsConditions({ shown, multiArea, regionName, reasons }) {
  const [pick, setPick] = useState(0)
  const top = shown.slice(0, 2)
  const sel = Math.min(pick, top.length - 1)
  return (
    <div className="rc">
      {top.length > 1 && (
        <div className="rc-tiles" role="tablist" aria-label="Possible matches">
          {top.map(({ c, rk }, i) => (
            <button key={`${rk}/${c.id}`} role="tab" aria-selected={sel === i} className={'rc-tile' + (sel === i ? ' on' : '')} onClick={() => setPick(i)}>
              <span className="rc-badge">{i === 0 ? '★ Closest match' : 'Also possible'}</span>
              <span className="rc-name">{c.name}</span>
              {multiArea && <span className="rc-area">{regionName(rk)}</span>}
            </button>
          ))}
        </div>
      )}
      <div className={'rc-cols' + (top.length > 1 ? ' two' : '')}>
        {top.map(({ c, rk }, i) => {
          const why = reasons(rk, c.id)
          return (
            <article key={`${rk}/${c.id}`} className={'rc-card' + (sel === i ? ' on' : '')} aria-label={c.name}>
              {/* The name again on each card: on a wide screen it heads its
                  column; on a phone it shows only when there is one match. */}
              <h3 className={'rc-title' + (top.length > 1 ? ' rc-title-wide' : '')}>
                {top.length === 1 && <span className="rc-badge">★ Closest match</span>}
                {top.length > 1 && <span className="rc-badge">{i === 0 ? '★ Closest match' : 'Also possible'}</span>}
                {c.name}
                {multiArea && <span className="rc-area">{regionName(rk)}</span>}
              </h3>
              {c.doctorFirst && <p className="rc-doctor">{c.doctorFirst}</p>}
              <p className="rc-blurb">{c.blurb}</p>
              {why.length > 0 && <Section title="Why this may fit you" items={why} tone="why" />}
              <Section title="What people often notice" items={c.noticed} />
              <Section title="What often helps" items={c.homeCare} />
              <Section title="How physiotherapy helps" items={c.physioHelps && c.physioHelps.length ? c.physioHelps : PHYSIO_DEFAULT} tone="physio" />
              <Section title="Get it checked if" items={c.seePhysioIf} />
            </article>
          )
        })}
      </div>
      <style>{`
        .rc { max-width: 920px; margin: 0 0 18px; }
        .rc-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
        .rc-tile {
          display: flex; flex-direction: column; align-items: flex-start; gap: 6px; text-align: left; cursor: pointer;
          padding: 12px 12px 14px; border-radius: 14px; font: inherit; color: #fff; min-height: 92px;
          background: rgba(255,255,255,0.04); border: 1.5px solid rgba(201,169,110,0.35);
        }
        .rc-tile.on { background: rgba(201,169,110,0.2); border-color: ${GOLD}; box-shadow: 0 0 0 1px ${GOLD} inset; }
        .rc-badge { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: ${GOLD_LIGHT}; }
        .rc-name { font-size: clamp(16px, 4.3vw, 19px); font-weight: 700; line-height: 1.3; }
        .rc-area { display: block; font-size: 12.5px; color: rgba(255,255,255,0.6); font-weight: 400; margin-top: 2px; }
        .rc-cols { display: grid; grid-template-columns: 1fr; gap: 14px; }
        .rc-card {
          border: 1px solid rgba(201,169,110,0.28); background: rgba(201,169,110,0.05); border-radius: 16px;
          padding: clamp(16px, 4.5vw, 22px);
        }
        .rc-cols.two .rc-card:not(.on) { display: none; }
        .rc-title { margin: 0; font-size: clamp(19px, 4.6vw, 22px); line-height: 1.35; color: #fff; font-weight: 700;
          background: rgba(201,169,110,0.22); border-left: 4px solid ${GOLD}; border-radius: 8px; padding: 10px 14px; }
        .rc-title .rc-badge { display: block; margin-bottom: 4px; }
        .rc-title-wide { display: none; }
        .rc-doctor { font-size: 14.5px; line-height: 1.55; color: #fcd34d; margin: 12px 0 0; padding: 10px 12px; border: 1px solid rgba(245,158,11,0.55); background: rgba(245,158,11,0.07); border-radius: 10px; }
        .rc-blurb { font-size: 15px; line-height: 1.65; color: rgba(255,255,255,0.85); margin: 12px 0 0; }
        .rc-sec { margin-top: 14px; }
        .rc-sec-title { font-size: 11.5px; letter-spacing: 0.14em; text-transform: uppercase; color: ${GOLD}; margin-bottom: 6px; }
        .rc-sec ul { margin: 0; padding-left: 18px; font-size: 14.5px; line-height: 1.65; color: rgba(255,255,255,0.82); }
        .rc-sec li { margin-bottom: 4px; }
        .rc-why { padding: 10px 12px; border-radius: 12px; background: rgba(255,255,255,0.04); }
        .rc-physio { padding: 12px 14px; border-radius: 12px; background: rgba(125,216,211,0.08); border: 1px solid rgba(125,216,211,0.35); }
        .rc-physio .rc-sec-title { color: #7DD8D3; }
        /* Wide screens: both cards side by side, each headed by its name. */
        @media (min-width: 1100px) {
          .rc-tiles { display: none; }
          .rc-cols.two { grid-template-columns: 1fr 1fr; align-items: start; }
          .rc-cols.two .rc-card:not(.on) { display: block; }
          .rc-title-wide { display: block; }
          .rc-cols.two .rc-card:first-child { border-color: ${GOLD}; }
        }
      `}</style>
    </div>
  )
}
