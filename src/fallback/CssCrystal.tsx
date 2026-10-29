import { useEffect, useRef, type CSSProperties } from 'react'
import { THEME_COLORS, type Theme } from '../state/theme'
import type { Optics } from '../state/optics'
import './crystal.css'

export function CssCrystal({
  theme,
  optics,
  presence,
  light,
}: {
  theme: Theme
  optics: Optics
  presence: 'full' | 'away'
  light: { current: { x: number; y: number } }
}) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const tick = () => {
      const el = root.current
      if (el) {
        el.style.setProperty('--mouse-offset-x', `${light.current.x.toFixed(1)}px`)
        el.style.setProperty('--mouse-offset-y', `${light.current.y.toFixed(1)}px`)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [light])

  const style = {
    '--studio-bg': THEME_COLORS[theme].bg,
    '--caustic-angle': `${optics.angle}deg`,
    '--caustic-intensity': optics.caustic / 100,
    '--glare-scale': optics.glare / 100,
  } as CSSProperties

  return (
    <div
      ref={root}
      data-renderer="css"
      className={`css-crystal${presence === 'away' ? ' is-away' : ''}`}
      style={style}
    >
      <div className="pure-crystal-scene">
        <div className="crystal-caustic-tail" />
      </div>
    </div>
  )
}
