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
export function widespreadRoute(painType, diagnosed) {
  if (diagnosed) return true
  if (!painType || !painType.widespread) return false
  return [painType.primary, painType.secondary].includes('nociplastic')
}

export const WIDESPREAD = {
  title: 'Pain in many areas that has lasted a while',
  what: 'When pain has spread to many areas and lasted for months, the body\'s pain system has often become oversensitive, so ordinary signals from muscles, joints and skin are turned up and felt as pain, often along with tiredness, sleep that does not refresh, and difficulty concentrating. It is a problem of how pain is processed, not of damaged muscles or joints, which is why scans and blood tests are usually normal. That is reassuring, not dismissive: the pain is real.',
  alarm: 'A helpful way to picture it: the body\'s alarm system is like a smoke detector that has become so sensitive it goes off when you make toast. The alarm is real and loud; it just no longer means there is a fire.',
  reassure: 'This kind of pain does not damage the body. Because the nervous system is adaptable, sensitivity that has turned up can also turn down. The approaches with the best evidence are understanding the pain, regular gentle exercise built up slowly, better sleep and pacing, things you can learn and do, and many people find their pain and energy improve over time with them.',
  doctor: 'If you have not already talked with your family doctor about pain in many areas, it is worth doing so as well: a few simple blood tests can rule out other causes, and if it is fibromyalgia, one possibility, it can usually be diagnosed in your doctor\'s office without a specialist.',
  selfCare: [
    'Keep moving, gently and regularly: a short daily walk you can finish comfortably beats an occasional long one that leaves you flat for days.',
    'Protect your sleep: regular times, a wind-down routine, and screens off before bed.',
    'Pace yourself: break tasks into chunks and rest before you have to, not after.',
    'Warmth helps many people: a warm bath, heat pack or warm pool before exercise.',
    'Hurt does not mean harm: a flare is the alarm system being loud, not something breaking.',
  ],
  physio: 'Physiotherapy can help with a clear explanation of what is happening, movement built up slowly from a level you can manage (walking, cycling, pool exercise and gentle strengthening have the strongest evidence), pacing and a plan for flares, sleep, and ways to calm the system such as breathing, relaxation, tai chi or yoga. Hands-on treatment and heat can ease pain for a while and help you get moving; they support the plan rather than replace it. Where it helps, Chandra works alongside your doctor or a chronic-pain programme.',
}
