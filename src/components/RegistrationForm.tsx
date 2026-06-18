import type {
  IRegistrationForm,
  IRegistrationFormErrors,
} from '#/lib/registration-form.types.ts'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type {
  AdminCredentials,
  PrivateUser,
  RegisteredUser,
} from '../lib/users-api.ts'
import {
  createUser,
  deleteUser,
  fetchPrivateUser,
  fetchUsers,
} from '../lib/users-api.ts'
import { validateRegistration } from '../lib/validators.ts'
import { RegisteredList } from './RegisteredList.tsx'
import { Button } from './ui/button'
import { Calendar } from './ui/calendar.tsx'
import { Card } from './ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from './ui/field'
import { Input } from './ui/input'

const emptyForm: IRegistrationForm = {
  name: '',
  prenom: '',
  email: '',
  dateNaissance: '',
  ville: '',
  codePostal: '',
}

const registrationFields = Object.keys(emptyForm) as Array<
  keyof IRegistrationForm
>

const emptyTouchedFields = (): Partial<
  Record<keyof IRegistrationForm, boolean>
> => ({})

const allTouchedFields = (): Record<keyof IRegistrationForm, boolean> =>
  registrationFields.reduce(
    (touchedFields, field) => ({ ...touchedFields, [field]: true }),
    {} as Record<keyof IRegistrationForm, boolean>,
  )

/**
 * Renders the student registration form and validates entries before saving.
 */
export function RegistrationForm() {
  const [values, setValues] = useState(emptyForm)
  const [errors, setErrors] = useState<IRegistrationFormErrors>({})
  const [registrations, setRegistrations] = useState<Array<RegisteredUser>>([])
  const [privateUsers, setPrivateUsers] = useState<
    Partial<Record<number, PrivateUser>>
  >({})
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>({
    email: '',
    password: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [busyUserId, setBusyUserId] = useState<number | undefined>()
  const [touched, setTouched] =
    useState<Partial<Record<keyof IRegistrationForm, boolean>>>(
      emptyTouchedFields,
    )

  const allRequiredFieldsFilled = registrationFields.every(
    (field) => values[field].trim().length > 0,
  )
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    let cancelled = false

    fetchUsers()
      .then((users) => {
        if (!cancelled) {
          setRegistrations(users)
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Impossible de charger les inscrits depuis l'API.")
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const updateField = (field: keyof IRegistrationForm, value: string) => {
    const nextValues = { ...values, [field]: value }
    setValues(nextValues)

    if (touched[field]) {
      setErrors(validateRegistration(nextValues))
    }
  }

  const touchAndValidateField = (field: keyof IRegistrationForm) => {
    setTouched((currentTouched) => ({ ...currentTouched, [field]: true }))
    setErrors(validateRegistration(values))
  }

  const selectBirthDate = (date: Date | undefined) => {
    const nextValues = {
      ...values,
      dateNaissance: date ? date.toISOString() : '',
    }

    setValues(nextValues)
    setTouched((currentTouched) => ({
      ...currentTouched,
      dateNaissance: true,
    }))
    setErrors(validateRegistration(nextValues))
  }

  const visibleError = (field: keyof IRegistrationForm) => {
    return touched[field] ? errors[field] : undefined
  }

  const updateAdminCredentials = (
    field: keyof AdminCredentials,
    value: string,
  ) => {
    setAdminCredentials((currentCredentials) => ({
      ...currentCredentials,
      [field]: value,
    }))
  }

  const saveRegistration = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateRegistration(values)
    setErrors(nextErrors)
    setTouched(allTouchedFields())

    if (Object.keys(nextErrors).length > 0) {
      toast.error('Le formulaire contient des erreurs.')
      return
    }

    setIsSaving(true)

    try {
      const createdUser = await createUser(values)
      setRegistrations((currentRegistrations) => [
        ...currentRegistrations,
        createdUser,
      ])
      setValues(emptyForm)
      setErrors({})
      setTouched(emptyTouchedFields())
      toast('Inscription sauvegardée avec succès.')
    } catch {
      toast.error("L'inscription n'a pas pu être sauvegardée en base.")
    } finally {
      setIsSaving(false)
    }
  }

  const viewPrivateUser = async (user: RegisteredUser) => {
    setBusyUserId(user.id)

    try {
      const privateUser = await fetchPrivateUser(user.id, adminCredentials)
      setPrivateUsers((currentPrivateUsers) => ({
        ...currentPrivateUsers,
        [user.id]: privateUser,
      }))
    } catch {
      toast.error('Accès admin refusé ou utilisateur introuvable.')
    } finally {
      setBusyUserId(undefined)
    }
  }

  const removeUser = async (user: RegisteredUser) => {
    setBusyUserId(user.id)

    try {
      await deleteUser(user.id, adminCredentials)
      setRegistrations((currentRegistrations) =>
        currentRegistrations.filter(
          (registration) => registration.id !== user.id,
        ),
      )
      setPrivateUsers((currentPrivateUsers) => {
        const nextPrivateUsers = { ...currentPrivateUsers }
        delete nextPrivateUsers[user.id]
        return nextPrivateUsers
      })
      toast('Inscrit supprimé.')
    } catch {
      toast.error('Suppression admin refusée ou utilisateur introuvable.')
    } finally {
      setBusyUserId(undefined)
    }
  }

  return (
    <Card className="p-4">
      <form onSubmit={saveRegistration} noValidate>
        <FieldSet>
          <FieldLegend>Informations personnelles</FieldLegend>
          <FieldDescription>
            Donnez vos informations personnelles
          </FieldDescription>

          <FieldGroup>
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="name">Nom</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  placeholder="PINDER-WHITE"
                  value={values.name}
                  onBlur={() => touchAndValidateField('name')}
                  onChange={(event) => updateField('name', event.target.value)}
                />
                <FieldError>{visibleError('name')}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="prenom">Prénom</FieldLabel>
                <Input
                  id="prenom"
                  name="prenom"
                  placeholder="Maximilian"
                  value={values.prenom}
                  onBlur={() => touchAndValidateField('prenom')}
                  onChange={(event) =>
                    updateField('prenom', event.target.value)
                  }
                />
                <FieldError>{visibleError('prenom')}</FieldError>
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="max@ynov.com"
                value={values.email}
                onBlur={() => touchAndValidateField('email')}
                onChange={(event) => updateField('email', event.target.value)}
              />
              <FieldError>{visibleError('email')}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="dateNaissance">Date de naissance</FieldLabel>
              <Calendar
                className="max-w-[300px]"
                mode="single"
                selected={
                  values.dateNaissance
                    ? new Date(values.dateNaissance)
                    : undefined
                }
                onSelect={selectBirthDate}
                captionLayout="dropdown"
                startMonth={new Date(currentYear - 120, 0)}
                endMonth={new Date(currentYear, 11)}
              />
              <FieldError>{visibleError('dateNaissance')}</FieldError>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="ville">Ville</FieldLabel>
                <Input
                  id="ville"
                  name="ville"
                  placeholder="Paris"
                  value={values.ville}
                  onBlur={() => touchAndValidateField('ville')}
                  onChange={(event) => updateField('ville', event.target.value)}
                />
                <FieldError>{visibleError('ville')}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="codePostal">Code postal</FieldLabel>
                <Input
                  id="codePostal"
                  name="codePostal"
                  inputMode="numeric"
                  placeholder="75001"
                  value={values.codePostal}
                  onBlur={() => touchAndValidateField('codePostal')}
                  onChange={(event) =>
                    updateField('codePostal', event.target.value)
                  }
                />
                <FieldError>{visibleError('codePostal')}</FieldError>
              </Field>
            </div>
          </FieldGroup>

          <Field orientation="horizontal">
            <Button
              type="submit"
              disabled={!allRequiredFieldsFilled || isSaving}
            >
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </Field>
        </FieldSet>
      </form>

      <RegisteredList
        registrations={registrations}
        adminCredentials={adminCredentials}
        privateUsers={privateUsers}
        busyUserId={busyUserId}
        onAdminCredentialsChange={updateAdminCredentials}
        onViewPrivateUser={viewPrivateUser}
        onDeleteUser={removeUser}
      />
    </Card>
  )
}
