import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import TimeEntryResolve from './route/time-entry-routing-resolve.service';

const timeEntryRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/time-entry').then(m => m.TimeEntry),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/time-entry-detail').then(m => m.TimeEntryDetail),
    resolve: {
      timeEntry: TimeEntryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/time-entry-update').then(m => m.TimeEntryUpdate),
    resolve: {
      timeEntry: TimeEntryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/time-entry-update').then(m => m.TimeEntryUpdate),
    resolve: {
      timeEntry: TimeEntryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default timeEntryRoute;
