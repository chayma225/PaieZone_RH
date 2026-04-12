import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import CnssRateResolve from './route/cnss-rate-routing-resolve.service';

const cnssRateRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/cnss-rate').then(m => m.CnssRate),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/cnss-rate-detail').then(m => m.CnssRateDetail),
    resolve: {
      cnssRate: CnssRateResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/cnss-rate-update').then(m => m.CnssRateUpdate),
    resolve: {
      cnssRate: CnssRateResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/cnss-rate-update').then(m => m.CnssRateUpdate),
    resolve: {
      cnssRate: CnssRateResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default cnssRateRoute;
