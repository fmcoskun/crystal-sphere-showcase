import { SphereHost } from './scene/SphereHost'
import { DEFAULT_OPTICS } from './state/optics'
import { useLightOffset } from './scene/useLightOffset'

export default function App() {
  const { offset } = useLightOffset()
  return (
    <main className="fixed inset-0">
      <SphereHost theme="light" optics={DEFAULT_OPTICS} presence="full" light={offset} />
    </main>
  )
}
