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
      'Before the safety questions, the guide asks your age range and your sex assigned at birth, so it can leave out questions that cannot apply to you (for example, pregnancy questions). Your sex assigned at birth is used only for that, on your device: it is not saved, not sent anywhere, and not included in your summary, your PDF, the AI overview or the anonymous copy. You can choose "Intersex, or prefer not to say", and every question is then asked.',
      'It also asks whether you have been told you have diabetes or high blood sugar, and, when it matters for your answers, a few details about it. These choose which safety questions come first and shape your results. They appear in your summary and PDF (so Chandra can plan around them if you send it), but are not included in the anonymous copy or sent for the AI overview.',
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
    title: 'Feedback on the guide',
    body: [
      'At the end of the results you can choose to send anonymous feedback: a few tapped answers (how easy the guide was, whether the results made sense, anything confusing) and, if you wish, a short comment. Nothing is sent unless you fill it in, confirm in a separate step that you are sharing it freely and without personal information, and press "Yes, send my feedback".',
      'Please do not include your name, contact details or other personal information in a comment. Anything that looks like an email address, phone number, web address, postal code or long number (such as a health card number) is removed before the feedback is kept. Your reference code, answers, the time and your device details are not included. Only if you tick a separate box, the areas you drew and the conditions you were shown (not your answers) are added, so the feedback can improve the reasoning.',
      'Feedback is used only to improve this guide. It is never published or used as a testimonial, is not read straight away, and is not answered, so it is not a way to ask for care. It is stored with Upstash, only Chandra can open it, and it is deleted after about two years. Because it cannot be linked to you, it cannot be found again or deleted on request after it has been sent. Sending feedback does not affect your rights: to raise a concern about your care, contact Chandra directly or the College of Health and Care Professionals of BC.',
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
