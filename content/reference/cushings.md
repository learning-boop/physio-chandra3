<!-- Source: "Cushings Syndrome.docx" (Conditions/General conditions),
     reviewed and signed by Chandra Matla, 3 Oct 2026 (confirmed in the
     session; the saved Word file still shows "v0.1 draft, pending" and no
     signature). Evidence: Endocrine Society diagnosis 2008 and treatment
     2015 guidelines; Pituitary Society consensus, Lancet Diabetes
     Endocrinol 2021; Vogel 2020 (German Cushing's Registry); Pituitary 2024
     bone review; ACR 2022 glucocorticoid-induced osteoporosis; Osteoporosis
     Canada 2023. Clinician reference only. Code: src/data/steroids.js. -->

# Cushing's syndrome and steroid medicine

The guide never diagnoses Cushing's. Steroid medicine is by far the commonest cause, so most of this is a steroid-safety overlay.

## On the site

- **Route A, undiagnosed (not named, open item 1):** `pc-hormone` in src/data/patternChecks.js, asked right after the myositis question for the same triggers: both thighs, hips, shoulders or upper arms drawn, or a weakness answer with a shoulder, upper arm, hip, thigh or knee drawing. It asks for weakness in both thighs or shoulders built up over months together with steroid medicine in the past year OR body changes (central weight gain with thin limbs, wide purple or red stretch marks, easy bruising, thin skin); that is the document's rule "Q1 = 3 with Q2 yes or Q3 at least 1". A yes is doctor first in the next week or two, with no booking until then: mention the changes together, bring a list of every medicine, inhaler, cream and supplement, and do not stop steroid tablets alone.
- **Route B, diagnosed:** "Cushing's syndrome, diagnosed by a doctor (being treated, or treated in the past)" on the cautions list (`ca-cushing`). Physio route; the results show "Cushing's syndrome and rebuilding strength": strength does not come back by itself after treatment, progressive strength work is safe and is the treatment, bone-safe lifting, balance, pacing, and the withdrawal period after surgery or a taper.
- **The steroid overlay (open item 4, adopted):** "Do you take steroid medicine, or have you in the past year?" on "A little about you" (tablets for 3 months or more / other steroids: high-dose inhalers, repeated injections, or a herbal, skin or body-building product / no, or only a short course / not sure), required. With either "yes", these go first on the safety pages:
  - 911: very weak, dizzy or faint with vomiting, stomach pain, fever or confusion, on steroids or since stopping them (adrenal crisis; use an emergency card or injection if carried).
  - Emergency department: confusion, hallucinations, or very low mood with thoughts of self-harm since starting or changing steroids (9-8-8 also given).
  - Doctor today: fever or feeling unwell, a hot swollen joint, or a wound or skin infection not healing (steroids hide infection signs).
  - Today, for knee or thigh drawings: a sudden snap or pop at the front of the knee or thigh, then cannot straighten the knee or lift the leg (quadriceps or patellar tendon; the knee had no rupture question).
  - The results add "Steroid medicine, muscles and bones" with four self-care lines: never stop steroid tablets suddenly (and keep a steroid card if you have one, open item 5); sit-to-stand and step-ups only (open item 6); protect the back while bones are at risk; ask the doctor about calcium, vitamin D, bone density and bone medicine.
- **Already on the site (document §6 "add only if missing"):** fragile-bone fractures of the spine (the `osteo` questions in the low back, TL junction, pelvis, tailbone and base of the neck, which name long-term steroids), the steroid hip (`hpf-avn`: long-term steroids with a deep groin ache), Achilles pain on steroids or quinolones (ankle), leg and lung clots, the hot joint with fever, spreading weakness, and double vision (nervous-system screen).
- **The final check** holds up to five questions (four with this document, five with hypopituitarism.md), and drawing-triggered questions the doctor page's two-question limit cuts are now asked there instead of being dropped (see hypopituitarism.md).
- **Chandra's summary** has a STEROID MEDICINE line (confirm drug, prednisone-equivalent dose, duration, route, taper plan, emergency card); the PDF carries the panel. The answer is not in the anonymous copy or the AI overview; the privacy page says so.

## Decisions on the open items (accepted with the sign-off)

1. Not named on the undiagnosed screen ("the body's own steroid hormone (cortisol) or steroid medicines").
2. Stands beside the myositis question rather than merged into it: same triggers, asked in sequence, so the two "both-sided weakness" causes route to different tests (CK vs cortisol and a medicine review).
3. The scored set is collapsed into the one question, keeping the document's doctor-first rule. The POSSIBLE band (5-7: "mention it at your next visit") is not built.
4. The steroid overlay is adopted, with its own question on "A little about you".
5. "Do not stop steroids suddenly" is in the screen and the panel; the emergency card is mentioned as "if you have one".
6. Self-care dose kept to sit-to-stand and step-ups.
7. Unregulated products named neutrally ("a herbal, skin or body-building product that may contain steroids"), no group named.

## Not built

- A separate fracture, hip or tendon question for steroid users in every area: the spine, hip and Achilles questions already name steroids, and the shoulder and upper arm injury screens ask about a pop during a lift.
- Pituitary apoplexy (headache with side-vision loss or a drooping eyelid): rare; the nervous-system screen asks about double vision.
- A "muscle weakness linked to cortisol excess" result card (no region condition; the panel does that job).

## Clinic notes (from the document)

- Exposure: drug, dose in prednisone equivalents, duration, route (inhaled, topical, intra-articular, epidural, unregulated), taper status, emergency card, sick-day rules; endogenous Cushing's status (before or after surgery, medical therapy, radiotherapy), adrenal replacement after cure; BP, HbA1c, potassium, VTE history.
- Discriminating signs (Endocrine Society 2008): purple striae over 1 cm, plethora, proximal weakness, unexplained bruising, unexplained osteoporosis. Unsuspected Cushing's in up to 10.8% of older people with osteoporosis and vertebral fractures.
- Function: 30-second chair stand, 5 times sit-to-stand, TUG, stair climb, grip, hip flexor, abductor and extensor, knee extensor, shoulder abductor and ER strength; Trendelenburg; Berg or single-leg stance.
- Spine: kyphosis, height loss of 4 cm or more, wall-occiput and rib-pelvis distance, percussion tenderness → vertebral fracture assessment. ACR 2022: anyone on 2.5 mg prednisone-equivalent or more for 3 months or more needs a fracture-risk assessment; FRAX underestimates in Cushing's and steroid use.
- Hip: pain on internal rotation and flexion, log roll, FADIR; avascular necrosis risk rises with doses over 20 mg a day, cumulative dose, alcohol, lupus → low threshold for MRI (X-ray normal early).
- Myopathy: painless, type II fibre atrophy, CK normal (raised CK → think inflammatory myopathy). Vogel 2020: strength 71% of controls 6 months after remission, no spontaneous recovery by 4 years → structured resistance training.
- Skin fragility: avoid tape and strong manual techniques. Adrenal insufficiency during rehab after cure or a taper (fatigue, nausea, postural dizziness) → liaise.

## Sources

Nieman LK et al., JCEM 2008 (diagnosis) and 2015 (treatment); Fleseriu M et al., Lancet Diabetes Endocrinol 2021; Vogel F et al., JCEM 2020; Cushing's disease and bone, Pituitary 2024; glucocorticoid myopathy reviews (Endocrinol Metab 2021); ACR 2022 GIO guideline; Osteoporosis Canada 2023; avascular necrosis reviews (J Med Case Rep 2021); NHS / Society for Endocrinology steroid emergency card guidance; Butler & Moseley, Explain Pain.
