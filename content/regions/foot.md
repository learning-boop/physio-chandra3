---
# From "Foot assessment.docx" (Joint wise assessment folder), 25 Sep 2026.
# Built into src/data/symptomGuideExtra.js (foot, question ids B1 to B8) and src/data/injuryScreen.js (foot screen, Ottawa foot rule adapted).
# Conditions: content/conditions/foot-*.md. Body map: the sole and heel pad, and the top of the foot in front of the ankle (SOLE_TOP and FOOT_FRONT in Body3D.jsx).
# Test patients: npm run check:regions
region: foot
name: Foot & toes
source: Koc TA et al. Heel pain: plantar fasciitis, revision 2023. JOSPT 53(12), 2023; Stiell IG et al. Decision rules for the use of radiography in acute ankle injuries (Ottawa ankle and foot rules). JAMA 269(9), 1993; Warden SJ, Davis IS, Fredericson M. Management and prevention of bone stress injuries in long-distance runners. JOSPT 44(10), 2014; Welck MJ et al. Lisfranc injuries. Injury 46(4), 2015; Bhatia M, Thomson L. Morton's neuroma: current concepts review. J Clin Orthop Trauma 11(3), 2020; Richette P et al. 2016 updated EULAR evidence-based recommendations for the management of gout. Ann Rheum Dis 76(1), 2017; NICE NG19. Diabetic foot problems: prevention and management, 2015 (updated 2019); McSweeney SC, Cichero M. Tarsal tunnel syndrome: a narrative literature review. Foot 25(4), 2015; Donnelly JM et al. Travell, Simons & Simons' Myofascial Pain and Dysfunction: The Trigger Point Manual, 3rd ed. Wolters Kluwer, 2019
reviewed_by: Chandra Matla, Registered Physiotherapist
# The document still says "DRAFT prepared 24 Sep 2026, awaiting Chandra's review"; Chandra confirmed the review on 25 Sep 2026.
reviewed_on: 2026-09-25
---

## red flags
- Has your foot or toes suddenly become cold, pale, blue, or numb, or very painful at rest? | emergency | Possible blocked artery
- Is there a hot, red area on your foot that is spreading fast, with pain far worse than it looks, or feeling very unwell? | emergency | Possible severe skin and tissue infection
- Do you have diabetes, and a foot wound with spreading redness, pus, a bad smell, or a fever? | emergency | Diabetic foot infection can threaten the limb
- Did something go through your shoe into your foot (nail, glass), and is the foot now swollen, red, or painful to walk on? | urgent | Possible deep puncture infection; same-day review
- Do you have diabetes, and is your foot hot, red, or swollen (even if it does not hurt much), or is there a wound or ulcer that is not healing? | urgent | Possible Charcot foot or diabetic foot ulcer; same-day review protects the foot
- Did your big toe joint (or another joint) become suddenly hot, swollen, red, and too painful to touch, often overnight? | urgent | Possible gout
- Is a whole toe swollen like a sausage, or do you have heel pain with back stiffness, psoriasis, eye inflammation, or after a stomach bug or sexually transmitted infection? | urgent | Possible inflammatory or reactive arthritis
- Do you get a cramping pain in your foot or calf when walking that eases within minutes of standing still, or are your toes cold, shiny, and slow to heal? | urgent | Possible narrowed leg arteries
- Do both feet feel numb, burning, or tingling, like wearing socks? | urgent | Possible peripheral neuropathy; needs medical review and foot checks
- Since a foot injury, surgery, or cast, is your foot burning, swollen, shiny, changing colour or temperature, or so sensitive that light touch hurts? | urgent | Possible complex regional pain syndrome (CRPS)
- Do you run, march, or train hard, and is there pain on one foot bone (heel, midfoot, or a metatarsal) that is worse with every step or hopping, or aches at night? | urgent | Possible stress fracture; navicular and 5th metatarsal stress fractures are high-risk and need imaging
- Is your foot slapping down or your toes catching when you walk? | urgent | Foot drop (peroneal nerve or L5) needs medical review
- Is there a lump in the foot that is growing, a new dark mark under a toenail, or deep pain at night that does not change with position? | urgent | A growing lump or nail mark needs medical review

## injury screen
<!-- Built into src/data/injuryScreen.js. Asked in order; the first answer that routes ends it. -->
I1 Has your foot been hurt in the last 6 weeks?
- No
- Yes, I rolled or twisted it
- Yes, something heavy fell on it, or it was crushed
- Yes, I stubbed or jammed a toe
- Yes, I landed on it from a height, or my foot was bent under me
Route: No → skip this screen / Any Yes → I2
Why: Gate question

I2 Is the foot or a toe out of shape, or is bone showing through the skin?
Route: Yes → EMERGENCY
Why: Possible fracture or dislocation

I3 After a crush, is the foot getting tighter and more painful by the hour, with pain on moving the toes?
Route: Yes → EMERGENCY
Why: Possible compartment syndrome of the foot

I4 Could you not take 4 steps straight after the injury, and still cannot?
Route: Yes → PHYSICIAN FIRST
Why: Ottawa foot rule: an X-ray is needed to rule out a fracture

I5 Is there bruising on the sole in the middle of the foot, or pain in the middle of the foot when you stand on your toes?
Route: Yes → PHYSICIAN FIRST
Why: Possible Lisfranc (midfoot) injury; often missed and may need surgery

I6 After rolling the ankle, is the pain on the outer edge of the foot, halfway along, rather than at the ankle?
Route: Yes → PHYSICIAN FIRST
Why: Possible fracture at the base of the 5th metatarsal

I7 After the big toe was bent back hard (on artificial turf, or jammed), is it swollen and painful to push off?
Route: Yes → PHYSICIAN FIRST
Why: Possible “turf toe” (big toe joint ligament injury)


## opening questions
Q: Your age?
- Under 18
- 18 to 29
- 30 to 49
- 50 to 64
- 65 or over

Q: How did it start?
- Gradually, no clear reason
- After increasing running, walking, or standing
- After new or different shoes, or going barefoot
- After an injury (twist, crush, stubbed toe)
- It came on suddenly overnight, with swelling
- After weight gain, pregnancy, or a change in work

Q: How long has it been going on?
- Less than 2 weeks
- 2 to 6 weeks
- 6 weeks to 3 months
- More than 3 months

## questions
<!-- Question ids on the site: B1 to B8. -->
Q: Where is the pain mainly?
- Under the heel
- The arch, or the top of the midfoot
- The ball of the foot, under the toes
- The big toe joint
- Between the toes, or in the toes

Q: About the heel: which apply? Tick all that apply.
- Worst on the first steps in the morning, then eases, returns after standing
- A deep bruised feeling in the middle of the heel, worse on hard floors
- Pain when squeezing the sides of the heel, or hopping
- Burning or tingling in the heel or sole
- Heel pain in a child aged about 8 to 14, worse with sport
Ask only if: Question 1 is “Under the heel”

Q: About the ball of the foot: which apply? Tick all that apply.
- Burning, tingling, or shooting into two toes, better with shoes off
- Feels like walking on a pebble or a folded sock
- Pain under one toe joint, with swelling on top
- Pain on one bone that is worse with every step or hopping
- None of these
Ask only if: Question 1 is “The ball of the foot, under the toes”

Q: About the big toe: which apply? Tick all that apply.
- A bump on the side of the joint, the toe leaning towards the others
- Stiff, and painful when I push off or rise on my toes
- A bony lump on top of the joint
- Pain under the joint, on the small bones (sesamoids)
- Came on suddenly, hot and too tender to touch
Ask only if: Question 1 is “The big toe joint”

Q: Which of these bring it on? Tick all that apply. (Replaces subjective S5 for the foot.)
- Standing or walking a long time
- Running or jumping
- Tight, narrow, or high-heeled shoes
- Walking barefoot or on hard floors
- Rising up onto my toes

Q: Which of these do you notice in the foot? Tick all that apply.
- Pins and needles or numbness on the top of the foot
- Pins and needles or numbness in the sole or heel
- Burning or numbness in both feet, like socks
- Pain that starts in the back or buttock and travels down
- None of these
Ask only if: The patient ticks “Pins and needles or numbness” or “Shooting or electric” (subjective S3), or the drawing reaches the leg, thigh, or back

Q: Which hurts more: moving your low back, moving your ankle, or standing and walking on the foot?
- Moving my low back
- Moving my ankle
- Standing and walking on the foot
- None of these bring it on
Ask only if: Question 6 is not “None of these”, or the drawing includes the ankle, leg, or back

Q: Do any of these apply? Tick all that apply.
- I have diabetes
- My feet are often cold, pale, or slow to heal
- I have psoriasis, or other joints are swollen
- I have had gout before
- None of these

## referral patterns
- Plantar fascia → inner underside of the heel, first-step pain | Plantar heel pain (plantar fasciitis) | Fat pad, calcaneal stress fracture, Baxter's nerve, S1 nerve root
- Heel fat pad → middle of the heel, worse on hard floors and barefoot | Fat pad irritation | Plantar fascia
- Heel bone (calcaneus) → pain when squeezing the heel, or hopping | Possible calcaneal stress fracture: doctor first | Plantar fascia
- Calcaneal growth plate (child 8 to 14) → back and underside of the heel with sport | Sever's disease | Achilles insertion
- First branch of the lateral plantar nerve (Baxter's nerve) → inner heel, burning, not only first steps | Baxter's nerve entrapment | Plantar fascia, tarsal tunnel
- Tibial nerve (tarsal tunnel) → burning or tingling in the sole and heel, worse standing | Tarsal tunnel syndrome: see the ankle file | S1 nerve root, neuropathy
- Interdigital nerve (usually between the 3rd and 4th toes) → burning, tingling, or shooting into two toes | Morton's neuroma | Metatarsalgia, joint plate injury, L5 or S1 nerve root
- Metatarsal heads and joint plates → ball of the foot; one joint swollen on top | Metatarsalgia, or plantar plate injury | Morton's neuroma, stress fracture, Freiberg's disease
- Metatarsal shafts → pain on one bone, worse with every step or hopping | Possible metatarsal stress fracture: doctor first | Metatarsalgia
- Navicular → top of the midfoot, vague ache in runners | Possible navicular stress fracture: doctor first | Tibialis posterior, midfoot arthritis
- Lisfranc joints → middle of the foot, sole bruising after injury | Possible Lisfranc injury: doctor first | Midfoot sprain
- Big toe joint → bunion (hallux valgus), stiff big toe (hallux rigidus), sesamoids | Big toe joint problem | Gout (hot, sudden), turf toe
- Midfoot joints (arthritis) → top of the midfoot, bony lumps, worse with walking | Midfoot arthritis | Navicular stress fracture, tendon pain
- L4 nerve root → inner arch | Nerve root pain from the low back | Tibialis posterior
- L5 nerve root → top of the foot and the big toe | Nerve root pain from the low back | Superficial or deep peroneal nerve, midfoot
- S1 nerve root → sole, heel, and outer edge of the foot | Nerve root pain from the low back | Plantar heel pain, tarsal tunnel, sural nerve
- Deep peroneal nerve → web between the big and 2nd toes, top of the foot (tight laces) | Deep peroneal nerve irritation | L5 nerve root
- Gastrocnemius → instep (arch); soleus → heel | Muscle trigger point referral from the calf | Plantar heel pain
- Tibialis posterior, long toe flexors → sole and the underside of the toes | Muscle trigger point referral from the calf | Plantar fascia, metatarsalgia
- Long toe extensors and tibialis anterior → top of the foot and big toe | Muscle trigger point referral from the shin | Midfoot arthritis, L5 nerve root
- Abductor hallucis, quadratus plantae, flexor digitorum brevis → inner heel, heel, and ball of the foot | Foot muscle trigger point referral | Plantar heel pain, metatarsalgia
- Peroneus longus and brevis → outer edge of the foot | Muscle trigger point referral | Base of the 5th metatarsal, cuboid
- Peripheral nerves (diabetes, alcohol, vitamin B12) → both feet, burning or numb | Not musculoskeletal: peripheral neuropathy | Doctor first
- Leg arteries → cold, pale feet; foot or calf cramp on walking; pain at rest at night | Not musculoskeletal: red flag | Doctor first; emergency if sudden
- Gout, inflammatory, or reactive arthritis → hot big toe, sausage toe, heel enthesitis | Not musculoskeletal: red flag | Doctor first
- Charcot foot, diabetic ulcer, or infection → hot, swollen foot with little pain | Not musculoskeletal: red flag | Doctor first (same day); emergency if spreading infection

## test patients
CASE: Test patient 1
Drawing: Inner underside of the right heel
Answers: Age 30 to 49 · After increasing running, walking, or standing · 6 weeks to 3 months; Q1: under the heel; Q2: worst on the first steps in the morning, then eases, returns after standing
Flags: None
Expect: top condition = Plantar heel pain (plantar fasciitis); must not show = Calcaneal stress fracture; S1 nerve root pain; route = Results + booking

CASE: Test patient 2
Drawing: Ball of the left foot, into the 3rd and 4th toes
Answers: Age 50 to 64 · Gradually, no clear reason · More than 3 months · Subjective S3: Burning; Shooting or electric; Q1: the ball of the foot, under the toes; Q3: burning, tingling, or shooting into two toes, better with shoes off; Q5: tight, narrow, or high-heeled shoes
Flags: None
Expect: top condition = Morton's neuroma; must not show = Nerve root pain from the low back as the top result; route = Results + booking

CASE: Test patient 3
Drawing: Top of the right forefoot, over the 2nd metatarsal
Answers: Age 18 to 29 · After increasing running, walking, or standing · 2 to 6 weeks; Q1: the ball of the foot; Q3: pain on one bone that is worse with every step or hopping
Flags: “Do you run, march, or train hard, and is there pain on one foot bone…?”
Expect: top condition = None; see a doctor first (possible metatarsal stress fracture); must not show = Metatarsalgia without the physician-first message; route = Physician first

CASE: Test patient 4
Drawing: Right big toe joint
Answers: Age 50 to 64 · It came on suddenly overnight, with swelling · Less than 2 weeks; Q4: came on suddenly, hot and too tender to touch; Q8: I have had gout before
Flags: “Did your big toe joint become suddenly hot, swollen, red, and too painful to touch…?”
Expect: top condition = None; see a doctor first; must not show = Hallux rigidus or bunion results without the physician-first message; route = Physician first

CASE: Test patient 5
Drawing: Middle of the left foot after a fall down stairs with the foot bent under
Answers: Age 30 to 49 · After an injury · Less than 2 weeks; Injury screen: I1 “Yes, my foot was bent under me”; I2 to I4 No; I5 Yes
Flags: Injury screen I5 (possible Lisfranc injury)
Expect: top condition = None; see a doctor first; must not show = Midfoot sprain results without the physician-first message; route = Physician first

CASE: Test patient 6
Drawing: Both feet, soles and toes
Answers: Age 65 or over · Gradually, no clear reason · More than 3 months · Subjective S15: Diabetes; Q6: burning or numbness in both feet, like socks; Q8: I have diabetes
Flags: “Do both feet feel numb, burning, or tingling, like wearing socks?”
Expect: top condition = None; see a doctor first; must not show = Plantar heel pain or Morton's neuroma as the only result; route = Physician first
