import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import CompanySubscriptionResolve from './route/company-subscription-routing-resolve.service';

const companySubscriptionRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/company-subscription.component').then(m => m.CompanySubscriptionComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/company-subscription-detail.component').then(m => m.CompanySubscriptionDetailComponent),
    resolve: {
      companySubscription: CompanySubscriptionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/company-subscription-update.component').then(m => m.CompanySubscriptionUpdateComponent),
    resolve: {
      companySubscription: CompanySubscriptionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/company-subscription-update.component').then(m => m.CompanySubscriptionUpdateComponent),
    resolve: {
      companySubscription: CompanySubscriptionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default companySubscriptionRoute;
