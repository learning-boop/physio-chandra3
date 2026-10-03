/* Vercel serverless function → /api/anon-review (Chandra only).
   Returns the anonymous copies kept by api/anon-share.js for a range of
   months, for reviewing and improving the guide. Protected by the
   REVIEW_PASSWORD environment variable (set it in Vercel → Settings →
   Environment Variables); without it the function refuses every request.

   GET /api/anon-review?from=2026-10&to=2026-12[&kind=feedback]
   kind=feedback returns the anonymous feedback (api/feedback.js) instead.
   Header: Authorization: Bearer <REVIEW_PASSWORD> */
import { createHash, timingSafeEqual } from 'node:crypto'
import { hasStore, pipeline } from './_lib/store.js'

const MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/
const digest = (s) => createHash('sha256').update(String(s)).digest()

function monthsBetween(from, to) {
  const a = from.match(MONTH), b = to.match(MONTH)
  if (!a || !b) return null
  let y = Number(a[1]), m = Number(a[2])
  const endY = Number(b[1]), endM = Number(b[2])
  const out = []
  while ((y < endY || (y === endY && m <= endM)) && out.length < 36) {
    out.push(`${y}-${String(m).padStart(2, '0')}`)
    m += 1; if (m > 12) { m = 1; y += 1 }
  }
  return out
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  res.setHeader('Cache-Control', 'no-store')
  const secret = process.env.REVIEW_PASSWORD
  const given = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!secret || secret.length < 10 || !given || !timingSafeEqual(digest(secret), digest(given))) {
    return res.status(401).json({ error: 'not authorised' })
  }
  if (!hasStore()) return res.status(503).json({ error: 'storage not configured' })

  const q = req.query || {}
  const months = monthsBetween(String(q.from || ''), String(q.to || q.from || ''))
  if (!months || !months.length) return res.status(400).json({ error: 'from/to must be YYYY-MM' })
  try {
    const prefix = q.kind === 'feedback' ? 'feedback' : 'anon'
    const lists = await pipeline(months.map((mo) => ['LRANGE', `${prefix}:${mo}`, 0, -1]))
    const records = []
    lists.forEach((list) => (list || []).forEach((s) => { try { records.push(JSON.parse(s)) } catch { /* skip */ } }))
    return res.status(200).json({ months, count: records.length, records })
  } catch {
    return res.status(502).json({ error: 'storage unavailable' })
  }
}
