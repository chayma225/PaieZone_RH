import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import EmployeeHistoryResolve from './route/employee-history-routing-resolve.service';

const employeeHistoryRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/employee-history').then(m => m.EmployeeHistory),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/employee-history-detail').then(m => m.EmployeeHistoryDetail),
    resolve: {
      employeeHistory: EmployeeHistoryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/employee-history-update').then(m => m.EmployeeHistoryUpdate),
    resolve: {
      employeeHistory: EmployeeHistoryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/employee-history-update').then(m => m.EmployeeHistoryUpdate),
    resolve: {
      employeeHistory: EmployeeHistoryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default employeeHistoryRoute;
