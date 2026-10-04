/* ─────────────────────────────────────────────────────────────────────────
   Smarter doctor page: mechanism first, then gateway groups.
   KNEE PROTOTYPE (Chandra, 4 Oct 2026).

   1. Mechanism first. For a drawing of the knee only, the knee injury screen
      ("Have you injured your knee in the last 6 weeks…?") now runs straight
      after the emergency page, before the doctor page, and its answer
      filters the doctor page (MECHANISM below). Emergencies stay first and
      mandatory.
   2. Gateways. Related see-a-doctor questions are grouped behind one plain-
      language question that names their key signs (GATES). Ticking a group
      opens its specific questions; "Not sure which" still flags it for a
      doctor. A group with only one question that applies to this person is
      shown as that question, with no gateway. The same red flags are asked:
      most people answer three groups instead of ten questions.

   Never filtered by mechanism: emergencies; clot, infection, cancer,
   tumour and inflammatory questions; and anything for a child. Tumour pain
   is often put down to a small knock, an injury raises the clot risk, and
   fragile bones break without a remembered injury.
   ───────────────────────────────────────────────────────────────────────── */

/* Gateway groups, in no particular order: each takes the place of its most
   severe member on the page (the page is sorted by severity first). */
export const GATES = [
  { id: 'infection', title: 'Signs of infection or a flare-up',
    members: ['kf-replacement', 'kf-gout', 'kf-inflam'] },
  { id: 'circulation', title: 'Signs of a clot or a circulation problem',
    members: ['kf-dvt', 'kf-artery'] },
  { id: 'medical', title: 'Signs that need a medical check',
    members: ['kf-cancer', 'kf-tumour', 'kf-stress', 'kf-sufe', 'kf-perthes', 'sc-systemic'] },
]

/* Each member's key signs, in plain words. A group's question is built from
   the members that apply to this person, so an adult is not asked about a
   child's limp. */
export const SIGNS = {
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
  'sc-systemic': 'fever, chills or weight loss you cannot explain, or a new or growing lump',
}
/** "Title: a; b; or c", from the members present. */
export function gateText(gate, members = []) {
  const parts = members.map((m) => SIGNS[m.id]).filter(Boolean)
  if (!parts.length) return gate.title
  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join('; ')}; or ${parts[parts.length - 1]}`
  return `${gate.title}: ${list}`
}
const GATE_OF = Object.fromEntries(GATES.flatMap((g) => g.members.map((id) => [id, g.id])))

/* Mechanism (the knee injury screen's first answer, answers['knee:I1']).
   'noInjury': only asked when there was no recent injury. */
export const MECHANISM = { 'kf-stress': 'noInjury', 'kf-perthes': 'noInjury' }
export const kneeInjured = (a = {}) => a['knee:I1'] !== undefined && a['knee:I1'] !== 'no'

/** The doctor-page flags minus those the mechanism rules out. */
export const byMechanism = (flags = [], answers = {}) =>
  flags.filter((f) => !(MECHANISM[f.id] === 'noInjury' && kneeInjured(answers)))

/** The prototype runs for a drawing of the knee only. */
export const kneeOnly = (zones = []) => zones.length > 0 && zones.every((z) => z.type === 'knee')

const unsureId = (g) => `gate:${g.id}`

/** "Not sure which" flags for the groups that will show as a gateway (two or
    more members on the page). They join the doctor-page list so they count
    like any other flag; the page shows them only inside their group. */
export function gateUnsureFlags(list = []) {
  const ids = new Set(list.map((f) => f.id))
  return GATES.filter((g) => g.members.filter((id) => ids.has(id)).length >= 2).map((g) => {
    const members = list.filter((f) => g.members.includes(f.id))
    return {
      id: unsureId(g), tier: 'urgent', gate: g.id, unsure: true,
      // As urgent as the most urgent question it stands for; booking is still offered.
      sameDay: members.some((f) => f.sameDay),
      text: `${gateText(g, members)} (not sure which)`,
      why: { title: 'Please see your doctor', text: 'You told us one of these signs applies but were not sure which. A doctor should check it before physiotherapy begins; you can still book with Chandra, who will make sure it has been looked at.' },
    }
  })
}

/** The page as rows: { flag } on its own, or { gate, members, unsure } for a
    group of two or more. Each group sits where its first (most severe)
    member was. */
export function gateRows(list = []) {
  const unsure = Object.fromEntries(list.filter((f) => f.unsure).map((f) => [f.gate, f]))
  const shown = list.filter((f) => !f.unsure)
  const rows = [], placed = new Set()
  for (const f of shown) {
    const gid = GATE_OF[f.id]
    if (gid && unsure[gid]) {
      if (placed.has(gid)) continue
      placed.add(gid)
      const gate = GATES.find((g) => g.id === gid), members = shown.filter((x) => GATE_OF[x.id] === gid)
      rows.push({ gate: { ...gate, text: gateText(gate, members) }, members, unsure: unsure[gid] })
    } else rows.push({ flag: f })
  }
  return rows
}
