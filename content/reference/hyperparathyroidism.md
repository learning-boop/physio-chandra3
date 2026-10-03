<!-- Source: "Hyperparathyroidism.docx" (Conditions/General conditions),
     reviewed and signed by Chandra Matla, 3 Oct 2026 (confirmed in the
     session; the saved Word file still shows "v0.1 draft, pending"), with
     the document's recommended answers to its seven open items (below).
     Evidence: Fifth International Workshop on PHPT, J Bone Miner Res 2022
     and its 2023 clinical-manifestations review; NICE NG132 2019;
     Canadian/international consensus 2016; KDIGO CKD-MBD 2017; ACR/EULAR
     CPPD 2023; Osteoporosis Canada 2023. Clinician reference only.
     Code: src/data/parathyroid.js. -->

# Hyperparathyroidism: calcium balance, bones, joints and muscle

Common (primary: about 1 in 500 women over 50; secondary: common with CKD and low vitamin D), but about four in five people have no classic symptoms. The guide never diagnoses it.

## On the site

- **Route A, undiagnosed:** `pc-calcium` in src/data/patternChecks.js, the last of the pattern questions so it never pushes another out. Asked for both shins, thighs or hips drawn, or a widespread drawing (4 or more areas). It asks for a deep ache "in the bones" on both sides, at rest and worse on the feet, together with any of: a kidney stone; a bone broken in a small fall or with no real injury, or thin bones; two or more of thirst or passing more urine, constipation/nausea/poor appetite, low mood or brain fog, poor sleep; or a high calcium or low vitamin D result never followed up. A yes: family doctor in the next week or two for calcium, vitamin D and PTH, with no booking until then. It names "an overactive parathyroid gland or low vitamin D" once (open item 1).
- **Route B, diagnosed:** "A parathyroid or calcium problem, or kidney-related bone disease, diagnosed by a doctor (including before or after parathyroid surgery)" on the cautions list (`ca-parathyroid`). Results panel "Calcium balance, bones and muscles" (also in the PDF): what PTH does, recovery over one to two years after surgery, what physiotherapy offers, and seven lines: fluids; walking, sit-to-stands and heel raises; protect the back and wrists, clear trip hazards; no self-started high-dose calcium or vitamin D; 911 or ED for the high-calcium crisis; same day for low calcium after neck surgery ("hungry bone", open item 7); kidney team promptly for new bone pain, a painful purple skin patch or a non-healing wound with CKD.
- **Cross-link, gout or pseudogout (open item 3):** the knee, elbow, wrist and hand gout or pseudogout questions (kf-gout, erf-gout, wrf-gout, hnd-gout) now explain that a doctor should check a crystal attack and rule out infection, and that under 60, or with attacks that keep coming back, it is worth asking about calcium and PTH (EULAR). The ankle's question is about gout of the big toe only, so it is unchanged.
- **Cross-link, osteoporosis (open item 4):** content/conditions/upperback-osteoporosis.md adds a "see a physiotherapist if" line ("if your thin bones or a fracture have no obvious cause, ask your doctor whether your calcium and parathyroid hormone have been checked") and a clinic note (NICE NG132).
- **Already on the site (document §6 "add only if missing"):** the septic joint (hot joint with fever; emergency), the kidney stone (pain from the side or flank toward the groin, blood in the urine; pc-urinary), fragile-bone spine fractures (`osteo` questions) and the hip after a minor fall, cancer-pattern bone pain (night pain, weight loss, cancer history).

## Decisions on the open items (accepted with the sign-off, 3 Oct 2026)

1. Names the parathyroid once on the undiagnosed screen, as the document recommends (the test is a routine blood panel).
2. The scored set is collapsed into one question that keeps the document's doctor-first rules (bone ache with a stone, an easy fracture or thin bones, the cluster, or an untested result). The under-65 fracture rule is covered by "bone ache with a bone broken in a small fall"; a fracture with a stone and no bone ache is not asked separately. The POSSIBLE band (4-6) is not built.
3. Pseudogout cross-link: added.
4. Osteoporosis cross-link: added.
5. CKD-related bone disease stays part of this record (one cautions entry, a kidney-team line in the panel), not a separate entry.
6. Self-care loading kept to walking, sit-to-stands and heel raises.
7. Post-surgery wording: "tingling around the mouth or in the fingers, cramps or spasms in the hands and feet, or twitching … your surgical team or the emergency department the same day (low calcium)".

## Not built

- A growing neck lump, hoarseness or difficulty swallowing (rare; not specific enough to ask everyone).
- The high-calcium crisis and post-operative low calcium as tick-box safety questions: the diagnosed status is only known on the last page, so they are in the diagnosed panel instead.
- Separate CPPD-flare advice on the results (the knee and wrist gout questions route a hot joint to a doctor first).

## Clinic notes (from the document)

- History: calcium, PTH, vitamin D and eGFR if known; stones; fractures (distal radius, vertebral, rib); CKD stage and dialysis; thiazides, lithium, calcium or vitamin D supplements, teriparatide; bariatric surgery or malabsorption; family history (MEN1/2A; FHH mimics PHPT); neck radiation; parathyroidectomy date and post-op calcium.
- Red flags: hypercalcaemic crisis (Ca over 3.5 mmol/L); post-op hypocalcaemia (Chvostek, Trousseau, perioral paraesthesia); septic joint; pathological fracture through a brown tumour (rare); malignancy-pattern bone pain.
- Exam: height loss of 4 cm or more, kyphosis, wall-occiput, rib-pelvis, vertebral percussion; distal radius; proximal strength, 30-second chair stand, TUG, single-leg stance or Berg; gait (waddle: myopathy or osteomalacia); CPPD joints (knee effusion, wrist, MCP 2-3 hook OA pattern); neck inspection.
- Bone: FRAX underestimates in PHPT (cortical loss, radius 33% site). Fifth Workshop 2022 surgical criteria: Ca more than 0.25 mmol/L above ULN, T-score -2.5 or lower at any site, vertebral fracture, eGFR under 60, stones or hypercalciuria, age under 50.
- CPPD: ACR/EULAR 2023; screen for PHPT (and haemochromatosis, hypomagnesaemia, hypophosphatasia) in CPPD under 60 or polyarticular or recurrent.
- CKD-MBD (KDIGO 2017): fragility with normal or high BMD, vascular calcification: avoid high-impact loading, coordinate with nephrology; calciphylaxis is urgent.
- After parathyroidectomy: BMD gains over 1-2 years (spine and hip more than radius); bone-safe loading from the start; hungry-bone awareness in the first 1-2 weeks.
- Programme: progressive resistance 2-3 times a week plus weight-bearing or impact per Osteoporosis Canada 2023 (adapted to fracture status), balance, hip-hinge patterns, aerobic for mood and energy.

## Sources

Bilezikian JP et al., J Bone Miner Res 2022;37:2293; PHPT clinical manifestations review 2023 (PMC10515122); NICE NG132 (2019); Khan AA et al. 2016; Italian guidelines 2024; KDIGO 2017 CKD-MBD; Abhishek A et al. 2023 ACR/EULAR CPPD criteria; EULAR 2011 CPPD recommendations; Osteoporosis Canada 2023; hypercalcaemic crisis and hungry bone syndrome reviews; Butler & Moseley, Explain Pain.
