/* ─────────────────────────────────────────────────────────────────────────
   Paget's disease of bone: one bone remodelling too fast.

   From "Pagets Disease.docx" (Conditions/General conditions, v0.1, 4 Oct
   2026), built with the document's recommended answers to its open items.
   Clinician reference: content/reference/pagets.md.

   About 70% have no symptoms; most people who reach the site with it are
   diagnosed and have an ordinary hip, knee or back problem next to the
   bone. Three parts:
     A. Undiagnosed: pc-paget (./patternChecks.js), 50 and over, ONE shin,
        thigh, hip, pelvis, low back or head area drawn, for 6 weeks or
        more. Gated on age only, no ancestry question (open item 1). Named
        (open item 3). Family doctor in the next few weeks for a blood test
        and an X-ray; booking still offered (open item 4).
     B. The sarcoma flag for diagnosed people (open item 2) is the
        osteosarcoma bone question (pc-bone, ./boneTumour.js): its adult
        wording tells someone with Paget's to answer yes for new, steadily
        worsening pain or a new swelling in that bone (X-ray this week).
     C. Diagnosed: ca-paget on the cautions list and the panel below.
   ───────────────────────────────────────────────────────────────────────── */

const has = (zones, ...types) => zones.some((z) => types.includes(z.type))
const bothSides = (zones, type) =>
  zones.some((z) => z.type === type && z.id.endsWith('L')) && zones.some((z) => z.type === type && z.id.endsWith('R'))

export const PAGET_TYPES = ['lowerleg', 'thigh', 'hip', 'sij', 'lowerback', 'head']
const OVER_50 = ['50-64', 'o64']
const MONTHS = ['d3m', 'o3m']

/** 50 and over, one Paget's area drawn (one side), for 6 weeks or more. */
export function pagetApplies(zones = [], a = {}) {
  const types = new Set(zones.map((z) => z.type))
  return OVER_50.includes(a.age) && MONTHS.includes(a.duration) && types.size >= 1 && types.size <= 2 &&
    PAGET_TYPES.some((t) => has(zones, t) && !bothSides(zones, t))
}

export const PAGET_SCREEN = {
  text: 'Not explained by a condition you have already been diagnosed with: a deep, constant ache in one bone (the shin, thigh, pelvis, lower back or skull), there at rest and often at night rather than mainly when you move, together with any of these: the skin over that bone feels warmer than the other side, or the bone has visibly thickened or bowed (a shin bowing forward, a thigh bowing outward); your hat size has gone up, or you have noticed hearing loss or headaches with a feeling your head has grown; or a doctor has mentioned a high "alkaline phosphatase" on a blood test, or a parent, brother or sister has Paget\'s disease of bone',
  why: { title: 'Worth a blood test and an X-ray with your family doctor',
    text: 'A deep, constant ache in one bone, especially with warmth or a visible bow of the shin or thigh, a change in head size or hearing, or a high alkaline phosphatase on a past blood test, can be caused by Paget\'s disease of bone: a treatable condition in which one bone renews itself too fast. It is found with a simple blood test and an X-ray of that bone. Please see your family doctor in the next few weeks and mention these together. Until it has been checked, avoid jumping or heavy impact on a bowed bone. You are welcome to book with Chandra for the joint or back problem alongside that visit.' },
}

export const PAGET_CAUTION = {
  id: 'ca-paget', tier: 'caution', text: 'Paget\'s disease of bone, diagnosed by a doctor',
  why: { title: 'Worth knowing before your first assessment',
    text: 'Pagetic bone is strong enough for everyday activity and exercise. Much of the pain usually comes from the joint next to it, or from how a bowed limb carries weight, and that part responds to strength, movement and footwear strategies. Your plan avoids heavy impact on a bowed bone and works alongside your doctor\'s treatment.' },
}

/** The results panel when ca-paget is ticked, or null. */
export function pagetPanel(ticked = false) {
  if (!ticked) return null
  return {
    title: 'Paget\'s disease of bone and this area',
    text: 'In Paget\'s disease one bone, or a few, renews itself too fast, so it becomes larger, warmer and can bend under load. Pain can come from four places, and each has its own answer: the bone itself (a deep, constant ache that usually settles with your doctor\'s bisphosphonate treatment, often a single infusion), the hip or knee next to it (ordinary arthritis), the way a bowed limb carries weight, or a nerve where the spine is involved. The last three are where physiotherapy can help: an arthritis programme of progressive strength and movement, footwear, insoles or a heel raise for a leg-length difference, a walking aid for longer distances when it keeps you active, and strength and balance work to prevent falls. Pagetic bone is strong enough for everyday activity and exercise.',
    notes: [
      'Keep moving every day with low-to-moderate impact activity (walking, cycling, the pool) and simple strength exercises. Avoid jumping and heavy impact on a bowed shin or thigh.',
      'Ask your doctor when your alkaline phosphatase was last checked (usually every one to two years) and whether treatment is due.',
      'Tell any surgeon, dentist or anaesthetist that you have Paget\'s disease: it affects bleeding and planning. If you need a hip or knee replacement, it usually does well, and physiotherapy can help before and after.',
      'New pain in that bone that is steadily getting worse over weeks, or a new swelling or lump over it, after a settled period: see your doctor for an X-ray of the whole bone within a week, rather than more physiotherapy for that area. Rarely, Paget\'s bone can change in a way that needs early imaging.',
      'A sudden sharp pain in a bowed shin or thigh after a stumble or a small knock, or not being able to take weight: urgent care or the emergency department today (a crack through the bone).',
      'Leg weakness or numbness, or a bladder or bowel change, with Paget\'s in the back or pelvis; or clumsy arms or legs, trouble swallowing, dizziness or a severe headache with Paget\'s in the skull: emergency department now.',
      'Confusion, drowsiness, severe thirst or vomiting while you are laid up (illness, bed rest, after surgery): see a doctor the same day (high calcium). Rapidly worsening hearing, ringing, or facial numbness or weakness: see your doctor.',
    ],
  }
}
