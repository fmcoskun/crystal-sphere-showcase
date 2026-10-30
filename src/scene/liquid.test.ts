import { expect, test } from 'vitest'
import { addRipple, displaceSphere, LIQUID, surfaceOffset, type Ripple, type Vec3 } from './liquid'

const unit = (v: Vec3): Vec3 => {
  const l = Math.hypot(...v)
  return [v[0] / l, v[1] / l, v[2] / l]
}

// Deterministic pseudo-random so a failure reproduces.
let seed = 7
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1

test('offset stays within the noise plus ripple budget', () => {
  const ripples: Ripple[] = [0, 1, 2, 3].map(() => ({ origin: unit([rand(), rand(), rand()]), born: 0 }))
  const budget = LIQUID.noiseAmp + LIQUID.maxRipples * LIQUID.rippleAmp
  for (let i = 0; i < 500; i++) {
    const o = surfaceOffset(unit([rand(), rand(), rand()]), Math.abs(rand()) * 2, ripples)
    expect(Math.abs(o)).toBeLessThanOrEqual(budget)
  }
})

test('a ripple has not reached the far side yet', () => {
  const r = [{ origin: [0, 0, 1] as Vec3, born: 0 }]
  expect(surfaceOffset([0, 0, -1], 0.1, r)).toBeCloseTo(surfaceOffset([0, 0, -1], 0.1, []), 10)
})

test('a ripple moves the surface it has reached', () => {
  const r = [{ origin: [0, 0, 1] as Vec3, born: 0 }]
  const near = unit([0.1, 0, 1])
  const t = 0.2
  expect(Math.abs(surfaceOffset(near, t, r) - surfaceOffset(near, t, []))).toBeGreaterThan(1e-4)
})

test('ripples fade below 1% after their life', () => {
  expect(Math.exp(-LIQUID.rippleDecay * LIQUID.rippleLife)).toBeLessThan(0.01)
})

test('addRipple rate-limits and caps', () => {
  let l: Ripple[] = []
  l = addRipple(l, [0, 0, 1], 0)
  l = addRipple(l, [0, 0, 1], 0.05)
  expect(l).toHaveLength(1)
  for (let i = 1; i <= 6; i++) l = addRipple(l, [0, 0, 1], i * 0.2)
  expect(l.length).toBeLessThanOrEqual(LIQUID.maxRipples)
  expect(l[0].born).toBeGreaterThan(0)
})

test('addRipple drops ripples older than their life', () => {
  let l = addRipple([], [0, 0, 1], 0)
  l = addRipple(l, [1, 0, 0], LIQUID.rippleLife + 0.5)
  expect(l.map((r) => r.born)).toEqual([LIQUID.rippleLife + 0.5])
})

test('displaceSphere moves vertices only along their own direction', () => {
  const base = new Float32Array([1.5, 0, 0, 0, 1.5, 0, 0, 0, -1.5, 0.866, 0.866, 0.866])
  const out = new Float32Array(base.length)
  const ripples = [{ origin: [1, 0, 0] as Vec3, born: 0 }]
  displaceSphere(base, out, 0.3, ripples)
  for (let i = 0; i < base.length; i += 3) {
    const b = unit([base[i], base[i + 1], base[i + 2]])
    const o: Vec3 = [out[i], out[i + 1], out[i + 2]]
    const n = unit(o)
    for (let k = 0; k < 3; k++) expect(n[k]).toBeCloseTo(b[k], 6)
    expect(Math.hypot(...o)).toBeCloseTo(LIQUID.radius + surfaceOffset(b, 0.3, ripples), 5)
  }
})
