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
  let username: string;
  let password: string;
  // const timeEntrySample = {"entryDate":"2026-04-07","source":"MANUAL","status":"PENDING"};

  let timeEntry;
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
      body: {"matricule":"trop drelin","firstName":"Florestan","lastName":"Lefevre","firstNameAr":"grandement","lastNameAr":"groin groin","birthDate":"2026-04-07","birthPlace":"athlète","gender":"FEMALE","maritalStatus":"DIVORCED","numberOfChildren":4,"chefDeFamille":true,"nationalId":"dès membre du person","passportNumber":"rectorat que","nationality":"toc-toc revivre cot cot","address":"porte-parole après dès","city":"Besançon","personalEmail":"bof","professionalEmail":"certes","phoneNumber":"cot cot âcre sombre","cnssNumber":"bien que recueillir ","category":"DIRECTOR","photoUrl":"miaou","hireDate":"2026-04-08","trialEndDate":"2026-04-08","active":true,"notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","createdAt":"2026-04-08T00:20:40.234Z","updatedAt":"2026-04-08T02:12:56.631Z"},
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
      cy.visit(timeEntryPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('TimeEntry');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of TimeEntry', () => {
      cy.get(`[data-cy="entryDate"]`).type('2026-04-08');
      cy.get(`[data-cy="entryDate"]`).blur();
      cy.get(`[data-cy="entryDate"]`).should('have.value', '2026-04-08');

      cy.get(`[data-cy="checkIn"]`).type('2026-04-07T19:41');
      cy.get(`[data-cy="checkIn"]`).blur();
      cy.get(`[data-cy="checkIn"]`).should('have.value', '2026-04-07T19:41');

      cy.get(`[data-cy="checkOut"]`).type('2026-04-07T19:12');
      cy.get(`[data-cy="checkOut"]`).blur();
      cy.get(`[data-cy="checkOut"]`).should('have.value', '2026-04-07T19:12');

      cy.get(`[data-cy="workedHours"]`).type('27194.27');
      cy.get(`[data-cy="workedHours"]`).should('have.value', '27194.27');

      cy.get(`[data-cy="overtimeHours"]`).type('15876.52');
      cy.get(`[data-cy="overtimeHours"]`).should('have.value', '15876.52');

      cy.get(`[data-cy="lateMinutes"]`).type('31869');
      cy.get(`[data-cy="lateMinutes"]`).should('have.value', '31869');

      cy.get(`[data-cy="source"]`).select('BADGE');

      cy.get(`[data-cy="status"]`).select('VALIDATED');

      cy.get(`[data-cy="anomalyNote"]`).type('prou d’autant que');
      cy.get(`[data-cy="anomalyNote"]`).should('have.value', 'prou d’autant que');

      cy.get(`[data-cy="validatedBy"]`).type('rectorat quoique');
      cy.get(`[data-cy="validatedBy"]`).should('have.value', 'rectorat quoique');

      cy.get(`[data-cy="validatedAt"]`).type('2026-04-08T15:03');
      cy.get(`[data-cy="validatedAt"]`).blur();
      cy.get(`[data-cy="validatedAt"]`).should('have.value', '2026-04-08T15:03');

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
