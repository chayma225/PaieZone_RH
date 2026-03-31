import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import OfficialDocumentResolve from './route/official-document-routing-resolve.service';

const officialDocumentRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/official-document.component').then(m => m.OfficialDocumentComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/official-document-detail.component').then(m => m.OfficialDocumentDetailComponent),
    resolve: {
      officialDocument: OfficialDocumentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/official-document-update.component').then(m => m.OfficialDocumentUpdateComponent),
    resolve: {
      officialDocument: OfficialDocumentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/official-document-update.component').then(m => m.OfficialDocumentUpdateComponent),
    resolve: {
      officialDocument: OfficialDocumentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default officialDocumentRoute;
