import { useRef, useState, useMemo, Suspense, useCallback, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment, Line, useGLTF, Html } from '@react-three/drei'
import * as THREE from 'three'

// body.glb faces sideways (along X; shoulders/arms along Z) → view from X.
const MODEL_SCALE = 4
const MODEL_Y_OFFSET = 0.45
const FRONT_SIGN = 1   // set -1 if it opens showing the back

const CAM_POS = [7.4 * FRONT_SIGN, 0.45, 0]
const CAM_TARGET = [0, 0.45, 0]

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
  ankleL:    { type: 'ankle',     label: 'Left Ankle' },
  ankleR:    { type: 'ankle',     label: 'Right Ankle' },
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
  // Far out to the sides = the arm ends / hands
  if (absZ > 0.20) {
    if (fy > 0.24) return 'shoulder' + side
    if (fy > 0.10) return 'elbow' + side
    return 'wrist' + side
  }

  // Moderately out (absZ 0.10–0.20): shoulder (high), elbow (mid), HIP (low)
  if (absZ >= 0.10) {
    if (fy > 0.24) return 'shoulder' + side
    if (fy > 0.14) return 'elbow' + side
    return 'hip' + side
  }

  // Centre column (absZ < 0.10): head, neck, chest(none), hip
  if (fy > 0.38) return 'head'
  if (fy > 0.26) return 'neck'
  if (fy > 0.14) return null          // chest / upper stomach — no listed area
  return 'hip' + side                  // centre-low = hip
}

const GOLD = '#c9a96e'
const LINE_CORE = '#ffe6ad'

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
    const distForHeight = 2.62 / t   // a touch more headroom so the head never clips
    const distForWidth = 1.55 / (t * aspect)
    const dist = Math.max(distForHeight, distForWidth)
    camera.position.set(dist * FRONT_SIGN, CAM_TARGET[1], 0)
    camera.updateProjectionMatrix()
    controlsRef.current?.update?.()
  }, [size.width, size.height, camera, controlsRef, interactedRef])
  return null
}

function CollisionHull() {
  return (
    <mesh position={[0, 0.45, 0]} name="collisionHull" visible={false}>
      <capsuleGeometry args={[0.62, 3.3, 8, 16]} />
      <meshBasicMaterial />
    </mesh>
  )
}

// Active only in Highlight mode: trace over the body to highlight regions.
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
  const up = () => { if (!drawing.current) return; drawing.current = false; onPathComplete(pathRef.current) }

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

function Scene({ highlight, path, glows, controlsRef, interactedRef, autoRotate, onInteract, onPathUpdate, onPathComplete }) {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} castShadow />
      <directionalLight position={[-3, 2, -3]} intensity={0.4} color={GOLD} />
      <Suspense fallback={null}><Environment preset="city" /></Suspense>

      <FitCamera controlsRef={controlsRef} interactedRef={interactedRef} />
      <Suspense fallback={<Loader />}><BodyFigure /></Suspense>
      <CollisionHull />
      <DrawSurface active={highlight} onPathUpdate={onPathUpdate} onPathComplete={onPathComplete} />

      {/* Highlighted pain path on the body — static, no blink or pulse */}
      {path.length > 1 && (
        <>
          <Line points={path} color="#e8d5b0" lineWidth={13} transparent opacity={0.45} />
          <Line points={path} color="#6b5528" lineWidth={7} transparent opacity={1} />
        </>
      )}

      <ContactShadows position={[0, -1.55, 0]} opacity={0.5} scale={4.5} blur={2.4} far={2} color="#000000" />

      {/* OFF (highlight false): rotate + zoom + auto-rotate. ON: locked for highlighting. */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enabled={!highlight}
        enablePan={false}
        enableZoom={true}
        enableDamping
        dampingFactor={0.08}
        zoomSpeed={0.9}
        rotateSpeed={0.8}
        autoRotate={autoRotate && !highlight}
        autoRotateSpeed={0.6}
        minDistance={7}    // capped so the whole body (head, arms, feet) always stays visible
        maxDistance={13}
        target={CAM_TARGET}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        onStart={onInteract}
      />
    </>
  )
}

export default function Body3D({ onSelectionChange }) {
  const [highlight, setHighlight] = useState(false)   // OFF: rotate/zoom + auto-rotate
  const [path, setPath] = useState([])
  const [glows, setGlows] = useState([])
  const [interacted, setInteracted] = useState(false)
  const controlsRef = useRef()
  const interactedRef = useRef(false)

  // Any drag / rotate / zoom / highlight stops auto-rotation permanently.
  const onInteract = () => { if (!interactedRef.current) { interactedRef.current = true; setInteracted(true) } }

  const detect = (pts) => {
    if (!pts.length) return []
    // Classify each point, then only keep areas the line actually DWELLS on
    // (a brief pass-through — e.g. crossing the hip on the way to the arm —
    // won't register). Threshold scales with the line length.
    const ids = pts.map((p) => classify(p.x, p.y, p.z))
    const counts = {}
    ids.forEach((id) => { if (id) counts[id] = (counts[id] || 0) + 1 })
    const minPts = Math.max(3, Math.round(pts.length * 0.1))
    const out = []
    const seen = new Set()
    ids.forEach((id, i) => {
      if (id && counts[id] >= minPts && !seen.has(id)) {
        seen.add(id)
        out.push({ id, pos: [pts[i].x, pts[i].y, pts[i].z] })
      }
    })
    return out
  }
  const onPathUpdate = (pts) => { setPath(pts); setGlows(detect(pts).map((d) => d.pos)) }
  const onPathComplete = (pts) => {
    const found = detect(pts)
    setGlows(found.map((d) => d.pos))
    onSelectionChange?.(found.map((d) => ({ id: d.id, type: ZONE_TYPES[d.id], label: ZONE_LABELS[d.id] })))
  }
  const reset = () => { setPath([]); setGlows([]); onSelectionChange?.([]) }

  const toggleHighlight = () => {
    onInteract()
    setHighlight((h) => {
      if (h) { setPath([]); setGlows([]); onSelectionChange?.([]) } // leaving highlight clears
      return !h
    })
  }

  const btn = (active) => ({
    fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
    padding: '9px 16px', borderRadius: 999, border: `1px solid ${active ? GOLD : 'rgba(255,255,255,0.25)'}`,
    background: active ? 'rgba(201,169,110,0.18)' : 'rgba(0,0,0,0.45)', color: active ? GOLD : 'rgba(255,255,255,0.72)',
    cursor: 'pointer', transition: 'all 0.2s',
  })

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 8, padding: '12px 12px 20px', flexWrap: 'wrap', flexShrink: 0, position: 'relative', zIndex: 2 }}>
        <button onClick={toggleHighlight} style={btn(highlight)}>
          {highlight ? 'Highlight Pain Area · On' : 'Highlight Pain Area'}
        </button>
        {glows.length > 0 && <button onClick={reset} style={btn(false)}>Reset</button>}
      </div>

      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <Canvas
          shadows
          camera={{ position: CAM_POS, fov: 36 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%', touchAction: 'none' }}
        >
          <Scene
            highlight={highlight} path={path} glows={glows}
            controlsRef={controlsRef} interactedRef={interactedRef} autoRotate={!interacted}
            onInteract={onInteract} onPathUpdate={onPathUpdate} onPathComplete={onPathComplete}
          />
        </Canvas>

        <div style={{
          position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', fontSize: 10,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          {highlight ? 'Drag across the body to highlight the painful area' : 'Drag to rotate · Scroll or pinch to zoom'}
        </div>
      </div>
    </div>
  )
}