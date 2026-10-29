import type { Lang } from './dictionary'
export type { Lang }

const STORAGE_KEY = 'lang'

export function detectLang(navLang: string | undefined, stored: string | null): Lang {
  if (stored === 'tr' || stored === 'en') return stored
  return navLang?.toLowerCase().startsWith('tr') ? 'tr' : 'en'
}

export function loadLang(): Lang {
  let stored: string | null = null
  try {
    stored = localStorage.getItem(STORAGE_KEY)
  } catch {
    // storage unavailable (private mode); fall back to browser language
  }
  return detectLang(navigator.language, stored)
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // storage unavailable; the choice just won't persist
  }
}
