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
  let username: string;
  let password: string;
  const cnssRateSample = { year: 15204, employeeRate: 1277.49, employerRate: 14392.7, smig: 13267.35, effectiveFrom: '2026-04-08' };

  let cnssRate;

  before(() => {
    cy.credentials().then(credentials => {
      ({ username, password } = credentials);
    });
  });

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
      cy.visit(cnssRatePageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('CnssRate');
    });

    it('should create an instance of CnssRate', () => {
      cy.get(`[data-cy="year"]`).type('5122');
      cy.get(`[data-cy="year"]`).should('have.value', '5122');

      cy.get(`[data-cy="salaryCeiling"]`).type('17759.51');
      cy.get(`[data-cy="salaryCeiling"]`).should('have.value', '17759.51');

      cy.get(`[data-cy="employeeRate"]`).type('14173.08');
      cy.get(`[data-cy="employeeRate"]`).should('have.value', '14173.08');

      cy.get(`[data-cy="employerRate"]`).type('8812.36');
      cy.get(`[data-cy="employerRate"]`).should('have.value', '8812.36');

      cy.get(`[data-cy="cavisEmployee"]`).type('2112.49');
      cy.get(`[data-cy="cavisEmployee"]`).should('have.value', '2112.49');

      cy.get(`[data-cy="cavisEmployer"]`).type('11405.14');
      cy.get(`[data-cy="cavisEmployer"]`).should('have.value', '11405.14');

      cy.get(`[data-cy="smig"]`).type('22116.62');
      cy.get(`[data-cy="smig"]`).should('have.value', '22116.62');

      cy.get(`[data-cy="effectiveFrom"]`).type('2026-04-07');
      cy.get(`[data-cy="effectiveFrom"]`).blur();
      cy.get(`[data-cy="effectiveFrom"]`).should('have.value', '2026-04-07');

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
