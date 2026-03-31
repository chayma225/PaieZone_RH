import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import JobPositionResolve from './route/job-position-routing-resolve.service';

const jobPositionRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/job-position.component').then(m => m.JobPositionComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/job-position-detail.component').then(m => m.JobPositionDetailComponent),
    resolve: {
      jobPosition: JobPositionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/job-position-update.component').then(m => m.JobPositionUpdateComponent),
    resolve: {
      jobPosition: JobPositionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/job-position-update.component').then(m => m.JobPositionUpdateComponent),
    resolve: {
      jobPosition: JobPositionResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default jobPositionRoute;
