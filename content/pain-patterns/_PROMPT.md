# Pain-pattern gathering prompt

Use this to collect pain patterns (local, referred, radicular, visceral,
nociplastic, …) in a format that can be turned into recognition rules on the
website.

**How to use**

1. Run **one category per session** (see the table at the bottom).
2. Paste the prompt below into Claude (or another AI) and attach your sources,
   e.g. *Clinical Reasoning in Musculoskeletal Practice* and the relevant
   guidelines.
3. Replace `[CATEGORY]` with the category for that session.
4. Review and correct the output. You are the clinical sign-off.
5. Save the checked result in this folder as one file per category, e.g.
   `content/pain-patterns/05-visceral-referred.md`, and ask Claude Code to
   build it into the site.

Files starting with `_` (like this one) are instructions, not data.

---

## Prompt (copy everything inside the box)

````
You are helping a BC-registered physiotherapist (Chandra) build the pain-pattern
recognition for an online self-assessment tool. Patients draw where they hurt on a
3D body and answer questions; the tool suggests possible explanations, screens red
flags, and recommends physiotherapy or medical review.

TASK: For the category I name below, produce one PATTERN RECORD for each
clinically important pain pattern, using ONLY the attached sources. Cite the source
and page for each record. If the sources do not support something, write
"NOT IN SOURCES" — do not fill gaps from general knowledge. Mark anything uncertain
with [CHECK].

CATEGORY FOR THIS SESSION: [CATEGORY]

─── WHAT THE TOOL CAN DETECT (describe patterns ONLY in these terms) ───
Body-map areas (left/right recorded for limbs, shoulder, hip):
  head · neck · shoulder (incl. back of shoulder) · upperback (incl. shoulder blade)
  · lowerback (incl. buttocks) · chest · abdomen · elbow (upper arm below the deltoid,
  elbow, forearm) · wrist (lower forearm, hand, fingers) · hip (front of pelvis, groin,
  side of hip) · knee (mid-thigh to mid-shin) · ankle (lower shin, ankle, foot)
Drawing features:
  - which areas are marked
  - ONE continuous line vs SEPARATE marks
  - order along a line (e.g. neck → shoulder → elbow → wrist)
  - how far it reaches down a limb
  - one side / both sides / midline
  - one area vs many areas vs widespread
The tool CANNOT see: exact dermatomes, individual fingers, skin changes, or
anything that needs a physical examination. If telling this pattern apart depends
on those, say so under "Limits".

─── PATTERN RECORD FORMAT (repeat for each pattern) ───
PATTERN: [short name, e.g. "Gallbladder referral to right shoulder"]
Category: local somatic | somatic referred (spinal segmental) | radicular (nerve root)
          | peripheral nerve / entrapment | plexus | visceral referred | vascular
          | inflammatory / systemic | nociplastic (central) | mixed
Mechanism: nociceptive | peripheral neuropathic | nociplastic | mixed
Source structure(s): [e.g. gallbladder via phrenic nerve C3–5]
Source: [book/guideline, page]

DRAWING SIGNATURE
  Areas: [from the list above, e.g. shoulder R + upperback]
  Line type: continuous line | separate marks | single spot | either
  Direction / extent: [e.g. neck → past elbow into hand]
  Side: left | right | both | midline | either
  Spread: focal | regional | widespread

SYMPTOM SIGNATURE (patient's words)
  Quality: [e.g. deep, vague, hard to pinpoint ache]
  Nerve symptoms: [tingling / numbness / weakness — where]
  Behaviour: mechanical (changes with movement/position) | NOT affected by
             movement | constant | intermittent
  24-hour pattern: [e.g. worse after fatty meals, at night]
  Aggravating: [...]
  Easing: [...]
  Associated symptoms: [e.g. nausea, fever, shortness of breath, urinary changes]

DISCRIMINATING QUESTIONS (max 4, in plain patient language)
  Q: [question]
     - "[answer]" → FOR this pattern (strong/moderate/weak)
     - "[answer]" → AGAINST this pattern

LOOK-ALIKES (differentials)
  - [pattern] — tell apart by: [answer or drawing feature]

SAFETY TIER: EMERGENCY (call 911) | PHYSICIAN FIRST | PHYSIO OK | PHYSIO + INFORM GP
  Triggers: [exact features that raise the tier]

LIMITS: [what the tool cannot tell apart without examination]

PATIENT EXPLANATION (2–3 sentences, plain English, "can be associated with",
no diagnosis, no guarantees, no fear-based wording):

TEST CASES
  Case A (typical): drawing = [...]; answers = [...] → EXPECT: [this pattern], tier [...]
  Case B (look-alike): drawing = [...]; answers = [...] → EXPECT: [other pattern]
────────────────────────────────────────────────────────────────

At the end, list:
1. Patterns in this category the sources mention that you did NOT write up, and why.
2. Any drawing features the tool would need to recognise these patterns better
   (e.g. "front vs back of the upper arm").
````

---

## Categories (one session each)

| # | Category | Make sure these are covered |
|---|---|---|
| 1 | Local somatic | Tendinopathy, joint, ligament, muscle |
| 2 | Somatic referred (spinal segmental) | Facet/disc referral to buttock and thigh (not below the knee); cervical referral to the shoulder blade |
| 3 | Radicular / radiculopathy | C5–C8 and L4–S1 nerve roots: arm or leg below the elbow or knee, with nerve symptoms |
| 4 | Peripheral nerve / entrapment | Carpal tunnel, cubital tunnel, meralgia paraesthetica, tarsal tunnel, piriformis, thoracic outlet |
| 5 | Visceral referred | Cardiac (left arm or jaw), gallbladder (right shoulder or shoulder blade), diaphragm (shoulder tip), kidney (flank to groin), pancreas (mid back), aorta (back or abdomen), pelvic organs (low back or sacrum) |
| 6 | Vascular | Intermittent claudication vs spinal stenosis, DVT, arterial dissection |
| 7 | Inflammatory / systemic | Axial spondyloarthritis, rheumatoid arthritis, polymyalgia rheumatica, infection |
| 8 | Nociplastic (central) | Widespread pain, fibromyalgia pattern, persistent post-injury pain |
| 9 | Mixed | Nerve root plus local tissue pain, or persistent pain with a sensitised component |

**Suggested order:** start with **5 (visceral referred)**. Its safety tiers
matter most, and it has the most look-alikes of musculoskeletal pain. The
look-alike test cases (Case B) are the most valuable part of every record.

---

## What happens when you send a checked file

1. **Drawing:** each drawing signature becomes a recognition rule (like the
   neck-to-arm referral rule in `src/data/referral.js`).
2. **Questions:** discriminating questions are added to the right body areas.
3. **Safety:** safety tiers and triggers are wired into the red-flag screen.
   Your rules decide the outcome, never the AI.
4. **Testing:** every test case is run through the real site and reported as
   pass or fail before anything goes live.
5. **Limits:** anything the body map can't capture yet is flagged, so the map
   can be extended if needed.

If the body-map areas above change, update the area list in the prompt to
match. `node scripts/mesh/zone-map.mjs` renders the current area map, front
and back.
