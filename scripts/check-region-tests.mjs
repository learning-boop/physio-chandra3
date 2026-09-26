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
import { injuryFlow, injuryQuestion, limbAnswerFor as limbAs, ageFrom } from '../src/data/injuryScreen.js'
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
      expect: { route: 'emergency', notAsked: ['neck:I6', 'neck:I7'] } },
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
      expect: { notRegion: ['jaw'], special: 'neckSource', route: 'results' } },
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
    { name: '4. Migraine look-alike',
      lines: [['head']],
      answers: { age: '30-49', onset: 'years', duration: 'o3m', D1: ['switch'], D2: ['throb', 'sick', 'lightnoise'],
        D4: ['h4d3'], D5: ['d1to14'], D6: ['upto9'] },
      expect: { notRegion: ['head'], special: 'migraine', route: 'results' } },
    { name: '5. Frequent headaches and painkillers',
      lines: [['head']],
      answers: { age: '30-49', onset: 'years', duration: 'o3m', D1: ['band'], D5: ['d15'], D6: ['d15plus'] },
      expect: { top: 'head/tth', special: 'medOveruse', route: 'results' } },
  ],
  shoulder: [
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
      flags: ['srf-gallbladder'],
      expect: { route: 'urgent' } },
    { name: '6. Cannot lift the arm after a fall (injury screen)',
      lines: [['upperarmL']],
      answers: { age: 'o64', onset: 'fall', duration: 'd2w', I1: 'fall', I2: 'no', I3: 'no', I4: 'yes' },
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
  ],  hand: [
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
  ],  hip: [
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
  ],  thigh: [
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
      answers: { age: '18-29', onset: 'twist', duration: 'd2w', I1: 'twist', I2: 'no', I3: 'no', I4: 'no', I5: 'yes' },
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
  ],
}

/* Which injury screen a region's test patients answer with plain I1… keys. */
const SCREEN_OF = { neck: 'neck', ctj: 'neck', shoulder: 'shoulder', arm: 'arm', elbow: 'elbow', forearm: 'forearm', wrist: 'wrist', hand: 'hand', hip: 'hip', thigh: 'thigh', knee: 'knee' }

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
  // Injury screens: a test's plain I1… answers belong to its own region's
  // screen; any other screen's gate is answered "No" (not injured there).
  // They come before the age question on the site, so no age is passed; the
  // neck's "65 or older?" is answered from the patient's age. The shared
  // arm question (limb:I1) is answered as the region's own I1 would be; a
  // follow-up from another area's screen gets the answer that does not route.
  {
    const own = SCREEN_OF[rk]
    const ia = {}
    let s
    while ((s = injuryFlow(flowZ, ia, undefined)).next) {
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
      if (ia[s.next] === undefined && s.next === 'neck:I3') ia[s.next] = ageFrom(t.answers.age) >= 65 ? 'yes' : 'no'
      if (ia[s.next] === undefined) return { ...seen, error: `injury question ${s.next} has no answer in the test` }
    }
    if (s.route === 'emergency' || s.route === 'urgent') return { ...seen, route: s.route }
  }

  // Questions: opening screen, then whatever the flow picks.
  const { context } = buildScreens(keys)
  const ans = { ...drawnAnswers(referral) }
  for (const q of context) if (all[q.id] !== undefined) ans[q.id] = all[q.id]
  let id
  while ((id = nextQuestion(keys, ans, seen.asked.filter((x) => !x.includes(':')), MAX_SCORED_QUESTIONS,
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
    // A pattern two areas share (neck and head "Neck-related headache") may come from either.
    if (e.top && ![].concat(e.top).includes((r.shown || [])[0])) why.push(`top ${(r.shown || [])[0] || 'nothing'}, expected ${[].concat(e.top).join(' or ')}`)
    for (const c of e.not || []) if ((r.shown || []).includes(c)) why.push(`shows ${c}`)
    for (const c of e.notTop || []) if ((r.shown || [])[0] === c) why.push(`${c} is on top`)
    for (const g of e.notRegion || []) if ((r.shown || []).some((c) => c.startsWith(g + '/'))) why.push(`shows a ${g} condition`)
    for (const q of e.notAsked || []) if (r.asked.includes(q)) why.push(`asked ${q}`)
    for (const k of e.areas || []) if (!(r.keys || []).includes(k)) why.push(`${k} was not asked`)
    if (e.special && ![].concat(e.special).some((c) => (r.specials || []).includes(c))) why.push(`no "${[].concat(e.special).join('" or "')}" card`)
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
