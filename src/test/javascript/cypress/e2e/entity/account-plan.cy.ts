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

describe('AccountPlan e2e test', () => {
  const accountPlanPageUrl = '/account-plan';
  const accountPlanPageUrlPattern = new RegExp('/account-plan(\\?.*)?$');
  let username: string;
  let password: string;
  const accountPlanSample = { accountCode: 'jeune enfant', accountLabel: 'présidence délégation', active: false };

  let accountPlan;
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
        name: 'areu areu du moment que',
        tradeName: 'zzzz',
        taxId: 'équipe en bas de',
        cnssId: 'aussitôt que',
        address: 'comparer groin groin',
        city: "Villeneuve-d'Ascq",
        postalCode: 'membre à v',
        phone: '+33 700559749',
        email: 'Moise.Renaud@gmail.com',
        logoUrl: 'jeune enfant de crainte que',
        tenantSchema: 'patientèle',
        active: false,
        trialEnd: '2026-04-08',
        createdAt: '2026-04-08T14:42:09.389Z',
      },
    }).then(({ body }) => {
      company = body;
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/account-plans+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/account-plans').as('postEntityRequest');
    cy.intercept('DELETE', '/api/account-plans/*').as('deleteEntityRequest');
  });

  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/companies', {
      statusCode: 200,
      body: [company],
    });
  });

  afterEach(() => {
    if (accountPlan) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/account-plans/${accountPlan.id}`,
      }).then(() => {
        accountPlan = undefined;
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

  it('AccountPlans menu should load AccountPlans page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('account-plan');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('AccountPlan').should('exist');
    cy.url().should('match', accountPlanPageUrlPattern);
  });

  describe('AccountPlan page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(accountPlanPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create AccountPlan page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/account-plan/new$'));
        cy.getEntityCreateUpdateHeading('AccountPlan');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', accountPlanPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/account-plans',
          body: {
            ...accountPlanSample,
            company,
          },
        }).then(({ body }) => {
          accountPlan = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/account-plans+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [accountPlan],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(accountPlanPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details AccountPlan page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('accountPlan');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', accountPlanPageUrlPattern);
      });

      it('edit button click should load edit AccountPlan page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('AccountPlan');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', accountPlanPageUrlPattern);
      });

      it('edit button click should load edit AccountPlan page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('AccountPlan');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', accountPlanPageUrlPattern);
      });

      it('last delete button click should delete instance of AccountPlan', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('accountPlan').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', accountPlanPageUrlPattern);

        accountPlan = undefined;
      });
    });
  });

  describe('new AccountPlan page', () => {
    beforeEach(() => {
      cy.visit(accountPlanPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('AccountPlan');
    });

    it('should create an instance of AccountPlan', () => {
      cy.get(`[data-cy="accountCode"]`).type('oups');
      cy.get(`[data-cy="accountCode"]`).should('have.value', 'oups');

      cy.get(`[data-cy="accountLabel"]`).type("d'abord");
      cy.get(`[data-cy="accountLabel"]`).should('have.value', "d'abord");

      cy.get(`[data-cy="accountLabelAr"]`).type('tant piquer');
      cy.get(`[data-cy="accountLabelAr"]`).should('have.value', 'tant piquer');

      cy.get(`[data-cy="accountType"]`).type('pour que comme');
      cy.get(`[data-cy="accountType"]`).should('have.value', 'pour que comme');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(`[data-cy="company"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        accountPlan = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', accountPlanPageUrlPattern);
    });
  });
});
