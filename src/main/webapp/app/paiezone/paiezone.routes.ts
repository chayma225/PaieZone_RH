import { Routes } from '@angular/router';
import LayoutComponent from './shell/layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'saas-dash',
        loadComponent: () => import('./screens/saas-dashboard/saas-dashboard.component'),
        title: 'PaieZone — SaaS',
      },
      {
        path: 'admin-dash',
        loadComponent: () => import('./screens/admin-dashboard/admin-dashboard.component'),
        title: 'Administration',
      },
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
      {
        path: 'emp-dash',
        loadComponent: () => import('./screens/emp-dashboard/emp-dashboard.component'),
        title: 'Mon espace',
      },
      { path: '', redirectTo: 'rh-dash', pathMatch: 'full' },
    ],
  },
];

export default routes;
