import { CountButton } from '#/components/CountButton'
import { RegistrationForm } from '#/components/RegistrationForm'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

export function Home() {
  return (
    <div className="p-8 flex flex-col gap-4">
      <h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
      <CountButton />
      <RegistrationForm />
    </div>
  )
}
