/* Cheap diagnostic: what does this PDF actually contain? */
import fs from 'node:fs'
import Anthropic from '@anthropic-ai/sdk'
import { getApiKey } from '../api/_lib/painShared.js'
const c = new Anthropic({ apiKey: getApiKey() })
const pdf = fs.readFileSync(process.argv[2]).toString('base64')
const s = c.messages.stream({
  model: 'claude-sonnet-5', max_tokens: 1500, thinking: { type: 'disabled' },
  messages: [{ role: 'user', content: [
    { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdf } },
    { type: 'text', text: 'What is this document? List every named clinical condition it covers, one per line. If the pages are unreadable scans, say so plainly.' },
  ] }],
})
const m = await s.finalMessage()
console.log(m.content.find((b) => b.type === 'text').text)
console.log(`\n[${m.usage.input_tokens} in / ${m.usage.output_tokens} out]`)
