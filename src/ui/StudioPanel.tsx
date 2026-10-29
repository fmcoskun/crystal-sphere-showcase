import { t, type DictKey, type Lang } from '../i18n/dictionary'
import { clampOptics, type Optics } from '../state/optics'

const SLIDERS: { key: keyof Optics; label: DictKey; min: number; max: number }[] = [
  { key: 'angle', label: 'ui.studio.angle', min: 15, max: 75 },
  { key: 'caustic', label: 'ui.studio.caustic', min: 30, max: 100 },
  { key: 'glare', label: 'ui.studio.glare', min: 50, max: 135 },
]

export function StudioPanel({
  lang,
  optics,
  onOptics,
}: {
  lang: Lang
  optics: Optics
  onOptics: (o: Optics) => void
}) {
  return (
    <div className="crystal-surface mt-2 flex w-64 flex-col gap-3 rounded-3xl p-4 text-xs font-semibold">
      {SLIDERS.map((s) => (
        <label key={s.key} className="flex flex-col gap-1">
          <span className="flex justify-between">
            <span>{t(lang, s.label)}</span>
            <span className="font-mono">
              {optics[s.key]}
              {s.key === 'angle' ? '°' : ''}
            </span>
          </span>
          <input
            type="range"
            aria-label={t(lang, s.label)}
            min={s.min}
            max={s.max}
            value={optics[s.key]}
            onChange={(e) => onOptics(clampOptics({ ...optics, [s.key]: Number(e.target.value) }))}
            className="w-full cursor-pointer accent-neutral-900"
          />
        </label>
      ))}
    </div>
  )
}
