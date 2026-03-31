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

describe('Rubrique e2e test', () => {
  const rubriquePageUrl = '/rubrique';
  const rubriquePageUrlPattern = new RegExp('/rubrique(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const rubriqueSample = {
    code: 'bof paf',
    label: 'crac',
    rubriqueType: 'DEDUCTION',
    base: 'PERCENT_BRUT',
    taxable: false,
    cnssSalary: true,
    cnssEmployer: true,
    sortOrder: 18800,
    active: false,
  };

  let rubrique;
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
        name: 'snif',
        tradeName: 'boum psitt amorcer',
        taxId: 'volontiers',
        cnssId: 'cocorico',
        address: 'horrible hé depuis',
        city: 'Lorient',
        postalCode: 'ouch décou',
        phone: '0623567430',
        email: 'Conception.Roche@gmail.com',
        logoUrl: 'hi',
        tenantSchema: 'sacrifier pourvu que',
        active: true,
        trialEnd: '2026-03-30',
        createdAt: '2026-03-31T15:46:49.748Z',
      },
    }).then(({ body }) => {
      company = body;
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/rubriques+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/rubriques').as('postEntityRequest');
    cy.intercept('DELETE', '/api/rubriques/*').as('deleteEntityRequest');
  });

  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/companies', {
      statusCode: 200,
      body: [company],
    });
  });

  afterEach(() => {
    if (rubrique) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/rubriques/${rubrique.id}`,
      }).then(() => {
        rubrique = undefined;
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

  it('Rubriques menu should load Rubriques page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('rubrique');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Rubrique').should('exist');
    cy.url().should('match', rubriquePageUrlPattern);
  });

  describe('Rubrique page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(rubriquePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Rubrique page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/rubrique/new$'));
        cy.getEntityCreateUpdateHeading('Rubrique');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', rubriquePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/rubriques',
          body: {
            ...rubriqueSample,
            company,
          },
        }).then(({ body }) => {
          rubrique = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/rubriques+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [rubrique],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(rubriquePageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Rubrique page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('rubrique');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', rubriquePageUrlPattern);
      });

      it('edit button click should load edit Rubrique page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Rubrique');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', rubriquePageUrlPattern);
      });

      it('edit button click should load edit Rubrique page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Rubrique');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', rubriquePageUrlPattern);
      });

      it('last delete button click should delete instance of Rubrique', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('rubrique').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', rubriquePageUrlPattern);

        rubrique = undefined;
      });
    });
  });

  describe('new Rubrique page', () => {
    beforeEach(() => {
      cy.visit(`${rubriquePageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Rubrique');
    });

    it('should create an instance of Rubrique', () => {
      cy.get(`[data-cy="code"]`).type('égoïste altruiste');
      cy.get(`[data-cy="code"]`).should('have.value', 'égoïste altruiste');

      cy.get(`[data-cy="label"]`).type('plic concurrence délivrer');
      cy.get(`[data-cy="label"]`).should('have.value', 'plic concurrence délivrer');

      cy.get(`[data-cy="labelAr"]`).type('au-dehors');
      cy.get(`[data-cy="labelAr"]`).should('have.value', 'au-dehors');

      cy.get(`[data-cy="rubriqueType"]`).select('GAIN');

      cy.get(`[data-cy="base"]`).select('PERCENT_NET');

      cy.get(`[data-cy="rate"]`).type('30536.72');
      cy.get(`[data-cy="rate"]`).should('have.value', '30536.72');

      cy.get(`[data-cy="fixedAmount"]`).type('10561.59');
      cy.get(`[data-cy="fixedAmount"]`).should('have.value', '10561.59');

      cy.get(`[data-cy="formula"]`).type('tant foule');
      cy.get(`[data-cy="formula"]`).should('have.value', 'tant foule');

      cy.get(`[data-cy="taxable"]`).should('not.be.checked');
      cy.get(`[data-cy="taxable"]`).click();
      cy.get(`[data-cy="taxable"]`).should('be.checked');

      cy.get(`[data-cy="cnssSalary"]`).should('not.be.checked');
      cy.get(`[data-cy="cnssSalary"]`).click();
      cy.get(`[data-cy="cnssSalary"]`).should('be.checked');

      cy.get(`[data-cy="cnssEmployer"]`).should('not.be.checked');
      cy.get(`[data-cy="cnssEmployer"]`).click();
      cy.get(`[data-cy="cnssEmployer"]`).should('be.checked');

      cy.get(`[data-cy="sortOrder"]`).type('6764');
      cy.get(`[data-cy="sortOrder"]`).should('have.value', '6764');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(`[data-cy="company"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        rubrique = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', rubriquePageUrlPattern);
    });
  });
});
