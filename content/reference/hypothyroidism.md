<!-- Source: "Hypothyroidism.docx" (Conditions/General conditions), reviewed
     and signed by Chandra Matla, 3 Oct 2026 (confirmed in the session; the
     saved Word file still shows "v0.1 draft, pending"), with the
     document's recommended answers to its seven open items (below).
     Evidence: ATA 2014 hypothyroidism guideline; NICE NG145 (2019, updated
     2023) and CKS; Duyff et al. JNNP 2000; hypothyroid myopathy reports
     2019-2025; carpal tunnel meta-analysis (Shiri 2014); CCS 2021
     dyslipidaemia (statin muscle symptoms); Osteoporosis Canada 2023.
     Clinician reference only. Code: src/data/thyroid.js (with
     hyperthyroidism). -->

# Hypothyroidism (an underactive thyroid)

The commonest hormone problem a physiotherapist meets without knowing it: about 4-5% of adults, up to one in ten women over 60, about a third undiagnosed; four in five have muscle or nerve complaints. The guide never diagnoses it.

## On the site

- **Route A, undiagnosed:** `pc-hypothyroid`, the very last pattern question, asked for both hands or wrists, both calves, thighs, shoulders or upper arms, a widespread drawing, or a weakness answer. The document's rule: stiff, achy or crampy muscles on both sides for months, slow to recover, with two or more of the "slowing" cluster (cold, tired, weight gain, dry skin or hair loss, constipation, heavier periods, low mood or slowed thinking, hoarse voice, puffy eyes); or both hands numb at night with one or more of them. A yes: family doctor in the next few weeks for a thyroid blood test, mention any statin. **Booking is still offered** (open item 1): light to moderate exercise is safe, and the shoulder, hand or muscle problem still needs care. This is the one hormone screen that does not hold the booking.
- **Route B, diagnosed:** "An underactive thyroid (for example Hashimoto's), diagnosed by a doctor, or taking thyroxine (levothyroxine)" on the cautions list (`ca-hypothyroid`), kept apart from the overactive entry (open item 6). Results and PDF panel "An underactive thyroid and rebuilding strength": the dose-check line; thyroxine timing (open item 5: kept, standard pharmacy and ATA advice); building slowly by next-day recovery; a night splint for numb hands; the statin line (open item 4: kept, in the panel and the screen's explanation, not as a scored question); over-replacement signs → doctor soon; 911 for chest pain or breathlessness when starting activity or thyroxine, and for the myxoedema picture (open item 7).
- **Cross-links (open item 2):** the carpal tunnel records in the wrist and hand ("both hands tingle or go numb at night: ask whether your thyroid and blood sugar have been checked"); the frozen-shoulder record already asks about thyroid and blood sugar (hyperthyroidism.md); the widespread-pain doctor line now says "a few simple blood tests (including a thyroid test)". That last change edits the signed fibromyalgia text by four words, accepted with this sign-off.
- **The final check now holds up to six questions.** A both-shoulders or both-thighs drawing at 50 or over can ask PMR, low hormones, the nerve and muscle screen, calcium, the overactive and the underactive thyroid questions there (the myositis and Cushing's questions are on the doctor page, and for legs the 911 paralysis question). The calcium and the two thyroid questions sit last, so they drop first if a seventh ever competes.

## Decisions on the open items (accepted with the sign-off, 3 Oct 2026)

1. Booking stays available after the undiagnosed screen (the document's proposal), unlike the other hormone screens.
2. Cross-links: carpal tunnel (both hands at night), frozen shoulder, widespread pain. Implemented as the same "ask whether thyroid and blood sugar were checked" line in each record rather than a shared component.
3. Scores collapsed into one question with the document's rules; the POSSIBLE band (4-6) is not built.
4. Statin: in the screen's explanation and the diagnosed panel, not a scored question.
5. Thyroxine timing: kept in the diagnosed panel.
6. Kept separate from hyperthyroidism (different exercise rules); both live in src/data/thyroid.js.
7. Myxoedema and exertional chest pain: 911 lines in the diagnosed panel.

## Already on the site, not repeated

Dark (cola-coloured) urine with severe muscle pain (rhabdomyolysis, emergency); ascending numbness or bladder or bowel change (spinal and nervous-system questions); heart and chest pain questions; the head-injury 9-8-8 question.

## Not built

- Myxoedema crisis and exertional chest pain as tick-box questions for the undiagnosed (rare; the heart questions exist).
- A hard, growing neck lump with hoarseness; pregnancy and postpartum thyroid testing; a general self-harm question outside the head-injury screen.
- The POSSIBLE band line.

## Clinic notes (from the document)

- Red flags: bradycardia, hypothermia, altered mentation (myxoedema); exertional chest pain (CAD risk, especially older or untreated); rhabdomyolysis on a statin.
- History: cause (Hashimoto's, anti-TPO; after RAI or surgery; amiodarone, lithium, checkpoint inhibitors; postpartum thyroiditis; iodine), thyroxine dose, timing and absorption (food, calcium, iron, PPIs, soy), last TSH and FT4 (central → FT4, see hypopituitarism.md), statin and CK, pregnancy, coexisting autoimmunity (type 1 diabetes, coeliac, pernicious anaemia, Addison's: fatigue with low BP is urgent).
- Exam: delayed ankle-jerk relaxation (Woltman), proximal strength, calf pseudohypertrophy (Hoffmann's), myoedema, carpal tunnel both sides (Phalen, Tinel, Durkan, CTS-6), polyneuropathy screen (up to about 40% have axonal signs), shoulder capsular pattern (check both), knee effusions, Dupuytren's or LJM, goitre, puffiness, hoarseness.
- Function: 30-second chair stand, 5 times sit-to-stand, TUG, grip, step test with RPE; expect delayed soreness and slower recovery → 48-72 hours between sessions at first.
- Labs are the GP's: TSH with or without FT4, anti-TPO, lipids; CK often mildly to moderately raised and normalises with treatment; a markedly raised CK with weakness still needs inflammatory myopathy excluded.
- Bone: long-term over-replacement (suppressed TSH) → bone loss; DXA via the GP after the menopause.
- Exercise: no specific cardiac restriction once treated; start low to moderate, progress by recovery; untreated or newly treated older adults with cardiac risk: moderate only until reviewed. Most myopathic symptoms resolve within 6 months of normal levels; about 13% have residual weakness at a year (Duyff) → training indicated.

## Sources

Jonklaas J et al., Thyroid 2014;24:1670 (ATA); NICE NG145 (2019, updated 2023) and CKS Hypothyroidism; Duyff RF et al., JNNP 2000;68:750; hypothyroid myopathy and Hoffmann's syndrome reports (BMJ Case Rep 2019; J Med Case Rep 2023); Shiri 2014 carpal tunnel meta-analysis; Cureus 2021 cohort; Canadian Cardiovascular Society 2021 dyslipidaemia guideline; EAS statin consensus; frozen shoulder and thyroid studies (Schiefer 2017; reviews 2020-2024); Osteoporosis Canada 2023; Butler & Moseley, Explain Pain.
