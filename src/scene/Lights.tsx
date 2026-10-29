import { Environment, Lightformer } from '@react-three/drei'
import type { Theme } from '../state/theme'
import { lightRig } from './lightRig'

/** Studio rig: a sharp window softbox upper-right, soft fill lower-left. Rendered once per change. */
export function Lights({ theme, glare }: { theme: Theme; glare: number }) {
  const rig = lightRig(theme, glare)
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer
        form="rect"
        intensity={rig.window}
        color="#ffffff"
        position={[4, 4.5, 3]}
        rotation={[0, -0.6, 0.3]}
        scale={[2.2, 3]}
      />
      <Lightformer
        form="rect"
        intensity={rig.fill}
        color="#f1f0ec"
        position={[-4, -2.5, 2]}
        rotation={[0, 0.7, 0]}
        scale={[4, 5]}
      />
      <Lightformer form="ring" intensity={rig.ring} position={[0, 0, -6]} scale={8} />
    </Environment>
  )
}
