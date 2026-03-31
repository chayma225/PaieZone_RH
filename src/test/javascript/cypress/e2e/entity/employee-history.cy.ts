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

describe('EmployeeHistory e2e test', () => {
  const employeeHistoryPageUrl = '/employee-history';
  const employeeHistoryPageUrlPattern = new RegExp('/employee-history(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  // const employeeHistorySample = {"fieldName":"vis-à-vie de gai rectangulaire","changedAt":"2026-03-30T19:53:05.869Z"};

  let employeeHistory;
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
      body: {"matricule":"de la part de cyan","firstName":"Claudien","lastName":"Lopez","firstNameAr":"près de","lastNameAr":"membre du personnel","birthDate":"2026-03-30","birthPlace":"ouin perfectionner","gender":"MALE","maritalStatus":"MARRIED","numberOfChildren":1,"chefDeFamille":false,"nationalId":"quelque tellement sa","passportNumber":"tchou tchouu","nationality":"hirsute gestionnaire","address":"encore adepte par suite de","city":"Besançon","personalEmail":"après que rectorat","professionalEmail":"peser jusqu’à ce que","phoneNumber":"au moyen de atchoum ","cnssNumber":"candide","category":"SUPERVISOR","photoUrl":"vide en dépit de","hireDate":"2026-03-30","trialEndDate":"2026-03-31","active":true,"notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","createdAt":"2026-03-30T19:14:15.579Z","updatedAt":"2026-03-31T03:40:59.287Z"},
    }).then(({ body }) => {
      employee = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/employee-histories+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/employee-histories').as('postEntityRequest');
    cy.intercept('DELETE', '/api/employee-histories/*').as('deleteEntityRequest');
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/employees', {
      statusCode: 200,
      body: [employee],
    });

  });
   */

  afterEach(() => {
    if (employeeHistory) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/employee-histories/${employeeHistory.id}`,
      }).then(() => {
        employeeHistory = undefined;
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

  it('EmployeeHistories menu should load EmployeeHistories page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('employee-history');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('EmployeeHistory').should('exist');
    cy.url().should('match', employeeHistoryPageUrlPattern);
  });

  describe('EmployeeHistory page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(employeeHistoryPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create EmployeeHistory page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/employee-history/new$'));
        cy.getEntityCreateUpdateHeading('EmployeeHistory');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', employeeHistoryPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/employee-histories',
          body: {
            ...employeeHistorySample,
            employee: employee,
          },
        }).then(({ body }) => {
          employeeHistory = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/employee-histories+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [employeeHistory],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(employeeHistoryPageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(employeeHistoryPageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details EmployeeHistory page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('employeeHistory');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', employeeHistoryPageUrlPattern);
      });

      it('edit button click should load edit EmployeeHistory page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('EmployeeHistory');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', employeeHistoryPageUrlPattern);
      });

      it('edit button click should load edit EmployeeHistory page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('EmployeeHistory');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', employeeHistoryPageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of EmployeeHistory', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('employeeHistory').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', employeeHistoryPageUrlPattern);

        employeeHistory = undefined;
      });
    });
  });

  describe('new EmployeeHistory page', () => {
    beforeEach(() => {
      cy.visit(`${employeeHistoryPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('EmployeeHistory');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of EmployeeHistory', () => {
      cy.get(`[data-cy="fieldName"]`).type('fade athlète');
      cy.get(`[data-cy="fieldName"]`).should('have.value', 'fade athlète');

      cy.get(`[data-cy="oldValue"]`).type('toc parlementaire');
      cy.get(`[data-cy="oldValue"]`).should('have.value', 'toc parlementaire');

      cy.get(`[data-cy="newValue"]`).type('bondir trop');
      cy.get(`[data-cy="newValue"]`).should('have.value', 'bondir trop');

      cy.get(`[data-cy="changedAt"]`).type('2026-03-30T19:39');
      cy.get(`[data-cy="changedAt"]`).blur();
      cy.get(`[data-cy="changedAt"]`).should('have.value', '2026-03-30T19:39');

      cy.get(`[data-cy="changedBy"]`).type('sans que prestataire de services');
      cy.get(`[data-cy="changedBy"]`).should('have.value', 'sans que prestataire de services');

      cy.get(`[data-cy="reason"]`).type('ici drôlement jusqu’à ce que');
      cy.get(`[data-cy="reason"]`).should('have.value', 'ici drôlement jusqu’à ce que');

      cy.get(`[data-cy="employee"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        employeeHistory = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', employeeHistoryPageUrlPattern);
    });
  });
});
