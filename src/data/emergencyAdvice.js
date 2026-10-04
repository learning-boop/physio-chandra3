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
   goTo: 'labour' sends a pregnancy flag to labour and delivery instead;
   goTo: 'crisis' (thoughts of self-harm after a head injury) gives the 9-8-8
   Suicide Crisis Helpline.
   The split, flag by flag: content/regions/_REVIEW-911-split.md.
   ───────────────────────────────────────────────────────────────────────── */

const isEmergency = (f) => f && (f.tier === 'emergency' || f.route === 'emergency')

/** 'call911' | 'goNow' | 'crisis' | 'labour' for the picked flags, or null
    when none is emergency-tier. 911 wins over everything else. */
export function emergencyLevel(flags = []) {
  const em = flags.filter(isEmergency)
  if (!em.length) return null
  if (em.some((f) => f.call911)) return 'call911'
  if (em.some((f) => !f.goTo)) return 'goNow'
  if (em.some((f) => f.goTo === 'crisis')) return 'crisis'
  return 'labour'
}

/* Most severe first (Chandra, 4 Oct 2026). Each safety page is sorted by
   this every time it is built, so the order follows the questions that
   apply to this person rather than a fixed list. Equal severity keeps the
   order the page gave (context questions such as pregnancy or diabetes
   first, then the areas' own, then the drawing's pattern questions).
     Emergency page: 1 call 911 · 2 emergency department or labour and
       delivery now · 3 the crisis line (9-8-8, doctor today).
     Doctor pages: 4 doctor today, booking held · 5 doctor today ·
       6 doctor first in the next few days, booking held · 7 see your
       doctor, booking still offered. */
export function severityRank(f = {}) {
  if (isEmergency(f)) return f.call911 || f.keepNeckStill ? 1 : f.goTo === 'crisis' ? 3 : 2
  if (f.sameDay) return f.noBooking ? 4 : 5
  return f.noBooking ? 6 : 7
}
/** The flags, most severe first; a stable sort, so equal severity keeps its order. */
export const bySeverity = (flags = []) =>
  flags.map((f, i) => [f, i]).sort((a, b) => severityRank(a[0]) - severityRank(b[0]) || a[1] - b[1]).map(([f]) => f)

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
  crisis: {
    title: 'Please Reach Out for Support Now',
    text: 'You do not have to manage this alone. Call or text 9-8-8, the Suicide Crisis Helpline, at any time of day or night. Please also see your doctor today.',
    fallback: 'If you are in immediate danger, or might act on these thoughts, call 911.',
    button: 'Call 9-8-8',
    tel: '988',
  },
}

/** One sentence for the short symptom guide. */
export const EMERGENCY_SHORT = {
  call911: 'Based on what you selected, please call 911 now. Do not drive yourself. This guide will stop here.',
  goNow: 'Based on what you selected, please go to your nearest emergency department now, with someone else driving. Call 911 if you cannot get there safely or it is getting worse quickly. This guide will stop here.',
  crisis: 'Please call or text 9-8-8, the Suicide Crisis Helpline, at any time, and see your doctor today. If you are in immediate danger, call 911. This guide will stop here.',
  labour: 'Based on what you selected, please go to the labour and delivery unit at your hospital now, with someone else driving. Call 911 if the bleeding becomes heavy or you feel faint. This guide will stop here.',
}
