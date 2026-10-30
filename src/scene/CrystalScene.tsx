import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { THEME_COLORS, type Theme } from '../state/theme'
import type { Optics } from '../state/optics'
import { BASE_DISTANCE, CAMERA_FOV, PORTRAIT_FIT } from './camera'
import { createFrameSampler, TIERS, type Tier } from './quality'
import { CrystalSphere } from './CrystalSphere'
import { Effects } from './Effects'
import { Lights } from './Lights'
import { backgroundFor } from './toneMap'

function FrameMeter({ onSlow }: { onSlow: (avgMs: number) => void }) {
  const sampler = useRef(createFrameSampler())
  useFrame((_, delta) => {
    const avg = sampler.current.push(delta * 1000)
    if (avg !== null) onSlow(avg)
  })
  return null
}

function FitCamera() {
  const camera = useThree((s) => s.camera)
  const aspect = useThree((s) => s.size.width / s.size.height)
  useEffect(() => {
    camera.position.z = Math.max(BASE_DISTANCE, PORTRAIT_FIT / aspect)
    camera.updateProjectionMatrix()
  }, [camera, aspect])
  return null
}

export interface CrystalSceneProps {
  tier: Tier
  theme: Theme
  optics: Optics
  light: { current: { x: number; y: number } }
  presence: 'full' | 'away'
  reducedMotion: boolean
  onTierNeeded: (avgFrameMs: number) => void
  onContextLost: () => void
}

export default function CrystalScene(p: CrystalSceneProps) {
  return (
    <Canvas
      dpr={TIERS[p.tier].dpr}
      camera={{ position: [0, 0, BASE_DISTANCE], fov: CAMERA_FOV }}
      // No renderer tone mapping: on tiers 1–3 the composer tone-maps the whole frame once (it forces
      // this anyway). On tier 0 nothing is tone-mapped, so the sphere's transmission buffer (rendered
      // untone-mapped by drei) and the clear colour stay on the same curve and the inside can't darken.
      gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          p.onContextLost()
        })
      }}
    >
      <FitCamera />
      <color attach="background" args={[backgroundFor(THEME_COLORS[p.theme].bg, TIERS[p.tier].post)]} />
      <Lights theme={p.theme} glare={p.optics.glare} />
      <CrystalSphere
        tier={p.tier} presence={p.presence} light={p.light} reducedMotion={p.reducedMotion}
        optics={p.optics}
      />
      <Effects mode={TIERS[p.tier].post} />
      <FrameMeter onSlow={p.onTierNeeded} />
    </Canvas>
  )
}
