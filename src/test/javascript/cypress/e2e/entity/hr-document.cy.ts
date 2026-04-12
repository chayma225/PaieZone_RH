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

describe('HrDocument e2e test', () => {
  const hrDocumentPageUrl = '/hr-document';
  const hrDocumentPageUrlPattern = new RegExp('/hr-document(\\?.*)?$');
  let username: string;
  let password: string;
  // const hrDocumentSample = {"documentType":"PAYSLIP","title":"chez ouah infiniment","fileUrl":"prestataire de services","uploadedAt":"2026-04-08T04:37:35.535Z","active":false};

  let hrDocument;
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
      body: {"matricule":"d'après rose survivr","firstName":"Tonnin","lastName":"Guillaume","firstNameAr":"clientèle maigre patientèle","lastNameAr":"que quand à peu près","birthDate":"2026-04-08","birthPlace":"toc innombrable avant que","gender":"MALE","maritalStatus":"MARRIED","numberOfChildren":7,"chefDeFamille":true,"nationalId":"pauvre","passportNumber":"disposer rectangulai","nationality":"snob tsoin-tsoin au-delà","address":"vis-à-vie de","city":"Vénissieux","personalEmail":"loufoque réchauffer","professionalEmail":"biathlète","phoneNumber":"lors de","cnssNumber":"naguère","category":"DIRECTOR","photoUrl":"ronron","hireDate":"2026-04-08","trialEndDate":"2026-04-08","active":true,"notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","createdAt":"2026-04-08T01:50:39.050Z","updatedAt":"2026-04-08T03:32:16.335Z"},
    }).then(({ body }) => {
      employee = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/hr-documents+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/hr-documents').as('postEntityRequest');
    cy.intercept('DELETE', '/api/hr-documents/*').as('deleteEntityRequest');
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
    if (hrDocument) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/hr-documents/${hrDocument.id}`,
      }).then(() => {
        hrDocument = undefined;
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

  it('HrDocuments menu should load HrDocuments page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('hr-document');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('HrDocument').should('exist');
    cy.url().should('match', hrDocumentPageUrlPattern);
  });

  describe('HrDocument page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(hrDocumentPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create HrDocument page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/hr-document/new$'));
        cy.getEntityCreateUpdateHeading('HrDocument');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', hrDocumentPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/hr-documents',
          body: {
            ...hrDocumentSample,
            employee: employee,
          },
        }).then(({ body }) => {
          hrDocument = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/hr-documents+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/hr-documents?page=0&size=20>; rel="last",<http://localhost/api/hr-documents?page=0&size=20>; rel="first"',
              },
              body: [hrDocument],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(hrDocumentPageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(hrDocumentPageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details HrDocument page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('hrDocument');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', hrDocumentPageUrlPattern);
      });

      it('edit button click should load edit HrDocument page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('HrDocument');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', hrDocumentPageUrlPattern);
      });

      it('edit button click should load edit HrDocument page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('HrDocument');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', hrDocumentPageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of HrDocument', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('hrDocument').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', hrDocumentPageUrlPattern);

        hrDocument = undefined;
      });
    });
  });

  describe('new HrDocument page', () => {
    beforeEach(() => {
      cy.visit(hrDocumentPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('HrDocument');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of HrDocument', () => {
      cy.get(`[data-cy="documentType"]`).select('CIN_COPY');

      cy.get(`[data-cy="title"]`).type('ouin membre titulaire du fait que');
      cy.get(`[data-cy="title"]`).should('have.value', 'ouin membre titulaire du fait que');

      cy.get(`[data-cy="description"]`).type('de sorte que pin-pon');
      cy.get(`[data-cy="description"]`).should('have.value', 'de sorte que pin-pon');

      cy.get(`[data-cy="fileUrl"]`).type('près concernant camarade');
      cy.get(`[data-cy="fileUrl"]`).should('have.value', 'près concernant camarade');

      cy.get(`[data-cy="fileSize"]`).type('30644');
      cy.get(`[data-cy="fileSize"]`).should('have.value', '30644');

      cy.get(`[data-cy="mimeType"]`).type('en face de');
      cy.get(`[data-cy="mimeType"]`).should('have.value', 'en face de');

      cy.get(`[data-cy="uploadedAt"]`).type('2026-04-08T10:28');
      cy.get(`[data-cy="uploadedAt"]`).blur();
      cy.get(`[data-cy="uploadedAt"]`).should('have.value', '2026-04-08T10:28');

      cy.get(`[data-cy="expiryDate"]`).type('2026-04-08');
      cy.get(`[data-cy="expiryDate"]`).blur();
      cy.get(`[data-cy="expiryDate"]`).should('have.value', '2026-04-08');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(`[data-cy="employee"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        hrDocument = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', hrDocumentPageUrlPattern);
    });
  });
});
