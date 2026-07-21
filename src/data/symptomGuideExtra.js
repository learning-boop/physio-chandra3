/* ─────────────────────────────────────────────────────────────────────────
   EXTRA REGIONS for the symptom guide — authored from Physio Chandra's
   clinical education documents (78 condition docs, July 2026 set).
   Same schema and scoring rules as the original guide:
     weights 3 = strong pointer, 2 = moderate, 1 = weak, negative = rules against
     results need score ≥ 3 AND ≥ 40% of that condition's max.
   ⚠ FOR CLINICIAN REVIEW before go-live — educational patterns, not diagnosis.
   ───────────────────────────────────────────────────────────────────────── */

export const EXTRA_REGIONS = {

  /* ══════════════ NECK ══════════════ */
  neck: {
    name: "Neck & upper spine",
    redFlags: [
      { id: "nrf-clumsy", text: "Growing clumsiness in BOTH hands (buttons, writing, dropping things) or new trouble with balance and walking", tier: "emergency" },
      { id: "nrf-artery", text: "Dizziness, double vision, slurred speech, fainting, or face numbness that comes on with certain neck positions", tier: "emergency" },
      { id: "nrf-bladder", text: "New bladder or bowel changes alongside your neck symptoms", tier: "emergency" },
      { id: "nrf-armweak", text: "Arm or hand weakness that is clearly getting worse week by week", tier: "urgent" }
    ],
    context: [
      { id: "age", text: "Your age?", options: [
        { id: "u30", label: "Under 30" },
        { id: "30-50", label: "30 – 50" },
        { id: "o50", label: "Over 50", weights: { radic: 1 } }
      ]},
      { id: "onset", text: "How did it start?", options: [
        { id: "desk", label: "Gradually with desk work or phone use", weights: { mech: 2, ctj: 1 } },
        { id: "woke", label: "Woke up with it", weights: { mech: 2 } },
        { id: "move", label: "A sudden movement or awkward lift", weights: { mech: 1, radic: 1 } },
        { id: "gradual", label: "Gradually, no clear cause", weights: { mech: 1 } },
        { id: "ns", label: "Not sure" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d6w", label: "2 – 6 weeks" },
        { id: "d6m", label: "More than 6 weeks" },
        { id: "years", label: "Comes and goes over years", weights: { ctj: 1 } }
      ]}
    ],
    questions: [
      { id: "N1", text: "Where do you feel it most?", options: [
        { id: "neckonly", label: "In the neck itself", weights: { mech: 2 } },
        { id: "blade", label: "Neck plus around the shoulder blade", weights: { ctj: 2, mech: 1, radic: 1 } },
        { id: "arm", label: "Shooting down the arm, past the elbow", weights: { radic: 3 } },
        { id: "base", label: "The base of the neck, where neck meets upper back — stiff like a hinge", weights: { ctj: 3 } },
        { id: "ns", label: "Not sure" }
      ]},
      { id: "N2", text: "Any tingling, pins & needles, or numbness in the arm or hand?", options: [
        { id: "hand", label: "Yes — into the forearm, hand or fingers", weights: { radic: 3 } },
        { id: "upper", label: "Only in the upper arm / shoulder area", weights: { mech: 1, ctj: 1 } },
        { id: "none", label: "No tingling or numbness", weights: { radic: -2 } }
      ]},
      { id: "N3", text: "What clearly makes it worse?", options: [
        { id: "turn", label: "Turning the head (e.g., checking a blind spot)", weights: { mech: 2, radic: 1 } },
        { id: "look", label: "Looking up, or holding one head position for long", weights: { mech: 2, ctj: 1 } },
        { id: "deskhrs", label: "Hours of desk / screen work", weights: { ctj: 2, mech: 1 } },
        { id: "cough", label: "Coughing or sneezing shoots pain into the arm", weights: { radic: 2 } },
        { id: "ns", label: "Not sure" }
      ]},
      { id: "N4", text: "Does anything ease the arm symptoms?", options: [
        { id: "handhead", label: "Resting the hand on top of my head eases the arm", weights: { radic: 2 } },
        { id: "moving", label: "Gentle movement or changing position helps", weights: { mech: 1, ctj: 1 } },
        { id: "nothing", label: "Nothing obvious" },
        { id: "na", label: "I don't have arm symptoms", weights: { radic: -1 } }
      ]},
      { id: "N5", text: "How does the stiffness behave?", options: [
        { id: "morning", label: "Worst in the morning, loosens with movement", weights: { mech: 2 } },
        { id: "endday", label: "Builds up by the end of a working day", weights: { ctj: 2 } },
        { id: "constant", label: "About the same all day", weights: { mech: 1 } }
      ]}
    ],
    conditions: [
      { id: "mech", name: "Mechanical neck pain", clin: "Non-specific / postural neck pain",
        blurb: "The most common neck pattern: joints and muscles that are irritated or guarded — often from posture, sleep position, or an awkward movement — without any serious structural problem.",
        noticed: ["Aching or sharp catches with certain head movements", "Stiffness that eases as you move through the day", "Tension around the neck and shoulder muscles"],
        homeCare: ["Keep the neck gently moving — frequent, comfortable range rather than rest", "Change positions often during desk work; raise the screen to eye level", "A warm pack on the neck/shoulder muscles can ease guarding", "Sleep with one supportive pillow keeping the neck level"],
        seePhysioIf: ["Pain or stiffness lasts more than 1–2 weeks", "It keeps returning with work or sleep", "It limits driving, work, or exercise"] },
      { id: "radic", name: "Cervical radiculopathy (nerve-root irritation)", clin: "Referred arm pain from an irritated neck nerve",
        blurb: "A nerve in the neck being irritated or compressed can refer sharp, electric pain plus tingling or numbness down the arm — often more bothersome than the neck itself.",
        noticed: ["Arm pain below the elbow, often into specific fingers", "Pins & needles or numbness in the hand", "Coughing/sneezing can shoot pain down the arm", "Resting the hand on the head may ease it"],
        homeCare: ["Avoid positions that clearly shoot pain down the arm", "Short, frequent gentle neck movement within comfort", "Try easing positions (e.g., hand resting on head) when the arm flares"],
        seePhysioIf: ["Arm pain, tingling or numbness lasts beyond a few days", "You notice any hand weakness", "You want a plan — most cases settle well with guided conservative care"] },
      { id: "ctj", name: "Cervicothoracic junction stiffness", clin: "Stiffness where the neck meets the upper back",
        blurb: "The hinge where the mobile neck meets the stiffer upper back can become restricted with prolonged desk postures — the neck then overworks, causing pain at the base of the neck and around the shoulder blades.",
        noticed: ["A stiff 'hinge' feeling at the base of the neck", "Ache spreading toward the shoulder blades", "Builds up over the working day, eases with movement"],
        homeCare: ["Break up sitting every 30–45 minutes", "Gentle upper-back extension over the chair back and rotation movements", "Set up the desk so the screen is at eye level and forearms supported"],
        seePhysioIf: ["Recurring end-of-day neck/upper-back ache", "Stiffness limits looking up or over the shoulder", "You want targeted mobility and strengthening for desk work"] }
    ]
  },

  /* ══════════════ UPPER / MID BACK ══════════════ */
  upperback: {
    name: "Upper & mid back",
    redFlags: [
      { id: "trf-chest", text: "Chest pain, pressure, or breathlessness with exertion alongside this pain", tier: "emergency" },
      { id: "trf-band", text: "A new band-like numbness around the trunk, or numbness/weakness in the legs", tier: "emergency" },
      { id: "trf-fracture", text: "Sudden mid-back pain after a minor strain and you're over 65 or have osteoporosis or long-term steroid use", tier: "urgent" },
      { id: "trf-breath", text: "Sharp pain with every deep breath plus fever or feeling unwell", tier: "urgent" }
    ],
    context: [
      { id: "age", text: "Your age?", options: [
        { id: "u30", label: "Under 30" },
        { id: "30-50", label: "30 – 50" },
        { id: "o50", label: "Over 50" }
      ]},
      { id: "onset", text: "How did it start?", options: [
        { id: "load", label: "Lifting, twisting, or carrying", weights: { tlj: 2, mech: 1 } },
        { id: "desk", label: "Gradually with sitting or desk work", weights: { mech: 2 } },
        { id: "gradual", label: "Gradually, no clear cause", weights: { mech: 1, maigne: 1 } },
        { id: "ns", label: "Not sure" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d6w", label: "2 – 6 weeks" },
        { id: "d6m", label: "More than 6 weeks" },
        { id: "years", label: "Comes and goes over years", weights: { tlj: 1, maigne: 1 } }
      ]}
    ],
    questions: [
      { id: "T1", text: "Where do you feel it most?", options: [
        { id: "blades", label: "Between the shoulder blades", weights: { mech: 2 } },
        { id: "junction", label: "Where the ribcage ends — the 'junction' of mid and low back", weights: { tlj: 3, maigne: 1 } },
        { id: "crest", label: "Along the top of the pelvis / flank — though the back itself feels stiff higher up", weights: { maigne: 3 } },
        { id: "ns", label: "Not sure" }
      ]},
      { id: "T2", text: "Which pattern sounds most like yours?", options: [
        { id: "flare", label: "Repeated flare-ups after small tasks (laundry, bending, long drives), easing with support or position change", weights: { tlj: 3 } },
        { id: "slump", label: "Builds with slumped sitting, eases when I move", weights: { mech: 2 } },
        { id: "twist", label: "Worse with twisting or rotating", weights: { tlj: 1, mech: 1 } },
        { id: "ns", label: "Not sure" }
      ]},
      { id: "T3", text: "Is the top edge of your pelvis tender to press, even though the problem feels like it's in the back?", options: [
        { id: "yes", label: "Yes — surprisingly tender there", weights: { maigne: 3 } },
        { id: "no", label: "No", weights: { maigne: -2 } },
        { id: "ns", label: "Haven't checked" }
      ]},
      { id: "T4", text: "Does a deep breath change the pain?", options: [
        { id: "breath", label: "Yes — a deep breath is sharp", weights: { mech: 1 }, special: "ribcage" },
        { id: "no", label: "No" }
      ]}
    ],
    conditions: [
      { id: "mech", name: "Mechanical thoracic pain & stiffness", clin: "Non-specific mid-back / postural pain",
        blurb: "Stiffness and muscle ache of the mid-back region, commonly linked to sustained postures — the upper back tolerates load well but dislikes staying still.",
        noticed: ["Ache between the shoulder blades after sitting", "Stiffness with rotation or looking behind", "Eases with movement and activity"],
        homeCare: ["Break up sitting regularly; vary positions", "Gentle extension over a chair back and rotation stretches", "Stay generally active — walking helps the whole spine"],
        seePhysioIf: ["Stiffness or ache persists beyond 2 weeks", "It limits work, sport, or sleep", "You'd like a posture-and-strength plan for desk work"] },
      { id: "tlj", name: "Thoracolumbar junction irritation / instability pattern", clin: "TLJ overload where mid and low back meet",
        blurb: "The junction between the stiff ribcage spine and the mobile low back can become sensitised and 'flare-prone' — small loads trigger recurring episodes that settle with support and better load control.",
        noticed: ["Recurring flares after minor activities", "A specific sore spot where the ribcage ends", "Temporary relief from support, bracing, or position change", "Predictable aggravators: extension, rotation, loading"],
        homeCare: ["Note and temporarily moderate the predictable triggers", "Gentle mobility plus gradual core/hinge strengthening", "Remember: pain intensity here does not equal tissue damage"],
        seePhysioIf: ["Flare-ups keep recurring", "You want a structured stability and load-management program", "Episodes are getting closer together or stronger"] },
      { id: "maigne", name: "Maigne syndrome (thoracolumbar referred pain)", clin: "TL-junction pain referring to the pelvis rim / flank",
        blurb: "Irritation at the thoracolumbar junction can refer pain along nerves that travel to the top of the pelvis, flank, or groin — so the felt pain is lower than its actual source. Pressing the pelvic rim is often unexpectedly tender.",
        noticed: ["Pain along the iliac crest (top of the pelvis) or flank", "Tenderness when pressing that rim of bone", "A stiff segment where ribcage meets low back", "Low-back or hip treatments that never quite worked"],
        homeCare: ["Gentle mobility for the mid-back junction rather than rubbing the sore spot", "Avoid prolonged slumped sitting", "Keep generally active within comfort"],
        seePhysioIf: ["Pelvic-rim or flank pain hasn't responded to treatment aimed at the low back or hip", "The pattern keeps recurring", "You'd like assessment of the thoracolumbar junction specifically"] }
    ]
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
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d6w", label: "2 – 6 weeks" },
        { id: "d6m", label: "More than 6 weeks" },
        { id: "years", label: "Comes and goes over years" }
      ]}
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
        { id: "outside", label: "The outside of the hip — tender to lie on", weights: { gtps: 3 } },
        { id: "groin", label: "Deep in the groin / front hip crease", weights: { fai: 3 } },
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
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d6w", label: "2 – 6 weeks" },
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
  ribcage: { title: "Pain with deep breaths",
    body: "Sharp pain with a deep breath often involves the <strong>rib joints</strong> where they meet the spine — usually mechanical and treatable. But if breath pain comes with fever, breathlessness, or follows an accident, see a doctor promptly." }
}
