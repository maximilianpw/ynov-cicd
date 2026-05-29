import { describe, expect, it, vi } from 'vitest'
import type { IRegistrationForm } from './registration-form.types'
import {
  loadRegistrations,
  registrationsStorageKey,
  saveRegistrations,
} from './registrations-storage'

const validRegistration: IRegistrationForm = {
  name: 'Pinder-White',
  prenom: 'Max',
  email: 'max.pinder-white@example.com',
  dateNaissance: '1998-04-12',
  ville: 'Lyon',
  codePostal: '69001',
}

function createStorage(initialValue?: string) {
  const values = new Map<string, string>()

  if (initialValue) {
    values.set(registrationsStorageKey, initialValue)
  }

  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value)
    }),
  }
}

describe('registration storage', () => {
  it('returns an empty list without a saved value', () => {
    expect(loadRegistrations(createStorage())).toEqual([])
  })

  it('returns an empty list for invalid JSON', () => {
    expect(loadRegistrations(createStorage('{'))).toEqual([])
  })

  it('keeps only complete and valid registrations from localStorage', () => {
    const storage = createStorage(
      JSON.stringify([
        validRegistration,
        { ...validRegistration, email: 'invalid-email' },
        { ...validRegistration, name: 42 },
      ]),
    )

    expect(loadRegistrations(storage)).toEqual([validRegistration])
  })

  it('saves registrations when storage is available', () => {
    const storage = createStorage()

    saveRegistrations([validRegistration], storage)

    expect(storage.setItem).toHaveBeenCalledWith(
      registrationsStorageKey,
      JSON.stringify([validRegistration]),
    )
  })
})
