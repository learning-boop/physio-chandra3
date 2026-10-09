/* ─────────────────────────────────────────────────────────────────────────
   Plain question design (Chandra, 8 Oct 2026: "keep the questions to the
   patient level, but the reasoning and analysis at senior expert level").
   Lower back first (prototype), then the neck, the shoulder, the knee, the
   hip, the ankle and the foot; and drawings of several of these areas together (plainAreas).

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

export const PLAIN_AREAS = ['lowerback', 'neck', 'shoulder', 'knee', 'hip', 'ankle', 'foot']
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
  'em-nerve': { lowerback: 'Since your back pain started, have you noticed any of these?', neck: 'Along with your neck pain, have you noticed any of these?', any: 'Since this pain started, have you noticed any of these?' },
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
export const AREA_WORD = { lowerback: 'low back', neck: 'neck', shoulder: 'shoulder', knee: 'knee', hip: 'hip', ankle: 'ankle', foot: 'foot' }
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
  'sc-systemic': { lowerback: 'Weight loss, a growing lump, or bad night pain', knee: 'Fever, weight loss, a growing lump, or bad night pain', ankle: 'Fever, or weight loss without trying', foot: 'Fever, weight loss, or past cancer', any: 'Fever, weight loss, a lump, night pain, or past cancer' },
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
  'rf-hotjoint': 'A hot, swollen joint with a fever, or after an injection',
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
}

/** A bullet, for this area or birth sex where it differs; when it carries
    over a covered question's sign, the bullet that names it too. */
export const shortFor = (qid, sex, area, covered = []) => {
  const c = covered.find((x) => COVERED[x] && COVERED[x].short && [].concat(COVERED[x].by).includes(qid))
  const s = c ? COVERED[c].short : PLAIN_SHORT[qid]
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
    { key: 'injection', combo: true, text: 'A hot, red or swollen joint after a recent injection', tell: 'my joint is hot and swollen after an injection' },
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
  'hpf-cancer': [
    { key: 'past', text: 'You have had cancer before', tell: 'I have had cancer before' },
    { key: 'night', combo: true, text: 'Deep pain at night that does not change however you lie, with weight loss', tell: 'I have deep pain at night and I am losing weight' },
  ],
  'jrf-shingles': [
    { key: 'band', text: 'A band of burning pain on one side, with a rash or blisters', tell: 'I have a band of burning pain with a rash' },
  ],
}

/* A question whose signs another question on the same page already asks
   (by): not shown, as its ticks would repeat. The other question leads to
   the same tier. A sign only the hidden question asks is carried over as an
   extra tick on the one shown (adopt), so nothing is lost. */
export const COVERED = {
  'pc-urinary': { by: ['rf-kidney', 'hpf-kidney'] },
  'rf-aaa': { by: ['hpf-aaa', 'jrf-aaa'] },
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
  foot: ['sc-systemic~lump', 'sc-systemic~night'] }

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
export const WHEN_FOR = ['rf-saddle', 'rf-bladder', 'rf-sexual', 'rf-legs', 'jrf-conus-legs', 'nrf-cord', 'nrf-cord-legs', 'nrf-myelo', 'kf-cauda', 'hpf-cauda', 'jrf-conus']

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
