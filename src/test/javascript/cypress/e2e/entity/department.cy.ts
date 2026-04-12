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

describe('Department e2e test', () => {
  const departmentPageUrl = '/department';
  const departmentPageUrlPattern = new RegExp('/department(\\?.*)?$');
  let username: string;
  let password: string;
  const departmentSample = { code: 'cuicui', name: 'efficace', active: false };

  let department;
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
        name: 'circulaire foule',
        tradeName: 'mordre insipide',
        taxId: 'abolir sous vu que',
        cnssId: 'depuis souvent ennuy',
        address: 'auprès de faciliter jusqu’à ce que',
        city: 'Chambéry',
        postalCode: 'plouf',
        phone: '+33 140564375',
        email: 'Auxence_Huet@gmail.com',
        logoUrl: 'jouer biathlète',
        tenantSchema: 'à cause de avant de',
        active: true,
        trialEnd: '2026-04-07',
        createdAt: '2026-04-07T22:02:25.871Z',
      },
    }).then(({ body }) => {
      company = body;
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/departments+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/departments').as('postEntityRequest');
    cy.intercept('DELETE', '/api/departments/*').as('deleteEntityRequest');
  });

  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/companies', {
      statusCode: 200,
      body: [company],
    });

    cy.intercept('GET', '/api/employees', {
      statusCode: 200,
      body: [],
    });
  });

  afterEach(() => {
    if (department) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/departments/${department.id}`,
      }).then(() => {
        department = undefined;
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

  it('Departments menu should load Departments page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('department');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Department').should('exist');
    cy.url().should('match', departmentPageUrlPattern);
  });

  describe('Department page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(departmentPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Department page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/department/new$'));
        cy.getEntityCreateUpdateHeading('Department');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', departmentPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/departments',
          body: {
            ...departmentSample,
            company,
          },
        }).then(({ body }) => {
          department = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/departments+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [department],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(departmentPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Department page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('department');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', departmentPageUrlPattern);
      });

      it('edit button click should load edit Department page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Department');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', departmentPageUrlPattern);
      });

      it('edit button click should load edit Department page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Department');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', departmentPageUrlPattern);
      });

      it('last delete button click should delete instance of Department', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('department').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', departmentPageUrlPattern);

        department = undefined;
      });
    });
  });

  describe('new Department page', () => {
    beforeEach(() => {
      cy.visit(departmentPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Department');
    });

    it('should create an instance of Department', () => {
      cy.get(`[data-cy="code"]`).type('sentir');
      cy.get(`[data-cy="code"]`).should('have.value', 'sentir');

      cy.get(`[data-cy="name"]`).type('porte-parole tellement');
      cy.get(`[data-cy="name"]`).should('have.value', 'porte-parole tellement');

      cy.get(`[data-cy="description"]`).type('dans la mesure où');
      cy.get(`[data-cy="description"]`).should('have.value', 'dans la mesure où');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(`[data-cy="company"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        department = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', departmentPageUrlPattern);
    });
  });
});
