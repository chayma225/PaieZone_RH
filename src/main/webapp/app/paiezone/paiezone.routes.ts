import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { CanActivateFn, Router } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { AccountService } from 'app/core/auth/account.service';
import LayoutComponent from './shell/layout/layout.component';
import AuthLayoutComponent from './shell/auth-layout/auth-layout.component';

const SUPER_ADMIN = ['ROLE_SUPER_ADMIN'];
const ADMIN_UP = ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'];
const RH_UP = ['ROLE_RH_COMPTABLE', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'];
const ALL_ROLES = ['ROLE_EMPLOYE', 'ROLE_RH_COMPTABLE', 'ROLE_ADMIN', 'ROLE_SUPER_ADMIN'];

const roleRedirect: CanActivateFn = () => {
  const account = inject(AccountService);
  const router = inject(Router);
  return account.identity().pipe(
    map(a => {
      const auths = a?.authorities ?? [];
      if (auths.includes('ROLE_SUPER_ADMIN')) return router.createUrlTree(['/paiezone/saas-dash']);
      if (auths.includes('ROLE_ADMIN')) return router.createUrlTree(['/paiezone/admin-dash']);
      if (auths.includes('ROLE_EMPLOYE')) return router.createUrlTree(['/paiezone/emp-dash']);
      return router.createUrlTree(['/paiezone/rh-dash']);
    }),
  );
};

const routes: Routes = [
  // ── Pages publiques (auth-layout) ──────────────────────────────────────────
  {
    path: 'welcome',
    loadComponent: () => import('./screens/welcome/welcome.component'),
    title: 'PaieZone RH — Paie tunisienne automatisée',
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./screens/login/login.component'),
        title: 'Connexion — PaieZone',
      },
      {
        path: '2fa',
        loadComponent: () => import('./screens/twofa/twofa.component'),
        title: 'Vérification 2FA — PaieZone',
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./screens/forgot-password/forgot-password.component'),
        title: 'Mot de passe oublié — PaieZone',
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./screens/reset-password/reset-password.component'),
        title: 'Réinitialisation — PaieZone',
      },
      {
        path: 'register',
        loadComponent: () => import('./screens/register/register.component'),
        title: 'Inscription — PaieZone',
      },
    ],
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [UserRouteAccessService],
    children: [
      // ── SaaS (Super Admin) ────────────────────────────────────────────────
      {
        path: 'saas-dash',
        loadComponent: () => import('./screens/saas-dashboard/saas-dashboard.component'),
        title: 'PaieZone — SaaS',
        data: { authorities: SUPER_ADMIN },
      },
      {
        path: 'tenants',
        loadComponent: () => import('./screens/tenants/tenants.component'),
        title: 'Entreprises clientes',
        data: { authorities: SUPER_ADMIN },
      },
      {
        path: 'regulatory',
        loadComponent: () => import('./screens/regulatory/regulatory.component'),
        title: 'Réglementaire',
        data: { authorities: SUPER_ADMIN },
      },

      // ── Admin entreprise ──────────────────────────────────────────────────
      {
        path: 'admin-dash',
        loadComponent: () => import('./screens/admin-dashboard/admin-dashboard.component'),
        title: 'Administration',
        data: { authorities: ADMIN_UP },
      },
      {
        path: 'admin-company',
        loadComponent: () => import('./screens/admin-company/admin-company.component'),
        title: 'Mon entreprise',
        data: { authorities: ADMIN_UP },
      },
      {
        path: 'admin-users',
        loadComponent: () => import('./screens/admin-users/admin-users.component'),
        title: 'Utilisateurs',
        data: { authorities: ADMIN_UP },
      },
      {
        path: 'admin-audit',
        loadComponent: () => import('./screens/admin-audit/admin-audit.component'),
        title: 'Audit',
        data: { authorities: ADMIN_UP },
      },

      // ── RH / Comptable ────────────────────────────────────────────────────
      {
        path: 'rh-dash',
        loadComponent: () => import('./screens/rh-dashboard/rh-dashboard.component'),
        title: 'PaieZone — RH',
        data: { authorities: RH_UP },
      },
      {
        path: 'rh-employees',
        loadComponent: () => import('./screens/rh-employees/rh-employees.component'),
        title: 'Employés',
        data: { authorities: RH_UP },
      },
      {
        path: 'rh-structure',
        loadComponent: () => import('./screens/rh-structure/rh-structure.component'),
        title: 'Structure',
        data: { authorities: RH_UP },
      },
      {
        path: 'rh-payroll',
        loadComponent: () => import('./screens/rh-payroll/rh-payroll.component'),
        title: 'Paie',
        data: { authorities: RH_UP },
      },
      {
        path: 'rh-finances',
        loadComponent: () => import('./screens/rh-finances/rh-finances.component'),
        title: 'Finances RH',
        data: { authorities: RH_UP },
      },
      {
        path: 'rh-accounting',
        loadComponent: () => import('./screens/rh-accounting/rh-accounting.component'),
        title: 'Comptabilité',
        data: { authorities: RH_UP },
      },
      {
        path: 'rh-leaves',
        loadComponent: () => import('./screens/rh-leaves/rh-leaves.component'),
        title: 'Congés',
        data: { authorities: RH_UP },
      },

      // ── Employé ───────────────────────────────────────────────────────────
      {
        path: 'emp-dash',
        loadComponent: () => import('./screens/emp-dashboard/emp-dashboard.component'),
        title: 'Mon espace',
        data: { authorities: ALL_ROLES },
      },
      {
        path: 'emp-leaves',
        loadComponent: () => import('./screens/emp-leaves/emp-leaves.component'),
        title: 'Mes congés',
        data: { authorities: ALL_ROLES },
      },
      {
        path: 'emp-requests',
        loadComponent: () => import('./screens/emp-requests/emp-requests.component'),
        title: 'Mes demandes',
        data: { authorities: ALL_ROLES },
      },

      // ── Mon compte ───────────────────────────────────────────────────────
      {
        path: '2fa-setup',
        loadComponent: () => import('./screens/twofa-setup/twofa-setup.component'),
        title: 'Sécurité du compte — PaieZone',
        data: { authorities: ALL_ROLES },
      },

      // ── Redirect selon rôle ───────────────────────────────────────────────
      { path: '', canActivate: [roleRedirect], children: [] },
    ],
  },
];

export default routes;
