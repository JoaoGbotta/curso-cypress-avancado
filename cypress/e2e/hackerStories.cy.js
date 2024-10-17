describe.only('Hacker Stories', () => {
  const initialTerm = 'React'
  const newTerm = 'Cypress'
  // vai bater na API real
  context('Hitting the real API', () => {
    beforeEach(() => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: initialTerm,
          page: '0'
        }
      }).as('getStories')// as Permite que você dê um nome descritivo à interceptação, que pode ser usado posteriormente em seu código. Nesse caso, você está nomeando a interceptação de requisição para 'getStories'.
      cy.visit('/')
      cy.wait('@getStories')
    })

    it('shows 20 stories, then the next 20 after clicking "More"', () => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: initialTerm,
          page: '1'
        }
      }).as('getNextStories')

      cy.get('.item').should('have.length', 20)// seleciona o item, e verifica se o tamanho é 20

      cy.contains('More').click()// encontra o botão more e click nele
      // cy.assertLoadingIsShownAndHidden()//ssertLoadingIsShown:Verifica se um elemento de loading é mostrado na tela.assertLoadingIsHidden: Verifica se esse mesmo elemento é ocultado após o término do carregamento.
      cy.wait('@getNextStories')
      cy.get('.item').should('have.length', 40)
    })

    // Busca pelo ultimo termo pesquisado
    context('Last searches', () => {
      it('searches via the last searched term', () => {
        cy.intercept(
          'GET',
          `**/search?query=${newTerm}&page=0`
        ).as('getNewTermStories')

        cy.get('#search')
          .clear()
          .type(`${newTerm}{enter}`)

        cy.wait('@getNewTermStories')

        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
          .click()

        cy.wait('@getStories')

        cy.get('.item').should('have.length', 20)
        cy.get('.item')
          .first()
          .should('contain', initialTerm)
        cy.get(`button:contains(${newTerm})`)
          .should('be.visible')
      })
    })
  })

  context('Moking the API', () => {
    context('Footer and list of stories', () => {
      beforeEach(() => {
        cy.intercept(
          'GET',
          `**/search?query=${initialTerm}&page=0`,
          { fixture: 'stories' }// fixtures foi criado uma estrutura de dados dentro da pagina stories
        ).as('getStories')// as Permite que você dê um nome descritivo à interceptação, que pode ser usado posteriormente em seu código. Nesse caso, você está nomeando a interceptação de requisição para 'getStories'.
        cy.visit('/')
        cy.wait('@getStories')
      })
      // cy.intercept(//codigo intercepta comando do Cypress que permite interceptar e modificar requisições de rede. a requisão do tipo get para esse end '**/search?query=React&page=0'
      // 'GET', //GET': O método HTTP da requisição que você deseja interceptar.
      // '**/search?query=React&page=0' // URL que foi interceptada.
      // ).as('getStories')// chamamos a requisão de GetStories
      // cy.visit('/')// visita o home page
      // cy.wait('@getStories')//cy.wait utiliza para esperar a execução do teste "esperamos a visita acabar ""
      // cy.assertLoadingIsShownAndHidden() // verifica que um elemento de loading ... é exibido e logo depois  não é exibo mais.
      // cy.contains('More').should('be.visible') // verifica que o botao more esta visivel

      it('shows the footer', () => {
        cy.get('footer') // cy.get seleciona o elemento que quer testar
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com')
      })

      context('List of stories', () => {
        // Since the API is external,
        // I can't control what it will provide to the frontend,
        // and so, how can I assert on the data?
        // This is why this test is being skipped.
        // TODO: Find a way to test it out.
        // cy.assertLoadingIsShownAndHidden() parece ser uma customização no Cypress para verificar se um "loading" (indicador de carregamento) é exibido e depois ocultado durante algum processo assíncrono, como uma requisição de dados.
        it.skip('shows the right data for all rendered stories', () => {})

        // "exibe apenas dezenove histórias após dispensar a primeira história."
        it('shows one less after dimissing the first one', () => {
          cy.get('.button-small')
            .first()
            .click()

          cy.get('.item').should('have.length', 1)
        })

        // Since the API is external,
        // I can't control what it will provide to the frontend,
        // and so, how can I test ordering?
        // This is why these tests are being skipped.
        // TODO: Find a way to test them out.
        context.skip('Order by', () => {
          it('orders by title', () => {})

          it('orders by author', () => {})

          it('orders by comments', () => {})

          it('orders by points', () => {})
        })
      })
      context('Search', () => {
        beforeEach(() => {
          cy.intercept(
            'GET',
          `**/search?query=${newTerm}&page=0`,
          { fixture: 'stories' }// fixture sempre dentro dos contextos.
          ).as('getNewTermStories')

          cy.get('#search')
            .clear()
        })

        // Digite e pressione enter
        it('types and hits ENTER', () => {
          cy.get('#search')
            .type(`${newTerm}{enter}`)
          cy.get('.item').should('have.length', 4)
          cy.get('.item')
            .first()
            .should('contain', 'Sample 1')
          cy.get(`button:contains(${initialTerm})`)
            .should('be.visible')
        })
        // Digite e click no botão de enviar.
        it('types and clicks the submit button', () => {
          cy.get('#search')
            .type(newTerm)
          cy.contains('Submit')
            .click()

          cy.wait('@getNewTermStories')

          cy.get('.item').should('have.length', 4)
          cy.get('.item')
            .first()
            .should('contain', 'Sample 1')
          cy.get(`button:contains(${initialTerm})`)
            .should('be.visible')
        })

        // esse teste nao é end-to-end
        // digita e envia o formulário diretamente
        // it.only('types and submits the form directly',() =>{
        // cy.get('#search')
        // .type(newTerm)
        // cy.get('form').submit()
        // cy.wait('@getNewTermStories')
        //  cy.get( '.item').should('have.length',20)
        // Assertion here
        // })
        // mostra no máximo 5 botões para os últimos termos pesquisados.

        it('shows a max of 5 buttons for the last searched terms', () => {
          const faker = require('faker')// Busca palavras aleatorias
          cy.intercept(
            'GET',
            '**/search**'// Como vimos que ele esta usando palavrar aleatorias , usamos '**/search**' para qualquer busca que ele fizer, " Busca aleatoria"
          ).as('getRandomStories') // Demos um alias para interceptar a requisição

          Cypress._.times(6, () => {
            cy.get('#search')
              .clear()
              .type(`${faker.random.word()}{enter}`)// utilizamos palavra random do tipo faker( faker é uma biblioteca) para buscar palavra aleatorias
              // Depois de cada buscas aguardamos a requisição acabar
            cy.wait('@getRandomStories')// requisição !
          })
          cy.get('.last-searches button')// ultimas buscas pesquisadas
            .should('have.length', 5) // verifica que foram as 5 ultimas .
        })
      })
    })
  })
  context('Errors', () => {
    it('shows "Something went wrong ..." in case of a server error', () => {
      cy.intercept(
        'GET',
        '**/search**', // fazer uma busca qualquer
        { statusCode: 500 } // objeto erro no servido ( 500 erro no servidor )
      ).as('getServerFailure')
      cy.visit('/')
      cy.wait('@getServerFailure')
      cy.get('p:contains(Something went wrong ...)')// Erro é um paragrafo. com a frase "Something went wrong ..."
        .should('be.visible')
    })

    it('shows "Something went wrong ..." in case of a network error', () => {
      cy.intercept(
        'GET',
        '**/search**', // fazer uma busca qualquer
        { forceNetworkError: true } // objeto erro no servidor ( 500 erro no servidor )
      ).as('getNetWorkFailure')
      cy.visit('/')
      cy.wait('@getNetWorkFailure')
      cy.get('p:contains(Something went wrong ...)')// Erro é um paragrafo. com a frase "Something went wrong ..."
        .should('be.visible')
    })
  })
})
