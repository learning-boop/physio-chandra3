/* ── The clinics where Chandra practises ────────────────────────────────
   Single source for the Locations section and the booking step at the end of
   the pain assessment.

   janeUrl: the clinic's Jane online-booking page. Leave it '' until the link
   is available — the booking step then offers only the phone call, rather
   than a button that goes nowhere.
   phone: the 555 numbers are placeholders and must be replaced before
   go-live. */
export const CLINICS = [
  {
    id: 'arka',
    name: 'Arka Physiotherapy',
    area: 'South Surrey',
    address: 'South Surrey, BC',
    hours: 'Mon – Fri   8:00 am – 7:00 pm\nSaturday   9:00 am – 4:00 pm',
    phone: '+1 (604) 555-0101',
    janeUrl: '',
    img: 'images/clinic1.png',
    tagline: 'Comprehensive physiotherapy in the heart of South Surrey.',
  },
  {
    id: 'bcice',
    name: 'BC Ice',
    area: 'Burnaby',
    address: 'Burnaby, BC',
    hours: 'Mon – Fri   7:00 am – 8:00 pm\nSaturday   9:00 am – 3:00 pm',
    phone: '+1 (604) 555-0202',
    janeUrl: '',
    img: 'images/clinic2.jpg',
    tagline: 'Physiotherapy and rehabilitation services in Burnaby.',
  },
  {
    id: 'phg',
    name: 'Performance Health Group',
    area: 'Guildford',
    address: 'Guildford, Surrey BC',
    hours: 'Mon – Fri   8:00 am – 6:00 pm\nSaturday   10:00 am – 2:00 pm',
    phone: '+1 (604) 555-0303',
    janeUrl: '',
    img: 'images/clinic31.jpg',
    tagline: 'Physiotherapy and rehabilitation services in Guildford.',
  },
]

/* tel: links want digits only (a leading + is kept). */
export const telHref = (phone) => `tel:${phone.replace(/[^\d+]/g, '')}`
