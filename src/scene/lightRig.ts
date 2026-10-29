import type { Theme } from '../state/theme'

export interface LightRig {
  window: number
  fill: number
  ring: number
}

/** Light intensities for the studio rig; the dark studio dims the fill and ring. */
export function lightRig(theme: Theme, glare: number): LightRig {
  const dark = theme === 'dark'
  return {
    window: 7 * (glare / 100),
    fill: dark ? 0.6 : 1.4,
    ring: dark ? 0.25 : 0.6,
  }
}
