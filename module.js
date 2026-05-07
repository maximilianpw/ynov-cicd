/**
 * Calculates the age of a person
 * @param {Object} p - person object
 * @returns {number} age
 */
export function calculateAge(p) {
  if (!p) {
    throw new Error('Person must have a birth date')
  }
  const dateDiff = new Date(Date.now() - p.birth.getTime())
  return Math.abs(dateDiff.getUTCFullYear() - 1970)
}
