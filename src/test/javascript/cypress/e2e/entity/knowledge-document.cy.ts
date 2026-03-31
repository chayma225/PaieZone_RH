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

describe('KnowledgeDocument e2e test', () => {
  const knowledgeDocumentPageUrl = '/knowledge-document';
  const knowledgeDocumentPageUrlPattern = new RegExp('/knowledge-document(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const knowledgeDocumentSample = {
    title: "d'après diététiste aussitôt",
    content: 'Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=',
    vectorIndexed: false,
    active: true,
    createdAt: '2026-03-30T20:38:17.648Z',
  };

  let knowledgeDocument;
  let company;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/companies',
      body: {
        name: "capter pschitt à l'exception de",
        tradeName: 'ha ha alors que vaste',
        taxId: 'après que vroum',
        cnssId: 'ailleurs',
        address: 'errer',
        city: 'Béziers',
        postalCode: 'étant donn',
        phone: '+33 178962827',
        email: 'Justine45@gmail.com',
        logoUrl: 'dans la mesure où jusqu’à ce que pin-pon',
        tenantSchema: 'pschitt ouch',
        active: true,
        trialEnd: '2026-03-31',
        createdAt: '2026-03-31T06:25:48.846Z',
      },
    }).then(({ body }) => {
      company = body;
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/knowledge-documents+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/knowledge-documents').as('postEntityRequest');
    cy.intercept('DELETE', '/api/knowledge-documents/*').as('deleteEntityRequest');
  });

  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/companies', {
      statusCode: 200,
      body: [company],
    });
  });

  afterEach(() => {
    if (knowledgeDocument) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/knowledge-documents/${knowledgeDocument.id}`,
      }).then(() => {
        knowledgeDocument = undefined;
      });
    }
  });

  afterEach(() => {
    if (company) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/companies/${company.id}`,
      }).then(() => {
        company = undefined;
      });
    }
  });

  it('KnowledgeDocuments menu should load KnowledgeDocuments page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('knowledge-document');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('KnowledgeDocument').should('exist');
    cy.url().should('match', knowledgeDocumentPageUrlPattern);
  });

  describe('KnowledgeDocument page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(knowledgeDocumentPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create KnowledgeDocument page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/knowledge-document/new$'));
        cy.getEntityCreateUpdateHeading('KnowledgeDocument');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', knowledgeDocumentPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/knowledge-documents',
          body: {
            ...knowledgeDocumentSample,
            company,
          },
        }).then(({ body }) => {
          knowledgeDocument = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/knowledge-documents+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [knowledgeDocument],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(knowledgeDocumentPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details KnowledgeDocument page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('knowledgeDocument');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', knowledgeDocumentPageUrlPattern);
      });

      it('edit button click should load edit KnowledgeDocument page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('KnowledgeDocument');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', knowledgeDocumentPageUrlPattern);
      });

      it('edit button click should load edit KnowledgeDocument page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('KnowledgeDocument');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', knowledgeDocumentPageUrlPattern);
      });

      it('last delete button click should delete instance of KnowledgeDocument', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('knowledgeDocument').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', knowledgeDocumentPageUrlPattern);

        knowledgeDocument = undefined;
      });
    });
  });

  describe('new KnowledgeDocument page', () => {
    beforeEach(() => {
      cy.visit(`${knowledgeDocumentPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('KnowledgeDocument');
    });

    it('should create an instance of KnowledgeDocument', () => {
      cy.get(`[data-cy="title"]`).type('flotter désormais');
      cy.get(`[data-cy="title"]`).should('have.value', 'flotter désormais');

      cy.get(`[data-cy="category"]`).type('trop membre à vie');
      cy.get(`[data-cy="category"]`).should('have.value', 'trop membre à vie');

      cy.get(`[data-cy="content"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="content"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="fileUrl"]`).type('que sage');
      cy.get(`[data-cy="fileUrl"]`).should('have.value', 'que sage');

      cy.get(`[data-cy="vectorIndexed"]`).should('not.be.checked');
      cy.get(`[data-cy="vectorIndexed"]`).click();
      cy.get(`[data-cy="vectorIndexed"]`).should('be.checked');

      cy.get(`[data-cy="indexedAt"]`).type('2026-03-31T15:05');
      cy.get(`[data-cy="indexedAt"]`).blur();
      cy.get(`[data-cy="indexedAt"]`).should('have.value', '2026-03-31T15:05');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(`[data-cy="createdAt"]`).type('2026-03-31T13:36');
      cy.get(`[data-cy="createdAt"]`).blur();
      cy.get(`[data-cy="createdAt"]`).should('have.value', '2026-03-31T13:36');

      cy.get(`[data-cy="company"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        knowledgeDocument = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', knowledgeDocumentPageUrlPattern);
    });
  });
});
