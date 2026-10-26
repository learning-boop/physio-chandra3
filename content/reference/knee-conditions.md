# Knee conditions document (15 forms)

Source: `Infographics/7 PhysioChandra/Conditions/Knee/PhysioChandra_Knee_Condition_Forms_ALL.docx`, 15 condition intake forms, each signed v1.0 by Chandra Sekhar Matla on 26 Oct 2026. Reviewed against the site, the AIM Theory Manual 2023 (Knee conditions), the OrthoDiv Lower Quadrant Clinical Manual (Jan 2023) Ch. 6 Knee and the CPG library the same day; Chandra approved applying every recommendation ("Apply all the knee recommendations as listed", 26 Oct 2026).

## Where each form went

| # | Form | On the site |
|---|---|---|
| 1 | Knee osteoarthritis | knee-oa (stiffness over an hour -2, creaking +2, locked-knee line); knee-pfoa (creaking +2) |
| 2 | Patellofemoral pain | knee-pfp (creaking +1; Decary and Table 6-9 notes) |
| 3 | Patellar tendinopathy | knee-pt (notes; deep frictions not offered) |
| 4 | ITB syndrome | knee-itb (the bony-bump and resisted-bending answers -1) |
| 5 | ACL | knee-acl (locked line same day; Sokal, KANON, AAOS 2022 notes) |
| 6 | PCL | knee-pcl (crash line) and the injury screen (I1 crash, I10) |
| 7 | MCL | knee-mcl (locked line same day) |
| 8 | LCL | knee-lcl (notes; foot drop is I9) |
| 9 | Meniscal tear | knee-meniscus (locked line same day; AAOS 2024 notes) |
| 10 | Patellar dislocation | knee-kneecap (notes); the injury screen already covers "still out" (I2) and "popped back" (I7) |
| 11 | Superior tibiofibular joint | NEW knee-stfj, from the new K1 and K2 answers |
| 12 | Loose body | NEW knee-loosebody, from the new K3 answer |
| 13 | Knee fracture | the injury screen: I4 now asks all five Ottawa items; I2 adds a wound over the bone |
| 14 | Cartilage injury, bone bruise | not yet diagnosed: I5 (quick swelling, same day), kf-locked; diagnosed: NEW knee-cartilage |
| 15 | Osteochondritis dissecans | not yet diagnosed: NEW kf-ocd (doctor within days); diagnosed: knee-cartilage |

## Safety changes

- kf-locked (same day, every age): a knee stuck right now that will not straighten even with help. Before, only the injury screen asked it (I6), and not same day; I6 is now same day too, and the card lines on ACL, MCL and meniscus say "the same day" instead of "soon".
- kf-ocd (doctor first, within days; ages 5 to 29): knee pain with swelling that keeps coming back after sport, with no injury. With kf-locked in a new group "Signs from inside the knee joint" (its own theme on drawings of several areas).
- Injury screen: I1 "a car or motorbike crash, or a fall from a height"; I10 after it, loose or wobbling in more than one direction (same day, possible multi-ligament injury); I2 adds "a wound over the bone" (emergency, open fracture); I4 adds the two Ottawa items that were left out (the kneecap, or the bony bump below the outer knee, very sore to press).

## New answers (no new questions)

- K1: "The bony bump just below the outer knee".
- K2: "Bending the knee against resistance, like hamstring curls".
- K3: "Stiff in the morning for more than an hour"; "The knee creaks or grinds when I bend it"; "Sudden sharp twinges that stop me mid-step, freed by shaking the knee"; "A doctor has found a cartilage injury, bone bruise or OCD on a scan". K3 now has 10 answers.

## Question order changed during the checks

- K1 (where it hurts) is asked first, as the hip's G1; K3 gets a small nudge (0.5), except for pain just below the kneecap; K5 (the tender bump) is asked early for 5 to 15; K6 (the hip) has strength 2. The four new K3 answers had made K3 crowd out the location, Osgood-Schlatter's bump and the hip on lines across the thigh, knee and shin.
- knee-osgood: "5 to 15" +1, its peak age.

## A bug fixed on the way: ages on drawings of several areas

When two or more areas were drawn, the age from "A little about you" was read as a shared band id: every age from 16 to 64 was lost before scoring, and the others moved up one band (5 to 15 scored as 16 to 29, 65 or over as 50 to 64). The shared bands also merged "Under 5" and "5 to 15", so a child mapped to "Under 5". src/data/assessmentFlow.js mapAge now keeps the area's own age id and treats "5 to 15" as 5 to 17 when the area also has "Under 5". All checks were rerun after the fix.

## Choices made against the forms (the site's rules win)

- A hot, red, swollen knee with fever stays an emergency (some forms say same day).
- A knee that cannot take weight after an injury stays same day (Ottawa, X-ray); emergency is kept for a deformed knee or a wound over the bone (the fracture form says emergency).
- No injection, medication or surgical outcome advice in patient text; the OA form's injections and arthroplasty lines are in clinic notes only.
- No "unstable" in patient text (patellar and LCL forms).
- Acupuncture stays out of patient text: Chandra does not offer it (confirmed 26 Oct 2026; OA form). Dry needling is not recommended for PFP by the JOSPT 2019 CPG, so it is not offered on that card.

## Checked against the manuals

Matched in the Lower Quadrant Clinical Manual Ch. 6: Sokal 2022 (Lachman 81/85, +LR 5.72; lever sign 83/93), the moving patellar apprehension test (Bank 2017, 100/88), joint line tenderness 76/77, Kopkow (PCL), the Renne and Noble tests, Master 2018 OA thresholds, Wilson's test, Decary 2017. The anterior drawer +LR prints as "24" in the OCR text (the form's 2.4).

## Still open for Chandra

1. The "How physiotherapy helps" texts on knee-stfj, knee-loosebody and knee-cartilage were approved by Chandra on 26 Oct 2026.
2. Sources the forms mark as unverified: the ESSKA 2024 first-time patellar dislocation consensus, the AAOS OCD CPG 2023 recommendations, the 2024 conservative ITB treatment review (Front Sports Act Living 2024;6:1386456), OARSI 2019 as cited.
