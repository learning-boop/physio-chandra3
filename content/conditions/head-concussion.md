---
region: head
id: concussion
name: Concussion (mild head injury)
clin: Concussion (mild traumatic brain injury, mTBI)
# From "Concussion.docx" (Conditions/Neck and headache), v1.0, 2 Oct 2026.
# Built with the document's drafted answers to its four open items (section
# 10): (a) more than 3 days and no doctor yet → see your doctor, booking
# offered; (b) the 7 symptoms 1 point each; (c) the 9-8-8 question stays in
# the head injury screen; (d) no separate under-18 rule, because everyone who
# has not seen a doctor is sent to one.
# The head injury screen (src/data/injuryScreen.js) runs first: the timing
# (Q2), the red flags (section 6) and "have you seen a doctor?" (Q7) route
# there, before any score. A recent injury no doctor has seen gets education
# only, with no booking.
# reviewed: your name and the date, once every line is checked (e.g. Chandra Matla, 2026-09-26)
reviewed:
# Only after a knock, fall, crash or jolt (the document's Q1 gate).
onset: knock
# Pointers follow the document's scored question set (section 4):
#   Q1 a specific event 3: the head's "How did it start?" answer
#   Q2 timing: not scored (every known time scores the same 2); it routes
#   Q3 the symptom cluster, 1 each (max 7): D8
#   Q4 blacked out, dazed or a memory gap 2 · Q5 screens or mental effort:
#      clearly 2, sometimes 1 · Q6 neck 1: D9
#   Q7 seen a doctor: routes, not scored (its "not a concussion" -2 is left
#      out; the doctor's answer is in the clinician summary)
# Maximum 15. Shown at 40% (6 or more): the knock plus 3 more points. The
# document's "possible" line was 5 of 17 including the 2 for timing.
pointers:
  "After a knock to the head or a whiplash injury": 3
  "Headache or pressure in the head": 1
  "Dizzy or off balance": 1
  "Brain fog, slowed thinking, or trouble remembering": 1
  "Feeling sick (nausea) since the injury": 1
  "Light or noise bothers me more than before": 1
  "Unusually tired, or sleeping differently": 1
  "More irritable, low or anxious than usual": 1
  "I blacked out, felt dazed or confused, or cannot remember what happened around the injury": 2
  "Screens, reading, busy places or thinking hard clearly make it worse": 2
  "Screens, reading, busy places or thinking hard sometimes make it worse": 1
  "Neck pain or stiffness, or turning my head brings on dizziness or headache": 1
---

## blurb
A concussion is a temporary change in how the brain works after a knock to the head, or a jolt to the body that makes the head move suddenly. The brain is not visibly damaged on a scan; its systems are upset for a while, which is why you can feel headache, dizziness, fog, tiredness, or sensitivity to light and noise. Most people recover within a few weeks, and returning to light activity early helps more than lying in a dark room. When symptoms last longer, they also usually improve with the right plan.

## doctorFirst
Concussion is diagnosed by a doctor or nurse practitioner, who also checks for a more serious injury. If one has not seen you yet, please see them first: your family doctor or a walk-in clinic, or call HealthLink BC on 8-1-1. Do not return to sport or activities with a risk of falling until they have cleared you.

## noticed
- Symptoms that started within minutes to hours of a knock, fall, collision or whiplash-type jolt, and may build over the first 1 to 3 days
- Headache or head pressure, dizziness or feeling off-balance, nausea
- "Brain fog": feeling slowed down, forgetful, or finding it hard to concentrate
- Sensitivity to light and noise, tiredness, and sleeping differently
- Feeling more irritable, low or anxious than usual
- Neck pain and stiffness are common alongside
- Screens, reading, busy places and mental effort make it worse

## homeCare
- For the first 1 to 2 days: rest from screens and mental effort, do not drive, and avoid alcohol. Light activity around the house and a short, slow walk are fine if they make symptoms no more than a little worse
- After that, add gentle activity such as walking, building up a little each day. A small rise in symptoms that settles within an hour is normal; if they climb more, ease back to the previous level and try again the next day
- Keep a regular sleep schedule, eat regular meals and drink plenty of water; avoid long daytime naps
- Take breaks from screens, and use a quiet space when busy places are too much
- Do not return to contact sport, or any activity with a risk of falling or a knock to the head, until a doctor or nurse practitioner has cleared you

## seePhysioIf
- A doctor has checked you and you still have headache, dizziness, neck pain, balance or vision problems, or trouble coping with exercise, school or work
- Symptoms are lasting beyond 2 to 4 weeks: physiotherapy for the neck, balance and exercise tolerance tends to help most here
- You want a step-by-step plan to return to sport, school or work
- Tiredness, weakness, low mood, or changes in sex drive or periods are not improving 3 months or more after the injury: please also ask your family doctor about a hormone (pituitary) blood test, which can be checked alongside physiotherapy

## clinicNotes
- Physio role is the recovery phase, alongside the GP or NP. Confirm medical assessment and diagnosis (BC guideline: ideally within 72 h); check red flags and the C-spine (Canadian C-Spine Rule).
- Symptom inventory: SCOAT6 / Child SCOAT6 (over 72 h), RPQ or PCSS at baseline and serially. Risk of persisting symptoms: PoCS Rule (14 and over), 5P (5 to 18).
- Cervical: ROM, segmental palpation, flexion-rotation test, deep neck flexor endurance, joint position error.
- Vestibular and oculomotor: VOMS, smooth pursuits, saccades, convergence (NPC), VOR, visual motion sensitivity; Dix-Hallpike if positional vertigo is reported.
- Balance: mBESS, tandem gait (dual task). Exertion: Buffalo Concussion Treadmill or Bike Test for the sub-symptom heart-rate threshold; orthostatic HR and BP (2 min supine, 1 min standing) for an autonomic or POTS pattern.
- Management: education and reassurance; relative rest 24 to 48 h at most, then graded return; sub-symptom-threshold aerobic exercise (start around 55% of max HR, progress to about 70%); cervical treatment when the neck is involved; vestibular and oculomotor rehabilitation, with repositioning for BPPV; Return to Sport / School / Work plans following the BC CATT protocols. Return to at-risk activity only after medical clearance.
- Post-traumatic hypopituitarism ("Hypopituitarism" document, signed 3 Oct 2026; content/reference/hypopituitarism.md): 10-30% after moderate to severe TBI or SAH, GH deficiency commonest; suggest an endocrine screen at 3-6 and 12 months, and in persisting symptoms after mild TBI. The final check asks pc-lowhormone for a head problem lasting more than 3 months.
- Note mood, sleep and headache type for co-management with the GP. Persisting symptoms (over 4 weeks): about 1 in 6 adults, 1 in 4 young people.
- The head injury screen records when it happened and whether a doctor or NP has seen it (head:I2, head:I10); "said it was not a concussion" is recorded there, not scored.
- AIM Theory Manual 2023 (pp. 236-254, 278; content/reference/cervical-conditions-manual.md): tell primary concussion from vestibular, cervicogenic and oculomotor dysfunction, and refer complex cases to a concussion-trained physiotherapist. History alone cannot separate the dizziness sources after concussion (Reneker 2015A); vestibular tests have the strongest consensus (Reneker 2015B). CCFT impaired in 81.6% of dizzy post-concussion patients (Reneker 2018). With abnormal neck proprioception and no vestibular or central cause, head relocation practice helped 85% vs 18% with vestibular rehab (Hammerle 2019).
- JOSPT 2020 concussion CPG, exam: screen every concussive event for emergency signs, cervical spine injury and undiagnosed concussion (A); full intake including mental health history, with mental health and cognitive screening and referral as indicated (A). Then examine four domains (B): cervical musculoskeletal, vestibulo-oculomotor, autonomic/exertional tolerance, motor function. Document each impairment and its irritability (E); assess self-efficacy, support and coping (E).
- Sequencing (F): rate irritability first; least irritable tests first. With highly irritable neck pain and no serious pathology, treat the cervical and thoracic spine first so the other systems can be tested. Cervical exam (C) when there is neck pain, headache, dizziness, fatigue, balance or visual-focus complaints; may include the TMJ (F). Classify headache type by ICHD (B).
- Vestibulo-oculomotor (B): alignment, pursuits, saccades, vergence and accommodation, gaze stability, DVA, visual motion sensitivity, orthostatic light-headedness; Dix-Hallpike or another positional test when BPPV is suspected (A). VOMS is a screen, not a full assessment. Autonomic/exertional (B): HR and BP supine, sitting, standing; symptom-guided graded exertion test with exertional intolerance, dizziness or headache, or before return to sport, military or manual work (B); delay it if highly symptomatic at rest; use a bike when vestibular or cervical impairments are present (C). Motor function (B): static and dynamic balance, coordination, dual task.
- Interventions: education on symptoms and the expected good recovery (A); relative rather than strict rest, graded re-engagement, sleep (B); an impairment-matched plan (B); cervical and thoracic exercise and manual therapy (B); canalith repositioning for BPPV (A); vestibular and oculomotor rehabilitation by trained clinicians, others refer (B/F); symptom-guided progressive aerobic training for exertional intolerance or return to vigorous activity (A), once irritability is moderate or lower; motor function training (C). Early physiotherapy is safe; time since injury alone should not decide when to start.
- Refer (B): persistent migraine-type or chronic headache; vision (including ocular alignment) or hearing problems; sleep, mental health or cognitive problems; possible mimics (tumour, endocrine, e.g. post-traumatic diabetes insipidus). Measures (F): symptom checklist serially; NDI and HDI every 2 weeks; Dix-Hallpike weekly until BPPV resolves; DHI and DVA for vestibular deficits; HiMAT for high-level balance; graded exertion test at least once and to judge readiness for return to sport or work.
- Slower recovery (inconsistent evidence): previous concussion, female, younger, ADHD, migraine; loss of consciousness, amnesia, late removal from play; early dizziness, headache, depressive symptoms.
- Sources: BC Guidelines, Concussion / mTBI (2024, revised May 2025); Patricios 2023 (Amsterdam consensus, BJSM); Leddy 2023; Schneider 2023; PedsConcussion living guideline 2024; Ontario Neurotrauma Foundation adult living guideline; Parachute Canadian Guideline on Concussion in Sport, 2nd ed. 2024 (CRT6); CATT (cattonline.com) 2024 protocols; Cancelliere 2023; Quatman-Yates 2020 (JOSPT concussion CPG, grades in brackets above).
