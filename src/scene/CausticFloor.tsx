import { useMemo } from 'react'
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

/** Fake floor caustic: a bright tail plus a soft shadow, tilted by the light angle. */
export function CausticFloor({
  angle,
  intensity,
  offset,
}: {
  angle: number
  intensity: number
  offset: { x: number; y: number }
}) {
  const bright = useMemo(() => makeTail('rgba(255,255,255,1)'), [])
  const shadow = useMemo(() => makeTail('rgba(0,0,0,0.55)'), [])
  const a = THREE.MathUtils.degToRad(angle)
  const x = -Math.sin(a) * DIST - offset.x * 0.02
  const y = -Math.cos(a) * DIST + offset.y * 0.02
  return (
    <group position={[x, y, -1.5]} rotation={[0, 0, -a]}>
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
