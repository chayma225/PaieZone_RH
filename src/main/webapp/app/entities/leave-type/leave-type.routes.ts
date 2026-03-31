import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import LeaveTypeResolve from './route/leave-type-routing-resolve.service';

const leaveTypeRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/leave-type.component').then(m => m.LeaveTypeComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/leave-type-detail.component').then(m => m.LeaveTypeDetailComponent),
    resolve: {
      leaveType: LeaveTypeResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/leave-type-update.component').then(m => m.LeaveTypeUpdateComponent),
    resolve: {
      leaveType: LeaveTypeResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/leave-type-update.component').then(m => m.LeaveTypeUpdateComponent),
    resolve: {
      leaveType: LeaveTypeResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default leaveTypeRoute;
