/// <reference types="cypress" />

describe('registration app with mocked offline API', () => {
  beforeEach(() => {
    cy.env(['offline']).then(({ offline }) => {
      expect(offline).to.equal(true)
    })

    cy.intercept('GET', '**/users', {
      statusCode: 503,
      body: { detail: 'Mocked API offline' },
    }).as('fetchUsersOffline')

    cy.intercept('POST', '**/users', {
      statusCode: 503,
      body: { detail: 'Mocked API offline' },
    }).as('createUserOffline')
  })

  it('keeps the frontend available and reports mocked API outages', () => {
    cy.visit('/ynov-cicd/')

    cy.wait('@fetchUsersOffline')
    cy.contains('h1', 'Inscriptions').should('be.visible')
    cy.contains("Impossible de charger les inscrits depuis l'API.").should(
      'be.visible',
    )

    cy.get('#name').type('Pinder-White')
    cy.get('#prenom').type('Max')
    cy.get('#email').type('max.offline@example.com')
    cy.get('#ville').type('Lyon')
    cy.get('#codePostal').type('69001')
    cy.get('[data-slot="calendar"] select').then(($selects) => {
      const yearSelect = Array.from($selects).find((select) =>
        Array.from((select as HTMLSelectElement).options).some(
          (option) => option.text.trim() === '1998' || option.value === '1998',
        ),
      ) as HTMLSelectElement | undefined

      if (!yearSelect) {
        throw new Error('Unable to find calendar year 1998')
      }

      yearSelect.value = '1998'
      yearSelect.dispatchEvent(new Event('change', { bubbles: true }))
    })
    cy.contains('[data-slot="calendar"]', '1998').should('be.visible')
    cy.contains('[data-slot="calendar"] button', /^12$/).click()
    cy.contains('button', 'Sauvegarder').click()

    cy.wait('@createUserOffline')
    cy.contains("L'inscription n'a pas pu être sauvegardée en base.").should(
      'be.visible',
    )
  })
})
