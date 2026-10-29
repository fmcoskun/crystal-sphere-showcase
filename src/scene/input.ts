export interface Offset {
  x: number
  y: number
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

export function pointerToLight(p: Offset, v: { w: number; h: number }, max = 12): Offset {
  return { x: (p.x / v.w - 0.5) * 2 * max, y: (p.y / v.h - 0.5) * 2 * max }
}

export function tiltToLight(t: { beta: number; gamma: number }, max = 12): Offset {
  return {
    x: clamp(t.gamma / 45, -1, 1) * max,
    y: clamp((t.beta - 45) / 45, -1, 1) * max,
  }
}

interface OrientationEventStatic {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

export async function requestTilt(): Promise<'granted' | 'denied' | 'unsupported'> {
  const Ctor = (globalThis as { DeviceOrientationEvent?: OrientationEventStatic })
    .DeviceOrientationEvent
  if (!Ctor) return 'unsupported'
  if (typeof Ctor.requestPermission === 'function') {
    try {
      return (await Ctor.requestPermission()) === 'granted' ? 'granted' : 'denied'
    } catch {
      return 'denied'
    }
  }
  return 'granted'
}
