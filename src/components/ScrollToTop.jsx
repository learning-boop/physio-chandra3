import { useEffect, useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Phones restore the old scroll position on reload and Back, which could open
// a page at its bottom. Every page opens at its top instead.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

export default function ScrollToTop() {
  const { pathname, hash } = useLocation()
  // Before the new page paints, so it never flashes at the old position.
  useLayoutEffect(() => {
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])
  useEffect(() => {
    // A link that names a section (e.g. /about#contact) should land on that
    // section, not the top of the page. The element only exists after the new
    // route has painted, so the scroll waits a frame.
    if (!hash) return
    const id = hash.slice(1)
    const jump = () => {
      const el = document.getElementById(id)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else window.scrollTo(0, 0)
    }
    const raf = requestAnimationFrame(() => requestAnimationFrame(jump))
    return () => cancelAnimationFrame(raf)
  }, [pathname, hash])
  return null
}
