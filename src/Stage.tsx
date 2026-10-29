import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { MODULES } from './content/modules'
import { t, type Lang } from './i18n/dictionary'
import { GlassPanel } from './panel/GlassPanel'
import { ModuleList } from './panel/ModuleList'
import { SphereHost } from './scene/SphereHost'
import { useLightOffset } from './scene/useLightOffset'
import { stageReducer, type Stage as StageState, type StageEvent } from './state/stage'
import type { Optics } from './state/optics'
import type { Theme } from './state/theme'

export const SPRING_MS = 650

interface Props {
  lang: Lang
  theme: Theme
  optics: Optics
  forceRenderer?: 'webgl' | 'css'
}

export function Stage({ lang, theme, optics, forceRenderer }: Props) {
  const [state, setState] = useState<StageState>({ view: 'orb' })
  const stateRef = useRef(state)
  const locked = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { offset, enableTilt } = useLightOffset()

  const send = useCallback((e: StageEvent) => {
    if (locked.current) return
    const prev = stateRef.current
    const next = stageReducer(prev, e)
    if (next === prev) return
    // Opening/closing the panel runs the spring; ignore input until it settles.
    if ((prev.view === 'orb') !== (next.view === 'orb')) {
      locked.current = setTimeout(() => {
        locked.current = null
      }, SPRING_MS)
    }
    stateRef.current = next
    setState(next)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') send({ type: 'CLOSE' })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [send])

  useEffect(
    () => () => {
      if (locked.current) clearTimeout(locked.current)
    },
    [],
  )

  const open = state.view !== 'orb'

  return (
    <main data-theme={theme} className="fixed inset-0 overflow-hidden">
      <SphereHost
        theme={theme}
        optics={optics}
        presence={open ? 'away' : 'full'}
        light={offset}
        forceRenderer={forceRenderer}
      />

      {!open && (
        <div className="absolute inset-x-0 bottom-[10vh] flex justify-center">
          <button
            type="button"
            aria-label={t(lang, 'trigger.open')}
            onClick={() => {
              void enableTilt()
              send({ type: 'OPEN' })
            }}
            className="crystal-row flex min-h-[44px] items-center gap-3 rounded-full px-5 py-2.5 text-sm font-bold"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-900" />
            {t(lang, 'trigger.label')}
          </button>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-4 pt-[18vh] sm:items-center">
        <AnimatePresence>
          {open && (
            <GlassPanel
              label={t(lang, 'panel.title')}
              closeLabel={t(lang, 'panel.close')}
              onClose={() => send({ type: 'CLOSE' })}
            >
              {state.view === 'list' && (
                <ModuleList lang={lang} onSelect={(id) => send({ type: 'SELECT', module: id })} />
              )}
              {state.view === 'detail' && (
                <div>
                  <button
                    type="button"
                    onClick={() => send({ type: 'BACK' })}
                    className="crystal-row min-h-[44px] rounded-full px-4 py-1.5 text-xs font-bold"
                  >
                    ← {t(lang, 'panel.back')}
                  </button>
                  <h2 className="mt-3 text-xl font-bold">
                    {t(lang, MODULES.find((m) => m.id === state.module)!.nameKey)}
                  </h2>
                </div>
              )}
            </GlassPanel>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
