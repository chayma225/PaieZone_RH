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

describe('PaySlipLine e2e test', () => {
  const paySlipLinePageUrl = '/pay-slip-line';
  const paySlipLinePageUrlPattern = new RegExp('/pay-slip-line(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  // const paySlipLineSample = {"sortOrder":13687,"rubriqueCode":"pour que debout pour","rubriqueLabel":"épuiser rose aussi","rubriqueType":"GAIN","amount":27294.56,"taxable":false};

  let paySlipLine;
  // let paySlip;

  beforeEach(() => {
    cy.login(username, password);
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/pay-slips',
      body: {"month":2,"year":1090,"baseSalary":10608.48,"totalGains":3418.53,"totalDeductions":9124.78,"grossSalary":16849.06,"cnssSalaryAmount":4579.23,"cavisAmount":27811.95,"taxableIncome":26414.25,"irppAmount":9824.96,"netSalary":12797.64,"employerCnss":23425.54,"employerCavis":11398.27,"totalEmployerCost":17959.52,"workedDays":28959,"paidLeaveDays":13573,"unpaidDays":13735,"overtimeHours":15357.71,"status":"EXPORTED","pdfUrl":"pendant si","generatedAt":"2026-03-31T07:41:24.786Z","sentToEmployeeAt":"2026-03-31T08:08:38.199Z","bankTransferRef":"brave"},
    }).then(({ body }) => {
      paySlip = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/pay-slip-lines+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/pay-slip-lines').as('postEntityRequest');
    cy.intercept('DELETE', '/api/pay-slip-lines/*').as('deleteEntityRequest');
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/pay-slips', {
      statusCode: 200,
      body: [paySlip],
    });

    cy.intercept('GET', '/api/rubriques', {
      statusCode: 200,
      body: [],
    });

  });
   */

  afterEach(() => {
    if (paySlipLine) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/pay-slip-lines/${paySlipLine.id}`,
      }).then(() => {
        paySlipLine = undefined;
      });
    }
  });

  /* Disabled due to incompatibility
  afterEach(() => {
    if (paySlip) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/pay-slips/${paySlip.id}`,
      }).then(() => {
        paySlip = undefined;
      });
    }
  });
   */

  it('PaySlipLines menu should load PaySlipLines page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('pay-slip-line');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('PaySlipLine').should('exist');
    cy.url().should('match', paySlipLinePageUrlPattern);
  });

  describe('PaySlipLine page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(paySlipLinePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create PaySlipLine page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/pay-slip-line/new$'));
        cy.getEntityCreateUpdateHeading('PaySlipLine');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', paySlipLinePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/pay-slip-lines',
          body: {
            ...paySlipLineSample,
            paySlip: paySlip,
          },
        }).then(({ body }) => {
          paySlipLine = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/pay-slip-lines+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [paySlipLine],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(paySlipLinePageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(paySlipLinePageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details PaySlipLine page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('paySlipLine');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', paySlipLinePageUrlPattern);
      });

      it('edit button click should load edit PaySlipLine page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('PaySlipLine');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', paySlipLinePageUrlPattern);
      });

      it('edit button click should load edit PaySlipLine page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('PaySlipLine');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', paySlipLinePageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of PaySlipLine', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('paySlipLine').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', paySlipLinePageUrlPattern);

        paySlipLine = undefined;
      });
    });
  });

  describe('new PaySlipLine page', () => {
    beforeEach(() => {
      cy.visit(`${paySlipLinePageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('PaySlipLine');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of PaySlipLine', () => {
      cy.get(`[data-cy="sortOrder"]`).type('9690');
      cy.get(`[data-cy="sortOrder"]`).should('have.value', '9690');

      cy.get(`[data-cy="rubriqueCode"]`).type('crac');
      cy.get(`[data-cy="rubriqueCode"]`).should('have.value', 'crac');

      cy.get(`[data-cy="rubriqueLabel"]`).type('euh');
      cy.get(`[data-cy="rubriqueLabel"]`).should('have.value', 'euh');

      cy.get(`[data-cy="rubriqueType"]`).select('GAIN');

      cy.get(`[data-cy="base"]`).type('16133.35');
      cy.get(`[data-cy="base"]`).should('have.value', '16133.35');

      cy.get(`[data-cy="rate"]`).type('26901.41');
      cy.get(`[data-cy="rate"]`).should('have.value', '26901.41');

      cy.get(`[data-cy="amount"]`).type('30317.24');
      cy.get(`[data-cy="amount"]`).should('have.value', '30317.24');

      cy.get(`[data-cy="taxable"]`).should('not.be.checked');
      cy.get(`[data-cy="taxable"]`).click();
      cy.get(`[data-cy="taxable"]`).should('be.checked');

      cy.get(`[data-cy="paySlip"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        paySlipLine = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', paySlipLinePageUrlPattern);
    });
  });
});
