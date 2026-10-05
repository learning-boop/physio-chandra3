---
region: neck
id: radic
name: Pinched nerve in the neck (cervical radiculopathy)
clin: Cervical radiculopathy (cervical radicular pain with or without nerve root deficit)
# From "Cervical Radiculopathy.docx" (Conditions/Neck and headache), v1.1,
# approved 28 Sep 2026 (AI review 28 Sep 2026). Replaces the earlier text and
# scores moved from src/data/symptomGuideExtra.js on 26 Sep 2026.
# 5 Oct 2026: neck cross-check (JOSPT 2017, AIM Theory Manual 2023, Cervical
# Clinic Manual 2026, Chandra's protocols, current search), all items approved by
# Chandra after his 28 Sep sign-off: warning line split (emergency / doctor
# today), Wainner items ULNT1 (N14 stretch) and rotation (N1 one side) +1 each
# (ceiling 19, shown from 8), weakness shows the "book promptly" card, cord signs
# show their own doctor card (N9), the stinger look-alike, clinic notes.
# reviewed: your name and the date, once every line is checked (e.g. Chandra Matla, 2026-09-28)
reviewed: Chandra Matla, 2026-09-28
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
  "Positions that stretch the arm clearly bring them on": 1
  "It is stiff or painful turning to one side": 1
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
- Early on, a position that eases the arm is fine, even if it is not "good posture"; straightening up can wait until the arm settles
- Change position often; avoid long spells of looking up or looking down at a screen
- Keep moving gently within comfort; complete rest or a neck collar is rarely needed
- Sleep with a pillow that keeps your neck level, and avoid lying on the painful side if it makes the arm worse

## seePhysioIf
- Arm pain, pins and needles or weakness are affecting your sleep, work or daily tasks
- It has not started to ease after a week or two
- You would like a plan: many people notice clear improvement within the first few months, often sooner, though recovery time varies from person to person
- Bladder or bowel changes, or new weakness or numbness in both legs: go to an emergency department now
- Clumsy hands, symptoms in both arms, unsteady walking, or weakness getting worse over days: see a doctor today
- A burning or "dead arm" after a tackle or collision that settles within minutes is usually a stretched nerve (a "stinger"); if it happens in both arms, or keeps coming back, see a doctor before returning to sport

## clinicNotes
- Record: body chart (arm vs neck dominance, paraesthesia distribution), 24-hour behaviour, irritability, neuropathic descriptors; NPRS, NDI, PSFS; DN4 or painDETECT if the neuropathic component is unclear.
- Wainner cluster: ULNT1 (median) +, Spurling A +, distraction +, ipsilateral rotation under 60 degrees. 3 of 4 +LR 6.1; 4 of 4 +LR 30.3 (setting-dependent, very low certainty in recent reviews: Cervical Clinic Manual 2026). A negative ULNT1 helps rule out. Shoulder abduction relief sign; neck distraction (Thoomes 2018: Spurling and distraction most useful to rule in, combined with history).
- Neuro exam: dermatomes (light touch, pinprick), myotomes C5-T1, reflexes biceps (C5/6), brachioradialis (C6), triceps (C7). Neurodynamics ULNT1-3 and nerve trunk palpation.
- Level from the finger question (N12): thumb and index C6, middle C7, ring and little C8 (dermatomes overlap; tingling is more level-specific than pain). C7 most often, then C6. Maps: content/reference/cervical-radiculopathy.md.
- Root or peripheral nerve: thumb/index with outer forearm and neck provocation = C6, not median (carpal tunnel: night tingling eased by shaking, thenar palm spared, forearm normal). Ring/little with inner forearm = C8, not ulnar (cubital tunnel: inner forearm normal, ring finger split, worse with the elbow bent). Both can coexist (double crush): screen and treat both.
- UMN screen: Hoffmann, Babinski, clonus, inverted supinator, gait/tandem (Cook cluster 3 of 5 = strong rule-in). Arterial screen per the IFOMPT Cervical Framework before manual therapy.
- Arm pain with front-of-chest pain: C7 can refer to the chest, but exclude a cardiac cause first.
- Refer for medical review or imaging: progressive motor deficit, UMN signs, red flags, or no improvement after 6-8 weeks of well-delivered care (Chandra's radiculopathy protocol: MRI or referral after about 4-6 weeks of therapy with minimal improvement; the CPG gives no time frame).
- Acute: exercise with mobilising and stabilising elements (C); low-level laser (C); possible short-term collar use (C).
- Subacute: the CPG flow chart gives no stage-specific recommendation; choose from the acute and chronic options by irritability.
- Chronic: combined exercise (stretching and strength) plus cervical and thoracic manual therapy (B); education to encourage occupational and exercise activity (B); intermittent traction as part of multimodal care with exercise and manual therapy (B); neural mobilisation (Basson 2017; JOSPT 2025 network meta-analysis of articular and neural mobilisation; Gillot 2025, Clin Rehabil).
- AIM Theory Manual 2023 (pp. 265-277; content/reference/cervical-conditions-manual.md): natural history, most resolve by 6 months (in a 2018 prospective cohort only about 55% felt recovered at 6 and 12 months with conservative care), 50% fully by 6-12 months, 83% with a disc herniation by 24-36 months. Rule in: Rubinstein (history + Spurling + traction relief + Valsalva) or Thoomes (history + Spurling + axial traction relief + arm squeeze); rule out: 4 negative ULTTs (1, 2a, 2b, 3) + negative arm squeeze.
- Prognosis: favourable with physiotherapy (Cleland 2007) if under 54, non-dominant arm, looking down not worse, multimodal care (3 of 4, 85%); poorer with longer duration, higher baseline pain and disability, less rotation to the affected side. MCID NDI 8.5, PSFS 2.2, NPRS 2.2.
- Treatment sequence: open the IVF first (flexion, contralateral rotation and side bend; contralateral lateral glides if no peripheralisation), manual traction to test for centralisation, then intermittent mechanical traction (Fritz 2014; Raney 2009 rule, not validated). Thoracic thrust better than sham short term (Young 2019); cervical thrust only gapping or flexion techniques (AIM; Chandra's protocol Phase 2 lists a rotation thrust: the AIM restriction is followed here). Neural: unload, treat the cervical interface, sliders, then tensioners once conduction signs settle. Early on, keep exercise within comfort: strong end-range or loaded exercise can aggravate (AIM), while the CPG supports mobilising and stabilising exercise in the acute stage (C); leave an adaptive unloading posture alone early on. Surgery for progressive motor deficit despite care (25% still debilitating pain at 12 months).
- JOSPT Neck Pain CPG 2017 (Blanpied et al.): Spurling sens 0.50, spec 0.86-0.93; distraction sens 0.44, spec 0.90-0.97; Valsalva sens 0.22, spec 0.94; median nerve neurodynamic test useful (a negative test helps rule out), radial nerve test not. Imaging: with neurological signs and normal radiographs, MRI including the craniocervical junction and upper thoracic spine. No benefit from continuous traction; a collar only briefly in the acute phase when nothing else relieves (expert opinion). Refer if not resolving or worsening.
- Stinger or burner (brachial plexus traction after a tackle or collision): transient burning or dead arm settling in minutes; bilateral or recurrent symptoms suggest cord involvement (transient quadriparesis): medical assessment before return to sport.
- CTS CPG 2019: ULNT accuracy for CTS is conflicting (D), so a positive ULNT1 does not separate a root from carpal tunnel; use the Wainner cluster and the thenar-sparing check.
- Sources: JOSPT Neck Pain CPG 2017 (Blanpied et al.); Wainner 2003; Thoomes 2018; Wong 2014; Iyer and Kim 2016; Thoomes 2013; Fritz 2014; Basson 2017; Cook 2010; Rushton 2023. Record NDI (or PROMIS) and NPRS at the first visit.
