/* Every answer option the pain guide can offer, collected from the same
   question data the site uses. api/anon-share.js keeps an answer only when it
   is one of these, so nothing typed in the person's own words (a name, a
   phone number, one word in an "Other" box) can reach the anonymous copy. */
import { REGIONS } from '../../src/data/symptomGuide.js'
import { PSYCHOSOCIAL_QUESTIONS } from '../../src/data/psychosocial.js'
import { behaviourQuestions } from '../../src/data/painBehaviour.js'
import * as injury from '../../src/data/injuryScreen.js'

function collect(node, out, seen = new Set()) {
  if (!node || typeof node !== 'object' || seen.has(node)) return out
  seen.add(node)
  if (Array.isArray(node.options)) {
    node.options.forEach((o) => { if (o && typeof o.id === 'string') out.add(o.id) })
  }
  for (const v of Array.isArray(node) ? node : Object.values(node)) collect(v, out, seen)
  return out
}

let cache = null
export function knownOptionIds() {
  if (cache) return cache
  const out = new Set()
  collect(REGIONS, out)
  collect(PSYCHOSOCIAL_QUESTIONS, out)
  try { collect(behaviourQuestions(), out) } catch { /* default easers only */ }
  collect(Object.values(injury).filter((v) => v && typeof v === 'object'), out)
  cache = out
  return out
}

// Age is asked in bands whose ids are built at run time: 'a0', 'a18', 'a40' …
export const isAgeBand = (v) => typeof v === 'string' && /^a\d{1,3}$/.test(v)
