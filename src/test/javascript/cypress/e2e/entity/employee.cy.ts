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
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  // const employeeSample = {"matricule":"toutefois membre tit","firstName":"Anselme","lastName":"Fleury","birthDate":"2026-03-31","gender":"FEMALE","maritalStatus":"WIDOWED","numberOfChildren":4,"chefDeFamille":false,"nationalId":"vraiment gens","category":"SUPERVISOR","hireDate":"2026-03-31","active":false,"createdAt":"2026-03-30T19:39:20.000Z"};

  let employee;
  // let company;
  // let department;
  // let jobPosition;

  beforeEach(() => {
    cy.login(username, password);
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/companies',
      body: {"name":"rectorat depuis arranger","tradeName":"chut secours","taxId":"même si athlète","cnssId":"paf occuper athlète","address":"tandis que bè à moins de","city":"Cergy","postalCode":"à l'insu d","phone":"+33 745535819","email":"Armel52@hotmail.fr","logoUrl":"cot cot du fait que","tenantSchema":"parce que tandis que crac","active":false,"trialEnd":"2026-03-31","createdAt":"2026-03-31T10:57:09.899Z"},
    }).then(({ body }) => {
      company = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/departments',
      body: {"code":"garantir ah","name":"membre à vie grandement","description":"au cas où au dépens de","active":true},
    }).then(({ body }) => {
      department = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/job-positions',
      body: {"code":"que blablabla confir","title":"vu que de façon que","description":"délectable","minSalary":31538.28,"maxSalary":10475.55,"active":false},
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
      cy.visit(`${employeePageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Employee');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of Employee', () => {
      cy.get(`[data-cy="matricule"]`).type('ouf lâche');
      cy.get(`[data-cy="matricule"]`).should('have.value', 'ouf lâche');

      cy.get(`[data-cy="firstName"]`).type('Honoré');
      cy.get(`[data-cy="firstName"]`).should('have.value', 'Honoré');

      cy.get(`[data-cy="lastName"]`).type('Dufour');
      cy.get(`[data-cy="lastName"]`).should('have.value', 'Dufour');

      cy.get(`[data-cy="firstNameAr"]`).type('de façon à endormir');
      cy.get(`[data-cy="firstNameAr"]`).should('have.value', 'de façon à endormir');

      cy.get(`[data-cy="lastNameAr"]`).type('afin de quasiment');
      cy.get(`[data-cy="lastNameAr"]`).should('have.value', 'afin de quasiment');

      cy.get(`[data-cy="birthDate"]`).type('2026-03-31');
      cy.get(`[data-cy="birthDate"]`).blur();
      cy.get(`[data-cy="birthDate"]`).should('have.value', '2026-03-31');

      cy.get(`[data-cy="birthPlace"]`).type('patientèle');
      cy.get(`[data-cy="birthPlace"]`).should('have.value', 'patientèle');

      cy.get(`[data-cy="gender"]`).select('FEMALE');

      cy.get(`[data-cy="maritalStatus"]`).select('WIDOWED');

      cy.get(`[data-cy="numberOfChildren"]`).type('10');
      cy.get(`[data-cy="numberOfChildren"]`).should('have.value', '10');

      cy.get(`[data-cy="chefDeFamille"]`).should('not.be.checked');
      cy.get(`[data-cy="chefDeFamille"]`).click();
      cy.get(`[data-cy="chefDeFamille"]`).should('be.checked');

      cy.get(`[data-cy="nationalId"]`).type('toc jeune enfant');
      cy.get(`[data-cy="nationalId"]`).should('have.value', 'toc jeune enfant');

      cy.get(`[data-cy="passportNumber"]`).type('dès que turquoise au');
      cy.get(`[data-cy="passportNumber"]`).should('have.value', 'dès que turquoise au');

      cy.get(`[data-cy="nationality"]`).type('perfectionner grandir commissionnaire');
      cy.get(`[data-cy="nationality"]`).should('have.value', 'perfectionner grandir commissionnaire');

      cy.get(`[data-cy="address"]`).type('habile plouf cocorico');
      cy.get(`[data-cy="address"]`).should('have.value', 'habile plouf cocorico');

      cy.get(`[data-cy="city"]`).type('Avignon');
      cy.get(`[data-cy="city"]`).should('have.value', 'Avignon');

      cy.get(`[data-cy="personalEmail"]`).type('promener ha ha');
      cy.get(`[data-cy="personalEmail"]`).should('have.value', 'promener ha ha');

      cy.get(`[data-cy="professionalEmail"]`).type('hier vis-à-vie de équipe de recherche');
      cy.get(`[data-cy="professionalEmail"]`).should('have.value', 'hier vis-à-vie de équipe de recherche');

      cy.get(`[data-cy="phoneNumber"]`).type('bang super tellement');
      cy.get(`[data-cy="phoneNumber"]`).should('have.value', 'bang super tellement');

      cy.get(`[data-cy="cnssNumber"]`).type('posséder environ');
      cy.get(`[data-cy="cnssNumber"]`).should('have.value', 'posséder environ');

      cy.get(`[data-cy="category"]`).select('EXECUTIVE');

      cy.get(`[data-cy="photoUrl"]`).type('dès que à la merci vraisemblablement');
      cy.get(`[data-cy="photoUrl"]`).should('have.value', 'dès que à la merci vraisemblablement');

      cy.get(`[data-cy="hireDate"]`).type('2026-03-31');
      cy.get(`[data-cy="hireDate"]`).blur();
      cy.get(`[data-cy="hireDate"]`).should('have.value', '2026-03-31');

      cy.get(`[data-cy="trialEndDate"]`).type('2026-03-31');
      cy.get(`[data-cy="trialEndDate"]`).blur();
      cy.get(`[data-cy="trialEndDate"]`).should('have.value', '2026-03-31');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(`[data-cy="notes"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="notes"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="createdAt"]`).type('2026-03-31T06:53');
      cy.get(`[data-cy="createdAt"]`).blur();
      cy.get(`[data-cy="createdAt"]`).should('have.value', '2026-03-31T06:53');

      cy.get(`[data-cy="updatedAt"]`).type('2026-03-30T18:16');
      cy.get(`[data-cy="updatedAt"]`).blur();
      cy.get(`[data-cy="updatedAt"]`).should('have.value', '2026-03-30T18:16');

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
