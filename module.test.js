import { calculateAge } from './module.js'
import { expect, describe, it } from 'vitest'

/**
 * @function calculateAge
 */
describe('calculateAge', () => {
  it('should return the age of a max', () => {
    const max = {
      birth: new Date('2004-07-17'),
    }
    expect(calculateAge(max)).toBe(21)
  })

  it('should throw on a missing parameter', () => {
    expect(() => calculateAge()).toThrow()
  })
})
