import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import AdvanceResolve from './route/advance-routing-resolve.service';

const advanceRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/advance').then(m => m.Advance),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/advance-detail').then(m => m.AdvanceDetail),
    resolve: {
      advance: AdvanceResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/advance-update').then(m => m.AdvanceUpdate),
    resolve: {
      advance: AdvanceResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/advance-update').then(m => m.AdvanceUpdate),
    resolve: {
      advance: AdvanceResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default advanceRoute;
