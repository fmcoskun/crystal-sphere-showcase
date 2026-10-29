import { render, screen } from '@testing-library/react'
import App from './App'

// three.js cannot load in jsdom under Node 20.11 (ESM require); the scene is verified in a real browser.
vi.mock('./scene/CrystalScene', () => ({ default: () => null }))

test('renders a main landmark', () => {
  render(<App />)
  expect(screen.getByRole('main')).toBeInTheDocument()
})
