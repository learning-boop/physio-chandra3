import { Component, useRef, useState, useMemo, Suspense, useCallback, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment, Lightformer, Line, useGLTF, Html } from '@react-three/drei'
import * as THREE from 'three'
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh'

// Raycasting drives every drawn point, and this mesh has ~218k triangles.
// Three's default raycast tests every triangle (O(n)), which stutters badly on
// a phone. three-mesh-bvh builds a bounding-volume hierarchy once and turns
// each ray into an O(log n) lookup, which is what makes drawing feel smooth.
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree
THREE.Mesh.prototype.raycast = acceleratedRaycast

// body.glb faces sideways (along X; shoulders/arms along Z) → view from X.
const MODEL_SCALE = 4
const MODEL_Y_OFFSET = 0.45
// Verified against the mesh itself: at face height the midline protrudes
// +0.052 toward +X (the nose) versus +0.036 toward -X (the occiput), and the
// eye/brow/nostril texels all sit at +X. The face points +X, so the camera
// sits on +X. classify() derives front/back AND left/right from this sign, so
// flipping it keeps every zone label anatomically correct.
const FRONT_SIGN = 1   // set -1 if it opens showing the back

const CAM_POS = [7.4 * FRONT_SIGN, 0.45, 0]
// Target sits slightly ABOVE the body's centre → the body renders slightly
// LOWER in the frame, leaving clear headroom at the top for the buttons so
// they never cover the face.
// Target sits ABOVE the body's centre → the body renders LOWER in the frame,
// leaving a clear empty band at the TOP where the buttons float — they never
// cover the face or the feet.
const CAM_TARGET = [0, 0.48, 0]
// Tilt limits. Wide enough to look up at the soles of the feet and down at the
// top of the head, but stopping short of the poles so the view never flips.
const POLAR_MIN = Math.PI * 0.04
const POLAR_MAX = Math.PI * 0.96

// Real world-space extents of the posed model: it is MODEL_SCALE tall and
// centred on MODEL_Y_OFFSET, so the feet sit at -1.55 and the head at 2.45.
// (ContactShadows is pinned to BODY_BOTTOM, which is the same plane.)
const BODY_BOTTOM = MODEL_Y_OFFSET - MODEL_SCALE / 2
const BODY_CENTRE = MODEL_Y_OFFSET
const BODY_HALF_H = MODEL_SCALE / 2
// Half-width budget covering the widest part of the figure (the hands, which
// hang at hip height). Measured from the model: max |z| 0.2602 x MODEL_SCALE.
const BODY_HALF_W = 1.05
// Air around the silhouette so nothing touches the frame edge. At 1.02 the
// feet sat exactly on the bottom edge and were clipped on the landing view;
// 1.16 pulls the camera back far enough that the soles are always visible.
const FIT_MARGIN = 1.16

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

// Distance from the centre line that separates the torso from the arm.
// Measured off this model, whose arms hang at its sides: at waist height the
// torso ends at |z| 0.10 and the forearm starts at 0.12; at hip height the
// torso ends at 0.12 and the hand starts at 0.17. 0.12 clears both gaps.
const ARM_SPLIT = 0.12
// Distance that separates the neck (centre) from the shoulders (out).
const NECK_SPLIT = 0.09

// Classify a point on the body (world coords) into an area, using its height
// AND how far it sits from the centre line. Both the front/back test and the
// left/right test are taken relative to FRONT_SIGN, because turning the figure
// to face the other way swaps its anatomical left and right as well.
function classify(wx, wy, wz) {
  const fy = (wy - MODEL_Y_OFFSET) / MODEL_SCALE       // -0.5 feet .. +0.5 head
  const lz = (wz / MODEL_SCALE) * FRONT_SIGN           // left(-)/right(+)
  const lx = (wx / MODEL_SCALE) * FRONT_SIGN           // front(+)/back(-)
  const side = lz < 0 ? 'L' : 'R'
  const absZ = Math.abs(lz)                            // distance from centre line
  const back = lx < -0.04

  // Legs first, by height alone. Safe because this model's arm points all sit
  // above fy -0.10, while the feet spread to |z| 0.1385 — wider than ARM_SPLIT
  // — so testing the arm first would read the edge of a foot as a wrist.
  if (fy < -0.34) return 'ankle' + side
  if (fy < -0.12) return 'knee' + side

  // back of the torso
  if (back) return fy > 0.12 ? 'upperback' : 'lowerback'

  // ── FRONT of the body ──
  // OUT to the side = the arm: shoulder (high) → elbow (mid) → wrist (low).
  // The arm sits further from the centre than the hip, so distance decides.
  if (absZ > ARM_SPLIT) {
    if (fy > 0.24) return 'shoulder' + side
    if (fy > 0.04) return 'elbow' + side
    return 'wrist' + side
  }

  // NEAR the centre: head, neck, shoulders(inner), chest, hip
  if (fy > 0.38) return 'head'
  if (fy > 0.26) return absZ > NECK_SPLIT ? 'shoulder' + side : 'neck'
  if (fy > 0.14) return null          // chest / upper stomach — no listed area
  return 'hip' + side                  // lower torso = hip
}

const GOLD = '#c9a96e'

// Lazy-loaded, Draco-compressed model.
function BodyFigure() {
  // useDraco=false: this model uses EXT_meshopt_compression, whose decoder drei
  // bundles locally. Draco's decoder is fetched from a CDN, which is a network
  // dependency the site does not need.
  const { scene } = useGLTF('/models/body.glb', false)
  const cloned = useMemo(() => {
    const c = scene.clone(true)
    // One-off BVH build (~50ms) that every later raycast rides on.
    c.traverse((o) => {
      if (o.isMesh && o.geometry && !o.geometry.boundsTree) o.geometry.computeBoundsTree()
    })
    return c
  }, [scene])
  return (
    <group name="bodyModel" scale={MODEL_SCALE} position={[0, MODEL_Y_OFFSET, 0]}>
      <primitive object={cloned} />
    </group>
  )
}
useGLTF.preload('/models/body.glb', false)

function Loader() {
  return (
    <Html center>
      <div style={{ color: GOLD, fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: '0.24em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Loading…</div>
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
    // Pull back far enough that head AND feet both fit, whatever the shape of
    // the container. Smaller numbers = closer camera = bigger body on screen.
    const distForHeight = (BODY_HALF_H * FIT_MARGIN) / t
    const distForWidth = (BODY_HALF_W * FIT_MARGIN) / (t * aspect)
    const dist = Math.max(distForHeight, distForWidth)
    // Aim at the body's true centre so the margin is shared evenly between the
    // head and the feet — any upward shift here crops the legs.
    camera.position.set(dist * FRONT_SIGN, BODY_CENTRE, 0)
    camera.updateProjectionMatrix()
    if (controlsRef.current) {
      controlsRef.current.target.set(CAM_TARGET[0], BODY_CENTRE, CAM_TARGET[2])
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

// THE INTERACTION RULES (no buttons — everything on the mouse/finger):
//   • DRAG ON THE BODY → sideways TURNS it, cleanly, about its vertical
//     axis; up/down TILTS it (clamped short of the poles, so the view can
//     never flip) — tilting up is how you see and draw on the soles of the
//     feet, tilting down the top of the head.
//   • DRAG ON EMPTY SPACE → MOVES the picture straight. Mouse: both
//     directions, following the cursor. Finger: sideways slides it; up/down
//     scrolls the page as usual, so a phone user is never trapped.
//   • Two fingers (anywhere) → move the picture; pinch zooms.
//   • Mouse wheel over the body → zoom. Over empty space → moves the picture
//     up/down (sideways with Shift or a trackpad).
//   • Highlight mode: one finger draws on the body; empty-space drags and
//     two-finger gestures still move the view.
const PAN_MIN_Y = -1.0   // how far DOWN the body can be pushed
const PAN_MAX_Y = 2.2    // how far UP the body can be pushed
const PAN_MAX_XZ = 1.6   // how far SIDEWAYS the body can be pushed
const UP_AXIS = new THREE.Vector3(0, 1, 0)
const clampNum = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

// Keeps two-finger / right-drag pans within reach, so the body can never be
// pushed fully out of frame. Wired to OrbitControls' onChange.
function clampPanTarget(e) {
  const c = e?.target
  if (!c || !c.target || !c.object) return
  const t = c.target
  const nx = clampNum(t.x, -PAN_MAX_XZ, PAN_MAX_XZ)
  const ny = clampNum(t.y, PAN_MIN_Y, PAN_MAX_Y)
  const nz = clampNum(t.z, -PAN_MAX_XZ, PAN_MAX_XZ)
  const dx = nx - t.x, dy = ny - t.y, dz = nz - t.z
  if (dx || dy || dz) {
    t.set(nx, ny, nz)
    c.object.position.x += dx
    c.object.position.y += dy
    c.object.position.z += dz
  }
}

function InteractionGuard({ controlsRef, highlightRef, interactedRef }) {
  const { gl, camera, scene } = useThree()
  const ray = useMemo(() => { const r = new THREE.Raycaster(); r.firstHitOnly = true; return r }, [])
  const v2 = useMemo(() => new THREE.Vector2(), [])
  const panState = useRef(null)

  const onBody = useCallback((cx, cy) => {
    const rect = gl.domElement.getBoundingClientRect()
    v2.x = ((cx - rect.left) / rect.width) * 2 - 1
    v2.y = -((cy - rect.top) / rect.height) * 2 + 1
    ray.setFromCamera(v2, camera)
    const hull = scene.getObjectByName('collisionHull')
    if (hull && ray.intersectObject(hull, false).length > 0) return true
    // arms & hands sit OUTSIDE the torso capsule — test the real mesh too
    const body = scene.getObjectByName('bodyModel')
    return body ? ray.intersectObject(body, true).length > 0 : false
  }, [gl, camera, scene, ray, v2])

  // Moves the body image by screen pixels, like dragging a photo. dyPx moves
  // it up/down (clamped; the overflow is handed to the PAGE scroll so the user
  // is never stuck); dxPx moves it sideways along the camera's right axis.
  const applyPan = useCallback((dxPx, dyPx) => {
    const c = controlsRef.current
    if (!c) return
    interactedRef.current = true
    const rect = gl.domElement.getBoundingClientRect()
    const dist = camera.position.distanceTo(c.target)
    const worldPerPx = (2 * dist * Math.tan((36 * Math.PI) / 180 / 2)) / Math.max(1, rect.height)

    const desiredY = c.target.y + dyPx * worldPerPx
    const clampedY = clampNum(desiredY, PAN_MIN_Y, PAN_MAX_Y)
    const shiftY = clampedY - c.target.y

    let shiftX = 0, shiftZ = 0
    if (dxPx) {
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrix, 0)
      right.y = 0
      if (right.lengthSq() > 0) right.normalize()
      const dWorld = dxPx * worldPerPx
      shiftX = clampNum(c.target.x + right.x * dWorld, -PAN_MAX_XZ, PAN_MAX_XZ) - c.target.x
      shiftZ = clampNum(c.target.z + right.z * dWorld, -PAN_MAX_XZ, PAN_MAX_XZ) - c.target.z
    }

    c.target.x += shiftX; c.target.y = clampedY; c.target.z += shiftZ
    camera.position.x += shiftX; camera.position.y += shiftY; camera.position.z += shiftZ
    c.update()
    const leftoverPx = (desiredY - clampedY) / worldPerPx
    if (Math.abs(leftoverPx) > 0.5) window.scrollBy({ top: -leftoverPx, behavior: 'auto' })
  }, [camera, controlsRef, gl, interactedRef])

  // Turns the body about its VERTICAL axis only (yaw). Because pitch never
  // changes, a sideways drag reads as a clean straight left–right turn and
  // the accidental top-down views are impossible.
  const yawBy = useCallback((dxPx) => {
    const c = controlsRef.current
    if (!c) return
    interactedRef.current = true
    const rect = gl.domElement.getBoundingClientRect()
    const angle = (2 * Math.PI * dxPx / Math.max(1, rect.height)) * 0.8   // matches old rotateSpeed
    const offset = camera.position.clone().sub(c.target)
    offset.applyAxisAngle(UP_AXIS, -angle)
    camera.position.copy(c.target).add(offset)
    camera.lookAt(c.target)
    c.update()
  }, [camera, controlsRef, gl, interactedRef])

  // Tilts the view up/down (pitch), clamped to the same polar range the
  // controls use, so dragging up on the body reveals the SOLES of the feet
  // and dragging down the top of the head — and the view can never flip.
  const pitchBy = useCallback((dyPx) => {
    const c = controlsRef.current
    if (!c) return
    interactedRef.current = true
    const rect = gl.domElement.getBoundingClientRect()
    const angle = (2 * Math.PI * dyPx / Math.max(1, rect.height)) * 0.8
    const offset = camera.position.clone().sub(c.target)
    const sph = new THREE.Spherical().setFromVector3(offset)
    sph.phi = clampNum(sph.phi - angle, POLAR_MIN, POLAR_MAX)
    sph.makeSafe()
    offset.setFromSpherical(sph)
    camera.position.copy(c.target).add(offset)
    camera.lookAt(c.target)
    c.update()
  }, [camera, controlsRef, gl, interactedRef])

  useEffect(() => {
    const el = gl.domElement
    const active = new Set()   // pointers currently down on the canvas

    // Touch: we own every gesture on the canvas.
    const onTouchStart = (e) => { e.preventDefault() }

    const releasePan = () => {
      const s = panState.current
      if (s) { try { el.releasePointerCapture?.(s.id) } catch { /* already released */ } }
      panState.current = null
    }

    const onPointerDown = (e) => {
      active.add(e.pointerId)
      // A second finger = a two-finger gesture. Hand the whole gesture to
      // OrbitControls (move + pinch zoom) and stop any one-finger pan/turn.
      if (active.size >= 2) { releasePan(); return }

      if (highlightRef.current) {
        // Draw mode: touching the BODY draws a line; touching the EMPTY SPACE
        // still turns the body / scrolls the page, so the user is never stuck.
        if (onBody(e.clientX, e.clientY)) { panState.current = null; return }
        panState.current = { x: e.clientX, y: e.clientY, id: e.pointerId, mode: null, type: e.pointerType, onBodyStart: false }
        el.setPointerCapture?.(e.pointerId)
        return
      }
      const hit = onBody(e.clientX, e.clientY)
      panState.current = { x: e.clientX, y: e.clientY, id: e.pointerId, mode: null, type: e.pointerType, onBodyStart: hit }
      el.setPointerCapture?.(e.pointerId)
    }

    const onPointerMove = (e) => {
      const s = panState.current
      if (!s || e.pointerId !== s.id) return
      const dx = e.clientX - s.x
      const dy = e.clientY - s.y
      // STARTED ON THE BODY (mouse or finger): sideways TURNS the body about
      // its vertical axis; up/down TILTS it (clamped) — that is how the
      // soles of the feet and the top of the head are reached.
      if (s.onBodyStart) {
        s.x = e.clientX
        s.y = e.clientY
        if (dx) yawBy(dx)
        if (dy) pitchBy(dy)
        return
      }
      // MOUSE on EMPTY SPACE: the picture follows the cursor in both
      // directions. (Horizontal is negated: moving the CAMERA right slides
      // the picture left, so following the cursor needs the opposite sign.
      // Vertical is not: screen-down is world-minus-Y, which already cancels
      // the camera inversion.)
      if (s.type === 'mouse') {
        s.x = e.clientX
        s.y = e.clientY
        if (dx || dy) applyPan(-dx, dy)
        return
      }
      // FINGER on EMPTY SPACE: decide once what this drag is: SIDEWAYS →
      // slide the picture straight left–right; UP/DOWN → scroll the page
      // (content follows the finger, like the rest of the site). The axis
      // locks for the rest of the drag; a tie goes to the slide.
      if (!s.mode) {
        if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return
        s.mode = Math.abs(dx) >= Math.abs(dy) ? 'slide' : 'scroll'
      }
      s.x = e.clientX
      s.y = e.clientY
      if (s.mode === 'slide') { if (dx) applyPan(-dx, 0) }
      else if (dy) window.scrollBy({ top: -dy, behavior: 'auto' })
    }
    const onPointerEnd = (e) => {
      active.delete(e.pointerId)
      if (panState.current?.id === e.pointerId) panState.current = null
    }

    // Wheel over the body: normal zoom. Wheel over empty space: move the body
    // image up/down (and sideways on trackpads that report deltaX).
    const onWheel = (e) => {
      const hit = onBody(e.clientX, e.clientY)
      if (hit) { if (controlsRef.current) controlsRef.current.enableZoom = true; return }
      e.preventDefault()
      e.stopPropagation()
      // Shift+wheel (or a trackpad's sideways scroll) moves the picture
      // left–right; a plain wheel moves it up–down.
      if (e.shiftKey && !e.deltaX) applyPan(-e.deltaY, 0)
      else applyPan(-e.deltaX, -e.deltaY)
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
  }, [gl, onBody, applyPan, yawBy, pitchBy, controlsRef, highlightRef])

  return null
}

// Smallest gap between two recorded points, in world units (the body is 4 tall,
// so this is ~1.5mm on a human scale) — fine enough that the stroke still reads
// as a smooth curve.
// Smallest gap between two recorded points, in world units. Small enough that
// the curve keeps its detail, large enough that a still finger does not pile up
// duplicate samples at one spot.
const MIN_STEP_SQ = 0.004 * 0.004

// Active only in Highlight mode: trace over the body to draw pain lines.
// Supports MULTIPLE lines — each completed drag becomes its own line.
function DrawSurface({ active, onPathUpdate, onPathComplete }) {
  const { camera, gl, scene } = useThree()
  // firstHitOnly lets the BVH stop at the nearest hit instead of collecting all.
  const raycaster = useMemo(() => { const r = new THREE.Raycaster(); r.firstHitOnly = true; return r }, [])
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
    // The browser batches pointermove events, so a quick drag delivers only a
    // handful of positions and the stroke comes out as long straight chords.
    // getCoalescedEvents() returns every sample the device actually recorded.
    const ne = e.nativeEvent
    const coalesced = ne && typeof ne.getCoalescedEvents === 'function' ? ne.getCoalescedEvents() : null
    const samples = coalesced && coalesced.length ? coalesced : [e]

    let added = false
    for (const sample of samples) {
      const p = cast(sample.clientX, sample.clientY)
      if (!p) continue
      // Ignore sub-threshold movement so a stationary finger does not pile up
      // duplicate points; the drawn stroke is visually identical.
      const last = pathRef.current[pathRef.current.length - 1]
      if (last && last.distanceToSquared(p) < MIN_STEP_SQ) continue
      pathRef.current.push(p)
      added = true
    }
    if (added) onPathUpdate([...pathRef.current])
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

  // A second finger during a stroke means the person is pinching or moving the
  // view, not drawing — discard the half-drawn stroke instead of leaving a
  // stray line underneath their pinch.
  useEffect(() => {
    const ids = new Set()
    const down = (e) => {
      ids.add(e.pointerId)
      if (ids.size >= 2 && drawing.current) {
        drawing.current = false
        pathRef.current = []
        onPathUpdate([])
      }
    }
    const lift = (e) => ids.delete(e.pointerId)
    window.addEventListener('pointerdown', down, true)
    window.addEventListener('pointerup', lift, true)
    window.addEventListener('pointercancel', lift, true)
    return () => {
      window.removeEventListener('pointerdown', down, true)
      window.removeEventListener('pointerup', lift, true)
      window.removeEventListener('pointercancel', lift, true)
    }
  }, [onPathUpdate])

  return (
    <mesh name="drawSurface" position={[0, 0.45, 0]} visible={false} onPointerDown={down} onPointerMove={move}>
      <boxGeometry args={[5, 5.6, 5]} />
      <meshBasicMaterial side={THREE.DoubleSide} />
    </mesh>
  )
}

// Pain marks are drawn in red: it is the convention on a clinical body chart,
// and unlike the previous black it stays legible against every surface the line
// can cross — skin, the dark shorts, hair, and the navy backdrop.
const PAIN_RED = '#ff2f2f'
const PAIN_HALO = '#4a0000'

// Each drawn point is a raycast hit on a 218k-triangle surface, so consecutive
// hits wobble in and out along the view ray. Averaging each point with its two
// neighbours removes that high-frequency noise without moving the stroke off
// the path the finger took. Endpoints are pinned so the line keeps its extent.
function denoise(pts, passes = 2) {
  if (pts.length < 3) return pts
  let cur = pts
  for (let pass = 0; pass < passes; pass++) {
    const out = [cur[0]]
    for (let i = 1; i < cur.length - 1; i++) {
      const a = cur[i - 1], b = cur[i], c = cur[i + 1]
      out.push(new THREE.Vector3(
        (a.x + b.x * 2 + c.x) / 4,
        (a.y + b.y * 2 + c.y) / 4,
        (a.z + b.z * 2 + c.z) / 4,
      ))
    }
    out.push(cur[cur.length - 1])
    cur = out
  }
  return cur
}

// <Line> renders straight chords between the points it is given, so the raw
// samples read as a chain of angular segments. Fitting a centripetal
// Catmull-Rom curve through them and re-sampling densely turns the stroke into
// a genuine curve. Centripetal parameterisation is the variant that will not
// overshoot or form cusps on tight turns.
function toCurve(pts) {
  if (pts.length < 3) return pts
  const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5)
  const n = Math.min(700, Math.max(pts.length * 4, 32))
  return curve.getPoints(n)
}

function PainLine({ points }) {
  // Lift each point slightly OUT from the body's central axis so the line
  // floats just above the skin — kills the striping/z-fighting against the
  // mesh while still hiding correctly behind the body when rotated.
  const lifted = useMemo(() => toCurve(denoise(points)).map((p) => {
    const len = Math.hypot(p.x, p.z) || 1
    const k = 0.03 / len
    return new THREE.Vector3(p.x + p.x * k, p.y, p.z + p.z * k)
  }), [points])
  // Slightly further out again, so the dark halo sits behind the red core
  // rather than fighting it for the same depth.
  const haloPts = useMemo(() => lifted.map((p) => {
    const len = Math.hypot(p.x, p.z) || 1
    const k = 0.004 / len
    return new THREE.Vector3(p.x + p.x * k, p.y, p.z + p.z * k)
  }), [lifted])
  return (
    <>
      {/* Dark outline first, so the red core reads on pale skin too */}
      <Line points={haloPts} color={PAIN_HALO} lineWidth={5} transparent opacity={0.85} />
      <Line points={lifted} color={PAIN_RED} lineWidth={2.6} />
    </>
  )
}

function Scene({ highlight, highlightRef, paths, livePath, controlsRef, interactedRef, onInteract, onPathUpdate, onPathComplete }) {
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 4]} intensity={1.7} castShadow />
      <directionalLight position={[-3, 2, -3]} intensity={0.55} color={GOLD} />

      {/* Reflections come from light panels rendered INSIDE the scene rather
          than from Environment's `preset`, which downloads an HDR from a CDN.
          That download can fail (offline, blocked network, CDN outage) and the
          error escapes the Canvas and unmounts the whole page. Building the
          environment locally keeps the site working with no network at all. */}
      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2.2} color="#ffffff" position={[0, 2, 6]} scale={[9, 9, 1]} />
        <Lightformer intensity={1.1} color="#c8d8ee" position={[5, 1, -3]} scale={[7, 7, 1]} />
        <Lightformer intensity={0.9} color={GOLD} position={[-5, 1, -4]} scale={[7, 7, 1]} />
        <Lightformer intensity={0.6} color="#ffffff" position={[0, -3, 3]} scale={[9, 4, 1]} />
      </Environment>

      <FitCamera controlsRef={controlsRef} interactedRef={interactedRef} />
      <InteractionGuard controlsRef={controlsRef} highlightRef={highlightRef} interactedRef={interactedRef} />
      <Suspense fallback={<Loader />}><BodyFigure /></Suspense>
      <CollisionHull />
      <DrawSurface active={highlight} onPathUpdate={onPathUpdate} onPathComplete={onPathComplete} />

      {/* ALL completed pain lines stay on the body */}
      {paths.map((pts, i) => pts.length > 1 && <PainLine key={i} points={pts} />)}
      {/* the line currently being drawn */}
      {livePath.length > 1 && <PainLine points={livePath} />}

      <ContactShadows position={[0, BODY_BOTTOM, 0]} opacity={0.5} scale={4.5} blur={2.4} far={2} color="#000000" />

      {/* The model NEVER moves on its own, and DRAGS NEVER ROTATE IT —
          rotation happens only through the ⟲ ⟳ buttons, so the body always
          stays upright. TWO fingers move the picture and pinch-zoom — in
          draw mode too, so people can zoom in to draw precisely.
          clampPanTarget keeps every move within frame. */}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableRotate={false}
        enablePan={true}
        screenSpacePanning={true}
        onChange={clampPanTarget}
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
        target={[CAM_TARGET[0], BODY_CENTRE, CAM_TARGET[2]]}
        minPolarAngle={POLAR_MIN}
        maxPolarAngle={POLAR_MAX}
        onStart={onInteract}
      />
    </>
  )
}

// A failure anywhere inside the WebGL canvas — a missing asset, a lost GPU
// context, an unsupported device — is re-thrown by R3F to the nearest React
// boundary. With no boundary it reaches the root and React unmounts the ENTIRE
// site, which reads to a visitor as "the page loaded, then vanished". This
// contains the failure to the 3D stage so the rest of the page keeps working.
class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error) {
    console.error('[Body3D] the 3D view failed and was contained:', error)
  }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div style={{
        width: '100%', height: '100%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 24, boxSizing: 'border-box',
        textAlign: 'center', fontFamily: "'DM Sans', sans-serif",
        fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.6)',
      }}>
        The interactive body model could not be displayed on this device.
        You can still book an assessment and describe your symptoms directly.
      </div>
    )
  }
}

export default function Body3D({
  onSelectionChange, onDoneDrawing, controlled = false, drawOn = false,
  clearSignal = 0, undoSignal = 0, redoSignal = 0, onHistoryChange,
}) {
  const [highlight, setHighlight] = useState(false)   // OFF: rotate on body only
  // Touch devices get a one-line gesture hint over the canvas: one finger
  // rotates (or draws, in highlight mode), two fingers move the picture.
  const [coarse, setCoarse] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(pointer: coarse)')
    const sync = () => setCoarse(mq.matches)
    sync()
    mq.addEventListener?.('change', sync)
    return () => mq.removeEventListener?.('change', sync)
  }, [])
  const [paths, setPaths] = useState([])              // completed pain lines (multiple)
  const [undone, setUndone] = useState([])            // lines removed by Undo, awaiting Redo
  const [livePath, setLivePath] = useState([])        // line being drawn now
  const controlsRef = useRef()
  const interactedRef = useRef(false)
  const highlightRef = useRef(false)
  const onInteract = () => { interactedRef.current = true }

  // Guided-assessment mode: the parent decides when drawing is on/off and
  // when to clear, and the internal button bar is hidden.
  useEffect(() => { if (controlled) setHighlight(drawOn) }, [controlled, drawOn])
  useEffect(() => {
    if (controlled && clearSignal > 0) { setPaths([]); setUndone([]); setLivePath([]); onSelectionChange?.([]) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearSignal])

  // Undo lifts the most recent line onto the redo stack; Redo puts it back.
  // Drawing a new line after an undo clears the redo stack, which is the
  // behaviour people already expect from every other drawing tool.
  useEffect(() => {
    if (!undoSignal || !paths.length) return
    const next = paths.slice(0, -1)
    setUndone((u) => [...u, paths[paths.length - 1]])
    setPaths(next)
    setLivePath([])
    emitZones(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undoSignal])

  useEffect(() => {
    if (!redoSignal || !undone.length) return
    const next = [...paths, undone[undone.length - 1]]
    setUndone((u) => u.slice(0, -1))
    setPaths(next)
    setLivePath([])
    emitZones(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [redoSignal])

  // Let the parent enable/disable its Undo and Redo controls.
  useEffect(() => {
    onHistoryChange?.({ canUndo: paths.length > 0, canRedo: undone.length > 0, lines: paths.length })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paths.length, undone.length])

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
    setUndone([])
    setPaths((prev) => {
      const next = [...prev, pts]
      emitZones(next)
      return next
    })
  }

  const reset = () => { setPaths([]); setUndone([]); setLivePath([]); onSelectionChange?.([]) }

  // Turning highlight OFF now KEEPS the drawn lines (so users can rotate and
  // keep adding lines from another angle). Only Reset clears.
  const toggleHighlight = () => {
    onInteract()
    setHighlight((h) => {
      const next = !h
      // Finishing a drawing session → let the page bring the results into view
      if (!next && paths.length > 0) onDoneDrawing?.()
      return next
    })
  }

  const btnBase = {
    fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase',
    padding: '12px 20px', borderRadius: 999, cursor: 'pointer', transition: 'all 0.2s',
    minHeight: 44, lineHeight: 1.2,
  }
  const btnGhost = {
    ...btnBase, border: '1px solid rgba(255,255,255,0.25)',
    background: 'rgba(8,21,39,0.55)', color: 'rgba(255,255,255,0.72)',
  }
  // The main button is IMPOSSIBLE to miss: solid gold + soft pulsing glow
  // while off, so users immediately know where to start.
  const btnMain = highlight
    ? { ...btnBase, border: `1px solid ${GOLD}`, background: 'rgba(201,169,110,0.18)', color: GOLD, fontWeight: 600 }
    : { ...btnBase, border: `1px solid ${GOLD}`, background: GOLD, color: '#081527', fontWeight: 700, animation: 'painBtnPulse 2s ease-in-out infinite' }

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
        display: controlled ? 'none' : 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
        zIndex: 2, maxWidth: '94%',
      }}>
        <button onClick={toggleHighlight} style={btnMain}>
          {highlight ? '✓ Done Drawing' : 'Highlight Pain Areas'}
        </button>
        {paths.length > 0 && <button onClick={reset} style={btnGhost}>Reset</button>}
        {paths.length > 0 && (
          <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: GOLD }}>
            {paths.length} line{paths.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <CanvasErrorBoundary>
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
        </CanvasErrorBoundary>
        {coarse && (
          <div style={{
            position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
            zIndex: 2, pointerEvents: 'none', whiteSpace: 'nowrap', maxWidth: '96%',
            padding: '7px 14px', borderRadius: 999, boxSizing: 'border-box',
            background: 'rgba(8,21,39,0.62)', border: '1px solid rgba(255,255,255,0.14)',
            fontFamily: "'DM Sans', sans-serif", fontSize: 10.5, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.78)', textAlign: 'center',
          }}>
            {highlight ? 'On the body — draw · Beside it — move' : 'On the body — turn · Beside it — move'}
          </div>
        )}
      </div>
    </div>
  )
}