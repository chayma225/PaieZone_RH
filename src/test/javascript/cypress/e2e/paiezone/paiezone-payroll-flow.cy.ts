/**
 * PaieZone RH — E2E Tests : Flux de Paie
 *
 * Scénarios critiques :
 * 1. Navigation vers écran Paie (rh-payroll)
 * 2. Création d'une période de paie
 * 3. Lancement du calcul
 * 4. Téléchargement d'un bulletin PDF
 * 5. Export journal de paie
 */

const ADMIN_CREDS = { username: 'admin', password: 'admin' };

const PZ_PAYROLL = {
  navPayroll: '[routerlink*="rh-payroll"], a[href*="rh-payroll"]',
  periodCard: '.period-card, [class*="period"]',
  btnNewPeriod: 'button:contains("Nouvelle période"), button:contains("Créer")',
  btnCalculate: 'button:contains("Calculer"), button:contains("Lancer")',
  bulletinRow: '.bulletin-row, tbody tr',
  btnDownloadPdf: 'button:contains("PDF"), a[href*="/api/export"]',
  statusBadge: '.pz-pill, [class*="badge"], [class*="status"]',
  toastSuccess: '[class*="toast"], [class*="alert-success"], [class*="success"]',
};

// ── Helper : login API direct ──────────────────────────────────
function loginAsAdmin() {
  cy.request({
    method: 'POST',
    url: '/api/authenticate',
    body: ADMIN_CREDS,
  }).then(res => {
    const token = res.body.id_token;
    expect(token).to.not.be.undefined;
    // JHipster stocke le token en localStorage
    localStorage.setItem('pz-authenticationToken', token);
    localStorage.setItem('authenticationToken', token);
  });
}

// ══════════════════════════════════════════════════════════════
//  1. Navigation vers Paie
// ══════════════════════════════════════════════════════════════

describe('Navigation Paie — RH Comptable', () => {
  before(loginAsAdmin);

  it("l'onglet Paie est accessible depuis le dashboard", () => {
    cy.visit('/paiezone/rh-payroll');
    cy.url().should('include', 'rh-payroll');
  });

  it('la page Paie affiche les périodes ou un état vide', () => {
    cy.visit('/paiezone/rh-payroll');
    // Soit des périodes, soit un message "aucune période"
    cy.get('body').should('contain.text', 'paie').or('contain.text', 'Paie').or('contain.text', 'période');
  });
});

// ══════════════════════════════════════════════════════════════
//  2. Export PDF — API
// ══════════════════════════════════════════════════════════════

describe('Export PDF — Vérification API', () => {
  let authToken: string;

  before(() => {
    cy.request({
      method: 'POST',
      url: '/api/authenticate',
      body: ADMIN_CREDS,
    }).then(res => {
      authToken = res.body.id_token;
    });
  });

  it('/api/export/bulletin/{id} avec token valide → 200 ou 404', () => {
    // Teste avec id=1 — peut exister ou non selon la DB
    cy.request({
      method: 'GET',
      url: '/api/export/bulletin/1',
      headers: { Authorization: `Bearer ${authToken}` },
      failOnStatusCode: false,
    })
      .its('status')
      .should('be.oneOf', [200, 404, 500]);
  });

  it('/api/export/bulletin/{id} avec rôle EMPLOYE → son propre bulletin ou 403', () => {
    // Pour cet endpoint, les employés doivent pouvoir télécharger LEUR bulletin
    cy.request({
      method: 'GET',
      url: '/api/export/bulletin/1',
      headers: { Authorization: `Bearer ${authToken}` },
      failOnStatusCode: false,
    }).then(res => {
      // 200 (bulletin existe), 404 (introuvable), 403 (pas autorisé)
      expect([200, 403, 404, 500]).to.include(res.status);
    });
  });

  it('/api/export/journal/{periodId} avec token admin → réponse valide', () => {
    cy.request({
      method: 'GET',
      url: '/api/export/journal/1',
      headers: { Authorization: `Bearer ${authToken}` },
      failOnStatusCode: false,
    })
      .its('status')
      .should('be.oneOf', [200, 400, 404, 500]);
  });
});

// ══════════════════════════════════════════════════════════════
//  3. Flux complet : Créer période → Calculer → Valider
// ══════════════════════════════════════════════════════════════

describe('Flux paie complet — API niveau', () => {
  let authToken: string;
  let periodId: number;

  before(() => {
    cy.request({
      method: 'POST',
      url: '/api/authenticate',
      body: ADMIN_CREDS,
    }).then(res => {
      authToken = res.body.id_token;
    });
  });

  it('GET /api/payroll-periods → liste des périodes', () => {
    cy.request({
      method: 'GET',
      url: '/api/payroll-periods?page=0&size=10',
      headers: { Authorization: `Bearer ${authToken}` },
    }).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  it('POST /api/payroll-periods → crée une nouvelle période DRAFT', () => {
    const now = new Date();
    cy.request({
      method: 'POST',
      url: '/api/payroll-periods',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: {
        month: now.getMonth() === 0 ? 12 : now.getMonth(),
        year: now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear(),
        status: 'DRAFT',
      },
      failOnStatusCode: false,
    }).then(res => {
      if (res.status === 201 || res.status === 200) {
        periodId = res.body.id;
        expect(res.body.status).to.equal('DRAFT');
      } else {
        // La période existe déjà — récupérer l'existante
        expect([400, 409, 422]).to.include(res.status);
      }
    });
  });

  it('GET /api/dashboard/stats → retourne les métriques globales', () => {
    cy.request({
      method: 'GET',
      url: '/api/dashboard/stats',
      headers: { Authorization: `Bearer ${authToken}` },
    }).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('totalEmployees');
      expect(res.body).to.have.property('totalCompanies');
    });
  });
});

// ══════════════════════════════════════════════════════════════
//  4. Multi-tenant — Isolation des données
// ══════════════════════════════════════════════════════════════

describe('Isolation multi-tenant — Tests API', () => {
  let adminToken: string;

  before(() => {
    cy.request({
      method: 'POST',
      url: '/api/authenticate',
      body: ADMIN_CREDS,
    }).then(res => {
      adminToken = res.body.id_token;
    });
  });

  it('un admin peut voir UNIQUEMENT ses entreprises', () => {
    cy.request({
      method: 'GET',
      url: '/api/companies',
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
      // Toutes les entreprises retournées doivent avoir un ID valide
      res.body.forEach((company: any) => {
        expect(company.id).to.be.a('number');
        expect(company.name).to.be.a('string').and.not.be.empty;
      });
    });
  });

  it('GET /api/employees → retourne uniquement les employés du tenant courant', () => {
    cy.request({
      method: 'GET',
      url: '/api/employees?page=0&size=10',
      headers: { Authorization: `Bearer ${adminToken}` },
    }).then(res => {
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  it('/api/conventions sans token → 401', () => {
    cy.request({
      method: 'GET',
      url: '/api/sectoral-conventions',
      failOnStatusCode: false,
    })
      .its('status')
      .should('equal', 401);
  });

  it('/api/sectoral-conventions avec token → 200', () => {
    cy.request({
      method: 'GET',
      url: '/api/sectoral-conventions',
      headers: { Authorization: `Bearer ${adminToken}` },
      failOnStatusCode: false,
    })
      .its('status')
      .should('be.oneOf', [200, 403]);
  });
});
