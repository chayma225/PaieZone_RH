import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import HrDocumentResolve from './route/hr-document-routing-resolve.service';

const hrDocumentRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/hr-document.component').then(m => m.HrDocumentComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/hr-document-detail.component').then(m => m.HrDocumentDetailComponent),
    resolve: {
      hrDocument: HrDocumentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/hr-document-update.component').then(m => m.HrDocumentUpdateComponent),
    resolve: {
      hrDocument: HrDocumentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/hr-document-update.component').then(m => m.HrDocumentUpdateComponent),
    resolve: {
      hrDocument: HrDocumentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default hrDocumentRoute;
