import { useEffect } from 'react'

/* Keeps the screen on while the site is open (Chandra, 14 Oct 2026): a
   patient reading, drawing or listening to the guide should not have the
   phone or computer screen switch off half way through.

   Uses the browser's Screen Wake Lock (Chrome, Edge, Safari 16.4+, Firefox
   126+). The browser lets go of it whenever the tab is hidden, so it is
   asked for again when the page is shown. After 10 minutes with no tap,
   scroll or key press (the page left open and forgotten) it is let go, so
   the screen follows the device's own settings again and the battery is
   spared; the next touch asks for it again. Some browsers only allow it
   after a tap, so a refusal is tried again on the next one. Nothing is
   stored or sent. Where the browser has no wake lock, nothing happens. */
const IDLE_MS = 10 * 60 * 1000

export default function KeepAwake() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return
    let lock = null
    let asking = false
    let idle = 0
    let gone = false

    const release = () => {
      const l = lock
      lock = null
      if (l) l.release().catch(() => { /* already released */ })
    }
    const ask = async () => {
      if (gone || lock || asking || document.visibilityState !== 'visible') return
      asking = true
      try {
        lock = await navigator.wakeLock.request('screen')
        lock.addEventListener('release', () => { lock = null })
        if (gone) release()
      } catch { /* not allowed yet (no tap, low battery mode): tried again on the next tap */ }
      asking = false
    }
    const active = () => {
      clearTimeout(idle)
      idle = setTimeout(release, IDLE_MS)
      ask()
    }
    const onShow = () => { if (document.visibilityState === 'visible') active() }

    const EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart', 'wheel']
    EVENTS.forEach((ev) => window.addEventListener(ev, active, { passive: true, capture: true }))
    document.addEventListener('visibilitychange', onShow)
    active()
    return () => {
      gone = true
      clearTimeout(idle)
      EVENTS.forEach((ev) => window.removeEventListener(ev, active, { capture: true }))
      document.removeEventListener('visibilitychange', onShow)
      release()
    }
  }, [])
  return null
}
