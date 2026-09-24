import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PainAssessment from '../components/PainAssessment'

/* /pain-mapper runs the same guided assessment as the home page, so the
   referral-pattern reading, pain behaviour, yellow flags, pain type, tiered
   red flags and clinic booking all apply here too. It used to pair the body
   with PainAIPanel → SymptomGuide, an older engine that asked each crossed
   area's questions separately and had none of those. */
export default function PainMapperPage() {
  return (
    <>
      <Navbar />
      <PainAssessment />
      <Footer />
    </>
  )
}
