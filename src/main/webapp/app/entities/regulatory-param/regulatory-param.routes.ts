import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import RegulatoryParamResolve from './route/regulatory-param-routing-resolve.service';

const regulatoryParamRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/regulatory-param').then(m => m.RegulatoryParam),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/regulatory-param-detail').then(m => m.RegulatoryParamDetail),
    resolve: {
      regulatoryParam: RegulatoryParamResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/regulatory-param-update').then(m => m.RegulatoryParamUpdate),
    resolve: {
      regulatoryParam: RegulatoryParamResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/regulatory-param-update').then(m => m.RegulatoryParamUpdate),
    resolve: {
      regulatoryParam: RegulatoryParamResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default regulatoryParamRoute;
