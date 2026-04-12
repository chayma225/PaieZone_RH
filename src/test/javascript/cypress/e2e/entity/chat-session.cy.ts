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
  let username: string;
  let password: string;
  // const chatSessionSample = {"channel":"MOBILE","status":"ACTIVE","startedAt":"2026-04-08T13:46:44.934Z"};

  let chatSession;
  // let employee;

  before(() => {
    cy.credentials().then(credentials => {
      ({ username, password } = credentials);
    });
  });

  beforeEach(() => {
    cy.login(username, password);
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/employees',
      body: {"matricule":"bè à l'égard de","firstName":"Mégane","lastName":"Vidal","firstNameAr":"alors que concernant","lastNameAr":"communauté étudiante debout","birthDate":"2026-04-08","birthPlace":"du moment que ailleurs","gender":"FEMALE","maritalStatus":"SINGLE","numberOfChildren":4,"chefDeFamille":false,"nationalId":"de manière à ce que","passportNumber":"cerner considérable","nationality":"avant de administration","address":"coin-coin trop comment","city":"Nîmes","personalEmail":"après que souple","professionalEmail":"lâche","phoneNumber":"écrire","cnssNumber":"à peine porte-parole","category":"MANAGER","photoUrl":"triathlète ronron debout","hireDate":"2026-04-08","trialEndDate":"2026-04-08","active":false,"notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","createdAt":"2026-04-08T06:18:16.224Z","updatedAt":"2026-04-08T06:16:16.075Z"},
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
      cy.visit(chatSessionPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('ChatSession');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of ChatSession', () => {
      cy.get(`[data-cy="channel"]`).select('WEB');

      cy.get(`[data-cy="status"]`).select('ESCALATED');

      cy.get(`[data-cy="startedAt"]`).type('2026-04-08T07:20');
      cy.get(`[data-cy="startedAt"]`).blur();
      cy.get(`[data-cy="startedAt"]`).should('have.value', '2026-04-08T07:20');

      cy.get(`[data-cy="endedAt"]`).type('2026-04-08T00:43');
      cy.get(`[data-cy="endedAt"]`).blur();
      cy.get(`[data-cy="endedAt"]`).should('have.value', '2026-04-08T00:43');

      cy.get(`[data-cy="escalatedAt"]`).type('2026-04-08T08:46');
      cy.get(`[data-cy="escalatedAt"]`).blur();
      cy.get(`[data-cy="escalatedAt"]`).should('have.value', '2026-04-08T08:46');

      cy.get(`[data-cy="escalatedTo"]`).type('direction');
      cy.get(`[data-cy="escalatedTo"]`).should('have.value', 'direction');

      cy.get(`[data-cy="contextData"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="contextData"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="satisfactionScore"]`).type('5');
      cy.get(`[data-cy="satisfactionScore"]`).should('have.value', '5');

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
