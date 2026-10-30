import { expect, test } from 'vitest'
import { causticLight, causticPlacement } from './CausticFloor'

test('45° puts the light upper-right and in front of the sphere', () => {
  const [x, y, z] = causticLight(45, { x: 0, y: 0 })
  expect(x).toBeGreaterThan(0) // right
  expect(y).toBeGreaterThan(0) // in front (world z)
  expect(z).toBeLessThan(0) // up (world y = −local z)
})

test.each([15, 45, 75])('at %i° the projected spot agrees with the fake caustic direction', (angle) => {
  const [lx, , lz] = causticLight(angle, { x: 0, y: 0 })
  // The spot lands opposite the light: world (−lx, −(−lz)) = (−lx, lz).
  const spot = Math.atan2(lz, -lx)
  const fake = causticPlacement(angle, { x: 0, y: 0 })
  const diff = Math.abs(spot - Math.atan2(fake.y, fake.x))
  expect(diff).toBeLessThan((1 * Math.PI) / 180)
})

test('moving the pointer right moves the light right, so the spot goes left', () => {
  expect(causticLight(45, { x: 10, y: 0 })[0]).toBeGreaterThan(causticLight(45, { x: 0, y: 0 })[0])
})
