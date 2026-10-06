PHYSIO CHANDRA  ·  SYMPTOM GUIDE

## Condition Intake: Cauda equina syndrome (emergency route)
Pre-filled draft for clinical review. This is the Low back region’s EMERGENCY card, not a physiotherapy-route card: any single "yes" on the trigger set shows the emergency screen instead of a result list or booking prompt. The question set below is written as the hardcoded red-flag screen; nothing in it is generated at run time.
How this form is used
- Fill in by typing, or record a voice note that follows the section numbers.
- An AI review checks the draft and returns a correction report with a reason for each change. You accept or reject each one.
- The build check refuses anything incomplete or non-compliant, and says which rule it failed.
- Nothing goes live until you tick "Approved" in section 12. That sign-off is kept as the CHCPBC compliance record.
Drafted by AI review from the Ch 2.5 Lumbar & Pelvis manual (2019) and checked against the National Suspected Cauda Equina Syndrome Pathway (2023) and the international red-flag framework (section 9a). Everything below is a draft until Chandra signs section 12. The small teal "maps to" line under each heading is for the developer.

### 1. Condition identity
maps to: id, name, aka, region, zones, side
Clinical name
Cauda equina syndrome (CES) — suspected, emergency screen
Patient-friendly name
What patients search for
Cauda equina, "nerves at the bottom of the spine squashed", back pain and can’t pee, back pain and numb between the legs, saddle numbness, sciatica both legs with bladder problems, back pain and incontinence
Condition ID
Developer fills if unsure
cauda-equina-syndrome
Region file
lower back
Body zones on the 3D model
Where patients would draw pain
Primary: low back with pain or numbness in both legs
Key zones: saddle area (inner thighs, buttocks, around the genitals and back passage) — the model should let patients mark this zone; any mark here triggers the trigger set regardless of other zones
Side / pattern
Usually both legs, or pain that started in one leg and moved to both or swapped sides. Any saddle-area symptom counts even if the leg pain is one-sided.

### 2. Plain-language summary
maps to: summary
2–4 sentences a patient will read. Explain Pain tone: reassuring, accurate, no guarantees.
What it is
Cauda equina syndrome happens when the bundle of nerves at the bottom of the spinal canal — the nerves that run the bladder, bowel, sexual function and the legs — is squeezed, most often by a large disc bulge. It is rare, but it is an emergency: the nerves recover best when the pressure is taken off quickly, usually with an operation within hours of diagnosis.
Reassurance line
Most back pain, even severe back pain with sciatica, is not cauda equina syndrome. The point of this screen is simple: if you have any of the warning signs below, go to an emergency department now rather than waiting to see if it settles. Being checked and found clear is the right outcome, not a wasted trip.
Who it commonly affects
Any adult can be affected; most cases are between 30 and 50 and follow a large central disc herniation. Less often it follows a fall, spinal surgery, infection, a tumour or bleeding. It accounts for roughly 1–2% of disc herniations that need surgery.

### 3. Typical symptom pattern
maps to: pattern.onset, pattern.aggravating, pattern.easing, pattern.feel, pattern.timeline
How it usually starts
Often sudden or over a few hours to days, frequently on top of existing back pain or sciatica. Sometimes slower, with bladder changes creeping in over a week or two. It can also develop after a sudden worsening of long-standing sciatica.
What makes it worse
It does not behave like ordinary back pain: the warning signs are about the bladder, bowel, saddle area and sexual function, not about positions or movements. Leg pain may change sides or spread to both legs.
What eases it
Nothing reliably eases it, and that is part of the warning. Do not wait for rest, painkillers or sleep to help.
What it feels like
Numbness or "cotton-wool" feeling around the genitals, back passage or inner thighs; not feeling the toilet paper; difficulty starting to pee, a weak stream or not knowing the bladder is full; leaking urine or stool without warning; new difficulty with erections or sensation during sex; both legs heavy, weak or numb; severe back pain with sciatica in both legs.
Usual timeline
Depends on how quickly the pressure is relieved. Earlier treatment gives the best chance of full recovery of bladder, bowel and leg function. Some people need months of rehabilitation afterwards.

### 4. Scored question set (single-area)
maps to: questions[], scoring.thresholds
Used when a patient draws pain in this area only. Write each question the way you would ask it in clinic. Give each answer a score. You set the thresholds.
#
Question (patient wording)
Answer options → score
Why it matters
1
In the last two weeks have you had new difficulty starting to pee, a weak or slow stream, or trouble feeling when your bladder is full or emptying?
Yes → EMERGENCY; Not sure → EMERGENCY; No → 0
Urinary retention / altered flow sensation is the earliest and most important sign (Pathway 2023)
2
Have you had new numbness, tingling or a strange feeling around your genitals, back passage or inner thighs — for example not feeling the toilet paper?
Yes → EMERGENCY; Not sure → EMERGENCY; No → 0
Saddle (perianal/perineal/genital) sensory change
3
Have you leaked urine or stool without warning, lost the feeling of needing to open your bowels, or been unable to control wind?
Yes → EMERGENCY; No → 0
Incontinence / loss of rectal fullness — later sign; retention has usually come first
4
Have you had new difficulty with erections, ejaculation, or new loss of feeling during sex?
Yes → EMERGENCY; Prefer not to say → show the emergency information anyway; No → 0
Sexual dysfunction is under-reported; the Pathway lists it as a red flag
5
Have both legs become weak, numb or heavy, or is weakness in a leg getting worse over hours or days?
Yes → EMERGENCY; No → 0
Severe or progressive bilateral neurological deficit
6
Has leg pain suddenly started in both legs, or moved from one leg to both, or swapped sides?
Yes → see a doctor within 24 hours and show the warning-signs card; No → 0
Pathway "warning sign": urgent review, not emergency, if none of Q1–Q5 are positive
Score thresholds
No scoring. Any "Yes" or "Not sure" on questions 1–5 → EMERGENCY screen immediately; the result list and booking prompt are suppressed. Q6 alone → "see a doctor within 24 hours" screen with the warning-signs card. All six "No" → return to the normal low-back routing, with the short warning-signs card still shown at the end of every low-back result.

### 5. Look-alike conditions (differentials)
maps to: differentials[]
Condition
How to tell it apart (patient-reportable)
Route
Lumbar spinal stenosis
Both legs heavy after walking, settles with sitting; bladder and saddle feeling normal
lumbar-spinal-stenosis
Nerve-related leg pain (sciatica) — single root
One leg, bladder and saddle feeling normal, no spread to the other leg
sciatica
Bladder infection or stress incontinence
Burning or frequency, leaking on coughing or laughing, with no saddle numbness and no new leg symptoms
doctor-first (same week)
Spinal cord compression (myelopathy)
Clumsy hands, unsteady walking, stiff legs, neck pain — bladder changes may come later
doctor-first (prompt) / emergency if rapid
Medication side effects
Constipation or difficulty peeing started with new strong painkillers, no saddle numbness
doctor-first — but if any doubt, treat as CES

### 6. Condition-specific red flags
maps to: redFlags[] (reference only)
For this card the trigger set IS the red-flag screen. The rows below are the patient-facing emergency screen wording; the developer replaces the current low-back emergency text with this once approved.
Red flag (patient wording)
Action shown to patient
Any "Yes" or "Not sure" to questions 1–5
Call 911 or go to the nearest emergency department NOW. Tell them you may have cauda equina syndrome. Do not wait until morning and do not wait for the pain to settle.
Leg pain in both legs that started suddenly, or moved from one leg to both (no other warning signs)
See a doctor within 24 hours. If any of the warning signs above start, go to emergency straight away.
Symptoms started after a fall, crash or recent spine surgery or injection
Emergency department now.
Standing warning-signs card (shown at the end of every low-back result, and on the results PDF)
"Go to emergency now if you notice: trouble peeing or feeling your bladder; numbness around your genitals or back passage; leaking urine or stool; new problems with sexual function; both legs weak or numb." Based on the National Suspected CES Pathway (2023) warning-card wording.

### 7. What we look at in clinic
maps to: assessment
Assessment (patient-facing)
If you have any of the warning signs, you should not be waiting for a physiotherapy appointment — the emergency department can arrange the urgent scan (MRI) and specialist review you need. If you are in clinic when symptoms are mentioned, Chandra will ask about your bladder, bowel, saddle sensation and sexual function directly, check leg strength, reflexes and sensation, and send you to emergency the same day if there is any doubt. A normal examination does not rule it out if you have the symptoms.
Clinical notes (internal)
Not shown to patients
Direct subjective screen at every low-back visit (bladder initiation/flow/sensation, saddle sensation, bowel, sexual function, bilateral leg symptoms), documented verbatim with onset times. Objective: bilateral L2–S1 myotomes, dermatomes incl. S2–S4 light touch and pin-prick in the saddle area, reflexes (knee, ankle, plantar), gait. Rectal tone / bulbocavernosus are not within community physio scope — refer, do not examine. Pathway 2023 standards: emergency referral acceptable on history alone, including by phone; "negative examination findings do not exclude CES if positive subjective symptoms are present". Target: MRI within hours of presentation and decompression as soon as possible (ideally within 24 h, sooner for retention). Safety-net every low-back patient with the CES warning card and record that it was given. Post-surgical rehab: coordinate with the spine team; bladder/bowel and pelvic-health input via specialist services.

### 8. How physiotherapy can help
maps to: management
Approach
Physiotherapy does not treat suspected cauda equina syndrome — the first step is emergency medical care, and the role of this site is to help you recognise the warning signs early.
Every low-back result on this site ends with the warning-signs card so you know what to watch for.
After emergency treatment, physiotherapy may help with recovery of leg strength, walking, balance and return to work and activity, alongside the hospital team.
Bladder, bowel and sexual-function recovery is supported by specialist services; Chandra can help you find the right referral.
If you have long-standing back pain or sciatica without these warning signs, a physiotherapy assessment can help you plan treatment — and includes this screen.
Safe self-care tips
General, low-risk, publishable
There are no self-care tips for suspected cauda equina syndrome: if you have the warning signs, go to emergency now.
Write down when each symptom started — it helps the emergency team.
Do not drive yourself if your legs feel weak or numb; ask someone to take you or call 911.
Save or print the warning-signs card so you and your family know what to watch for.
When to book
If you do NOT have any of the warning signs but have back pain or sciatica that is limiting you, a physiotherapy assessment can help you work out the right next steps. If you develop any warning sign while waiting for an appointment, go to emergency first.

### 9. Evidence sources
maps to: sources[]
Reference
Used for
Getting It Right First Time (GIRFT) / NHS England. National Suspected Cauda Equina Syndrome Pathway. February 2023, v1.1.
Trigger set wording, emergency vs urgent split (Q6), warning card, "negative exam does not exclude"
Finucane LM, Downie A, Mercer C, et al. International framework for red flags for potential serious spinal pathologies. J Orthop Sports Phys Ther. 2020;50(7):350-372.
Red-flag reasoning, safety-netting, physiotherapy scope
Greenhalgh S, Finucane L, Mercer C, Selfe J. Assessment and management of cauda equina syndrome. Musculoskelet Sci Pract. 2018;37:69-74.
Early warning signs, patient-card concept, clinical notes
Lavy C, Marks P, Dangas K, Todd N. Cauda equina syndrome — a practical guide to definition and classification. Int Orthop. 2022;46(2):165-169.
Definition, retention vs incontinence stages, timing
Hoeritzauer I, Wood E, Copley PC, Demetriades AK, Woodfield J. What is the incidence of cauda equina syndrome? A systematic review. J Neurosurg Spine. 2020;32(6):832-841.
Rarity / "who it affects" lines
Orthopaedic manual-therapy course manual, Section 2, Ch 2.5 Lumbar and Pelvis Conditions, pp 342-363 (2019). Reference only — clinical facts verified against the sources above.
Presentation list, reasoning framing

### 9a. CPG alignment (checked in-session, 6 Oct 2026)
maps to: compliance.cpgAlignment[]
Guideline (version confirmed)
What it recommends
How this form reflects it
GIRFT / NHS England — National Suspected Cauda Equina Syndrome Pathway, Feb 2023 v1.1 (confirmed current 6 Oct 2026; CSP implementation article Mar 2024).
Emergency referral for back/leg pain plus any of: new difficulty initiating or impaired sensation of urinary flow; new altered perianal/perineal/genital sensation; severe or progressive lower-limb deficit; new loss of sensation of rectal fullness; new sexual dysfunction. Sudden bilateral or side-swapping leg pain = urgent (<2 weeks) warning sign. Provide warning cards; emergency referral acceptable without face-to-face review; negative exam does not exclude CES.
Q1–Q5 are the five Pathway red flags verbatim in patient wording; Q6 is the warning sign with a 24-h doctor route; standing warning card in section 6; "normal exam does not rule it out" in section 7
Finucane et al. 2020 — International framework for red flags for potential serious spinal pathologies (JOSPT).
Red flags interpreted in clinical context; level of concern drives emergency vs urgent vs monitor; explicit safety-netting and documentation.
Two-tier routing (emergency / 24 h); safety-net card at the end of every low-back result; documentation note in clinical notes
Lavy et al. 2022 — CES definition and classification (Int Orthop).
Classify as suspected, incomplete (CESI, retention-free with altered sensation) or with retention (CESR); earlier decompression, especially before retention, gives better outcomes.
Timeline line; "earliest sign" note on Q1; no fixed hour-count promised to patients
CHCPBC marketing standard and scope.
Public content must direct people to appropriate care; no diagnosis implied; services described within physiotherapy scope.
Card routes to 911/ED before any booking prompt; booking prompt only for people with no warning signs; rectal exam explicitly out of scope

### 10. Privacy statement (standing block)
maps to: privacy (global; fixed text, not edited per condition)
This block is the same for every condition. It is appended automatically to every results screen and to the results PDF, directly after the results and before the byline and disclaimer. It is not edited per condition; any change to the wording is made once, in the shared template, and reviewed under section 11.
The statement below must stay true. The guide runs entirely in the browser and stores nothing. If analytics, logging or a booking form are ever added to the site, the wording must be re-checked and, if needed, narrowed to "does not save your answers or results" with the cookie / analytics notice covering the rest.
Statement shown to patients (full)
Your privacy
Physio Chandra does not collect, store or transmit any of the answers you provided in this guide. Your responses are processed entirely on your own device to generate this summary and are discarded when you close or refresh the page. No personal or health information is saved by this website, and nothing is shared with Physio Chandra or any third party unless you choose to book an assessment and provide your details separately. This summary is yours to keep, print or share with a healthcare professional as you see fit.
Short version
Your privacy. Your answers are processed on your device only and are not saved, stored or sent to Physio Chandra or anyone else. Nothing in this guide is retained once you leave the page.
Placement
Results screen and results PDF: after the results, before "Written & reviewed by Chandra Sekhar Matla" and the educational disclaimer. Use the full version on the PDF and on desktop; the short version may be used on mobile results screens where space is limited.

### 11. CHCPBC compliance check
maps to: compliance (approval record)
Met
No guarantees or promises of outcome (no "cure", "fix", "permanent relief").
AI review: no outcome promises; recovery stated as "best chance", not guaranteed
Met
No superlatives or comparisons ("best", "leading", "better than other clinics").
AI review: no superlatives or comparisons
Met
No testimonials or patient stories.
AI review: no testimonials
Met
Uses "may help" / "can help" wording for treatment.
AI review: "may help" wording for post-surgical rehab; physio explicitly does not treat suspected CES
Met
Only describes services within the physiotherapy scope of practice.
AI review: physiotherapy scope only; emergency medicine, imaging and surgery routed via 911/ED; rectal exam excluded
Met
Red flags direct people to appropriate care.
AI review: emergency screen suppresses results and booking; Pathway 2023 wording; 24-h doctor route for warning sign
Met
Plain language a patient can understand; no fear-based wording (Explain Pain).
AI review: direct, plain, non-fear wording: "being checked and found clear is the right outcome"; no catastrophic language
Met
Sources listed for clinical claims.
AI review: six sources plus 9a alignment table

### 12. Approval & sign-off
maps to: approval
Drafted by
AI review draft for Chandra Sekhar Matla, Physiotherapist
Date submitted
6 October 2026 (AI draft; CPG check completed same day)
Approval
☑  I have reviewed this condition record, I approve it for publication, and I have signed below.
Signature & date
Chandra Matla 05 Oct 2026
Version
v1.0 — draft for sign-off