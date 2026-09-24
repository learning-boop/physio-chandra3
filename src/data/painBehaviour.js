/* ─────────────────────────────────────────────────────────────────────────
   Pain behaviour — severity, irritability (SIN), the 24-hour pattern and
   easing factors, as in a standard subjective examination.

   These answers do NOT feed the condition scoring (their ids are not in any
   region's question set, so computeResults ignores them). They do three
   things instead:
     1. describe how the pain behaves on the result screen, with advice
        pitched to how irritable it is;
     2. reach the physiotherapist (and the AI overview) with the other answers;
     3. surface the constant / unremitting night-pain red flag on the safety
        check when the pattern points to it — the person still confirms it.

   ⚠ FOR CLINICIAN REVIEW — the thresholds in interpretBehaviour() are
   educational rules of thumb, not a validated classification.
   ───────────────────────────────────────────────────────────────────────── */

export const BEHAVIOUR_IDS = ['sinSeverity', 'sinProvoke', 'sinSettle', 'pattern24', 'easing']

/* Irritability is judged on THREE things (Maitland; Barakatt et al. 2009):
   how much activity it takes to provoke the symptoms, how severe they are,
   and how long they take to settle afterwards. Asking only severity and
   settling time — as this screen first did — leaves out the vigour of the
   provoking activity, which is the part that decides how gently the first
   physical examination has to be done. */
const PROVOKE = {
  id: 'sinProvoke', text: 'How much activity brings the pain on?',
  options: [
    { id: 'heavy', label: 'Only heavy or unusual activity' },
    { id: 'normal', label: 'Normal daily activities — walking, sitting, housework' },
    { id: 'light', label: 'Very little — small movements set it off' },
    { id: 'rest', label: "It's there even at rest" },
  ],
}

const SEVERITY = {
  id: 'sinSeverity', text: 'At its worst, how bad is the pain?',
  options: [
    { id: 'mild', label: 'Mild (1–3 out of 10)' },
    { id: 'moderate', label: 'Moderate (4–6)' },
    { id: 'severe', label: 'Severe (7–10)' },
  ],
}

const SETTLE = {
  id: 'sinSettle', text: 'Once it flares up, how long does it take to settle?',
  options: [
    { id: 'minutes', label: 'A few minutes' },
    { id: 'hours', label: 'An hour or a few hours' },
    { id: 'nextday', label: 'Until the next day or longer' },
    { id: 'constant', label: 'It never really settles' },
  ],
}

/* The 'amLong' and 'restWorse' options are the inflammatory indicators (pain
   after a period of relative rest, prolonged morning stiffness easing with
   movement); 'pm', 'amShort' and 'none' are the mechanical ones (a clear
   stimulus–response relationship with load and position). See
   ./painType.js, which reads them. */
const PATTERN_24 = {
  id: 'pattern24', multi: true, text: 'Over a typical day, when is it worst?',
  options: [
    { id: 'amLong', label: 'Morning — stiff for more than 30 minutes' },
    { id: 'amShort', label: 'Morning — stiff, but loosens within 30 minutes' },
    { id: 'restWorse', label: 'After sitting or resting a while — it eases once I get moving' },
    { id: 'pm', label: 'It builds up as the day goes on' },
    { id: 'nightWake', label: 'It wakes me at night' },
    { id: 'none', label: 'No clear pattern — it depends on what I do' },
  ],
}

const DEFAULT_EASERS = ['Rest', 'Gentle movement or stretching', 'Changing position', 'Heat or cold packs']

/** The pain-behaviour screen's questions. `easers` = the area's own easing
    options; pass null to leave easing out (the generic set asks it already). */
export function behaviourQuestions(easers = DEFAULT_EASERS) {
  const qs = [SEVERITY, PROVOKE, SETTLE, PATTERN_24]
  if (easers) {
    qs.push({
      id: 'easing', multi: true, text: 'What eases it?',
      options: [
        ...easers.map((e) => ({ id: e, label: e })),
        { id: 'none', label: 'Nothing seems to ease it' },
      ],
    })
  }
  return qs
}

const has = (a, id) => (Array.isArray(a) ? a.includes(id) : a === id)

/** Plain-language reading of the behaviour answers.
    Returns { irritability: 'mild'|'moderate'|'severe'|null, evidence: [],
              notes: string[], nightConcern: boolean, examCaution: string|null }

    Irritability is scored on the three Maitland dimensions — provocation,
    severity, persistence — one point each, and the total decides the grade.
    `evidence` is the justification, in the patient's own answers, and
    `examCaution` is what that grade means for the first physical examination.
    ⚠ FOR CLINICIAN REVIEW — the point thresholds. */
export function interpretBehaviour(answers) {
  const sev = answers.sinSeverity
  const provoke = answers.sinProvoke
  const settle = answers.sinSettle
  const pat = answers.pattern24
  const ease = answers.easing
  const notes = []
  const evidence = []

  let irritability = null
  let examCaution = null
  if (sev && settle) {
    let points = 0
    // 1. Vigour of activity needed to provoke it.
    if (provoke === 'rest') { points += 2; evidence.push('Symptoms present at rest') }
    else if (provoke === 'light') { points += 2; evidence.push('Very little activity provokes the symptoms') }
    else if (provoke === 'normal') { points += 1; evidence.push('Normal daily activities provoke the symptoms') }
    else if (provoke === 'heavy') evidence.push('Only heavy or unusual activity provokes the symptoms')
    // 2. Severity of the symptoms provoked.
    if (sev === 'severe') { points += 2; evidence.push('Severe at worst (7–10/10)') }
    else if (sev === 'moderate') { points += 1; evidence.push('Moderate at worst (4–6/10)') }
    else evidence.push('Mild at worst (1–3/10)')
    // 3. How long they take to settle.
    if (settle === 'constant') { points += 2; evidence.push('Never fully settles') }
    else if (settle === 'nextday') { points += 2; evidence.push('Takes until the next day or longer to settle') }
    else if (settle === 'hours') { points += 1; evidence.push('Takes an hour or more to settle') }
    else evidence.push('Settles within a few minutes')

    irritability = points >= 4 ? 'severe' : points >= 2 ? 'moderate' : 'mild'
    examCaution = {
      severe: 'Highly irritable: keep the first physical examination brief and limited — few provoking tests, sub-maximal, and stop at the first reproduction of symptoms. Defer neural mechanosensitivity and end-range testing if symptoms are already provoked.',
      moderate: 'Moderately irritable: examine with care, spacing provoking tests and leaving end-range and neural tension testing until last.',
      mild: 'Low irritability: a full examination should be tolerated, including end-range and neural tension testing.',
    }[irritability]
  }
  if (irritability === 'severe') {
    notes.push('Your pain sounds easily flared and slow to settle. Until you are assessed, keep activity gentle and within comfort rather than pushing through pain, and it is sensible to be seen sooner rather than later.')
  } else if (irritability === 'moderate') {
    notes.push('Your pain flares with some activity and takes a while to settle. Pacing activity — doing a little, often — tends to be easier than long spells of the aggravating task.')
  } else if (irritability === 'mild') {
    notes.push('Your pain settles fairly quickly after it flares, which usually means staying active within comfort is reasonable while you wait to be assessed.')
  }
  if (has(pat, 'restWorse')) {
    notes.push('Pain that builds while you are still and eases once you get moving is common, and it is useful information — it is one of the things your assessment will look at.')
  }

  if (has(pat, 'amLong')) {
    notes.push('Morning stiffness that lasts more than 30 minutes is worth mentioning at your assessment — it can sometimes have an inflammatory component, which may also need a conversation with your physician.')
  } else if (has(pat, 'amShort')) {
    notes.push('Brief morning stiffness that loosens with movement is common with many joint and back problems.')
  }
  if (has(pat, 'pm')) {
    notes.push('Pain that builds through the day usually relates to load and activity — useful information for planning how to pace your day.')
  }

  const easeNone = has(ease, 'none')
  if (easeNone) {
    notes.push('You noted that nothing seems to ease your pain. Please make sure to mention this at your assessment.')
  }
  // Constant pain that nothing eases, especially at night, is a recognised
  // red-flag feature. It is not decided here — it is put to the person as a
  // question on the safety check.
  const nightConcern = easeNone && (has(pat, 'nightWake') || settle === 'constant')

  return { irritability, evidence, examCaution, notes, nightConcern }
}
