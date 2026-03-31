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

describe('TimeEntry e2e test', () => {
  const timeEntryPageUrl = '/time-entry';
  const timeEntryPageUrlPattern = new RegExp('/time-entry(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  // const timeEntrySample = {"entryDate":"2026-03-31","source":"BADGE","status":"CORRECTED"};

  let timeEntry;
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
      body: {"matricule":"jeune essuyer toc-to","firstName":"Réjeanne","lastName":"Martinez","firstNameAr":"dynamique","lastNameAr":"y foule","birthDate":"2026-03-31","birthPlace":"vroum","gender":"MALE","maritalStatus":"MARRIED","numberOfChildren":4,"chefDeFamille":true,"nationalId":"adorable lors","passportNumber":"par rapport à incarn","nationality":"équipe de recherche","address":"large commis","city":"Villejuif","personalEmail":"infime","professionalEmail":"rudement dans la mesure où lorsque","phoneNumber":"vers prononcer trop","cnssNumber":"restaurer autour de","category":"DIRECTOR","photoUrl":"hé déchirer","hireDate":"2026-03-31","trialEndDate":"2026-03-31","active":true,"notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","createdAt":"2026-03-31T12:51:42.262Z","updatedAt":"2026-03-30T20:58:52.829Z"},
    }).then(({ body }) => {
      employee = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/time-entries+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/time-entries').as('postEntityRequest');
    cy.intercept('DELETE', '/api/time-entries/*').as('deleteEntityRequest');
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/employees', {
      statusCode: 200,
      body: [employee],
    });

    cy.intercept('GET', '/api/user-profiles', {
      statusCode: 200,
      body: [],
    });

  });
   */

  afterEach(() => {
    if (timeEntry) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/time-entries/${timeEntry.id}`,
      }).then(() => {
        timeEntry = undefined;
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

  it('TimeEntries menu should load TimeEntries page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('time-entry');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('TimeEntry').should('exist');
    cy.url().should('match', timeEntryPageUrlPattern);
  });

  describe('TimeEntry page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(timeEntryPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create TimeEntry page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/time-entry/new$'));
        cy.getEntityCreateUpdateHeading('TimeEntry');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', timeEntryPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/time-entries',
          body: {
            ...timeEntrySample,
            employee: employee,
          },
        }).then(({ body }) => {
          timeEntry = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/time-entries+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/time-entries?page=0&size=20>; rel="last",<http://localhost/api/time-entries?page=0&size=20>; rel="first"',
              },
              body: [timeEntry],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(timeEntryPageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(timeEntryPageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details TimeEntry page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('timeEntry');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', timeEntryPageUrlPattern);
      });

      it('edit button click should load edit TimeEntry page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('TimeEntry');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', timeEntryPageUrlPattern);
      });

      it('edit button click should load edit TimeEntry page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('TimeEntry');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', timeEntryPageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of TimeEntry', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('timeEntry').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', timeEntryPageUrlPattern);

        timeEntry = undefined;
      });
    });
  });

  describe('new TimeEntry page', () => {
    beforeEach(() => {
      cy.visit(`${timeEntryPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('TimeEntry');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of TimeEntry', () => {
      cy.get(`[data-cy="entryDate"]`).type('2026-03-31');
      cy.get(`[data-cy="entryDate"]`).blur();
      cy.get(`[data-cy="entryDate"]`).should('have.value', '2026-03-31');

      cy.get(`[data-cy="checkIn"]`).type('2026-03-30T21:13');
      cy.get(`[data-cy="checkIn"]`).blur();
      cy.get(`[data-cy="checkIn"]`).should('have.value', '2026-03-30T21:13');

      cy.get(`[data-cy="checkOut"]`).type('2026-03-31T06:34');
      cy.get(`[data-cy="checkOut"]`).blur();
      cy.get(`[data-cy="checkOut"]`).should('have.value', '2026-03-31T06:34');

      cy.get(`[data-cy="workedHours"]`).type('18587.05');
      cy.get(`[data-cy="workedHours"]`).should('have.value', '18587.05');

      cy.get(`[data-cy="overtimeHours"]`).type('1242.62');
      cy.get(`[data-cy="overtimeHours"]`).should('have.value', '1242.62');

      cy.get(`[data-cy="lateMinutes"]`).type('14796');
      cy.get(`[data-cy="lateMinutes"]`).should('have.value', '14796');

      cy.get(`[data-cy="source"]`).select('BADGE');

      cy.get(`[data-cy="status"]`).select('CORRECTED');

      cy.get(`[data-cy="anomalyNote"]`).type('persuader');
      cy.get(`[data-cy="anomalyNote"]`).should('have.value', 'persuader');

      cy.get(`[data-cy="validatedBy"]`).type('sitôt que foule favoriser');
      cy.get(`[data-cy="validatedBy"]`).should('have.value', 'sitôt que foule favoriser');

      cy.get(`[data-cy="validatedAt"]`).type('2026-03-30T22:42');
      cy.get(`[data-cy="validatedAt"]`).blur();
      cy.get(`[data-cy="validatedAt"]`).should('have.value', '2026-03-30T22:42');

      cy.get(`[data-cy="employee"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        timeEntry = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', timeEntryPageUrlPattern);
    });
  });
});
