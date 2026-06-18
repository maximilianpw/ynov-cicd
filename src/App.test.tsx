import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Documentation } from './routes/documentation'
import { Home } from './routes'

vi.mock('./lib/users-api.ts', () => ({
  createUser: vi.fn(),
  deleteUser: vi.fn(),
  fetchPrivateUser: vi.fn(),
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

  it('links to documentation inside the configured app base path', () => {
    render(<Home />)

    expect(screen.getByRole('link', { name: /documentation/i })).toHaveAttribute(
      'href',
      '/ynov-cicd/documentation',
    )
  })

  it('links back from documentation inside the configured app base path', () => {
    render(<Documentation />)

    expect(
      screen.getByRole('link', { name: /retour au formulaire/i }),
    ).toHaveAttribute('href', '/ynov-cicd/')
  })
})
