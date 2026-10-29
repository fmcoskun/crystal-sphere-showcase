# CrystalCore — Crystal Sphere Showcase

A skills showcase for a fictional product: a physically based glass sphere (React + Three.js) that springs into a glass control panel with four live micro-demos. Turkish and English, desktop and phone.


## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest
npm run build      # typecheck + production build into dist/
```

Requires Node 20.11+ (jsdom is pinned to 26 and Vite to 6 for that floor).

Dev-only flag: `?renderer=css` or `?renderer=webgl` forces a sphere renderer.

## How it fits together

| Area | Files |
| --- | --- |
| Stage state machine (orb → list → detail) | `src/state/stage.ts`, `src/Stage.tsx` |
| WebGL sphere, lights, caustic floor | `src/scene/CrystalScene.tsx`, `CrystalSphere.tsx`, `Lights.tsx`, `CausticFloor.tsx` |
| Renderer choice, quality tiers, context-loss fallback | `src/scene/SphereHost.tsx`, `src/scene/quality.ts` |
| Pure CSS fallback sphere (from the prototype) | `src/fallback/` |
| Pointer / touch / tilt light mapping | `src/scene/input.ts`, `useLightOffset.ts` |
| Glass panel, module list, micro-demos | `src/panel/` |
| Language, theme, studio sliders | `src/i18n/`, `src/ui/` |

## Build output (2026-10-30)

| Chunk | Size | gzip |
| --- | --- | --- |
| `index.js` (React, Motion, app) | 394 kB | 127 kB |
| `CrystalScene.js` (three, r3f, drei — lazy) | 1003 kB | 275 kB |
| `index.css` | 33 kB | 6.7 kB |

The WebGL chunk is not preloaded; the CSS sphere shows while it loads.

## Verification status

- Unit tests: 47 passing (logic, state, i18n, panel flow, fallbacks).
- Checked in a desktop browser (800×600) and a 375×812 mobile emulation: sphere, caustic, panel spring, four demos, dark theme, studio sliders.
- **Not yet checked:** a real mid-range phone (frame rate, iOS tilt permission prompt), and `prefers-reduced-motion` in a real browser.
- **Not deployed.** `dist/` is a static site; Vercel or Netlify can serve it as-is once an account is connected.
