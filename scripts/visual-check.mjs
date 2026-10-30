// Visual checks against a running dev/preview server, driven over the Chrome DevTools Protocol.
// No dependencies: needs Node 22+ (global WebSocket; on Node 20 run with --experimental-websocket)
// and a local Chrome (CHROME_PATH overrides the lookup).
//
//   node scripts/visual-check.mjs [--url http://localhost:5173] [--size 1280x800,390x844]
//     [--query renderer=css] [--check panel|bg|tone|all] [--theme light|dark] [--open] [--shot <dir>]
//
// panel: the dialog keeps the same width and height on all four module tabs (±1 px), and the
//        previous demo is gone 60 ms after a tab switch (no overlapping text).
// bg:    the studio background in two screen corners is the theme colour (±3 per channel);
//        with --open, also the lower left, where a caustic left behind by the parked sphere would show.
// tone:  the sphere's inside looks the same at tier 0 (no postprocessing) and tier 1 (±3); dev server only.
// Prints one JSON line per result and exits 1 if any check fails.
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const args = process.argv.slice(2)
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? fallback : args[i + 1]
}
const flag = (name) => args.includes(`--${name}`)

const base = opt('url', 'http://localhost:5173')
const sizes = opt('size', '1280x800').split(',').map((s) => s.split('x').map(Number))
const query = opt('query', '')
const check = opt('check', 'all')
const theme = opt('theme', 'light')
const open = flag('open')
const shotDir = opt('shot', null)

const THEME_HEX = { light: '#94938f', dark: '#4e4e4b' }
// English labels from src/i18n/dictionary.ts; the script pins the language to English first.
const LABEL = { trigger: 'Open the system modules', theme: 'Switch theme' }

const chromePath = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((p) => p && existsSync(p))
if (!chromePath) throw new Error('Chrome not found; set CHROME_PATH')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const profile = mkdtempSync(join(tmpdir(), 'visual-check-'))
const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=0',
  `--user-data-dir=${profile}`,
  '--enable-unsafe-swiftshader',
  '--hide-scrollbars',
  'about:blank',
])

async function connect() {
  const portFile = join(profile, 'DevToolsActivePort')
  for (let i = 0; i < 100 && !existsSync(portFile); i++) await sleep(100)
  const port = readFileSync(portFile, 'utf8').split('\n')[0]
  const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json()
  const ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl)
  await new Promise((r, j) => ((ws.onopen = r), (ws.onerror = j)))
  let id = 0
  const pending = new Map()
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data)
    if (d.id && pending.has(d.id)) pending.get(d.id)(d)
  }
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const i = ++id
      pending.set(i, (d) => (d.error ? reject(new Error(`${method}: ${d.error.message}`)) : resolve(d.result)))
      ws.send(JSON.stringify({ id: i, method, params }))
    })
  const ev = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? expression)
    return r.result.value
  }
  return { ws, send, ev }
}

const click = (selector) => `(() => { const el = document.querySelector(${JSON.stringify(selector)});
  if (!el) throw new Error('missing ' + ${JSON.stringify(selector)}); el.click() })()`

async function averageColor(send, ev, x, y, n = 9) {
  const { data } = await send('Page.captureScreenshot', { format: 'png', clip: { x, y, width: n, height: n, scale: 1 } })
  return ev(`new Promise((resolve) => { const img = new Image(); img.onload = () => {
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
    const s = [0, 0, 0]; for (let i = 0; i < d.length; i += 4) { s[0] += d[i]; s[1] += d[i + 1]; s[2] += d[i + 2] }
    const k = d.length / 4; resolve(s.map((v) => Math.round(v / k))) }; img.src = 'data:image/png;base64,${data}' })`)
}

// The app ignores input while the panel spring runs, so a click is repeated until `until` matches.
async function clickUntil(ev, selector, until, timeoutMs = 4000) {
  const end = Date.now() + timeoutMs
  while (Date.now() < end) {
    if (await ev(`!!document.querySelector(${JSON.stringify(selector)})`)) await ev(click(selector))
    await sleep(400)
    if (await ev(`!!document.querySelector(${JSON.stringify(until)})`)) return
  }
  throw new Error(`clicking ${selector} never produced ${until}`)
}

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

let failed = false
const report = (r) => {
  if (!r.ok) failed = true
  console.log(JSON.stringify(r))
}

const { ws, send, ev } = await connect()

async function load(w, h, q) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 600 })
  await send('Page.navigate', { url: base })
  await sleep(800)
  await ev(`localStorage.setItem('lang', 'en')`)
  await send('Page.navigate', { url: `${base}/${q ? `?${q}` : ''}` })
  // The WebGL chunk loads lazily and the first frames compile shaders.
  await sleep(5000)
  if (theme === 'dark') {
    await ev(click(`button[aria-label="${LABEL.theme}"]`))
    await sleep(1500)
  }
}

const withTier = (t) => [query, `tier=${t}`].filter(Boolean).join('&')
const close = (a, b) => a.every((v, i) => Math.abs(v - b[i]) <= 3)

try {
  for (const [w, h] of sizes) {
    const size = `${w}x${h}`

    if (check === 'tone') {
      const spots = [[w / 2 - 4, h / 2 - 4], [w / 2 + 40, h / 2 - 60]].map(([x, y]) => [Math.round(x), Math.round(y)])
      const seen = {}
      for (const t of [0, 1]) {
        await load(w, h, withTier(t))
        seen[t] = []
        for (const [x, y] of spots) seen[t].push(await averageColor(send, ev, x, y))
      }
      const ok = seen[0].every((c, i) => close(c, seen[1][i]))
      report({ check: 'tone', size, query, theme, spots, tier0: seen[0], tier1: seen[1], ok })
      continue
    }

    await load(w, h, query)

    if (check === 'bg' || check === 'all') {
      const want = hexToRgb(THEME_HEX[theme])
      for (const [x, y] of [[16, 16], [w - 25, h - 25]]) {
        const got = await averageColor(send, ev, x, y)
        const ok = close(got, want)
        const tier = await ev(`document.querySelector('[data-tier]')?.dataset.tier ?? null`)
        report({ check: 'bg', size, query, theme, tier, at: [x, y], want, got, ok })
      }
    }

    if (check === 'panel' || check === 'all' || open) {
      await clickUntil(ev, `button[aria-label="${LABEL.trigger}"]`, '[role=dialog]')
      await sleep(700)
    }

    if (open && (check === 'bg' || check === 'all')) {
      // Sample left of the panel; on narrow screens the panel spans the width and there is nothing to see.
      const left = await ev(`document.querySelector('[role=dialog]').getBoundingClientRect().left`)
      if (left < 60) {
        report({ check: 'bg-open', size, query, theme, skipped: 'panel spans the width', ok: true })
      } else {
        const at = [Math.round(Math.min(w * 0.2, left / 2)), Math.round(h * 0.82)]
        const want = hexToRgb(THEME_HEX[theme])
        const got = await averageColor(send, ev, ...at)
        report({ check: 'bg-open', size, query, theme, at, want, got, ok: close(got, want) })
      }
    }

    if (check === 'panel' || check === 'all') {
      await clickUntil(ev, '[role=dialog] button.w-full', '[role=tab]')
      await sleep(700)
      const boxes = []
      let leaked = 0
      for (let i = 0; i < 4; i++) {
        await ev(`document.querySelectorAll('[role=tab]')[${i}].click()`)
        // Right after the switch the old demo must already be gone: any of its elements still painted
        // (visible and not under a fully transparent slot) overlaps the new demo's text.
        await sleep(60)
        leaked += await ev(`[...document.querySelectorAll('[data-testid=demo-slot][inert]')]
          .filter((s) => getComputedStyle(s).opacity !== '0')
          .flatMap((s) => [...s.querySelectorAll('*')])
          .filter((e) => getComputedStyle(e).visibility === 'visible').length`)
        await sleep(640)
        boxes.push(
          await ev(`(() => { const r = document.querySelector('[role=dialog]').getBoundingClientRect();
            return [Math.round(r.width), Math.round(r.height)] })()`),
        )
      }
      const spread = (k) => Math.max(...boxes.map((b) => b[k])) - Math.min(...boxes.map((b) => b[k]))
      report({ check: 'panel', size, query, boxes, leaked, ok: spread(0) <= 1 && spread(1) <= 1 && leaked === 0 })
    }

    if (shotDir) {
      mkdirSync(shotDir, { recursive: true })
      const { data } = await send('Page.captureScreenshot', { format: 'png' })
      const name = `${size}-${theme}${open ? '-open' : ''}${query ? `-${query.replace(/[^a-z0-9=]+/gi, '_')}` : ''}.png`
      writeFileSync(join(shotDir, name), Buffer.from(data, 'base64'))
      console.log(JSON.stringify({ shot: join(shotDir, name) }))
    }
  }
} finally {
  ws.close()
  chrome.kill()
  await sleep(300)
  try {
    rmSync(profile, { recursive: true, force: true })
  } catch {
    // Chrome may still hold the profile on Windows; it lives in the OS temp dir.
  }
}
process.exit(failed ? 1 : 0)
