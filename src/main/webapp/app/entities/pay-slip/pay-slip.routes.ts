import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import PaySlipResolve from './route/pay-slip-routing-resolve.service';

const paySlipRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/pay-slip.component').then(m => m.PaySlipComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/pay-slip-detail.component').then(m => m.PaySlipDetailComponent),
    resolve: {
      paySlip: PaySlipResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/pay-slip-update.component').then(m => m.PaySlipUpdateComponent),
    resolve: {
      paySlip: PaySlipResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/pay-slip-update.component').then(m => m.PaySlipUpdateComponent),
    resolve: {
      paySlip: PaySlipResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default paySlipRoute;
