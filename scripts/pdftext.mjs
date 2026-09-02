/* Minimal text extraction from a text-based PDF: inflate the content streams
   and pull the strings out of the text-showing operators. Enough to read a
   document's wording; not a full PDF renderer.
   Usage: node scripts/pdftext.mjs <file.pdf> */
import fs from 'node:fs'
import zlib from 'node:zlib'

const buf = fs.readFileSync(process.argv[2])
const out = []
let i = 0
while (true) {
  const s = buf.indexOf('stream', i)
  if (s < 0) break
  let p = s + 6
  if (buf[p] === 0x0d) p++
  if (buf[p] === 0x0a) p++
  const e = buf.indexOf('endstream', p)
  if (e < 0) break
  let data = buf.subarray(p, e)
  try { data = zlib.inflateSync(data) } catch { i = e + 9; continue }
  const txt = data.toString('latin1')
  if (!/BT/.test(txt)) { i = e + 9; continue }
  let line = ''
  const re = /\((?:\\.|[^\\()])*\)|TJ|Tj|TD|Td|T\*|ET/g
  let m
  while ((m = re.exec(txt))) {
    const t = m[0]
    if (t[0] === '(') {
      line += t.slice(1, -1)
        .replace(/\\([()\\])/g, '$1')
        .replace(/\\n/g, ' ')
        .replace(/\\r/g, ' ')
        .replace(/\\(\d{1,3})/g, (_, o) => String.fromCharCode(parseInt(o, 8)))
    } else if (t === 'TD' || t === 'Td' || t === 'T*' || t === 'ET') {
      if (line.trim()) out.push(line.trim())
      line = ''
    }
  }
  if (line.trim()) out.push(line.trim())
  i = e + 9
}
console.log(out.join('\n').replace(/\n{3,}/g, '\n\n'))
