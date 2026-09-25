---
# From "Coccyx assessment.docx" (Joint wise assessment folder), 25 Sep 2026.
# Built into src/data/symptomGuideExtra.js (coccyx). Conditions: content/conditions/coccyx-*.md.
# Body map: a narrow midline strip on the back where the buttock crease
# begins (COCCYX_* in src/components/Body3D.jsx).
# Test patients: npm run check:regions
region: coccyx
name: Tailbone (coccyx)
source: Maigne JY et al. Causes and mechanisms of common coccydynia: role of body mass index and coccygeal trauma. Spine 25(23), 2000; Lirette LS et al. Coccydynia: an overview of the anatomy, etiology, and treatment of coccyx pain. Ochsner J 14(1), 2014; Garg B, Ahuja K. Coccydynia: a comprehensive review. J Clin Orthop Trauma 12(1), 2021; Finucane LM et al. International Framework for Red Flags for Potential Serious Spinal Pathologies. JOSPT 50(7), 2020
reviewed_by: Chandra Matla, Registered Physiotherapist
reviewed_on: DRAFT prepared 23 Sep 2026, awaiting Chandra's review
---

## red flags
<!-- Flags that ask the same thing as the low back's or the back of the
     pelvis's (saddle numbness, bladder/bowel control, cancer, osteoporosis)
     are shown once when those areas are on the screen too. -->
- Do you have new numbness or tingling between your legs, around your bottom, or in your genitals? | emergency | Possible cauda equina syndrome
- Have you had new trouble passing urine, leaking urine, or losing control of your bowels? | emergency | Possible cauda equina syndrome
- Have you noticed bleeding from your bottom, black stools, or a change in your bowel habit lasting more than 3 weeks? | urgent | Bowel causes can be felt at the tailbone
- Is there swelling, redness, or discharge near the top of the buttock crease, or do you have a fever? | urgent | Possible pilonidal abscess or infection
- Is the pain there all the time, worse at night, and not affected by sitting? | urgent | Tailbone pain that is not linked to sitting is unusual
- Have you ever had cancer, or can you feel a lump near your tailbone? | urgent | Rare tumours can occur here
- Did the pain start after a minor fall or with no injury, and you have osteoporosis, take long-term steroid tablets, or are over 70? | urgent | Possible stress (insufficiency) fracture of the sacrum
- Since giving birth, have you had trouble controlling wind or your bowels? | urgent | Possible pelvic floor or sphincter injury: see a doctor or pelvic health service

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
- After a fall onto my tailbone
- After giving birth
- After long periods sitting, cycling, or rowing
- After surgery or a procedure
- Gradually, no clear reason

Q: How long has it been going on?
- Less than 2 weeks
- 2 weeks to 2 months
- More than 2 months

## questions
Q: If you point to the worst spot with one finger, where is it?   (asked first)
- Right on the tip of the tailbone
- Just above the tailbone, at the lower end of the spine
- Beside the tailbone, in the buttock crease
- Deep inside, in the pelvis or back passage   (shows "A pelvic health physiotherapist can help")
- Spread across the low back and buttocks   (shows "This may be coming from your low back")

Q: What happens when you sit? Tick all that apply.
- Sitting on hard seats hurts
- Leaning back while sitting makes it worse
- Leaning forward onto my thighs eases it
- Sitting on one buttock eases it
- Sitting does not bother me

Q: What happens when you stand up from sitting?
- A sharp pain as I stand up
- The pain eases once I am standing
- The pain carries on while I stand
- No change

Q: Which of these apply? Tick all that apply.
- Pain when opening my bowels   (shows the pelvic health card)
- Pain during or after sex   (shows the pelvic health card)
- A feeling of pressure, or a ball, inside the back passage   (shows the pelvic health card)
- Constipation or straining
- None of these

Q: About the injury or birth: which apply? Tick all that apply.
- I landed straight onto my tailbone
- I heard or felt a crack
- Bruising at the top of the buttock crease
- A long or assisted delivery (forceps or ventouse)
- None of these
Ask only if: How did it start? = "After a fall onto my tailbone" or "After giving birth"

Q: Does bending forward or arching your low back bring on the tailbone pain?
- Yes   (shows "This may be coming from your low back")
- No
- Not sure

Q: Which of these apply? Tick all that apply.
- I sit for most of the day
- I cycle or row regularly
- My weight has changed a lot recently
- None of these

Q: Have you noticed anything on the skin at the top of the buttock crease?
- Nothing
- A small pit or hole in the skin   (shows "A pit or lump in the buttock crease: see your doctor")
- A tender lump   (shows the same card)
Ask only if: Where = "Beside the tailbone, in the buttock crease"

## referral patterns
- Low back (S3–S5 nerve roots, lumbar discs) → tailbone | Referred pain from the low back | Coccydynia; changes with back movement
- Pelvic floor muscles (levator ani) → tailbone, back passage, perineum | Pelvic floor muscle pain | Rectal or gynaecological causes
- Sacroiliac joint → buttock and dimple, not the tailbone tip | Sacroiliac joint pain (see SIJ file) | Coccydynia
- Skin at the buttock crease → tailbone area | Pilonidal sinus or abscess | Coccydynia
- Rectum, prostate, or pelvic organs → sacrum and tailbone | Not musculoskeletal: red flag | Doctor first

## test patients
CASE: 1. Traumatic coccydynia
Drawing: Tip of the tailbone
Answers: Age = 30 to 49; After a fall onto my tailbone; 2 weeks to 2 months; Q1 = right on the tip of the tailbone; Q2 = hard seats hurt + leaning back worse + leaning forward eases it; Q5 = landed straight onto my tailbone + bruising; Q6 = no
Flags: none
Expect: top condition = coccydynia after a fall; must not show = pelvic floor muscle pain, low back referred pain; route = results

CASE: 2. Unstable coccyx
Drawing: Tip of the tailbone
Answers: Age = 30 to 49; After giving birth; More than 2 months; Q1 = right on the tip of the tailbone; Q2 = hard seats hurt; Q3 = a sharp pain as I stand up; Q5 = a long or assisted delivery
Flags: none
Expect: top condition = coccydynia with an unstable (hypermobile) tailbone; must not show = low back referred pain; route = results

CASE: 3. Pelvic floor muscle pain
Drawing: Deep inside, low in the pelvis
Answers: Age = 30 to 49; Gradually, no clear reason; More than 2 months; Q1 = deep inside; Q2 = sitting does not bother me; Q3 = no change; Q4 = pain opening bowels + pressure inside + constipation or straining
Flags: none
Expect: top condition = pelvic floor muscle pain, with a pelvic health physio suggested; must not show = coccydynia as top; route = results (pelvic health)

CASE: 4. Cauda equina
Drawing: Tailbone and between the legs
Answers: Age = 50 to 64; Gradually, no clear reason; Less than 2 weeks
Flags: New numbness or tingling between your legs...
Expect: top condition = none; must not show = any condition, any booking; route = 911

CASE: 5. Pilonidal look-alike
Drawing: Top of the buttock crease
Answers: Age = 18 to 29; Gradually, no clear reason; 2 weeks to 2 months; Q1 = beside the tailbone, in the buttock crease; Q8 = a tender lump
Flags: Swelling, redness, or discharge near the top of the buttock crease...
Expect: top condition = none; must not show = coccydynia, any booking before review; route = physician first
