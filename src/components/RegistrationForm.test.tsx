import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import RegistrationForm from './RegistrationForm'
import { STORAGE_KEY } from '../lib/validators'

const validRegistration = {
  name: 'PINDER-WHITE',
  prenom: 'Maximilian',
  email: 'maximilian@example.com',
  dateNaissance: '2000-01-01',
  ville: 'Saint-Étienne',
  codePostal: '42000',
}

function fillForm(values = validRegistration) {
  fireEvent.change(screen.getByLabelText('Nom'), {
    target: { value: values.name },
  })
  fireEvent.change(screen.getByLabelText('Prénom'), {
    target: { value: values.prenom },
  })
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: values.email },
  })
  fireEvent.change(screen.getByLabelText('Date de naissance'), {
    target: { value: values.dateNaissance },
  })
  fireEvent.change(screen.getByLabelText('Ville'), {
    target: { value: values.ville },
  })
  fireEvent.change(screen.getByLabelText('Code postal'), {
    target: { value: values.codePostal },
  })
}

describe('RegistrationForm', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('désactive le bouton si les champs ne sont pas remplis', () => {
    render(<RegistrationForm />)

    const button = screen.getByRole('button', { name: /sauvegarder/i })
    expect(button).toBeDisabled()

    fillForm()

    expect(button).toBeEnabled()
  })

  it('affiche les erreurs correspondantes en rouge', () => {
    render(<RegistrationForm />)

    fillForm({
      name: 'Dupont1',
      prenom: 'Raphaël!',
      email: 'bad-email',
      dateNaissance: '2010-01-01',
      ville: 'Paris3',
      codePostal: 'ABCDE',
    })
    fireEvent.click(screen.getByRole('button', { name: /sauvegarder/i }))

    const alerts = screen.getAllByRole('alert')
    expect(alerts).toHaveLength(6)
    expect(screen.getByText('Le nom est invalide.')).toHaveClass(
      'text-destructive',
    )
    expect(screen.getByLabelText('Nom')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Le prénom est invalide.')).toBeInTheDocument()
    expect(screen.getByText("L'email est invalide.")).toBeInTheDocument()
    expect(
      screen.getByText('Vous devez avoir au moins 18 ans.'),
    ).toBeInTheDocument()
    expect(screen.getByText('La ville est invalide.')).toBeInTheDocument()
    expect(
      screen.getByText('Le code postal doit contenir 5 chiffres.'),
    ).toBeInTheDocument()
  })

  it('valide au blur et met à jour les erreurs après correction', () => {
    render(<RegistrationForm />)

    const name = screen.getByLabelText('Nom')
    fireEvent.change(name, { target: { value: 'Dupont1' } })
    fireEvent.blur(name)

    expect(screen.getByText('Le nom est invalide.')).toBeInTheDocument()

    fireEvent.change(name, { target: { value: 'Dupont' } })

    expect(screen.queryByText('Le nom est invalide.')).not.toBeInTheDocument()
  })

  it('sauvegarde dans le localStorage, affiche un toaster de succès et vide les champs', () => {
    render(<RegistrationForm />)

    fillForm()
    fireEvent.click(screen.getByRole('button', { name: /sauvegarder/i }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'Inscription sauvegardée avec succès.',
    )
    expect(screen.getByLabelText('Nom')).toHaveValue('')
    expect(screen.getByLabelText('Email')).toHaveValue('')
    expect(
      JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]'),
    ).toEqual([validRegistration])
    expect(
      screen.getByText('Maximilian PINDER-WHITE - maximilian@example.com'),
    ).toBeVisible()
  })

  it('affiche la liste des inscrits depuis le localStorage', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([validRegistration]),
    )

    render(<RegistrationForm />)

    const list = screen.getByRole('list')
    expect(
      within(list).getByText(
        'Maximilian PINDER-WHITE - maximilian@example.com',
      ),
    ).toBeInTheDocument()
  })
})
