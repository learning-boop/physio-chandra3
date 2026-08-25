import { motion } from 'framer-motion'

const items = ['Back Pain', 'Neck Pain', 'Sports Injuries', 'Dry Needling', 'Clinical Pilates', 'Manual Therapy', 'Post-Surgery Rehab', 'Chronic Pain', 'Mobility', 'TENS Therapy']

export default function Marquee() {
  const repeated = [...items, ...items, ...items]
  return (
    <div className="marquee" style={{
      background: 'var(--gold)',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 10,
    }}>
      <motion.div
        animate={{ x: ['0%', '-33.33%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'flex', gap: '0', whiteSpace: 'nowrap' }}
      >
        {repeated.map((item, i) => (
          <span key={i} className="marquee-item" style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 400,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'var(--black)',
          }}>
            {item}
            <span className="marquee-dot" style={{ opacity: 0.4 }}>·</span>
          </span>
        ))}
      </motion.div>

      <style>{`
        .marquee { padding: clamp(11px, 3vw, 14px) 0; }
        .marquee-item { font-size: 11px; padding: 0 40px; }
        .marquee-dot { margin-left: 40px; }
        @media (max-width: 600px) {
          .marquee-item { font-size: 10.5px; padding: 0 22px; letter-spacing: 0.16em; }
          .marquee-dot { margin-left: 22px; }
        }
      `}</style>
    </div>
  )
}
