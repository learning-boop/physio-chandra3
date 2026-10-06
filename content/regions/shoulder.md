---
# From "Shoulder assessment.docx" (Joint wise assessment folder), 25 Sep 2026.
# Built into src/data/symptomGuide.js (shoulder) and src/data/injuryScreen.js (shoulder screen).
# Conditions: content/conditions/shoulder-*.md. An upper-arm mark also asks these questions.
# Not built: "Subjective S15: Diabetes" in test patient 2 (the subjective questions are not on the site yet).
# Test patients: npm run check:regions
# 5 Oct 2026: shoulder cross-check against the JOSPT rotator cuff (2025) and
# adhesive capsulitis (2013) CPGs, the AIM Theory Manual 2023 Ch. 2.2, Chandra's
# shoulder protocols and a current search; all 24 items approved by Chandra
# (review/shoulder-crosscheck.html). Changes here: the hot-joint question "red
# or swollen" and after an injection (all arm joints); S5 reworded without
# "unstable"; injury screen I2 dislocation only (emergency), new I7 for a step
# at the top of the shoulder (same-day X-ray), I4 includes "much weaker"; S7
# priority strength 3 when the drawing reaches below the elbow; new cards
# shoulder-cufftear, shoulder-oa, shoulder-labral. Test patients 7 to 11.
region: shoulder
name: Shoulder
source: Kulkarni R et al. BESS/BOA Patient Care Pathways: Subacromial shoulder pain. Shoulder Elbow 7(2), 2015; Brownson P et al. BESS/BOA Patient Care Pathways: Traumatic anterior shoulder instability. Shoulder Elbow 8(3), 2016; Kelley MJ et al. Shoulder pain and mobility deficits: adhesive capsulitis. JOSPT 43(5), 2013; Lewis J. Rotator cuff related shoulder pain: assessment, management and uncertainties. Man Ther 23, 2016; Park HB et al. Diagnostic accuracy of clinical tests for the different degrees of subacromial impingement syndrome. JBJS Am 87(7), 2005; Hegedus EJ et al. Which physical examination tests provide clinicians with the most value when examining the shoulder? Br J Sports Med 46, 2012; Chronopoulos E et al. Diagnostic value of physical tests for isolated chronic acromioclavicular lesions. Am J Sports Med 32(3), 2004; Donnelly JM et al. Travell, Simons & Simons' Myofascial Pain and Dysfunction: The Trigger Point Manual, 3rd ed. Wolters Kluwer, 2019; Giamberardino MA. Referred muscle pain/hyperalgesia and central sensitisation. J Rehabil Med Suppl 41, 2003
reviewed_by: Chandra Matla, Registered Physiotherapist
reviewed_on: DRAFT prepared 24 Sep 2026, awaiting Chandra's review
# 28 Sep 2026, shorter questionnaire (Chandra, 28 Sep 2026; "Shorter questionnaire - draft for approval.docx", all of A, B and C accepted):
# the hot-joint question is shared across the arm (A3.1: "Is a painful joint hot, red and swollen, with a fever or feeling very unwell?"); the gallbladder and shoulder-tip questions are one organ question (A3.3: "Is the pain worse after fatty meals or when you breathe in deeply, or does it come with feeling sick, fever, yellow skin or eyes, or not change at all with movement or position?"); the cancer question is covered by the general one, which now asks about a new or growing lump and night pain that does not change with position (A3.5).
# The flag lines below are the document as written; src/data holds the merged wording.
---

## red flags
- Is the pain in your shoulder, jaw, or left arm brought on by effort, or does it come with chest tightness, shortness of breath, or sweating? | 911 | Heart pain is often felt in the left shoulder and inner arm
- Did pain at the tip of your left shoulder start after a blow to your tummy or ribs, or does it come with feeling faint or dizzy? | 911 | Possible bleeding from the spleen, felt at the shoulder tip (Kehr's sign)
- Could you be pregnant, and do you have pain low in your tummy along with pain at the tip of your shoulder? | 911 | Possible ectopic pregnancy: blood under the diaphragm is felt at the shoulder tip
- Do you have severe muscle pain or weakness, with urine that is dark like cola? (Especially after very hard exercise, a crush, a long time lying on the floor, a new medicine such as a statin, or a recent illness.) | emergency | Possible muscle breakdown (rhabdomyolysis), which can damage the kidneys   (2 Oct 2026, Chandra's request: dark urine with muscle pain or weakness, from the polymyositis document; shared with the arm, thigh and leg (group rhabdo), asked once; added after the signed version)
- Do you have a sudden, sharp pain on breathing with shortness of breath? | 911 | Possible blood clot in the lung or a collapsed lung
- Is your shoulder hot, red, or swollen, with a fever or feeling very unwell? | emergency | Possible joint infection (septic arthritis)
- If you are over 50: are both shoulders (and often both hips) stiff and aching, worst in the morning for more than 45 minutes, and do you feel generally unwell? | urgent | Possible polymyalgia rheumatica; needs blood tests and medical care
- Do you smoke or used to smoke, and have you also had a cough that will not go away, coughed up blood, a drooping eyelid, or weakness in your hand? | urgent | Possible tumour at the top of the lung (Pancoast), felt in the shoulder and inner arm
- Have you ever had cancer, or is there a new lump, or pain at night that does not change with position, with weight loss? | urgent | Cancer can spread to the shoulder bones
- Is the pain at the tip of your right shoulder or under your right shoulder blade worse after fatty meals, or does it come with feeling sick or yellow skin or eyes? | urgent | Gallbladder or liver pain is felt in the right shoulder (C3–C5 and T7–T9)
- Is the pain at the tip of your shoulder worse when you breathe in deeply? | urgent | Diaphragm or lung lining pain is felt at the shoulder tip (C3–C5)
- Did a sudden, severe shoulder pain with no injury last several days, and then your shoulder or arm muscles became weak or thin? | urgent | Possible nerve inflammation (neuralgic amyotrophy, Parsonage-Turner)

## injury screen
<!-- Built into src/data/injuryScreen.js. Asked in order; the first answer that routes ends it. -->
I1 Have you injured your shoulder in the last 6 weeks, for example in a fall, an accident, or sport?   (28 Sep 2026: "injured", not "been hurt")
- No
- Yes, I fell onto my arm or shoulder
- Yes, it popped out of place
- Yes, a sudden pull, lift, or jerk
Route: No → skip this screen / Any Yes → I2
Why: Gate question. Keeps the screen to recent injuries

I2 Is your shoulder still out of place, or does it look a different shape?
Route: Yes → EMERGENCY
Why: Possible dislocation or fracture that has not been put back

I7 Is there a new lump or step at the top of the shoulder since the injury?   (5 Oct 2026: split from I2)
Route: Yes → PHYSICIAN FIRST, same day
Why: Possible AC joint separation or collarbone fracture: an X-ray is needed the same day

I3 Since the injury, has your arm or hand been cold, pale, or blue?
Route: Yes → EMERGENCY
Why: Possible blood vessel injury

I4 Since the injury, are you unable to lift your arm, or is it much weaker than before, or is there a numb patch on the outer upper arm?   (5 Oct 2026: "much weaker" added)
Route: Yes → PHYSICIAN FIRST
Why: Possible acute rotator cuff tear or axillary nerve injury; early surgical opinion matters (BESS pathway)

I5 Did it pop out for the first time, and are you 40 or older?
Route: Yes → PHYSICIAN FIRST
Why: Rotator cuff tear and nerve injury are common after a first dislocation over 40

I6 Did it happen during a seizure (fit) or an electric shock?
Route: Yes → PHYSICIAN FIRST
Why: Possible posterior dislocation, which is often missed


## opening questions
Q: Your age?
- Under 18
- 16 to 29
- 30 to 49
- 50 to 64
- 65 or over

Q: How did it start?
- Gradually, no clear reason
- After a lot of overhead work, lifting, or sport
- After a fall onto the arm or shoulder
- It popped out or slipped out of place
- After a sudden pull, lift, or jerk
- Sudden severe pain with no injury

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
Q: How has the movement changed over time?
- Getting stiffer month by month
- Very painful at first, now more stiff than painful
- The stiffness is slowly easing
- No real stiffness, just pain
- --row--

Q: Does your shoulder ever slip, or feel as if it might come out of place?   (5 Oct 2026: no "unstable")
- It has popped out and needed putting back
- It slips or clunks, then goes back on its own
- I worry it will pop out with my arm up and back
- No, it feels stable
- --row--

Q: Which hurts more: moving your neck, or moving your shoulder and arm?
- Moving my neck
- Moving my shoulder and arm
- Both about the same
- Neither brings it on
- --row--

Q: Which of these describe your arm symptoms? Tick all that apply.
- Pain goes below the elbow into the forearm or hand
- Pins and needles or numbness in particular fingers
- The arm pain is worse than the shoulder pain
- Pain on the outer upper arm that stops above the elbow
- --row--

## referral patterns
- Shoulder joint or capsule → outer upper arm (deltoid patch); rarely below the elbow | Shoulder joint pain, felt in the C5 zone | Neck: C4–C5 joints or C5 nerve root
- Rotator cuff (supraspinatus) → deep outer shoulder over the middle of the deltoid; can reach the outer elbow | Rotator cuff related shoulder pain; supraspinatus trigger points refer to the same area | C5 nerve root, subacromial bursa
- Infraspinatus → deep front of the shoulder, down the front and outer arm to the thumb side of the forearm and hand | Muscle trigger point referral | Biceps tendon, C5–C6 nerve root
- Teres minor → back of the shoulder, one small area | Muscle trigger point referral | Subdeltoid bursitis
- Subscapularis → back of the shoulder; a band around the wrist | Muscle trigger point referral; common alongside frozen shoulder | C7–C8 nerve root, frozen shoulder
- Biceps tendon (long head) → front of the shoulder, down the front of the upper arm | Biceps tendon or labrum (SLAP) pain | Infraspinatus referral, C5–C6 nerve root
- AC joint → top of the shoulder at the bony point; patient can point to it with one finger; sometimes up into the neck | AC joint pain | C4 referral, diaphragm (shoulder tip)
- Neck (C4–C5) → top of the shoulder or upper arm, stopping above the elbow | Referred pain from the neck, not a nerve root | Check the neck region when neck movement changes the pain
- Neck nerve root (C5–C6) → down the outer arm past the elbow to the thumb and index finger, with pins and needles | Nerve root (radicular) pain from the neck | Check the neck region; carpal tunnel
- Scalene muscles → front of the chest, inner shoulder blade, outer arm to the thumb and index finger | Muscle trigger point referral | C6 nerve root, thoracic outlet
- Pectoralis major and minor → front of the chest and shoulder, inner arm to the ring and little fingers | Muscle trigger point referral | Heart (angina), C8 nerve root, thoracic outlet
- Diaphragm (C3–C5, phrenic nerve) → tip of the shoulder and top of the trapezius | Not musculoskeletal: red flag | Right: liver, gallbladder. Left: spleen (Kehr's sign). Either: lung lining, ectopic pregnancy
- Heart → left shoulder, inner arm, jaw, with effort | Not musculoskeletal: red flag | Emergency
- Top of the lung (Pancoast) → shoulder and inner arm to the little finger, sometimes with a drooping eyelid | Not musculoskeletal: red flag | Doctor first

## test patients
CASE: Test patient 1
Drawing: Outer right upper arm, below the shoulder
Answers: Age 50 to 64 · Gradually, no clear reason · 6 weeks to 3 months; Q1: outer upper arm, below the shoulder; Q2: it hurts in the middle of the movement, then eases near the top; Q3: reaching up to a high shelf; lying on that side at night; Q7: moving my shoulder and arm
Flags: None
Expect: top condition = Rotator cuff related shoulder pain; must not show = Frozen shoulder; any neck condition; route = Results + booking

CASE: Test patient 2
Drawing: Whole left shoulder, front and back
Answers: Age 50 to 64 · Gradually, no clear reason · 6 weeks to 3 months · Subjective S15: Diabetes; Q2: it will not go as high as the other side, even when I help it with my other hand; Q3: behind my back; reaching up; across my body; Q4: getting stiffer month by month
Flags: None
Expect: top condition = Frozen shoulder (adhesive capsulitis); must not show = Rotator cuff related shoulder pain as the top result; route = Results + booking

CASE: Test patient 3
Drawing: Top of the right shoulder and down the outer arm to the thumb and index finger (look-alike)
Answers: Age 30 to 49 · Gradually, no clear reason · 2 to 6 weeks · Subjective S3: Pins and needles or numbness; Q2: it lifts fully without pain; Q7: moving my neck; Q8: below the elbow; pins and needles in particular fingers; arm pain worse than shoulder
Flags: None
Expect: top condition = No shoulder condition; shows a “this may be coming from your neck” message; must not show = Any shoulder condition as the top result; route = Results (suggest neck check) + booking

CASE: Test patient 4
Drawing: Left shoulder and inside of the left arm (look-alike)
Answers: Age 50 to 64 · Gradually, no clear reason · Less than 2 weeks; Q2: it lifts fully without pain; Q7: neither brings it on
Flags: “Is the pain in your shoulder, jaw, or left arm brought on by effort, or does it come with chest tightness, shortness of breath, or sweating?”
Expect: top condition = None (no results shown); must not show = Any shoulder condition; any booking button; route = 911

CASE: Test patient 5
Drawing: Tip of the right shoulder (look-alike)
Answers: Age 50 to 64 · Gradually, no clear reason · 2 to 6 weeks; Q2: it lifts fully without pain; Q7: neither brings it on
Flags: “Is the pain at the tip of your right shoulder or under your right shoulder blade worse after fatty meals…?”
Expect: top condition = No shoulder condition; see a doctor first; must not show = Results + booking without the physician-first message; route = Physician first

CASE: Test patient 6
Drawing: Outer left upper arm after a fall
Answers: Age 65 or over · After a fall onto the arm or shoulder · Less than 2 weeks; Injury screen: I1 “Yes, I fell onto my arm or shoulder”; I2 No; I3 No; I4 Yes
Flags: Injury screen I4 (cannot lift the arm at all)
Expect: top condition = None; see a doctor first; must not show = Any shoulder condition shown before the physician-first message; route = Physician first

<!-- Shoulder cross-check, 5 Oct 2026 (approved by Chandra). -->
CASE: 7. First dislocation at 55, weeks ago
Answers: 50 to 64; it popped out; 6 weeks to 3 months; no injury in the last 6 weeks; popped out and needed putting back
Expect: top condition = shoulder that slips or has come out of place (now at any age)

CASE: 8. Over 65, stiff in every direction and grating
Answers: 65 or over; gradually; more than 3 months; deep or front; will not go as high even when helped; behind the back; getting stiffer; clicking deep
Expect: top condition = shoulder arthritis; frozen shoulder not on top

CASE: 9. Weak after a fall months ago, arm goes up only when helped
Answers: 65 or over; after a fall; 6 weeks to 3 months; goes up only if helped; lying on it; weakness
Expect: top condition = rotator cuff tear; must not show = frozen shoulder

CASE: 10. Thrower with a deep click
Answers: 16 to 29; overhead sport; 2 to 6 weeks; deep or front; throwing; clicking deep; feels stable
Expect: top condition = labral tear

CASE: 11. New step at the top of the shoulder after a fall
Answers: injury screen I1 fall; I2, I3 No; I7 Yes
Expect: route = physician first, same day (X-ray), not the emergency department

## changes 6 Oct 2026 (neurodynamics, second batch; DRAFT for Chandra's review)
New S9 "About the back of the shoulder" (hollow shoulder blade, weak turning out, overhead sport or work), asked after "Back of the shoulder" (S1, which unlocks it with no weight of its own) or weakness turning out (S6); a mark on the back of the shoulder answers S1 from the drawing (shoulder-suprascapular, nerveLossShoulder card). Test patients N1-N2. Sources: Butler NOI neurodynamic techniques workbook; Shacklock NDS lower-quarter manual 2017-18.
