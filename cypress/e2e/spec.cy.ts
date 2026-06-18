/// <reference types="cypress" />

const adminEmail = 'admin@example.com'
const adminPassword = 'AdminPassword123!'

function fillRegistrationFields(email: string) {
  cy.get('#name').clear().type('Pinder-White')
  cy.get('#prenom').clear().type('Max')
  cy.get('#email').clear().type(email)
  cy.get('#ville').clear().type('Lyon')
  cy.get('#codePostal').clear().type('69001')
}

function fillAdminCredentials() {
  cy.get('#admin-email').clear().type(adminEmail)
  cy.get('#admin-password').clear().type(adminPassword)
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

describe('registration app', () => {
  it('saves a registration in MySQL, shows private data to admin, then deletes it', () => {
    const email = `max.pinder-white.${Date.now()}@example.com`

    cy.visit('/')
    cy.contains('h1', 'Inscriptions').should('be.visible')
    cy.contains('legend', 'Informations personnelles').should('be.visible')

    fillRegistrationFields(email)
    selectCalendarYear('1998')
    selectVisibleDay('12')
    cy.contains('button', 'Sauvegarder').click()

    cy.contains('Inscription sauvegardée avec succès.').should('be.visible')
    cy.contains('Max Pinder-White').should('be.visible')
    cy.contains(email).should('be.visible')
    cy.contains('69001 Lyon').should('not.exist')

    fillAdminCredentials()
    cy.contains('li', email).within(() => {
      cy.contains('button', 'Voir privé').click()
      cy.contains('Lyon').should('be.visible')
      cy.contains('69001').should('be.visible')
      cy.contains('button', 'Supprimer').click()
    })

    cy.contains('Inscrit supprimé.').should('be.visible')
    cy.contains(email).should('not.exist')
  })
})
