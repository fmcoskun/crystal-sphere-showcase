import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SphereHost } from './SphereHost'
import { DEFAULT_OPTICS } from '../state/optics'

// three.js cannot load in jsdom under Node 20.11; stand in for the WebGL scene.
vi.mock('./CrystalScene', () => ({
  default: (p: { onContextLost: () => void }) => <button onClick={p.onContextLost}>lose-context</button>,
}))

const base = {
  theme: 'light' as const,
  optics: DEFAULT_OPTICS,
  presence: 'full' as const,
  light: { current: { x: 0, y: 0 } },
}

test('forceRenderer css renders the CSS sphere', () => {
  const { container } = render(<SphereHost {...base} forceRenderer="css" />)
  expect(container.querySelector('[data-renderer="css"]')).not.toBeNull()
})

test('webgl renderer falls back to css when the context is lost', async () => {
  const { container } = render(<SphereHost {...base} forceRenderer="webgl" />)
  await userEvent.click(await screen.findByText('lose-context'))
  expect(container.querySelector('[data-renderer="css"]')).not.toBeNull()
})
