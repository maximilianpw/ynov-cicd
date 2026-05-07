import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import { RegistrationForm } from './RegistrationForm'

vi.mock('sonner', () => ({
  toast: vi.fn(),
}))

vi.mock('./ui/calendar.tsx', () => ({
  Calendar: ({ onSelect }: { onSelect?: (date?: Date) => void }) => (
    <div>
      <button
        type="button"
        onClick={() => onSelect?.(new Date('1998-04-12T00:00:00.000Z'))}
      >
        Choose birth date
      </button>
      <button type="button" onClick={() => onSelect?.(undefined)}>
        Clear birth date
      </button>
    </div>
  ),
}))

function fillValidTextFields() {
  fireEvent.change(screen.getByLabelText(/^nom$/i), {
    target: { value: 'Pinder-White' },
  })
  fireEvent.change(screen.getByLabelText(/prénom/i), {
    target: { value: 'Max' },
  })
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: 'max.pinder-white@example.com' },
  })
  fireEvent.change(screen.getByLabelText(/ville/i), {
    target: { value: 'Lyon' },
  })
  fireEvent.change(screen.getByLabelText(/code postal/i), {
    target: { value: '69001' },
  })
}

describe('RegistrationForm', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows validation errors and does not save when the form is empty', () => {
    render(<RegistrationForm />)

    fireEvent.click(screen.getByRole('button', { name: /sauvegarder/i }))

    expect(screen.getByText('Le nom est invalide.')).toBeInTheDocument()
    expect(screen.getByText('Le prénom est invalide.')).toBeInTheDocument()
    expect(screen.getByText("L'email est invalide.")).toBeInTheDocument()
    expect(
      screen.getByText('Vous devez avoir au moins 18 ans.'),
    ).toBeInTheDocument()
    expect(screen.getByText('La ville est invalide.')).toBeInTheDocument()
    expect(
      screen.getByText('Le code postal doit contenir 5 chiffres.'),
    ).toBeInTheDocument()
    expect(toast).not.toHaveBeenCalled()
  })

  it('only shows errors for fields that have been touched', () => {
    render(<RegistrationForm />)

    fireEvent.blur(screen.getByLabelText(/^nom$/i))

    expect(screen.getByText('Le nom est invalide.')).toBeInTheDocument()
    expect(screen.queryByText('Le prénom est invalide.')).not.toBeInTheDocument()
    expect(screen.queryByText("L'email est invalide.")).not.toBeInTheDocument()
  })

  it('refreshes validation errors when a touched field changes', () => {
    render(<RegistrationForm />)

    fireEvent.blur(screen.getByLabelText(/^nom$/i))
    fireEvent.change(screen.getByLabelText(/^nom$/i), {
      target: { value: 'Pinder-White' },
    })

    expect(screen.queryByText('Le nom est invalide.')).not.toBeInTheDocument()
  })

  it('refreshes validation errors when a field with an error changes', () => {
    render(<RegistrationForm />)

    fireEvent.click(screen.getByRole('button', { name: /sauvegarder/i }))
    fireEvent.change(screen.getByLabelText(/^nom$/i), {
      target: { value: 'Pinder-White' },
    })

    expect(screen.queryByText('Le nom est invalide.')).not.toBeInTheDocument()
    expect(screen.getByText('Le prénom est invalide.')).toBeInTheDocument()
  })

  it('saves and resets the form after a valid submission', () => {
    render(<RegistrationForm />)

    fillValidTextFields()
    fireEvent.click(screen.getByRole('button', { name: /choose birth date/i }))
    fireEvent.click(screen.getByRole('button', { name: /sauvegarder/i }))

    expect(toast).toHaveBeenCalledWith('Inscription sauvegardée avec succès.')
    expect(screen.getByLabelText(/^nom$/i)).toHaveValue('')
    expect(screen.getByLabelText(/prénom/i)).toHaveValue('')
    expect(screen.getByLabelText(/email/i)).toHaveValue('')
    expect(screen.getByLabelText(/ville/i)).toHaveValue('')
    expect(screen.getByLabelText(/code postal/i)).toHaveValue('')
  })

  it('validates again after clearing the selected birth date', () => {
    render(<RegistrationForm />)

    fillValidTextFields()
    fireEvent.click(screen.getByRole('button', { name: /choose birth date/i }))
    fireEvent.click(screen.getByRole('button', { name: /clear birth date/i }))
    fireEvent.click(screen.getByRole('button', { name: /sauvegarder/i }))

    expect(
      screen.getByText('Vous devez avoir au moins 18 ans.'),
    ).toBeInTheDocument()
    expect(toast).not.toHaveBeenCalled()
  })
})
