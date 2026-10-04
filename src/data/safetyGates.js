/* ─────────────────────────────────────────────────────────────────────────
   Smarter doctor page: mechanism first, then gateway groups.
   Knee prototype (Chandra, 4 Oct 2026), extended the same day to the foot,
   hip and ankle.

   It runs when ONE of these areas is the only one drawn (AREAS below):
   1. Mechanism first. The area's injury screen ("Have you injured your …
      in the last 6 weeks…?") runs straight after the emergency page, before
      the doctor page, and its answer filters the doctor page (MECHANISM).
      Emergencies stay first and mandatory.
   2. Gateways. Related see-a-doctor questions are grouped behind one plain-
      language question built from the key signs of the questions that apply
      to this person (GATES, SIGNS). Ticking a group opens its specific
      questions; "Not sure which" still flags it for a doctor, as urgently as
      its most urgent question. A group with only one question that applies
      is shown as that question, with no gateway. The same red flags are
      asked; most people answer four or five groups instead of ten questions.

   Never filtered by mechanism: emergencies; clot, infection, cancer,
   tumour and inflammatory questions; fragile-bone fractures (the hip's
   "sudden pain with no fall"); and anything for a child. Tumour pain is
   often put down to a small knock, an injury raises the clot risk, and
   fragile bones break without a remembered injury.
   ───────────────────────────────────────────────────────────────────────── */

/* The areas it runs for: the drawn zone type → its injury screen and groups. */
export const AREAS = ['knee', 'foot', 'hip', 'ankle']

/* Gateway groups per area. Each takes the place of its most severe member
   on the page (the page is sorted by severity first). */
export const GATES = {
  knee: [
    { id: 'knee-infection', title: 'Signs of infection or a flare-up', members: ['kf-replacement', 'kf-gout', 'kf-inflam'] },
    { id: 'knee-circulation', title: 'Signs of a clot or a circulation problem', members: ['kf-dvt', 'kf-artery'] },
    { id: 'knee-medical', title: 'Signs that need a medical check', members: ['kf-cancer', 'kf-tumour', 'kf-stress', 'kf-sufe', 'kf-perthes', 'sc-systemic'] },
  ],
  foot: [
    { id: 'foot-infection', title: 'Signs of infection or a flare-up', members: ['ft-puncture', 'ft-charcot', 'ft-gout', 'ft-inflam'] },
    { id: 'foot-circulation', title: 'Signs of a circulation problem or a tight cast', members: ['ft-cast', 'ft-claudication'] },
    { id: 'foot-nerve', title: 'Changes in feeling or strength', members: ['ft-neuropathy', 'ft-footdrop', 'ft-crps', 'sc-neuro'] },
    { id: 'foot-medical', title: 'Signs that need a medical check', members: ['ft-stress', 'ft-lump', 'sc-systemic'] },
  ],
  hip: [
    { id: 'hip-surgery', title: 'Signs of a problem after hip surgery, or a clot', members: ['hpf-replacement', 'hpf-dvt'] },
    { id: 'hip-bone', title: 'Signs of a problem in the bone', members: ['hpf-nofall', 'hpf-stress', 'hpf-avn', 'hpf-sufe'] },
    { id: 'hip-organ', title: 'Signs coming from the tummy or pelvis', members: ['hpf-hernia', 'hpf-kidney', 'pc-urinary', 'hpf-pelvic'] },
    { id: 'hip-medical', title: 'Signs that need a medical check', members: ['hpf-cancer', 'sc-systemic'] },
  ],
  ankle: [
    { id: 'ankle-circulation', title: 'Signs of a clot or a tight cast', members: ['af-cast', 'af-dvt'] },
    { id: 'ankle-infection', title: 'Signs of infection or a flare-up', members: ['af-charcot', 'af-gout', 'af-inflam'] },
    { id: 'ankle-nerve', title: 'Changes in feeling or strength', members: ['af-neuropathy', 'af-footdrop', 'af-crps', 'sc-neuro'] },
    { id: 'ankle-medical', title: 'Signs that need a medical check', members: ['af-quinolone', 'af-cancer', 'sc-systemic'] },
  ],
}

/* Each question's key signs, in plain words. A group's question is built
   from the members that apply to this person, so an adult is not asked
   about a child's limp and a man is not asked about periods. */
export const SIGNS = {
  // Knee
  'kf-replacement': 'a knee replacement that is newly painful, warm, swollen or leaking',
  'kf-gout': 'a knee that became suddenly hot, swollen and very painful overnight',
  'kf-inflam': 'other joints swollen too, or a rash, psoriasis or sore eyes',
  'kf-dvt': 'a calf that is swollen, warm or tender',
  'kf-artery': 'a pulsing lump behind the knee, or calf cramps on walking that ease within minutes of standing still',
  'kf-cancer': 'a past cancer, or a deep ache at night that does not change with position, with weight loss',
  'kf-tumour': 'a deep ache around the knee that wakes you at night, or a lump near the knee that is growing',
  'kf-stress': 'a deep ache above the knee that is worse with running or hopping',
  'kf-sufe': 'a child aged about 9 to 16 limping, or with hip pain',
  'kf-perthes': 'a child aged about 4 to 10 limping, with no injury',
  // Foot
  'ft-puncture': 'something went through your shoe into your foot, and it is now swollen, red or painful to walk on',
  'ft-charcot': 'diabetes with a foot that is hot, red or swollen, or a wound that is not healing',
  'ft-gout': 'a toe or other joint that became suddenly hot, swollen, red and too painful to touch',
  'ft-inflam': 'a whole toe swollen like a sausage, or heel pain with back stiffness, psoriasis or sore eyes',
  'ft-cast': 'a cast, splint or bandage on the foot that feels more and more tight and painful',
  'ft-claudication': 'foot or calf cramps on walking that ease when you stand still, or cold, shiny toes that are slow to heal',
  'ft-neuropathy': 'both feet numb, burning or tingling, like wearing socks',
  'ft-footdrop': 'your foot slapping down or your toes catching when you walk',
  'ft-crps': 'since an injury, surgery or cast, a foot that burns, swells, changes colour or is so sensitive that light touch hurts',
  'ft-stress': 'pain on one foot bone that is worse with every step or hopping, if you run, march or train hard',
  'ft-lump': 'a lump in the foot that is growing, or a new dark mark under a toenail',
  // Hip
  'hpf-replacement': 'a hip replacement or hip fracture operation, and the hip is newly painful, warm or swollen, the wound red or leaking, or a fever',
  'hpf-dvt': 'a leg that is swollen, warm or tender in the calf or thigh',
  'hpf-nofall': 'hip or groin pain that came on suddenly with no fall (or only a small slip), so it now hurts to stand on that leg, if you are 65 or over or have low bone density',
  'hpf-stress': 'a deep groin ache that is worse with running or hopping',
  'hpf-avn': 'a deep groin ache if you take long-term steroid tablets, drink heavily or have sickle cell disease',
  'hpf-sufe': 'a child aged about 9 to 16 limping, with hip, groin, thigh or knee pain',
  'hpf-hernia': 'a soft lump in the groin that appears when you cough, strain or stand',
  'hpf-kidney': 'pain in waves from your side to your groin, or burning or blood when you pass urine',
  // The drawing's urinary pattern question (./patternChecks.js), asked for the hip.
  'pc-urinary': 'a fever with pain from your side',
  'hpf-pelvic': 'groin pain linked to your periods, or unusual vaginal bleeding or discharge',
  'hpf-cancer': 'a past cancer, or a deep ache at night that does not change with position, with weight loss',
  // Ankle
  'af-cast': 'a cast, splint or bandage that feels more and more tight and painful',
  'af-dvt': 'a calf or ankle that is swollen, warm or tender',
  'af-charcot': 'diabetes with a foot or ankle that is hot, red or swollen, or a wound that is not healing',
  'af-gout': 'an ankle or big toe that became suddenly hot, swollen and very painful overnight',
  'af-inflam': 'heel or Achilles pain with morning back stiffness, psoriasis, sore eyes or other swollen joints',
  'af-neuropathy': 'both feet numb, burning or tingling, like wearing socks',
  'af-footdrop': 'your foot slapping down or your toes catching when you walk',
  'af-crps': 'since an injury, surgery or cast, an ankle or foot that burns, swells, changes colour or is so sensitive that light touch hurts',
  'af-quinolone': 'Achilles pain after a recent quinolone antibiotic (such as ciprofloxacin) or steroid tablets',
  'af-cancer': 'a past cancer, a lump that is growing, or a deep ache at night that does not change with position',
  // Shared
  'sc-systemic': 'fever, chills or weight loss you cannot explain, or a new or growing lump',
  'sc-neuro': 'new or worsening weakness, numbness or clumsiness in an arm or leg',
}

/** "Title: a; b; or c", from the members present. */
export function gateText(gate, members = []) {
  const parts = members.map((m) => SIGNS[m.id]).filter(Boolean)
  if (!parts.length) return gate.title
  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join('; ')}; or ${parts[parts.length - 1]}`
  return `${gate.title}: ${list}`
}

/* Mechanism: question id → the injury screen whose first answer decides it.
   'noInjury' questions (overuse stress fractures, "no injury" Perthes) are
   skipped after a recent injury to that area. */
export const MECHANISM = { 'kf-stress': 'knee', 'kf-perthes': 'knee', 'ft-stress': 'foot', 'hpf-stress': 'hip' }
export const injuredIn = (screen, a = {}) => a[`${screen}:I1`] !== undefined && a[`${screen}:I1`] !== 'no'
/** Kept for the knee prototype's wording. */
export const kneeInjured = (a = {}) => injuredIn('knee', a)

/** The doctor-page flags minus those the mechanism rules out. */
export const byMechanism = (flags = [], answers = {}) =>
  flags.filter((f) => !(MECHANISM[f.id] && injuredIn(MECHANISM[f.id], answers)))

/** The area the smarter flow runs for, or null: one of AREAS, drawn alone. */
export function smartArea(zones = []) {
  if (!zones.length) return null
  const t = zones[0].type
  return AREAS.includes(t) && zones.every((z) => z.type === t) ? t : null
}
/** Kept for the knee prototype's checks. */
export const kneeOnly = (zones = []) => smartArea(zones) === 'knee'

const groupsFor = (area) => GATES[area] || []

/** "Not sure which" flags for the groups that will show as a gateway (two or
    more members on the page). They join the doctor-page list so they count
    like any other flag; the page shows them only inside their group. */
export function gateUnsureFlags(list = [], area = 'knee') {
  const ids = new Set(list.map((f) => f.id))
  return groupsFor(area).filter((g) => g.members.filter((id) => ids.has(id)).length >= 2).map((g) => {
    const members = list.filter((f) => g.members.includes(f.id))
    return {
      id: `gate:${g.id}`, tier: 'urgent', gate: g.id, area, unsure: true,
      // As urgent as the most urgent question it stands for; booking is still offered.
      sameDay: members.some((f) => f.sameDay),
      text: `${gateText(g, members)} (not sure which)`,
      why: { title: 'Please see your doctor', text: 'You told us one of these signs applies but were not sure which. A doctor should check it before physiotherapy begins; you can still book with Chandra, who will make sure it has been looked at.' },
    }
  })
}

/** The page as rows: { flag } on its own, or { gate, members, unsure } for a
    group of two or more. Each group sits where its first (most severe)
    member was. The area comes from the "not sure" flags on the list. */
export function gateRows(list = []) {
  const unsureFlags = list.filter((f) => f.unsure)
  const area = unsureFlags.length ? unsureFlags[0].area : null
  const groups = groupsFor(area)
  const gateOf = Object.fromEntries(groups.flatMap((g) => g.members.map((id) => [id, g.id])))
  const unsure = Object.fromEntries(unsureFlags.map((f) => [f.gate, f]))
  const shown = list.filter((f) => !f.unsure)
  const rows = [], placed = new Set()
  for (const f of shown) {
    const gid = gateOf[f.id]
    if (gid && unsure[gid]) {
      if (placed.has(gid)) continue
      placed.add(gid)
      const gate = groups.find((g) => g.id === gid), members = shown.filter((x) => gateOf[x.id] === gid)
      rows.push({ gate: { ...gate, text: gateText(gate, members) }, members, unsure: unsure[gid] })
    } else rows.push({ flag: f })
  }
  return rows
}
