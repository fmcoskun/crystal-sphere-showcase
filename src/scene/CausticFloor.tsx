import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function makeTail(color: string): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 512
  const ctx = c.getContext('2d')!
  ctx.translate(128, 40)
  ctx.scale(1, 2.6)
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 120)
  g.addColorStop(0, color)
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(-128, -40, 256, 512)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

const DIST = 3.0

/** Where the caustic sits on the backdrop for a light angle and pointer offset. */
export function causticPlacement(angleDeg: number, offset: { x: number; y: number }) {
  const a = THREE.MathUtils.degToRad(angleDeg)
  return {
    x: -Math.sin(a) * DIST - offset.x * 0.02,
    y: -Math.cos(a) * DIST + offset.y * 0.02,
    rotZ: -a,
  }
}

/** Fake floor caustic: a bright tail plus a soft shadow, tilted by the light angle. */
export function CausticFloor({
  angle,
  intensity,
  light,
}: {
  angle: number
  intensity: number
  light: { current: { x: number; y: number } }
}) {
  const group = useRef<THREE.Group>(null)
  const bright = useMemo(() => makeTail('rgba(255,255,255,1)'), [])
  const shadow = useMemo(() => makeTail('rgba(0,0,0,0.55)'), [])
  useEffect(
    () => () => {
      bright.dispose()
      shadow.dispose()
    },
    [bright, shadow],
  )

  // The light offset lives in a ref, so placement is read every frame rather than on render.
  useFrame(() => {
    const g = group.current
    if (!g) return
    const p = causticPlacement(angle, light.current)
    g.position.set(p.x, p.y, -1.5)
    g.rotation.z = p.rotZ
  })

  return (
    <group ref={group}>
      <mesh position={[0.15, 0.1, -0.01]}>
        <planeGeometry args={[2.6, 5.2]} />
        <meshBasicMaterial map={shadow} transparent opacity={0.45 * intensity} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh>
        <planeGeometry args={[2.6, 5.2]} />
        <meshBasicMaterial map={bright} transparent opacity={intensity} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}
