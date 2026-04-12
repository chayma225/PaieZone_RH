import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import AccountingEntryResolve from './route/accounting-entry-routing-resolve.service';

const accountingEntryRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/accounting-entry').then(m => m.AccountingEntry),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/accounting-entry-detail').then(m => m.AccountingEntryDetail),
    resolve: {
      accountingEntry: AccountingEntryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/accounting-entry-update').then(m => m.AccountingEntryUpdate),
    resolve: {
      accountingEntry: AccountingEntryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/accounting-entry-update').then(m => m.AccountingEntryUpdate),
    resolve: {
      accountingEntry: AccountingEntryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default accountingEntryRoute;
