import { MODULES, type ModuleId } from '../content/modules'
import { t, type Lang } from '../i18n/dictionary'
import { ModuleIcon } from './ModuleIcon'
import { AutomationDemo } from './demos/AutomationDemo'
import { PerformanceDemo } from './demos/PerformanceDemo'
import { PlatformsDemo } from './demos/PlatformsDemo'
import { SecurityDemo } from './demos/SecurityDemo'

const DEMOS: Record<ModuleId, (p: { lang: Lang }) => React.JSX.Element> = {
  automation: AutomationDemo,
  security: SecurityDemo,
  performance: PerformanceDemo,
  platforms: PlatformsDemo,
}

export function ModuleDetail({
  lang,
  module,
  onSelect,
  onBack,
}: {
  lang: Lang
  module: ModuleId
  onSelect: (id: ModuleId) => void
  onBack: () => void
}) {
  const def = MODULES.find((m) => m.id === module)!
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 pr-14">
        <ModuleIcon id={module} />
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold tracking-tight sm:text-xl">{t(lang, def.nameKey)}</h2>
          <p className="truncate text-xs font-medium opacity-75">{t(lang, def.descKey)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          className="crystal-row min-h-[40px] shrink-0 rounded-full px-3.5 text-xs font-bold"
        >
          ← {t(lang, 'panel.back')}
        </button>
        <div className="grid flex-1 grid-cols-4 gap-1 rounded-2xl border border-white/35 bg-black/10 p-1" role="tablist">
          {MODULES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={m.id === module}
              aria-label={t(lang, m.nameKey)}
              onClick={() => onSelect(m.id)}
              className={`grid min-h-[36px] place-items-center rounded-xl transition ${
                m.id === module ? 'bg-white/75 shadow-sm' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <span className="scale-[0.7]">
                <ModuleIcon id={m.id} />
              </span>
            </button>
          ))}
        </div>
      </div>
      {/* All demos share one grid cell so the panel keeps the tallest demo's height across tabs. */}
      <div className="grid">
        {MODULES.map(({ id }) => {
          const Demo = DEMOS[id]
          const hidden = id !== module
          return (
            <div
              key={id}
              data-testid="demo-slot"
              data-module={id}
              inert={hidden}
              aria-hidden={hidden || undefined}
              // opacity-0 hides the old demo at once: its rows transition `visibility` (inherited from
              // `invisible`) and would otherwise stay painted for ~0.3 s over the new demo.
              className={`[grid-area:1/1] ${hidden ? 'invisible opacity-0' : ''}`}
            >
              <Demo lang={lang} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
