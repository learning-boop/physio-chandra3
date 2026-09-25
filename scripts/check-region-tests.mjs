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
  ctj: [
    { name: '1. Desk worker, stiff at the base of the neck',
      lines: [['neck', 'ctj']],
      answers: { age: '30-49', onset: 'desk', duration: 'd3m', C1: ['bump'], C2: ['down'], C5: ['desk'], C6: ['tall'], C8: ['stiffcrack'] },
      expect: { top: 'ctj/stiffness', not: ['ctj/tos', 'ctj/rib'], route: 'results' } },
    // "Above the left collarbone and down the inner arm": drawn starting at
    // the side of the neck, so it reads as one line from the neck to the hand.
    { name: '2. Thoracic outlet, collarbone to little finger',
      lines: [['neck', 'shoulderL', 'elbowL', 'wristL']],
      answers: { age: '18-29', onset: 'lift', duration: 'd6w', C1: ['supraclav'], C2: ['overhead', 'carry'],
        C4: ['ringlittle', 'overheadbags', 'heavy'], C5: ['overhead'] },
      expect: { top: 'ctj/tos', notTop: ['ctj/stiffness'], route: 'results' } },
    { name: '3. Upper rib joint after a sneeze',
      lines: [['ctj']],
      answers: { age: '30-49', onset: 'sudden', duration: 'd2w', C1: ['rib'], C2: ['twist'], C3: ['ribbreath'] },
      expect: { top: 'ctj/rib', not: ['ctj/tos'], route: 'results' } },
    { name: '4. Tearing pain between the shoulder blades (aorta)',
      lines: [['ctj']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd2w' },
      flags: ['crf-aorta'],
      expect: { route: 'emergency' } },
    { name: '5. Pancoast look-alike: smoker, hand wasting',
      lines: [['ctj', 'shoulderR', 'elbowR']],
      answers: { age: 'o64', onset: 'gradual', duration: 'd3m', C1: ['topblade'], C4: ['ringlittle', 'innerforearm'] },
      flags: ['crf-pancoast', 'crf-wasting'],
      expect: { route: 'urgent' } },
  ],
  upperback: [
    { name: '1. Desk worker, stiff mid back',
      lines: [['upperback']],
      answers: { age: '30-49', onset: 'sitting', duration: 'd3m', T1: ['spine'], T2: ['slump', 'sitting'], T5: ['desk'], T6: ['eases'], T8: ['tall'] },
      expect: { top: 'upperback/stiffness', not: ['upperback/nerveroot', 'upperback/rib'], route: 'results' } },
    { name: '2. Rib joint after a twist',
      lines: [['upperback']],
      answers: { age: '30-49', onset: 'lift', duration: 'd2w', T1: ['rib'], T2: ['twist'], T3: ['rib'], T4: ['none'] },
      expect: { top: 'upperback/rib', not: ['upperback/costochondritis', 'upperback/nerveroot'], route: 'results' } },
    { name: '3. Front of the chest (costochondritis)',
      lines: [['chest']],
      answers: { age: '18-29', onset: 'cough', duration: 'd6w', T1: ['front'], T7: ['tender', 'pushing', 'infection'] },
      expect: { top: 'upperback/costochondritis', notTop: ['upperback/rib'], special: 'chestFirst', route: 'results' } },
    { name: '4. Upper tummy through to the back (pancreas)',
      lines: [['upperback'], ['abdomen']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd2w' },
      flags: ['trf-pancreas'],
      expect: { route: 'emergency' } },
    { name: '5. Osteoporotic fracture look-alike',
      lines: [['upperback']],
      answers: { age: 'o64', onset: 'lift', duration: 'd2w', T1: ['spine'], T2: ['slump', 'lifting'] },
      flags: ['trf-osteo'],
      expect: { route: 'urgent' } },
  ],
  tlj: [
    // Drawn on the low back only: the TL junction is asked because a low-back
    // mark implies it ("felt low, starts higher").
    { name: '1. Maigne: low back and top of the buttock',
      lines: [['lowerback']],
      answers: { age: '30-49', onset: 'sport', duration: 'd3m', J1: ['crest'], J2: ['twist', 'sitting'], J3: ['usual'], J7: ['golf'] },
      expect: { top: 'tlj/maigne', notTop: ['lowback/facet'], not: ['lowback/sij'], route: 'results' } },
    { name: '2. Stiff at the bottom of the ribs',
      lines: [['tlj']],
      answers: { age: '30-49', onset: 'lift', duration: 'd6w', J1: ['beside'], J2: ['twist', 'extend'], J6: ['eases'], J8: ['moving'] },
      expect: { top: 'tlj/stiffness', not: ['tlj/slippingrib'], route: 'results' } },
    { name: '3. Slipping rib',
      lines: [['flankL']],
      answers: { age: '18-29', onset: 'sport', duration: 'd6w', J1: ['side'], J4: ['click', 'sharp'] },
      expect: { top: 'tlj/slippingrib', notTop: ['tlj/maigne'], route: 'results' } },
    { name: '4. Aneurysm: low back and tummy',
      lines: [['lowerback'], ['abdomen']],
      answers: { age: 'o64', onset: 'gradual', duration: 'd2w' },
      flags: ['jrf-aaa'],
      expect: { route: 'emergency' } },
    { name: '5. Kidney look-alike: side into the groin',
      lines: [['flankR', 'hipR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd2w', J1: ['side', 'groin'], J5: ['nochange'] },
      flags: ['jrf-kidney'],
      expect: { route: 'urgent' } },
  ],
  lowback: [
    { name: '1. Acute low back pain, one side',
      lines: [['lowerback']],
      answers: { age: '30-49', onset: 'lift', duration: 'd2w', L1: ['back'], L4: ['bendsit', 'getup'], L6: ['side'], L7: ['stiff'] },
      expect: { top: 'lowback/nslbp', not: ['lowback/radicular', 'lowback/stenosis'], route: 'results' } },
    { name: '2. Sciatica to the outer foot',
      lines: [['lowerback', 'hipR', 'kneeR', 'ankleR']],
      answers: { age: '30-49', onset: 'lift', duration: 'd6w', L1: ['belowknee'], L2: ['leg'],
        L3: ['pins', 'cough', 'bendsit'], L4: ['bendsit'] },
      expect: { top: 'lowback/radicular', not: ['lowback/stenosis', 'lowback/facet'], route: 'results' } },
    { name: '3. Spinal stenosis, walking brings on leg pain',
      lines: [['lowerback', 'hipL', 'kneeL']],
      answers: { age: 'o64', onset: 'gradual', duration: 'o3m', L1: ['belowknee'], L2: ['same'], L4: ['arch'], L5: ['claud'] },
      expect: { top: 'lowback/stenosis', notTop: ['lowback/radicular'], route: 'results' } },
    { name: '4. Saddle numbness (cauda equina)',
      lines: [['lowerback'], ['hipL'], ['hipR']],
      focus: 'lowback',
      answers: { age: '30-49', onset: 'lift', duration: 'd2w' },
      flags: ['rf-saddle'],
      expect: { route: 'emergency' } },
    { name: '5. Young athlete, arching hurts (spondylolysis)',
      lines: [['lowerback']],
      answers: { age: 'u18', onset: 'gradual', duration: 'd6w', L1: ['back'], L4: ['arch'], L6: ['centre'], L8: ['arching'] },
      flags: ['rf-spondy'],
      expect: { route: 'urgent' } },
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
  // A flag shared with a neighbouring area (same `group`) is shown once, in
  // the wording of the area that was drawn, so that one counts as ticked.
  const offered = regionRedFlags(flowZ, zones)
  const allFlags = Object.values(REGIONS).flatMap((r) => r.redFlags)
  const onScreen = (id) => {
    const f = allFlags.find((x) => x.id === id)
    return offered.find((o) => o.id === id || (f && f.group && o.group === f.group))
  }
  for (const id of t.flags || []) if (!onScreen(id)) return { ...seen, error: `flag ${id} is not on the safety screen` }
  const tiers = (t.flags || []).map((id) => onScreen(id).tier)
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
