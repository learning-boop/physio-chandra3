import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const articles = [
  {
    category: 'Injury Prevention',
    title: 'Understanding Posture & Its Impact on Pain',
    excerpt: 'Poor posture is one of the leading contributors to neck, upper back, and shoulder pain. Learn how spinal alignment affects your daily comfort and what evidence-based corrections you can make.',
    readTime: '5 min read',
    icon: '🏃',
    tips: [
      'Keep screens at eye level to reduce neck flexion load',
      'Use a lumbar support when sitting for extended periods',
      'Take a 2-minute movement break every 45 minutes',
      'Strengthen deep cervical flexors with chin-tuck exercises',
    ],
  },
  {
    category: 'Rehabilitation',
    title: 'The Science of Tendon Healing',
    excerpt: 'Tendons respond differently to load than muscles. Understanding the stages of tendon repair helps patients stay active during recovery and avoid common setbacks.',
    readTime: '6 min read',
    icon: '🔬',
    tips: [
      'Isometric loading can reduce tendon pain quickly',
      'Avoid complete rest — tendons need progressive load to heal',
      'Ice is less effective than previously thought for tendinopathy',
      'Heavy slow resistance training is highly effective for chronic tendon pain',
    ],
  },
  {
    category: 'Back Pain',
    title: 'Why Most Back Pain Is Not Structural',
    excerpt: 'Imaging findings like disc bulges are common in pain-free populations. Understanding the biopsychosocial model of pain empowers patients to recover confidently.',
    readTime: '7 min read',
    icon: '🦴',
    tips: [
      'Movement is medicine — avoid prolonged bed rest',
      'Disc bulges are present in 60% of asymptomatic 50-year-olds',
      'Fear-avoidance behaviour prolongs recovery',
      'Graded exposure to activity is the gold standard',
    ],
  },
  {
    category: 'Exercise',
    title: 'Clinical Pilates vs Regular Pilates',
    excerpt: 'Physiotherapist-led clinical Pilates is assessment-driven and tailored to individual injury profiles. Here\'s how it differs from gym-based Pilates and when each is appropriate.',
    readTime: '4 min read',
    icon: '🧘',
    tips: [
      'Clinical Pilates begins with a movement screen',
      'Exercises are progressed based on clinical response',
      'Breathing mechanics are assessed and retrained',
      'Core stability targets deep stabilisers, not just superficial muscles',
    ],
  },
  {
    category: 'Sports',
    title: 'Return to Sport: A Criteria-Based Approach',
    excerpt: 'Time-based return to sport protocols are outdated. Modern rehabilitation uses functional criteria, load tolerance, and psychological readiness to guide athletes back safely.',
    readTime: '8 min read',
    icon: '⚡',
    tips: [
      'Limb symmetry index should exceed 90% before return',
      'Psychological readiness is a key predictor of re-injury',
      'Sport-specific movement patterns must be tested, not assumed',
      'Gradual load progression reduces re-injury risk significantly',
    ],
  },
  {
    category: 'Chronic Pain',
    title: 'Pain Education: Changing How You Think About Pain',
    excerpt: 'Pain is an output of the brain, not simply a signal from damaged tissue. Pain neuroscience education reduces catastrophising and improves outcomes in chronic pain patients.',
    readTime: '9 min read',
    icon: '🧠',
    tips: [
      'Pain does not equal tissue damage',
      'The nervous system can become sensitised — and desensitised',
      'Sleep, stress, and mood all influence pain intensity',
      'Active engagement in rehabilitation produces better outcomes than passive treatment alone',
    ],
  },
]

export default function Education() {
  const [expanded, setExpanded] = useState(null)

  return (
    <section style={{ background: 'var(--warm-white)', minHeight: '100vh', paddingTop: '120px', paddingBottom: '120px' }}>
      {/* Header */}
      <div style={{ padding: '0 clamp(20px, 5vw, 80px)', marginBottom: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
          <div style={{ width: '48px', height: '1px', background: 'var(--gold)' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 400 }}>Patient Education</span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(44px, 7vw, 96px)',
          fontWeight: 300, lineHeight: 1,
          color: 'var(--text-dark)',
          marginBottom: '28px',
        }}>
          Know Your<br />
          <em style={{ fontStyle: 'italic' }}>Body Better.</em>
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '17px',
          lineHeight: 1.75, color: 'var(--text-mid)',
          maxWidth: '560px', fontWeight: 300,
        }}>
          Evidence-based articles to help you understand your condition, speed up your recovery, and make informed decisions about your care.
        </p>
      </div>

      {/* Articles grid */}
      <div style={{
        padding: '0 clamp(20px, 5vw, 80px)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))',
        gap: '2px',
      }}>
        {articles.map((a, i) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setExpanded(expanded === i ? null : i)}
            style={{
              background: expanded === i ? 'var(--black)' : '#fff',
              border: '1px solid rgba(0,0,0,0.06)',
              padding: '40px',
              cursor: 'pointer',
              transition: 'background 0.4s, box-shadow 0.4s',
              boxShadow: expanded === i ? '0 24px 48px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
              <div>
                <span style={{
                  fontFamily: 'var(--font-body)', fontSize: '11px',
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: 'var(--gold)', fontWeight: 500,
                  display: 'block', marginBottom: '10px',
                }}>{a.category}</span>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(22px, 2.8vw, 30px)',
                  fontWeight: 400, lineHeight: 1.1,
                  color: expanded === i ? 'var(--white)' : 'var(--text-dark)',
                  transition: 'color 0.4s',
                }}>{a.title}</h3>
              </div>
              <span style={{ fontSize: '28px', flexShrink: 0, marginTop: '4px' }}>{a.icon}</span>
            </div>

            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '15px',
              lineHeight: 1.75, fontWeight: 300,
              color: expanded === i ? 'rgba(255,255,255,0.65)' : 'var(--text-mid)',
              marginBottom: '20px',
              transition: 'color 0.4s',
            }}>{a.excerpt}</p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: '12px',
                color: expanded === i ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',
                letterSpacing: '0.06em',
                transition: 'color 0.4s',
              }}>{a.readTime}</span>
              <motion.span
                animate={{ rotate: expanded === i ? 45 : 0 }}
                style={{
                  width: '28px', height: '28px',
                  border: `1px solid ${expanded === i ? 'rgba(201,169,110,0.5)' : 'rgba(0,0,0,0.15)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: expanded === i ? 'var(--gold)' : 'rgba(8,21,39,0.55)',
                  fontSize: '16px', lineHeight: 1,
                  transition: 'border-color 0.4s, color 0.4s',
                }}>+</motion.span>
            </div>

            <AnimatePresence>
              {expanded === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{
                    marginTop: '32px',
                    paddingTop: '32px',
                    borderTop: '1px solid rgba(201,169,110,0.2)',
                  }}>
                    <p style={{
                      fontFamily: 'var(--font-body)', fontSize: '12px',
                      letterSpacing: '0.2em', textTransform: 'uppercase',
                      color: 'var(--gold)', fontWeight: 500, marginBottom: '20px',
                    }}>Key Takeaways</p>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {a.tips.map((tip, j) => (
                        <motion.li key={j}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: j * 0.06 }}
                          style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}
                        >
                          <span style={{ color: 'var(--gold)', fontSize: '16px', flexShrink: 0, marginTop: '2px' }}>—</span>
                          <span style={{
                            fontFamily: 'var(--font-body)', fontSize: '14px',
                            lineHeight: 1.7, fontWeight: 300,
                            color: 'rgba(255,255,255,0.75)',
                          }}>{tip}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
