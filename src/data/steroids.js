/* ─────────────────────────────────────────────────────────────────────────
   Steroid medicine and Cushing's syndrome.

   From "Cushings Syndrome.docx" (Conditions/General conditions), reviewed
   and signed by Chandra Matla, 3 Oct 2026 (confirmed in the session).
   Clinician reference: content/reference/cushings.md.

   The guide never diagnoses Cushing's. Three parts:
     A. Undiagnosed: a doctor-first final-check question for weakness in both
        thighs or shoulders built up over months, with steroid medicine or
        the body changes (pc-hormone in ./patternChecks.js). Not named.
     B. Diagnosed: "Cushing's syndrome, diagnosed" on the cautions list
        (ca-cushing, PainAssessment.jsx): the physio route, with the panel
        below.
     C. The steroid overlay: one question on "A little about you" (answers.
        steroid). With long-term steroids, the red flags the site did not
        already ask go first on the safety pages (adrenal crisis, a mind
        change, a hidden infection), and the results carry the "steroid
        medicine, muscles and bones" panel. Fragile-bone fractures of the
        spine, the steroid hip (avascular necrosis) and the Achilles tendon
        are already asked by those areas' own red flags.

   The answer is kept as answers.steroid: in the summary and PDF, not in the
   anonymous copy or the AI overview.
   ───────────────────────────────────────────────────────────────────────── */

export const STEROID_STATUS = {
  id: 'steroid', text: 'Do you take steroid medicine, or have you in the past year?',
  options: [
    { id: 'tabs', label: 'Yes, steroid tablets (such as prednisone or dexamethasone) for 3 months or more' },
    { id: 'other', label: 'Yes, other steroids: high-dose inhalers, repeated injections, or a herbal, skin or body-building product that may contain steroids' },
    { id: 'no', label: 'No, or only a short course' },
    { id: 'ns', label: 'Not sure' },
  ],
}
export const onSteroids = (a = {}) => a.steroid === 'tabs' || a.steroid === 'other'

/* Red flags the site did not already ask (document §6), shown first with
   long-term steroids. */
export const STEROID_RED_FLAGS = [
  { id: 'st-adrenal', tier: 'emergency', call911: true,
    text: 'Very weak, dizzy or faint, with vomiting, stomach pain, a fever or confusion, while taking steroids or since stopping them',
    why: { title: 'Possible adrenal crisis',
      text: 'With steroid medicine, or soon after stopping it, these together can mean the body is short of its own steroid hormone (an adrenal crisis). It needs emergency treatment. If you carry a steroid emergency card or injection, use it as instructed while you wait.' } },
  { id: 'st-mind', tier: 'emergency',
    text: 'Since starting or changing steroid medicine: confusion, seeing or hearing things that are not there, or very low mood with thoughts of harming yourself',
    why: { title: 'Please get help today',
      text: 'Steroid medicine can sometimes change thinking and mood quickly. This needs a doctor today, in an emergency department. If you are having thoughts of harming yourself, you can also call or text 9-8-8 at any time.' } },
  { id: 'st-infection', tier: 'urgent', sameDay: true,
    text: 'A fever or feeling generally unwell, a hot, swollen joint, or a wound or skin infection that is not healing (steroids can hide the usual signs of infection)',
    why: { title: 'Please see a doctor today',
      text: 'Steroid medicine damps down the usual warning signs of infection, so a mild fever, a warm joint or a slow wound can be more serious than it looks. Please see a doctor the same day.' } },
  // The knee has no tendon-rupture question of its own (the shoulder and
  // upper arm injury screens ask about a pop; the ankle asks about the
  // Achilles on steroids).
  { id: 'st-tendon', tier: 'urgent', sameDay: true,
    when: (z) => z.some((x) => ['knee', 'thigh'].includes(x.type)),
    text: 'A sudden snap or pop at the front of the knee or thigh, after which you cannot straighten the knee or lift the leg properly',
    why: { title: 'Please get this checked today',
      text: 'Steroid medicine can weaken tendons. A snap at the front of the knee or thigh followed by a weak leg can be a torn tendon, and it is best repaired early. Please go to urgent care or see a doctor today.' } },
]

/** The steroid red flags for this person and drawing, minus any already on the page. */
export function steroidRedFlags(answers = {}, asked = [], zones = []) {
  if (!onSteroids(answers)) return []
  const ids = new Set(asked.map((f) => f.id))
  return STEROID_RED_FLAGS.filter((f) => !ids.has(f.id) && (!f.when || f.when(zones)))
}

/* Route A's question, used by ./patternChecks.js (pc-hormone). */
export const HORMONE_SCREEN = {
  text: 'Not explained by a condition you have already been diagnosed with: weakness in both thighs or hips, or both shoulders, that has built up over months (stairs, getting up from a low chair or the toilet, or lifting your arms), together with steroid medicine in the past year (tablets, high-dose inhalers, repeated injections, or a herbal, skin or body-building product that may contain steroids), or body changes such as weight gain around the belly or a rounder face with thinner arms and legs, wide purple or red stretch marks, bruising easily, or thin, fragile skin',
  why: { title: 'Please see your family doctor in the next week or two',
    text: 'Weakness in both thighs or shoulders that has built up over months, together with changes like these, can be linked with the body\'s own steroid hormone (cortisol) or with steroid medicines. This needs a doctor rather than a physiotherapist first. Please see your family doctor in the next week or two, mention these changes together, and take a list of every medicine, inhaler, cream and supplement you use. Please do not stop any steroid tablets on your own. Physiotherapy can help rebuild strength once the cause is being treated; you are welcome to book after that visit.' },
}

/* Route B's cautions-list entry (PainAssessment.jsx, CAUTION_CHECKS). */
export const CUSHING_CAUTION = {
  id: 'ca-cushing', tier: 'caution', text: 'Cushing\'s syndrome, diagnosed by a doctor (being treated, or treated in the past)',
  why: { title: 'Worth knowing before your first assessment',
    text: 'After Cushing\'s is treated, energy and bone density usually improve over a year or two, but muscle strength does not come back by itself: it needs a progressive strength programme, which is where physiotherapy can help. The weakness is muscle that has been lost, not muscle damaged by use, so carefully built-up exercise is safe and is the treatment. Your plan protects your bones, includes balance work, and is paced around tiredness, alongside your endocrinologist or family doctor.' },
}

const SELF_CARE = [
  'Never stop steroid tablets suddenly or on your own: the dose is lowered on a plan from your doctor. Keep your steroid card or sick-day instructions with you if you have them.',
  'Practise standing up from a firm chair without using your hands, a few times, a few times a day, and add gentle step-ups holding a rail. Small, regular amounts build muscle safely.',
  'Protect your back while your bones are at risk: bend at the hips and knees, avoid lifting and twisting at the same time, and tell your doctor about any sudden new back pain.',
  'Ask your doctor about calcium, vitamin D, and whether a bone-density check or bone medicine is right for you; this is recommended for most people on steroid tablets for more than three months.',
]

/** The results panel, or null. `cushing` = ca-cushing ticked. */
export function steroidPanel(answers = {}, cushing = false) {
  const steroids = onSteroids(answers)
  if (!cushing && !steroids) return null
  if (cushing) {
    return {
      title: 'Cushing\'s syndrome and rebuilding strength',
      text: 'Too much cortisol, the body\'s own steroid hormone, breaks down muscle and thins bone, which is why thighs and shoulders feel weak and stairs and chairs get harder. Once the cause is treated, bone density and energy improve over the following year or two. Muscle strength is the part that does not come back by itself: it needs a progressive strength programme for the hips, thighs, trunk and shoulders, starting light and building week by week, with bone-safe lifting, balance work and pacing around tiredness. After surgery or while steroids are being reduced, a period of tiredness and aching is common; the programme continues at a lower level rather than stopping, and dizziness, nausea or unusual weakness are reasons to check with your doctor.',
      notes: steroids ? SELF_CARE : SELF_CARE.slice(1),
    }
  }
  return {
    title: 'Steroid medicine, muscles and bones',
    text: 'Long-term steroid medicine can weaken the thigh and shoulder muscles and thin the bones. The weakness is muscle that has been lost, not muscle damaged by use: carefully built-up strength exercise is safe, is the treatment, and makes the bones and balance stronger too. Physiotherapy can help with a programme that fits around your medicine and your other conditions.',
    notes: SELF_CARE,
  }
}

/** A line for Chandra's summary. */
export function steroidSummary(answers = {}) {
  const s = STEROID_STATUS.options.find((o) => o.id === answers.steroid)
  return s ? [`Steroid medicine in the past year: ${s.label}`] : []
}
