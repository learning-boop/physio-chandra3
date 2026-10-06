/* The "How it works" page as pictures (Chandra, 6 Oct 2026): no 3D body here,
   three picture cards for the three steps and three small tiles for moving
   the body. The pictures are drawn in code (sharp at any size, nothing to
   load) and their words follow the device: swipe and pinch on a phone, drag
   and scroll on a computer. They move slowly in a loop; with "reduce motion"
   set, they stand still. The 3D body first appears on the next page. */

const GOLD = '#c9a96e'
const GOLD_LIGHT = '#e8d5b0'
const CORAL = '#f0806c'
const LINE = 'rgba(255,255,255,0.55)'
const FILL = 'rgba(255,255,255,0.07)'

/* A simple front-facing body outline, 60 wide and 120 tall. */
function Body({ x = 0, y = 0, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={FILL} stroke={LINE} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
      <circle cx="30" cy="11" r="9" />
      <path d="M17 26 Q30 21 43 26 L46 64 Q30 68 14 64 Z" />
      <path d="M17 28 L7 52 L9 62" fill="none" />
      <path d="M43 28 L53 52 L51 62" fill="none" />
      <path d="M20 66 L18 116" fill="none" />
      <path d="M40 66 L42 116" fill="none" />
    </g>
  )
}

function TurnPic({ phone }) {
  return (
    <svg viewBox={phone ? '0 0 200 150' : '0 0 200 160'} className="gs-pic" role="img"
      aria-label={phone ? 'A body with arrows around it and a finger sliding sideways to turn it' : 'A body with arrows around it, and a mouse and a touchpad sliding sideways to turn it'}>
      <defs>
        <marker id="gs-ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1 1 L9 5 L1 9 Z" fill={GOLD} />
        </marker>
      </defs>
      <Body x={70} y={6} s={1} />
      {/* The body spins: an arc behind it with arrowheads at both ends. */}
      <path d="M48 70 Q100 40 152 70" fill="none" stroke={GOLD} strokeWidth="2.5" strokeDasharray="4 5" markerStart="url(#gs-ah)" markerEnd="url(#gs-ah)" />
      {/* The gesture: a finger sliding (phone), or a mouse and a touchpad
          side by side (computer). */}
      {phone ? (
        <g className="gs-slide">
          <path d="M78 138 H122" stroke={GOLD} strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <circle cx="100" cy="138" r="8" fill={GOLD_LIGHT} stroke={GOLD} strokeWidth="2" />
        </g>
      ) : <g transform="translate(40 128) scale(1)"><Devices y={0} kind="spin" /></g>}
    </svg>
  )
}

function DrawPic() {
  return (
    <svg viewBox="0 0 200 150" className="gs-pic" role="img" aria-label="A body with a line being traced over the sore knee and down the shin">
      <Body x={70} y={6} s={1} />
      {/* A line traced over the right knee and down the shin. */}
      <path className="gs-draw" d="M111 92 q6 8 0 16 q-6 8 1 18" fill="none" stroke={CORAL} strokeWidth="4.5" strokeLinecap="round" />
      <circle className="gs-pen" cx="112" cy="126" r="5" fill={GOLD_LIGHT} stroke={GOLD} strokeWidth="1.5" />
    </svg>
  )
}

function QuestionsPic() {
  const row = (y, on) => (
    <g key={y}>
      <rect x="44" y={y} width="112" height="26" rx="8" fill={on ? 'rgba(201,169,110,0.20)' : FILL} stroke={on ? GOLD : LINE} strokeWidth="1.8" />
      <rect x="54" y={y + 7} width="12" height="12" rx="3" fill="none" stroke={on ? GOLD : LINE} strokeWidth="1.6" />
      {on && <path className="gs-tick" d={`M56 ${y + 13} l3.5 3.5 l6 -7`} fill="none" stroke={GOLD_LIGHT} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />}
      <rect x="74" y={y + 10} width={on ? 64 : 54} height="6" rx="3" fill={on ? GOLD_LIGHT : 'rgba(255,255,255,0.35)'} />
    </g>
  )
  return (
    <svg viewBox="0 0 200 150" className="gs-pic" role="img" aria-label="Three answers, the middle one ticked">
      {row(24, false)}{row(62, true)}{row(100, false)}
    </svg>
  )
}

/* The small tiles as moving pictures (Chandra, 6 Oct 2026): a finger (or a
   pointer) sliding sideways spins the body; sliding up or down tips it to
   show the soles of the feet; pinching (or the mouse wheel) zooms. */
/* A laptop touchpad and a mouse (Chandra, 6 Oct 2026: people use both): the
   computer pictures show the two side by side, each doing the gesture. */
function Pad({ x, y, w, h }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="5" fill={FILL} stroke={LINE} strokeWidth="1.6" />
      <path d={`M${x + w / 2} ${y + h - 6} v6`} stroke={LINE} strokeWidth="1.2" />
    </g>
  )
}
const Dot = () => <circle r="5" fill={GOLD_LIGHT} stroke={GOLD} strokeWidth="1.8" />
/* A mouse, 18 by 26, centred on (0, 0); the left button is pressed (gold). */
function Mouse({ wheel = false }) {
  return (
    <g>
      <rect x="-9" y="-13" width="18" height="26" rx="9" fill={FILL} stroke={LINE} strokeWidth="1.6" />
      {wheel
        ? <rect className="gs-wheel" x="-1.6" y="-10" width="3.2" height="6" rx="1.6" fill={GOLD_LIGHT} />
        : <path d="M0 -13 A9 9 0 0 0 -9 -4 H0 Z" fill={GOLD} opacity="0.85" />}
      <path d="M0 -13 V-3" stroke={LINE} strokeWidth="1.2" />
    </g>
  )
}
/* The device row under a computer picture: mouse on the left, touchpad on the right. */
function Devices({ y, kind }) {
  const mouseCls = kind === 'spin' ? 'gs-hs' : kind === 'tilt' ? 'gs-vs' : ''
  return (
    <g>
      <g className={mouseCls}><g transform={`translate(30 ${y + 13})`}><Mouse wheel={kind === 'zoom'} /></g></g>
      <Pad x={50} y={y} w={56} h={26} />
      {kind === 'spin' && <g className="gs-hslide"><g transform={`translate(78 ${y + 12})`}><Dot /></g></g>}
      {kind === 'tilt' && <g className="gs-vs"><g transform={`translate(78 ${y + 12})`}><Dot /></g></g>}
      {kind === 'zoom' && (
        <>
          <g className="gs-pinch-l"><g transform={`translate(70 ${y + 12})`}><Dot /></g></g>
          <g className="gs-pinch-r"><g transform={`translate(86 ${y + 12})`}><Dot /></g></g>
        </>
      )}
    </g>
  )
}
function Hand() {
  return <circle r="7" fill={GOLD_LIGHT} stroke={GOLD} strokeWidth="2" />
}
function MovePic({ kind, phone }) {
  const arrow = { fill: 'none', stroke: GOLD, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  return (
    <svg viewBox="0 0 120 124" className="gs-mpic" aria-hidden="true">
      {kind === 'spin' && (
        <>
          <g className="gs-spin"><Body x={41} y={4} s={0.62} /></g>
          <path d="M26 44 Q60 28 94 44" {...arrow} strokeDasharray="3 4" />
          <path d="M88 38 L94 44 L86 47" {...arrow} />
          {phone ? (
            <>
              <path d="M42 102 H78" stroke={GOLD} strokeWidth="2" strokeLinecap="round" opacity="0.45" />
              <g className="gs-hslide"><g transform="translate(60 102)"><Hand /></g></g>
            </>
          ) : <Devices y={92} kind="spin" />}
        </>
      )}
      {kind === 'tilt' && (
        phone ? (
          <>
            <g className="gs-tilt"><Body x={34} y={10} s={0.62} /></g>
            {/* The soles of the feet, shown as the body tips back. */}
            <ellipse cx="49" cy="96" rx="5" ry="8" fill="rgba(201,169,110,0.25)" stroke={GOLD} strokeWidth="1.5" className="gs-soles" />
            <ellipse cx="63" cy="96" rx="5" ry="8" fill="rgba(201,169,110,0.25)" stroke={GOLD} strokeWidth="1.5" className="gs-soles" />
            <path d="M98 30 V90" stroke={GOLD} strokeWidth="2" strokeLinecap="round" opacity="0.45" />
            <path d="M92 36 L98 30 L104 36" {...arrow} /><path d="M92 84 L98 90 L104 84" {...arrow} />
            <g className="gs-vslide"><g transform="translate(98 60)"><Hand /></g></g>
          </>
        ) : (
          <>
            <g className="gs-tilt"><Body x={41} y={2} s={0.6} /></g>
            <ellipse cx="54" cy="80" rx="4.5" ry="6.5" fill="rgba(201,169,110,0.25)" stroke={GOLD} strokeWidth="1.5" className="gs-soles" />
            <ellipse cx="66" cy="80" rx="4.5" ry="6.5" fill="rgba(201,169,110,0.25)" stroke={GOLD} strokeWidth="1.5" className="gs-soles" />
            <path d="M102 12 V62" stroke={GOLD} strokeWidth="2" strokeLinecap="round" opacity="0.45" />
            <path d="M96 18 L102 12 L108 18" {...arrow} /><path d="M96 56 L102 62 L108 56" {...arrow} />
            <Devices y={92} kind="tilt" />
          </>
        )
      )}
      {kind === 'zoom' && (
        <>
          <g className="gs-zoom"><Body x={41} y={phone ? 20 : 8} s={0.62} /></g>
          {phone ? (
            <>
              <g className="gs-pinch-a"><circle cx="34" cy="96" r="7" fill={GOLD_LIGHT} stroke={GOLD} strokeWidth="2" /></g>
              <g className="gs-pinch-b"><circle cx="86" cy="24" r="7" fill={GOLD_LIGHT} stroke={GOLD} strokeWidth="2" /></g>
            </>
          ) : <Devices y={92} kind="zoom" />}
        </>
      )}
    </svg>
  )
}

export default function GuideSteps({ phone }) {
  const steps = [
    { n: '1', title: 'Turn the body', pic: <TurnPic phone={phone} />,
      text: phone ? 'Swipe left or right so the sore side faces you.' : 'Mouse: click and drag left or right. Touchpad: press and slide. Turn it until the sore side faces you.' },
    { n: '2', title: 'Draw where it hurts', pic: <DrawPic />,
      text: `${phone ? 'Tap' : 'Click'} Draw, then trace every painful area, including where the pain spreads.` },
    { n: '3', title: 'Answer a few questions', pic: <QuestionsPic />,
      text: 'Safety questions first, then a few about your pain. About 5 minutes.' },
  ]
  const moves = phone
    ? [['spin', 'Swipe sideways', 'spin the body'], ['tilt', 'Swipe up or down', 'see the soles'], ['zoom', 'Pinch', 'zoom in or out']]
    // Computers: one line for a mouse and one for a touchpad (Chandra, 6 Oct 2026).
    : [['spin', 'Spin the body', 'Mouse: click and drag sideways', 'Touchpad: press and slide sideways'],
      ['tilt', 'See the soles', 'Mouse: click and drag up or down', 'Touchpad: press and slide up or down'],
      ['zoom', 'Zoom in or out', 'Mouse: scroll the wheel on the body', 'Touchpad: pinch on the body']]
  return (
    <div className="gs">
      <style>{`
        .gs { width: 100%; }
        .gs-steps { list-style: none; margin: 0 0 22px; padding: 0; display: grid; gap: 14px; grid-template-columns: minmax(0, 1fr); }
        @media (min-width: 720px) { .gs-steps { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; } }
        .gs-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(201,169,110,0.32); border-radius: 18px;
          padding: 14px 16px 16px; display: flex; flex-direction: column; min-width: 0;
        }
        @media (max-width: 719px) {
          /* On a phone: the picture beside the words keeps each card short. */
          .gs-card { flex-direction: row; align-items: center; gap: 14px; padding: 12px 14px; }
          .gs-card .gs-pic { width: 112px; flex: 0 0 112px; height: auto; }
        }
        .gs-pic { display: block; width: 100%; height: 150px; }
        .gs-head { display: flex; align-items: center; gap: 10px; margin: 8px 0 4px; }
        @media (max-width: 719px) { .gs-head { margin-top: 0; } }
        .gs-num {
          width: 28px; height: 28px; border-radius: 999px; flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center;
          background: ${GOLD}; color: #081527; font-weight: 700; font-size: 14px;
        }
        .gs-title { color: #fff; font-weight: 600; font-size: clamp(16px, 4vw, 17px); line-height: 1.3; }
        .gs-text { margin: 0; color: rgba(255,255,255,0.74); font-size: clamp(14px, 3.6vw, 15px); line-height: 1.5; }
        .gs-label { display: block; font-size: 11.5px; letter-spacing: 0.18em; text-transform: uppercase; color: ${GOLD}; margin: 0 0 10px; }
        .gs-moves { list-style: none; margin: 0 0 22px; padding: 0; display: grid; gap: 10px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .gs-move {
          border: 1px solid rgba(201,169,110,0.26); border-radius: 14px; padding: 10px 8px; text-align: center;
          background: rgba(255,255,255,0.03); min-width: 0;
        }
        .gs-mpic { width: 100%; max-width: 110px; height: auto; display: block; margin: 0 auto 4px; }
        .gs-spin, .gs-tilt, .gs-zoom, .gs-soles { transform-box: fill-box; transform-origin: center; }
        .gs-hslide { animation: gs-hslide 2.6s ease-in-out infinite; }
        @keyframes gs-hslide { 0%, 100% { transform: translateX(-16px); } 50% { transform: translateX(16px); } }
        .gs-spin { animation: gs-spin 2.6s ease-in-out infinite; }
        @keyframes gs-spin { 0%, 100% { transform: scaleX(1); } 25%, 75% { transform: scaleX(0.35); } 50% { transform: scaleX(-1); } }
        .gs-vslide { animation: gs-vslide 3s ease-in-out infinite; }
        @keyframes gs-vslide { 0%, 100% { transform: translateY(-22px); } 50% { transform: translateY(22px); } }
        .gs-tilt { animation: gs-tilt 3s ease-in-out infinite; transform-origin: center bottom; }
        @keyframes gs-tilt { 0%, 100% { transform: scaleY(1); } 50% { transform: scaleY(0.55); } }
        .gs-soles { animation: gs-soles 3s ease-in-out infinite; }
        @keyframes gs-soles { 0%, 25%, 100% { opacity: 0; } 50%, 60% { opacity: 1; } }
        .gs-zoom { animation: gs-zoom 3s ease-in-out infinite; }
        @keyframes gs-zoom { 0%, 100% { transform: scale(0.8); } 50% { transform: scale(1.15); } }
        .gs-pinch-a { animation: gs-pinch-a 3s ease-in-out infinite; }
        @keyframes gs-pinch-a { 0%, 100% { transform: translate(10px, -10px); } 50% { transform: translate(0, 0); } }
        .gs-pinch-b { animation: gs-pinch-b 3s ease-in-out infinite; }
        @keyframes gs-pinch-b { 0%, 100% { transform: translate(-10px, 10px); } 50% { transform: translate(0, 0); } }
        .gs-move-pc span { margin-top: 2px; }
        .gs-hs { animation: gs-hs 2.6s ease-in-out infinite; }
        @keyframes gs-hs { 0%, 100% { transform: translateX(-8px); } 50% { transform: translateX(8px); } }
        .gs-vs { animation: gs-vs 3s ease-in-out infinite; }
        @keyframes gs-vs { 0%, 100% { transform: translateY(-6px); } 50% { transform: translateY(6px); } }
        .gs-pinch-l { animation: gs-pinch-l 3s ease-in-out infinite; }
        @keyframes gs-pinch-l { 0%, 100% { transform: translateX(6px); } 50% { transform: translateX(-8px); } }
        .gs-pinch-r { animation: gs-pinch-r 3s ease-in-out infinite; }
        @keyframes gs-pinch-r { 0%, 100% { transform: translateX(-6px); } 50% { transform: translateX(8px); } }
        .gs-wheel { animation: gs-wheel 1.5s ease-in-out infinite; }
        @keyframes gs-wheel { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(4px); } }
        .gs-move b { display: block; color: #fff; font-weight: 600; font-size: clamp(12.5px, 3.3vw, 14px); line-height: 1.3; }
        .gs-move span { display: block; color: rgba(255,255,255,0.68); font-size: clamp(12px, 3.1vw, 13px); line-height: 1.3; }
        /* Slow loops: the finger slides, the line draws itself, the tick appears. */
        .gs-slide { animation: gs-slide 2.6s ease-in-out infinite; }
        @keyframes gs-slide { 0%, 100% { transform: translateX(-22px); } 50% { transform: translateX(22px); } }
        .gs-draw { stroke-dasharray: 60; animation: gs-draw 3s ease-in-out infinite; }
        @keyframes gs-draw { 0% { stroke-dashoffset: 60; } 60%, 100% { stroke-dashoffset: 0; } }
        .gs-pen { animation: gs-pen 3s ease-in-out infinite; }
        @keyframes gs-pen { 0% { transform: translate(-1px, -34px); } 60%, 100% { transform: translate(0, 0); } }
        .gs-tick { stroke-dasharray: 16; animation: gs-tick 3s ease-in-out infinite; }
        @keyframes gs-tick { 0%, 30% { stroke-dashoffset: 16; } 55%, 100% { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .gs-slide, .gs-draw, .gs-pen, .gs-tick, .gs-hslide, .gs-spin, .gs-vslide, .gs-tilt, .gs-zoom, .gs-pinch-a, .gs-pinch-b, .gs-wheel, .gs-hs, .gs-vs, .gs-pinch-l, .gs-pinch-r { animation: none; }
          .gs-soles { animation: none; opacity: 1; }
          .gs-draw, .gs-tick { stroke-dashoffset: 0; }
        }
      `}</style>
      <ol className="gs-steps">
        {steps.map((s) => (
          <li key={s.n} className="gs-card">
            {s.pic}
            <div style={{ minWidth: 0 }}>
              <div className="gs-head"><span className="gs-num" aria-hidden="true">{s.n}</span><span className="gs-title">{s.title}</span></div>
              <p className="gs-text">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <span className="gs-label">Moving the body</span>
      <ul className="gs-moves">
        {moves.map(([kind, action, ...lines]) => (
          <li key={kind} className={'gs-move' + (phone ? '' : ' gs-move-pc')}>
            <MovePic kind={kind} phone={phone} />
            <b>{action}</b>
            {lines.map((l) => <span key={l}>{l}</span>)}
          </li>
        ))}
      </ul>
    </div>
  )
}
