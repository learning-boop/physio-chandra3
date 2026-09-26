---
# From "Ankle assessment.docx" (Joint wise assessment folder), 25 Sep 2026.
# Built into src/data/symptomGuideExtra.js (ankle, question ids A1 to A8) and src/data/injuryScreen.js (ankle screen, Ottawa ankle rules adapted).
# Conditions: content/conditions/ankle-*.md. Body map: the ankle band (ANKLE_TOP in Body3D.jsx), which also covers the foot until the foot document is built.
# Test patients: npm run check:regions
region: ankle
name: Ankle
source: Martin RL et al. Ankle stability and movement coordination impairments: lateral ankle ligament sprains, revision 2021. JOSPT 51(4), 2021; Stiell IG et al. Decision rules for the use of radiography in acute ankle injuries (Ottawa ankle rules). JAMA 269(9), 1993; Delahunt E et al. Clinical assessment of acute lateral ankle sprain injuries (ROAST): 2019 consensus statement. Br J Sports Med 53(20), 2019; Vuurberg G et al. Diagnosis, treatment and prevention of ankle sprains: update of an evidence-based clinical guideline. Br J Sports Med 52(15), 2018; Sman AD et al. Diagnostic accuracy of clinical tests for ankle syndesmosis injury. Br J Sports Med 49(5), 2015; Maffulli N. The clinical diagnosis of subcutaneous tear of the Achilles tendon. Am J Sports Med 26(2), 1998; Kohls-Gatzoulis J et al. Tibialis posterior dysfunction: a common and treatable cause of adult acquired flatfoot. BMJ 329, 2004; McSweeney SC, Cichero M. Tarsal tunnel syndrome: a narrative literature review. Foot 25(4), 2015; Donnelly JM et al. Travell, Simons & Simons' Myofascial Pain and Dysfunction: The Trigger Point Manual, 3rd ed. Wolters Kluwer, 2019
reviewed_by: Chandra Matla, Registered Physiotherapist
# The document still says "DRAFT prepared 24 Sep 2026, awaiting Chandra's review"; Chandra confirmed the review on 25 Sep 2026.
reviewed_on: 2026-09-25
---

## red flags
- Is your ankle hot, red, and swollen, with a fever or feeling unwell? | emergency | Possible joint infection (septic arthritis)
- Is your calf or ankle swollen, warm, or tender, and are you also short of breath, or have chest pain or are coughing blood? | emergency | Possible blood clot that has travelled to the lung
- Has your foot suddenly become cold, pale, numb, or painful at rest? | emergency | Possible blocked artery
- Is there a hot, red area around your ankle that is spreading fast, with pain far worse than it looks, or feeling very unwell? | emergency | Possible severe skin and tissue infection
- Do you have diabetes, and is your foot or ankle hot, red, and swollen (even if it does not hurt much), or is there a wound that is not healing? | urgent | Possible Charcot foot or diabetic foot infection; same-day review protects the foot
- Is your calf or ankle swollen, warm, or tender, especially after surgery, a cast or boot, a long journey, time in bed, or starting the pill? | urgent | Possible blood clot (DVT); same-day review
- Did your ankle or big toe become suddenly hot, swollen, and very painful overnight, and have you had gout before? | urgent | Possible gout or other crystal arthritis
- Do you have heel or Achilles pain along with back stiffness in the morning, psoriasis, eye inflammation, other swollen joints, or a recent stomach bug or sexually transmitted infection? | urgent | Possible inflammatory or reactive arthritis affecting the tendons
- Have you recently taken a quinolone antibiotic (such as ciprofloxacin) or steroid tablets, and now have Achilles pain? | urgent | These medicines raise the risk of Achilles rupture; the prescriber should review
- Is your foot slapping down or your toes catching when you walk? | urgent | Foot drop (peroneal nerve or L5) needs medical review
- Do both feet feel numb, burning, or tingling, like wearing socks, especially with diabetes? | urgent | Possible peripheral neuropathy; needs medical review and foot checks
- Have you ever had cancer, or is there a lump that is growing, or deep pain at night that does not change with position? | urgent | A lump or bone lesion needs medical review

## injury screen
<!-- Built into src/data/injuryScreen.js. Asked in order; the first answer that routes ends it. -->
I1 Has your ankle been hurt in the last 6 weeks?
- No
- Yes, I rolled it inwards
- Yes, the foot twisted outwards with the foot planted
- Yes, I landed badly or fell from a height
- Yes, it felt like a kick to the back of the ankle
Route: No → skip this screen / Any Yes → I2
Why: Gate question

I2 Is the ankle out of shape, or is bone showing through the skin?
Route: Yes → EMERGENCY
Why: Possible fracture or dislocation

I3 Since the injury, is your foot cold, pale, or numb?
Route: Yes → EMERGENCY
Why: Possible artery or nerve injury

I4 Could you not take 4 steps straight after the injury, and still cannot?
Route: Yes → PHYSICIAN FIRST
Why: Ottawa ankle rule: an X-ray is needed to rule out a fracture

I5 Did it feel like a kick to the back of the ankle, and now you cannot rise onto your toes on that leg, or feel a gap in the tendon?
Route: Yes → PHYSICIAN FIRST
Why: Possible Achilles tendon rupture; early treatment matters

I6 Is the pain higher up, at the front just above the ankle between the two leg bones, and worse when pushing off or twisting?
Route: Yes → PHYSICIAN FIRST
Why: Possible high ankle (syndesmosis) sprain; some need surgery

I7 Are you under 16, with pain on the bone just above the ankle?
Route: Yes → PHYSICIAN FIRST
Why: Possible growth plate fracture: in children these are more common than sprains


## opening questions
Q: Your age?
- Under 18
- 18 to 29
- 30 to 49
- 50 to 64
- 65 or over

Q: How did it start?
- I rolled or twisted it
- Gradually, no clear reason
- After increasing running, jumping, or hill walking
- After a long walk, or standing a lot
- After new or different shoes
- After landing badly or a fall

Q: How long has it been going on?
- Less than 2 weeks
- 2 to 6 weeks
- 6 weeks to 3 months
- More than 3 months

## questions
<!-- Question ids on the site: A1 to A8. -->
Q: Where is the pain mainly?
- Outer ankle, in front of or below the bony bump
- Inner ankle, behind or below the bony bump
- Front of the ankle, in the crease
- Back of the heel, where the heel cord attaches
- Just above the ankle, at the front between the two leg bones

Q: Have you sprained this ankle before?
- Once or twice, and it recovered
- It keeps rolling, or feels like it will give way
- I rolled it recently, felt a pop, and it bruised
- Never
Ask only if: Question 1 is “Outer ankle…”, or How did it start? is “I rolled or twisted it”

Q: Which of these bring it on? Tick all that apply. (Replaces subjective S5 for the ankle.)
- Walking on uneven ground
- Running, jumping, or hopping
- Squatting, lunging, or going down stairs
- The first steps in the morning, or after sitting
- Shoes pressing on the back of the heel

Q: Some weeks after a sprain, which apply? Tick all that apply.
- It still swells after activity
- Catching or locking deep in the ankle
- A deep ache inside the ankle after activity
- It still feels unstable
- It feels back to normal
Ask only if: Question 2 is not “Never”, and it has been going on 6 weeks or more

Q: About the inner ankle: which apply? Tick all that apply.
- My arch is getting flatter on that side
- I cannot rise onto my toes on that leg as well as the other
- Swelling behind the inner ankle bone
- Burning or tingling into the sole and inner heel, worse standing
- None of these
Ask only if: Question 1 is “Inner ankle…”

Q: About the back of the heel: which apply? Tick all that apply.
- A tender bump at the back of the heel, sore in shoes
- The pain is higher, 2 to 6 cm above the heel (see the lower leg file)
- Stiff and sore for the first steps in the morning
- Creaking when I move the ankle
- None of these
Ask only if: Question 1 is “Back of the heel…”
<!-- On the site the second option reads "The pain is higher, 2 to 6 cm above the heel", with a card pointing to the Lower leg guide. -->

Q: Which of these do you notice in the foot? Tick all that apply.
- Pins and needles or numbness on the top of the foot
- Pins and needles or numbness in the sole or heel
- Burning or numbness in both feet, like socks
- The foot slaps down, or the toes catch
- None of these
Ask only if: The patient ticks “Pins and needles or numbness” or “Shooting or electric” (subjective S3), or the drawing reaches the shin, thigh, or back

Q: What does any swelling look like?
- Swelling and bruising after an injury
- Both ankles swell by the end of the day
- Swelling after activity, settling overnight
- A hot, red, swollen joint
- No swelling

## referral patterns
- Outer ankle ligaments (ATFL, CFL) → front of and below the outer ankle bone | Lateral ankle sprain | Fracture (Ottawa), peroneal tendons, base of the 5th metatarsal (foot file)
- Syndesmosis → front of the ankle, just above the joint between the two leg bones | High ankle (syndesmosis) sprain | Fracture
- Peroneal tendons → behind the outer ankle bone, sometimes snapping | Peroneal tendinopathy or tendon slipping | Outer ankle sprain, cuboid (foot file)
- Sinus tarsi → soft hollow in front of the outer ankle bone | Sinus tarsi syndrome (after repeated sprains) | Outer ankle sprain
- Front of the joint → ankle crease with squatting or lunging | Anterior ankle impingement | Talar dome cartilage lesion, ankle arthritis
- Back of the joint → back of the ankle when pointing the toes (dancers, footballers) | Posterior ankle impingement (os trigonum) | Achilles, long big-toe flexor tendon
- Talar dome → deep ankle ache, swelling, and catching weeks after a sprain | Osteochondral (cartilage and bone) lesion | Impingement, ongoing instability
- Tibialis posterior tendon → behind and below the inner ankle bone; arch flattening | Tibialis posterior tendon dysfunction | Tarsal tunnel, deltoid ligament, inner ankle arthritis
- Deltoid ligament → inner ankle after the foot twists outwards | Deltoid ligament sprain | Fracture, syndesmosis
- Tibial nerve (tarsal tunnel) → burning or tingling into the sole and inner heel, worse standing | Tarsal tunnel syndrome | S1 nerve root, plantar heel pain (foot file), neuropathy
- Achilles insertion, retrocalcaneal bursa, Haglund's bump → back of the heel | Insertional Achilles pain | Mid-portion Achilles (lower leg file), plantar heel pain
- Ankle joint (arthritis) → whole ankle, stiffness, often years after a fracture or repeated sprains | Ankle osteoarthritis | Inflammatory arthritis, impingement
- Superficial peroneal nerve → burning on the front of the ankle and top of the foot | Superficial peroneal nerve irritation (after sprains, tight boots) | L5 nerve root
- Sural nerve → outer heel and outer edge of the foot | Sural nerve irritation | S1 nerve root, peroneal tendons
- L4 nerve root → inner ankle | Nerve root pain from the low back | Tibialis posterior, deltoid ligament
- L5 nerve root → front of the ankle, top of the foot to the big toe | Nerve root pain from the low back | Superficial peroneal nerve, anterior impingement
- S1 nerve root → outer ankle, heel, and sole | Nerve root pain from the low back | Sural nerve, tarsal tunnel, peroneal tendons
- Peroneus longus and brevis → outer ankle and outer foot | Muscle trigger point referral | Peroneal tendons, outer ankle sprain
- Tibialis anterior and extensor digitorum longus → front of the ankle, top of the foot, big toe | Muscle trigger point referral | Anterior impingement, L5 nerve root
- Soleus, gastrocnemius, and tibialis posterior → heel, Achilles, and sole | Muscle trigger point referral | Achilles, plantar heel pain
- Gluteus minimus → outer leg down to the outer ankle | Muscle trigger point referral (“pseudo-sciatica”) | L5 or S1 nerve root
- Leg veins (clot) → calf and ankle swollen, warm, tender | Not musculoskeletal: red flag | Doctor first, or emergency if short of breath
- Charcot foot or diabetic infection → hot, red, swollen foot and ankle, often with little pain | Not musculoskeletal: red flag | Doctor first (same day)
- Inflammatory arthritis → Achilles or heel pain with back stiffness, psoriasis, or eye inflammation | Not musculoskeletal: red flag (enthesitis) | Doctor first

## test patients
CASE: Test patient 1
Drawing: Outer right ankle, below and in front of the bone
Answers: Age 18 to 29 · I rolled or twisted it · Less than 2 weeks; Injury screen: I1 “Yes, I rolled it inwards”; I2 to I7 No; Q1: outer ankle; Q2: I rolled it recently, felt a pop, and it bruised; Q8: swelling and bruising after an injury
Flags: None
Expect: top condition = Lateral ankle sprain; must not show = High ankle sprain; any physician-first message; route = Results + booking

CASE: Test patient 2
Drawing: Outer left ankle and the outer foot
Answers: Age 30 to 49 · I rolled or twisted it · Less than 2 weeks; Injury screen: I1 “Yes, I rolled it inwards”; I2 No; I3 No; I4 Yes
Flags: Injury screen I4 (could not take 4 steps)
Expect: top condition = None; see a doctor first; must not show = Ankle sprain results without the physician-first message; route = Physician first

CASE: Test patient 3
Drawing: Back of the right ankle and lower calf
Answers: Age 30 to 49 · After landing badly or a fall · Less than 2 weeks; Injury screen: I1 “Yes, it felt like a kick to the back of the ankle”; I2 to I4 No; I5 Yes
Flags: Injury screen I5 (possible Achilles rupture)
Expect: top condition = None; see a doctor first; must not show = Achilles tendinopathy results without the physician-first message; route = Physician first

CASE: Test patient 4
Drawing: Inner left ankle, below the bone, and the arch
Answers: Age 50 to 64 · Gradually, no clear reason · More than 3 months; Q1: inner ankle, behind or below the bony bump; Q5: my arch is getting flatter on that side; I cannot rise onto my toes on that leg as well as the other
Flags: None
Expect: top condition = Tibialis posterior tendon dysfunction; must not show = Tarsal tunnel syndrome as the top result; route = Results + booking

CASE: Test patient 5
Drawing: Outer right ankle
Answers: Age 18 to 29 · I rolled or twisted it · More than 3 months · Injury screen: I1 “No” (more than 6 weeks ago); Q1: outer ankle; Q2: it keeps rolling, or feels like it will give way; Q3: walking on uneven ground; Q4: it still feels unstable
Flags: None
Expect: top condition = Chronic ankle instability; must not show = Acute lateral ankle sprain as the top result; route = Results + booking

CASE: Test patient 6
Drawing: Whole right ankle and foot, swollen
Answers: Age 50 to 64 · Gradually, no clear reason · 2 to 6 weeks · Subjective S15: Diabetes; Q8: a hot, red, swollen joint
Flags: “Do you have diabetes, and is your foot or ankle hot, red, and swollen (even if it does not hurt much)…?”
Expect: top condition = None; see a doctor first (same day); must not show = Ankle sprain or arthritis results without the physician-first message; route = Physician first
