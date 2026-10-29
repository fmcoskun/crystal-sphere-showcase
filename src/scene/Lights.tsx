import { Environment, Lightformer } from '@react-three/drei'

/** Studio rig: a sharp window softbox upper-right, soft fill lower-left. Rendered once. */
export function Lights({ glare }: { glare: number }) {
  const g = glare / 100
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer
        form="rect"
        intensity={7 * g}
        color="#ffffff"
        position={[4, 4.5, 3]}
        rotation={[0, -0.6, 0.3]}
        scale={[2.2, 3]}
      />
      <Lightformer
        form="rect"
        intensity={1.4}
        color="#f1f0ec"
        position={[-4, -2.5, 2]}
        rotation={[0, 0.7, 0]}
        scale={[4, 5]}
      />
      <Lightformer form="ring" intensity={0.6} position={[0, 0, -6]} scale={8} />
    </Environment>
  )
}
