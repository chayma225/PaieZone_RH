import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import JobPositionResolve from './route/job-position-routing-resolve.service';

const jobPositionRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/job-position').then(m => m.JobPosition),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/job-position-detail').then(m => m.JobPositionDetail),
    resolve: {
      jobPosition: JobPositionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/job-position-update').then(m => m.JobPositionUpdate),
    resolve: {
      jobPosition: JobPositionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/job-position-update').then(m => m.JobPositionUpdate),
    resolve: {
      jobPosition: JobPositionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default jobPositionRoute;
