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

  /* ══════════════ SHOULDER ══════════════
     From Chandra's "Shoulder assessment" region document (DRAFT 24 Sep 2026;
     the source text is content/regions/shoulder.md). Sources: BESS/BOA
     pathways 2015–2016, JOSPT adhesive capsulitis CPG 2013, Lewis 2016,
     Park 2005, Hegedus 2012, Chronopoulos 2004, Travell & Simons 2019,
     Giamberardino 2003.
     Reached from the shoulder, and from any upper-arm mark (./referral.js,
     IMPLIES). Its injury screen is in ./injuryScreen.js.
     Conditions: content/conditions/shoulder-*.md. Pain that comes from the
     neck shows the "may be coming from your neck" card instead. */
  shoulder: {
    name:"Shoulder",
    redFlags:[
      {id:"rf-cardiac1", tier:"emergency", group:"cardiac", why:"Heart pain is often felt in the left shoulder and inner arm",
        text:"Is the pain in your shoulder, jaw, or left arm brought on by effort, or does it come with chest tightness, shortness of breath, or sweating?"},
      {id:"srf-kehr", tier:"emergency", group:"kehr", why:"Possible bleeding from the spleen, felt at the shoulder tip (Kehr's sign)",
        text:"Did pain at the tip of your left shoulder start after a blow to your tummy or ribs, or does it come with feeling faint or dizzy?"},
      {id:"srf-ectopic", tier:"emergency", why:"Possible ectopic pregnancy: blood under the diaphragm is felt at the shoulder tip",
        text:"Could you be pregnant, and do you have pain low in your tummy along with pain at the tip of your shoulder?"},
      {id:"srf-lung", tier:"emergency", group:"lungclot", why:"Possible blood clot in the lung or a collapsed lung",
        text:"Do you have a sudden, sharp pain on breathing with shortness of breath?"},
      {id:"rf-hotjoint", tier:"emergency", why:"Possible joint infection (septic arthritis)",
        text:"Is your shoulder hot, red, or swollen, with a fever or feeling very unwell?"},
      {id:"srf-pmr", tier:"urgent", why:"Possible polymyalgia rheumatica; needs blood tests and medical care",
        text:"If you are over 50: are both shoulders (and often both hips) stiff and aching, worst in the morning for more than 45 minutes, and do you feel generally unwell?"},
      {id:"srf-pancoast", tier:"urgent", group:"pancoast", why:"Possible tumour at the top of the lung (Pancoast), felt in the shoulder and inner arm",
        text:"Do you smoke or used to smoke, and have you also had a cough that will not go away, coughed up blood, a drooping eyelid, or weakness in your hand?"},
      {id:"srf-cancer", tier:"urgent", group:"cancer", why:"Cancer can spread to the shoulder bones",
        text:"Have you ever had cancer, or is there a new lump, or pain at night that does not change with position, with weight loss?"},
      {id:"srf-gallbladder", tier:"urgent", group:"gallbladder", why:"Gallbladder or liver pain is felt in the right shoulder (C3–C5 and T7–T9)",
        text:"Is the pain at the tip of your right shoulder or under your right shoulder blade worse after fatty meals, or does it come with feeling sick or yellow skin or eyes?"},
      {id:"srf-tip", tier:"urgent", group:"tip", why:"Diaphragm or lung lining pain is felt at the shoulder tip (C3–C5)",
        text:"Is the pain at the tip of your shoulder worse when you breathe in deeply?"},
      {id:"srf-pta", tier:"urgent", group:"pta", why:"Possible nerve inflammation (neuralgic amyotrophy, Parsonage-Turner)",
        text:"Did a sudden, severe shoulder pain with no injury last several days, and then your shoulder or arm muscles became weak or thin?"}
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
        {id:"overhead", label:"After a lot of overhead work, lifting, or sport"},
        {id:"fall", label:"After a fall onto the arm or shoulder"},
        {id:"popped", label:"It popped out or slipped out of place"},
        {id:"pull", label:"After a sudden pull, lift, or jerk"},
        {id:"severe", label:"Sudden severe pain with no injury"}
      ]},
      {id:"duration", text:"How long has it been going on?", options:[
        {id:"d2w", label:"Less than 2 weeks"},
        {id:"d6w", label:"2 to 6 weeks"},
        {id:"d3m", label:"6 weeks to 3 months"},
        {id:"o3m", label:"More than 3 months"}
      ]}
    ],
    questions:[
      {id:"S1", text:"Where is the pain mainly?", options:[
        {id:"top", label:"On top of the shoulder, at the bony point"},
        {id:"outer", label:"Outer upper arm, below the shoulder"},
        {id:"deep", label:"Deep inside, or at the front of the shoulder"},
        {id:"back", label:"Back of the shoulder"},
        {id:"topneck", label:"Top of the shoulder spreading up into the neck"}
      ]},
      {id:"S2", text:"When you lift your arm out to the side and up, what happens?", options:[
        {id:"midarc", label:"It hurts in the middle of the movement, then eases near the top"},
        {id:"top", label:"It hurts most right at the top"},
        {id:"cantgo", label:"It will not go as high as the other side, even when I help it with my other hand"},
        {id:"cantlift", label:"I cannot lift it on my own, but it goes up if I help it"},
        {id:"fullfree", label:"It lifts fully without pain"}
      ]},
      {id:"S3", text:"Which of these are hard or painful? Tick all that apply.", options:[
        {id:"behind", label:"Reaching behind my back (bra strap, back pocket)"},
        {id:"highshelf", label:"Reaching up to a high shelf"},
        {id:"across", label:"Reaching across my body (seatbelt, washing the other armpit)"},
        {id:"lying", label:"Lying on that side at night"},
        {id:"throwing", label:"Throwing, or overhead sport"}
      ]},
      {id:"S4", text:"How has the movement changed over time?",
        askIf: ({ ra }) => ra.duration === "d3m" || ra.duration === "o3m" || [].concat(ra.S2 || []).includes("cantgo"),
        options:[
          {id:"stiffer", label:"Getting stiffer month by month"},
          {id:"painfulthenstiff", label:"Very painful at first, now more stiff than painful"},
          {id:"easing", label:"The stiffness is slowly easing"},
          {id:"nostiff", label:"No real stiffness, just pain"}
        ]},
      {id:"S5", text:"Does your shoulder feel unstable?",
        // "Under 40": the age bands split at 50, so 30 to 49 is included.
        askIf: ({ ra }) => !ra.age || ["u18", "18-29", "30-49"].includes(ra.age) || ra.onset === "popped" || ra.onset === "overhead",
        options:[
          {id:"popped", label:"It has popped out and needed putting back"},
          {id:"slips", label:"It slips or clunks, then goes back on its own"},
          {id:"worry", label:"I worry it will pop out with my arm up and back"},
          {id:"stable", label:"No, it feels stable"}
        ]},
      {id:"S6", text:"Which of these do you notice? Tick all that apply.", options:[
        {id:"weakness", label:"Weakness lifting the arm or turning it outwards"},
        {id:"clicking", label:"Clicking or catching deep in the shoulder"},
        {id:"builtup", label:"The pain built up over a day or two to very severe, with no injury"},
        {id:"deadarm", label:"A “dead arm” feeling with the arm overhead"},
        {id:"acrossbody", label:"Pain on top of the shoulder when I reach across my body"}
      ]},
      {id:"S7", text:"Which hurts more: moving your neck, or moving your shoulder and arm?",
        askIf: ({ draw, all }) => !draw || ["neck", "ctj", "upperback", "elbow", "forearm", "wrist"].some((t) => draw.has(t)) ||
          [].concat(all.painQuality || []).includes("tingling"),
        // Asked early when the drawing runs below the elbow: the neck look-alike.
        priority: ({ draw }) => !!draw && ["elbow", "forearm", "wrist"].some((t) => draw.has(t)),
        options:[
          {id:"neck", label:"Moving my neck", special:"neckSource"},
          {id:"shoulder", label:"Moving my shoulder and arm"},
          {id:"both", label:"Both about the same"},
          {id:"neither", label:"Neither brings it on"}
        ]},
      {id:"S8", text:"Which of these describe your arm symptoms? Tick all that apply.",
        askIf: ({ draw, all }) => !draw || ["elbow", "forearm", "wrist"].some((t) => draw.has(t)) ||
          [].concat(all.painQuality || []).some((q) => q === "tingling" || q === "burning"),
        options:[
          {id:"pastelbow", label:"Pain goes below the elbow into the forearm or hand", special:"neckSource"},
          {id:"fingers", label:"Pins and needles or numbness in particular fingers", special:"neckSource"},
          {id:"armworse", label:"The arm pain is worse than the shoulder pain", special:"neckSource"},
          {id:"stopsabove", label:"Pain on the outer upper arm that stops above the elbow"}
        ]}
    ],
    conditions:[]
  },

  /* ══════════════ KNEE ══════════════
     From Chandra's "Knee assessment" region document (reviewed by Chandra,
     25 Sep 2026; the source text is content/regions/knee.md). Sources: JOSPT
     patellofemoral pain CPG 2019, JOSPT meniscal and cartilage CPG 2018,
     JOSPT knee ligament CPG 2017, Ottawa knee rule (Stiell 1996), NICE NG226
     (2022), Malliaras 2015 (patellar tendinopathy), Peck 2017 (SUFE), Lesher
     2008, Travell & Simons 2019.
     Reached from the body map's knee band (KNEE_TOP in Body3D.jsx). Its
     injury screen (the Ottawa knee rule, adapted) is in ./injuryScreen.js.
     Conditions: content/conditions/knee-*.md. */
  knee: {
    name: "Knee",
    redFlags: [
      { id: "kf-septic", tier: "emergency", why: "Possible joint infection (septic arthritis)",
        text: "Is your knee hot, red, and swollen, with a fever or feeling unwell, especially after an injection, surgery, or a cut?" },
      { id: "kf-pe", tier: "emergency", group: "legclotlung", why: "Possible blood clot that has travelled to the lung",
        text: "Is your calf or thigh swollen, warm, or tender, and are you also short of breath, or have chest pain or are coughing blood?" },
      { id: "kf-cauda", tier: "emergency", group: "cauda", why: "Possible cauda equina syndrome",
        text: "Do you have new numbness between your legs or around your bottom, or new trouble passing urine or controlling your bowels?" },
      { id: "kf-dvt", sameDay: true, tier: "urgent", group: "legclot", why: "Possible blood clot (DVT). A burst cyst at the back of the knee looks the same and also needs checking",
        text: "Is your calf swollen, warm, or tender, especially after surgery, a long journey, time in bed, a cast, or starting the pill?" },
      { id: "kf-replacement", sameDay: true, tier: "urgent", why: "Possible infection or loosening of the replacement",
        text: "Do you have a knee replacement, and is it newly painful, warm, swollen, or is the wound red or leaking?" },
      { id: "kf-sufe", tier: "urgent", group: "sufe", why: "Possible slipped growth plate at the hip (SUFE): hip problems in children are often felt only at the knee",
        text: "Is a child aged about 9 to 16 limping with knee or thigh pain, or does moving the hip hurt?" },
      { id: "kf-perthes", tier: "urgent", why: "Possible Perthes disease or other hip problem felt at the knee",
        text: "Is a child aged about 4 to 10 limping, with knee or hip pain, but no injury?" },
      { id: "kf-tumour", tier: "urgent", why: "Bone tumours in young people are most common around the knee; needs imaging",
        text: "Are you under 25 with a deep ache around the knee that wakes you at night, or a lump near the knee that is growing?" },
      { id: "kf-gout", tier: "urgent", why: "Possible gout or other crystal arthritis",
        text: "Did your knee become suddenly hot, swollen, and very painful overnight, and have you had gout or “pseudogout” before?" },
      { id: "kf-inflam", tier: "urgent", why: "Possible inflammatory or reactive arthritis",
        text: "Are other joints swollen too, or is the knee swollen with a rash, psoriasis, eye inflammation, or after a stomach bug or sexually transmitted infection?" },
      { id: "kf-artery", tier: "urgent", why: "Possible artery problem (popliteal aneurysm or narrowed arteries)",
        text: "Is there a pulsing lump behind your knee, or a cramping calf pain on walking that eases within minutes of standing still?" },
      { id: "kf-cancer", tier: "urgent", group: "cancer", why: "Cancer can spread to the bones around the knee",
        text: "Have you ever had cancer, or do you have deep knee pain at night that does not change with position, with weight loss?" }
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
        { id: "twist", label: "A twist or pivot in sport" },
        { id: "blow", label: "After a fall or a blow to the knee" },
        { id: "running", label: "After increasing running or jumping" },
        { id: "kneeling", label: "After a lot of kneeling or squatting" },
        { id: "surgery", label: "After knee surgery or a knee replacement" }
      ]},
      { id: "duration", text: "How long has it been going on?", options: [
        { id: "d2w", label: "Less than 2 weeks" },
        { id: "d6w", label: "2 to 6 weeks" },
        { id: "d3m", label: "6 weeks to 3 months" },
        { id: "o3m", label: "More than 3 months" }
      ]}
    ],
    questions: [
      { id: "K1", text: "Where is the pain mainly?", options: [
        { id: "kneecap", label: "Around or behind the kneecap" },
        { id: "below", label: "Just below the kneecap" },
        { id: "inner", label: "Inner side of the knee" },
        { id: "outer", label: "Outer side of the knee" },
        { id: "back", label: "Back of the knee" }
      ]},
      { id: "K2", text: "Which of these bring it on? Tick all that apply.", options: [
        { id: "stairs", label: "Going down stairs, squatting, or sitting a long time with the knee bent" },
        { id: "jump", label: "Jumping or landing" },
        { id: "twist", label: "Twisting or turning on the leg" },
        { id: "running", label: "Running, coming on after the same distance each time" },
        { id: "kneeling", label: "Kneeling" }
      ]},
      { id: "K3", text: "Which of these apply? Tick all that apply.", options: [
        { id: "click", label: "Clicking, catching, or locking" },
        { id: "giveway", label: "The knee gives way" },
        { id: "swelling", label: "Swelling after activity" },
        { id: "stiff", label: "Stiff for less than 30 minutes in the morning or after sitting, then eases" },
        { id: "none", label: "None of these" }
      ]},
      { id: "K4", text: "About the twisting injury: which apply? Tick all that apply.",
        askIf: ({ ra }) => ra.onset === "twist",
        priority: () => true,
        options: [
          { id: "pop", label: "I felt or heard a pop" },
          { id: "fast", label: "It swelled within a couple of hours" },
          { id: "nextday", label: "It swelled the next day" },
          { id: "stop", label: "I could not carry on playing" },
          { id: "none", label: "None of these" }
        ]},
      { id: "K5", text: "Is there any swelling or lump in one place?", options: [
        { id: "prepatellar", label: "Swelling on the front of the kneecap (after kneeling)" },
        { id: "back", label: "A lump or fullness at the back of the knee" },
        { id: "bump", label: "A tender bony bump just below the kneecap (in a teenager)" },
        { id: "puffy", label: "The whole knee is puffy" },
        { id: "none", label: "No swelling or lump" }
      ]},
      { id: "K6", text: "Does it hurt to move your hip (putting on socks, turning your leg in and out in bed)?",
        askIf: ({ draw, ra }) => !draw || ["thigh", "hip"].some((t) => draw.has(t)) ||
          ["u18", "50-64", "o64"].includes(ra.age),
        // Early for a child, or when the thigh or hip is drawn too: hip
        // problems (in children, a slipped growth plate) are often felt only
        // at the knee.
        priority: ({ draw, ra }) => !draw || ["thigh", "hip"].some((t) => draw.has(t)) || ra.age === "u18",
        options: [
          { id: "yes", label: "Yes", special: "hipSource" },
          { id: "no", label: "No" },
          { id: "unsure", label: "Not sure" }
        ]},
      { id: "K7", text: "Which of these do you notice in the leg? Tick all that apply.",
        askIf: ({ draw, all }) => !draw || ["thigh", "hip", "lowerback", "sij", "ankle"].some((t) => draw.has(t)) ||
          [].concat(all.painQuality || []).some((q) => q === "tingling" || q === "burning"),
        // Early with nerve-type pain (or when the drawing is unknown).
        priority: ({ draw, all }) => !draw || [].concat(all.painQuality || []).some((q) => q === "tingling" || q === "burning"),
        options: [
          { id: "pins", label: "Pins and needles or numbness in the leg or foot", special: "lowbackHip" },
          { id: "fromback", label: "Pain that starts in the back or buttock and travels to the knee", special: "lowbackHip" },
          { id: "saphenous", label: "A burning or numb patch on the inner knee or shin" },
          { id: "footslap", label: "The foot slaps down, or the toes catch when walking", special: "footDrop" },
          { id: "none", label: "None of these" }
        ]},
      { id: "K8", text: "Which hurts more: moving your low back, moving your hip, or bending and loading your knee?",
        askIf: ({ draw, ra }) => !draw || ["thigh", "hip", "lowerback", "sij"].some((t) => draw.has(t)) ||
          [].concat(ra.K6 || []).includes("yes") || [].concat(ra.K7 || []).some((o) => o !== "none"),
        // Early when the low back or buttock is drawn too: the back look-alike.
        priority: ({ draw }) => !!draw && ["lowerback", "sij"].some((t) => draw.has(t)),
        options: [
          { id: "back", label: "Moving my low back", special: "lowbackHip" },
          { id: "hip", label: "Moving my hip", special: "hipSource" },
          { id: "knee", label: "Bending and loading my knee" },
          { id: "none", label: "None of these bring it on" }
        ]}
    ],
    conditions: []
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
  lowerleg: 'leg',
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
  jaw: 'jaw',
  head: 'head',
  upperarm: 'arm',
  forearm: 'forearm',
  elbow: 'elbow',
  wrist: 'wrist',
  hand: 'hand',
  hip: 'hip',
  thigh: 'thigh',
  ankle: 'ankle',
})
