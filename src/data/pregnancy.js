/* ─────────────────────────────────────────────────────────────────────────
   Pregnancy and the year after: a context, not a disease.

   From "Pregnancy.docx" (Conditions/General conditions, v0.1, 3 Oct 2026),
   built with the document's recommended answers to its open items.
   Clinician reference: content/reference/pregnancy.md.

   Pregnancy is the one hormonal entry that is a physiotherapy route by
   default, so it is a global overlay like diabetes, not a region condition:
     1. One question on "A little about you", for a birth sex of female or
        "intersex, or prefer not to say", aged 16 to 49 (PREG_STATUS,
        answers.preg; after a birth, how the baby was born, answers.pregBirth).
     2. While pregnant or in the year after, the obstetric and postpartum red
        flags go to the FRONT of the safety pages, in every area, minus any
        the page already asks (pregnancyRedFlags).
     3. The pregnancy-typical conditions are lifted in the ORDER only
        (pregnancyBonus; never past the 40% rule), and the pelvic girdle
        record opens whatever the "How did it start?" answer was
        (symptomGuide.js, eligibleNow).
     4. While pregnant, one optional question on "Before your results": what
        the maternity team has advised (PREG_LIMITS, answers.pregLimit, the
        SOGC/CSEP 2019 contraindications). Any tick removes the exercise
        dose from the results and says "confirm with your maternity team".
     5. A results panel (pregnancyPanel), also in the PDF.

   Patient copy says the body adapts and loads change, never that ligaments
   are loose or the pelvis unstable or out of place (document §2 correction:
   relaxin levels do not differ in women with and without pelvic girdle pain).

   The answers are kept as answers.preg* so Chandra's summary and the
   patient's PDF carry them, but they are left out of the anonymous copy
   (PainAssessment.jsx, anonPayload) and are not sent to the AI overview.
   ───────────────────────────────────────────────────────────────────────── */

/* ── 1. The context question ── */
export const PREG_STATUS = {
  id: 'preg', text: 'Are you pregnant, or have you given birth in the last 12 months?',
  options: [
    { id: 'p1', label: 'Pregnant, up to 12 weeks' },
    { id: 'p2', label: 'Pregnant, 13 to 27 weeks' },
    { id: 'p3', label: 'Pregnant, 28 weeks or more' },
    { id: 'pp6', label: 'Gave birth in the last 6 weeks' },
    { id: 'pp12', label: 'Gave birth 6 weeks to 12 months ago' },
    { id: 'no', label: 'No' },
  ],
}
export const PREG_BIRTH = {
  id: 'pregBirth', text: 'How was your baby born? (optional)',
  options: [
    { id: 'vaginal', label: 'Vaginal birth' },
    { id: 'assisted', label: 'Vaginal birth with forceps, a suction cup (ventouse) or a large tear' },
    { id: 'caesarean', label: 'C-section (caesarean)' },
  ],
}

const PREGNANT = ['p1', 'p2', 'p3']
const POSTPARTUM = ['pp6', 'pp12']
// The clot risk is raised in pregnancy and for six weeks after a birth.
const CLOT = [...PREGNANT, 'pp6']
export const isPregnant = (a = {}) => PREGNANT.includes(a.preg)
export const isPostpartum = (a = {}) => POSTPARTUM.includes(a.preg)
export const pregnancyOn = (a = {}) => isPregnant(a) || isPostpartum(a)

/** Asked of a birth sex of female or "intersex, or prefer not to say",
    aged 16 to 49 (Chandra, 4 Oct 2026: not 5 to 15, not 50 and over; the
    age codes '18-29' and '30-49' are the "16 to 29" and "30 to 49" bands). */
export const PREG_AGES = ['18-29', '30-49']
export const pregnancyAsked = (who = {}) =>
  (who.sex === 'female' || who.sex === 'other') && PREG_AGES.includes(who.age)

const has = (zones, ...types) => zones.some((z) => types.includes(z.type))
const BACK = ['lowerback', 'sij', 'coccyx', 'tlj', 'flank', 'upperback', 'chest']
const PELVIS = ['lowerback', 'sij', 'coccyx', 'hip', 'thigh', 'tlj', 'flank']

/* ── 2. Red flags shown first while the overlay is on (document §6) ──
   `stages`: the PREG_STATUS answers it is asked for. `covers`: region flag
   ids or groups that already ask the same thing on the page. */
export const PREG_RED_FLAGS = [
  { id: 'pg-bleed', tier: 'emergency', call911: true, stages: PREGNANT, covers: ['prf-pregnancy-bleed'],
    text: 'Heavy bleeding from the vagina, or any bleeding with feeling faint or severe tummy pain',
    why: { title: 'Please call 911 now',
      text: 'Heavy bleeding in pregnancy, or bleeding with faintness or severe pain, needs emergency care straight away. Call 911, then your maternity unit if you can.' } },
  { id: 'pg-abdo', tier: 'emergency', call911: true, stages: PREGNANT,
    text: 'Severe, constant pain in your tummy, or a bump that feels hard and very tender',
    why: { title: 'Please call 911 now',
      text: 'Constant severe tummy pain or a hard, tender bump in pregnancy can mean a problem with the placenta, which needs emergency care straight away.' } },
  // 6 Oct 2026, general conditions cross-check (approved by Chandra), S1: bleeding before about 20 weeks belongs at the emergency
  // department (or early pregnancy assessment), not labour and delivery.
  { id: 'pg-earlybleed', tier: 'emergency', stages: ['p1'], covers: ['prf-pregnancy'],
    text: 'Bleeding from the vagina, or pain low down on one side of your tummy',
    why: { title: 'Please go to an emergency department now',
      text: 'Bleeding or one-sided tummy pain in the first weeks of pregnancy needs checking at the hospital today, to make sure the pregnancy is in the right place and to look after you.' } },
  { id: 'pg-labour', tier: 'emergency', goTo: 'labour', stages: ['p2', 'p3'], covers: ['prf-pregnancy'],
    text: 'Bleeding from the vagina; or, before 37 weeks, your waters breaking or leaking, or regular painful tightenings',
    why: { title: 'Please go to your labour and delivery unit now',
      text: 'Bleeding in pregnancy, waters breaking early or regular tightenings before 37 weeks need checking at the hospital today. Call your maternity unit on the way if you can.' } },
  { id: 'pg-preeclampsia', tier: 'emergency', goTo: 'labour', stages: ['p2', 'p3', 'pp6'],
    text: 'After 20 weeks of pregnancy, or in the weeks since the birth: a severe headache, flashing lights or blurred vision, pain under the right ribs or high in the middle of your tummy, nausea or vomiting, new breathlessness, sudden swelling of your face or hands, or feeling very unwell',
    why: { title: 'Please go to your labour and delivery unit now',
      text: 'These can be signs of pre-eclampsia, a blood-pressure problem of pregnancy that can also start in the weeks after the birth. It needs checking at the hospital today. Call 911 for a fit, severe chest pain or trouble breathing.' } },
  { id: 'pg-movements', tier: 'emergency', goTo: 'labour', stages: ['p2', 'p3'],
    text: 'If you are past about 24 weeks: your baby is moving less than usual, or not at all',
    why: { title: 'Please call your maternity unit and go in now',
      text: 'Fewer movements than usual need checking the same day. Please do not wait until tomorrow.' } },
  { id: 'pg-pph', tier: 'emergency', call911: true, stages: ['pp6'],
    text: 'Since the birth: heavy bleeding (soaking a pad in an hour or less), passing large clots, or feeling faint',
    why: { title: 'Please call 911 now',
      text: 'Heavy bleeding after a birth needs emergency care straight away.' } },
  { id: 'pg-mind', tier: 'emergency', stages: POSTPARTUM,
    text: 'Since the birth: thoughts of harming yourself or your baby, very low mood, confusion, or seeing or hearing things that are not there',
    why: { title: 'Please get help today',
      text: 'After a birth these can come on quickly, and they are treatable. Please go to an emergency department today, with someone else. You can also call or text 9-8-8 at any time. Call 911 if you or your baby are in danger now.' } },
  // A region that asks about the lung clot (group "lungclot" or "legclotlung")
  // or the leg clot itself keeps its own wording; the other half is asked here.
  { id: 'pg-pe', tier: 'emergency', call911: true, stages: CLOT, covers: ['lungclot', 'legclotlung'],
    text: 'Sudden breathlessness, chest pain, or coughing up blood',
    why: { title: 'Please call 911 now',
      text: 'Pregnancy and the six weeks after a birth raise the chance of a blood clot several times. Sudden breathlessness or chest pain can be a clot in the lung, which needs emergency care.' } },
  { id: 'pg-cauda', tier: 'emergency', when: (z) => has(z, ...PELVIS, 'lowerleg', 'foot'), covers: ['cauda', 'saddle'],
    text: 'Numbness around your genitals or back passage, new difficulty passing urine or controlling your bowels, or weakness in both legs',
    why: { title: 'Please go to an emergency department now',
      text: 'These can mean pressure on the nerves at the base of the spine (cauda equina), which needs emergency assessment today, in pregnancy as at any other time.' } },
  { id: 'pg-dvt', tier: 'urgent', sameDay: true, stages: CLOT, covers: ['legclot', 'pc-dvt'],
    text: 'One calf or thigh that is swollen, warm or painful',
    why: { title: 'Please see a doctor today',
      text: 'Pregnancy and the six weeks after a birth raise the chance of a blood clot in the leg. One swollen, warm, painful calf or thigh needs checking the same day; call 911 if you also become breathless or have chest pain.' } },
  { id: 'pg-postinfect', tier: 'urgent', sameDay: true, stages: ['pp6'],
    text: 'Since the birth: a fever, discharge that smells bad, or a wound or stitches that are red, hot, more painful or opening',
    why: { title: 'Please see your doctor or maternity unit today',
      text: 'After a birth these can be signs of an infection of the womb or a wound, which needs treatment the same day.' } },
  { id: 'pg-infection', tier: 'urgent', sameDay: true, when: (z) => has(z, ...PELVIS), covers: ['kidney', 'pc-urinary'],
    text: 'Back or pelvic pain with a fever, burning when you pass urine, or pain in your side below the ribs',
    why: { title: 'Please see your doctor or maternity unit today',
      text: 'Urine and kidney infections are more common in pregnancy and after a birth and can feel like back pain. They need treatment the same day.' } },
  { id: 'pg-heart', tier: 'urgent', sameDay: true, stages: ['p3', ...POSTPARTUM],
    text: 'Fainting, a racing or pounding heartbeat, or getting breathless with light activity or when lying flat, late in pregnancy or in the months since the birth',
    why: { title: 'Please see a doctor today',
      text: 'These are usually from the normal demands of pregnancy, but rarely the heart muscle is under strain at this time, and a heart check the same day is the safe step. Call 911 if they are severe or come with chest pain.' } },
  { id: 'pg-fracture', tier: 'urgent', noBooking: true, stages: ['p3', ...POSTPARTUM], when: (z) => has(z, ...BACK),
    text: 'Sudden, severe back pain, with losing height or pain on sitting up, late in pregnancy or while breastfeeding',
    why: { title: 'Please see a doctor in the next day or two',
      text: 'Rarely, bones thin in late pregnancy or while breastfeeding and a bone in the spine can crack with little force. It needs a doctor and an X-ray or scan before physiotherapy; you are welcome to book after that.' } },
  { id: 'pg-hip', tier: 'urgent', stages: ['p3', 'pp6'], when: (z) => has(z, 'hip', 'thigh'),
    text: 'Groin or hip pain that is getting worse with walking, a limp, or pain at night, late in pregnancy or soon after the birth',
    why: { title: 'Please see your doctor',
      text: 'Rarely, the bone of the hip thins for a while in late pregnancy (transient osteoporosis of the hip). It needs a doctor and a scan, and protecting the hip from full weight for a time. It recovers over months.' } },
  { id: 'pg-symphysis', tier: 'urgent', stages: ['pp6'], when: (z) => has(z, 'hip', 'sij', 'lowerback', 'thigh'),
    text: 'Since the birth: severe pain at the front of the pelvis, so you can hardly walk or stand on one leg, sometimes after a click you could hear',
    why: { title: 'Please see your doctor or maternity team',
      text: 'After a difficult birth the joint at the front of the pelvis can separate more than usual. It needs a doctor and an X-ray; physiotherapy, a support belt and sometimes crutches help it recover.' } },
]

/** The pregnancy red flags for this stage and drawing, minus any the regional
    or pattern checks on the page already ask (`asked`: their flags). */
export function pregnancyRedFlags(zones = [], answers = {}, asked = []) {
  if (!pregnancyOn(answers)) return []
  const ids = new Set(asked.map((f) => f.id))
  const groups = new Set(asked.flatMap((f) => [].concat(f.group || [])))
  return PREG_RED_FLAGS.filter((f) => (!f.stages || f.stages.includes(answers.preg)) && (!f.when || f.when(zones)) &&
    !(f.covers || []).some((c) => ids.has(c) || groups.has(c)))
}

/* ── 3. The lift (document §4: pregnancy-typical conditions) ──
   Points added to the ORDER only, by stage. */
const LIFT = {
  'sij:pgp': { p1: 2, p2: 2, p3: 2, pp6: 2, pp12: 2 },
  'hip:pubic': { p1: 2, p2: 2, p3: 2, pp6: 2, pp12: 1 },
  'wrist:median': { p1: 1, p2: 2, p3: 2, pp6: 1 },
  'hand:median': { p1: 1, p2: 2, p3: 2, pp6: 1 },
  'wrist:dq': { p2: 1, p3: 2, pp6: 2, pp12: 2 },
  'hip:meralgia': { p2: 1, p3: 1 },
  'thigh:meralgia': { p2: 1, p3: 1 },
  'lowback:nslbp': { p1: 1, p2: 1, p3: 1, pp6: 1, pp12: 1 },
  'coccyx:pelvicfloor': { pp6: 1, pp12: 1 },
  'upperback:rib': { p2: 1, p3: 1 },
}
export function pregnancyBonus(answers = {}) {
  if (!pregnancyOn(answers)) return null
  return (rk, cid) => (LIFT[`${rk}:${cid}`] || {})[answers.preg] || 0
}

/* ── 4. What the maternity team has advised (document Q2; SOGC/CSEP 2019,
   ACOG 804). Asked on "Before your results" while pregnant. */
export const PREG_LIMITS = {
  id: 'pregLimit', multi: true,
  text: 'Has your doctor or midwife told you to limit activity, or do you have any of these? Tick all that apply.',
  options: [
    { id: 'told', label: 'I have been told to limit activity or exercise' },
    { id: 'bleed', label: 'Bleeding, waters broken, or contractions before 37 weeks, in this pregnancy' },
    { id: 'placenta', label: 'A low-lying placenta (placenta praevia) after 28 weeks' },
    { id: 'bp', label: 'High blood pressure or pre-eclampsia in this pregnancy' },
    { id: 'cervix', label: 'A cervical stitch, or a "short cervix"' },
    { id: 'twins', label: 'Triplets or more, or twins after 28 weeks' },
    { id: 'preterm', label: 'A previous preterm birth, or repeated miscarriages' },
    { id: 'weight', label: 'An eating disorder, or being very underweight' },
    { id: 'heart', label: 'A heart or lung condition' },
    { id: 'growth', label: 'A baby growing slowly (growth restriction)' },
    { id: 'other', label: 'Severe anaemia, or diabetes or thyroid disease that is not well controlled' },
    { id: 'none', label: 'None of these' },
  ],
}
export const exerciseLimited = (a = {}) => [].concat(a.pregLimit || []).some((x) => x !== 'none')

/* ── 5. The results panel ── */
const ids = (shown) => new Set(shown.map((x) => `${x.rk}:${x.c.id}`))

/** The panel, or null. `shown` = the conditions on the results. */
export function pregnancyPanel(answers = {}, shown = []) {
  if (!pregnancyOn(answers)) return null
  const pregnant = isPregnant(answers)
  const s = ids(shown)
  const pelvic = ['sij:pgp', 'hip:pubic', 'sij:sij', 'lowback:nslbp'].some((k) => s.has(k))
  const notes = []
  if (pelvic) notes.push('For pain at the back or front of the pelvis: keep your knees together when you turn in bed or get out of a car, sit down to put on trousers and shoes, take stairs one step at a time on a bad day, and walk shorter distances more often. A pelvic support belt can help for standing and walking.')
  if (s.has('wrist:median') || s.has('hand:median')) notes.push('For numb or tingling hands at night: a simple splint that keeps the wrist straight at night usually helps, and this usually settles within weeks of the birth.')
  if (s.has('wrist:dq')) notes.push('For pain on the thumb side of the wrist: lift your baby with a "scoop" (palms up, under the bottom and back) rather than under the arms with your thumbs, and a thumb splint can rest it. If it lasts, your doctor can talk to you about an injection.')
  if (pregnant) {
    notes.push(exerciseLimited(answers)
      ? 'Because of what you ticked, please confirm with your maternity team before starting or increasing exercise. Physiotherapy can still help now, with pain-relief strategies, comfortable positions and pelvic-floor exercises, working alongside your maternity team.'
      : 'Unless your maternity team has advised otherwise, staying active is recommended and safe for you and your baby: about 150 minutes a week of moderate activity (you can talk, but not sing) over at least 3 days, with some strength work, such as walking, swimming, pool exercise or a stationary bike. Stop and contact your maternity team if you have bleeding, fluid leaking, regular painful tightenings, chest pain, breathlessness or dizziness that does not settle with rest, a headache, or a painful swollen calf.')
    notes.push(answers.preg === 'p1'
      ? 'In the first weeks, nausea and tiredness are common: shorter, more frequent activity is fine.'
      : 'Later in pregnancy, if lying flat on your back makes you light-headed, exercise lying on your side or propped up instead; avoid contact sports, activities with a risk of falling, and very hot conditions.')
  } else {
    notes.push(`A staged return to activity: pelvic-floor exercises and gentle walking from the early days, as comfortable; strength work from around six weeks, or when you have been cleared${answers.pregBirth === 'caesarean' ? ' (a little longer after a caesarean, letting the scar settle first)' : ''}; running and jumping usually from about twelve weeks, after a pelvic-health check.`)
    notes.push('Leaking urine, a feeling of heaviness or a bulge in the vagina, or pain with sex is common after a birth and very treatable: a pelvic-health physiotherapist can help. A gap down the middle of the tummy narrows most in the first two months, and any gap that remains is common and responds to the right exercises.')
  }
  notes.push('Practise pelvic-floor squeezes daily: a gentle lift and hold, then let go fully.')
  if (pregnant) notes.push('Sleep on your side with a pillow between your knees.')
  notes.push(pregnant
    ? 'Contact your maternity unit, or 911, first for bleeding, fluid leaking, a severe headache or change in vision, fewer movements from your baby, a swollen painful calf, or sudden breathlessness.'
    : 'Contact your maternity unit or doctor, or 911, first for heavy bleeding, a fever, a severe headache or change in vision, a swollen painful calf, sudden breathlessness, or very low mood or thoughts of harming yourself or your baby (you can also call or text 9-8-8).')
  return pregnant
    ? {
      title: 'Pregnancy and this problem',
      text: 'Pregnancy is not an illness, but it changes how your body carries load: your weight and balance shift forward, the tummy muscles stretch, hormones make the tissues a little more pliable, and sleep changes. Around two in three people get some back or pelvic pain in pregnancy, and numb hands, rib pain and leg cramps are common too. These are hard-working tissues adapting to a new job, not damaged ones. Your pelvis is strong: pain here is about how the load is being shared, not about joints being loose or out of place. Back and pelvic pain in pregnancy respond well to physiotherapy, and most settle in the first three months after the birth.',
      notes,
    }
    : {
      title: 'The year after the birth and this problem',
      text: 'After a birth, your body keeps adapting for months: the tummy and pelvic-floor muscles recover, sleep is short, and lifting, feeding and carrying a baby load the back, wrists and thumbs in new ways. Most back and pelvic pain from pregnancy settles within the first three months, but about one in four people still have some at a year, so a plan helps more than waiting. These are tissues recovering and adapting, not damaged ones, and they respond well to a gradual, guided return to strength and activity.',
      notes,
    }
}

/** Lines for Chandra's summary. */
export function pregnancySummary(answers = {}) {
  const s = PREG_STATUS.options.find((o) => o.id === answers.preg)
  if (!s) return []
  const out = [`Pregnant or given birth in the last 12 months: ${s.label}`]
  const b = PREG_BIRTH.options.find((o) => o.id === answers.pregBirth)
  if (b) out.push(`Birth: ${b.label}`)
  const lim = [].concat(answers.pregLimit || [])
  if (lim.length) out.push(`Activity limits or contraindications: ${lim.map((x) => PREG_LIMITS.options.find((o) => o.id === x)?.label || x).join('; ')}`)
  else if (isPregnant(answers)) out.push('Activity limits or contraindications: not answered (clear with the PARmed-X for Pregnancy before exercise)')
  return out
}
