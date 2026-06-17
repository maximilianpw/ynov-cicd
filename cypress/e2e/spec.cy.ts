/// <reference types="cypress" />

const registrationsStorageKey = 'ynov-cicd.registrations'

type Registration = {
  name: string
  prenom: string
  email: string
  dateNaissance: string
  ville: string
  codePostal: string
}

const existingRegistration: Registration = {
  name: 'Dupont',
  prenom: 'Élise',
  email: 'elise.dupont@example.fr',
  dateNaissance: '1997-02-01T00:00:00.000Z',
  ville: 'Bordeaux',
  codePostal: '33000',
}

function visitHome({
  clearStorage = false,
  registrations,
}: {
  clearStorage?: boolean
  registrations?: Array<Registration>
} = {}) {
  cy.intercept('GET', '**/users', {
    statusCode: 500,
    body: {},
  }).as('getUsers')

  cy.visit('/', {
    onBeforeLoad(window) {
      if (clearStorage) {
        window.localStorage.clear()
      }

      if (registrations) {
        window.localStorage.setItem(
          registrationsStorageKey,
          JSON.stringify(registrations),
        )
      }
    },
  })

  cy.wait('@getUsers')
}

function fillRegistrationFields(
  overrides: Partial<
    Record<'name' | 'prenom' | 'email' | 'ville' | 'codePostal', string>
  > = {},
) {
  const values = {
    name: 'Pinder-White',
    prenom: 'Max',
    email: 'max.pinder-white@example.com',
    ville: 'Lyon',
    codePostal: '69001',
    ...overrides,
  }

  cy.get('#name').clear().type(values.name)
  cy.get('#prenom').clear().type(values.prenom)
  cy.get('#email').clear().type(values.email)
  cy.get('#ville').clear().type(values.ville)
  cy.get('#codePostal').clear().type(values.codePostal)
}

function selectCalendarYear(year: string) {
  cy.get('[data-slot="calendar"] select').then(($selects) => {
    const yearSelect = Array.from($selects).find((select) =>
      Array.from((select as HTMLSelectElement).options).some(
        (option) => option.text.trim() === year || option.value === year,
      ),
    ) as HTMLSelectElement | undefined

    if (!yearSelect) {
      throw new Error(`Unable to find calendar year ${year}`)
    }

    yearSelect.value = year
    yearSelect.dispatchEvent(new Event('change', { bubbles: true }))
  })

  cy.contains('[data-slot="calendar"]', year).should('be.visible')
}

function selectVisibleDay(day: string) {
  cy.contains('[data-slot="calendar"] button', new RegExp(`^${day}$`)).click()
}

function assertRegisteredCount(count: number) {
  if (count === 0) {
    cy.contains('Aucun inscrit.').should('be.visible')
    cy.get('section[aria-labelledby="registered-list-title"] li').should(
      'not.exist',
    )
    return
  }

  cy.get('section[aria-labelledby="registered-list-title"] li').should(
    'have.length',
    count,
  )
}

describe('registration app', () => {
  it('navigue vers la page sans inscrit, ajoute un utilisateur valide, puis revient avec un inscrit', () => {
    visitHome({ clearStorage: true })

    cy.contains('h1', 'Inscriptions').should('be.visible')
    assertRegisteredCount(0)
    cy.contains('legend', 'Informations personnelles').should('be.visible')

    fillRegistrationFields()
    selectCalendarYear('1998')
    selectVisibleDay('12')
    cy.contains('button', 'Sauvegarder').click()

    cy.contains('Inscription sauvegardée avec succès.').should('be.visible')

    visitHome()

    assertRegisteredCount(1)
    cy.contains('Max Pinder-White').should('be.visible')
    cy.contains('max.pinder-white@example.com').should('be.visible')
  })

  it('navigue vers la page avec un inscrit, tente un ajout invalide, puis revient avec toujours un inscrit', () => {
    visitHome({
      clearStorage: true,
      registrations: [existingRegistration],
    })

    cy.contains('h1', 'Inscriptions').should('be.visible')
    assertRegisteredCount(1)
    cy.contains('Élise Dupont').should('be.visible')
    cy.contains('legend', 'Informations personnelles').should('be.visible')

    fillRegistrationFields({
      name: 'Pinder2',
      prenom: 'Max!',
      email: 'max.pinder-white.example.com',
      ville: 'Lyon3',
      codePostal: '6900A',
    })
    selectVisibleDay('12')
    cy.contains('button', 'Sauvegarder').click()

    cy.contains('Le formulaire contient des erreurs.').should('be.visible')

    visitHome()

    assertRegisteredCount(1)
    cy.contains('Élise Dupont').should('be.visible')
    cy.contains('Max Pinder-White').should('not.exist')
  })
})
