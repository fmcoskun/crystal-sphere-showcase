import * as THREE from 'three'
import { expect, test } from 'vitest'
import { backgroundFor, neutralToneMap } from './toneMap'

test.each(['#94938f', '#4e4e4b'])('%s survives the Neutral curve within 1/255', (hex) => {
  const c = backgroundFor(hex, 'full')
  const out = new THREE.Color(...neutralToneMap([c.r, c.g, c.b]))
  const [a, b] = [out.getHex(), new THREE.Color(hex).getHex()]
  for (const shift of [16, 8, 0]) expect(Math.abs(((a >> shift) & 255) - ((b >> shift) & 255))).toBeLessThanOrEqual(1)
})

test('post off returns the raw hex', () => {
  expect(backgroundFor('#94938f', 'off').getHexString()).toBe('94938f')
})

test('values above the compression knee throw', () => {
  expect(() => backgroundFor('#ffffff', 'full')).toThrow()
})

test('neutralToneMap matches three for known values', () => {
  // Below the knee: a flat 0.04 offset.
  expect(neutralToneMap([0.5, 0.5, 0.5])[0]).toBeCloseTo(0.46, 5)
  // Very dark: offset x − 6.25x².
  expect(neutralToneMap([0.04, 0.04, 0.04])[0]).toBeCloseTo(6.25 * 0.04 * 0.04, 6)
  // Above the knee the peak is compressed below 1.
  const hi = neutralToneMap([4, 4, 4])
  expect(hi[0]).toBeLessThan(1)
  expect(hi[0]).toBeGreaterThan(0.9)
})
