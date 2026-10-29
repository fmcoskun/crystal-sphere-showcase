import { useCallback, useEffect, useRef } from 'react'
import { pointerToLight, requestTilt, tiltToLight, type Offset } from './input'

/**
 * Light offset lives in a ref so the render loop can read it every frame
 * without re-rendering React. `enableTilt` must be called from a user gesture
 * (iOS asks permission there); if tilt is denied, pointer/drag still works.
 */
export function useLightOffset() {
  const offset = useRef<Offset>({ x: 0, y: 0 })
  const tiltOn = useRef(false)

  useEffect(() => {
    const onPointer = (e: PointerEvent | MouseEvent) => {
      if (tiltOn.current) return
      offset.current = pointerToLight(
        { x: e.clientX, y: e.clientY },
        { w: window.innerWidth, h: window.innerHeight },
      )
    }
    const onTilt = (e: DeviceOrientationEvent) => {
      if (!tiltOn.current || e.beta === null || e.gamma === null) return
      offset.current = tiltToLight({ beta: e.beta, gamma: e.gamma })
    }
    window.addEventListener('pointermove', onPointer)
    window.addEventListener('deviceorientation', onTilt)
    return () => {
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('deviceorientation', onTilt)
    }
  }, [])

  const enableTilt = useCallback(async () => {
    const result = await requestTilt()
    tiltOn.current = result === 'granted'
    return result
  }, [])

  return { offset, enableTilt }
}
