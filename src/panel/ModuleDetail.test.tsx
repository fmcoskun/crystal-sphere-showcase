import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { expect, test } from 'vitest'
import { t } from '../i18n/dictionary'
import type { ModuleId } from '../content/modules'
import { ModuleDetail } from './ModuleDetail'

const noop = () => {}

test('all four demos stay mounted so the panel keeps the tallest height', () => {
  render(<ModuleDetail lang="en" module="performance" onSelect={noop} onBack={noop} />)
  const slots = screen.getAllByTestId('demo-slot')
  expect(slots).toHaveLength(4)
  const active = slots.filter((s) => !s.hasAttribute('inert'))
  expect(active).toHaveLength(1)
  expect(active[0]).toHaveAttribute('data-module', 'performance')
})

test('hidden demos are inert and hidden from assistive tech', () => {
  render(<ModuleDetail lang="en" module="automation" onSelect={noop} onBack={noop} />)
  const hidden = screen.getAllByTestId('demo-slot').filter((s) => s.dataset.module !== 'automation')
  expect(hidden).toHaveLength(3)
  for (const s of hidden) {
    expect(s).toHaveAttribute('aria-hidden', 'true')
    expect(s).toHaveAttribute('inert')
    expect(s.className).toContain('invisible')
    // visibility is inherited and transitioned by .crystal-row (0.32 s); opacity on the slot is not,
    // so it hides the old demo at once instead of letting it overlap the new one.
    expect(s.className).toContain('opacity-0')
  }
})

function Harness() {
  const [module, setModule] = useState<ModuleId>('automation')
  return <ModuleDetail lang="en" module={module} onSelect={setModule} onBack={noop} />
}

test('switching tabs keeps the demo state (no remount)', async () => {
  render(<Harness />)
  const slot = () => screen.getAllByTestId('demo-slot').find((s) => s.dataset.module === 'automation')!
  const third = within(slot()).getAllByRole('switch')[2]
  expect(third).toHaveAttribute('aria-checked', 'false')
  await userEvent.click(third)
  await userEvent.click(screen.getByRole('tab', { name: t('en', 'module.security.name') }))
  await userEvent.click(screen.getByRole('tab', { name: t('en', 'module.automation.name') }))
  expect(within(slot()).getAllByRole('switch')[2]).toHaveAttribute('aria-checked', 'true')
})

test('the demo column cannot grow past the panel', () => {
  render(<ModuleDetail lang="en" module="platforms" onSelect={noop} onBack={noop} />)
  // A plain grid's auto column grows to its widest item (a long install command) and the panel scrolls sideways.
  expect(screen.getAllByTestId('demo-slot')[0].parentElement!.className).toContain('grid-cols-1')
})

test('install commands wrap instead of scrolling sideways', () => {
  render(<ModuleDetail lang="en" module="platforms" onSelect={noop} onBack={noop} />)
  const slot = screen.getAllByTestId('demo-slot').find((s) => s.dataset.module === 'platforms')!
  const pre = slot.querySelector('pre')!
  expect(pre.className).toContain('whitespace-pre-wrap')
  expect(pre.className).not.toContain('overflow-x-auto')
})

test('active automation rules show a green track', () => {
  render(<ModuleDetail lang="en" module="automation" onSelect={noop} onBack={noop} />)
  const slot = screen.getAllByTestId('demo-slot').find((s) => s.dataset.module === 'automation')!
  const [on, , off] = within(slot).getAllByRole('switch')
  expect(on.lastElementChild!.className).toContain('bg-emerald-500')
  expect(off.lastElementChild!.className).not.toContain('bg-emerald-500')
})
