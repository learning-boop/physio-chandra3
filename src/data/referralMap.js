/* ─────────────────────────────────────────────────────────────────────────
   Referral map — what can send pain to each area of the body map.

   From Chandra's "Referred Pain: A Clinical Reference" (Sep 2026; the source
   text is content/reference/referred-pain.md), which collects the segmental
   (facet, disc, SIJ), nerve-root, muscle and organ referral maps it cites:
   Dwyer, Aprill & Bogduk 1990; Cooper et al. 2007; Cloward 1959; Dreyfuss
   1994; Fukui 1997; O'Neill 2002; Slipman 2000; Lesher 2008; Travell,
   Simons & Simons 2019; Giamberardino 2003; Heick & Lazaro 2022.

   CLINICIAN-FACING ONLY. It lists sources to consider for an area, never
   what a visitor has, so it goes into the summary Chandra receives and into
   the AI's medical-concern check — never onto the visitor's result screen.
   Keys are body-map zone types (src/components/Body3D.jsx).

   `joints`  spinal joints, discs, SIJ, peripheral joints (somatic referred)
   `roots`   nerve roots whose pain or pins and needles can reach the area
   `muscles` muscles whose referral pattern covers the area
   `organs`  organs sharing the segment — clear these when the pain does not
             change with movement, posture or pressing
   ───────────────────────────────────────────────────────────────────────── */

export const REFERRAL_MAP = {
  head: {
    joints: ['C0–C1 / C1–C2 facets (suboccipital, occipital headache)', 'C2–C3 facet (main source of cervicogenic headache, third occipital nerve)'],
    roots: [],
    muscles: ['Upper trapezius (temple, angle of jaw)', 'Sternocleidomastoid (forehead, eye, ear; autonomic eye signs)', 'Suboccipitals (occiput to orbit)', 'Splenius (vertex, behind the eye)', 'Masseter / temporalis (teeth, ear, eyebrow)'],
    organs: ['Heart via the vagus (jaw, throat, ear)'],
  },
  jaw: {
    joints: ['Jaw joint / TMJ (in front of or into the ear; clicking, locking)', 'C2–C3 and upper cervical joints (jaw, face, around the ear)'],
    roots: [],
    muscles: ['Masseter / temporalis (cheek, temple, ear, teeth)', 'Upper trapezius (angle of the jaw)', 'Sternocleidomastoid (ear, face)'],
    organs: ['Heart (left jaw, with effort)', 'Teeth (sensitive to hot, cold or biting: dentist first)', 'Throat, tonsils or voice box via the vagus and glossopharyngeal nerves (ear and jaw)', 'Ear'],
  },
  neck: {
    joints: ['C3–C4 facet (posterolateral neck, over levator scapulae)', 'C4–C5 facet (base of neck, top of shoulder)'],
    roots: ['C4 (neck, upper trapezius, top of shoulder)'],
    muscles: ['Upper trapezius', 'Levator scapulae (angle of the neck)', 'Sternocleidomastoid'],
    organs: ['Diaphragm, pericardium, liver or spleen capsule (C3–C5, phrenic)', 'Heart (neck, jaw)'],
  },
  ctj: {
    joints: ['C6–C7 facet (infraspinous fossa, scapular body)', 'C7–T1 facet (interscapular, medial scapular border)', "Cervical discs C3–C7 (Cloward's areas, medial scapula)", 'Upper thoracic and rib joints T1–T3'],
    roots: ['C6–C8 (medial scapula, often before arm symptoms)', 'C7 (scapular pain common)'],
    muscles: ['Rhomboids / middle trapezius (medial scapular border)', 'Levator scapulae', 'Scalenes (medial scapula)'],
    organs: ['Heart and proximal aorta (interscapular, T1–T5)', 'Oesophagus (interscapular, T4–T6)', 'Lung apex / Pancoast (scapula; Horner\'s, hand wasting, smoker)'],
  },
  shoulder: {
    joints: ['C4–C5 facet (top of shoulder)', 'C5–C6 facet (supraspinous fossa, lateral shoulder)', 'Glenohumeral joint / capsule (deltoid area, rarely below the elbow)', 'Acromioclavicular joint (top of shoulder, localised)'],
    roots: ['C4 (top of shoulder)', 'C5 (lateral shoulder, deltoid patch)'],
    muscles: ['Supraspinatus (mid-deltoid)', 'Infraspinatus (deep anterior shoulder)', 'Teres minor (posterior deltoid)', 'Subscapularis (posterior shoulder)', 'Scalenes (anterior chest, lateral arm)'],
    organs: ['Diaphragm (shoulder tip, C3–C5)', 'Liver / gallbladder (right shoulder)', 'Spleen (left shoulder tip, Kehr\'s sign)', 'Heart (left shoulder)', 'Lung / pleura (shoulder tip)', 'Ectopic pregnancy (shoulder tip)'],
  },
  upperarm: {
    joints: ['Glenohumeral joint / capsule (deltoid area, C5 zone)'],
    roots: ['C5 (outer upper arm, deltoid patch)', 'C7 (back of the arm)', 'T1 (inner arm and armpit)'],
    muscles: ['Supraspinatus / infraspinatus (outer upper arm; infraspinatus down the front of the arm)', 'Biceps and brachialis (front of the upper arm)', 'Triceps and coracobrachialis (back of the arm)', 'Pectoralis minor and latissimus dorsi (inner arm)'],
    organs: ['Heart (inside of the left arm, T1, with effort)', 'Lung apex / Pancoast (inner arm)', 'Arm vein clot (whole arm swollen and heavy)'],
  },
  forearm: {
    joints: [],
    roots: ['C6 (outer forearm to the thumb)', 'C7 (back of the forearm to the middle finger)', 'C8 (inner forearm to the little finger)'],
    muscles: ['Forearm extensors, supinator and brachioradialis (top of the forearm, back of the hand)', 'Infraspinatus (thumb side of the forearm)', 'Radial tunnel (deep ache below the outer elbow)', 'Median nerve at the pronator (underside of the forearm)'],
    organs: ['Heart (inner forearm, left, with effort)'],
  },
  elbow: {
    joints: ['Glenohumeral joint (upper arm)'],
    roots: ['C5 (lateral upper arm)', 'C6 (lateral forearm)', 'C7 (posterior arm and forearm)', 'C8 (medial forearm)', 'T1 (medial arm and elbow)'],
    muscles: ['Supraspinatus (can extend to the lateral epicondyle)', 'Infraspinatus (anterolateral arm, radial forearm)', 'Wrist extensors (lateral epicondyle, dorsal forearm)', 'Latissimus dorsi (posterior arm)', 'Pectoralis minor (medial arm)'],
    organs: ['Heart (medial arm, T1; left side)'],
  },
  wrist: {
    joints: ['Upper thoracic spine T2–T7 (T4 syndrome: glove-like pins and needles or coldness in both hands; diagnosis of exclusion)'],
    roots: ['C6 (thumb and index finger)', 'C7 (middle finger)', 'C8 (ring and little fingers)'],
    muscles: ['Scalenes (thumb and index)', 'Infraspinatus (radial hand)', 'Pectoralis major / minor and latissimus dorsi (ulnar fingers)', 'Subscapularis (band around the wrist)', 'Wrist extensors (dorsal hand)'],
    organs: ['Heart (ulnar hand)', 'Lung apex / Pancoast (ulnar hand)'],
  },
  chest: {
    joints: ['Costovertebral joints (along the rib to the front of the chest)', 'Costochondral joints (breastbone)'],
    roots: ['Thoracic roots (a band around the chest)'],
    muscles: ['Pectoralis major / minor (anterior chest)', 'Scalenes (anterior chest)', 'Serratus anterior (lateral chest wall)'],
    organs: ['Heart and aorta (retrosternal, left chest)', 'Oesophagus (retrosternal burning)', 'Lungs / pleura (chest wall, worse with breathing)', 'Stomach (epigastric)'],
  },
  upperback: {
    joints: ['Thoracic facets T4–T12 (mostly one side, about one segment below the joint)', 'Costovertebral joints (along the rib)'],
    roots: ['Thoracic roots (a band around the chest or tummy)'],
    muscles: ['Rhomboids / middle trapezius (medial scapula)', 'Serratus anterior (inferior scapular angle)', 'Latissimus dorsi (inferior scapular angle)', 'Rectus abdominis / obliques (a band across the mid back)'],
    organs: ['Heart and aorta (interscapular)', 'Stomach / duodenum (T6–T10 mid back)', 'Liver / gallbladder (right inferior scapular angle, Boas\' sign)', 'Pancreas (a band through to the mid back)', 'Oesophagus (interscapular)'],
  },
  tlj: {
    joints: ['Thoracolumbar junction T11–L2 (Maigne: low back, iliac crest, buttock, lateral hip, groin)', 'L1–L2 facets (flank, iliac crest)', 'Lower rib joints'],
    roots: ['T10–L1 (a band around the flank and lower tummy)'],
    muscles: ['Quadratus lumborum (iliac crest, SIJ, buttock)'],
    organs: ['Kidney (flank, costovertebral angle)', 'Pancreas (band T10–L1)', 'Small intestine (mid lumbar)', 'Aorta (back and tummy)'],
  },
  flank: {
    joints: ['L1–L2 facets (flank)', 'Thoracolumbar junction lateral branches', 'Lower ribs 11–12 (slipping rib)'],
    roots: ['T10–L1 (flank band)'],
    muscles: ['Quadratus lumborum', 'Abdominal obliques'],
    organs: ['Kidney and upper ureter (flank, lateral abdomen to groin)', 'Colon', 'Ovary / testis (T10–T11)'],
  },
  abdomen: {
    joints: ['Lower thoracic facets'],
    roots: ['T10 (at the belly button)'],
    muscles: ["Rectus abdominis / obliques (can mimic organ pain; worse tensing the tummy, Carnett's sign)"],
    organs: ['Stomach / duodenum (epigastric)', 'Pancreas (epigastric, through to the back)', 'Small intestine and early appendix (periumbilical)', 'Colon (lower abdomen)', 'Bladder (suprapubic)'],
  },
  lowerback: {
    joints: ['L3–L4, L4–L5 facets (low back, buttock, trochanter, lateral and posterior thigh)', 'L5–S1 facet (lower lumbar, buttock, posterior thigh)', 'Lumbar disc (central low back; spreads further as it worsens)', 'Sacroiliac joint (lower lumbar in 72%)', 'Interspinous, SI and iliolumbar ligaments'],
    roots: [],
    muscles: ['Quadratus lumborum', 'Iliopsoas (vertical band beside the lumbar spine)', 'Lumbar multifidus (sacrum, buttock)', 'Gluteus medius (posterior iliac crest, SIJ)'],
    organs: ['Aorta / aneurysm', 'Kidney', 'Small intestine and colon (mid lumbar)', 'Prostate', 'Uterus / ovary (lumbosacral, linked to periods)', 'Bladder (lower back, sacrum)'],
  },
  sij: {
    joints: ['Sacroiliac joint (buttock 94%, lower lumbar 72%, thigh 48%, below the knee 28%, groin 14%, foot 12%; Fortin finger test within 1 cm of the PSIS)', 'L5–S1 facet (buttock, dimple area)', 'Lumbar disc', 'Hip joint (buttock 71%)', 'SI and iliolumbar ligaments'],
    roots: ['S1 (buttock, posterior thigh)', 'S2–S4 (sacrum, perineum, saddle area)'],
    muscles: ['Gluteus medius (posterior iliac crest, SIJ, outer buttock)', 'Quadratus lumborum (SIJ, top of the hip bone, buttock)', 'Piriformis (middle of the buttock, posterior thigh)', 'Lumbar multifidus (sacrum, buttock)'],
    organs: ['Rectum, bladder neck, prostate, cervix (sacrum and perineum, S2–S4)', 'Uterus (lumbosacral, SIJ; linked to periods or pregnancy)', 'Colon (sacrum)'],
  },
  coccyx: {
    joints: ['Sacrococcygeal joint and coccyx (sitting pain, worse leaning back)', 'Lumbar discs (referred to the tailbone)'],
    roots: ['S3–S5 (sacrum, tailbone, perineum)'],
    muscles: ['Pelvic floor / levator ani (tailbone, back passage, perineum)', 'Gluteus maximus (buttock crease)'],
    organs: ['Rectum and colon (S2–S4)', 'Prostate', 'Cervix and uterus', 'Skin of the buttock crease (pilonidal sinus)'],
  },
  hip: {
    joints: ['Hip joint (buttock 71%, groin 55%)', 'Sacroiliac joint (buttock 94%, groin 14%)', 'L3–L5 facets (buttock, greater trochanter)', 'L1–L3 facets (groin)'],
    roots: ['L2 (groin, upper anterior thigh)', 'S2–S4 (perineum, saddle area)'],
    muscles: ['Gluteus medius (lateral buttock and hip)', 'Piriformis (buttock, posterior hip)', 'Quadratus lumborum (greater trochanter)', 'Iliopsoas (anterior thigh)', 'Lumbar multifidus (buttock)'],
    organs: ['Ureter (groin, testis or labia, in waves)', 'Ovary / testis (groin)', 'Appendix (right groin)', 'Bladder and prostate (perineum)'],
  },
  knee: {
    joints: ['Hip joint (thigh 57%, below the knee 22%, medial knee via the obturator nerve)', 'Sacroiliac joint (thigh 48%, below the knee 28%)', 'L4–L5, L5–S1 facets and discs (thigh, occasionally calf)'],
    roots: ['L3 (anterior thigh to medial knee)', 'L4 (medial knee and leg)', 'L5 (lateral thigh and leg)', 'S1 (posterior thigh and calf)'],
    muscles: ['Gluteus minimus (lateral and posterior thigh and calf: "pseudo-sciatica")', 'Tensor fascia lata (lateral thigh to knee)', 'Vastus lateralis / medialis (lateral or medial knee)', 'Hamstrings (posterior thigh, back of the knee)', 'Gastrocnemius / soleus (calf, back of the knee)'],
    organs: ['Ureter (inner thigh)', 'Bladder dome and uterus (anterior thigh, T11–L2)'],
  },
  ankle: {
    joints: ['Sacroiliac joint (foot in 12%)'],
    roots: ['L4 (medial leg to the medial malleolus)', 'L5 (dorsum of the foot, big toe)', 'S1 (lateral foot, sole, little toe)'],
    muscles: ['Gluteus minimus (down to the ankle)', 'Gastrocnemius / soleus (instep, heel)', 'Tibialis anterior (anterior shin, big toe)', 'Peroneals (lateral ankle and foot)'],
    organs: [],
  },
}

/* Order the summary lists areas in: spine first, then out along the limbs. */
const ORDER = ['head', 'neck', 'ctj', 'upperback', 'chest', 'tlj', 'flank', 'lowerback', 'abdomen', 'shoulder', 'elbow', 'wrist', 'hip', 'knee', 'ankle']

/** The drawn zone types that have an entry, in summary order, without repeats. */
export function mappedTypes(zones = []) {
  const types = new Set(zones.map((z) => z.type))
  return ORDER.filter((t) => types.has(t) && REFERRAL_MAP[t])
}

/** An area's organs, minus those tied to the other side of the body when
    only one side is drawn (gallbladder → right shoulder, spleen → left).
    The heart is kept on either side: it can refer to both arms. */
export function organsForType(t, zones = []) {
  const ids = zones.filter((z) => z.type === t).map((z) => z.id)
  const left = ids.some((id) => /L$/.test(id)), right = ids.some((id) => /R$/.test(id))
  return (REFERRAL_MAP[t] ? REFERRAL_MAP[t].organs : []).filter((o) => {
    if (/^Heart/.test(o)) return true
    if (left && !right && /\bright\b/i.test(o)) return false
    if (right && !left && /\bleft\b/i.test(o)) return false
    return true
  })
}

/** Organs that can refer to the drawn areas, without repeats (for the AI's
    medical-concern check). */
export function organsFor(zones = []) {
  const out = []
  for (const t of mappedTypes(zones)) for (const o of organsForType(t, zones)) if (!out.includes(o)) out.push(o)
  return out
}

/* The reference's screening sequence (section 8), for the summary. */
export const SCREENING_SEQUENCE = [
  'Red flags or systemic signs → medical referral for a visceral or serious cause.',
  'Pain not changed by movement, posture or palpation → suspect a visceral source.',
  'Neuro signs or positive neurodynamic tests → radicular pain / radiculopathy.',
  'A local source reproduces the familiar pain → local somatic; if not → somatic referred: test the spine, joints and trigger points sharing the segment.',
  'Widespread, disproportionate and hypersensitive → add a nociplastic component.',
]

/* Signs from the reference that point away from a musculoskeletal source. */
export const NOT_MSK_SIGNS = [
  'pain not changed by movement, posture or pressing, or night pain that does not ease with a change of position',
  'pain linked to eating, bowel, bladder, breathing, exertion or the menstrual cycle',
  'fever, sweats, unexplained weight loss, pallor, nausea, jaundice or blood in the urine',
  'a history of cancer, age over 50 with new pain, or recent trauma to the tummy or chest',
]
