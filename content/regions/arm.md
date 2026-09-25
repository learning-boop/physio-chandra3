---
# From "Upper arm assessment.docx" (Joint wise assessment folder), 25 Sep 2026.
# Chosen over "Arm assessment.docx" (shoulder to wrist), which the Upper arm and Forearm documents replace.
# Built into src/data/symptomGuideExtra.js (arm) and src/data/injuryScreen.js (arm screen).
# Conditions: content/conditions/arm-*.md. Body map: the upper arm band (UPPERARM_BOTTOM in Body3D.jsx).
# Test patients: npm run check:regions
region: arm
name: Upper arm
source: Blanpied PR et al. Neck Pain: Revision 2017 (neck pain with radiating pain). JOSPT 47(7), 2017; Murphy DR et al. Pain patterns and descriptions in patients with radicular pain. Chiropr Osteopat 17, 2009; Illig KA et al. SVS reporting standards for thoracic outlet syndrome. J Vasc Surg 64(3), 2016; van Alfen N, van Engelen BG. The clinical spectrum of neuralgic amyotrophy. Brain 129(2), 2006; Donnelly JM et al. Travell, Simons & Simons' Myofascial Pain and Dysfunction: The Trigger Point Manual, 3rd ed. Wolters Kluwer, 2019; Finucane LM et al. International Framework for Red Flags for Potential Serious Spinal Pathologies. JOSPT 50(7), 2020
reviewed_by: Chandra Matla, Registered Physiotherapist
reviewed_on: DRAFT prepared 24 Sep 2026, awaiting Chandra's review
---

## red flags
- Is the pain in your arm, especially the inside of the left arm, brought on by effort, or does it come with chest tightness, shortness of breath, sweating, or jaw pain? | emergency | Heart pain is often felt down the inside of the arm (T1)
- Has your whole arm suddenly become swollen, heavy, or bluish, and are you also short of breath or have chest pain? | emergency | Possible clot in the arm that has travelled to the lung
- Along with the arm symptoms, has one side of your face drooped, or have you had sudden weakness or numbness down one whole side, or trouble speaking? | emergency | Possible stroke
- After very hard exercise, is your arm hugely swollen and very painful, and is your urine dark like cola? | emergency | Possible muscle breakdown (rhabdomyolysis), which can damage the kidneys
- Is there spreading redness, a red streak running up the arm, or a hot swollen area, with a fever? | urgent | Possible skin or lymph infection (cellulitis or lymphangitis); same-day review
- Has your whole arm become swollen, heavy, or bluish over a day or two, especially after a drip or line in the arm, or heavy overhead exercise? | urgent | Possible blood clot in the arm (same-day review)
- Do you smoke or used to smoke, and does pain run down the inside of your arm to your little finger, with a cough that will not go away, or a drooping eyelid? | urgent | Possible tumour at the top of the lung (Pancoast)
- Do both hands feel numb or clumsy (buttons, writing), or has your walking become unsteady? | urgent | Possible pressure on the spinal cord in the neck: see the neck region
- Did a sudden, severe arm or shoulder pain with no injury last several days, and then your arm muscles became weak or thin? | urgent | Possible nerve inflammation (neuralgic amyotrophy)
- Is there a band of burning pain down the arm, with a rash or blisters in the same strip? | urgent | Possible shingles
- Have you ever had cancer, or is there a lump in your arm that is growing, or deep bone pain at night that does not change with position? | urgent | Cancer or a bone lesion needs medical review

## injury screen
<!-- Built into src/data/injuryScreen.js. Asked in order; the first answer that routes ends it. -->
I1 Has your upper arm been hurt in a fall, accident, blow, or heavy lift in the last 2 weeks?
- No
- Yes, a fall
- Yes, a blow to the arm
- Yes, I felt a pop or tear while lifting
Route: No → skip this screen / Any Yes → I2
Why: Gate question. Keeps the screen to recent injuries

I2 Is the arm a different shape, or is bone showing through the skin?
Route: Yes → EMERGENCY
Why: Possible fracture

I3 Since the injury, is your hand cold, pale, or blue, or is your whole hand numb?
Route: Yes → EMERGENCY
Why: Possible blood vessel or nerve injury

I4 Is the pain in your upper arm getting worse and worse, with the arm tight and swollen, and much worse when your elbow or fingers are moved?
Route: Yes → EMERGENCY
Why: Possible compartment syndrome (pressure build-up in the arm)

I5 Since the injury, can you not lift your wrist or straighten your fingers?
Route: Yes → PHYSICIAN FIRST
Why: Possible radial nerve injury, often with a fracture of the upper arm bone

I6 Did you feel a pop, click, or tearing at the front of the shoulder or upper arm during a sudden, forceful lift or pull, and has the shape of your biceps changed since (a new bulge low in the arm)?
Route: Yes → PHYSICIAN FIRST, same day
Why: Possible torn biceps tendon
<!-- Chandra, 25 Sep 2026: sudden forced activity, a click or feel of a tear, and a change in the shape of the biceps mean a doctor the same day, at any age. This replaced the document's age split (under 40 or heavy work → physician first; 40 or over → continue). -->


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
- After the gym, heavy lifting, or a new workout
- After a fall or a blow to the arm
- I felt a pop or tear while lifting
- It came with a rash, or after an illness or vaccine

Q: How long has it been going on?
- Less than 2 weeks
- 2 to 6 weeks
- 6 weeks to 3 months
- More than 3 months

## questions
Q: Which of these do you notice in your hand? Tick all that apply.
- Tingling or numbness in the little and ring fingers
- Tingling or numbness in the thumb, index, and middle fingers
- Weak grip, or dropping things
- Cannot lift the wrist or straighten the fingers well
- None of these
Ask only if: The drawing reaches the hand, or the patient ticks “Pins and needles or numbness” (subjective S3)

Q: Which hurts more: moving your neck, moving your shoulder, or using your arm and hand?
- Moving my neck
- Moving my shoulder
- Using my arm and hand
- None of these bring it on
- --row--

Q: About the muscle after exercise: which apply?
- Sore and stiff 1 to 3 days after, then easing
- A sudden sharp pain during a lift, with bruising after
- A tender knot in the muscle that sends pain elsewhere when pressed
- None of these
- --row--

Q: When your arm is raised overhead, or you carry something heavy, what happens?
- The arm goes heavy, tingly, or dead
- The hand goes pale or cold
- The arm swells or looks bluish
- Nothing changes
- --row--

Q: Did any of these come with it? Tick all that apply.
- A rash or blisters in a strip on the arm
- Severe pain for a few days, then weakness
- Swollen glands in the armpit
- An illness or vaccine in the weeks before
- None of these
Ask only if: How did it start? is “It came with a rash, or after an illness or vaccine”, or it has been going on less than 6 weeks with no clear reason

## referral patterns
- Neck (C5 nerve root) → outer upper arm (deltoid patch) | Nerve root pain from the neck | Shoulder joint or rotator cuff: check the shoulder region
- Neck (C6 nerve root) → outer arm and forearm to the thumb and index finger | Nerve root pain from the neck | Carpal tunnel, radial tunnel, tennis elbow
- Neck (C7 nerve root) → back of the arm and forearm to the middle finger | Nerve root pain from the neck | Triceps trigger points, radial nerve
- Neck or upper back (C8–T1) → inner forearm to the little and ring fingers; inner upper arm (T1) | Nerve root pain or thoracic outlet | Ulnar nerve at the elbow; Pancoast tumour; heart (left, with effort)
- Shoulder joint or rotator cuff → outer upper arm, stopping above the elbow | Referred pain from the shoulder | Check the shoulder region
- First rib and scalene muscles (thoracic outlet) → whole arm heavy or tingly, worse with the arm raised or carrying | Thoracic outlet: nerve type (tingling) or vessel type (pale, cold, or swollen arm) | C8 nerve root, ulnar nerve; vessel type needs a doctor first
- Radial nerve in the spiral groove → back and outer upper arm, weak wrist lifting, numb back of the hand | Radial nerve irritation or injury (often after pressure, e.g. sleeping on the arm, or an upper arm fracture) | C7 nerve root; doctor first if the wrist cannot be lifted
- Forearm (nerves, tendons, muscles) → up towards the elbow and upper arm | Check the forearm and elbow files | Radial tunnel, forearm muscle overuse
- Supraspinatus and infraspinatus → outer upper arm; infraspinatus down the front of the arm to the thumb side of the forearm | Muscle trigger point referral from the shoulder | C5–C6 nerve root, biceps tendon
- Scalene muscles → front of the chest, outer arm to the thumb and index finger | Muscle trigger point referral from the neck | C6 nerve root, thoracic outlet
- Pectoralis minor and latissimus dorsi → inner arm to the ring and little fingers | Muscle trigger point referral | C8 nerve root, ulnar nerve, heart
- Biceps and brachialis → front of the upper arm, elbow crease, and (brachialis) the base of the thumb | Muscle trigger point referral or strain | Distal biceps tendon (see the elbow file), C5–C6 nerve root
- Triceps and coracobrachialis → back of the arm, to the elbow and back of the hand | Muscle trigger point referral | C7 nerve root
- Heart → inside of the left arm (T1), with effort | Not musculoskeletal: red flag | Emergency
- Top of the lung (Pancoast) → inner arm to the little finger, sometimes with a drooping eyelid | Not musculoskeletal: red flag | Doctor first
- Veins of the arm (clot) → whole arm aching, swollen, heavy | Not musculoskeletal: red flag | Doctor first, or emergency if short of breath
- Skin nerve (shingles) → a burning band down the arm, before or with a rash | Not musculoskeletal: red flag | Doctor first

## test patients
CASE: Test patient 1
Drawing: Front of the right upper arm
Answers: Age 18 to 29 · After the gym, heavy lifting, or a new workout · Less than 2 weeks; Q1: front of the upper arm (biceps); Q2: lifting, curls, or push-ups; Q6: sore and stiff 1 to 3 days after, then easing
Flags: None
Expect: top condition = Muscle soreness or strain (upper arm); must not show = Nerve root pain from the neck; any physician-first message; route = Results + booking

CASE: Test patient 2
Drawing: Right side of the neck, outer arm and forearm, and the thumb (look-alike)
Answers: Age 30 to 49 · Gradually, no clear reason · 2 to 6 weeks · Subjective S3: Pins and needles or numbness; Q3: it starts at the neck or shoulder and travels down the arm; it runs along a narrow line into particular fingers; Q4: tingling or numbness in the thumb, index, and middle fingers; Q5: moving my neck
Flags: None
Expect: top condition = No arm condition; shows a “this may be coming from your neck” message; must not show = Any arm muscle or forearm condition as the top result; route = Results (suggest neck check) + booking

CASE: Test patient 3
Drawing: Whole right arm, worse at the inner forearm and little finger
Answers: Age 18 to 29 · Gradually, no clear reason · 6 weeks to 3 months; Q2: carrying bags, or letting the arm hang down; lifting my arm up or reaching overhead; Q3: the whole arm feels heavy and tired, especially with it raised; Q7: the arm goes heavy, tingly, or dead
Flags: None
Expect: top condition = Thoracic outlet pattern (nerve type); must not show = Muscle soreness or strain as the top result; route = Results + booking

CASE: Test patient 4
Drawing: Inside of the left upper arm and forearm (look-alike)
Answers: Age 50 to 64 · Gradually, no clear reason · Less than 2 weeks; Q5: none of these bring it on
Flags: “Is the pain in your arm, especially the inside of the left arm, brought on by effort…?”
Expect: top condition = None (no results shown); must not show = Any arm condition; any booking button; route = 911

CASE: Test patient 5
Drawing: Outer right upper arm after a fall
Answers: Age 65 or over · After a fall or a blow to the arm · Less than 2 weeks; Injury screen: I1 “Yes, a fall”; I2 No; I3 No; I4 No; I5 Yes
Flags: Injury screen I5 (cannot lift the wrist)
Expect: top condition = None; see a doctor first; must not show = Any arm condition shown before the physician-first message; route = Physician first
