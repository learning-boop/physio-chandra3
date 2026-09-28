/* Vercel serverless function → /api/anon-share.
   Keeps an ANONYMOUS copy of a completed pain guide — the drawing and the
   answers chosen — used only to improve and train the guide. Sent only when
   the person ticks the (unticked by default) box on the results page.

   What is kept is rebuilt here from scratch, never stored as sent:
   • no name, contact details or reference code (the page has none to send
     except the code, and this function has no field for it);
   • no free text — every answer must be an option id, so anything typed in
     the person's own words cannot get through;
   • the date only (no time), and no IP address or device details;
   • a new random id per copy, so copies cannot be linked to each other.
   Copies are grouped by month and deleted about two years later. */
import { randomUUID } from 'node:crypto'
import { hasStore, pipeline, clinicDate } from './_lib/store.js'
import { knownOptionIds, isAgeBand } from './_lib/optionIds.js'

const KEEP_SECONDS = (2 * 365 + 31) * 24 * 3600
const MAX_BODY = 200_000

const ID = /^[a-z0-9_.:-]{1,60}$/i
const isId = (v) => typeof v === 'string' && ID.test(v)
const num = (v, d = 3) => (Number.isFinite(v) ? Math.round(v * 10 ** d) / 10 ** d : null)
const ids = (a, max = 60) => (Array.isArray(a) ? a.filter(isId).slice(0, max) : [])
// Answer keys that hold the person's own words.
const FREE_TEXT = new Set(['notes', 'q5'])

// An answer is kept only when it is an option the guide itself offers.
function cleanAnswers(a) {
  const out = {}
  if (!a || typeof a !== 'object') return out
  const known = knownOptionIds()
  const ok = (k, v) => isId(v) && (known.has(v) || (k === 'age' && isAgeBand(v)))
  for (const [k, v] of Object.entries(a).slice(0, 400)) {
    if (!isId(k) || FREE_TEXT.has(k)) continue
    if (ok(k, v)) out[k] = v
    else if (Array.isArray(v)) { const l = v.filter((x) => ok(k, x)).slice(0, 20); if (l.length) out[k] = l }
  }
  return out
}

function cleanStrokes(s) {
  if (!Array.isArray(s)) return []
  return s.slice(0, 40).map((line) => (Array.isArray(line) ? line.slice(0, 600) : [])
    .filter((p) => Array.isArray(p) && p.length === 3 && p.every(Number.isFinite))
    .map((p) => p.map((x) => num(x))))
    .filter((line) => line.length > 1)
}

export function buildRecord(body, iso) {
  const b = body || {}
  return {
    v: 1,
    id: randomUUID(),
    date: iso,
    engine: isId(b.engine) ? b.engine : null,
    strokes: cleanStrokes(b.strokes),
    zones: (Array.isArray(b.zones) ? b.zones : []).slice(0, 40)
      .filter((z) => z && isId(z.type))
      .map((z) => ({ id: isId(z.id) ? z.id : null, type: z.type, face: z.face === 'back' ? 'back' : 'front', ink: num(z.ink) })),
    lines: (Array.isArray(b.lines) ? b.lines : []).slice(0, 40).map((l) => ids(l, 20)),
    answers: cleanAnswers(b.answers),
    flags: ids(b.flags),
    results: (Array.isArray(b.results) ? b.results : []).slice(0, 30)
      .filter((r) => r && isId(r.id)).map((r) => ({ region: isId(r.region) ? r.region : null, id: r.id })),
    referral: (Array.isArray(b.referral) ? b.referral : []).slice(0, 6)
      .filter((r) => r && isId(r.kind)).map((r) => ({ kind: r.kind, side: isId(r.side) ? r.side : null, reach: isId(r.reach) ? r.reach : null })),
    painType: b.painType && isId(b.painType.primary)
      ? { primary: b.painType.primary, secondary: isId(b.painType.secondary) ? b.painType.secondary : null, subtype: isId(b.painType.subtype) ? b.painType.subtype : null }
      : null,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!hasStore()) return res.status(503).json({ error: 'storage not configured' })
  let size = 0
  try { size = JSON.stringify(req.body || {}).length } catch { size = Infinity }
  if (size > MAX_BODY) return res.status(413).json({ error: 'too large' })

  const { iso } = clinicDate()
  const record = buildRecord(req.body, iso)
  if (!record.strokes.length && !record.zones.length) return res.status(400).json({ error: 'nothing to keep' })
  try {
    const key = `anon:${iso.slice(0, 7)}`
    await pipeline([['RPUSH', key, JSON.stringify(record)], ['EXPIRE', key, KEEP_SECONDS]])
    return res.status(200).json({ ok: true })
  } catch {
    return res.status(502).json({ error: 'storage unavailable' })
  }
}
