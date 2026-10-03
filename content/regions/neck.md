---
# From "Cervical assessment.docx" (Joint wise assessment folder), 24 Sep 2026.
# Built into src/data/symptomGuideExtra.js (neck) and src/data/injuryScreen.js.
# Test patients: npm run check:regions
region: neck
name: Neck (cervical spine)
source: Blanpied PR et al. Neck Pain: Revision 2017. JOSPT 47(7), 2017; Rushton A et al. International IFOMPT Cervical Framework. JOSPT 53(1), 2023; Stiell IG et al. The Canadian C-Spine Rule. JAMA 286, 2001; Wainner RS et al. Radiculopathy test cluster. Spine 28, 2003; Cook C et al. Cervical myelopathy clinical findings cluster. JOSPT 40, 2010; Bogduk N. Definitions and physiology of back pain, referred pain, and radicular pain. Pain 147, 2009; Cloward RB. Cervical diskography. Ann Surg 150, 1959; Donnelly JM et al. Travell, Simons & Simons' Myofascial Pain and Dysfunction, 3rd ed., 2019
reviewed_by: Chandra Matla, Registered Physiotherapist
# The document still says "DRAFT prepared 23 Sep 2026, awaiting Chandra's review"; Chandra signed the neck region, and cervical myelopathy, on 28 Sep 2026.
reviewed_on: 2026-09-28
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
# 28 Sep 2026: "Neck Pain Mobility Deficits.docx" (signed), "Whiplash WAD.docx"
# and "Cervicogenic Headache.docx" (drafts; whiplash signed 28 Sep 2026), all v0.1 in
# Conditions/Neck and headache: the conditions neck-mech, neck-whiplash and
# neck-cheadache (with head-cgh) rebuilt from them; question 4 gains two
# answers, question 5 is rebuilt; the meningitis, upper-neck and
# after-an-accident flags gain wording; a headache check in the final check;
# test patients 23 to 30. Marked (docs) below.
# 28 Sep 2026: "Cervical Radiculopathy.docx" (Conditions/Neck and headache,
# v1.1, approved): condition content/conditions/neck-radic.md rebuilt from it;
# question 2 carries its Q1, Q2, Q3, Q5 and Q6 (alternatives share an
# exclusive group: ticking one clears the other, and only one counts to the
# maximum); question 3 gains "turning" and "Sometimes" (its Q4); question 12
# is its Q9 (which fingers, level tag only); its Q8 is question 9 (spinal cord
# signs override the score). The heart question now asks about any arm, chest
# pain or pressure, and feeling sick. Its reasoning appendix (dermatomes,
# radiating patterns, nerve maps) is content/reference/cervical-radiculopathy.md.
# Test patients 31 to 35. Marked (radic) below.
# 28 Sep 2026: "Cervicogenic Headache 1.docx" and "Upper Cervical Pain headache
# related.docx" (Conditions/Neck and headache, v1.0, both signed 28 Sep 2026).
# The old single record is split: neck-cheadache (with head-cgh) is the
# headache-led picture; content/conditions/neck-upper.md is new, pain at the
# top of the neck without a main headache. Question 13 is new (where in the
# neck; the drawing answers it when marked high or low on the back of the
# neck); question 4 gains "always the same side" and "only an occasional
# ache"; the upper-neck instability flag gains Down syndrome, steroids, a head
# too heavy to hold up and a lump in the throat; an over-50 check
# (polymyalgia rheumatica, giant cell arteritis) in the final check. The
# jaw's "what brings it on" question is asked early when the neck is drawn
# too. Reasoning appendix: content/reference/upper-cervical.md. Test
# patients 36 to 40. Marked (upper) below.
# 28 Sep 2026: "Cervical Neural Mechanosensitivity.docx" (Conditions/Neck and
# headache, v1.0, approved): condition content/conditions/neck-neural.md.
# Question 14 is new (its Q1, Q2, Q3, Q5 and Q8), asked early after a
# nerve-type answer on question 2 and before question 12; question 12 gains
# a radial tag (its Q7). The cord emergency question adds numbness or
# weakness spreading quickly in both hands and feet. Reasoning appendix:
# content/reference/neural-mechanosensitivity.md. Test patients 41 to 45.
# Marked (neural) below.
---

## red flags
<!-- Shorter questionnaire (Chandra, 28 Sep 2026; "Shorter questionnaire - draft for approval.docx", all of A, B and C accepted): questions
     that asked the same thing are merged (A1: 9 emergency questions -> 5;
     A2: 6 doctor questions -> 4, counting the general fever/cancer one).
     Earlier history: the stroke flag asks only what came on suddenly (DCM,
     26 Sep); dizziness alone does not count (CGD, 28 Sep); the 5 Ds and 3 Ns
     after an accident (26 Sep); severe pain after a manipulation, jerk or
     knock is an emergency (28 Sep). A merged question stands in for the
     head's and base of the neck's matching questions, so each is asked once.
     The two shoulder-tip questions are asked only when a shoulder is drawn. -->
- Since this started, has any of these come on suddenly: the worst headache of your life; a drooping or numb face; weakness or numbness in an arm or leg on one side; slurred speech, or trouble finding or understanding words; loss of sight or double vision; trouble swallowing; confusion, falls or blackouts; or new dizziness or spinning with vomiting, or being unable to stand or walk? | 911 | Possible stroke, bleed, or neck artery tear   (A1.1)
- Along with the neck pain, have you lost control of your bladder or bowels, or been unable to pass urine? | emergency | Possible pressure on the spinal cord   (split 2 Oct 2026)
- Along with the neck pain, have you had new numbness or weakness in both legs, numbness or weakness spreading quickly, over hours or days, in both hands and feet, or any trouble breathing or swallowing? | 911 | Acute spinal cord compression, or a nerve condition that is spreading quickly   (neural: hands and feet; split 2 Oct 2026)
- Since a neck manipulation ("cracking"), a car accident, a sudden jerk, or a knock to the head or neck: is the pain severe and unlike anything you have felt before, or are any of these getting quickly worse, or new in the last few days: numbness or weakness in the arms or legs, dizziness, double vision, slurred speech, trouble swallowing, feeling sick or vomiting, a severe or worsening headache, confusion, drowsiness or memory loss, numbness around the lips, or eyes that flicker or jump? | 911 | After a manipulation, accident, jerk or knock: possible neck artery tear, or damage to the spinal cord or brain   (A1.2)
- Do you have a fever with a stiff neck, a bad headache, a rash, or feel very unwell, or find bright light hard to look at? | 911 | Possible meningitis   (docs: rash, feeling very unwell)
- Is the pain in your neck, jaw, or arm brought on by effort, or does it come with chest pain, pressure or tightness, shortness of breath, sweating, or feeling sick? | 911 | Heart pain can be felt in the neck, jaw, and arm
- Did pain at the tip of your left shoulder start after a blow to your tummy or ribs, or does it come with feeling faint or dizzy? | 911 | Possible bleeding from the spleen, felt at the shoulder tip (Kehr's sign) | Ask only if: a shoulder is drawn
- Since a car accident, a neck manipulation, a sudden jerk or a knock to the head or neck, have you had dizziness that keeps coming back, any of the signs above even if they are not getting worse, or a new neck pain or headache that is different from any before? | urgent, same day | After an accident, manipulation, jerk or knock, these need a doctor today   (A2.1)
- Over the last few days or weeks, have you become quickly weaker, number or clumsier in an arm, hand or leg, or has your walking become quickly more unsteady? | urgent, same day | Nerve or spinal cord pressure that is getting worse quickly needs a doctor today   (A2.2; replaces the general "new or worsening weakness" check for the neck)
- Do you have rheumatoid arthritis or another inflammatory arthritis, or Down syndrome, or take steroid tablets long term; does your head feel too heavy to hold up, so you support it with your hands; does moving your neck bring a lump-in-the-throat feeling or tingling around your lips or mouth; or, over recent weeks or months and without an injury, have you developed a hoarse voice, trouble swallowing, numbness or weakness on one side of your face, a drooping eyelid, or double vision that has not gone away? | urgent | A doctor should check before hands-on neck treatment: possible upper neck instability, or unexplained changes in the nerves of the face, eyes or throat   (docs: inflammatory arthritis, mobility deficits document; upper: Down syndrome, steroids, head too heavy, lump in the throat)   (2 Oct 2026, Chandra's request: the gradual cranial nerve signs from the JOSPT neck pain CPG 2017, folded in to keep the doctor page at 3 questions; added after the signed version)
- Is the pain worse after fatty meals or when you breathe in deeply, or does it come with feeling sick, fever, yellow skin or eyes, or not change at all with movement or position? | urgent | The diaphragm, lung lining, liver or gallbladder can be felt at the shoulder | Ask only if: a shoulder is drawn   (A3.3; shared with the shoulder and base of the neck)

## injury screen
<!-- Canadian C-Spine Rule (adapted). Shown straight after the safety check
     when the neck is drawn. Asked in order; the first answer that routes ends
     the screen. The site can only send people on to medical care from here,
     never clear them: spinal tenderness can only be checked in person. -->
I1: Have you injured your neck in the last 7 days, for example in an accident, a fall, or sport?   (28 Sep 2026: "injured", not "been hurt")
- No → skip this screen
- Yes, a car or other vehicle accident → I2
- Yes, a fall → I2
- Yes, sport, or a blow to the head or neck → I2

I2: When did it happen?
- Within the last 48 hours → I8, then I3 to I7
- 2 to 7 days ago → I8, then I3 to I5; any high-risk answer → urgent; none → I9

I8: Since the injury, have you passed out, been drowsy or confused, or did you have alcohol or drugs before it happened; or do you have another very painful injury (for example a broken bone) that takes your attention away from your neck?   (2 Oct 2026, Chandra's request: the rule applies only to alert, sober patients without a distracting injury; Stiell 2001, JOSPT neck CPG 2017; added after the signed version)
- Yes → emergency, 911, keep the neck still (within 48 hours) / urgent, same day (2 to 7 days)
- No → I3

I3: How old are you?   (pre-filled from the age answer; "Under 18" counts as under 16)   (2 Oct 2026, Chandra's request: was "Are you 65 or older?"; the rule was derived in adults, 16 and over; added after the signed version)
- Under 16 → I4 and I5 (a high-risk answer → emergency / urgent as below); otherwise → urgent, same day: a doctor should check a child or teenager after a recent neck injury
- 16 to 64 → I4
- 65 or older → emergency (within 48 hours) / urgent (2 to 7 days)

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

I9 (2 to 7 days ago, no high-risk answer): Since the injury, and not yet checked by a doctor for this, have you had any of these: a headache, feeling foggy or slowed down, trouble concentrating or remembering, dizziness, or being bothered by light or noise?   (2 Oct 2026, Chandra's request: JOSPT concussion CPG 2020: look for an undiagnosed concussion after any concussive event, grade A; within 48 hours everyone sees a doctor anyway; added after the signed version)
- Yes → urgent, same day: possible concussion, a doctor should check first
- No → continue to the neck questions

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

## opening question added 2 Oct 2026
Q: Can you find a tender spot or tight band in a muscle that, when you press it, brings on your usual ache, including the part that spreads?   (2 Oct 2026, Chandra's request: the "Myofascial Pain" document (v0.1 draft); shared on the opening screen with the neck, shoulder, upper back, low back and hip, asked once (id "tender"), so it does not use a scored-question slot; scores the new muscle-referred pain condition; added after the signed version)
- Yes: pressing a tender spot brings on my usual ache, including where it spreads
- There is a tender spot, but pressing it does not spread the ache
- No, or I cannot find one

## questions
Q: When you turn your head to look over your shoulder, what happens?
- I can turn fully both ways
- It is stiff or painful turning to one side
- It is stiff or painful turning both ways
- It is locked and I can barely turn it at all

<!-- (upper) "Upper Cervical Pain" document Q1 and Q4. -->
Q: Where in your neck is the pain mainly? Tick all that apply.   (question 13)
- At the base of my skull, or the very top of my neck   (upper Q1: 3; one of the two)
- In the middle or lower part of my neck   (upper Q1: 1)
- The base of my skull is tender to press, and the pain spreads to the back of my head   (upper Q4: 2)
Answered by the drawing when marked on the back of the neck, high (base of the skull) or low (middle or lower); still asked, for the tenderness answer, when there is room. Asked early after "only an occasional ache" on question 4, or after stiff turning on question 1 unless the drawing runs into the base of the neck, upper back or shoulder.

Q: Which of these describe your arm symptoms? Tick all that apply.
- Pain goes down the arm past the elbow   (radic Q1: 3; one of the two)
- Pain goes into the upper arm, but not past the elbow   (radic Q1: 2; was "Pain stops at the top of the shoulder or upper arm")
- The arm pain is worse than the neck pain   (radic Q2: 3; one of the two)
- The arm and neck pain are about as bad as each other   (radic Q2: 2)
- Pins and needles or numbness in one part of the arm or hand: a strip, or particular fingers   (radic Q3: 3; one of the two)
- Pins and needles or numbness in the whole hand   (radic Q3: 1)
- The arm pain is burning, shooting or electric, or runs in a line down the arm   (radic Q6: 2)
- Resting my hand on top of my head eases the arm pain   (radic Q5: 2)
- Weakness in that arm or hand, such as a weaker grip   (added 26 Sep 2026: myotomal weakness, JOSPT 2017 CPG)
Ask only if: the drawing reaches the arm, or pain quality = "Pins and needles or numbness" or "Burning, shooting or electric"

Q: Does looking up, or turning or tilting your head towards the sore side, send pain or tingling into your arm?   (radic Q4)
- Yes, clearly: it goes down the arm   (3)
- Sometimes   (1)
- It hurts in the neck, but not the arm
- No, neither
Ask only if: question 2 has any arm answer; asked early when it has a nerve-type one (past the elbow, pins and needles, burning)

<!-- (neural) The document's Q1, Q2, Q3, Q5 and Q8. Its Q4 (tingling or
     burning) is question 2 and its Q6 (neck movement changes the arm) is
     question 3; its Q9 (both hands, clumsy, walking) is question 9. -->
Q: About the arm symptoms: which of these apply? Tick all that apply.   (question 14)
- The symptoms run along a line in the arm, for example the inner arm to the little finger, or the front of the forearm to the thumb side   (neural Q1: 3; one of the two)
- The symptoms are spread over a vague area of the arm   (neural Q1: 1)
- Positions that stretch the arm clearly bring them on: reaching behind you, the arm out with the wrist bent back, or the elbow fully bent   (neural Q2: 3; one of the two)
- Those stretch positions sometimes bring them on   (neural Q2: 1)
- In that position, tilting my head away from the sore side makes it worse   (neural Q3: 2)
- It is tender to press along the nerve: the inner upper arm, the funny-bone groove, or the front of the wrist   (neural Q5: 1)
- Numbness that does not go away, weakness, or the hand muscles getting thinner   (neural Q8: not scored; "book promptly" card)
Ask only if: question 2 has a nerve-type answer (past the elbow, pins and needles, burning); then asked early, before question 12.

Q: Which fingers do the pins and needles or numbness affect most?   (radic Q9: level tag only, not scored)
- Thumb and index finger   (C6)
- Middle finger   (C7)
- Ring and little fingers   (C8)
- The back of the thumb and the web between the thumb and index finger   (neural Q7: radial nerve tag)
- Not sure, or they vary
Ask only if: question 2 = pins and needles in one part; asked early once question 14 is answered. With a line down the arm the base of the neck is asked too, and the 5 questions then usually run out before this one (OPEN for Chandra).

Q: If you get headaches with this, what are they like?
- One-sided, always the same side, starting at the back of the neck or head   (upper: "always the same side", headache Q2)
- Brought on by neck movement or holding one position
- Both sides, like a tight band or pressure
- Throbbing, with feeling sick or finding light hard to take
- Pressing at the base of my skull brings on my usual headache   (docs: headache Q5)
- I take pain relief for headaches on 10 or more days a month   (docs: headache Q7; shows the medication-overuse card)
- Only an occasional ache at the back of my head; headaches are not my main problem   (upper: upper neck Q5; one of the two with the next)
- I do not get headaches
Ask only if: the drawing includes the head, or age is under 50

Q: Since your accident or injury, which of these apply? Tick all that apply.
- The pain or stiffness started within 2 days of the injury   (docs: whiplash Q2)
- My neck feels weak, tired or hard to hold steady (holding my head up, end of the day)   (docs: whiplash Q4)
- Headaches at the back of my head, or pain across my shoulders or upper back   (docs: whiplash Q5)
- Pins and needles, numbness or weakness in my arms or hands   (docs: whiplash Q6; not scored; shows "see your doctor as well")
- I find it hard to stop thinking about the accident, or I feel on edge or easily startled   (docs: whiplash Q7; not scored; shows "extra support is available")
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
- With the dizziness: fainting, chest pain, a racing or irregular heartbeat, or shortness of breath | 911 | Heart or blood pressure cause
- Sudden hearing loss in one ear, or dizziness that is constant and getting worse, with vomiting or new headaches | urgent, same day | Inner ear or brain to be checked first
<!-- (docs) From the headache document's red flags (SNNOOP10), when question 4
     reports a headache and the head is not drawn (the head asks these itself). -->
- With the headaches: a new headache after age 50 with a tender scalp, jaw pain when chewing or vision changes; a headache that wakes you with vomiting, is worse lying down, coughing or straining, or is getting steadily worse over weeks; or a new headache in pregnancy or after giving birth | urgent, same day | Giant cell arteritis or another secondary headache
<!-- (upper) Age 50 or over, the neck drawn without the head, and no headache
     reported (the headache check above asks about giant cell arteritis). -->
- New stiffness in both shoulders and your neck lasting more than 45 minutes in the morning, with feeling unwell; or a tender scalp, jaw pain when chewing, or changes in your vision | urgent, same day | Polymyalgia rheumatica or giant cell arteritis

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
Answers: Age = 50 to 64; After a car accident or whiplash-type jolt; Less than 2 weeks; I1 = Yes, a car or other vehicle accident; I2 = Within the last 48 hours; I8 = No; I4 = A crash at highway speed, a rollover, or being thrown from the vehicle
Flags: injury screen step 1 (dangerous mechanism)
Expect: top condition = none; must not show = any condition, any booking, the neck-turn question (I7); route = 911

CASE: 3b. Crash 4 days ago, foggy and headachy since (2 Oct 2026)
Drawing: Centre of the neck
Answers: Age = 30 to 49; After a car accident or whiplash-type jolt; Less than 2 weeks; I1 = Yes, a car or other vehicle accident; I2 = 2 to 7 days ago; I8 = No; I4 = None of these; I5 = No; I9 = Yes
Flags: injury screen I9 (possible concussion)
Expect: top condition = none; route = see a doctor first (same day)

CASE: 3c. Teenager, neck hurt in sport yesterday (2 Oct 2026)
Drawing: Centre of the neck
Answers: Age = Under 18; Sport; Less than 2 weeks; I1 = Yes, sport, or a blow to the head or neck; I2 = Within the last 48 hours; I8 = No; I4 = None of these; I5 = No
Flags: injury screen I3 (under 16: the adult rule does not apply)
Expect: top condition = none; must not show = the low-risk and neck-turn questions (I6, I7); route = see a doctor first (same day)

CASE: 3d. Drinking before a crash yesterday (2 Oct 2026)
Drawing: Centre of the neck
Answers: Age = 18 to 29; After a car accident or whiplash-type jolt; Less than 2 weeks; I1 = Yes, a car or other vehicle accident; I2 = Within the last 48 hours; I8 = Yes
Flags: injury screen I8 (not alert or sober: the rule cannot be applied)
Expect: top condition = none; must not show = the mechanism question (I4); route = 911

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
Flags: Is the pain in your neck, jaw, or arm brought on by effort, or does it come with chest pain, pressure or tightness, shortness of breath, sweating, or feeling sick?
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

<!-- (docs) Test patients 20 to 22 (stroke signs, severe pain after a manipulation) are in scripts/check-region-tests.mjs. -->
CASE: 23. Woke up with a stiff neck, worse at the desk and looking up (mobility deficits)
Answers: Age = 30 to 49; Woke up with it; Less than 2 weeks; Q9 = None of these; Q1 = stiff one side; Q6 = desk + looking up; Q7 = stiff at first, then eases
Expect: top condition = stiff, sore neck (mobility deficits); must not show = whiplash, myelopathy

CASE: 24. Rear-ended 3 weeks ago, stiff both ways, neck tired (whiplash)
Answers: Age = 30 to 49; After a car accident; 2 to 6 weeks; Q9 = None of these; Q1 = stiff both ways; Q5 = within 2 days + weak or tired + headaches or shoulder pain
Expect: top condition = whiplash

CASE: 25. No accident: whiplash is never suggested
Answers: Age = 30 to 49; Gradually; 2 to 6 weeks; Q1 = stiff both ways; Q6 = desk; Q7 = eases
Expect: must not show = whiplash; Q5 not asked

CASE: 26. After a crash, tingling in the hands
Answers: After a car accident; Q5 = within 2 days + pins and needles or weakness in the arms or hands
Expect: "see your doctor as well" card

CASE: 27. After a crash, on edge and reliving it
Answers: After a car accident; Q5 = within 2 days + weak or tired + on edge
Expect: top condition = whiplash; "extra support is available" card

CASE: 28. One-sided headache from the neck (neck-related headache)
Answers: Age = 30 to 49; After long hours at a desk; More than 3 months; Q1 = stiff one side; Q4 = one-sided from the back + brought on by neck movement + pressing the skull brings it on; Q6 = desk
Expect: top condition = neck-related headache

CASE: 29. Pain relief for headaches on most days
Answers: as 28, with Q4 = 10 or more days a month of pain relief
Expect: top condition = neck-related headache; medication-overuse card

CASE: 30. Rheumatoid arthritis with new neck pain
Flags: Do you have rheumatoid arthritis or another inflammatory arthritis…?
Expect: route = see your doctor

<!-- (radic) From "Cervical Radiculopathy.docx" v1.1 (approved 28 Sep 2026). -->
CASE: 31. Classic nerve root picture into the thumb (C6)
Drawing: Neck and down the right arm to the wrist
Answers: Age = 50 to 64; Gradually, no clear reason; 6 weeks to 3 months; Q9 = None of these; Q2 = past the elbow + arm worse than neck + pins and needles in one part + burning or shooting + hand on head eases it; Q3 = yes, clearly; Q12 = thumb and index finger
Expect: top condition = radiculopathy; Q2 and Q3 asked; route = results. (Q12 was asked until question 14 was added on 28 Sep 2026; it now falls outside the 5 questions here.)

CASE: 32. Both hands clumsy with an arm line (the document's Q8)
Answers: Age = 65 or over; Q9 = both hands + clumsy; Q10 = slowly getting worse; Q2 = past the elbow + arm worse + pins and needles in one part; Q3 = yes, clearly
Expect: top condition = cervical myelopathy with its see-your-doctor note; must not show = radiculopathy

CASE: 33. Ache into the upper arm, neck worse, no tingling
Drawing: Neck and right shoulder
Answers: Q9 = None of these; Q1 = stiff one side; Q2 = upper arm, not past the elbow; Q3 = neck but not the arm; Q6 = desk + looking down; Q7 = eases; Q8 = moving my neck
Expect: must not show = radiculopathy (the document's rule). OPEN: mechanical neck pain is not reached either; with the shoulder drawn, the 5-question budget is spent before questions 1, 6 and 7 (the same before this document).

CASE: 34. The document's "possible" band: 7 points is shown
Answers: Q2 = past the elbow (3) + about as bad (2) + hand on head (2); Q3 = No, neither
Expect: top condition = radiculopathy

CASE: 35. Below the band: 6 points is not shown
Answers: Q2 = past the elbow (3) + whole hand (1) + hand on head (2); Q3 = No, neither
Expect: must not show = radiculopathy

<!-- (upper) From "Upper Cervical Pain headache related.docx" and "Cervicogenic
     Headache 1.docx" (v1.0 drafts, 28 Sep 2026). -->
CASE: 36. Base of the skull, stiff turning one way, worse looking up and at the screen
Drawing: High on the back of the neck and the back of the head
Answers: Age = 30 to 49; After long hours at a desk; 2 to 6 weeks; Q9 = None of these; Q13 = base of the skull + tender (the drawing answers base of the skull); Q1 = stiff one side; Q6 = desk + looking up; Q7 = stiff at first, then eases; Q4 = only an occasional ache; head D1 = always the same side; D3 = my neck is fine
Expect: top condition = upper neck pain; must not be on top = neck-related headache. (36b: the same with the neck only drawn: question 13 is asked.)

CASE: 37. The same picture, but the headache is the main problem
Answers: Q13 = base of the skull; Q1 = stiff one side; Q4 = one-sided + neck movement + pressing the skull
Expect: top condition = neck-related headache; upper neck pain not on top

CASE: 38. Pain in the middle and lower neck
Drawing: Neck into the upper back
Answers: Q13 = middle or lower neck; Q1 = stiff one side; Q6 = desk + looking down; Q7 = eases
Expect: top condition = stiff, sore neck (mobility deficits); upper neck pain not on top

CASE: 39. The document's "possible" line: 5 points shown (base of the skull + stiff one way); 4 not (middle of the neck + stiff one way + desk)

<!-- (neural) From "Cervical Neural Mechanosensitivity.docx" v1.0 (approved 28 Sep 2026). -->
CASE: 41. Tingling along the inner arm to the little finger, brought on by stretch positions
Drawing: Neck and down the right arm to the hand
Answers: Q9 = None of these; Q2 = pins and needles in one part + burning; Q14 = along a line + stretch positions clearly + tilting away + tender; Q3 = No, neither
Expect: top condition = sensitive nerve in the arm; Q14 asked

CASE: 42. The same, and neck movement clearly sends it down the arm
Answers: Q2 = past the elbow + arm worse + one part + burning; Q14 = line + stretch + tilting away; Q3 = yes, clearly
Expect: sensitive nerve and radiculopathy both shown (the document's rule A6)

CASE: 43. The document's "possible" line: 5 points shown (whole hand + vague area + tilting away + tender); 4 not (whole hand + vague + stretch sometimes + tender)

CASE: 44. Numbness that does not go away
Answers: Q2 = one part; Q14 = line + stretch + numbness that does not go away
Expect: top condition = sensitive nerve; "book promptly" card

CASE: 45. Both hands numb and clumsy with a nerve-type arm line
Answers: Age = 65 or over; Q9 = both hands + clumsy; Q10 = slowly worse; Q2 = one part + burning; Q14 = line + stretch + tilting away
Expect: top condition = cervical myelopathy; must not show = sensitive nerve

CASE: 40. Base-of-the-skull pain since a car accident
Answers: After a car accident; Q13 = base of the skull + tender; Q1 = stiff one side; Q5 = within 2 days + weak or tired + headaches or shoulder pain
Expect: top condition = whiplash; must not show = upper neck pain
