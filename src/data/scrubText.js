/* Takes anything that looks like personal or contact details out of a
   feedback comment: email and web addresses, Canadian postal codes, phone,
   health card and other long numbers, and a name after "my name is".
   Used twice: in the browser before anything is sent
   (src/components/FeedbackForm.jsx), and again on the server before it is
   kept (api/feedback.js). Short numbers ("3 out of 10", "age 45") stay. */
export const MAX_COMMENT = 500
const REMOVED = '[removed]'

export function scrub(text) {
  let s = String(text || '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  s = s
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, REMOVED)                                  // email
    .replace(/\b(?:https?:\/\/|www\.)\S+/gi, REMOVED)                               // web address
    .replace(/\b[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d\b/g, REMOVED)                  // Canadian postal code
    .replace(/\(?(?:\+?\d[\s().-]*){7,}/g, (m) => (m.replace(/\D/g, '').length >= 7 ? REMOVED + ' ' : m)) // phone, health card, long numbers
    .replace(/\b([Mm]y name is|[Mm]y name's|[Ii] am called|[Ii]'m called|[Cc]all me)\s+[A-Za-z][\w'-]*(\s+[A-Z][\w'-]*)?/g, (m, lead) => `${lead} ${REMOVED}`)
    .replace(/\s+/g, ' ')
    .trim()
  return s.slice(0, MAX_COMMENT)
}
