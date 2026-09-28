import { useEffect, useMemo, useState } from 'react'

/* /data-review — Chandra's page for the anonymous copies (api/anon-review.js).
   Not linked from the site and hidden from search engines. The password is
   the REVIEW_PASSWORD set in Vercel; it is kept only in this tab's memory. */

const API_URL = import.meta.env.VITE_API_URL || ''
const GOLD = '#c9a96e'
const thisMonth = () => new Date().toISOString().slice(0, 7)
const monthsAgo = (n) => { const d = new Date(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - n); return d.toISOString().slice(0, 7) }

function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = document.createElement('a')
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// One row per copy; nested parts (answers, strokes) as JSON in their cell.
function toCsv(records) {
  const cols = ['date', 'id', 'engine', 'areas', 'faces', 'results', 'flags', 'painType', 'referral', 'answers', 'lines', 'strokes']
  const cell = (v) => {
    const s = v == null ? '' : typeof v === 'string' ? v : JSON.stringify(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const rows = records.map((r) => [
    r.date, r.id, r.engine,
    (r.zones || []).map((z) => z.id || z.type).join(' '),
    (r.zones || []).map((z) => z.face).join(' '),
    (r.results || []).map((x) => `${x.region}/${x.id}`).join(' '),
    (r.flags || []).join(' '),
    r.painType && [r.painType.primary, r.painType.secondary, r.painType.subtype].filter(Boolean).join('/'),
    r.referral, r.answers, r.lines, r.strokes,
  ].map(cell).join(','))
  return [cols.join(','), ...rows].join('\n')
}

export default function DataReviewPage() {
  const [password, setPassword] = useState('')
  const [from, setFrom] = useState(monthsAgo(2))
  const [to, setTo] = useState(thisMonth())
  const [state, setState] = useState({ status: 'idle', records: [], error: '' })

  useEffect(() => {
    const m = document.createElement('meta')
    m.name = 'robots'; m.content = 'noindex, nofollow'
    document.head.appendChild(m)
    return () => m.remove()
  }, [])

  const load = async (e) => {
    e.preventDefault()
    setState({ status: 'busy', records: [], error: '' })
    try {
      const res = await fetch(`${API_URL}/api/anon-review?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
        headers: { Authorization: `Bearer ${password}` },
      })
      const j = await res.json().catch(() => ({}))
      if (res.status === 401) return setState({ status: 'error', records: [], error: 'Wrong password.' })
      if (!res.ok) return setState({ status: 'error', records: [], error: j.error || `Error ${res.status}` })
      setState({ status: 'done', records: j.records || [], error: '' })
    } catch {
      setState({ status: 'error', records: [], error: 'Could not reach the server.' })
    }
  }

  const { records } = state
  const byResult = useMemo(() => {
    const m = new Map()
    records.forEach((r) => (r.results && r.results[0] ? [r.results[0].id] : ['(no match)']).forEach((k) => m.set(k, (m.get(k) || 0) + 1)))
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [records])

  const input = { padding: '10px 12px', borderRadius: 8, border: '1px solid #c8c2b6', fontSize: 15, fontFamily: 'var(--font-body)' }
  const btn = { padding: '10px 18px', borderRadius: 999, border: `1px solid ${GOLD}`, background: GOLD, color: '#081527', fontWeight: 700, cursor: 'pointer', fontSize: 14 }
  const ghost = { ...btn, background: 'transparent', color: '#0a1a2f' }

  return (
    <main style={{ background: 'var(--warm-white)', color: 'var(--text-dark)', minHeight: '100vh', padding: '48px max(20px, 5vw)', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <span style={{ fontSize: 13, letterSpacing: '0.22em', textTransform: 'uppercase', color: GOLD }}>Private</span>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(32px, 5vw, 48px)', margin: '8px 0 6px' }}>Anonymous pain guide copies</h1>
        <p style={{ color: 'var(--text-mid)', margin: '0 0 24px', lineHeight: 1.6 }}>
          Drawings and chosen answers shared anonymously by patients who ticked the box. No names, contact details or reference codes are kept.
        </p>

        <form onSubmit={load} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 24 }}>
          <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>Password
            <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} style={input} required />
          </label>
          <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>From
            <input type="month" value={from} onChange={(e) => setFrom(e.target.value)} style={input} required />
          </label>
          <label style={{ display: 'grid', gap: 4, fontSize: 13 }}>To
            <input type="month" value={to} onChange={(e) => setTo(e.target.value)} style={input} required />
          </label>
          <button type="submit" style={btn} disabled={state.status === 'busy'}>{state.status === 'busy' ? 'Loading…' : 'Load'}</button>
        </form>

        {state.error && <p style={{ color: '#a33', marginBottom: 20 }}>{state.error}</p>}

        {state.status === 'done' && (
          <>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
              <strong style={{ fontSize: 18, marginRight: 8 }}>{records.length} {records.length === 1 ? 'copy' : 'copies'}</strong>
              <button style={ghost} disabled={!records.length} onClick={() => download(`anonymous-copies-${from}-to-${to}.csv`, toCsv(records), 'text/csv')}>Download CSV</button>
              <button style={ghost} disabled={!records.length} onClick={() => download(`anonymous-copies-${from}-to-${to}.json`, JSON.stringify(records, null, 1), 'application/json')}>Download JSON</button>
            </div>

            {byResult.length > 0 && (
              <p style={{ color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: 16 }}>
                Top result: {byResult.slice(0, 8).map(([k, n]) => `${k} (${n})`).join(' · ')}
              </p>
            )}

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '2px solid #d8d2c6' }}>
                    {['Date', 'Areas', 'Results', 'Flags', 'Answers'].map((h) => <th key={h} style={{ padding: '8px 10px' }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {records.slice().reverse().slice(0, 300).map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #e6e1d7', verticalAlign: 'top' }}>
                      <td style={{ padding: '8px 10px', whiteSpace: 'nowrap' }}>{r.date}</td>
                      <td style={{ padding: '8px 10px' }}>{(r.zones || []).map((z) => `${z.id || z.type}${z.face === 'back' ? ' (back)' : ''}`).join(', ')}</td>
                      <td style={{ padding: '8px 10px' }}>{(r.results || []).map((x) => x.id).join(', ') || '—'}</td>
                      <td style={{ padding: '8px 10px' }}>{(r.flags || []).join(', ') || '—'}</td>
                      <td style={{ padding: '8px 10px' }}>{Object.keys(r.answers || {}).length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {records.length > 300 && <p style={{ color: 'var(--text-mid)', marginTop: 10 }}>Showing the latest 300. Download for all of them.</p>}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
