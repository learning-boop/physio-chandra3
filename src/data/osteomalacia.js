/* ─────────────────────────────────────────────────────────────────────────
   Osteomalacia ("soft bones") and rickets: vitamin D, calcium and phosphate.

   From "Osteomalacia.docx" (Conditions/General conditions, v0.1, 4 Oct
   2026), built with the document's recommended answers to its open items.
   Clinician reference: content/reference/osteomalacia.md.

   Four parts:
     A. Undiagnosed adults: folded into the calcium screen (pc-calcium,
        CALCIUM_SCREEN in ./parathyroid.js). Same gate, deep aching bones on
        both sides, with osteomalacia's clues added (bones tender to press,
        weak hips or a waddle, a "stress fracture" without sport, the
        low-vitamin-D risk cluster) and one blood test for both. A separate
        question would have pushed others out of the full final check.
     B. Children: pc-rickets (./patternChecks.js), doctor first, no booking.
     C. Diagnosed and being treated: ca-osteomalacia on the cautions list,
        with the recovery panel below.
     D. Cross-links: the stress-fracture questions (hip, thigh, knee, shin,
        foot) add "more than one, or little extra training → ask for a
        bone blood test" (STRESS_IDS; they are asked of runners only); the widespread-pain doctor line and the
        osteoporosis record name vitamin D.
   ───────────────────────────────────────────────────────────────────────── */

/* B. A child's bones (Munns 2016 global consensus). */
export const RICKETS_SCREEN = {
  text: 'For a child: legs that bow outwards or knock inwards more than other children of the same age, or more as time goes on (after about age 3), or on one side only; wrists or ankles that look swollen or thick; a row of bumps along the ribs; aching legs most days; or walking or teeth coming much later than expected',
  why: { title: 'Please see your family doctor or paediatrician',
    text: 'In a child, these can be signs of rickets: growing bones that are short of vitamin D or calcium. It is found with a blood test and sometimes an X-ray, it is treatable, and the earlier the better. Please book with your family doctor or paediatrician and mention these together, including your child\'s diet and whether they have had vitamin D drops. Call 911 for a seizure, trouble breathing or noisy breathing, or a child who is unusually floppy.' },
}

/* C. Diagnosed and being treated. */
export const OSTEOMALACIA_CAUTION = {
  id: 'ca-osteomalacia', tier: 'caution', text: 'Osteomalacia ("soft bones"), rickets, or low vitamin D affecting the bones or muscles, diagnosed by a doctor and being treated',
  why: { title: 'Worth knowing before your first assessment',
    text: 'Once vitamin D and calcium are being replaced, strength and walking usually improve over weeks to a few months, and physiotherapy can help them keep pace: graded strength and walking work, balance, and protecting any bone that is still healing, alongside your family doctor.' },
}

/** The results panel when ca-osteomalacia is ticked, or null. */
export function osteomalaciaPanel(ticked = false) {
  if (!ticked) return null
  return {
    title: 'Soft bones and getting strong again',
    text: 'Osteomalacia means "soft bones": new bone needs calcium and phosphate, delivered with the help of vitamin D, to harden. Once the shortage is treated, hip and thigh strength usually returns over 4 to 12 weeks, bone aches fade over 3 to 6 months, and small cracks heal over a similar time. The bone has been waiting for its building materials, and muscle that was under-supplied rebuilds. Physiotherapy can help with a strength and walking programme that keeps pace with your recovery, retrains a side-to-side walk so it does not become a habit, and protects any bone that is still healing.',
    notes: [
      // 6 Oct 2026, general conditions cross-check (approved by Chandra), W1.
      'Follow your doctor\'s plan for vitamin D and calcium, and ask when your levels will be rechecked; ask them before changing or stopping anything.',
      'Build up gradually as strength returns: short walks, sit-to-stands from a firm chair and step-ups holding a rail. If your doctor has said a bone may have a crack, follow their plan for weight-bearing (crutches for a time, if advised).',
      'Practise balance holding a counter and clear trip hazards at home while your hips are still weak.',
      'Include calcium-rich foods every day (milk or fortified alternatives, yogurt, tofu set with calcium, leafy greens, canned fish with bones), get some safe midday sun on your skin in spring and summer.',
      'If your pain and weakness are not clearly better after about 3 months of treatment, ask your doctor to review: a few rarer forms need a different treatment.',
      'A sudden sharp pain in the groin, hip or thigh with difficulty taking weight needs a doctor or emergency department the same day; avoid putting weight on it until it is checked.',
      'Tingling around the mouth or in the fingers, or cramps or spasms in the hands and feet, need a doctor the same day (very low calcium). Call 911 for a seizure.',
    ],
  }
}

/* D. The stress-fracture questions: hip, thigh, knee, shin and foot. */
export const STRESS_IDS = ['hpf-stress', 'tgf-stress', 'kf-stress', 'lgf-stress', 'ft-stress']
export const STRESS_LINE = 'If this is not your first stress fracture, or it came on with only a small increase in training, also ask your doctor for a bone blood test (vitamin D, calcium, phosphate and parathyroid hormone): bones short of vitamin D or calcium, or not getting enough fuel for the training, crack more easily, and it is treatable.'
