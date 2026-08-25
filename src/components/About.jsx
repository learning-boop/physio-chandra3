import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function About() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['8%', '-8%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['4%', '-4%'])

  return (
    <section id="about" ref={ref} className="about-sec" style={{
      background: 'var(--black)',
      overflow: 'hidden',
    }}>
      <div className="about-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '48px', height: '1px', background: 'var(--gold)' }} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 300 }}>About</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }} className="about-g">
        <motion.div style={{ y: imgY, position: 'relative' }}>
          <div className="about-img" style={{
            position: 'relative',
            overflow: 'hidden',
          }}>
            <img
              src="images/aboutimg.jpg"
              alt="Physiotherapy"
              style={{ width: '100%', height: '115%', objectFit: 'cover', objectPosition: 'center top' }}
            />
            <div style={{
              position: 'absolute', top: '20px', left: '20px',
              width: '60px', height: '60px',
              borderTop: '2px solid var(--gold)',
              borderLeft: '2px solid var(--gold)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', bottom: '20px', right: '20px',
              width: '60px', height: '60px',
              borderBottom: '2px solid var(--gold)',
              borderRight: '2px solid var(--gold)',
              pointerEvents: 'none',
            }} />
          </div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="about-badge"
            style={{
              position: 'absolute',
              background: 'var(--gold)',
              zIndex: 2,
            }}>
            <p className="about-badge-n" style={{ fontFamily: 'var(--font-accent)', color: 'var(--black)', lineHeight: 1 }}>5+</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(8,21,39,0.7)', marginTop: '4px', fontWeight: 400 }}>Years in Practice</p>
          </motion.div>
        </motion.div>

        <motion.div style={{ y: textY }}>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 5vw, 72px)',
              fontWeight: 300, fontStyle: 'italic',
              lineHeight: 1.05, color: 'var(--white)',
              marginBottom: '8px',
            }}>
            Chandra
          </motion.h2>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.08 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 5vw, 72px)',
              fontWeight: 600,
              lineHeight: 1.05, color: 'var(--white)',
              marginBottom: 'clamp(28px, 6vw, 48px)',
            }}>
            Matla
          </motion.h2>

          <div style={{ width: '40px', height: '1px', background: 'var(--gold)', marginBottom: 'clamp(24px, 6vw, 40px)' }} />

          {[
            'With over 5 years of clinical practice across British Columbia, Chandra Matla is a Registered Physiotherapist with a focus on supporting patients through rehabilitation toward their personal goals.',
            'Treatment is tailored to each individual — informed by your assessment findings, your goals, and your timeline. Care is evidence-based and guided by your progress throughout the process.',
          ].map((p, i) => (
            <motion.p key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
              style={{
                fontFamily: 'var(--font-body)', fontSize: '15px',
                lineHeight: 1.85, color: 'rgba(255,255,255,0.5)',
                fontWeight: 200, marginBottom: '24px',
              }}>
              {p}
            </motion.p>
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="about-stats"
            style={{ display: 'flex', flexWrap: 'wrap' }}>
            {[['3', 'Clinic Locations'], ['BSc', 'Physiotherapy'], ['Evidence', 'Informed Care']].map(([n, l]) => (
              <div key={l}>
                <p style={{ fontFamily: 'var(--font-accent)', fontSize: '32px', color: 'var(--gold)', lineHeight: 1 }}>{n}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: '4px', fontWeight: 300 }}>{l}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        .about-sec {
          padding: clamp(88px, 14vw, 160px) clamp(20px, 5vw, 80px);
          padding-left: max(clamp(20px, 5vw, 80px), env(safe-area-inset-left));
          padding-right: max(clamp(20px, 5vw, 80px), env(safe-area-inset-right));
        }
        .about-eyebrow { margin-bottom: clamp(40px, 9vw, 80px); }
        .about-img { height: clamp(360px, 88vw, 680px); }
        .about-badge { bottom: -32px; right: -32px; padding: 32px 40px; }
        .about-badge-n { font-size: 52px; }
        .about-stats { gap: clamp(24px, 7vw, 48px); margin-top: clamp(36px, 9vw, 56px); }

        @media (max-width: 860px) {
          /* Single column — and the badge tucks inside so it can't be clipped
             by the section's overflow:hidden on a narrow screen. */
          .about-g { grid-template-columns: 1fr !important; gap: clamp(52px, 12vw, 80px) !important; }
          .about-badge { bottom: -22px; right: 0; padding: 22px 26px; }
          .about-badge-n { font-size: 40px; }
        }
        @media (max-width: 420px) {
          .about-badge { padding: 18px 22px; }
          .about-badge-n { font-size: 34px; }
        }
      `}</style>
    </section>
  )
}
