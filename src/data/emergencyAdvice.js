/* ─────────────────────────────────────────────────────────────────────────
   EMERGENCY: 911 OR GO NOW (Chandra, 2 Oct 2026)
   Every flag with tier 'emergency' ends the visit with no booking. Within
   that tier:
     call911: true  → could be life-threatening within minutes to hours, the
                      person could collapse on the way, or it is not safe to
                      move them (heart, lung clot, stroke, aorta, bleeding,
                      meningitis, sudden weakness in both legs, a neck injury
                      under the Canadian C-Spine Rule). Call 911.
     otherwise      → needs a hospital today but the person is stable enough
                      to get there (cauda equina, a hot joint, compartment
                      syndrome, a fracture they can walk on). Go to emergency
                      now, driven by someone else.
   goTo: 'labour' sends a pregnancy flag to labour and delivery instead.
   The split, flag by flag: content/regions/_REVIEW-911-split.md.
   ───────────────────────────────────────────────────────────────────────── */

const isEmergency = (f) => f && (f.tier === 'emergency' || f.route === 'emergency')

/** 'call911' | 'goNow' | 'labour' for the picked flags, or null when none
    is emergency-tier. 911 wins over everything else. */
export function emergencyLevel(flags = []) {
  const em = flags.filter(isEmergency)
  if (!em.length) return null
  if (em.some((f) => f.call911)) return 'call911'
  if (em.every((f) => f.goTo === 'labour')) return 'labour'
  return 'goNow'
}

export const EMERGENCY_ADVICE = {
  call911: {
    title: 'Please Call 911 Now',
    text: 'What you selected can be a sign of a problem that needs emergency medical help straight away. Please call 911 now. Do not drive yourself, and do not wait for a physiotherapy appointment.',
    button: 'Call 911',
  },
  // A neck injury under the Canadian C-Spine Rule: keep still for the paramedics.
  call911Neck: 'Until help arrives, keep your head and neck as still as you can.',
  goNow: {
    title: 'Please Go to an Emergency Department Now',
    text: 'What you selected needs to be checked in a hospital emergency department today. Please go now. Have someone drive you; do not drive yourself. Do not wait for a physiotherapy appointment.',
    fallback: 'Call 911 if you cannot get there safely, or if it is getting worse quickly.',
  },
  labour: {
    title: 'Please Go to Hospital Now',
    text: 'What you selected needs to be checked at the hospital today. Please go to the labour and delivery unit now, or the emergency department if your hospital has no labour and delivery unit. Have someone drive you; do not drive yourself.',
    fallback: 'Call 911 if the bleeding becomes heavy, you feel faint, or it is getting worse quickly.',
  },
}

/** One sentence for the short symptom guide. */
export const EMERGENCY_SHORT = {
  call911: 'Based on what you selected, please call 911 now. Do not drive yourself. This guide will stop here.',
  goNow: 'Based on what you selected, please go to your nearest emergency department now, with someone else driving. Call 911 if you cannot get there safely or it is getting worse quickly. This guide will stop here.',
  labour: 'Based on what you selected, please go to the labour and delivery unit at your hospital now, with someone else driving. Call 911 if the bleeding becomes heavy or you feel faint. This guide will stop here.',
}
