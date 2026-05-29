import type { IRegistrationForm } from '#/lib/registration-form.types'

type RegisteredListProps = {
  registrations: Array<IRegistrationForm>
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR')

function formatBirthDate(dateNaissance: string) {
  return dateFormatter.format(new Date(dateNaissance))
}

/**
 * Displays saved registrations.
 */
export function RegisteredList({ registrations }: RegisteredListProps) {
  return (
    <section aria-labelledby="registered-list-title" className="border-t pt-4">
      <h2 id="registered-list-title" className="text-sm font-medium">
        Inscrits
      </h2>

      {registrations.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">Aucun inscrit.</p>
      ) : (
        <ul className="mt-3 grid gap-2">
          {registrations.map((registration, index) => (
            <li
              key={`${registration.email}-${registration.dateNaissance}-${index}`}
              className="border p-3 text-xs"
            >
              <p className="font-medium">
                {registration.prenom} {registration.name}
              </p>
              <p className="text-muted-foreground">{registration.email}</p>
              <p className="text-muted-foreground">
                {formatBirthDate(registration.dateNaissance)} -{' '}
                {registration.codePostal} {registration.ville}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
