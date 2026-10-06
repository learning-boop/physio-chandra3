---
region: widespread
id: wsp
name: Persistent widespread pain (a sensitive pain system)
clin: Persistent widespread pain / nociplastic pain pattern, including fibromyalgia (ACR 2016; IASP 2021 grading)
# 6 Oct 2026, path 4 ("Pain in many places"): the scored block of the signed
# "Fibromyalgia" document (section 4) as a condition of its own route. Patient
# text from the document's sections 2, 3 and 8. Fibromyalgia is not named in
# the title (the document's open item 2: named only as one possibility in the
# family-doctor line of the results explainer, ./src/data/widespreadPain.js).
# reviewed: your name and the date, once every line is checked (e.g. Chandra Matla, 2026-09-26)
# Pointers (document section 4): WS1 many areas 3 (the drawing), how long -
# more than 3 months 3, 6 weeks to 3 months 1 - tiredness, sleep and
# concentration 3 (some 2), tender to light pressure or moving pain 2 (one 1),
# no single cause or map 2, related sensitivities two or more 2 (one 1).
# Maximum 15. Shown at 6 (the site's 40% rule: the document's "possible"
# band); the full explainer at the document's route, 9 or more, or many areas
# and more than 3 months together.
pointers:
  "Many: both sides, above and below the waist": 3
  "More than 3 months": 3
  "6 weeks to 3 months": 1
  # Quality review, 6 Oct 2026: widespread aching under 6 weeks is not a
  # sensitised pain system (IASP 2021 needs 3 months or more; the engine's
  # pain-type rules already require it). Without the duration the other
  # answers add up to 12 at most; with -8 that is 4, under the card's 6, so it
  # cannot show. Those patients get the see-your-doctor card (wsRecent).
  "Less than 6 weeks": -8
  # The inflammatory and PMR look-alikes (the document's section 5) count
  # against it, as the explainer already steps aside for long morning
  # stiffness (./src/data/widespreadPain.js, C4).
  "Stiff for more than an hour in the morning, or joints that look swollen or feel hot": -3
  "I am over 50 and both shoulders and hips are stiff and sore": -3
  "Tired most of the time, sleep does not refresh me": 3
  "Some of these, on some days": 2
  "Yes, both": 2
  "One of these": 1
  "No: there was no single cause": 2
  "Two or more of them": 2
  "One of them": 1
---

## blurb
Pain in many places that has lasted a long time is very often a sign that the body's pain system has become oversensitive, so ordinary signals from muscles, joints and skin are turned up and felt as widespread pain, often with tiredness, sleep that does not refresh and difficulty concentrating. It is real pain, not imagined, and it is not a sign of damage: like a smoke alarm that has become so sensitive it goes off when you make toast, the alarm is loud but there is no fire. Because the nervous system is adaptable, sensitivity that has turned up can also turn down.

## noticed
- Deep aching, burning or stiffness in many places, on both sides and above and below the waist, often moving around from week to week
- Muscles that are sore to light pressure
- Tiredness out of proportion to what you have done, and sleep that does not refresh you
- Difficulty concentrating ("fog"), and sometimes headaches, an irritable bowel or sensitivity to noise, light or smells
- Flares with poor sleep, stress, infections, weather, and doing too much or too little

## homeCare
- Keep moving, gently and regularly: a short daily walk you can finish comfortably beats an occasional long one that leaves you flat for days
- Protect your sleep: regular times, a wind-down routine, and screens off before bed
- Pace: break tasks into chunks and rest before you have to, not after
- Warmth helps many people: a warm bath, heat pack or warm pool before exercise
- Remember that hurt does not mean harm: a flare is the alarm system being loud, not something breaking

## seePhysioIf
- Pain in many areas has been with you for three months or more and you want to understand it and have a realistic plan to feel and function better
- You have a fibromyalgia diagnosis and want a graded exercise, sleep and pacing programme, or help through a flare
- If you have not seen your family doctor about widespread pain, it is worth doing so as well: a few simple blood tests rule out other causes
- Fever, night sweats or unexplained weight loss, pain that wakes you and does not change with position, or that is steadily worsening week on week: see your doctor within days
- Morning stiffness lasting more than an hour, swollen or hot joints, or a new rash: see your doctor (possible inflammatory condition)
- New weakness, numbness in a clear pattern, bladder or bowel change, or vision change: see your doctor promptly; go to the emergency department if it is sudden or severe
- Thoughts of harming yourself, or feeling unable to cope: please reach out today - your doctor, 9-8-8 (call or text, any time), or the emergency department

## clinicNotes
- The "Fibromyalgia" document (signed 2 Oct 2026; content/reference/fibromyalgia.md) as path 4 of the question flow (6 Oct 2026): a widespread drawing whose owner says the pain is in many places most days skips the per-area joint questions and red flags.
- Confirm a widespread, non-anatomical, disproportionate pattern (IASP 2021 nociplastic grading; ACR 2016 WPI and SSS as a structured aid). The diagnosis stays with the family doctor (Canadian guidelines 2012: primary care, no specialist referral). Screen for mimics and comorbidities: inflammatory arthritis, axSpA, PMR, myopathy, thyroid, vitamin D, sleep apnoea, medication; recommend GP bloods if not done.
- Outcome measures: FIQR, PSEQ, Brief IPQ; PHQ-9 and GAD-7 only in clinic and with care; 6MWT or 30-s chair stand; sleep questions. Yellow flags assessed clinically, never scored online.
- Management (EULAR 2017: exercise the only "strong for"; Canadian 2012; NICE NG193): pain-neuroscience education first; graded aerobic and strengthening starting below current tolerance with quota-based progression; graded exposure; sleep, pacing, relaxation; warm-water exercise, tai chi or yoga; manual therapy only as a short-term adjunct. Co-manage with the GP, psychology for high distress or trauma, Pain BC and BC self-management programmes.
- Language: never tell anyone they "have fibromyalgia", never "central sensitisation", "damage", "wear and tear" or a psychological label.
- Sources: Macfarlane GJ et al., Ann Rheum Dis 2017 (EULAR); Fitzcharles MA et al., Canadian guidelines 2012; Wolfe F et al., ACR 2016 criteria; NICE NG193 (2021); Kosek E et al., IASP 2021 nociplastic grading; AIM Theory Manual 2023 Ch. 2.9.
