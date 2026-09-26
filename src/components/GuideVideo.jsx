import { useEffect, useRef, useState } from 'react'

/* A short "how this guide works" video, offered in the top-right corner of
   the body panel on the first step after Start.

   It shows only once the video file exists (public/videos/guide-intro.mp4),
   so the site never shows a broken player. It never plays on its own: a small
   button opens it, it starts on that tap, and it can be closed at any time.
   Closing it is remembered on this device. Captions, if provided
   (public/videos/guide-intro.vtt), are on by default. The recording script
   is in content/guide-video-script.md. */

const SRC = '/videos/guide-intro.mp4'
const POSTER = '/videos/guide-intro.jpg'
const CAPTIONS = '/videos/guide-intro.vtt'
const DISMISSED = 'pc-guide-video-dismissed'

const gold = '#C9A96E'

export default function GuideVideo() {
  const [available, setAvailable] = useState(false)
  const [hasCaptions, setHasCaptions] = useState(false)
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISSED) === '1' } catch { return false }
  })
  const [seconds, setSeconds] = useState(null)
  const videoRef = useRef(null)
  // On a phone the body is small: a round play button keeps its head clear.
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640)
  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 640)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Offer the video only when the file is really there (a missing file in
  // development is answered with the page itself, so check the type too).
  useEffect(() => {
    let alive = true
    const isType = (r, t) => r.ok && (r.headers.get('content-type') || '').startsWith(t)
    fetch(SRC, { method: 'HEAD' }).then((r) => { if (alive) setAvailable(isType(r, 'video/')) }).catch(() => {})
    fetch(CAPTIONS, { method: 'HEAD' }).then((r) => { if (alive) setHasCaptions(isType(r, 'text/vtt')) }).catch(() => {})
    return () => { alive = false }
  }, [])

  if (!available || dismissed) return null

  const close = () => {
    setOpen(false)
    videoRef.current?.pause()
  }
  const dismiss = () => {
    close()
    setDismissed(true)
    try { localStorage.setItem(DISMISSED, '1') } catch { /* private mode: fine */ }
  }

  const wrap = {
    position: 'absolute', top: 10, right: 10, zIndex: 6, pointerEvents: 'auto',
    fontFamily: 'var(--font-body)',
  }

  if (!open && narrow) {
    return (
      <div style={{ ...wrap, top: 6, right: 6 }}>
        <button onClick={() => setOpen(true)} aria-label="Watch a short video on how this guide works"
          style={{
            width: 44, height: 44, borderRadius: '50%', border: `1px solid ${gold}`, background: 'rgba(8,21,39,0.82)',
            color: gold, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(6px)', paddingLeft: 3,
          }}>▶</button>
        <span style={{ display: 'block', marginTop: 3, fontSize: 10.5, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>Video</span>
      </div>
    )
  }

  if (!open) {
    return (
      <div style={{ ...wrap, display: 'flex', alignItems: 'center', gap: 4 }}>
        <button onClick={() => setOpen(true)} aria-label="Watch a short video on how this guide works"
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px 8px 10px', minHeight: 40,
            borderRadius: 999, border: `1px solid ${gold}`, background: 'rgba(8,21,39,0.82)', color: '#fff',
            fontSize: 13.5, cursor: 'pointer', backdropFilter: 'blur(6px)',
          }}>
          <span aria-hidden="true" style={{
            width: 22, height: 22, borderRadius: '50%', background: gold, color: '#081527',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
          }}>▶</span>
          How this guide works{seconds ? ` · ${seconds < 60 ? `${seconds} s` : `${Math.round(seconds / 60)} min`}` : ''}
        </button>
        <button onClick={dismiss} aria-label="Hide the video offer"
          style={{
            width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(8,21,39,0.6)',
            color: 'rgba(255,255,255,0.7)', fontSize: 16, cursor: 'pointer', lineHeight: 1,
          }}>×</button>
        {/* Read the length for the button without loading the whole video. */}
        <video src={SRC} preload="metadata" style={{ display: 'none' }}
          onLoadedMetadata={(e) => setSeconds(Math.round(e.currentTarget.duration) || null)} />
      </div>
    )
  }

  return (
    <div role="dialog" aria-label="How this guide works" style={{
      ...wrap, width: 'min(320px, calc(100% - 20px))', borderRadius: 14, overflow: 'hidden',
      border: `1px solid ${gold}`, background: '#081527', boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
    }}>
      <video ref={videoRef} src={SRC} poster={POSTER} controls autoPlay playsInline
        style={{ display: 'block', width: '100%', background: '#000' }}
        onEnded={close}>
        {hasCaptions && <track kind="captions" src={CAPTIONS} srcLang="en" label="English" default />}
      </video>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px 6px 12px' }}>
        <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)' }}>How this guide works</span>
        <button onClick={close}
          style={{ border: 'none', background: 'none', color: gold, fontSize: 13, cursor: 'pointer', padding: '8px 6px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Close
        </button>
      </div>
    </div>
  )
}
