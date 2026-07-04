import { useRef, useState, useMemo, Suspense, useCallback } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment, Line, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// body.glb faces sideways (along X; shoulders/arms along Z) → view from X.
const MODEL_SCALE = 4
const MODEL_Y_OFFSET = 0.45
const FRONT_SIGN = 1   // set -1 if it opens showing the back

const CAM_POS = [7.4 * FRONT_SIGN, 0.45, 0]
const CAM_TARGET = [0, 0.45, 0]

// Area labels/types for the info panel.
const AREA = {
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

  // legs (by height)
  if (fy < -0.34) return 'ankle' + side
  if (fy < -0.12) return 'knee' + side

  // arms well out to the sides (further out than the shoulders)
  if (absZ > 0.20) return fy > 0.02 ? 'elbow' + side : 'wrist' + side

  // back of the torso
  if (back) return fy > 0.12 ? 'upperback' : 'lowerback'

  // upper front: shoulders sit out from centre, the neck is dead centre + high
  if (fy > 0.16) {
    if (absZ > 0.09) return 'shoulder' + side
    return fy > 0.26 ? 'neck' : null   // centre high = neck, centre mid = upper chest (none)
  }

  if (fy > 0.02) return null           // chest — no listed area
  return 'hip' + side                  // centre, low-mid
}

const GOLD = '#c9a96e'
const LINE_CORE = '#ffe6ad'

function BodyFigure() {
  const { scene } = useGLTF('/models/body.glb')
  const cloned = useMemo(() => scene.clone(true), [scene])
  return (
    <group name="bodyModel" scale={MODEL_SCALE} position={[0, MODEL_Y_OFFSET, 0]}>
      <primitive object={cloned} />
    </group>
  )
}
useGLTF.preload('/models/body.glb')

function CollisionHull() {
  return (
    <mesh position={[0, 0.45, 0]} name="collisionHull" visible={false}>
      <capsuleGeometry args={[0.62, 3.3, 8, 16]} />
      <meshBasicMaterial />
    </mesh>
  )
}

// A soft glow placed on the body where a detected area sits on the drawn line.
function AreaGlow({ position }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 3) * 0.18)
  })
  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial color={LINE_CORE} transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={LINE_CORE} emissive={LINE_CORE} emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  )
}

function DrawSurface({ drawMode, onPathUpdate, onPathComplete }) {
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

  const down = (e) => { if (!drawMode) return; const p = cast(e.clientX, e.clientY); if (!p) return; drawing.current = true; pathRef.current = [p]; onPathUpdate([p]) }
  const move = (e) => { if (!drawMode || !drawing.current) return; const p = cast(e.clientX, e.clientY); if (!p) return; pathRef.current = [...pathRef.current, p]; onPathUpdate(pathRef.current) }
  const up = () => { if (!drawMode || !drawing.current) return; drawing.current = false; onPathComplete(pathRef.current) }

  return (
    <mesh position={[0, 0.45, 0]} visible={false} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}>
      <capsuleGeometry args={[0.72, 3.5, 8, 16]} />
      <meshBasicMaterial />
    </mesh>
  )
}

function Scene({ drawMode, path, glows, onPathUpdate, onPathComplete }) {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} castShadow />
      <directionalLight position={[-3, 2, -3]} intensity={0.4} color={GOLD} />
      <Suspense fallback={null}><Environment preset="city" /></Suspense>

      <Suspense fallback={null}><BodyFigure /></Suspense>
      <CollisionHull />
      <DrawSurface drawMode={drawMode} onPathUpdate={onPathUpdate} onPathComplete={onPathComplete} />

      {/* Highlights sit ON the drawn line, so they're always on the body */}
      {glows.map((g, i) => <AreaGlow key={i} position={g} />)}

      {path.length > 1 && (
        <>
          <Line points={path} color={LINE_CORE} lineWidth={12} transparent opacity={0.22} />
          <Line points={path} color={LINE_CORE} lineWidth={4.5} transparent opacity={1} />
        </>
      )}

      <ContactShadows position={[0, -1.55, 0]} opacity={0.5} scale={4.5} blur={2.4} far={2} color="#000000" />

      <OrbitControls makeDefault enabled={!drawMode} enablePan={false} enableZoom={false} autoRotate={false}
        rotateSpeed={0.8} target={CAM_TARGET} minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} />
    </>
  )
}

export default function Body3D({ onSelectionChange }) {
  const [drawMode, setDrawMode] = useState(true)
  const [path, setPath] = useState([])
  const [glows, setGlows] = useState([])

  // Walk the drawn line, classify each point, collect unique areas in order.
  const detect = (pts) => {
    const seen = new Set()
    const out = []
    pts.forEach((p) => {
      const id = classify(p.x, p.y, p.z)
      if (id && !seen.has(id)) { seen.add(id); out.push({ id, pos: [p.x, p.y, p.z] }) }
    })
    return out
  }

  const onPathUpdate = (pts) => {
    setPath(pts)
    setGlows(detect(pts).map((d) => d.pos))
  }
  const onPathComplete = (pts) => {
    const found = detect(pts)
    setGlows(found.map((d) => d.pos))
    onSelectionChange?.(found.map((d) => ({ id: d.id, type: ZONE_TYPES[d.id], label: ZONE_LABELS[d.id] })))
  }
  const reset = () => { setPath([]); setGlows([]); onSelectionChange?.([]) }

  const btn = (active) => ({
    fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
    padding: '8px 14px', borderRadius: 999, border: `1px solid ${active ? GOLD : 'rgba(255,255,255,0.25)'}`,
    background: active ? 'rgba(201,169,110,0.15)' : 'rgba(0,0,0,0.45)', color: active ? GOLD : 'rgba(255,255,255,0.72)', cursor: 'pointer',
  })

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas shadows camera={{ position: CAM_POS, fov: 36 }} gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%', touchAction: 'none' }}>
        <Scene drawMode={drawMode} path={path} glows={glows} onPathUpdate={onPathUpdate} onPathComplete={onPathComplete} />
      </Canvas>

      <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8, zIndex: 2, flexWrap: 'wrap' }}>
        <button onClick={() => setDrawMode((d) => !d)} style={btn(drawMode)}>{drawMode ? 'Drawing Pain Line' : 'Rotate Body'}</button>
        <button onClick={reset} style={btn(false)}>Reset</button>
      </div>

      <div style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', fontSize: 10,
        letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', pointerEvents: 'none',
      }}>{drawMode ? 'Drag across the body to trace your pain' : 'Drag left / right to rotate'}</div>
    </div>
  )
}