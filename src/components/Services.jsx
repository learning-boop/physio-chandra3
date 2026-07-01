import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const services = [
  { name: 'Manual Therapy', desc: 'Joint mobilization, manipulation, and soft tissue techniques to support movement, reduce pain, and improve function.', img: 'images/manual-therapy.jpg' },
  { name: 'Dry Needling',  desc: 'Intramuscular stimulation targeting myofascial trigger points for muscle release and neuromuscular support.', img: 'images/dry-needle2.jpg' },
  { name: 'Clinical Pilates',desc: 'Evidence-informed therapeutic Pilates programs addressing core stability, posture, and injury prevention.', img: 'images/pillates.jpg' },
  { name: 'Sports Rehabilitation', desc: 'Return-to-sport rehabilitation programs guided by sport-specific assessment and functional testing.', img: 'images/sports2.jpg' },
  { name: 'Exercise Therapy',  desc: 'Progressive therapeutic exercise programs to support strength, mobility, and movement quality based on individual assessment.', img: 'images/exercise.jpg' },
  { name: 'Post-Surgical Rehab', desc: 'Phase-structured post-operative rehabilitation from acute recovery through to functional return, guided by clinical milestones.', img: 'images/knee.jpg' },
  { name: 'TENS Therapy',  desc: 'Transcutaneous electrical nerve stimulation used in pain management and neuromuscular re-education as part of a broader treatment plan.', img: 'images/tens.jpg' },
  { name: 'Kinesiology', desc: 'Movement-based assessment and taping techniques to support joint mechanics, proprioception, and load management during rehabilitation.', img: 'images/Kinesiology.jpg' },
]

function ServiceCard({ s, reduce }) {
  const [hov, setHov] = useState(false)
  return (
    <motion.a
      href="#contact"
      className="srv-card"
      variants={{ hidden: { opacity: 0, y: reduce ? 0 : 28 }, show: { opacity: 1, y: 0 } }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative', flex: '0 0 auto',
        width: 'min(80vw, 360px)',
        height: 'clamp(400px, 60vh, 500px)',
        scrollSnapAlign: 'start',
        overflow: 'hidden', display: 'block',
        background: 'var(--black)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: 'inherit', textDecoration: 'none',
      }}
    >
      <motion.img
        src={s.img} alt={s.name}
        animate={{ scale: reduce ? 1 : hov ? 1.06 : 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%', objectFit: 'cover',
          opacity: hov ? 0.85 : 0.5,
          transition: 'opacity 0.6s var(--ease)',
        }}
      />

      {/* Gradient scrim so the name sits on solid dark */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.55) 42%, rgba(5,5,5,0.08) 100%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'absolute', inset: 0, padding: '32px',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}>
        <div style={{
          width: hov ? '44px' : '24px', height: '1px',
          background: 'var(--gold)', marginBottom: '18px',
          transition: 'width 0.5s var(--ease)',
        }} />
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(24px, 3vw, 30px)', fontWeight: 500,
          color: 'var(--white)', lineHeight: 1.1, marginBottom: '12px',
        }}>{s.name}</h3>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '15px',
          lineHeight: 1.7, color: 'rgba(255,255,255,0.55)',
          fontWeight: 200, marginBottom: '22px',
        }}>{s.desc}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.16em',
            textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 400,
          }}>Book</span>
          <motion.span animate={{ x: reduce ? 0 : hov ? 6 : 0 }} transition={{ duration: 0.4 }}
            style={{ color: 'var(--gold)', display: 'inline-flex' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.span>
        </div>
      </div>
    </motion.a>
  )
}

export default function Services() {
  const reduce = useReducedMotion()
  const trackRef = useRef(null)
  const drag = useRef({ down: false, startX: 0, startScroll: 0, moved: false })
  const [active, setActive] = useState(1)
  const [progress, setProgress] = useState(0)

  const getStep = () => {
    const t = trackRef.current
    if (!t || !t.children[0]) return 1
    const a = t.children[0].getBoundingClientRect()
    const b = t.children[1]?.getBoundingClientRect()
    const gap = b ? Math.max(b.left - a.right, 0) : 24
    return a.width + gap
  }

  const onScroll = () => {
    const t = trackRef.current
    if (!t) return
    const max = t.scrollWidth - t.clientWidth
    setProgress(max > 0 ? t.scrollLeft / max : 0)
    setActive(Math.min(services.length, Math.max(1, Math.round(t.scrollLeft / getStep()) + 1)))
  }

  const scrollByCards = (dir) => {
    const t = trackRef.current
    if (!t) return
    t.scrollBy({ left: dir * getStep(), behavior: reduce ? 'auto' : 'smooth' })
  }

  const jumpTo = (e) => {
    const t = trackRef.current
    if (!t) return
    const rail = e.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (e.clientX - rail.left) / rail.width))
    const max = t.scrollWidth - t.clientWidth
    t.scrollTo({ left: ratio * max, behavior: reduce ? 'auto' : 'smooth' })
  }

  // Mouse drag-to-scroll (touch already scrolls natively)
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse') return
    drag.current = { down: true, startX: e.clientX, startScroll: trackRef.current.scrollLeft, moved: false }
  }
  const onPointerMove = (e) => {
    if (!drag.current.down) return
    const dx = e.clientX - drag.current.startX
    if (Math.abs(dx) > 4) drag.current.moved = true
    trackRef.current.scrollLeft = drag.current.startScroll - dx
  }
  const endDrag = () => { drag.current.down = false }
  // Swallow the click that ends a drag so the card doesn't navigate
  const onClickCapture = (e) => {
    if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false }
  }

  return (
    <section id="services" style={{ background: 'var(--black)', padding: '160px 0', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '0 clamp(20px, 5vw, 80px)', marginBottom: '56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '1px', background: 'var(--gold)' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 300 }}>Services</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap' }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(40px, 6vw, 88px)',
            fontWeight: 300, lineHeight: 1, color: 'var(--white)',
          }}>
            Evidence-Informed Care.<br />
            <em>Tailored to You.</em>
          </h2>

          {/* Position counter + arrows */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)' }}>
              <span style={{ color: 'var(--gold)' }}>{String(active).padStart(2, '0')}</span>
              <span style={{ margin: '0 8px', color: 'rgba(255,255,255,0.2)' }}>/</span>
              <span>{String(services.length).padStart(2, '0')}</span>
            </div>
            <div className="srv-arrows" style={{ display: 'flex', gap: '10px' }}>
              {[[-1, 'Previous services', 'M19 12H5M12 5l-7 7 7 7'], [1, 'Next services', 'M5 12h14M12 5l7 7-7 7']].map(([d, label, path]) => (
                <button key={label} onClick={() => scrollByCards(d)} aria-label={label} className="srv-arrow"
                  style={{
                    width: '46px', height: '46px', borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.18)', background: 'transparent',
                    color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s var(--ease)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = 'var(--white)' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={path} /></svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Gallery track */}
      <motion.div
        ref={trackRef}
        className="srv-track"
        role="region"
        aria-label="Services gallery — scroll horizontally"
        tabIndex={0}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-12%' }}
        variants={{ show: { transition: { staggerChildren: reduce ? 0 : 0.07 } } }}
        style={{
          display: 'flex', gap: '24px',
          overflowX: 'auto', overflowY: 'hidden',
          scrollSnapType: 'x mandatory',
          scrollPaddingLeft: 'clamp(20px, 5vw, 80px)',
          padding: '0 clamp(20px, 5vw, 80px)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {services.map((s) => <ServiceCard key={s.name} s={s} reduce={reduce} />)}
      </motion.div>

      {/* Progress rail + hint */}
      <div style={{ padding: '40px clamp(20px, 5vw, 80px) 0', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <button onClick={jumpTo} aria-label="Jump to position"
          style={{ position: 'relative', flex: 1, height: '2px', background: 'rgba(255,255,255,0.12)', border: 'none', padding: 0, display: 'block' }}>
          <motion.div
            animate={{ scaleX: Math.max(0.04, progress || 0.04) }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', background: 'var(--gold)', transformOrigin: 'left' }}
          />
        </button>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="hide-mobile">Drag to explore</span>
          <span className="hide-desktop">Swipe to explore</span>
          <svg width="22" height="8" viewBox="0 0 22 8" fill="none" stroke="currentColor" strokeWidth="1"><path d="M0 4h20M17 1l3 3-3 3" /></svg>
        </span>
      </div>

      <style>{`
        .srv-track { scrollbar-width: none; -ms-overflow-style: none; }
        .srv-track::-webkit-scrollbar { display: none; }
        .srv-track:focus-visible { outline: 1px solid var(--gold); outline-offset: 6px; }
        .srv-card:focus-visible { outline: 1px solid var(--gold); outline-offset: -1px; }
        .srv-arrow:focus-visible { outline: 1px solid var(--gold); outline-offset: 3px; }
        @media (max-width: 760px) { .srv-arrows { display: none !important; } }
        @media (prefers-reduced-motion: reduce) { .srv-track { scroll-behavior: auto; } }
      `}</style>
    </section>
  )
}