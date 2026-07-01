import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

const steps = [
  { n: '01', title: 'Assessment', body: 'A thorough biomechanical evaluation, movement screening, and clinical history. Time is taken to understand your presentation and what matters most to you.' },
  { n: '02', title: 'Diagnosis', body: 'Clinical reasoning to identify the contributing factors to your pain or limitation. The aim is to understand what is driving your symptoms, not only to address them at the surface level.' },
  { n: '03', title: 'Treatment', body: 'A treatment plan informed by your assessment findings — which may include manual therapy, dry needling, exercise prescription, and other modalities as clinically appropriate.' },
  { n: '04', title: 'Rehabilitation', body: 'Graduated rehabilitation with clear milestones so you understand where you are in your recovery and what to expect at each stage.' },
  { n: '05', title: 'Return to Activity', body: 'Support for return to your desired activities, with education and strategies to help maintain your progress going forward.' },
]

export default function Approach() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const lineH = useTransform(scrollYProgress, [0.1, 0.9], ['0%', '100%'])

  return (
    <section ref={ref} style={{ background: 'var(--cream)', padding: '160px clamp(20px, 5vw, 80px)', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontFamily: 'var(--font-accent)',
        fontSize: 'clamp(80px, 18vw, 260px)',
        color: 'rgba(0,0,0,0.04)',
        pointerEvents: 'none', userSelect: 'none',
        whiteSpace: 'nowrap', lineHeight: 1,
      }}>METHOD</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '80px' }}>
        <div style={{ width: '48px', height: '1px', background: 'var(--gold)' }} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 300 }}>The Approach</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0 64px', maxWidth: '900px' }} className="approach-g">
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }} className="approach-line">
          <div style={{ width: '1px', background: 'rgba(0,0,0,0.1)', height: '100%', position: 'relative' }}>
            <motion.div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: lineH, background: 'var(--gold)' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {steps.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.8 }}
              style={{
                padding: '48px 0',
                borderBottom: i < steps.length - 1 ? '1px solid rgba(0,0,0,0.07)' : 'none',
                display: 'grid', gridTemplateColumns: '60px 1fr', gap: '0 32px', alignItems: 'start',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginTop: '4px', position: 'relative', left: '-32px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.12em', color: 'var(--gold)', marginLeft: '16px', fontWeight: 400 }}>{s.n}</span>
              </div>

              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 500, color: 'var(--text-dark)', marginBottom: '16px' }}>{s.title}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', lineHeight: 1.85, color: 'var(--text-mid)', fontWeight: 200 }}>{s.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .approach-g { grid-template-columns: 1fr !important; gap: 0 !important; }
          .approach-line { display: none !important; }
        }
      `}</style>
    </section>
  )
}
