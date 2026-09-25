---
# From "CT junction assessment.docx" (Joint wise assessment folder), 24 Sep 2026.
# Built into src/data/symptomGuideExtra.js (ctj). Conditions: content/conditions/ctj-*.md.
# Body map: the back from the nape down across the top of the shoulder blades
# ("Base of Neck", CTJ_BOTTOM in src/components/Body3D.jsx). Any line from the
# neck or this band down the arm also asks these questions.
# Test patients: npm run check:regions
region: ctj
name: Base of the neck & upper back (C7–T3)
source: Blanpied PR et al. Neck Pain: Revision 2017. JOSPT 47(7), 2017; Finucane LM et al. International Framework for Red Flags for Potential Serious Spinal Pathologies. JOSPT 50(7), 2020; Illig KA et al. SVS reporting standards for thoracic outlet syndrome. J Vasc Surg 64(3), 2016; Rushton A et al. International IFOMPT Cervical Framework. JOSPT 53(1), 2023; Donnelly JM et al. Travell, Simons & Simons' Myofascial Pain and Dysfunction, 3rd ed., 2019; McGuckin N. The T4 syndrome. In: Grieve GP (ed). Modern Manual Therapy of the Vertebral Column, 1986
reviewed_by: Chandra Matla, Registered Physiotherapist
reviewed_on: DRAFT prepared 23 Sep 2026, awaiting Chandra's review
---

## red flags
<!-- The injury flag is not a checkbox: as the document says, it is routed
     through the neck injury screen (content/regions/neck.md), which runs
     whenever the neck or the base of the neck is drawn. The heart and spinal
     cord flags are left out when the neck's own versions are on the screen. -->
- Did the pain start suddenly as a tearing or ripping pain between your shoulder blades, or spreading into your chest? | emergency | Possible tear in the aorta (aortic dissection)
- Does the pain come with chest tightness, shortness of breath, or sweating, or is it brought on by effort and spreading to your left arm or jaw? | emergency | Heart pain is often felt between the shoulder blades
- Do you have a sudden, sharp pain on breathing with shortness of breath, especially after a long journey, recent surgery, or with a swollen calf? | emergency | Possible blood clot in the lung or a collapsed lung
- Along with the back pain, have you lost control of your bladder or bowels, or had new weakness, numbness, or unsteadiness in both legs? | emergency | Possible spinal cord compression
- Did this start in the last few days after a car crash, a fall from a height, or a hard blow to the upper back or neck? | emergency | Possible fracture. Route through the neck injury screen (neck file, section B2)
- Do you smoke or used to smoke, and have you also had a cough that will not go away, coughed up blood, or noticed a drooping eyelid on the painful side? | urgent | Possible tumour at the top of the lung (Pancoast)
- Did the pain start suddenly after a minor strain, cough, or lift, and you have osteoporosis or take long-term steroid tablets? | urgent | Possible osteoporotic fracture of the spine
- Are the small muscles of your hand getting thinner, or has your grip become weak? | urgent | Nerve compression (C8/T1) or thoracic outlet needs medical review
- Does your arm or hand turn pale, blue, cold, or swollen, especially when your arm is raised? | urgent | Possible blood vessel compression or clot in the arm (same-day review)
- Is the pain under your right shoulder blade worse after fatty meals, or does it come with feeling sick? | urgent | Gallbladder pain can be felt under the right shoulder blade
- Is there a band of burning pain around one side of your chest or back, with a rash or blisters? | urgent | Possible shingles
- Does the pain come on when you swallow, or does food feel like it sticks on the way down? | urgent | Oesophagus pain can be felt between the shoulder blades

## opening questions
Q: Your age?
- Under 18
- 18 to 29
- 30 to 49
- 50 to 64
- 65 or over

Q: How did it start?
- Gradually, no clear reason
- After long hours at a desk, screen, or looking down
- After lifting, carrying, or reaching
- After a sudden movement, cough, or sneeze
- After a fall or knock
- I woke up with it

Q: How long has it been going on?
- Less than 2 weeks
- 2 to 6 weeks
- 6 weeks to 3 months
- More than 3 months

## questions
Q: Where is the pain mainly?
- In the middle, at the bump at the base of my neck
- Between my shoulder blades
- Along the top of one shoulder blade
- Above my collarbone, at the base of the neck on one side
- Around a rib, towards the side or front of my chest

Q: Which of these bring it on? Tick all that apply.
- Looking down, or bending my neck forward
- Looking up, or turning my head
- Twisting my upper body
- Raising my arms overhead
- Carrying bags, or holding my arms out (driving, typing)

Q: Does breathing affect it?
- No
- A deep breath catches at one spot in my upper back
- A deep breath or cough hurts along a rib, towards the side or front

Q: Which describe your arm symptoms? Tick all that apply.
- Tingling or numbness in the ring and little fingers
- Tingling along the inner forearm
- Worse with my arms overhead or carrying bags
- My arm feels heavy or tires quickly
- My whole hand tingles, not particular fingers
Ask only if: the drawing reaches the arm, or pain quality = "Pins and needles or numbness"

Q: How do you spend most of your day?
- At a desk or laptop
- Looking down (phone, reading, close work)
- Working with my arms overhead
- Lifting and carrying
- On my feet, moving around

Q: What eases it? Tick all that apply.
- Sitting up tall, or drawing my shoulders back
- Lying on my back
- Moving and stretching
- Resting my arm on an armrest or my hand on my head
- Nothing specific

Q: Do you also have any of these? Tick all that apply.
- Neck stiffness
- Headache at the back of the head
- Shoulder pain when lifting my arm   (shows the "may be coming from your shoulder" card)
- The front of my chest wall is sore to press
- None of these

Q: How does your upper back feel?
- A hump or rounding at the base of my neck has grown
- Stiff, and stretching or cracking it eases it
- Not stiff
Ask only if: Where is the pain mainly? = "In the middle, at the bump at the base of my neck" or "Between my shoulder blades"

## referral patterns
- C7–T2 joints → between the shoulder blades and along the top of the shoulder blade | Referred pain from the joints at the base of the neck | Lower neck discs (C5–C7) also refer here: check the neck region
- First rib and scalene muscles → above the collarbone, down the inner arm into the ring and little fingers | First rib or thoracic outlet | C8 nerve root, ulnar nerve at the elbow, Pancoast tumour
- Upper rib joints → around the rib to the side or front of the chest | Rib joint (costovertebral) referral | Heart, lung, shingles
- Heart or aorta → between the shoulder blades, left arm, jaw | Not musculoskeletal: red flag | Emergency
- Gallbladder → under the right shoulder blade | Not musculoskeletal: red flag | Doctor first
- Upper thoracic spine (T2–T7) → both hands, with coldness or glove-like pins and needles, sometimes headache | T4 syndrome, thought to involve the sympathetic chain; a diagnosis of exclusion | C8/T1 nerve root, thoracic outlet, circulation problems, diabetic nerve pain
- Oesophagus → between the shoulder blades and behind the breastbone | Not musculoskeletal: red flag when linked to swallowing or heartburn | Doctor first
- Pectoralis minor → front of the chest, inner arm to the ring and little fingers | Muscle trigger point referral | C8 nerve root, heart (angina), thoracic outlet

## test patients
CASE: 1. Desk worker, stiff at the base of the neck
Drawing: In the middle at the base of the neck and between the shoulder blades
Answers: Age = 30 to 49; How did it start? = After long hours at a desk, screen, or looking down; How long = 6 weeks to 3 months; Q1 = in the middle, at the bump; Q2 = looking down; Q5 = at a desk or laptop; Q6 = sitting up tall; Q8 = stiff, and stretching or cracking it eases it
Flags: none
Expect: top condition = Cervicothoracic junction stiffness; must not show = thoracic outlet, rib joint; route = results

CASE: 2. Thoracic outlet
Drawing: Above the left collarbone and down the inner arm to the ring and little fingers
Answers: Age = 18 to 29; After lifting, carrying, or reaching; 2 to 6 weeks; Q1 = above my collarbone; Q2 = raising my arms overhead + carrying bags; Q4 = ring and little fingers + worse overhead or carrying + arm feels heavy; Q5 = working with my arms overhead
Flags: none
Expect: top condition = First rib dysfunction / thoracic outlet (neurogenic); must not show = CTJ stiffness as top; route = results

CASE: 3. Upper rib joint
Drawing: One spot on the right upper back, wrapping around to the side
Answers: Age = 30 to 49; After a sudden movement, cough, or sneeze; Less than 2 weeks; Q1 = around a rib; Q2 = twisting my upper body; Q3 = a deep breath or cough hurts along a rib
Flags: none
Expect: top condition = Upper rib joint (costovertebral) dysfunction; must not show = thoracic outlet; route = results

CASE: 4. Aortic dissection
Drawing: Between the shoulder blades
Answers: Age = 50 to 64; Gradually, no clear reason; Less than 2 weeks
Flags: Did the pain start suddenly as a tearing or ripping pain...
Expect: top condition = none; must not show = any condition, any booking; route = 911

CASE: 5. Pancoast look-alike
Drawing: Top of the right shoulder and down the inner arm
Answers: Age = 65 or over; Gradually, no clear reason; 6 weeks to 3 months; Q1 = along the top of one shoulder blade; Q4 = ring and little fingers + inner forearm
Flags: Do you smoke or used to smoke...; Are the small muscles of your hand getting thinner...
Expect: top condition = none; must not show = thoracic outlet, any booking before review; route = physician first
