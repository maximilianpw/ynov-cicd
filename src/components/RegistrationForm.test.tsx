import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import { RegistrationForm } from './RegistrationForm'
import type { PrivateUser, RegisteredUser } from '../lib/users-api'
import type { IRegistrationForm } from '../lib/registration-form.types'

const {
  createUserMock,
  deleteUserMock,
  fetchPrivateUserMock,
  fetchUsersMock,
  toastMock,
} = vi.hoisted(() => {
  const mockedToast = vi.fn() as ReturnType<typeof vi.fn> & {
    error: ReturnType<typeof vi.fn>
  }
  mockedToast.error = vi.fn()
  return {
    createUserMock: vi.fn(),
    deleteUserMock: vi.fn(),
    fetchPrivateUserMock: vi.fn(),
    fetchUsersMock: vi.fn(),
    toastMock: mockedToast,
  }
})

vi.mock('sonner', () => ({
  toast: toastMock,
}))

vi.mock('../lib/users-api.ts', () => ({
  createUser: createUserMock,
  deleteUser: deleteUserMock,
  fetchPrivateUser: fetchPrivateUserMock,
  fetchUsers: fetchUsersMock,
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
      <button type="button" onClick={() => onSelect?.()}>
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
  fireEvent.change(screen.getByLabelText(/^email$/i), {
    target: { value: 'max.pinder-white@example.com' },
  })
  fireEvent.change(screen.getByLabelText(/ville/i), {
    target: { value: 'Lyon' },
  })
  fireEvent.change(screen.getByLabelText(/code postal/i), {
    target: { value: '69001' },
  })
}

function fillAdminCredentials() {
  fireEvent.change(screen.getByLabelText(/email admin/i), {
    target: { value: 'admin@example.com' },
  })
  fireEvent.change(screen.getByLabelText(/mot de passe admin/i), {
    target: { value: 'AdminPassword123!' },
  })
}

function createRegistration(
  overrides: Partial<IRegistrationForm> = {},
): IRegistrationForm {
  return {
    name: 'Pinder-White',
    prenom: 'Max',
    email: 'max.pinder-white@example.com',
    dateNaissance: '1998-04-12T00:00:00.000Z',
    ville: 'Lyon',
    codePostal: '69001',
    ...overrides,
  }
}

function createRegisteredUser(
  overrides: Partial<RegisteredUser> = {},
): RegisteredUser {
  return {
    id: 1,
    name: 'Pinder-White',
    prenom: 'Max',
    email: 'max.pinder-white@example.com',
    ...overrides,
  }
}

function createPrivateUser(overrides: Partial<PrivateUser> = {}): PrivateUser {
  return {
    ...createRegisteredUser(),
    dateNaissance: '1998-04-12',
    ville: 'Lyon',
    codePostal: '69001',
    createdAt: '2026-06-18T08:00:00',
    updatedAt: '2026-06-18T08:00:00',
    ...overrides,
  }
}

function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve
  })

  const rejectablePromise = new Promise<T>((_, promiseReject) => {
    reject = promiseReject
  })

  return { promise, reject, rejectablePromise, resolve }
}

describe('RegistrationForm', () => {
  beforeEach(() => {
    createUserMock.mockReset()
    deleteUserMock.mockReset()
    fetchPrivateUserMock.mockReset()
    fetchUsersMock.mockReset()
    fetchUsersMock.mockResolvedValue([])
    createUserMock.mockResolvedValue(createRegisteredUser())
    deleteUserMock.mockResolvedValue(undefined)
    fetchPrivateUserMock.mockResolvedValue(createPrivateUser())
  })

  afterEach(() => {
    vi.clearAllMocks()
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
    fireEvent.blur(screen.getByLabelText(/^email$/i))
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
    fireEvent.change(screen.getByLabelText(/^email$/i), {
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
    expect(toast.error).toHaveBeenCalledWith(
      'Le formulaire contient des erreurs.',
    )
    expect(createUserMock).not.toHaveBeenCalled()
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

  it('saves through the API, lists the reduced user, and resets the form', async () => {
    createUserMock.mockResolvedValueOnce(createRegisteredUser({ id: 8 }))
    render(<RegistrationForm />)

    fillValidTextFields()
    fireEvent.click(screen.getByRole('button', { name: /choose birth date/i }))
    fireEvent.click(screen.getByRole('button', { name: /sauvegarder/i }))

    await waitFor(() => {
      expect(createUserMock).toHaveBeenCalledWith(createRegistration())
    })
    expect(toast).toHaveBeenCalledWith('Inscription sauvegardée avec succès.')
    expect(screen.getByLabelText(/^nom$/i)).toHaveValue('')
    expect(screen.getByLabelText(/prénom/i)).toHaveValue('')
    expect(screen.getByLabelText(/^email$/i)).toHaveValue('')
    expect(screen.getByLabelText(/ville/i)).toHaveValue('')
    expect(screen.getByLabelText(/code postal/i)).toHaveValue('')
    expect(screen.getByRole('button', { name: /sauvegarder/i })).toBeDisabled()
    expect(screen.getByText('Max Pinder-White')).toBeInTheDocument()
    expect(screen.getByText('max.pinder-white@example.com')).toBeInTheDocument()
    expect(screen.queryByText(/69001 Lyon/)).not.toBeInTheDocument()
  })

  it('shows an API error when a valid submission cannot be saved', async () => {
    createUserMock.mockRejectedValueOnce(new Error('API offline'))
    render(<RegistrationForm />)

    fillValidTextFields()
    fireEvent.click(screen.getByRole('button', { name: /choose birth date/i }))
    fireEvent.click(screen.getByRole('button', { name: /sauvegarder/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "L'inscription n'a pas pu être sauvegardée en base.",
      )
    })
    expect(screen.queryByText('Max Pinder-White')).not.toBeInTheDocument()
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
    expect(createUserMock).not.toHaveBeenCalled()
    expect(toast).not.toHaveBeenCalled()
  })

  it('loads registered users from the backend', async () => {
    fetchUsersMock.mockResolvedValueOnce([
      createRegisteredUser({
        id: 2,
        name: 'Martin',
        prenom: 'Alice',
        email: 'alice.martin@example.fr',
      }),
      createRegisteredUser({
        id: 3,
        name: 'Durand',
        prenom: 'Sam',
        email: 'sam.durand@example.fr',
      }),
    ])

    render(<RegistrationForm />)

    expect(await screen.findByText('Alice Martin')).toBeInTheDocument()
    expect(screen.getByText('alice.martin@example.fr')).toBeInTheDocument()
    expect(screen.getByText('2 inscrits')).toBeInTheDocument()
  })

  it('shows a toast when backend loading fails', async () => {
    fetchUsersMock.mockRejectedValueOnce(new Error('Backend offline'))

    render(<RegistrationForm />)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Impossible de charger les inscrits depuis l'API.",
      )
    })
  })

  it('skips backend registration updates after unmounting', async () => {
    const request = createDeferred<Array<RegisteredUser>>()
    fetchUsersMock.mockReturnValueOnce(request.promise)
    const { unmount } = render(<RegistrationForm />)

    unmount()
    request.resolve([createRegisteredUser()])
    await request.promise

    expect(fetchUsersMock).toHaveBeenCalledTimes(1)
  })

  it('skips backend loading errors after unmounting', async () => {
    const request = createDeferred<Array<RegisteredUser>>()
    fetchUsersMock.mockReturnValueOnce(request.rejectablePromise)
    const { unmount } = render(<RegistrationForm />)

    unmount()
    request.reject(new Error('Backend offline'))
    await request.rejectablePromise.catch(() => undefined)

    expect(toast.error).not.toHaveBeenCalledWith(
      "Impossible de charger les inscrits depuis l'API.",
    )
  })

  it('keeps admin actions disabled until admin credentials are filled', async () => {
    fetchUsersMock.mockResolvedValueOnce([createRegisteredUser()])

    render(<RegistrationForm />)

    const viewButton = await screen.findByRole('button', {
      name: /voir privé/i,
    })
    const deleteButton = screen.getByRole('button', { name: /supprimer/i })

    expect(viewButton).toBeDisabled()
    expect(deleteButton).toBeDisabled()

    fillAdminCredentials()

    expect(viewButton).toBeEnabled()
    expect(deleteButton).toBeEnabled()
  })

  it('shows private user details after admin lookup', async () => {
    const user = createRegisteredUser({ id: 4 })
    const privateUser = createPrivateUser({
      id: 4,
      ville: 'Nantes',
      codePostal: '44000',
    })
    fetchUsersMock.mockResolvedValueOnce([user])
    fetchPrivateUserMock.mockResolvedValueOnce(privateUser)

    render(<RegistrationForm />)

    await screen.findByText('Max Pinder-White')
    fillAdminCredentials()
    fireEvent.click(screen.getByRole('button', { name: /voir privé/i }))

    await waitFor(() => {
      expect(fetchPrivateUserMock).toHaveBeenCalledWith(4, {
        email: 'admin@example.com',
        password: 'AdminPassword123!',
      })
    })
    expect(screen.getByText('Nantes')).toBeInTheDocument()
    expect(screen.getByText('44000')).toBeInTheDocument()
  })

  it('shows a toast when admin private lookup fails', async () => {
    fetchUsersMock.mockResolvedValueOnce([createRegisteredUser()])
    fetchPrivateUserMock.mockRejectedValueOnce(new Error('Forbidden'))

    render(<RegistrationForm />)

    await screen.findByText('Max Pinder-White')
    fillAdminCredentials()
    fireEvent.click(screen.getByRole('button', { name: /voir privé/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Accès admin refusé ou utilisateur introuvable.',
      )
    })
  })

  it('deletes users through the admin API', async () => {
    const user = createRegisteredUser({ id: 6 })
    fetchUsersMock.mockResolvedValueOnce([user])

    render(<RegistrationForm />)

    await screen.findByText('Max Pinder-White')
    fillAdminCredentials()
    fireEvent.click(screen.getByRole('button', { name: /supprimer/i }))

    await waitFor(() => {
      expect(deleteUserMock).toHaveBeenCalledWith(6, {
        email: 'admin@example.com',
        password: 'AdminPassword123!',
      })
    })
    expect(screen.queryByText('Max Pinder-White')).not.toBeInTheDocument()
    expect(toast).toHaveBeenCalledWith('Inscrit supprimé.')
  })

  it('shows a toast when admin delete fails', async () => {
    fetchUsersMock.mockResolvedValueOnce([createRegisteredUser()])
    deleteUserMock.mockRejectedValueOnce(new Error('Forbidden'))

    render(<RegistrationForm />)

    await screen.findByText('Max Pinder-White')
    fillAdminCredentials()
    fireEvent.click(screen.getByRole('button', { name: /supprimer/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Suppression admin refusée ou utilisateur introuvable.',
      )
    })
    expect(screen.getByText('Max Pinder-White')).toBeInTheDocument()
  })
})
