/* ── The clinics where Chandra practises ────────────────────────────────
   Single source for the Locations section and the booking step at the end of
   the pain assessment.

   janeUrl: the clinic's Jane online-booking page. Leave it '' until the link
   is available — the booking step then offers only the phone call, rather
   than a button that goes nowhere.
   phone: the 555 numbers are placeholders and must be replaced before
   go-live.
   near: neighbouring communities, so people can place themselves.
   lat/lng: the centre of the AREA (approximate), used only on the visitor's
   device for "Find my nearest clinic"; replace with each clinic's own
   coordinates once the street addresses are added.
   map: the pin's position on the area sketch in ClinicPicker.jsx (x, y in
   its 520 x 230 frame; not to scale). */
export const CLINICS = [
  {
    id: 'arka',
    name: 'Arka Physiotherapy',
    area: 'South Surrey',
    near: 'White Rock, Morgan Creek, Grandview Heights',
    lat: 49.045, lng: -122.79,
    map: { x: 318, y: 176 },
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
    near: 'Metrotown, New Westminster, East Vancouver',
    lat: 49.2276, lng: -123.004,
    map: { x: 128, y: 58 },
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
    near: 'North Surrey, Fleetwood, Port Mann',
    lat: 49.1904, lng: -122.8026,
    map: { x: 330, y: 98 },
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

/* Straight-line distance in km between two points (haversine). */
export function kmBetween(a, b) {
  const R = 6371, rad = (d) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/* A maps search for the clinic, until street addresses are added. */
export const directionsHref = (c) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${c.name}, ${c.address}`)}`
