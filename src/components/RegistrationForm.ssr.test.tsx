// @vitest-environment node

import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { RegistrationForm } from './RegistrationForm'

describe('RegistrationForm SSR', () => {
  it('renders without browser storage', () => {
    expect(renderToStaticMarkup(<RegistrationForm />)).toContain(
      'Aucun inscrit.',
    )
  })
})
