import axios from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { IRegistrationForm } from './registration-form.types'
import {
  createUser,
  deleteUser,
  fetchPrivateUser,
  fetchUsers,
} from './users-api'
import type { AdminCredentials } from './users-api'

vi.mock('axios', () => ({
  default: {
    delete: vi.fn(),
    get: vi.fn(),
    isAxiosError: vi.fn(),
    post: vi.fn(),
  },
}))

const axiosDeleteMock = vi.mocked(axios.delete)
const axiosGetMock = vi.mocked(axios.get)
const axiosPostMock = vi.mocked(axios.post)
const isAxiosErrorMock = vi.mocked(axios.isAxiosError)

const registration: IRegistrationForm = {
  name: 'Pinder-White',
  prenom: 'Max',
  email: 'max.pinder-white@example.com',
  dateNaissance: '1998-04-12T00:00:00.000Z',
  ville: 'Lyon',
  codePostal: '69001',
}

const adminCredentials: AdminCredentials = {
  email: 'admin@example.com',
  password: 'AdminPassword123!',
}

const adminHeaders = {
  headers: {
    Authorization: `Basic ${btoa(
      `${adminCredentials.email}:${adminCredentials.password}`,
    )}`,
  },
}

describe('users api', () => {
  beforeEach(() => {
    axiosDeleteMock.mockReset()
    axiosGetMock.mockReset()
    axiosPostMock.mockReset()
    isAxiosErrorMock.mockReset()
    isAxiosErrorMock.mockImplementation(
      (error) =>
        typeof error === 'object' &&
        error !== null &&
        'isAxiosError' in error &&
        error.isAxiosError === true,
    )
  })

  it('fetches reduced users returned by the backend', async () => {
    axiosGetMock.mockResolvedValue({
      data: [
        {
          id: 1,
          name: 'Pinder-White',
          prenom: 'Max',
          email: 'max.pinder-white@example.com',
        },
      ],
    })

    await expect(fetchUsers('http://api.test/')).resolves.toEqual([
      {
        id: 1,
        name: 'Pinder-White',
        prenom: 'Max',
        email: 'max.pinder-white@example.com',
      },
    ])
    expect(axiosGetMock).toHaveBeenCalledWith('http://api.test/users')
  })

  it('creates a user with a date-only birth date payload', async () => {
    axiosPostMock.mockResolvedValue({
      data: {
        id: 2,
        name: 'Pinder-White',
        prenom: 'Max',
        email: 'max.pinder-white@example.com',
      },
    })

    await expect(createUser(registration, 'http://api.test')).resolves.toEqual({
      id: 2,
      name: 'Pinder-White',
      prenom: 'Max',
      email: 'max.pinder-white@example.com',
    })
    expect(axiosPostMock).toHaveBeenCalledWith('http://api.test/users', {
      ...registration,
      dateNaissance: '1998-04-12',
    })
  })

  it('fetches private user details with admin credentials', async () => {
    axiosGetMock.mockResolvedValue({
      data: {
        id: 2,
        name: 'Pinder-White',
        prenom: 'Max',
        email: 'max.pinder-white@example.com',
        dateNaissance: '1998-04-12',
        ville: 'Lyon',
        codePostal: '69001',
        createdAt: '2026-06-18T08:00:00',
        updatedAt: '2026-06-18T08:00:00',
      },
    })

    await expect(
      fetchPrivateUser(2, adminCredentials, 'http://api.test'),
    ).resolves.toMatchObject({
      id: 2,
      ville: 'Lyon',
      codePostal: '69001',
    })
    expect(axiosGetMock).toHaveBeenCalledWith(
      'http://api.test/admin/users/2',
      adminHeaders,
    )
  })

  it('deletes users with admin credentials', async () => {
    axiosDeleteMock.mockResolvedValue({})

    await expect(
      deleteUser(2, adminCredentials, 'http://api.test'),
    ).resolves.toBeUndefined()
    expect(axiosDeleteMock).toHaveBeenCalledWith(
      'http://api.test/admin/users/2',
      adminHeaders,
    )
  })

  it('keeps the response status in fetch failure messages', async () => {
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
