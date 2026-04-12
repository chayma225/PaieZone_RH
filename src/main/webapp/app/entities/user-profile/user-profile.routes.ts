import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import UserProfileResolve from './route/user-profile-routing-resolve.service';

const userProfileRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/user-profile').then(m => m.UserProfile),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/user-profile-detail').then(m => m.UserProfileDetail),
    resolve: {
      userProfile: UserProfileResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/user-profile-update').then(m => m.UserProfileUpdate),
    resolve: {
      userProfile: UserProfileResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/user-profile-update').then(m => m.UserProfileUpdate),
    resolve: {
      userProfile: UserProfileResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default userProfileRoute;
