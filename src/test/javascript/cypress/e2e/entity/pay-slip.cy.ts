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

describe('PaySlip e2e test', () => {
  const paySlipPageUrl = '/pay-slip';
  const paySlipPageUrlPattern = new RegExp('/pay-slip(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  // const paySlipSample = {"month":8,"year":9754,"baseSalary":4318.71,"totalGains":2082.26,"totalDeductions":5824.18,"grossSalary":4828.03,"cnssSalaryAmount":24199.2,"taxableIncome":21236.66,"irppAmount":24283.91,"netSalary":17338.45,"employerCnss":26502.17,"totalEmployerCost":17307.28,"status":"CALCULATED"};

  let paySlip;
  // let employee;
  // let payrollPeriod;
  // let contract;

  beforeEach(() => {
    cy.login(username, password);
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/employees',
      body: {"matricule":"de manière à","firstName":"Émeline","lastName":"Perez","firstNameAr":"avant que","lastNameAr":"à l'entour de guide","birthDate":"2026-03-31","birthPlace":"au cas où prout","gender":"FEMALE","maritalStatus":"DIVORCED","numberOfChildren":10,"chefDeFamille":false,"nationalId":"de la part de fade","passportNumber":"à l'entour de athlèt","nationality":"lorsque","address":"au-dessous de","city":"Drancy","personalEmail":"miaou","professionalEmail":"sans population du Québec corps enseignant","phoneNumber":"partager","cnssNumber":"groin groin de façon","category":"TECHNICIAN","photoUrl":"membre à vie commissionnaire deçà","hireDate":"2026-03-30","trialEndDate":"2026-03-31","active":true,"notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","createdAt":"2026-03-31T03:40:47.219Z","updatedAt":"2026-03-31T03:34:12.407Z"},
    }).then(({ body }) => {
      employee = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/payroll-periods',
      body: {"month":12,"year":20380,"status":"VALIDATED","calculatedAt":"2026-03-31T04:14:39.315Z","validatedAt":"2026-03-30T18:39:35.264Z","lockedAt":"2026-03-31T17:50:22.375Z","notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ="},
    }).then(({ body }) => {
      payrollPeriod = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/contracts',
      body: {"reference":"circuler conseil municipal sans que","contractType":"CDD","status":"TERMINATED","startDate":"2026-03-31","endDate":"2026-03-30","signedDate":"2026-03-30","baseSalary":18581.27,"workingHoursWeek":41,"workingDaysWeek":4,"conventionCollective":"hystérique charitable très","trialPeriodMonths":0,"renewalCount":22081,"documentUrl":"équipe de recherche","notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","createdAt":"2026-03-31T13:20:54.303Z"},
    }).then(({ body }) => {
      contract = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/pay-slips+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/pay-slips').as('postEntityRequest');
    cy.intercept('DELETE', '/api/pay-slips/*').as('deleteEntityRequest');
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/employees', {
      statusCode: 200,
      body: [employee],
    });

    cy.intercept('GET', '/api/payroll-periods', {
      statusCode: 200,
      body: [payrollPeriod],
    });

    cy.intercept('GET', '/api/contracts', {
      statusCode: 200,
      body: [contract],
    });

  });
   */

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
    if (payrollPeriod) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/payroll-periods/${payrollPeriod.id}`,
      }).then(() => {
        payrollPeriod = undefined;
      });
    }
    if (contract) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/contracts/${contract.id}`,
      }).then(() => {
        contract = undefined;
      });
    }
  });
   */

  it('PaySlips menu should load PaySlips page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('pay-slip');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('PaySlip').should('exist');
    cy.url().should('match', paySlipPageUrlPattern);
  });

  describe('PaySlip page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(paySlipPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create PaySlip page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/pay-slip/new$'));
        cy.getEntityCreateUpdateHeading('PaySlip');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', paySlipPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/pay-slips',
          body: {
            ...paySlipSample,
            employee: employee,
            payrollPeriod: payrollPeriod,
            contract: contract,
          },
        }).then(({ body }) => {
          paySlip = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/pay-slips+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/pay-slips?page=0&size=20>; rel="last",<http://localhost/api/pay-slips?page=0&size=20>; rel="first"',
              },
              body: [paySlip],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(paySlipPageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(paySlipPageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details PaySlip page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('paySlip');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', paySlipPageUrlPattern);
      });

      it('edit button click should load edit PaySlip page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('PaySlip');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', paySlipPageUrlPattern);
      });

      it('edit button click should load edit PaySlip page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('PaySlip');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', paySlipPageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of PaySlip', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('paySlip').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', paySlipPageUrlPattern);

        paySlip = undefined;
      });
    });
  });

  describe('new PaySlip page', () => {
    beforeEach(() => {
      cy.visit(`${paySlipPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('PaySlip');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of PaySlip', () => {
      cy.get(`[data-cy="month"]`).type('9');
      cy.get(`[data-cy="month"]`).should('have.value', '9');

      cy.get(`[data-cy="year"]`).type('21912');
      cy.get(`[data-cy="year"]`).should('have.value', '21912');

      cy.get(`[data-cy="baseSalary"]`).type('28454.71');
      cy.get(`[data-cy="baseSalary"]`).should('have.value', '28454.71');

      cy.get(`[data-cy="totalGains"]`).type('31253.98');
      cy.get(`[data-cy="totalGains"]`).should('have.value', '31253.98');

      cy.get(`[data-cy="totalDeductions"]`).type('12402.09');
      cy.get(`[data-cy="totalDeductions"]`).should('have.value', '12402.09');

      cy.get(`[data-cy="grossSalary"]`).type('30906.14');
      cy.get(`[data-cy="grossSalary"]`).should('have.value', '30906.14');

      cy.get(`[data-cy="cnssSalaryAmount"]`).type('10133.86');
      cy.get(`[data-cy="cnssSalaryAmount"]`).should('have.value', '10133.86');

      cy.get(`[data-cy="cavisAmount"]`).type('29405.52');
      cy.get(`[data-cy="cavisAmount"]`).should('have.value', '29405.52');

      cy.get(`[data-cy="taxableIncome"]`).type('11991.13');
      cy.get(`[data-cy="taxableIncome"]`).should('have.value', '11991.13');

      cy.get(`[data-cy="irppAmount"]`).type('13730.28');
      cy.get(`[data-cy="irppAmount"]`).should('have.value', '13730.28');

      cy.get(`[data-cy="netSalary"]`).type('28236.04');
      cy.get(`[data-cy="netSalary"]`).should('have.value', '28236.04');

      cy.get(`[data-cy="employerCnss"]`).type('20311.85');
      cy.get(`[data-cy="employerCnss"]`).should('have.value', '20311.85');

      cy.get(`[data-cy="employerCavis"]`).type('11006.99');
      cy.get(`[data-cy="employerCavis"]`).should('have.value', '11006.99');

      cy.get(`[data-cy="totalEmployerCost"]`).type('20849.13');
      cy.get(`[data-cy="totalEmployerCost"]`).should('have.value', '20849.13');

      cy.get(`[data-cy="workedDays"]`).type('32067');
      cy.get(`[data-cy="workedDays"]`).should('have.value', '32067');

      cy.get(`[data-cy="paidLeaveDays"]`).type('2156');
      cy.get(`[data-cy="paidLeaveDays"]`).should('have.value', '2156');

      cy.get(`[data-cy="unpaidDays"]`).type('29954');
      cy.get(`[data-cy="unpaidDays"]`).should('have.value', '29954');

      cy.get(`[data-cy="overtimeHours"]`).type('16759.55');
      cy.get(`[data-cy="overtimeHours"]`).should('have.value', '16759.55');

      cy.get(`[data-cy="status"]`).select('VALIDATED');

      cy.get(`[data-cy="pdfUrl"]`).type('quand ça');
      cy.get(`[data-cy="pdfUrl"]`).should('have.value', 'quand ça');

      cy.get(`[data-cy="generatedAt"]`).type('2026-03-31T13:20');
      cy.get(`[data-cy="generatedAt"]`).blur();
      cy.get(`[data-cy="generatedAt"]`).should('have.value', '2026-03-31T13:20');

      cy.get(`[data-cy="sentToEmployeeAt"]`).type('2026-03-31T05:06');
      cy.get(`[data-cy="sentToEmployeeAt"]`).blur();
      cy.get(`[data-cy="sentToEmployeeAt"]`).should('have.value', '2026-03-31T05:06');

      cy.get(`[data-cy="bankTransferRef"]`).type('accompagner parlementaire badaboum');
      cy.get(`[data-cy="bankTransferRef"]`).should('have.value', 'accompagner parlementaire badaboum');

      cy.get(`[data-cy="employee"]`).select(1);
      cy.get(`[data-cy="payrollPeriod"]`).select(1);
      cy.get(`[data-cy="contract"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        paySlip = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', paySlipPageUrlPattern);
    });
  });
});
