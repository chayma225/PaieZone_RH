import {
  entityConfirmDeleteButtonSelector,
  entityCreateButtonSelector,
  entityCreateCancelButtonSelector,
  entityCreateSaveButtonSelector,
  entityDeleteButtonSelector,
  entityDetailsBackButtonSelector,
  entityDetailsButtonSelector,
  entityEditButtonSelector,
  entityTableSelector,
} from '../../support/entity';

describe('ChatMessage e2e test', () => {
  const chatMessagePageUrl = '/chat-message';
  const chatMessagePageUrlPattern = new RegExp('/chat-message(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  // const chatMessageSample = {"role":"USER","content":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","sentAt":"2026-03-31T18:04:50.200Z"};

  let chatMessage;
  // let chatSession;

  beforeEach(() => {
    cy.login(username, password);
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/chat-sessions',
      body: {"channel":"MOBILE","status":"ACTIVE","startedAt":"2026-03-31T10:38:26.796Z","endedAt":"2026-03-31T01:09:59.468Z","escalatedAt":"2026-03-31T15:07:36.708Z","escalatedTo":"après que partenaire","contextData":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","satisfactionScore":3},
    }).then(({ body }) => {
      chatSession = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/chat-messages+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/chat-messages').as('postEntityRequest');
    cy.intercept('DELETE', '/api/chat-messages/*').as('deleteEntityRequest');
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/chat-sessions', {
      statusCode: 200,
      body: [chatSession],
    });

  });
   */

  afterEach(() => {
    if (chatMessage) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/chat-messages/${chatMessage.id}`,
      }).then(() => {
        chatMessage = undefined;
      });
    }
  });

  /* Disabled due to incompatibility
  afterEach(() => {
    if (chatSession) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/chat-sessions/${chatSession.id}`,
      }).then(() => {
        chatSession = undefined;
      });
    }
  });
   */

  it('ChatMessages menu should load ChatMessages page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('chat-message');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('ChatMessage').should('exist');
    cy.url().should('match', chatMessagePageUrlPattern);
  });

  describe('ChatMessage page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(chatMessagePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create ChatMessage page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/chat-message/new$'));
        cy.getEntityCreateUpdateHeading('ChatMessage');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', chatMessagePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/chat-messages',
          body: {
            ...chatMessageSample,
            session: chatSession,
          },
        }).then(({ body }) => {
          chatMessage = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/chat-messages+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/chat-messages?page=0&size=20>; rel="last",<http://localhost/api/chat-messages?page=0&size=20>; rel="first"',
              },
              body: [chatMessage],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(chatMessagePageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(chatMessagePageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details ChatMessage page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('chatMessage');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', chatMessagePageUrlPattern);
      });

      it('edit button click should load edit ChatMessage page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('ChatMessage');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', chatMessagePageUrlPattern);
      });

      it('edit button click should load edit ChatMessage page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('ChatMessage');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', chatMessagePageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of ChatMessage', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('chatMessage').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', chatMessagePageUrlPattern);

        chatMessage = undefined;
      });
    });
  });

  describe('new ChatMessage page', () => {
    beforeEach(() => {
      cy.visit(`${chatMessagePageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('ChatMessage');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of ChatMessage', () => {
      cy.get(`[data-cy="role"]`).select('SYSTEM');

      cy.get(`[data-cy="content"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="content"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="intent"]`).select('HR_QUESTION');

      cy.get(`[data-cy="actionTaken"]`).type('orange pff minuscule');
      cy.get(`[data-cy="actionTaken"]`).should('have.value', 'orange pff minuscule');

      cy.get(`[data-cy="tokenUsed"]`).type('4430');
      cy.get(`[data-cy="tokenUsed"]`).should('have.value', '4430');

      cy.get(`[data-cy="sentAt"]`).type('2026-03-30T23:00');
      cy.get(`[data-cy="sentAt"]`).blur();
      cy.get(`[data-cy="sentAt"]`).should('have.value', '2026-03-30T23:00');

      cy.get(`[data-cy="errorOccurred"]`).should('not.be.checked');
      cy.get(`[data-cy="errorOccurred"]`).click();
      cy.get(`[data-cy="errorOccurred"]`).should('be.checked');

      cy.get(`[data-cy="session"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        chatMessage = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', chatMessagePageUrlPattern);
    });
  });
});
