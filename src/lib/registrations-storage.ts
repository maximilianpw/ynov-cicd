import type { IRegistrationForm } from './registration-form.types'
import { validateRegistration } from './validators'

export const registrationsStorageKey = 'ynov-cicd.registrations'

type RegistrationStorage = Pick<Storage, 'getItem' | 'setItem'>

const registrationFields: Array<keyof IRegistrationForm> = [
  'name',
  'prenom',
  'email',
  'dateNaissance',
  'ville',
  'codePostal',
]

function getRegistrationStorage(): RegistrationStorage {
  return window.localStorage
}

function isStoredRegistration(value: unknown): value is IRegistrationForm {
  const registration = value as Record<keyof IRegistrationForm, unknown>
  const hasFields = registrationFields.every(
    (field) => typeof registration[field] === 'string',
  )

  return (
    hasFields &&
    Object.keys(validateRegistration(registration as IRegistrationForm))
      .length === 0
  )
}

/**
 * Reads valid saved registrations from localStorage.
 */
export function loadRegistrations(
  storage = getRegistrationStorage(),
): Array<IRegistrationForm> {
  const rawValue = storage.getItem(registrationsStorageKey)

  if (!rawValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Array<unknown>
    return parsedValue.filter(isStoredRegistration)
  } catch {
    return []
  }
}

/**
 * Persists registrations in localStorage when a browser storage is available.
 */
export function saveRegistrations(
  registrations: Array<IRegistrationForm>,
  storage = getRegistrationStorage(),
) {
  storage.setItem(registrationsStorageKey, JSON.stringify(registrations))
}
