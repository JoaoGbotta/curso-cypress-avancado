describe('Hacker Stories', () => {
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

      cy.contains('More')
        .should('be.visible')
        .click()// encontra o botão more e click nele

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
          .should('be.visible')
          .clear()
          .type(`${newTerm}{enter}`)

        cy.wait('@getNewTermStories')
        // garantia de que não so esta funcionando a nivel interface grafica do usuario, como a nivel de localStorage
        cy.getLocalStorage('search')
          .should('be.equal',newTerm)


        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
          .click()

        cy.wait('@getStories')

        cy.getLocalStorage('search')
          .should('be.equal',initialTerm)

        cy.get('.item').should('have.length', 20)
        cy.get('.item')
          .first()
          .should('be.visible')
          .and('contain', initialTerm)
        cy.get(`button:contains(${newTerm})`)
          .should('be.visible')
      })
    })
  })
  //mokando API- nao esta usando API 
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
      // cy.assertLoadingIsShownAndHidden() parece ser uma customização no Cypress para verificar se um "loading" (indicador de carregamento) é exibido e depois ocultado durante algum processo assíncrono, como uma requisição de dados.

      it('shows the footer', () => {
        cy.get('footer') // cy.get seleciona o elemento que quer testar
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com')
      })

      context('List of stories', () => {
        const stories = require('../fixtures/stories')// require : É uma função do Node.js usada para importar módulos ou bibliotecas em um arquivo de teste. Ela permite que você utilize funcionalidades de outros arquivos JavaScript ou pacotes de terceiros dentro do seu código
        it('shows the right data for all rendered stories', () => {
          cy.get('.item')
            .first()
            .should('be.visible')
            .should('contain', stories.hits[0].title)
            .and('contain', stories.hits[0].author)
            .and('contain', stories.hits[0].num_comments)
            .and('contain', stories.hits[0].points)
          cy.get(`.item a:contains(${stories.hits[0].title})`)// esta perguntando se meu stories( esta no stories.json ) tem um title .
            .should('have.attr', 'href', stories.hits[0].url)// Foi feita a verficação de que atributo href contin uma url

          cy.get('.item')
            .last()
            .should('be.visible')
            .should('contain', stories.hits[1].title)
            .and('contain', stories.hits[1].author)
            .and('contain', stories.hits[1].num_comments)
            .and('contain', stories.hits[1].points)
          cy.get(`.item a:contains(${stories.hits[1].title})`)
            .should('have.attr', 'href', stories.hits[1].url)
        })

        // "exibe apenas dezenove histórias após dispensar a primeira história."
        it('shows one less after dimissing the first one', () => {
          cy.get('.button-small')
            .first()
            .should('be.visible')
            .click()

          cy.get('.item').should('have.length', 1)
        })

        // Since the API is external,
        // I can't control what it will provide to the frontend,
        // and so, how can I test ordering?
        // This is why these tests are being skipped.
        // TODO: Find a way to test them out.

        // ordenar por
        context('Order by', () => {
          // Ordena por título
          it('orders by title', () => {
            cy.get('.list-header-button:contains(Title)')
              .as('titleHeader')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].title)
            cy.get(`.item a:contains(${stories.hits[0].title})`)
              .should('have.attr', 'href', stories.hits[0].url)

            cy.get('@titleHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].title)
            cy.get(`.item a:contains(${stories.hits[1].title})`)
              .should('have.attr', 'href', stories.hits[1].url)
          })

          // Ordena por autor
          it('orders by author', () => {
            cy.get('.list-header-button:contains(Author)')
              .as('authorHeader')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].author)

            cy.get('@authorHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].author)
          })

          // Ordena por comentário
          it('orders by comments', () => {
            cy.get('.list-header-button:contains(Comments)')
              .as('commentsHeader')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].num_comments)

            cy.get('@commentsHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].num_comments)
          })

          // Ordena por pontos
          it('orders by points', () => {
            cy.get('.list-header-button:contains(Points)')
              .as('pointsHeader')
              .should('be.visible')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].points)

            cy.get('@pointsHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].points)
          })
        })
      })
    })

    context('Search', () => {
      // interceptando requisição inicial
      beforeEach(() => {
        cy.intercept(
          'GET',
        `**/search?query=${initialTerm}&page=0`,
        { fixture: 'emtpy' }// fixture sempre dentro dos contextos.
        ).as('getEmtpyStories')
        // interceptando requisição da busca
        cy.intercept(
          'GET',
        `**/search?query=${newTerm}&page=0`,
        { fixture: 'stories' }// fixture sempre dentro dos contextos.
        ).as('getStories')

        cy.visit('/')
        cy.wait('@getEmtpyStories')

        cy.get('#search')
          .should('be.visible')
          .clear()
      })

      it('shows no story when none is returned', () => {
        cy.get('.item').should('not.exist')
      })

      // Digite e pressione enter
      it('types and hits ENTER', () => {
        cy.get('#search')
          .should('be.visible')
          .type(`${newTerm}{enter}`)

        cy.wait('@getStories')

        cy.getLocalStorage('search')
          .should('be.equal',newTerm)

        cy.get('.item').should('have.length', 2)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })
      // Digite e click no botão de enviar.
      it('types and clicks the submit button', () => {
        cy.get('#search')
          .should('be.visible')
          .type(newTerm)
        cy.contains('Submit')
          .should('be.visible')
          .click()

        cy.wait('@getStories')

        cy.getLocalStorage('search')
          .should('be.equal',newTerm)

        cy.get('.item').should('have.length', 2)
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
        const {faker} = require('@faker-js/faker')// Busca palavras aleatorias
        cy.intercept(
          'GET',
          '**/search**', // Como vimos que ele esta usando palavrar aleatorias , usamos '**/search**' para qualquer busca que ele fizer, " Busca aleatoria"
          { fixture: 'emtpy' } // com as fixture sem usar uma api real o teste demora mais . agora usando as fixture, o texto roda mais rapido.
        ).as('getRandomStories') // Demos um alias para interceptar a requisição

        Cypress._.times(6, () => {
          const randomWord = faker.word.sample()
          cy.get('#search')
            .clear()
            .type(`${randomWord}{enter}`)// utilizamos palavra random do tipo faker( faker é uma biblioteca) para buscar palavra aleatorias
            // Depois de cada buscas aguardamos a requisição acabar
          cy.wait('@getRandomStories')// requisição !
          cy.getLocalStorage('search')
            .should('be.equal', randomWord)
            
        })
        // Essa opcão é usada quando voce tem um seletor do css muito grande. Forma de escopo. ali vc esta falando " pega todos os seletos com a classe .last-searches" e encontre todos os botoes. 
        cy.get('.last-searches')// ultimas buscas pesquisadas
            .within(() => {
                cy.get('button').should('have.length', 5) // verifica que foram as 5 ultimas .
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

  it('shows a "Loading ..." state before showing the results', () => {
    cy.intercept(
      'GET',
      '**/search**',
      //obejto 
      {
        delay: 1000,
        fixture: 'stories'
      }
    ).as('getDelayedStories')

    cy.visit('/')
  
    cy.assertLoadingIsShownAndHidden()//verificação loading.. é exibido e dps escondido 
    cy.wait('@getDelayedStories')
    cy.get('.item').should('have.length', 2)
  })



