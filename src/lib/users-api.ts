import axios from 'axios'
import type { IRegistrationForm } from './registration-form.types'

const apiBaseUrl =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:8000'

/**
 * A raw `utilisateur` row as returned by the FastAPI backend.
 *
 * `cursor.fetchall()` yields tuples, so each row arrives as a positional
 * array following the table column order.
 */
type UserRow = [
  id: number,
  name: string,
  prenom: string,
  email: string,
  dateNaissance: string,
  ville: string,
  codePostal: string,
  createdAt: string,
  updatedAt: string,
]

interface UsersResponse {
  utilisateurs: Array<UserRow>
}

/**
 * Fetches registered users from the FastAPI backend and maps the raw
 * `utilisateur` rows to the shape used by the registration UI.
 */
export async function fetchUsers(
  baseUrl = apiBaseUrl,
): Promise<Array<IRegistrationForm>> {
  try {
    const { data } = await axios.get<UsersResponse>(`${baseUrl}/users`)

    return data.utilisateurs.map((row) => ({
      name: row[1],
      prenom: row[2],
      email: row[3],
      dateNaissance: row[4],
      ville: row[5],
      codePostal: row[6],
    }))
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Failed to fetch users: ${error.response.status}`)
    }

    throw error
  }
}
