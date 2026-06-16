import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Home } from './routes'

vi.mock('./lib/users-api.ts', () => ({
  fetchUsers: vi.fn(() => Promise.resolve([])),
}))

describe('Vitest + React Testing Library', () => {
  it('renders the home page and registration form', () => {
    render(<Home />)
    expect(
      screen.getByRole('heading', { name: /inscriptions/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: /informations personnelles/i }),
    ).toBeInTheDocument()
  })
})
