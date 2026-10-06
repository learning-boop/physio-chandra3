<!-- Source: "Osteosarcoma.docx" (Conditions/General conditions), v0.1 draft,
     4 Oct 2026, pending Chandra's sign-off. Evidence: NICE NG12 (bone
     sarcoma, updated 2023/2025); ESMO-EURACAN-GENTURIS-ERN PaedCan bone
     sarcoma guideline, Ann Oncol 2021; BC Children's Hospital diagnostic
     delay study (BCMJ, "Sometimes we need to think of zebras"); CCLG 2025
     systematic review; Dtsch Arztebl Int 2023; ACSM 2019 exercise-oncology
     roundtable. Clinician reference only. Code: src/data/boneTumour.js. -->

# Osteosarcoma and other primary bone tumours

About 4 per million a year, three-quarters under 25, a second small peak after 60. It presents as a sore knee, thigh or shoulder in a teenager who plays sport, and the BC Children's study found most of the 2-4 month delay to diagnosis happens in primary care and physiotherapy, before the first X-ray. The guide never diagnoses cancer; its job is to get an X-ray done.

## On the site

- **The recognition rule, every area** (open item 2, adopted): two final-check questions in src/data/patternChecks.js, asked when ONE bone area is drawn (knee, shin, thigh, hip or pelvis, shoulder or upper arm; one side; at most two kinds of area, so a knee with the thigh above still counts) and the pain has lasted 2 weeks or more (the shared duration answer; the question itself says "more than three weeks").
  - `pc-bone-young`, ages 5 to 29: pain deep in one bone for more than three weeks with any of: getting worse or more constant; at rest or waking at night; a firm swelling, lump or warmth; a new limp or not using the limb. "Answer yes even if it started with a small knock, if that knock should have healed by now." X-ray **today or tomorrow** (NICE NG12: within 48 hours for children and young people), no booking until the result.
  - `pc-bone`, 30 and over: a narrower question, because rotator cuff, frozen shoulder and arthritis also wake people and build over weeks: pain deep in the bone, "not in the joint or a tendon", getting worse week by week AND at rest or at night; or a firm swelling, lump or warmth. X-ray **this week**, no booking until the result.
  - Both: "ask for an X-ray of the painful bone (the whole bone, not just the joint)", "most X-rays are reassuring, and if anything is found, finding it early matters", and "please do not start or continue physiotherapy, massage or strapping for this area until the X-ray is done" (open item 3).
- **The existing young knee, thigh and shin questions** (`kf-tumour`, `tgf-tumour`, `lgf-tumour`: night ache or a growing lump) now route the same way (today or tomorrow, no booking, the same explanation); they used to offer booking.
- **The watch line** (open items 4 and 8): on the results, for one bone drawn at 5 to 29 or 65 and over: "If this pain is in one bone and is not clearly improving within two to three weeks of sensible care, starts to hurt at night, or a swelling appears, see your doctor for an X-ray rather than continuing to treat it." It sits under the condition cards (or the "no clear match" card) and in the PDF, so it covers Osgood-Schlatter, Sever's, stress fractures and every other knee, shin, thigh, hip and shoulder result for those ages.
- **Diagnosed and treated** (route B): "A bone tumour (such as osteosarcoma or Ewing sarcoma), treated with surgery, chemotherapy or radiotherapy, now or in the past" on the cautions list (`ca-bonetumour`). Results panel "Rehabilitation after bone-tumour treatment" (also in the PDF): the clearance line (surgeon's limits and oncology advice come first; bring them), limb-salvage and implant guidance, amputation and rotationplasty, exercise during chemotherapy for fatigue, and the §6 treated-patient red flags (fever of 38 °C or more → oncology line or emergency; infection or implant problems at the reconstruction; heart symptoms; one swollen calf or sudden breathlessness → 911; new pain, lump or cough → sarcoma team).

## Decisions on the open items (the document's recommendations; awaiting sign-off)

1. Cancer, tumour and sarcoma are kept off the recognition screens ("a cause inside the bone itself"). They appear only on the diagnosed entry and panel.
2. The rule is global, as two age-split questions; see above for the narrower adult version (a change from the document, to avoid sending every adult with a night-painful shoulder for an X-ray with booking held).
3. "Do not start or continue physiotherapy, massage or strapping for this area until the X-ray is done": in both explanations.
4. The watch line covers the growing-pains, Osgood-Schlatter and stress-fracture results by sitting under every single-bone result for the young.
5. Diagnosed-route scope: drafted as the document gives it; no named services (BC Children's, BC Cancer, VGH orthopaedic oncology) in patient copy yet.
6. Survival figures stay in these notes only.
7. Children: the parent answers ("wakes you (or your child) at night"); under 5s are not booked in any case.
8. Watch-line audit: met by the results-page line rather than editing each record.

## Not built

- The scored set's three message tiers by points: the two questions use the document's thresholds in spirit (48 hours for the young, this week for adults).
- A fracture after minor trauma at the painful site: the areas' fracture questions and injury screens ask it.
- Bone pain with fever (Ewing sarcoma, osteomyelitis): the general "fever, chills…" question and the hot-joint questions ask it.
- A treatment-phase question for the diagnosed route; the panel covers all phases.

## Clinic notes (from the document)

- History is the test: localised pain over 3-4 weeks, progressive, nocturnal or at rest, mass, warmth or dilated veins, limp, trivial or no trauma, age 13-16 median (paediatric) or over 60 (secondary: Paget's, prior radiotherapy, retinoblastoma, Li-Fraumeni), fever and weight loss (Ewing).
- Examine the whole shaft and metaphysis (distal femur, proximal tibia, proximal humerus), girth, temperature, effusion versus bony swelling, gait. No manual therapy, strapping, dry needling or loading progression until imaged when the pattern fits; document the advice and the date.
- NICE NG12: very urgent X-ray within 48 hours for unexplained bone swelling or pain in children and young people; urgent X-ray in adults; image the entire bone and adjacent joints; a normal X-ray with persisting symptoms → re-image or MRI; a suspicious X-ray → direct referral to a sarcoma centre (BC Children's oncology; BC Cancer / VGH orthopaedic oncology); biopsy only at the treating centre (ESMO 2021).
- After treatment: get the surgical protocol. Endoprosthesis (distal femur or proximal tibia: extension lag, quadriceps re-education, limited early flexion, lifelong avoidance of high impact and heavy loading; proximal humerus: limited abduction); allograft (protected weight-bearing until union); rotationplasty; amputation (residual limb, contractures, prosthetic gait, phantom pain).
- Chemotherapy: doxorubicin cardiotoxicity (clearance before vigorous exercise), cisplatin ototoxicity and nephrotoxicity, methotrexate and ifosfamide neuro- and nephrotoxicity, peripheral neuropathy, anaemia and thrombocytopenia (team thresholds), neutropenia (infection precautions), cancer-related fatigue (graded aerobic and resistance exercise), bone density, fertility and endocrine late effects, psychosocial needs, school and work.
- Outcomes: MSTS, TESS, 6MWT or 2MWT, TUG, gait, prosthetic measures, PROMIS fatigue. Survival for localised disease about 60-70% at five years (not in patient copy).

## Sources

NICE NG12 (2015, updated 2023/2025); Strauss SJ et al., Ann Oncol 2021;32:1520; BC Children's Hospital diagnostic-delay study, BCMJ; CCLG systematic review and meta-analysis 2025; Dtsch Arztebl Int 2023; Bone Cancer Research Trust and Sarcoma UK; Campbell KL et al., Med Sci Sports Exerc 2019; ASCO/NCCN cancer-related fatigue; limb-salvage and amputation rehabilitation reviews (TESS); Butler & Moseley, Explain Pain.

## Cross-check 6 Oct 2026 (approved by Chandra)
- One-bone rule: three neighbouring areas of one limb (shoulder/upper arm/elbow, hip/thigh/knee, thigh/knee/lower leg, knee/lower leg/ankle) or the pelvis with the low back and one hip now count as one bone (boneTumour.js).
- AIM p. 586 errors: incidence is about 3 to 4 per million per year (not "3.4 million"); it is the commonest primary malignant bone tumour.
