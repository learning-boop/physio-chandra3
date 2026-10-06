/* ─────────────────────────────────────────────────────────────────────────
   The cauda equina warning-signs card ("CaudaEquina.docx", signed by Chandra
   5 Oct 2026, section 6: "standing warning-signs card shown at the end of
   every low-back result, and on the results PDF").

   Why it is shown even though the safety questions already asked these:
   cauda equina can begin days or weeks AFTER someone reads their results, and
   the condition pages are reached from search without the safety screen. The
   National Suspected CES Pathway (GIRFT 2023) asks clinicians to hand every
   back-pain patient exactly this card and to record that they did.

   It is a safety-net, not a result: it never changes the route, and it is
   shown whatever the result was.
   ───────────────────────────────────────────────────────────────────────── */

/* The five Pathway red flags in patient words, as the signed document has
   them. Kept to one sentence each so the card can be read at a glance. */
export const CES_WARNING = {
  title: 'Go to an emergency department now if any of these start',
  signs: [
    'New trouble starting to pass urine, a weak or slow stream, or not feeling when your bladder is full or has emptied',
    'New numbness or tingling between your legs, around your bottom or in your genitals — for example not feeling the toilet paper',
    'Leaking urine, or losing control of your bowels or wind',
    'New loss of feeling during sex, or new difficulty with erections or ejaculation',
    'Both legs becoming weak, numb or heavy',
  ],
  text: 'These are the warning signs of pressure on the nerves at the base of the spine (cauda equina syndrome). It is rare, and most back pain — even severe back pain with sciatica — is not this. But the nerves recover best when the pressure is taken off quickly, so do not wait to see if it settles. Being checked and found clear is the right outcome, not a wasted trip.',
}

/* Flat text for the PDF and for the summary Chandra receives. */
export const cesWarningText = () =>
  `${CES_WARNING.title}: ${CES_WARNING.signs.map((s) => s.toLowerCase()).join('; ')}. ${CES_WARNING.text}`

/* Shown for every low back, pelvis or leg-referral result: the areas where
   cauda equina is the thing being safety-netted. */
const CES_ZONES = ['lowerback', 'buttock', 'sij', 'coccyx']
export function cesWarning(zones = [], keys = []) {
  return zones.some((z) => CES_ZONES.includes(z.type)) || keys.includes('lowback') || keys.includes('sij')
}
