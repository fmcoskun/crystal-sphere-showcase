import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { THEME_COLORS, type Theme } from '../state/theme'
import type { Optics } from '../state/optics'
import { createFrameSampler, TIERS, type Tier } from './quality'
import { CausticFloor } from './CausticFloor'
import { CrystalSphere } from './CrystalSphere'
import { Lights } from './Lights'

function FrameMeter({ onSlow }: { onSlow: (avgMs: number) => void }) {
  const sampler = useRef(createFrameSampler())
  useFrame((_, delta) => {
    const avg = sampler.current.push(delta * 1000)
    if (avg !== null) onSlow(avg)
  })
  return null
}

const BASE_DISTANCE = 7
// Keeps the 3-unit sphere within ~78% of the width on portrait screens (fov 35°).
const PORTRAIT_FIT = 6.1

function FitCamera() {
  const camera = useThree((s) => s.camera)
  const aspect = useThree((s) => s.size.width / s.size.height)
  useEffect(() => {
    camera.position.z = Math.max(BASE_DISTANCE, PORTRAIT_FIT / aspect)
    camera.updateProjectionMatrix()
  }, [camera, aspect])
  return null
}

function Floor({ optics, light }: { optics: Optics; light: { current: { x: number; y: number } } }) {
  return <CausticFloor angle={optics.angle} intensity={optics.caustic / 100} offset={light.current} />
}

export interface CrystalSceneProps {
  tier: Tier
  theme: Theme
  optics: Optics
  light: { current: { x: number; y: number } }
  presence: 'full' | 'away'
  onTierNeeded: (avgFrameMs: number) => void
  onContextLost: () => void
}

export default function CrystalScene(p: CrystalSceneProps) {
  return (
    <Canvas
      dpr={TIERS[p.tier].dpr}
      camera={{ position: [0, 0, 7], fov: 35 }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          p.onContextLost()
        })
      }}
    >
      <FitCamera />
      <color attach="background" args={[THEME_COLORS[p.theme].bg]} />
      <Lights theme={p.theme} glare={p.optics.glare} />
      <Floor optics={p.optics} light={p.light} />
      <CrystalSphere tier={p.tier} presence={p.presence} light={p.light} />
      <FrameMeter onSlow={p.onTierNeeded} />
    </Canvas>
  )
}
