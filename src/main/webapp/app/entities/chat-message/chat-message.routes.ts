import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import ChatMessageResolve from './route/chat-message-routing-resolve.service';

const chatMessageRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/chat-message').then(m => m.ChatMessage),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/chat-message-detail').then(m => m.ChatMessageDetail),
    resolve: {
      chatMessage: ChatMessageResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/chat-message-update').then(m => m.ChatMessageUpdate),
    resolve: {
      chatMessage: ChatMessageResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/chat-message-update').then(m => m.ChatMessageUpdate),
    resolve: {
      chatMessage: ChatMessageResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default chatMessageRoute;
