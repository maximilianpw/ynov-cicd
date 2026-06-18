import axios from 'axios'
import type { IRegistrationForm } from './registration-form.types'

const apiBaseUrl =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:8000'

export interface RegisteredUser {
  id: number
  name: string
  prenom: string
  email: string
}

export interface PrivateUser extends RegisteredUser {
  dateNaissance: string
  ville: string
  codePostal: string
  createdAt: string
  updatedAt: string
}

export interface AdminCredentials {
  email: string
  password: string
}

function endpoint(path: string, baseUrl = apiBaseUrl) {
  return `${baseUrl.replace(/\/$/, '')}${path}`
}

function dateOnly(value: string) {
  return value.split('T')[0]
}

function encodeBasicAuth(value: string) {
  if (typeof btoa === 'function') {
    return btoa(value)
  }

  return Buffer.from(value, 'utf-8').toString('base64')
}

function adminConfig(credentials: AdminCredentials) {
  return {
    headers: {
      Authorization: `Basic ${encodeBasicAuth(
        `${credentials.email}:${credentials.password}`,
      )}`,
    },
  }
}

function apiError(action: string, error: unknown) {
  if (axios.isAxiosError(error) && error.response) {
    return new Error(`Failed to ${action}: ${error.response.status}`)
  }

  return error
}

export async function fetchUsers(
  baseUrl = apiBaseUrl,
): Promise<Array<RegisteredUser>> {
  try {
    const { data } = await axios.get<Array<RegisteredUser>>(
      endpoint('/users', baseUrl),
    )

    return data
  } catch (error) {
    throw apiError('fetch users', error)
  }
}

export async function createUser(
  registration: IRegistrationForm,
  baseUrl = apiBaseUrl,
): Promise<RegisteredUser> {
  try {
    const { data } = await axios.post<RegisteredUser>(
      endpoint('/users', baseUrl),
      {
        ...registration,
        dateNaissance: dateOnly(registration.dateNaissance),
      },
    )

    return data
  } catch (error) {
    throw apiError('create user', error)
  }
}

export async function fetchPrivateUser(
  userId: number,
  credentials: AdminCredentials,
  baseUrl = apiBaseUrl,
): Promise<PrivateUser> {
  try {
    const { data } = await axios.get<PrivateUser>(
      endpoint(`/admin/users/${userId}`, baseUrl),
      adminConfig(credentials),
    )

    return data
  } catch (error) {
    throw apiError('fetch private user', error)
  }
}

export async function deleteUser(
  userId: number,
  credentials: AdminCredentials,
  baseUrl = apiBaseUrl,
) {
  try {
    await axios.delete(endpoint(`/admin/users/${userId}`, baseUrl), {
      ...adminConfig(credentials),
    })
  } catch (error) {
    throw apiError('delete user', error)
  }
}
