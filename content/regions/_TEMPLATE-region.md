---
# ─────────────────────────────────────────────────────────────────────────
# ONE FILE = ONE BODY REGION.  Copy this file, rename it to the region id,
# fill it in, and tell Claude Code "the <region> file is ready".
#
# region : one of
#   lowback  neck  upperback  shoulder  elbow  wrist  hip  knee  ankle
# name   : what the patient sees, e.g. "Low back & pelvis"
# ─────────────────────────────────────────────────────────────────────────
region: 
name: 
source: 
reviewed_by: Chandra Matla, Registered Physiotherapist
reviewed_on: 
---

## red flags
<!-- One per line:  text | tier | why (one sentence)
     tier = emergency  → call 911 / emergency department, no booking offered
     tier = urgent     → see a physician first, booking offered after review
     Write the text the way you would ask a patient. -->
- text | tier | why
- text | tier | why

## opening questions
<!-- Asked once, one answer each. Keep age bands and duration bands as they
     are unless you want them changed — they are shared across regions.
     Format:  Q: question text
              - answer option -->
Q: Your age?
- Under 18
- 18 – 30
- 30 – 50
- Over 50

Q: How did it start?
- 
- 
- Not sure

Q: How long has it been going on?
- Less than 2 weeks
- 2 – 6 weeks
- 6 weeks – 3 months
- More than 3 months
- Comes and goes over years

## questions
<!-- The diagnostic questions for this region. Up to 8. The patient can tick
     more than one answer. Answer text is what conditions point at, so keep
     each answer distinct and write it in plain words.
     Optional last line per question:  Ask only if: <question> = "<answer>" -->
Q: 
- 
- 
- Not sure

Q: 
- 
- 
- Not sure

## referral patterns
<!-- Optional. How pain from this region travels, and what that means.
     Format:  from → to | reads as | rule out at assessment
     Example: low back → below the knee | nerve root (radicular) | deep gluteal, hip joint -->
- 

## test patients
<!-- 3–5 per region. This is how I prove the region works before it goes live.
     Format:
     CASE: short name
     Drawing: what they draw
     Answers: question = answer; question = answer
     Flags: none | which red flag they tick
     Expect: top condition = ...; must not show = ...; route = results | physician | 911 -->
CASE: 
Drawing: 
Answers: 
Flags: none
Expect: 
