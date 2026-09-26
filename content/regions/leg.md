---
# From "Lower leg assessment.docx" (Joint wise assessment folder), 25 Sep 2026.
# Built into src/data/symptomGuideExtra.js (leg, question ids V1 to V8) and src/data/injuryScreen.js (leg screen).
# Conditions: content/conditions/leg-*.md. Body map: the lower leg band, zone type "lowerleg" (KNEE_BOTTOM and ANKLE_TOP in Body3D.jsx).
# Test patients: npm run check:regions
region: leg
name: Lower leg (calf & shin)
source: Winters M et al. Medial tibial stress syndrome can be diagnosed reliably using history and physical examination. Br J Sports Med 52(19), 2018; Warden SJ, Davis IS, Fredericson M. Management and prevention of bone stress injuries in long-distance runners. JOSPT 44(10), 2014; Pedowitz RA et al. Modified criteria for the objective diagnosis of chronic compartment syndrome of the leg. Am J Sports Med 18(1), 1990; Martin RL et al. Achilles pain, stiffness, and muscle power deficits: midportion Achilles tendinopathy, revision 2024. JOSPT 54(12), 2024; Maffulli N. The clinical diagnosis of subcutaneous tear of the Achilles tendon. Am J Sports Med 26(2), 1998; Wells PS et al. Evaluation of D-dimer in the diagnosis of suspected deep-vein thrombosis. N Engl J Med 349(13), 2003; Aboyans V et al. 2017 ESC Guidelines on the diagnosis and treatment of peripheral arterial diseases. Eur Heart J 39(9), 2018; Murphy DR et al. Pain patterns and descriptions in patients with radicular pain. Chiropr Osteopat 17, 2009; Donnelly JM et al. Travell, Simons & Simons' Myofascial Pain and Dysfunction: The Trigger Point Manual, 3rd ed. Wolters Kluwer, 2019
reviewed_by: Chandra Matla, Registered Physiotherapist
# The document still says "DRAFT prepared 24 Sep 2026, awaiting Chandra's review"; Chandra confirmed the review on 25 Sep 2026.
reviewed_on: 2026-09-25
---

## red flags
- Is your calf swollen, warm, or tender, and are you also short of breath, or have chest pain or are coughing blood? | emergency | Possible blood clot that has travelled to the lung
- Is your lower leg pain getting worse and worse, with the leg tight and swollen and much worse when your toes are moved, especially after an injury or under a cast? | emergency | Possible acute compartment syndrome
- Has your foot or lower leg suddenly become cold, pale, numb, or painful at rest? | emergency | Possible blocked artery (acute limb ischaemia)
- Is there a hot, red area on your leg that is spreading fast, with pain far worse than it looks, or feeling very unwell? | emergency | Possible severe skin and tissue infection
- Do you have new numbness between your legs or around your bottom, or new trouble passing urine or controlling your bowels? | emergency | Possible cauda equina syndrome
- Is your calf swollen, warm, or tender, especially after surgery, a long journey, time in bed, a cast, pregnancy, or starting the pill? | urgent | Possible blood clot (DVT); same-day review. A burst cyst from the back of the knee can look the same
- Is there spreading redness, a red streak up the leg, or a hot, swollen area with a fever, or a leg ulcer that is not healing? | urgent | Possible skin infection (cellulitis) or circulation problem; same-day review
- Do you get a cramping calf pain when walking that eases within minutes of standing still, and do you smoke, have diabetes, or are over 50? | urgent | Possible narrowed leg arteries (vascular claudication)
- Do you run or train hard, and is there a sore spot on the shin bone that you can point to with one finger, or pain when hopping or at night? | urgent | Possible tibial stress fracture; needs imaging before more running
- Is your foot slapping down or your toes catching when you walk? | urgent | Foot drop (peroneal nerve or L5) needs medical review
- Do both feet feel numb, burning, or tingling, like wearing socks, especially with diabetes? | urgent | Possible peripheral neuropathy; needs medical review and foot checks
- Are you under 25 with a deep shin ache that wakes you at night, or a lump on the shin that is growing? | urgent | Bone lumps need imaging to rule out a tumour
- Have you ever had cancer, or do you have deep leg pain at night that does not change with position, with weight loss? | urgent | Cancer can spread to the leg bones

## injury screen
<!-- Built into src/data/injuryScreen.js. Asked in order; the first answer that routes ends it. -->
I1 Has your lower leg been hurt in the last 6 weeks?
- No
- Yes, a kick or blow to the shin or calf
- Yes, a fall or accident
- Yes, a sudden pain or “kick” in the calf or back of the ankle while pushing off
Route: No → skip this screen / Any Yes → I2
Why: Gate question

I2 Is the leg a different shape, is bone showing, or can you not stand on the leg?
Route: Yes → EMERGENCY
Why: Possible fracture of the shin bones

I3 After the injury, is the pain getting worse by the hour, with the leg tight and much worse when you move your toes?
Route: Yes → EMERGENCY
Why: Possible acute compartment syndrome (most common after a shin fracture)

I4 Did it feel like someone kicked the back of your ankle or calf, and now you cannot push up onto your toes on that leg, or feel a gap in the tendon?
Route: Yes → PHYSICIAN FIRST
Why: Possible Achilles tendon rupture; early treatment matters

I5 Did you feel a sudden sharp pain in the inner calf (like being hit), with bruising down to the ankle after?
Route: Yes → PHYSICIAN FIRST
Why: Possible calf muscle tear (“tennis leg”); a clot can look the same, so it needs checking

I6 After a kick to the outer knee or shin, is your foot weak or numb on top?
Route: Yes → PHYSICIAN FIRST
Why: Possible peroneal nerve injury


## opening questions
Q: Your age?
- Under 18
- 18 to 29
- 30 to 49
- 50 to 64
- 65 or over

Q: How did it start?
- Gradually, no clear reason
- After increasing running, jumping, or marching
- It comes on during exercise and eases when I stop
- A sudden pain in the calf while pushing off
- After a kick, blow, or fall
- It comes on with walking and eases when I stand still or sit

Q: How long has it been going on?
- Less than 2 weeks
- 2 to 6 weeks
- 6 weeks to 3 months
- More than 3 months

## questions
<!-- Question ids on the site: V1 to V8. -->
Q: Where is the pain mainly?
- Along the inner edge of the shin bone
- Front of the shin, on the outer side of the bone
- Outer side of the lower leg
- Calf
- Back of the lower leg, just above the heel (Achilles)

Q: How does the pain behave with running or exercise?
- Sore at the start, eases as I warm up, worse after
- Builds up during exercise at the same point, and eases within minutes of stopping
- Gets worse the more I run, and hurts to hop
- Sore the morning after, and stiff at first
- It is not linked to exercise

Q: About the tender area on the shin: which is closest?
- A long stretch (more than 5 cm) along the inner edge of the bone
- One spot I can cover with a fingertip
- Not on the bone, in the muscle beside it
- I have no tender spot on the shin
Ask only if: Question 1 is “Along the inner edge of the shin bone” or “Front of the shin, on the outer side of the bone”

Q: During exercise, which of these happen? Tick all that apply.
- The leg goes tight or hard
- The foot goes numb, tingly, or weak
- The foot slaps down or the toes catch
- It eases within 10 to 30 minutes of stopping
- None of these
Ask only if: Question 2 is “Builds up during exercise at the same point, and eases within minutes of stopping”

Q: When walking, what happens?
- Calf cramp that eases within minutes of standing still
- Leg pain that eases only when I sit or bend forward
- Pain at rest or at night that eases with the leg hanging down
- No change with walking
Ask only if: How did it start? is “It comes on with walking and eases when I stand still or sit”, or age 50 or over

Q: Which of these do you notice in the leg or foot? Tick all that apply.
- Pins and needles or numbness on the inner shin
- Pins and needles or numbness on the outer shin and top of the foot
- Pins and needles or numbness in the calf, outer foot, or sole
- Burning or numbness in both feet, like socks
- None of these
Ask only if: The patient ticks “Pins and needles or numbness” or “Shooting or electric” (subjective S3), or the drawing reaches above the knee or into the foot

Q: Which hurts more: moving your low back, or loading your leg (walking, running, rising on your toes)?
- Moving my low back
- Loading my leg
- Both about the same
- Neither brings it on
Ask only if: The drawing includes the back, buttock, or thigh, or Question 6 is not “None of these”

Q: Is there any swelling or change in the skin?
- Swelling of the whole calf
- Swelling and bruising after an injury
- Swollen ankles at the end of the day, or varicose veins
- Skin that is shiny, cold, hairless, or slow to heal
- No swelling or skin change

## referral patterns
- Inner edge of the shin bone → tender over more than 5 cm, with running | Medial tibial stress syndrome (“shin splints”) | Tibial stress fracture (one spot), compartment syndrome
- Shin bone (tibia) → one pinpoint spot, hurts to hop or at night | Possible tibial stress fracture: doctor first | Shin splints
- Front or outer compartments → tightness at the same point in exercise, easing with rest; sometimes numb foot | Chronic exertional compartment syndrome | Shin splints, popliteal artery entrapment, L5 nerve root
- Calf muscle (inner gastrocnemius, soleus) → calf, often a sudden “hit” in middle-aged players | Calf muscle strain (“tennis leg”) | DVT (doctor first), burst Baker's cyst, Achilles rupture
- Achilles tendon (mid-portion, 2 to 6 cm above the heel) → back of the lower leg, stiff in the morning | Mid-portion Achilles tendinopathy | Achilles rupture, plantaris, insertional pain (ankle file)
- Popliteal artery (young athletes) → calf cramp or foot numbness with exercise | Possible popliteal artery entrapment | Compartment syndrome; doctor first
- Common peroneal nerve at the fibula head → outer shin and top of the foot, foot slap | Peroneal nerve irritation (crossed legs, tight cast, knee injury) | L5 nerve root; doctor first if the foot drops
- Superficial peroneal nerve → burning on the lower outer shin and top of the foot | Superficial peroneal nerve irritation | L5 nerve root, compartment syndrome
- Saphenous nerve → burning or numbness on the inner knee and inner shin | Saphenous nerve irritation | L4 nerve root, shin splints
- L4 nerve root → inner shin to the inner ankle | Nerve root pain from the low back | Saphenous nerve, shin splints
- L5 nerve root → outer shin and top of the foot to the big toe | Nerve root pain from the low back | Peroneal nerve, compartment syndrome
- S1 nerve root → calf, outer foot, and sole | Nerve root pain from the low back | Calf strain, Achilles
- Low back joints and discs, sacroiliac joint → can refer into the calf without a nerve root | Referred pain from the low back or pelvis: see those files | Calf strain
- Lumbar spinal stenosis → both legs on walking, easing when sitting or bending forward | Neurogenic claudication | Vascular claudication (eases standing still)
- Gluteus minimus → outer and back of the calf down to the ankle | Muscle trigger point referral (“pseudo-sciatica”) | L5 or S1 nerve root
- Gastrocnemius and soleus → calf, back of the knee, heel; soleus also to the sacroiliac joint | Muscle trigger point referral | Calf strain, Achilles, DVT
- Tibialis anterior → front of the shin, to the big toe | Muscle trigger point referral | Shin splints, L5 nerve root
- Peroneus longus and brevis → outer lower leg and outer ankle | Muscle trigger point referral | Peroneal nerve, ankle sprain
- Tibialis posterior and long toe flexors → calf, Achilles, and sole | Muscle trigger point referral | Shin splints, tarsal tunnel
- Leg veins (clot) → calf swollen, warm, tender | Not musculoskeletal: red flag | Doctor first, or emergency if short of breath
- Leg arteries → calf cramp on walking easing standing still; pain at rest with a cold, pale foot | Not musculoskeletal: red flag (vascular claudication or critical ischaemia) | Doctor first; emergency if sudden
- Peripheral nerves (diabetes, alcohol, vitamin B12) → burning or numbness in both feet and shins | Not musculoskeletal: peripheral neuropathy | Doctor first
- Skin (cellulitis) → hot, red, swollen shin, with fever | Not musculoskeletal: red flag | Doctor first, emergency if spreading fast

## test patients
CASE: Test patient 1
Drawing: Inner edge of both shins, lower half
Answers: Age 18 to 29 · After increasing running, jumping, or marching · 2 to 6 weeks; Q1: along the inner edge of the shin bone; Q2: sore at the start, eases as I warm up, worse after; Q3: a long stretch (more than 5 cm) along the inner edge of the bone
Flags: None
Expect: top condition = Medial tibial stress syndrome (shin splints); must not show = Tibial stress fracture; compartment syndrome; route = Results + booking

CASE: Test patient 2
Drawing: One spot on the front of the right shin
Answers: Age 18 to 29 · After increasing running, jumping, or marching · 2 to 6 weeks; Q1: front of the shin; Q2: gets worse the more I run, and hurts to hop; Q3: one spot I can cover with a fingertip
Flags: “Do you run or train hard, and is there a sore spot on the shin bone…?”
Expect: top condition = None; see a doctor first; must not show = Shin splints without the physician-first message; route = Physician first

CASE: Test patient 3
Drawing: Front and outer side of both lower legs
Answers: Age 18 to 29 · It comes on during exercise and eases when I stop · More than 3 months; Q2: builds up during exercise at the same point, and eases within minutes of stopping; Q4: the leg goes tight or hard; the foot goes numb, tingly, or weak; it eases within 10 to 30 minutes of stopping
Flags: None
Expect: top condition = Chronic exertional compartment syndrome; must not show = Shin splints as the top result; route = Results + booking

CASE: Test patient 4
Drawing: Inner side of the left calf, during tennis
Answers: Age 30 to 49 · A sudden pain in the calf while pushing off · Less than 2 weeks; Injury screen: I1 “Yes, a sudden pain in the calf”; I2 to I4 No; I5 Yes
Flags: Injury screen I5 (possible calf tear; clot must be excluded)
Expect: top condition = None; see a doctor first; must not show = Calf strain results without the physician-first message; route = Physician first

CASE: Test patient 5
Drawing: Both calves when walking
Answers: Age 65 or over · It comes on with walking and eases when I stand still or sit · More than 3 months · Subjective S15: Diabetes; Q5: calf cramp that eases within minutes of standing still; Q8: skin that is shiny, cold, hairless, or slow to heal
Flags: “Do you get a cramping calf pain when walking that eases within minutes of standing still…?”
Expect: top condition = None; see a doctor first; must not show = Lumbar stenosis or calf strain as the only message; route = Physician first

CASE: Test patient 6
Drawing: Low back, outer right shin, and top of the foot (look-alike)
Answers: Age 30 to 49 · Gradually, no clear reason · 2 to 6 weeks · Subjective S3: Shooting or electric; Q1: outer side of the lower leg; Q6: pins and needles or numbness on the outer shin and top of the foot; Q7: moving my low back
Flags: None
Expect: top condition = No lower leg condition; shows a “this may be coming from your low back” message; must not show = Compartment syndrome or peroneal nerve as the top result; route = Results (suggest low back check) + booking
