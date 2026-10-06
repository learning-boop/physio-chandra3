/* ─────────────────────────────────────────────────────────────────────────
   Spondylolysis, already diagnosed — the physiotherapy route.
   ("Spondylolysis.docx", Conditions/Lumbar; approved by Chandra in session,
   6 Oct 2026. The document describes two states, and this is the second.)

   State 1, the RECOGNITION GATE, is already live as the low back red flag
   rf-spondy: under 20, pain on arching in sport, more than 2–3 weeks → see a
   doctor for an X-ray before training through it, with no booking prompt.

   State 2, THIS one, is the person whose doctor has already confirmed a pars
   stress injury or a low-grade slip and cleared them for rehabilitation.
   Sending them back for the X-ray they have already had would be wrong, so
   ticking this on the cautions list:
     · takes rf-spondy out of their safety questions (they have been imaged),
     · keeps the physiotherapy route and the booking prompt,
     · and adds the rehabilitation panel below to their results.

   No clinical practice guideline exists for adolescent spondylolysis; the
   nearest is the PRiSM Delphi consensus (Orthop J Sports Med, June 2026),
   with Selhorst 2020 (IJSPT) for the rehabilitation staging. Bracing and the
   timing of physiotherapy did NOT reach consensus, which is why the panel
   leaves both to the treating doctor.

   ⚠ FOR CLINICIAN REVIEW — wording of the panel and the return-to-sport
   criteria.
   ───────────────────────────────────────────────────────────────────────── */

export const SPONDY_CAUTION = {
  id: 'ca-spondy', tier: 'caution',
  text: 'A doctor has confirmed a stress injury in the lower back (spondylolysis, a "pars" injury) or a small slip, and has cleared you for rehabilitation',
  why: {
    title: 'Your rehabilitation is planned around the diagnosis',
    text: 'Knowing the bone has been imaged changes where we start: no sport-specific arching until your doctor or specialist agrees, then a staged plan that rebuilds control, strength and the sport itself. You will not be asked to go back for the X-ray you have already had.',
  },
}

/* Asked on "A little about you", before the safety questions — the cautions
   list is shown after them, which would be too late to stop the X-ray
   question. Only asked when it could matter: a low back drawing, under 30
   (pars stress injuries are a growing-bone problem; 20–30 is kept because
   many are diagnosed late). */
export const SPONDY_STATUS = {
  id: 'spondy',
  text: 'Has a doctor found a stress crack in a lower back bone (spondylolysis) or a small slip of that bone (spondylolisthesis), and said you can start rehab?',
  options: [
    { id: 'yes', label: 'Yes, I have had a scan and been told I can start' },
    { id: 'no', label: 'No, or it has not been checked yet' },
  ],
}

const SPONDY_ZONES = ['lowerback', 'sij']
const SPONDY_AGES = ['u18', '18-29']
export const spondyAsked = (zones = [], age) =>
  SPONDY_AGES.includes(age) && zones.some((z) => SPONDY_ZONES.includes(z.type))

/** True when this person has told us the diagnosis is already made — on the
    early question, or on the cautions list if they got there first. */
export const spondyDiagnosed = (flags = [], answers = {}) =>
  flags.includes('ca-spondy') || answers.spondy === 'yes'

/** The results panel: what rehabilitation looks like once it is confirmed. */
export function spondylolysisPanel(ticked = false) {
  if (!ticked) return null
  return {
    title: 'Rehabilitation after a confirmed pars stress injury',
    text: 'A pars stress injury is a stress fracture in a narrow part of a lower-spine bone, almost always from repeated arching and twisting before the growing bone was ready for it. Like other stress fractures it heals best when the load that caused it comes off for a while and is then rebuilt step by step. Most young people return to full sport, and surgery is rarely needed. Your plan is built with your doctor or specialist: a period away from the aggravating sport, usually two to three months and sometimes longer, while you stay generally active with comfortable activities such as walking, swimming or cycling.',
    notes: [
      'Rehabilitation usually starts with gentle forward-bending mobility and deep abdominal and lower-back control work, then adds limb loading, hip and hamstring flexibility, and general strengthening.',
      'Return to sport is by milestones rather than dates: arching is pain-free, single-leg tests are comfortable, running is pain-free, and control holds up under fatigue. Sport-specific skills are then rebuilt one at a time.',
      'No sport-specific arching or back-extension loading until your doctor or specialist has agreed the plan, whatever the pain is doing.',
      'Bracing is your doctor\'s or specialist\'s decision. Some use it and many do not, and the evidence does not clearly favour either way.',
      'Load is part of the treatment: your coach needs to know, so training volume and the skills that arch the back can be planned rather than guessed.',
      'Tell us if the pain returns at the same spot as you rebuild, if it starts waking you at night, or if any numbness, tingling or weakness appears in a leg — that is a reason to pause and review with your doctor rather than train through it.',
    ],
  }
}
