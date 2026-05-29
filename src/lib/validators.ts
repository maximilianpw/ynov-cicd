import type {
  IRegistrationForm,
  IRegistrationFormErrors,
} from './registration-form.types'

const textPattern = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u
const postalCodePattern = /^\d{5}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Calculates an age in full years from a birth date.
 */
export function calculateAge(birthDate: string, today: Date) {
  const birth = new Date(birthDate)

  if (Number.isNaN(birth.getTime())) {
    return null
  }

  const age = today.getFullYear() - birth.getFullYear()
  const birthMonthDay = (birth.getMonth() + 1) * 100 + birth.getDate()
  const todayMonthDay = (today.getMonth() + 1) * 100 + today.getDate()

  return todayMonthDay >= birthMonthDay ? age : age - 1
}

export function isAdult(birthDate: string, today: Date): boolean {
  const age = calculateAge(birthDate, today)
  return age !== null && age >= 18
}

export function isValidPostalCode(value: string): boolean {
  return postalCodePattern.test(value.trim())
}

export function isValidText(value: string): boolean {
  return textPattern.test(value.trim())
}

export function isValidEmail(value: string): boolean {
  return emailPattern.test(value.trim())
}

/**
 * Validates every registration field and returns French error messages for invalid values.
 *
 * @param {IRegistrationForm} values - Registration values to validate.
 * @param {Date} [today] - Reference date used for the adulthood check.
 * @returns {IRegistrationFormErrors} Field-level validation messages.
 */
export function validateRegistration(
  values: IRegistrationForm,
  today = new Date(),
): IRegistrationFormErrors {
  const errors: IRegistrationFormErrors = {}

  if (!isValidText(values.name)) {
    errors.name = 'Le nom est invalide.'
  }

  if (!isValidText(values.prenom)) {
    errors.prenom = 'Le prénom est invalide.'
  }

  if (!isValidEmail(values.email)) {
    errors.email = "L'email est invalide."
  }

  if (!isAdult(values.dateNaissance, today)) {
    errors.dateNaissance = 'Vous devez avoir au moins 18 ans.'
  }

  if (!isValidText(values.ville)) {
    errors.ville = 'La ville est invalide.'
  }

  if (!isValidPostalCode(values.codePostal)) {
    errors.codePostal = 'Le code postal doit contenir 5 chiffres.'
  }

  return errors
}
