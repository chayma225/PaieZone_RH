import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import BonusResolve from './route/bonus-routing-resolve.service';

const bonusRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/bonus').then(m => m.Bonus),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/bonus-detail').then(m => m.BonusDetail),
    resolve: {
      bonus: BonusResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/bonus-update').then(m => m.BonusUpdate),
    resolve: {
      bonus: BonusResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/bonus-update').then(m => m.BonusUpdate),
    resolve: {
      bonus: BonusResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default bonusRoute;
