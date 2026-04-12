import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import PublicHolidayResolve from './route/public-holiday-routing-resolve.service';

const publicHolidayRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/public-holiday').then(m => m.PublicHoliday),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/public-holiday-detail').then(m => m.PublicHolidayDetail),
    resolve: {
      publicHoliday: PublicHolidayResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/public-holiday-update').then(m => m.PublicHolidayUpdate),
    resolve: {
      publicHoliday: PublicHolidayResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/public-holiday-update').then(m => m.PublicHolidayUpdate),
    resolve: {
      publicHoliday: PublicHolidayResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default publicHolidayRoute;
