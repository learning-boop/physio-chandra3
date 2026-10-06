/* The test patients from each region document, run through the same code the
   site uses: drawing → areas asked about → safety check → injury screen →
   adaptive questions → results.   Run: npm run check:regions

   Each patient is copied from the "test patients" section of
   content/regions/<region>.md. They answer only the questions the flow
   actually asks them; anything their document entry does not mention is left
   unanswered, as a real visitor might.                                     */
import { REGIONS, ZONE_TO_REGION } from '../src/data/symptomGuide.js'
import {
  questionRegions, needsAreaChoice, buildScreens, nextQuestion, rankAcross, regionAnswers,
  specialsAcross, regionRedFlags, MAX_SCORED_QUESTIONS,
  twinIds, widespreadFlags,
} from '../src/data/assessmentFlow.js'
import { detectReferral, flowZones, drawnAnswers } from '../src/data/referral.js'
import { spondyDiagnosed } from '../src/data/spondylolysis.js'
import { patternChecks } from '../src/data/patternChecks.js'
import { isNerveFlag } from '../src/data/diabetes.js'
import { injuryFlow, injuryQuestion, limbAnswerFor as limbAs, ageFrom } from '../src/data/injuryScreen.js'
import { MAX_HYPOTHESES } from '../src/data/clinicianSummary.js'
import { summarizeZone, locationAnswers, minorZoneIds } from '../src/data/drawnLocation.js'
import { pregnancyBonus } from '../src/data/pregnancy.js'

/* Where on an area a test patient drew: a small cluster of body coordinates
   around { fy, az, lx } (see ../src/data/drawnLocation.js). */
const spot = (fy, az, lx) => [-1, 0, 1].flatMap((i) => [-1, 0, 1].map((j) => ({ fy: fy + i * 0.003, az: az + j * 0.003, lx: lx + (i + j) * 0.002 })))

const TESTS = {
  neck: [
    // Self-tests (N15, 6 Oct 2026; Butler's active quick tests): offered only
    // to a stretch-sensitive picture with no numbness that stays, weakness or
    // cord signs; a positive test shows a card, none counts against.
    { name: 'S1. Line down the arm brought on by stretch positions, the median self-test reproduces it: card, sensitive nerve',
      lines: [['neck', 'shoulderL', 'elbowL', 'wristL']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', N9: ['none'], N2: ['pastelbow', 'burning'], N14: ['line', 'stretch', 'tiltaway'], N15: ['median'], N3: ['neither'] },
      expect: { top: 'neck/neural', asked: ['N15'], special: 'selfTestNerve', route: 'results' } },
    { name: 'S2. Numbness that stays: the self-tests are NOT offered',
      lines: [['neck', 'shoulderL', 'elbowL', 'wristL']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd3m', N9: ['none'], N2: ['fingers'], N14: ['line', 'stretch', 'loss'], N3: ['neither'] },
      expect: { notAsked: ['N15'], route: 'results' } },
    { name: 'S3. Clumsy hands: the self-tests are NOT offered',
      lines: [['neck', 'shoulderL', 'elbowL', 'wristL']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd3m', N9: ['clumsy'], N2: ['wholehand'], N14: ['stretch'], N3: ['neither'] },
      expect: { notAsked: ['N15'] } },
    { name: 'S4. The document 5-point "possible" picture, but no self-test brings it on: sensitive nerve not claimed',
      lines: [['neck', 'shoulderL', 'elbowL', 'wristL']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', N9: ['none'], N2: ['wholehand'], N14: ['vague', 'tiltaway', 'tender'], N15: ['nonebrought'], N3: ['neither'] },
      expect: { not: ['neck/neural'], asked: ['N15'], route: 'results' } },
    { name: '1. Desk worker, stiff one side',
      lines: [['neck', 'upperback']],
      // N9 (asked of everyone first, since 26 Sep) answered as a real patient
      // would: without it the neck counted as a silent area (28 Sep 2026).
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', N9: ['none'], N1: ['onestiff'], N6: ['desk', 'down'], N7: ['eases'] },
      expect: { top: 'neck/mech', not: ['neck/radic'], route: 'results' } },
    { name: '2. Neck to thumb and index finger',
      lines: [['neck', 'shoulderR', 'elbowR', 'wristR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd3m',
        N2: ['pastelbow', 'armworse', 'fingers', 'handhead'], N3: ['arm'] },
      expect: { top: 'neck/radic', notTop: ['neck/mech'], notRegion: ['shoulder'], route: 'results' } },
    { name: '3. Highway crash within 48 hours',
      lines: [['neck']],
      answers: { age: '50-64', onset: 'car', duration: 'd2w', I1: 'vehicle', I2: 'h48', I8: 'no', I4: ['mvc'] },
      expect: { route: 'emergency', notAsked: ['neck:I6', 'neck:I7'] } },
    { name: '3b. Crash 4 days ago, foggy and headachy since (concussion check)',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'car', duration: 'd2w', I1: 'vehicle', I2: 'd7', I8: 'no', I4: ['none'], I5: 'no', I9: 'yes' },
      expect: { route: 'urgent' } },
    { name: '3c. Teenager, neck hurt in sport yesterday, no high-risk feature (adult rule does not apply)',
      lines: [['neck']],
      answers: { age: 'u18', onset: 'sport', duration: 'd2w', I1: 'sport', I2: 'h48', I8: 'no', I4: ['none'], I5: 'no' },
      expect: { route: 'urgent', notAsked: ['neck:I6', 'neck:I7'] } },
    { name: '3d. Drinking before a crash yesterday (the rule cannot be applied)',
      lines: [['neck']],
      answers: { age: '18-29', onset: 'car', duration: 'd2w', I1: 'vehicle', I2: 'h48', I8: 'yes' },
      expect: { route: 'emergency', notAsked: ['neck:I4'] } },
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
      expect: { top: ['neck/cheadache', 'head/cgh'], route: 'results' } },
    { name: '6. Neck, jaw and left arm with effort (heart)',
      lines: [['head', 'neck'], ['shoulderL', 'elbowL']],
      focus: 'neck',
      answers: { age: '50-64', onset: 'gradual', duration: 'd2w', N1: ['full'], N6: ['lifting'] },
      flags: ['nrf-cardiac'],
      expect: { route: 'emergency' } },
    // From the "Cervical Myelopathy" condition document (26 Sep 2026).
    { name: '7. Numb, clumsy hands and an unsteady walk (cervical myelopathy)',
      lines: [['neck']],
      answers: { age: 'o64', onset: 'gradual', duration: 'o3m', N1: ['bothstiff'],
        N9: ['bothhands', 'clumsy', 'walking'], N10: ['slowworse'] },
      expect: { top: 'neck/dcm', firstAsked: 'N9', route: 'results' } },
    // Tingling as the pain type also brings in the arm question; the
    // progression question must still be asked, right after the cord signs.
    { name: '7b. The same, with tingling as the pain type',
      lines: [['neck']],
      answers: { age: 'o64', onset: 'gradual', duration: 'o3m', painQuality: ['tingling'], N1: ['bothstiff'],
        N9: ['bothhands', 'clumsy', 'walking'], N10: ['slowworse'] },
      expect: { top: 'neck/dcm', asked: ['N9', 'N10'], route: 'results' } },
    { name: '8. Neck pain, no hand or walking changes: myelopathy ruled out',
      lines: [['neck']],
      answers: { age: '50-64', onset: 'gradual', duration: 'o3m', N1: ['onestiff'], N9: ['none'], N6: ['desk'], N7: ['eases'] },
      expect: { top: 'neck/mech', not: ['neck/dcm'], notAsked: ['N10'], route: 'results' } },
    { name: '9. One arm in a strip, walking normal (radiculopathy, not myelopathy)',
      lines: [['neck', 'shoulderR', 'elbowR', 'wristR']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd3m', N9: ['none'],
        N2: ['pastelbow', 'armworse', 'fingers', 'handhead'], N3: ['arm'] },
      expect: { top: 'neck/radic', not: ['neck/dcm'], route: 'results' } },
    { name: '10. Hands and walking getting quickly worse over weeks',
      lines: [['neck']],
      answers: { age: 'o64', onset: 'gradual', duration: 'd6w' },
      flags: ['nrf-myelo'],
      expect: { route: 'urgent' } },
    { name: '11. New arm numbness after a neck manipulation',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd2w' },
      flags: ['nrf-after'],
      expect: { route: 'emergency' } },
    // Chandra, 26 Sep 2026: after a car accident or a hard knock to the head,
    // ongoing dizziness or any of the 5 Ds and 3 Ns -> a doctor today; getting
    // quickly worse, or new in the last few days -> Emergency.
    { name: '12. Dizzy on and off since a car accident 3 weeks ago, not worse',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'car', duration: 'd6w' },
      flags: ['nrf-after-doc'],
      expect: { route: 'urgent' } },
    { name: '12b. Dizziness and double vision getting quickly worse since a car accident',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'car', duration: 'd6w' },
      flags: ['nrf-after'],
      expect: { route: 'emergency' } },
    { name: '13. Base of the neck drawn: the same question is asked once',
      lines: [['neck', 'ctj']],
      answers: { age: '30-49', onset: 'car', duration: 'd6w' },
      flags: ['crf-trauma5d'],
      expect: { route: 'emergency' } },
    // From the "Cervicogenic dizziness" condition document (28 Sep 2026).
    { name: '14. Desk worker, unsteady when holding the head still (cervicogenic dizziness)',
      lines: [['neck', 'head']],
      answers: { age: '30-49', onset: 'desk', duration: 'o3m', N1: ['onestiff'], N9: ['dizzy'],
        N11: ['unsteady', 'withneck', 'headpos', 'tracks'], N6: ['desk'] },
      expect: { top: 'neck/cgd', asked: ['N9', 'N11'], notAsked: ['N10'], not: ['neck/dcm'], route: 'results' } },
    { name: '15. Dizzy since a car accident 3 months ago, linked to the neck',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'car', duration: 'd3m', N9: ['dizzy'],
        N11: ['unsteady', 'headpos'], N5: ['tired', 'spread'] },
      expect: { top: ['neck/cgd', 'neck/whiplash'], asked: ['N11'], route: 'results' } },
    { name: '16. BPPV look-alike: short spins rolling over in bed',
      lines: [['neck']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd6w', N1: ['onestiff'], N9: ['dizzy'],
        N11: ['spin', 'bppv'], N6: ['desk'] },
      expect: { not: ['neck/cgd'], special: 'bppv', route: 'results' } },
    { name: '17. Inner-ear look-alike: spinning with ringing in one ear',
      lines: [['neck']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd6w', N9: ['dizzy'],
        N11: ['spin', 'ear', 'headpos'] },
      expect: { not: ['neck/cgd'], special: 'innerEar', route: 'results' } },
    // The document's line: 5 of its 12 points is a possible match, 4 is not.
    { name: '19a. Dizziness with 5 points (unsteady, head position): shown',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', N9: ['dizzy'], N11: ['unsteady', 'headpos'] },
      expect: { top: 'neck/cgd', route: 'results' } },
    { name: '19b. Dizziness with 4 points (unsteady, tracks the neck): not shown',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', N9: ['dizzy'], N11: ['unsteady', 'tracks'] },
      expect: { not: ['neck/cgd'], route: 'results' } },
    // Chandra, 28 Sep 2026: sudden stroke signs, and severe or fast-changing
    // pain after a manipulation, jerk or knock, go to Emergency.
    { name: '20. New, sudden spinning with vomiting and unable to walk',
      lines: [['neck']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd2w' },
      flags: ['nrf-stroke'],
      expect: { route: 'emergency' } },
    { name: '21. Severe neck pain never felt before, after a neck manipulation',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'lift', duration: 'd2w' },
      flags: ['nrf-after'],
      expect: { route: 'emergency' } },
    { name: '21b. The same with the head drawn: the shared flag is asked once',
      lines: [['neck', 'head']],
      answers: { age: '30-49', onset: 'lift', duration: 'd2w' },
      flags: ['hrf-cad-severe'],
      expect: { route: 'emergency' } },
    { name: '22. New but not severe neck pain after a neck manipulation',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'lift', duration: 'd2w' },
      flags: ['nrf-after-doc'],
      expect: { route: 'urgent' } },
    // From the "Neck Pain Mobility Deficits", "Whiplash WAD" and "Cervicogenic
    // Headache" condition documents (28 Sep 2026).
    { name: '23. Woke up with a stiff neck, worse at the desk and looking up (mobility deficits)',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'woke', duration: 'd2w', N9: ['none'], N1: ['onestiff'], N6: ['desk', 'up'], N7: ['eases'] },
      expect: { top: 'neck/mech', not: ['neck/whiplash', 'neck/dcm'], route: 'results' } },
    { name: '24. Rear-ended 3 weeks ago, stiff both ways, neck tired (whiplash)',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'car', duration: 'd6w', N9: ['none'], N1: ['bothstiff'], N5: ['within2d', 'tired', 'spread'] },
      expect: { top: 'neck/whiplash', route: 'results' } },
    { name: '25. No accident: whiplash is never suggested',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', N9: ['none'], N1: ['bothstiff'], N6: ['desk'], N7: ['eases'] },
      expect: { not: ['neck/whiplash'], notAsked: ['N5'], route: 'results' } },
    { name: '26. After a crash, tingling in the hands: see your doctor as well',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'car', duration: 'd6w', N9: ['none'], N1: ['bothstiff'], N5: ['within2d', 'nerve'] },
      expect: { special: 'wadNerve', route: 'results' } },
    { name: '27. After a crash, on edge and reliving it: extra support card',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'car', duration: 'd6w', N9: ['none'], N1: ['bothstiff'], N5: ['within2d', 'tired', 'stress'] },
      expect: { top: 'neck/whiplash', special: 'wadSupport', route: 'results' } },
    { name: '28. One-sided headache from the neck, pressing the skull brings it on (neck-related headache)',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'desk', duration: 'o3m', N9: ['none'], N1: ['onestiff'], N4: ['onesided', 'movement', 'press'], N6: ['desk'] },
      expect: { top: 'neck/cheadache', route: 'results' } },
    { name: '29. Pain relief for headaches on most days: medication-overuse card',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'desk', duration: 'o3m', N9: ['none'], N1: ['onestiff'], N4: ['onesided', 'movement', 'meds'] },
      expect: { top: 'neck/cheadache', special: 'medOveruse', route: 'results' } },
    { name: '30. Rheumatoid arthritis with new neck pain: see your doctor',
      lines: [['neck']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd2w' },
      flags: ['nrf-upperinstab'],
      expect: { route: 'urgent' } },
    // "Cervical Radiculopathy.docx" v1.1 (approved 28 Sep 2026): its scored
    // set (max 16, +1 for weakness), shown from 7 points.
    { name: '31. Classic nerve root picture into the thumb (radiculopathy, C6)',
      lines: [['neck', 'shoulderR', 'elbowR', 'wristR']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd3m', N9: ['none'],
        N2: ['pastelbow', 'armworse', 'fingers', 'burning', 'handhead'], N3: ['arm'], N12: ['thumbindex'] },
      // Since the neural mechanosensitivity document (28 Sep 2026) N14 comes
      // before N12, and with the base of the neck asked too the finger-level
      // tag no longer fits in the 5 slots. Open for Chandra.
      expect: { top: 'neck/radic', notTop: ['neck/mech'], asked: ['N2', 'N3', 'N14'], route: 'results' } },
    { name: '32. Both hands clumsy with an arm line: spinal cord first, not radiculopathy',
      lines: [['neck', 'shoulderR', 'elbowR', 'wristR']],
      answers: { age: 'o64', onset: 'gradual', duration: 'o3m', N9: ['bothhands', 'clumsy'], N10: ['slowworse'],
        N2: ['pastelbow', 'armworse', 'fingers'], N3: ['arm'] },
      expect: { top: 'neck/dcm', not: ['neck/radic'], route: 'results' } },
    { name: '33. Ache into the upper arm, neck worse, no tingling: from the neck joints, not a nerve',
      lines: [['neck', 'shoulderR']],
      answers: { age: '30-49', onset: 'desk', duration: 'd6w', N9: ['none'], N1: ['onestiff'],
        N2: ['shoulderonly'], N3: ['neckonly'], N6: ['desk', 'down'], N7: ['eases'], N8: ['neck'] },
      // The document's rule: not radiculopathy. Mechanical neck pain is not
      // reached either: with the shoulder drawn too, the 5-question budget goes
      // to N9, a shoulder question, N8, N2 and N4 (the same before this
      // document), so N1, N6 and N7 are never asked. Open for Chandra.
      expect: { not: ['neck/radic'], route: 'results' } },
    // 5 Oct 2026: the two Wainner items (+1 each, approved by Chandra) raise the
    // ceiling to 19, so the card shows from 8 (was 7 of 17).
    { name: '34. The "possible" band: 8 points is shown (ceiling 19 since 5 Oct 2026)',
      lines: [['neck', 'shoulderR', 'elbowR', 'wristR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', N9: ['none'],
        N2: ['pastelbow', 'armsame', 'handhead'], N3: ['neither'], N14: ['stretch'] },
      expect: { top: 'neck/radic', route: 'results' } },
    { name: '35. Below the document\'s band: 6 points is not shown',
      lines: [['neck', 'shoulderR', 'elbowR', 'wristR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', N9: ['none'],
        N2: ['pastelbow', 'wholehand', 'handhead'], N3: ['neither'] },
      expect: { not: ['neck/radic'], route: 'results' } },
    // "Upper Cervical Pain headache related.docx" and "Cervicogenic Headache
    // 1.docx" (v1.0 drafts, 28 Sep 2026): upper neck pain (max 12, shown from
    // 5) and the headache-led picture (neck-cheadache).
    // Drawn high on the back of the neck and on the back of the head: the
    // drawing answers N13's "base of the skull" (drawnLocation.js), because
    // the head's questions use most of the 5 slots.
    { name: '36. Base of the skull, stiff turning one way, worse looking up and at the screen (upper neck pain)',
      lines: [['neck', 'head']], points: { neck: spot(0.395, 0.02, -0.06) },
      answers: { age: '30-49', onset: 'desk', duration: 'd6w', N9: ['none'], N13: ['skullbase', 'tender'], N1: ['onestiff'],
        N6: ['desk', 'up'], N7: ['eases'], N4: ['occasional'], D1: ['sameside'], D3: ['neckfine'] },
      expect: { top: 'neck/upper', notTop: ['neck/cheadache', 'head/cgh'], route: 'results' } },
    { name: '36b. The same, neck only: N13 is asked',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'desk', duration: 'd6w', N9: ['none'], N13: ['skullbase', 'tender'], N1: ['onestiff'],
        N6: ['desk', 'up'], N7: ['eases'], N4: ['occasional'] },
      expect: { top: 'neck/upper', asked: ['N13'], route: 'results' } },
    { name: '37. The same picture, but the headache is the main problem (neck-related headache)',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'desk', duration: 'o3m', N9: ['none'], N13: ['skullbase'], N1: ['onestiff'],
        N4: ['onesided', 'movement', 'press'], N6: ['desk'], N7: ['eases'] },
      expect: { top: 'neck/cheadache', notTop: ['neck/upper'], route: 'results' } },
    { name: '38. Pain in the middle and lower neck (mobility deficits, not upper neck pain)',
      lines: [['neck', 'upperback']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', N9: ['none'], N13: ['lowerneck'], N1: ['onestiff'],
        N6: ['desk', 'down'], N7: ['eases'] },
      expect: { top: 'neck/mech', notTop: ['neck/upper'], route: 'results' } },
    { name: '39a. The document\'s "possible" line: 5 points is shown (base of the skull, stiff one way)',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', N9: ['none'], N13: ['skullbase'], N1: ['onestiff'] },
      expect: { top: 'neck/upper', route: 'results' } },
    { name: '39b. Below the line: 4 points is not shown (middle of the neck, stiff one way, desk)',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', N9: ['none'], N13: ['lowerneck'], N1: ['onestiff'], N6: ['desk'] },
      expect: { not: ['neck/upper'], route: 'results' } },
    { name: '40. Base-of-the-skull pain since a car accident: whiplash, not upper neck pain',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'car', duration: 'd6w', N9: ['none'], N13: ['skullbase', 'tender'], N1: ['onestiff'],
        N5: ['within2d', 'tired', 'spread'] },
      expect: { top: 'neck/whiplash', not: ['neck/upper'], route: 'results' } },
    // "Cervical Neural Mechanosensitivity.docx" (v1.0, approved 28 Sep 2026):
    // max 12, shown from 5.
    { name: '41. Tingling along the inner arm to the little finger, brought on by stretch positions (sensitive nerve)',
      lines: [['neck', 'shoulderR', 'elbowR', 'wristR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', N9: ['none'], N2: ['fingers', 'burning'],
        N14: ['line', 'stretch', 'tiltaway', 'tender'], N3: ['neither'] },
      expect: { top: 'neck/neural', asked: ['N14'], route: 'results' } },
    { name: '42. The same, and neck movement clearly sends it down the arm: nerve and root both shown',
      lines: [['neck', 'shoulderR', 'elbowR', 'wristR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', N9: ['none'], N2: ['pastelbow', 'armworse', 'fingers', 'burning'],
        N14: ['line', 'stretch', 'tiltaway'], N3: ['arm'] },
      expect: { top: ['neck/neural', 'neck/radic'], route: 'results' } },
    { name: '43a. The document\'s "possible" line: 5 points is shown (whole hand, vague area, tilting away, tender)',
      lines: [['neck', 'shoulderR', 'elbowR', 'wristR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', N9: ['none'], N2: ['wholehand'], N14: ['vague', 'tiltaway', 'tender'], N3: ['neither'] },
      expect: { top: 'neck/neural', route: 'results' } },
    { name: '43b. Below the line: 4 points is not shown',
      lines: [['neck', 'shoulderR', 'elbowR', 'wristR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', N9: ['none'], N2: ['wholehand'], N14: ['vague', 'stretchsome', 'tender'], N3: ['neither'] },
      expect: { not: ['neck/neural'], route: 'results' } },
    { name: '44. Numbness that does not go away: "book promptly" card',
      lines: [['neck', 'shoulderR', 'elbowR', 'wristR']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd3m', N9: ['none'], N2: ['fingers'], N14: ['line', 'stretch', 'loss'], N3: ['neither'] },
      expect: { top: 'neck/neural', special: 'nerveLoss', route: 'results' } },
    { name: '45. Both hands numb with a nerve-type arm line: spinal cord first, not a sensitive nerve (the document\'s Q9)',
      lines: [['neck', 'shoulderR', 'elbowR', 'wristR']],
      answers: { age: 'o64', onset: 'gradual', duration: 'o3m', N9: ['bothhands', 'clumsy'], N10: ['slowworse'],
        N2: ['fingers', 'burning'], N14: ['line', 'stretch', 'tiltaway'] },
      expect: { top: 'neck/dcm', not: ['neck/neural'], route: 'results' } },
    { name: '18. No dizziness: the dizziness question is not asked',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', N1: ['onestiff'], N9: ['none'], N6: ['desk'], N7: ['eases'] },
      expect: { top: 'neck/mech', not: ['neck/cgd'], notAsked: ['N10', 'N11'], route: 'results' } },
    // Neck cross-check (JOSPT 2017, whiplash guidelines, AIM manual, Cervical Clinic Manual 2026, protocols), approved 5 Oct 2026.
    { name: '46. Clumsy hands only, steady: no card may reach its line, but the doctor card shows',
      lines: [['neck']],
      answers: { age: '50-64', onset: 'gradual', duration: 'o3m', N9: ['clumsy'], N10: ['steady'] },
      expect: { special: 'cordSign', route: 'results' } },
    { name: '47. Dizzy with brief double vision that went away: doctor today card',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', N9: ['dizzy'], N11: ['unsteady', 'fived'] },
      expect: { special: 'dizzyVascular', route: 'results' } },
    { name: '48. Woke up with the neck locked, under 2 weeks: acute wry neck (new card)',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'woke', duration: 'd2w', N9: ['none'], N1: ['locked'] },
      expect: { top: 'neck/wryneck', route: 'results' } },
    { name: '49. Whiplash with trouble concentrating weeks later: concussion check card',
      lines: [['neck']],
      answers: { age: '30-49', onset: 'car', duration: 'd6w', I1: 'no', N9: ['none'], N1: ['bothstiff'], N5: ['within2d', 'tired', 'concentrate'] },
      expect: { top: 'neck/whiplash', special: 'concussionCheck', route: 'results' } },
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
    // Neurodynamics, second batch (6 Oct 2026): nerve conditions from the
    // Butler NOI workbook and the Shacklock NDS manual.
    { name: 'N1. An itchy, burning patch beside the shoulder blade, no rash: notalgia paraesthetica',
      lines: [['upperback']],
      answers: { age: '50-64', onset: 'gradual', duration: 'o3m', T1: ['beside'], T4: ['itch'], T6: ['notstiff'], T2: ['sitting'] },
      expect: { top: 'upperback/notalgia', asked: ['T4'], route: 'results' } },
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
    // "Osteoporosis.docx" (v1.0, 2 Oct 2026): max 16, shown from 7.
    { name: '6. Over 65, mid-back pain after a cough, known osteoporosis and height loss',
      lines: [['upperback']],
      answers: { age: 'o64', onset: 'cough', duration: 'd2w', T1: ['spine'], T2: ['slump', 'lifting'], T3: ['no'],
        T9: ['fragility', 'height'], T6: ['worse'], T8: ['lying'] },
      expect: { top: 'upperback/osteoporosis', route: 'results' } },
    { name: '7. 55, stiff beside the spine after desk work, no bone history: not osteoporosis',
      lines: [['upperback']],
      answers: { age: '50-64', onset: 'sitting', duration: 'd3m', T1: ['beside'], T2: ['slump', 'sitting'], T5: ['desk'],
        T6: ['eases'], T8: ['tall', 'heat'], T9: ['none'] },
      expect: { not: ['upperback/osteoporosis'], route: 'results' } },
    { name: '8. Under 50 on steroids, sudden pain: the bone history question is not asked',
      lines: [['upperback']],
      answers: { age: '30-49', onset: 'cough', duration: 'd2w', T1: ['spine'], T2: ['lifting'], T6: ['worse'] },
      expect: { not: ['upperback/osteoporosis'], notAsked: ['T9'], route: 'results' } },
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
    // "Ankylosing spondylitis Spondyloarthritis.docx" (v1.0, 2 Oct 2026): max 20, shown from 8.
    { name: '6. 28, gradual low back pain for months, stiff mornings, better moving, wakes at night',
      lines: [['lowerback']],
      answers: { age: '18-29', onset: 'gradual', duration: 'o3m', L1: ['buttock'], L4: ['getup'], L6: ['centre'],
        L9: ['before40', 'morning', 'exercise', 'night', 'alternating'] },
      expect: { top: 'lowback/axspa', route: 'results' } },
    { name: '7. 45, low back pain after lifting, eases with rest: not inflammatory',
      lines: [['lowerback']],
      answers: { age: '30-49', onset: 'lift', duration: 'o3m', L1: ['back'], L4: ['bendsit'], L6: ['side'], L7: ['stiff'] },
      expect: { not: ['lowback/axspa'], notAsked: ['L9'], route: 'results' } },
    // "Non specific low back pain.docx" (v0.1, 5 Oct 2026): max 12 on the site, shown from 5.
    { name: '8. 55, twisted in the garden, ache across the back, walking eases it: common low back pain',
      lines: [['lowerback']],
      answers: { age: '50-64', onset: 'twist', duration: 'd2w', L1: ['back'], L4: ['bendsit', 'getup'], L5: ['eases'], L6: ['wide'], L7: ['stiff'] },
      expect: { top: 'lowback/nslbp', not: ['lowback/stenosis', 'lowback/radicular'], route: 'results' } },
    { name: '9. Pain below the knee with pins and needles in the foot: not common low back pain',
      lines: [['lowerback', 'hipR', 'kneeR', 'ankleR']],
      answers: { age: '30-49', onset: 'lift', duration: 'd2w', L1: ['back', 'belowknee'], L2: ['leg'], L3: ['pins', 'cough'], L4: ['bendsit', 'getup'], L6: ['centre'], L7: ['stiff'] },
      expect: { top: 'lowback/radicular', not: ['lowback/nslbp'], route: 'results' } },
    { name: '10. 68, legs heavy with walking, easing on sitting: stenosis, not common low back pain',
      lines: [['lowerback', 'hipL', 'kneeL']],
      answers: { age: 'o64', onset: 'gradual', duration: 'o3m', L1: ['back', 'thigh'], L2: ['same'], L4: ['arch', 'getup'], L5: ['claud'], L6: ['centre'] },
      expect: { top: 'lowback/stenosis', not: ['lowback/nslbp'], route: 'results' } },
    // "Stenosis lumbar.docx" (v1.0, signed 5 Oct 2026): max 16 on the site, shown from 7.
    { name: '10b. 72, both legs heavy on walking, cycling easier, distance shrinking: stenosis (likely)',
      lines: [['lowerback', 'hipL', 'hipR', 'thighL', 'thighR']],
      focus: 'lowback',
      answers: { age: 'o64', onset: 'gradual', duration: 'o3m', L1: ['buttock', 'thigh'], L2: ['leg'], L5: ['claud'], L10: ['both', 'uphill', 'shorter'] },
      expect: { top: 'lowback/stenosis', route: 'results' } },
    { name: '10c. 66, calf cramps on walking that settle just standing still: the circulation card',
      lines: [['lowerback', 'kneeL']],
      focus: 'lowback',
      answers: { age: 'o64', onset: 'gradual', duration: 'o3m', L1: ['belowknee'], L2: ['leg'], L5: ['claud'], L10: ['standstill', 'flatbetter'] },
      expect: { special: 'calfDoctor', route: 'results' } },
    { name: '11. Back catches with small movements, pushes on thighs, frequent flare-ups (renamed card)',
      lines: [['lowerback']],
      answers: { age: '30-49', onset: 'twist', duration: 'o3m', L1: ['back'], L4: ['roll'], L6: ['wide'], L7: ['catch', 'thighs', 'flares'] },
      expect: { top: 'lowback/instability', route: 'results' } },
    // "Spondylolisthesis.docx" (v1.0, approved in session 6 Oct 2026): the
    // adult slip. Max 19 on the site; the document's "likely" is 10+.
    { name: '12. 62, ache across the low back, worse standing, eased leaning on a trolley, slip seen on a scan',
      lines: [['lowerback']],
      answers: { age: 'o64', onset: 'gradual', duration: 'o3m', L1: ['back'], L4: ['arch'], L6: ['centre'], L7: ['slipknown'], L10: ['uphill'] },
      expect: { top: 'lowback/spondylolisthesis', route: 'results' } },
    { name: '13. 26, gymnastics history, arching hurts, but no scan: the slip is NOT claimed from symptoms alone',
      lines: [['lowerback']],
      answers: { age: '18-29', onset: 'gradual', duration: 'o3m', L1: ['back'], L4: ['arch'], L6: ['centre'], L8: ['arching'] },
      expect: { not: ['lowback/spondylolisthesis'], route: 'results' } },
    // With claudication answers the five scored questions go to the stenosis
    // ones, so L7 (the "a scan showed a slip" answer) is never asked and the
    // slip card cannot score. Stenosis leads, which is the same management.
    // OPEN FOR CHANDRA: force the slip card alongside when a slip is known?
    { name: '14. 70, legs heavy on walking with a known slip: stenosis leads (the slip card needs its question to be asked)',
      lines: [['lowerback', 'hipL', 'kneeL']],
      focus: 'lowback',
      answers: { age: 'o64', onset: 'gradual', duration: 'o3m', L1: ['buttock', 'thigh'], L2: ['leg'], L4: ['arch'],
        L5: ['claud'], L7: ['slipknown'], L10: ['both', 'uphill', 'shorter'] },
      expect: { top: 'lowback/stenosis', route: 'results' } },
    // "Spondylolysis.docx" (approved in session, 6 Oct 2026), the two states.
    { name: '16. 16, gymnast, arching hurts, no X-ray yet: the doctor-first gate is asked',
      lines: [['lowerback']],
      answers: { age: 'u18', onset: 'gradual', duration: 'd6w', L1: ['back'], L4: ['arch'], L6: ['centre'], L8: ['arching'] },
      expect: { flagOffered: ['rf-spondy'], route: 'results' } },
    { name: '17. 16, same gymnast, already diagnosed and cleared: no second X-ray, physiotherapy route',
      lines: [['lowerback']],
      // Answered on "A little about you", before the safety questions — the
      // cautions list comes after them, too late to stop this one.
      answers: { age: 'u18', spondy: 'yes', onset: 'gradual', duration: 'd6w', L1: ['back'], L4: ['arch'], L6: ['centre'], L8: ['arching'] },
      expect: { noFlag: ['rf-spondy'], route: 'results' } },
    { name: '17b. The same answer from the cautions list also stops the second X-ray',
      lines: [['lowerback']],
      cautions: ['ca-spondy'],
      answers: { age: 'u18', onset: 'gradual', duration: 'd6w', L1: ['back'], L4: ['arch'], L6: ['centre'], L8: ['arching'] },
      expect: { noFlag: ['rf-spondy'], route: 'results' } },
    // "CaudaEquina.docx" (signed 5 Oct 2026): the fifth Pathway red flag.
    { name: '15. New loss of feeling during sex with the back pain: emergency, no booking',
      lines: [['lowerback']],
      focus: 'lowback',
      answers: { age: '30-49', onset: 'lift', duration: 'd2w' },
      flags: ['rf-sexual'],
      expect: { route: 'emergency' } },
    // Neurodynamics (6 Oct 2026; Shacklock NDS manual, Butler NOI workbook):
    // the leg nerve question L12 and the front-of-thigh question L13.
    { name: '18. Desk worker, a line down the back of the leg brought on by sitting with the leg straight, head forward makes it worse: sensitive nerve in the leg',
      lines: [['lowerback', 'hipR', 'kneeR', 'ankleR']],
      answers: { age: '30-49', onset: 'sitting', duration: 'd6w', L1: ['belowknee'], L2: ['leg'], L3: ['none'],
        L12: ['line', 'stretch', 'neckdown', 'toesup'], L4: ['bendsit'], L5: ['eases'], L6: ['wide'] },
      expect: { top: 'lowback/neural', asked: ['L3', 'L12'], route: 'results' } },
    { name: '19. Sciatica with pins and needles and a cough, and stretch positions too: nerve root leads, the leg nerve question is still asked',
      lines: [['lowerback', 'hipR', 'kneeR', 'ankleR']],
      answers: { age: '30-49', onset: 'lift', duration: 'd2w', L1: ['belowknee'], L2: ['leg'], L3: ['pins', 'cough', 'bendsit'],
        L12: ['line', 'stretch'], L4: ['bendsit'], L6: ['centre'] },
      expect: { top: 'lowback/radicular', asked: ['L3', 'L12'], route: 'results' } },
    { name: '20. Numbness that stays and the toes catching: the "book promptly" leg card',
      lines: [['lowerback', 'hipL', 'kneeL', 'ankleL']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd6w', L1: ['belowknee'], L2: ['leg'], L3: ['pins'],
        L12: ['line', 'loss'], L5: ['nochange'], L4: ['bendsit'] },
      expect: { special: 'legNerveLoss', route: 'results' } },
    { name: '21. 58, burning down the front of the thigh, worse lying on the front with the knee bent, knee weak on stairs: upper lumbar nerve root',
      lines: [['lowerback', 'hipR', 'thighR']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd6w', L1: ['front'], L2: ['leg'], L13: ['fronttingle', 'pkb', 'kneeweak'], L4: ['arch'], L6: ['side'] },
      expect: { top: 'lowback/upperroot', asked: ['L13'], special: 'legNerveLoss', route: 'results' } },
    { name: '22. Groin ache worse with socks and the car: the hip card, not the upper nerve root',
      lines: [['lowerback', 'hipR', 'thighR']],
      answers: { age: '50-64', onset: 'gradual', duration: 'o3m', L1: ['front'], L2: ['leg'], L13: ['groinhip'], L4: ['getup'], L6: ['wide'] },
      expect: { notTop: ['lowback/upperroot'], special: 'hipSource', route: 'results' } },
    { name: '23. Burning on the outer thigh only, worse with a tight belt: the meralgia card, not the upper nerve root',
      lines: [['lowerback', 'hipR', 'thighR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', L1: ['front'], L2: ['leg'], L13: ['outerthigh'], L4: ['arch'], L6: ['wide'] },
      expect: { notTop: ['lowback/upperroot'], special: 'meralgiaSource', route: 'results' } },
    { name: '24. 70, legs heavy on walking, arching sends it down the leg: stenosis still leads with the new leg question',
      lines: [['lowerback', 'hipL', 'kneeL', 'ankleL']],
      answers: { age: 'o64', onset: 'gradual', duration: 'o3m', L1: ['belowknee'], L2: ['same'], L3: ['none'], L5: ['claud'],
        L10: ['both', 'shorter'], L12: ['closing', 'vague'], L4: ['arch'] },
      expect: { top: 'lowback/stenosis', notTop: ['lowback/neural'], route: 'results' } },
  ],
  sij: [
    { name: '1. Sacroiliac joint after a jarring landing',
      lines: [['sij']],
      answers: { age: '30-49', onset: 'landing', duration: 'd3m', P1: ['belowdimple'], P2: ['oneleg', 'stairs'], P3: ['one'], P4: ['buttock'], P7: ['no'] },
      expect: { top: 'sij/sij', not: ['lowback/nslbp', 'lowback/radicular'], route: 'results' } },
    // Both dimples plus the pubic bone at the front (a hip-zone mark).
    { name: '2. Pregnancy-related pelvic girdle pain',
      lines: [['sij'], ['hipL']],
      answers: { age: '30-49', onset: 'pregnancy', duration: 'd6w', P1: ['dimple'], P2: ['oneleg', 'roll'], P3: ['both'],
        P5: ['pubic', 'aslr', 'turning'] },
      expect: { top: 'sij/pgp', notRegion: ['lowback'], route: 'results' } },
    // "Pregnancy.docx" (3 Oct 2026): pregnant on "A little about you", so the
    // pelvic girdle record opens although the pain "came on gradually".
    { name: '2b. Pregnant (28 weeks), pelvic girdle pain that came on gradually',
      lines: [['sij'], ['hipL']],
      answers: { age: '30-49', preg: 'p3', onset: 'gradual', duration: 'd6w', P1: ['dimple'], P2: ['oneleg', 'roll', 'stairs'], P3: ['both'],
        P4: ['thigh'], P5: ['pubic', 'turning'] },
      expect: { top: 'sij/pgp', notRegion: ['lowback'], route: 'results' } },
    { name: '2c. Not pregnant, same answers: no pelvic girdle pain of pregnancy',
      lines: [['sij'], ['hipL']],
      answers: { age: '30-49', preg: 'no', onset: 'gradual', duration: 'd6w', P1: ['dimple'], P2: ['oneleg', 'roll', 'stairs'], P3: ['both'],
        P4: ['thigh'], P5: ['pubic', 'turning'] },
      expect: { not: ['sij/pgp'], route: 'results' } },
    { name: '3. Inflammatory look-alike (axial spondyloarthritis)',
      lines: [['sij']],
      answers: { age: '18-29', onset: 'gradual', duration: 'o3m', P3: ['switch'], P6: ['morning', 'exercise'] },
      flags: ['prf-axspa'],
      expect: { route: 'urgent' } },
    { name: '4. Saddle numbness (cauda equina)',
      lines: [['sij'], ['hipL'], ['hipR']],
      answers: { age: '50-64', onset: 'lift', duration: 'd2w' },
      flags: ['prf-cauda'],
      expect: { route: 'emergency' } },
    { name: '5. Low back look-alike: dimple to the foot',
      lines: [['sij', 'hipR', 'kneeR', 'ankleR']],
      answers: { age: '30-49', onset: 'lift', duration: 'd6w', P1: ['lowback'], P4: ['belowknee'], P7: ['lot'] },
      // Either low-back card answers the document's "message suggesting the low back".
      expect: { notTop: ['sij/sij'], special: ['lowbackSource', 'backref'], route: 'results' } },
  ],
  // Path 4, pain in many places (6 Oct 2026): the signed Fibromyalgia
  // document's scored block (section 4), look-alikes (5) and red flags (6).
  // `path: 'widespread'` = "I have pain in many places, on most days".
  widespread: [
    { name: '1. Pain everywhere for a year, exhausted, sleep does not refresh, tender to light touch, headaches and IBS: persistent widespread pain',
      path: 'widespread',
      lines: [['neck'], ['lowerback'], ['shoulderL'], ['shoulderR'], ['kneeL'], ['kneeR']],
      answers: { age: '30-49', duration: 'o3m', WS3: 'most', WS4: 'both', WS5: 'nomap', WS6: 'two', WS7: ['none'] },
      // The master gate (WS5) and the look-alikes (WS7) are always asked (mustAsk).
      expect: { top: 'widespread/wsp', asked: ['WS3', 'WS5', 'WS7'], notAsked: ['N9', 'L1', 'S1', 'K1'], route: 'results' } },
    { name: '2. The route asks its own safety questions and every drawn area emergency one (cauda equina, septic knee), not the doctor-tier lists',
      path: 'widespread',
      lines: [['neck'], ['lowerback'], ['shoulderL'], ['shoulderR'], ['kneeL'], ['kneeR']],
      answers: { age: '30-49', duration: 'o3m', WS3: 'most' },
      expect: { flagOffered: ['ws-medicine', 'ws-rhabdo', 'ws-crisis', 'rf-saddle', 'rf-bladder', 'nrf-cord', 'kf-septic'], noFlag: ['rf-cancer', 'rf-aaa-slow', 'nrf-myelo', 'srf-rhabdo'], route: 'results' } },
    { name: '2b. Saddle numbness ticked on the widespread route: emergency',
      path: 'widespread',
      lines: [['neck'], ['lowerback'], ['shoulderL'], ['shoulderR'], ['kneeL'], ['kneeR']],
      answers: { age: '30-49', duration: 'o3m' },
      flags: ['rf-saddle'],
      expect: { route: 'emergency' } },
    { name: '2c. Aching all over for 3 weeks, exhausted, tender, headaches: not a sensitive pain system yet - the see-your-doctor card',
      path: 'widespread',
      lines: [['neck'], ['lowerback'], ['shoulderL'], ['shoulderR'], ['kneeL'], ['kneeR']],
      answers: { age: '30-49', duration: 'd6w', WS3: 'most', WS4: 'both', WS5: 'nomap', WS6: 'two', WS7: ['none'] },
      expect: { not: ['widespread/wsp'], special: 'wsRecent', route: 'results' } },
    { name: '3. 68, joints ache with use and ease with rest, knobbly fingers, no tiredness: several-joint osteoarthritis, not widespread pain',
      path: 'widespread',
      lines: [['neck'], ['lowerback'], ['handL'], ['handR'], ['kneeL'], ['kneeR']],
      answers: { age: 'o64', duration: 'o3m', WS3: 'fine', WS4: 'no', WS5: 'clear', WS6: 'none', WS7: ['usejoints', 'knobbly'] },
      expect: { top: 'widespread/multioa', not: ['widespread/wsp'], route: 'results' } },
    { name: '4. Over 50, stiff shoulders and hips worst in the morning: the see-your-doctor card',
      path: 'widespread',
      lines: [['neck'], ['lowerback'], ['shoulderL'], ['shoulderR'], ['hipL'], ['hipR']],
      answers: { age: 'o64', duration: 'd3m', WS3: 'some', WS4: 'no', WS5: 'nomap', WS6: 'none', WS7: ['pmr', 'amstiff'] },
      expect: { special: 'wsInflam', not: ['widespread/wsp'], route: 'results' } },
    { name: '5. Started with one clear injury: the one-area card',
      path: 'widespread',
      lines: [['neck'], ['lowerback'], ['shoulderL'], ['shoulderR'], ['kneeL'], ['kneeR']],
      answers: { age: '30-49', duration: 'd3m', WS3: 'fine', WS4: 'no', WS5: 'clear', WS6: 'none', WS7: ['none'] },
      expect: { special: 'oneArea', not: ['widespread/wsp'], route: 'results' } },
    { name: '6. Thoughts of harming yourself: the 9-8-8 crisis page',
      path: 'widespread',
      lines: [['neck'], ['lowerback'], ['shoulderL'], ['shoulderR'], ['kneeL'], ['kneeR']],
      answers: { age: '30-49', duration: 'o3m' },
      flags: ['ws-crisis'],
      expect: { route: 'emergency' } },
    { name: '7. Very flexible joints, frequent sprains: the hypermobility card alongside',
      path: 'widespread',
      lines: [['neck'], ['lowerback'], ['shoulderL'], ['shoulderR'], ['kneeL'], ['kneeR']],
      answers: { age: '18-29', duration: 'o3m', WS3: 'some', WS4: 'one', WS5: 'nomap', WS6: 'one', WS7: ['flexible'] },
      expect: { top: 'widespread/wsp', special: 'hypermobile', route: 'results' } },
  ],
  coccyx: [
    { name: '1. Bruised tailbone after a fall',
      lines: [['coccyx']],
      answers: { age: '30-49', onset: 'fall', duration: 'd2m', X1: ['tip'], X2: ['hard', 'leanback', 'leanfwd'], X5: ['landed', 'bruise'], X6: ['no'] },
      expect: { top: 'coccyx/trauma', not: ['coccyx/pelvicfloor'], notRegion: ['lowback'], route: 'results' } },
    { name: '2. Unstable tailbone after an assisted birth',
      lines: [['coccyx']],
      answers: { age: '30-49', onset: 'birth', duration: 'o2m', X1: ['tip'], X2: ['hard'], X3: ['sharp'], X5: ['assisted'] },
      expect: { top: 'coccyx/unstable', notRegion: ['lowback'], route: 'results' } },
    { name: '3. Pelvic floor muscle pain',
      lines: [['coccyx']],
      answers: { age: '30-49', onset: 'gradual', duration: 'o2m', X1: ['deep'], X2: ['fine'], X3: ['nochange'],
        X4: ['bowels', 'pressure', 'constipation'] },
      expect: { top: 'coccyx/pelvicfloor', notTop: ['coccyx/trauma', 'coccyx/unstable'], special: 'pelvicHealth', route: 'results' } },
    { name: '4. Saddle numbness (cauda equina)',
      lines: [['coccyx'], ['hipL']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd2w' },
      flags: ['xrf-saddle'],
      expect: { route: 'emergency' } },
    { name: '5. Pilonidal look-alike: lump in the buttock crease',
      lines: [['coccyx']],
      answers: { age: '18-29', onset: 'gradual', duration: 'd2m', X1: ['crease'], X8: ['lump'] },
      flags: ['xrf-pilonidal'],
      expect: { route: 'urgent' } },
  ],
  jaw: [
    { name: '1. Clicking jaw joint',
      lines: [['jawL']],
      answers: { age: '18-29', onset: 'gradual', duration: 'd12w', M1: ['joint', 'click'], M2: ['chewing', 'yawning'], M3: ['click'], M4: ['fullpain'] },
      expect: { top: 'jaw/clicking', not: ['jaw/closedlock'], notTop: ['jaw/myalgia'], route: 'results' } },
    // Both cheeks (jaw) and both temples (head).
    { name: '2. Jaw muscle pain with clenching',
      lines: [['jawL'], ['jawR'], ['head']],
      answers: { age: '30-49', onset: 'stress', duration: 'o3m', M1: ['muscles'], M2: ['chewing', 'talking'], M3: ['none'],
        M6: ['clench'], M7: ['waking'], M8: ['temples'] },
      expect: { top: 'jaw/myalgia', not: ['jaw/clicking', 'jaw/closedlock'], route: 'results' } },
    { name: '3. Closed lock',
      lines: [['jawR']],
      answers: { age: '18-29', onset: 'woke', duration: 'd2w', M1: ['stiff', 'locks'], M3: ['stopped'], M4: ['partway'], M5: ['closed'] },
      expect: { top: 'jaw/closedlock', notTop: ['jaw/clicking'], route: 'results' } },
    { name: '4. Giant cell arteritis look-alike',
      lines: [['head'], ['jawL']],
      answers: { age: 'o64', onset: 'gradual', duration: 'd2w', M1: ['muscles'], M2: ['chewing'] },
      flags: ['mrf-gca'],
      expect: { route: 'urgent' } },
    { name: '5. Neck look-alike: angle of the jaw and the neck',
      lines: [['jawR', 'neck']],
      answers: { age: '30-49', onset: 'gradual', duration: 'o3m', M1: ['muscles'], M2: ['nothing'], M3: ['none'], M4: ['fullfree'], M8: ['neck'] },
      expect: { notRegion: ['jaw'], special: 'neckSourceJaw', route: 'results' } },
  ],
  head: [
    { name: '1. Cervicogenic headache: back of the head and upper neck',
      lines: [['head', 'neck']],
      answers: { age: '30-49', onset: 'desk', duration: 'o3m', D1: ['sameside'], D2: ['pressing'], D3: ['neckmove', 'skullbase'],
        D4: ['h4d3'], D5: ['d1to14'], D6: ['upto9'] },
      expect: { top: ['head/cgh', 'neck/cheadache'], route: 'results' } },
    { name: '2. Tension-type headache',
      lines: [['head']],
      answers: { age: '30-49', onset: 'stress', duration: 'd12w', D1: ['band'], D2: ['pressing'], D3: ['stiffnochange'],
        D4: ['m30h4'], D5: ['d1to14'], D7: ['stress', 'desk'] },
      expect: { top: 'head/tth', notTop: ['head/cgh'], route: 'results' } },
    { name: '3. Thunderclap headache',
      lines: [['head']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd2w' },
      flags: ['hrf-thunderclap'],
      expect: { route: 'emergency' } },
    { name: '3b. Double vision and feeling sick, started 2 days after a hard knock to the head',
      lines: [['head']],
      answers: { age: '18-29', onset: 'knock', duration: 'd2w' },
      flags: ['hrf-trauma5d'],
      expect: { route: 'emergency' } },
    { name: '4. Migraine look-alike',
      lines: [['head']],
      answers: { age: '30-49', onset: 'years', duration: 'o3m', D1: ['switch'], D2: ['throb', 'sick', 'lightnoise'],
        D4: ['h4d3'], D5: ['d1to14'], D6: ['upto9'] },
      expect: { notRegion: ['head'], special: 'migraine', route: 'results' } },
    { name: '5. Frequent headaches and painkillers',
      lines: [['head']],
      answers: { age: '30-49', onset: 'years', duration: 'o3m', D1: ['band'], D5: ['d15'], D6: ['d15plus'] },
      expect: { top: 'head/tth', special: 'medOveruse', route: 'results' } },
    // "Cervicogenic Headache 1.docx" (v1.0 draft, 28 Sep 2026): max 15, shown
    // from 6 (its "possible match" line).
    { name: '6. Head only: sometimes brought on by the neck, stiff turning one way, started with neck pain',
      lines: [['head']],
      answers: { age: '30-49', onset: 'gradual', duration: 'o3m', D1: ['sameside'], D2: ['pressing'],
        D3: ['neckmovesome', 'turnstiff', 'withneck'], D5: ['d1to14'], D7: ['desk'] },
      expect: { top: 'head/cgh', route: 'results' } },
    { name: '7. Brief shooting pains in the scalp: occipital nerve card',
      lines: [['head']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd12w', D1: ['sameside'], D2: ['shooting'], D3: ['skullbase'], D5: ['d1to14'] },
      expect: { special: 'occipital', route: 'results' } },
    { name: '8. Neck triggers with throbbing, feeling sick and switching sides: migraine card, not neck-related headache on top',
      lines: [['head']],
      answers: { age: '30-49', onset: 'years', duration: 'o3m', D1: ['switch'], D2: ['throb', 'sick', 'lightnoise'],
        D3: ['neckmove'], D5: ['d1to14'], D6: ['upto9'] },
      expect: { notTop: ['head/cgh'], special: 'migraine', route: 'results' } },
    // "Concussion.docx" (v1.0, 2 Oct 2026): the head injury screen routes
    // first; the condition needs the knock plus 3 more points (max 15).
    { name: '9. Concussion two weeks ago, confirmed by a doctor: fog, light, screens and neck',
      lines: [['head']],
      answers: { age: '18-29', onset: 'knock', duration: 'd2w', I1: 'yes', I2: 'w4', I8: 'no', I9: 'no', I10: 'confirmed',
        D8: ['headache', 'foggy', 'sensitive', 'tired'], D9: ['loadclear', 'neck'] },
      expect: { top: 'head/concussion', route: 'results' } },
    { name: '10. Knock two days ago, no doctor yet: see a doctor today, no booking',
      lines: [['head']],
      answers: { age: '30-49', onset: 'knock', duration: 'd2w', I1: 'yes', I2: 'h72', I3: 'no', I4: 'no', I5: 'no', I6: 'no', I7: 'no', I8: 'no', I10: 'no' },
      expect: { route: 'urgent' } },
    { name: '11. Knock yesterday while taking a blood thinner: emergency today',
      lines: [['head']],
      answers: { age: 'o64', onset: 'knock', duration: 'd2w', I1: 'yes', I2: 'h72', I3: 'no', I4: 'no', I5: 'no', I6: 'yes' },
      expect: { route: 'emergency' } },
    { name: '12. Feeling hopeless since a concussion weeks ago: the 9-8-8 line',
      lines: [['head']],
      answers: { age: '18-29', onset: 'knock', duration: 'd12w', I1: 'yes', I2: 'o4w', I8: 'yes' },
      expect: { route: 'emergency' } },
    { name: '13. A knock with only a headache since: not concussion',
      lines: [['head']],
      answers: { age: '30-49', onset: 'knock', duration: 'd12w', I1: 'yes', I2: 'o4w', I8: 'no', I9: 'no', I10: 'notconc',
        D1: ['band'], D2: ['pressing'], D8: ['headache'], D9: ['none'] },
      expect: { not: ['head/concussion'], route: 'results' } },
  ],
  shoulder: [
    // Neurodynamics, second batch (6 Oct 2026): nerve conditions from the
    // Butler NOI workbook and the Shacklock NDS manual.
    { name: 'N1. Volleyball player, deep ache at the back of the shoulder, weak turning out, hollow shoulder blade: suprascapular nerve',
      lines: [['shoulderR']],
      answers: { age: '18-29', onset: 'gradual', duration: 'd3m', S1: ['back'], S2: ['fullfree'], S9: ['wasting', 'weakout', 'overhead'], S6: ['weakness'], S3: ['throwing'] },
      expect: { top: 'shoulder/suprascapular', asked: ['S9'], special: 'nerveLossShoulder', route: 'results' } },
    { name: 'N2. Pain at the back of the shoulder with none of the nerve signs: suprascapular is not claimed',
      lines: [['shoulderR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', S1: ['back'], S2: ['midarc'], S9: ['none'], S3: ['highshelf', 'lying'], S4: ['nostiff'] },
      expect: { not: ['shoulder/suprascapular'], route: 'results' } },
    // "Outer right upper arm, below the shoulder": an upper-arm mark, which
    // also asks the shoulder.
    { name: '1. Rotator cuff related shoulder pain',
      lines: [['upperarmR']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd3m', S1: ['outer'], S2: ['midarc'], S3: ['highshelf', 'lying'], S7: ['shoulder'] },
      expect: { top: 'shoulder/rc', not: ['shoulder/frozen'], notRegion: ['neck'], route: 'results' } },
    { name: '2. Frozen shoulder',
      lines: [['shoulderL']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd3m', S2: ['cantgo'], S3: ['behind', 'highshelf', 'across'], S4: ['stiffer'] },
      expect: { top: 'shoulder/frozen', notTop: ['shoulder/rc'], route: 'results' } },
    { name: '3. Neck look-alike: shoulder to thumb with pins and needles',
      lines: [['shoulderR', 'upperarmR', 'elbowR', 'forearmR', 'wristR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', painQuality: ['tingling'],
        S2: ['fullfree'], S7: ['neck'], S8: ['pastelbow', 'fingers', 'armworse'] },
      expect: { notRegion: ['shoulder'], special: 'neckSource', route: 'results' } },
    { name: '4. Heart look-alike: left shoulder and inner arm',
      lines: [['shoulderL', 'upperarmL']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd2w', S2: ['fullfree'], S7: ['neither'] },
      flags: ['rf-cardiac1'],
      expect: { route: 'emergency' } },
    { name: '5. Gallbladder look-alike: tip of the right shoulder',
      lines: [['shoulderR']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd6w', S2: ['fullfree'], S7: ['neither'] },
      flags: ['srf-organ'],
      expect: { route: 'urgent' } },
    { name: '6. Cannot lift the arm after a fall (injury screen)',
      lines: [['upperarmL']],
      answers: { age: 'o64', onset: 'fall', duration: 'd2w', I1: 'fall', I2: 'no', I3: 'no', I7: 'no', I4: 'yes' },
      expect: { route: 'urgent' } },
    // Shoulder cross-check (JOSPT 2025 and 2013, AIM manual, Chandra's protocols, current search), approved 5 Oct 2026.
    { name: '7. First dislocation at 55, weeks ago: the slipping-shoulder card shows at any age now',
      lines: [['shoulderR']],
      answers: { age: '50-64', onset: 'popped', duration: 'd3m', I1: 'no', S5: ['popped'] },
      expect: { top: 'shoulder/instability', route: 'results' } },
    { name: '8. Over 65, stiff in every direction and grating: shoulder arthritis, not frozen shoulder on top',
      lines: [['shoulderL']],
      answers: { age: 'o64', onset: 'gradual', duration: 'o3m', I1: 'no', S1: ['deep'], S2: ['cantgo'], S3: ['behind'], S4: ['stiffer'], S6: ['clicking'] },
      expect: { top: 'shoulder/oa', notTop: ['shoulder/frozen'], route: 'results' } },
    { name: '9. Weak after a fall months ago, arm goes up only when helped: rotator cuff tear',
      lines: [['shoulderR']],
      answers: { age: 'o64', onset: 'fall', duration: 'd3m', I1: 'no', S2: ['cantlift'], S3: ['lying'], S6: ['weakness'] },
      expect: { top: 'shoulder/cufftear', not: ['shoulder/frozen'], route: 'results' } },
    { name: '10. Thrower with a deep click: labral tear',
      lines: [['shoulderR']],
      answers: { age: '18-29', onset: 'overhead', duration: 'd6w', I1: 'no', S1: ['deep'], S3: ['throwing'], S6: ['clicking'], S5: ['stable'] },
      expect: { top: 'shoulder/labral', route: 'results' } },
    { name: '11. New step at the top of the shoulder after a fall: X-ray the same day, not the emergency department',
      lines: [['shoulderR']],
      answers: { age: '30-49', onset: 'fall', duration: 'd2w', I1: 'fall', I2: 'no', I3: 'no', I7: 'yes' },
      expect: { route: 'urgent' } },
  ],
  arm: [
    { name: '1. Biceps soreness after the gym',
      lines: [['upperarmR']],
      answers: { age: '18-29', onset: 'gym', duration: 'd2w', U1: ['front'], U2: ['lift'], U6: ['doms'] },
      expect: { top: 'arm/strain', notRegion: ['neck'], route: 'results' } },
    // A line from the neck to the thumb is read as neck referral: the neck
    // is asked, the upper arm is where it is felt.
    { name: '2. Neck look-alike: neck down the outer arm to the thumb',
      lines: [['neck', 'shoulderR', 'upperarmR', 'elbowR', 'forearmR', 'wristR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', painQuality: ['tingling'],
        U3: ['fromneck', 'line'], U4: ['thumb'], U5: ['neck'] },
      expect: { notRegion: ['arm'], areas: ['neck'], route: 'results' } },
    { name: '3. Thoracic outlet: whole arm heavy with it raised',
      lines: [['shoulderR', 'upperarmR', 'elbowR', 'forearmR', 'wristR']],
      answers: { age: '18-29', onset: 'gradual', duration: 'd3m', U2: ['carry', 'overhead'], U3: ['heavy'], U7: ['heavy'] },
      expect: { top: 'arm/tos', notTop: ['arm/strain'], route: 'results' } },
    { name: '4. Heart look-alike: inside of the left arm',
      lines: [['upperarmL', 'forearmL']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd2w', U5: ['none'] },
      flags: ['arf-cardiac'],
      expect: { route: 'emergency' } },
    { name: '5. Cannot lift the wrist after a fall (injury screen)',
      lines: [['upperarmR']],
      answers: { age: 'o64', onset: 'fall', duration: 'd2w', I1: 'fall', I2: 'no', I3: 'no', I4: 'no', I5: 'yes' },
      expect: { route: 'urgent' } },
  ],
  elbow: [
    { name: '1. Tennis elbow',
      lines: [['elbowR', 'forearmR']],
      answers: { age: '30-49', onset: 'grip', duration: 'd3m', E1: ['outer'], E2: ['grip'], E5: ['full'] },
      expect: { top: 'elbow/tennis', not: ['elbow/radialtunnel'], notRegion: ['neck'], route: 'results' } },
    { name: '2. Ulnar nerve at the elbow',
      lines: [['elbowL', 'forearmL', 'wristL']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', painQuality: ['tingling'],
        E2: ['bent'], E3: ['little'], E4: ['tingle'], E6: ['armhand'] },
      expect: { top: 'elbow/cubital', notTop: ['elbow/golfer'], route: 'results' } },
    // A line from the neck to the thumb is read as neck referral: the neck
    // is asked, the elbow is where it is felt.
    { name: '3. Neck look-alike: neck down the outer arm to the thumb',
      lines: [['neck', 'shoulderR', 'upperarmR', 'elbowR', 'forearmR', 'wristR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', painQuality: ['tingling'],
        E3: ['thumb'], E6: ['neck'], E7: ['fromneck'] },
      expect: { notRegion: ['elbow'], areas: ['neck'], route: 'results' } },
    { name: '4. Young thrower whose elbow catches',
      lines: [['elbowR']],
      answers: { age: 'u18', onset: 'throw', duration: 'd6w', E1: ['inner'], E5: ['locks'], E8: ['backthrow'] },
      flags: ['erf-child'],
      expect: { route: 'urgent' } },
    { name: '5. Pop at the front of the elbow (injury screen)',
      lines: [['elbowR']],
      answers: { age: '30-49', onset: 'pop', duration: 'd2w', I1: 'pop', I2: 'no', I3: 'no', I4: 'no', I5: 'yes' },
      expect: { route: 'urgent' } },
    { name: '6. Cannot straighten the elbow after a fall (injury screen)',
      lines: [['elbowL']],
      answers: { age: '18-29', onset: 'fall', duration: 'd2w', I1: 'fall', I2: 'no', I3: 'no', I4: 'no', I5: 'no', I6: 'no' },
      expect: { route: 'urgent' } },
    // A mark on the outer elbow whose end grazed the forearm: the elbow is the
    // main area and is asked first; the drawing answers its location.
    { name: '7. Outer elbow with a graze into the forearm (main area first)',
      lines: [['elbowR', 'forearmR']], ink: { elbowR: 0.88, forearmR: 0.12 },
      points: { elbowR: spot(0.1, 0.188, -0.01) },
      answers: { age: '30-49', onset: 'grip', duration: 'd3m', E2: ['grip'], E5: ['full'] },
      expect: { top: 'elbow/tennis', firstAsked: 'E', notAsked: ['E1'], route: 'results' } },
    // 6 Oct 2026: elbow cross-check (all 28 approved by Chandra).
    { name: '8. Leans on the elbow, little-finger tingling, weak grip, bend test "not sure" (cubital tunnel, C1)',
      lines: [['elbowL']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', painQuality: ['tingling'], I1: 'no', E1: ['inner'], E2: ['lean'], E3: ['little', 'weak'], E4: ['unsure'] },
      expect: { top: 'elbow/cubital', route: 'results' } },
    { name: '9. The elbow catches or locks at 40 (joint, C2)',
      lines: [['elbowR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'o3m', I1: 'no', E5: ['locks'], E7: ['stays'] },
      expect: { top: 'elbow/joint', route: 'results' } },
    { name: '10. Fell on the elbow, the point is very sore to press (olecranon, S4)',
      lines: [['elbowR']],
      answers: { age: '30-49', onset: 'fall', duration: 'd2w', I1: 'fall', I2: 'no', I3: 'no', I4: 'no', I6: 'yes', I10: 'yes' },
      expect: { route: 'urgent' } },
    { name: '11. Elbow went out of place and back by itself (S3)',
      lines: [['elbowL']],
      answers: { age: '18-29', onset: 'fall', duration: 'd2w', I1: 'fall', I2: 'no', I3: 'no', I4: 'no', I6: 'yes', I10: 'no', I9: 'yes' },
      expect: { route: 'urgent' } },
    { name: '12. Cannot straighten the fingers after a fall (nerve injury, S2)',
      lines: [['elbowR']],
      answers: { age: '30-49', onset: 'fall', duration: 'd2w', I1: 'fall', I2: 'no', I3: 'no', I4: 'no', I6: 'yes', I10: 'no', I9: 'no', I7: 'yes' },
      expect: { route: 'urgent' } },
    { name: '13. A thrower whose inner elbow pain came on gradually (C3)',
      lines: [['elbowR']],
      answers: { age: '18-29', onset: 'gradual', duration: 'd6w', I1: 'no', E1: ['inner'], E2: ['throw'], E8: ['backthrow', 'speed'] },
      expect: { top: 'elbow/ucl', route: 'results' } },
    { name: '14. Back of the elbow, worse pushing (triceps, C7)',
      lines: [['elbowL']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', I1: 'no', E1: ['back'], E2: ['push'], E5: ['full'] },
      expect: { top: 'elbow/posterior', not: ['elbow/tennis'], route: 'results' } },
    { name: '15. Stiff after a broken elbow (fracture rehabilitation, N1)',
      lines: [['elbowR']],
      answers: { age: '50-64', onset: 'surgery', duration: 'd3m', I1: 'no', E5: ['nostraight'] },
      expect: { top: 'elbow/fracture', route: 'results' } },
  ],  forearm: [
    { name: '1. Intersection syndrome',
      lines: [['forearmR']],
      answers: { age: '18-29', onset: 'newtask', duration: 'd2w', F1: ['distal'], F2: ['wrist'], F3: ['squeak', 'swelling'] },
      expect: { top: 'forearm/intersection', not: ['forearm/pronator', 'forearm/radialtunnel', 'forearm/wartenberg'], route: 'results' } },
    { name: '2. Pronator syndrome',
      lines: [['forearmR', 'wristR']],
      answers: { age: '30-49', onset: 'grip', duration: 'd3m', painQuality: ['tingling'],
        F1: ['volar'], F4: ['thumb'], F5: ['use'], F6: ['wristhand'] },
      expect: { top: 'forearm/pronator', notRegion: ['neck'], route: 'results' } },
    { name: '3. Arm pump in both forearms',
      lines: [['forearmL'], ['forearmR']],
      answers: { age: '18-29', onset: 'sport', duration: 'd3m', F2: ['sport'], F3: ['tight'], F8: ['tight', 'eases'] },
      expect: { top: 'forearm/armpump', notRegion: ['neck'], route: 'results' } },
    // A line from the neck to the thumb is read as neck referral.
    { name: '4. Neck look-alike: neck down the thumb side of the forearm',
      lines: [['neck', 'shoulderR', 'upperarmR', 'elbowR', 'forearmR', 'wristR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', painQuality: ['tingling'],
        F4: ['thumb'], F5: ['notingle'], F6: ['neck'], F7: ['fromneck'] },
      expect: { notRegion: ['forearm'], areas: ['neck'], route: 'results' } },
    { name: '5. Tight, swelling forearm in a cast',
      lines: [['forearmL']],
      answers: { age: '50-64', onset: 'fall', duration: 'd2w' },
      flags: ['frf-compartment'],
      expect: { route: 'emergency' } },
  ],  wrist: [
    // The pattern screens: known diabetes answers the nerve screen already
    // (../src/data/diabetes.js, NERVE_WHY), 6 Oct 2026 audit.
    { name: 'P1. Both wrists: the glove-and-stocking nerve screen is asked',
      lines: [['wristL'], ['wristR']],
      answers: { age: '50-64', onset: 'gradual', duration: 'o3m' },
      expect: { pattern: ['pc-polyneuropathy'], route: 'results' } },
    { name: 'P2. Both wrists with known diabetes: it is not asked again',
      lines: [['wristL'], ['wristR']],
      answers: { age: '50-64', onset: 'gradual', duration: 'o3m', dm: 'yes' },
      expect: { noPattern: ['pc-polyneuropathy'], route: 'results' } },
    // "CRPS.docx" (v1.0 draft, 2 Oct 2026): max 17, shown from 7.
    { name: 'CRPS 1. Wrist burning, swollen and discoloured 2 months after a fracture in a cast',
      lines: [['wristR']],
      answers: { age: '50-64', onset: 'fall', duration: 'd3m', I1: 'no', W9: ['trigger', 'outofprop', 'colour', 'swelling', 'touch', 'motor'] },
      expect: { top: 'wrist/crps', route: 'results' } },
    { name: 'CRPS 2. Hand and wrist drawn as a glove: the CRPS question is asked once',
      lines: [['wristR', 'handR']],
      answers: { age: '50-64', onset: 'fall', duration: 'd3m', I1: 'no', W9: ['trigger', 'outofprop', 'colour', 'touch'] },
      expect: { notAsked: ['H9'], route: 'results' } },
    { name: "1. De Quervain's after a new baby",
      lines: [['wristR']],
      answers: { age: '30-49', onset: 'baby', duration: 'd6w', W1: ['thumb'], W2: ['baby'], W5: ['sharp'] },
      expect: { top: 'wrist/dq', not: ['wrist/median'], route: 'results' } },
    { name: '2. Carpal tunnel syndrome',
      lines: [['wristR']],
      answers: { age: '50-64', onset: 'gradual', duration: 'o3m', painQuality: ['tingling'],
        W3: ['thumb'], W4: ['night', 'posture'], W8: ['wristhand'] },
      expect: { top: 'wrist/median', notRegion: ['neck'], route: 'results' } },
    { name: '3. Thumb-side pain after a fall (scaphoid, injury screen)',
      lines: [['wristL']],
      answers: { age: '18-29', onset: 'fall', duration: 'd2w', I1: 'fall', I2: 'no', I3: 'no', I4: 'no', I5: 'yes' },
      expect: { route: 'urgent' } },
    // More than 6 weeks ago, so the injury screen's gate is "No".
    { name: '4. TFCC after a twist',
      lines: [['wristR']],
      answers: { age: '30-49', onset: 'twist', duration: 'd3m', I1: 'no', W1: ['little'], W2: ['rotate'], W6: ['clunk', 'fovea'] },
      expect: { top: 'wrist/tfcc', not: ['wrist/guyon'], route: 'results' } },
    { name: '5. Burning, swollen hand after a cast (CRPS)',
      lines: [['wristR']],
      answers: { age: '50-64', onset: 'fall', duration: 'd3m' },
      flags: ['wrf-crps'],
      expect: { route: 'urgent' } },
    // A line from the neck to the thumb is read as neck referral.
    { name: '6. Neck look-alike: neck down the thumb side to the thumb',
      lines: [['neck', 'shoulderR', 'upperarmR', 'elbowR', 'forearmR', 'wristR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', painQuality: ['tingling'],
        W3: ['thumb'], W4: ['posture'], W8: ['neck'] },
      expect: { notRegion: ['wrist'], areas: ['neck'], route: 'results' } },
    // 6 Oct 2026: wrist and hand cross-check (all 29 approved by Chandra).
    { name: '8. Carpal tunnel, minimal: thumb-side tingling that wakes them at night (C2)',
      lines: [['wristR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', painQuality: ['tingling'], I1: 'no', W3: ['thumb'], W4: ['night'] },
      expect: { top: 'wrist/median', route: 'results' } },
    { name: '9. Older adult, whole wrist, gripping: not thumb base arthritis without a thumb answer (C1)',
      lines: [['wristL']],
      answers: { age: 'o64', onset: 'gradual', duration: 'o3m', I1: 'no', W1: ['whole'], W2: ['grip'] },
      expect: { not: ['wrist/thumboa'], route: 'results' } },
    { name: '10. Fell on the hand, sore over the bone above the wrist (S7)',
      lines: [['wristR']],
      answers: { age: '50-64', onset: 'fall', duration: 'd2w', I1: 'fall', I2: 'no', I3: 'no', I4: 'no', I5: 'no', I6: 'no', I7: 'yes' },
      expect: { route: 'urgent' } },
    { name: '11. A child not using the hand after a fall (S7)',
      lines: [['wristL']],
      answers: { age: 'u18', onset: 'fall', duration: 'd2w', I1: 'fall', I2: 'no', I3: 'no', I4: 'no', I5: 'no', I6: 'no', I7: 'no', I8: 'yes' },
      expect: { route: 'urgent' } },
    { name: "12. Texting teenager with thumb-side wrist pain, test skipped (de Quervain's, C3)",
      lines: [['wristR']],
      answers: { age: '18-29', onset: 'grip', duration: 'd6w', I1: 'no', W1: ['thumb'], W2: ['typing', 'grip'], W5: ['skip'] },
      expect: { top: 'wrist/dq', route: 'results' } },
    { name: '13. Stiff after a broken wrist (fracture rehabilitation, N1)',
      lines: [['wristR']],
      answers: { age: 'o64', onset: 'surgery', duration: 'd3m', I1: 'no', W1: ['whole'], W2: ['grip'] },
      expect: { top: 'wrist/fracture', route: 'results' } },
  ],  hand: [
    // "Dupuytrens contractures.docx" (signed by Chandra, 2 Oct 2026): max 12, shown from 5.
    { name: "Dupuytren's 1. Painless cord in the palm, ring finger slowly bending, hand will not lie flat",
      lines: [['handR']],
      answers: { age: 'o64', onset: 'gradual', duration: 'o3m', I1: 'no', H1: ['palm'], H2: ['cord', 'dupuytren', 'flat'] },
      expect: { top: 'hand/dupuytren', special: 'dupuytrenReferral', route: 'results' } },
    { name: "Dupuytren's 2. A finger that clicks and locks: trigger finger, not Dupuytren's on top",
      lines: [['handR']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd3m', I1: 'no', H1: ['palm'], H2: ['trigger', 'nodule'] },
      expect: { notTop: ['hand/dupuytren'], route: 'results' } },
    { name: '1. Thumb base arthritis',
      lines: [['handR']],
      answers: { age: '50-64', onset: 'gradual', duration: 'o3m', H1: ['thumbbase'], H3: ['pinch'], H6: ['bony'] },
      expect: { top: 'hand/thumboa', route: 'results' } },
    { name: '2. Trigger finger',
      lines: [['handR']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd3m', H1: ['palm'], H2: ['trigger', 'nodule'] },
      expect: { top: 'hand/trigger', notTop: ['hand/handoa'], route: 'results' } },
    { name: '3. Drooping fingertip after a jam (mallet finger, injury screen)',
      lines: [['handL']],
      answers: { age: '30-49', onset: 'injury', duration: 'd2w', I1: 'jammed', I2: 'no', I4: 'yes' },
      expect: { route: 'urgent' } },
    { name: '4. Swollen knuckle after a punch (fight bite)',
      lines: [['handR']],
      answers: { age: '18-29', onset: 'crush', duration: 'd2w' },
      flags: ['hnd-bite'],
      expect: { route: 'emergency' } },
    { name: '5. Knuckles of both hands swollen and stiff',
      lines: [['handL'], ['handR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd3m', H1: ['knuckles'], H6: ['both'], H7: ['stiff'] },
      flags: ['hnd-inflam'],
      expect: { route: 'urgent' } },
    // A line from the neck to the thumb is read as neck referral.
    { name: '6. Neck look-alike: neck to the thumb and index finger',
      lines: [['neck', 'shoulderR', 'upperarmR', 'elbowR', 'forearmR', 'wristR', 'handR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', painQuality: ['tingling'],
        H4: ['thumb'], H5: ['use'], H8: ['neck'] },
      expect: { notRegion: ['hand'], areas: ['neck'], route: 'results' } },
    // 6 Oct 2026: wrist and hand cross-check (all 29 approved by Chandra).
    { name: '9. Punched someone in the mouth: fight bite (S5)',
      lines: [['handR']],
      answers: { age: '18-29', onset: 'crush', duration: 'd2w', I1: 'bite' },
      expect: { route: 'emergency' } },
    { name: "10. Fell on the hand, thumb knuckle sore and pinch weak (skier's thumb after a fall, S4)",
      lines: [['handL']],
      answers: { age: '30-49', onset: 'injury', duration: 'd2w', I1: 'fall', I2: 'no', I4: 'no', I6: 'yes' },
      expect: { route: 'urgent' } },
    { name: '11. Jammed finger, cannot bend the tip (jersey finger after a jam, S4)',
      lines: [['handR']],
      answers: { age: '18-29', onset: 'injury', duration: 'd2w', I1: 'jammed', I2: 'no', I4: 'no', I5: 'yes' },
      expect: { route: 'urgent' } },
    { name: '12. Finger-joint arthritis with pinching: hand arthritis on top, not the thumb base (C1)',
      lines: [['handL']],
      answers: { age: '50-64', onset: 'gradual', duration: 'o3m', I1: 'no', H1: ['fingerjoints'], H2: ['nodes'], H3: ['grip', 'pinch'] },
      expect: { top: 'hand/handoa', notTop: ['hand/thumboa'], route: 'results' } },
    { name: '13. Daytime-only carpal tunnel in the hand (C2)',
      lines: [['handR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', painQuality: ['tingling'], I1: 'no', H1: ['whole'], H4: ['thumb'], H5: ['use'], H8: ['fingers'] },
      expect: { top: 'hand/median', route: 'results' } },
  ],  hip: [
    // Neurodynamics, second batch (6 Oct 2026): nerve conditions from the
    // Butler NOI workbook and the Shacklock NDS manual.
    { name: 'N1. Footballer, inner thigh ache with tingling down to the knee after training: obturator nerve',
      lines: [['hipL']],
      answers: { age: '18-29', onset: 'sport', duration: 'd6w', G1: ['inner'], G6: ['innerthigh'], G2: ['walking'] },
      expect: { top: 'hip/obturator', asked: ['G6'], route: 'results' } },
    { name: '7. Clunk and cannot stand, 3 weeks after a hip replacement (911)',
      lines: [['hipL']],
      answers: { age: 'o64', onset: 'gradual', duration: 'd6w', I1: 'no' },
      flags: ['hpf-dislocation'],
      expect: { route: 'emergency' } },
    { name: '8. Sudden groin pain with osteoporosis, no fall (same-day X-ray)',
      lines: [['hipR']],
      answers: { age: 'o64', onset: 'gradual', duration: 'd2w', I1: 'no' },
      flags: ['hpf-nofall'],
      expect: { route: 'urgent' } },
    { name: '1. Gluteal tendinopathy',
      lines: [['hipR']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd3m', G1: ['outer'], G2: ['lying', 'stairs'], G4: ['spot'] },
      expect: { top: 'hip/gtps', notTop: ['hip/hipoa'], route: 'results' } },
    { name: '2. Hip osteoarthritis',
      lines: [['hipL']],
      answers: { age: 'o64', onset: 'gradual', duration: 'o3m', G1: ['groin'], G2: ['socks'], G3: ['amstiff'], G4: ['csign'] },
      expect: { top: 'hip/hipoa', notTop: ['hip/gtps'], route: 'results' } },
    { name: '3. FAI syndrome in a young athlete',
      lines: [['hipR']],
      answers: { age: '18-29', onset: 'sport', duration: 'd3m', I1: 'no', G1: ['groin'], G2: ['lowchair'], G3: ['click'], G4: ['csign'], G5: ['joint'] },
      expect: { top: 'hip/fai', notTop: ['hip/add'], route: 'results' } },
    // Low back, buttock and front of the thigh: the back is asked too.
    { name: '4. Low back look-alike: back, buttock and thigh with pins and needles',
      lines: [['lowerback', 'sij', 'hipR']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd6w', painQuality: ['tingling'],
        G1: ['buttock'], G6: ['pins'], G7: ['back'] },
      expect: { notRegion: ['hip'], special: 'lowbackHip', route: 'results' } },
    { name: '5. Runner with a deep groin ache (stress fracture)',
      lines: [['hipR']],
      answers: { age: '18-29', onset: 'sport', duration: 'd6w', G1: ['groin'] },
      flags: ['hpf-stress'],
      expect: { route: 'urgent' } },
    { name: '6. Cannot stand after a fall (injury screen)',
      lines: [['hipL']],
      answers: { age: 'o64', onset: 'fall', duration: 'd2w', I1: 'fall', I2: 'yes' },
      expect: { route: 'emergency' } },
    // Hip cross-check (JOSPT hip OA 2025, nonarthritic hip 2014/2023, AIM manual, protocols, Doha, ESSKA), approved 5 Oct 2026.
    { name: '7. A 7-year-old limping with hip pain: asked from age 5 now',
      lines: [['hipR']],
      answers: { age: 'u18', onset: 'gradual', duration: 'd2w', I1: 'no' },
      flags: ['hpf-sufe'],
      expect: { route: 'urgent' } },
    { name: '8. A tender groin lump that will not go back in, without vomiting: emergency',
      lines: [['hipR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd2w', I1: 'no' },
      flags: ['hpf-strangulated'],
      expect: { route: 'emergency' } },
    { name: '9. Sit-bone pain worse sitting, a runner: proximal hamstring tendinopathy (new card)',
      lines: [['hipL']],
      answers: { age: '30-49', onset: 'sport', duration: 'd3m', I1: 'no', G1: ['buttock'], G2: ['sitting'], G4: ['sitbone'] },
      expect: { top: 'hip/hamstring', route: 'results' } },
    { name: '10. Weeks after a hip replacement, stairs and socks hard: recovery card (new)',
      lines: [['hipR']],
      answers: { age: 'o64', onset: 'surgery', duration: 'd6w', I1: 'no', G2: ['stairs', 'socks'] },
      expect: { top: 'hip/postop', route: 'results' } },
    { name: '11. Buttock pain without sitting trouble: not deep gluteal',
      lines: [['hipL']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', I1: 'no', G1: ['buttock'], G4: ['back'] },
      expect: { not: ['hip/deepgluteal'], route: 'results' } },
    { name: '12. A twist in sport, cannot stand on the leg: asked after a twist now',
      lines: [['hipR']],
      answers: { age: '18-29', onset: 'twist', duration: 'd2w', I1: 'twist', I2: 'yes' },
      expect: { route: 'emergency' } },
  ],  thigh: [
    // Neurodynamics, second batch (6 Oct 2026): nerve conditions from the
    // Butler NOI workbook and the Shacklock NDS manual.
    { name: 'N1. Tingling down the inner thigh: the obturator card points to the Hip guide',
      lines: [['thighL']],
      answers: { age: '18-29', onset: 'sport', duration: 'd6w', R1: ['inner'], R5: ['innerthigh'], R2: ['sprint'] },
      expect: { asked: ['R5'], special: 'obturatorNerve', route: 'results' } },
    { name: '1. Hamstring strain while sprinting',
      lines: [['thighR']],
      answers: { age: '18-29', onset: 'sprint', duration: 'd2w', I1: 'sprint', I2: 'no', I4: 'no', I5: 'no',
        R1: ['back'], R2: ['sprint', 'stretch'], R3: ['sharp'] },
      expect: { top: 'thigh/hamstring', route: 'results' } },
    { name: '2. Dead leg after a knee in football',
      lines: [['thighL']],
      answers: { age: '18-29', onset: 'knock', duration: 'd2w', I1: 'knock', I2: 'no', I3: 'no', I5: 'no', I6: 'no',
        R3: ['bruise'], R4: ['half'] },
      expect: { top: 'thigh/contusion', notTop: ['thigh/quadstrain'], route: 'results' } },
    { name: '3. Meralgia paraesthetica',
      lines: [['thighR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd3m', R1: ['patch'], R2: ['standing'], R5: ['patch'] },
      expect: { top: 'thigh/meralgia', route: 'results' } },
    // A line from the low back down the thigh into the calf is read as
    // referral from the back: the back is asked.
    { name: '4. Low back look-alike: back down the thigh into the calf',
      lines: [['lowerback', 'thighL', 'kneeL']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', painQuality: ['burning'],
        R1: ['back'], R5: ['pins', 'belowknee'], R6: ['back'] },
      expect: { notRegion: ['thigh'], areas: ['lowback'], route: 'results' } },
    { name: '5. Swollen thigh and calf after knee surgery (clot)',
      lines: [['thighR', 'kneeR']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd2w', R8: ['whole'] },
      flags: ['tgf-dvt'],
      expect: { route: 'urgent' } },
    { name: '6. Runner with a deep thigh ache (stress fracture)',
      lines: [['thighL']],
      answers: { age: '18-29', onset: 'running', duration: 'd6w', R1: ['front'] },
      flags: ['tgf-stress'],
      expect: { route: 'urgent' } },
  ],  knee: [
    // The pattern screens (../src/data/patternChecks.js), 6 Oct 2026 audit.
    { name: 'P1. Both knees, stiff for well over 30 minutes each morning: the inflammatory screen is asked',
      lines: [['kneeL'], ['kneeR']],
      focus: 'knee',
      answers: { age: '50-64', onset: 'gradual', duration: 'o3m', pattern24: ['amLong'] },
      expect: { pattern: ['pc-inflammatory'], route: 'results' } },
    { name: 'P2. The same person ticks it: a doctor first',
      lines: [['kneeL'], ['kneeR']],
      focus: 'knee',
      answers: { age: '50-64', onset: 'gradual', duration: 'o3m', pattern24: ['amLong'] },
      patterns: ['pc-inflammatory'],
      expect: { route: 'urgent' } },
    { name: 'P3. One knee only: the inflammatory screen is not asked',
      lines: [['kneeR']],
      answers: { age: '50-64', onset: 'gradual', duration: 'o3m', pattern24: ['amLong'] },
      expect: { noPattern: ['pc-inflammatory'], route: 'results' } },
    { name: '7. Child of 10, fell onto the knee, walking (Pittsburgh knee rule)',
      lines: [['kneeR']],
      answers: { age: 'u18', onset: 'fall', duration: 'd2w', I1: 'fall', I2: 'no', I3: 'no', I9: 'no', I4: 'no', I8: 'yes' },
      expect: { route: 'urgent' } },
    { name: '1. Patellofemoral pain',
      lines: [['kneeR']],
      answers: { age: '18-29', onset: 'gradual', duration: 'd3m', K1: ['kneecap'], K2: ['stairs'], K3: ['none'] },
      expect: { top: 'knee/pfp', not: ['knee/oa', 'knee/meniscus'], route: 'results' } },
    { name: '2. Knee osteoarthritis',
      lines: [['kneeL']],
      answers: { age: 'o64', onset: 'gradual', duration: 'o3m', K1: ['inner'], K3: ['stiff', 'swelling'], K6: ['no'] },
      expect: { top: 'knee/oa', notTop: ['knee/meniscus'], notRegion: ['hip'], route: 'results' } },
    { name: '3. Pop and quick swelling after a twist (injury screen)',
      lines: [['kneeR']],
      answers: { age: '18-29', onset: 'twist', duration: 'd2w', I1: 'twist', I2: 'no', I3: 'no', I9: 'no', I4: 'no', I5: 'yes' },
      expect: { route: 'urgent' } },
    { name: '4. A 13-year-old with thigh and knee pain (slipped growth plate)',
      lines: [['thighL', 'kneeL']],
      answers: { age: 'u18', onset: 'gradual', duration: 'd6w', K1: ['kneecap'], K6: ['yes'] },
      flags: ['kf-sufe'],
      expect: { route: 'urgent' } },
    // More than 6 weeks ago, so the injury screen's gate is "No".
    { name: '5. Meniscal tear after a twist',
      lines: [['kneeR']],
      answers: { age: '30-49', onset: 'twist', duration: 'd3m', I1: 'no', K1: ['inner'], K2: ['twist'], K3: ['click'], K4: ['nextday'] },
      expect: { top: 'knee/meniscus', not: ['knee/oa'], notTop: ['knee/acl'], route: 'results' } },
    { name: '6. Swollen calf after a knee replacement (clot)',
      lines: [['kneeR']],
      answers: { age: 'o64', onset: 'surgery', duration: 'd2w', K5: ['back'] },
      flags: ['kf-dvt'],
      expect: { route: 'urgent' } },
    // Drawn at the back of the knee: the drawing answers "Where is the pain?".
    { name: "7. Drawn at the back of the knee: Baker's cyst (location from the drawing)",
      lines: [['kneeR']], points: { kneeR: spot(-0.19, 0.068, -0.042) },
      answers: { age: 'o64', onset: 'gradual', duration: 'o3m', K3: ['swelling'], K5: ['back'] },
      expect: { top: 'knee/baker', notAsked: ['K1'], route: 'results' } },
    // Knee cross-check (CPGs, AIM manual, current search), approved by Chandra 5 Oct 2026.
    { name: '8. ACL after a tackle (a blow can now reach the ACL card)',
      lines: [['kneeR']],
      answers: { age: '18-29', onset: 'blow', duration: 'd3m', I1: 'no', K1: ['inner'], K3: ['giveway'], K4: ['pop', 'fast', 'stop'] },
      expect: { top: 'knee/acl', route: 'results' } },
    { name: '9. Kneecap that slips to the side and gives way (new card)',
      lines: [['kneeL']],
      answers: { age: 'u18', onset: 'twist', duration: 'd3m', I1: 'no', K1: ['kneecap'], K3: ['kneecapshift', 'giveway'] },
      expect: { top: 'knee/kneecap', notTop: ['knee/acl'], route: 'results' } },
    { name: '10. A 16-year-old limping with knee pain: the SUFE question is asked at 16 and 17 too',
      lines: [['kneeL']],
      answers: { age: '18-29', onset: 'gradual', duration: 'd6w', K1: ['kneecap'], K6: ['yes'] },
      flags: ['kf-sufe'],
      expect: { route: 'urgent' } },
    { name: '11. Kneels a lot, no swelling: not kneecap bursitis',
      lines: [['kneeR']],
      answers: { age: '30-49', onset: 'kneeling', duration: 'd6w', K1: ['kneecap'], K2: ['kneeling', 'stairs'], K5: ['none'] },
      expect: { not: ['knee/prepatellar'], route: 'results' } },
    { name: '12. Tender inner shin just below the knee, stairs (pes anserine, new card)',
      lines: [['kneeL']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd3m', K1: ['inner'], K2: ['stairs'], K5: ['pesanserine'] },
      expect: { top: 'knee/pesanserine', route: 'results' } },
    { name: '13. Kneecap pain at 32: patellofemoral pain, not kneecap arthritis',
      lines: [['kneeR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'o3m', K1: ['kneecap'], K2: ['stairs'], K3: ['none'] },
      expect: { top: 'knee/pfp', not: ['knee/pfoa'], route: 'results' } },
    { name: '14. Knee forced backwards, quick swelling without a pop (injury screen)',
      lines: [['kneeR']],
      answers: { age: '30-49', onset: 'blow', duration: 'd2w', I1: 'hyper', I2: 'no', I3: 'no', I9: 'no', I4: 'no', I5: 'yes' },
      expect: { route: 'urgent' } },
  ],  leg: [
    // The pattern screens (../src/data/patternChecks.js), 6 Oct 2026 audit.
    { name: 'P1. Child of 12, both lower legs: the early muscle-signs screen is asked',
      lines: [['lowerlegL'], ['lowerlegR']],
      answers: { age: 'u18', onset: 'gradual', duration: 'o3m' },
      expect: { pattern: ['pc-child-muscle'], route: 'results' } },
    { name: 'P2. The parent ticks it: a doctor first, and the booking waits',
      lines: [['lowerlegL'], ['lowerlegR']],
      answers: { age: 'u18', onset: 'gradual', duration: 'o3m' },
      patterns: ['pc-child-muscle'],
      expect: { route: 'urgent', noBooking: true } },
    { name: 'P3. The same drawing by an adult: the child screen is not asked',
      lines: [['lowerlegL'], ['lowerlegR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'o3m' },
      expect: { noPattern: ['pc-child-muscle'], route: 'results' } },
    { name: '1. Shin splints in both shins',
      lines: [['lowerlegL'], ['lowerlegR']],
      answers: { age: '18-29', onset: 'running', duration: 'd6w', V1: ['medial'], V2: ['warmup'], V3: ['long'] },
      expect: { top: 'leg/mtss', not: ['leg/cecs'], route: 'results' } },
    { name: '2. One sore spot on the shin (stress fracture)',
      lines: [['lowerlegR']],
      answers: { age: '18-29', onset: 'running', duration: 'd6w', V1: ['anterior'], V2: ['hop'], V3: ['spot'] },
      flags: ['lgf-stress'],
      expect: { route: 'urgent' } },
    { name: '3. Exertional compartment syndrome in both legs',
      lines: [['lowerlegL'], ['lowerlegR']],
      answers: { age: '18-29', onset: 'exercise', duration: 'o3m', V2: ['builds'], V4: ['tight', 'numb', 'eases'] },
      expect: { top: 'leg/cecs', notTop: ['leg/mtss'], route: 'results' } },
    { name: '4. Sudden inner calf pain at tennis (injury screen)',
      lines: [['lowerlegL']],
      answers: { age: '30-49', onset: 'pushoff', duration: 'd2w', I1: 'calf', I2: 'no', I3: 'no', I4: 'no', I5: 'yes' },
      expect: { route: 'urgent' } },
    { name: '5. Calf cramp on walking (claudication)',
      lines: [['lowerlegL'], ['lowerlegR']],
      answers: { age: 'o64', onset: 'walking', duration: 'o3m', V5: ['cramp'], V8: ['skin'] },
      flags: ['lgf-claudication'],
      expect: { route: 'urgent' } },
    // A line from the low back down to the foot is read as referral from the back.
    { name: '6. Low back look-alike: back down the outer shin to the foot',
      lines: [['lowerback', 'thighR', 'kneeR', 'lowerlegR', 'ankleR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', painQuality: ['burning'],
        V1: ['lateral'], V6: ['outer'], V7: ['back'] },
      expect: { notRegion: ['leg'], areas: ['lowback'], route: 'results' } },
  ],  ankle: [
    // Neurodynamics, second batch (6 Oct 2026): nerve conditions from the
    // Butler NOI workbook and the Shacklock NDS manual.
    { name: 'N1. Numb web space after tight ski boots, front of the ankle: the foot nerve card',
      lines: [['ankleR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', A1: ['front'], A7: ['web'], A2: ['never'], A3: ['squat'] },
      expect: { asked: ['A7'], special: 'footNerve', route: 'results' } },
    { name: 'CRPS 1. Foot and ankle cold, blotchy and sensitive 6 weeks after a sprain',
      lines: [['ankleR']],
      answers: { age: '30-49', onset: 'twist', duration: 'd3m', I1: 'no', A9: ['trigger', 'outofprop', 'colour', 'swelling', 'touch'] },
      expect: { top: 'ankle/crps', route: 'results' } },
    { name: 'CRPS 2. A fresh sprain (under 2 weeks): the CRPS question is not asked',
      lines: [['ankleR']],
      answers: { age: '18-29', onset: 'twist', duration: 'd2w', I1: 'inversion', I2: 'no', I3: 'no', I9: 'no', I4: 'no', I8: 'no', I5: 'no', I11: 'no', I6: 'no', I7: 'no', A1: ['outer'] },
      expect: { notAsked: ['A9'], not: ['ankle/crps'], route: 'results' } },
    { name: '1. Lateral ankle sprain',
      lines: [['ankleR']],
      answers: { age: '18-29', onset: 'twist', duration: 'd2w', I1: 'inversion', I2: 'no', I3: 'no', I9: 'no', I4: 'no', I8: 'no', I5: 'no', I11: 'no', I6: 'no', I7: 'no',
        A1: ['outer'], A2: ['recent'], A8: ['injury'] },
      expect: { top: 'ankle/atfl', not: ['ankle/highankle'], route: 'results' } },
    { name: '2. Could not take four steps after rolling it (injury screen)',
      lines: [['ankleL']],
      answers: { age: '30-49', onset: 'twist', duration: 'd2w', I1: 'inversion', I2: 'no', I3: 'no', I9: 'no', I4: 'yes' },
      expect: { route: 'urgent' } },
    { name: '2b. Walking, but the tip of the outer ankle bone is sharply tender (Ottawa ankle rules)',
      lines: [['ankleR']],
      answers: { age: '18-29', onset: 'twist', duration: 'd2w', I1: 'inversion', I2: 'no', I3: 'no', I9: 'no', I4: 'no', I8: 'yes' },
      expect: { route: 'urgent', notAsked: ['ankle:I6'] } },
    { name: '3. Kick to the back of the ankle (Achilles rupture, injury screen)',
      lines: [['ankleR', 'lowerlegR']],
      answers: { age: '30-49', onset: 'landing', duration: 'd2w', I1: 'kick', I2: 'no', I3: 'no', I9: 'no', I4: 'no', I8: 'no', I5: 'yes' },
      expect: { route: 'urgent' } },
    { name: '4. Tibialis posterior tendon dysfunction',
      lines: [['ankleL']],
      answers: { age: '50-64', onset: 'gradual', duration: 'o3m', A1: ['inner'], A5: ['flat', 'tiptoe'] },
      expect: { top: 'ankle/tibpost', notTop: ['ankle/tarsaltunnel'], route: 'results' } },
    // More than 6 weeks ago, so the injury screen's gate is "No".
    { name: '5. Chronic ankle instability',
      lines: [['ankleR']],
      answers: { age: '18-29', onset: 'twist', duration: 'o3m', I1: 'no', A1: ['outer'], A2: ['recurrent'], A3: ['uneven'], A4: ['unstable'] },
      expect: { top: 'ankle/cai', notTop: ['ankle/atfl'], route: 'results' } },
    { name: '6. Hot, red, swollen foot with diabetes (Charcot)',
      lines: [['ankleR']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd6w', A8: ['hot'] },
      flags: ['af-charcot'],
      expect: { route: 'urgent' } },
    // 6 Oct 2026: ankle and foot cross-check (all 57 approved by Chandra).
    { name: "7. A child with back-of-heel pain: Sever's, not the adult Achilles card (S4)",
      lines: [['ankleR']],
      answers: { age: 'u18', onset: 'running', duration: 'd6w', I1: 'no', A1: ['heel'], A3: ['running'] },
      expect: { top: 'ankle/severs', not: ['ankle/insertional'], route: 'results' } },
    { name: '8. Outward twist, the outer leg bone tender below the knee (Maisonneuve, S3)',
      lines: [['ankleR']],
      answers: { age: '18-29', onset: 'twistout', duration: 'd2w', I1: 'eversion', I2: 'no', I3: 'no', I9: 'no', I4: 'no', I8: 'no', I5: 'no', I10: 'yes' },
      expect: { route: 'urgent' } },
    { name: '9. Rolled it, with diabetes or numb feet: X-ray whatever the Ottawa answers (S1)',
      lines: [['ankleL']],
      answers: { age: '50-64', onset: 'twist', duration: 'd2w', I1: 'inversion', I2: 'no', I3: 'no', I9: 'yes' },
      expect: { route: 'urgent' } },
    { name: '10. Landed badly, cannot rise onto the toes (Achilles rupture asked after landing, S2)',
      lines: [['ankleR']],
      answers: { age: '30-49', onset: 'landing', duration: 'd2w', I1: 'landing', I2: 'no', I3: 'no', I9: 'no', I4: 'no', I8: 'no', I5: 'yes' },
      expect: { route: 'urgent' } },
    { name: '11. Pain behind the outer ankle bone, pushing off (peroneal tendons, N1)',
      lines: [['ankleR']],
      answers: { age: '30-49', onset: 'running', duration: 'd6w', I1: 'no', A1: ['outerback'], A3: ['uneven'], A10: ['pushoff', 'snap'] },
      expect: { top: 'ankle/peroneal', route: 'results' } },
    { name: '12. Ache in the hollow in front of the outer ankle months after sprains (sinus tarsi, N4)',
      lines: [['ankleR']],
      answers: { age: '30-49', onset: 'twist', duration: 'o3m', I1: 'no', A1: ['outer'], A2: ['once'], A3: ['uneven'], A10: ['sinus'] },
      expect: { top: 'ankle/sinustarsi', route: 'results' } },
    { name: '13. Deep back-of-ankle pinch pointing the foot (posterior impingement, N5)',
      lines: [['ankleR']],
      answers: { age: '18-29', onset: 'running', duration: 'd6w', I1: 'no', A1: ['heel'], A3: ['point'], A6: ['none'] },
      expect: { top: 'ankle/posteriorimp', not: ['ankle/insertional'], route: 'results' } },
    { name: '14. After surgery for a broken ankle (fracture rehabilitation, N2)',
      lines: [['ankleL']],
      answers: { age: '50-64', onset: 'surgery', duration: 'd3m', I1: 'no', A8: ['activity'] },
      expect: { top: 'ankle/fracture', route: 'results' } },
    { name: '15. Foot planted and twisted outwards, pain above the ankle (high ankle sprain, C1)',
      lines: [['ankleR']],
      answers: { age: '18-29', onset: 'twistout', duration: 'd2w', I1: 'eversion', I2: 'no', I3: 'no', I9: 'no', I4: 'no', I8: 'no', I5: 'no', I10: 'no', I11: 'no', I6: 'no', I7: 'no', A1: ['high'] },
      expect: { top: 'ankle/highankle', route: 'results' } },
  ],  foot: [
    // Neurodynamics, second batch (6 Oct 2026): nerve conditions from the
    // Butler NOI workbook and the Shacklock NDS manual.
    { name: 'N1. Runner, inner heel burning that builds through the day, not first-step pain: heel nerve (Baxter)',
      lines: [['footR']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd3m', B1: ['heel'], B2: ['heelday', 'burning'], B5: ['standing', 'running'] },
      expect: { top: 'foot/baxter', notTop: ['foot/pf'], route: 'results' } },
    { name: 'N2. Classic first-step heel pain still reads as plantar fasciitis with the new heel answer in place',
      lines: [['footR']],
      answers: { age: '50-64', onset: 'gradual', duration: 'd3m', B1: ['heel'], B2: ['firststep'], B5: ['standing', 'barefoot'] },
      expect: { top: 'foot/pf', notTop: ['foot/baxter'], route: 'results' } },
    { name: 'N3. Aching on top of the foot, numb between the big and second toes, tight laces: deep fibular nerve',
      lines: [['footL']],
      answers: { age: '30-49', onset: 'gradual', duration: 'd6w', B1: ['arch'], B6: ['web', 'top'], B5: ['laces', 'tightshoes'] },
      expect: { top: 'foot/deepfibular', asked: ['B6'], route: 'results' } },
    { name: 'N4. Tingling along the outer edge of the foot after sprains: sural nerve',
      lines: [['footR']],
      answers: { age: '18-29', onset: 'gradual', duration: 'd6w', B1: ['outer'], B6: ['outeredge'], B5: ['running'] },
      expect: { top: 'foot/sural', asked: ['B6'], route: 'results' } },
    { name: '1. Plantar heel pain',
      lines: [['footR']],
      answers: { age: '30-49', onset: 'load', duration: 'd3m', B1: ['heel'], B2: ['firststep'] },
      expect: { top: 'foot/pf', route: 'results' } },
    { name: "2. Morton's neuroma",
      lines: [['footL']],
      answers: { age: '50-64', onset: 'gradual', duration: 'o3m', painQuality: ['burning'],
        B1: ['ball'], B3: ['neuroma'], B5: ['tightshoes'] },
      expect: { top: 'foot/neuroma', notRegion: ['lowback'], route: 'results' } },
    { name: '3. Pain on one metatarsal (stress fracture)',
      lines: [['footR']],
      answers: { age: '18-29', onset: 'load', duration: 'd6w', B1: ['ball'], B3: ['bone'] },
      flags: ['ft-stress'],
      expect: { route: 'urgent' } },
    { name: '4. Sudden hot big toe (gout)',
      lines: [['footR']],
      answers: { age: '50-64', onset: 'sudden', duration: 'd2w', B1: ['bigtoe'], B4: ['hot'], B8: ['gout'] },
      flags: ['ft-gout'],
      expect: { route: 'urgent' } },
    { name: '5. Midfoot pain after the foot was bent under (Lisfranc, injury screen)',
      lines: [['footL']],
      answers: { age: '30-49', onset: 'injury', duration: 'd2w', I1: 'landing', I2: 'no', I9: 'no', I4: 'no', I8: 'no', I5: 'yes' },
      expect: { route: 'urgent' } },
    { name: '5b. Rolled the foot, the bony knob on its outer edge is tender (Ottawa foot rule)',
      lines: [['footR']],
      answers: { age: '30-49', onset: 'injury', duration: 'd2w', I1: 'twist', I2: 'no', I9: 'no', I4: 'no', I8: 'yes' },
      expect: { route: 'urgent' } },
    { name: '6. Burning in both feet (neuropathy)',
      lines: [['footL'], ['footR']],
      answers: { age: 'o64', onset: 'gradual', duration: 'o3m', B6: ['both'], B8: ['diabetes'] },
      flags: ['ft-neuropathy'],
      expect: { route: 'urgent' } },
    // Drawn under the heel: the drawing answers "Where is the pain?".
    { name: '7. Drawn under the heel: plantar heel pain (location from the drawing)',
      lines: [['footR']], points: { footR: spot(-0.49, 0.09, -0.04) },
      answers: { age: '30-49', onset: 'load', duration: 'd3m', B2: ['firststep'] },
      expect: { top: 'foot/pf', notAsked: ['B1'], route: 'results' } },
    // 6 Oct 2026: ankle and foot cross-check (all 57 approved by Chandra).
    { name: "8. A child whose heel hurts when squeezed: Sever's (S5)",
      lines: [['footR']],
      answers: { age: 'u18', onset: 'load', duration: 'd6w', B1: ['heel'], B2: ['squeeze', 'child'], B5: ['running'] },
      expect: { top: 'foot/severs', route: 'results' } },
    { name: "9. Burning between two toes and a click: Morton's neuroma (B3 asked for 'between the toes', C2)",
      lines: [['footL']],
      answers: { age: '50-64', onset: 'gradual', duration: 'o3m', B1: ['toes'], B3: ['neuroma', 'click'], B5: ['tightshoes'] },
      expect: { top: 'foot/neuroma', route: 'results' } },
    { name: '10. Outer edge of the midfoot, pushing off (cuboid syndrome, N3)',
      lines: [['footR']],
      answers: { age: '18-29', onset: 'load', duration: 'd6w', B1: ['outer'], B5: ['running', 'tiptoe'] },
      expect: { top: 'foot/cuboid', route: 'results' } },
    { name: '11. Ache on the top of the midfoot in an older adult (midfoot arthritis, C5)',
      lines: [['footR']],
      answers: { age: 'o64', onset: 'gradual', duration: 'o3m', B1: ['arch'], B5: ['standing'] },
      expect: { top: 'foot/midfootoa', route: 'results' } },
    { name: '12. The arch underneath, cannot rise on the toes well (tibialis posterior from the foot, W8)',
      lines: [['footL']],
      answers: { age: '50-64', onset: 'gradual', duration: 'o3m', B1: ['instep'], B5: ['tiptoe', 'standing'] },
      expect: { top: 'foot/tibpost', route: 'results' } },
  ],
}

/* Which injury screen a region's test patients answer with plain I1… keys. */
const SCREEN_OF = { neck: 'neck', ctj: 'neck', head: 'head', shoulder: 'shoulder', arm: 'arm', elbow: 'elbow', forearm: 'forearm', wrist: 'wrist', hand: 'hand', hip: 'hip', thigh: 'thigh', knee: 'knee', leg: 'leg', ankle: 'ankle', foot: 'foot' }

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
    // Another drawn area's "how did it start?": a real patient answers it too.
    // When it offers the same answer, use it (5 Oct 2026; left blank, it let a
    // card that needs a particular start, such as wry neck, look possible).
    else if (q.id.startsWith('onset@') && own.onset && q.options.some((o) => o.id === own.onset)) out[q.id] = own.onset
  }
  return out
}

function run(rk, t) {
  const zones = zonesOf(t.lines)
  // Optional: where on each area the marks sit, and each area's share of the ink.
  for (const z of zones) {
    if (t.points && t.points[z.id]) z.at = summarizeZone(z.type, t.points[z.id])
    if (t.ink && t.ink[z.id] !== undefined) z.ink = t.ink[z.id]
  }
  const referral = detectReferral(t.lines)
  const flowZ = flowZones(zones, referral)
  // Path 4 (6 Oct 2026): `path: 'widespread'` is the "pain in many places"
  // answer on the Draw page: the route's own questions and red flags, no
  // injury screen, and the drawing answers "how many areas" (WS1).
  const wide = t.path === 'widespread'
  const focus = needsAreaChoice(flowZ, null) ? (t.focus || rk) : null
  const keys = wide ? ['widespread'] : questionRegions(flowZ, focus)
  // On it, every drawn area's emergency questions are still asked (6 Oct 2026).
  const wideFlags = () => widespreadFlags(regionRedFlags(flowZ, zones))
  const seen = { asked: [], flagsOffered: (wide ? wideFlags() : regionRedFlags(flowZ, zones))
    .filter((f) => !(spondyDiagnosed(t.cautions || [], t.answers || {}) && f.id === 'rf-spondy'))
    .map((f) => f.id), keys }

  /* The pattern screens (../src/data/patternChecks.js): the questions the
     DRAWING raises, asked on the doctor page, and the ones the ANSWERS raise,
     asked on the final check. This mirrors the two blocks in
     PainAssessment.jsx (screening.pattern and finalChecks) closely enough to
     test which screens a patient is offered: the area's own questions replace
     the generic ones, known diabetes removes the nerve screens, and the same
     caps apply (two drawing-led ones beyond emergencies; six answer-led, plus
     two hormone screens). */
  const patternsFor = () => {
    const a = t.answers || {}
    const own = (g) => regionRedFlags(flowZ, zones).some((f) => [].concat(f.group || []).includes(g))
    const dmKnown = a.dm === 'yes'
    const early = patternChecks(zones, {}, 12)
      .filter((f) => !(own('stroke') && f.id === 'pc-stroke') && !((dmKnown || own('cardiac')) && f.id === 'pc-cardiac') &&
        !(own('clot') && f.id === 'pc-dvt') && !(own('organ') && f.id === 'pc-visceral') &&
        !(own('neuropathy') && f.id === 'pc-polyneuropathy') && !(dmKnown && isNerveFlag(f)))
    const rest = early.filter((f) => f.tier !== 'emergency')
    const shownEarly = [...early.filter((f) => f.tier === 'emergency'), ...rest.slice(0, 2)]
    const deferred = new Set(rest.slice(2).map((f) => f.id))
    // As in the app: EVERY screen the drawing raised is taken out of the
    // answer-led list, including the ones the area's own questions replaced —
    // only the ones its two-question limit deferred come back here.
    const drawingLed = new Set(patternChecks(zones, {}, 12).map((f) => f.id))
    const later = patternChecks(zones, a, 30).filter((f) => !drawingLed.has(f.id) || deferred.has(f.id))
    const laterRest = later.filter((f) => f.tier !== 'emergency')
    const HORMONE = ['pc-calcium', 'pc-thyroid', 'pc-hypothyroid', 'pc-acromegaly', 'pc-lowhormone', 'pc-hormone']
    const shownLater = [...later.filter((f) => f.tier === 'emergency'), ...laterRest.slice(0, 6),
      ...laterRest.slice(6).filter((f) => HORMONE.includes(f.id)).slice(0, 2)]
      .filter((f) => !(dmKnown && isNerveFlag(f)))
    return [...shownEarly, ...shownLater]
  }
  const patterns = patternsFor()
  seen.patternsOffered = patterns.map((f) => f.id)

  // A test may tick a pattern screen; its tier routes, as a red flag's does.
  for (const id of t.patterns || []) {
    const f = patterns.find((x) => x.id === id)
    if (!f) return { ...seen, error: `pattern screen ${id} is not offered` }
    if (f.tier === 'emergency') return { ...seen, route: 'emergency' }
    if (f.tier === 'urgent') return { ...seen, route: 'urgent', noBooking: !!f.noBooking }
  }

  // Safety check: the ticked flags must be on the screen; their tier routes.
  // A flag shared with a neighbouring area (same `group`) is shown once, in
  // the wording of the area that was drawn, so that one counts as ticked.
  // A ticked caution can remove a safety question: someone whose pars injury
  // has already been imaged is not sent back for the same X-ray
  // (PainAssessment.jsx does the same filtering).
  const cautions = t.cautions || []
  const offered = (wide ? wideFlags() : regionRedFlags(flowZ, zones))
    .filter((f) => !(spondyDiagnosed(cautions, t.answers || {}) && f.id === 'rf-spondy'))
  const allFlags = Object.values(REGIONS).flatMap((r) => r.redFlags)
  const onScreen = (id) => {
    const f = allFlags.find((x) => x.id === id)
    // A merged flag lists several groups; it stands in for each of them.
    const gs = [].concat((f && f.group) || [])
    return offered.find((o) => o.id === id || [].concat(o.group || []).some((g) => gs.includes(g)))
  }
  for (const id of t.flags || []) if (!onScreen(id)) return { ...seen, error: `flag ${id} is not on the safety screen` }
  const tiers = (t.flags || []).map((id) => onScreen(id).tier)
  if (tiers.includes('emergency')) return { ...seen, route: 'emergency' }
  if (tiers.includes('urgent')) return { ...seen, route: 'urgent' }

  const all = toScreen(keys, rk, t.answers)
  // Injury screens: a test's plain I1… answers belong to its own region's
  // screen; any other screen's gate is answered "No" (not injured there).
  // The site asks the age ("A little about you") before the injury screens, so
  // the patient's age is passed, as PainAssessment.jsx does (6 Oct 2026: the
  // child-only injury questions depend on it). The shared
  // arm question (limb:I1) is answered as the region's own I1 would be; a
  // follow-up from another area's screen gets the answer that does not route.
  if (!wide) {
    const own = SCREEN_OF[rk]
    const ia = {}
    let s
    while ((s = injuryFlow(flowZ, ia, t.answers.age)).next) {
      seen.asked.push(s.next)
      const [sid, qid] = s.next.split(':')
      ia[s.next] = sid === own ? t.answers[qid] : undefined
      if (sid === 'limb') {
        const q = injuryQuestion(s.next, flowZ).q
        ia[s.next] = qid === 'I2' ? 'recent'
          : (q.options.find((o) => limbAs(o.id, own) === t.answers.I1) || { id: 'no' }).id
      }
      if (ia[s.next] === undefined && qid === 'I1') ia[s.next] = 'no'
      if (ia[s.next] === undefined && sid !== own && sid !== 'neck') {
        const q = injuryQuestion(s.next, flowZ).q
        ia[s.next] = (q.options.find((o) => !o.route) || {}).id
      }
      if (ia[s.next] === undefined && s.next === 'neck:I3') ia[s.next] = ageFrom(t.answers.age) >= 65 ? 'yes' : ageFrom(t.answers.age) < 18 ? 'child' : 'no'
      if (ia[s.next] === undefined) return { ...seen, error: `injury question ${s.next} has no answer in the test` }
    }
    if (s.route === 'emergency' || s.route === 'urgent') return { ...seen, route: s.route }
  }

  // Questions: opening screen, then whatever the flow picks.
  const { context } = buildScreens(keys)
  const ans = wide ? { WS1: ['many'] } : { ...drawnAnswers(referral), ...locationAnswers(flowZ) }
  const minorIds = minorZoneIds(flowZ)
  const minor = new Set(keys.filter((k) => {
    const own = flowZ.filter((z) => !z.implied && ZONE_TO_REGION[z.type] === k)
    return own.length && own.every((z) => minorIds.has(z.id))
  }))
  for (const q of context) if (all[q.id] !== undefined) ans[q.id] = all[q.id]
  // "A little about you": pregnant or given birth in the last 12 months.
  if (all.preg !== undefined) ans.preg = all.preg
  let id
  while ((id = nextQuestion(keys, ans, seen.asked.filter((x) => !x.includes(':')), MAX_SCORED_QUESTIONS,
    { draw: zones.map((z) => z.type), all, minor }))) {
    seen.asked.push(id)
    // A twin question (same `same` key) takes the answer written for its twin.
    const own = twinIds(id).find((x) => all[x] !== undefined)
    if (own !== undefined) ans[id] = all[own]
  }
  const shown = rankAcross(keys, ans, MAX_HYPOTHESES, pregnancyBonus(all)).map((x) => `${x.rk}/${x.c.id}`)
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
    // A pattern two areas share (neck and head "Neck-related headache") may come from either.
    if (e.top && ![].concat(e.top).includes((r.shown || [])[0])) why.push(`top ${(r.shown || [])[0] || 'nothing'}, expected ${[].concat(e.top).join(' or ')}`)
    for (const c of e.not || []) if ((r.shown || []).includes(c)) why.push(`shows ${c}`)
    for (const c of e.shows || []) if (!(r.shown || []).includes(c)) why.push(`does not show ${c}`)
    for (const f of e.noFlag || []) if ((r.flagsOffered || []).includes(f)) why.push(`still asks ${f}`)
    for (const f of e.flagOffered || []) if (!(r.flagsOffered || []).includes(f)) why.push(`does not ask ${f}`)
    for (const f of e.pattern || []) if (!(r.patternsOffered || []).includes(f)) why.push(`does not ask ${f}`)
    for (const f of e.noPattern || []) if ((r.patternsOffered || []).includes(f)) why.push(`still asks ${f}`)
    if (e.noBooking !== undefined && !!r.noBooking !== e.noBooking) why.push(`noBooking ${!!r.noBooking}, expected ${e.noBooking}`)
    for (const c of e.notTop || []) if ((r.shown || [])[0] === c) why.push(`${c} is on top`)
    for (const g of e.notRegion || []) if ((r.shown || []).some((c) => c.startsWith(g + '/'))) why.push(`shows a ${g} condition`)
    for (const q of e.notAsked || []) if (r.asked.includes(q)) why.push(`asked ${q}`)
    for (const q of e.asked || []) if (!r.asked.includes(q)) why.push(`${q} was not asked`)
    for (const k of e.areas || []) if (!(r.keys || []).includes(k)) why.push(`${k} was not asked`)
    if (e.firstAsked) { const first = (r.asked || []).find((x) => !x.includes(':')); if (!first || !first.startsWith(e.firstAsked)) why.push(`first question ${first}, expected one of ${e.firstAsked}…`) }
    if (e.special && ![].concat(e.special).some((c) => (r.specials || []).includes(c))) why.push(`no "${[].concat(e.special).join('" or "')}" card`)
    if (why.length) failed++
    console.log(`${why.length ? 'FAIL' : 'PASS'}  ${t.name}`)
    console.log(`      areas ${r.keys.join(' + ')} · asked ${r.asked.join(' ') || '—'} · ${r.route}` +
      (r.shown ? ` · shown ${r.shown.join(', ') || 'nothing'}` : '') +
      (r.specials && r.specials.length ? ` · card ${r.specials.join(', ')}` : '') +
      (r.patternsOffered && r.patternsOffered.length ? ` · screens ${r.patternsOffered.join(' ')}` : ''))
    for (const w of why) console.log(`      ✗ ${w}`)
  }
}
console.log(`\n${total - failed}/${total} test patients passed`)
process.exit(failed ? 1 : 0)
