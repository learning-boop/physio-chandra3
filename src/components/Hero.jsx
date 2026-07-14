import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import Body3D from './Body3D'
import PainAIPanel from './PainAIPanel'

const GOLD = '#c9a96e'
const GOLD_LIGHT = '#e8d5b0'
const EASE = [0.16, 1, 0.3, 1]
const NAV_H = 88          // desktop navbar height
const NAV_H_MOBILE = 92   // mobile navbar height

const glass = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(201,169,110,0.18)',
  borderRadius: 20,
  boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
}

// Icon-first 3-step guide: big pictures + tiny words, so ANYONE — even
// someone who can't read well — instantly understands what to do.
function Intro({ compact = false }) {
  const steps = [
    ['👆', 'Touch & Turn', 'Drag on the body to rotate it'],
    ['🖐️', 'Press Gold Button', 'It turns on drawing'],
    ['✏️', 'Draw Your Pain', 'Trace lines where it hurts'],
  ]
  return (
    <>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: compact ? 12 : 16 }}>
        <div style={{ width: 24, height: 1, background: GOLD }} />
        <span style={{ fontSize: 12, letterSpacing: '0.26em', textTransform: 'uppercase', color: GOLD }}>Physio Chandra</span>
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: compact ? 'clamp(32px,8vw,44px)' : 'clamp(28px,3vw,42px)', fontWeight: 300, lineHeight: 1.03, color: '#fff', margin: `0 0 ${compact ? 16 : 20}px`, letterSpacing: '-0.02em' }}>
        Where Does<br /><em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>It Hurt?</em>
      </h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 16 }}>
        {steps.map(([icon, t, d], i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{
              width: 46, height: 46, borderRadius: 14, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.3)',
            }}>{icon}</div>
            <div>
              <div style={{ fontSize: 'clamp(14px,3.6vw,16px)', color: '#fff', fontWeight: 600 }}>{t}</div>
              <div style={{ fontSize: 'clamp(12px,3vw,14px)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

function Results({ selected }) {
  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD }}>
          {selected.length} Area{selected.length > 1 ? 's' : ''} Selected
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
        {selected.map((z) => (
          <span key={z.id} style={{
            padding: '5px 12px', background: 'rgba(201,169,110,0.12)', border: `1px solid ${GOLD}`,
            borderRadius: 999, fontSize: 12, letterSpacing: '0.08em', color: GOLD, textTransform: 'uppercase',
          }}>{z.label}</span>
        ))}
      </div>
      <div style={{ ...glass, padding: '22px 24px' }}>
        <PainAIPanel zones={selected} />
      </div>
      <a href="tel:+16045550101" style={{
        display: 'inline-block', marginTop: 18, padding: '14px 34px', background: GOLD, color: 'var(--black)',
        fontSize: 13, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', borderRadius: 999, textDecoration: 'none',
      }}>Book Appointment</a>
    </>
  )
}

export default function Hero() {
  const [selected, setSelected] = useState([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // EXPLICIT height everywhere — the panel can never collapse, no matter
  // how the parent lays out.
  const panelHeight = isMobile ? '78vh' : `calc(100vh - ${NAV_H}px)`

  const bodyPanel = (
    <div style={{
      position: 'relative',
      height: panelHeight,
      minHeight: isMobile ? 540 : 620,
      margin: 0,
      overflow: 'hidden',
      background: isMobile
        ? 'radial-gradient(ellipse 78% 62% at 50% 42%, rgba(201,169,110,0.12) 0%, rgba(255,255,255,0.03) 42%, rgba(5,5,5,0.6) 78%)'
        : 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(201,169,110,0.06) 0%, transparent 70%)',
      borderRight: isMobile ? 'none' : '1px solid rgba(201,169,110,0.12)',
      borderBottom: isMobile ? '1px solid rgba(201,169,110,0.16)' : 'none',
    }}>
      <Body3D onSelectionChange={setSelected} />
    </div>
  )

  // ─── MOBILE: BIG image FIRST (right under the navbar), guide below ────────
  if (isMobile) {
    return (
      <div style={{ position: 'relative', background: 'var(--black)', fontFamily: 'var(--font-body)' }}>
        <Navbar />
        <div style={{ paddingTop: NAV_H_MOBILE }}>
          {bodyPanel}
          <AnimatePresence mode="wait">
            {selected.length === 0 ? (
              <motion.div key="mintro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }} style={{ padding: '26px 20px 48px' }}>
                <Intro compact />
              </motion.div>
            ) : (
              <motion.div key="mres" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }} style={{ padding: '28px 20px 56px' }}>
                <Results selected={selected} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  // ─── DESKTOP: image ~66% width at FULL viewport height, guide on the right ─
  return (
    <div style={{ position: 'relative', background: 'var(--black)', fontFamily: 'var(--font-body)' }}>
      <Navbar />
      <div style={{ paddingTop: NAV_H, display: 'flex', alignItems: 'stretch' }}>
        <div style={{ width: '75%', flexShrink: 0 }}>
          {bodyPanel}
        </div>
        <div style={{
          flex: 1, minHeight: `calc(100vh - ${NAV_H}px)`,
          padding: 'clamp(22px,3vh,44px) clamp(16px,2vw,32px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          overflowY: 'auto',
        }}>
          <AnimatePresence mode="wait">
            {selected.length === 0 ? (
              <motion.div key="intro" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.5, ease: EASE }}>
                <Intro />
              </motion.div>
            ) : (
              <motion.div key="panel" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.45, ease: EASE }}>
                <Results selected={selected} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}