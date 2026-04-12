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
  let username: string;
  let password: string;
  // const advanceSample = {"requestDate":"2026-04-08","amount":31276.54,"status":"REJECTED"};

  let advance;
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
      body: {"matricule":"conformer groin groi","firstName":"Adegrine","lastName":"Dumas","firstNameAr":"pourvu que à la faveur de","lastNameAr":"entièrement chut","birthDate":"2026-04-08","birthPlace":"tandis que police","gender":"MALE","maritalStatus":"MARRIED","numberOfChildren":2,"chefDeFamille":true,"nationalId":"pleurer travailler","passportNumber":"étant donné que anta","nationality":"immense","address":"smack coac coac frotter","city":"Les Abymes","personalEmail":"oublier ruiner énorme","professionalEmail":"hé","phoneNumber":"sitôt que alentour","cnssNumber":"de sorte que malgré ","category":"WORKER","photoUrl":"diplomate parce que sitôt que","hireDate":"2026-04-07","trialEndDate":"2026-04-08","active":true,"notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","createdAt":"2026-04-08T05:09:11.787Z","updatedAt":"2026-04-07T20:47:42.931Z"},
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
      cy.visit(advancePageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Advance');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of Advance', () => {
      cy.get(`[data-cy="requestDate"]`).type('2026-04-08');
      cy.get(`[data-cy="requestDate"]`).blur();
      cy.get(`[data-cy="requestDate"]`).should('have.value', '2026-04-08');

      cy.get(`[data-cy="amount"]`).type('27489.79');
      cy.get(`[data-cy="amount"]`).should('have.value', '27489.79');

      cy.get(`[data-cy="deductionMonth"]`).type('2');
      cy.get(`[data-cy="deductionMonth"]`).should('have.value', '2');

      cy.get(`[data-cy="deductionYear"]`).type('13065');
      cy.get(`[data-cy="deductionYear"]`).should('have.value', '13065');

      cy.get(`[data-cy="status"]`).select('REJECTED');

      cy.get(`[data-cy="approvedBy"]`).type('pacifique antique');
      cy.get(`[data-cy="approvedBy"]`).should('have.value', 'pacifique antique');

      cy.get(`[data-cy="notes"]`).type('quant à');
      cy.get(`[data-cy="notes"]`).should('have.value', 'quant à');

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
