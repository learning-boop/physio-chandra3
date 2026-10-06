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
  { kind: 'arm', region: 'neck', spine: ['neck', 'ctj'], sources: ['neck', 'ctj'], chain: ['shoulder', 'upperarm', 'elbow', 'forearm', 'wrist', 'hand'] },
  // A leg line from the back of the pelvis (sacroiliac) asks both it and the
  // low back, where nerve-root leg pain comes from (content/regions/sij.md).
  { kind: 'leg', region: 'lowback', spine: ['lowback', 'sij'], sources: ['lowerback'], chain: ['hip', 'thigh', 'knee', 'lowerleg', 'ankle', 'foot'],
    // Chandra, 6 Oct 2026: a line from the BUTTOCK or the HIP down past the
    // knee is referred leg pain as well — sciatica and deep gluteal pain are
    // commonly drawn that way, with no back pain to mark. It has to reach the
    // lower leg: a buttock-to-thigh line stays a local hip or thigh problem.
    deepStart: ['hip'], deepReach: 'lowerleg' },
]

/* Areas a mark implies even when it is not drawn. Pain from the TL junction
   (T10–L2) is felt low — low back, top of the buttock, side of the hip, groin
   — so a low-back mark also asks the TL-junction questions
   (content/regions/tlj.md). Zone type → zone types. */
const IMPLIES = {
  lowerback: ['tlj'],
  // Pain in the outer upper arm is very often the shoulder's (the deltoid
  // patch): an upper-arm mark also asks the shoulder (content/regions/shoulder.md).
  upperarm: ['shoulder'],
}

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
      const fromSpine = limb.spine.some((s) => types.includes(s))
      const fromLimb = (limb.deepStart || []).some((s) => types.includes(s))
      if (!fromSpine && !fromLimb) continue
      const reach = Math.max(-1, ...types.map((t) => limb.chain.indexOf(t)))
      // From the spine: past the first chain area. From inside the limb: it
      // has to travel past the knee before it reads as referred pain.
      const need = fromSpine ? MIN_REACH : limb.chain.indexOf(limb.deepReach)
      if (reach < need) continue
      const limbZone = ids.find((id) => limb.chain.includes(zoneType(id)))
      const side = limbZone ? limbZone.slice(-1) : null
      out.push({
        kind: limb.kind, region: limb.region, reach: limb.chain[reach],
        // The limb's own sources plus any spinal area the line starts in.
        sources: [...new Set([...limb.sources, ...types.filter((t) => limb.spine.includes(t) && t !== 'lowback')])],
        // Zone ids of the limb this line runs down — felt there, not sourced there.
        felt: ids.filter((id) => limb.chain.includes(zoneType(id))),
        side: side === 'L' ? 'left' : side === 'R' ? 'right' : null,
      })
    }
  }
  return out
}

/* ── Read together, then asked ───────────────────────────────────────────
   Chandra, 6 Oct 2026: a person who lifts their finger halfway down the leg
   (to turn the body, or because it is two strokes) drew the same pain as one
   unbroken line, but detectReferral sees separate marks and the knee and
   ankle get their own questions. So all the strokes on one side are read
   together, and when they COULD be one travelling pain the person is asked
   (travelQuestion): one pain travelling down, separate pains, or not sure.
   The drawing suggests; the person decides. */

/** Stable key for one referral (limb and side), for the person's answer. */
export const referralKey = (r) => `${r.kind}-${r.side || 'mid'}`

/** Referral patterns the marks could make when every stroke on one side is
    read as one line — a superset of detectReferral(lines). */
export function possibleReferral(lines = []) {
  const all = lines.flat()
  const out = []
  for (const s of ['L', 'R']) {
    const ids = all.filter((id) => !/[LR]$/.test(id) || id.endsWith(s))
    for (const r of detectReferral([ids])) {
      if (out.some((o) => referralKey(o) === referralKey(r))) continue
      out.push({ ...r, felt: [...new Set(r.felt)] })
    }
  }
  return out
}

/** The question asked on the Draw page for one possible referral. */
export function travelQuestion(r) {
  const side = r.side ? `${r.side} ` : ''
  return r.kind === 'arm'
    ? `Does your pain start in your neck and travel down your ${side}arm?`
    : `Does your pain start in your low back or buttock and travel down your ${side}leg?`
}
export const TRAVEL_OPTIONS = [
  { id: 'one', label: 'Yes, it is one pain that travels' },
  { id: 'separate', label: 'No, they are separate pains' },
  { id: 'unsure', label: 'Not sure' },
]

/** The referrals the questions follow, given the person's answers
    (by referralKey: 'one' | 'separate' | 'unsure'). Unanswered ones default
    to 'one' when a single unbroken stroke drew the whole of it, otherwise
    wait for an answer: a back-to-knee line plus a separate ankle mark may be
    a sprained ankle. 'unsure' reads as referral but keeps the limb areas
    named on the card (`unsure: true`), so the physiotherapist checks them. */
export function travelAnswerOf(r, travel = {}, strokeRef = []) {
  const whole = strokeRef.some((s) => referralKey(s) === referralKey(r) && r.felt.every((id) => s.felt.includes(id)))
  return travel[referralKey(r)] ?? (whole ? 'one' : null)
}
export function confirmedReferral(possible = [], travel = {}, strokeRef = []) {
  return possible
    .map((r) => ({ r, a: travelAnswerOf(r, travel, strokeRef) }))
    .filter(({ a }) => a === 'one' || a === 'unsure')
    .map(({ r, a }) => (a === 'unsure' ? { ...r, unsure: true } : r))
}

/** How the clinician summary describes where a referral reading came from. */
export function referralBasis(r) {
  const from = r.kind === 'arm' ? 'neck' : 'low back'
  return r.unsure
    ? `marks from the ${from} down the limb; the patient was NOT SURE it is one pain - check the limb areas in their own right`
    : `the patient confirmed one pain travelling from the ${from}`
}

/** Zones for the question flow: a referral line's limb areas are folded into
    its spinal source, so the neck (or low back) questions are asked — once —
    instead of each limb area's own. Other marks are left untouched.
    Every source area of the line is included even when it was not drawn
    (an arm line from the neck also asks about the base of the neck), and so
    is every area a mark implies (IMPLIES). Added areas carry `implied`. */
/* Spinal neighbours of the low back. On a LEG referral line they are set
   aside: the questions come from the low back alone, and these are named on
   the result as areas to check at the assessment (Chandra, 6 Oct 2026 — three
   spinal areas each asking their own set is where the question count came
   from). They are still asked when nothing refers down the leg. */
const LEG_SET_ASIDE = ['sij', 'tlj', 'flank']

/** The drawn spinal areas a leg referral line sets aside, as zone types.
    The back of the pelvis is an exception: when the line STARTS there and no
    low back was marked, the sacroiliac joint is as likely a source as the
    back, so its questions are still asked. With a low-back mark as well, the
    back leads and the pelvis becomes a rule-out. */
export function setAsideAreas(zones = [], referral = []) {
  if (!referral.some((r) => r.kind === 'leg')) return []
  const drawnBack = zones.some((z) => z.type === 'lowerback')
  return [...new Set(zones
    .filter((z) => LEG_SET_ASIDE.includes(z.type) && !(z.type === 'sij' && !drawnBack))
    .map((z) => z.type))]
}

export function flowZones(zones, referral = []) {
  const felt = new Set(referral.flatMap((r) => r.felt))
  const aside = new Set(setAsideAreas(zones, referral))
  const out = zones.filter((z) => !felt.has(z.id) && !aside.has(z.type))
  const want = [...referral.flatMap((r) => r.sources || []), ...out.flatMap((z) => IMPLIES[z.type] || [])]
    .filter((t) => !(referral.some((r) => r.kind === 'leg') && LEG_SET_ASIDE.includes(t)))
  for (const t of want) {
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
    if (r.kind === 'arm' && (r.reach === 'wrist' || r.reach === 'hand')) out.N2 = ['pastelbow']
    if (r.kind === 'leg' && (r.reach === 'lowerleg' || r.reach === 'ankle' || r.reach === 'foot')) { out.L1 = ['belowknee']; out.P4 = ['belowknee'] }
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
  // The region questions' own nerve answers: neck N2 pins and needles or
  // numbness (in one part, or the whole hand) or burning, shooting arm pain;
  // low back L3 "pins and needles or numbness in the foot or toes".
  const nerveAnswer = asList(answers.N2).some((a) => ['fingers', 'wholehand', 'burning'].includes(a)) || asList(answers.L3).includes('pins')
  const distal = r.reach === 'wrist' || r.reach === 'hand' || r.reach === 'lowerleg' || r.reach === 'ankle' || r.reach === 'foot'
  if (nerveWords || nerveAnswer) return 'radicular'
  if (!distal) return 'somatic'
  return 'unclear'
}

const REACH_WORDS = {
  upperarm: 'the upper arm', elbow: 'the upper arm and elbow', forearm: 'the forearm', wrist: 'the forearm and wrist', hand: 'the forearm and hand',
  thigh: 'the thigh', knee: 'the thigh and knee', lowerleg: 'the lower leg', foot: 'the lower leg and foot', ankle: 'the lower leg and foot',
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
/* Areas a leg line set aside (./setAsideAreas) are named on the card, so a
   drawn area is never silently dropped from the questions. The sacroiliac
   joint is already in the leg list below. */
const SET_ASIDE_LINE = {
  tlj: 'The junction where the mid back meets the low back, which refers pain into the buttock, the side of the hip and the groin',
  flank: 'The flank and the lower ribs, which can refer pain into the back and buttock',
}

const FELT_WORD = {
  shoulder: 'shoulder', upperarm: 'upper arm', elbow: 'elbow', forearm: 'forearm', wrist: 'wrist', hand: 'hand',
  hip: 'hip', thigh: 'thigh', knee: 'knee', lowerleg: 'lower leg', ankle: 'ankle', foot: 'foot',
}
/* When the person was not sure the marks were one travelling pain, the limb
   areas they marked are named as things to check in their own right. */
function unsureLine(r) {
  const words = [...new Set((r.felt || []).map((id) => FELT_WORD[zoneType(id)]).filter(Boolean))]
  if (!words.length) return null
  const list = words.length > 1 ? `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}` : words[0]
  return `Your ${list} themselves: you were not sure whether this is one pain, so your physiotherapist will check them as well`
}

export function referralSummary(r, mechanism = 'unclear', setAside = []) {
  const side = r.side ? `${r.side} ` : ''
  const limb = r.kind === 'arm' ? 'arm' : 'leg'
  const from = r.kind === 'arm' ? 'neck' : 'low back'
  const rest = r.kind === 'arm'
    ? 'the shoulder, elbow and hand'
    : 'the hip, knee and foot'
  return {
    title: `A ${TITLE_WORD[mechanism]} travelling from the ${from} into the ${side}${limb}`,
    text: `${r.unsure ? `Your marks run from your ${from} down to ${REACH_WORDS[r.reach]}` : `You told us your pain travels from your ${from} down to ${REACH_WORDS[r.reach]}`}. ${MEANS[limb][mechanism]} That is why the questions focused on your ${from} rather than treating ${rest} as separate problems.`,
    // Somatic sources that refer along the same limb (Referred Pain Clinical
    // Reference, section 5; ./referralMap.js). Organs are never listed to a
    // visitor: those are screened by the safety check.
    ruleOut: [...(r.unsure ? [unsureLine(r)].filter(Boolean) : []), ...(r.kind === 'arm'
      ? [
          'A nerve being irritated further down the arm — at the elbow (cubital tunnel) or the wrist (carpal tunnel)',
          'The shoulder joint or rotator cuff, which can refer pain down the upper arm',
          'Muscles at the side of the neck and around the shoulder blade, which can refer pain down the arm to the hand',
          'Irritation of the nerves and vessels between the neck and shoulder (thoracic outlet)',
        ]
      : [
          'The sciatic nerve being irritated in the buttock (deep gluteal / piriformis)',
          'The sacroiliac joint or the hip joint, both of which can refer pain into the thigh and sometimes below the knee',
          'A buttock muscle (gluteus minimus) whose referred pain can look like sciatica without pins and needles',
          'A nerve being irritated at the ankle (tarsal tunnel)',
          ...setAside.map((t) => SET_ASIDE_LINE[t]).filter(Boolean),
        ])],
  }
}
