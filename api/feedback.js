/* Vercel serverless function → /api/feedback.
   Anonymous feedback on the pain guide, from the end of the results page,
   used only to improve the guide (Chandra, 2 Oct 2026). Sent only after the
   person fills it in, ticks the confirmation and presses Send.

   What is kept is rebuilt here from scratch, never stored as sent:
   • a few tapped ratings (only the listed values get through);
   • an optional comment, at most 500 characters, with anything that looks
     like an email address, phone number, web address, postal code, long
     number (health card) or "my name is …" removed before it is stored;
   • only if the person ticked it separately: the areas drawn and the
     condition ids shown, no answers;
   • the date only (no time), no IP address or device details, no reference
     code (there is no field for one), and a new random id per entry.
   Never published or used as a testimonial (CHCPBC). Grouped by month and
   deleted about two years later, as the anonymous copies are. */
import { randomUUID } from 'node:crypto'
import { hasStore, pipeline, clinicDate } from './_lib/store.js'
import { scrub } from '../src/data/scrubText.js'

const KEEP_SECONDS = (2 * 365 + 31) * 24 * 3600
const MAX_BODY = 20_000

const ID = /^[a-z0-9_.:-]{1,60}$/i
const isId = (v) => typeof v === 'string' && ID.test(v)
const oneOf = (v, list) => (list.includes(v) ? v : null)

export const SENSE = ['yes', 'partly', 'no', 'unsure']
export const PARTS = ['drawing', 'safety', 'questions', 'results', 'pdf']

// The same clean-up the page runs before sending (../src/data/scrubText.js).
export { scrub }

export function buildFeedback(body, iso) {
  const b = body || {}
  const ease = Number.isInteger(b.ease) && b.ease >= 1 && b.ease <= 5 ? b.ease : null
  const attach = b.attach === true && b.context && typeof b.context === 'object'
  return {
    v: 1,
    id: randomUUID(),
    date: iso,
    ease,
    sense: oneOf(b.sense, SENSE),
    confusing: b.confusing === true ? true : b.confusing === false ? false : null,
    parts: (Array.isArray(b.parts) ? b.parts : []).filter((p) => PARTS.includes(p)).slice(0, PARTS.length),
    comment: scrub(b.comment),
    context: attach
      ? {
          areas: (Array.isArray(b.context.areas) ? b.context.areas : []).filter(isId).slice(0, 30),
          results: (Array.isArray(b.context.results) ? b.context.results : []).slice(0, 10)
            .filter((r) => r && isId(r.id)).map((r) => ({ region: isId(r.region) ? r.region : null, id: r.id })),
        }
      : null,
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!hasStore()) return res.status(503).json({ error: 'storage not configured' })
  let size = 0
  try { size = JSON.stringify(req.body || {}).length } catch { size = Infinity }
  if (size > MAX_BODY) return res.status(413).json({ error: 'too large' })
  // The person must have ticked the confirmation on the page.
  if (!req.body || req.body.consent !== true) return res.status(400).json({ error: 'consent required' })

  const { iso } = clinicDate()
  const record = buildFeedback(req.body, iso)
  if (record.ease === null && !record.sense && record.confusing === null && !record.comment) {
    return res.status(400).json({ error: 'nothing to keep' })
  }
  try {
    const key = `feedback:${iso.slice(0, 7)}`
    await pipeline([['RPUSH', key, JSON.stringify(record)], ['EXPIRE', key, KEEP_SECONDS]])
    return res.status(200).json({ ok: true })
  } catch {
    return res.status(502).json({ error: 'storage unavailable' })
  }
}
