import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import TaxBracketResolve from './route/tax-bracket-routing-resolve.service';

const taxBracketRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/tax-bracket.component').then(m => m.TaxBracketComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/tax-bracket-detail.component').then(m => m.TaxBracketDetailComponent),
    resolve: {
      taxBracket: TaxBracketResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/tax-bracket-update.component').then(m => m.TaxBracketUpdateComponent),
    resolve: {
      taxBracket: TaxBracketResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/tax-bracket-update.component').then(m => m.TaxBracketUpdateComponent),
    resolve: {
      taxBracket: TaxBracketResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default taxBracketRoute;
