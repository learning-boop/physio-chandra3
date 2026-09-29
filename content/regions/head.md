---
# From "Head assessment.docx" (Joint wise assessment folder), 25 Sep 2026.
# Built into src/data/symptomGuideExtra.js (head). Conditions: content/conditions/head-*.md.
# Body map: the head above eye level — temples, forehead, scalp and the back
# of the head (the lower face is the jaw, content/regions/jaw.md).
# "Neck-related headache" is shared with the neck (neck-cheadache.md): same
# name and text, shown once when both are asked.
# Test patients: npm run check:regions
region: head
name: Head (headaches)
source: Do TP et al. Red and orange flags for secondary headaches (SNNOOP10). Neurology 92(3), 2019; Headache Classification Committee of the IHS. ICHD-3. Cephalalgia 38(1), 2018; Blanpied PR et al. Neck Pain: Revision 2017 (neck pain with headache). JOSPT 47(7), 2017; Rushton A et al. International IFOMPT Cervical Framework. JOSPT 53(1), 2023; Donnelly JM et al. Travell, Simons & Simons' Trigger Point Manual, 3rd ed., 2019
reviewed_by: Chandra Matla, Registered Physiotherapist
reviewed_on: DRAFT prepared 23 Sep 2026, awaiting Chandra's review
# 28 Sep 2026, shorter questionnaire (Chandra, 28 Sep 2026; "Shorter questionnaire - draft for approval.docx", all of A, B and C accepted):
# the neck's merged questions stand in for the sudden headache, stroke signs, severe pain after a manipulation, and the 5 Ds and 3 Ns when the neck is also drawn (A1); asked once.
# The flag lines below are the document as written; src/data holds the merged wording.
# 28 Sep 2026: "Cervicogenic Headache 1.docx" (Conditions/Neck and headache,
# v1.0 draft, not yet signed; its region is the head, cross-linked to the
# neck): condition head-cgh (with neck-cheadache) rebuilt from it; question 3
# gains "sometimes", stiff turning to one side and "started with neck pain";
# question 2 gains brief shooting scalp pains (occipital neuralgia card); the
# meningitis, giant cell arteritis and pressure flags gain wording; the
# upper-neck instability question in the final check when the neck is not
# drawn. Reasoning appendix: content/reference/upper-cervical.md. Test
# patients 6 to 8. Marked (cgh) below.
---

## red flags
<!-- Flags that ask the same thing as the neck's or jaw's (thunderclap,
     stroke, meningitis, giant cell arteritis, neck artery tear) are shown
     once when those areas are drawn too. -->
<!-- Added 26 Sep 2026 at Chandra's instruction: after a car accident or a hard
     knock to the head or neck, ongoing dizziness or any of the 5 Ds and 3 Ns
     -> a doctor today; getting quickly worse, or new in the last few days ->
     Emergency. However long ago, and whether or not it came on suddenly.
     Shared by the neck, base of the neck and head: each asked once. -->
- Since a car accident or a hard knock to your head or neck, are dizziness or any of these getting quickly worse, or did they start in the last few days: double vision, slurred speech, trouble swallowing, sudden falls or blackouts, feeling sick, numbness in your face or around your lips, or eyes that flicker or jump? | emergency | Getting worse, or new in the last few days, after an accident or a hard knock: possible damage to a neck artery or the brain (5 Ds and 3 Ns)
- Since a car accident or a hard knock to your head or neck, have you had dizziness that keeps coming back or will not go away, or any of these, even if they are not getting worse: double vision, slurred speech, trouble swallowing, sudden falls or blackouts, feeling sick, numbness in your face or around your lips, or eyes that flicker or jump? | urgent, same day | Ongoing dizziness or nerve signs after an accident or a hard knock need a doctor today
- Did this headache come on suddenly and reach its worst within a minute, like the worst headache of your life? | emergency | Possible bleed on the brain (thunderclap headache)
- With the headache, have you had any of these: weakness or numbness on one side, a drooping face, trouble speaking or understanding, confusion, loss of vision or double vision, or trouble walking? | emergency | Possible stroke or other brain cause
- Do you have a fever with a stiff neck, a new rash, or are you very drowsy, confused or feeling very unwell? | emergency | Possible meningitis   (cgh: confused, very unwell)
- Did the headache start after a blow to the head, and since then have you vomited more than once, become very drowsy or confused, or is the headache getting worse? | emergency | Possible bleeding after a head injury
- Is one eye painful and red, with blurred vision or halos around lights? | emergency | Possible acute glaucoma
- If you are over 50: is your scalp or temple tender to touch, do your jaw muscles ache when chewing and ease when you stop, or has your vision changed? | urgent | Possible giant cell arteritis. Needs same-day medical review to protect eyesight   (cgh: vision change)
- Is this a new kind of headache that started after age 50, or are your headaches getting steadily worse or changing pattern over weeks? | urgent | New or progressive headache needs medical review
- Is the headache brought on by coughing, sneezing, straining, or exercise, much worse when you lie down or stand up, or there when you wake, with vomiting? | urgent | Pressure-related headache can have a brain cause   (cgh: on waking with vomiting)
- Did the headache start after a knock to the head or a whiplash injury in the last 4 weeks? | urgent | Possible concussion: medical assessment before physio
- Did this new headache start after beginning a new medication? | urgent | Medication side effect: the prescriber should review it
- Are you pregnant, or have you had a baby in the last 6 weeks, and this is a new or different headache? | urgent | Possible pre-eclampsia or other pregnancy-related cause
<!-- Added 28 Sep 2026 at Chandra's instruction (cervicogenic dizziness review);
     shared with the neck, asked once. -->
- Since a neck manipulation, a sudden jerk, or a minor knock, have you had neck pain or a headache that is severe and unlike anything you have felt before, or symptoms that are changing or getting worse quickly? | emergency | Severe new pain or fast-changing symptoms after a neck manipulation, jerk or knock: possible neck artery tear
- Did a new headache with neck pain, different from any you have had before but not severe, start after a neck manipulation or sudden jolt? | urgent | Early sign of a neck artery tear can be pain alone (IFOMPT framework)

## opening questions
Q: Your age?
- Under 18
- 18 to 29
- 30 to 49
- 50 to 64
- 65 or over

Q: How did it start?
- Gradually, no clear reason
- After a knock to the head or a whiplash injury
- After long hours at a desk or screen
- During a stressful period
- I have had headaches on and off for years

Q: How long has it been going on?
- Less than 2 weeks
- 2 weeks to 3 months
- More than 3 months

## questions
Q: Which best describes where your headache is?
- Always the same side, starting from the neck
- Both sides, like a tight band or pressure
- One side, but it can switch sides   (shows the migraine card)
- Behind one eye, with a watery eye or runny nose on that side   (shows "Headache behind one eye: please see your doctor")

Q: What does the headache feel like, and what comes with it? Tick all that apply.
- Pressing or tightening, not throbbing
- Throbbing or pulsing   (shows the migraine card)
- Feeling sick or being sick   (shows the migraine card)
- Light or noise bothers me
- Zigzag lines or blind spots before it starts   (shows the migraine card)
- Brief shooting or electric pains in the scalp, or the scalp is sore to touch or brush   (cgh: shows the occipital nerve card)

Q: How does your neck affect the headache? Tick all that apply.
- Neck movement or holding one position brings it on   (cgh Q3: 3; one of the two)
- Neck movement or holding one position sometimes brings it on   (cgh Q3: 1)
- Pressing at the base of my skull brings on my usual headache   (cgh Q4: 3)
- My neck is stiff, especially turning my head to one side   (cgh Q5: 2)
- The headaches started with, or after, neck pain or a neck injury   (cgh Q6: 2)
- My neck is stiff, but it does not change the headache
- My neck is fine
Ask only if: the drawing includes the neck or the back of the head, or Where = "Always the same side, starting from the neck"

Q: How long does each headache usually last?
- Less than 30 minutes
- 30 minutes to 4 hours
- 4 hours to 3 days
- It never fully goes away

Q: On how many days a month do you get a headache?
- Fewer than 1
- 1 to 14
- 15 or more   (shows "Frequent painkillers can keep headaches going")
- Every day since it started, without a break   (shows the same card)

Q: On how many days a month do you take pain medication for headaches?
- Rarely or never
- Up to 9 days
- 10 to 14 days   (shows "Frequent painkillers can keep headaches going")
- 15 or more days   (shows the same card)
Ask only if: Days a month = "1 to 14", "15 or more", or "Every day since it started, without a break"

Q: What tends to bring a headache on? Tick all that apply.
- Stress or poor sleep
- Long spells at a desk or screen
- My period or hormonal changes   (shows the migraine card)
- Missed meals, or certain foods or drinks
- Bright light or strong smells
Ask only if: Where = "Always the same side, starting from the neck", "Both sides, like a tight band or pressure", or "One side, but it can switch sides"

Q: Since your head injury, which of these apply? Tick all that apply.
- Headache worse with screens or concentrating
- Dizzy or off balance   (also confirmed in the final safety check: a "yes" there means a doctor today)
- Light or noise bothers me more than before
- Foggy, or trouble sleeping
- Neck pain since the injury
Ask only if: How did it start? = "After a knock to the head or a whiplash injury" (and the 4-week red flag was not ticked)

## final check (answers-dependent)
<!-- (cgh) When the answers point to a neck-related headache (question 1
     "always the same side", or a neck answer on question 3) and the neck is
     not drawn: the neck's upper-neck instability question was not asked. -->
- Rheumatoid or another inflammatory arthritis, Down syndrome or long-term steroid tablets; a head that feels too heavy to hold up; or a lump-in-the-throat feeling or tingling around the lips when you move your neck | urgent | Possible upper neck instability: a doctor should check before hands-on neck treatment

## referral patterns
- Upper neck → back of the head, temple, or behind the eye | Headache coming from the neck (cervicogenic, C1–C3); always on the same side | Migraine, tension-type headache, occipital neuralgia
- Upper trapezius and neck muscles → temple, forehead, around the eye | Muscle-referred pain, often with tension-type headache | Migraine, sinus headache
- Jaw muscles → temple | Jaw muscle pain (TMD): see the jaw region | Temporal headache from other causes; giant cell arteritis if over 50
- Sinuses → forehead, cheeks, behind the eyes | Sinus pain, usually with a blocked nose or fever | Migraine is often mistaken for "sinus headache"
- Sternocleidomastoid → forehead, around the eye, ear, back of the head | Muscle trigger point referral; can come with a watery eye or runny nose on that side | Sinus pain, cluster headache, cervicogenic headache
- Suboccipital muscles → band from the back of the head to behind the eye | Muscle-referred headache, often with desk posture | Cervicogenic headache (C1–C3 joints), migraine

## test patients
CASE: 1. Cervicogenic headache
Drawing: Back of the head on the right and the right side of the upper neck
Answers: Age = 30 to 49; After long hours at a desk or screen; More than 3 months; Q1 = always the same side, starting from the neck; Q2 = pressing or tightening; Q3 = neck movement brings it on + pressing at the base of my skull; Q4 = 4 hours to 3 days; Q5 = 1 to 14; Q6 = up to 9 days
Flags: none
Expect: top condition = cervicogenic headache; must not show = migraine as top, any physician-first message; route = results

CASE: 2. Tension-type headache
Drawing: Band around the forehead and both temples
Answers: Age = 30 to 49; During a stressful period; 2 weeks to 3 months; Q1 = both sides, like a tight band; Q2 = pressing or tightening; Q3 = neck stiff but does not change it; Q4 = 30 minutes to 4 hours; Q5 = 1 to 14; Q7 = stress or poor sleep + desk or screen
Flags: none
Expect: top condition = tension-type headache; must not show = cervicogenic as top, migraine; route = results

CASE: 3. Thunderclap
Drawing: Whole head
Answers: Age = 50 to 64; Gradually, no clear reason; Less than 2 weeks
Flags: Did this headache come on suddenly and reach its worst within a minute...
Expect: top condition = none; must not show = any condition, any booking; route = 911

CASE: 4. Migraine look-alike
Drawing: Right temple and behind the right eye
Answers: Age = 30 to 49; I have had headaches on and off for years; More than 3 months; Q1 = one side, but it can switch sides; Q2 = throbbing + feeling sick + light or noise; Q4 = 4 hours to 3 days; Q5 = 1 to 14; Q6 = up to 9 days
Flags: none
Expect: top condition = no physio condition on top, message that the pattern may be migraine with advice to see a doctor; must not show = cervicogenic, tension-type as top; route = results (suggest doctor review)

CASE: 5. Medication overuse
Drawing: Both temples
Answers: Age = 30 to 49; I have had headaches on and off for years; More than 3 months; Q1 = both sides, like a tight band; Q5 = 15 or more; Q6 = 15 or more days
Flags: none
Expect: top condition = tension-type headache, with a medication-overuse message to review with a doctor; route = results (suggest doctor review)

<!-- (cgh) From "Cervicogenic Headache 1.docx" (v1.0 draft, 28 Sep 2026):
     maximum 15, shown from 6, the document's "possible match" line. -->
CASE: 6. Head only: sometimes brought on by the neck, stiff turning one way, started with neck pain
Drawing: Back of the head
Answers: Age = 30 to 49; Gradually; More than 3 months; Q1 = always the same side; Q2 = pressing; Q3 = sometimes + stiff turning one way + started with neck pain; Q5 = 1 to 14; Q7 = desk
Expect: top condition = neck-related headache; route = results

CASE: 7. Brief shooting pains in the scalp
Answers: Q1 = always the same side; Q2 = brief shooting pains; Q3 = pressing the skull
Expect: occipital nerve card

CASE: 8. Neck triggers with throbbing, feeling sick and switching sides
Answers: Q1 = can switch sides; Q2 = throbbing + feeling sick + light or noise; Q3 = neck movement brings it on
Expect: migraine card; neck-related headache not on top
