/* Small key-value store for the reference-code counter and the anonymous
   copies: Upstash Redis, called over its REST API with plain fetch, so the
   functions need no extra dependency.

   Connect a database in Vercel (Storage → Upstash for Redis → connect to this
   project) and Vercel adds the keys below to the project. Until then
   hasStore() is false: the site hands out offline codes and the anonymous
   copy says it could not be sent. */

function config() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url: url.replace(/\/+$/, ''), token } : null
}

export const hasStore = () => !!config()

// Runs several commands in one round trip, e.g. [['INCR', 'k'], ['EXPIRE', 'k', 60]].
// Returns each command's result; throws if the store answers with an error.
export async function pipeline(commands) {
  const c = config()
  if (!c) throw new Error('store not configured')
  const res = await fetch(`${c.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  })
  if (!res.ok) throw new Error(`store HTTP ${res.status}`)
  const out = await res.json()
  const failed = out.find((r) => r && r.error)
  if (failed) throw new Error(`store: ${failed.error}`)
  return out.map((r) => r.result)
}

// Today's date in the clinic's time zone, as { ymd: '20261011', iso: '2026-10-11' }.
export function clinicDate(now = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Vancouver', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now).map((p) => [p.type, p.value]))
  return { ymd: `${parts.year}${parts.month}${parts.day}`, iso: `${parts.year}-${parts.month}-${parts.day}` }
}
