export type Tier = 0 | 1 | 2 | 3

export const TIERS: Record<Tier, { dpr: number; samples: number; resolution: number }> = {
  0: { dpr: 1, samples: 2, resolution: 128 },
  1: { dpr: 1.25, samples: 4, resolution: 256 },
  2: { dpr: 1.5, samples: 6, resolution: 512 },
  3: { dpr: 2, samples: 10, resolution: 1024 },
}

export interface Caps {
  webgl: boolean
  isMobile: boolean
  hardwareConcurrency: number
  deviceMemory?: number
}

const SLOW_FRAME_MS = 20

export function chooseRenderer(c: Caps): 'webgl' | 'css' {
  if (!c.webgl) return 'css'
  const weak = c.hardwareConcurrency <= 2 || (c.deviceMemory !== undefined && c.deviceMemory <= 1)
  return weak ? 'css' : 'webgl'
}

export function initialTier(c: Caps): Tier {
  return c.isMobile ? 2 : 3
}

export function nextTier(current: Tier, avgFrameMs: number): Tier {
  if (avgFrameMs <= SLOW_FRAME_MS || current === 0) return current
  return (current - 1) as Tier
}

export function detectCaps(): Caps {
  let webgl = false
  try {
    webgl = !!document.createElement('canvas').getContext('webgl2')
  } catch {
    webgl = false
  }
  const nav = navigator as Navigator & { deviceMemory?: number }
  return {
    webgl,
    isMobile: window.matchMedia?.('(pointer: coarse)').matches ?? false,
    hardwareConcurrency: nav.hardwareConcurrency ?? 4,
    deviceMemory: nav.deviceMemory,
  }
}
