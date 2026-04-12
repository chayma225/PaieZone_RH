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
  let username: string;
  let password: string;
  // const leaveRequestSample = {"startDate":"2026-04-08","endDate":"2026-04-08","numberOfDays":22202,"status":"DRAFT","requestedAt":"2026-04-08T11:28:09.724Z"};

  let leaveRequest;
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
      body: {"matricule":"insipide","firstName":"Audran","lastName":"Lambert","firstNameAr":"de par parlementaire","lastNameAr":"devant alors que réchauffer","birthDate":"2026-04-08","birthPlace":"administration orange","gender":"MALE","maritalStatus":"SINGLE","numberOfChildren":6,"chefDeFamille":true,"nationalId":"régler compromettre ","passportNumber":"comment à l'entour d","nationality":"touriste dès","address":"tant areu areu","city":"Perpignan","personalEmail":"à force de dense mairie","professionalEmail":"peut-être","phoneNumber":"remédier rédaction g","cnssNumber":"inviter","category":"EMPLOYEE","photoUrl":"extra si si","hireDate":"2026-04-07","trialEndDate":"2026-04-07","active":false,"notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","createdAt":"2026-04-08T06:05:01.030Z","updatedAt":"2026-04-08T09:15:58.294Z"},
    }).then(({ body }) => {
      employee = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/leave-types',
      body: {"name":"BEREAVEMENT","label":"que pschitt","maxDaysPerYear":21627,"carryOverDays":24443,"paid":true,"requiresMedical":false,"active":false},
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
      cy.visit(leaveRequestPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('LeaveRequest');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of LeaveRequest', () => {
      cy.get(`[data-cy="startDate"]`).type('2026-04-08');
      cy.get(`[data-cy="startDate"]`).blur();
      cy.get(`[data-cy="startDate"]`).should('have.value', '2026-04-08');

      cy.get(`[data-cy="endDate"]`).type('2026-04-08');
      cy.get(`[data-cy="endDate"]`).blur();
      cy.get(`[data-cy="endDate"]`).should('have.value', '2026-04-08');

      cy.get(`[data-cy="numberOfDays"]`).type('4595');
      cy.get(`[data-cy="numberOfDays"]`).should('have.value', '4595');

      cy.get(`[data-cy="status"]`).select('REJECTED');

      cy.get(`[data-cy="requestedAt"]`).type('2026-04-08T13:25');
      cy.get(`[data-cy="requestedAt"]`).blur();
      cy.get(`[data-cy="requestedAt"]`).should('have.value', '2026-04-08T13:25');

      cy.get(`[data-cy="processedAt"]`).type('2026-04-08T06:02');
      cy.get(`[data-cy="processedAt"]`).blur();
      cy.get(`[data-cy="processedAt"]`).should('have.value', '2026-04-08T06:02');

      cy.get(`[data-cy="managerComment"]`).type('dériver avex croâ');
      cy.get(`[data-cy="managerComment"]`).should('have.value', 'dériver avex croâ');

      cy.get(`[data-cy="employeeComment"]`).type('satisfaire vlan');
      cy.get(`[data-cy="employeeComment"]`).should('have.value', 'satisfaire vlan');

      cy.get(`[data-cy="documentUrl"]`).type('un peu sombrer fidèle');
      cy.get(`[data-cy="documentUrl"]`).should('have.value', 'un peu sombrer fidèle');

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
