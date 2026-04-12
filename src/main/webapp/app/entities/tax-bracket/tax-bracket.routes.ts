import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import TaxBracketResolve from './route/tax-bracket-routing-resolve.service';

const taxBracketRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/tax-bracket').then(m => m.TaxBracket),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/tax-bracket-detail').then(m => m.TaxBracketDetail),
    resolve: {
      taxBracket: TaxBracketResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/tax-bracket-update').then(m => m.TaxBracketUpdate),
    resolve: {
      taxBracket: TaxBracketResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/tax-bracket-update').then(m => m.TaxBracketUpdate),
    resolve: {
      taxBracket: TaxBracketResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default taxBracketRoute;
