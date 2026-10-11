/* ── Understanding what the patient says (voice guide) ─────────────────────
   The browser turns speech into text (TalkingGuide.jsx); these functions,
   on the device, decide what that text means: yes or no to a read-back, a
   command ("repeat", "go back"), or which answer on screen was meant.

   Kept deliberately strict: when it is not clear, nothing is picked and the
   patient is asked again or to tap. A wrong guess costs more than a repeat,
   and every pick is read back for a yes before the guide moves on. */

const NUMBER_WORDS = {
  zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10',
  eleven: '11', twelve: '12', fifteen: '15', twenty: '20', thirty: '30', forty: '40', fifty: '50', sixty: '60', seventy: '70',
}
const ORDINALS = { first: 0, second: 1, third: 2, fourth: 3, fifth: 4, sixth: 5, seventh: 6, eighth: 7, ninth: 8, tenth: 9, last: -1 }
const STOP = new Set(('a an the i im i\'m my me it its it\'s is are was be been to of in on at or and for with by from that this ' +
  'these those than then when what which there do does did have has had so very just about like feel feels feeling ' +
  'think guess maybe yes please option answer one pain painful hurt hurts sore').split(' '))

export const norm = (s) => ' ' + String(s || '').toLowerCase()
  .replace(/[’']/g, "'").replace(/&/g, ' and ')
  .replace(/[^a-z0-9' ]+/g, ' ')
  .split(/\s+/).map((w) => NUMBER_WORDS[w] || w).join(' ')
  .replace(/\s+/g, ' ').trim() + ' '

const has = (t, phrases) => phrases.some((p) => t.includes(' ' + p + ' '))
const IRREGULAR = { fell: 'fall', fallen: 'fall', hurt: 'hurt', woke: 'wake', worse: 'worse', better: 'better', knees: 'knee', feet: 'foot' }
const stem = (w) => IRREGULAR[w] || w.replace(/(ness|ing|ed|es|s)$/, '').replace(/([b-df-hj-np-tv-z])\1$/, '$1')
const words = (s) => norm(s).trim().split(' ').filter((w) => w && !STOP.has(w)).map(stem)

const YES = ['yes', 'yeah', 'yep', 'yup', 'yes please', 'correct', 'right', 'that s right', "that's right", 'it is', 'sure',
  'ok', 'okay', 'confirm', 'continue', 'go on', 'next', 'true', 'absolutely', 'definitely', 'uh huh', 'exactly', 'done',
  'that s it', "that's it", 'that s all', "that's all", 'all done', 'finished', 'perfect', 'good']
const NO = ['no', 'nope', 'nah', 'wrong', 'not right', 'incorrect', 'change', 'change it', 'not quite', 'not really',
  'keep drawing', 'wait', 'hold on', 'no it isn t', "no it isn't"]
const NONE = ['none', 'none of these', 'none of them', 'nothing', 'neither', 'no', 'not any', 'none apply', 'none of those',
  'nothing applies', 'no to all', 'all no']

/* Commands that work whenever the microphone is listening. */
export function command(text) {
  const t = norm(text)
  if (has(t, ['repeat', 'say again', 'say that again', 'pardon', 'what did you say', 'sorry what', 'come again'])) return 'repeat'
  if (has(t, ['go back', 'previous', 'back'])) return 'back'
  if (has(t, ['stop listening', 'microphone off', 'mic off', 'stop the microphone', 'turn off the microphone', 'be quiet',
    'stop talking', 'quiet', 'shut up', 'i ll tap', "i'll tap", 'tap instead'])) return 'stop'
  if (has(t, ['help', 'what do i say', 'what should i say', 'how does this work'])) return 'help'
  return null
}

/* "Yes" / "no" to a read-back; null when it is neither (or both). */
export function yesNo(text) {
  const t = norm(text)
  const n = has(t, NO)
  const y = has(t, YES)
  if (n && !y) return 'no'
  if (y && !n) return 'yes'
  return null
}

/* "None of these" on a safety page. */
export const saysNone = (text) => has(norm(text), NONE) && !has(norm(text), ['yes', 'i have', 'i do', 'i am', 'i ve', "i've"])

/* Which of `options` ([{ id, label, letter, skip }], in screen order) the
   text means. Returns an array of ids (empty when unsure). With `multi`,
   "X and Y" may pick several. */
export function matchOptions(text, options, multi = false) {
  const t = norm(text)
  const usable = options.filter((o) => !o.skip)
  if (!usable.length) return []
  const short = t.trim().split(' ').length <= 3

  // "B", "letter B", "option B" (short answers only: "a" is also a word).
  if (short) {
    const m = t.match(/^ (?:option |letter |answer )?([a-t]) $/)
    if (m) {
      const o = options.find((x) => x.letter && x.letter.toLowerCase() === m[1])
      if (o && !o.skip) return [o.id]
    }
  }
  // "the first one", "the last one", "number 2".
  const ord = t.match(/^ (?:the )?(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|last)(?: one| 1| option| answer)? $/)
  if (ord) {
    const i = ORDINALS[ord[1]]
    const o = i < 0 ? options[options.length - 1] : options[i]
    if (o && !o.skip) return [o.id]
  }
  const num = t.match(/^ (?:number |option )?(\d{1,2}) $/)
  if (num) {
    const o = options[Number(num[1]) - 1]
    if (o && !o.skip) return [o.id]
  }
  // "None of these", "Not sure", "No": the option that starts with it.
  const lead = (re) => usable.find((o) => re.test(o.label.trim()))
  if (has(t, ['not sure', 'don t know', "don't know", 'dont know', 'no idea', 'unsure'])) { const o = lead(/^not sure|^i('| a)m not sure|^don.t know/i); if (o) return [o.id] }
  if (has(t, ['none of these', 'none of them', 'none', 'nothing', 'neither'])) { const o = lead(/^none|^nothing|^neither/i); if (o) return [o.id] }
  if (t.trim() === 'no' || t.trim() === 'nope' || t.trim() === 'no i haven t' || t.trim() === 'no i don t') { const o = lead(/^no\b/i) || lead(/^none/i); if (o) return [o.id] }
  if (t.trim() === 'yes' || t.trim() === 'yeah' || t.trim() === 'yep') { const o = lead(/^yes\b/i); if (o) return [o.id] }

  // By the words of the answer. A word said counts for an option when it is
  // in its label, weighted by how few options share it (a word only one
  // answer has, such as "stairs", is enough on its own). The best must be
  // clearly ahead of the next.
  const labelWords = new Map(usable.map((o) => [o.id, new Set(words(o.label))]))
  const shared = (w) => usable.filter((o) => labelWords.get(o.id).has(w)).length
  const parts = multi ? t.split(/ and also | and | also | plus |,/).map((p) => ' ' + p.trim() + ' ').filter((p) => p.trim()) : [t]
  const picked = []
  for (const part of parts) {
    const said = new Set(words(part))
    if (!said.size) continue
    const scored = usable.map((o) => {
      let sc = 0
      for (const w of labelWords.get(o.id)) if (said.has(w)) sc += 1 / shared(w)
      return { o, s: sc }
    }).sort((a, b) => b.s - a.s)
    const [best, next] = scored
    if (best && best.s >= 0.99 && (!next || best.s - next.s >= 0.5)) picked.push(best.o.id)
  }
  return [...new Set(picked)]
}
