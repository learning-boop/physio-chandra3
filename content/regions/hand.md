---
# From "Hand and fingers assessment.docx" (Joint wise assessment folder), 25 Sep 2026.
# Built into src/data/symptomGuideExtra.js (hand) and src/data/injuryScreen.js (hand screen).
# Conditions: content/conditions/hand-*.md. Body map: the hand band, below the wrist (WRIST_BOTTOM in Body3D.jsx).
# Test patients: npm run check:regions
region: hand
name: Hand & fingers
source: Leggit JC, Meko CJ. Acute finger injuries: part I. Tendons and ligaments. Am Fam Physician 73(5), 2006; Leggit JC, Meko CJ. Acute finger injuries: part II. Fractures, dislocations, and thumb injuries. Am Fam Physician 73(5), 2006; Kloppenburg M et al. 2018 update of the EULAR recommendations for the management of hand osteoarthritis. Ann Rheum Dis 78(1), 2019; Aletaha D et al. 2010 rheumatoid arthritis classification criteria (ACR/EULAR). Arthritis Rheum 62(9), 2010; Makkouk AH et al. Trigger finger: etiology, evaluation, and treatment. Curr Rev Musculoskelet Med 1(2), 2008; Hyatt BT, Bagg MR. Flexor tenosynovitis. Orthop Clin North Am 48(2), 2017; Erickson M et al. Hand pain and sensory deficits: carpal tunnel syndrome. JOSPT 49(5), 2019 (revision 2026: Chandra to confirm); Harden RN et al. Validation of the “Budapest Criteria” for complex regional pain syndrome. Pain 150(2), 2010; Donnelly JM et al. Travell, Simons & Simons' Myofascial Pain and Dysfunction: The Trigger Point Manual, 3rd ed. Wolters Kluwer, 2019
reviewed_by: Chandra Matla, Registered Physiotherapist
# The document still says "DRAFT prepared 24 Sep 2026, awaiting Chandra's review"; Chandra confirmed the review on 25 Sep 2026.
reviewed_on: 2026-09-25
---

## red flags
- Did you have a cut, bite, or puncture on your hand or finger (including hitting someone's teeth), and is it now swollen, red, and very painful to straighten the finger? | emergency | Possible tendon sheath or joint infection; needs urgent surgical review
- Was paint, grease, oil, or fluid injected into your hand under pressure (spray gun, grease gun), even if the wound looks tiny? | emergency | High-pressure injection injury: serious damage hides under a small wound
- Is a finger or thumb hot, red, and swollen, with a fever or feeling very unwell? | emergency | Possible joint infection (septic arthritis)
- Along with the hand symptoms, has one side of your face drooped, or have you had sudden weakness or numbness down one whole side, or trouble speaking? | emergency | Possible stroke
- Is there a tense, throbbing, swollen fingertip, or pus around the nail? | urgent | Possible fingertip or nail-fold infection (felon or paronychia); same-day review
- Did a finger joint become suddenly hot, swollen, and very painful overnight, and have you had gout or “pseudogout” before? | urgent | Possible gout or other crystal arthritis
- Are the knuckles in both hands swollen and stiff for more than an hour in the morning, or is a whole finger swollen like a sausage (especially with psoriasis)? | urgent | Possible inflammatory arthritis (rheumatoid or psoriatic)
- Do your fingers go white, then blue, in the cold, or is there a sore or ulcer on a fingertip? | urgent | Possible Raynaud's or another circulation problem
- Since a hand injury, surgery, or cast, is your hand burning, swollen, shiny, changing colour or temperature, or so sensitive that light touch hurts? | urgent | Possible complex regional pain syndrome (CRPS)
- Is the numbness in your fingers there all the time, or is the muscle at the base of your thumb or between your thumb and index finger getting thinner? | urgent | Severe nerve compression needs a specialist opinion
- Do both hands feel numb or clumsy (buttons, writing), or has your walking become unsteady? | urgent | Possible pressure on the spinal cord in the neck: see the neck region
- Is there a hard lump that is growing, or a new dark streak under a nail? | urgent | A growing lump or nail streak needs medical review

## injury screen
<!-- Built into src/data/injuryScreen.js. Asked in order; the first answer that routes ends it. -->
I1 Has your hand, finger, or thumb been hurt in the last 6 weeks?
- No
- Yes, a finger was jammed (ball, wall)
- Yes, my thumb was bent back (ski pole, fall)
- Yes, a finger caught in clothing, a door, or a jersey
- Yes, it was crushed or cut
Route: No → skip this screen / Any Yes → I2
Why: Gate question

I2 Is a finger still out of place, or is bone showing through the skin?
Route: Yes → EMERGENCY
Why: Dislocation that has not been put back, or open fracture

I3 After a cut: can you not bend or straighten the finger, or is one side of the finger or the fingertip numb?
Route: Yes → EMERGENCY
Why: Possible cut tendon or nerve; repair is time-sensitive

I4 Does the tip of the finger droop, and it will not straighten on its own?
Route: Yes → PHYSICIAN FIRST
Why: Possible mallet finger; needs a splint within about a week

I5 After grabbing or catching a finger (often the ring finger), can you not bend the tip of that finger?
Route: Yes → PHYSICIAN FIRST
Why: Possible “jersey finger” (flexor tendon avulsion); surgery works best within days

I6 After your thumb was bent back, is there pain on the index-finger side of the thumb knuckle, or is pinching weak?
Route: Yes → PHYSICIAN FIRST
Why: Possible thumb ligament tear (skier's thumb); some need surgery

I7 When you make a fist, does one finger cross over or point towards another, or is the middle finger joint swollen and will not straighten?
Route: Yes → PHYSICIAN FIRST
Why: Possible finger fracture with rotation, or a central slip (boutonnière) injury


## opening questions
Q: Your age?
- Under 18
- 18 to 29
- 30 to 49
- 50 to 64
- 65 or over

Q: How did it start?
- Gradually, no clear reason
- After a lot of gripping, pinching, typing, or phone use
- A finger was jammed, bent back, or caught
- It was crushed or cut
- During pregnancy, or since having a baby
- Other joints in my body are swollen or stiff too

Q: How long has it been going on?
- Less than 2 weeks
- 2 to 6 weeks
- 6 weeks to 3 months
- More than 3 months

## questions
Q: Where is the pain mainly?
- Base of the thumb, where it meets the wrist
- Knuckles at the base of the fingers
- Middle or end joints of the fingers
- Palm, at the base of a finger or thumb
- A whole finger, or the fingertips

Q: Which of these apply? Tick all that apply.
- A finger or thumb clicks, catches, or locks bent
- A tender lump in the palm at the base of that finger
- A finger is slowly bending into my palm, and I cannot lay my hand flat
- Hard bony bumps on the finger joints
- None of these

Q: Which of these bring it on? Tick all that apply. (Replaces subjective S5 for the hand.)
- Pinching (turning a key, opening a jar, doing up buttons)
- Gripping firmly
- Typing, texting, or gaming with the thumbs
- Pushing up with my hand (getting out of a chair)
- Cold weather

Q: Which of these do you notice in your hand? Tick all that apply.
- Tingling or numbness in the thumb, index, and middle fingers
- Tingling or numbness in the little and ring fingers
- Numbness down one side of one finger only
- Tingling in the fingertips of both hands
- None of these
Ask only if: The patient ticks “Pins and needles or numbness” (subjective S3)

Q: When does the tingling come on? Tick all that apply.
- It wakes me at night, and shaking my hand helps
- When I use my hand, or hold a phone
- It is there all the time
- The back of my hand is numb too
Ask only if: Question 4 includes “Tingling or numbness in the thumb, index, and middle fingers”

Q: What does any swelling look like?
- One whole finger swollen like a sausage
- Several knuckles swollen in both hands
- One joint hot and puffy
- Hard, bony swelling of the finger joints
- No swelling

Q: Which of these do you notice? Tick all that apply.
- Fingers go white, then blue, then red in the cold
- Since an injury, my hand is a different colour or temperature from the other one
- Pitting or ridges in my nails, or psoriasis
- Stiff for more than 30 minutes in the morning
- None of these
Ask only if: The pain has lasted 6 weeks or more, or Question 6 is not “No swelling”

Q: Which hurts more: moving your neck, moving your wrist, or using your fingers?
- Moving my neck
- Moving my wrist
- Using my fingers
- None of these bring it on
Ask only if: The drawing reaches the wrist, forearm, or neck, or the patient ticks “Pins and needles or numbness” or “Shooting or electric” (subjective S3)

## referral patterns
- Thumb base joint (CMC) → base of the thumb and thumb side of the wrist | Thumb base arthritis | De Quervain's, scaphoid (wrist file)
- Finger end and middle joints → the joint itself, with bony bumps | Hand osteoarthritis (Heberden's and Bouchard's nodes) | Inflammatory arthritis, gout
- Flexor tendon pulley (A1) → palm at the base of the finger; often felt at the middle finger joint instead | Trigger finger: patients often point to the middle joint, not the palm | Middle joint arthritis, Dupuytren's
- Palm fascia → nodules and cords in the palm, finger bending in | Dupuytren's disease (usually painless) | Trigger finger
- Thumb ligament (UCL) → index-finger side of the thumb knuckle | Skier's or gamekeeper's thumb | Thumb base arthritis
- Finger extensor tendon → drooping fingertip, or a bent middle joint | Mallet finger, or boutonnière (central slip) injury | Fracture
- Median nerve (carpal tunnel) → thumb, index, middle, and half the ring finger, palm side | Carpal tunnel syndrome: see the wrist file | C6–C7 nerve root, pronator syndrome
- Ulnar nerve (wrist or elbow) → little finger and half the ring finger; back of the hand too if at the elbow | Ulnar nerve irritation: see the wrist and elbow files | C8 nerve root, thoracic outlet
- Digital nerve → numbness down one side of one finger | Digital nerve irritation or injury (pressure, a cut, “bowler's thumb”) | Nerve root (would affect more than one side of a finger)
- Neck (C6 nerve root) → thumb and index finger | Nerve root pain from the neck | Carpal tunnel, thumb base arthritis
- Neck (C7 nerve root) → middle finger | Nerve root pain from the neck | Carpal tunnel
- Neck or upper back (C8–T1) → little and ring fingers, inner hand | Nerve root pain or thoracic outlet | Ulnar nerve, Pancoast tumour
- Scalenes, infraspinatus, and brachialis → thumb, index finger, and base of the thumb | Muscle trigger point referral from the neck, shoulder, and arm | Thumb base arthritis, C6 nerve root
- Latissimus dorsi, serratus posterior superior, and pectoralis minor → little-finger side of the hand and little finger | Muscle trigger point referral | Ulnar nerve, C8 nerve root
- Finger extensor muscles (EDC) → back of the middle and ring fingers | Muscle trigger point referral from the forearm | Finger joint arthritis
- Adductor pollicis, opponens pollicis, and first dorsal interosseous → base of the thumb and side of the index finger | Hand muscle trigger point referral (heavy pinching, texting) | Thumb base arthritis, de Quervain's
- Finger flexor muscles → palm side of the fingers | Muscle trigger point referral from the forearm | Trigger finger
- Sympathetic nervous system (CRPS) → whole hand in a glove pattern, with colour, temperature, sweating, and swelling changes | Not musculoskeletal: red flag | Doctor first (Budapest criteria)
- Inflammatory arthritis → knuckles of both hands, or a whole “sausage” finger | Not musculoskeletal: red flag | Doctor first
- Blood vessels (Raynaud's) → fingers white, blue, then red in the cold | Not musculoskeletal: red flag | Doctor first

## test patients
CASE: Test patient 1
Drawing: Base of the right thumb
Answers: Age 50 to 64 · Gradually, no clear reason · More than 3 months; Q1: base of the thumb, where it meets the wrist; Q3: pinching (turning a key, opening a jar); Q6: hard, bony swelling of the finger joints
Flags: None
Expect: top condition = Thumb base arthritis; must not show = De Quervain's as the top result; inflammatory arthritis; route = Results + booking

CASE: Test patient 2
Drawing: Palm at the base of the right ring finger, and the middle joint of that finger
Answers: Age 50 to 64 · Gradually, no clear reason · 6 weeks to 3 months · Subjective S15: Diabetes; Q1: palm, at the base of a finger or thumb; Q2: a finger clicks, catches, or locks bent; a tender lump in the palm at the base of that finger
Flags: None
Expect: top condition = Trigger finger; must not show = Finger joint arthritis as the top result; route = Results + booking

CASE: Test patient 3
Drawing: Tip of the left middle finger
Answers: Age 30 to 49 · A finger was jammed, bent back, or caught · Less than 2 weeks; Injury screen: I1 “Yes, a finger was jammed”; I2 No; I3 No; I4 Yes
Flags: Injury screen I4 (possible mallet finger)
Expect: top condition = None; see a doctor first; must not show = Results + booking without the physician-first message; route = Physician first

CASE: Test patient 4
Drawing: Right hand, over the knuckle of the middle finger
Answers: Age 18 to 29 · It was crushed or cut · Less than 2 weeks
Flags: “Did you have a cut, bite, or puncture on your hand or finger (including hitting someone's teeth), and is it now swollen, red, and very painful…?”
Expect: top condition = None (no results shown); must not show = Any hand condition; any booking button; route = 911

CASE: Test patient 5
Drawing: Knuckles of both hands
Answers: Age 30 to 49 · Gradually, no clear reason · 6 weeks to 3 months · Subjective S8: Stiff for more than 30 minutes; Q1: knuckles at the base of the fingers; Q6: several knuckles swollen in both hands; Q7: stiff for more than 30 minutes in the morning
Flags: “Are the knuckles in both hands swollen and stiff for more than an hour in the morning…?”
Expect: top condition = None; see a doctor first; must not show = Hand osteoarthritis or any mechanical result without the physician-first message; route = Physician first

CASE: Test patient 6
Drawing: Right side of the neck, thumb, and index finger (look-alike)
Answers: Age 30 to 49 · Gradually, no clear reason · 2 to 6 weeks · Subjective S3: Pins and needles or numbness; Q4: tingling or numbness in the thumb, index, and middle fingers; Q5: when I use my hand (no night waking); Q8: moving my neck
Flags: None
Expect: top condition = No hand condition; shows a “this may be coming from your neck” message; must not show = Thumb base arthritis or carpal tunnel as the top result; route = Results (suggest neck check) + booking
