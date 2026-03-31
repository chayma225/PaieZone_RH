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

describe('AccountingEntry e2e test', () => {
  const accountingEntryPageUrl = '/accounting-entry';
  const accountingEntryPageUrlPattern = new RegExp('/accounting-entry(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const accountingEntrySample = {
    entryDate: '2026-03-31',
    journalRef: 'sans que',
    entryType: 'SALARY_EXPENSE',
    description: 'dedans ha au cas où',
    debitAccount: 'moquer',
    creditAccount: 'aussitôt que secouri',
    amount: 5934.79,
  };

  let accountingEntry;
  let company;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/companies',
      body: {
        name: 'critiquer lorsque police',
        tradeName: 'alors que géométrique',
        taxId: 'suivant gravir',
        cnssId: 'jusqu’à ce que aussi',
        address: 'engager infime',
        city: 'Mulhouse',
        postalCode: 'où',
        phone: '0535121109',
        email: 'Laureline_Pons32@gmail.com',
        logoUrl: 'police présidence',
        tenantSchema: 'insipide',
        active: true,
        trialEnd: '2026-03-31',
        createdAt: '2026-03-30T18:03:09.661Z',
      },
    }).then(({ body }) => {
      company = body;
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/accounting-entries+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/accounting-entries').as('postEntityRequest');
    cy.intercept('DELETE', '/api/accounting-entries/*').as('deleteEntityRequest');
  });

  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/companies', {
      statusCode: 200,
      body: [company],
    });

    cy.intercept('GET', '/api/payroll-periods', {
      statusCode: 200,
      body: [],
    });
  });

  afterEach(() => {
    if (accountingEntry) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/accounting-entries/${accountingEntry.id}`,
      }).then(() => {
        accountingEntry = undefined;
      });
    }
  });

  afterEach(() => {
    if (company) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/companies/${company.id}`,
      }).then(() => {
        company = undefined;
      });
    }
  });

  it('AccountingEntries menu should load AccountingEntries page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('accounting-entry');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('AccountingEntry').should('exist');
    cy.url().should('match', accountingEntryPageUrlPattern);
  });

  describe('AccountingEntry page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(accountingEntryPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create AccountingEntry page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/accounting-entry/new$'));
        cy.getEntityCreateUpdateHeading('AccountingEntry');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', accountingEntryPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/accounting-entries',
          body: {
            ...accountingEntrySample,
            company,
          },
        }).then(({ body }) => {
          accountingEntry = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/accounting-entries+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/accounting-entries?page=0&size=20>; rel="last",<http://localhost/api/accounting-entries?page=0&size=20>; rel="first"',
              },
              body: [accountingEntry],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(accountingEntryPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details AccountingEntry page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('accountingEntry');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', accountingEntryPageUrlPattern);
      });

      it('edit button click should load edit AccountingEntry page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('AccountingEntry');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', accountingEntryPageUrlPattern);
      });

      it('edit button click should load edit AccountingEntry page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('AccountingEntry');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', accountingEntryPageUrlPattern);
      });

      it('last delete button click should delete instance of AccountingEntry', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('accountingEntry').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', accountingEntryPageUrlPattern);

        accountingEntry = undefined;
      });
    });
  });

  describe('new AccountingEntry page', () => {
    beforeEach(() => {
      cy.visit(`${accountingEntryPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('AccountingEntry');
    });

    it('should create an instance of AccountingEntry', () => {
      cy.get(`[data-cy="entryDate"]`).type('2026-03-30');
      cy.get(`[data-cy="entryDate"]`).blur();
      cy.get(`[data-cy="entryDate"]`).should('have.value', '2026-03-30');

      cy.get(`[data-cy="journalRef"]`).type('diplomate emmener');
      cy.get(`[data-cy="journalRef"]`).should('have.value', 'diplomate emmener');

      cy.get(`[data-cy="entryType"]`).select('CNSS_EXPENSE');

      cy.get(`[data-cy="description"]`).type('pendant que même moins');
      cy.get(`[data-cy="description"]`).should('have.value', 'pendant que même moins');

      cy.get(`[data-cy="debitAccount"]`).type('frayer oui');
      cy.get(`[data-cy="debitAccount"]`).should('have.value', 'frayer oui');

      cy.get(`[data-cy="creditAccount"]`).type('personnel sombre err');
      cy.get(`[data-cy="creditAccount"]`).should('have.value', 'personnel sombre err');

      cy.get(`[data-cy="amount"]`).type('23239.67');
      cy.get(`[data-cy="amount"]`).should('have.value', '23239.67');

      cy.get(`[data-cy="exportedAt"]`).type('2026-03-31T17:21');
      cy.get(`[data-cy="exportedAt"]`).blur();
      cy.get(`[data-cy="exportedAt"]`).should('have.value', '2026-03-31T17:21');

      cy.get(`[data-cy="exportFormat"]`).type('entre');
      cy.get(`[data-cy="exportFormat"]`).should('have.value', 'entre');

      cy.get(`[data-cy="exportRef"]`).type('super');
      cy.get(`[data-cy="exportRef"]`).should('have.value', 'super');

      cy.get(`[data-cy="company"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        accountingEntry = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', accountingEntryPageUrlPattern);
    });
  });
});
