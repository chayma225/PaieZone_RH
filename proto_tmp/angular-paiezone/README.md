# PaieZone RH — Frontend Angular

Code Angular **21+ standalone components avec signals** correspondant au prototype HTML.

## Intégration dans votre projet JHipster

### 1. Copier le dossier
Copiez tout le contenu de ce dossier dans `src/main/webapp/app/paiezone/` de votre projet JHipster.

```bash
cp -r angular-paiezone src/main/webapp/app/paiezone
```

### 2. Importer le thème global
Dans `src/main/webapp/content/scss/global.scss`, ajoutez en haut :

```scss
@import '../../app/paiezone/theme';
```

Cela injecte les variables CSS du design system (couleurs, typographies, ombres…).

### 3. Ajouter les polices Google
Dans `src/main/webapp/index.html`, dans le `<head>` :

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### 4. Brancher les routes
Dans `src/main/webapp/app/app.routes.ts` ajoutez **avant** le `loadChildren` des entities :

```typescript
{
  path: 'paiezone',
  loadChildren: () => import('./paiezone/paiezone.routes'),
  canActivate: [UserRouteAccessService],
  data: {
    authorities: [Authority.USER], // ou laissez vide pour tester
  },
}
```

Puis ouvrez `http://localhost:4200/paiezone`.

## Architecture

```
paiezone/
├── theme.scss                          Variables CSS globales (couleurs, ombres, etc.)
├── paiezone.routes.ts                  Routes des 13 écrans
├── core/
│   ├── role.service.ts                 État du rôle actif (signal)
│   ├── data.service.ts                 Données mockées (Companies, Employees, etc.)
│   ├── types.ts                        Interfaces TypeScript
│   └── icon/icon.component.ts          <pz-icon name="..."> — bibliothèque SVG
├── shell/
│   ├── layout/                         Conteneur principal
│   └── top-nav/                        Navigation horizontale + sélecteur de rôle
├── screens/
│   ├── saas-dashboard/                 Super Admin — vue SaaS
│   ├── admin-dashboard/                Admin entreprise
│   ├── rh-dashboard/                   RH / Comptable
│   ├── rh-employees/                   Liste + drawer + upload de documents
│   └── emp-dashboard/                  Employé self-service
└── components/
    └── chatbot/                        Assistant RAG flottant
```

## Patterns Angular utilisés

- **Standalone components** uniquement (`standalone: true` implicite en Angular 21)
- **Signals** (`signal()`, `computed()`, `input()`, `output()`) pour la réactivité
- **Nouveau control flow** `@if` / `@for` / `@switch` (pas de `*ngIf`)
- **inject()** plutôt que constructor DI
- **Default exports** pour les composants (convention JHipster)
- Sélecteur préfixé `pz-` (convention de votre projet)

## Comment ajouter les écrans manquants

Les écrans non livrés (Tenants, Regulatory, Admin Company, Admin Users, Admin Audit, RH Structure, RH Payroll, RH Finances, RH Leaves, Emp Leaves, Emp Requests) suivent **exactement le même pattern** que les écrans fournis :

## Écrans livrés

### Publics (sans authentification) — `AuthLayoutComponent`
- **`welcome`** — Landing page (hero + features + tarifs + CTA)
- **`login`** — Connexion (email + password + toggle "rester connecté" + lien vers signup)
- **`signup`** — Inscription multi-étapes :
  1. Choix de la formule (Starter / PME / Business / Enterprise)
  2. Informations entreprise (raison sociale, matricule fiscal, CNSS, ville…)
  3. Compte administrateur (nom, email, mot de passe avec indicateur de force)
  4. Récapitulatif + activation 2FA + acceptation CGU
- **`twofa`** — Vérification code 6 chiffres (auto-soumis, paste, app/SMS)
- **`twofa-setup`** — Configuration initiale (QR code + secret + copier)

### App (authentifiée) — `LayoutComponent` avec top-nav
- 4 dashboards (super, admin, rh, emp) + employés avec upload

1. Créer le dossier `screens/mon-ecran/`
2. Créer `mon-ecran.component.ts` (inline template ou .html séparé)
3. Injecter `DataService` et `RoleService` si besoin
4. Ajouter la route dans `paiezone.routes.ts`
5. Ajouter l'onglet dans `shell/top-nav/top-nav.component.ts` (config `ROLE_TABS`)

Référez-vous à `screens/rh-employees/` qui contient le pattern le plus complet (tableau, filtres, drawer, upload).

## Différences avec votre projet JHipster

- Pas d'utilisation de **ng-bootstrap** dans ce code (les modales/dropdowns sont fait à la main pour matcher le design). Vous pouvez les remplacer par `NgbModal` / `NgbDropdown` si vous préférez.
- Pas de **@ngx-translate** dans le prototype (français en dur). Pour traduire, passez chaque string en `{{ 'paiezone.xxx' | translate }}` et ajoutez les clés dans `i18n/fr/paiezone.json`.
- Les données viennent de `DataService` (mock). À remplacer par vos services HTTP JHipster (`EmployeeService`, `PayrollService`, etc.) qui appellent vos endpoints REST.

## Connecter au backend

Remplacez `DataService` par les services générés JHipster :

```typescript
// avant (mock)
this.employees = this.data.employees;

// après (HTTP)
inject(EmployeeService).query().subscribe(res => this.employees.set(res.body));
```
