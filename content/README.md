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
| Neck | `neck` | Cervical assessment | 6 |
| Base of neck (C7–T3) | `ctj` | CT junction assessment | 5 |
| Mid back, front of chest | `upperback` | Thoracic assessment | 5 |
| Mid-to-low back, flank | `tlj` | TL-junction assessment | 5 |
| Lower back | `lowback` | Lumbar assessment | 5 |
| Back of pelvis & buttock | `sij` | SI assessment | 5 |
| Tailbone | `coccyx` | Coccyx assessment | 5 |
| Jaw | `jaw` | TMJ assessment | 5 |
| Head | `head` | Head assessment | 5 |
| Shoulder | `shoulder` | Shoulder assessment | 6 |
| Upper arm | `arm` | Upper arm assessment | 5 |
| Elbow | `elbow` | Elbow assessment | 6 |
| Forearm | `forearm` | Forearm assessment | 5 |
| Wrist | `wrist` | Wrist assessment | 6 |
| Hand & fingers | `hand` | Hand and fingers assessment | 6 |
| Hip & groin | `hip` | Hip assessment (question ids G1–G8) | 6 |
| Thigh | `thigh` | Thigh assessment (question ids R1–R8) | 6 |
| Knee (from just above the kneecap to just below it) | `knee` | Knee assessment (question ids K1–K8) | 6 |
| Lower leg (calf & shin) | `leg` (zone type `lowerleg`) | Lower leg assessment (question ids V1–V8) | 6 |
| Ankle (ankle bones, front crease, back of the heel) | `ankle` | Ankle assessment (question ids A1–A8) | 6 |
| Foot & toes (sole, heel pad, top of the foot, toes) | `foot` | Foot assessment (question ids B1–B8) | 6 |
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
  → 911, no booking, with the flag's reason shown), then page 2 every
  `urgent` flag (a "yes" → "see your doctor", with booking offered now and
  the questionnaire continuing; the advice stays on the results). Flags
  marked `sameDay` (giant cell arteritis, a possible clot, a hot joint with
  fever, a possible fracture, a possible torn biceps or finger tendon, arm
  cellulitis, a fingertip infection, a painful knee replacement) say "see a doctor today". Only flags that
  depend on the answers wait for a short final check.
- **Neighbouring areas share.** A red flag that asks the same thing in two
  areas (heart, aorta, spinal cord…) is shown once. A condition with the same
  name in two areas is shown once, so keep its text identical in both files
  (neck/head "Neck-related headache"; base of neck/upper arm "First rib and
  thoracic outlet irritation"; elbow/forearm "Radial tunnel syndrome"; hip/thigh "Numb or burning outer
  thigh"; wrist/hand "Carpal tunnel syndrome"
  and "Thumb base arthritis"). The
  shoulder, upper arm, elbow, forearm, wrist and hand injury
  screens share one opening question ("Has your shoulder, upper arm, or
  elbow been hurt…?") when two or more apply, and an injury question worded
  exactly the same in two screens is asked once.
- **The drawing answers "Where is the pain?"** On the knee, lower leg, ankle,
  foot, hip, thigh, elbow, forearm and wrist, where the marks sit (front or
  back of the limb, inner or outer side, how high) answers the area's first
  question when it is clear, and that question is skipped; the review screen
  shows it (src/data/drawnLocation.js). Keep those questions' option ids
  when editing a region, or update the rules there. An area a mark only
  grazed (under 35% of the ink of the main area) gets its questions after the
  main area's.
- **Some marks ask a neighbour too.** A low-back mark also asks the TL
  junction; an upper-arm mark also asks the shoulder; a line from the neck
  down the arm asks the neck and base of the neck. A forearm mark beside
  the elbow is asked after the elbow (it is often elbow pain spreading down).
- **Look-alikes become cards, not conditions.** "May be coming from your
  neck / shoulder / hip / low back", migraine, and see-a-doctor messages are
  cards shown with the results.
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
