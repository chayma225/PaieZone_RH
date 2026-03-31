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

describe('JobPosition e2e test', () => {
  const jobPositionPageUrl = '/job-position';
  const jobPositionPageUrlPattern = new RegExp('/job-position(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const jobPositionSample = { code: 'aussi de façon à ce ', title: 'chef', active: true };

  let jobPosition;
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
        name: 'via',
        tradeName: 'à peine',
        taxId: 'parler approuver en ',
        cnssId: 'timide en plus de à ',
        address: 'de crainte que adversaire chef',
        city: 'Aubervilliers',
        postalCode: 'puisque hô',
        phone: '0527837359',
        email: 'Cyrille14@gmail.com',
        logoUrl: 'ci en dépit de pour',
        tenantSchema: 'ouah broum à la merci',
        active: false,
        trialEnd: '2026-03-31',
        createdAt: '2026-03-31T09:29:26.413Z',
      },
    }).then(({ body }) => {
      company = body;
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/job-positions+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/job-positions').as('postEntityRequest');
    cy.intercept('DELETE', '/api/job-positions/*').as('deleteEntityRequest');
  });

  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/companies', {
      statusCode: 200,
      body: [company],
    });

    cy.intercept('GET', '/api/departments', {
      statusCode: 200,
      body: [],
    });
  });

  afterEach(() => {
    if (jobPosition) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/job-positions/${jobPosition.id}`,
      }).then(() => {
        jobPosition = undefined;
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

  it('JobPositions menu should load JobPositions page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('job-position');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('JobPosition').should('exist');
    cy.url().should('match', jobPositionPageUrlPattern);
  });

  describe('JobPosition page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(jobPositionPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create JobPosition page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/job-position/new$'));
        cy.getEntityCreateUpdateHeading('JobPosition');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', jobPositionPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/job-positions',
          body: {
            ...jobPositionSample,
            company,
          },
        }).then(({ body }) => {
          jobPosition = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/job-positions+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [jobPosition],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(jobPositionPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details JobPosition page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('jobPosition');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', jobPositionPageUrlPattern);
      });

      it('edit button click should load edit JobPosition page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('JobPosition');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', jobPositionPageUrlPattern);
      });

      it('edit button click should load edit JobPosition page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('JobPosition');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', jobPositionPageUrlPattern);
      });

      it('last delete button click should delete instance of JobPosition', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('jobPosition').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', jobPositionPageUrlPattern);

        jobPosition = undefined;
      });
    });
  });

  describe('new JobPosition page', () => {
    beforeEach(() => {
      cy.visit(`${jobPositionPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('JobPosition');
    });

    it('should create an instance of JobPosition', () => {
      cy.get(`[data-cy="code"]`).type('de par sans');
      cy.get(`[data-cy="code"]`).should('have.value', 'de par sans');

      cy.get(`[data-cy="title"]`).type('coac coac toc personnel professionnel');
      cy.get(`[data-cy="title"]`).should('have.value', 'coac coac toc personnel professionnel');

      cy.get(`[data-cy="description"]`).type('hors');
      cy.get(`[data-cy="description"]`).should('have.value', 'hors');

      cy.get(`[data-cy="minSalary"]`).type('29112.27');
      cy.get(`[data-cy="minSalary"]`).should('have.value', '29112.27');

      cy.get(`[data-cy="maxSalary"]`).type('14836.46');
      cy.get(`[data-cy="maxSalary"]`).should('have.value', '14836.46');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(`[data-cy="company"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        jobPosition = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', jobPositionPageUrlPattern);
    });
  });
});
