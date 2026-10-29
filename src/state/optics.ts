export interface Optics {
  angle: number
  caustic: number
  glare: number
}

export const DEFAULT_OPTICS: Optics = { angle: 45, caustic: 100, glare: 100 }

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function clampOptics(o: Optics): Optics {
  return {
    angle: clamp(o.angle, 15, 75),
    caustic: clamp(o.caustic, 30, 100),
    glare: clamp(o.glare, 50, 135),
  }
}
