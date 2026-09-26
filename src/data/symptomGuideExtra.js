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
      { id: "P1", text: "If you point to the worst spot with one finger, where is it?",
        // Early, so a neighbouring area with more conditions (the hip) does not
        // crowd out the question that tells the sacroiliac joint apart.
        priority: () => true,
        options: [
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
     Reached from the body map's wrist band; the hand and fingers below it
     are their own region (hand). Its injury screen is in ./injuryScreen.js.
     Conditions: content/conditions/wrist-*.md. */
  wrist: {
    name: "Wrist",
    redFlags: [
      { id: "wrf-hot", tier: "emergency", group: "handhot", why: "Possible joint infection (septic arthritis)",
        text: "Is your wrist hot, red, and swollen, with a fever or feeling very unwell?" },
      { id: "wrf-bite", tier: "emergency", group: "handbite", why: "Possible tendon sheath or deep hand infection; needs urgent surgical review",
        text: "Did you have a cut, bite, or puncture on the wrist or hand, and is it now swollen, red, and very painful to move the fingers?" },
      { id: "wrf-stroke", tier: "emergency", group: "stroke", why: "Possible stroke",
        text: "Along with the hand symptoms, has one side of your face drooped, or have you had sudden weakness or numbness down one whole side, or trouble speaking?" },
      { id: "wrf-crps", tier: "urgent", group: "crps", why: "Possible complex regional pain syndrome (CRPS); early treatment matters",
        text: "Since a wrist injury, surgery, or cast, is your hand burning, swollen, shiny, changing colour or temperature, or so sensitive that even light touch hurts?" },
      { id: "wrf-gout", tier: "urgent", group: "handgout", why: "Possible gout or other crystal arthritis",
        text: "Did your wrist become suddenly hot, swollen, and very painful overnight, and have you had gout or “pseudogout” before?" },
      { id: "wrf-inflam", tier: "urgent", group: "handinflam", why: "Possible inflammatory arthritis (for example rheumatoid arthritis)",
        text: "Are both wrists or several finger joints swollen and stiff for more than an hour in the morning?" },
      { id: "wrf-numb", tier: "urgent", group: "handnumb", why: "Severe nerve compression (carpal tunnel) may need a specialist opinion",
        text: "Is the numbness in your fingers there all the time now, or is the muscle at the base of your thumb getting thinner?" },
      { id: "wrf-myelo", tier: "urgent", group: "myelo", why: "Possible pressure on the spinal cord in the neck",
        text: "Do both hands feel numb or clumsy (buttons, writing), or has your walking become unsteady?" },
      { id: "wrf-raynaud", tier: "urgent", group: "raynaud", why: "Possible circulation problem (Raynaud's, or damage to the artery in the palm)",
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
      { id: "W3", text: "Which of these do you notice in your hand? Tick all that apply.",
        askIf: ({ draw, all }) => !draw || draw.has("hand") || [].concat(all.painQuality || []).includes("tingling"),
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

  /* ══════════════ HAND & FINGERS ══════════════
     From Chandra's "Hand and fingers assessment" region document (reviewed
     by Chandra, 25 Sep 2026; the source text is content/regions/hand.md).
     Sources: Leggit & Meko 2006 (acute finger injuries, parts I and II),
     EULAR hand osteoarthritis 2018, ACR/EULAR rheumatoid arthritis criteria
     2010, Makkouk 2008 (trigger finger), Hyatt & Bagg 2017 (flexor
     tenosynovitis), JOSPT carpal tunnel CPG 2019, Harden 2010 (Budapest
     criteria), Travell & Simons 2019.
     Reached from the body map's hand band, below the wrist (WRIST_BOTTOM in
     Body3D.jsx). Its injury screen is in ./injuryScreen.js. Conditions:
     content/conditions/hand-*.md. */
  hand: {
    name: "Hand & fingers",
    redFlags: [
      { id: "hnd-bite", tier: "emergency", group: "handbite", why: "Possible tendon sheath or joint infection; needs urgent surgical review",
        text: "Did you have a cut, bite, or puncture on your hand or finger (including hitting someone's teeth), and is it now swollen, red, and very painful to straighten the finger?" },
      { id: "hnd-inject", tier: "emergency", why: "High-pressure injection injury: serious damage hides under a small wound",
        text: "Was paint, grease, oil, or fluid injected into your hand under pressure (spray gun, grease gun), even if the wound looks tiny?" },
      { id: "hnd-hot", tier: "emergency", group: "handhot", why: "Possible joint infection (septic arthritis)",
        text: "Is a finger or thumb hot, red, and swollen, with a fever or feeling very unwell?" },
      { id: "hnd-stroke", tier: "emergency", group: "stroke", why: "Possible stroke",
        text: "Along with the hand symptoms, has one side of your face drooped, or have you had sudden weakness or numbness down one whole side, or trouble speaking?" },
      { id: "hnd-felon", sameDay: true, tier: "urgent", why: "Possible fingertip or nail-fold infection (felon or paronychia); same-day review",
        text: "Is there a tense, throbbing, swollen fingertip, or pus around the nail?" },
      { id: "hnd-gout", tier: "urgent", group: "handgout", why: "Possible gout or other crystal arthritis",
        text: "Did a finger joint become suddenly hot, swollen, and very painful overnight, and have you had gout or “pseudogout” before?" },
      { id: "hnd-inflam", tier: "urgent", group: "handinflam", why: "Possible inflammatory arthritis (rheumatoid or psoriatic)",
        text: "Are the knuckles in both hands swollen and stiff for more than an hour in the morning, or is a whole finger swollen like a sausage (especially with psoriasis)?" },
      { id: "hnd-raynaud", tier: "urgent", group: "raynaud", why: "Possible Raynaud's or another circulation problem",
        text: "Do your fingers go white, then blue, in the cold, or is there a sore or ulcer on a fingertip?" },
      { id: "hnd-crps", tier: "urgent", group: "crps", why: "Possible complex regional pain syndrome (CRPS)",
        text: "Since a hand injury, surgery, or cast, is your hand burning, swollen, shiny, changing colour or temperature, or so sensitive that light touch hurts?" },
      { id: "hnd-numb", tier: "urgent", group: "handnumb", why: "Severe nerve compression needs a specialist opinion",
        text: "Is the numbness in your fingers there all the time, or is the muscle at the base of your thumb or between your thumb and index finger getting thinner?" },
      { id: "hnd-myelo", tier: "urgent", group: "myelo", why: "Possible pressure on the spinal cord in the neck",
        text: "Do both hands feel numb or clumsy (buttons, writing), or has your walking become unsteady?" },
      { id: "hnd-lump", tier: "urgent", why: "A growing lump or nail streak needs medical review",
        text: "Is there a hard lump that is growing, or a new dark streak under a nail?" }
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
        { id: "grip", label: "After a lot of gripping, pinching, typing, or phone use" },
        { id: "injury", label: "A finger was jammed, bent back, or caught" },
        { id: "crush", label: "It was crushed or cut" },
        { id: "baby", label: "During pregnancy, or since having a baby" },
        { id: "joints", label: "Other joints in my body are swollen or stiff too", special: "handDoctor" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d6w", label: "2 to 6 weeks" },
        { id: "d3m", label: "6 weeks to 3 months" },
        { id: "o3m", label: "More than 3 months" }
      ]}
    ],
    questions: [
      { id: "H1", text: "Where is the pain mainly?", options: [
        { id: "thumbbase", label: "Base of the thumb, where it meets the wrist" },
        { id: "knuckles", label: "Knuckles at the base of the fingers" },
        { id: "fingerjoints", label: "Middle or end joints of the fingers" },
        { id: "palm", label: "Palm, at the base of a finger or thumb" },
        { id: "whole", label: "A whole finger, or the fingertips" }
      ]},
      { id: "H2", text: "Which of these apply? Tick all that apply.", options: [
        { id: "trigger", label: "A finger or thumb clicks, catches, or locks bent" },
        { id: "nodule", label: "A tender lump in the palm at the base of that finger" },
        { id: "dupuytren", label: "A finger is slowly bending into my palm, and I cannot lay my hand flat" },
        { id: "nodes", label: "Hard bony bumps on the finger joints" },
        { id: "none", label: "None of these" }
      ]},
      { id: "H3", text: "Which of these bring it on? Tick all that apply.", options: [
        { id: "pinch", label: "Pinching (turning a key, opening a jar, doing up buttons)" },
        { id: "grip", label: "Gripping firmly" },
        { id: "thumbs", label: "Typing, texting, or gaming with the thumbs" },
        { id: "push", label: "Pushing up with my hand (getting out of a chair)" },
        { id: "cold", label: "Cold weather" }
      ]},
      { id: "H4", text: "Which of these do you notice in your hand? Tick all that apply.",
        askIf: ({ draw, all }) => !draw || [].concat(all.painQuality || []).includes("tingling"),
        priority: () => true,
        options: [
          { id: "thumb", label: "Tingling or numbness in the thumb, index, and middle fingers" },
          { id: "little", label: "Tingling or numbness in the little and ring fingers", special: "ulnarhand" },
          { id: "digital", label: "Numbness down one side of one finger only" },
          { id: "both", label: "Tingling in the fingertips of both hands", special: "handDoctor" },
          { id: "none", label: "None of these" }
        ]},
      { id: "H5", text: "When does the tingling come on? Tick all that apply.",
        askIf: ({ ra }) => [].concat(ra.H4 || []).includes("thumb"),
        priority: () => true,
        options: [
          { id: "night", label: "It wakes me at night, and shaking my hand helps", special: "medianhand" },
          { id: "use", label: "When I use my hand, or hold a phone" },
          { id: "constant", label: "It is there all the time", special: "nerveDoctor" },
          { id: "back", label: "The back of my hand is numb too" }
        ]},
      { id: "H6", text: "What does any swelling look like?", options: [
        { id: "sausage", label: "One whole finger swollen like a sausage", special: "handDoctor" },
        { id: "both", label: "Several knuckles swollen in both hands", special: "handDoctor" },
        { id: "hot", label: "One joint hot and puffy", special: "handDoctor" },
        { id: "bony", label: "Hard, bony swelling of the finger joints" },
        { id: "none", label: "No swelling" }
      ]},
      { id: "H7", text: "Which of these do you notice? Tick all that apply.",
        askIf: ({ ra }) => ra.duration === "d3m" || ra.duration === "o3m" || [].concat(ra.H6 || []).some((o) => o !== "none"),
        options: [
          { id: "raynaud", label: "Fingers go white, then blue, then red in the cold", special: "handDoctor" },
          { id: "colour", label: "Since an injury, my hand is a different colour or temperature from the other one", special: "handDoctor" },
          { id: "nails", label: "Pitting or ridges in my nails, or psoriasis", special: "handDoctor" },
          { id: "stiff", label: "Stiff for more than 30 minutes in the morning", special: "handDoctor" },
          { id: "none", label: "None of these" }
        ]},
      { id: "H8", text: "Which hurts more: moving your neck, moving your wrist, or using your fingers?",
        askIf: ({ draw, all }) => !draw || ["neck", "ctj", "forearm", "wrist"].some((t) => draw.has(t)) ||
          [].concat(all.painQuality || []).some((q) => q === "tingling" || q === "burning"),
        options: [
          { id: "neck", label: "Moving my neck", special: "neckSource" },
          { id: "wrist", label: "Moving my wrist" },
          { id: "fingers", label: "Using my fingers" },
          { id: "none", label: "None of these bring it on" }
        ]}
    ],
    conditions: []
  },

  /* ══════════════ HIP & GROIN ══════════════
     From Chandra's "Hip assessment" region document (reviewed by Chandra,
     25 Sep 2026; the source text is content/regions/hip.md). Sources: JOSPT
     hip osteoarthritis CPG 2017, JOSPT nonarthritic hip pain CPG 2023,
     Warwick Agreement 2016 (FAI), Grimaldi 2015 (gluteal tendinopathy), Doha
     agreement 2015 (groin pain), Lesher 2008 (hip referral), Peck 2017
     (SUFE), IFOMPT red flags framework 2020, Travell & Simons 2019.
     Reached from the body map's hip band. Question ids are G1 to G8 (the
     hand has H). Its injury screen is in ./injuryScreen.js. Conditions:
     content/conditions/hip-*.md. */
  hip: {
    name: "Hip & groin",
    redFlags: [
      { id: "hpf-aaa", tier: "emergency", why: "Possible leaking abdominal aortic aneurysm (higher risk over 60 and in smokers)",
        text: "Do you have a sudden, severe pain in your back, tummy, or groin, with a pulsing feeling in your tummy, or feeling faint or sweaty?" },
      { id: "hpf-septic", tier: "emergency", why: "Possible joint infection (septic arthritis)",
        text: "Is your hip very painful with a fever, and can you not put weight on the leg (or is a child suddenly refusing to walk and feverish)?" },
      { id: "hpf-ectopic", tier: "emergency", why: "Possible ectopic pregnancy",
        text: "Could you be pregnant, and do you have sudden one-sided pain low in your tummy or groin, bleeding, or feeling faint?" },
      { id: "hpf-torsion", tier: "emergency", why: "Possible testicular torsion",
        text: "Do you have sudden, severe pain in a testicle?" },
      { id: "hpf-strangulated", tier: "emergency", why: "Possible trapped (strangulated) hernia",
        text: "Is there a lump in your groin that is hard, very painful, will not go back in, and are you vomiting?" },
      { id: "hpf-cauda", tier: "emergency", group: "cauda", why: "Possible cauda equina syndrome",
        text: "Do you have new numbness between your legs or around your bottom, or new trouble passing urine or controlling your bowels?" },
      { id: "hpf-sufe", tier: "urgent", group: "sufe", why: "Possible slipped growth plate at the hip (SUFE); hip problems in children are often felt at the knee",
        text: "Is a child aged about 9 to 16 limping, with pain in the hip, groin, thigh, or knee?" },
      { id: "hpf-stress", tier: "urgent", why: "Possible stress fracture of the hip (femoral neck); needs imaging before more running",
        text: "Do you run or train hard, and do you have a deep groin ache that is worse with running or hopping, or aches at night?" },
      { id: "hpf-avn", tier: "urgent", why: "Possible loss of blood supply to the hip bone (avascular necrosis)",
        text: "Do you take long-term steroid tablets, drink heavily, or have sickle cell disease, and have a deep groin ache?" },
      { id: "hpf-dvt", sameDay: true, tier: "urgent", group: "legclot", why: "Possible blood clot (DVT); emergency if you are also short of breath",
        text: "Is your leg swollen, warm, or tender in the calf or thigh, especially after surgery, a long journey, or time in bed?" },
      { id: "hpf-hernia", tier: "urgent", why: "Possible hernia",
        text: "Is there a soft lump in your groin that appears when you cough, strain, or stand?" },
      { id: "hpf-kidney", tier: "urgent", why: "Possible kidney stone or infection",
        text: "Does the pain come in waves from your side to your groin, or come with burning when you pass urine or blood in your urine?" },
      { id: "hpf-pelvic", tier: "urgent", why: "Pelvic organ problems can be felt in the groin and inner thigh",
        text: "Is the groin pain linked to your periods, or do you have unusual vaginal bleeding or discharge?" },
      { id: "hpf-cancer", tier: "urgent", group: "cancer", why: "Cancer can spread to the pelvis and hip",
        text: "Have you ever had cancer, or do you have deep pain at night that does not change with position, with weight loss?" }
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
        { id: "sport", label: "After increasing running or sport" },
        { id: "walk", label: "After a long walk, standing, or lying on my side" },
        { id: "twist", label: "A sudden twist, kick, or change of direction" },
        { id: "fall", label: "After a fall" },
        { id: "pregnancy", label: "During pregnancy, or since having a baby" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d6w", label: "2 to 6 weeks" },
        { id: "d3m", label: "6 weeks to 3 months" },
        { id: "o3m", label: "More than 3 months" }
      ]}
    ],
    questions: [
      { id: "G1", text: "Where is the pain mainly?", options: [
        { id: "groin", label: "Groin, or the front of the hip" },
        { id: "outer", label: "Outer hip, over the bony point at the side" },
        { id: "buttock", label: "Buttock" },
        { id: "inner", label: "Inner thigh, close to the groin" },
        { id: "patch", label: "Burning or numb patch on the front and outer thigh" }
      ]},
      { id: "G2", text: "Which of these bring it on? Tick all that apply.", options: [
        { id: "lying", label: "Lying on that side at night" },
        { id: "socks", label: "Putting on socks and shoes, or getting in and out of a car" },
        { id: "lowchair", label: "Sitting in a low chair, or deep squatting" },
        { id: "stairs", label: "Climbing stairs, or standing on that leg" },
        { id: "walking", label: "Walking a distance, easing when I sit or bend forward", special: "lowbackHip" }
      ]},
      { id: "G3", text: "Which of these apply? Tick all that apply.", options: [
        { id: "amstiff", label: "Stiff in the morning for less than an hour, then it eases" },
        { id: "sitstiff", label: "Stiff after sitting, then eases after a few steps" },
        { id: "click", label: "Clicking, catching, or locking deep in the groin" },
        { id: "giveway", label: "The hip gives way" },
        { id: "none", label: "None of these" }
      ]},
      { id: "G4", text: "If you show someone where it hurts, what does your hand do?", options: [
        { id: "csign", label: "Grips the side of my hip in a “C” shape, thumb at the back and fingers in the groin" },
        { id: "spot", label: "Points to one spot on the outer hip" },
        { id: "groin", label: "Points into the groin" },
        { id: "back", label: "Points to my buttock or low back" }
      ]},
      { id: "G5", text: "If it came on with sport (kicking, sprinting, changing direction): which apply? Tick all that apply.",
        askIf: ({ ra }) => ra.onset === "sport" || ra.onset === "twist",
        priority: () => true,
        options: [
          { id: "adductor", label: "Pain where the inner thigh muscle meets the pubic bone" },
          { id: "inguinal", label: "Pain just above the groin crease, worse with coughing or sit-ups" },
          { id: "iliopsoas", label: "Pain at the front of the hip when lifting my knee" },
          { id: "joint", label: "Deep pain in the hip joint with twisting" },
          { id: "pubic", label: "Pain in the middle, over the pubic bone" }
        ]},
      { id: "G6", text: "Which of these do you notice in the leg? Tick all that apply.",
        askIf: ({ draw, all }) => !draw || ["knee", "ankle"].some((t) => draw.has(t)) ||
          [].concat(all.painQuality || []).some((q) => q === "tingling" || q === "burning"),
        options: [
          { id: "belowknee", label: "Pain below the knee", special: "backref" },
          { id: "pins", label: "Pins and needles or numbness in the leg or foot", special: "lowbackHip" },
          { id: "patch", label: "A burning or numb patch on the outer thigh, with no weakness" },
          { id: "knee", label: "Knee pain, with the hip hardly hurting" },
          { id: "none", label: "None of these" }
        ]},
      { id: "G7", text: "Which hurts more: moving your low back, or moving your hip (bending it up, turning the leg in and out)?",
        askIf: ({ draw, ra }) => !draw || ["lowerback", "sij"].some((t) => draw.has(t)) ||
          [].concat(ra.G1 || []).includes("buttock") || [].concat(ra.G6 || []).some((o) => o !== "none"),
        // Early when the low back or buttock is drawn too: the back look-alike.
        priority: ({ draw }) => !!draw && ["lowerback", "sij"].some((t) => draw.has(t)),
        options: [
          { id: "back", label: "Moving my low back", special: "lowbackHip" },
          { id: "hip", label: "Moving my hip", special: "hipSource" },
          { id: "both", label: "Both about the same" },
          { id: "neither", label: "Neither brings it on" }
        ]},
      { id: "G8", text: "Does any of these come with the groin pain? Tick all that apply.",
        askIf: ({ ra }) => [].concat(ra.G1 || []).some((o) => o === "groin" || o === "inner"),
        options: [
          { id: "periods", label: "Pain linked to my periods", special: "groinDoctor" },
          { id: "urine", label: "Burning when I pass urine, or blood in my urine", special: "groinDoctor" },
          { id: "lump", label: "A lump in the groin when I cough or stand", special: "groinDoctor" },
          { id: "testicle", label: "Testicle pain", special: "groinDoctor" },
          { id: "none", label: "None of these" }
        ]}
    ],
    conditions: []
  },

  /* ══════════════ THIGH ══════════════
     From Chandra's "Thigh assessment" region document (reviewed by Chandra,
     25 Sep 2026; the source text is content/regions/thigh.md). Sources:
     JOSPT hamstring strain CPG 2022, Munich consensus 2013, British athletics
     muscle injury classification 2014, Askling 2007, Kary 2010 (quadriceps
     strains and contusions), Harney & Patijn 2007 (meralgia), Lesher 2008,
     Murphy 2009, Travell & Simons 2019.
     Reached from the body map's thigh band, between the hip (front) or the
     buttock (back) and the knee (THIGH_TOP_FRONT, THIGH_TOP_BACK and
     KNEE_TOP in Body3D.jsx). Question ids are R1 to R8. Its injury screen is
     in ./injuryScreen.js. Conditions: content/conditions/thigh-*.md. */
  thigh: {
    name: "Thigh",
    redFlags: [
      { id: "tgf-pe", tier: "emergency", group: "legclotlung", why: "Possible blood clot that has travelled to the lung",
        text: "Is your thigh or calf swollen, warm, or tender, and are you also short of breath, or have chest pain or are coughing blood?" },
      { id: "tgf-compartment", tier: "emergency", why: "Possible compartment syndrome of the thigh",
        text: "Is your thigh pain getting worse and worse, with the thigh tense and swollen, especially after a heavy knock or crush?" },
      { id: "tgf-rhabdo", tier: "emergency", why: "Possible muscle breakdown (rhabdomyolysis), which can damage the kidneys",
        text: "After very hard exercise, is your thigh hugely swollen and very painful, and is your urine dark like cola?" },
      { id: "tgf-necfasc", tier: "emergency", group: "legnecfasc", why: "Possible severe skin and tissue infection",
        text: "Is there a hot, red area on your thigh that is spreading fast, with pain far worse than it looks, or feeling very unwell?" },
      { id: "tgf-cauda", tier: "emergency", group: "cauda", why: "Possible cauda equina syndrome",
        text: "Do you have new numbness between your legs or around your bottom, or new trouble passing urine or controlling your bowels?" },
      { id: "tgf-dvt", sameDay: true, tier: "urgent", group: "legclot", why: "Possible blood clot (DVT); same-day review",
        text: "Is your thigh or calf swollen, warm, or tender, especially after surgery, a long journey, time in bed, a cast, or starting the pill?" },
      { id: "tgf-cellulitis", sameDay: true, tier: "urgent", group: "legcellulitis", why: "Possible skin infection (cellulitis); same-day review",
        text: "Is there spreading redness, a red streak up the leg, or a hot, swollen area, with a fever?" },
      { id: "tgf-stress", tier: "urgent", why: "Possible stress fracture of the thigh bone; needs imaging before more running",
        text: "Do you run or train hard, and do you have a deep, aching thigh pain that is worse with hopping, or aches at night?" },
      { id: "tgf-tumour", tier: "urgent", why: "Bone or soft-tissue lumps in the thigh need imaging to rule out a tumour",
        text: "Are you under 25 with a deep thigh ache that wakes you at night, or a lump or swelling in the thigh that is growing?" },
      { id: "tgf-sufe", tier: "urgent", group: "sufe", why: "Possible slipped growth plate at the hip (SUFE), often felt in the thigh or knee",
        text: "Is a child aged about 9 to 16 limping, with pain in the thigh or knee?" },
      { id: "tgf-claudication", tier: "urgent", group: "claudication", why: "Possible narrowed leg arteries (vascular claudication)",
        text: "Do you get a cramping pain in the thigh or buttock when walking that eases within minutes of standing still, and do you smoke or have diabetes?" },
      { id: "tgf-femoral", tier: "urgent", why: "Nerve weakness (femoral nerve or L3–L4) needs medical review",
        text: "Has your thigh muscle become weak or thin, or does your knee give way, with no injury?" },
      { id: "tgf-cancer", tier: "urgent", group: "cancer", why: "Cancer can spread to the thigh bone",
        text: "Have you ever had cancer, or do you have deep thigh pain at night that does not change with position, with weight loss?" }
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
        { id: "sprint", label: "A sudden sharp pain while sprinting or kicking" },
        { id: "stretch", label: "A sudden pain while stretching, dancing, or doing the splits" },
        { id: "knock", label: "After a hard knock to the thigh" },
        { id: "running", label: "After increasing running or training" },
        { id: "workout", label: "After a new or harder workout" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d6w", label: "2 to 6 weeks" },
        { id: "d3m", label: "6 weeks to 3 months" },
        { id: "o3m", label: "More than 3 months" }
      ]}
    ],
    questions: [
      { id: "R1", text: "Where is the pain mainly?", options: [
        { id: "front", label: "Front of the thigh" },
        { id: "back", label: "Back of the thigh" },
        { id: "inner", label: "Inner thigh" },
        { id: "outer", label: "Outer thigh" },
        { id: "patch", label: "Burning or numb patch on the front and outer thigh" }
      ]},
      { id: "R2", text: "Which of these bring it on? Tick all that apply.", options: [
        { id: "sprint", label: "Sprinting, kicking, or jumping" },
        { id: "stretch", label: "Stretching, or bending forward with straight legs" },
        { id: "sitting", label: "Sitting for a long time" },
        { id: "walking", label: "Walking a distance, easing when I sit or bend forward", special: "lowbackHip" },
        { id: "standing", label: "Standing or walking, easing when I sit, with tight belts or trousers making it worse" }
      ]},
      { id: "R3", text: "About the muscle: which apply? Tick all that apply.", options: [
        { id: "doms", label: "Sore and stiff 1 to 3 days after exercise, then easing" },
        { id: "sharp", label: "A sudden sharp pain during activity, with bruising after" },
        { id: "knot", label: "A tender spot in the muscle that sends pain elsewhere when pressed" },
        { id: "bruise", label: "A deep bruise after a knock" },
        { id: "none", label: "None of these" }
      ]},
      { id: "R4", text: "Since the injury, how far can you bend your knee (lying on your front, heel towards your bottom)?",
        askIf: ({ ra }) => ra.onset === "knock",
        priority: () => true,
        options: [
          { id: "full", label: "Fully, or nearly fully" },
          { id: "half", label: "More than halfway" },
          { id: "less", label: "Less than halfway" },
          { id: "nottried", label: "I have not tried" }
        ]},
      { id: "R5", text: "Which of these do you notice? Tick all that apply.",
        askIf: ({ draw, all }) => !draw || ["knee", "ankle", "hip", "lowerback", "sij"].some((t) => draw.has(t)) ||
          [].concat(all.painQuality || []).some((q) => q === "tingling" || q === "burning"),
        // Early with nerve-type pain (or when the drawing is unknown).
        priority: ({ draw, all }) => !draw || [].concat(all.painQuality || []).some((q) => q === "tingling" || q === "burning"),
        options: [
          { id: "pins", label: "Pins and needles or numbness in the leg or foot", special: "lowbackHip" },
          { id: "belowknee", label: "Pain goes below the knee", special: "backref" },
          { id: "patch", label: "A burning or numb patch on the outer thigh, with no weakness" },
          { id: "weak", label: "Weakness: the knee gives way on stairs", special: "thighDoctor" },
          { id: "none", label: "None of these" }
        ]},
      { id: "R6", text: "Which hurts more: moving your low back, moving your hip, or using the thigh muscle?",
        askIf: ({ draw, ra }) => !draw || ["lowerback", "sij", "hip"].some((t) => draw.has(t)) ||
          [].concat(ra.R5 || []).some((o) => o !== "none"),
        // Early when the low back or buttock is drawn too: the back look-alike.
        priority: ({ draw }) => !!draw && ["lowerback", "sij"].some((t) => draw.has(t)),
        options: [
          { id: "back", label: "Moving my low back", special: "lowbackHip" },
          { id: "hip", label: "Moving my hip", special: "hipSource" },
          { id: "muscle", label: "Using the thigh muscle (running, kicking, stretching)" },
          { id: "none", label: "None of these bring it on" }
        ]},
      { id: "R7", text: "When walking, what happens?",
        askIf: ({ ra }) => [].concat(ra.R2 || []).includes("walking") || ra.age === "50-64" || ra.age === "o64",
        options: [
          { id: "cramp", label: "A cramp in the thigh or buttock that eases within minutes of standing still", special: "thighDoctor" },
          { id: "sitease", label: "Leg pain that eases when I sit or bend forward", special: "lowbackHip" },
          { id: "nochange", label: "No change with walking" }
        ]},
      { id: "R8", text: "Is there any swelling or lump?", options: [
        { id: "bruise", label: "Swelling and bruising after an injury" },
        { id: "hardlump", label: "A hard lump in the muscle weeks after a knock", special: "thighDoctor" },
        { id: "growing", label: "A lump that is growing, with no injury", special: "thighDoctor" },
        { id: "whole", label: "The whole thigh or calf is swollen", special: "thighDoctor" },
        { id: "none", label: "No swelling or lump" }
      ]}
    ],
    conditions: []
  },

  /* ══════════════ LOWER LEG (CALF & SHIN) ══════════════
     From Chandra's "Lower leg assessment" region document (reviewed by
     Chandra, 25 Sep 2026; the source text is content/regions/leg.md).
     Sources: Winters 2018 (MTSS), Warden 2014 (bone stress injuries),
     Pedowitz 1990 (chronic compartment syndrome), JOSPT midportion Achilles
     tendinopathy CPG 2024, Maffulli 1998 (Achilles rupture), Wells 2003
     (DVT), ESC peripheral arterial disease guidelines 2017, Murphy 2009,
     Travell & Simons 2019.
     Reached from the body map's lower leg band, between the knee and the
     ankle (KNEE_BOTTOM and ANKLE_TOP in Body3D.jsx; the zone type is
     "lowerleg"). Question ids are V1 to V8. Its injury screen is in
     ./injuryScreen.js. Conditions: content/conditions/leg-*.md. */
  leg: {
    name: "Lower leg (calf & shin)",
    redFlags: [
      { id: "lgf-pe", tier: "emergency", group: "legclotlung", why: "Possible blood clot that has travelled to the lung",
        text: "Is your calf swollen, warm, or tender, and are you also short of breath, or have chest pain or are coughing blood?" },
      { id: "lgf-compartment", tier: "emergency", why: "Possible acute compartment syndrome",
        text: "Is your lower leg pain getting worse and worse, with the leg tight and swollen and much worse when your toes are moved, especially after an injury or under a cast?" },
      { id: "lgf-ischaemia", tier: "emergency", group: "limbischaemia", why: "Possible blocked artery (acute limb ischaemia)",
        text: "Has your foot or lower leg suddenly become cold, pale, numb, or painful at rest?" },
      { id: "lgf-necfasc", tier: "emergency", group: "legnecfasc", why: "Possible severe skin and tissue infection",
        text: "Is there a hot, red area on your leg that is spreading fast, with pain far worse than it looks, or feeling very unwell?" },
      { id: "lgf-cauda", tier: "emergency", group: "cauda", why: "Possible cauda equina syndrome",
        text: "Do you have new numbness between your legs or around your bottom, or new trouble passing urine or controlling your bowels?" },
      { id: "lgf-dvt", sameDay: true, tier: "urgent", group: "legclot", why: "Possible blood clot (DVT); same-day review. A burst cyst from the back of the knee can look the same",
        text: "Is your calf swollen, warm, or tender, especially after surgery, a long journey, time in bed, a cast, pregnancy, or starting the pill?" },
      { id: "lgf-cellulitis", sameDay: true, tier: "urgent", group: "legcellulitis", why: "Possible skin infection (cellulitis) or circulation problem; same-day review",
        text: "Is there spreading redness, a red streak up the leg, or a hot, swollen area with a fever, or a leg ulcer that is not healing?" },
      { id: "lgf-claudication", tier: "urgent", group: "claudication", why: "Possible narrowed leg arteries (vascular claudication)",
        text: "Do you get a cramping calf pain when walking that eases within minutes of standing still, and do you smoke, have diabetes, or are over 50?" },
      { id: "lgf-stress", tier: "urgent", why: "Possible tibial stress fracture; needs imaging before more running",
        text: "Do you run or train hard, and is there a sore spot on the shin bone that you can point to with one finger, or pain when hopping or at night?" },
      { id: "lgf-footdrop", tier: "urgent", group: "footdrop", why: "Foot drop (peroneal nerve or L5) needs medical review",
        text: "Is your foot slapping down or your toes catching when you walk?" },
      { id: "lgf-neuropathy", tier: "urgent", group: "neuropathy", why: "Possible peripheral neuropathy; needs medical review and foot checks",
        text: "Do both feet feel numb, burning, or tingling, like wearing socks, especially with diabetes?" },
      { id: "lgf-tumour", tier: "urgent", why: "Bone lumps need imaging to rule out a tumour",
        text: "Are you under 25 with a deep shin ache that wakes you at night, or a lump on the shin that is growing?" },
      { id: "lgf-cancer", tier: "urgent", group: "cancer", why: "Cancer can spread to the leg bones",
        text: "Have you ever had cancer, or do you have deep leg pain at night that does not change with position, with weight loss?" }
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
        { id: "running", label: "After increasing running, jumping, or marching" },
        { id: "exercise", label: "It comes on during exercise and eases when I stop" },
        { id: "pushoff", label: "A sudden pain in the calf while pushing off" },
        { id: "kick", label: "After a kick, blow, or fall" },
        { id: "walking", label: "It comes on with walking and eases when I stand still or sit" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d6w", label: "2 to 6 weeks" },
        { id: "d3m", label: "6 weeks to 3 months" },
        { id: "o3m", label: "More than 3 months" }
      ]}
    ],
    questions: [
      { id: "V1", text: "Where is the pain mainly?",
        // Early, so the knee (with many more conditions) does not crowd out
        // the question that tells shin, calf and Achilles apart.
        priority: () => true,
        options: [
        { id: "medial", label: "Along the inner edge of the shin bone" },
        { id: "anterior", label: "Front of the shin, on the outer side of the bone" },
        { id: "lateral", label: "Outer side of the lower leg" },
        { id: "calf", label: "Calf" },
        { id: "achilles", label: "Back of the lower leg, just above the heel (Achilles)" }
      ]},
      { id: "V2", text: "How does the pain behave with running or exercise?",
        // Early when it started with exercise or running: it separates shin
        // splints, a stress fracture and compartment syndrome.
        priority: ({ ra }) => ra.onset === "exercise" || ra.onset === "running",
        options: [
        { id: "warmup", label: "Sore at the start, eases as I warm up, worse after" },
        { id: "builds", label: "Builds up during exercise at the same point, and eases within minutes of stopping" },
        { id: "hop", label: "Gets worse the more I run, and hurts to hop", special: "boneStress" },
        { id: "morning", label: "Sore the morning after, and stiff at first" },
        { id: "notex", label: "It is not linked to exercise" }
      ]},
      { id: "V3", text: "About the tender area on the shin: which is closest?",
        askIf: ({ ra }) => [].concat(ra.V1 || []).some((o) => o === "medial" || o === "anterior"),
        priority: () => true,
        options: [
          { id: "long", label: "A long stretch (more than 5 cm) along the inner edge of the bone" },
          { id: "spot", label: "One spot I can cover with a fingertip", special: "boneStress" },
          { id: "muscle", label: "Not on the bone, in the muscle beside it" },
          { id: "none", label: "I have no tender spot on the shin" }
        ]},
      { id: "V4", text: "During exercise, which of these happen? Tick all that apply.",
        askIf: ({ ra }) => [].concat(ra.V2 || []).includes("builds"),
        priority: () => true,
        options: [
          { id: "tight", label: "The leg goes tight or hard" },
          { id: "numb", label: "The foot goes numb, tingly, or weak" },
          { id: "slap", label: "The foot slaps down or the toes catch", special: "footDrop" },
          { id: "eases", label: "It eases within 10 to 30 minutes of stopping" },
          { id: "none", label: "None of these" }
        ]},
      { id: "V5", text: "When walking, what happens?",
        askIf: ({ ra }) => ra.onset === "walking" || ra.age === "50-64" || ra.age === "o64",
        options: [
          { id: "cramp", label: "Calf cramp that eases within minutes of standing still", special: "calfDoctor" },
          { id: "sitease", label: "Leg pain that eases only when I sit or bend forward", special: "lowbackHip" },
          { id: "rest", label: "Pain at rest or at night that eases with the leg hanging down", special: "calfDoctor" },
          { id: "nochange", label: "No change with walking" }
        ]},
      { id: "V6", text: "Which of these do you notice in the leg or foot? Tick all that apply.",
        askIf: ({ draw, all }) => !draw || ["thigh", "hip", "lowerback", "sij", "ankle"].some((t) => draw.has(t)) ||
          [].concat(all.painQuality || []).some((q) => q === "tingling" || q === "burning"),
        // Early with nerve-type pain (or when the drawing is unknown).
        priority: ({ draw, all }) => !draw || [].concat(all.painQuality || []).some((q) => q === "tingling" || q === "burning"),
        options: [
          { id: "inner", label: "Pins and needles or numbness on the inner shin" },
          { id: "outer", label: "Pins and needles or numbness on the outer shin and top of the foot" },
          { id: "calfsole", label: "Pins and needles or numbness in the calf, outer foot, or sole", special: "lowbackHip" },
          { id: "both", label: "Burning or numbness in both feet, like socks", special: "calfDoctor" },
          { id: "none", label: "None of these" }
        ]},
      { id: "V7", text: "Which hurts more: moving your low back, or loading your leg (walking, running, rising on your toes)?",
        askIf: ({ draw, ra }) => !draw || ["lowerback", "sij", "thigh", "hip"].some((t) => draw.has(t)) ||
          [].concat(ra.V6 || []).some((o) => o !== "none"),
        // Early when the low back or buttock is drawn too: the back look-alike.
        priority: ({ draw }) => !!draw && ["lowerback", "sij"].some((t) => draw.has(t)),
        options: [
          { id: "back", label: "Moving my low back", special: "lowbackHip" },
          { id: "leg", label: "Loading my leg" },
          { id: "both", label: "Both about the same" },
          { id: "neither", label: "Neither brings it on" }
        ]},
      { id: "V8", text: "Is there any swelling or change in the skin?", options: [
        { id: "calf", label: "Swelling of the whole calf", special: "calfDoctor" },
        { id: "bruise", label: "Swelling and bruising after an injury" },
        { id: "ankles", label: "Swollen ankles at the end of the day, or varicose veins" },
        { id: "skin", label: "Skin that is shiny, cold, hairless, or slow to heal", special: "calfDoctor" },
        { id: "none", label: "No swelling or skin change" }
      ]}
    ],
    conditions: []
  },

  /* ══════════════ ANKLE ══════════════
     From Chandra's "Ankle assessment" region document (reviewed by Chandra,
     25 Sep 2026; the source text is content/regions/ankle.md). Sources: JOSPT
     lateral ankle sprain CPG 2021, Ottawa ankle rules (Stiell 1993), ROAST
     2019, Vuurberg 2018, Sman 2015 (syndesmosis), Maffulli 1998 (Achilles
     rupture), Kohls-Gatzoulis 2004 (tibialis posterior), McSweeney & Cichero
     2015 (tarsal tunnel), Travell & Simons 2019.
     Reached from the body map's ankle band (ANKLE_TOP in Body3D.jsx), which
     also covers the foot until the foot document is built. Its injury
     screen (the Ottawa ankle rules, adapted) is in ./injuryScreen.js.
     Conditions: content/conditions/ankle-*.md. */
  ankle: {
    name: "Ankle & foot",
    redFlags: [
      { id: "af-septic", tier: "emergency", why: "Possible joint infection (septic arthritis)",
        text: "Is your ankle hot, red, and swollen, with a fever or feeling unwell?" },
      { id: "af-pe", tier: "emergency", group: "legclotlung", why: "Possible blood clot that has travelled to the lung",
        text: "Is your calf or ankle swollen, warm, or tender, and are you also short of breath, or have chest pain or are coughing blood?" },
      { id: "af-ischaemia", tier: "emergency", group: "limbischaemia", why: "Possible blocked artery",
        text: "Has your foot suddenly become cold, pale, numb, or painful at rest?" },
      { id: "af-necfasc", tier: "emergency", group: "legnecfasc", why: "Possible severe skin and tissue infection",
        text: "Is there a hot, red area around your ankle that is spreading fast, with pain far worse than it looks, or feeling very unwell?" },
      { id: "af-charcot", sameDay: true, tier: "urgent", why: "Possible Charcot foot or diabetic foot infection; same-day review protects the foot",
        text: "Do you have diabetes, and is your foot or ankle hot, red, and swollen (even if it does not hurt much), or is there a wound that is not healing?" },
      { id: "af-dvt", sameDay: true, tier: "urgent", group: "legclot", why: "Possible blood clot (DVT); same-day review",
        text: "Is your calf or ankle swollen, warm, or tender, especially after surgery, a cast or boot, a long journey, time in bed, or starting the pill?" },
      { id: "af-gout", tier: "urgent", why: "Possible gout or other crystal arthritis",
        text: "Did your ankle or big toe become suddenly hot, swollen, and very painful overnight, and have you had gout before?" },
      { id: "af-inflam", tier: "urgent", why: "Possible inflammatory or reactive arthritis affecting the tendons",
        text: "Do you have heel or Achilles pain along with back stiffness in the morning, psoriasis, eye inflammation, other swollen joints, or a recent stomach bug or sexually transmitted infection?" },
      { id: "af-quinolone", tier: "urgent", why: "These medicines raise the risk of Achilles rupture; the prescriber should review",
        text: "Have you recently taken a quinolone antibiotic (such as ciprofloxacin) or steroid tablets, and now have Achilles pain?" },
      { id: "af-footdrop", tier: "urgent", group: "footdrop", why: "Foot drop (peroneal nerve or L5) needs medical review",
        text: "Is your foot slapping down or your toes catching when you walk?" },
      { id: "af-neuropathy", tier: "urgent", group: "neuropathy", why: "Possible peripheral neuropathy; needs medical review and foot checks",
        text: "Do both feet feel numb, burning, or tingling, like wearing socks, especially with diabetes?" },
      { id: "af-cancer", tier: "urgent", group: "cancer", why: "A lump or bone lesion needs medical review",
        text: "Have you ever had cancer, or is there a lump that is growing, or deep pain at night that does not change with position?" }
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
        { id: "twist", label: "I rolled or twisted it" },
        { id: "gradual", label: "Gradually, no clear reason" },
        { id: "running", label: "After increasing running, jumping, or hill walking" },
        { id: "walking", label: "After a long walk, or standing a lot" },
        { id: "shoes", label: "After new or different shoes" },
        { id: "landing", label: "After landing badly or a fall" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d6w", label: "2 to 6 weeks" },
        { id: "d3m", label: "6 weeks to 3 months" },
        { id: "o3m", label: "More than 3 months" }
      ]}
    ],
    questions: [
      { id: "A1", text: "Where is the pain mainly?", options: [
        { id: "outer", label: "Outer ankle, in front of or below the bony bump" },
        { id: "inner", label: "Inner ankle, behind or below the bony bump" },
        { id: "front", label: "Front of the ankle, in the crease" },
        { id: "heel", label: "Back of the heel, where the heel cord attaches" },
        { id: "high", label: "Just above the ankle, at the front between the two leg bones" }
      ]},
      { id: "A2", text: "Have you sprained this ankle before?",
        askIf: ({ ra }) => [].concat(ra.A1 || []).includes("outer") || ra.onset === "twist",
        priority: () => true,
        options: [
          { id: "once", label: "Once or twice, and it recovered" },
          { id: "recurrent", label: "It keeps rolling, or feels like it will give way" },
          { id: "recent", label: "I rolled it recently, felt a pop, and it bruised" },
          { id: "never", label: "Never" }
        ]},
      { id: "A3", text: "Which of these bring it on? Tick all that apply.", options: [
        { id: "uneven", label: "Walking on uneven ground" },
        { id: "running", label: "Running, jumping, or hopping" },
        { id: "squat", label: "Squatting, lunging, or going down stairs" },
        { id: "firststeps", label: "The first steps in the morning, or after sitting" },
        { id: "shoes", label: "Shoes pressing on the back of the heel" }
      ]},
      { id: "A4", text: "Some weeks after a sprain, which apply? Tick all that apply.",
        askIf: ({ ra }) => [].concat(ra.A2 || []).some((o) => o !== "never") && (ra.duration === "d3m" || ra.duration === "o3m"),
        priority: () => true,
        options: [
          { id: "swells", label: "It still swells after activity" },
          { id: "catching", label: "Catching or locking deep in the ankle" },
          { id: "deepache", label: "A deep ache inside the ankle after activity" },
          { id: "unstable", label: "It still feels unstable" },
          { id: "normal", label: "It feels back to normal" }
        ]},
      { id: "A5", text: "About the inner ankle: which apply? Tick all that apply.",
        askIf: ({ ra }) => [].concat(ra.A1 || []).includes("inner"),
        priority: () => true,
        options: [
          { id: "flat", label: "My arch is getting flatter on that side" },
          { id: "tiptoe", label: "I cannot rise onto my toes on that leg as well as the other" },
          { id: "swelling", label: "Swelling behind the inner ankle bone" },
          { id: "burning", label: "Burning or tingling into the sole and inner heel, worse standing" },
          { id: "none", label: "None of these" }
        ]},
      { id: "A6", text: "About the back of the heel: which apply? Tick all that apply.",
        askIf: ({ ra }) => [].concat(ra.A1 || []).includes("heel"),
        priority: () => true,
        options: [
          { id: "bump", label: "A tender bump at the back of the heel, sore in shoes" },
          { id: "higher", label: "The pain is higher, 2 to 6 cm above the heel", special: "achillesHigher" },
          { id: "morning", label: "Stiff and sore for the first steps in the morning" },
          { id: "creak", label: "Creaking when I move the ankle" },
          { id: "none", label: "None of these" }
        ]},
      { id: "A7", text: "Which of these do you notice in the foot? Tick all that apply.",
        askIf: ({ draw, all }) => !draw || ["lowerleg", "thigh", "lowerback", "sij"].some((t) => draw.has(t)) ||
          [].concat(all.painQuality || []).some((q) => q === "tingling" || q === "burning"),
        // Early with nerve-type pain (or when the drawing is unknown).
        priority: ({ draw, all }) => !draw || [].concat(all.painQuality || []).some((q) => q === "tingling" || q === "burning"),
        options: [
          { id: "top", label: "Pins and needles or numbness on the top of the foot" },
          { id: "sole", label: "Pins and needles or numbness in the sole or heel" },
          { id: "both", label: "Burning or numbness in both feet, like socks", special: "calfDoctor" },
          { id: "slap", label: "The foot slaps down, or the toes catch", special: "footDrop" },
          { id: "none", label: "None of these" }
        ]},
      { id: "A8", text: "What does any swelling look like?", options: [
        { id: "injury", label: "Swelling and bruising after an injury" },
        { id: "bothankles", label: "Both ankles swell by the end of the day" },
        { id: "activity", label: "Swelling after activity, settling overnight" },
        { id: "hot", label: "A hot, red, swollen joint", special: "hotJoint" },
        { id: "none", label: "No swelling" }
      ]}
    ],
    conditions: []
  }
}

// Special education cards used by the new regions
export const EXTRA_SPECIAL_CARDS = {
  medianhand: { title: "Tingling in the thumb-side fingers",
    body: "Tingling in the thumb, index or middle fingers usually points to the <strong>median nerve</strong> — most often compressed at the wrist rather than the elbow. Consider running the <strong>Wrist</strong> guide too." },
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
  boneStress: { title: "This could be a stress fracture: see a doctor before more running",
    body: "Shin pain that gets worse the more you run and hurts to hop, or one spot on the bone you can cover with a fingertip, can be a <strong>stress fracture</strong> rather than shin splints. It needs a doctor and usually imaging before you run again. Physiotherapy helps with the return to running afterwards." },
  calfDoctor: { title: "Please have this checked by a doctor",
    body: "A calf cramp on walking that eases within minutes of standing still, pain at rest that eases with the leg hanging down, skin that is shiny, cold, hairless, or slow to heal, burning or numbness in both feet, or a whole calf that is swollen can point to a circulation problem, a nerve condition, or a clot. A doctor should check these. Physiotherapy can help alongside or afterwards." },
  achillesHigher: { title: "This may be the Achilles tendon higher up",
    body: "Achilles pain 2 to 6 cm above the heel is usually the middle part of the tendon, which is assessed and treated a little differently from pain where it attaches to the heel. Consider running the <strong>Lower leg</strong> guide too. Your assessment will check the whole tendon." },
  hotJoint: { title: "A hot, red, swollen joint should be checked by a doctor today",
    body: "A joint that is hot, red, and swollen can be gout, another crystal arthritis, or an infection. A doctor should see it the same day, and straight away if you have a fever or feel unwell. Physiotherapy can help once it has settled." },
  footDrop: { title: "A dropping foot should be checked by a doctor",
    body: "A foot that slaps down or toes that catch when you walk mean the muscles that lift the foot are weak. This can come from a nerve pressed at the outer knee (after crossing the legs, a tight cast, or a knee injury) or from the low back. A doctor should check it soon. Physiotherapy can help alongside or afterwards." },
  thighDoctor: { title: "Please have this checked by a doctor",
    body: "Weakness with the knee giving way, a cramp in the thigh or buttock on walking that eases within minutes of standing still, a hard lump in the muscle weeks after a knock, a lump that is growing, or a whole thigh or calf that is swollen are signs a doctor should look at. They can point to a nerve or circulation problem, bone forming in a bruised muscle, a lump that needs imaging, or a clot. Physiotherapy can help alongside or afterwards." },
  lowbackHip: { title: "This may be coming from your low back",
    body: "Hip, buttock or thigh pain that is worse when you <strong>move your low back</strong>, comes with <strong>pins and needles</strong>, or builds with walking and eases when you sit or bend forward, often comes from the <strong>low back</strong> rather than the hip itself. Consider running the <strong>Low back</strong> guide too. Your assessment will check both." },
  groinDoctor: { title: "Please have this checked by a doctor as well",
    body: "Groin pain that is linked to your periods, comes with burning or blood when passing urine, comes with a lump that appears when you cough or stand, or comes with testicle pain can come from the <strong>organs</strong> or a <strong>hernia</strong> rather than the hip. A doctor should check this. Physiotherapy can help alongside or afterwards if the hip is involved too." },
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
  handDoctor: { title: "Please have this checked by a doctor",
    body: "A whole finger swollen like a sausage, knuckles swollen in both hands, a hot puffy joint, long morning stiffness, nail pitting with psoriasis, other joints swollen too, tingling in both hands, fingers that go white then blue in the cold, or a hand that has changed colour or temperature since an injury are signs a doctor should look at. They can point to inflammatory arthritis, gout, a circulation problem, a nerve condition, or complex regional pain syndrome. Physiotherapy can help alongside or afterwards." },
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
