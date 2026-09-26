---
# From "Hip assessment.docx" (Joint wise assessment folder), 25 Sep 2026.
# Built into src/data/symptomGuideExtra.js (hip, question ids G1 to G8) and src/data/injuryScreen.js (hip screen).
# Conditions: content/conditions/hip-*.md. Body map: the hip band (hip + side in Body3D.jsx classify()).
# Test patients: npm run check:regions
region: hip
name: Hip & groin
source: Cibulka MT et al. Hip pain and mobility deficits: hip osteoarthritis, revision 2017. JOSPT 47(6), 2017; Enseki KR et al. Hip pain and movement dysfunction associated with nonarthritic hip joint pain: a revision. JOSPT 53(7), 2023; Griffin DR et al. The Warwick Agreement on femoroacetabular impingement syndrome. Br J Sports Med 50, 2016; Grimaldi A et al. Gluteal tendinopathy: a review of mechanisms, assessment and management. Sports Med 45(8), 2015; Weir A et al. Doha agreement meeting on terminology and definitions in groin pain in athletes. Br J Sports Med 49, 2015; Lesher JM et al. Hip joint pain referral patterns: a descriptive study. Pain Med 9(1), 2008; Peck DM et al. Slipped capital femoral epiphysis: diagnosis and management. Am Fam Physician 95(12), 2017; Finucane LM et al. International Framework for Red Flags for Potential Serious Spinal Pathologies. JOSPT 50(7), 2020; Donnelly JM et al. Travell, Simons & Simons' Myofascial Pain and Dysfunction: The Trigger Point Manual, 3rd ed. Wolters Kluwer, 2019
reviewed_by: Chandra Matla, Registered Physiotherapist
# The document still says "DRAFT prepared 24 Sep 2026, awaiting Chandra's review"; Chandra confirmed the review on 25 Sep 2026.
reviewed_on: 2026-09-25
---

## red flags
- Do you have a sudden, severe pain in your back, tummy, or groin, with a pulsing feeling in your tummy, or feeling faint or sweaty? | emergency | Possible leaking abdominal aortic aneurysm (higher risk over 60 and in smokers)
- Is your hip very painful with a fever, and can you not put weight on the leg (or is a child suddenly refusing to walk and feverish)? | emergency | Possible joint infection (septic arthritis)
- Could you be pregnant, and do you have sudden one-sided pain low in your tummy or groin, bleeding, or feeling faint? | emergency | Possible ectopic pregnancy
- Do you have sudden, severe pain in a testicle? | emergency | Possible testicular torsion
- Is there a lump in your groin that is hard, very painful, will not go back in, and are you vomiting? | emergency | Possible trapped (strangulated) hernia
- Do you have new numbness between your legs or around your bottom, or new trouble passing urine or controlling your bowels? | emergency | Possible cauda equina syndrome
- Is a child aged about 9 to 16 limping, with pain in the hip, groin, thigh, or knee? | urgent | Possible slipped growth plate at the hip (SUFE); hip problems in children are often felt at the knee
- Do you run or train hard, and do you have a deep groin ache that is worse with running or hopping, or aches at night? | urgent | Possible stress fracture of the hip (femoral neck); needs imaging before more running
- Do you take long-term steroid tablets, drink heavily, or have sickle cell disease, and have a deep groin ache? | urgent | Possible loss of blood supply to the hip bone (avascular necrosis)
- Is your leg swollen, warm, or tender in the calf or thigh, especially after surgery, a long journey, or time in bed? | urgent | Possible blood clot (DVT); emergency if you are also short of breath
- Is there a soft lump in your groin that appears when you cough, strain, or stand? | urgent | Possible hernia
- Does the pain come in waves from your side to your groin, or come with burning when you pass urine or blood in your urine? | urgent | Possible kidney stone or infection
- Is the groin pain linked to your periods, or do you have unusual vaginal bleeding or discharge? | urgent | Pelvic organ problems can be felt in the groin and inner thigh
- Have you ever had cancer, or do you have deep pain at night that does not change with position, with weight loss? | urgent | Cancer can spread to the pelvis and hip

## injury screen
<!-- Built into src/data/injuryScreen.js. Asked in order; the first answer that routes ends it. -->
I1 Has your hip or groin been hurt in the last 6 weeks?
- No
- Yes, I fell onto my hip
- Yes, a car or other vehicle accident
- Yes, a twist or tackle in sport
- Yes, I felt a pop or pull while sprinting, kicking, or doing the splits
Route: No → skip this screen / Any Yes → I2
Why: Gate question

I2 Since the fall or accident, can you not stand or walk on the leg, or does the leg look shorter or turned out?
Route: Yes → EMERGENCY
Why: Possible hip fracture or dislocation

I3 Was it a high-speed crash, or a fall from higher than a few stairs?
Route: Yes → EMERGENCY
Why: High-energy injury: possible pelvic or hip fracture

I4 After a minor fall, can you walk but with groin pain when you put weight on the leg, and are you 65 or over or have osteoporosis?
Route: Yes → PHYSICIAN FIRST
Why: Possible hidden hip or pelvic fracture: these are often missed on the first X-ray

I5 Did you feel a pop in the buttock or back of the thigh (splits, water-skiing, slipping), with a large bruise after?
Route: Yes → PHYSICIAN FIRST
Why: Possible hamstring tendon tear from the sit bone; repair works best within weeks

I6 Are you under 18, and did you feel a pop at the front or side of the hip while sprinting or kicking?
Route: Yes → PHYSICIAN FIRST
Why: Possible growth plate avulsion fracture


## opening questions
Q: Your age?
- Under 18
- 18 to 29
- 30 to 49
- 50 to 64
- 65 or over

Q: How did it start?
- Gradually, no clear reason
- After increasing running or sport
- After a long walk, standing, or lying on my side
- A sudden twist, kick, or change of direction
- After a fall
- During pregnancy, or since having a baby

Q: How long has it been going on?
- Less than 2 weeks
- 2 to 6 weeks
- 6 weeks to 3 months
- More than 3 months

## questions
<!-- Question ids on the site: G1 to G8. -->
Q: Where is the pain mainly?
- Groin, or the front of the hip
- Outer hip, over the bony point at the side
- Buttock
- Inner thigh, close to the groin
- Burning or numb patch on the front and outer thigh

Q: Which of these bring it on? Tick all that apply. (Replaces subjective S5 for the hip.)
- Lying on that side at night
- Putting on socks and shoes, or getting in and out of a car
- Sitting in a low chair, or deep squatting
- Climbing stairs, or standing on that leg
- Walking a distance, easing when I sit or bend forward

Q: Which of these apply? Tick all that apply.
- Stiff in the morning for less than an hour, then it eases
- Stiff after sitting, then eases after a few steps
- Clicking, catching, or locking deep in the groin
- The hip gives way
- None of these

Q: If you show someone where it hurts, what does your hand do?
- Grips the side of my hip in a “C” shape, thumb at the back and fingers in the groin
- Points to one spot on the outer hip
- Points into the groin
- Points to my buttock or low back

Q: If it came on with sport (kicking, sprinting, changing direction): which apply? Tick all that apply.
- Pain where the inner thigh muscle meets the pubic bone
- Pain just above the groin crease, worse with coughing or sit-ups
- Pain at the front of the hip when lifting my knee
- Deep pain in the hip joint with twisting
- Pain in the middle, over the pubic bone
Ask only if: How did it start? is “After increasing running or sport” or “A sudden twist, kick, or change of direction”

Q: Which of these do you notice in the leg? Tick all that apply.
- Pain below the knee
- Pins and needles or numbness in the leg or foot
- A burning or numb patch on the outer thigh, with no weakness
- Knee pain, with the hip hardly hurting
- None of these
Ask only if: The drawing reaches below the thigh, or the patient ticks “Pins and needles or numbness” or “Shooting or electric” (subjective S3)

Q: Which hurts more: moving your low back, or moving your hip (bending it up, turning the leg in and out)?
- Moving my low back
- Moving my hip
- Both about the same
- Neither brings it on
Ask only if: The drawing includes the low back or buttock, or Question 6 is not “None of these”

Q: Does any of these come with the groin pain? Tick all that apply.
- Pain linked to my periods
- Burning when I pass urine, or blood in my urine
- A lump in the groin when I cough or stand
- Testicle pain
- None of these
Ask only if: Question 1 is “Groin, or the front of the hip” or “Inner thigh, close to the groin”

## referral patterns
- Hip joint (arthritis, FAI, labrum) → buttock (71%), thigh (57%), groin (55%); below the knee in about 1 in 5; knee via the obturator nerve | Hip joint pain (Lesher 2008). The “C” sign suggests the joint | L2–L4 nerve root, sacroiliac joint, hernia
- Gluteal tendons and trochanteric bursa → outer hip, down the outer thigh, usually not below the knee | Gluteal tendinopathy (greater trochanteric pain) | L4–L5 nerve root, thoracolumbar junction (Maigne), gluteus minimus trigger points
- Adductor origin → inner thigh near the pubic bone | Adductor-related groin pain (Doha) | Obturator nerve, hip joint, pubic bone
- Iliopsoas → front of the hip, sometimes snapping | Iliopsoas-related groin pain | Hip joint, L2 nerve root
- Inguinal canal → just above the groin crease, worse with coughing or sit-ups | Inguinal-related groin pain, or hernia | Adductor, hip joint
- Pubic symphysis → centre front, over the pubic bone | Pubic-related groin pain (osteitis pubis); pelvic girdle pain in pregnancy | Adductor, bladder
- Hamstring origin → sit bone, worse with sitting and bending | Proximal hamstring tendinopathy | Deep gluteal pain, S1 nerve root
- Deep gluteal space (piriformis, sciatic nerve) → middle of the buttock, down the back of the thigh | Deep gluteal syndrome | S1 nerve root, hamstring origin
- Lateral femoral cutaneous nerve → burning or numb patch on the front and outer thigh, no weakness | Meralgia paraesthetica (tight belts, pregnancy, weight change) | L2–L3 nerve root
- Obturator nerve → inner thigh down to the knee | Obturator nerve irritation | Adductor strain, hip joint
- Low back joints and discs (L1–L3) → groin and front of the thigh; (L4–L5) → buttock, outer hip, and thigh | Referred pain from the low back: see the low back file | Hip joint, gluteal tendinopathy
- L2–L4 nerve roots → front of the thigh to the knee, with nerve-type symptoms | Nerve root pain from the low back | Hip joint, meralgia paraesthetica
- Sacroiliac joint → buttock, thigh, groin in about 1 in 7 | Sacroiliac joint pain: see the SI file | Hip joint
- Thoracolumbar junction (T12–L1) → groin, outer hip, top of the hip bone | Referred pain from the thoracolumbar junction: see the TL file | Gluteal tendinopathy, hernia
- Gluteus medius → back of the hip bone, sacroiliac joint, outer buttock | Muscle trigger point referral | Sacroiliac joint, gluteal tendinopathy
- Gluteus minimus → outer and back of the thigh and calf, to the ankle | Muscle trigger point referral (“pseudo-sciatica”) | L5 or S1 nerve root
- Tensor fascia lata → outer thigh to the knee | Muscle trigger point referral | Gluteal tendinopathy, ITB
- Quadratus lumborum → top of the hip bone, outer hip | Muscle trigger point referral | Lumbar joints, kidney
- Adductor longus and brevis → groin, inner thigh down to the knee | Muscle trigger point referral | Hip joint, obturator nerve
- Kidney or ureter → loin to the groin, in waves | Not musculoskeletal: red flag | Doctor first
- Ovary, fallopian tube, uterus (including ectopic pregnancy, endometriosis) → groin, lower tummy, inner thigh | Not musculoskeletal: red flag | Doctor first, or emergency if pregnant with sudden pain
- Testicle or prostate → groin and inner thigh | Not musculoskeletal: red flag | Doctor first, or emergency for sudden testicle pain
- Aorta and leg arteries → buttock or thigh cramp on walking that eases standing still | Not musculoskeletal: vascular claudication (lumbar stenosis eases with sitting or bending instead) | Doctor first
- Hernia → groin lump when coughing or standing | Not musculoskeletal: red flag | Doctor first, or emergency if hard, painful, and will not go back

## test patients
CASE: Test patient 1
Drawing: Outer right hip, over the bony point
Answers: Age 50 to 64 · Gradually, no clear reason · 6 weeks to 3 months; Q1: outer hip, over the bony point at the side; Q2: lying on that side at night; climbing stairs, or standing on that leg; Q4: points to one spot on the outer hip
Flags: None
Expect: top condition = Gluteal tendinopathy (greater trochanteric pain); must not show = Hip osteoarthritis as the top result; L5 nerve root pain; route = Results + booking

CASE: Test patient 2
Drawing: Left groin and front of the thigh
Answers: Age 65 or over · Gradually, no clear reason · More than 3 months; Q1: groin, or the front of the hip; Q2: putting on socks and shoes, or getting in and out of a car; Q3: stiff in the morning for less than an hour; Q4: grips the side of my hip in a “C” shape
Flags: None
Expect: top condition = Hip osteoarthritis; must not show = Gluteal tendinopathy as the top result; route = Results + booking

CASE: Test patient 3
Drawing: Right groin
Answers: Age 18 to 29 · After increasing running or sport · 6 weeks to 3 months; Q1: groin, or the front of the hip; Q2: sitting in a low chair, or deep squatting; Q3: clicking, catching, or locking deep in the groin; Q4: grips the side of my hip in a “C” shape; Q5: deep pain in the hip joint with twisting
Flags: None
Expect: top condition = FAI syndrome or labral-related hip pain; must not show = Adductor-related groin pain as the top result; route = Results + booking

CASE: Test patient 4
Drawing: Low back, right buttock, and front of the right thigh (look-alike)
Answers: Age 50 to 64 · Gradually, no clear reason · 2 to 6 weeks · Subjective S3: Pins and needles or numbness; Q1: buttock; Q6: pins and needles or numbness in the leg or foot; Q7: moving my low back
Flags: None
Expect: top condition = No hip condition; shows a “this may be coming from your low back” message; must not show = Hip osteoarthritis or gluteal tendinopathy as the top result; route = Results (suggest low back check) + booking

CASE: Test patient 5
Drawing: Deep in the right groin
Answers: Age 18 to 29 · After increasing running or sport · 2 to 6 weeks; Q1: groin, or the front of the hip
Flags: “Do you run or train hard, and do you have a deep groin ache that is worse with running or hopping, or aches at night?”
Expect: top condition = None; see a doctor first; must not show = FAI syndrome or any sport result without the physician-first message; route = Physician first

CASE: Test patient 6
Drawing: Left hip and groin after a fall at home
Answers: Age 65 or over · After a fall · Less than 2 weeks; Injury screen: I1 “Yes, I fell onto my hip”; I2 Yes
Flags: Injury screen I2 (cannot stand, leg looks shorter or turned out)
Expect: top condition = None (no results shown); must not show = Any hip condition; any booking button; route = 911
