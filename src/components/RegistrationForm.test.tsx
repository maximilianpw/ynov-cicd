import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import { registrationsStorageKey } from '#/lib/registrations-storage'
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
      <button
        type="button"
        onClick={() => onSelect?.(new Date('2012-04-12T00:00:00.000Z'))}
      >
        Choose underage birth date
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
    window.localStorage.clear()
  })

  it('keeps save disabled until every field is filled', () => {
    render(<RegistrationForm />)
    const saveButton = screen.getByRole('button', { name: /sauvegarder/i })

    expect(saveButton).toBeDisabled()

    fillValidTextFields()

    expect(saveButton).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: /choose birth date/i }))

    expect(saveButton).toBeEnabled()
  })

  it('shows touched field validation errors in red', () => {
    render(<RegistrationForm />)

    fireEvent.blur(screen.getByLabelText(/^nom$/i))
    fireEvent.blur(screen.getByLabelText(/prénom/i))
    fireEvent.blur(screen.getByLabelText(/email/i))
    fireEvent.blur(screen.getByLabelText(/ville/i))
    fireEvent.blur(screen.getByLabelText(/code postal/i))

    expect(screen.getByText('Le nom est invalide.')).toBeInTheDocument()
    expect(screen.getByText('Le prénom est invalide.')).toBeInTheDocument()
    expect(screen.getByText("L'email est invalide.")).toBeInTheDocument()
    expect(screen.getByText('La ville est invalide.')).toBeInTheDocument()
    expect(
      screen.getByText('Le code postal doit contenir 5 chiffres.'),
    ).toBeInTheDocument()

    for (const alert of screen.getAllByRole('alert')) {
      expect(alert).toHaveClass('text-destructive')
    }
  })

  it('only shows errors for fields that have been touched', () => {
    render(<RegistrationForm />)

    fireEvent.blur(screen.getByLabelText(/^nom$/i))

    expect(screen.getByText('Le nom est invalide.')).toBeInTheDocument()
    expect(
      screen.queryByText('Le prénom est invalide.'),
    ).not.toBeInTheDocument()
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

  it('shows all errors and does not save when filled fields are invalid', () => {
    render(<RegistrationForm />)

    fireEvent.change(screen.getByLabelText(/^nom$/i), {
      target: { value: 'Pinder2' },
    })
    fireEvent.change(screen.getByLabelText(/prénom/i), {
      target: { value: 'Max!' },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'max.pinder-white.example.com' },
    })
    fireEvent.change(screen.getByLabelText(/ville/i), {
      target: { value: 'Lyon3' },
    })
    fireEvent.change(screen.getByLabelText(/code postal/i), {
      target: { value: '6900A' },
    })
    fireEvent.click(
      screen.getByRole('button', { name: /choose underage birth date/i }),
    )
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
    expect(screen.getByText('Aucun inscrit.')).toBeInTheDocument()
    expect(toast).not.toHaveBeenCalled()
  })

  it('refreshes validation errors when a field with an error changes', () => {
    render(<RegistrationForm />)

    fireEvent.blur(screen.getByLabelText(/^nom$/i))
    fireEvent.blur(screen.getByLabelText(/prénom/i))
    fireEvent.change(screen.getByLabelText(/^nom$/i), {
      target: { value: 'Pinder-White' },
    })

    expect(screen.queryByText('Le nom est invalide.')).not.toBeInTheDocument()
    expect(screen.getByText('Le prénom est invalide.')).toBeInTheDocument()
  })

  it('saves, persists, lists, and resets the form after a valid submission', () => {
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
    expect(screen.getByRole('button', { name: /sauvegarder/i })).toBeDisabled()
    expect(screen.getByText('Max Pinder-White')).toBeInTheDocument()
    expect(screen.getByText('max.pinder-white@example.com')).toBeInTheDocument()
    expect(screen.getByText(/69001 Lyon/)).toBeInTheDocument()
    expect(
      JSON.parse(localStorage.getItem(registrationsStorageKey) ?? ''),
    ).toEqual([
      {
        name: 'Pinder-White',
        prenom: 'Max',
        email: 'max.pinder-white@example.com',
        dateNaissance: '1998-04-12T00:00:00.000Z',
        ville: 'Lyon',
        codePostal: '69001',
      },
    ])
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

  it('loads saved registrations from localStorage', async () => {
    localStorage.setItem(
      registrationsStorageKey,
      JSON.stringify([
        {
          name: 'Dupont',
          prenom: 'Élise',
          email: 'elise.dupont@example.fr',
          dateNaissance: '1997-02-01T00:00:00.000Z',
          ville: 'Bordeaux',
          codePostal: '33000',
        },
      ]),
    )

    render(<RegistrationForm />)

    expect(await screen.findByText('Élise Dupont')).toBeInTheDocument()
    expect(screen.getByText('elise.dupont@example.fr')).toBeInTheDocument()
  })
})
