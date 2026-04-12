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
  let username: string;
  let password: string;
  const accountingEntrySample = {
    entryDate: '2026-04-08',
    journalRef: 'pendant que bûcher',
    entryType: 'CNSS_EXPENSE',
    description: 'détacher partenaire tant que',
    debitAccount: 'ouille',
    creditAccount: 'cuicui à bas de',
    amount: 31282.31,
  };

  let accountingEntry;
  let company;

  before(() => {
    cy.credentials().then(credentials => {
      ({ username, password } = credentials);
    });
  });

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/companies',
      body: {
        name: 'deçà chut',
        tradeName: 'infiniment',
        taxId: "bzzz à l'encontre de",
        cnssId: 'ouin chef',
        address: 'pff concurrence',
        city: 'Toulon',
        postalCode: 'parfois',
        phone: '0500110668',
        email: 'Moise_Adam@gmail.com',
        logoUrl: 'clientèle vivace',
        tenantSchema: 'mentir',
        active: false,
        trialEnd: '2026-04-07',
        createdAt: '2026-04-08T11:48:35.624Z',
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
      cy.visit(accountingEntryPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('AccountingEntry');
    });

    it('should create an instance of AccountingEntry', () => {
      cy.get(`[data-cy="entryDate"]`).type('2026-04-08');
      cy.get(`[data-cy="entryDate"]`).blur();
      cy.get(`[data-cy="entryDate"]`).should('have.value', '2026-04-08');

      cy.get(`[data-cy="journalRef"]`).type('éloigner atchoum étant donné que');
      cy.get(`[data-cy="journalRef"]`).should('have.value', 'éloigner atchoum étant donné que');

      cy.get(`[data-cy="entryType"]`).select('CNSS_EXPENSE');

      cy.get(`[data-cy="description"]`).type('masquer grâce à');
      cy.get(`[data-cy="description"]`).should('have.value', 'masquer grâce à');

      cy.get(`[data-cy="debitAccount"]`).type('neutre avare');
      cy.get(`[data-cy="debitAccount"]`).should('have.value', 'neutre avare');

      cy.get(`[data-cy="creditAccount"]`).type('fidèle biathlète');
      cy.get(`[data-cy="creditAccount"]`).should('have.value', 'fidèle biathlète');

      cy.get(`[data-cy="amount"]`).type('20847.23');
      cy.get(`[data-cy="amount"]`).should('have.value', '20847.23');

      cy.get(`[data-cy="exportedAt"]`).type('2026-04-08T12:40');
      cy.get(`[data-cy="exportedAt"]`).blur();
      cy.get(`[data-cy="exportedAt"]`).should('have.value', '2026-04-08T12:40');

      cy.get(`[data-cy="exportFormat"]`).type('arrière');
      cy.get(`[data-cy="exportFormat"]`).should('have.value', 'arrière');

      cy.get(`[data-cy="exportRef"]`).type('abriter snif');
      cy.get(`[data-cy="exportRef"]`).should('have.value', 'abriter snif');

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
