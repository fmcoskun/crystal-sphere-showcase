import { expect, test } from 'vitest'
import { chooseRenderer, createFrameSampler, initialTier, nextTier, type Caps } from './quality'

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

test('frame sampler skips the warm-up window and ignores hidden-tab gaps', () => {
  const s = createFrameSampler(3, 100, 1)
  // warm-up window (shader compile) is discarded
  expect([s.push(50), s.push(50), s.push(50)]).toEqual([null, null, null])
  // a 5 s gap from a hidden tab is ignored entirely
  expect(s.push(5000)).toBeNull()
  expect([s.push(10), s.push(10), s.push(16)]).toEqual([null, null, 12])
})
