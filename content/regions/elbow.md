---
# From "Elbow assessment.docx" (Joint wise assessment folder), 25 Sep 2026.
# Built into src/data/symptomGuideExtra.js (elbow) and src/data/injuryScreen.js (elbow screen).
# Conditions: content/conditions/elbow-*.md. Body map: the elbow band (ELBOW_BOTTOM in Body3D.jsx); the forearm uses this region until its own document is built.
# Test patients: npm run check:regions
region: elbow
name: Elbow
source: Lucado AM et al. Lateral elbow pain and muscle function impairments: clinical practice guidelines. JOSPT 52(12), 2022; Coombes BK, Bisset L, Vicenzino B. Management of lateral elbow tendinopathy: one size does not fit all. JOSPT 45(11), 2015; Appelboam A et al. Elbow extension test to rule out elbow fracture: multicentre prospective validation. BMJ 337, 2008; O'Driscoll SW et al. The hook test for distal biceps tendon avulsion. Am J Sports Med 35(11), 2007; O'Driscoll SW et al. The moving valgus stress test for medial collateral ligament tears of the elbow. Am J Sports Med 33(2), 2005; Novak CB et al. Provocative testing for cubital tunnel syndrome. J Hand Surg Am 19(5), 1994; Murphy DR et al. Pain patterns and descriptions in patients with radicular pain. Chiropr Osteopat 17, 2009; Donnelly JM et al. Travell, Simons & Simons' Myofascial Pain and Dysfunction: The Trigger Point Manual, 3rd ed. Wolters Kluwer, 2019
reviewed_by: Chandra Matla, Registered Physiotherapist
# The document says "DRAFT prepared 24 Sep 2026, Reviewed by Chandra on 28 Sep 2026"; Chandra confirmed the review on 25 Sep 2026.
reviewed_on: 2026-09-25
---

## red flags
- Is your elbow hot, red, and swollen, with a fever or feeling very unwell? | emergency | Possible joint infection (septic arthritis)
- Is there a swelling at the point of your elbow that is red, warm, or has a cut or graze over it? | urgent | Possible infected bursa at the back of the elbow
- Did your elbow become suddenly hot, swollen, and very painful overnight, and have you had gout before? | urgent | Possible gout or other crystal arthritis
- Is your hand becoming weaker, is the muscle between your thumb and index finger getting thinner, or can you not lift your wrist? | urgent | Nerve weakness (ulnar or radial nerve) needs medical review
- Do both hands feel numb or clumsy (buttons, writing), or has your walking become unsteady? | urgent | Possible pressure on the spinal cord in the neck: see the neck region
- Are you under 16, and does your elbow hurt with throwing or gymnastics, or has it started to catch or lock? | urgent | Possible growth plate injury or osteochondritis dissecans; needs imaging
- Did a sudden, severe arm pain with no injury last several days, and then your arm or hand muscles became weak? | urgent | Possible nerve inflammation (neuralgic amyotrophy)
- Have you ever had cancer, or is there a lump in your arm that is growing, or pain at night that does not change with position? | urgent | Cancer or a bone lesion needs medical review

## injury screen
<!-- Built into src/data/injuryScreen.js. Asked in order; the first answer that routes ends it. -->
I1 Has your arm or elbow been hurt in a fall, accident, blow, or heavy lift in the last 2 weeks?
- No
- Yes, I fell onto my hand or elbow
- Yes, a blow to the arm or elbow
- Yes, I felt a pop while lifting or pulling
Route: No → skip this screen / Any Yes → I2
Why: Gate question. Keeps the screen to recent injuries

I2 Is the arm or elbow a different shape, or is bone showing through the skin?
Route: Yes → EMERGENCY
Why: Possible fracture or dislocation

I3 Since the injury, is your hand cold, pale, or blue, or is your whole hand numb?
Route: Yes → EMERGENCY
Why: Possible blood vessel or nerve injury

I4 Is the pain in your forearm getting worse and worse, with the forearm tight and swollen, and much worse when your fingers are moved?
Route: Yes → EMERGENCY
Why: Possible compartment syndrome (pressure build-up in the forearm)

I5 Did you feel a pop, click, or tearing at the front of the elbow during a sudden, forceful lift or pull, and now have bruising there or a change in the shape of your biceps?
<!-- Chandra, 25 Sep 2026: same day. Wording widened from the document's "pop ... bruising or a bulge" to take in a click or tearing feeling and a change of shape. Asked only after "I felt a pop while lifting or pulling". -->
Route: Yes → PHYSICIAN FIRST, same day
Why: Possible distal biceps tendon tear; repair works best within about 2 to 3 weeks

I6 After the fall or blow, can you fully straighten your elbow?
- Yes, fully
- No, it will not straighten fully
Route: No → PHYSICIAN FIRST
Why: Not being able to straighten the elbow after an injury raises the chance of a fracture (elbow extension test)


## opening questions
Q: Your age?
- Under 18
- 18 to 29
- 30 to 49
- 50 to 64
- 65 or over

Q: How did it start?
- Gradually, no clear reason
- After a lot of gripping, lifting, or tool or computer use
- After throwing, or a racquet or golf swing
- After a fall onto the hand or elbow
- I felt a pop while lifting or pulling
- Sudden pain and swelling with no injury

Q: How long has it been going on?
- Less than 2 weeks
- 2 to 6 weeks
- 6 weeks to 3 months
- More than 3 months

## questions
Q: Where is the pain mainly?
- Outer elbow, on the bony bump on the thumb side
- Inner elbow, on the bony bump on the little-finger side
- Front of the elbow, in the crease
- Back of the elbow, at the point
- In the forearm or upper arm muscles, not at the elbow itself

Q: Which of these bring it on? Tick all that apply. (Replaces subjective S5 for the arm.)
- Gripping, shaking hands, or lifting a mug or kettle
- Turning a key or screwdriver, or lifting with the palm up
- Throwing, a golf swing, or a racquet shot
- Leaning on my elbow
- Keeping my elbow bent for a long time (phone, sleeping with arm bent)

Q: Which of these do you notice in your hand? Tick all that apply.
- Tingling or numbness in the little and ring fingers
- Tingling or numbness in the thumb, index, and middle fingers
- Weak grip, or dropping things
- Clumsy with fine movements (buttons, coins)
- None of these
Ask only if: The drawing reaches the hand, or the patient ticks “Pins and needles or numbness” (subjective S3)

Q: If you keep your elbow fully bent for a minute (like holding a phone to your ear), what happens?
- Tingling comes on in the little and ring fingers
- The elbow aches, but no tingling
- Nothing changes
- Not sure
Ask only if: Question 3 includes “Tingling or numbness in the little and ring fingers”

Q: How does your elbow move?
- It straightens and bends fully
- It will not straighten fully
- It catches or locks at times
- It clicks or feels unstable
- There is a soft swelling at the point of the elbow

Q: Which hurts more: moving your neck, or using your arm and hand?
- Moving my neck
- Using my arm and hand
- Both about the same
- Neither brings it on
Ask only if: The drawing reaches the neck, shoulder, or hand, or the patient ticks “Pins and needles or numbness” or “Shooting or electric” (subjective S3)

Q: How does the pain spread? Tick all that apply.
- It starts at the neck or shoulder and travels down the arm
- A deep ache in the top of the forearm, a few finger-widths below the outer elbow
- It runs along a narrow line down the forearm into particular fingers
- It stays around the elbow
- It is spread across the whole arm
Ask only if: The drawing covers more than the elbow

Q: If you throw or play racquet sports: which apply? Tick all that apply.
- Pain on the inside of the elbow as my arm goes back to throw
- I felt a pop on the inside of the elbow
- Losing speed or accuracy
- Tingling in the little finger when I throw
- None of these
Ask only if: How did it start? is “After throwing, or a racquet or golf swing”

## referral patterns
- Outer elbow tendons (ECRB) → outer elbow, down the back of the forearm | Lateral elbow pain (tennis elbow) | C6 nerve root, radial tunnel, elbow joint (radiocapitellar)
- Radial tunnel (posterior interosseous nerve) → deep ache 4–5 cm below the outer elbow, into the forearm, without numbness | Radial tunnel syndrome; often sits alongside tennis elbow | Lateral elbow tendinopathy, C6–C7 nerve root
- Inner elbow tendons (common flexor) → inner elbow and inner forearm | Medial elbow pain (golfer's elbow) | Ulnar nerve, inner elbow ligament (UCL), C8–T1 nerve root
- Ulnar nerve at the elbow (cubital tunnel) → inner elbow, inner forearm, little and ring fingers | Ulnar nerve irritation or entrapment | C8 nerve root, thoracic outlet, top of the lung (Pancoast)
- Distal biceps tendon → front of the elbow crease | Distal biceps tendon pain or tear | Brachialis strain, C5–C6 nerve root
- Triceps tendon or olecranon bursa → back of the elbow | Triceps tendon or bursa problem | Infection or gout if hot and swollen
- Neck (C5–C6 nerve root) → outer arm and outer elbow to the thumb and index finger | Nerve root pain from the neck: can look like tennis elbow | Check the neck region when neck movement changes the pain
- Neck (C7 nerve root) → back of the arm and forearm to the middle finger | Nerve root pain from the neck | Check the neck region; triceps trigger points
- Neck or upper back (C8–T1) → inner forearm, inner elbow, little finger | Nerve root pain or thoracic outlet | Ulnar nerve at the elbow; Pancoast tumour
- Shoulder joint or rotator cuff → outer upper arm, stopping above the elbow | Referred pain from the shoulder | Check the shoulder region
- Supraspinatus and infraspinatus → outer upper arm, sometimes the outer elbow; infraspinatus into the thumb side of the forearm | Muscle trigger point referral from the shoulder | Lateral elbow pain, C5–C6 nerve root
- Scalene muscles → outer arm to the thumb and index finger | Muscle trigger point referral from the neck | C6 nerve root, thoracic outlet
- Triceps → back of the arm, and to the outer or inner elbow | Muscle trigger point referral: a tennis or golfer's elbow look-alike | Lateral or medial elbow tendinopathy, C7 nerve root
- Supinator, brachioradialis, and wrist extensors → outer elbow, back of the hand, web of the thumb | Muscle trigger point referral | Tennis elbow, radial tunnel, de Quervain's (wrist)
- Pectoralis minor and serratus posterior superior → inner arm to the ring and little fingers | Muscle trigger point referral | C8 nerve root, ulnar nerve, heart
- Elbow joint (capitellum, radial head, olecranon) → around the joint, with catching, locking, or loss of straightening | Elbow joint problem (arthritis, loose body, osteochondritis in young throwers) | Tendon pain around the elbow
- Inner elbow ligament (UCL) → inner elbow during the late throwing phase | Ligament strain in throwers (moving valgus stress test) | Golfer's elbow, ulnar nerve
- Upper arm and forearm → elbow (muscle strains, nerve and circulation causes) | Check the arm file | Heart, clot, and Pancoast red flags live in the arm file

## test patients
CASE: Test patient 1
Drawing: Outer right elbow and the back of the forearm
Answers: Age 30 to 49 · After a lot of gripping, lifting, or tool or computer use · 6 weeks to 3 months; Q1: outer elbow, on the bony bump on the thumb side; Q2: gripping, shaking hands, or lifting a mug or kettle; Q5: it straightens and bends fully
Flags: None
Expect: top condition = Lateral elbow pain (tennis elbow); must not show = Nerve root pain from the neck; radial tunnel syndrome as the top result; route = Results + booking

CASE: Test patient 2
Drawing: Inner left elbow, inner forearm, and the little and ring fingers
Answers: Age 30 to 49 · Gradually, no clear reason · 2 to 6 weeks · Subjective S3: Pins and needles or numbness; Q2: keeping my elbow bent for a long time; Q3: tingling or numbness in the little and ring fingers; Q4: tingling comes on in the little and ring fingers; Q6: using my arm and hand
Flags: None
Expect: top condition = Ulnar nerve irritation at the elbow (cubital tunnel); must not show = Medial elbow pain (golfer's elbow) as the top result; route = Results + booking

CASE: Test patient 3
Drawing: Right side of the neck, outer arm, outer elbow, and thumb (look-alike)
Answers: Age 30 to 49 · Gradually, no clear reason · 2 to 6 weeks · Subjective S3: Pins and needles or numbness; Q3: tingling or numbness in the thumb, index, and middle fingers; Q6: moving my neck; Q7: it starts at the neck or shoulder and travels down the arm
Flags: None
Expect: top condition = No elbow condition; shows a “this may be coming from your neck” message; must not show = Lateral elbow pain as the top result; route = Results (suggest neck check) + booking

CASE: Test patient 4
Drawing: Inner right elbow (throwing arm)
Answers: Age under 18 · After throwing, or a racquet or golf swing · 2 to 6 weeks; Q1: inner elbow, on the bony bump on the little-finger side; Q5: it catches or locks at times; Q8: pain on the inside of the elbow as my arm goes back to throw
Flags: “Are you under 16, and does your elbow hurt with throwing or gymnastics, or has it started to catch or lock?”
Expect: top condition = None; see a doctor first; must not show = Golfer's elbow or any tendinopathy result without the physician-first message; route = Physician first

CASE: Test patient 5
Drawing: Front of the right elbow
Answers: Age 30 to 49 · I felt a pop while lifting or pulling · Less than 2 weeks; Injury screen: I1 “Yes, I felt a pop while lifting or pulling”; I2 No; I3 No; I4 No; I5 Yes
Flags: Injury screen I5 (possible distal biceps tear)
Expect: top condition = None; see a doctor first; must not show = Any tendinopathy result shown before the physician-first message; route = Physician first

CASE: Test patient 6
Drawing: Whole left elbow after a fall
Answers: Age 18 to 29 · After a fall onto the hand or elbow · Less than 2 weeks; Injury screen: I1 “Yes, I fell onto my hand or elbow”; I2 to I5 No; I6 “No, it will not straighten fully”
Flags: Injury screen I6 (cannot straighten the elbow)
Expect: top condition = None; see a doctor first; must not show = Results + booking without the physician-first message; route = Physician first
