import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import RegulatoryParamResolve from './route/regulatory-param-routing-resolve.service';

const regulatoryParamRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/regulatory-param.component').then(m => m.RegulatoryParamComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/regulatory-param-detail.component').then(m => m.RegulatoryParamDetailComponent),
    resolve: {
      regulatoryParam: RegulatoryParamResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/regulatory-param-update.component').then(m => m.RegulatoryParamUpdateComponent),
    resolve: {
      regulatoryParam: RegulatoryParamResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/regulatory-param-update.component').then(m => m.RegulatoryParamUpdateComponent),
    resolve: {
      regulatoryParam: RegulatoryParamResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default regulatoryParamRoute;
