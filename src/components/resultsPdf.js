/* The patient's copy of their results, as a PDF built on their own device
   (jsPDF, loaded only on the results page). Nothing here is sent anywhere:
   the file goes straight to the phone's share sheet or the browser's
   download. */

let jsPdfModule = null
// Load jsPDF ahead of the tap, so the PDF can be built and handed to the share
// sheet inside the tap itself — phones refuse to share after a long wait.
export function preloadPdf() {
  if (!jsPdfModule) jsPdfModule = import('jspdf').then((m) => { jsPdfModule = m; return m })
  return jsPdfModule
}
export const pdfReady = () => !!(jsPdfModule && jsPdfModule.jsPDF)

// The built-in PDF fonts cover Western European text only.
const clean = (s) => String(s == null ? '' : s)
  .replace(/[‘’′]/g, "'").replace(/[“”″]/g, '"')
  .replace(/[–—−]/g, '-').replace(/…/g, '...').replace(/·/g, '-')
  .replace(/≥/g, '>=').replace(/≤/g, '<=').replace(/→/g, '->')
  .replace(/[^\n\x20-\x7E -ÿ]/g, '')

const NAVY = [10, 26, 47]
const GOLD = [201, 169, 110]
const INK = [34, 34, 34]
const MUTED = [110, 110, 104]
const AMBER = [180, 110, 0]

/**
 * @param {object} d
 *  code, dateText, images { front, back: { src, width, height }, views: [{ src, width, height, label }] } | null,
 *  areas [string], doctor {title, items[]} | null, referral [{title, text}],
 *  conditions [{name, blurb}], noMatch string | null, painType string | null,
 *  cautions [string], behaviour [string], answers [{question, answer}], notes string
 * @returns jsPDF document
 */
export function buildResultsPdf(d) {
  const { jsPDF } = jsPdfModule
  const doc = new jsPDF({ unit: 'pt', format: 'letter' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 48
  const bottom = H - 56
  let y = 0

  const page = () => { doc.addPage(); y = M }
  const room = (h) => { if (y + h > bottom) page() }
  const text = (s, { size = 10.5, color = INK, bold = false, indent = 0, gap = 4, lh = 1.38 } = {}) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setFontSize(size)
    doc.setTextColor(...color)
    const lines = doc.splitTextToSize(clean(s), W - 2 * M - indent)
    const step = size * lh
    lines.forEach((ln) => { room(step); doc.text(ln, M + indent, y + size); y += step })
    y += gap
  }
  // `keep`: how much of what follows must fit under the heading on the same page.
  const heading = (s, color = NAVY, keep = 40) => {
    room(38 + keep)   // the heading and at least the start of what follows
    y += 10
    doc.setDrawColor(...GOLD); doc.setLineWidth(1.2); doc.line(M, y, M + 28, y)
    y += 8
    text(s, { size: 13.5, bold: true, color, gap: 6 })
  }
  const bullets = (items, opts = {}) => items.forEach((it) => {
    const before = y
    text(it, { indent: 12, gap: 3, ...opts })
    doc.setFillColor(...GOLD); doc.circle(M + 3.5, before + 7, 1.6, 'F')
  })

  // Header band
  doc.setFillColor(...NAVY); doc.rect(0, 0, W, 92, 'F')
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...GOLD)
  doc.text('PHYSIO CHANDRA', M, 36)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(19); doc.setTextColor(255, 255, 255)
  doc.text('Your pain guide results', M, 62)
  doc.setFontSize(9); doc.setTextColor(...GOLD)
  doc.text('REFERENCE CODE', W - M, 36, { align: 'right' })
  doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.setTextColor(255, 255, 255)
  doc.text(clean(d.code), W - M, 60, { align: 'right' })
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(210, 214, 222)
  doc.text(clean(d.dateText), W - M, 76, { align: 'right' })
  y = 112

  text('This is general information to help you describe your symptoms. It is not a diagnosis and does not replace an assessment by a physiotherapist or physician. Please bring it, or your reference code, to your appointment.',
    { size: 9.5, color: MUTED, gap: 8 })

  // Pictures in a two-column grid, each in a box with a caption under it.
  const colW = (W - 2 * M - 16) / 2
  const grid = (items, boxH) => {
    for (let i = 0; i < items.length; i += 2) {
      const row = items.slice(i, i + 2)
      const caps = row.map((it) => { doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); return doc.splitTextToSize(clean(it.label), colW - 16) })
      const capH = Math.max(...caps.map((c) => c.length)) * 11
      room(boxH + capH + 24)
      row.forEach((it, j) => {
        const x0 = M + j * (colW + 16)
        const k = Math.min((boxH - 8) / it.img.height, (colW - 8) / it.img.width)
        const iw = it.img.width * k, ih = it.img.height * k
        doc.setDrawColor(226, 220, 208); doc.setLineWidth(0.8); doc.roundedRect(x0, y, colW, boxH + capH + 12, 6, 6, 'S')
        try { doc.addImage(it.img.src, 'JPEG', x0 + (colW - iw) / 2, y + 4 + (boxH - 8 - ih) / 2, iw, ih) } catch { /* picture unavailable */ }
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...MUTED)
        caps[j].forEach((ln, l) => doc.text(ln, x0 + colW / 2, y + boxH + 10 + l * 11, { align: 'center' }))
      })
      y += boxH + capH + 24
    }
  }

  // What the person drew, each from the side they drew it on (the sole seen
  // from below, not the body standing), then the whole body for context.
  const views = (d.images && d.images.views) || []
  if (views.length) {
    // Two rows of close-ups fit on the first page when they are 200pt tall.
    const boxH = views.length > 2 ? 200 : colW
    heading('Where you drew', NAVY, boxH + 40)
    grid(views.map((v) => ({ img: v, label: v.label })), boxH)
  }
  if (d.images && d.images.front && d.images.back) {
    if (views.length) heading('Whole body', NAVY, 220 + 40)
    grid([{ img: d.images.front, label: 'FRONT' }, { img: d.images.back, label: 'BACK' }], views.length ? 220 : 300)
  }

  if (d.areas.length) { heading('Areas you marked'); text(d.areas.join(', ')) }

  if (d.doctor) {
    heading(d.doctor.title, AMBER)
    bullets(d.doctor.items)
    text('The information below is general education and does not replace that check.', { size: 9.5, color: MUTED })
  }

  d.referral.forEach((r) => { heading('Your drawing shows a referral pattern'); text(r.title, { bold: true }); text(r.text) })

  heading('What your answers can be associated with')
  if (d.conditions.length) {
    d.conditions.forEach((c) => { text(c.name, { bold: true, gap: 2 }); if (c.blurb) text(c.blurb, { gap: 8 }) })
    text('These patterns can be associated with answers like yours. They are general education, not findings about you.', { size: 9.5, color: MUTED })
  } else {
    text(d.noMatch || 'No clear match in this guide. An in-person assessment is the right next step.')
  }

  if (d.painType) { heading('Likely pain type'); text(d.painType) }
  if (d.behaviour.length) { heading('How your pain behaves'); bullets(d.behaviour) }
  if (d.cautions.length) { heading('To mention when you book'); bullets(d.cautions) }

  if (d.answers.length) {
    heading('Your answers')
    d.answers.forEach((p) => { text(p.question, { size: 9.5, color: MUTED, gap: 1 }); text(p.answer, { gap: 7 }) })
  }
  if (d.notes) { heading('Your notes'); text(d.notes) }

  heading('Important')
  text('This summary is not a confirmed diagnosis. It is based only on your answers and cannot examine you or review your medical history. Every person is different, and no particular result or outcome is implied or guaranteed. If your symptoms change or worsen, please seek advice from a health professional. In an emergency, call 911.',
    { size: 9.5 })

  // Footer on every page
  const n = doc.getNumberOfPages()
  for (let i = 1; i <= n; i++) {
    doc.setPage(i)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...MUTED)
    doc.text(clean(`Physio Chandra - physiochandra.ca - Reference ${d.code}`), M, H - 28)
    doc.text(`Page ${i} of ${n}`, W - M, H - 28, { align: 'right' })
  }
  return doc
}

// Hands the PDF to the phone's share sheet (Save to Files, send, print), or
// downloads it on a computer or where sharing files is not supported.
export async function savePdf(doc, filename) {
  const coarse = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(pointer: coarse)').matches
  if (coarse && typeof navigator !== 'undefined' && navigator.canShare) {
    try {
      const file = new File([doc.output('blob')], filename, { type: 'application/pdf' })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'My pain guide results' })
        return 'shared'
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return 'cancelled'
    }
  }
  doc.save(filename)
  return 'saved'
}
