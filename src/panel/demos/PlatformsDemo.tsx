import { useState } from 'react'
import { t, type Lang } from '../../i18n/dictionary'
import { copyText, PLATFORM_COMMANDS, type PlatformId } from './platforms'

const TABS: PlatformId[] = ['linux', 'macos', 'docker', 'api']

export function PlatformsDemo({ lang }: { lang: Lang }) {
  const [tab, setTab] = useState<PlatformId>('linux')
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const cmd = PLATFORM_COMMANDS[tab].cmd

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5" role="tablist">
        {TABS.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => {
              setTab(id)
              setStatus('idle')
            }}
            className={`min-h-[40px] rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              tab === id ? 'border-white bg-white/80 shadow-sm' : 'border-white/30 bg-black/10 opacity-75'
            }`}
          >
            {t(lang, `plat.${id}`)}
          </button>
        ))}
      </div>
      <pre className="whitespace-pre-wrap break-words rounded-xl border border-white/40 bg-neutral-900 p-3 font-mono text-xs text-neutral-100 select-all">
        $ {cmd}
      </pre>
      <div className="flex items-center justify-between gap-2">
        <span aria-live="polite" className="text-[11px] font-semibold opacity-80">
          {status === 'copied' && t(lang, 'demo.copied')}
          {status === 'failed' && t(lang, 'demo.copyFailed')}
        </span>
        <button
          type="button"
          onClick={async () => setStatus((await copyText(cmd)) ? 'copied' : 'failed')}
          className="crystal-row min-h-[44px] rounded-full px-4 py-2 text-xs font-bold"
        >
          {t(lang, 'demo.copy')}
        </button>
      </div>
    </div>
  )
}
