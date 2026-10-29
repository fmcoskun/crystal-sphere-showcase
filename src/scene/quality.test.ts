import { expect, test } from 'vitest'
import { chooseRenderer, initialTier, nextTier, type Caps } from './quality'

const caps = (over: Partial<Caps>): Caps => ({
  webgl: true,
  isMobile: false,
  hardwareConcurrency: 8,
  ...over,
})

test('no WebGL means the CSS renderer', () => {
  expect(chooseRenderer(caps({ webgl: false }))).toBe('css')
})

test('very weak phones get the CSS renderer', () => {
  expect(chooseRenderer(caps({ isMobile: true, hardwareConcurrency: 2 }))).toBe('css')
  expect(chooseRenderer(caps({ isMobile: true, deviceMemory: 1 }))).toBe('css')
})

test('capable phones and desktops get WebGL', () => {
  expect(chooseRenderer(caps({ isMobile: true, deviceMemory: 4 }))).toBe('webgl')
  expect(chooseRenderer(caps({}))).toBe('webgl')
})

test('mobile starts at tier 2 or lower, desktop at 3', () => {
  expect(initialTier(caps({ isMobile: true }))).toBeLessThanOrEqual(2)
  expect(initialTier(caps({}))).toBe(3)
})

test('nextTier steps down on slow frames, never below 0, never up', () => {
  expect(nextTier(3, 25)).toBe(2)
  expect(nextTier(0, 50)).toBe(0)
  expect(nextTier(2, 10)).toBe(2)
})
