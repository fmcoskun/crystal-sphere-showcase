import * as THREE from 'three'
import type { TierSettings } from './quality'

type RGB = [number, number, number]

const START_COMPRESSION = 0.8 - 0.04
const DESATURATION = 0.15

/** Khronos PBR Neutral, a JS port of three's NeutralToneMapping (linear in, linear out, exposure 1). */
export function neutralToneMap([r, g, b]: RGB): RGB {
  const x = Math.min(r, g, b)
  const offset = x < 0.08 ? x - 6.25 * x * x : 0.04
  let c: RGB = [r - offset, g - offset, b - offset]
  const peak = Math.max(...c)
  if (peak < START_COMPRESSION) return c
  const d = 1 - START_COMPRESSION
  const newPeak = 1 - (d * d) / (peak + d - START_COMPRESSION)
  c = c.map((v) => (v * newPeak) / peak) as RGB
  const k = 1 - 1 / (DESATURATION * (peak - newPeak) + 1)
  return c.map((v) => v + (newPeak - v) * k) as RGB
}

/**
 * The scene background to set so the studio grey comes out exactly `hex`.
 * With postprocessing the whole frame, background included, goes through the Neutral curve,
 * so the background is pre-compensated; without it the renderer leaves the clear colour alone.
 */
export function backgroundFor(hex: string, post: TierSettings['post']): THREE.Color {
  const target = new THREE.Color(hex)
  if (post === 'off') return target
  const y: RGB = [target.r, target.g, target.b]
  if (Math.max(...y) >= START_COMPRESSION) throw new Error(`${hex} is above the Neutral compression knee`)
  const ymin = Math.min(...y)
  // Solve m − offset(m) = ymin for the darkest channel; the same offset applies to all three.
  const m = ymin >= 0.04 ? ymin + 0.04 : Math.sqrt(ymin / 6.25)
  const offset = m - ymin
  return new THREE.Color(y[0] + offset, y[1] + offset, y[2] + offset)
}
