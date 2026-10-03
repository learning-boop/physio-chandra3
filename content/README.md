# Clinical content — how to feed the assessment

Everything a patient sees in the assessment comes from Chandra's clinical
content; the code only carries it.

```
content/
  regions/        one file per body region: the region document as built
    _TEMPLATE-region.md
    _EXAMPLE-lowback.md   (the site's ORIGINAL low back, kept as a format example)
  conditions/     one file per condition: pointers + patient text (the site reads these)
    _TEMPLATE.md
  pain-patterns/  pain-pattern records and the spec they follow
    _PROMPT.md
    _SPEC-the-shape-of-pain.md
  reference/      clinician references the site reasons with (never shown to visitors)
    referred-pain.md   → src/data/referralMap.js
    cervical-radiculopathy.md, upper-cervical.md, neural-mechanosensitivity.md   (condition documents' reasoning appendices)
    cervical-conditions-manual.md   (AIM Theory Manual 2023, Chapter 2.1: dizziness, myelopathy, radiculopathy)
    osteoarthritis.md   (shared OA foundation: Osteoarthritis.docx intake + AIM manual Chapter 2.9 + current guidelines)
    compartment-syndrome.md   (acute compartment syndrome: the emergency-route questions, walk-in protocol, rehab after fasciotomy)
    multiple-sclerosis.md   (the nervous-system screen pc-neuro, diagnosed MS on the cautions list, clinician notes)
    hip-fracture.md   (JOSPT hip fracture CPG 2021: the emergency route and rehabilitation after surgery)
    work-participation.md   (JOSPT work participation CPG 2021: return-to-work screening and interventions)
    neuromuscular.md   (myasthenia gravis, myotonic dystrophy and myositis (pc-myositis): the nerve and muscle screen pc-muscle, the 911 crisis question, diagnosed entries on the cautions list)
    myofascial-pain.md   (muscle-referred pain: the shared tender-spot opening question and the myofascial condition in the neck, shoulder, upper back, low back and hip)
    fibromyalgia.md   (persistent widespread pain: the results-page explainer in src/data/widespreadPain.js, physio route with a family-doctor line, ca-fibro)
    duchenne.md   (Duchenne muscular dystrophy: the early-signs question for a child, pc-child-muscle, and the diagnosed entry on the cautions list)
    hyperthyroidism.md   (an overactive thyroid: pc-thyroid, the 911 periodic-paralysis question pc-paralysis, ca-thyroid and its exercise-safety panel, the frozen-shoulder cross-link, src/data/thyroid.js)
    hyperparathyroidism.md   (calcium balance: the undiagnosed screen pc-calcium, ca-parathyroid and its panel, the pseudogout and osteoporosis cross-links, src/data/parathyroid.js)
    hypopituitarism.md   (low pituitary hormones: the undiagnosed screen pc-lowhormone, ca-pituitary and its panel, the hydrocortisone adrenal-crisis wording, the concussion cross-link, and the deferred pattern questions fix)
    cushings.md   (Cushing's syndrome and steroid medicine: the undiagnosed weakness screen pc-hormone, ca-cushing, the steroid question on "A little about you", its red flags and results panel in src/data/steroids.js)
    diabetes.md   (diabetes as context: the question on "A little about you", its red flags first, the doctor-first nerve screen without it, the details and burden tier, the rank lift and the results panel in src/data/diabetes.js)
```

Files starting with `_` are templates, examples and instructions, never data.

## How a region gets built

1. Chandra writes the region document in Word (the "Region assessment"
   template: red flags, an optional injury screen, opening questions, up to 8
   questions with "Ask only if" rules, referral patterns, test patients).
2. It is built into the site data (`src/data/symptomGuide.js` or
   `symptomGuideExtra.js`, and `injuryScreen.js` for an injury screen), with
   a matching area on the body map if it needs one.
3. The document is saved here as `regions/<id>.md`. This copy is a RECORD of
   what was built — the site does not read it. To change a question or red
   flag, change the Word document (or ask for the change) so the two stay in
   step.
4. The region's conditions are written as `conditions/<region>-<id>.md`.
   These ARE read by the site: `npm run import:conditions` turns them into data.
5. The test patients go into `scripts/check-region-tests.mjs`, and every
   check must pass before it is committed.

## Region status

| Area on the body map | Region | Built from | Test patients |
| --- | --- | --- | --- |
| Neck | `neck` | Cervical assessment (+ Cervical Myelopathy condition document, questions N9–N10; + Cervicogenic dizziness condition document, N9's dizziness answer and N11; + Neck Pain Mobility Deficits, Whiplash WAD and Cervicogenic Headache documents; + Cervical Radiculopathy document, N2, N3 and N12, reasoning in reference/cervical-radiculopathy.md; + Cervicogenic Headache 1 and Upper Cervical Pain documents, N13 and the upper neck pain condition, reasoning in reference/upper-cervical.md; + Cervical Neural Mechanosensitivity document, N14, reasoning in reference/neural-mechanosensitivity.md; + the Canadian C-Spine Rule's limits and a concussion check in the injury screen, I8, I3 and I9, from the JOSPT neck 2017 and concussion 2020 CPGs) | 56 |
| Base of neck (C7–T3) | `ctj` | CT junction assessment | 5 |
| Mid back, front of chest | `upperback` | Thoracic assessment (+ Osteoporosis document, T9) | 8 |
| Mid-to-low back, flank | `tlj` | TL-junction assessment | 5 |
| Lower back | `lowback` | Lumbar assessment (+ Ankylosing spondylitis document, L9) | 7 |
| Back of pelvis & buttock | `sij` | SI assessment (+ Ankylosing spondylitis document, P6) | 5 |
| Tailbone | `coccyx` | Coccyx assessment | 5 |
| Jaw | `jaw` | TMJ assessment | 5 |
| Head | `head` | Head assessment (+ Cervicogenic Headache 1 document, D2 and D3; + Concussion document, the head injury screen, D8 and D9) | 14 |
| Shoulder | `shoulder` | Shoulder assessment | 6 |
| Upper arm | `arm` | Upper arm assessment | 5 |
| Elbow | `elbow` | Elbow assessment | 6 |
| Forearm | `forearm` | Forearm assessment | 5 |
| Wrist | `wrist` | Wrist assessment (+ CRPS document, W9) | 8 |
| Hand & fingers | `hand` | Hand and fingers assessment (+ CRPS document, H9; + Dupuytren's document, H2) | 8 |
| Hip & groin | `hip` | Hip assessment (question ids G1–G8; + hip fracture CPG 2021: a dislocated or painful hip replacement and a fracture without a fall, red flags) | 8 |
| Thigh | `thigh` | Thigh assessment (question ids R1–R8) | 6 |
| Knee (from just above the kneecap to just below it) | `knee` | Knee assessment (question ids K1–K8; + the Pittsburgh knee rule and the peroneal nerve in the injury screen, I8 and I9, and a femoral stress fracture flag) | 7 |
| Lower leg (calf & shin) | `leg` (zone type `lowerleg`) | Lower leg assessment (question ids V1–V8) | 6 |
| Ankle (ankle bones, front crease, back of the heel) | `ankle` | Ankle assessment (question ids A1–A8; + CRPS document, A9; + the Ottawa ankle rules in full, injury screen I8, JOSPT ankle sprain CPG 2021) | 9 |
| Foot & toes (sole, heel pad, top of the foot, toes) | `foot` | Foot assessment (question ids B1–B8; + CRPS document, B9; + the Ottawa foot rule in full, injury screen I8) | 7 |
| Stomach | — | generic questions | — |

Still to feed:
The Subjective assessment template. "Arm
assessment" was replaced by "Upper arm" and "Forearm" and is not used.

## Rules that keep it working

- **Answer text is the link.** A condition points at answers by their exact
  words. Change an answer's wording and every condition that uses it must
  change too — `npm run import:conditions` names the ones that break.
- **Keep answers distinct.** Overlapping answers ("pain into the leg" and
  "pain below the knee") blur the scoring.
- **Up to 8 questions per region.** The patient is shown at most 5 of them,
  chosen by their earlier answers. A region's lead question ("where is it?")
  can be marked to go first.
- **Safety comes first, and tiers decide it, not the AI.** Right after the
  drawing, page 1 asks every `emergency` flag for the areas drawn (a "yes"
  → call 911, or go to an emergency department now for the flags that are
  not life-threatening; no booking, with the flag's reason shown), then page 2 every
  `urgent` flag (a "yes" → "see your doctor", with booking offered now and
  the questionnaire continuing; the advice stays on the results). Flags
  marked `sameDay` (giant cell arteritis, a possible clot, a hot joint with
  fever, a possible fracture, a possible torn biceps or finger tendon, arm
  cellulitis, a fingertip infection, a painful knee replacement, hands or
  walking getting quickly worse) say "see a doctor today". Only flags that
  depend on the answers wait for a short final check.
- **Merged questions stand in for several.** A red flag's `group` can be a
  list (the neck's stroke question is also the sudden-headache question): it
  is asked unless every group is already on the screen, and then no
  neighbouring area asks any of them again. The hot-joint, gout,
  hand-weakness and organ-pain questions are shared across the arm, and the
  general "fever, weight loss, lump, night pain, cancer" check replaces the
  arm areas' own cancer questions (shorter questionnaire, 28 Sep 2026).
- **The closing screens are short.** Pain behaviour asks severity, settling
  time, the 24-hour pattern and easing (irritability is graded on the first
  two). "How it is affecting you" asks 5 statements, 8 when the pain has
  lasted over 6 weeks or is severe, none for pain under 2 weeks that is mild;
  an insurance or work claim is a tick box before the results.
- **Twin questions are asked once.** A question tagged `same` (the CRPS
  question W9 / H9 / A9 / B9 in the wrist, hand, ankle and foot) keeps its
  own id and identical options; once one is asked, the others are skipped
  and each area reads that answer as its own.
- **Neighbouring areas share.** A red flag that asks the same thing in two
  areas (heart, aorta, spinal cord…) is shown once. A condition with the same
  name in two areas is shown once, so keep its text identical in both files
  (neck/head "Neck-related headache"; base of neck/upper arm "First rib and
  thoracic outlet irritation"; elbow/forearm "Radial tunnel syndrome"; hip/thigh "Numb or burning outer
  thigh"; wrist/hand "Carpal tunnel syndrome"
  and "Thumb base arthritis"). The
  shoulder, upper arm, elbow, forearm, wrist and hand injury
  screens share one opening question ("Have you injured your shoulder, upper arm,
  or elbow…?") when two or more apply, and an injury question worded
  exactly the same in two screens is asked once.
- **The drawing answers "Where is the pain?"** On the knee, lower leg, ankle,
  foot, hip, thigh, elbow, forearm, wrist and back of the neck, where the marks sit (front or
  back of the limb, inner or outer side, how high) answers the area's first
  question when it is clear, and that question is skipped; the review screen
  shows it (src/data/drawnLocation.js). Keep those questions' option ids
  when editing a region, or update the rules there. An area a mark only
  grazed (under 35% of the ink of the main area) gets its questions after the
  main area's.
- **The patient confirms the areas.** Under the drawing, each area is a
  chip: ticked when drawn on, unticked ("Also touched: Forearm") when the
  line only caught it (under 35% of the main area's ink). A tap changes
  either; one area always stays ticked. An unticked area gets no pain,
  opening or "see a doctor" questions, but its emergency questions are still
  asked (Chandra's cautious rule, 28 Sep 2026).
- **Some marks ask a neighbour too.** A low-back mark also asks the TL
  junction; an upper-arm mark also asks the shoulder; a line from the neck
  down the arm asks the neck and base of the neck. A forearm mark beside
  the elbow is asked after the elbow (it is often elbow pain spreading down).
- **A recent head injury no doctor has seen gets no booking.** The head
  injury screen (Concussion document, 2 Oct 2026) sends anyone injured in
  the last 3 days (or unsure when) who has not seen a doctor or nurse
  practitioner to one today, with HealthLink BC 8-1-1, and holds the
  booking until then; later injuries are sent to their doctor with booking
  offered. Thoughts of self-harm after the injury show the 9-8-8 Suicide
  Crisis Helpline.
- **Refer-first conditions carry a doctor note.** A condition file with a
  `## doctorFirst` section (cervical myelopathy) shows that note at the top
  of its results card; `## clinicNotes` go to Chandra's clinician summary
  only.
- **Look-alikes become cards, not conditions.** "May be coming from your
  neck / shoulder / hip / low back", migraine, and see-a-doctor messages are
  cards shown with the results.
- **Who a safety question is for** ("A little about you", 2 Oct 2026). Age and sex assigned at birth are asked after the drawing, before the safety pages. A red flag may carry `sex: "female"` or `sex: "male"` (only when it cannot apply to the other birth sex: pregnancy, periods, giving birth, testicle) or `ages: [...]` (only when the question itself names an age, e.g. "over 50", "a child aged 9 to 16"). An emergency question is never tagged by age. Unknown, or "Intersex, or prefer not to say": every question is asked (`forPerson` in src/data/assessmentFlow.js). Birth sex stays on the device: it is never put in the answers, so it is not in the summary, PDF, AI overview or anonymous copy.
- **Test patients are the proof.** 3–5 per region, including one red-flag case
  and one look-alike that must NOT be matched.

## Checks

```bash
npm run import:conditions   # turn condition files into site data
npm run check:data          # every condition can actually be reached
npm run check:accuracy      # simulated patients reach the right condition
npm run check:patterns      # drawing, referral, pain-type and safety rules
npm run check:regions       # each region document's test patients, pass/fail
npm run check:review        # what Chandra has signed off, and what is still open
npm run review              # the clinical review page → review/index.html
npm run build
```

## Signing off

A condition is signed when its file's `reviewed:` line has a name and date
(`reviewed: Chandra Matla, 2026-09-26`); a region when its record's
`reviewed_on:` line has a date. Unsigned content still shows on the site.
The review page shows each region as a patient meets it, with its status;
texts Claude drafted are marked, because they need the closest read.
