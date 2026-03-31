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

describe('Bonus e2e test', () => {
  const bonusPageUrl = '/bonus';
  const bonusPageUrlPattern = new RegExp('/bonus(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  // const bonusSample = {"bonusType":"OTHER","label":"carrément pas mal commis de cuisine","amount":30241.24,"taxable":false,"month":9,"year":29405};

  let bonus;
  // let employee;

  beforeEach(() => {
    cy.login(username, password);
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/employees',
      body: {"matricule":"dring","firstName":"Simone","lastName":"Schmitt","firstNameAr":"hi","lastNameAr":"admettre dense de par","birthDate":"2026-03-31","birthPlace":"bof parmi aïe","gender":"MALE","maritalStatus":"WIDOWED","numberOfChildren":2,"chefDeFamille":true,"nationalId":"communauté étudiante","passportNumber":"au moyen de","nationality":"hors de","address":"à peu près","city":"Mulhouse","personalEmail":"en outre de","professionalEmail":"taire","phoneNumber":"de façon que sombre ","cnssNumber":"de peur de atteindre","category":"SUPERVISOR","photoUrl":"continuer","hireDate":"2026-03-30","trialEndDate":"2026-03-31","active":false,"notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","createdAt":"2026-03-31T00:30:36.716Z","updatedAt":"2026-03-31T09:37:02.502Z"},
    }).then(({ body }) => {
      employee = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/bonuses+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/bonuses').as('postEntityRequest');
    cy.intercept('DELETE', '/api/bonuses/*').as('deleteEntityRequest');
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/employees', {
      statusCode: 200,
      body: [employee],
    });

    cy.intercept('GET', '/api/pay-slips', {
      statusCode: 200,
      body: [],
    });

  });
   */

  afterEach(() => {
    if (bonus) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/bonuses/${bonus.id}`,
      }).then(() => {
        bonus = undefined;
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

  it('Bonuses menu should load Bonuses page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('bonus');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Bonus').should('exist');
    cy.url().should('match', bonusPageUrlPattern);
  });

  describe('Bonus page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(bonusPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Bonus page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/bonus/new$'));
        cy.getEntityCreateUpdateHeading('Bonus');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', bonusPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/bonuses',
          body: {
            ...bonusSample,
            employee: employee,
          },
        }).then(({ body }) => {
          bonus = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/bonuses+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/bonuses?page=0&size=20>; rel="last",<http://localhost/api/bonuses?page=0&size=20>; rel="first"',
              },
              body: [bonus],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(bonusPageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(bonusPageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details Bonus page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('bonus');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', bonusPageUrlPattern);
      });

      it('edit button click should load edit Bonus page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Bonus');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', bonusPageUrlPattern);
      });

      it('edit button click should load edit Bonus page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Bonus');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', bonusPageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of Bonus', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('bonus').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', bonusPageUrlPattern);

        bonus = undefined;
      });
    });
  });

  describe('new Bonus page', () => {
    beforeEach(() => {
      cy.visit(`${bonusPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Bonus');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of Bonus', () => {
      cy.get(`[data-cy="bonusType"]`).select('END_OF_YEAR');

      cy.get(`[data-cy="label"]`).type('en decà de');
      cy.get(`[data-cy="label"]`).should('have.value', 'en decà de');

      cy.get(`[data-cy="amount"]`).type('15464.99');
      cy.get(`[data-cy="amount"]`).should('have.value', '15464.99');

      cy.get(`[data-cy="taxable"]`).should('not.be.checked');
      cy.get(`[data-cy="taxable"]`).click();
      cy.get(`[data-cy="taxable"]`).should('be.checked');

      cy.get(`[data-cy="month"]`).type('4');
      cy.get(`[data-cy="month"]`).should('have.value', '4');

      cy.get(`[data-cy="year"]`).type('12971');
      cy.get(`[data-cy="year"]`).should('have.value', '12971');

      cy.get(`[data-cy="notes"]`).type('vu que commis de cuisine');
      cy.get(`[data-cy="notes"]`).should('have.value', 'vu que commis de cuisine');

      cy.get(`[data-cy="employee"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        bonus = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', bonusPageUrlPattern);
    });
  });
});
