/* ─────────────────────────────────────────────────────────────────────────
   Physio while waiting for the doctor (Chandra, 8 Oct 2026: "when the
   scenario says see your family doctor, can it also suggest physio while
   they wait?").

   How soon the doctor is needed (sameDay) and what physio can do meanwhile
   are two separate decisions. Every doctor-tier flag gets one of three:

     alongside   — physio is safe and helpful now; book, and Chandra works
                   with the doctor (an inflammatory pattern, slow changes).
     clearFirst  — book now; Chandra assesses, and treatment starts once a
                   doctor has checked this (a possible cancer or infection
                   pattern, a possible fracture, a wound infection).
     doctorFirst — no booking until a doctor has seen them: the diagnosis
                   decides whether physio is right at all, or treating the
                   area could be unsafe (a recent head injury, deep bone
                   pain, a nervous-system pattern, a possible clot).

   Default: noBooking → doctorFirst, sameDay → clearFirst, else alongside.
   OVERRIDES are the clinical calls that differ from that default.
   ───────────────────────────────────────────────────────────────────────── */

export const OVERRIDES = {
  // Fever, weight loss, a lump or a cancer history: the why line already
  // says a doctor must exclude this first, so treatment waits for that.
  'sc-systemic': 'clearFirst',
}

// A possible infection of the spine, the sacroiliac joint or the jaw joint:
// doctor first, no booking until then (Chandra's sign-off, 9 Oct 2026; the
// 8 Oct prototype had "book now, treatment after the check").
const INFECTION = ['rf-infection', 'trf-infection', 'jrf-infection', 'prf-infection', 'mrf-infection']

// A hand getting weaker, a thinning thumb muscle, constant finger numbness or
// a wrist or fingers that will not lift (elbow, wrist, hand, forearm; base of the neck added 10 Oct 2026): doctor
// first, no booking until then (Chandra's sign-off, round 2, 10 Oct 2026).
const NERVE_WEAKNESS = ['erf-nerve', 'wrf-numb', 'hnd-numb', 'frf-nerve', 'crf-wasting']

// A possible clot in the leg or arm: hands-on treatment or loading of the
// limb is not safe until a clot is excluded, so no booking until then.
const CLOT = /-(dvt|clot)$/

/** The physio option for one doctor-tier flag. */
export function physioPlan(f) {
  // A "not sure which" group carries the strictest option of its questions.
  if (f.physio) return f.physio
  if (OVERRIDES[f.id]) return OVERRIDES[f.id]
  if (CLOT.test(f.id)) return 'doctorFirst'
  if (INFECTION.includes(f.id)) return 'doctorFirst'
  if (NERVE_WEAKNESS.includes(f.id)) return 'doctorFirst'
  if (f.noBooking) return 'doctorFirst'
  if (f.sameDay) return 'clearFirst'
  return 'alongside'
}

/** The strictest option across the flags ticked (doctorFirst wins). */
export function strictestPlan(flags) {
  const plans = flags.map(physioPlan)
  return plans.includes('doctorFirst') ? 'doctorFirst' : plans.includes('clearFirst') ? 'clearFirst' : 'alongside'
}

export const PLAN_LABEL = {
  alongside: 'Physio can start while they wait',
  clearFirst: 'Book now; treatment after a doctor has checked this',
  doctorFirst: 'Doctor first; booking after that visit',
}

/* Patient wording (plain words; no medication advice). */
export const PLAN_TEXT = {
  alongside: 'You do not have to wait to start physio. Chandra can help with your pain and movement now, keep an eye on what you ticked, and work with your doctor on the next steps.',
  clearFirst: 'You can book your physio visit now. Chandra will look at everything first, and treatment starts once a doctor has checked this.',
  doctorFirst: 'This needs a doctor\'s check before physio. Once they have seen you, physio can help your recovery, and you can book with Chandra then.',
}
