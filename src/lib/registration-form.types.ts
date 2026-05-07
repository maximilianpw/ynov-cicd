/**
 * Values collected by the registration form.
 */
export interface IRegistrationForm {
  name: string
  prenom: string
  email: string
  dateNaissance: string
  ville: string
  codePostal: string
}

/**
 * Validation messages keyed by the registration form field they describe.
 */
export interface IRegistrationFormErrors {
  name?: string
  prenom?: string
  email?: string
  dateNaissance?: string
  ville?: string
  codePostal?: string
}
