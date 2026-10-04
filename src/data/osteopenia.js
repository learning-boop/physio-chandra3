/* ─────────────────────────────────────────────────────────────────────────
   Osteopenia (low bone density): a risk reading, not a disease.

   From "Osteopenia.docx" (Conditions/General conditions, v0.1, 4 Oct 2026),
   built with the document's recommended answers to its open items.
   Clinician reference: content/reference/osteopenia.md.

   Osteopenia does not hurt and is not diagnosed by the guide. It is:
     1. "Osteopenia, or low bone density on a scan" on the cautions list
        (ca-osteopenia, PainAssessment.jsx): the physio route, always
        (open item 1). Booking is never held for it.
     2. Optional risk questions on "Before your results" when it is ticked
        (BONE_DETAILS: past fracture, falls, height loss, risk factors).
        No risk number is calculated or shown; FRAX is the doctor's tool.
     3. The results panel (bonePanel): the 2023 Canadian exercise advice in
        movement-positive words, with an "ask your doctor for a full
        fracture-risk assessment" add-on when the answers call for it.
     4. Fracture first: the areas' own fragile-bone questions (the spine,
        hip and fall questions) now say "osteoporosis or low bone density",
        so they reach people with osteopenia too.

   Language (document §4): "low bone density", never "thin" or "fragile"
   bones; "avoid" only for specific movements, never for activity.
   The details are kept as answers.bn* (summary and PDF), not in the
   anonymous copy or the AI overview.
   ───────────────────────────────────────────────────────────────────────── */

export const OSTEOPENIA_CAUTION = {
  id: 'ca-osteopenia', tier: 'caution', text: 'Osteopenia, or low bone density on a scan (not osteoporosis)',
  why: { title: 'Worth knowing before your first assessment',
    text: 'Low bone density is a reason to build strength and balance, not to hold back: Canadian guidelines recommend strength and balance training at least twice a week for anyone with a bone-health concern. Your programme is built around that, with safe ways to bend and lift.' },
}
export const osteopeniaOn = (flags = []) => flags.includes('ca-osteopenia')

/* Document Q2, Q3, Q6, Q4 + Q5. Steroid tablets come from "A little about
   you" (answers.steroid), so they are not asked again. */
export const BONE_DETAILS = [
  { id: 'bnFracture', text: 'Since age 40, have you broken a bone from a fall from standing height or less, a lift, a cough, or with no clear injury?',
    options: [
      { id: 'hipspine', label: 'Yes, a hip or a bone in the spine' },
      { id: 'two', label: 'Yes, two or more other bones' },
      { id: 'one', label: 'Yes, one other bone (such as a wrist, rib or upper arm)' },
      { id: 'no', label: 'No' },
    ] },
  { id: 'bnFalls', text: 'In the past year, have you fallen, or do you feel unsteady?',
    options: [
      { id: 'two', label: 'Two or more falls, or I avoid things for fear of falling' },
      { id: 'one', label: 'One fall' },
      { id: 'unsteady', label: 'No falls, but I feel unsteady or hold on to furniture' },
      { id: 'no', label: 'No' },
    ] },
  { id: 'bnHeight', text: 'Have you lost height (more than 4 cm, or 1½ inches, from your tallest), or developed a rounded upper back?',
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'ns', label: 'Not sure' },
      { id: 'no', label: 'No' },
    ] },
  { id: 'bnRisk', multi: true, text: 'Do any of these apply to you? Tick all that apply.',
    options: [
      { id: 'parent', label: 'A parent who broke a hip' },
      { id: 'smoke', label: 'I smoke' },
      { id: 'alcohol', label: 'More than 2 alcoholic drinks most days' },
      { id: 'weight', label: 'Low body weight' },
      { id: 'ra', label: 'Rheumatoid arthritis' },
      { id: 'hormone', label: 'Menopause before 45, low testosterone, or hormone treatment for breast or prostate cancer' },
      { id: 'gland', label: 'An overactive thyroid or parathyroid' },
      { id: 'gut', label: 'Coeliac disease or another gut condition, or weight-loss surgery' },
      { id: 'organ', label: 'Long-term kidney or liver disease, or type 1 diabetes' },
      { id: 'meds', label: 'Long-term anti-seizure, acid-reducing or antidepressant (SSRI) medicine' },
      { id: 'none', label: 'None of these' },
    ] },
]

const FRAX = ['parent', 'smoke', 'alcohol', 'weight', 'ra', 'hormone']   // document Q4
const SECONDARY = ['gland', 'gut', 'organ', 'meds']                       // document Q5

/** The document's clarifier: whether to add "ask your doctor for a full
    fracture-risk assessment", and why. Never shown as a number. */
export function boneRisk(a = {}) {
  const risk = [].concat(a.bnRisk || [])
  const frax = risk.filter((x) => FRAX.includes(x)).length + (a.steroid === 'tabs' ? 1 : 0)
  const secondary = risk.some((x) => SECONDARY.includes(x))
  const reclassify = a.bnFracture === 'hipspine' || a.bnFracture === 'two'
  const vertebral = a.bnHeight === 'yes'
  const falls = a.bnFalls === 'two'
  const total = ({ hipspine: 4, two: 4, one: 3 }[a.bnFracture] || 0) + ({ two: 3, one: 2, unsteady: 1 }[a.bnFalls] || 0) +
    Math.min(frax, 3) + (secondary ? 2 : 0) + ({ yes: 3, ns: 1 }[a.bnHeight] || 0)
  const askDoctor = total >= 5 || reclassify || vertebral || secondary || (falls && a.age === 'o64')
  return { askDoctor, reclassify, vertebral, secondary, fell: ['two', 'one'].includes(a.bnFalls) }
}

/** The results panel when ca-osteopenia is ticked, or null. */
export function bonePanel(flags = [], a = {}) {
  if (!osteopeniaOn(flags)) return null
  const r = boneRisk(a)
  const notes = [
    'Do strength work at least twice a week (sit-to-stands, step-ups, wall or counter push-ups, carrying shopping, or weights at a gym) and make it a little harder every week or two.',
    'Practise balance every day: stand on one leg while the kettle boils, walk heel-to-toe along a line, and get up from a chair without using your hands.',
    'Walk briskly most days and include stairs or hills. If you have not had a spine fracture and your balance is good, a little impact, built up gradually (heel drops, small hops or skips), helps bones too.',
    'Bend and lift with your hips and knees rather than rounding your back under a load, and avoid lifting and twisting at the same time. In yoga or Pilates, swap deep forward rounds and loaded twists for other poses. Specific movements are adjusted; activity is not avoided.',
    'Eat some protein at each meal and calcium-rich foods every day, ask your doctor about vitamin D in the winter, do not smoke, keep alcohol modest, and make your home and footwear fall-safe.',
  ]
  if (r.askDoctor) notes.push('Your scan result on its own does not decide what you need. Please ask your family doctor, at your next visit, for a full fracture-risk assessment: they combine the scan with your age, past fractures, falls and health conditions into a 10-year risk estimate (FRAX), check for treatable causes of bone loss, and decide whether bone medicine is worth discussing.')
  if (r.reclassify) notes.push('A past hip or spine fracture, or two or more fractures from small injuries, is treated as osteoporosis whatever the scan number: please tell your doctor about it.')
  if (r.vertebral) notes.push('Height loss or a newly rounded upper back can mean a spine fracture that happened without much pain: ask your doctor about a spine X-ray.')
  if (r.fell) notes.push('Because you have fallen this year, ask your doctor for a falls check (medicines, eyesight, blood pressure on standing). Balance and strength training is the part physiotherapy can help with.')
  notes.push('Sudden new back pain after bending, lifting, coughing or a small fall needs a doctor within a day or two for an X-ray. If you take denosumab (Prolia), never stop it without a follow-on plan from your doctor.')
  notes.push('Low bone density does not cause aches. Deep aching bones on both sides that are tender to press, with weak hips, are worth a bone blood test with your doctor (vitamin D and calcium).')
  return {
    title: 'Low bone density: bones that respond to loading',
    text: 'Osteopenia means a bone-density scan put your bones in the band between "typical for a young adult" and osteoporosis. It is a measurement, not an illness, and it does not hurt: about half of adults over 50 are in this band. Bone density is one of several things that decide how likely a bone is to break; past fractures, falls, some medicines and conditions, and family history matter as much. For most people it is a prompt, not a problem, and the most useful response is the opposite of what the word suggests: load your bones and muscles on purpose. Strength and balance improve within 8 to 12 weeks of regular training, which cuts the falls that cause most fractures, and progressive loading helps keep bone. Holding back from activity because of the label is what makes bones and balance worse. Physiotherapy can help with a clear, safe plan.',
    notes,
  }
}

/** Lines for Chandra's summary. */
export function boneSummary(flags = [], a = {}) {
  if (!osteopeniaOn(flags)) return []
  const out = []
  for (const q of BONE_DETAILS) {
    const v = [].concat(a[q.id] || [])
    out.push(`${q.text} ${v.length ? v.map((x) => q.options.find((o) => o.id === x)?.label || x).join('; ') : 'not answered'}`)
  }
  const r = boneRisk(a)
  const why = [r.reclassify && 'prior hip/spine or 2+ fragility fractures (treat as osteoporosis)', r.vertebral && 'height loss/kyphosis (VFA or lateral X-ray)',
    r.secondary && 'secondary cause ticked', r.fell && 'fall(s) this year'].filter(Boolean)
  out.push(r.askDoctor ? `Ask-your-doctor (FRAX/secondary causes) line shown${why.length ? `: ${why.join('; ')}` : ''}` : 'No FRAX add-on triggered (exercise and lifestyle plan)')
  return out
}
