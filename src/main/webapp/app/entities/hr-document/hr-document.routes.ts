import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import HrDocumentResolve from './route/hr-document-routing-resolve.service';

const hrDocumentRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/hr-document').then(m => m.HrDocument),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/hr-document-detail').then(m => m.HrDocumentDetail),
    resolve: {
      hrDocument: HrDocumentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/hr-document-update').then(m => m.HrDocumentUpdate),
    resolve: {
      hrDocument: HrDocumentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/hr-document-update').then(m => m.HrDocumentUpdate),
    resolve: {
      hrDocument: HrDocumentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default hrDocumentRoute;
