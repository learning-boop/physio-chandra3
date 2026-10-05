/* Turns a scanned PDF (the OrthoDiv AIM Theory Manual chapters, older CPGs)
   into searchable text, for checking condition documents against them
   (Chandra, 5 Oct 2026).

   Run: node scripts/ocr-pdf.mjs "<file.pdf>" [first-page] [last-page]
   Writes evidence-text/<file name>.txt (not committed: the manuals are for
   personal use), one "=== PAGE n ===" block per page. A page that already has
   a text layer is taken as it is; a scanned page is read with Tesseract.

   Needs Poppler (pdftoppm, pdftotext) and Tesseract, installed with winget on
   5 Oct 2026:
     winget install oschwartz10612.Poppler
     winget install UB-Mannheim.TesseractOCR */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const [pdf, first, last] = process.argv.slice(2)
if (!pdf || !fs.existsSync(pdf)) { console.error('usage: node scripts/ocr-pdf.mjs "<file.pdf>" [first-page] [last-page]'); process.exit(1) }

/** A tool on PATH, or where winget puts it. */
function tool(name, guesses) {
  for (const g of guesses) if (fs.existsSync(g)) return g
  try { return execFileSync(process.platform === 'win32' ? 'where' : 'which', [name], { encoding: 'utf8' }).split(/\r?\n/)[0].trim() } catch { return null }
}
const wingetPkgs = path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages')
const popplerBin = (() => {
  try {
    const dir = fs.readdirSync(wingetPkgs).find((d) => d.startsWith('oschwartz10612.Poppler'))
    const ver = dir && fs.readdirSync(path.join(wingetPkgs, dir)).find((d) => d.startsWith('poppler-'))
    return ver ? path.join(wingetPkgs, dir, ver, 'Library', 'bin') : ''
  } catch { return '' }
})()
const exe = (n) => (process.platform === 'win32' ? n + '.exe' : n)
const PDFTOPPM = tool('pdftoppm', [path.join(popplerBin, exe('pdftoppm'))])
const PDFTOTEXT = tool('pdftotext', [path.join(popplerBin, exe('pdftotext'))])
const PDFINFO = tool('pdfinfo', [path.join(popplerBin, exe('pdfinfo'))])
const TESSERACT = tool('tesseract', ['C:\\Program Files\\Tesseract-OCR\\tesseract.exe'])
if (!PDFTOPPM || !PDFTOTEXT || !TESSERACT) { console.error('Poppler or Tesseract not found; see the comment at the top of this script.'); process.exit(1) }

const pages = Number((execFileSync(PDFINFO, [pdf], { encoding: 'utf8' }).match(/^Pages:\s+(\d+)/m) || [])[1] || 0)
const from = Number(first) || 1, to = Math.min(Number(last) || pages, pages)
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ocr-'))
fs.mkdirSync('evidence-text', { recursive: true })
const out = path.join('evidence-text', path.basename(pdf).replace(/\.pdf$/i, '') + (first ? `_p${from}-${to}` : '') + '.txt')
const parts = []
let ocred = 0
for (let p = from; p <= to; p++) {
  let text = execFileSync(PDFTOTEXT, ['-layout', '-f', String(p), '-l', String(p), pdf, '-'], { encoding: 'utf8' })
  if (text.replace(/\s/g, '').length < 40) {
    const base = path.join(tmp, 'p')
    execFileSync(PDFTOPPM, ['-r', '250', '-gray', '-f', String(p), '-l', String(p), '-png', '-singlefile', pdf, base])
    text = execFileSync(TESSERACT, [base + '.png', '-', '-l', 'eng'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    ocred++
  }
  parts.push(`=== PAGE ${p} ===\n${text.trim()}\n`)
  process.stdout.write(`\r${p - from + 1}/${to - from + 1} pages`)
}
fs.writeFileSync(out, parts.join('\n'))
fs.rmSync(tmp, { recursive: true, force: true })
console.log(`\nWrote ${out} (${to - from + 1} pages, ${ocred} read by OCR)`)
