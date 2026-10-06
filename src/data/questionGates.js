/* A short yes/no in front of a long "Which of these apply?" list (Chandra,
   6 Oct 2026: "if the patient says yes, open the follow-up questions"). Only
   for lists where most people tick nothing: "No" answers the list with its
   "none" answer (`no`), "Yes" opens it. The question still counts as one of
   the scored questions; the scores are unchanged. `signs` names what the
   list covers, so the yes/no is never a blind guess.

   Not gated: lists asked only after a related yes (the legs after walking,
   arm symptoms, dizziness, after an injury, the ball of the foot), "what
   brings it on" lists (nearly everyone ticks one) and "where is the pain". */

const AXSPA = 'pain that began before 40; morning stiffness over 30 minutes; easing with exercise, not rest; waking in the second half of the night; psoriasis, Crohn\'s or colitis, a red painful eye or heel pain'
const CRPS = {
  ask: 'Since the injury, operation or cast, has the painful area changed?',
  signs: 'far more painful than expected; a different colour or temperature from the other side; more swollen or sweaty; light touch hurting; stiff, weak or shaky, or changes in the nails, hair or skin',
  no: 'none',
}

export const QUESTION_GATES = {
  'lowback/L9': { ask: 'Do any signs of an inflammatory back apply to you?', signs: `${AXSPA}; pain switching between the buttocks; or a diagnosis of ankylosing spondylitis`, no: 'none' },
  'sij/P6': { ask: 'Do any signs of an inflammatory back apply to you?', signs: `${AXSPA}; or a diagnosis of ankylosing spondylitis`, no: 'none' },
  'knee/K3': { ask: 'Does your knee click, catch, lock, give way or swell?', signs: 'clicking, catching or locking; giving way; swelling after activity; short morning stiffness; the kneecap slipping to the side', no: 'none' },
  'knee/K5': { ask: 'Is there any swelling or a lump in one place?', signs: 'on the front of the kneecap; at the back of the knee; below the kneecap; on the inner shin; or the whole knee puffy', no: 'none' },
  'neck/N4': { ask: 'Do you get headaches with this?', no: 'none' },
  'neck/N9': { ask: 'Have you noticed changes in your hands, your walking or your balance?', signs: 'numb or clumsy hands; unsteady walking; an electric feeling when you bend your head forward; dizziness', no: 'none' },
  'head/D3': { ask: 'Does your neck play a part in the headache?', signs: 'neck movement or a position brings it on; pressing the base of the skull brings it on; a stiff neck; headaches that began with neck pain', no: 'neckfine' },
  'hand/H2': { ask: 'Do you have a finger that clicks or locks, a lump or cord in your palm, or bony bumps on your finger joints?', signs: 'a finger that clicks, catches or locks; a lump, ridge or cord in the palm; a finger bending into the palm; a hand that will not lie flat; a past procedure on the palm; bony bumps on the finger joints', no: 'none' },
  'wrist/W9': CRPS, 'hand/H9': CRPS, 'ankle/A9': CRPS, 'foot/B9': CRPS,
}
