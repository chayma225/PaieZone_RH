import { Routes } from '@angular/router';

// ✅ Import par défaut (correct)
import regulatoryParamResolve from './route/regulatory-param-routing-resolve.service';

const regulatoryParamRoute: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/regulatory-param').then(m => m.RegulatoryParam),
    data: { defaultSort: 'paramKey,asc' },
  },
  {
    path: ':id/view',
    loadComponent: () =>
      import('./detail/regulatory-param-detail').then(m => m.RegulatoryParamDetail),
    resolve: { regulatoryParam: regulatoryParamResolve },   // ← OK
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./update/regulatory-param-update').then(m => m.RegulatoryParamUpdate),
    resolve: { regulatoryParam: regulatoryParamResolve },
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./update/regulatory-param-update').then(m => m.RegulatoryParamUpdate),
    resolve: { regulatoryParam: regulatoryParamResolve },
  },
];

export default regulatoryParamRoute;
