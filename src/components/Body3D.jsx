import { useRef, useState, useMemo, Suspense, useCallback, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment, Line, useGLTF, Html } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

// body.glb faces sideways (along X; shoulders/arms along Z) → view from X.
const MODEL_SCALE = 4
const MODEL_Y_OFFSET = 0.45
const FRONT_SIGN = 1   // set -1 if it opens showing the back

const CAM_POS = [7.4 * FRONT_SIGN, 0.45, 0]
// Target sits slightly ABOVE the body's centre → the body renders slightly
// LOWER in the frame, leaving clear headroom at the top for the buttons so
// they never cover the face.
// Target sits ABOVE the body's centre → the body renders LOWER in the frame,
// leaving a clear empty band at the TOP where the buttons float — they never
// cover the face or the feet.
const CAM_TARGET = [0, 0.48, 0]

// Area labels/types for the info panel.
const AREA = {
  head:      { type: 'head',      label: 'Head' },
  neck:      { type: 'neck',      label: 'Neck' },
  shoulderL: { type: 'shoulder',  label: 'Left Shoulder' },
  shoulderR: { type: 'shoulder',  label: 'Right Shoulder' },
  upperback: { type: 'upperback', label: 'Upper Back' },
  lowerback: { type: 'lowerback', label: 'Lower Back' },
  elbowL:    { type: 'elbow',     label: 'Left Elbow' },
  elbowR:    { type: 'elbow',     label: 'Right Elbow' },
  wristL:    { type: 'wrist',     label: 'Left Wrist' },
  wristR:    { type: 'wrist',     label: 'Right Wrist' },
  hipL:      { type: 'hip',       label: 'Left Hip' },
  hipR:      { type: 'hip',       label: 'Right Hip' },
  kneeL:     { type: 'knee',      label: 'Left Knee' },
  kneeR:     { type: 'knee',      label: 'Right Knee' },
  ankleL:    { type: 'ankle',     label: 'Left Ankle / Foot' },
  ankleR:    { type: 'ankle',     label: 'Right Ankle / Foot' },
}
export const ZONE_LABELS = Object.fromEntries(Object.entries(AREA).map(([id, d]) => [id, d.label]))
export const ZONE_TYPES = Object.fromEntries(Object.entries(AREA).map(([id, d]) => [id, d.type]))

// Classify a point on the body (world coords) into an area, using its height
// AND how far it sits from the centre line. Tunable dials:
//   0.09 = neck (centre) vs shoulder (out) split
//   0.20 = torso vs arm (elbow/wrist) split
//   fy 0.26 = how high counts as neck
function classify(wx, wy, wz) {
  const fy = (wy - MODEL_Y_OFFSET) / MODEL_SCALE   // -0.5 feet .. +0.5 head
  const lz = wz / MODEL_SCALE                        // left(-)/right(+)
  const lx = wx / MODEL_SCALE                        // front(+)/back(-)
  const side = lz < 0 ? 'L' : 'R'
  const absZ = Math.abs(lz)                          // distance from centre line
  const back = lx < -0.04

  // legs (by height, either side)
  if (fy < -0.34) return 'ankle' + side
  if (fy < -0.12) return 'knee' + side

  // back of the torso
  if (back) return fy > 0.12 ? 'upperback' : 'lowerback'

  // ── FRONT of the body ──
  // OUT to the side = the arm: shoulder (high) → elbow (mid) → wrist (low).
  // The arm sits further from the centre than the hip, so distance decides.
  if (absZ > 0.14) {
    if (fy > 0.24) return 'shoulder' + side
    if (fy > 0.04) return 'elbow' + side
    return 'wrist' + side
  }

  // NEAR the centre (absZ <= 0.14): head, neck, shoulders(inner), chest, hip
  if (fy > 0.38) return 'head'
  if (fy > 0.26) return absZ > 0.09 ? 'shoulder' + side : 'neck'
  if (fy > 0.14) return null          // chest / upper stomach — no listed area
  return 'hip' + side                  // lower torso = hip
}

const GOLD = '#c9a96e'

// Lazy-loaded, Draco-compressed model.
function BodyFigure() {
  const { scene } = useGLTF('/models/body.glb', true)
  const cloned = useMemo(() => scene.clone(true), [scene])
  return (
    <group name="bodyModel" scale={MODEL_SCALE} position={[0, MODEL_Y_OFFSET, 0]}>
      <primitive object={cloned} />
    </group>
  )
}
useGLTF.preload('/models/body.glb', true)

function Loader() {
  return (
    <Html center>
      <div style={{ color: GOLD, fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase' }}>Loading…</div>
    </Html>
  )
}

// Keeps the model centred and correctly sized on every screen shape (until the
// user manually zooms). Re-fits on resize / orientation change.
function FitCamera({ controlsRef, interactedRef }) {
  const { camera, size } = useThree()
  useEffect(() => {
    if (interactedRef.current) return   // don't fight the user's zoom
    const aspect = size.width / Math.max(1, size.height)
    const t = Math.tan((36 * Math.PI) / 180 / 2)
    // Smaller numbers = closer camera = BIGGER body on screen.
    const distForHeight = 2.08 / t   // bigger body — button now sits at the left, out of the way
    const distForWidth = 1.15 / (t * aspect)
    const dist = Math.max(distForHeight, distForWidth)
    // Shift the framing UP a little so the body sits lower on screen —
    // keeps the head clear of the header / buttons.
    const yShift = 0.22
    camera.position.set(dist * FRONT_SIGN, CAM_TARGET[1] + yShift, 0)
    camera.updateProjectionMatrix()
    if (controlsRef.current) {
      controlsRef.current.target.set(CAM_TARGET[0], CAM_TARGET[1] + yShift, CAM_TARGET[2])
      controlsRef.current.update()
    }
  }, [size.width, size.height, camera, controlsRef, interactedRef])
  return null
}

// Invisible capsule roughly matching the body — used for cheap "did the user
// touch the body?" tests and as a drawing fallback surface.
function CollisionHull() {
  return (
    <mesh position={[0, 0.45, 0]} name="collisionHull" visible={false}>
      <capsuleGeometry args={[0.62, 3.3, 8, 16]} />
      <meshBasicMaterial />
    </mesh>
  )
}

// THE INTERACTION RULES (user-friendly behaviour):
//   • Touch/drag ON the body        → rotate the model.
//   • Scroll / drag the BLACK SPACE → the body image moves UP and DOWN.
//     When it reaches the limit, the page itself continues scrolling.
//   • Mouse wheel over the body     → zoom the model.
//   • Highlight mode captures everything so lines can be drawn freely.
const PAN_MIN_Y = -1.0   // how far DOWN the body can be pushed
const PAN_MAX_Y = 2.2    // how far UP the body can be pushed

function InteractionGuard({ controlsRef, highlightRef, interactedRef }) {
  const { gl, camera, scene } = useThree()
  const ray = useMemo(() => new THREE.Raycaster(), [])
  const v2 = useMemo(() => new THREE.Vector2(), [])
  const panState = useRef(null)

  const onBody = useCallback((cx, cy) => {
    const rect = gl.domElement.getBoundingClientRect()
    v2.x = ((cx - rect.left) / rect.width) * 2 - 1
    v2.y = -((cy - rect.top) / rect.height) * 2 + 1
    ray.setFromCamera(v2, camera)
    const hull = scene.getObjectByName('collisionHull')
    return hull ? ray.intersectObject(hull, false).length > 0 : false
  }, [gl, camera, scene, ray, v2])

  // Moves the body image vertically by `dyPx` screen pixels (like dragging a
  // photo). Any movement beyond the clamp limits is handed to the PAGE scroll,
  // so the user is never stuck.
  const applyPan = useCallback((dyPx) => {
    const c = controlsRef.current
    if (!c) return
    interactedRef.current = true
    const rect = gl.domElement.getBoundingClientRect()
    const dist = camera.position.distanceTo(c.target)
    const worldPerPx = (2 * dist * Math.tan((36 * Math.PI) / 180 / 2)) / Math.max(1, rect.height)
    const desired = c.target.y + dyPx * worldPerPx
    const clamped = Math.min(PAN_MAX_Y, Math.max(PAN_MIN_Y, desired))
    const shift = clamped - c.target.y
    c.target.y = clamped
    camera.position.y += shift
    c.update()
    const leftoverPx = (desired - clamped) / worldPerPx
    if (Math.abs(leftoverPx) > 0.5) window.scrollBy({ top: -leftoverPx, behavior: 'auto' })
  }, [camera, controlsRef, gl, interactedRef])

  useEffect(() => {
    const el = gl.domElement

    // Touch: we own every gesture on the canvas. On the body → rotate
    // (OrbitControls). On black space → we pan the image ourselves.
    const onTouchStart = (e) => { e.preventDefault() }

    // Pointer (mouse + touch): starting on black space begins an image pan.
    const onPointerDown = (e) => {
      if (highlightRef.current) { panState.current = null; return }
      const hit = onBody(e.clientX, e.clientY)
      if (controlsRef.current) controlsRef.current.enableRotate = hit
      if (hit) { panState.current = null; return }
      panState.current = { y: e.clientY, id: e.pointerId }
      el.setPointerCapture?.(e.pointerId)
    }
    const onPointerMove = (e) => {
      const s = panState.current
      if (!s || e.pointerId !== s.id) return
      const dy = e.clientY - s.y
      s.y = e.clientY
      if (dy !== 0) applyPan(dy)
    }
    const onPointerEnd = (e) => {
      if (panState.current?.id === e.pointerId) panState.current = null
    }

    // Wheel over black space: move the body image up/down like scrolling a
    // photo. Wheel over the body: normal zoom.
    const onWheel = (e) => {
      const hit = onBody(e.clientX, e.clientY)
      if (controlsRef.current) controlsRef.current.enableZoom = hit
      if (!hit) {
        e.preventDefault()
        e.stopPropagation()
        applyPan(-e.deltaY)
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: false })
    el.addEventListener('pointerdown', onPointerDown, true)
    el.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerEnd)
    window.addEventListener('pointercancel', onPointerEnd)
    const parent = el.parentElement
    parent?.addEventListener('wheel', onWheel, { capture: true, passive: false })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('pointerdown', onPointerDown, true)
      el.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerEnd)
      window.removeEventListener('pointercancel', onPointerEnd)
      parent?.removeEventListener('wheel', onWheel, { capture: true })
    }
  }, [gl, onBody, applyPan, controlsRef, highlightRef])

  return null
}

// Active only in Highlight mode: trace over the body to draw pain lines.
// Supports MULTIPLE lines — each completed drag becomes its own line.
function DrawSurface({ active, onPathUpdate, onPathComplete }) {
  const { camera, gl, scene } = useThree()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const pointer = useMemo(() => new THREE.Vector2(), [])
  const drawing = useRef(false)
  const pathRef = useRef([])

  const cast = useCallback((cx, cy) => {
    const rect = gl.domElement.getBoundingClientRect()
    pointer.x = ((cx - rect.left) / rect.width) * 2 - 1
    pointer.y = -((cy - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(pointer, camera)
    const body = scene.getObjectByName('bodyModel')
    if (body) { const h = raycaster.intersectObject(body, true); if (h.length) return h[0].point.clone() }
    const hull = scene.getObjectByName('collisionHull')
    if (!hull) return null
    const hh = raycaster.intersectObject(hull, false)
    return hh.length ? hh[0].point.clone() : null
  }, [camera, gl, pointer, raycaster, scene])

  const down = (e) => {
    if (!active) return
    const p = cast(e.clientX, e.clientY)
    if (!p) return
    gl.domElement.setPointerCapture?.(e.pointerId)
    drawing.current = true
    pathRef.current = [p]
    onPathUpdate([p])
  }
  const move = (e) => {
    if (!active || !drawing.current) return
    const p = cast(e.clientX, e.clientY)
    if (!p) return
    pathRef.current = [...pathRef.current, p]
    onPathUpdate(pathRef.current)
  }
  const up = () => {
    if (!drawing.current) return
    drawing.current = false
    onPathComplete(pathRef.current)
    pathRef.current = []
  }

  useEffect(() => {
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => { window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up) }
  })

  return (
    <mesh position={[0, 0.45, 0]} visible={false} onPointerDown={down} onPointerMove={move}>
      <capsuleGeometry args={[0.72, 3.5, 8, 16]} />
      <meshBasicMaterial />
    </mesh>
  )
}

// ── Small automated indication overlays ─────────────────────────────────────
// They occupy almost no space, play on their own in a loop, and vanish the
// moment the user touches the image. pointerEvents:none so they never block
// touches. Made for users who don't read instructions.

// Shown while the model is idle: a finger sweeping left↔right = "turn me".
function RotateHint() {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'absolute', left: '50%', top: '56%', transform: 'translateX(-50%)',
        zIndex: 3, pointerEvents: 'none',
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '7px 16px', borderRadius: 999,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        border: '1px solid rgba(201,169,110,0.35)',
      }}
    >
      <span style={{ color: GOLD, fontSize: 14, opacity: 0.7 }}>‹</span>
      <motion.span
        animate={{ x: [-16, 16, -16] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ fontSize: 20, lineHeight: 1 }}
      >👆</motion.span>
      <span style={{ color: GOLD, fontSize: 14, opacity: 0.7 }}>›</span>
    </motion.div>
  )
}

// Shown when highlight mode is ON but nothing is drawn yet: a pencil traces a
// gold dashed line across the torso = "draw here".
function DrawHint() {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'absolute', left: '50%', top: '34%', transform: 'translateX(-50%)',
        width: 130, height: 120, zIndex: 3, pointerEvents: 'none',
      }}
    >
      <svg width="130" height="120" viewBox="0 0 130 120" fill="none" style={{ position: 'absolute', inset: 0 }}>
        <motion.path
          d="M18 20 C 55 42, 40 70, 88 74 C 104 76, 112 88, 112 100"
          stroke={GOLD} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="7 8"
          animate={{ pathLength: [0, 1, 1], opacity: [0.9, 0.9, 0] }}
          transition={{ duration: 2.6, times: [0, 0.72, 1], repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
      <motion.span
        animate={{
          x: [8, 44, 30, 78, 100, 100],
          y: [4, 22, 48, 56, 78, 78],
          opacity: [1, 1, 1, 1, 1, 0],
        }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', fontSize: 22, lineHeight: 1 }}
      >✏️</motion.span>
    </motion.div>
  )
}

function PainLine({ points }) {
  return (
    <>
      <Line points={points} color="#e8d5b0" lineWidth={13} transparent opacity={0.45} />
      <Line points={points} color="#6b5528" lineWidth={7} transparent opacity={1} />
    </>
  )
}

function Scene({ highlight, highlightRef, paths, livePath, controlsRef, interactedRef, onInteract, onPathUpdate, onPathComplete }) {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} castShadow />
      <directionalLight position={[-3, 2, -3]} intensity={0.4} color={GOLD} />
      <Suspense fallback={null}><Environment preset="city" /></Suspense>

      <FitCamera controlsRef={controlsRef} interactedRef={interactedRef} />
      <InteractionGuard controlsRef={controlsRef} highlightRef={highlightRef} interactedRef={interactedRef} />
      <Suspense fallback={<Loader />}><BodyFigure /></Suspense>
      <CollisionHull />
      <DrawSurface active={highlight} onPathUpdate={onPathUpdate} onPathComplete={onPathComplete} />

      {/* ALL completed pain lines stay on the body */}
      {paths.map((pts, i) => pts.length > 1 && <PainLine key={i} points={pts} />)}
      {/* the line currently being drawn */}
      {livePath.length > 1 && <PainLine points={livePath} />}

      <ContactShadows position={[0, -1.55, 0]} opacity={0.5} scale={4.5} blur={2.4} far={2} color="#000000" />

      {/* NO auto-rotate — the model stays still until the user touches the BODY. */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enabled={!highlight}
        enablePan={false}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
        enableZoom={true}
        zoomToCursor={true}
        enableDamping
        dampingFactor={0.08}
        zoomSpeed={0.9}
        rotateSpeed={0.8}
        autoRotate={false}
        minDistance={2.2}
        maxDistance={16}
        target={CAM_TARGET}
        minPolarAngle={Math.PI * 0.08}
        maxPolarAngle={Math.PI * 0.92}
        onStart={onInteract}
      />
    </>
  )
}

export default function Body3D({ onSelectionChange }) {
  const [highlight, setHighlight] = useState(false)   // OFF: rotate on body only
  const [paths, setPaths] = useState([])              // completed pain lines (multiple)
  const [livePath, setLivePath] = useState([])        // line being drawn now
  const controlsRef = useRef()
  const interactedRef = useRef(false)
  const highlightRef = useRef(false)
  // Drives the small automated hint overlays: they loop until the user
  // touches the image for the first time, then disappear for good.
  const [touched, setTouched] = useState(false)

  const onInteract = () => { interactedRef.current = true; setTouched(true) }

  // Keep a ref in sync so canvas-level listeners always see the current mode,
  // and control page scrolling: highlight mode captures all touches, normal
  // mode lets vertical swipes scroll the page ('pan-y').
  useEffect(() => {
    highlightRef.current = highlight
    const canvas = document.querySelector('.body3d-canvas canvas')
    if (canvas) canvas.style.touchAction = 'none'   // we handle all gestures ourselves
  }, [highlight])

  // Which areas does one line dwell on? (brief pass-throughs are ignored)
  const detect = (pts) => {
    if (!pts.length) return []
    const ids = pts.map((p) => classify(p.x, p.y, p.z))
    const counts = {}
    ids.forEach((id) => { if (id) counts[id] = (counts[id] || 0) + 1 })
    const minPts = Math.max(3, Math.round(pts.length * 0.1))
    return [...new Set(ids.filter((id) => id && counts[id] >= minPts))]
  }

  // Merge the zones from EVERY line into one selection list.
  const emitZones = (allPaths) => {
    const seen = new Set()
    const zones = []
    allPaths.forEach((pts) => {
      detect(pts).forEach((id) => {
        if (!seen.has(id)) { seen.add(id); zones.push({ id, type: ZONE_TYPES[id], label: ZONE_LABELS[id] }) }
      })
    })
    onSelectionChange?.(zones)
    return zones
  }

  const onPathUpdate = (pts) => setLivePath([...pts])
  const onPathComplete = (pts) => {
    setLivePath([])
    if (pts.length < 2) return
    setPaths((prev) => {
      const next = [...prev, pts]
      emitZones(next)
      return next
    })
  }

  const reset = () => { setPaths([]); setLivePath([]); onSelectionChange?.([]) }

  // Turning highlight OFF now KEEPS the drawn lines (so users can rotate and
  // keep adding lines from another angle). Only Reset clears.
  const toggleHighlight = () => { onInteract(); setHighlight((h) => !h) }

  const btnBase = {
    fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
    padding: '10px 18px', borderRadius: 999, cursor: 'pointer', transition: 'all 0.2s',
  }
  const btnGhost = {
    ...btnBase, border: '1px solid rgba(255,255,255,0.25)',
    background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.72)',
  }
  // The main button is IMPOSSIBLE to miss: solid gold + soft pulsing glow
  // while off, so users immediately know where to start.
  const btnMain = highlight
    ? { ...btnBase, border: `1px solid ${GOLD}`, background: 'rgba(201,169,110,0.18)', color: GOLD, fontWeight: 600 }
    : { ...btnBase, border: `1px solid ${GOLD}`, background: GOLD, color: '#0a0a0a', fontWeight: 700, animation: 'painBtnPulse 2s ease-in-out infinite' }

  return (
    <div className="body3d-canvas" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <style>{`
        @keyframes painBtnPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,169,110,0.55); }
          50%      { box-shadow: 0 0 0 10px rgba(201,169,110,0); }
        }
      `}</style>

      <div style={{
        position: 'absolute', top: 14, left: 14,
        display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
        zIndex: 2, maxWidth: '94%',
      }}>
        <button onClick={toggleHighlight} style={btnMain}>
          {highlight ? '✓ Done Drawing' : '✏ Highlight Pain Areas'}
        </button>
        {paths.length > 0 && <button onClick={reset} style={btnGhost}>Reset</button>}
        {paths.length > 0 && (
          <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: GOLD }}>
            {paths.length} line{paths.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div
        style={{ flex: 1, position: 'relative', minHeight: 0 }}
        onPointerDown={() => setTouched(true)}
      >
        <Canvas
          shadows
          camera={{ position: CAM_POS, fov: 36 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%', touchAction: 'none' }}
        >
          <Scene
            highlight={highlight} highlightRef={highlightRef}
            paths={paths} livePath={livePath}
            controlsRef={controlsRef} interactedRef={interactedRef}
            onInteract={onInteract} onPathUpdate={onPathUpdate} onPathComplete={onPathComplete}
          />
        </Canvas>

        {/* Small automated indications — loop until the user touches the image */}
        <AnimatePresence>
          {!highlight && !touched && paths.length === 0 && <RotateHint key="rot" />}
          {highlight && paths.length === 0 && livePath.length === 0 && <DrawHint key="draw" />}
        </AnimatePresence>

        <div style={{
          position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', fontSize: 10,
          letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
          whiteSpace: 'nowrap', pointerEvents: 'none', textAlign: 'center', maxWidth: '94%', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {highlight
            ? '✏️ Draw on the body where it hurts'
            : '👆 Touch the body to turn it'}
        </div>
      </div>
    </div>
  )
}