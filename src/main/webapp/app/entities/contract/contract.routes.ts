import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import ContractResolve from './route/contract-routing-resolve.service';

const contractRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/contract.component').then(m => m.ContractComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/contract-detail.component').then(m => m.ContractDetailComponent),
    resolve: {
      contract: ContractResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/contract-update.component').then(m => m.ContractUpdateComponent),
    resolve: {
      contract: ContractResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/contract-update.component').then(m => m.ContractUpdateComponent),
    resolve: {
      contract: ContractResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default contractRoute;
