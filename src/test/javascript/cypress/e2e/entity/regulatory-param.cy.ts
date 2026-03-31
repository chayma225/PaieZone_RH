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

describe('RegulatoryParam e2e test', () => {
  const regulatoryParamPageUrl = '/regulatory-param';
  const regulatoryParamPageUrlPattern = new RegExp('/regulatory-param(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const regulatoryParamSample = {
    paramKey: 'confronter admirablement sans doute',
    paramLabel: 'à condition que prestataire de services même',
    effectiveFrom: '2026-03-30',
    active: true,
  };

  let regulatoryParam;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/regulatory-params+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/regulatory-params').as('postEntityRequest');
    cy.intercept('DELETE', '/api/regulatory-params/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (regulatoryParam) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/regulatory-params/${regulatoryParam.id}`,
      }).then(() => {
        regulatoryParam = undefined;
      });
    }
  });

  it('RegulatoryParams menu should load RegulatoryParams page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('regulatory-param');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('RegulatoryParam').should('exist');
    cy.url().should('match', regulatoryParamPageUrlPattern);
  });

  describe('RegulatoryParam page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(regulatoryParamPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create RegulatoryParam page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/regulatory-param/new$'));
        cy.getEntityCreateUpdateHeading('RegulatoryParam');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', regulatoryParamPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/regulatory-params',
          body: regulatoryParamSample,
        }).then(({ body }) => {
          regulatoryParam = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/regulatory-params+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [regulatoryParam],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(regulatoryParamPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details RegulatoryParam page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('regulatoryParam');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', regulatoryParamPageUrlPattern);
      });

      it('edit button click should load edit RegulatoryParam page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('RegulatoryParam');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', regulatoryParamPageUrlPattern);
      });

      it('edit button click should load edit RegulatoryParam page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('RegulatoryParam');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', regulatoryParamPageUrlPattern);
      });

      it('last delete button click should delete instance of RegulatoryParam', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('regulatoryParam').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', regulatoryParamPageUrlPattern);

        regulatoryParam = undefined;
      });
    });
  });

  describe('new RegulatoryParam page', () => {
    beforeEach(() => {
      cy.visit(`${regulatoryParamPageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('RegulatoryParam');
    });

    it('should create an instance of RegulatoryParam', () => {
      cy.get(`[data-cy="paramKey"]`).type('aimable');
      cy.get(`[data-cy="paramKey"]`).should('have.value', 'aimable');

      cy.get(`[data-cy="paramLabel"]`).type('sauf');
      cy.get(`[data-cy="paramLabel"]`).should('have.value', 'sauf');

      cy.get(`[data-cy="numericValue"]`).type('30911.51');
      cy.get(`[data-cy="numericValue"]`).should('have.value', '30911.51');

      cy.get(`[data-cy="textValue"]`).type('hausser dehors jeune enfant');
      cy.get(`[data-cy="textValue"]`).should('have.value', 'hausser dehors jeune enfant');

      cy.get(`[data-cy="effectiveFrom"]`).type('2026-03-31');
      cy.get(`[data-cy="effectiveFrom"]`).blur();
      cy.get(`[data-cy="effectiveFrom"]`).should('have.value', '2026-03-31');

      cy.get(`[data-cy="effectiveTo"]`).type('2026-03-31');
      cy.get(`[data-cy="effectiveTo"]`).blur();
      cy.get(`[data-cy="effectiveTo"]`).should('have.value', '2026-03-31');

      cy.get(`[data-cy="legalReference"]`).type('vers cadre');
      cy.get(`[data-cy="legalReference"]`).should('have.value', 'vers cadre');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        regulatoryParam = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', regulatoryParamPageUrlPattern);
    });
  });
});
