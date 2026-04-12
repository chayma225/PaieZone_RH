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

describe('OfficialDocument e2e test', () => {
  const officialDocumentPageUrl = '/official-document';
  const officialDocumentPageUrlPattern = new RegExp('/official-document(\\?.*)?$');
  let username: string;
  let password: string;
  const officialDocumentSample = {
    docType: 'IRPP_WITHHOLDING',
    title: 'tellement antagoniste',
    year: 24987,
    generatedAt: '2026-04-08T07:58:04.956Z',
  };

  let officialDocument;
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
        name: 'afin que enfin',
        tradeName: 'au cas où broum',
        taxId: "à l'encontre de grat",
        cnssId: 'fort rédaction',
        address: 'broum partout',
        city: 'Avignon',
        postalCode: 'actionnair',
        phone: '+33 701010922',
        email: 'Martin.Robin@gmail.com',
        logoUrl: 'égoïste',
        tenantSchema: 'comme près ouin',
        active: true,
        trialEnd: '2026-04-07',
        createdAt: '2026-04-08T01:30:16.812Z',
      },
    }).then(({ body }) => {
      company = body;
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/official-documents+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/official-documents').as('postEntityRequest');
    cy.intercept('DELETE', '/api/official-documents/*').as('deleteEntityRequest');
  });

  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/companies', {
      statusCode: 200,
      body: [company],
    });

    cy.intercept('GET', '/api/employees', {
      statusCode: 200,
      body: [],
    });

    cy.intercept('GET', '/api/user-profiles', {
      statusCode: 200,
      body: [],
    });
  });

  afterEach(() => {
    if (officialDocument) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/official-documents/${officialDocument.id}`,
      }).then(() => {
        officialDocument = undefined;
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

  it('OfficialDocuments menu should load OfficialDocuments page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('official-document');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('OfficialDocument').should('exist');
    cy.url().should('match', officialDocumentPageUrlPattern);
  });

  describe('OfficialDocument page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(officialDocumentPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create OfficialDocument page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/official-document/new$'));
        cy.getEntityCreateUpdateHeading('OfficialDocument');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', officialDocumentPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/official-documents',
          body: {
            ...officialDocumentSample,
            company,
          },
        }).then(({ body }) => {
          officialDocument = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/official-documents+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/official-documents?page=0&size=20>; rel="last",<http://localhost/api/official-documents?page=0&size=20>; rel="first"',
              },
              body: [officialDocument],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(officialDocumentPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details OfficialDocument page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('officialDocument');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', officialDocumentPageUrlPattern);
      });

      it('edit button click should load edit OfficialDocument page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('OfficialDocument');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', officialDocumentPageUrlPattern);
      });

      it('edit button click should load edit OfficialDocument page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('OfficialDocument');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', officialDocumentPageUrlPattern);
      });

      it('last delete button click should delete instance of OfficialDocument', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('officialDocument').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', officialDocumentPageUrlPattern);

        officialDocument = undefined;
      });
    });
  });

  describe('new OfficialDocument page', () => {
    beforeEach(() => {
      cy.visit(officialDocumentPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('OfficialDocument');
    });

    it('should create an instance of OfficialDocument', () => {
      cy.get(`[data-cy="docType"]`).select('IRPP_WITHHOLDING');

      cy.get(`[data-cy="title"]`).type('passer redonner plic');
      cy.get(`[data-cy="title"]`).should('have.value', 'passer redonner plic');

      cy.get(`[data-cy="month"]`).type('9');
      cy.get(`[data-cy="month"]`).should('have.value', '9');

      cy.get(`[data-cy="year"]`).type('11098');
      cy.get(`[data-cy="year"]`).should('have.value', '11098');

      cy.get(`[data-cy="generatedAt"]`).type('2026-04-08T09:25');
      cy.get(`[data-cy="generatedAt"]`).blur();
      cy.get(`[data-cy="generatedAt"]`).should('have.value', '2026-04-08T09:25');

      cy.get(`[data-cy="fileUrl"]`).type("croâ à l'exception de à la merci");
      cy.get(`[data-cy="fileUrl"]`).should('have.value', "croâ à l'exception de à la merci");

      cy.get(`[data-cy="signedBy"]`).type('hebdomadaire infime');
      cy.get(`[data-cy="signedBy"]`).should('have.value', 'hebdomadaire infime');

      cy.get(`[data-cy="sentAt"]`).type('2026-04-07T23:35');
      cy.get(`[data-cy="sentAt"]`).blur();
      cy.get(`[data-cy="sentAt"]`).should('have.value', '2026-04-07T23:35');

      cy.get(`[data-cy="notes"]`).type('euh après que trop');
      cy.get(`[data-cy="notes"]`).should('have.value', 'euh après que trop');

      cy.get(`[data-cy="company"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        officialDocument = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', officialDocumentPageUrlPattern);
    });
  });
});
