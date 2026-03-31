import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import BonusResolve from './route/bonus-routing-resolve.service';

const bonusRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/bonus.component').then(m => m.BonusComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/bonus-detail.component').then(m => m.BonusDetailComponent),
    resolve: {
      bonus: BonusResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/bonus-update.component').then(m => m.BonusUpdateComponent),
    resolve: {
      bonus: BonusResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/bonus-update.component').then(m => m.BonusUpdateComponent),
    resolve: {
      bonus: BonusResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default bonusRoute;
