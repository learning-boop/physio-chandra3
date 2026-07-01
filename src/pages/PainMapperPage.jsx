import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Body3D from '../components/Body3D'
import PainAIPanel from '../components/PainAIPanel'

export default function PainMapperPage() {
  const [zones, setZones] = useState([])
  const [isMobile, setIsMobile] = useState(false)

  // Stack the 3D body and the AI panel on narrow screens instead of squeezing
  // them into two columns.
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <div style={{ background: 'var(--black)', minHeight: '100vh' }}>
      <Navbar />
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: isMobile ? '96px 16px 56px' : '120px 24px 80px',
      }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif", color: '#fff',
          fontSize: 'clamp(30px, 6vw, 52px)', fontWeight: 500, marginBottom: 12,
        }}>Trace Your Pain</h1>
        <p style={{
          color: 'rgba(255,255,255,0.5)', fontSize: 'clamp(14px, 3.6vw, 16px)',
          maxWidth: 560, marginBottom: isMobile ? 28 : 48, lineHeight: 1.6,
        }}>
          Draw a line across the body from one point of pain to another. We'll
          highlight the areas it crosses and give you an AI-generated overview
          of what might be going on.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr',
          gap: isMobile ? 20 : 32,
          alignItems: 'start',
        }}>
          <div style={{
            height: isMobile ? 440 : 560,
            borderRadius: 20,
            overflow: 'hidden',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <Body3D onSelectionChange={setZones} />
          </div>
          <PainAIPanel zones={zones} />
        </div>
      </div>
      <Footer />
    </div>
  )
}