import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import OfficialDocumentResolve from './route/official-document-routing-resolve.service';

const officialDocumentRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/official-document').then(m => m.OfficialDocument),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/official-document-detail').then(m => m.OfficialDocumentDetail),
    resolve: {
      officialDocument: OfficialDocumentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/official-document-update').then(m => m.OfficialDocumentUpdate),
    resolve: {
      officialDocument: OfficialDocumentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/official-document-update').then(m => m.OfficialDocumentUpdate),
    resolve: {
      officialDocument: OfficialDocumentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default officialDocumentRoute;
