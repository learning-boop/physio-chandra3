# Pain in many places (path 4) - region record
# Built 6 Oct 2026 at Chandra's request ("subgroup the questions based on the
# diagram; more than four areas, consider nociplastic conditions like
# fibromyalgia"). DRAFT for Chandra's review. The site reads
# src/data/symptomGuideExtra.js (EXTRA_REGIONS.widespread); this file is the
# record of what was built.
source: "Fibromyalgia.docx" (Conditions/General conditions, signed 2 Oct 2026), sections 4-6

## When it is used
The Draw page asks "Your marks cover many parts of your body. Which fits best?" when the marks are in 4 or more areas, on both sides, above and below the waist (chronicWidespread in src/data/widespreadPain.js, without the duration).
- "I have pain in many places, on most days": this route. The per-area joint questions, injury screens and per-area doctor-tier red flags are not asked; every drawn area's EMERGENCY questions still are (quality review, 6 Oct 2026: cauda equina, a septic joint or a fracture can sit inside widespread pain), merged by group with the route's own (widespreadFlags, src/data/assessmentFlow.js).
- "One area bothers me much more than the others": the usual flow (area choice).

## red flags
The document's section 6 items the cross-region screen did not already have. The universal checks (fever, weight loss, night pain, cancer; worsening weakness) and the systemic pattern screens the drawing raises (thyroid, myositis, calcium, PMR, inflammatory, nerve and muscle) still run.
- ws-medicine (urgent): aching all over that started after starting or changing a medicine, or after cancer treatment
- ws-rhabdo (emergency, go now): severe muscle pain or weakness with urine dark like cola
- ws-crisis (emergency, the 9-8-8 crisis page): thoughts of harming yourself, or feeling unable to cope (the document's open item 3: asked on this route only, for now)

## opening questions
- Your age?
- How long has pain been present on most days? (the document's Q2: more than 3 months 3, 6 weeks to 3 months 1, less than 6 weeks 0)

## questions
Q: How many areas of your body hurt at the moment? (WS1, the document's Q1: never shown, answered by the drawing, 3)
Q: Over the last week, how have your tiredness, sleep and concentration been? (WS3: most 3, some 2, fine 0)
Q: Do your muscles hurt when pressed lightly, or does the pain move from place to place over days or weeks? (WS4: both 2, one 1, no 0)
Q: Did it start with a single injury, and does it clearly follow one joint, a nerve line or one muscle? (WS5: no 2; yes 0 and the "one area" card)
Q: How many of these do you also have: frequent headaches, an irritable bowel, jaw pain, or sensitivity to light, noise or smells? (WS6: two or more 2, one 1; one answer, so the maximum stays 2)
Q: Which of these also apply? (WS7, the look-alikes of section 5: long morning stiffness or swollen joints, and over 50 with stiff shoulders and hips - the see-your-doctor card; mainly in the joints and knobbly fingers - osteoarthritis in several joints; very flexible joints - the hypermobility card; already diagnosed - no family-doctor line)
The flow stops as soon as one condition is clearly ahead, but never before the master gate (WS5) and the look-alikes (WS7) have been asked (mustAsk; quality review, 6 Oct 2026). So the shortest path is three questions.

## conditions
- widespread-wsp: Persistent widespread pain (a sensitive pain system). Less than 6 weeks counts -8 (it cannot show; the wsRecent see-your-doctor card instead), and the inflammatory and PMR look-alike answers -3 each (quality review, 6 Oct 2026). Maximum 15; card at 6 (the document's "possible" band); the full "Understanding your pain" explainer at the document's route, 9 or more, or many areas with more than 3 months.
- widespread-multioa: Joint pain in several joints (osteoarthritis), the main look-alike in older people (not in the document; added from the shared OA foundation).

## test patients
Nine, in scripts/check-region-tests.mjs (widespread): the classic picture, the safety questions asked (route plus drawn areas' emergencies), saddle numbness to emergency, recent widespread aching, several-joint OA, the PMR card, one clear injury, the crisis page, hypermobility.
