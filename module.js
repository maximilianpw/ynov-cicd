/**
 * Calculates the age of a person from their birth date.
 *
 * @param {{ birth: Date }} p - Person object containing a birth date.
 * @returns {number} Age in full years.
 * @throws {Error} When the person object is missing.
 */
export function calculateAge(p) {
  if (!p) {
    throw new Error('Person must have a birth date')
  }
  const dateDiff = new Date(Date.now() - p.birth.getTime())
  return Math.abs(dateDiff.getUTCFullYear() - 1970)
}
