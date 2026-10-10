/* Review pages for the plain question design (8 Oct 2026): every safety
   question a drawing asks, before (as on the other areas) and after (plain
   group question, short bullets, one sign per tick), for sign-off.
   The groups are built by the same code the site uses, for the drawing in
   the set-up below, with every question any age or birth sex can see.
   Run: npm run review:lowback    →  review/lowback-plain.html     (+ -link.html for the phone)
        npm run review:neck       →  review/neck-plain.html
        npm run review:shoulder   →  review/shoulder-plain.html
        npm run review:knee       →  review/knee-plain.html
        npm run review:hip        →  review/hip-plain.html
        npm run review:ankle      →  review/ankle-plain.html
        npm run review:foot       →  review/foot-plain.html
        npm run review:thigh      →  review/thigh-plain.html
        npm run review:lowerleg   →  review/lowerleg-plain.html
        npm run review:elbow      →  review/elbow-plain.html
        npm run review:wrist      →  review/wrist-plain.html
        npm run review:hand       →  review/hand-plain.html
        npm run review:forearm    →  review/forearm-plain.html
        npm run review:upperarm   →  review/upperarm-plain.html
        npm run review:midback    →  review/midback-plain.html
        npm run review:baseofneck →  review/baseofneck-plain.html
        npm run review:midlowback →  review/midlowback-plain.html
        npm run review:sij        →  review/sij-plain.html
        npm run review:tailbone   →  review/tailbone-plain.html
        npm run review:jaw        →  review/jaw-plain.html
        npm run review:head       →  review/head-plain.html
        npm run review:lowback-hip → review/lowback-hip-plain.html */
import fs from 'node:fs'
import { renderPage } from './make-signoff.mjs'
import { regionRedFlags } from '../src/data/assessmentFlow.js'
import { flowZones } from '../src/data/referral.js'
import { patternChecks } from '../src/data/patternChecks.js'
import { bySeverity } from '../src/data/emergencyAdvice.js'
import { injuryScreenApplies } from '../src/data/injuryScreen.js'
import { gateUnsureFlags, gateRows, gateText, smartArea, smartAreas } from '../src/data/safetyGates.js'
import { plainAreas, coverOut, gateQ, PLAIN_Q, SUBHEAD, TICKS, ticksFor, COVERED, TICK_SKIP, WHEN_Q, shortFor, tellThem, toggleTick } from '../src/data/plainQuestions.js'

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const Z = (id, type, side = 'c') => ({ id, type, label: type, side })

/* Each drawing: what it is, and the changes that are its own. */
const AREAS = {
  lowerback: {
    out: 'lowback-plain', title: 'Lower Back Questions', name: 'Lower back', zones: [Z('lowerback', 'lowerback')],
    sample: () => tellThem(toggleTick(toggleTick([], 'rf-saddle', 'paper'), 'rf-bladder', 'start'), { [WHEN_Q.id]: 'today' }, 'lowerback'),
    own: [
      '<strong>Fixed:</strong> the cauda equina sex question (<code>rf-sexual</code>) was never asked on a lower back drawing; it shared a group label with the bladder question, so the duplicate filter dropped it. It is now asked.',
      '<strong>Fixed:</strong> a lower-back-only drawing also asks the mid-to-low back\'s questions (the area it implies), and the plain design was switched off by that second area. It now runs, and the two areas\' groups are merged as on the site.',
      '<strong>Physio while waiting (signed off 9 Oct 2026):</strong> the possible spine and joint infection questions are doctor first, with no booking until a doctor has checked (was: physio alongside).',
    ],
  },
  neck: {
    out: 'neck-plain', title: 'Neck Questions', name: 'Neck', zones: [Z('neck', 'neck')],
    sample: () => tellThem(toggleTick([], 'nrf-myelo', 'walk'), { [WHEN_Q.id]: 'days' }, 'neck'),
    own: [
      '<strong>Sub-headings inside a group:</strong> the stroke signs sit in a box headed "Came on suddenly since this started:", so the time limit covers only them and not the fever or heart signs below.',
      '<strong>The general medical question</strong> (<code>sc-systemic</code>) keeps fever and past cancer on the neck; the lower back leaves them out only because its own infection and cancer questions ask them.',
      '<strong>The neck injury screen</strong> ("Have you injured your neck in the last 7 days…") is unchanged in this step.',
      '<strong>Upper-neck risks (signed off 9 Oct 2026):</strong> inflammatory arthritis, Down syndrome or long-term steroids count on their own, as the current question reads.',
    ],
  },
  shoulder: {
    out: 'shoulder-plain', title: 'Shoulder Questions', name: 'Shoulder', zones: [Z('shoulderR', 'shoulder', 'R')],
    sample: () => tellThem(toggleTick([], 'rf-hotjoint', 'fever'), {}, 'shoulder'),
    own: [
      '<strong>The injury, infection or muscle emergency group</strong> asks "Do you have any of these with the pain?" on every area, as it can hold a crash, a hot joint, a hip operation and dark pee together.',
      '<strong>Stroke signs inside a group</strong> sit in a box headed "Started in the last few hours:".',
      '<strong>Signs that only count together</strong> stay on one line: shoulder-tip pain with a blow or feeling faint; sharp pain on breathing with breathlessness; a hot joint with a fever or feeling unwell (a recent injection alone no longer counts, signed off 9 Oct 2026); a smoker with a lasting cough, blood, a drooping eyelid or a weak hand.',
      '<strong>The shoulder injury screen</strong> is unchanged in this step.',
    ],
  },
  knee: {
    out: 'knee-plain', title: 'Knee Questions', name: 'Knee', zones: [Z('kneeR', 'knee', 'R')],
    sample: () => tellThem(toggleTick([], 'kf-dvt', 'calf'), {}, 'knee'),
    own: [
      '<strong>Compartment syndrome</strong> keeps its causes and time limit as a boxed heading ("In the last day or two, after a broken bone, a crush, an operation…"), and each tick needs both the climbing pain and a muscle sign, as the current question does.',
      '<strong>Past cancer</strong> is asked once, in the knee cancer question; the general medical question leaves it out on the knee.',
      '<strong>The two limping-child questions</strong> (about 9 to 17, and about 4 to 10) share one group bullet, so a child\'s group shows five bullets at most; inside, each keeps its own age and "no injury" line.',
      '<strong>Septic joint (signed off 9 Oct 2026):</strong> a hot, red, swollen joint counts with a fever or feeling unwell everywhere; a recent injection is a risk note, not a sign on its own (the shoulder, elbow, wrist and hand questions now read the same way).',
      '<strong>The knee injury screen</strong> is unchanged in this step.',
    ],
  },
  hip: {
    out: 'hip-plain', title: 'Hip Questions', name: 'Hip', zones: [Z('hipR', 'hip', 'R')],
    sample: () => tellThem(toggleTick([], 'hpf-dislocation', 'stand'), {}, 'hip'),
    own: [
      '<strong>After a hip operation:</strong> the dislocation signs sit under a boxed heading "After a hip replacement or a hip fracture operation:".',
      '<strong>Signs that only count together</strong> stay on one line, e.g. 65 or over or weak bones AND sudden hip pain with no fall; a runner AND a deep groin ache; steroids, heavy drinking, sickle cell, lupus, a transplant or an old hip injury AND a deep groin ache.',
      '<strong>The hip injury screen</strong> is unchanged in this step.',
    ],
  },
  ankle: {
    out: 'ankle-plain', title: 'Ankle Questions', name: 'Ankle', zones: [Z('ankleR', 'ankle', 'R')],
    sample: () => tellThem(toggleTick([], 'af-ischaemia', 'foot'), {}, 'ankle'),
    own: [
      '<strong>Compartment syndrome</strong> keeps its causes and time limit as a boxed heading, and each tick needs both the climbing pain and a muscle sign, as on the knee.',
      '<strong>Past cancer, a growing lump and night pain</strong> are asked once, in the ankle cancer question; the general medical question keeps only fever and weight loss here.',
      '<strong>A tight cast</strong> keeps the safety line "do not cut it off" in the tick itself.',
      '<strong>Signs that only count together</strong> stay on one line, e.g. heel or Achilles pain AND a stiff back, psoriasis, sore eyes, other swollen joints or a recent infection; diabetes AND a hot, swollen foot or a wound not healing; Achilles pain AND a recent ciprofloxacin-type antibiotic or steroids.',
      '<strong>The ankle injury screen</strong> is unchanged in this step.',
    ],
  },
  foot: {
    out: 'foot-plain', title: 'Foot Questions', name: 'Foot', zones: [Z('footR', 'foot', 'R')],
    sample: () => tellThem(toggleTick([], 'ft-diabeticinfection', 'wound'), {}, 'foot'),
    own: [
      '<strong>Emergency group:</strong> compartment syndrome (boxed causes and time limit), a foot suddenly cold, pale, blue or numb, or suddenly very painful at rest, a hot red area spreading fast, and an infected diabetic wound.',
      '<strong>The foot\'s lump question</strong> asks a growing lump, a new dark mark under a toenail and night pain; the general medical question keeps fever, weight loss and past cancer here.',
      '<strong>A tight cast</strong> keeps the safety line "do not cut it off" in the tick itself.',
      '<strong>Signs that only count together</strong> stay on one line, e.g. something through the shoe AND the foot now swollen, red or painful to walk on; diabetes AND a hot, swollen foot or a wound not healing; heel pain AND a stiff back, psoriasis, sore eyes or a recent infection.',
      '<strong>The foot injury screen</strong> is unchanged in this step.',
    ],
  },
  thigh: {
    out: 'thigh-plain', title: 'Thigh Questions', name: 'Thigh', zones: [Z('thighR', 'thigh', 'R')],
    sample: () => tellThem(toggleTick([], 'tgf-cellulitis', 'streak'), {}, 'thigh'),
    own: [
      '<strong>Compartment syndrome on the thigh</strong> keeps its own causes and time limit as a boxed heading ("In the last day or two, after a heavy knock, a crush…"), and its one tick needs both the climbing pain and a tense, hard, swollen thigh, as the current question does.',
      '<strong>Signs that only count together</strong> stay on one line, e.g. thigh or buttock cramps on walking AND smoking or diabetes; spreading redness, a red streak or a hot swollen area AND a fever; a runner AND a deep thigh ache.',
      '<strong>Past cancer</strong> is asked once, in the thigh cancer question; the general medical question leaves it out here.',
      '<strong>The thigh injury screen</strong> is unchanged in this step.',
    ],
  },
  lowerleg: {
    out: 'lowerleg-plain', title: 'Lower Leg Questions', name: 'Lower leg', zones: [Z('lowerlegR', 'lowerleg', 'R')],
    sample: () => tellThem(toggleTick([], 'lgf-cellulitis', 'streak'), {}, 'lowerleg'),
    own: [
      '<strong>Cellulitis on the lower leg</strong> reads differently from the thigh: spreading redness, a red streak up the leg and a leg ulcer that is not healing each count on their own; only a hot, swollen area needs a fever too, as the current question reads.',
      '<strong>Compartment syndrome</strong> keeps its causes and time limit as a boxed heading, and each tick needs both the climbing pain and a muscle sign.',
      '<strong>Blocked blood flow:</strong> both ticks say "suddenly" themselves, so they read right on the result and in the summary.',
      '<strong>Past cancer</strong> is asked once, in the lower leg cancer question.',
      '<strong>The whole leg now runs together:</strong> with the lower leg done, every drawing of the thigh, knee, lower leg, ankle and foot (alone or together, and with the back or hip) gets the plain questions.',
      '<strong>The lower leg injury screen</strong> is unchanged in this step.',
    ],
  },
  elbow: {
    out: 'elbow-plain', title: 'Elbow Questions', name: 'Elbow', zones: [Z('elbowR', 'elbow', 'R')],
    sample: () => tellThem(toggleTick([], 'erf-nerve', 'wrist'), {}, 'elbow'),
    own: [
      '<strong>Septic joint:</strong> one line, a hot, red or swollen joint with a fever or feeling very unwell, as signed off on 9 Oct 2026.',
      '<strong>Compartment syndrome of the forearm</strong> keeps its causes and time limit as a boxed heading, and each tick needs both the climbing pain and a muscle sign.',
      '<strong>Signs that only count together</strong> stay on one line, e.g. a swelling at the point of the elbow AND red, warm or a cut over it; under 16 AND pain with throwing, or catching or locking.',
      '<strong>Nerve signs</strong> are one per tick: a weaker hand, a thinning thumb muscle, constant finger numbness, a wrist or fingers that will not lift.',
      '<strong>The elbow injury screen</strong> is unchanged in this step.',
    ],
  },
  wrist: {
    out: 'wrist-plain', title: 'Wrist Questions', name: 'Wrist', zones: [Z('wristR', 'wrist', 'R')],
    sample: () => tellThem(toggleTick([], 'wrf-bite', 'cut'), {}, 'wrist'),
    own: [
      '<strong>Emergency group:</strong> a septic joint (fever or feeling unwell, as signed off), an infected cut, bite or puncture (the wound AND swelling, redness and pain on one line), and forearm compartment syndrome (boxed causes and time limit). The wrist\'s own stroke question stands in for the general one.',
      '<strong>Gout on the wrist</strong> counts a first attack, as its question reads (the elbow, knee and ankle ones need past gout).',
      '<strong>Nerve signs</strong> are one per tick, as on the elbow; both-hands numbness counts when it is there most of the day, not only at night.',
      '<strong>Signs that only count together</strong> stay on one line, e.g. an old fall AND thumb-base pain never X-rayed; gymnastics AND a deep ache just above the wrist.',
      '<strong>The wrist injury screen</strong> is unchanged in this step.',
    ],
  },
  hand: {
    out: 'hand-plain', title: 'Hand Questions', name: 'Hand', zones: [Z('handR', 'hand', 'R')],
    sample: () => tellThem(toggleTick([], 'hnd-inject', 'gun'), {}, 'hand'),
    own: [
      '<strong>Emergency group:</strong> a high-pressure injection (paint, grease or oil from a spray or grease gun) counts on its own, even with a tiny wound; a whole finger swollen, held bent and very painful to straighten (tendon sheath infection); a septic joint (fever or feeling unwell, as signed off); forearm or hand compartment syndrome. The hand\'s own stroke question stands in for the general one.',
      '<strong>Questions worded like the wrist\'s</strong> (stroke, nerve signs, both hands numb) share the wrist\'s ticks.',
      '<strong>Lumps:</strong> one sign per tick (growing quickly, painful, deep and large, a dark streak under a nail); the general medical question leaves the lump out here.',
      '<strong>After a hand procedure</strong> (asked when the patient says they had one): a boxed heading "Since the procedure on your hand:" over infection signs, a numb fingertip, or a finger that suddenly will not bend.',
      '<strong>The hand has no injury screen.</strong>',
    ],
  },
  forearm: {
    out: 'forearm-plain', title: 'Forearm Questions', name: 'Forearm', zones: [Z('forearmR', 'forearm', 'R')],
    sample: () => tellThem(toggleTick([], 'frf-cardiac', 'effort'), {}, 'forearm'),
    own: [
      '<strong>Emergency groups:</strong> heart pain felt in the left forearm (with effort, or with chest tightness, breathlessness or sweating; 911) and the forearm\'s own stroke question; compartment syndrome (boxed causes and time limit) and a hot red area spreading fast.',
      '<strong>Questions worded like the elbow\'s or wrist\'s</strong> (compartment syndrome, a tight cast, cellulitis, both hands numb) share their ticks.',
      '<strong>Nerve signs</strong> one per tick, including "you cannot make an OK sign with your thumb and first finger".',
      '<strong>Signs that only count together</strong> stay on one line: a smoker AND little-finger-side arm pain with a lasting cough or a drooping eyelid; a young gymnast AND pinpoint forearm bone pain.',
      '<strong>The forearm injury screen</strong> is unchanged in this step.',
    ],
  },
  upperarm: {
    out: 'upperarm-plain', title: 'Upper Arm Questions', name: 'Upper arm', zones: [Z('upperarmR', 'upperarm', 'R')],
    sample: () => tellThem(toggleTick([], 'arf-clot', 'arm'), {}, 'upperarm'),
    own: [
      '<strong>An upper-arm mark also asks the shoulder\'s questions</strong> (the shoulder is implied), so the groups are merged as on the site; the shoulder\'s plain wording is the one already signed off.',
      '<strong>Emergency:</strong> heart pain in the arm (with effort, or with chest tightness, breathlessness, sweating or jaw pain; 911); a whole arm suddenly swollen, heavy or bluish AND breathlessness or chest pain (911, one line); the arm\'s own stroke question; muscle breakdown with dark pee.',
      '<strong>An arm clot</strong> (the whole arm swollen, heavy or bluish over a day or two) is doctor first, no booking, like every other possible clot.',
      '<strong>Questions worded like another area\'s</strong> (stroke, muscle breakdown, cellulitis, both hands numb) share their ticks.',
      '<strong>The upper arm injury screen</strong> is unchanged in this step.',
    ],
  },
  upperback: {
    out: 'midback-plain', title: 'Mid Back Questions', name: 'Mid back', zones: [Z('upperback', 'upperback')],
    sample: () => tellThem(toggleTick([], 'trf-cardiac', 'chest'), {}, 'upperback'),
    own: [
      '<strong>A front-of-chest mark</strong> runs as the mid back (the site treats them as one area); a chest drawing\'s general heart question gives way to the mid back\'s own.',
      '<strong>Emergency:</strong> a sudden tearing back pain, heart signs (chest tightness, breathlessness or sweating on its own; effort pain AND spreading to the arm or jaw on one line), a lung clot, pancreas pain, two spinal cord questions, and a crash, fall or hard blow in the last few days (boxed heading).',
      '<strong>Questions worded like another area\'s</strong> (lung clot, pancreas, both legs, stiff legs, shingles) share their ticks.',
      '<strong>Fever and past cancer</strong> are asked in the mid back\'s own infection and cancer questions, so the general medical question leaves them out here.',
      '<strong>The mid back has no injury screen.</strong>',
    ],
  },
  ctj: {
    out: 'baseofneck-plain', title: 'Base of Neck Questions', name: 'Base of the neck', zones: [Z('ctj', 'ctj')],
    sample: () => tellThem(toggleTick([], 'crf-trauma5d', 'vision'), {}, 'ctj'),
    own: [
      '<strong>After a crash or a knock to the head or neck</strong> there are two questions with the same signs: one boxed "getting quickly worse or new in the last few days" (911), the other boxed "even if not getting worse" (doctor today). Each sign is its own tick.',
      '<strong>Heart signs:</strong> chest tightness, breathlessness or sweating on its own; effort pain AND spreading to the left arm or jaw on one line.',
      '<strong>Questions worded like another area\'s</strong> (lung clot, bladder or bowel control, organ pain, shingles) share their ticks.',
      '<strong>"Tell them"</strong> names the area as neck and upper back pain.',
    ],
  },
  tlj: {
    out: 'midlowback-plain', title: 'Mid-to-Low Back Questions', name: 'Mid-to-low back', zones: [Z('tlj', 'tlj')],
    sample: () => tellThem(toggleTick([], 'jrf-kidney', 'waves'), {}, 'tlj'),
    own: [
      '<strong>Already asked in plain words</strong> with every lower-back drawing: its emergency questions (aorta, cauda equina, both legs, a crash or fall, pancreas, testicle) used the plain ticks from the lower back work.',
      '<strong>New here:</strong> its four doctor groups (bone, infection or other medical cause, inside the body, legs). Its kidney, past cancer, fragile-bone and infection questions are worded exactly like the lower or mid back\'s and share their ticks.',
      '<strong>A flank mark</strong> runs as the mid-to-low back (the site treats them as one area).',
      '<strong>Fever and past cancer</strong> are asked in its own infection and cancer questions, so the general medical question leaves them out here.',
    ],
  },
  sij: {
    out: 'sij-plain', title: 'Sacroiliac Joint Questions', name: 'Sacroiliac joint', zones: [Z('sijR', 'sij', 'R')],
    sample: () => tellThem(toggleTick([], 'prf-fracture', 'stand'), {}, 'sij'),
    own: [
      '<strong>Emergency:</strong> cauda equina (one sign per tick); cannot stand or take weight on the leg after a fall or accident (911, one line); and for pregnant women, severe pain with heavy bleeding or feeling faint (911), or with fluid leaking or regular tightenings (labour and delivery), under "If you are pregnant: do you have any of these right now?".',
      '<strong>Signs that only count together</strong> stay on one line, e.g. under 45 AND months of pain that wakes you late at night AND eases with exercise.',
      '<strong>Signed off 10 Oct 2026:</strong> questions only about women go to women only, and questions only about men to men only. The pelvic question (periods, vaginal bleeding or discharge) is now women-only at its source, and "recently gave birth" is its own women-only tick.',
      '<strong>For every plain page:</strong> a question none of whose signs can apply to the patient\'s birth sex is left off (the pelvic question about periods and vaginal bleeding is not shown to a male patient; it still shows when birth sex was not given).',
      '<strong>"Tell them"</strong> names the area as buttock and pelvis pain.',
    ],
  },
  coccyx: {
    out: 'tailbone-plain', title: 'Tailbone Questions', name: 'Tailbone', zones: [Z('coccyx', 'coccyx')],
    sample: () => tellThem(toggleTick([], 'xrf-saddle', 'paper'), { [WHEN_Q.id]: 'today' }, 'coccyx'),
    own: [
      '<strong>Emergency:</strong> cauda equina signs one per tick (numbness, the toilet-paper test, trouble peeing, leaking, cannot hold poo), under "Since your tailbone pain started".',
      '<strong>Signs that only count together</strong> stay on one line: pain there all the time AND worse at night AND not affected by sitting.',
      '<strong>Bowel control since giving birth</strong> is shown to women only.',
      '<strong>Past cancer, a lump and constant night pain</strong> are asked in the tailbone\'s own questions, so the general medical question keeps fever and weight loss.',
    ],
  },
  jaw: {
    out: 'jaw-plain', title: 'Jaw Questions', name: 'Jaw', zones: [Z('jawR', 'jaw', 'R')],
    sample: () => tellThem(toggleTick([], 'mrf-stuckopen', 'open'), {}, 'jaw'),
    own: [
      '<strong>Emergency:</strong> heart pain felt in the jaw (with effort, or with chest tightness, breathlessness or sweating; 911) and one side of the face suddenly drooping (911); a jaw stuck open.',
      '<strong>Giant cell arteritis signs</strong> (over 50 only): jaw ache when chewing, a tender scalp or temple, a change in vision, each its own tick.',
      '<strong>Signs that only count together</strong> stay on one line: a blow to the jaw AND teeth no longer meeting; a swollen face AND a fever; ear or jaw pain AND a sore throat, hoarse voice or trouble swallowing for over 3 weeks.',
      '<strong>A possible jaw infection</strong> is doctor first, no booking, as signed off for spine and joint infections.',
      '<strong>The jaw has no injury screen.</strong>',
    ],
  },
  head: {
    out: 'head-plain', title: 'Head Questions', name: 'Head', zones: [Z('head', 'head')],
    sample: () => tellThem(toggleTick([], 'hrf-thunderclap', 'sudden'), {}, 'head'),
    own: [
      '<strong>Emergency, "right now":</strong> a sudden headache at its worst within a minute (911); stroke signs with the headache, one per tick under "With the headache:" (911); meningitis (a fever with a stiff neck or rash; or very drowsy, confused or very unwell; 911); a painful red eye with blurred vision or halos.',
      '<strong>Emergency, after an injury:</strong> since a blow to the head (vomiting more than once, very drowsy or confused, a worsening headache; 911); the crash or knock signs, worse or new in the last few days (911); since a neck manipulation, jerk or minor knock, a severe new pain or quickly worsening signs (911). Each cause is the boxed heading over its own ticks.',
      '<strong>"Is this headache new or changing?"</strong> groups a new headache after 50, a headache with coughing or straining or posture or waking with vomiting, one after a new medicine, one in pregnancy or soon after a birth (women only), and one after a neck jolt.',
      '<strong>Shared ticks:</strong> the crash questions are worded like the base of the neck\'s, and the over-50 giant cell arteritis question like the jaw\'s.',
      '<strong>With the head done, every area of the body has plain questions.</strong>',
    ],
  },
  'lowback-hip': {
    out: 'lowback-hip-plain', title: 'Back and Hip Questions', name: 'Lower back and hip', zones: [Z('lowerback', 'lowerback'), Z('hipR', 'hip', 'R')],
    sample: () => tellThem(toggleTick([], 'hpf-dislocation', 'stand'), {}, ['lowerback', 'hip']),
    own: [
      '<strong>Several areas:</strong> the plain design runs when every drawn area has plain questions; the groups of all the areas are merged by theme, as on the site. "Tell them" names both: "I have low back and hip pain, and …".',
      '<strong>A question asked twice shows once:</strong> the hip\'s aorta question (back, tummy or groin) stands in for the back\'s and the mid-to-low back\'s; the back\'s kidney question for the hip\'s; the hip\'s testicle question gives way to the mid-to-low back\'s identical one.',
      '<strong>Nothing lost:</strong> the hip\'s pelvic question is shown through the back\'s, with its extra sign (unusual vaginal discharge) as an added tick and in the group bullet.',
      '<strong>One bullet for the fragile-bone picture</strong> (the back\'s "sudden pain after a small strain" and the hip\'s "sudden pain with no fall"), so the merged bone group stays at six bullets at most for any age.',
      '<strong>Merged groups</strong> may show up to six bullets (one area: five), so every sign stays named.',
    ],
  },
}
const AREA = process.argv[2] || 'lowerback'
const A = AREAS[AREA]
if (!A) { console.error(`No review set up for "${AREA}" (${Object.keys(AREAS).join(', ')})`); process.exit(1) }

// The pages as the site builds them for this drawing (every age and sex).
const fz = flowZones(A.zones)
const areas = plainAreas(fz)
const reg = regionRedFlags(fz, A.zones)
const has = (g) => reg.some((f) => [].concat(f.group || []).includes(g))
const pattern = patternChecks(A.zones, {}, 12).filter((f) => !(f.id === 'pc-stroke' && has('stroke')))
const UNI = [{ id: 'sc-neuro', tier: 'urgent', text: 'New or worsening weakness, numbness, or loss of coordination in an arm or leg' },
  { id: 'sc-systemic', tier: 'urgent', text: 'Fever, chills, unexplained weight loss, a new or growing lump, pain at night that does not change with position, or a history of cancer with new or changing pain' },
  { id: 'sc-trauma', tier: 'urgent', text: 'A significant fall, accident, or injury, or any fall if you are 65 or older, or have osteoporosis or low bone density' }]
  .filter((u) => !(u.id === 'sc-trauma' && injuryScreenApplies(fz)) && !(u.id === 'sc-neuro' && (has('neuro') || reg.some((f) => f.id === 'nrf-myelo'))))
const all = [...reg, ...pattern, ...UNI]
const em = coverOut(bySeverity(all.filter((f) => f.tier === 'emergency')))
const doc = coverOut(bySeverity(all.filter((f) => f.tier !== 'emergency')))
const covered = [...em.covered, ...doc.covered]
const grp = smartArea(fz) || smartAreas(fz)
const rowsOf = (list, kind) => gateRows([...list, ...gateUnsureFlags(list, kind === 'emergency' ? null : grp, kind)])

const tierTag = (f) => f.tier === 'emergency' ? `<span class="tag">${f.call911 ? '911' : 'emergency'}</span>` : `<span class="muted">see a doctor${f.sameDay ? ' today' : ''}</span>`
const decide = (key) => `<div class="decide">
    <label><input type="radio" name="d_${esc(key)}" value="sign"> <span class="approve">Approve as built</span></label>
    <label><input type="radio" name="d_${esc(key)}" value="change"> Needs changes (say what below)</label>
    <textarea placeholder="Changes or notes"></textarea>
  </div>`
const who = (f) => [f.ages ? `ages ${[].concat(f.ages).join(', ')}` : '', f.sex ? `${f.sex} only` : ''].filter(Boolean).join('; ')
const ticksHtml = (id) => `${SUBHEAD[id] ? `<p class="muted">Sub-heading inside the group: <strong>${esc(SUBHEAD[id])}</strong></p>` : ''}<ul>${ticksFor(id, null, areas, covered).map((t) => `<li>${esc(t.text)}${t.combo ? ' <span class="muted">(both together)</span>' : ''}${t.sex ? ` <span class="muted">(${t.sex} only)</span>` : ''}</li>`).join('')}</ul>`
const qHtml = (f) => `<p class="q"><code>${esc(f.id)}</code> ${tierTag(f)}${who(f) ? ` <span class="muted">(${esc(who(f))})</span>` : ''}<br><span class="old">Before: ${esc(f.text || '')}</span></p>${ticksHtml(f.id)}`
const groupCard = (key, area, r) => `<section class="card" data-key="${esc(key)}" data-area="${area}">
  <h2>${esc(gateQ(r.gate.id, areas))}</h2>
  <div class="cols"><div><h4>Before</h4><p class="old">${esc(gateText(r.gate, r.members))}</p></div>
  <div><h4>After: the group</h4><p><strong>${esc(gateQ(r.gate.id, areas))}</strong></p><ul>${[...new Set(r.members.map((m) => shortFor(m.id, null, areas, covered)))].map((b) => `<li>${esc(b)}</li>`).join('')}</ul></div></div>
  <h4>After: inside the group, one sign per tick</h4>
  ${r.members.map(qHtml).join('')}
  ${decide(key)}</section>`
const aloneCard = (key, area, f) => `<section class="card" data-key="${esc(key)}" data-area="${area}">
  <h2>${esc(PLAIN_Q[f.id] || (TICKS[f.id] ? TICKS[f.id][0].text : f.text))}</h2><p class="muted">Shown on its own (no other question of its group on the page).</p>
  ${qHtml(f)}
  ${decide(key)}</section>`
const cardsOf = (list, kind) => rowsOf(list, kind).map((r) => (r.gate ? groupCard(`${kind}:${r.gate.id}`, kind, r) : aloneCard(`${kind}:${r.flag.id}`, kind, r.flag))).join('')

const skips = [].concat(areas || []).flatMap((a) => TICK_SKIP[a] || [])
const other = `<section class="card" data-key="other" data-area="other">
  <h2>Other changes: ${esc(A.name.toLowerCase())}</h2>
  <ul>
    ${A.own.map((x) => `<li>${x}</li>`).join('\n    ')}
    ${covered.length ? `<li><strong>Left out here as a repeat:</strong> ${covered.map((c) => `<code>${esc(c)}</code> (shown through ${[].concat(COVERED[c].by).map((b) => `<code>${esc(b)}</code>`).join(' or ')})`).join(', ')}.</li>` : ''}
    ${skips.length ? `<li><strong>Ticks left out as a repeat:</strong> ${skips.map((x) => `<code>${esc(x)}</code>`).join(', ')}.</li>` : ''}
    <li><strong>When did this start?</strong> After a nerve or spinal cord sign: Today / In the last few days / Weeks ago, or longer. It goes into the "Tell them" line; it does not change the route.</li>
    <li><strong>Tell them</strong> (below the action, on the emergency and see-a-doctor screens), built from the ticks, e.g.: <em>“${esc(A.sample())}”</em></li>
    <li><strong>You told us / You selected</strong> list the ticked signs in plain words; your summary lists them after the question ("ticked: …").</li>
    <li><strong>The reason line</strong> on see-a-doctor results reads "A doctor should check this to find the cause."</li>
  </ul>
  ${decide('other')}</section>`

const page = (bare) => renderPage({
  bare,
  cards: [],
  title: A.title,
  heading: `${A.name}: the new question design`,
  lede: `Every safety question a ${A.name.toLowerCase()} drawing asks (any age or sex), before and after, grouped as on the site. Patients read short plain lines; the reasoning underneath is unchanged: each tick sets the same red flag, with the same tier, 911 route and booking rule. Signs that only count together stay on one line.`,
  extra: [
    { area: 'emergency', title: 'Emergency page', html: cardsOf(em.kept, 'emergency') },
    { area: 'doctor', title: 'Doctor page', html: cardsOf(doc.kept, 'doctor') },
    { area: 'other', title: 'Other changes', html: other },
  ],
  storageKey: `${A.out}-v1`,
})
const style = (s) => s.replace('</style>', `  .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; } .cols > div { min-width: 0; }
  .old { color: var(--muted); font-size: 14px; } .q { margin: 12px 0 2px; } .muted { color: var(--muted); font-size: 13px; }
  .card ul { margin: 4px 0 8px; padding-left: 20px; }
</style>`)

fs.mkdirSync('review', { recursive: true })
fs.writeFileSync(`review/${A.out}.html`, style(page(false)))
// The same page without its own html/head tags, for a phone link.
fs.writeFileSync(`review/${A.out}-link.html`, style(page(true)))
console.log(`review/${A.out}.html: emergency ${rowsOf(em.kept, 'emergency').length} rows, doctor ${rowsOf(doc.kept, 'doctor').length} rows${covered.length ? `, ${covered.length} shown through another` : ''}`)
