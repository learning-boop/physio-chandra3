---
# From "TL-JUNCTION assessment.docx" (Joint wise assessment folder), 24 Sep 2026.
# Built into src/data/symptomGuideExtra.js (tlj). Conditions: content/conditions/tlj-*.md.
# Body map: the band on the back where the ribs end (TLJ_TOP/TLJ_BOTTOM in
# src/components/Body3D.jsx), the side just below the ribs on the front
# (flank), and every low-back mark, which implies this area (IMPLIES in
# src/data/referral.js): TL-junction pain is felt low but starts higher.
# Test patients: npm run check:regions
region: tlj
name: Where the mid back meets the low back (T10–L2)
source: Maigne R. Low back pain of thoracolumbar origin. Arch Phys Med Rehabil 61(9), 1980; Maigne JY et al. The lateral cutaneous branches of the dorsal rami of the thoracolumbar junction. Surg Radiol Anat 11, 1989; Finucane LM et al. International Framework for Red Flags. JOSPT 50(7), 2020; McMahon LE. Slipping rib syndrome: a review. Semin Pediatr Surg 27(3), 2018; Chaikof EL et al. SVS practice guidelines on abdominal aortic aneurysm. J Vasc Surg 67(1), 2018; Donnelly JM et al. Travell, Simons & Simons' Trigger Point Manual, 3rd ed., 2019
reviewed_by: Chandra Matla, Registered Physiotherapist
reviewed_on: DRAFT prepared 23 Sep 2026, awaiting Chandra's review
---

## red flags
<!-- Flags that ask the same thing as the mid back's (aorta, fracture,
     pancreas, cancer, osteoporosis, infection, legs, shingles) appear once
     when both areas are drawn. -->
- Do you have a sudden, severe pain in your back, tummy, or side, with a pulsing feeling in your tummy, or feeling faint or sweaty? | emergency | Possible leaking abdominal aortic aneurysm (higher risk over 60 and in smokers)
- Did the pain start suddenly as a tearing or ripping pain in your back, spreading to your chest or tummy? | emergency | Possible tear in the aorta (aortic dissection)
- Have you lost control of your bladder or bowels, lost feeling between your legs or around your bottom, or had sudden weakness or numbness in both legs? | emergency | Possible compression of the lower spinal cord or nerves (conus medullaris or cauda equina)
- Did this start in the last few days after a car crash, a fall from a height, or landing hard on your feet or bottom? | emergency | Possible fracture; this is the most common level for spinal fractures
- Do you have severe pain in the upper tummy that goes straight through to your back, with vomiting? | emergency | Possible pancreatitis or perforated ulcer
- Do you have sudden, severe pain in a testicle? | emergency | Possible testicular torsion
- Does the pain come in waves of severe pain from your side down to your groin, or come with a fever, burning when you pass urine, or blood in your urine? | urgent | Possible kidney stone or kidney infection
- Have you ever had cancer, and is this a new back pain? | urgent | Cancer can spread to the spine
- Did the pain start suddenly after a minor strain, cough, or lift, and you have osteoporosis, take long-term steroid tablets, or are over 70? | urgent | Possible osteoporotic fracture of the spine
- Do you have a fever or chills with the back pain, or a weakened immune system, or have you injected drugs? | urgent | Possible spinal infection
- Have your legs gradually become stiff, heavy, or clumsy when you walk? | urgent | Possible slow pressure on the spinal cord
- Is there a band of burning pain around one side of your body, with a rash or blisters? | urgent | Possible shingles

## opening questions
Q: Your age?
- Under 18
- 18 to 29
- 30 to 49
- 50 to 64
- 65 or over

Q: How did it start?
- Gradually, no clear reason
- After lifting, twisting, or bending
- After a fall, landing on my feet or bottom
- After a twisting sport (golf, tennis, rowing, hockey)
- After long hours sitting or driving
- I woke up with it

Q: How long has it been going on?
- Less than 2 weeks
- 2 to 6 weeks
- 6 weeks to 3 months
- More than 3 months

## questions
Q: Where do you feel it? Tick all that apply.
- In the middle of my back, where the ribs end
- Beside my spine at the bottom of the ribs, on one side
- Low back or top of the buttock, over the hip bone
- At my side, just below the ribs
- In the groin or lower tummy

Q: Which of these bring it on? Tick all that apply.
- Twisting or turning
- Bending forward
- Standing up straight after bending, or arching back
- Sitting or driving for a long time
- Lying on the painful side

Q: Is there a sore spot on the top of your hip bone, about a hand's width out from the spine?
- Yes, and pressing it brings on my usual pain
- It is tender, but it is not my usual pain
- No
Ask only if: Where includes "Low back or top of the buttock, over the hip bone"

Q: About your lower ribs: which apply? Tick all that apply.
- A clicking or slipping feeling at the bottom edge of my ribs
- Sharp pain at the rib edge when I bend or twist
- A dull ache at the rib edge that lasts for hours
- None of these
Ask only if: Where includes "At my side, just below the ribs"

Q: About the groin or lower tummy: which apply? Tick all that apply.
- Burning or tingling in the groin or upper inner thigh
- A numb or sensitive patch on the side of my hip
- Groin pain that does not change with hip movement
- Groin pain that is worse when I move my hip   (shows "This may be coming from your hip")
- None of these
Ask only if: Where includes "In the groin or lower tummy"

Q: How does stiffness behave?
- Stiff at first, then eases as I move
- Gets worse the more I move
- Worst in the second half of the night, and exercise helps   (shows the inflammatory back pain card)
- Not stiff

Q: Which of these do you do regularly? Tick all that apply.
- Golf, tennis, or another twisting sport
- Rowing or paddling
- Lifting at work or at the gym
- Sitting at a desk or driving most of the day
- None of these

Q: What eases it? Tick all that apply.
- Lying on my back with my knees bent
- Moving around
- Sitting
- Heat
- Nothing specific

## referral patterns
- T12–L1 posterior branches → low back and top of the buttock, over the hip bone | Referred pain from the thoracolumbar junction (Maigne syndrome): felt low, starts higher | Lumbar spine, sacroiliac joint
- T12–L1 lateral branches → side of the hip | Referred pain from the thoracolumbar junction | Gluteal tendinopathy or trochanteric pain (hip region)
- T12–L1 front branches (iliohypogastric, ilioinguinal, genitofemoral nerves) → groin, lower tummy, upper inner thigh | Nerve referral from the thoracolumbar junction | Hernia, hip joint, adductor strain; testicular or ovarian causes
- Lower ribs (11–12) → side and front of the lower ribs | Slipping rib or lower rib joint | Gallbladder, kidney, spleen
- Kidney or ureter → side down to the groin, in waves | Not musculoskeletal: red flag | Doctor first
- Aorta → back and tummy | Not musculoskeletal: red flag | Emergency
- Quadratus lumborum → top of the hip bone, sacroiliac joint, buttock, outer hip | Muscle trigger point referral; looks like Maigne syndrome | Thoracolumbar junction, kidney pain, gluteal tendinopathy

## test patients
CASE: 1. Maigne
Drawing: Low back and top of the right buttock, over the hip bone
Answers: Age = 30 to 49; After a twisting sport; 6 weeks to 3 months; Q1 = low back or top of the buttock, over the hip bone; Q2 = twisting or turning + sitting or driving for a long time; Q3 = yes, and pressing it brings on my usual pain; Q7 = golf, tennis, or another twisting sport
Flags: none
Expect: top condition = thoracolumbar junction syndrome (Maigne); must not show = lumbar joint pain as top, sacroiliac joint pain; route = results

CASE: 2. TL joint stiffness
Drawing: Beside the spine at the bottom of the ribs on the left
Answers: Age = 30 to 49; After lifting, twisting, or bending; 2 to 6 weeks; Q1 = beside my spine at the bottom of the ribs; Q2 = twisting or turning + standing up straight after bending; Q6 = stiff at first, then eases; Q8 = moving around
Flags: none
Expect: top condition = thoracolumbar joint dysfunction; must not show = slipping rib, kidney message; route = results

CASE: 3. Slipping rib
Drawing: Side, just below the left ribs
Answers: Age = 18 to 29; After a twisting sport; 2 to 6 weeks; Q1 = at my side, just below the ribs; Q4 = clicking or slipping + sharp pain at the rib edge
Flags: none
Expect: top condition = slipping rib syndrome; must not show = Maigne as top; route = results

CASE: 4. Abdominal aortic aneurysm
Drawing: Low back and tummy
Answers: Age = 65 or over; Gradually, no clear reason; Less than 2 weeks
Flags: Sudden, severe pain in your back, tummy, or side, with a pulsing feeling...
Expect: top condition = none; must not show = any condition, any booking; route = 911

CASE: 5. Kidney look-alike
Drawing: Side below the right ribs, down into the groin
Answers: Age = 30 to 49; Gradually, no clear reason; Less than 2 weeks; Q1 = at my side, just below the ribs + in the groin or lower tummy; Q5 = groin pain that does not change with hip movement
Flags: Waves of severe pain from your side down to your groin... blood in your urine
Expect: top condition = none; must not show = slipping rib, Maigne, any booking before review; route = physician first
