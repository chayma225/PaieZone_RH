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

describe('CompanySubscription e2e test', () => {
  const companySubscriptionPageUrl = '/company-subscription';
  const companySubscriptionPageUrlPattern = new RegExp('/company-subscription(\\?.*)?$');
  let username: string;
  let password: string;
  const companySubscriptionSample = {
    plan: 'STARTER',
    status: 'CANCELLED',
    maxEmployees: 7632,
    priceHT: 23348.92,
    billingDay: 16682,
    startDate: '2026-04-08',
  };

  let companySubscription;

  before(() => {
    cy.credentials().then(credentials => {
      ({ username, password } = credentials);
    });
  });

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/company-subscriptions+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/company-subscriptions').as('postEntityRequest');
    cy.intercept('DELETE', '/api/company-subscriptions/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (companySubscription) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/company-subscriptions/${companySubscription.id}`,
      }).then(() => {
        companySubscription = undefined;
      });
    }
  });

  it('CompanySubscriptions menu should load CompanySubscriptions page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('company-subscription');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('CompanySubscription').should('exist');
    cy.url().should('match', companySubscriptionPageUrlPattern);
  });

  describe('CompanySubscription page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(companySubscriptionPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create CompanySubscription page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/company-subscription/new$'));
        cy.getEntityCreateUpdateHeading('CompanySubscription');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', companySubscriptionPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/company-subscriptions',
          body: companySubscriptionSample,
        }).then(({ body }) => {
          companySubscription = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/company-subscriptions+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [companySubscription],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(companySubscriptionPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details CompanySubscription page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('companySubscription');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', companySubscriptionPageUrlPattern);
      });

      it('edit button click should load edit CompanySubscription page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('CompanySubscription');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', companySubscriptionPageUrlPattern);
      });

      it('edit button click should load edit CompanySubscription page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('CompanySubscription');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', companySubscriptionPageUrlPattern);
      });

      it('last delete button click should delete instance of CompanySubscription', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('companySubscription').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', companySubscriptionPageUrlPattern);

        companySubscription = undefined;
      });
    });
  });

  describe('new CompanySubscription page', () => {
    beforeEach(() => {
      cy.visit(companySubscriptionPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('CompanySubscription');
    });

    it('should create an instance of CompanySubscription', () => {
      cy.get(`[data-cy="plan"]`).select('ENTERPRISE');

      cy.get(`[data-cy="status"]`).select('SUSPENDED');

      cy.get(`[data-cy="maxEmployees"]`).type('1886');
      cy.get(`[data-cy="maxEmployees"]`).should('have.value', '1886');

      cy.get(`[data-cy="priceHT"]`).type('23579.95');
      cy.get(`[data-cy="priceHT"]`).should('have.value', '23579.95');

      cy.get(`[data-cy="billingDay"]`).type('17860');
      cy.get(`[data-cy="billingDay"]`).should('have.value', '17860');

      cy.get(`[data-cy="startDate"]`).type('2026-04-08');
      cy.get(`[data-cy="startDate"]`).blur();
      cy.get(`[data-cy="startDate"]`).should('have.value', '2026-04-08');

      cy.get(`[data-cy="endDate"]`).type('2026-04-08');
      cy.get(`[data-cy="endDate"]`).blur();
      cy.get(`[data-cy="endDate"]`).should('have.value', '2026-04-08');

      cy.get(`[data-cy="renewalDate"]`).type('2026-04-08');
      cy.get(`[data-cy="renewalDate"]`).blur();
      cy.get(`[data-cy="renewalDate"]`).should('have.value', '2026-04-08');

      cy.get(`[data-cy="notes"]`).type('juriste insipide mince');
      cy.get(`[data-cy="notes"]`).should('have.value', 'juriste insipide mince');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        companySubscription = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', companySubscriptionPageUrlPattern);
    });
  });
});
