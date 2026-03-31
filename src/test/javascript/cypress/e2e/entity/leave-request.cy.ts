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

describe('LeaveRequest e2e test', () => {
  const leaveRequestPageUrl = '/leave-request';
  const leaveRequestPageUrlPattern = new RegExp('/leave-request(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  // const leaveRequestSample = {"startDate":"2026-03-30","endDate":"2026-03-31","numberOfDays":32528,"status":"CANCELLED","requestedAt":"2026-03-30T20:03:41.136Z"};

  let leaveRequest;
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
      body: {"matricule":"fonctionnaire","firstName":"Jason","lastName":"Guillaume","firstNameAr":"ça laver","lastNameAr":"fidèle répandre","birthDate":"2026-03-30","birthPlace":"sous","gender":"MALE","maritalStatus":"WIDOWED","numberOfChildren":2,"chefDeFamille":false,"nationalId":"depuis","passportNumber":"super quelque absolu","nationality":"au point que diablement","address":"alors que triathlète vanter","city":"Lorient","personalEmail":"pour que chut","professionalEmail":"antagoniste combien par suite de","phoneNumber":"en dépit de infime p","cnssNumber":"concurrence agir","category":"SUPERVISOR","photoUrl":"divinement disperser pressentir","hireDate":"2026-03-31","trialEndDate":"2026-03-31","active":true,"notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","createdAt":"2026-03-31T07:44:19.300Z","updatedAt":"2026-03-31T02:45:19.508Z"},
    }).then(({ body }) => {
      employee = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/leave-types',
      body: {"name":"MATERNITY","label":"effectuer","maxDaysPerYear":4611,"carryOverDays":25056,"paid":true,"requiresMedical":true,"active":true},
    }).then(({ body }) => {
      leaveType = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/leave-requests+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/leave-requests').as('postEntityRequest');
    cy.intercept('DELETE', '/api/leave-requests/*').as('deleteEntityRequest');
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

    cy.intercept('GET', '/api/user-profiles', {
      statusCode: 200,
      body: [],
    });

  });
   */

  afterEach(() => {
    if (leaveRequest) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/leave-requests/${leaveRequest.id}`,
      }).then(() => {
        leaveRequest = undefined;
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

  it('LeaveRequests menu should load LeaveRequests page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('leave-request');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('LeaveRequest').should('exist');
    cy.url().should('match', leaveRequestPageUrlPattern);
  });

  describe('LeaveRequest page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(leaveRequestPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create LeaveRequest page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/leave-request/new$'));
        cy.getEntityCreateUpdateHeading('LeaveRequest');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', leaveRequestPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/leave-requests',
          body: {
            ...leaveRequestSample,
            employee: employee,
            leaveType: leaveType,
          },
        }).then(({ body }) => {
          leaveRequest = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/leave-requests+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/leave-requests?page=0&size=20>; rel="last",<http://localhost/api/leave-requests?page=0&size=20>; rel="first"',
              },
              body: [leaveRequest],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(leaveRequestPageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(leaveRequestPageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details LeaveRequest page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('leaveRequest');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', leaveRequestPageUrlPattern);
      });

      it('edit button click should load edit LeaveRequest page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('LeaveRequest');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', leaveRequestPageUrlPattern);
      });

      it('edit button click should load edit LeaveRequest page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('LeaveRequest');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', leaveRequestPageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of LeaveRequest', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('leaveRequest').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', leaveRequestPageUrlPattern);

        leaveRequest = undefined;
      });
    });
  });

  describe('new LeaveRequest page', () => {
    beforeEach(() => {
      cy.visit(`${leaveRequestPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('LeaveRequest');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of LeaveRequest', () => {
      cy.get(`[data-cy="startDate"]`).type('2026-03-31');
      cy.get(`[data-cy="startDate"]`).blur();
      cy.get(`[data-cy="startDate"]`).should('have.value', '2026-03-31');

      cy.get(`[data-cy="endDate"]`).type('2026-03-31');
      cy.get(`[data-cy="endDate"]`).blur();
      cy.get(`[data-cy="endDate"]`).should('have.value', '2026-03-31');

      cy.get(`[data-cy="numberOfDays"]`).type('10066');
      cy.get(`[data-cy="numberOfDays"]`).should('have.value', '10066');

      cy.get(`[data-cy="status"]`).select('CANCELLED');

      cy.get(`[data-cy="requestedAt"]`).type('2026-03-30T23:06');
      cy.get(`[data-cy="requestedAt"]`).blur();
      cy.get(`[data-cy="requestedAt"]`).should('have.value', '2026-03-30T23:06');

      cy.get(`[data-cy="processedAt"]`).type('2026-03-31T17:43');
      cy.get(`[data-cy="processedAt"]`).blur();
      cy.get(`[data-cy="processedAt"]`).should('have.value', '2026-03-31T17:43');

      cy.get(`[data-cy="managerComment"]`).type('tellement au-dehors au-devant');
      cy.get(`[data-cy="managerComment"]`).should('have.value', 'tellement au-dehors au-devant');

      cy.get(`[data-cy="employeeComment"]`).type('bien que');
      cy.get(`[data-cy="employeeComment"]`).should('have.value', 'bien que');

      cy.get(`[data-cy="documentUrl"]`).type('boum sympathique commis');
      cy.get(`[data-cy="documentUrl"]`).should('have.value', 'boum sympathique commis');

      cy.get(`[data-cy="employee"]`).select(1);
      cy.get(`[data-cy="leaveType"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        leaveRequest = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', leaveRequestPageUrlPattern);
    });
  });
});
