import { afterEach, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { savedHoursPerWeek } from './automation'
import { randomHash } from './security'
import { perfStats } from './performance'
import { PLATFORM_COMMANDS, copyText } from './platforms'
import { PlatformsDemo } from './PlatformsDemo'
import { t } from '../../i18n/dictionary'

afterEach(() => vi.restoreAllMocks())

test('saved hours are 3.4 per active rule', () => {
  expect(savedHoursPerWeek([{ active: true }, { active: true }, { active: true }, { active: false }])).toBe('10.2')
  expect(savedHoursPerWeek([{ active: false }])).toBe('0.0')
})

test('randomHash has the 6...4 hex shape', () => {
  expect(randomHash(() => 0.5)).toMatch(/^[0-9a-f]{6}\.\.\.[0-9a-f]{4}$/)
})

test('perfStats returns the turbo and balanced numbers', () => {
  expect(perfStats(true)).toEqual({ cpu: 16, ram: 22, iops: 152400, latencyMs: 0.4 })
  expect(perfStats(false)).toEqual({ cpu: 44, ram: 58, iops: 64200, latencyMs: 1.2 })
})

test('install commands never point at real domains', () => {
  for (const { cmd } of Object.values(PLATFORM_COMMANDS)) {
    expect(cmd).toContain('.example')
    expect(cmd).not.toMatch(/crystalcore\.io|crystal\.io/)
  }
})

function breakClipboard() {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: () => Promise.reject(new Error('denied')) },
    configurable: true,
  })
  document.execCommand = vi.fn(() => false)
}

test('copyText resolves false when every copy path fails', async () => {
  breakClipboard()
  await expect(copyText('x')).resolves.toBe(false)
})

test('the platforms demo tells the user when copying failed', async () => {
  breakClipboard()
  render(<PlatformsDemo lang="en" />)
  await userEvent.click(screen.getByRole('button', { name: t('en', 'demo.copy') }))
  expect(await screen.findByText(t('en', 'demo.copyFailed'))).toBeInTheDocument()
})
