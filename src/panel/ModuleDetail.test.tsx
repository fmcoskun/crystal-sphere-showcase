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
