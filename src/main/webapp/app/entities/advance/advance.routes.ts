// src/main/webapp/app/entities/advance/advance.routes.ts
import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { IAdvance } from './advance.model';
import { AdvanceService } from './service/advance.service';

const resolveAdvance = (route: ActivatedRouteSnapshot): Observable<null | IAdvance> => {
  const id = route.params['id'];
  if (id) return inject(AdvanceService).find(id).pipe(
    mergeMap(r => { if (r.body) return of(r.body); inject(Router).navigate(['404']); return EMPTY; })
  );
  return of(null);
};

const routes: Routes = [
  { path: '', loadComponent: () => import('./list/advance').then(m => m.Advance) },
  { path: 'new', loadComponent: () => import('./update/advance-update').then(m => m.AdvanceUpdate), resolve: { advance: resolveAdvance } },
  { path: ':id/edit', loadComponent: () => import('./update/advance-update').then(m => m.AdvanceUpdate), resolve: { advance: resolveAdvance } },
];
export default routes;
