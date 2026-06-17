import axios from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchUsers } from './users-api'

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    isAxiosError: vi.fn(),
  },
}))

const axiosGetMock = vi.mocked(axios.get)
const isAxiosErrorMock = vi.mocked(axios.isAxiosError)

describe('fetchUsers', () => {
  beforeEach(() => {
    axiosGetMock.mockReset()
    isAxiosErrorMock.mockReset()
    isAxiosErrorMock.mockImplementation(
      (error) =>
        typeof error === 'object' &&
        error !== null &&
        'isAxiosError' in error &&
        error.isAxiosError === true,
    )
  })

  it('fetches and maps users returned by the backend', async () => {
    axiosGetMock.mockResolvedValue({
      data: {
        utilisateurs: [
          [
            1,
            'Pinder-White',
            'Max',
            'max.pinder-white@vev.com',
            '1998-04-12T00:00:00.000Z',
            'Lyon',
            '69001',
            '2026-06-17T08:00:00.000Z',
            '2026-06-17T08:00:00.000Z',
          ],
        ],
      },
    })

    await expect(fetchUsers('http://api.test')).resolves.toEqual([
      {
        name: 'Pinder-White',
        prenom: 'Max',
        email: 'max.pinder-white@example.com',
        dateNaissance: '1998-04-12T00:00:00.000Z',
        ville: 'Lyon',
        codePostal: '69001',
      },
    ])
    expect(axiosGetMock).toHaveBeenCalledWith('http://api.test/users')
  })

  it('keeps the response status in the fetch failure message', async () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 503,
      },
    }

    axiosGetMock.mockRejectedValue(error)

    await expect(fetchUsers('http://api.test')).rejects.toThrow(
      'Failed to fetch users: 503',
    )
    expect(isAxiosErrorMock).toHaveBeenCalledWith(error)
  })
})
