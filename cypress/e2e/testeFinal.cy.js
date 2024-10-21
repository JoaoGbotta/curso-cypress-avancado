// cypress/integration/hackernewsSearch.spec.js

describe('Hacker News Search, moking ', () => {
  const term = 'cypress.io'

  beforeEach(() => {
    cy.intercept(
      '**/search?query=redux&page=0&hitsPerPage=100',
      { fixture: 'empty'}
    ).as('empty')
    cy.intercept(
      `**/search?query=${term}&page=0&hitsPerPage=100`,
      { fixture: 'stories'}
    ).as('stories')

    cy.visit('/')
    cy.wait('@empty')
  })

  //armazena corretamente os resultados em cache
  it('armazena corretamente os resultados em cache', () => {
    const { faker } = require('@faker-js/faker')
    const randomWord = faker.word.sample()
    let count = 0

    cy.intercept(`**/search?query=${randomWord}**`, req => {
      count +=1
      //Cypress intercepta uma requisição de rede que a aplicação faz. O req.reply permite que você controle a resposta dessa requisição, retornando dados personalizados ou mockados no lugar da resposta real da API.
      req.reply({fixture: 'empty'})//o interceptador de requisições para simular ou modificar a resposta de uma requisição HTTP durante um teste.
    }).as('random')

    cy.search(randomWord).then(() => {
      expect(count, `network calls to fetch ${randomWord}`).to.equal(1)

      cy.wait('@random')

      cy.search(term)
      cy.wait('@stories')

      cy.search(randomWord).then(() => {
        expect(count, `network calls to fetch ${randomWord}`).to.equal(1)
      })
    })
  })
})