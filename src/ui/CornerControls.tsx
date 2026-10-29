import { useState } from 'react'
import { t, type Lang } from '../i18n/dictionary'
import type { Optics } from '../state/optics'
import type { Theme } from '../state/theme'
import { StudioPanel } from './StudioPanel'
import '../panel/glass.css'

interface Props {
  lang: Lang
  theme: Theme
  optics: Optics
  onLang: (l: Lang) => void
  onTheme: (t: Theme) => void
  onOptics: (o: Optics) => void
}

const ICON = 'crystal-row grid h-11 w-11 place-items-center rounded-full text-[11px] font-bold'

export function CornerControls({ lang, theme, optics, onLang, onTheme, onOptics }: Props) {
  const [studio, setStudio] = useState(false)
  return (
    <div className="fixed right-4 top-4 z-20 flex flex-col items-end">
      <div className="flex gap-2">
        <button
          type="button"
          aria-label={t(lang, 'ui.lang')}
          onClick={() => onLang(lang === 'tr' ? 'en' : 'tr')}
          className={ICON}
        >
          {lang === 'tr' ? 'EN' : 'TR'}
        </button>
        <button
          type="button"
          aria-label={t(lang, 'ui.theme')}
          aria-pressed={theme === 'dark'}
          onClick={() => onTheme(theme === 'light' ? 'dark' : 'light')}
          className={ICON}
        >
          <span aria-hidden="true">◐</span>
        </button>
        <button
          type="button"
          aria-label={t(lang, 'ui.studio')}
          aria-expanded={studio}
          onClick={() => setStudio((v) => !v)}
          className={ICON}
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
            <circle cx="16" cy="6" r="2" />
            <circle cx="10" cy="12" r="2" />
            <circle cx="18" cy="18" r="2" />
          </svg>
        </button>
      </div>
      {studio && <StudioPanel lang={lang} optics={optics} onOptics={onOptics} />}
    </div>
  )
}
