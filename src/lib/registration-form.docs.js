/**
 * Values collected by the registration form.
 *
 * @typedef {Object} IRegistrationForm
 * @property {string} name - Family name.
 * @property {string} prenom - Given name.
 * @property {string} email - Contact email address.
 * @property {string} dateNaissance - ISO birth date selected in the calendar.
 * @property {string} ville - City name.
 * @property {string} codePostal - Five-digit French postal code.
 */

/**
 * Validation messages keyed by the registration form field they describe.
 *
 * @typedef {Object} IRegistrationFormErrors
 * @property {string} [name] - Family name validation message.
 * @property {string} [prenom] - Given name validation message.
 * @property {string} [email] - Email validation message.
 * @property {string} [dateNaissance] - Birth date validation message.
 * @property {string} [ville] - City validation message.
 * @property {string} [codePostal] - Postal code validation message.
 */
