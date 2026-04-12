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

describe('LeaveBalance e2e test', () => {
  const leaveBalancePageUrl = '/leave-balance';
  const leaveBalancePageUrlPattern = new RegExp('/leave-balance(\\?.*)?$');
  let username: string;
  let password: string;
  // const leaveBalanceSample = {"year":8799,"entitled":5125.39,"taken":17652.12,"pending":946.2,"carryOver":31317.87,"remaining":30505.4,"lastUpdatedAt":"2026-04-08T11:55:17.914Z"};

  let leaveBalance;
  // let employee;
  // let leaveType;

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
      body: {"matricule":"ronron grrr","firstName":"Narcisse","lastName":"Blanchard","firstNameAr":"mature","lastNameAr":"touriste","birthDate":"2026-04-08","birthPlace":"parmi miam","gender":"MALE","maritalStatus":"SINGLE","numberOfChildren":6,"chefDeFamille":false,"nationalId":"du fait que drôlemen","passportNumber":"comporter hormis","nationality":"marquer","address":"davantage dedans","city":"Avignon","personalEmail":"commissionnaire adapter","professionalEmail":"carrément","phoneNumber":"innombrable pas mal ","cnssNumber":"chez coupable tantôt","category":"DIRECTOR","photoUrl":"multiple impromptu areu areu","hireDate":"2026-04-08","trialEndDate":"2026-04-08","active":true,"notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","createdAt":"2026-04-08T12:29:54.808Z","updatedAt":"2026-04-08T01:57:07.553Z"},
    }).then(({ body }) => {
      employee = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/leave-types',
      body: {"name":"MARRIAGE","label":"clientèle comme cot cot","maxDaysPerYear":12331,"carryOverDays":30450,"paid":false,"requiresMedical":true,"active":false},
    }).then(({ body }) => {
      leaveType = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/leave-balances+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/leave-balances').as('postEntityRequest');
    cy.intercept('DELETE', '/api/leave-balances/*').as('deleteEntityRequest');
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/employees', {
      statusCode: 200,
      body: [employee],
    });

    cy.intercept('GET', '/api/leave-types', {
      statusCode: 200,
      body: [leaveType],
    });

  });
   */

  afterEach(() => {
    if (leaveBalance) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/leave-balances/${leaveBalance.id}`,
      }).then(() => {
        leaveBalance = undefined;
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
    if (leaveType) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/leave-types/${leaveType.id}`,
      }).then(() => {
        leaveType = undefined;
      });
    }
  });
   */

  it('LeaveBalances menu should load LeaveBalances page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('leave-balance');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('LeaveBalance').should('exist');
    cy.url().should('match', leaveBalancePageUrlPattern);
  });

  describe('LeaveBalance page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(leaveBalancePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create LeaveBalance page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/leave-balance/new$'));
        cy.getEntityCreateUpdateHeading('LeaveBalance');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', leaveBalancePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/leave-balances',
          body: {
            ...leaveBalanceSample,
            employee: employee,
            leaveType: leaveType,
          },
        }).then(({ body }) => {
          leaveBalance = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/leave-balances+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [leaveBalance],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(leaveBalancePageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(leaveBalancePageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details LeaveBalance page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('leaveBalance');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', leaveBalancePageUrlPattern);
      });

      it('edit button click should load edit LeaveBalance page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('LeaveBalance');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', leaveBalancePageUrlPattern);
      });

      it('edit button click should load edit LeaveBalance page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('LeaveBalance');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', leaveBalancePageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of LeaveBalance', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('leaveBalance').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', leaveBalancePageUrlPattern);

        leaveBalance = undefined;
      });
    });
  });

  describe('new LeaveBalance page', () => {
    beforeEach(() => {
      cy.visit(leaveBalancePageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('LeaveBalance');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of LeaveBalance', () => {
      cy.get(`[data-cy="year"]`).type('26444');
      cy.get(`[data-cy="year"]`).should('have.value', '26444');

      cy.get(`[data-cy="entitled"]`).type('5418.21');
      cy.get(`[data-cy="entitled"]`).should('have.value', '5418.21');

      cy.get(`[data-cy="taken"]`).type('13453.76');
      cy.get(`[data-cy="taken"]`).should('have.value', '13453.76');

      cy.get(`[data-cy="pending"]`).type('31807.2');
      cy.get(`[data-cy="pending"]`).should('have.value', '31807.2');

      cy.get(`[data-cy="carryOver"]`).type('29475.88');
      cy.get(`[data-cy="carryOver"]`).should('have.value', '29475.88');

      cy.get(`[data-cy="remaining"]`).type('20118.22');
      cy.get(`[data-cy="remaining"]`).should('have.value', '20118.22');

      cy.get(`[data-cy="lastUpdatedAt"]`).type('2026-04-08T05:29');
      cy.get(`[data-cy="lastUpdatedAt"]`).blur();
      cy.get(`[data-cy="lastUpdatedAt"]`).should('have.value', '2026-04-08T05:29');

      cy.get(`[data-cy="employee"]`).select(1);
      cy.get(`[data-cy="leaveType"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        leaveBalance = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', leaveBalancePageUrlPattern);
    });
  });
});
