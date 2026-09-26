import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SymptomGuide from './SymptomGuide'
import { ZONE_TO_REGION, REGIONS } from '../data/symptomGuide'

const GOLD = '#c9a96e'

// Leave VITE_API_URL blank for local dev: requests go to the relative path
// '/api/...' which Vite proxies to the backend (see vite.config.js). Only set
// VITE_API_URL when the backend lives on a DIFFERENT origin in production
// (e.g. https://api.physiochandra.com). See .env.example.
const API_URL = import.meta.env.VITE_API_URL || ''

// `aiOnly` renders JUST the AI overview and always calls the API. The guided
// questionnaire below is a whole interactive flow of its own, so it must not be
// dropped into a results screen that has already asked its questions.
// `matched` ([{ region, id }], strongest first) is what the scoring engine
// found; the overview then explains exactly those conditions, so it can never
// contradict the result cards shown above it.
// `onReview` receives the server's validated reasoning pass ({ order, dropped,
// noMatch, concern }) so the result cards above can follow the same order the
// overview explains — or step back to "no clear match" when nothing fits.
/* Privacy: on the results screen (aiOnly) nothing is sent until the person
   chooses to see the overview. Their wellbeing answers (`privateAnswers`)
   and their own notes go only if they also tick the box for them. See the
   privacy notice (src/pages/PrivacyPage.jsx). */
export default function PainAIPanel({ zones, aiOnly = false, answers = null, privateAnswers = null, notes = '', matched = null, onReview = null }) {
  const [consent, setConsent] = useState(false)
  const [includePrivate, setIncludePrivate] = useState(false)
  const hasPrivate = (Array.isArray(privateAnswers) && privateAnswers.length > 0) || !!(notes && notes.trim())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  // Zones covered by Chandra's guided questionnaire go to the SymptomGuide
  // (clinician-authored, on-device) instead of the AI call. Deduped by region.
  const regionOptions = []
  ;(zones || []).forEach((z) => {
    const key = ZONE_TO_REGION[z.type]
    if (key && REGIONS[key] && !regionOptions.some((r) => r.regionKey === key)) {
      regionOptions.push({ regionKey: key, zoneLabel: z.label })
    }
  })
  const useGuide = !aiOnly && regionOptions.length > 0

  // Re-fetch when the answers or the matched conditions change too (the
  // results screen passes them so the overview reflects what the person said,
  // not just where they drew).
  const ansKey = useMemo(
    () => JSON.stringify([answers || null, includePrivate ? [privateAnswers || null, notes || ''] : null, matched || null, consent]),
    [answers, privateAnswers, notes, matched, includePrivate, consent],
  )

  useEffect(() => {
    if (useGuide) { setResult(null); setError(null); setLoading(false); return }
    if (aiOnly && !consent) { setResult(null); setError(null); setLoading(false); return }
    if (!zones || zones.length === 0) {
      setResult(null)
      setError(null)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetch(`${API_URL}/api/pain-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // type lets the server retrieve the approved condition records for
        // these exact regions, so the overview is grounded in that data.
        zones: zones.map(z => ({ type: z.type, label: z.label })),
        answers: (() => {
          const all = [...(Array.isArray(answers) ? answers : []), ...(includePrivate && Array.isArray(privateAnswers) ? privateAnswers : [])]
          return all.length ? all : undefined
        })(),
        notes: includePrivate && notes && notes.trim() ? notes.trim() : undefined,
        // An empty list is meaningful: it tells the server nothing matched,
        // so the overview stays general instead of picking conditions itself.
        matched: Array.isArray(matched) ? matched : undefined,
      }),
      signal: controller.signal,
    })
      .then(res => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`)
        return res.json()
      })
      .then(data => { setResult(data); if (onReview) onReview(data.review || null) })
      .catch(err => {
        if (err.name === 'AbortError') return
        if (onReview) onReview(null)   // unreachable → the rules-only result stands
        // 'Failed to fetch' is a TypeError thrown before any HTTP response —
        // it means the request never reached the server (server down, wrong
        // URL, or blocked mixed content).
        setError(err instanceof TypeError ? 'network' : err.message)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zones, ansKey])

  if (!zones || zones.length === 0) {
    return (
      <div style={panelStyle}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.6 }}>
          Trace a line across the body where you feel pain. The areas your line
          passes through will be analysed here.
        </p>
      </div>
    )
  }

  if (useGuide) {
    const guideKey = regionOptions.map((r) => r.regionKey).join('|')
    return <SymptomGuide key={guideKey} regionOptions={regionOptions} />
  }

  if (aiOnly && !consent) {
    return (
      <div style={panelStyle}>
        <p style={{ margin: '0 0 10px', fontSize: 15, lineHeight: 1.65, color: 'rgba(255,255,255,0.85)' }}>
          This optional overview explains your results in plain language. It is written by an AI
          service: to create it, your drawing and answers are sent securely to this website's
          server and processed by Anthropic, an AI company in the United States.
        </p>
        <p style={{ margin: '0 0 14px', fontSize: 13.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.6)' }}>
          Your name and contact details are not sent. This website does not store what is sent,
          and your results above do not depend on it.{' '}
          <Link to="/privacy" style={{ color: GOLD, textDecoration: 'underline' }}>Read the privacy notice</Link>.
        </p>
        {hasPrivate && (
          <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', margin: '0 0 16px', fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
            <input type="checkbox" checked={includePrivate} onChange={(e) => setIncludePrivate(e.target.checked)}
              style={{ width: 18, height: 18, marginTop: 2, accentColor: GOLD, flexShrink: 0 }} />
            <span>Optional: also include my answers about mood, sleep and work, and anything I typed in my own words.</span>
          </label>
        )}
        <button onClick={() => setConsent(true)}
          style={{
            border: 'none', borderRadius: 999, background: GOLD, color: '#081527', fontWeight: 600,
            fontSize: 14.5, padding: '12px 22px', minHeight: 44, cursor: 'pointer',
          }}>Show my AI overview</button>
      </div>
    )
  }

  return (
    <div style={panelStyle}>
      {!aiOnly && (
        <div style={{ marginBottom: 16 }}>
          <span style={{ color: GOLD, fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Selected Areas
          </span>
          <div style={{ marginTop: 6, color: '#fff', fontSize: 15 }}>
            {zones.map(z => z.label).join(' → ')}
          </div>
        </div>
      )}

      {loading && (
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
          {aiOnly ? 'Looking at your pattern and your answers…' : 'Analysing pain pattern…'}
        </p>
      )}

      {error && (
        <p style={{ color: '#e08a8a', fontSize: 13, lineHeight: 1.6 }}>
          {error === 'network'
            ? "Couldn't reach the analysis service. Make sure the backend is running (in the server folder: npm install, then npm start)."
            : `The analysis service had a problem (${error}). Please try again in a moment.`}
        </p>
      )}

      {result && !loading && (
        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 1.7 }}>
          {result.fallback && (
            <p style={{
              margin: '0 0 14px', padding: '10px 12px', borderRadius: 10, fontSize: 12.5, lineHeight: 1.6,
              border: '1px solid rgba(224,138,138,0.4)', background: 'rgba(224,138,138,0.08)', color: '#e0b0b0',
            }}>
              {result.fromNotes
                ? "Showing the clinic's standard notes for these patterns — the personalised overview isn't available right now."
                : 'Showing standard information — this was not generated for your specific pattern.'}
              {result.reason ? ` (${result.reason})` : ''}
            </p>
          )}
          {aiOnly ? (
            <>
              {/* THE ANSWER the person came for: at most three possibilities,
                  framed as "could be" — never "you have". */}
              <p style={{ margin: '0 0 12px', fontSize: 14.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.75)' }}>
                {Array.isArray(matched) && matched.length
                  ? 'How the patterns above could fit where you drew and what you answered:'
                  : 'Based on where you drew and what you answered, your pain could be associated with:'}
              </p>
              {(result.possibleCauses || []).slice(0, 3).map((c, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, alignItems: 'baseline', marginBottom: 9,
                  border: '1px solid rgba(201,169,110,0.35)', background: 'rgba(201,169,110,0.08)',
                  borderRadius: 12, padding: '13px 15px',
                }}>
                  <span style={{ color: GOLD, fontFamily: 'var(--font-display)', fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: 14.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.88)' }}>{c}</span>
                </div>
              ))}
              <div style={{ marginTop: 16 }}>
                <Section title="What people often notice" items={result.commonSymptoms} />
                <Section title="How physiotherapy may approach it" items={result.suggestedApproach} />
              </div>
            </>
          ) : (
            <>
              <Section title="Possible Causes" items={result.possibleCauses} />
              <Section title="Common Symptoms" items={result.commonSymptoms} />
              <Section title="Suggested Approach" items={result.suggestedApproach} />
            </>
          )}
          <p style={{ marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
            {result.disclaimer || 'This is general information, not a diagnosis. Please book an assessment with Physio Chandra for a proper evaluation.'}
          </p>
        </div>
      )}
    </div>
  )
}

function Section({ title, items }) {
  if (!items || items.length === 0) return null
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ color: GOLD, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
        {title}
      </div>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {items.map((item, i) => <li key={i} style={{ marginBottom: 4 }}>{item}</li>)}
      </ul>
    </div>
  )
}

const panelStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: 'clamp(18px, 5vw, 24px)',
  minHeight: 200,
}
