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

function Intro({ compact = false }) {
  return (
    <>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: compact ? 12 : 22 }}>
        <div style={{ width: 24, height: 1, background: GOLD }} />
        <span style={{ fontSize: compact ? 11 : 12, letterSpacing: '0.26em', textTransform: 'uppercase', color: GOLD }}>Physio Chandra</span>
      </div>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: compact ? 'clamp(30px,6vw,44px)' : 'clamp(38px,7vw,76px)',
        fontWeight: 300, lineHeight: 1.03, color: '#fff',
        margin: compact ? '0 0 10px' : '0 0 20px', letterSpacing: '-0.02em',
      }}>
        Where Does<br /><em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>It Hurt?</em>
      </h1>
      <p style={{
        fontSize: compact ? 14 : 'clamp(14px,3.6vw,17px)',
        lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', maxWidth: 440, margin: 0,
      }}>
        {compact
          ? '✏️ Tap the button, then draw a line where it hurts.'
          : "Draw a line across the body where you feel pain. The areas it crosses will light up, and we'll show an AI overview of what might be going on."}
      </p>
    </>
  )
}

// Shown before revealing the generated information.
// Wording follows the CHCPBC Practice Standard "Marketing, Advertising, and
// Promotion" (effective 1 Apr 2026): accurate and honest, discloses material
// limitations so patients can make informed choices, stays within scope of
// practice, makes no guarantees about results, and avoids sensational or
// fear-based messaging.
function DisclaimerDialog({ onContinue, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100, display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 20,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
      }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.35, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        style={{ ...glass, maxWidth: 470, width: '100%', padding: '28px 26px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.6">
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
          </svg>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, color: '#fff', margin: 0 }}>
            About this information
          </h3>
        </div>

        <p style={{ fontSize: 14, lineHeight: 1.75, color: 'rgba(255,255,255,0.72)', margin: '0 0 12px' }}>
          What follows is <strong style={{ color: '#fff' }}>general education only. It is not a diagnosis</strong>,
          and it is not a substitute for an assessment by a physiotherapist or physician.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.75, color: 'rgba(255,255,255,0.72)', margin: '0 0 12px' }}>
          It is generated automatically from the body areas you marked. It cannot examine
          you, review your health history, or determine the cause of your symptoms. Every
          person is different, and no particular result or outcome is implied or guaranteed.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.75, color: 'rgba(255,255,255,0.72)', margin: '0 0 22px' }}>
          If your symptoms are ongoing or you would like advice specific to you, an
          individual assessment is the appropriate next step.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={onContinue} style={{
            padding: '12px 26px', background: GOLD, color: 'var(--black)', border: 'none',
            fontSize: 12.5, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
            borderRadius: 999, cursor: 'pointer',
          }}>I Understand · Continue</button>
          <button onClick={onCancel} style={{
            padding: '12px 22px', background: 'transparent', color: 'rgba(255,255,255,0.6)',
            border: '1px solid rgba(255,255,255,0.25)', fontSize: 12.5, letterSpacing: '0.1em',
            textTransform: 'uppercase', borderRadius: 999, cursor: 'pointer',
          }}>Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function Results({ selected }) {
  const [showDialog, setShowDialog] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const key = selected.map((z) => z.id).join('|')

  // A new selection re-gates the content.
  useEffect(() => { setRevealed(false); setShowDialog(false) }, [key])

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

      {!revealed ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <motion.button
            onClick={() => setShowDialog(true)}
            animate={{ scale: [1, 1.045, 1], boxShadow: [
              '0 0 0 0 rgba(201,169,110,0)',
              '0 0 0 10px rgba(201,169,110,0.12)',
              '0 0 0 0 rgba(201,169,110,0)',
            ] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '15px 30px', background: GOLD, color: 'var(--black)',
              border: 'none', fontSize: 13, fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase', borderRadius: 999, cursor: 'pointer',
            }}
          >
            👆 Possible Causes
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </motion.button>
          <motion.span
            animate={{ opacity: [0.35, 1, 0.35], x: [0, -4, 0] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD, whiteSpace: 'nowrap' }}
          >
            ← Tap here
          </motion.span>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }}>
          <div style={{ ...glass, padding: '22px 24px' }}>
            <PainAIPanel zones={selected} />
          </div>
          <p style={{ fontSize: 11.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.4)', margin: '14px 0 0' }}>
            General education only — not a diagnosis, and not a substitute for an
            individual assessment. No particular outcome is implied or guaranteed.
          </p>
          <a href="tel:+16045550101" style={{
            display: 'inline-block', marginTop: 18, padding: '14px 34px', background: GOLD, color: 'var(--black)',
            fontSize: 13, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', borderRadius: 999, textDecoration: 'none',
          }}>Book Appointment</a>
        </motion.div>
      )}

      <AnimatePresence>
        {showDialog && (
          <DisclaimerDialog
            onContinue={() => { setShowDialog(false); setRevealed(true) }}
            onCancel={() => setShowDialog(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default function Hero() {
  const [selected, setSelected] = useState([])
  // Track the REAL viewport in pixels. Using px (not vh) matters on mobile:
  // 'vh' includes the browser address bar, so the model jumps/clips when the
  // bar shows or hides. innerHeight is always the space actually available.
  const [vp, setVp] = useState({ w: 1200, h: 800 })

  useEffect(() => {
    const check = () => setVp({ w: window.innerWidth, h: window.innerHeight })
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
  }, [])

  // Device classes
  const isPhone = vp.w < 768                       // phones
  const isTablet = vp.w >= 768 && vp.w < 1024      // tablets / small windows
  const isStacked = vp.w < 1024                    // anything that stacks
  const isShort = vp.h < 560                       // landscape phone / short window


  // 3D stage height, computed from the real viewport so it always fits.
  // Phones/tablets: the image gets ~half the screen (was 2/3), so the heading,
  // instructions and hints always share the first screen with the body.
  const stageHeight = isShort
    ? Math.max(300, Math.round(vp.h * 0.88))       // landscape: use most of the height
    : isPhone
      ? Math.min(Math.max(Math.round(vp.h * 0.50), 340), 480)
      : isTablet
        ? Math.min(Math.max(Math.round(vp.h * 0.55), 400), 620)
        : 'auto'

  const bodyPanel = (
    <div style={{
      position: 'relative',
      height: stageHeight,
      minHeight: 0,
      margin: isStacked ? '0 12px' : 0,
      borderRadius: isStacked ? 24 : 0,
      overflow: 'hidden',
      background: isStacked
        ? 'radial-gradient(ellipse 78% 62% at 50% 42%, rgba(201,169,110,0.12) 0%, rgba(255,255,255,0.03) 42%, rgba(5,5,5,0.6) 78%)'
        : 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(201,169,110,0.06) 0%, transparent 70%)',
      border: isStacked ? '1px solid rgba(201,169,110,0.16)' : 'none',
      borderRight: isStacked ? '1px solid rgba(201,169,110,0.16)' : '1px solid rgba(201,169,110,0.12)',
      boxShadow: isStacked ? 'inset 0 1px 0 rgba(255,255,255,0.05), 0 24px 60px rgba(0,0,0,0.5)' : 'none',
    }}>
      <Body3D onSelectionChange={setSelected} />
    </div>
  )

  // ─── PHONE / TABLET: intro on top, body in the middle, results below ──────
  if (isStacked) {
    return (
      <div style={{ position: 'relative', background: 'var(--black)', fontFamily: 'var(--font-body)', overflowX: 'hidden' }}>
        <Navbar />
        <div style={{ paddingTop: isShort ? 80 : 94 }}>
          <div style={{
            padding: isShort ? '0 20px 8px' : '0 20px 12px',
            maxWidth: 640, margin: '0 auto',
          }}>
            <Intro compact />
          </div>
          {bodyPanel}
          <AnimatePresence>
            {selected.length > 0 && (
              <motion.div key="mres" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                style={{ padding: '26px 20px 56px', maxWidth: 640, margin: '0 auto' }}>
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
      <div style={{
        minHeight: vp.h,
        paddingTop: 88,
        display: 'grid',
        gridTemplateColumns: vp.w < 1280 ? '1fr 1fr' : '1.15fr 1fr',
      }}>
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