import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import RubriqueResolve from './route/rubrique-routing-resolve.service';

const rubriqueRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/rubrique.component').then(m => m.RubriqueComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/rubrique-detail.component').then(m => m.RubriqueDetailComponent),
    resolve: {
      rubrique: RubriqueResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/rubrique-update.component').then(m => m.RubriqueUpdateComponent),
    resolve: {
      rubrique: RubriqueResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/rubrique-update.component').then(m => m.RubriqueUpdateComponent),
    resolve: {
      rubrique: RubriqueResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default rubriqueRoute;
