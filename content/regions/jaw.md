---
# From "TMJ assessment.docx" (Joint wise assessment folder), 25 Sep 2026.
# Built into src/data/symptomGuideExtra.js (jaw). Conditions: content/conditions/jaw-*.md.
# Body map: the lower face and side of the head, from the jaw line up to just
# below eye level, left and right (JAW_TOP in src/components/Body3D.jsx).
# Temples, forehead and scalp stay the head.
# Test patients: npm run check:regions
region: jaw
name: Jaw (TMJ)
source: Schiffman E et al. Diagnostic Criteria for TMD (DC/TMD). J Oral Facial Pain Headache 28(1), 2014; Busse JW et al. Management of chronic pain associated with TMD: a clinical practice guideline. BMJ 383, 2023; Headache Classification Committee of the IHS. ICHD-3 (headache attributed to TMD). Cephalalgia 38(1), 2018; Donnelly JM et al. Travell, Simons & Simons' Trigger Point Manual, 3rd ed., 2019; Myers DE. Vagus nerve pain referred to the craniofacial region. Br Dent J 204, 2008
reviewed_by: Chandra Matla, Registered Physiotherapist
reviewed_on: DRAFT prepared 23 Sep 2026, awaiting Chandra's review
---

## red flags
<!-- The heart question is shown once when the neck is drawn too. -->
- Is your jaw stuck open, so you cannot close your mouth? | emergency | Jaw dislocation needs urgent reduction
- Is pain in your jaw brought on by effort, or does it come with chest tightness, shortness of breath, or sweating? | emergency | Heart pain can be felt in the jaw
- Has one side of your face suddenly drooped or become weak? | emergency | Possible stroke or facial nerve palsy
- Did this start after a blow to the jaw or face, and your teeth no longer meet the way they used to? | urgent | Possible jaw fracture
- If you are over 50: do your jaw muscles ache when chewing and ease when you stop, or is your scalp or temple tender, or has your vision changed? | urgent | Possible giant cell arteritis. Needs same-day medical review to protect eyesight
- Is there swelling of your face or jaw with a fever, or a bad taste or discharge in your mouth? | urgent | Possible dental or jaw infection (doctor or dentist)
- Is part of your chin, lip, or face numb? | urgent | Nerve involvement is not typical of TMD
- Is there a lump or swelling in front of your ear or under your jaw that is growing, or has your bite changed without an injury? | urgent | Needs medical or dental review to rule out other causes
- Do you have hearing loss or discharge from the ear on the painful side? | urgent | Ear problem rather than the jaw joint
- Do you have ear or jaw pain with a sore throat, hoarse voice, or trouble swallowing that has lasted more than 3 weeks? | urgent | Throat and voice box problems can refer pain to the ear and jaw (vagus and glossopharyngeal nerves)

## opening questions
<!-- The duration bands are this region's own; in a multi-area drawing they
     map onto the site's shared bands (DURATIONS in src/data/assessmentFlow.js). -->
Q: Your age?
- Under 18
- 18 to 29
- 30 to 49
- 50 to 64
- 65 or over

Q: How did it start?
- Gradually, no clear reason
- After dental work, or opening my mouth very wide
- After a blow to the jaw or face
- During a stressful period
- I woke up with it
- On and off for years

Q: How long has it been going on?
- Less than 2 weeks
- 2 weeks to 3 months
- More than 3 months

## questions
Q: What is the main problem? Tick all that apply.
- Pain in the jaw muscles (cheek or temple)
- Pain just in front of the ear, at the joint
- Clicking or popping
- My jaw catches or locks
- My jaw feels stiff and will not open fully

Q: What brings the pain on? Tick all that apply.
- Chewing, especially hard or chewy food
- Talking for a long time
- Yawning or opening wide
- It hurts even when I am not using my jaw
- Nothing, it does not hurt   (shows "This may be coming from your neck")

Q: What noises does your jaw make?
- No noises
- A click when opening or closing
- A grating or crunching sound
- It used to click, but it stopped and now I cannot open fully

Q: How wide can you open your mouth?
- Fully, without pain
- Fully, but it hurts
- Only partway (less than 3 fingers' width)
- My jaw swings to one side as I open

Q: When your jaw catches or locks, what happens?
- It catches, but I can wiggle it free
- It locks closed and I cannot open fully
- It gets stuck open for a moment, then goes back
Ask only if: Main problem includes "My jaw catches or locks" or "My jaw feels stiff and will not open fully"

Q: Which habits apply to you? Tick all that apply.
- I clench or grind my teeth, or wake with a sore jaw
- I chew gum, my nails, or pens
- I hold my phone between my ear and shoulder, or rest my chin on my hand
- None of these

Q: When is it worst?
- When I wake up
- It builds up through the day
- After meals
- No pattern

Q: Do any of these come with it? Tick all that apply.
- Headache at the temples
- A full feeling or ringing in the ear, with no ear infection
- Neck pain   (shows "This may be coming from your neck")
- Teeth feel sore, but my dentist found nothing
- None of these

## referral patterns
- Jaw muscles (masseter, temporalis) → temple, ear, or teeth | Jaw muscle pain (TMD myalgia); may cause headache at the temples | Dental pain, ear infection, sinusitis
- Jaw joint → just in front of the ear, or into the ear | Jaw joint pain or disc problem (TMJ arthralgia or disc displacement) | Ear infection, salivary gland, dental
- Upper neck → jaw, face, or around the ear | Pain from the neck felt in the jaw | Check the neck region when jaw movement does not change the pain
- Teeth → jaw | Dental cause | Tooth sensitive to hot, cold, or biting: dentist first
- Heart → left jaw, with effort | Not musculoskeletal: red flag | Cardiac cause (emergency)
- Upper trapezius and sternocleidomastoid → angle of the jaw, ear, temple | Neck muscle trigger point referral into the jaw | Check the neck region when jaw movement does not change the pain
- Throat, tonsils, or voice box → ear and jaw | Not musculoskeletal: referred ear pain (vagus and glossopharyngeal nerves) | Doctor first if it lasts more than 3 weeks

## test patients
CASE: 1. Clicking jaw (disc displacement with reduction)
Drawing: Just in front of the left ear
Answers: Age = 18 to 29; Gradually, no clear reason; 2 weeks to 3 months; Q1 = pain at the joint + clicking or popping; Q2 = chewing + yawning; Q3 = a click when opening or closing; Q4 = fully, but it hurts
Flags: none
Expect: top condition = TMJ disc displacement with reduction; must not show = closed lock, jaw muscle pain as top; route = results

CASE: 2. Jaw muscle pain
Drawing: Both cheeks and both temples
Answers: Age = 30 to 49; During a stressful period; More than 3 months; Q1 = jaw muscles; Q2 = chewing + talking; Q3 = no noises; Q6 = clench or grind; Q7 = when I wake up; Q8 = headache at the temples
Flags: none
Expect: top condition = TMD myalgia, linked to clenching; must not show = disc displacement, closed lock; route = results

CASE: 3. Closed lock
Drawing: Right jaw joint
Answers: Age = 18 to 29; I woke up with it; Less than 2 weeks; Q1 = stiff and will not open fully + catches or locks; Q3 = it used to click, but it stopped; Q4 = only partway; Q5 = it locks closed
Flags: none
Expect: top condition = closed lock (disc displacement without reduction); must not show = clicking joint as top; route = results + booking (priority)

CASE: 4. Giant cell arteritis look-alike
Drawing: Left temple and left jaw
Answers: Age = 65 or over; Gradually, no clear reason; Less than 2 weeks; Q1 = jaw muscles; Q2 = chewing
Flags: If you are over 50: do your jaw muscles ache when chewing...
Expect: top condition = none; must not show = any TMD condition, any booking before review; route = physician first

CASE: 5. Neck look-alike
Drawing: Angle of the right jaw and right side of the neck
Answers: Age = 30 to 49; Gradually, no clear reason; More than 3 months; Q1 = jaw muscles; Q2 = nothing, it does not hurt; Q3 = no noises; Q4 = fully, without pain; Q8 = neck pain
Flags: none
Expect: top condition = no jaw condition on top, message suggesting the neck region; must not show = any TMD condition as top; route = results (suggest neck check)
