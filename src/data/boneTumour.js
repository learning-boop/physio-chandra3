/* ─────────────────────────────────────────────────────────────────────────
   Osteosarcoma and other primary bone tumours: recognise, X-ray, rehabilitate.

   From "Osteosarcoma.docx" (Conditions/General conditions, v0.1, 4 Oct
   2026), built with the document's recommended answers to its open items.
   Clinician reference: content/reference/osteosarcoma.md.

   Rare, but it presents as a sore knee, thigh or shoulder in a teenager who
   plays sport, and most of the delay to diagnosis happens in primary care
   and physiotherapy (BC Children's Hospital study). Three parts:
     A. The recognition rule, every area: pc-bone-young and pc-bone
        (./patternChecks.js), pain in ONE bone for more than three weeks
        that is building, hurts at rest or at night, has a swelling, lump
        or warmth, or a new limp. X-ray, no booking: today or tomorrow up to
        29 (NICE NG12: within 48 hours for children and young people), this
        week from 30. The young knee, thigh and shin tumour questions
        (TUMOUR_IDS) get the same routing. The recognition screens never
        say cancer, tumour or sarcoma (open item 1): "a problem in the bone
        itself; finding it early matters".
     B. A watch line on the results for a young person (or 65 and over)
        with one bone drawn (boneWatch, open item 4).
     C. Diagnosed and treated: ca-bonetumour on the cautions list and the
        rehabilitation panel (boneTumourPanel).
   ───────────────────────────────────────────────────────────────────────── */

const has = (zones, ...types) => zones.some((z) => types.includes(z.type))
const bothSides = (zones, type) =>
  zones.some((z) => z.type === type && z.id.endsWith('L')) && zones.some((z) => z.type === type && z.id.endsWith('R'))

/* The bones the document names: the knee (distal femur, proximal tibia),
   shin, thigh, hip and pelvis, shoulder and upper arm. */
export const BONE_TYPES = ['knee', 'lowerleg', 'thigh', 'hip', 'sij', 'shoulder', 'upperarm']
export const YOUNG = ['u5', 'u18', '18-29']

/** One bone drawn: one of the bone areas, on one side, and no more than
    two kinds of area in all (a knee and the thigh above it still count). */
export function oneBone(zones = []) {
  const types = new Set(zones.map((z) => z.type))
  return types.size >= 1 && types.size <= 2 && BONE_TYPES.some((t) => has(zones, t) && !bothSides(zones, t))
}

export const BONE_SCREEN = {
  text: 'Not explained by a condition you have already been diagnosed with: pain deep in one bone (around the knee, the shin, the thigh, the hip or pelvis, the shoulder or the upper arm) that has gone on for more than three weeks, together with any of these: it is getting worse or more constant rather than slowly settling; it hurts at rest or wakes you (or your child) at night; there is a firm swelling, a lump, or warmth over the bone; or a new limp or not using the arm or leg normally. Answer yes even if it started with a small knock, if that knock should have healed by now.',
}

/* From 30, a narrower question: rotator cuff, frozen shoulder and arthritis
   also wake people and build over weeks, so it asks for pain deep in the
   bone that is building AND there at rest or at night, or a swelling. */
export const BONE_SCREEN_ADULT = {
  text: 'Not explained by a condition you have already been diagnosed with: pain deep in one bone (around the knee, the shin, the thigh, the hip or pelvis, the shoulder or the upper arm), not in the joint or a tendon, that has gone on for more than three weeks and is getting worse week by week and is there at rest or wakes you at night; or a firm swelling, a lump, or warmth over the bone. If you have Paget\'s disease of bone, answer yes for new pain in that bone that is steadily getting worse over weeks, or a new swelling over it',
}

const WHY_TEXT = (when) => `Most pain in a bone comes from training, growth or a knock and settles over a few weeks. Very occasionally, pain in one bone that behaves like this has a cause inside the bone itself, and the only way to tell is a simple X-ray. Please see your family doctor, a walk-in clinic or urgent care ${when} and ask for an X-ray of the painful bone (the whole bone, not just the joint). This is a precaution: most X-rays are reassuring, and if anything is found, finding it early matters. Please do not start or continue physiotherapy, massage or strapping for this area until the X-ray is done; you are welcome to book once you have the result.`
export const BONE_WHY_YOUNG = { title: 'Please get an X-ray today or tomorrow', text: WHY_TEXT('today or tomorrow') }
export const BONE_WHY_ADULT = { title: 'Please get an X-ray this week', text: WHY_TEXT('this week') }

/* The young knee, thigh and shin tumour questions: same routing as pc-bone-young. */
export const TUMOUR_IDS = ['kf-tumour', 'tgf-tumour', 'lgf-tumour']

/* B. The watch line (document §4, total 3 to 5). */
export const BONE_WATCH = 'If this pain is in one bone and is not clearly improving within two to three weeks of sensible care, starts to hurt at night, or a swelling appears, see your doctor for an X-ray rather than continuing to treat it.'
export const boneWatch = (zones = [], answers = {}) => oneBone(zones) && [...YOUNG, 'o64'].includes(answers.age)

/* C. Diagnosed and treated. */
export const BONE_TUMOUR_CAUTION = {
  id: 'ca-bonetumour', tier: 'caution', text: 'A bone tumour (such as osteosarcoma or Ewing sarcoma), treated with surgery, chemotherapy or radiotherapy, now or in the past',
  why: { title: 'Worth knowing before your first assessment',
    text: 'Physiotherapy is a central part of recovery after bone-tumour treatment, from the first days after surgery to returning to school, work and sport. Your surgeon\'s weight-bearing and movement limits and your oncology team\'s exercise advice come first: please bring them.' },
}

/** The results panel when ca-bonetumour is ticked, or null. */
export function boneTumourPanel(ticked = false) {
  if (!ticked) return null
  return {
    title: 'Rehabilitation after bone-tumour treatment',
    text: 'After treatment for osteosarcoma or another bone tumour (chemotherapy before and after surgery, with a limb-saving reconstruction or an amputation), physiotherapy can help with regaining movement and strength around the reconstruction or learning to use a prosthesis, rebuilding fitness after chemotherapy, managing nerve changes, balance and bone health, and getting back to the things you value. Recovery is measured in months to a couple of years, and most people regain a high level of function. It works best as a team: your surgeon, oncologist, prosthetist and physiotherapist working from one plan.',
    notes: [
      'Bring your surgeon\'s weight-bearing and movement limits and your oncology team\'s exercise advice to every session, and follow them exactly.',
      'After a limb-saving reconstruction: staged rehabilitation protects it while restoring movement and strength, and includes clear, lifelong guidance on which activities protect an implant and which overload it (usually no high-impact sport or heavy loading, as your surgeon advises).',
      'After an amputation or rotationplasty: care of the limb, keeping joints from tightening, strength and balance, training with a prosthesis, and strategies for phantom-limb pain.',
      'During chemotherapy: keep gently active on the days you can (short walks, light exercises), and rest when your blood counts are low. Regular, paced exercise is the best-evidenced treatment for cancer-related tiredness.',
      'A temperature of 38 °C or higher, chills, or feeling suddenly unwell during or after chemotherapy: call your oncology team\'s emergency line or go to the emergency department straight away.',
      'New pain, swelling, redness, warmth or discharge around the reconstruction or scar, or a fever: contact your sarcoma team or go to the emergency department today. A new clunk, giving way, change of shape or loss of movement in a reconstructed joint: stop loading it and contact your orthopaedic team promptly.',
      'Breathlessness, chest pain, palpitations, swollen ankles or being unable to lie flat need urgent medical care (some chemotherapy affects the heart). Call 911 for one swollen, painful calf with sudden breathlessness, or sudden breathlessness after surgery.',
      'After treatment, tell your sarcoma team promptly about any new bone pain, a new lump, or a cough or breathlessness that does not go away, and keep moving: fitness returns with steady, patient work.',
    ],
  }
}
