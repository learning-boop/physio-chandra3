import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    // A link that names a section (e.g. /about#contact) should land on that
    // section, not the top of the page. The element only exists after the new
    // route has painted, so the scroll waits a frame.
    if (hash) {
      const id = hash.slice(1)
      const jump = () => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        else window.scrollTo(0, 0)
      }
      const raf = requestAnimationFrame(() => requestAnimationFrame(jump))
      return () => cancelAnimationFrame(raf)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}
