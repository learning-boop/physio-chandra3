/* ─────────────────────────────────────────────────────────────────────────
   Hyperthyroidism (an overactive thyroid): muscle, bone and exercise safety.

   From "Hyperthyroidism.docx" (Conditions/General conditions), reviewed and
   signed by Chandra Matla, 3 Oct 2026 (confirmed in the session). Built with the document's
   recommended answers to its open items. Clinician reference:
   content/reference/hyperthyroidism.md.

   The guide never diagnoses it. Four parts:
     A. Undiagnosed: a doctor-first final-check question, "a thyroid blood
        test" (pc-thyroid in ./patternChecks.js), for both-sided weakness
        drawings or a weakness answer. Names the thyroid (open item 1).
     B. Emergency: sudden, painless weakness of both legs, often on waking
        or after a big meal, alcohol or hard exercise (thyrotoxic periodic
        paralysis; pc-paralysis, 911), for leg, hip and low-back drawings.
        Ancestry-neutral wording (open item 2).
     C. Diagnosed: "An overactive thyroid, diagnosed" on the cautions list
        (ca-thyroid, PainAssessment.jsx), with the exercise-safety panel
        below (no vigorous exercise until levels are controlled).
     D. Cross-link: the frozen-shoulder record asks whether the thyroid and
        blood sugar were checked when there was no injury (open item 5).

   Hypothyroidism (an underactive thyroid): "Hypothyroidism.docx",
   reviewed and signed by Chandra Matla, 3 Oct 2026 (confirmed in the session), built with its
   recommended answers; content/reference/hypothyroidism.md. Kept as a
   separate entry (its open item 6).
     A. Undiagnosed: pc-hypothyroid (HYPOTHYROID_SCREEN), doctor-first in
        the next few weeks but booking still allowed (its open item 1:
        light-to-moderate exercise is safe, and the shoulder or hand
        problem still needs care).
     B. Diagnosed: ca-hypothyroid and its panel (dose check, thyroxine
        timing, night splint, statin line, myxoedema and chest-pain signs).
     C. Cross-links (its open item 2): both hands numb at night (the carpal
        tunnel records), frozen shoulder (above), and the widespread-pain
        doctor line now names a thyroid test.
   ───────────────────────────────────────────────────────────────────────── */

export const THYROID_SCREEN = {
  text: 'Not explained by a condition you have already been diagnosed with: weakness or quick tiring of both thighs or both shoulders that has built up over weeks or months, together with losing weight without trying while eating the same or more; or two or more of these, together with a swelling at the front of your neck or eyes that stare, feel gritty or bulge: a fast, pounding or irregular heartbeat at rest, feeling hot and sweaty when others are comfortable, shaky hands, anxiety, irritability or poor sleep, more frequent bowel movements, or lighter or missed periods',
  why: { title: 'Please see your family doctor in the next week or two',
    text: 'Weak thighs or shoulders on both sides together with weight loss, a racing heart, or feeling hot or shaky can be caused by an overactive thyroid gland. This is found with a simple blood test, not by a physiotherapist. Please see your family doctor in the next week or two and mention all of these together. Until then, keep activity light and avoid intense exercise, because a racing heart does not cope well with it. It is very treatable, and the muscle weakness recovers as levels settle; you are welcome to book after that visit.' },
}

export const PARALYSIS_FLAG = {
  text: 'Sudden weakness or being unable to move both legs (sometimes the arms too), without pain or numbness, especially on waking, after a large meal, alcohol or hard exercise',
  why: { title: 'Please call 911',
    text: 'Sudden, painless weakness of both legs can come from a very low potassium level, which can also affect the heart; one cause is an overactive thyroid. It needs emergency treatment. Please call 911, and do not drive.' },
}

export const THYROID_CAUTION = {
  id: 'ca-thyroid', tier: 'caution', text: 'An overactive thyroid (for example Graves\' disease), diagnosed by a doctor (being treated, or treated in the past)',
  why: { title: 'Worth knowing before your first assessment',
    text: 'Until your doctor confirms your thyroid levels are controlled (often the first 4 to 8 weeks of treatment), activity stays light to moderate, with no vigorous or heavy exercise. Once they are, the muscle weakness is reversible and recovers faster with a gradual strength programme. If you take a beta-blocker, effort is guided by how hard it feels rather than by heart rate.' },
}

/** The results panel when ca-thyroid is ticked, or null. */
export function thyroidPanel(ticked = false) {
  if (!ticked) return null
  return {
    title: 'An overactive thyroid and rebuilding strength',
    text: 'Too much thyroid hormone breaks muscle protein down faster than it is rebuilt and turns bone over faster than it can be replaced, which is why thighs and shoulders weaken. The muscles have been over-driven, not damaged: strength usually returns over weeks to months once levels settle, faster with training. Until your doctor confirms your levels are controlled, keep to light or moderate activity (walking, gentle mobility, breathing and relaxation), stay cool, and stop if your heart races or is irregular, you feel dizzy or faint, or you have chest pain or unusual breathlessness. Once controlled, physiotherapy can help with a progressive strength and aerobic programme, bone-safe loading and balance work.',
    notes: [
      'Take anti-thyroid tablets exactly as prescribed and never stop them on your own.',
      'Once your levels are controlled, build strength gradually: sit-to-stands from a firm chair and step-ups holding a rail, a few times a day, adding a little each week.',
      'If you are past the menopause or have had an overactive thyroid for a long time, ask your doctor about a bone-density check and calcium and vitamin D.',
      'After radioactive iodine or thyroid surgery, tiredness, cramps, weight gain or slow recovery can mean the thyroid has become underactive: worth a blood test.',
      'On anti-thyroid tablets (methimazole, carbimazole or propylthiouracil), a sore throat, mouth ulcers, a fever or suddenly feeling unwell, or yellowing skin or eyes or dark urine, need a doctor the same day for a blood test.',
      'Eye pain, double vision, blurred or reduced vision, or an eye that will not close need a doctor or eye emergency service the same day.',
      'Call 911 for a very fast heartbeat with a high fever, agitation or confusion, vomiting or diarrhoea (especially during an infection, after surgery or after stopping tablets), or a racing or irregular heartbeat with chest pain, fainting or sudden breathlessness.',
    ],
  }
}

/* ── Hypothyroidism (an underactive thyroid) ── */

/* Route A: the document's rule, (Q1 with Q2 at least 2) or (both hands at
   night with Q2 at least 1). Booking is still offered (no noBooking). */
export const HYPOTHYROID_SCREEN = {
  text: 'Not explained by a condition you have already been diagnosed with: muscles that have felt stiff, achy or crampy on both sides for months and are slow to recover after activity, together with two or more of these; or hands that tingle or go numb at night on both sides, together with one or more of these: feeling cold when others are comfortable, tiredness and needing more sleep, weight gain without eating more, dry skin or hair loss, constipation, heavier periods, low mood or slowed thinking, a hoarse voice, or puffiness around the eyes',
  why: { title: 'Worth a thyroid blood test with your family doctor',
    text: 'Stiff, achy, crampy muscles on both sides that are slow to recover, together with feeling cold, tired or gaining weight, and numb hands at night, can be caused by an underactive thyroid gland. This is found with a simple blood test, not by a physiotherapist, and it is very treatable. Please see your family doctor in the next few weeks and mention all of these together; if you take a cholesterol tablet (a statin), mention the muscle aches too. Light to moderate activity is safe in the meantime, and you are welcome to book for the shoulder, hand or muscle problem alongside that visit.' },
}

export const HYPOTHYROID_CAUTION = {
  id: 'ca-hypothyroid', tier: 'caution', text: 'An underactive thyroid (for example Hashimoto\'s), diagnosed by a doctor, or taking thyroxine (levothyroxine)',
  why: { title: 'Worth knowing before your first assessment',
    text: 'Once the thyroxine dose is right, strength and stamina usually rebuild well with a graded programme. Muscles with a low thyroid are slow to repair, so the programme starts low and builds by how you recover: soreness that lasts for days means the step was too big, not that anything is damaged.' },
}

/** The results panel when ca-hypothyroid is ticked, or null. */
export function hypothyroidPanel(ticked = false) {
  if (!ticked) return null
  return {
    title: 'An underactive thyroid and rebuilding strength',
    text: 'With too little thyroid hormone, the body runs slow: muscles become stiff, achy and slow to recover, and fluid in the tissues can squeeze the nerve at the wrist and stiffen shoulders and joints. The muscles and nerves have been running slow and swollen, not damaged: with the right thyroxine dose, aches, cramps and numb hands usually ease within weeks to a few months, and strength rebuilds with training. If aches, cramps, tiredness and slow recovery creep back, ask your doctor to check your thyroid levels: the dose may need adjusting.',
    notes: [
      'Take thyroxine on an empty stomach at the same time each day, 30 to 60 minutes before food and 4 hours apart from calcium, iron or antacids, and do not stop it without advice.',
      'Keep moving daily but build slowly: a short walk and a few sit-to-stands, adding a little each week only if you have recovered by the next day; warm up longer than you think you need.',
      'For numb hands at night, keep the wrist straight (a simple night splint from a pharmacy) and avoid sleeping with the wrist bent under you.',
      'If you take a cholesterol tablet and your muscles ache, mention both to your doctor; the thyroid is checked first.',
      'On thyroxine, a racing or irregular heartbeat, feeling hot, a tremor or weight loss you cannot explain are worth seeing your doctor about soon (the dose may be too high).',
      'Call 911 for chest pain, pressure or unusual breathlessness when starting or increasing activity or soon after starting thyroxine, or for extreme drowsiness or confusion with a very low temperature or a very slow heartbeat.',
    ],
  }
}
