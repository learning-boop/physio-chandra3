/* ─────────────────────────────────────────────────────────────────────────
   Pain type — which pain mechanism the answers are most consistent with.

     nociceptive  tissue-related: localised, proportionate, predictable
                  mechanical aggravating and easing factors, ache or sharp
                  with movement, no nerve-type descriptors
     neuropathic  nerve-related: burning / shooting / electric pain, pins and
                  needles or numbness, spreading along a limb
     nociplastic  sensitised: persistent (> 3 months), widespread / not
                  anatomical, non-mechanical and disproportionate, linked to
                  sleep, mood and beliefs

   Built on the clinical indicators of Smart et al. (2010–2012,
   mechanism-based classification of musculoskeletal pain) and the IASP
   clinical criteria for nociplastic pain (Kosek et al. 2021) — notably that
   nociplastic pain requires pain for more than 3 months, so it is never
   suggested for newer pain.

   Rules only (never the AI). Educational wording, not a diagnosis.
   ⚠ FOR CLINICIAN REVIEW — the points and thresholds below.
   ───────────────────────────────────────────────────────────────────────── */

/** Pain-quality question, asked on the pain-behaviour screen. */
export const PAIN_QUALITY = {
  id: 'painQuality', multi: true, text: 'How does the pain feel? (choose any that fit)',
  options: [
    { id: 'ache', label: 'Dull ache or stiffness' },
    { id: 'sharp', label: 'Sharp with certain movements' },
    { id: 'burning', label: 'Burning, shooting or electric' },
    { id: 'tingling', label: 'Pins and needles or numbness' },
    { id: 'touch', label: 'Sensitive to light touch, clothing or cold' },
  ],
}

/* The generic question set (areas without their own questions) asks pain
   character as q2 with its own labels; map those onto the same qualities. */
const GENERIC_Q2 = {
  'Sharp or stabbing': ['sharp'],
  'Dull ache': ['ache'],
  'Burning or tingling': ['burning', 'tingling'],
  'Throbbing': ['ache'],
}

/* Zone types along one limb, from the spine outwards. */
const LIMB_CHAINS = [
  ['neck', 'shoulder', 'upperarm', 'elbow', 'forearm', 'wrist', 'hand'],
  ['lowerback', 'hip', 'thigh', 'knee', 'ankle'],
  ['sij', 'thigh', 'knee', 'ankle'],
]
const SPINE = ['neck', 'lowerback']
const AXIAL_CHAIN = ['neck', 'ctj', 'upperback', 'tlj', 'lowerback', 'sij', 'coccyx']

const PERSISTENT = ['o3m', 'years']

const as = (v) => (Array.isArray(v) ? v : v === undefined ? [] : [v])

function qualities(answers) {
  const q = new Set(as(answers.painQuality))
  for (const label of as(answers.q2)) (GENERIC_Q2[label] || []).forEach((x) => q.add(x))
  return q
}

/** What the drawing shows. */
function drawing(zones) {
  const types = [...new Set(zones.map((z) => z.type))]
  // Pain drawn from the spine down to the far half of that limb.
  const spreadsDownLimb = LIMB_CHAINS.some((chain) =>
    types.includes(chain[0]) && types.some((t) => chain.indexOf(t) >= 2))
  const onOneChain = [...LIMB_CHAINS, AXIAL_CHAIN].some((c) => types.every((t) => c.includes(t)))
  // Same area marked on both sides, in two or more areas.
  const bilateral = types.filter((t) => {
    const ids = zones.filter((z) => z.type === t).map((z) => z.id)
    return ids.some((id) => /L$/.test(id)) && ids.some((id) => /R$/.test(id))
  }).length >= 2
  const widespread = (types.length >= 3 && !onOneChain) || bilateral
  const localised = types.length <= 1 || (types.length === 2 && types.some((t) => SPINE.includes(t)) && !spreadsDownLimb && onOneChain)
  return { spreadsDownLimb, widespread, localised }
}

export const PAIN_TYPES = {
  nociceptive: {
    title: 'Tissue-related pain',
    term: 'nociceptive',
    text: 'Your answers fit the most common type of muscle and joint pain: pain coming from irritated tissues such as a muscle, joint, tendon or ligament. It tends to stay in one area and to change in a predictable way with movement and position, and it usually responds well to a graded, active approach.',
  },
  /* Tissue pain divides again (Smart et al.; CPA Orthopaedic Division
     subjective framework): MECHANICAL, where load and position deform the
     tissue and there is a clear stimulus–response relationship, and
     INFLAMMATORY, where chemical irritation dominates — pain after a period
     of relative rest, prolonged morning stiffness easing with movement. It
     changes the advice: mechanical pain responds to changing the load,
     inflammatory pain to keeping gently moving and, where it persists,
     a medical opinion. */
  neuropathic: {
    title: 'Nerve-related pain',
    term: 'neuropathic',
    text: 'Burning, shooting or electric pain, or pins and needles — especially when it spreads along an arm or leg — suggests that a nerve may be irritated. Nerve-related symptoms are common and often settle well, and your assessment will include checking how the nerve is working (sensation, strength and reflexes).',
  },
  nociplastic: {
    title: 'Sensitised pain',
    term: 'nociplastic',
    text: 'When pain has lasted a long time, the nervous system can become more sensitive and keep the "alarm" turned up even as tissues settle. This is real pain, not imagined, and it tends to respond best to a combined approach: understanding the pain, graded activity, and support with sleep and stress.',
  },
}

export const NOCICEPTIVE_SUBTYPES = {
  mechanical: {
    label: 'mostly mechanical',
    text: 'It changes in a predictable way with movement, position and load — which is what makes adjusting how you load the area, then building it back up, the usual way forward.',
  },
  inflammatory: {
    label: 'with an inflammatory pattern',
    text: 'It is worse after rest and eases once you get moving, with morning stiffness that takes a while to wear off. Keeping gently moving tends to help more than resting, and a stiffness pattern like this is worth mentioning to your physician as well as at your assessment.',
  },
}

/** Which kind of tissue pain, when the answers say enough to tell.
    Returns 'mechanical' | 'inflammatory' | null. */
export function nociceptiveSubtype(answers = {}) {
  const pattern = as(answers.pattern24)
  const ease = [...as(answers.easing), ...as(answers.q4)]
  let inflammatory = 0
  let mechanical = 0
  if (pattern.includes('amLong')) inflammatory += 2
  if (pattern.includes('restWorse')) inflammatory += 2
  if (pattern.includes('nightWake')) inflammatory += 1
  if (pattern.includes('pm')) mechanical += 2
  if (pattern.includes('none')) mechanical += 2
  if (pattern.includes('amShort')) mechanical += 1
  if (ease.length && !ease.includes('none')) mechanical += 1
  if (ease.includes('Rest') || ease.includes('Rest and elevation') || ease.includes('Lying down or resting')) mechanical += 1
  if (inflammatory >= 2 && inflammatory > mechanical) return 'inflammatory'
  if (mechanical >= 2 && mechanical > inflammatory) return 'mechanical'
  return null
}

/** Pain mechanism the answers are most consistent with.
    Returns null when there is too little to go on, otherwise
    { primary, secondary|null, subtype, reasons: { [type]: string[] } } */
export function classifyPainMechanism({ zones = [], answers = {}, behaviour = {}, psych = {}, referral = null }) {
  const q = qualities(answers)
  const d = drawing(zones)
  // A continuous spine-to-limb LINE (../data/referral.js) is better evidence
  // of spreading pain than separate marks that happen to sit on one limb —
  // but only counts toward NERVE pain when nerve-type symptoms are reported.
  // A deep ache travelling into the limb with no burning, shooting, pins and
  // needles or numbness is somatic referred pain: still tissue-related, and
  // treated like a local problem ("The Shape of Pain", Pattern 02b).
  const referralLine = referral ? referral.length > 0 : false
  // Easing: the behaviour screen's question, or the generic set's q4.
  const ease = [...as(answers.easing), ...as(answers.q4)]
  const pattern = as(answers.pattern24)
  const settle = answers.sinSettle
  const persistent = PERSISTENT.includes(answers.duration)
  const psychCount = ['yfFear', 'yfOutlook', 'yfMood', 'yfSleep', 'yfRoles'].filter((id) => answers[id] === 'agree').length
  const nerveWords = q.has('burning') || q.has('tingling')

  const score = { nociceptive: 0, neuropathic: 0, nociplastic: 0 }
  const reasons = { nociceptive: [], neuropathic: [], nociplastic: [] }
  const add = (type, pts, why) => { score[type] += pts; if (why) reasons[type].push(why) }

  if (referral) {
    d.spreadsDownLimb = referralLine && nerveWords
    if (referralLine && nerveWords) d.localised = false
  }

  // Tissue-related
  if (referralLine && !nerveWords) {
    add('nociceptive', 2, 'it is a deep ache spreading from the spine, with no nerve-type symptoms')
  }
  if (d.localised) add('nociceptive', 2, 'the pain is in one area')
  if (ease.length && !ease.includes('none')) add('nociceptive', 2, 'particular positions or activities ease it')
  if (pattern.includes('none') || pattern.includes('amShort') || pattern.includes('pm')) add('nociceptive', 1, 'it changes with what you do')
  if ((q.has('ache') || q.has('sharp')) && !nerveWords) add('nociceptive', 1, 'it feels achy or sharp with movement')
  if (settle === 'minutes' || settle === 'hours') add('nociceptive', 1, null)

  // Nerve-related
  if (q.has('burning')) add('neuropathic', 3, 'it feels burning, shooting or electric')
  if (q.has('tingling')) add('neuropathic', 3, 'there is pins and needles or numbness')
  if (d.spreadsDownLimb) add('neuropathic', 2, 'it spreads from the spine along the limb')
  if (q.has('touch')) add('neuropathic', 1, null)

  // Sensitised — only ever for pain lasting more than 3 months.
  if (persistent) {
    add('nociplastic', 2, 'it has lasted more than 3 months')
    if (d.widespread) add('nociplastic', 3, 'it is spread across several areas')
    if (ease.includes('none') || settle === 'constant') add('nociplastic', 2, 'it does not follow a clear pattern of what eases it')
    if (behaviour.irritability === 'severe' && answers.sinSeverity === 'severe') add('nociplastic', 1, 'it is severe and slow to settle')
    if (psychCount >= 3) add('nociplastic', 2, 'it is affecting sleep, mood or confidence')
    else if (psychCount === 2) add('nociplastic', 1, null)
    if (q.has('touch')) add('nociplastic', 1, 'the area is sensitive to light touch')
    if (answers.yfSleep === 'agree') add('nociplastic', 1, null)
  }

  // Minimum points to name a type. Nerve-related also needs a nerve-type
  // descriptor — pain spreading along a limb alone can be referred pain.
  const qualifies = {
    nociceptive: score.nociceptive >= 3,
    neuropathic: score.neuropathic >= 3 && nerveWords,
    nociplastic: score.nociplastic >= 6,
  }
  const ranked = Object.keys(score).filter((t) => qualifies[t]).sort((a, b) => score[b] - score[a])
  if (!ranked.length) return null
  // Tissue pain divides again into mechanical and inflammatory.
  const subtype = ranked.includes('nociceptive') ? nociceptiveSubtype(answers) : null
  return { primary: ranked[0], secondary: ranked[1] || null, subtype, reasons }
}
