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

describe('LeaveType e2e test', () => {
  const leaveTypePageUrl = '/leave-type';
  const leaveTypePageUrlPattern = new RegExp('/leave-type(\\?.*)?$');
  let username: string;
  let password: string;
  const leaveTypeSample = {
    name: 'PATERNITY',
    label: 'broum équipe',
    maxDaysPerYear: 30527,
    carryOverDays: 497,
    paid: false,
    requiresMedical: false,
    active: true,
  };

  let leaveType;
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
        name: 'sans que',
        tradeName: 'sitôt que',
        taxId: 'adorable efficace',
        cnssId: 'police',
        address: 'administration',
        city: 'Clichy',
        postalCode: 'en face de',
        phone: '+33 329822553',
        email: 'Maud_Denis32@gmail.com',
        logoUrl: 'toc-toc administration',
        tenantSchema: 'succéder entourer',
        active: false,
        trialEnd: '2026-04-07',
        createdAt: '2026-04-08T04:38:37.756Z',
      },
    }).then(({ body }) => {
      company = body;
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/leave-types+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/leave-types').as('postEntityRequest');
    cy.intercept('DELETE', '/api/leave-types/*').as('deleteEntityRequest');
  });

  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/companies', {
      statusCode: 200,
      body: [company],
    });
  });

  afterEach(() => {
    if (leaveType) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/leave-types/${leaveType.id}`,
      }).then(() => {
        leaveType = undefined;
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

  it('LeaveTypes menu should load LeaveTypes page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('leave-type');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('LeaveType').should('exist');
    cy.url().should('match', leaveTypePageUrlPattern);
  });

  describe('LeaveType page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(leaveTypePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create LeaveType page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/leave-type/new$'));
        cy.getEntityCreateUpdateHeading('LeaveType');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', leaveTypePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/leave-types',
          body: {
            ...leaveTypeSample,
            company,
          },
        }).then(({ body }) => {
          leaveType = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/leave-types+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [leaveType],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(leaveTypePageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details LeaveType page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('leaveType');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', leaveTypePageUrlPattern);
      });

      it('edit button click should load edit LeaveType page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('LeaveType');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', leaveTypePageUrlPattern);
      });

      it('edit button click should load edit LeaveType page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('LeaveType');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', leaveTypePageUrlPattern);
      });

      it('last delete button click should delete instance of LeaveType', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('leaveType').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', leaveTypePageUrlPattern);

        leaveType = undefined;
      });
    });
  });

  describe('new LeaveType page', () => {
    beforeEach(() => {
      cy.visit(leaveTypePageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('LeaveType');
    });

    it('should create an instance of LeaveType', () => {
      cy.get(`[data-cy="name"]`).select('MATERNITY');

      cy.get(`[data-cy="label"]`).type('au cas où');
      cy.get(`[data-cy="label"]`).should('have.value', 'au cas où');

      cy.get(`[data-cy="maxDaysPerYear"]`).type('7000');
      cy.get(`[data-cy="maxDaysPerYear"]`).should('have.value', '7000');

      cy.get(`[data-cy="carryOverDays"]`).type('17309');
      cy.get(`[data-cy="carryOverDays"]`).should('have.value', '17309');

      cy.get(`[data-cy="paid"]`).should('not.be.checked');
      cy.get(`[data-cy="paid"]`).click();
      cy.get(`[data-cy="paid"]`).should('be.checked');

      cy.get(`[data-cy="requiresMedical"]`).should('not.be.checked');
      cy.get(`[data-cy="requiresMedical"]`).click();
      cy.get(`[data-cy="requiresMedical"]`).should('be.checked');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(`[data-cy="company"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        leaveType = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', leaveTypePageUrlPattern);
    });
  });
});
