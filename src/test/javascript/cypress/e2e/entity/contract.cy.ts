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

describe('Contract e2e test', () => {
  const contractPageUrl = '/contract';
  const contractPageUrlPattern = new RegExp('/contract(\\?.*)?$');
  let username: string;
  let password: string;
  // const contractSample = {"reference":"électorat","contractType":"INTERIMAIRE","status":"ACTIVE","startDate":"2026-04-08","baseSalary":20104.53,"workingHoursWeek":39,"workingDaysWeek":1,"createdAt":"2026-04-08T00:25:41.413Z"};

  let contract;
  // let employee;

  before(() => {
    cy.credentials().then(credentials => {
      ({ username, password } = credentials);
    });
  });

  beforeEach(() => {
    cy.login(username, password);
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/employees',
      body: {"matricule":"devant commis de cui","firstName":"Acanthe","lastName":"Gautier","firstNameAr":"loufoque","lastNameAr":"afin que collègue","birthDate":"2026-04-08","birthPlace":"ah triste","gender":"FEMALE","maritalStatus":"DIVORCED","numberOfChildren":8,"chefDeFamille":true,"nationalId":"avant que conseil mu","passportNumber":"personnel profession","nationality":"hors de fonctionnaire super","address":"adversaire","city":"Saint-Paul","personalEmail":"miam ouille","professionalEmail":"probablement","phoneNumber":"multiple retarder ar","cnssNumber":"parce que collègue o","category":"TECHNICIAN","photoUrl":"à raison de d’autant que pour","hireDate":"2026-04-08","trialEndDate":"2026-04-08","active":false,"notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","createdAt":"2026-04-07T23:32:55.501Z","updatedAt":"2026-04-08T01:21:15.062Z"},
    }).then(({ body }) => {
      employee = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/contracts+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/contracts').as('postEntityRequest');
    cy.intercept('DELETE', '/api/contracts/*').as('deleteEntityRequest');
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/employees', {
      statusCode: 200,
      body: [employee],
    });

    cy.intercept('GET', '/api/user-profiles', {
      statusCode: 200,
      body: [],
    });

  });
   */

  afterEach(() => {
    if (contract) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/contracts/${contract.id}`,
      }).then(() => {
        contract = undefined;
      });
    }
  });

  /* Disabled due to incompatibility
  afterEach(() => {
    if (employee) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/employees/${employee.id}`,
      }).then(() => {
        employee = undefined;
      });
    }
  });
   */

  it('Contracts menu should load Contracts page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('contract');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Contract').should('exist');
    cy.url().should('match', contractPageUrlPattern);
  });

  describe('Contract page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(contractPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Contract page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/contract/new$'));
        cy.getEntityCreateUpdateHeading('Contract');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', contractPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/contracts',
          body: {
            ...contractSample,
            employee: employee,
          },
        }).then(({ body }) => {
          contract = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/contracts+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/contracts?page=0&size=20>; rel="last",<http://localhost/api/contracts?page=0&size=20>; rel="first"',
              },
              body: [contract],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(contractPageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(contractPageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details Contract page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('contract');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', contractPageUrlPattern);
      });

      it('edit button click should load edit Contract page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Contract');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', contractPageUrlPattern);
      });

      it('edit button click should load edit Contract page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Contract');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', contractPageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of Contract', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('contract').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', contractPageUrlPattern);

        contract = undefined;
      });
    });
  });

  describe('new Contract page', () => {
    beforeEach(() => {
      cy.visit(contractPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Contract');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of Contract', () => {
      cy.get(`[data-cy="reference"]`).type('aïe apparemment diététiste');
      cy.get(`[data-cy="reference"]`).should('have.value', 'aïe apparemment diététiste');

      cy.get(`[data-cy="contractType"]`).select('STAGE');

      cy.get(`[data-cy="status"]`).select('EXPIRED');

      cy.get(`[data-cy="startDate"]`).type('2026-04-08');
      cy.get(`[data-cy="startDate"]`).blur();
      cy.get(`[data-cy="startDate"]`).should('have.value', '2026-04-08');

      cy.get(`[data-cy="endDate"]`).type('2026-04-08');
      cy.get(`[data-cy="endDate"]`).blur();
      cy.get(`[data-cy="endDate"]`).should('have.value', '2026-04-08');

      cy.get(`[data-cy="signedDate"]`).type('2026-04-07');
      cy.get(`[data-cy="signedDate"]`).blur();
      cy.get(`[data-cy="signedDate"]`).should('have.value', '2026-04-07');

      cy.get(`[data-cy="baseSalary"]`).type('28036.32');
      cy.get(`[data-cy="baseSalary"]`).should('have.value', '28036.32');

      cy.get(`[data-cy="workingHoursWeek"]`).type('10');
      cy.get(`[data-cy="workingHoursWeek"]`).should('have.value', '10');

      cy.get(`[data-cy="workingDaysWeek"]`).type('7');
      cy.get(`[data-cy="workingDaysWeek"]`).should('have.value', '7');

      cy.get(`[data-cy="conventionCollective"]`).type('toc-toc ah');
      cy.get(`[data-cy="conventionCollective"]`).should('have.value', 'toc-toc ah');

      cy.get(`[data-cy="trialPeriodMonths"]`).type('3');
      cy.get(`[data-cy="trialPeriodMonths"]`).should('have.value', '3');

      cy.get(`[data-cy="renewalCount"]`).type('24940');
      cy.get(`[data-cy="renewalCount"]`).should('have.value', '24940');

      cy.get(`[data-cy="documentUrl"]`).type('déposer');
      cy.get(`[data-cy="documentUrl"]`).should('have.value', 'déposer');

      cy.get(`[data-cy="notes"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="notes"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="createdAt"]`).type('2026-04-08T00:00');
      cy.get(`[data-cy="createdAt"]`).blur();
      cy.get(`[data-cy="createdAt"]`).should('have.value', '2026-04-08T00:00');

      cy.get(`[data-cy="employee"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        contract = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', contractPageUrlPattern);
    });
  });
});
