# Review: splitting the emergency tier into 911 and Emergency

Proposed by Claude, 2026-10-02. **Approved by Chandra 2026-10-02 as written, with option (b) for sij.md:21. Implemented:** `call911` on the flags (`src/data/symptomGuide*.js`, `patternChecks.js`, `injuryScreen.js`), the screens and wording in `src/data/emergencyAdvice.js`, and the tier `911` in the region files.

There are 92 `emergency` flags in the 21 region files. The other 4 hits from the earlier count are in `_TEMPLATE-region.md` and `_EXAMPLE-lowback.md`.

## The rule used

- **911 (call an ambulance).** It could be life-threatening within minutes to hours, the person could collapse on the way, or it isn't safe for them to move or be driven. The screen says: "Call 911 now. Do not drive yourself."
- **Emergency (go to emergency now).** It needs a hospital today, often within hours, but the person is stable enough to get there. The screen says: "Go to your nearest emergency department now. Have someone drive you; do not drive yourself. Call 911 if you cannot get there safely, or if it gets worse quickly."

When a flag could go either way, I put it under 911 if the condition can kill (heart, lung clot, stroke, bleeding, meningitis, aorta). Conditions that threaten a limb or an organ but not life went under Emergency.

Totals: **42 → 911**, **45 → Emergency**, **4 → split the question**, **1 → your call**.

---

## A. 911 (42)

| File:line | Flag (short) | Why 911 |
|---|---|---|
| ankle.md:16 | Swollen calf plus breathless, chest pain or coughing blood | Lung clot |
| arm.md:18 | Arm pain on effort or with chest tightness, breathless, sweating | Heart |
| arm.md:19 | Whole arm swollen or blue plus breathless or chest pain | Lung clot |
| arm.md:20 | Face droop, one-sided weakness, trouble speaking | Stroke |
| ctj.md:28 | After an accident: worsening dizziness, double vision, slurred speech and similar (5 Ds and 3 Ns) | Artery or brain |
| ctj.md:30 | Tearing pain between the shoulder blades | Aortic dissection |
| ctj.md:31 | Pain with chest tightness or breathlessness, or on effort | Heart |
| ctj.md:32 | Sudden sharp pain on breathing plus breathless | Lung clot or collapsed lung |
| forearm.md:20 | Inner-arm pain on effort or with chest symptoms | Heart |
| forearm.md:21 | Face droop, one-sided weakness, speech | Stroke |
| hand.md:21 | Face droop, one-sided weakness, speech | Stroke |
| head.md:37 | After an accident: worsening dizziness and the 5 Ds and 3 Ns | Artery or brain |
| head.md:39 | Thunderclap headache | Brain bleed |
| head.md:40 | Headache plus one-sided weakness, speech or vision loss | Stroke |
| head.md:41 | Fever plus stiff neck, rash, drowsy or confused | Meningitis |
| head.md:42 | After a head blow: vomiting, drowsy, worsening headache | Bleed after head injury |
| head.md:52 | After manipulation, a jerk or a knock: severe new pain or fast-changing symptoms | Artery tear (see note 3) |
| hip.md:15 | Sudden severe pain plus pulsing tummy, faint | Leaking aortic aneurysm |
| hip.md:17 | Possibly pregnant, one-sided pain, bleeding, faint | Ectopic rupture |
| jaw.md:18 | Jaw pain on effort or with chest symptoms | Heart |
| jaw.md:19 | Sudden face droop or weakness | Can't tell stroke from Bell's palsy online |
| knee.md:16 | Swollen calf or thigh plus breathless, chest pain, blood | Lung clot |
| leg.md:15 | Swollen calf plus breathless, chest pain, blood | Lung clot |
| lowback.md:20 | Sudden severe pain plus pulsing tummy, faint | Leaking aortic aneurysm |
| neck.md:76 | Sudden worst headache, face droop, one-sided weakness, speech or vision loss and similar | Stroke, bleed or artery tear |
| neck.md:78 | After manipulation or an accident: severe new pain or worsening neuro signs | Artery tear or cord or brain injury |
| neck.md:79 | Fever plus stiff neck, rash, very unwell, light hurts the eyes | Meningitis (see note 4) |
| neck.md:80 | Neck, jaw or arm pain on effort or with chest symptoms | Heart |
| neck.md:81 | Left shoulder-tip pain after a tummy blow, or faint | Spleen bleed |
| neck.md:282 | Dizziness plus fainting, chest pain, racing heart, breathless | Heart |
| shoulder.md:18 | Shoulder, jaw or left arm pain on effort or with chest symptoms | Heart |
| shoulder.md:19 | Left shoulder-tip pain after a tummy blow, or faint | Spleen bleed |
| shoulder.md:20 | Possibly pregnant plus low tummy pain plus shoulder-tip pain | Ectopic rupture (blood under the diaphragm) |
| shoulder.md:21 | Sudden sharp pain on breathing plus breathless | Lung clot or collapsed lung |
| sij.md:20 | After a fall, can't stand or bear weight | Can't get to a car safely; hip or pelvic fracture |
| thigh.md:15 | Swollen thigh or calf plus breathless, chest pain, blood | Lung clot |
| tlj.md:20 | Sudden severe pain plus pulsing tummy, faint | Leaking aortic aneurysm |
| tlj.md:21 | Tearing back pain into the chest or tummy | Aortic dissection |
| upperback.md:18 | Tearing mid-back pain | Aortic dissection |
| upperback.md:19 | Pain with chest tightness or breathlessness, or on effort | Heart |
| upperback.md:20 | Sudden sharp pain on breathing plus breathless | Lung clot or collapsed lung |
| wrist.md:20 | Face droop, one-sided weakness, speech | Stroke |

## B. Emergency: go now, get a ride (45)

| File:line | Flag (short) | Condition |
|---|---|---|
| ankle.md:15 | Hot, red, swollen, fever | Septic arthritis |
| ankle.md:17 | Foot suddenly cold, pale, numb | Blocked artery (note 1) |
| ankle.md:18 | Fast-spreading hot red area, pain out of proportion | Necrotising infection (note 2) |
| arm.md:21 | Hugely swollen after exercise plus cola-coloured urine | Rhabdomyolysis |
| coccyx.md:18 | Saddle numbness | Cauda equina |
| coccyx.md:19 | Bladder or bowel changes | Cauda equina |
| ctj.md:34 | Recent crash or fall | Possible fracture (still routes through the neck injury screen) |
| elbow.md:18 | Hot, red, swollen, fever | Septic arthritis |
| foot.md:15 | Toes suddenly cold, pale, blue | Blocked artery (note 1) |
| foot.md:16 | Fast-spreading hot red area | Necrotising infection (note 2) |
| foot.md:17 | Diabetic foot wound with spreading redness or fever | Diabetic foot infection |
| forearm.md:18 | Tight, swollen, worse on finger stretch, under a cast | Compartment syndrome |
| forearm.md:19 | Fast-spreading hot red area | Necrotising infection (note 2) |
| hand.md:18 | Bite, cut or puncture, now swollen and painful to straighten | Flexor sheath infection |
| hand.md:19 | High-pressure injection | Injection injury |
| hand.md:20 | Hot, red, swollen finger, fever | Septic arthritis |
| head.md:43 | Painful red eye, blurred vision, halos | Acute glaucoma (ED or an emergency eye clinic) |
| hip.md:16 | Fever, can't bear weight, or a feverish child refusing to walk | Septic hip |
| hip.md:18 | Sudden severe testicle pain | Testicular torsion (time-critical but stable) |
| hip.md:19 | Hard, painful groin lump that won't go back in, plus vomiting | Strangulated hernia |
| hip.md:20 | Saddle numbness or bladder or bowel changes | Cauda equina |
| jaw.md:17 | Jaw stuck open | Dislocation |
| knee.md:15 | Hot, red, swollen, fever | Septic arthritis |
| knee.md:17 | Saddle numbness or bladder or bowel changes | Cauda equina |
| leg.md:16 | Tight, swollen, worse on toe stretch | Compartment syndrome |
| leg.md:17 | Foot or leg suddenly cold, pale, numb | Blocked artery (note 1) |
| leg.md:18 | Fast-spreading hot red area | Necrotising infection (note 2) |
| leg.md:19 | Saddle numbness or bladder or bowel changes | Cauda equina |
| lowback.md:17 | Saddle numbness | Cauda equina |
| lowback.md:18 | Bladder or bowel changes | Cauda equina |
| lowback.md:19 | Pain spreading to both legs or quickly worsening weakness | Cauda equina or severe compression |
| lowback.md:21 | Recent crash, fall or hard landing | Spinal fracture |
| shoulder.md:22 | Hot, red, swollen, fever | Septic arthritis |
| sij.md:19 | Saddle numbness or bladder or bowel changes | Cauda equina |
| thigh.md:16 | Tense, swollen thigh after a crush | Compartment syndrome |
| thigh.md:17 | Hugely swollen plus cola-coloured urine | Rhabdomyolysis |
| thigh.md:18 | Fast-spreading hot red area | Necrotising infection (note 2) |
| thigh.md:19 | Saddle numbness or bladder or bowel changes | Cauda equina |
| tlj.md:23 | Recent crash, fall or hard landing | Spinal fracture |
| tlj.md:24 | Severe upper-tummy pain through to the back, plus vomiting | Pancreatitis or perforated ulcer |
| tlj.md:25 | Sudden severe testicle pain | Testicular torsion |
| upperback.md:21 | Severe upper-tummy pain through to the back, plus vomiting | Pancreatitis or perforated ulcer |
| upperback.md:23 | Recent crash, fall or hard blow | Spinal fracture |
| wrist.md:18 | Hot, red, swollen, fever | Septic arthritis |
| wrist.md:19 | Bite, cut or puncture, now swollen and painful to move the fingers | Deep hand infection |

## C. Split the question in two (4)

Each of these questions mixes a slower picture (bladder, bowel or saddle changes: **Emergency**) with a sudden one (sudden weakness or numbness in both legs, or being unable to walk: **911**, because the person may fall and the spine may be unstable). I'd make each one two questions.

| File:line | Proposed 911 half | Proposed Emergency half |
|---|---|---|
| ctj.md:33 | Sudden new weakness or unsteadiness in both legs | Lost control of bladder or bowels |
| neck.md:77 | New weakness in both legs, or weakness spreading quickly in hands and feet. Add: "or any trouble breathing or swallowing" (Guillain-Barré can reach the breathing muscles) | Lost control of bladder or bowels, unable to pass urine |
| tlj.md:22 | Sudden weakness or numbness in both legs | Bladder or bowel loss, numbness around the bottom |
| upperback.md:22 | Sudden weakness or numbness in both legs | Lost control of bladder or bowels |

## D. Your call (1)

| File:line | Flag | Options |
|---|---|---|
| sij.md:21 | Pregnant plus severe pelvic or back pain with bleeding, fluid leaking, or regular tightenings | (a) **911** for everything. (b) Split it: heavy bleeding or feeling faint → 911; fluid leaking or regular tightenings → "go to the hospital's labour and delivery unit now". I lean towards (b). |

---

## Notes on borderline choices

1. **Blocked artery (ankle:17, foot:15, leg:17).** The limb survives roughly 6 hours, so this is time-critical. But the person is usually stable, so I chose Emergency. If you'd rather not risk any delay getting there, these could move to 911.
2. **Necrotising infection (5 flags).** I chose Emergency. The Emergency screen's line "call 911 if it gets worse quickly" covers someone who becomes confused or collapses.
3. **head.md:52.** "Severe pain unlike anything before" after a manipulation can be the only early sign of an artery tear, so I chose 911 even though there are no neuro signs yet.
4. **neck.md:79.** The question includes milder items (light sensitivity, bad headache). I kept 911 because suspected meningitis usually means calling an ambulance. You could instead make the milder items an Emergency question of their own.
5. **Everything in B** keeps the "call 911 if you can't get there safely or it gets worse quickly" line, so nobody is told *not* to call.

## Not covered here (follow-up)

- **Injury screens** (`src/data/injuryScreen.js`): about 30 more `emergency` outcomes. Most are fractures, dislocations and compartment syndrome, which fit **Emergency**. Two exceptions:
  - The **neck injury rule** outcomes (lines 113, 129, 132) should be **911, keep still, don't move your neck**.
  - Suspected **femur fracture** or a **high-energy pelvic injury** should be **911**.
- **Pattern checks** (`src/data/patternChecks.js`): `pc-cardiac` and `pc-dizzy-heart` should be **911**.
- **Symptom guide** (`src/components/SymptomGuide.jsx:128`) uses the same combined wording and would follow the same split.
