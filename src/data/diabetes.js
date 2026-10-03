/* ─────────────────────────────────────────────────────────────────────────
   Diabetes: a context, not a diagnosis.

   From "DiabetesMellitus.docx" (condition intake) and "PhysioChandra Diabetes
   RiskModule.docx" (Conditions/General conditions), both v0.1 drafts of
   3 Oct 2026, pending Chandra's sign-off. Clinician reference:
   content/reference/diabetes.md.

   The guide never diagnoses diabetes and never shows a risk score. It comes
   in four ways:
     1. One question on "A little about you": "Have you been told you have
        diabetes or high blood sugar?" (DM_STATUS, answers.dm).
     2. With diabetes, its red flags go to the FRONT of the safety pages
        (DM_RED_FLAGS): a hot swollen foot, a foot wound, a black toe,
        ketoacidosis, "silent" heart symptoms, amyotrophy, muscle infarction.
        Without it, numb or burning feet on both sides are doctor-first ("a
        blood test sorts this out"), with no booking until then.
     3. When a condition diabetes makes more likely qualifies (DM_LINKED) or
        both feet burn or tingle, up to six short details on "Before your
        results" (DM_QUESTIONS). Their points give an internal burden tier
        (diabetesTier), which lifts those conditions in the ORDER only
        (diabetesBonus; never past the 40% rule) and picks the wording.
     4. A panel on the results (diabetesPanel): what diabetes means for this
        problem, the prognosis line for the tier, safety notes for the flags,
        and, without diabetes, a gentle "worth asking your doctor for a
        blood-sugar test" when the pattern is a known first sign.

   Diabetes answers are kept as answers.dm* so Chandra's summary and the
   patient's PDF carry them, but they are left out of the anonymous copy
   (PainAssessment.jsx, anonPayload) and are not asked of the AI overview.
   ───────────────────────────────────────────────────────────────────────── */

/* ── 1. The context question ── */
export const DM_STATUS = {
  id: 'dm', text: 'Have you been told you have diabetes or high blood sugar?',
  options: [
    { id: 'yes', label: 'Yes, diabetes (any type)' },
    { id: 'pre', label: 'Prediabetes, or diabetes during a past pregnancy' },
    { id: 'no', label: 'No' },
    { id: 'ns', label: 'Not sure' },
  ],
}

const has = (zones, ...types) => zones.some((z) => types.includes(z.type))
const bothSides = (zones, ...types) =>
  zones.some((z) => types.includes(z.type) && z.id.endsWith('L')) &&
  zones.some((z) => types.includes(z.type) && z.id.endsWith('R'))
const quality = (a) => [].concat(a.painQuality || [])

/** Both feet or both lower legs, burning or tingling: the nerve pattern. */
export function feetNervePattern(zones = [], answers = {}) {
  return bothSides(zones, 'foot', 'ankle', 'lowerleg') && quality(answers).some((q) => q === 'tingling' || q === 'burning')
}
const belowKnee = (zones) => has(zones, 'lowerleg', 'ankle', 'foot')

/* ── 2. Red flags shown first when diabetes is known (intake §6, module §6) ──
   `covers`: region flag ids or groups that already ask the same thing, so
   the question is not asked twice on one page. */
export const DM_RED_FLAGS = [
  { id: 'dm-dka', tier: 'emergency', call911: true,
    text: 'Vomiting or stomach pain with deep, fast breathing, fruity-smelling breath, extreme thirst, or drowsiness or confusion',
    why: { title: 'Possible high-blood-sugar emergency',
      text: 'With diabetes, these together can mean diabetic ketoacidosis, a high-blood-sugar emergency that needs hospital treatment straight away.' } },
  { id: 'dm-foot-black', tier: 'emergency', covers: ['ft-diabeticinfection'],
    text: 'A toe or part of your foot that has turned black, dusky or cold, or a foot wound with spreading redness, pus, a bad smell or a fever',
    why: { title: 'This can threaten the foot',
      text: 'With diabetes, a darkening toe or a spreading foot infection needs hospital care today. Keep weight off the foot.' } },
  { id: 'dm-cardiac', tier: 'emergency', call911: true, covers: ['pc-cardiac', 'cardiac'],
    text: 'Pressure or pain in the chest, jaw, arm or upper back, breathlessness, or unusual exhaustion when you exert yourself (with diabetes, heart symptoms can be mild or unusual)',
    why: { title: 'This needs emergency assessment',
      text: 'With diabetes, the heart can give milder or unusual warning signs than the classic crushing chest pain. These need checking straight away.' } },
  { id: 'dm-foot-hot', tier: 'urgent', sameDay: true, group: 'charcot',
    text: 'One foot that is red, warm and swollen, even if it does not hurt much and you do not remember hurting it; or a blister, cut or sore on your foot that is not healing, or that you did not feel',
    why: { title: 'Please see a doctor today and keep weight off that foot',
      text: 'With diabetes, a hot, swollen foot can be an infection or a Charcot foot, where the bones of the foot soften; keeping weight off it early protects the foot. A wound that is not healing needs a doctor or diabetes foot clinic within a day or two; please do not walk on it barefoot. Go to the emergency department if you also have a fever or feel unwell.' } },
  { id: 'dm-thigh', tier: 'urgent', sameDay: true,
    when: (z) => has(z, 'thigh', 'knee', 'lowerleg'),
    text: 'Sudden, severe pain with firm swelling in one thigh or calf, with no injury',
    why: { title: 'Please see a doctor today',
      text: 'With diabetes, sudden severe pain and firm swelling in a thigh or calf can be a clot or, rarely, a blocked blood supply to the muscle. Both need checking the same day.' } },
  { id: 'dm-amyotrophy', tier: 'urgent', noBooking: true,
    when: (z) => has(z, 'hip', 'thigh', 'lowerback', 'sij', 'knee'),
    text: 'Severe pain in one hip, buttock or thigh that came on over days, followed by a leg that is getting weaker, with weight loss you cannot explain',
    why: { title: 'Please see your family doctor in the next few days',
      text: 'With diabetes, severe one-sided thigh pain followed by weakness and weight loss can come from the nerves to the leg (diabetic amyotrophy). It needs a doctor\'s neurological check first; physiotherapy is a big part of recovery once it has been assessed.' } },
]

/** The diabetes red flags for this drawing, minus any the regional or
    pattern checks on the page already ask (`asked`: their flags). */
export function diabetesRedFlags(zones = [], answers = {}, asked = []) {
  if (answers.dm !== 'yes') return []
  const ids = new Set(asked.map((f) => f.id))
  const groups = new Set(asked.flatMap((f) => [].concat(f.group || [])))
  return DM_RED_FLAGS.filter((f) => (!f.when || f.when(zones)) &&
    !(f.covers || []).some((c) => ids.has(c) || [...ids].some((i) => i.includes(c))) &&
    !(f.group && groups.has(f.group)))
}

/* Numb or burning feet (or hands) on both sides WITHOUT known diabetes:
   doctor first, this week, with no booking until then (intake §4 route
   rules). With diabetes, those questions are left out: the results panel
   takes over, with the foot-care advice. */
export const NERVE_WHY = {
  title: 'Please see your family doctor this week',
  text: 'Numbness, tingling or burning in both feet (or both hands), like wearing socks or gloves, comes from the longest nerves rather than from a joint. It can be linked with blood-sugar problems and other treatable causes, such as low vitamin B12 or thyroid changes, and a simple blood test sorts this out. Please see your family doctor this week, and mention it if you have also noticed unusual thirst, passing urine more often, weight loss you cannot explain or blurred vision. Physiotherapy can help once the cause is known; you are welcome to book after that visit.',
}
export const isNerveFlag = (f) => f.id === 'pc-polyneuropathy' || [].concat(f.group || []).includes('neuropathy')

/* ── 3. The details (module §3), one panel on "Before your results" ──
   `pts` = burden points (never shown); `flag` = safety-note flags. */
export const DM_QUESTIONS = [
  { id: 'dmType', text: 'Which type?', status: ['yes'], options: [
    { id: 't1', label: 'Type 1', pts: 1 },
    { id: 't2', label: 'Type 2', pts: 0 },
    { id: 'other', label: 'Another type (after a pancreas problem, a transplant or steroids, or type 5)', pts: 1 },
    { id: 'ns', label: 'Not sure', pts: 0 },
  ] },
  { id: 'dmYears', text: 'How long have you had it?', status: ['yes'], options: [
    { id: 'u5y', label: 'Less than 5 years', pts: 0 },
    { id: '5to10', label: '5 to 10 years', pts: 1 },
    { id: 'o10', label: 'More than 10 years', pts: 2 },
    { id: 'o20', label: 'More than 20 years', pts: 3 },
  ] },
  { id: 'dmControl', text: 'At your last check-up, were your sugars where your doctor wanted them?', status: ['yes'], options: [
    { id: 'target', label: 'Yes, or mostly in target', pts: 0 },
    { id: 'above', label: 'A bit above target', pts: 1 },
    { id: 'well', label: 'Well above target, or I have not had a check-up in over a year', pts: 2 },
    { id: 'ns', label: 'Not sure', pts: 1 },
  ] },
  { id: 'dmTreat', text: 'How is it treated?', status: ['yes'], options: [
    { id: 'diet', label: 'Diet and exercise', pts: 0 },
    { id: 'tablets', label: 'Tablets, such as metformin', pts: 0 },
    { id: 'insulin', label: 'Insulin, or tablets that can cause low sugars (such as gliclazide or glyburide)', pts: 1, flag: 'HYPO' },
    { id: 'ns', label: 'Not sure', pts: 0 },
  ] },
  { id: 'dmComp', multi: true, text: 'Has diabetes affected any of these? Tick all that apply.', status: ['yes', 'pre'], options: [
    { id: 'eyes', label: 'Eyes', pts: 1, flag: 'EYE' },
    { id: 'kidneys', label: 'Kidneys', pts: 1, flag: 'KIDNEY' },
    { id: 'nerves', label: 'Nerves: numb or burning feet', pts: 1, flag: 'FOOT' },
    { id: 'foot', label: 'A foot ulcer, a Charcot foot or an amputation', pts: 2, flag: 'FOOT' },
    { id: 'heart', label: 'Heart or circulation', pts: 1, flag: 'CARDIAC' },
    { id: 'none', label: 'None of these', pts: 0 },
  ] },
  // Feet only (the drawing is below the knee) and not already set by dmComp.
  { id: 'dmFeel', text: 'Can you feel a light touch on your toes, and do you feel steady in the dark or on uneven ground?', status: ['yes'], feet: true, options: [
    { id: 'reduced', label: 'The feeling is reduced, or I feel unsteady', pts: 1, flag: 'FOOT' },
    { id: 'fine', label: 'Both are fine', pts: 0 },
  ] },
]

const picked = (q, a) => [].concat(a[q.id] === undefined ? [] : a[q.id]).map((id) => q.options.find((o) => o.id === id)).filter(Boolean)

/** Safety-note flags from the details: { HYPO, FOOT, EYE, KIDNEY, CARDIAC }. */
export function diabetesFlags(answers = {}) {
  const out = {}
  for (const q of DM_QUESTIONS) for (const o of picked(q, answers)) if (o.flag) out[o.flag] = true
  return out
}

/** The internal burden tier: 'low' | 'moderate' | 'high', or null without
    diabetes. Never shown. Prediabetes is always low (module §4). */
export function diabetesTier(answers = {}) {
  if (answers.dm === 'pre') return 'low'
  if (answers.dm !== 'yes') return null
  let pts = 0
  for (const q of DM_QUESTIONS) for (const o of picked(q, answers)) pts += o.pts || 0
  if (answers.dmYears === 'o20' || [].concat(answers.dmComp || []).includes('foot')) return 'high'
  return pts >= 4 ? 'high' : pts >= 2 ? 'moderate' : 'low'
}

/* ── Conditions diabetes makes more likely (module §2) ──
   Keyed "<region>:<condition id>". mod = rank points by tier; bilateral =
   extra points when both sides are drawn; panel = results wording; screen =
   suggest a blood-sugar test without known diabetes (module §7): true, or
   'bilateral' (only when both sides are drawn). Charcot foot, amyotrophy and
   muscle infarction are not scored: they are red flags (DM_RED_FLAGS). */
const STRONG = (low, moderate, high) => ({ low, moderate, high })
export const DM_LINKED = {
  'shoulder:frozen': { assoc: 'strong', mod: STRONG(1, 2, 3), bilateral: ['shoulder'], panel: 'shoulder', screen: true },
  'shoulder:rc': { assoc: 'moderate', mod: STRONG(0, 1, 1), panel: 'shoulder' },
  'shoulder:calcific': { assoc: 'moderate', mod: STRONG(0, 1, 1), panel: 'shoulder' },
  'hand:trigger': { assoc: 'strong', mod: STRONG(1, 2, 2), bilateral: ['hand'], panel: 'hand', screen: 'bilateral' },
  'hand:median': { assoc: 'strong', mod: STRONG(1, 2, 2), bilateral: ['hand', 'wrist'], panel: 'hand', screen: 'bilateral' },
  'wrist:median': { assoc: 'strong', mod: STRONG(1, 2, 2), bilateral: ['hand', 'wrist'], panel: 'hand', screen: 'bilateral' },
  'hand:dupuytren': { assoc: 'moderate', mod: STRONG(1, 1, 2), panel: 'hand' },
  'leg:achilles': { assoc: 'moderate', mod: STRONG(0, 1, 1), panel: 'feet' },
  'ankle:insertional': { assoc: 'moderate', mod: STRONG(0, 1, 1), panel: 'feet' },
  'foot:pf': { assoc: 'moderate', mod: STRONG(0, 1, 1), panel: 'feet' },
  'hip:gtps': { assoc: 'moderate', mod: STRONG(0, 1, 1), panel: 'general' },
  'upperback:stiffness': { assoc: 'moderate', mod: STRONG(0, 1, 1), panel: 'general' },
  'tlj:stiffness': { assoc: 'moderate', mod: STRONG(0, 1, 1), panel: 'general' },
  'knee:oa': { assoc: 'moderate', mod: STRONG(0, 1, 1), panel: 'general' },
  'hand:handoa': { assoc: 'moderate', mod: STRONG(0, 1, 1), panel: 'general' },
  'hand:thumboa': { assoc: 'moderate', mod: STRONG(0, 1, 1), panel: 'general' },
  'wrist:thumboa': { assoc: 'moderate', mod: STRONG(0, 1, 1), panel: 'general' },
}
export const linkOf = (x) => (x && x.c ? DM_LINKED[`${x.rk}:${x.c.id}`] : null) || null

/** Should the details be asked? Diabetes or prediabetes, and either a linked
    condition qualifies (`wide`: rankAcross with room for more than the two
    shown, so one a modifier could lift is counted) or the feet pattern. */
export function diabetesBranch(answers = {}, zones = [], wide = []) {
  if (answers.dm !== 'yes' && answers.dm !== 'pre') return false
  return wide.some((x) => linkOf(x)) || feetNervePattern(zones, answers)
}

/** The details to ask, given the branch fired. */
export function diabetesQuestions(answers = {}, zones = []) {
  return DM_QUESTIONS.filter((q) => q.status.includes(answers.dm) &&
    (!q.feet || (belowKnee(zones) && ![].concat(answers.dmComp || []).some((c) => c === 'nerves' || c === 'foot'))))
}

/** Rank points for a condition (module §4, "Condition re-scoring"): ordering
    only. The 40% rule still decides whether a condition is shown at all. */
export function diabetesBonus(answers = {}, zones = []) {
  const tier = diabetesTier(answers)
  if (!tier) return null
  return (rk, cid) => {
    const l = DM_LINKED[`${rk}:${cid}`]
    if (!l) return 0
    return l.mod[tier] + (l.bilateral && bothSides(zones, ...l.bilateral) ? 1 : 0)
  }
}

/* ── 4. The results panel (module §4, §5, §7; intake §4 overlay) ── */
const PANELS = {
  shoulder: {
    title: 'Diabetes and a stiff, painful shoulder',
    text: 'People with diabetes get a stiff, painful shoulder more often: when sugars have run high for years, the capsule around the joint becomes thicker and less stretchy. It is not damage you have caused, and the shoulder does not "wear out"; it is tissue that has become stiffer and more sensitive, and it responds to steady, patient movement. With diabetes the stiff phase can last longer and sometimes affects both shoulders, so the plan starts early, protects the movement you have, and builds from there.',
  },
  hand: {
    title: 'Diabetes and the hands',
    text: 'Diabetes can make the tendon sheaths and the tissue under the skin of the hand thicker, which is why catching fingers, numb hands at night and stiff, "waxy" fingers are more common, often in both hands and more than one finger. These are treatable: splints, gliding exercises, hand mobility work and, when needed, an injection or small release that your doctor can arrange. Results are good; they are sometimes a little slower with diabetes, which is a reason to start sooner.',
  },
  feet: {
    title: 'Diabetes and the feet',
    text: 'Long or high sugar levels can make the long nerves to the feet more sensitive and less able to feel: burning or tingling at night, and numbness. Nerves stay adaptable: balance, strength and walking programmes have been shown to improve symptoms, steadiness and sugar control. The one thing to respect is numbness: feet that cannot feel need a daily look and good shoes, and any wound, or a hot, red, swollen foot, needs your doctor the same day.',
  },
  general: {
    title: 'Diabetes, joints and the spine',
    text: 'Type 2 diabetes and the things that often travel with it, such as weight and blood pressure, are linked with stiffer spines, tendons and more joint pain. Movement is the treatment for both: the same walking and strength plan that helps your joints also helps your sugars. If you have had a fall and new back pain since, let us check it properly first, because a very stiff spine can crack with a surprisingly small knock.',
  },
}
const PROGNOSIS = {
  low: 'Diabetes slightly raises the chance of this problem; recovery is usually similar to anyone else\'s.',
  moderate: 'Diabetes, especially over several years or when sugars run high, makes this more common, and it can take a little longer to settle. Steady sugar control is part of the recovery plan.',
  high: 'With long-standing diabetes this problem is common and tends to be slower and more stubborn, which is a reason to start early, not a reason to worry. Treatment is planned around your diabetes, with your diabetes team kept in the loop.',
}
const COORDINATE = 'It is worth mentioning this to your family doctor or diabetes team at your next visit: joint and nerve problems like this often go with how long and how high sugars have been running, and the same steps help both.'
const NERVE_TEAM = 'Burning or numb feet are worth mentioning to your diabetes doctor or nurse at your next visit, and a foot-care specialist can check your feet once a year or more often.'
const NOTES = {
  HYPO: 'Because of your insulin or sugar-lowering tablets, check your sugar before and after new activity for the first few sessions, and keep fast-acting sugar with you.',
  FOOT: 'Check both feet every day (a mirror or someone else can help) for cuts, blisters, redness or swelling; wear well-fitting shoes and seamless socks, and do not walk barefoot outdoors. Balance practice holding a counter is a good place to start.',
  EYE: 'If you have been told you have advanced eye changes, avoid very heavy straining or head-down positions until your eye doctor says they are fine.',
  KIDNEY: 'Drink to thirst during exercise, and tell us about any swelling or breathlessness.',
  CARDIAC: 'Please check with your doctor before anything much harder than brisk walking.',
}
const STEROID = 'If your doctor suggests a steroid injection, it can push sugars up for several days; worth planning with your diabetes team.'
const GENERAL_ACTIVE = {
  title: 'Diabetes and staying active',
  text: 'Movement is part of the treatment for diabetes as well as for pain, and building up gradually is safe. Check your feet every day for cuts, blisters or redness, and wear well-fitting shoes. If you use insulin or tablets that can cause low sugars, check your sugar before and after new activity for the first few sessions, and keep fast-acting sugar with you.',
}
const PRE = {
  title: 'Prediabetes and staying active',
  text: 'Prediabetes, or diabetes during a past pregnancy, raises the chance of type 2 diabetes later, and regular activity helps lower that chance. Keep up the blood-sugar checks your doctor suggests.',
}
const SCREEN = {
  title: 'Worth asking your doctor about',
  text: 'Problems like this are sometimes the first sign that blood sugar has been running high without anyone noticing. A simple blood test (HbA1c) from your family doctor settles it, and Diabetes Canada suggests a check every three years from age 40 anyway. It does not change today\'s plan, but it is worth asking.',
}

/** The results panel, or null. `shown` = the conditions on the results page,
    in order (each { rk, c }). Returns { title, text, notes: [] }. */
export function diabetesPanel(answers = {}, zones = [], shown = []) {
  const dm = answers.dm
  const lead = shown.find((x) => linkOf(x))
  const feet = feetNervePattern(zones, answers)
  if (dm === 'yes') {
    const tier = diabetesTier(answers)
    const flags = diabetesFlags(answers)
    const variant = lead ? linkOf(lead).panel : feet ? 'feet' : null
    if (!variant) {
      return { title: GENERAL_ACTIVE.title, text: GENERAL_ACTIVE.text, notes: [] }
    }
    const notes = []
    if (lead) notes.push(PROGNOSIS[tier])
    if (tier === 'moderate' || tier === 'high') notes.push(COORDINATE)
    if (feet && !lead) notes.push(NERVE_TEAM)
    if (lead && lead.rk === 'shoulder') notes.push(STEROID)
    // The feet panel already carries the foot-care line.
    if (flags.FOOT || (variant === 'feet')) notes.push(NOTES.FOOT)
    for (const f of ['HYPO', 'EYE', 'KIDNEY', 'CARDIAC']) if (flags[f]) notes.push(NOTES[f])
    if (!flags.HYPO && answers.dmTreat === undefined) notes.push('If you use insulin or tablets that can cause low sugars, check your sugar before and after new activity for the first few sessions, and keep fast-acting sugar with you.')
    return { title: PANELS[variant].title, text: PANELS[variant].text, notes: [...new Set(notes)] }
  }
  if (dm === 'pre') return lead || feet ? { title: PRE.title, text: PRE.text, notes: [] } : null
  // No known diabetes: a first-sign pattern earns the gentle blood-test line.
  if (dm === 'no' || dm === 'ns') {
    const first = shown[0]
    const firstLink = linkOf(first)
    const bothHands = bothSides(zones, 'hand', 'wrist')
    const sign = (firstLink && firstLink.screen === true && ['30-49', '50-64'].includes(answers.age)) ||
      shown.some((x) => { const l = linkOf(x); return l && l.screen === 'bilateral' && bothHands })
    return sign ? { title: SCREEN.title, text: SCREEN.text, notes: [] } : null
  }
  return null
}

/** Lines for Chandra's summary. */
export function diabetesSummary(answers = {}, zones = [], shown = []) {
  const s = DM_STATUS.options.find((o) => o.id === answers.dm)
  if (!s) return []
  const out = [`Diabetes or high blood sugar: ${s.label}`]
  for (const q of DM_QUESTIONS) {
    const p = picked(q, answers)
    if (p.length) out.push(`${q.text} ${p.map((o) => o.label).join('; ')}`)
  }
  const tier = diabetesTier(answers)
  if (tier && answers.dm === 'yes') {
    const flags = Object.keys(diabetesFlags(answers))
    out.push(`Burden tier (internal, module §4): ${tier.toUpperCase()}${flags.length ? `; flags ${flags.join(', ')}` : ''}`)
    const bonus = diabetesBonus(answers, zones)
    const lifted = shown.filter((x) => bonus && bonus(x.rk, x.c.id) > 0).map((x) => `${x.c.name} +${bonus(x.rk, x.c.id)}`)
    if (lifted.length) out.push(`Ranking lifted for: ${lifted.join('; ')}`)
  }
  if (answers.dm === 'no' || answers.dm === 'ns') {
    const p = diabetesPanel(answers, zones, shown)
    if (p) out.push('Shown the "worth asking your doctor for a blood-sugar test (HbA1c)" line (a known first-sign pattern).')
  }
  return out
}
