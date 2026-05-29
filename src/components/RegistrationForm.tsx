import type {
  IRegistrationForm,
  IRegistrationFormErrors,
} from '#/lib/registration-form.types.ts'
import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  loadRegistrations,
  saveRegistrations,
} from '../lib/registrations-storage.ts'
import { fetchUsers } from '../lib/users-api.ts'
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
  const [registrations, setRegistrations] = useState<Array<IRegistrationForm>>(
    () => (typeof window === 'undefined' ? [] : loadRegistrations()),
  )
  const [touched, setTouched] =
    useState<Partial<Record<keyof IRegistrationForm, boolean>>>(
      emptyTouchedFields,
    )

  const allRequiredFieldsFilled = registrationFields.every(
    (field) => values[field].trim().length > 0,
  )

  useEffect(() => {
    let cancelled = false

    // Start with localStorage so saved registrations are visible immediately,
    // then replace them with backend data when the API is reachable.
    fetchUsers()
      .then((users) => {
        if (!cancelled) {
          setRegistrations(users)
        }
      })
      .catch(() => {
        // Keep the localStorage-backed initial state when the backend is offline.
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

  const saveRegistration = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateRegistration(values)
    setErrors(nextErrors)
    setTouched(allTouchedFields())

    if (Object.keys(nextErrors).length > 0) {
      toast.error('Le formulaire contient des erreurs.')
      return
    }

    const nextRegistrations = [...registrations, { ...values }]
    setRegistrations(nextRegistrations)
    saveRegistrations(nextRegistrations)
    setValues(emptyForm)
    setErrors({})
    setTouched(emptyTouchedFields())
    toast('Inscription sauvegardée avec succès.')
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
            <Button type="submit" disabled={!allRequiredFieldsFilled}>
              Sauvegarder
            </Button>
          </Field>
        </FieldSet>
      </form>

      <RegisteredList registrations={registrations} />
    </Card>
  )
}
