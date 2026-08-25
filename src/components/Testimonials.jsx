import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Patient feedback is published with written consent.
// These accounts reflect individual experiences of the care process only.
// Physiotherapy outcomes vary between patients; no guarantee of outcome is implied.
const reviews = [
  { q: 'The assessment was thorough and my treatment plan was clearly explained at each stage. I felt my individual needs were understood and that my care was guided by what was found in the assessment.', name: 'Sarah M.', cond: 'Lower Back Pain', loc: 'South Surrey' },
  { q: 'Communication throughout was clear and consistent. I was kept informed about the clinical reasoning behind each part of my programme, and my questions were always addressed directly.', name: 'James K.', cond: 'Cervical Injury', loc: 'Burnaby' },
  { q: 'The rehabilitation programme following my surgery was structured with clear milestones. I was kept informed about what each stage involved and what to expect as my programme progressed.', name: 'Priya R.', cond: 'Post-Surgical Rehabilitation', loc: 'Guildford' },
  { q: 'My assessment took into account my activity level and the specific demands of my training. The programme was adjusted based on how things progressed, which I found helpful.', name: 'David L.', cond: 'Sports Injury', loc: 'South Surrey' },
]

export default function Testimonials() {
  const [cur, setCur] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCur(c => (c + 1) % reviews.length), 7000)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="test-sec" style={{
      background: 'var(--warm-white)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '40px', right: 'clamp(20px, 5vw, 80px)',
        fontFamily: 'var(--font-display)', fontSize: 'clamp(120px, 20vw, 300px)',
        lineHeight: 1, color: 'rgba(0,0,0,0.04)', userSelect: 'none', pointerEvents: 'none',
      }}>"</div>

      <div className="test-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ width: '48px', height: '1px', background: 'var(--gold)' }} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 300 }}>Patient Feedback</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }} className="test-g">
        <div className="test-stack" style={{ position: 'relative' }}>
          {reviews.map((r, i) => {
            const offset = (i - cur + reviews.length) % reviews.length
            return (
              <motion.div key={i}
                animate={{
                  y: offset === 0 ? 0 : offset === 1 ? 16 : offset === 2 ? 28 : 36,
                  x: offset === 0 ? 0 : offset === 1 ? 12 : offset === 2 ? 20 : 24,
                  scale: offset === 0 ? 1 : offset === 1 ? 0.96 : 0.92,
                  zIndex: reviews.length - offset,
                  opacity: offset > 2 ? 0 : 1 - offset * 0.25,
                }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="test-card"
                style={{
                  position: 'absolute', inset: 0,
                  background: offset === 0 ? 'var(--text-dark)' : 'var(--mid-gray, #d0ccc5)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                }}
              >
                {offset === 0 && (
                  <>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px, 4vw, 22px)', fontStyle: 'italic', fontWeight: 300, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', marginBottom: 'clamp(20px, 5vw, 32px)' }}>
                      "{r.q}"
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '32px', height: '1px', background: 'var(--gold)' }} />
                      <div>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500, color: 'var(--gold)', marginBottom: '2px' }}>{r.name}</p>
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', fontWeight: 300 }}>{r.cond} · {r.loc}</p>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )
          })}
        </div>

        <div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 68px)', fontWeight: 300, lineHeight: 1.1, color: 'var(--text-dark)', marginBottom: '12px' }}>
            Assessed.<br /><em>Treated.</em><br /><em style={{ fontWeight: 500 }}>Supported.</em>
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--text-mid)', fontWeight: 200, lineHeight: 1.7, marginBottom: '40px', maxWidth: '360px' }}>
            Patient feedback is published with written consent and reflects individual experiences of the care process. Physiotherapy outcomes vary between individuals; no guarantee of outcome is implied or intended.
          </p>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', margin: '0 0 clamp(32px, 8vw, 56px)' }}>
            {reviews.map((_, i) => (
              <button key={i} onClick={() => setCur(i)}
                aria-label={`Show review ${i + 1}`}
                style={{
                  width: i === cur ? '48px' : '20px', height: '44px',
                  padding: 0, background: 'none', border: 'none',
                  display: 'flex', alignItems: 'center',
                  transition: 'width 0.5s',
                }}>
                <span style={{
                  display: 'block', width: '100%', height: '2px',
                  background: i === cur ? 'var(--text-dark)' : 'rgba(0,0,0,0.15)',
                  transition: 'background 0.5s',
                }} />
              </button>
            ))}
          </div>

          <div className="test-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {[['5+', 'Years in Practice'], ['3', 'Clinic Locations'], ['Individual', 'Treatment Plans'], ['Evidence', 'Informed Practice']].map(([n, l]) => (
              <div key={l} style={{ padding: 'clamp(16px, 4.5vw, 24px)', border: '1px solid rgba(0,0,0,0.08)' }}>
                <p style={{ fontFamily: 'var(--font-accent)', fontSize: '32px', color: 'var(--text-dark)', lineHeight: 1, marginBottom: '4px' }}>{n}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-mid)', fontWeight: 300 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .test-sec {
          padding: clamp(88px, 14vw, 160px) clamp(20px, 5vw, 80px);
          padding-left: max(clamp(20px, 5vw, 80px), env(safe-area-inset-left));
          padding-right: max(clamp(20px, 5vw, 80px), env(safe-area-inset-right));
        }
        .test-eyebrow { margin-bottom: clamp(40px, 9vw, 80px); }
        .test-stack { height: 380px; }
        .test-card { padding: clamp(24px, 6vw, 48px); }
        .test-stats { gap: clamp(12px, 3vw, 32px); }

        @media (max-width: 860px) {
          .test-g { grid-template-columns: 1fr !important; gap: clamp(32px, 8vw, 40px) !important; }
          /* Taller stack so the longest quote fits at phone widths. */
          .test-stack { height: clamp(330px, 92vw, 430px); }
        }
      `}</style>
    </section>
  )
}
