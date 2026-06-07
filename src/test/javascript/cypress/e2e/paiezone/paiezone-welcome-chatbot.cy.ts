/**
 * PaieZone RH — E2E Tests : Welcome Page + Chatbot
 *
 * Scénarios :
 * 1. Welcome page — sections visibles, navigation CTA
 * 2. Login → Redirection vers dashboard selon rôle
 * 3. Dashboard SaaS → KPI cards chargées
 * 4. Chatbot — ouverture, envoi message, protection cross-tenant
 */

// ── Sélecteurs PaieZone ────────────────────────────────────────
const PZ = {
  // Welcome
  welcomePage: '.wl-page',
  heroH1: '.hero h1',
  heroCTA: '.hero .btn.primary',
  featuresSection: '#features',
  plansSection: '#plans',

  // Login PaieZone
  pzLoginLink: 'a[href*="paiezone/login"], a[routerlink*="login"]',
  pzLoginForm: '.login-page, pz-login, [class*="login"]',
  loginUsername: 'input[name="username"], input[type="text"]',
  loginPassword: 'input[name="password"], input[type="password"]',
  loginSubmit: 'button[type="submit"]',

  // Layout PaieZone
  pzTopNav: '.pz-topnav, pz-top-nav',
  pzNavTab: '.pz-nav-tab',

  // Dashboard SaaS
  saasKpiGrid: '.stat-grid',
  saasCompanyTable: 'table tbody',

  // Chatbot
  chatFab: '.pz-chatbot__toggle',
  chatPanel: '.pz-chatbot__panel',
  chatPanelOpen: '.pz-chatbot__panel--open',
  chatInput: '.pz-chatbot__textarea',
  chatSendBtn: '.pz-chatbot__send-btn',
  chatMessages: '.pz-chatbot__messages',
  chatBubbleBot: '.pz-chatbot__bubble--bot',
  chatBubbleUser: '.pz-chatbot__bubble--user',
  chatStatus: '.pz-chatbot__status',
};

// ══════════════════════════════════════════════════════════════
//  1. Welcome Page
// ══════════════════════════════════════════════════════════════

describe('Welcome Page — PaieZone RH', () => {
  beforeEach(() => {
    cy.visit('/paiezone/welcome');
  });

  it('affiche le hero avec le titre principal', () => {
    cy.get(PZ.welcomePage).should('be.visible');
    cy.get(PZ.heroH1).should('be.visible').and('not.be.empty');
  });

  it('affiche le CTA "Essayer 14 jours"', () => {
    cy.get(PZ.heroCTA).first().should('be.visible').and('contain.text', 'jours');
  });

  it('la section Features est accessible en scrollant', () => {
    cy.get(PZ.featuresSection).scrollIntoView().should('be.visible');
  });

  it('la section Tarifs est accessible en scrollant', () => {
    cy.get(PZ.plansSection).scrollIntoView().should('be.visible');
  });

  it('le lien "Se connecter" navigue vers la page login PaieZone', () => {
    cy.get(PZ.pzLoginLink).first().click();
    cy.url().should('include', 'login');
  });

  it('les bento cards ont un effet de survol visible', () => {
    cy.get('.bento-card').first().trigger('mouseover');
    cy.get('.bento-card').first().should('have.css', 'cursor', 'auto');
  });
});

// ══════════════════════════════════════════════════════════════
//  2. Login → Redirection dashboard
// ══════════════════════════════════════════════════════════════

describe("Login PaieZone — Flux d'authentification", () => {
  it('connexion avec admin valide → redirection dashboard', () => {
    cy.intercept('POST', '/api/authenticate').as('auth');
    cy.visit('/paiezone/login');
    cy.get(PZ.loginUsername).type('admin');
    cy.get(PZ.loginPassword).type('admin');
    cy.get(PZ.loginSubmit).click();
    cy.wait('@auth').its('response.statusCode').should('equal', 200);
    cy.url().should('match', /\/(saas-dash|admin-dash|rh-dash|emp-dash)/);
  });

  it('connexion échouée → reste sur la page login', () => {
    cy.intercept('POST', '/api/authenticate').as('auth');
    cy.visit('/paiezone/login');
    cy.get(PZ.loginUsername).type('admin');
    cy.get(PZ.loginPassword).type('mauvais-motdepasse');
    cy.get(PZ.loginSubmit).click();
    cy.wait('@auth').its('response.statusCode').should('be.oneOf', [400, 401]);
    cy.url().should('include', 'login');
  });

  it('accès direct /paiezone/saas-dash non authentifié → redirect login', () => {
    cy.clearLocalStorage();
    cy.visit('/paiezone/saas-dash');
    cy.url().should('match', /login|welcome/);
  });
});

// ══════════════════════════════════════════════════════════════
//  3. Dashboard Super Admin
// ══════════════════════════════════════════════════════════════

describe('Dashboard SaaS — Super Admin', () => {
  before(() => {
    // Authentification une seule fois pour la suite
    cy.intercept('POST', '/api/authenticate').as('auth');
    cy.visit('/paiezone/login');
    cy.get(PZ.loginUsername).type('admin');
    cy.get(PZ.loginPassword).type('admin');
    cy.get(PZ.loginSubmit).click();
    cy.wait('@auth');
  });

  it('la barre de navigation PaieZone est affichée', () => {
    cy.visit('/paiezone/saas-dash');
    cy.get(PZ.pzTopNav).should('be.visible');
  });

  it('les onglets Super Admin sont affichés', () => {
    cy.visit('/paiezone/saas-dash');
    cy.get(PZ.pzNavTab).should('have.length.gte', 3);
  });

  it('les KPI cards sont rendues', () => {
    cy.intercept('GET', '/api/dashboard/stats').as('stats');
    cy.visit('/paiezone/saas-dash');
    cy.wait('@stats');
    cy.get(PZ.saasKpiGrid).should('be.visible');
    cy.get(PZ.saasKpiGrid + ' .pz-card').should('have.length.gte', 2);
  });

  it("l'API /api/companies est appelée au chargement", () => {
    cy.intercept('GET', '/api/companies*').as('companies');
    cy.visit('/paiezone/saas-dash');
    cy.wait('@companies').its('response.statusCode').should('equal', 200);
  });
});

// ══════════════════════════════════════════════════════════════
//  4. Chatbot — PaieBot
// ══════════════════════════════════════════════════════════════

describe('PaieBot — Widget chatbot', () => {
  before(() => {
    cy.intercept('POST', '/api/authenticate').as('auth');
    cy.visit('/paiezone/login');
    cy.get(PZ.loginUsername).type('admin');
    cy.get(PZ.loginPassword).type('admin');
    cy.get(PZ.loginSubmit).click();
    cy.wait('@auth');
  });

  beforeEach(() => {
    cy.visit('/paiezone/saas-dash');
  });

  it('le FAB chatbot est visible sur le dashboard', () => {
    cy.get(PZ.chatFab).should('be.visible');
  });

  it("clic sur FAB → panneau chatbot s'ouvre", () => {
    cy.get(PZ.chatFab).click();
    cy.get(PZ.chatPanel).should('have.class', 'pz-chatbot__panel--open');
  });

  it("le statut d'Ollama est affiché dans le header", () => {
    cy.get(PZ.chatFab).click();
    cy.get(PZ.chatStatus).should('be.visible');
    cy.get(PZ.chatStatus)
      .invoke('text')
      .then(text => {
        // Soit "phi3 · En ligne" soit "Ollama hors ligne"
        expect(text).to.match(/En ligne|hors ligne/i);
      });
  });

  it("message de bienvenue affiché à l'ouverture", () => {
    cy.get(PZ.chatFab).click();
    cy.get(PZ.chatBubbleBot).should('have.length.gte', 1);
    cy.get(PZ.chatBubbleBot).first().should('contain.text', 'Bonjour');
  });

  it("envoi d'un message → bulle utilisateur apparaît", () => {
    cy.intercept('POST', '/api/chatbot/sessions').as('createSession');
    cy.intercept('POST', '/api/chatbot/sessions/*/messages').as('sendMessage');

    cy.get(PZ.chatFab).click();
    cy.get(PZ.chatInput).type("Qu'est-ce que le CNSS ?");
    cy.get(PZ.chatSendBtn).click();

    // La bulle utilisateur doit apparaître immédiatement
    cy.get(PZ.chatBubbleUser).should('have.length.gte', 1);
    cy.get(PZ.chatBubbleUser).last().should('contain.text', 'CNSS');
  });

  it("envoi d'un message → réponse bot reçue (ou indicateur chargement)", () => {
    cy.intercept('POST', '/api/chatbot/sessions/*/messages').as('sendMessage');

    cy.get(PZ.chatFab).click();
    cy.get(PZ.chatInput).type('Calcul CNSS 2500 TND');
    cy.get(PZ.chatSendBtn).click();

    // Soit une réponse bot, soit le typing indicator
    cy.get(PZ.chatMessages).within(() => {
      cy.get('.pz-chatbot__typing, ' + PZ.chatBubbleBot).should('exist');
    });
  });

  it('deuxième clic sur FAB → ferme le panneau', () => {
    cy.get(PZ.chatFab).click(); // ouvre
    cy.get(PZ.chatPanel).should('have.class', 'pz-chatbot__panel--open');
    cy.get(PZ.chatFab).click(); // ferme
    cy.get(PZ.chatPanel).should('not.have.class', 'pz-chatbot__panel--open');
  });

  it('bouton envoyer désactivé quand input vide', () => {
    cy.get(PZ.chatFab).click();
    cy.get(PZ.chatInput).clear();
    cy.get(PZ.chatSendBtn).should('be.disabled');
  });

  it('bouton envoyer activé après saisie de texte', () => {
    cy.get(PZ.chatFab).click();
    cy.get(PZ.chatInput).type('test');
    cy.get(PZ.chatSendBtn).should('not.be.disabled');
  });
});

// ══════════════════════════════════════════════════════════════
//  5. Sécurité API — vérifications réseau
// ══════════════════════════════════════════════════════════════

describe('Sécurité API PaieZone', () => {
  it('/api/companies sans token → 401', () => {
    cy.request({
      method: 'GET',
      url: '/api/companies',
      failOnStatusCode: false,
    })
      .its('status')
      .should('equal', 401);
  });

  it('/api/export/bulletin/1 sans token → 401', () => {
    cy.request({
      method: 'GET',
      url: '/api/export/bulletin/1',
      failOnStatusCode: false,
    })
      .its('status')
      .should('equal', 401);
  });

  it('/api/dashboard/stats sans token → 401', () => {
    cy.request({
      method: 'GET',
      url: '/api/dashboard/stats',
      failOnStatusCode: false,
    })
      .its('status')
      .should('equal', 401);
  });

  it('/api/chatbot/health → accessible sans auth (health check)', () => {
    cy.request({
      method: 'GET',
      url: '/api/chatbot/health',
      failOnStatusCode: false,
    })
      .its('status')
      .should('be.oneOf', [200, 503]); // ok ou ollama down
  });
});
