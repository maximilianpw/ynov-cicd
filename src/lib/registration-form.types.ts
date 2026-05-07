export interface IRegistrationForm {
  name: string
  prenom: string
  email: string
  dateNaissance: string
  ville: string
  codePostal: string
}

export interface IRegistrationFormErrors {
  name?: string
  prenom?: string
  email?: string
  dateNaissance?: string
  ville?: string
  codePostal?: string
}
