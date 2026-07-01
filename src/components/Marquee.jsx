import { motion } from 'framer-motion'

const items = ['Back Pain', 'Neck Pain', 'Sports Injuries', 'Dry Needling', 'Clinical Pilates', 'Manual Therapy', 'Post-Surgery Rehab', 'Chronic Pain', 'Mobility', 'TENS Therapy']

export default function Marquee() {
  const repeated = [...items, ...items, ...items]
  return (
    <div style={{
      background: 'var(--gold)',
      padding: '14px 0',
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
          <span key={i} style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px', fontWeight: 400,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'var(--black)', padding: '0 40px',
          }}>
            {item}
            <span style={{ marginLeft: '40px', opacity: 0.4 }}>·</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}
