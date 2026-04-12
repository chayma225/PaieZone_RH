import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import ContractResolve from './route/contract-routing-resolve.service';

const contractRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/contract').then(m => m.Contract),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/contract-detail').then(m => m.ContractDetail),
    resolve: {
      contract: ContractResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/contract-update').then(m => m.ContractUpdate),
    resolve: {
      contract: ContractResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/contract-update').then(m => m.ContractUpdate),
    resolve: {
      contract: ContractResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default contractRoute;
