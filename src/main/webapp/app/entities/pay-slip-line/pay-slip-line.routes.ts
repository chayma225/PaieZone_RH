import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import PaySlipLineResolve from './route/pay-slip-line-routing-resolve.service';

const paySlipLineRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/pay-slip-line').then(m => m.PaySlipLine),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/pay-slip-line-detail').then(m => m.PaySlipLineDetail),
    resolve: {
      paySlipLine: PaySlipLineResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/pay-slip-line-update').then(m => m.PaySlipLineUpdate),
    resolve: {
      paySlipLine: PaySlipLineResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/pay-slip-line-update').then(m => m.PaySlipLineUpdate),
    resolve: {
      paySlipLine: PaySlipLineResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default paySlipLineRoute;
