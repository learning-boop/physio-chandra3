import { useRef, useState, useMemo, Suspense, useCallback } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, ContactShadows, Environment, Line, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// ─── Real generated body model ───────────────────────────────────────────────
// body.glb faces SIDEWAYS (along X; shoulders along Z), so we view from X.
const MODEL_SCALE = 4
const MODEL_Y_OFFSET = 0.45
const FRONT_SIGN = 1   // if it opens showing the BACK, set to -1

const HALF_CHEST = 0.0881
const HALF_SHOULDER = 0.3023

// Straight-on framing. Rotation is locked to horizontal so the body stays
// upright + centered at every angle (no drifting down), and zoom is off so the
// framing can never break.
const CAM_POS = [7.4 * FRONT_SIGN, 0.45, 0]
const CAM_TARGET = [0, 0.45, 0]

const ZONE_DEFS = {
  head:      { lr: 0,     h:  0.45, scan: 0.14, back: false, label: 'Headache' },
  neck:      { lr: 0,     h:  0.35, scan: 0.12, back: false, label: 'Neck' },
  shoulderL: { lr: -0.5,  h:  0.29, scan: 0.72, back: false, label: 'Left Shoulder' },
  shoulderR: { lr:  0.5,  h:  0.29, scan: 0.72, back: false, label: 'Right Shoulder' },
  upperback: { lr: 0,     h:  0.22, scan: 0.12, back: true,  label: 'Upper Back' },
  lowerback: { lr: 0,     h:  0.08, scan: 0.12, back: true,  label: 'Lower Back' },
  hipL:      { lr: -0.3,  h:  0.00, scan: 0.48, back: false, label: 'Left Hip' },
  hipR:      { lr:  0.3,  h:  0.00, scan: 0.48, back: false, label: 'Right Hip' },
  kneeL:     { lr: -0.18, h: -0.24, scan: 0.40, back: false, label: 'Left Knee' },
  kneeR:     { lr:  0.18, h: -0.24, scan: 0.40, back: false, label: 'Right Knee' },
}

const targetZOf = (d) => d.lr * HALF_SHOULDER * MODEL_SCALE
const anchorOf = (d) => [
  (d.back ? -1 : 1) * FRONT_SIGN * HALF_CHEST * MODEL_SCALE * 0.6,
  d.h * MODEL_SCALE + MODEL_Y_OFFSET,
  targetZOf(d),
]
const ANCHORS = Object.fromEntries(Object.entries(ZONE_DEFS).map(([id, d]) => [id, anchorOf(d)]))

export const ZONE_LABELS = Object.fromEntries(
  Object.entries(ZONE_DEFS).map(([id, d]) => [id, d.label])
)

const GOLD = '#c9a96e'
const LINE_CORE = '#ffe6ad'
const SELECT_RADIUS = 0.5

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
      <capsuleGeometry args={[0.6, 3.2, 8, 16]} />
      <meshBasicMaterial />
    </mesh>
  )
}

// Project each marker onto the mesh surface (bounded sideways scan so torso
// points don't jump to the spread arms).
function MarkerSnapper({ onSnap }) {
  const { scene } = useThree()
  const ray = useMemo(() => new THREE.Raycaster(), [])
  const tries = useRef(0)
  const done = useRef(false)

  useFrame(() => {
    if (done.current) return
    if (tries.current++ > 180) { done.current = true; return }
    const body = scene.getObjectByName('bodyModel')
    if (!body) return
    let mesh = null
    body.traverse((o) => { if (!mesh && o.isMesh) mesh = o })
    if (!mesh) return

    const result = {}
    const reach = HALF_CHEST * MODEL_SCALE + 1.5
    const fullZ = HALF_SHOULDER * MODEL_SCALE
    const STEPS = 26
    for (const [id, d] of Object.entries(ZONE_DEFS)) {
      const anchor = ANCHORS[id]
      const facing = (d.back ? -1 : 1) * FRONT_SIGN
      const dir = new THREE.Vector3(-facing, 0, 0)
      const targetZ = targetZOf(d)
      const side = targetZ >= 0 ? 1 : -1
      const maxZ = fullZ * (d.scan ?? 0.5)
      let best = null
      let bestErr = Infinity
      for (let i = 0; i <= STEPS; i++) {
        const z = side * (i / STEPS) * maxZ
        ray.set(new THREE.Vector3(facing * reach, anchor[1], z), dir)
        const hits = ray.intersectObject(mesh, true)
        if (hits.length) {
          const err = Math.abs(z - targetZ)
          if (err < bestErr) { bestErr = err; best = hits[0].point.clone() }
        }
      }
      if (best) { best.addScaledVector(dir, -0.04); result[id] = [best.x, best.y, best.z] }
      else result[id] = anchor
    }
    onSnap(result)
    done.current = true
  })
  return null
}

function ZoneMarker({ id, position, isSelected }) {
  const halo = useRef()
  useFrame(({ clock }) => {
    if (!halo.current) return
    halo.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 2 + position[1] * 3) * 0.14)
  })
  const side = position[2] >= 0 ? 1 : -1
  return (
    <group position={position}>
      <mesh ref={halo}>
        <sphereGeometry args={[isSelected ? 0.12 : 0.085, 16, 16]} />
        <meshBasicMaterial color={GOLD} transparent opacity={isSelected ? 0.4 : 0.16} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[isSelected ? 0.055 : 0.04, 16, 16]} />
        <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={isSelected ? 2.8 : 1.2} toneMapped={false} />
      </mesh>
      {isSelected && (
        <Html distanceFactor={9} center style={{ pointerEvents: 'none' }}>
          <div style={{
            transform: `translate(${side > 0 ? '18px' : '-18px'}, -2px)`,
            fontFamily: "'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '0.08em',
            textTransform: 'uppercase', color: '#fff', whiteSpace: 'nowrap',
            padding: '3px 8px', borderRadius: 4, background: 'rgba(0,0,0,0.55)', border: `1px solid ${GOLD}`,
          }}>{ZONE_LABELS[id]}</div>
        </Html>
      )}
    </group>
  )
}

function PathDot({ position }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.05, 12, 12]} />
      <meshStandardMaterial color={LINE_CORE} emissive={LINE_CORE} emissiveIntensity={2.2} toneMapped={false} />
    </mesh>
  )
}

function DrawSurface({ drawMode, onPathUpdate, onPathComplete }) {
  const { camera, gl, scene } = useThree()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const pointer = useMemo(() => new THREE.Vector2(), [])
  const drawing = useRef(false)
  const pathRef = useRef([])

  const castToBody = useCallback((clientX, clientY) => {
    const rect = gl.domElement.getBoundingClientRect()
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(pointer, camera)
    const bodyModel = scene.getObjectByName('bodyModel')
    if (bodyModel) {
      const hits = raycaster.intersectObject(bodyModel, true)
      if (hits.length) return hits[0].point.clone()
    }
    const hull = scene.getObjectByName('collisionHull')
    if (!hull) return null
    const hullHits = raycaster.intersectObject(hull, false)
    return hullHits.length ? hullHits[0].point.clone() : null
  }, [camera, gl, pointer, raycaster, scene])

  const down = (e) => {
    if (!drawMode) return
    const p = castToBody(e.clientX, e.clientY)
    if (!p) return
    drawing.current = true
    pathRef.current = [p]
    onPathUpdate([p])
  }
  const move = (e) => {
    if (!drawMode || !drawing.current) return
    const p = castToBody(e.clientX, e.clientY)
    if (!p) return
    pathRef.current = [...pathRef.current, p]
    onPathUpdate(pathRef.current)
  }
  const up = () => {
    if (!drawMode || !drawing.current) return
    drawing.current = false
    onPathComplete(pathRef.current)
  }

  return (
    <mesh position={[0, 0.45, 0]} visible={false}
      onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}>
      <capsuleGeometry args={[0.7, 3.4, 8, 16]} />
      <meshBasicMaterial />
    </mesh>
  )
}

function Scene({ drawMode, path, selectedIds, zonePositions, onSnap, onPathUpdate, onPathComplete }) {
  return (
    <>
      <ambientLight intensity={0.65} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} castShadow />
      <directionalLight position={[-3, 2, -3]} intensity={0.4} color={GOLD} />
      <Suspense fallback={null}><Environment preset="city" /></Suspense>

      <Suspense fallback={null}><BodyFigure /></Suspense>
      <CollisionHull />
      <MarkerSnapper onSnap={onSnap} />
      <DrawSurface drawMode={drawMode} onPathUpdate={onPathUpdate} onPathComplete={onPathComplete} />

      {Object.entries(zonePositions).map(([id, pos]) => (
        <ZoneMarker key={id} id={id} position={pos} isSelected={selectedIds.includes(id)} />
      ))}

      {path.length > 1 && (
        <>
          <Line points={path} color={LINE_CORE} lineWidth={12} transparent opacity={0.22} />
          <Line points={path} color={LINE_CORE} lineWidth={4.5} transparent opacity={1} />
        </>
      )}
      {path.length > 0 && <PathDot position={path[0]} />}
      {path.length > 1 && <PathDot position={path[path.length - 1]} />}

      <ContactShadows position={[0, -1.55, 0]} opacity={0.5} scale={4.5} blur={2.4} far={2} color="#000000" />

      {/* Rotation locked to horizontal → body stays upright + centered at every
          angle. Zoom off → framing can't break. */}
      <OrbitControls
        makeDefault
        enabled={!drawMode}
        enablePan={false}
        enableZoom={false}
        rotateSpeed={0.8}
        target={CAM_TARGET}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  )
}

export default function Body3D({ onSelectionChange }) {
  const [drawMode, setDrawMode] = useState(true)
  const [path, setPath] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [zonePositions, setZonePositions] = useState(ANCHORS)

  const computeSelection = (pts) => {
    if (!pts.length) return []
    const found = []
    for (const [id, pos] of Object.entries(zonePositions)) {
      const zoneVec = new THREE.Vector3(...pos)
      let minDist = Infinity
      let minIdx = -1
      pts.forEach((p, i) => {
        const dd = p.distanceTo(zoneVec)
        if (dd < minDist) { minDist = dd; minIdx = i }
      })
      if (minDist <= SELECT_RADIUS) found.push({ id, idx: minIdx })
    }
    found.sort((a, b) => a.idx - b.idx)
    return found.map((f) => f.id)
  }

  const handlePathUpdate = (pts) => { setPath(pts); setSelectedIds(computeSelection(pts)) }
  const handlePathComplete = (pts) => {
    const ids = computeSelection(pts)
    setSelectedIds(ids)
    onSelectionChange?.(ids.map((id) => ({ id, label: ZONE_LABELS[id] })))
  }
  const reset = () => { setPath([]); setSelectedIds([]); onSelectionChange?.([]) }

  const btn = (active) => ({
    fontFamily: "'DM Sans', sans-serif", fontSize: '11px', letterSpacing: '0.08em',
    textTransform: 'uppercase', padding: '8px 14px', borderRadius: 999,
    border: `1px solid ${active ? GOLD : 'rgba(255,255,255,0.25)'}`,
    background: active ? 'rgba(201,169,110,0.15)' : 'rgba(0,0,0,0.45)',
    color: active ? GOLD : 'rgba(255,255,255,0.72)', cursor: 'pointer',
  })

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas shadows camera={{ position: CAM_POS, fov: 36 }} gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%', touchAction: 'none' }}>
        <Scene
          drawMode={drawMode} path={path} selectedIds={selectedIds} zonePositions={zonePositions}
          onSnap={setZonePositions} onPathUpdate={handlePathUpdate} onPathComplete={handlePathComplete}
        />
      </Canvas>

      <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8, zIndex: 2, flexWrap: 'wrap' }}>
        <button onClick={() => setDrawMode((d) => !d)} style={btn(drawMode)}>
          {drawMode ? 'Drawing Pain Line' : 'Rotate Body'}
        </button>
        <button onClick={reset} style={btn(false)}>Reset</button>
      </div>

      <div style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        fontFamily: "'DM Sans', sans-serif", fontSize: '10px', letterSpacing: '0.18em',
        textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap', pointerEvents: 'none',
      }}>
        {drawMode ? 'Drag across the body to trace your pain' : 'Drag left / right to rotate'}
      </div>
    </div>
  )
}