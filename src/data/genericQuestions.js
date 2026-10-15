/* The generic questions (areas without their own question set, such as
   the stomach or chest) and the per-area aggravating / easing options.
   Moved here from PainAssessment.jsx (14 Oct 2026) so the voice
   recordings (src/data/guideSpeech.js) include them: before, these were
   read by the phone's own (often female) voice. Plain .js: Node imports it. */

/* ── The 5 questions — A–D fixed choices, E = Other (entered manually) ──
   Option sets follow a standard subjective examination: onset, pain
   character, aggravating factors, easing factors, plus an open field. */
export const QUESTIONS = [
  { id: 'q1', text: 'When did your pain begin?', options: [
    'Today or yesterday',
    'Within the past week',
    'Between one and six weeks ago',
    'More than six weeks ago',
  ]},
  { id: 'q2', text: 'How would you describe your pain?', multi: true, options: [
    'Sharp or stabbing',
    'Dull ache',
    'Burning or tingling',
    'Throbbing',
  ]},
  { id: 'q3', text: 'What tends to make your pain worse?', multi: true, options: [
    'Movement or exercise',
    'Prolonged sitting or standing',
    'Bending or lifting',
    'At night, or lying in bed',
  ]},
  { id: 'q4', text: 'What tends to ease your pain?', multi: true, options: [
    'Rest',
    'Gentle movement or stretching',
    'Heat or cold packs',
    'Pain medication',
  ]},
  { id: 'q5', text: 'Is there anything further you would like the physiotherapist to know?', textarea: true,
    placeholder: 'Other symptoms, previous injuries, relevant medical history, or any concerns…' },
]

/* ── Region-specific option sets ───────────────────────────────────────
   The four core questions (onset, character, aggravating, easing) are the
   standard subjective examination and apply to any body area — but what
   provokes and eases pain is very different for a neck than for a knee.
   These overrides swap in the aggravating/easing options that a
   physiotherapist would actually ask about for the area the person drew. */
export const REGION_AGGRAVATORS = {
  lowback:   ['Bending forward or lifting', 'Sitting for a long time', 'Standing or walking for a long time', 'Coughing, sneezing, or straining'],
  neck:      ['Looking down at a phone or desk', 'Turning the head to one side', 'Sleeping position', 'Carrying a bag on that shoulder'],
  ctj:       ['Looking down at a phone or desk', 'Raising the arms overhead', 'Carrying bags', 'Twisting the upper body'],
  upperback: ['Sitting at a desk for a long time', 'Deep breathing or coughing', 'Reaching or lifting overhead', 'Twisting the trunk'],
  tlj:       ['Twisting or turning', 'Bending forward', 'Sitting or driving for a long time', 'Lying on the painful side'],
  jaw:       ['Chewing hard or chewy food', 'Talking for a long time', 'Yawning or opening wide', 'Clenching or grinding'],
  coccyx:    ['Sitting on hard seats', 'Leaning back while sitting', 'Standing up from sitting', 'Cycling or rowing'],
  sij:       ['Standing on one leg', 'Stairs or getting in and out of the car', 'Rolling over in bed', 'Sitting for a long time'],
  shoulder:  ['Reaching overhead', 'Reaching behind your back', 'Lying on that side at night', 'Lifting or carrying'],
  arm:       ['Lifting or carrying', 'Reaching overhead', 'Gripping or using tools', 'Sitting at a desk'],
  elbow:     ['Gripping or squeezing', 'Lifting with the palm down', 'Twisting a handle or door knob', 'Repetitive work or sport'],
  forearm:   ['Gripping or typing', 'Turning the palm up and down', 'Repeated wrist movements or sport', 'A tight watch strap or cuff'],
  wrist:     ['Gripping or twisting', 'Lifting a baby, or with the thumb up', 'Taking weight through the hand', 'Typing, or using a mouse or phone'],
  hand:      ['Pinching (keys, jars, buttons)', 'Gripping firmly', 'Texting or gaming with the thumbs', 'Cold weather'],
  thigh:     ['Sprinting, kicking, or jumping', 'Stretching, or bending forward with straight legs', 'Sitting for a long time', 'Walking a distance'],
  hip:       ['Lying on that side at night', 'Putting on socks and shoes, or getting in and out of a car', 'Sitting in a low chair or deep squatting', 'Climbing stairs or standing on that leg'],
  leg:       ['Running or jumping', 'Walking a distance', 'Rising onto my toes', 'Sport or marching'],
  knee:      ['Going down stairs or squatting', 'Jumping or landing', 'Twisting or turning on the leg', 'Kneeling'],
  foot:      ['Standing or walking a long time', 'Running or jumping', 'Tight, narrow, or high-heeled shoes', 'Walking barefoot or on hard floors'],
  ankle:     ['Walking on uneven ground', 'Running, jumping, or hopping', 'Squatting, lunging, or going down stairs', 'The first steps in the morning'],
  head:      ['Long screen time or reading', 'Stress or poor sleep', 'Certain neck or jaw positions', 'Bright light or noisy places'],
}
export const REGION_EASERS = {
  lowback:   ['Lying down or resting', 'Gentle walking', 'Changing position often', 'Heat or cold packs'],
  neck:      ['Gentle neck movement', 'Supporting the head or a different pillow', 'Heat packs', 'Rest from screens'],
  ctj:       ['Sitting up tall', 'Moving and stretching', 'Heat packs', 'Resting the arm on an armrest'],
  upperback: ['Moving and stretching', 'Sitting upright with support', 'Heat packs', 'Rest'],
  tlj:       ['Lying on the back with knees bent', 'Moving around', 'Sitting', 'Heat packs'],
  jaw:       ['Soft food and small bites', 'Resting the jaw (lips together, teeth apart)', 'A warm pack on the cheek', 'A night guard from the dentist'],
  coccyx:    ['A wedge or cut-out cushion', 'Leaning forward when sitting', 'Standing or walking', 'Heat packs'],
  sij:       ['Moving around', 'A pelvic support belt', 'A pillow between the knees at night', 'Heat packs'],
  shoulder:  ['Resting the arm', 'Supporting the arm in a sling or pocket', 'Gentle pendulum movement', 'Heat or cold packs'],
  arm:       ['Resting the arm', 'Gentle stretching', 'Heat packs', 'Changing position'],
  elbow:     ['Resting from gripping', 'A brace or strap', 'Ice', 'Gentle stretching'],
  forearm:   ['Resting from the task', 'Stopping the sport for a few minutes', 'Loosening a strap or cuff', 'Gentle stretching'],
  wrist:     ['Resting the hand', 'A splint or support', 'Ice', 'Avoiding the aggravating task'],
  hand:      ['Resting the hand', 'Warmth, or warm water', 'A splint', 'Gentle finger movement'],
  hip:       ['Rest', 'A pillow between the knees at night', 'Gentle walking', 'Heat packs'],
  thigh:     ['Rest from sport', 'Gentle stretching', 'Ice or heat', 'Gentle walking'],
  knee:      ['Rest and elevation', 'Ice', 'A support or brace', 'Gentle movement'],
  leg:       ['Rest from running', 'Stopping for a few minutes', 'Gentle stretching', 'Ice or heat'],
  ankle:     ['Rest and elevation', 'Ice', 'Supportive footwear', 'Gentle stretching'],
  foot:      ['Rest', 'Supportive, cushioned shoes', 'Taking shoes off', 'Ice or a cold bottle under the foot'],
  head:      ['Rest in a quiet, dark room', 'Gentle neck movement or a short walk', 'A heat pack across the neck and shoulders', 'Regular meals and plenty of water'],
}

export const TYPE_TO_KEY = { lowerback: 'lowback' }   // zone type → aggravator/easer key
export const TYPE_WORD = { head: 'head', chest: 'chest', abdomen: 'stomach' } // plain word for types with no authored region

/* Checks that apply to ANY body part, appended after the region's own flags.
   Deliberately excludes the cauda-equina and cardiac items that used to live
   here: those are low-back and shoulder/upper-back flags respectively, and the
   guide already carries them in those regions' own redFlags. */
export const UNIVERSAL_CHECKS = [
  { id: 'sc-neuro', tier: 'urgent', text: 'New or worsening weakness, numbness, or loss of coordination in an arm or leg',
    why: { title: 'A nerve or spinal cord may be involved',
      text: 'Weakness that is getting worse suggests a nerve is under pressure rather than simply irritated. A physician needs to establish the cause before any physiotherapy loading begins.' } },
  { id: 'sc-systemic', tier: 'urgent', text: 'Fever, chills, unexplained weight loss, a new or growing lump, pain at night that does not change with position, or a history of cancer with new or changing pain',
    why: { title: 'Possible infection or systemic cause',
      text: 'Pain accompanied by fever, weight loss, or a cancer history can have a medical rather than a mechanical cause. That has to be excluded by a doctor first, as it is treated quite differently.' } },
  { id: 'sc-trauma', tier: 'urgent', sameDay: true, text: 'A significant fall, accident, or injury — or any fall if you are 65 or older, or have osteoporosis or low bone density',
    why: { title: 'A fracture should be excluded',
      text: 'After a significant impact — or any fall where bone strength may be reduced — imaging is usually needed to rule out a fracture before the area is loaded or mobilised.' } },
]
