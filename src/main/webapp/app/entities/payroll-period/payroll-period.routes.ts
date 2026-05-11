
import { Routes } from '@angular/router';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import resolve from './route/payroll-period-routing-resolve.service';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/payroll-period').then(m => m.PayrollPeriod),
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./update/payroll-period-update').then(m => m.PayrollPeriodUpdate),
    resolve: { payrollPeriod: resolve },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () =>
      import('./detail/payroll-period-detail').then(m => m.PayrollPeriodDetail),
    resolve: { payrollPeriod: resolve },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./update/payroll-period-update').then(m => m.PayrollPeriodUpdate),
    resolve: { payrollPeriod: resolve },
    canActivate: [UserRouteAccessService],
  },
];
export default routes;


