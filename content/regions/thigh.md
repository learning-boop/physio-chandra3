---
# From "Thigh assessment.docx" (Joint wise assessment folder), 25 Sep 2026.
# Built into src/data/symptomGuideExtra.js (thigh, question ids R1 to R8) and src/data/injuryScreen.js (thigh screen).
# Conditions: content/conditions/thigh-*.md. Body map: the thigh band (THIGH_TOP_FRONT, THIGH_TOP_BACK and KNEE_TOP in Body3D.jsx).
# Test patients: npm run check:regions
region: thigh
name: Thigh
source: Martin RL et al. Hamstring strain injury in athletes: clinical practice guidelines. JOSPT 52(3), 2022; Mueller-Wohlfahrt HW et al. Terminology and classification of muscle injuries in sport: the Munich consensus statement. Br J Sports Med 47(6), 2013; Pollock N et al. British athletics muscle injury classification. Br J Sports Med 48(18), 2014; Askling CM et al. Acute first-time hamstring strains during high-speed running. Am J Sports Med 35(2), 2007; Kary JM. Diagnosis and management of quadriceps strains and contusions. Curr Rev Musculoskelet Med 3, 2010; Harney D, Patijn J. Meralgia paresthetica: diagnosis and management strategies. Pain Med 8(8), 2007; Lesher JM et al. Hip joint pain referral patterns: a descriptive study. Pain Med 9(1), 2008; Murphy DR et al. Pain patterns and descriptions in patients with radicular pain. Chiropr Osteopat 17, 2009; Donnelly JM et al. Travell, Simons & Simons' Myofascial Pain and Dysfunction: The Trigger Point Manual, 3rd ed. Wolters Kluwer, 2019
reviewed_by: Chandra Matla, Registered Physiotherapist
# The document still says "DRAFT prepared 24 Sep 2026, awaiting Chandra's review"; Chandra confirmed the review on 25 Sep 2026.
reviewed_on: 2026-09-25
---

## red flags
- Is your thigh or calf swollen, warm, or tender, and are you also short of breath, or have chest pain or are coughing blood? | emergency | Possible blood clot that has travelled to the lung
- Is your thigh pain getting worse and worse, with the thigh tense and swollen, especially after a heavy knock or crush? | emergency | Possible compartment syndrome of the thigh
- After very hard exercise, is your thigh hugely swollen and very painful, and is your urine dark like cola? | emergency | Possible muscle breakdown (rhabdomyolysis), which can damage the kidneys
- Is there a hot, red area on your thigh that is spreading fast, with pain far worse than it looks, or feeling very unwell? | emergency | Possible severe skin and tissue infection
- Do you have new numbness between your legs or around your bottom, or new trouble passing urine or controlling your bowels? | emergency | Possible cauda equina syndrome
- Is your thigh or calf swollen, warm, or tender, especially after surgery, a long journey, time in bed, a cast, or starting the pill? | urgent | Possible blood clot (DVT); same-day review
- Is there spreading redness, a red streak up the leg, or a hot, swollen area, with a fever? | urgent | Possible skin infection (cellulitis); same-day review
- Do you run or train hard, and do you have a deep, aching thigh pain that is worse with hopping, or aches at night? | urgent | Possible stress fracture of the thigh bone; needs imaging before more running
- Are you under 25 with a deep thigh ache that wakes you at night, or a lump or swelling in the thigh that is growing? | urgent | Bone or soft-tissue lumps in the thigh need imaging to rule out a tumour
- Is a child aged about 9 to 16 limping, with pain in the thigh or knee? | urgent | Possible slipped growth plate at the hip (SUFE), often felt in the thigh or knee
- Do you get a cramping pain in the thigh or buttock when walking that eases within minutes of standing still, and do you smoke or have diabetes? | urgent | Possible narrowed leg arteries (vascular claudication)
- Has your thigh muscle become weak or thin, or does your knee give way, with no injury? | urgent | Nerve weakness (femoral nerve or L3–L4) needs medical review
- Have you ever had cancer, or do you have deep thigh pain at night that does not change with position, with weight loss? | urgent | Cancer can spread to the thigh bone

## injury screen
<!-- Built into src/data/injuryScreen.js. Asked in order; the first answer that routes ends it. -->
I1 Has your thigh been hurt in the last 6 weeks?
- No
- Yes, a sudden sharp pain while sprinting, kicking, or stretching
- Yes, a hard knock to the thigh (knee, tackle, fall onto it)
- Yes, a fall or accident
Route: No → skip this screen / Any Yes → I2
Why: Gate question

I2 Is the thigh a different shape, can you not stand on the leg, or was it a high-speed crash or a fall from a height?
Route: Yes → EMERGENCY
Why: Possible thigh bone (femur) fracture

I3 After a knock: is the thigh getting tighter and more painful by the hour, rather than settling?
Route: Yes → EMERGENCY
Why: Possible compartment syndrome

I4 Did you feel a pop or tearing high in the back of the thigh or buttock, with a large bruise, or a gap you can feel under the sit bone?
Route: Yes → PHYSICIAN FIRST
Why: Possible hamstring tendon tear from the sit bone; repair works best within weeks

I5 Since the injury, can you not walk without limping badly, or bend your knee more than halfway?
Route: Yes → PHYSICIAN FIRST
Why: Severe muscle tear or deep bruise; needs assessment

I6 A few weeks after a knock, is there a hard lump in the thigh muscle, and is the knee still stiff?
Route: Yes → PHYSICIAN FIRST
Why: Possible bone forming in the muscle after a bruise (myositis ossificans); needs imaging


## opening questions
Q: Your age?
- Under 18
- 18 to 29
- 30 to 49
- 50 to 64
- 65 or over

Q: How did it start?
- Gradually, no clear reason
- A sudden sharp pain while sprinting or kicking
- A sudden pain while stretching, dancing, or doing the splits
- After a hard knock to the thigh
- After increasing running or training
- After a new or harder workout

Q: How long has it been going on?
- Less than 2 weeks
- 2 to 6 weeks
- 6 weeks to 3 months
- More than 3 months

## questions
<!-- Question ids on the site: R1 to R8. -->
Q: Where is the pain mainly?
- Front of the thigh
- Back of the thigh
- Inner thigh
- Outer thigh
- Burning or numb patch on the front and outer thigh

Q: Which of these bring it on? Tick all that apply. (Replaces subjective S5 for the thigh.)
- Sprinting, kicking, or jumping
- Stretching, or bending forward with straight legs
- Sitting for a long time
- Walking a distance, easing when I sit or bend forward
- Standing or walking, easing when I sit, with tight belts or trousers making it worse

Q: About the muscle: which apply? Tick all that apply.
- Sore and stiff 1 to 3 days after exercise, then easing
- A sudden sharp pain during activity, with bruising after
- A tender spot in the muscle that sends pain elsewhere when pressed
- A deep bruise after a knock
- None of these

Q: Since the injury, how far can you bend your knee (lying on your front, heel towards your bottom)?
- Fully, or nearly fully
- More than halfway
- Less than halfway
- I have not tried
Ask only if: How did it start? is “After a hard knock to the thigh”

Q: Which of these do you notice? Tick all that apply.
- Pins and needles or numbness in the leg or foot
- Pain goes below the knee
- A burning or numb patch on the outer thigh, with no weakness
- Weakness: the knee gives way on stairs
- None of these
Ask only if: The drawing reaches below the knee or above the thigh, or the patient ticks “Pins and needles or numbness” or “Shooting or electric” (subjective S3)

Q: Which hurts more: moving your low back, moving your hip, or using the thigh muscle?
- Moving my low back
- Moving my hip
- Using the thigh muscle (running, kicking, stretching)
- None of these bring it on
Ask only if: The drawing includes the low back, buttock, or groin, or Question 5 is not “None of these”

Q: When walking, what happens?
- A cramp in the thigh or buttock that eases within minutes of standing still
- Leg pain that eases when I sit or bend forward
- No change with walking
Ask only if: Question 2 includes “Walking a distance, easing when I sit or bend forward”, or age 50 or over

Q: Is there any swelling or lump?
- Swelling and bruising after an injury
- A hard lump in the muscle weeks after a knock
- A lump that is growing, with no injury
- The whole thigh or calf is swollen
- No swelling or lump

## referral patterns
- Hamstring muscles → back of the thigh; high tears near the sit bone | Hamstring strain (sprinting type in the muscle belly; stretching type high near the sit bone, with slower recovery) | Deep gluteal pain, S1 nerve root, proximal hamstring tendon (hip file)
- Quadriceps (rectus femoris, vastus) → front of the thigh | Quadriceps strain, or deep bruise (“dead leg”) after a knock | Femoral nerve, L3–L4 nerve root, hip joint
- Adductor muscles → inner thigh | Adductor strain | Hip joint, obturator nerve (see the hip file)
- Thigh bone (femur) → deep, poorly localised thigh ache, worse with loading or at night | Possible stress fracture (runners) or bone lesion | Muscle pain; doctor first
- Lateral femoral cutaneous nerve → burning or numb patch on the front and outer thigh, no weakness | Meralgia paraesthetica (tight belts, pregnancy, weight change) | L2–L3 nerve root, gluteus minimus and TFL trigger points
- Femoral nerve → front of the thigh, with weak knee straightening | Femoral nerve irritation (after surgery, bleeding in the groin, diabetes) | L3–L4 nerve root; doctor first if weak
- Saphenous nerve → inner knee and inner shin, with a burning or numb patch | Saphenous nerve irritation | L4 nerve root, knee joint
- Obturator nerve → inner thigh to the knee | Obturator nerve irritation | Adductor strain, hip joint
- Hip joint → front of the thigh (57%), groin, buttock; knee via the obturator nerve | Referred pain from the hip joint: see the hip file (Lesher 2008) | Quadriceps or adductor strain
- Low back joints and discs (L1–L3) → front of the thigh and groin; (L4–S1) → outer and back of the thigh | Referred pain from the low back: see the low back file. Can reach below the knee without a nerve root | Muscle strain
- L2–L4 nerve roots → front and inner thigh to the knee (L4 to the inner shin), with nerve-type symptoms | Nerve root pain from the low back | Meralgia paraesthetica, femoral nerve, hip joint
- L5–S1 nerve roots → outer or back of the thigh, below the knee, with nerve-type symptoms | Nerve root pain from the low back (sciatica) | Hamstring strain, deep gluteal pain, gluteus minimus
- Sacroiliac joint → buttock and back of the thigh | Sacroiliac joint pain: see the SI file | Hamstring origin, lumbar joints
- Thoracolumbar junction (T12–L1) → groin, upper inner thigh, outer hip | Referred pain from the thoracolumbar junction: see the TL file | Adductor strain, hernia
- Gluteus minimus → outer and back of the thigh and calf, to the ankle | Muscle trigger point referral (“pseudo-sciatica”) | L5 or S1 nerve root
- Tensor fascia lata → outer thigh to the knee | Muscle trigger point referral | ITB, meralgia paraesthetica
- Piriformis → buttock and back of the thigh | Muscle trigger point referral, or deep gluteal syndrome | S1 nerve root, hamstring strain
- Vastus medialis and lateralis → inner or outer knee, front of the thigh | Muscle trigger point referral | Knee joint, patellofemoral pain
- Adductor longus and brevis → groin, inner thigh down to the knee | Muscle trigger point referral | Hip joint, obturator nerve
- Iliopsoas → vertical band beside the lumbar spine, front of the thigh | Muscle trigger point referral | L2–L3 nerve root, hip joint
- Leg veins (clot) → thigh or calf swollen, warm, tender | Not musculoskeletal: red flag | Doctor first, or emergency if short of breath
- Leg arteries → thigh or buttock cramp on walking, easing within minutes of standing still | Not musculoskeletal: vascular claudication (lumbar stenosis eases with sitting or bending instead) | Doctor first
- Kidney, ureter, and pelvic organs → groin and upper inner thigh | Not musculoskeletal: red flag | Doctor first

## test patients
CASE: Test patient 1
Drawing: Back of the right thigh, middle
Answers: Age 18 to 29 · A sudden sharp pain while sprinting or kicking · Less than 2 weeks; Injury screen: I1 “Yes, a sudden sharp pain while sprinting”; I2 to I6 No; Q1: back of the thigh; Q2: sprinting, kicking, or jumping; stretching; Q3: a sudden sharp pain during activity, with bruising after
Flags: None
Expect: top condition = Hamstring strain; must not show = L5–S1 nerve root pain; proximal hamstring tendon tear; route = Results + booking

CASE: Test patient 2
Drawing: Front of the left thigh after a knee to the thigh in football
Answers: Age 18 to 29 · After a hard knock to the thigh · Less than 2 weeks; Injury screen: I1 “Yes, a hard knock”; I2 to I6 No; Q3: a deep bruise after a knock; Q4: more than halfway
Flags: None
Expect: top condition = Quadriceps contusion (“dead leg”); must not show = Quadriceps strain as the top result; any physician-first message; route = Results + booking

CASE: Test patient 3
Drawing: Front and outer right thigh
Answers: Age 30 to 49 · Gradually, no clear reason · 6 weeks to 3 months; Q1: burning or numb patch on the front and outer thigh; Q2: standing or walking, easing when I sit, with tight belts or trousers making it worse; Q5: a burning or numb patch on the outer thigh, with no weakness
Flags: None
Expect: top condition = Meralgia paraesthetica; must not show = L2–L3 nerve root pain as the top result; route = Results + booking

CASE: Test patient 4
Drawing: Low back and the outer and back of the left thigh, into the calf (look-alike)
Answers: Age 30 to 49 · Gradually, no clear reason · 2 to 6 weeks · Subjective S3: Shooting or electric; Q1: back of the thigh; Q5: pins and needles or numbness in the leg or foot; pain goes below the knee; Q6: moving my low back
Flags: None
Expect: top condition = No thigh condition; shows a “this may be coming from your low back” message; must not show = Hamstring strain as the top result; route = Results (suggest low back check) + booking

CASE: Test patient 5
Drawing: Whole right thigh and calf, a week after knee surgery
Answers: Age 50 to 64 · Gradually, no clear reason · Less than 2 weeks; Q8: the whole thigh or calf is swollen
Flags: “Is your thigh or calf swollen, warm, or tender, especially after surgery…?”
Expect: top condition = None; see a doctor first (same day); must not show = Any muscle result without the physician-first message; route = Physician first

CASE: Test patient 6
Drawing: Deep ache in the front of the left thigh
Answers: Age 18 to 29 · After increasing running or training · 2 to 6 weeks; Q1: front of the thigh
Flags: “Do you run or train hard, and do you have a deep, aching thigh pain that is worse with hopping, or aches at night?”
Expect: top condition = None; see a doctor first; must not show = Quadriceps strain without the physician-first message; route = Physician first
