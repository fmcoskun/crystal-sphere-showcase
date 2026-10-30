import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { Optics } from '../state/optics'
import { visibleHeight } from './camera'
import { CausticsLayer } from './CausticsLayer'
import { addRipple, displaceSphere, LIQUID, type Ripple, type Vec3 } from './liquid'
import { TIERS, type Tier } from './quality'

/** A sphere with welded seams, so per-frame vertex normals don't show a seam line. */
function useLiquidGeometry(segments: number) {
  const geometry = useMemo(() => {
    const g = new THREE.SphereGeometry(LIQUID.radius, segments, segments)
    g.deleteAttribute('normal')
    g.deleteAttribute('uv')
    const welded = mergeVertices(g)
    g.dispose()
    welded.computeVertexNormals()
    return welded
  }, [segments])
  const base = useMemo(() => Float32Array.from(geometry.attributes.position.array), [geometry])
  useEffect(() => () => geometry.dispose(), [geometry])
  return { geometry, base }
}

export function CrystalSphere({
  tier,
  presence,
  light,
  reducedMotion,
  optics,
}: {
  tier: Tier
  presence: 'full' | 'away'
  light: { current: { x: number; y: number } }
  reducedMotion: boolean
  optics: Optics
}) {
  const group = useRef<THREE.Group>(null)
  const tilt = useRef<THREE.Group>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const q = TIERS[tier]
  const liquid = q.liquid && !reducedMotion
  const { geometry, base } = useLiquidGeometry(q.segments)

  const ripples = useRef<Ripple[]>([])
  const lastPointer = useRef(new THREE.Vector2(NaN, NaN))
  const scratch = useMemo(
    () => ({ raycaster: new THREE.Raycaster(), sphere: new THREE.Sphere(), hit: new THREE.Vector3() }),
    [],
  )

  // Liquid switched off (tier drop or reduced motion): put the surface back to a true sphere.
  useEffect(() => {
    if (liquid) return
    const pos = geometry.attributes.position as THREE.BufferAttribute
    ;(pos.array as Float32Array).set(base)
    pos.needsUpdate = true
    geometry.computeVertexNormals()
    ripples.current = []
  }, [liquid, geometry, base])

  useFrame(({ camera, pointer, clock }, delta) => {
    // Visible height at the sphere's depth; the "away" sphere parks near the top edge.
    const height = visibleHeight(camera.position.z)
    const g = group.current
    const r = tilt.current
    if (!g || !r) return
    const away = presence === 'away'
    const s = THREE.MathUtils.damp(g.scale.x, away ? 0.32 : 1, 6, delta)
    g.scale.setScalar(s)
    g.position.y = THREE.MathUtils.damp(g.position.y, away ? height * 0.33 : 0, 6, delta)
    r.rotation.y = THREE.MathUtils.damp(r.rotation.y, light.current.x * 0.03, 4, delta)
    r.rotation.x = THREE.MathUtils.damp(r.rotation.x, light.current.y * 0.03, 4, delta)

    const m = mesh.current
    if (!liquid || !m) return
    const t = clock.elapsedTime

    // Pointer ripples: intersect the pointer ray with the ideal sphere, far cheaper than a mesh raycast.
    if (!pointer.equals(lastPointer.current)) {
      lastPointer.current.copy(pointer)
      scratch.raycaster.setFromCamera(pointer, camera)
      m.getWorldPosition(scratch.sphere.center)
      scratch.sphere.radius = LIQUID.radius * s
      if (scratch.raycaster.ray.intersectSphere(scratch.sphere, scratch.hit)) {
        const local = m.worldToLocal(scratch.hit).normalize()
        ripples.current = addRipple(ripples.current, [local.x, local.y, local.z] as Vec3, t)
      }
    }

    const pos = geometry.attributes.position as THREE.BufferAttribute
    displaceSphere(base, pos.array as Float32Array, t, ripples.current)
    pos.needsUpdate = true
    geometry.computeVertexNormals()
  })

  // Outer group: the "away" move and scale, so the caustic travels with the sphere.
  // Inner group: the small pointer tilt.
  const sphere = (
    <group ref={tilt}>
      <mesh ref={mesh} geometry={geometry}>
        <MeshTransmissionMaterial
          transmission={1}
          thickness={1.4}
          roughness={0.02}
          ior={1.52}
          chromaticAberration={0.05}
          anisotropicBlur={0.1}
          distortion={0.08}
          distortionScale={0.3}
          temporalDistortion={0}
          backside
          backsideThickness={0.6}
          samples={q.samples}
          resolution={q.resolution}
          attenuationColor="#ffffff"
          attenuationDistance={6}
        />
      </mesh>
    </group>
  )

  return (
    <group ref={group}>
      {q.caustics > 0 ? (
        <CausticsLayer resolution={q.caustics} angle={optics.angle} intensity={optics.caustic / 100} light={light}>
          {sphere}
        </CausticsLayer>
      ) : (
        sphere
      )}
    </group>
  )
}
