import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import PaySlipResolve from './route/pay-slip-routing-resolve.service';

const paySlipRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/pay-slip').then(m => m.PaySlip),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/pay-slip-detail').then(m => m.PaySlipDetail),
    resolve: {
      paySlip: PaySlipResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/pay-slip-update').then(m => m.PaySlipUpdate),
    resolve: {
      paySlip: PaySlipResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/pay-slip-update').then(m => m.PaySlipUpdate),
    resolve: {
      paySlip: PaySlipResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default paySlipRoute;
