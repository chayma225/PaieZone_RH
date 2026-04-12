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
  let username: string;
  let password: string;
  const payrollPeriodSample = { month: 2, year: 2737, status: 'VALIDATED' };

  let payrollPeriod;
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
        name: 'tant que ha ha spécialiste',
        tradeName: 'prononcer',
        taxId: 'avant de au-dessous',
        cnssId: 'hebdomadaire si',
        address: 'dynamique enseigner fréquenter',
        city: 'Montauban',
        postalCode: 'spécialist',
        phone: '+33 650260622',
        email: 'Mathilde_David54@hotmail.fr',
        logoUrl: 'autant accrocher jusqu’à ce que',
        tenantSchema: 'vraisemblablement proche de collègue',
        active: false,
        trialEnd: '2026-04-08',
        createdAt: '2026-04-08T06:42:39.427Z',
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
      cy.visit(payrollPeriodPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('PayrollPeriod');
    });

    it('should create an instance of PayrollPeriod', () => {
      cy.get(`[data-cy="month"]`).type('8');
      cy.get(`[data-cy="month"]`).should('have.value', '8');

      cy.get(`[data-cy="year"]`).type('29880');
      cy.get(`[data-cy="year"]`).should('have.value', '29880');

      cy.get(`[data-cy="status"]`).select('VALIDATED');

      cy.get(`[data-cy="calculatedAt"]`).type('2026-04-08T14:46');
      cy.get(`[data-cy="calculatedAt"]`).blur();
      cy.get(`[data-cy="calculatedAt"]`).should('have.value', '2026-04-08T14:46');

      cy.get(`[data-cy="validatedAt"]`).type('2026-04-08T18:21');
      cy.get(`[data-cy="validatedAt"]`).blur();
      cy.get(`[data-cy="validatedAt"]`).should('have.value', '2026-04-08T18:21');

      cy.get(`[data-cy="lockedAt"]`).type('2026-04-08T02:23');
      cy.get(`[data-cy="lockedAt"]`).blur();
      cy.get(`[data-cy="lockedAt"]`).should('have.value', '2026-04-08T02:23');

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
