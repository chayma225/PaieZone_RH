import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import CompanySubscriptionResolve from './route/company-subscription-routing-resolve.service';

const companySubscriptionRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/company-subscription').then(m => m.CompanySubscription),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/company-subscription-detail').then(m => m.CompanySubscriptionDetail),
    resolve: {
      companySubscription: CompanySubscriptionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/company-subscription-update').then(m => m.CompanySubscriptionUpdate),
    resolve: {
      companySubscription: CompanySubscriptionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/company-subscription-update').then(m => m.CompanySubscriptionUpdate),
    resolve: {
      companySubscription: CompanySubscriptionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default companySubscriptionRoute;
