// Development only: a pretend microphone for testing (?fakemic).
import '../dev/fakeMic.js'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useGuideStage, useGuided, useGuideScreenSig, getGuideScreen, setGuideDemo, setGuided, unlockSpeech, takeGuideReflect, setGuideMic, setGuideConfirmKey, guideEvents, sendBodyMove } from '../data/guideStage'
import {
  PAGE_MESSAGES, SILENT_STAGES, TOPICS, DEFAULT_CHIPS, PREFERRED_VOICES, FEMALE_VOICES, NATURAL_MARKS, ROBOTIC_VOICES, VOICE_STYLE, GREETING, DEMO, DEMO_STEPS, CHANGE_REPLY, ACKS, MIC_ASK, MIC_NOTE, VOICE, audioFor, splitSentences, hasRecordings, findReply, forDevice,
} from '../data/talkingGuide'
import { command, yesNo, saysNone, matchDetail, answerEdit, norm, wakeWord, bodyMove, areaEdit, voiceWords } from '../data/voiceMatch'
import { gotMany, asSentence } from '../data/guideSpeech'
import { OnDeviceRecognition, prepareOnDevice, onDeviceReady, releaseOnDevice } from './onDeviceSpeech'

/* ── The talking guide: Chandra's face in the bottom-left corner ──────────
   On every page (Chandra, 10 Oct 2026). The face is the logo itself
   (/images/logo2.png, already loaded by the navbar), with a mouth that opens
   while it speaks and eyes that blink, drawn over the picture in the same
   coordinates (836 x 1134).

   - Bottom-LEFT corner (Chandra, 13 Oct 2026, after trying the right).
   - No message box opens by itself (Chandra, 13 Oct 2026: it covered the
     page). The assistant speaks with the box closed; a small mute button
     shows on the face while it talks; tapping the face opens the box. In
     voice guide mode the read-back is spoken and the page's own Continue
     is the "yes" (or "yes" by voice); changing the answer is the "no".
   - What it says is heard, not shown: a message shows only "Speaking…" and
     its buttons, and "Show text" brings the words up (remembered on this
     device). Without a voice to hear, the words always show.
   - Welcome on the pain guide's first page and how-to on the second open by
     themselves (once per visit); other pages and steps wait for a tap on the
     face, so the guide never covers a question. A gold dot says there is a
     new tip.
   - Sound is on unless the visitor mutes it (Chandra, 10 Oct 2026): the
     welcome opens 1 second after landing and is read out. Browsers allow a
     page to speak only after the visitor's first tap or key press, so where
     that is blocked the bubble says "Tap anywhere to hear me" and the
     welcome starts on the first tap. Mute (remembered on the device) and a
     volume control sit in every message and in the chat.
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
const SCREEN_STAGES = ['about', 'emergency', 'physician', 'injury', 'questions']
const HIDDEN_ROUTES = ['/data-review']

/* Small, failure-proof storage: private windows and blocked storage throw. */
const store = {
  get(area, k) { try { return window[area].getItem(k) } catch { return null } },
  set(area, k, v) { try { window[area].setItem(k, v) } catch { /* not kept */ } },
}
const seenList = () => { try { return JSON.parse(store.get('sessionStorage', 'tg-seen') || '[]') } catch { return [] } }
const markSeen = (key) => { const s = seenList(); if (!s.includes(key)) store.set('sessionStorage', 'tg-seen', JSON.stringify([...s, key])) }


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
/* Edge loads its natural voices a moment after the page (Chrome its Google
   ones): until then only the old built-in ones are listed. The first message
   waits for them (voicesReady), and a choice made before they came is not
   kept. */
let voicesSettled = false
function voicesReady() {
  if (voicesSettled) return Promise.resolve()
  return new Promise((resolve) => {
    const done = () => { voicesSettled = true; chosenVoice = null; resolve() }
    const ss = window.speechSynthesis
    if ((ss.getVoices() || []).some((v) => NATURAL_MARKS.some((m) => v.name.includes(m)) || /^Google/.test(v.name))) { done(); return }
    const t = setTimeout(done, 1500)
    ss.addEventListener?.('voiceschanged', () => { clearTimeout(t); setTimeout(done, 50) }, { once: true })
  })
}
const isFemale = (v) => FEMALE_VOICES.some((f) => v.name.includes(f))
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
    // A Canadian (BC) accent where the browser has one: a small bonus only.
    if (/en[-_]CA/i.test(v.lang)) n += 3
    else if (/en[-_]IN/i.test(v.lang)) n += 5
    if (ROBOTIC_VOICES.some((r) => v.name.includes(r))) n -= 200
    // Always a male voice (Chandra): a female one only if nothing else exists.
    if (isFemale(v)) n -= 1000
    return n
  }
  const best = pool.reduce((b, v) => (score(v) > score(b) ? v : b), pool[0])
  if (voicesSettled) chosenVoice = best
  return best
}

/* With Chandra's recordings on the site, a sentence without one is only
   read by the browser's voice when that voice is one of the known male
   voices (Edge's Brian and the like). Phones mostly have only a female
   voice ("Google US English"), which Chandra heard instead of his own
   (14 Oct 2026): there the sentence is skipped (its words are on screen). */
const knownMale = (v) => !!v && PREFERRED_VOICES.some((p) => v.name.includes(p)) && !isFemale(v)

/* ── Listening ─────────────────────────────────────────────────────────────
   The browser's speech recognition (Chrome, Edge, Safari; not Firefox).
   Where the browser can do it on the device, it is asked to. */
const Recognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)
/* On computers, once the microphone is on it stays on, also while the
   assistant talks: when the patient starts speaking, it stops talking and
   listens (Chandra, 14 Oct 2026). Not on phones: Android beeps at every
   restart of listening, and iPhones can move the sound to the earpiece
   while the microphone is open; there it listens after each question. */
const UA = typeof navigator !== 'undefined' ? navigator.userAgent : ''
const KEEP_ON = !!Recognition && !(/Android|iPhone|iPad|iPod|Mobile/i.test(UA) || (/Macintosh/.test(UA) && navigator.maxTouchPoints > 1))
/* Android plays a beep every time listening starts, and ends listening
   after a few seconds of silence (Chandra heard "too many beeps", 14 Oct
   2026). There it listens only when the assistant is waiting for an answer,
   with at most two restarts; a tap on the microphone light listens again. */
const ANDROID = /Android/i.test(UA)
// Phones and tablets (the voice is played straight, see clipOne).
const PHONE_UA = /Android|iPhone|iPad|iPod|Mobile/i.test(UA) || (/Macintosh/.test(UA) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1)
/* Android, once the speech model on the phone is ready (./onDeviceSpeech.js,
   Chandra chose it 15 Oct 2026): no beeps, continuous, nothing sent. Not
   with the development test microphone (src/dev/fakeMic.js). */
const ON_DEVICE = ANDROID && typeof WebAssembly !== 'undefined' && !(typeof window !== 'undefined' && window.__mic)
const usingOnDevice = () => ON_DEVICE && onDeviceReady()
// Android's own recognition beeps at every start: listen less there.
const beeps = () => ANDROID && !usingOnDevice()
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

/* ── The voice ─────────────────────────────────────────────────────────────
   A message is spoken sentence by sentence: the recording of a sentence
   where there is one (public/audio/guide/, the same voice on every phone and
   computer), otherwise the browser's own voice. `level` is what the face
   reads every frame ({ speaking, pulse, analyser }). */
function useVoice(level, volume, onBlocked) {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  const [now, setNow] = useState({ id: null, idx: -1 })   // which message, which sentence
  const token = useRef(0)
  const audio = useRef(null)
  const audioCtx = useRef(null)
  const cur = useRef(null)      // { id, text, idx } of the message being read
  const startedFor = useRef(0)  // the last speech (token) that really began

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

  // One sentence in the browser's voice.
  const ttsOne = useCallback((id, i, text, t, onDone, onFail) => {
    if (import.meta.env.DEV) { (window.__tts = window.__tts || []).push(text) }
    const u = new SpeechSynthesisUtterance(text)
    const v = pickVoice()
    if (v) { u.voice = v; u.lang = v.lang } else u.lang = 'en-CA'
    u.rate = VOICE_STYLE.rate
    u.pitch = VOICE_STYLE.pitch
    u.volume = VOICE_STYLE.volume * volume.current
    let began = false
    u.onstart = () => { if (t !== token.current) return; began = true; startedFor.current = t; level.current.speaking = true; setNow({ id, idx: i }) }
    u.onboundary = () => { level.current.pulse = 1 }
    u.onend = () => { if (t !== token.current) return; level.current.speaking = false; onDone() }
    u.onerror = (e) => {
      if (t !== token.current) return
      // Not allowed to speak yet (no tap on the page so far).
      if (e && e.error === 'not-allowed') { onFail('blocked'); return }
      level.current.speaking = false
      onDone()
    }
    window.speechSynthesis.resume?.()
    window.speechSynthesis.speak(u)
    // Safari on iPhone ignores speech before a tap without any error: if
    // nothing has started a little later, treat it as blocked.
    if (startedFor.current !== t) {
      setTimeout(() => {
        if (t === token.current && !began && startedFor.current !== t && !window.speechSynthesis.speaking) onFail('blocked')
      }, 2500)
    }
  }, [volume, level])

  // One sentence from its recording.
  const clipOne = useCallback((id, i, src, t, onDone, onFail) => {
    const a = new Audio(src)
    audio.current = a
    // Phones: played straight, not through an AudioContext (that is only for
    // the mouth's movement). On an iPhone a context made while the
    // microphone is open can send the voice to the quiet earpiece; the mouth
    // then keeps its own rhythm.
    if (!PHONE_UA) try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      audioCtx.current = audioCtx.current || new Ctx()
      audioCtx.current.resume?.()
      const an = audioCtx.current.createAnalyser()
      an.fftSize = 512
      audioCtx.current.createMediaElementSource(a).connect(an)
      an.connect(audioCtx.current.destination)
      level.current.analyser = an
    } catch { /* no level: the mouth uses its own rhythm */ }
    a.volume = Math.min(1, volume.current)
    // A natural pace (Chandra, 14 Oct 2026: "slightly slow"): recordings
    // play a little faster, at the same pitch.
    a.playbackRate = VOICE_STYLE.clipRate || 1
    a.preservesPitch = true
    a.onplay = () => { if (t !== token.current) return; startedFor.current = t; level.current.speaking = true; setNow({ id, idx: i }) }
    a.onended = () => { if (t !== token.current) return; audio.current = null; level.current.speaking = false; level.current.analyser = null; onDone() }
    a.play().catch((err) => {
      if (t !== token.current) return
      audio.current = null
      level.current.analyser = null
      onFail(err && err.name === 'NotAllowedError' ? 'blocked' : 'missing')
    })
  }, [volume, level])

  // A message from sentence `i` on.
  const playFrom = useCallback((id, text, t, i) => {
    if (t !== token.current) return
    const parts = splitSentences(text)
    if (i >= parts.length) { finish(); return }
    cur.current = { id, text, idx: i }
    const next = () => playFrom(id, text, t, i + 1)
    const blocked = () => {
      token.current += 1
      if (supported) window.speechSynthesis.cancel()
      finish()
      onBlocked.current && onBlocked.current(id)
    }
    const viaVoice = () => {
      if (!supported) { next(); return }
      if (!voicesSettled) { voicesReady().then(() => { if (t === token.current) viaVoice() }); return }
      if (hasRecordings() && !knownMale(pickVoice())) { next(); return }
      const wait = 150 - (Date.now() - cutAt.current)
      if (wait > 0) { setTimeout(() => { if (t === token.current) viaVoice() }, wait); return }
      ttsOne(id, i, parts[i], t, next, (why) => (why === 'blocked' ? blocked() : next()))
    }
    const src = audioFor(parts[i])
    // A recording that fails to play (a slow connection, the phone busy with
    // the microphone) is tried once more before anything else.
    if (src) {
      clipOne(id, i, src, t, next, (why) => {
        if (why === 'blocked') { blocked(); return }
        setTimeout(() => { if (t === token.current) clipOne(id, i, src, t, next, (w2) => (w2 === 'blocked' ? blocked() : viaVoice())) }, 400)
      })
    }
    else viaVoice()
    // Fetch the next recording while this one plays.
    const after = parts[i + 1] && audioFor(parts[i + 1])
    if (after) { const p = new Audio(); p.preload = 'auto'; p.src = after }
  }, [supported, finish, ttsOne, clipOne, onBlocked])

  // Must be called straight from a tap the first time (phones only allow
  // sound that starts from a tap). `src`: a recording of the whole message.
  const speak = useCallback((id, text, src) => {
    stop()
    const t = token.current
    if (src) clipOne(id, 0, src, t, finish, (why) => { if (why === 'blocked') { finish(); onBlocked.current && onBlocked.current(id) } else playFrom(id, text, t, 0) })
    else playFrom(id, text, t, 0)
  }, [stop, clipOne, playFrom, finish, onBlocked])

  // A new volume, straight away: a recording just changes; the browser
  // voice picks up again from the sentence it was on.
  const applyVolume = useCallback(() => {
    if (audio.current) { audio.current.volume = Math.min(1, volume.current); return }
    if (!supported || !cur.current || !(window.speechSynthesis.speaking || window.speechSynthesis.pending)) return
    const { id, text, idx } = cur.current
    token.current += 1
    cutAt.current = Date.now()
    window.speechSynthesis.cancel()
    playFrom(id, text, token.current, Math.max(0, idx))
  }, [supported, playFrom, volume])

  useEffect(() => stop, [stop])
  // Safety net: if the browser drops the speech without saying so, the face
  // would "talk" for ever and nothing would follow (no listening, no next
  // question). When nothing has been audible for a moment, finish.
  useEffect(() => {
    if (now.id === null) return
    let quiet = 0
    const t = setInterval(() => {
      const ss = supported ? window.speechSynthesis : null
      if (audio.current || (ss && (ss.speaking || ss.pending))) { quiet = 0; return }
      quiet += 1
      if (quiet >= 4) { clearInterval(t); token.current += 1; finish() }
    }, 500)
    return () => clearInterval(t)
  }, [now.id, supported, finish])
  // Any video or sound on the page (such as the how-it-works video) starts:
  // the guide goes quiet rather than talking over it.
  useEffect(() => {
    const onPlay = (e) => { if (e.target !== audio.current) stop() }
    document.addEventListener('play', onPlay, true)
    return () => document.removeEventListener('play', onPlay, true)
  }, [stop])
  return { supported, speak, stop, now, applyVolume }
}

/* ── The face ──────────────────────────────────────────────────────────────
   While it speaks, the logo's own toothy smile is covered with skin and a
   drawn mouth takes its place (Chandra, 10 Oct 2026: move the lips, not the
   teeth): the upper lip stays put and lifts a little, the lower lip drops
   with each syllable as the jaw opens, the opening between them is dark
   with a row of upper teeth only when it is wide, and the width changes a
   little (rounder or wider sounds). When it stops, it fades back to the
   logo's smile. Points are in the logo's pixels (836 x 1134); the corners
   of the logo's mouth are at about (312, 733) and (588, 726). */
const MOUTH = { cx: 450, ly: 733, ry: 726, half: 138 }
function mouthShapes(o, w) {
  const { cx, ly, ry, half } = MOUTH
  const hw = half * w
  const lx = cx - hw
  const rx = cx + hw
  const upY = 742 - 8 * o                  // upper lip's inner edge: a smile curve that lifts a little
  const lowY = 746 + 118 * o               // lower lip's inner edge: drops with the jaw
  const teeth = Math.max(0, Math.min(1, (o - 0.2) * 1.6)) * 30
  const f = (n) => n.toFixed(1)
  return {
    opening: `M${f(lx)} ${ly} Q${cx} ${f(upY)} ${f(rx)} ${ry} Q${cx} ${f(lowY)} ${f(lx)} ${ly} Z`,
    teeth: teeth > 0.5
      ? `M${f(lx + 26)} ${ly - 3} Q${cx} ${f(upY + 1)} ${f(rx - 26)} ${ry - 3} L${f(rx - 32)} ${ry + 2} Q${cx} ${f(upY + teeth)} ${f(lx + 32)} ${ly + 2} Z`
      : 'M0 0',
    // The upper lip, plus the logo's upturned smile creases at the corners.
    upperLip: `M${f(lx - 4)} ${ly + 3} Q${f(lx - 16)} ${ly - 4} ${f(lx - 20)} ${ly - 14} M${f(rx + 4)} ${ry + 3} Q${f(rx + 16)} ${ry - 4} ${f(rx + 20)} ${ry - 14} M${f(lx - 10)} ${ly + 1} C${f(cx - hw * 0.55)} ${f(704 - 6 * o)} ${f(cx - 26)} ${f(694 - 6 * o)} ${cx} ${f(703 - 6 * o)} C${f(cx + 26)} ${f(694 - 6 * o)} ${f(cx + hw * 0.55)} ${f(700 - 6 * o)} ${f(rx + 10)} ${ry + 1}`,
    lowerLip: `M${f(lx + 18)} ${f(ly + 12 + 44 * o)} Q${cx} ${f(800 + 112 * o)} ${f(rx - 18)} ${f(ry + 12 + 44 * o)}`,
  }
}

function Face({ level, speaking }) {
  const parts = useRef({})
  useEffect(() => {
    let raf = 0
    let open = 0
    let width = 1
    let wobble = 0.7
    let shape = 1
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
          if (t > nextWobble) { shape = 0.84 + Math.random() * 0.16; nextWobble = t + 160 + Math.random() * 120 }
        } else {
          // About four syllables a second, each a slightly different size
          // and shape.
          if (t > nextWobble) {
            wobble = 0.4 + Math.random() * 0.6
            shape = 0.84 + Math.random() * 0.16
            nextWobble = t + 120 + Math.random() * 110
          }
          target = Math.abs(Math.sin(t / 1000 * Math.PI * 4.2)) * wobble
        }
      }
      if (L.pulse > 0.02) { target = Math.max(target, L.pulse * 0.85); L.pulse *= 0.82 }
      open += (target - open) * 0.35
      width += ((L.speaking ? shape : 1) - width) * 0.25
      if (open < 0.005) open = 0
      const m = mouthShapes(open, width)
      const p = parts.current
      if (p.opening) {
        p.opening.setAttribute('d', m.opening)
        p.outline.setAttribute('d', m.opening)
        p.teeth.setAttribute('d', m.teeth)
        p.upperLip.setAttribute('d', m.upperLip)
        p.lowerLip.setAttribute('d', m.lowerLip)
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [level])

  const rest = mouthShapes(0, 1)
  const set = (k) => (el) => { parts.current[k] = el }
  return (
    <svg viewBox="-10 70 860 860" className={'tg-svg' + (speaking ? ' tg-talk' : '')} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="tg-circle"><circle cx="420" cy="500" r="430" /></clipPath>
      </defs>
      <g clipPath="url(#tg-circle)">
        <rect x="-10" y="70" width="860" height="860" fill={SKIN} />
        <g className="tg-head">
          <image href="/images/logo2.png" x="0" y="0" width="836" height="1134" />
          {/* The talking mouth: skin over the logo's smile, then the lips. */}
          <g className="tg-mouth">
            <path d="M286 738 C 340 668, 560 668, 614 722 C 600 856, 320 866, 286 738 Z" fill={SKIN} />
            <path ref={set('opening')} d={rest.opening} fill="#2b1714" />
            <path ref={set('teeth')} d={rest.teeth} fill="#fbf6ee" />
            <path ref={set('outline')} d={rest.opening} fill="none" stroke={INK} strokeWidth="7" strokeLinejoin="round" />
            <path ref={set('upperLip')} d={rest.upperLip} fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round" />
            <path ref={set('lowerLip')} d={rest.lowerLip} fill="none" stroke={INK} strokeWidth="8" strokeLinecap="round" />
          </g>
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
/* Just the volume (the chat header has its own mute icon). */
function SoundControlsVolumeOnly({ vol, onVol }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="tg-icon tg-volbtn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Volume" title="Volume">
        <Volume level={vol} />
      </button>
      {open && (
        <span className="tg-volpop">
          <input type="range" min="0" max="100" step="5" value={Math.round(vol * 100)} aria-label="Volume"
            onChange={(e) => onVol(Number(e.target.value) / 100)} />
          <span className="tg-volnum">{Math.round(vol * 100)}%</span>
        </span>
      )}
    </>
  )
}
/* Mute and volume, in every message and in the chat. */
function SoundControls({ on, onMute, vol, onVol }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="tg-sound">
      <button className={'tg-btn' + (on ? '' : ' tg-btn-gold')} onClick={onMute} aria-pressed={!on}>
        <Speaker on={on} /> {on ? 'Mute' : 'Unmute'}
      </button>
      <button className="tg-icon tg-volbtn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Volume" title="Volume">
        <Volume level={vol} />
      </button>
      {open && (
        <span className="tg-volpop">
          <input type="range" min="0" max="100" step="5" value={Math.round(vol * 100)} aria-label="Volume"
            onChange={(e) => onVol(Number(e.target.value) / 100)} />
          <span className="tg-volnum">{Math.round(vol * 100)}%</span>
        </span>
      )}
    </span>
  )
}
const Volume = ({ level }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M3 10v4h3l4 3V7L6 10H3z" fill="currentColor" stroke="none" />
    <path d="M14 9.5a3.5 3.5 0 0 1 0 5" opacity={level > 0 ? 1 : 0.25} />
    <path d="M16.5 7a7 7 0 0 1 0 10" opacity={level > 0.45 ? 1 : 0.25} />
    <path d="M19 4.5a10.5 10.5 0 0 1 0 15" opacity={level > 0.8 ? 1 : 0.25} />
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
  // The landing page: once the microphone is on, "start with voice guide"
  // or "start without voice" can be said (Chandra, 14 Oct 2026).
  const onLanding = assess && ctxKey === 'guide:landing'
  const landingRef = useRef(onLanding)
  landingRef.current = onLanding
  const hidden = HIDDEN_ROUTES.some((r) => pathname.startsWith(r)) || (assess && SILENT_STAGES.includes(stage))

  const level = useRef({ speaking: false, pulse: 0, analyser: null })
  // Volume 0–1 (remembered); the computer voice is a little quieter still.
  const [vol, setVol] = useState(() => { const v = store.get('localStorage', 'tg-vol'); return v === null ? 1 : Math.min(1, Math.max(0, Number(v) || 0)) })
  const volRef = useRef(vol)
  // A message the browser would not let us read yet: read on the first tap.
  const [waitTap, setWaitTap] = useState(null)
  // (the gold dot on the face shows something is waiting)
  const onBlocked = useRef((id) => { setWaitTap(id); setUnread(true) })
  const voice = useVoice(level, volRef, onBlocked)
  const speakingNowRef = useRef(false)
  speakingNowRef.current = voice.now.id !== null
  const [mode, setMode] = useState('face')          // 'face' | 'bubble' | 'chat'
  const [log, setLog] = useState([])                // { id, from: 'guide'|'me', text, link?, urgent?, audio? }
  const [chips, setChips] = useState(DEFAULT_CHIPS)
  const [unread, setUnread] = useState(false)
  // Sound is on unless the visitor has muted it.
  const [voiceOn, setVoiceOn] = useState(() => store.get('localStorage', 'tg-voice') !== 'off')
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
  const [micDecided, setMicDecided] = useState(() => store.get('sessionStorage', 'tg-mic') !== null)
  useEffect(() => { setGuideMic(micOn ? 'on' : micDecided ? 'off' : null) }, [micOn, micDecided])
  const afterConsent = useRef(null)

  const lastGuide = [...log].reverse().find((m) => m.from === 'guide')
  const logRef2 = useRef(log)
  logRef2.current = log

  // Chandra's recorded (cloned) voice when there is a recording of these
  // exact words; otherwise the browser's voice.
  const canSpeak = voice.supported || hasRecordings()
  // Muted means silent, in every mode (the words still join the chat).
  const soundRef = useRef(voiceOn)
  soundRef.current = voiceOn
  // The render that switches the voice guide on counts as unmuted, so its
  // first message (said in this same render's effects) is heard.
  const wasGuided = useRef(guided)
  const unmuteFor = useRef(false)
  if (guided && !wasGuided.current) unmuteFor.current = true
  wasGuided.current = guided
  // Held until the unmuted state has actually arrived (React can render
  // the stage change before it).
  if (unmuteFor.current) { if (voiceOn) unmuteFor.current = false; else soundRef.current = true }
  const spoke = useRef({ text: '', endedAt: 0 })
  const speakSoon = useRef(false)   // phones: the voice starts in a moment (no listening till then)
  const say = useCallback((msg) => {
    if (!soundRef.current) return
    spoke.current = { text: msg.text, endedAt: 0 }
    if (!(msg.audio || hasRecordings() || voice.supported)) return
    // Phones: stop listening first, and give the phone a moment to leave its
    // listening audio mode, or the start of the voice comes out quiet. It
    // listens again (for the same thing) once the voice has finished.
    if (!KEEP_ON && rec.current) {
      expectNext.current = expectNext.current || recKind.current
      rec.current.__cut = true
      try { rec.current.abort() } catch { /* already stopped */ }
      rec.current = null
      setHearing(null)
      speakSoon.current = true
      setTimeout(() => { speakSoon.current = false; if (soundRef.current) voice.speak(msg.id, msg.text, msg.audio) }, 250)
      return
    }
    voice.speak(msg.id, msg.text, msg.audio)
  }, [voice])

  const addGuide = useCallback((text, extra = {}) => {
    const msg = { id: nextId.current++, from: 'guide', text, ...extra }
    setLog((l) => [...l.slice(-40), msg])
    return msg
  }, [])

  // A new page or step: its message joins the conversation (once: the
  // check also stops development's double run adding it twice).
  const handled = useRef(null)
  // Cleared when the page or step changes (below), not on unmount: React's
  // development double run would cancel it before it fires.
  const welcomeTimer = useRef(0)
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
      // The drawing page opens with the demo, once per visit (back on
      // 17 Oct 2026, Chandra: show how to move the 3D body). Touching the
      // body stops it; "Show me how" plays it again.
      if (stage === 'draw' && !seenList().includes(ctxKey)) {
        markSeen(ctxKey)
        setChips(page.chips || DEFAULT_CHIPS)
        startDemo()
        return
      }
    }
    clearTimeout(welcomeTimer.current)
    const base = !Recognition && page.textNoMic ? page.textNoMic : page.text
    const text = forDevice(base, phone)
    const msg = addGuide(text, { audio: page.audio })
    setChips(page.chips || DEFAULT_CHIPS)
    const seen = seenList().includes(ctxKey)
    // Read out by itself: the welcome, and every step in voice guide mode
    // (a browser that blocks it reads it on the first tap instead).
    const speakNow = voiceOnRef.current && (guidedRef.current || ctxKey === 'guide:landing' || (activated && modeRef.current === 'chat'))
    if (modeRef.current === 'chat') {
      markSeen(ctxKey)
      if (speakNow) say(msg)
    } else if (!seen && ctxKey === 'guide:landing') {
      // The welcome: one second after landing.
      markSeen(ctxKey)
      welcomeTimer.current = setTimeout(() => { if (voiceOnRef.current) say(msg); else setUnread(true) }, 1000)
    } else if (!seen && speakNow) {
      markSeen(ctxKey)
      say(msg)
      // Voice guide: then listen ("next", "go back", or a question), except
      // on page 2 before the microphone is chosen (its Start button asks).
      if (guidedRef.current && assess) {
        const micUnchosen = stage === 'guide' && !!Recognition && !micOnRef.current && store.get('sessionStorage', 'tg-mic') === null
        if (!micUnchosen) listenFor('nav')
      }
    } else {
      setMode('face')
      if (!seen) setUnread(true)
    }
    // Back on the landing page with the microphone already on (this visit):
    // listen for how to start, after the welcome if it is being read.
    if (ctxKey === 'guide:landing' && micOnRef.current) {
      listenFor('start')
      setTimeout(() => { if (expectNext.current === 'start' && !rec.current && !speakingNowRef.current && landingRef.current) { expectNext.current = null; startListening('start') } }, 1600)
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
  const gen = useRef(0)   // bumped by every stop and start: an older start gives way
  const stopListening = useCallback(() => {
    gen.current += 1
    expectNext.current = null
    if (rec.current) { rec.current.__cut = true; try { rec.current.abort() } catch { /* already stopped */ } rec.current = null }
    setHearing(null)
  }, [])
  const heardRef = useRef(null)   // set below; the handler for what was heard
  const voiceRef = useRef(voice)
  voiceRef.current = voice
  // The assistant's own voice coming back through the speakers: words that
  // are mostly in what it is saying (or said a moment ago) are not the
  // patient's. Short ones too (Chandra, 18 Oct 2026: "Has a doctor told you
  // that you have diabetes...?" was cut off, and the echoed "diabetes"
  // ticked "Yes, diabetes"). A command ("quiet", "next") is always the
  // patient's; so is a yes, no or none just after it stopped.
  const isEcho = (said) => {
    const w = norm(said).trim().split(' ').filter(Boolean)
    if (!w.length) return true
    if (command(said)) return false
    const now = speakingNowRef.current
    const script = new Set(norm(spoke.current.text).trim().split(' '))
    const share = w.filter((x) => script.has(x)).length / w.length
    if (now) return share >= 0.6
    // Just after it stopped: only on computers (phones were not listening
    // while it talked). The browser's final words come a second or two
    // late, so its own words can still arrive now.
    if (!KEEP_ON || Date.now() - spoke.current.endedAt > 2000) return false
    if (yesNo(said) || saysNone(said)) return false
    return share === 1 || (w.length >= 4 && share >= 0.6)
  }
  const isEchoRef = useRef(isEcho)
  isEchoRef.current = isEcho
  /* Quicker answers (Chandra, 17 Oct 2026: "answers are not picked
     quickly"). The browser's final words come 1-2 s after the patient
     stops; the words heard so far are used instead once they have stayed
     the same for EARLY_MS and clearly give one answer (one card answer, a
     yes or no, none, next or back). Anything else waits for the final
     words, as before: lists on tick-all cards, "no, but...", taking answers
     off, questions for the assistant. */
  const EARLY_MS = 450
  const earlyOk = (kind, text) => {
    const t = norm(text).trim()
    if (!t || /\bbut\b/.test(t) || wakeWord(text)) return false
    if (kind === 'confirm') return !!yesNo(text)
    if (kind === 'nav') { const c = command(text); return c === 'next' || c === 'back' }
    if (kind !== 'answer') return false
    const sc = getGuideScreen()
    if (!sc || !sc.voice) return false
    if (sc.voice === 'none') return saysNone(text)
    if (sc.voice === 'confirm') return yesNo(text) === 'yes'
    if (sc.voice !== 'answer' || sc.multi || !sc.options) return false
    if (answerEdit(text, sc.options, sc.picked || [])) return false
    return matchDetail(text, sc.options, false).ids.length === 1
  }
  const earlyOkRef = useRef(earlyOk)
  earlyOkRef.current = earlyOk
  // Listening stays on while an answer is awaited (Chandra, 13 Oct 2026:
  // the back-and-forth stopped when the browser gave up after a few seconds
  // of silence): it starts again by itself, up to about a minute, and stops
  // at the first thing said.
  const startListening = useCallback(async (kind, tries = 0) => {
    if (!Recognition || !micOnRef.current) return
    const g = ++gen.current
    if (rec.current) { rec.current.__cut = true; try { rec.current.abort() } catch { /* already stopped */ } rec.current = null }
    const r = usingOnDevice() ? new OnDeviceRecognition() : new Recognition()
    // The phone's model: the words this card can be answered with (any words
    // for a question to the assistant).
    if (r instanceof OnDeviceRecognition && kind !== 'chat' && kind !== 'nav') {
      const sc = getGuideScreen()
      r.words = voiceWords([...((sc && sc.options) || []).map((o) => o.label), ...((sc && sc.areas) || []).map((a) => a.label)])
    }
    r.lang = 'en-CA'
    r.interimResults = true
    r.maxAlternatives = 3
    r.continuous = true
    if (!(r instanceof OnDeviceRecognition)) { try { if (await canRecogniseOnDevice()) r.processLocally = true } catch { /* not offered */ } }
    // Stopped, switched off, or started again while waiting: give way.
    if (g !== gen.current || !micOnRef.current || rec.current) return
    let finals = []
    let lastHeard = ''   // Safari often ends without a final result: the last words heard count
    let earlyTimer = 0
    r.__kind = kind
    // Act on what was said now, without waiting for the browser to close.
    const act = (list) => {
      if (r.__acted) return
      r.__acted = true
      clearTimeout(earlyTimer)
      if (rec.current === r) rec.current = null
      setHearing(null)
      try { r.stop() } catch { /* already stopping */ }
      if (heardRef.current) heardRef.current(list, r.__kind || kind, !!r.__barged)
    }
    r.onresult = (e) => {
      if (r.__acted) return
      let interim = ''
      let fin = null
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]
        if (res.isFinal) fin = Array.from(res).map((alt) => alt.transcript.trim()).filter(Boolean)
        else interim += res[0].transcript
      }
      const said = fin && fin.length ? fin[0] : interim
      // Called by name ("hey Chandra"), unless those are its own words.
      // A finished "Chandra" on its own is always a call.
      const wk = wakeWord(said)
      const called = !!wk && ((fin && !wk.rest) || !norm(spoke.current.text).includes(norm(wk.wake).trim()))
      if (!called && isEchoRef.current(said)) return   // its own voice
      // The patient talks over the assistant: it stops and listens.
      if (speakingNowRef.current) {
        if (!called && !fin && said.trim().split(/\s+/).length < 2) return
        r.__barged = true
        voiceRef.current.stop()
      }
      if (fin && fin.length) finals = fin
      else if (interim.trim()) lastHeard = interim.trim()
      setHearing({ text: finals[0] || interim })
      // The first complete answer is enough: act on it at once.
      clearTimeout(earlyTimer)
      if (finals.length) { act(finals); return }
      // Or the words so far, once they rest and clearly give one answer.
      const now = interim.trim()
      if (now && !speakingNowRef.current) {
        earlyTimer = setTimeout(() => {
          if (r.__acted || lastHeard !== now) return
          if (earlyOkRef.current(r.__kind || kind, now)) act([now])
        }, EARLY_MS)
      }
    }
    let failed = null
    r.onerror = (e) => {
      failed = e.error
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setMicOn(false)
        store.set('sessionStorage', 'tg-mic', 'off')
        // service-not-allowed: the phone's own speech service is off (on an
        // iPhone, Dictation), not the visitor saying no.
        heardRef.current && heardRef.current(null, e.error === 'service-not-allowed' ? 'noservice' : 'denied')
      } else if (e.error === 'audio-capture') {
        setMicOn(false)
        store.set('sessionStorage', 'tg-mic', 'off')
        heardRef.current && heardRef.current(null, 'nomic')
      }
    }
    r.onend = () => {
      clearTimeout(earlyTimer)
      if (rec.current === r) rec.current = null
      if (r.__acted) return
      setHearing(null)
      if (!finals.length && lastHeard && !r.__cut) finals = [lastHeard]
      if (finals.length) { if (heardRef.current) heardRef.current(finals, r.__kind || kind, !!r.__barged); return }
      // Nothing said yet: keep listening (not if stopped on purpose, or the
      // microphone is gone, or after about a minute).
      if (r.__cut || !micOnRef.current || failed === 'not-allowed' || failed === 'service-not-allowed' || failed === 'audio-capture') return
      if (failed === 'network') { if (tries < 1) setTimeout(() => startListening(kind, tries + 1), 800); else heardRef.current && heardRef.current(null, 'nonet'); return }
      if (tries < (beeps() ? 2 : 7)) setTimeout(() => { if (!rec.current && micOnRef.current && (KEEP_ON || !window.speechSynthesis?.speaking)) startListening(r.__kind || kind, tries + 1) }, 250)
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
    if (voice.now.id === null && spoke.current.endedAt === 0) spoke.current.endedAt = Date.now()
    if (voice.now.id !== null) {
      // On computers listening goes on (the patient can talk over it).
      if (KEEP_ON && micOnRef.current) return
      // The assistant is talking: never listen to itself (and listen again
      // for the same thing once it has finished).
      if (rec.current) {
        expectNext.current = expectNext.current || recKind.current
        rec.current.__cut = true
        try { rec.current.abort() } catch { /* already stopped */ }
        rec.current = null
        setHearing(null)
      }
      return
    }
    if (offerMicAfter.current !== null) { offerMicAfter.current = null; askMic(); return }
    if (!expectNext.current || !micOnRef.current) return
    // Still listening (computers): now for what was just asked.
    if (rec.current) { rec.current.__kind = expectNext.current; recKind.current = expectNext.current; expectNext.current = null; return }
    // A short pause first: speech that is about to start (see useVoice)
    // must not be heard, and the expectation stays until it is.
    const t = setTimeout(() => {
      const ss = window.speechSynthesis
      if (ss && (ss.speaking || ss.pending)) return
      const kind = expectNext.current
      expectNext.current = null
      if (kind) startListening(kind)
    }, 250)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voice.now.id, micOn, startListening])
  useEffect(() => () => stopListening(), [stopListening])
  // Listening goes on while the microphone is on (not in a hidden tab,
  // and only where there is something to listen for), so "hey Chandra"
  // works at any time. Phones pause while the assistant talks (Chandra,
  // 14 Oct 2026: phones stopped listening for good after about 40 s of
  // silence, so the wake word was never heard).
  const kindRef = useRef(null)
  const [deviceReady, setDeviceReady] = useState(false)
  useEffect(() => {
    if (!ON_DEVICE || !micOn) return
    let live = true
    prepareOnDevice().then(() => { if (live) setDeviceReady(true) }).catch(() => { /* stays with the browser's recognition */ })
    return () => { live = false }
  }, [micOn])
  useEffect(() => {
    if (!Recognition || !micOn || hidden || (ANDROID && !deviceReady)) return
    const t = setInterval(() => {
      if (!micOnRef.current || rec.current || document.hidden || speakSoon.current) return
      if (!KEEP_ON && (speakingNowRef.current || window.speechSynthesis?.speaking)) return
      const k = expectNext.current || (kindRef.current && kindRef.current())
      expectNext.current = null
      if (k) startListening(k)
    }, 1000)
    // A hidden tab: stop listening (and, on Android, let go of the microphone).
    const onVis = () => { if (document.hidden) { stopListening(); if (ON_DEVICE) releaseOnDevice() } }
    document.addEventListener('visibilitychange', onVis)
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onVis) }
  }, [micOn, hidden, deviceReady, startListening, stopListening])
  useEffect(() => { stopListening() }, [pathname, stopListening])
  // Off the landing page, its "how to start" listening ends.
  useEffect(() => { if (!onLanding && (recKind.current === 'start' || expectNext.current === 'start')) { if (expectNext.current === 'start') expectNext.current = null; if (rec.current && recKind.current === 'start') stopListening() } }, [onLanding, stopListening])

  // Saying something (a fixed message) and then listening for the reply.
  const sayThen = (text, kind) => {
    const msg = addGuide(text)
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
      if (modeRef.current === 'mic') setMode('face')
      setMicDecided(true)
      setMicOn(ok)
      micOnRef.current = ok
      store.set('sessionStorage', 'tg-mic', ok ? 'on' : 'off')
      if (ok) store.set('sessionStorage', 'tg-mic-ok', 'yes')
      const then = afterConsent.current
      afterConsent.current = null
      if (!ok) { sayThen(VOICE.denied); return }
      if (then) { then(); return }
      if (landingRef.current) { sayThen(VOICE.startAsk, 'start'); return }
      const sc = getGuideScreen()
      sayThen(VOICE.on, sc && sc.voice ? 'answer' : guidedRef.current && assess ? 'nav' : null)
    }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => { stream.getTracks().forEach((t) => t.stop()); done(true) })
        .catch(() => done(false))
    } else done(true)
  }
  const micNo = () => {
    voice.stop()
    setMicDecided(true)
    store.set('sessionStorage', 'tg-mic', 'off')
    afterConsent.current = null
    setMode('face')
  }
  const micOff = (sayIt = true) => {
    stopListening()
    if (ON_DEVICE) releaseOnDevice()
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

  // What to listen for right now (null: nothing, e.g. another page with
  // the chat closed).
  kindRef.current = () => {
    if (landingRef.current) return 'start'
    if (confirmRef.current) return 'confirm'
    const sc = guidedRef.current ? getGuideScreen() : null
    if (sc && sc.voice) return 'answer'
    if (guidedRef.current && assess) return 'nav'
    return modeRef.current === 'chat' ? 'chat' : null
  }
  // The light-like microphone beside the face (Chandra, 14 Oct 2026): lit
  // while it listens, off otherwise. A tap asks first (with the privacy
  // note), then starts or stops listening, without opening any box.
  const micDot = () => {
    // Agreed earlier in this visit: back on without asking again.
    if (!micOn) { if (store.get('sessionStorage', 'tg-mic-ok') === 'yes') micYes(); else askMic(); return }
    if (KEEP_ON) { micOff(true); return }
    if (hearing) { stopListening(); return }
    voice.stop()
    const sc = guided ? getGuideScreen() : null
    const kind = landingRef.current ? 'start' : confirm ? 'confirm' : sc && sc.voice ? 'answer' : guided && assess ? 'nav' : 'chat'
    if (kind === 'chat') setMode('chat')
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
    say(msg)
    listenFor('nav')
    // Without sentence-by-sentence timing (a recording, or no voice), the
    // steps follow the clock instead.
    const at = [[1500, 'turn'], [5600, 'zoom'], [9200, 'draw'], [13400, 'undo'], [16000, null]]
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
  const confirmRef = useRef(confirm)
  confirmRef.current = confirm
  const screenSeen = useRef({ key: null, sig: null })
  const acked = useRef(false)
  const askTimer = useRef(0)
  const hints = useRef(0)
  const askBack = useCallback(() => {
    const sc = getGuideScreen()
    if (!sc || !sc.ready || !sc.readBack) return false
    // With the box closed, say how to answer (the first few times).
    const boxOpen = modeRef.current === 'bubble' || modeRef.current === 'confirm'
    const hint = !boxOpen && hints.current < 3 ? (micOnRef.current ? ' Say yes, or tap Yes.' : ' If it is, tap Yes.') : ''
    if (hint) hints.current += 1
    const msg = addGuide(sc.readBack + hint)
    setConfirm({ key: sc.key, changeLabel: sc.changeLabel || 'Change it' })
    if (boxOpen) setMode('confirm')
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
      // One answer card to the next: a calm "Thank you." or "Okay." first.
      const flow = /^(q:|about:|injury:|emergency:|physician:)/
      if (flow.test(screenSeen.current.key || '') && flow.test(sc.key)) acked.current = true
      screenSeen.current = { key: sc.key, sig: sc.sig }
      setConfirm(null)
      if (sc.say) {
        // The step's general tip comes first, the first time (the safety pages' own words already say it).
        const intro = page && (stage === 'questions' || stage === 'injury' || stage === 'about') && !seenList().includes(ctxKey) ? forDevice(page.text, phone) + ' ' : ''
        markSeen(ctxKey)
        // Flash cards: say back the answer just given, then the next card.
        const got = takeGuideReflect().replace(/[.\s]+$/, '')
        // One acknowledgement, not two ("Okay. Got it. ..."), so the next
        // question comes sooner (17 Oct 2026).
        const ack = acked.current && !got ? ACKS[Math.floor(Math.random() * ACKS.length)] + ' ' : ''
        acked.current = false
        const pre = pendingAck.current ? pendingAck.current + ' ' : ''
        pendingAck.current = ''
        const msg = addGuide(pre + ack + (got ? `Got it. ${asSentence(got)} ` : '') + intro + sc.say)
        say(msg)
        misses.current = 0
        if (sc.voice) listenFor('answer')
      } else if (modeRef.current === 'confirm') setMode('face')
      return
    }
    if (sc.sig === screenSeen.current.sig) return
    screenSeen.current.sig = sc.sig
    if (rec.current) stopListening()
    if (confirmRef.current) { voice.stop(); setConfirm(null); if (modeRef.current === 'confirm') setMode('bubble') }
    if (!sc.ready) return
    if (sc.auto === true) askTimer.current = setTimeout(askBack, 700)
    else if (sc.auto === 'idle') {
      // The drawing changed: listen again at once, so "next" is heard.
      if (micOnRef.current && !speakingNowRef.current) setTimeout(() => { if (!rec.current && !speakingNowRef.current) startListening('nav') }, 300)
      askTimer.current = setTimeout(() => {
        if (demo.current.msgId) return
        const s2 = getGuideScreen()
        if (!s2 || !s2.areasOn || !s2.areasOn.length) return
        const first = !areasTold.current
        areasTold.current = true
        sayThen(`${first ? VOICE.areasFirst : VOICE.areasNow} ${s2.areasOn.map(asSentence).join(' ')}${first ? ' ' + VOICE.areasHow : ''}`, 'answer')
      }, 4500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenSig, guided])
  useEffect(() => () => clearTimeout(askTimer.current), [])

  // Continue, in voice guide mode, first reads back what was chosen.
  useEffect(() => {
    if (!guided) return
    const onClick = (e) => {
      const btn = e.target.closest && e.target.closest('.pa-primary')
      if (!btn || btn.disabled) return
      const sc = getGuideScreen()
      if (!sc || !sc.ready || !sc.readBack) return
      if (confirmRef.current && confirmRef.current.key === sc.key) { clearTimeout(askTimer.current); stopListening(); voice.stop(); setConfirm(null); if (modeRef.current === 'confirm') setMode('face'); return }  // read back already: Continue says yes
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
    if (sc && sc.ready) { acked.current = true; sc.proceed() }
  }
  const confirmChange = () => {
    stopListening()
    setConfirm(null)
    const msg = addGuide(CHANGE_REPLY)
    if (modeRef.current === 'confirm') setMode('bubble')
    say(msg)
    if (getGuideScreen()?.voice) listenFor('answer')
  }

  /* "Next" said aloud (Chandra, 13 Oct 2026: "go for next"), wherever the
     patient is: a read-back → yes; an answered card → the next card; the
     drawing and safety pages → their read-back first; any other page → its
     own Continue. Not answered yet → say so, and listen again. */
  const voiceNext = (kind) => {
    if (kind === 'confirm' || confirmRef.current) { confirmYes(); return }
    const sc = guided ? getGuideScreen() : null
    if (sc) {
      if (!sc.ready) { sayThen(sc.key === 'draw' ? VOICE.drawFirst : VOICE.chooseFirst, sc.key === 'draw' ? 'nav' : 'answer'); return }
      if (sc.readBack) { askBack(); return }
      sc.proceed()
      return
    }
    const btn = document.querySelector('.pa-section .pa-primary:not([disabled])')
    if (btn) { btn.click(); return }
    sayThen(VOICE.noNext, 'nav')
  }

  // Taps on the page for me (src/data/guideStage.js, sendGuide).
  const handlers = useRef({})
  // 'mic-off': "Start without voice" was tapped, so the microphone goes off.
  // 'demo': "Show me how" on the drawing page, heard even when the voice
  // is off (the tap asks for it). 'quiet': "Just tap, no voice" on page 2.
  // 'mic-start': "Start with voice" on page 2; after the browser's
  // prompt it just listens (the drawing page has already said its line).
  const showMe = () => { stopListening(); soundRef.current = true; startDemo() }
  const quiet = () => { stopListening(); voice.stop(); if (modeRef.current !== 'chat') setMode('face') }
  const micStart = () => { micAsked.current = true; afterConsent.current = () => { if (guidedRef.current) listenFor('nav') }; micYes() }
  // 'typed': a typed answer was read on the device (TypedAnswer.jsx). Urgent
  // words: the emergency advice, always shown. In voice guide mode, what it
  // may mean ("Pins and needles. Is that what you meant?") or a thank-you;
  // the typed words themselves are never read out.
  const typed = (d) => {
    if (!d) return
    if (d.kind === 'urgent') {
      const r = findReply('emergency')
      stopListening()
      const msg = addGuide(r.a, { urgent: true, calls: r.calls })
      setChips([])
      setMode('bubble')
      say(msg)
      return
    }
    if (!guidedRef.current) return
    if (d.kind === 'suggest' && d.label) sayThen(`${asSentence(d.label)} ${VOICE.typedMean}`)
    else if (d.kind === 'noted') sayThen(VOICE.typedNoted)
  }
  handlers.current = { typed, yes: () => confirmYes(), change: () => confirmChange(), 'mic-yes': () => micYes(), 'mic-no': () => micNo(), 'mic-off': () => { if (micOnRef.current || rec.current) micOff(false) }, demo: showMe, quiet, 'mic-start': micStart }
  useEffect(() => {
    if (!guideEvents) return
    const on = (e) => { const h = handlers.current[e.type]; if (h) h(e.detail) }
    const types = ['yes', 'change', 'mic-yes', 'mic-no', 'mic-off', 'demo', 'quiet', 'mic-start', 'typed']
    types.forEach((t) => guideEvents.addEventListener(t, on))
    return () => types.forEach((t) => guideEvents.removeEventListener(t, on))
  }, [])
  // The page shows "Yes, that's right / Change" on the screen waiting for a yes.
  useEffect(() => { setGuideConfirmKey(confirm ? confirm.key : null) }, [confirm])

  // What was heard: a command, yes / no, an answer, or a chat question.
  const retry = (kind) => {
    misses.current += 1
    if (misses.current >= 3) { sayThen(VOICE.giveUp); return }
    sayThen(kind === 'confirm' ? VOICE.yesNo : VOICE.again, kind)
  }
  // After a spoken step: if, a moment later, nothing is being said or
  // listened for (the new page had nothing to say), listen again.
  const whichOne = useRef(null)   // { key, ids }: the two answers just asked about
  const areasTold = useRef(false) // the drawing's areas said once with how to change them
  const pendingAck = useRef('')   // said before the next screen ("Okay, none of these apply.")
  const lastMove = useRef(null)   // the last way the body was turned by voice ("a bit more")
  const keepListening = () => setTimeout(() => {
    if (!micOnRef.current || rec.current || speakingNowRef.current || expectNext.current || speakSoon.current) return
    if (landingRef.current) { startListening('start'); return }
    const sc = guidedRef.current ? getGuideScreen() : null
    startListening(sc && sc.voice ? 'answer' : 'nav')
  }, 1500)
  heardRef.current = (alts, kind, barged = false) => {
    if (import.meta.env.DEV && window.__mic) window.__mic.log.push(`heard [${kind}] ${alts ? alts[0] : ''}`)
    if (kind === 'denied') { sayThen(VOICE.denied); return }
    if (kind === 'nomic') { sayThen(VOICE.noMic); return }
    if (kind === 'nonet') { sayThen(VOICE.noNet); return }
    if (kind === 'noservice') { sayThen(VOICE.noService); return }
    if (kind !== 'chat') keepListening()
    let text = alts[0]
    setHeardLast(text)
    // "Hey Chandra" (Chandra, 14 Oct 2026): on its own, it stops and says
    // it is listening; with more after it ("Chandra, next"), the rest is
    // taken as said.
    const wk = wakeWord(text)
    if (wk) {
      if (!wk.rest) { voice.stop(); sayThen(VOICE.wake, kindRef.current() || 'chat'); return }
      alts = alts.map((a) => (wakeWord(a) || { rest: a }).rest || a)
      text = alts[0]
    }
    // The drawing page: "turn left", "show the back", "zoom in"... turn the
    // 3D body (Chandra, 15 Oct 2026). A yes or no to the read-back
    // ("right", "that's right") stays an answer.
    // The drawing page: "remove the knee", "take off my left shoulder",
    // "put the hip back" change the areas picked up (Chandra, 15 Oct 2026).
    if (stage === 'draw' && assess) {
      const ed = areaEdit(text)
      const sc = getGuideScreen()
      if (ed && sc && sc.areas) {
        const pool = sc.areas.filter((a) => (ed.op === 'remove' ? a.on : !a.on))
        const r = ed.what ? matchDetail(ed.what, pool.map((a) => ({ id: a.id, label: a.label }))) : { ids: [], close: null }
        // Two names fit ("lower back": "Low back & pelvis" or "Where the mid
        // back meets the low back"): the shorter, plainer one.
        const words = (id) => (pool.find((a) => a.id === id) || { label: '' }).label.split(/\s+/).length
        const ids = r.ids.length ? r.ids : r.close ? [r.close.slice().sort((x, y) => words(x) - words(y))[0]] : []
        const hit = ids.length === 1 ? pool.find((a) => a.id === ids[0]) : null
        if (!hit) { sayThen(VOICE.areaNotFound, kind); return }
        if (ed.op === 'remove' && sc.areas.filter((a) => a.on).length === 1) { sayThen(VOICE.areaLast, kind); return }
        sc.toggleArea(hit.id)
        sayThen(`${ed.op === 'remove' ? VOICE.areaRemoved : VOICE.areaAdded} ${asSentence(hit.label)}`, kind)
        return
      }
    }
    if (stage === 'draw' && assess && !(kind === 'confirm' && yesNo(text))) {
      const mv = bodyMove(text)
      if (mv) {
        if (demo.current.msgId) { voice.stop(); endDemo() }
        const OPP = { left: 'right', right: 'left', up: 'down', down: 'up', in: 'out', out: 'in' }
        let move = mv
        if (mv === 'more') move = lastMove.current
        else if (mv === 'other') move = OPP[lastMove.current] || null
        else if (mv === 'which') move = ['left', 'right'].includes(lastMove.current) ? lastMove.current : null
        if (!move) { sayThen(VOICE.whichWay, kind); return }
        sendBodyMove(move)
        if (OPP[move]) lastMove.current = move
        listenFor(kind)
        return
      }
    }
    // "Quiet", "mute", "stop talking"... mute the voice; "unmute", "talk
    // again" bring it back (Chandra, 17 Oct 2026). The microphone stays on,
    // so answers can still be said. On the landing page "start without
    // voice" / "start quietly" still start (below).
    const muteCmd = command(text)
    if ((muteCmd === 'mute' || muteCmd === 'unmute') && !(kind === 'start' && /(start|begin|without)/.test(norm(text)))) {
      if (muteCmd === 'mute') muteByVoice(kind)
      else unmuteByVoice(kind)
      return
    }
    // On computers the microphone hears the room too: a long sentence that
    // is no answer or question for me is left alone.
    const chatter = KEEP_ON && text.trim().split(/\s+/).length > 6
    // The landing page: how to start. "Without" is checked first, as it
    // also holds "with".
    if (kind === 'start') {
      if (!landingRef.current) return
      // Anything urgent ("chest pain") is answered first, as everywhere.
      const r = findReply(text)
      if (r && r.urgent) { reply(text, r); return }
      if (command(text) === 'stop') { micOff(true); return }
      const all = alts.map(norm).join(' | ')
      if (/\b(without|no voice|no guide|not? (the )?voice|tap|tapping|myself|on my own|quiet|silent|mute)\b/.test(all)) {
        micOff(false)
        const btn = document.querySelector('.pa-landing .pa-primary')
        if (btn) { btn.click(); setGuided(false) }
        return
      }
      if (/\b(voice|guide|start|begin|with|talk|speak|yes|go|next|continue|ready)\b/.test(all)) {
        const btn = document.querySelector('.pa-landing .pa-primary')
        if (btn) btn.click()
        return
      }
      // A question: answer it, then ask again how to start.
      if (r && r.id !== 'fallback') { reply(text, r); listenFor('start'); return }
      if (chatter) return
      misses.current += 1
      if (misses.current >= 3) { misses.current = 0; sayThen(VOICE.giveUp); return }
      sayThen(VOICE.startAgain, 'start')
      return
    }
    const cmd = command(text)
    if (cmd === 'stop') { micOff(true); return }
    if (cmd === 'help') { sayThen(stage === 'draw' && assess ? `${VOICE.helpTurn} ${VOICE.help}` : VOICE.help, kind); return }
    if (cmd === 'repeat' && lastGuide) { say(lastGuide); listenFor(kind); return }
    if (cmd === 'next' && kind !== 'chat') { voiceNext(kind); return }
    if (cmd === 'back' && kind !== 'chat') {
      const back = document.querySelector('.pa-section .pa-actions > button:not(.pa-primary)')
      if (back) { setConfirm(null); back.click() }
      return
    }
    if (kind === 'chat') { reply(text, findReply(text)); return }
    // Between questions, anything else is a question for the assistant.
    if (kind === 'nav') {
      const r = findReply(text)
      if (KEEP_ON && (!r || r.id === 'fallback')) return
      reply(text, r); listenFor('nav'); return
    }
    if (kind === 'confirm') {
      const yn = alts.map(yesNo).find(Boolean)
      if (yn === 'yes') confirmYes()
      else if (yn === 'no') confirmChange()
      else if (!chatter) retry('confirm')
      return
    }
    const sc = getGuideScreen()
    if (!sc || !sc.voice) return
    if (sc.voice === 'answer') {
      // Tick-all cards: "next" / "that's all" moves on.
      if (sc.multi && alts.some((a) => /\b(done|that'?s (all|it)|nothing else|no more|finished)\b/i.test(a))) { sc.proceed(); return }
      // Taking answers off (Chandra, 16 Oct 2026): "remove B", "not the high
      // shelf", "cancel B and select C", "clear this question". Checked
      // before matching, so "remove the high shelf" never ticks it.
      const edit = alts.map((a) => answerEdit(a, sc.options, sc.picked || [])).find(Boolean)
      if (edit) {
        whichOne.current = null
        misses.current = 0
        if (edit.op === 'clear') {
          if (sc.clear) { sc.clear(); sayThen(VOICE.cleared, 'answer') } else sayThen(VOICE.sayInstead, 'answer')
          return
        }
        const label = (id) => (sc.options.find((o) => o.id === id) || {}).label
        const off = sc.unpick ? edit.ids.filter((id) => (sc.picked || []).includes(id)) : []
        off.forEach((id) => sc.unpick(id))
        edit.add.forEach((id) => sc.pick(id))
        if (!sc.multi && edit.add.length) return   // a one-answer card moves on by itself
        if (!edit.ids.length && !edit.add.length) { sayThen(VOICE.whichOff, 'answer'); return }
        const parts = []
        if (off.length) parts.push(`${VOICE.removed} ${off.map(label).filter(Boolean).map(asSentence).join(' ')}`)
        else parts.push(sc.multi ? VOICE.notTicked : VOICE.sayInstead)
        if (edit.add.length) parts.push(gotMany(edit.add.map(label).filter(Boolean)))
        else if (sc.multi) parts.push(VOICE.anythingElse)
        sayThen(parts.join(' '), 'answer')
        return
      }
      let ids = []
      // Just asked "which one did you mean?": first among those two.
      const narrowed = whichOne.current && whichOne.current.key === sc.key ? sc.options.filter((o) => whichOne.current.ids.includes(o.id)) : null
      whichOne.current = null
      if (narrowed) for (const a of alts) { ids = matchDetail(a, narrowed, false).ids; if (ids.length) break }
      let close = null
      if (!ids.length) for (const a of alts) { const r = matchDetail(a, sc.options, sc.multi); ids = r.ids; if (ids.length) break; close = close || r.close }
      if (!ids.length) {
        // Two answers fit about equally: ask, rather than guess.
        if (close) {
          whichOne.current = { key: sc.key, ids: close }
          const labels = close.map((id) => (sc.options.find((o) => o.id === id) || {}).label).filter(Boolean)
          sayThen(`${VOICE.whichOne} ${labels.map(asSentence).join(' ')}`, 'answer')
          return
        }
        if (!chatter) retry('answer')
        return
      }
      misses.current = 0
      ids.forEach((id) => sc.pick(id))
      if (!sc.multi) return   // a one-answer card moves on by itself, and says it back
      const picked = ids.map((id) => (sc.options.find((o) => o.id === id) || {}).label).filter(Boolean)
      // "None of these" ends a tick-all card.
      if (picked.some((l) => /^(none|no)\b/i.test(l))) { setTimeout(() => sc.proceed(), 400); return }
      sayThen(gotMany(picked), 'answer')
    } else if (sc.voice === 'none') {
      if (alts.some(saysNone)) { pendingAck.current = sc.noneAck === undefined ? VOICE.noneNoted : sc.noneAck; sc.proceed() }
      else sayThen(sc.tapMsg || VOICE.safetyTap, 'answer')
    } else if (sc.voice === 'confirm') {
      if (alts.some((a) => yesNo(a) === 'yes') && sc.ready) { acked.current = true; sc.proceed() }
      else sayThen(sc.key === 'draw' ? VOICE.drawFirst : VOICE.tapThenDone, 'answer')
    }
  }

  // The browser blocked speech until the visitor does something: on their
  // first tap or key press, read the message that was waiting (if it is
  // still the one on show).
  const lastGuideId = useRef(null)
  lastGuideId.current = lastGuide ? lastGuide.id : null
  useEffect(() => {
    if (waitTap === null) return
    // Phones count a tap only when the finger lifts (click / touchend), not
    // when it lands, so those are the events that may start speech.
    const EVENTS = ['click', 'touchend', 'keydown']
    const go = () => {
      EVENTS.forEach((ev) => document.removeEventListener(ev, go, true))
      unlockSpeech()
      setTimeout(() => {
        setWaitTap(null)
        setUnread(false)
        if (voiceOnRef.current && lastGuideId.current === waitTap) { const m = logRef2.current.find((x) => x.id === waitTap); if (m) say(m) }
      }, 300)
    }
    EVENTS.forEach((ev) => document.addEventListener(ev, go, true))
    return () => EVENTS.forEach((ev) => document.removeEventListener(ev, go, true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waitTap])

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
    // Not while a message waits for the first tap: that tap starts it.
    // While it talks too (Chandra, 14 Oct 2026: the box must always be
    // easy to put away); the voice carries on, Mute stops it.
    if ((mode !== 'bubble' && mode !== 'confirm' && mode !== 'mic') || waitTap !== null) return
    const onDown = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setMode('face') }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [mode, waitTap])

  const openChat = () => {
    setUnread(false)
    markSeen(ctxKey)
    setMode('chat')
    if (!phone) setTimeout(() => inputRef.current?.focus(), 60)
  }
  // Closing the box leaves the voice talking (Mute stops it).
  const tuckAway = () => { setMode('face') }
  const toggleFace = () => {
    if (mode === 'face') {
      // The box opens only when the visitor asks for it: the read-back
      // waiting for a yes, else the latest message, else the chat.
      setUnread(false)
      markSeen(ctxKey)
      if (confirm) setMode('confirm')
      else if (lastGuide) { setMode('bubble'); if (voiceOn && waitTap === null && !speakingNow && unread) say(lastGuide) }
      else openChat()
    } else tuckAway()
  }

  const setVoice = (on) => {
    soundRef.current = on
    setVoiceOn(on)
    store.set('localStorage', 'tg-voice', on ? 'on' : 'off')
    setWaitTap(null)
    if (!on) { voice.stop(); stopListening() }
    else if (lastGuide) say(lastGuide)
  }
  // Muted or unmuted by voice: shown on screen, and listening goes on.
  const muteByVoice = (kind) => {
    voice.stop()
    soundRef.current = false
    setVoiceOn(false)
    store.set('localStorage', 'tg-voice', 'off')
    setWaitTap(null)
    addGuide(VOICE.muted)
    if (modeRef.current !== 'chat') setMode('bubble')
    if (kind) listenFor(kind)
  }
  const unmuteByVoice = (kind) => {
    soundRef.current = true
    setVoiceOn(true)
    store.set('localStorage', 'tg-voice', 'on')
    setWaitTap(null)
    sayThen(VOICE.unmuted, kind)
  }
  const changeVolume = (v) => {
    setVol(v)
    volRef.current = v
    store.set('localStorage', 'tg-vol', String(v))
    voice.applyVolume()
  }
  const sound = <SoundControls on={voiceOn} onMute={() => setVoice(!voiceOn)} vol={vol} onVol={changeVolume} />

  const listen = (msg) => {
    if (voice.now.id === msg.id) { voice.stop(); return }
    if (!voiceOn) { soundRef.current = true; setVoiceOn(true); store.set('localStorage', 'tg-voice', 'on') }
    say(msg)
  }
  // "Start with voice guide" asks for the voice: sound back on if muted.
  useEffect(() => {
    if (guided && unmuteFor.current && !voiceOn) { setVoiceOn(true); store.set('localStorage', 'tg-voice', 'on') }
  }, [guided])

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
      {waitTap === msg.id && voiceOn ? 'Tap anywhere to hear me.'
        : !voiceOn ? (micOn ? 'Sound is off. Say unmute, or tap Unmute, to hear me.' : 'Sound is off. Tap Unmute to hear me.')
        : voice.now.id === msg.id ? <><span className="tg-dots" aria-hidden="true"><i /><i /><i /></span> Speaking…</>
        : hearing ? <><span className="tg-dots tg-dots-teal" aria-hidden="true"><i /><i /><i /></span> Listening…</>
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
          <button className="tg-icon tg-bubble-x" onClick={() => { voice.stop(); tuckAway() }} aria-label="Close, not now"><Close /></button>
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
          <button className="tg-icon tg-bubble-x" onClick={tuckAway} aria-label="Close message"><Close /></button>
          <p className="tg-bubble-name">Virtual assistant <TextToggle /></p>
          <Words msg={lastGuide} idle="Is that right?" />
          <div className="tg-bubble-actions">
            <button className="tg-btn tg-btn-gold tg-btn-big" onClick={confirmYes}>✓ Yes, continue</button>
            <button className="tg-btn tg-btn-big" onClick={confirmChange}>{confirm.changeLabel}</button>
            {Recognition && guided && <MicButton on={micOn} hearing={hearing} onClick={micButton} />}
            {canSpeak && sound}
          </div>
          {wordsShown && <Hearing hearing={hearing} heard={heardLast} />}
        </div>
      )}

      {mode === 'bubble' && lastGuide && (
        <div className="tg-bubble" role="dialog" aria-label="Message from Physio Chandra's virtual assistant">
          <button className="tg-icon tg-bubble-x" onClick={tuckAway} aria-label="Close message"><Close /></button>
          <p className="tg-bubble-name">Virtual assistant <TextToggle /></p>
          <Words msg={lastGuide} idle="Here to help whenever you need me." />
          <div className="tg-bubble-actions">
            {canSpeak && sound}
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
              <button className="tg-icon" onClick={() => setVoice(!voiceOn)} aria-pressed={!voiceOn}
                aria-label={voiceOn ? 'Mute' : 'Unmute'} title={voiceOn ? 'Mute' : 'Unmute'}>
                <Speaker on={voiceOn} />
              </button>
            )}
            {canSpeak && (
              <span className="tg-sound tg-sound-head">
                <SoundControlsVolumeOnly vol={vol} onVol={changeVolume} />
              </span>
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

      {Recognition && (
        <button className={'tg-micdot' + (hearing ? ' on' : micOn ? ' ready' : '')} onClick={micDot} aria-pressed={micOn}
          aria-label={!micOn ? 'Answer by speaking: turn the microphone on' : KEEP_ON ? 'Microphone is on. Tap to turn it off' : hearing ? 'Microphone is on, listening. Tap to stop' : 'Microphone is off. Tap to speak'}
          title={!micOn ? 'Answer by speaking' : KEEP_ON ? 'Microphone on… tap to turn off' : hearing ? 'Listening… tap to stop' : 'Tap to speak'}>
          <Mic />
        </button>
      )}
      {speaking && mode === 'face' && (
        <button className="tg-mute-badge" onClick={() => setVoice(false)} aria-label="Mute the assistant" title="Mute">
          <Speaker on={false} />
        </button>
      )}
      <button className={'tg-face' + (speaking ? ' tg-face-talk' : '') + (hearing ? ' tg-face-listen' : '')} onClick={toggleFace}
        aria-label={mode === 'face' ? 'Open the virtual assistant' : 'Close the virtual assistant'} aria-expanded={mode !== 'face'}>
        <Face level={level} speaking={speaking} />
        {unread && mode === 'face' && <span className="tg-dot" aria-hidden="true" />}
      </button>

      <style>{`
        .tg-root {
          position: fixed; z-index: 400;
          left: max(16px, env(safe-area-inset-left));
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
        .tg-mouth { opacity: 0; transition: opacity 0.18s ease; }
        .tg-talk .tg-mouth { opacity: 1; }
        @keyframes tg-blink { 0%, 94%, 97.5%, 100% { opacity: 0; } 95%, 96.5% { opacity: 1; } }
        .tg-head { transform-origin: 420px 930px; }
        .tg-talk .tg-head { animation: tg-nod 2.6s ease-in-out infinite; }
        @keyframes tg-nod {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          30% { transform: rotate(-1.6deg) translateY(-6px); }
          65% { transform: rotate(1.2deg) translateY(3px); }
        }

        .tg-bubble, .tg-chat {
          position: absolute; left: 0; bottom: calc(100% + 14px);
          background: ${PANEL}; border: 1px solid rgba(201,169,110,0.45); border-radius: 18px;
          box-shadow: 0 18px 50px rgba(0,0,0,0.55);
          animation: tg-in 0.35s var(--ease);
        }
        @keyframes tg-in { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: none; } }
        .tg-bubble { width: min(350px, calc(100vw - 32px)); padding: 16px 18px 16px; }
        .tg-bubble::after {
          content: ''; position: absolute; left: 26px; bottom: -8px; width: 14px; height: 14px;
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
        .tg-micdot {
          position: absolute; left: 84px; bottom: 18px; width: 38px; height: 38px; border-radius: 50%; padding: 0;
          display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
          background: rgba(10,26,47,0.85); color: rgba(255,255,255,0.38); border: 1.5px solid rgba(255,255,255,0.22);
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .tg-micdot:hover { color: rgba(255,255,255,0.7); }
        .tg-micdot:focus-visible { outline: 2px solid ${GOLD_LIGHT}; outline-offset: 2px; }
        .tg-micdot.ready { color: #9FEAE4; border-color: rgba(92,200,194,0.75); }
        .tg-micdot.on {
          background: #5CC8C2; color: ${NAVY}; border-color: #9FEAE4;
          animation: tg-micglow 1.4s ease-in-out infinite;
        }
        @keyframes tg-micglow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(92,200,194,0.75), 0 0 10px 2px rgba(92,200,194,0.5); }
          50% { box-shadow: 0 0 0 9px rgba(92,200,194,0), 0 0 18px 6px rgba(92,200,194,0.35); }
        }
        @media (max-width: 600px), (pointer: coarse) and (max-width: 900px) { .tg-micdot { left: 64px; bottom: 11px; width: 34px; height: 34px; } }
        .tg-mute-badge {
          position: absolute; left: 52px; bottom: 50px; z-index: 1; width: 32px; height: 32px; border-radius: 50%;
          display: inline-flex; align-items: center; justify-content: center; cursor: pointer;
          background: ${NAVY}; color: #fff; border: 1.5px solid ${GOLD}; box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }
        .tg-mute-badge:hover { background: ${GOLD}; color: ${NAVY}; }
        @media (max-width: 600px), (pointer: coarse) and (max-width: 900px) { .tg-mute-badge { left: 38px; bottom: 36px; } }
        .tg-sound { position: relative; display: inline-flex; align-items: center; gap: 4px; }
        .tg-volpop {
          position: absolute; bottom: calc(100% + 8px); left: 0; z-index: 2; display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: 12px; background: ${NAVY}; border: 1px solid rgba(201,169,110,0.45);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5); white-space: nowrap;
        }
        .tg-sound-head .tg-volpop { bottom: auto; top: calc(100% + 6px); left: auto; right: 0; }
        .tg-volpop input { width: 140px; accent-color: ${GOLD}; }
        .tg-volnum { font-size: 12.5px; color: rgba(255,255,255,0.8); min-width: 36px; text-align: right; }
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
          .tg-hearing, .tg-face-listen, .tg-dots i, .tg-micdot.on { animation: none; }
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
