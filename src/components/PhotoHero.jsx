import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const GOLD = '#c9a96e'
const GOLD_LIGHT = '#e8d5b0'
const EASE = [0.22, 1, 0.36, 1]

/* ─── EDIT THESE ─────────────────────────────────────────────────────────
   Everything the client may want to change lives here.
   To use a different photo: put it in public/images/ and change HERO_IMAGE.
   Best photo: a real treatment shot (hands-on therapy / exercise guidance). */
const HERO_IMAGE = '/images/hero-treatment.jpg'
const EYEBROW    = 'Registered Physiotherapy · '
const LINE_1     = 'Your recovery'
const LINE_2     = 'starts here'          // rendered in italic gold
const SUBLINE    = 'Chandra Sekhar Matla, Registered Physiotherapist'
const BOOK_HREF  = 'tel:+16045550101'
/* ──────────────────────────────────────────────────────────────────────── */

export default function PhotoHero({ onStart }) {
  // Phone layouts need their own photo crop, tint, and height.
  const [vw, setVw] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const onR = () => setVw(window.innerWidth)
    window.addEventListener('resize', onR)
    return () => window.removeEventListener('resize', onR)
  }, [])
  const isPhone = vw < 768
  // Clicking anywhere on the hero (photo, text, or the gold-outlined button)
  // swaps this section out and brings the 3D body in — same spot, no scrolling.
  const start = () => onStart?.()

  return (
    <section onClick={start} style={{
      cursor: 'pointer',
      position: 'relative',
      minHeight: isPhone ? 'min(640px, 88svh)' : 'clamp(520px, 92vh, 900px)',
      display: 'flex', alignItems: 'center',
      fontFamily: 'var(--font-body)',
      overflow: 'hidden',
      background: 'var(--black)',
    }}>
      {/* Real photo background */}
      <img
        src={HERO_IMAGE}
        alt="Physiotherapy treatment at Physio Chandra"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: isPhone ? '38% 22%' : '70% 28%',
        }}
      />
      {/* Navy tint so the text is always readable over any photo */}
      <div style={{
        position: 'absolute', inset: 0,
        background: isPhone
          ? 'linear-gradient(180deg, rgba(8,21,39,0.85) 0%, rgba(8,21,39,0.45) 34%, rgba(8,21,39,0.62) 66%, rgba(8,21,39,0.9) 100%)'
          : 'linear-gradient(90deg, rgba(8,21,39,0.88) 0%, rgba(8,21,39,0.62) 34%, rgba(8,21,39,0.22) 58%, rgba(10,26,47,0) 100%)',
      }} />
      {/* Dark band at the TOP so the header/navbar stays visible over the
          photo's bright areas (the beige curtain washes out white nav text) */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 150,
        background: 'linear-gradient(180deg, rgba(8,21,39,0.82) 0%, rgba(8,21,39,0.4) 55%, rgba(8,21,39,0) 100%)',
      }} />
      {/* Extra bottom fade into the next section */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 90,
        background: 'linear-gradient(180deg, rgba(10,26,47,0) 0%, var(--black) 100%)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        style={{
          position: 'relative', zIndex: 1,
          padding: isPhone ? '110px 22px 46px' : 'clamp(96px,14vh,140px) clamp(20px,6vw,90px) clamp(72px,10vh,110px)',
          maxWidth: 680,
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{ width: 28, height: 1, background: GOLD }} />
          <span style={{
            fontSize: 'clamp(10px,2.6vw,12px)', letterSpacing: '0.24em',
            textTransform: 'uppercase', color: GOLD,
          }}>{EYEBROW}</span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(38px,8vw,72px)',
          fontWeight: 300, lineHeight: 1.05, color: '#fff',
          margin: '0 0 18px', letterSpacing: '-0.02em',
        }}>
          {LINE_1}<br />
          <em style={{ fontStyle: 'italic', color: GOLD_LIGHT }}>{LINE_2}</em>
        </h1>

        <p style={{
          fontSize: 'clamp(14px,3.6vw,17px)', lineHeight: 1.6,
          color: 'rgba(255,255,255,0.72)', margin: '0 0 30px', maxWidth: 460,
        }}>{SUBLINE}</p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <motion.a
            href={BOOK_HREF}
            onClick={(e) => e.stopPropagation()}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '15px 30px', borderRadius: 999, textDecoration: 'none',
              background: GOLD, color: '#081527', fontWeight: 700,
              fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}
          >Book Appointment</motion.a>
          <motion.button
            onClick={start}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '15px 26px', borderRadius: 999, cursor: 'pointer',
              background: 'rgba(8,21,39,0.4)', color: GOLD_LIGHT,
              border: `1.5px solid ${GOLD}`, fontWeight: 500,
              fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}
          >Find pain Areas↓</motion.button>
        </div>
      </motion.div>
    </section>
  )
}