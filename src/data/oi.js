/* ─────────────────────────────────────────────────────────────────────────
   Osteogenesis imperfecta (brittle bone disease): a diagnosed context.

   From "Osteogenesis Imperfecta.docx" (Conditions/General conditions, v0.1,
   4 Oct 2026), built with the document's recommended answers to its open
   items. Clinician reference: content/reference/osteogenesis-imperfecta.md.

   Almost everyone with OI who reaches the site already knows they have it,
   so this is not a diagnostic screen (open item 1). It is an overlay, like
   steroids and pregnancy:
     1. One OPTIONAL tick on "A little about you" (answers.oi = 'yes'): the
        condition is too rare to make every visitor answer a question.
     2. With it ticked, the OI red flags go to the FRONT of the safety pages,
        in every area, minus any the page already asks (oiRedFlags). A new
        pain after a small knock, lift or sneeze is a fracture until an
        X-ray says otherwise: doctor today, booking after the X-ray.
     3. Optional details on "Before your results" (OI_DETAILS: type, the main
        problem, fractures and falls this year, specialist care).
     4. A results panel (oiPanel), also in the PDF: the main problem leads,
        the OI-safe exercise rules and the handling statement always show.

   Patient copy says "less tough", not "fragile"; "brittle" appears only as
   the common name (document §4, language audit).

   The answers are kept as answers.oi* so Chandra's summary and the patient's
   PDF carry them, but they are left out of the anonymous copy (PainAssessment
   .jsx, anonPayload) and are not sent to the AI overview.
   ───────────────────────────────────────────────────────────────────────── */

/* ── 1. The context tick ── */
export const OI_STATUS = {
  id: 'oi', text: 'Do you have brittle bone disease (osteogenesis imperfecta, OI)?',
  yes: 'Yes, I have brittle bone disease (OI)',
}
export const oiOn = (a = {}) => a.oi === 'yes'

/* ── 2. Red flags shown first while the overlay is on (document §6) ──
   `covers`: region flag ids or groups that already ask the same thing on the
   page. Not built as questions: the hot joint with fever (the general
   "fever…" check asks it), stopping denosumab and worsening hearing (panel
   notes instead, open item 5). */
export const OI_RED_FLAGS = [
  { id: 'oi-break', tier: 'emergency',
    text: 'After a fall or knock: an arm or leg that looks bent or out of shape, that you cannot put any weight on or use, or that has gone numb, pale or cold',
    why: { title: 'Please go to an emergency department now',
      text: 'With osteogenesis imperfecta, this is very likely a broken bone and needs an X-ray and treatment today. Keep the limb as still as you can. Call 911 if it is cold, pale or numb, or if you cannot get there safely.' } },
  { id: 'oi-head', tier: 'emergency',
    text: 'A knock to the head or neck in the last few days, even a small one, that a doctor has not checked',
    why: { title: 'Please go to an emergency department today',
      text: 'With osteogenesis imperfecta, the skull and neck bones are less tough than usual, so any head or neck injury is worth a doctor\'s check the same day, even if it seemed minor.' } },
  { id: 'oi-skullbase', tier: 'emergency',
    text: 'A headache at the back of the head that gets worse when you cough, sneeze or strain, together with dizziness, trouble swallowing or speaking, or tingling, numbness or weakness in your arms or legs',
    why: { title: 'Please go to an emergency department today',
      text: 'In some types of osteogenesis imperfecta the base of the skull can settle and press on the brainstem and upper spinal cord. A headache like this with these other symptoms needs a scan and a specialist opinion today.' } },
  { id: 'oi-cord', tier: 'emergency', covers: ['cauda', 'saddle', 'cord', 'cordlegs'],
    text: 'Numbness or weakness spreading in your arms or legs, or any new change in bladder or bowel control',
    why: { title: 'Please go to an emergency department now',
      text: 'These can mean pressure on the spinal cord or the nerves at the base of the spine, which needs emergency assessment today.' } },
  { id: 'oi-fracture', tier: 'urgent', sameDay: true, noBooking: true,
    text: 'New pain in the last couple of weeks, even if it feels mild, after a small knock, lift, twist, sneeze or fall, or for no reason you remember: in one spot that is tender or swollen, or a sudden, severe back pain (especially with losing height or pain on sitting up)',
    why: { title: 'Please get an X-ray today',
      text: 'With osteogenesis imperfecta, a new pain like this is treated as a broken bone until an X-ray says otherwise, even when it feels mild: in OI a fracture can hurt surprisingly little. Please see your doctor, a walk-in or urgent care centre, or the emergency department today, and avoid putting weight or load through that area until it has been checked. Physiotherapy comes next: rehabilitation after a fracture is where it helps most, and you are welcome to book once you have had your X-ray (Chandra sees children from 5; for a younger child, a children\'s physiotherapist can help).' } },
  { id: 'oi-heart', tier: 'urgent', sameDay: true,
    text: 'Chest pain, getting breathless with everyday activity or when lying flat, a racing or irregular heartbeat, or swollen ankles, that is new or getting worse',
    why: { title: 'Please see a doctor today',
      text: 'Osteogenesis imperfecta can affect the heart valves and, with a curved spine, the lungs. Breathlessness, palpitations or swollen ankles that are new or worse need a doctor the same day. Call 911 now for chest pain, or if breathlessness is severe.' } },
]

/** The OI red flags, minus any the regional or pattern checks on the page
    already ask (`asked`: their flags). */
export function oiRedFlags(answers = {}, asked = []) {
  if (!oiOn(answers)) return []
  const ids = new Set(asked.map((f) => f.id))
  const groups = new Set(asked.flatMap((f) => [].concat(f.group || [])))
  return OI_RED_FLAGS.filter((f) => !ids.has(f.id) && !(f.covers || []).some((c) => ids.has(c) || groups.has(c)))
}

/* ── 3. The details, on "Before your results" (document Q1 type, Q3, Q4,
   Q6). Every question optional. ── */
export const OI_DETAILS = [
  { id: 'oiType', text: 'Which type of OI do you have, if you know?',
    options: [
      { id: 't1', label: 'Type I (the mildest)' },
      { id: 't3', label: 'Type III' },
      { id: 't4', label: 'Type IV' },
      { id: 't5', label: 'Type V' },
      { id: 'other', label: 'Another type' },
      { id: 'ns', label: 'Not sure' },
    ] },
  { id: 'oiGoal', text: 'What is the main problem you want help with?',
    options: [
      { id: 'pain', label: 'Pain that has been around for months, in several areas' },
      { id: 'strength', label: 'Feeling weaker, less steady or less fit than I was' },
      { id: 'loose', label: 'Loose joints that click or give way (hypermobility)' },
      { id: 'spine', label: 'Pain mainly from a curved or rounded spine (scoliosis or kyphosis)' },
      { id: 'after', label: 'Getting better after a recent broken bone (fracture) or operation' },
    ] },
  { id: 'oiFalls', text: 'In the last year, how many broken bones (fractures) and falls have you had?',
    options: [
      { id: '0', label: 'No fractures and no falls' },
      { id: '1', label: 'One fracture, or one fall' },
      { id: '2', label: 'Two or more fractures, or more than one fall' },
    ] },
  { id: 'oiCare', text: 'Do you see a bone specialist?',
    options: [
      { id: 'yes', label: 'Yes, and I have had a bone-strength scan (DXA) in the last 2 to 3 years' },
      { id: 'lost', label: 'No, or not for years, or no scan for years' },
      { id: 'stopped', label: 'I stopped a bone-strengthening medicine (such as Prolia/denosumab, or a bisphosphonate) without my doctor checking' },
      { id: 'ns', label: 'Not sure' },
    ] },
]

/* ── 4. The results panel ── */
const ROUTE = {
  pain: 'For pain that has been around for months: an honest explanation of what is driving it (old fracture sites, posture, joint control, loss of fitness, and a nervous system that has learned to protect), with pacing, a plan for flares, sleep strategies and graded activity, adapted for bone safety.',
  strength: 'For strength, balance and stamina: a progressive programme for the hips, thighs, trunk and shoulders using controlled ranges and gradual loads (bands, body weight, the pool, machines rather than impact), balance training, and low-impact fitness work such as the pool, a bike or walking. Progress is set by how you recover and how confident you feel, never by the calendar.',
  loose: 'For loose joints: strengthening for control around the joints that give or click, balance and joint-position work, taping or bracing for particular tasks, and footwear or orthotics for flat, tiring feet.',
  spine: 'For the spine: posture and upper-back movement within a comfortable range, trunk and hip strengthening, breathing exercises (especially with a curve), bone-safe lifting and ways of turning in bed, and supported positions for work and rest.',
  after: 'After a fracture or surgery: early, structured rehabilitation to rebuild strength and confidence quickly, following your fracture team\'s or surgeon\'s plan and once they have cleared you to start. Long rests in a cast or in bed cost bone and muscle quickly, so getting going within that plan matters.',
}

/** The panel, or null. */
export function oiPanel(answers = {}) {
  if (!oiOn(answers)) return null
  const notes = [
    'Treat any new pain in one spot after a small knock, lift or sneeze as a possible fracture: get it X-rayed rather than waiting to see.',
    'Keep moving every day with low-impact activity (walking, the pool, a bike) and a few controlled strength exercises. Avoid jumping, contact sports, activities with a high risk of falling, heavy lifting with the back bent or twisted, and forceful stretching of loose joints.',
    'Treatment at the clinic uses gentle, controlled hands-on techniques only: no forceful manipulation and no hard stretching.',
  ]
  if (answers.oiFalls === '2') notes.push('Because of your falls or fractures this year: make your home fall-safe (good lighting, no loose rugs, rails, shoes with grip), practise balance holding a counter, and and ask your doctor for a review of your bone health.')
  else notes.push('Make your home fall-safe (good lighting, no loose rugs, rails, shoes with grip) and practise balance holding a counter.')
  // 6 Oct 2026, general conditions cross-check (approved by Chandra), W1: the stopped-medicine safety line stays; no other medication advice.
  if (answers.oiCare === 'stopped') notes.push('If you have stopped a bone medicine without a plan, please see your doctor soon; new back pain after stopping needs your doctor promptly.')
  else notes.push('Follow your doctor\'s plan for any bone medicine or supplements, and ask them before changing or stopping anything.')
  if (['lost', 'stopped', 'ns'].includes(answers.oiCare)) notes.push('Ask your family doctor for a referral back to a bone or OI specialist (for example an adult metabolic bone clinic): adults with OI benefit from ongoing review, especially after 50 or the menopause, including vitamin D, calcium and whether bone medicine is right for you.')
  else notes.push('Stay in touch with your bone specialist, especially after 50 or the menopause, and ask about vitamin D, calcium and whether bone medicine is right for you.')
  notes.push('Hearing often changes with OI, usually from the 20s to the 40s, and it is treatable: if it is changing, ask your doctor for a hearing test.')
  const lead = ROUTE[answers.oiGoal]
  return {
    title: 'Osteogenesis imperfecta and physiotherapy',
    text: `${lead ? `${lead} ` : ''}Osteogenesis imperfecta changes the collagen in bone, tendons and ligaments: bones are less tough and joints more mobile, so muscle does more of the work of protecting them. Exercise is recommended, not forbidden: adults with OI who stay strong and keep moving do best, and pain from loose joints, old fracture sites, posture and a sensitised nervous system can respond to physiotherapy. Physiotherapy can help with a plan built around strength, pacing, confident movement and fracture-safe habits, alongside your doctor and bone specialist.`,
    notes,
  }
}

/** Lines for Chandra's summary. */
export function oiSummary(answers = {}) {
  if (!oiOn(answers)) return []
  const out = ['Osteogenesis imperfecta: yes (self-reported)']
  for (const q of OI_DETAILS) {
    const o = q.options.find((x) => x.id === answers[q.id])
    out.push(`${q.text} ${o ? o.label : 'not answered'}`)
  }
  return out
}
