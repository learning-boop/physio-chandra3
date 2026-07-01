import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const conditions = [
  { name: 'Back Pain',  desc: 'Acute and chronic lumbar conditions, postural concerns, disc-related pain, and sciatica. Assessment-guided manual therapy and progressive rehabilitation.', img: 'images/back-pain3.png' },
  { name: 'Neck Pain',  desc: 'Cervicogenic pain, whiplash-associated disorders, and thoracic outlet presentations. Joint mobilization, soft tissue therapy, and targeted exercise.', img: 'images/neck-pain.png' },
  { name: 'Sports Injuries', desc: 'Ligament sprains, tendinopathies, and stress-related injuries. Rehabilitation programs are guided by individual assessment and functional testing.', img: 'images/sports.png' },
  { name: 'Headaches', desc: 'Cervicogenic headaches and tension-type presentations. Cervical spine assessment and targeted physical therapy to address contributing musculoskeletal factors.', img: 'images/Headaches.png'},
  { name: 'Post-Surgery',  desc: 'Joint replacements, ACL reconstruction, and rotator cuff repair. Structured, phase-based rehabilitation guided by surgical protocols and clinical progress.', img: 'images/Post-Surgery.png' },
  { name: 'Chronic Pain', desc: 'Fibromyalgia and long-term musculoskeletal conditions. A multi-modal approach combining manual therapy with patient education and graded activity.', img: 'images/Chronic Pain.png' },
  { name: 'Workplace Injuries', desc: 'Repetitive strain and occupational overuse conditions. Rehabilitation designed to support safe and durable return to work, in collaboration with relevant stakeholders.', img: 'images/workplace2.png' },
  // { name: 'Mobility & Movement', num: '08', desc: 'Age-related stiffness, joint restriction, and movement limitations. Progressive therapeutic exercise to support functional independence and quality of life.', img: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=900&q=80&auto=format&fit=crop' },
]

export default function Conditions() {
  const [active, setActive] = useState(0)

  return (
    <section id="conditions" style={{ background: 'var(--warm-white)', padding: '140px 0 160px', overflow: 'hidden' }}>
      <div style={{ padding: '0 clamp(20px, 5vw, 80px)', marginBottom: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '1px', background: 'var(--gold)' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '15px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 400 }}>Conditions</span>
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(40px, 6vw, 88px)',
          fontWeight: 300, lineHeight: 1,
          color: 'var(--text-dark)',
        }}>
          Conditions We<br />
          <em style={{ fontStyle: 'italic' }}>Assess & Treat.</em>
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '600px' }} className="cond-g">
        <div style={{ padding: '0 clamp(20px, 5vw, 80px)', borderRight: '1px solid rgba(0,0,0,0.06)' }}>
          {conditions.map((c, i) => (
            <motion.div
              key={c.name}
              onClick={() => setActive(i)}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              style={{
                padding: '28px 0',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                cursor: 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                gap: '24px',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: active === i ? '12px' : '0', transition: 'margin 0.4s' }}>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: '12px',
                    color: active === i ? 'var(--gold)' : 'rgba(0,0,0,0.25)',
                    letterSpacing: '0.1em', fontWeight: 300,
                    transition: 'color 0.3s',
                  }}>{c.num}</span>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(20px, 2.5vw, 30px)',
                    fontWeight: active === i ? 500 : 300,
                    color: active === i ? 'var(--text-dark)' : 'rgba(0,0,0,0.35)',
                    transition: 'all 0.4s',
                  }}>{c.name}</h3>
                </div>
                <AnimatePresence>
                  {active === i && (
                    <motion.div
                      key="expand"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{ overflow: 'hidden' }}
                    >
                      {/* Mobile-only image — desktop uses the sticky panel instead */}
                      <img
                        className="cond-mobile-img"
                        src={c.img}
                        alt={c.name}
                        loading="lazy"
                        style={{
                          width: '100%', height: '240px', objectFit: 'cover',
                          marginTop: '4px', marginBottom: '20px',
                        }}
                      />
                      <p style={{
                        fontFamily: 'var(--font-body)', fontSize: '15px',
                        lineHeight: 1.8, color: 'var(--text-mid)',
                        fontWeight: 200, paddingLeft: '30px',
                      }}>{c.desc}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <motion.div
                animate={{ rotate: active === i ? 45 : 0 }}
                style={{
                  width: '20px', height: '20px', flexShrink: 0, marginTop: '4px',
                  border: '1px solid rgba(0,0,0,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                <span style={{ fontSize: '14px', color: 'rgba(0,0,0,0.4)', lineHeight: 1 }}>+</span>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }} className="cond-img">
          <AnimatePresence mode="wait">
            <motion.img
              key={active}
              src={conditions[active].img}
              alt={conditions[active].name}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </AnimatePresence>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)' }} />
          <div style={{
            position: 'absolute', bottom: '40px', left: '40px',
            fontFamily: 'var(--font-accent)',
            fontSize: '80px', lineHeight: 1,
            color: 'rgba(255,255,255,0.08)',
            userSelect: 'none',
          }}>
            {conditions[active].num}
          </div>
        </div>
      </div>

      <style>{`
        .cond-mobile-img { display: none; }
        @media (max-width: 860px) {
          .cond-g { grid-template-columns: 1fr !important; }
          .cond-img { display: none !important; }
          .cond-mobile-img { display: block; }
        }
      `}</style>
    </section>
  )
}