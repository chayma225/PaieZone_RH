// src/main/webapp/app/entities/pay-slip/pay-slip.routes.ts
import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { IPaySlip } from './pay-slip.model';
import { PaySlipService } from './service/pay-slip.service';

const resolvePaySlip = (route: ActivatedRouteSnapshot): Observable<null | IPaySlip> => {
  const id = route.params['id'];
  if (id) {
    return inject(PaySlipService).find(id).pipe(
      mergeMap((r: HttpResponse<IPaySlip>) => {
        if (r.body) return of(r.body);
        inject(Router).navigate(['404']); return EMPTY;
      }),
    );
  }
  return of(null);
};

const routes: Routes = [
  { path: '', loadComponent: () => import('./list/pay-slip').then(m => m.PaySlip) },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/pay-slip-detail').then(m => m.PaySlipDetail),
    resolve: { paySlip: resolvePaySlip },
  },
];
export default routes;
