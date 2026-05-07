import type {
  IRegistrationForm,
  IRegistrationFormErrors,
} from "./registration-form.types";

const textPattern = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u;
const postalCodePattern = /^\d{5}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isAdult(birthDate: string, today = new Date()): boolean {
  const birth = new Date(birthDate);

  if (Number.isNaN(birth.getTime())) {
    return false;
  }

  let age = today.getFullYear() - birth.getFullYear();
  const birthdayPassed =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());

  if (!birthdayPassed) {
    age -= 1;
  }

  return age >= 18;
}

function isValidPostalCode(value: string): boolean {
  return postalCodePattern.test(value.trim());
}

function isValidText(value: string): boolean {
  return textPattern.test(value.trim());
}

function isValidEmail(value: string): boolean {
  return emailPattern.test(value.trim());
}

export function validateRegistration(
  values: IRegistrationForm,
  today = new Date(),
): IRegistrationFormErrors {
  const errors: IRegistrationFormErrors = {};

  if (!isValidText(values.name)) {
    errors.name = "Le nom est invalide.";
  }

  if (!isValidText(values.prenom)) {
    errors.prenom = "Le prénom est invalide.";
  }

  if (!isValidEmail(values.email)) {
    errors.email = "L'email est invalide.";
  }

  if (!isAdult(values.dateNaissance, today)) {
    errors.dateNaissance = "Vous devez avoir au moins 18 ans.";
  }

  if (!isValidText(values.ville)) {
    errors.ville = "La ville est invalide.";
  }

  if (!isValidPostalCode(values.codePostal)) {
    errors.codePostal = "Le code postal doit contenir 5 chiffres.";
  }

  return errors;
}
