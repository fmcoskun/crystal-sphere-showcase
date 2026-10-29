import { useCallback, useEffect, useState } from 'react'
import type { Lang } from '../i18n/dictionary'
import { loadLang, saveLang } from '../i18n/lang'
import { clampOptics, DEFAULT_OPTICS, type Optics } from '../state/optics'
import { THEME_COLORS, type Theme } from '../state/theme'

export function useAppState() {
  const [lang, setLangState] = useState<Lang>(loadLang)
  const [theme, setTheme] = useState<Theme>('light')
  const [optics, setOpticsState] = useState<Optics>(DEFAULT_OPTICS)

  const setLang = useCallback((l: Lang) => {
    saveLang(l)
    setLangState(l)
  }, [])

  const setOptics = useCallback((o: Optics) => setOpticsState(clampOptics(o)), [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    document.documentElement.style.setProperty('--studio-bg', THEME_COLORS[theme].bg)
    document.documentElement.dataset.theme = theme
  }, [theme])

  return { lang, setLang, theme, setTheme, optics, setOptics }
}
