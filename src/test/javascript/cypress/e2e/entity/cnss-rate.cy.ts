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

describe('CnssRate e2e test', () => {
  const cnssRatePageUrl = '/cnss-rate';
  const cnssRatePageUrlPattern = new RegExp('/cnss-rate(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const cnssRateSample = { year: 3569, employeeRate: 32585.57, employerRate: 18237.06, smig: 9150.86, effectiveFrom: '2026-03-30' };

  let cnssRate;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/cnss-rates+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/cnss-rates').as('postEntityRequest');
    cy.intercept('DELETE', '/api/cnss-rates/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (cnssRate) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/cnss-rates/${cnssRate.id}`,
      }).then(() => {
        cnssRate = undefined;
      });
    }
  });

  it('CnssRates menu should load CnssRates page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('cnss-rate');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('CnssRate').should('exist');
    cy.url().should('match', cnssRatePageUrlPattern);
  });

  describe('CnssRate page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(cnssRatePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create CnssRate page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/cnss-rate/new$'));
        cy.getEntityCreateUpdateHeading('CnssRate');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', cnssRatePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/cnss-rates',
          body: cnssRateSample,
        }).then(({ body }) => {
          cnssRate = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/cnss-rates+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [cnssRate],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(cnssRatePageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details CnssRate page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('cnssRate');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', cnssRatePageUrlPattern);
      });

      it('edit button click should load edit CnssRate page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('CnssRate');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', cnssRatePageUrlPattern);
      });

      it('edit button click should load edit CnssRate page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('CnssRate');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', cnssRatePageUrlPattern);
      });

      it('last delete button click should delete instance of CnssRate', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('cnssRate').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', cnssRatePageUrlPattern);

        cnssRate = undefined;
      });
    });
  });

  describe('new CnssRate page', () => {
    beforeEach(() => {
      cy.visit(`${cnssRatePageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('CnssRate');
    });

    it('should create an instance of CnssRate', () => {
      cy.get(`[data-cy="year"]`).type('29909');
      cy.get(`[data-cy="year"]`).should('have.value', '29909');

      cy.get(`[data-cy="salaryCeiling"]`).type('10638.55');
      cy.get(`[data-cy="salaryCeiling"]`).should('have.value', '10638.55');

      cy.get(`[data-cy="employeeRate"]`).type('31249.06');
      cy.get(`[data-cy="employeeRate"]`).should('have.value', '31249.06');

      cy.get(`[data-cy="employerRate"]`).type('17654.82');
      cy.get(`[data-cy="employerRate"]`).should('have.value', '17654.82');

      cy.get(`[data-cy="cavisEmployee"]`).type('24805.46');
      cy.get(`[data-cy="cavisEmployee"]`).should('have.value', '24805.46');

      cy.get(`[data-cy="cavisEmployer"]`).type('25015.74');
      cy.get(`[data-cy="cavisEmployer"]`).should('have.value', '25015.74');

      cy.get(`[data-cy="smig"]`).type('4216.3');
      cy.get(`[data-cy="smig"]`).should('have.value', '4216.3');

      cy.get(`[data-cy="effectiveFrom"]`).type('2026-03-31');
      cy.get(`[data-cy="effectiveFrom"]`).blur();
      cy.get(`[data-cy="effectiveFrom"]`).should('have.value', '2026-03-31');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        cnssRate = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', cnssRatePageUrlPattern);
    });
  });
});
