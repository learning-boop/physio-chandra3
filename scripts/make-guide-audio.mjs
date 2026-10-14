/* Make the talking guide's recordings: one MP3 per sentence it can say, in
   one voice, so every phone and computer hears the same voice (Chandra,
   13 Oct 2026: on phones the browser's own voice was a female one).

     npm run guide:audio -- --dry-run   count the sentences and characters
     npm run guide:audio -- --sample    make just 3 sentences to listen to
                                        (public/audio/guide-sample/), in each
                                        voice given: --voices=a,b (Azure) or
                                        model: --models=a,b (ElevenLabs)
     npm run guide:audio -- --list-voices
                                        Azure: which English HD voices your
                                        region offers
     npm run guide:audio -- --max-chars=90000
                                        make the missing recordings, stopping
                                        before this many characters (a cap, so
                                        a plan's credits are never exceeded)
     npm run guide:audio                make all the missing recordings

   The voice (GUIDE_VOICE in .env, never committed):
     azure:en-US-Brian:DragonHDLatestNeural   Brian HD (Chandra's choice,
                                           13 Oct 2026): Azure's newer, more
                                           expressive voices; paid tier only,
                                           US$22 per 1M characters (about
                                           US$3.60 for everything here)
     azure:en-US-BrianMultilingualNeural   the Brian Multilingual voice Edge
                                           uses; covered by the free tier
     elevenlabs:<voice id>                 e.g. Chandra's cloned voice

   Keys, also in .env:
     AZURE_SPEECH_KEY=...       Azure portal → a "Speech" resource → Keys
     AZURE_SPEECH_REGION=...    its region, e.g. canadacentral
     ELEVENLABS_API_KEY=...     elevenlabs.io → Profile → API keys
   Optional: AZURE_PITCH (default -6%), AZURE_RATE_PER_MIN (default 18: the
   free tier allows 20 requests a minute).

   Every sentence of everything the guide can say (src/data/guideSpeech.js,
   allGuideSentences) becomes public/audio/guide/<voice>/<code>.mp3, the code
   coming from the exact words. Sentences already recorded are skipped, so
   after a wording change only new sentences are made (and charged); a stop
   part-way is safe to run again. Recordings no longer needed are deleted.
   The list the site reads is written to src/data/guideAudio.js; anything
   without a recording is spoken by the browser's voice.

   Only the guide's own pre-written words are sent, once, from this
   computer. Visitors' answers never are: read-backs are built from
   recordings of each fixed answer. */
import fs from 'node:fs'
import path from 'node:path'
import { textKey } from '../src/data/talkingGuide.js'
import { allGuideSentences } from '../src/data/guideSpeech.js'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..')
const MANIFEST = path.join(ROOT, 'src', 'data', 'guideAudio.js')
const dryRun = process.argv.includes('--dry-run')
const sample = process.argv.includes('--sample')
const argOf = (name) => { const a = process.argv.find((x) => x.startsWith('--' + name + '=')); return a ? a.slice(name.length + 3) : null }
const maxChars = Number(argOf('max-chars') || 0)

try { process.loadEnvFile(path.join(ROOT, '.env')) } catch { /* no .env: checked below */ }
const VOICE = process.env.GUIDE_VOICE || 'azure:en-US-Brian:DragonHDLatestNeural'
const [PROVIDER, VOICE_NAME] = [VOICE.slice(0, VOICE.indexOf(':')), VOICE.slice(VOICE.indexOf(':') + 1)]
const FOLDER = VOICE.replace(/[^A-Za-z0-9-]+/g, '-').toLowerCase()
const OUT_DIR = path.join(ROOT, 'public', 'audio', 'guide', FOLDER)

const sentences = allGuideSentences().map((text) => ({ text, key: textKey(text) }))
const fileOf = (s) => `${s.key}.mp3`
fs.mkdirSync(OUT_DIR, { recursive: true })
const have = new Set(fs.readdirSync(OUT_DIR))
const todo = sentences.filter((s) => !have.has(fileOf(s)))
const chars = todo.reduce((n, s) => n + s.text.length, 0)
const total = sentences.reduce((n, s) => n + s.text.length, 0)

console.log(`Voice: ${VOICE}`)
console.log(`${sentences.length} sentences (${total} characters); ${sentences.length - todo.length} already recorded; ${todo.length} to make (${chars} characters).`)
if (dryRun) {
  todo.slice(0, 40).forEach((s) => console.log(`  ${s.text.slice(0, 90)}${s.text.length > 90 ? '…' : ''}`))
  if (todo.length > 40) console.log(`  … and ${todo.length - 40} more`)
  process.exit(0)
}

/* ── Providers ── */
const xml = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
async function azure(text, voiceName) {
  const key = process.env.AZURE_SPEECH_KEY
  const region = process.env.AZURE_SPEECH_REGION
  if (!key || !region) throw new Error('Missing AZURE_SPEECH_KEY or AZURE_SPEECH_REGION in .env (see the top of this file).')
  const name = voiceName || VOICE_NAME
  // HD voices set their own tone from the words; a pitch change is only
  // applied to the standard voices (or when AZURE_PITCH is set).
  const pitch = process.env.AZURE_PITCH || (/DragonHD/.test(name) ? '' : '-6%')
  const body = pitch ? `<prosody pitch="${pitch}">${xml(text)}</prosody>` : xml(text)
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="${name}">${body}</voice></speak>`
  return fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': key,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      'User-Agent': 'physio-chandra-guide',
    },
    body: ssml,
  })
}
async function elevenlabs(text, model) {
  const key = process.env.ELEVENLABS_API_KEY
  if (!key) throw new Error('Missing ELEVENLABS_API_KEY in .env (see the top of this file).')
  return fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_NAME}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    // Calm and steady; lower stability if flat, raise similarity if it drifts.
    body: JSON.stringify({ text, model_id: model || process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2',
      voice_settings: { stability: 0.6, similarity_boost: 0.85, style: 0.1, use_speaker_boost: true, speed: 1.0 } }),
  })
}
const make = PROVIDER === 'azure' ? azure : PROVIDER === 'elevenlabs' ? elevenlabs : null
if (!make) { console.error(`Unknown voice provider "${PROVIDER}" in GUIDE_VOICE.`); process.exit(1) }

/* ── Azure: which English HD voices this region offers ── */
if (process.argv.includes('--list-voices')) {
  const res = await fetch(`https://${process.env.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/voices/list`, { headers: { 'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY || '' } })
  if (!res.ok) { console.error(`Failed (${res.status}): ${(await res.text()).slice(0, 300)}`); process.exit(1) }
  const voices = (await res.json()).filter((v) => /^en-(US|CA|GB|AU|IN)/.test(v.Locale) && /DragonHD/.test(v.ShortName))
  voices.forEach((v) => console.log(`  ${v.ShortName.padEnd(48)} ${v.Gender}`))
  console.log(`${voices.length} English HD voices in ${process.env.AZURE_SPEECH_REGION}.`)
  process.exit(0)
}

/* ── A sample to listen to: three sentences, nothing else changes ── */
if (sample) {
  const lines = [
    "Hey there, and welcome! I'm the virtual assistant of Physio Chandra, and it's great to have you here.",
    'How did the knee pain start?',
    "You're 30 to 49. Is that right?",
  ]
  const models = (PROVIDER === 'azure' ? (argOf('voices') || VOICE_NAME) : (argOf('models') || 'eleven_multilingual_v2,eleven_flash_v2_5')).split(',')
  const dir = path.join(ROOT, 'public', 'audio', 'guide-sample')
  fs.mkdirSync(dir, { recursive: true })
  let used = 0
  for (const model of models) {
    for (const [i, line] of lines.entries()) {
      const res = await make(line, model === 'default' ? undefined : model)
      if (!res.ok) { console.error(`Failed (${res.status}): ${(await res.text()).slice(0, 300)}`); process.exit(1) }
      const file = path.join(dir, `${model.replace(/[^A-Za-z0-9-]+/g, '-')}-${i + 1}.mp3`)
      fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()))
      used += line.length
      console.log(`  made ${path.relative(ROOT, file)}`)
    }
  }
  console.log(`Sample done (${used} characters). Listen to the files in public/audio/guide-sample/.`)
  process.exit(0)
}

/* ── Make the missing ones, gently (the free tier allows ~20 a minute) ── */
const perMin = Number(process.env.AZURE_RATE_PER_MIN || (PROVIDER === 'azure' ? 18 : 60))
const gap = Math.ceil(60000 / perMin)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let made = 0
let failed = 0
let spent = 0
for (const s of todo) {
  if (maxChars && spent + s.text.length > maxChars) { console.log(`Stopped at the cap of ${maxChars} characters; run again later for the rest.`); break }
  let res
  for (let attempt = 0; attempt < 4; attempt++) {
    res = await make(s.text)
    if (res.status !== 429) break
    const wait = Number(res.headers.get('retry-after')) * 1000 || 15000
    console.log(`  busy, waiting ${Math.round(wait / 1000)} s…`)
    await sleep(wait)
  }
  if (!res.ok) {
    console.error(`Failed (${res.status}) on: ${s.text.slice(0, 60)}\n  ${(await res.text()).slice(0, 300)}`)
    if (++failed >= 3) break
    continue
  }
  fs.writeFileSync(path.join(OUT_DIR, fileOf(s)), Buffer.from(await res.arrayBuffer()))
  made += 1
  spent += s.text.length
  if (made % 25 === 0) console.log(`  ${made} of ${todo.length} made…`)
  await sleep(gap)
}

/* ── The list the site reads (only sentences whose recording exists) ── */
const now = new Set(fs.readdirSync(OUT_DIR))
const keep = sentences.filter((s) => now.has(fileOf(s)))
const wanted = new Set(keep.map(fileOf))
for (const f of now) if (f.endsWith('.mp3') && !wanted.has(f)) fs.unlinkSync(path.join(OUT_DIR, f))
const lines = keep.map((s) => `  '${s.key}': '/audio/guide/${FOLDER}/${fileOf(s)}',`)
fs.writeFileSync(MANIFEST, `/* Made by scripts/make-guide-audio.mjs (npm run guide:audio): which recording
   says which sentence, keyed by a short code of the exact words. Voice:
   ${VOICE}. Do not edit by hand. Sentences not listed use the browser's voice. */
export const GUIDE_AUDIO = {
${lines.join('\n')}${lines.length ? '\n' : ''}}
`)
console.log(`Made ${made}. ${keep.length} of ${sentences.length} sentences now have a recording.`)
