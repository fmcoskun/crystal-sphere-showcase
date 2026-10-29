export interface PerfStats {
  cpu: number
  ram: number
  iops: number
  latencyMs: number
}

export function perfStats(turbo: boolean): PerfStats {
  return turbo
    ? { cpu: 16, ram: 22, iops: 152400, latencyMs: 0.4 }
    : { cpu: 44, ram: 58, iops: 64200, latencyMs: 1.2 }
}
