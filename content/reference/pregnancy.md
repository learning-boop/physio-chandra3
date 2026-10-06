<!-- Source: "Pregnancy.docx" (condition intake, Conditions/General
     conditions), v0.1 draft, 3 Oct 2026, built with the document's
     recommended answers to its open items (see below; not yet signed).
     Evidence: SOGC/CSEP 2019 Canadian Guideline for Physical Activity
     throughout Pregnancy; ACOG Committee Opinion 804 (2020); European PGP
     guidelines (Vleeming 2008); relaxin reviews (Aldabe 2012; scoping 2021);
     lumbopelvic prevalence meta-analysis 2023; Wuytack 2020; Cochrane 2015;
     Goom/Donnelly/Brockwell 2019; NICE NG201, RCOG 37a/b, SOGC 2022.
     Clinician reference only. Code: src/data/pregnancy.js. -->

# Pregnancy and the year after: context, red flags, lift and the results panel

Pregnancy is not a region condition and not a disease. It enters as a global overlay, like diabetes.

## On the site

1. **The context question** (document Q1). On "A little about you", after age and birth sex, for a birth sex of female or "intersex, or prefer not to say", aged 16 to 49: "Are you pregnant, or have you given birth in the last 12 months?" (up to 12 weeks / 13 to 27 weeks / 28 weeks or more / gave birth in the last 6 weeks / 6 weeks to 12 months ago / No). Required when shown. After a birth, an optional "How was your baby born?" (vaginal / with forceps, ventouse or a large tear / caesarean). Stored as `answers.preg`, `answers.pregBirth`. Changing the age or sex so the question no longer applies clears them.
2. **Red flags first** (document §6), in every area, ahead of the diabetes and steroid ones, minus any the page already asks (`covers`):
   - 911: heavy bleeding or bleeding with faintness/severe pain (pregnant; replaces the pelvis's prf-pregnancy-bleed); constant severe tummy pain or a hard, tender bump (pregnant); heavy bleeding after the birth (first 6 weeks); sudden breathlessness, chest pain or coughing blood (pregnant and first 6 weeks; skipped where the area asks its lung-clot question).
   - Labour and delivery: bleeding, or waters or regular tightenings before 37 weeks (pregnant; replaces prf-pregnancy); pre-eclampsia signs (13 weeks on and first 6 weeks; the wording says "after 20 weeks"); fewer movements (13 weeks on; the wording says "past about 24 weeks").
   - Emergency department: postpartum mood, self-harm thoughts, confusion or hallucinations (the whole year; 9-8-8 in the explanation); cauda equina (back, pelvis or leg drawings, only where the area does not already ask it).
   - Doctor today: one swollen, warm, painful calf or thigh (pregnant and first 6 weeks; skipped where the area asks its own leg-clot question); fever, bad-smelling discharge or a wound opening (first 6 weeks); back or pelvic pain with fever, burning urine or loin pain (pelvis drawings, where the area has no kidney question); fainting, palpitations or breathlessness with light activity (28 weeks on and the year after: peripartum cardiomyopathy).
   - Doctor in a day or two, no booking: sudden severe back pain with height loss or pain on sitting up (28 weeks on and the year after: pregnancy- and lactation-associated osteoporosis).
   - Doctor (booking kept): worsening groin pain with a limp or night pain (hip or thigh drawings, 28 weeks on and first 6 weeks: transient osteoporosis of the hip); after the birth, severe front-pelvis pain, unable to walk (first 6 weeks: symphysis separation).
   - "No" leaves out the areas' "Are you pregnant and…" questions (prf-pregnancy-bleed, prf-pregnancy, hrf-pregnancy); the ectopic questions ("could you be pregnant") are still asked. From 13 weeks the ectopic questions (hpf-ectopic, srf-ectopic) are left out.
3. **The pelvic girdle gate.** sij-pgp (`onset: pregnancy, postpartum`) now opens when the overlay is on, whatever "How did it start?" was, and the pelvis's P5 (pubic bone, clicking, heavy straight leg, turning in bed) is asked. Test patients sij 2b and 2c.
4. **The lift** (document §4, "reweights"), ORDER only (`rankAcross(…, bonus)`, added to the diabetes lift); a condition still meets the 40% rule on its own.

   | Condition | p1 / p2 / p3 / pp6 / pp12 |
   |---|---|
   | Pelvic girdle pain (sij) | 2 / 2 / 2 / 2 / 2 |
   | Pubic-related groin pain (hip) | 2 / 2 / 2 / 2 / 1 |
   | Carpal tunnel (wrist, hand) | 1 / 2 / 2 / 1 / 0 |
   | De Quervain's (wrist) | 0 / 1 / 2 / 2 / 2 |
   | Meralgia paraesthetica (hip, thigh) | 0 / 1 / 1 / 0 / 0 |
   | Non-specific low back pain | 1 / 1 / 1 / 1 / 1 |
   | Pelvic floor muscle pain (coccyx) | 0 / 0 / 0 / 1 / 1 |
   | Rib joint strain (upper back) | 0 / 1 / 1 / 0 / 0 |

5. **What the maternity team has advised** (document Q2, open item 3: asked). While pregnant, on "Before your results", optional: told to limit activity; bleeding, waters or contractions before 37 weeks; placenta praevia after 28 weeks; hypertension or pre-eclampsia; cerclage or short cervix; complicated multiples; heart or lung condition; growth restriction; severe anaemia or uncontrolled diabetes or thyroid disease; none. Any tick → the panel drops the exercise dose and says "please confirm with your maternity team before starting or increasing exercise"; booking is still offered. Not answered → the general guidance, which already says "unless your maternity team has advised otherwise".
6. **The results panel** ("Your pregnancy and this problem" / "After your baby", also in the PDF): the document's §2 text (load and adaptation, never loose or unstable), then: the pelvic strategies when a pelvic or low-back condition is shown; the night splint for carpal tunnel; the scoop lift and thumb splint for de Quervain's; while pregnant, 150 minutes a week over 3 days with strength (or the clearance line), stop signs, and the first-trimester or later-pregnancy positioning line; after the birth, the staged return (early pelvic floor and walking, strength from about 6 weeks or when cleared, slower after a caesarean, running from about 12 weeks after a pelvic-health check), pelvic-floor symptoms and the tummy gap; daily pelvic-floor squeezes; side-lying with a pillow; and the warning signs to contact the maternity unit first.
7. **Chandra's summary**: a PREGNANCY / POSTPARTUM section (stage, birth, limits; "not answered → clear with the PARmed-X for Pregnancy"). Left out of the anonymous copy and the AI overview. "Pregnant, or within 3 months of giving birth" (ca-preg) is no longer shown on the cautions list once the question has been answered.
8. **Language**: sij-pgp's blurb no longer says hormones loosen the joints (document §2 correction). A check holds the pregnancy texts and that blurb free of "unstable", "alignment", "loosen", cure and guarantee.

## Decisions made while building (open items)

1. **Global overlay**: adopted (recommended).
2. **Relaxin correction**: adopted in the panel and the sij-pgp blurb, at the document's strength.
3. **Q2 asked**: yes, as one optional tick-all on "Before your results", not before the safety pages, so it adds no step for anyone not pregnant.
4. **Postpartum figures**: published as the document drafts ("from around six weeks, or when you have been cleared"; running "usually from about twelve weeks, after a pelvic-health check").
5. **Pelvic floor and diastasis**: kept in this panel, not a separate record. The wording says "a pelvic-health physiotherapist can help" and does not say the clinic offers internal assessment. **Please confirm whether the clinic offers pelvic-health physiotherapy**; if it does, the line can say so.
6. **Scores and thresholds**: the document's Q3 to Q6 (where, single-leg loading, spread, risk factors) are already the pelvis's P1, P2, P4 and P5 with sij-pgp's pointers, so no new scored questions were added and the 7 / 4 to 6 thresholds were not built separately. The "pregnancy-related back or pelvic pain" combined card is covered by the panel. Q6 (previous PGP, heavy work) is not asked (question budget). The hand +2 lift is as drafted.
7. **Perinatal mental health**: included, emergency department with 9-8-8 in the explanation (the same pattern as the steroid mood flag), 911 if in danger now.
8. **Local pathway names**: not used; patient text says "your maternity unit", "labour and delivery unit", "doctor or midwife".

Other choices, please confirm:
- **The leg clot** (§6 says 911 for a swollen calf or breathlessness): split. Breathlessness, chest pain or coughing blood → 911. One swollen, warm, painful calf or thigh alone → doctor the same day (with "911 if you also become breathless"), matching the site's existing DVT rule.
- **Placental abruption** ("severe constant tummy pain or a hard tender bump", §6 "maternity unit now / 911"): 911.
- **Stage windows**: clot and postpartum-bleeding/infection flags for pregnancy and the first 6 weeks only; mood for the whole year; pre-eclampsia from 13 weeks (the option band) with "after 20 weeks" in the wording; movements from 13 weeks with "past about 24 weeks" in the wording.
- **Age band** (Chandra, 4 Oct 2026): asked from 16 to 49 only; the age bands became "5 to 15" and "16 to 29" for this. The areas' own pregnancy and ectopic safety questions follow the same ages. "Pregnant, or within 3 months of giving birth" on the cautions list is shown from 16 to 64, as the fallback for the rare pregnancy at 50 and over. This is the one exception to the rule that no emergency question is left out by age (2 Oct 2026): Chandra chose 16 to 49 over 5 to 49, accepting that a pregnant 13 to 15 year old is not asked the ectopic question.

## Not built

- Weeks since birth beyond the 6-week / 12-month split; parity.
- Round ligament pain, early labour and UTI as look-alike cards (early labour and infection are red flags; round ligament pain was left as reassurance only).
- Leg cramps, rib flare and diastasis as condition cards (covered by panel notes or not in the guide).
- An "optional chip" on other areas (the question is asked on every drawing, not only back, pelvis, hip, hand/wrist or rib).

## Clinical notes (internal, document §7)

Obstetric red flags first; PARmed-X for Pregnancy / Get Active Questionnaire for Pregnancy (CSEP 2019) for exercise clearance; note gestation, parity, mode of delivery, complications (GDM, hypertension, placenta praevia, cervical insufficiency, multiples, IUGR), VTE risk, anaemia, previous PGP/LBP. PGP classification (Vleeming 2008 / Albert): pelvic girdle syndrome (bilateral SIJ + symphysis, worst prognosis), symphysiolysis, one-sided SIJ, double-sided SIJ. Tests: P4/thigh thrust, Patrick's FABER, long dorsal SI ligament palpation, Gaenslen, modified Trendelenburg, symphysis palpation, ASLR (with compression/belt), lumbar screen (repeated movements; neuro screen, SLR/slump if below-knee symptoms), hip screen (FADIR, IR loss; limp in the third trimester → MRI for transient osteoporosis, protected weight-bearing), ribs/thoracic, diastasis (inter-recti distance, doming), CTS (Phalen/Tinel), de Quervain's (Finkelstein/Eichhoff), coccyx. Outcomes: PGQ, ODI/RMDQ, ASLR score, PSFS. Fear-avoidance and catastrophising predict persistence: movement-positive language; avoid "instability", "loose ligaments", "out of alignment". Management: individualised exercise, education, pelvic belt, manual therapy as adjunct, acupuncture (moderate evidence), water exercise; avoid single-leg loading in a flare; crutches rarely. Exercise (SOGC/CSEP 2019): at least 150 min/week moderate over at least 3 days, aerobic + resistance, daily PFMT; modify supine after the first trimester if symptomatic; avoid contact, fall risk, heavy Valsalva, heat; talk test. Postpartum: PFMT and mobility early; progressive loading from about 6 weeks or when cleared (caesarean: scar, longer); return to running at 12 weeks or later with a pelvic-health screen (Goom et al. 2019); diastasis: load management, not avoidance; feeding and lifting ergonomics; de Quervain's: thumb spica, scoop lift; CTS: night splints, usually self-limiting. Lactation bone loss recovers after weaning; rare PLO: sudden thoracolumbar pain → imaging. Liaison: midwife/OB/family physician; pelvic-health physiotherapist; BC Women's resources.

## Cross-check 6 Oct 2026 (approved by Chandra)
- Bleeding in the first 12 weeks, or one-sided lower tummy pain, goes to the emergency department (pg-earlybleed); labour and delivery from 13 weeks.
- Pre-eclampsia signs now include pain high in the middle of the tummy, nausea or vomiting and new breathlessness; the stop-exercise list adds breathlessness or dizziness that does not settle with rest, a headache and a painful swollen calf (CSEP/SOGC 2019; ACOG 804).
- Contraindication list: "Triplets or more, or twins after 28 weeks"; added "A previous preterm birth, or repeated miscarriages" and "An eating disorder, or being very underweight".
- Diastasis wording: narrows most in the first two months (Sperstad 2016, secondary source).
