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

describe('PublicHoliday e2e test', () => {
  const publicHolidayPageUrl = '/public-holiday';
  const publicHolidayPageUrlPattern = new RegExp('/public-holiday(\\?.*)?$');
  let username: string;
  let password: string;
  const publicHolidaySample = {
    name: 'en outre de épouser vorace',
    holidayDate: '2026-04-08',
    year: 9371,
    isRecurring: true,
    active: true,
  };

  let publicHoliday;

  before(() => {
    cy.credentials().then(credentials => {
      ({ username, password } = credentials);
    });
  });

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/public-holidays+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/public-holidays').as('postEntityRequest');
    cy.intercept('DELETE', '/api/public-holidays/*').as('deleteEntityRequest');
  });

  afterEach(() => {
    if (publicHoliday) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/public-holidays/${publicHoliday.id}`,
      }).then(() => {
        publicHoliday = undefined;
      });
    }
  });

  it('PublicHolidays menu should load PublicHolidays page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('public-holiday');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('PublicHoliday').should('exist');
    cy.url().should('match', publicHolidayPageUrlPattern);
  });

  describe('PublicHoliday page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(publicHolidayPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create PublicHoliday page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/public-holiday/new$'));
        cy.getEntityCreateUpdateHeading('PublicHoliday');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', publicHolidayPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/public-holidays',
          body: publicHolidaySample,
        }).then(({ body }) => {
          publicHoliday = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/public-holidays+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [publicHoliday],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(publicHolidayPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details PublicHoliday page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('publicHoliday');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', publicHolidayPageUrlPattern);
      });

      it('edit button click should load edit PublicHoliday page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('PublicHoliday');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', publicHolidayPageUrlPattern);
      });

      it('edit button click should load edit PublicHoliday page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('PublicHoliday');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', publicHolidayPageUrlPattern);
      });

      it('last delete button click should delete instance of PublicHoliday', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('publicHoliday').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', publicHolidayPageUrlPattern);

        publicHoliday = undefined;
      });
    });
  });

  describe('new PublicHoliday page', () => {
    beforeEach(() => {
      cy.visit(publicHolidayPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('PublicHoliday');
    });

    it('should create an instance of PublicHoliday', () => {
      cy.get(`[data-cy="name"]`).type('large actionnaire dès que');
      cy.get(`[data-cy="name"]`).should('have.value', 'large actionnaire dès que');

      cy.get(`[data-cy="nameAr"]`).type('mairie');
      cy.get(`[data-cy="nameAr"]`).should('have.value', 'mairie');

      cy.get(`[data-cy="holidayDate"]`).type('2026-04-08');
      cy.get(`[data-cy="holidayDate"]`).blur();
      cy.get(`[data-cy="holidayDate"]`).should('have.value', '2026-04-08');

      cy.get(`[data-cy="year"]`).type('16997');
      cy.get(`[data-cy="year"]`).should('have.value', '16997');

      cy.get(`[data-cy="isRecurring"]`).should('not.be.checked');
      cy.get(`[data-cy="isRecurring"]`).click();
      cy.get(`[data-cy="isRecurring"]`).should('be.checked');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        publicHoliday = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', publicHolidayPageUrlPattern);
    });
  });
});
