import { motion } from 'framer-motion'
import { useRef } from 'react'

export default function CTA() {
  const ref = useRef(null)

  return (
    <section id="contact" ref={ref} style={{
      background: 'var(--black)',
      padding: '160px clamp(20px, 5vw, 80px)',
      position: 'relative', overflow: 'hidden',
    }}>
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.1, 0.06] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '50%', left: '50%',
          width: '700px', height: '700px',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(201,169,110,0.15) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '40px' }}>
          <div style={{ width: '48px', height: '1px', background: 'var(--gold)' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 300 }}>Get In Touch</span>
          <div style={{ width: '48px', height: '1px', background: 'var(--gold)' }} />
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(44px, 7vw, 96px)',
            fontWeight: 300, lineHeight: 1,
            color: 'var(--white)', marginBottom: '24px',
          }}>
          Begin Your
        </motion.h2>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.1 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(44px, 7vw, 96px)',
            fontWeight: 600, fontStyle: 'italic',
            lineHeight: 1, color: 'var(--gold)',
            marginBottom: '56px',
          }}>
          Rehabilitation.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          style={{
            fontFamily: 'var(--font-body)', fontSize: '17px',
            fontWeight: 300, lineHeight: 1.8,
            color: 'rgba(255,255,255,0.5)', marginBottom: '56px',
          }}>
          Serving South Surrey, Burnaby, and Guildford.<br />
          Three clinic locations. Registered Physiotherapist. Assessment-guided care.
        </motion.p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <motion.a href="mailto:chandra@physiochandra.ca"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            style={{
              padding: '18px 52px', background: 'var(--gold)',
              fontFamily: 'var(--font-body)', fontSize: '13px',
              fontWeight: 500, letterSpacing: '0.13em', textTransform: 'uppercase',
              color: 'var(--black)', transition: 'all 0.3s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'white'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--gold)'}
          >Book Appointment</motion.a>

          <motion.a href="tel:+16045550101"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            style={{
              padding: '18px 52px',
              border: '1px solid rgba(255,255,255,0.15)',
              fontFamily: 'var(--font-body)', fontSize: '13px',
              fontWeight: 300, letterSpacing: '0.13em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)', transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
          >Call Now</motion.a>
        </div>
      </div>
    </section>
  )
}
