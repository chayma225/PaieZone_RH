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
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  // const leaveBalanceSample = {"year":13783,"entitled":5371.91,"taken":19843.05,"pending":11133.74,"carryOver":20658.76,"remaining":18684.71,"lastUpdatedAt":"2026-03-31T05:59:31.425Z"};

  let leaveBalance;
  // let employee;
  // let leaveType;

  beforeEach(() => {
    cy.login(username, password);
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/employees',
      body: {"matricule":"commis de cuisine co","firstName":"Achaire","lastName":"Boyer","firstNameAr":"porte-parole assez","lastNameAr":"mature premièrement assez","birthDate":"2026-03-30","birthPlace":"confondre foule à même","gender":"FEMALE","maritalStatus":"WIDOWED","numberOfChildren":4,"chefDeFamille":true,"nationalId":"associer","passportNumber":"malgré","nationality":"jeune enfant","address":"rigoler selon allonger","city":"Ajaccio","personalEmail":"via en bas de d'avec","professionalEmail":"juriste patientèle","phoneNumber":"au lieu de","cnssNumber":"de par fort","category":"MANAGER","photoUrl":"tout extatique extra","hireDate":"2026-03-30","trialEndDate":"2026-03-30","active":false,"notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","createdAt":"2026-03-31T15:35:18.193Z","updatedAt":"2026-03-31T00:52:51.982Z"},
    }).then(({ body }) => {
      employee = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/leave-types',
      body: {"name":"SICK","label":"personnel planter à moins de","maxDaysPerYear":24401,"carryOverDays":31737,"paid":false,"requiresMedical":false,"active":false},
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
      cy.visit(`${leaveBalancePageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('LeaveBalance');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of LeaveBalance', () => {
      cy.get(`[data-cy="year"]`).type('7744');
      cy.get(`[data-cy="year"]`).should('have.value', '7744');

      cy.get(`[data-cy="entitled"]`).type('32087.3');
      cy.get(`[data-cy="entitled"]`).should('have.value', '32087.3');

      cy.get(`[data-cy="taken"]`).type('30498.8');
      cy.get(`[data-cy="taken"]`).should('have.value', '30498.8');

      cy.get(`[data-cy="pending"]`).type('9893.83');
      cy.get(`[data-cy="pending"]`).should('have.value', '9893.83');

      cy.get(`[data-cy="carryOver"]`).type('23481.01');
      cy.get(`[data-cy="carryOver"]`).should('have.value', '23481.01');

      cy.get(`[data-cy="remaining"]`).type('30997.14');
      cy.get(`[data-cy="remaining"]`).should('have.value', '30997.14');

      cy.get(`[data-cy="lastUpdatedAt"]`).type('2026-03-30T19:22');
      cy.get(`[data-cy="lastUpdatedAt"]`).blur();
      cy.get(`[data-cy="lastUpdatedAt"]`).should('have.value', '2026-03-30T19:22');

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
