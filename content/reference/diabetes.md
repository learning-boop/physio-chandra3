<!-- Source: "DiabetesMellitus.docx" (condition intake) and "PhysioChandra
     Diabetes RiskModule.docx" (Conditions/General conditions), reviewed and
     signed by Chandra Matla, 3 Oct 2026 (confirmed in the session; the
     saved Word files did not yet show the signature), accepting the build
     and the decisions below. (An earlier
     "Diabetes Mellitus.docx", 09:03 the same day, sits beside them; the
     09:49 "DiabetesMellitus.docx" is the version fed.) Evidence: ADA
     Standards of Care 2026 §2 and §12; IDF type 5 (April 2025); Diabetes
     Canada CPG Ch.4, 10, 14 (2023), 31, 32; Diabetes Care 2025 upper-limb
     review; Zreik 2016 and Int Orthop 2026 meta-analyses; IWGDF 2023.
     Clinician reference only. Code: src/data/diabetes.js. -->

# Diabetes: context, red flags, details and the results panel

Diabetes is not a region condition, and the guide never diagnoses it or shows a risk score. It enters in four ways.

## On the site

1. **The context question** (intake §4 overlay, open item 1: adopted). On "A little about you", after age and birth sex: "Has a doctor told you that you have diabetes or high blood sugar?" (Yes, diabetes / Borderline diabetes (prediabetes), or diabetes only during a past pregnancy (gestational diabetes) / No / Not sure). Required to continue. Stored as `answers.dm`.
2. **Red flags first** (intake §6, module §6). With diabetes, `DM_RED_FLAGS` go to the front of the safety pages, minus any the page already asks:
   - 911: ketoacidosis (vomiting or stomach pain with deep fast breathing, fruity breath, extreme thirst, drowsiness or confusion); "silent" heart symptoms with exertion (skipped where the area already asks its own heart question).
   - Emergency department: a black, dusky or cold toe, or a spreading foot infection (skipped where the foot asks ft-diabeticinfection).
   - Doctor today: one red, warm, swollen foot, or a foot wound not healing or not felt (group `charcot`, skipped where the ankle or foot asks it); sudden severe pain with firm swelling in one thigh or calf, no injury (clot or muscle infarction; thigh, knee or leg drawings).
   - Doctor in a few days, no booking: severe one-sided hip, buttock or thigh pain over days, then a weakening leg, with unexplained weight loss (amyotrophy; hip, thigh, low back, pelvis or knee drawings).
3. **Numb or burning feet on both sides** (intake §4 route rules). Without known diabetes, the glove-and-stocking question (`pc-polyneuropathy`) and the leg, ankle and foot neuropathy flags are now doctor-first with **no booking** until a doctor has seen them: "a simple blood test sorts this out", this week, mentioning thirst, urination, weight loss or blurred vision (`NERVE_WHY`). With known diabetes they are left out and the results panel takes over (feet wording, daily foot checks, tell the diabetes team).
4. **The details** (module §3), on "Before your results", one panel, every question optional. Asked when diabetes or prediabetes is known AND either a condition below qualifies (counted among the top four, so one the lift could bring in counts) or both feet burn or tingle. Type; how long; sugars at the last check-up; treatment (insulin or a sulfonylurea → HYPO); complications (eyes, kidneys, nerves, foot ulcer/Charcot/amputation, heart). Feet drawings add the touch-and-balance question (D7) unless complications already said nerves or foot. Prediabetes asks complications only.
5. **Burden tier** (module §4; internal, never shown). Points: type 1 or other 1; 5-10 years 1, over 10 years 2, over 20 years 3; a bit above target 1, well above or no check in a year 2, not sure 1; insulin/sulfonylurea 1; each complication 1 (foot ulcer/Charcot/amputation 2); reduced feeling or unsteady 1. Low 0-1, moderate 2-3, high 4 or more, or over 20 years, or a foot ulcer/Charcot/amputation. Prediabetes is always low. Skipped questions count 0.
6. **The lift** (module §2). Points added to the ORDER only (`rankAcross(…, bonus)`); a condition still has to meet the 40% rule on its own, and the two-hypothesis limit is unchanged.

   | Condition | Low / moderate / high | Both sides drawn | Panel | Blood-test line without diabetes |
   |---|---|---|---|---|
   | Frozen shoulder | +1 / +2 / +3 | +1 | shoulder | yes, when it leads, age 30-64 |
   | Rotator cuff, calcific tendinopathy | 0 / +1 / +1 | | shoulder | |
   | Trigger finger | +1 / +2 / +2 | +1 (hands) | hand | both hands drawn |
   | Carpal tunnel (wrist, hand) | +1 / +2 / +2 | +1 (hands/wrists) | hand | both hands or wrists drawn |
   | Dupuytren's | +1 / +1 / +2 | | hand | |
   | Achilles (mid and insertional), plantar heel | 0 / +1 / +1 | | feet | |
   | Gluteal tendinopathy; mid-back and TL stiffness (DISH); knee OA; hand and thumb-base OA | 0 / +1 / +1 | | general | |

7. **The results panel** ("Your diabetes and this problem", also in the PDF): the variant for the first diabetes-linked condition shown (shoulder, hand, feet, general), then the tier's prognosis line; at moderate or high, "mention this to your family doctor or diabetes team"; the steroid-injection line when the shoulder leads; notes for HYPO, FOOT, EYE, KIDNEY, CARDIAC. Diabetes with nothing linked: a short "Diabetes and staying active" note (feet daily, low-sugar line). Prediabetes: the "future risk" line only. Without known diabetes: "Worth asking your doctor about" (an HbA1c; Diabetes Canada suggests a check every three years from 40) for the first-sign patterns in the table; never "you may have diabetes", never blocks booking.
8. **Chandra's summary**: a DIABETES section with every answer, the tier, flags and which conditions were lifted. Diabetes answers are left out of the anonymous copy and are not sent to the AI overview.

## Decisions made while building (accepted with the sign-off, 3 Oct 2026)

- **Open item 1 (global question):** adopted, on "A little about you", required.
- **Open item 2 (name diabetes when undiagnosed):** the nerve screen names "blood-sugar problems and other treatable causes" once, as the document drafts.
- **Open item 3 / module 2 (scores, modifiers, tier cut-points):** as drafted. Implemented as a rank lift rather than the intake form's scored 16-point nerve screen: the guide's existing questions (drawing both feet, burning or tingling) already carry that screen, so no new scored questions were added.
- **Open item 5 (hypoglycaemia):** kept as a results note (HYPO flag), not as a red-flag tick box: someone who is shaky, sweaty and confused right now is not filling in a pain questionnaire, and "take fast sugar, then 911 if not better in 15 minutes" does not fit the 911 screen. Please confirm.
- **Open item 6 (types table):** kept internal (below).
- **Open item 7 / module item 5 (steroid line):** kept.
- **Module item 1 (trigger):** the branch fires when a linked condition qualifies at all (the "possible" end), not only when it leads.
- **Module item 3 ("one in three"):** left out; the line stays qualitative, because the figure is specific to frozen shoulder and the line is shared with the hand patterns.
- **Module item 4 (CANRISK chips):** not built; no link out yet.
- **Module item 7 (D4 control question):** kept.
- **Module item 8 (limited joint mobility):** not a named card; folded into the hand panel ("stiff, waxy fingers"). The "ask when your eyes and kidneys were last checked" line was therefore not built.
- **Atraumatic frozen shoulder at 40-65:** the site's age bands are 30-49 and 50-64, so the blood-test line uses 30-64.

## Not built

- The intake form's own 6-question scored nerve screen and its thresholds (see above).
- Gout, fragility-fracture and "slow healing / repeated infection" modifiers (no matching condition cards; the hot-joint and fall questions already route them).
- DISH fall caution as a separate red flag: the universal fall question (any fall at 65+ or with osteoporosis) and the general panel's line cover it. Ascending numbness with bladder change, drop foot or wrist drop over hours, and the drooping eyelid are already asked by the cauda equina, neurological and nerve-and-muscle screens.
- Local diabetes foot clinic (open item 4 / module item 6): the panel says "a foot-care specialist" until Chandra names the Fraser Health pathway.

## Clinic notes (from the documents)

- History: type, duration, HbA1c trend, medicines (insulin or sulfonylurea → hypo risk; SGLT2 inhibitor → dehydration and euglycaemic DKA; GLP-1 agonist → rapid weight and muscle change), retinopathy, nephropathy, CVD, previous ulcer, amputation or Charcot, smoking.
- Feet: skin, nails, deformity, footwear; 10 g monofilament (Diabetes Canada App. 11A sites) and 128 Hz vibration at the hallux; pinprick, ankle reflexes, MNSI; DN4 or painDETECT for painful neuropathy; pulses, capillary refill, temperature. A dermal temperature difference over 2 °C is Charcot until proven otherwise: off-load, same-day referral, no exercise. IWGDF 2023 risk category → foot-care referral for loss of protective sensation, PAD, deformity or previous ulcer. TUG, single-leg stance, Berg.
- Upper limb: prayer sign and table-top test (LJM); passive ER loss and global capsular pattern (check the other shoulder); A1 pulley nodules on every finger; Phalen, Tinel, CTS-6 both hands; Dupuytren cords; CMC-1 OA. Frozen shoulder is more often bilateral, stiffer and slower with diabetes.
- Amyotrophy: asymmetric proximal pain → quadriceps, hip flexor and adductor weakness, absent knee jerk, weight loss → GP or neurology (EMG). Recovery over 6-24 months.
- Exercise safety: glucose before and after the first sessions on insulin or a sulfonylurea (treat below 4.0 mmol/L, Diabetes Canada Ch.14 2023); carry fast carbohydrate; avoid injecting into limbs about to exercise; medical clearance before anything much more vigorous than brisk walking with CVD or microvascular complications (Ch.10); proliferative retinopathy → no Valsalva or high impact; nephropathy → moderate intensity, hydration; autonomic neuropathy → use RPE, orthostatic caution. Weight-bearing exercise is safe with neuropathy when the feet are intact and inspected.
- Treatment: aerobic + resistance + balance, 30-60 minutes three times a week for at least 8 weeks, improves neuropathic symptoms, nerve conduction, balance and HbA1c without more ulcers (2024-2025 umbrella review). Steroid injections raise glucose for days.

## Diabetes types (Appendix A; internal)

The manual's "types I-V" (about 2018) do not match current naming. ADA 2026: type 1 (including LADA), type 2, gestational, and other specific types (type 3c pancreatogenic, monogenic/MODY, drug-induced). IDF added type 5 (malnutrition-related: lean young adults with childhood undernutrition, insulin-deficient without autoimmunity) in April 2025. "Type 3" (Alzheimer's) and "type 4" (age-related insulin resistance) are informal research labels: never in patient copy.

- Type 1: highest rates of LJM and frozen shoulder with long duration; hypo risk with exercise; neuropathy screen from 5 years.
- Type 2: most of the site's diabetes traffic; may present first as numb feet, trigger finger, frozen shoulder or a slow wound; OA, tendinopathy, DISH, gout and PAD more common.
- Gestational: pelvic girdle and back pain dominate; CTS common in pregnancy; later type 2 risk (the "prediabetes" answer).
- Type 3c and others: steroid-induced rises matter for injections; malabsorption → bone health.
- Type 5: low muscle mass is central; strength training with dietitian input; same foot vigilance.

## Review notes on the documents

- The intake form's threshold (9 of 16) and the module's tiers were never tested against the scenario suite; the checks in scripts/check-patterns.mjs (section 33) now cover the tier, the lift and the routes.
- Intake §4 Q4 gives "close family history" 1 point, but the module's D1 has no such answer; the site follows the module (family history is part of the optional CANRISK chips, not built).
- Module §2 says prediabetes asks "D6 only", but D6 lists diabetes complications; kept as written, since neuropathy occurs in prediabetes, but the wording "Has diabetes affected…" reads oddly for prediabetes.
- Intake §6 says the hot-foot and wound items should show "in every region"; the site does so when diabetes is known, which adds three foot questions to, for example, a shoulder screen. Chandra may prefer them only for drawings below the knee.

## Sources

ADA Standards of Care in Diabetes 2026 §2, §12; Diabetes Canada CPG 2018 Ch.4, 10, 14 (2023 update), 31, 32 and App. 11A/11B; IDF type 5 (2025) and Lancet Diabetes Endocrinol 2025; Upper-limb complications in diabetes, Diabetes Care 2025;48(11):1865; Zreik NH et al., MLTJ 2016; Int Orthop 2026 diabetic shoulder meta-analysis; Yian 2012; Juel (Dialong) 2017; J Pharm Bioallied Sci 2024; IWGDF 2023; EMJ 2020 (amyotrophy); exercise in DPN umbrella review 2024/2025; Butler & Moseley, Explain Pain.

## Cross-check 6 Oct 2026 (approved by Chandra)
- Added: 911 for the hyperosmolar state (dm-hhs); the low-sugar line with what to do with a low reading and when to call 911, also for "not sure" treatment; the tablets answer now reads "Tablets that do not cause low sugars (such as metformin)".
- The pre-exercise number: the site says do not start under 4.0 and use the team's own starting number; the 5.5 mmol/L figure was not verified (Diabetes Canada Ch.10 not readable), so it is not used. Type 1: glucose over about 14 to 15 with ketones 1.5 or more, no exercise (Riddell 2017; figures not verified).
- Heart: with known diabetes the generic heart question is left out; at rest or lasting is 911 (dm-cardiac), new exertional symptoms that settle with rest are doctor today (dm-exertion).
- Feet: no barefoot walking, socks only or thin slippers, indoors or outdoors (IWGDF 2023). Kidneys: "unless your kidney team has asked you to limit fluids".
- Chandra's diabetes education protocol differs: swimming with a foot ulcer (ADA and IWGDF advise against), paraffin wax with numb hands (burn risk), no numeric glucose thresholds, consumer sources.
