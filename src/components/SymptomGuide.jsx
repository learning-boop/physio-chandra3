import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  REGIONS, GENERAL_RED_FLAGS, PAIN_CHARACTER, SPECIAL_CARDS,
  classifyPainType, isRelevant, shouldStop, answeredRegionCount, computeResults,
} from '../data/symptomGuide'

const GOLD = '#c9a96e'
const GOLD_LIGHT = '#e8d5b0'
const EASE = [0.22, 1, 0.36, 1]

const label = { fontSize: 11.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: GOLD }
const qText = { fontFamily: 'var(--font-display)', fontSize: 'clamp(19px, 5vw, 22px)', fontWeight: 300, color: '#fff', lineHeight: 1.3, margin: '0 0 14px' }
const chip = (sel) => ({
  padding: '12px 16px', borderRadius: 999, cursor: 'pointer', fontSize: 14, lineHeight: 1.35, minHeight: 44,
  border: `1px solid ${sel ? GOLD : 'rgba(255,255,255,0.22)'}`,
  background: sel ? 'rgba(201,169,110,0.18)' : 'rgba(255,255,255,0.04)',
  color: sel ? GOLD_LIGHT : 'rgba(255,255,255,0.78)', transition: 'all 0.15s', textAlign: 'left',
})
const primaryBtn = {
  padding: '15px 26px', background: GOLD, color: '#081527', border: 'none', borderRadius: 999,
  minHeight: 48, fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
}
const ghostBtn = {
  padding: '13px 20px', background: 'transparent', color: 'rgba(255,255,255,0.65)',
  border: '1px solid rgba(255,255,255,0.25)', borderRadius: 999,
  minHeight: 44, fontSize: 12.5, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
}
const card = { border: '1px solid rgba(201,169,110,0.25)', background: 'rgba(201,169,110,0.05)', borderRadius: 14, padding: 'clamp(14px, 4vw, 18px)', marginTop: 12 }

function Fade({ children, k }) {
  return (
    <motion.div key={k} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: EASE }}>
      {children}
    </motion.div>
  )
}

// zones: [{ regionKey, zoneLabel }] — only supported regions, deduped by key
export default function SymptomGuide({ regionOptions }) {
  const [regionKey, setRegionKey] = useState(regionOptions.length === 1 ? regionOptions[0].regionKey : null)
  const region = regionKey ? REGIONS[regionKey] : null

  // steps: 0 flags → 1 context → 2..n region questions → results
  const steps = useMemo(() => region
    ? [{ type: 'flags' }, { type: 'ctx' }, ...region.questions.map((q) => ({ type: 'q', q })), { type: 'results' }]
    : [], [region])

  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [flags, setFlags] = useState([])
  const [flagExit, setFlagExit] = useState(null)   // { picked, emergency }
  const [stoppedEarly, setStoppedEarly] = useState(false)

  const restart = () => { setStepIndex(0); setAnswers({}); setFlags([]); setFlagExit(null); setStoppedEarly(false); if (regionOptions.length > 1) setRegionKey(null) }

  // ── adaptive advance (ported 1:1) ──
  const advanceFrom = (idx, ans) => {
    let i = idx
    while (i < steps.length - 1) {
      const step = steps[i]
      if (step.type !== 'q') break
      if (answeredRegionCount(region, ans) >= 2 && shouldStop(region, ans)) {
        setStoppedEarly(true)
        return steps.length - 1
      }
      if (!isRelevant(step.q, region, ans)) { i++; continue }
      break
    }
    return i
  }

  const nextStep = (latestAnswers = answers) => {
    if (stepIndex >= steps.length - 1) return
    const cur = steps[stepIndex]
    let ans = latestAnswers
    if (cur?.type === 'q' && ans[cur.q.id] === undefined) {
      ans = { ...ans, [cur.q.id]: cur.q.multi ? [] : '__skip' }
      setAnswers(ans)
    }
    setStepIndex(advanceFrom(stepIndex + 1, ans))
  }
  const backStep = () => { setFlagExit(null); setStepIndex((i) => Math.max(0, i - 1)) }

  const setSingle = (qid, oid, autoNext = false) => {
    const ans = { ...answers, [qid]: answers[qid] === oid && !autoNext ? undefined : oid }
    setAnswers(ans)
    if (autoNext) {
      // region questions: choosing an answer advances immediately
      setStepIndex(advanceFrom(stepIndex + 1, ans))
    }
  }
  const setMulti = (qid, oid) => {
    const cur = Array.isArray(answers[qid]) ? [...answers[qid]] : []
    const i = cur.indexOf(oid)
    if (i >= 0) cur.splice(i, 1); else cur.push(oid)
    setAnswers({ ...answers, [qid]: cur })
  }

  // ── screens ──

  if (!region) {
    return (
      <div>
        <span style={label}>Guided Questions</span>
        <p style={qText}>Which area shall we ask about?</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {regionOptions.map((r) => (
            <button key={r.regionKey} style={chip(false)} onClick={() => setRegionKey(r.regionKey)}>
              {REGIONS[r.regionKey].name}
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (flagExit) {
    const { picked, emergency } = flagExit
    return (
      <Fade k="flagexit">
        <div style={{ ...card, borderColor: emergency ? 'rgba(239,68,68,0.6)' : 'rgba(245,158,11,0.55)', background: emergency ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.07)' }}>
          <strong style={{ color: emergency ? '#fca5a5' : '#fcd34d', fontSize: 15 }}>
            {emergency ? 'Please seek emergency care now' : 'Please see a doctor promptly'}
          </strong>
          <p style={{ fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,0.8)', margin: '8px 0 0' }}>
            {emergency
              ? 'Based on what you selected, this needs emergency assessment — call 911 or go to the nearest emergency department now. This guide will stop here.'
              : 'Some of what you selected should be checked by a doctor promptly rather than through this guide. Please contact your family doctor today, call 811 (HealthLink BC), or visit urgent care.'}
          </p>
        </div>
        <p style={{ ...label, marginTop: 14, display: 'block' }}>You selected</p>
        <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 12.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.7)' }}>
          {picked.map((f) => <li key={f.id}>{f.text}</li>)}
        </ul>
        <p style={{ fontSize: 11, lineHeight: 1.6, color: 'rgba(255,255,255,0.4)', margin: '12px 0 0' }}>
          This is a cautious educational guide — flagging does not mean something serious is confirmed; it means it should be looked at properly.
        </p>
        <button style={{ ...ghostBtn, marginTop: 12 }} onClick={restart}>Start again</button>
      </Fade>
    )
  }

  const step = steps[stepIndex]
  const progress = Math.round((stepIndex / (steps.length - 1)) * 100)

  const header = (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={label}>{region.name}</span>
        {stepIndex > 0 && step.type !== 'results' && (
          <button onClick={backStep} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 11, cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase' }}>← Back</button>
        )}
      </div>
      <div style={{ height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
        <motion.div animate={{ width: `${progress}%` }} style={{ height: 2, background: GOLD, borderRadius: 2 }} />
      </div>
    </div>
  )

  // 1 ── RED FLAGS
  if (step.type === 'flags') {
    const all = region.redFlags.concat(GENERAL_RED_FLAGS)
    const submit = () => {
      if (flags.length) {
        const picked = all.filter((f) => flags.includes(f.id))
        setFlagExit({ picked, emergency: picked.some((f) => f.tier === 'emergency') })
        return
      }
      setStepIndex(1)
    }
    return (
      <AnimatePresence mode="wait"><Fade k="flags">
        {header}
        <p style={qText}>First — do any of these apply to you right now?</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {all.map((f) => {
            const sel = flags.includes(f.id)
            return (
              <button key={f.id} style={chip(sel)} onClick={() => setFlags((cur) => sel ? cur.filter((x) => x !== f.id) : [...cur, f.id])}>
                {f.text}
              </button>
            )
          })}
        </div>
        <button style={{ ...primaryBtn, marginTop: 16 }} onClick={submit}>
          {flags.length ? 'Continue with selected' : 'None of these — continue'}
        </button>
        <p style={{ fontSize: 11, lineHeight: 1.6, color: 'rgba(255,255,255,0.4)', margin: '10px 0 0' }}>
          If any apply, select them — the guide will point you to the right kind of care instead of continuing.
        </p>
      </Fade></AnimatePresence>
    )
  }

  // 2 ── CONTEXT (region context + shared pain-character, chip groups)
  if (step.type === 'ctx') {
    const groups = region.context.concat(PAIN_CHARACTER)
    return (
      <AnimatePresence mode="wait"><Fade k="ctx">
        {header}
        <p style={qText}>Quick context</p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: '0 0 8px' }}>Answer what you can — leave anything you're unsure about blank.</p>
        {groups.map((q) => (
          <div key={q.id} style={{ marginTop: 14 }}>
            <p style={{ ...label, letterSpacing: '0.12em', fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'none', margin: '0 0 8px' }}>{q.text}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {q.options.map((o) => {
                const a = answers[q.id]
                const sel = q.multi ? (Array.isArray(a) && a.includes(o.id)) : a === o.id
                return (
                  <button key={o.id} style={chip(sel)} onClick={() => q.multi ? setMulti(q.id, o.id) : setSingle(q.id, o.id)}>
                    {o.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        <button style={{ ...primaryBtn, marginTop: 20 }} onClick={() => nextStep()}>Continue</button>
      </Fade></AnimatePresence>
    )
  }

  // 3 ── REGION QUESTIONS (one per screen; single answers auto-advance)
  if (step.type === 'q') {
    const q = step.q
    const a = answers[q.id]
    return (
      <AnimatePresence mode="wait"><Fade k={q.id}>
        {header}
        <p style={qText}>{q.text}</p>
        {q.multi && <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.5)', margin: '0 0 10px' }}>Choose all that apply, then continue.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {q.options.map((o) => {
            const sel = q.multi ? (Array.isArray(a) && a.includes(o.id)) : a === o.id
            return (
              <button key={o.id} style={chip(sel)} onClick={() => q.multi ? setMulti(q.id, o.id) : setSingle(q.id, o.id, true)}>
                {o.label}
              </button>
            )
          })}
        </div>
        <div style={{ marginTop: 14 }}>
          {q.multi
            ? <button style={primaryBtn} onClick={() => nextStep()}>Continue</button>
            : <button style={ghostBtn} onClick={() => nextStep()}>Skip / not sure</button>}
        </div>
      </Fade></AnimatePresence>
    )
  }

  // 4 ── RESULTS
  const { ranked, specials } = computeResults(region, answers)
  const pt = classifyPainType(answers)
  const top = ranked[0]?.c

  return (
    <AnimatePresence mode="wait"><Fade k="results">
      <span style={label}>Educational Possibilities</span>
      <p style={{ fontSize: 12, lineHeight: 1.65, color: 'rgba(255,255,255,0.5)', margin: '8px 0 0' }}>
        Patterns that <em>can be associated with</em> answers like yours — not a diagnosis.
        {stoppedEarly && ' (Your answers pointed clearly in one direction, so we kept it short.)'}
      </p>

      {pt.nociplastic && (
        <div style={card}>
          <strong style={{ color: GOLD_LIGHT, fontSize: 13.5 }}>Persistent, widespread pain — worth understanding</strong>
          <p style={{ fontSize: 12.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.75)', margin: '6px 0 0' }}>
            Pain in several areas that has lasted a while often works differently from a fresh injury: the body's warning system can become more sensitive, so pain becomes less about tissue damage and more about a protective system that's turned up. A wound-up system can be wound back down — usually with gradual movement and the right guidance rather than rest. The patterns below may still play a part, but they're only part of the picture.
          </p>
        </div>
      )}
      {pt.neuropathic && (
        <div style={card}>
          <strong style={{ color: GOLD_LIGHT, fontSize: 13.5 }}>A nerve-related quality</strong>
          <p style={{ fontSize: 12.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.75)', margin: '6px 0 0' }}>
            Burning, shooting or electric sensations, or pins &amp; needles, suggest a nerve may be involved rather than just muscle or joint. This is common and often settles, but it's worth having assessed.
          </p>
        </div>
      )}

      {ranked.length === 0 ? (
        <div style={card}>
          <strong style={{ color: '#fff', fontSize: 14 }}>Your pattern doesn't clearly match a common presentation</strong>
          <p style={{ fontSize: 12.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.75)', margin: '6px 0 0' }}>
            That's not a bad sign — your answers simply don't line up neatly with one typical pattern. This is exactly where an individual assessment helps most: a physiotherapist can examine, test, and tell the possibilities apart properly.
          </p>
        </div>
      ) : ranked.map((x, i) => (
        <div key={x.c.id} style={{ ...card, ...(i === 0 ? { borderColor: GOLD, background: 'rgba(201,169,110,0.1)' } : {}) }}>
          <strong style={{ color: i === 0 ? GOLD_LIGHT : '#fff', fontSize: 14 }}>{i + 1}. {x.c.name}</strong>
          {x.c.clin && <div style={{ fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: GOLD, marginTop: 3 }}>{x.c.clin}</div>}
          <p style={{ fontSize: 12.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.75)', margin: '8px 0 0' }} dangerouslySetInnerHTML={{ __html: x.c.blurb }} />
          {x.c.noticed?.length > 0 && (
            <>
              <p style={{ ...label, letterSpacing: '0.14em', fontSize: 10, margin: '10px 0 4px' }}>Typically noticed as</p>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, lineHeight: 1.65, color: 'rgba(255,255,255,0.7)' }}>
                {x.c.noticed.map((n, j) => <li key={j} dangerouslySetInnerHTML={{ __html: n }} />)}
              </ul>
            </>
          )}
        </div>
      ))}

      {specials.map((s) => SPECIAL_CARDS[s] && (
        <div key={s} style={card}>
          <strong style={{ color: GOLD_LIGHT, fontSize: 13.5 }}>{SPECIAL_CARDS[s].title}</strong>
          <p style={{ fontSize: 12.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.75)', margin: '6px 0 0' }} dangerouslySetInnerHTML={{ __html: SPECIAL_CARDS[s].body }} />
        </div>
      ))}

      {top?.homeCare?.length > 0 && (
        <>
          <p style={{ ...label, margin: '16px 0 6px', display: 'block' }}>Safe things to try at home</p>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)' }}>
            {top.homeCare.map((h, i) => <li key={i} dangerouslySetInnerHTML={{ __html: h }} />)}
          </ul>
        </>
      )}
      {top?.seePhysioIf?.length > 0 && (
        <>
          <p style={{ ...label, margin: '14px 0 6px', display: 'block' }}>See a physiotherapist if</p>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)' }}>
            {top.seePhysioIf.map((h, i) => <li key={i} dangerouslySetInnerHTML={{ __html: h }} />)}
          </ul>
        </>
      )}

      <p style={{ fontSize: 10.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.38)', margin: '16px 0 0' }}>
        Educational information only — not a diagnosis and not a substitute for assessment by a qualified health professional. Your answers stay on your device.
      </p>
      <button style={{ ...ghostBtn, marginTop: 12 }} onClick={restart}>Start again</button>
    </Fade></AnimatePresence>
  )
}
