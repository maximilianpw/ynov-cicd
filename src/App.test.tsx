import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Home } from './routes'

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
