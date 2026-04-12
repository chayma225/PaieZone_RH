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

describe('TaxBracket e2e test', () => {
  const taxBracketPageUrl = '/tax-bracket';
  const taxBracketPageUrlPattern = new RegExp('/tax-bracket(\\?.*)?$');
  let username: string;
  let password: string;
  const taxBracketSample = { year: 30441, minIncome: 8274.26, rate: 24093.03, fixedDeduction: 26161.89, sortOrder: 18750 };

  let taxBracket;

  before(() => {
    cy.credentials().then(credentials => {
      ({ username, password } = credentials);
    });
  });

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/tax-brackets+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/tax-brackets').as('postEntityRequest');
    cy.intercept('DELETE', '/api/tax-brackets/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (taxBracket) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/tax-brackets/${taxBracket.id}`,
      }).then(() => {
        taxBracket = undefined;
      });
    }
  });

  it('TaxBrackets menu should load TaxBrackets page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('tax-bracket');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('TaxBracket').should('exist');
    cy.url().should('match', taxBracketPageUrlPattern);
  });

  describe('TaxBracket page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(taxBracketPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create TaxBracket page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/tax-bracket/new$'));
        cy.getEntityCreateUpdateHeading('TaxBracket');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', taxBracketPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/tax-brackets',
          body: taxBracketSample,
        }).then(({ body }) => {
          taxBracket = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/tax-brackets+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [taxBracket],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(taxBracketPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details TaxBracket page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('taxBracket');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', taxBracketPageUrlPattern);
      });

      it('edit button click should load edit TaxBracket page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('TaxBracket');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', taxBracketPageUrlPattern);
      });

      it('edit button click should load edit TaxBracket page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('TaxBracket');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', taxBracketPageUrlPattern);
      });

      it('last delete button click should delete instance of TaxBracket', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('taxBracket').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', taxBracketPageUrlPattern);

        taxBracket = undefined;
      });
    });
  });

  describe('new TaxBracket page', () => {
    beforeEach(() => {
      cy.visit(taxBracketPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('TaxBracket');
    });

    it('should create an instance of TaxBracket', () => {
      cy.get(`[data-cy="year"]`).type('23466');
      cy.get(`[data-cy="year"]`).should('have.value', '23466');

      cy.get(`[data-cy="minIncome"]`).type('12129.19');
      cy.get(`[data-cy="minIncome"]`).should('have.value', '12129.19');

      cy.get(`[data-cy="maxIncome"]`).type('25161.38');
      cy.get(`[data-cy="maxIncome"]`).should('have.value', '25161.38');

      cy.get(`[data-cy="rate"]`).type('16839.01');
      cy.get(`[data-cy="rate"]`).should('have.value', '16839.01');

      cy.get(`[data-cy="fixedDeduction"]`).type('10061.46');
      cy.get(`[data-cy="fixedDeduction"]`).should('have.value', '10061.46');

      cy.get(`[data-cy="sortOrder"]`).type('13140');
      cy.get(`[data-cy="sortOrder"]`).should('have.value', '13140');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        taxBracket = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', taxBracketPageUrlPattern);
    });
  });
});
