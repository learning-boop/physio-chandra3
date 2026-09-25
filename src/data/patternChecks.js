/* ─────────────────────────────────────────────────────────────────────────
   Pattern-triggered safety checks — visceral referral and systemic patterns.

   From "The Shape of Pain" (content/pain-patterns/_SPEC-the-shape-of-pain.md),
   Pattern 02c (visceral referred: "routes to care, never physio") and the four
   extra patterns that change the route (bilateral & symmetrical, glove &
   stocking, whole limb + colour/swelling).

   Where the drawing MATCHES an organ or systemic map, the matching question is
   added to the final safety check. The person answers it themselves and the
   tier they trigger decides the route — the drawing alone never claims an
   organ cause, and the AI is not involved. Laterality matters: right shoulder
   blade reads differently from left arm (spec, "Side matters for the organ
   maps").

   The body map cannot see the front/back surface or the shoulder TIP yet, so
   these are deliberately drawn wider than the textbook maps and lean on the
   person's own answer about associated symptoms.

   ⚠ FOR CLINICIAN REVIEW — wording, tiers and which drawings trigger each.
   ───────────────────────────────────────────────────────────────────────── */

const typesOf = (zones) => new Set(zones.map((z) => z.type))
const has = (zones, ...types) => zones.some((z) => types.includes(z.type))
/** Marked on a particular SURFACE — zones drawn before surfaces were recorded
    have no `face`, so those are treated as front (the default view). */
const onFace = (zones, face, ...types) =>
  zones.some((z) => types.includes(z.type) && (z.face || 'front') === face)
const onSide = (zones, side, ...types) =>
  zones.some((z) => types.includes(z.type) && z.id.endsWith(side))
/** Same area marked on BOTH sides (e.g. both wrists). */
const bothSides = (zones, type) =>
  zones.some((z) => z.type === type && z.id.endsWith('L')) &&
  zones.some((z) => z.type === type && z.id.endsWith('R'))
/** Areas along one arm or leg on one side (whole-limb spread). */
const limbSpread = (zones, side) => {
  const arm = ['shoulder', 'elbow', 'wrist'].filter((t) => onSide(zones, side, t)).length
  const leg = ['hip', 'knee', 'ankle'].filter((t) => onSide(zones, side, t)).length
  return Math.max(arm, leg)
}

const WHY = {
  cardiac: {
    title: 'This needs emergency assessment',
    text: 'Pain in the chest, left arm or jaw that comes with sweating, nausea or breathlessness can come from the heart rather than from muscles or joints. It is treated completely differently and cannot wait.',
  },
  organ: {
    title: 'An internal cause should be ruled out first',
    text: 'Pain that does not change with movement or position, or that comes with nausea, fever or feeling unwell, can be referred from an internal organ rather than arising in the muscles or joints. A physician needs to look at that first.',
  },
  urinary: {
    title: 'A kidney or urinary cause should be ruled out first',
    text: 'Pain spreading from the flank toward the groin with fever or changes in urination can come from the kidney or urinary tract, which needs medical treatment rather than physiotherapy.',
  },
  systemic: {
    title: 'A medical cause should be checked first',
    text: 'The same joints painful and stiff on both sides, especially with prolonged morning stiffness or swelling, can point to an inflammatory or systemic condition. A physician can check for that, and physiotherapy fits alongside it.',
  },
  neuropathy: {
    title: 'A nerve or metabolic cause should be checked',
    text: 'Numbness or burning in both hands or both feet, in a glove or sock distribution, suggests the longest nerves are involved rather than a local joint problem. A physician should look for the underlying cause.',
  },
  dvt: {
    title: 'A clot in the calf should be excluded first',
    text: 'Pain at the back of the knee or in the calf with swelling, warmth or redness can be a deep vein thrombosis. That needs a medical check the same day, because physiotherapy treatment of the leg would not be safe until it is excluded.',
  },
  limb: {
    title: 'A whole painful limb with skin changes needs review',
    text: 'Pain across a whole limb with changes in skin colour, temperature, sweating or swelling is examined before physiotherapy loading begins, so the cause can be established.',
  },
}

/* Each entry: shown only when the drawing matches, in this order.
   tier 'emergency' → 911 screen; 'urgent' → see a physician first. */
const PATTERNS = [
  {
    id: 'pc-cardiac', tier: 'emergency', why: WHY.cardiac,
    text: 'Pain or tightness in the chest, left arm or jaw — especially with sweating, nausea, or shortness of breath',
    // Spec's cardiac map: central chest, left arm, jaw. Deliberately NOT every
    // neck drawing — that would put a heart-attack question in front of
    // everyone with a stiff neck.
    when: (z) => has(z, 'chest') || onSide(z, 'L', 'shoulder', 'elbow', 'wrist'),
  },
  {
    // Spec: back of the knee / calf — "swollen calf + red/warm → screen DVT".
    id: 'pc-dvt', tier: 'urgent', why: WHY.dvt,
    text: 'Swelling, warmth or redness in the calf or the back of the knee',
    when: (z) => onFace(z, 'back', 'knee', 'ankle'),
  },
  {
    id: 'pc-visceral', tier: 'urgent', why: WHY.organ,
    text: 'Pain that does not change at all with movement or position, or that comes with nausea, fever, or feeling unwell',
    // Gallbladder/liver (right shoulder blade), diaphragm (shoulder), stomach
    // and pancreas (mid back) maps. The flank → groin map has its own item.
    when: (z) => has(z, 'chest', 'abdomen', 'upperback', 'tlj') || onSide(z, 'R', 'shoulder'),
  },
  {
    id: 'pc-urinary', tier: 'urgent', why: WHY.urinary,
    text: 'Pain spreading from your side or flank toward the groin, or fever, blood in the urine, or burning when passing urine',
    when: (z) => has(z, 'lowerback', 'tlj', 'flank', 'sij', 'abdomen', 'hip'),
  },
  {
    id: 'pc-inflammatory', tier: 'urgent', why: WHY.systemic,
    text: 'The same joints painful, stiff or swollen on BOTH sides, with morning stiffness lasting more than 30 minutes',
    when: (z, a) => ['wrist', 'knee', 'ankle', 'elbow', 'shoulder'].some((t) => bothSides(z, t))
      && [].concat(a.pattern24 || []).includes('amLong'),
  },
  {
    id: 'pc-polyneuropathy', tier: 'urgent', why: WHY.neuropathy,
    text: 'Numbness, tingling or burning in BOTH hands or BOTH feet, like wearing gloves or socks',
    when: (z) => bothSides(z, 'wrist') || bothSides(z, 'ankle'),
  },
  {
    id: 'pc-limb', tier: 'urgent', why: WHY.limb,
    text: 'Changes in the skin colour, temperature, sweating or swelling of the painful arm or leg',
    when: (z) => limbSpread(z, 'L') >= 3 || limbSpread(z, 'R') >= 3,
  },
]

/** Safety-check questions this drawing calls for, most serious first.
    `zones` = the drawn areas, `answers` = answers so far. Capped, so the
    safety screen stays short enough to read. */
export function patternChecks(zones = [], answers = {}, max = 3) {
  if (!zones.length) return []
  const out = []
  for (const p of PATTERNS) {
    if (out.length >= max) break
    try { if (p.when(zones, answers)) out.push({ id: p.id, text: p.text, tier: p.tier, why: p.why }) } catch { /* skip */ }
  }
  return out
}

/** The five numbers the spec asks for, from the drawing alone.
    Used for the pattern read-out; the questions still decide the route. */
export function drawingShape(zones = [], lines = []) {
  const types = typesOf(zones)
  const sides = new Set(zones.map((z) => (z.id.endsWith('L') ? 'L' : z.id.endsWith('R') ? 'R' : 'M')))
  const linear = lines.some((ids) => new Set(ids.map((i) => i.replace(/[LR]$/, ''))).size >= 2)
  return {
    regions: types.size,
    marks: zones.length,
    crossesMidline: (sides.has('L') && sides.has('R')) || sides.has('M'),
    linear,
    widespread: types.size >= 4,
  }
}
