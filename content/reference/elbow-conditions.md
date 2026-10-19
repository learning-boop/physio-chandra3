# Elbow conditions document (28 forms)

Source: `Infographics/7 PhysioChandra/Conditions/Elbow/PhysioChandra Elbow Conditions ALL.docx`, 28 condition intake forms, each signed v1.0 by Chandra Sekhar Matla on 19 Oct 2026 (with "Elbow Conditions Master List.docx"). Reviewed against the site the same day; Chandra approved applying every recommendation ("Apply all the elbow recommendations as listed", 19 Oct 2026).

## Where each form went

| # | Form | On the site |
|---|---|---|
| 1 | Lateral elbow tendinopathy | elbow-tennis |
| 2 | Medial elbow tendinopathy | elbow-golfer |
| 3 | Distal biceps tendinopathy / tear | elbow-biceps (a tear stays same day, injury screen I5) |
| 4 | Triceps tendinopathy | NEW elbow-triceps (split from the back-of-elbow card) |
| 5 | Snapping triceps / ulnar nerve | clinic notes of elbow-cubital and elbow-triceps (no answer separates it) |
| 6 | Elbow muscle strain | arm-strain, elbow-biceps (brachialis), forearm-overuse (pronator teres) |
| 7 | Myositis ossificans | a warning line on elbow-contusion; clinic notes of elbow-joint and elbow-fracture |
| 8 | Elbow contusion | NEW elbow-contusion ("Bruised elbow after a knock or fall") |
| 9 | Muscle imbalance | clinic notes of elbow-tennis, elbow-golfer, forearm-overuse (a treatment target) |
| 10 | Medial (ulnar) collateral ligament | elbow-ucl |
| 11 | Lateral collateral ligament | NEW elbow-lcl ("Outer elbow ligament sprain") |
| 12 | Posterolateral rotatory instability | clinic notes of elbow-lcl and elbow-fracture (6 Oct cross-check N2) |
| 13 | Dislocation | elbow-fracture ("Recovering after a broken or dislocated elbow") |
| 14 | Abducted ulna lesion | clinic notes of elbow-joint (a clinic finding) |
| 15 | PRUJ / radial head positional fault | clinic notes of elbow-tennis |
| 16 | Capsular pattern (OA, post-immobilisation) | elbow-joint; elbow-fracture clinic notes |
| 17 | Non-capsular pattern (adhesions) | clinic notes of elbow-joint and elbow-fracture |
| 18 | Loose bodies | elbow-joint |
| 19 | Radiocapitellar injury / OCD | under 16 erf-child (doctor first); adults: elbow-joint clinic notes |
| 20 | Fracture rehabilitation | elbow-fracture |
| 21 | Olecranon bursitis | elbow-posterior (now bursitis only) |
| 22 | Cubital tunnel | elbow-cubital |
| 23 | Radial tunnel | elbow-radialtunnel and forearm-radialtunnel (identical patient text) |
| 24 | PIN syndrome | doctor first (erf-nerve, frf-nerve now with finger drop); radial tunnel clinic notes |
| 25 | Pronator syndrome | forearm-pronator |
| 26 | AIN syndrome | doctor first (erf-nerve now asks the OK sign); pronator clinic notes |
| 27 | Neural mechanosensitivity | neck-neural (already the card) |
| 28 | Cervical / radicular referred pain | neck-radic and the "may be coming from your neck" card; tennis clinic note |

## Safety changes

- erf-cardiac (911): the elbow had no heart question; worded as the upper arm's (group "cardiac"), so it is asked once.
- erf-nerve asks the OK sign; frf-nerve asks finger drop. Both doctor first (physioPlan NERVE_WEAKNESS).
- Injury screen I5: front or back of the elbow, a pull or a push (torn triceps, same day).
- I9: "Yes, and it was put back and X-rayed at hospital" with no route.
- Card lines: a locked elbow or no palm turning, same day; never fully straight since a fall and never X-rayed, doctor first for an X-ray; bursitis with a fever or feeling very unwell, emergency department (the knee's bursitis card says the same); a pop with a changed muscle shape on the upper-arm strain card, same day.

## Choices made against the forms (the site's rules win)

- No medication or injection advice in patient text; no "unstable" or "instability"; no surgical outcome promises ("usually effective", "good surgical options").
- Stricter site tiers kept: a hot joint with fever is emergency; a tendon tear is same day; nerve weakness is doctor first, not "prompt physiotherapy".
- Cubital tunnel: nerve glides stay optional (Svernlöv 2009).
- Tennis elbow keeps the card's outlook figures (Ikonen 2022), not the form's "one in three beyond a year".
- Doctor lines: radial tunnel and pronator at 4 to 6 weeks; cubital at any time for constant numbness or weakness, otherwise after about 3 months.

## Weights changed during the checks

- Onset answers at 1 (tennis gripping, UCL throwing): at 2 one opening answer made a card a question-picking leader.
- E3 priority 2 with tingling and E4 priority 2 (region test "Ulnar nerve at the elbow"); cubital, radial tunnel and pronator from age 5.
- Forearm radial tunnel: turning the palm 2 to 3 (the form's own score).
- Question picking (symptomGuide.js questionValue): a card with an `onset:` gate does not count while the start is unknown. The real flow always asks the start first; in the accuracy check's simulated forearm patient the elbow's fall-only cards pulled elbow questions ahead of the forearm's.

## Still open for Chandra

1. Drafts awaiting review: "How physiotherapy helps" on elbow-triceps, elbow-lcl, elbow-contusion, and the changed elbow-posterior (bursitis only).
2. Not applied: widening erf-child to a child who no longer fully straightens (Panner's, under 10); a cervical-screen line in patient text for tennis elbow (check against the JOSPT 2022 CPG first); asking the neck question (E6) for elbow pain over 6 weeks; neurodynamics.js reading the elbow and forearm nerve answers for the clinician summary; radial head and medial epicondyle tenderness from the East Riding rule in the injury screen; a growing lump with no cancer history (merged into the general question on 28 Sep).
