// Bundle budget for dist/assets (gzip). Run after `vite build`; exits 1 when over budget.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const KB = 1024
const BUDGET = {
  // Everything the first paint needs: React and Vite helpers (vendor chunk), Motion, the app and the CSS sphere.
  initial: 135 * KB,
  // The lazy WebGL stack, reached only through the CrystalScene import.
  scene: 380 * KB,
}
const INITIAL_CHUNKS = /^(index|vendor)-/
const SCENE_CHUNKS = /^(three|r3f|post|CrystalScene)-/

const dir = 'dist/assets'
const rows = readdirSync(dir)
  .filter((f) => f.endsWith('.js'))
  .map((f) => ({ file: f, gzip: gzipSync(readFileSync(join(dir, f))).length }))
  .sort((a, b) => b.gzip - a.gzip)

const initial = rows.filter((r) => INITIAL_CHUNKS.test(r.file)).reduce((s, r) => s + r.gzip, 0)
const scene = rows.filter((r) => SCENE_CHUNKS.test(r.file)).reduce((s, r) => s + r.gzip, 0)
const kb = (n) => `${(n / KB).toFixed(1)} kB`

for (const r of rows) console.log(`${r.file.padEnd(36)} ${kb(r.gzip).padStart(10)}`)
console.log(`\ninitial ${kb(initial)} / ${kb(BUDGET.initial)}`)
console.log(`scene   ${kb(scene)} / ${kb(BUDGET.scene)}`)

const over = initial > BUDGET.initial || scene > BUDGET.scene
if (over) console.error('\nBundle over budget.')
process.exit(over ? 1 : 0)
