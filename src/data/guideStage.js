import { useSyncExternalStore } from 'react'

/* What the pain guide (PainAssessment) and the talking guide in the corner
   (TalkingGuide) share. Nothing here is sent anywhere.

   stage    which step of the pain guide is on screen; null when the pain
            guide is not on the page.
   guided   the visitor chose "Start with voice guide": the assistant reads
            each screen out, shows how to turn and draw, and reads back each
            answer for a Yes / Change before moving on (Chandra, 10 Oct 2026).
   screen   the current screen's read-back, set by PainAssessment on every
            render: { key, say, readBack, ready, auto, sig, proceed,
            changeLabel }. `proceed` is the screen's own Continue.
   demo     the step of the how-to demo on the drawing page ('turn',
            'draw', 'undo' or null), set by the talking guide.
   mic      the microphone choice this visit: 'on', 'off' or null (not asked).
   confirmKey  the screen whose answer is waiting for a yes (the page shows
            "Yes, that's right / Change" on it).
   Taps on the page that the talking guide must act on ("yes", "change",
   "mic-yes", "mic-no") go through sendGuide. */
const state = { stage: null, guided: false, demo: null, mic: null, confirmKey: null }
let screen = null
const subs = new Set()
const emit = () => subs.forEach((f) => f())
const subscribe = (f) => { subs.add(f); return () => subs.delete(f) }
const set = (k, v) => { if (state[k] === v) return; state[k] = v; emit() }

export const setGuideStage = (v) => set('stage', v)
export const useGuideStage = () => useSyncExternalStore(subscribe, () => state.stage, () => null)

export const setGuided = (v) => set('guided', !!v)
export const isGuided = () => state.guided
export const useGuided = () => useSyncExternalStore(subscribe, () => state.guided, () => false)

export const setGuideDemo = (v) => set('demo', v)
export const useGuideDemo = () => useSyncExternalStore(subscribe, () => state.demo, () => null)

/* The screen's read-back. Stored without notifying: the guide reads the
   latest one when it needs it, and a separate signal says when it changed
   in a way that matters (a new screen, or a new answer). */
let screenSig = ''
export function setGuideScreen(next) {
  screen = next
  const sig = next ? `${next.key}|${next.sig}|${next.ready}` : ''
  if (sig !== screenSig) { screenSig = sig; emit() }
}
export const getGuideScreen = () => screen
export const useGuideScreenSig = () => useSyncExternalStore(subscribe, () => screenSig, () => '')

/* Phones only let a page speak if speech starts during a tap. Called from
   the "Start with voice guide" tap, so the readings that follow are
   allowed. */
export function unlockSpeech() {
  try {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(' ')
      u.volume = 0
      window.speechSynthesis.speak(u)
    }
  } catch { /* no voice: the text still shows */ }
}

/* The answer just picked on a flash card, for the voice guide to say back
   as the next card opens ("Got it, gradually."). Taken once. */
let reflect = ''
export const setGuideReflect = (text) => { reflect = text || '' }
export const takeGuideReflect = () => { const t = reflect; reflect = ''; return t }

export const setGuideMic = (v) => set('mic', v)
export const useGuideMic = () => useSyncExternalStore(subscribe, () => state.mic, () => null)
export const setGuideConfirmKey = (v) => set('confirmKey', v)
export const useGuideConfirmKey = () => useSyncExternalStore(subscribe, () => state.confirmKey, () => null)

/* Taps on the page for the talking guide: 'yes', 'change', 'mic-yes',
   'mic-no'. Sent synchronously, so a microphone request stays inside the
   tap (browsers only ask for it from a tap). */
export const guideEvents = typeof window !== 'undefined' ? new EventTarget() : null
export const sendGuide = (type) => { if (guideEvents) guideEvents.dispatchEvent(new Event(type)) }
/* Turning the 3D body by voice ('left', 'right', 'back', 'front',
   'leftSide', 'rightSide', 'up', 'down', 'in', 'out'): Body3D.jsx moves. */
/* A typed answer was read on the device (./../components/TypedAnswer.jsx):
   { kind: 'urgent' | 'suggest' | 'noted', label? } for the assistant to say. */
export const sendGuideTyped = (detail) => { if (guideEvents) guideEvents.dispatchEvent(new CustomEvent('typed', { detail })) }
export const sendBodyMove = (move) => { if (guideEvents) guideEvents.dispatchEvent(new CustomEvent('body-move', { detail: move })) }
