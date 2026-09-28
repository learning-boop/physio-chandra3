---
region: neck
id: radic
name: Pinched nerve in the neck (cervical radiculopathy)
clin: Cervical radiculopathy (cervical radicular pain with or without nerve root deficit)
# From "Cervical Radiculopathy.docx" (Conditions/Neck and headache), v1.1,
# approved 28 Sep 2026 (AI review 28 Sep 2026). Replaces the earlier text and
# scores moved from src/data/symptomGuideExtra.js on 26 Sep 2026.
# reviewed: your name and the date, once every line is checked (e.g. Chandra Matla, 2026-09-28)
reviewed:
# Pointers follow the document's scored question set (section 4); max 16:
#   Q1 how far down: past the elbow 3, upper arm only 2 (N2, one of the two)
#   Q2 arm worse 3, about the same 2 (N2, one of the two)
#   Q3 pins and needles in one part 3, whole hand 1 (N2, one of the two)
#   Q4 looking up / turning or tilting towards the sore side: clearly 3,
#      sometimes 1 (N3)
#   Q5 hand on head eases it 2 (N2)
#   Q6 burning, shooting, electric or in a line 2 (N2)
#   Q7 moving the shoulder hurts more -2 (N8)
#   Q8 both hands, clumsy hands, walking or balance: "do not score, route to
#      assessment": -16, so the spinal cord pattern (neck-dcm) and its
#      see-your-doctor note stand alone (N9)
#   Q9 which fingers: not scored, level tag only (N12, weight 0 so it is asked)
# Added (Claude, for Chandra to confirm): arm or hand weakness 1 (section A9:
# "numbness or weakness with little pain: keep radiculopathy"). The ceiling
# stays 16 or 17 either way, and the site shows the condition from 7 points
# (its 40% rule), inside the document's "possible" band (6-10); "likely" is 11+.
# The earlier age, onset, turning, looking-up and moving-worse points are gone:
# the document does not score them.
pointers:
  "Pain goes down the arm past the elbow": 3
  "Pain goes into the upper arm, but not past the elbow": 2
  "The arm pain is worse than the neck pain": 3
  "The arm and neck pain are about as bad as each other": 2
  "Pins and needles or numbness in one part of the arm or hand": 3
  "Pins and needles or numbness in the whole hand": 1
  "The arm pain is burning, shooting or electric": 2
  "Resting my hand on top of my head eases the arm pain": 2
  "Weakness in that arm or hand": 1
  "Yes, clearly: it goes down the arm": 3
  "Sometimes": 1
  "Moving my shoulder and arm": -2
  "Numbness or pins and needles in both hands": -16
  "My hands have become clumsy": -16
  "My walking or balance has changed": -16
  "Thumb and index finger": 0
  "Middle finger": 0
  "Ring and little fingers": 0
  "Not sure, or they vary": 0
---

## blurb
A nerve in the neck has become irritated or squeezed where it leaves the spine, most often by a disc bulge or by age-related narrowing of the small opening the nerve passes through. Because that nerve travels down into the arm, you may feel pain, pins and needles, numbness or weakness in the arm and hand, sometimes more than in the neck itself. This is common, the nerve is usually sensitive rather than permanently damaged, and most people recover without needing surgery. Staying gently active, finding positions of ease and following a guided plan can help the nerve settle.

## noticed
- Sharp, shooting, burning or "electric" pain down one arm, often worse than the neck
- A deep ache in or beside the shoulder blade, often before the arm pain starts
- Pins and needles or numbness in part of the hand, or the arm feeling weak or heavy
- Worse looking up, turning or tilting the head towards the painful side, or after a long spell looking down at a screen or driving
- Coughing or sneezing, carrying a bag on that side, or sleeping on it can bring it on
- Resting the hand on top of the head, or supporting the arm, often eases it

## homeCare
- Rest your hand on top of your head, or support your arm on a pillow, when the arm pain flares
- Change position often; avoid long spells of looking up or looking down at a screen
- Keep moving gently within comfort; complete rest or a neck collar is rarely needed
- Sleep with a pillow that keeps your neck level, and avoid lying on the painful side if it makes the arm worse

## seePhysioIf
- Arm pain, pins and needles or weakness are affecting your sleep, work or daily tasks
- It has not started to ease after a week or two
- You would like a plan: many people notice clear improvement within the first few months, often sooner, though recovery time varies from person to person
- If you notice any of the warning signs (clumsy hands, both arms, unsteady walking, bladder or bowel changes, weakness getting worse quickly), seek medical care first

## clinicNotes
- Record: body chart (arm vs neck dominance, paraesthesia distribution), 24-hour behaviour, irritability, neuropathic descriptors; NPRS, NDI, PSFS; DN4 or painDETECT if the neuropathic component is unclear.
- Wainner cluster: ULNT1 (median) +, Spurling A +, distraction +, ipsilateral rotation under 60 degrees. 3 of 4 +LR 6.1; 4 of 4 +LR 30.3. A negative ULNT1 helps rule out. Shoulder abduction relief sign; neck distraction (Thoomes 2018: Spurling and distraction most useful to rule in, combined with history).
- Neuro exam: dermatomes (light touch, pinprick), myotomes C5-T1, reflexes biceps (C5/6), brachioradialis (C6), triceps (C7). Neurodynamics ULNT1-3 and nerve trunk palpation.
- Level from the finger question (N12): thumb and index C6, middle C7, ring and little C8 (dermatomes overlap; tingling is more level-specific than pain). C7 most often, then C6. Maps: content/reference/cervical-radiculopathy.md.
- Root or peripheral nerve: thumb/index with outer forearm and neck provocation = C6, not median (carpal tunnel: night tingling eased by shaking, thenar palm spared, forearm normal). Ring/little with inner forearm = C8, not ulnar (cubital tunnel: inner forearm normal, ring finger split, worse with the elbow bent). Both can coexist (double crush): screen and treat both.
- UMN screen: Hoffmann, Babinski, clonus, inverted supinator, gait/tandem (Cook cluster 3 of 5 = strong rule-in). Arterial screen per the IFOMPT Cervical Framework before manual therapy.
- Arm pain with front-of-chest pain: C7 can refer to the chest, but exclude a cardiac cause first.
- Refer for medical review or imaging: progressive motor deficit, UMN signs, red flags, or no improvement after 6-8 weeks of well-delivered care.
- Acute: exercise with mobilising and stabilising elements (C); low-level laser (C); possible short-term collar use (C).
- Subacute: the CPG flow chart gives no stage-specific recommendation; choose from the acute and chronic options by irritability.
- Chronic: combined exercise (stretching and strength) plus cervical and thoracic manual therapy (B); education to encourage occupational and exercise activity (B); intermittent traction (B); neural mobilisation (Basson 2017).
- Sources: JOSPT Neck Pain CPG 2017 (Blanpied et al.); Wainner 2003; Thoomes 2018; Wong 2014; Iyer and Kim 2016; Thoomes 2013; Fritz 2014; Basson 2017; Cook 2010; Rushton 2023. Record NDI (or PROMIS) and NPRS at the first visit.
