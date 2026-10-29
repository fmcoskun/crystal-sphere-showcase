import { afterEach, expect, test, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { pointerToLight, requestTilt, tiltToLight } from './input'
import { useLightOffset } from './useLightOffset'

afterEach(() => vi.unstubAllGlobals())

const view = { w: 100, h: 100 }

test('pointerToLight maps the viewport to +-12 px like the prototype', () => {
  expect(pointerToLight({ x: 0, y: 0 }, view)).toEqual({ x: -12, y: -12 })
  expect(pointerToLight({ x: 50, y: 50 }, view)).toEqual({ x: 0, y: 0 })
  expect(pointerToLight({ x: 100, y: 100 }, view)).toEqual({ x: 12, y: 12 })
})

test('tiltToLight centres on a 45 degree hold and clamps', () => {
  expect(tiltToLight({ beta: 45, gamma: 0 })).toEqual({ x: 0, y: 0 })
  expect(tiltToLight({ beta: 45, gamma: 90 }).x).toBe(12)
})

test('requestTilt reports denied when the permission is refused', async () => {
  vi.stubGlobal('DeviceOrientationEvent', { requestPermission: () => Promise.resolve('denied') })
  expect(await requestTilt()).toBe('denied')
})

test('requestTilt reports denied when the permission prompt throws', async () => {
  vi.stubGlobal('DeviceOrientationEvent', {
    requestPermission: () => Promise.reject(new Error('nope')),
  })
  expect(await requestTilt()).toBe('denied')
})

test('requestTilt reports unsupported without the API', async () => {
  vi.stubGlobal('DeviceOrientationEvent', undefined)
  expect(await requestTilt()).toBe('unsupported')
})

test('useLightOffset follows pointer movement', () => {
  Object.defineProperty(window, 'innerWidth', { value: 100, configurable: true })
  Object.defineProperty(window, 'innerHeight', { value: 100, configurable: true })
  const { result } = renderHook(() => useLightOffset())
  window.dispatchEvent(new MouseEvent('pointermove', { clientX: 100, clientY: 0 }))
  expect(result.current.offset.current).toEqual({ x: 12, y: -12 })
})

test('pointer keeps moving the light when tilt is allowed but no sensor reading arrives', async () => {
  vi.stubGlobal('DeviceOrientationEvent', function DeviceOrientationEvent() {})
  Object.defineProperty(window, 'innerWidth', { value: 100, configurable: true })
  Object.defineProperty(window, 'innerHeight', { value: 100, configurable: true })
  const { result } = renderHook(() => useLightOffset())
  await result.current.enableTilt()
  window.dispatchEvent(new MouseEvent('pointermove', { clientX: 0, clientY: 100 }))
  expect(result.current.offset.current).toEqual({ x: -12, y: 12 })
})
