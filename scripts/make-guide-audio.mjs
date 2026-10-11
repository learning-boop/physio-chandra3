/* Make the talking guide's recordings in Chandra's cloned voice.

     npm run guide:audio -- --dry-run   list what would be made, and the cost
     npm run guide:audio                make the missing recordings

   Needs, in .env (never committed):
     ELEVENLABS_API_KEY=...    from elevenlabs.io → Profile → API keys
     ELEVENLABS_VOICE_ID=...   the cloned voice's ID (Voices → the voice → ID)

   Every text the guide can read out (src/data/talkingGuide.js,
   allSpokenTexts) becomes public/audio/guide/<name>-<code>.mp3, where the
   code comes from the exact words. Texts that already have a recording are
   skipped, so after a wording change only the changed ones are made (and
   charged). Recordings of words no longer used are deleted. The list the
   site reads is written to src/data/guideAudio.js.

   Only the guide's own pre-written words are sent to ElevenLabs, once, here;
   visitors' browsers never contact it. */
import fs from 'node:fs'
import path from 'node:path'
import { allSpokenTexts, textKey } from '../src/data/talkingGuide.js'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..')
const OUT_DIR = path.join(ROOT, 'public', 'audio', 'guide')
const MANIFEST = path.join(ROOT, 'src', 'data', 'guideAudio.js')
const dryRun = process.argv.includes('--dry-run')

try { process.loadEnvFile(path.join(ROOT, '.env')) } catch { /* no .env: checked below */ }
const KEY = process.env.ELEVENLABS_API_KEY
const VOICE = process.env.ELEVENLABS_VOICE_ID
// Calm and steady, close to the recording; tweak here if it sounds flat
// (lower stability) or drifts from Chandra's voice (raise similarity).
const MODEL = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2'
const SETTINGS = { stability: 0.6, similarity_boost: 0.85, style: 0.1, use_speaker_boost: true, speed: 1.0 }

const texts = allSpokenTexts().map((t) => ({ ...t, key: textKey(t.text) }))
const fileOf = (t) => `${t.name}-${t.key}.mp3`
fs.mkdirSync(OUT_DIR, { recursive: true })
const have = new Set(fs.readdirSync(OUT_DIR))
const todo = texts.filter((t) => !have.has(fileOf(t)))
const chars = todo.reduce((n, t) => n + t.text.length, 0)

console.log(`${texts.length} texts, ${texts.length - todo.length} already recorded, ${todo.length} to make (${chars} characters).`)
if (dryRun) {
  todo.forEach((t) => console.log(`  ${fileOf(t).padEnd(42)} ${t.text.slice(0, 70)}${t.text.length > 70 ? '…' : ''}`))
  process.exit(0)
}
if (todo.length && (!KEY || !VOICE)) {
  console.error('Missing ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID in .env (see the top of this file).')
  process.exit(1)
}

let made = 0
for (const t of todo) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ text: t.text, model_id: MODEL, voice_settings: SETTINGS }),
  })
  if (!res.ok) {
    console.error(`Failed on ${t.name}: ${res.status} ${(await res.text()).slice(0, 300)}`)
    break
  }
  fs.writeFileSync(path.join(OUT_DIR, fileOf(t)), Buffer.from(await res.arrayBuffer()))
  made += 1
  console.log(`  made ${fileOf(t)}`)
}

// The list the site reads: only texts whose recording exists.
const now = new Set(fs.readdirSync(OUT_DIR))
const keep = texts.filter((t) => now.has(fileOf(t)))
const wanted = new Set(keep.map(fileOf))
for (const f of now) if (f.endsWith('.mp3') && !wanted.has(f)) {
  fs.unlinkSync(path.join(OUT_DIR, f))
  console.log(`  removed old ${f}`)
}
const lines = keep.map((t) => `  '${t.key}': '/audio/guide/${fileOf(t)}', // ${t.name}`)
fs.writeFileSync(MANIFEST, `/* Made by scripts/make-guide-audio.mjs (npm run guide:audio): which recording
   in public/audio/guide/ says which text, keyed by a short code of the exact
   words. Do not edit by hand. Texts not listed use the browser's voice. */
export const GUIDE_AUDIO = {
${lines.join('\n')}${lines.length ? '\n' : ''}}
`)
console.log(`Made ${made}. ${keep.length} of ${texts.length} texts now have a recording.`)
