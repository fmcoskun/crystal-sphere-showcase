export type Vec3 = [number, number, number]

export interface Ripple {
  /** Unit vector from the sphere centre to where the pointer touched. */
  origin: Vec3
  /** Seconds, on the render clock. */
  born: number
}

export const LIQUID = {
  radius: 1.5,
  noiseAmp: 0.02,
  noiseSpeed: 0.35,
  rippleAmp: 0.06,
  rippleSpeed: 2.0,
  rippleWavelength: 0.6,
  rippleDecay: 2.5,
  maxRipples: 4,
  rippleGap: 0.12,
  rippleLife: 2.0,
} as const

/** Radial displacement of the surface in direction `dir` (a unit vector) at time `t`. */
export function surfaceOffset(dir: Vec3, t: number, ripples: readonly Ripple[]): number {
  const [x, y, z] = dir
  const s = LIQUID.noiseSpeed * t
  let o = LIQUID.noiseAmp * Math.sin(1.7 * x + 0.9 * s) * Math.sin(1.3 * y + 0.7 * s) * Math.sin(1.1 * z + 1.1 * s)
  for (const r of ripples) {
    const age = t - r.born
    if (age < 0) continue
    const front = LIQUID.rippleSpeed * age
    const dot = Math.min(1, Math.max(-1, x * r.origin[0] + y * r.origin[1] + z * r.origin[2]))
    const d = LIQUID.radius * Math.acos(dot)
    if (d >= front) continue
    o +=
      LIQUID.rippleAmp *
      Math.exp(-LIQUID.rippleDecay * age) *
      Math.sin((2 * Math.PI * (d - front)) / LIQUID.rippleWavelength)
  }
  return o
}

/** Adds a ripple at `origin`, unless one started less than `rippleGap` ago; drops expired and excess ripples. */
export function addRipple(list: readonly Ripple[], origin: Vec3, now: number): Ripple[] {
  const last = list[list.length - 1]
  if (last && now - last.born < LIQUID.rippleGap) return list as Ripple[]
  const live = list.filter((r) => now - r.born <= LIQUID.rippleLife)
  live.push({ origin, born: now })
  return live.slice(-LIQUID.maxRipples)
}

/** Writes `base` vertices (on the sphere) into `out`, each pushed along its own direction. */
export function displaceSphere(base: Float32Array, out: Float32Array, t: number, ripples: readonly Ripple[]): void {
  const dir: Vec3 = [0, 0, 0]
  for (let i = 0; i < base.length; i += 3) {
    const bx = base[i]
    const by = base[i + 1]
    const bz = base[i + 2]
    const len = Math.hypot(bx, by, bz) || 1
    dir[0] = bx / len
    dir[1] = by / len
    dir[2] = bz / len
    const r = LIQUID.radius + surfaceOffset(dir, t, ripples)
    out[i] = dir[0] * r
    out[i + 1] = dir[1] * r
    out[i + 2] = dir[2] * r
  }
}
