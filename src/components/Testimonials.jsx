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
    <section style={{
      background: 'var(--warm-white)',
      padding: '160px clamp(20px, 5vw, 80px)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '40px', right: 'clamp(20px, 5vw, 80px)',
        fontFamily: 'var(--font-display)', fontSize: 'clamp(120px, 20vw, 300px)',
        lineHeight: 1, color: 'rgba(0,0,0,0.04)', userSelect: 'none', pointerEvents: 'none',
      }}>"</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '80px' }}>
        <div style={{ width: '48px', height: '1px', background: 'var(--gold)' }} />
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 300 }}>Patient Feedback</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }} className="test-g">
        <div style={{ position: 'relative', height: '380px' }}>
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
                style={{
                  position: 'absolute', inset: 0,
                  background: offset === 0 ? 'var(--text-dark)' : 'var(--mid-gray, #d0ccc5)',
                  padding: '48px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                }}
              >
                {offset === 0 && (
                  <>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(16px, 2vw, 22px)', fontStyle: 'italic', fontWeight: 300, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', marginBottom: '32px' }}>
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

          <div style={{ display: 'flex', gap: '12px', marginBottom: '56px' }}>
            {reviews.map((_, i) => (
              <button key={i} onClick={() => setCur(i)} style={{
                width: i === cur ? '48px' : '8px', height: '2px',
                background: i === cur ? 'var(--text-dark)' : 'rgba(0,0,0,0.15)',
                transition: 'all 0.5s', border: 'none',
              }} />
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            {[['5+', 'Years in Practice'], ['3', 'Clinic Locations'], ['Individual', 'Treatment Plans'], ['Evidence', 'Informed Practice']].map(([n, l]) => (
              <div key={l} style={{ padding: '24px', border: '1px solid rgba(0,0,0,0.08)' }}>
                <p style={{ fontFamily: 'var(--font-accent)', fontSize: '32px', color: 'var(--text-dark)', lineHeight: 1, marginBottom: '4px' }}>{n}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-mid)', fontWeight: 300 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .test-g { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
      `}</style>
    </section>
  )
}
