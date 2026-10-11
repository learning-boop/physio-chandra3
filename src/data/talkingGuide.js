/* ── The talking guide (Chandra's face, bottom-left on every page) ─────────
   Everything the guide says lives here, so the words can be reviewed and
   changed without touching the component (src/components/TalkingGuide.jsx).

   Rules for this text (same as the rest of the site):
   - Friendly, everyday Canadian (BC) English in the casual lines ("Hey
     there", "No worries", "Sounds good", the odd "eh"; Chandra, 10 Oct
     2026). Never in medical, safety or emergency wording, which stays plain.
   - Plain words, short sentences, one idea per sentence.
   - CHCPBC marketing standard: truthful and verifiable, no promised results,
     no "best", no comparisons, no testimonials. Facts not yet confirmed
     (years of practice, degree, phone numbers, fees) are left out.
   - No medication advice; nothing that assesses the visitor's own symptoms.
   - Doctor and emergency advice always comes before booking.

   The answers are written in advance: the guide is not a live chat and
   nothing typed is sent anywhere. Typed questions are matched on this device
   to the topics below by their keywords.

   `{phone|computer}` text: a string, or { phone, computer } when the gesture
   words differ by device. */

import { GUIDE_AUDIO } from './guideAudio.js'

/* ── What the guide says when a page or step opens ──────────────────────────
   Keys: a route ('/about'), or 'guide:<stage>' for the pain guide on '/' and
   '/pain-mapper' (stages from src/components/PainAssessment.jsx).
   `open: true` shows the speech bubble by itself the first time (the welcome
   and the how-to page); the others wait for a tap on the face, so they never
   cover the questions. `chips` are the suggested questions shown with it.
   `audio`: optional, a recording of Chandra saying the same words (a file in
   public/, e.g. '/audio/welcome.mp3'); it is played instead of the computer
   voice and the mouth follows it. Keep `text` matching it: it is the
   caption. */
export const PAGE_MESSAGES = {
  'guide:landing': {
    open: true,
    text: "Hey there, and welcome! I'm the virtual assistant of Physio Chandra, and it's great to have you here. Chandra is a registered physiotherapist in Surrey and Burnaby. This guide helps you describe your pain before your visit, in about five minutes. You mark where it hurts on a 3D body and answer a few short questions. At the end you'll see general information, not a diagnosis, and you can book an assessment if you'd like. Tap Start when you're ready, or Start with voice guide if you'd like me to talk you through each step.",
    chips: ['what-is-this', 'privacy', 'about-chandra', 'booking'],
  },
  'guide:guide': {
    open: true,
    text: {
      phone: "Okay, here's how it works. First, turn the body: swipe left or right until the sore side faces you. Swipe up or down to tilt it, and pinch to zoom in. Next, tap Draw, then trace every painful area with your finger, including where the pain spreads. Made a mistake? No worries, just tap Undo. Then answer the questions: tap the answer that fits best, and tap Back to go back a step. Safety questions come first, so if anything needs a doctor first, the guide tells you straight away. You can tap the face in the corner at any time to ask me a question.",
      computer: "Okay, here's how it works. First, turn the body: click and drag left or right until the sore side faces you. Drag up or down to tilt it, and scroll to zoom in. Next, click Draw, then trace every painful area, including where the pain spreads. Made a mistake? No worries, just click Undo. Then answer the questions: click the answer that fits best, and click Back to go back a step. Safety questions come first, so if anything needs a doctor first, the guide tells you straight away. You can click the face in the corner at any time to ask me a question.",
    },
    chips: ['turn-body', 'draw', 'answer', 'change-answer'],
  },
  'guide:draw': {
    text: {
      phone: 'Tap Draw, then trace every painful area. Tap Turn to spin the body again. Undo takes back the last line. When every sore area is marked, tap Continue.',
      computer: 'Click Draw, then trace every painful area. Click Turn to spin the body again. Undo takes back the last line. When every sore area is marked, click Continue.',
    },
    chips: ['turn-body', 'zoom', 'draw'],
  },
  'guide:about': {
    text: 'A few quick questions about you. They let the guide skip safety questions that cannot apply to you.',
    chips: ['why-age', 'privacy'],
  },
  'guide:area': {
    text: 'Your marks cover more than one area. Pick the one that bothers you most. The questions will be about that area.',
    chips: ['answer'],
  },
  'guide:emergency': {
    text: 'These are safety questions. Tick anything that applies to you. If something needs a doctor first, the guide will tell you.',
    chips: ['safety', 'answer'],
  },
  'guide:physician': {
    text: 'A few more safety questions. Tick anything that applies to you. If none do, choose None of these.',
    chips: ['safety', 'answer'],
  },
  'guide:injury': {
    text: 'These questions are about how your pain started. Pick the answer that fits best.',
    chips: ['safety', 'answer'],
  },
  'guide:questions': {
    text: "Tap the answer that fits best. If you're unsure, pick the closest one. Back takes you to the previous question, and you can check every answer before your results.",
    chips: ['answer', 'change-answer', 'how-long'],
  },
  'guide:review': {
    text: 'Here are your answers. Tap any answer to change it. When everything looks right, tap Continue.',
    chips: ['change-answer'],
  },
  'guide:safety': {
    text: 'Nearly done. If anything else worries you, you can add it here.',
    chips: ['safety'],
  },
  'guide:ok': {
    text: "These are your results. They are general information about what your answers can be associated with. They are not a diagnosis. You can save them as a PDF, and book an assessment at the end of the page. Please bring your reference code or PDF to the visit.",
    chips: ['results', 'booking', 'first-visit', 'save'],
  },
  '/about': {
    text: 'This page is about Chandra and how Chandra works. You can also check Chandra’s registration with the College of Health and Care Professionals of BC.',
    chips: ['about-chandra', 'first-visit', 'booking'],
  },
  '/conditions': {
    text: 'This page lists some common problems that physiotherapy may help with, and the clinics where Chandra works.',
    chips: ['conditions', 'booking', 'fees'],
  },
  '/education': {
    text: 'Here you can read general information about pain and recovery. It does not replace an assessment.',
    chips: ['what-is-this', 'booking'],
  },
  '/privacy': {
    text: 'This page explains what happens to your answers. In short, they stay on this device unless you choose to share them.',
    chips: ['privacy'],
  },
}

/* ── Voice guide mode ("Start with voice guide") ───────────────────────────
   The drawing page's demo: read out while the body turns by itself and a
   hand shows the gestures. DEMO_STEPS says what is shown during each
   sentence ('turn', 'draw', 'undo' or null), so keep one sentence per step. */
export const DEMO = {
  phone: "Alright, let me show you how. To turn the body, swipe across it with one finger, like this. Then tap Draw, and trace over every place that hurts, like this. If you make a mistake, tap Undo. Now it's your turn. Take your time, eh. When you've finished, I'll read back what you marked.",
  computer: "Alright, let me show you how. To turn the body, click and drag across it, like this. Then click Draw, and trace over every place that hurts, like this. If you make a mistake, click Undo. Now it's your turn. Take your time, eh. When you've finished, I'll read back what you marked.",
}
export const DEMO_STEPS = [null, 'turn', 'draw', 'undo', null, null]
/* ── Answering by voice (Chandra, 10 Oct 2026) ─────────────────────────────
   Only after the patient agrees (MIC_ASK, with MIC_NOTE on screen) and the
   browser's own permission prompt. Keep MIC_NOTE in step with the privacy
   notice (src/pages/PrivacyPage.jsx, "The virtual assistant"). */
export const MIC_ASK = "Would you like to answer by speaking instead of tapping? I'll listen after each question, and you can say yes or no when I check your answer."
export const MIC_NOTE = 'To do this, your browser’s speech service (Google in Chrome, Microsoft in Edge, Apple in Safari) turns your voice into text. This website does not record or keep your voice. You can switch the microphone off at any time, or just tap instead.'
export const VOICE = {
  on: "Awesome, thanks! When the microphone glows, I'm listening. You can say your answer, or its letter.",
  denied: "I can't use the microphone, so please tap your answers instead.",
  off: "Sounds good, the microphone is off. You can tap your answers.",
  again: "Sorry, I missed that one. Mind saying it again? Or just tap your answer.",
  giveUp: "No worries. Just tap your answer on the screen.",
  yesNo: 'Please say yes or no, or tap a button.',
  safetyTap: 'If one of these applies to you, please tap it on the screen. If none of them apply, say none.',
  tapThenDone: "Please tap your answers on this page. When you've finished, say done.",
  help: 'You can say your answer, using the words on the button or its letter. When I check your answer, say yes or no. You can also say repeat, go back, or stop listening.',
}

/* Said when the visitor taps "Change it" after a read-back. */
export const CHANGE_REPLY = 'No worries. Change your answer, and I’ll check it again.'

/* Pain guide stages where the guide stays out of the way completely: a page
   telling the visitor to get medical care must not have anything competing
   with it. */
export const SILENT_STAGES = ['urgent']

/* ── Answers to questions ───────────────────────────────────────────────────
   `q`: the question as shown on a suggestion chip.
   `keys`: words and phrases that point to this topic when typed (lower case;
   a longer phrase counts for more).
   `a`: the answer. `next`: suggestions shown after it.
   `link`: an optional page to open ({ to, label }). */
export const TOPICS = {
  'what-is-this': {
    q: 'What is this site?',
    keys: ['what is this', 'what does it do', 'how does it work', 'what is the guide', 'purpose', 'what can i do here', 'help'],
    a: 'This site has a pain guide. You mark where it hurts on a 3D body and answer a few short questions. It then shows general information about what your answers can be associated with, some general advice, and the option to book an assessment with Chandra. It is not a diagnosis.',
    next: ['how-long', 'privacy', 'booking'],
  },
  'how-long': {
    q: 'How long does it take?',
    keys: ['how long', 'minutes', 'how much time', 'take long', 'quick'],
    a: 'About five minutes. Careful answers give the most useful results.',
    next: ['what-is-this', 'answer'],
  },
  'turn-body': {
    q: 'How do I turn the 3D body?',
    keys: ['turn', 'rotate', 'spin', 'move the body', '3d', 'model', 'back of', 'other side', 'tilt', 'feet', 'sole'],
    a: {
      phone: 'Swipe left or right on the body to turn it. Swipe up or down to tilt it, for example to see the soles of the feet. If you are drawing, tap Turn first.',
      computer: 'Click and drag left or right on the body to turn it. Drag up or down to tilt it, for example to see the soles of the feet. On a touchpad, press and slide. If you are drawing, click Turn first.',
    },
    next: ['zoom', 'draw'],
  },
  zoom: {
    q: 'How do I zoom in?',
    keys: ['zoom', 'bigger', 'closer', 'small', 'enlarge', 'pinch'],
    a: {
      phone: 'Pinch with two fingers on the body to zoom in or out.',
      computer: 'Scroll on the body with your mouse wheel or touchpad to zoom in or out.',
    },
    next: ['turn-body', 'draw'],
  },
  draw: {
    q: 'How do I mark my pain?',
    keys: ['draw', 'mark', 'trace', 'line', 'colour', 'color', 'paint', 'where it hurts', 'undo', 'mistake', 'erase', 'clear', 'wrong place'],
    a: {
      phone: 'Tap Draw on the body, then trace every painful area with your finger. If the pain spreads, draw along where it goes. Undo takes back the last line, and Clear All starts again.',
      computer: 'Click Draw on the body, then trace every painful area. If the pain spreads, draw along where it goes. Undo takes back the last line, and Clear All starts again.',
    },
    next: ['turn-body', 'answer'],
  },
  answer: {
    q: 'How do I answer the questions?',
    keys: ['answer', 'question', 'options', 'choose', 'pick', 'not sure', 'unsure', "don't know", 'dont know', 'none', 'more than one', 'select'],
    a: "Tap the answer that fits best. If you're not sure, pick the closest one. If nothing fits, choose None of these. Some questions let you tick more than one answer, and they say so.",
    next: ['change-answer', 'safety'],
  },
  'change-answer': {
    q: 'Can I change an answer?',
    keys: ['change', 'go back', 'back button', 'previous', 'edit', 'fix', 'redo', 'start again', 'restart', 'review'],
    a: 'Yes. Back takes you to the previous question. Before your results, a review page shows every answer, and you can tap any of them to change it.',
    next: ['answer'],
  },
  'why-age': {
    q: 'Why do you ask my age?',
    keys: ['age', 'birth sex', 'sex', 'gender', 'why do you ask', 'personal'],
    a: 'Some safety questions only apply to some people, such as questions about pregnancy. Your age and sex at birth let the guide skip the ones that cannot apply to you. They stay on this device.',
    next: ['privacy', 'safety'],
  },
  safety: {
    q: 'Why are there safety questions?',
    keys: ['safety', 'red flag', 'why so many questions', 'doctor first', 'serious'],
    a: 'A few problems need a doctor before physiotherapy. The safety questions check for those first. If anything needs a doctor, the guide tells you straight away.',
    next: ['answer', 'results'],
  },
  results: {
    q: 'What do the results mean?',
    keys: ['result', 'mean', 'diagnosis', 'diagnose', 'condition', 'accurate', 'trust'],
    a: 'The results show general information about what your answers can be associated with, with some general advice. They are not a diagnosis and do not replace an assessment in person. They give us a useful starting point when we meet.',
    next: ['first-visit', 'booking', 'save'],
  },
  save: {
    q: 'Can I save my results?',
    keys: ['save', 'pdf', 'print', 'download', 'code', 'reference', 'email my', 'send my', 'share'],
    a: 'Yes. On the results page you can save a PDF, and you get a reference code. Bring either to your visit so we can start from your answers. You can also choose to email your summary to Chandra.',
    next: ['privacy', 'booking'],
  },
  privacy: {
    q: 'Is my information private?',
    keys: ['privacy', 'private', 'data', 'stored', 'store', 'secure', 'who sees', 'confidential', 'information', 'record'],
    a: 'Your answers stay on this device unless you choose to share them, for example by emailing your summary to Chandra or asking for the optional AI overview. Nothing you type here is sent anywhere. If you choose to answer by speaking, your browser’s speech service turns your voice into text; this website does not record or keep your voice. The privacy notice has the details.',
    link: { to: '/privacy', label: 'Read the privacy notice' },
    next: ['save', 'what-is-this'],
  },
  booking: {
    q: 'How do I book an appointment?',
    keys: ['book', 'booking', 'appointment', 'schedule', 'visit', 'see you', 'available', 'availability', 'call', 'phone'],
    a: 'At the end of the pain guide you can choose the clinic that suits you, then call or book online. Chandra works at Arka Physiotherapy in South Surrey, BC Ice in Burnaby, and Performance Health Group in Guildford, Surrey.',
    link: { to: '/conditions', label: 'See the clinics' },
    next: ['fees', 'first-visit', 'referral'],
  },
  fees: {
    q: 'How much does it cost?',
    keys: ['how much', 'cost', 'price', 'fee', 'fees', 'pay', 'insurance', 'direct bill', 'billing', 'msp', 'icbc', 'worksafe', 'covered', 'coverage', 'expensive'],
    a: 'Fees and direct billing depend on the clinic. Please ask the clinic when you book. If your visit is part of an ICBC or WorkSafeBC claim, tell the clinic when you book.',
    next: ['booking', 'referral'],
  },
  referral: {
    q: 'Do I need a doctor’s referral?',
    keys: ['referral', 'refer', 'doctor note', "doctor's note", 'gp', 'family doctor'],
    a: 'You can book with a physiotherapist in BC without a referral. Some insurance plans ask for one before they pay, so please check your plan.',
    next: ['fees', 'booking'],
  },
  'first-visit': {
    q: 'What happens at the first visit?',
    keys: ['first visit', 'first appointment', 'what happens', 'expect', 'assessment', 'wear', 'bring'],
    a: 'Chandra goes through your answers with you, checks how you move, explains in plain words what is likely going on, and agrees a plan with you, including what you can do at home. Bring your reference code or PDF from the guide.',
    next: ['booking', 'fees'],
  },
  'about-chandra': {
    q: 'Who is Chandra?',
    keys: ['who are you', 'who is chandra', 'about you', 'chandra', 'assistant', 'robot', 'real person', 'are you human', 'bot', 'qualified', 'qualification', 'registered', 'experience', 'physiotherapist'],
    a: "Chandra is a registered physiotherapist with the College of Health and Care Professionals of BC, working in Surrey and Burnaby. Chandra's care is evidence-informed, based on a careful assessment and a plan made with you. I'm Chandra's virtual assistant, here to help you find your way around the site.",
    link: { to: '/about', label: 'About Chandra' },
    next: ['first-visit', 'booking'],
  },
  conditions: {
    q: 'What problems do you help with?',
    keys: ['treat', 'help with', 'conditions', 'problems', 'services', 'back pain', 'neck pain', 'knee', 'shoulder', 'sports', 'injury', 'surgery', 'headache'],
    a: 'Physiotherapy may help with many muscle, joint and nerve problems, such as back, neck, shoulder and knee pain, sports injuries and recovery after surgery. The Conditions page lists more. The pain guide can help you describe your own pain.',
    link: { to: '/conditions', label: 'See conditions' },
    next: ['booking', 'what-is-this'],
  },
  children: {
    q: 'Do you see children?',
    keys: ['child', 'children', 'kid', 'kids', 'son', 'daughter', 'baby', 'toddler', 'teen', 'year old', 'years old', 'yr old', 'paediatric', 'pediatric'],
    a: 'Chandra sees children aged 5 and over, with a parent or guardian. For a child under 5, please see your family doctor or a children’s health service.',
    next: ['booking'],
  },
  microphone: {
    q: 'What happens with my voice?',
    keys: ['microphone', 'mic', 'listening', 'listen to me', 'recording', 'record my', 'my voice', 'speak my answers', 'talk to you', 'voice answers'],
    a: 'You can answer by speaking only if you agree and allow the microphone. Your browser’s speech service (Google in Chrome, Microsoft in Edge, Apple in Safari) turns your voice into text, and only the text is used, on this device, to pick your answer. This website does not record or keep your voice. Say stop listening, or tap the microphone, to switch it off.',
    link: { to: '/privacy', label: 'Read the privacy notice' },
    next: ['privacy'],
  },
  hours: {
    q: 'When are the clinics open?',
    keys: ['hours', 'open', 'opening', 'closed', 'weekend', 'saturday', 'sunday', 'evening', 'when are you', 'where are you', 'address', 'location', 'parking'],
    a: 'Each clinic has its own hours and location. You can see them under each clinic on the Conditions page.',
    link: { to: '/conditions', label: 'See the clinics' },
    next: ['booking'],
  },
  contact: {
    q: 'How do I contact Chandra?',
    keys: ['contact', 'email', 'reach', 'message', 'talk to'],
    a: 'You can email chandra@physiochandra.ca. To book, choose a clinic at the end of the pain guide or on the Conditions page.',
    next: ['booking'],
  },
  'guide-help': {
    q: 'How do I turn your voice off?',
    keys: ['voice', 'sound', 'mute', 'quiet', 'stop talking', 'hide', 'go away', 'close', 'annoying'],
    a: 'Tap the speaker button at the top of this box to turn my voice on or off. Tap the down arrow, or the face, to tuck me away. I stay in the corner if you need me.',
    next: ['what-is-this'],
  },
}

/* Typed messages checked BEFORE the topics, in this order. Emergency first:
   anything that sounds like it is happening now gets 9-1-1 / 9-8-8, never a
   booking suggestion. */
export const SPECIAL_REPLIES = [
  {
    id: 'emergency',
    keys: ['chest pain', 'chest hurts', "can't breathe", 'cant breathe', 'cannot breathe', 'short of breath', 'trouble breathing',
      'stroke', 'face drooping', 'slurred', 'passed out', 'fainted', 'unconscious', 'seizure',
      'numb between', 'numb groin', 'saddle', 'bladder', 'bowel', 'wet myself', 'incontinen', 'pee', 'poo',
      'suicide', 'suicidal', 'kill myself', 'end my life', 'self harm', 'self-harm', 'hurt myself', 'overdose',
      'bleeding', 'broken bone', 'bone sticking', 'emergency', 'ambulance', '911', '9-1-1'],
    a: 'If this is happening now, please call 9-1-1 or go to the nearest emergency department. If you are thinking about suicide or hurting yourself, call or text 9-8-8 at any time. For advice that is not urgent, you can call HealthLink BC at 8-1-1.',
    urgent: true,
    // No suggestions after this one: nothing should sit next to it, least of
    // all booking.
    next: [],
    calls: [{ label: 'Call 9-1-1', href: 'tel:911' }, { label: 'Call or text 9-8-8', href: 'tel:988' }, { label: 'HealthLink BC 8-1-1', href: 'tel:811' }],
  },
  {
    id: 'medication',
    keys: ['medication', 'medicine', 'meds', 'pill', 'tablet', 'ibuprofen', 'advil', 'motrin', 'tylenol', 'acetaminophen', 'paracetamol',
      'naproxen', 'aleve', 'aspirin', 'painkiller', 'pain killer', 'dose', 'prescription', 'opioid', 'muscle relaxant', 'cream', 'gel'],
    a: 'I can’t give advice about medicines. Please ask a pharmacist or your doctor what is safe for you.',
    next: ['what-is-this', 'booking'],
  },
  {
    id: 'symptoms',
    keys: ['my pain', 'i have pain', 'it hurts', 'hurts', 'hurting', 'sore', 'ache', 'aching', 'is it serious', 'what is wrong', "what's wrong", 'whats wrong',
      'should i worry', 'what should i do', 'is it broken', 'torn', 'do i have', 'swollen', 'swelling', 'numb', 'tingling', 'pins and needles'],
    // Only when no topic matches well: "how do I mark where it hurts" is a
    // question about the site, "my knee hurts" is not.
    afterTopics: true,
    a: 'I can’t assess your symptoms in this chat. The pain guide is the best place to describe them. It starts with safety questions, and it tells you if a doctor should see you first. If you are worried, please see a doctor.',
    next: ['what-is-this', 'booking'],
  },
  {
    id: 'hello',
    keys: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste'],
    a: 'Hey there! I’m the virtual assistant of Physio Chandra. I can help you find your way around the site. What can I help you with?',
    next: ['what-is-this', 'turn-body', 'booking'],
    whole: true,
  },
  {
    id: 'thanks',
    keys: ['thanks', 'thank you', 'thx', 'great', 'ok', 'okay', 'cool', 'got it', 'bye'],
    a: "No worries! I'm right here in the corner if you need me.",
    next: [],
    whole: true,
  },
]

export const FALLBACK = {
  a: 'Sorry, I can only answer questions about using this site, the clinics and booking. I can’t give advice about your own symptoms here. These might help:',
  next: ['what-is-this', 'turn-body', 'booking', 'privacy'],
}

/* Questions offered when the chat opens on a page with no message of its own. */
export const DEFAULT_CHIPS = ['what-is-this', 'booking', 'privacy', 'about-chandra']

/* The browser voice used until Chandra's own recordings are added: a soft,
   gentle, natural male voice (Chandra, 10 Oct 2026: "soft", at a natural
   pace, with a Canadian accent where the browser has one). Each browser offers different voices, so they are
   ranked (src/components/TalkingGuide.jsx, pickVoice):
   1. "natural" voices first (Edge: "… Online (Natural)", Apple: "(Enhanced)"
      or "(Premium)"); these sound close to a person,
   2. then the names below, earlier is better (warm, calm male voices),
   3. never the old robotic desktop voices (ROBOTIC_VOICES) unless nothing
      else exists.
   Only the guide's own pre-written words are read out; what a visitor
   types is never spoken. */
/* Chandra, 10 Oct 2026: always a MALE voice, soft, with good bass. Deep,
   warm voices first; a Canadian accent is a bonus, not a must. */
export const PREFERRED_VOICES = [
  'BrianMultilingual',           // Edge: Chandra's pick, 10 Oct 2026 (after a listening test)
  'Brian Multilingual',
  'Christopher',                 // Edge: deep (Chandra found Andrew too high)
  'Guy',                         // Edge: low and warm
  'Davis',                       // Edge: calm and deep
  'Andrew',                      // Edge: warm, but higher
  'Brian',                       // Edge: calm, friendly
  'Liam',                        // Edge: English (Canada)
  'Roger', 'Eric', 'Steffan', 'Ryan', 'Thomas', 'William', 'Prabhat',   // Edge natural, male
  'Evan', 'Nathan', 'Aaron', 'Daniel', 'Rishi', 'Tom', 'Arthur',         // Apple, male
  'Google UK English Male',      // Chrome
  'Microsoft Mark', 'Microsoft David', 'Ravi', 'Male',                   // last resort: older but male
]
/* Never these (female voices), whatever else is on the device. */
export const FEMALE_VOICES = ['Female', 'Zira', 'Hazel', 'Susan', 'Heera', 'Aria', 'Jenny', 'Michelle', 'Ana', 'Clara', 'Emma',
  'Ava', 'Libby', 'Sonia', 'Maisie', 'Natasha', 'Neerja', 'Leah', 'Luna', 'Molly', 'Sara', 'Elizabeth', 'Nancy', 'Amber',
  'Ashley', 'Cora', 'Jane', 'Monica', 'Emily', 'Abbi', 'Bella', 'Hollie', 'Olivia', 'Mia', 'Yan', 'Rosa', 'Samantha', 'Karen',
  'Moira', 'Tessa', 'Fiona', 'Victoria', 'Allison', 'Serena', 'Catherine', 'Veena', 'Kate', 'Martha', 'Nicky', 'Zoe',
  'Google US English', 'Google UK English Female']
export const NATURAL_MARKS = ['Natural', 'Neural', 'Enhanced', 'Premium', 'Siri']
export const ROBOTIC_VOICES = ['Microsoft Zira', 'Microsoft Hazel',
  'eSpeak', 'Fred', 'Albert', 'Zarvox', 'Bad News', 'Bells', 'Boing', 'Bubbles', 'Cellos', 'Jester', 'Junior', 'Organ',
  'Ralph', 'Superstar', 'Trinoids', 'Whisper', 'Wobble', 'Grandpa', 'Grandma', 'Rocko', 'Eddy', 'Flo', 'Kathy']
/* Natural speed (Chandra found 0.9 a little slow), a slightly lower pitch
   for more bass, and a little quieter, so it sounds soft, not announced. */
export const VOICE_STYLE = { rate: 1, pitch: 0.88, volume: 0.85 }

/* ── Matching a typed question ─────────────────────────────────────────────
   Done on this device. Lower case, punctuation dropped, then each topic's
   keywords are looked for; a longer phrase scores more. */
const norm = (s) => ' ' + String(s).toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9'\- ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' '
const has = (text, key) => text.includes(' ' + key.toLowerCase() + ' ') || (key.length > 5 && text.includes(key.toLowerCase()))

export function findReply(input) {
  const text = norm(input)
  if (text.trim().length === 0) return null
  const words = text.trim().split(' ').length
  const special = (s) => ({ id: s.id, a: s.a, next: s.next || [], urgent: !!s.urgent, calls: s.calls })
  const hits = (s) => !(s.whole && words > 4) && s.keys.some((k) => has(text, k))
  for (const s of SPECIAL_REPLIES) if (!s.afterTopics && hits(s)) return special(s)
  let best = null
  let bestScore = 0
  for (const [id, t] of Object.entries(TOPICS)) {
    const score = t.keys.reduce((n, k) => n + (has(text, k) ? k.split(' ').length + (k.length > 6 ? 1 : 0) : 0), 0)
    if (score > bestScore) { best = id; bestScore = score }
  }
  const late = SPECIAL_REPLIES.find((s) => s.afterTopics && hits(s))
  if (late && bestScore < 3) return special(late)
  if (!best) return { id: 'fallback', a: FALLBACK.a, next: FALLBACK.next }
  const t = TOPICS[best]
  return { id: best, a: t.a, next: t.next || [], link: t.link }
}

/* Shown when the chat opens before anything has been said. */
export const GREETING = 'Hey there! I can help you find your way around the site. What can I help you with?'

/* ── Recordings in Chandra's (cloned) voice ───────────────────────────────
   scripts/make-guide-audio.mjs turns every text below into an MP3 in
   public/audio/guide/ and lists them in ./guideAudio.js. A text is found by
   a short code of its exact words, so a changed sentence simply has no
   recording until the script is run again (the browser voice fills in). */
export function textKey(text) {
  let h = 0x811c9dc5
  const s = String(text)
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) }
  return (h >>> 0).toString(16).padStart(8, '0')
}
export const audioFor = (text) => GUIDE_AUDIO[textKey(text)] || null
export const hasRecordings = () => Object.keys(GUIDE_AUDIO).length > 0

/* Every text the guide can read out, with a file name for its recording. */
export function allSpokenTexts() {
  const out = []
  const add = (name, text) => { if (text && !out.some((o) => o.text === text)) out.push({ name, text }) }
  const both = (name, t) => {
    if (t && typeof t === 'object') { add(name + '-phone', t.phone); add(name + '-computer', t.computer) } else add(name, t)
  }
  for (const [key, m] of Object.entries(PAGE_MESSAGES)) both(key.startsWith('guide:') ? 'step-' + key.slice(6) : 'page-' + key.slice(1), m.text)
  for (const [id, t] of Object.entries(TOPICS)) both('topic-' + id, t.a)
  for (const r of SPECIAL_REPLIES) add('reply-' + r.id, r.a)
  both('demo', DEMO)
  add('change-reply', CHANGE_REPLY)
  add('mic-ask', MIC_ASK)
  for (const [k, t] of Object.entries(VOICE)) add('voice-' + k, t)
  add('fallback', FALLBACK.a)
  add('greeting', GREETING)
  return out
}

/* Pick the phone or computer wording. */
export const forDevice = (text, phone) => (text && typeof text === 'object' ? (phone ? text.phone : text.computer) : text)
