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

describe('Rubrique e2e test', () => {
  const rubriquePageUrl = '/rubrique';
  const rubriquePageUrlPattern = new RegExp('/rubrique(\\?.*)?$');
  let username: string;
  let password: string;
  const rubriqueSample = {
    code: 'ouf',
    label: 'au-dessous de à peine attendrir',
    rubriqueType: 'GAIN',
    base: 'FIXED',
    taxable: true,
    cnssSalary: false,
    cnssEmployer: true,
    sortOrder: 19588,
    active: false,
  };

  let rubrique;
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
        name: 'pour que',
        tradeName: 'ronron',
        taxId: 'de façon que',
        cnssId: 'incarner blême prési',
        address: 'pacifique',
        city: 'Toulouse',
        postalCode: 'brave grâc',
        phone: '0664905776',
        email: 'Althee.Rodriguez57@hotmail.fr',
        logoUrl: 'délégation déposer',
        tenantSchema: 'téméraire',
        active: false,
        trialEnd: '2026-04-08',
        createdAt: '2026-04-07T20:00:31.651Z',
      },
    }).then(({ body }) => {
      company = body;
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/rubriques+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/rubriques').as('postEntityRequest');
    cy.intercept('DELETE', '/api/rubriques/*').as('deleteEntityRequest');
  });

  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/companies', {
      statusCode: 200,
      body: [company],
    });
  });

  afterEach(() => {
    if (rubrique) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/rubriques/${rubrique.id}`,
      }).then(() => {
        rubrique = undefined;
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

  it('Rubriques menu should load Rubriques page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('rubrique');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Rubrique').should('exist');
    cy.url().should('match', rubriquePageUrlPattern);
  });

  describe('Rubrique page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(rubriquePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Rubrique page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/rubrique/new$'));
        cy.getEntityCreateUpdateHeading('Rubrique');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', rubriquePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/rubriques',
          body: {
            ...rubriqueSample,
            company,
          },
        }).then(({ body }) => {
          rubrique = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/rubriques+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [rubrique],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(rubriquePageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Rubrique page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('rubrique');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', rubriquePageUrlPattern);
      });

      it('edit button click should load edit Rubrique page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Rubrique');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', rubriquePageUrlPattern);
      });

      it('edit button click should load edit Rubrique page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Rubrique');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', rubriquePageUrlPattern);
      });

      it('last delete button click should delete instance of Rubrique', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('rubrique').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', rubriquePageUrlPattern);

        rubrique = undefined;
      });
    });
  });

  describe('new Rubrique page', () => {
    beforeEach(() => {
      cy.visit(rubriquePageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Rubrique');
    });

    it('should create an instance of Rubrique', () => {
      cy.get(`[data-cy="code"]`).type('sitôt que tellement');
      cy.get(`[data-cy="code"]`).should('have.value', 'sitôt que tellement');

      cy.get(`[data-cy="label"]`).type('drôlement sus');
      cy.get(`[data-cy="label"]`).should('have.value', 'drôlement sus');

      cy.get(`[data-cy="labelAr"]`).type('snif');
      cy.get(`[data-cy="labelAr"]`).should('have.value', 'snif');

      cy.get(`[data-cy="rubriqueType"]`).select('GAIN');

      cy.get(`[data-cy="base"]`).select('HOURS');

      cy.get(`[data-cy="rate"]`).type('24123.64');
      cy.get(`[data-cy="rate"]`).should('have.value', '24123.64');

      cy.get(`[data-cy="fixedAmount"]`).type('27584.3');
      cy.get(`[data-cy="fixedAmount"]`).should('have.value', '27584.3');

      cy.get(`[data-cy="formula"]`).type('personnel professionnel hors de');
      cy.get(`[data-cy="formula"]`).should('have.value', 'personnel professionnel hors de');

      cy.get(`[data-cy="taxable"]`).should('not.be.checked');
      cy.get(`[data-cy="taxable"]`).click();
      cy.get(`[data-cy="taxable"]`).should('be.checked');

      cy.get(`[data-cy="cnssSalary"]`).should('not.be.checked');
      cy.get(`[data-cy="cnssSalary"]`).click();
      cy.get(`[data-cy="cnssSalary"]`).should('be.checked');

      cy.get(`[data-cy="cnssEmployer"]`).should('not.be.checked');
      cy.get(`[data-cy="cnssEmployer"]`).click();
      cy.get(`[data-cy="cnssEmployer"]`).should('be.checked');

      cy.get(`[data-cy="sortOrder"]`).type('31679');
      cy.get(`[data-cy="sortOrder"]`).should('have.value', '31679');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(`[data-cy="company"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        rubrique = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', rubriquePageUrlPattern);
    });
  });
});
