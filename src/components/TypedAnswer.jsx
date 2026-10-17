/* A typed answer ("Something else", "Other"), read and reflected on the
   patient's own device (Chandra, 17 Oct 2026). Nothing typed is sent
   anywhere or read aloud word for word (the voice is made in advance):
   1. Danger first: clearly urgent words show the emergency advice at once,
      with the call buttons, and the assistant says it.
   2. A listed answer in what was typed ("tingling" → "Pins and needles"):
      "Is that what you meant?" with Yes / No; only Yes ticks it.
   3. Otherwise, once the box is left: a short thank-you in Chandra's voice.
   The words still reach Chandra on the summary. */
import { useEffect, useRef, useState } from 'react'
import { matchDetail, typedUrgent } from '../data/voiceMatch'
import { SPECIAL_REPLIES } from '../data/talkingGuide'
import { sendGuideTyped } from '../data/guideStage'

const GOLD = '#c9a96e'
const EMERGENCY = SPECIAL_REPLIES.find((s) => s.id === 'emergency')

export default function TypedAnswer({ value, onChange, placeholder, style, options = [], onPick }) {
  const [settled, setSettled] = useState('')
  const [said, setSaid] = useState([])       // option ids answered "No" to
  const told = useRef({ urgent: '', suggest: '', noted: false })
  // Read once the typing has paused.
  useEffect(() => { const t = setTimeout(() => setSettled(String(value || '').trim()), 1000); return () => clearTimeout(t) }, [value])
  const urgent = settled.length > 2 && typedUrgent(settled)
  let suggest = null
  if (!urgent && settled.length > 2 && options.length) {
    const r = matchDetail(settled, options.map((o) => ({ id: o.id, label: o.label })), false)
    const hit = r.ids.length === 1 ? options.find((o) => o.id === r.ids[0]) : null
    if (hit && !said.includes(hit.id)) suggest = hit
  }
  useEffect(() => {
    if (urgent && told.current.urgent !== settled) { told.current.urgent = settled; sendGuideTyped({ kind: 'urgent' }) }
  }, [urgent, settled])
  useEffect(() => {
    if (suggest && told.current.suggest !== suggest.id) { told.current.suggest = suggest.id; sendGuideTyped({ kind: 'suggest', label: suggest.label }) }
  }, [suggest])
  const onBlur = () => {
    const t = String(value || '').trim()
    if (t.length < 3 || told.current.noted || typedUrgent(t) || suggest) return
    told.current.noted = true
    sendGuideTyped({ kind: 'noted' })
  }
  return (
    <>
      <input autoFocus value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} style={style} />
      {urgent && (
        <div className="ta-urgent" role="alert">
          <p>{EMERGENCY.a}</p>
          <div className="ta-calls">
            {EMERGENCY.calls.map((c) => <a key={c.href} href={c.href}>{c.label}</a>)}
          </div>
        </div>
      )}
      {suggest && (
        <div className="ta-suggest" role="group" aria-label="Did you mean this answer?">
          <p>Did you mean <b>{suggest.label}</b>?</p>
          <div className="ta-btns">
            <button type="button" className="ta-yes" onClick={() => { onPick && onPick(suggest.id); setSaid((s) => [...s, suggest.id]) }}>Yes, tick it</button>
            <button type="button" className="ta-no" onClick={() => setSaid((s) => [...s, suggest.id])}>No</button>
          </div>
        </div>
      )}
      <style>{`
        .ta-urgent { margin-top: 10px; padding: 14px 16px; border-radius: 14px; background: rgba(224,82,62,0.16); border: 1.5px solid rgba(240,128,108,0.85); }
        .ta-urgent p { margin: 0 0 10px; color: #fff; font-size: 15.5px; line-height: 1.55; }
        .ta-calls { display: flex; flex-wrap: wrap; gap: 8px; }
        .ta-calls a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border-radius: 999px; background: #f0806c; color: #081527; font-weight: 700; text-decoration: none; }
        .ta-suggest { margin-top: 10px; padding: 12px 14px; border-radius: 14px; background: rgba(201,169,110,0.14); border: 1px solid rgba(201,169,110,0.55); }
        .ta-suggest p { margin: 0 0 10px; color: #fff; font-size: 15.5px; line-height: 1.5; }
        .ta-btns { display: flex; gap: 10px; flex-wrap: wrap; }
        .ta-btns button { min-height: 44px; padding: 0 18px; border-radius: 999px; font: inherit; font-weight: 600; cursor: pointer; }
        .ta-yes { background: ${GOLD}; color: #081527; border: 1px solid ${GOLD}; }
        .ta-no { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.4); }
      `}</style>
    </>
  )
}
