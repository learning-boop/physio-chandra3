/* The test patients from each region document, run through the same code the
   site uses: drawing → areas asked about → safety check → injury screen →
   adaptive questions → results.   Run: npm run check:regions

   Each patient is copied from the "test patients" section of
   content/regions/<region>.md. They answer only the questions the flow
   actually asks them; anything their document entry does not mention is left
   unanswered, as a real visitor might.                                     */
import { REGIONS } from '../src/data/symptomGuide.js'
import {
  questionRegions, needsAreaChoice, buildScreens, nextQuestion, rankAcross, regionAnswers,
  specialsAcross, regionRedFlags, MAX_SCORED_QUESTIONS,
} from '../src/data/assessmentFlow.js'
import { detectReferral, flowZones, drawnAnswers } from '../src/data/referral.js'
import { injuryStep, injuryScreenApplies } from '../src/data/injuryScreen.js'
import { MAX_HYPOTHESES } from '../src/data/clinicianSummary.js'

const TESTS = {
  neck: [
    { name: '1. Desk worker, stiff one side',
      lines: [['neck', 'upperback']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', N1: ['onestiff'], N6: ['desk', 'down'], N7: ['eases'] },
      expect: { top: 'neck/mech', not: ['neck/radic'], route: 'results' } },
    { name: '2. Neck to thumb and index finger',
      lines: [['neck', 'shoulderR', 'elbowR', 'wristR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd3m',
        N2: ['pastelbow', 'armworse', 'fingers', 'handhead'], N3: ['arm'] },
      expect: { top: 'neck/radic', notTop: ['neck/mech'], notRegion: ['shoulder'], route: 'results' } },
    { name: '3. Highway crash within 48 hours',
      lines: [['neck']],
      answers: { age: '50-64', onset: 'car', duration: 'd2w', I1: 'vehicle', I2: 'h48', I4: ['mvc'] },
      expect: { route: 'emergency', notAsked: ['I6', 'I7'] } },
    // The document draws the shoulder only; with no neck mark the site asks
    // the shoulder's questions, so it is run both ways.
    { name: '4a. Shoulder look-alike, shoulder drawn only',
      lines: [['shoulderL']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd3m' },
      expect: { notRegion: ['neck'], route: 'results' } },
    { name: '4b. Shoulder look-alike, neck and shoulder drawn',
      lines: [['neck', 'shoulderL']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd3m', N1: ['full'], N2: ['shoulderonly'], N8: ['shoulder'] },
      expect: { notRegion: ['neck'], special: 'shoulderSource', route: 'results' } },
    { name: '5. Cervicogenic headache',
      lines: [['neck', 'head']],
      answers: { age: '18-29', onset: 'gradual', duration: 'o3m', N1: ['onestiff'], N4: ['onesided', 'movement'], N6: ['desk'] },
      expect: { top: 'neck/cheadache', route: 'results' } },
    { name: '6. Neck, jaw and left arm with effort (heart)',
      lines: [['head', 'neck'], ['shoulderL', 'elbowL']],
      focus: 'neck',
      answers: { age: '50-64', onset: 'gradual', duration: 'd2w', N1: ['full'], N6: ['lifting'] },
      flags: ['nrf-cardiac'],
      expect: { route: 'emergency' } },
  ],
}

const zonesOf = (lines) => {
  const seen = new Set(); const out = []
  for (const ids of lines) for (const id of ids) if (!seen.has(id)) { seen.add(id); out.push({ id, type: id.replace(/[LR]$/, '') }) }
  return out
}

/** The region's own answer ids → the ids of this (possibly shared) opening screen. */
function toScreen(keys, rk, own) {
  if (keys.length === 1) return { ...own }
  const { context } = buildScreens(keys)
  const out = { ...own }
  delete out.age; delete out.onset; delete out.duration
  for (const q of context) {
    if (q.id === 'age' || q.id === 'duration') {
      const hit = q.options.find((o) => regionAnswers(keys, rk, { [q.id]: o.id })[q.id] === own[q.id])
      if (hit) out[q.id] = hit.id
    } else if (q.id === `onset@${rk}` && own.onset) out[q.id] = own.onset
  }
  return out
}

function run(rk, t) {
  const zones = zonesOf(t.lines)
  const referral = detectReferral(t.lines)
  const flowZ = flowZones(zones, referral)
  const focus = needsAreaChoice(flowZ, null) ? (t.focus || rk) : null
  const keys = questionRegions(flowZ, focus)
  const seen = { asked: [], flagsOffered: regionRedFlags(flowZ, zones).map((f) => f.id), keys }

  // Safety check: the ticked flags must be on the screen; their tier routes.
  for (const id of t.flags || []) if (!seen.flagsOffered.includes(id)) return { ...seen, error: `flag ${id} is not on the safety screen` }
  const tiers = (t.flags || []).map((id) => regionRedFlags(flowZ, zones).find((f) => f.id === id).tier)
  if (tiers.includes('emergency')) return { ...seen, route: 'emergency' }
  if (tiers.includes('urgent')) return { ...seen, route: 'urgent' }

  const all = toScreen(keys, rk, t.answers)
  // Injury screen: anyone not described as injured answers "No".
  if (injuryScreenApplies(zones)) {
    const ia = {}
    let s
    while ((s = injuryStep(ia, all.age)).next) {
      seen.asked.push(s.next)
      ia[s.next] = t.answers[s.next] ?? (s.next === 'I1' ? 'no' : undefined)
      if (ia[s.next] === undefined) return { ...seen, error: `injury question ${s.next} has no answer in the test` }
    }
    if (s.route === 'emergency' || s.route === 'urgent') return { ...seen, route: s.route }
  }

  // Questions: opening screen, then whatever the flow picks.
  const { context } = buildScreens(keys)
  const ans = { ...drawnAnswers(referral) }
  for (const q of context) if (all[q.id] !== undefined) ans[q.id] = all[q.id]
  let id
  while ((id = nextQuestion(keys, ans, seen.asked.filter((x) => !/^I\d$/.test(x)), MAX_SCORED_QUESTIONS,
    { draw: zones.map((z) => z.type), all }))) {
    seen.asked.push(id)
    if (all[id] !== undefined) ans[id] = all[id]
  }
  const shown = rankAcross(keys, ans, MAX_HYPOTHESES).map((x) => `${x.rk}/${x.c.id}`)
  return { ...seen, route: 'results', shown, specials: specialsAcross(keys, ans) }
}

let failed = 0, total = 0
for (const [rk, tests] of Object.entries(TESTS)) {
  if (!REGIONS[rk]) { console.log(`\n${rk}: region not built`); failed++; continue }
  console.log(`\n── ${rk} · ${REGIONS[rk].name} ──`)
  for (const t of tests) {
    total++
    const r = run(rk, t)
    const e = t.expect
    const why = []
    if (r.error) why.push(r.error)
    if (e.route && r.route !== e.route) why.push(`route ${r.route}, expected ${e.route}`)
    if (e.top && (r.shown || [])[0] !== e.top) why.push(`top ${(r.shown || [])[0] || 'nothing'}, expected ${e.top}`)
    for (const c of e.not || []) if ((r.shown || []).includes(c)) why.push(`shows ${c}`)
    for (const c of e.notTop || []) if ((r.shown || [])[0] === c) why.push(`${c} is on top`)
    for (const g of e.notRegion || []) if ((r.shown || []).some((c) => c.startsWith(g + '/'))) why.push(`shows a ${g} condition`)
    for (const q of e.notAsked || []) if (r.asked.includes(q)) why.push(`asked ${q}`)
    if (e.special && !(r.specials || []).includes(e.special)) why.push(`no "${e.special}" card`)
    if (why.length) failed++
    console.log(`${why.length ? 'FAIL' : 'PASS'}  ${t.name}`)
    console.log(`      areas ${r.keys.join(' + ')} · asked ${r.asked.join(' ') || '—'} · ${r.route}` +
      (r.shown ? ` · shown ${r.shown.join(', ') || 'nothing'}` : '') +
      (r.specials && r.specials.length ? ` · card ${r.specials.join(', ')}` : ''))
    for (const w of why) console.log(`      ✗ ${w}`)
  }
}
console.log(`\n${total - failed}/${total} test patients passed`)
process.exit(failed ? 1 : 0)
