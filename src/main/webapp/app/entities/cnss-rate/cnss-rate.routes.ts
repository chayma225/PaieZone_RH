import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import CnssRateResolve from './route/cnss-rate-routing-resolve.service';

const cnssRateRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/cnss-rate.component').then(m => m.CnssRateComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/cnss-rate-detail.component').then(m => m.CnssRateDetailComponent),
    resolve: {
      cnssRate: CnssRateResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/cnss-rate-update.component').then(m => m.CnssRateUpdateComponent),
    resolve: {
      cnssRate: CnssRateResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/cnss-rate-update.component').then(m => m.CnssRateUpdateComponent),
    resolve: {
      cnssRate: CnssRateResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default cnssRateRoute;
