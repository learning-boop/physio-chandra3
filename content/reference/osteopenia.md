<!-- Source: "Osteopenia.docx" (Conditions/General conditions), v0.1 draft,
     4 Oct 2026, pending Chandra's sign-off. Evidence: Osteoporosis Canada
     2023 CPG (Morin et al., CMAJ 2023) and its exercise recommendations;
     Too Fit to Fracture (Giangregorio 2014, resources 2023); CaMos and NORA
     fracture data; World Falls Guidelines 2022; ISCD 2023 positions;
     label-effect studies. Clinician reference only.
     Code: src/data/osteopenia.js. -->

# Osteopenia (low bone density)

A DXA reading between -1 and -2.5, not a disease and not a cause of pain. Most fragility fractures happen in this band because so many people are in it, and the 2023 Canadian guideline manages by 10-year fracture risk, not the T-score band. The guide's job: movement-positive advice for everyone, and "ask your doctor for a full fracture-risk assessment" when the clinical factors call for it.

## On the site

- **Diagnosed context (open item 1, adopted):** "Osteopenia, or low bone density on a scan (not osteoporosis)" on the cautions list (`ca-osteopenia`), beside the existing "Osteoporosis, thinning bones, or long-term steroid medication" (`ca-bone`). The physio route always; booking is never held for it.
- **Optional risk questions** on "Before your results" when it is ticked (document Q2, Q3, Q6, Q4 + Q5): a fragility fracture since 40 (hip or spine / two or more others / one other / no), falls or unsteadiness in the past year, height loss or a rounded upper back, and one tick-all list of risk factors and secondary causes. Steroid tablets are taken from "A little about you" rather than asked again.
- **The clarifier** (`boneRisk`), never shown as a number: the document's scores (fracture 4/4/3, falls 3/2/1, risk factors 1 each up to 3, any secondary cause 2, height loss 3 or not sure 1). "Ask your doctor" is added at a total of 5 or more, or for a hip or spine fracture or two or more others (RECLASSIFY), height loss (VERTEBRAL), any secondary cause, or two or more falls at 65 and over.
- **Results panel "Low bone density: bones that respond to loading"** (also in the PDF): what the reading means (a measurement, does not hurt, about half of adults over 50), a prompt not a problem, the 2023 exercise advice (strength at least twice a week made a little harder every week or two, daily balance, brisk walking and stairs, gradual impact for those without a spine fracture and with good balance), hip-hinge technique and yoga/Pilates swaps ("specific movements are adjusted; activity is not avoided"), nutrition, then by answer: the FRAX line, "treated as osteoporosis whatever the scan number", the spine X-ray line, a falls check. Always: new back pain after a small load → doctor within a day or two; never stop denosumab without a plan; low bone density does not cause aches (bone blood test for deep aching, tender bones: the osteomalacia cross-link).
- **Fracture first, in every area:** rather than a separate safety question, the existing fragile-bone questions now say "osteoporosis or low bone density": the spine questions (group `osteo`, in the low back, TL junction, pelvis, tailbone, base of the neck and upper back), the hip's "sudden pain with no fall" question, the hip injury screen's minor-fall question (I4), and the "any fall" checks (`sc-trauma`, `grf-trauma`).
- **Chandra's summary:** an OSTEOPENIA block with every answer and whether the FRAX line was shown, and why. The answers (`bn…`) stay out of the anonymous copy and the AI overview; the privacy page says so.

## Decisions on the open items (the document's recommendations; awaiting sign-off)

1. Context entry with the physio route by default and the layered "ask your doctor" add-on: adopted, through the cautions list (the safety pages reach osteopenia through the widened fracture questions, so no question on "A little about you" was needed).
2. RECLASSIFY wording: "A past hip or spine fracture, or two or more fractures from small injuries, is treated as osteoporosis whatever the scan number: please tell your doctor about it."
3. One "bone health" entry: not merged. Osteopenia has its own entry and panel; `ca-bone` (osteoporosis) is unchanged and has no panel yet. Merging is easy later if the osteoporosis document gets the same treatment.
4. Impact loading: published, for those without a spine fracture and with good balance, "built up gradually"; no age cut-off.
5. "Make it a little harder every week or two": kept.
6. Canadian screening ages: not in patient copy (left to the doctor). The "worried but never scanned" entry point is not built.
7. Label effect: one sentence in the panel ("Holding back from activity because of the label is what makes bones and balance worse").
8. Risk lists: Q4 and Q5 merged into one tick-all of ten items. Eating-disorder history left out of the public list ("low body weight" covers the risk); BMI number not asked.

## Not built

- §6 red flags already on the site: back pain with leg numbness or bladder change (cauda equina questions), constant or night bone pain with weight loss (the general "fever, weight loss…" question), groin or wrist pain after a fall (hip and wrist injury screens and fracture questions), deep aching tender bones (the calcium and osteomalacia screen). Denosumab is a panel note.
- The scan-in-the-last-3-years and "not scanned but worried" sub-questions.

## Clinic notes (from the document)

- DXA: site, T- and Z-scores (Z below -2 in premenopausal women or younger men → secondary causes), machine and date, artefact (degenerative spine and aortic calcification raise L-spine; use valid L1-L4, total hip, femoral neck; 33% radius if hyperparathyroidism or obesity), TBS. Least significant change about 3-5%; re-scan every 2-3 years or as advised.
- Risk: FRAX with BMD (preferred) or CAROC; prior fragility fracture after 40 (hip or spine, or two or more others → osteoporosis per the 2023 CPG); glucocorticoids 7.5 mg or more for 3 months or more; parental hip fracture; smoking; alcohol 3 or more units a day; RA; secondary causes. Height loss 4 cm historical or 2 cm measured, wall-occiput over 5 cm, rib-pelvis under 2 fingers → VFA or lateral X-ray. Pharmacotherapy (the physician's): 10-year MOF 20% or more, hip 3% or more, prior hip or spine or two or more fragility fractures; shared decision at 15-19.9%.
- Falls (World Falls Guidelines 2022): gait speed, TUG, 30-second chair stand, 4-stage balance, orthostatic BP, vision, footwear, sedatives and antihypertensives, home hazards.
- Exercise (2023 CPG, Giangregorio): balance and functional training plus progressive resistance at least twice a week toward moderate-to-high intensity, plus aerobic activity; impact appropriate for most with osteopenia and no vertebral fracture, introduced gradually; spine-sparing technique; never prescribe rest.
- Nutrition: protein 1-1.2 g/kg, calcium about 1200 mg a day mostly from food, vitamin D 400-2000 IU (dosing to the GP).
- Name the label effect, use "low bone mass" and "bones respond to loading", set measurable strength and balance goals, document fracture-risk counselling. Fragility fracture → fracture liaison (Fraser Health) if available.

## Sources

Morin SN et al., CMAJ 2023;195:E1333-48 and the Osteoporosis Canada algorithm; Giangregorio LM et al., Osteoporos Int 2014 and Too Fit to Fracture resources 2023; CaMos (Menopause 2010); Siris ES et al., NORA, Arch Intern Med 2004; Montero-Odasso M et al., Age Ageing 2022; ISCD 2023 Official Positions; BHOF clinician's guide 2022; Reventlow 2006, Rothmann 2014 (label effects); Health Canada and Osteoporosis Canada calcium and vitamin D; Butler & Moseley, Explain Pain.

## Cross-check 6 Oct 2026 (approved by Chandra)
- Ask-your-doctor prompt now also for steroid tablets, two or more FRAX factors, or any fragility fracture since 40 (Osteoporosis Canada 2023; ACR 2022). "About 4 in 10" adults over 50 (Wright 2014, from memory).
- Medication lines replaced by: "Follow your doctor's plan for any bone medicine or supplements, and ask them before changing or stopping anything." Denosumab rebound and vitamin D dosing are clinic-note topics.
- Diagnosed osteoporosis (ca-bone, now worded without "thin") uses the same panel, with a "no impact or loaded bending after a spine fracture" line (Too Fit to Fracture).
- AIM p. 624 (high-intensity exercise no better than walking) is out of date (LIFTMOR; Osteoporosis Canada 2023 prefers progressive resistance).
