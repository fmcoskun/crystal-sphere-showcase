import { expect, test } from 'vitest'
import { t } from '../i18n/dictionary'
import { MODULES } from './modules'

test('there are four modules', () => {
  expect(MODULES).toHaveLength(4)
})

test('every module key has non-empty text in both languages', () => {
  for (const m of MODULES) {
    for (const key of [m.nameKey, m.descKey, m.badgeKey]) {
      expect(t('tr', key).length).toBeGreaterThan(0)
      expect(t('en', key).length).toBeGreaterThan(0)
    }
  }
})
