import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from '../components/Navbar'
import PhotoHero from '../components/PhotoHero'
import Hero from '../components/Hero'
import Marquee from '../components/Marquee'
import Footer from '../components/Footer'

export default function Home() {
  // false → the photo hero; true → the 3D pain checker IN THE SAME PLACE.
  const [showChecker, setShowChecker] = useState(false)

  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        {!showChecker ? (
          <motion.div key="photo" exit={{ opacity: 0, transition: { duration: 0.45 } }}>
            <PhotoHero onStart={() => setShowChecker(true)} />
          </motion.div>
        ) : (
          <motion.div key="checker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Hero />
          </motion.div>
        )}
      </AnimatePresence>
      <Marquee />
      <Footer />
    </>
  )
}