/* ── Speech to text on the phone itself (Android) ───────────────────────────
   Chandra, 15 Oct 2026: Android's own speech recognition beeps every time
   it starts and stops after a few seconds of silence, so it could not keep
   listening. On Android the assistant uses this instead: the open-source
   Vosk small English model (public/models/vosk, about 40 MB, downloaded
   once when the microphone is first turned on) running in the browser. It
   listens continuously, makes no sound, and nothing leaves the phone.

   OnDeviceRecognition looks like the browser's SpeechRecognition (start,
   stop, abort, onresult, onerror, onend), so TalkingGuide.jsx uses either.
   One microphone stream and one recogniser are shared; a "session" only
   decides who receives the words. Until the model is ready (or if it
   cannot load), the browser's own recognition is used. */

const MODEL_URL = '/models/vosk/en-us-small.tar.gz'

let loading = null      // Promise of { model, recognizer }
let ready = false
let failed = false
let stream = null
let ctx = null
let node = null
let current = null      // the session receiving words

export const onDeviceReady = () => ready
export const onDeviceFailed = () => failed

/* Download and start the model (once). Safe to call many times. */
export function prepareOnDevice() {
  if (loading) return loading
  loading = (async () => {
    const Vosk = await import('vosk-browser')
    const model = await Vosk.createModel(MODEL_URL)
    return { model }
  })().then((r) => { ready = true; return r }, (e) => { failed = true; loading = null; throw e })
  return loading
}

let recognizer = null
let recognizerWords = null   // the grammar the recogniser was made with ('' = any words)
async function ensureAudio(words = null) {
  const { model } = await prepareOnDevice()
  if (!stream) {
    stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      // No call-style processing (Chandra, 15 Oct 2026: "the voice suddenly
      // gets low"): with echo cancellation on, Android switches to its phone-
      // call audio mode and turns the media volume down while the mic is open.
      // The assistant never listens while it talks, so there is no echo.
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, channelCount: 1 },
    })
  }
  if (!ctx) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    ctx = new Ctx()
  }
  if (ctx.state === 'suspended') { try { await ctx.resume() } catch { /* resumes on the next tap */ } }
  const key = words && words.length ? words.join(' ') : ''
  if (recognizer && recognizerWords !== key) { try { recognizer.remove() } catch { /* gone */ } recognizer = null }
  if (!recognizer) {
    recognizerWords = key
    recognizer = key ? new model.KaldiRecognizer(ctx.sampleRate, JSON.stringify(words)) : new model.KaldiRecognizer(ctx.sampleRate)
    // "[unk]": a sound outside the words expected; left out.
    const clean = (t) => String(t || '').replace(/\[unk\]/g, ' ').replace(/\s+/g, ' ').trim()
    recognizer.on('partialresult', (m) => { const t = clean(m.result && m.result.partial); if (current && t) current._partial(t) })
    recognizer.on('result', (m) => { const t = clean(m.result && m.result.text); if (current && t) current._final(t) })
  }
  if (!node) {
    const src = ctx.createMediaStreamSource(stream)
    node = ctx.createScriptProcessor(4096, 1, 1)
    // Words only go to the recogniser while a session is listening: while
    // the assistant talks nothing is listened to.
    node.onaudioprocess = (e) => { if (current) { try { recognizer.acceptWaveform(e.inputBuffer) } catch { /* skip this bit */ } } }
    src.connect(node)
    node.connect(ctx.destination)
  }
}

/* The microphone off: let go of everything (the phone's mic indicator goes out). */
export function releaseOnDevice() {
  if (current) current.abort()
  if (node) { try { node.disconnect() } catch { /* already */ } node.onaudioprocess = null; node = null }
  if (stream) { stream.getTracks().forEach((t) => t.stop()); stream = null }
  if (ctx) { try { ctx.close() } catch { /* already */ } ctx = null }
  recognizer = null
  recognizerWords = null
}

export class OnDeviceRecognition {
  constructor() {
    this.lang = 'en-US'; this.continuous = true; this.interimResults = true; this.maxAlternatives = 1
    this.onresult = null; this.onerror = null; this.onend = null
    this._ended = false
    this.words = null   // the words to expect (an answer card), or null for any words
  }
  start() {
    if (current && current !== this) current.abort()
    current = this
    ensureAudio(this.words).catch((e) => {
      const name = e && e.name
      this._fail(name === 'NotAllowedError' || name === 'SecurityError' ? 'not-allowed' : name === 'NotFoundError' ? 'audio-capture' : 'network')
    })
  }
  _partial(text) {
    if (this._ended || !this.onresult) return
    const res = Object.assign([{ transcript: text, confidence: 0.5 }], { isFinal: false })
    this.onresult({ resultIndex: 0, results: [res] })
  }
  _final(text) {
    if (this._ended || !this.onresult) return
    const res = Object.assign([{ transcript: text, confidence: 0.8 }], { isFinal: true })
    this.onresult({ resultIndex: 0, results: [res] })
  }
  _fail(error) {
    if (this._ended) return
    if (this.onerror) this.onerror({ error })
    this._end()
  }
  _end() {
    if (this._ended) return
    this._ended = true
    if (current === this) current = null
    setTimeout(() => { if (this.onend) this.onend() }, 0)
  }
  stop() { this._end() }
  abort() { this._end() }
}
