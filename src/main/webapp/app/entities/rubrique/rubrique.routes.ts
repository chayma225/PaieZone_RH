import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import RubriqueResolve from './route/rubrique-routing-resolve.service';

const rubriqueRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/rubrique').then(m => m.Rubrique),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/rubrique-detail').then(m => m.RubriqueDetail),
    resolve: {
      rubrique: RubriqueResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/rubrique-update').then(m => m.RubriqueUpdate),
    resolve: {
      rubrique: RubriqueResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/rubrique-update').then(m => m.RubriqueUpdate),
    resolve: {
      rubrique: RubriqueResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default rubriqueRoute;
