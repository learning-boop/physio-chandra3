/* ── Understanding what the patient says (voice guide) ─────────────────────
   The browser turns speech into text (TalkingGuide.jsx); these functions,
   on the device, decide what that text means: yes or no to a read-back, a
   command ("repeat", "go back"), or which answer on screen was meant.

   By meaning, not only the words on the button (Chandra, 14 Oct 2026):
   "nah", "absolutely not", "I don't think so" are a no; "I'm 45" picks
   30 to 49; "about three weeks" picks 2 to 6 weeks; "tingling" finds pins
   and needles. When two answers fit about equally, nothing is guessed:
   the assistant asks which one (matchDetail → close). */

const NUMBER_WORDS = {
  zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7', eight: '8', nine: '9', ten: '10',
  eleven: '11', twelve: '12', thirteen: '13', fourteen: '14', fifteen: '15', sixteen: '16', seventeen: '17', eighteen: '18',
  nineteen: '19', twenty: '20', thirty: '30', forty: '40', fifty: '50', sixty: '60', seventy: '70', eighty: '80', ninety: '90',
}
const ORDINALS = { first: 0, second: 1, third: 2, fourth: 3, fifth: 4, sixth: 5, seventh: 6, eighth: 7, ninth: 8, tenth: 9, last: -1 }
const STOP = new Set(('a an the i im i\'m my me it its it\'s is are was be been to of in on at or and for with by from that this ' +
  'these those than then when what which there do does did have has had so very just about like feel feels feeling ' +
  'think guess maybe yes please option answer one pain painful hurt hurts sore yeah yep no nope nah well um uh erm hmm oh ' +
  'mostly really actually probably definitely absolutely kind sort bit little lot get gets got how because but also too ' +
  'would say said mean meant pick choose go with thing stuff usually generally').split(' '))

export const norm = (s) => ' ' + String(s || '').toLowerCase()
  .replace(/[’']/g, "'").replace(/&/g, ' and ')
  .replace(/[^a-z0-9' ]+/g, ' ')
  .split(/\s+/).map((w) => NUMBER_WORDS[w] || w).join(' ')
  .replace(/\s+/g, ' ').trim() + ' '

const has = (t, phrases) => phrases.some((p) => t.includes(' ' + p + ' '))
const IRREGULAR = { fell: 'fall', fallen: 'fall', hurt: 'hurt', woke: 'wake', worse: 'worse', better: 'better', knees: 'knee', feet: 'foot',
  sat: 'sit', bent: 'bend', ran: 'run', swollen: 'swell', stood: 'stand', slept: 'sleep', lay: 'ly', lying: 'ly', lie: 'ly' }
// Word endings off ("driving", "drive" → "driv"), so forms of a word meet.
const stem = (x) => { const w = IRREGULAR[x] || x; return w.length <= 3 ? w : w.replace(/(ness|ing|ed|es|s)$/, '').replace(/([b-df-hj-np-tv-z])\1$/, '$1').replace(/(.{3,})e$/, '$1') }
// Everyday words for the words on the buttons (by stem).
const SYN = {
  // Sex at birth (Chandra, 14 Oct 2026: not recognised by voice). Speech
  // services often write "male" as mail / Mel / meal, and people say "a man".
  mail: ['mal'], mel: ['mal'], meal: ['mal'], man: ['mal'], men: ['mal'], boy: ['mal'], guy: ['mal'], gentleman: ['mal'],
  masculin: ['mal'], woman: ['femal'], women: ['femal'], girl: ['femal'], lady: ['femal'], ladi: ['femal'], feminin: ['femal'],
  femail: ['femal'], femel: ['femal'], other: ['intersex', 'prefer'], rather: ['prefer'], nonbinary: ['intersex', 'prefer'],
  tingl: ['pin', 'needl'], tingly: ['pin', 'needl'], prickl: ['pin', 'needl'], prickly: ['pin', 'needl'], numb: ['numb'],
  stab: ['sharp'], knif: ['sharp'], zap: ['electric', 'shoot'], shock: ['electric'], achy: ['ach', 'dull'], ach: ['dull'],
  throb: ['ach'], puffy: ['swell'], swel: ['swell'], trip: ['fall'], tripp: ['fall'], step: ['stair'], upstair: ['stair'],
  downstair: ['stair', 'down'], seat: ['sit'], chair: ['sit'], desk: ['sit'], car: ['driv'], sleep: ['night'], bed: ['night'],
  job: ['work'], operation: ['surgery'], op: ['surgery'], jog: ['run'], stoop: ['bend'], lean: ['bend'], pick: ['lift'],
  carry: ['lift'], turn: ['twist'], easier: ['eas', 'better'], relief: ['eas'], reliev: ['eas'], help: ['eas'], same: ['both', 'sam'],
  equal: ['both', 'sam'], equally: ['both', 'sam'], both: ['sam'], scan: ['scan', 'x'], xray: ['x', 'ray'], injection: ['injection'], shot: ['injection'], pop: ['pop'],
  give: ['way'], buckl: ['give', 'way'], lock: ['lock'], stuck: ['lock', 'catch'], click: ['click'], weak: ['weak'],
  gym: ['sport', 'exercis'], play: ['sport'], game: ['sport'],
}
const words = (s) => norm(s).trim().split(' ').filter((w) => w && !STOP.has(w)).map(stem)
const saidWords = (s) => { const out = new Set(); for (const w of words(s)) { out.add(w); for (const x of SYN[w] || []) out.add(x) } return out }

const NONE = ['none', 'none of these', 'none of them', 'nothing', 'neither', 'no', 'nope', 'nah', 'not any', 'none apply', 'none of those',
  'nothing applies', 'no to all', 'all no', 'nothing like that', 'none of that', 'not at all', 'absolutely not', 'not one',
  'i don t have any', "i don't have any", 'don t have any', "don't have any", 'no none', 'no nothing']

/* Commands that work whenever the microphone is listening. */
export function command(text) {
  const t = norm(text)
  const n = t.trim().split(' ').length
  if (has(t, ['repeat', 'say again', 'say that again', 'pardon', 'what did you say', 'sorry what', 'come again'])) return 'repeat'
  // Going back: "go back", "previous", or "back" on its own, never "my lower
  // back" (an answer).
  if (has(t, ['go back', 'previous question', 'previous one', 'last question', 'take me back', 'go to the previous']) ||
    /^ (back|previous|back please|go back please) $/.test(t)) return 'back'
  // Moving on, the way people say it (Chandra, 13 Oct 2026: "go for next").
  // Short phrases only, so an answer that mentions "next to" is not taken.
  if (n <= 6 && (has(t, ['next', 'go next', 'go for next', 'next question', 'next one', 'next please', 'continue', 'go on', 'move on',
    'carry on', 'keep going', 'let s go', "let's go", 'lets go', 'proceed', 'go ahead', 'moving on', 'skip ahead', 'forward']) && !has(t, ['next to']))) return 'next'
  if (has(t, ['stop listening', 'microphone off', 'mic off', 'stop the microphone', 'turn off the microphone', 'be quiet',
    'stop talking', 'quiet', 'shut up', 'i ll tap', "i'll tap", 'tap instead'])) return 'stop'
  if (has(t, ['help', 'what do i say', 'what should i say', 'how does this work'])) return 'help'
  return null
}

/* Calling the assistant (Chandra, 14 Oct 2026): "Chandra", "hey Chandra",
   "hello Chandra", or just "hey" / "hello" on its own. Speech services
   often hear the name as Sandra, Shandra or Chandler, so those count too.
   Returns { wake, rest }: the call itself, and whatever was said after it
   ("hey Chandra, next" → rest "next"); null when there is no call. */
const WAKE_NAME = '(?:chandra|chandras|shandra|sandra|chandler|tandra|chanda|chandar)'
const WAKE_RE = new RegExp(`^\\s*((?:(?:hey|hi|hello|ok|okay|excuse me)\\s+)?${WAKE_NAME})\\b[\\s,.!?]*(.*)$`, 'i')
const GREET_RE = /^\s*((?:hey|hi|hello)(?: there)?)[\s,.!?]*$/i
export function wakeWord(text) {
  const t = String(text || '').trim()
  const m = t.match(WAKE_RE)
  if (m) return { wake: m[1], rest: m[2].trim() }
  const g = t.match(GREET_RE)
  if (g) return { wake: g[1], rest: '' }
  return null
}

/* Yes, no or not sure, the way people say it: "nah", "absolutely not",
   "I don't think so", "not at all" (no); "yeah", "of course", "I do",
   "it does" (yes); "no idea", "hard to say" (not sure). null otherwise. */
const UNSURE = ['not sure', 'don t know', "don't know", 'dont know', 'do not know', 'no idea', 'unsure', 'not certain', 'can t say',
  "can't say", 'cannot say', 'hard to say', 'can t tell', "can't tell", 'cannot tell', 'not too sure', 'no clue', 'who knows']
const NO_START = /^ (no|nope|nah|naw|nay|na|negative|never|none|nothing|not|nor|neither|wrong|incorrect|i don't|i dont|i do not|i haven't|i havent|i have not|i'm not|im not|i am not|i didn't|i didnt|i did not|it doesn't|it doesnt|it does not|it isn't|it isnt|it's not|its not|it is not|it hasn't|it has not|it wasn't|it was not|there isn't|there's no|there is no|i wouldn't|i would not|i can't|i cannot|disagree)\b/
const NO_ANY = ['none', 'absolutely none', 'nothing at all', 'absolutely not', 'definitely not', 'certainly not', 'of course not', 'not at all', 'no way', 'not really', 'not quite',
  'i don t think so', "i don't think so", 'don t think so', "don't think so", 'not that i know', 'not that i m aware', "not that i'm aware",
  'not right', 'not me', 'nothing like that', 'never had', 'never have', 'not at the moment', 'not now', 'not anymore', 'disagree']
const YES_START = /^ (yes|yeah|yea|yep|yup|ya|yah|aye|sure|absolutely|definitely|certainly|of course|correct|right|exactly|indeed|totally|true|affirmative|uh huh|mm hmm|mhm|i do|i have|i am|i'm afraid so|it does|it is|it has|it did|i did|that's right|thats right|that is right|that's it|thats it|agree|i agree|you bet|for sure|ok|okay|yes please|done|all done|finished|perfect|good|correct)\b/
const YES_ANY = ['that s right', "that's right", 'that is right', 'i think so', 'i believe so', 'pretty much', 'for sure', 'of course',
  'that s correct', "that's correct", 'sounds right', 'yes it is', 'yes i do', 'yes i have', 'i agree']
export function intent(text) {
  const t = norm(text)
  if (has(t, UNSURE)) return 'unsure'
  if (has(t, NO_ANY) || NO_START.test(t)) return 'no'
  if (YES_START.test(t) || has(t, YES_ANY)) return 'yes'
  if (/ (maybe|perhaps|sometimes|kind of|sort of|a bit|a little) /.test(t)) return 'unsure'
  return null
}

/* "Yes" / "no" to a read-back; null when it is neither. */
export function yesNo(text) {
  const t = norm(text)
  const i = intent(text)
  if (i === 'yes' || i === 'no') return i
  if (has(t, ['continue', 'go on', 'next', 'confirm'])) return 'yes'
  if (has(t, ['change', 'change it', 'wait', 'hold on', 'keep drawing', 'go back'])) return 'no'
  return null
}

/* Numbers said for an age or a length of time, matched to answers such as
   "30 to 49" or "6 weeks to 3 months". */
const UNIT_WEEKS = { day: 1 / 7, week: 1, month: 4.35, year: 52 }
const unitOf = (w) => (w || '').replace(/s$/, '')
// "40 5" (forty five) → 45; "a couple" → 2; "few" → 3.
const numbersIn = (t) => t.replace(/ (\d0) ([1-9]) /g, (m, a, b) => ` ${Number(a) + Number(b)} `)
  .replace(/ (a couple of|a couple|couple of|couple) /g, ' 2 ').replace(/ (a few|few|several) /g, ' 3 ')
  .replace(/ (a|an|one) (day|week|month|year)/g, ' 1 $2').replace(/ half a year /g, ' 6 months ')
const DECADES = { twenties: 25, thirties: 35, forties: 45, fifties: 55, sixties: 65, seventies: 75, eighties: 85, nineties: 95, teens: 15 }
function rangeOf(label) {
  const t = norm(label).replace(/ or over | and over | or more | plus /, ' + ')
  let m
  const u = (x) => UNIT_WEEKS[unitOf(x)] || null
  if ((m = t.match(/^ (?:less than|under|below) (\d+)(?: (days?|weeks?|months?|years?))? $/))) return { lo: -Infinity, hi: Number(m[1]) * (u(m[2]) || 1), hiOpen: true, unit: !!m[2] }
  if ((m = t.match(/^ (?:more than|over|above) (\d+)(?: (days?|weeks?|months?|years?))? $/))) return { lo: Number(m[1]) * (u(m[2]) || 1), hi: Infinity, loOpen: true, unit: !!m[2] }
  if ((m = t.match(/^ (\d+)(?: (days?|weeks?|months?|years?))? \+ $/))) return { lo: Number(m[1]) * (u(m[2]) || 1), hi: Infinity, unit: !!m[2] }
  if ((m = t.match(/^ (\d+)(?: (days?|weeks?|months?|years?))? to (\d+)(?: (days?|weeks?|months?|years?))? $/))) {
    const u2 = u(m[4]); const u1 = u(m[2]) || u2
    return { lo: Number(m[1]) * (u1 || 1), hi: Number(m[3]) * (u2 || 1), unit: !!(m[2] || m[4]) }
  }
  return null
}
function valueSaid(t, withUnit) {
  const x = numbersIn(t)
  if (withUnit) {
    if (/ (today|yesterday|last night|this morning|since this morning|hours?|just now) /.test(x)) return 0.1
    if (/ (last week|since last week) /.test(x)) return 1
    if (/ (last month|since last month) /.test(x)) return 4.35
    if (/ (last year|since last year|ages|forever|for years) /.test(x)) return 52
    const m = x.match(/ (\d+(?:\.\d+)?) (?:and a half )?(days?|weeks?|months?|years?) /)
    if (m) return (Number(m[1]) + (/ and a half /.test(x) ? 0.5 : 0)) * UNIT_WEEKS[unitOf(m[2])]
    return null
  }
  for (const [k, v] of Object.entries(DECADES)) if (x.includes(' ' + k + ' ')) return v
  const m = x.match(/ (\d{1,3}) /)
  return m ? Number(m[1]) : null
}
function byRange(t, options) {
  const ranges = options.map((o) => (o.skip ? null : rangeOf(o.label)))
  if (ranges.filter(Boolean).length < 2) return null
  const withUnit = ranges.some((r) => r && r.unit)
  const v = valueSaid(t, withUnit)
  if (v === null) return null
  const i = ranges.findIndex((r) => r && (r.loOpen ? v > r.lo : v >= r.lo) && (r.hiOpen ? v < r.hi : v <= r.hi))
  return i >= 0 ? options[i].id : null
}

/* "None of these" on a safety page. */
export const saysNone = (text) => has(norm(text), NONE) && !has(norm(text), ['yes', 'i have', 'i do', 'i am', 'i ve', "i've"])

/* Which of `options` ([{ id, label, letter, skip }], in screen order) the
   text means: { ids, close }. `ids` is empty when unsure; `close` then
   holds the two answers that fit about equally (to ask which one). With
   `multi`, "X and Y" may pick several. */
const NEG_LABEL = /^(no\b|none|neither|nothing|disagree|not\b|never|it does not|it doesn.t|walking does not)/i
const POS_LABEL = /^(yes\b|agree\b)/i
const UNSURE_LABEL = /not sure|don.t know|cannot (tell|find|say)|unsure/i
export function matchDetail(text, options, multi = false) {
  // Heard as two words: "fee mail", "fe male"; "non binary".
  let t = norm(text).replace(/ (fee|fe|fi) ?(male|mail|mel|meal) /g, ' female ').replace(/ non binary /g, ' nonbinary ')
  const usable = options.filter((o) => !o.skip)
  const none = { ids: [], close: null }
  if (!usable.length) return none
  const one = (o) => (o && !o.skip ? { ids: [o.id], close: null } : null)
  const short = t.trim().split(' ').length <= 3

  // "B", "letter B", "option B" (short answers only: "a" is also a word).
  if (short) {
    const m = t.match(/^ (?:option |letter |answer )?([a-t]) $/)
    if (m) { const r = one(options.find((x) => x.letter && x.letter.toLowerCase() === m[1])); if (r) return r }
  }
  // "the first one", "the last one", "number 2".
  const ord = t.match(/^ (?:the )?(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|last)(?: one| 1| option| answer)? $/)
  if (ord) { const i = ORDINALS[ord[1]]; const r = one(i < 0 ? options[options.length - 1] : options[i]); if (r) return r }
  const num = t.match(/^ (?:number |option )(\d{1,2}) $/)
  if (num) { const r = one(options[Number(num[1]) - 1]); if (r) return r }
  // The answer's own words, exactly.
  const exact = usable.find((o) => norm(o.label) === t)
  if (exact) return { ids: [exact.id], close: null }
  // A range said as a range ("less than two weeks", "over 65").
  const saidRange = rangeOf(numbersIn(t))
  if (saidRange) {
    const o = usable.find((x) => { const r = rangeOf(x.label); return r && r.lo === saidRange.lo && r.hi === saidRange.hi })
    if (o) return { ids: [o.id], close: null }
  }
  // An age or a length of time ("I'm 45", "about three weeks").
  const ranged = byRange(t, options)
  if (ranged) return { ids: [ranged], close: null }
  const bare = t.match(/^ (\d{1,2}) $/)
  if (bare) { const r = one(options[Number(bare[1]) - 1]); if (r) return r }

  // "No, but it swells": the part after "but" is the answer.
  const but = t.split(/ but | except | although | though /)
  const after = but.length > 1 && but[but.length - 1].trim() ? ' ' + but[but.length - 1].trim() + ' ' : null

  // Yes, no, not sure by meaning.
  const lead = (re) => usable.find((o) => re.test(o.label.trim()))
  const it = intent(t)
  const fewWords = t.trim().split(' ').length <= 5
  if (!after) {
    if (it === 'unsure') { const r = one(lead(UNSURE_LABEL)); if (r) return r }
    if (has(t, ['none of these', 'none of them', 'none of those', 'none', 'nothing', 'neither', 'not any of', 'none apply'])) { const r = one(lead(/^none|^nothing|^neither|^no, none/i)); if (r) return r }
    if (it === 'no' && (fewWords || NO_START.test(t))) {
      const r = one(lead(NEG_LABEL)); if (r) return r
    }
    if (it === 'yes' && (fewWords || YES_START.test(t))) {
      const r = one(lead(POS_LABEL)); if (r) return r
      // Two answers, one of them a no: yes is the other.
      if (usable.length === 2 && usable.some((o) => NEG_LABEL.test(o.label))) { const r2 = one(usable.find((o) => !NEG_LABEL.test(o.label))); if (r2) return r2 }
    }
  }
  if (after) t = after

  // By the words of the answer (and everyday words for them). A word said
  // counts for an option when it is in its label, weighted by how few
  // options share it; a near form ("tingly" / "tingling") counts part.
  const labelWords = new Map(usable.map((o) => [o.id, new Set(words(o.label))]))
  const shared = (w) => usable.filter((o) => labelWords.get(o.id).has(w)).length
  const near = (a, b) => a.length >= 5 && b.length >= 5 && a.slice(0, 5) === b.slice(0, 5)
  const parts = multi ? t.split(/ and also | and | also | plus |,/).map((p) => ' ' + p.trim() + ' ').filter((p) => p.trim()) : [t]
  const picked = []
  let close = null
  for (const part of parts) {
    const said = saidWords(part)
    if (!said.size) continue
    const scored = usable.map((o) => {
      let sc = 0
      for (const w of labelWords.get(o.id)) {
        if (said.has(w)) sc += 1 / shared(w)
        else if ([...said].some((x) => near(x, w))) sc += 0.6 / shared(w)
      }
      return { o, s: sc }
    }).sort((a, b) => b.s - a.s)
    const [best, next] = scored
    if (best && best.s >= 0.9 && (!next || best.s - next.s >= 0.4)) picked.push(best.o.id)
    else if (!multi && best && best.s >= 0.5 && next && next.s >= 0.5) close = [best.o.id, next.o.id]
  }
  if (picked.length) return { ids: [...new Set(picked)], close: null }
  return { ids: [], close }
}
export function matchOptions(text, options, multi = false) { return matchDetail(text, options, multi).ids }
