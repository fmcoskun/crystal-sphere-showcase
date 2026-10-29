import CrystalScene from './scene/CrystalScene'
import { DEFAULT_OPTICS } from './state/optics'
import { useLightOffset } from './scene/useLightOffset'

export default function App() {
  const { offset } = useLightOffset()
  return (
    <main className="fixed inset-0">
      <CrystalScene
        tier={3}
        theme="light"
        optics={DEFAULT_OPTICS}
        light={offset}
        presence="full"
        onTierNeeded={() => {}}
        onContextLost={() => {}}
      />
    </main>
  )
}
