import { useRef, type ReactNode, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { Caustics } from '@react-three/drei'
import type * as THREE from 'three'
import { causticLight } from './CausticFloor'

// Distance from the sphere centre to the backdrop the caustic lands on: the ball-lens focus,
// f = nR / 2(n − 1) ≈ 2.19 for n 1.52, R 1.5, where the refracted light gathers into a hot spot.
const BACKDROP = 2.2

/**
 * Real refracted caustics. drei's Caustics projects onto its local y = 0 "floor"; the group is
 * turned +90° about X so that floor is the backdrop behind the sphere, facing the camera.
 * Children are given back the outer orientation, so they render exactly as without the layer.
 */
export function CausticsLayer({
  resolution,
  angle,
  intensity,
  light,
  children,
}: {
  resolution: number
  angle: number
  intensity: number
  light: { current: { x: number; y: number } }
  children: ReactNode
}) {
  const lamp = useRef<THREE.Object3D>(null)
  useFrame(() => {
    lamp.current?.position.set(...causticLight(angle, light.current))
  })
  return (
    <Caustics
      position={[0, 0, -BACKDROP]}
      rotation-x={Math.PI / 2}
      causticsOnly={false}
      backside
      ior={1.52}
      backsideIOR={1.52}
      worldRadius={0.1}
      resolution={resolution}
      frames={Infinity}
      intensity={1 * intensity}
      color="#ffffff"
      // drei reads the ref only inside its frame loop, after mount.
      lightSource={lamp as RefObject<THREE.Object3D>}
    >
      <object3D ref={lamp} />
      <group position={[0, BACKDROP, 0]} rotation-x={-Math.PI / 2}>
        {children}
      </group>
    </Caustics>
  )
}
