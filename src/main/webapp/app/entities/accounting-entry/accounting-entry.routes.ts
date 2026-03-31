import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import AccountingEntryResolve from './route/accounting-entry-routing-resolve.service';

const accountingEntryRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/accounting-entry.component').then(m => m.AccountingEntryComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/accounting-entry-detail.component').then(m => m.AccountingEntryDetailComponent),
    resolve: {
      accountingEntry: AccountingEntryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/accounting-entry-update.component').then(m => m.AccountingEntryUpdateComponent),
    resolve: {
      accountingEntry: AccountingEntryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/accounting-entry-update.component').then(m => m.AccountingEntryUpdateComponent),
    resolve: {
      accountingEntry: AccountingEntryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default accountingEntryRoute;
