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

describe('Employee e2e test', () => {
  const employeePageUrl = '/employee';
  const employeePageUrlPattern = new RegExp('/employee(\\?.*)?$');
  let username: string;
  let password: string;
  // const employeeSample = {"matricule":"pacifique ding","firstName":"Taurin","lastName":"Fernandez","birthDate":"2026-04-07","gender":"FEMALE","maritalStatus":"DIVORCED","numberOfChildren":9,"chefDeFamille":true,"nationalId":"direction","category":"EXECUTIVE","hireDate":"2026-04-08","active":true,"createdAt":"2026-04-08T17:38:26.959Z"};

  let employee;
  // let company;
  // let department;
  // let jobPosition;

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
      url: '/api/companies',
      body: {"name":"capter équipe multiple","tradeName":"vroum lunatique","taxId":"communauté étudiante","cnssId":"bang","address":"cot cot à côté de condamner","city":"Amiens","postalCode":"renforcer","phone":"+33 760758751","email":"Gondebaud.Dasilva@yahoo.fr","logoUrl":"solitaire à moins de","tenantSchema":"jusqu’à ce que","active":false,"trialEnd":"2026-04-07","createdAt":"2026-04-08T05:14:09.004Z"},
    }).then(({ body }) => {
      company = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/departments',
      body: {"code":"au dépens de à défau","name":"abriter grandement","description":"coller actionnaire présidence","active":true},
    }).then(({ body }) => {
      department = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/job-positions',
      body: {"code":"dring","title":"ouch","description":"à condition que porte-parole auparavant","minSalary":28972.97,"maxSalary":15053.23,"active":false},
    }).then(({ body }) => {
      jobPosition = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/employees+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/employees').as('postEntityRequest');
    cy.intercept('DELETE', '/api/employees/*').as('deleteEntityRequest');
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/companies', {
      statusCode: 200,
      body: [company],
    });

    cy.intercept('GET', '/api/departments', {
      statusCode: 200,
      body: [department],
    });

    cy.intercept('GET', '/api/job-positions', {
      statusCode: 200,
      body: [jobPosition],
    });

    cy.intercept('GET', '/api/employees', {
      statusCode: 200,
      body: [],
    });

    cy.intercept('GET', '/api/user-profiles', {
      statusCode: 200,
      body: [],
    });

  });
   */

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

  /* Disabled due to incompatibility
  afterEach(() => {
    if (company) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/companies/${company.id}`,
      }).then(() => {
        company = undefined;
      });
    }
    if (department) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/departments/${department.id}`,
      }).then(() => {
        department = undefined;
      });
    }
    if (jobPosition) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/job-positions/${jobPosition.id}`,
      }).then(() => {
        jobPosition = undefined;
      });
    }
  });
   */

  it('Employees menu should load Employees page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('employee');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Employee').should('exist');
    cy.url().should('match', employeePageUrlPattern);
  });

  describe('Employee page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(employeePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Employee page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/employee/new$'));
        cy.getEntityCreateUpdateHeading('Employee');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', employeePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/employees',
          body: {
            ...employeeSample,
            company: company,
            department: department,
            position: jobPosition,
          },
        }).then(({ body }) => {
          employee = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/employees+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/employees?page=0&size=20>; rel="last",<http://localhost/api/employees?page=0&size=20>; rel="first"',
              },
              body: [employee],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(employeePageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(employeePageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details Employee page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('employee');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', employeePageUrlPattern);
      });

      it('edit button click should load edit Employee page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Employee');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', employeePageUrlPattern);
      });

      it('edit button click should load edit Employee page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Employee');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', employeePageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of Employee', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('employee').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', employeePageUrlPattern);

        employee = undefined;
      });
    });
  });

  describe('new Employee page', () => {
    beforeEach(() => {
      cy.visit(employeePageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Employee');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of Employee', () => {
      cy.get(`[data-cy="matricule"]`).type('de manière à ce que ');
      cy.get(`[data-cy="matricule"]`).should('have.value', 'de manière à ce que ');

      cy.get(`[data-cy="firstName"]`).type('Améliane');
      cy.get(`[data-cy="firstName"]`).should('have.value', 'Améliane');

      cy.get(`[data-cy="lastName"]`).type('Roussel');
      cy.get(`[data-cy="lastName"]`).should('have.value', 'Roussel');

      cy.get(`[data-cy="firstNameAr"]`).type('par suite de');
      cy.get(`[data-cy="firstNameAr"]`).should('have.value', 'par suite de');

      cy.get(`[data-cy="lastNameAr"]`).type('chut tuer');
      cy.get(`[data-cy="lastNameAr"]`).should('have.value', 'chut tuer');

      cy.get(`[data-cy="birthDate"]`).type('2026-04-08');
      cy.get(`[data-cy="birthDate"]`).blur();
      cy.get(`[data-cy="birthDate"]`).should('have.value', '2026-04-08');

      cy.get(`[data-cy="birthPlace"]`).type('meuh blême mal');
      cy.get(`[data-cy="birthPlace"]`).should('have.value', 'meuh blême mal');

      cy.get(`[data-cy="gender"]`).select('FEMALE');

      cy.get(`[data-cy="maritalStatus"]`).select('MARRIED');

      cy.get(`[data-cy="numberOfChildren"]`).type('1');
      cy.get(`[data-cy="numberOfChildren"]`).should('have.value', '1');

      cy.get(`[data-cy="chefDeFamille"]`).should('not.be.checked');
      cy.get(`[data-cy="chefDeFamille"]`).click();
      cy.get(`[data-cy="chefDeFamille"]`).should('be.checked');

      cy.get(`[data-cy="nationalId"]`).type('équipe de recherche ');
      cy.get(`[data-cy="nationalId"]`).should('have.value', 'équipe de recherche ');

      cy.get(`[data-cy="passportNumber"]`).type('diététiste');
      cy.get(`[data-cy="passportNumber"]`).should('have.value', 'diététiste');

      cy.get(`[data-cy="nationality"]`).type('aigre camarade');
      cy.get(`[data-cy="nationality"]`).should('have.value', 'aigre camarade');

      cy.get(`[data-cy="address"]`).type('insister parmi');
      cy.get(`[data-cy="address"]`).should('have.value', 'insister parmi');

      cy.get(`[data-cy="city"]`).type('Bourges');
      cy.get(`[data-cy="city"]`).should('have.value', 'Bourges');

      cy.get(`[data-cy="personalEmail"]`).type('davantage');
      cy.get(`[data-cy="personalEmail"]`).should('have.value', 'davantage');

      cy.get(`[data-cy="professionalEmail"]`).type('direction vivace proche de');
      cy.get(`[data-cy="professionalEmail"]`).should('have.value', 'direction vivace proche de');

      cy.get(`[data-cy="phoneNumber"]`).type('alors que');
      cy.get(`[data-cy="phoneNumber"]`).should('have.value', 'alors que');

      cy.get(`[data-cy="cnssNumber"]`).type('à moins de déployer ');
      cy.get(`[data-cy="cnssNumber"]`).should('have.value', 'à moins de déployer ');

      cy.get(`[data-cy="category"]`).select('WORKER');

      cy.get(`[data-cy="photoUrl"]`).type('ressortir au défaut de aimable');
      cy.get(`[data-cy="photoUrl"]`).should('have.value', 'ressortir au défaut de aimable');

      cy.get(`[data-cy="hireDate"]`).type('2026-04-08');
      cy.get(`[data-cy="hireDate"]`).blur();
      cy.get(`[data-cy="hireDate"]`).should('have.value', '2026-04-08');

      cy.get(`[data-cy="trialEndDate"]`).type('2026-04-07');
      cy.get(`[data-cy="trialEndDate"]`).blur();
      cy.get(`[data-cy="trialEndDate"]`).should('have.value', '2026-04-07');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(`[data-cy="notes"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="notes"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="createdAt"]`).type('2026-04-08T05:24');
      cy.get(`[data-cy="createdAt"]`).blur();
      cy.get(`[data-cy="createdAt"]`).should('have.value', '2026-04-08T05:24');

      cy.get(`[data-cy="updatedAt"]`).type('2026-04-07T23:35');
      cy.get(`[data-cy="updatedAt"]`).blur();
      cy.get(`[data-cy="updatedAt"]`).should('have.value', '2026-04-07T23:35');

      cy.get(`[data-cy="company"]`).select(1);
      cy.get(`[data-cy="department"]`).select(1);
      cy.get(`[data-cy="position"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        employee = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', employeePageUrlPattern);
    });
  });
});
