export const GENERAL_RED_FLAGS = [
  {id:"grf-fever", text:"Fever, chills, or feeling generally unwell alongside this pain", tier:"urgent"},
  {id:"grf-weight", text:"Unexplained weight loss over recent months", tier:"urgent"},
  {id:"grf-cancer", text:"A history of cancer, and this is a new or changing pain", tier:"urgent"},
  {id:"grf-night", text:"Constant pain that doesn't change with position or rest and wakes you every night", tier:"urgent"},
  {id:"grf-trauma", text:"A significant accident (fall from height, vehicle collision) — or any fall if you're 65+ or have osteoporosis", tier:"urgent"}
];

export const REGIONS = {
  /* ══════════════ LOW BACK & PELVIS ══════════════
     From Chandra's "Lumbar assessment" region document (DRAFT 23 Sep 2026;
     the source text is content/regions/lowback.md). Sources: JOSPT LBP CPG
     2021 and 2012, NICE NG59, IFOMPT red flags framework 2020, Konno 2007,
     Laslett 2005, Bogduk 2009, Fukui 1997, O'Neill 2002, Lesher 2008,
     Travell & Simons 2019.
     A low-back mark also asks the TL-junction questions (./referral.js).
     Conditions: content/conditions/lowback-*.md. */
  lowback: {
    name:"Low back & pelvis",
    redFlags:[
      {id:"rf-saddle", tier:"emergency", group:"saddle", why:"Possible cauda equina syndrome",
        text:"Do you have new numbness or tingling between your legs, around your bottom, or in your genitals (the area you would sit on a saddle)?"},
      {id:"rf-bladder", tier:"emergency", group:"cauda", why:"Possible cauda equina syndrome",
        text:"Have you had new trouble starting to pass urine, not being able to feel when your bladder is full, leaking urine, or losing control of your bowels?"},
      {id:"rf-legs", tier:"emergency", why:"Possible cauda equina syndrome or severe nerve compression",
        text:"In the last few days, has your leg pain spread to both legs, or has weakness in your leg or foot been getting quickly worse?"},
      {id:"rf-aaa", tier:"emergency", group:"aaa", why:"Possible leaking abdominal aortic aneurysm (higher risk over 60 and in smokers)",
        text:"Do you have a sudden, severe pain in your back or tummy, with a pulsing feeling in your tummy, or feeling faint or sweaty?"},
      {id:"rf-fracture", tier:"emergency", group:"fracture", why:"Possible spinal fracture",
        text:"Did this start in the last few days after a car crash, a fall from a height, or landing hard on your feet or bottom?"},
      {id:"rf-cancer", tier:"urgent", group:"cancer", why:"Cancer can spread to the spine",
        text:"Have you ever had cancer, and is this a new back pain?"},
      {id:"rf-osteo", tier:"urgent", group:"osteo", why:"Possible osteoporotic fracture of the spine",
        text:"Did the pain start suddenly after a minor strain, cough, or lift, and you have osteoporosis, take long-term steroid tablets, or are over 70?"},
      {id:"rf-infection", tier:"urgent", group:"infection", why:"Possible spinal infection",
        text:"Do you have a fever or chills with the back pain, or a weakened immune system, or have you injected drugs?"},
      {id:"rf-footdrop", tier:"urgent", why:"Nerve weakness (foot drop) needs medical review",
        text:"Is your foot slapping down or your toes catching when you walk, even if it is not getting worse?"},
      {id:"rf-kidney", tier:"urgent", group:"kidney", why:"Possible kidney stone or kidney infection",
        text:"Does the pain come in waves from your side to your groin, or come with a fever, burning when you pass urine, or blood in your urine?"},
      {id:"rf-spondy", tier:"urgent", why:"Possible stress fracture of the spine (spondylolysis); needs imaging",
        text:"Are you under 20, and does it hurt to arch your back, especially with sport such as gymnastics, dance, cricket bowling, or tennis?"},
      {id:"rf-pelvic", tier:"urgent", group:"pelvic", why:"Pelvic organ and prostate problems can be felt in the low back",
        text:"Is the pain linked to your periods, or do you have unusual vaginal bleeding, or (for men) new trouble passing urine?"}
    ],
    context:[
      {id:"age", text:"Your age?", options:[
        {id:"u18", label:"Under 18"},
        {id:"18-29", label:"18 to 29"},
        {id:"30-49", label:"30 to 49"},
        {id:"50-64", label:"50 to 64"},
        {id:"o64", label:"65 or over"}
      ]},
      {id:"onset", text:"How did it start?", options:[
        {id:"gradual", label:"Gradually, no clear reason"},
        {id:"lift", label:"After lifting or bending"},
        {id:"twist", label:"After a twist or sudden movement"},
        {id:"fall", label:"After a fall"},
        {id:"sitting", label:"After long periods sitting or driving"},
        {id:"pregnancy", label:"During or after pregnancy"}
      ]},
      {id:"duration", text:"How long has it been going on?", options:[
        {id:"d2w", label:"Less than 2 weeks"},
        {id:"d6w", label:"2 to 6 weeks"},
        {id:"d3m", label:"6 weeks to 3 months"},
        {id:"o3m", label:"More than 3 months"}
      ]}
    ],
    questions:[
      // Asked first: questions 2, 3 and 5 depend on how far it goes.
      {id:"L1", text:"How far does the pain go?", priority: () => true, options:[
        {id:"back", label:"Low back only"},
        {id:"buttock", label:"Into the buttock"},
        {id:"thigh", label:"Down the thigh, stopping above the knee"},
        {id:"belowknee", label:"Below the knee, into the leg or foot"},
        {id:"front", label:"Front of the thigh or groin"}
      ]},
      {id:"L2", text:"Which is worse?",
        askIf: ({ ra }) => [].concat(ra.L1 || []).some((o) => o === "thigh" || o === "belowknee" || o === "front"),
        options:[
          {id:"back", label:"The back pain"},
          {id:"leg", label:"The leg pain"},
          {id:"same", label:"About the same"}
        ]},
      {id:"L3", text:"Which of these do you notice in the leg? Tick all that apply.",
        askIf: ({ ra }) => [].concat(ra.L1 || []).includes("belowknee"),
        options:[
          {id:"pins", label:"Pins and needles or numbness in the foot or toes"},
          {id:"cough", label:"Shooting pain down the leg when I cough or sneeze"},
          {id:"bendsit", label:"The leg pain is worse when I bend forward or sit"},
          {id:"none", label:"None of these"}
        ]},
      {id:"L4", text:"Which of these bring it on? Tick all that apply.", options:[
        {id:"bendsit", label:"Bending forward, or sitting"},
        {id:"arch", label:"Arching back, or standing for a long time"},
        {id:"twist", label:"Twisting"},
        {id:"getup", label:"Getting up after sitting or lying"},
        {id:"roll", label:"Rolling over in bed, or standing on one leg"}
      ]},
      {id:"L5", text:"What happens when you walk?",
        askIf: ({ ra }) => ra.age === "50-64" || ra.age === "o64" || [].concat(ra.L1 || []).includes("belowknee"),
        options:[
          {id:"eases", label:"Walking eases it"},
          {id:"claud", label:"Walking brings on leg pain, heaviness, or tingling that eases when I sit or bend forward"},
          {id:"backworse", label:"Walking makes my back worse, but not my legs"},
          {id:"nochange", label:"Walking does not change it"}
        ]},
      {id:"L6", text:"If you point to the worst spot with one finger, where is it?", options:[
        {id:"centre", label:"In the middle of the low back, on the spine"},
        {id:"side", label:"On one side, beside the spine above the belt line"},
        {id:"dimple", label:"Over the dimple at the back of my pelvis", special:"sijSource"},
        {id:"wide", label:"Spread over a wide area; I cannot point to one spot"}
      ]},
      {id:"L7", text:"Which of these apply? Tick all that apply.", options:[
        {id:"catch", label:"My back catches or gives way with small movements"},
        {id:"thighs", label:"I push on my thighs to stand up straight after bending"},
        {id:"flares", label:"I get frequent flare-ups from small movements"},
        {id:"stiff", label:"It feels stiff rather than weak"},
        {id:"none", label:"None of these"}
      ]},
      {id:"L8", text:"Which of these do you do regularly? Tick all that apply.", options:[
        {id:"arching", label:"Sport with a lot of arching back (gymnastics, dance, fast bowling, tennis)"},
        {id:"heavy", label:"Heavy lifting at work or the gym"},
        {id:"sitting", label:"Sitting most of the day"},
        {id:"driving", label:"Driving long distances"},
        {id:"none", label:"None of these"}
      ]}
    ],
    conditions:[]
  },

  shoulder: {
    name:"Shoulder",
    redFlags:[
      {id:"rf-cardiac1", text:"Chest pain or pressure, or shoulder/arm pain that comes on with exertion and eases with rest", tier:"emergency"},
      {id:"rf-cardiac2", text:"Shoulder pain together with breathlessness, sweating, or nausea", tier:"emergency"},
      {id:"rf-deform", text:"The shoulder looks visibly deformed or out of place after an injury", tier:"urgent"},
      {id:"rf-hotjoint", text:"The joint is hot, swollen and very painful, and you feel feverish or unwell", tier:"urgent"},
      {id:"rf-nolift", text:"Since a fall or injury, you suddenly cannot lift the arm at all", tier:"urgent"}
    ],
    context:[
      {id:"age", text:"Your age?", options:[
        {id:"u35", label:"Under 35"},
        {id:"35-60", label:"35 – 60"},
        {id:"o60", label:"Over 60"}
      ]},
      {id:"onset", text:"How did it start?", options:[
        {id:"injury", label:"A specific injury or fall", weights:{rc:1, instability:1}},
        {id:"gradual", label:"Gradually, no clear cause", weights:{frozen:1, rc:1}},
        {id:"activity", label:"After new or increased activity (painting, gym, gardening…)", weights:{rc:2}},
        {id:"ns", label:"Not sure"}
      ]},
      {id:"duration", text:"How long has it been going on?", options:[
        {id:"d2w", label:"Less than 2 weeks"},
        {id:"d6w", label:"2 – 6 weeks"},
        {id:"d3m", label:"6 weeks – 3 months"},
        {id:"o3m", label:"More than 3 months"}
      ]}
    ],
    questions:[
      {id:"S1", text:"Where exactly do you feel it?", options:[
        {id:"outer", label:"Outer upper arm — hard to point to one exact spot", weights:{rc:3}},
        {id:"top", label:"Right on top, at the bony point of the shoulder", weights:{acj:3}},
        {id:"deep", label:"Deep inside / all over the shoulder", weights:{frozen:2}},
        {id:"blade", label:"Between the neck and shoulder blade", weights:{neckref:3}},
        // Rotator-cuff pain stays in the upper arm; pain carrying on past the
        // elbow is the neck-referred pattern ("Symptoms spread down the arm").
        {id:"downarm", label:"Down the arm, past the elbow — sometimes with tingling", weights:{neckref:3}},
        {id:"ns", label:"Not sure"}
      ]},
      {id:"S2", text:"Which movements are worst?", options:[
        {id:"reachup", label:"Reaching up or out — a painful arc partway up", weights:{rc:3}},
        {id:"across", label:"Reaching across the chest to the other shoulder", weights:{acj:3}},
        {id:"allstiff", label:"Everything is stiff in all directions — even someone else can't move it further", weights:{frozen:3}},
        {id:"headturn", label:"Turning or tilting my head brings it on", weights:{neckref:3}},
        {id:"ns", label:"Not sure"}
      ]},
      {id:"S3", text:"Is it painful to lie on that shoulder at night?", options:[
        {id:"yes", label:"Yes", weights:{rc:2, frozen:2}},
        {id:"no", label:"No"},
        {id:"ns", label:"Not sure"}
      ]},
      {id:"S4", text:"Does the shoulder ever feel unstable or like it slips — or have you dislocated it before?", options:[
        {id:"yes", label:"Yes", weights:{instability:3}, unlocks:"instability"},
        {id:"no", label:"No", weights:{instability:-2}},
        {id:"ns", label:"Not sure"}
      ]},
      {id:"S5", text:"Have you clearly lost the ability to reach behind you (back pocket, bra strap, tucking a shirt)?", options:[
        {id:"marked", label:"Yes, noticeably", weights:{frozen:3}},
        {id:"no", label:"No"},
        {id:"ns", label:"Not sure"}
      ]}
    ],
    conditions:[
      {id:"rc", name:"Rotator-cuff-related shoulder pain", clin:"includes subacromial shoulder pain",
        blurb:"The most common shoulder problem: the tendons that lift and steady the arm become sensitive to load, often after a spike in activity. Pain is typically felt in the outer upper arm when reaching.",
        noticed:["Painful arc when lifting the arm up or out","Pain in the outer upper arm rather than the joint itself","Night pain when lying on that side"],
        homeCare:["Keep using the arm within tolerable comfort — total rest slows recovery","Temporarily reduce (not stop) overhead activity","Try supported reaching: slide the hand up a wall or table","Sleep with a pillow supporting the arm"],
        seePhysioIf:["It isn't clearly improving after ~2 weeks","Reaching, dressing, or sleep stay limited","You want a graded strengthening plan — the treatment with the best evidence"]},
      {id:"frozen", name:"Frozen shoulder", clin:"adhesive capsulitis", gates:{ages:["35-60","o60"]},
        blurb:"The capsule around the shoulder joint tightens, causing pain then marked stiffness in all directions. It's most common between 40 and 65, and more common with diabetes or thyroid conditions. It does improve, but on a long timescale — physiotherapy can help shorten the stiff phase and keep you functional.",
        noticed:["Stiffness in every direction — others can't move it further either","Losing outward reach (back pocket, seat-belt, bra strap) early on","Often significant night pain in the early phase"],
        homeCare:["Move within tolerable limits — gentle pendulum and wall-slide movements","Heat before movement can ease things","Pace tasks; adapt rather than force through sharp pain"],
        seePhysioIf:["Stiffness is progressing or already limits daily tasks","You have diabetes or a thyroid condition with new shoulder stiffness","You'd like a staged plan matched to the phase you're in"]},
      {id:"acj", name:"Acromioclavicular (AC) joint pain", clin:"the joint at the very top of the shoulder",
        blurb:"The small joint where the collarbone meets the shoulder blade can be sprained by a fall onto the shoulder or irritated by load (bench press, dips). Pain sits right on the bony point at the top.",
        noticed:["Pointable pain on the very top of the shoulder","Worse reaching across the body or lying on it","Sometimes a small bump over the joint"],
        homeCare:["Reduce cross-body and heavy pressing movements for now","Ice or heat over the point of pain for comfort","Keep the rest of the shoulder moving normally"],
        seePhysioIf:["Pain persists past ~2–3 weeks","There's a visible step or bump after an injury","You want a graded return to gym or sport"]},
      {id:"instability", name:"Shoulder instability", clin:"laxity or recurrent subluxation", gates:{ages:["u35"], unlockedBy:"instability"},
        blurb:"The shoulder feels loose, slips, or has dislocated — most common in younger, active people. Strengthening the muscles that steady the joint is the first-line approach.",
        noticed:["A sense of slipping or apprehension in certain positions (often reaching up-and-out)","A previous dislocation or 'dead arm' moments","Clicking with a feeling of looseness"],
        homeCare:["Avoid the specific positions that feel apprehensive for now","Keep general shoulder strength work within confident range","Don't repeatedly 'test' the slip"],
        seePhysioIf:["It has slipped or dislocated before — a structured strengthening program is first-line care","Apprehension limits sport or work","You want assessment before returning to overhead or contact sport"]},
      {id:"neckref", name:"Neck-referred pain", clin:"cervical referral",
        blurb:"Shoulder-area pain sometimes tells a neck story: irritation of neck joints or nerves can be felt between the neck and shoulder blade or down the arm, even when the shoulder itself is healthy.",
        noticed:["Turning or tilting the head changes the symptoms","Pain sits between the neck and shoulder blade","The shoulder itself moves fairly freely"],
        homeCare:["Gentle neck range-of-motion movements several times daily","Check desk and pillow setup","Short breaks from prolonged screen postures"],
        seePhysioIf:["Your shoulder may be telling a neck story — an assessment can tell them apart","Symptoms spread down the arm or include tingling","It persists beyond ~2 weeks"]}
    ]
  },

  knee: {
    name:"Knee",
    redFlags:[
      {id:"rf-4steps", text:"Since an injury, you cannot take four steps in a row (it won't take your weight)", tier:"urgent"},
      {id:"rf-popswell", text:"The knee gave way with a pop during an injury and swelled up within an hour or two", tier:"urgent"},
      {id:"rf-hotknee", text:"The knee is hot, red and swollen, and you feel feverish or unwell", tier:"urgent"},
      {id:"rf-calf", text:"Your calf is swollen, warm, and tender compared to the other side", tier:"urgent"}
    ],
    context:[
      {id:"age", text:"Your age?", options:[
        {id:"u30", label:"Under 30", weights:{pfp:1}},
        {id:"30-50", label:"30 – 50"},
        {id:"o50", label:"Over 50", weights:{oa:2}}
      ]},
      {id:"onset", text:"How did it start?", options:[
        {id:"twist", label:"A twist, pivot, or impact injury", weights:{ligament:2, meniscus:2}},
        {id:"gradual", label:"Gradually, no clear cause", weights:{pfp:1, oa:1}},
        {id:"activity", label:"After increasing running, jumping, or hiking", weights:{pt:2, itb:2, pfp:1}},
        {id:"ns", label:"Not sure"}
      ]},
      {id:"duration", text:"How long has it been going on?", options:[
        {id:"d2w", label:"Less than 2 weeks"},
        {id:"d6w", label:"2 – 6 weeks"},
        {id:"d3m", label:"6 weeks – 3 months"},
        {id:"o3m", label:"More than 3 months"}
      ]}
    ],
    questions:[
      {id:"K1", text:"Where do you feel it most?", options:[
        {id:"front", label:"Front — behind or around the kneecap", weights:{pfp:3}},
        // Inner and outer are separate options: the inner and outer knee
        // ligament sprains point at one side each, and a single "inner or outer"
        // option left the two tied on every answer.
        {id:"innerline", label:"The inner side, along the joint line", weights:{meniscus:2, oa:2}},
        {id:"outerline", label:"The outer side, along the joint line", weights:{meniscus:2, oa:2}},
        {id:"belowcap", label:"Just below the kneecap, on the tendon", weights:{pt:3}},
        {id:"outside", label:"Outside of the knee, slightly above the joint", weights:{itb:3}},
        {id:"back", label:"The back of the knee"},
        {id:"whole", label:"The whole knee — hard to localize", weights:{oa:1}},
        {id:"ns", label:"Not sure"}
      ]},
      {id:"K2", text:"Which activities are worst?", options:[
        {id:"stairs", label:"Stairs (especially down) and prolonged sitting", weights:{pfp:3}},
        {id:"squat", label:"Squatting, twisting, or pivoting", weights:{meniscus:3}},
        {id:"firststeps", label:"First steps after rest — better once moving", weights:{oa:2}},
        {id:"jumping", label:"Jumping, landing, or sprinting", weights:{pt:3}},
        {id:"longruns", label:"Long runs — starts at a predictable distance", weights:{itb:3}},
        {id:"ns", label:"Not sure"}
      ]},
      {id:"K3", text:"Any of these mechanical symptoms?", options:[
        {id:"locking", label:"True locking — it gets stuck and I must wiggle it free", weights:{meniscus:3}},
        {id:"givingway", label:"Giving way / buckling since an injury", weights:{ligament:3}},
        {id:"kneecap", label:"The kneecap shifted or popped out to the side"},
        {id:"click", label:"Clicking without pain", special:"click"},
        {id:"none", label:"None of these"}
      ]},
      {id:"K4", text:"What about swelling?", options:[
        {id:"fast", label:"It swelled within 1–2 hours of an injury", weights:{ligament:3}},
        {id:"nextday", label:"Mild swelling the day after activity or injury", weights:{meniscus:2}},
        {id:"puffy", label:"Intermittent puffiness after activity", weights:{oa:2}},
        {id:"none", label:"No swelling", weights:{ligament:-2}}
      ]},
      {id:"K5", text:"Morning stiffness in the knee?", options:[
        {id:"fewmin", label:"A few minutes of stiffness, then it loosens", weights:{oa:3}},
        {id:"none", label:"No"},
        {id:"ns", label:"Not sure"}
      ]}
    ],
    conditions:[
      {id:"pfp", name:"Patellofemoral pain", clin:"kneecap-related pain",
        blurb:"Pain from the joint between the kneecap and thigh bone, usually when it's asked to handle more load than it's currently conditioned for. Very common in active people and very treatable with graded strength work.",
        noticed:["Ache behind or around the kneecap","Worse on stairs (especially down), squatting, or after long sitting ('movie-goer's knee')","Usually no significant swelling"],
        homeCare:["Trim (don't stop) the aggravating dose — fewer flights, shorter runs, then rebuild","Hip and thigh strengthening within comfort","Avoid prolonged deep knee bend positions while irritable"],
        seePhysioIf:["It's not settling after ~2 weeks of load management","It limits sport, stairs, or work","You'd like a graded strengthening plan — the best-evidenced treatment"]},
      {id:"oa", name:"Knee osteoarthritis pattern", clin:"age-related joint change — often painless on scans", gates:{ages:["30-50","o50"]},
        blurb:"A gradual change in the joint's cartilage and bone, common from midlife onward. Important: exercise is proven treatment, not a threat — stronger legs mean less pain, and activity does not 'wear the knee out'.",
        noticed:["Aching with first steps after rest, easing as you get going","Brief morning stiffness (minutes, not hours)","Intermittent puffiness after busier days"],
        homeCare:["Regular strength work for thighs and hips — the single best-evidenced treatment","Keep walking or cycling; motion is lotion","Weight management where relevant makes a measurable difference","Heat for stiffness, brief ice for flare-ups"],
        seePhysioIf:["Pain or stiffness limits walking, stairs, or sleep","You'd like a structured program (e.g., GLA:D-style) with proven outcomes","You're weighing options and want conservative care optimized first"]},
      {id:"meniscus", name:"Meniscal irritation pattern", clin:"meniscus tear or irritation",
        blurb:"The knee's cartilage shock-absorbers can be irritated by twisting, deep squatting, or gradual change with age. Many meniscal problems do well without surgery, with strength and movement retraining.",
        noticed:["Pain along the joint line, worse twisting or squatting","Catching, or true locking in some cases","Swelling that appears the day after activity"],
        homeCare:["Avoid deep squats and forceful pivoting while irritable","Keep straight-line walking and cycling going","Gentle range-of-motion work within comfort"],
        seePhysioIf:["Joint-line pain persists beyond ~2 weeks","There's catching or locking","You want a rehab-first plan — outcomes rival surgery for many age-related tears"]},
      {id:"ligament", name:"Ligament sprain pattern", clin:"e.g., MCL or ACL injury", gates:{requiresOnset:["twist"]},
        blurb:"An injury that stretches or tears one of the knee's stabilizing ligaments — typically from a twist, pivot, or impact. Rapid swelling and a feeling of instability are the key signals that it should be assessed.",
        noticed:["A specific injury moment, sometimes with a pop","Swelling — rapid swelling suggests a more significant injury","Giving way or a sense of not trusting the knee"],
        homeCare:["Relative rest, ice, compression, elevation in the first days","Keep gentle range of motion within comfort","Avoid pivoting sports until assessed"],
        seePhysioIf:["Any injury with rapid swelling or giving way deserves assessment","You want a guided return to sport or work","Instability persists after the initial phase"]},
      {id:"pt", name:"Patellar tendinopathy", clin:"jumper's knee",
        blurb:"The tendon just below the kneecap can become sensitive when jumping, landing, or sprinting loads rise faster than the tendon adapts. Classic in jumping sports and running.",
        noticed:["Pointable pain on the tendon just below the kneecap","Worse with jumping, landing, stairs, or sprinting","Often warms up during activity, then aches after"],
        homeCare:["Manage the spike: reduce jump/sprint volume, keep strength work","Isometric holds (e.g., wall sit within comfort) can ease pain short-term","Avoid complete rest — tendons adapt to load, not to rest"],
        seePhysioIf:["Pain persists or returns each session","You want a staged tendon-loading program — the core of good care","It's affecting performance or daily stairs"]},
      {id:"itb", name:"Iliotibial band syndrome", clin:"ITB / runner's knee (outer)",
        blurb:"Irritation where the long band on the outside of the thigh crosses the knee — classically in runners and cyclists, starting at a predictable distance into a session.",
        noticed:["Sharp or burning pain on the outside of the knee","Starts at a predictable point in a run or ride","Settles with rest, returns with the same dose"],
        homeCare:["Temporarily shorten sessions to below the symptom threshold","Check for sudden increases in mileage, hills, or camber","Hip strength work within comfort"],
        seePhysioIf:["It recurs at the same distance despite adjustments","You'd like a running-load and strength plan","Pain starts appearing in daily activities too"]}
    ]
  }
};

export const COMING_SOON = ["Head & jaw","Neck & upper back","Elbow & forearm","Wrist & hand","Hip & groin","Ankle & shin","Foot & heel"];

/* Shared "pain character" questions asked for every region (on the context
   screen). No condition weights — these feed the PAIN-TYPE classifier only
   (Jones & Rivett Ch.2: nociceptive vs neuropathic vs nociplastic patterns).
   Kept light and educational — this is not a psychological screen. */
export const PAIN_CHARACTER = [
  {id:"pc_spread", text:"Where is the pain overall?", options:[
    {id:"one", label:"Just this one area"},
    {id:"nearby", label:"This area, spreading nearby"},
    {id:"multiple", label:"Several separate parts of my body"}
  ]},
  {id:"pc_quality", text:"How does it feel? (choose any that fit)", multi:true, options:[
    {id:"ache", label:"Dull ache or stiffness"},
    {id:"mech", label:"Sharp with certain movements"},
    {id:"burn", label:"Burning, shooting or electric"},
    {id:"nervy", label:"Pins & needles or numbness"}
  ]}
];
export const PERSISTENT = ["o3m","years"];         // strongly persistent (>~3 months)
export const SUBACUTE   = ["d3m","d6w","d6m"];

// Pain-type reasoning (educational patterns, never a diagnosis)
export function classifyPainType(answers){
  const a = answers;
  const spread = a["pc_spread"];
  const qual = Array.isArray(a["pc_quality"]) ? a["pc_quality"] : [];
  const dur = a["duration"];
  const persistent = PERSISTENT.includes(dur);
  const neuropathic = qual.includes("burn") || qual.includes("nervy");
  // nociplastic / central-sensitisation pattern: widespread + persistent
  // (Nijs: pain diffusely distributed + disproportionate/persisting)
  const nociplastic = spread==="multiple" && (persistent || SUBACUTE.includes(dur));
  return {neuropathic, nociplastic, persistent};
}

export const SPECIAL_CARDS = {
  inflammatory: {title:"A time-pattern worth mentioning to your doctor",
    body:"Morning stiffness lasting well over 30–60 minutes that improves with exercise — especially in younger adults and when it's gone on for months — is a pattern sometimes seen with <strong>inflammatory back pain</strong>. That's a medical question worth raising with your family doctor. It doesn't mean anything is confirmed; it's simply a pattern that deserves a proper check."},
  click: {title:"About painless clicking",
    body:"Clicking or popping <strong>without pain or swelling</strong> is common in healthy knees and is usually not a sign of damage. No action is needed for painless clicking on its own."}
};

/* ---------------- ENGINE ---------------- */
let state = null;


/* ─────────────────────────────────────────────────────────────────────────
   Pure scoring/adaptive engine — ported 1:1 from the standalone guide,
   refactored to take (region, answers) explicitly instead of global state.
   ───────────────────────────────────────────────────────────────────────── */

export function allQuestions(region) { return region.context.concat(region.questions) }

export function computeRaw(region, answers) {
  const scores = {}, unlocks = {}, specials = []
  region.conditions.forEach(c => { scores[c.id] = 0 })
  allQuestions(region).forEach(q => {
    const a = answers[q.id]
    if (a === undefined) return
    const ids = Array.isArray(a) ? a : [a]
    ids.forEach(oid => {
      const opt = q.options.find(o => o.id === oid)
      if (!opt) return
      if (opt.weights) Object.entries(opt.weights).forEach(([cid, w]) => { scores[cid] = (scores[cid] || 0) + w })
      if (opt.unlocks) unlocks[opt.unlocks] = true
      if (opt.special && !specials.includes(opt.special)) specials.push(opt.special)
    })
  })
  return { scores, unlocks, specials }
}

function bestFromQuestion(q, cid) {
  if (q.multi) {
    let sum = 0
    q.options.forEach(o => { if (o.weights && o.weights[cid] > 0) sum += o.weights[cid] })
    return sum
  }
  let best = 0
  q.options.forEach(o => { if (o.weights && o.weights[cid] > best) best = o.weights[cid] })
  return best
}

const maxScoreCache = new Map()
export function maxScores(region) {
  if (maxScoreCache.has(region)) return maxScoreCache.get(region)
  const m = {}
  region.conditions.forEach(c => {
    let t = 0
    allQuestions(region).forEach(q => { t += bestFromQuestion(q, c.id) })
    m[c.id] = t || 1
  })
  maxScoreCache.set(region, m)
  return m
}

function remainingMax(region, answers) {
  const rem = {}
  region.conditions.forEach(c => { rem[c.id] = 0 })
  allQuestions(region).forEach(q => {
    if (answers[q.id] !== undefined) return
    region.conditions.forEach(c => { rem[c.id] += bestFromQuestion(q, c.id) })
  })
  return rem
}

function eligibleNow(c, unlocks, answers) {
  const g = c.gates || {}
  if (g.unlockedBy && unlocks[g.unlockedBy]) return true
  const age = answers['age'], onset = answers['onset']
  if (g.ages && age && !g.ages.includes(age)) return false
  if (g.requiresOnset && onset && !g.requiresOnset.includes(onset)) return false
  return true
}

function possiblyEligible(c, unlocks, region, answers) {
  if (eligibleNow(c, unlocks, answers)) return true
  const g = c.gates || {}
  if (g.unlockedBy) {
    return allQuestions(region).some(q => answers[q.id] === undefined &&
      q.options.some(o => o.unlocks === g.unlockedBy))
  }
  return false
}

export function meetsThreshold(score, max) { return score >= 3 && score / max >= 0.4 }

function canQualify(c, scores, rem, maxS, unlocks, region, answers) {
  if (!possiblyEligible(c, unlocks, region, answers)) return false
  return meetsThreshold((scores[c.id] || 0) + (rem[c.id] || 0), maxS[c.id])
}

export function isRelevant(q, region, answers) {
  const { scores, unlocks } = computeRaw(region, answers)
  const rem = remainingMax(region, answers), maxS = maxScores(region)
  return q.options.some(o => {
    if (o.special) return true
    if (o.unlocks) {
      const target = region.conditions.find(c => (c.gates || {}).unlockedBy === o.unlocks)
      if (target && meetsThreshold((scores[target.id] || 0) + (rem[target.id] || 0), maxS[target.id])) return true
    }
    if (o.weights) return Object.keys(o.weights).some(cid => {
      const c = region.conditions.find(x => x.id === cid)
      return c && canQualify(c, scores, rem, maxS, unlocks, region, answers)
    })
    return false
  })
}

/* How much a question can still move the result: for every condition that can
   still qualify, the share of its ceiling this question could add. Questions
   whose options point at many live conditions (usually "where is it?") score
   highest, so asking the most useful question next reaches an answer in far
   fewer questions than going through a region's list in order. */
export function questionValue(q, region, answers) {
  const { scores, unlocks } = computeRaw(region, answers)
  const rem = remainingMax(region, answers), maxS = maxScores(region)
  let v = 0
  for (const c of region.conditions) {
    if (!canQualify(c, scores, rem, maxS, unlocks, region, answers)) continue
    v += bestFromQuestion(q, c.id) / maxS[c.id]
  }
  return v
}

export function answeredRegionCount(region, answers) {
  return region.questions.filter(q => {
    const a = answers[q.id]
    return a !== undefined && a !== '__skip' && !(Array.isArray(a) && a.length === 0)
  }).length
}

/* Ranking. A plain percentage (score / max) let a condition that can only
   ever score 3 reach 100% from a single "yes" and outrank a well-matched
   condition at 90% — e.g. one click put "snapping hip" above hip impingement.
   RANK_PRIOR adds a few points of doubt to every ceiling, so a match backed by
   more of the answers ranks higher; exact ties go to the condition that
   matched more evidence. It only ORDERS conditions — whether one is shown at
   all is still meetsThreshold(). Tuned with scripts/check-accuracy.mjs: 4 is
   the smallest value that gets every textbook case right and the most cases
   right when one telltale answer is missed. */
export const RANK_PRIOR = 4
export function rankValue(score, max) { return score / (max + RANK_PRIOR) }

export function shouldStop(region, answers) {
  const { scores, unlocks } = computeRaw(region, answers)
  const rem = remainingMax(region, answers), maxS = maxScores(region)
  const conds = region.conditions.filter(c => possiblyEligible(c, unlocks, region, answers))
  const qualified = conds.filter(c => eligibleNow(c, unlocks, answers) && meetsThreshold(scores[c.id] || 0, maxS[c.id]))
  if (!qualified.length) return false
  // Same ordering as computeResults(), or the questions could stop while a
  // rival that would finally be shown first is still catching up.
  const rankOf = (c) => rankValue(scores[c.id] || 0, maxS[c.id])
  const leader = qualified.reduce((a, b) => (rankOf(a) >= rankOf(b) ? a : b))
  const rankL = rankOf(leader)
  for (const c of conds) {
    if (c === leader) continue
    const pot = (scores[c.id] || 0) + (rem[c.id] || 0)
    if (!qualified.includes(c)) {
      if (meetsThreshold(pot, maxS[c.id])) return false
    } else {
      if (rankValue(pot, maxS[c.id]) >= rankL) return false
    }
  }
  return true
}

export function computeResults(region, answers) {
  const { scores, unlocks, specials } = computeRaw(region, answers)
  const maxScore = maxScores(region)
  const eligible = region.conditions.filter(c => eligibleNow(c, unlocks, answers))
  const ranked = eligible
    .map(c => {
      const score = scores[c.id] || 0
      return { c, score, norm: score / maxScore[c.id], rank: rankValue(score, maxScore[c.id]) }
    })
    .filter(x => meetsThreshold(x.score, maxScore[x.c.id]))
    .sort((a, b) => b.rank - a.rank || b.score - a.score)
    .slice(0, 3)
  return { ranked, specials }
}

// Map pain-mapper zone types → guide region keys (only built regions listed)
export const ZONE_TO_REGION = {
  lowerback: 'lowback',
  shoulder: 'shoulder',
  knee: 'knee',
}

/* ── Merge in the extra regions authored from Chandra's document library ── */
import { EXTRA_REGIONS, EXTRA_SPECIAL_CARDS } from './symptomGuideExtra.js'
/* ── Conditions authored as Markdown in content/conditions/ ──────────────
   Generated by `npm run import:conditions`. Each entry carries the condition
   itself AND the question-option weights that let it be reached, so the two
   halves are applied together and cannot drift apart. */
import { AUTHORED } from './symptomGuideAuthored.js'
Object.assign(REGIONS, EXTRA_REGIONS)
Object.assign(SPECIAL_CARDS, EXTRA_SPECIAL_CARDS)

/* ── Every diagnostic question accepts multiple answers ─────────────────
   Pain rarely has a single aggravating factor, so the questions after the
   opening details let people tick everything that applies. This flag is read
   by BOTH the UI and maxScores(): a multi question's ceiling is the sum of its
   positive weights rather than its single best, so scores stay correctly
   normalised when someone selects several options. The opening context
   questions stay single-answer — nobody has two ages. */
for (const r of Object.values(REGIONS)) {
  for (const q of r.questions) q.multi = true
}

for (const entry of AUTHORED) {
  const region = REGIONS[entry.region]
  if (!region) continue
  if (!region.conditions.some((c) => c.id === entry.cond.id)) region.conditions.push(entry.cond)
  for (const p of entry.resolved) {
    const q = region.context.concat(region.questions).find((x) => x.id === p.qid)
    const o = q && q.options.find((x) => x.id === p.oid)
    if (o) o.weights = { ...(o.weights || {}), [entry.cond.id]: p.weight }
  }
}
Object.assign(ZONE_TO_REGION, {
  neck: 'neck',
  ctj: 'ctj',
  upperback: 'upperback',
  // The front of the chest (costochondritis) is asked the mid-back questions.
  chest: 'upperback',
  tlj: 'tlj',
  flank: 'tlj',
  sij: 'sij',
  coccyx: 'coccyx',
  elbow: 'elbow',
  wrist: 'wrist',
  hip: 'hip',
  ankle: 'ankle',
})
