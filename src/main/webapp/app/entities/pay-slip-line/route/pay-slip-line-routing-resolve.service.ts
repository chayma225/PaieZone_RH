import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IPaySlipLine } from '../pay-slip-line.model';
import { PaySlipLineService } from '../service/pay-slip-line.service';

const paySlipLineResolve = (route: ActivatedRouteSnapshot): Observable<null | IPaySlipLine> => {
  const id = route.params.id;
  if (id) {
    return inject(PaySlipLineService)
      .find(id)
      .pipe(
        mergeMap((paySlipLine: HttpResponse<IPaySlipLine>) => {
          if (paySlipLine.body) {
            return of(paySlipLine.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default paySlipLineResolve;
