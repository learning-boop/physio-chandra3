import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* Health information here must be accurate, verifiable and consistent with
   current evidence (CHCPBC Marketing, Advertising, and Promotion standard,
   1.1 and 3). Keep claims measured, and give each article its sources. */

const articles = [
  {
    category: 'Injury Prevention',
    title: 'Understanding Posture & Its Impact on Pain',
    excerpt: 'The link between posture and neck or back pain is weaker than many people think. Changing position often, staying active and building strength usually matter more than holding one "correct" posture.',
    readTime: '5 min read',
    icon: '🏃',
    tips: [
      'No single posture is right for everyone; comfortable variety is the aim',
      'Setting a screen near eye level can make long desk work more comfortable',
      'Regular short movement breaks help break up long periods of sitting',
      'Neck strengthening exercises can help some types of neck pain',
    ],
    sources: ['Slater D, et al. "Sit up straight": time to re-evaluate. J Orthop Sports Phys Ther. 2019;49(8):562-564.'],
  },
  {
    category: 'Rehabilitation',
    title: 'The Science of Tendon Healing',
    excerpt: 'Tendons respond differently to load than muscles. Understanding the stages of tendon repair helps patients stay active during recovery and avoid common setbacks.',
    readTime: '6 min read',
    icon: '🔬',
    tips: [
      'Holding exercises (isometrics) may ease tendon pain in the short term for some people',
      'Complete rest is rarely advised: tendons usually respond to gradually increasing load',
      'There is little evidence that ice helps tendon pain in the long term',
      'Heavy, slow strengthening exercise has shown good results in studies of long-standing tendon pain',
    ],
    sources: [
      'Rio E, et al. Isometric exercise induces analgesia and reduces inhibition in patellar tendinopathy. Br J Sports Med. 2015;49(19):1277-1283.',
      'Beyer R, et al. Heavy slow resistance versus eccentric training as treatment for Achilles tendinopathy. Am J Sports Med. 2015;43(7):1704-1711.',
    ],
  },
  {
    category: 'Back Pain',
    title: 'Why Most Back Pain Is Not Structural',
    excerpt: 'Imaging findings like disc bulges are common in pain-free populations. Understanding how pain works can help people stay active and recover with more confidence.',
    readTime: '7 min read',
    icon: '🦴',
    tips: [
      'Staying active is usually recommended; long bed rest is not',
      'In one large review, about 60% of 50-year-olds without back pain had a disc bulge on imaging',
      'Avoiding movement out of fear is linked with slower recovery',
      'Exercise and a gradual return to activity are recommended in clinical guidelines',
    ],
    sources: [
      'Brinjikji W, et al. Systematic literature review of imaging features of spinal degeneration in asymptomatic populations. AJNR Am J Neuroradiol. 2015;36(4):811-816.',
      'National Institute for Health and Care Excellence. Low back pain and sciatica in over 16s: assessment and management (NG59). 2016, updated 2020.',
    ],
  },
  {
    category: 'Exercise',
    title: 'Clinical Pilates vs Regular Pilates',
    excerpt: 'Clinical Pilates led by a physiotherapist starts from an assessment and is adapted to your injury. Here is how it differs from a general Pilates class, and when each may suit you.',
    readTime: '4 min read',
    icon: '🧘',
    tips: [
      'Clinical Pilates begins with a movement screen',
      'Exercises are progressed based on clinical response',
      'Breathing mechanics are assessed and retrained',
      'Exercises are chosen to suit your injury, goals and fitness',
    ],
  },
  {
    category: 'Sports',
    title: 'Return to Sport: A Criteria-Based Approach',
    excerpt: 'Current rehabilitation uses strength and movement tests, how well the body copes with load, and confidence, not time alone, to guide the return to sport.',
    readTime: '8 min read',
    icon: '⚡',
    tips: [
      'After knee ligament surgery, a common target is strength in the injured leg of at least 90% of the other leg',
      'Feeling confident and ready is linked with a successful return to sport',
      'Sport-specific movements are tested, not assumed',
      'Building load gradually is recommended to lower the risk of re-injury',
    ],
    sources: ['Grindem H, et al. Simple decision rules can reduce reinjury risk by 84% after ACL reconstruction: the Delaware-Oslo ACL cohort study. Br J Sports Med. 2016;50(13):804-808.'],
  },
  {
    category: 'Chronic Pain',
    title: 'Pain Education: Changing How You Think About Pain',
    excerpt: 'Pain is produced by the nervous system and is not simply a measure of tissue damage. Learning how pain works, alongside exercise, can help people with long-standing pain.',
    readTime: '9 min read',
    icon: '🧠',
    tips: [
      'Pain does not equal tissue damage',
      'The nervous system can become sensitised — and desensitised',
      'Sleep, stress, and mood all influence pain intensity',
      'Guidelines favour active treatment, such as exercise, over passive treatment alone',
    ],
    sources: ['Louw A, et al. The efficacy of pain neuroscience education on musculoskeletal pain: a systematic review of the literature. Physiother Theory Pract. 2016;32(5):332-355.'],
  },
]

export default function Education() {
  const [expanded, setExpanded] = useState(null)

  return (
    <section className="edu-sec" style={{ background: 'var(--warm-white)', minHeight: '100svh' }}>
      {/* Header */}
      <div className="edu-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'clamp(18px, 5vw, 28px)' }}>
          <div style={{ width: '48px', height: '1px', background: 'var(--gold)' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 400 }}>Patient Education</span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(44px, 7vw, 96px)',
          fontWeight: 300, lineHeight: 1,
          color: 'var(--text-dark)',
          marginBottom: 'clamp(18px, 5vw, 28px)',
        }}>
          Know Your<br />
          <em style={{ fontStyle: 'italic' }}>Body Better.</em>
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 'clamp(15px, 4vw, 17px)',
          lineHeight: 1.75, color: 'var(--text-mid)',
          maxWidth: '560px', fontWeight: 300,
        }}>
          Evidence-informed information to help you understand your condition and make informed decisions about your care.
        </p>
      </div>

      {/* Articles grid */}
      <div className="edu-grid" style={{
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
              padding: 'clamp(24px, 6vw, 40px)',
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
              <span style={{ fontSize: 'clamp(24px, 6vw, 28px)', flexShrink: 0, marginTop: '4px', lineHeight: 1 }}>{a.icon}</span>
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
                    marginTop: 'clamp(22px, 6vw, 32px)',
                    paddingTop: 'clamp(22px, 6vw, 32px)',
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
                    {a.sources && (
                      <div style={{ marginTop: 22 }}>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 500, marginBottom: 8 }}>Sources</p>
                        {a.sources.map((src) => (
                          <p key={src} style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', lineHeight: 1.6, color: 'rgba(255,255,255,0.5)', margin: '0 0 6px' }}>{src}</p>
                        ))}
                      </div>
                    )}
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '12.5px', lineHeight: 1.6, color: 'rgba(255,255,255,0.45)', marginTop: 16 }}>
                      General information only. Ask a health professional about your own situation.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      <style>{`
        .edu-sec { padding: clamp(96px, 16vw, 120px) 0 clamp(80px, 14vw, 120px); }
        .edu-head {
          padding-left: max(clamp(20px, 5vw, 80px), env(safe-area-inset-left));
          padding-right: max(clamp(20px, 5vw, 80px), env(safe-area-inset-right));
          margin-bottom: clamp(44px, 10vw, 80px);
        }
        .edu-grid {
          padding-left: max(clamp(20px, 5vw, 80px), env(safe-area-inset-left));
          padding-right: max(clamp(20px, 5vw, 80px), env(safe-area-inset-right));
        }
      `}</style>
    </section>
  )
}
