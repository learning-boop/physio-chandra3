/* ── A pretend microphone, for testing the talking guide (development only)
   Open the site with ?fakemic (computer) or ?fakemic=phone (sessions end
   after 5 s of silence, as on Android) and type in the console:
     __say('hey Chandra')      what the "patient" says
     __mic                     { running, starts, log }
   Never part of the live site: the whole file is skipped unless Vite runs
   in development mode. */
if (import.meta.env.DEV && typeof window !== 'undefined' && /[?&]fakemic\b/.test(window.location.search)) {
  const phone = /fakemic=phone/.test(window.location.search)
  const state = { running: null, starts: 0, log: [] }
  window.__mic = state
  const note = (m) => { state.log.push(`${new Date().toISOString().slice(11, 19)} ${m}`); if (state.log.length > 200) state.log.shift() }
  class FakeRecognition {
    constructor() { this.continuous = false; this.interimResults = false; this.lang = 'en'; this.maxAlternatives = 1; this._t = 0 }
    start() {
      if (state.running) throw new Error('InvalidStateError: already started')
      state.running = this
      state.starts += 1
      note('start')
      if (phone) this._t = setTimeout(() => this._end('no-speech'), 5000)
      else if (!this.continuous) this._t = setTimeout(() => this._end('no-speech'), 8000)
    }
    stop() { note('stop'); this._end() }
    abort() { note('abort'); this._end('aborted') }
    _end(err) {
      clearTimeout(this._t)
      if (state.running !== this) return
      state.running = null
      if (err && this.onerror) this.onerror({ error: err })
      setTimeout(() => this.onend && this.onend(), 0)
    }
  }
  window.SpeechRecognition = FakeRecognition
  window.webkitSpeechRecognition = FakeRecognition
  window.__say = (text) => {
    const r = state.running
    note(`say "${text}" → ${r ? 'heard' : 'NOT LISTENING'}`)
    if (!r) return false
    const alt = { transcript: text, confidence: 0.9 }
    const res = Object.assign([alt], { isFinal: true })
    r.onresult && r.onresult({ resultIndex: 0, results: [res] })
    return true
  }
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => ({ getTracks: () => [{ stop() {} }] })
}
