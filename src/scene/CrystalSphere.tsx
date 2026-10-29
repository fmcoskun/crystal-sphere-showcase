import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { TIERS, type Tier } from './quality'

export function CrystalSphere({
  tier,
  presence,
  light,
}: {
  tier: Tier
  presence: 'full' | 'away'
  light: { current: { x: number; y: number } }
}) {
  const group = useRef<THREE.Group>(null)
  const q = TIERS[tier]

  useFrame(({ camera }, delta) => {
    // Visible height at the sphere's depth; the "away" sphere parks near the top edge.
    const visibleHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(35 / 2))
    const g = group.current
    if (!g) return
    const away = presence === 'away'
    const s = THREE.MathUtils.damp(g.scale.x, away ? 0.32 : 1, 6, delta)
    g.scale.setScalar(s)
    g.position.y = THREE.MathUtils.damp(g.position.y, away ? visibleHeight * 0.33 : 0, 6, delta)
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, light.current.x * 0.03, 4, delta)
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, light.current.y * 0.03, 4, delta)
  })

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1.5, 96, 96]} />
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
}
