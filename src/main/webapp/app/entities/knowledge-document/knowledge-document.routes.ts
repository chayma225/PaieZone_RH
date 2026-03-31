import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import KnowledgeDocumentResolve from './route/knowledge-document-routing-resolve.service';

const knowledgeDocumentRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/knowledge-document.component').then(m => m.KnowledgeDocumentComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/knowledge-document-detail.component').then(m => m.KnowledgeDocumentDetailComponent),
    resolve: {
      knowledgeDocument: KnowledgeDocumentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/knowledge-document-update.component').then(m => m.KnowledgeDocumentUpdateComponent),
    resolve: {
      knowledgeDocument: KnowledgeDocumentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/knowledge-document-update.component').then(m => m.KnowledgeDocumentUpdateComponent),
    resolve: {
      knowledgeDocument: KnowledgeDocumentResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default knowledgeDocumentRoute;
