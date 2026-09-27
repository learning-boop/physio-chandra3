import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/* A short "how this guide works" video, offered as a quiet link under the
   instructions on the first step after Start, just above Continue — where a
   visitor unsure of the gestures is reading, without covering the body or
   competing with the main button.

   It shows only once the video file exists (public/videos/guide-intro.mp4),
   so the site never shows a broken player. It never plays on its own: the
   link opens it, it starts on that tap, and it can be closed at any time.
   It opens large, centred over the page, so the recorded screen and the
   captions are easy to read (Escape, Close or a tap outside closes it).
   Captions, if provided (public/videos/guide-intro.vtt), are on by default.
   The recording script is in content/guide-video-script.md. */

const SRC = '/videos/guide-intro.mp4'
const POSTER = '/videos/guide-intro.jpg'
const CAPTIONS = '/videos/guide-intro.vtt'

const gold = '#C9A96E'

export default function GuideVideo() {
  const [available, setAvailable] = useState(false)
  const [hasCaptions, setHasCaptions] = useState(false)
  const [open, setOpen] = useState(false)
  const [seconds, setSeconds] = useState(null)
  const [cue, setCue] = useState('')
  const videoRef = useRef(null)

  // Captions are shown in a solid bar under the video, not over it: the
  // track is read but not drawn by the browser.
  useEffect(() => {
    if (!open) return
    const v = videoRef.current
    const track = v && v.textTracks && v.textTracks[0]
    if (!track) return
    track.mode = 'hidden'
    const onCue = () => setCue(track.activeCues && track.activeCues.length ? track.activeCues[0].text : '')
    track.addEventListener('cuechange', onCue)
    return () => track.removeEventListener('cuechange', onCue)
  }, [open, hasCaptions])

  // Escape closes the large player.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); videoRef.current?.pause() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Offer the video only when the file is really there (a missing file in
  // development is answered with the page itself, so check the type too).
  useEffect(() => {
    let alive = true
    const isType = (r, t) => r.ok && (r.headers.get('content-type') || '').startsWith(t)
    fetch(SRC, { method: 'HEAD' }).then((r) => { if (alive) setAvailable(isType(r, 'video/')) }).catch(() => {})
    fetch(CAPTIONS, { method: 'HEAD' }).then((r) => { if (alive) setHasCaptions(isType(r, 'text/vtt')) }).catch(() => {})
    return () => { alive = false }
  }, [])

  if (!available) return null

  const close = () => {
    setOpen(false)
    videoRef.current?.pause()
  }

  if (!open) {
    const length = seconds ? (seconds < 60 ? `${seconds}-sec` : `${Math.round(seconds / 60)}-min`) : 'short'
    return (
      <div style={{ margin: '-6px 0 22px', maxWidth: 460 }}>
        <button onClick={() => setOpen(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10, minHeight: 40, padding: '4px 0',
            border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left',
            fontFamily: 'var(--font-body)', fontSize: 'clamp(14px, 3.5vw, 15px)', color: gold,
          }}>
          <span aria-hidden="true" style={{
            width: 30, height: 30, borderRadius: '50%', border: `1px solid ${gold}`, flex: '0 0 auto',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, paddingLeft: 2,
          }}>▶</span>
          <span style={{ textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: 'rgba(201,169,110,0.5)' }}>
            Watch a {length} video on how this works
          </span>
        </button>
        {/* Read the length for the link without loading the whole video. */}
        <video src={SRC} preload="metadata" style={{ display: 'none' }}
          onLoadedMetadata={(e) => setSeconds(Math.round(e.currentTarget.duration) || null)} />
      </div>
    )
  }

  // The player opens in a portal on the page itself: the body panel it is
  // offered from moves with an animation, which would pin a fixed overlay to
  // the panel instead of the screen.
  return createPortal(
    <div onClick={close} style={{
      position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(3,10,20,0.82)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12,
      backdropFilter: 'blur(3px)',
    }}>
      <div role="dialog" aria-modal="true" aria-label="How this guide works" onClick={(e) => e.stopPropagation()} style={{
        width: 'min(1100px, 100%)', borderRadius: 16, overflow: 'hidden', border: `1px solid ${gold}`,
        background: '#081527', boxShadow: '0 20px 60px rgba(0,0,0,0.55)', fontFamily: 'var(--font-body)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px 8px 16px' }}>
          <span style={{ fontSize: 15, color: '#fff' }}>How this guide works</span>
          <button onClick={close} autoFocus
            style={{ border: `1px solid ${gold}`, borderRadius: 999, background: 'none', color: gold, fontSize: 13, cursor: 'pointer', padding: '8px 16px', letterSpacing: '0.06em', textTransform: 'uppercase', minHeight: 40 }}>
            Close
          </button>
        </div>
        <video ref={videoRef} className="gv-video" src={SRC} poster={POSTER} controls autoPlay playsInline
          style={{ display: 'block', width: '100%', maxHeight: `calc(100vh - ${hasCaptions ? 190 : 90}px)`, background: '#000' }}
          onEnded={close}>
          {hasCaptions && <track kind="captions" src={CAPTIONS} srcLang="en" label="English" default />}
        </video>
        {/* The instructions, under the video on a solid background. The bar
            keeps its height so the player does not jump between captions. */}
        {hasCaptions && (
          <p aria-live="polite" style={{
            margin: 0, padding: '14px 18px', minHeight: '3.1em', boxSizing: 'content-box',
            display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            background: gold, color: '#081527', fontWeight: 600,
            fontSize: 'clamp(16px, 2.2vw, 24px)', lineHeight: 1.35,
          }}>{cue}</p>
        )}
      </div>
    </div>,
    document.body,
  )
}
