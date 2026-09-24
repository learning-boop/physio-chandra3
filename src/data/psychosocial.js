/* ─────────────────────────────────────────────────────────────────────────
   Yellow flags — a short psychosocial screen (beliefs about pain and
   movement, outlook, mood, sleep, work and daily roles).

   Written for this site, covering the domains of the Kendall yellow-flag
   framework; it is NOT a validated questionnaire (e.g. it is not the
   STarT Back Tool), and no score is shown to the person.

   Like the pain-behaviour screen, these answers are not scored against
   conditions. They shape supportive wording on the result screen and reach
   the physiotherapist with the other answers. Nothing here blocks booking —
   the one onward referral is a gentle pointer to the family physician (and
   the 9-8-8 crisis line) when the person reports feeling low.

   ⚠ FOR CLINICIAN REVIEW — wording and the count thresholds below.
   ───────────────────────────────────────────────────────────────────────── */

const AGREE = [
  { id: 'agree', label: 'Agree' },
  { id: 'disagree', label: 'Disagree' },
]

/* Flag colours, as the CPA Orthopaedic Division subjective framework uses them:
     yellow  psychosocial risk for prolonged disability (beliefs, fear, mood,
             coping, sleep)
     blue    the person's view of work and whether it supports recovery
     black   the system around the work — claims, disputes, duties available
     pink    protective, prognostically GOOD factors (low fear, confidence,
             expecting to recover, wanting to be involved)
   Every statement is written for the patient; the colour is only in the code
   and in what Chandra receives. */
export const PSYCHOSOCIAL_QUESTIONS = [
  { id: 'yfFear', colour: 'yellow', text: 'I avoid moving or being active because I worry it will cause more damage.', options: AGREE },
  { id: 'yfOutlook', colour: 'yellow', text: 'I feel this pain is never going to get better.', options: AGREE },
  { id: 'yfMood', colour: 'yellow', text: 'Lately I have been feeling low, worried or stressed.', options: AGREE },
  { id: 'yfSleep', colour: 'yellow', text: 'Pain or worry is affecting my sleep.', options: AGREE },
  { id: 'yfRoles', colour: 'yellow', text: 'The pain is causing problems at work or with my daily responsibilities.', options: AGREE },
  { id: 'bfWork', colour: 'blue', text: 'My work makes this harder — the demands are heavy, or I get little support with it.', options: AGREE },
  { id: 'kfClaim', colour: 'black', text: 'There is a claim, insurance or time-off process involved (ICBC, WorkSafeBC, or similar).', options: AGREE },
  { id: 'pfConfident', colour: 'pink', text: 'I am confident I can keep doing most of my usual activities while this settles.', options: AGREE },
  { id: 'pfExpect', colour: 'pink', text: 'I expect to get back to normal, and I want to take an active part in that.', options: AGREE },
]

/** Plain-language, supportive reading of the answers.
    Returns { level: 'low'|'moderate'|'high'|null, notes: string[], moodSupport: boolean } */
export function interpretPsychosocial(answers) {
  const answered = PSYCHOSOCIAL_QUESTIONS.filter((q) => answers[q.id] !== undefined)
  if (!answered.length) return { level: null, notes: [], moodSupport: false, flags: { yellow: [], blue: [], black: [], pink: [] } }
  const yes = (id) => answers[id] === 'agree'
  // Yellow flags carry the risk grading; pink ones are protective, so they are
  // counted separately and never added to the risk score.
  const flags = { yellow: [], blue: [], black: [], pink: [] }
  for (const q of PSYCHOSOCIAL_QUESTIONS) {
    if (yes(q.id)) flags[q.colour].push(q.text)
  }
  const count = flags.yellow.length
  const level = count >= 4 ? 'high' : count >= 2 ? 'moderate' : 'low'
  const notes = []

  if (count > 0) {
    notes.push('Pain is influenced by more than the tissues involved — worry, stress, sleep and mood can all turn the volume up or down. What you shared is common, and it is something Chandra will talk through with you at your assessment.')
  }
  if (yes('yfFear')) {
    notes.push('Feeling cautious about movement is very understandable. For most back and joint pain, staying gently active within comfort helps recovery; your assessment will confirm what is right for you.')
  }
  if (yes('yfOutlook')) {
    notes.push('Many people whose pain has lasted a while still improve with the right plan — having a clear explanation of what is going on is often the first step.')
  }
  if (yes('yfSleep')) {
    notes.push('Poor sleep and pain feed each other. A regular wind-down routine and a comfortable position can help while you wait to be seen.')
  }
  if (yes('yfRoles')) {
    notes.push('If work or daily tasks are difficult, bring examples to your assessment — planning a gradual return to them can be part of your care.')
  }
  if (yes('bfWork')) {
    notes.push('When work itself is part of the problem, the plan has to fit your job. Bring the specific tasks that trouble you to your assessment.')
  }
  if (count === 0) {
    notes.push('Your answers suggest you are coping well with the pain day to day, which is a good foundation for recovery.')
  }
  if (flags.pink.length === 2) {
    notes.push('You expect to recover and want to take an active part in it. That outlook is one of the better predictors of how this goes, and your plan will build on it.')
  }

  return { level, notes, moodSupport: yes('yfMood'), flags }
}
