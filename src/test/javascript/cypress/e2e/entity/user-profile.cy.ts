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

describe('UserProfile e2e test', () => {
  const userProfilePageUrl = '/user-profile';
  const userProfilePageUrlPattern = new RegExp('/user-profile(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const userProfileSample = { jhiUserId: 'tant que', role: 'SUPER_ADMIN', active: true };

  let userProfile;
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
        name: 'ouin athlète',
        tradeName: 'sitôt',
        taxId: 'tout à fait de crain',
        cnssId: 'actionnaire rédactio',
        address: 'près quasi crac',
        city: 'Villejuif',
        postalCode: 'doucement ',
        phone: '0546846051',
        email: 'Adjutor.Olivier10@yahoo.fr',
        logoUrl: 'psitt',
        tenantSchema: 'sitôt que dans',
        active: true,
        trialEnd: '2026-03-31',
        createdAt: '2026-03-31T07:53:14.604Z',
      },
    }).then(({ body }) => {
      company = body;
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/user-profiles+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/user-profiles').as('postEntityRequest');
    cy.intercept('DELETE', '/api/user-profiles/*').as('deleteEntityRequest');
  });

  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/companies', {
      statusCode: 200,
      body: [company],
    });
  });

  afterEach(() => {
    if (userProfile) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/user-profiles/${userProfile.id}`,
      }).then(() => {
        userProfile = undefined;
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

  it('UserProfiles menu should load UserProfiles page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('user-profile');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('UserProfile').should('exist');
    cy.url().should('match', userProfilePageUrlPattern);
  });

  describe('UserProfile page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(userProfilePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create UserProfile page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/user-profile/new$'));
        cy.getEntityCreateUpdateHeading('UserProfile');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', userProfilePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/user-profiles',
          body: {
            ...userProfileSample,
            company,
          },
        }).then(({ body }) => {
          userProfile = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/user-profiles+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              body: [userProfile],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(userProfilePageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details UserProfile page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('userProfile');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', userProfilePageUrlPattern);
      });

      it('edit button click should load edit UserProfile page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('UserProfile');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', userProfilePageUrlPattern);
      });

      it('edit button click should load edit UserProfile page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('UserProfile');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', userProfilePageUrlPattern);
      });

      it('last delete button click should delete instance of UserProfile', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('userProfile').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', userProfilePageUrlPattern);

        userProfile = undefined;
      });
    });
  });

  describe('new UserProfile page', () => {
    beforeEach(() => {
      cy.visit(`${userProfilePageUrl}`);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('UserProfile');
    });

    it('should create an instance of UserProfile', () => {
      cy.get(`[data-cy="jhiUserId"]`).type('agréable atchoum aïe');
      cy.get(`[data-cy="jhiUserId"]`).should('have.value', 'agréable atchoum aïe');

      cy.get(`[data-cy="role"]`).select('SUPER_ADMIN');

      cy.get(`[data-cy="phoneNumber"]`).type('parce que pour que');
      cy.get(`[data-cy="phoneNumber"]`).should('have.value', 'parce que pour que');

      cy.get(`[data-cy="avatarUrl"]`).type('foule');
      cy.get(`[data-cy="avatarUrl"]`).should('have.value', 'foule');

      cy.get(`[data-cy="locale"]`).type('hormis con');
      cy.get(`[data-cy="locale"]`).should('have.value', 'hormis con');

      cy.get(`[data-cy="lastLoginAt"]`).type('2026-03-31T10:31');
      cy.get(`[data-cy="lastLoginAt"]`).blur();
      cy.get(`[data-cy="lastLoginAt"]`).should('have.value', '2026-03-31T10:31');

      cy.get(`[data-cy="twoFactorEnabled"]`).should('not.be.checked');
      cy.get(`[data-cy="twoFactorEnabled"]`).click();
      cy.get(`[data-cy="twoFactorEnabled"]`).should('be.checked');

      cy.get(`[data-cy="twoFactorSecret"]`).type('outre');
      cy.get(`[data-cy="twoFactorSecret"]`).should('have.value', 'outre');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(`[data-cy="company"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        userProfile = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', userProfilePageUrlPattern);
    });
  });
});
