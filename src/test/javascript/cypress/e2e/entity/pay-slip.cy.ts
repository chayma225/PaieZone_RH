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
  let username: string;
  let password: string;
  // const paySlipSample = {"month":10,"year":29136,"baseSalary":13888.91,"totalGains":12094.48,"totalDeductions":23708.97,"grossSalary":4775.23,"cnssSalaryAmount":28971.69,"taxableIncome":28493.51,"irppAmount":530.79,"netSalary":3524.96,"employerCnss":28683.61,"totalEmployerCost":31537.58,"status":"LOCKED"};

  let paySlip;
  // let employee;
  // let payrollPeriod;
  // let contract;

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
      body: {"matricule":"interroger sous coul","firstName":"Garance","lastName":"Lopez","firstNameAr":"en outre de de peur que adepte","lastNameAr":"renvoyer souvenir","birthDate":"2026-04-08","birthPlace":"sous","gender":"FEMALE","maritalStatus":"SINGLE","numberOfChildren":4,"chefDeFamille":true,"nationalId":"foule svelte","passportNumber":"du moment que","nationality":"pourpre","address":"séculaire en plus de vétuste","city":"Champigny-sur-Marne","personalEmail":"fermer étant donné que","professionalEmail":"en","phoneNumber":"gens pendant hormis","cnssNumber":"actionnaire","category":"MANAGER","photoUrl":"en decà de moderne dring","hireDate":"2026-04-08","trialEndDate":"2026-04-08","active":true,"notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","createdAt":"2026-04-08T05:47:42.435Z","updatedAt":"2026-04-08T17:35:46.154Z"},
    }).then(({ body }) => {
      employee = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/payroll-periods',
      body: {"month":9,"year":25821,"status":"CALCULATED","calculatedAt":"2026-04-08T10:17:54.055Z","validatedAt":"2026-04-07T19:03:50.777Z","lockedAt":"2026-04-08T08:33:36.806Z","notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ="},
    }).then(({ body }) => {
      payrollPeriod = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/contracts',
      body: {"reference":"approximativement","contractType":"CIVP","status":"SUSPENDED","startDate":"2026-04-08","endDate":"2026-04-08","signedDate":"2026-04-08","baseSalary":24438.54,"workingHoursWeek":34,"workingDaysWeek":7,"conventionCollective":"maintenant antagoniste","trialPeriodMonths":5,"renewalCount":2398,"documentUrl":"membre du personnel un peu naître","notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","createdAt":"2026-04-07T20:08:44.275Z"},
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
      cy.visit(paySlipPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('PaySlip');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of PaySlip', () => {
      cy.get(`[data-cy="month"]`).type('5');
      cy.get(`[data-cy="month"]`).should('have.value', '5');

      cy.get(`[data-cy="year"]`).type('12806');
      cy.get(`[data-cy="year"]`).should('have.value', '12806');

      cy.get(`[data-cy="baseSalary"]`).type('19616.55');
      cy.get(`[data-cy="baseSalary"]`).should('have.value', '19616.55');

      cy.get(`[data-cy="totalGains"]`).type('31540.15');
      cy.get(`[data-cy="totalGains"]`).should('have.value', '31540.15');

      cy.get(`[data-cy="totalDeductions"]`).type('20036.87');
      cy.get(`[data-cy="totalDeductions"]`).should('have.value', '20036.87');

      cy.get(`[data-cy="grossSalary"]`).type('14275.29');
      cy.get(`[data-cy="grossSalary"]`).should('have.value', '14275.29');

      cy.get(`[data-cy="cnssSalaryAmount"]`).type('1420.12');
      cy.get(`[data-cy="cnssSalaryAmount"]`).should('have.value', '1420.12');

      cy.get(`[data-cy="cavisAmount"]`).type('18289.32');
      cy.get(`[data-cy="cavisAmount"]`).should('have.value', '18289.32');

      cy.get(`[data-cy="taxableIncome"]`).type('14757.28');
      cy.get(`[data-cy="taxableIncome"]`).should('have.value', '14757.28');

      cy.get(`[data-cy="irppAmount"]`).type('1317.22');
      cy.get(`[data-cy="irppAmount"]`).should('have.value', '1317.22');

      cy.get(`[data-cy="netSalary"]`).type('12092.46');
      cy.get(`[data-cy="netSalary"]`).should('have.value', '12092.46');

      cy.get(`[data-cy="employerCnss"]`).type('32759.27');
      cy.get(`[data-cy="employerCnss"]`).should('have.value', '32759.27');

      cy.get(`[data-cy="employerCavis"]`).type('13399.22');
      cy.get(`[data-cy="employerCavis"]`).should('have.value', '13399.22');

      cy.get(`[data-cy="totalEmployerCost"]`).type('556.69');
      cy.get(`[data-cy="totalEmployerCost"]`).should('have.value', '556.69');

      cy.get(`[data-cy="workedDays"]`).type('31927');
      cy.get(`[data-cy="workedDays"]`).should('have.value', '31927');

      cy.get(`[data-cy="paidLeaveDays"]`).type('21186');
      cy.get(`[data-cy="paidLeaveDays"]`).should('have.value', '21186');

      cy.get(`[data-cy="unpaidDays"]`).type('28995');
      cy.get(`[data-cy="unpaidDays"]`).should('have.value', '28995');

      cy.get(`[data-cy="overtimeHours"]`).type('8795.01');
      cy.get(`[data-cy="overtimeHours"]`).should('have.value', '8795.01');

      cy.get(`[data-cy="status"]`).select('LOCKED');

      cy.get(`[data-cy="pdfUrl"]`).type('d’autant que tant que');
      cy.get(`[data-cy="pdfUrl"]`).should('have.value', 'd’autant que tant que');

      cy.get(`[data-cy="generatedAt"]`).type('2026-04-08T06:59');
      cy.get(`[data-cy="generatedAt"]`).blur();
      cy.get(`[data-cy="generatedAt"]`).should('have.value', '2026-04-08T06:59');

      cy.get(`[data-cy="sentToEmployeeAt"]`).type('2026-04-08T11:50');
      cy.get(`[data-cy="sentToEmployeeAt"]`).blur();
      cy.get(`[data-cy="sentToEmployeeAt"]`).should('have.value', '2026-04-08T11:50');

      cy.get(`[data-cy="bankTransferRef"]`).type('afin de crac');
      cy.get(`[data-cy="bankTransferRef"]`).should('have.value', 'afin de crac');

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
