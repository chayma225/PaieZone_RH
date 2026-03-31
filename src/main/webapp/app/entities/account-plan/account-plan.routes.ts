import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import AccountPlanResolve from './route/account-plan-routing-resolve.service';

const accountPlanRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/account-plan.component').then(m => m.AccountPlanComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/account-plan-detail.component').then(m => m.AccountPlanDetailComponent),
    resolve: {
      accountPlan: AccountPlanResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/account-plan-update.component').then(m => m.AccountPlanUpdateComponent),
    resolve: {
      accountPlan: AccountPlanResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/account-plan-update.component').then(m => m.AccountPlanUpdateComponent),
    resolve: {
      accountPlan: AccountPlanResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default accountPlanRoute;
