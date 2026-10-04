---
# From "Thoracic assessment.docx" (Joint wise assessment folder), 24 Sep 2026.
# Built into src/data/symptomGuideExtra.js (upperback). Conditions: content/conditions/upperback-*.md.
# Body map: the mid back (below the base-of-neck band, above where the ribs
# end) AND the front of the chest.
# Test patients: npm run check:regions
# 2 Oct 2026: "Osteoporosis.docx" (Conditions/General conditions, v1.0):
# condition upperback-osteoporosis, question 9 and a wider osteoporosis
# flag. Test patients 6 to 8. Marked (op) below.
region: upperback
name: Mid back (thoracic spine)
source: Finucane LM et al. International Framework for Red Flags for Potential Serious Spinal Pathologies. JOSPT 50(7), 2020; Heneghan NR, Rushton A. Understanding why the thoracic region is the 'Cinderella' region of the spine. Man Ther 21, 2016; Rudwaleit M et al. ASAS criteria for inflammatory back pain. Ann Rheum Dis 68, 2009; Proulx AM, Zryd TW. Costochondritis: diagnosis and treatment. Am Fam Physician 80(6), 2009; Bogduk N. Pain 147, 2009; Dreyfuss P et al. Thoracic zygapophyseal joint pain patterns. Spine 19(7), 1994; Donnelly JM et al. Travell, Simons & Simons' Trigger Point Manual, 3rd ed., 2019; Giamberardino MA. J Rehabil Med Suppl 41, 2003
reviewed_by: Chandra Matla, Registered Physiotherapist
reviewed_on: DRAFT prepared 23 Sep 2026, awaiting Chandra's review
---

## red flags
<!-- Flags that ask the same thing as a neighbouring area's (heart, aorta,
     lung clot, spinal cord, fracture, pancreas, legs, cancer, osteoporosis,
     infection, shingles) appear once when both areas are drawn. -->
- Did the pain start suddenly as a tearing or ripping pain in your mid back or between your shoulder blades, or spreading into your chest? | 911 | Possible tear in the aorta (aortic dissection)
- Does the pain come with chest tightness, shortness of breath, or sweating, or is it brought on by effort and spreading to your arm or jaw? | 911 | Heart pain can be felt in the mid back
- Do you have a sudden, sharp pain on breathing with shortness of breath, especially after a long journey, recent surgery, or with a swollen calf? | 911 | Possible blood clot in the lung or a collapsed lung
- Do you have severe pain in the upper tummy that goes straight through to your back, with vomiting? | emergency | Possible pancreatitis or perforated ulcer
- Along with the back pain, have you lost control of your bladder or bowels? | emergency | Possible spinal cord compression   (split 2 Oct 2026)
- Along with the back pain, have you had sudden weakness or numbness in both legs? | 911 | Possible spinal cord compression   (split 2 Oct 2026)
- Did this start in the last few days after a car crash, a fall from a height, or a hard blow to the back? | emergency | Possible spinal fracture
- Have your legs gradually become stiff, heavy, or clumsy when you walk? | urgent | Possible slow pressure on the spinal cord (thoracic myelopathy)
- Have you ever had cancer, and is this a new mid-back pain? | urgent | The thoracic spine is a common site for cancer to spread
- Did the pain start suddenly after a minor strain, cough, lift, or a fall from standing height, and are you over 50, or do you have osteoporosis or take long-term steroid tablets? | urgent | Possible osteoporotic fracture of the spine: your doctor should examine you and arrange an X-ray before treatment starts   (op: was "over 70", no fall from standing)
- Do you have a fever or chills with the back pain, or a weakened immune system, or have you injected drugs? | urgent | Possible spinal infection
- Is the pain in your side or lower ribs, with a fever, burning when you pass urine, or blood in your urine? | urgent | Possible kidney infection or stone
- Is the pain linked to eating, heartburn, or black stools, or is it under your right shoulder blade after fatty meals? | urgent | Stomach, ulcer, or gallbladder pain can be felt in the back
- Is there a band of burning pain around one side of your chest or back, with a rash or blisters? | urgent | Possible shingles

## opening questions
Q: Your age?
- Under 18
- 16 to 29
- 30 to 49
- 50 to 64
- 65 or over

Q: How did it start?
- Gradually, no clear reason
- After long hours sitting, at a desk, or driving
- After lifting, twisting, or reaching
- After a cough, sneeze, or sudden movement
- After a fall or knock
- After sport or a new activity (rowing, golf, racket sports)

Q: How long has it been going on?
- Less than 2 weeks
- 2 to 6 weeks
- 6 weeks to 3 months
- More than 3 months

## opening question added 2 Oct 2026
Q: Can you find a tender spot or tight band in a muscle that, when you press it, brings on your usual ache, including the part that spreads?   (2 Oct 2026, Chandra's request: the "Myofascial Pain" document (signed by Chandra, 2 Oct 2026); shared on the opening screen with the neck, shoulder, upper back, low back and hip, asked once (id "tender"), so it does not use a scored-question slot; scores the new muscle-referred pain condition; added after the signed version)
- Yes: pressing a tender spot brings on my usual ache, including where it spreads
- There is a tender spot, but pressing it does not spread the ache
- No, or I cannot find one

## questions
Q: Where is the pain mainly?
- In the middle of my back, on the spine
- Beside my spine, on one side
- Wrapping around a rib, towards the side
- Like a band across my back or around my chest
- At the front of my chest, on the breastbone or ribs   (shows "If this is your first chest pain, see a doctor as well")

Q: Which of these bring it on? Tick all that apply.
- Twisting or turning
- Bending forward or slumping
- Arching back or reaching up
- Sitting for a long time
- Lifting or carrying

Q: Does breathing or coughing affect it?
- No
- A deep breath catches at one spot in my back
- A deep breath or cough hurts along a rib, towards the side or front
- Coughing or sneezing sends pain around my chest like a band

Q: Which of these do you notice? Tick all that apply.
- Burning or tingling in a strip around my chest or tummy
- The skin in that strip is sensitive to touch or clothing
- A numb patch on my chest or tummy
- None of these
Ask only if: Where = "Wrapping around a rib, towards the side" or "Like a band across my back or around my chest", or breathing = "Coughing or sneezing sends pain around my chest like a band"

Q: How do you spend most of your day?
- At a desk or laptop
- Driving
- Lifting and carrying
- On my feet, moving around
- Sport or training most days

Q: How does stiffness behave?
- Stiff at first, then eases as I move
- Gets worse the more I move
- Worst in the second half of the night, and exercise helps   (shows the inflammatory back pain card)
- Not stiff

Q: About the front of your chest: which apply? Tick all that apply.
- It is tender when I press on the breastbone or where the ribs join it
- Worse with pushing, hugging, or lying on my front
- It started after a chest infection or a bout of coughing
- None of these
Ask only if: Where = "At the front of my chest, on the breastbone or ribs"

Q: What eases it? Tick all that apply.
- Sitting up tall, or gently arching back
- Lying on my back
- Moving around
- Heat or massage
- Nothing specific

Q: Which of these apply to you? Tick all that apply.   (op)
- I have been told I have osteoporosis or low bone density, or I have broken a bone after a minor fall as an adult   (op Q4: 3)
- I have taken steroid tablets (such as prednisone) for more than 3 months, or I have rheumatoid arthritis, a thyroid or parathyroid condition, coeliac or inflammatory bowel disease, or had an early menopause   (op Q5: 2)
- I have lost height (more than about 4 cm, or 1½ inches), or I stoop more than I used to   (op Q6: 2)
- None of these, or I am not sure
Ask only if: age 50 or over; asked first after a cough, lift or fall

## referral patterns
- Thoracic joints (T4–T12) → beside the spine, sometimes along the rib | Referred pain from the spinal or rib joints; facet pain stays mostly on one side, about one level below the joint (Dreyfuss 1994) | Disc, rib joint
- Thoracic nerve root → a band around the chest or tummy (T10 at the belly button) | Nerve root pain (thoracic radiculopathy or intercostal neuralgia) | Shingles, diabetic nerve pain
- Heart or aorta → between the shoulder blades, mid back | Not musculoskeletal: red flag | Emergency
- Stomach or pancreas → mid back (T6–T10) | Not musculoskeletal: red flag | Doctor or emergency
- Kidney → side and lower ribs (T10–L1) | Not musculoskeletal: red flag | Doctor first
- Gallbladder → under the right shoulder blade (T7–T9) | Not musculoskeletal: red flag | Doctor first
- Rib joints (costovertebral) → around the rib to the front of the chest | Rib joint referral; can look like heart or lung pain | Heart, lung lining, costochondritis
- Lungs or lining of the lung → chest wall; tip of the shoulder if the diaphragm is involved | Not musculoskeletal: red flag when worse with breathing, with fever or breathlessness | Doctor first or emergency
- Oesophagus → behind the breastbone and between the shoulder blades | Not musculoskeletal: red flag when linked to swallowing | Doctor first
- Serratus anterior → side of the chest and lower tip of the shoulder blade | Muscle trigger point referral | Rib fracture, lung lining pain, shingles
- Rhomboids and middle trapezius → inner edge of the shoulder blade | Muscle trigger point referral | Neck discs (Cloward's areas): check the neck region
- Abdominal wall muscles (rectus abdominis, obliques) → tummy, and a band across the mid back | Muscle trigger point referral that can look like organ pain | Gallbladder, stomach, appendix. Pain from the muscle gets worse when tensing the tummy (Carnett's sign)

## test patients
CASE: 1. Desk worker, stiff mid back
Drawing: Middle of the back, on the spine
Answers: Age = 30 to 49; After long hours sitting, at a desk, or driving; 6 weeks to 3 months; Q1 = on the spine; Q2 = bending forward or slumping + sitting for a long time; Q5 = at a desk or laptop; Q6 = stiff at first, then eases; Q8 = sitting up tall
Flags: none
Expect: top condition = thoracic spine stiffness; must not show = thoracic nerve root pain, rib joint; route = results

CASE: 2. Rib joint
Drawing: One spot beside the spine on the right, wrapping along a rib
Answers: Age = 30 to 49; After lifting, twisting, or reaching; Less than 2 weeks; Q1 = wrapping around a rib; Q2 = twisting or turning; Q3 = a deep breath or cough hurts along a rib; Q4 = none of these
Flags: none
Expect: top condition = rib joint (costovertebral); must not show = costochondritis, nerve root pain; route = results

CASE: 3. Costochondritis
Drawing: Front of the chest, left of the breastbone
Answers: Age = 16 to 29; After a cough, sneeze, or sudden movement; 2 to 6 weeks; Q1 = at the front of my chest; Q7 = tender to press + worse with pushing + started after a chest infection
Flags: none
Expect: top condition = costochondritis; must not show = rib joint as top; route = results (advise a doctor check if first chest pain) + booking

CASE: 4. Pancreas
Drawing: Mid back and upper tummy
Answers: Age = 50 to 64; Gradually, no clear reason; Less than 2 weeks
Flags: Severe pain in the upper tummy that goes straight through to your back, with vomiting
Expect: top condition = none; must not show = any condition, any booking; route = 911

CASE: 5. Osteoporotic fracture look-alike
Drawing: Middle of the back, on the spine
Answers: Age = 65 or over; After lifting, twisting, or reaching; Less than 2 weeks; Q1 = on the spine; Q2 = bending forward or slumping + lifting or carrying
Flags: Sudden pain after a minor strain... osteoporosis...
Expect: top condition = none; must not show = thoracic stiffness, any booking before review; route = physician first

<!-- (op) From "Osteoporosis.docx" (v1.0, 2 Oct 2026): maximum 16, shown from 7. -->
CASE: 6. Over 65, mid-back pain after a cough, known osteoporosis and height loss
Answers: 65 or over; after a cough; less than 2 weeks; Q1 = middle of the back, on the spine; Q9 = known osteoporosis + height loss
Expect: top condition = osteoporosis (with the see-your-doctor note); route = results

CASE: 7. 55, stiff beside the spine after desk work, no bone history
Answers: 50 to 64; after sitting; Q1 = beside the spine; Q9 = none
Expect: must not show = osteoporosis; route = results

CASE: 8. Under 50, sudden pain after a cough
Answers: 30 to 49; after a cough; Q1 = middle of the back
Expect: question 9 not asked; must not show = osteoporosis
