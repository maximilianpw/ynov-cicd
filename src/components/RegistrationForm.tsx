import type {
  IRegistrationForm,
  IRegistrationFormErrors,
} from '#/lib/registration-form.types.ts'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { toast } from 'sonner'
import { validateRegistration } from '../lib/validators.ts'
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

/**
 * Renders the student registration form and validates entries before saving.
 */
export function RegistrationForm() {
  const [values, setValues] = useState(emptyForm)
  const [errors, setErrors] = useState<IRegistrationFormErrors>({})

  const updateField = (
    field: keyof IRegistrationForm,
    value: string | undefined,
  ) => {
    const nextValues = { ...values, [field]: value }
    setValues(nextValues)

    if (errors[field]) {
      setErrors(validateRegistration(nextValues))
    }
  }

  const validateField = () => {
    setErrors(validateRegistration(values))
  }

  const saveRegistration = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateRegistration(values)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setValues(emptyForm)
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
                  onBlur={validateField}
                  onChange={(event) => updateField('name', event.target.value)}
                />
                <FieldError>{errors.name}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="prenom">Prénom</FieldLabel>
                <Input
                  id="prenom"
                  name="prenom"
                  placeholder="Maximilian"
                  value={values.prenom}
                  onBlur={validateField}
                  onChange={(event) =>
                    updateField('prenom', event.target.value)
                  }
                />
                <FieldError>{errors.prenom}</FieldError>
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
                onBlur={validateField}
                onChange={(event) => updateField('email', event.target.value)}
              />
              <FieldError>{errors.email}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="dateNaissance">Date de naissance</FieldLabel>
              <Calendar
                className="max-w-[300px]"
                mode="single"
                selected={new Date(values.dateNaissance)}
                onSelect={(date) =>
                  updateField('dateNaissance', date?.toISOString())
                }
                captionLayout="dropdown"
              />
              <FieldError>{errors.dateNaissance}</FieldError>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="ville">Ville</FieldLabel>
                <Input
                  id="ville"
                  name="ville"
                  placeholder="Paris"
                  value={values.ville}
                  onBlur={validateField}
                  onChange={(event) => updateField('ville', event.target.value)}
                />
                <FieldError>{errors.ville}</FieldError>
              </Field>
              <Field>
                <FieldLabel htmlFor="codePostal">Code postal</FieldLabel>
                <Input
                  id="codePostal"
                  name="codePostal"
                  inputMode="numeric"
                  placeholder="75001"
                  value={values.codePostal}
                  onBlur={validateField}
                  onChange={(event) =>
                    updateField('codePostal', event.target.value)
                  }
                />
                <FieldError>{errors.codePostal}</FieldError>
              </Field>
            </div>
          </FieldGroup>

          <Field orientation="horizontal">
            <Button type="submit">Sauvegarder</Button>
          </Field>
        </FieldSet>
      </form>
    </Card>
  )
}
