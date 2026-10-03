/* ─────────────────────────────────────────────────────────────────────────
   Acromegaly (growth-hormone excess): joints, spine, hands and nerves.

   From "Acromegaly.docx" (Conditions/General conditions), reviewed and
   signed by Chandra Matla, 3 Oct 2026 (confirmed in the session). Built with the document's
   recommended answers to its open items. Clinician reference:
   content/reference/acromegaly.md.

   The guide never diagnoses it. Two parts:
     A. Undiagnosed: pc-acromegaly (./patternChecks.js). The growth change
        is a hard gate (open item 1): hands or feet grown, or jaw, brow or
        nose heavier, in adulthood, TOGETHER with several large joints or a
        stooping back early for the age, both hands numb at night or thick
        and clumsy, or the snoring/headache/sweating cluster. Asked for
        drawings of both knees, hips, shoulders, hands or wrists, the jaw,
        or a widespread drawing; that drawing-based question is the
        document's optional "have your hands, feet or jaw grown?" chip
        (open item 2). Family doctor for an IGF-1 test in the next few
        weeks; booking still offered (open item 4, as for hypothyroidism).
        Names the pituitary and growth hormone (open item 5).
     B. Diagnosed: ca-acromegaly on the cautions list, with the long-term
        joint, spine and hand panel below.
   ───────────────────────────────────────────────────────────────────────── */

export const ACROMEGALY_SCREEN = {
  text: 'Not explained by a condition you have already been diagnosed with: over the past few years, your hands or feet have grown (rings or gloves no longer fit, your shoe size has gone up) or your jaw, brow or nose has become heavier, together with any of these: aching, stiff or crunchy knees, hips or shoulders in several joints, or a broad aching back with a developing stoop, that seems early for your age; both hands tingling or numb at night, or thick, clumsy hands; or two or more of heavy snoring or daytime sleepiness, frequent headaches, thick, oily or very sweaty skin, new high blood pressure or blood sugar, skin tags, and irregular periods or low sex drive',
  why: { title: 'Worth a blood test with your family doctor',
    text: 'Joint, back or hand problems that come together with hands, feet or jaw growing in adulthood can be caused by too much growth hormone from the pituitary gland. It is uncommon, but it is often missed for years, and it is treatable. A single blood test (IGF-1) through your family doctor is the first step: please book in the next few weeks, mention the growth changes, snoring, headaches and joint pain together, and take an old photo if you have one. You are welcome to book with Chandra for the joint or hand problem alongside that visit.' },
}

export const ACROMEGALY_CAUTION = {
  id: 'ca-acromegaly', tier: 'caution', text: 'Acromegaly or another growth-hormone problem, diagnosed by a doctor (including before or after pituitary surgery)',
  why: { title: 'Worth knowing before your first assessment',
    text: 'Joint and spine changes from acromegaly often stay after the hormone is controlled, so physiotherapy works as a long-term partner: joint-protective strength, mobility and load management, bone-safe lifting for the spine, and care for the hands. Blood pressure and any sleep apnoea are taken into account before harder exercise, and after surgery the return to activity follows your surgeon\'s advice.' },
}

/** The results panel when ca-acromegaly is ticked, or null. */
export function acromegalyPanel(ticked = false) {
  if (!ticked) return null
  return {
    title: 'Acromegaly and your joints, spine and hands',
    text: 'Too much growth hormone thickens soft tissue, cartilage and the ends of bones: joints grow extra cartilage that later wears unevenly, the spine thickens and curves, and swelling at the wrist squeezes the nerve to the hand. After treatment, swelling, hand numbness, sweating and headaches usually improve within months, but joint and spine changes already formed tend to stay. They come from tissue that has grown, not from wearing out with use, and strong, well-moved joints cope with them better: physiotherapy can help with a long-term, joint-protective plan.',
    notes: [
      'Keep joints moving daily with low-impact activity (walking, cycling, the pool) and a few sit-to-stands: little and often beats occasional heavy sessions.',
      'Protect your back: bend at the hips and knees and avoid lifting and twisting together. Spinal bones can break with surprisingly small loads in acromegaly even when a bone-density scan looks normal, so tell your doctor about any sudden new back pain.',
      'If you snore heavily or are sleepy in the day, ask your doctor about a sleep study; treating sleep apnoea improves energy, blood pressure and your ability to exercise. Avoid driving when sleepy.',
      'After pituitary surgery, follow your surgeon\'s advice on straining, lifting and nose-blowing before building back up. Clear fluid dripping from the nose, a fever with headache and a stiff neck, extreme thirst with large amounts of urine, or severe tiredness, nausea and dizziness need the surgical team or the emergency department.',
      'Call 911 for a sudden, severe headache with vision loss, double vision, a drooping eyelid or collapse, or for chest pain. Breathlessness when lying flat, swollen ankles or palpitations need a doctor urgently.',
      'Blood in the stool, a change in bowel habit lasting weeks, or weight loss you cannot explain is worth seeing your doctor about (bowel polyps are more common with acromegaly).',
    ],
  }
}
