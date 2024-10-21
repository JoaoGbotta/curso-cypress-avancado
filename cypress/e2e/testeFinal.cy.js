describe('Hacker News Search, mocking', () => {
  const term = 'cypress.io';

  beforeEach(() => {
    // Defina a URL base desejada aqui
    cy.setBaseUrl('https://hackernews-seven.vercel.app/');

    cy.intercept(
      '**/search?query=redux&page=0&hitsPerPage=100',
      { fixture: 'empty' }
    ).as('empty');
    cy.intercept(
      `**/search?query=${term}&page=0&hitsPerPage=100`,
      { fixture: 'stories' }
    ).as('stories');

    cy.visit('/');
    cy.wait('@empty');
  });

  it.only('armazena corretamente os resultados em cache', () => {
    const { faker } = require('@faker-js/faker');
    const randomWord = faker.word.sample();
    let count = 0;

    cy.intercept(`**/search?query=${randomWord}**`, req => {
      count += 1;
      req.reply({ fixture: 'empty' });
    }).as('random');

    cy.search(randomWord).then(() => {
      expect(count, `network calls to fetch ${randomWord}`).to.equal(1);

      cy.wait('@random');

      cy.search(term);
      cy.wait('@stories');

      cy.search(randomWord).then(() => {
        expect(count, `network calls to fetch ${randomWord}`).to.equal(1);
      });
    });
  });
});