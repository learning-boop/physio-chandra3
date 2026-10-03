<!-- Source: "Hypopituitarism.docx" (Conditions/General conditions), reviewed
     and signed by Chandra Matla, 3 Oct 2026 (confirmed in the session; the
     saved Word file still shows "v0.1 draft, pending" and no signature).
     Evidence: Endocrine Society hormonal replacement in hypopituitarism 2016;
     Endocrine Society adult GH deficiency 2011 and AACE 2019; Lancet 2024
     seminar; Post-traumatic hypopituitarism, Curr Phys Med Rehabil Rep 2024;
     Society for Endocrinology adrenal-crisis guidance. Clinician reference
     only. Code: src/data/steroids.js (shared with Cushing's). -->

# Hypopituitarism (low pituitary hormones)

The opposite of Cushing's: too little growth hormone, cortisol (via ACTH), thyroid hormone (via TSH), sex hormones, and sometimes vasopressin. Uncommon (about 4 per 100,000 a year); the guide never diagnoses it.

## On the site

- **Route A, undiagnosed:** `pc-lowhormone` in src/data/patternChecks.js, asked after the Cushing's question and before the nerve and muscle screen. Asked for: both shoulders, upper arms, hips or thighs drawn; a widespread drawing (4 or more areas); a weakness answer; or a head problem lasting more than 3 months (the concussion cross-link). It asks for months of exhaustion that sleep does not fix, or both-sided muscle loss, together with a cause: a pituitary or brain tumour, brain surgery or radiotherapy to the head; a significant head injury or bleeding in the brain; a childbirth with heavy bleeding after which periods did not return or breastfeeding did not work; or cancer immunotherapy. That is the document's rule "Q3 yes with Q1 or Q2". A yes: family doctor in the next week or two (oncology team the same day on immunotherapy), no booking until then.
- **Route B, diagnosed:** "A pituitary hormone problem or adrenal insufficiency, diagnosed by a doctor (for example on hydrocortisone, thyroxine, sex hormone or growth hormone replacement)" on the cautions list (`ca-pituitary`). Results panel "Low pituitary hormones and rebuilding strength": under-supplied, not damaged; replacement plus training; progress by next-day recovery and effort rather than heart rate; five lines (never miss hydrocortisone doses, steroid card, sick-day rules; small steps; water and salt, stand slowly; bone density and vitamin D; 911 for sudden severe headache with vision loss, double vision, a drooping eyelid or collapse, and same day for extreme thirst with large amounts of pale urine).
- **The adrenal overlay (open item 5):** the Cushing's steroid question now names "hydrocortisone replacement" among steroid tablets, so anyone on replacement gets the adrenal-crisis question first. Its wording adds diarrhoea and "unable to keep your steroid tablets down", and the explanation adds the sick-day rules (usually double the dose) and the emergency card or injection "if you carry one" (open item 6).
- **Concussion cross-link (open item 2):** content/conditions/head-concussion.md adds a "see a physiotherapist if" line (tiredness, weakness, low mood, or changes in sex drive or periods not improving 3 months or more after the injury: ask your family doctor about a hormone (pituitary) blood test) and a clinic note on screening at 3-6 and 12 months.
- **A fix found while building:** the doctor page shows at most two drawing-triggered pattern questions, and the rest used to be dropped altogether (the final check skipped anything the drawing had triggered). A both-thighs drawing therefore never reached the nerve and muscle screen once the Cushing's question was added, and a both-shoulders drawing reached none of the weakness screens. The questions the limit cuts are now asked on the final check, which holds up to five.

## Decisions on the open items (accepted with the sign-off)

1. Named once, as drafted: "low hormone levels, including, after a head injury or treatment near the brain, the pituitary gland itself". The word "hypopituitarism" is not used.
2. Concussion cross-link: added.
3. Not merged into one combined "whole-body fatigue and weakness" screen; it is one question in the same sequence as PMR, myositis, the Cushing's question and the nerve and muscle screen.
4. Scored set collapsed into the one question with the document's doctor-first rule; the POSSIBLE band (5-7) is not built.
5. Adrenal overlay: shared with the steroid flag, as recommended.
6. Emergency injection mentioned as "if you carry one".
7. Sheehan's: kept as a cause inside the screening question (childbirth with heavy bleeding, periods not returning, breastfeeding failing) but not as a named red flag; the name stays in these notes.

## Not built

- Separate red flags for gradual side-vision loss, milk from the breasts, myxoedema (very cold and slow after illness), and the vasopressin "same day" item outside the diagnosed panel: rare, and the general neurological and systemic questions cover the urgent ones.
- Fragility fracture on cortisol replacement: the spine `osteo` questions already name long-term steroid tablets.
- The ME/CFS post-exertional malaise pre-check (no ME/CFS record on the site yet).

## Clinic notes (from the document)

- Endocrine history: cause (adenoma, surgery, radiotherapy, which can cause it years later; TBI or SAH; Sheehan's; checkpoint inhibitors), axes affected, replacement (hydrocortisone dose and timing, steroid card, sick-day rules, IM kit; levothyroxine, monitored by free T4 not TSH in central hypothyroidism; testosterone or oestrogen; GH, monitored by IGF-1; desmopressin, fluid balance and hyponatraemia), last endocrine review.
- Red flags: apoplexy, visual fields (bitemporal), postural BP drop, hydration.
- Function: 30-second chair stand, 6-minute walk or step test with RPE and Borg, grip, proximal strength both sides, TUG, single-leg stance or Berg, waist circumference.
- Bone: height loss, kyphosis, percussion tenderness; vertebral fracture assessment when over-replaced with glucocorticoid or at fracture risk (Endocrine Society 2016); DXA via the GP.
- Hands: carpal tunnel with central hypothyroidism or early GH replacement (fluid retention).
- Physiology: GH deficiency lowers VO2max, lean mass and strength; hypogonadism lean mass and bone; central hypothyroidism slow recovery and myalgia (CK may rise); over-replaced hydrocortisone myopathy and bone loss (see cushings.md); under-replaced fatigue, hypotension, nausea with exertion.
- Programme: progressive resistance 2-3 times a week and 150 minutes of moderate aerobic activity a week, built from a low baseline with RPE and 48-hour recovery checks; pacing if post-exertional symptoms. After TBI, coordinate with the concussion and vestibular plan; recommend the hormone screen when fatigue or weakness is out of proportion.

## Sources

Fleseriu M et al., JCEM 2016;101:3888-3921; Molitch ME et al., JCEM 2011; AACE/ACE 2019; J Clin Med 2024 (GH deficiency update); Lancet 2024 seminar; Curr Phys Med Rehabil Rep 2024;12:405-416; Endotext 2024; Front Endocrinol 2021; Society for Endocrinology and NHS steroid emergency card and sick-day guidance; Osteoporosis Canada 2023; NICE NG206; Butler & Moseley, Explain Pain.
