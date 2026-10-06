/* ─────────────────────────────────────────────────────────────────────────
   Neurodynamic reading — for Chandra's clinician summary, never the patient.

   From Chandra's neurodynamics books (6 Oct 2026): Shacklock, NDS
   lower-quarter course manual 2017-18 and Clinical Neurodynamics (2005);
   Butler, NOI neurodynamic techniques workbook. Two things a screen can say
   before the visit:

   1. How far to take nerve testing at the first visit (Shacklock's levels):
        0  contraindicated: rapidly worsening, acute foot drop, cord or cauda
           equina signs — other priorities first
        1  limited: irritable or slow-to-settle pain, a neurological deficit,
           or a likely space-occupying cause at the interface — the
           differentiating movement first, as the "off switch", to the first
           onset of symptoms only, once
        2  standard: not irritable, no deficit, stable
        3  advanced: only if level 2 is normal, the problem is stable, and
           demands are high (sport, heavy work) — named as an option, never
           the starting point
   2. What the answers suggest about the mechanism:
        reduced CLOSING (interface): arching, standing tall, or looking up /
          tilting towards sends symptoms down the limb — suspect a
          space-occupying cause; treat the nerve's physiology first (openers)
        TENSION dysfunction: stretch positions, head forward (leg) or tilt
          away (arm) bring it on, release eases it
        CONDUCTION: numbness that stays or weakness — neurology before and
          after every session

   Rules only. ⚠ FOR CLINICIAN REVIEW — the cut-offs below.
   ───────────────────────────────────────────────────────────────────────── */

const as = (v) => (Array.isArray(v) ? v : v === undefined || v === null ? [] : [v])
const has = (v, id) => as(v).includes(id)

/* Safety-check ids whose YES makes neurodynamic testing a later priority:
   cauda equina, rapidly worsening or both-leg weakness, foot drop, cord signs. */
const LEVEL_ZERO_FLAGS = ['rf-saddle', 'rf-bladder', 'rf-sexual', 'rf-legs', 'rf-footdrop', 'rf-myelo', 'nrf-myelo', 'nrf-cord']

/** Is there a nerve picture at all worth a neurodynamic plan? */
function nervePicture(answers, referral) {
  return referral.length > 0
    || as(answers.L1).some((o) => o === 'thigh' || o === 'belowknee' || o === 'front')
    || as(answers.N2).some((o) => ['pastelbow', 'fingers', 'wholehand', 'burning', 'weak'].includes(o))
    || ['L12', 'L13', 'N14', 'N15'].some((q) => as(answers[q]).length > 0)
    || as(answers.painQuality).some((o) => o === 'burning' || o === 'tingling')
}

/** Neurodynamic reading of the answers, or null when there is no nerve picture.
    `flagIds` = safety-check ids the person ticked; `behaviour` from
    interpretBehaviour (./painBehaviour.js). Returns
    { level, levelWhy: string[], findings: string[] }. */
export function neurodynamicReading({ answers = {}, behaviour = {}, referral = [], flagIds = [] } = {}) {
  if (!nervePicture(answers, referral)) return null
  const findings = []
  const leg = as(answers.L12), front = as(answers.L13), arm = as(answers.N14)

  // ── Mechanism (Shacklock's diagnostic categories) ──
  const closing = has(leg, 'closing') || ['arm', 'sometimes'].includes(as(answers.N3)[0])
  const tension = ['stretch', 'stretchsome', 'neckdown', 'toesup'].some((o) => has(leg, o))
    || has(front, 'pkb') || ['stretch', 'stretchsome', 'tiltaway'].some((o) => has(arm, o))
    || has(answers.L3, 'bendsit')
  const differentiated = has(leg, 'neckdown') || has(arm, 'tiltaway')
  const loss = has(leg, 'loss') || has(front, 'kneeweak') || has(arm, 'loss') || has(answers.N2, 'weak')
  if (closing) findings.push('Interface CLOSING reported (arching / standing tall, or looking up / tilting towards, sends symptoms down the limb) — reduced closing dysfunction: suspect a space-occupying cause (disc, foraminal narrowing, swollen joint). Treat the nerve\'s physiology first with openers; neurological examination before and after.')
  if (tension) findings.push(`Stretch positions bring it on${differentiated ? ', and the patient reports a remote movement changing it (head forward for the leg, head tilt away for the arm) — their own structural differentiation' : ''} — consistent with a neural tension dysfunction: confirm with SLR / slump / PKB-SKB or ULNT, differentiate, compare sides.`)
  if (closing && tension) findings.push('Both together — Shacklock\'s combined interface and tension picture: start with openers and sliders, progress to closers and tensioners as irritability falls.')
  if (loss) findings.push('Possible conduction loss reported (numbness that stays, weakness) — full neurological examination first; treat the sensitivity, monitor conduction closely.')
  if (has(leg, 'tender') || has(arm, 'tender')) findings.push('Tender along the nerve reported — palpate the tract and compare sides (thickening, swelling, reproduction).')
  // The arm self-tests (N15; Butler's active quick tests): which nerve reacted.
  const self = as(answers.N15)
  const SELF = {
    median: 'median (arm out, wrist back, head tilt away) - confirm with ULNT1 / ULNT2a',
    ulnar: 'ulnar (hand on the ear, elbow lifted) - confirm with ULNT3; check the cubital tunnel and Guyon canal',
    radial: 'radial (fist round the thumb, elbow straight, arm turned in, shoulder down) - confirm with ULNT2b; radial tunnel vs lateral elbow',
  }
  const positive = Object.keys(SELF).filter((k) => self.includes(k))
  if (positive.length) findings.push(`Patient self-test reproduced the usual symptoms: ${positive.map((k) => SELF[k]).join('; ')}. A home test without structural differentiation by a clinician - repeat it, differentiate and compare sides.`)
  if (self.includes('nonebrought')) findings.push('Patient self-tests did not reproduce the symptoms - a neural source is less likely; weigh the musculoskeletal and interface findings.')
  if (self.includes('skip')) findings.push('Self-tests declined or too painful to try - start at level 1.')
  if (has(front, 'pkb') || has(front, 'fronttingle')) findings.push('Front-of-thigh nerve features — slump knee bend (differentiate with the neck); add hip abduction for the obturator nerve, adduction for the lateral femoral cutaneous nerve.')

  // ── Exam level ──
  const levelWhy = []
  const zero = flagIds.filter((id) => LEVEL_ZERO_FLAGS.includes(id))
  let level
  if (zero.length) {
    level = 0
    levelWhy.push('A neurological safety answer was ticked (cauda equina, cord, foot drop or rapidly worsening weakness): other priorities come first.')
  } else {
    const irritable = behaviour.irritability === 'severe' || behaviour.irritability === 'moderate'
    const slowSettle = ['nextday', 'constant'].includes(answers.sinSettle)
    if (irritable) levelWhy.push(`Irritability ${behaviour.irritability}.`)
    if (slowSettle) levelWhy.push('Slow to settle — latent responses are possible, so warning comes late.')
    if (loss) levelWhy.push('Possible neurological deficit.')
    if (closing) levelWhy.push('Likely interface pathology (closing).')
    const tooSore = as(answers.N15).includes('skip')
    if (tooSore) levelWhy.push('Self-tests declined or too painful to try.')
    level = irritable || slowSettle || loss || closing || tooSore ? 1 : behaviour.irritability === 'mild' ? 2 : null
    if (level === 2) levelWhy.push('Low irritability, no deficit or closing reported.')
  }
  return { level, levelWhy, findings }
}

export const LEVEL_TEXT = {
  0: 'Level 0 — neurodynamic testing contraindicated for now',
  1: 'Level 1 — limited: differentiating movement first (the "off switch"), to first onset only, once; test neural and musculoskeletal structures separately',
  2: 'Level 2 — standard tests to comfortable symptom production; level 3 (sensitised, local sequence, multistructural) only if level 2 is normal and demands are high',
}
