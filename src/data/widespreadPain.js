/* ─────────────────────────────────────────────────────────────────────────
   Persistent widespread pain (fibromyalgia): the physio-route home for the
   widespread, non-anatomical drawing ("Fibromyalgia" document, signed by
   Chandra, 2 Oct 2026; content/reference/fibromyalgia.md).

   Shown on the results page when the fixed pain-type rules (./painType.js)
   find sensitised pain (more than 3 months) AND the drawing is widespread,
   or when "Fibromyalgia, diagnosed by a doctor" is ticked. It routes to
   physiotherapy with a nudge to the family doctor, never a doctor-first
   block. The safety questions ran earlier and still decide the route.

   Language rules (the document's): never tells anyone they "have
   fibromyalgia" (named once, as one possibility, in the doctor line, and
   not at all for people who already have the diagnosis); never "central
   sensitisation", "damage", "wear and tear" or any psychological label;
   hurt is not harm; movement-positive.
   ───────────────────────────────────────────────────────────────────────── */

/** Show the section? `painType` from classifyPainMechanism; `diagnosed` when
    the person ticked a doctor's fibromyalgia diagnosis. */
export function widespreadRoute(painType, diagnosed, zones = [], answers = {}, wspScore = 0) {
  if (diagnosed) return true
  // 6 Oct 2026, general conditions cross-check (approved by Chandra), C4: morning stiffness over an hour (an inflammatory
  // pattern) goes to the doctor-first checks, not this section.
  if ([].concat(answers.pattern24 || []).includes('amLong')) return false
  // Pain on both sides, above and below the waist, in 4 or more areas for
  // over 3 months is shown whatever the pain type (an atypical fibromyalgia).
  if (['o3m', 'years'].includes(answers.duration) && chronicWidespread(zones)) return true
  // The many-places route (path 4): the document's score of 9 or more (of 15).
  if (wspScore >= 9) return true
  if (!painType || !painType.widespread) return false
  return [painType.primary, painType.secondary].includes('nociplastic')
}
/* Path 4 (6 Oct 2026): asked on the Draw page when the marks are widespread
   (chronicWidespread, without the duration). "Many places" follows the "Pain
   in many places" route (REGIONS.widespread); "one area" the usual flow. */
export const PATH_QUESTION = 'Your marks cover many parts of your body. Which fits best?'
export const PATH_OPTIONS = [
  { id: 'many', label: 'I have pain in many places, on most days' },
  { id: 'one', label: 'One area bothers me much more than the others' },
]
const UPPER = ['neck', 'ctj', 'upperback', 'chest', 'shoulder', 'upperarm', 'elbow', 'forearm', 'wrist', 'hand', 'head', 'jaw']
const LOWER = ['lowerback', 'sij', 'coccyx', 'hip', 'thigh', 'knee', 'lowerleg', 'ankle', 'foot']
export function chronicWidespread(zones = []) {
  const types = new Set(zones.map((z) => z.type))
  const sides = new Set(zones.map((z) => (/L$/.test(z.id) ? 'L' : /R$/.test(z.id) ? 'R' : 'M')))
  return types.size >= 4 && sides.has('L') && sides.has('R') && [...types].some((t) => UPPER.includes(t)) && [...types].some((t) => LOWER.includes(t))
}

export const WIDESPREAD = {
  title: 'Pain in many areas that has lasted a while',
  what: 'When pain has spread to many areas and lasted for months, the body\'s pain system has often become oversensitive, so ordinary signals from muscles, joints and skin are turned up and felt as pain, often along with tiredness, sleep that does not refresh, and difficulty concentrating. It is a problem of how pain is processed, not of damaged muscles or joints, which is why scans and blood tests are usually normal. That is reassuring, not dismissive: the pain is real.',
  alarm: 'A helpful way to picture it: the body\'s alarm system is like a smoke detector that has become so sensitive it goes off when you make toast. The alarm is real and loud; it just no longer means there is a fire.',
  reassure: 'This kind of pain does not damage the body. Because the nervous system is adaptable, sensitivity that has turned up can also turn down. The approaches with the best evidence are understanding the pain, regular gentle exercise built up slowly, better sleep and pacing, things you can learn and do, and many people find their pain and energy improve over time with them.',
  doctor: 'If you have not already talked with your family doctor about pain in many areas, it is worth doing so as well: a few simple blood tests (including a thyroid test, and vitamin D and calcium for bones that ache or are tender to press) can rule out other causes, and if it is fibromyalgia, one possibility, it can usually be diagnosed in your doctor\'s office without a specialist.',
  selfCare: [
    'Keep moving, gently and regularly: a short daily walk you can finish comfortably beats an occasional long one that leaves you flat for days.',
    'Protect your sleep: regular times, a wind-down routine, and screens off before bed.',
    'Pace yourself: break tasks into chunks and rest before you have to, not after.',
    'Warmth helps many people: a warm bath, heat pack or warm pool before exercise.',
    'Hurt does not mean harm: a flare is the alarm system being loud, not something breaking.',
    // S13 (NICE NG206): post-exertional malaise.
    'If even small amounts of activity leave you much worse a day or two later, tell your doctor and Chandra: the plan then starts with managing energy rather than building exercise.',
  ],
  physio: 'Physiotherapy can help with a clear explanation of what is happening, movement built up slowly from a level you can manage (walking, cycling, pool exercise and gentle strengthening have the strongest evidence), pacing and a plan for flares, sleep, and ways to calm the system such as breathing, relaxation, tai chi or yoga. Heat, and for some people gentle hands-on treatment, can ease pain for a while and help you get moving; they support the plan rather than replace it. Where it helps, Chandra works alongside your doctor or a chronic-pain programme.',
}
