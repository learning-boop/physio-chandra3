---
# From "Knee assessment.docx" (Joint wise assessment folder), 25 Sep 2026.
# Built into src/data/symptomGuide.js (knee, question ids K1 to K8) and src/data/injuryScreen.js (knee screen, Ottawa knee rule adapted).
# Conditions: content/conditions/knee-*.md. Body map: the knee band (KNEE_TOP in Body3D.jsx).
# Test patients: npm run check:regions
region: knee
name: Knee
source: Willy RW et al. Patellofemoral pain: clinical practice guidelines. JOSPT 49(9), 2019; Logerstedt DS et al. Knee pain and mobility impairments: meniscal and articular cartilage lesions, revision 2018. JOSPT 48(2), 2018; Logerstedt DS et al. Knee stability and movement coordination impairments: knee ligament sprain, revision 2017. JOSPT 47(11), 2017; Stiell IG et al. Prospective validation of a decision rule for the use of radiography in acute knee injuries (Ottawa knee rule). JAMA 275(8), 1996; NICE NG226. Osteoarthritis in over 16s: diagnosis and management, 2022; Malliaras P et al. Patellar tendinopathy: clinical diagnosis, load management, and advice for challenging case presentations. JOSPT 45(11), 2015; Peck DM et al. Slipped capital femoral epiphysis: diagnosis and management. Am Fam Physician 95(12), 2017; Lesher JM et al. Hip joint pain referral patterns: a descriptive study. Pain Med 9(1), 2008; Donnelly JM et al. Travell, Simons & Simons' Myofascial Pain and Dysfunction: The Trigger Point Manual, 3rd ed. Wolters Kluwer, 2019
reviewed_by: Chandra Matla, Registered Physiotherapist
# The document still says "DRAFT prepared 24 Sep 2026, awaiting Chandra's review"; Chandra confirmed the review on 25 Sep 2026.
reviewed_on: 2026-09-25
---

## red flags
- Is your knee hot, red, and swollen, with a fever or feeling unwell, especially after an injection, surgery, or a cut? | emergency | Possible joint infection (septic arthritis)
- Is your calf or thigh swollen, warm, or tender, and are you also short of breath, or have chest pain or are coughing blood? | emergency | Possible blood clot that has travelled to the lung
- Do you have new numbness between your legs or around your bottom, or new trouble passing urine or controlling your bowels? | emergency | Possible cauda equina syndrome
- Is your calf swollen, warm, or tender, especially after surgery, a long journey, time in bed, a cast, or starting the pill? | urgent | Possible blood clot (DVT). A burst cyst at the back of the knee looks the same and also needs checking
- Do you have a knee replacement, and is it newly painful, warm, swollen, or is the wound red or leaking? | urgent | Possible infection or loosening of the replacement
- Is a child aged about 9 to 16 limping with knee or thigh pain, or does moving the hip hurt? | urgent | Possible slipped growth plate at the hip (SUFE): hip problems in children are often felt only at the knee
- Is a child aged about 4 to 10 limping, with knee or hip pain, but no injury? | urgent | Possible Perthes disease or other hip problem felt at the knee
- Are you under 25 with a deep ache around the knee that wakes you at night, or a lump near the knee that is growing? | urgent | Bone tumours in young people are most common around the knee; needs imaging
- Did your knee become suddenly hot, swollen, and very painful overnight, and have you had gout or “pseudogout” before? | urgent | Possible gout or other crystal arthritis
- Are other joints swollen too, or is the knee swollen with a rash, psoriasis, eye inflammation, or after a stomach bug or sexually transmitted infection? | urgent | Possible inflammatory or reactive arthritis
- Is there a pulsing lump behind your knee, or a cramping calf pain on walking that eases within minutes of standing still? | urgent | Possible artery problem (popliteal aneurysm or narrowed arteries)
- Have you ever had cancer, or do you have deep knee pain at night that does not change with position, with weight loss? | urgent | Cancer can spread to the bones around the knee

## injury screen
<!-- Built into src/data/injuryScreen.js. Asked in order; the first answer that routes ends it. -->
I1 Has your knee been hurt in the last 6 weeks?
- No
- Yes, a twist or pivot in sport
- Yes, a blow to the knee (tackle, car dashboard)
- Yes, a fall onto the knee
- Yes, the kneecap slipped out of place
Route: No → skip this screen / Any Yes → I2
Why: Gate question

I2 Is the knee out of shape, or is the kneecap still out of place?
Route: Yes → EMERGENCY
Why: Possible knee or kneecap dislocation that has not gone back

I3 Since the injury, is your foot cold, pale, or numb?
Route: Yes → EMERGENCY
Why: Possible artery or nerve injury after a knee dislocation

I4 Are you 55 or over, or could you not take 4 steps straight after the injury (and still cannot), or can you not bend the knee to a right angle?
Route: Yes → PHYSICIAN FIRST
Why: Ottawa knee rule: an X-ray is needed to rule out a fracture

I5 Did you hear or feel a pop, and did the knee swell up within 2 hours?
Route: Yes → PHYSICIAN FIRST
Why: Quick swelling means bleeding in the joint: possible ACL tear or fracture

I6 Is the knee stuck, so you cannot straighten it fully?
Route: Yes → PHYSICIAN FIRST
Why: Possible locked knee from a torn meniscus (bucket-handle tear); needs an early surgical opinion

I7 Did the kneecap pop out and go back in?
Route: Yes → PHYSICIAN FIRST
Why: First kneecap dislocation: imaging to check for a loose bone or cartilage fragment


## opening questions
Q: Your age?
- Under 18
- 18 to 29
- 30 to 49
- 50 to 64
- 65 or over

Q: How did it start?
- Gradually, no clear reason
- A twist or pivot in sport
- After a fall or a blow to the knee
- After increasing running or jumping
- After a lot of kneeling or squatting
- After knee surgery or a knee replacement

Q: How long has it been going on?
- Less than 2 weeks
- 2 to 6 weeks
- 6 weeks to 3 months
- More than 3 months

## questions
<!-- Question ids on the site: K1 to K8. -->
Q: Where is the pain mainly?
- Around or behind the kneecap
- Just below the kneecap
- Inner side of the knee
- Outer side of the knee
- Back of the knee

Q: Which of these bring it on? Tick all that apply. (Replaces subjective S5 for the knee.)
- Going down stairs, squatting, or sitting a long time with the knee bent
- Jumping or landing
- Twisting or turning on the leg
- Running, coming on after the same distance each time
- Kneeling

Q: Which of these apply? Tick all that apply.
- Clicking, catching, or locking
- The knee gives way
- Swelling after activity
- Stiff for less than 30 minutes in the morning or after sitting, then eases
- None of these

Q: About the twisting injury: which apply? Tick all that apply.
- I felt or heard a pop
- It swelled within a couple of hours
- It swelled the next day
- I could not carry on playing
- None of these
Ask only if: How did it start? is “A twist or pivot in sport”

Q: Is there any swelling or lump in one place?
- Swelling on the front of the kneecap (after kneeling)
- A lump or fullness at the back of the knee
- A tender bony bump just below the kneecap (in a teenager)
- The whole knee is puffy
- No swelling or lump

Q: Does it hurt to move your hip (putting on socks, turning your leg in and out in bed)?
- Yes
- No
- Not sure
Ask only if: Age under 18 or 50 or over, or the drawing includes the thigh, groin, or hip

Q: Which of these do you notice in the leg? Tick all that apply.
- Pins and needles or numbness in the leg or foot
- Pain that starts in the back or buttock and travels to the knee
- A burning or numb patch on the inner knee or shin
- The foot slaps down, or the toes catch when walking
- None of these
Ask only if: The drawing reaches above the thigh or below the knee, or the patient ticks “Pins and needles or numbness” or “Shooting or electric” (subjective S3)

Q: Which hurts more: moving your low back, moving your hip, or bending and loading your knee?
- Moving my low back
- Moving my hip
- Bending and loading my knee
- None of these bring it on
Ask only if: The drawing includes the thigh, hip, or back, or Question 6 is “Yes”, or Question 7 is not “None of these”

## referral patterns
- Patellofemoral joint → around or behind the kneecap, poorly localised | Patellofemoral pain | Patellar tendinopathy, knee arthritis; hip problem in a child
- Patellar tendon → just below the kneecap, with jumping | Patellar tendinopathy (“jumper's knee”) | Fat pad irritation; Osgood-Schlatter or Sinding-Larsen-Johansson in teenagers
- Fat pad → either side of the patellar tendon, worse with the knee pushed straight | Fat pad irritation | Patellar tendinopathy
- Tibial tubercle (teenager) → bony bump below the kneecap | Osgood-Schlatter disease | Patellar tendinopathy
- Meniscus → inner or outer joint line, catching, twisting | Meniscal lesion | Ligament sprain, knee arthritis
- Collateral ligaments (MCL, LCL) → inner or outer side after a blow or twist | Ligament sprain | Meniscus, pes anserine
- ACL → deep in the knee, giving way after a pivot with a pop and quick swelling | ACL injury | Kneecap dislocation, fracture
- Knee joint (arthritis) → whole knee or inner side, 45 or over, morning stiffness 30 minutes or less | Knee osteoarthritis (NICE clinical criteria) | Inflammatory arthritis, hip joint, meniscus
- Iliotibial band → outer knee in runners, coming on at the same distance | Iliotibial band syndrome | Outer meniscus, LCL, TFL trigger points
- Pes anserine → inner shin just below the joint line | Pes anserine tendinopathy or bursitis | Inner knee arthritis, saphenous nerve
- Back of the knee (Baker's cyst, popliteus, hamstring tendons) → back of the knee | Baker's cyst or tendon pain. A burst cyst can spread into the calf and look like a clot | DVT (doctor first), popliteal artery
- Prepatellar bursa → swelling on the front of the kneecap after kneeling | Prepatellar bursitis | Infection if hot or red (doctor first)
- Hip joint → knee via the obturator nerve; in children, hip problems may be felt only at the knee | Referred pain from the hip: see the hip file | Knee arthritis, patellofemoral pain; SUFE or Perthes in children
- Low back (L3–L4 nerve roots) → front of the thigh to the knee; L4 to the inner knee and shin | Nerve root pain from the low back | Knee arthritis, pes anserine, saphenous nerve
- Low back joints and discs → can refer to the knee and below without a nerve root | Referred pain from the low back: see the low back file | Knee joint
- Saphenous nerve → burning or numb patch on the inner knee and shin | Saphenous nerve irritation | L4 nerve root, pes anserine
- Common peroneal nerve at the fibula head → outer knee and shin, with foot slap | Peroneal nerve irritation (crossed legs, tight cast, after a knee injury) | L5 nerve root; doctor first if the foot drops
- Vastus medialis → inner knee; vastus lateralis → outer knee | Muscle trigger point referral | Meniscus, patellofemoral pain
- Rectus femoris → around the kneecap | Muscle trigger point referral | Patellofemoral pain
- Adductor longus and gracilis → inner knee | Muscle trigger point referral | Inner meniscus, pes anserine
- Tensor fascia lata and gluteus minimus → outer knee and down the outer leg | Muscle trigger point referral | Iliotibial band syndrome, L5 nerve root
- Gastrocnemius, popliteus, and biceps femoris → back of the knee | Muscle trigger point referral | Baker's cyst, DVT
- Leg veins (clot) → calf or back of the knee swollen, warm, tender | Not musculoskeletal: red flag | Doctor first, or emergency if short of breath
- Popliteal artery → pulsing lump behind the knee, or calf cramp on walking | Not musculoskeletal: red flag | Doctor first
- Infection, gout, or inflammatory arthritis → hot, swollen knee | Not musculoskeletal: red flag | Emergency with fever; otherwise doctor first

## test patients
CASE: Test patient 1
Drawing: Around the right kneecap
Answers: Age 18 to 29 · Gradually, no clear reason · 6 weeks to 3 months; Q1: around or behind the kneecap; Q2: going down stairs, squatting, or sitting a long time with the knee bent; Q3: none of these
Flags: None
Expect: top condition = Patellofemoral pain; must not show = Knee osteoarthritis; meniscal lesion; route = Results + booking

CASE: Test patient 2
Drawing: Inner side of the left knee, and the whole knee
Answers: Age 65 or over · Gradually, no clear reason · More than 3 months; Q1: inner side of the knee; Q3: stiff for less than 30 minutes in the morning or after sitting; swelling after activity; Q6: no
Flags: None
Expect: top condition = Knee osteoarthritis; must not show = Meniscal lesion as the top result; any hip condition; route = Results + booking

CASE: Test patient 3
Drawing: Whole right knee after a football injury
Answers: Age 18 to 29 · A twist or pivot in sport · Less than 2 weeks; Injury screen: I1 “Yes, a twist or pivot in sport”; I2 to I4 No; I5 Yes
Flags: Injury screen I5 (pop with swelling within 2 hours)
Expect: top condition = None; see a doctor first; must not show = Results + booking without the physician-first message; route = Physician first

CASE: Test patient 4
Drawing: Front of the left thigh and left knee
Answers: Age under 18 (13 years old) · Gradually, no clear reason · 2 to 6 weeks; Q1: around or behind the kneecap; Q6: yes
Flags: “Is a child aged about 9 to 16 limping with knee or thigh pain, or does moving the hip hurt?”
Expect: top condition = None; see a doctor first; must not show = Patellofemoral pain or Osgood-Schlatter without the physician-first message; route = Physician first

CASE: Test patient 5
Drawing: Inner side of the right knee
Answers: Age 30 to 49 · A twist or pivot in sport · 6 weeks to 3 months · Injury screen: I1 “No” (more than 6 weeks ago); Q1: inner side of the knee; Q2: twisting or turning on the leg; Q3: clicking, catching, or locking; Q4: it swelled the next day
Flags: None
Expect: top condition = Meniscal lesion; must not show = ACL injury as the top result; knee osteoarthritis; route = Results + booking

CASE: Test patient 6
Drawing: Back of the right knee and the calf, 10 days after a knee replacement
Answers: Age 65 or over · After knee surgery or a knee replacement · Less than 2 weeks; Q5: a lump or fullness at the back of the knee
Flags: “Is your calf swollen, warm, or tender, especially after surgery…?”
Expect: top condition = None; see a doctor first (same day); must not show = Baker's cyst or any knee result without the physician-first message; route = Physician first
