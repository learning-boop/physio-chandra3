---
# From "Wrist assessment.docx" (Joint wise assessment folder), 25 Sep 2026.
# Built into src/data/symptomGuideExtra.js (wrist) and src/data/injuryScreen.js (wrist screen).
# Conditions: content/conditions/wrist-*.md. Body map: the wrist band, which also covers the hand until the hand document is built.
# Test patients: npm run check:regions
region: wrist
name: Wrist
source: Erickson M et al. Hand pain and sensory deficits: carpal tunnel syndrome. JOSPT 49(5), 2019 (revision published 2026: Chandra to confirm the current version); Graham B et al. Development and validation of diagnostic criteria for carpal tunnel syndrome (CTS-6). J Hand Surg Am 31(6), 2006; Duckworth AD et al. Predictors of fracture following suspected injury to the scaphoid. J Bone Joint Surg Br 94(7), 2012; Ilyas AM et al. De Quervain tenosynovitis of the wrist. J Am Acad Orthop Surg 15(12), 2007; Tay SC et al. The “ulnar fovea sign” for defining ulnar wrist pain. J Hand Surg Am 32(4), 2007; Harden RN et al. Validation of proposed diagnostic criteria (the “Budapest Criteria”) for complex regional pain syndrome. Pain 150(2), 2010; Lee MJ, LaStayo PC. Pronator syndrome and other nerve compressions that mimic carpal tunnel syndrome. JOSPT 34(10), 2004; Donnelly JM et al. Travell, Simons & Simons' Myofascial Pain and Dysfunction: The Trigger Point Manual, 3rd ed. Wolters Kluwer, 2019
reviewed_by: Chandra Matla, Registered Physiotherapist
# The document still says "DRAFT prepared 24 Sep 2026, awaiting Chandra's review"; Chandra confirmed the review on 25 Sep 2026.
reviewed_on: 2026-09-25
---

## red flags
- Is your wrist hot, red, and swollen, with a fever or feeling very unwell? | emergency | Possible joint infection (septic arthritis)
- Did you have a cut, bite, or puncture on the wrist or hand, and is it now swollen, red, and very painful to move the fingers? | emergency | Possible tendon sheath or deep hand infection; needs urgent surgical review
- Along with the hand symptoms, has one side of your face drooped, or have you had sudden weakness or numbness down one whole side, or trouble speaking? | emergency | Possible stroke
- Since a wrist injury, surgery, or cast, is your hand burning, swollen, shiny, changing colour or temperature, or so sensitive that even light touch hurts? | urgent | Possible complex regional pain syndrome (CRPS); early treatment matters
- Did your wrist become suddenly hot, swollen, and very painful overnight, and have you had gout or “pseudogout” before? | urgent | Possible gout or other crystal arthritis
- Are both wrists or several finger joints swollen and stiff for more than an hour in the morning? | urgent | Possible inflammatory arthritis (for example rheumatoid arthritis)
- Is the numbness in your fingers there all the time now, or is the muscle at the base of your thumb getting thinner? | urgent | Severe nerve compression (carpal tunnel) may need a specialist opinion
- Do both hands feel numb or clumsy (buttons, writing), or has your walking become unsteady? | urgent | Possible pressure on the spinal cord in the neck: see the neck region
- Do your fingers or hand go white, blue, or cold in attacks, or is there a painful cold finger that does not recover? | urgent | Possible circulation problem (Raynaud's, or damage to the artery in the palm)
- Have you ever had cancer, or is there a hard lump at the wrist that is growing, or deep pain at night that does not change with position? | urgent | A lump or bone lesion needs medical review

## injury screen
<!-- Built into src/data/injuryScreen.js. Asked in order; the first answer that routes ends it. -->
I1 Has your wrist been hurt in a fall, twist, or blow in the last 6 weeks?
- No
- Yes, I fell onto my outstretched hand
- Yes, a twist (racquet, golf, a drill that caught)
- Yes, a blow or crush
Route: No → skip this screen / Any Yes → I2
Why: Gate question. Scaphoid fractures are often missed for weeks, so the window is 6 weeks

I2 Is the wrist a different shape (like a dinner fork), or is bone showing through the skin?
Route: Yes → EMERGENCY
Why: Possible fracture or dislocation

I3 Since the injury, is your hand cold, pale, or blue, or is your whole hand numb?
Route: Yes → EMERGENCY
Why: Possible blood vessel or nerve injury

I4 Since the injury or a cast was put on, is numbness in your thumb, index, and middle fingers getting quickly worse?
Route: Yes → EMERGENCY
Why: Possible acute carpal tunnel syndrome after a wrist fracture

I5 Is there pain in the hollow at the base of your thumb, or when you pinch your thumb and index finger together or grip?
Route: Yes → PHYSICIAN FIRST
Why: Possible scaphoid fracture: often normal on the first X-ray, and missed fractures can fail to heal

I6 On the little-finger side: did you feel a clunk, and is it now swollen, painful to turn your palm up and down, or does the wrist give way?
Route: Yes → PHYSICIAN FIRST
Why: Possible TFCC tear, joint instability, or fracture on the little-finger side


## opening questions
Q: Your age?
- Under 18
- 18 to 29
- 30 to 49
- 50 to 64
- 65 or over

Q: How did it start?
- Gradually, no clear reason
- After a lot of gripping, typing, or tool use
- Since having a baby, or lifting a baby a lot
- During pregnancy
- After a fall onto the hand
- After a twist (racquet, golf, a drill that caught)

Q: How long has it been going on?
- Less than 2 weeks
- 2 to 6 weeks
- 6 weeks to 3 months
- More than 3 months

## questions
Q: Where is the pain mainly?
- Thumb side of the wrist
- Little-finger side of the wrist
- Back of the wrist, in the middle
- Palm side of the wrist
- The whole wrist

Q: Which of these bring it on? Tick all that apply. (Replaces subjective S5 for the wrist.)
- Gripping and twisting (opening jars, wringing a cloth)
- Lifting a baby, or lifting with the thumb up
- Putting weight through my hand (push-ups, getting up from a chair)
- Turning my palm up and down (key, door handle)
- Typing, or using a mouse or phone

Q: Which of these do you notice in your hand? Tick all that apply.
- Tingling or numbness in the thumb, index, and middle fingers
- Tingling or numbness in the little and ring fingers
- The whole hand tingles
- Weak grip, or dropping things
- None of these
Ask only if: The drawing reaches the hand or fingers, or the patient ticks “Pins and needles or numbness” (subjective S3)
<!-- The body map's wrist band covers the hand, so on the site this is always asked; it comes early when there is tingling. -->

Q: When does the tingling come on? Tick all that apply.
- It wakes me at night, and shaking my hand helps
- When driving, holding a phone, or reading
- The numbness is there all the time
- The back of my hand is numb too
- My thumb feels weak or clumsy
Ask only if: Question 3 includes “Tingling or numbness in the thumb, index, and middle fingers”

Q: Tuck your thumb into your palm, close your fingers over it, then gently bend your wrist towards your little finger. What happens?
- Sharp pain on the thumb side of the wrist
- A mild stretch only
- I would rather not try
Ask only if: Question 1 is “Thumb side of the wrist”

Q: On the little-finger side: which apply? Tick all that apply.
- A click or clunk when I turn my palm up and down
- Pain when I press the soft spot just beyond the bony bump
- A tendon that snaps or flicks over the back of the wrist
- Pain leaning on my hand, or the wrist gives way
- None of these
Ask only if: Question 1 is “Little-finger side of the wrist”

Q: Is there a lump at your wrist?
- A soft, round lump on the back of the wrist that changes size
- A lump on the palm side, near the thumb
- A hard lump that is growing
- No lump

Q: Which hurts more: moving your neck, moving your elbow, or using your wrist and hand?
- Moving my neck
- Moving my elbow
- Using my wrist and hand
- None of these bring it on
Ask only if: The drawing reaches the forearm, elbow, or neck, or the patient ticks “Pins and needles or numbness” or “Shooting or electric” (subjective S3)

## referral patterns
- Thumb tendons (APL, EPB) → thumb side of the wrist, into the thumb and up the forearm | De Quervain's tenosynovitis | Intersection syndrome (forearm file), superficial radial nerve, thumb base arthritis, scaphoid
- Scaphoid and scapholunate ligament → hollow at the base of the thumb, back of the wrist | Scaphoid fracture or ligament injury (after a fall) | De Quervain's, wrist arthritis
- Median nerve (carpal tunnel) → thumb, index, middle, and half the ring finger; often spreads up the forearm, sometimes to the elbow or shoulder | Carpal tunnel syndrome; spread above the wrist is common and does not rule it out | Pronator syndrome (forearm file), C6–C7 nerve root; both can occur together (“double crush”)
- Ulnar nerve at the wrist (Guyon's canal) → little finger and half the ring finger, palm side; back of the hand spared | Ulnar nerve irritation at the wrist (cyclists, tool users) | Ulnar nerve at the elbow (back of the hand also numb), C8 nerve root
- TFCC and distal radio-ulnar joint → little-finger side, clicking with turning | TFCC injury or joint instability | ECU tendon, ulnar impaction, pisotriquetral joint
- ECU tendon → back of the wrist on the little-finger side, snapping with turning | ECU tendinopathy or tendon slipping | TFCC
- Ganglion → back of the wrist, or palm side near the thumb | Ganglion cyst | Hard or growing lump: doctor first
- Lunate → back of the wrist in the middle, stiffness, weak grip | Kienböck's disease (loss of blood supply to the lunate) | Dorsal ganglion, scapholunate ligament
- Thumb base joint (CMC) and STT joint → thumb side of the wrist and base of the thumb | Thumb base or wrist arthritis | De Quervain's
- Neck (C6 nerve root) → thumb and index finger, thumb side of the wrist | Nerve root pain from the neck | Carpal tunnel, de Quervain's, superficial radial nerve
- Neck (C7 nerve root) → middle finger, back of the wrist | Nerve root pain from the neck | Carpal tunnel
- Neck or upper back (C8–T1) → little-finger side of the wrist and hand | Nerve root pain or thoracic outlet | Ulnar nerve at the wrist or elbow, Pancoast tumour
- Superficial radial nerve → burning over the back of the thumb and wrist, worse with a tight watch | Superficial radial nerve irritation (Wartenberg's): see the forearm file | De Quervain's
- Infraspinatus, scalenes, and brachialis → thumb side of the forearm, wrist, and base of the thumb | Muscle trigger point referral from the shoulder, neck, and arm | De Quervain's, C6 nerve root
- Subscapularis → a band of pain around the wrist | Muscle trigger point referral from the shoulder | Wrist arthritis, carpal tunnel
- Wrist extensors (ECRL, ECRB, EDC) → back of the wrist and hand | Muscle trigger point referral from the forearm | Dorsal ganglion, Kienböck's
- Wrist flexors (FCR, FCU) and pronator teres → palm side of the wrist | Muscle trigger point referral from the forearm | Carpal tunnel, FCR tendinopathy
- Latissimus dorsi and serratus posterior superior → little-finger side of the hand and wrist | Muscle trigger point referral | Ulnar nerve, C8 nerve root
- Sympathetic nervous system (CRPS) → whole wrist and hand in a glove pattern, with colour, temperature, sweating, and swelling changes | Not musculoskeletal: red flag | Doctor first (Budapest criteria)
- Inflammatory arthritis → both wrists and finger joints, long morning stiffness | Not musculoskeletal: red flag | Doctor first

## test patients
CASE: Test patient 1
Drawing: Thumb side of the right wrist, into the thumb
Answers: Age 30 to 49 · Since having a baby, or lifting a baby a lot · 2 to 6 weeks; Q1: thumb side of the wrist; Q2: lifting a baby, or lifting with the thumb up; Q5: sharp pain on the thumb side of the wrist
Flags: None
Expect: top condition = De Quervain's tenosynovitis; must not show = Carpal tunnel syndrome; scaphoid fracture; route = Results + booking

CASE: Test patient 2
Drawing: Palm side of the right wrist, and the thumb, index, and middle fingers
Answers: Age 50 to 64 · Gradually, no clear reason · More than 3 months · Subjective S3: Pins and needles or numbness; Q3: tingling or numbness in the thumb, index, and middle fingers; Q4: it wakes me at night, and shaking my hand helps; when driving, holding a phone, or reading; Q8: using my wrist and hand
Flags: None
Expect: top condition = Carpal tunnel syndrome; must not show = Nerve root pain from the neck as the top result; route = Results + booking

CASE: Test patient 3
Drawing: Thumb side of the left wrist after a fall
Answers: Age 18 to 29 · After a fall onto the hand · Less than 2 weeks; Injury screen: I1 “Yes, I fell onto my outstretched hand”; I2 to I4 No; I5 Yes
Flags: Injury screen I5 (possible scaphoid fracture)
Expect: top condition = None; see a doctor first; must not show = A wrist sprain result shown before the physician-first message; route = Physician first

CASE: Test patient 4
Drawing: Little-finger side of the right wrist
Answers: Age 30 to 49 · After a twist (racquet, golf, a drill that caught) · 6 weeks to 3 months · Injury screen: I1 “No” (more than 6 weeks ago); Q1: little-finger side of the wrist; Q2: turning my palm up and down; Q6: a click or clunk when I turn my palm up and down; pain when I press the soft spot just beyond the bony bump
Flags: None
Expect: top condition = TFCC injury; must not show = Ulnar nerve irritation at the wrist; route = Results + booking

CASE: Test patient 5
Drawing: Whole right wrist and hand, 8 weeks after a wrist fracture in a cast
Answers: Age 50 to 64 · After a fall onto the hand · 6 weeks to 3 months
Flags: “Since a wrist injury, surgery, or cast, is your hand burning, swollen, shiny, changing colour or temperature…?”
Expect: top condition = None; see a doctor first; must not show = Any wrist condition shown before the physician-first message; route = Physician first

CASE: Test patient 6
Drawing: Right side of the neck, thumb side of the forearm and wrist, thumb and index finger (look-alike)
Answers: Age 30 to 49 · Gradually, no clear reason · 2 to 6 weeks · Subjective S3: Pins and needles or numbness; Q3: tingling or numbness in the thumb, index, and middle fingers; Q4: when driving, holding a phone, or reading (no night waking); Q8: moving my neck
Flags: None
Expect: top condition = No wrist condition; shows a “this may be coming from your neck” message; must not show = Carpal tunnel syndrome as the top result; route = Results (suggest neck check) + booking
