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

describe('PayrollPeriod e2e test', () => {
  const payrollPeriodPageUrl = '/payroll-period';
  const payrollPeriodPageUrlPattern = new RegExp('/payroll-period(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const payrollPeriodSample = { month: 10, year: 30606, status: 'LOCKED' };

  let payrollPeriod;
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
        name: 'miaou lorsque rose',
        tradeName: 'à demi membre titulaire toc-toc',
        taxId: 'autour de mêler',
        cnssId: 'chef de cuisine moye',
        address: 'où ha ha malade',
        city: 'Vénissieux',
        postalCode: 'cot cot',
        phone: '+33 139547074',
        email: 'Audran.Morin81@gmail.com',
        logoUrl: 'jusqu’à ce que charitable',
        tenantSchema: 'dès que déterminer',
        active: false,
        trialEnd: '2026-03-31',
        createdAt: '2026-03-31T00:40:01.677Z',
      },
    }).then(({ body }) => {
      company = body;
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/payroll-periods+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/payroll-periods').as('postEntityRequest');
    cy.intercept('DELETE', '/api/payroll-periods/*').as('deleteEntityRequest');
  });

  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/companies', {
      statusCode: 200,
      body: [company],
    });

    cy.intercept('GET', '/api/user-profiles', {
      statusCode: 200,
      body: [],
    });
  });

  afterEach(() => {
    if (payrollPeriod) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/payroll-periods/${payrollPeriod.id}`,
      }).then(() => {
        payrollPeriod = undefined;
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

  it('PayrollPeriods menu should load PayrollPeriods page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('payroll-period');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('PayrollPeriod').should('exist');
    cy.url().should('match', payrollPeriodPageUrlPattern);
  });

  describe('PayrollPeriod page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(payrollPeriodPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create PayrollPeriod page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/payroll-period/new$'));
        cy.getEntityCreateUpdateHeading('PayrollPeriod');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', payrollPeriodPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/payroll-periods',
          body: {
            ...payrollPeriodSample,
            company,
          },
        }).then(({ body }) => {
          payrollPeriod = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/payroll-periods+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/payroll-periods?page=0&size=20>; rel="last",<http://localhost/api/payroll-periods?page=0&size=20>; rel="first"',
              },
              body: [payrollPeriod],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(payrollPeriodPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details PayrollPeriod page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('payrollPeriod');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', payrollPeriodPageUrlPattern);
      });

      it('edit button click should load edit PayrollPeriod page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('PayrollPeriod');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', payrollPeriodPageUrlPattern);
      });

      it('edit button click should load edit PayrollPeriod page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('PayrollPeriod');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', payrollPeriodPageUrlPattern);
      });

      it('last delete button click should delete instance of PayrollPeriod', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('payrollPeriod').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', payrollPeriodPageUrlPattern);

        payrollPeriod = undefined;
      });
    });
  });

  describe('new PayrollPeriod page', () => {
    beforeEach(() => {
      cy.visit(`${payrollPeriodPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('PayrollPeriod');
    });

    it('should create an instance of PayrollPeriod', () => {
      cy.get(`[data-cy="month"]`).type('11');
      cy.get(`[data-cy="month"]`).should('have.value', '11');

      cy.get(`[data-cy="year"]`).type('5202');
      cy.get(`[data-cy="year"]`).should('have.value', '5202');

      cy.get(`[data-cy="status"]`).select('CALCULATED');

      cy.get(`[data-cy="calculatedAt"]`).type('2026-03-30T21:30');
      cy.get(`[data-cy="calculatedAt"]`).blur();
      cy.get(`[data-cy="calculatedAt"]`).should('have.value', '2026-03-30T21:30');

      cy.get(`[data-cy="validatedAt"]`).type('2026-03-30T21:18');
      cy.get(`[data-cy="validatedAt"]`).blur();
      cy.get(`[data-cy="validatedAt"]`).should('have.value', '2026-03-30T21:18');

      cy.get(`[data-cy="lockedAt"]`).type('2026-03-31T02:42');
      cy.get(`[data-cy="lockedAt"]`).blur();
      cy.get(`[data-cy="lockedAt"]`).should('have.value', '2026-03-31T02:42');

      cy.get(`[data-cy="notes"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="notes"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="company"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        payrollPeriod = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', payrollPeriodPageUrlPattern);
    });
  });
});
