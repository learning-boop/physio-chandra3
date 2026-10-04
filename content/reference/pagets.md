<!-- Source: "Pagets Disease.docx" (Conditions/General conditions), v0.1
     draft, 4 Oct 2026, pending Chandra's sign-off. Evidence: Ralston SH et
     al., J Bone Miner Res 2019 (Paget's Association guideline); Singer FR et
     al., Endocrine Society, JCEM 2014; Nairn & Ralston 2020; Paget's
     Association resources; OARSI 2019, NICE NG226; ESMO 2021 (secondary
     osteosarcoma). Clinician reference only. Code: src/data/paget.js. -->

# Paget's disease of bone (osteitis deformans)

A focal disorder: one bone or a few (pelvis, lumbar spine, femur, tibia, skull) remodel far too fast. Mostly over 55, about 70% without symptoms, becoming rarer and milder. The guide does not diagnose it; most people who reach the site with it are diagnosed and have an ordinary hip, knee or back problem next to the bone.

## On the site

- **Route A, undiagnosed:** `pc-paget` in src/data/patternChecks.js (final check), for 50 and over with ONE shin, thigh, hip, pelvis, low back or head area drawn (one side; at most two kinds of area) and pain for 6 weeks or more. It asks for a deep, constant ache in one bone at rest and often at night, together with any of: warmth or visible bowing; a bigger hat size, hearing loss or headaches with a feeling the head has grown; a past high alkaline phosphatase, or a parent or sibling with Paget's. A yes: family doctor in the next few weeks for a blood test and an X-ray; avoid jumping or heavy impact on a bowed bone until checked; booking still offered.
- **The sarcoma flag for diagnosed people:** the osteosarcoma adult bone question (`pc-bone`, src/data/boneTumour.js) now ends "If you have Paget's disease of bone, answer yes for new pain in that bone that is steadily getting worse over weeks, or a new swelling over it". Its "not explained by a diagnosed condition" opening would otherwise have told them to answer no. A yes: X-ray this week, no booking until the result.
- **Route B, diagnosed:** "Paget's disease of bone, diagnosed by a doctor" on the cautions list (`ca-paget`). Results panel "Paget's disease of bone and this area" (also in the PDF): the four pain sources (the bone, the joint next to it, a bowed limb's loading, a nerve) and what helps each; daily low-to-moderate impact activity, no jumping or heavy impact on a bowed shin or thigh; ALP checked every one to two years; tell any surgeon, dentist or anaesthetist (joint replacement usually does well); and the §6 red flags (new worsening pain or a new swelling → X-ray within a week; sudden sharp pain in a bowed bone → today; cord or skull-base signs → emergency department now; confusion, thirst or vomiting while laid up → same day, high calcium; hearing or facial nerve changes → doctor).

## Decisions on the open items (the document's recommendations or the safer alternative; awaiting sign-off)

1. **No ancestry question** (the document's alternative): age-only gating at 50 and over, plus "one bone, for months". The question would have been public and sensitive, and the one-bone, over-50 gate already keeps it rare.
2. Sarcoma wording: in the diagnosed panel only, as "Rarely, Paget's bone can change in a way that needs early imaging". Cancer, tumour and sarcoma are not used.
3. Named on the undiagnosed screen ("Paget's disease of bone: a treatable condition in which one bone renews itself too fast").
4. Booking still offered on the doctor-first screen (no danger at everyday loads; the joint problem can be treated alongside).
5. Impact: "low-to-moderate impact activity; avoid jumping and heavy impact on a bowed shin or thigh".
6. The recognition screen is built, but narrowly (see 1), because the osteosarcoma rule only covers pain that is worsening.
7. The "tell your surgeon, dentist or anaesthetist" line is kept.
8. ALP monitoring "usually every one to two years" is in patient copy.

## Not built

- The scored set and its POSSIBLE band (4-7): one yes/no question, as for the other hormonal and bone entries.
- The diagnosed chip's details (which bones, infusion, last ALP): the panel covers all of them in general terms.
- A Paget's fracture question in each area: the areas' fracture questions and injury screens ask it, and the panel names it.

## Clinic notes (from the document)

- Ralston 2019: diagnose with an X-ray of the symptomatic site (bone scan for extent) and total ALP (PINP if ALP is unreliable). Zoledronic acid 5 mg IV, single dose, preferred for bone pain; monitor ALP every 1-2 years.
- Localise the pain source: Pagetic bone (constant, nocturnal, warm, responds to bisphosphonate); secondary OA (mechanical; arthroplasty when indicated, with more bleeding, altered anatomy and pre-op bisphosphonate); deformity load (bowing → varus knee, leg-length difference); fissure fracture (focal tenderness on the convex cortex; X-ray; protected weight-bearing; delayed union); stenosis or nerve compression (neuro screen; MRI).
- Red flags: sarcomatous change (under 1%; escalating pain, mass, rising ALP → urgent imaging and sarcoma referral), pathological fracture, cord compression, basilar invagination, hypercalcaemia with immobility, high-output heart failure, hearing.
- Exam: warmth with the back of the hand (compare sides), bowing, limb length and alignment, skull size, hip and knee ROM and OA signs, lumbar and pelvic exam with neuro, gait, 30-second chair stand, TUG, balance, a hearing question.
- Exercise: everyday and moderate loading are tolerated; progressive resistance, balance, low-to-moderate impact weight-bearing; avoid high impact, heavy axial loads and torsion through bowed long bones; adjacent-joint OA programme (GLA:D-style); heel raise for leg-length difference; walking aid when it helps; falls prevention; early mobilisation when laid up (hypercalcaemia).

## Sources

Ralston SH et al., J Bone Miner Res 2019;34:579-604; Singer FR et al., JCEM 2014;99:4408; Nairn C, Ralston SH, The Practitioner 2020; Paget's Association professional resources; prevalence studies (UK, NZ, Spain, Italy); OARSI 2019, NICE NG226, GLA:D; Osteoporosis Canada 2023; ESMO 2021; Butler & Moseley, Explain Pain.
