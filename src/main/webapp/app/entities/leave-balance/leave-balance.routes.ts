import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import LeaveBalanceResolve from './route/leave-balance-routing-resolve.service';

const leaveBalanceRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/leave-balance').then(m => m.LeaveBalance),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/leave-balance-detail').then(m => m.LeaveBalanceDetail),
    resolve: {
      leaveBalance: LeaveBalanceResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/leave-balance-update').then(m => m.LeaveBalanceUpdate),
    resolve: {
      leaveBalance: LeaveBalanceResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/leave-balance-update').then(m => m.LeaveBalanceUpdate),
    resolve: {
      leaveBalance: LeaveBalanceResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default leaveBalanceRoute;
