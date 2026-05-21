import { Routes } from '@angular/router';

import LayoutComponent from './shell/layout/layout.component';
import AuthLayoutComponent from './shell/auth-layout/auth-layout.component';

// Routes du module PaieZone.
// Monter sous /paiezone dans app.routes.ts :
//   { path: 'paiezone', loadChildren: () => import('./paiezone/paiezone.routes') }

const routes: Routes = [
  // ─── PUBLIC (sans authentification) ─────────────────────────
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./screens/welcome/welcome.component'), title: 'PaieZone RH' },
      { path: 'login', loadComponent: () => import('./screens/login/login.component'), title: 'Connexion' },
      { path: 'signup', loadComponent: () => import('./screens/signup/signup.component'), title: 'Créer un compte' },
      { path: '2fa', loadComponent: () => import('./screens/twofa/twofa.component'), title: 'Vérification 2FA' },
      { path: '2fa-setup', loadComponent: () => import('./screens/twofa-setup/twofa-setup.component'), title: 'Configurer la 2FA' },
    ],
  },

  // ─── APP (authentifiée) ─────────────────────────────────────
  // En prod : ajouter canActivate: [UserRouteAccessService] avec authorities.
  {
    path: '',
    component: LayoutComponent,
    children: [
      // SUPER ADMIN
      { path: 'saas-dash', loadComponent: () => import('./screens/saas-dashboard/saas-dashboard.component') },
      // TODO: tenants, regulatory

      // ADMIN entreprise
      { path: 'admin-dash', loadComponent: () => import('./screens/admin-dashboard/admin-dashboard.component') },
      // TODO: admin-company, admin-users, admin-audit

      // RH / Comptable (et Admin qui partage les écrans opérationnels)
      { path: 'rh-dash', loadComponent: () => import('./screens/rh-dashboard/rh-dashboard.component') },
      { path: 'rh-employees', loadComponent: () => import('./screens/rh-employees/rh-employees.component') },
      // TODO: rh-structure, rh-payroll, rh-finances, rh-leaves

      // EMPLOYÉ
      { path: 'emp-dash', loadComponent: () => import('./screens/emp-dashboard/emp-dashboard.component') },
      // TODO: emp-leaves, emp-requests
    ],
  },
];

export default routes;
