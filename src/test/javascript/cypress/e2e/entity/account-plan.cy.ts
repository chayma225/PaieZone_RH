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
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const accountPlanSample = { accountCode: 'énergique', accountLabel: 'attacher attacher circulaire', active: false };

  let accountPlan;
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
        name: 'sitôt que sitôt que ding',
        tradeName: 'en decà de blême',
        taxId: 'derrière quant à',
        cnssId: 'même si',
        address: 'adversaire',
        city: 'Villeurbanne',
        postalCode: 'créer',
        phone: '+33 369130715',
        email: 'Christian_Renault20@hotmail.fr',
        logoUrl: 'entre-temps',
        tenantSchema: 'au lieu de fort',
        active: true,
        trialEnd: '2026-03-31',
        createdAt: '2026-03-30T18:28:31.114Z',
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
      cy.visit(`${accountPlanPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('AccountPlan');
    });

    it('should create an instance of AccountPlan', () => {
      cy.get(`[data-cy="accountCode"]`).type('sincère mairie bang');
      cy.get(`[data-cy="accountCode"]`).should('have.value', 'sincère mairie bang');

      cy.get(`[data-cy="accountLabel"]`).type('placide frémir tant');
      cy.get(`[data-cy="accountLabel"]`).should('have.value', 'placide frémir tant');

      cy.get(`[data-cy="accountLabelAr"]`).type('bof sauf à puisque');
      cy.get(`[data-cy="accountLabelAr"]`).should('have.value', 'bof sauf à puisque');

      cy.get(`[data-cy="accountType"]`).type('aux alentours de dès que tant que');
      cy.get(`[data-cy="accountType"]`).should('have.value', 'aux alentours de dès que tant que');

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
