import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useGuideStage, useGuided, useGuideScreenSig, getGuideScreen, setGuideDemo } from '../data/guideStage'
import {
  PAGE_MESSAGES, SILENT_STAGES, TOPICS, DEFAULT_CHIPS, PREFERRED_VOICES, NATURAL_MARKS, ROBOTIC_VOICES, VOICE_STYLE, GREETING, DEMO, DEMO_STEPS, CHANGE_REPLY, MIC_ASK, MIC_NOTE, VOICE, audioFor, hasRecordings, findReply, forDevice,
} from '../data/talkingGuide'
import { command, yesNo, saysNone, matchOptions } from '../data/voiceMatch'

/* ── The talking guide: Chandra's face in the bottom-left corner ──────────
   On every page (Chandra, 10 Oct 2026). The face is the logo itself
   (/images/logo2.png, already loaded by the navbar), with a mouth that opens
   while it speaks and eyes that blink, drawn over the picture in the same
   coordinates (836 x 1134).

   - In the bottom-RIGHT corner (moved from the left, Chandra, 10 Oct 2026).
   - What it says is heard, not shown: a message shows only "Speaking…" and
     its buttons, and "Show text" brings the words up (remembered on this
     device). Without a voice to hear, the words always show.
   - Welcome on the pain guide's first page and how-to on the second open by
     themselves (once per visit); other pages and steps wait for a tap on the
     face, so the guide never covers a question. A gold dot says there is a
     new tip.
   - It never makes a sound by itself. "Listen" (or the speaker button) turns
     the voice on; then each new message is read out until it is turned off.
     The text is always shown, so it works without sound.
   - Conversation: suggested questions plus a box to type one. Answers are
     written in advance (src/data/talkingGuide.js) and matched on this device;
     nothing typed is sent anywhere.
   - Voice: the browser's own voice for now. A message with `audio` (a file
     in public/) plays that recording instead, and the mouth follows it.
   - Voice guide mode ("Start with voice guide" on the pain guide's first
     page): every step is read out, the drawing page opens with a demo (the
     body turns by itself, a hand shows the swipe and the drawing, Draw and
     Undo glow), and each answer is read back with "Yes, continue" /
     "Change it" before the guide moves on. PainAssessment says what each
     screen reads back and how it goes on (src/data/guideStage.js).
   - Answering by voice: only after the patient agrees (MIC_ASK, with the
     privacy note) and the browser's own permission prompt. The microphone
     listens only after the assistant has finished asking something, never
     while it talks, and the face glows teal while it listens. What was
     heard is matched on the device (src/data/voiceMatch.js); a safety item
     is never ticked from speech. "Stop listening", the mic button or the
     chat's mic switch turn it off.
   - It stays out of the way of medical advice: on the "see a doctor" page it
     is not shown at all, and any message that sounds like an emergency gets
     9-1-1 / 9-8-8 first. */

const GOLD = '#c9a96e'
const GOLD_LIGHT = '#e8d5b0'
const NAVY = '#0a1a2f'
const PANEL = '#10243f'
const SKIN = '#f6edde'   // the logo's background and skin colour
const INK = '#231f1c'    // the logo's line colour

const ASSESS_ROUTES = ['/', '/pain-mapper']
/* In voice guide mode these steps are read out question by question (the
   screen's own words), not with the step's general tip. */
const SCREEN_STAGES = ['emergency', 'physician', 'injury', 'questions']
const HIDDEN_ROUTES = ['/data-review']

/* Small, failure-proof storage: private windows and blocked storage throw. */
const store = {
  get(area, k) { try { return window[area].getItem(k) } catch { return null } },
  set(area, k, v) { try { window[area].setItem(k, v) } catch { /* not kept */ } },
}
const seenList = () => { try { return JSON.parse(store.get('sessionStorage', 'tg-seen') || '[]') } catch { return [] } }
const markSeen = (key) => { const s = seenList(); if (!s.includes(key)) store.set('sessionStorage', 'tg-seen', JSON.stringify([...s, key])) }

const splitSentences = (text) => (String(text).match(/[^.!?]+[.!?]+["')’]?\s*|[^.!?]+$/g) || [text]).map((s) => s.trim()).filter(Boolean)

const useMedia = (query) => {
  const get = () => typeof window !== 'undefined' && window.matchMedia(query).matches
  const [on, setOn] = useState(get)
  useEffect(() => {
    const m = window.matchMedia(query)
    const f = () => setOn(m.matches)
    m.addEventListener ? m.addEventListener('change', f) : m.addListener(f)
    return () => (m.removeEventListener ? m.removeEventListener('change', f) : m.removeListener(f))
  }, [query])
  return on
}

/* ── Voice ─────────────────────────────────────────────────────────────── */
let chosenVoice = null
function pickVoice() {
  if (chosenVoice) return chosenVoice
  const voices = window.speechSynthesis.getVoices() || []
  if (!voices.length) return null
  const english = voices.filter((v) => /^en([-_]|$)/i.test(v.lang))
  const pool = english.length ? english : voices
  const score = (v) => {
    let n = 0
    if (NATURAL_MARKS.some((m) => v.name.includes(m))) n += 100
    const i = PREFERRED_VOICES.findIndex((p) => v.name.includes(p))
    if (i >= 0) n += 50 - i
    // A Canadian (BC) accent where the browser has one (Chandra, 10 Oct 2026).
    if (/en[-_]CA/i.test(v.lang)) n += 20
    else if (/en[-_]IN/i.test(v.lang)) n += 5
    if (ROBOTIC_VOICES.some((r) => v.name.includes(r))) n -= 200
    return n
  }
  return (chosenVoice = pool.reduce((best, v) => (score(v) > score(best) ? v : best), pool[0]))
}

/* ── Listening ─────────────────────────────────────────────────────────────
   The browser's speech recognition (Chrome, Edge, Safari; not Firefox).
   Where the browser can do it on the device, it is asked to. */
const Recognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
let onDevice = null
async function canRecogniseOnDevice() {
  if (onDevice !== null) return onDevice
  onDevice = false
  try {
    if (Recognition && typeof Recognition.available === 'function') {
      onDevice = (await Recognition.available({ langs: ['en-CA'], processLocally: true })) === 'available'
    }
  } catch { /* not offered */ }
  return onDevice
}

/* level: a ref the face reads every frame ({ speaking, pulse, analyser }). */
function useVoice(level) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  const [now, setNow] = useState({ id: null, idx: -1 })   // which message, which sentence (-2: all of it)
  const token = useRef(0)
  const audio = useRef(null)
  const audioCtx = useRef(null)

  useEffect(() => {
    if (!supported) return
    const f = () => { chosenVoice = null; pickVoice() }
    window.speechSynthesis.addEventListener?.('voiceschanged', f)
    pickVoice()
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', f)
  }, [supported])

  const finish = useCallback(() => {
    level.current.speaking = false
    level.current.analyser = null
    setNow({ id: null, idx: -1 })
  }, [level])

  // When of the last cut-off: Chrome can drop speech started in the same
  // moment as a cancel, so new speech waits a little after one.
  const cutAt = useRef(0)
  const stop = useCallback(() => {
    token.current += 1
    if (supported && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) cutAt.current = Date.now()
    if (supported) window.speechSynthesis.cancel()
    if (audio.current) { audio.current.pause(); audio.current = null }
    finish()
  }, [supported, finish])

  const sayText = useCallback((id, text, t) => {
    if (!supported) return
    const wait = 150 - (Date.now() - cutAt.current)
    if (wait > 0) { setTimeout(() => { if (t === token.current) sayText(id, text, t) }, wait); return }
    const parts = splitSentences(text)
    window.speechSynthesis.resume?.()
    parts.forEach((part, i) => {
      const u = new SpeechSynthesisUtterance(part)
      const v = pickVoice()
      if (v) { u.voice = v; u.lang = v.lang } else u.lang = 'en-CA'
      u.rate = VOICE_STYLE.rate
      u.pitch = VOICE_STYLE.pitch
      u.volume = VOICE_STYLE.volume
      u.onstart = () => { if (t !== token.current) return; level.current.speaking = true; setNow({ id, idx: i }) }
      u.onboundary = () => { level.current.pulse = 1 }
      u.onend = () => {
        if (t !== token.current) return
        level.current.speaking = false
        if (i === parts.length - 1) finish()
      }
      u.onerror = u.onend
      window.speechSynthesis.speak(u)
    })
  }, [supported, level, finish])

  // Must be called straight from a tap the first time (phones only allow
  // sound that starts from a tap).
  const speak = useCallback((id, text, src) => {
    stop()
    const t = token.current
    if (!src) { sayText(id, text, t); return }
    const a = new Audio(src)
    audio.current = a
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      audioCtx.current = audioCtx.current || new Ctx()
      audioCtx.current.resume?.()
      const an = audioCtx.current.createAnalyser()
      an.fftSize = 512
      audioCtx.current.createMediaElementSource(a).connect(an)
      an.connect(audioCtx.current.destination)
      level.current.analyser = an
    } catch { /* no level: the mouth uses its own rhythm */ }
    a.onplay = () => { if (t === token.current) { level.current.speaking = true; setNow({ id, idx: -2 }) } }
    a.onended = () => { if (t === token.current) finish() }
    a.play().catch(() => { if (t === token.current) { audio.current = null; level.current.analyser = null; sayText(id, text, t) } })
  }, [stop, sayText, level, finish])

  useEffect(() => stop, [stop])
  // Any video or sound on the page (such as the how-it-works video) starts:
  // the guide goes quiet rather than talking over it.
  useEffect(() => {
    const onPlay = (e) => { if (e.target !== audio.current) stop() }
    document.addEventListener('play', onPlay, true)
    return () => document.removeEventListener('play', onPlay, true)
  }, [stop])
  return { supported, speak, stop, now }
}

/* ── The face ──────────────────────────────────────────────────────────────
   The open mouth is a dark shape between the upper teeth and a lower curve
   that drops as the mouth opens; at rest it is flat and the logo's own smile
   shows. Points are in the logo's pixels. */
const mouth = (d) => `M312 733 Q450 766 588 726 Q450 ${(766 + 2.2 * d).toFixed(1)} 312 733 Z`

function Face({ level, speaking }) {
  const mouthRef = useRef(null)
  useEffect(() => {
    let raf = 0
    let open = 0
    let wobble = 0.7
    let nextWobble = 0
    const frame = (t) => {
      const L = level.current
      let target = 0
      if (L.speaking) {
        if (L.analyser) {
          const buf = new Uint8Array(L.analyser.fftSize)
          L.analyser.getByteTimeDomainData(buf)
          let sum = 0
          for (let i = 0; i < buf.length; i++) { const x = (buf[i] - 128) / 128; sum += x * x }
          target = Math.min(1, Math.sqrt(sum / buf.length) * 5)
        } else {
          // About four syllables a second, each a slightly different size.
          if (t > nextWobble) { wobble = 0.45 + Math.random() * 0.55; nextWobble = t + 110 + Math.random() * 90 }
          target = Math.abs(Math.sin(t / 1000 * Math.PI * 4.2)) * wobble
        }
      }
      if (L.pulse > 0.02) { target = Math.max(target, L.pulse * 0.9); L.pulse *= 0.82 }
      open += (target - open) * 0.4
      if (open < 0.01) open = 0
      if (mouthRef.current) mouthRef.current.setAttribute('d', mouth(open * 36))
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [level])

  return (
    <svg viewBox="-10 70 860 860" className={'tg-svg' + (speaking ? ' tg-talk' : '')} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="tg-circle"><circle cx="420" cy="500" r="430" /></clipPath>
      </defs>
      <g clipPath="url(#tg-circle)">
        <rect x="-10" y="70" width="860" height="860" fill={SKIN} />
        <g className="tg-head">
          <image href="/images/logo2.png" x="0" y="0" width="836" height="1134" />
          <path ref={mouthRef} d={mouth(0)} fill="#2b1a17" />
          {/* Eyelids for the blink: skin over the eye and a closed lid line. */}
          <g className="tg-lids">
            <ellipse cx="300" cy="507" rx="76" ry="27" fill={SKIN} />
            <ellipse cx="580" cy="498" rx="76" ry="27" fill={SKIN} />
            <path d="M226 506 Q300 530 374 504" fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round" />
            <path d="M506 498 Q580 521 654 494" fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round" />
          </g>
        </g>
      </g>
    </svg>
  )
}

/* ── Icons ─────────────────────────────────────────────────────────────── */
const Speaker = ({ on }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
    {on ? <><path d="M16 9a4 4 0 0 1 0 6" /><path d="M18.5 6.5a7.5 7.5 0 0 1 0 11" /></> : <path d="M17 9l5 6M22 9l-5 6" />}
  </svg>
)
const Play = () => <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" fill="currentColor" /></svg>
const StopIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" /></svg>
const Down = () => <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
const Close = () => <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
const Mic = () => <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" stroke="none" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" /></svg>
const Send = () => <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20.5l18-8.5L3 3.5v6.6l12 1.9-12 1.9z" fill="currentColor" /></svg>

/* A message, with the sentence being read out highlighted. */
function Spoken({ text, active }) {
  if (active === -1) return <>{text}</>
  return splitSentences(text).map((s, i) => (
    <span key={i} className={active === -2 || active === i ? 'tg-now' : 'tg-later'}>{s} </span>
  ))
}

/* The round microphone button in a message: ask, listen, or stop. */
function MicButton({ on, hearing, onClick }) {
  return (
    <button className={'tg-mic' + (on ? ' on' : '') + (hearing ? ' tg-hearing' : '')} onClick={onClick}
      aria-label={!on ? 'Answer by speaking' : hearing ? 'Stop listening' : 'Speak your answer'}>
      <Mic />{!on ? ' Speak' : hearing ? ' Listening' : ''}
    </button>
  )
}
/* While listening: what is being heard; afterwards: what was understood. */
function Hearing({ hearing, heard }) {
  if (hearing) return <p className="tg-heard" aria-live="polite"><b>Listening…</b> {hearing.text}</p>
  if (heard) return <p className="tg-heard">You said: <b>“{heard}”</b></p>
  return null
}

/* ── The guide ─────────────────────────────────────────────────────────── */
export default function TalkingGuide() {
  const { pathname } = useLocation()
  const stage = useGuideStage()
  const phone = useMedia('(pointer: coarse)')
  const assess = ASSESS_ROUTES.includes(pathname)
  const ctxKey = assess ? `guide:${stage || 'landing'}` : pathname
  const page = PAGE_MESSAGES[ctxKey]
  const hidden = HIDDEN_ROUTES.some((r) => pathname.startsWith(r)) || (assess && SILENT_STAGES.includes(stage))

  const level = useRef({ speaking: false, pulse: 0, analyser: null })
  const voice = useVoice(level)
  const [mode, setMode] = useState('face')          // 'face' | 'bubble' | 'chat'
  const [log, setLog] = useState([])                // { id, from: 'guide'|'me', text, link?, urgent?, audio? }
  const [chips, setChips] = useState(DEFAULT_CHIPS)
  const [unread, setUnread] = useState(false)
  const [voiceOn, setVoiceOn] = useState(() => store.get('localStorage', 'tg-voice') === 'on')
  const [draft, setDraft] = useState('')
  const nextId = useRef(1)
  const logRef = useRef(null)
  const inputRef = useRef(null)
  const modeRef = useRef(mode)
  modeRef.current = mode
  const guided = useGuided()
  const screenSig = useGuideScreenSig()
  const [confirm, setConfirm] = useState(null)        // { key, changeLabel } while a read-back waits for Yes / Change
  const voiceOnRef = useRef(voiceOn)
  voiceOnRef.current = voiceOn || guided
  const guidedRef = useRef(guided)
  guidedRef.current = guided
  // Answering by voice: agreed this visit (kept for the tab only).
  const [micOn, setMicOn] = useState(() => !!Recognition && store.get('sessionStorage', 'tg-mic') === 'on')
  const micOnRef = useRef(micOn)
  micOnRef.current = micOn
  const [hearing, setHearing] = useState(null)      // { text } while the microphone listens
  const [heardLast, setHeardLast] = useState('')    // what was last understood, shown under the message
  // The words of a message are shown only when asked for ("Show text").
  const [showText, setShowText] = useState(() => store.get('localStorage', 'tg-text') === 'on')
  const toggleText = () => { const on = !showText; setShowText(on); store.set('localStorage', 'tg-text', on ? 'on' : 'off') }
  const micAsked = useRef(store.get('sessionStorage', 'tg-mic') !== null)
  const afterConsent = useRef(null)

  const lastGuide = [...log].reverse().find((m) => m.from === 'guide')

  // Chandra's recorded (cloned) voice when there is a recording of these
  // exact words; otherwise the browser's voice.
  const canSpeak = voice.supported || hasRecordings()
  const say = useCallback((msg) => {
    const src = msg.audio || audioFor(msg.text)
    if (src || voice.supported) voice.speak(msg.id, msg.text, src)
  }, [voice])

  const addGuide = useCallback((text, extra = {}) => {
    const msg = { id: nextId.current++, from: 'guide', text, ...extra }
    setLog((l) => [...l.slice(-40), msg])
    return msg
  }, [])

  // A new page or step: its message joins the conversation (once: the
  // check also stops development's double run adding it twice).
  const handled = useRef(null)
  useEffect(() => {
    const sig = `${ctxKey}|${hidden}|${phone}`
    if (handled.current === sig) return
    handled.current = sig
    voice.stop()
    if (hidden) { setMode('face'); return }
    if (!page) {
      setChips(DEFAULT_CHIPS)
      if (modeRef.current === 'bubble') setMode('face')
      return
    }
    const activated = typeof navigator === 'undefined' || !navigator.userActivation || navigator.userActivation.hasBeenActive
    if (guidedRef.current && assess) {
      // Question steps are read out one screen at a time (below).
      if (SCREEN_STAGES.includes(stage)) { setChips(page.chips || DEFAULT_CHIPS); return }
      // The drawing page opens with the demo, once per visit.
      if (stage === 'draw' && !seenList().includes(ctxKey)) {
        markSeen(ctxKey)
        setChips(page.chips || DEFAULT_CHIPS)
        startDemo()
        return
      }
    }
    const text = forDevice(page.text, phone)
    const msg = addGuide(text, { audio: page.audio })
    if (guidedRef.current && stage === 'guide' && Recognition && !micAsked.current) offerMicAfter.current = msg.id
    setChips(page.chips || DEFAULT_CHIPS)
    const seen = seenList().includes(ctxKey)
    const speakNow = voiceOnRef.current && activated
    if (modeRef.current === 'chat') {
      markSeen(ctxKey)
      if (speakNow) say(msg)
    } else if (!seen && (page.open || speakNow)) {
      markSeen(ctxKey)
      setMode('bubble')
      if (speakNow) say(msg)
    } else {
      setMode('face')
      if (!seen) setUnread(true)
    }
    // Only a change of page or step brings a new message.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctxKey, hidden, phone])

  /* ── Answering by voice ──────────────────────────────────────────────────
     After the assistant asks something, it listens once (expect: 'answer'
     on a question, 'confirm' on a read-back, 'chat' in the chat). Never
     while it is talking: listening starts when the speech has finished. */
  const offerMicAfter = useRef(null)
  const rec = useRef(null)
  const recKind = useRef(null)
  const expectNext = useRef(null)
  const misses = useRef(0)
  const stopListening = useCallback(() => {
    expectNext.current = null
    if (rec.current) { try { rec.current.abort() } catch { /* already stopped */ } rec.current = null }
    setHearing(null)
  }, [])
  const heardRef = useRef(null)   // set below; the handler for what was heard
  const startListening = useCallback(async (kind) => {
    if (!Recognition || !micOnRef.current) return
    if (rec.current) { try { rec.current.abort() } catch { /* already stopped */ } rec.current = null }
    const r = new Recognition()
    r.lang = 'en-CA'
    r.interimResults = true
    r.maxAlternatives = 3
    r.continuous = false
    try { if (await canRecogniseOnDevice()) r.processLocally = true } catch { /* not offered */ }
    let finals = []
    r.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]
        if (res.isFinal) finals = Array.from(res).map((alt) => alt.transcript.trim()).filter(Boolean)
        else interim += res[0].transcript
      }
      setHearing({ text: finals[0] || interim })
    }
    r.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setMicOn(false)
        store.set('sessionStorage', 'tg-mic', 'off')
        heardRef.current && heardRef.current(null, 'denied')
      }
    }
    r.onend = () => {
      if (rec.current === r) rec.current = null
      setHearing(null)
      if (finals.length && heardRef.current) heardRef.current(finals, kind)
    }
    rec.current = r
    recKind.current = kind
    setHearing({ text: '' })
    try { r.start() } catch { rec.current = null; setHearing(null) }
  }, [])
  // Listen once the current speech has finished (or now, if it has).
  const listenFor = useCallback((kind) => {
    if (!micOnRef.current || !Recognition) return
    expectNext.current = kind
  }, [])
  useEffect(() => {
    if (voice.now.id !== null) {
      // The assistant is talking: never listen to itself (and listen again
      // for the same thing once it has finished).
      if (rec.current) {
        expectNext.current = expectNext.current || recKind.current
        try { rec.current.abort() } catch { /* already stopped */ }
        rec.current = null
        setHearing(null)
      }
      return
    }
    if (offerMicAfter.current !== null) { offerMicAfter.current = null; askMic(); return }
    if (!expectNext.current || !micOnRef.current) return
    // A short pause first: speech that is about to start (see useVoice)
    // must not be heard, and the expectation stays until it is.
    const t = setTimeout(() => {
      const ss = window.speechSynthesis
      if (ss && (ss.speaking || ss.pending)) return
      const kind = expectNext.current
      expectNext.current = null
      if (kind) startListening(kind)
    }, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.now.id, micOn, startListening])
  useEffect(() => () => stopListening(), [stopListening])
  useEffect(() => { stopListening() }, [pathname, stopListening])

  // Saying something (a fixed message) and then listening for the reply.
  const sayThen = (text, kind) => {
    const msg = addGuide(text)
    if (modeRef.current === 'face') setMode('bubble')
    say(msg)
    if (kind) listenFor(kind)
  }

  // Asking for the microphone. The browser's own prompt follows the tap.
  const askMic = (then) => {
    micAsked.current = true
    afterConsent.current = then || null
    const msg = addGuide(MIC_ASK)
    setMode('mic')
    say(msg)
  }
  const micYes = () => {
    voice.stop()
    const done = (ok) => {
      setMicOn(ok)
      micOnRef.current = ok
      store.set('sessionStorage', 'tg-mic', ok ? 'on' : 'off')
      const then = afterConsent.current
      afterConsent.current = null
      if (!ok) { sayThen(VOICE.denied); return }
      if (then) { then(); return }
      const sc = getGuideScreen()
      sayThen(VOICE.on, sc && sc.voice ? 'answer' : null)
    }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => { stream.getTracks().forEach((t) => t.stop()); done(true) })
        .catch(() => done(false))
    } else done(true)
  }
  const micNo = () => {
    voice.stop()
    store.set('sessionStorage', 'tg-mic', 'off')
    afterConsent.current = null
    setMode('face')
  }
  const micOff = (sayIt = true) => {
    stopListening()
    setMicOn(false)
    micOnRef.current = false
    store.set('sessionStorage', 'tg-mic', 'off')
    if (sayIt) sayThen(VOICE.off)
  }
  // The round mic button: ask first; then listen now, or stop listening.
  const micButton = () => {
    if (!micOn) {
      // From the chat, come back to it and listen for the question.
      askMic(modeRef.current === 'chat' ? () => { setMode('chat'); startListening('chat') } : undefined)
      return
    }
    if (hearing) { stopListening(); return }
    voice.stop()
    const sc = guided ? getGuideScreen() : null
    const kind = modeRef.current === 'confirm' ? 'confirm' : modeRef.current === 'chat' || !sc ? 'chat' : 'answer'
    if (kind === 'chat' && modeRef.current !== 'chat') setMode('chat')
    startListening(kind)
  }

  /* ── Voice guide: the drawing demo ── */
  const demo = useRef({ msgId: null, byVoice: false, timers: [] })
  const [demoOn, setDemoOn] = useState(false)
  const endDemo = useCallback(() => {
    demo.current.timers.forEach(clearTimeout)
    demo.current = { msgId: null, byVoice: false, timers: [] }
    setGuideDemo(null)
    setDemoOn(false)
  }, [])
  const startDemo = () => {
    endDemo()
    const msg = addGuide(forDevice(DEMO, phone))
    demo.current.msgId = msg.id
    setDemoOn(true)
    setMode('bubble')
    say(msg)
    // Without sentence-by-sentence timing (a recording, or no voice), the
    // steps follow the clock instead.
    const at = [[1500, 'turn'], [5600, 'draw'], [9800, 'undo'], [12400, null]]
    demo.current.timers = at.map(([ms, step]) => setTimeout(() => {
      if (demo.current.byVoice || demo.current.msgId !== msg.id) return
      if (step) setGuideDemo(step); else endDemo()
    }, ms))
  }
  useEffect(() => {
    const d = demo.current
    if (!d.msgId) return
    if (voice.now.id === d.msgId && voice.now.idx >= 0) { d.byVoice = true; setGuideDemo(DEMO_STEPS[voice.now.idx] ?? null) }
    else if (voice.now.id === null && d.byVoice) endDemo()
  }, [voice.now, endDemo])
  // The demo stops when the visitor leaves the page, or touches the body.
  useEffect(() => { if (stage !== 'draw' || !guided) endDemo() }, [stage, guided, endDemo])
  useEffect(() => {
    if (stage !== 'draw') return
    const onDown = (e) => { if (demo.current.msgId && e.target.closest && e.target.closest('.pa-model-stage')) { voice.stop(); endDemo() } }
    document.addEventListener('pointerdown', onDown, true)
    return () => document.removeEventListener('pointerdown', onDown, true)
  }, [stage, voice, endDemo])

  /* ── Voice guide: read each screen out, and read back each answer ──
     The read-back opens by itself once a single answer is picked (or, on
     the drawing page, once the drawing has rested a few seconds), and when
     Continue is tapped. "Yes, continue" runs the screen's own Continue. */
  const screenSeen = useRef({ key: null, sig: null })
  const askTimer = useRef(0)
  const askBack = useCallback(() => {
    const sc = getGuideScreen()
    if (!sc || !sc.ready || !sc.readBack) return false
    const msg = addGuide(sc.readBack)
    setConfirm({ key: sc.key, changeLabel: sc.changeLabel || 'Change it' })
    setMode('confirm')
    say(msg)
    misses.current = 0
    listenFor('confirm')
    return true
  }, [addGuide, say, listenFor])
  useEffect(() => {
    clearTimeout(askTimer.current)
    const sc = guided ? getGuideScreen() : null
    if (!sc) { screenSeen.current = { key: null, sig: null }; setConfirm(null); if (modeRef.current === 'confirm') setMode('face'); return }
    if (sc.key !== screenSeen.current.key) {
      screenSeen.current = { key: sc.key, sig: sc.sig }
      setConfirm(null)
      if (sc.say) {
        // The step's general tip comes first, the first time (the safety pages' own words already say it).
        const intro = page && (stage === 'questions' || stage === 'injury') && !seenList().includes(ctxKey) ? forDevice(page.text, phone) + ' ' : ''
        markSeen(ctxKey)
        const msg = addGuide(intro + sc.say)
        setMode('bubble')
        say(msg)
        misses.current = 0
        if (sc.voice) listenFor('answer')
      } else if (modeRef.current === 'confirm') setMode('face')
      return
    }
    if (sc.sig === screenSeen.current.sig) return
    screenSeen.current.sig = sc.sig
    if (rec.current) stopListening()
    if (modeRef.current === 'confirm') { voice.stop(); setConfirm(null); setMode('face') }
    if (!sc.ready) return
    if (sc.auto === true) askTimer.current = setTimeout(askBack, 700)
    else if (sc.auto === 'idle') askTimer.current = setTimeout(() => { if (!demo.current.msgId) askBack() }, 4500)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenSig, guided])
  useEffect(() => () => clearTimeout(askTimer.current), [])

  // Continue, in voice guide mode, first reads back what was chosen.
  const confirmRef = useRef(confirm)
  confirmRef.current = confirm
  useEffect(() => {
    if (!guided) return
    const onClick = (e) => {
      const btn = e.target.closest && e.target.closest('.pa-primary')
      if (!btn || btn.disabled) return
      const sc = getGuideScreen()
      if (!sc || !sc.ready || !sc.readBack) return
      if (confirmRef.current && confirmRef.current.key === sc.key && modeRef.current === 'confirm') return  // asked and showing: Continue says yes
      clearTimeout(askTimer.current)
      if (askBack()) { e.preventDefault(); e.stopPropagation() }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [guided, askBack])

  const confirmYes = () => {
    stopListening()
    voice.stop()
    setConfirm(null)
    setMode('face')
    const sc = getGuideScreen()
    if (sc && sc.ready) sc.proceed()
  }
  const confirmChange = () => {
    stopListening()
    setConfirm(null)
    const msg = addGuide(CHANGE_REPLY)
    setMode('bubble')
    say(msg)
    if (getGuideScreen()?.voice) listenFor('answer')
  }

  // What was heard: a command, yes / no, an answer, or a chat question.
  const retry = (kind) => {
    misses.current += 1
    if (misses.current >= 3) { sayThen(VOICE.giveUp); return }
    sayThen(kind === 'confirm' ? VOICE.yesNo : VOICE.again, kind)
  }
  heardRef.current = (alts, kind) => {
    if (kind === 'denied') { sayThen(VOICE.denied); return }
    const text = alts[0]
    setHeardLast(text)
    const cmd = command(text)
    if (cmd === 'stop') { micOff(true); return }
    if (cmd === 'help') { sayThen(VOICE.help, kind); return }
    if (cmd === 'repeat' && lastGuide) { say(lastGuide); listenFor(kind); return }
    if (cmd === 'back' && kind !== 'chat') {
      const back = document.querySelector('.pa-section .pa-actions > button:not(.pa-primary)')
      if (back) { setConfirm(null); back.click() }
      return
    }
    if (kind === 'chat') { reply(text, findReply(text)); return }
    if (kind === 'confirm') {
      const yn = alts.map(yesNo).find(Boolean)
      if (yn === 'yes') confirmYes()
      else if (yn === 'no') confirmChange()
      else retry('confirm')
      return
    }
    const sc = getGuideScreen()
    if (!sc || !sc.voice) return
    if (sc.voice === 'answer') {
      let ids = []
      for (const a of alts) { ids = matchOptions(a, sc.options, sc.multi); if (ids.length) break }
      if (!ids.length) { retry('answer'); return }
      misses.current = 0
      ids.forEach((id) => sc.pick(id))
      // One-answer questions read back by themselves; the rest are asked here.
      if (sc.multi || sc.auto !== true) setTimeout(() => askBack(), 500)
    } else if (sc.voice === 'none') {
      if (alts.some(saysNone)) setTimeout(() => askBack(), 100)
      else sayThen(VOICE.safetyTap, 'answer')
    } else if (sc.voice === 'confirm') {
      if (alts.some((a) => yesNo(a) === 'yes')) askBack()
      else sayThen(VOICE.tapThenDone, 'answer')
    }
  }

  // Keep the newest message in view.
  useEffect(() => {
    if (mode === 'chat' && logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [log, mode])

  // Escape tucks the guide away.
  useEffect(() => {
    if (mode === 'face') return
    const onKey = (e) => { if (e.key === 'Escape') { voice.stop(); setMode('face') } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, voice])

  // A tip is a passing note: a tap anywhere else on the page puts it away
  // (unless it is being read out), so it never stands between the visitor
  // and a button such as Continue.
  const rootRef = useRef(null)
  const speakingNow = voice.now.id !== null
  useEffect(() => {
    if ((mode !== 'bubble' && mode !== 'confirm') || speakingNow) return
    const onDown = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) { setConfirm(null); setMode('face') } }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [mode, speakingNow])

  const openChat = () => {
    setUnread(false)
    markSeen(ctxKey)
    setMode('chat')
    if (!phone) setTimeout(() => inputRef.current?.focus(), 60)
  }
  const tuckAway = () => { voice.stop(); setMode('face') }
  const toggleFace = () => {
    if (mode === 'face') {
      // A new tip is shown first; otherwise straight into the conversation.
      if (unread && page) { setUnread(false); markSeen(ctxKey); setMode('bubble'); if (voiceOn && lastGuide) say(lastGuide) }
      else openChat()
    } else tuckAway()
  }

  const setVoice = (on) => {
    setVoiceOn(on)
    store.set('localStorage', 'tg-voice', on ? 'on' : 'off')
    if (!on) voice.stop()
    else if (lastGuide) say(lastGuide)
  }

  const listen = (msg) => {
    if (voice.now.id === msg.id) { voice.stop(); return }
    if (!voiceOn) { setVoiceOn(true); store.set('localStorage', 'tg-voice', 'on') }
    say(msg)
  }

  const reply = (question, r) => {
    setLog((l) => [...l.slice(-40), { id: nextId.current++, from: 'me', text: question }])
    const msg = addGuide(forDevice(r.a, phone), { link: r.link, urgent: r.urgent, calls: r.calls })
    setChips(r.urgent ? [] : r.next && r.next.length ? r.next : (page?.chips || DEFAULT_CHIPS))
    if (voiceOn) say(msg)
    else voice.stop()
  }
  const askTopic = (id) => {
    const t = TOPICS[id]
    if (t) reply(t.q, { a: t.a, next: t.next, link: t.link })
  }
  const submit = (e) => {
    e.preventDefault()
    const q = draft.trim()
    if (!q) return
    setDraft('')
    reply(q, findReply(q))
  }

  if (hidden) return null
  const speaking = voice.now.id !== null
  // A message's words, or (until "Show text") just what the assistant is doing.
  const wordsShown = showText || !canSpeak
  const Words = ({ msg, idle }) => (wordsShown ? (
    <p className="tg-bubble-text" aria-live="polite"><Spoken text={msg.text} active={voice.now.id === msg.id ? voice.now.idx : -1} /></p>
  ) : (
    <p className="tg-status" aria-live="polite">
      {hearing ? <><span className="tg-dots tg-dots-teal" aria-hidden="true"><i /><i /><i /></span> Listening…</>
        : voice.now.id === msg.id ? <><span className="tg-dots" aria-hidden="true"><i /><i /><i /></span> Speaking…</>
          : idle}
    </p>
  ))
  const TextToggle = () => (canSpeak ? (
    <button className="tg-textbtn" onClick={toggleText} aria-pressed={showText}>{showText ? 'Hide text' : 'Show text'}</button>
  ) : null)

  return (
    <div ref={rootRef} className={'tg-root' + (mode === 'chat' ? ' tg-open' : '')}>
      {mode === 'mic' && lastGuide && (
        <div className="tg-bubble tg-confirm" role="dialog" aria-label="Answer by speaking?">
          <p className="tg-bubble-name">Virtual assistant <TextToggle /></p>
          <Words msg={lastGuide} idle="Would you like to answer by speaking?" />
          <p className="tg-note">{MIC_NOTE} <Link to="/privacy" className="tg-link">Privacy notice</Link></p>
          <div className="tg-bubble-actions">
            <button className="tg-btn tg-btn-gold tg-btn-big" onClick={micYes}><Mic /> Use my microphone</button>
            <button className="tg-btn tg-btn-big" onClick={micNo}>No thanks, I’ll tap</button>
          </div>
        </div>
      )}

      {mode === 'confirm' && confirm && lastGuide && (
        <div className="tg-bubble tg-confirm" role="dialog" aria-label="Please check your answer">
          <p className="tg-bubble-name">Virtual assistant <TextToggle /></p>
          <Words msg={lastGuide} idle="Is that right?" />
          <div className="tg-bubble-actions">
            <button className="tg-btn tg-btn-gold tg-btn-big" onClick={confirmYes}>✓ Yes, continue</button>
            <button className="tg-btn tg-btn-big" onClick={confirmChange}>{confirm.changeLabel}</button>
            {Recognition && guided && <MicButton on={micOn} hearing={hearing} onClick={micButton} />}
          </div>
          {wordsShown && <Hearing hearing={hearing} heard={heardLast} />}
        </div>
      )}

      {mode === 'bubble' && lastGuide && (
        <div className="tg-bubble" role="dialog" aria-label="Message from Physio Chandra's virtual assistant">
          <button className="tg-icon tg-bubble-x" onClick={tuckAway} aria-label="Close message"><Close /></button>
          <p className="tg-bubble-name">Virtual assistant <TextToggle /></p>
          <Words msg={lastGuide} idle="Tap Listen to hear me." />
          <div className="tg-bubble-actions">
            {canSpeak && (
              <button className="tg-btn tg-btn-gold" onClick={() => listen(lastGuide)} aria-pressed={voice.now.id === lastGuide.id}>
                {voice.now.id === lastGuide.id ? <><StopIcon /> Stop</> : <><Play /> Listen</>}
              </button>
            )}
            {guided && stage === 'draw' && !demoOn && (
              <button className="tg-btn" onClick={startDemo}>Show me again</button>
            )}
            <button className="tg-btn" onClick={openChat}>Ask a question</button>
            {Recognition && guided && <MicButton on={micOn} hearing={hearing} onClick={micButton} />}
          </div>
          {guided && wordsShown && <Hearing hearing={hearing} heard={heardLast} />}
        </div>
      )}

      {mode === 'chat' && (
        <section className="tg-chat" role="dialog" aria-label="Physio Chandra's virtual assistant">
          <header className="tg-chat-head">
            <div className="tg-chat-title">
              <p className="tg-chat-name">Physio Chandra’s virtual assistant</p>
              <p className="tg-chat-sub">Ready-made answers · {hasRecordings() ? 'AI copy of Chandra’s voice' : 'computer voice'} · nothing you type is sent</p>
            </div>
            {canSpeak && (
              <button className="tg-icon" onClick={() => setVoice(!voiceOn)} aria-pressed={voiceOn}
                aria-label={voiceOn ? 'Turn the voice off' : 'Turn the voice on'} title={voiceOn ? 'Voice on' : 'Voice off'}>
                <Speaker on={voiceOn} />
              </button>
            )}
            {Recognition && micOn && (
              <button className="tg-icon" onClick={() => micOff(false)} aria-pressed="true"
                aria-label="Switch the microphone off" title="Microphone on">
                <Mic />
              </button>
            )}
            <button className="tg-icon" onClick={tuckAway} aria-label="Close the guide"><Down /></button>
          </header>

          <div className="tg-log" ref={logRef} aria-live="polite">
            {log.length === 0 && (
              <p className="tg-msg tg-from-guide">{GREETING}</p>
            )}
            {log.map((m) => (m.from === 'me' ? (
              <p key={m.id} className="tg-msg tg-from-me">{m.text}</p>
            ) : (
              <div key={m.id} className={'tg-msg tg-from-guide' + (m.urgent ? ' tg-urgent' : '')}>
                <p><Spoken text={m.text} active={voice.now.id === m.id ? voice.now.idx : -1} /></p>
                {m.calls && (
                  <div className="tg-calls">
                    {m.calls.map((c) => <a key={c.href} href={c.href} className="tg-call">{c.label}</a>)}
                  </div>
                )}
                <div className="tg-msg-foot">
                  {m.link && <Link to={m.link.to} className="tg-link" onClick={() => phone && setMode('face')}>{m.link.label} →</Link>}
                  {canSpeak && (
                    <button className="tg-replay" onClick={() => listen(m)}
                      aria-label={voice.now.id === m.id ? 'Stop reading' : 'Read this out'}>
                      {voice.now.id === m.id ? <StopIcon /> : <Play />}
                    </button>
                  )}
                </div>
              </div>
            )))}
          </div>

          {chips.length > 0 && (
            <div className="tg-chips" role="group" aria-label="Suggested questions">
              {chips.filter((id) => TOPICS[id]).map((id) => (
                <button key={id} className="tg-chip" onClick={() => askTopic(id)}>{TOPICS[id].q}</button>
              ))}
            </div>
          )}

          <form className="tg-form" onSubmit={submit}>
            <label htmlFor="tg-input" className="tg-sr">Ask a question</label>
            <input id="tg-input" ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask a question…" autoComplete="off" maxLength={200} />
            {Recognition && (
              <button type="button" className={'tg-send tg-send-mic' + (hearing ? ' tg-hearing' : '')} onClick={micButton}
                aria-label={hearing ? 'Stop listening' : 'Ask by speaking'}><Mic /></button>
            )}
            <button type="submit" className="tg-send" aria-label="Send" disabled={!draft.trim()}><Send /></button>
          </form>
          {hearing && <p className="tg-listening-line">Listening… {hearing.text}</p>}
        </section>
      )}

      <button className={'tg-face' + (speaking ? ' tg-face-talk' : '') + (hearing ? ' tg-face-listen' : '')} onClick={toggleFace}
        aria-label={mode === 'face' ? 'Open the virtual assistant' : 'Close the virtual assistant'} aria-expanded={mode !== 'face'}>
        <Face level={level} speaking={speaking} />
        {unread && mode === 'face' && <span className="tg-dot" aria-hidden="true" />}
      </button>

      <style>{`
        .tg-root {
          position: fixed; z-index: 400;
          right: max(16px, env(safe-area-inset-right));
          bottom: max(16px, env(safe-area-inset-bottom));
          font-family: var(--font-body); color: #fff;
        }
        .tg-face {
          position: relative; display: block; width: 72px; height: 72px; padding: 0; border-radius: 50%;
          border: 2px solid ${GOLD}; background: ${SKIN}; cursor: pointer;
          box-shadow: 0 8px 24px rgba(0,0,0,0.45), 0 0 0 4px rgba(10,26,47,0.6);
          transition: transform 0.35s var(--ease), box-shadow 0.35s;
        }
        .tg-face:hover { transform: translateY(-2px); }
        .tg-face:focus-visible { outline: 3px solid ${GOLD_LIGHT}; outline-offset: 3px; }
        .tg-face-talk { transform: scale(1.1); box-shadow: 0 8px 24px rgba(0,0,0,0.45), 0 0 0 4px rgba(201,169,110,0.35); }
        .tg-face-talk:hover { transform: scale(1.1); }
        .tg-svg { display: block; width: 100%; height: 100%; border-radius: 50%; }
        .tg-dot {
          position: absolute; top: 1px; right: 1px; width: 15px; height: 15px; border-radius: 50%;
          background: ${GOLD}; border: 2px solid ${NAVY}; animation: tg-ping 1.8s ease-out 3;
        }
        @keyframes tg-ping { 0% { box-shadow: 0 0 0 0 rgba(201,169,110,0.7); } 100% { box-shadow: 0 0 0 10px rgba(201,169,110,0); } }

        .tg-lids { opacity: 0; animation: tg-blink 5.3s infinite; }
        @keyframes tg-blink { 0%, 94%, 97.5%, 100% { opacity: 0; } 95%, 96.5% { opacity: 1; } }
        .tg-head { transform-origin: 420px 930px; }
        .tg-talk .tg-head { animation: tg-nod 2.6s ease-in-out infinite; }
        @keyframes tg-nod {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          30% { transform: rotate(-1.6deg) translateY(-6px); }
          65% { transform: rotate(1.2deg) translateY(3px); }
        }

        .tg-bubble, .tg-chat {
          position: absolute; right: 0; bottom: calc(100% + 14px);
          background: ${PANEL}; border: 1px solid rgba(201,169,110,0.45); border-radius: 18px;
          box-shadow: 0 18px 50px rgba(0,0,0,0.55);
          animation: tg-in 0.35s var(--ease);
        }
        @keyframes tg-in { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: none; } }
        .tg-bubble { width: min(350px, calc(100vw - 32px)); padding: 16px 18px 16px; }
        .tg-bubble::after {
          content: ''; position: absolute; right: 26px; bottom: -8px; width: 14px; height: 14px;
          background: ${PANEL}; border-right: 1px solid rgba(201,169,110,0.45); border-bottom: 1px solid rgba(201,169,110,0.45);
          transform: rotate(45deg);
        }
        .tg-bubble-x { position: absolute; top: 8px; right: 8px; }
        .tg-bubble-name { display: flex; align-items: center; gap: 10px; padding-right: 30px; }
        .tg-textbtn {
          margin-left: auto; padding: 3px 10px; border-radius: 999px; cursor: pointer;
          font: 500 11px var(--font-body); letter-spacing: 0.06em; text-transform: none;
          color: rgba(255,255,255,0.75); background: transparent; border: 1px solid rgba(255,255,255,0.25);
        }
        .tg-textbtn:hover { color: #fff; border-color: ${GOLD_LIGHT}; }
        .tg-confirm .tg-bubble-name { padding-right: 0; }
        .tg-status { display: flex; align-items: center; gap: 10px; font-size: 15px; color: rgba(255,255,255,0.9); margin: 2px 0 14px; min-height: 24px; }
        .tg-dots { display: inline-flex; gap: 4px; }
        .tg-dots i { width: 6px; height: 6px; border-radius: 50%; background: ${GOLD}; animation: tg-dot 1s ease-in-out infinite; }
        .tg-dots i:nth-child(2) { animation-delay: 0.15s; }
        .tg-dots i:nth-child(3) { animation-delay: 0.3s; }
        .tg-dots-teal i { background: #5CC8C2; }
        @keyframes tg-dot { 0%, 100% { transform: translateY(0); opacity: 0.5; } 50% { transform: translateY(-4px); opacity: 1; } }
        .tg-bubble-name { font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: ${GOLD}; margin: 0 0 6px; }
        .tg-bubble-text { font-size: 15px; line-height: 1.6; color: rgba(255,255,255,0.92); margin: 0 26px 14px 0; max-height: max(90px, min(300px, calc(100dvh - 330px))); overflow-y: auto; }
        .tg-bubble-actions { display: flex; gap: 8px; flex-wrap: wrap; }

        .tg-now { color: #fff; }
        .tg-later { color: rgba(255,255,255,0.55); }

        .tg-btn {
          display: inline-flex; align-items: center; gap: 7px; min-height: 40px; padding: 8px 16px; border-radius: 999px;
          font: 500 14px var(--font-body); cursor: pointer; color: #fff;
          background: transparent; border: 1px solid rgba(255,255,255,0.35);
        }
        .tg-btn:hover { border-color: ${GOLD_LIGHT}; }
        .tg-btn-gold { background: ${GOLD}; border-color: ${GOLD}; color: ${NAVY}; }
        .tg-btn-big { min-height: 48px; padding: 10px 20px; font-size: 15.5px; flex: 1 1 auto; justify-content: center; }
        .tg-confirm { border-color: ${GOLD}; }
        .tg-note { font-size: 12.5px; line-height: 1.5; color: rgba(255,255,255,0.65); margin: -4px 0 14px; }
        .tg-mic {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 40px; min-width: 40px;
          padding: 8px 12px; border-radius: 999px; cursor: pointer; font: 500 13.5px var(--font-body);
          border: 1px solid rgba(92,200,194,0.7); background: rgba(92,200,194,0.12); color: #7DD8D3;
        }
        .tg-mic.on { background: rgba(92,200,194,0.2); }
        .tg-hearing, .tg-mic.tg-hearing { background: #5CC8C2; color: ${NAVY}; animation: tg-listen 1.2s ease-in-out infinite; }
        @keyframes tg-listen { 0%, 100% { box-shadow: 0 0 0 0 rgba(92,200,194,0.6); } 50% { box-shadow: 0 0 0 8px rgba(92,200,194,0); } }
        .tg-face-listen { box-shadow: 0 8px 24px rgba(0,0,0,0.45), 0 0 0 4px #5CC8C2; animation: tg-listen 1.2s ease-in-out infinite; }
        .tg-heard { font-size: 13px; color: rgba(255,255,255,0.7); margin: 10px 0 0; }
        .tg-heard b { color: #7DD8D3; font-weight: 500; }
        .tg-listening-line { font-size: 13px; color: #7DD8D3; margin: -4px 14px 10px; }
        .tg-send-mic { background: rgba(92,200,194,0.18); color: #7DD8D3; }
        .tg-btn-gold:hover { background: ${GOLD_LIGHT}; }
        .tg-btn:focus-visible, .tg-icon:focus-visible, .tg-chip:focus-visible, .tg-send:focus-visible, .tg-replay:focus-visible, .tg-link:focus-visible {
          outline: 2px solid ${GOLD_LIGHT}; outline-offset: 2px;
        }
        .tg-icon {
          display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; flex-shrink: 0;
          border-radius: 50%; border: none; background: transparent; color: rgba(255,255,255,0.75); cursor: pointer;
        }
        .tg-icon:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .tg-icon[aria-pressed="true"] { color: ${GOLD}; }

        .tg-chat {
          width: min(380px, calc(100vw - 32px)); height: min(560px, calc(100dvh - 210px));
          display: flex; flex-direction: column; overflow: hidden;
        }
        .tg-chat-head { display: flex; align-items: center; gap: 4px; padding: 12px 8px 10px 18px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .tg-chat-title { flex: 1; min-width: 0; }
        .tg-chat-name { font-family: var(--font-display); font-size: 21px; font-weight: 500; margin: 0; color: #fff; }
        .tg-chat-sub { font-size: 11.5px; color: rgba(255,255,255,0.5); margin: 2px 0 0; line-height: 1.4; }
        .tg-log { flex: 1; overflow-y: auto; padding: 14px 14px 6px; display: flex; flex-direction: column; gap: 10px; overscroll-behavior: contain; }
        .tg-msg { margin: 0; max-width: 88%; font-size: 14.5px; line-height: 1.55; padding: 10px 13px; border-radius: 14px; }
        .tg-msg p { margin: 0; }
        .tg-from-guide { align-self: flex-start; background: rgba(255,255,255,0.07); border-bottom-left-radius: 4px; }
        .tg-from-me { align-self: flex-end; background: rgba(201,169,110,0.22); border: 1px solid rgba(201,169,110,0.4); border-bottom-right-radius: 4px; }
        .tg-urgent { background: rgba(214,69,65,0.18); border: 1px solid rgba(240,110,100,0.6); }
        .tg-calls { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .tg-call {
          display: inline-flex; align-items: center; min-height: 36px; padding: 6px 12px; border-radius: 999px;
          background: #fff; color: #8a1c17; font-weight: 600; font-size: 13.5px;
        }
        .tg-msg-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 6px; }
        .tg-msg-foot:empty { display: none; }
        .tg-link { color: ${GOLD_LIGHT}; text-decoration: underline; font-size: 13.5px; }
        .tg-replay {
          margin-left: auto; display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px;
          border-radius: 50%; border: 1px solid rgba(255,255,255,0.25); background: transparent; color: rgba(255,255,255,0.8); cursor: pointer;
        }
        .tg-replay:hover { border-color: ${GOLD}; color: ${GOLD}; }
        .tg-chips { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 14px 4px; border-top: 1px solid rgba(255,255,255,0.06); }
        .tg-chip {
          min-height: 34px; padding: 5px 12px; border-radius: 999px; cursor: pointer; text-align: left;
          font: 400 13.5px var(--font-body); color: ${GOLD_LIGHT}; background: rgba(201,169,110,0.1); border: 1px solid rgba(201,169,110,0.45);
        }
        .tg-chip:hover { background: rgba(201,169,110,0.22); }
        .tg-form { display: flex; gap: 8px; padding: 8px 12px 12px; }
        .tg-form input {
          flex: 1; min-width: 0; min-height: 44px; padding: 0 14px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.06); color: #fff;
          font: 400 16px var(--font-body);
        }
        .tg-form input::placeholder { color: rgba(255,255,255,0.45); }
        .tg-form input:focus { outline: none; border-color: ${GOLD}; }
        .tg-send {
          width: 44px; height: 44px; flex-shrink: 0; border-radius: 50%; border: none; cursor: pointer;
          background: ${GOLD}; color: ${NAVY}; display: inline-flex; align-items: center; justify-content: center;
        }
        .tg-send:disabled { opacity: 0.4; cursor: default; }
        .tg-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

        @media (max-width: 600px), (pointer: coarse) and (max-width: 900px) {
          .tg-face { width: 54px; height: 54px; }
          .tg-bubble-text { font-size: 15px; max-height: max(90px, min(34dvh, calc(100dvh - 330px))); }
          .tg-chat { height: min(70dvh, calc(100dvh - 190px)); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tg-hearing, .tg-face-listen, .tg-dots i { animation: none; }
          .tg-lids, .tg-talk .tg-head, .tg-dot, .tg-bubble, .tg-chat { animation: none; }
          .tg-face, .tg-face-talk { transition: none; }
        }
        /* Room under the footer, so the face never sits on its last line. */
        .site-footer::after { content: ''; display: block; height: 72px; }
        @media print { .tg-root { display: none; } .site-footer::after { display: none; } }
      `}</style>
    </div>
  )
}
