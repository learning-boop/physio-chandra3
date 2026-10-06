/* ─────────────────────────────────────────────────────────────────────────
   Grouping the "also worth telling us" list (Chandra, 6 Oct 2026: "there are
   too many options, the patient may get confused — can they be grouped?").

   The list had grown to 25 conditions on one screen, at the point where the
   person is one tap from their results. They are not safety questions: none
   of them stops physiotherapy, they shape the advice and tell Chandra what to
   plan around. So the grouping works like the emergency and doctor pages
   (./emergencyGroups.js, ./safetyGates.js), with one difference: a group is
   an opener, not a question. Nothing is hidden — each group NAMES the
   conditions it holds, and tapping it opens them.

   Every caution belongs to exactly one group; a check enforces it, so a new
   condition cannot be added and quietly lost.
   ───────────────────────────────────────────────────────────────────────── */

export const CAUTION_GROUPS = [
  {
    id: 'cg-bone',
    title: 'A bone condition',
    names: 'osteoporosis or low bone density, soft bones, Paget\'s disease, a bone tumour treated in the past',
    members: ['ca-bone', 'ca-osteopenia', 'ca-osteomalacia', 'ca-paget', 'ca-bonetumour'],
  },
  {
    id: 'cg-hormone',
    title: 'A hormone or gland condition',
    names: 'an overactive or underactive thyroid, a parathyroid or calcium problem, acromegaly, Cushing\'s, a pituitary or adrenal problem',
    members: ['ca-thyroid', 'ca-hypothyroid', 'ca-parathyroid', 'ca-acromegaly', 'ca-cushing', 'ca-pituitary'],
  },
  {
    id: 'cg-nervemuscle',
    title: 'A nerve or muscle condition',
    names: 'multiple sclerosis, myasthenia gravis, myotonic dystrophy or another muscle disease, myositis, Duchenne or Becker muscular dystrophy',
    members: ['ca-ms', 'ca-mg', 'ca-dm', 'ca-myositis', 'ca-dmd'],
  },
  {
    id: 'cg-joint',
    title: 'A joint, pain or fatigue condition',
    names: 'rheumatoid arthritis, hypermobility or Ehlers-Danlos, fibromyalgia, ME/CFS',
    members: ['ca-ra', 'ca-hypermobility', 'ca-fibro', 'ca-mecfs'],
  },
  {
    id: 'cg-now',
    title: 'Something going on right now',
    names: 'pregnancy or the months after birth, surgery in this area, a confirmed back stress injury, a heart or lung condition, an insurance or time-off claim',
    members: ['ca-preg', 'ca-surgery', 'ca-spondy', 'ca-cardio', 'ca-claim'],
  },
]

/** The group a caution belongs to, or null. */
export const groupOfCaution = (id) =>
  CAUTION_GROUPS.find((g) => g.members.includes(id)) || null

/** The screen as rows, in group order: { group, members } for a group with
    two or more of its conditions showing, { flag } for anything left on its
    own (one condition showing, or a caution with no group yet). */
export function cautionRows(list = []) {
  const rows = []
  const placed = new Set()
  for (const g of CAUTION_GROUPS) {
    const members = list.filter((f) => g.members.includes(f.id))
    if (!members.length) continue
    members.forEach((f) => placed.add(f.id))
    if (members.length === 1) rows.push({ flag: members[0] })
    else rows.push({ group: g, members })
  }
  for (const f of list) if (!placed.has(f.id)) rows.push({ flag: f })
  return rows
}

/** How many of a group's conditions this person has ticked. */
export const tickedIn = (group, flags = []) => group.members.filter((id) => flags.includes(id)).length
