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
  let username: string;
  let password: string;
  // const bonusSample = {"bonusType":"SENIORITY","label":"miam efficace lors de","amount":29919.23,"taxable":true,"month":9,"year":15701};

  let bonus;
  // let employee;

  before(() => {
    cy.credentials().then(credentials => {
      ({ username, password } = credentials);
    });
  });

  beforeEach(() => {
    cy.login(username, password);
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/employees',
      body: {"matricule":"recta reprendre","firstName":"Flore","lastName":"Morin","firstNameAr":"moyennant commis aïe","lastNameAr":"sauf à outre","birthDate":"2026-04-08","birthPlace":"grâce à ha ha sombre","gender":"MALE","maritalStatus":"SINGLE","numberOfChildren":7,"chefDeFamille":true,"nationalId":"partenaire fidèle sa","passportNumber":"taire administration","nationality":"sédentaire déjà","address":"bientôt","city":"Le Mans","personalEmail":"peu équipe","professionalEmail":"cocorico isoler délégation","phoneNumber":"agréable de par","cnssNumber":"équipe","category":"WORKER","photoUrl":"entre-temps","hireDate":"2026-04-08","trialEndDate":"2026-04-07","active":false,"notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","createdAt":"2026-04-08T00:28:27.437Z","updatedAt":"2026-04-07T23:12:00.409Z"},
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
      cy.visit(bonusPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Bonus');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of Bonus', () => {
      cy.get(`[data-cy="bonusType"]`).select('RAMADAN');

      cy.get(`[data-cy="label"]`).type('ronron touchant');
      cy.get(`[data-cy="label"]`).should('have.value', 'ronron touchant');

      cy.get(`[data-cy="amount"]`).type('27805.86');
      cy.get(`[data-cy="amount"]`).should('have.value', '27805.86');

      cy.get(`[data-cy="taxable"]`).should('not.be.checked');
      cy.get(`[data-cy="taxable"]`).click();
      cy.get(`[data-cy="taxable"]`).should('be.checked');

      cy.get(`[data-cy="month"]`).type('2');
      cy.get(`[data-cy="month"]`).should('have.value', '2');

      cy.get(`[data-cy="year"]`).type('9128');
      cy.get(`[data-cy="year"]`).should('have.value', '9128');

      cy.get(`[data-cy="notes"]`).type('aux environs de tellement');
      cy.get(`[data-cy="notes"]`).should('have.value', 'aux environs de tellement');

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
