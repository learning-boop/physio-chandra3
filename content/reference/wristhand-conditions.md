# Wrist and hand conditions document (37 forms)

Source: `Infographics/7 PhysioChandra/Conditions/Wrist and hand/PhysioChandra WristHand Conditions.docx`, 37 condition intake forms, each signed v1.0 by Chandra Sekhar Matla (19-20 Oct 2026), with "Wrist Hand Conditions Master List.docx". Reviewed against the site on 20 Oct 2026; Chandra approved applying every recommendation ("Apply all the wrist and hand recommendations as listed", 20 Oct 2026). The document's own numbering is used below (35 nerve injury, 36 oedema and scar, 37 ganglion).

## Where each form went

| # | Form | On the site |
|---|---|---|
| 1 | De Quervain's | wrist-dq |
| 2 | Intersection syndrome | forearm-intersection |
| 3 | Wrist overuse tendinopathy (ECU, FCU, FCR, extensors) | wrist-ecu (ECU, FCU in notes); FCR in dq notes; extensors in dorsal notes |
| 4 | Acute forearm muscle strain | forearm-overuse (notes and lines) |
| 5 | Muscle imbalance / motor control | notes of wrist-fracture and forearm-overuse (treatment target) |
| 6 | Capsular pattern / wrist OA / post-immobilisation | wrist-fracture notes; no wrist OA card |
| 7 | Non-capsular pattern | notes of wrist-fracture and wrist-dorsal (clinic finding) |
| 8 | Distal radius fracture rehab | wrist-fracture |
| 9 | Scaphoid fracture | injury screen I5 and wrf-oldscaphoid (now also "the X-ray was normal"); wrist-fracture notes |
| 10 | Kienböck's | wrist-dorsal |
| 11 | Volkmann's contracture | wrist-fracture (a doctor line and notes); the compartment flags are the acute route |
| 12 | Carpal fixation | notes of wrist-dorsal and wrist-tfcc (clinic finding) |
| 13 | Wrist ligament sprain | NEW wrist-sprain |
| 14 | Carpal instability (SL, LT, midcarpal) | wrist-dorsal (with the new W10), LT in wrist-tfcc notes |
| 15 | TFCC / DRUJ / ulnocarpal impaction | wrist-tfcc |
| 16 | Carpal tunnel | wrist-median and hand-median (identical) |
| 17 | Guyon's canal | wrist-guyon (new W4 answer) |
| 18 | Wartenberg's | forearm-wartenberg |
| 19 | Neural mechanosensitivity | neck-neural notes; a double-crush line on the CTS and Guyon cards |
| 20 | CRPS | wrist-crps and hand-crps (start gates fixed) |
| 21 | Skier's thumb | hand-fingerinjury and HAND_INJURY I6 (`_wrist-skiersthumb.md` stays retired) |
| 22 | Thumb CMC OA | wrist-thumboa and hand-thumboa (identical) |
| 23 | Finger collateral sprain / dislocation | hand-fingerinjury |
| 24 | Volar plate | hand-fingerinjury |
| 25 | Metacarpal and phalangeal fractures | NEW hand-fracture |
| 26 | Hand OA | hand-handoa |
| 27 | Rheumatoid hand | no card; handoa notes; the "already diagnosed" escape on hnd-inflam and wrf-inflam |
| 28 | Mallet finger | hand-fingerinjury (new H2 tick) |
| 29 | Boutonnière | hand-fingerinjury (new H2 tick) |
| 30 | Swan neck | hand-fingerinjury notes |
| 31 | Flexor tendon repair | hand-fracture |
| 32 | Extensor tendon repair | hand-fracture; the EPL line on wrist-fracture |
| 33 | Dupuytren's | hand-dupuytren (small additions) |
| 34 | Intrinsic tightness / claw hand | no card: claw hand is doctor first; notes on the aftercare cards |
| 35 | Peripheral nerve injury | no card: doctor first; hand-fracture and wrist-fracture notes |
| 36 | Oedema and scar | hand-fracture, wrist-fracture (lines and notes) |
| 37 | Ganglion and other lumps | wrist-ganglion; wrf-lump; seed cyst in hand-trigger notes |

## Bugs fixed
- wrist-crps had `onset: fall, twist`, so CRPS could never show after "After a broken wrist, in a cast or after surgery", the commonest trigger. Now `fall, twist, surgery`; hand-crps gained the new hand surgery start.
- wrf-oldscaphoid asked only "never X-rayed"; the classic missed scaphoid (first X-ray normal) answered No.

## Safety changes
- Cellulitis / red streak: wrf-cellulitis and hnd-cellulitis (same day, the forearm's wording, asked once).
- Wrist injury screen: a cut answer and a cut-numbness/movement question (emergency).
- Hand injury screen: a cold, pale or blue hand (emergency, the wrist's wording); swelling, bone pain, a sunk knuckle or no full fist (same-day X-ray), with a "punched something hard" answer; I6 also after a jammed finger.
- "Already treated" answers so splinted or repaired patients are not sent back (hand I3, I4, I5, I7, I11; wrist I7 "already X-rayed and treated"; never on the scaphoid question I5).
- Wrist lumps: wrf-lump asks painful, deep or large lumps; the general new-lump tick is skipped at the wrist, as at the hand.
- Wrist cold finger is same day (wrf-coldfinger, the hand's wording).
- hnd-inflam and wrf-inflam: "Not explained by an inflammatory arthritis you have already been diagnosed with".
- nerveDoctor card: "Physiotherapy can help once a doctor has checked it" (it said "alongside", against the doctor-first rule).
- A finger that suddenly will not bend or straighten without an injury: a doctor line on hand-handoa (more common with RA).

## Choices made
- The wrist sprain card's "not improving" line is 2 to 3 weeks, matching the back-of-wrist card (missed fractures and ligament tears).
- Thumb OA keeps the site's exercise rule ("back to usual by the next morning") and does not quote the grind test LR+.
- The skier's thumb "about 3 weeks" surgery window is not used.
- Imaging goes through the doctor (the forms say the physiotherapist arranges it).
- No wrist arthritis card (no answer carries stiffness or grinding).
- No medication or injection advice in patient text; no "unstable", "instability" or "wear"; no outcome promises; stricter site tiers kept.

## Weights changed during the checks
- wrist-median: the reviewer's +1 for weak grip was not kept (it lifted the ceiling and the minimal carpal tunnel case fell under 40%).
- The from-5 age gates proposed for wrist-dq, wrist-ecu, wrist-dorsal and forearm-intersection were not kept: with them, the accuracy check's under-5 patient lost those cards and the hand's questions crowded out the wrist's. Under-5 booking is blocked site-wide. The new cards (wrist-sprain, hand-fracture) keep their age gates.

## Still open for Chandra
1. Drafts awaiting review: "How physiotherapy helps" on wrist-sprain and hand-fracture.
2. Re-review of the changed patient text on cards already signed (forearm-intersection, forearm-wartenberg, forearm-overuse, 4 Oct 2026).
3. Not applied: a wrist "what do you notice" question (stiff, blocked, grinding) and a wrist arthritis card; a thumb-knuckle location answer and a standalone skier's thumb card; a hand nerve-repair card; a scar tick; a sudden tendon rupture red flag (a card line instead); a whole-arm swelling (clot) question for the wrist and hand; the H6/H7 "see a doctor" answers for someone already diagnosed with RA (only the red flags got the escape).
