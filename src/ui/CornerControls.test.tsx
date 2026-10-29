import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, test, vi } from 'vitest'
import { CornerControls } from './CornerControls'
import { useAppState } from './useAppState'
import { t } from '../i18n/dictionary'
import { DEFAULT_OPTICS } from '../state/optics'

function setup() {
  const handlers = { onLang: vi.fn(), onTheme: vi.fn(), onOptics: vi.fn() }
  render(<CornerControls lang="tr" theme="light" optics={DEFAULT_OPTICS} {...handlers} />)
  return handlers
}

test('the language button switches to the other language', async () => {
  const h = setup()
  await userEvent.click(screen.getByRole('button', { name: t('tr', 'ui.lang') }))
  expect(h.onLang).toHaveBeenCalledWith('en')
})

test('the theme button switches to dark', async () => {
  const h = setup()
  await userEvent.click(screen.getByRole('button', { name: t('tr', 'ui.theme') }))
  expect(h.onTheme).toHaveBeenCalledWith('dark')
})

test('studio sliders are hidden until studio mode opens, with prototype defaults', async () => {
  setup()
  expect(screen.queryAllByRole('slider')).toHaveLength(0)
  await userEvent.click(screen.getByRole('button', { name: t('tr', 'ui.studio') }))
  const values = screen.getAllByRole('slider').map((s) => (s as HTMLInputElement).value)
  expect(values).toEqual(['45', '100', '100'])
})

test('moving the angle slider past its range reports a clamped value', async () => {
  const h = setup()
  await userEvent.click(screen.getByRole('button', { name: t('tr', 'ui.studio') }))
  fireEvent.change(screen.getByRole('slider', { name: t('tr', 'ui.studio.angle') }), { target: { value: '80' } })
  expect(h.onOptics).toHaveBeenCalledWith({ ...DEFAULT_OPTICS, angle: 75 })
})

test('useAppState applies theme colour and document language', () => {
  const { result } = renderHook(() => useAppState())
  act(() => result.current.setTheme('dark'))
  expect(document.documentElement.style.getPropertyValue('--studio-bg')).toBe('#4e4e4b')
  act(() => result.current.setLang('tr'))
  expect(document.documentElement.lang).toBe('tr')
})
