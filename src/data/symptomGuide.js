export const GENERAL_RED_FLAGS = [
  {id:"grf-fever", text:"Fever, chills, or feeling generally unwell alongside this pain", tier:"urgent"},
  {id:"grf-weight", text:"Unexplained weight loss over recent months", tier:"urgent"},
  {id:"grf-cancer", text:"A history of cancer, and this is a new or changing pain", tier:"urgent"},
  {id:"grf-night", text:"Constant pain that doesn't change with position or rest and wakes you every night", tier:"urgent"},
  {id:"grf-trauma", text:"A significant accident (fall from height, vehicle collision) — or any fall if you're 65+ or have osteoporosis", tier:"urgent"}
];

export const REGIONS = {
  lowback: {
    name:"Low back & pelvis",
    redFlags:[
      {id:"rf-saddle", text:"New numbness or tingling around the groin, genitals, or inner thighs (the 'saddle' area)", tier:"emergency"},
      {id:"rf-bladder", text:"New difficulty starting urination, or loss of bladder or bowel control", tier:"emergency"},
      {id:"rf-legs", text:"Weakness in both legs, or leg weakness that is getting worse", tier:"emergency"},
      {id:"rf-first55", text:"First-ever episode of severe back pain and you're over 55", tier:"urgent"}
    ],
    context:[
      {id:"age", text:"Your age?", options:[
        {id:"u30", label:"Under 30"},
        {id:"30-50", label:"30 – 50"},
        {id:"o50", label:"Over 50", weights:{stenosis:1}}
      ]},
      {id:"onset", text:"How did it start?", options:[
        {id:"lifting", label:"Lifting or an awkward movement", weights:{nslbp:2, facet:1}},
        {id:"gradual", label:"Gradually, no clear cause", weights:{nslbp:1}},
        {id:"activity", label:"After unusual or increased activity", weights:{nslbp:2}},
        {id:"woke", label:"Woke up with it", weights:{nslbp:1, facet:1}},
        {id:"ns", label:"Not sure"}
      ]},
      {id:"duration", text:"How long has it been going on?", options:[
        {id:"d2w", label:"Less than 2 weeks"},
        {id:"d6w", label:"2 – 6 weeks"},
        {id:"d6m", label:"More than 6 weeks"},
        {id:"years", label:"Comes and goes over years"}
      ]}
    ],
    questions:[
      {id:"L1", text:"Where do you feel it most?", options:[
        {id:"oneside", label:"One side of the lower back", weights:{facet:2, sij:1}},
        {id:"across", label:"Across the whole lower back", weights:{nslbp:2}},
        {id:"buttleg", label:"Buttock and down the back of the leg, below the knee", weights:{radicular:3}},
        {id:"dimple", label:"One buttock, near the dimple at the back of the pelvis", weights:{sij:3}},
        {id:"ns", label:"Not sure"}
      ]},
      {id:"L2", text:"Does anything travel down your leg?", options:[
        {id:"belowknee", label:"Pain below the knee", weights:{radicular:3}},
        {id:"pins", label:"Pins & needles or numbness into the foot", weights:{radicular:3}},
        {id:"thigh", label:"An ache into the thigh only", weights:{nslbp:1, facet:1}},
        {id:"none", label:"No", weights:{radicular:-2}},
        {id:"ns", label:"Not sure"}
      ]},
      {id:"L3", text:"What makes it worse? (choose all that apply)", multi:true, options:[
        {id:"bendsit", label:"Bending forward or sitting", weights:{radicular:2, nslbp:1}},
        {id:"arch", label:"Arching back or standing for long", weights:{facet:3, stenosis:2}},
        {id:"walk", label:"Walking — but it eases when I sit or lean on a shopping cart", weights:{stenosis:3}},
        {id:"roll", label:"Rolling over in bed or standing on one leg", weights:{sij:2}}
      ]},
      {id:"L4", text:"What are mornings like?", options:[
        {id:"short", label:"Stiff for up to 30 minutes, then it eases", weights:{nslbp:1, facet:1}},
        {id:"long", label:"Stiff for well over 30–60 minutes, better with exercise", special:"inflammatory"},
        {id:"none", label:"No particular morning pattern"}
      ]},
      {id:"L5", text:"Does coughing or sneezing sharpen the leg symptoms?", options:[
        {id:"yes", label:"Yes", weights:{radicular:2}},
        {id:"no", label:"No"},
        {id:"ns", label:"Not sure"}
      ]}
    ],
    conditions:[
      {id:"nslbp", name:"Non-specific mechanical low back pain", clin:"the most common form of back pain",
        blurb:"Pain arising from the working parts of the back — joints, discs, muscles and ligaments reacting to load — without a single damaged structure to blame. It is very common, and the back remains strong.",
        noticed:["Pain that changes with position and activity","Stiffness after rest that eases with movement","Good days and bad days"],
        homeCare:["Keep moving — gentle walking several times a day beats bed rest","Use heat for comfort in the first days","Modify (don't stop) activities that flare it","Sleep positions: side-lying with a pillow between the knees often helps"],
        seePhysioIf:["It isn't clearly improving after ~2 weeks","It keeps returning","It's limiting your work, sleep, or activity"]},
      {id:"radicular", name:"Nerve-related leg pain", clin:"often called sciatica; radicular pain",
        blurb:"Irritation of a nerve as it leaves the lower spine — commonly related to a disc — which can send pain, pins & needles, or numbness down the leg. Most cases settle over weeks to a few months.",
        noticed:["Leg symptoms often bother you more than the back itself","Sitting, bending, or coughing can sharpen it","Pain, tingling, or numbness may reach the calf or foot"],
        homeCare:["Change positions often; short frequent walks","Find your direction of relief — many people ease when walking or lying down","Avoid long sitting in the early irritable phase","Keep the leg gently moving within comfort"],
        seePhysioIf:["Leg symptoms persist beyond ~1–2 weeks","Numbness or tingling isn't settling","You want a plan to stay active safely while it recovers"]},
      {id:"facet", name:"Facet joint irritation", clin:"lumbar facet (zygapophyseal) joint pain",
        blurb:"The small joints at the back of the spine can become irritated, typically causing one-sided back pain that dislikes arching backwards or long standing.",
        noticed:["One-sided low back ache","Worse arching back, standing long, or looking up overhead","Usually eases when sitting or bending slightly forward"],
        homeCare:["Gentle knees-to-chest and pelvic tilt movements","Break up long standing with brief sitting or a step stool","Heat for comfort","Short regular walks"],
        seePhysioIf:["It lingers beyond ~2 weeks","It recurs with particular activities","You'd like specific mobility and strength work for it"]},
      {id:"sij", name:"Sacroiliac joint pain", clin:"SIJ-related pain",
        blurb:"The joint between the base of the spine and the pelvis can become sensitive — often after pregnancy, a fall onto the buttock, or an uneven load — causing focal pain near the pelvic dimple.",
        noticed:["Pointable pain near the dimple at the back of the pelvis","Worse rolling in bed, standing on one leg, or climbing stairs","May spread into the buttock or groin"],
        homeCare:["Avoid prolonged single-leg loading while irritable","A support belt can help short-term in some cases","Gentle gluteal and core activation within comfort","Even, symmetrical standing habits"],
        seePhysioIf:["Pain persists more than ~2 weeks","It began after pregnancy or a fall","Walking or stairs remain limited"]},
      {id:"stenosis", name:"Spinal stenosis pattern", clin:"lumbar spinal stenosis / neurogenic claudication", gates:{ages:["o50"]},
        blurb:"With age, the passageways for the spinal nerves can narrow. The classic pattern: legs that ache, heavy or tingle with walking, easing quickly when you sit or lean forward (like on a shopping cart).",
        noticed:["Walking distance limited by leg heaviness or ache","Relief within minutes of sitting or bending forward","Often better cycling than walking"],
        homeCare:["Keep walking within your comfortable distance — little and often","Cycling or pool walking maintain fitness with less symptom","A slight forward lean (poles, cart) extends walking range"],
        seePhysioIf:["Walking distance is shrinking","You'd like a structured conditioning plan — good evidence supports exercise for this pattern","Symptoms affect balance or confidence"]}
    ]
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
        {id:"jointline", label:"Along the inner or outer joint line", weights:{meniscus:2, oa:2}},
        {id:"belowcap", label:"Just below the kneecap, on the tendon", weights:{pt:3}},
        {id:"outside", label:"Outside of the knee, slightly above the joint", weights:{itb:3}},
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

export function answeredRegionCount(region, answers) {
  return region.questions.filter(q => {
    const a = answers[q.id]
    return a !== undefined && a !== '__skip' && !(Array.isArray(a) && a.length === 0)
  }).length
}

export function shouldStop(region, answers) {
  const { scores, unlocks } = computeRaw(region, answers)
  const rem = remainingMax(region, answers), maxS = maxScores(region)
  const conds = region.conditions.filter(c => possiblyEligible(c, unlocks, region, answers))
  const qualified = conds.filter(c => eligibleNow(c, unlocks, answers) && meetsThreshold(scores[c.id] || 0, maxS[c.id]))
  if (!qualified.length) return false
  const leader = qualified.reduce((a, b) =>
    ((scores[a.id] || 0) / maxS[a.id] >= (scores[b.id] || 0) / maxS[b.id]) ? a : b)
  const normL = (scores[leader.id] || 0) / maxS[leader.id]
  for (const c of conds) {
    if (c === leader) continue
    const pot = (scores[c.id] || 0) + (rem[c.id] || 0)
    if (!qualified.includes(c)) {
      if (meetsThreshold(pot, maxS[c.id])) return false
    } else {
      if (pot / maxS[c.id] >= normL) return false
    }
  }
  return true
}

export function computeResults(region, answers) {
  const { scores, unlocks, specials } = computeRaw(region, answers)
  const maxScore = maxScores(region)
  const eligible = region.conditions.filter(c => eligibleNow(c, unlocks, answers))
  const ranked = eligible
    .map(c => ({ c, score: scores[c.id] || 0, norm: (scores[c.id] || 0) / maxScore[c.id] }))
    .filter(x => meetsThreshold(x.score, maxScore[x.c.id]))
    .sort((a, b) => b.norm - a.norm)
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
Object.assign(REGIONS, EXTRA_REGIONS)
Object.assign(SPECIAL_CARDS, EXTRA_SPECIAL_CARDS)
Object.assign(ZONE_TO_REGION, {
  neck: 'neck',
  upperback: 'upperback',
  elbow: 'elbow',
  wrist: 'wrist',
  hip: 'hip',
  ankle: 'ankle',
})
