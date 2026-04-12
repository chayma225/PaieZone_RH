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
  let username: string;
  let password: string;
  const knowledgeDocumentSample = {
    title: 'derrière',
    content: 'Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=',
    vectorIndexed: true,
    active: true,
    createdAt: '2026-04-08T10:18:20.725Z',
  };

  let knowledgeDocument;
  let company;

  before(() => {
    cy.credentials().then(credentials => {
      ({ username, password } = credentials);
    });
  });

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/companies',
      body: {
        name: 'moyennant puis tant',
        tradeName: 'extra spécialiste juriste',
        taxId: 'fidèle',
        cnssId: 'que même si ah',
        address: 'autoriser hier triompher',
        city: 'Cannes',
        postalCode: 'entreprend',
        phone: '+33 747093299',
        email: 'Achille71@hotmail.fr',
        logoUrl: 'glouglou environ',
        tenantSchema: 'combler atchoum précisément',
        active: true,
        trialEnd: '2026-04-07',
        createdAt: '2026-04-08T17:07:29.946Z',
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
      cy.visit(knowledgeDocumentPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('KnowledgeDocument');
    });

    it('should create an instance of KnowledgeDocument', () => {
      cy.get(`[data-cy="title"]`).type('deçà conformer depuis');
      cy.get(`[data-cy="title"]`).should('have.value', 'deçà conformer depuis');

      cy.get(`[data-cy="category"]`).type('snob énumérer diplomate');
      cy.get(`[data-cy="category"]`).should('have.value', 'snob énumérer diplomate');

      cy.get(`[data-cy="content"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="content"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="fileUrl"]`).type('frapper quand');
      cy.get(`[data-cy="fileUrl"]`).should('have.value', 'frapper quand');

      cy.get(`[data-cy="vectorIndexed"]`).should('not.be.checked');
      cy.get(`[data-cy="vectorIndexed"]`).click();
      cy.get(`[data-cy="vectorIndexed"]`).should('be.checked');

      cy.get(`[data-cy="indexedAt"]`).type('2026-04-08T15:14');
      cy.get(`[data-cy="indexedAt"]`).blur();
      cy.get(`[data-cy="indexedAt"]`).should('have.value', '2026-04-08T15:14');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(`[data-cy="createdAt"]`).type('2026-04-07T21:07');
      cy.get(`[data-cy="createdAt"]`).blur();
      cy.get(`[data-cy="createdAt"]`).should('have.value', '2026-04-07T21:07');

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
