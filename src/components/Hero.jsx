import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import Body3D from './Body3D'
import PainAIPanel from './PainAIPanel'

const T = {
  bg: 'var(--black)',
  text: 'var(--white)',
  textMid: 'rgba(255,255,255,0.6)',
  textMuted: 'rgba(255,255,255,0.35)',
  accent: 'var(--gold)',
  border: 'rgba(255,255,255,0.1)',
}

// ─── Zone data ────────────────────────────────────────────────────────────────
// viewBox "0 0 100 150" — coords recalibrated to match red glow spots on body.png
const ZONES = {
  neck: {
    id: 'neck', label: 'Neck',
    pos: { cx: 43, cy: 26 },
    headline: 'Neck Pain & Tension',
    desc: 'Assessment and treatment of neck pain, stiffness, posture-related discomfort, headaches, and mobility limitations caused by muscular, joint, or neural involvement.',
    symptoms: ['Neck stiffness', 'Tension headaches', 'Poor posture', 'Pain with movement', 'Nerve tingling'],
    treatments: ['Cervical Mobilisation', 'Postural Retraining', 'Dry Needling'],
  },
  shoulder: {
    id: 'shoulder', label: 'Shoulder',
    pos: { cx: 60, cy: 32 },
    headline: 'Shoulder Pain & Injury',
    desc: 'Comprehensive assessment of rotator cuff injuries, frozen shoulder, impingement syndromes, and post-surgical rehabilitation to restore full range and strength.',
    symptoms: ['Restricted movement', 'Pain at rest', 'Weakness lifting', 'Night pain', 'Clicking sensation'],
    treatments: ['Rotator Cuff Rehab', 'Manual Therapy', 'Sports Rehabilitation'],
  },
  back: {
    id: 'back', label: 'Back',
    pos: { cx: 43, cy: 53 },
    headline: 'Back Pain',
    desc: 'Evidence-based management of lumbar disc injuries, sciatica, facet joint pain, and chronic lower back pain — identifying the source, not just treating the symptom.',
    symptoms: ['Persistent aching', 'Sciatica / leg pain', 'Pain with sitting', 'Stiffness on waking', 'Reduced mobility'],
    treatments: ['Spinal Mobilisation', 'Dry Needling', 'Clinical Pilates'],
  },
  hip: {
    id: 'hip', label: 'Hip',
    pos: { cx: 59, cy: 68 },
    headline: 'Hip Pain & Dysfunction',
    desc: 'Assessment of hip impingement, labral tears, bursitis, osteoarthritis, and referred pain — with structured rehabilitation to restore pain-free movement and function.',
    symptoms: ['Groin or lateral pain', 'Pain walking stairs', 'Restricted hip range', 'Clicking or catching', 'Referred thigh pain'],
    treatments: ['Hip Mobilisation', 'Strengthening Program', 'Gait Retraining'],
  },
  knee: {
    id: 'knee', label: 'Knee',
    pos: { cx: 61, cy: 90 },
    headline: 'Knee Pain & Injury',
    desc: 'From ACL and meniscus injuries to patellofemoral pain and knee osteoarthritis — structured rehabilitation using load management, movement retraining, and targeted strengthening.',
    symptoms: ['Pain with stairs', 'Swelling / stiffness', 'Instability', 'Pain after sport', 'Locking sensation'],
    treatments: ['Sports Rehabilitation', 'Exercise Therapy', 'TENS & Manual Therapy'],
  },
}

// ─── Invisible hotspot — no gold dot, just transparent hit area ───────────────
function Hotspot({ zone, isActive, isHovered, onClick, onEnter, onLeave }) {
  const pos = zone.pos
  return (
    <g
      onClick={() => onClick(zone.id)}
      onMouseEnter={() => onEnter(zone.id)}
      onMouseLeave={onLeave}
      style={{ cursor: 'pointer' }}
    >
      {/* Transparent hit area */}
      <circle cx={pos.cx} cy={pos.cy} r="7" fill="transparent" stroke="none" />

      {/* Active: gold ring around the image's own red dot */}
      {isActive && (
        <>
          <circle cx={pos.cx} cy={pos.cy} r="6.5"
            fill="rgba(201,169,110,0.15)"
            stroke={T.accent} strokeWidth="0.7" opacity="0.95" />
          <circle cx={pos.cx} cy={pos.cy} r="0" fill="none" stroke={T.accent} strokeWidth="0.5" opacity="0">
            <animate attributeName="r" values="7;13;7" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/>
          </circle>
        </>
      )}

      {/* Hover: subtle white ring */}
      {!isActive && isHovered && (
        <circle cx={pos.cx} cy={pos.cy} r="6.5"
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.35)" strokeWidth="0.5" />
      )}

      {/* Label line on hover/active */}
      {(isActive || isHovered) && (
        <g>
          <line
            x1={pos.cx > 55 ? pos.cx + 7 : pos.cx - 7}
            y1={pos.cy}
            x2={pos.cx > 55 ? pos.cx + 17 : pos.cx - 17}
            y2={pos.cy}
            stroke={T.accent} strokeWidth="0.5" opacity="0.8"
          />
          <text
            x={pos.cx > 55 ? pos.cx + 19 : pos.cx - 19}
            y={pos.cy + 1.5}
            textAnchor={pos.cx > 55 ? 'start' : 'end'}
            fill={T.accent} fontSize="4.5"
            fontFamily="'DM Sans', sans-serif"
            fontWeight="400" letterSpacing="0.08em"
            style={{ userSelect: 'none' }}
          >{zone.label}</text>
        </g>
      )}
    </g>
  )
}

// ─── Default right panel ──────────────────────────────────────────────────────
function DefaultContent({ onSelectZone }) {
  return (
    <motion.div key="default"
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
        <div style={{ width: '24px', height: '1px', background: T.accent }} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.26em', textTransform: 'uppercase', color: T.accent, fontWeight: 400 }}>Physio Chandra</span>
      </div>

      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(44px, 5.5vw, 82px)',
        fontWeight: 300, lineHeight: 1.02,
        color: T.text, marginBottom: '24px', letterSpacing: '-0.02em',
      }}>
        Where Does<br />
        <em style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>It Hurt?</em>
      </h1>

      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 'clamp(15px, 1.2vw, 17px)',
        fontWeight: 300, lineHeight: 1.85, color: T.textMid,
        maxWidth: '400px', marginBottom: '36px',
      }}>
        Tap one or more areas on the body to explore conditions and treatments. You can select multiple pain areas at once.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '48px' }}>
        {Object.values(ZONES).map(z => (
          <button key={z.id} onClick={() => onSelectZone({ id: z.id, label: z.label })}
            style={{
              padding: '8px 18px',
              border: `1px solid rgba(255,255,255,0.15)`,
              background: 'transparent',
              fontFamily: 'var(--font-body)', fontSize: '13px',
              color: T.textMuted, letterSpacing: '0.06em', cursor: 'pointer',
              transition: 'all 0.25s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = T.textMuted }}
          >{z.label}</button>
        ))}
      </div>

      <div style={{ padding: '20px 0', borderTop: `1px solid ${T.border}`, marginTop: 'auto' }}>
        <span style={{ fontSize: '13px', color: T.textMuted }}>← draw a line across the body, or use the buttons above</span>
      </div>
    </motion.div>
  )
}

// ─── Multi-zone right panel ───────────────────────────────────────────────────
function MultiZoneContent({ activeZones, allZones, onToggle, onClear }) {
  const zones = activeZones.map(id => allZones[id]).filter(Boolean)
  const allTreatments = [...new Set(zones.flatMap(z => z.treatments))]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflowY: 'auto' }}
    >
      {/* Active zone tags + clear */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {zones.map(z => (
            <button key={z.id} onClick={() => onToggle(z.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '5px 12px',
                background: 'rgba(201,169,110,0.12)',
                border: `1px solid ${T.accent}`,
                color: T.accent,
                fontFamily: 'var(--font-body)', fontSize: '12px',
                letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >{z.label} <span style={{ opacity: 0.7 }}>×</span></button>
          ))}
        </div>
        <button onClick={onClear} style={{ background: 'none', border: 'none', color: T.textMuted, fontFamily: 'var(--font-body)', fontSize: '12px', letterSpacing: '0.1em', cursor: 'pointer' }}>
          Clear all
        </button>
      </div>

      {/* Single zone: full detail */}
      {zones.length === 1 && (
        <motion.div key={zones[0].id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(30px, 3.5vw, 54px)', fontWeight: 300, lineHeight: 1.08, color: T.text, marginBottom: '16px' }}>
            {zones[0].headline}
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 300, lineHeight: 1.85, color: T.textMid, maxWidth: '400px', marginBottom: '20px' }}>
            {zones[0].desc}
          </p>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: T.textMuted, marginBottom: '10px' }}>Symptoms</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {zones[0].symptoms.map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-body)', fontSize: '14px', color: T.textMid, fontWeight: 300 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.accent} strokeWidth="1.5"><path d="M20 6L9 17l-5-5"/></svg>
                  {s}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Multiple zones: combined view */}
      {zones.length > 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 46px)', fontWeight: 300, lineHeight: 1.1, color: T.text, marginBottom: '16px' }}>
            {zones.length} Areas<br />
            <em style={{ fontStyle: 'italic', color: 'var(--gold-light)' }}>Selected</em>
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 300, lineHeight: 1.8, color: T.textMid, maxWidth: '400px', marginBottom: '20px' }}>
            You've selected {zones.map(z => z.label).join(', ')}. Our physiotherapists treat multiple concurrent conditions with a combined, personalised rehabilitation approach.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            {zones.map(z => (
              <div key={z.id}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: T.accent, marginBottom: '6px' }}>{z.label}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {z.symptoms.slice(0, 3).map(s => (
                    <span key={s} style={{ padding: '3px 10px', border: `1px solid rgba(255,255,255,0.1)`, fontFamily: 'var(--font-body)', fontSize: '12px', color: T.textMid }}>{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Treatments */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.22em', textTransform: 'uppercase', color: T.textMuted, marginBottom: '10px' }}>Approaches used</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {allTreatments.map(t => (
            <span key={t} style={{ padding: '5px 14px', border: `1px solid ${T.border}`, fontFamily: 'var(--font-body)', fontSize: '13px', color: T.textMid }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <a href="tel:+16045550101" style={{
          display: 'inline-block', padding: '13px 32px',
          background: 'var(--gold)', color: 'var(--black)',
          fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500,
          letterSpacing: '0.14em', textTransform: 'uppercase',
        }}>Book Appointment</a>
        <Link to="/about" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.1em',
          textTransform: 'uppercase', color: T.textMid,
        }}>
          Learn More
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>
    </motion.div>
  )
}

// ─── Trust bar ────────────────────────────────────────────────────────────────
function TrustBar() {
  const items = [
    { stat: '15+', label: 'Years Experience' },
    { stat: '3',   label: 'Clinic Locations'  },
    { stat: 'BSc', label: 'Physiotherapy'     },
    { stat: '∞',   label: 'Personalised Plans'},
  ]
  return (
    <div className="trust-bar" style={{ borderTop: `1px solid ${T.border}`, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
      {items.map((item, i) => (
        <div key={i} style={{ padding: '28px 32px', borderRight: i < 3 ? `1px solid ${T.border}` : 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 300, color: T.text, lineHeight: 1 }}>{item.stat}</span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: T.textMuted, letterSpacing: '0.05em', fontWeight: 300 }}>{item.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PhysioHero() {
  const [selectedZones, setSelectedZones] = useState([]) // [{id, label}, ...]
  const [isMobile, setIsMobile]       = useState(false)

  useState(() => {
    const check = () => setIsMobile(window.innerWidth < 900)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleQuickSelect = (zoneObj) => {
    setSelectedZones(prev => {
      const exists = prev.some(z => z.id === zoneObj.id)
      return exists ? prev.filter(z => z.id !== zoneObj.id) : [...prev, zoneObj]
    })
  }

  return (
    <div style={{ fontFamily: 'var(--font-body)', background: T.bg }}>
      <Navbar />

      <div style={{
        minHeight: '100vh', paddingTop: '88px',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gridTemplateRows: isMobile ? 'auto 1fr' : '1fr',
      }}>
        {/* LEFT — 3D body, draw a line to select pain areas */}
        <div style={{
          borderRight: isMobile ? 'none' : `1px solid ${T.border}`,
          borderBottom: isMobile ? `1px solid ${T.border}` : 'none',
          position: 'relative', minHeight: isMobile ? '460px' : 'auto',
          background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(201,169,110,0.05) 0%, transparent 70%)',
        }}>
          <Body3D onSelectionChange={setSelectedZones} />

          {selectedZones.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                position: 'absolute', bottom: 56, left: '50%', transform: 'translateX(-50%)',
                padding: '6px 16px',
                background: 'rgba(201,169,110,0.12)',
                border: `1px solid rgba(201,169,110,0.3)`,
                fontFamily: 'var(--font-body)', fontSize: '12px',
                color: T.accent, letterSpacing: '0.1em', whiteSpace: 'nowrap', zIndex: 2,
              }}
            >
              {selectedZones.length} area{selectedZones.length > 1 ? 's' : ''} selected
            </motion.div>
          )}
        </div>

        {/* RIGHT — info panel */}
        <div style={{
          padding: isMobile ? '48px 28px' : 'clamp(40px,5vh,80px) clamp(36px,6vw,80px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          minHeight: isMobile ? '480px' : 'auto', overflowY: 'auto',
        }}>
          <AnimatePresence mode="wait">
            {selectedZones.length === 0
              ? <DefaultContent key="default" onSelectZone={handleQuickSelect} />
              : <motion.div key="ai-panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.45 }}>
                  <button onClick={() => setSelectedZones([])} style={{ background: 'none', border: 'none', color: T.textMuted, fontFamily: 'var(--font-body)', fontSize: '12px', letterSpacing: '0.1em', cursor: 'pointer', marginBottom: '20px' }}>
                    Clear selection
                  </button>
                  <PainAIPanel zones={selectedZones} />
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '28px' }}>
                    <a href="tel:+16045550101" style={{
                      display: 'inline-block', padding: '13px 32px',
                      background: 'var(--gold)', color: 'var(--black)',
                      fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500,
                      letterSpacing: '0.14em', textTransform: 'uppercase',
                    }}>Book Appointment</a>
                  </div>
                </motion.div>
            }
          </AnimatePresence>
        </div>
      </div>

      <TrustBar />

      <style>{`
        @media (max-width: 900px) { .trust-bar { grid-template-columns: repeat(2,1fr) !important; } }
      `}</style>
    </div>
  )
}