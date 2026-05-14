import { Routes } from '@angular/router';

import LayoutComponent from './shell/layout/layout.component';

// Routes pour le module PaieZone. À monter sous /paiezone dans app.routes.ts :
//
//   { path: 'paiezone', loadChildren: () => import('./paiezone/paiezone.routes') }
//
// Les écrans non livrés (TODO) suivent EXACTEMENT le même pattern que ceux
// fournis. Pour les ajouter, créez le composant, importez-le ici et ajoutez
// l'onglet correspondant dans `core/role.service.ts` (ROLES[r].tabs).

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      // SUPER ADMIN
      {
        path: 'saas-dash',
        loadComponent: () => import('./screens/saas-dashboard/saas-dashboard.component'),
        title: 'PaieZone — SaaS',
      },
      // path: 'tenants'      — TODO: ScreenTenants (cf. PaieZone RH.html / screens-saas.jsx)
      // path: 'regulatory'   — TODO: ScreenRegulatory

      // ADMIN entreprise
      {
        path: 'admin-dash',
        loadComponent: () => import('./screens/admin-dashboard/admin-dashboard.component'),
        title: 'Administration',
      },
      // path: 'admin-company'  — TODO (form modifiable, cf. ScreenCompany dans screens-admin.jsx)
      // path: 'admin-users'    — TODO (gestion accès)
      // path: 'admin-audit'    — TODO (audit filtré tenant)

      // RH / Comptable
      {
        path: 'rh-dash',
        loadComponent: () => import('./screens/rh-dashboard/rh-dashboard.component'),
        title: 'PaieZone — RH',
      },
      {
        path: 'rh-employees',
        loadComponent: () => import('./screens/rh-employees/rh-employees.component'),
        title: 'Employés',
      },
      // path: 'rh-structure'   — TODO
      // path: 'rh-payroll'     — TODO (workflow paie)
      // path: 'rh-finances'    — TODO (avances + primes)
      // path: 'rh-leaves'      — TODO (validation congés)

      // EMPLOYÉ
      {
        path: 'emp-dash',
        loadComponent: () => import('./screens/emp-dashboard/emp-dashboard.component'),
        title: 'Mon espace',
      },
      // path: 'emp-leaves'     — TODO
      // path: 'emp-requests'   — TODO

      { path: '', redirectTo: 'rh-dash', pathMatch: 'full' },
    ],
  },
];

export default routes;
