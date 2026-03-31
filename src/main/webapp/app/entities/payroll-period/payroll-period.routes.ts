import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import PayrollPeriodResolve from './route/payroll-period-routing-resolve.service';

const payrollPeriodRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/payroll-period.component').then(m => m.PayrollPeriodComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/payroll-period-detail.component').then(m => m.PayrollPeriodDetailComponent),
    resolve: {
      payrollPeriod: PayrollPeriodResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/payroll-period-update.component').then(m => m.PayrollPeriodUpdateComponent),
    resolve: {
      payrollPeriod: PayrollPeriodResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/payroll-period-update.component').then(m => m.PayrollPeriodUpdateComponent),
    resolve: {
      payrollPeriod: PayrollPeriodResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default payrollPeriodRoute;
