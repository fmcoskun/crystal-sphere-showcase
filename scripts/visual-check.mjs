// Visual checks against a running dev/preview server, driven over the Chrome DevTools Protocol.
// No dependencies: needs Node 22+ (global WebSocket; on Node 20 run with --experimental-websocket)
// and a local Chrome (CHROME_PATH overrides the lookup).
//
//   node scripts/visual-check.mjs [--url http://localhost:5173] [--size 1280x800,390x844]
//     [--query renderer=css] [--check panel|bg|all] [--theme light|dark] [--open] [--shot <dir>]
//
// panel: the dialog keeps the same width and height on all four module tabs (±1 px).
// bg:    the studio background in two screen corners is the theme colour (±3 per channel).
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

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

let failed = false
const report = (r) => {
  if (!r.ok) failed = true
  console.log(JSON.stringify(r))
}

const { ws, send, ev } = await connect()
try {
  for (const [w, h] of sizes) {
    const size = `${w}x${h}`
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 600 })
    await send('Page.navigate', { url: base })
    await sleep(800)
    await ev(`localStorage.setItem('lang', 'en')`)
    await send('Page.navigate', { url: `${base}/${query ? `?${query}` : ''}` })
    // The WebGL chunk loads lazily and the first frames compile shaders.
    await sleep(5000)
    if (theme === 'dark') {
      await ev(click(`button[aria-label="${LABEL.theme}"]`))
      await sleep(1500)
    }

    if (check === 'bg' || check === 'all') {
      const want = hexToRgb(THEME_HEX[theme])
      for (const [x, y] of [[16, 16], [w - 25, h - 25]]) {
        const got = await averageColor(send, ev, x, y)
        const ok = got.every((v, i) => Math.abs(v - want[i]) <= 3)
        const tier = await ev(`document.querySelector('[data-tier]')?.dataset.tier ?? null`)
        report({ check: 'bg', size, query, theme, tier, at: [x, y], want, got, ok })
      }
    }

    if (check === 'panel' || check === 'all' || open) {
      await ev(click(`button[aria-label="${LABEL.trigger}"]`))
      await sleep(900)
    }

    if (check === 'panel' || check === 'all') {
      await ev(click('[role=dialog] button.w-full'))
      await sleep(900)
      const boxes = []
      for (let i = 0; i < 4; i++) {
        await ev(`document.querySelectorAll('[role=tab]')[${i}].click()`)
        await sleep(700)
        boxes.push(
          await ev(`(() => { const r = document.querySelector('[role=dialog]').getBoundingClientRect();
            return [Math.round(r.width), Math.round(r.height)] })()`),
        )
      }
      const spread = (k) => Math.max(...boxes.map((b) => b[k])) - Math.min(...boxes.map((b) => b[k]))
      report({ check: 'panel', size, query, boxes, ok: spread(0) <= 1 && spread(1) <= 1 })
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
