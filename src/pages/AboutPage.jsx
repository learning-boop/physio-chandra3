import Navbar from '../components/Navbar'
import About from '../components/About'
import Approach from '../components/Approach'
import Testimonials from '../components/Testimonials'
import CTA from '../components/CTA'
import Footer from '../components/Footer'

/* Patient quotes stay hidden until each is confirmed as a real patient's
   words, published with written consent (CHCPBC Marketing, Advertising and
   Promotion standard 1.1 and 1.3). Set to true once confirmed. */
const SHOW_PATIENT_FEEDBACK = false

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <About />
      <Approach />
      {SHOW_PATIENT_FEEDBACK && <Testimonials />}
      <CTA />
      <Footer />
    </>
  )
}
