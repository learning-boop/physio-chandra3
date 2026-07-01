import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const locs = [
  {
    name: 'Arka Physiotherapy',
    area: 'South Surrey',
    address: 'South Surrey, BC',
    hours: 'Mon – Fri   8:00 am – 7:00 pm\nSaturday   9:00 am – 4:00 pm',
    phone: '+1 (604) 555-0101',
    img: 'images/clinic1.png',
    tagline: 'Comprehensive physiotherapy in the heart of South Surrey.',
  },
  {
    name: 'BC Ice',
    area: 'Burnaby',
    address: 'Burnaby, BC',
    hours: 'Mon – Fri   7:00 am – 8:00 pm\nSaturday   9:00 am – 3:00 pm',
    phone: '+1 (604) 555-0202',
    img: 'images/clinic2.jpg',
    tagline: 'Physiotherapy and rehabilitation services in Burnaby.',
  },
  {
    name: 'Performance Health Group',
    area: 'Guildford',
    address: 'Guildford, Surrey BC',
    hours: 'Mon – Fri   8:00 am – 6:00 pm\nSaturday   10:00 am – 2:00 pm',
    phone: '+1 (604) 555-0303',
    img: 'images/clinic31.jpg',
    tagline: 'Physiotherapy and rehabilitation services in Guildford.',
  },
]

export default function Locations() {
  const [active, setActive] = useState(0)

  return (
    <section id="locations" style={{ background: 'var(--black)', padding: '160px 0', overflow: 'hidden' }}>
      <div style={{ padding: '0 clamp(20px, 5vw, 80px)', marginBottom: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '1px', background: 'var(--gold)' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 300 }}>Locations</span>
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 88px)', fontWeight: 300, lineHeight: 1, color: 'var(--white)' }}>
          Three Clinics.<br /><em>One Chandra.</em>
        </h2>
      </div>

      {/* Tab selectors */}
      <div style={{ padding: '0 clamp(20px, 5vw, 80px)', display: 'flex', gap: '0', marginBottom: '0', borderBottom: '1px solid rgba(255,255,255,0.07)', flexWrap: 'wrap' }}>
        {locs.map((l, i) => (
          <button key={i} onClick={() => setActive(i)}
            style={{
              padding: '20px 40px', background: 'none',
              fontFamily: 'var(--font-body)', fontSize: '12px',
              fontWeight: active === i ? 500 : 300,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: active === i ? 'var(--gold)' : 'rgba(255,255,255,0.3)',
              borderBottom: active === i ? '2px solid var(--gold)' : '2px solid transparent',
              marginBottom: '-1px',
              transition: 'all 0.3s',
            }}>
            {l.name}
          </button>
        ))}
      </div>

      {/* Active location */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}
          className="loc-g"
        >
          {/* Image */}
          <div style={{ height: '540px', overflow: 'hidden' }}>
            <img src={locs[active].img} alt={locs[active].name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Details */}
          <div style={{
            padding: 'clamp(40px, 6vw, 80px)',
            background: 'rgba(255,255,255,0.02)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            borderLeft: '1px solid rgba(255,255,255,0.05)',
          }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 300, marginBottom: '16px' }}>{locs[active].area}</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 500, color: 'var(--white)', marginBottom: '16px', lineHeight: 1.1 }}>{locs[active].name}</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 200, color: 'rgba(255,255,255,0.4)', marginBottom: '48px', lineHeight: 1.7 }}>{locs[active].tagline}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '48px' }}>
              {[['Address', locs[active].address], ['Hours', locs[active].hours], ['Phone', locs[active].phone]].map(([label, val]) => (
                <div key={label}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '6px', fontWeight: 400 }}>{label}</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 200, color: 'rgba(255,255,255,0.6)', whiteSpace: 'pre-line', lineHeight: 1.7 }}>{val}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href={`tel:${locs[active].phone}`} style={{
                padding: '12px 28px', border: '1px solid rgba(255,255,255,0.15)',
                fontFamily: 'var(--font-body)', fontSize: '13px',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)', transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'white'; e.currentTarget.style.color = 'white' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
              >Call Clinic</a>
              <a href="mailto:chandra@physiochandra.ca" style={{
                padding: '12px 28px', background: 'var(--gold)',
                fontFamily: 'var(--font-body)', fontSize: '13px',
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'var(--black)', fontWeight: 500, transition: 'all 0.3s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'white'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--gold)'}
              >Book Appointment</a>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <style>{`
        @media (max-width: 860px) {
          .loc-g { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
