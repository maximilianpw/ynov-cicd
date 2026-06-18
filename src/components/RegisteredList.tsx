import { Eye, Trash } from '@phosphor-icons/react'
import type {
  AdminCredentials,
  PrivateUser,
  RegisteredUser,
} from '#/lib/users-api'
import { Button } from './ui/button'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from './ui/field'
import { Input } from './ui/input'

type RegisteredListProps = {
  registrations: Array<RegisteredUser>
  adminCredentials: AdminCredentials
  privateUsers: Partial<Record<number, PrivateUser>>
  busyUserId?: number
  onAdminCredentialsChange: (
    field: keyof AdminCredentials,
    value: string,
  ) => void
  onViewPrivateUser: (user: RegisteredUser) => void
  onDeleteUser: (user: RegisteredUser) => void
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR')

function formatBirthDate(dateNaissance: string) {
  return dateFormatter.format(new Date(dateNaissance))
}

/**
 * Displays saved registrations with reduced public information and admin actions.
 */
export function RegisteredList({
  registrations,
  adminCredentials,
  privateUsers,
  busyUserId,
  onAdminCredentialsChange,
  onViewPrivateUser,
  onDeleteUser,
}: RegisteredListProps) {
  const adminReady =
    adminCredentials.email.trim().length > 0 &&
    adminCredentials.password.trim().length > 0

  return (
    <section
      aria-labelledby="registered-list-title"
      className="flex flex-col gap-4 border-t pt-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="registered-list-title" className="text-sm font-medium">
          Inscrits
        </h2>
        <p className="text-xs text-muted-foreground">
          {registrations.length} inscrit{registrations.length > 1 ? 's' : ''}
        </p>
      </div>

      <FieldSet>
        <FieldLegend>Compte admin</FieldLegend>
        <FieldGroup>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="admin-email">Email admin</FieldLabel>
              <Input
                id="admin-email"
                name="admin-email"
                type="email"
                value={adminCredentials.email}
                onChange={(event) =>
                  onAdminCredentialsChange('email', event.target.value)
                }
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="admin-password">
                Mot de passe admin
              </FieldLabel>
              <Input
                id="admin-password"
                name="admin-password"
                type="password"
                value={adminCredentials.password}
                onChange={(event) =>
                  onAdminCredentialsChange('password', event.target.value)
                }
              />
            </Field>
          </div>
        </FieldGroup>
      </FieldSet>

      {registrations.length === 0 ? (
        <p className="text-xs text-muted-foreground">Aucun inscrit.</p>
      ) : (
        <ul className="grid gap-2">
          {registrations.map((registration) => {
            const privateUser = privateUsers[registration.id]
            const isBusy = busyUserId === registration.id

            return (
              <li
                key={registration.id}
                className="flex flex-col gap-3 border p-3 text-xs"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-medium">
                      {registration.prenom} {registration.name}
                    </p>
                    <p className="text-muted-foreground">
                      {registration.email}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!adminReady || isBusy}
                      onClick={() => onViewPrivateUser(registration)}
                    >
                      <Eye data-icon="inline-start" />
                      Voir privé
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={!adminReady || isBusy}
                      onClick={() => onDeleteUser(registration)}
                    >
                      <Trash data-icon="inline-start" />
                      Supprimer
                    </Button>
                  </div>
                </div>

                {privateUser ? (
                  <dl className="grid gap-2 border-t pt-3 md:grid-cols-3">
                    <div>
                      <dt className="text-muted-foreground">
                        Date de naissance
                      </dt>
                      <dd>{formatBirthDate(privateUser.dateNaissance)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Ville</dt>
                      <dd>{privateUser.ville}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Code postal</dt>
                      <dd>{privateUser.codePostal}</dd>
                    </div>
                  </dl>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
