import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import ChatSessionResolve from './route/chat-session-routing-resolve.service';

const chatSessionRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/chat-session.component').then(m => m.ChatSessionComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/chat-session-detail.component').then(m => m.ChatSessionDetailComponent),
    resolve: {
      chatSession: ChatSessionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/chat-session-update.component').then(m => m.ChatSessionUpdateComponent),
    resolve: {
      chatSession: ChatSessionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/chat-session-update.component').then(m => m.ChatSessionUpdateComponent),
    resolve: {
      chatSession: ChatSessionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default chatSessionRoute;
