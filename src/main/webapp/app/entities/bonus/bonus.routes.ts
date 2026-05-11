// src/main/webapp/app/entities/bonus/bonus.routes.ts
import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { IBonus } from './bonus.model';
import { BonusService } from './service/bonus.service';

const resolveBonus = (route: ActivatedRouteSnapshot): Observable<null | IBonus> => {
  const id = route.params['id'];
  if (id) return inject(BonusService).find(id).pipe(
    mergeMap(r => { if (r.body) return of(r.body); inject(Router).navigate(['404']); return EMPTY; })
  );
  return of(null);
};

const routes: Routes = [
  { path: '', loadComponent: () => import('./list/bonus').then(m => m.Bonus) },
  { path: 'new', loadComponent: () => import('./update/bonus-update').then(m => m.BonusUpdate), resolve: { bonus: resolveBonus } },
  { path: ':id/edit', loadComponent: () => import('./update/bonus-update').then(m => m.BonusUpdate), resolve: { bonus: resolveBonus } },
];
export default routes;
