import { useState } from 'react'
import { t, type DictKey, type Lang } from '../../i18n/dictionary'
import { savedHoursPerWeek } from './automation'

const RULES = [0, 1, 2, 3] as const

export function AutomationDemo({ lang }: { lang: Lang }) {
  const [active, setActive] = useState([true, true, false, true])
  const [done, setDone] = useState(false)
  const rules = active.map((a) => ({ active: a }))

  return (
    <div className="flex flex-col gap-2">
      {RULES.map((i) => (
        <button
          key={i}
          type="button"
          role="switch"
          aria-checked={active[i]}
          onClick={() => setActive((s) => s.map((v, j) => (j === i ? !v : v)))}
          className="crystal-row flex min-h-[52px] items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 text-left"
        >
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold">{t(lang, `auto.rule${i}.title` as DictKey)}</span>
            <span className="block truncate text-[11px] font-medium opacity-75">
              {t(lang, `auto.rule${i}.sub` as DictKey)}
            </span>
          </span>
          <span
            className={`relative h-[25px] w-[46px] shrink-0 rounded-full p-0.5 transition ${
              active[i] ? 'bg-emerald-500' : 'bg-black/15'
            }`}
          >
            <span
              className={`block h-[21px] w-[21px] rounded-full bg-white shadow transition-transform ${
                active[i] ? 'translate-x-[21px]' : ''
              }`}
            />
          </span>
        </button>
      ))}
      <div className="mt-1 flex items-center justify-between gap-3">
        <span aria-live="polite" className="text-[11px] font-semibold opacity-80">
          {done
            ? t(lang, 'auto.done')
            : `${t(lang, 'auto.saved')}: ${savedHoursPerWeek(rules)} ${t(lang, 'auto.perWeek')}`}
        </span>
        <button
          type="button"
          onClick={() => setDone(true)}
          className="crystal-row min-h-[44px] shrink-0 rounded-full px-4 py-2 text-xs font-bold"
        >
          {t(lang, 'auto.run')}
        </button>
      </div>
    </div>
  )
}
