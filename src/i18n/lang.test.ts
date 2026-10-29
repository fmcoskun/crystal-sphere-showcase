import { afterEach, expect, test, vi } from 'vitest'
import { detectLang, loadLang, saveLang } from './lang'

afterEach(() => vi.restoreAllMocks())

test('detects Turkish from the browser language', () => {
  expect(detectLang('tr-TR', null)).toBe('tr')
})

test('falls back to English for unsupported browser languages', () => {
  expect(detectLang('de-DE', null)).toBe('en')
})

test('a stored choice wins over the browser language', () => {
  expect(detectLang('tr-TR', 'en')).toBe('en')
})

test('falls back to English when no language is known', () => {
  expect(detectLang(undefined, null)).toBe('en')
})

test('saveLang does not throw when storage is unavailable', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('denied')
  })
  expect(() => saveLang('tr')).not.toThrow()
})

test('loadLang falls back to the browser language when storage throws', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('denied')
  })
  vi.spyOn(navigator, 'language', 'get').mockReturnValue('tr-TR')
  expect(loadLang()).toBe('tr')
})
