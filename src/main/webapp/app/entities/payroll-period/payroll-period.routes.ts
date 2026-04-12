import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import PayrollPeriodResolve from './route/payroll-period-routing-resolve.service';

const payrollPeriodRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/payroll-period').then(m => m.PayrollPeriod),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/payroll-period-detail').then(m => m.PayrollPeriodDetail),
    resolve: {
      payrollPeriod: PayrollPeriodResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/payroll-period-update').then(m => m.PayrollPeriodUpdate),
    resolve: {
      payrollPeriod: PayrollPeriodResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/payroll-period-update').then(m => m.PayrollPeriodUpdate),
    resolve: {
      payrollPeriod: PayrollPeriodResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default payrollPeriodRoute;
