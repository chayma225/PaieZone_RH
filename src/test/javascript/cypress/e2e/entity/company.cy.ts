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

describe('Company e2e test', () => {
  const companyPageUrl = '/company';
  const companyPageUrlPattern = new RegExp('/company(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const companySample = {
    name: 'avare fermer avare',
    taxId: 'du moment que advers',
    tenantSchema: 'adversaire',
    active: false,
    createdAt: '2026-03-31T14:34:03.730Z',
  };

  let company;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/companies+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/companies').as('postEntityRequest');
    cy.intercept('DELETE', '/api/companies/*').as('deleteEntityRequest');
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

  it('Companies menu should load Companies page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('company');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Company').should('exist');
    cy.url().should('match', companyPageUrlPattern);
  });

  describe('Company page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(companyPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Company page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/company/new$'));
        cy.getEntityCreateUpdateHeading('Company');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', companyPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/companies',
          body: companySample,
        }).then(({ body }) => {
          company = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/companies+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [company],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(companyPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Company page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('company');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', companyPageUrlPattern);
      });

      it('edit button click should load edit Company page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Company');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', companyPageUrlPattern);
      });

      it('edit button click should load edit Company page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Company');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', companyPageUrlPattern);
      });

      it('last delete button click should delete instance of Company', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('company').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', companyPageUrlPattern);

        company = undefined;
      });
    });
  });

  describe('new Company page', () => {
    beforeEach(() => {
      cy.visit(`${companyPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Company');
    });

    it('should create an instance of Company', () => {
      cy.get(`[data-cy="name"]`).type('plaisanter fort');
      cy.get(`[data-cy="name"]`).should('have.value', 'plaisanter fort');

      cy.get(`[data-cy="tradeName"]`).type('trop peu moderne prendre');
      cy.get(`[data-cy="tradeName"]`).should('have.value', 'trop peu moderne prendre');

      cy.get(`[data-cy="taxId"]`).type('bè chef de cuisine');
      cy.get(`[data-cy="taxId"]`).should('have.value', 'bè chef de cuisine');

      cy.get(`[data-cy="cnssId"]`).type('dès que au lieu de');
      cy.get(`[data-cy="cnssId"]`).should('have.value', 'dès que au lieu de');

      cy.get(`[data-cy="address"]`).type('au cas où');
      cy.get(`[data-cy="address"]`).should('have.value', 'au cas où');

      cy.get(`[data-cy="city"]`).type('Reims');
      cy.get(`[data-cy="city"]`).should('have.value', 'Reims');

      cy.get(`[data-cy="postalCode"]`).type('séculaire ');
      cy.get(`[data-cy="postalCode"]`).should('have.value', 'séculaire ');

      cy.get(`[data-cy="phone"]`).type('0579738459');
      cy.get(`[data-cy="phone"]`).should('have.value', '0579738459');

      cy.get(`[data-cy="email"]`).type('Longin6@yahoo.fr');
      cy.get(`[data-cy="email"]`).should('have.value', 'Longin6@yahoo.fr');

      cy.get(`[data-cy="logoUrl"]`).type('tandis que');
      cy.get(`[data-cy="logoUrl"]`).should('have.value', 'tandis que');

      cy.get(`[data-cy="tenantSchema"]`).type('blablabla au-dessus de administration');
      cy.get(`[data-cy="tenantSchema"]`).should('have.value', 'blablabla au-dessus de administration');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(`[data-cy="trialEnd"]`).type('2026-03-31');
      cy.get(`[data-cy="trialEnd"]`).blur();
      cy.get(`[data-cy="trialEnd"]`).should('have.value', '2026-03-31');

      cy.get(`[data-cy="createdAt"]`).type('2026-03-31T07:10');
      cy.get(`[data-cy="createdAt"]`).blur();
      cy.get(`[data-cy="createdAt"]`).should('have.value', '2026-03-31T07:10');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        company = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', companyPageUrlPattern);
    });
  });
});
