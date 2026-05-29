import { RegistrationForm } from '#/components/RegistrationForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

/**
 * Home route that hosts the registration workflow.
 */
export function Home() {
  return (
    <div className="p-8 flex flex-col gap-4">
      <h1 className="text-4xl font-bold">Inscriptions</h1>
      <RegistrationForm />
    </div>
  )
}
