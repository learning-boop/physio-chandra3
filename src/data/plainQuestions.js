/* ─────────────────────────────────────────────────────────────────────────
   Plain question design (Chandra, 8 Oct 2026: "keep the questions to the
   patient level, but the reasoning and analysis at senior expert level").
   Lower back first (prototype), then the neck, the shoulder, the knee, the
   hip, the ankle, the foot, the thigh, the lower leg, the elbow, the wrist,
   the hand, the forearm, the upper arm, the mid back (and front of the chest)
   the base of the neck and the mid-to-low back (and the flank); and drawings of several of these areas together (plainAreas).

   Runs when one of PLAIN_AREAS is the only area drawn (smartArea).
   The patient sees:
   - each group as a plain question with up to five short bullets that name
     every key sign behind it (so "No" is safe);
   - inside a group, one sign per tick, in everyday words; where a time
     limit applies to all of a question's ticks ("came on suddenly"), a short
     sub-heading carries it (SUBHEAD).
   The reasoning underneath does not change: every tick sets its original
   red flag (TICKS key), so the tiers, 911 routes, booking rules, groups and
   checks all work exactly as before. A tick that needs two things together
   to count (sudden pain AND weak bones) keeps both on one line ("combo"),
   because splitting it would send people to a doctor for an ordinary strain.

   Also: "When did this start?" after a nerve or spinal-cord sign (for the
   doctor and the "Tell them" line, not to change the route), and a "Tell
   them" sentence on the see-a-doctor and emergency screens.
   ───────────────────────────────────────────────────────────────────────── */

export const PLAIN_AREAS = ['lowerback', 'neck', 'shoulder', 'knee', 'hip', 'ankle', 'foot', 'thigh', 'lowerleg', 'elbow', 'wrist', 'hand', 'forearm', 'upperarm', 'upperback', 'ctj', 'tlj']
const ALIAS = { chest: 'upperback', flank: 'tlj' }
/** The drawn areas the plain design runs for (one or several), or null.
    Areas a mark only implies (the mid-to-low back behind a low-back mark)
    do not decide it: their questions show as ticks where they have them. */
export function plainAreas(zones = []) {
  const drawn = [...new Set(zones.filter((z) => !z.implied).map((z) => ALIAS[z.type] || z.type))]
  return drawn.length && drawn.every((a) => PLAIN_AREAS.includes(a)) ? drawn : null
}
/** One area's value from a map keyed by area, for one area or several (the first that has one). */
const pick = (obj, area) => [].concat(area || []).map((a) => obj[a]).find((v) => v !== undefined)

/* Groups: a plain question (per area where it differs), and one short
   bullet per question in the group. */
export const PLAIN_GATES = {
  'em-nerve': { lowerback: 'Since your back pain started, have you noticed any of these?', neck: 'Along with your neck pain, have you noticed any of these?', upperback: 'Along with your back pain, have you noticed any of these?', ctj: 'Along with your neck or back pain, have you noticed any of these?', tlj: 'Since your back pain started, have you noticed any of these?', any: 'Since this pain started, have you noticed any of these?' },
  'em-illness': 'Do you have any of these right now?',
  // Injury, infection or muscle signs: one neutral question, as the group can
  // hold a crash, a hot joint, a hip operation and dark pee together.
  'em-limb': 'Do you have any of these with the pain?',
  'lowback-bone': 'Could the bone be hurt or weak?',
  'lowback-infection': 'Do you feel unwell, not just sore?',
  'lowback-organ': 'Could the pain be coming from inside your body?',
  'lowback-nerve': 'Have your legs, feet or hands changed?',
  'neck-cord': 'Have your arms, legs or neck changed in a worrying way?',
  'shoulder-medical': 'Could the pain be coming from somewhere else in your body?',
  'shoulder-nerve': 'Has your arm become weak or numb?',
  'knee-infection': 'Could the knee be infected or inflamed?',
  'knee-circulation': 'Could there be a problem with the blood flow in your leg?',
  'knee-medical': 'Could something else be going on?',
  'hip-surgery': 'Could there be a problem after hip surgery, or a clot?',
  'hip-bone': 'Could the bone be hurt or weak?',
  'hip-organ': 'Could the pain be coming from your tummy or pelvis?',
  'hip-medical': 'Could something else be going on?',
  'ankle-circulation': 'Could there be a clot, or a cast that is too tight?',
  'ankle-infection': 'Could the ankle be infected or inflamed?',
  'ankle-nerve': 'Have your feet or legs changed in feeling or strength?',
  'ankle-medical': 'Could something else be going on?',
  'foot-infection': 'Could the foot be infected or inflamed?',
  'foot-circulation': 'Could it be your blood flow, or a cast that is too tight?',
  'foot-nerve': 'Have your feet or legs changed in feeling or strength?',
  'foot-medical': 'Could something else be going on?',
  'thigh-circulation': 'Could it be a clot, an infection or your blood flow?',
  'thigh-nerve': 'Has your leg changed in feeling or strength?',
  'thigh-medical': 'Could something else be going on?',
  'leg-circulation': 'Could it be a clot, an infection, a tight cast or your blood flow?',
  'leg-nerve': 'Have your feet or legs changed in feeling or strength?',
  'leg-medical': 'Could something else be going on?',
  'elbow-infection': 'Could the elbow be infected or inflamed?',
  'elbow-skin': 'Could it be a skin infection, or a cast that is too tight?',
  'elbow-nerve': 'Has your arm or hand changed in feeling or strength?',
  'wrist-circulation': 'Could it be a tight cast, or your blood flow?',
  'wrist-flare': 'Could the joints be inflamed?',
  'wrist-nerve': 'Has your hand changed in feeling or strength?',
  'wrist-medical': 'Could something else be going on?',
  'hand-circulation': 'Could it be a tight cast, a stuck ring, or your blood flow?',
  'hand-infection': 'Could the hand be infected or inflamed?',
  'hand-nerve': 'Has your hand changed in feeling or strength?',
  'hand-medical': 'Could something else be going on?',
  'forearm-skin': 'Could it be a skin infection, or a cast that is too tight?',
  'forearm-nerve': 'Has your arm or hand changed in feeling or strength?',
  'forearm-medical': 'Could something else be going on?',
  'arm-skin': 'Could it be a skin infection or a clot?',
  'arm-nerve': 'Has your arm or hand changed in feeling or strength?',
  'arm-medical': 'Could something else be going on?',
  'upperback-bone': 'Could the bone be hurt or weak?',
  'upperback-infection': 'Do you feel unwell, not just sore?',
  'upperback-organ': 'Could the pain be coming from inside your body?',
  'upperback-nerve': 'Have your legs changed in feeling or strength?',
  'ctj-arm': 'Has your arm or hand changed?',
  'ctj-organ': 'Could the pain be coming from your chest or tummy?',
  'ctj-medical': 'Could something else be going on?',
  'tlj-bone': 'Could the bone be hurt or weak?',
  'tlj-infection': 'Do you feel unwell, not just sore?',
  'tlj-organ': 'Could the pain be coming from inside your body?',
  'tlj-nerve': 'Have your legs changed in feeling or strength?',
  // Several areas drawn: their groups are merged by theme (../data/safetyGates.js).
  'multi-bone': 'Could the bone be hurt or weak?',
  'multi-infection': 'Do you feel unwell, not just sore?',
  'multi-organ': 'Could the pain be coming from inside your body?',
  'multi-nerve': 'Have your arms, legs, feet or hands changed?',
  'multi-medical': 'Could something else be going on?',
  'multi-circulation': 'Could there be a clot, a blood flow problem, or a problem after surgery?',
}
/** A group's plain question for this area. */
export const gateQ = (gid, area) => {
  const q = PLAIN_GATES[gid]
  return typeof q === 'string' || !q ? q : pick(q, area) || q.any || Object.values(q)[0]
}
/* "I have … pain" in the Tell them line. */
export const AREA_WORD = { lowerback: 'low back', neck: 'neck', shoulder: 'shoulder', knee: 'knee', hip: 'hip', ankle: 'ankle', foot: 'foot', thigh: 'thigh', lowerleg: 'lower leg', elbow: 'elbow', wrist: 'wrist', hand: 'hand', forearm: 'forearm', upperarm: 'upper arm', upperback: 'mid back', ctj: 'neck and upper back', tlj: 'mid-to-low back' }
/** "low back pain", or "low back and hip pain" for several areas. */
export const painWord = (area) => {
  const w = [...new Set([].concat(area || []).map((a) => AREA_WORD[a]).filter(Boolean))]
  return w.length ? `${w.length === 1 ? w[0] : `${w.slice(0, -1).join(', ')} and ${w[w.length - 1]}`} pain` : 'pain'
}

export const PLAIN_SHORT = {
  // Emergency: nerves at the bottom of the back
  'rf-saddle': 'Numb between your legs or around your bottom',
  'rf-bladder': 'Trouble with your pee or poo',
  'rf-sexual': 'Less feeling, or new trouble, during sex',
  'rf-legs': 'Pain in both legs, or a leg getting weaker fast',
  'jrf-conus-legs': 'Both legs suddenly weak or numb',
  // Emergency: sudden illness
  'rf-aaa': 'Sudden, very bad pain, and feeling faint',
  'jrf-aorta': 'Sudden tearing pain in your back',
  'jrf-pancreas': 'Very bad upper tummy pain, and being sick',
  'jrf-testis': 'Sudden, very bad pain in a testicle',
  'pc-stroke': 'A drooping face, one weak side, slurred speech, or sight loss',
  // Emergency: accident
  'rf-fracture': 'A crash or bad fall in the last few days',
  // See a doctor
  'rf-osteo': 'Sudden pain after a small strain or slip, with weak bones or older age',
  'sc-trauma': 'A bad fall or accident',
  'rf-cancer': 'Cancer in the past, and this back pain is new',
  'rf-spondy': 'Under 20, and it hurts to bend backwards',
  'rf-infection': 'Fever, or a higher chance of infection',
  'sc-systemic': { lowerback: 'Weight loss, a growing lump, or bad night pain', knee: 'Fever, weight loss, a growing lump, or bad night pain', ankle: 'Fever, or weight loss without trying', foot: 'Fever, weight loss, or past cancer', hand: 'Fever, weight loss, night pain, or past cancer', upperback: 'Weight loss, a growing lump, or bad night pain', tlj: 'Weight loss, a growing lump, or bad night pain', thigh: 'Fever, weight loss, a growing lump, or bad night pain', lowerleg: 'Fever, weight loss, a growing lump, or bad night pain', any: 'Fever, weight loss, a lump, night pain, or past cancer' },
  'rf-kidney': 'Pain in waves to the groin, burning or bloody pee, or fever',
  'rf-pelvic': { female: 'Pain with your periods, or unusual bleeding', male: 'New trouble peeing', any: 'Pain with periods, unusual bleeding, or trouble peeing' },
  'pc-visceral': 'Pain that never changes, or feeling sick',
  'rf-aaa-slow': 'A deep ache that never changes, or a pulsing tummy',
  'rf-footdrop': 'Your foot slaps down or your toes catch',
  'rf-myelo': 'Clumsy hands, unsteady walking, or neck pain too',
  'sc-neuro': 'New weakness or numbness in an arm or leg',
  'jrf-legs': 'Legs slowly getting stiff or heavy',
  'jrf-shingles': 'A band of burning pain with a rash',
  // Neck
  'nrf-stroke': 'A sudden bad headache, drooping face, weak side, or trouble speaking or seeing',
  'nrf-cord': 'You cannot hold your pee or poo',
  'nrf-cord-legs': 'Both legs, or hands and feet, numb or weak, or trouble breathing',
  'nrf-mening': 'A fever with a stiff neck or a rash',
  'nrf-cardiac': 'Pain that comes with effort, or with chest pain',
  'nrf-after': 'Bad signs after a neck crack, crash or knock',
  'nrf-after-doc': 'Dizziness or a new headache since an injury',
  'nrf-myelo': 'An arm, hand or leg quickly getting weak or clumsy',
  'nrf-upperinstab': 'A head too heavy to hold, or tingling lips',
  // Shoulder
  'rf-cardiac1': 'Pain that comes with effort, or chest tightness',
  'srf-kehr': 'Shoulder-tip pain after a blow, or feeling faint',
  'srf-ectopic': 'Could be pregnant, with low tummy pain',
  'srf-lung': 'Sudden sharp pain on breathing, and breathless',
  'srf-rhabdo': 'Very sore or weak muscles, and dark pee',
  'rf-hotjoint': 'A hot, red, swollen joint with a fever or feeling unwell',
  'srf-pmr': 'Both shoulders stiff each morning, and feeling unwell',
  'srf-pancoast': 'A smoker with a lasting cough, coughed-up blood, droopy eyelid or weak hand',
  'srf-organ': 'Pain with meals, breathing, sickness, yellow skin, or that never changes',
  'srf-pta': 'Sudden bad pain, then a weak or thin arm',
  // Knee
  'kf-compartment': 'Pain still climbing after an injury, cast, operation, lying still long, or hard exercise',
  'kf-septic': 'A hot, red, swollen knee with a fever or feeling unwell',
  'kf-pe': 'A swollen calf, with breathlessness, chest pain or coughing blood',
  'kf-cauda': 'Numb between your legs, or new trouble with pee or poo',
  'kf-dvt': 'A swollen, warm or tender calf',
  'kf-artery': 'A pulsing lump behind the knee, or calf cramps when walking',
  'kf-replacement': 'A knee replacement newly sore, warm, swollen or leaking',
  'kf-gout': 'A knee suddenly hot and swollen overnight, with past gout',
  'kf-inflam': 'Other swollen joints, a rash, sore eyes, or a recent infection',
  'kf-cancer': 'Past cancer, or night pain with weight loss',
  'kf-tumour': 'Under 25 with a night ache, or a growing lump',
  'kf-stress': 'A runner with a deep ache above the knee',
  'kf-sufe': 'A child or teenager limping, with knee or hip pain',
  'kf-perthes': 'A child or teenager limping, with knee or hip pain',
  // Hip
  'hpf-aaa': 'Sudden, very bad back, tummy or groin pain, and feeling faint',
  'hpf-septic': 'A very painful hip with a fever, or a feverish child not walking',
  'hpf-ectopic': 'Could be pregnant, with sudden one-sided low pain or bleeding',
  'hpf-torsion': 'Sudden, very bad pain in a testicle',
  'hpf-strangulated': 'A groin lump that will not go back in, or with vomiting',
  'hpf-dislocation': 'After a hip operation: a clunk, or cannot stand on the leg',
  'hpf-rhabdo': 'Very sore or weak muscles, and dark pee',
  'hpf-replacement': 'After a hip operation: newly sore, warm, leaking, or a fever',
  'hpf-nofall': 'Sudden pain after a small strain or slip, with weak bones or older age',
  'hpf-sufe': 'A child or teenager limping, with hip, thigh or knee pain',
  'hpf-stress': 'A runner with a deep groin ache',
  'hpf-avn': 'Deep groin ache with steroids, alcohol, sickle cell, lupus, transplant or old hip injury',
  'hpf-dvt': 'A swollen, warm or tender calf or thigh',
  'hpf-hernia': 'A soft groin lump when you cough or strain',
  'hpf-kidney': 'Pain in waves to the groin, or burning or bloody pee',
  'hpf-pelvic': 'Groin pain with periods, or unusual bleeding or discharge',
  'hpf-cancer': 'Past cancer, or night pain with weight loss',
  'hpf-cauda': 'Numb between your legs, or new trouble with pee or poo',
  // The mid-to-low back's emergency questions (asked with a low-back mark)
  'jrf-aaa': 'Sudden, very bad back, tummy or side pain, and feeling faint',
  'jrf-conus': 'Cannot hold your pee or poo, or numb between your legs',
  'jrf-fracture': 'A crash or bad fall in the last few days',
  // Ankle
  'af-compartment': 'Pain still climbing after an injury, cast, operation, lying still long, or hard exercise',
  'af-septic': 'A hot, red, swollen ankle with a fever or feeling unwell',
  'af-pe': 'A swollen calf or ankle, with breathlessness, chest pain or coughing blood',
  'af-ischaemia': 'A foot suddenly cold, pale, numb, or painful at rest',
  'af-necfasc': 'A hot red area spreading fast, with bad pain or feeling unwell',
  'af-cast': 'A cast, splint or bandage getting tighter and more painful',
  'af-dvt': 'A swollen, warm or tender calf or ankle',
  'af-charcot': 'Diabetes, with a hot, swollen foot or a wound not healing',
  'af-gout': 'An ankle or big toe suddenly hot and swollen, with past gout',
  'af-inflam': 'Heel pain with a stiff back, psoriasis, sore eyes, swollen joints or recent infection',
  'af-quinolone': 'Achilles pain after a ciprofloxacin-type antibiotic or steroid tablets',
  'af-footdrop': 'Your foot slaps down or your toes catch',
  'af-neuropathy': 'Both feet numb or burning, like wearing socks',
  'af-stress': 'More running or walking, and pain on one spot of bone',
  'af-cancer': 'Past cancer, a growing lump, or night pain',
  'af-crps': 'Since an injury or cast: burning, swelling, colour change, or touch hurts',
  // Foot
  'ft-compartment': 'Pain still climbing after an injury, cast, operation, lying still long, or hard exercise',
  'ft-ischaemia': 'Foot or toes suddenly cold, pale, blue, numb, or painful at rest',
  'ft-necfasc': 'A hot red area spreading fast, with bad pain or feeling unwell',
  'ft-diabeticinfection': 'Diabetes, and an infected foot wound or a fever',
  'ft-cast': 'A cast, splint or bandage getting tighter and more painful',
  'ft-puncture': 'Something went through your shoe, and the foot is now swollen or red',
  'ft-charcot': 'Diabetes, with a hot, swollen foot or a wound not healing',
  'ft-gout': 'A big toe or joint suddenly hot, red, swollen and too sore to touch',
  'ft-inflam': 'A sausage toe, or heel pain with stiff back, psoriasis, sore eyes or infection',
  'ft-claudication': 'Foot or calf cramps when walking, or cold, shiny toes',
  'ft-neuropathy': 'Both feet numb or burning, like wearing socks',
  'ft-crps': 'Since an injury or cast: burning, swelling, colour change, or touch hurts',
  'ft-stress': 'More running or walking, and pain on one foot bone',
  'ft-footdrop': 'Your foot slaps down or your toes catch',
  'ft-lump': 'A growing lump, a dark mark under a nail, or night pain',
  // Thigh
  'tgf-pe': 'A swollen thigh or calf, with breathlessness, chest pain or coughing blood',
  'tgf-compartment': 'Thigh pain still climbing, thigh hard, after a knock, operation or hard exercise',
  'tgf-rhabdo': 'Very sore or weak muscles, and dark pee',
  'tgf-necfasc': 'A hot red area spreading fast, with bad pain or feeling unwell',
  'tgf-cauda': 'Numb between your legs, or new trouble with pee or poo',
  'tgf-dvt': 'A swollen, warm or tender thigh or calf',
  'tgf-cellulitis': 'Spreading redness, a red streak or a hot swollen area, with a fever',
  'tgf-claudication': 'Thigh cramps when walking, if you smoke or have diabetes',
  'tgf-femoral': 'A weak or thin thigh muscle, or a knee giving way',
  'tgf-stress': 'A runner with a deep thigh ache',
  'tgf-tumour': 'Under 25 with a night ache, or a growing thigh lump',
  'tgf-sufe': 'A child or teenager limping, with thigh or knee pain',
  'tgf-cancer': 'Past cancer, or night pain with weight loss',
  // Lower leg
  'lgf-pe': 'A swollen calf, with breathlessness, chest pain or coughing blood',
  'lgf-compartment': 'Pain still climbing after an injury, cast, operation, lying still long, or hard exercise',
  'lgf-rhabdo': 'Very sore or weak muscles, and dark pee',
  'lgf-ischaemia': 'Foot or lower leg suddenly cold, pale, numb, or painful at rest',
  'lgf-necfasc': 'A hot red area spreading fast, with bad pain or feeling unwell',
  'lgf-cauda': 'Numb between your legs, or new trouble with pee or poo',
  'lgf-cast': 'A cast, splint or bandage getting tighter and more painful',
  'lgf-dvt': 'A swollen, warm or tender calf',
  'lgf-cellulitis': 'Spreading redness, a red streak, a hot area with fever, or an ulcer',
  'lgf-claudication': 'Calf cramps when walking, if you smoke, have diabetes or are over 50',
  'lgf-stress': 'A runner with a sore spot on the shin bone',
  'lgf-footdrop': 'Your foot slaps down or your toes catch',
  'lgf-neuropathy': 'Both feet numb or burning, like wearing socks',
  'lgf-tumour': 'Under 25 with a night ache, or a growing shin lump',
  'lgf-cancer': 'Past cancer, or night pain with weight loss',
  // Pattern questions the drawing raises (../data/patternChecks.js)
  'pc-lowhormone': 'Months of tiredness or weaker muscles, after a head injury, brain tumour or similar',
  'pc-calcium': 'A deep bone ache on both sides, at rest and on your feet',
  'pc-hypothyroid': 'Months of stiff, slow muscles or numb hands at night, with cold or tiredness',
  'pc-acromegaly': 'Hands, feet or face grown bigger over the years',
  // Elbow
  'erf-hot': 'A hot, red, swollen joint with a fever or feeling unwell',
  'erf-compartment': 'Arm pain still climbing after an injury, cast, operation, lying still, or hard exercise',
  'erf-cast': 'A cast, splint or bandage getting tighter and more painful',
  'erf-cellulitis': 'Spreading redness, a red streak or a hot swollen area, with a fever',
  'erf-bursa': 'A red or warm swelling on the elbow point, or a cut over it',
  'erf-gout': 'A joint suddenly hot and swollen overnight, with past gout',
  'erf-nerve': 'A weaker hand, a thinning thumb muscle, constant numbness, or a dropped wrist',
  'erf-myelo': 'Both hands numb or clumsy, or unsteady walking',
  'erf-child': 'Under 16, with elbow pain from throwing, or catching or locking',
  'erf-pta': 'Sudden bad pain, then a weak arm',
  // Wrist
  'wrf-stroke': 'A drooping face, one weak or numb side, or trouble speaking',
  'wrf-hot': 'A hot, red, swollen joint with a fever or feeling unwell',
  'wrf-bite': 'A cut or bite on the hand, now swollen, red and very painful',
  'wrf-compartment': 'Arm pain still climbing after an injury, cast, operation, lying still, or hard exercise',
  'wrf-cast': 'A cast, splint or bandage getting tighter and more painful',
  'wrf-raynaud': 'Fingers turning white or blue in attacks, or a cold painful finger',
  'wrf-gout': 'A joint suddenly hot, red, swollen and very painful',
  'wrf-inflam': 'Both wrists or several finger joints swollen and stiff each morning',
  'wrf-numb': 'A weaker hand, a thinning thumb muscle, constant numbness, or a dropped wrist',
  'wrf-myelo': 'Both hands numb or clumsy most of the day, or unsteady walking',
  'wrf-crps': 'Since an injury or cast: burning, swelling, colour change, or touch hurts',
  'wrf-oldscaphoid': 'Thumb-base pain since an old fall, never X-rayed',
  'wrf-stress': 'A gymnast with a deep ache just above the wrist',
  // A whole painful limb (pattern question, ../data/patternChecks.js)
  'pc-limb': 'The painful arm or leg changing colour, temperature, sweating or swelling',
  'pc-hand-procedure': 'After a hand procedure: infection, a numb fingertip, or a finger that won\'t bend',
  // Hand
  'hnd-compartment': 'Arm pain still climbing after an injury, cast, operation, lying still, or hard exercise',
  'hnd-bite': 'A whole finger swollen, bent and very painful to straighten',
  'hnd-inject': 'Paint or grease forced into the hand under pressure, even a tiny wound',
  'hnd-hot': 'A hot, red, swollen joint with a fever or feeling unwell',
  'hnd-cast': 'A cast, splint or bandage getting tighter and more painful',
  'hnd-felon': 'A tense, throbbing fingertip, or pus around a nail',
  'hnd-gout': 'A joint suddenly hot and swollen overnight, with past gout',
  'hnd-inflam': 'Knuckles in both hands stiff each morning, or a sausage finger',
  'hnd-raynaud': 'Fingers going white then blue in the cold, or a fingertip sore',
  'hnd-coldfinger': 'One finger cold, white or blue and painful, not warming up',
  'hnd-ring': 'A ring stuck on a swelling finger',
  'hnd-crps': 'Since an injury or cast: burning, swelling, colour change, or touch hurts',
  'hnd-lump': 'A growing, painful or large lump, or a dark streak under a nail',
  // Forearm
  'frf-necfasc': 'A hot red area spreading fast, with bad pain or feeling unwell',
  'frf-cardiac': 'Left arm pain with effort, or with chest tightness or breathlessness',
  'frf-stroke': 'A drooping face, one weak or numb side, or trouble speaking',
  'frf-nerve': 'A weaker hand, a dropped wrist, or cannot make an OK sign',
  'frf-pancoast': 'A smoker with little-finger-side arm pain and a cough or droopy eyelid',
  'frf-stress': 'A young gymnast with pinpoint forearm bone pain',
  'frf-shingles': 'A band of burning pain with a rash',
  // Upper arm
  'arf-cardiac': 'Arm pain with effort, or with chest tightness, breathlessness or jaw pain',
  'arf-clotlung': 'A suddenly swollen, bluish arm, with breathlessness or chest pain',
  'arf-clot': 'A whole arm swollen, heavy or bluish over a day or two',
  'arf-pancoast': 'A smoker with arm pain to the little finger, and cough or droopy eyelid',
  'arf-pta': 'Sudden bad pain, then a weak or thin arm',
  'arf-shingles': 'A band of burning pain with a rash',
  // Mid back (and front of the chest)
  'trf-aorta': 'Sudden tearing pain in your back',
  'trf-cardiac': 'Pain with chest tightness or breathlessness, or with effort',
  'trf-lung': 'Sudden sharp pain on breathing, and breathless',
  'trf-cord': 'You cannot hold your pee or poo',
  'trf-fracture': 'A crash, fall from a height, or hard blow in the last few days',
  'trf-cancer': 'Cancer in the past, and this back pain is new',
  'trf-osteo': 'Sudden pain after a small strain or slip, with weak bones or older age',
  'trf-infection': 'Fever, a weak immune system, or injected drugs',
  'trf-kidney': 'Side or lower-rib pain with a fever, or burning or bloody pee',
  'trf-gut': 'Pain with eating, heartburn, black poo, or after fatty meals',
  // Base of the neck
  'crf-aorta': 'Sudden tearing pain between your shoulder blades',
  'crf-cardiac': 'Pain with chest tightness or breathlessness, or with effort',
  'crf-cord-legs': 'Both legs suddenly weak, numb or unsteady',
  'crf-trauma5d': 'Getting worse since a crash or knock: dizziness, double vision, slurred speech',
  'crf-trauma5d-doc': 'Since a crash or knock: dizziness that comes back, or other new signs',
  'crf-pancoast': 'A smoker with a lasting cough, coughed-up blood, or droopy eyelid',
  'crf-osteo': 'Sudden pain after a small strain, with weak bones or steroids',
  'crf-wasting': 'Thinning hand muscles, or a weak grip',
  'crf-vascular': 'An arm turning pale, blue, cold or swollen, especially when raised',
  'crf-oesophagus': 'Pain when swallowing, or food sticking',
}

/* Several areas drawn: the same question from each area (the knee's,
   ankle's and foot's gout questions) shares one area-neutral bullet, so a
   merged group names each sign once. The ticks inside keep their own area. */
const fam = (ids, text) => Object.fromEntries(ids.map((id) => [id, text]))
export const MULTI_SHORT = {
  ...fam(['kf-septic', 'af-septic', 'rf-hotjoint', 'erf-hot', 'wrf-hot', 'hnd-hot'], 'A hot, red, swollen joint with a fever or feeling unwell'),
  ...fam(['kf-compartment', 'af-compartment', 'ft-compartment', 'lgf-compartment', 'tgf-compartment'], 'Pain still climbing after an injury, cast, operation, lying still long, or hard exercise'),
  ...fam(['kf-stress', 'af-stress', 'ft-stress', 'lgf-stress', 'tgf-stress', 'hpf-stress'], 'More running or training, and a deep ache or sore spot on a bone'),
  ...fam(['kf-tumour', 'lgf-tumour', 'tgf-tumour'], 'Under 25 with a deep night ache, or a growing lump'),
  ...fam(['kf-gout', 'af-gout', 'ft-gout', 'erf-gout', 'wrf-gout', 'hnd-gout'], 'A joint or big toe suddenly hot, red and swollen, often overnight'),
  ...fam(['kf-inflam', 'af-inflam', 'ft-inflam'], 'Other swollen joints, sausage toe, heel pain, a rash, sore eyes or recent infection'),
  ...fam(['rf-aaa', 'hpf-aaa', 'jrf-aaa', 'trf-aorta', 'jrf-aorta', 'crf-aorta'], 'Sudden tearing or very bad back or tummy pain, or feeling faint'),
  ...fam(['trf-cardiac', 'rf-cardiac1', 'nrf-cardiac', 'arf-cardiac', 'frf-cardiac', 'trf-lung', 'srf-lung', 'crf-cardiac', 'crf-lung'], 'Chest tightness, breathlessness, sweating, effort or jaw pain, or sharp pain on breathing'),
  ...fam(['rf-osteo', 'hpf-nofall', 'trf-osteo', 'crf-osteo', 'jrf-osteo'], 'Sudden pain after a small strain or slip, with weak bones or older age'),
  ...fam(['kf-sufe', 'kf-perthes', 'hpf-sufe', 'tgf-sufe'], 'A child or teenager limping, with hip, thigh or knee pain'),
  ...fam(['kf-cancer', 'af-cancer', 'lgf-cancer', 'tgf-cancer', 'hpf-cancer'], 'Past cancer, a growing lump, or deep night pain'),
  ...fam(['erf-nerve', 'wrf-numb', 'hnd-numb', 'frf-nerve'], 'A weaker hand, thinning thumb muscle, constant numbness, dropped wrist, or no OK sign'),
  ...fam(['erf-myelo', 'wrf-myelo', 'hnd-myelo', 'frf-myelo'], 'Both hands numb or clumsy, or unsteady walking'),
}

/** A bullet, for this area or birth sex where it differs; when it carries
    over a covered question's sign, the bullet that names it too. */
export const shortFor = (qid, sex, area, covered = []) => {
  const c = covered.find((x) => COVERED[x] && COVERED[x].short && [].concat(COVERED[x].by).includes(qid))
  const s = c ? COVERED[c].short : PLAIN_SHORT[qid]
  // Several areas drawn: one area-neutral bullet for a family of questions.
  if (!c && Array.isArray(area) && area.length > 1 && MULTI_SHORT[qid]) return MULTI_SHORT[qid]
  return typeof s === 'string' || !s ? s : pick(s, area) || s[sex] || s.any
}

/* A short plain heading for a question shown on its own (no group) whose
   signs are split into several ticks. */
export const PLAIN_Q = {
  'rf-fracture': 'Did this start in the last few days after one of these?',
  'pc-stroke': 'Has one of these started in the last few hours?',
  'sc-trauma': 'Has one of these happened?',
  'rf-infection': 'Do any of these fit you?',
  'sc-systemic': 'Do any of these fit you?',
  'rf-kidney': 'Do any of these fit you?',
  'rf-pelvic': 'Do any of these fit you?',
  'rf-myelo': 'Have any of these changed?',
  'sc-neuro': 'Have any of these changed?',
  'rf-saddle': 'Have you noticed any of these?',
  'rf-bladder': 'Have you noticed any of these?',
  'rf-sexual': 'Have you noticed any of these?',
  'rf-legs': 'Have you noticed any of these?',
  'rf-aaa-slow': 'Do any of these fit you?',
  'pc-visceral': 'Do any of these fit you?',
  'nrf-stroke': 'Has one of these come on suddenly since this started?',
  'nrf-cord': 'Along with the neck pain, have you noticed any of these?',
  'nrf-cord-legs': 'Along with the neck pain, have you noticed any of these?',
  'nrf-cardiac': 'Do any of these fit you?',
  'nrf-after': 'After a neck "crack", a crash, a sudden jerk or a knock to the head or neck: is one of these new in the last few days, or getting worse fast?',
  'nrf-after-doc': 'Do any of these fit you?',
  'nrf-myelo': 'Over the last few days or weeks, has one of these happened quickly?',
  'nrf-upperinstab': 'Do any of these fit you?',
  'rf-cardiac1': 'Do any of these fit you?',
  'rf-hotjoint': 'Do any of these fit you?',
  'srf-organ': 'Do any of these fit you?',
  'kf-cauda': 'Have you noticed any of these?',
  'kf-compartment': 'In the last day or two, after a broken bone, a crush, an operation, a tight cast or bandage, lying on the leg for a long time, a knock while on blood thinners, or very hard exercise: does one of these fit?',
  'kf-artery': 'Do any of these fit you?',
  'kf-inflam': 'Do any of these fit you?',
  'kf-cancer': 'Do any of these fit you?',
  'kf-tumour': 'Do any of these fit you?',
  'hpf-septic': 'Do any of these fit you?',
  'hpf-strangulated': 'Do any of these fit you?',
  'hpf-dislocation': 'After a hip replacement or a hip fracture operation, has one of these happened?',
  'hpf-kidney': 'Do any of these fit you?',
  'hpf-pelvic': 'Do any of these fit you?',
  'hpf-cancer': 'Do any of these fit you?',
  'hpf-cauda': 'Have you noticed any of these?',
  'jrf-conus': 'Have you noticed any of these?',
  'jrf-fracture': 'Did this start in the last few days after one of these?',
  'af-compartment': 'In the last day or two, after a broken bone, a crush, an operation, a tight cast or bandage, lying on the leg for a long time, a knock while on blood thinners, or very hard exercise: does one of these fit?',
  'af-necfasc': 'Do any of these fit you?',
  'af-inflam': 'Do any of these fit you?',
  'af-cancer': 'Do any of these fit you?',
  'ft-compartment': 'In the last day or two, after a broken bone, a crush, an operation, a tight cast or bandage, lying on the leg for a long time, a knock while on blood thinners, or very hard exercise: does one of these fit?',
  'ft-ischaemia': 'Do any of these fit you?',
  'ft-necfasc': 'Do any of these fit you?',
  'ft-charcot': 'Do any of these fit you?',
  'ft-inflam': 'Do any of these fit you?',
  'ft-claudication': 'Do any of these fit you?',
  'ft-lump': 'Do any of these fit you?',
  'tgf-compartment': 'In the last day or two, after a heavy knock, a crush, a broken bone, an operation, lying on the leg for a long time, a knock while on blood thinners, or very hard exercise: does this fit?',
  'tgf-necfasc': 'Do any of these fit you?',
  'tgf-cauda': 'Have you noticed any of these?',
  'tgf-cellulitis': 'Do any of these fit you?',
  'tgf-femoral': 'Do any of these fit you?',
  'tgf-tumour': 'Do any of these fit you?',
  'tgf-cancer': 'Do any of these fit you?',
  'lgf-compartment': 'In the last day or two, after a broken bone, a crush, an operation, a tight cast or bandage, lying on the leg for a long time, a knock while on blood thinners, or very hard exercise: does one of these fit?',
  'lgf-ischaemia': 'Do any of these fit you?',
  'lgf-necfasc': 'Do any of these fit you?',
  'lgf-cauda': 'Have you noticed any of these?',
  'lgf-cellulitis': 'Do any of these fit you?',
  'lgf-tumour': 'Do any of these fit you?',
  'lgf-cancer': 'Do any of these fit you?',
  'pc-lowhormone': 'Not explained by something a doctor has already found: for a few months, tiredness most days that sleep does not fix, or muscles smaller or weaker on both sides, and one of these:',
  'pc-calcium': 'Not explained by something a doctor has already found: a deep ache in the bones on both sides (shins, thighs, hips, pelvis, back or ribs), there at rest and worse on your feet, and one of these:',
  'pc-hypothyroid': 'Not explained by something a doctor has already found. "These signs" are: feeling cold when others are not, tiredness, weight gain without eating more, dry skin or hair loss, constipation, heavier periods, low mood or slow thinking, a hoarse voice, or puffy eyes.',
  'erf-compartment': 'In the last day or two, after a broken bone, a crush, an operation, a tight cast or bandage, lying on the arm for a long time, a knock while on blood thinners, or very hard exercise: does one of these fit?',
  'erf-cellulitis': 'Do any of these fit you?',
  'erf-nerve': 'Do any of these fit you?',
  'erf-myelo': 'Do any of these fit you?',
  'erf-child': 'Do any of these fit you?',
  'wrf-stroke': 'Along with the hand symptoms, has one of these happened suddenly?',
  'wrf-compartment': 'In the last day or two, after a broken bone, a crush, an operation, a tight cast or bandage, lying on the arm for a long time, a knock while on blood thinners, or very hard exercise: does one of these fit?',
  'wrf-raynaud': 'Do any of these fit you?',
  'wrf-numb': 'Do any of these fit you?',
  'wrf-myelo': 'Do any of these fit you?',
  'pc-hand-procedure': 'Since the procedure on your hand, has one of these happened?',
  'hnd-compartment': 'In the last day or two, after a broken bone, a crush, an operation, a tight cast or bandage, lying on the arm for a long time, a knock while on blood thinners, or very hard exercise: does one of these fit?',
  'hnd-raynaud': 'Do any of these fit you?',
  'hnd-felon': 'Do any of these fit you?',
  'hnd-inflam': 'Do any of these fit you?',
  'hnd-lump': 'Do any of these fit you?',
  'frf-necfasc': 'Do any of these fit you?',
  'frf-cardiac': 'Do any of these fit you?',
  'frf-stroke': 'Along with the arm symptoms, has one of these happened suddenly?',
  'frf-nerve': 'Do any of these fit you?',
  'arf-cardiac': 'Do any of these fit you?',
  'trf-cardiac': 'Do any of these fit you?',
  'trf-fracture': 'Did this start in the last few days after one of these?',
  'trf-infection': 'Do any of these fit you?',
  'trf-kidney': 'Do any of these fit you?',
  'trf-gut': 'Do any of these fit you?',
  'crf-cardiac': 'Do any of these fit you?',
  'crf-trauma5d': 'Since a car accident or a hard knock to your head or neck, getting quickly worse or new in the last few days: has one of these happened?',
  'crf-trauma5d-doc': 'Since a car accident or a hard knock to your head or neck, even if not getting worse: has one of these happened?',
  'crf-wasting': 'Do any of these fit you?',
  'crf-vascular': 'Do any of these fit you?',
  'crf-oesophagus': 'Do any of these fit you?',
  'pc-acromegaly': 'Not explained by something a doctor has already found: over the past few years, your hands or feet have grown (rings, gloves or shoes no longer fit) or your jaw, brow or nose has become heavier, and one of these:',
}

/* Inside a group: a sub-heading over a question's ticks, where a limit
   applies to all of them. */
export const SUBHEAD = {
  'nrf-stroke': 'Came on suddenly since this started:',
  'nrf-after': 'After a neck "crack", a crash, a jerk or a knock to the head, new in the last few days or getting worse fast:',
  'nrf-myelo': 'Happening quickly, over days or weeks:',
  'pc-stroke': 'Started in the last few hours:',
  'kf-compartment': 'In the last day or two, after a broken bone, a crush, an operation, a tight cast or bandage, lying on the leg a long time, a knock on blood thinners, or very hard exercise:',
  'hpf-dislocation': 'After a hip replacement or a hip fracture operation:',
  'rf-fracture': 'In the last few days:',
  'jrf-fracture': 'In the last few days:',
  'af-compartment': 'In the last day or two, after a broken bone, a crush, an operation, a tight cast or bandage, lying on the leg a long time, a knock on blood thinners, or very hard exercise:',
  'ft-compartment': 'In the last day or two, after a broken bone, a crush, an operation, a tight cast or bandage, lying on the leg a long time, a knock on blood thinners, or very hard exercise:',
  'tgf-compartment': 'In the last day or two, after a heavy knock, a crush, a broken bone, an operation, lying on the leg a long time, a knock on blood thinners, or very hard exercise:',
  'lgf-compartment': 'In the last day or two, after a broken bone, a crush, an operation, a tight cast or bandage, lying on the leg a long time, a knock on blood thinners, or very hard exercise:',
  'pc-lowhormone': 'Not explained by something a doctor has already found: for a few months, tiredness most days that sleep does not fix, or muscles smaller or weaker on both sides, and one of these:',
  'pc-calcium': 'Not explained by something a doctor has already found: a deep ache in the bones on both sides (shins, thighs, hips, pelvis, back or ribs), there at rest and worse on your feet, and one of these:',
  'pc-hypothyroid': 'Not explained by something a doctor has already found. "These signs" are: feeling cold when others are not, tiredness, weight gain without eating more, dry skin or hair loss, constipation, heavier periods, low mood or slow thinking, a hoarse voice, or puffy eyes.',
  'pc-acromegaly': 'Not explained by something a doctor has already found: over the past few years, your hands or feet have grown (rings, gloves or shoes no longer fit) or your jaw, brow or nose has become heavier, and one of these:',
  'erf-compartment': 'In the last day or two, after a broken bone, a crush, an operation, a tight cast or bandage, lying on the arm a long time, a knock on blood thinners, or very hard exercise:',
  'wrf-stroke': 'Along with the hand symptoms, suddenly:',
  'wrf-compartment': 'In the last day or two, after a broken bone, a crush, an operation, a tight cast or bandage, lying on the arm a long time, a knock on blood thinners, or very hard exercise:',
  'pc-hand-procedure': 'Since the procedure on your hand:',
  'hnd-compartment': 'In the last day or two, after a broken bone, a crush, an operation, a tight cast or bandage, lying on the arm a long time, a knock on blood thinners, or very hard exercise:',
  'frf-stroke': 'Along with the arm symptoms, suddenly:',
  'trf-fracture': 'In the last few days:',
  'crf-trauma5d': 'Since a car accident or a hard knock to your head or neck, getting quickly worse or new in the last few days:',
  'crf-trauma5d-doc': 'Since a car accident or a hard knock to your head or neck, even if not getting worse:',
}

/* One sign per tick. `tell` is the patient's own sentence for the doctor
   ("I …"). `combo`: two things that only count together, kept on one line.
   `sex`: birth sex the tick applies to. */
export const TICKS = {
  'rf-saddle': [
    { key: 'numb', text: 'Numb or tingly between your legs or around your bottom', tell: 'I have numbness between my legs' },
    { key: 'paper', text: 'You cannot feel the toilet paper when you wipe', tell: 'I cannot feel the toilet paper when I wipe' },
  ],
  'rf-bladder': [
    { key: 'start', text: 'Hard to start peeing, or a weak, slow stream', tell: 'it is hard to start peeing' },
    { key: 'full', text: 'You cannot feel when your bladder is full or empty', tell: 'I cannot feel when my bladder is full' },
    { key: 'leak', text: 'Pee leaks out and you cannot stop it', tell: 'I am leaking pee' },
    { key: 'bowel', text: 'You cannot hold your poo, or cannot feel it coming', tell: 'I cannot control my bowels' },
  ],
  'rf-sexual': [
    { key: 'feel', text: 'Less feeling in your private parts during sex', tell: 'I have less feeling during sex' },
    { key: 'erect', sex: 'male', text: 'New trouble getting an erection or ejaculating', tell: 'I have new trouble with erections' },
  ],
  'rf-legs': [
    { key: 'both', text: 'Your leg pain has spread to both legs', tell: 'my leg pain has spread to both legs' },
    { key: 'weak', text: 'A leg or foot getting weaker fast, over hours or days', tell: 'my leg is getting weaker quickly' },
  ],
  'jrf-conus-legs': [
    { key: 'both', text: 'Both legs suddenly weak or numb', tell: 'both my legs suddenly went weak or numb' },
  ],
  'rf-aaa': [
    { key: 'faint', combo: true, text: 'Sudden, very bad pain in your back or tummy, and you feel faint, sweaty, or a pulsing in your tummy', tell: 'I have sudden, very bad pain and I feel faint' },
  ],
  'jrf-aorta': [
    { key: 'tear', text: 'Sudden tearing or ripping pain in your back, spreading to your chest or tummy', tell: 'I have a sudden tearing pain in my back' },
  ],
  'jrf-pancreas': [
    { key: 'sick', combo: true, text: 'Very bad pain in your upper tummy going through to your back, and you are being sick', tell: 'I have very bad upper tummy pain and I am being sick' },
  ],
  'jrf-testis': [
    { key: 'pain', sex: 'male', text: 'Sudden, very bad pain in a testicle (ball)', tell: 'I have sudden, very bad pain in a testicle' },
  ],
  'pc-stroke': [
    { key: 'face', text: 'One side of your face drooping', tell: 'one side of my face is drooping' },
    { key: 'side', text: 'Weakness or numbness down one side of your body', tell: 'one side of my body is weak or numb' },
    { key: 'speech', text: 'Slurred or muddled speech', tell: 'my speech is slurred' },
    { key: 'eye', text: 'Sudden loss of sight in one eye', tell: 'I suddenly lost the sight in one eye' },
  ],
  'rf-fracture': [
    { key: 'crash', text: 'A car crash', tell: 'I was in a car crash in the last few days' },
    { key: 'height', text: 'A fall from a height, like a ladder, stairs or a roof', tell: 'I fell from a height in the last few days' },
    { key: 'landing', text: 'Landing hard on your feet or bottom', tell: 'I landed hard on my feet or bottom in the last few days' },
  ],
  'rf-osteo': [
    { key: 'strain', combo: true, text: 'Pain came on suddenly after a small strain, cough or lift, and you have weak bones, take steroid tablets, or are over 70', tell: 'the pain came on suddenly after a small strain, and I have weak bones or take steroids' },
  ],
  'sc-trauma': [
    { key: 'bad', text: 'A bad fall or accident', tell: 'I had a bad fall or accident' },
    { key: 'any', combo: true, text: 'Any fall, and you are 65 or over or have weak bones', tell: 'I had a fall, and I am over 65 or have weak bones' },
  ],
  'rf-cancer': [
    { key: 'past', combo: true, text: 'You have had cancer before, and this back pain is new', tell: 'I have had cancer before, and this back pain is new' },
  ],
  'rf-spondy': [
    { key: 'arch', combo: true, text: 'You are under 20, and it hurts to bend backwards, especially in sport like gymnastics, dance, cricket or tennis', tell: 'I am under 20 and it hurts to bend backwards in sport' },
  ],
  'rf-infection': [
    { key: 'fever', text: 'A fever or chills with the back pain', tell: 'I have a fever or chills' },
    { key: 'immune', text: 'A weak immune system, from an illness or medicines', tell: 'I have a weak immune system' },
    { key: 'drugs', text: 'You have injected drugs', tell: 'I have injected drugs' },
    { key: 'recent', text: 'A recent bladder or skin infection', tell: 'I had a bladder or skin infection recently' },
    { key: 'spine', text: 'A recent injection or operation on your spine', tell: 'I had an injection or operation on my spine recently' },
  ],
  'sc-systemic': [
    { key: 'fever', text: 'A fever or chills with the pain', tell: 'I have a fever or chills' },
    { key: 'cancer', combo: true, text: 'You have had cancer before, and this pain is new or changing', tell: 'I have had cancer before, and this pain is new' },
    { key: 'weight', text: 'Losing weight without trying', tell: 'I am losing weight without trying' },
    { key: 'lump', text: 'A new lump, or one that is growing', tell: 'I have a new or growing lump' },
    { key: 'night', text: 'Pain at night that does not change however you lie', tell: 'the pain at night does not change however I lie' },
  ],
  'rf-kidney': [
    { key: 'waves', text: 'Pain in waves from your side to your groin', tell: 'the pain comes in waves from my side to my groin' },
    { key: 'pee', text: 'Burning when you pee, or blood in your pee', tell: 'it burns when I pee, or there is blood in my pee' },
    { key: 'fever', text: 'A fever with pain in your side', tell: 'I have a fever with pain in my side' },
  ],
  'rf-pelvic': [
    { key: 'periods', sex: 'female', text: 'The pain comes and goes with your periods', tell: 'the pain comes with my periods' },
    { key: 'bleed', sex: 'female', text: 'Unusual bleeding from your vagina', tell: 'I have unusual bleeding from my vagina' },
    { key: 'pee', sex: 'male', text: 'New trouble peeing', tell: 'I have new trouble peeing' },
  ],
  'rf-aaa-slow': [
    { key: 'ache', combo: true, text: 'A deep ache that never changes when you move, and you smoke (or did), or have high blood pressure, diabetes or heart disease', tell: 'I have a deep ache that never changes, and I have smoked or have heart or blood pressure problems' },
    { key: 'pulse', combo: true, text: 'A pulsing feeling in your tummy, and you smoke (or did), or have high blood pressure, diabetes or heart disease', tell: 'I feel a pulsing in my tummy, and I have smoked or have heart or blood pressure problems' },
  ],
  'rf-footdrop': [
    { key: 'slap', text: 'Your foot slaps down or your toes catch when you walk', tell: 'my foot slaps down when I walk' },
  ],
  'rf-myelo': [
    { key: 'hands', text: 'Your hands have become clumsy, like with buttons or writing', tell: 'my hands have become clumsy' },
    { key: 'walk', text: 'Your walking is unsteady, or your legs feel stiff', tell: 'my walking is unsteady' },
    { key: 'neck', text: 'Neck pain as well as the leg symptoms', tell: 'I have neck pain as well' },
  ],
  'sc-neuro': [
    { key: 'weak', text: 'An arm or leg newly weak or numb, or getting worse', tell: 'an arm or leg is getting weak or numb' },
    { key: 'clumsy', text: 'An arm or leg newly clumsy', tell: 'an arm or leg has become clumsy' },
  ],
  'jrf-legs': [
    { key: 'stiff', text: 'Your legs have slowly become stiff, heavy or clumsy when you walk', tell: 'my legs have slowly become stiff and heavy' },
  ],
  'pc-visceral': [
    { key: 'still', text: 'Pain that does not change at all when you move or change position', tell: 'the pain does not change at all when I move' },
    { key: 'unwell', text: 'Pain with feeling sick, a fever, or feeling unwell', tell: 'I feel sick or unwell with the pain' },
  ],
  // ── Neck ──
  'nrf-stroke': [
    { key: 'headache', text: 'The worst headache of your life', tell: 'I suddenly have the worst headache of my life' },
    { key: 'face', text: 'A drooping or numb face', tell: 'my face is drooping or numb' },
    { key: 'side', text: 'Weakness or numbness in an arm or leg on one side', tell: 'one side of my body is weak or numb' },
    { key: 'speech', text: 'Slurred speech, or trouble finding or understanding words', tell: 'my speech is slurred' },
    { key: 'sight', text: 'Loss of sight, or seeing double', tell: 'I have lost sight or I am seeing double' },
    { key: 'swallow', text: 'Trouble swallowing', tell: 'I have trouble swallowing' },
    { key: 'confused', text: 'Confusion, falls or blackouts', tell: 'I have had confusion, falls or blackouts' },
    { key: 'dizzy', combo: true, text: 'New dizziness or spinning, with vomiting, or you cannot stand or walk', tell: 'I have new dizziness and cannot stand or walk' },
  ],
  'nrf-cord': [
    { key: 'hold', text: 'You cannot hold your pee or poo', tell: 'I cannot control my bladder or bowels' },
    { key: 'cannot', text: 'You cannot pee at all', tell: 'I cannot pee' },
  ],
  'nrf-cord-legs': [
    { key: 'legs', text: 'New numbness or weakness in both legs', tell: 'both my legs are numb or weak' },
    { key: 'spread', text: 'Numbness or weakness spreading fast in both hands and feet', tell: 'numbness is spreading in my hands and feet' },
    { key: 'breath', text: 'Any trouble breathing or swallowing', tell: 'I have trouble breathing or swallowing' },
  ],
  'nrf-mening': [
    { key: 'fever', combo: true, text: 'A fever, and a stiff neck, a bad headache, a rash, or light hurting your eyes', tell: 'I have a fever with a stiff neck' },
    { key: 'unwell', combo: true, text: 'A fever, and you feel very unwell', tell: 'I have a fever and feel very unwell' },
  ],
  'nrf-cardiac': [
    { key: 'effort', text: 'Neck, jaw or arm pain when you walk fast or climb stairs', tell: 'the pain comes on when I walk fast or climb stairs' },
    { key: 'chest', text: 'With the pain: chest pain, pressure or tightness', tell: 'I have chest pain or tightness with it' },
    { key: 'breath', text: 'With the pain: short of breath, sweaty or feeling sick', tell: 'I feel short of breath, sweaty or sick with it' },
  ],
  'nrf-after': [
    { key: 'severe', text: 'Very bad neck pain, unlike any you have had before', tell: 'I have very bad neck pain, unlike any before' },
    { key: 'limbs', text: 'Numbness or weakness in your arms or legs', tell: 'my arms or legs are numb or weak' },
    { key: 'dizzy', text: 'Dizziness, seeing double, or slurred speech', tell: 'I am dizzy or seeing double' },
    { key: 'swallow', text: 'Trouble swallowing, feeling sick or vomiting', tell: 'I have trouble swallowing or I am vomiting' },
    { key: 'head', text: 'A very bad headache, or one getting worse', tell: 'I have a bad headache that is getting worse' },
    { key: 'mind', text: 'Confusion, drowsiness or memory loss', tell: 'I am confused or drowsy' },
    { key: 'lips', text: 'Numb lips, or eyes that flicker or jump', tell: 'my lips are numb or my eyes flicker' },
  ],
  'nrf-after-doc': [
    { key: 'dizzy', combo: true, text: 'Since a crash, a neck crack, a jerk or a knock: dizziness that keeps coming back', tell: 'since the injury, dizziness keeps coming back' },
    { key: 'signs', combo: true, text: 'Since that injury: numbness, seeing double, slurred speech or trouble swallowing, even if not getting worse', tell: 'since the injury I have had numbness, double vision or trouble swallowing' },
    { key: 'newpain', combo: true, text: 'Since that injury: a new neck pain or headache, different from any before', tell: 'since the injury I have a new kind of neck pain or headache' },
    { key: 'sudden', combo: true, text: 'Without an injury: a sudden, very bad new neck pain or headache, unlike any before', tell: 'I suddenly have a very bad new neck pain or headache, unlike any before' },
  ],
  'nrf-myelo': [
    { key: 'limb', text: 'An arm, hand or leg getting weaker, number or clumsier', tell: 'an arm, hand or leg is quickly getting weaker or clumsier' },
    { key: 'walk', text: 'Your walking getting more unsteady', tell: 'my walking is quickly getting more unsteady' },
  ],
  'nrf-upperinstab': [
    { key: 'heavy', text: 'Your head feels too heavy to hold up without your hands', tell: 'my head feels too heavy to hold up' },
    { key: 'lips', text: 'Moving your neck brings a lump in your throat, or tingling lips or mouth', tell: 'moving my neck makes my lips tingle' },
    { key: 'slow', combo: true, text: 'Over weeks or months, with no injury: a hoarse voice, trouble swallowing, a numb or weak face, a drooping eyelid, or double vision', tell: 'over weeks I have had a hoarse voice, trouble swallowing or double vision' },
    { key: 'risk', text: 'Rheumatoid or another inflammatory arthritis, Down syndrome, or long-term steroid tablets', tell: 'I have inflammatory arthritis, Down syndrome or take steroid tablets' },
  ],
  // ── Shoulder ──
  'rf-cardiac1': [
    { key: 'effort', text: 'Shoulder, jaw or left arm pain when you walk fast or climb stairs', tell: 'the pain comes on when I walk fast or climb stairs' },
    { key: 'chest', text: 'With the pain: chest tightness', tell: 'I have chest tightness with it' },
    { key: 'breath', text: 'With the pain: short of breath or sweating', tell: 'I am short of breath or sweating with it' },
  ],
  'srf-kehr': [
    { key: 'blow', combo: true, text: 'Pain at the tip of your left shoulder that started after a blow to your tummy or ribs', tell: 'pain at the tip of my left shoulder started after a blow to my tummy' },
    { key: 'faint', combo: true, text: 'Pain at the tip of your shoulder, with feeling faint or dizzy', tell: 'I have pain at the tip of my shoulder and feel faint' },
  ],
  'srf-ectopic': [
    { key: 'preg', combo: true, sex: 'female', text: 'You could be pregnant, and you have pain low in your tummy and at the tip of your shoulder', tell: 'I could be pregnant, and I have low tummy pain and shoulder-tip pain' },
  ],
  'srf-lung': [
    { key: 'breath', combo: true, text: 'Sudden, sharp pain when you breathe in, and you are short of breath', tell: 'I have sudden, sharp pain when I breathe in and I am short of breath' },
  ],
  'srf-rhabdo': [
    { key: 'cola', combo: true, text: 'Very bad muscle pain or weakness, and pee that is dark like cola', tell: 'I have very bad muscle pain and my pee is dark like cola' },
  ],
  'rf-hotjoint': [
    { key: 'fever', combo: true, text: 'A hot, red or swollen joint, with a fever or feeling very unwell', tell: 'my joint is hot and swollen and I have a fever' },
  ],
  'srf-pmr': [
    { key: 'stiff', combo: true, text: 'Both shoulders (often the hips too) stiff and aching for over 45 minutes each morning, and you feel unwell', tell: 'both my shoulders are stiff every morning and I feel unwell' },
  ],
  'srf-pancoast': [
    { key: 'smoker', combo: true, text: 'You smoke (or did), and have a cough that will not go away, coughed up blood, a drooping eyelid, or a weak hand', tell: 'I smoke or did, and I have a lasting cough, coughed up blood, a drooping eyelid or a weak hand' },
  ],
  'srf-organ': [
    { key: 'fatty', text: 'Pain worse after fatty meals', tell: 'the pain is worse after fatty meals' },
    { key: 'breath', text: 'Pain worse when you breathe in deeply', tell: 'the pain is worse when I breathe in deeply' },
    { key: 'sick', text: 'Feeling sick, or a fever, with the pain', tell: 'I feel sick or have a fever with it' },
    { key: 'yellow', text: 'Yellow skin or eyes', tell: 'my skin or eyes look yellow' },
    { key: 'still', text: 'Pain that does not change at all when you move', tell: 'the pain does not change when I move' },
  ],
  'srf-pta': [
    { key: 'weak', combo: true, text: 'Sudden, very bad shoulder pain with no injury for several days, and then your shoulder or arm became weak or thin', tell: 'I had sudden, very bad shoulder pain for days, and now my arm is weak' },
  ],
  // ── Knee ──
  'kf-compartment': [
    { key: 'tight', combo: true, text: 'Pain far worse than expected, still climbing even with pain relief, and the muscle tight and swollen', tell: 'the pain is far worse than expected and still climbing, and the muscle is tight and swollen' },
    { key: 'toes', combo: true, text: 'Pain far worse than expected, still climbing even with pain relief, and much worse when your toes are moved', tell: 'the pain is far worse than expected and still climbing, and much worse when my toes move' },
  ],
  'kf-septic': [
    { key: 'fever', combo: true, text: 'A hot, red, swollen knee, with a fever or feeling unwell', tell: 'my knee is hot, red and swollen, and I have a fever' },
  ],
  'kf-pe': [
    { key: 'breath', combo: true, text: 'A swollen, warm or tender calf or thigh, and you are short of breath, have chest pain or cough blood', tell: 'my calf is swollen and I am short of breath or have chest pain' },
  ],
  'kf-cauda': [
    { key: 'numb', text: 'New numbness between your legs or around your bottom', tell: 'I have new numbness between my legs' },
    { key: 'pee', text: 'New trouble peeing, or holding your poo', tell: 'I have new trouble peeing or holding my bowels' },
  ],
  'kf-dvt': [
    { key: 'calf', text: 'A calf that is swollen, warm or tender', tell: 'my calf is swollen, warm or tender' },
  ],
  'kf-artery': [
    { key: 'lump', text: 'A pulsing lump behind your knee', tell: 'I have a pulsing lump behind my knee' },
    { key: 'cramp', text: 'Calf cramps when you walk that ease within minutes of standing still', tell: 'my calf cramps when I walk and eases when I stand still' },
  ],
  'kf-replacement': [
    { key: 'sore', combo: true, text: 'A knee replacement that is newly painful, warm or swollen, or a red or leaking wound', tell: 'my knee replacement is newly painful, warm or swollen' },
  ],
  'kf-gout': [
    { key: 'overnight', combo: true, text: 'Your knee became hot, swollen and very painful overnight, and you have had gout (or pseudogout) before', tell: 'my knee became hot and swollen overnight, and I have had gout before' },
  ],
  'kf-inflam': [
    { key: 'others', text: 'Other joints swollen too', tell: 'other joints are swollen too' },
    { key: 'skin', text: 'A swollen knee with a rash or psoriasis', tell: 'my knee is swollen and I have a rash or psoriasis' },
    { key: 'eyes', text: 'A swollen knee with sore, red eyes', tell: 'my knee is swollen and my eyes are sore and red' },
    { key: 'bug', text: 'A swollen knee after a stomach bug or a sexually transmitted infection', tell: 'my knee swelled after a stomach bug or an infection' },
  ],
  'kf-cancer': [
    { key: 'past', text: 'You have had cancer before', tell: 'I have had cancer before' },
    { key: 'night', combo: true, text: 'Deep knee pain at night that does not change however you lie, with weight loss', tell: 'I have deep knee pain at night and I am losing weight' },
  ],
  'kf-tumour': [
    { key: 'ache', combo: true, text: 'You are under 25, with a deep ache around the knee that wakes you at night', tell: 'I am under 25 and a deep ache around my knee wakes me at night' },
    { key: 'lump', text: 'A lump near the knee that is growing', tell: 'I have a growing lump near my knee' },
  ],
  'kf-stress': [
    { key: 'run', combo: true, text: 'You run or train hard, and have a deep ache above the knee that is worse with hopping, each run, or at night', tell: 'I run or train hard, and I have a deep ache above the knee that is getting worse' },
  ],
  'kf-sufe': [
    { key: 'limp', combo: true, text: 'A child or teenager (about 9 to 17) limping with knee or thigh pain, or moving the hip hurts', tell: 'my child is limping with knee or thigh pain' },
  ],
  'kf-perthes': [
    { key: 'limp', combo: true, text: 'A child (about 4 to 10) limping, with knee or hip pain, and no injury', tell: 'my child is limping with knee or hip pain and no injury' },
  ],
  // ── Hip ──
  'hpf-aaa': [
    { key: 'faint', combo: true, text: 'Sudden, very bad pain in your back, tummy or groin, and you feel faint, sweaty, or a pulsing in your tummy', tell: 'I have sudden, very bad pain and I feel faint' },
  ],
  'hpf-septic': [
    { key: 'fever', combo: true, text: 'A very painful hip with a fever, and you cannot put weight on the leg', tell: 'my hip is very painful, I have a fever and cannot put weight on the leg' },
    { key: 'child', combo: true, text: 'A child with a fever who suddenly will not walk', tell: 'my child has a fever and suddenly will not walk' },
  ],
  'hpf-ectopic': [
    { key: 'preg', combo: true, sex: 'female', text: 'You could be pregnant, and have sudden pain low on one side of your tummy or groin, bleeding, or feeling faint', tell: 'I could be pregnant, and I have sudden low pain on one side' },
  ],
  'hpf-torsion': [
    { key: 'pain', sex: 'male', text: 'Sudden, very bad pain in a testicle (ball)', tell: 'I have sudden, very bad pain in a testicle' },
  ],
  'hpf-strangulated': [
    { key: 'stuck', text: 'A painful or firm lump in your groin that will not go back in', tell: 'I have a painful groin lump that will not go back in' },
    { key: 'sick', combo: true, text: 'A lump in your groin, and you are vomiting or not passing wind', tell: 'I have a groin lump and I am vomiting' },
  ],
  'hpf-dislocation': [
    { key: 'clunk', text: 'Sudden, very bad hip pain, or you felt a clunk', tell: 'after my hip operation I have sudden, very bad pain or felt a clunk' },
    { key: 'stand', text: 'You cannot stand on the leg, or it looks shorter or turned', tell: 'after my hip operation I cannot stand on the leg' },
  ],
  'hpf-rhabdo': [
    { key: 'cola', combo: true, text: 'Very bad muscle pain or weakness, and pee that is dark like cola', tell: 'I have very bad muscle pain and my pee is dark like cola' },
  ],
  'hpf-replacement': [
    { key: 'sore', combo: true, text: 'After a hip replacement or hip operation: the hip newly painful, warm or swollen, a red or leaking wound, or a fever', tell: 'my operated hip is newly painful, warm or swollen' },
  ],
  'hpf-nofall': [
    { key: 'sudden', combo: true, text: '65 or over, or weak bones, and sudden groin or hip pain with no fall or a small slip, so standing or walking hurts', tell: 'I am over 65 or have weak bones, and sudden hip pain makes it hard to stand' },
  ],
  'hpf-sufe': [
    { key: 'limp', combo: true, text: 'A child or teenager (about 5 to 17) limping or not wanting to put weight on the leg, with hip, groin, thigh or knee pain', tell: 'my child is limping with hip or knee pain' },
  ],
  'hpf-stress': [
    { key: 'run', combo: true, text: 'You run or train hard, and have a deep groin ache that is worse with running or hopping, or aches at night', tell: 'I run or train hard and have a deep groin ache' },
  ],
  'hpf-avn': [
    { key: 'risk', combo: true, text: 'Long-term steroid tablets, heavy drinking, sickle cell, lupus, an organ transplant, or a past hip fracture or dislocation, and a deep groin ache', tell: 'I have a deep groin ache and a risk such as steroids or heavy drinking' },
  ],
  'hpf-dvt': [
    { key: 'leg', text: 'A calf or thigh that is swollen, warm or tender', tell: 'my calf or thigh is swollen, warm or tender' },
  ],
  'hpf-hernia': [
    { key: 'lump', text: 'A soft lump in your groin that appears when you cough, strain or stand', tell: 'I have a soft groin lump when I cough or strain' },
  ],
  'hpf-kidney': [
    { key: 'waves', text: 'Pain in waves from your side to your groin', tell: 'the pain comes in waves from my side to my groin' },
    { key: 'pee', text: 'Burning when you pee, or blood in your pee', tell: 'it burns when I pee, or there is blood in my pee' },
  ],
  'hpf-pelvic': [
    { key: 'periods', sex: 'female', text: 'Groin pain that comes and goes with your periods', tell: 'the groin pain comes with my periods' },
    { key: 'bleed', sex: 'female', text: 'Unusual bleeding or discharge from your vagina', tell: 'I have unusual bleeding or discharge' },
  ],
  'hpf-cauda': [
    { key: 'numb', text: 'New numbness between your legs or around your bottom', tell: 'I have new numbness between my legs' },
    { key: 'pee', text: 'New trouble peeing, or holding your poo', tell: 'I have new trouble peeing or holding my bowels' },
  ],
  'jrf-aaa': [
    { key: 'faint', combo: true, text: 'Sudden, very bad pain in your back, tummy or side, and you feel faint, sweaty, or a pulsing in your tummy', tell: 'I have sudden, very bad pain and I feel faint' },
  ],
  'jrf-conus': [
    { key: 'hold', text: 'You cannot hold your pee or poo', tell: 'I cannot control my bladder or bowels' },
    { key: 'numb', text: 'No feeling between your legs or around your bottom', tell: 'I have lost feeling between my legs' },
  ],
  'jrf-fracture': [
    { key: 'crash', text: 'A car crash', tell: 'I was in a car crash in the last few days' },
    { key: 'height', text: 'A fall from a height, like a ladder, stairs or a roof', tell: 'I fell from a height in the last few days' },
    { key: 'landing', text: 'Landing hard on your feet or bottom', tell: 'I landed hard on my feet or bottom in the last few days' },
  ],
  // ── Ankle ──
  'af-compartment': [
    { key: 'tight', combo: true, text: 'Pain far worse than expected, still climbing even with pain relief, and the muscle tight and swollen', tell: 'the pain is far worse than expected and still climbing, and the muscle is tight and swollen' },
    { key: 'toes', combo: true, text: 'Pain far worse than expected, still climbing even with pain relief, and much worse when your toes are moved', tell: 'the pain is far worse than expected and still climbing, and much worse when my toes move' },
  ],
  'af-septic': [
    { key: 'fever', combo: true, text: 'A hot, red, swollen ankle, with a fever or feeling unwell', tell: 'my ankle is hot, red and swollen, and I have a fever' },
  ],
  'af-pe': [
    { key: 'breath', combo: true, text: 'A swollen, warm or tender calf or ankle, and you are short of breath, have chest pain or cough blood', tell: 'my calf is swollen and I am short of breath or have chest pain' },
  ],
  'af-ischaemia': [
    { key: 'foot', text: 'Your foot suddenly became cold, pale, numb, or painful at rest', tell: 'my foot suddenly became cold, pale or numb' },
  ],
  'af-necfasc': [
    { key: 'pain', combo: true, text: 'A hot, red area around the ankle spreading fast, with pain far worse than it looks', tell: 'a hot red area is spreading fast and the pain is far worse than it looks' },
    { key: 'unwell', combo: true, text: 'A hot, red area around the ankle spreading fast, and you feel very unwell', tell: 'a hot red area is spreading fast and I feel very unwell' },
  ],
  'af-cast': [
    { key: 'tight', text: 'A cast, splint or bandage getting tighter and sorer (do not cut it off)', tell: 'my cast is getting tighter and more painful' },
  ],
  'af-dvt': [
    { key: 'calf', text: 'A calf or ankle that is swollen, warm or tender', tell: 'my calf or ankle is swollen, warm or tender' },
  ],
  'af-charcot': [
    { key: 'hot', combo: true, text: 'You have diabetes, and your foot or ankle is hot, red and swollen, even if it does not hurt much', tell: 'I have diabetes and my foot is hot, red and swollen' },
    { key: 'wound', combo: true, text: 'You have diabetes, and a wound on your foot is not healing', tell: 'I have diabetes and a wound on my foot is not healing' },
  ],
  'af-gout': [
    { key: 'overnight', combo: true, text: 'Your ankle or big toe became hot, swollen and very painful overnight, and you have had gout before', tell: 'my ankle became hot and swollen overnight, and I have had gout before' },
  ],
  'af-inflam': [
    { key: 'back', combo: true, text: 'Heel or Achilles pain, and a stiff back in the morning', tell: 'I have heel pain and a stiff back in the morning' },
    { key: 'skin', combo: true, text: 'Heel or Achilles pain, and psoriasis or sore, red eyes', tell: 'I have heel pain and psoriasis or sore eyes' },
    { key: 'joints', combo: true, text: 'Heel or Achilles pain, and other swollen joints', tell: 'I have heel pain and other swollen joints' },
    { key: 'bug', combo: true, text: 'Heel or Achilles pain after a stomach bug or a sexually transmitted infection', tell: 'my heel pain started after a stomach bug or an infection' },
  ],
  'af-quinolone': [
    { key: 'med', combo: true, text: 'Achilles pain after a recent antibiotic such as ciprofloxacin, or steroid tablets', tell: 'my Achilles hurts after an antibiotic like ciprofloxacin or steroid tablets' },
  ],
  'af-footdrop': [
    { key: 'slap', text: 'Your foot slaps down or your toes catch when you walk', tell: 'my foot slaps down when I walk' },
  ],
  'af-neuropathy': [
    { key: 'socks', text: 'Both feet numb, burning or tingling, like wearing socks', tell: 'both my feet are numb or burning' },
  ],
  'af-stress': [
    { key: 'spot', combo: true, text: 'After more running, walking or training: pain on one spot of the inner ankle or midfoot bone, worse with each step, hopping or at night', tell: 'after more running or walking I have pain on one spot of bone' },
  ],
  'af-cancer': [
    { key: 'past', text: 'You have had cancer before', tell: 'I have had cancer before' },
    { key: 'lump', text: 'A lump that is growing', tell: 'I have a growing lump' },
    { key: 'night', text: 'Deep pain at night that does not change however you lie', tell: 'I have deep pain at night that does not change' },
  ],
  'af-crps': [
    { key: 'since', combo: true, text: 'Since an ankle injury, operation or cast: burning, swelling, shiny skin, colour or temperature changes, or light touch hurts', tell: 'since the injury my ankle burns, swells or changes colour' },
  ],
  // ── Foot ──
  'ft-compartment': [
    { key: 'tight', combo: true, text: 'Pain far worse than expected, still climbing even with pain relief, and the muscle tight and swollen', tell: 'the pain is far worse than expected and still climbing, and the muscle is tight and swollen' },
    { key: 'toes', combo: true, text: 'Pain far worse than expected, still climbing even with pain relief, and much worse when your toes are moved', tell: 'the pain is far worse than expected and still climbing, and much worse when my toes move' },
  ],
  'ft-ischaemia': [
    { key: 'cold', text: 'Your foot or toes suddenly cold, pale, blue or numb', tell: 'my foot or toes suddenly became cold, pale or numb' },
    { key: 'rest', text: 'Sudden, very bad foot pain at rest', tell: 'I suddenly have very bad foot pain at rest' },
  ],
  'ft-necfasc': [
    { key: 'pain', combo: true, text: 'A hot, red area on your foot spreading fast, with pain far worse than it looks', tell: 'a hot red area is spreading fast and the pain is far worse than it looks' },
    { key: 'unwell', combo: true, text: 'A hot, red area on your foot spreading fast, and you feel very unwell', tell: 'a hot red area is spreading fast and I feel very unwell' },
  ],
  'ft-diabeticinfection': [
    { key: 'wound', combo: true, text: 'You have diabetes, and a foot wound with spreading redness, pus, a bad smell, or a fever', tell: 'I have diabetes and an infected foot wound' },
  ],
  'ft-cast': [
    { key: 'tight', text: 'A cast, splint or bandage getting tighter and sorer (do not cut it off)', tell: 'my cast is getting tighter and more painful' },
  ],
  'ft-puncture': [
    { key: 'shoe', combo: true, text: 'Something went through your shoe into your foot (a nail or glass), and it is now swollen, red or painful to walk on', tell: 'something went through my shoe into my foot, and it is now swollen and red' },
  ],
  'ft-charcot': [
    { key: 'hot', combo: true, text: 'You have diabetes, and your foot is hot, red or swollen, even if it does not hurt much', tell: 'I have diabetes and my foot is hot, red and swollen' },
    { key: 'wound', combo: true, text: 'You have diabetes, and a wound or ulcer on your foot is not healing', tell: 'I have diabetes and a wound on my foot is not healing' },
  ],
  'ft-gout': [
    { key: 'toe', text: 'Big toe or another joint suddenly hot, swollen, red, and too sore to touch', tell: 'my big toe became suddenly hot, swollen and too painful to touch' },
  ],
  'ft-inflam': [
    { key: 'sausage', text: 'A whole toe swollen like a sausage', tell: 'a whole toe is swollen like a sausage' },
    { key: 'back', combo: true, text: 'Heel pain, and a stiff back in the morning', tell: 'I have heel pain and a stiff back in the morning' },
    { key: 'skin', combo: true, text: 'Heel pain, and psoriasis or sore, red eyes', tell: 'I have heel pain and psoriasis or sore eyes' },
    { key: 'bug', combo: true, text: 'Heel pain after a stomach bug or a sexually transmitted infection', tell: 'my heel pain started after a stomach bug or an infection' },
  ],
  'ft-claudication': [
    { key: 'cramp', text: 'Foot or calf cramps when you walk that ease within minutes of standing still', tell: 'my foot or calf cramps when I walk and eases when I stand still' },
    { key: 'toes', text: 'Toes that are cold, shiny and slow to heal', tell: 'my toes are cold, shiny and slow to heal' },
  ],
  'ft-neuropathy': [
    { key: 'socks', text: 'Both feet numb, burning or tingling, like wearing socks', tell: 'both my feet are numb or burning' },
  ],
  'ft-crps': [
    { key: 'since', combo: true, text: 'Since a foot injury, operation or cast: burning, swelling, shiny skin, colour or temperature changes, or light touch hurts', tell: 'since the injury my foot burns, swells or changes colour' },
  ],
  'ft-stress': [
    { key: 'bone', combo: true, text: 'After more running, walking or training: pain on one foot bone, worse with each step, hopping or at night', tell: 'after more running or walking I have pain on one foot bone' },
  ],
  'ft-footdrop': [
    { key: 'slap', text: 'Your foot slaps down or your toes catch when you walk', tell: 'my foot slaps down when I walk' },
  ],
  'ft-lump': [
    { key: 'lump', text: 'A lump in the foot that is growing', tell: 'I have a growing lump in my foot' },
    { key: 'nail', text: 'A new dark mark under a toenail', tell: 'I have a new dark mark under a toenail' },
    { key: 'night', text: 'Deep pain at night that does not change however you lie', tell: 'I have deep pain at night that does not change' },
  ],
  // ── Thigh ──
  'tgf-pe': [
    { key: 'breath', combo: true, text: 'A swollen, warm or tender thigh or calf, and you are short of breath, have chest pain or cough blood', tell: 'my leg is swollen and I am short of breath or have chest pain' },
  ],
  'tgf-compartment': [
    { key: 'tense', combo: true, text: 'Thigh pain far worse than expected, still climbing even with pain relief, with the thigh tense, hard and swollen', tell: 'my thigh pain is far worse than expected and still climbing, and the thigh is hard and swollen' },
  ],
  'tgf-rhabdo': [
    { key: 'cola', combo: true, text: 'Very bad muscle pain or weakness, and pee that is dark like cola', tell: 'I have very bad muscle pain and my pee is dark like cola' },
  ],
  'tgf-necfasc': [
    { key: 'pain', combo: true, text: 'A hot, red area on your thigh spreading fast, with pain far worse than it looks', tell: 'a hot red area is spreading fast and the pain is far worse than it looks' },
    { key: 'unwell', combo: true, text: 'A hot, red area on your thigh spreading fast, and you feel very unwell', tell: 'a hot red area is spreading fast and I feel very unwell' },
  ],
  'tgf-cauda': [
    { key: 'numb', text: 'New numbness between your legs or around your bottom', tell: 'I have new numbness between my legs' },
    { key: 'pee', text: 'New trouble peeing, or holding your poo', tell: 'I have new trouble peeing or holding my bowels' },
  ],
  'tgf-dvt': [
    { key: 'leg', text: 'A thigh or calf that is swollen, warm or tender', tell: 'my thigh or calf is swollen, warm or tender' },
  ],
  'tgf-cellulitis': [
    { key: 'streak', combo: true, text: 'Spreading redness, or a red streak up the leg, with a fever', tell: 'redness is spreading up my leg and I have a fever' },
    { key: 'hot', combo: true, text: 'A hot, swollen area on the leg, with a fever', tell: 'I have a hot, swollen area on my leg and a fever' },
  ],
  'tgf-claudication': [
    { key: 'cramp', combo: true, text: 'Thigh or buttock cramps when walking that ease within minutes of standing still, and you smoke or have diabetes', tell: 'my thigh cramps when I walk and eases when I stand still, and I smoke or have diabetes' },
  ],
  'tgf-femoral': [
    { key: 'thin', text: 'Your thigh muscle has become weak or thin, with no injury', tell: 'my thigh muscle has become weak or thin' },
    { key: 'giveway', text: 'Your knee gives way, with no injury', tell: 'my knee gives way' },
  ],
  'tgf-stress': [
    { key: 'run', combo: true, text: 'You run or train hard, and have a deep thigh ache that is worse with hopping, or aches at night', tell: 'I run or train hard, and I have a deep thigh ache' },
  ],
  'tgf-tumour': [
    { key: 'ache', combo: true, text: 'You are under 25, with a deep thigh ache that wakes you at night', tell: 'I am under 25 and a deep thigh ache wakes me at night' },
    { key: 'lump', text: 'A lump or swelling in the thigh that is growing', tell: 'I have a growing lump in my thigh' },
  ],
  'tgf-sufe': [
    { key: 'limp', combo: true, text: 'A child or teenager (about 5 to 17) limping or not wanting to put weight on the leg, with thigh or knee pain', tell: 'my child is limping with thigh or knee pain' },
  ],
  'tgf-cancer': [
    { key: 'past', text: 'You have had cancer before', tell: 'I have had cancer before' },
    { key: 'night', combo: true, text: 'Deep thigh pain at night that does not change however you lie, with weight loss', tell: 'I have deep thigh pain at night and I am losing weight' },
  ],
  // ── Lower leg ──
  'lgf-pe': [
    { key: 'breath', combo: true, text: 'A swollen, warm or tender calf, and you are short of breath, have chest pain or cough blood', tell: 'my calf is swollen and I am short of breath or have chest pain' },
  ],
  'lgf-compartment': [
    { key: 'tight', combo: true, text: 'Pain far worse than expected, still climbing even with pain relief, and the muscle tight and swollen', tell: 'the pain is far worse than expected and still climbing, and the muscle is tight and swollen' },
    { key: 'toes', combo: true, text: 'Pain far worse than expected, still climbing even with pain relief, and much worse when your toes are moved', tell: 'the pain is far worse than expected and still climbing, and much worse when my toes move' },
  ],
  'lgf-rhabdo': [
    { key: 'cola', combo: true, text: 'Very bad muscle pain or weakness, and pee that is dark like cola', tell: 'I have very bad muscle pain and my pee is dark like cola' },
  ],
  'lgf-ischaemia': [
    { key: 'cold', text: 'Your foot or lower leg suddenly cold, pale or numb', tell: 'my foot or lower leg suddenly became cold, pale or numb' },
    { key: 'rest', text: 'Sudden, very bad pain in the foot or lower leg at rest', tell: 'I suddenly have very bad pain in my leg at rest' },
  ],
  'lgf-necfasc': [
    { key: 'pain', combo: true, text: 'A hot, red area on your leg spreading fast, with pain far worse than it looks', tell: 'a hot red area is spreading fast and the pain is far worse than it looks' },
    { key: 'unwell', combo: true, text: 'A hot, red area on your leg spreading fast, and you feel very unwell', tell: 'a hot red area is spreading fast and I feel very unwell' },
  ],
  'lgf-cauda': [
    { key: 'numb', text: 'New numbness between your legs or around your bottom', tell: 'I have new numbness between my legs' },
    { key: 'pee', text: 'New trouble peeing, or holding your poo', tell: 'I have new trouble peeing or holding my bowels' },
  ],
  'lgf-cast': [
    { key: 'tight', text: 'A cast, splint or bandage getting tighter and sorer (do not cut it off)', tell: 'my cast is getting tighter and more painful' },
  ],
  'lgf-dvt': [
    { key: 'calf', text: 'A calf that is swollen, warm or tender', tell: 'my calf is swollen, warm or tender' },
  ],
  'lgf-cellulitis': [
    { key: 'redness', text: 'Redness on the leg that is spreading', tell: 'redness is spreading on my leg' },
    { key: 'streak', text: 'A red streak up the leg', tell: 'I have a red streak up my leg' },
    { key: 'hot', combo: true, text: 'A hot, swollen area on the leg, with a fever', tell: 'I have a hot, swollen area on my leg and a fever' },
    { key: 'ulcer', text: 'A leg ulcer that is not healing', tell: 'I have a leg ulcer that is not healing' },
  ],
  'lgf-claudication': [
    { key: 'cramp', combo: true, text: 'Calf cramps when walking that ease within minutes of standing still, and you smoke, have diabetes, or are over 50', tell: 'my calf cramps when I walk and eases when I stand still' },
  ],
  'lgf-stress': [
    { key: 'shin', combo: true, text: 'You run or train hard, and have a shin sore spot you can point to with one finger, or pain hopping or at night', tell: 'I run or train hard and have a sore spot on my shin bone' },
  ],
  'lgf-footdrop': [
    { key: 'slap', text: 'Your foot slaps down or your toes catch when you walk', tell: 'my foot slaps down when I walk' },
  ],
  'lgf-neuropathy': [
    { key: 'socks', text: 'Both feet numb, burning or tingling, like wearing socks', tell: 'both my feet are numb or burning' },
  ],
  'lgf-tumour': [
    { key: 'ache', combo: true, text: 'You are under 25, with a deep shin ache that wakes you at night', tell: 'I am under 25 and a deep shin ache wakes me at night' },
    { key: 'lump', text: 'A lump on the shin that is growing', tell: 'I have a growing lump on my shin' },
  ],
  'lgf-cancer': [
    { key: 'past', text: 'You have had cancer before', tell: 'I have had cancer before' },
    { key: 'night', combo: true, text: 'Deep leg pain at night that does not change however you lie, with weight loss', tell: 'I have deep leg pain at night and I am losing weight' },
  ],
  // ── Pattern questions (the main pattern is the heading: "and one of these") ──
  'pc-lowhormone': [
    { key: 'tumour', text: 'A pituitary or brain tumour, brain surgery, or radiotherapy to the head', tell: 'for months I have been exhausted, and I have had a brain or pituitary problem' },
    { key: 'head', text: 'A bad head injury, or bleeding in the brain', tell: 'for months I have been exhausted, since a bad head injury' },
    { key: 'birth', text: 'Heavy bleeding at a birth, then no periods or breastfeeding failed', tell: 'for months I have been exhausted, since heavy bleeding at a birth' },
    { key: 'immuno', text: 'Cancer immunotherapy', tell: 'for months I have been exhausted, since cancer immunotherapy' },
  ],
  'pc-calcium': [
    { key: 'press', text: 'Bones that hurt when pressed firmly: shin, breastbone or front of the pelvis', tell: 'my bones ache on both sides and hurt when pressed' },
    { key: 'weak', text: 'Weak hips and thighs (hard to rise from a low chair), or a waddle', tell: 'my bones ache and my hips and thighs are weak' },
    { key: 'fracture', text: 'A bone cracked without heavy sport, broken in a small fall, or thin bones', tell: 'my bones ache and a bone broke easily' },
    { key: 'stone', text: 'A kidney stone, now or in the past', tell: 'my bones ache and I have had a kidney stone' },
    { key: 'symptoms', combo: true, text: 'Two or more of: thirst or peeing more, constipation, feeling sick, low mood, brain fog, poor sleep', tell: 'my bones ache and I have thirst, constipation or brain fog' },
    { key: 'risks', combo: true, text: 'Two or more of: darker skin, little sun, little dairy or vegan, a gut condition or weight-loss surgery, kidney or liver disease, anti-seizure medicine', tell: 'my bones ache and I may be low in vitamin D' },
    { key: 'blood', text: 'A high calcium or low vitamin D blood result never followed up', tell: 'my bones ache and I had a calcium or vitamin D result never followed up' },
  ],
  'pc-hypothyroid': [
    { key: 'muscles', combo: true, text: 'Muscles stiff, achy or crampy on both sides for months, slow to recover, with two or more of these signs', tell: 'my muscles have been stiff and slow for months, and I feel cold and tired' },
    { key: 'hands', combo: true, text: 'Both hands tingle or go numb at night, with one or more of these signs', tell: 'both my hands go numb at night, and I feel cold and tired' },
  ],
  'pc-acromegaly': [
    { key: 'joints', text: 'Aching, stiff or crunchy joints, or a stooping back, early for your age', tell: 'my hands or feet have grown, and my joints ache early for my age' },
    { key: 'hands', text: 'Both hands tingling or numb at night, or thick, clumsy hands', tell: 'my hands or feet have grown, and my hands go numb at night' },
    { key: 'others', combo: true, text: 'Two or more of: heavy snoring, sleepiness, headaches, oily or sweaty skin, new high blood pressure or sugar, skin tags, irregular periods or low sex drive', tell: 'my hands or feet have grown, and I snore, have headaches or new high blood pressure' },
  ],
  // ── Elbow ──
  'erf-hot': [
    { key: 'fever', combo: true, text: 'A hot, red or swollen joint, with a fever or feeling very unwell', tell: 'my joint is hot and swollen and I have a fever' },
  ],
  'erf-compartment': [
    { key: 'tight', combo: true, text: 'Forearm or hand pain far worse than expected, still climbing even with pain relief, and the muscle tight and swollen', tell: 'my forearm pain is far worse than expected and still climbing, and the muscle is tight and swollen' },
    { key: 'fingers', combo: true, text: 'Forearm or hand pain far worse than expected, still climbing even with pain relief, and much worse when your fingers are moved', tell: 'my forearm pain is far worse than expected and still climbing, and much worse when my fingers move' },
  ],
  'erf-cast': [
    { key: 'tight', text: 'A cast, splint or bandage getting tighter and sorer (do not cut it off)', tell: 'my cast is getting tighter and more painful' },
  ],
  'erf-cellulitis': [
    { key: 'streak', combo: true, text: 'Spreading redness, or a red streak up the arm, with a fever', tell: 'redness is spreading up my arm and I have a fever' },
    { key: 'hot', combo: true, text: 'A hot, swollen area on the arm, with a fever', tell: 'I have a hot, swollen area on my arm and a fever' },
  ],
  'erf-bursa': [
    { key: 'swelling', combo: true, text: 'A swelling at the point of your elbow that is red or warm, or has a cut or graze over it', tell: 'the swelling at the point of my elbow is red and warm' },
  ],
  'erf-gout': [
    { key: 'overnight', combo: true, text: 'A joint became hot, swollen and very painful overnight, and you have had gout or pseudogout before', tell: 'a joint became hot and swollen overnight, and I have had gout before' },
  ],
  'erf-nerve': [
    { key: 'weaker', text: 'Your hand getting weaker', tell: 'my hand is getting weaker' },
    { key: 'thin', text: 'The muscle at the base of your thumb, or beside it, getting thinner', tell: 'the muscle at the base of my thumb is getting thinner' },
    { key: 'numb', text: 'Finger numbness that is there all the time', tell: 'my fingers are numb all the time' },
    { key: 'wrist', text: 'You cannot lift your wrist or straighten your fingers', tell: 'I cannot lift my wrist or straighten my fingers' },
  ],
  'erf-myelo': [
    { key: 'hands', text: 'Both hands numb or clumsy, like with buttons or writing', tell: 'both my hands are numb or clumsy' },
    { key: 'walk', text: 'Your walking has become unsteady', tell: 'my walking has become unsteady' },
  ],
  'erf-child': [
    { key: 'throw', combo: true, text: 'You are under 16, and your elbow hurts with throwing or gymnastics', tell: 'I am under 16 and my elbow hurts with throwing or gymnastics' },
    { key: 'lock', combo: true, text: 'You are under 16, and your elbow has started to catch or lock', tell: 'I am under 16 and my elbow catches or locks' },
  ],
  'erf-pta': [
    { key: 'weak', combo: true, text: 'Sudden, very bad arm pain with no injury for several days, and then your arm or hand muscles became weak', tell: 'I had sudden, very bad arm pain for days, and now my arm is weak' },
  ],
  // ── Wrist ──
  'wrf-stroke': [
    { key: 'face', text: 'One side of your face drooping', tell: 'one side of my face is drooping' },
    { key: 'side', text: 'Weakness or numbness down one whole side', tell: 'one whole side of my body is weak or numb' },
    { key: 'speech', text: 'Trouble speaking', tell: 'I have trouble speaking' },
  ],
  'wrf-hot': [
    { key: 'fever', combo: true, text: 'A hot, red or swollen joint, with a fever or feeling very unwell', tell: 'my joint is hot and swollen and I have a fever' },
  ],
  'wrf-bite': [
    { key: 'cut', combo: true, text: 'A cut, bite or puncture on the wrist or hand, now swollen, red and very painful to move the fingers', tell: 'a cut or bite on my hand is now swollen, red and very painful' },
  ],
  'wrf-compartment': [
    { key: 'tight', combo: true, text: 'Forearm or hand pain far worse than expected, still climbing even with pain relief, and the muscle tight and swollen', tell: 'my forearm pain is far worse than expected and still climbing, and the muscle is tight and swollen' },
    { key: 'fingers', combo: true, text: 'Forearm or hand pain far worse than expected, still climbing even with pain relief, and much worse when your fingers are moved', tell: 'my forearm pain is far worse than expected and still climbing, and much worse when my fingers move' },
  ],
  'wrf-cast': [
    { key: 'tight', text: 'A cast, splint or bandage getting tighter and sorer (do not cut it off)', tell: 'my cast is getting tighter and more painful' },
  ],
  'wrf-raynaud': [
    { key: 'attacks', text: 'Fingers or hand turning white, blue or cold in attacks', tell: 'my fingers turn white, blue or cold in attacks' },
    { key: 'cold', text: 'A painful cold finger that does not warm up again', tell: 'I have a painful cold finger that does not warm up' },
  ],
  'wrf-gout': [
    { key: 'sudden', text: 'A joint suddenly hot, red, swollen and very painful over a day or so', tell: 'a joint became suddenly hot, red, swollen and very painful' },
  ],
  'wrf-inflam': [
    { key: 'morning', text: 'Both wrists or several finger joints swollen and stiff over an hour each morning', tell: 'my wrists or finger joints are swollen and stiff for over an hour each morning' },
  ],
  'wrf-numb': [
    { key: 'weaker', text: 'Your hand getting weaker', tell: 'my hand is getting weaker' },
    { key: 'thin', text: 'The muscle at the base of your thumb, or beside it, getting thinner', tell: 'the muscle at the base of my thumb is getting thinner' },
    { key: 'numb', text: 'Finger numbness that is there all the time', tell: 'my fingers are numb all the time' },
    { key: 'wrist', text: 'You cannot lift your wrist', tell: 'I cannot lift my wrist' },
  ],
  'wrf-myelo': [
    { key: 'hands', text: 'Both hands numb or clumsy most of the day, not only at night', tell: 'both my hands are numb or clumsy most of the day' },
    { key: 'walk', text: 'Your walking has become unsteady', tell: 'my walking has become unsteady' },
  ],
  'wrf-crps': [
    { key: 'since', combo: true, text: 'Since a wrist injury, operation or cast: burning, swelling, shiny skin, colour or temperature changes, or light touch hurts', tell: 'since the injury my hand burns, swells or changes colour' },
  ],
  'wrf-oldscaphoid': [
    { key: 'thumb', combo: true, text: 'Since a fall onto the hand weeks or months ago: pain still in the hollow at the base of the thumb, never X-rayed', tell: 'since a fall weeks ago I still have pain at the base of my thumb, and it was never X-rayed' },
  ],
  'wrf-stress': [
    { key: 'gym', combo: true, text: 'You take weight on your hands in gymnastics or sport, with a deep ache just above the wrist, worse with handstands or tumbling', tell: 'I take weight on my hands in sport and have a deep ache above my wrist' },
  ],
  'pc-limb': [
    { key: 'skin', text: 'The painful arm or leg changing colour or temperature', tell: 'my painful limb is changing colour or temperature' },
    { key: 'sweat', text: 'The painful arm or leg sweating or swelling more than the other', tell: 'my painful limb is sweating or swelling' },
  ],
  // ── Hand ──
  'pc-hand-procedure': [
    { key: 'infect', text: 'A hot, red, increasingly swollen hand, pus, spreading redness or a fever', tell: 'since the procedure my hand is hot, red and swelling' },
    { key: 'numb', text: 'New numbness in a fingertip', tell: 'since the procedure a fingertip is numb' },
    { key: 'bend', text: 'A finger you suddenly cannot bend', tell: 'since the procedure I suddenly cannot bend a finger' },
  ],
  'hnd-compartment': [
    { key: 'tight', combo: true, text: 'Forearm or hand pain far worse than expected, still climbing even with pain relief, and the muscle tight and swollen', tell: 'my hand pain is far worse than expected and still climbing, and the muscle is tight and swollen' },
    { key: 'fingers', combo: true, text: 'Forearm or hand pain far worse than expected, still climbing even with pain relief, and much worse when your fingers are moved', tell: 'my hand pain is far worse than expected and still climbing, and much worse when my fingers move' },
  ],
  'hnd-bite': [
    { key: 'finger', combo: true, text: 'One whole finger swollen, held slightly bent, and very painful to straighten (often after a cut, bite, splinter or prick)', tell: 'one whole finger is swollen, held bent and very painful to straighten' },
  ],
  'hnd-inject': [
    { key: 'gun', text: 'Paint, grease or oil forced into your hand by a spray or grease gun', tell: 'paint or grease was forced into my hand by a spray or grease gun' },
  ],
  'hnd-hot': [
    { key: 'fever', combo: true, text: 'A hot, red or swollen joint, with a fever or feeling very unwell', tell: 'my joint is hot and swollen and I have a fever' },
  ],
  'hnd-cast': [
    { key: 'tight', text: 'A cast, splint or bandage getting tighter and sorer (do not cut it off)', tell: 'my cast is getting tighter and more painful' },
  ],
  'hnd-felon': [
    { key: 'tip', text: 'A tense, throbbing, swollen fingertip', tell: 'I have a tense, throbbing, swollen fingertip' },
    { key: 'pus', text: 'Pus around a nail', tell: 'I have pus around a nail' },
  ],
  'hnd-gout': [
    { key: 'overnight', combo: true, text: 'A joint became hot, swollen and very painful overnight, and you have had gout or pseudogout before', tell: 'a joint became hot and swollen overnight, and I have had gout before' },
  ],
  'hnd-inflam': [
    { key: 'knuckles', text: 'Knuckles in both hands swollen and stiff for over an hour each morning', tell: 'my knuckles are swollen and stiff for over an hour each morning' },
    { key: 'sausage', text: 'A whole finger swollen like a sausage', tell: 'a whole finger is swollen like a sausage' },
  ],
  'hnd-raynaud': [
    { key: 'cold', text: 'Fingers going white, then blue, in the cold', tell: 'my fingers go white, then blue, in the cold' },
    { key: 'sore', text: 'A sore or ulcer on a fingertip', tell: 'I have a sore on a fingertip' },
  ],
  'hnd-coldfinger': [
    { key: 'finger', text: 'One finger cold, white or blue and painful, not warming up', tell: 'one finger is cold, white and painful, and it does not warm up' },
  ],
  'hnd-ring': [
    { key: 'ring', text: 'A ring stuck on a finger that is swelling', tell: 'a ring is stuck on a swelling finger' },
  ],
  'hnd-crps': [
    { key: 'since', combo: true, text: 'Since a hand injury, operation or cast: burning, swelling, shiny skin, colour or temperature changes, or light touch hurts', tell: 'since the injury my hand burns, swells or changes colour' },
  ],
  'hnd-lump': [
    { key: 'grow', text: 'A hard lump that is growing quickly over weeks', tell: 'I have a hard lump that is growing quickly' },
    { key: 'pain', text: 'A hard lump that is painful', tell: 'I have a painful hard lump' },
    { key: 'big', text: 'A deep lump larger than a few centimetres', tell: 'I have a deep lump larger than a few centimetres' },
    { key: 'nail', text: 'A new dark streak under a nail', tell: 'I have a new dark streak under a nail' },
  ],
  // ── Forearm ──
  'frf-necfasc': [
    { key: 'pain', combo: true, text: 'A hot, red area on your forearm spreading fast, with pain far worse than it looks', tell: 'a hot red area is spreading fast and the pain is far worse than it looks' },
    { key: 'unwell', combo: true, text: 'A hot, red area on your forearm spreading fast, and you feel very unwell', tell: 'a hot red area is spreading fast and I feel very unwell' },
  ],
  'frf-cardiac': [
    { key: 'effort', text: 'Pain inside your left forearm or arm when you walk fast or climb stairs', tell: 'my left arm hurts when I walk fast or climb stairs' },
    { key: 'chest', text: 'With the pain: chest tightness', tell: 'I have chest tightness with it' },
    { key: 'breath', text: 'With the pain: short of breath or sweating', tell: 'I am short of breath or sweating with it' },
  ],
  'frf-stroke': [
    { key: 'face', text: 'One side of your face drooping', tell: 'one side of my face is drooping' },
    { key: 'side', text: 'Weakness or numbness down one whole side', tell: 'one whole side of my body is weak or numb' },
    { key: 'speech', text: 'Trouble speaking', tell: 'I have trouble speaking' },
  ],
  'frf-nerve': [
    { key: 'weaker', text: 'Your hand getting weaker', tell: 'my hand is getting weaker' },
    { key: 'wrist', text: 'You cannot lift your wrist', tell: 'I cannot lift my wrist' },
    { key: 'ok', text: 'You cannot make an "OK" sign with your thumb and first finger', tell: 'I cannot make an OK sign with my thumb and finger' },
  ],
  'frf-pancoast': [
    { key: 'smoker', combo: true, text: 'You smoke (or did), and pain runs down the little-finger side of your forearm, with a lasting cough or a drooping eyelid', tell: 'I smoke or did, and pain runs down my forearm with a lasting cough or a drooping eyelid' },
  ],
  'frf-stress': [
    { key: 'gym', combo: true, text: 'You are a young gymnast or weight-bearing athlete, with deep, pinpoint bone pain in the forearm, worse with loading', tell: 'I am a young gymnast with pinpoint bone pain in my forearm' },
  ],
  'frf-shingles': [
    { key: 'band', text: 'A band of burning pain down the forearm, with a rash or blisters', tell: 'I have a band of burning pain down my forearm with a rash' },
  ],
  // ── Upper arm ──
  'arf-cardiac': [
    { key: 'effort', text: 'Arm pain, especially inside the left arm, when you walk fast or climb stairs', tell: 'my arm hurts when I walk fast or climb stairs' },
    { key: 'chest', text: 'With the pain: chest tightness or jaw pain', tell: 'I have chest tightness or jaw pain with it' },
    { key: 'breath', text: 'With the pain: short of breath or sweating', tell: 'I am short of breath or sweating with it' },
  ],
  'arf-clotlung': [
    { key: 'arm', combo: true, text: 'Your whole arm suddenly swollen, heavy or bluish, and you are short of breath or have chest pain', tell: 'my arm suddenly swelled and turned bluish, and I am short of breath or have chest pain' },
  ],
  'arf-clot': [
    { key: 'arm', text: 'Your whole arm swollen, heavy or bluish over a day or two', tell: 'my whole arm has become swollen, heavy or bluish' },
  ],
  'arf-pancoast': [
    { key: 'smoker', combo: true, text: 'You smoke (or did), and pain runs down the inside of your arm to your little finger, with a lasting cough or a drooping eyelid', tell: 'I smoke or did, and pain runs down my arm with a lasting cough or a drooping eyelid' },
  ],
  'arf-pta': [
    { key: 'weak', combo: true, text: 'Sudden, very bad arm or shoulder pain with no injury for several days, and then your arm muscles became weak or thin', tell: 'I had sudden, very bad arm pain for days, and now my arm is weak' },
  ],
  'arf-shingles': [
    { key: 'band', text: 'A band of burning pain down the arm, with a rash or blisters', tell: 'I have a band of burning pain down my arm with a rash' },
  ],
  // ── Mid back (and front of the chest) ──
  'trf-aorta': [
    { key: 'tear', text: 'Sudden tearing or ripping pain in your mid back, or spreading into your chest', tell: 'I have a sudden tearing pain in my back' },
  ],
  'trf-cardiac': [
    { key: 'chest', text: 'Chest tightness, shortness of breath or sweating with the pain', tell: 'I have chest tightness, breathlessness or sweating with it' },
    { key: 'effort', combo: true, text: 'Pain brought on by effort, and spreading to your arm or jaw', tell: 'the pain comes on with effort and spreads to my arm or jaw' },
  ],
  'trf-cord': [
    { key: 'hold', text: 'You cannot hold your pee or poo', tell: 'I cannot control my bladder or bowels' },
  ],
  'trf-fracture': [
    { key: 'crash', text: 'A car crash', tell: 'I was in a car crash in the last few days' },
    { key: 'height', text: 'A fall from a height, like a ladder, stairs or a roof', tell: 'I fell from a height in the last few days' },
    { key: 'blow', text: 'A hard blow to the back', tell: 'I had a hard blow to my back in the last few days' },
  ],
  'trf-cancer': [
    { key: 'past', combo: true, text: 'You have had cancer before, and this mid-back pain is new', tell: 'I have had cancer before, and this back pain is new' },
  ],
  'trf-osteo': [
    { key: 'strain', combo: true, text: 'Pain came on suddenly after a small strain, cough, lift or fall from standing, and you are over 50, have weak bones or take steroid tablets', tell: 'the pain came on suddenly after a small strain, and I am over 50 or have weak bones' },
  ],
  'trf-infection': [
    { key: 'fever', text: 'A fever or chills with the back pain', tell: 'I have a fever or chills' },
    { key: 'immune', text: 'A weak immune system, from an illness or medicines', tell: 'I have a weak immune system' },
    { key: 'drugs', text: 'You have injected drugs', tell: 'I have injected drugs' },
  ],
  'trf-kidney': [
    { key: 'fever', combo: true, text: 'Pain in your side or lower ribs, with a fever', tell: 'I have pain in my side with a fever' },
    { key: 'pee', combo: true, text: 'Pain in your side or lower ribs, with burning or blood when you pee', tell: 'I have side pain and it burns when I pee' },
  ],
  'trf-gut': [
    { key: 'eating', text: 'Pain linked to eating, or heartburn', tell: 'the pain is linked to eating, or I have heartburn' },
    { key: 'black', text: 'Black, tarry poo', tell: 'my poo is black' },
    { key: 'fatty', text: 'Pain under your right shoulder blade after fatty meals', tell: 'the pain comes under my right shoulder blade after fatty meals' },
  ],
  // ── Base of the neck ──
  'crf-aorta': [
    { key: 'tear', text: 'Sudden tearing or ripping pain between your shoulder blades, or spreading into your chest', tell: 'I have a sudden tearing pain between my shoulder blades' },
  ],
  'crf-cardiac': [
    { key: 'chest', text: 'Chest tightness, shortness of breath or sweating with the pain', tell: 'I have chest tightness, breathlessness or sweating with it' },
    { key: 'effort', combo: true, text: 'Pain brought on by effort, and spreading to your left arm or jaw', tell: 'the pain comes on with effort and spreads to my left arm or jaw' },
  ],
  'crf-cord-legs': [
    { key: 'legs', text: 'New weakness, numbness or unsteadiness in both legs, coming on suddenly', tell: 'both my legs suddenly became weak, numb or unsteady' },
  ],
  'crf-trauma5d': [
    { key: 'dizzy', text: 'Dizziness', tell: 'I am dizzy' },
    { key: 'vision', text: 'Double vision', tell: 'I have double vision' },
    { key: 'speech', text: 'Slurred speech', tell: 'my speech is slurred' },
    { key: 'swallow', text: 'Trouble swallowing', tell: 'I have trouble swallowing' },
    { key: 'falls', text: 'Sudden falls or blackouts', tell: 'I have had sudden falls or blackouts' },
    { key: 'sick', text: 'Feeling sick', tell: 'I feel sick' },
    { key: 'numb', text: 'Numbness in your face or around your lips', tell: 'my face or lips are numb' },
    { key: 'eyes', text: 'Eyes that flicker or jump', tell: 'my eyes flicker or jump' },
  ],
  'crf-trauma5d-doc': [
    { key: 'dizzy', text: 'Dizziness that keeps coming back or will not go away', tell: 'since the accident, dizziness keeps coming back' },
    { key: 'vision', text: 'Double vision', tell: 'I have double vision' },
    { key: 'speech', text: 'Slurred speech', tell: 'my speech is slurred' },
    { key: 'swallow', text: 'Trouble swallowing', tell: 'I have trouble swallowing' },
    { key: 'falls', text: 'Sudden falls or blackouts', tell: 'I have had sudden falls or blackouts' },
    { key: 'sick', text: 'Feeling sick', tell: 'I feel sick' },
    { key: 'numb', text: 'Numbness in your face or around your lips', tell: 'my face or lips are numb' },
    { key: 'eyes', text: 'Eyes that flicker or jump', tell: 'my eyes flicker or jump' },
  ],
  'crf-pancoast': [
    { key: 'smoker', combo: true, text: 'You smoke (or did), and have a cough that will not go away, coughed up blood, or a drooping eyelid on the painful side', tell: 'I smoke or did, and I have a lasting cough, coughed up blood or a drooping eyelid' },
  ],
  'crf-osteo': [
    { key: 'strain', combo: true, text: 'Pain came on suddenly after a small strain, cough or lift, and you have weak bones or take steroid tablets', tell: 'the pain came on suddenly after a small strain, and I have weak bones or take steroids' },
  ],
  'crf-wasting': [
    { key: 'thin', text: 'The small muscles of your hand getting thinner', tell: 'the small muscles of my hand are getting thinner' },
    { key: 'grip', text: 'Your grip has become weak', tell: 'my grip has become weak' },
  ],
  'crf-vascular': [
    { key: 'colour', text: 'Your arm or hand turning pale, blue or cold, especially with the arm raised', tell: 'my arm or hand turns pale, blue or cold' },
    { key: 'swell', text: 'Your arm or hand swelling, especially with the arm raised', tell: 'my arm or hand swells' },
  ],
  'crf-oesophagus': [
    { key: 'swallow', text: 'Pain when you swallow', tell: 'it hurts when I swallow' },
    { key: 'stick', text: 'Food feels like it sticks on the way down', tell: 'food feels like it sticks on the way down' },
  ],
  'hpf-cancer': [
    { key: 'past', text: 'You have had cancer before', tell: 'I have had cancer before' },
    { key: 'night', combo: true, text: 'Deep pain at night that does not change however you lie, with weight loss', tell: 'I have deep pain at night and I am losing weight' },
  ],
  'jrf-shingles': [
    { key: 'band', text: 'A band of burning pain on one side, with a rash or blisters', tell: 'I have a band of burning pain with a rash' },
  ],
}

/* Questions worded exactly like another area's: the same ticks, bullet and heading. */
for (const [copy, from] of [['nrf-kehr', 'srf-kehr'], ['nrf-tip', 'srf-organ'], ['hnd-stroke', 'wrf-stroke'], ['hnd-numb', 'wrf-numb'], ['hnd-myelo', 'wrf-myelo'],
  ['frf-compartment', 'wrf-compartment'], ['frf-cast', 'erf-cast'], ['frf-cellulitis', 'erf-cellulitis'], ['frf-myelo', 'erf-myelo'],
  ['arf-stroke', 'frf-stroke'], ['arf-rhabdo', 'srf-rhabdo'], ['arf-cellulitis', 'erf-cellulitis'], ['arf-myelo', 'erf-myelo'],
  ['trf-lung', 'srf-lung'], ['trf-pancreas', 'jrf-pancreas'], ['trf-cord-legs', 'jrf-conus-legs'], ['trf-myelo', 'jrf-legs'], ['trf-shingles', 'jrf-shingles'],
  ['crf-lung', 'srf-lung'], ['crf-cord', 'trf-cord'], ['crf-gallbladder', 'srf-organ'], ['crf-shingles', 'jrf-shingles'],
  ['jrf-kidney', 'rf-kidney'], ['jrf-cancer', 'rf-cancer'], ['jrf-osteo', 'rf-osteo'], ['jrf-infection', 'trf-infection']]) {
  TICKS[copy] = TICKS[from]
  PLAIN_SHORT[copy] = PLAIN_SHORT[from]
  if (PLAIN_Q[from]) PLAIN_Q[copy] = PLAIN_Q[from]
  if (SUBHEAD[from]) SUBHEAD[copy] = SUBHEAD[from]
}

/* A question whose signs another question on the same page already asks
   (by): not shown, as its ticks would repeat. The other question leads to
   the same tier. A sign only the hidden question asks is carried over as an
   extra tick on the one shown (adopt), so nothing is lost. */
export const COVERED = {
  'pc-urinary': { by: ['rf-kidney', 'hpf-kidney', 'trf-kidney', 'jrf-kidney'] },
  'rf-aaa': { by: ['hpf-aaa', 'jrf-aaa'] },
  // An area's own heart question asks these signs (the page leaves pc-cardiac out too).
  'pc-cardiac': { by: ['trf-cardiac', 'nrf-cardiac', 'rf-cardiac1', 'arf-cardiac', 'frf-cardiac', 'crf-cardiac', 'mrf-cardiac'] },
  // An area's own stroke question asks these signs (the page leaves pc-stroke out too).
  'pc-stroke': { by: ['nrf-stroke', 'hrf-stroke', 'arf-stroke', 'frf-stroke', 'wrf-stroke', 'hnd-stroke'] },
  'jrf-aaa': { by: ['hpf-aaa'] },
  'hpf-kidney': { by: ['rf-kidney'] },
  'hpf-torsion': { by: ['jrf-testis'] },
  'hpf-pelvic': { by: ['rf-pelvic'], adopt: [{ key: 'discharge', sex: 'female', text: 'Unusual discharge from your vagina', tell: 'I have unusual discharge' }],
    // The bullet of the question shown, naming the sign carried over too.
    short: { female: 'Pain with your periods, or unusual bleeding or discharge', male: 'New trouble peeing', any: 'Pain with periods, unusual bleeding or discharge, or trouble peeing' } },
}
const byOf = (id) => [].concat((COVERED[id] && COVERED[id].by) || [])
/** The list without the questions another one on it covers, and their ids. */
export function coverOut(list = []) {
  const ids = new Set(list.map((f) => f.id))
  const covered = list.filter((f) => byOf(f.id).some((b) => ids.has(b))).map((f) => f.id)
  return { kept: list.filter((f) => !covered.includes(f.id)), covered }
}

/* Ticks another question on the same area's page already asks: left out
   there (the lower back asks fever in rf-infection and cancer in rf-cancer). */
export const TICK_SKIP = { lowerback: ['sc-systemic~fever', 'sc-systemic~cancer'], knee: ['sc-systemic~cancer'],
  // The ankle's own cancer question asks past cancer, a growing lump and night pain.
  ankle: ['sc-systemic~cancer', 'sc-systemic~lump', 'sc-systemic~night'],
  // The foot's lump question asks a growing lump and night pain.
  foot: ['sc-systemic~lump', 'sc-systemic~night'],
  // The thigh's own cancer question asks past cancer.
  thigh: ['sc-systemic~cancer'],
  // The lower leg's own cancer question asks past cancer.
  lowerleg: ['sc-systemic~cancer'],
  // The hand's lump question asks a growing lump.
  hand: ['sc-systemic~lump'],
  // The mid back asks fever in trf-infection and cancer in trf-cancer.
  upperback: ['sc-systemic~fever', 'sc-systemic~cancer'],
  // The mid-to-low back asks fever in jrf-infection and cancer in jrf-cancer.
  tlj: ['sc-systemic~fever', 'sc-systemic~cancer'] }

/* Ticks are kept in the flags list as "<question>~<tick>". */
export const tickId = (qid, key) => `${qid}~${key}`
export const ticksFor = (qid, sex, area, covered = []) => {
  const skip = [].concat(area || []).flatMap((a) => TICK_SKIP[a] || [])
  const adopted = covered.filter((c) => byOf(c).includes(qid)).flatMap((c) => COVERED[c].adopt || [])
  return [...(TICKS[qid] || []), ...adopted].filter((t) => (!t.sex || !sex || t.sex === sex) && !skip.includes(tickId(qid, t.key)))
}
// Only while the question itself is still ticked (a stale tick never counts).
const allTicks = (qid) => [...(TICKS[qid] || []), ...Object.values(COVERED).filter((c) => c.by.includes(qid)).flatMap((c) => c.adopt || [])]
export const tickedOf = (qid, flags = []) => (flags.includes(qid) ? allTicks(qid).filter((t) => flags.includes(tickId(qid, t.key))) : [])

/** Toggle one tick, and keep its question ticked while any of its ticks is. */
export function toggleTick(flags, qid, key) {
  const id = tickId(qid, key)
  let next = flags.includes(id) ? flags.filter((x) => x !== id) : [...flags, id]
  const any = next.some((x) => x.startsWith(`${qid}~`))
  if (any && !next.includes(qid)) next = [...next, qid]
  if (!any) next = next.filter((x) => x !== qid)
  return next
}
/** Remove a question and all its ticks. */
export const clearQuestion = (flags, qid) => flags.filter((x) => x !== qid && !x.startsWith(`${qid}~`))

/* "When did this start?" after a nerve sign. */
export const WHEN_Q = { id: 'lb:when', text: 'When did this start?', options: [
  { id: 'today', label: 'Today', tell: 'It started today.' },
  { id: 'days', label: 'In the last few days', tell: 'It started in the last few days.' },
  { id: 'weeks', label: 'Weeks ago, or longer', tell: 'It started weeks ago.' },
] }
export const WHEN_FOR = ['erf-myelo', 'wrf-myelo', 'hnd-myelo', 'frf-myelo', 'arf-myelo', 'rf-saddle', 'rf-bladder', 'rf-sexual', 'rf-legs', 'jrf-conus-legs', 'nrf-cord', 'nrf-cord-legs', 'nrf-myelo', 'trf-cord', 'trf-cord-legs', 'crf-cord', 'crf-cord-legs', 'kf-cauda', 'hpf-cauda', 'jrf-conus', 'tgf-cauda', 'lgf-cauda']

/** The "Tell them" sentence, from the ticks (null when nothing was ticked). */
export function tellThem(flags = [], answers = {}, area = 'lowerback') {
  const tells = [...new Set(flags.filter((x) => !x.includes('~')))].flatMap((qid) => tickedOf(qid, flags).map((t) => t.tell))
  if (!tells.length) return null
  const list = tells.length === 1 ? tells[0] : `${tells.slice(0, -1).join(', ')} and ${tells[tells.length - 1]}`
  // "When" belongs to the nerve signs: told only while one of them is ticked.
  const when = WHEN_FOR.some((q) => flags.includes(q)) && WHEN_Q.options.find((o) => o.id === answers[WHEN_Q.id])
  return `I have ${painWord(area)}, and ${list}.${when ? ` ${when.tell}` : ''}`
}

/** The ticked signs, for Chandra's summary. */
export const tickedText = (qid, flags = []) => tickedOf(qid, flags).map((t) => t.text)
