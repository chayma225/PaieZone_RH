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
  let username: string;
  let password: string;
  // const paySlipLineSample = {"sortOrder":1521,"rubriqueCode":"jusqu’à ce que rentr","rubriqueLabel":"corps enseignant moins devant","rubriqueType":"GAIN","amount":3857.33,"taxable":true};

  let paySlipLine;
  // let paySlip;

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
      url: '/api/pay-slips',
      body: {"month":5,"year":3511,"baseSalary":13352.37,"totalGains":14592.49,"totalDeductions":6640.01,"grossSalary":26610.69,"cnssSalaryAmount":17465.08,"cavisAmount":3267.42,"taxableIncome":30732.88,"irppAmount":5242.13,"netSalary":12500.61,"employerCnss":13213.07,"employerCavis":17882.76,"totalEmployerCost":18634.26,"workedDays":30498,"paidLeaveDays":16414,"unpaidDays":27919,"overtimeHours":21850.86,"status":"DRAFT","pdfUrl":"lorsque pendant que administration","generatedAt":"2026-04-07T21:16:04.933Z","sentToEmployeeAt":"2026-04-07T22:52:36.406Z","bankTransferRef":"hypocrite"},
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
      cy.visit(paySlipLinePageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('PaySlipLine');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of PaySlipLine', () => {
      cy.get(`[data-cy="sortOrder"]`).type('31163');
      cy.get(`[data-cy="sortOrder"]`).should('have.value', '31163');

      cy.get(`[data-cy="rubriqueCode"]`).type('téméraire');
      cy.get(`[data-cy="rubriqueCode"]`).should('have.value', 'téméraire');

      cy.get(`[data-cy="rubriqueLabel"]`).type('tant puisque');
      cy.get(`[data-cy="rubriqueLabel"]`).should('have.value', 'tant puisque');

      cy.get(`[data-cy="rubriqueType"]`).select('EMPLOYER_CHARGE');

      cy.get(`[data-cy="base"]`).type('3774.95');
      cy.get(`[data-cy="base"]`).should('have.value', '3774.95');

      cy.get(`[data-cy="rate"]`).type('29811.61');
      cy.get(`[data-cy="rate"]`).should('have.value', '29811.61');

      cy.get(`[data-cy="amount"]`).type('15866.32');
      cy.get(`[data-cy="amount"]`).should('have.value', '15866.32');

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
