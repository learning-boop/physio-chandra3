---
# ─────────────────────────────────────────────────────────────────────────
# ONE FILE = ONE CONDITION.  Copy this file, rename it, fill it in.
# Run `npm run import:conditions` then `npm run check:data` when you're done.
#
# region : which body area this belongs to. One of:
#          lowback  neck  upperback  shoulder  elbow  wrist  hip  knee  ankle
# id     : short unique code, lowercase, no spaces (e.g. achilles)
# ─────────────────────────────────────────────────────────────────────────
region: ankle
id: peroneal
name: Peroneal tendon pain
clin: peroneal tendinopathy

# POINTERS — this is what makes the condition appear.
# Quote the answer text EXACTLY as the patient sees it on screen, and give it
# a strength:  3 = strong pointer   2 = moderate   1 = weak   -2 = argues against
# A condition with no pointers can never be shown.
pointers:
  "The outer ankle": 3
  "A twist or 'rolled' ankle": 2
  "Unstable": 2
---

## blurb
Irritation of the tendons that run behind the bony bump on the outer ankle.
It often follows repeated ankle sprains or a spell of walking on uneven
ground, and it usually settles with graded strengthening.

## noticed
- Pain along the outer ankle, behind or below the bony bump
- A sense of the ankle giving way on uneven ground
- Discomfort that builds during activity rather than at rest

## homeCare
- Reduce walking on uneven or cambered surfaces for now
- Supportive footwear rather than flat, flexible shoes
- Gentle sideways ankle strengthening within comfort

## seePhysioIf
- It is not settling after about two weeks
- The ankle keeps giving way
- You would like a strengthening plan to return to sport
