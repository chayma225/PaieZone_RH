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

describe('ChatSession e2e test', () => {
  const chatSessionPageUrl = '/chat-session';
  const chatSessionPageUrlPattern = new RegExp('/chat-session(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  // const chatSessionSample = {"channel":"MOBILE","status":"ESCALATED","startedAt":"2026-03-31T12:41:58.799Z"};

  let chatSession;
  // let employee;

  beforeEach(() => {
    cy.login(username, password);
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/employees',
      body: {"matricule":"concurrence gigantes","firstName":"Clotaire","lastName":"Aubert","firstNameAr":"aimable","lastNameAr":"en dedans de bof","birthDate":"2026-03-31","birthPlace":"considérable ronron membre à vie","gender":"MALE","maritalStatus":"MARRIED","numberOfChildren":3,"chefDeFamille":false,"nationalId":"lors de biathlète da","passportNumber":"multiple","nationality":"affranchir membre du personnel","address":"adepte sitôt que","city":"Saint-Paul","personalEmail":"même","professionalEmail":"d’autant que joliment","phoneNumber":"raisonner de peur qu","cnssNumber":"parfois équipe de re","category":"EXECUTIVE","photoUrl":"malgré sauf sans que","hireDate":"2026-03-31","trialEndDate":"2026-03-30","active":true,"notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","createdAt":"2026-03-30T19:04:14.444Z","updatedAt":"2026-03-31T00:33:34.763Z"},
    }).then(({ body }) => {
      employee = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/chat-sessions+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/chat-sessions').as('postEntityRequest');
    cy.intercept('DELETE', '/api/chat-sessions/*').as('deleteEntityRequest');
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/employees', {
      statusCode: 200,
      body: [employee],
    });

  });
   */

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

  /* Disabled due to incompatibility
  afterEach(() => {
    if (employee) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/employees/${employee.id}`,
      }).then(() => {
        employee = undefined;
      });
    }
  });
   */

  it('ChatSessions menu should load ChatSessions page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('chat-session');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('ChatSession').should('exist');
    cy.url().should('match', chatSessionPageUrlPattern);
  });

  describe('ChatSession page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(chatSessionPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create ChatSession page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/chat-session/new$'));
        cy.getEntityCreateUpdateHeading('ChatSession');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', chatSessionPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/chat-sessions',
          body: {
            ...chatSessionSample,
            employee: employee,
          },
        }).then(({ body }) => {
          chatSession = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/chat-sessions+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [chatSession],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(chatSessionPageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(chatSessionPageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details ChatSession page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('chatSession');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', chatSessionPageUrlPattern);
      });

      it('edit button click should load edit ChatSession page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('ChatSession');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', chatSessionPageUrlPattern);
      });

      it('edit button click should load edit ChatSession page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('ChatSession');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', chatSessionPageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of ChatSession', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('chatSession').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', chatSessionPageUrlPattern);

        chatSession = undefined;
      });
    });
  });

  describe('new ChatSession page', () => {
    beforeEach(() => {
      cy.visit(`${chatSessionPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('ChatSession');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of ChatSession', () => {
      cy.get(`[data-cy="channel"]`).select('MOBILE');

      cy.get(`[data-cy="status"]`).select('EXPIRED');

      cy.get(`[data-cy="startedAt"]`).type('2026-03-31T11:47');
      cy.get(`[data-cy="startedAt"]`).blur();
      cy.get(`[data-cy="startedAt"]`).should('have.value', '2026-03-31T11:47');

      cy.get(`[data-cy="endedAt"]`).type('2026-03-31T17:16');
      cy.get(`[data-cy="endedAt"]`).blur();
      cy.get(`[data-cy="endedAt"]`).should('have.value', '2026-03-31T17:16');

      cy.get(`[data-cy="escalatedAt"]`).type('2026-03-31T14:34');
      cy.get(`[data-cy="escalatedAt"]`).blur();
      cy.get(`[data-cy="escalatedAt"]`).should('have.value', '2026-03-31T14:34');

      cy.get(`[data-cy="escalatedTo"]`).type('rassurer');
      cy.get(`[data-cy="escalatedTo"]`).should('have.value', 'rassurer');

      cy.get(`[data-cy="contextData"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="contextData"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="satisfactionScore"]`).type('2');
      cy.get(`[data-cy="satisfactionScore"]`).should('have.value', '2');

      cy.get(`[data-cy="employee"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        chatSession = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', chatSessionPageUrlPattern);
    });
  });
});
