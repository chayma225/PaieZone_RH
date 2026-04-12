import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import AccountPlanResolve from './route/account-plan-routing-resolve.service';

const accountPlanRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/account-plan').then(m => m.AccountPlan),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/account-plan-detail').then(m => m.AccountPlanDetail),
    resolve: {
      accountPlan: AccountPlanResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/account-plan-update').then(m => m.AccountPlanUpdate),
    resolve: {
      accountPlan: AccountPlanResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/account-plan-update').then(m => m.AccountPlanUpdate),
    resolve: {
      accountPlan: AccountPlanResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default accountPlanRoute;
