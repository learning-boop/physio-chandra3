import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

/* Privacy notice. Required by the CHCPBC Privacy and Confidentiality
   standard (2.1: clearly explain how information is collected, used, stored
   and disclosed) and BC's Personal Information Protection Act.
   Keep it in step with what the site actually does: if the pain guide, the
   AI overview (api/pain-analysis.js) or the hosting changes, update this. */

const UPDATED = 'September 28, 2026'

const sections = [
  {
    title: 'Who we are',
    body: [
      'This website belongs to Chandra Matla, a registered physiotherapist in British Columbia. Chandra is responsible for the personal information described here.',
    ],
  },
  {
    title: 'The pain guide',
    body: [
      'The pain guide asks where you feel pain and some questions about it, including your age range and, if you choose to answer them, how the pain is affecting your mood, sleep and work. It does not ask for your name or contact details.',
      'Your drawing and answers are worked through on your own device, in your browser. They are not saved by this website and are cleared when you close or restart the guide, unless you choose to share an anonymous copy (see below).',
    ],
  },
  {
    title: 'Your reference code and PDF',
    body: [
      'When you complete the guide you receive a reference code made of the date and a running number for that day, for example 20261011-004. It is shown on your results, on your PDF and in your summary, so the clinic can match them when you book.',
      'To give out the next number, the website keeps only a count for each day, which is deleted after two days. Your answers are not sent or stored with the code, and the code is never added to the anonymous copy described below.',
      'The PDF of your results is created on your own device and is not sent to us. You decide where to save or send it.',
    ],
  },
  {
    title: 'Anonymous copy to improve the guide',
    body: [
      'At the end of the guide you can choose to share an anonymous copy of your drawing and the answers you chose. The box for this is not ticked, and nothing is shared unless you tick it and press "Share anonymously".',
      'The copy is used only to improve and train this guide. It contains the lines you drew, the areas they cover, the options you selected (your age is kept as a range), and the results the guide showed. It does not contain your name, contact details, reference code, anything you typed in your own words, the time you took the guide, your IP address or details of your device. A new random number is given to each copy, so copies cannot be linked to you or to each other.',
      'The copies are stored with Upstash, the database service this website uses, and only Chandra can open them. They are deleted after about two years. Because a copy cannot be linked to you, it cannot be found again or deleted on request after it has been shared.',
    ],
  },
  {
    title: 'The optional AI overview',
    body: [
      'At the end of the guide you can choose to see an overview of your results written by an AI service. Nothing is sent unless you press "Show my AI overview".',
      'If you do, your drawing and answers are sent over a secure connection to this website\'s server and on to Anthropic, an AI company in the United States, which writes the overview. Your answers about mood, sleep and work, and anything you typed in your own words, are included only if you tick the box for them.',
      'This website does not store what is sent. Anthropic handles it under its own commercial terms and privacy policy, which state that it does not use this kind of data to train its models by default. Because it is processed in the United States, it may be subject to the laws of the United States.',
      'You do not need the overview: your results are shown without it.',
    ],
  },
  {
    title: 'Sending your summary to Chandra',
    body: [
      'You can copy your summary, or open it in your own email app to send to Chandra. Nothing is sent until you send the email yourself. Email is not fully secure, so include only what you are comfortable sharing.',
    ],
  },
  {
    title: 'Booking and treatment',
    body: [
      'Appointments are booked with the clinics where Chandra practises. Your clinical record is kept by that clinic under its own privacy policy and the College of Health and Care Professionals of BC standards.',
    ],
  },
  {
    title: 'Cookies and other services',
    body: [
      'This website does not use advertising or analytics cookies and does not track you. It remembers only one thing in your browser: whether you have hidden the guide video.',
      'The website is hosted by Vercel, whose servers record technical details such as your IP address, as all websites do. Its fonts are loaded from Google Fonts, which also receives your IP address.',
    ],
  },
  {
    title: 'Questions and your rights',
    body: [
      'You can ask what personal information we hold about you, ask for it to be corrected, or raise a concern, by emailing chandra@physiochandra.ca. We reply within 30 business days. You can also contact the Office of the Information and Privacy Commissioner for British Columbia.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="privacy-sec" style={{ background: 'var(--warm-white)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--gold)' }}>Privacy Notice</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(38px, 6vw, 64px)', fontWeight: 300, lineHeight: 1.05, color: 'var(--text-dark)', margin: '14px 0 12px' }}>
            How your information <em style={{ fontStyle: 'italic' }}>is used</em>
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-mid)', margin: '0 0 40px' }}>Last updated {UPDATED}</p>
          {sections.map((s) => (
            <section key={s.title} style={{ marginBottom: 34 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.4vw, 30px)', fontWeight: 400, color: 'var(--text-dark)', margin: '0 0 12px' }}>{s.title}</h2>
              {s.body.map((p, i) => (
                <p key={i} style={{ fontFamily: 'var(--font-body)', fontSize: 16, lineHeight: 1.75, color: 'var(--text-mid)', margin: '0 0 12px' }}>{p}</p>
              ))}
            </section>
          ))}
        </div>
      </main>
      <Footer />
      <style>{`
        .privacy-sec {
          padding: clamp(110px, 16vw, 140px) max(clamp(20px, 5vw, 80px), env(safe-area-inset-right)) clamp(64px, 12vw, 100px) max(clamp(20px, 5vw, 80px), env(safe-area-inset-left));
        }
      `}</style>
    </>
  )
}
