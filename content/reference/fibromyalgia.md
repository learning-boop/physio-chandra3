<!-- Source: "Fibromyalgia.docx" (Conditions/General conditions), reviewed and
     signed by Chandra Matla, 2 Oct 2026 (confirmed in the session; the saved
     Word file did not yet show the signature) (AIM
     Theory Manual 2023 Ch. 2.9; EULAR 2017; Canadian guidelines 2012; ACR
     2016 criteria; NICE NG193; IASP 2021 nociplastic grading; Cochrane
     exercise reviews; JOSPT Pain Science in Practice). Clinician reference
     only. -->

# Fibromyalgia and persistent widespread pain

## On the site

- **A physio route, not doctor-first.** The results page shows an "Understanding Your Pain" section (src/data/widespreadPain.js) when the fixed pain-type rules (src/data/painType.js) find sensitised pain, which needs more than 3 months, AND the drawing is widespread (3 or more areas not on one limb chain, or two areas drawn on both sides), or when "Fibromyalgia, diagnosed by a doctor" (`ca-fibro`) is ticked. Booking stays open.
- **Content:** the smoke-alarm explainer, reassurance (no damage; sensitivity can turn down), five self-care tips, how physiotherapy helps, and, for people not already diagnosed, the family-doctor line ("a few simple blood tests… if it is fibromyalgia, one possibility, it can usually be diagnosed in your doctor's office"). Fibromyalgia is named only there, as one possibility (the document's open item 2).
- **Safety first:** the safety questions run before the results and still decide the route: general flags (fever, weight loss, constant night pain), both-sides joints with long morning stiffness (pc-inflammatory), PMR over 50 (pc-pmr), the myositis and nerve and muscle screens, dark urine with muscle pain (group rhabdo), the MS screen. Low mood points to the family doctor and 9-8-8 (the wellbeing statements).
- **Not built:** the scored block (6 questions); the server-rendered /conditions/widespread-pain page; a self-harm question in the global safety checklist (the document's open item 3: today low mood leads to 9-8-8 wording, not a direct self-harm question outside the head injury screen); separate PMR (now built as pc-pmr) and myofascial pain entries (open item 6). The older standalone guide (SymptomGuide.jsx) keeps its own short "persistent, widespread pain" card.

## Recognising it

- Widespread (both sides, above and below the waist, axial), non-anatomical, persistent (3 months or more), with fatigue, unrefreshing sleep, cognitive symptoms, tenderness to light pressure, migrating pain; often headaches, IBS, TMD, bladder sensitivity, sensory sensitivity. About 2%; women more often; 30-60.
- ACR 2016 (WPI and SSS) as a structured aid; IASP 2021 nociplastic grading. The diagnosis is the family doctor's (Canadian 2012: primary care, no specialist needed) after simple bloods.
- Mimics and comorbidities: inflammatory arthritis, axSpA, PMR, inflammatory myopathy, thyroid, vitamin D, anaemia, diabetes, sleep apnoea, medication (statins, cancer treatment, opioid-induced hyperalgesia), hypermobility, depression and anxiety (never a reason to dismiss pain), MS and neuropathy, malignancy or infection (rare).

## Management (EULAR 2017, Canadian 2012, NICE NG193)

- Measures: FIQR, PSEQ, Brief IPQ, PHQ-9 and GAD-7 in clinic only and with care, 6MWT or 30-s chair stand, sleep questions; yellow flags assessed clinically, never scored online.
- Education first (pain neuroscience: nociception is not pain; descending modulation strengthened by movement and expectation); exercise is the only "strong for" (aerobic plus strengthening, starting below current tolerance, quota-based progression, not pain-contingent); graded exposure; sleep; pacing and flare plans; relaxation and breathing; warm-water exercise, tai chi or yoga; manual therapy only as a short-term adjunct. No opioids or NSAIDs for chronic primary pain (NICE); medication is the GP's and weak.
- Co-manage: GP for diagnosis and medication; psychology for high distress or trauma (in parallel, not instead); Pain BC and BC chronic-pain self-management programmes.
- Language audit: no "wear and tear", "damage" as a cause, "central sensitisation" or psychological labels to the patient.

## Sources

Macfarlane GJ et al., Ann Rheum Dis 2017;76:318-328; Fitzcharles MA et al., Pain Res Manag 2013;18:119-126; Wolfe F et al., Semin Arthritis Rheum 2016;46:319-329; NICE NG193 (2021); Kosek E et al., PAIN 2021; Bidonde J et al., Cochrane 2017; Busch AJ et al., Cochrane 2013; Watson JA et al., J Pain 2019; Moseley and Butler, Explain Pain Supercharged 2017; Pain BC; AIM Theory Manual 2023 Ch. 2.9.

## Cross-check 6 Oct 2026 (approved by Chandra)
- Patient wording: "Heat, and for some people gentle hands-on treatment, can ease pain for a while" (EULAR 2017 rates massage weak against).
- Post-exertional malaise (NICE NG206 2021): if small amounts of activity leave the person much worse a day or two later, start with energy management, not graded exercise. Added to the widespread-pain self-care list; diagnosed ME/CFS has its own caution (ca-mecfs).
- Routing: morning stiffness over an hour (inflammatory pattern) no longer opens the widespread section; pain on both sides above and below the waist in 4 or more areas for over 3 months opens it whatever the pain type (widespreadPain.js).
- Chandra's fibromyalgia protocol differs from this reference: symptom-contingent ("listen to the body") pacing vs quota-based progression here; an anti-inflammatory diet (weak evidence); over-the-counter topical analgesics (not for patient pages).
- AIM manual pp. 597-599 still uses the 1990 tender points (dropped by ACR 2010/2016) and amitriptyline: use this reference, not AIM, there.
