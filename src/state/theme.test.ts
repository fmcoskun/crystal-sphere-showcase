import { expect, test } from 'vitest'
import { THEME_COLORS } from './theme'

test('studio backgrounds match the spec', () => {
  expect(THEME_COLORS.light.bg).toBe('#94938f')
  expect(THEME_COLORS.dark.bg).toBe('#4e4e4b')
})
