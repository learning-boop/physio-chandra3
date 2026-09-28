/* Vercel serverless function → /api/visit-code.
   Hands out the reference code shown on the results page, the PDF and the
   summary: the clinic date plus the day's running number, 20261011-001,
   20261011-002, … Asked for only when someone reaches their results.

   Only a counter is kept — one number per day, deleted two days later.
   Nothing about the person or their answers is sent or stored here, and the
   anonymous copy (api/anon-share.js) never carries this code. */
import { hasStore, pipeline, clinicDate } from './_lib/store.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!hasStore()) return res.status(503).json({ error: 'counter not configured' })
  try {
    const { ymd } = clinicDate()
    const key = `code:${ymd}`
    const [n] = await pipeline([['INCR', key], ['EXPIRE', key, 2 * 24 * 3600]])
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({ code: `${ymd}-${String(n).padStart(3, '0')}` })
  } catch {
    return res.status(502).json({ error: 'counter unavailable' })
  }
}
