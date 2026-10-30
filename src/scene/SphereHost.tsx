import { Component, lazy, Suspense, useCallback, useState, type ReactNode } from 'react'
import { CssCrystal } from '../fallback/CssCrystal'
import type { Optics } from '../state/optics'
import type { Theme } from '../state/theme'
import { chooseRenderer, detectCaps, forcedTier, initialTier, nextTier, type Tier } from './quality'

const CrystalScene = lazy(() => import('./CrystalScene'))

interface Props {
  theme: Theme
  optics: Optics
  presence: 'full' | 'away'
  light: { current: { x: number; y: number } }
  forceRenderer?: 'webgl' | 'css'
}

/** A failed chunk load or a Canvas/shader error must not blank the page: drop to CSS. */
class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function pickRenderer(force?: 'webgl' | 'css'): 'webgl' | 'css' {
  if (force) return force
  if (import.meta.env.DEV) {
    const q = new URLSearchParams(window.location.search).get('renderer')
    if (q === 'css' || q === 'webgl') return q
  }
  return chooseRenderer(detectCaps())
}

export function SphereHost({ theme, optics, presence, light, forceRenderer }: Props) {
  const [renderer, setRenderer] = useState(() => pickRenderer(forceRenderer))
  const [tier, setTier] = useState<Tier>(
    () => (import.meta.env.DEV ? forcedTier(window.location.search) : null) ?? initialTier(detectCaps()),
  )

  const onTierNeeded = useCallback((avgMs: number) => setTier((t) => nextTier(t, avgMs)), [])
  const onContextLost = useCallback(() => setRenderer('css'), [])

  const css = <CssCrystal theme={theme} optics={optics} presence={presence} light={light} />
  if (renderer === 'css') return css

  return (
    <div data-renderer="webgl" data-tier={tier} className="fixed inset-0">
      <SceneBoundary onError={onContextLost}>
        <Suspense fallback={css}>
          <CrystalScene
            tier={tier}
            theme={theme}
            optics={optics}
            light={light}
            presence={presence}
            onTierNeeded={onTierNeeded}
            onContextLost={onContextLost}
          />
        </Suspense>
      </SceneBoundary>
    </div>
  )
}
