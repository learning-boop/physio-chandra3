import { useEffect, useState } from 'react'
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
export default function PainAIPanel({ zones, aiOnly = false }) {
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

  useEffect(() => {
    if (useGuide) { setResult(null); setError(null); setLoading(false); return }
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
      body: JSON.stringify({ zones: zones.map(z => z.label) }),
      signal: controller.signal,
    })
      .then(res => {
        if (!res.ok) throw new Error(`Server responded ${res.status}`)
        return res.json()
      })
      .then(data => setResult(data))
      .catch(err => {
        if (err.name === 'AbortError') return
        // 'Failed to fetch' is a TypeError thrown before any HTTP response —
        // it means the request never reached the server (server down, wrong
        // URL, or blocked mixed content).
        setError(err instanceof TypeError ? 'network' : err.message)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [zones])

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

  return (
    <div style={panelStyle}>
      <div style={{ marginBottom: 16 }}>
        <span style={{ color: GOLD, fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
          Selected Areas
        </span>
        <div style={{ marginTop: 6, color: '#fff', fontSize: 15 }}>
          {zones.map(z => z.label).join(' → ')}
        </div>
      </div>

      {loading && (
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Analysing pain pattern…</p>
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
              Showing standard information — the analysis service is not configured, so this
              was not generated for your specific pattern.
            </p>
          )}
          <Section title="Possible Causes" items={result.possibleCauses} />
          <Section title="Common Symptoms" items={result.commonSymptoms} />
          <Section title="Suggested Approach" items={result.suggestedApproach} />
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