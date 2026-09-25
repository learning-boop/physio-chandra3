/* ─────────────────────────────────────────────────────────────────────────
   EXTRA REGIONS for the symptom guide. Most are built from Chandra's region
   assessment documents (Sep 2026; the text of each is in content/regions/).
   Elbow, wrist, hip and ankle are still the earlier July 2026 set, until
   their region documents are built. (Low back, shoulder and knee live in
   ./symptomGuide.js.)
   Same schema and scoring rules as the original guide:
     weights 3 = strong pointer, 2 = moderate, 1 = weak, negative = rules against
     results need score ≥ 3 AND ≥ 40% of that condition's max.
   ⚠ FOR CLINICIAN REVIEW before go-live — educational patterns, not diagnosis.
   ───────────────────────────────────────────────────────────────────────── */

export const EXTRA_REGIONS = {

  /* ══════════════ NECK ══════════════
     From Chandra's "Cervical assessment" region document (DRAFT 23 Sep 2026;
     the source text is content/regions/neck.md). Sources: JOSPT Neck Pain CPG
     2017, IFOMPT cervical framework 2023, Canadian C-Spine Rule 2001, Wainner
     2003, Cook 2010. The injury screen (Canadian C-Spine Rule) is in
     ./injuryScreen.js. Cervicogenic headache and whiplash are authored
     conditions (content/conditions/neck-*.md) that point at these answers.

     askIf: the question is only asked when this returns true. `draw` is the
     set of drawn zone types (null when unknown, which asks it), `ra` this
     region's answers, `all` every answer so far.
     Red flags with `drawn` are only asked when one of those areas is drawn. */
  neck: {
    name: "Neck (cervical spine)",
    redFlags: [
      { id: "nrf-thunderclap", tier: "emergency", group: "thunderclap", why: "Possible bleed or artery tear in the neck or head",
        text: "Have you had a sudden, severe headache, the worst you have ever had?" },
      { id: "nrf-artery", tier: "emergency", group: "stroke", why: "Stroke or neck artery warning signs",
        text: "Since this started, have you had any of these: room spinning or dizziness, double vision, slurred speech, trouble swallowing, sudden falls or blackouts, numb face, weakness on one side, or unsteady walking?" },
      { id: "nrf-cord", tier: "emergency", group: "cord", why: "Acute pressure on the spinal cord",
        text: "Along with the neck pain, have you lost control of your bladder or bowels, or had new numbness or weakness in both legs?" },
      { id: "nrf-mening", tier: "emergency", group: "mening", why: "Possible meningitis",
        text: "Do you have a fever with a stiff neck, a bad headache, or find bright light hard to look at?" },
      { id: "nrf-cardiac", tier: "emergency", group: "cardiac", why: "Heart pain can be felt in the neck, jaw, and arm",
        text: "Is the pain in your neck, jaw, or left arm brought on by effort, or does it come with chest tightness, shortness of breath, or sweating?" },
      { id: "nrf-kehr", tier: "emergency", group: "kehr", drawn: ["shoulder"], why: "Possible bleeding from the spleen, felt at the shoulder tip",
        text: "Did pain at the tip of your left shoulder start after a blow to your tummy or ribs, or does it come with feeling faint or dizzy?" },
      { id: "nrf-myelo", tier: "urgent", group: "myelo", why: "Possible pressure on the spinal cord (myelopathy)",
        text: "Have your hands become clumsy (buttons, writing, dropping things), or has your walking become unsteady?" },
      { id: "nrf-upperinstab", tier: "urgent", why: "Possible upper neck instability",
        text: "Do you need to hold your head up with your hands, or does moving your neck cause tingling around your lips or mouth?" },
      { id: "nrf-cad", tier: "urgent", group: "cad", why: "An early sign of a neck artery tear can be pain alone",
        text: "Did a new neck pain or headache, unlike anything you have had before, start suddenly after a neck manipulation, a sudden jerk, or a minor knock?" },
      { id: "nrf-tip", tier: "urgent", group: "tip", drawn: ["shoulder"], why: "The diaphragm, lung lining, liver or gallbladder can be felt at the shoulder tip",
        text: "Is the pain at the tip of your shoulder worse when you breathe in deeply, or does it come on after fatty meals?" }
    ],
    context: [
      { id: "age", text: "Your age?", options: [
        { id: "u18", label: "Under 18" },
        { id: "18-29", label: "18 to 29" },
        { id: "30-49", label: "30 to 49" },
        { id: "50-64", label: "50 to 64" },
        { id: "o64", label: "65 or over" }
      ]},
      { id: "onset", text: "How did it start?", options: [
        { id: "woke", label: "Woke up with it" },
        { id: "gradual", label: "Gradually, no clear reason" },
        { id: "car", label: "After a car accident or whiplash-type jolt" },
        { id: "fall", label: "After a fall, sport, or knock to the head or neck" },
        { id: "desk", label: "After long hours at a desk, screen, or in one position" },
        { id: "lift", label: "After lifting or a sudden movement" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d6w", label: "2 to 6 weeks" },
        { id: "d3m", label: "6 weeks to 3 months" },
        { id: "o3m", label: "More than 3 months" }
      ]}
    ],
    questions: [
      { id: "N1", text: "When you turn your head to look over your shoulder, what happens?", options: [
        { id: "full", label: "I can turn fully both ways" },
        { id: "onestiff", label: "It is stiff or painful turning to one side" },
        { id: "bothstiff", label: "It is stiff or painful turning both ways" },
        { id: "locked", label: "It is locked and I can barely turn it at all" }
      ]},
      { id: "N2", text: "Which of these describe your arm symptoms? Tick all that apply.",
        askIf: ({ draw, all }) => !draw || ["shoulder", "elbow", "wrist"].some((t) => draw.has(t)) ||
          [].concat(all.painQuality || []).some((q) => q === "tingling" || q === "burning"),
        options: [
          { id: "pastelbow", label: "Pain goes down the arm past the elbow" },
          { id: "armworse", label: "The arm pain is worse than the neck pain" },
          { id: "fingers", label: "Pins and needles or numbness in particular fingers" },
          { id: "handhead", label: "Resting my hand on top of my head eases the arm pain" },
          { id: "shoulderonly", label: "Pain stops at the top of the shoulder or upper arm" }
        ]},
      { id: "N3", text: "Does looking up, or tilting your head toward the sore side, bring on pain or tingling down the arm?",
        askIf: ({ ra }) => [].concat(ra.N2 || []).some((o) => o === "pastelbow" || o === "fingers"),
        options: [
          { id: "arm", label: "Yes, it goes down the arm" },
          { id: "neckonly", label: "It hurts in the neck, but not the arm" },
          { id: "neither", label: "No, neither" }
        ]},
      { id: "N4", text: "If you get headaches with this, what are they like?",
        askIf: ({ draw, ra }) => (draw && draw.has("head")) || !ra.age || ["u18", "18-29", "30-49"].includes(ra.age),
        options: [
          { id: "onesided", label: "One-sided, starting at the back of the neck or head" },
          { id: "movement", label: "Brought on by neck movement or holding one position" },
          { id: "band", label: "Both sides, like a tight band or pressure" },
          { id: "throb", label: "Throbbing, with feeling sick or finding light hard to take" },
          { id: "none", label: "I do not get headaches" }
        ]},
      { id: "N5", text: "Since your accident or injury, which of these apply? Tick all that apply.",
        askIf: ({ ra }) => ra.onset === "car" || ra.onset === "fall",
        options: [
          { id: "tired", label: "My neck gets tired holding my head up (reading, screens)" },
          { id: "spread", label: "The pain has spread to my shoulders, upper back, or arms" },
          { id: "concentrate", label: "Trouble concentrating or sleeping since it happened" },
          { id: "sensitive", label: "My neck is very sensitive to touch or cold" },
          { id: "settling", label: "It is settling a bit more each week" }
        ]},
      { id: "N6", text: "Which of these make it worse? Tick all that apply.", options: [
        { id: "desk", label: "Long spells at a desk, screen, or driving" },
        { id: "down", label: "Looking down (phone, reading, cooking)" },
        { id: "up", label: "Looking up (overhead work, reaching high shelves)" },
        { id: "lying", label: "Lying on it, or certain pillows" },
        { id: "lifting", label: "Lifting or carrying" }
      ]},
      { id: "N7", text: "How does your neck feel when you start moving after being still for a while?", options: [
        { id: "eases", label: "Stiff at first, then eases as I move" },
        { id: "worse", label: "Gets worse the more I move" },
        { id: "same", label: "About the same either way" }
      ]},
      { id: "N8", text: "Which hurts more: moving your neck, or moving your shoulder and arm (reaching, lifting the arm)?",
        askIf: ({ draw }) => !draw || draw.has("shoulder"),
        // Asked early when the drawing stops at the shoulder: the look-alike case.
        priority: ({ draw }) => !!draw && draw.has("shoulder") && !draw.has("elbow") && !draw.has("wrist"),
        options: [
          { id: "neck", label: "Moving my neck" },
          // The shoulder look-alike (test patient 4): pulls the neck patterns
          // down and points to the shoulder guide instead.
          { id: "shoulder", label: "Moving my shoulder and arm", special: "shoulderSource" },
          { id: "both", label: "Both about the same" },
          { id: "neither", label: "Neither brings it on" }
        ]}
    ],
    conditions: []
  },

  /* ══════════════ BASE OF THE NECK (CERVICOTHORACIC JUNCTION, C7–T3) ══════════════
     From Chandra's "CT junction assessment" region document (DRAFT 23 Sep
     2026; the source text is content/regions/ctj.md). Sources: JOSPT Neck
     Pain CPG 2017, IFOMPT red flags framework 2020, SVS thoracic outlet
     reporting standards 2016, IFOMPT cervical framework 2023, Travell &
     Simons 2019, McGuckin 1986.
     Reached from the body map's base-of-neck band, and from any line running
     from the neck or that band down the arm (../data/referral.js), so a
     thoracic outlet pattern can be found.
     The conditions are authored in content/conditions/ctj-*.md.
     The document's injury flag ("started in the last few days after a car
     crash, a fall from a height, or a hard blow") is not a checkbox here: as
     the document says, it is routed through the neck injury screen
     (./injuryScreen.js), which runs whenever this area is drawn.
     `group`: flags asking the same thing in neighbouring areas; only the first on
     the screen is kept. */
  ctj: {
    name: "Base of the neck & upper back",
    redFlags: [
      { id: "crf-aorta", tier: "emergency", group: "aorta", why: "Possible tear in the aorta (aortic dissection)",
        text: "Did the pain start suddenly as a tearing or ripping pain between your shoulder blades, or spreading into your chest?" },
      { id: "crf-cardiac", tier: "emergency", group: "cardiac", why: "Heart pain is often felt between the shoulder blades",
        text: "Does the pain come with chest tightness, shortness of breath, or sweating, or is it brought on by effort and spreading to your left arm or jaw?" },
      { id: "crf-lung", tier: "emergency", group: "lungclot", why: "Possible blood clot in the lung or a collapsed lung",
        text: "Do you have a sudden, sharp pain on breathing with shortness of breath, especially after a long journey, recent surgery, or with a swollen calf?" },
      { id: "crf-cord", tier: "emergency", group: "cord", why: "Possible spinal cord compression",
        text: "Along with the back pain, have you lost control of your bladder or bowels, or had new weakness, numbness, or unsteadiness in both legs?" },
      { id: "crf-pancoast", tier: "urgent", group: "pancoast", why: "Possible tumour at the top of the lung (Pancoast)",
        text: "Do you smoke or used to smoke, and have you also had a cough that will not go away, coughed up blood, or noticed a drooping eyelid on the painful side?" },
      { id: "crf-osteo", tier: "urgent", group: "osteo", why: "Possible osteoporotic fracture of the spine",
        text: "Did the pain start suddenly after a minor strain, cough, or lift, and you have osteoporosis or take long-term steroid tablets?" },
      { id: "crf-wasting", tier: "urgent", why: "Nerve compression (C8/T1) or thoracic outlet needs medical review",
        text: "Are the small muscles of your hand getting thinner, or has your grip become weak?" },
      { id: "crf-vascular", sameDay: true, tier: "urgent", why: "Possible blood vessel compression or clot in the arm (same-day review)",
        text: "Does your arm or hand turn pale, blue, cold, or swollen, especially when your arm is raised?" },
      { id: "crf-gallbladder", tier: "urgent", group: "gallbladder", why: "Gallbladder pain can be felt under the right shoulder blade",
        text: "Is the pain under your right shoulder blade worse after fatty meals, or does it come with feeling sick?" },
      { id: "crf-shingles", tier: "urgent", group: "shingles", why: "Possible shingles",
        text: "Is there a band of burning pain around one side of your chest or back, with a rash or blisters?" },
      { id: "crf-oesophagus", tier: "urgent", why: "Oesophagus pain can be felt between the shoulder blades",
        text: "Does the pain come on when you swallow, or does food feel like it sticks on the way down?" }
    ],
    context: [
      { id: "age", text: "Your age?", options: [
        { id: "u18", label: "Under 18" },
        { id: "18-29", label: "18 to 29" },
        { id: "30-49", label: "30 to 49" },
        { id: "50-64", label: "50 to 64" },
        { id: "o64", label: "65 or over" }
      ]},
      { id: "onset", text: "How did it start?", options: [
        { id: "gradual", label: "Gradually, no clear reason" },
        { id: "desk", label: "After long hours at a desk, screen, or looking down" },
        { id: "lift", label: "After lifting, carrying, or reaching" },
        { id: "sudden", label: "After a sudden movement, cough, or sneeze" },
        { id: "fall", label: "After a fall or knock" },
        { id: "woke", label: "I woke up with it" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d6w", label: "2 to 6 weeks" },
        { id: "d3m", label: "6 weeks to 3 months" },
        { id: "o3m", label: "More than 3 months" }
      ]}
    ],
    questions: [
      { id: "C1", text: "Where is the pain mainly?", options: [
        { id: "bump", label: "In the middle, at the bump at the base of my neck" },
        { id: "blades", label: "Between my shoulder blades" },
        { id: "topblade", label: "Along the top of one shoulder blade" },
        { id: "supraclav", label: "Above my collarbone, at the base of the neck on one side" },
        { id: "rib", label: "Around a rib, towards the side or front of my chest" }
      ]},
      { id: "C2", text: "Which of these bring it on? Tick all that apply.", options: [
        { id: "down", label: "Looking down, or bending my neck forward" },
        { id: "upturn", label: "Looking up, or turning my head" },
        { id: "twist", label: "Twisting my upper body" },
        { id: "overhead", label: "Raising my arms overhead" },
        { id: "carry", label: "Carrying bags, or holding my arms out (driving, typing)" }
      ]},
      { id: "C3", text: "Does breathing affect it?", options: [
        { id: "no", label: "No" },
        { id: "catch", label: "A deep breath catches at one spot in my upper back" },
        { id: "ribbreath", label: "A deep breath or cough hurts along a rib, towards the side or front" }
      ]},
      { id: "C4", text: "Which describe your arm symptoms? Tick all that apply.",
        askIf: ({ draw, all }) => !draw || ["shoulder", "elbow", "wrist"].some((t) => draw.has(t)) ||
          [].concat(all.painQuality || []).includes("tingling"),
        options: [
          { id: "ringlittle", label: "Tingling or numbness in the ring and little fingers" },
          { id: "innerforearm", label: "Tingling along the inner forearm" },
          { id: "overheadbags", label: "Worse with my arms overhead or carrying bags" },
          { id: "heavy", label: "My arm feels heavy or tires quickly" },
          { id: "wholehand", label: "My whole hand tingles, not particular fingers" }
        ]},
      { id: "C5", text: "How do you spend most of your day?", options: [
        { id: "desk", label: "At a desk or laptop" },
        { id: "lookdown", label: "Looking down (phone, reading, close work)" },
        { id: "overhead", label: "Working with my arms overhead" },
        { id: "lifting", label: "Lifting and carrying" },
        { id: "feet", label: "On my feet, moving around" }
      ]},
      { id: "C6", text: "What eases it? Tick all that apply.", options: [
        { id: "tall", label: "Sitting up tall, or drawing my shoulders back" },
        { id: "lying", label: "Lying on my back" },
        { id: "moving", label: "Moving and stretching" },
        { id: "armrest", label: "Resting my arm on an armrest or my hand on my head" },
        { id: "nothing", label: "Nothing specific" }
      ]},
      { id: "C7", text: "Do you also have any of these? Tick all that apply.", options: [
        { id: "neckstiff", label: "Neck stiffness" },
        { id: "headache", label: "Headache at the back of the head" },
        { id: "shoulder", label: "Shoulder pain when lifting my arm", special: "shoulderSource" },
        { id: "chestwall", label: "The front of my chest wall is sore to press" },
        { id: "none", label: "None of these" }
      ]},
      { id: "C8", text: "How does your upper back feel?",
        askIf: ({ ra }) => [].concat(ra.C1 || []).some((o) => o === "bump" || o === "blades"),
        options: [
          { id: "hump", label: "A hump or rounding at the base of my neck has grown" },
          { id: "stiffcrack", label: "Stiff, and stretching or cracking it eases it" },
          { id: "notstiff", label: "Not stiff" }
        ]}
    ],
    conditions: []
  },

  /* ══════════════ MID BACK (THORACIC SPINE, T4–T12) ══════════════
     From Chandra's "Thoracic assessment" region document (DRAFT 23 Sep 2026;
     the source text is content/regions/upperback.md). Sources: IFOMPT red
     flags framework 2020, Heneghan & Rushton 2016, ASAS inflammatory back
     pain 2009, Proulx & Zryd 2009, Bogduk 2009, Dreyfuss 1994, Travell &
     Simons 2019, Giamberardino 2003.
     Reached from the body map's upper back and from the front of the chest
     (costochondritis). Conditions: content/conditions/upperback-*.md.
     `group`: flags asking the same thing in neighbouring areas (base of the
     neck, TL junction); only the first on the screen is kept. */
  upperback: {
    name: "Mid back (thoracic spine)",
    redFlags: [
      { id: "trf-aorta", tier: "emergency", group: "aorta", why: "Possible tear in the aorta (aortic dissection)",
        text: "Did the pain start suddenly as a tearing or ripping pain in your mid back or between your shoulder blades, or spreading into your chest?" },
      { id: "trf-cardiac", tier: "emergency", group: "cardiac", why: "Heart pain can be felt in the mid back",
        text: "Does the pain come with chest tightness, shortness of breath, or sweating, or is it brought on by effort and spreading to your arm or jaw?" },
      { id: "trf-lung", tier: "emergency", group: "lungclot", why: "Possible blood clot in the lung or a collapsed lung",
        text: "Do you have a sudden, sharp pain on breathing with shortness of breath, especially after a long journey, recent surgery, or with a swollen calf?" },
      { id: "trf-pancreas", tier: "emergency", group: "pancreas", why: "Possible pancreatitis or perforated ulcer",
        text: "Do you have severe pain in the upper tummy that goes straight through to your back, with vomiting?" },
      { id: "trf-cord", tier: "emergency", group: "cord", why: "Possible spinal cord compression",
        text: "Along with the back pain, have you lost control of your bladder or bowels, or had sudden weakness or numbness in both legs?" },
      { id: "trf-fracture", tier: "emergency", group: "fracture", why: "Possible spinal fracture",
        text: "Did this start in the last few days after a car crash, a fall from a height, or a hard blow to the back?" },
      { id: "trf-myelo", tier: "urgent", group: "legs", why: "Possible slow pressure on the spinal cord (thoracic myelopathy)",
        text: "Have your legs gradually become stiff, heavy, or clumsy when you walk?" },
      { id: "trf-cancer", tier: "urgent", group: "cancer", why: "The thoracic spine is a common site for cancer to spread",
        text: "Have you ever had cancer, and is this a new mid-back pain?" },
      { id: "trf-osteo", tier: "urgent", group: "osteo", why: "Possible osteoporotic fracture of the spine",
        text: "Did the pain start suddenly after a minor strain, cough, or lift, and you have osteoporosis, take long-term steroid tablets, or are over 70?" },
      { id: "trf-infection", tier: "urgent", group: "infection", why: "Possible spinal infection",
        text: "Do you have a fever or chills with the back pain, or a weakened immune system, or have you injected drugs?" },
      { id: "trf-kidney", tier: "urgent", group: "kidney", why: "Possible kidney infection or stone",
        text: "Is the pain in your side or lower ribs, with a fever, burning when you pass urine, or blood in your urine?" },
      { id: "trf-gut", tier: "urgent", why: "Stomach, ulcer, or gallbladder pain can be felt in the back",
        text: "Is the pain linked to eating, heartburn, or black stools, or is it under your right shoulder blade after fatty meals?" },
      { id: "trf-shingles", tier: "urgent", group: "shingles", why: "Possible shingles",
        text: "Is there a band of burning pain around one side of your chest or back, with a rash or blisters?" }
    ],
    context: [
      { id: "age", text: "Your age?", options: [
        { id: "u18", label: "Under 18" },
        { id: "18-29", label: "18 to 29" },
        { id: "30-49", label: "30 to 49" },
        { id: "50-64", label: "50 to 64" },
        { id: "o64", label: "65 or over" }
      ]},
      { id: "onset", text: "How did it start?", options: [
        { id: "gradual", label: "Gradually, no clear reason" },
        { id: "sitting", label: "After long hours sitting, at a desk, or driving" },
        { id: "lift", label: "After lifting, twisting, or reaching" },
        { id: "cough", label: "After a cough, sneeze, or sudden movement" },
        { id: "fall", label: "After a fall or knock" },
        { id: "sport", label: "After sport or a new activity (rowing, golf, racket sports)" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d6w", label: "2 to 6 weeks" },
        { id: "d3m", label: "6 weeks to 3 months" },
        { id: "o3m", label: "More than 3 months" }
      ]}
    ],
    questions: [
      { id: "T1", text: "Where is the pain mainly?", options: [
        { id: "spine", label: "In the middle of my back, on the spine" },
        { id: "beside", label: "Beside my spine, on one side" },
        { id: "rib", label: "Wrapping around a rib, towards the side" },
        { id: "band", label: "Like a band across my back or around my chest" },
        // A first episode of chest pain should be checked by a doctor even
        // when it fits a chest-wall pattern (test patient 3).
        { id: "front", label: "At the front of my chest, on the breastbone or ribs", special: "chestFirst" }
      ]},
      { id: "T2", text: "Which of these bring it on? Tick all that apply.", options: [
        { id: "twist", label: "Twisting or turning" },
        { id: "slump", label: "Bending forward or slumping" },
        { id: "arch", label: "Arching back or reaching up" },
        { id: "sitting", label: "Sitting for a long time" },
        { id: "lifting", label: "Lifting or carrying" }
      ]},
      { id: "T3", text: "Does breathing or coughing affect it?", options: [
        { id: "no", label: "No" },
        { id: "catch", label: "A deep breath catches at one spot in my back" },
        { id: "rib", label: "A deep breath or cough hurts along a rib, towards the side or front" },
        { id: "bandcough", label: "Coughing or sneezing sends pain around my chest like a band" }
      ]},
      { id: "T4", text: "Which of these do you notice? Tick all that apply.",
        askIf: ({ ra }) => [].concat(ra.T1 || []).some((o) => o === "rib" || o === "band") || [].concat(ra.T3 || []).includes("bandcough"),
        options: [
          { id: "burning", label: "Burning or tingling in a strip around my chest or tummy" },
          { id: "skin", label: "The skin in that strip is sensitive to touch or clothing" },
          { id: "numb", label: "A numb patch on my chest or tummy" },
          { id: "none", label: "None of these" }
        ]},
      { id: "T5", text: "How do you spend most of your day?", options: [
        { id: "desk", label: "At a desk or laptop" },
        { id: "driving", label: "Driving" },
        { id: "lifting", label: "Lifting and carrying" },
        { id: "feet", label: "On my feet, moving around" },
        { id: "sport", label: "Sport or training most days" }
      ]},
      { id: "T6", text: "How does stiffness behave?", options: [
        { id: "eases", label: "Stiff at first, then eases as I move" },
        { id: "worse", label: "Gets worse the more I move" },
        { id: "night", label: "Worst in the second half of the night, and exercise helps", special: "inflammatory" },
        { id: "notstiff", label: "Not stiff" }
      ]},
      { id: "T7", text: "About the front of your chest: which apply? Tick all that apply.",
        askIf: ({ ra }) => [].concat(ra.T1 || []).includes("front"),
        options: [
          { id: "tender", label: "It is tender when I press on the breastbone or where the ribs join it" },
          { id: "pushing", label: "Worse with pushing, hugging, or lying on my front" },
          { id: "infection", label: "It started after a chest infection or a bout of coughing" },
          { id: "none", label: "None of these" }
        ]},
      { id: "T8", text: "What eases it? Tick all that apply.", options: [
        { id: "tall", label: "Sitting up tall, or gently arching back" },
        { id: "lying", label: "Lying on my back" },
        { id: "moving", label: "Moving around" },
        { id: "heat", label: "Heat or massage" },
        { id: "nothing", label: "Nothing specific" }
      ]}
    ],
    conditions: []
  },

  /* ══════════════ WHERE THE MID BACK MEETS THE LOW BACK (TL JUNCTION, T10–L2) ══════════════
     From Chandra's "TL-junction assessment" region document (DRAFT 23 Sep
     2026; the source text is content/regions/tlj.md). Sources: Maigne 1980,
     Maigne 1989, IFOMPT red flags framework 2020, McMahon 2018, SVS AAA
     guidelines 2018, Travell & Simons 2019.
     Reached from the body map's band where the ribs end, the side below the
     ribs (flank), and ANY low-back drawing: TL-junction pain is "felt low,
     starts higher" (../data/referral.js, IMPLIES).
     Conditions: content/conditions/tlj-*.md. */
  tlj: {
    name: "Where the mid back meets the low back",
    redFlags: [
      { id: "jrf-aaa", tier: "emergency", group: "aaa", why: "Possible leaking abdominal aortic aneurysm (higher risk over 60 and in smokers)",
        text: "Do you have a sudden, severe pain in your back, tummy, or side, with a pulsing feeling in your tummy, or feeling faint or sweaty?" },
      { id: "jrf-aorta", tier: "emergency", group: "aorta", why: "Possible tear in the aorta (aortic dissection)",
        text: "Did the pain start suddenly as a tearing or ripping pain in your back, spreading to your chest or tummy?" },
      { id: "jrf-conus", tier: "emergency", group: "cauda", why: "Possible compression of the lower spinal cord or nerves (conus medullaris or cauda equina)",
        text: "Have you lost control of your bladder or bowels, lost feeling between your legs or around your bottom, or had sudden weakness or numbness in both legs?" },
      { id: "jrf-fracture", tier: "emergency", group: "fracture", why: "Possible fracture; this is the most common level for spinal fractures",
        text: "Did this start in the last few days after a car crash, a fall from a height, or landing hard on your feet or bottom?" },
      { id: "jrf-pancreas", tier: "emergency", group: "pancreas", why: "Possible pancreatitis or perforated ulcer",
        text: "Do you have severe pain in the upper tummy that goes straight through to your back, with vomiting?" },
      { id: "jrf-testis", tier: "emergency", why: "Possible testicular torsion",
        text: "Do you have sudden, severe pain in a testicle?" },
      { id: "jrf-kidney", tier: "urgent", group: "kidney", why: "Possible kidney stone or kidney infection",
        text: "Does the pain come in waves of severe pain from your side down to your groin, or come with a fever, burning when you pass urine, or blood in your urine?" },
      { id: "jrf-cancer", tier: "urgent", group: "cancer", why: "Cancer can spread to the spine",
        text: "Have you ever had cancer, and is this a new back pain?" },
      { id: "jrf-osteo", tier: "urgent", group: "osteo", why: "Possible osteoporotic fracture of the spine",
        text: "Did the pain start suddenly after a minor strain, cough, or lift, and you have osteoporosis, take long-term steroid tablets, or are over 70?" },
      { id: "jrf-infection", tier: "urgent", group: "infection", why: "Possible spinal infection",
        text: "Do you have a fever or chills with the back pain, or a weakened immune system, or have you injected drugs?" },
      { id: "jrf-legs", tier: "urgent", group: "legs", why: "Possible slow pressure on the spinal cord",
        text: "Have your legs gradually become stiff, heavy, or clumsy when you walk?" },
      { id: "jrf-shingles", tier: "urgent", group: "shingles", why: "Possible shingles",
        text: "Is there a band of burning pain around one side of your body, with a rash or blisters?" }
    ],
    context: [
      { id: "age", text: "Your age?", options: [
        { id: "u18", label: "Under 18" },
        { id: "18-29", label: "18 to 29" },
        { id: "30-49", label: "30 to 49" },
        { id: "50-64", label: "50 to 64" },
        { id: "o64", label: "65 or over" }
      ]},
      { id: "onset", text: "How did it start?", options: [
        { id: "gradual", label: "Gradually, no clear reason" },
        { id: "lift", label: "After lifting, twisting, or bending" },
        { id: "fall", label: "After a fall, landing on my feet or bottom" },
        { id: "sport", label: "After a twisting sport (golf, tennis, rowing, hockey)" },
        { id: "sitting", label: "After long hours sitting or driving" },
        { id: "woke", label: "I woke up with it" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d6w", label: "2 to 6 weeks" },
        { id: "d3m", label: "6 weeks to 3 months" },
        { id: "o3m", label: "More than 3 months" }
      ]}
    ],
    questions: [
      { id: "J1", text: "Where do you feel it? Tick all that apply.", options: [
        { id: "mid", label: "In the middle of my back, where the ribs end" },
        { id: "beside", label: "Beside my spine at the bottom of the ribs, on one side" },
        { id: "crest", label: "Low back or top of the buttock, over the hip bone" },
        { id: "side", label: "At my side, just below the ribs" },
        { id: "groin", label: "In the groin or lower tummy" }
      ]},
      { id: "J2", text: "Which of these bring it on? Tick all that apply.", options: [
        { id: "twist", label: "Twisting or turning" },
        { id: "bend", label: "Bending forward" },
        { id: "extend", label: "Standing up straight after bending, or arching back" },
        { id: "sitting", label: "Sitting or driving for a long time" },
        { id: "lying", label: "Lying on the painful side" }
      ]},
      { id: "J3", text: "Is there a sore spot on the top of your hip bone, about a hand’s width out from the spine?",
        askIf: ({ ra }) => [].concat(ra.J1 || []).includes("crest"),
        options: [
          { id: "usual", label: "Yes, and pressing it brings on my usual pain" },
          { id: "tender", label: "It is tender, but it is not my usual pain" },
          { id: "no", label: "No" }
        ]},
      { id: "J4", text: "About your lower ribs: which apply? Tick all that apply.",
        askIf: ({ ra }) => [].concat(ra.J1 || []).includes("side"),
        options: [
          { id: "click", label: "A clicking or slipping feeling at the bottom edge of my ribs" },
          { id: "sharp", label: "Sharp pain at the rib edge when I bend or twist" },
          { id: "dull", label: "A dull ache at the rib edge that lasts for hours" },
          { id: "none", label: "None of these" }
        ]},
      { id: "J5", text: "About the groin or lower tummy: which apply? Tick all that apply.",
        askIf: ({ ra }) => [].concat(ra.J1 || []).includes("groin"),
        options: [
          { id: "burning", label: "Burning or tingling in the groin or upper inner thigh" },
          { id: "numbhip", label: "A numb or sensitive patch on the side of my hip" },
          { id: "nochange", label: "Groin pain that does not change with hip movement" },
          { id: "hipmove", label: "Groin pain that is worse when I move my hip", special: "hipSource" },
          { id: "none", label: "None of these" }
        ]},
      { id: "J6", text: "How does stiffness behave?", options: [
        { id: "eases", label: "Stiff at first, then eases as I move" },
        { id: "worse", label: "Gets worse the more I move" },
        { id: "night", label: "Worst in the second half of the night, and exercise helps", special: "inflammatory" },
        { id: "notstiff", label: "Not stiff" }
      ]},
      { id: "J7", text: "Which of these do you do regularly? Tick all that apply.", options: [
        { id: "golf", label: "Golf, tennis, or another twisting sport" },
        { id: "rowing", label: "Rowing or paddling" },
        { id: "lifting", label: "Lifting at work or at the gym" },
        { id: "desk", label: "Sitting at a desk or driving most of the day" },
        { id: "none", label: "None of these" }
      ]},
      { id: "J8", text: "What eases it? Tick all that apply.", options: [
        { id: "knees", label: "Lying on my back with my knees bent" },
        { id: "moving", label: "Moving around" },
        { id: "sitting", label: "Sitting" },
        { id: "heat", label: "Heat" },
        { id: "nothing", label: "Nothing specific" }
      ]}
    ],
    conditions: []
  },

  /* ══════════════ SACROILIAC JOINT & BACK OF THE PELVIS ══════════════
     From Chandra's "SI assessment" region document (DRAFT 23 Sep 2026; the
     source text is content/regions/sij.md). Sources: Laslett 2005, European
     pelvic girdle pain guidelines (Vleeming 2008), Szadek 2009, Fortin &
     Falco 1997, ASAS inflammatory back pain 2009, IFOMPT red flags framework
     2020, Slipman 2000, Travell & Simons 2019.
     Reached from the body map's back of the pelvis and buttocks (below the
     belt line). A line from there down the leg also asks the low back.
     Conditions: content/conditions/sij-*.md. */
  sij: {
    name: "Sacroiliac joint & back of the pelvis",
    redFlags: [
      { id: "prf-cauda", tier: "emergency", group: "cauda", why: "Possible cauda equina syndrome",
        text: "Do you have new numbness or tingling between your legs, around your bottom, or in your genitals, or new trouble passing urine or controlling your bowels?" },
      { id: "prf-fracture", tier: "emergency", why: "Possible pelvic or hip fracture",
        text: "After a fall or accident, are you unable to stand or put weight on your leg?" },
      { id: "prf-pregnancy", tier: "emergency", why: "Possible labour or pregnancy complication",
        text: "Are you pregnant and have severe pelvic or back pain with bleeding, fluid leaking, or regular tightenings?" },
      { id: "prf-osteo", tier: "urgent", group: "osteo", why: "Possible stress (insufficiency) fracture of the sacrum",
        text: "Did the pain start after a minor fall or with no injury, and you have osteoporosis, take long-term steroid tablets, or are over 70?" },
      { id: "prf-infection", sameDay: true, tier: "urgent", group: "infection", why: "Possible joint infection (septic sacroiliitis)",
        text: "Do you have a fever or chills with the pain, or have you recently given birth, had surgery, or injected drugs?" },
      { id: "prf-cancer", tier: "urgent", group: "cancer", why: "Cancer can spread to the pelvis and sacrum",
        text: "Have you ever had cancer, and is this a new pain?" },
      { id: "prf-axspa", tier: "urgent", why: "Possible inflammatory back pain (axial spondyloarthritis)",
        text: "Are you under 45, and has the pain lasted more than 3 months, woken you in the second half of the night, and eased with exercise rather than rest?" },
      { id: "prf-pelvic", tier: "urgent", group: "pelvic", why: "Pelvic organ causes can be felt at the back of the pelvis",
        text: "Is the pain linked to your periods, or do you have unusual vaginal bleeding or discharge?" },
      { id: "prf-kidney", tier: "urgent", group: "kidney", why: "Possible kidney stone or infection",
        text: "Does the pain come in waves from your side to your groin, or come with burning when you pass urine or blood in your urine?" }
    ],
    context: [
      { id: "age", text: "Your age?", options: [
        { id: "u18", label: "Under 18" },
        { id: "18-29", label: "18 to 29" },
        { id: "30-49", label: "30 to 49" },
        { id: "50-64", label: "50 to 64" },
        { id: "o64", label: "65 or over" }
      ]},
      { id: "onset", text: "How did it start?", options: [
        { id: "gradual", label: "Gradually, no clear reason" },
        { id: "fall", label: "After a fall onto my bottom" },
        { id: "landing", label: "After a missed step or a jarring landing on one leg" },
        { id: "lift", label: "After lifting or twisting" },
        { id: "pregnancy", label: "During pregnancy" },
        { id: "postpartum", label: "After giving birth" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d6w", label: "2 to 6 weeks" },
        { id: "d3m", label: "6 weeks to 3 months" },
        { id: "o3m", label: "More than 3 months" }
      ]}
    ],
    questions: [
      { id: "P1", text: "If you point to the worst spot with one finger, where is it?", options: [
        { id: "dimple", label: "Over the dimple at the back of my pelvis" },
        { id: "belowdimple", label: "Just below and inside the dimple" },
        { id: "lowback", label: "Across the low back, above the belt line", special: "lowbackSource" },
        { id: "midbuttock", label: "Deep in the middle of the buttock" },
        { id: "sidehip", label: "On the side of the hip" }
      ]},
      { id: "P2", text: "Which of these bring it on? Tick all that apply.", options: [
        { id: "oneleg", label: "Standing on one leg (putting on trousers or shoes)" },
        { id: "stairs", label: "Climbing stairs, or getting in and out of the car" },
        { id: "roll", label: "Rolling over in bed" },
        { id: "standup", label: "Standing up after sitting" },
        { id: "stride", label: "Walking with long strides or running" }
      ]},
      { id: "P3", text: "Which side is it on?", options: [
        { id: "one", label: "One side only" },
        { id: "both", label: "Both sides" },
        { id: "switch", label: "It switches from side to side" }
      ]},
      { id: "P4", text: "How far does it spread?", options: [
        { id: "buttock", label: "It stays in the buttock" },
        { id: "thigh", label: "Down the back of the thigh, stopping above the knee" },
        { id: "groin", label: "Into the groin" },
        { id: "belowknee", label: "Below the knee", special: "backref" }
      ]},
      { id: "P5", text: "Which of these apply? Tick all that apply.",
        askIf: ({ ra }) => ra.onset === "pregnancy" || ra.onset === "postpartum",
        options: [
          { id: "pubic", label: "Pain at the front, over the pubic bone" },
          { id: "click", label: "Clicking or grinding at the pubic bone" },
          { id: "aslr", label: "Lifting a straight leg while lying on my back feels heavy" },
          { id: "turning", label: "Turning over in bed is very hard" },
          { id: "none", label: "None of these" }
        ]},
      { id: "P6", text: "Which of these apply? Tick all that apply.",
        askIf: ({ ra }) => (!ra.age || ["u18", "18-29", "30-49"].includes(ra.age)) && (!ra.duration || ra.duration === "o3m"),
        options: [
          { id: "morning", label: "Stiff for more than 30 minutes in the morning", special: "inflammatory" },
          { id: "exercise", label: "Exercise helps more than rest", special: "inflammatory" },
          { id: "eye", label: "I have had eye inflammation, psoriasis, or inflammatory bowel disease", special: "inflammatory" },
          { id: "none", label: "None of these" }
        ]},
      { id: "P7", text: "Does bending forward or arching your low back change the pain?", options: [
        { id: "lot", label: "Yes, a lot", special: "lowbackSource" },
        { id: "little", label: "A little" },
        { id: "no", label: "No" }
      ]},
      { id: "P8", text: "Which of these apply? Tick all that apply.", options: [
        { id: "sport", label: "I run, or do sport landing on one leg" },
        { id: "hypermobile", label: "I have been told I am very flexible (hypermobile)" },
        { id: "pelvisout", label: "My pelvis feels ‘out’, or one leg feels longer" },
        { id: "none", label: "None of these" }
      ]}
    ],
    conditions: []
  },

  /* ══════════════ TAILBONE (COCCYX) ══════════════
     From Chandra's "Coccyx assessment" region document (DRAFT 23 Sep 2026;
     the source text is content/regions/coccyx.md). Sources: Maigne 2000,
     Lirette 2014, Garg & Ahuja 2021, IFOMPT red flags framework 2020.
     Reached from a narrow midline strip on the body map where the buttock
     crease begins (COCCYX_* in src/components/Body3D.jsx).
     Conditions: content/conditions/coccyx-*.md. */
  coccyx: {
    name: "Tailbone (coccyx)",
    redFlags: [
      { id: "xrf-saddle", tier: "emergency", group: "saddle", why: "Possible cauda equina syndrome",
        text: "Do you have new numbness or tingling between your legs, around your bottom, or in your genitals?" },
      { id: "xrf-bladder", tier: "emergency", group: "cauda", why: "Possible cauda equina syndrome",
        text: "Have you had new trouble passing urine, leaking urine, or losing control of your bowels?" },
      { id: "xrf-bowel", tier: "urgent", why: "Bowel causes can be felt at the tailbone",
        text: "Have you noticed bleeding from your bottom, black stools, or a change in your bowel habit lasting more than 3 weeks?" },
      { id: "xrf-pilonidal", tier: "urgent", why: "Possible pilonidal abscess or infection",
        text: "Is there swelling, redness, or discharge near the top of the buttock crease, or do you have a fever?" },
      { id: "xrf-constant", tier: "urgent", why: "Tailbone pain that is not linked to sitting is unusual",
        text: "Is the pain there all the time, worse at night, and not affected by sitting?" },
      { id: "xrf-cancer", tier: "urgent", group: "cancer", why: "Rare tumours can occur here",
        text: "Have you ever had cancer, or can you feel a lump near your tailbone?" },
      { id: "xrf-osteo", tier: "urgent", group: "osteo", why: "Possible stress (insufficiency) fracture of the sacrum",
        text: "Did the pain start after a minor fall or with no injury, and you have osteoporosis, take long-term steroid tablets, or are over 70?" },
      { id: "xrf-sphincter", tier: "urgent", why: "Possible pelvic floor or sphincter injury: see a doctor or pelvic health service",
        text: "Since giving birth, have you had trouble controlling wind or your bowels?" }
    ],
    context: [
      { id: "age", text: "Your age?", options: [
        { id: "u18", label: "Under 18" },
        { id: "18-29", label: "18 to 29" },
        { id: "30-49", label: "30 to 49" },
        { id: "50-64", label: "50 to 64" },
        { id: "o64", label: "65 or over" }
      ]},
      { id: "onset", text: "How did it start?", options: [
        { id: "fall", label: "After a fall onto my tailbone" },
        { id: "birth", label: "After giving birth" },
        { id: "sitting", label: "After long periods sitting, cycling, or rowing" },
        { id: "surgery", label: "After surgery or a procedure" },
        { id: "gradual", label: "Gradually, no clear reason" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d2m", label: "2 weeks to 2 months" },
        { id: "o2m", label: "More than 2 months" }
      ]}
    ],
    questions: [
      // Asked first: where it is decides between the tailbone patterns.
      { id: "X1", text: "If you point to the worst spot with one finger, where is it?", priority: () => true, options: [
        { id: "tip", label: "Right on the tip of the tailbone" },
        { id: "above", label: "Just above the tailbone, at the lower end of the spine" },
        { id: "crease", label: "Beside the tailbone, in the buttock crease" },
        { id: "deep", label: "Deep inside, in the pelvis or back passage", special: "pelvicHealth" },
        { id: "spread", label: "Spread across the low back and buttocks", special: "lowbackSource" }
      ]},
      { id: "X2", text: "What happens when you sit? Tick all that apply.", options: [
        { id: "hard", label: "Sitting on hard seats hurts" },
        { id: "leanback", label: "Leaning back while sitting makes it worse" },
        { id: "leanfwd", label: "Leaning forward onto my thighs eases it" },
        { id: "onebuttock", label: "Sitting on one buttock eases it" },
        { id: "fine", label: "Sitting does not bother me" }
      ]},
      { id: "X3", text: "What happens when you stand up from sitting?", options: [
        { id: "sharp", label: "A sharp pain as I stand up" },
        { id: "eases", label: "The pain eases once I am standing" },
        { id: "carries", label: "The pain carries on while I stand" },
        { id: "nochange", label: "No change" }
      ]},
      { id: "X4", text: "Which of these apply? Tick all that apply.", options: [
        { id: "bowels", label: "Pain when opening my bowels", special: "pelvicHealth" },
        { id: "sex", label: "Pain during or after sex", special: "pelvicHealth" },
        { id: "pressure", label: "A feeling of pressure, or a ball, inside the back passage", special: "pelvicHealth" },
        { id: "constipation", label: "Constipation or straining" },
        { id: "none", label: "None of these" }
      ]},
      { id: "X5", text: "About the injury or birth: which apply? Tick all that apply.",
        askIf: ({ ra }) => ra.onset === "fall" || ra.onset === "birth",
        options: [
          { id: "landed", label: "I landed straight onto my tailbone" },
          { id: "crack", label: "I heard or felt a crack" },
          { id: "bruise", label: "Bruising at the top of the buttock crease" },
          { id: "assisted", label: "A long or assisted delivery (forceps or ventouse)" },
          { id: "none", label: "None of these" }
        ]},
      { id: "X6", text: "Does bending forward or arching your low back bring on the tailbone pain?", options: [
        { id: "yes", label: "Yes", special: "lowbackSource" },
        { id: "no", label: "No" },
        { id: "ns", label: "Not sure" }
      ]},
      { id: "X7", text: "Which of these apply? Tick all that apply.", options: [
        { id: "sit", label: "I sit for most of the day" },
        { id: "cycle", label: "I cycle or row regularly" },
        { id: "weight", label: "My weight has changed a lot recently" },
        { id: "none", label: "None of these" }
      ]},
      { id: "X8", text: "Have you noticed anything on the skin at the top of the buttock crease?",
        askIf: ({ ra }) => [].concat(ra.X1 || []).includes("crease"),
        options: [
          { id: "nothing", label: "Nothing" },
          { id: "pit", label: "A small pit or hole in the skin", special: "pilonidal" },
          { id: "lump", label: "A tender lump", special: "pilonidal" }
        ]}
    ],
    conditions: []
  },

  /* ══════════════ JAW (TMJ) ══════════════
     From Chandra's "TMJ assessment" region document (DRAFT 23 Sep 2026; the
     source text is content/regions/jaw.md). Sources: DC/TMD (Schiffman 2014),
     BMJ chronic TMD pain guideline (Busse 2023), ICHD-3 2018, Travell &
     Simons 2019, Myers 2008.
     Reached from the body map's lower face and side of the head, below eye
     level (JAW_TOP in src/components/Body3D.jsx); temples and above stay the
     head. Conditions: content/conditions/jaw-*.md. */
  jaw: {
    name: "Jaw (TMJ)",
    redFlags: [
      { id: "mrf-stuckopen", tier: "emergency", why: "Jaw dislocation needs urgent reduction",
        text: "Is your jaw stuck open, so you cannot close your mouth?" },
      { id: "mrf-cardiac", tier: "emergency", group: "cardiac", why: "Heart pain can be felt in the jaw",
        text: "Is pain in your jaw brought on by effort, or does it come with chest tightness, shortness of breath, or sweating?" },
      { id: "mrf-droop", tier: "emergency", why: "Possible stroke or facial nerve palsy",
        text: "Has one side of your face suddenly drooped or become weak?" },
      { id: "mrf-fracture", sameDay: true, tier: "urgent", why: "Possible jaw fracture",
        text: "Did this start after a blow to the jaw or face, and your teeth no longer meet the way they used to?" },
      { id: "mrf-gca", sameDay: true, tier: "urgent", group: "gca", why: "Possible giant cell arteritis. Needs same-day medical review to protect eyesight",
        text: "If you are over 50: do your jaw muscles ache when chewing and ease when you stop, or is your scalp or temple tender, or has your vision changed?" },
      { id: "mrf-infection", tier: "urgent", why: "Possible dental or jaw infection (doctor or dentist)",
        text: "Is there swelling of your face or jaw with a fever, or a bad taste or discharge in your mouth?" },
      { id: "mrf-numb", tier: "urgent", why: "Nerve involvement is not typical of TMD",
        text: "Is part of your chin, lip, or face numb?" },
      { id: "mrf-lump", tier: "urgent", why: "Needs medical or dental review to rule out other causes",
        text: "Is there a lump or swelling in front of your ear or under your jaw that is growing, or has your bite changed without an injury?" },
      { id: "mrf-ear", tier: "urgent", why: "Ear problem rather than the jaw joint",
        text: "Do you have hearing loss or discharge from the ear on the painful side?" },
      { id: "mrf-throat", tier: "urgent", why: "Throat and voice box problems can refer pain to the ear and jaw (vagus and glossopharyngeal nerves)",
        text: "Do you have ear or jaw pain with a sore throat, hoarse voice, or trouble swallowing that has lasted more than 3 weeks?" }
    ],
    context: [
      { id: "age", text: "Your age?", options: [
        { id: "u18", label: "Under 18" },
        { id: "18-29", label: "18 to 29" },
        { id: "30-49", label: "30 to 49" },
        { id: "50-64", label: "50 to 64" },
        { id: "o64", label: "65 or over" }
      ]},
      { id: "onset", text: "How did it start?", options: [
        { id: "gradual", label: "Gradually, no clear reason" },
        { id: "dental", label: "After dental work, or opening my mouth very wide" },
        { id: "blow", label: "After a blow to the jaw or face" },
        { id: "stress", label: "During a stressful period" },
        { id: "woke", label: "I woke up with it" },
        { id: "years", label: "On and off for years" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d12w", label: "2 weeks to 3 months" },
        { id: "o3m", label: "More than 3 months" }
      ]}
    ],
    questions: [
      { id: "M1", text: "What is the main problem? Tick all that apply.", options: [
        { id: "muscles", label: "Pain in the jaw muscles (cheek or temple)" },
        { id: "joint", label: "Pain just in front of the ear, at the joint" },
        { id: "click", label: "Clicking or popping" },
        { id: "locks", label: "My jaw catches or locks" },
        { id: "stiff", label: "My jaw feels stiff and will not open fully" }
      ]},
      { id: "M2", text: "What brings the pain on? Tick all that apply.", options: [
        { id: "chewing", label: "Chewing, especially hard or chewy food" },
        { id: "talking", label: "Talking for a long time" },
        { id: "yawning", label: "Yawning or opening wide" },
        { id: "rest", label: "It hurts even when I am not using my jaw" },
        // Jaw movement does not change it: consider the neck (test patient 5).
        { id: "nothing", label: "Nothing, it does not hurt", special: "neckSource" }
      ]},
      { id: "M3", text: "What noises does your jaw make?", options: [
        { id: "none", label: "No noises" },
        { id: "click", label: "A click when opening or closing" },
        { id: "grating", label: "A grating or crunching sound" },
        { id: "stopped", label: "It used to click, but it stopped and now I cannot open fully" }
      ]},
      { id: "M4", text: "How wide can you open your mouth?", options: [
        { id: "fullfree", label: "Fully, without pain" },
        { id: "fullpain", label: "Fully, but it hurts" },
        { id: "partway", label: "Only partway (less than 3 fingers’ width)" },
        { id: "swing", label: "My jaw swings to one side as I open" }
      ]},
      { id: "M5", text: "When your jaw catches or locks, what happens?",
        askIf: ({ ra }) => [].concat(ra.M1 || []).some((o) => o === "locks" || o === "stiff"),
        options: [
          { id: "wiggle", label: "It catches, but I can wiggle it free" },
          { id: "closed", label: "It locks closed and I cannot open fully" },
          { id: "open", label: "It gets stuck open for a moment, then goes back" }
        ]},
      { id: "M6", text: "Which habits apply to you? Tick all that apply.", options: [
        { id: "clench", label: "I clench or grind my teeth, or wake with a sore jaw" },
        { id: "gum", label: "I chew gum, my nails, or pens" },
        { id: "posture", label: "I hold my phone between my ear and shoulder, or rest my chin on my hand" },
        { id: "none", label: "None of these" }
      ]},
      { id: "M7", text: "When is it worst?", options: [
        { id: "waking", label: "When I wake up" },
        { id: "builds", label: "It builds up through the day" },
        { id: "meals", label: "After meals" },
        { id: "nopattern", label: "No pattern" }
      ]},
      { id: "M8", text: "Do any of these come with it? Tick all that apply.", options: [
        { id: "temples", label: "Headache at the temples" },
        { id: "ear", label: "A full feeling or ringing in the ear, with no ear infection" },
        { id: "neck", label: "Neck pain", special: "neckSource" },
        { id: "teeth", label: "Teeth feel sore, but my dentist found nothing" },
        { id: "none", label: "None of these" }
      ]}
    ],
    conditions: []
  },

  /* ══════════════ HEAD (HEADACHES) ══════════════
     From Chandra's "Head assessment" region document (DRAFT 23 Sep 2026; the
     source text is content/regions/head.md). Sources: SNNOOP10 red flags
     (Do 2019), ICHD-3 2018, JOSPT Neck Pain CPG 2017, IFOMPT cervical
     framework 2023, Travell & Simons 2019.
     Reached from the body map's head above eye level: temples, forehead,
     scalp and the back of the head (the lower face is the jaw).
     Conditions: content/conditions/head-*.md. Migraine and cluster-type
     patterns are not physio conditions here: they show a see-a-doctor card.
     askIf may use "head@back" — a head mark on the back surface. */
  head: {
    name: "Head (headaches)",
    redFlags: [
      { id: "hrf-thunderclap", tier: "emergency", group: "thunderclap", why: "Possible bleed on the brain (thunderclap headache)",
        text: "Did this headache come on suddenly and reach its worst within a minute, like the worst headache of your life?" },
      { id: "hrf-stroke", tier: "emergency", group: "stroke", why: "Possible stroke or other brain cause",
        text: "With the headache, have you had any of these: weakness or numbness on one side, a drooping face, trouble speaking or understanding, confusion, loss of vision or double vision, or trouble walking?" },
      { id: "hrf-mening", tier: "emergency", group: "mening", why: "Possible meningitis",
        text: "Do you have a fever with a stiff neck, a new rash, or are you very drowsy?" },
      { id: "hrf-headinjury", tier: "emergency", why: "Possible bleeding after a head injury",
        text: "Did the headache start after a blow to the head, and since then have you vomited more than once, become very drowsy or confused, or is the headache getting worse?" },
      { id: "hrf-glaucoma", tier: "emergency", why: "Possible acute glaucoma",
        text: "Is one eye painful and red, with blurred vision or halos around lights?" },
      { id: "hrf-gca", sameDay: true, tier: "urgent", group: "gca", why: "Possible giant cell arteritis. Needs same-day medical review to protect eyesight",
        text: "If you are over 50: is your scalp or temple tender to touch, or do your jaw muscles ache when chewing and ease when you stop?" },
      { id: "hrf-new50", tier: "urgent", why: "New or progressive headache needs medical review",
        text: "Is this a new kind of headache that started after age 50, or are your headaches getting steadily worse or changing pattern over weeks?" },
      { id: "hrf-pressure", tier: "urgent", why: "Pressure-related headache can have a brain cause",
        text: "Is the headache brought on by coughing, sneezing, straining, or exercise, or much worse when you lie down or stand up?" },
      { id: "hrf-concussion", tier: "urgent", why: "Possible concussion: medical assessment before physio",
        text: "Did the headache start after a knock to the head or a whiplash injury in the last 4 weeks?" },
      { id: "hrf-medication", tier: "urgent", why: "Medication side effect: the prescriber should review it",
        text: "Did this new headache start after beginning a new medication?" },
      { id: "hrf-pregnancy", tier: "urgent", why: "Possible pre-eclampsia or other pregnancy-related cause",
        text: "Are you pregnant, or have you had a baby in the last 6 weeks, and this is a new or different headache?" },
      { id: "hrf-cad", tier: "urgent", group: "cad", why: "Early sign of a neck artery tear can be pain alone (IFOMPT framework)",
        text: "Did a new headache with neck pain, unlike anything you have had before, start after a neck manipulation or sudden jolt?" }
    ],
    context: [
      { id: "age", text: "Your age?", options: [
        { id: "u18", label: "Under 18" },
        { id: "18-29", label: "18 to 29" },
        { id: "30-49", label: "30 to 49" },
        { id: "50-64", label: "50 to 64" },
        { id: "o64", label: "65 or over" }
      ]},
      { id: "onset", text: "How did it start?", options: [
        { id: "gradual", label: "Gradually, no clear reason" },
        { id: "knock", label: "After a knock to the head or a whiplash injury" },
        { id: "desk", label: "After long hours at a desk or screen" },
        { id: "stress", label: "During a stressful period" },
        { id: "years", label: "I have had headaches on and off for years" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d12w", label: "2 weeks to 3 months" },
        { id: "o3m", label: "More than 3 months" }
      ]}
    ],
    questions: [
      { id: "D1", text: "Which best describes where your headache is?", options: [
        { id: "sameside", label: "Always the same side, starting from the neck" },
        { id: "band", label: "Both sides, like a tight band or pressure" },
        { id: "switch", label: "One side, but it can switch sides", special: "migraine" },
        { id: "eye", label: "Behind one eye, with a watery eye or runny nose on that side", special: "cluster" }
      ]},
      { id: "D2", text: "What does the headache feel like, and what comes with it? Tick all that apply.", options: [
        { id: "pressing", label: "Pressing or tightening, not throbbing" },
        { id: "throb", label: "Throbbing or pulsing", special: "migraine" },
        { id: "sick", label: "Feeling sick or being sick", special: "migraine" },
        { id: "lightnoise", label: "Light or noise bothers me" },
        { id: "aura", label: "Zigzag lines or blind spots before it starts", special: "migraine" }
      ]},
      { id: "D3", text: "How does your neck affect the headache? Tick all that apply.",
        askIf: ({ draw, ra }) => !draw || draw.has("neck") || draw.has("head@back") || [].concat(ra.D1 || []).includes("sameside"),
        options: [
          { id: "neckmove", label: "Neck movement or holding one position brings it on" },
          { id: "skullbase", label: "Pressing at the base of my skull brings on my usual headache" },
          { id: "stiffnochange", label: "My neck is stiff, but it does not change the headache" },
          { id: "neckfine", label: "My neck is fine" }
        ]},
      { id: "D4", text: "How long does each headache usually last?", options: [
        { id: "u30m", label: "Less than 30 minutes" },
        { id: "m30h4", label: "30 minutes to 4 hours" },
        { id: "h4d3", label: "4 hours to 3 days" },
        { id: "constant", label: "It never fully goes away" }
      ]},
      { id: "D5", text: "On how many days a month do you get a headache?", options: [
        { id: "u1", label: "Fewer than 1" },
        { id: "d1to14", label: "1 to 14" },
        { id: "d15", label: "15 or more", special: "medOveruse" },
        { id: "daily", label: "Every day since it started, without a break", special: "medOveruse" }
      ]},
      { id: "D6", text: "On how many days a month do you take pain medication for headaches?",
        askIf: ({ ra }) => [].concat(ra.D5 || []).some((o) => o === "d1to14" || o === "d15" || o === "daily"),
        options: [
          { id: "rarely", label: "Rarely or never" },
          { id: "upto9", label: "Up to 9 days" },
          { id: "d10to14", label: "10 to 14 days", special: "medOveruse" },
          { id: "d15plus", label: "15 or more days", special: "medOveruse" }
        ]},
      { id: "D7", text: "What tends to bring a headache on? Tick all that apply.",
        askIf: ({ ra }) => [].concat(ra.D1 || []).some((o) => o === "sameside" || o === "band" || o === "switch"),
        options: [
          { id: "stress", label: "Stress or poor sleep" },
          { id: "desk", label: "Long spells at a desk or screen" },
          { id: "hormonal", label: "My period or hormonal changes", special: "migraine" },
          { id: "food", label: "Missed meals, or certain foods or drinks" },
          { id: "lightsmell", label: "Bright light or strong smells" }
        ]},
      { id: "D8", text: "Since your head injury, which of these apply? Tick all that apply.",
        askIf: ({ ra }) => ra.onset === "knock",
        options: [
          { id: "screens", label: "Headache worse with screens or concentrating" },
          { id: "dizzy", label: "Dizzy or off balance" },
          { id: "sensitive", label: "Light or noise bothers me more than before" },
          { id: "foggy", label: "Foggy, or trouble sleeping" },
          { id: "neckpain", label: "Neck pain since the injury" }
        ]}
    ],
    conditions: []
  },

  /* ══════════════ UPPER ARM ══════════════
     From Chandra's "Upper arm assessment" region document (DRAFT 24 Sep 2026;
     the source text is content/regions/arm.md). Sources: JOSPT Neck Pain CPG
     2017, Murphy 2009, SVS thoracic outlet standards 2016, van Alfen 2006,
     Travell & Simons 2019, IFOMPT red flags framework 2020.
     Reached from the body map's upper arm, between the shoulder and the
     elbow; an upper-arm mark also asks the shoulder. Its injury screen is in
     ./injuryScreen.js. Conditions: content/conditions/arm-*.md. */
  arm: {
    name: "Upper arm",
    redFlags: [
      { id: "arf-cardiac", tier: "emergency", group: "cardiac", why: "Heart pain is often felt down the inside of the arm (T1)",
        text: "Is the pain in your arm, especially the inside of the left arm, brought on by effort, or does it come with chest tightness, shortness of breath, sweating, or jaw pain?" },
      { id: "arf-clotlung", tier: "emergency", why: "Possible clot in the arm that has travelled to the lung",
        text: "Has your whole arm suddenly become swollen, heavy, or bluish, and are you also short of breath or have chest pain?" },
      { id: "arf-stroke", tier: "emergency", group: "stroke", why: "Possible stroke",
        text: "Along with the arm symptoms, has one side of your face drooped, or have you had sudden weakness or numbness down one whole side, or trouble speaking?" },
      { id: "arf-rhabdo", tier: "emergency", why: "Possible muscle breakdown (rhabdomyolysis), which can damage the kidneys",
        text: "After very hard exercise, is your arm hugely swollen and very painful, and is your urine dark like cola?" },
      { id: "arf-cellulitis", sameDay: true, tier: "urgent", group: "cellulitis", why: "Possible skin or lymph infection (cellulitis or lymphangitis); same-day review",
        text: "Is there spreading redness, a red streak running up the arm, or a hot swollen area, with a fever?" },
      { id: "arf-clot", sameDay: true, tier: "urgent", why: "Possible blood clot in the arm (same-day review)",
        text: "Has your whole arm become swollen, heavy, or bluish over a day or two, especially after a drip or line in the arm, or heavy overhead exercise?" },
      { id: "arf-pancoast", tier: "urgent", group: "pancoast", why: "Possible tumour at the top of the lung (Pancoast)",
        text: "Do you smoke or used to smoke, and does pain run down the inside of your arm to your little finger, with a cough that will not go away, or a drooping eyelid?" },
      { id: "arf-myelo", tier: "urgent", group: "myelo", why: "Possible pressure on the spinal cord in the neck",
        text: "Do both hands feel numb or clumsy (buttons, writing), or has your walking become unsteady?" },
      { id: "arf-pta", tier: "urgent", group: "pta", why: "Possible nerve inflammation (neuralgic amyotrophy)",
        text: "Did a sudden, severe arm or shoulder pain with no injury last several days, and then your arm muscles became weak or thin?" },
      { id: "arf-shingles", tier: "urgent", group: "shingles", why: "Possible shingles",
        text: "Is there a band of burning pain down the arm, with a rash or blisters in the same strip?" },
      { id: "arf-cancer", tier: "urgent", group: "cancer", why: "Cancer or a bone lesion needs medical review",
        text: "Have you ever had cancer, or is there a lump in your arm that is growing, or deep bone pain at night that does not change with position?" }
    ],
    context: [
      { id: "age", text: "Your age?", options: [
        { id: "u18", label: "Under 18" },
        { id: "18-29", label: "18 to 29" },
        { id: "30-49", label: "30 to 49" },
        { id: "50-64", label: "50 to 64" },
        { id: "o64", label: "65 or over" }
      ]},
      { id: "onset", text: "How did it start?", options: [
        { id: "gradual", label: "Gradually, no clear reason" },
        { id: "grip", label: "After a lot of gripping, typing, or tool use" },
        { id: "gym", label: "After the gym, heavy lifting, or a new workout" },
        { id: "fall", label: "After a fall or a blow to the arm" },
        { id: "pop", label: "I felt a pop or tear while lifting" },
        { id: "rash", label: "It came with a rash, or after an illness or vaccine" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d6w", label: "2 to 6 weeks" },
        { id: "d3m", label: "6 weeks to 3 months" },
        { id: "o3m", label: "More than 3 months" }
      ]}
    ],
    questions: [
      { id: "U1", text: "Where is the pain mainly?", options: [
        { id: "front", label: "Front of the upper arm (biceps)" },
        { id: "back", label: "Back of the upper arm (triceps)" },
        { id: "outer", label: "Outer upper arm, just below the shoulder" },
        { id: "inner", label: "Inner upper arm, towards the armpit" },
        { id: "whole", label: "The whole upper arm" }
      ]},
      { id: "U2", text: "Which of these bring it on? Tick all that apply.", options: [
        { id: "grip", label: "Gripping, typing, or using tools" },
        { id: "lift", label: "Lifting, curls, or push-ups" },
        { id: "overhead", label: "Lifting my arm up or reaching overhead" },
        { id: "neckdesk", label: "Moving my neck, or sitting at a desk for long", special: "neckSource" },
        { id: "carry", label: "Carrying bags, or letting the arm hang down" }
      ]},
      { id: "U3", text: "How does the pain spread? Tick all that apply.",
        // Early when the drawing runs down the whole arm: spread is what tells the causes apart.
        priority: ({ draw }) => !!draw && draw.has("upperarm") && draw.has("wrist"),
        options: [
        { id: "onemuscle", label: "It stays in one muscle area" },
        { id: "line", label: "It runs along a narrow line into particular fingers", special: "neckSource" },
        { id: "fromneck", label: "It starts at the neck or shoulder and travels down the arm", special: "neckSource" },
        { id: "forearm", label: "It goes on down into the forearm" },
        { id: "heavy", label: "The whole arm feels heavy and tired, especially with it raised" }
      ]},
      { id: "U4", text: "Which of these do you notice in your hand? Tick all that apply.",
        askIf: ({ draw, all }) => !draw || draw.has("wrist") || [].concat(all.painQuality || []).includes("tingling"),
        options: [
          { id: "little", label: "Tingling or numbness in the little and ring fingers" },
          { id: "thumb", label: "Tingling or numbness in the thumb, index, and middle fingers" },
          { id: "weakgrip", label: "Weak grip, or dropping things" },
          { id: "wristdrop", label: "Cannot lift the wrist or straighten the fingers well" },
          { id: "none", label: "None of these" }
        ]},
      { id: "U5", text: "Which hurts more: moving your neck, moving your shoulder, or using your arm and hand?",
        askIf: ({ draw, all }) => !draw || ["neck", "shoulder", "wrist"].some((t) => draw.has(t)) ||
          [].concat(all.painQuality || []).some((q) => q === "tingling" || q === "burning"),
        options: [
          { id: "neck", label: "Moving my neck", special: "neckSource" },
          { id: "shoulder", label: "Moving my shoulder", special: "shoulderSource" },
          { id: "armhand", label: "Using my arm and hand" },
          { id: "none", label: "None of these bring it on" }
        ]},
      { id: "U6", text: "About the muscle after exercise: which apply?",
        askIf: ({ ra }) => ra.onset === "gym",
        options: [
          { id: "doms", label: "Sore and stiff 1 to 3 days after, then easing" },
          { id: "sharp", label: "A sudden sharp pain during a lift, with bruising after" },
          { id: "knot", label: "A tender knot in the muscle that sends pain elsewhere when pressed" },
          { id: "none", label: "None of these" }
        ]},
      { id: "U7", text: "When your arm is raised overhead, or you carry something heavy, what happens?",
        askIf: ({ ra }) => [].concat(ra.U2 || []).includes("carry") || [].concat(ra.U3 || []).includes("heavy"),
        options: [
          { id: "heavy", label: "The arm goes heavy, tingly, or dead" },
          { id: "pale", label: "The hand goes pale or cold", special: "armDoctor" },
          { id: "swells", label: "The arm swells or looks bluish", special: "armDoctor" },
          { id: "nothing", label: "Nothing changes" }
        ]},
      { id: "U8", text: "Did any of these come with it? Tick all that apply.",
        askIf: ({ ra }) => ra.onset === "rash" || (ra.onset === "gradual" && (ra.duration === "d2w" || ra.duration === "d6w")),
        options: [
          { id: "rash", label: "A rash or blisters in a strip on the arm", special: "armDoctor" },
          { id: "severe", label: "Severe pain for a few days, then weakness", special: "armDoctor" },
          { id: "glands", label: "Swollen glands in the armpit", special: "armDoctor" },
          { id: "illness", label: "An illness or vaccine in the weeks before" },
          { id: "none", label: "None of these" }
        ]}
    ],
    conditions: []
  },

  /* ══════════════ ELBOW ══════════════
     From Chandra's "Elbow assessment" region document (reviewed by Chandra,
     25 Sep 2026; the source text is content/regions/elbow.md). Sources: JOSPT
     lateral elbow pain CPG 2022, Coombes 2015, Appelboam 2008 (elbow extension
     test), O'Driscoll 2005 and 2007, Novak 1994, Murphy 2009, Travell & Simons
     2019.
     Reached from the body map's elbow band. Its injury screen is in
     ./injuryScreen.js. Conditions: content/conditions/elbow-*.md. */
  elbow: {
    name: "Elbow",
    redFlags: [
      { id: "erf-hot", tier: "emergency", why: "Possible joint infection (septic arthritis)",
        text: "Is your elbow hot, red, and swollen, with a fever or feeling very unwell?" },
      { id: "erf-bursa", sameDay: true, tier: "urgent", why: "Possible infected bursa at the back of the elbow",
        text: "Is there a swelling at the point of your elbow that is red, warm, or has a cut or graze over it?" },
      { id: "erf-gout", tier: "urgent", why: "Possible gout or other crystal arthritis",
        text: "Did your elbow become suddenly hot, swollen, and very painful overnight, and have you had gout before?" },
      { id: "erf-nerve", tier: "urgent", why: "Nerve weakness (ulnar or radial nerve) needs medical review",
        text: "Is your hand becoming weaker, is the muscle between your thumb and index finger getting thinner, or can you not lift your wrist?" },
      { id: "erf-myelo", tier: "urgent", group: "myelo", why: "Possible pressure on the spinal cord in the neck",
        text: "Do both hands feel numb or clumsy (buttons, writing), or has your walking become unsteady?" },
      { id: "erf-child", tier: "urgent", why: "Possible growth plate injury or osteochondritis dissecans; needs imaging",
        text: "Are you under 16, and does your elbow hurt with throwing or gymnastics, or has it started to catch or lock?" },
      { id: "erf-pta", tier: "urgent", group: "pta", why: "Possible nerve inflammation (neuralgic amyotrophy)",
        text: "Did a sudden, severe arm pain with no injury last several days, and then your arm or hand muscles became weak?" },
      { id: "erf-cancer", tier: "urgent", group: "cancer", why: "Cancer or a bone lesion needs medical review",
        text: "Have you ever had cancer, or is there a lump in your arm that is growing, or pain at night that does not change with position?" }
    ],
    context: [
      { id: "age", text: "Your age?", options: [
        { id: "u18", label: "Under 18" },
        { id: "18-29", label: "18 to 29" },
        { id: "30-49", label: "30 to 49" },
        { id: "50-64", label: "50 to 64" },
        { id: "o64", label: "65 or over" }
      ]},
      { id: "onset", text: "How did it start?", options: [
        { id: "gradual", label: "Gradually, no clear reason" },
        { id: "grip", label: "After a lot of gripping, lifting, or tool or computer use" },
        { id: "throw", label: "After throwing, or a racquet or golf swing" },
        { id: "fall", label: "After a fall onto the hand or elbow" },
        { id: "pop", label: "I felt a pop while lifting or pulling" },
        { id: "swell", label: "Sudden pain and swelling with no injury" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d6w", label: "2 to 6 weeks" },
        { id: "d3m", label: "6 weeks to 3 months" },
        { id: "o3m", label: "More than 3 months" }
      ]}
    ],
    questions: [
      { id: "E1", text: "Where is the pain mainly?", options: [
        { id: "outer", label: "Outer elbow, on the bony bump on the thumb side" },
        { id: "inner", label: "Inner elbow, on the bony bump on the little-finger side" },
        { id: "front", label: "Front of the elbow, in the crease" },
        { id: "back", label: "Back of the elbow, at the point" },
        { id: "muscles", label: "In the forearm or upper arm muscles, not at the elbow itself" }
      ]},
      { id: "E2", text: "Which of these bring it on? Tick all that apply.", options: [
        { id: "grip", label: "Gripping, shaking hands, or lifting a mug or kettle" },
        { id: "twist", label: "Turning a key or screwdriver, or lifting with the palm up" },
        { id: "throw", label: "Throwing, a golf swing, or a racquet shot" },
        { id: "lean", label: "Leaning on my elbow" },
        { id: "bent", label: "Keeping my elbow bent for a long time (phone, sleeping with arm bent)" }
      ]},
      { id: "E3", text: "Which of these do you notice in your hand? Tick all that apply.",
        askIf: ({ draw, all }) => !draw || draw.has("wrist") || [].concat(all.painQuality || []).includes("tingling"),
        // Early when there is tingling (or the drawing is unknown): it
        // separates the nerve from the tendons.
        priority: ({ draw, all }) => !draw || [].concat(all.painQuality || []).includes("tingling"),
        options: [
          { id: "little", label: "Tingling or numbness in the little and ring fingers" },
          { id: "thumb", label: "Tingling or numbness in the thumb, index, and middle fingers", special: "medianhand" },
          { id: "weak", label: "Weak grip, or dropping things" },
          { id: "clumsy", label: "Clumsy with fine movements (buttons, coins)" },
          { id: "none", label: "None of these" }
        ]},
      { id: "E4", text: "If you keep your elbow fully bent for a minute (like holding a phone to your ear), what happens?",
        askIf: ({ ra }) => [].concat(ra.E3 || []).includes("little"),
        priority: () => true,
        options: [
          { id: "tingle", label: "Tingling comes on in the little and ring fingers" },
          { id: "ache", label: "The elbow aches, but no tingling" },
          { id: "nothing", label: "Nothing changes" },
          { id: "unsure", label: "Not sure" }
        ]},
      { id: "E5", text: "How does your elbow move?",
        // Early from 50: stiffness or catching points to the joint itself.
        priority: ({ ra }) => ra.age === "50-64" || ra.age === "o64",
        options: [
        { id: "full", label: "It straightens and bends fully" },
        { id: "nostraight", label: "It will not straighten fully" },
        { id: "locks", label: "It catches or locks at times" },
        { id: "clicks", label: "It clicks or feels unstable" },
        { id: "swelling", label: "There is a soft swelling at the point of the elbow" }
      ]},
      { id: "E6", text: "Which hurts more: moving your neck, or using your arm and hand?",
        askIf: ({ draw, all }) => !draw || ["neck", "ctj", "shoulder", "wrist"].some((t) => draw.has(t)) ||
          [].concat(all.painQuality || []).some((q) => q === "tingling" || q === "burning"),
        options: [
          { id: "neck", label: "Moving my neck", special: "neckSource" },
          { id: "armhand", label: "Using my arm and hand" },
          { id: "both", label: "Both about the same" },
          { id: "neither", label: "Neither brings it on" }
        ]},
      { id: "E7", text: "How does the pain spread? Tick all that apply.",
        askIf: ({ draw }) => !draw || ["neck", "ctj", "shoulder", "upperarm", "forearm", "wrist"].some((t) => draw.has(t)),
        options: [
          { id: "fromneck", label: "It starts at the neck or shoulder and travels down the arm", special: "neckSource" },
          { id: "deep", label: "A deep ache in the top of the forearm, a few finger-widths below the outer elbow" },
          { id: "line", label: "It runs along a narrow line down the forearm into particular fingers" },
          { id: "stays", label: "It stays around the elbow" },
          { id: "whole", label: "It is spread across the whole arm" }
        ]},
      { id: "E8", text: "If you throw or play racquet sports: which apply? Tick all that apply.",
        askIf: ({ ra }) => ra.onset === "throw",
        priority: () => true,
        options: [
          { id: "backthrow", label: "Pain on the inside of the elbow as my arm goes back to throw" },
          { id: "pop", label: "I felt a pop on the inside of the elbow" },
          { id: "speed", label: "Losing speed or accuracy" },
          { id: "tingle", label: "Tingling in the little finger when I throw" },
          { id: "none", label: "None of these" }
        ]}
    ],
    conditions: []
  },

  /* ══════════════ FOREARM ══════════════
     From Chandra's "Forearm assessment" region document (reviewed by Chandra,
     25 Sep 2026; the source text is content/regions/forearm.md). Sources: Lee
     & LaStayo 2004 (pronator syndrome), Moradi 2015 (radial tunnel), JOSPT
     lateral elbow pain CPG 2022, Murphy 2009, van Alfen 2006, Travell &
     Simons 2019.
     Reached from the body map's forearm band, between the elbow and the
     wrist. Its injury screen is in ./injuryScreen.js. Conditions:
     content/conditions/forearm-*.md. */
  forearm: {
    name: "Forearm",
    // Drawn with the elbow, a forearm mark is often elbow pain spreading down:
    // it then gets no guaranteed first question (see nextQuestion).
    yieldsTo: ["elbow"],
    redFlags: [
      { id: "frf-compartment", tier: "emergency", why: "Possible compartment syndrome (pressure building up in the forearm)",
        text: "Is your forearm pain getting worse and worse, with the forearm tight and swollen and much worse when your fingers are moved, especially under a cast or tight bandage?" },
      { id: "frf-necfasc", tier: "emergency", why: "Possible severe skin and tissue infection (necrotising fasciitis)",
        text: "Is there a hot, swollen, red area on your forearm that is spreading fast, with pain far worse than it looks, or feeling very unwell?" },
      { id: "frf-cardiac", tier: "emergency", group: "cardiac", why: "Heart pain can be felt down the inside of the arm and forearm",
        text: "Is the pain on the inside of your left forearm or arm brought on by effort, or does it come with chest tightness, shortness of breath, or sweating?" },
      { id: "frf-stroke", tier: "emergency", group: "stroke", why: "Possible stroke",
        text: "Along with the arm symptoms, has one side of your face drooped, or have you had sudden weakness or numbness down one whole side, or trouble speaking?" },
      { id: "frf-cellulitis", sameDay: true, tier: "urgent", group: "cellulitis", why: "Possible skin or lymph infection (cellulitis or lymphangitis); same-day review",
        text: "Is there spreading redness, a red streak running up the arm, or a hot swollen area, with a fever?" },
      { id: "frf-nerve", tier: "urgent", why: "Nerve weakness (radial or anterior interosseous nerve) needs medical review",
        text: "Is your hand becoming weaker, can you not lift your wrist, or can you not make an “OK” sign with your thumb and index finger?" },
      { id: "frf-myelo", tier: "urgent", group: "myelo", why: "Possible pressure on the spinal cord in the neck",
        text: "Do both hands feel numb or clumsy (buttons, writing), or has your walking become unsteady?" },
      { id: "frf-pancoast", tier: "urgent", group: "pancoast", why: "Possible tumour at the top of the lung (Pancoast)",
        text: "Do you smoke or used to smoke, and does pain run down the little-finger side of your forearm, with a cough that will not go away, or a drooping eyelid?" },
      { id: "frf-stress", tier: "urgent", why: "Possible stress fracture or growth plate injury; needs imaging",
        text: "Are you a young gymnast or weight-bearing athlete with a deep, pinpoint bone pain in the forearm that is worse with loading?" },
      { id: "frf-shingles", tier: "urgent", group: "shingles", why: "Possible shingles",
        text: "Is there a band of burning pain down the forearm, with a rash or blisters in the same strip?" },
      { id: "frf-cancer", tier: "urgent", group: "cancer", why: "Cancer or a bone lesion needs medical review",
        text: "Have you ever had cancer, or is there a lump in your forearm that is growing, or deep bone pain at night that does not change with position?" }
    ],
    context: [
      { id: "age", text: "Your age?", options: [
        { id: "u18", label: "Under 18" },
        { id: "18-29", label: "18 to 29" },
        { id: "30-49", label: "30 to 49" },
        { id: "50-64", label: "50 to 64" },
        { id: "o64", label: "65 or over" }
      ]},
      { id: "onset", text: "How did it start?", options: [
        { id: "gradual", label: "Gradually, no clear reason" },
        { id: "grip", label: "After a lot of gripping, typing, or tool use" },
        { id: "newtask", label: "After a new or increased repeated task (rowing, paddling, weights, a new job)" },
        { id: "sport", label: "It comes on during sport and eases when I stop" },
        { id: "fall", label: "After a fall onto the hand, or a blow" },
        { id: "rash", label: "It came with a rash, or after an illness or vaccine" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d6w", label: "2 to 6 weeks" },
        { id: "d3m", label: "6 weeks to 3 months" },
        { id: "o3m", label: "More than 3 months" }
      ]}
    ],
    questions: [
      { id: "F1", text: "Where is the pain mainly?", options: [
        { id: "radial", label: "Top of the forearm near the elbow, on the thumb side" },
        { id: "distal", label: "Top of the forearm about four finger-widths above the wrist, on the thumb side" },
        { id: "volar", label: "Underside of the forearm near the elbow (palm side)" },
        { id: "ulnar", label: "Little-finger side of the forearm" },
        { id: "whole", label: "The whole forearm" }
      ]},
      { id: "F2", text: "Which of these bring it on? Tick all that apply.", options: [
        { id: "grip", label: "Gripping, typing, or using tools" },
        { id: "twist", label: "Turning my palm up and down (screwdriver, key, door handle)" },
        { id: "wrist", label: "Repeated wrist movements (rowing, paddling, weights)" },
        { id: "sport", label: "It builds during sport and eases within minutes of stopping" },
        { id: "strap", label: "A tight watch strap, cuff, or bracelet" }
      ]},
      { id: "F3", text: "Which of these do you notice? Tick all that apply.", options: [
        { id: "squeak", label: "A squeaking or creaking feeling when I move my wrist" },
        { id: "swelling", label: "Swelling along the top of the forearm" },
        { id: "tight", label: "The forearm goes tight and hard with use" },
        { id: "burning", label: "Burning or tingling over the back of the thumb and wrist" },
        { id: "none", label: "None of these" }
      ]},
      { id: "F4", text: "Which of these do you notice in your hand? Tick all that apply.",
        askIf: ({ draw, all }) => !draw || draw.has("wrist") || [].concat(all.painQuality || []).includes("tingling"),
        // Early when there is tingling (or the drawing is unknown): it
        // separates the nerves from the muscles and tendons.
        priority: ({ draw, all }) => !draw || [].concat(all.painQuality || []).includes("tingling"),
        options: [
          { id: "thumb", label: "Tingling or numbness in the thumb, index, and middle fingers" },
          { id: "little", label: "Tingling or numbness in the little and ring fingers", special: "ulnarhand" },
          { id: "pinch", label: "Weak pinch, or cannot make an “OK” sign with thumb and index finger", special: "handWeakness" },
          { id: "wristdrop", label: "Cannot lift the wrist or straighten the fingers well", special: "handWeakness" },
          { id: "none", label: "None of these" }
        ]},
      { id: "F5", text: "Does tingling in your fingers wake you at night?",
        askIf: ({ ra }) => [].concat(ra.F4 || []).includes("thumb"),
        priority: () => true,
        options: [
          { id: "night", label: "Yes, often, and shaking the hand helps", special: "medianhand" },
          { id: "use", label: "No; it comes on when I use my forearm, with an ache in the forearm" },
          { id: "notingle", label: "I do not get tingling" }
        ]},
      { id: "F6", text: "Which hurts more: moving your neck, moving your elbow, or using your wrist and hand?",
        askIf: ({ draw, all }) => !draw || ["neck", "ctj", "shoulder", "wrist"].some((t) => draw.has(t)) ||
          [].concat(all.painQuality || []).some((q) => q === "tingling" || q === "burning"),
        options: [
          { id: "neck", label: "Moving my neck", special: "neckSource" },
          { id: "elbow", label: "Moving my elbow" },
          { id: "wristhand", label: "Using my wrist and hand" },
          { id: "none", label: "None of these bring it on" }
        ]},
      { id: "F7", text: "How does the pain spread? Tick all that apply.",
        askIf: ({ draw }) => !draw || ["neck", "ctj", "shoulder", "upperarm", "elbow", "wrist"].some((t) => draw.has(t)),
        options: [
          { id: "stays", label: "It stays in the forearm" },
          { id: "fromelbow", label: "It starts at the outer elbow and spreads down" },
          { id: "fromneck", label: "It starts at the neck or shoulder and travels down the arm", special: "neckSource" },
          { id: "deep", label: "A deep ache below the outer elbow, without numbness" },
          { id: "line", label: "It runs along a narrow line into particular fingers" }
        ]},
      { id: "F8", text: "If it comes on during sport (rowing, motocross, climbing, paddling): which apply? Tick all that apply.",
        askIf: ({ ra }) => ra.onset === "sport" || [].concat(ra.F2 || []).includes("sport"),
        priority: () => true,
        options: [
          { id: "tight", label: "The forearm goes tight and hard" },
          { id: "numb", label: "The hand goes numb or weak during exercise" },
          { id: "eases", label: "It eases within 10 to 30 minutes of stopping" },
          { id: "lasts", label: "It lasts into the next day" },
          { id: "none", label: "None of these" }
        ]}
    ],
    conditions: []
  },

  /* ══════════════ WRIST ══════════════
     From Chandra's "Wrist assessment" region document (reviewed by Chandra,
     25 Sep 2026; the source text is content/regions/wrist.md). Sources:
     JOSPT carpal tunnel CPG 2019, Graham 2006 (CTS-6), Duckworth 2012
     (scaphoid), Ilyas 2007 (de Quervain), Tay 2007 (ulnar fovea sign),
     Harden 2010 (Budapest criteria), Lee & LaStayo 2004, Travell & Simons
     2019.
     Reached from the body map's wrist band, which also covers the hand until
     the hand document is built. Its injury screen is in ./injuryScreen.js.
     Conditions: content/conditions/wrist-*.md. */
  wrist: {
    name: "Wrist & hand",
    redFlags: [
      { id: "wrf-hot", tier: "emergency", why: "Possible joint infection (septic arthritis)",
        text: "Is your wrist hot, red, and swollen, with a fever or feeling very unwell?" },
      { id: "wrf-bite", tier: "emergency", why: "Possible tendon sheath or deep hand infection; needs urgent surgical review",
        text: "Did you have a cut, bite, or puncture on the wrist or hand, and is it now swollen, red, and very painful to move the fingers?" },
      { id: "wrf-stroke", tier: "emergency", group: "stroke", why: "Possible stroke",
        text: "Along with the hand symptoms, has one side of your face drooped, or have you had sudden weakness or numbness down one whole side, or trouble speaking?" },
      { id: "wrf-crps", tier: "urgent", why: "Possible complex regional pain syndrome (CRPS); early treatment matters",
        text: "Since a wrist injury, surgery, or cast, is your hand burning, swollen, shiny, changing colour or temperature, or so sensitive that even light touch hurts?" },
      { id: "wrf-gout", tier: "urgent", why: "Possible gout or other crystal arthritis",
        text: "Did your wrist become suddenly hot, swollen, and very painful overnight, and have you had gout or “pseudogout” before?" },
      { id: "wrf-inflam", tier: "urgent", why: "Possible inflammatory arthritis (for example rheumatoid arthritis)",
        text: "Are both wrists or several finger joints swollen and stiff for more than an hour in the morning?" },
      { id: "wrf-numb", tier: "urgent", why: "Severe nerve compression (carpal tunnel) may need a specialist opinion",
        text: "Is the numbness in your fingers there all the time now, or is the muscle at the base of your thumb getting thinner?" },
      { id: "wrf-myelo", tier: "urgent", group: "myelo", why: "Possible pressure on the spinal cord in the neck",
        text: "Do both hands feel numb or clumsy (buttons, writing), or has your walking become unsteady?" },
      { id: "wrf-raynaud", tier: "urgent", why: "Possible circulation problem (Raynaud's, or damage to the artery in the palm)",
        text: "Do your fingers or hand go white, blue, or cold in attacks, or is there a painful cold finger that does not recover?" },
      { id: "wrf-cancer", tier: "urgent", group: "cancer", why: "A lump or bone lesion needs medical review",
        text: "Have you ever had cancer, or is there a hard lump at the wrist that is growing, or deep pain at night that does not change with position?" }
    ],
    context: [
      { id: "age", text: "Your age?", options: [
        { id: "u18", label: "Under 18" },
        { id: "18-29", label: "18 to 29" },
        { id: "30-49", label: "30 to 49" },
        { id: "50-64", label: "50 to 64" },
        { id: "o64", label: "65 or over" }
      ]},
      { id: "onset", text: "How did it start?", options: [
        { id: "gradual", label: "Gradually, no clear reason" },
        { id: "grip", label: "After a lot of gripping, typing, or tool use" },
        { id: "baby", label: "Since having a baby, or lifting a baby a lot" },
        { id: "pregnancy", label: "During pregnancy" },
        { id: "fall", label: "After a fall onto the hand" },
        { id: "twist", label: "After a twist (racquet, golf, a drill that caught)" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d6w", label: "2 to 6 weeks" },
        { id: "d3m", label: "6 weeks to 3 months" },
        { id: "o3m", label: "More than 3 months" }
      ]}
    ],
    questions: [
      { id: "W1", text: "Where is the pain mainly?", options: [
        { id: "thumb", label: "Thumb side of the wrist" },
        { id: "little", label: "Little-finger side of the wrist" },
        { id: "back", label: "Back of the wrist, in the middle" },
        { id: "palm", label: "Palm side of the wrist" },
        { id: "whole", label: "The whole wrist" }
      ]},
      { id: "W2", text: "Which of these bring it on? Tick all that apply.", options: [
        { id: "grip", label: "Gripping and twisting (opening jars, wringing a cloth)" },
        { id: "baby", label: "Lifting a baby, or lifting with the thumb up" },
        { id: "weight", label: "Putting weight through my hand (push-ups, getting up from a chair)" },
        { id: "rotate", label: "Turning my palm up and down (key, door handle)" },
        { id: "typing", label: "Typing, or using a mouse or phone" }
      ]},
      // The wrist band on the body map covers the hand, so this is always asked.
      { id: "W3", text: "Which of these do you notice in your hand? Tick all that apply.",
        // Early when there is tingling (or the drawing is unknown).
        priority: ({ draw, all }) => !draw || [].concat(all.painQuality || []).includes("tingling"),
        options: [
          { id: "thumb", label: "Tingling or numbness in the thumb, index, and middle fingers" },
          { id: "little", label: "Tingling or numbness in the little and ring fingers", special: "ulnarhand" },
          { id: "whole", label: "The whole hand tingles" },
          { id: "weak", label: "Weak grip, or dropping things" },
          { id: "none", label: "None of these" }
        ]},
      { id: "W4", text: "When does the tingling come on? Tick all that apply.",
        askIf: ({ ra }) => [].concat(ra.W3 || []).includes("thumb"),
        priority: () => true,
        options: [
          { id: "night", label: "It wakes me at night, and shaking my hand helps" },
          { id: "posture", label: "When driving, holding a phone, or reading" },
          { id: "constant", label: "The numbness is there all the time", special: "nerveDoctor" },
          { id: "back", label: "The back of my hand is numb too" },
          { id: "weakthumb", label: "My thumb feels weak or clumsy", special: "nerveDoctor" }
        ]},
      { id: "W5", text: "Tuck your thumb into your palm, close your fingers over it, then gently bend your wrist towards your little finger. What happens?",
        askIf: ({ ra }) => [].concat(ra.W1 || []).includes("thumb"),
        priority: () => true,
        options: [
          { id: "sharp", label: "Sharp pain on the thumb side of the wrist" },
          { id: "mild", label: "A mild stretch only" },
          { id: "skip", label: "I would rather not try" }
        ]},
      { id: "W6", text: "On the little-finger side: which apply? Tick all that apply.",
        askIf: ({ ra }) => [].concat(ra.W1 || []).includes("little"),
        priority: () => true,
        options: [
          { id: "clunk", label: "A click or clunk when I turn my palm up and down" },
          { id: "fovea", label: "Pain when I press the soft spot just beyond the bony bump" },
          { id: "snap", label: "A tendon that snaps or flicks over the back of the wrist" },
          { id: "lean", label: "Pain leaning on my hand, or the wrist gives way" },
          { id: "none", label: "None of these" }
        ]},
      { id: "W7", text: "Is there a lump at your wrist?", options: [
        { id: "soft", label: "A soft, round lump on the back of the wrist that changes size" },
        { id: "palmlump", label: "A lump on the palm side, near the thumb" },
        { id: "hard", label: "A hard lump that is growing", special: "lumpDoctor" },
        { id: "none", label: "No lump" }
      ]},
      { id: "W8", text: "Which hurts more: moving your neck, moving your elbow, or using your wrist and hand?",
        askIf: ({ draw, all }) => !draw || ["neck", "ctj", "elbow", "forearm"].some((t) => draw.has(t)) ||
          [].concat(all.painQuality || []).some((q) => q === "tingling" || q === "burning"),
        options: [
          { id: "neck", label: "Moving my neck", special: "neckSource" },
          { id: "elbow", label: "Moving my elbow" },
          { id: "wristhand", label: "Using my wrist and hand" },
          { id: "none", label: "None of these bring it on" }
        ]}
    ],
    conditions: []
  },

  /* ══════════════ HIP ══════════════ */
  hip: {
    name: "Hip & groin",
    redFlags: [
      { id: "hrf-fall", sameDay: true, why: "Possible hip fracture", text: "A fall or impact after which you cannot put weight on the leg", tier: "urgent" },
      { id: "hrf-hot", sameDay: true, why: "Possible hip joint infection", text: "Severe groin/hip pain with fever, or a hot swollen joint", tier: "urgent" },
      { id: "hrf-child", why: "Hip problems in growing children (such as a slipped growth plate) need a doctor to check first", text: "This is for a child or teenager with a limp or groin/knee pain", tier: "urgent" }
    ],
    context: [
      { id: "age", text: "Your age?", options: [
        { id: "u30", label: "Under 30", weights: { fai: 1, add: 1 } },
        { id: "30-50", label: "30 – 50" },
        { id: "o50", label: "Over 50", weights: { gtps: 1 } }
      ]},
      { id: "onset", text: "How did it start?", options: [
        { id: "sprint", label: "Suddenly — sprinting, kicking, or changing direction", weights: { add: 3 } },
        { id: "run", label: "Gradually with running, standing, or hills", weights: { gtps: 1 } },
        { id: "sport", label: "Gradually with pivot sports or deep squats", weights: { fai: 2 } },
        { id: "sit", label: "Gradually — lots of sitting", weights: { piri: 1, fai: 1 } },
        { id: "ns", label: "Not sure" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d6w", label: "2 – 6 weeks" },
        { id: "d6m", label: "More than 6 weeks" },
        { id: "years", label: "Comes and goes over years" }
      ]}
    ],
    questions: [
      { id: "H1", text: "Where do you feel it most?", options: [
        // Snapping is felt at the outer hip (IT band) or the front (hip flexor),
        // so someone with a snapping hip can point to where it is — without
        // this the location question gave snapping hip nothing to go on.
        { id: "outside", label: "The outside of the hip — tender to lie on", weights: { gtps: 3, snap: 1 } },
        { id: "groin", label: "Deep in the groin / front hip crease", weights: { fai: 3, snap: 1 } },
        { id: "innerthigh", label: "The inner thigh", weights: { add: 3 } },
        { id: "buttock", label: "Deep in the buttock", weights: { piri: 3 } },
        { id: "ns", label: "Not sure" }
      ]},
      { id: "H2", text: "What clearly makes it worse?", options: [
        { id: "lying", label: "Lying on that side at night", weights: { gtps: 3 } },
        { id: "squat", label: "Deep squats, long sitting, or pivoting — a 'pinch' in the groin", weights: { fai: 2 } },
        { id: "kick", label: "Kicking, side lunges, or sprinting", weights: { add: 2 } },
        { id: "sitting", label: "Sitting on hard surfaces; sometimes tingling into the leg", weights: { piri: 2 } },
        { id: "stairs", label: "Stairs and single-leg standing", weights: { gtps: 1, fai: 1 } },
        { id: "ns", label: "Not sure" }
      ]},
      { id: "H3", text: "Any clicking, clunking, or snapping with movement?", options: [
        { id: "snap", label: "Yes — an audible or feelable snap/clunk", weights: { snap: 3, fai: 1 } },
        { id: "no", label: "No", weights: { snap: -2 } }
      ]},
      { id: "H4", text: "Does pain or tingling travel down the back of the leg?", options: [
        { id: "belowknee", label: "Yes — below the knee", special: "backref", weights: { piri: 1 } },
        { id: "thigh", label: "Only into the back of the thigh", weights: { piri: 2 } },
        { id: "no", label: "No" }
      ]},
      { id: "H5", text: "How does it react to squeezing the knees together (e.g., getting out of a car)?", options: [
        { id: "sqz", label: "That reproduces the inner-thigh/groin pain", weights: { add: 2, fai: 1 } },
        { id: "no", label: "No effect" }
      ]}
    ],
    conditions: [
      { id: "gtps", name: "Greater trochanteric pain syndrome", clin: "Gluteal tendinopathy / trochanteric bursitis",
        blurb: "Irritation of the gluteal tendons and bursa over the bony point of the outer hip — the classic 'can't lie on that side' hip. Common in runners and in women over 40.",
        noticed: ["Pain over the outer hip bone, tender to lie on", "Worse with stairs, hills, standing on one leg", "Aches after long walking or standing", "Sometimes spreads down the outer thigh"],
        homeCare: ["Avoid sustained hip 'hanging' postures (standing on one hip) and crossing legs", "A pillow between the knees when side-sleeping", "Gradual gluteal strengthening — tendons here respond to load, not rest"],
        seePhysioIf: ["Night pain on that side persists beyond 2 weeks", "Walking distance or stairs are limited", "You want a progressive loading program — the evidence-based treatment"] },
      { id: "fai", name: "Hip impingement / labral irritation", clin: "Femoroacetabular impingement (FAI) ± labral tear",
        blurb: "The hip's ball and socket can pinch its cartilage rim (labrum) in deep flexion and rotation, causing a sharp groin 'pinch' with squats, long sitting, and pivoting — common in active younger adults.",
        noticed: ["Deep groin pain or pinching, often shown with a C-shaped hand cup over the hip", "Worse with deep squats, long sitting, pivoting", "Occasional clicking or catching", "Stiffness bringing the knee toward the chest"],
        homeCare: ["Temporarily limit the deepest, most pinching ranges (very deep squats, prolonged low sitting)", "Raise seat height; avoid sitting cross-legged for long", "Strengthen the hip in comfortable ranges"],
        seePhysioIf: ["Groin pinching persists beyond 2–3 weeks or limits sport", "Catching or clicking with pain", "Conservative rehab has strong evidence — worth optimising before considering anything else"] },
      { id: "add", name: "Adductor strain", clin: "Groin / inner-thigh muscle strain",
        blurb: "A strain of the inner-thigh muscles that control side-to-side movement — the classic sports groin injury from sprinting, kicking, or a sudden change of direction.",
        noticed: ["Sudden inner-thigh/groin pain during sport", "Pain squeezing the knees together or side-lunging", "Tenderness along the inner thigh", "Bruising in larger strains"],
        homeCare: ["Relative rest from sprinting/kicking early on — keep walking as comfortable", "Early gentle range, then progressive adductor strengthening (e.g., ball squeezes)", "Return to sport gradually via straight-line running before cutting"],
        seePhysioIf: ["Pain limits walking beyond a few days", "You want a criteria-based return-to-sport plan — re-injury is common without one", "Groin pain keeps recurring each season"] },
      { id: "piri", name: "Deep gluteal / piriformis syndrome", clin: "Sciatic nerve irritation in the deep buttock",
        blurb: "The sciatic nerve passes under the deep buttock muscles; tightness or overload there can irritate it, causing deep buttock pain and sometimes tingling into the thigh — a pattern that mimics low-back sciatica.",
        noticed: ["Deep, hard-to-point-at buttock pain", "Worse with prolonged sitting, especially hard surfaces", "Sometimes tingling into the back of the thigh", "Tender deep in the buttock muscles"],
        homeCare: ["Break up long sitting; use a cushion on hard chairs", "Gentle figure-4 stretches and hip mobility", "Gradual gluteal strengthening"],
        seePhysioIf: ["Buttock pain persists beyond 2 weeks", "Any leg tingling — the low back must be ruled out as the true source", "Sitting tolerance is limiting work or driving"] },
      { id: "snap", name: "Snapping hip", clin: "Coxa saltans — tendon snapping over bone",
        blurb: "A tendon flicking over a bony point — outer hip (IT band over the trochanter) or front (hip flexor over the pelvis). Often painless; treated when it's painful or bothersome.",
        noticed: ["An audible or feelable snap/clunk with hip movement", "Front snapping when straightening from a flexed hip", "Outer snapping with walking or rotation", "Ache may develop around the snapping area with repetition"],
        homeCare: ["Reduce the specific repetitive movement that snaps for a while", "Hip flexor and IT-band-area mobility work", "Strengthen the deep hip stabilisers"],
        seePhysioIf: ["The snapping has become painful", "It's affecting dance, sport, or gait", "Painless clicking alone often needs only reassurance — but persistent painful snapping deserves assessment"] }
    ]
  },

  /* ══════════════ ANKLE / FOOT / SHIN ══════════════ */
  ankle: {
    name: "Ankle, foot & shin",
    redFlags: [
      { id: "arf-pop", why: "Possible Achilles tendon rupture, which is treated best when seen quickly", text: "A sudden 'pop' in the calf or heel and now you cannot push off or rise onto your toes", tier: "emergency" },
      { id: "arf-dvt", why: "Possible blood clot in the leg, which can travel to the lungs", text: "A calf that is very swollen, warm, red or tender — especially with breathlessness or chest pain", tier: "emergency" },
      { id: "arf-walk", sameDay: true, why: "Possible fracture: the Ottawa ankle rules say an X-ray is needed", text: "After an injury you cannot take four steps, or there is bony tenderness at the ankle knobs or midfoot", tier: "urgent" },
      { id: "arf-hot", sameDay: true, why: "Possible infection, which is more serious with diabetes", text: "A hot, red, swollen foot with fever — or any foot wound/swelling and you have diabetes", tier: "urgent" }
    ],
    context: [
      { id: "age", text: "Your age?", options: [
        { id: "u30", label: "Under 30" },
        { id: "30-50", label: "30 – 50" },
        { id: "o50", label: "Over 50", weights: { pf: 1, tibpost: 1 } }
      ]},
      { id: "onset", text: "How did it start?", options: [
        { id: "twist", label: "A twist or 'rolled' ankle", weights: { atfl: 3 } },
        { id: "training", label: "Gradually after increasing running/training or changing shoes", weights: { mtss: 2, ach: 1, pf: 1 } },
        { id: "standing", label: "Gradually with lots of standing or walking", weights: { pf: 1, tibpost: 1 } },
        { id: "gradual", label: "Gradually, no clear cause" },
        { id: "ns", label: "Not sure" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        // A fresh sprain is recent by definition; without this the sprain and
        // long-term instability scored identically for someone rolling their
        // ankle for years.
        { id: "d2w", label: "Less than 2 weeks", weights: { atfl: 2 } },
        { id: "d6w", label: "2 – 6 weeks", weights: { atfl: 1 } },
        { id: "d6m", label: "More than 6 weeks" },
        { id: "years", label: "Comes and goes over years" }
      ]}
    ],
    questions: [
      { id: "A1", text: "Where do you feel it most?", options: [
        { id: "heel", label: "The bottom of the heel", weights: { pf: 3 } },
        { id: "achilles", label: "The back of the heel / Achilles tendon", weights: { ach: 3 } },
        { id: "outer", label: "The outer ankle", weights: { atfl: 3 } },
        { id: "inner", label: "The inner ankle / arch", weights: { tibpost: 3 } },
        { id: "ball", label: "The ball of the foot, between the toes", weights: { neuroma: 3 } },
        { id: "shin", label: "The inner edge of the shin bone", weights: { mtss: 3 } }
      ]},
      { id: "A2", text: "Are the first steps in the morning the worst moment?", options: [
        { id: "yes", label: "Yes — sharp first steps, then it eases", weights: { pf: 2, ach: 1 } },
        { id: "no", label: "No, mornings are fine" }
      ]},
      { id: "A3", text: "Any tingling, burning, or a 'pebble under the foot' feeling?", options: [
        { id: "pebble", label: "Yes — pebble feeling or toe tingling, worse in tight shoes", weights: { neuroma: 2 } },
        { id: "soleburn", label: "Burning/tingling on the inner ankle or sole", special: "tarsal" },
        { id: "none", label: "No", weights: { neuroma: -2 } }
      ]},
      { id: "A4", text: "How does the ankle feel with activity?", options: [
        { id: "giveway", label: "Unstable — it 'gives way' or I fear re-rolling it", weights: { atfl: 2 } },
        { id: "duringrun", label: "Shin pain starts during running and now lingers after", weights: { mtss: 2 } },
        { id: "afterrun", label: "Achilles/heel is worst after activity and next morning", weights: { ach: 2, pf: 1 } },
        { id: "ns", label: "None of these" }
      ]},
      { id: "A5", text: "Have you noticed the arch flattening, or trouble doing a single-leg heel raise?", options: [
        { id: "yes", label: "Yes — flatter arch, 'tired' feet, or a hard/painful heel raise", weights: { tibpost: 2 } },
        { id: "no", label: "No", weights: { tibpost: -1 } }
      ]}
    ],
    conditions: [
      { id: "pf", name: "Plantar fasciitis", clin: "Plantar heel pain / fasciopathy",
        blurb: "Irritation of the strong tissue band supporting the arch, where it anchors into the heel — the classic sharp heel pain with the first steps of the morning.",
        noticed: ["Sharp bottom-of-heel pain on first morning steps", "Aches after long standing or walking, often worse after activity than during", "Stiffness and tenderness in the arch and heel"],
        homeCare: ["Calf and plantar-fascia stretches (toes pulled up) morning and evening", "Supportive footwear; avoid long barefoot walking on hard floors for now", "A frozen-bottle roll under the arch can soothe; build activity gradually"],
        seePhysioIf: ["Heel pain lasts more than 2 weeks", "Mornings or long standing remain painful", "You want a loading and footwear plan — most cases settle with the right progression"] },
      { id: "ach", name: "Achilles tendinopathy", clin: "Mid-portion or insertional Achilles tendinopathy",
        blurb: "The Achilles dislikes sudden jumps in training load. It responds with pain and morning stiffness at the back of the heel — and, importantly, it recovers through graded loading, not rest.",
        noticed: ["Pain and stiffness at the back of the heel, worst on first steps", "Worse after running, hills, or jumping", "Local tenderness or slight thickening of the tendon", "Tight calves"],
        homeCare: ["Trim (don't stop) the aggravating training; avoid sudden spikes in load", "Begin gentle calf raises within comfortable pain and progress gradually", "A small heel raise in the shoe can ease insertional cases short-term"],
        seePhysioIf: ["Heel/calf pain lasts more than 1–2 weeks or keeps flaring", "Stairs, walking, or running are limited", "You want a structured loading program — the proven treatment for tendinopathy"] },
      { id: "atfl", name: "Lateral ankle sprain (ATFL)", clin: "Anterior talofibular ligament injury",
        blurb: "The most commonly injured ligament in the body — stretched or torn when the ankle rolls inward. Heals well, but without rehab the ankle often stays 'wobbly' and re-sprains.",
        noticed: ["Outer ankle pain and swelling after a roll/twist", "Bruising in the first days", "A sense of instability or fear of re-rolling", "Repeated sprains if past ones weren't rehabbed"],
        homeCare: ["First days: relative rest, elevation, gentle movement; protect but don't immobilise completely", "Early weight-bearing as tolerated once fracture is ruled out", "Then balance work — single-leg standing — is the key to preventing re-sprains"],
        seePhysioIf: ["You can't walk comfortably within a few days", "The ankle still feels unstable after 2 weeks", "You've sprained the same ankle more than once — balance retraining prevents the cycle"] },
      { id: "tibpost", name: "Tibialis posterior dysfunction", clin: "Posterior tibial tendinopathy / adult-acquired flatfoot",
        blurb: "The tibialis posterior tendon holds up the arch from the inner ankle. When overloaded it aches behind the inner ankle bone and, over time, can let the arch flatten — early treatment matters.",
        noticed: ["Pain along the inner ankle/arch, behind the inner ankle bone", "A flatter arch or 'too many toes' look from behind", "Feet that tire quickly; difficulty or pain with single-leg heel raises"],
        homeCare: ["Supportive footwear; temporary arch support can offload the tendon", "Avoid pushing through long walks that flare it", "Begin gentle heel-raise strengthening within comfort"],
        seePhysioIf: ["Inner-ankle pain with any new arch flattening — early care shortens recovery", "Pain with stairs, hills, or longer standing", "A single-leg heel raise is painful or impossible"] },
      { id: "neuroma", name: "Morton's neuroma", clin: "Interdigital nerve thickening (usually 3rd–4th toes)",
        blurb: "A small nerve between the toes becomes irritated and thickened — classically felt as burning ball-of-foot pain and a 'pebble in the shoe' sensation, aggravated by tight footwear.",
        noticed: ["Burning/stabbing pain in the ball of the foot, often between 3rd–4th toes", "'Marble or pebble under the foot' feeling", "Toe tingling or numbness", "Worse in tight or high-heeled shoes; eases barefoot"],
        homeCare: ["Switch to shoes with a wide toe box and lower heel", "A small metatarsal pad (just behind the ball of the foot) often helps", "Reduce time in the provoking footwear"],
        seePhysioIf: ["Ball-of-foot pain or the pebble feeling persists after 1–2 weeks of footwear changes", "Toe tingling or numbness continues", "You want gait and footwear assessment before considering injections"] },
      { id: "mtss", name: "Shin splints (MTSS)", clin: "Medial tibial stress syndrome",
        blurb: "Overload of the inner shin-bone lining from a jump in running volume, harder surfaces, or worn shoes — pain starts during exercise and can become persistent if pushed through.",
        noticed: ["Aching along the inner edge of the shin bone", "Starts during running, eases with rest, returns with activity", "Tender to press along several centimetres of the inner shin"],
        homeCare: ["Cut running volume/intensity temporarily — swap in cycling or swimming", "Check shoe age and surface; increase training gradually (≤10%/week) when returning", "Calf strengthening and gradual reloading"],
        seePhysioIf: ["Shin pain persists despite 2 weeks of reduced load", "Pain is becoming sharper and more focal (needs a stress-fracture check)", "You want a running load and biomechanics review"] }
    ]
  }
}

// Special education cards used by the new regions
export const EXTRA_SPECIAL_CARDS = {
  medianhand: { title: "Tingling in the thumb-side fingers",
    body: "Tingling in the thumb, index or middle fingers usually points to the <strong>median nerve</strong> — most often compressed at the wrist rather than the elbow. Consider running the <strong>Wrist &amp; hand</strong> guide too." },
  ulnarhand: { title: "Tingling in the ring & little fingers",
    body: "Tingling in the ring and little fingers usually points to the <strong>ulnar nerve</strong>, which is most often irritated at the <strong>elbow</strong> (cubital tunnel). Consider running the <strong>Elbow</strong> guide too." },
  backref: { title: "Pain travelling below the knee",
    body: "Buttock pain that travels <strong>below the knee</strong> often comes from the <strong>low back</strong> rather than the hip itself. It's worth running the <strong>Low back &amp; pelvis</strong> guide as well." },
  tarsal: { title: "Burning on the inner ankle or sole",
    body: "Burning, tingling or numbness on the inner ankle or sole can involve a nerve (tarsal tunnel), especially with flat feet or after ankle swelling. Worth assessment if it persists — nerve symptoms respond best to early care." },
  shoulderSource: { title: "This may be coming from your shoulder",
    body: "Pain at the top of the shoulder or upper arm that is worse when you move the <strong>arm</strong> than when you move the neck usually comes from the <strong>shoulder</strong> itself: the rotator cuff, the AC joint at the top of the shoulder, or a stiffening shoulder joint. Consider running the <strong>Shoulder</strong> guide too. Your assessment will check both the neck and the shoulder." },
  chestFirst: { title: "If this is your first chest pain, see a doctor as well",
    body: "Pain on the front of the chest that is tender to press often comes from the <strong>chest wall</strong>: the joints where the ribs meet the breastbone. But if this is the <strong>first time</strong> you have had chest pain, a doctor should check your heart and lungs before it is treated as a chest-wall problem. If it comes with breathlessness, sweating, or spreads to your arm or jaw, call 911." },
  hipSource: { title: "This may be coming from your hip",
    body: "Groin pain that is worse when you <strong>move your hip</strong> usually comes from the <strong>hip joint</strong> or the muscles around it rather than from the back. Consider running the <strong>Hip</strong> guide too. Your assessment will check both." },
  lowbackSource: { title: "This may be coming from your low back",
    body: "Pain across the low back, or pain that changes a lot when you bend forward or arch back, usually comes from the <strong>low back</strong> rather than the sacroiliac joint. Consider running the <strong>Low back</strong> guide too. Your assessment will check both." },
  sijSource: { title: "Pain over the dimple at the back of the pelvis",
    body: "Pain you can point to over the dimple at the back of the pelvis often comes from the <strong>sacroiliac joint</strong>. If that is where it is worst, mark the <strong>back of your pelvis</strong> on the body map to answer the questions about it." },
  pelvicHealth: { title: "A pelvic health physiotherapist can help",
    body: "Pain deep in the pelvis or back passage, or pain with bowel movements or sex, often involves the <strong>pelvic floor muscles</strong>. A <strong>pelvic health physiotherapist</strong> assesses and treats these muscles, often with an internal examination if you are comfortable with it. It is worth mentioning to your doctor too, so bowel and gynaecological causes can be checked." },
  pilonidal: { title: "A pit or lump in the buttock crease: see your doctor",
    body: "A small pit or a tender lump at the top of the buttock crease can be a <strong>pilonidal sinus</strong>, a skin problem that can become infected. It is treated by a doctor rather than physiotherapy, so please have it checked, sooner if it becomes red, swollen or starts to leak." },
  neckSource: { title: "This may be coming from your neck",
    body: "Pain around the jaw that does not change when you chew, talk or open wide, especially with neck pain, is often felt in the jaw but comes from the <strong>upper neck</strong> or the neck muscles. Consider running the <strong>Neck</strong> guide too. Your assessment will check both." },
  migraine: { title: "This pattern can be migraine: worth seeing your doctor",
    body: "Throbbing headaches that switch sides, with feeling sick, sensitivity to light or noise, or zigzag lines beforehand, are typical of <strong>migraine</strong>. Migraine is treated first by a doctor, who can confirm it and discuss medicines that prevent or stop attacks. Physiotherapy can help alongside, especially when neck pain comes with it." },
  cluster: { title: "Headache behind one eye: please see your doctor",
    body: "Severe pain behind one eye, with a watery eye or runny nose on the same side, can be a <strong>cluster-type headache</strong>. It needs a doctor's assessment and specific treatment, so please book with your doctor." },
  medOveruse: { title: "Frequent painkillers can keep headaches going",
    body: "Taking painkillers for headaches on <strong>10 or more days a month</strong> (15 or more for simple ones like paracetamol or ibuprofen) can itself keep headaches going, called <strong>medication-overuse headache</strong>. Please review how often you take them with your doctor or pharmacist; do not stop suddenly without advice." },
  nerveDoctor: { title: "Constant numbness or a weak thumb should be checked by a doctor",
    body: "Numbness that no longer comes and goes, or a thumb that is getting weak or clumsy, can mean the nerve is being pressed on hard. A doctor should check this. Physiotherapy can help alongside or afterwards." },
  lumpDoctor: { title: "A hard or growing lump should be checked by a doctor",
    body: "Most lumps at the wrist are harmless fluid cysts (ganglions) that are soft and change size. A lump that is <strong>hard</strong> or <strong>keeps growing</strong> should be looked at by a doctor first." },
  handWeakness: { title: "Hand weakness should be checked by a doctor",
    body: "Not being able to make an “OK” sign with the thumb and index finger, or to lift the wrist or straighten the fingers, can mean a nerve in the forearm is being pressed on. A doctor should check this. Physiotherapy can help alongside or afterwards." },
  armDoctor: { title: "Please have this checked by a doctor",
    body: "A rash or blisters in a strip, severe pain followed by weakness, swollen glands in the armpit, or an arm or hand that goes <strong>pale, cold, swollen or bluish</strong> when you raise it or carry something, are signs a doctor should look at. They can point to shingles, an inflamed nerve, an infection, or pressure on the blood vessels. Physiotherapy can help afterwards if it is needed." },
  ribcage: { title: "Pain with deep breaths",
    body: "Sharp pain with a deep breath often involves the <strong>rib joints</strong> where they meet the spine — usually mechanical and treatable. But if breath pain comes with fever, breathlessness, or follows an accident, see a doctor promptly." }
}
