/* ── Where "No", "Not sure" and "None of these" sit (Chandra, 4 Oct 2026) ─
   Display order only: ids, scoring and the question data are unchanged, so
   conditions and test patients are not affected.

     • "None of these…" and "Nothing…" are "none of the above": they go LAST,
       after the list has been read (and after "Something else — type it
       below").
     • A "No" or "Not sure" answer (or "no" in other words, such as "Never" or
       "It is not linked to exercise") depends on the question:
         – a yes/no question ("Is…", "Do you…", "Have you…", "In the past
           year, have you…"): FIRST, because it is the direct answer;
         – a list or choice question ("Which…", "What…", "How…", "When…",
           "Tick all that apply"): LAST, after the options it rules out.

   Answers such as "Not on the bone, in the muscle beside it" are real
   answers and keep their place. The self-test opt-outs ("I would rather not
   try", "I have not tried") stay last too, so the test is offered first.

   The emergency and doctor pages are tick lists, not options: their
   "None of these apply — Continue" button stays BELOW the questions, so
   each one is read before it can be skipped. */

const NONE = /^(None\b|Nothing\b)/i
const NO = /^(No\b|Not sure\b|Not stiff\b|Not at all\b)/i

/* "No" in other words (reviewed against every area question). */
const NO_IN_OTHER_WORDS = new Set([
  'Never', 'Rarely or never', 'Neither brings it on', 'Walking does not change it', 'Sitting does not bother me',
  'It is not linked to exercise', 'I do not get headaches', 'I do not get tingling', 'I have no tender spot on the shin',
])

const labelOf = (o) => String((o && (o.label ?? o)) || '').trim()

/** "none" (none of the above), "no" (a direct no or unsure), or "" (a real answer). */
export function kindOf(o) {
  const l = labelOf(o)
  if (NONE.test(l)) return 'none'
  // "No falls, but I feel unsteady", "No; it comes on when I use my forearm":
  // a qualified no is a real answer and keeps its place.
  if (/, but\b|^No;/i.test(l)) return ''
  if (NO.test(l) || NO_IN_OTHER_WORDS.has(l)) return 'no'
  return ''
}
export const isNegative = (o) => kindOf(o) !== ''

/** True when the question asks for a list or a choice rather than a yes/no. */
export function isListQuestion(text = '') {
  const t = String(text).trim()
  if (/tick all|select all|choose any|choose all/i.test(t)) return true
  if (/^(which|what|how|where|when|why)\b/i.test(t)) return true
  // A yes/no question, possibly after an opening phrase ("Since age 40, have you…").
  if (/^(?:[^?]*?,\s*)?(is|are|was|were|do|does|did|have|has|had|can|could|will|would)\b/i.test(t)) return false
  return true
}

/** The options split for display: `head` (a direct "No" first, then the
    real answers), then — where the page offers it — "Something else — type
    it below", then `tail` (the "None" answers and a list question's "No"). */
export function arrangeSplit(options = [], text = '') {
  const list = isListQuestion(text)
  const first = [], middle = [], last = []
  for (const o of options) {
    const k = kindOf(o)
    if (k === 'none' || (k === 'no' && list)) last.push(o)
    else if (k === 'no') first.push(o)
    else middle.push(o)
  }
  return { head: [...first, ...middle], tail: last }
}

/** The options in display order for this question. */
export function arrangeOptions(options = [], text = '') {
  const { head, tail } = arrangeSplit(options, text)
  return [...head, ...tail]
}
