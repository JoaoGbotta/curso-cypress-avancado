import 'cypress-localstorage-commands'


Cypress.Commands.add('assertLoadingIsShownAndHidden', () => {
  cy.contains('Loading ...').should('be.visible')
  cy.contains('Loading ...').should('not.exist')
})

// cypress/support/commands.js

Cypress.Commands.add('search', term => {
  cy.get('input[type="text"]')
    .should('be.visible')
    .clear()
    .type(`${term}{enter}`)
})


Cypress.Commands.add('setBaseUrl', (url) => {
  Cypress.config('baseUrl', url);
});