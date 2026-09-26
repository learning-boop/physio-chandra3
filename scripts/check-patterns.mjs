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
  check('the grade is justified by three pieces of the patient\'s own evidence', hi.evidence.length === 3 && /Very little activity/.test(hi.evidence[0]), hi.evidence)
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
    grab(/const FRONT_SIGN = [^\n]+/), grab(/const ARM_SPLIT = [^\n]+/), grab(/const NECK_SPLIT = [^\n]+/), grab(/const CTJ_BOTTOM = [^\n]+/), grab(/const TLJ_TOP = [^\n]+/), grab(/const TLJ_BOTTOM = [^\n]+/), grab(/const SIJ_TOP = [^\n]+/), grab(/const COCCYX_TOP = [^\n]+/), grab(/const COCCYX_BOTTOM = [^\n]+/), grab(/const COCCYX_HALF = [^\n]+/), grab(/const JAW_TOP = [^\n]+/), grab(/const UPPERARM_BOTTOM = [^\n]+/), grab(/const ELBOW_BOTTOM = [^\n]+/), grab(/const FOREARM_BOTTOM = [^\n]+/), grab(/const WRIST_BOTTOM = [^\n]+/), grab(/const THIGH_TOP_FRONT = [^\n]+/), grab(/const THIGH_TOP_BACK = [^\n]+/), grab(/const KNEE_TOP = [^\n]+/), grab(/const KNEE_BOTTOM = [^\n]+/), grab(/const ANKLE_TOP = [^\n]+/), grab(/const SOLE_TOP = [^\n]+/), grab(/const FOOT_FRONT = [^\n]+/), grab(/const armBand = [^\n]+/),
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
  check('summary grades irritability with its evidence', /Irritability: SEVERE/.test(text) && /Very little activity/.test(text))
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

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
