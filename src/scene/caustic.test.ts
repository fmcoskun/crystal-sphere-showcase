import { expect, test } from 'vitest'
import { visibleHeight } from './camera'
import { causticPlacement } from './CausticFloor'

test('45° drops the caustic to the lower left', () => {
  const p = causticPlacement(45, { x: 0, y: 0 })
  expect(p.x).toBeLessThan(0)
  expect(p.y).toBeLessThan(0)
  expect(p.rotZ).toBeCloseTo(-Math.PI / 4)
})

test('moving the pointer right shifts the caustic left', () => {
  expect(causticPlacement(45, { x: 10, y: 0 }).x).toBeLessThan(causticPlacement(45, { x: 0, y: 0 }).x)
})

test('visibleHeight matches the fov-35 frustum', () => {
  expect(visibleHeight(7)).toBeCloseTo(2 * 7 * Math.tan((35 / 2) * (Math.PI / 180)))
})
