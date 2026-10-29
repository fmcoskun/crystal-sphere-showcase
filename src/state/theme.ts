export type Theme = 'light' | 'dark'

export const THEME_COLORS: Record<Theme, { bg: string }> = {
  light: { bg: '#94938f' },
  dark: { bg: '#4e4e4b' },
}
