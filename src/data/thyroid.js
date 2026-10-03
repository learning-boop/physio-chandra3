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
