const hex = (n: number, rng: () => number) =>
  Array.from({ length: n }, () => Math.floor(rng() * 16).toString(16)).join('')

export function randomHash(rng: () => number = Math.random): string {
  return `${hex(6, rng)}...${hex(4, rng)}`
}
