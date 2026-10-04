/* ─────────────────────────────────────────────────────────────────────────
   Smarter doctor page: mechanism first, then gateway groups.
   Knee prototype (Chandra, 4 Oct 2026), extended the same day to the foot,
   hip and ankle, then the back (lower back, mid back, thoracolumbar
   junction), neck and shoulder, and then every other area. The back, pelvis,
   tailbone and jaw have no injury screen, so they get the grouped doctor
   page only.

   It runs when ONE of these areas is the only one drawn (AREAS below):
   1. Mechanism first. The area's injury screen ("Have you injured your …
      in the last 6 weeks…?") runs straight after the emergency page, before
      the doctor page, and its answer filters the doctor page (MECHANISM).
      Emergencies stay first and mandatory.
   2. Gateways. Related see-a-doctor questions are grouped behind one plain-
      language question built from the key signs of the questions that apply
      to this person (GATES, SIGNS). Ticking a group opens its specific
      questions; "Not sure which" still flags it for a doctor, as urgently as
      its most urgent question. A group with only one question that applies
      is shown as that question, with no gateway. The same red flags are
      asked; most people answer four or five groups instead of ten questions.

   Never filtered by mechanism: emergencies; clot, infection, cancer,
   tumour and inflammatory questions; fragile-bone fractures (the hip's
   "sudden pain with no fall"); and anything for a child. Tumour pain is
   often put down to a small knock, an injury raises the clot risk, and
   fragile bones break without a remembered injury.
   ───────────────────────────────────────────────────────────────────────── */

/* The areas it runs for: the drawn zone type → its injury screen and groups. */
export const AREAS = ['knee', 'foot', 'hip', 'ankle', 'lowerback', 'upperback', 'tlj', 'neck', 'shoulder',
  'ctj', 'sij', 'coccyx', 'jaw', 'head', 'upperarm', 'elbow', 'forearm', 'wrist', 'hand', 'thigh', 'lowerleg']

/* Gateway groups per area. Each takes the place of its most severe member
   on the page (the page is sorted by severity first). */
export const GATES = {
  knee: [
    { id: 'knee-infection', title: 'Signs of infection or a flare-up', members: ['kf-replacement', 'kf-gout', 'kf-inflam'] },
    { id: 'knee-circulation', title: 'Signs of a clot or a circulation problem', members: ['kf-dvt', 'kf-artery'] },
    { id: 'knee-medical', title: 'Signs that need a medical check', members: ['kf-cancer', 'kf-tumour', 'kf-stress', 'kf-sufe', 'kf-perthes', 'sc-systemic'] },
  ],
  foot: [
    { id: 'foot-infection', title: 'Signs of infection or a flare-up', members: ['ft-puncture', 'ft-charcot', 'ft-gout', 'ft-inflam'] },
    { id: 'foot-circulation', title: 'Signs of a circulation problem or a tight cast', members: ['ft-cast', 'ft-claudication'] },
    { id: 'foot-nerve', title: 'Changes in feeling or strength', members: ['ft-neuropathy', 'ft-footdrop', 'ft-crps', 'sc-neuro'] },
    { id: 'foot-medical', title: 'Signs that need a medical check', members: ['ft-stress', 'ft-lump', 'sc-systemic'] },
  ],
  hip: [
    { id: 'hip-surgery', title: 'Signs of a problem after hip surgery, or a clot', members: ['hpf-replacement', 'hpf-dvt'] },
    { id: 'hip-bone', title: 'Signs of a problem in the bone', members: ['hpf-nofall', 'hpf-stress', 'hpf-avn', 'hpf-sufe'] },
    { id: 'hip-organ', title: 'Signs coming from the tummy or pelvis', members: ['hpf-hernia', 'hpf-kidney', 'pc-urinary', 'hpf-pelvic'] },
    { id: 'hip-medical', title: 'Signs that need a medical check', members: ['hpf-cancer', 'sc-systemic'] },
  ],
  // Lower back (zone type lowerback): no injury screen, so groups only.
  lowerback: [
    { id: 'lowback-bone', title: 'Signs of a problem in the bone', members: ['rf-osteo', 'sc-trauma', 'rf-cancer', 'rf-spondy'] },
    { id: 'lowback-infection', title: 'Signs of infection or another medical cause', members: ['rf-infection', 'sc-systemic'] },
    { id: 'lowback-organ', title: 'Signs coming from inside the body', members: ['rf-kidney', 'pc-urinary', 'rf-pelvic', 'rf-aaa-slow'] },
    { id: 'lowback-nerve', title: 'Changes in feeling or strength', members: ['rf-footdrop', 'sc-neuro'] },
  ],
  // Mid back and front of the chest (zone type upperback).
  upperback: [
    { id: 'upperback-bone', title: 'Signs of a problem in the bone', members: ['trf-osteo', 'sc-trauma', 'trf-cancer'] },
    { id: 'upperback-infection', title: 'Signs of infection or another medical cause', members: ['trf-infection', 'trf-shingles', 'sc-systemic'] },
    { id: 'upperback-organ', title: 'Signs coming from inside the body', members: ['trf-kidney', 'trf-gut', 'pc-visceral'] },
    { id: 'upperback-nerve', title: 'Changes in feeling or strength', members: ['trf-myelo', 'sc-neuro'] },
  ],
  // Thoracolumbar junction (zone type tlj).
  tlj: [
    { id: 'tlj-bone', title: 'Signs of a problem in the bone', members: ['jrf-osteo', 'sc-trauma', 'jrf-cancer'] },
    { id: 'tlj-infection', title: 'Signs of infection or another medical cause', members: ['jrf-infection', 'jrf-shingles', 'sc-systemic'] },
    { id: 'tlj-organ', title: 'Signs coming from inside the body', members: ['jrf-kidney', 'pc-urinary', 'pc-visceral'] },
    { id: 'tlj-nerve', title: 'Changes in feeling or strength', members: ['jrf-legs', 'sc-neuro'] },
  ],
  neck: [
    { id: 'neck-cord', title: 'Signs of pressure on the spinal cord or an unstable upper neck', members: ['nrf-myelo', 'nrf-upperinstab'] },
  ],
  shoulder: [
    { id: 'shoulder-medical', title: 'Signs coming from the chest or tummy, or that need a medical check', members: ['srf-pancoast', 'srf-organ', 'sc-systemic'] },
    { id: 'shoulder-nerve', title: 'Changes in feeling or strength', members: ['srf-pta', 'sc-neuro'] },
  ],
  // Base of the neck (CTJ; the neck injury screen).
  ctj: [
    { id: 'ctj-arm', title: 'Changes in the arm or hand', members: ['crf-wasting', 'crf-vascular', 'sc-neuro'] },
    { id: 'ctj-organ', title: 'Signs coming from the chest or tummy', members: ['crf-pancoast', 'crf-gallbladder', 'crf-oesophagus'] },
    { id: 'ctj-medical', title: 'Signs that need a medical check', members: ['crf-osteo', 'crf-shingles', 'sc-systemic'] },
  ],
  // Back of the pelvis and buttock: no injury screen.
  sij: [
    { id: 'sij-bone', title: 'Signs of a problem in the bone', members: ['prf-osteo', 'sc-trauma', 'prf-cancer'] },
    { id: 'sij-infection', title: 'Signs of infection or another medical cause', members: ['prf-infection', 'sc-systemic'] },
    { id: 'sij-organ', title: 'Signs coming from inside the body', members: ['prf-kidney', 'pc-urinary', 'prf-pelvic'] },
  ],
  // Tailbone: no injury screen.
  coccyx: [
    { id: 'coccyx-bowel', title: 'Signs coming from the bowel or bottom', members: ['xrf-bowel', 'xrf-pilonidal', 'xrf-sphincter'] },
    { id: 'coccyx-bone', title: 'Signs of a problem in the bone', members: ['xrf-osteo', 'sc-trauma'] },
    { id: 'coccyx-medical', title: 'Signs that need a medical check', members: ['xrf-cancer', 'xrf-constant', 'sc-systemic'] },
  ],
  // Jaw: no injury screen.
  jaw: [
    { id: 'jaw-injury', title: 'After a blow or a fall', members: ['mrf-fracture', 'sc-trauma'] },
    { id: 'jaw-infection', title: 'Signs of infection, or coming from the ear or throat', members: ['mrf-infection', 'mrf-ear', 'mrf-throat'] },
    { id: 'jaw-medical', title: 'Signs that need a medical check', members: ['mrf-numb', 'mrf-lump', 'pc-acromegaly', 'sc-systemic'] },
  ],
  // Head (the head injury screen).
  head: [
    { id: 'head-pattern', title: 'A headache that is new or changing', members: ['hrf-new50', 'hrf-pressure', 'hrf-medication', 'hrf-pregnancy', 'hrf-cad'] },
    { id: 'head-medical', title: 'Other signs that need a medical check', members: ['sc-neuro', 'sc-systemic'] },
  ],
  // Upper arm (the arm injury screen).
  upperarm: [
    { id: 'arm-skin', title: 'Signs of infection or a clot', members: ['arf-cellulitis', 'arf-clot'] },
    { id: 'arm-nerve', title: 'Changes in feeling or strength', members: ['arf-myelo', 'arf-pta', 'arf-shingles', 'sc-neuro'] },
    { id: 'arm-medical', title: 'Signs that need a medical check', members: ['arf-pancoast', 'sc-systemic'] },
  ],
  // Elbow.
  elbow: [
    { id: 'elbow-infection', title: 'Signs of infection or a flare-up', members: ['erf-bursa', 'erf-gout'] },
    { id: 'elbow-nerve', title: 'Changes in feeling or strength', members: ['erf-nerve', 'erf-myelo', 'erf-pta', 'sc-neuro'] },
  ],
  // Forearm.
  forearm: [
    { id: 'forearm-skin', title: 'Signs of infection or a tight cast', members: ['frf-cast', 'frf-cellulitis'] },
    { id: 'forearm-nerve', title: 'Changes in feeling or strength', members: ['frf-nerve', 'frf-myelo', 'frf-shingles', 'sc-neuro'] },
    { id: 'forearm-medical', title: 'Signs that need a medical check', members: ['frf-pancoast', 'frf-stress', 'sc-systemic'] },
  ],
  // Wrist.
  wrist: [
    { id: 'wrist-circulation', title: 'Signs of a tight cast or a circulation problem', members: ['wrf-cast', 'wrf-raynaud'] },
    { id: 'wrist-flare', title: 'Signs of a flare-up', members: ['wrf-gout', 'wrf-inflam'] },
    { id: 'wrist-nerve', title: 'Changes in feeling or strength', members: ['wrf-numb', 'wrf-myelo', 'wrf-crps', 'sc-neuro'] },
  ],
  // Hand and fingers.
  hand: [
    { id: 'hand-circulation', title: 'Signs of a tight cast or a circulation problem', members: ['hnd-cast', 'hnd-raynaud'] },
    { id: 'hand-infection', title: 'Signs of infection or a flare-up', members: ['hnd-felon', 'hnd-gout', 'hnd-inflam'] },
    { id: 'hand-nerve', title: 'Changes in feeling or strength', members: ['hnd-numb', 'hnd-myelo', 'hnd-crps', 'sc-neuro'] },
    { id: 'hand-medical', title: 'Signs that need a medical check', members: ['hnd-lump', 'sc-systemic'] },
  ],
  // Thigh.
  thigh: [
    { id: 'thigh-circulation', title: 'Signs of a clot, an infection or a circulation problem', members: ['tgf-dvt', 'tgf-cellulitis', 'tgf-claudication'] },
    { id: 'thigh-nerve', title: 'Changes in feeling or strength', members: ['tgf-femoral', 'sc-neuro'] },
    { id: 'thigh-medical', title: 'Signs that need a medical check', members: ['tgf-stress', 'tgf-tumour', 'tgf-sufe', 'tgf-cancer', 'sc-systemic'] },
  ],
  // Lower leg (calf and shin; the leg injury screen).
  lowerleg: [
    { id: 'leg-circulation', title: 'Signs of a clot, an infection, a tight cast or a circulation problem', members: ['lgf-cast', 'lgf-dvt', 'lgf-cellulitis', 'lgf-claudication'] },
    { id: 'leg-nerve', title: 'Changes in feeling or strength', members: ['lgf-footdrop', 'lgf-neuropathy', 'sc-neuro'] },
    { id: 'leg-medical', title: 'Signs that need a medical check', members: ['lgf-stress', 'lgf-tumour', 'lgf-cancer', 'sc-systemic'] },
  ],
  ankle: [
    { id: 'ankle-circulation', title: 'Signs of a clot or a tight cast', members: ['af-cast', 'af-dvt'] },
    { id: 'ankle-infection', title: 'Signs of infection or a flare-up', members: ['af-charcot', 'af-gout', 'af-inflam'] },
    { id: 'ankle-nerve', title: 'Changes in feeling or strength', members: ['af-neuropathy', 'af-footdrop', 'af-crps', 'sc-neuro'] },
    { id: 'ankle-medical', title: 'Signs that need a medical check', members: ['af-quinolone', 'af-cancer', 'sc-systemic'] },
  ],
}

/* Each question's key signs, in plain words. A group's question is built
   from the members that apply to this person, so an adult is not asked
   about a child's limp and a man is not asked about periods. */
export const SIGNS = {
  // Knee
  'kf-replacement': 'a knee replacement that is newly painful, warm, swollen or leaking',
  'kf-gout': 'a knee that became suddenly hot, swollen and very painful overnight',
  'kf-inflam': 'other joints swollen too, or a rash, psoriasis or sore eyes',
  'kf-dvt': 'a calf that is swollen, warm or tender',
  'kf-artery': 'a pulsing lump behind the knee, or calf cramps on walking that ease within minutes of standing still',
  'kf-cancer': 'a past cancer, or a deep ache at night that does not change with position, with weight loss',
  'kf-tumour': 'a deep ache around the knee that wakes you at night, or a lump near the knee that is growing',
  'kf-stress': 'a deep ache above the knee that is worse with running or hopping',
  'kf-sufe': 'a child aged about 9 to 16 limping, or with hip pain',
  'kf-perthes': 'a child aged about 4 to 10 limping, with no injury',
  // Foot
  'ft-puncture': 'something went through your shoe into your foot, and it is now swollen, red or painful to walk on',
  'ft-charcot': 'diabetes with a foot that is hot, red or swollen, or a wound that is not healing',
  'ft-gout': 'a toe or other joint that became suddenly hot, swollen, red and too painful to touch',
  'ft-inflam': 'a whole toe swollen like a sausage, or heel pain with back stiffness, psoriasis or sore eyes',
  'ft-cast': 'a cast, splint or bandage on the foot that feels more and more tight and painful',
  'ft-claudication': 'foot or calf cramps on walking that ease when you stand still, or cold, shiny toes that are slow to heal',
  'ft-neuropathy': 'both feet numb, burning or tingling, like wearing socks',
  'ft-footdrop': 'your foot slapping down or your toes catching when you walk',
  'ft-crps': 'since an injury, surgery or cast, a foot that burns, swells, changes colour or is so sensitive that light touch hurts',
  'ft-stress': 'pain on one foot bone that is worse with every step or hopping, if you run, march or train hard',
  'ft-lump': 'a lump in the foot that is growing, or a new dark mark under a toenail',
  // Hip
  'hpf-replacement': 'a hip replacement or hip fracture operation, and the hip is newly painful, warm or swollen, the wound red or leaking, or a fever',
  'hpf-dvt': 'a leg that is swollen, warm or tender in the calf or thigh',
  'hpf-nofall': 'hip or groin pain that came on suddenly with no fall (or only a small slip), so it now hurts to stand on that leg, if you are 65 or over or have low bone density',
  'hpf-stress': 'a deep groin ache that is worse with running or hopping',
  'hpf-avn': 'a deep groin ache if you take long-term steroid tablets, drink heavily or have sickle cell disease',
  'hpf-sufe': 'a child aged about 9 to 16 limping, with hip, groin, thigh or knee pain',
  'hpf-hernia': 'a soft lump in the groin that appears when you cough, strain or stand',
  'hpf-kidney': 'pain in waves from your side to your groin, or burning or blood when you pass urine',
  // The drawing's urinary pattern question (./patternChecks.js), asked for the hip.
  'pc-urinary': 'a fever with pain from your side',
  'hpf-pelvic': 'groin pain linked to your periods, or unusual vaginal bleeding or discharge',
  'hpf-cancer': 'a past cancer, or a deep ache at night that does not change with position, with weight loss',
  // Ankle
  'af-cast': 'a cast, splint or bandage that feels more and more tight and painful',
  'af-dvt': 'a calf or ankle that is swollen, warm or tender',
  'af-charcot': 'diabetes with a foot or ankle that is hot, red or swollen, or a wound that is not healing',
  'af-gout': 'an ankle or big toe that became suddenly hot, swollen and very painful overnight',
  'af-inflam': 'heel or Achilles pain with morning back stiffness, psoriasis, sore eyes or other swollen joints',
  'af-neuropathy': 'both feet numb, burning or tingling, like wearing socks',
  'af-footdrop': 'your foot slapping down or your toes catching when you walk',
  'af-crps': 'since an injury, surgery or cast, an ankle or foot that burns, swells, changes colour or is so sensitive that light touch hurts',
  'af-quinolone': 'Achilles pain after a recent quinolone antibiotic (such as ciprofloxacin) or steroid tablets',
  'af-cancer': 'a past cancer, a lump that is growing, or a deep ache at night that does not change with position',
  // Lower back
  'rf-osteo': 'pain that started suddenly after a minor strain, cough or lift, if you have low bone density, take long-term steroid tablets or are over 70',
  'rf-cancer': 'a past cancer, with this new back pain',
  'rf-spondy': 'under 20, with pain on arching the back, especially with sport such as gymnastics, dance, cricket bowling or tennis',
  'rf-infection': 'a fever or chills, a weakened immune system, injected drugs, or a recent urine or skin infection, or a spine procedure or injection',
  'rf-kidney': 'pain in waves from your side to your groin, or a fever, burning or blood when you pass urine',
  'rf-pelvic': 'pain linked to your periods, unusual vaginal bleeding, or (for men) new trouble passing urine',
  'rf-aaa-slow': 'over 50 with smoking, high blood pressure, diabetes or artery disease, and a deep, constant ache that does not change with movement, or a pulsing in your tummy',
  'rf-footdrop': 'your foot slapping down or your toes catching when you walk',
  // Mid back
  'trf-osteo': 'pain that started suddenly after a minor strain, cough, lift or a fall from standing height, if you are over 50, have low bone density or take long-term steroid tablets',
  'trf-cancer': 'a past cancer, with this new mid-back pain',
  'trf-infection': 'a fever or chills, a weakened immune system, or injected drugs',
  'trf-shingles': 'a band of burning pain around one side of the chest or back, with a rash or blisters',
  'trf-kidney': 'pain in your side or lower ribs, with a fever, burning or blood when you pass urine',
  'trf-gut': 'pain linked to eating, heartburn or black stools, or under the right shoulder blade after fatty meals',
  'trf-myelo': 'legs that have gradually become stiff, heavy or clumsy when you walk',
  // Thoracolumbar junction
  'jrf-osteo': 'pain that started suddenly after a minor strain, cough or lift, if you have low bone density, take long-term steroid tablets or are over 70',
  'jrf-cancer': 'a past cancer, with this new back pain',
  'jrf-infection': 'a fever or chills, a weakened immune system, or injected drugs',
  'jrf-shingles': 'a band of burning pain around one side of your body, with a rash or blisters',
  'jrf-kidney': 'waves of severe pain from your side down to your groin, or a fever, burning or blood when you pass urine',
  'jrf-legs': 'legs that have gradually become stiff, heavy or clumsy when you walk',
  // Neck
  'nrf-myelo': 'over days or weeks, an arm, hand or leg that is quickly becoming weaker, number or clumsier, or walking that is quickly becoming more unsteady',
  'nrf-upperinstab': 'rheumatoid or another inflammatory arthritis, Down syndrome or long-term steroids with a head that feels too heavy to hold up, or tingling round the lips when you move your neck; or, over recent weeks without an injury, a hoarse voice, trouble swallowing, numbness on one side of the face, a drooping eyelid or double vision',
  // Shoulder
  'srf-pancoast': 'a cough that will not go away, coughing up blood, a drooping eyelid or a weak hand, if you smoke or used to',
  'srf-organ': 'pain that is worse after fatty meals or when you breathe in deeply, or comes with feeling sick, fever or yellow skin or eyes, or does not change at all with movement',
  'srf-pta': 'a sudden, severe shoulder pain with no injury that lasted several days, then shoulder or arm muscles became weak or thin',
  // Base of the neck
  'crf-wasting': 'the small muscles of your hand getting thinner, or a weak grip',
  'crf-vascular': 'an arm or hand that turns pale, blue, cold or swollen, especially when raised',
  'crf-pancoast': 'a cough that will not go away, coughing up blood or a drooping eyelid, if you smoke or used to',
  'crf-gallbladder': 'pain that is worse after fatty meals or when you breathe in deeply, or comes with feeling sick, fever or yellow skin or eyes',
  'crf-oesophagus': 'pain when you swallow, or food that feels as if it sticks on the way down',
  'crf-osteo': 'pain that started suddenly after a minor strain, cough or lift, if you have low bone density or take long-term steroid tablets',
  'crf-shingles': 'a band of burning pain around one side of the chest or back, with a rash or blisters',
  // Back of the pelvis
  'prf-osteo': 'pain that started after a minor fall or with no injury, if you have low bone density, take long-term steroid tablets or are over 70',
  'prf-cancer': 'a past cancer, with this new pain',
  'prf-infection': 'a fever or chills, or a recent birth, operation or injected drugs',
  'prf-kidney': 'pain in waves from your side to your groin, or burning or blood when you pass urine',
  'prf-pelvic': 'pain linked to your periods, or unusual vaginal bleeding or discharge',
  // Tailbone
  'xrf-bowel': 'bleeding from your bottom, black stools, or a change in bowel habit for more than 3 weeks',
  'xrf-pilonidal': 'swelling, redness or discharge near the top of the buttock crease, or a fever',
  'xrf-sphincter': 'since giving birth, trouble controlling wind or your bowels',
  'xrf-osteo': 'pain that started after a minor fall or with no injury, if you have low bone density, take long-term steroid tablets or are over 70',
  'xrf-cancer': 'a past cancer, or a lump near your tailbone',
  'xrf-constant': 'pain that is there all the time, worse at night and not affected by sitting',
  // Jaw
  'mrf-fracture': 'after a blow to the jaw or face, teeth that no longer meet the way they used to',
  'mrf-infection': 'swelling of the face or jaw with a fever, or a bad taste or discharge in your mouth',
  'mrf-ear': 'hearing loss or discharge from the ear on the painful side',
  'mrf-throat': 'a sore throat, hoarse voice or trouble swallowing for more than 3 weeks',
  'mrf-numb': 'part of your chin, lip or face that is numb',
  'mrf-lump': 'a growing lump in front of the ear or under the jaw, or a bite that has changed without an injury',
  'pc-acromegaly': 'hands, feet or jaw that have grown in adulthood, with aching joints, snoring or headaches',
  // Head
  'hrf-new50': 'a new kind of headache after age 50, or headaches getting steadily worse or changing over weeks',
  'hrf-pressure': 'a headache brought on by coughing, straining or exercise, much worse lying down or standing up, or there on waking with vomiting',
  'hrf-medication': 'a new headache since starting a new medicine',
  'hrf-pregnancy': 'a new or different headache while pregnant or in the 6 weeks after a birth',
  'hrf-cad': 'a new headache with neck pain, unlike any before, after a neck manipulation or a sudden jolt',
  // Upper arm
  'arf-cellulitis': 'spreading redness, a red streak up the arm, or a hot swollen area, with a fever',
  'arf-clot': 'a whole arm that has become swollen, heavy or bluish over a day or two',
  'arf-myelo': 'both hands numb or clumsy (buttons, writing), or walking that has become unsteady',
  'arf-pta': 'a sudden, severe arm or shoulder pain with no injury that lasted several days, then weak or thin arm muscles',
  'arf-shingles': 'a band of burning pain down the arm, with a rash or blisters in the same strip',
  'arf-pancoast': 'pain down the inside of the arm to the little finger with a cough that will not go away, or a drooping eyelid, if you smoke or used to',
  // Elbow
  'erf-bursa': 'a swelling at the point of the elbow that is red, warm or has a cut or graze over it',
  'erf-gout': 'a joint that became suddenly hot, swollen and very painful overnight, with gout or pseudogout before',
  'erf-nerve': 'a hand getting weaker or thinner, finger numbness all the time, or a wrist you cannot lift',
  'erf-myelo': 'both hands numb or clumsy (buttons, writing), or walking that has become unsteady',
  'erf-pta': 'a sudden, severe arm pain with no injury that lasted several days, then weak arm or hand muscles',
  // Forearm
  'frf-cast': 'a cast, splint or bandage on the arm that feels more and more tight and painful',
  'frf-cellulitis': 'spreading redness, a red streak up the arm, or a hot swollen area, with a fever',
  'frf-nerve': 'a hand becoming weaker, a wrist you cannot lift, or an "OK" sign you cannot make',
  'frf-myelo': 'both hands numb or clumsy (buttons, writing), or walking that has become unsteady',
  'frf-shingles': 'a band of burning pain down the forearm, with a rash or blisters in the same strip',
  'frf-pancoast': 'pain down the little-finger side of the forearm with a cough that will not go away, or a drooping eyelid, if you smoke or used to',
  'frf-stress': 'a deep, pinpoint bone pain worse with loading, in a young gymnast or weight-bearing athlete',
  // Wrist
  'wrf-cast': 'a cast, splint or bandage on the arm that feels more and more tight and painful',
  'wrf-raynaud': 'fingers or a hand that go white, blue or cold in attacks, or a painful cold finger that does not recover',
  'wrf-gout': 'a joint that became suddenly hot, swollen and very painful overnight, with gout or pseudogout before',
  'wrf-inflam': 'both wrists or several finger joints swollen and stiff for more than an hour in the morning',
  'wrf-numb': 'a hand getting weaker or thinner, finger numbness all the time, or a wrist you cannot lift',
  'wrf-myelo': 'both hands numb or clumsy (buttons, writing), or walking that has become unsteady',
  'wrf-crps': 'since an injury, surgery or cast, a hand that burns, swells, changes colour or is so sensitive that light touch hurts',
  // Hand
  'hnd-cast': 'a cast, splint or bandage on the hand that feels more and more tight and painful',
  'hnd-raynaud': 'fingers that go white then blue in the cold, or a sore or ulcer on a fingertip',
  'hnd-felon': 'a tense, throbbing, swollen fingertip, or pus around the nail',
  'hnd-gout': 'a joint that became suddenly hot, swollen and very painful overnight, with gout or pseudogout before',
  'hnd-inflam': 'knuckles in both hands swollen and stiff for more than an hour in the morning, or a whole finger swollen like a sausage',
  'hnd-numb': 'a hand getting weaker or thinner, finger numbness all the time, or a wrist you cannot lift',
  'hnd-myelo': 'both hands numb or clumsy (buttons, writing), or walking that has become unsteady',
  'hnd-crps': 'since an injury, surgery or cast, a hand that burns, swells, changes colour or is so sensitive that light touch hurts',
  'hnd-lump': 'a hard lump growing quickly over weeks, painful or larger than a few centimetres, or a new dark streak under a nail',
  // Thigh
  'tgf-dvt': 'a thigh or calf that is swollen, warm or tender',
  'tgf-cellulitis': 'spreading redness, a red streak up the leg, or a hot swollen area, with a fever',
  'tgf-claudication': 'cramping thigh or buttock pain on walking that eases when you stand still, if you smoke or have diabetes',
  'tgf-femoral': 'a thigh muscle that has become weak or thin, or a knee that gives way, with no injury',
  'tgf-stress': 'a deep, aching thigh pain that is worse with hopping or aches at night, if you run or train hard',
  'tgf-tumour': 'a deep thigh ache that wakes you at night, or a lump in the thigh that is growing',
  'tgf-sufe': 'a child aged about 9 to 16 limping, with thigh or knee pain',
  'tgf-cancer': 'a past cancer, or a deep thigh ache at night that does not change with position, with weight loss',
  // Lower leg
  'lgf-cast': 'a cast, splint or bandage on the leg that feels more and more tight and painful',
  'lgf-dvt': 'a calf that is swollen, warm or tender',
  'lgf-cellulitis': 'spreading redness, a red streak up the leg, a hot swollen area with a fever, or a leg ulcer that is not healing',
  'lgf-claudication': 'cramping calf pain on walking that eases when you stand still, if you smoke, have diabetes or are over 50',
  'lgf-footdrop': 'your foot slapping down or your toes catching when you walk',
  'lgf-neuropathy': 'both feet numb, burning or tingling, like wearing socks',
  'lgf-stress': 'a sore spot on the shin bone you can point to with one finger, or pain when hopping or at night, if you run or train hard',
  'lgf-tumour': 'a deep shin ache that wakes you at night, or a lump on the shin that is growing',
  'lgf-cancer': 'a past cancer, or a deep leg ache at night that does not change with position, with weight loss',
  // Drawing-based pattern questions (./patternChecks.js)
  'pc-visceral': 'pain that does not change at all with movement or position, or comes with nausea, fever or feeling unwell',
  // Shared
  'sc-trauma': 'a significant fall or accident, or any fall if you are 65 or over or have low bone density',
  'sc-systemic': 'fever, chills or weight loss you cannot explain, or a new or growing lump',
  'sc-neuro': 'new or worsening weakness, numbness or clumsiness in an arm or leg',
}

/** "Title: a; b; or c", from the members present. */
export function gateText(gate, members = []) {
  const parts = members.map((m) => SIGNS[m.id]).filter(Boolean)
  if (!parts.length) return gate.title
  const list = parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join('; ')}; or ${parts[parts.length - 1]}`
  return `${gate.title}: ${list}`
}

/* Mechanism: question id → the injury screen whose first answer decides it.
   'noInjury' questions (overuse stress fractures, "no injury" Perthes) are
   skipped after a recent injury to that area. */
export const MECHANISM = {
  'kf-stress': 'knee', 'kf-perthes': 'knee', 'ft-stress': 'foot', 'hpf-stress': 'hip', 'srf-pta': 'shoulder',
  'frf-stress': 'forearm', 'tgf-stress': 'thigh', 'lgf-stress': 'leg', 'arf-pta': 'arm', 'erf-pta': 'elbow', 'tgf-femoral': 'thigh',
}
export const injuredIn = (screen, a = {}) => a[`${screen}:I1`] !== undefined && a[`${screen}:I1`] !== 'no'
/** Kept for the knee prototype's wording. */
export const kneeInjured = (a = {}) => injuredIn('knee', a)

/** The doctor-page flags minus those the mechanism rules out. */
export const byMechanism = (flags = [], answers = {}) =>
  flags.filter((f) => !(MECHANISM[f.id] && injuredIn(MECHANISM[f.id], answers)))

/** The area the smarter flow runs for, or null: one of AREAS, drawn alone. */
export function smartArea(zones = []) {
  if (!zones.length) return null
  const t = zones[0].type
  return AREAS.includes(t) && zones.every((z) => z.type === t) ? t : null
}
/** Kept for the knee prototype's checks. */
export const kneeOnly = (zones = []) => smartArea(zones) === 'knee'

const groupsFor = (area) => GATES[area] || []

/** "Not sure which" flags for the groups that will show as a gateway (two or
    more members on the page). They join the doctor-page list so they count
    like any other flag; the page shows them only inside their group. */
export function gateUnsureFlags(list = [], area = 'knee') {
  const ids = new Set(list.map((f) => f.id))
  return groupsFor(area).filter((g) => g.members.filter((id) => ids.has(id)).length >= 2).map((g) => {
    const members = list.filter((f) => g.members.includes(f.id))
    return {
      id: `gate:${g.id}`, tier: 'urgent', gate: g.id, area, unsure: true,
      // As urgent as the most urgent question it stands for; booking is still offered.
      sameDay: members.some((f) => f.sameDay),
      text: `${gateText(g, members)} (not sure which)`,
      why: { title: 'Please see your doctor', text: 'You told us one of these signs applies but were not sure which. A doctor should check it before physiotherapy begins; you can still book with Chandra, who will make sure it has been looked at.' },
    }
  })
}

/** The page as rows: { flag } on its own, or { gate, members, unsure } for a
    group of two or more. Each group sits where its first (most severe)
    member was. The area comes from the "not sure" flags on the list. */
export function gateRows(list = []) {
  const unsureFlags = list.filter((f) => f.unsure)
  const area = unsureFlags.length ? unsureFlags[0].area : null
  const groups = groupsFor(area)
  const gateOf = Object.fromEntries(groups.flatMap((g) => g.members.map((id) => [id, g.id])))
  const unsure = Object.fromEntries(unsureFlags.map((f) => [f.gate, f]))
  const shown = list.filter((f) => !f.unsure)
  const rows = [], placed = new Set()
  for (const f of shown) {
    const gid = gateOf[f.id]
    if (gid && unsure[gid]) {
      if (placed.has(gid)) continue
      placed.add(gid)
      const gate = groups.find((g) => g.id === gid), members = shown.filter((x) => gateOf[x.id] === gid)
      rows.push({ gate: { ...gate, text: gateText(gate, members) }, members, unsure: unsure[gid] })
    } else rows.push({ flag: f })
  }
  return rows
}
