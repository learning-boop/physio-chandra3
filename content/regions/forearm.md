---
# From "Forearm assessment.docx" (Joint wise assessment folder), 25 Sep 2026.
# Built into src/data/symptomGuideExtra.js (forearm) and src/data/injuryScreen.js (forearm screen).
# Conditions: content/conditions/forearm-*.md. Body map: the forearm band (FOREARM_BOTTOM in Body3D.jsx).
# Test patients: npm run check:regions
region: forearm
name: Forearm
source: Lee MJ, LaStayo PC. Pronator syndrome and other nerve compressions that mimic carpal tunnel syndrome. JOSPT 34(10), 2004; Moradi A et al. Radial tunnel syndrome, diagnostic and treatment dilemma. Arch Bone Jt Surg 3(3), 2015; Lucado AM et al. Lateral elbow pain and muscle function impairments: clinical practice guidelines. JOSPT 52(12), 2022; Murphy DR et al. Pain patterns and descriptions in patients with radicular pain. Chiropr Osteopat 17, 2009; van Alfen N, van Engelen BG. The clinical spectrum of neuralgic amyotrophy. Brain 129(2), 2006; Donnelly JM et al. Travell, Simons & Simons' Myofascial Pain and Dysfunction: The Trigger Point Manual, 3rd ed. Wolters Kluwer, 2019; (Intersection syndrome and chronic exertional compartment syndrome of the forearm: for Chandra to add his preferred review)
reviewed_by: Chandra Matla, Registered Physiotherapist
# The document says "Reviewed by Chandra Matla on 25 Sept 2026".
reviewed_on: 2026-09-25
---

## red flags
- Is your forearm pain getting worse and worse, with the forearm tight and swollen and much worse when your fingers are moved, especially under a cast or tight bandage? | emergency | Possible compartment syndrome (pressure build-up in the forearm)
- Is there a hot, swollen, red area on your forearm that is spreading fast, with pain far worse than it looks, or feeling very unwell? | emergency | Possible severe skin and tissue infection (necrotising fasciitis)
- Is the pain on the inside of your left forearm or arm brought on by effort, or does it come with chest tightness, shortness of breath, or sweating? | emergency | Heart pain can be felt down the inside of the arm and forearm
- Along with the arm symptoms, has one side of your face drooped, or have you had sudden weakness or numbness down one whole side, or trouble speaking? | emergency | Possible stroke
- Is there spreading redness, a red streak running up the arm, or a hot swollen area, with a fever? | urgent | Possible skin or lymph infection (cellulitis or lymphangitis); same-day review
- Is your hand becoming weaker, can you not lift your wrist, or can you not make an “OK” sign with your thumb and index finger? | urgent | Nerve weakness (radial or anterior interosseous nerve) needs medical review
- Do both hands feel numb or clumsy (buttons, writing), or has your walking become unsteady? | urgent | Possible pressure on the spinal cord in the neck: see the neck region
- Do you smoke or used to smoke, and does pain run down the little-finger side of your forearm, with a cough that will not go away, or a drooping eyelid? | urgent | Possible tumour at the top of the lung (Pancoast)
- Are you a young gymnast or weight-bearing athlete with a deep, pinpoint bone pain in the forearm that is worse with loading? | urgent | Possible stress fracture or growth plate injury; needs imaging
- Is there a band of burning pain down the forearm, with a rash or blisters in the same strip? | urgent | Possible shingles
- Have you ever had cancer, or is there a lump in your forearm that is growing, or deep bone pain at night that does not change with position? | urgent | Cancer or a bone lesion needs medical review

## injury screen
<!-- Built into src/data/injuryScreen.js. Asked in order; the first answer that routes ends it. -->
I1 Has your forearm been hurt in a fall, accident, blow, or crush in the last 2 weeks?
- No
- Yes, I fell onto my hand
- Yes, a blow to the forearm
- Yes, it was crushed or trapped
Route: No → skip this screen / Any Yes → I2
Why: Gate question. Keeps the screen to recent injuries

I2 Is the forearm a different shape, or is bone showing through the skin?
Route: Yes → EMERGENCY
Why: Possible fracture

I3 Since the injury, is your hand cold, pale, or blue, or is your whole hand numb?
Route: Yes → EMERGENCY
Why: Possible blood vessel or nerve injury

I4 Was the forearm crushed, and is the pain now getting worse, with the forearm tight and much worse when the fingers are moved?
Route: Yes → EMERGENCY
Why: Possible compartment syndrome

I5 Since the injury, can you not turn your palm up and down, or is there pain at the elbow or wrist as well as the forearm?
Route: Yes → PHYSICIAN FIRST
Why: Possible forearm fracture that involves the elbow or wrist joint

I6 Since the injury, can you not lift your wrist or straighten your fingers?
Route: Yes → PHYSICIAN FIRST
Why: Possible radial nerve injury


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
- After a new or increased repeated task (rowing, paddling, weights, a new job)
- It comes on during sport and eases when I stop
- After a fall onto the hand, or a blow
- It came with a rash, or after an illness or vaccine

Q: How long has it been going on?
- Less than 2 weeks
- 2 to 6 weeks
- 6 weeks to 3 months
- More than 3 months

## questions
Q: Where is the pain mainly?
- Top of the forearm near the elbow, on the thumb side
- Top of the forearm about four finger-widths above the wrist, on the thumb side
- Underside of the forearm near the elbow (palm side)
- Little-finger side of the forearm
- The whole forearm

Q: Which of these bring it on? Tick all that apply. (Replaces subjective S5 for the forearm.)
- Gripping, typing, or using tools
- Turning my palm up and down (screwdriver, key, door handle)
- Repeated wrist movements (rowing, paddling, weights)
- It builds during sport and eases within minutes of stopping
- A tight watch strap, cuff, or bracelet

Q: Which of these do you notice? Tick all that apply.
- A squeaking or creaking feeling when I move my wrist
- Swelling along the top of the forearm
- The forearm goes tight and hard with use
- Burning or tingling over the back of the thumb and wrist
- None of these

Q: Which of these do you notice in your hand? Tick all that apply.
- Tingling or numbness in the thumb, index, and middle fingers
- Tingling or numbness in the little and ring fingers
- Weak pinch, or cannot make an “OK” sign with thumb and index finger
- Cannot lift the wrist or straighten the fingers well
- None of these
Ask only if: The drawing reaches the hand, or the patient ticks “Pins and needles or numbness” (subjective S3)

Q: Does tingling in your fingers wake you at night?
- Yes, often, and shaking the hand helps
- No; it comes on when I use my forearm, with an ache in the forearm
- I do not get tingling
Ask only if: Question 4 includes “Tingling or numbness in the thumb, index, and middle fingers”

Q: Which hurts more: moving your neck, moving your elbow, or using your wrist and hand?
- Moving my neck
- Moving my elbow
- Using my wrist and hand
- None of these bring it on
Ask only if: The drawing reaches the neck, shoulder, or hand, or the patient ticks “Pins and needles or numbness” or “Shooting or electric” (subjective S3)

Q: How does the pain spread? Tick all that apply.
- It stays in the forearm
- It starts at the outer elbow and spreads down
- It starts at the neck or shoulder and travels down the arm
- A deep ache below the outer elbow, without numbness
- It runs along a narrow line into particular fingers
Ask only if: The drawing covers more than the forearm

Q: If it comes on during sport (rowing, motocross, climbing, paddling): which apply? Tick all that apply.
- The forearm goes tight and hard
- The hand goes numb or weak during exercise
- It eases within 10 to 30 minutes of stopping
- It lasts into the next day
- None of these
Ask only if: Question 2 includes “It builds during sport and eases within minutes of stopping”, or How did it start? is “It comes on during sport and eases when I stop”

## referral patterns
- Outer elbow tendons (ECRB) → outer elbow and down the top of the forearm | Lateral elbow pain (tennis elbow): check the elbow file | Radial tunnel, C6 nerve root
- Radial tunnel (posterior interosseous nerve) → deep ache 4–5 cm below the outer elbow, into the top of the forearm, without numbness | Radial tunnel syndrome | Tennis elbow, C6–C7 nerve root
- Superficial radial nerve → burning or tingling over the back of the thumb and wrist, worse with a tight watch or cuff | Superficial radial nerve irritation (Wartenberg's syndrome) | De Quervain's (wrist file), C6 nerve root
- Crossing point of the thumb tendons → pain, swelling, and squeaking 4–8 cm above the wrist on the thumb side | Intersection syndrome (repeated wrist movement, rowing, weights) | De Quervain's (wrist file)
- Median nerve (pronator area) → aching palm side of the forearm, tingling in the thumb, index, and middle fingers, without night waking | Pronator syndrome | Carpal tunnel (wrist file), C6–C7 nerve root
- Anterior interosseous nerve → weak pinch (cannot make an “OK” sign), little or no numbness | Anterior interosseous nerve problem | Thumb tendon rupture; neuralgic amyotrophy (doctor first)
- Ulnar nerve (elbow or forearm) → little-finger side of the forearm, little and ring fingers | Ulnar nerve irritation: check the elbow file | C8 nerve root, thoracic outlet, Pancoast tumour
- Forearm muscles with repeated gripping → forearm tight and hard, easing 10 to 30 minutes after stopping | Chronic exertional compartment syndrome (“arm pump”) | Muscle overuse, thoracic outlet (vessel type)
- Forearm flexor and extensor muscles → diffuse forearm ache with gripping or typing | Forearm muscle overuse | Tennis or golfer's elbow, nerve irritation
- Neck (C6 nerve root) → thumb side of the forearm to the thumb and index finger | Nerve root pain from the neck | Pronator syndrome, carpal tunnel, superficial radial nerve
- Neck (C7 nerve root) → back of the forearm to the middle finger | Nerve root pain from the neck | Radial tunnel, triceps trigger points
- Neck or upper back (C8–T1) → little-finger side of the forearm to the little and ring fingers | Nerve root pain or thoracic outlet | Ulnar nerve, Pancoast tumour
- Infraspinatus and scalene muscles → thumb side of the forearm, to the thumb and index finger | Muscle trigger point referral from the shoulder and neck | C6 nerve root
- Brachialis and brachioradialis → base and web of the thumb, top of the forearm | Muscle trigger point referral | De Quervain's, superficial radial nerve
- Wrist and finger extensors, supinator → top of the forearm, back of the hand and fingers | Muscle trigger point referral | Radial tunnel, tennis elbow, C7 nerve root
- Pectoralis minor, latissimus dorsi, serratus posterior superior → little-finger side of the forearm and hand | Muscle trigger point referral | C8 nerve root, ulnar nerve, heart
- Heart → inside of the left forearm and arm, with effort | Not musculoskeletal: red flag | Emergency
- Top of the lung (Pancoast) → little-finger side of the forearm, sometimes with a drooping eyelid | Not musculoskeletal: red flag | Doctor first
- Skin nerve (shingles) → a burning band down the forearm, before or with a rash | Not musculoskeletal: red flag | Doctor first

## test patients
CASE: Test patient 1
Drawing: Top of the right forearm, just above the wrist on the thumb side
Answers: Age 18 to 29 · After a new or increased repeated task (rowing, paddling, weights, a new job) · Less than 2 weeks; Q1: top of the forearm about four finger-widths above the wrist; Q2: repeated wrist movements; Q3: a squeaking or creaking feeling when I move my wrist; swelling along the top of the forearm
Flags: None
Expect: top condition = Intersection syndrome; must not show = De Quervain's as the top result; any nerve condition; route = Results + booking

CASE: Test patient 2
Drawing: Palm side of the right forearm, and the thumb, index, and middle fingers
Answers: Age 30 to 49 · After a lot of gripping, typing, or tool use · 6 weeks to 3 months · Subjective S3: Pins and needles or numbness; Q1: underside of the forearm near the elbow; Q4: tingling or numbness in the thumb, index, and middle fingers; Q5: no; it comes on when I use my forearm; Q6: using my wrist and hand
Flags: None
Expect: top condition = Pronator syndrome (median nerve in the forearm); must not show = Nerve root pain from the neck as the top result; route = Results + booking

CASE: Test patient 3
Drawing: Both forearms, top and underside
Answers: Age 18 to 29 · It comes on during sport and eases when I stop · 6 weeks to 3 months; Q2: it builds during sport and eases within minutes of stopping; Q3: the forearm goes tight and hard with use; Q8: the forearm goes tight and hard; it eases within 10 to 30 minutes of stopping
Flags: None
Expect: top condition = Chronic exertional compartment syndrome (“arm pump”); must not show = Any physician-first message; nerve root pain from the neck; route = Results + booking

CASE: Test patient 4
Drawing: Right side of the neck and the thumb side of the forearm to the thumb (look-alike)
Answers: Age 30 to 49 · Gradually, no clear reason · 2 to 6 weeks · Subjective S3: Pins and needles or numbness; Q4: tingling or numbness in the thumb, index, and middle fingers; Q5: I do not get tingling at night; Q6: moving my neck; Q7: it starts at the neck or shoulder and travels down the arm
Flags: None
Expect: top condition = No forearm condition; shows a “this may be coming from your neck” message; must not show = Pronator syndrome or any forearm condition as the top result; route = Results (suggest neck check) + booking

CASE: Test patient 5
Drawing: Whole left forearm, in a cast after a wrist fracture
Answers: Age 50 to 64 · After a fall onto the hand, or a blow · Less than 2 weeks
Flags: “Is your forearm pain getting worse and worse, with the forearm tight and swollen and much worse when your fingers are moved, especially under a cast or tight bandage?”
Expect: top condition = None (no results shown); must not show = Any forearm condition; any booking button; route = 911
