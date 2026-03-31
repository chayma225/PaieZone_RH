import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import LeaveRequestResolve from './route/leave-request-routing-resolve.service';

const leaveRequestRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/leave-request.component').then(m => m.LeaveRequestComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/leave-request-detail.component').then(m => m.LeaveRequestDetailComponent),
    resolve: {
      leaveRequest: LeaveRequestResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/leave-request-update.component').then(m => m.LeaveRequestUpdateComponent),
    resolve: {
      leaveRequest: LeaveRequestResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/leave-request-update.component').then(m => m.LeaveRequestUpdateComponent),
    resolve: {
      leaveRequest: LeaveRequestResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default leaveRequestRoute;
