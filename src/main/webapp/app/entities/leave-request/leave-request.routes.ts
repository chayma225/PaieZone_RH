import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import LeaveRequestResolve from './route/leave-request-routing-resolve.service';

const leaveRequestRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/leave-request').then(m => m.LeaveRequest),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/leave-request-detail').then(m => m.LeaveRequestDetail),
    resolve: {
      leaveRequest: LeaveRequestResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/leave-request-update').then(m => m.LeaveRequestUpdate),
    resolve: {
      leaveRequest: LeaveRequestResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/leave-request-update').then(m => m.LeaveRequestUpdate),
    resolve: {
      leaveRequest: LeaveRequestResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default leaveRequestRoute;
