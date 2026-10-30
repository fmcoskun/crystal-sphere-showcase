# CrystalCore — Crystal Sphere Showcase

A skills showcase for a fictional product: a physically based glass sphere (React + Three.js) that springs into a glass control panel with four live micro-demos. Turkish and English, desktop and phone.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest
npm run build      # typecheck + production build into dist/ + bundle budget
npm run visual     # visual checks against a running server (see below)
```

Requires Node 20.11+ (jsdom is pinned to 26 and Vite to 6 for that floor).

Dev-only flags: `?renderer=css` or `?renderer=webgl` forces a sphere renderer; `?tier=0`–`3` sets the starting quality tier (the frame meter can still lower it).

### Visual checks

`scripts/visual-check.mjs` drives a local Chrome over the DevTools protocol (no dependencies; Node 22+, `CHROME_PATH` overrides the lookup):

```bash
npm run dev   # or: npm run build && npm run preview  (then --url http://localhost:4173)
npm run visual -- --check all --size 1280x800,390x844          # panel size + studio background
npm run visual -- --query "renderer=webgl&tier=1" --check bg --theme dark
npm run visual -- --open --shot shots/                        # screenshots, panel open
```

- `panel`: the dialog keeps one width and height across the four module tabs.
- `bg`: the studio grey in two corners is the theme colour within ±3 per channel, whatever the tier. With `--open`, also left of the panel, where a caustic left behind by the parked sphere would show.
- `tone`: the inside of the sphere matches between tier 0 (no postprocessing) and tier 1 within ±3. Needs the dev server, since `?tier=` is dev-only.

## How it fits together

| Area | Files |
| --- | --- |
| Stage state machine (orb → list → detail) | `src/state/stage.ts`, `src/Stage.tsx` |
| WebGL sphere, lights, caustic floor | `src/scene/CrystalScene.tsx`, `CrystalSphere.tsx`, `Lights.tsx`, `CausticFloor.tsx` |
| Real caustics (tiers 2–3), liquid surface and pointer ripples | `src/scene/CausticsLayer.tsx`, `src/scene/liquid.ts` |
| Postprocessing and the tone-mapped studio background | `src/scene/Effects.tsx`, `src/scene/toneMap.ts` |
| Renderer choice, quality tiers, context-loss fallback | `src/scene/SphereHost.tsx`, `src/scene/quality.ts` |
| Pure CSS fallback sphere (no WebGL or very weak devices) | `src/fallback/` |
| Pointer / touch / tilt light mapping | `src/scene/input.ts`, `useLightOffset.ts` |
| Glass panel, module list, micro-demos | `src/panel/` |
| Language, theme, studio sliders | `src/i18n/`, `src/ui/` |

## Build output (2026-10-30, gzip by `scripts/check-bundle.mjs`)

| Chunk | gzip | Loaded |
| --- | --- | --- |
| `index.js` (app, Motion) | 56.4 kB | first paint |
| `vendor.js` (React, Vite helpers) | 68.1 kB | first paint |
| `three.js` | 188.4 kB | lazy |
| `r3f.js` (r3f, drei, three-stdlib) | 89.8 kB | lazy |
| `post.js` (postprocessing) | 79.6 kB | lazy |
| `CrystalScene.js` | 3.1 kB | lazy |

Budget: first paint ≤ 135 kB, WebGL stack ≤ 380 kB; `npm run build` fails above either. Only `vendor.js` is preloaded; the CSS sphere shows while the WebGL chunks load.

### Quality tiers

| Tier | DPR | Post | Caustics | Liquid surface |
| --- | --- | --- | --- | --- |
| 0 | 1 | off | fake | off |
| 1 | 1.25 | tone map + SMAA | fake | off |
| 2 | 1.5 | + bloom + grain | real, 512 | on |
| 3 | 2 | + bloom + grain | real, 1024 | on |

Phones start at tier 2, desktops at 3; slow frames step the tier down. Reduced motion turns the liquid surface off at every tier.

## Verification status

- Unit tests: 79 passing (logic, state, i18n, panel flow, focus, fallbacks, frame sampling, tone-map compensation, liquid surface, caustic geometry).
- Visual checks (headless Chrome, production build, 1280×800 and 390×844): panel size fixed across tabs; studio background exact in light and dark at tiers 0, 1 and 3.
- Checked in a desktop browser (800×600) and a 375×812 mobile emulation: sphere, caustic, panel spring, four demos, dark theme, studio sliders.
- Real phone check (2026-10-30, over the LAN dev server): sphere fit, touch drag, smoothness, panel, four demos and corner controls all worked.
- **Not yet checked:** iOS tilt (motion sensors need HTTPS; the LAN test was plain http).
- **Not deployed.** `dist/` is a static site; Vercel or Netlify can serve it as-is once an account is connected.
