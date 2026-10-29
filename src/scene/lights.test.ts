import { expect, test } from 'vitest'
import { lightRig } from './lightRig'

test('the dark studio dims the fill and ring lights', () => {
  const light = lightRig('light', 100)
  const dark = lightRig('dark', 100)
  expect(dark.fill).toBeLessThan(light.fill)
  expect(dark.ring).toBeLessThan(light.ring)
})

test('window intensity follows the glare slider', () => {
  expect(lightRig('light', 50).window).toBeCloseTo(lightRig('light', 100).window / 2)
})
