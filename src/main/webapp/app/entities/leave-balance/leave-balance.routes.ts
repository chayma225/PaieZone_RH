import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import LeaveBalanceResolve from './route/leave-balance-routing-resolve.service';

const leaveBalanceRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/leave-balance.component').then(m => m.LeaveBalanceComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/leave-balance-detail.component').then(m => m.LeaveBalanceDetailComponent),
    resolve: {
      leaveBalance: LeaveBalanceResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/leave-balance-update.component').then(m => m.LeaveBalanceUpdateComponent),
    resolve: {
      leaveBalance: LeaveBalanceResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/leave-balance-update.component').then(m => m.LeaveBalanceUpdateComponent),
    resolve: {
      leaveBalance: LeaveBalanceResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default leaveBalanceRoute;
