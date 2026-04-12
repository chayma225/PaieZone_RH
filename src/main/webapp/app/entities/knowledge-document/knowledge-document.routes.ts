import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import KnowledgeDocumentResolve from './route/knowledge-document-routing-resolve.service';

const knowledgeDocumentRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/knowledge-document').then(m => m.KnowledgeDocument),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/knowledge-document-detail').then(m => m.KnowledgeDocumentDetail),
    resolve: {
      knowledgeDocument: KnowledgeDocumentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/knowledge-document-update').then(m => m.KnowledgeDocumentUpdate),
    resolve: {
      knowledgeDocument: KnowledgeDocumentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/knowledge-document-update').then(m => m.KnowledgeDocumentUpdate),
    resolve: {
      knowledgeDocument: KnowledgeDocumentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default knowledgeDocumentRoute;
