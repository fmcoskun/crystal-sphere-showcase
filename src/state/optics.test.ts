import { expect, test } from 'vitest'
import { clampOptics, DEFAULT_OPTICS } from './optics'

test('defaults match the prototype', () => {
  expect(DEFAULT_OPTICS).toEqual({ angle: 45, caustic: 100, glare: 100 })
})

test('clampOptics keeps every value inside its slider range', () => {
  expect(clampOptics({ angle: 5, caustic: 999, glare: 0 })).toEqual({
    angle: 15,
    caustic: 100,
    glare: 50,
  })
  expect(clampOptics({ angle: 80, caustic: 10, glare: 200 })).toEqual({
    angle: 75,
    caustic: 30,
    glare: 135,
  })
})
