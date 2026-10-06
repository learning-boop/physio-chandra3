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

   Too little hormone: "Hypopituitarism.docx", reviewed and signed by
   Chandra Matla, 3 Oct 2026 (confirmed in the session); content/reference/
   hypopituitarism.md. Route A: pc-lowhormone (LOW_HORMONE_SCREEN, not
   named). Route B: ca-pituitary (PITUITARY_CAUTION) and its panel. The
   adrenal-crisis overlay is the steroid one: hydrocortisone replacement is
   steroid tablets, so it is named in the question and the crisis wording
   adds the sick-day rules.
   ───────────────────────────────────────────────────────────────────────── */

export const STEROID_STATUS = {
  id: 'steroid', text: 'Do you take steroid medicine, or have you in the past year?',
  options: [
    // 6 Oct 2026, general conditions cross-check (approved by Chandra), S9: adrenal suppression can follow about 4 weeks; Addison's is named.
    { id: 'tabs', label: 'Yes, steroid tablets (such as prednisone, dexamethasone, or hydrocortisone replacement, including for Addison\'s disease) for 4 weeks or more' },
    { id: 'other', label: 'Yes, other steroids: high-dose inhalers, repeated injections, or a herbal, skin or body-building product that may contain steroids' },
    { id: 'no', label: 'No, or only a short course (less than 4 weeks)' },
    { id: 'ns', label: 'Not sure' },
  ],
}
export const onSteroids = (a = {}) => a.steroid === 'tabs' || a.steroid === 'other'

/* Red flags the site did not already ask (document §6), shown first with
   long-term steroids. */
export const STEROID_RED_FLAGS = [
  { id: 'st-adrenal', tier: 'emergency', call911: true,
    text: 'Very weak, dizzy or faint, with vomiting, diarrhoea, stomach pain, a fever or confusion, or unable to keep your steroid tablets down, while taking steroids or since stopping them',
    why: { title: 'Possible adrenal crisis',
      text: 'With steroid medicine, including hydrocortisone replacement, or soon after stopping it, these together can mean the body is short of its own steroid hormone (an adrenal crisis). It needs emergency treatment. If you carry a steroid emergency card or injection, use it as instructed while you wait. On a day you are ill but well enough to keep tablets down, follow the sick-day rules your doctor or endocrinologist gave you and call your doctor.' } },
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

/* Too little pituitary hormone, route A (./patternChecks.js, pc-lowhormone):
   the document's doctor-first rule, a cause (Q3) with exhaustion (Q1) or
   both-sided muscle loss (Q2). The pituitary is named once, as the document
   drafts (open item 1). */
export const LOW_HORMONE_SCREEN = {
  text: 'Not explained by a condition you have already been diagnosed with: for the past few months, exhaustion most days that sleep does not fix, or muscles that have become smaller or weaker on both sides, together with any of these: a pituitary or brain tumour, brain surgery or radiotherapy to the head; a significant head injury or bleeding in the brain; a childbirth with heavy bleeding, after which your periods did not return or breastfeeding did not work; or cancer immunotherapy',
  why: { title: 'Please see your family doctor in the next week or two',
    text: 'Tiredness that does not recover and loss of muscle on both sides can be caused by low hormone levels, including, after a head injury or treatment near the brain, the pituitary gland itself. These are found with blood tests, not by a physiotherapist. Please see your family doctor in the next week or two and mention all of these together, including any head injury, pituitary treatment or difficult childbirth. If you are on cancer immunotherapy, contact your oncology team the same day. Hormones that are low can be replaced, and physiotherapy can help rebuild strength and stamina once they are; you are welcome to book after that visit.' },
}

/* Too little pituitary hormone, route B: diagnosed and on replacement. */
export const PITUITARY_CAUTION = {
  id: 'ca-pituitary', tier: 'caution', text: 'A pituitary hormone problem or adrenal insufficiency, diagnosed by a doctor (for example on hydrocortisone, thyroxine, sex hormone or growth hormone replacement)',
  why: { title: 'Worth knowing before your first assessment',
    text: 'Once hormone replacement is right, a steady strength and stamina programme can help rebuild muscle, energy and bone: they have been under-supplied, not damaged. Your programme starts from where you are, builds by how well you recover the next day, protects your bones, and is never pushed on a day you are unwell. If you take hydrocortisone, sessions are planned around your sick-day rules, alongside your endocrinologist.' },
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
  'A bone-health check is recommended for everyone taking steroid tablets for three months or more: ask your doctor about one. Follow your doctor\'s plan for any medicine or supplements, and ask them before changing or stopping anything.',
]

const PITUITARY_SELF_CARE = [
  'If you take hydrocortisone or prednisone replacement, never miss doses, carry your steroid card, and follow the sick-day rules your doctor or endocrinologist gave you; ask your doctor for them if you have not been given them.',
  'Build activity in small steps: a short daily walk and a few sit-to-stands from a firm chair, adding a little each week only if you have recovered by the next day.',
  'Drink to thirst and keep salt in your diet unless your doctor has told you otherwise, and stand up slowly if you get light-headed.',
  'Ask your doctor about a bone-density check and vitamin D.',
  'Call 911 for a sudden, severe headache with loss of vision, double vision or a drooping eyelid, or for collapse; see a doctor the same day for extreme thirst with large amounts of pale urine.',
]

/** The results panel, or null. `cushing` = ca-cushing ticked; `pituitary` =
    ca-pituitary ticked (takes precedence: its notes cover hydrocortisone). */
export function steroidPanel(answers = {}, cushing = false, pituitary = false) {
  const steroids = onSteroids(answers)
  if (pituitary) {
    return {
      title: 'Low pituitary hormones and rebuilding strength',
      text: 'The pituitary gland sends the signals for cortisol, thyroid hormone, sex hormones and growth hormone. When some of these are low, muscles lose bulk and stamina, bones thin, and energy and mood fall. With the right replacement from your endocrinologist, energy, muscle, bone and mood usually improve over months, and they improve most when replacement is combined with training. The muscles and bones have been under-supplied, not damaged: a progressive strength and aerobic programme, built by how well you recover the next day and using effort rather than heart rate while doses are being adjusted, is safe and is part of the treatment.',
      notes: PITUITARY_SELF_CARE,
    }
  }
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
