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
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const leaveTypeSample = {
    name: 'SICK',
    label: 'derrière débile entreprendre',
    maxDaysPerYear: 7435,
    carryOverDays: 13456,
    paid: true,
    requiresMedical: true,
    active: true,
  };

  let leaveType;
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
        name: 'bon virer',
        tradeName: 'a',
        taxId: 'patientèle',
        cnssId: 'boum',
        address: 'maigre affecter',
        city: 'Levallois-Perret',
        postalCode: 'sans doute',
        phone: '+33 406877766',
        email: 'Florent_Perrin85@hotmail.fr',
        logoUrl: 'entretenir',
        tenantSchema: 'répondre à peu près ouille',
        active: false,
        trialEnd: '2026-03-31',
        createdAt: '2026-03-31T00:51:34.864Z',
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
      cy.visit(`${leaveTypePageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('LeaveType');
    });

    it('should create an instance of LeaveType', () => {
      cy.get(`[data-cy="name"]`).select('MARRIAGE');

      cy.get(`[data-cy="label"]`).type('surveiller');
      cy.get(`[data-cy="label"]`).should('have.value', 'surveiller');

      cy.get(`[data-cy="maxDaysPerYear"]`).type('31657');
      cy.get(`[data-cy="maxDaysPerYear"]`).should('have.value', '31657');

      cy.get(`[data-cy="carryOverDays"]`).type('15636');
      cy.get(`[data-cy="carryOverDays"]`).should('have.value', '15636');

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
