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
  let username: string;
  let password: string;
  const companySample = {
    name: 'exercer électorat',
    taxId: 'en guise de jusqu’à ',
    tenantSchema: 'avex adversaire',
    active: true,
    createdAt: '2026-04-08T07:17:35.532Z',
  };

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
      cy.visit(companyPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Company');
    });

    it('should create an instance of Company', () => {
      cy.get(`[data-cy="name"]`).type('de crainte que de alors que');
      cy.get(`[data-cy="name"]`).should('have.value', 'de crainte que de alors que');

      cy.get(`[data-cy="tradeName"]`).type('raide de façon à ce que bien que');
      cy.get(`[data-cy="tradeName"]`).should('have.value', 'raide de façon à ce que bien que');

      cy.get(`[data-cy="taxId"]`).type('durer même si');
      cy.get(`[data-cy="taxId"]`).should('have.value', 'durer même si');

      cy.get(`[data-cy="cnssId"]`).type('pff sitôt que');
      cy.get(`[data-cy="cnssId"]`).should('have.value', 'pff sitôt que');

      cy.get(`[data-cy="address"]`).type('dîner');
      cy.get(`[data-cy="address"]`).should('have.value', 'dîner');

      cy.get(`[data-cy="city"]`).type('Rouen');
      cy.get(`[data-cy="city"]`).should('have.value', 'Rouen');

      cy.get(`[data-cy="postalCode"]`).type('sans que');
      cy.get(`[data-cy="postalCode"]`).should('have.value', 'sans que');

      cy.get(`[data-cy="phone"]`).type('0587369598');
      cy.get(`[data-cy="phone"]`).should('have.value', '0587369598');

      cy.get(`[data-cy="email"]`).type('Philibert.Moreau@hotmail.fr');
      cy.get(`[data-cy="email"]`).should('have.value', 'Philibert.Moreau@hotmail.fr');

      cy.get(`[data-cy="logoUrl"]`).type('sans doute pendant que');
      cy.get(`[data-cy="logoUrl"]`).should('have.value', 'sans doute pendant que');

      cy.get(`[data-cy="tenantSchema"]`).type('jusqu’à ce que areu areu');
      cy.get(`[data-cy="tenantSchema"]`).should('have.value', 'jusqu’à ce que areu areu');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(`[data-cy="trialEnd"]`).type('2026-04-07');
      cy.get(`[data-cy="trialEnd"]`).blur();
      cy.get(`[data-cy="trialEnd"]`).should('have.value', '2026-04-07');

      cy.get(`[data-cy="createdAt"]`).type('2026-04-08T04:09');
      cy.get(`[data-cy="createdAt"]`).blur();
      cy.get(`[data-cy="createdAt"]`).should('have.value', '2026-04-08T04:09');

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
