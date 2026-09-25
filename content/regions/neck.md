---
# From "Cervical assessment.docx" (Joint wise assessment folder), 24 Sep 2026.
# Built into src/data/symptomGuideExtra.js (neck) and src/data/injuryScreen.js.
# Test patients: npm run check:regions
region: neck
name: Neck (cervical spine)
source: Blanpied PR et al. Neck Pain: Revision 2017. JOSPT 47(7), 2017; Rushton A et al. International IFOMPT Cervical Framework. JOSPT 53(1), 2023; Stiell IG et al. The Canadian C-Spine Rule. JAMA 286, 2001; Wainner RS et al. Radiculopathy test cluster. Spine 28, 2003; Cook C et al. Cervical myelopathy clinical findings cluster. JOSPT 40, 2010; Bogduk N. Definitions and physiology of back pain, referred pain, and radicular pain. Pain 147, 2009; Cloward RB. Cervical diskography. Ann Surg 150, 1959; Donnelly JM et al. Travell, Simons & Simons' Myofascial Pain and Dysfunction, 3rd ed., 2019
reviewed_by: Chandra Matla, Registered Physiotherapist
reviewed_on: DRAFT prepared 23 Sep 2026, awaiting Chandra's review
---

## red flags
<!-- "Ask only if" is an addition: the two shoulder-tip flags are asked only
     when a shoulder is drawn. -->
- Have you had a sudden, severe headache, the worst you have ever had? | emergency | Possible bleed or artery tear in the neck or head
- Since this started, have you had any of these: room spinning or dizziness, double vision, slurred speech, trouble swallowing, sudden falls or blackouts, numb face, weakness on one side, or unsteady walking? | emergency | Stroke or cervical artery warning signs (IFOMPT framework)
- Along with the neck pain, have you lost control of your bladder or bowels, or had new numbness or weakness in both legs? | emergency | Acute spinal cord compression
- Do you have a fever with a stiff neck, a bad headache, or find bright light hard to look at? | emergency | Possible meningitis
- Is the pain in your neck, jaw, or left arm brought on by effort, or does it come with chest tightness, shortness of breath, or sweating? | emergency | Heart pain can be felt in the neck, jaw, and arm
- Have your hands become clumsy (buttons, writing, dropping things), or has your walking become unsteady? | urgent | Possible pressure on the spinal cord (myelopathy)
- Do you need to hold your head up with your hands, or does moving your neck cause tingling around your lips or mouth? | urgent | Possible upper neck instability
- Did a new neck pain or headache, unlike anything you have had before, start suddenly after a neck manipulation, a sudden jerk, or a minor knock? | urgent | Early sign of a neck artery tear can be pain alone (IFOMPT framework)
- Did pain at the tip of your left shoulder start after a blow to your tummy or ribs, or does it come with feeling faint or dizzy? | emergency | Possible bleeding from the spleen, felt at the shoulder tip (Kehr's sign) | Ask only if: a shoulder is drawn
- Is the pain at the tip of your shoulder worse when you breathe in deeply, or does it come on after fatty meals? | urgent | Diaphragm, lung lining, liver or gallbladder pain is felt at the shoulder tip (C3–C5) | Ask only if: a shoulder is drawn

## injury screen
<!-- Canadian C-Spine Rule (adapted). Shown straight after the safety check
     when the neck is drawn. Asked in order; the first answer that routes ends
     the screen. The site can only send people on to medical care from here,
     never clear them: spinal tenderness can only be checked in person. -->
I1: Has your neck been hurt in an accident or injury in the last 7 days?
- No → skip this screen
- Yes, a car or other vehicle accident → I2
- Yes, a fall → I2
- Yes, sport, or a blow to the head or neck → I2

I2: When did it happen?
- Within the last 48 hours → I3 to I7
- 2 to 7 days ago → I3 to I5; any high-risk answer → urgent; none → continue

I3: Are you 65 or older?   (pre-filled from the age answer)
- Yes → emergency (within 48 hours) / urgent (2 to 7 days)

I4: Was it any of these? Tick all that apply.
- A fall from 1 metre (3 feet) or 5 stairs or higher
- Diving, or a blow landing on top of the head
- A crash at highway speed, a rollover, or being thrown from the vehicle
- An accident on an ATV, snowmobile, dirt bike, or similar
- A bicycle crash
- None of these
Any except "None of these" → emergency (within 48 hours) / urgent (2 to 7 days)

I5: Since the injury, have you had pins and needles or numbness in your arms, hands, or legs?
- Yes → emergency (within 48 hours) / urgent (2 to 7 days)

I6: Which of these are true? Tick all that apply.
- It was a simple rear-end collision (not hit by a bus or large truck, not pushed into oncoming traffic, no rollover)
- I have been able to walk around at any time since the injury
- The neck pain came on later, not straight away
- None of these
"None of these" → emergency; at least one → I7

I7: Slowly turn your head as far as is comfortable to the left, then to the right. Stop if it hurts sharply; don't push through it. Can you turn at least halfway to each shoulder?
- Yes, both ways → urgent   (OPEN: Chandra to decide urgent or results + booking)
- No, not one or both ways → emergency

## opening questions
Q: Your age?
- Under 18
- 18 to 29
- 30 to 49
- 50 to 64
- 65 or over

Q: How did it start?
- Woke up with it
- Gradually, no clear reason
- After a car accident or whiplash-type jolt
- After a fall, sport, or knock to the head or neck
- After long hours at a desk, screen, or in one position
- After lifting or a sudden movement

Q: How long has it been going on?
- Less than 2 weeks
- 2 to 6 weeks
- 6 weeks to 3 months
- More than 3 months

## questions
Q: When you turn your head to look over your shoulder, what happens?
- I can turn fully both ways
- It is stiff or painful turning to one side
- It is stiff or painful turning both ways
- It is locked and I can barely turn it at all

Q: Which of these describe your arm symptoms? Tick all that apply.
- Pain goes down the arm past the elbow
- The arm pain is worse than the neck pain
- Pins and needles or numbness in particular fingers
- Resting my hand on top of my head eases the arm pain
- Pain stops at the top of the shoulder or upper arm
Ask only if: the drawing reaches the arm, or pain quality = "Pins and needles or numbness" or "Burning, shooting or electric"

Q: Does looking up, or tilting your head toward the sore side, bring on pain or tingling down the arm?
- Yes, it goes down the arm
- It hurts in the neck, but not the arm
- No, neither
Ask only if: arm symptoms = "Pain goes down the arm past the elbow" or "Pins and needles or numbness in particular fingers"

Q: If you get headaches with this, what are they like?
- One-sided, starting at the back of the neck or head
- Brought on by neck movement or holding one position
- Both sides, like a tight band or pressure
- Throbbing, with feeling sick or finding light hard to take
- I do not get headaches
Ask only if: the drawing includes the head, or age is under 50

Q: Since your accident or injury, which of these apply? Tick all that apply.
- My neck gets tired holding my head up (reading, screens)
- The pain has spread to my shoulders, upper back, or arms
- Trouble concentrating or sleeping since it happened
- My neck is very sensitive to touch or cold
- It is settling a bit more each week
Ask only if: How did it start? = "After a car accident or whiplash-type jolt" or "After a fall, sport, or knock to the head or neck"

Q: Which of these make it worse? Tick all that apply.
- Long spells at a desk, screen, or driving
- Looking down (phone, reading, cooking)
- Looking up (overhead work, reaching high shelves)
- Lying on it, or certain pillows
- Lifting or carrying

Q: How does your neck feel when you start moving after being still for a while?
- Stiff at first, then eases as I move
- Gets worse the more I move
- About the same either way

Q: Which hurts more: moving your neck, or moving your shoulder and arm (reaching, lifting the arm)?
- Moving my neck
- Moving my shoulder and arm
- Both about the same
- Neither brings it on
Ask only if: the drawing includes the top of the shoulder or upper arm

## referral patterns
- Neck → back of the head, temple, or behind the eye | Headache coming from the upper neck (cervicogenic, C1–C3) | Migraine, tension-type headache; vascular causes if red flags ticked
- Neck → shoulder blade or upper back | Referred pain from lower neck joints or discs (C5–C7) | Upper back and rib joints; heart or lung if left-sided and brought on by effort
- Neck → down the arm past the elbow into the fingers | Nerve root (radicular) when there are nerve-type symptoms. Thumb side C6, middle finger C7, little finger C8 | Carpal tunnel, ulnar nerve at the elbow, thoracic outlet
- Neck → top of the shoulder or upper arm (stops above the elbow) | Referred pain from the neck (C4–C5), not a nerve root | Shoulder: rotator cuff, AC joint, frozen shoulder
- Neck → jaw or face | Upper neck referral | Jaw joint (TMJ), dental; heart if left jaw pain comes with effort
- Neck (C3–C5) → tip of the shoulder, above the collarbone | Referred pain from the mid-neck joints, or from the diaphragm, which shares the C3–C5 (phrenic) nerve | Liver, gallbladder, spleen (left shoulder tip after a knock: Kehr's sign), lung lining; red flag if worse with breathing
- Lower neck discs (C5–C7) → inner edge of the shoulder blade | Disc-referred pain (Cloward's areas); often comes before any arm symptoms | Upper back and rib joints; heart if left-sided and brought on by effort
- Scalene muscles → front of the chest, inner shoulder blade, down the outer arm to the thumb and index finger | Muscle trigger point referral | C6 nerve root, thoracic outlet, heart
- Levator scapulae → angle of the neck and inner edge of the shoulder blade | Muscle trigger point referral ("stiff neck") | C3–C4 joint
- Sternocleidomastoid → forehead, around the eye, ear, back of the head; may bring a watery eye or runny nose | Muscle trigger point referral with autonomic signs | Sinus pain, ear problems, cervicogenic headache

## test patients
CASE: 1. Desk worker, stiff one side
Drawing: Right side of the neck into the right shoulder blade
Answers: Age = 30 to 49; How did it start? = Gradually, no clear reason; How long = 2 to 6 weeks; Q1 = stiff or painful turning to one side; Q6 = long spells at a desk, screen, or driving + looking down; Q7 = stiff at first, then eases as I move
Flags: none
Expect: top condition = Neck pain with mobility deficits; must not show = radiculopathy; route = results

CASE: 2. Neck to thumb and index finger
Drawing: Neck and down the right arm to the thumb and index finger
Answers: Age = 30 to 49; Gradually, no clear reason; 6 weeks to 3 months; Q2 = past the elbow + arm worse than neck + pins and needles in particular fingers + hand on head eases it; Q3 = yes, it goes down the arm
Flags: none
Expect: top condition = radiculopathy; must not show = mobility deficits as top, any shoulder condition; route = results

CASE: 3. Highway crash within 48 hours
Drawing: Centre of the neck
Answers: Age = 50 to 64; After a car accident or whiplash-type jolt; Less than 2 weeks; I1 = Yes, a car or other vehicle accident; I2 = Within the last 48 hours; I4 = A crash at highway speed, a rollover, or being thrown from the vehicle
Flags: injury screen step 1 (dangerous mechanism)
Expect: top condition = none; must not show = any condition, any booking, the neck-turn question (I7); route = 911

CASE: 4. Shoulder look-alike
Drawing: Top of the left shoulder and upper arm, stopping above the elbow
Answers: Age = 50 to 64; Gradually, no clear reason; 6 weeks to 3 months; Q1 = I can turn fully both ways; Q2 = pain stops at the top of the shoulder or upper arm; Q8 = moving my shoulder and arm
Flags: none
Expect: top condition = no neck condition, "this may be coming from your shoulder" card; must not show = radiculopathy, mobility deficits; route = results (suggest shoulder check)

CASE: 5. Cervicogenic headache
Drawing: Back of the neck and back of the head on the right
Answers: Age = 18 to 29; Gradually, no clear reason; More than 3 months; Q1 = stiff or painful turning to one side; Q4 = one-sided, starting at the back of the neck or head + brought on by neck movement or holding one position; Q6 = long spells at a desk, screen, or driving
Flags: none
Expect: top condition = cervicogenic headache; must not show = migraine or tension-type as top, any physician-first message; route = results

CASE: 6. Heart look-alike
Drawing: Left side of the neck, left jaw, and inside of the left arm
Answers: Age = 50 to 64; Gradually, no clear reason; Less than 2 weeks; Q1 = I can turn fully both ways; Q6 = lifting or carrying
Flags: Is the pain in your neck, jaw, or left arm brought on by effort, or does it come with chest tightness, shortness of breath, or sweating?
Expect: top condition = none; must not show = any neck condition, any booking, radiculopathy; route = 911
