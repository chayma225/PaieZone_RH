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

describe('Advance e2e test', () => {
  const advancePageUrl = '/advance';
  const advancePageUrlPattern = new RegExp('/advance(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  // const advanceSample = {"requestDate":"2026-03-31","amount":18685.12,"status":"REJECTED"};

  let advance;
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
      body: {"matricule":"différer","firstName":"Adélaïde","lastName":"Michel","firstNameAr":"grrr à l'égard de concernant","lastNameAr":"chef efficace que","birthDate":"2026-03-31","birthPlace":"triangulaire emplir","gender":"MALE","maritalStatus":"MARRIED","numberOfChildren":10,"chefDeFamille":false,"nationalId":"de façon que","passportNumber":"respirer répandre sn","nationality":"mélancolique","address":"magnifique hé","city":"Caen","personalEmail":"électorat malade population du Québec","professionalEmail":"aux alentours de recommencer","phoneNumber":"commis un peu","cnssNumber":"vraiment","category":"EXECUTIVE","photoUrl":"fidèle ouf indiquer","hireDate":"2026-03-31","trialEndDate":"2026-03-30","active":false,"notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","createdAt":"2026-03-31T06:15:00.073Z","updatedAt":"2026-03-31T04:22:14.178Z"},
    }).then(({ body }) => {
      employee = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/advances+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/advances').as('postEntityRequest');
    cy.intercept('DELETE', '/api/advances/*').as('deleteEntityRequest');
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

    cy.intercept('GET', '/api/user-profiles', {
      statusCode: 200,
      body: [],
    });

  });
   */

  afterEach(() => {
    if (advance) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/advances/${advance.id}`,
      }).then(() => {
        advance = undefined;
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

  it('Advances menu should load Advances page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('advance');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Advance').should('exist');
    cy.url().should('match', advancePageUrlPattern);
  });

  describe('Advance page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(advancePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Advance page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/advance/new$'));
        cy.getEntityCreateUpdateHeading('Advance');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', advancePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/advances',
          body: {
            ...advanceSample,
            employee: employee,
          },
        }).then(({ body }) => {
          advance = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/advances+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/advances?page=0&size=20>; rel="last",<http://localhost/api/advances?page=0&size=20>; rel="first"',
              },
              body: [advance],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(advancePageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(advancePageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details Advance page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('advance');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', advancePageUrlPattern);
      });

      it('edit button click should load edit Advance page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Advance');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', advancePageUrlPattern);
      });

      it('edit button click should load edit Advance page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Advance');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', advancePageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of Advance', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('advance').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', advancePageUrlPattern);

        advance = undefined;
      });
    });
  });

  describe('new Advance page', () => {
    beforeEach(() => {
      cy.visit(`${advancePageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Advance');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of Advance', () => {
      cy.get(`[data-cy="requestDate"]`).type('2026-03-31');
      cy.get(`[data-cy="requestDate"]`).blur();
      cy.get(`[data-cy="requestDate"]`).should('have.value', '2026-03-31');

      cy.get(`[data-cy="amount"]`).type('12752.44');
      cy.get(`[data-cy="amount"]`).should('have.value', '12752.44');

      cy.get(`[data-cy="deductionMonth"]`).type('6');
      cy.get(`[data-cy="deductionMonth"]`).should('have.value', '6');

      cy.get(`[data-cy="deductionYear"]`).type('26733');
      cy.get(`[data-cy="deductionYear"]`).should('have.value', '26733');

      cy.get(`[data-cy="status"]`).select('DEDUCTED');

      cy.get(`[data-cy="approvedBy"]`).type('hier');
      cy.get(`[data-cy="approvedBy"]`).should('have.value', 'hier');

      cy.get(`[data-cy="notes"]`).type('tic-tac tard prendre');
      cy.get(`[data-cy="notes"]`).should('have.value', 'tic-tac tard prendre');

      cy.get(`[data-cy="employee"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        advance = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', advancePageUrlPattern);
    });
  });
});
