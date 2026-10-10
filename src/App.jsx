import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AboutPage from './pages/AboutPage'
import ConditionsPage from './pages/ConditionsPage'
import EducationPage from './pages/EducationPage'
import PainMapperPage from './pages/PainMapperPage'
import PrivacyPage from './pages/PrivacyPage'
import DataReviewPage from './pages/DataReviewPage'
import ScrollToTop from './components/ScrollToTop'
import TalkingGuide from './components/TalkingGuide'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/"           element={<Home />} />
        <Route path="/about"      element={<AboutPage />} />
        <Route path="/conditions" element={<ConditionsPage />} />
        <Route path="/education"  element={<EducationPage />} />
        <Route path="/pain-mapper" element={<PainMapperPage />} />
        <Route path="/privacy"    element={<PrivacyPage />} />
        <Route path="/data-review" element={<DataReviewPage />} />
      </Routes>
      <TalkingGuide />
    </>
  )
}
