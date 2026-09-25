/* ─────────────────────────────────────────────────────────────────────────
   EXTRA REGIONS for the symptom guide — authored from Physio Chandra's
   clinical education documents (78 condition docs, July 2026 set).
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
      { id: "nrf-thunderclap", tier: "emergency", why: "Possible bleed or artery tear in the neck or head",
        text: "Have you had a sudden, severe headache, the worst you have ever had?" },
      { id: "nrf-artery", tier: "emergency", why: "Stroke or neck artery warning signs",
        text: "Since this started, have you had any of these: room spinning or dizziness, double vision, slurred speech, trouble swallowing, sudden falls or blackouts, numb face, weakness on one side, or unsteady walking?" },
      { id: "nrf-cord", tier: "emergency", group: "cord", why: "Acute pressure on the spinal cord",
        text: "Along with the neck pain, have you lost control of your bladder or bowels, or had new numbness or weakness in both legs?" },
      { id: "nrf-mening", tier: "emergency", why: "Possible meningitis",
        text: "Do you have a fever with a stiff neck, a bad headache, or find bright light hard to look at?" },
      { id: "nrf-cardiac", tier: "emergency", group: "cardiac", why: "Heart pain can be felt in the neck, jaw, and arm",
        text: "Is the pain in your neck, jaw, or left arm brought on by effort, or does it come with chest tightness, shortness of breath, or sweating?" },
      { id: "nrf-kehr", tier: "emergency", drawn: ["shoulder"], why: "Possible bleeding from the spleen, felt at the shoulder tip",
        text: "Did pain at the tip of your left shoulder start after a blow to your tummy or ribs, or does it come with feeling faint or dizzy?" },
      { id: "nrf-myelo", tier: "urgent", why: "Possible pressure on the spinal cord (myelopathy)",
        text: "Have your hands become clumsy (buttons, writing, dropping things), or has your walking become unsteady?" },
      { id: "nrf-upperinstab", tier: "urgent", why: "Possible upper neck instability",
        text: "Do you need to hold your head up with your hands, or does moving your neck cause tingling around your lips or mouth?" },
      { id: "nrf-cad", tier: "urgent", why: "An early sign of a neck artery tear can be pain alone",
        text: "Did a new neck pain or headache, unlike anything you have had before, start suddenly after a neck manipulation, a sudden jerk, or a minor knock?" },
      { id: "nrf-tip", tier: "urgent", drawn: ["shoulder"], why: "The diaphragm, lung lining, liver or gallbladder can be felt at the shoulder tip",
        text: "Is the pain at the tip of your shoulder worse when you breathe in deeply, or does it come on after fatty meals?" }
    ],
    context: [
      { id: "age", text: "Your age?", options: [
        { id: "u18", label: "Under 18" },
        { id: "18-29", label: "18 to 29" },
        { id: "30-49", label: "30 to 49" },
        { id: "50-64", label: "50 to 64", weights: { radic: 1 } },
        { id: "o64", label: "65 or over" }
      ]},
      { id: "onset", text: "How did it start?", options: [
        { id: "woke", label: "Woke up with it", weights: { mech: 2 } },
        { id: "gradual", label: "Gradually, no clear reason", weights: { mech: 1 } },
        { id: "car", label: "After a car accident or whiplash-type jolt" },
        { id: "fall", label: "After a fall, sport, or knock to the head or neck" },
        { id: "desk", label: "After long hours at a desk, screen, or in one position", weights: { mech: 2 } },
        { id: "lift", label: "After lifting or a sudden movement", weights: { mech: 1, radic: 1 } }
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
        { id: "full", label: "I can turn fully both ways", weights: { mech: -2 } },
        { id: "onestiff", label: "It is stiff or painful turning to one side", weights: { mech: 3, radic: 1 } },
        { id: "bothstiff", label: "It is stiff or painful turning both ways", weights: { mech: 2 } },
        { id: "locked", label: "It is locked and I can barely turn it at all", weights: { mech: 1 } }
      ]},
      { id: "N2", text: "Which of these describe your arm symptoms? Tick all that apply.",
        askIf: ({ draw, all }) => !draw || ["shoulder", "elbow", "wrist"].some((t) => draw.has(t)) ||
          [].concat(all.painQuality || []).some((q) => q === "tingling" || q === "burning"),
        options: [
          { id: "pastelbow", label: "Pain goes down the arm past the elbow", weights: { radic: 3 } },
          { id: "armworse", label: "The arm pain is worse than the neck pain", weights: { radic: 2 } },
          { id: "fingers", label: "Pins and needles or numbness in particular fingers", weights: { radic: 3 } },
          { id: "handhead", label: "Resting my hand on top of my head eases the arm pain", weights: { radic: 2 } },
          { id: "shoulderonly", label: "Pain stops at the top of the shoulder or upper arm", weights: { radic: -2, mech: 1 } }
        ]},
      { id: "N3", text: "Does looking up, or tilting your head toward the sore side, bring on pain or tingling down the arm?",
        askIf: ({ ra }) => [].concat(ra.N2 || []).some((o) => o === "pastelbow" || o === "fingers"),
        options: [
          { id: "arm", label: "Yes, it goes down the arm", weights: { radic: 3 } },
          { id: "neckonly", label: "It hurts in the neck, but not the arm", weights: { mech: 1, radic: -1 } },
          { id: "neither", label: "No, neither", weights: { radic: -2 } }
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
        { id: "desk", label: "Long spells at a desk, screen, or driving", weights: { mech: 1 } },
        { id: "down", label: "Looking down (phone, reading, cooking)", weights: { mech: 1 } },
        { id: "up", label: "Looking up (overhead work, reaching high shelves)", weights: { radic: 1 } },
        { id: "lying", label: "Lying on it, or certain pillows" },
        { id: "lifting", label: "Lifting or carrying" }
      ]},
      { id: "N7", text: "How does your neck feel when you start moving after being still for a while?", options: [
        { id: "eases", label: "Stiff at first, then eases as I move", weights: { mech: 2 } },
        { id: "worse", label: "Gets worse the more I move", weights: { radic: 1 } },
        { id: "same", label: "About the same either way" }
      ]},
      { id: "N8", text: "Which hurts more: moving your neck, or moving your shoulder and arm (reaching, lifting the arm)?",
        askIf: ({ draw }) => !draw || draw.has("shoulder"),
        // Asked early when the drawing stops at the shoulder: the look-alike case.
        priority: ({ draw }) => !!draw && draw.has("shoulder") && !draw.has("elbow") && !draw.has("wrist"),
        options: [
          { id: "neck", label: "Moving my neck", weights: { mech: 1, radic: 1 } },
          // The shoulder look-alike (test patient 4): pulls the neck patterns
          // down and points to the shoulder guide instead.
          { id: "shoulder", label: "Moving my shoulder and arm", weights: { mech: -3, radic: -3 }, special: "shoulderSource" },
          { id: "both", label: "Both about the same" },
          { id: "neither", label: "Neither brings it on" }
        ]}
    ],
    conditions: [
      { id: "mech", name: "Mechanical neck pain", clin: "Neck pain with mobility deficits (JOSPT 2017)",
        blurb: "The most common neck pattern: joints and muscles that are irritated or guarded — often from posture, sleep position, or an awkward movement — without any serious structural problem.",
        noticed: ["Aching or sharp catches with certain head movements", "Stiffness that eases as you move through the day", "Tension around the neck and shoulder muscles"],
        homeCare: ["Keep the neck gently moving — frequent, comfortable range rather than rest", "Change positions often during desk work; raise the screen to eye level", "A warm pack on the neck/shoulder muscles can ease guarding", "Sleep with one supportive pillow keeping the neck level"],
        seePhysioIf: ["Pain or stiffness lasts more than 1–2 weeks", "It keeps returning with work or sleep", "It limits driving, work, or exercise"] },
      { id: "radic", name: "Cervical radiculopathy (nerve-root irritation)", clin: "Neck pain with radiating pain (JOSPT 2017)",
        blurb: "A nerve in the neck being irritated or compressed can refer sharp, electric pain plus tingling or numbness down the arm — often more bothersome than the neck itself.",
        noticed: ["Arm pain below the elbow, often into specific fingers", "Pins & needles or numbness in the hand", "Coughing/sneezing can shoot pain down the arm", "Resting the hand on the head may ease it"],
        homeCare: ["Avoid positions that clearly shoot pain down the arm", "Short, frequent gentle neck movement within comfort", "Try easing positions (e.g., hand resting on head) when the arm flares"],
        seePhysioIf: ["Arm pain, tingling or numbness lasts beyond a few days", "You notice any hand weakness", "You want a plan — most cases settle well with guided conservative care"] }
    ]
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
      { id: "crf-pancoast", tier: "urgent", why: "Possible tumour at the top of the lung (Pancoast)",
        text: "Do you smoke or used to smoke, and have you also had a cough that will not go away, coughed up blood, or noticed a drooping eyelid on the painful side?" },
      { id: "crf-osteo", tier: "urgent", group: "osteo", why: "Possible osteoporotic fracture of the spine",
        text: "Did the pain start suddenly after a minor strain, cough, or lift, and you have osteoporosis or take long-term steroid tablets?" },
      { id: "crf-wasting", tier: "urgent", why: "Nerve compression (C8/T1) or thoracic outlet needs medical review",
        text: "Are the small muscles of your hand getting thinner, or has your grip become weak?" },
      { id: "crf-vascular", tier: "urgent", why: "Possible blood vessel compression or clot in the arm (same-day review)",
        text: "Does your arm or hand turn pale, blue, cold, or swollen, especially when your arm is raised?" },
      { id: "crf-gallbladder", tier: "urgent", why: "Gallbladder pain can be felt under the right shoulder blade",
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
      { id: "prf-infection", tier: "urgent", group: "infection", why: "Possible joint infection (septic sacroiliitis)",
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

  /* ══════════════ ELBOW ══════════════ */
  elbow: {
    name: "Elbow & forearm",
    redFlags: [
      { id: "erf-hot", text: "A hot, red, swollen elbow — especially with fever or feeling unwell", tier: "urgent" },
      { id: "erf-trauma", text: "A fall or impact with deformity, severe swelling, or inability to bend/straighten the elbow", tier: "urgent" },
      { id: "erf-wasting", text: "Visible muscle wasting in the hand, or rapidly worsening hand weakness", tier: "urgent" }
    ],
    context: [
      { id: "age", text: "Your age?", options: [
        { id: "u30", label: "Under 30" },
        { id: "30-50", label: "30 – 50", weights: { tennis: 1, golfer: 1 } },
        { id: "o50", label: "Over 50" }
      ]},
      { id: "onset", text: "How did it start?", options: [
        { id: "gripwork", label: "Gradually with gripping work, DIY, or racquet sports", weights: { tennis: 2 } },
        { id: "throw", label: "Gradually with golf, throwing, or heavy carrying", weights: { golfer: 2 } },
        { id: "lean", label: "I lean on my elbows a lot / long phone calls", weights: { cubital: 2 } },
        { id: "gradual", label: "Gradually, no clear cause", },
        { id: "ns", label: "Not sure" }
      ]},
    ],
    questions: [
      { id: "E1", text: "Where exactly is it?", options: [
        { id: "outer", label: "The bony bump on the OUTER elbow", weights: { tennis: 3 } },
        { id: "inner", label: "The bony bump on the INNER elbow", weights: { golfer: 3, cubital: 1 } },
        { id: "innerarm", label: "Inner elbow, running down toward the ring & little fingers", weights: { cubital: 3 } },
        { id: "ns", label: "Not sure" }
      ]},
      { id: "E2", text: "Any tingling or numbness in the fingers?", options: [
        { id: "ringlittle", label: "Ring & little fingers — often worse at night or with a bent elbow", weights: { cubital: 3 } },
        { id: "thumbside", label: "Thumb, index or middle fingers", special: "medianhand" },
        { id: "none", label: "No tingling", weights: { cubital: -2 } }
      ]},
      { id: "E3", text: "What does gripping feel like?", options: [
        { id: "outerpain", label: "Pain at the outer elbow when gripping a cup or shaking hands", weights: { tennis: 2 } },
        { id: "innerpain", label: "Pain at the inner elbow with wringing, or lifting palm-up", weights: { golfer: 2 } },
        { id: "weak", label: "More weakness/clumsiness than pain — I drop things", weights: { cubital: 2 } },
        { id: "fine", label: "Gripping feels normal" }
      ]},
      { id: "E4", text: "What clearly aggravates it?", options: [
        { id: "typing", label: "Typing, mouse work, or racquet sports", weights: { tennis: 1 } },
        { id: "carry", label: "Carrying bags, golf, or throwing", weights: { golfer: 1 } },
        { id: "bent", label: "Sleeping with a bent elbow or leaning on it", weights: { cubital: 2 } },
        { id: "ns", label: "Not sure" }
      ]}
    ],
    conditions: [
      { id: "tennis", name: "Tennis elbow", clin: "Lateral epicondylalgia (extensor tendinopathy)",
        blurb: "An overload of the tendons that lift the wrist and fingers, felt at the outer elbow — despite the name, most cases come from gripping work, desk work, or DIY rather than tennis.",
        noticed: ["Pain or burning at the outer elbow with wrist movements", "Weakened grip — a full cup or a handshake hurts", "Tenderness on the outer bony bump", "Worse with lifting, gripping, twisting"],
        homeCare: ["Temporarily reduce the most aggravating grip loads — don't stop using the arm entirely", "Lift with the palm up where possible", "Gradual strengthening of the forearm is the proven path — tendons adapt to progressive load"],
        seePhysioIf: ["Pain persists beyond 2–3 weeks despite self-care", "Daily tasks like holding a cup are limited", "Strength is gradually dropping — a graded loading program is the evidence-based treatment"] },
      { id: "golfer", name: "Golfer's elbow", clin: "Medial epicondylalgia (flexor tendinopathy)",
        blurb: "The mirror image of tennis elbow: overload of the tendons that flex the wrist and grip, felt at the inner elbow — common with golf, throwing, climbing, and heavy carrying.",
        noticed: ["Ache or sharp pain at the inner elbow", "Worse with gripping, wringing, or lifting palm-up", "May radiate a little down the inner forearm", "Early on only during activity; later can ache at rest"],
        homeCare: ["Moderate the clearly provoking loads for a while", "Warm up the forearm before sport or heavy tasks", "Progressive forearm-flexor strengthening as symptoms allow"],
        seePhysioIf: ["Pain lasts more than 2–3 weeks or keeps returning with sport", "Grip strength is dropping", "You want a graded return-to-sport loading plan"] },
      { id: "cubital", name: "Cubital tunnel syndrome", clin: "Ulnar nerve irritation at the elbow",
        blurb: "The ulnar nerve runs through a tight tunnel at the inner elbow ('funny bone'). Sustained bending or leaning can irritate it, causing tingling into the ring and little fingers and hand weakness.",
        noticed: ["Numbness/tingling in the ring & little fingers, worse at night or with bent elbows", "Aching at the inner elbow, sometimes down the forearm", "Weak grip, clumsiness, dropping objects"],
        homeCare: ["Avoid prolonged fully-bent elbow positions — adjust phone and sleep habits", "Stop leaning on the inner elbow on desks and armrests", "A towel loosely wrapped around the elbow at night keeps it straighter"],
        seePhysioIf: ["Tingling or numbness persists more than a few weeks", "Grip or fine motor control is worsening", "Early guided care (nerve glides, habit changes) can prevent progression"] }
    ]
  },

  /* ══════════════ WRIST & HAND ══════════════ */
  wrist: {
    name: "Wrist & hand",
    redFlags: [
      { id: "wrf-fall", text: "A fall onto the hand with severe pain, swelling, or tenderness in the 'snuffbox' at the base of the thumb", tier: "urgent" },
      { id: "wrf-hot", text: "A hot, red, swollen wrist or hand with fever or feeling unwell", tier: "urgent" },
      { id: "wrf-loss", text: "Rapidly worsening numbness, weakness, or visible muscle wasting in the hand", tier: "urgent" }
    ],
    context: [
      { id: "age", text: "Your age?", options: [
        { id: "u30", label: "Under 30" },
        { id: "30-50", label: "30 – 50" },
        { id: "o50", label: "Over 50", weights: { median: 1 } }
      ]},
      { id: "onset", text: "How did it start?", options: [
        { id: "repeat", label: "Gradually with repetitive hand work, texting, or lifting a baby/kettle", weights: { dq: 2 } },
        { id: "twistinj", label: "After a fall or a forceful twist of the wrist", weights: { tfcc: 2 } },
        { id: "pushups", label: "With push-ups, yoga, or loaded wrist-back positions", weights: { ganglion: 1, tfcc: 1 } },
        { id: "gradual", label: "Gradually, no clear cause" },
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
      { id: "W1", text: "Where exactly is it?", options: [
        { id: "thumbside", label: "Thumb side of the wrist", weights: { dq: 3 } },
        { id: "pinkyside", label: "Little-finger side of the wrist", weights: { tfcc: 3 } },
        { id: "backbump", label: "Back of the wrist — with a visible or feelable bump", weights: { ganglion: 3 } },
        { id: "palmfingers", label: "Palm and fingers, more numbness than pain", weights: { median: 3 } },
        { id: "ns", label: "Not sure" }
      ]},
      { id: "W2", text: "Which of these clearly brings it on?", options: [
        { id: "liftgrip", label: "Lifting a child/kettle, texting, wringing", weights: { dq: 2 } },
        { id: "rotate", label: "Turning keys/doorknobs, or pushing up from a chair", weights: { tfcc: 2 } },
        { id: "wristback", label: "Weight on a bent-back wrist (push-ups, yoga)", weights: { ganglion: 2, tfcc: 1 } },
        { id: "night", label: "Night-time — tingling that eases when I shake the hand", weights: { median: 3 } },
        { id: "ns", label: "Not sure" }
      ]},
      { id: "W3", text: "Is there a lump or bump on the wrist?", options: [
        { id: "lump", label: "Yes — a smooth lump that can change size", weights: { ganglion: 3 } },
        { id: "nolump", label: "No lump", weights: { ganglion: -2 } }
      ]},
      { id: "W4", text: "Any tingling or numbness in the thumb, index, or middle fingers?", options: [
        { id: "yes", label: "Yes — in those fingers", weights: { median: 2 } },
        { id: "other", label: "Tingling, but mainly ring & little fingers", special: "ulnarhand" },
        { id: "none", label: "No tingling", weights: { median: -2 } }
      ]},
      { id: "W5", text: "Any clicking or a painful catch when rotating the forearm (like turning a key)?", options: [
        { id: "click", label: "Yes — clicking or catching on the little-finger side", weights: { tfcc: 2 } },
        { id: "thumbcatch", label: "A painful catch with thumb movement", weights: { dq: 2 } },
        { id: "no", label: "No" }
      ]}
    ],
    conditions: [
      { id: "dq", name: "De Quervain's tenosynovitis", clin: "Thumb-side wrist tendon sheath irritation",
        blurb: "The tendons that move the thumb run through a snug tunnel on the thumb side of the wrist. Repetitive gripping and lifting — classically a new baby, kettle, phone — can irritate that sheath.",
        noticed: ["Achy or sharp thumb-side wrist pain, sometimes up the forearm", "Worse with gripping, pinching, lifting, texting", "A tender 'strip' or slight swelling near the thumb base", "A painful catch with thumb movement"],
        homeCare: ["Modify the provoking lift — scoop with the palm up rather than thumb-first", "A thumb-spica splint for aggravating tasks can calm it", "Gradual return to load as pain settles"],
        seePhysioIf: ["Thumb-side pain lasts more than 1–2 weeks", "It returns whenever you resume normal activity", "Splints or rest alone haven't fixed it — guided loading usually does"] },
      { id: "tfcc", name: "TFCC irritation / tear", clin: "Triangular fibrocartilage complex (little-finger side)",
        blurb: "The TFCC is the wrist's 'meniscus' on the little-finger side — a cartilage cushion that stabilises rotation. Falls, forceful twists, or repeated loaded rotation can irritate or tear it.",
        noticed: ["Pain on the little-finger side of the wrist", "Worse with rotation — keys, doorknobs, pouring", "Clicking or a feeling of weakness pushing up from a chair", "Often after a fall or sudden twist"],
        homeCare: ["Temporarily avoid forceful rotation and weight on the bent-back wrist", "A wrist support during loaded tasks can help early on", "Keep fingers and grip gently moving"],
        seePhysioIf: ["Ulnar-side pain or clicking persists beyond 2 weeks", "Weakness with rotation or weight-bearing on the hand", "You want a graded strengthening and stability plan"] },
      { id: "ganglion", name: "Ganglion cyst", clin: "Fluid-filled cyst from a joint or tendon sheath",
        blurb: "A smooth, benign fluid-filled lump — most often on the back of the wrist — that can enlarge with activity and fluctuate in size. Usually more annoying than harmful.",
        noticed: ["A visible/feelable smooth lump that may change size", "Ache with loaded wrist-back positions (push-ups, yoga)", "Sometimes no pain at all"],
        homeCare: ["Reduce sustained weight on the fully bent-back wrist; use fists or an angled support for floor work", "Don't 'smash' it (old book trick) — that's not recommended", "Monitor size; many settle or fluctuate harmlessly"],
        seePhysioIf: ["The lump is painful with daily tasks or training", "You're unsure the lump is a typical ganglion — assessment ± ultrasound gives clarity", "It limits wrist strength or mobility"] },
      { id: "median", name: "Median nerve irritation", clin: "Carpal-tunnel-type median nerve compression",
        blurb: "The median nerve supplies feeling to the thumb, index, and middle fingers. Compression — most commonly at the wrist — causes night tingling and numbness in that territory, often eased by shaking the hand.",
        noticed: ["Tingling/numbness in thumb, index & middle fingers", "Worse at night; shaking the hand brings relief", "Clumsiness with buttons or small objects", "Symptoms build with repetitive tasks or certain wrist positions"],
        homeCare: ["Avoid sleeping with the wrist curled — a neutral night splint often helps", "Break up repetitive hand tasks; keep the wrist neutral at the keyboard", "Gentle nerve-gliding movements within comfort"],
        seePhysioIf: ["Tingling recurs most nights or persists by day", "Grip or fine motor control is slipping", "Early care (splinting, glides, ergonomics) can prevent progression — persistent numbness needs medical review"] }
    ]
  },

  /* ══════════════ HIP ══════════════ */
  hip: {
    name: "Hip & groin",
    redFlags: [
      { id: "hrf-fall", text: "A fall or impact after which you cannot put weight on the leg", tier: "urgent" },
      { id: "hrf-hot", text: "Severe groin/hip pain with fever, or a hot swollen joint", tier: "urgent" },
      { id: "hrf-child", text: "This is for a child or teenager with a limp or groin/knee pain", tier: "urgent" }
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
      { id: "arf-pop", text: "A sudden 'pop' in the calf or heel and now you cannot push off or rise onto your toes", tier: "emergency" },
      { id: "arf-dvt", text: "A calf that is very swollen, warm, red or tender — especially with breathlessness or chest pain", tier: "emergency" },
      { id: "arf-walk", text: "After an injury you cannot take four steps, or there is bony tenderness at the ankle knobs or midfoot", tier: "urgent" },
      { id: "arf-hot", text: "A hot, red, swollen foot with fever — or any foot wound/swelling and you have diabetes", tier: "urgent" }
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
  ribcage: { title: "Pain with deep breaths",
    body: "Sharp pain with a deep breath often involves the <strong>rib joints</strong> where they meet the spine — usually mechanical and treatable. But if breath pain comes with fever, breathlessness, or follows an accident, see a doctor promptly." }
}
