import { useState } from 'react'
import { t, type Lang } from '../../i18n/dictionary'
import { perfStats } from './performance'

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-bold">
        <span>{label}</span>
        <span className="font-mono">{value}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/20 p-0.5">
        <div
          className="h-full rounded-full bg-white shadow-[0_0_10px_#fff] transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export function PerformanceDemo({ lang }: { lang: Lang }) {
  const [turbo, setTurbo] = useState(false)
  const s = perfStats(turbo)
  const fmt = new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US')

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-2 gap-2.5">
        <div className="crystal-row rounded-2xl p-3">
          <div className="text-[11px] font-semibold opacity-75">{t(lang, 'perf.latency')}</div>
          <div className="mt-0.5 text-xl font-bold">{fmt.format(s.latencyMs)} ms</div>
        </div>
        <div className="crystal-row rounded-2xl p-3">
          <div className="text-[11px] font-semibold opacity-75">{t(lang, 'perf.iops')}</div>
          <div className="mt-0.5 text-xl font-bold">{fmt.format(s.iops)}</div>
        </div>
      </div>
      <div className="flex flex-col gap-3 rounded-2xl border border-white/40 bg-black/10 p-3.5">
        <Bar label={t(lang, 'perf.cpu')} value={s.cpu} />
        <Bar label={t(lang, 'perf.ram')} value={s.ram} />
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          aria-pressed={turbo}
          onClick={() => setTurbo((v) => !v)}
          className="crystal-row min-h-[44px] rounded-full px-4 py-2 text-xs font-bold"
        >
          {t(lang, turbo ? 'perf.turbo.on' : 'perf.turbo.off')}
        </button>
      </div>
    </div>
  )
}
