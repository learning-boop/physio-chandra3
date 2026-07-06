import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import Body3D from './Body3D'
import PainAIPanel from './PainAIPanel'

const GOLD = '#c9a96e'
const GOLD_LIGHT = '#e8d5b0'
const EASE = [0.16, 1, 0.3, 1]

const glass = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(201,169,110,0.18)',
  borderRadius: 20,
  boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
}

function Intro() {
  return (
    <>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <div style={{ width: 24, height: 1, background: GOLD }} />
        <span style={{ fontSize: 12, letterSpacing: '0.26em', textTransform: 'uppercase', color: GOLD }}>Physio Chandra</span>
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(38px,7vw,76px)', fontWeight: 300, lineHeight: 1.03, color: '#fff', margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Where Does<br /><em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>It Hurt?</em>
      </h1>
      <p style={{ fontSize: 'clamp(14px,3.6vw,17px)', lineHeight: 1.75, color: 'rgba(255,255,255,0.6)', maxWidth: 440, margin: 0 }}>
        Draw a line across the body where you feel pain. The areas it crosses
        will light up, and we'll show an AI overview of what might be going on.
      </p>
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

  const bodyPanel = (
    <div style={{
      position: 'relative',
      height: isMobile ? '54vh' : 'auto',
      minHeight: isMobile ? 400 : 'auto',
      margin: isMobile ? '0 14px' : 0,
      borderRadius: isMobile ? 26 : 0,
      overflow: 'hidden',
      background: isMobile
        ? 'radial-gradient(ellipse 78% 62% at 50% 42%, rgba(201,169,110,0.12) 0%, rgba(255,255,255,0.03) 42%, rgba(5,5,5,0.6) 78%)'
        : 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(201,169,110,0.06) 0%, transparent 70%)',
      border: isMobile ? '1px solid rgba(201,169,110,0.16)' : 'none',
      borderRight: isMobile ? '1px solid rgba(201,169,110,0.16)' : '1px solid rgba(201,169,110,0.12)',
      boxShadow: isMobile ? 'inset 0 1px 0 rgba(255,255,255,0.05), 0 24px 60px rgba(0,0,0,0.5)' : 'none',
    }}>
      <Body3D onSelectionChange={setSelected} />
    </div>
  )

  // ─── MOBILE: intro on top, body in the middle, results below ──────────────
  if (isMobile) {
    return (
      <div style={{ position: 'relative', background: 'var(--black)', fontFamily: 'var(--font-body)' }}>
        <Navbar />
        <div style={{ paddingTop: 104 }}>
          <div style={{ padding: '0 20px 20px' }}>
            <Intro />
          </div>
          {bodyPanel}
          <AnimatePresence>
            {selected.length > 0 && (
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

  // ─── DESKTOP: two columns (body left, panel right) ────────────────────────
  return (
    <div style={{ position: 'relative', background: 'var(--black)', fontFamily: 'var(--font-body)' }}>
      <Navbar />
      <div style={{ minHeight: '100vh', paddingTop: 88, display: 'grid', gridTemplateColumns: '1.15fr 1fr' }}>
        {bodyPanel}
        <div style={{ padding: 'clamp(40px,6vh,90px) clamp(28px,4vw,64px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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