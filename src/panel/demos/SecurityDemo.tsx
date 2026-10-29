import { useEffect, useRef, useState } from 'react'
import { t, type DictKey, type Lang } from '../../i18n/dictionary'
import { randomHash } from './security'

const NODES = [0, 1, 2, 3] as const
const SCAN_MS = 550

export function SecurityDemo({ lang }: { lang: Lang }) {
  const [hashes, setHashes] = useState(() => NODES.map(() => randomHash()))
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'done'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const scan = () => {
    setPhase('scanning')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setHashes(NODES.map(() => randomHash()))
      setPhase('done')
    }, SCAN_MS)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="crystal-row rounded-2xl bg-white/40 p-3">
        <div className="text-xs font-bold">{t(lang, 'sec.shield')}</div>
        <div className="text-[11px] font-medium opacity-75">{t(lang, 'sec.shield.sub')}</div>
      </div>
      {NODES.map((i) => (
        <div key={i} className="crystal-row flex items-center justify-between gap-2 rounded-xl px-3.5 py-2 text-xs">
          <span className="truncate font-bold">✓ {t(lang, `sec.node${i}` as DictKey)}</span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="hidden rounded bg-black/15 px-2 py-0.5 font-mono text-[11px] sm:inline">
              {phase === 'scanning' ? t(lang, 'sec.scanning') : hashes[i]}
            </span>
            <span className="rounded-full border border-white bg-white/60 px-2 py-0.5 text-[10px] font-bold">
              {t(lang, 'sec.verified')}
            </span>
          </span>
        </div>
      ))}
      <div className="mt-1 flex items-center justify-between gap-3">
        <span aria-live="polite" className="text-[11px] font-semibold opacity-80">
          {phase === 'scanning' && t(lang, 'sec.scanning')}
          {phase === 'done' && t(lang, 'sec.scanDone')}
        </span>
        <button
          type="button"
          onClick={scan}
          disabled={phase === 'scanning'}
          className="crystal-row min-h-[44px] shrink-0 rounded-full px-4 py-2 text-xs font-bold"
        >
          {t(lang, 'sec.scan')}
        </button>
      </div>
    </div>
  )
}
