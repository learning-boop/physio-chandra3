/* ─────────────────────────────────────────────────────────────────────────
   Referral patterns — reading a drawn LINE, not just the areas it touches.

   One continuous line from the neck down the arm, or from the low back down
   the leg, is how people draw pain that travels: symptoms referred from the
   spine (nerve-root / radicular, or somatic referred pain). Treating each
   area it crosses as its own problem — shoulder, elbow, wrist — asks the
   wrong questions and suggests a tennis elbow for what is really arm pain
   coming from the neck. So such a line is read as ONE problem whose likely
   source is the spine, with the arm or leg areas as where it is felt, and
   local problems further down the limb kept as things to rule out.

   Input: `lines` from Body3D — for each drawn line, its zone ids (e.g.
   'neck', 'shoulderL', 'elbowL', 'wristL') in the order it passes through
   them. Separate marks (a dot on the neck and another on the wrist) are
   not a line and are not read as referral.

   ⚠ FOR CLINICIAN REVIEW — the reach thresholds and the pre-set answers.
   ───────────────────────────────────────────────────────────────────────── */

const zoneType = (id) => id.replace(/[LR]$/, '').replace('lowerback', 'lowback')

/* Each limb, from the spine outwards. `region` is the spinal question set;
   `spine` the zones a line must start in; `sources` the areas whose
   questions are asked for it. An arm line from the neck OR the base of the
   neck asks both: a nerve root in the neck, or the first rib and thoracic
   outlet at the base of the neck (content/regions/ctj.md). */
const LIMBS = [
  { kind: 'arm', region: 'neck', spine: ['neck', 'ctj'], sources: ['neck', 'ctj'], chain: ['shoulder', 'elbow', 'wrist'] },
  { kind: 'leg', region: 'lowback', spine: ['lowback'], sources: ['lowback'], chain: ['hip', 'knee', 'ankle'] },
]

/* How far down the limb a line must reach to count as referral: past the
   shoulder (into the elbow / upper-arm band) or past the hip (into the thigh
   / knee band). A neck-to-shoulder line is ordinary neck-and-shoulder pain. */
const MIN_REACH = 1

/** The referral lines in a drawing, or [] when there are none. */
export function detectReferral(lines = []) {
  const out = []
  for (const ids of lines) {
    const types = ids.map(zoneType)
    for (const limb of LIMBS) {
      if (!limb.spine.some((s) => types.includes(s))) continue
      const reach = Math.max(-1, ...types.map((t) => limb.chain.indexOf(t)))
      if (reach < MIN_REACH) continue
      const limbZone = ids.find((id) => limb.chain.includes(zoneType(id)))
      const side = limbZone ? limbZone.slice(-1) : null
      out.push({
        kind: limb.kind, region: limb.region, sources: limb.sources, reach: limb.chain[reach],
        // Zone ids of the limb this line runs down — felt there, not sourced there.
        felt: ids.filter((id) => limb.chain.includes(zoneType(id))),
        side: side === 'L' ? 'left' : side === 'R' ? 'right' : null,
      })
    }
  }
  return out
}

/** Zones for the question flow: a referral line's limb areas are folded into
    its spinal source, so the neck (or low back) questions are asked — once —
    instead of each limb area's own. Other marks are left untouched.
    Every source area of the line is included even when it was not drawn
    (an arm line from the neck also asks about the base of the neck). */
export function flowZones(zones, referral) {
  if (!referral.length) return zones
  const felt = new Set(referral.flatMap((r) => r.felt))
  const out = zones.filter((z) => !felt.has(z.id))
  for (const t of referral.flatMap((r) => r.sources || [])) {
    if (!out.some((z) => z.type === t)) out.push({ id: t, type: t, label: t, implied: true })
  }
  return out
}

/** Answers the drawing already gives. A line reaching the hand has
    answered "pain goes down the arm past the elbow"; one reaching the
    foot, "pain below the knee". They are only defaults — the questions
    still show them selected, and the person can change them.
    Arrays, because every region question is multi-answer (symptomGuide.js);
    a bare string scores but is not shown as selected. */
export function drawnAnswers(referral) {
  const out = {}
  for (const r of referral) {
    if (r.kind === 'arm' && r.reach === 'wrist') out.N2 = ['pastelbow']
    if (r.kind === 'leg' && r.reach === 'ankle') out.L2 = ['belowknee']
  }
  return out
}

/* ── 2a vs 2b: nerve pain or referred ache? ──────────────────────────────
   "The Shape of Pain", Pattern 02: a line down a limb is three different
   problems. Nerve pain (2a) burns, shoots, or brings pins and needles,
   numbness or weakness. Somatic referred pain (2b) is a deep dull ache
   spreading from a joint, no nerve symptoms, rarely past the elbow or knee —
   still tissue pain, managed like a local problem. The spec names calling 2b
   "nerve pain" as the classic tool error.

   The drawing alone cannot tell them apart — the quality answer does. Real
   radicular pain does not follow textbook dermatomes, so this deliberately
   uses the looser rule the spec asks for, never a dermatome match. */
const asList = (v) => (Array.isArray(v) ? v : v === undefined ? [] : [v])
const NERVE_QUALITY = ['burning', 'tingling', 'Burning or tingling']

export function referralMechanism(r, answers = {}) {
  const quality = [...asList(answers.painQuality), ...asList(answers.q2)]
  const nerveWords = quality.some((q) => NERVE_QUALITY.includes(q))
  // The region questions' own nerve answers: neck N2 "pins and needles or
  // numbness in particular fingers"; low back L2 "pins & needles or numbness
  // into the foot".
  const nerveAnswer = asList(answers.N2).includes('fingers') || asList(answers.L2).includes('pins')
  const distal = r.reach === 'wrist' || r.reach === 'ankle'
  if (nerveWords || nerveAnswer) return 'radicular'
  if (!distal) return 'somatic'
  return 'unclear'
}

const REACH_WORDS = {
  elbow: 'the upper arm and elbow', wrist: 'the forearm and hand',
  knee: 'the thigh and knee', ankle: 'the lower leg and foot',
}

/* What the travelling pain is most consistent with, per mechanism. `unclear`
   is pain reaching the hand or foot with no nerve-type symptoms reported: both
   stay on the table rather than forcing a label. */
const MEANS = {
  arm: {
    radicular: 'That usually means a nerve in the neck is irritated — pain, and often tingling or numbness, is then felt down the arm. Your assessment will include checking how the nerve is working.',
    somatic: 'A deep ache spreading into the arm like this is usually referred from the joints and muscles of the neck rather than from a nerve. It is the same kind of pain as a local neck problem, and it is treated the same way.',
    unclear: 'That can come from an irritated nerve in the neck, or be a deep ache referred from the neck joints and muscles. The two are treated differently, which is one of the things your assessment sorts out.',
  },
  leg: {
    radicular: 'That usually means a nerve in the low back is irritated — often called sciatica — with pain, tingling or numbness felt down the leg. Your assessment will include checking how the nerve is working.',
    somatic: 'A deep ache spreading into the buttock and thigh like this is usually referred from the joints, disc and muscles of the back rather than from a nerve. It is the same kind of pain as a local back problem, and it is treated the same way.',
    unclear: 'That can come from an irritated nerve in the low back, or be a deep ache referred from the back joints and muscles. The two are treated differently, which is one of the things your assessment sorts out.',
  },
}
const TITLE_WORD = { radicular: 'nerve-type pain', somatic: 'referred ache', unclear: 'pain' }

/** Plain-language card for the result screen.
    `mechanism` comes from referralMechanism() — 'radicular' | 'somatic' | 'unclear'. */
export function referralSummary(r, mechanism = 'unclear') {
  const side = r.side ? `${r.side} ` : ''
  const limb = r.kind === 'arm' ? 'arm' : 'leg'
  const from = r.kind === 'arm' ? 'neck' : 'low back'
  const rest = r.kind === 'arm'
    ? 'the shoulder, elbow and hand'
    : 'the hip, knee and foot'
  return {
    title: `A ${TITLE_WORD[mechanism]} travelling from the ${from} into the ${side}${limb}`,
    text: `You drew one continuous line from your ${from} down to ${REACH_WORDS[r.reach]}. ${MEANS[limb][mechanism]} That is why the questions focused on your ${from} rather than treating ${rest} as separate problems.`,
    ruleOut: r.kind === 'arm'
      ? [
          'A nerve being irritated further down the arm — at the elbow (cubital tunnel) or the wrist (carpal tunnel)',
          'A shoulder problem referring pain down the upper arm',
          'Irritation of the nerves and vessels between the neck and shoulder (thoracic outlet)',
        ]
      : [
          'The sciatic nerve being irritated in the buttock (deep gluteal / piriformis)',
          'The hip joint referring pain into the thigh and knee',
          'A nerve being irritated at the ankle (tarsal tunnel)',
        ],
  }
}
