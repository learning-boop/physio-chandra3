/* ─────────────────────────────────────────────────────────────────────────
   Hyperparathyroidism: calcium balance, bones, joints and muscle.

   From "Hyperparathyroidism.docx" (Conditions/General conditions), reviewed
   and signed by Chandra Matla, 3 Oct 2026 (confirmed in the session). Built with the document's
   recommended answers to its open items. Clinician reference:
   content/reference/hyperparathyroidism.md.

   The guide never diagnoses it. Three parts:
     A. Undiagnosed: a doctor-first final-check question, "a calcium blood
        test" (pc-calcium in ./patternChecks.js), for bone aches on both
        sides or a widespread drawing. Names the parathyroid once (open
        item 1: the test is a routine blood panel).
     B. Diagnosed: "A parathyroid or calcium problem, or kidney-related bone
        disease, diagnosed" on the cautions list (ca-parathyroid,
        PainAssessment.jsx), with the results panel below, which carries the
        two specific warnings (high-calcium crisis; low calcium after neck
        surgery).
     C. Cross-links (open items 3 and 4): the gout or pseudogout questions
        in the knee, elbow, wrist and hand explain that an attack under 60,
        or attacks that keep coming back, are a reason to ask about calcium
        and PTH (CPPD_WHY); the osteoporosis record asks whether calcium and
        PTH were checked when there is no obvious cause.
   Septic joint, kidney stone, fragile-bone fracture and cancer-pattern
   bone pain are already asked by the existing safety questions.
   ───────────────────────────────────────────────────────────────────────── */

export const CALCIUM_SCREEN = {
  text: 'Not explained by a condition you have already been diagnosed with: a deep ache "in the bones" on both sides (shins, thighs, hips, back or ribs), there at rest and worse on your feet, together with any of these: a kidney stone, now or in the past; a bone broken in a small fall or with no real injury, or being told you have thin bones; two or more of unusual thirst or passing more urine, constipation, nausea or poor appetite, low mood or "brain fog", and poor sleep; or a high calcium or low vitamin D blood result that was never followed up',
  why: { title: 'Please see your family doctor in the next week or two',
    text: 'Deep aching bones on both sides, bones that break easily, kidney stones, thirst and low mood can all come from the body\'s calcium balance, most often an overactive parathyroid gland or low vitamin D. This is found with a simple blood test (calcium, vitamin D and parathyroid hormone), not by a physiotherapist. Please see your family doctor in the next week or two and mention all of these together. It can be treated, and thinned bone responds to treatment and the right exercise; you are welcome to book after that visit.' },
}

/* Gout or pseudogout questions (knee, elbow, wrist, hand): their
   explanation, with the calcium line. */
export const CPPD_IDS = ['kf-gout', 'erf-gout', 'wrf-gout', 'hnd-gout']
export const CPPD_WHY = {
  title: 'Possible gout or pseudogout: please see a doctor',
  text: 'A joint that becomes hot, swollen and very painful overnight is often a crystal attack (gout or pseudogout), and a doctor should check it, and rule out infection, before it is treated. If you are under 60, or attacks keep coming back, it is also worth asking whether your calcium and parathyroid hormone have been checked: pseudogout can be linked with an overactive parathyroid gland.',
}

export const PARATHYROID_CAUTION = {
  id: 'ca-parathyroid', tier: 'caution', text: 'A parathyroid or calcium problem, or kidney-related bone disease, diagnosed by a doctor (including before or after parathyroid surgery)',
  why: { title: 'Worth knowing before your first assessment',
    text: 'Thinned bone is under-mineralised, not fragile glass: after treatment it recovers over one to two years, and well-chosen loading exercise helps. Your plan builds strength and balance with bone-safe lifting, adapts to any fracture, kidney disease or recent surgery, and is coordinated with your doctor, surgeon or kidney team.' },
}

/** The results panel when ca-parathyroid is ticked, or null. */
export function parathyroidPanel(ticked = false) {
  if (!ticked) return null
  return {
    title: 'Calcium balance, bones and muscles',
    text: 'Parathyroid hormone keeps blood calcium steady by taking calcium out of bone when needed. When there is too much of it, bone is slowly withdrawn (especially from the forearm and spine), muscles tire, and calcium crystals can settle in joints. After parathyroid surgery, bone density usually recovers over one to two years, and kidney-related forms are managed long term with your kidney team. Physiotherapy can help with a progressive strength, balance and weight-bearing programme adapted to your bones, fracture rehabilitation, care of joints after pseudogout attacks, and a falls-prevention plan.',
    notes: [
      'Drink enough fluid through the day, unless your kidney doctor has told you to limit it: dehydration pushes calcium higher.',
      'Keep moving every day: walking, and a few sit-to-stands and heel raises holding a counter, build bone-protecting strength and balance safely.',
      'Protect your back and wrists while bones recover: bend at the hips and knees, avoid lifting and twisting together, and clear trip hazards at home.',
      'Do not start high-dose calcium or vitamin D supplements on your own if you have been told your calcium is high; follow your doctor\'s advice on both.',
      'Call 911 or go to the emergency department for vomiting, severe thirst, passing very little urine, confusion, drowsiness or a very irregular heartbeat with known high calcium.',
      'In the days and weeks after parathyroid or thyroid surgery, tingling around the mouth or in the fingers, cramps or spasms in the hands and feet, or twitching need your surgical team or the emergency department the same day (low calcium).',
      'With kidney disease, new bone pain, a painful purple patch on the skin or a wound that is not healing needs your kidney team promptly.',
    ],
  }
}
