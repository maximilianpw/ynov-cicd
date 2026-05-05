import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CountButton, Home } from './components/Home'

describe('Vitest + React Testing Library', () => {
  it('renders the home page and registration form', () => {
    render(<Home />)
    expect(
      screen.getByRole('heading', { name: /welcome to tanstack start/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('group', { name: /informations personnelles/i }),
    ).toBeInTheDocument()
  })

  it('uses the button to increment', () => {
    render(<CountButton />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Clicked 0 times')
    fireEvent.click(button)
    expect(button).toHaveTextContent('Clicked 1 times')
  })
})
