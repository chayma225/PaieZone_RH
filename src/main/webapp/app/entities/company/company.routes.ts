import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import CompanyResolve from './route/company-routing-resolve.service';

const companyRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/company.component').then(m => m.CompanyComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/company-detail.component').then(m => m.CompanyDetailComponent),
    resolve: {
      company: CompanyResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/company-update.component').then(m => m.CompanyUpdateComponent),
    resolve: {
      company: CompanyResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/company-update.component').then(m => m.CompanyUpdateComponent),
    resolve: {
      company: CompanyResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default companyRoute;
