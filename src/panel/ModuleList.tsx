import { MODULES, type ModuleId } from '../content/modules'
import { t, type Lang } from '../i18n/dictionary'
import { ModuleIcon } from './ModuleIcon'

export function ModuleList({ lang, onSelect }: { lang: Lang; onSelect: (id: ModuleId) => void }) {
  return (
    <div>
      <h2 className="pr-14 text-xl font-bold tracking-tight sm:text-2xl">{t(lang, 'panel.title')}</h2>
      <p className="mb-4 mt-0.5 text-xs font-medium opacity-75">{t(lang, 'panel.subtitle')}</p>
      <div className="flex flex-col gap-2.5">
        {MODULES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onSelect(m.id)}
            className="crystal-row flex min-h-[60px] w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left"
          >
            <span className="flex min-w-0 items-center gap-3.5">
              <ModuleIcon id={m.id} />
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-bold">{t(lang, m.nameKey)}</span>
                <span className="block truncate text-xs font-medium opacity-75">{t(lang, m.descKey)}</span>
              </span>
            </span>
            <span className="hidden shrink-0 rounded-full border border-white/80 bg-white/50 px-3 py-1 text-[11px] font-bold sm:inline">
              {t(lang, m.badgeKey)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
