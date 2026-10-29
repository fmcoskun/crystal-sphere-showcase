import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test } from 'vitest'
import { Stage, SPRING_MS } from './Stage'
import { t } from './i18n/dictionary'
import { DEFAULT_OPTICS } from './state/optics'
import { MODULES } from './content/modules'

const props = { theme: 'light' as const, optics: DEFAULT_OPTICS, forceRenderer: 'css' as const }

const settle = () => new Promise((r) => setTimeout(r, SPRING_MS + 50))

const opener = (lang: 'en' | 'tr') => screen.getByRole('button', { name: t(lang, 'trigger.open') })

test('clicking the trigger shows the four modules', async () => {
  render(<Stage lang="en" {...props} />)
  await userEvent.click(opener('en'))
  for (const m of MODULES) {
    expect(await screen.findByRole('button', { name: new RegExp(t('en', m.nameKey)) })).toBeInTheDocument()
  }
})

test('the trigger opens with the keyboard', async () => {
  render(<Stage lang="en" {...props} />)
  opener('en').focus()
  await userEvent.keyboard('{Enter}')
  expect(await screen.findByRole('dialog')).toBeInTheDocument()
})

test('the trigger name follows the language', () => {
  render(<Stage lang="tr" {...props} />)
  expect(opener('tr')).toBeInTheDocument()
})

test('Escape closes the panel and brings the trigger back', async () => {
  render(<Stage lang="en" {...props} />)
  fireEvent.click(opener('en'))
  await settle()
  fireEvent.keyDown(window, { key: 'Escape' })
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  expect(opener('en')).toBeInTheDocument()
})

test('events during the spring are ignored, then accepted', async () => {
  render(<Stage lang="en" {...props} />)
  fireEvent.click(opener('en'))
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(await screen.findByRole('dialog')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: t('en', 'trigger.open') })).toBeNull()
  await settle()
  fireEvent.keyDown(window, { key: 'Escape' })
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
})
