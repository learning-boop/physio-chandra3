---
# From "Cervical assessment.docx" (Joint wise assessment folder), 24 Sep 2026.
# Built into src/data/symptomGuideExtra.js (neck) and src/data/injuryScreen.js.
# Test patients: npm run check:regions
region: neck
name: Neck (cervical spine)
source: Blanpied PR et al. Neck Pain: Revision 2017. JOSPT 47(7), 2017; Rushton A et al. International IFOMPT Cervical Framework. JOSPT 53(1), 2023; Stiell IG et al. The Canadian C-Spine Rule. JAMA 286, 2001; Wainner RS et al. Radiculopathy test cluster. Spine 28, 2003; Cook C et al. Cervical myelopathy clinical findings cluster. JOSPT 40, 2010; Bogduk N. Definitions and physiology of back pain, referred pain, and radicular pain. Pain 147, 2009; Cloward RB. Cervical diskography. Ann Surg 150, 1959; Donnelly JM et al. Travell, Simons & Simons' Myofascial Pain and Dysfunction, 3rd ed., 2019
reviewed_by: Chandra Matla, Registered Physiotherapist
reviewed_on: DRAFT prepared 23 Sep 2026, awaiting Chandra's review
# 26 Sep 2026: spinal cord (DCM) pattern added from "Cervical Myelopathy.docx"
# (Conditions/Neck and headache, draft v0.1): questions 9 and 10, condition
# content/conditions/neck-dcm.md, test patients 7 to 11, and the flag changes
# marked (DCM) below.
# 26 Sep 2026: reviewed against the JOSPT 2017 Perspectives for Practice
# flow chart, and "Translating the Neck Pain Clinical Guidelines Into
# Practice: An Integrated Framework Approach" (JOSPT Open 2025;3(2)): the four neck conditions already match the CPG's four groups. Added the
# CPG's expected findings and stage-matched interventions to each
# condition's ## clinicNotes (clinician summary only), and the arm weakness
# option to question 2.
# 28 Sep 2026: cervicogenic dizziness added from "Cervicogenic dizziness.docx"
# (Conditions/Neck and headache, draft v0.1): a dizziness answer on question 9,
# question 11, condition content/conditions/neck-cgd.md, two final-check
# flags (heart; ear or worsening), the BPPV and inner-ear look-alike cards,
# and test patients 14 to 19. Marked (CGD) below.
---

## red flags
<!-- "Ask only if" is an addition: the two shoulder-tip flags are asked only
     when a shoulder is drawn. -->
- Have you had a sudden, severe headache, the worst you have ever had? | emergency | Possible bleed or artery tear in the neck or head
<!-- (CGD) Chandra, 28 Sep 2026: dizziness alone no longer ticks the stroke
     flag, so neck-related dizziness is not sent to 911. More sudden stroke
     signs added; new, sudden dizziness WITH a sign is its own flag. -->
- Since this started, have any of these come on suddenly: a drooping or numb face, weakness or numbness in an arm or leg on one side, slurred speech or trouble finding or understanding words, loss of sight or double vision, trouble swallowing, sudden confusion, or falls or blackouts? | emergency | Stroke or cervical artery warning signs (IFOMPT framework)
- Have you had new, sudden dizziness or room spinning together with any of these: being unable to stand or walk without help, vomiting, a new severe headache or neck pain, double vision, slurred speech, a numb face, weakness on one side, or eyes that flicker or jump? | emergency | New, sudden dizziness with these signs can be a stroke at the back of the brain
<!-- (DCM) The stroke flag now asks what came on suddenly, so a walk that
     has changed slowly over months goes to the myelopathy questions, not 911.
     "Unable to pass urine" and the manipulation flag are from the DCM
     document's red flags. New numbness after a fall or injury is already
     asked by the injury screen (I5). -->
- Along with the neck pain, have you lost control of your bladder or bowels, been unable to pass urine, or had new numbness or weakness in both legs? | emergency | Acute spinal cord compression
- Since a neck manipulation or adjustment (having your neck "cracked"), have you had new numbness or weakness in your arms or legs? | emergency | New nerve or spinal cord symptoms after a neck manipulation
<!-- Added 26 Sep 2026 at Chandra's instruction: after a car accident or a hard
     knock to the head or neck, ongoing dizziness or any of the 5 Ds and 3 Ns
     -> a doctor today; getting quickly worse, or new in the last few days ->
     Emergency. However long ago, and whether or not it came on suddenly.
     Shared by the neck, base of the neck and head: each asked once. -->
- Since a car accident or a hard knock to your head or neck, are dizziness or any of these getting quickly worse, or did they start in the last few days: double vision, slurred speech, trouble swallowing, sudden falls or blackouts, feeling sick, numbness in your face or around your lips, or eyes that flicker or jump? | emergency | Getting worse, or new in the last few days, after an accident or a hard knock: possible damage to a neck artery or the brain (5 Ds and 3 Ns)
- Since a car accident or a hard knock to your head or neck, have you had dizziness that keeps coming back or will not go away, or any of these, even if they are not getting worse: double vision, slurred speech, trouble swallowing, sudden falls or blackouts, feeling sick, numbness in your face or around your lips, or eyes that flicker or jump? | urgent, same day | Ongoing dizziness or nerve signs after an accident or a hard knock need a doctor today
- Do you have a fever with a stiff neck, a bad headache, or find bright light hard to look at? | emergency | Possible meningitis
- Is the pain in your neck, jaw, or left arm brought on by effort, or does it come with chest tightness, shortness of breath, or sweating? | emergency | Heart pain can be felt in the neck, jaw, and arm
<!-- (DCM) Was: "Have your hands become clumsy (buttons, writing, dropping
     things), or has your walking become unsteady?" (urgent). The slow pattern
     is now asked in questions 9 and 10 and scored; only fast change stays here. -->
- Over the last few days or weeks, have your hands been getting quickly clumsier (buttons, writing, dropping things), or your walking quickly more unsteady? | urgent, same day | Spinal cord pressure that is getting worse quickly needs a doctor today
- Do you need to hold your head up with your hands, or does moving your neck cause tingling around your lips or mouth? | urgent | Possible upper neck instability
<!-- (CGD) Chandra, 28 Sep 2026: severe pain never felt before, or symptoms
     changing fast -> Emergency; shared with the head, asked once. -->
- Since a neck manipulation, a sudden jerk, or a minor knock, have you had neck pain or a headache that is severe and unlike anything you have felt before, or symptoms that are changing or getting worse quickly? | emergency | Severe new pain or fast-changing symptoms after a neck manipulation, jerk or knock: possible neck artery tear
- Did a new neck pain or headache, different from any you have had before but not severe, start suddenly after a neck manipulation, a sudden jerk, or a minor knock? | urgent | Early sign of a neck artery tear can be pain alone (IFOMPT framework)
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
- Weakness in that arm or hand, such as a weaker grip   (added 26 Sep 2026: myotomal weakness, JOSPT 2017 CPG)
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

<!-- (DCM) Questions 9 and 10 go beyond the 8-question guide on purpose:
     question 9 replaced a safety-screen question everyone was asked, so it
     is asked of everyone, first. -->
Q: Have you noticed any of these changes? Tick all that apply.
- Numbness or pins and needles in both hands
- My hands have become clumsy: buttons, writing, using a phone, or dropping things
- My walking or balance has changed: unsteady, tripping, or legs feel stiff or heavy
- Bending my head forward sends an electric feeling down my back, arms, or legs
- Feeling dizzy, light-headed, or off-balance at times   (CGD: opens question 11; not a cord sign)
- None of these
Ask first, always.

Q: How have these hand or walking changes behaved over time?
- Slowly getting worse over months or years
- Staying about the same, or coming and going
- Getting better
Ask only if: question 9 has a cord sign (anything but "None of these" or dizziness); then asked straight after it. (Getting quickly worse over days or weeks is the same-day safety flag.)

<!-- (CGD) The document's seven scored questions in one. Its Q2 (neck pain)
     is everyone on this path; its Q5 (after an injury) is "How did it start?",
     and a recent injury goes through the injury screen first. -->
Q: About the dizziness: which of these apply? Tick all that apply.
- I feel unsteady or off-balance, rather than the room spinning
- The room spins   (shows the inner-ear card)
- It started around the same time as my neck pain
- Turning my head, or holding it in one position (desk, driving, looking up), brings it on
- When my neck feels better, the dizziness is better too
- Rolling over in bed or lying down brings on a short burst of spinning, under a minute   (scores against; shows the BPPV card)
- Hearing changes, ringing, or a full feeling in one ear   (scores against; shows the inner-ear card)
Ask only if: question 9 includes dizziness; then asked straight after it.

## final check (answers-dependent)
<!-- (CGD) Asked after the questions when dizziness is ticked in question 9
     (src/data/patternChecks.js). The document's other dizziness flags are
     already on the first safety pages: stroke signs (nrf-artery), sudden
     severe headache or neck pain (nrf-thunderclap, nrf-cad-severe, nrf-cad), new sudden dizziness with a stroke sign (nrf-dizzystroke), after an injury (injury
     screen I5, trauma5d). -->
- With the dizziness: fainting, chest pain, a racing or irregular heartbeat, or shortness of breath | emergency | Heart or blood pressure cause
- Sudden hearing loss in one ear, or dizziness that is constant and getting worse, with vomiting or new headaches | urgent, same day | Inner ear or brain to be checked first

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
- Neck (spinal cord) → both hands, and the legs; neck pain may be mild or absent | Degenerative cervical myelopathy: both hands numb or clumsy, walking changes, not in one nerve strip | Carpal tunnel in both hands (no walking change), radiculopathy (one arm in a strip), lumbar stenosis (legs only, eased by sitting), peripheral neuropathy (starts in the feet), MS or B12 deficiency
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

CASE: 7. Numb, clumsy hands and an unsteady walk (cervical myelopathy)
Drawing: Centre of the neck
Answers: Age = 65 or over; Gradually, no clear reason; More than 3 months; Q1 = stiff or painful turning both ways; Q9 = both hands + clumsy + walking; Q10 = slowly getting worse over months or years
Flags: none
Expect: top condition = cervical myelopathy, with its see-your-doctor note; first question = Q9; route = results

CASE: 8. Neck pain, no hand or walking changes
Drawing: Centre of the neck
Answers: Age = 50 to 64; Gradually, no clear reason; More than 3 months; Q1 = stiff or painful turning to one side; Q9 = None of these; Q6 = long spells at a desk; Q7 = stiff at first, then eases
Flags: none
Expect: top condition = mechanical neck pain; must not show = myelopathy; Q10 not asked; route = results

CASE: 9. One arm in a strip, walking normal
Drawing: Neck and down the right arm to the hand
Answers: Age = 50 to 64; Gradually, no clear reason; 6 weeks to 3 months; Q9 = None of these; Q2 = past the elbow + arm worse than neck + particular fingers + hand on head eases it; Q3 = yes, it goes down the arm
Flags: none
Expect: top condition = radiculopathy; must not show = myelopathy; route = results

CASE: 10. Hands and walking getting quickly worse over weeks
Drawing: Centre of the neck
Answers: Age = 65 or over; Gradually, no clear reason; 2 to 6 weeks
Flags: Over the last few days or weeks, have your hands been getting quickly clumsier…?
Expect: route = see a doctor today

CASE: 11. New arm numbness after a neck manipulation
Drawing: Centre of the neck
Answers: Age = 30 to 49; Gradually, no clear reason; Less than 2 weeks
Flags: Since a neck manipulation or adjustment…, have you had new numbness or weakness in your arms or legs?
Expect: route = 911

<!-- (CGD) Test patients 12 and 13 (post-injury dizziness) are in scripts/check-region-tests.mjs. -->
CASE: 14. Desk worker, unsteady when holding the head still (cervicogenic dizziness)
Drawing: Back of the neck and back of the head
Answers: Age = 30 to 49; After long hours at a desk; More than 3 months; Q1 = stiff or painful turning to one side; Q9 = dizzy; Q11 = unsteady + started with the neck pain + head position brings it on + better when the neck is better; Q6 = long spells at a desk
Flags: none
Expect: top condition = cervicogenic dizziness; Q9 and Q11 asked, Q10 not asked; must not show = myelopathy; route = results

CASE: 15. Dizzy since a car accident 3 months ago, linked to the neck
Drawing: Centre of the neck
Answers: Age = 30 to 49; After a car accident; 6 weeks to 3 months; Q9 = dizzy; Q11 = unsteady + head position brings it on; Q5 = neck gets tired + pain has spread
Flags: none ticked in the test. A real patient would usually tick the ongoing-dizziness-after-an-accident flag (see a doctor today); the questions still continue to this result.
Expect: top condition = cervicogenic dizziness or whiplash; route = results

CASE: 16. BPPV look-alike: short spins rolling over in bed
Drawing: Centre of the neck
Answers: Age = 50 to 64; Gradually; 2 to 6 weeks; Q1 = stiff one side; Q9 = dizzy; Q11 = the room spins + short spins rolling over in bed; Q6 = desk
Flags: none
Expect: must not show = cervicogenic dizziness; BPPV card; route = results

CASE: 17. Inner-ear look-alike: spinning with ringing in one ear
Drawing: Centre of the neck
Answers: Age = 50 to 64; Gradually; 2 to 6 weeks; Q9 = dizzy; Q11 = the room spins + ear symptoms + head position brings it on
Flags: none
Expect: must not show = cervicogenic dizziness; inner-ear card; route = results

CASE: 18. No dizziness
Drawing: Centre of the neck
Answers: Age = 30 to 49; Gradually; 2 to 6 weeks; Q1 = stiff one side; Q9 = None of these; Q6 = desk; Q7 = stiff at first, then eases
Flags: none
Expect: top condition = mechanical neck pain; Q10 and Q11 not asked; route = results

CASE: 19. The document's threshold: 5 points shown (unsteady + head position), 4 points not (unsteady + better when the neck is better)

CASE: 20. New, sudden spinning with vomiting and unable to walk
Drawing: Centre of the neck
Answers: Age = 50 to 64; Gradually; Less than 2 weeks
Flags: Have you had new, sudden dizziness or room spinning together with any of these…?
Expect: route = 911

CASE: 21. Severe neck pain, never felt before, after a neck manipulation
Drawing: Centre of the neck
Answers: Age = 30 to 49; After lifting or a sudden movement; Less than 2 weeks
Flags: Since a neck manipulation, a sudden jerk, or a minor knock, … severe and unlike anything you have felt before, or … changing quickly?
Expect: route = 911 (the same flag is asked once when the head is drawn too)

CASE: 22. New but not severe neck pain after a neck manipulation
Drawing: Centre of the neck
Answers: Age = 30 to 49; After lifting or a sudden movement; Less than 2 weeks
Flags: Did a new neck pain or headache, different from any you have had before but not severe, start suddenly after…?
Expect: route = see your doctor
