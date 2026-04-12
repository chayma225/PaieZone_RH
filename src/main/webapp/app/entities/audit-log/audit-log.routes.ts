import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import AuditLogResolve from './route/audit-log-routing-resolve.service';

const auditLogRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/audit-log').then(m => m.AuditLog),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/audit-log-detail').then(m => m.AuditLogDetail),
    resolve: {
      auditLog: AuditLogResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/audit-log-update').then(m => m.AuditLogUpdate),
    resolve: {
      auditLog: AuditLogResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/audit-log-update').then(m => m.AuditLogUpdate),
    resolve: {
      auditLog: AuditLogResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default auditLogRoute;
