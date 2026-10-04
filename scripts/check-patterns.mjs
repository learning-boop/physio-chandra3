/* Scenario checks for the pattern logic: line detection, referral patterns,
   pain type, SIN, yellow flags and the pattern-triggered safety questions.
   Pure data in, expected result out - no browser needed.

   Run: npm run check:patterns  */
import { pathToFileURL } from 'node:url'
const root = process.argv[2] || process.cwd()
const imp = (p) => import(pathToFileURL(root + '/' + p).href)
const { detectReferral, flowZones, drawnAnswers } = await imp('src/data/referral.js')
const { questionRegions, needsAreaChoice, rankAcross } = await imp('src/data/assessmentFlow.js')
const { REGIONS } = await imp('src/data/symptomGuide.js')
const { classifyPainMechanism } = await imp('src/data/painType.js')
const { interpretBehaviour } = await imp('src/data/painBehaviour.js')
const { interpretPsychosocial } = await imp('src/data/psychosocial.js')

let pass = 0, fail = 0
const check = (name, ok, got) => { ok ? pass++ : fail++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  → got ' + JSON.stringify(got)}`) }
const TYPES = { neck: 'neck', ctj: 'ctj', upperback: 'upperback', lowerback: 'lowerback' }
const zonesOf = (lines) => {
  const seen = new Set(); const out = []
  for (const ids of lines) for (const id of ids) if (!seen.has(id)) { seen.add(id); out.push({ id, type: TYPES[id] || id.replace(/[LR]$/, ''), label: id }) }
  return out
}

// ── 1. Line detection: old 22% rule vs new run rule (same code as Body3D detect) ──
const seq = [...Array(8).fill('neck'), ...Array(25).fill('shoulderL'), ...Array(30).fill('elbowL'), ...Array(37).fill('wristL')]
const oldRule = (ids) => { const c = {}; ids.forEach((i) => c[i] = (c[i] || 0) + 1); const m = Math.max(2, Math.ceil(ids.length * 0.22)); return [...new Set(ids.filter((i) => c[i] >= m))] }
const newRule = (ids) => { const minRun = Math.max(3, Math.ceil(ids.length * 0.06)); const out = []; let i = 0
  while (i < ids.length) { let j = i; while (j + 1 < ids.length && ids[j + 1] === ids[i]) j++; if (j - i + 1 >= minRun && !out.includes(ids[i])) out.push(ids[i]); i = j + 1 } return out }
check('old rule DROPPED the neck on a neck→fingertip line (the bug)', !oldRule(seq).includes('neck'), oldRule(seq))
check('new rule keeps neck, shoulder, elbow, wrist in order', JSON.stringify(newRule(seq)) === '["neck","shoulderL","elbowL","wristL"]', newRule(seq))
const graze = [...Array(40).fill('shoulderL'), 'chest', 'chest', ...Array(40).fill('elbowL')]
check('a 2-point graze across the chest is still ignored', !newRule(graze).includes('chest'), newRule(graze))

// ── 2. Neck → fingertips, one continuous line ──
{
  const lines = [['neck', 'shoulderL', 'elbowL', 'wristL']]
  const zones = zonesOf(lines)
  const ref = detectReferral(lines)
  check('neck→hand line detected as arm referral reaching the hand', ref.length === 1 && ref[0].kind === 'arm' && ref[0].reach === 'wrist' && ref[0].side === 'left', ref)
  const fz = flowZones(zones, ref)
  const keys = questionRegions(fz, null)
  check('questions come from the NECK and BASE OF NECK only (not shoulder/elbow/wrist)', JSON.stringify(keys) === '["neck","ctj"]', keys)
  check('no "choose an area" screen', !needsAreaChoice(fz, null))
  const drawn = drawnAnswers(ref)
  check('drawing pre-answers N2 = ["past the elbow"] (as a multi-answer list)', JSON.stringify(drawn.N2) === '["pastelbow"]', drawn)
  const ranked = rankAcross(keys, { N2: [...drawn.N2, 'fingers'], N3: ['arm'], age: '50-64' })
  check('top result is cervical radiculopathy', ranked[0] && ranked[0].c.id === 'radic', ranked.map((x) => x.rk + '/' + x.c.id))
  const oldKeys = questionRegions(zones, null)
  console.log('      (before the fix the same line asked: ' + oldKeys.join(', ') + ')')
}

// ── 2b. Cervical radiculopathy document (v1.1, 28 Sep 2026) ──
{
  const { maxScores } = await imp('src/data/symptomGuide.js')
  const { referralMechanism } = await imp('src/data/referral.js')
  // The document's single-choice answers share an `excl` group in N2 and N3,
  // so only one of each counts: 16 from the document + 1 for weakness.
  check('radiculopathy ceiling is the document\'s 16 (+1 weakness), not the sum of every answer', maxScores(REGIONS.neck).radic === 17, maxScores(REGIONS.neck).radic)
  const arm = detectReferral([['neck', 'shoulderL', 'elbowL', 'wristL']])[0]
  check('burning, shooting arm pain reads the arm line as nerve pain', referralMechanism(arm, { N2: ['burning'] }) === 'radicular', referralMechanism(arm, { N2: ['burning'] }))
  check('tingling in the whole hand reads the arm line as nerve pain', referralMechanism(arm, { N2: ['wholehand'] }) === 'radicular')
  const keys = ['neck', 'ctj']
  const cord = rankAcross(keys, { age: '50-64', N9: ['bothhands'], N2: ['pastelbow', 'armworse', 'fingers', 'burning'], N3: ['arm'] })
  check('both hands numb overrides the radiculopathy score (document Q8)', !cord.some((x) => x.c.id === 'radic'), cord.map((x) => x.rk + '/' + x.c.id))
}

// ── 2c. Cervicogenic headache and upper neck pain documents (v1.0, 28 Sep 2026) ──
{
  const { maxScores } = await imp('src/data/symptomGuide.js')
  check('upper neck pain ceiling is the document\'s 12', maxScores(REGIONS.neck).upper === 12, maxScores(REGIONS.neck).upper)
  check('neck-related headache (head) ceiling is 15, so it shows from 6, the document\'s line', maxScores(REGIONS.head).cgh === 15, maxScores(REGIONS.head).cgh)
  const { locationAnswers, LOCATION_QUESTION_IDS } = await imp('src/data/drawnLocation.js')
  const neckAt = (fy, lx) => locationAnswers([{ id: 'neck', type: 'neck', at: { fy, az: 0.02, lx } }]).N13
  check('marked high on the back of the neck → base of the skull', String(neckAt(0.395, -0.06)) === 'skullbase', neckAt(0.395, -0.06))
  check('marked low on the back of the neck → middle or lower neck', String(neckAt(0.34, -0.06)) === 'lowerneck', neckAt(0.34, -0.06))
  check('front of the neck → no location answer', neckAt(0.395, 0.03) === undefined, neckAt(0.395, 0.03))
  check('N13 is still asked after the drawing answers it (it also asks about tenderness)', !LOCATION_QUESTION_IDS.has('N13'))
  const keys = ['neck']
  const r = rankAcross(keys, { age: '30-49', onset: 'gradual', N9: ['none'], N13: ['skullbase', 'tender'], N1: ['onestiff'], N4: ['onesided', 'movement', 'press'] })
  check('headache the main problem ranks neck-related headache above upper neck pain (document Q5)',
    r[0] && r[0].c.id === 'cheadache', r.map((x) => x.c.id))
}

// ── 2d. Cervical Neural Mechanosensitivity document (v1.0, approved 28 Sep 2026) ──
{
  const { maxScores } = await imp('src/data/symptomGuide.js')
  check('sensitive-nerve ceiling is the document\'s 12', maxScores(REGIONS.neck).neural === 12, maxScores(REGIONS.neck).neural)
  const n14 = REGIONS.neck.questions.find((q) => q.id === 'N14')
  check('an ache into the upper arm only does not open the nerve question', !n14.askIf({ ra: { N2: ['shoulderonly'] } }))
  check('tingling in one part of the hand opens it', n14.askIf({ ra: { N2: ['fingers'] } }))
}

// ── 3. Low back → foot ──
{
  const lines = [['lowerback', 'hipR', 'kneeR', 'ankleR']]
  const ref = detectReferral(lines)
  const fz = flowZones(zonesOf(lines), ref)
  check('low back→foot line detected as leg referral', ref.length === 1 && ref[0].kind === 'leg' && ref[0].reach === 'ankle', ref)
  check('questions come from the LOW BACK and the TL junction it implies (not hip/knee/ankle)', JSON.stringify(questionRegions(fz, null)) === '["tlj","lowback"]', questionRegions(fz, null))
  check('drawing pre-answers L1 = "below the knee"', JSON.stringify(drawnAnswers(ref).L1) === '["belowknee"]', drawnAnswers(ref))
}

// ── 4. Not referral ──
check('neck→shoulder only is NOT a referral line', detectReferral([['neck', 'shoulderL']]).length === 0)
check('separate marks on neck and wrist are NOT a referral line', detectReferral([['neck'], ['wristL']]).length === 0)
check('knee only is NOT a referral line', detectReferral([['kneeL']]).length === 0)
{
  const lines = [['neck', 'shoulderL', 'elbowL', 'wristL'], ['kneeR']]
  const fz = flowZones(zonesOf(lines), detectReferral(lines))
  const drawnFz = fz.filter((z) => !z.implied)
  check('neck→hand line + separate knee mark → choose between neck and knee', needsAreaChoice(fz, null) && JSON.stringify(drawnFz.map((z) => z.type)) === '["neck","knee"]', drawnFz.map((z) => z.type))
  check('choosing the neck also asks the base of the neck the line implies', JSON.stringify(questionRegions(fz, 'neck')) === '["neck","ctj"]', questionRegions(fz, 'neck'))
  check('choosing the knee asks the knee only', JSON.stringify(questionRegions(fz, 'knee')) === '["knee"]', questionRegions(fz, 'knee'))
}

// ── 5. Pain type ──
{
  const lines = [['lowerback', 'hipL', 'kneeL', 'ankleL']]
  const pt = classifyPainMechanism({ zones: zonesOf(lines), referral: detectReferral(lines),
    answers: { painQuality: ['burning', 'tingling'], easing: ['Lying down or resting'], sinSettle: 'hours', duration: 'd6w' } })
  check('sciatica pattern → nerve-related', pt && pt.primary === 'neuropathic', pt)
  const k = classifyPainMechanism({ zones: zonesOf([['kneeL']]), referral: [],
    answers: { painQuality: ['sharp'], easing: ['Rest and elevation'], sinSettle: 'minutes', pattern24: ['none'] } })
  check('local knee pain → tissue-related', k && k.primary === 'nociceptive', k)
  const w = classifyPainMechanism({ zones: zonesOf([['neck'], ['lowerback'], ['kneeL'], ['kneeR']]), referral: [],
    answers: { duration: 'o3m', easing: ['none'], sinSettle: 'constant', sinSeverity: 'severe', yfMood: 'agree', yfSleep: 'agree', yfOutlook: 'agree' },
    behaviour: { irritability: 'severe' } })
  check('widespread, >3 months, nothing eases → sensitised', w && w.primary === 'nociplastic', w)
  const acute = classifyPainMechanism({ zones: zonesOf([['neck'], ['lowerback'], ['kneeL'], ['kneeR']]), referral: [],
    answers: { duration: 'd2w', easing: ['none'], sinSettle: 'constant', yfMood: 'agree', yfSleep: 'agree', yfOutlook: 'agree' } })
  check('same picture under 2 weeks is NEVER called sensitised', !acute || (acute.primary !== 'nociplastic' && acute.secondary !== 'nociplastic'), acute)
}

// ── 6. Behaviour (SIN) and yellow flags ──
{
  // Irritability on the three Maitland dimensions: provocation, severity,
  // persistence (CPA Orthopaedic Division subjective framework).
  const hi = interpretBehaviour({ sinSeverity: 'severe', sinProvoke: 'light', sinSettle: 'nextday', pattern24: ['nightWake'], easing: ['none'] })
  check('little activity + severe + settles next day → SEVERE irritability', hi.irritability === 'severe', hi.irritability)
  // B1 (shorter questionnaire, 28 Sep 2026): graded on severity and settling time.
  check('the grade is justified by two pieces of the patient\'s own evidence', hi.evidence.length === 2 && /Severe at worst/.test(hi.evidence[0]), hi.evidence)
  check('severe irritability limits the first physical examination', /brief and limited/.test(hi.examCaution || ''), hi.examCaution)
  check('nothing eases + wakes at night → night red flag raised for confirmation', hi.nightConcern === true)
  const lo = interpretBehaviour({ sinSeverity: 'mild', sinProvoke: 'heavy', sinSettle: 'minutes', pattern24: ['amShort'], easing: ['Rest'] })
  check('heavy activity only + mild + settles in minutes → MILD irritability', lo.irritability === 'mild' && !lo.nightConcern, lo.irritability)
  check('mild irritability allows a full examination', /full examination/.test(lo.examCaution || ''), lo.examCaution)
  const mid = interpretBehaviour({ sinSeverity: 'moderate', sinProvoke: 'normal', sinSettle: 'hours', pattern24: ['pm'], easing: ['Heat packs'] })
  check('normal activity + moderate + hours to settle → MODERATE irritability', mid.irritability === 'moderate', mid.irritability)

  const p = interpretPsychosocial({ yfFear: 'agree', yfOutlook: 'disagree', yfMood: 'agree', yfSleep: 'disagree', yfRoles: 'disagree' })
  check('mood "agree" → physician / 9-8-8 support note', p.moodSupport === true && p.level === 'moderate', p)
  const none = interpretPsychosocial({ yfFear: 'disagree', yfOutlook: 'disagree', yfMood: 'disagree', yfSleep: 'disagree', yfRoles: 'disagree' })
  check('all "disagree" → coping-well note only', none.level === 'low' && !none.moodSupport, none)
  // Blue / black / pink flags are recorded separately from the yellow ones.
  const colours = interpretPsychosocial({ yfFear: 'agree', yfMood: 'disagree', yfOutlook: 'disagree', yfSleep: 'disagree', yfRoles: 'disagree',
    bfWork: 'agree', kfClaim: 'agree', pfConfident: 'agree', pfExpect: 'agree' })
  check('work and claim answers are filed as blue and black flags',
    colours.flags.blue.length === 1 && colours.flags.black.length === 1, colours.flags)
  check('pink (protective) answers are recorded and do NOT raise the risk level',
    colours.flags.pink.length === 2 && colours.level === 'low', { pink: colours.flags.pink.length, level: colours.level })
}

// ── 7. Pattern-triggered safety checks (visceral / systemic maps) ──
{
  const { patternChecks, drawingShape } = await imp('src/data/patternChecks.js')
  const ids = (z, a = {}) => patternChecks(zonesOf([z]), a, 3).map((c) => c.id + ':' + c.tier)
  check('chest mark → cardiac question at EMERGENCY tier', ids(['chest']).includes('pc-cardiac:emergency'), ids(['chest']))
  check('left arm mark → cardiac question', ids(['shoulderL', 'elbowL']).includes('pc-cardiac:emergency'), ids(['shoulderL', 'elbowL']))
  check('plain neck mark does NOT ask the cardiac question', !ids(['neck']).some((x) => x.startsWith('pc-cardiac')), ids(['neck']))
  check('right shoulder → organ-referral question (gallbladder map)', ids(['shoulderR']).includes('pc-visceral:urgent'), ids(['shoulderR']))
  check('low back → flank-to-groin / urinary question', ids(['lowerback']).includes('pc-urinary:urgent'), ids(['lowerback']))
  check('both wrists → glove-and-stocking question', ids(['wristL', 'wristR']).includes('pc-polyneuropathy:urgent'), ids(['wristL', 'wristR']))
  check('both knees + long morning stiffness → inflammatory question',
    ids(['kneeL', 'kneeR'], { pattern24: ['amLong'] }).includes('pc-inflammatory:urgent'), ids(['kneeL', 'kneeR'], { pattern24: ['amLong'] }))
  check('both knees WITHOUT long morning stiffness → no inflammatory question',
    !ids(['kneeL', 'kneeR']).some((x) => x.startsWith('pc-inflammatory')), ids(['kneeL', 'kneeR']))
  check('whole left leg → limb colour/swelling question', ids(['hipL', 'kneeL', 'ankleL']).includes('pc-limb:urgent'), ids(['hipL', 'kneeL', 'ankleL']))
  check('dizzy since a head injury → see-a-doctor-today confirmation in the final check',
    ids(['head'], { D8: ['dizzy'] }).includes('pc-trauma5d:urgent'), ids(['head'], { D8: ['dizzy'] }))
  check('head injury without dizziness → no trauma confirmation',
    !ids(['head'], { D8: ['foggy'] }).some((x) => x.startsWith('pc-trauma5d')), ids(['head'], { D8: ['foggy'] }))
  check('dizziness ticked on the neck → heart (911) and ear/worsening (doctor today) checks',
    ids(['neck'], { N9: ['dizzy'] }).includes('pc-dizzy-heart:emergency') && ids(['neck'], { N9: ['dizzy'] }).includes('pc-dizzy-doctor:urgent'),
    ids(['neck'], { N9: ['dizzy'] }))
  check('headaches reported on the neck → headache red flags in the final check (same day)',
    ids(['neck'], { N4: ['onesided'] }).includes('pc-headache:urgent'), ids(['neck'], { N4: ['onesided'] }))
  check('no headaches → no headache check', !ids(['neck'], { N4: ['none'] }).some((x) => x.startsWith('pc-headache')), ids(['neck'], { N4: ['none'] }))
  check('head drawn too → its own safety pages ask these, so no headache check',
    !patternChecks(zonesOf([['neck', 'head']]), { N4: ['onesided'] }, 3).some((c) => c.id === 'pc-headache'))
  // "Cervicogenic Headache" and "Upper Cervical Pain" documents (v1.0, 28 Sep 2026).
  check('neck-type headache on the head, neck not drawn → upper-neck instability check',
    ids(['head'], { D1: ['sameside'] }).includes('pc-upperinstab:urgent'), ids(['head'], { D1: ['sameside'] }))
  check('neck drawn too → its safety pages ask it, so no instability check',
    !patternChecks(zonesOf([['neck', 'head']]), { D1: ['sameside'] }, 3).some((c) => c.id === 'pc-upperinstab'))
  check('tension-type answers → no instability check', !ids(['head'], { D1: ['band'] }).some((x) => x.startsWith('pc-upperinstab')))
  check('neck pain over 50 → polymyalgia / giant cell arteritis check (same day)',
    ids(['neck'], { age: 'a50' }).includes('pc-over50stiff:urgent'), ids(['neck'], { age: 'a50' }))
  check('neck pain under 50 → no polymyalgia check', !ids(['neck'], { age: 'a30' }).some((x) => x.startsWith('pc-over50stiff')))
  check('over 50 with headaches → the headache check covers it, asked once',
    !ids(['neck'], { age: 'o64', N4: ['onesided'] }).some((x) => x.startsWith('pc-over50stiff')), ids(['neck'], { age: 'o64', N4: ['onesided'] }))
  check('neck without dizziness → no dizziness checks',
    !ids(['neck'], { N9: ['none'] }).some((x) => x.startsWith('pc-dizzy')), ids(['neck'], { N9: ['none'] }))
  check('one knee only → no pattern questions at all', patternChecks(zonesOf([['kneeL']]), {}, 3).length === 0, ids(['kneeL']))
  check('at most 2 pattern questions are added', patternChecks(zonesOf([['chest', 'shoulderL', 'abdomen', 'lowerback']]), {}, 2).length <= 2)
  const shape = drawingShape(zonesOf([['neck', 'shoulderL', 'elbowL'], ['kneeR']]), [['neck', 'shoulderL', 'elbowL'], ['kneeR']])
  check('drawing shape: 4 regions, crosses midline, has a line', shape.regions === 4 && shape.crossesMidline && shape.linear && shape.widespread, shape)
}

// ── 8. Front / back surface, and the 2a vs 2b split ──
{
  const { patternChecks } = await imp('src/data/patternChecks.js')
  const { referralMechanism, referralSummary } = await imp('src/data/referral.js')
  const faced = (id, face) => [{ id, type: id.replace(/[LR]$/, ''), label: id, face }]
  const ids = (z, a = {}) => patternChecks(z, a, 3).map((c) => c.id)
  check('BACK of the knee → calf clot (DVT) question', ids(faced('kneeL', 'back')).includes('pc-dvt'), ids(faced('kneeL', 'back')))
  check('FRONT of the knee → no DVT question', !ids(faced('kneeL', 'front')).includes('pc-dvt'), ids(faced('kneeL', 'front')))

  const armLine = { kind: 'arm', region: 'neck', reach: 'wrist', felt: ['shoulderL', 'elbowL', 'wristL'], side: 'left' }
  const armShort = { ...armLine, reach: 'elbow', felt: ['shoulderL', 'elbowL'] }
  check('burning into the hand → nerve-type (radicular)', referralMechanism(armLine, { painQuality: ['burning'] }) === 'radicular')
  check('neck answer "pins and needles in particular fingers" → nerve-type', referralMechanism(armLine, { N2: ['fingers'] }) === 'radicular')
  check('dull ache, no nerve symptoms, not past the elbow → referred ache (somatic)',
    referralMechanism(armShort, { painQuality: ['ache'] }) === 'somatic')
  check('reaches the hand but no nerve symptoms → left unclear, not called nerve pain',
    referralMechanism(armLine, { painQuality: ['ache'] }) === 'unclear')
  const somaticCard = referralSummary(armShort, 'somatic')
  check('somatic card says "referred ache" and explicitly rules the nerve out',
    /referred ache/.test(somaticCard.title) && /rather than from a nerve/.test(somaticCard.text)
    && !/irritated nerve/.test(somaticCard.text), somaticCard.title)
  check('radicular card DOES name the nerve', /nerve-type pain/.test(referralSummary(armLine, 'radicular').title))

  const { classifyPainMechanism } = await imp('src/data/painType.js')
  const zonesArm = [{ id: 'neck', type: 'neck' }, { id: 'shoulderL', type: 'shoulder' }, { id: 'elbowL', type: 'elbow' }]
  const somaticType = classifyPainMechanism({ zones: zonesArm, referral: [armShort],
    answers: { painQuality: ['ache'], easing: ['Heat packs'], sinSettle: 'hours', pattern24: ['pm'] } })
  check('referred ache down the arm reads as TISSUE-related, not nerve', somaticType && somaticType.primary === 'nociceptive' && somaticType.secondary !== 'neuropathic', somaticType)
  const radicType = classifyPainMechanism({ zones: zonesArm, referral: [armLine],
    answers: { painQuality: ['burning', 'tingling'], easing: ['Heat packs'], sinSettle: 'hours' } })
  check('same line WITH burning and tingling reads as nerve-related', radicType && radicType.primary === 'neuropathic', radicType)
}

// ── 9. The surface test itself, lifted from Body3D.jsx ──
{
  const fs = await import('node:fs')
  const src = fs.readFileSync(root + '/src/components/Body3D.jsx', 'utf8')
  const grab = (re) => (src.match(re) || [''])[0]
  const code = [
    grab(/const FRONT_SIGN = [^\n]+/), grab(/const ARM_SPLIT = [^\n]+/), grab(/const NECK_SPLIT = [^\n]+/), grab(/const CTJ_BOTTOM = [^\n]+/), grab(/const TLJ_TOP = [^\n]+/), grab(/const TLJ_BOTTOM = [^\n]+/), grab(/const SIJ_TOP = [^\n]+/), grab(/const COCCYX_TOP = [^\n]+/), grab(/const COCCYX_BOTTOM = [^\n]+/), grab(/const COCCYX_HALF = [^\n]+/), grab(/const JAW_TOP = [^\n]+/), grab(/const UPPERARM_BOTTOM = [^\n]+/), grab(/const ELBOW_BOTTOM = [^\n]+/), grab(/const FOREARM_BOTTOM = [^\n]+/), grab(/const WRIST_BOTTOM = [^\n]+/), grab(/const THIGH_TOP_FRONT = [^\n]+/), grab(/const THIGH_TOP_BACK = [^\n]+/), grab(/const KNEE_TOP = [^\n]+/), grab(/const KNEE_BOTTOM = [^\n]+/), grab(/const ANKLE_TOP = [^\n]+/), grab(/const SOLE_TOP = [^\n]+/), grab(/const FOOT_FRONT = [^\n]+/), grab(/const ARCH_TOP = [^\n]+/), grab(/const HEEL_FRONT = [^\n]+/), grab(/const armBand = [^\n]+/),
    'const BODY_METRICS = { h: 1, cx: 0, cy: 0, cz: 0 }',
    grab(/function classify\(wx, wy, wz\) \{[\s\S]*?\n\}/),
    grab(/function surfaceOf\(wx, wy, wz\) \{[\s\S]*?\n\}/),
    'return { classify, surfaceOf }',
  ].join('\n')
  const { classify, surfaceOf } = new Function(code)()
  // x = front(+)/back(−), y = height (−0.5 feet … +0.5 head), z = left(−)/right(+)
  check('a point on the FRONT of the knee reads front', surfaceOf(0.05, -0.2, -0.07) === 'front')
  check('a point BEHIND the knee reads back', surfaceOf(-0.08, -0.2, -0.07) === 'back')
  check('both are still the same knee area', classify(0.05, -0.2, -0.07) === classify(-0.08, -0.2, -0.07), classify(-0.08, -0.2, -0.07))
  check('back of the shoulder is shoulder, not upper back', /^shoulder/.test(classify(-0.08, 0.25, 0.14)), classify(-0.08, 0.25, 0.14))
  check('the middle of the shoulder blade is still upper back', classify(-0.08, 0.22, 0.06) === 'upperback', classify(-0.08, 0.22, 0.06))
  check('the base of the neck from behind (C7–T3) is its own area', classify(-0.08, 0.30, 0.03) === 'ctj', classify(-0.08, 0.30, 0.03))
  check('where the ribs end, from behind (T10–L2), is its own area', classify(-0.08, 0.13, 0.03) === 'tlj', classify(-0.08, 0.13, 0.03))
  check('the side just below the ribs, from the front, is the flank', /^flank/.test(classify(0.08, 0.13, 0.07)), classify(0.08, 0.13, 0.07))
  check('the centre of the tummy is still the abdomen', classify(0.08, 0.13, 0.02) === 'abdomen', classify(0.08, 0.13, 0.02))
  check('the low back is still the low back', classify(-0.08, 0.05, 0.03) === 'lowerback', classify(-0.08, 0.05, 0.03))
  check('below the belt line, from behind (dimples, sacrum, buttocks), is the back of the pelvis', classify(-0.08, -0.02, 0.04) === 'sij', classify(-0.08, -0.02, 0.04))
  check('the midline where the buttock crease begins is the tailbone', classify(-0.08, -0.03, 0.01) === 'coccyx', classify(-0.08, -0.03, 0.01))
  check('the lower face in front of the ear is the jaw', /^jaw/.test(classify(0.02, 0.42, 0.05)), classify(0.02, 0.42, 0.05))
  check('the temple and forehead are still the head', classify(0.05, 0.47, 0.05) === 'head', classify(0.05, 0.47, 0.05))
  check('down the leg at the front: hip, thigh, knee',
    ['hip', 'thigh', 'knee'].every((t, i) => classify(0.05, [-0.02, -0.08, -0.2][i], 0.07).startsWith(t)),
    [-0.02, -0.08, -0.2].map((y) => classify(0.05, y, 0.07)))
  check('down the leg at the back: buttock, back of the thigh, knee',
    ['sij', 'thigh', 'knee'].every((t, i) => classify(-0.08, [-0.05, -0.09, -0.2][i], 0.07).startsWith(t)),
    [-0.05, -0.09, -0.2].map((y) => classify(-0.08, y, 0.07)))
  check('below the knee: lower leg, then the ankle',
    ['knee', 'lowerleg', 'ankle'].every((t, i) => classify(-0.02, [-0.2, -0.3, -0.45][i], 0.07).startsWith(t)),
    [-0.2, -0.3, -0.45].map((y) => classify(-0.02, y, 0.07)))
  check('the ankle bone and the back of the heel are the ankle; the top of the foot and the sole are the foot',
    [classify(-0.03, -0.45, 0.07), classify(-0.06, -0.47, 0.07), classify(0.05, -0.47, 0.07), classify(0.0, -0.49, 0.07)].join() === 'ankleR,ankleR,footR,footR',
    [classify(-0.03, -0.45, 0.07), classify(-0.06, -0.47, 0.07), classify(0.05, -0.47, 0.07), classify(0.0, -0.49, 0.07)])
  check('down the arm: upper arm, elbow, forearm, wrist, then hand',
    ['upperarm', 'elbow', 'forearm', 'wrist', 'hand'].every((t, i) => classify(0.02, [0.18, 0.11, 0.05, 0.02, -0.03][i], 0.16).startsWith(t)),
    [0.18, 0.11, 0.05, 0.02, -0.03].map((y) => classify(0.02, y, 0.16)))
  check('the nape is still the neck', classify(-0.08, 0.36, 0.03) === 'neck', classify(-0.08, 0.36, 0.03))
}

// ── 10. The reasoning pass: what it may and may not change ──
{
  const { sanitizeReview, applyReview } = await imp('api/_lib/painShared.js')
  const lb = REGIONS.lowback
  const matched = ['nslbp', 'facet', 'radicular']
    .map((id) => lb.conditions.find((c) => c.id === id))
    .filter(Boolean)
    .map((c) => ({ region: 'lowback', regionName: lb.name, c }))
  const ids = (list) => list.map((m) => m.c.id)
  check('test set-up: three real low-back conditions', matched.length === 3, ids(matched))

  const reorder = sanitizeReview({ review: { order: ['facet', 'nslbp', 'radicular'], drop: [], noMatch: false, concern: null } }, matched)
  check('reordering is accepted', JSON.stringify(ids(applyReview(matched, reorder))) === '["facet","nslbp","radicular"]', ids(applyReview(matched, reorder)))

  const dropOne = sanitizeReview({ review: { order: ['nslbp', 'facet'], drop: [{ id: 'radicular', why: 'no leg symptoms reported' }] } }, matched)
  check('dropping a pattern is accepted, with its reason', ids(applyReview(matched, dropOne)).join() === 'nslbp,facet' && dropOne.dropped[0].why === 'no leg symptoms reported', dropOne)

  const invented = sanitizeReview({ review: { order: ['nslbp', 'appendicitis', 'made-up-id'], drop: [{ id: 'cancer', why: 'x' }] } }, matched)
  check('an INVENTED condition id is ignored', JSON.stringify(invented.order) === '["nslbp"]' && invented.dropped.length === 0, invented)
  check('inventing does not drop the rest — they keep the rules order',
    ids(applyReview(matched, invented)).join() === 'nslbp,facet,radicular', ids(applyReview(matched, invented)))

  const none = sanitizeReview({ review: { order: [], drop: [], noMatch: true } }, matched)
  check('"none of these fit" is accepted and clears the list', none.noMatch && applyReview(matched, none).length === 0)
  const allDropped = sanitizeReview({ review: { drop: matched.map((m) => ({ id: m.c.id, why: 'no' })) } }, matched)
  check('dropping everything counts as "none fit"', allDropped.noMatch === true)

  const concern = sanitizeReview({ review: { order: ['nslbp'], concern: { why: 'The pain does not change with movement and comes with fever.' } } }, matched)
  check('a concern for medical review is kept', concern.concern && /fever/.test(concern.concern.why), concern.concern)
  const scary = sanitizeReview({ review: { order: ['nslbp'], concern: { why: 'This could be cancer — go to the emergency department.' } } }, matched)
  check('a concern naming a disease or an emergency is REJECTED', scary.concern === null, scary.concern)
  const safe = sanitizeReview({ review: { order: ['nslbp'], concern: { why: 'This is safe and not serious.' } } }, matched)
  check('a concern claiming something is safe is REJECTED', safe.concern === null, safe.concern)

  check('no review object → rules-only result stands', sanitizeReview({}, matched) === null)
  check('garbage review → rules-only result stands', sanitizeReview({ review: 'yes please' }, matched) === null)
  check('review is ignored when nothing matched', sanitizeReview({ review: { noMatch: true } }, []) === null)
  check('applyReview with no review returns the rules order', ids(applyReview(matched, null)).join() === 'nslbp,facet,radicular')
}

// ── 11. Tissue pain splits: mechanical vs inflammatory ──
{
  const { nociceptiveSubtype, classifyPainMechanism } = await imp('src/data/painType.js')
  check('worse after rest, eases with movement, long morning stiffness → inflammatory',
    nociceptiveSubtype({ pattern24: ['amLong', 'restWorse'] }) === 'inflammatory',
    nociceptiveSubtype({ pattern24: ['amLong', 'restWorse'] }))
  check('builds through the day, eased by position → mechanical',
    nociceptiveSubtype({ pattern24: ['pm'], easing: ['Lying down or resting'] }) === 'mechanical',
    nociceptiveSubtype({ pattern24: ['pm'], easing: ['Lying down or resting'] }))
  check('not enough to tell → no subtype claimed', nociceptiveSubtype({}) === null)
  const knee = classifyPainMechanism({ zones: zonesOf([['kneeL']]), referral: [],
    answers: { painQuality: ['ache'], pattern24: ['amLong', 'restWorse'], easing: ['Gentle movement'], sinSettle: 'hours' } })
  check('the result carries the subtype alongside the pain type',
    knee && knee.primary === 'nociceptive' && knee.subtype === 'inflammatory', knee)
}

// ── 12. The clinician summary ──
{
  const { buildClinicianSummary, supportingFindings, painAreas } = await imp('src/data/clinicianSummary.js')
  const { interpretBehaviour } = await imp('src/data/painBehaviour.js')
  const { interpretPsychosocial } = await imp('src/data/psychosocial.js')
  const { classifyPainMechanism } = await imp('src/data/painType.js')

  // A sciatica-shaped case, as the app would have it at the result screen.
  const lines = [['lowerback', 'hipL', 'kneeL', 'ankleL']]
  const zones = zonesOf(lines).map((z) => ({ ...z, face: 'back' }))
  const referral = detectReferral(lines)
  const answers = {
    age: '50-64', onset: 'lift', duration: 'o3m',
    L1: ['belowknee'], L2: ['leg'], L3: ['pins', 'cough'], L4: ['bendsit', 'arch'], L6: ['side'],
    painQuality: ['burning', 'tingling'], sinSeverity: 'severe', sinProvoke: 'light',
    sinSettle: 'nextday', pattern24: ['nightWake'], easing: ['Lying down or resting'],
    yfFear: 'agree', yfMood: 'agree', yfOutlook: 'disagree', yfSleep: 'agree', yfRoles: 'disagree',
    bfWork: 'agree', kfClaim: 'agree', pfConfident: 'disagree', pfExpect: 'agree',
  }
  const behaviour = interpretBehaviour(answers)
  const psych = interpretPsychosocial(answers)
  const painType = classifyPainMechanism({ zones, answers, behaviour, psych, referral })
  const ranked = rankAcross(['lowback'], answers)
  const text = buildClinicianSummary({
    zones, referral, keys: ['lowback'], answers, qaPairs: [
      { question: 'Your age?', answer: 'Over 50' },
      { question: 'How long has it been going on?', answer: 'More than 3 months' },
      { question: 'At its worst, how bad is the pain?', answer: 'Severe (7–10)' },
    ],
    ranked, behaviour, psych, painType,
    cautions: [{ text: 'Osteoporosis', why: { text: 'Loading is chosen more carefully.' } }],
    declinedFlags: ['Saddle numbness'], review: null, date: new Date('2026-09-23'),
  })

  check('summary names the pain areas as P1/P2/P3 with the surface', /P1: .*\(back surface\)/.test(text), painAreas(zones))
  check('summary records the referral line, and does not list the leg as a separate area',
    /Referred into the left leg, as far as the ankle/.test(text) && !/P2: Left Knee/.test(text), text.match(/BODY CHART[\s\S]{0,220}/)[0])
  check('summary grades irritability with its evidence', /Irritability: SEVERE/.test(text) && /Takes until the next day/.test(text))
  check('summary states the implication for the physical examination', /brief and limited/.test(text))
  check('summary lists the pain mechanisms with evidence', /Peripheral neuropathic/.test(text) && /dominant/.test(text))
  check('summary reports a mechanism with no evidence as such', /no supporting evidence in this screen/.test(text))
  check('summary separates yellow, blue, black and pink flags',
    /Yellow \(3\)/.test(text) && /Blue: My work/.test(text) && /Black: There is a claim/.test(text) && /Pink \(protective\): I expect/.test(text), text.match(/FLAGS[\s\S]{0,400}/)[0])
  check('summary lists cautions for the first examination', /CAUTIONS reported/.test(text) && /Osteoporosis/.test(text))
  check('summary states that red flags were denied', /Red flags: none reported/.test(text))
  check('summary gives hypotheses with supporting subjective findings',
    /H1: /.test(text) && /Below the knee, into the leg or foot/.test(text), text.match(/HYPOTHESES[\s\S]{0,400}/)[0])
  check('summary is capped at two hypotheses', /H2: /.test(text) && !/H3: /.test(text), text.match(/H\d: [^\n]*/g))
  check('summary adds examination considerations for nerve symptoms', /neurodynamic testing/.test(text))
  check('supporting findings come from answers that actually scored',
    supportingFindings('lowback', 'radicular', answers).length >= 3, supportingFindings('lowback', 'radicular', answers))

  const withReview = buildClinicianSummary({
    zones, referral, keys: ['lowback'], answers, qaPairs: [], ranked, behaviour, psych, painType,
    review: { order: ['radicular'], dropped: [{ id: 'nslbp', why: 'leg symptoms dominate' }], noMatch: false, concern: null, note: 'Radicular picture.' },
  })
  check('summary records what the AI reasoning pass changed',
    /AI reasoning pass: .*dropped nslbp \(leg symptoms dominate\)/.test(withReview), withReview.match(/AI reasoning pass[^\n]*/))
  check('summary never claims to be a diagnosis', /not a diagnosis/.test(text))
  const flagged = buildClinicianSummary({ zones, referral, keys: ['lowback'], answers, qaPairs: [], ranked, behaviour, psych, painType,
    reportedFlags: [{ text: 'Your calf is swollen, warm, and tender', why: 'Possible blood clot in the leg', sameDay: true }] })
  check('summary lists "see a doctor" flags the patient reported, same-day marked',
    /RED FLAGS REPORTED/.test(flagged) && flagged.includes('[SAME DAY] Your calf') && !/Red flags: none reported/.test(flagged))
}

// ── 12. Referral map (Referred Pain Clinical Reference) ──
{
  const fs = await import('node:fs')
  const { REFERRAL_MAP, organsForType } = await imp('src/data/referralMap.js')
  const { buildClinicianSummary } = await imp('src/data/clinicianSummary.js')
  const { parseZones, referralBackground, sanitizeReview } = await imp('api/_lib/painShared.js')
  const body = fs.readFileSync(root + '/src/components/Body3D.jsx', 'utf8')
  const types = [...new Set([...body.matchAll(/type: '([a-z]+)'/g)].map((m) => m[1]))]
  const missing = types.filter((t) => !REFERRAL_MAP[t])
  check('every body-map area has a referral-map entry', !missing.length, missing)
  check('left shoulder: spleen listed, gallbladder (right) left out',
    organsForType('shoulder', [{ id: 'shoulderL', type: 'shoulder' }]).some((o) => /Spleen/.test(o)) &&
    !organsForType('shoulder', [{ id: 'shoulderL', type: 'shoulder' }]).some((o) => /gallbladder/.test(o)))
  check('the heart stays listed on either side',
    organsForType('shoulder', [{ id: 'shoulderR', type: 'shoulder' }]).some((o) => /^Heart/.test(o)))
  const zones = [{ id: 'upperback', type: 'upperback', label: 'Mid Back' }]
  const text = buildClinicianSummary({ zones, keys: ['upperback'] })
  check('summary lists referral sources for the drawn area, with the screening sequence',
    /REFERRAL SOURCES TO CONSIDER/.test(text) && /Mid Back:/.test(text) && /gallbladder/.test(text) && /Screening sequence/.test(text))
  const { drawn } = parseZones([{ type: 'shoulder', label: 'Right Shoulder' }])
  check('the AI concern check is told which organs refer to the drawn area', /Liver \/ gallbladder/.test(referralBackground(drawn)) && !/Spleen/.test(referralBackground(drawn)))
  const matched = [{ region: 'upperback', regionName: 'Mid back', c: { id: 'stiffness' } }]
  const organ = sanitizeReview({ review: { order: ['stiffness'], concern: { why: 'This may come from the gallbladder.' } } }, matched)
  check('a concern naming an organ keeps its signal but not the organ', organ.concern && !/gallbladder/i.test(organ.concern.why), organ.concern)
}

// Injury screens down the arm: one shared opening question, no repeats.
{
  const { injuryFlow, injuryQuestion } = await import('../src/data/injuryScreen.js')
  const arm = ['shoulder', 'upperarm', 'elbow', 'forearm', 'wrist'].map((type) => ({ type }))
  const first = injuryFlow(arm, {}).next
  check('a whole-arm drawing asks one shared injury question first', first === 'limb:I1', first)
  const text = injuryQuestion('limb:I1', arm).q.text
  check('the shared question names each area and the longest look-back', text.includes('shoulder, upper arm, elbow, forearm, or wrist') && /6 weeks/.test(text), text)
  const walk = (a) => {
    const asked = []; let r
    while ((r = injuryFlow(arm, a)).next) {
      asked.push(r.next)
      const q = injuryQuestion(r.next, arm).q
      a[r.next] = (q.options.find((o) => !o.route) || q.options[0]).id
    }
    return { asked, route: r.route }
  }
  const no = walk({ 'limb:I1': 'no' })
  check('a "No" to the shared question ends every arm screen', no.asked.length === 0 && no.route === 'continue', no)
  const fall = walk({ 'limb:I1': 'fall', 'limb:I2': 'recent' })
  check('a question asked word for word by the upper arm is not asked again by the elbow or forearm',
    fall.asked.includes('arm:I3') && !fall.asked.includes('elbow:I3') && !fall.asked.includes('forearm:I3') && !fall.asked.includes('forearm:I6') && !fall.asked.some((k) => k.endsWith(':I1')), fall.asked)
  const older = walk({ 'limb:I1': 'fall', 'limb:I2': 'older' })
  check('an injury 2 to 6 weeks ago opens only the 6-week screens (shoulder, wrist, hand)', older.asked.every((k) => /^(shoulder|wrist|hand):/.test(k)), older.asked)
  const one = injuryFlow([{ type: 'elbow' }], {}).next
  check('an elbow on its own keeps its own opening question', one === 'elbow:I1', one)
}

// Answers are stored by question id, so two regions must never share one.
{
  const { REGIONS } = await import('../src/data/symptomGuide.js')
  const owner = {}, clash = []
  for (const [k, r] of Object.entries(REGIONS)) for (const q of r.questions) {
    if (owner[q.id] && owner[q.id] !== k) clash.push(`${q.id}: ${owner[q.id]} and ${k}`)
    owner[q.id] = k
  }
  check('no two regions share a question id', clash.length === 0, clash)
}

// Where in an area the marks sit (../src/data/drawnLocation.js).
{
  const { summarizeZone, locationAnswers, minorZoneIds } = await import('../src/data/drawnLocation.js')
  const { nextQuestion } = await import('../src/data/assessmentFlow.js')
  const spot = (fy, az, lx) => [-1, 0, 1].flatMap((i) => [-1, 0, 1].map((j) => ({ fy: fy + i * 0.003, az: az + j * 0.003, lx: lx + (i + j) * 0.002 })))
  const where = (type, pts) => locationAnswers([{ id: type + 'R', type, at: summarizeZone(type, pts) }])
  const cases = [
    ['back of the knee', 'knee', spot(-0.19, 0.068, -0.042), { K1: ['back'] }],
    ['inner side of the knee', 'knee', spot(-0.19, 0.036, 0.0), { K1: ['inner'] }],
    ['front of the knee, just below the kneecap', 'knee', spot(-0.21, 0.07, 0.03), { K1: ['below'] }],
    ['back of the lower leg, low down', 'lowerleg', spot(-0.385, 0.086, -0.055), { V1: ['achilles'] }],
    ['inner edge of the shin', 'lowerleg', spot(-0.3, 0.047, 0.0), { V1: ['medial'] }],
    ['inner ankle', 'ankle', spot(-0.43, 0.069, -0.02), { A1: ['inner'] }],
    ['sole under the forefoot', 'foot', spot(-0.49, 0.09, 0.07), { B1: ['ball'] }],
    ['thumb side of the wrist', 'wrist', spot(0.02, 0.228, 0.03), { W1: ['thumb'] }],
    ['inner side of the thigh', 'thigh', spot(-0.12, 0.022, 0.0), { R1: ['inner'] }],
  ]
  for (const [name, type, pts, want] of cases) {
    const got = where(type, pts)
    check('drawing answers the location: ' + name, JSON.stringify(got) === JSON.stringify(want), got)
  }
  // Marks all round the knee: no single location, so the question is asked.
  const around = [...spot(-0.19, 0.036, 0.0), ...spot(-0.19, 0.1, 0.0), ...spot(-0.19, 0.068, -0.042), ...spot(-0.19, 0.068, 0.03)]
  check('marks all round the knee answer no location', Object.keys(where('knee', around)).length === 0, where('knee', around))
  check('an area holding a sliver of the ink is minor', JSON.stringify([...minorZoneIds([{ id: 'elbowR', ink: 0.85 }, { id: 'forearmR', ink: 0.15 }])]) === '["forearmR"]')
  const first = nextQuestion(['elbow', 'forearm'], {}, [], 5, { draw: ['elbow', 'forearm'], all: {}, minor: new Set(['forearm']) })
  check('with the forearm only grazed, the elbow is asked first', /^E/.test(first), first)
  const asked = []; let id; const a = { K1: ['back'] }
  while ((id = nextQuestion(['knee'], a, asked, 5, { draw: ['knee'], all: {} }))) asked.push(id)
  check('a location the drawing answered is not asked again', !asked.includes('K1'), asked)
}

// ── 14. Shorter questionnaire (Chandra, 28 Sep 2026) ──
{
  const { regionRedFlags } = await imp('src/data/assessmentFlow.js')
  const { psychosocialQuestionsFor, skipPsychosocial, interpretPsychosocial } = await imp('src/data/psychosocial.js')
  const Z = (ids) => ids.map((id) => ({ id, type: id.replace(/[LR]$/, ''), label: id }))
  const flagsOf = (ids) => regionRedFlags(Z(ids), Z(ids))
  const neck = flagsOf(['neck'])
  // 6 since the spinal cord question was split into 911 and go-now halves (2 Oct 2026).
  check('A1: the neck emergency page has 6 questions', neck.filter((f) => f.tier === 'emergency').length === 6, neck.filter((f) => f.tier === 'emergency').map((f) => f.id))
  check('A2: the neck doctor page has 3 own questions (plus the general fever/cancer one = 4)', neck.filter((f) => f.tier !== 'emergency').length === 3, neck.filter((f) => f.tier !== 'emergency').map((f) => f.id))
  const nh = flagsOf(['neck', 'head']).map((f) => f.id)
  check('A1: neck + head asks the sudden headache and stroke signs once (the neck\'s merged question)',
    nh.includes('nrf-stroke') && !nh.includes('hrf-thunderclap') && !nh.includes('hrf-stroke') && !nh.includes('hrf-cad-severe') && !nh.includes('hrf-trauma5d'), nh)
  const arm = flagsOf(['shoulderR', 'elbowR', 'wristR', 'handR']).map((f) => f.id)
  check('A3.1: one hot-joint question across the arm', arm.filter((id) => /hot/.test(id)).length === 1, arm)
  check('A3.2: one gout question across the arm', arm.filter((id) => /gout/.test(id)).length === 1, arm)
  check('A3.4: one hand-weakness question across the arm', arm.filter((id) => /erf-nerve|wrf-numb|hnd-numb/.test(id)).length === 1, arm)
  check('A3.5: no separate arm cancer question (the general one covers it)', !arm.some((id) => /cancer/.test(id)), arm)
  const ns = flagsOf(['neck', 'shoulderR']).map((f) => f.id)
  check('A3.3: neck + shoulder asks the organ question once', ns.filter((id) => /tip|organ|gallbladder/.test(id)).length === 1, ns)
  check('C1: new, moderate pain gets the 5 yellow-flag statements and the off-work one', psychosocialQuestionsFor({ duration: 'd6w', sinSeverity: 'moderate' }).length === 6)
  check('C2: pain over 6 weeks, or severe, adds the work and outlook statements',
    psychosocialQuestionsFor({ duration: 'o3m', sinSeverity: 'mild' }).length === 9 && psychosocialQuestionsFor({ duration: 'd2w', sinSeverity: 'severe' }).length === 9)
  check('C3: the claim is no longer a statement, and still reaches the summary as a black flag',
    !psychosocialQuestionsFor({ duration: 'o3m' }).some((q) => q.id === 'kfClaim') && interpretPsychosocial({ yfFear: 'disagree', kfClaim: 'agree' }).flags.black.length === 1)
  check('C4: the screen is skipped only for pain under 2 weeks that is mild',
    skipPsychosocial({ duration: 'd2w', sinSeverity: 'mild' }) && !skipPsychosocial({ duration: 'd2w', sinSeverity: 'moderate' }) && !skipPsychosocial({ duration: 'd6w', sinSeverity: 'mild' }))
}

// ── 15. Areas the line only touched (Chandra, 28 Sep 2026: cautious option) ──
{
  const { regionRedFlags, regionRedFlagsFor } = await imp('src/data/assessmentFlow.js')
  const Z = (ids) => ids.map((id) => ({ id, type: id.replace(/[LR]$/, ''), label: id }))
  const all = Z(['wristR', 'forearmR'])
  const both = regionRedFlags(all, all)
  const wristOnly = regionRedFlags(Z(['wristR']), all)
  const cautious = regionRedFlagsFor(Z(['wristR']), all, Z(['forearmR']))
  // Each forearm emergency question is asked, or an asked question shares its group.
  const forearmEmergency = regionRedFlags(Z(['forearmR']), all).filter((f) => f.tier === 'emergency')
  const covered = (x) => cautious.some((f) => f.id === x.id ||
    (x.group && [].concat(f.group || []).some((g) => [].concat(x.group).includes(g))))
  check('a touched forearm left out: its emergency questions are still asked',
    forearmEmergency.every(covered), cautious.map((f) => f.id))
  check('a touched forearm left out: its doctor questions are not asked',
    !cautious.some((f) => f.tier !== 'emergency' && /^frf-/.test(f.id)), cautious.map((f) => f.id))
  check('left out, the safety pages are shorter than with both areas asked',
    cautious.length < both.length && cautious.length > wristOnly.length - 1, { both: both.length, cautious: cautious.length, wristOnly: wristOnly.length })
  check('emergency questions still come before doctor questions',
    cautious.findIndex((f) => f.tier !== 'emergency') > cautious.map((f) => f.tier).lastIndexOf('emergency'), cautious.map((f) => f.tier))
}

// ── 16. 911 or go to emergency now (Chandra, 2 Oct 2026; content/regions/_REVIEW-911-split.md) ──
{
  const { REGIONS } = await imp('src/data/symptomGuide.js')
  const { emergencyLevel } = await imp('src/data/emergencyAdvice.js')
  const { injuryFlow } = await imp('src/data/injuryScreen.js')
  const flags = Object.values(REGIONS).flatMap((r) => r.redFlags)
  const byId = Object.fromEntries(flags.map((f) => [f.id, f]))
  const em = flags.filter((f) => f.tier === 'emergency')
  check('911 split: 47 region flags call 911 (41 + the 4 leg-weakness halves + pregnancy bleeding + a dislocated hip replacement)',
    em.filter((f) => f.call911).length === 47, em.filter((f) => f.call911).map((f) => f.id))
  // 49: the base of the neck's recent-crash flag (ctj.md:34) is the neck injury screen, not a flag;
  // 54 since the compartment syndrome document added the ankle, foot, wrist
  // and hand compartment questions and the calf rhabdomyolysis one (2 Oct 2026).
  // 56 with the general dark-urine question on the shoulder and hip (2 Oct 2026).
  check('911 split: 56 region flags send the person to emergency now',
    em.filter((f) => !f.call911).length === 56, em.filter((f) => !f.call911).map((f) => f.id))
  check('911 split: call911 only on emergency-tier flags', !flags.some((f) => f.call911 && f.tier !== 'emergency'))
  // A shared group must lead to the same place in every area that asks it.
  const byGroup = {}
  em.forEach((f) => [].concat(f.group || []).forEach((g) => (byGroup[g] = byGroup[g] || []).push(f)))
  const mixed = Object.entries(byGroup).filter(([, fs]) => new Set(fs.map((f) => !!f.call911)).size > 1).map(([g]) => g)
  check('911 split: every shared group is all 911 or all go-now', !mixed.length, mixed)
  check('911 split: heart, stroke, lung clot and aorta call 911',
    ['nrf-cardiac', 'hrf-stroke', 'kf-pe', 'crf-aorta', 'rf-aaa', 'hrf-thunderclap'].every((id) => byId[id].call911))
  check('911 split: cauda equina, hot joint, compartment syndrome and fracture go now',
    ['rf-saddle', 'rf-bladder', 'kf-septic', 'lgf-compartment', 'rf-fracture'].every((id) => !byId[id].call911))
  check('911 split: emergencyLevel picks 911 over go-now, and go-now over labour',
    emergencyLevel([byId['rf-saddle'], byId['rf-aaa']]) === 'call911' &&
    emergencyLevel([byId['rf-saddle'], byId['prf-pregnancy']]) === 'goNow' &&
    emergencyLevel([byId['prf-pregnancy']]) === 'labour' &&
    emergencyLevel([{ tier: 'urgent' }]) === null)
  check('911 split: pregnancy bleeding is 911, waters or tightenings go to labour and delivery',
    byId['prf-pregnancy-bleed'].call911 && byId['prf-pregnancy'].goTo === 'labour' && !byId['prf-pregnancy'].call911)
  const Z = (ids) => ids.map((id) => ({ id, type: id.replace(/[LR]$/, ''), label: id }))
  const neckInjury = injuryFlow(Z(['neck']), { 'neck:I1': 'yes', 'neck:I2': 'h48', 'neck:I8': 'no', 'neck:I3': 'yes' })
  check('911 split: a high-risk neck injury in the last 48 hours calls 911', neckInjury.route === 'emergency' && neckInjury.call911, neckInjury)
  const thigh = injuryFlow(Z(['thigh']), { 'thigh:I1': 'fall', 'thigh:I2': 'yes' })
  check('911 split: a possible femur fracture calls 911', thigh.route === 'emergency' && thigh.call911, thigh)
  const { SCREENS } = await imp('src/data/injuryScreen.js')
  const injury911 = SCREENS.filter((sc) => !['neck', 'head'].includes(sc.id)).flatMap((sc) => sc.questions).flatMap((q) => q.options || []).filter((o) => o.call911).map((o) => o.why)
  check('911 split: in the limb injury screens only the hip, pelvis and femur fractures call 911', injury911.length === 3, injury911)
}

// ── 17. Head injury screen ("Concussion.docx" v1.0, 2 Oct 2026) ──
{
  const { injuryFlow } = await imp('src/data/injuryScreen.js')
  const { emergencyLevel } = await imp('src/data/emergencyAdvice.js')
  const { REGIONS } = await imp('src/data/symptomGuide.js')
  const head = [{ id: 'head', type: 'head', label: 'head' }]
  const run = (a) => injuryFlow(head, Object.fromEntries(Object.entries(a).map(([k, v]) => ['head:' + k, v])))
  const quiet = { I3: 'no', I4: 'no', I5: 'no', I6: 'no', I7: 'no', I8: 'no' }
  check('head screen: no injury skips it', run({ I1: 'no' }).route === 'continue')
  check('head screen: the first 3 days asks the emergency questions', run({ I1: 'yes', I2: 'h72' }).next === 'head:I3')
  check('head screen: after 4 weeks the emergency questions are not asked', run({ I1: 'yes', I2: 'o4w' }).next === 'head:I8')
  const early = run({ I1: 'yes', I2: 'h72', ...quiet, I10: 'no' })
  check('head screen: first 3 days, no doctor → doctor today, no booking', early.route === 'urgent' && early.sameDay && early.noBooking, early)
  const unsureWhen = run({ I1: 'yes', I2: 'unsure', ...quiet, I10: 'no' })
  check('head screen: not sure when, no doctor → treated as recent', unsureWhen.noBooking === true, unsureWhen)
  const later = run({ I1: 'yes', I2: 'w4', I8: 'no', I9: 'no', I10: 'no' })
  check('head screen: later, no doctor → see your doctor, booking offered', later.route === 'urgent' && !later.noBooking && !later.sameDay, later)
  check('head screen: seen by a doctor → on to the questions', run({ I1: 'yes', I2: 'w4', I8: 'no', I9: 'no', I10: 'confirmed' }).route === 'continue')
  const seizure = run({ I1: 'yes', I2: 'h72', I3: 'yes' })
  check('head screen: a seizure or passing out → 911', seizure.route === 'emergency' && seizure.call911, seizure)
  const neckInj = run({ I1: 'yes', I2: 'h72', I3: 'no', I4: 'no', I5: 'yes' })
  check('head screen: severe midline neck pain → 911, keep the neck still', neckInj.call911 && neckInj.keepNeckStill, neckInj)
  const thinner = run({ I1: 'yes', I2: 'h72', I3: 'no', I4: 'no', I5: 'no', I6: 'yes' })
  check('head screen: blood thinner → emergency department today, not 911',
    thinner.route === 'emergency' && !thinner.call911 && emergencyLevel([thinner]) === 'goNow', thinner)
  const crisis = run({ I1: 'yes', I2: 'o4w', I8: 'yes' })
  check('head screen: thoughts of self-harm → the 9-8-8 screen', emergencyLevel([crisis]) === 'crisis', crisis)
  check('head: the old "knock in the last 4 weeks" flag is gone (the screen replaces it)',
    !REGIONS.head.redFlags.some((f) => f.id === 'hrf-concussion'))
  const conc = REGIONS.head.conditions.find((c) => c.id === 'concussion')
  check('concussion: only after a knock', conc && JSON.stringify(conc.gates) === JSON.stringify({ requiresOnset: ['knock'] }), conc && conc.gates)
}

// ── 18. Axial spondyloarthritis safety checks; pattern checks keep call911 ──
{
  const { patternChecks } = await imp('src/data/patternChecks.js')
  const { emergencyLevel } = await imp('src/data/emergencyAdvice.js')
  const Z = (ids) => ids.map((id) => ({ id, type: id.replace(/[LR]$/, ''), label: id }))
  const asFx = patternChecks(Z(['lowerback']), { L9: ['diagnosed'] }, 7).find((p) => p.id === 'pc-as-fracture')
  check('axSpA: known AS asks about a fall or jolt, and a yes calls 911 with the neck kept still',
    asFx && emergencyLevel([asFx]) === 'call911' && asFx.keepNeckStill, asFx)
  check('axSpA: inflammatory features ask about a painful red eye (doctor today)',
    patternChecks(Z(['sij']), { P6: ['morning'] }, 7).some((p) => p.id === 'pc-uveitis' && p.sameDay))
  check('axSpA: onset before 40 alone does not ask about the eye',
    !patternChecks(Z(['lowerback']), { L9: ['before40'] }, 7).some((p) => p.id === 'pc-uveitis'))
  const cardiac = patternChecks(Z(['chest']), {}, 7).find((p) => p.id === 'pc-cardiac')
  check('911 split: the heart pattern check keeps call911 (fixed 2 Oct 2026)', cardiac && emergencyLevel([cardiac]) === 'call911', cardiac)
}

// ── 19. CRPS: one question shared by the wrist, hand, ankle and foot ──
{
  const { REGIONS } = await imp('src/data/symptomGuide.js')
  const { nextQuestion, regionAnswers } = await imp('src/data/assessmentFlow.js')
  const { patternChecks } = await imp('src/data/patternChecks.js')
  const twins = ['wrist', 'hand', 'ankle', 'foot'].map((k) => REGIONS[k].questions.find((q) => q.same === 'crps'))
  check('CRPS: the four twin questions exist with identical options',
    twins.every(Boolean) && new Set(twins.map((q) => JSON.stringify(q.options.map((o) => o.label)))).size === 1, twins.map((q) => q && q.id))
  const keys = ['wrist', 'hand']
  const ans = { age: 'a50', 'onset@wrist': 'fall', 'onset@hand': 'injury', duration: 'd3m' }
  const asked = []
  let id
  while ((id = nextQuestion(keys, ans, asked, 5))) { asked.push(id); if (id === 'W9' || id === 'H9') ans[id] = ['trigger', 'colour'] }
  check('CRPS: a hand-and-wrist drawing asks the question once', asked.filter((x) => x === 'W9' || x === 'H9').length === 1, asked)
  const asked1 = asked.find((x) => x === 'W9' || x === 'H9'), other = asked1 === 'W9' ? 'H9' : 'W9'
  check('CRPS: the other area reads that answer as its own',
    JSON.stringify(regionAnswers(keys, other === 'W9' ? 'wrist' : 'hand', ans)[other]) === JSON.stringify(['trigger', 'colour']))
  const Z = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
  check("Dupuytren's: after a procedure, asks about infection, numbness or a finger that will not bend (doctor today)",
    patternChecks(Z(['handR']), { H2: ['procedure'] }, 7).some((p) => p.id === 'pc-hand-procedure' && p.sameDay))
  {
    const { regionRedFlags } = await imp('src/data/assessmentFlow.js')
    const ZZ = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
    const ids = (z) => regionRedFlags(ZZ(z), ZZ(z)).map((f) => f.id)
    const comp = (z) => ids(z).filter((x) => /compartment/.test(x))
    check('compartment syndrome: asked for an ankle, foot, wrist or hand drawn on its own',
      ['ankleR', 'footR', 'wristR', 'handR'].every((z) => comp([z]).length === 1), ['ankleR', 'footR', 'wristR', 'handR'].map((z) => comp([z])))
    check('compartment syndrome: a lower leg, ankle and foot drawing asks it once; a forearm, wrist and hand drawing once',
      comp(['lowerlegR', 'ankleR', 'footR']).length === 1 && comp(['forearmR', 'wristR', 'handR']).length === 1)
    const legs = REGIONS.leg.redFlags.find((f) => f.id === 'lgf-compartment')
    check('compartment syndrome: goes to an emergency department now, and asks about pain relief no longer helping',
      legs.tier === 'emergency' && !legs.call911 && /pain relief/.test(legs.text))
    const cast = REGIONS.wrist.redFlags.find((f) => f.id === 'wrf-cast')
    check('compartment syndrome: a cast getting tighter is a same-day check, not cut off at home', cast && cast.sameDay && /do not cut/.test(cast.text))
  }
  {
    const ZN = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
    const neuro = patternChecks(ZN(['lowerlegR']), { painQuality: ['tingling'] }, 7).find((p) => p.id === 'pc-neuro')
    check('nervous-system screen: pins and needles asks about vision, Lhermitte, heat and past episodes; a yes holds the booking (doctor in a few days)',
      neuro && neuro.noBooking && !neuro.sameDay && !/multiple sclerosis|MS/i.test(neuro.text + neuro.why.text), neuro)
    check('nervous-system screen: not asked without pins and needles or numbness',
      !patternChecks(ZN(['lowerlegR']), { painQuality: ['dull'] }, 7).some((p) => p.id === 'pc-neuro'))
  }
  check('CRPS: after an injury or operation, asks about a wound infection (doctor today)',
    patternChecks(Z(['wristR']), { W9: ['trigger'] }, 7).some((p) => p.id === 'pc-crps-infection' && p.sameDay))
}

// ── 20. Ottawa ankle and foot rules in full; the Canadian C-Spine Rule's limits ──
{
  const { injuryFlow, ANKLE_INJURY, FOOT_INJURY } = await imp('src/data/injuryScreen.js')
  const Z = (ids) => ids.map((id) => ({ id, type: id.replace(/[LR]$/, ''), label: id }))
  const pts = ANKLE_INJURY.find((q) => q.id === 'I8')
  check('Ottawa: the ankle and foot screens ask the same bone-tenderness question (asked once when both apply)',
    pts && FOOT_INJURY.find((q) => q.id === 'I8').text === pts.text && /OUTER/.test(pts.text) && /INNER/.test(pts.text) && /outer edge of your foot/.test(pts.text))
  const both = { 'ankle:I1': 'inversion', 'ankle:I2': 'no', 'ankle:I3': 'no', 'ankle:I4': 'no', 'ankle:I8': 'no', 'ankle:I6': 'no', 'ankle:I7': 'no', 'foot:I1': 'twist', 'foot:I2': 'no', 'foot:I5': 'no' }
  const r = injuryFlow(Z(['ankleR', 'footR']), both)
  check('Ottawa: an ankle and foot drawing does not ask the tenderness or 4-steps question twice', r.route === 'continue', r)
  const tender = injuryFlow(Z(['ankleR']), { 'ankle:I1': 'inversion', 'ankle:I2': 'no', 'ankle:I3': 'no', 'ankle:I4': 'no', 'ankle:I8': 'cannot' })
  check('Ottawa: too painful to press counts as tender (X-ray the same day)', tender.route === 'urgent' && tender.sameDay, tender)
  const stub = injuryFlow(Z(['footR']), { 'foot:I1': 'stub', 'foot:I2': 'no', 'foot:I4': 'no', 'foot:I5': 'no' })
  check('Ottawa: not asked after a stubbed toe (outside the rule)', stub.next === 'foot:I7', stub)
  const neck = (a, age) => injuryFlow(Z(['neck']), Object.fromEntries(Object.entries(a).map(([k, v]) => ['neck:' + k, v])), age)
  check('C-Spine Rule: alertness, intoxication and distracting injury are asked first',
    neck({ I1: 'vehicle', I2: 'h48' }).next === 'neck:I8')
  const drunk = neck({ I1: 'vehicle', I2: 'h48', I8: 'yes' })
  check('C-Spine Rule: not alert within 48 hours is 911, neck kept still', drunk.route === 'emergency' && drunk.call911, drunk)
  const teen = neck({ I1: 'sport', I2: 'd7', I8: 'no', I4: ['none'], I5: 'no' }, 'u18')
  check('C-Spine Rule: under 18 with no high-risk feature sees a doctor the same day (the rule is for adults)', teen.route === 'urgent' && teen.sameDay, teen)
  const conc = neck({ I1: 'vehicle', I2: 'd7', I8: 'no', I3: 'no', I4: ['none'], I5: 'no', I9: 'yes' })
  check('Concussion: 2 to 7 days after a crash, concussion symptoms see a doctor', conc.route === 'urgent', conc)
  const ok = neck({ I1: 'vehicle', I2: 'd7', I8: 'no', I3: 'no', I4: ['none'], I5: 'no', I9: 'no' })
  check('C-Spine Rule: 2 to 7 days, no high-risk feature or concussion signs, goes on to the questions', ok.route === 'continue', ok)
}

// ── 21. The remaining CPG safety gaps (2 Oct 2026) ──
{
  const { injuryFlow } = await imp('src/data/injuryScreen.js')
  const { regionRedFlags } = await imp('src/data/assessmentFlow.js')
  const { interpretPsychosocial } = await imp('src/data/psychosocial.js')
  const Z = (ids) => ids.map((id) => ({ id, type: id.replace(/[LR]$/, ''), label: id }))
  const flagsOf = (ids) => regionRedFlags(Z(ids), Z(ids))
  const hip = Object.fromEntries(flagsOf(['hipR']).map((f) => [f.id, f]))
  check('Hip fracture CPG: a dislocated hip replacement calls 911', hip['hpf-dislocation'] && hip['hpf-dislocation'].call911 && hip['hpf-dislocation'].tier === 'emergency')
  check('Hip fracture CPG: a painful, hot or leaking hip replacement is a same-day check', hip['hpf-replacement'] && hip['hpf-replacement'].sameDay)
  check('Hip fracture CPG: sudden hip pain at 65+ or with osteoporosis, no fall needed, is a same-day X-ray', hip['hpf-nofall'] && hip['hpf-nofall'].sameDay && /no fall/.test(hip['hpf-nofall'].text))
  const knee = (a) => injuryFlow(Z(['kneeR']), Object.fromEntries(Object.entries(a).map(([k, v]) => ['knee:' + k, v])))
  const base = { I2: 'no', I3: 'no', I9: 'no', I4: 'no' }
  const child = knee({ I1: 'fall', ...base, I8: 'yes' })
  check('Pittsburgh knee rule: after a fall, under 12 or over 50 needs an X-ray the same day', child.route === 'urgent' && child.sameDay, child)
  const twist = knee({ I1: 'twist', ...base, I5: 'no', I6: 'no' })
  check('Pittsburgh knee rule: not asked after a twist (Ottawa only)', twist.route === 'continue', twist)
  const foot = knee({ I1: 'blow', I2: 'no', I3: 'no', I9: 'yes' })
  check('Knee ligament CPG: a weak foot after a knee injury (peroneal nerve) is a same-day check', foot.route === 'urgent' && foot.sameDay, foot)
  const legs = flagsOf(['kneeR', 'thighR']).map((f) => f.id)
  check('PFP CPG: the thigh-bone stress fracture question is asked once for a knee and thigh', legs.filter((id) => /stress/.test(id)).length === 1, legs)
  const off = interpretPsychosocial({ bfOffWork: 'agree' })
  check('Work participation CPG: off work or on lighter duties is a blue flag with a return-to-work note',
    off.flags.blue.length === 1 && off.notes.some((n) => /modified duties/.test(n)), off)
}

// ── 22. The two low-priority CPG gaps (2 Oct 2026) ──
{
  const { regionRedFlags } = await imp('src/data/assessmentFlow.js')
  const Z = (ids) => ids.map((id) => ({ id, type: id.replace(/[LR]$/, ''), label: id }))
  const flagsOf = (ids) => regionRedFlags(Z(ids), Z(ids))
  const back = flagsOf(['lowerback'])
  const slow = back.find((f) => f.id === 'rf-aaa-slow')
  check('Low back CPG 2012: a slowly growing aneurysm is asked (deep constant pain, risk factors), urgent not 911',
    slow && slow.tier === 'urgent' && !slow.call911 && back.some((f) => f.id === 'rf-aaa' && f.call911), back.map((f) => f.id))
  const neck = flagsOf(['neck'])
  const cn = neck.find((f) => f.id === 'nrf-upperinstab')
  check('Neck CPG 2017: gradual cranial nerve signs are asked (urgent, in the upper-neck question), alongside the sudden stroke question (911)',
    cn && cn.tier === 'urgent' && /hoarse/.test(cn.text) && neck.some((f) => f.id === 'nrf-stroke' && f.call911), neck.map((f) => f.id))
}

// ── 23. Nerve and muscle screen (Myasthenia Gravis and Myotonic Dystrophy documents, 2 Oct 2026) ──
{
  const { patternChecks } = await imp('src/data/patternChecks.js')
  const ZN = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
  const ids = (z, a) => patternChecks(ZN(z), a, 9).map((p) => p.id)
  const grip = patternChecks(ZN(['handR']), { H3: ['weak'] }, 9)
  const crisis = grip.find((p) => p.id === 'pc-muscle-crisis')
  check('Nerve and muscle: a weak grip asks about breathing, swallowing, fainting or an irregular heartbeat (911)',
    crisis && crisis.call911 && crisis.tier === 'emergency', grip.map((p) => p.id))
  const scr = grip.find((p) => p.id === 'pc-muscle')
  check('Nerve and muscle: and the fatigable / myotonia screen, which holds the booking (doctor in a few days), without naming a condition',
    scr && scr.noBooking && !scr.sameDay && !/myasthen|myotonic|dystrophy/i.test(scr.text + scr.why.text), scr)
  check('Nerve and muscle: both thighs drawn asks the screen, not the 911 question',
    ids(['thighL', 'thighR'], {}).includes('pc-muscle') && !ids(['thighL', 'thighR'], {}).includes('pc-muscle-crisis'))
  check('Nerve and muscle: a one-sided ache with no weakness is not asked', !ids(['shoulderR'], { painQuality: ['ache'] }).some((x) => /muscle/.test(x)))
  const full = patternChecks(ZN(['shoulderL', 'shoulderR', 'chest', 'lowerback']), {}).map((p) => p.id)
  check('Nerve and muscle: the screen comes last, only into a free place, so it never pushes out an organ or heart check',
    full.length === 3 && !full.includes('pc-muscle') &&
    ids(['shoulderL', 'shoulderR', 'chest'], {}).filter((x) => !['pc-calcium', 'pc-thyroid', 'pc-hypothyroid', 'pc-acromegaly'].includes(x)).slice(-1)[0] === 'pc-muscle', full)
}

// ── 24. Early signs of a muscle condition in a young child ("DuchenneMD", signed 2 Oct 2026) ──
{
  const { patternChecks } = await imp('src/data/patternChecks.js')
  const ZN = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
  const kid = patternChecks(ZN(['lowerlegL', 'lowerlegR']), { age: 'u18' }, 9).find((p) => p.id === 'pc-child-muscle')
  check('Duchenne: under 18 with the legs drawn asks the early-signs question; a yes holds the booking (doctor in a week or two, CK test)',
    kid && kid.noBooking && /creatine kinase/.test(kid.why.text) && !/Duchenne/i.test(kid.text + kid.why.text), kid)
  check('Duchenne: not asked for an adult, or for a child with only an arm drawn',
    !patternChecks(ZN(['lowerlegR']), { age: '30-49' }, 9).some((p) => p.id === 'pc-child-muscle') &&
    !patternChecks(ZN(['wristR']), { age: 'u18' }, 9).some((p) => p.id === 'pc-child-muscle'))
}

// ── 25. Age: "Under 5" and "5 to 15" (Chandra does not treat children under 5, 2 Oct 2026) ──
{
  const { patternChecks } = await imp('src/data/patternChecks.js')
  const { REGIONS: ALL } = await imp('src/data/symptomGuide.js')
  const bad = Object.entries(ALL).filter(([, r]) => {
    const q = (r.context || []).find((c) => c.id === 'age')
    return q && !(q.options.some((o) => o.id === 'u5' && o.label === 'Under 5') && q.options.some((o) => o.id === 'u18' && o.label === '5 to 15'))
  }).map(([k]) => k)
  check('Age: every area asks "Under 5" and "5 to 15" (no "Under 18" left)', bad.length === 0, bad)
  const ZN = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
  check('Age: the early-signs question for a child is asked for under 5 as well as 5 to 15',
    patternChecks(ZN(['thighL', 'thighR']), { age: 'u5' }, 9).some((p) => p.id === 'pc-child-muscle'))
  const { readFileSync } = await import('node:fs')
  const src = readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  check('Age: under 5 replaces every booking with a referral to a children\'s physiotherapist',
    /const underFive = answers\.age === 'u5'/.test(src) && /!holdBooking && !underFive/.test(src) && /underFive && !holdBooking \?/.test(src))
}

// ── 26. Inflammatory myopathy ("Poly myositis" document, v0.1 draft, 2 Oct 2026) ──
{
  const { patternChecks } = await imp('src/data/patternChecks.js')
  const ZN = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
  const both = patternChecks(ZN(['thighL', 'thighR', 'shoulderL', 'shoulderR']), {}, 9)
  const myo = both.find((p) => p.id === 'pc-myositis')
  check('Myositis: both thighs and shoulders drawn asks about weakness over weeks to months; a yes holds the booking (doctor this week, CK)',
    myo && myo.noBooking && /creatine kinase/.test(myo.why.text) && !/myositis|polymyositis/i.test(myo.text), both.map((p) => p.id))
  check('Myositis: asked before the general nerve and muscle screen', both.findIndex((p) => p.id === 'pc-myositis') < both.findIndex((p) => p.id === 'pc-muscle'))
  check('Myositis: not asked for a weak grip alone (hands are spared; the general screen asks)',
    !patternChecks(ZN(['handR']), { H3: ['weak'] }, 9).some((p) => p.id === 'pc-myositis') && patternChecks(ZN(['thighR']), { R2: ['weak'] }, 9).some((p) => p.id === 'pc-myositis'))
  check('Myositis: not asked for one sore shoulder with no weakness', !patternChecks(ZN(['shoulderR']), { painQuality: ['ache'] }, 9).some((p) => p.id === 'pc-myositis'))
}

// ── 27. Polymyalgia rheumatica, dark urine, the cancer link (Chandra, 2 Oct 2026) ──
{
  const { patternChecks } = await imp('src/data/patternChecks.js')
  const { regionRedFlags } = await imp('src/data/assessmentFlow.js')
  const ZN = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
  const pmr = patternChecks(ZN(['shoulderL', 'shoulderR']), { age: 'o64' }, 9).find((p) => p.id === 'pc-pmr')
  check('PMR: over 50 with both shoulders drawn asks about morning stiffness and the giant cell arteritis signs; doctor first (today with those signs)',
    pmr && pmr.noBooking && pmr.sameDay && /jaw pain when chewing/.test(pmr.text), pmr)
  check('PMR: not asked under 50, or when the neck is drawn (its own over-50 question asks there)',
    !patternChecks(ZN(['shoulderL', 'shoulderR']), { age: '30-49' }, 9).some((p) => p.id === 'pc-pmr') &&
    !patternChecks(ZN(['neck', 'shoulderL', 'shoulderR']), { age: 'o64' }, 9).some((p) => p.id === 'pc-pmr'))
  const flags = (ids) => regionRedFlags(ZN(ids), ZN(ids)).map((f) => f.id)
  const rh = flags(['shoulderR', 'upperarmR', 'hipR', 'thighR', 'lowerlegR']).filter((id) => /rhabdo/.test(id))
  check('Dark urine: asked generally (no exercise needed), once across the shoulder, arm, hip, thigh and leg', rh.length === 1, rh)
  check('Dark urine: asked for the shoulder and the hip too', flags(['shoulderR']).some((id) => /rhabdo/.test(id)) && flags(['hipR']).some((id) => /rhabdo/.test(id)))
  const { readFileSync } = await import('node:fs')
  const src = readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  check('Myositis: the diagnosed entry mentions the cancer link calmly, with screening', /less often, cancer, so your team may arrange screening tests/.test(src))
}

// ── 28. Persistent widespread pain ("Fibromyalgia" document, signed 2 Oct 2026) ──
{
  const { classifyPainMechanism } = await imp('src/data/painType.js')
  const { widespreadRoute, WIDESPREAD } = await imp('src/data/widespreadPain.js')
  const ZN = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
  const many = ZN(['neck', 'shoulderL', 'shoulderR', 'lowerback', 'hipL', 'hipR', 'thighL', 'thighR'])
  const chronic = { duration: 'o3m', painQuality: ['ache', 'touch'], easing: ['none'], sinSettle: 'constant', yfSleep: 'agree', yfMood: 'agree', yfFear: 'agree' }
  const pt = classifyPainMechanism({ zones: many, answers: chronic })
  check('Widespread pain: many areas for more than 3 months shows the widespread-pain explainer', widespreadRoute(pt, false), pt)
  const one = classifyPainMechanism({ zones: ZN(['lowerback']), answers: chronic })
  check('Widespread pain: one area, however long, does not', !widespreadRoute(one, false), one)
  const fresh = classifyPainMechanism({ zones: many, answers: { ...chronic, duration: 'd2w' } })
  check('Widespread pain: not for a few weeks of pain', !widespreadRoute(fresh, false), fresh)
  check('Widespread pain: shown for a doctor\'s fibromyalgia diagnosis', widespreadRoute(null, true))
  const all = [WIDESPREAD.title, WIDESPREAD.what, WIDESPREAD.alarm, WIDESPREAD.reassure, WIDESPREAD.physio, ...WIDESPREAD.selfCare].join(' ')
  check('Widespread pain: no labels to the patient ("central sensitisation", damage, wear and tear), and fibromyalgia named only in the doctor line',
    !/central sensiti|wear and tear|fibromyalgia/i.test(all) && /damage/.test(all) && !/is damage|are damaged|means damage/i.test(all) && /fibromyalgia, one possibility/.test(WIDESPREAD.doctor))
  const { readFileSync } = await import('node:fs')
  const src = readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  check('Widespread pain: the doctor line is left out when fibromyalgia is already diagnosed, and booking is not held',
    /!fibroDiagnosed && \(/.test(src) && /id: 'ca-fibro'/.test(src) && !/showWidespread[^\n]*holdBooking/.test(src))
}

// ── 29. Myofascial pain ("Myofascial Pain" document, signed by Chandra, 2 Oct 2026) ──
{
  const { buildScreens, rankAcross } = await imp('src/data/assessmentFlow.js')
  const five = ['neck', 'shoulder', 'upperback', 'lowback', 'hip']
  const ctx = buildScreens(five).context
  check('Myofascial: the tender-spot question is on the opening screen once, however many of the five areas are drawn',
    ctx.filter((q) => q.id === 'tender').length === 1 && five.every((k) => buildScreens([k]).context.some((q) => q.id === 'tender')))
  const shown = (keys, a) => rankAcross(keys, a).map((x) => x.rk + '/' + x.c.id)
  check('Myofascial: a tender spot that brings on the spread, at a desk, shows the neck muscle pattern',
    shown(['neck'], { age: '30-49', onset: 'desk', duration: 'd2w', tender: 'refers' }).includes('neck/myofascial'))
  check('Myofascial: "no tender spot" keeps it out',
    !shown(['neck'], { age: '30-49', onset: 'desk', duration: 'd2w', tender: 'none' }).includes('neck/myofascial'))
  check('Myofascial: one answer serves every drawn area (low back and hip)',
    ['lowback/myofascial', 'hip/myofascial'].some((id) => shown(['lowback', 'hip'], { age: '30-49', duration: 'd2w', tender: 'refers' }).includes(id)))
}

// ── 30. The results PDF (Oct 2026): loaded early, and safe to ask for twice ──
{
  const pdf = await imp('src/components/resultsPdf.js')
  await pdf.preloadPdf()
  const again = pdf.preloadPdf()
  check('PDF: asking for the PDF library again after it has loaded still gives a promise (the results page chains .catch)',
    !!again && typeof again.then === 'function' && typeof again.catch === 'function' && pdf.pdfReady())
  const doc = pdf.buildResultsPdf({ code: '20261002-001', dateText: 'October 2, 2026', images: null, areas: ['Neck'], doctor: null, referral: [],
    conditions: [{ name: 'Muscle-referred neck and shoulder ache (myofascial pain)', blurb: 'A “knot” — is not a tear…' }], noMatch: 'x', painType: null,
    behaviour: [], cautions: ['Fibromyalgia, diagnosed by a doctor'], answers: [{ question: 'Your age?', answer: '30 to 49' }], notes: '' })
  check('PDF: a results PDF builds', doc.internal.getNumberOfPages() >= 1)
  const { readFileSync } = await import('node:fs')
  const src = readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  check('PDF: the library is fetched when the assessment opens, not first on the results page (a site update in between broke it)',
    /preloadPdf\(\)\.catch/.test(src))
}

// ── 31. "A little about you": age and birth sex before the safety pages (Chandra, 2 Oct 2026) ──
{
  const { forPerson, regionRedFlags } = await imp('src/data/assessmentFlow.js')
  const { REGIONS: R } = await imp('src/data/symptomGuide.js')
  const all = Object.values(R).flatMap((r) => r.redFlags || [])
  const unknown = all.filter((f) => !forPerson(f, {}))
  check('About you: with age and birth sex unknown, every safety question is still asked', unknown.length === 0, unknown.map((f) => f.id))
  check('About you: "intersex, or prefer not to say" asks every question', all.every((f) => forPerson(f, { sex: 'other' })))
  // The one exception (Chandra, 4 Oct 2026): the pregnancy and ectopic emergencies, asked of 16 to 49 only.
  const PREG_EM = ['srf-ectopic', 'prf-pregnancy-bleed', 'prf-pregnancy', 'hpf-ectopic']
  const ageEm = all.filter((f) => f.tier === 'emergency' && f.ages && !PREG_EM.includes(f.id))
  check('About you: no emergency question is ever left out by age (except the pregnancy and ectopic ones, 16 to 49)', ageEm.length === 0, ageEm.map((f) => f.id))
  const ZN = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
  const hip = (who) => regionRedFlags(ZN(['hipR']), ZN(['hipR'])).filter((f) => forPerson(f, who)).map((f) => f.id)
  const man55 = hip({ age: '50-64', sex: 'male' }), woman30 = hip({ age: '30-49', sex: 'female' }), all0 = hip({})
  check('About you: a man of 55 drawing the hip is not asked the pregnancy, period or child questions, but is asked the testicle one',
    !man55.includes('hpf-ectopic') && !man55.includes('hpf-pelvic') && !man55.includes('hpf-sufe') && man55.includes('hpf-torsion'), man55)
  check('About you: a woman of 30 drawing the hip is asked the pregnancy question and not the testicle one',
    woman30.includes('hpf-ectopic') && !woman30.includes('hpf-torsion'), woman30)
  check('About you: fewer hip safety questions once age and sex are known', man55.length < all0.length && woman30.length < all0.length, [all0.length, man55.length, woman30.length])
  check('About you: the septic hip question (children and adults) is asked at every age', ['u5', '30-49', 'o64'].every((age) => hip({ age, sex: 'male' }).includes('hpf-septic')))
  const { readFileSync } = await import('node:fs')
  const src = readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  const between = (a, b) => { const i = src.indexOf(a); return i < 0 ? '' : src.slice(i, src.indexOf(b, i + a.length)) }
  const pdf = between('const pdfData = () =>', 'const anonPayload'), anon = between('const anonPayload = () =>', '// The screen a review-screen')
  const summary = between('const summaryText = useMemo', '])')
  check('About you: birth sex is never stored in the answers (so never in the summary, AI overview or anonymous copy)',
    !/setAnswers\([^\n]*(birthSex|sex:)/.test(src) && !/birthSex/.test(pdf) && !/birthSex/.test(anon) && !/birthSex/.test(summary) && pdf.length > 0 && anon.length > 0)
  check('About you: birth sex is cleared on restart', /setFocusKey\(null\); setBirthSex\(null\)/.test(src))
}

// ── 32. Anonymous feedback (Chandra, 2 Oct 2026) ──
{
  const { scrub, buildFeedback } = await imp('api/feedback.js')
  const s = scrub('My name is Jane Smith, email jane.smith@mail.com or call 604-555-0123, PHN 9876 543 210, V5K 0A1, see www.x.ca. The safety questions were long.')
  check('Feedback: names after "my name is", emails, phone and health card numbers, postal codes and web addresses are removed',
    !/Jane|Smith|@|555|9876|V5K|www/.test(s) && /safety questions were long/.test(s), s)
  check('Feedback: a comment is cut to 500 characters', scrub('a'.repeat(900)).length === 500)
  const r = buildFeedback({ ease: 4, sense: 'partly', confusing: true, parts: ['safety', 'bogus'], comment: 'ok', code: '20261002-001', answers: { age: '30-49' }, context: { areas: ['hip'], results: [{ region: 'hip', id: 'gtps' }] } }, '2026-10-02')
  check('Feedback: only the listed values are kept; no reference code or answers; areas and results only when ticked',
    r.ease === 4 && r.sense === 'partly' && r.parts.join() === 'safety' && !('code' in r) && !('answers' in r) && r.context === null && JSON.stringify(r).indexOf('20261002') < 0, r)
  const r2 = buildFeedback({ attach: true, context: { areas: ['hip'], results: [{ region: 'hip', id: 'gtps' }] } }, '2026-10-02')
  check('Feedback: the areas drawn and conditions shown are added only when the person ticks to attach them', r2.context && r2.context.results[0].id === 'gtps')
  const { readFileSync } = await import('node:fs')
  const api = readFileSync(new URL('../api/feedback.js', import.meta.url), 'utf8')
  const form = readFileSync(new URL('../src/components/FeedbackForm.jsx', import.meta.url), 'utf8')
  check('Feedback: the server refuses anything sent without the confirmation', /consent !== true/.test(api))
  check('Feedback: the page removes contact details before sending, so they never leave the device', /comment: scrub\(comment\)/.test(form))
  check('Feedback: a separate confirmation (freely given, no personal information, not monitored, no action asked of Physio Chandra, rights unaffected) must be ticked before sending',
    /role="dialog"/.test(form) && /freely and entirely of my own choice/.test(form) && /not included my name, contact details/.test(form) &&
    /does not ask Physio Chandra or physiochandra\.ca to take any action/.test(form) && /does not affect your rights/.test(form) && /disabled=\{!confirmed/.test(form))
  check('Feedback: says never published or used as a testimonial, and gives 911, 8-1-1 and 9-8-8', /never published or used as a testimonial/.test(form) && /911/.test(form) && /8-1-1/.test(form) && /9-8-8/.test(form))
}

// ── 33. Diabetes ("DiabetesMellitus" + "Diabetes RiskModule", signed 3 Oct 2026) ──
{
  const DM = await imp('src/data/diabetes.js')
  const { patternChecks } = await imp('src/data/patternChecks.js')
  const ZN = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
  const ids = (l) => l.map((f) => f.id)
  check('Diabetes: no diabetes red flags without known diabetes',
    !DM.diabetesRedFlags(ZN(['shoulderL']), { dm: 'no' }).length && !DM.diabetesRedFlags(ZN(['shoulderL']), { dm: 'pre' }).length)
  const sh = DM.diabetesRedFlags(ZN(['shoulderL']), { dm: 'yes' })
  check('Diabetes: with diabetes, any area asks ketoacidosis (911), a black toe, silent heart symptoms (911) and a hot swollen foot or wound (doctor today)',
    ['dm-dka', 'dm-foot-black', 'dm-cardiac', 'dm-foot-hot'].every((i) => ids(sh).includes(i)) &&
    sh.find((f) => f.id === 'dm-dka').call911 && sh.find((f) => f.id === 'dm-foot-hot').sameDay, ids(sh))
  check('Diabetes: amyotrophy (no booking) and muscle infarction (today) only for hip, thigh, low back or leg drawings',
    !ids(sh).includes('dm-amyotrophy') && !ids(sh).includes('dm-thigh') &&
    DM.diabetesRedFlags(ZN(['thighR']), { dm: 'yes' }).some((f) => f.id === 'dm-amyotrophy' && f.noBooking && !f.sameDay))
  const foot = REGIONS.foot.redFlags
  const onFoot = DM.diabetesRedFlags(ZN(['footR']), { dm: 'yes' }, foot)
  check('Diabetes: not asked twice where the foot already asks about Charcot and infection',
    !ids(onFoot).includes('dm-foot-hot') && !ids(onFoot).includes('dm-foot-black'), ids(onFoot))
  check('Diabetes: a heart question already on the page is not asked twice',
    !DM.diabetesRedFlags(ZN(['chest']), { dm: 'yes' }, patternChecks(ZN(['chest']), {}, 7)).some((f) => f.id === 'dm-cardiac'))
  const nerveFlags = ['leg', 'ankle', 'foot'].flatMap((k) => REGIONS[k].redFlags.filter(DM.isNerveFlag))
  const poly = patternChecks(ZN(['footL', 'footR']), {}, 7).find((p) => p.id === 'pc-polyneuropathy')
  check('Diabetes: numb or burning feet on both sides without known diabetes = doctor first, no booking (blood test)',
    nerveFlags.length === 3 && nerveFlags.every((f) => f.noBooking) && poly && poly.noBooking && /blood test/.test(DM.NERVE_WHY.text) && /thirst/.test(DM.NERVE_WHY.text))
  const src = (await import('node:fs')).readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  check('Diabetes: with known diabetes the nerve questions are left out (the results panel takes over)',
    /!\(dmKnown && isNerveFlag\(f\)\)/.test(src) && /\.\.\.diabetic, \.\.\.steroid, \.\.\.list, \.\.\.pattern/.test(src))
  check('Diabetes: asked on "A little about you" (required to continue), kept out of the anonymous copy',
    /arrangeOptions\(DM_STATUS\.options, DM_STATUS\.text\)\.map/.test(src) && /answers\.dm && answers\.steroid/.test(src) && /disabled=\{!aboutDone\}/.test(src) && /_other\$\|\^dm\|/.test(src))

  check('Diabetes tier: type 1, over 10 years, well above target = high; type 2, under 5 years, in target = low; over 20 years or a foot ulcer = high; prediabetes = low',
    DM.diabetesTier({ dm: 'yes', dmType: 't1', dmYears: 'o10', dmControl: 'well' }) === 'high' &&
    DM.diabetesTier({ dm: 'yes', dmType: 't2', dmYears: 'u5y', dmControl: 'target' }) === 'low' &&
    DM.diabetesTier({ dm: 'yes', dmYears: 'o20' }) === 'high' && DM.diabetesTier({ dm: 'yes', dmComp: ['foot'] }) === 'high' &&
    DM.diabetesTier({ dm: 'yes', dmYears: '5to10', dmControl: 'above' }) === 'moderate' &&
    DM.diabetesTier({ dm: 'pre' }) === 'low' && DM.diabetesTier({ dm: 'no' }) === null)
  check('Diabetes flags: insulin → HYPO; eyes, kidneys, heart; numb feet or the touch question → FOOT',
    JSON.stringify(DM.diabetesFlags({ dmTreat: 'insulin', dmComp: ['eyes', 'kidneys', 'heart'], dmFeel: 'reduced' })) === JSON.stringify({ HYPO: true, EYE: true, KIDNEY: true, CARDIAC: true, FOOT: true }))

  const shZ = ZN(['shoulderL'])
  const a = { age: '50-64', onset: 'gradual', duration: 'd3m', S1: 'deep', S2: 'top', S3: ['behind', 'highshelf', 'lying'], S6: ['weakness'], S7: 'shoulder' }
  const order = (b, ans = a) => rankAcross(['shoulder'], ans, 2, b).map((x) => x.c.id).join()
  check('Diabetes lift: rotator cuff narrowly ahead of frozen shoulder → frozen shoulder first with long-standing diabetes; unchanged without it',
    order(null) === 'rc,frozen' && order(DM.diabetesBonus({ dm: 'yes', dmYears: 'o20' }, shZ)) === 'frozen,rc' &&
    order(DM.diabetesBonus({ dm: 'no' }, shZ)) === 'rc,frozen', [order(null), order(DM.diabetesBonus({ dm: 'yes', dmYears: 'o20' }, shZ))])
  const mid = { ...a, S2: 'midarc' }
  check('Diabetes lift: never shows a condition that has not met the 40% rule on its own',
    order(DM.diabetesBonus({ dm: 'yes', dmYears: 'o20' }, shZ), mid) === order(null, mid) && !order(null, mid).includes('frozen'))
  check('Diabetes lift: +1 more when both shoulders are drawn',
    DM.diabetesBonus({ dm: 'yes', dmYears: 'o20' }, ZN(['shoulderL', 'shoulderR']))('shoulder', 'frozen') === 4 &&
    DM.diabetesBonus({ dm: 'yes', dmYears: 'o20' }, shZ)('shoulder', 'frozen') === 3)
  check('Diabetes: every linked condition exists, with a modifier for each tier and a known panel',
    Object.entries(DM.DM_LINKED).every(([k, l]) => { const [rk, id] = k.split(':'); return REGIONS[rk] && REGIONS[rk].conditions.some((c) => c.id === id) &&
      ['low', 'moderate', 'high'].every((t) => Number.isInteger(l.mod[t])) && ['shoulder', 'hand', 'feet', 'general'].includes(l.panel) }))

  const fz = rankAcross(['shoulder'], a, 4)
  check('Diabetes details: asked when a linked condition qualifies or both feet burn; not for a problem diabetes does not touch; prediabetes asks complications only',
    DM.diabetesBranch({ dm: 'yes' }, shZ, fz) && !DM.diabetesBranch({ dm: 'no' }, shZ, fz) &&
    !DM.diabetesBranch({ dm: 'yes' }, ZN(['kneeL']), []) &&
    DM.diabetesBranch({ dm: 'yes', painQuality: ['burning'] }, ZN(['footL', 'footR']), []) &&
    DM.diabetesQuestions({ dm: 'pre' }, shZ).map((q) => q.id).join() === 'dmComp' &&
    !DM.diabetesQuestions({ dm: 'yes' }, shZ).some((q) => q.id === 'dmFeel') && DM.diabetesQuestions({ dm: 'yes' }, ZN(['footL'])).some((q) => q.id === 'dmFeel'))

  const frozenFirst = [{ rk: 'shoulder', c: { id: 'frozen', name: 'Frozen shoulder' } }]
  const pShoulder = DM.diabetesPanel({ dm: 'yes', dmYears: 'o10', dmControl: 'well', dmTreat: 'insulin' }, shZ, frozenFirst)
  check('Diabetes panel: shoulder wording, the high-tier prognosis, the doctor line, the steroid and low-sugar notes',
    pShoulder && /shoulder/.test(pShoulder.title) && pShoulder.notes.some((n) => /start early/.test(n)) &&
    pShoulder.notes.some((n) => /diabetes team at your next visit/.test(n)) && pShoulder.notes.some((n) => /steroid injection/.test(n)) &&
    pShoulder.notes.some((n) => /fast-acting sugar/.test(n)), pShoulder)
  const pFeet = DM.diabetesPanel({ dm: 'yes', painQuality: ['tingling'] }, ZN(['footL', 'footR']), [])
  check('Diabetes panel: both feet tingling with diabetes → the feet wording and daily foot checks',
    pFeet && /feet/.test(pFeet.title) && pFeet.notes.some((n) => /Check both feet every day/.test(n)))
  check('Diabetes panel: a problem diabetes does not touch → the short "staying active" note only',
    DM.diabetesPanel({ dm: 'yes' }, ZN(['kneeL']), [{ rk: 'knee', c: { id: 'pfp' } }]).title === 'Diabetes and staying active')
  const s50 = DM.diabetesPanel({ dm: 'no', age: '50-64' }, shZ, frozenFirst)
  check('Diabetes, not known: frozen shoulder at 30 to 64 → "worth asking your doctor" for a blood test; not at 16 to 29; not for one-handed trigger finger; yes for both hands',
    s50 && /HbA1c/.test(s50.text) && !DM.diabetesPanel({ dm: 'no', age: '18-29' }, shZ, frozenFirst) &&
    !DM.diabetesPanel({ dm: 'ns' }, ZN(['handL']), [{ rk: 'hand', c: { id: 'trigger' } }]) &&
    !!DM.diabetesPanel({ dm: 'ns' }, ZN(['handL', 'handR']), [{ rk: 'hand', c: { id: 'trigger' } }]))
  const allText = JSON.stringify([DM.DM_RED_FLAGS, DM.NERVE_WHY, pShoulder, pFeet, s50,
    ...['shoulder', 'hand', 'general'].map((p) => DM.diabetesPanel({ dm: 'yes', dmYears: 'o20' }, shZ, [{ rk: p === 'hand' ? 'hand' : p === 'general' ? 'knee' : 'shoulder', c: { id: p === 'hand' ? 'trigger' : p === 'general' ? 'oa' : 'frozen' } }]))])
  check('Diabetes language: never "you have diabetes", a risk score, "high risk", "damage" (only "not damage"), "rotting" or a cure',
    !/you (may )?have diabetes|risk score|high risk|(?<!not )damage|rotting|cure|permanent/i.test(allText), allText.match(/you (may )?have diabetes|risk score|high risk|(?<!not )damage|rotting|cure|permanent/i))
  const sum = DM.diabetesSummary({ dm: 'yes', dmType: 't1', dmYears: 'o20', dmTreat: 'insulin' }, shZ, frozenFirst).join('\n')
  check('Diabetes summary for Chandra: status, details, tier, flags and the lift applied',
    /Yes, diabetes/.test(sum) && /Type 1/.test(sum) && /HIGH/.test(sum) && /HYPO/.test(sum) && /Frozen shoulder \+3/.test(sum), sum)
}

// ── 34. Cushing's syndrome and steroid medicine ("Cushings Syndrome", signed 3 Oct 2026) ──
{
  const ST = await imp('src/data/steroids.js')
  const { patternChecks } = await imp('src/data/patternChecks.js')
  const ZN = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
  const hormone = (z, a = {}) => patternChecks(ZN(z), a, 9).find((p) => p.id === 'pc-hormone')
  const h = hormone(['thighL', 'thighR'])
  check('Cushing route A: both thighs drawn → weakness over months with steroids or body changes; doctor in a week or two, no booking, not named',
    h && h.noBooking && !h.sameDay && /stretch marks/.test(h.text) && /steroid/.test(h.text) &&
    !/cushing|cortisol excess/i.test(h.text + h.why.text) && /do not stop any steroid/i.test(h.why.text), h)
  check('Cushing route A: also for a weakness answer with a shoulder, hip or thigh drawing; not for one knee drawn without weakness',
    !!hormone(['shoulderL'], { S6: ['weakness'] }) && !hormone(['kneeL']))
  const order = patternChecks(ZN(['thighL', 'thighR']), { age: '50-64' }, 9).map((p) => p.id)
  check('Cushing route A: asked after myositis and before the nerve and muscle screen',
    order.indexOf('pc-myositis') < order.indexOf('pc-hormone') && order.indexOf('pc-hormone') < order.indexOf('pc-muscle'), order)
  const src = (await import('node:fs')).readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  check('Final check: room for six questions, and pattern questions the doctor page\'s two-question limit cut are asked there instead of dropped',
    /\.slice\(0, 6\)/.test(src) && /const deferred = rest\.slice\(2\)/.test(src) && /\[\.\.\.em, \.\.\.rest\.slice\(0, 2\)\]/.test(src) && /filter\(\(id\) => !deferred\.has\(id\)\)/.test(src))
  check('Cushing route B: "diagnosed" on the cautions list; strength does not come back by itself; exercise is the treatment',
    /CUSHING_CAUTION,/.test(src) && /does not come back by itself/.test(ST.CUSHING_CAUTION.why.text) && ST.CUSHING_CAUTION.tier === 'caution')
  check('Steroids: no extra red flags without long-term steroids',
    !ST.steroidRedFlags({ steroid: 'no' }).length && !ST.steroidRedFlags({ steroid: 'ns' }).length)
  const rf = ST.steroidRedFlags({ steroid: 'tabs' })
  check('Steroids: adrenal crisis (911), a mind change (emergency department, 9-8-8), a hidden infection (doctor today) come first; a knee or thigh tendon snap (today) for those drawings',
    rf.find((f) => f.id === 'st-adrenal').call911 && rf.find((f) => f.id === 'st-mind').tier === 'emergency' && /9-8-8/.test(rf.find((f) => f.id === 'st-mind').why.text) &&
    rf.find((f) => f.id === 'st-infection').sameDay && /\.\.\.steroid, \.\.\.list/.test(src) && ST.steroidRedFlags({ steroid: 'other' }).length === 3 &&
    ST.steroidRedFlags({ steroid: 'tabs' }, [], ZN(['kneeL'])).some((f) => f.id === 'st-tendon' && f.sameDay))
  check('Steroids: the spine fracture, steroid hip and Achilles questions are already asked by those areas',
    ['lowback', 'tlj', 'sij'].every((k) => REGIONS[k].redFlags.some((f) => f.group === 'osteo' || /steroid/.test(f.text))) &&
    REGIONS.hip.redFlags.some((f) => f.id === 'hpf-avn' && /steroid/.test(f.text)) && REGIONS.ankle.redFlags.some((f) => /steroid/.test(f.text)))
  check('Steroids: asked on "A little about you" (required), kept out of the anonymous copy',
    /arrangeOptions\(STEROID_STATUS\.options, STEROID_STATUS\.text\)\.map/.test(src) && /answers\.steroid && \(!pregAsk/.test(src) && /\^steroid\$\|\^preg\|/.test(src))
  const p1 = ST.steroidPanel({ steroid: 'tabs' }, false), p2 = ST.steroidPanel({ steroid: 'no' }, true)
  check('Steroids panel: never stop suddenly, sit-to-stand, protect the back, ask about bone health; Cushing diagnosed: strength does not return by itself',
    p1 && p1.notes.some((n) => /Never stop steroid tablets suddenly/.test(n)) && p1.notes.some((n) => /firm chair/.test(n)) &&
    p1.notes.some((n) => /vitamin D/.test(n)) && p2 && /does not come back by itself/.test(p2.text) &&
    !p2.notes.some((n) => /Never stop steroid/.test(n)) && ST.steroidPanel({ steroid: 'no' }, false) === null)
  const all = JSON.stringify([ST.STEROID_RED_FLAGS, ST.HORMONE_SCREEN, ST.CUSHING_CAUTION, p1, p2])
  check('Steroids language: no "you have Cushing\'s", cure, guarantee or "damage" except "not … damaged by use"',
    !/you (may )?have cushing|cure|guarantee|permanent|(?<!not muscle )damage/i.test(all), all.match(/you (may )?have cushing|cure|guarantee|permanent|(?<!not muscle )damage/i))
}

// ── 35. Hypopituitarism ("Hypopituitarism", signed 3 Oct 2026) ──
{
  const ST = await imp('src/data/steroids.js')
  const { patternChecks } = await imp('src/data/patternChecks.js')
  const ZN = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
  const low = (z, a = {}) => patternChecks(ZN(z), a, 12).find((p) => p.id === 'pc-lowhormone')
  const l = low(['thighL', 'thighR'])
  check('Hypopituitarism route A: exhaustion or both-sided muscle loss with a cause (pituitary or brain tumour or treatment, head injury, childbirth with heavy bleeding, immunotherapy); doctor in a week or two, no booking',
    l && l.noBooking && !l.sameDay && /head injury/.test(l.text) && /heavy bleeding/.test(l.text) && /immunotherapy/.test(l.text) &&
    /blood tests/.test(l.why.text) && !/hypopituitarism/i.test(l.text + l.why.text), l)
  check('Hypopituitarism route A: also for a widespread drawing, a weakness answer, or a head problem lasting more than 3 months; not for one knee',
    !!low(['neck', 'shoulderL', 'hipR', 'kneeL']) && !!low(['kneeL'], { K6: ['weak'] }) === !!patternChecks(ZN(['kneeL']), { K6: ['weak'] }, 12).find((p) => p.id === 'pc-myositis' || p.id === 'pc-muscle') &&
    !!low(['head'], { duration: 'o3m' }) && !low(['head'], { duration: 'd2w' }) && !low(['kneeL']))
  const order = patternChecks(ZN(['shoulderL', 'shoulderR']), { age: '50-64' }, 12).map((p) => p.id)
  check('Hypopituitarism route A: after the Cushing question, before the nerve and muscle screen, and both shoulders still fit all five weakness questions',
    order.indexOf('pc-hormone') < order.indexOf('pc-lowhormone') && order.indexOf('pc-lowhormone') < order.indexOf('pc-muscle') &&
    ['pc-pmr', 'pc-myositis', 'pc-hormone', 'pc-lowhormone', 'pc-muscle'].every((id) => order.includes(id)), order)
  const src = (await import('node:fs')).readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  check('Hypopituitarism route B: diagnosed on the cautions list; its panel covers sick-day rules, small steps, salt and water, bone, and the 911 headache signs',
    /PITUITARY_CAUTION,/.test(src) && /under-supplied, not damaged/.test(ST.PITUITARY_CAUTION.why.text) &&
    (() => { const p = ST.steroidPanel({ steroid: 'tabs' }, false, true); return p && /pituitary/i.test(p.title) && p.notes.some((n) => /sick-day/.test(n)) && p.notes.some((n) => /911/.test(n)) && p.notes.some((n) => /salt/.test(n)) })())
  const ad = ST.STEROID_RED_FLAGS.find((f) => f.id === 'st-adrenal')
  check('Hypopituitarism: hydrocortisone replacement is named in the steroid question, and the adrenal-crisis question covers diarrhoea, keeping tablets down and sick-day rules',
    /hydrocortisone/.test(ST.STEROID_STATUS.options[0].label) && /keep your steroid tablets down/.test(ad.text) && /diarrhoea/.test(ad.text) && /sick-day rules/.test(ad.why.text))
  const { REGIONS: R } = await imp('src/data/symptomGuide.js')
  const conc = R.head.conditions.find((c) => c.id === 'concussion')
  check('Hypopituitarism: the concussion record suggests a hormone blood test when symptoms last 3 months or more',
    conc && JSON.stringify(conc).includes('hormone (pituitary) blood test'))
}

// ── 36. Hyperparathyroidism ("Hyperparathyroidism", signed 3 Oct 2026) ──
{
  const PT = await imp('src/data/parathyroid.js')
  const { patternChecks } = await imp('src/data/patternChecks.js')
  const ZN = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
  const ca = (z) => patternChecks(ZN(z), {}, 12).find((p) => p.id === 'pc-calcium')
  const c = ca(['lowerlegL', 'lowerlegR'])
  check('Hyperparathyroidism route A: bone aches on both sides with a stone, easy fracture or thin bones, the thirst/mood cluster or an untested high calcium → family doctor, a blood test, no booking',
    c && c.noBooking && !c.sameDay && /kidney stone/.test(c.text) && /thin bones/.test(c.text) && /never followed up/.test(c.text) &&
    /vitamin D, calcium, phosphate, alkaline phosphatase, parathyroid hormone/.test(c.why.text), c)
  check('Hyperparathyroidism route A: for both shins, thighs or hips, or a widespread drawing; not for one knee or one hip',
    !!ca(['thighL', 'thighR']) && !!ca(['hipL', 'hipR']) && !!ca(['neck', 'shoulderL', 'hipR', 'kneeL']) && !ca(['kneeL']) && !ca(['hipL']))
  const order = patternChecks(ZN(['thighL', 'thighR']), { age: '50-64' }, 12).map((p) => p.id)
  check('Hyperparathyroidism route A: after the nerve and muscle screen, so it never pushes out the checks before it',
    order.includes('pc-calcium') && order.indexOf('pc-muscle') < order.indexOf('pc-calcium'), order)
  const src = (await import('node:fs')).readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  check('Hyperparathyroidism: the gout or pseudogout questions (knee, elbow, wrist, hand) add "under 60 or recurring → ask about calcium and PTH"',
    PT.CPPD_IDS.every((id) => Object.values(REGIONS).some((r) => r.redFlags.some((f) => f.id === id && /pseudogout/.test(f.text)))) &&
    /under 60/.test(PT.CPPD_WHY.text) && /infection/.test(PT.CPPD_WHY.text) && /CPPD_IDS\.includes\(f\.id\) \? \{ \.\.\.f, why: CPPD_WHY \}/.test(src))
  const p = PT.parathyroidPanel(true)
  check('Hyperparathyroidism route B: diagnosed on the cautions list; the panel has fluids, sit-to-stand and heel raises, no self-started supplements, the high-calcium crisis (911) and low calcium after neck surgery (same day)',
    /PARATHYROID_CAUTION,/.test(src) && p && p.notes.some((n) => /heel raises/.test(n)) && p.notes.some((n) => /supplements/.test(n)) &&
    p.notes.some((n) => /911/.test(n) && /high calcium/.test(n)) && p.notes.some((n) => /after parathyroid or thyroid surgery/.test(n) && /same day/.test(n)) &&
    PT.parathyroidPanel(false) === null)
  const osteo = REGIONS.upperback.conditions.find((x) => x.id === 'osteoporosis')
  check('Hyperparathyroidism: the osteoporosis record asks whether calcium and parathyroid hormone were checked when there is no obvious cause',
    osteo && JSON.stringify(osteo).includes('calcium and parathyroid hormone have been checked'))
  const all = JSON.stringify([PT.CALCIUM_SCREEN, PT.CPPD_WHY, PT.PARATHYROID_CAUTION, p])
  check('Hyperparathyroidism language: no "you have hyperparathyroidism", cure, guarantee or "damage"',
    !/you (may )?have hyperpara|cure|guarantee|permanent|damage/i.test(all), all.match(/you (may )?have hyperpara|cure|guarantee|permanent|damage/i))
}

// ── 37. Hyperthyroidism ("Hyperthyroidism", signed 3 Oct 2026) ──
{
  const TH = await imp('src/data/thyroid.js')
  const { patternChecks } = await imp('src/data/patternChecks.js')
  const ZN = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
  const get = (z, id, a = {}) => patternChecks(ZN(z), a, 12).find((p) => p.id === id)
  const t = get(['thighL', 'thighR'], 'pc-thyroid')
  check('Hyperthyroidism route A: both-sided weakness with weight loss, or the racing-heart/heat/tremor cluster with a neck swelling or eye changes → family doctor, thyroid blood test, keep exercise light, no booking',
    t && t.noBooking && !t.sameDay && /losing weight without trying/.test(t.text) && /front of your neck/.test(t.text) &&
    /thyroid/.test(t.why.text) && /avoid intense exercise/.test(t.why.text), t)
  check('Hyperthyroidism route A: for both shoulders, upper arms, hips or thighs, or a weakness answer; not for one knee',
    !!get(['shoulderL', 'shoulderR'], 'pc-thyroid') && !!get(['hipL', 'hipR'], 'pc-thyroid') && !get(['kneeL'], 'pc-thyroid'))
  const p = get(['kneeL', 'kneeR'], 'pc-paralysis')
  check('Periodic paralysis: sudden painless weakness of both legs (on waking, after a big meal, alcohol or hard exercise) is a 911 question for both legs or hips drawn; ancestry-neutral',
    p && p.tier === 'emergency' && p.call911 && /without pain or numbness/.test(p.text) && /large meal/.test(p.text) &&
    !/asian|descent|ethnic/i.test(p.text + p.why.text) && !get(['kneeL'], 'pc-paralysis') && !!get(['ankleL', 'ankleR'], 'pc-paralysis'), p)
  const src = (await import('node:fs')).readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  check('Safety pages: emergency pattern questions are always asked on the first pages, on top of the two others; never deferred to the end',
    /const em = kept\.filter\(\(f\) => f\.tier === 'emergency'\)/.test(src) && /!\(ownNeuropathy && f\.id === 'pc-polyneuropathy'\)/.test(src) && /const deferred = rest\.slice\(2\)/.test(src) && /patternChecks\(zones, \{\}, 12\)/.test(src))
  const order = patternChecks(ZN(['thighL', 'thighR']), { age: '50-64' }, 12).map((x) => x.id)
  check('Hyperthyroidism: both thighs at 50 to 64 still fits every check (911 on the first page, two others there, six on the final check)',
    order.filter((x) => x !== 'pc-paralysis').length === 8 && order.indexOf('pc-paralysis') === 0, order)
  const panel = TH.thyroidPanel(true)
  check('Hyperthyroidism route B: diagnosed on the cautions list; light to moderate activity until controlled; stop signs; agranulocytosis, eye and thyroid-storm warnings; sit-to-stand and step-ups',
    /THYROID_CAUTION,/.test(src) && /no vigorous or heavy exercise/.test(TH.THYROID_CAUTION.why.text) && panel &&
    /light or moderate activity/.test(panel.text) && /stop if your heart races/.test(panel.text) &&
    panel.notes.some((n) => /sore throat/.test(n) && /same day/.test(n)) && panel.notes.some((n) => /double vision/.test(n)) &&
    panel.notes.some((n) => /911/.test(n) && /high fever/.test(n)) && panel.notes.some((n) => /step-ups/.test(n)) && TH.thyroidPanel(false) === null)
  const fz = REGIONS.shoulder.conditions.find((c) => c.id === 'frozen')
  check('Hyperthyroidism: the frozen-shoulder record asks whether the thyroid and blood sugar were checked when there was no injury',
    fz && JSON.stringify(fz).includes('whether your thyroid and blood sugar have been checked'))
  const all = JSON.stringify([TH.THYROID_SCREEN, TH.PARALYSIS_FLAG, TH.THYROID_CAUTION, panel])
  check('Hyperthyroidism language: no "you have hyperthyroidism", cure, guarantee or "damage" except "not damaged"',
    !/you (may )?have hyperthy|cure|guarantee|permanent|(?<!not )damage/i.test(all), all.match(/you (may )?have hyperthy|cure|guarantee|permanent|(?<!not )damage/i))
}

// ── 38. Hypothyroidism ("Hypothyroidism", signed 3 Oct 2026) ──
{
  const TH = await imp('src/data/thyroid.js')
  const { patternChecks } = await imp('src/data/patternChecks.js')
  const { WIDESPREAD } = await imp('src/data/widespreadPain.js')
  const ZN = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
  const get = (z) => patternChecks(ZN(z), {}, 12).find((p) => p.id === 'pc-hypothyroid')
  const h = get(['handL', 'handR'])
  check('Hypothyroidism route A: stiff slow-to-recover muscles or both hands numb at night, with the slowing cluster → thyroid test in the next few weeks, booking still offered, statin line',
    h && !h.noBooking && !h.sameDay && h.tier === 'urgent' && /numb at night/.test(h.text) && /feeling cold/.test(h.text) &&
    /next few weeks/.test(h.why.text) && /statin/.test(h.why.text) && /welcome to book/.test(h.why.text), h)
  check('Hypothyroidism route A: for both hands or wrists, both calves, thighs or shoulders, or a widespread drawing; not for one wrist',
    !!get(['wristL', 'wristR']) && !!get(['lowerlegL', 'lowerlegR']) && !!get(['neck', 'shoulderL', 'hipR', 'kneeL']) && !get(['wristL']))
  const order = patternChecks(ZN(['shoulderL', 'shoulderR']), { age: '50-64' }, 12).map((x) => x.id)
  check('Hypothyroidism route A: after the other weakness and hormone questions, so it drops among the first when the final check is full',
    order.indexOf('pc-thyroid') < order.indexOf('pc-hypothyroid') && order.indexOf('pc-muscle') < order.indexOf('pc-hypothyroid'), order)
  const src = (await import('node:fs')).readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  const p = TH.hypothyroidPanel(true)
  check('Hypothyroidism route B: diagnosed on the cautions list; panel with the dose check, thyroxine timing, night splint, statin, over-replacement and 911 signs',
    /HYPOTHYROID_CAUTION,/.test(src) && p && /dose may need adjusting/.test(p.text) && p.notes.some((n) => /empty stomach/.test(n)) &&
    p.notes.some((n) => /night splint/.test(n)) && p.notes.some((n) => /cholesterol tablet/.test(n)) && p.notes.some((n) => /too high/.test(n)) &&
    p.notes.some((n) => /911/.test(n) && /very low temperature/.test(n)) && TH.hypothyroidPanel(false) === null)
  const cts = ['wrist', 'hand'].map((k) => REGIONS[k].conditions.find((c) => c.id === 'median'))
  check('Hypothyroidism cross-links: both carpal tunnel records (both hands numb at night) and the widespread-pain doctor line name a thyroid test',
    cts.every((c) => c && JSON.stringify(c).includes('whether your thyroid and blood sugar have been checked')) && /including a thyroid test/.test(WIDESPREAD.doctor))
  const all = JSON.stringify([TH.HYPOTHYROID_SCREEN, TH.HYPOTHYROID_CAUTION, p])
  check('Hypothyroidism language: no "you have hypothyroidism", cure, guarantee, and "damage" only as "not damaged" or "not that anything is damaged"',
    !/you (may )?have hypothy|cure|guarantee|permanent/i.test(all) && (all.match(/damage/g) || []).length === (all.match(/not damaged|not that anything is damaged/g) || []).length, all.match(/you (may )?have hypothy|cure|guarantee|permanent/i))
}

// ── 39. Acromegaly ("Acromegaly", signed 3 Oct 2026) ──
{
  const AC = await imp('src/data/acromegaly.js')
  const { patternChecks } = await imp('src/data/patternChecks.js')
  const ZN = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
  const get = (z) => patternChecks(ZN(z), {}, 12).find((p) => p.id === 'pc-acromegaly')
  const a = get(['kneeL', 'kneeR'])
  check('Acromegaly route A: hands, feet or jaw grown in adulthood is the gate, with several large joints or a stooping back, both hands numb, or the snoring/headache/sweating cluster → IGF-1 test, booking still offered',
    a && !a.noBooking && !a.sameDay && /hands or feet have grown/.test(a.text) && /together with any of these/.test(a.text) &&
    /IGF-1/.test(a.why.text) && /old photo/.test(a.why.text) && /welcome to book/.test(a.why.text), a)
  check('Acromegaly route A: for both knees, hips, shoulders, hands or wrists, the jaw, or a widespread drawing; not for one knee',
    !!get(['hipL', 'hipR']) && !!get(['handL', 'handR']) && !!get(['jaw']) && !!get(['neck', 'shoulderL', 'hipR', 'kneeL']) && !get(['kneeL']))
  const order = patternChecks(ZN(['shoulderL', 'shoulderR']), { age: '50-64' }, 12).map((x) => x.id)
  check('Acromegaly route A: the last pattern question; both shoulders at 50 to 64 still fit (two on the doctor page, six on the final check)',
    order[order.length - 1] === 'pc-acromegaly' && order.filter((x) => !['pc-cardiac', 'pc-visceral'].includes(x)).length === 8, order)
  const src = (await import('node:fs')).readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  const p = AC.acromegalyPanel(true)
  check('Acromegaly route B: diagnosed on the cautions list; panel with joint-protective activity, back fractures despite a normal scan, sleep apnoea, after-surgery signs, 911 headache and chest pain, bowel line',
    /ACROMEGALY_CAUTION,/.test(src) && p && p.notes.some((n) => /bone-density scan looks normal/.test(n)) && p.notes.some((n) => /sleep study/.test(n)) &&
    p.notes.some((n) => /surgeon/.test(n) && /Clear fluid/.test(n)) && p.notes.some((n) => /911/.test(n) && /vision loss/.test(n)) &&
    p.notes.some((n) => /bowel/.test(n)) && AC.acromegalyPanel(false) === null)
  const all = JSON.stringify([AC.ACROMEGALY_SCREEN, AC.ACROMEGALY_CAUTION, p])
  check('Acromegaly language: no "you have acromegaly", cure, guarantee or "damage"; "not from wearing out"',
    !/you (may )?have acromeg|cure|guarantee|permanent|damage/i.test(all) && /not from wearing out/.test(all), all.match(/you (may )?have acromeg|cure|guarantee|permanent|damage/i))
}

// ── 40. Pregnancy and the year after ("Pregnancy", v0.1, 3 Oct 2026) ──
{
  const PG = await imp('src/data/pregnancy.js')
  const { emergencyLevel } = await imp('src/data/emergencyAdvice.js')
  const ZN = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
  const src = (await import('node:fs')).readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  check('Pregnancy: asked of female or "prefer not to say" aged 16 to 49, not of men, 5 to 15s, under 5s or 50 and over; required; out of the anonymous copy',
    PG.pregnancyAsked({ sex: 'female', age: '30-49' }) && PG.pregnancyAsked({ sex: 'other', age: '18-29' }) && !PG.pregnancyAsked({ sex: 'female', age: 'u18' }) &&
    !PG.pregnancyAsked({ sex: 'female', age: '50-64' }) &&
    !PG.pregnancyAsked({ sex: 'male', age: '30-49' }) && !PG.pregnancyAsked({ sex: 'female', age: 'u5' }) && !PG.pregnancyAsked({ sex: 'female', age: 'o64' }) &&
    /\(!pregAsk \|\| answers\.preg\)/.test(src) && /\^preg\|/.test(src))
  const ids = (st, z) => PG.pregnancyRedFlags(ZN(z), { preg: st }).map((f) => f.id)
  check('Pregnancy red flags: none when not pregnant; first on the safety pages, in every area (one wrist)',
    !ids('no', ['wristL']).length && /\[\.\.\.obstetric, (\.\.\.oiFlags, )?\.\.\.diabetic/.test(src) &&
    ['pg-bleed', 'pg-labour', 'pg-preeclampsia', 'pg-movements', 'pg-pe', 'pg-dvt'].every((x) => ids('p3', ['wristL']).includes(x)))
  check('Pregnancy red flags by stage: early pregnancy has no pre-eclampsia or movements question; after the birth, heavy bleeding, infection and mood; at a year, no clot or bleeding',
    !ids('p1', ['sij']).includes('pg-preeclampsia') && !ids('p1', ['sij']).includes('pg-movements') &&
    ['pg-pph', 'pg-postinfect', 'pg-mind', 'pg-preeclampsia', 'pg-pe'].every((x) => ids('pp6', ['sij']).includes(x)) &&
    !['pg-pph', 'pg-pe', 'pg-dvt', 'pg-bleed'].some((x) => ids('pp12', ['sij']).includes(x)) && ids('pp12', ['sij']).includes('pg-mind'))
  const F = Object.fromEntries(PG.PREG_RED_FLAGS.map((f) => [f.id, f]))
  check('Pregnancy routes: heavy bleeding, a hard bump, postpartum haemorrhage and a lung clot call 911; waters, tightenings, pre-eclampsia and fewer movements go to labour and delivery; the mood flag goes now with 9-8-8',
    ['pg-bleed', 'pg-abdo', 'pg-pph', 'pg-pe'].every((x) => emergencyLevel([F[x]]) === 'call911') &&
    ['pg-labour', 'pg-preeclampsia', 'pg-movements'].every((x) => emergencyLevel([F[x]]) === 'labour') &&
    emergencyLevel([F['pg-mind']]) === 'goNow' && /9-8-8/.test(F['pg-mind'].why.text))
  const sij = (await imp('src/data/symptomGuide.js')).REGIONS.sij.redFlags
  const onSij = PG.pregnancyRedFlags(ZN(['sij']), { preg: 'p3' }, sij)
  check('Pregnancy red flags: not asked twice where the area already asks them (the pelvis\'s pregnancy, cauda equina and kidney questions)',
    !onSij.some((f) => ['pg-bleed', 'pg-labour', 'pg-cauda', 'pg-infection'].includes(f.id)) && onSij.some((f) => f.id === 'pg-abdo'), onSij.map((f) => f.id))
  check('Pregnancy: "No" leaves out the areas\' "Are you pregnant and…" questions, but not "could you be pregnant" (ectopic)',
    /notPregnant && PREG_ASKED_IDS\.includes/.test(src) && !/'hpf-ectopic'|'srf-ectopic'/.test(src.match(/PREG_ASKED_IDS = \[[^\]]*\]/)[0]))
  check('Pregnancy: from 13 weeks, the ectopic questions are left out',
    /established && ECTOPIC_IDS\.includes/.test(src) && /ECTOPIC_IDS = \['hpf-ectopic', 'srf-ectopic'\]/.test(src))
  const b = PG.pregnancyBonus({ preg: 'p3' })
  check('Pregnancy lift: pelvic girdle, pubic, carpal tunnel and de Quervain\'s, by stage, in the order only; none when not pregnant',
    b('sij', 'pgp') === 2 && b('wrist', 'median') === 2 && b('wrist', 'dq') === 2 && PG.pregnancyBonus({ preg: 'pp12' })('wrist', 'median') === 0 &&
    PG.pregnancyBonus({ preg: 'no' }) === null && /pregnancyBonus\(answers\)/.test(src))
  const rk = (rid, cid) => ({ rk: rid, c: { id: cid } })
  const p = PG.pregnancyPanel({ preg: 'p2' }, [rk('sij', 'pgp')])
  const pl = PG.pregnancyPanel({ preg: 'p2', pregLimit: ['placenta'] }, [rk('sij', 'pgp')])
  const pp = PG.pregnancyPanel({ preg: 'pp6', pregBirth: 'caesarean' }, [rk('wrist', 'dq')])
  check('Pregnancy panel: knees-together strategies and 150 minutes a week; with a contraindication, no dose and "confirm with your maternity team"; after a caesarean, the slower return and the scoop lift',
    p.notes.some((n) => /knees together/.test(n)) && p.notes.some((n) => /150 minutes/.test(n)) &&
    !pl.notes.some((n) => /150 minutes/.test(n)) && pl.notes.some((n) => /confirm with your maternity team/.test(n)) &&
    pp.notes.some((n) => /after a caesarean/.test(n)) && pp.notes.some((n) => /scoop/.test(n)) && pp.notes.some((n) => /pelvic-health physiotherapist/.test(n)) &&
    PG.pregnancyPanel({ preg: 'no' }, []) === null && /pregnancy: pgPanel/.test(src))
  const pgp = (await imp('src/data/symptomGuide.js')).REGIONS.sij.conditions.find((c) => c.id === 'pgp')
  const all = JSON.stringify([PG.PREG_RED_FLAGS, p, pl, pp, PG.pregnancyPanel({ preg: 'pp12' }, []), pgp.blurb])
  check('Pregnancy language: no loose ligaments, instability or "out of alignment" (only "not loose or out of place"); no cure or guarantee',
    !/unstable|instabil|alignment|ligaments? (are|is) loose|loosen|cure|guarantee/i.test(all) &&
    (all.match(/loose/g) || []).length === (all.match(/not loose|about joints being loose/g) || []).length, all.match(/unstable|instabil|alignment|loosen|cure|guarantee/i))
}

// ── 41. Osteogenesis imperfecta ("Osteogenesis Imperfecta", v0.1, 4 Oct 2026) ──
{
  const OI = await imp('src/data/oi.js')
  const { emergencyLevel } = await imp('src/data/emergencyAdvice.js')
  const { REGIONS } = await imp('src/data/symptomGuide.js')
  const src = (await import('node:fs')).readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  check('OI: an optional tick on "A little about you" (not required to continue), out of the anonymous copy, cleared with its details',
    /OI_STATUS\.text/.test(src) && !/answers\.oi/.test(src.match(/const aboutDone = [^\n]*/)[0]) && /\^preg\|\^oi[|)]/.test(src) &&
    /dropOi = \(\{ oi, oiType, oiGoal, oiFalls, oiCare, \.\.\.a \}\)/.test(src))
  check('OI red flags: none without the tick; with it, first on the safety pages in every area, after the obstetric ones',
    !OI.oiRedFlags({}).length && OI.oiRedFlags({ oi: 'yes' }).length === 6 &&
    /\[\.\.\.obstetric, \.\.\.oiFlags, \.\.\.diabetic, \.\.\.steroid, \.\.\.list, \.\.\.pattern\]/.test(src) && /answers\.preg, answers\.oi[,\]]/.test(src))
  const rf = Object.fromEntries(OI.OI_RED_FLAGS.map((f) => [f.id, f]))
  check('OI fracture first: new pain after a small knock, lift, twist or sneeze, even mild, or sudden severe back pain → X-ray today or tomorrow, booking after the X-ray',
    rf['oi-fracture'].tier === 'urgent' && rf['oi-fracture'].sameDay && rf['oi-fracture'].noBooking &&
    /sneeze/.test(rf['oi-fracture'].text) && /even if it feels mild/.test(rf['oi-fracture'].text) && /back pain/.test(rf['oi-fracture'].text) &&
    /today or tomorrow/.test(rf['oi-fracture'].why.text) && /welcome to book once you have had your X-ray/.test(rf['oi-fracture'].why.text))
  check('OI emergencies: a deformed limb, any head injury, the skull-base headache and spreading weakness go to the emergency department; chest pain names 911',
    ['oi-break', 'oi-head', 'oi-skullbase', 'oi-cord'].every((id) => rf[id].tier === 'emergency') &&
    /cough, sneeze or strain/.test(rf['oi-skullbase'].text) && emergencyLevel([rf['oi-head']]) !== 'call911' &&
    rf['oi-heart'].sameDay && /Call 911 now for chest pain/.test(rf['oi-heart'].why.text))
  const low = OI.oiRedFlags({ oi: 'yes' }, REGIONS.lowback.redFlags)
  check('OI red flags: the spinal cord question is not asked twice where the area asks about cauda equina',
    !low.some((f) => f.id === 'oi-cord') && low.some((f) => f.id === 'oi-fracture'), low.map((f) => f.id))
  const p = OI.oiPanel({ oi: 'yes' })
  const pr = OI.oiPanel({ oi: 'yes', oiGoal: 'after', oiFalls: '2', oiCare: 'stopped' })
  check('OI panel: OI-safe exercise rules and the gentle-handling statement always; the main problem leads; falls, stopped denosumab and specialist lines by answer; hearing',
    p && p.notes.some((n) => /forceful stretching of loose joints/.test(n)) && p.notes.some((n) => /no forceful manipulation/.test(n)) &&
    p.notes.some((n) => /hearing test/.test(n)) && /^After a fracture or surgery/.test(pr.text) && /cleared you/.test(pr.text) &&
    pr.notes.some((n) => /review your bone medicine/.test(n)) && pr.notes.some((n) => /spine within months/.test(n)) &&
    pr.notes.some((n) => /referral back to a bone or OI specialist/.test(n)) && !p.notes.some((n) => /referral back/.test(n)) &&
    OI.oiPanel({}) === null && /oi: oiP/.test(src))
  check('OI details: four optional questions on "Before your results"; summary lines for Chandra',
    OI.OI_DETAILS.length === 4 && /OI_DETAILS\.map/.test(src) && OI.oiSummary({ oi: 'yes', oiType: 't1' }).some((l) => /Type I/.test(l)) && !OI.oiSummary({}).length)
  const all = JSON.stringify([OI.OI_RED_FLAGS, p, pr, OI.OI_DETAILS])
  check('OI language: "less tough", not "fragile"; "brittle" only as the common name; no cure or guarantee',
    !/fragile|cure|guarantee|brittle/i.test(all) && /brittle bone disease/.test(OI.OI_STATUS.text), all.match(/fragile|cure|guarantee|brittle/i))
}

// ── 42. Osteomalacia ("Osteomalacia", v0.1, 4 Oct 2026) ──
{
  const PT = await imp('src/data/parathyroid.js')
  const OM = await imp('src/data/osteomalacia.js')
  const WS = await imp('src/data/widespreadPain.js')
  const { patternChecks } = await imp('src/data/patternChecks.js')
  const { REGIONS } = await imp('src/data/symptomGuide.js')
  const ZN = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
  const src = (await import('node:fs')).readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  const c = PT.CALCIUM_SCREEN
  check('Osteomalacia route A: folded into the calcium screen: bones tender to press, weak hips or a waddle, a stress fracture without sport, the risk cluster; one blood test with phosphate and ALP; names soft bones',
    /press firmly on your shin, breastbone/.test(c.text) && /waddle/.test(c.text) && /without running or heavy sport/.test(c.text) &&
    /darker skin/.test(c.text) && /weight-loss surgery/.test(c.text) && /anti-seizure/.test(c.text) &&
    /phosphate, alkaline phosphatase, parathyroid hormone and kidney function/.test(c.why.text) && /osteomalacia, "soft bones"/.test(c.why.text) &&
    /mistaken for fibromyalgia/.test(c.why.text))
  const kid = (z, age) => patternChecks(ZN(z), { age }, 12).find((p) => p.id === 'pc-rickets')
  check('Rickets: under 5 with a leg or wrist drawn, 5 to 15 with both legs; doctor first, no booking, 911 for a seizure or floppiness; not for adults or a teenager\'s one wrist',
    !!kid(['kneeL'], 'u5') && !!kid(['wristL'], 'u5') && !!kid(['lowerlegL', 'lowerlegR'], 'u18') && !kid(['wristL'], 'u18') && !kid(['kneeL'], 'u18') && !kid(['kneeL'], '30-49') && !kid(['shoulderL'], 'u18') &&
    kid(['kneeL'], 'u5').noBooking && /911/.test(OM.RICKETS_SCREEN.why.text) && /floppy/.test(OM.RICKETS_SCREEN.why.text))
  check('Osteomalacia cross-links: the hip, thigh, knee, shin and foot stress-fracture questions add the bone blood test for a repeat or low-training stress fracture',
    OM.STRESS_IDS.every((id) => Object.values(REGIONS).some((r) => r.redFlags.some((f) => f.id === id))) &&
    /STRESS_IDS\.includes\(f\.id\)/.test(src) && /not your first stress fracture/.test(OM.STRESS_LINE) && /vitamin D/.test(WS.WIDESPREAD.doctor))
  const osteo = REGIONS.upperback.conditions.find((x) => x.id === 'osteoporosis')
  check('Osteomalacia cross-links: the osteoporosis record names vitamin D in the "ask your doctor" line',
    osteo && JSON.stringify(osteo).includes('vitamin D, calcium and parathyroid hormone have been checked'))
  const p = OM.osteomalaciaPanel(true)
  check('Osteomalacia route C: diagnosed on the cautions list; panel with keep taking supplements, gradual strength, weight-bearing plan, the 3-month review, the groin crack and low calcium (911 seizure); in the PDF',
    /OSTEOMALACIA_CAUTION,/.test(src) && p && p.notes.some((n) => /come back when supplements stop/.test(n)) && p.notes.some((n) => /sit-to-stands/.test(n)) &&
    p.notes.some((n) => /about 3 months/.test(n)) && p.notes.some((n) => /groin, hip or thigh/.test(n)) && p.notes.some((n) => /Call 911 for a seizure/.test(n)) &&
    OM.osteomalaciaPanel(false) === null && /osteomalacia: omPanel/.test(src))
  const all = JSON.stringify([c, OM.RICKETS_SCREEN, OM.OSTEOMALACIA_CAUTION, p, OM.STRESS_LINE])
  check('Osteomalacia language: no "you have osteomalacia", cure, guarantee, "permanent" or "damage"; no community named',
    !/you (may )?have osteomalacia|cure|guarantee|permanent|damage|south asian|migrat|ethnic/i.test(all), all.match(/you (may )?have osteomalacia|cure|guarantee|permanent|damage|south asian|migrat|ethnic/i))
}

// ── 43. Osteopenia ("Osteopenia", v0.1, 4 Oct 2026) ──
{
  const OP = await imp('src/data/osteopenia.js')
  const { REGIONS } = await imp('src/data/symptomGuide.js')
  const src = (await import('node:fs')).readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  const inj = (await import('node:fs')).readFileSync(new URL('../src/data/injuryScreen.js', import.meta.url), 'utf8')
  check('Osteopenia: on the cautions list (physio route, booking never held), optional risk questions, out of the anonymous copy',
    /OSTEOPENIA_CAUTION,/.test(src) && OP.OSTEOPENIA_CAUTION.tier === 'caution' && /BONE_DETAILS\.map/.test(src) && /\^oi\|\^bn\)/.test(src) && /bone: bnPanel/.test(src))
  const osteoFlags = Object.values(REGIONS).flatMap((r) => r.redFlags).filter((f) => [].concat(f.group || []).includes('osteo'))
  check('Osteopenia fracture first: every spine fragile-bone question, the hip "no fall" question, the fall checks and the hip injury screen say "osteoporosis or low bone density"',
    osteoFlags.length >= 5 && osteoFlags.every((f) => /osteoporosis or low bone density/.test(f.text)) &&
    /osteoporosis or low bone density/.test(REGIONS.hip.redFlags.find((f) => f.id === 'hpf-nofall').text) &&
    /or have osteoporosis or low bone density',/.test(src) && /osteoporosis or low bone density/.test(inj), osteoFlags.map((f) => f.id))
  const R = OP.boneRisk
  check('Osteopenia clarifier: "ask your doctor" for a total of 5 or more, a hip/spine or 2+ fracture, height loss, a secondary cause, or 2+ falls at 65+; not for one risk factor; steroid tablets count from "A little about you"',
    R({ bnFracture: 'hipspine' }).askDoctor && R({ bnFracture: 'two' }).reclassify && R({ bnHeight: 'yes' }).askDoctor && R({ bnRisk: ['gut'] }).askDoctor &&
    R({ bnFalls: 'two', age: 'o64' }).askDoctor && !R({ bnFalls: 'two', age: '50-64' }).askDoctor && !R({ bnRisk: ['smoke'] }).askDoctor &&
    R({ bnFracture: 'one', bnFalls: 'one' }).askDoctor && R({ bnRisk: ['smoke', 'parent'], steroid: 'tabs', bnFalls: 'one' }).askDoctor &&
    !R({ bnRisk: ['smoke', 'parent'], bnFalls: 'one' }).askDoctor)
  const plain = OP.bonePanel(['ca-osteopenia'], {}), high = OP.bonePanel(['ca-osteopenia'], { bnFracture: 'hipspine', bnHeight: 'yes', bnFalls: 'one' })
  check('Osteopenia panel: strength twice a week, daily balance, gradual impact without a spine fracture, hip-hinge technique; the FRAX, osteoporosis, spine X-ray and falls lines only when the answers call for them; no number shown',
    plain.notes.some((n) => /twice a week/.test(n)) && plain.notes.some((n) => /heel drops/.test(n) && /not had a spine fracture/.test(n)) &&
    plain.notes.some((n) => /hips and knees/.test(n)) && !plain.notes.some((n) => /FRAX/.test(n)) &&
    high.notes.some((n) => /FRAX/.test(n)) && high.notes.some((n) => /treated as osteoporosis/.test(n)) && high.notes.some((n) => /spine X-ray/.test(n)) &&
    high.notes.some((n) => /falls check/.test(n)) && !/\d+ ?%/.test(JSON.stringify(high)) && OP.bonePanel([], {}) === null)
  const all = JSON.stringify([OP.OSTEOPENIA_CAUTION, OP.BONE_DETAILS, plain, high])
  check('Osteopenia language: no "thin" or "fragile" bones, cure or guarantee; "avoid" only for specific movements',
    !/thin(ning)? bones|fragile|cure|guarantee/i.test(all) && (all.match(/avoid/gi) || []).length === (all.match(/avoid lifting and twisting|avoid things for fear of falling|is not avoided/g) || []).length, all.match(/thin(ning)? bones|fragile|cure|guarantee|avoid[^.]*/gi))
}

// ── 44. Age bands "5 to 15" and "16 to 29"; pregnancy questions 16 to 49 (Chandra, 4 Oct 2026) ──
{
  const { REGIONS } = await imp('src/data/symptomGuide.js')
  const { forPerson } = await imp('src/data/assessmentFlow.js')
  const src = (await import('node:fs')).readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  const ageQs = Object.values(REGIONS).map((r) => (r.context || []).find((q) => q.id === 'age')).filter(Boolean)
  check('Age bands: every age question says "5 to 15" and "16 to 29" (codes u18 and 18-29 kept)',
    ageQs.length > 15 && ageQs.every((q) => q.options.some((o) => o.id === 'u18' && o.label === '5 to 15') && q.options.some((o) => o.id === '18-29' && o.label === '16 to 29')) &&
    /\{ id: 'u18', label: '5 to 15' \}, \{ id: '18-29', label: '16 to 29' \}/.test(src))
  const preg = Object.values(REGIONS).flatMap((r) => r.redFlags).filter((f) => ['prf-pregnancy-bleed', 'prf-pregnancy', 'hrf-pregnancy', 'hpf-ectopic', 'srf-ectopic'].includes(f.id))
  const asks = (f, age) => forPerson(f, { age, sex: 'female' })
  check('Pregnancy and ectopic safety questions in the areas: asked of women 16 to 49 only, not 5 to 15 or 50 and over',
    preg.length === 5 && preg.every((f) => asks(f, '18-29') && asks(f, '30-49') && !asks(f, 'u18') && !asks(f, '50-64') && !asks(f, 'o64')), preg.map((f) => f.id))
  check('"Pregnant, or within 3 months of giving birth" on the cautions list: 16 to 64 (the fallback at 50 to 64), not for children',
    /id: 'ca-preg', sex: 'female', ages: \['18-29', '30-49', '50-64'\]/.test(src))
}

// ── 45. Osteosarcoma ("Osteosarcoma", v0.1, 4 Oct 2026) ──
{
  const BT = await imp('src/data/boneTumour.js')
  const { patternChecks } = await imp('src/data/patternChecks.js')
  const { REGIONS } = await imp('src/data/symptomGuide.js')
  const ZN = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
  const src = (await import('node:fs')).readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  const pc = (z, a, id) => patternChecks(ZN(z), a, 12).find((x) => x.id === id)
  const y = pc(['kneeL'], { age: 'u18', duration: 'd6w' }, 'pc-bone-young')
  check('Bone rule, young: one knee for 2 weeks or more at 5 to 29 → X-ray today or tomorrow, no booking; not under 2 weeks, both knees or a widespread drawing',
    y && y.sameDay && y.noBooking && /today or tomorrow/.test(y.why.text) && /whole bone/.test(y.why.text) && /do not start or continue physiotherapy/.test(y.why.text) &&
    !pc(['kneeL'], { age: 'u18', duration: 'd2w' }, 'pc-bone-young') && !pc(['kneeL', 'kneeR'], { age: 'u18', duration: 'd3m' }, 'pc-bone-young') &&
    !pc(['kneeL', 'neck', 'shoulderR', 'hipL'], { age: '18-29', duration: 'd3m' }, 'pc-bone-young') &&
    !!pc(['upperarmR'], { age: '18-29', duration: 'o3m' }, 'pc-bone-young') && !!pc(['kneeL', 'thighL'], { age: 'u5', duration: 'd6w' }, 'pc-bone-young'), y)
  const ad = pc(['shoulderR'], { age: '50-64', duration: 'd3m' }, 'pc-bone')
  check('Bone rule, 30 and over: this week, no booking, a narrower question (deep in the bone, not the joint or a tendon; building AND at rest or night, or a swelling)',
    ad && ad.noBooking && !ad.sameDay && /this week/.test(ad.why.text) && /not in the joint or a tendon/.test(ad.text) && /week by week and is there at rest/.test(ad.text) &&
    !pc(['shoulderR'], { age: '50-64', duration: 'd3m' }, 'pc-bone-young') && !pc(['shoulderR'], { age: 'u18', duration: 'd3m' }, 'pc-bone'), ad)
  const tum = Object.values(REGIONS).flatMap((r) => r.redFlags).filter((f) => BT.TUMOUR_IDS.includes(f.id))
  check('Bone rule: the young knee, thigh and shin tumour questions get the same X-ray routing (today or tomorrow, no booking)',
    tum.length === 3 && /TUMOUR_IDS\.includes\(f\.id\) \? \{ \.\.\.f, noBooking: true, sameDay: true, why: BONE_WHY_YOUNG \}/.test(src))
  check('Bone rule: the watch line on the results for one bone at 5 to 29 or 65 and over, not at 30 to 64',
    BT.boneWatch(ZN(['kneeL']), { age: 'u18' }) && BT.boneWatch(ZN(['hipR']), { age: 'o64' }) && !BT.boneWatch(ZN(['kneeL']), { age: '30-49' }) &&
    !BT.boneWatch(ZN(['kneeL', 'kneeR']), { age: 'u18' }) && /boneWatch\(zones, answers\) &&/.test(src) && /BONE_WATCH/.test(src))
  const p = BT.boneTumourPanel(true)
  check('Bone tumour, treated: on the cautions list; panel with the clearance line, implant guidance, chemotherapy fever, the treated limb, heart and clot (911) signs, surveillance; in the PDF',
    /BONE_TUMOUR_CAUTION,/.test(src) && p && p.notes.some((n) => /weight-bearing and movement limits/.test(n)) && p.notes.some((n) => /38 °C/.test(n)) &&
    p.notes.some((n) => /clunk/.test(n)) && p.notes.some((n) => /Call 911/.test(n)) && p.notes.some((n) => /new lump/.test(n)) &&
    BT.boneTumourPanel(false) === null && /boneTumour: btPanel/.test(src))
  const rec = JSON.stringify([BT.BONE_SCREEN, BT.BONE_SCREEN_ADULT, BT.BONE_WHY_YOUNG, BT.BONE_WHY_ADULT, BT.BONE_WATCH])
  check('Bone rule language: the recognition screens never say cancer, tumour or sarcoma; no survival figures, cure or guarantee anywhere',
    !/cancer|tumou?r|sarcoma/i.test(rec) && !/survival|cure|guarantee|\d+ ?%/i.test(rec + JSON.stringify(p)), rec.match(/cancer|tumou?r|sarcoma/i))
}

// ── 46. Paget's disease of bone ("Pagets Disease", v0.1, 4 Oct 2026) ──
{
  const PG = await imp('src/data/paget.js')
  const BT = await imp('src/data/boneTumour.js')
  const { patternChecks } = await imp('src/data/patternChecks.js')
  const ZN = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
  const src = (await import('node:fs')).readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  const pc = (z, a) => patternChecks(ZN(z), a, 12).find((x) => x.id === 'pc-paget')
  const c = pc(['lowerlegL'], { age: 'o64', duration: 'o3m' })
  check('Paget route A: 50 and over, one shin, thigh, hip, pelvis, low back or head for 6 weeks or more → blood test and X-ray, booking still offered, named; no ancestry question',
    c && !c.noBooking && !c.sameDay && /warmer/.test(c.text) && /bowed/.test(c.text) && /hat size/.test(c.text) && /alkaline phosphatase/.test(c.text) &&
    /Paget's disease of bone/.test(c.why.text) && /blood test and an X-ray/.test(c.why.text) && /welcome to book/.test(c.why.text) &&
    !/ancestry|descent|British|European|Asian/i.test(c.text + c.why.text) &&
    !!pc(['head'], { age: '50-64', duration: 'd3m' }) && !!pc(['lowerback'], { age: '50-64', duration: 'o3m' }), c)
  check('Paget route A: not under 50, not for under 6 weeks, not for both shins or a widespread drawing',
    !pc(['lowerlegL'], { age: '30-49', duration: 'o3m' }) && !pc(['lowerlegL'], { age: 'o64', duration: 'd6w' }) &&
    !pc(['lowerlegL', 'lowerlegR'], { age: 'o64', duration: 'o3m' }) && !pc(['lowerlegL', 'neck', 'shoulderR', 'hipL'], { age: 'o64', duration: 'o3m' }))
  check('Paget sarcoma flag: the adult bone question tells someone with Paget\'s to answer yes for new, worsening pain or a new swelling in that bone (X-ray this week)',
    /If you have Paget's disease of bone, answer yes for new pain in that bone that is steadily getting worse/.test(BT.BONE_SCREEN_ADULT.text) && /this week/.test(BT.BONE_WHY_ADULT.text))
  const p = PG.pagetPanel(true)
  check('Paget route B: on the cautions list; panel with the four pain sources, no heavy impact on a bowed bone, the ALP check, tell the surgeon, the X-ray-within-a-week, fracture, cord and calcium signs; in the PDF',
    /PAGET_CAUTION,/.test(src) && p && /four places/.test(p.text) && p.notes.some((n) => /jumping and heavy impact on a bowed/.test(n)) &&
    p.notes.some((n) => /alkaline phosphatase/.test(n)) && p.notes.some((n) => /surgeon, dentist/.test(n)) && p.notes.some((n) => /within a week/.test(n)) &&
    p.notes.some((n) => /emergency department today/.test(n)) && p.notes.some((n) => /emergency department now/.test(n)) && p.notes.some((n) => /high calcium/.test(n)) &&
    PG.pagetPanel(false) === null && /paget: pgtPanel/.test(src))
  const all = JSON.stringify([PG.PAGET_SCREEN, PG.PAGET_CAUTION, p])
  check('Paget language: no cancer, cure, guarantee or "damage"; "tumour" not used',
    !/cancer|tumou?r|sarcoma|cure|guarantee|damage/i.test(all), all.match(/cancer|tumou?r|sarcoma|cure|guarantee|damage/i))
}

// ── 47. "No" first for yes/no questions; "None" and list negatives last (Chandra, 4 Oct 2026) ──
{
  const { arrangeOptions, kindOf, isListQuestion } = await imp('src/data/optionOrder.js')
  const { REGIONS } = await imp('src/data/symptomGuide.js')
  const DM = await imp('src/data/diabetes.js')
  const ST = await imp('src/data/steroids.js')
  const PG = await imp('src/data/pregnancy.js')
  const OI = await imp('src/data/oi.js')
  const BN = await imp('src/data/osteopenia.js')
  const src = (await import('node:fs')).readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  const sg = (await import('node:fs')).readFileSync(new URL('../src/components/SymptomGuide.jsx', import.meta.url), 'utf8')
  const ids = (q) => arrangeOptions(q.options, q.text).map((o) => o.id)
  check('Order: yes/no questions in "A little about you" show No and Not sure first (diabetes, steroids, pregnancy)',
    ids(DM.DM_STATUS).slice(0, 2).join() === 'no,ns' && ids(ST.STEROID_STATUS).slice(0, 2).join() === 'no,ns' && ids(PG.PREG_STATUS)[0] === 'no')
  check('Order: "None of these" goes last, after the list (maternity limits, bone risk factors)',
    ids(PG.PREG_LIMITS).at(-1) === 'none' && ids(BN.BONE_DETAILS.find((q) => q.id === 'bnRisk')).at(-1) === 'none')
  check('Order: a choice question keeps "Not sure" last (OI type); a yes/no one after an opening phrase puts "No" first (bone fracture since 40)',
    ids(OI.OI_DETAILS.find((q) => q.id === 'oiType')).at(-1) === 'ns' && ids(BN.BONE_DETAILS.find((q) => q.id === 'bnFracture'))[0] === 'no' &&
    ids(BN.BONE_DETAILS.find((q) => q.id === 'bnFalls'))[0] === 'no')
  check('Order: question wording is read correctly',
    !isListQuestion('Is there any swelling or change in the skin?') && !isListQuestion('Have you injured your lower leg in the last 6 weeks?') &&
    !isListQuestion('Since age 40, have you broken a bone from a fall?') && isListQuestion('How does the pain behave with running or exercise?') &&
    isListQuestion('Which of these bring it on? Tick all that apply.') && isListQuestion('Do any of these apply to you? Tick all that apply.') &&
    isListQuestion('Over a typical day, when is it worst?'))
  check('Order: answers are sorted by meaning',
    kindOf({ label: 'None of these bring it on' }) === 'none' && kindOf({ label: 'Nothing specific' }) === 'none' && kindOf({ label: 'No, or I cannot find one' }) === 'no' &&
    kindOf({ label: 'It is not linked to exercise' }) === 'no' && kindOf({ label: 'Never' }) === 'no' && kindOf({ label: 'Not on the bone, in the muscle beside it' }) === '' &&
    kindOf({ label: 'Something else — type it below' }) === '' && kindOf({ label: 'I would rather not try' }) === '' && kindOf({ label: 'No falls, but I feel unsteady or hold on to furniture' }) === '' && kindOf({ label: 'No; it comes on when I use my forearm, with an ache in the forearm' }) === '' &&
    kindOf({ label: 'Pain goes into the upper arm, but not past the elbow' }) === '')
  // Every area question: "none" last; "no" first for yes/no questions, last for lists; the rest in its original order.
  const qs = Object.values(REGIONS).flatMap((r) => [...(r.questions || []), ...(r.context || [])]).flatMap((q) => [q, ...(q.group || [])]).filter((q) => Array.isArray(q.options))
  const bad = qs.filter((q) => {
    const opts = q.options.map((o) => (typeof o === 'string' ? { id: o, label: o } : o))
    const out = arrangeOptions(opts, q.text)
    const list = isListQuestion(q.text)
    const real = out.filter((o) => !kindOf(o)).map((o) => o.id).join() === opts.filter((o) => !kindOf(o)).map((o) => o.id).join()
    const firstReal = out.findIndex((o) => !kindOf(o)), lastReal = out.map((o) => !kindOf(o)).lastIndexOf(true)
    const placed = out.every((o, i) => !kindOf(o) || (kindOf(o) === 'none' || list ? i > lastReal : i < firstReal) || firstReal < 0)
    return !real || !placed
  })
  check('Order: every area question places its "No", "Not sure" and "None" answers by these rules, the rest in order', qs.length > 100 && bad.length === 0, bad.map((q) => q.id))
  const uses = (src.match(/arrange(Options|Split)\(/g) || []).length
  check('Order: applied to every answer list (questions, grouped questions, About you, details, maternity limits, injury screens, Symptom Guide); emergency pages keep "None of these apply" below',
    uses >= 10 && (sg.match(/arrangeOptions\(/g) || []).length >= 2 && !/\{q\.options\.map\(/.test(src) && !/negativesFirst/.test(src + sg) && /Something else — type it below<\/span>[\s\S]*?tail\.map/.test(src) && /None of These Apply — Continue/.test(src), uses)
}

// ── 48. Safety pages: most severe first, every time (Chandra, 4 Oct 2026) ──
{
  const { severityRank, bySeverity } = await imp('src/data/emergencyAdvice.js')
  const { REGIONS } = await imp('src/data/symptomGuide.js')
  const OI = await imp('src/data/oi.js')
  const src = (await import('node:fs')).readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  const sg = (await import('node:fs')).readFileSync(new URL('../src/components/SymptomGuide.jsx', import.meta.url), 'utf8')
  check('Severity: 911, then emergency department or labour and delivery, then the crisis line; then doctor today with booking held, doctor today, doctor first in a few days, see your doctor',
    severityRank({ tier: 'emergency', call911: true }) === 1 && severityRank({ tier: 'emergency', keepNeckStill: true }) === 1 &&
    severityRank({ tier: 'emergency' }) === 2 && severityRank({ tier: 'emergency', goTo: 'labour' }) === 2 && severityRank({ tier: 'emergency', goTo: 'crisis' }) === 3 &&
    severityRank({ tier: 'urgent', sameDay: true, noBooking: true }) === 4 && severityRank({ tier: 'urgent', sameDay: true }) === 5 &&
    severityRank({ tier: 'urgent', noBooking: true }) === 6 && severityRank({ tier: 'urgent' }) === 7)
  const mixed = [{ id: 'a', tier: 'urgent' }, { id: 'b', tier: 'urgent', sameDay: true }, { id: 'c', tier: 'urgent' }, { id: 'd', tier: 'urgent', sameDay: true, noBooking: true }, { id: 'e', tier: 'urgent', noBooking: true }]
  check('Severity: sorted most severe first, equal severity keeps its order (a stable sort)',
    bySeverity(mixed).map((f) => f.id).join() === 'd,b,e,a,c')
  const leg = bySeverity(REGIONS.leg.redFlags.filter((f) => f.tier === 'emergency'))
  const ranks = leg.map(severityRank)
  check('Severity: a real page (lower leg emergencies) has every 911 question above the go-now ones',
    leg.length > 3 && ranks.every((r, i) => i === 0 || ranks[i - 1] <= r) && ranks[0] === 1, leg.map((f) => f.id + ':' + severityRank(f)))
  const oi = bySeverity(OI.oiRedFlags({ oi: 'yes' }))
  check('Severity: dynamic, from the questions that apply (OI on: the emergency ones above the doctor-today ones)',
    oi.findIndex((f) => f.tier !== 'emergency') > oi.map((f) => f.tier).lastIndexOf('emergency'))
  check('Severity: applied to the emergency page, the doctor page, the final check and the Symptom Guide',
    /emergency: bySeverity\(/.test(src) && /byMechanism\(bySeverity\(\[\.\.\.all/.test(src) && /return bySeverity\(out\)/.test(src) && /const all = bySeverity\(/.test(sg))
}

// ── 49. Smarter safety flow: knee, foot, hip, ankle (Chandra, 4 Oct 2026) ──
{
  const G = await imp('src/data/safetyGates.js')
  const { REGIONS } = await imp('src/data/symptomGuide.js')
  const { forPerson } = await imp('src/data/assessmentFlow.js')
  const { bySeverity } = await imp('src/data/emergencyAdvice.js')
  const src = (await import('node:fs')).readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  const UNI = [{ id: 'sc-neuro', tier: 'urgent', text: 'n' }, { id: 'sc-systemic', tier: 'urgent', text: 's' }]
  const page = (area, age, sex, inj) => {
    const before = bySeverity([...REGIONS[area].redFlags.filter((f) => f.tier !== 'emergency' && forPerson(f, { age, sex })), ...UNI])
    const doc = G.byMechanism(before, { [area + ':I1']: inj })
    const list = [...doc, ...G.gateUnsureFlags(doc, area)]
    return { before, list, rows: G.gateRows(list) }
  }
  const counts = {
    knee: [page('knee', '30-49', 'male', 'no'), page('knee', 'u18', 'male', 'no')],
    foot: [page('foot', '30-49', 'male', 'no'), page('foot', 'o64', 'female', 'twist')],
    hip: [page('hip', '30-49', 'female', 'no'), page('hip', '30-49', 'male', 'no'), page('hip', 'u18', 'male', 'fall')],
    ankle: [page('ankle', '30-49', 'female', 'no'), page('ankle', 'o64', 'male', 'inversion')],
  }
  const summary = Object.entries(counts).map(([k, v]) => k + ' ' + v.map((x) => x.before.length + '→' + x.rows.length).join(' ')).join('; ')
  check('Smart flow: the doctor page shrinks in every area (knee 9-12 → 4, foot 13 → 4, hip 10-12 → 5, ankle 12 → 4)',
    Object.values(counts).flat().every((x) => x.rows.length <= 5 && x.rows.length < x.before.length) &&
    counts.foot[0].rows.length === 4 && counts.ankle[0].rows.length === 4 && counts.hip[0].rows.length === 5 && counts.knee[0].rows.length === 4, summary)
  const ids = (r) => r.rows.flatMap((x) => (x.gate ? x.members.map((m) => m.id) : [x.flag.id]))
  check('Smart flow: no red flag is lost in any area (every question is still on the page, inside its group), except those the mechanism rules out',
    Object.values(counts).flat().every((x) => x.before.filter((f) => !x.list.length || x.list.some((y) => y.id === f.id)).every((f) => ids(x).includes(f.id))) &&
    Object.values(counts).flat().every((x) => x.list.filter((f) => !f.unsure).every((f) => ids(x).includes(f.id))), summary)
  check('Smart flow: after a recent injury only the overuse stress fractures and "no injury" Perthes are skipped; the hip\'s sudden-pain-with-no-fall fracture question, clot, infection and cancer questions never are',
    !ids(counts.foot[1]).includes('ft-stress') && ids(counts.foot[0]).includes('ft-stress') &&
    !ids(counts.hip[2]).includes('hpf-stress') && ids(counts.hip[2]).includes('hpf-nofall') &&
    Object.keys(G.MECHANISM).every((id) => /stress|perthes|pta|femoral/.test(id)) &&
    ['af-dvt', 'af-cast', 'af-cancer'].every((id) => ids(counts.ankle[1]).includes(id)))
  const medText = (r, gid) => r.rows.find((x) => x.gate && x.gate.id === gid).gate.text
  check('Smart flow: each group lists only the signs that apply to this person (no child limp for an adult, no periods for a man)',
    !/child/.test(medText(counts.knee[0], 'knee-medical')) && /a child limping/.test(medText(counts.knee[1], 'knee-medical')) &&
    /periods/.test(medText(counts.hip[0], 'hip-organ')) && !/periods/.test(medText(counts.hip[1], 'hip-organ')) &&
    !/child/.test(medText(counts.hip[0], 'hip-bone')) && /^Signs that need a medical check: /.test(medText(counts.knee[0], 'knee-medical')))
  // Back, neck and shoulder: the real page (the universal checks it keeps, and the drawing's pattern questions).
  const real = (area, region, extra, age, sex, inj) => {
    const before = bySeverity([...REGIONS[region].redFlags.filter((f) => f.tier !== 'emergency' && !f.drawn && forPerson(f, { age, sex })), ...extra])
    const doc = G.byMechanism(before, inj ? { [area + ':I1']: inj } : {})
    return { before, rows: G.gateRows([...doc, ...G.gateUnsureFlags(doc, area)]) }
  }
  const T3 = [{ id: 'sc-neuro', tier: 'urgent', text: 'n' }, { id: 'sc-systemic', tier: 'urgent', text: 's' }, { id: 'sc-trauma', tier: 'urgent', sameDay: true, text: 't' }]
  const more = {
    lowback: real('lowerback', 'lowback', [...T3, { id: 'pc-urinary', tier: 'urgent', text: 'u' }], '50-64', 'female'),
    upperback: real('upperback', 'upperback', [...T3, { id: 'pc-visceral', tier: 'urgent', text: 'v' }], '30-49', 'male'),
    tlj: real('tlj', 'tlj', [...T3, { id: 'pc-visceral', tier: 'urgent', text: 'v' }, { id: 'pc-urinary', tier: 'urgent', text: 'u' }], '30-49', 'male'),
    neck: real('neck', 'neck', [UNI[1]], '30-49', 'male', 'no'),
    shoulder: real('shoulder', 'shoulder', UNI, '50-64', 'male', 'no'),
    shoulderHurt: real('shoulder', 'shoulder', UNI, '30-49', 'male', 'fall'),
  }
  const ms = Object.entries(more).map(([k, v]) => k + ' ' + v.before.length + '→' + v.rows.length).join('; ')
  check('Smart flow: back, neck and shoulder pages shrink too',
    ['lowback', 'upperback', 'tlj'].every((k) => more[k].rows.length === 4) && more.neck.rows.length === 3 && more.shoulder.rows.length === 3 &&
    Object.values(more).every((v) => v.rows.length < v.before.length), ms)
  const ids2 = (v) => v.rows.flatMap((x) => (x.gate ? x.members.map((m) => m.id) : [x.flag.id]))
  check('Smart flow: no back, neck or shoulder red flag is lost; after a shoulder injury only the "no injury" Parsonage-Turner question is skipped',
    ['lowback', 'upperback', 'tlj', 'neck', 'shoulder'].every((k) => more[k].before.every((f) => ids2(more[k]).includes(f.id))) &&
    !ids2(more.shoulderHurt).includes('srf-pta') && ids2(more.shoulderHurt).includes('srf-pancoast'))
  console.log('    back/neck/shoulder: ' + ms)
  // Every area: the real doctor page (region flags that apply, the universal checks the page keeps, the drawing's own pattern questions).
  {
    const { patternChecks } = await imp('src/data/patternChecks.js')
    const { SCREENS } = await imp('src/data/injuryScreen.js')
    const REG = { knee: 'knee', foot: 'foot', hip: 'hip', ankle: 'ankle', lowerback: 'lowback', upperback: 'upperback', tlj: 'tlj', neck: 'neck', shoulder: 'shoulder',
      ctj: 'ctj', sij: 'sij', coccyx: 'coccyx', jaw: 'jaw', head: 'head', upperarm: 'arm', elbow: 'elbow', forearm: 'forearm', wrist: 'wrist', hand: 'hand', thigh: 'thigh', lowerleg: 'leg' }
    const ZN = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
    const rows = {}
    for (const [type, region] of Object.entries(REG)) {
      const who = { age: '30-49', sex: 'female' }
      const own = REGIONS[region].redFlags.filter((f) => f.tier !== 'emergency' && !f.drawn && forPerson(f, who))
      const screen = SCREENS.some((sc) => sc.zones.includes(type))
      const ownNeuro = own.some((f) => [].concat(f.group || []).includes('neuro'))
      const uni = [!ownNeuro && { id: 'sc-neuro', tier: 'urgent' }, { id: 'sc-systemic', tier: 'urgent' }, !screen && { id: 'sc-trauma', tier: 'urgent', sameDay: true }].filter(Boolean)
      const zid = ['neck', 'ctj', 'head', 'jaw', 'coccyx', 'lowerback', 'upperback', 'tlj', 'sij'].includes(type) ? type : type + 'L'
      const pats = patternChecks(ZN([zid]), {}, 12).filter((x) => x.tier !== 'emergency').slice(0, 2)
      const before = bySeverity([...own, ...uni, ...pats])
      const list = [...before, ...G.gateUnsureFlags(before, type)]
      const r = G.gateRows(list)
      const kept = r.flatMap((x) => (x.gate ? x.members.map((m) => m.id) : [x.flag.id]))
      rows[type] = { before: before.length, after: r.length, lost: before.filter((f) => !kept.includes(f.id)).map((f) => f.id) }
    }
    const line = Object.entries(rows).map(([k, v]) => k + ' ' + v.before + '→' + v.after).join('; ')
    check('Smart flow, every area: the doctor page shrinks (to 5 items or fewer) and no red flag is lost',
      Object.values(rows).every((v) => v.after < v.before && v.after <= 5 && !v.lost.length), JSON.stringify(rows))
    console.log('    all areas: ' + line)
  }
  const hipWithPattern = (() => { const doc = [...counts.hip[1].list.filter((f) => !f.unsure), { id: 'pc-urinary', tier: 'urgent', text: 'u' }]; return G.gateRows([...doc, ...G.gateUnsureFlags(doc, 'hip')]) })()
  check('Smart flow: the drawing\x27s urinary pattern question joins the hip\x27s tummy-or-pelvis group instead of standing beside it',
    hipWithPattern.length === 5 && hipWithPattern.find((r) => r.gate && r.gate.id === 'hip-organ').members.some((m) => m.id === 'pc-urinary'))
  const wordsOf = (t) => t.split(/s+/).length
  const allTexts = Object.values(G.GATES).flat().map((g) => G.gateText(g, g.members.map((id) => ({ id }))))
  check('Smart flow: group questions are short (every one under 50 words, half under 26), with a short sign for every member',
    allTexts.every((t) => wordsOf(t) < 50) && allTexts.map(wordsOf).sort((a, b) => a - b)[Math.floor(allTexts.length / 2)] <= 26 &&
    Object.values(G.GATES).flat().every((g) => g.members.every((id) => G.SHORT[id])), allTexts.filter((t) => wordsOf(t) >= 50))
  const u = counts.hip[0].list.find((f) => f.id === 'gate:hip-bone')
  check('Smart flow: "Not sure which" counts as a doctor flag, as urgent as the most urgent question in its group (the hip fracture with no fall: today)',
    u && u.tier === 'urgent' && u.sameDay && !u.noBooking && counts.knee[0].list.find((f) => f.id === 'gate:knee-circulation').sameDay)
  check('Smart flow: every group member has plain-language signs; a group with one question that applies shows that question',
    Object.values(G.GATES).flat().every((g) => g.members.every((id) => G.SIGNS[id])) &&
    G.gateRows([...UNI, ...G.gateUnsureFlags(UNI, 'knee')]).every((r) => r.flag))
  check('Smart flow: one of these areas drawn alone runs the injury screen before the doctor page; emergencies stay first; a group opened but not answered blocks Continue; other drawings unchanged',
    /const smartFirst = injuryApplies && !!smartArea\(flowZ\)/.test(src) && /if \(emergency\) \{ if \(smartFirst\) startInjury\(\); else setStage\('physician'\) \}/.test(src) &&
    /else if \(smartFirst\) setStage\('physician'\)/.test(src) && /if \(gateOpenEmpty\) return/.test(src) &&
    G.smartArea([{ type: 'hip' }]) === 'hip' && G.smartArea([{ type: 'foot' }, { type: 'foot' }]) === 'foot' &&
    G.smartArea([{ type: 'knee' }, { type: 'thigh' }]) === null && G.smartArea([{ type: 'stomach' }]) === null && G.smartArea([{ type: 'elbow' }]) === 'elbow' && G.smartArea([{ type: 'lowerback' }]) === 'lowerback')
}

// ── 50. Smarter safety flow: drawings with more than one area (Chandra, 4 Oct 2026) ──
{
  const G = await imp('src/data/safetyGates.js')
  const { regionRedFlags, forPerson } = await imp('src/data/assessmentFlow.js')
  const { bySeverity } = await imp('src/data/emergencyAdvice.js')
  const { patternChecks } = await imp('src/data/patternChecks.js')
  const { injuryScreenApplies } = await imp('src/data/injuryScreen.js')
  const src = (await import('node:fs')).readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  const ZN = (ids) => ids.map((x) => ({ id: x, type: x.replace(/[LR]$/, ''), label: x }))
  const page = (ids, who = { age: '50-64', sex: 'female' }) => {
    const z = ZN(ids)
    const own = regionRedFlags(z, z).filter((f) => f.tier !== 'emergency' && forPerson(f, who))
    const ownNeuro = own.some((f) => [].concat(f.group || []).includes('neuro'))
    const uni = [!ownNeuro && { id: 'sc-neuro', tier: 'urgent' }, { id: 'sc-systemic', tier: 'urgent' }, !injuryScreenApplies(z) && { id: 'sc-trauma', tier: 'urgent', sameDay: true }].filter(Boolean)
    const pats = patternChecks(z, {}, 12).filter((x) => x.tier !== 'emergency').slice(0, 2)
    const before = bySeverity([...own, ...uni, ...pats])
    const area = G.smartArea(z) || G.smartAreas(z)
    const rows = area ? G.gateRows([...before, ...G.gateUnsureFlags(before, area)]) : before.map((f) => ({ flag: f }))
    const kept = rows.flatMap((x) => (x.gate ? x.members.map((m) => m.id) : [x.flag.id]))
    return { area, before: before.length, after: rows.length, lost: before.filter((f) => !kept.includes(f.id)).map((f) => f.id), rows }
  }
  const combos = {
    'knee + lower leg': ['kneeL', 'lowerlegL'], 'neck + shoulder': ['neck', 'shoulderL'], 'lower back + hip': ['lowerback', 'hipL'],
    'wrist + hand': ['wristL', 'handL'], 'shoulder + upper arm + elbow': ['shoulderL', 'upperarmL', 'elbowL'],
    'lower back + pelvis + thigh': ['lowerback', 'sij', 'thighL'], 'neck + head': ['neck', 'head'], 'ankle + foot': ['ankleL', 'footL'],
  }
  const res = Object.fromEntries(Object.entries(combos).map(([k, ids]) => [k, page(ids)]))
  const line = Object.entries(res).map(([k, v]) => k + ' ' + v.before + '→' + v.after).join('; ')
  check('Several areas: every combination is grouped by theme, shrinks a lot, and loses no red flag',
    Object.values(res).every((v) => Array.isArray(v.area) && v.after < v.before && !v.lost.length && v.after <= 9), JSON.stringify(Object.fromEntries(Object.entries(res).map(([k, v]) => [k, [v.before, v.after, v.lost]]))))
  console.log('    several areas: ' + line)
  const kl = res['knee + lower leg'].rows.find((r) => r.gate && r.gate.id === 'multi-circulation')
  check('Several areas: one theme group holds both areas\' questions, under one title (knee and lower leg circulation)',
    kl && kl.members.some((m) => /^kf-/.test(m.id)) && kl.members.some((m) => /^lgf-/.test(m.id)) && /^Signs of a clot, a circulation problem or a tight cast: /.test(kl.gate.text) && !/after surgery/.test(kl.gate.text))
  check('Several areas: each question sits in one group only, and a shared general question is not repeated',
    Object.values(res).every((v) => { const ids = v.rows.flatMap((x) => (x.gate ? x.members.map((m) => m.id) : [x.flag.id])); return ids.length === new Set(ids).size }))
  check('Front of the chest and the flank count as the mid back and the TLJ: a chest-only drawing gets the mid-back groups, chest + mid back is one area',
    G.smartArea([{ type: 'chest' }]) === 'upperback' && G.smartArea([{ type: 'flank' }]) === 'tlj' && G.smartArea([{ type: 'chest' }, { type: 'upperback' }]) === 'upperback' &&
    G.smartAreas([{ type: 'chest' }, { type: 'upperback' }]) === null && JSON.stringify(G.smartAreas([{ type: 'knee' }, { type: 'stomach' }])) === 'null')
  check('Several areas: grouped on the doctor page; the injury screens keep their place after it (only a single area moves its injury question first)',
    /const area = smartArea\(flowZ\) \|\| smartAreas\(flowZ\)/.test(src) && /const smartFirst = injuryApplies && !!smartArea\(flowZ\)/.test(src))
}

// ── 51. "Also worth considering" (Chandra, 4 Oct 2026) ──
{
  const SG = await imp('src/data/symptomGuide.js')
  const AF = await imp('src/data/assessmentFlow.js')
  const fsm = await import('node:fs')
  const src = fsm.readFileSync(new URL('../src/components/PainAssessment.jsx', import.meta.url), 'utf8')
  const pdf = fsm.readFileSync(new URL('../src/components/resultsPdf.js', import.meta.url), 'utf8')
  const sum = fsm.readFileSync(new URL('../src/data/clinicianSummary.js', import.meta.url), 'utf8')
  check('Also worth considering: just under the display line means 20% of the condition maximum and 2 points; never a condition already over the line',
    SG.NEAR_MISS_FLOOR === 0.2 && SG.NEAR_MISS_MIN_SCORE === 2 &&
    Object.values(SG.REGIONS).every((r) => SG.computeNearMisses(r, {}).length === 0))
  const shown = AF.rankAcross(['knee'], {}, 2)
  check('Also worth considering: names only, at most two, never one already shown or one the AI review dropped',
    AF.alsoConsiderAcross(['knee'], {}, shown, 2).length <= 2 &&
    src.includes('alsoConsiderAcross(keys, scopedAnswers, shown, 2, (review?.dropped || []).map') && src.includes('review && review.noMatch)) return []'))
  check('Also worth considering: on the results page below the main results, in the PDF, and in the summary for Chandra with each share of its maximum',
    src.includes('alsoConsider.length > 0 &&') && src.includes('Also worth considering') && pdf.includes('d.alsoConsider && d.alsoConsider.length') &&
    sum.includes('Also worth considering (below the cut-off or third)'))
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
